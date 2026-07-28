-- Refresh attorneys.available_slots from attorney_availability_rules.
--
-- The directory booking panel (src/components/attorney/BookingPanel.jsx and
-- the mobile BookingWidget) renders its clickable time slots from the legacy
-- attorneys.available_slots text[] column, which seed.sql populated relative
-- to the day the seed ran -- so the slots age out within a week and the
-- panel decays toward "nothing to click". The real availability engine
-- (attorney_availability_rules + src/lib/availability.js) only feeds the
-- /book/:slug page, not the directory panel.
--
-- Until the directory panel is wired to the real engine, regenerate the
-- legacy column FROM the rules: 4 slots per weekday (9am, 11am, 2pm, 4pm
-- local) for the next 14 days, in each attorney's own rule timezone,
-- formatted exactly like seed.sql's slots ('YYYY-MM-DDTHH24:MI:SS+00:00',
-- UTC) since the frontend parses them with `new Date(slot)`.
--
-- Re-runnable by design: it recomputes from current_date each run, so
-- re-running simply refreshes the window forward. Only attorneys that have
-- an availability rule are touched.

begin;

update public.attorneys a
set available_slots = coalesce((
  select array_agg(
           to_char(s.slot_utc at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"+00:00"')
           order by s.slot_utc)
  from (
    select ((current_date + d) + make_time(h, 0, 0)) at time zone r.timezone as slot_utc
    from generate_series(1, 14) d,
         unnest(array[9, 11, 14, 16]) h
    where extract(isodow from current_date + d) < 6
  ) s
  where s.slot_utc > now()
), '{}')
from public.attorney_availability_rules r
where r.attorney_id = a.id;

commit;
