// GET /api/send-reminders — invoked hourly by Vercel Cron (see vercel.json).
// Vercel only runs crons against Production deployments, never Preview, so
// this is inert until the app is actually deployed to production.
//
// Confirm tokens are never persisted in the clear (only their hash), so a
// reminder can't resend the original confirm link — it retires whatever
// tokens are still live for the booking and mints a fresh set, which also
// tightens the validity window as the appointment approaches.
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { generateToken, hashToken } from './_lib/tokens.js';
import { sendEmail, manageLinks, bookingEmailBody } from './_lib/mailer.js';

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const admin = supabaseAdmin();
  if (!admin) {
    res.status(503).json({ error: 'Not configured' });
    return;
  }

  const now = new Date().toISOString();
  const { data: due, error } = await admin
    .from('email_schedule')
    .select('id, booking_id, kind')
    .is('sent_at', null)
    .is('cancelled_at', null)
    .lte('send_at', now)
    .limit(50);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  let sent = 0;
  let skipped = 0;

  for (const row of due || []) {
    const { data: booking } = await admin.from('bookings').select('*').eq('id', row.booking_id).maybeSingle();
    if (!booking || !['pending', 'confirmed'].includes(booking.status)) {
      await admin.from('email_schedule').update({ cancelled_at: new Date().toISOString() }).eq('id', row.id);
      skipped++;
      continue;
    }

    if (row.kind === 'reminder') {
      await admin.from('booking_action_tokens')
        .update({ consumed_at: new Date().toISOString() })
        .eq('booking_id', booking.id).is('consumed_at', null);

      const fresh = {};
      for (const purpose of ['confirm', 'reschedule', 'cancel']) {
        const raw = generateToken();
        fresh[purpose] = raw;
        await admin.from('booking_action_tokens').insert({
          token_hash: hashToken(raw), booking_id: booking.id, purpose, expires_at: booking.slot_end || booking.slot,
        });
      }

      const { data: attorney } = await admin.from('attorneys').select('name').eq('id', booking.attorney_id).maybeSingle();
      const origin = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '';
      const links = manageLinks(origin, fresh);
      const when = new Date(booking.slot_start || booking.slot).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });

      const ok = await sendEmail(
        booking.client_email,
        'Reminder: your consultation is coming up',
        bookingEmailBody({ clientName: booking.client_name, attorneyName: attorney?.name || booking.attorney_name, when, links, reminder: true }),
      );
      if (ok) {
        await admin.from('email_schedule').update({ sent_at: new Date().toISOString() }).eq('id', row.id);
        sent++;
      }
    } else {
      // Confirmation rows are normally marked sent at booking-creation time
      // by api/bookings-public.js; anything still open here is a retry.
      skipped++;
    }
  }

  res.status(200).json({ sent, skipped, checked: (due || []).length });
}
