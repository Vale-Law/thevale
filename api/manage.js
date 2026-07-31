// GET  /api/manage?token=...            — read-only lookup, safe for email
//                                          link-preview crawlers to prefetch
// POST /api/manage {token, slotStart?, slotEnd?} — performs the action
//
// Purpose (confirm / reschedule / cancel) lives on the token row itself, so
// a single /manage/:token page can render the right UI without the URL
// needing to say what it's for.
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { hashToken, generateToken } from './_lib/tokens.js';
import { computeAvailableSlots } from '../src/lib/availability.js';
import { sendEmail, manageLinks } from './_lib/mailer.js';
import { bookingEmailText, bookingEmailHtml } from '../emails/booking.js';
import { refundConsultationPayment } from './_lib/stripeConnect.js';
import { isStripeConfigured } from './_lib/stripeClient.js';

// Item 4b: refund a paid consultation fee when a booking is canceled. Only
// acts if a charge actually went through (status 'charged' with a payment
// intent) -- a booking that was never paid (attorney not yet Connect-
// onboarded) has nothing to refund. Failure here is logged but never
// blocks the cancellation itself from going through.
async function refundIfCharged(admin, booking) {
  if (!isStripeConfigured()) return;
  const { data: charge } = await admin
    .from('consultation_charges')
    .select('*')
    .eq('booking_id', booking.id)
    .maybeSingle();
  if (!charge || charge.status !== 'charged' || !charge.stripe_payment_intent_id) return;

  const { data: attorney } = await admin.from('attorneys').select('firm_id').eq('id', booking.attorney_id).maybeSingle();
  if (!attorney?.firm_id) return;
  const { data: paymentAccount } = await admin
    .from('firm_payment_accounts')
    .select('stripe_account_id')
    .eq('firm_id', attorney.firm_id)
    .maybeSingle();
  if (!paymentAccount?.stripe_account_id) return;

  try {
    await refundConsultationPayment({
      connectedAccountId: paymentAccount.stripe_account_id,
      paymentIntentId: charge.stripe_payment_intent_id,
    });
    await admin.from('consultation_charges').update({ status: 'reversed', refunded_at: new Date().toISOString() }).eq('id', charge.id);
  } catch (e) {
    await admin.from('consultation_charges').update({ dispute_reason: `Refund failed: ${e.message}` }).eq('id', charge.id);
  }
}

async function lookupToken(admin, rawToken) {
  const { data: tok } = await admin
    .from('booking_action_tokens')
    .select('*')
    .eq('token_hash', hashToken(rawToken))
    .maybeSingle();
  if (!tok || tok.consumed_at || new Date(tok.expires_at) < new Date()) return null;
  return tok;
}

async function availableSlotsFor(admin, attorneyId, excludeBookingId) {
  const { data: rules } = await admin.from('attorney_availability_rules').select('*').eq('attorney_id', attorneyId).maybeSingle();
  if (!rules) return [];
  let query = admin
    .from('bookings')
    .select('slot_start, slot_end')
    .eq('attorney_id', attorneyId)
    .in('status', ['pending', 'confirmed'])
    .not('slot_start', 'is', null);
  if (excludeBookingId) query = query.neq('id', excludeBookingId);
  const { data: existing } = await query;
  return computeAvailableSlots({
    workingHours: rules.working_hours,
    bufferMinutes: rules.buffer_minutes,
    minNoticeHours: rules.min_notice_hours,
    dailyCap: rules.daily_cap,
    timezone: rules.timezone,
    existingRanges: (existing || []).map((b) => ({ start: b.slot_start, end: b.slot_end })),
  });
}

export default async function handler(req, res) {
  const admin = supabaseAdmin();
  if (!admin) {
    res.status(503).json({ error: 'Booking is not configured yet (SUPABASE_SERVICE_ROLE_KEY unset).' });
    return;
  }

  if (req.method === 'GET') {
    const token = typeof req.query.token === 'string' ? req.query.token : '';
    if (!token) { res.status(400).json({ error: 'Missing token' }); return; }

    const tok = await lookupToken(admin, token);
    if (!tok) { res.status(404).json({ valid: false }); return; }

    const { data: booking } = await admin
      .from('bookings')
      .select('id, attorney_id, attorney_name, client_name, slot_start, slot_end, status')
      .eq('id', tok.booking_id)
      .maybeSingle();
    if (!booking) { res.status(404).json({ valid: false }); return; }

    const slots = tok.purpose === 'reschedule' ? await availableSlotsFor(admin, booking.attorney_id, booking.id) : [];
    res.status(200).json({ valid: true, purpose: tok.purpose, booking, slots });
    return;
  }

  if (req.method === 'POST') {
    const { token, slotStart, slotEnd } = req.body || {};
    if (!token) { res.status(400).json({ error: 'Missing token' }); return; }

    const tok = await lookupToken(admin, token);
    if (!tok) { res.status(410).json({ error: 'This link has expired or was already used.' }); return; }

    const { data: booking } = await admin.from('bookings').select('*').eq('id', tok.booking_id).maybeSingle();
    if (!booking) { res.status(404).json({ error: 'Booking not found' }); return; }

    if (tok.purpose === 'confirm') {
      await admin.from('bookings').update({
        status: 'confirmed', confirmed_at: new Date().toISOString(), confirmed_by: 'client',
      }).eq('id', booking.id);
    } else if (tok.purpose === 'cancel') {
      await admin.from('bookings').update({
        status: 'declined', issue_description: null, case_summary: null, description_purged: true,
      }).eq('id', booking.id);
      await admin.from('email_schedule').update({ cancelled_at: new Date().toISOString() })
        .eq('booking_id', booking.id).is('sent_at', null);
    } else if (tok.purpose === 'reschedule') {
      if (!slotStart || !slotEnd) { res.status(400).json({ error: 'Pick a new time' }); return; }

      const { data: clashes } = await admin
        .from('bookings').select('id')
        .eq('attorney_id', booking.attorney_id)
        .in('status', ['pending', 'confirmed'])
        .neq('id', booking.id)
        .lt('slot_start', slotEnd).gt('slot_end', slotStart);
      if (clashes && clashes.length) { res.status(409).json({ error: 'That time was just taken.' }); return; }

      const { error: updErr } = await admin.from('bookings')
        .update({ slot: slotStart, slot_start: slotStart, slot_end: slotEnd })
        .eq('id', booking.id);
      if (updErr) {
        const conflict = updErr.code === '23P01';
        res.status(conflict ? 409 : 500).json({ error: conflict ? 'That time was just taken.' : updErr.message });
        return;
      }

      // Retire every other live token for this booking and mint a fresh
      // set against the new time, so stale email links stop working.
      await admin.from('booking_action_tokens')
        .update({ consumed_at: new Date().toISOString() })
        .eq('booking_id', booking.id).is('consumed_at', null);

      const fresh = {};
      for (const purpose of ['confirm', 'reschedule', 'cancel']) {
        const raw = generateToken();
        fresh[purpose] = raw;
        await admin.from('booking_action_tokens').insert({
          token_hash: hashToken(raw), booking_id: booking.id, purpose, expires_at: slotEnd,
        });
      }

      const { data: attorney } = await admin.from('attorneys').select('name, email').eq('id', booking.attorney_id).maybeSingle();
      const origin = req.headers.origin || `https://${req.headers.host || ''}`;
      const links = manageLinks(origin, fresh);
      const when = new Date(slotStart).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });
      await sendEmail(
        booking.client_email,
        'Your consultation was rescheduled',
        bookingEmailText({ clientName: booking.client_name, attorneyName: attorney?.name || booking.attorney_name, when, links }),
        bookingEmailHtml({ clientName: booking.client_name, attorneyName: attorney?.name || booking.attorney_name, when, links }),
      );

      res.status(200).json({ ok: true, manage: links });
      return;
    }

    await admin.from('booking_action_tokens').update({ consumed_at: new Date().toISOString() }).eq('token_hash', hashToken(token));
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
