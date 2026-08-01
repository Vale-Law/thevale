// GET /api/calendar-connect-microsoft -- mirrors api/calendar-connect.js
// (Google) exactly, for the Microsoft Graph OAuth flow. Authenticated
// (attorney only). Returns the Microsoft consent-screen URL; the frontend
// navigates the browser there itself.
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { isMicrosoftCalendarConfigured, buildAuthUrl } from './_lib/microsoftCalendar.js';
import { signState } from './_lib/calendarCrypto.js';

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

  if (!isMicrosoftCalendarConfigured()) {
    res.status(503).json({ error: 'Calendar connection is not configured yet (Microsoft OAuth credentials unset).' });
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

  const redirectUri = `${redirectBase(req)}/api/calendar-callback-microsoft`;
  const state = signState(attorney.id);
  res.status(200).json({ url: buildAuthUrl({ redirectUri, state }) });
}
