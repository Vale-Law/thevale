// POST /api/bookings-public
// Creates a booking from the public /book/:slug page. Runs server-side with
// the service role because these are unauthenticated visitors (client_id is
// legitimately null) and the browser's anon key has no insert path for that
// — see the Shared Contract note in bookings_insert_client's RLS.
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { generateToken, hashToken } from './_lib/tokens.js';
import { sendEmail, manageLinks } from './_lib/mailer.js';
import { bookingEmailText, bookingEmailHtml } from '../emails/booking.js';
import { attorneyNotificationText, attorneyNotificationHtml } from '../emails/attorney-notification.js';
import { createConsultationCheckout } from './_lib/stripeConnect.js';
import { isStripeConfigured } from './_lib/stripeClient.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const admin = supabaseAdmin();
  if (!admin) {
    res.status(503).json({ error: 'Booking is not configured yet (SUPABASE_SERVICE_ROLE_KEY unset).' });
    return;
  }

  const { slug, slotStart, slotEnd, clientName, clientEmail, clientPhone, situation, consent } = req.body || {};

  if (!slug || !slotStart || !slotEnd) {
    res.status(400).json({ error: 'Missing slot' });
    return;
  }
  if (!clientName || typeof clientName !== 'string' || !clientName.trim()) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  if (!clientEmail || !EMAIL_RE.test(clientEmail)) {
    res.status(400).json({ error: 'A valid email is required' });
    return;
  }

  const { data: attorney, error: aErr } = await admin
    .from('attorneys')
    .select('id, name, email, verification_status, booking_page_published, firm_id, consult_fee')
    .eq('slug', slug)
    .maybeSingle();
  if (aErr) {
    res.status(500).json({ error: aErr.message });
    return;
  }
  if (!attorney || attorney.verification_status !== 'verified' || !attorney.booking_page_published) {
    res.status(404).json({ error: 'This booking page is not available.' });
    return;
  }

  // Belt-and-suspenders re-check on top of the DB-level exclusion
  // constraint (no_double_booking), which is the real backstop against a
  // race between two people booking the same slot.
  const { data: clashes } = await admin
    .from('bookings')
    .select('id')
    .eq('attorney_id', attorney.id)
    .in('status', ['pending', 'confirmed'])
    .lt('slot_start', slotEnd)
    .gt('slot_end', slotStart);
  if (clashes && clashes.length) {
    res.status(409).json({ error: 'That time was just taken. Pick another slot.' });
    return;
  }

  const { data: booking, error: insErr } = await admin
    .from('bookings')
    .insert({
      attorney_id: attorney.id,
      attorney_name: attorney.name,
      client_name: clientName.trim(),
      client_email: clientEmail,
      client_phone: clientPhone || null,
      slot: slotStart,
      slot_start: slotStart,
      slot_end: slotEnd,
      source: 'booking_page',
      status: 'pending',
      issue_description: consent ? (situation || null) : null,
      description_consent: !!consent,
      description_consent_date: consent ? new Date().toISOString() : null,
      description_skipped: !consent,
    })
    .select()
    .single();

  if (insErr) {
    // 23P01 = exclusion_violation from no_double_booking — a genuine race.
    if (insErr.code === '23P01') {
      res.status(409).json({ error: 'That time was just taken. Pick another slot.' });
      return;
    }
    res.status(500).json({ error: insErr.message });
    return;
  }

  const tokens = {};
  for (const purpose of ['confirm', 'reschedule', 'cancel']) {
    const raw = generateToken();
    tokens[purpose] = raw;
    await admin.from('booking_action_tokens').insert({
      token_hash: hashToken(raw),
      booking_id: booking.id,
      purpose,
      expires_at: slotEnd,
    });
  }

  await admin.from('email_schedule').insert([
    { booking_id: booking.id, kind: 'confirmation', send_at: new Date().toISOString() },
    { booking_id: booking.id, kind: 'reminder', send_at: new Date(new Date(slotStart).getTime() - 24 * 3600000).toISOString() },
  ]);

  const origin = req.headers.origin || `https://${req.headers.host || ''}`;
  const links = manageLinks(origin, tokens);
  const when = new Date(slotStart).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });

  const clientSent = await sendEmail(
    clientEmail,
    'Your consultation is booked',
    bookingEmailText({ clientName: clientName.trim(), attorneyName: attorney.name, when, links }),
    bookingEmailHtml({ clientName: clientName.trim(), attorneyName: attorney.name, when, links }),
  );
  if (attorney.email) {
    const dashboardUrl = `${origin}/attorney/bookings`;
    await sendEmail(
      attorney.email,
      `New consultation request — ${clientName.trim()}`,
      attorneyNotificationText({ clientName: clientName.trim(), when, dashboardUrl }),
      attorneyNotificationHtml({ clientName: clientName.trim(), when, dashboardUrl }),
    );
  }
  if (clientSent) {
    await admin.from('email_schedule').update({ sent_at: new Date().toISOString() }).eq('booking_id', booking.id).eq('kind', 'confirmation');
  }

  // Item 4b: client pays the consultation fee at booking, via a Stripe
  // Connect direct charge -- only when the attorney's firm has finished
  // Connect onboarding. An attorney who hasn't onboarded yet just doesn't
  // get a paymentUrl; the booking proceeds exactly as it did before this
  // feature existed (payment collected out-of-band, same as today).
  // Exactly one consultation_charges row per booking, same
  // upsert+ignoreDuplicates+unique-index guarantee the completed-booking
  // path already relies on (api/manage.js is not involved here; this is
  // the booking-time creation, status 'pending' until the Connect webhook
  // marks it 'charged').
  let paymentUrl = null;
  if (attorney.consult_fee != null && attorney.firm_id) {
    const amountCents = Math.round(Number(attorney.consult_fee) * 100);
    if (amountCents > 0) {
      await admin.from('consultation_charges').upsert(
        { booking_id: booking.id, attorney_id: attorney.id, amount_cents: amountCents },
        { onConflict: 'booking_id', ignoreDuplicates: true }
      );

      if (isStripeConfigured()) {
        const { data: paymentAccount } = await admin
          .from('firm_payment_accounts')
          .select('stripe_account_id, status')
          .eq('firm_id', attorney.firm_id)
          .maybeSingle();

        if (paymentAccount?.status === 'active') {
          try {
            const session = await createConsultationCheckout({
              connectedAccountId: paymentAccount.stripe_account_id,
              amountCents,
              clientEmail,
              attorneyName: attorney.name,
              bookingId: booking.id,
              successUrl: `${origin}/manage/${tokens.confirm}?paid=1`,
              cancelUrl: `${origin}/manage/${tokens.confirm}?paid=canceled`,
            });
            paymentUrl = session.url;
          } catch {
            // Fail open: booking already exists and the client already got
            // a confirmation email. A payment-session failure shouldn't
            // undo the booking -- the attorney can still collect payment
            // out-of-band, same as an unonboarded firm.
          }
        }
      }
    }
  }

  res.status(200).json({ booking, manage: links, emailSent: clientSent, paymentUrl });
}
