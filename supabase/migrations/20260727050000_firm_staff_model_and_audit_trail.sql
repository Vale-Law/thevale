-- Firm/staff multi-tenancy model + booking status audit trail.
--
-- Resolves Track B's blocking escalations E1 (no firm/office-staff concept
-- exists, so the legal-assistant persona can't authenticate or see a
-- pipeline scoped correctly) and E6 (no audit-trail table for status
-- changes), both raised in docs/TRACK_B_MANIFEST.md before PR #6 shipped
-- pipeline code directly against attorney-owns-own-row RLS instead.
--
-- Applied to Supabase project "the-vale" (gzmdsyuqhegcesoekuoo).

-- ============================================================
-- Firms: the tenant boundary. A firm has one or more members (attorneys
-- and/or office staff) who can all see the firm's bookings/pipeline.
-- ============================================================
create table public.firms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.firms enable row level security;

create table public.firm_members (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','staff')),
  created_at timestamptz not null default now(),
  unique (firm_id, user_id)
);

create index firm_members_firm_id_idx on public.firm_members(firm_id);
create index firm_members_user_id_idx on public.firm_members(user_id);

alter table public.firm_members enable row level security;

create policy "firms_select_own"
  on public.firms for select
  using (
    id in (select firm_id from public.firm_members where user_id = (select auth.uid()))
    or (select public.is_admin())
  );

create policy "firms_update_owner"
  on public.firms for update
  using (
    id in (select firm_id from public.firm_members where user_id = (select auth.uid()) and role = 'owner')
    or (select public.is_admin())
  )
  with check (
    id in (select firm_id from public.firm_members where user_id = (select auth.uid()) and role = 'owner')
    or (select public.is_admin())
  );

create policy "firm_members_select_same_firm"
  on public.firm_members for select
  using (
    firm_id in (select firm_id from public.firm_members where user_id = (select auth.uid()))
    or (select public.is_admin())
  );

create policy "firm_members_insert_owner"
  on public.firm_members for insert
  with check (
    firm_id in (select firm_id from public.firm_members where user_id = (select auth.uid()) and role = 'owner')
    or (select public.is_admin())
  );

create policy "firm_members_delete_owner"
  on public.firm_members for delete
  using (
    firm_id in (select firm_id from public.firm_members where user_id = (select auth.uid()) and role = 'owner')
    or (select public.is_admin())
  );

-- ============================================================
-- attorneys.firm_id + profiles 'staff' role
-- ============================================================
alter table public.attorneys add column firm_id uuid references public.firms(id);

alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role = any (array['client','attorney','admin','user','staff']));

-- ============================================================
-- Backfill: every existing attorney gets its own firm, with the attorney
-- as 'owner'. This is additive only -- no existing access is narrowed,
-- since a solo attorney's firm has exactly one member (themselves) and
-- every RLS re-scope below is a superset of "attorney owns their own row"
-- for that single-member case.
-- ============================================================
do $$
declare
  r record;
  new_firm_id uuid;
begin
  for r in select id, user_id, name from public.attorneys where firm_id is null loop
    insert into public.firms (name) values (coalesce(r.name, 'Firm') || ' — Firm') returning id into new_firm_id;
    update public.attorneys set firm_id = new_firm_id where id = r.id;
    if r.user_id is not null then
      insert into public.firm_members (firm_id, user_id, role)
      values (new_firm_id, r.user_id, 'owner')
      on conflict (firm_id, user_id) do nothing;
    end if;
  end loop;
end $$;

-- ============================================================
-- Re-scope RLS: attorney-owns-own-row -> firm-membership.
-- Every "attorney_id in (select id from attorneys where user_id = auth.uid())"
-- pattern becomes "attorney_id in (select a.id from attorneys a join
-- firm_members fm on fm.firm_id = a.firm_id where fm.user_id = auth.uid())".
-- ============================================================

drop policy "bookings_select" on public.bookings;
create policy "bookings_select"
  on public.bookings for select
  using (
    client_id = (select auth.uid())
    or attorney_id in (
      select a.id from public.attorneys a
      join public.firm_members fm on fm.firm_id = a.firm_id
      where fm.user_id = (select auth.uid())
    )
    or (select public.is_admin())
  );

drop policy "bookings_update" on public.bookings;
create policy "bookings_update"
  on public.bookings for update
  using (
    client_id = (select auth.uid())
    or attorney_id in (
      select a.id from public.attorneys a
      join public.firm_members fm on fm.firm_id = a.firm_id
      where fm.user_id = (select auth.uid())
    )
    or (select public.is_admin())
  )
  with check (
    client_id = (select auth.uid())
    or attorney_id in (
      select a.id from public.attorneys a
      join public.firm_members fm on fm.firm_id = a.firm_id
      where fm.user_id = (select auth.uid())
    )
    or (select public.is_admin())
  );

drop policy "attorney_calendar_connections_select" on public.attorney_calendar_connections;
create policy "attorney_calendar_connections_select"
  on public.attorney_calendar_connections for select
  using (
    attorney_id in (
      select a.id from public.attorneys a
      join public.firm_members fm on fm.firm_id = a.firm_id
      where fm.user_id = (select auth.uid())
    )
    or (select public.is_admin())
  );

drop policy "attorney_calendar_connections_insert_own" on public.attorney_calendar_connections;
create policy "attorney_calendar_connections_insert_own"
  on public.attorney_calendar_connections for insert
  with check (
    attorney_id in (
      select a.id from public.attorneys a
      join public.firm_members fm on fm.firm_id = a.firm_id
      where fm.user_id = (select auth.uid())
    )
  );

drop policy "attorney_calendar_connections_update" on public.attorney_calendar_connections;
create policy "attorney_calendar_connections_update"
  on public.attorney_calendar_connections for update
  using (
    attorney_id in (
      select a.id from public.attorneys a
      join public.firm_members fm on fm.firm_id = a.firm_id
      where fm.user_id = (select auth.uid())
    )
    or (select public.is_admin())
  )
  with check (
    attorney_id in (
      select a.id from public.attorneys a
      join public.firm_members fm on fm.firm_id = a.firm_id
      where fm.user_id = (select auth.uid())
    )
    or (select public.is_admin())
  );

drop policy "attorney_calendar_connections_delete" on public.attorney_calendar_connections;
create policy "attorney_calendar_connections_delete"
  on public.attorney_calendar_connections for delete
  using (
    attorney_id in (
      select a.id from public.attorneys a
      join public.firm_members fm on fm.firm_id = a.firm_id
      where fm.user_id = (select auth.uid())
    )
    or (select public.is_admin())
  );

drop policy "attorney_availability_rules_select" on public.attorney_availability_rules;
create policy "attorney_availability_rules_select"
  on public.attorney_availability_rules for select
  using (
    attorney_id in (
      select a.id from public.attorneys a
      join public.firm_members fm on fm.firm_id = a.firm_id
      where fm.user_id = (select auth.uid())
    )
    or (select public.is_admin())
  );

drop policy "attorney_availability_rules_insert_own" on public.attorney_availability_rules;
create policy "attorney_availability_rules_insert_own"
  on public.attorney_availability_rules for insert
  with check (
    attorney_id in (
      select a.id from public.attorneys a
      join public.firm_members fm on fm.firm_id = a.firm_id
      where fm.user_id = (select auth.uid())
    )
  );

drop policy "attorney_availability_rules_update" on public.attorney_availability_rules;
create policy "attorney_availability_rules_update"
  on public.attorney_availability_rules for update
  using (
    attorney_id in (
      select a.id from public.attorneys a
      join public.firm_members fm on fm.firm_id = a.firm_id
      where fm.user_id = (select auth.uid())
    )
    or (select public.is_admin())
  )
  with check (
    attorney_id in (
      select a.id from public.attorneys a
      join public.firm_members fm on fm.firm_id = a.firm_id
      where fm.user_id = (select auth.uid())
    )
    or (select public.is_admin())
  );

drop policy "attorney_availability_rules_delete" on public.attorney_availability_rules;
create policy "attorney_availability_rules_delete"
  on public.attorney_availability_rules for delete
  using (
    attorney_id in (
      select a.id from public.attorneys a
      join public.firm_members fm on fm.firm_id = a.firm_id
      where fm.user_id = (select auth.uid())
    )
    or (select public.is_admin())
  );

drop policy "booking_staff_notes_select" on public.booking_staff_notes;
create policy "booking_staff_notes_select"
  on public.booking_staff_notes for select
  using (
    booking_id in (
      select id from public.bookings
      where attorney_id in (
        select a.id from public.attorneys a
        join public.firm_members fm on fm.firm_id = a.firm_id
        where fm.user_id = (select auth.uid())
      )
    )
    or (select public.is_admin())
  );

drop policy "booking_staff_notes_insert" on public.booking_staff_notes;
create policy "booking_staff_notes_insert"
  on public.booking_staff_notes for insert
  with check (
    booking_id in (
      select id from public.bookings
      where attorney_id in (
        select a.id from public.attorneys a
        join public.firm_members fm on fm.firm_id = a.firm_id
        where fm.user_id = (select auth.uid())
      )
    )
    or (select public.is_admin())
  );

drop policy "booking_staff_notes_update" on public.booking_staff_notes;
create policy "booking_staff_notes_update"
  on public.booking_staff_notes for update
  using (
    booking_id in (
      select id from public.bookings
      where attorney_id in (
        select a.id from public.attorneys a
        join public.firm_members fm on fm.firm_id = a.firm_id
        where fm.user_id = (select auth.uid())
      )
    )
    or (select public.is_admin())
  )
  with check (
    booking_id in (
      select id from public.bookings
      where attorney_id in (
        select a.id from public.attorneys a
        join public.firm_members fm on fm.firm_id = a.firm_id
        where fm.user_id = (select auth.uid())
      )
    )
    or (select public.is_admin())
  );

drop policy "booking_staff_notes_delete" on public.booking_staff_notes;
create policy "booking_staff_notes_delete"
  on public.booking_staff_notes for delete
  using (
    booking_id in (
      select id from public.bookings
      where attorney_id in (
        select a.id from public.attorneys a
        join public.firm_members fm on fm.firm_id = a.firm_id
        where fm.user_id = (select auth.uid())
      )
    )
    or (select public.is_admin())
  );

drop policy "email_schedule_select" on public.email_schedule;
create policy "email_schedule_select"
  on public.email_schedule for select
  using (
    booking_id in (
      select id from public.bookings
      where attorney_id in (
        select a.id from public.attorneys a
        join public.firm_members fm on fm.firm_id = a.firm_id
        where fm.user_id = (select auth.uid())
      )
    )
    or (select public.is_admin())
  );

-- ============================================================
-- Audit trail: every booking status transition, with actor + timestamp.
-- Written by firm members (staff/owner) from the browser client for
-- pipeline actions, and by service-role code (client token actions) for
-- confirm/cancel/reschedule -- service role bypasses RLS regardless.
-- ============================================================
create table public.booking_status_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  from_status text,
  to_status text not null,
  actor_id uuid,
  actor_role text not null check (actor_role in ('client','staff','system')),
  created_at timestamptz not null default now()
);

create index booking_status_events_booking_id_idx on public.booking_status_events(booking_id);

alter table public.booking_status_events enable row level security;

create policy "booking_status_events_select"
  on public.booking_status_events for select
  using (
    booking_id in (
      select id from public.bookings
      where attorney_id in (
        select a.id from public.attorneys a
        join public.firm_members fm on fm.firm_id = a.firm_id
        where fm.user_id = (select auth.uid())
      )
    )
    or (select public.is_admin())
  );

create policy "booking_status_events_insert_firm"
  on public.booking_status_events for insert
  with check (
    booking_id in (
      select id from public.bookings
      where attorney_id in (
        select a.id from public.attorneys a
        join public.firm_members fm on fm.firm_id = a.firm_id
        where fm.user_id = (select auth.uid())
      )
    )
    or (select public.is_admin())
  );
