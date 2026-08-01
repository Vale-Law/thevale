// Provider-agnostic pieces of the calendar-sync layer: refresh-token
// encryption at rest and signed OAuth `state` round-tripping. Split out of
// api/_lib/googleCalendar.js (which originally defined these itself) so
// api/_lib/microsoftCalendar.js can share the exact same encryption and
// state-signing behavior rather than duplicating it — same
// CALENDAR_TOKEN_ENCRYPTION_KEY, same AES-256-GCM packing, for both
// providers' refresh tokens.
import crypto from 'node:crypto';

export function encryptionKey() {
  const raw = process.env.CALENDAR_TOKEN_ENCRYPTION_KEY;
  if (!raw) throw new Error('CALENDAR_TOKEN_ENCRYPTION_KEY unset');
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) throw new Error('CALENDAR_TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes');
  return key;
}

// AES-256-GCM: iv (12b) + authTag (16b) + ciphertext, all base64-packed.
export function encryptRefreshToken(plaintext) {
  const key = encryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]).toString('base64');
}

export function decryptRefreshToken(packed) {
  const key = encryptionKey();
  const buf = Buffer.from(packed, 'base64');
  const iv = buf.subarray(0, 12);
  const authTag = buf.subarray(12, 28);
  const ciphertext = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

// Signs { attorneyId, exp } into the OAuth `state` param so a
// calendar-callback handler can trust it after the untrusted round trip
// through the provider -- HMAC over the same server secret as token
// encryption, with a distinct context string for domain separation. Same
// signer for every provider; the callback that verifies it is what
// determines which provider a given round trip belongs to (each provider
// has its own connect/callback endpoint pair).
export function signState(attorneyId, ttlSeconds = 600) {
  const payload = JSON.stringify({ attorneyId, exp: Date.now() + ttlSeconds * 1000 });
  const payloadB64 = Buffer.from(payload, 'utf8').toString('base64url');
  const mac = crypto.createHmac('sha256', encryptionKey()).update(`calendar-oauth-state:${payloadB64}`).digest('base64url');
  return `${payloadB64}.${mac}`;
}

export function verifyState(state) {
  const [payloadB64, mac] = String(state || '').split('.');
  if (!payloadB64 || !mac) return null;
  const expectedMac = crypto.createHmac('sha256', encryptionKey()).update(`calendar-oauth-state:${payloadB64}`).digest('base64url');
  const macBuf = Buffer.from(mac);
  const expectedBuf = Buffer.from(expectedMac);
  if (macBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(macBuf, expectedBuf)) return null;
  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!payload.attorneyId || !payload.exp || payload.exp < Date.now()) return null;
  return payload;
}
