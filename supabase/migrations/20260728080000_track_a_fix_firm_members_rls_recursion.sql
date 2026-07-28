-- Fix: infinite RLS recursion on firm_members, plus a missing firm-membership
-- read grant on attorneys -- both discovered while verifying Track A W0b's
-- staff-pipeline gate against real RLS behavior with two synthetic firms
-- (not just reading the migration file -- see Development Sprint v1.2's own
-- operating rule 6: trace it through code, don't just eyeball it).
--
-- firm_members_select_same_firm/insert_owner/delete_owner (added in
-- 20260727050000_firm_staff_model_and_audit_trail.sql) each embed
--   firm_id in (select firm_id from public.firm_members where user_id = ...)
-- inside firm_members' OWN policy. Evaluating that inner subquery requires
-- applying firm_members' RLS to itself, which re-triggers the same policy,
-- which Postgres detects and aborts with "42P17: infinite recursion
-- detected in policy for relation firm_members". This breaks every query
-- that touches firm_members at all -- including its own SELECT, and every
-- other table's policy that joins through it (bookings, consultation_charges,
-- attorney_calendar_connections, attorney_availability_rules,
-- booking_staff_notes, email_schedule) -- exactly the same class of bug
-- 20260726030000_fix_rls_recursion.sql already fixed for profiles/is_admin().
--
-- Same fix: move the self-lookup into a security definer function, which
-- reads firm_members as the function owner and therefore skips RLS,
-- breaking the cycle. Policy semantics are unchanged.
create or replace function public.my_firm_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select firm_id from public.firm_members where user_id = (select auth.uid())
$$;

create or replace function public.my_owner_firm_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select firm_id from public.firm_members where user_id = (select auth.uid()) and role = 'owner'
$$;

revoke all on function public.my_firm_ids() from public;
revoke execute on function public.my_firm_ids() from anon;
grant execute on function public.my_firm_ids() to authenticated;

revoke all on function public.my_owner_firm_ids() from public;
revoke execute on function public.my_owner_firm_ids() from anon;
grant execute on function public.my_owner_firm_ids() to authenticated;

drop policy "firm_members_select_same_firm" on public.firm_members;
create policy "firm_members_select_same_firm"
  on public.firm_members for select
  using (
    firm_id in (select public.my_firm_ids())
    or (select public.is_admin())
  );

drop policy "firm_members_insert_owner" on public.firm_members;
create policy "firm_members_insert_owner"
  on public.firm_members for insert
  with check (
    firm_id in (select public.my_owner_firm_ids())
    or (select public.is_admin())
  );

drop policy "firm_members_delete_owner" on public.firm_members;
create policy "firm_members_delete_owner"
  on public.firm_members for delete
  using (
    firm_id in (select public.my_owner_firm_ids())
    or (select public.is_admin())
  );

-- ============================================================
-- attorneys never got a firm-membership read grant when
-- 20260727050000_firm_staff_model_and_audit_trail.sql re-scoped bookings,
-- attorney_calendar_connections, attorney_availability_rules,
-- booking_staff_notes, and email_schedule from "attorney owns row" to
-- "firm membership" -- attorneys itself was left on the older
-- verified-or-own-row-or-admin policy from 20260726030000_fix_rls_recursion.sql.
-- Without this, a staff/co-attorney firm member's
-- `attorneys JOIN firm_members` query (AuthContext.jsx's loadFirmFor, and
-- every bookings-by-firm read built on top of it) silently returns zero
-- rows for every unverified attorney in the firm -- confirmed by the same
-- synthetic two-firm test that caught the recursion bug above.
-- ============================================================
drop policy "attorneys_select" on public.attorneys;
create policy "attorneys_select"
  on public.attorneys for select
  using (
    verification_status = 'verified'
    or user_id = (select auth.uid())
    or firm_id in (select public.my_firm_ids())
    or (select public.is_admin())
  );
