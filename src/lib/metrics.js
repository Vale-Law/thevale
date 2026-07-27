// Real, source-traceable dashboard metrics. Every number here is computed
// directly from the attorney's own bookings — nothing estimated, nothing
// profile-derived (attorney.rating/review_count used to sit alongside real
// counts on this dashboard; that was a correction, not an addition).
import { startOfWeek, endOfWeek, subWeeks, isWithinInterval } from 'date-fns';

function slotOf(b) {
  return b.slot_start || b.slot;
}

export function computeMetrics(bookings) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const thisWeek = bookings.filter((b) => {
    const s = slotOf(b);
    return s && isWithinInterval(new Date(s), { start: weekStart, end: weekEnd });
  });

  // "Decided" bookings are the ones a confirmation/no-show rate can be
  // computed over — pending requests haven't been decided yet, so they're
  // excluded rather than counted as failures.
  const decided = bookings.filter((b) => ['confirmed', 'completed', 'declined', 'no_show'].includes(b.status));
  const confirmedOrCompleted = bookings.filter((b) => ['confirmed', 'completed'].includes(b.status));
  const noShows = bookings.filter((b) => b.status === 'no_show');
  const heldAppointments = bookings.filter((b) => ['confirmed', 'completed', 'no_show'].includes(b.status));

  const confirmationRate = decided.length > 0 ? confirmedOrCompleted.length / decided.length : null;
  const noShowRate = heldAppointments.length > 0 ? noShows.length / heldAppointments.length : null;

  const weeks = [];
  for (let i = 7; i >= 0; i--) {
    const start = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
    const end = endOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
    const count = bookings.filter((b) => {
      const s = slotOf(b);
      return s && isWithinInterval(new Date(s), { start, end });
    }).length;
    weeks.push({ label: `${start.getMonth() + 1}/${start.getDate()}`, count });
  }
  const hasAnyHistory = weeks.some((w) => w.count > 0);

  return {
    thisWeekCount: thisWeek.length,
    hasBookings: bookings.length > 0,
    confirmationRate,
    noShowRate,
    weeks,
    hasAnyHistory,
  };
}
