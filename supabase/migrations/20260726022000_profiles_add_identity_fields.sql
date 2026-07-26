-- Base44's User entity carries platform-standard fields (email, full_name,
-- phone) alongside the custom fields already in profiles. Add them here
-- so admin/User.list(), updateMe({full_name}), updateMe({phone}) etc. work.

alter table public.profiles
  add column email text,
  add column full_name text,
  add column phone text;

-- Keep profiles.email in sync at signup time (auth.users isn't directly
-- queryable via the client API, so this is how admin user lists get email).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;
