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
//
// Refresh-token encryption and OAuth state signing live in
// ./calendarCrypto.js now, shared with microsoftCalendar.js -- re-exported
// here so existing importers of this file (api/calendar-connect.js,
// api/calendar-callback.js, api/availability.js) don't need to change.
export { encryptRefreshToken, decryptRefreshToken, signState, verifyState } from './calendarCrypto.js';

// Free/busy only -- never full calendar read/write. Verify the Google
// consent screen shows nothing more before this ships (W1 gate).
export const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/calendar.freebusy';

export function isGoogleCalendarConfigured() {
  return !!(process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET && process.env.CALENDAR_TOKEN_ENCRYPTION_KEY);
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
