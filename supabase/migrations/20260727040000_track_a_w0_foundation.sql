-- Track A / W0 foundation: attorney booking-page identity, calendar
-- connections, availability rules, booking-lifecycle additions
-- (slot_start/slot_end, source, confirmation metadata, 'no_show' status,
-- DB-level double-booking prevention), client self-service tokens,
-- firm-private staff notes, and scheduled email sends.
--
-- This is a published cross-team schema contract (PR A-W0a) — Track B
-- builds against these exact table/column names, so nothing here should be
-- added, removed, or renamed beyond what's specified.
--
-- Applied to Supabase project "the-vale" (gzmdsyuqhegcesoekuoo).
--
-- Note on RLS ownership scoping: this schema has no separate "firm" or
-- "staff" table — an attorney record is 1:1 with a single auth user
-- (attorneys.user_id), and existing policies (see
-- 20260726020600_initial_vale_schema.sql /
-- 20260726030000_fix_rls_recursion.sql) scope "ownership" as
-- `attorney_id in (select id from public.attorneys where user_id =
-- (select auth.uid()))` plus an admin escape hatch via `public.is_admin()`.
-- New tables below reuse that exact pattern as the closest existing
-- equivalent to "firm-scoped access".

-- ============================================================
-- Attorney booking page identity
-- ============================================================
alter table public.attorneys add column slug text unique;
alter table public.attorneys add column booking_page_published boolean not null default false;

-- No new RLS policies needed here: attorneys_select / attorneys_update
-- (public.attorneys) already cover "owner can read/write own row, verified
-- rows are publicly readable, admin can read/write everything", which is
-- the correct exposure for a slug + publish flag.

-- ============================================================
-- Calendar connections (free/busy scopes only)
-- ============================================================
create table public.attorney_calendar_connections (
  id uuid primary key default gen_random_uuid(),
  attorney_id uuid not null references public.attorneys(id) on delete cascade,
  provider text not null check (provider in ('google','microsoft')),
  refresh_token_encrypted text not null,
  calendar_id text,
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz
);

create index attorney_calendar_connections_attorney_id_idx
  on public.attorney_calendar_connections(attorney_id);

alter table public.attorney_calendar_connections enable row level security;

create policy "attorney_calendar_connections_select"
  on public.attorney_calendar_connections for select
  using (
    attorney_id in (select id from public.attorneys where user_id = (select auth.uid()))
    or (select public.is_admin())
  );

create policy "attorney_calendar_connections_insert_own"
  on public.attorney_calendar_connections for insert
  with check (attorney_id in (select id from public.attorneys where user_id = (select auth.uid())));

create policy "attorney_calendar_connections_update"
  on public.attorney_calendar_connections for update
  using (
    attorney_id in (select id from public.attorneys where user_id = (select auth.uid()))
    or (select public.is_admin())
  )
  with check (
    attorney_id in (select id from public.attorneys where user_id = (select auth.uid()))
    or (select public.is_admin())
  );

create policy "attorney_calendar_connections_delete"
  on public.attorney_calendar_connections for delete
  using (
    attorney_id in (select id from public.attorneys where user_id = (select auth.uid()))
    or (select public.is_admin())
  );

-- ============================================================
-- Availability rules
-- ============================================================
create table public.attorney_availability_rules (
  attorney_id uuid primary key references public.attorneys(id) on delete cascade,
  working_hours jsonb not null,
  buffer_minutes int not null default 15,
  min_notice_hours int not null default 24,
  daily_cap int,
  timezone text not null
);

alter table public.attorney_availability_rules enable row level security;

create policy "attorney_availability_rules_select"
  on public.attorney_availability_rules for select
  using (
    attorney_id in (select id from public.attorneys where user_id = (select auth.uid()))
    or (select public.is_admin())
  );

create policy "attorney_availability_rules_insert_own"
  on public.attorney_availability_rules for insert
  with check (attorney_id in (select id from public.attorneys where user_id = (select auth.uid())));

create policy "attorney_availability_rules_update"
  on public.attorney_availability_rules for update
  using (
    attorney_id in (select id from public.attorneys where user_id = (select auth.uid()))
    or (select public.is_admin())
  )
  with check (
    attorney_id in (select id from public.attorneys where user_id = (select auth.uid()))
    or (select public.is_admin())
  );

create policy "attorney_availability_rules_delete"
  on public.attorney_availability_rules for delete
  using (
    attorney_id in (select id from public.attorneys where user_id = (select auth.uid()))
    or (select public.is_admin())
  );

-- ============================================================
-- Booking additions
-- ============================================================
alter table public.bookings add column slot_start timestamptz;
alter table public.bookings add column slot_end timestamptz;
alter table public.bookings add column source text check (source in ('booking_page','directory','staff'));
alter table public.bookings add column confirmed_at timestamptz;
alter table public.bookings add column confirmed_by text check (confirmed_by in ('client','staff'));

-- status is a CHECK constraint today (bookings_status_check), not a native
-- enum type, so adding 'no_show' means dropping and recreating the
-- constraint rather than `alter type ... add value`.
alter table public.bookings drop constraint bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('pending','confirmed','completed','declined','no_show'));

-- Database-level double-booking prevention.
-- Installed into the `extensions` schema (not `public`) to match the
-- existing pgcrypto/uuid-ossp placement and avoid the advisor's
-- extension_in_public warning; `extensions` is already on the default
-- search_path so this doesn't change how the exclusion constraint resolves.
create extension if not exists btree_gist schema extensions;

-- Guarded with "slot_start is not null and slot_end is not null": without
-- this, tstzrange(NULL, NULL) evaluates to the fully-unbounded range, so two
-- rows with null slot bounds always register as "overlapping" and the
-- exclusion constraint wrongly rejects the second one. The existing
-- consumer-directory booking flow only ever populates the legacy `slot`
-- column, never slot_start/slot_end, so an unguarded constraint would break
-- that live flow for any attorney with more than one pending/confirmed
-- booking. This guard preserves that flow's current behavior exactly (no
-- double-booking protection there, same as today) while giving real
-- protection to every booking the new availability-engine-backed flow
-- creates, which always populates both columns.
alter table public.bookings add constraint no_double_booking
  exclude using gist (
    attorney_id with =,
    tstzrange(slot_start, slot_end) with &&
  ) where (status in ('pending','confirmed') and slot_start is not null and slot_end is not null);

-- ============================================================
-- Client self-service tokens. Hash stored, never the raw token.
-- Service-role only: deliberately has NO policies for anon/authenticated,
-- so it is never reachable from the browser client. RLS is still enabled
-- (required for the security advisor and defense in depth); service_role
-- bypasses RLS entirely regardless of what policies exist.
-- ============================================================
create table public.booking_action_tokens (
  token_hash text primary key,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  purpose text not null check (purpose in ('confirm','reschedule','cancel')),
  expires_at timestamptz not null,
  consumed_at timestamptz
);

create index booking_action_tokens_booking_id_idx on public.booking_action_tokens(booking_id);

alter table public.booking_action_tokens enable row level security;
-- Intentionally no policies: default-deny for anon/authenticated.

-- ============================================================
-- Firm-private notes. Never exposed to the client.
-- ============================================================
create table public.booking_staff_notes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  author_id uuid not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index booking_staff_notes_booking_id_idx on public.booking_staff_notes(booking_id);

alter table public.booking_staff_notes enable row level security;

create policy "booking_staff_notes_select"
  on public.booking_staff_notes for select
  using (
    booking_id in (
      select id from public.bookings
      where attorney_id in (select id from public.attorneys where user_id = (select auth.uid()))
    )
    or (select public.is_admin())
  );

create policy "booking_staff_notes_insert"
  on public.booking_staff_notes for insert
  with check (
    booking_id in (
      select id from public.bookings
      where attorney_id in (select id from public.attorneys where user_id = (select auth.uid()))
    )
    or (select public.is_admin())
  );

create policy "booking_staff_notes_update"
  on public.booking_staff_notes for update
  using (
    booking_id in (
      select id from public.bookings
      where attorney_id in (select id from public.attorneys where user_id = (select auth.uid()))
    )
    or (select public.is_admin())
  )
  with check (
    booking_id in (
      select id from public.bookings
      where attorney_id in (select id from public.attorneys where user_id = (select auth.uid()))
    )
    or (select public.is_admin())
  );

create policy "booking_staff_notes_delete"
  on public.booking_staff_notes for delete
  using (
    booking_id in (
      select id from public.bookings
      where attorney_id in (select id from public.attorneys where user_id = (select auth.uid()))
    )
    or (select public.is_admin())
  );

-- ============================================================
-- Scheduled sends. Reads are firm-scoped; writes come from a service role /
-- edge function (Track B), which bypasses RLS entirely — no insert/update/
-- delete policy is added, so the browser client has no write path at all.
-- ============================================================
create table public.email_schedule (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  kind text not null check (kind in ('confirmation','reminder')),
  send_at timestamptz not null,
  sent_at timestamptz,
  cancelled_at timestamptz
);

create index email_schedule_booking_id_idx on public.email_schedule(booking_id);

alter table public.email_schedule enable row level security;

create policy "email_schedule_select"
  on public.email_schedule for select
  using (
    booking_id in (
      select id from public.bookings
      where attorney_id in (select id from public.attorneys where user_id = (select auth.uid()))
    )
    or (select public.is_admin())
  );
