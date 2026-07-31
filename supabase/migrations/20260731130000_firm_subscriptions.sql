-- Item 4a: attorney/firm platform subscription billing (Stripe Checkout +
-- customer portal + webhook lifecycle). Revenue model: a firm pays Brief a
-- flat monthly subscription for platform access -- Brief takes no
-- percentage of any consultation fee (that's a separate, zero-application-
-- fee Connect direct-charge flow, tracked by firm_payment_accounts below).
--
-- Billed per firm, not per individual attorney: firm_members/staff already
-- share a firm_id, office staff have no personal attorney row to attach a
-- subscription to, and a multi-attorney firm shouldn't need N separate
-- subscriptions for shared portal access. One row per firm.
create table public.firm_subscriptions (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text,
  stripe_price_id text,
  status text not null default 'incomplete' check (status in (
    'incomplete', 'trialing', 'active', 'past_due', 'canceled', 'unpaid'
  )),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (firm_id),
  unique (stripe_customer_id)
);

create index firm_subscriptions_stripe_subscription_id_idx
  on public.firm_subscriptions(stripe_subscription_id);

alter table public.firm_subscriptions enable row level security;

-- Read-only for the firm's own members (any role) and admin. All writes
-- happen server-side with the service role, from the Checkout-session
-- creation endpoint and the Stripe webhook handler -- never a direct
-- client write, so there is deliberately no insert/update/delete policy
-- for firm members here.
create policy "firm_subscriptions_select"
  on public.firm_subscriptions for select
  using (
    firm_id in (select firm_id from public.firm_members where user_id = (select auth.uid()))
    or (select public.is_admin())
  );

-- Item 4b prep: Connect direct-charge account per firm (client consultation
-- payments settle straight to this account; Brief's application fee is
-- always zero). Schema shape matches what Track A's v1.3 draft contract
-- already anticipated for firm_payment_accounts, kept consistent so a
-- later Track A migration doesn't collide with this one.
create table public.firm_payment_accounts (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.firms(id) on delete cascade unique,
  stripe_account_id text not null unique,
  status text not null default 'onboarding' check (status in ('onboarding', 'active', 'disabled')),
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.firm_payment_accounts enable row level security;

create policy "firm_payment_accounts_select"
  on public.firm_payment_accounts for select
  using (
    firm_id in (select firm_id from public.firm_members where user_id = (select auth.uid()))
    or (select public.is_admin())
  );

-- consultation_charges gains the two Connect-payment columns the draft
-- contract specified, plus a refund marker for the cancel/reschedule flow
-- in item 4b.
alter table public.consultation_charges add column if not exists stripe_payment_intent_id text;
alter table public.consultation_charges add column if not exists paid_at timestamptz;
alter table public.consultation_charges add column if not exists refunded_at timestamptz;
