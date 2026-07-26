-- Fix: infinite RLS recursion on any select touching profiles/attorneys.
--
-- Every admin check was written as an inline
--   exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
-- inside RLS policies. profiles' own select policy contains that same
-- subquery, so evaluating it re-triggers the profiles policy and Postgres
-- aborts with "42P17: infinite recursion detected in policy for relation
-- profiles". In practice that broke *every* select on profiles (including a
-- user reading their own profile) and every select on attorneys/bookings/etc.
-- whose policies embed the admin check — the public attorney directory
-- included.
--
-- Standard fix: move the admin check into a security definer function, which
-- reads profiles as the function owner and therefore skips RLS, breaking the
-- cycle. Policies keep identical semantics.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- profiles ----------
drop policy "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using ((select auth.uid()) = id or (select public.is_admin()));

-- ---------- attorneys ----------
drop policy "attorneys_select" on public.attorneys;
create policy "attorneys_select"
  on public.attorneys for select
  using (
    verification_status = 'verified'
    or user_id = (select auth.uid())
    or (select public.is_admin())
  );

drop policy "attorneys_update" on public.attorneys;
create policy "attorneys_update"
  on public.attorneys for update
  using (user_id = (select auth.uid()) or (select public.is_admin()))
  with check (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy "attorneys_delete_admin" on public.attorneys;
create policy "attorneys_delete_admin"
  on public.attorneys for delete
  using ((select public.is_admin()));

-- ---------- bookings ----------
drop policy "bookings_select" on public.bookings;
create policy "bookings_select"
  on public.bookings for select
  using (
    client_id = (select auth.uid())
    or attorney_id in (select id from public.attorneys where user_id = (select auth.uid()))
    or (select public.is_admin())
  );

drop policy "bookings_update" on public.bookings;
create policy "bookings_update"
  on public.bookings for update
  using (
    client_id = (select auth.uid())
    or attorney_id in (select id from public.attorneys where user_id = (select auth.uid()))
    or (select public.is_admin())
  )
  with check (
    client_id = (select auth.uid())
    or attorney_id in (select id from public.attorneys where user_id = (select auth.uid()))
    or (select public.is_admin())
  );

drop policy "bookings_delete_admin" on public.bookings;
create policy "bookings_delete_admin"
  on public.bookings for delete
  using ((select public.is_admin()));

-- ---------- waitlist ----------
drop policy "waitlist_select_admin" on public.waitlist;
create policy "waitlist_select_admin"
  on public.waitlist for select
  using ((select public.is_admin()));

drop policy "waitlist_update_admin" on public.waitlist;
create policy "waitlist_update_admin"
  on public.waitlist for update
  using ((select public.is_admin()));

-- ---------- reviews ----------
drop policy "reviews_insert_admin" on public.reviews;
create policy "reviews_insert_admin"
  on public.reviews for insert
  with check ((select public.is_admin()));

drop policy "reviews_delete_admin" on public.reviews;
create policy "reviews_delete_admin"
  on public.reviews for delete
  using ((select public.is_admin()));

-- ---------- storage ----------
drop policy "attorney_documents_admin_read" on storage.objects;
create policy "attorney_documents_admin_read"
  on storage.objects for select
  using (bucket_id = 'attorney-documents' and (select public.is_admin()));

-- protect_attorney_verification_fields() also embedded the same profiles
-- lookup; it already runs security definer so it wasn't part of the recursion,
-- but route it through is_admin() for consistency.
create or replace function public.protect_attorney_verification_fields()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    new.verification_status := old.verification_status;
    new.verified := old.verified;
    new.verified_date := old.verified_date;
    new.board_cert_approved := old.board_cert_approved;
  end if;
  return new;
end;
$$;
