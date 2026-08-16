-- Wave 1: enforce the money loop (audit 2026-08-15; builds on the Wave 0
-- locks in 20260816000000). Four DB-side pieces land here; the matching
-- API changes ship in the same PR.
--
--  1. firm_has_active_subscription(): one shared, security-definer answer
--     to "may this firm collect money right now?". 'active'/'trialing'/
--     'past_due' count as active -- the same set AttorneyShell.jsx and the
--     server endpoints use, past_due being Stripe's own Smart-Retries
--     grace window, never an invented one.
--
--  2. consultation_charges columns: stripe_checkout_session_id (set by the
--     server when a Stripe Checkout session is created at booking time, so
--     the confirm path can tell "payment was requested" apart from
--     "payment is collected out-of-band"), and refund_failed_at /
--     refund_failure_reason (set by api/manage.js when an automatic refund
--     fails, so a failed refund is a visible row state, never a silent
--     catch {}).
--
--  3. enforce_consultation_charges_lock() recreated (same trigger,
--     protect_consultation_charges, keeps firing it) with three additions:
--     the new columns join the server-only field list; insert-time
--     amount_cents is derived server-side from the attorney's consult_fee
--     (never caller-supplied -- closes the Wave 0 residual where a
--     firm-member JWT could forge the amount on insert); and an insert by
--     a non-server, non-admin caller is rejected outright when the
--     attorney's firm has no active subscription -- a cancelled or
--     never-subscribed firm cannot collect.
--
--  4. attorneys PII: the blanket attorneys_select_public_verified row
--     policy exposed the FULL row (email, phone_number, bar_number,
--     id_document, bar_card_document, board_cert_document, user_id,
--     attestation fields) to anon and every authenticated client. It is
--     dropped and replaced by (a) a firm-member row policy so staff keep
--     reading their own firm's attorneys, and (b) a public
--     attorneys_public view exposing only the columns the directory,
--     profile, and booking pages actually render. The view deliberately
--     runs with owner rights (it exists to bypass the base table's RLS
--     for a fixed, audited column list -- the same reasoning as the
--     get_public_attorney_profile security-definer RPC).

-- ============================================================
-- 1. Subscription helper
-- ============================================================
create or replace function public.firm_has_active_subscription(p_firm_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.firm_subscriptions
    where firm_id = p_firm_id
      and status in ('active', 'trialing', 'past_due')
  )
$$;

revoke all on function public.firm_has_active_subscription(uuid) from public;
grant execute on function public.firm_has_active_subscription(uuid) to anon, authenticated, service_role;

-- ============================================================
-- 2. consultation_charges: server-only bookkeeping columns
-- ============================================================
alter table public.consultation_charges add column if not exists stripe_checkout_session_id text;
alter table public.consultation_charges add column if not exists refund_failed_at timestamptz;
alter table public.consultation_charges add column if not exists refund_failure_reason text;

-- ============================================================
-- 3. Charge lock, Wave 1 edition. Deliberately SECURITY INVOKER, same as
-- Wave 0: current_user must reflect the real caller so the privileged-role
-- bypass below means what it says. The subqueries on attorneys run under
-- the caller's own RLS -- a firm member inserting a charge can see the
-- firm's attorney row via attorneys_select_firm_members (added in §4).
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
       or new.refunded_at is not null
       or new.stripe_checkout_session_id is not null
       or new.refund_failed_at is not null
       or new.refund_failure_reason is not null then
      raise exception 'consultation_charges payment fields can only be set by the server'
        using errcode = '42501';
    end if;

    -- Wave 1: the insert-time amount is never caller-supplied. Whatever a
    -- firm-member JWT sends is overwritten with the attorney's own listed
    -- consult_fee; an attorney with no fee set falls back to the column's
    -- historical default (5000 = $50).
    new.amount_cents := coalesce(
      (select round(a.consult_fee * 100)::int
         from public.attorneys a
        where a.id = new.attorney_id),
      5000
    );

    -- Wave 1: a cancelled or never-subscribed firm cannot collect. This is
    -- the DB backstop behind the API-level checks in bookings-public /
    -- connect-onboarding; it catches the direct-JWT path (a firm member
    -- inserting the charge row from the completion flow).
    if not exists (
      select 1 from public.attorneys a
      where a.id = new.attorney_id
        and a.firm_id is not null
        and public.firm_has_active_subscription(a.firm_id)
    ) then
      raise exception 'consultation charges require an active firm subscription'
        using errcode = '42501';
    end if;
  else
    if (new.status is distinct from old.status and new.status in ('charged', 'reversed'))
       or new.amount_cents is distinct from old.amount_cents
       or new.charged_at is distinct from old.charged_at
       or new.stripe_payment_intent_id is distinct from old.stripe_payment_intent_id
       or new.paid_at is distinct from old.paid_at
       or new.refunded_at is distinct from old.refunded_at
       or new.stripe_checkout_session_id is distinct from old.stripe_checkout_session_id
       or new.refund_failed_at is distinct from old.refund_failed_at
       or new.refund_failure_reason is distinct from old.refund_failure_reason then
      raise exception 'consultation_charges payment fields can only be set by the server'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

-- ============================================================
-- 4. attorneys PII
-- ============================================================
drop policy if exists "attorneys_select_public_verified" on public.attorneys;

-- Staff/attorney reads within the firm keep working without the public
-- policy (AuthContext's firm roster query, the pipeline pages).
-- my_firm_ids() is the recursion-safe security-definer helper from
-- 20260728080000; it is re-granted to anon here ONLY so this policy can be
-- evaluated without erroring for anonymous sessions -- for anon,
-- auth.uid() is null and the function returns the empty set, so the
-- policy is simply false.
grant execute on function public.my_firm_ids() to anon;

drop policy if exists "attorneys_select_firm_members" on public.attorneys;
create policy "attorneys_select_firm_members"
  on public.attorneys for select
  using (firm_id in (select public.my_firm_ids()));

-- The public read surface. Column list is exactly what the directory
-- (Home.jsx / AttorneyBrowse), the public profile (AttorneyProfile.jsx --
-- whose Highlights section already displays bar_state and bar_number,
-- both public bar-directory facts), and the booking-page fallback render.
-- No email, phone_number, uploaded verification documents (id_document /
-- bar_card_document / board_cert_document), user_id, firm_id, or
-- attestation fields. Runs with owner rights on purpose (see header).
create or replace view public.attorneys_public as
  select
    id, name, slug, photo, bio, education, specialties,
    practice_area, practice_areas,
    location, state, city, distance, office_location,
    consult_fee, typical_retainer,
    rating, review_count, years_experience,
    languages, languages_spoken, spanish_speaker, bilingual_staff,
    interpreter_available, translated_documents,
    verified, verification_status, verified_date,
    board_certified, board_cert_body, board_cert_specialty, board_cert_approved,
    bar_admission, bar_state, bar_number,
    available_slots, booking_page_published,
    created_at, updated_at
  from public.attorneys
  where verification_status = 'verified';

revoke all on public.attorneys_public from public;
grant select on public.attorneys_public to anon, authenticated;
