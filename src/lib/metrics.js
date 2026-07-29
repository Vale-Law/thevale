// Real, source-traceable dashboard metrics. Every number here is computed
// directly from the attorney's own bookings — nothing estimated, nothing
// profile-derived (attorney.rating/review_count used to sit alongside real
// counts on this dashboard; that was a correction, not an addition).
import { startOfWeek, endOfWeek, subWeeks, subDays, startOfDay, isWithinInterval, format } from 'date-fns';

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

  // Upcoming this week: scheduled (not declined/cancelled/disputed), slot
  // still ahead of now, falling within the current calendar week.
  const upcomingThisWeek = bookings.filter((b) => {
    const s = slotOf(b);
    if (!s) return false;
    const d = new Date(s);
    return d >= now && isWithinInterval(d, { start: weekStart, end: weekEnd })
      && !['declined', 'disputed'].includes(b.status);
  }).length;

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
    upcomingThisWeek,
    weeks,
    hasAnyHistory,
  };
}

// Booking-volume series over a caller-selected window, for the dashboard's
// range-toggle chart. Pure client-side reshaping of the same `bookings`
// array the page already fetched — no new query, no new data source.
export function seriesForRange(bookings, range) {
  const now = new Date();
  if (range === 'weeks') {
    const weeks = 8;
    const out = [];
    for (let i = weeks - 1; i >= 0; i--) {
      const start = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const end = endOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const count = bookings.filter((b) => {
        const s = slotOf(b);
        return s && isWithinInterval(new Date(s), { start, end });
      }).length;
      out.push({ label: format(start, 'M/d'), count });
    }
    return out;
  }
  const days = range === '7d' ? 7 : range === '2w' ? 14 : 30;
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = startOfDay(subDays(now, i));
    const next = new Date(day); next.setDate(day.getDate() + 1);
    const count = bookings.filter((b) => {
      const s = slotOf(b);
      return s && new Date(s) >= day && new Date(s) < next;
    }).length;
    let label = '';
    if (range === '7d') label = format(day, 'EEE');
    else if (range === '2w') label = i % 2 === 0 ? format(day, 'M/d') : '';
    else label = i % 5 === 0 ? format(day, 'M/d') : '';
    out.push({ label, count });
  }
  return out;
}

// -- Right-column dashboard cards: all pure functions over the same
// `bookings`/`attorney` the page already has. No new queries.

export function confirmationRateThisWeek(bookings) {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 });
  const end = endOfWeek(now, { weekStartsOn: 1 });
  const week = bookings.filter((b) => {
    const s = slotOf(b);
    return s && isWithinInterval(new Date(s), { start, end });
  });
  const confirmed = week.filter((b) => b.status === 'confirmed').length;
  const total = week.length;
  return { total, confirmed, rate: total ? Math.round((confirmed / total) * 100) : 0 };
}

export function completedSummary(bookings) {
  const done = bookings.filter((b) => b.status === 'completed').length;
  const noShow = bookings.filter((b) => b.status === 'no_show').length;
  const scheduled = bookings.filter((b) => ['completed', 'no_show', 'confirmed'].includes(b.status)).length;
  const denom = done + noShow;
  const rate = denom ? Math.round((done / denom) * 100) : 0;
  return { done, scheduled, rate };
}

export function avgConsultsPerWeek(bookings) {
  const dates = bookings.map((b) => { const s = slotOf(b); return s ? new Date(s) : null; }).filter(Boolean).sort((a, b) => a - b);
  if (!dates.length) return 0;
  if (dates.length === 1) return 1;
  const spanDays = Math.max(1, (dates[dates.length - 1] - dates[0]) / 86400000);
  const weeks = Math.max(1, spanDays / 7);
  return Math.round((dates.length / weeks) * 10) / 10;
}

export function weeklyTasks(bookings, attorney) {
  const pending = bookings.filter((b) => b.status === 'pending').length;
  const now = new Date();
  const upcoming = bookings.filter((b) => {
    const s = slotOf(b);
    return s && new Date(s) >= now && !['declined', 'disputed'].includes(b.status);
  }).length;
  const openSlots = (attorney?.available_slots || []).filter((s) => new Date(s) >= now).length;
  const profileOk = !!(attorney?.bio && attorney?.photo && attorney?.office_location && attorney?.consult_fee);
  const hasPhoto = !!attorney?.photo;
  return [
    { key: 'pending', label: 'Confirm pending consultations', done: pending === 0, note: pending > 0 ? `${pending} waiting` : 'All caught up' },
    { key: 'availability', label: 'Set availability for next week', done: openSlots > 0, note: openSlots > 0 ? `${openSlots} slots open` : 'No open slots' },
    { key: 'profile', label: 'Complete your profile', done: profileOk, note: profileOk ? 'Profile complete' : 'Add your details' },
    { key: 'photo', label: 'Add a profile photo', done: hasPhoto, note: hasPhoto ? 'Photo added' : 'No photo yet' },
    { key: 'upcoming', label: 'Review upcoming consults', done: upcoming === 0, note: upcoming > 0 ? `${upcoming} upcoming` : 'Nothing upcoming' },
  ];
}
