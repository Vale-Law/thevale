// Google Calendar OAuth (free/busy scopes only) + refresh-token encryption.
//
// Requires three server-only Vercel env vars (never VITE_-prefixed):
//   GOOGLE_OAUTH_CLIENT_ID
//   GOOGLE_OAUTH_CLIENT_SECRET
//   CALENDAR_TOKEN_ENCRYPTION_KEY   32 random bytes, base64-encoded
//     (e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`)
// Until all three are set, isGoogleCalendarConfigured() is false and every
// caller returns a soft 503 -- same convention as api/send-email.js's
// RESEND_API_KEY gate. This is a real, hard blocker: Track A escalated it
// (Development Sprint v1.2, Section 5) rather than stub around it, and no
// code path here fakes a connection without real Google credentials.
import crypto from 'node:crypto';

// Free/busy only -- never full calendar read/write. Verify the Google
// consent screen shows nothing more before this ships (W1 gate).
export const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/calendar.freebusy';

export function isGoogleCalendarConfigured() {
  return !!(process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET && process.env.CALENDAR_TOKEN_ENCRYPTION_KEY);
}

function encryptionKey() {
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

// Signs { attorneyId, exp } into the OAuth `state` param so
// calendar-callback.js can trust it after the untrusted round trip through
// Google -- HMAC over the same server secret as token encryption, with a
// distinct context string for domain separation.
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

export function buildAuthUrl({ redirectUri, state }) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code, redirectUri) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || 'Google token exchange failed');
  return data; // { access_token, refresh_token, expires_in, scope, token_type }
}

export async function refreshAccessToken(refreshToken) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || 'Google token refresh failed');
  return data; // { access_token, expires_in, scope, token_type }
}

// Free/busy only -- this is the one Calendar API call this integration ever
// makes. Never reads event contents, attendee lists, or titles.
export async function getFreeBusy(accessToken, calendarId, timeMinISO, timeMaxISO) {
  const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      timeMin: timeMinISO,
      timeMax: timeMaxISO,
      items: [{ id: calendarId || 'primary' }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Google freeBusy query failed');
  const busy = data.calendars?.[calendarId || 'primary']?.busy || [];
  return busy.map((b) => ({ start: b.start, end: b.end }));
}
