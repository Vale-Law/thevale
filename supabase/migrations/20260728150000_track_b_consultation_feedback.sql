-- ============================================================
-- Sprint v1.2 Track B, W3 (F-03): internal operational feedback.
--
-- CROSS-BOUNDARY: Shared Contract 2.1 assigns ALL migrations to Track A.
-- Written by Track B under an explicit owner instruction to unblock W3
-- rather than wait. It introduces no table Track A's branch also defines,
-- so a future Track A migration should not conflict with it.
--
-- GUARDRAIL (Shared Contract 2.4 constraint 2, and F-03's own): this is
-- Brief-INTERNAL signal only. It is never a public review and never a star
-- rating. That guarantee is enforced here, not just in the UI:
--   * SELECT is admin-only. Attorneys and firms cannot read their own
--     feedback, clients cannot read anyone's, anon gets nothing.
--   * There is no INSERT/UPDATE/DELETE policy at all, so the only write
--     path is the service-role API route behind a single-use emailed
--     token (api/feedback.js) -- the same default-deny shape Sprint 1
--     used for booking_action_tokens.
-- Adding a public read path to this table is a product decision that must
-- go through the owner, not a local fix.
-- ============================================================

-- Feedback links reuse Sprint 1's single-use action-token machinery, which
-- constrains purpose to a fixed set. Extend it rather than adding a
-- parallel token table.
alter table public.booking_action_tokens
  drop constraint booking_action_tokens_purpose_check;
alter table public.booking_action_tokens
  add constraint booking_action_tokens_purpose_check
  check (purpose in ('confirm', 'reschedule', 'cancel', 'feedback'));

create table public.consultation_feedback (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  attorney_id uuid not null references public.attorneys(id) on delete cascade,
  -- The three operational signals F-03 names. Deliberately NOT an overall
  -- score: there is no composite rating column to accidentally surface.
  attended boolean,
  fee_as_disclosed boolean,
  format_as_disclosed boolean,
  communication_rating smallint check (communication_rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- One feedback row per booking; the token is single-use, this is the
-- backstop if a token is ever re-issued for the same booking.
create unique index consultation_feedback_booking_id_idx
  on public.consultation_feedback(booking_id);
create index consultation_feedback_attorney_id_idx
  on public.consultation_feedback(attorney_id);

alter table public.consultation_feedback enable row level security;

-- Admin read only. No insert/update/delete policy on purpose -- see the
-- guardrail note above.
create policy "consultation_feedback_select_admin"
  on public.consultation_feedback for select
  to authenticated
  using ((select public.is_admin()));
