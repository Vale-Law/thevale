import { supabaseAdmin } from './supabase';
import { encrypt, decrypt } from './crypto';
import type { Busy } from './google';

const AUTH_BASE = 'https://login.microsoftonline.com/common/oauth2/v2.0';
const GRAPH = 'https://graph.microsoft.com/v1.0';

export const MS_REDIRECT = () => `${process.env.APP_URL}/api/calendar/microsoft/callback`;

// offline_access → gives us a refresh token
// Calendars.ReadWrite → read free/busy (getSchedule) + create the booking event
// openid email → learn the mailbox address (needed by getSchedule)
export const MS_SCOPES = 'openid email offline_access https://graph.microsoft.com/Calendars.ReadWrite';

function emailFromIdToken(idToken?: string): string | null {
  if (!idToken) return null;
  try {
    const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString('utf8'));
    return payload.email ?? payload.preferred_username ?? null;
  } catch {
    return null;
  }
}

export async function saveOutlookConnectionFromCode(attorneyId: string, code: string) {
  const res = await fetch(`${AUTH_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.MS_CLIENT_ID!,
      client_secret: process.env.MS_CLIENT_SECRET!,
      redirect_uri: MS_REDIRECT(),
      grant_type: 'authorization_code',
    }),
  });
  const t = await res.json();
  if (!res.ok || !t.refresh_token) throw new Error(`Microsoft token exchange failed: ${JSON.stringify(t)}`);

  await supabaseAdmin.from('attorney_calendar_connections').upsert({
    attorney_id: attorneyId,
    provider: 'microsoft',
    refresh_token: encrypt(t.refresh_token),
    access_token: encrypt(t.access_token),
    access_token_expires_at: new Date(Date.now() + t.expires_in * 1000).toISOString(),
    account_email: emailFromIdToken(t.id_token),
  }, { onConflict: 'attorney_id,provider' });
}

export async function getOutlookToken(attorneyId: string): Promise<string | null> {
  const { data: c } = await supabaseAdmin
    .from('attorney_calendar_connections')
    .select('*').eq('attorney_id', attorneyId).eq('provider', 'microsoft').single();
  if (!c) return null;

  const stillValid = c.access_token &&
    c.access_token_expires_at &&
    new Date(c.access_token_expires_at).getTime() > Date.now() + 60_000;
  if (stillValid) return decrypt(c.access_token);

  const res = await fetch(`${AUTH_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.MS_CLIENT_ID!,
      client_secret: process.env.MS_CLIENT_SECRET!,
      refresh_token: decrypt(c.refresh_token)!,
      grant_type: 'refresh_token',
      scope: MS_SCOPES,
    }),
  });
  const t = await res.json();
  if (!res.ok || !t.access_token) throw new Error(`Microsoft token refresh failed: ${JSON.stringify(t)}`);

  // Microsoft rotates refresh tokens — persist the new one if provided.
  const update: Record<string, unknown> = {
    access_token: encrypt(t.access_token),
    access_token_expires_at: new Date(Date.now() + t.expires_in * 1000).toISOString(),
  };
  if (t.refresh_token) update.refresh_token = encrypt(t.refresh_token);
  await supabaseAdmin.from('attorney_calendar_connections').update(update).eq('id', c.id);

  return t.access_token as string;
}

export async function outlookBusy(attorneyId: string, min: Date, max: Date): Promise<Busy[]> {
  const token = await getOutlookToken(attorneyId);
  if (!token) return [];

  const { data: c } = await supabaseAdmin
    .from('attorney_calendar_connections')
    .select('account_email').eq('attorney_id', attorneyId).eq('provider', 'microsoft').single();
  const mailbox = c?.account_email;
  if (!mailbox) return []; // getSchedule needs the mailbox address

  const res = await fetch(`${GRAPH}/me/calendar/getSchedule`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      schedules: [mailbox],
      startTime: { dateTime: min.toISOString(), timeZone: 'UTC' },
      endTime: { dateTime: max.toISOString(), timeZone: 'UTC' },
      availabilityViewInterval: 30,
    }),
  });
  const d = await res.json();
  const items = d.value?.[0]?.scheduleItems ?? [];
  // status is free/tentative/busy/oof/workingElsewhere — treat anything not free
  // as busy. We read only times, never subject/organizer/etc.
  return items
    .filter((i: any) => i.status && i.status !== 'free')
    .map((i: any) => ({
      start: new Date(`${i.start.dateTime}Z`),
      end: new Date(`${i.end.dateTime}Z`),
    }));
}

export async function outlookCreateEvent(attorneyId: string, opts: {
  start: Date; end: Date; summary: string; description: string;
}): Promise<string | null> {
  const token = await getOutlookToken(attorneyId);
  if (!token) return null;
  const res = await fetch(`${GRAPH}/me/events`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subject: opts.summary,
      body: { contentType: 'Text', content: opts.description },
      start: { dateTime: opts.start.toISOString(), timeZone: 'UTC' },
      end: { dateTime: opts.end.toISOString(), timeZone: 'UTC' },
    }),
  });
  const ev = await res.json();
  if (!res.ok) throw new Error(`Microsoft event create failed: ${JSON.stringify(ev)}`);
  return ev.id ?? null;
}

/** Create a Graph subscription so Microsoft notifies us on calendar changes.
 *  Best-effort: needs a public HTTPS APP_URL reachable by Microsoft. */
export async function setupOutlookSubscription(attorneyId: string): Promise<void> {
  const token = await getOutlookToken(attorneyId);
  if (!token) return;
  // Microsoft caps event subscriptions at ~3 days; renew via cron before then.
  const expiration = new Date(Date.now() + 2.5 * 24 * 60 * 60 * 1000).toISOString();
  const res = await fetch(`${GRAPH}/subscriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      changeType: 'created,updated,deleted',
      notificationUrl: `${process.env.APP_URL}/api/calendar/microsoft/notifications`,
      resource: '/me/events',
      expirationDateTime: expiration,
      clientState: attorneyId,
    }),
  });
  if (!res.ok) {
    console.warn('Microsoft subscription not established:', await res.text());
    return;
  }
  const d = await res.json();
  await supabaseAdmin.from('attorney_calendar_connections').update({
    channel_id: d.id ?? null,
    channel_expires_at: d.expirationDateTime ?? expiration,
  }).eq('attorney_id', attorneyId).eq('provider', 'microsoft');
}
