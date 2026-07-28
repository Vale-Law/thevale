// GET /api/availability?slug=jane-doe
// Public, unauthenticated. Reads attorney_availability_rules (RLS on that
// table is owner-only — see the W0 foundation migration — so this has to
// run server-side with the service role) and returns computed open slots
// for the attorney's published booking page.
//
// If the attorney has a connected Google Calendar (F-01), a live free/busy
// query is merged into existingRanges on every request -- there is no
// caching layer here, so an external event is reflected the next time this
// endpoint is hit, satisfying the "removes a slot within a defined sync
// SLA" gate without needing a separate sync job. A refresh/free-busy
// failure degrades to booking-only availability (fail open on the
// client-facing side) and records the error on the connection row so the
// attorney's own health indicator shows it.
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { computeAvailableSlots } from '../src/lib/availability.js';
import { decryptRefreshToken, refreshAccessToken, getFreeBusy } from './_lib/googleCalendar.js';

const DAYS_AHEAD = 14;

async function loadCalendarBusyRanges(admin, attorneyId) {
  const { data: connection } = await admin
    .from('attorney_calendar_connections')
    .select('*')
    .eq('attorney_id', attorneyId)
    .eq('provider', 'google')
    .maybeSingle();

  if (!connection || connection.status === 'disconnected') return [];

  try {
    const refreshToken = decryptRefreshToken(connection.refresh_token_encrypted);
    const { access_token: accessToken } = await refreshAccessToken(refreshToken);
    const now = new Date();
    const timeMax = new Date(now.getTime() + DAYS_AHEAD * 86400000);
    const busy = await getFreeBusy(accessToken, connection.calendar_id, now.toISOString(), timeMax.toISOString());

    await admin
      .from('attorney_calendar_connections')
      .update({ status: 'connected', last_error: null, last_synced_at: new Date().toISOString() })
      .eq('id', connection.id);

    return busy;
  } catch (e) {
    await admin
      .from('attorney_calendar_connections')
      .update({ status: 'error', last_error: e.message || 'Calendar sync failed' })
      .eq('id', connection.id);
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const slug = typeof req.query.slug === 'string' ? req.query.slug : '';
  if (!slug) {
    res.status(400).json({ error: 'Missing slug' });
    return;
  }

  const admin = supabaseAdmin();
  if (!admin) {
    res.status(503).json({ error: 'Booking is not configured yet (SUPABASE_SERVICE_ROLE_KEY unset).' });
    return;
  }

  const { data: attorney, error: aErr } = await admin
    .from('attorneys')
    .select('id, name, verification_status, booking_page_published')
    .eq('slug', slug)
    .maybeSingle();

  if (aErr) {
    res.status(500).json({ error: aErr.message });
    return;
  }
  if (!attorney || attorney.verification_status !== 'verified' || !attorney.booking_page_published) {
    res.status(404).json({ error: 'This booking page is not available.' });
    return;
  }

  const { data: rules } = await admin
    .from('attorney_availability_rules')
    .select('*')
    .eq('attorney_id', attorney.id)
    .maybeSingle();

  if (!rules) {
    res.status(200).json({ attorneyId: attorney.id, timezone: null, slots: [], reason: 'not_configured' });
    return;
  }

  const { data: existing } = await admin
    .from('bookings')
    .select('slot_start, slot_end')
    .eq('attorney_id', attorney.id)
    .in('status', ['pending', 'confirmed'])
    .not('slot_start', 'is', null);

  const calendarBusy = await loadCalendarBusyRanges(admin, attorney.id);

  const slots = computeAvailableSlots({
    workingHours: rules.working_hours,
    bufferMinutes: rules.buffer_minutes,
    minNoticeHours: rules.min_notice_hours,
    dailyCap: rules.daily_cap,
    timezone: rules.timezone,
    daysAhead: DAYS_AHEAD,
    existingRanges: [
      ...(existing || []).map((b) => ({ start: b.slot_start, end: b.slot_end })),
      ...calendarBusy,
    ],
  });

  res.status(200).json({ attorneyId: attorney.id, timezone: rules.timezone, slots });
}
