-- Public attorney profile data for the /book/:slug page's new profile
-- card. BookingPage.jsx previously read `attorneys` directly (relying on
-- the attorneys_select_public_verified row policy) and had no path at
-- all to the attorney's firm name, since `firms` has no public row
-- policy (firms_select_own is owner-only). Rather than open `firms` up,
-- this mirrors get_public_booking_page's existing pattern: a narrow,
-- security-definer function that returns only the public-safe fields the
-- booking page actually shows, joining firms server-side.

create or replace function public.get_public_attorney_profile(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $fn$
  select jsonb_build_object(
    'id', a.id,
    'name', a.name,
    'photo', a.photo,
    'bio', a.bio,
    'practice_area', a.practice_area,
    'practice_areas', a.practice_areas,
    'office_location', a.office_location,
    'consult_fee', a.consult_fee,
    'verification_status', a.verification_status,
    'booking_page_published', a.booking_page_published,
    'firm_name', f.name
  )
  from public.attorneys a
  left join public.firms f on f.id = a.firm_id
  where a.slug = p_slug
    and a.verification_status = 'verified'
    and a.booking_page_published
$fn$;

revoke all on function public.get_public_attorney_profile(text) from public;
grant execute on function public.get_public_attorney_profile(text) to anon, authenticated;
