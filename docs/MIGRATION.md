# Migrating off Base44: Vercel + Supabase Plan

Written: 2026-07-26. Updated same day — **Phase 1 (Supabase project + schema) is done**, see status below.

This app is currently 100% dependent on Base44's hosted backend — there is no code in this repo that talks to a database, auth provider, file store, email sender, or LLM directly. Every one of those goes through `src/api/base44Client.js` → `@base44/sdk` → Base44's servers. Making the app "publicly accessible on our own infrastructure" means replacing that one client with real services, everywhere the SDK is called. This doc inventories exactly what that touches and lays out a phased path onto **Vercel (hosting) + Supabase (auth/DB/storage)**, which is the natural swap given how the schema is already shaped.

## Status (2026-07-26)

**Done, via the Supabase MCP:**
- New Supabase project created: `the-vale` (ref `gzmdsyuqhegcesoekuoo`), org `studio-faaji's Org`, region `us-east-1`, Postgres 17. Deliberately a **separate project** from the org's existing one (`studio-faaji's Project`), which already runs an unrelated live app (a mood-board/creative-scraping tool) — kept isolated rather than mixing schemas or sharing `auth.users` between two unrelated products. This costs **$10/month** on the org's Pro plan.
- Full schema applied — six tables (`profiles`, `attorneys`, `bookings`, `case_summaries`, `waitlist`, `reviews`) translated directly from `base44/entities/*.jsonc`, with RLS enabled and policies on every table. Migration SQL is checked into `supabase/migrations/` in this repo.
- `public.profiles` mirrors Base44's `User` entity (`role`, `account_type`, etc.) with a trigger that auto-creates a profile row on signup — this is the standard Supabase pattern for extending `auth.users`.
- Ran `get_advisors` (security + performance) and fixed everything it flagged except two low-risk items below: consolidated redundant RLS policies, wrapped `auth.uid()` calls per Supabase's performance guidance, added the one missing FK index.
- Project URL: `https://gzmdsyuqhegcesoekuoo.supabase.co`. Publishable (anon) key is safe to put client-side (that's what RLS is for) — ask for it again via the Supabase dashboard (Project Settings → API) or MCP `get_publishable_keys` when wiring up `.env.local`; not repeating it verbatim here since docs get copied around.

**Not done yet:**
- **Two pending security-hardening statements**, drafted but not yet applied (the Supabase MCP connection dropped mid-session before I could run them): revoke public EXECUTE on the two `SECURITY DEFINER` trigger functions (`handle_new_user`, `protect_attorney_verification_fields`) so they can't be invoked directly as RPC endpoints, only via their triggers. Low severity — no policy is bypassed either way, since the functions don't take attacker-controlled input — but worth closing. The exact SQL is in this repo's history/`docs/MIGRATION.md` git blame, or just re-run `get_advisors(type: "security")` and it'll surface the same two findings with remediation links.
- **Auth providers are not configured.** The MCP tools available don't include auth-provider configuration — enabling email/password (on by default) is fine, but Google (and Apple, if wanted) OAuth client IDs/secrets have to be set up in the Supabase dashboard under Authentication → Providers, by hand.
- **The app itself hasn't been switched over.** This is backend provisioning only — `src/api/base44Client.js` is still what the frontend calls. Phase 2 below (swapping the client) hasn't started.

## Why Supabase specifically

The `base44/entities/*.jsonc` files already declare, per entity, a JSON-schema-shaped table definition plus an `rls` block (e.g. `CaseSummary`'s `read: { created_by_id: "{{user.id}}" }`). That's not incidental — it's the same mental model as Postgres Row-Level Security. Supabase gives you hosted Postgres + RLS + Auth + Storage + Edge Functions as one product, so the migration is mostly a **literal translation** of what's already declared, not a redesign. (Firebase/Auth0/etc. would work too, but you'd lose that direct schema mapping and need a separate DB anyway.)

## What has to move, concretely

| Base44 SDK call | Where it's used | Replacement |
|---|---|---|
| `base44.auth.register/loginViaEmailPassword/loginWithProvider/verifyOtp/resendOtp/resetPassword*/me/updateMe/logout/setToken` | `Login.jsx`, `Register.jsx`, `AttorneyApplication.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`, `AuthContext.jsx`, `onboarding/*` (~15 call sites) | **Supabase Auth** — email/password, Google OAuth, and OTP are all built in. Apple OAuth needs a paid Apple Developer setup either way. |
| `base44.entities.{Attorney,Booking,CaseSummary,Waitlist,Review}.{list,filter,create,update}` | Across most pages (~30 call sites) | **Supabase Postgres tables**, one per entity, RLS policies translated from the `rls` blocks already in the `.jsonc` files |
| `base44.integrations.Core.UploadFile / UploadPrivateFile / CreateFileSignedUrl` | `AttorneyApplication.jsx` (ID, bar card, board cert uploads), `attorney/AttorneyProfile.jsx` (photo) | **Supabase Storage** — a public bucket for profile photos, a private bucket + signed URLs for ID/bar-card/board-cert docs |
| `base44.integrations.Core.SendEmail` | `Account.jsx`, `Booking.jsx`, `AttorneyApplication.jsx`, `admin/AdminApplicationDetail.jsx` | **Cannot move client-side as-is.** Needs a Vercel serverless function calling a transactional email provider (Resend/Postmark/SES) — the API key can't ship to the browser the way `SendEmail` currently gets called directly from React components. |
| `base44/agents/legal_matching_concierge.jsonc` (Base44-hosted LLM agent) | `ConciergePanel.jsx`, `MatchConcierge.jsx` | A Vercel serverless function that calls an LLM API (e.g. Claude) server-side with the same system prompt/guardrails already written in the `.jsonc`, exposing a small `/api/concierge` endpoint. Same reason as email: the LLM API key can't live in client code. |
| N/A — not built yet | Attorney calendar sync (`AttorneyAvailability.jsx` is currently just a manual slot list) | The product doc calls for Google Calendar + Microsoft Graph OAuth (free/busy scopes) with server-held refresh tokens. This was never implemented even on Base44, so it's new backend work regardless of platform — build as Vercel serverless functions (`/api/calendar/connect`, `/callback`, `/availability`), storing tokens in Supabase (encrypted column or Supabase Vault), not in the browser. |

## Concrete phasing

**Phase 1 — Stand up Supabase**
- Create a Supabase project; recreate the six entities as tables (`attorneys`, `bookings`, `case_summaries`, `waitlist`, `reviews`, plus `auth.users` handles `User`). Field lists translate directly from the `.jsonc` `properties` blocks — nothing needs to be invented.
- Turn each entity's `rls` block into Postgres RLS policies (e.g. `CaseSummary`'s owner-only read/update/delete becomes `USING (auth.uid() = created_by_id)`).
- Enable Supabase Auth: email/password + Google OAuth provider. Decide whether OTP-based signup (currently used for both client and attorney registration) maps to Supabase's email OTP or gets simplified to a standard email-confirmation link — worth a product call, not just an engineering one.
- If there's existing production data in the live Base44 app (bookings, attorney applications, etc.), export it via the Base44 dashboard and bulk-import into the new tables before cutover.

**Phase 2 — Swap the SDK client**
- Replace `src/api/base44Client.js` with a thin `supabase-js`-backed adapter that preserves the same call shape (`auth.me()`, `auth.updateMe()`, `entities.Attorney.filter()`, etc.) so the ~140 existing call sites across the app don't each need a rewrite — just the one client module, plus the small number of places using OTP/social-login methods with no 1:1 Supabase equivalent.
- Run the app against Supabase locally end-to-end (auth, booking creation, attorney application + admin verification loop) before touching hosting.

**Phase 3 — Move the two things that need a real backend**
- `SendEmail` → a `/api/send-email` Vercel Function calling Resend (or similar), invoked from the client instead of the direct Base44 call.
- The concierge agent → a `/api/concierge` Vercel Function reimplementing the guardrails already spelled out in `legal_matching_concierge.jsonc`, calling an LLM API server-side.
- Signed file URLs are handled natively by Supabase Storage — no separate server-side code needed there beyond calling the Supabase client.

**Phase 4 — Deploy**
- This is a Vite SPA using React Router — deploys to Vercel as a static build with a rewrite rule (`vercel.json`: all paths → `/index.html`) so client-side routes don't 404 on refresh.
- Environment variables in Vercel: `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (safe client-side, that's what the anon key + RLS is for), and server-only secrets (email provider key, LLM API key, future Google/Microsoft OAuth client secrets) set as Vercel server env vars, never prefixed `VITE_` so they don't get bundled into client code.
- Swap the hardcoded `media.base44.com` image URLs and the `6a20eafdf3fbb0512c514d25` app ID baked into `index.html`'s favicon/apple-touch-icon links — those point at the Base44-hosted instance and will break once detached from it.

**Phase 5 — Build what was never built**
- Real payment capture (Stripe), the completed-consultation transition that triggers the $50 attorney fee, and calendar OAuth sync are all still open regardless of which backend hosts the app — see `docs/KNOWN_GAPS.md` for the full list. Moving off Base44 doesn't create these gaps, but it's the point where they stop being "someone else's server would handle this" and become "we need to write this."

## What does *not* need to change

The React/Vite/Tailwind/shadcn frontend, the routing and role-gating logic (`RoleRoute`, the three shell components), and all UI/business logic are backend-agnostic already — they call through the one client module. That's the main thing this migration has going for it: it's a swap at the data layer, not a rewrite of the app.
