// Client self-service action tokens (confirm / reschedule / cancel).
// Only the hash is ever persisted (booking_action_tokens.token_hash) — the
// raw token exists only in memory here and in the email sent to the client,
// exactly as the schema comment requires.
import crypto from 'node:crypto';

export function generateToken() {
  return crypto.randomBytes(24).toString('base64url');
}

export function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}
