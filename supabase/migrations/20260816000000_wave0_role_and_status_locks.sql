-- Wave 0 critical locks (money-loop audit, 2026-08-15). Three DB-side holes
-- closed here; the matching UI changes land in the same PR.
--
--  Lock 1: profiles.role privilege escalation. profiles_update_own
--    (20260726020600, recreated in 20260726020900) allows an authenticated
--    user to update ANY column of their own profiles row, including role.
--    Nothing else guards role, so any logged-in user could set
--    role = 'admin' and is_admin() then opens every admin-gated policy in
--    the schema. AdminEntry.jsx's "Enable admin access" button did exactly
--    this in one click.
--
--  Lock 3: bookings.status self-service. bookings_update /
--    bookings_insert_client scope by ownership (client_id = auth.uid()),
--    not by column or transition, so a client JWT could insert or update
--    its own booking straight to 'confirmed' or 'completed' — the states
--    the pipeline, metrics, and the $50 consultation charge hang off.
--    Related (audit item 7): consultation_charges_insert_firm/update_firm
--    let any firm-member JWT write the payment-state fields (status
--    'charged'/'reversed', charged_at, stripe_payment_intent_id, paid_at,
--    refunded_at) that only the Stripe webhooks should ever set.
--
-- Enforcement is BEFORE triggers, not policy rewrites: the ownership
-- policies above are shared by many legitimate flows, and a trigger can
-- distinguish the actor (server / admin / firm member / everyone else)
-- and the specific transition without disturbing them.
--
-- The trigger functions are deliberately SECURITY INVOKER: current_user
-- must reflect the caller's execution context ('authenticated' for a user
-- JWT via PostgREST; 'postgres' inside migrations, the SQL editor, and
-- security-definer RPCs like add_firm_staff; 'service_role' for the
-- serverless API's client). A security-definer trigger function would
-- always see its owner and the elevation check would be meaningless.
-- Row lookups inside them go through the existing security-definer helpers
-- (is_admin, my_firm_ids), so RLS recursion is not re-introduced.

-- ============================================================
-- Lock 1: profiles.role
-- ============================================================
create or replace function public.enforce_profiles_role_lock()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    -- Server-side contexts: migrations / SQL editor (postgres), the
    -- service-role API key, and security-definer functions owned by
    -- postgres (add_firm_staff's role='staff' flip arrives here as
    -- current_user = 'postgres').
    if current_user in ('postgres', 'service_role', 'supabase_admin', 'supabase_auth_admin', 'dashboard_user') then
      return new;
    end if;

    if (select public.is_admin()) then
      return new;
    end if;

    -- Self-service onboarding keeps working: ClientGoogleComplete.jsx sets
    -- role='client' and AttorneyApplication.jsx sets role='attorney' with
    -- the user's own JWT. 'admin' and 'staff' are never self-assignable;
    -- staff is granted only via the add_firm_staff security-definer RPC.
    if old.role <> 'admin' and new.role in ('user', 'client', 'attorney') then
      return new;
    end if;

    raise exception 'profiles.role cannot be changed to % by this user', new.role
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profiles_role on public.profiles;
create trigger protect_profiles_role
  before update of role on public.profiles
  for each row
  execute function public.enforce_profiles_role_lock();

-- ============================================================
-- Lock 3a: bookings.status — 'confirmed'/'completed' only from the firm
-- pipeline (AttorneyBookings.jsx via a firm-member JWT), an admin, or the
-- server (service-role paths: api/manage.js token confirm, Stripe
-- webhooks). Clients keep every other write they have today.
-- ============================================================
create or replace function public.enforce_bookings_status_lock()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status in ('confirmed', 'completed')
     and (tg_op = 'INSERT' or new.status is distinct from old.status) then

    if current_user in ('postgres', 'service_role', 'supabase_admin', 'dashboard_user') then
      return new;
    end if;

    if (select public.is_admin()) then
      return new;
    end if;

    -- Same firm-membership arm as the bookings_update policy
    -- (20260727050000), via the recursion-safe helper from 20260728080000.
    if new.attorney_id in (
      select a.id from public.attorneys a
      where a.firm_id in (select public.my_firm_ids())
    ) then
      return new;
    end if;

    raise exception 'bookings.status % can only be set by the firm, an admin, or the server', new.status
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_bookings_status on public.bookings;
create trigger protect_bookings_status
  before insert or update of status on public.bookings
  for each row
  execute function public.enforce_bookings_status_lock();

-- ============================================================
-- Lock 3b (audit item 7): consultation_charges payment-state fields are
-- server-only. Firm members keep exactly the writes the UI performs today
-- (AttorneyBookings.jsx): insert the row at completion (status 'pending',
-- no payment fields) and later mark it 'waived' or 'disputed' with a
-- reason. 'charged'/'reversed', charged_at, stripe_payment_intent_id,
-- paid_at, refunded_at, and post-insert amount changes are reserved for
-- the service role / admin. Residual for Wave 1: insert-time amount_cents
-- is still caller-supplied (the UI relies on the column default).
-- ============================================================
create or replace function public.enforce_consultation_charges_lock()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('postgres', 'service_role', 'supabase_admin', 'dashboard_user') then
    return new;
  end if;

  if (select public.is_admin()) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.status <> 'pending'
       or new.charged_at is not null
       or new.stripe_payment_intent_id is not null
       or new.paid_at is not null
       or new.refunded_at is not null then
      raise exception 'consultation_charges payment fields can only be set by the server'
        using errcode = '42501';
    end if;
  else
    if (new.status is distinct from old.status and new.status in ('charged', 'reversed'))
       or new.amount_cents is distinct from old.amount_cents
       or new.charged_at is distinct from old.charged_at
       or new.stripe_payment_intent_id is distinct from old.stripe_payment_intent_id
       or new.paid_at is distinct from old.paid_at
       or new.refunded_at is distinct from old.refunded_at then
      raise exception 'consultation_charges payment fields can only be set by the server'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_consultation_charges on public.consultation_charges;
create trigger protect_consultation_charges
  before insert or update on public.consultation_charges
  for each row
  execute function public.enforce_consultation_charges_lock();
