// POST /api/bookings-public
// Creates a booking from the public /book/:slug page. Runs server-side with
// the service role because these are unauthenticated visitors (client_id is
// legitimately null) and the browser's anon key has no insert path for that
// — see the Shared Contract note in bookings_insert_client's RLS.
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { generateToken, hashToken } from './_lib/tokens.js';
import { sendEmail, manageLinks, bookingEmailBody } from './_lib/mailer.js';

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
    .select('id, name, email, verification_status, booking_page_published')
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
    bookingEmailBody({ clientName: clientName.trim(), attorneyName: attorney.name, when, links }),
  );
  if (attorney.email) {
    await sendEmail(
      attorney.email,
      `New consultation request — ${clientName.trim()}`,
      `${clientName.trim()} requested a consultation for ${when}.\n\nReview it in your dashboard: ${origin}/attorney/bookings`,
    );
  }
  if (clientSent) {
    await admin.from('email_schedule').update({ sent_at: new Date().toISOString() }).eq('booking_id', booking.id).eq('kind', 'confirmation');
  }

  res.status(200).json({ booking, manage: links, emailSent: clientSent });
}
