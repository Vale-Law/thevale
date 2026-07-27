// Pure slot-generation math for the public booking page. No calendar OAuth
// sync exists yet (that needs Google/Microsoft app credentials nobody has
// configured) — this computes availability from the attorney's own weekly
// working-hours rule (attorney_availability_rules) minus already-booked
// slots, which is a real, working availability engine on its own.
//
// Imported both by the Vercel serverless functions under /api (Node ESM)
// and available to the frontend if it's ever useful there.

const DAY_KEY_BY_INDEX = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

// The UTC offset (in minutes) that `timeZone` observes at the instant
// `utcDate` represents. Used to convert an attorney's local wall-clock
// working hours into real UTC instants without a timezone library.
function offsetMinutesAt(utcDate, timeZone) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const parts = {};
  for (const p of dtf.formatToParts(utcDate)) parts[p.type] = p.value;
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return (asUtc - utcDate.getTime()) / 60000;
}

// Converts a wall-clock date/time in `timeZone` to the UTC instant it
// represents. Two-pass refinement handles the DST-transition edge case.
function zonedWallTimeToUtc(year, month, day, hour, minute, timeZone) {
  let guess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const offset1 = offsetMinutesAt(new Date(guess), timeZone);
  guess -= offset1 * 60000;
  const offset2 = offsetMinutesAt(new Date(guess), timeZone);
  if (offset2 !== offset1) {
    guess = Date.UTC(year, month - 1, day, hour, minute, 0) - offset2 * 60000;
  }
  return new Date(guess);
}

/**
 * @param {object} opts
 * @param {Object.<string,[string,string][]>} opts.workingHours e.g. {"mon":[["09:00","17:00"]]}
 * @param {number} opts.bufferMinutes gap kept between consecutive slots
 * @param {number} opts.minNoticeHours earliest a slot may start from `now`
 * @param {number|null} opts.dailyCap max slots offered per calendar day
 * @param {string} opts.timezone IANA zone the working hours are stated in
 * @param {{start:string,end:string}[]} opts.existingRanges already-booked ranges (ISO)
 * @param {number} [opts.daysAhead]
 * @param {number} [opts.slotMinutes]
 * @param {Date} [opts.now]
 * @returns {{start:string,end:string}[]}
 */
export function computeAvailableSlots({
  workingHours,
  bufferMinutes = 15,
  minNoticeHours = 24,
  dailyCap = null,
  timezone,
  existingRanges = [],
  daysAhead = 14,
  slotMinutes = 30,
  now = new Date(),
}) {
  if (!workingHours || !timezone) return [];

  const slots = [];
  const earliestStart = now.getTime() + minNoticeHours * 3600000;
  const booked = existingRanges
    .filter((r) => r.start && r.end)
    .map((r) => ({ start: new Date(r.start).getTime(), end: new Date(r.end).getTime() }));

  for (let d = 0; d < daysAhead; d++) {
    const probe = new Date(now.getTime() + d * 86400000);
    const dtf = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
    });
    const parts = {};
    for (const p of dtf.formatToParts(probe)) parts[p.type] = p.value;
    const y = +parts.year, m = +parts.month, day = +parts.day;
    const dayKey = DAY_KEY_BY_INDEX.includes(parts.weekday.toLowerCase().slice(0, 3))
      ? parts.weekday.toLowerCase().slice(0, 3)
      : null;
    const windows = (dayKey && workingHours[dayKey]) || [];
    let daySlotCount = 0;

    for (const [startStr, endStr] of windows) {
      const [sh, sm] = startStr.split(':').map(Number);
      const [eh, em] = endStr.split(':').map(Number);
      let cursor = zonedWallTimeToUtc(y, m, day, sh, sm, timezone);
      const windowEnd = zonedWallTimeToUtc(y, m, day, eh, em, timezone);

      while (cursor.getTime() + slotMinutes * 60000 <= windowEnd.getTime()) {
        const slotStart = cursor;
        const slotEnd = new Date(cursor.getTime() + slotMinutes * 60000);
        const underCap = dailyCap == null || daySlotCount < dailyCap;
        const meetsNotice = slotStart.getTime() >= earliestStart;
        const overlapsBooked = booked.some((b) => slotStart.getTime() < b.end && slotEnd.getTime() > b.start);

        if (underCap && meetsNotice && !overlapsBooked) {
          slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
          daySlotCount++;
        }
        cursor = new Date(cursor.getTime() + (slotMinutes + bufferMinutes) * 60000);
      }
    }
  }

  return slots;
}

export const WEEKDAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];
