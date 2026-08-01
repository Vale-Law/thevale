// Microsoft Graph calendar OAuth (free/busy scope only) + the getSchedule
// free/busy query. Mirrors api/_lib/googleCalendar.js's architecture and
// shares its refresh-token encryption / OAuth state signing (see
// ./calendarCrypto.js) -- same CALENDAR_TOKEN_ENCRYPTION_KEY, same
// AES-256-GCM packing, same signed-state pattern.
//
// Requires two server-only Vercel env vars (never VITE_-prefixed), plus
// the same CALENDAR_TOKEN_ENCRYPTION_KEY the Google layer already needs:
//   MICROSOFT_OAUTH_CLIENT_ID
//   MICROSOFT_OAUTH_CLIENT_SECRET
// Until both are set, isMicrosoftCalendarConfigured() is false and every
// caller returns a soft 503, same convention as the Google layer.

// `Calendars.Read` only -- never a write scope, never event details beyond
// what getSchedule needs to compute free/busy. `openid` + `offline_access`
// are OIDC/token-lifecycle scopes (not an additional Graph resource
// permission) -- openid lets us decode the attorney's own mailbox address
// out of the returned id_token without requesting the separate `User.Read`
// permission, and offline_access is what makes Microsoft issue a
// refresh_token at all. Verify the Microsoft consent screen shows nothing
// beyond "read your calendars" before this ships.
export const MICROSOFT_SCOPE = 'openid offline_access Calendars.Read';

const AUTHORITY = 'https://login.microsoftonline.com/common/oauth2/v2.0';

export function isMicrosoftCalendarConfigured() {
  return !!(process.env.MICROSOFT_OAUTH_CLIENT_ID && process.env.MICROSOFT_OAUTH_CLIENT_SECRET && process.env.CALENDAR_TOKEN_ENCRYPTION_KEY);
}

export function buildAuthUrl({ redirectUri, state }) {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_OAUTH_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    response_mode: 'query',
    scope: MICROSOFT_SCOPE,
    state,
    prompt: 'consent',
  });
  return `${AUTHORITY}/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(code, redirectUri) {
  const res = await fetch(`${AUTHORITY}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.MICROSOFT_OAUTH_CLIENT_ID,
      client_secret: process.env.MICROSOFT_OAUTH_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      scope: MICROSOFT_SCOPE,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || 'Microsoft token exchange failed');
  return data; // { access_token, refresh_token, id_token, expires_in, scope, token_type }
}

// Microsoft's v2 endpoint can rotate the refresh_token on every refresh --
// unlike Google, the caller MUST check the response for a new refresh_token
// and persist it, or the connection stops working once the old one is
// invalidated. Returns both tokens; the caller decides what to persist.
export async function refreshAccessToken(refreshToken) {
  const res = await fetch(`${AUTHORITY}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.MICROSOFT_OAUTH_CLIENT_ID,
      client_secret: process.env.MICROSOFT_OAUTH_CLIENT_SECRET,
      grant_type: 'refresh_token',
      scope: MICROSOFT_SCOPE,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || 'Microsoft token refresh failed');
  return data; // { access_token, refresh_token?, expires_in, scope, token_type }
}

// Reads the mailbox address out of the id_token's claims without an extra
// Graph call (which would need the separate User.Read permission). The
// id_token's signature isn't verified here -- it came directly from
// Microsoft's token endpoint over TLS in the same response as the access
// token we're about to use for the real authorized call, so it's already
// as trusted as the access token itself; this is only ever used to pick
// which mailbox to pass to getSchedule, never as an authorization check.
export function extractMailboxFromIdToken(idToken) {
  const parts = String(idToken || '').split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return payload.preferred_username || payload.email || payload.upn || null;
  } catch {
    return null;
  }
}

// Free/busy only -- this is the one Graph call this integration ever makes.
// Never reads event contents, attendee lists, or subjects: getSchedule
// returns only status/start/end per busy block.
export async function getFreeBusy(accessToken, mailbox, timeMinISO, timeMaxISO) {
  const res = await fetch('https://graph.microsoft.com/v1.0/me/calendar/getSchedule', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      Prefer: 'outlook.timezone="UTC"',
    },
    body: JSON.stringify({
      schedules: [mailbox],
      startTime: { dateTime: timeMinISO, timeZone: 'UTC' },
      endTime: { dateTime: timeMaxISO, timeZone: 'UTC' },
      availabilityViewInterval: 30,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Microsoft getSchedule query failed');
  const items = data.value?.[0]?.scheduleItems || [];
  return items
    .filter((i) => i.status !== 'free')
    .map((i) => ({ start: i.start?.dateTime ? `${i.start.dateTime}Z` : i.start?.dateTime, end: i.end?.dateTime ? `${i.end.dateTime}Z` : i.end?.dateTime }));
}
