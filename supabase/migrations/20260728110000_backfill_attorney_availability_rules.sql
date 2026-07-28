-- Backfill attorney_availability_rules for every attorney missing a row.
--
-- src/lib/availability.js computes real bookable slots from this table
-- (working hours minus already-booked ranges) -- it's a working engine,
-- not a stub. But only 1 of 9 seeded attorneys had a row, so the real
-- booking engine had nothing to offer for the other 8: Browse still showed
-- them as available because attorneys.available_slots (a separate, legacy
-- text[] column from supabase/seed.sql) is what those cards read, but an
-- actual booking attempt against the live engine came up empty. This is a
-- data gap, not a code gap.
--
-- Inserts a standard Mon-Fri 9am-5pm week, in the attorney's own state's
-- timezone, for any attorney that doesn't already have a rule. Idempotent
-- and re-runnable: it only targets attorneys with no existing row, so it
-- can never overwrite a real attorney's actual configured hours.

begin;

insert into public.attorney_availability_rules (attorney_id, working_hours, timezone)
select
  a.id,
  '{
    "mon": [["09:00","17:00"]],
    "tue": [["09:00","17:00"]],
    "wed": [["09:00","17:00"]],
    "thu": [["09:00","17:00"]],
    "fri": [["09:00","17:00"]]
  }'::jsonb,
  case a.state
    when 'CT' then 'America/New_York'
    when 'ME' then 'America/New_York'
    when 'MA' then 'America/New_York'
    when 'NH' then 'America/New_York'
    when 'RI' then 'America/New_York'
    when 'VT' then 'America/New_York'
    when 'NJ' then 'America/New_York'
    when 'NY' then 'America/New_York'
    when 'PA' then 'America/New_York'
    when 'DE' then 'America/New_York'
    when 'MD' then 'America/New_York'
    when 'DC' then 'America/New_York'
    when 'VA' then 'America/New_York'
    when 'WV' then 'America/New_York'
    when 'NC' then 'America/New_York'
    when 'SC' then 'America/New_York'
    when 'GA' then 'America/New_York'
    when 'FL' then 'America/New_York'
    when 'OH' then 'America/New_York'
    when 'MI' then 'America/New_York'
    when 'IN' then 'America/Indiana/Indianapolis'
    when 'KY' then 'America/New_York'
    when 'IL' then 'America/Chicago'
    when 'WI' then 'America/Chicago'
    when 'MN' then 'America/Chicago'
    when 'IA' then 'America/Chicago'
    when 'MO' then 'America/Chicago'
    when 'AR' then 'America/Chicago'
    when 'LA' then 'America/Chicago'
    when 'MS' then 'America/Chicago'
    when 'AL' then 'America/Chicago'
    when 'TN' then 'America/Chicago'
    when 'OK' then 'America/Chicago'
    when 'TX' then 'America/Chicago'
    when 'KS' then 'America/Chicago'
    when 'NE' then 'America/Chicago'
    when 'SD' then 'America/Chicago'
    when 'ND' then 'America/Chicago'
    when 'CO' then 'America/Denver'
    when 'WY' then 'America/Denver'
    when 'MT' then 'America/Denver'
    when 'UT' then 'America/Denver'
    when 'NM' then 'America/Denver'
    when 'AZ' then 'America/Phoenix'
    when 'ID' then 'America/Boise'
    when 'WA' then 'America/Los_Angeles'
    when 'OR' then 'America/Los_Angeles'
    when 'CA' then 'America/Los_Angeles'
    when 'NV' then 'America/Los_Angeles'
    when 'AK' then 'America/Anchorage'
    when 'HI' then 'Pacific/Honolulu'
    else 'America/New_York'
  end
from public.attorneys a
where not exists (
  select 1 from public.attorney_availability_rules ar where ar.attorney_id = a.id
);

commit;
