-- Wave 0: the replacement admin path (money-loop audit 2026-08-15).
-- NOT yet applied to production — owner applies with the service role /
-- postgres. With the AdminEntry self-promote button removed and
-- profiles.role pinned by trigger, this grant is the ONLY way an account
-- becomes admin.
--
-- Idempotent: re-running it is a no-op once the grant exists. The email
-- lives on auth.users (profiles.email is a later, optional mirror), so
-- the match joins auth.users. If no auth user with this email exists yet,
-- the update touches zero rows — by design it does not seed a user; run
-- it again after the founder has signed up.
--
-- Runs as postgres/service role, where auth.uid() is null, so the
-- protect_profiles_role trigger added in 20260815170000 lets it through.

update public.profiles p
set role = 'admin'
from auth.users u
where u.id = p.id
  and lower(u.email) = 'studio@faajistudios.com'
  and p.role is distinct from 'admin';
