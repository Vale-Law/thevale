-- Wave 0 critical locks (money-loop audit 2026-08-15). NOT yet applied to
-- production — owner applies. Three DB-side locks:
--
--   1. profiles.role: no self-service admin. `profiles_update_own` lets a
--      user update any column of their own row, including role — and
--      is_admin() then opens every admin-gated policy in the schema. A
--      BEFORE trigger now pins the 'admin' value: only an existing admin
--      (or the service role / direct SQL, where auth.uid() is null) can
--      grant or revoke it. Self-service role changes that onboarding
--      legitimately performs (client/attorney via updateMe, staff via
--      add_firm_staff) keep working — only transitions to/from 'admin'
--      are pinned.
--
--   2. bookings.status: RLS scopes rows by ownership but not by value, so
--      the booking's own client could set status='confirmed'/'completed'
--      directly at the DB, skipping the token-confirm and Stripe paths.
--      A BEFORE trigger restricts those two transitions to firm members
--      of the booking's attorney, admins, and the service role (the
--      api/manage.js confirm path and Stripe webhooks run service-role).
--      Staff confirm/complete from AttorneyBookings.jsx keeps working.
--
--   3. consultation_charges: insert/update were firm-scoped with no field
--      restrictions, so any firm member could forge billing state —
--      status='charged', charged_at/paid_at, stripe_payment_intent_id, or
--      an arbitrary amount_cents (audit item 7). A BEFORE trigger limits
--      authenticated writes to the ledger actions the app actually
--      performs (create pending row, waive, dispute); money-state fields
--      only ever change via the service role (Stripe webhooks, refunds).
--
-- All three triggers deliberately no-op when auth.uid() is null: that is
-- the service role and direct SQL (postgres), which are the only intended
-- writers of the locked states. RLS already denies anon writes on these
-- tables (every write policy compares a column to auth.uid() or requires
-- membership), so the null bypass does not open an anon path.

-- ============================================================
-- Lock 1: pin profiles.role = 'admin'
-- ============================================================
create or replace function public.enforce_profiles_role_pin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select auth.uid()) is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.role = 'admin' and not (select public.is_admin()) then
      raise exception 'profiles.role = ''admin'' can only be granted by an admin or the service role';
    end if;
    return new;
  end if;

  if new.role is distinct from old.role
     and (new.role = 'admin' or old.role = 'admin')
     and not (select public.is_admin()) then
    raise exception 'profiles.role = ''admin'' can only be granted or revoked by an admin or the service role';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profiles_role on public.profiles;
create trigger protect_profiles_role
  before insert or update on public.profiles
  for each row execute function public.enforce_profiles_role_pin();

-- ============================================================
-- Lock 2 (DB side of audit item 3): bookings.status transitions
-- ============================================================
create or replace function public.enforce_booking_status_lock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  restricted boolean;
begin
  if (select auth.uid()) is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    restricted := new.status in ('confirmed', 'completed');
  else
    restricted := new.status in ('confirmed', 'completed')
                  and new.status is distinct from old.status;
  end if;

  if restricted
     and not (select public.is_admin())
     and not exists (
       select 1 from public.attorneys a
       where a.id = new.attorney_id
         and a.firm_id in (select public.my_firm_ids())
     ) then
    raise exception 'bookings.status = ''%'' can only be set by firm staff, an admin, or the service role', new.status;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_booking_status on public.bookings;
create trigger protect_booking_status
  before insert or update on public.bookings
  for each row execute function public.enforce_booking_status_lock();

-- ============================================================
-- Lock 3 (audit item 7): consultation_charges billing fields
-- ============================================================
create or replace function public.enforce_consultation_charge_lock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fee_cents integer;
begin
  if (select auth.uid()) is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.status is distinct from 'pending' then
      raise exception 'consultation_charges rows are created ''pending''; ''%'' is set by the service role only', new.status;
    end if;
    if new.charged_at is not null
       or new.paid_at is not null
       or new.refunded_at is not null
       or new.stripe_payment_intent_id is not null then
      raise exception 'consultation_charges payment fields are set by the service role only';
    end if;
    -- Amount check (audit item 7): a firm member may only create a row at
    -- the column default ($50) or the attorney's actual published fee —
    -- the two amounts the app itself writes — never an arbitrary figure.
    if new.amount_cents is distinct from 5000 then
      select round(a.consult_fee * 100)::integer into fee_cents
      from public.attorneys a where a.id = new.attorney_id;
      if fee_cents is null or new.amount_cents is distinct from fee_cents then
        raise exception 'consultation_charges.amount_cents must match the attorney''s consultation fee';
      end if;
    end if;
    return new;
  end if;

  -- UPDATE by an authenticated user: ledger identity and money-state
  -- fields are frozen; only the waive/dispute actions remain.
  if new.booking_id is distinct from old.booking_id
     or new.attorney_id is distinct from old.attorney_id
     or new.amount_cents is distinct from old.amount_cents
     or new.charged_at is distinct from old.charged_at
     or new.paid_at is distinct from old.paid_at
     or new.refunded_at is distinct from old.refunded_at
     or new.stripe_payment_intent_id is distinct from old.stripe_payment_intent_id then
    raise exception 'consultation_charges billing fields can only be changed by the service role';
  end if;

  if new.status is distinct from old.status then
    if not (
      (new.status = 'waived' and old.status = 'pending')
      or (new.status = 'disputed' and old.status in ('pending', 'charged'))
    ) then
      raise exception 'consultation_charges.status ''%'' → ''%'' is reserved for the service role', old.status, new.status;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_consultation_charge on public.consultation_charges;
create trigger protect_consultation_charge
  before insert or update on public.consultation_charges
  for each row execute function public.enforce_consultation_charge_lock();
