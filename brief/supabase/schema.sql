-- ============================================================================
-- Brief — database schema
-- Run this once in the Supabase SQL Editor (Dashboard → SQL → New query → Run).
-- ============================================================================

-- btree_gist lets us build the "no two bookings overlap" exclusion constraint
-- below. Without it, that constraint cannot be created.
create extension if not exists btree_gist;

-- ── Attorneys ───────────────────────────────────────────────────────────────
create table if not exists attorneys (
  id uuid primary key default gen_random_uuid(),
  name text,
  practice_areas text[],
  location text,
  bio text,
  photo_url text,
  bar_number text,
  verified boolean default false,
  -- The attorney's home timezone. ALL "9am–5pm, weekdays" math happens in THIS
  -- zone, so 9am always means 9am where the lawyer is — not on our servers.
  timezone text default 'America/Chicago',
  consultation_duration_minutes int default 30,
  buffer_minutes int default 0,
  pricing_tier text default 'per_booking',
  created_at timestamptz default now()
);

-- ── Clients ─────────────────────────────────────────────────────────────────
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique,
  created_at timestamptz default now()
);

-- ── Calendar connections (one row per attorney per provider) ────────────────
-- refresh_token / access_token are stored ENCRYPTED (AES-256-GCM, app-level).
-- See lib/crypto.ts. Even someone with raw DB access cannot read them without
-- TOKEN_ENCRYPTION_KEY.
create table if not exists attorney_calendar_connections (
  id uuid primary key default gen_random_uuid(),
  attorney_id uuid not null references attorneys(id) on delete cascade,
  provider text not null check (provider in ('google','microsoft')),
  refresh_token text not null,            -- encrypted
  access_token text,                      -- encrypted
  access_token_expires_at timestamptz,
  -- The mailbox address of the connected account. Microsoft's free/busy endpoint
  -- (getSchedule) needs the email; Google does not, but we store it either way.
  account_email text,
  -- Webhook channel bookkeeping (Google watch channel / Microsoft subscription).
  channel_id text,
  channel_resource_id text,
  channel_expires_at timestamptz,
  created_at timestamptz default now(),
  unique (attorney_id, provider)
);

-- ── Bookings ────────────────────────────────────────────────────────────────
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  attorney_id uuid not null references attorneys(id),
  client_id uuid references clients(id),
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'confirmed',
  -- The screening questionnaire summary, stored as structured JSON.
  case_summary jsonb,
  -- The event id returned by Google/Microsoft after we write the event to the
  -- attorney's real calendar. Lets us update/cancel it later.
  external_event_id text,
  created_at timestamptz default now()
);

-- THE double-booking guarantee. For any single attorney, no two CONFIRMED
-- bookings may have overlapping [start_at, end_at) ranges. Enforced by Postgres
-- itself: a conflicting insert fails with an exclusion-violation error, which
-- the booking API turns into a friendly "that time was just taken" 409.
alter table bookings drop constraint if exists no_overlap;
alter table bookings add constraint no_overlap
  exclude using gist (
    attorney_id with =,
    tstzrange(start_at, end_at) with &&
  ) where (status = 'confirmed');

-- Helpful indexes for the availability queries.
create index if not exists bookings_attorney_start_idx
  on bookings (attorney_id, start_at);
create index if not exists connections_attorney_idx
  on attorney_calendar_connections (attorney_id);

-- ── Row Level Security note ─────────────────────────────────────────────────
-- This backend talks to Supabase with the SERVICE ROLE key, which bypasses RLS.
-- That is intentional: all access control lives in our API routes. If you later
-- let the browser query Supabase directly, enable RLS on every table and add
-- policies — especially so a client can never SELECT another attorney's
-- connection tokens or another attorney's bookings.
