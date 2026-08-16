-- Wave 0: the one sanctioned admin-grant path, replacing AdminEntry.jsx's
-- deleted self-promote button. Runs as postgres/service_role only (a user
-- JWT can't reach this — and the protect_profiles_role trigger from
-- 20260816000000 would reject it anyway; migrations run as postgres, which
-- that trigger's elevated branch allows).
--
-- Idempotent: re-running when the founder is already admin is a no-op.
-- Joins auth.users because profiles carries no guaranteed-synced email;
-- auth.users is the identity source of truth. If the founder has an auth
-- user but no profiles row yet, this deliberately does NOT seed one —
-- profiles rows are created by the normal signup path; report and re-run
-- after first login instead.
do $$
declare
  founder_id uuid;
begin
  select u.id into founder_id
  from auth.users u
  where lower(u.email) = 'studio@faajistudios.com'
  order by u.created_at
  limit 1;

  if founder_id is null then
    raise notice 'wave0 founder grant: no auth.users row for studio@faajistudios.com; nothing granted.';
    return;
  end if;

  update public.profiles
  set role = 'admin'
  where id = founder_id
    and role is distinct from 'admin';

  if found then
    raise notice 'wave0 founder grant: studio@faajistudios.com is now admin.';
  elsif exists (select 1 from public.profiles where id = founder_id and role = 'admin') then
    raise notice 'wave0 founder grant: studio@faajistudios.com was already admin; no-op.';
  else
    raise notice 'wave0 founder grant: auth user exists but has no profiles row; nothing granted (not seeding one).';
  end if;
end $$;
