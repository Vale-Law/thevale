// GET /api/calendar-callback-microsoft -- Microsoft's OAuth redirect
// target, mirrors api/calendar-callback.js (Google) exactly except for the
// token/mailbox extraction details Graph needs. No active Supabase session
// on this request, so `state` carries the signed attorneyId and this
// writes with the service role.
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { verifyState, encryptRefreshToken } from './_lib/calendarCrypto.js';
import { isMicrosoftCalendarConfigured, exchangeCodeForTokens, extractMailboxFromIdToken } from './_lib/microsoftCalendar.js';

function redirectBase(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

function redirectTo(res, path) {
  res.writeHead(302, { Location: path });
  res.end();
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isMicrosoftCalendarConfigured()) {
    redirectTo(res, '/attorney/availability?calendar=error&provider=microsoft&reason=not_configured');
    return;
  }

  const { code, state, error: oauthError } = req.query;
  if (oauthError) {
    redirectTo(res, `/attorney/availability?calendar=error&provider=microsoft&reason=${encodeURIComponent(String(oauthError))}`);
    return;
  }

  const claims = verifyState(state);
  if (!claims) {
    redirectTo(res, '/attorney/availability?calendar=error&provider=microsoft&reason=invalid_state');
    return;
  }

  const admin = supabaseAdmin();
  if (!admin) {
    redirectTo(res, '/attorney/availability?calendar=error&provider=microsoft&reason=not_configured');
    return;
  }

  const redirectUri = `${redirectBase(req)}/api/calendar-callback-microsoft`;

  let tokens;
  try {
    tokens = await exchangeCodeForTokens(code, redirectUri);
  } catch (e) {
    redirectTo(res, '/attorney/availability?calendar=error&provider=microsoft&reason=token_exchange_failed');
    return;
  }

  if (!tokens.refresh_token) {
    redirectTo(res, '/attorney/availability?calendar=error&provider=microsoft&reason=no_refresh_token');
    return;
  }

  const mailbox = extractMailboxFromIdToken(tokens.id_token);
  if (!mailbox) {
    redirectTo(res, '/attorney/availability?calendar=error&provider=microsoft&reason=no_mailbox');
    return;
  }

  const encrypted = encryptRefreshToken(tokens.refresh_token);
  const nowIso = new Date().toISOString();

  const { data: existing } = await admin
    .from('attorney_calendar_connections')
    .select('id')
    .eq('attorney_id', claims.attorneyId)
    .eq('provider', 'microsoft')
    .maybeSingle();

  const row = {
    attorney_id: claims.attorneyId,
    provider: 'microsoft',
    refresh_token_encrypted: encrypted,
    calendar_id: mailbox,
    status: 'connected',
    last_error: null,
    connected_at: nowIso,
  };

  const { error: writeError } = existing
    ? await admin.from('attorney_calendar_connections').update(row).eq('id', existing.id)
    : await admin.from('attorney_calendar_connections').insert(row);

  if (writeError) {
    redirectTo(res, '/attorney/availability?calendar=error&provider=microsoft&reason=save_failed');
    return;
  }

  redirectTo(res, '/attorney/availability?calendar=connected&provider=microsoft');
}
