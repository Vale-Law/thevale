# Sprint 2 Manifest — Staff Access, Calendar Truth, Trust & Revenue Surfaces

Status: **proposed, awaiting owner approval.** No application code written against this
Manifest yet.

Produced by auditing the current codebase directly (not by re-reading the old gap docs from
memory) against `docs/KNOWN_GAPS.md`, `docs/TRACK_B_MANIFEST.md`, and what actually shipped
in the merged PRs (#7, #8, #9). Every "still open" claim below was verified against live code
in this pass, not assumed from prior docs — several things the old `KNOWN_GAPS.md` called
open (the `completed` status transition, a real availability engine) turned out to already be
built; this Manifest only lists what's actually still missing today.

---

## What Sprint 1 shipped (context, not scope)

- Brief Design System v2 foundation: `tokens.css`, `src/components/primitives/**`, a
  verification gallery at `/dev/primitives`.
- Firm/staff multi-tenancy schema: `firms`, `firm_members`, `attorneys.firm_id`,
  `booking_status_events` audit trail, RLS re-scoped from attorney-owns-row to
  firm-owns-row.
- Public booking page, self-service manage links, and the attorney pipeline
  (dashboard/bookings/availability) retrofitted to DS v2, both themes.
- A real (rules-based) availability engine — weekly hours, buffer, minimum notice, daily
  cap, already-booked exclusion. No external calendar input yet (see A2 below).
- Cron schedule and `DashboardShell` dark-mode fixes (production incidents from this
  sprint, already resolved).

## Current-state audit — confirmed open

1. **The `staff` role has no frontend at all.** `src/lib/AuthContext.jsx`'s `deriveRole()`
   only returns `admin` / `attorney` / `client`; `RoleRoute`'s `allow` arrays and
   `roleUtils.homeForRole()` never mention `staff`. The firm/staff schema this sprint built
   is fully functional at the RLS layer — a firm's office manager could already read the
   firm's bookings via Postgres — but there is no signup flow, no login routing, and no UI
   surface for that person. This was the whole stated point of the firm schema and it's
   still not reachable.
2. **No calendar sync.** `attorney_calendar_connections` exists as a table and nothing else
   references it (`grep` across every `.js`/`.jsx` file: zero hits outside migrations). No
   OAuth flow, no free/busy read, no external-conflict blocking in
   `src/lib/availability.js` (which is real and correct for *app-internal* bookings, just
   blind to anything on an attorney's actual calendar).
3. **Admin portal is entirely unretrofitted.** Every file under `src/pages/admin/**` is
   still 100% hardcoded hex — zero references to `tokens.css` custom properties. This is
   the same class of gap `AdminShell` was deliberately left on `theme="legacy"` for during
   the `DashboardShell` fix; retrofitting these pages is the unlock for eventually flipping
   `AdminShell` to `theme="tokens"` too.
4. **Reviews are read-only.** `AttorneyProfile.jsx` does a real `Review.filter()` read;
   nothing anywhere writes a review. No post-consultation request flow, no submission
   form, no moderation surface.
5. **No payment processing exists in code at all** — confirmed via a repo-wide grep for
   `stripe`/`Stripe`, matches only in docs and `package.json`'s comment-adjacent text, no
   actual integration. The product doc explicitly deferred this post-MVP; **this needs an
   explicit call from you before either track scopes it in** (see Decision D1).
6. **`practice_area` (single) vs `practice_areas` (array) is still split**, unresolved,
   across `AttorneyProfile.jsx`, `AttorneyPending.jsx`, `AttorneyApplication.jsx`, and the
   admin application-review pages. Personal Injury is still a live option despite the
   product doc scoping the Houston launch to Family Law / Immigration / Business Formation
   only.

## Decisions needed before work starts

Same spirit as Sprint 1's escalations — these block clean scoping, not code:

- **D1 — Is billing in scope this sprint?** The product doc deferred Stripe post-MVP. If
  the business wants revenue capture now (the `completed` status transition already exists
  as a real trigger point — that part's ready), it's a third track-sized effort on its own
  and probably shouldn't be bolted onto either track below as a sub-item.
  **Recommendation: leave out of this sprint**, revisit once staff access + calendar sync
  prove the platform out with real firms.
- **D2 — Personal Injury: cut or keep?** If the Houston launch really is
  Family Law/Immigration/Business Formation only, B3 below should *remove* Personal Injury
  from every enum/UI surface, not just leave it alongside the others. Needs an explicit
  yes.
- **D3 — Calendar provider order.** Google first, Microsoft second (sequential), or both
  in parallel? Recommend Google first — almost certainly the larger share of attorneys,
  and it de-risks the OAuth/token-refresh/free-busy pattern before doubling it.
- **D4 — Staff invite mechanism.** Should a firm owner invite staff by email (needs a
  token-based invite flow, similar in shape to `booking_action_tokens`), or does an admin
  manually create staff accounts for now (much smaller scope, no email infra needed)?
  Recommend the admin-manual path for this sprint, email-invite as a fast-follow — it
  unblocks A1 without also requiring new email infra to land first.

---

## Track A — Core Platform: Staff Access, Calendar Truth, Admin Parity

Owns: `src/lib/AuthContext.jsx`, `src/lib/roleUtils.js`, `src/components/shell/**`,
`src/routes/**`, `src/pages/admin/**`, new calendar-sync API routes/edge functions,
`attorney_calendar_connections` wiring, any new migration touching `profiles.role` /
`firm_members` / calendar tables.

| Unit | Scope | Depends on | Files (write) |
|---|---|---|---|
| **A1 — Staff role + firm-scoped pipeline access** | Add `staff` to `deriveRole()`/`RoleRoute`/`homeForRole()`. A `staff` user should land on the *same* `AttorneyBookings`/`AttorneyDashboard` pipeline views as an attorney in their firm, scoped by `firm_members`, not `attorneys.user_id`. Requires re-pointing the pipeline's data queries from `attorney_id: attorney.id` to a firm-wide query (join through `firm_members`) — this is the actual functional gap E1 always described. Admin-manual staff account creation for now (D4) — no invite email needed this unit. | D4 decision | `src/lib/AuthContext.jsx`, `src/lib/roleUtils.js`, `src/components/shell/RoleRoute.jsx`, `src/components/shell/AttorneyShell.jsx`, `src/pages/attorney/AttorneyBookings.jsx` (query only), `src/pages/attorney/AttorneyDashboard.jsx` (query only), one migration if a staff-creation RPC is needed |
| **A2 — Google Calendar OAuth + free/busy sync** | OAuth connect flow (new route + callback), token storage in `attorney_calendar_connections` (already has the right shape from Sprint 1), a free/busy read merged into `computeAvailableSlots()`'s `existingRanges` input. Needs real Google Cloud OAuth credentials configured as env vars — flag this as a blocker the moment it's hit, don't stub around it. | D3 decision, Google OAuth app credentials | `src/lib/availability.js` (extend, don't rewrite — its App-booking exclusion logic stays), new `api/calendar-*.js` routes, `src/pages/attorney/AttorneyAvailability.jsx` (connect/disconnect UI) |
| **A3 — Admin portal DS v2 retrofit** | Same treatment as the attorney portal this sprint: swap hardcoded hex for tokens/primitives across `AdminDashboard`, `AdminApplications`, `AdminApplicationDetail`, `AdminAttorneys`, `AdminBookings`, `AdminUsers`, both themes. Once done, flip `AdminShell`'s `theme` prop from `"legacy"` to `"tokens"` (it already supports this — see `src/components/shell/DashboardShell.jsx`'s `THEME` map from the shell-theming fix). | None (fully self-contained) | `src/pages/admin/**`, `src/components/shell/AdminShell.jsx` (one-line theme prop flip, do this *last*, after every admin page is retrofitted — flipping early reproduces this sprint's exact dark-mode bug on the admin portal) |

**Suggested prompt split:** A1, A2, and A3 are fully independent of each other (different
files, no shared state) — three separate prompts/sessions, any order. A2 is the largest;
if further sub-scoping helps, split A2 into "OAuth connect flow" and "free/busy merge into
availability.js" as two prompts.

## Track B — Trust & Product Completeness: Reviews, Email, Practice-Area Cleanup

Owns: `src/components/attorney/**` (review display/submission), a new reviews-write route
or component, `src/lib/email.*` / `emails/**` (new), `api/send-email.js` /
`api/send-reminders.js`, every page currently reading/writing `practice_area` (singular).

| Unit | Scope | Depends on | Files (write) |
|---|---|---|---|
| **B1 — Review write path** | Post-consultation review request (triggered off a booking transitioning to `completed` — the audit trail from Sprint 1 already gives you a clean hook via `booking_status_events`), a submission form (no login required, token-based like `booking_action_tokens`), and RLS allowing a client to insert exactly one review per completed booking. Use `Field`/`Button`/`Card` primitives from Sprint 1, both themes. | `completed` status (already exists) | new `src/pages/SubmitReview.jsx`, one migration (`review_action_tokens` or extend `booking_action_tokens`'s `purpose` enum), RLS on `public.reviews` |
| **B2 — Email templates to DS v2 spec + verified rendering** | The existing `api/_lib/mailer.js`/`bookingEmailBody()` works functionally but was never built to the original DS v2 email spec (600px, Georgia for name/invite roles + system sans elsewhere, no halftone/grain, one action per email, `prefers-color-scheme` overrides, plain-text alternative). Rebuild the templates properly, then verify rendering in at least two real clients (Apple Mail, Gmail) in both themes before calling it done — don't ship a redesign nobody's actually seen render. | None | `api/_lib/mailer.js`, new `emails/**` template source if that split is worth it |
| **B3 — Practice-area consolidation** | Resolve D2 first. Then: pick one field (`practice_areas`, the array — it's the newer one and already what `BookingPage.jsx` prefers when present) as canonical, migrate every read/write site off `practice_area` (singular), drop the column once nothing references it, and if D2 says cut Personal Injury, remove it from every enum/dropdown/copy site, not just the attorney-facing ones. | D2 decision | `src/pages/attorney/AttorneyProfile.jsx`, `src/pages/attorney/AttorneyPending.jsx`, `src/pages/AttorneyApplication.jsx`, admin application-review pages, one migration to drop the legacy column |

**Suggested prompt split:** B1 and B2 are independent. B3 touches files B1/B2 don't, but
do it *last* on this track since dropping the legacy column is easiest to get right once
nothing's mid-flight elsewhere — sequence it after B1/B2 land, or run it in parallel if
whoever picks it up is comfortable rebasing once.

---

## Working this Manifest

- One unit → one prompt → one branch → one PR, same pattern as this sprint's individual
  fixes (each PR was scoped to a single concern and merged independently).
- Track A and Track B share **zero files** by design — the only real cross-track risk is if
  A1's pipeline query change and something in B lands on the same day; check
  `git diff --stat` against the other track's PRs before merging if timing gets close.
- If a unit turns up its own blocking gap the way this sprint's units did (the branch
  vs. production Supabase mixup, the cron plan limit), stop and escalate rather than
  quietly working around it — that's what turned a five-minute fix into a multi-hour one
  twice this sprint.
