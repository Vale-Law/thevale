// GET /api/availability?slug=jane-doe
// Public, unauthenticated. Reads attorney_availability_rules (RLS on that
// table is owner-only — see the W0 foundation migration — so this has to
// run server-side with the service role) and returns computed open slots
// for the attorney's published booking page.
//
// If the attorney has connected Google and/or Microsoft calendars (F-01), a
// live free/busy query is merged into existingRanges on every request --
// there is no caching layer here, so an external event is reflected the
// next time this endpoint is hit, satisfying the "removes a slot within a
// defined sync SLA" gate without needing a separate sync job. A
// refresh/free-busy failure degrades to booking-only availability (fail
// open on the client-facing side) and records the error on the connection
// row so the attorney's own health indicator shows it. An attorney can have
// both providers connected at once (e.g. a personal Google calendar and a
// firm Outlook calendar); busy ranges from every connected, non-erroring
// provider are merged together.
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { computeAvailableSlots } from '../src/lib/availability.js';
import { decryptRefreshToken, encryptRefreshToken } from './_lib/calendarCrypto.js';
import { refreshAccessToken as googleRefresh, getFreeBusy as googleFreeBusy } from './_lib/googleCalendar.js';
import { refreshAccessToken as microsoftRefresh, getFreeBusy as microsoftFreeBusy } from './_lib/microsoftCalendar.js';

const DAYS_AHEAD = 14;

const PROVIDERS = {
  google: { refresh: googleRefresh, freeBusy: googleFreeBusy },
  microsoft: { refresh: microsoftRefresh, freeBusy: microsoftFreeBusy },
};

async function loadOneConnectionBusy(admin, connection) {
  const provider = PROVIDERS[connection.provider];
  if (!provider) return [];
  try {
    const refreshToken = decryptRefreshToken(connection.refresh_token_encrypted);
    const refreshed = await provider.refresh(refreshToken);
    const now = new Date();
    const timeMax = new Date(now.getTime() + DAYS_AHEAD * 86400000);
    const busy = await provider.freeBusy(refreshed.access_token, connection.calendar_id, now.toISOString(), timeMax.toISOString());

    const update = { status: 'connected', last_error: null, last_synced_at: new Date().toISOString() };
    // Microsoft's v2 token endpoint can rotate the refresh_token on every
    // refresh -- if it did, the old one is invalidated, so the encrypted
    // value on the row must be updated or the connection breaks on the
    // next sync. Google never rotates, so refreshed.refresh_token is
    // simply absent there and this is a no-op.
    if (refreshed.refresh_token) update.refresh_token_encrypted = encryptRefreshToken(refreshed.refresh_token);

    await admin.from('attorney_calendar_connections').update(update).eq('id', connection.id);
    return busy;
  } catch (e) {
    await admin
      .from('attorney_calendar_connections')
      .update({ status: 'error', last_error: e.message || 'Calendar sync failed' })
      .eq('id', connection.id);
    return [];
  }
}

async function loadCalendarBusyRanges(admin, attorneyId) {
  const { data: connections } = await admin
    .from('attorney_calendar_connections')
    .select('*')
    .eq('attorney_id', attorneyId)
    .neq('status', 'disconnected');

  if (!connections?.length) return [];
  const results = await Promise.all(connections.map((c) => loadOneConnectionBusy(admin, c)));
  return results.flat();
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
