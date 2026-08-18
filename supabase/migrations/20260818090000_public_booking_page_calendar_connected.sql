-- Calendar truth for the browser fallback path.
--
-- BookingPage.jsx falls back to computing slots in the browser from
-- get_public_booking_page when GET /api/availability is unavailable. That
-- fallback can only see weekly hours + Brief bookings -- it has no way to
-- apply Google/Microsoft free/busy (the encrypted refresh token is
-- server-only, by design). If the attorney HAS a connected external
-- calendar, weekly-only hours would be invented availability, so the
-- fallback must fail closed instead.
--
-- Expose one boolean: does this attorney have any calendar connection that
-- isn't disconnected? No provider details, no busy ranges, no event data --
-- just enough for the public page to decide between "compute weekly hours"
-- and "show an honest empty state". Everything else is unchanged from
-- 20260729010000_public_booking_page_rpc.sql.

create or replace function public.get_public_booking_page(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $fn$
  select jsonb_build_object(
    'attorney_id', a.id,
    'working_hours', r.working_hours,
    'buffer_minutes', r.buffer_minutes,
    'min_notice_hours', r.min_notice_hours,
    'daily_cap', r.daily_cap,
    'timezone', r.timezone,
    'calendar_connected', exists (
      select 1
      from public.attorney_calendar_connections c
      where c.attorney_id = a.id
        and c.status <> 'disconnected'
    ),
    'booked', coalesce((
      select jsonb_agg(jsonb_build_object('start', b.slot_start, 'end', b.slot_end))
      from public.bookings b
      where b.attorney_id = a.id
        and b.status in ('pending', 'confirmed')
        and b.slot_start is not null
    ), '[]'::jsonb)
  )
  from public.attorneys a
  left join public.attorney_availability_rules r on r.attorney_id = a.id
  where a.slug = p_slug
    and a.verification_status = 'verified'
    and a.booking_page_published
$fn$;

revoke all on function public.get_public_booking_page(text) from public;
grant execute on function public.get_public_booking_page(text) to anon, authenticated;
