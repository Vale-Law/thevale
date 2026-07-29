# The Vale Law

A trust-first platform for finding and booking an immigration lawyer. It replaces cold-searching with an educational triage layer — helping people understand their situation before they commit to anyone — and a curated, vetted directory of immigration lawyers screened for both competence and how they treat clients. Revenue comes from a flat fee paid by listed lawyers, not a per-booking cut, to stay clear of fee-sharing and referral-fee bar rules.

Two sides:
- **Clients** get a guided intake flow (general education only, not personalized legal advice) and a directory of vetted lawyers to browse and book a first consultation with.
- **Lawyers** get profile management, availability, and better-fit, pre-educated clients instead of cold leads — plus an internal admin/vetting step before they go live.

## Current state

Re-synced 2026-07-26 from the cofounder's latest Base44 export. Admin/vetting, role-based route protection, a mobile shell, an AI matching concierge, and structured intake persistence (`CaseSummary`) are now built. See [`docs/KNOWN_GAPS.md`](docs/KNOWN_GAPS.md) for the full breakdown of what's functional vs. stubbed vs. missing, including:

- Google Calendar sync is built (OAuth free/busy via `/api/calendar-connect` + `/api/calendar-callback`, merged into `/api/availability`) but needs the Google OAuth env vars below configured in Vercel before the "Connect Google Calendar" button works; Microsoft is still unbuilt
- No real payment processing (booking flow records a selection, doesn't charge)
- No mechanism to transition a booking to "completed" — the event that's supposed to trigger the attorney's flat fee
- Reviews are read-only (no submission flow yet)
- Practice-area scope (still includes Personal Injury) contradicts the current 3-vertical product doc

This is still a **frontend-only repository** hosted on Base44 — see [`docs/MIGRATION.md`](docs/MIGRATION.md) for the plan to move it onto our own infrastructure (Vercel + Supabase).

## Stack

- **Frontend:** React 18, Vite 6, React Router, TanStack Query, Tailwind CSS, shadcn/ui (Radix primitives), react-hook-form + zod
- **Backend (current):** [Base44](https://base44.com) — a hosted no-code/low-code platform providing auth, database, file storage, transactional email, and even the AI matching agent. This repo contains **frontend code only**; all of that is configured in the Base44 dashboard. The `base44/*.jsonc` files here are schema/config declarations that mirror that configuration — editing them doesn't change the live backend by itself.
- **Backend (planned):** Vercel (hosting + serverless functions) + Supabase (Postgres/RLS, Auth, Storage). See [`docs/MIGRATION.md`](docs/MIGRATION.md).
- **Payments (planned, not yet integrated):** Stripe (`@stripe/stripe-js`, `@stripe/react-stripe-js` are installed but unused)

## Running locally

1. Install dependencies:
   ```
   npm install
   ```
2. Create a `.env.local` file (gitignored) with your Base44 app credentials:
   ```
   VITE_BASE44_APP_ID=your_app_id
   VITE_BASE44_APP_BASE_URL=your_backend_url
   ```
   You'll need access to the corresponding Base44 project to get these values.
3. Start the dev server:
   ```
   npm run dev
   ```

Other useful scripts: `npm run build`, `npm run lint`, `npm run lint:fix`, `npm run typecheck`.

## Deployment env vars (Vercel)

The frontend needs (build-time):

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — the Supabase project URL + anon key.

The serverless functions under `/api` additionally need (server-only, never `VITE_`-prefixed):

- `SUPABASE_SERVICE_ROLE_KEY` — **currently unset in production**, which makes `/api/availability` (and public booking creation / transactional email) return 503. The booking page now falls back to an anon-safe RPC (`get_public_booking_page`) so open slots still render, but bookings/emails need this key.
- `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` — a Google Cloud OAuth 2.0 Web client with `https://<your-domain>/api/calendar-callback` as an authorized redirect URI (scope used: `calendar.freebusy` only).
- `CALENDAR_TOKEN_ENCRYPTION_KEY` — 32 random bytes, base64 (`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`).
- `RESEND_API_KEY` — for transactional email (`/api/send-email`).

Until the three Google vars are set, the attorney portal's "Connect Google Calendar" button reports that calendar connection isn't configured; everything else works without it.

## Known gaps / TODOs

Full details in [`docs/KNOWN_GAPS.md`](docs/KNOWN_GAPS.md). Highlights:

- [ ] Configure Google Calendar sync env vars in Vercel (code is built — see "Deployment env vars" below); Microsoft Graph OAuth still unbuilt
- [ ] Wire real payment processing (Stripe) into the booking flow
- [ ] Define and build the "completed consultation" transition that triggers the attorney's flat fee
- [ ] Build a review-submission flow (reads already work, writes don't exist)
- [ ] Decide on practice-area scope (the doc now says Family Law / Immigration / Business Formation only; the code still includes Personal Injury) and trim the data model / content accordingly
- [ ] Plan the Base44 → Vercel + Supabase migration (see `docs/MIGRATION.md`)
