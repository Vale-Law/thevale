# Known Gaps & Stubbed Functionality — V1 Codebase Review

Reviewed: 2026-07-12
Scope: initial `pacto-legal-match` codebase as received from the cofounder, prior to any changes.

This document scopes out what's real vs. stubbed/missing in the V1 codebase, measured against the product description (immigration-lawyer trust platform: educational client intake, vetted directory, booking, lawyer profile management, admin/vetting layer).

## Architecture note (read this first)

This is a **frontend-only repository**. It's built on [Base44](https://base44.com), a hosted no-code/low-code app platform — auth, database, and API logic all live on Base44's servers, not in this repo. The `base44/entities/*.jsonc` files are schema declarations mirroring the Base44 web builder config; they are not executable backend code. Any change to data model, permissions, or server-side validation has to happen in the Base44 dashboard, not just in this codebase.

## What's functional (real, not stubbed)

- **Client intake questionnaire** (`src/components/search/QuestionnaireModal.jsx`, `src/lib/questionnaireData.js`) — branching multi-step question flow per practice area, generates a plain-language case summary. Genuine logic.
- **Attorney directory browse/filter** (`src/components/search/*`) and **attorney profile pages** — wired to real Base44 entity reads (`Attorney.list()`, `Attorney.filter()`), not mock data.
- **Booking flow** (info → details → payment-selection steps) — creates real `Booking` records via `base44.entities.Booking.create()`.
- **Attorney-side dashboard** for editing profile fields and confirming/declining bookings — real reads/writes against `Attorney` and `Booking` entities (see access-control caveat below).
- **i18n** (English/Spanish) via a hand-rolled translation dictionary — functional, not a stub.
- **Auth** — delegated entirely to Base44's hosted auth (email/password, Google/Apple OAuth hooks present in `RegistrationStep.jsx`). No custom auth code to maintain, but also no custom logic controlling who can register as an "attorney" vs. a "client."

## What's missing entirely

1. **Admin/vetting layer — does not exist.** No route, no page, no lawyer-approval workflow anywhere in the frontend. The `Attorney.verified` boolean exists on the schema but nothing in the UI reads it or gates search/directory visibility on it. Any `Attorney` record created (however it's created) appears to be immediately live in search.
2. **Attorney intro video — does not exist.** The product description calls this out as the core trust signal on a lawyer's profile. There is no upload field, no storage wiring, no display component for it anywhere. Every occurrence of "video" in the codebase refers to the Zoom-style consult call itself, not a profile video.
3. **Real payment processing — does not exist.** `StepPayment.jsx` presents four options (pay in full / Klarna / Affirm / "LawFi") but only records which one the user clicked as a string on the `Booking` record. No Stripe Elements integration, no charge, no financing-partner API calls — despite `@stripe/stripe-js` and `@stripe/react-stripe-js` sitting in `package.json` as unused dependencies.

## Stubbed / partially built

- **Route protection is not wired up.** `src/components/ProtectedRoute.jsx` is fully written but never imported or used in `App.jsx`. Every route, including `/attorney-dashboard`, is reachable by anyone regardless of auth state.
- **No ownership scoping in the attorney dashboard.** `AttorneyDashboard.jsx` fetches *every* `Attorney` record (`Attorney.list()`) and presents them all in a plain dropdown — any user who lands on this page can select any attorney and edit that attorney's profile or confirm/decline that attorney's bookings. There is no check that ties the logged-in user to a specific attorney record. It is unverified whether Base44's server-side permissions independently reject cross-record writes — that needs to be confirmed in the Base44 dashboard directly, but the frontend itself provides no such restriction and would need one regardless (showing every competitor's editable profile in a dropdown is a problem on its own, separate from whether the write is ultimately rejected server-side).
- **Client intake results aren't persisted as their own record.** The questionnaire generates a case summary that's carried through local component state into the booking flow (and saved onto the `Booking` record if a booking happens), but there's no standalone `Intake`/`Screening` entity — so a client's answers are lost if they don't complete a booking, and there's no way to look up "what did this client say happened" independent of a specific booking.

## Contradicts the product description — needs your confirmation

The codebase is **not immigration-only.** It looks like a generic multi-vertical legal-marketplace template rather than the focused, UPL-conscious immigration platform described:

- `Attorney.practice_area` enum: `Family Law`, `Immigration`, `Business Formation`, `Personal Injury` (only one of four is immigration).
- Dedicated marketing/education content exists for **personal injury** (`LearnPersonalInjury.jsx`) alongside immigration (`LearnImmigration.jsx`).
- A standalone `Financing.jsx` page markets third-party consumer financing (Klarna, Affirm, and a "LawFi" partner) for legal fees — financing partnerships aren't mentioned in your product description and may carry their own regulatory/bar-rule considerations worth thinking through given the fee-sharing sensitivity you flagged.
- `PracticeAreaIcons.jsx` lists still more areas not even present in the `Attorney` schema enum: `Criminal Defense`, `Business & Tax`, `Estate & Wills`.

**Recommendation:** confirm with your cofounder whether this was a broader template that hasn't been trimmed down yet, or intentional scope you haven't mentioned. It affects the practice-area enum, what "Learn" content to keep, and whether the financing page belongs in an immigration-focused V1 at all.

## Secrets / environment variables

No hardcoded API keys, tokens, credentials, or connection strings were found anywhere in the source. Three env vars are read correctly via `import.meta.env` and need to be set locally in `.env.local` (not committed): `VITE_BASE44_APP_ID`, `VITE_BASE44_APP_BASE_URL`, `VITE_BASE44_FUNCTIONS_VERSION`. One non-secret identifier — the Base44 app ID `6a20eafdf3fbb0512c514d25` — is hardcoded into ~15 `media.base44.com` image URLs used for marketing content; not a credential, but means those images are pinned to that specific Base44 app instance.
