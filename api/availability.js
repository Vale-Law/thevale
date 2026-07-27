// GET /api/availability?slug=jane-doe
// Public, unauthenticated. Reads attorney_availability_rules (RLS on that
// table is owner-only — see the W0 foundation migration — so this has to
// run server-side with the service role) and returns computed open slots
// for the attorney's published booking page.
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { computeAvailableSlots } from '../src/lib/availability.js';

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

  const slots = computeAvailableSlots({
    workingHours: rules.working_hours,
    bufferMinutes: rules.buffer_minutes,
    minNoticeHours: rules.min_notice_hours,
    dailyCap: rules.daily_cap,
    timezone: rules.timezone,
    existingRanges: (existing || []).map((b) => ({ start: b.slot_start, end: b.slot_end })),
  });

  res.status(200).json({ attorneyId: attorney.id, timezone: rules.timezone, slots });
}
