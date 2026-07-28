-- Track A / Sprint v1.2 W0b: minimal admin-side "add staff to firm" action.
--
-- Per D4 (Development Sprint v1.2 Section 5): staff accounts are added by an
-- existing firm owner (an attorney), not via a self-service email invite --
-- there is no token/invite infrastructure this sprint. The added person
-- must already have a Brief account (any role that isn't already
-- 'admin'/'attorney'); this function only grants them firm membership and
-- flips their profile role to 'staff' so deriveRole() in AuthContext.jsx
-- picks it up on their next load.
--
-- security definer is required because the caller (an attorney) cannot read
-- another user's profiles row by email under profiles' existing RLS
-- (`(select auth.uid()) = id or is_admin()`) -- the function does its own
-- explicit "caller is a firm owner" check before touching anything, so this
-- does not broaden what a non-owner can do.
create or replace function public.add_firm_staff_by_email(p_email text)
returns table(ok boolean, reason text)
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_firm_id uuid;
  target_user_id uuid;
  target_role text;
  target_account_type text;
begin
  select fm.firm_id into caller_firm_id
  from public.firm_members fm
  where fm.user_id = (select auth.uid()) and fm.role = 'owner'
  limit 1;

  if caller_firm_id is null then
    return query select false, 'not_firm_owner';
    return;
  end if;

  select p.id, p.role, p.account_type into target_user_id, target_role, target_account_type
  from public.profiles p
  where lower(p.email) = lower(trim(p_email))
  limit 1;

  if target_user_id is null then
    return query select false, 'no_account_found';
    return;
  end if;

  -- Checked against both fields: AttorneyApplication.jsx sets role='attorney'
  -- alongside account_type='attorney' at application time, but
  -- deriveRole() in AuthContext.jsx treats account_type as the source of
  -- truth for the attorney role -- check both so this can't be bypassed by
  -- a future path that only sets one.
  if target_role = 'admin' or target_account_type = 'attorney' then
    return query select false, 'ineligible_role';
    return;
  end if;

  if exists (
    select 1 from public.firm_members
    where firm_id = caller_firm_id and user_id = target_user_id
  ) then
    return query select false, 'already_member';
    return;
  end if;

  insert into public.firm_members (firm_id, user_id, role)
  values (caller_firm_id, target_user_id, 'staff');

  update public.profiles set role = 'staff' where id = target_user_id;

  return query select true, 'added';
end;
$$;

-- Supabase auto-grants EXECUTE on every new public-schema function to
-- anon/authenticated/service_role via default privileges -- `revoke ...
-- from public` does NOT undo that direct per-role grant, so anon needs an
-- explicit revoke or an unauthenticated request could add firm staff.
revoke all on function public.add_firm_staff_by_email(text) from public;
revoke execute on function public.add_firm_staff_by_email(text) from anon;
grant execute on function public.add_firm_staff_by_email(text) to authenticated;
