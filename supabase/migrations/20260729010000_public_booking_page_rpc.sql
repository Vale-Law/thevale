-- Public booking-page data RPC.
--
-- The /book/:slug page gets its open slots from GET /api/availability, which
-- needs SUPABASE_SERVICE_ROLE_KEY on the serverless side (RLS on
-- attorney_availability_rules is owner/admin-only). In environments where
-- that key isn't configured the endpoint 503s and the page showed
-- "No open times right now" even when the attorney had availability set.
--
-- This function is the anon-safe read path: it exposes ONLY what the public
-- booking page needs (the availability rule + already-booked ranges), and
-- ONLY for attorneys that are verified AND have published their booking
-- page. The frontend computes slots from it with the same
-- src/lib/availability.js engine the API uses (Google free/busy merging
-- stays API-only, since it needs the encrypted refresh token).

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
