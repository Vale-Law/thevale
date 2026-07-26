import { format, startOfDay, addDays, isSameDay } from 'date-fns';

export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export function maskName(fullName) {
  if (!fullName) return 'Anonymous';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export function nextAvailableLabel(attorney) {
  const slots = attorney.available_slots || [];
  if (!slots.length) return null;
  const d = new Date(slots[0]);
  if (isNaN(d)) return null;
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const day = startOfDay(d);
  if (isSameDay(day, today)) return 'today';
  if (isSameDay(day, tomorrow)) return 'tomorrow';
  return format(d, 'EEE, MMM d');
}

export function groupSlotsByDay(slots) {
  const map = new Map();
  (slots || []).forEach((s) => {
    const d = new Date(s);
    if (isNaN(d)) return;
    const key = startOfDay(d).getTime();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  });
  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([ts, arr]) => ({ day: new Date(ts), slots: arr.sort((a, b) => new Date(a) - new Date(b)) }));
}