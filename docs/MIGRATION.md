# Migrating off Base44: Vercel + Supabase Plan

Written: 2026-07-26. Updated same day — **Phases 1–3 are done, Phase 4 (deploy) in progress**, see status below.

This app is currently 100% dependent on Base44's hosted backend — there is no code in this repo that talks to a database, auth provider, file store, email sender, or LLM directly. Every one of those goes through `src/api/base44Client.js` → `@base44/sdk` → Base44's servers. Making the app "publicly accessible on our own infrastructure" means replacing that one client with real services, everywhere the SDK is called. This doc inventories exactly what that touches and lays out a phased path onto **Vercel (hosting) + Supabase (auth/DB/storage)**, which is the natural swap given how the schema is already shaped.

## Status (2026-07-26)

**Done:**
- New Supabase project: `the-vale` (ref `gzmdsyuqhegcesoekuoo`), org `studio-faaji's Org`, region `us-east-1`, Postgres 17 — a **separate project** from the org's existing one, which runs an unrelated live app. Costs $10/month on the org's Pro plan.
- Full schema applied — `profiles`, `attorneys`, `bookings`, `case_summaries`, `waitlist`, `reviews`, RLS on every table, plus Storage buckets (`attorney-photos` public, `attorney-documents` private). Migration SQL in `supabase/migrations/`.
- `get_advisors` (security + performance) clean except one intentional flagged pattern (`waitlist`'s public insert policy — it's a public signup form by design).
- **`src/api/base44Client.js` rewritten** as a Supabase-backed adapter with the exact same shape the app already calls (`auth.*`, `entities.*`, `integrations.Core.*`) — every call site audited individually (see git history) rather than assumed. `AuthContext.jsx` simplified to drop Base44's app-level "public settings" preflight, which has no Supabase equivalent, in favor of Supabase's session/`onAuthStateChange` model.
- **Discovered the concierge agent (`base44/agents/legal_matching_concierge.jsonc`) isn't actually invoked by any shipped frontend code** — `ConciergePanel.jsx` is a fully deterministic step-by-step form, not an LLM chat. So there's no agent function to build; the row in the table below describing it is what *would* be needed only if that agent gets wired up later.
- `SendEmail` now routes through `api/send-email.js`, a Vercel serverless function calling Resend — not yet live because no `RESEND_API_KEY`/`RESEND_FROM_EMAIL` exists yet (see "Not done yet"). The frontend already treats email failures as non-fatal everywhere it's called, so this fails soft rather than breaking flows.
- `vite.config.js` no longer depends on `@base44/vite-plugin` (its only real job was the `@/…` import alias, which Vite's own `resolve.alias` now does directly); `@base44/sdk` and `@base44/vite-plugin` removed from `package.json` entirely.
- Deleted three files that no longer apply under Supabase: `ProtectedRoute.jsx` and `UserNotRegisteredError.jsx` (both were Base44 app-registration-error concepts with zero remaining references — `RoleRoute` already supersedes the former), and `lib/app-params.js` (Base44 URL/localStorage token plumbing).
- `ResetPassword.jsx` adjusted: Base44's flow read a `?token=` query param explicitly; Supabase's recovery flow instead establishes a session automatically when the user clicks the email link, so the page now checks for that session instead.
- `npm run build` and `npm run lint` both pass clean against the live Supabase project.

**Not done yet / needs you:**
- **Email isn't live** — sign up for Resend (or swap the provider in `api/send-email.js`), verify a sending domain, and set `RESEND_API_KEY` + `RESEND_FROM_EMAIL` as **server** env vars in Vercel (never prefix `VITE_`).
- **OAuth providers aren't configured** — Google (and Apple, if wanted) sign-in needs client ID/secret set up in the Supabase dashboard under Authentication → Providers. Not exposed via the available MCP tools.
- **Google Calendar sync (F-01) is built but not live** — `api/calendar-connect.js` / `api/calendar-callback.js` / `api/_lib/googleCalendar.js` implement the free/busy-only OAuth flow end to end (Development Sprint v1.2, Track A W1), and `api/availability.js` merges live free/busy into slot computation on every request. This is a *separate* Google Cloud OAuth client from the Supabase Auth sign-in provider above — set these as **server** env vars in Vercel (never `VITE_`) to turn it on: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` (from a Google Cloud OAuth 2.0 Client with the Calendar API's `calendar.freebusy` scope enabled, and the deployed origin's `/api/calendar-callback` registered as an authorized redirect URI), and `CALENDAR_TOKEN_ENCRYPTION_KEY` (32 random bytes, base64 — `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`). Until all three are set, `isGoogleCalendarConfigured()` is false and the connect endpoint returns a soft 503, same convention as `RESEND_API_KEY` above — no code path fakes a connection without real credentials.
- **Email-OTP template** — the signup/attorney-application flows expect a 6-digit code (`verifyOtp`), but Supabase's default email template sends a magic link. In the Supabase dashboard, edit the "Confirm signup" email template to include `{{ .Token }}` so users actually receive a code to type in.
- **No live browser test yet** — build/lint pass and the dev server serves the app correctly, but the full auth flows (signup → OTP → login, OAuth redirect, password reset, file upload) haven't been exercised end-to-end in a real browser against this project. Worth a manual pass after deploy.
- **Column-level exposure on `attorneys`**: the public-read RLS policy is row-level (verified attorneys only), not column-level — an anonymous visitor querying the table gets every column on a verified attorney's row, including `bar_number`, `phone_number`, `email`, and the *paths* to their private documents (though not the documents themselves — `attorney-documents` storage policies still block generating a signed URL for anyone but the owner/an admin). Moderate severity, not fixed in this pass; the clean fix is a public-safe view exposing only directory-facing columns.

## Why Supabase specifically

The `base44/entities/*.jsonc` files already declare, per entity, a JSON-schema-shaped table definition plus an `rls` block (e.g. `CaseSummary`'s `read: { created_by_id: "{{user.id}}" }`). That's not incidental — it's the same mental model as Postgres Row-Level Security. Supabase gives you hosted Postgres + RLS + Auth + Storage + Edge Functions as one product, so the migration is mostly a **literal translation** of what's already declared, not a redesign. (Firebase/Auth0/etc. would work too, but you'd lose that direct schema mapping and need a separate DB anyway.)

## What has to move, concretely

| Base44 SDK call | Where it's used | Replacement |
|---|---|---|
| `base44.auth.register/loginViaEmailPassword/loginWithProvider/verifyOtp/resendOtp/resetPassword*/me/updateMe/logout/setToken` | `Login.jsx`, `Register.jsx`, `AttorneyApplication.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`, `AuthContext.jsx`, `onboarding/*` (~15 call sites) | **Supabase Auth** — email/password, Google OAuth, and OTP are all built in. Apple OAuth needs a paid Apple Developer setup either way. |
| `base44.entities.{Attorney,Booking,CaseSummary,Waitlist,Review}.{list,filter,create,update}` | Across most pages (~30 call sites) | **Supabase Postgres tables**, one per entity, RLS policies translated from the `rls` blocks already in the `.jsonc` files |
| `base44.integrations.Core.UploadFile / UploadPrivateFile / CreateFileSignedUrl` | `AttorneyApplication.jsx` (ID, bar card, board cert uploads), `attorney/AttorneyProfile.jsx` (photo) | **Supabase Storage** — a public bucket for profile photos, a private bucket + signed URLs for ID/bar-card/board-cert docs |
| `base44.integrations.Core.SendEmail` | `Account.jsx`, `Booking.jsx`, `AttorneyApplication.jsx`, `admin/AdminApplicationDetail.jsx` | **Done** — `api/send-email.js`, a Vercel serverless function calling Resend. Needs `RESEND_API_KEY`/`RESEND_FROM_EMAIL` set in Vercel to actually send. |
| `base44/agents/legal_matching_concierge.jsonc` (a Base44 Agent config) | Nothing — turns out `ConciergePanel.jsx`/`MatchConcierge.jsx` are a deterministic step-by-step form, not an LLM chat | **Nothing to migrate.** The agent config exists but is unused by any shipped UI. Only relevant if someone wires up an actual LLM-driven concierge later — at that point it'd need a Vercel function for the same reason as email (API key can't live client-side). |
| N/A — not built on Base44 | Attorney calendar sync | **Done for Google** (Development Sprint v1.2, Track A W1) — `api/calendar-connect.js` / `api/calendar-callback.js` / `api/_lib/googleCalendar.js`, free/busy scopes only, refresh token AES-256-GCM encrypted before storage in `attorney_calendar_connections.refresh_token_encrypted`. Needs `GOOGLE_OAUTH_CLIENT_ID`/`GOOGLE_OAUTH_CLIENT_SECRET`/`CALENDAR_TOKEN_ENCRYPTION_KEY` set (see "Not done yet" below). Microsoft Graph is an explicit fast-follow, not built. |

## Concrete phasing

**Phase 1 — Stand up Supabase**
- Create a Supabase project; recreate the six entities as tables (`attorneys`, `bookings`, `case_summaries`, `waitlist`, `reviews`, plus `auth.users` handles `User`). Field lists translate directly from the `.jsonc` `properties` blocks — nothing needs to be invented.
- Turn each entity's `rls` block into Postgres RLS policies (e.g. `CaseSummary`'s owner-only read/update/delete becomes `USING (auth.uid() = created_by_id)`).
- Enable Supabase Auth: email/password + Google OAuth provider. Decide whether OTP-based signup (currently used for both client and attorney registration) maps to Supabase's email OTP or gets simplified to a standard email-confirmation link — worth a product call, not just an engineering one.
- If there's existing production data in the live Base44 app (bookings, attorney applications, etc.), export it via the Base44 dashboard and bulk-import into the new tables before cutover.

**Phase 2 — Swap the SDK client** ✅ done
- `src/api/base44Client.js` is now a `supabase-js`-backed adapter preserving the same call shape, built after auditing every one of the ~75 distinct call sites individually rather than assumed generically.

**Phase 3 — Move what needs a real backend** ✅ done (email; concierge turned out to be moot)
- `SendEmail` → `api/send-email.js`, a Vercel Function calling Resend.
- The concierge agent needed nothing — it's not wired to any LLM call in the shipped UI (see status above).
- Signed file URLs are handled natively by Supabase Storage.

**Phase 4 — Deploy** ← blocked on one manual step (env vars)
- Discovered (didn't need to set up): this repo already has a Vercel project (`thevale`, team `Tim's projects`) connected via GitHub integration, auto-deploying every push. `main` → production (`thevale.vercel.app`, still the old Base44 build — untouched, merging is your call); this branch → preview deployments automatically.
- `vercel.json` added with a SPA rewrite (`/((?!api/).*)` → `/index.html`) so client-side routes don't 404 on refresh, while leaving `/api/*` to the serverless functions.
- **The build succeeds, but the app will crash on load (blank page) until env vars are set** — `createClient()` throws synchronously if `VITE_SUPABASE_URL` is missing, and nothing in this session's tool access can set Vercel project environment variables (no such tool exists in the connected Vercel MCP; it's dashboard-only: Project Settings → Environment Variables). You need to add, for Preview (and Production, once you merge):
  - `VITE_SUPABASE_URL` = `https://gzmdsyuqhegcesoekuoo.supabase.co`
  - `VITE_SUPABASE_ANON_KEY` = the publishable key (Supabase dashboard → Project Settings → API, or ask me to pull it again)
  - `RESEND_API_KEY` / `RESEND_FROM_EMAIL` (server-only, no `VITE_` prefix) once you have a Resend account + verified sending domain — until then `SendEmail` fails soft (already handled everywhere it's called).
  - After adding these, redeploy (or push an empty commit) so the build picks them up.
- Still true: the hardcoded `media.base44.com` image URLs and the `6a20eafdf3fbb0512c514d25` app ID baked into `index.html`'s favicon/apple-touch-icon links point at the Base44-hosted instance and will break once fully detached from it — not fixed in this pass, low priority (cosmetic).

**Phase 5 — Build what was never built**
- Real payment capture (Stripe), the completed-consultation transition that triggers the $50 attorney fee, and calendar OAuth sync are all still open regardless of which backend hosts the app — see `docs/KNOWN_GAPS.md` for the full list. Moving off Base44 doesn't create these gaps, but it's the point where they stop being "someone else's server would handle this" and become "we need to write this."

## What does *not* need to change

The React/Vite/Tailwind/shadcn frontend, the routing and role-gating logic (`RoleRoute`, the three shell components), and all UI/business logic are backend-agnostic already — they call through the one client module. That's the main thing this migration has going for it: it's a swap at the data layer, not a rewrite of the app.
