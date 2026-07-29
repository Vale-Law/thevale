// POST /api/feedback-link {bookingId} — admin-only. Mints a single-use
// feedback link for a completed consultation and returns it for the admin
// to send to the client.
//
// Why an admin-minted link rather than automatic delivery: the reminder
// cron (api/send-reminders.js) is shared infrastructure outside Track B's
// file boundary, so W3 does not wire feedback requests into it. That
// automatic post-consultation send is the documented fast-follow; until
// it lands this route is what makes the loop usable end to end.
//
// The raw token is returned exactly once, here, and only its hash is
// stored -- same contract as the confirm/reschedule/cancel links.
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { generateToken, hashToken } from './_lib/tokens.js';

const FEEDBACK_TOKEN_TTL_DAYS = 30;

function originOf(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const authHeader = req.headers.authorization || '';
  const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!jwt) {
    res.status(401).json({ error: 'Missing bearer token' });
    return;
  }

  const admin = supabaseAdmin();
  if (!admin) {
    res.status(503).json({ error: 'Not configured (SUPABASE_SERVICE_ROLE_KEY unset).' });
    return;
  }

  const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
  if (userErr || !userData?.user) {
    res.status(401).json({ error: 'Invalid session' });
    return;
  }

  // Same admin test the is_admin() RLS helper performs, applied here
  // because this route runs with the service role and bypasses RLS.
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (profile?.role !== 'admin') {
    res.status(403).json({ error: 'Admin only.' });
    return;
  }

  const bookingId = String(req.body?.bookingId || '');
  if (!bookingId) {
    res.status(400).json({ error: 'Missing bookingId' });
    return;
  }

  const { data: booking } = await admin
    .from('bookings')
    .select('id, status')
    .eq('id', bookingId)
    .maybeSingle();
  if (!booking) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }
  if (!['completed', 'no_show'].includes(booking.status)) {
    res.status(409).json({ error: 'Feedback can only be requested for a completed consultation.' });
    return;
  }

  const { data: existing } = await admin
    .from('consultation_feedback')
    .select('id')
    .eq('booking_id', booking.id)
    .maybeSingle();
  if (existing) {
    res.status(409).json({ error: 'Feedback has already been submitted for this consultation.' });
    return;
  }

  const raw = generateToken();
  const expiresAt = new Date(Date.now() + FEEDBACK_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { error: insertErr } = await admin.from('booking_action_tokens').insert({
    token_hash: hashToken(raw),
    booking_id: booking.id,
    purpose: 'feedback',
    expires_at: expiresAt,
  });
  if (insertErr) {
    res.status(500).json({ error: insertErr.message });
    return;
  }

  res.status(200).json({ url: `${originOf(req)}/feedback/${raw}`, expiresAt });
}
