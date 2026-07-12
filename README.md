# The Vale Law

A trust-first platform for finding and booking an immigration lawyer. It replaces cold-searching with an educational triage layer — helping people understand their situation before they commit to anyone — and a curated, vetted directory of immigration lawyers screened for both competence and how they treat clients. Revenue comes from a flat fee paid by listed lawyers, not a per-booking cut, to stay clear of fee-sharing and referral-fee bar rules.

Two sides:
- **Clients** get a guided intake flow (general education only, not personalized legal advice) and a directory of vetted lawyers to browse and book a first consultation with.
- **Lawyers** get profile management, availability, and better-fit, pre-educated clients instead of cold leads — plus an internal admin/vetting step before they go live.

## Current state

This is a **V1 in progress**, currently focused on data collection (client intake) and structural scaffolding rather than a finished product. See [`docs/KNOWN_GAPS.md`](docs/KNOWN_GAPS.md) for a detailed breakdown of what's functional vs. stubbed vs. missing, including:

- No admin/vetting layer yet (no approval workflow for lawyers before they go live)
- No attorney intro-video feature (the intended core trust signal)
- Payment selection UI exists but isn't wired to a real payment processor
- Route protection (`ProtectedRoute`) is written but not applied to any route
- The attorney dashboard doesn't scope profile edits to the logged-in attorney's own record
- The practice-area model currently spans more verticals (Family Law, Personal Injury, Business Formation) than the immigration-only scope described for this product — needs a decision on whether to trim scope

## Stack

- **Frontend:** React 18, Vite 6, React Router, TanStack Query, Tailwind CSS, shadcn/ui (Radix primitives), react-hook-form + zod
- **Backend:** [Base44](https://base44.com) — a hosted no-code/low-code platform providing auth, database, and API. This repo contains **frontend code only**; the data model, permissions, and server-side logic are configured in the Base44 dashboard. The `base44/entities/*.jsonc` files here are schema declarations that mirror that configuration — editing them doesn't change the live backend by itself.
- **Payments (planned, not yet integrated):** Stripe (`@stripe/stripe-js`, `@stripe/react-stripe-js` are installed but unused)

## Running locally

1. Install dependencies:
   ```
   npm install
   ```
   Note: `package-lock.json` isn't committed to this repo (it was omitted during the initial import — see below), so `npm install` will generate a fresh one from `package.json` on first run. Commit the generated lockfile afterward so installs stay reproducible.
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

## Known gaps / TODOs

Full details in [`docs/KNOWN_GAPS.md`](docs/KNOWN_GAPS.md). Highlights:

- [ ] Build the admin/vetting layer (lawyer approval before going live, gated on the existing but currently-unused `Attorney.verified` field)
- [ ] Add attorney intro-video upload + display on profiles
- [ ] Wire real payment processing (Stripe) into the booking flow
- [ ] Apply `ProtectedRoute` to routes that need auth (attorney dashboard, at minimum)
- [ ] Scope the attorney dashboard to the logged-in attorney's own record, and verify Base44's server-side permissions independently enforce this
- [ ] Decide on practice-area scope (immigration-only vs. multi-vertical) and trim the data model / content accordingly
- [ ] Commit a fresh `package-lock.json` (see "Running locally" above)
