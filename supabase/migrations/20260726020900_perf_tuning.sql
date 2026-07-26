-- Addresses Supabase advisor warnings on the initial schema:
-- 1) wrap auth.uid() calls as (select auth.uid()) so Postgres evaluates
--    them once per statement instead of once per row
-- 2) consolidate multiple permissive policies per table/action into one
-- 3) index the one unindexed foreign key it flagged
--
-- Applied to Supabase project "the-vale" (gzmdsyuqhegcesoekuoo) on 2026-07-26.

-- ---------- profiles ----------
drop policy "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using ((select auth.uid()) = id or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

drop policy "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ---------- attorneys ----------
drop policy "attorneys_select_public_verified" on public.attorneys;
drop policy "attorneys_select_own" on public.attorneys;
drop policy "attorneys_select_admin" on public.attorneys;
create policy "attorneys_select"
  on public.attorneys for select
  using (
    verification_status = 'verified'
    or user_id = (select auth.uid())
    or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
  );

drop policy "attorneys_insert_own" on public.attorneys;
create policy "attorneys_insert_own"
  on public.attorneys for insert
  with check (user_id = (select auth.uid()));

drop policy "attorneys_update_own" on public.attorneys;
drop policy "attorneys_update_admin" on public.attorneys;
create policy "attorneys_update"
  on public.attorneys for update
  using (
    user_id = (select auth.uid())
    or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
  )
  with check (
    user_id = (select auth.uid())
    or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
  );

drop policy "attorneys_delete_admin" on public.attorneys;
create policy "attorneys_delete_admin"
  on public.attorneys for delete
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

-- ---------- bookings ----------
drop policy "bookings_select_client" on public.bookings;
drop policy "bookings_select_attorney" on public.bookings;
drop policy "bookings_select_admin" on public.bookings;
create policy "bookings_select"
  on public.bookings for select
  using (
    client_id = (select auth.uid())
    or attorney_id in (select id from public.attorneys where user_id = (select auth.uid()))
    or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
  );

drop policy "bookings_insert_client" on public.bookings;
create policy "bookings_insert_client"
  on public.bookings for insert
  with check (client_id = (select auth.uid()));

drop policy "bookings_update_client" on public.bookings;
drop policy "bookings_update_attorney" on public.bookings;
drop policy "bookings_update_admin" on public.bookings;
create policy "bookings_update"
  on public.bookings for update
  using (
    client_id = (select auth.uid())
    or attorney_id in (select id from public.attorneys where user_id = (select auth.uid()))
    or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
  )
  with check (
    client_id = (select auth.uid())
    or attorney_id in (select id from public.attorneys where user_id = (select auth.uid()))
    or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
  );

drop policy "bookings_delete_admin" on public.bookings;
create policy "bookings_delete_admin"
  on public.bookings for delete
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

-- ---------- case_summaries ----------
drop policy "case_summaries_select_own" on public.case_summaries;
create policy "case_summaries_select_own"
  on public.case_summaries for select
  using (created_by_id = (select auth.uid()));

drop policy "case_summaries_insert_own" on public.case_summaries;
create policy "case_summaries_insert_own"
  on public.case_summaries for insert
  with check (created_by_id = (select auth.uid()));

drop policy "case_summaries_update_own" on public.case_summaries;
create policy "case_summaries_update_own"
  on public.case_summaries for update
  using (created_by_id = (select auth.uid()))
  with check (created_by_id = (select auth.uid()));

drop policy "case_summaries_delete_own" on public.case_summaries;
create policy "case_summaries_delete_own"
  on public.case_summaries for delete
  using (created_by_id = (select auth.uid()));

create index case_summaries_created_by_id_idx on public.case_summaries(created_by_id);

-- ---------- waitlist ----------
drop policy "waitlist_select_admin" on public.waitlist;
create policy "waitlist_select_admin"
  on public.waitlist for select
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

drop policy "waitlist_update_admin" on public.waitlist;
create policy "waitlist_update_admin"
  on public.waitlist for update
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

-- ---------- reviews ----------
drop policy "reviews_insert_admin" on public.reviews;
create policy "reviews_insert_admin"
  on public.reviews for insert
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

drop policy "reviews_delete_admin" on public.reviews;
create policy "reviews_delete_admin"
  on public.reviews for delete
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));
