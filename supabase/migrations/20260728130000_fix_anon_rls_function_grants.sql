-- Fix: anonymous visitors saw zero attorneys (public browse/profiles broken).
--
-- 20260728080000_track_a_fix_firm_members_rls_recursion.sql rewrote the
-- attorneys select policy to add `or firm_id in (select public.my_firm_ids())`
-- while also revoking EXECUTE on my_firm_ids() from anon. Postgres evaluates
-- the whole policy expression for anon sessions too, hits the function it is
-- not allowed to call, and the entire select errors with "permission denied
-- for function my_firm_ids" -- so the public site got an error instead of the
-- verified roster. Authenticated users were unaffected (the function is
-- granted to `authenticated`), which is why the portal kept working and this
-- went unnoticed.
--
-- Granting anon EXECUTE is safe: both functions filter firm_members by
-- auth.uid(), which is null for anon, so they return an empty set -- anon
-- gains no visibility it didn't already have via the
-- `verification_status = 'verified'` arm of the policy. The grant just stops
-- the policy expression from erroring. my_owner_firm_ids() gets the same
-- grant so no other policy referencing it can hit the same failure mode.
--
-- add_firm_staff_by_email(text) deliberately keeps its anon revoke: it is a
-- mutating RPC called directly (not referenced by any policy), so the
-- original security reasoning there still holds.

begin;

grant execute on function public.my_firm_ids() to anon;
grant execute on function public.my_owner_firm_ids() to anon;

commit;
