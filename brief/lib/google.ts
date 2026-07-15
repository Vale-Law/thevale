import crypto from 'node:crypto';
import { supabaseAdmin } from './supabase';
import { encrypt, decrypt } from './crypto';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const CAL = 'https://www.googleapis.com/calendar/v3';

export const GOOGLE_REDIRECT = () => `${process.env.APP_URL}/api/calendar/google/callback`;

// Scopes are deliberately minimal:
//   openid email            → so we learn the connected mailbox address
//   calendar.freebusy       → read ONLY free/busy (never titles/attendees)
//   calendar.events         → create the booking event on their calendar
export const GOOGLE_SCOPES = [
  'openid',
  'email',
  'https://www.googleapis.com/auth/calendar.freebusy',
  'https://www.googleapis.com/auth/calendar.events',
].join(' ');

export type Busy = { start: Date; end: Date };

/** Decode the email out of an id_token. It came straight from Google over TLS,
 *  so we read the payload without re-verifying the signature. */
function emailFromIdToken(idToken?: string): string | null {
  if (!idToken) return null;
  try {
    const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString('utf8'));
    return payload.email ?? null;
  } catch {
    return null;
  }
}

/** Exchange the one-time OAuth `code` for tokens and persist the connection. */
export async function saveGoogleConnectionFromCode(attorneyId: string, code: string) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: GOOGLE_REDIRECT(),
      grant_type: 'authorization_code',
    }),
  });
  const t = await res.json();
  if (!res.ok || !t.refresh_token) {
    // No refresh_token usually means the lawyer already granted access before.
    // `prompt=consent` on the connect step forces Google to return one again.
    throw new Error(`Google token exchange failed: ${JSON.stringify(t)}`);
  }

  await supabaseAdmin.from('attorney_calendar_connections').upsert({
    attorney_id: attorneyId,
    provider: 'google',
    refresh_token: encrypt(t.refresh_token),
    access_token: encrypt(t.access_token),
    access_token_expires_at: new Date(Date.now() + t.expires_in * 1000).toISOString(),
    account_email: emailFromIdToken(t.id_token),
  }, { onConflict: 'attorney_id,provider' });
}

/** Return a valid access token, refreshing it first if it's about to expire. */
export async function getGoogleToken(attorneyId: string): Promise<string | null> {
  const { data: c } = await supabaseAdmin
    .from('attorney_calendar_connections')
    .select('*').eq('attorney_id', attorneyId).eq('provider', 'google').single();
  if (!c) return null;

  const stillValid = c.access_token &&
    c.access_token_expires_at &&
    new Date(c.access_token_expires_at).getTime() > Date.now() + 60_000;
  if (stillValid) return decrypt(c.access_token);

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: decrypt(c.refresh_token)!,
      grant_type: 'refresh_token',
    }),
  });
  const t = await res.json();
  if (!res.ok || !t.access_token) throw new Error(`Google token refresh failed: ${JSON.stringify(t)}`);

  await supabaseAdmin.from('attorney_calendar_connections').update({
    access_token: encrypt(t.access_token),
    access_token_expires_at: new Date(Date.now() + t.expires_in * 1000).toISOString(),
  }).eq('id', c.id);

  return t.access_token as string;
}

/** Free/busy ONLY. Returns busy intervals — never any event content. */
export async function googleBusy(attorneyId: string, min: Date, max: Date): Promise<Busy[]> {
  const token = await getGoogleToken(attorneyId);
  if (!token) return [];
  const res = await fetch(`${CAL}/freeBusy`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ timeMin: min.toISOString(), timeMax: max.toISOString(), items: [{ id: 'primary' }] }),
  });
  const d = await res.json();
  return (d.calendars?.primary?.busy ?? []).map((b: any) => ({ start: new Date(b.start), end: new Date(b.end) }));
}

/** Write the booking onto the attorney's calendar. Returns the event id. */
export async function googleCreateEvent(attorneyId: string, opts: {
  start: Date; end: Date; summary: string; description: string;
}): Promise<string | null> {
  const token = await getGoogleToken(attorneyId);
  if (!token) return null;
  const res = await fetch(`${CAL}/calendars/primary/events`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: opts.summary,
      description: opts.description,
      start: { dateTime: opts.start.toISOString() },
      end: { dateTime: opts.end.toISOString() },
    }),
  });
  const ev = await res.json();
  if (!res.ok) throw new Error(`Google event create failed: ${JSON.stringify(ev)}`);
  return ev.id ?? null;
}

/** Register a push channel so Google notifies us when this calendar changes.
 *  Best-effort: requires a public HTTPS APP_URL whose domain is verified in
 *  Google Cloud Console. Failure here must not block connecting. */
export async function setupGoogleWatch(attorneyId: string): Promise<void> {
  const token = await getGoogleToken(attorneyId);
  if (!token) return;
  const channelId = crypto.randomUUID();
  const res = await fetch(`${CAL}/calendars/primary/events/watch`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: channelId,
      type: 'web_hook',
      address: `${process.env.APP_URL}/api/calendar/google/notifications`,
    }),
  });
  if (!res.ok) {
    console.warn('Google watch not established:', await res.text());
    return;
  }
  const d = await res.json();
  await supabaseAdmin.from('attorney_calendar_connections').update({
    channel_id: channelId,
    channel_resource_id: d.resourceId ?? null,
    channel_expires_at: d.expiration ? new Date(Number(d.expiration)).toISOString() : null,
  }).eq('attorney_id', attorneyId).eq('provider', 'google');
}
