import { supabaseAdmin } from './supabase';
import { googleBusy, type Busy } from './google';
import { outlookBusy } from './outlook';
import { zonedDateParts, zonedWallTimeToUtc } from './time';

const WORK_START_HOUR = 9;   // 9:00 AM, attorney's timezone
const WORK_END_HOUR = 17;    // 5:00 PM, attorney's timezone
const MIN_NOTICE_MS = 60 * 60 * 1000; // no slot within 1 hour of now

const overlaps = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) =>
  aStart < bEnd && aEnd > bStart;

export type AvailabilityResult = {
  slots: string[];             // ISO UTC start times, only free
  durationMinutes: number;
  provider: 'google' | 'microsoft' | null;
};

/**
 * Compute the attorney's genuinely-free consultation start times.
 * @param daysAhead how far forward to look (default 14)
 */
export async function getAvailability(attorneyId: string, daysAhead = 14): Promise<AvailabilityResult> {
  // 1) Attorney settings drive the timezone + slot length.
  const { data: attorney } = await supabaseAdmin
    .from('attorneys')
    .select('timezone, consultation_duration_minutes, buffer_minutes')
    .eq('id', attorneyId).single();

  const timeZone = attorney?.timezone || 'America/Chicago';
  const durationMin = attorney?.consultation_duration_minutes || 30;
  const bufferMin = attorney?.buffer_minutes || 0;

  // 2) Which calendar is connected?
  const { data: conn } = await supabaseAdmin
    .from('attorney_calendar_connections')
    .select('provider').eq('attorney_id', attorneyId).maybeSingle();
  const provider = (conn?.provider as 'google' | 'microsoft' | undefined) ?? null;

  const now = new Date();
  const max = new Date(now.getTime() + daysAhead * 86_400_000);

  // 3) Busy blocks from the external calendar (free/busy only).
  let busy: Busy[] = [];
  if (provider === 'google') busy = await googleBusy(attorneyId, now, max);
  else if (provider === 'microsoft') busy = await outlookBusy(attorneyId, now, max);

  // 4) Existing confirmed Brief bookings also block their time.
  const { data: bookings } = await supabaseAdmin
    .from('bookings')
    .select('start_at, end_at')
    .eq('attorney_id', attorneyId).eq('status', 'confirmed')
    .gte('start_at', now.toISOString()).lte('start_at', max.toISOString());

  const blocks: Busy[] = [
    ...busy,
    ...(bookings ?? []).map(b => ({ start: new Date(b.start_at), end: new Date(b.end_at) })),
  ];

  // 5) Generate weekday 9–5 slots in the attorney's timezone, minus the blocks.
  const durationMs = durationMin * 60_000;
  const stepMs = (durationMin + bufferMin) * 60_000;
  const earliest = now.getTime() + MIN_NOTICE_MS;
  const slots: string[] = [];

  const today = zonedDateParts(timeZone, now);

  for (let offset = 0; offset < daysAhead; offset++) {
    // The calendar date `offset` days after today, in the attorney's timezone.
    const dayUtc = new Date(Date.UTC(today.year, today.month - 1, today.day + offset, 12));
    const y = dayUtc.getUTCFullYear();
    const m = dayUtc.getUTCMonth() + 1;
    const d = dayUtc.getUTCDate();
    const weekday = dayUtc.getUTCDay(); // 0=Sun..6=Sat
    if (weekday === 0 || weekday === 6) continue; // weekdays only

    const windowStart = zonedWallTimeToUtc(y, m, d, WORK_START_HOUR, 0, timeZone).getTime();
    const windowEnd = zonedWallTimeToUtc(y, m, d, WORK_END_HOUR, 0, timeZone).getTime();

    for (let s = windowStart; s + durationMs <= windowEnd; s += stepMs) {
      const slotStart = s;
      const slotEnd = s + durationMs;
      if (slotStart < earliest) continue;
      if (blocks.some(b => overlaps(new Date(slotStart), new Date(slotEnd), b.start, b.end))) continue;
      slots.push(new Date(slotStart).toISOString());
    }
  }

  return { slots, durationMinutes: durationMin, provider };
}
