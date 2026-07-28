// GET /api/calendar-callback -- Google's OAuth redirect target.
// No active Supabase session on this request (it's a server-to-server
// redirect from Google), so `state` carries the signed attorneyId and this
// writes with the service role, matching the rest of this codebase's
// service-role write pattern for unauthenticated-request server actions.
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { isGoogleCalendarConfigured, verifyState, exchangeCodeForTokens, encryptRefreshToken } from './_lib/googleCalendar.js';

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

  if (!isGoogleCalendarConfigured()) {
    redirectTo(res, '/attorney/availability?calendar=error&reason=not_configured');
    return;
  }

  const { code, state, error: oauthError } = req.query;
  if (oauthError) {
    redirectTo(res, `/attorney/availability?calendar=error&reason=${encodeURIComponent(String(oauthError))}`);
    return;
  }

  const claims = verifyState(state);
  if (!claims) {
    redirectTo(res, '/attorney/availability?calendar=error&reason=invalid_state');
    return;
  }

  const admin = supabaseAdmin();
  if (!admin) {
    redirectTo(res, '/attorney/availability?calendar=error&reason=not_configured');
    return;
  }

  const redirectUri = `${redirectBase(req)}/api/calendar-callback`;

  let tokens;
  try {
    tokens = await exchangeCodeForTokens(code, redirectUri);
  } catch (e) {
    redirectTo(res, '/attorney/availability?calendar=error&reason=token_exchange_failed');
    return;
  }

  // Google only returns a refresh_token on first consent (buildAuthUrl
  // always sets prompt=consent, so this should always be present) -- if
  // it's missing, fail rather than persist a connection that can never be
  // refreshed once the short-lived access token expires.
  if (!tokens.refresh_token) {
    redirectTo(res, '/attorney/availability?calendar=error&reason=no_refresh_token');
    return;
  }

  const encrypted = encryptRefreshToken(tokens.refresh_token);
  const nowIso = new Date().toISOString();

  const { data: existing } = await admin
    .from('attorney_calendar_connections')
    .select('id')
    .eq('attorney_id', claims.attorneyId)
    .eq('provider', 'google')
    .maybeSingle();

  const row = {
    attorney_id: claims.attorneyId,
    provider: 'google',
    refresh_token_encrypted: encrypted,
    calendar_id: 'primary',
    status: 'connected',
    last_error: null,
    connected_at: nowIso,
  };

  const { error: writeError } = existing
    ? await admin.from('attorney_calendar_connections').update(row).eq('id', existing.id)
    : await admin.from('attorney_calendar_connections').insert(row);

  if (writeError) {
    redirectTo(res, '/attorney/availability?calendar=error&reason=save_failed');
    return;
  }

  redirectTo(res, '/attorney/availability?calendar=connected');
}
