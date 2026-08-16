# Known Gaps & Stubbed Functionality — V2 Codebase Review

## Wave 1 money-loop enforcement (audit 2026-08-15, landed 2026-08-16)

Status of the seven Wave 1 items after this PR. DB pieces live in
`supabase/migrations/20260817000000_wave1_money_loop_enforcement.sql`.
*Migrations are written but NOT applied to production — owner applies them
(see the Wave 1 PR body for the exact checklist).*

1. **Server-side subscription enforcement — FUNCTIONAL.** Was: only
   `SubscriptionGate.jsx`/`AttorneyShell.jsx` (client-side UI) gated the
   portal; every API accepted requests from unsubscribed firms. Now:
   `api/bookings-public.js` 404s a booking POST when the attorney's firm
   has no active subscription (`active`/`trialing`/`past_due`, mirroring
   the shell), `api/connect-onboarding.js` refuses Connect onboarding
   without one, `api/subscription-checkout.js` refuses to stack a second
   Checkout on an already-active firm, and the DB backstop
   (`firm_has_active_subscription()` + the `consultation_charges` insert
   trigger) blocks a firm-member JWT from creating charge rows for a
   cancelled or never-subscribed firm. Still open: read-only surfaces
   (`get_public_booking_page`, `/api/availability`) still render an
   unsubscribed firm's page/slots — the booking POST is the enforcement
   point; calendar-connect endpoints remain UI-gated only.

2. **Webhook fulfillment of unpaid sessions — FUNCTIONAL.**
   `api/webhooks-stripe.js` only syncs a subscription off
   `checkout.session.completed` when `payment_status` is `paid` (or
   `no_payment_required`); `api/webhooks-stripe-connect.js` only marks a
   consultation charge `charged` when the session is `paid`, and now also
   handles `checkout.session.async_payment_succeeded`. Both handlers read
   the raw body defensively (pre-buffered body used when present) so a
   configured deploy can't hang/5xx on a valid signature; missing
   env vars still return 503 by design until the owner sets the signing
   secrets on Vercel.

3. **Silent refund failures — FUNCTIONAL.** `refundIfCharged()` in
   `api/manage.js` no longer has an empty `catch {}`: a failed refund is
   logged, stamped onto the charge row (`refund_failed_at`,
   `refund_failure_reason` — server-only columns), and returned to the
   client screen as `refundError`. Still open: the firm pipeline UI does
   not yet render the failure marker; it's queryable on the row.

4. **Email-confirm without payment — FUNCTIONAL.** The `/manage/:token`
   confirm path refuses (402, token left unconsumed) while the booking's
   charge row is `pending` with a Stripe Checkout session id — covering
   the webhook race with a live, fail-closed session lookup. Bookings
   whose fee is collected out-of-band (no session id) confirm exactly as
   before.

5. **Caller-supplied `amount_cents` — FUNCTIONAL.** Insert-time
   `amount_cents` from a non-server, non-admin caller is overwritten in
   the charge trigger with the attorney's listed `consult_fee` (fallback:
   the historical 5000 default). Post-insert changes were already locked
   in Wave 0.

6. **Anon-readable attorney PII — FUNCTIONAL.** The
   `attorneys_select_public_verified` row policy (full row world-readable:
   email, phone, uploaded ID/bar-card documents, `user_id`) is dropped.
   Public surfaces (directory, profile, booking fallback, legacy
   redirect) read the new `attorneys_public` view — public-safe columns
   only, verified attorneys only. Firm staff keep full-row access via a
   new firm-member policy; own/admin policies unchanged.

7. **Demo seed in production — FUNCTIONAL.**
   `20260728120000_seed_demo_booking_pipeline.sql` is now a no-op unless
   the session sets `vale.seed_demo_pipeline = 'on'` (local/dev opt-in
   documented in the file header), so the ordered prod migrate path can no
   longer fabricate completed bookings, charged rows, or fake client PII.

## Wave 0 money-loop locks (audit 2026-08-15, locks landed 2026-08-16)

Three critical audit findings, status after the Wave 0 PR. Scope was these
three only; everything else from the audit is Wave 1.

1. **Admin self-promotion — FUNCTIONAL (locked).** Was: `profiles_update_own`
   let any authenticated user set their own `profiles.role = 'admin'`, and
   `AdminEntry.jsx`'s "Enable admin access" button did it in one click. Now:
   `protect_profiles_role` trigger
   (`supabase/migrations/20260816000000_wave0_role_and_status_locks.sql`)
   rejects any non-admin role change except the self-service
   `user`/`client`/`attorney` onboarding moves; `admin` and `staff` are only
   settable server-side (service role / `add_firm_staff`). The self-promote
   button is gone — `/admin` is a dead-end screen for non-admins. The only
   admin grant path is the service-role migration
   `20260816000100_grant_founder_admin.sql` (founder email, idempotent).
   *Note: migrations are written but NOT applied to production — owner
   applies them.*

2. **Directory booked without charging — FUNCTIONAL (locked).** Was:
   directory/profile Book controls routed to legacy `/booking`
   (`Booking.jsx`), a client-side `bookings` insert that displayed the fee
   and never charged; the Stripe path (`/book/:slug` →
   `api/bookings-public.js`) was only reachable via the attorney's shared
   link. Now: `BookingPanel.jsx`/`BookingWidget.jsx` route to
   `/book/:slug`, the legacy page and its step components are deleted, and
   `/booking` is a redirect (`LegacyBookingRedirect.jsx`) that translates
   old `?attorney=<id>` links to `/book/:slug` or the directory. The
   `/confirmation` receipt screen for the fake flow is gone with it.

3. **Client self-confirm/complete bookings — FUNCTIONAL (locked).** Was:
   `bookings` RLS scoped by ownership only, so a client JWT could insert or
   update its own booking to `confirmed`/`completed` (the states metrics and
   the consultation charge hang off). Now: `protect_bookings_status` trigger
   restricts those two transitions to firm members of the booking's
   attorney, admins, and the server (service role — `api/manage.js` token
   confirm, webhooks). Also locked (audit item 7, partially):
   `protect_consultation_charges` makes the payment-state fields
   (`charged`/`reversed` status, `charged_at`, `stripe_payment_intent_id`,
   `paid_at`, `refunded_at`, post-insert `amount_cents` changes)
   server/admin-only. **Wave 1 residual — now closed:** insert-time
   `amount_cents`, server-side subscription enforcement, refund logging,
   the email-confirm payment check, and the anon-readable `attorneys` row
   are all addressed in the Wave 1 section above (landed 2026-08-16).

Reviewed: 2026-07-26
Scope: re-sync from the cofounder's latest Base44 export ("Brief" / working title "The Vale"), replacing the V1 snapshot reviewed 2026-07-12. Measured against `docs/` product definition in Notion ("The Vale — Canonical Product Definition") and the original V1 gap list below.

## Architecture note (still true, read this first)

This is still a **frontend-only repository** as of this sync. Auth, database, file storage, transactional email, and even the AI matching agent all live on [Base44](https://base44.com)'s hosted platform, not in this repo. The `base44/*.jsonc` files (entities + the one agent config) are schema/config declarations mirroring the Base44 dashboard — editing them here doesn't change the live backend. See `docs/MIGRATION.md` for what it takes to move off Base44 onto Vercel + a real database.

## What changed since V1 (2026-07-12)

Resolved:
- **Admin/vetting layer now exists.** Full route tree under `/admin` (`AdminEntry`, `AdminDashboard`, `AdminApplications`, `AdminApplicationDetail`, `AdminAttorneys`, `AdminBookings`, `AdminUsers`). Attorney applications carry a real `verification_status` (`pending` / `verified` / `rejected`) on the `Attorney` entity, with bar number/state, uploaded ID + bar card documents, and admin approve/reject actions that send email via `base44.integrations.Core.SendEmail`.
- **Route protection is wired up.** `RoleRoute` + three shell components (`ClientShell`, `AttorneyShell`, `AdminShell`) gate every dashboard route by `effectiveRole` (derived from `User.role` / `User.account_type`) and by attorney verification status. Unverified attorneys are bounced to `/attorney-pending`; wrong-role users are bounced to their own home route.
- **Attorney dashboard is now ownership-scoped.** `AuthContext` loads the `Attorney` record by `user_id` tied to the logged-in user (`Attorney.filter({ user_id })`), rather than listing every attorney in a dropdown. The V1 cross-account-edit issue is closed on the frontend (server-side RLS in Base44 still needs independent confirmation — see Open Decisions).
- **Client intake now persists as its own record.** A new `CaseSummary` entity captures practice area, description, key facts, location, urgency, budget, and language independent of whether a booking happens — closes the V1 "intake data is lost if no booking" gap.
- **Financing UI removed from the booking flow.** `StepPayment.jsx` now offers "pay in full" only; Klarna/Affirm/LawFi are gone from the live flow and demoted to a footer teaser, matching the product doc's "Post-MVP" scoping. Real payment capture is still not implemented (see below) — this was a UI-scope cut, not a Stripe integration.
- **Mobile shell built.** New `MobileShell`, `MobileTabBar`, `MobileTopBar`, `MobileMenu`, `BottomSheet`, `useIsMobile` components deliver the "native app" mobile behavior called for in the product doc.
- **AI matching concierge now exists**, implemented as a Base44 Agent (`base44/agents/legal_matching_concierge.jsonc`) plus `ConciergePanel`/`MatchConcierge` UI and `conciergeUtils.js`. It's scoped tightly: read-only access to the `Attorney` entity, hard-coded guardrails against naming/ranking attorneys or giving legal advice, stateless.
- **New `Waitlist` entity** for capturing emails from users in states without live attorney coverage.

Still open from V1 (confirmed still true in this export):
- **No real payment processing.** `StepPayment.jsx` still only records which option a client picked as a string field on `Booking`; there's no Stripe Elements, no charge, no webhook. `@stripe/stripe-js`/`@stripe/react-stripe-js` remain unused dependencies. This is now *consistent* with the product doc, which explicitly defers platform payments post-MVP — but it means "clients pay attorneys directly" has no supporting mechanism in the app at all today (not even a manual invoice/receipt flow).
- **No attorney intro video.** Still no upload field, storage wiring, or display component anywhere in `src/components/attorney/*` despite the product doc calling this out historically as a trust signal (it's not in the current canonical doc's MVP list either, so this may now be intentionally deferred — worth confirming it's not still assumed elsewhere).
- **Practice-area scope still contradicts the canonical doc.** `Attorney.practice_area` enum and `LearnPersonalInjury.jsx` still include **Personal Injury**; the current product doc scopes the Houston launch to **Family Law, Immigration, and Business Formation only**. A new `practice_areas` (array) field was added alongside the old single-value `practice_area`, which suggests a migration is mid-flight but not finished — worth confirming which field the UI should read from going forward.

New gaps found in this review (not called out in V1, because the features they attach to didn't exist yet):

1. **No calendar sync at all — this is the biggest gap vs. the product vision.** The product doc's core differentiator is "attorneys never do data entry" / calendar-computed availability via Google Calendar + Microsoft Graph OAuth (free/busy scopes) and a DB-level double-booking constraint. The actual implementation (`src/pages/attorney/AttorneyAvailability.jsx`) is a fully manual add/remove list of ISO timestamps stored directly on the `Attorney` record — no OAuth, no external calendar read, no conflict detection beyond simple array membership. Every "Edge Function" and calendar integration described in the doc is unbuilt.
2. **No "completed" transition on bookings — which is the billing trigger.** `Booking.status` includes `completed` in its enum and both `attorney/AttorneyBookings.jsx` and `admin/AdminBookings.jsx` render it as a filter/badge color, but neither page (nor any other file) contains code that actually *sets* a booking to `completed`. Since the flat $50 fee is charged "per completed consultation," there is currently no mechanism to trigger that charge — this matches the open decision Fable's own product-opinion section flags in the Notion doc, so it isn't new news, just confirmed still unbuilt in code.
3. **Reviews are read-only and unpopulated.** `Review` entity and `AttorneyProfile.jsx` do real `Review.filter({ attorney_id })` reads (not mocked), but there is no write path anywhere — no post-consultation review-request flow, no submission form. The product doc lists "reviews strategy" as an explicit open decision; the code currently implements the read side only.
4. **Orphaned dead pages removed during this sync.** The old flat `src/pages/AttorneyDashboard.jsx`, `AttorneyPending.jsx`, and `AdminVerification.jsx` existed in the Base44 export but were unreferenced by the app (superseded by the new `src/pages/attorney/*` and `src/pages/admin/*` role-scoped pages plus `RoleRoute`). Deleted here to avoid confusion; if Base44's dashboard still lists them as live pages, they should be archived there too so the two don't drift.

## Secrets / environment variables

Same as V1: no hardcoded credentials found. Env vars read via `import.meta.env`: `VITE_BASE44_APP_ID`, `VITE_BASE44_APP_BASE_URL`, `VITE_BASE44_FUNCTIONS_VERSION`. The non-secret Base44 app ID (`6a20eafdf3fbb0512c514d25`) is still hardcoded into `media.base44.com` marketing image URLs and now also into `index.html`'s favicon/apple-touch-icon links — those break the day this app is detached from that specific Base44 instance (see `docs/MIGRATION.md`).
