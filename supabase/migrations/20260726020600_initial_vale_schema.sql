-- The Vale: initial schema, translated from base44/entities/*.jsonc
-- Applied to Supabase project "the-vale" (gzmdsyuqhegcesoekuoo) via the
-- Supabase MCP on 2026-07-26. Checked in here for reproducibility —
-- see docs/MIGRATION.md for the full migration plan this is Phase 1 of.

create extension if not exists "pgcrypto";

-- ============================================================
-- profiles (extends auth.users — role/account_type live here,
-- mirroring base44/entities/User.jsonc)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('client', 'attorney', 'admin', 'user')),
  account_type text check (account_type in ('client', 'attorney')),
  preferred_language text,
  requires_spanish_attorney boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- auto-create a profile row whenever a new auth user signs up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ============================================================
-- attorneys (base44/entities/Attorney.jsonc)
-- ============================================================
create table public.attorneys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  practice_area text not null check (practice_area in ('Family Law', 'Immigration', 'Business Formation', 'Personal Injury')),
  practice_areas text[],
  photo text,
  consult_fee numeric,
  typical_retainer numeric,
  location text,
  state text,
  city text,
  distance text,
  rating numeric,
  review_count integer,
  years_experience integer,
  languages text[],
  languages_spoken text[],
  spanish_speaker boolean,
  bilingual_staff boolean,
  interpreter_available boolean,
  translated_documents boolean,
  verified boolean default false,
  board_certified boolean,
  board_cert_body text,
  board_cert_specialty text,
  board_cert_document text,
  board_cert_approved boolean default false,
  education text,
  bar_admission text,
  specialties text[],
  bio text,
  available_slots text[] default '{}',
  email text,
  bar_number text,
  bar_state text,
  office_location text,
  phone_number text,
  id_document text,
  bar_card_document text,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  verified_date date,
  profile_attestation boolean,
  profile_attestation_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.attorneys enable row level security;

create policy "attorneys_select_public_verified"
  on public.attorneys for select
  using (verification_status = 'verified');

create policy "attorneys_select_own"
  on public.attorneys for select
  using (user_id = auth.uid());

create policy "attorneys_select_admin"
  on public.attorneys for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "attorneys_insert_own"
  on public.attorneys for insert
  with check (user_id = auth.uid());

create policy "attorneys_update_own"
  on public.attorneys for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "attorneys_update_admin"
  on public.attorneys for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "attorneys_delete_admin"
  on public.attorneys for delete
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create function public.protect_attorney_verification_fields()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  is_admin boolean;
begin
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin') into is_admin;
  if not is_admin then
    new.verification_status := old.verification_status;
    new.verified := old.verified;
    new.verified_date := old.verified_date;
    new.board_cert_approved := old.board_cert_approved;
  end if;
  return new;
end;
$$;

create trigger protect_attorney_verification
  before update on public.attorneys
  for each row execute function public.protect_attorney_verification_fields();

-- ============================================================
-- bookings (base44/entities/Booking.jsonc)
-- ============================================================
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references auth.users(id) on delete set null,
  client_name text not null,
  client_email text not null,
  client_phone text,
  attorney_id uuid not null references public.attorneys(id) on delete cascade,
  attorney_name text,
  slot timestamptz not null,
  urgency text default 'Soon' check (urgency in ('Urgent', 'Soon', 'Just exploring')),
  issue_description text,
  payment_method text default 'full' check (payment_method in ('full', 'klarna', 'affirm', 'lawfi')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'declined')),
  case_summary text,
  sub_area text,
  language_preference text,
  description_consent boolean,
  description_consent_date timestamptz,
  description_skipped boolean default false,
  description_purged boolean default false,
  declined_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_attorney_id_idx on public.bookings(attorney_id);
create index bookings_client_id_idx on public.bookings(client_id);

alter table public.bookings enable row level security;

create policy "bookings_select_client"
  on public.bookings for select
  using (client_id = auth.uid());

create policy "bookings_select_attorney"
  on public.bookings for select
  using (attorney_id in (select id from public.attorneys where user_id = auth.uid()));

create policy "bookings_select_admin"
  on public.bookings for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "bookings_insert_client"
  on public.bookings for insert
  with check (client_id = auth.uid());

create policy "bookings_update_client"
  on public.bookings for update
  using (client_id = auth.uid())
  with check (client_id = auth.uid());

create policy "bookings_update_attorney"
  on public.bookings for update
  using (attorney_id in (select id from public.attorneys where user_id = auth.uid()));

create policy "bookings_update_admin"
  on public.bookings for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "bookings_delete_admin"
  on public.bookings for delete
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================
-- case_summaries (base44/entities/CaseSummary.jsonc)
-- ============================================================
create table public.case_summaries (
  id uuid primary key default gen_random_uuid(),
  created_by_id uuid not null references auth.users(id) on delete cascade,
  practice_area_primary text not null,
  practice_area_secondary text,
  description text not null,
  key_facts text[],
  state text,
  city text,
  urgency text check (urgency in ('Urgent', 'Soon', 'Just exploring')),
  budget_range text,
  preferred_language text,
  conversation_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.case_summaries enable row level security;

create policy "case_summaries_select_own"
  on public.case_summaries for select
  using (created_by_id = auth.uid());

create policy "case_summaries_insert_own"
  on public.case_summaries for insert
  with check (created_by_id = auth.uid());

create policy "case_summaries_update_own"
  on public.case_summaries for update
  using (created_by_id = auth.uid())
  with check (created_by_id = auth.uid());

create policy "case_summaries_delete_own"
  on public.case_summaries for delete
  using (created_by_id = auth.uid());

-- ============================================================
-- waitlist (base44/entities/Waitlist.jsonc)
-- ============================================================
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  state text not null,
  notified boolean default false,
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

create policy "waitlist_insert_anyone"
  on public.waitlist for insert
  with check (true);

create policy "waitlist_select_admin"
  on public.waitlist for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "waitlist_update_admin"
  on public.waitlist for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================
-- reviews (base44/entities/Review.jsonc)
-- ============================================================
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  attorney_id uuid not null references public.attorneys(id) on delete cascade,
  reviewer_name text not null,
  rating numeric not null check (rating >= 1 and rating <= 5),
  review_text text,
  date date default current_date,
  created_at timestamptz not null default now()
);

create index reviews_attorney_id_idx on public.reviews(attorney_id);

alter table public.reviews enable row level security;

create policy "reviews_select_public"
  on public.reviews for select
  using (true);

create policy "reviews_insert_admin"
  on public.reviews for insert
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "reviews_delete_admin"
  on public.reviews for delete
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
