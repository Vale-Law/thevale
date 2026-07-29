// GET  /api/feedback?token=...  — validate the link, return what the form
//                                  needs to render (never any prior answers)
// POST /api/feedback {token, ...} — record the response, consume the token
//
// F-03 internal operational feedback (Sprint v1.2 Track B, W3). Runs with
// the service role because consultation_feedback has no insert policy at
// all by design -- the emailed single-use token IS the authorization, the
// same shape Sprint 1 used for confirm/reschedule/cancel links.
//
// This route never reads feedback back out. There is no GET path that
// returns a stored response, to anyone -- the only reader is the
// admin-only RLS select used by the internal admin view.
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { hashToken } from './_lib/tokens.js';

async function lookupToken(admin, rawToken) {
  const { data: tok } = await admin
    .from('booking_action_tokens')
    .select('*')
    .eq('token_hash', hashToken(rawToken))
    .eq('purpose', 'feedback')
    .maybeSingle();
  if (!tok || tok.consumed_at || new Date(tok.expires_at) < new Date()) return null;
  return tok;
}

function clampRating(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 5) return null;
  return n;
}

function tribool(value) {
  return typeof value === 'boolean' ? value : null;
}

export default async function handler(req, res) {
  const admin = supabaseAdmin();
  if (!admin) {
    res.status(503).json({ error: 'Feedback is not configured yet (SUPABASE_SERVICE_ROLE_KEY unset).' });
    return;
  }

  const rawToken = req.method === 'GET' ? String(req.query?.token || '') : String(req.body?.token || '');
  if (!rawToken) {
    res.status(400).json({ error: 'Missing token' });
    return;
  }

  const tok = await lookupToken(admin, rawToken);
  if (!tok) {
    res.status(404).json({ error: 'This feedback link has expired or has already been used.' });
    return;
  }

  const { data: booking } = await admin
    .from('bookings')
    .select('id, attorney_id, attorney_name, status, slot_start')
    .eq('id', tok.booking_id)
    .maybeSingle();
  if (!booking) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }
  // Feedback is only meaningful about a consultation that actually
  // reached a terminal state.
  if (!['completed', 'no_show'].includes(booking.status)) {
    res.status(409).json({ error: 'This consultation is not complete yet.' });
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      attorneyName: booking.attorney_name || null,
      slotStart: booking.slot_start || null,
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body || {};
  const comment = typeof body.comment === 'string' ? body.comment.trim().slice(0, 2000) : null;

  const { error: insertErr } = await admin.from('consultation_feedback').insert({
    booking_id: booking.id,
    attorney_id: booking.attorney_id,
    attended: tribool(body.attended),
    fee_as_disclosed: tribool(body.feeAsDisclosed),
    format_as_disclosed: tribool(body.formatAsDisclosed),
    communication_rating: clampRating(body.communicationRating),
    comment: comment || null,
  });
  if (insertErr) {
    // Unique violation = already submitted for this booking. Consume the
    // token anyway so the link stops working, and report it plainly.
    if (insertErr.code === '23505') {
      await admin
        .from('booking_action_tokens')
        .update({ consumed_at: new Date().toISOString() })
        .eq('token_hash', tok.token_hash);
      res.status(409).json({ error: 'Feedback has already been submitted for this consultation.' });
      return;
    }
    res.status(500).json({ error: insertErr.message });
    return;
  }

  await admin
    .from('booking_action_tokens')
    .update({ consumed_at: new Date().toISOString() })
    .eq('token_hash', tok.token_hash);

  res.status(200).json({ ok: true });
}
