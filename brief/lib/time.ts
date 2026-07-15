// ── Timezone-correct time helpers ───────────────────────────────────────────
// Our servers run in UTC, but "weekdays, 9am–5pm" must be evaluated in the
// ATTORNEY's timezone. These helpers convert between "wall-clock time in a
// timezone" and absolute UTC instants, DST-aware, using only built-in Intl —
// no external date library needed.

/**
 * Offset in milliseconds between `timeZone` and UTC at the instant `date`.
 * Relationship: localWallTime = utcInstant + offset.
 */
function tzOffsetMs(timeZone: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const p: Record<string, string> = {};
  for (const part of dtf.formatToParts(date)) p[part.type] = part.value;
  const asUTC = Date.UTC(
    Number(p.year), Number(p.month) - 1, Number(p.day),
    Number(p.hour), Number(p.minute), Number(p.second),
  );
  return asUTC - date.getTime();
}

/**
 * Convert a wall-clock time (year/month/day/hour/minute as read on a clock in
 * `timeZone`) into the matching absolute UTC Date. Two-pass so it stays correct
 * across daylight-saving transitions.
 */
export function zonedWallTimeToUtc(
  y: number, m: number, d: number, hh: number, mm: number, timeZone: string,
): Date {
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const offset1 = tzOffsetMs(timeZone, new Date(guess));
  let utc = guess - offset1;
  const offset2 = tzOffsetMs(timeZone, new Date(utc));
  if (offset2 !== offset1) utc = guess - offset2;
  return new Date(utc);
}

/** The calendar Y/M/D and weekday (0=Sun..6=Sat) of `date` as seen in `timeZone`. */
export function zonedDateParts(timeZone: string, date: Date): {
  year: number; month: number; day: number; weekday: number;
} {
  const p: Record<string, string> = {};
  for (const part of new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
  }).formatToParts(date)) p[part.type] = part.value;
  const y = Number(p.year), m = Number(p.month), d = Number(p.day);
  // Weekday of that calendar date (tz-independent once we know Y/M/D).
  const weekday = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
  return { year: y, month: m, day: d, weekday };
}
