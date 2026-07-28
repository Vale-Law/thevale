// GET /api/calendar-connect
// Authenticated (attorney only -- an office manager doesn't have a personal
// calendar to connect). Returns the Google consent-screen URL; the frontend
// navigates the browser there itself (window.location.href = data.url)
// rather than this endpoint redirecting directly, since the caller's
// Supabase session lives in the browser, not in this request's cookies.
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { isGoogleCalendarConfigured, buildAuthUrl, signState } from './_lib/googleCalendar.js';

function redirectBase(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isGoogleCalendarConfigured()) {
    res.status(503).json({ error: 'Calendar connection is not configured yet (Google OAuth credentials unset).' });
    return;
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Missing bearer token' });
    return;
  }

  const admin = supabaseAdmin();
  if (!admin) {
    res.status(503).json({ error: 'Not configured (SUPABASE_SERVICE_ROLE_KEY unset).' });
    return;
  }

  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) {
    res.status(401).json({ error: 'Invalid session' });
    return;
  }

  const { data: attorney } = await admin.from('attorneys').select('id').eq('user_id', userData.user.id).maybeSingle();
  if (!attorney) {
    res.status(403).json({ error: 'Only an attorney can connect a calendar.' });
    return;
  }

  const redirectUri = `${redirectBase(req)}/api/calendar-callback`;
  const state = signState(attorney.id);
  res.status(200).json({ url: buildAuthUrl({ redirectUri, state }) });
}
