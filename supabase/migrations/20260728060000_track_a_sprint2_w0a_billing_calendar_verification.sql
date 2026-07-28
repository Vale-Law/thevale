-- Track A / Sprint v1.2 W0a: consultation dispute state, billing ledger,
-- calendar connection health, and attorney verification records.
--
-- This is a published cross-team schema contract (PR A-W0a) -- Track B
-- builds against these exact table/column names, so nothing here should be
-- added, removed, or renamed beyond what's specified in Development Sprint
-- v1.2's Shared Contract 2.2.
--
-- Applied to Supabase project "the-vale" (gzmdsyuqhegcesoekuoo).

-- ============================================================
-- Consultation lifecycle: dispute state + who cancelled.
-- Extends the five-state enum (pending, confirmed, completed, declined,
-- no_show) added in 20260727040000_track_a_w0_foundation.sql.
-- ============================================================
alter table public.bookings add column cancelled_by text check (cancelled_by in ('client','staff'));

alter table public.bookings drop constraint bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('pending','confirmed','completed','declined','no_show','disputed'));

-- ============================================================
-- Billing ledger (F-02). A record that a fee is owed and its dispute/
-- waiver state -- NOT a Stripe charge, no payment capture (Shared Contract
-- 2.4 constraint 1). Readable by the owning firm and admin; never by the
-- client -- no client_id column and no policy grants client access.
-- ============================================================
create table public.consultation_charges (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  attorney_id uuid not null references public.attorneys(id) on delete cascade,
  amount_cents integer not null default 5000,
  status text not null default 'pending' check (status in ('pending','charged','waived','disputed','reversed')),
  charged_at timestamptz,
  waived_reason text,
  dispute_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index consultation_charges_booking_id_idx on public.consultation_charges(booking_id);
create index consultation_charges_attorney_id_idx on public.consultation_charges(attorney_id);

alter table public.consultation_charges enable row level security;

create policy "consultation_charges_select"
  on public.consultation_charges for select
  using (
    attorney_id in (
      select a.id from public.attorneys a
      join public.firm_members fm on fm.firm_id = a.firm_id
      where fm.user_id = (select auth.uid())
    )
    or (select public.is_admin())
  );

-- Insert/update are firm-scoped for now: staff create the row on completion
-- and mark it waived/disputed (v1.4 3.1, Shared Contract 2.3). No code path
-- in this sprint ever sets status='charged' -- that is an application-level
-- rule (Shared Contract 2.4 constraint 1), not a DB constraint, matching how
-- 'no_show' is enforced (deliberate action only, no DB trigger).
create policy "consultation_charges_insert_firm"
  on public.consultation_charges for insert
  with check (
    attorney_id in (
      select a.id from public.attorneys a
      join public.firm_members fm on fm.firm_id = a.firm_id
      where fm.user_id = (select auth.uid())
    )
    or (select public.is_admin())
  );

create policy "consultation_charges_update_firm"
  on public.consultation_charges for update
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

-- No delete policy: ledger rows are never deleted, only reversed via status.

-- ============================================================
-- Calendar connection health (F-01). attorney_calendar_connections already
-- has the right shape (attorney_id, provider, refresh_token_encrypted,
-- calendar_id, connected_at, last_synced_at) from Sprint 1 -- this only adds
-- the status surface the blueprint calls for. Existing RLS on the table
-- (attorney_calendar_connections_select/insert_own/update/delete, re-scoped
-- to firm membership in 20260727050000) already covers these new columns.
-- ============================================================
alter table public.attorney_calendar_connections add column status text not null default 'connected' check (status in ('connected','error','disconnected'));
alter table public.attorney_calendar_connections add column last_error text;

-- ============================================================
-- Attorney verification records (F-05). Additive detail alongside the
-- existing attorneys.verification_status, which every existing RLS policy
-- and isAttorneyVerified() keeps reading -- do not remove or refactor that
-- column this sprint. This is the richer audit trail behind it.
--
-- Access is scoped to the owning attorney (not firm-wide) and admin: this is
-- an individual attorney's compliance record, not office-staff pipeline
-- data. Writes are admin-only for now -- verification status changes flow
-- through the admin review action (Shared Contract 2.3), never a direct
-- attorney edit. Track B's F-05 admin console is the only writer; if it
-- needs attorney-side write (e.g. self-service evidence upload), that is an
-- escalation to loosen this, not something to assume now.
-- ============================================================
create table public.attorney_verification_records (
  id uuid primary key default gen_random_uuid(),
  attorney_id uuid not null references public.attorneys(id) on delete cascade,
  bar_status_verified_at timestamptz,
  identity_verified_at timestamptz,
  profile_attested_at timestamptz,
  reviewer_id uuid,
  renewal_date date,
  status text not null default 'pending' check (status in ('pending','verified','suspended','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index attorney_verification_records_attorney_id_idx on public.attorney_verification_records(attorney_id);

alter table public.attorney_verification_records enable row level security;

create policy "attorney_verification_records_select"
  on public.attorney_verification_records for select
  using (
    attorney_id in (select id from public.attorneys where user_id = (select auth.uid()))
    or (select public.is_admin())
  );

create policy "attorney_verification_records_insert_admin"
  on public.attorney_verification_records for insert
  with check ((select public.is_admin()));

create policy "attorney_verification_records_update_admin"
  on public.attorney_verification_records for update
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create table public.attorney_verification_evidence (
  id uuid primary key default gen_random_uuid(),
  verification_record_id uuid not null references public.attorney_verification_records(id) on delete cascade,
  evidence_type text not null,
  evidence_uri text not null,
  uploaded_at timestamptz not null default now()
);

create index attorney_verification_evidence_record_id_idx on public.attorney_verification_evidence(verification_record_id);

alter table public.attorney_verification_evidence enable row level security;

create policy "attorney_verification_evidence_select"
  on public.attorney_verification_evidence for select
  using (
    verification_record_id in (
      select id from public.attorney_verification_records
      where attorney_id in (select id from public.attorneys where user_id = (select auth.uid()))
    )
    or (select public.is_admin())
  );

-- Append-only: evidence is never edited once uploaded, only superseded by a
-- new row (matches booking_status_events' immutable-audit-trail pattern).
create policy "attorney_verification_evidence_insert_admin"
  on public.attorney_verification_evidence for insert
  with check ((select public.is_admin()));
