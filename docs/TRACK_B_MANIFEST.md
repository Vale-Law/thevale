# Track B Manifest — Brief v1.4, Firm Surfaces

Status: **proposed, awaiting owner approval.** No application code has been written.

Source documents (all read in full before this Manifest was produced):

1. **Canonical Product Definition v1.4** — features (§3.1, §3.3, §3.5), codebase reality (§5), out-of-scope (§6)
2. **Brief Design System — v2** — §2 color (incl. 2.3 status), §3 type, §4 density, §7 motion, §9 Tab, §10 components, §11 zero states, §13 email, §14 copy register, §16 quality floor, §17 tokens
3. **The Shared Contract** — Development Sprint v1.1 §2 (2.1 file boundaries, 2.2 schema, 2.3 behavioural, 2.4 constraints, 2.5 merge protocol)

Track B owns the booking pipeline and detail panel (v1.4 §3.1), reminders and confirmations
(§3.3), metric cards (§3.5), email infrastructure and templates, and the attorney route module.
Track A owns every migration, every design token, and every primitive component; Track B
consumes those and escalates rather than writing them.

---

## Escalations — batched, submitted with this Manifest

Wave 0 is the one cheap window to influence the migration, so these lead. Four are blocking.

### E1 — No firm or office-staff concept exists (BLOCKING)

`attorneys.user_id` is 1:1 with `auth.users`. `profiles.role` is constrained to
`('client','attorney','admin','user')` — there is no staff role. Bookings RLS reads
`attorney_id in (select id from attorneys where user_id = auth.uid())`.

**The legal assistant / office manager who is the entire point of Track B cannot
authenticate, and cannot see a pipeline.** Shared Contract 2.2's `booking_staff_notes`
("readable only by members of the owning firm") and the W1 gate ("zero cross-firm data
leakage") both presuppose a firm-membership model that exists in neither the current schema
nor the Contract.

**Ask:** Track A adds `firms` + `firm_members` (or equivalent), `attorneys.firm_id`, a
`staff` role, and re-scopes bookings/notes RLS firm-wide rather than attorney-wide.
W1 and W2 are unbuildable as specified without it.

### E2 — `alter type booking_status ...` will fail (BLOCKING)

Shared Contract 2.2 contains `alter type booking_status add value if not exists 'no_show';`.
There is no `booking_status` enum type. `bookings.status` is `text` with
`check (status in ('pending','confirmed','completed','declined'))`. The statement errors with
*type does not exist*.

**Ask:** Track A replaces that line with a check-constraint drop/recreate, or creates a real
enum and migrates the column. Every Track B wave depends on `no_show` existing.

### E3 — The repo is JavaScript, not TypeScript (BLOCKING)

Contract 2.1 names `src/routes/attorney.tsx`, `src/lib/metrics.ts`, `src/lib/email.ts`,
`src/types/database.ts`. Reality: `jsconfig.json`, all `.jsx`/`.js`, one stray
`src/utils/index.ts`. `npm run typecheck` runs `tsc -p ./jsconfig.json` and **explicitly
excludes `src/lib` and `src/api`**. The W0 gate ("typecheck passes against A's generated
types") is not meaningful until this is settled.

**Ask:** owner ruling, binding on both tracks — (a) migrate to TS in A-W0, or (b) keep JS and
read every `.ts`/`.tsx` path in the Contract as `.js`/`.jsx` with JSDoc types.
Recommendation: (b). Cheaper, and (a) touches every file both tracks own.

### E4 — `src/routes/` does not exist; the root router belongs to neither track (BLOCKING)

Contract 2.1 has Track A creating `src/routes/index.tsx` "with both imports" and Track B
owning `src/routes/attorney.tsx`. Neither exists. Routing is inline in `src/App.jsx`, which
is in neither track's write list.

**Ask:** grant `src/App.jsx` to Track A for the W0 router extraction, and confirm the
attorney routes move out of it in the same PR.

### E5 — Env var name mismatch, in a file Track B may not write (HIGH)

`src/api/supabaseClient.js` reads `VITE_SUPABASE_ANON_KEY`; the Track B brief specifies
`VITE_SUPABASE_PUBLISHABLE_KEY`. `src/api/**` is read-only for both tracks, so Track B can
neither rename it nor route around it. A `.env.local.example` (carrying `ANON_KEY`) already
exists, while the W0 checklist asks for a second `.env.example`.

**Ask:** assign the rename to Track A, grant Track B a one-line exception, or supply the
legacy anon key. Also rule on one example file vs. two — recommendation: consolidate on
`.env.example` with `VITE_SUPABASE_PUBLISHABLE_KEY`.

### E6 — No audit-trail table (HIGH)

The W2 gate requires an audit trail on every status change with actor and timestamp. Not in
Contract 2.2; `bookings` has no `updated_by`.

**Ask:** add `booking_status_events (booking_id, from_status, to_status, actor_id,
actor_role, created_at)` to Track A's migration.

### E7 — Email runtime conflict (HIGH)

The existing function is `api/send-email.js`, a **Vercel** serverless function. The Contract
assigns Track B `supabase/functions/email-send/**` and `email-schedule/**` — **Supabase edge
functions** (Deno). Different runtime, deploy path, and secret store. `api/**` is in neither
track's list, so Track B cannot retire the Vercel one.

**Ask:** confirm the Contract's literal reading (Supabase edge functions) — consistent with
the Resend key living in Supabase project secrets — and assign retirement of
`api/send-email.js` to an owner or to Track A.

### E8 — Nothing drains `email_schedule` (MEDIUM)

The table is specified; no scheduler is. pg_cron needs an extension, therefore a migration,
therefore Track A.

**Ask:** ruling on pg_cron (Track A adds the extension) vs. Vercel cron (outside both
boundaries). Needed before B3.3.

### E9 — Branch-name conflict (LOW)

Contract 2.5 mandates `track-b/wave-N`. This session is hard-bound to
`claude/repo-access-codebase-okriip`, with an explicit instruction never to push elsewhere
without permission.

**Ask:** explicit permission to push `track-b/wave-N`, or a ruling that the session branch
stands in for it.

### Resolved within boundary — no escalation, logged for the record

- `recharts` and `date-fns` are already in `package.json`; W4 needs no dependency request.
- The shared `src/api/base44Client.js` adapter is read-only, so Track B's query layer lives
  inside `src/components/pipeline/**` and `src/lib/metrics.*` rather than extending it.
- The Design System has no numbered §10.3; the "Booking detail panel" entry under DS §10 is
  treated as the authority for panel order.

---

## Manifest — Waves 0 through 4

**Verdict vocabulary:** `BUILD` new · `EVOLVE` existing · `REPLACE` existing wholesale ·
`DELETE` · `BLOCKED` pending escalation · `GATE` verification-only unit.

**Global state:** Track A W0 is **not merged** — no `src/styles/tokens.css`, no
`src/components/primitives/**`, no contract migration, no generated types. Track B is
therefore confined to Wave 0, fixtures only, exactly as the hard dependency requires.

### Wave 0 — Audit and contract adoption (no user-visible output)

| Unit | Verdict | Scope | Depends on | Files (write) |
|---|---|---|---|---|
| **B0.1** Audit 4 attorney routes + admin console | `GATE` | Line-level inventory of `AttorneyDashboard`, `AttorneyBookings`, `AttorneyAvailability`, `AttorneyProfile`, `AttorneyPending`, `admin/**` → reusable / replaced / deleted, with the DS-v2 delta per file | — | none (report only) |
| **B0.2** Batched schema escalation | `GATE` | E1, E2, E6, E8 submitted as one request | B0.1 | none |
| **B0.3** Fixtures matching Contract 2.2 | `BUILD` | Fixture set for all five statuses incl. `no_show`, both `confirmed_by` values, `source` variants, staff notes, zero-data case | Contract 2.2 (spec, not merged code) | `src/components/pipeline/__fixtures__/**` |
| **B0.4** Env + example hygiene | `BLOCKED` | `.env.local` creation, `.env.example` commit, `.gitignore` verify | **E5** | `.env.example` (`.gitignore` already covers `.env.*`) |
| **B0.5** Rebase + typecheck against A's types | `GATE` | Rebase on A-W0a, typecheck green | A-W0a merged, **E3** | none |

**Gate B-W0:** B0.1 inventory owner-approved · B0.2 submitted · A-W0a merged · typecheck
green · tag `gate-b-w0`.

**Parallelism:** B0.1 ∥ B0.3 (disjoint). B0.4 and B0.5 serial after their blockers clear.

### Wave 1 — Pipeline, read-only

| Unit | Verdict | Scope | Depends on | Files (write) |
|---|---|---|---|---|
| **B1.1** Pipeline data layer | `BUILD` | Firm-scoped booking queries, day + status grouping, no availability recomputation (Contract 2.3) | **E1**, A-W0a | `src/components/pipeline/data.*` |
| **B1.2** Booking card | `REPLACE` | DS §10 card: status Tab (DS §9), label, **and** fill difference — survives greyscale (DS 2.3); Pending on `--surface`, others on `--ground`; 56px min height, 16px padding, Compact | A-W0b (Tab, StatusDot, Card primitives) | `src/components/pipeline/BookingCard.*` |
| **B1.3** Pipeline board | `REPLACE` | Scannable by day and by status; **no stagger on load** (DS §7); 360px; both themes | B1.1, B1.2 | `src/components/pipeline/Pipeline.*`, `src/pages/attorney/*` |
| **B1.4** Detail panel | `BUILD` | DS §10 order exactly: name/status/time → contact with one-tap actions → **"In their words"** in `client-voice` (Newsreader) on `--surface-sunk`, `radius-m`, 20px padding, **read-only** → staff notes in Archivo on `--surface` with "Only your firm sees this" → actions. The two blocks are never collapsed. | B1.1, A-W0b | `src/components/pipeline/DetailPanel.*` |
| **B1.5** Keyboard operation | `BUILD` | Arrows between cards, Enter opens, Escape closes (DS §16); visible focus at 3:1 | B1.3, B1.4 | `src/components/pipeline/**` |
| **B1.6** RLS leakage test | `GATE` | Two firms; cross-read must fail closed | **E1** | `src/components/pipeline/__tests__/**` |

**Gate B-W1:** zero cross-firm leakage · full keyboard operation · both themes · 360px ·
pipeline does not stagger · tag `gate-b-w1`.

**Parallelism:** B1.2 ∥ B1.4 once B1.1 lands (disjoint files).

### Wave 2 — Pipeline writes

| Unit | Verdict | Scope | Depends on | Files (write) |
|---|---|---|---|---|
| **B2.1** Status transitions | `BUILD` | One-click; setting confirmed writes `confirmed_at` and `confirmed_by='staff'` (Contract 2.3) | B-W1 | `src/components/pipeline/actions.*` |
| **B2.2** Staff notes CRUD | `BUILD` | `booking_staff_notes`; firm-private, never client-visible | **E1**, B1.4 | `src/components/pipeline/StaffNotes.*` |
| **B2.3** No-show marking | `BUILD` | **Deliberate staff action only** — never automatic, never inferred from time passing (v1.4 §3.1) | **E2** | `src/components/pipeline/actions.*` |
| **B2.4** Audit trail | `BUILD` | Actor and timestamp on every status change | **E6** | `src/components/pipeline/actions.*` |
| **B2.5** Transition motion | `BUILD` | Tab crossfades over `motion-base`, card fill settles (DS §7); `prefers-reduced-motion` collapses to opacity-only | B2.1 | `src/components/pipeline/**` |
| **B2.6** Integration with A-W2 | `GATE` | A booking made on the public page appears correctly here | A-W2 merged | none |

**Gate B-W2:** audit trail on every status change · **no code path sets `no_show` without an
explicit staff action** · integration pass · owner sign-off · tag `gate-b-w2`.

### Wave 3 — Email (irreversible; hardest gate)

| Unit | Verdict | Scope | Depends on | Files (write) |
|---|---|---|---|---|
| **B3.1** Templates ×3 | `BUILD` | Confirmation, reminder, new-booking notification. DS §13: 600px, Georgia for `name`/`invite` roles and system sans elsewhere, **no halftone, no grain, flat only**, one action per email, `prefers-color-scheme` overrides, **plain-text alternative required**. **Administrative content only** — never discusses the matter, assesses it, or characterises likelihood of representation. | A-W0b (tokens) | `emails/**` |
| **B3.2** `email-send` function | `BUILD` | Supabase edge function | **E7** | `supabase/functions/email-send/**` |
| **B3.3** `email-schedule` + drain | `BUILD` | Writes and consumes `email_schedule` rows | **E8** | `supabase/functions/email-schedule/**`, `src/lib/email.*` |
| **B3.4** Confirm-link → pipeline | `BUILD` | One-click "Confirm my appointment", no login, no reply; updates pipeline status so staff know which appointments hold before the day begins. **Imports Track A's token library — token generation is never reimplemented** (Contract 2.1) | A-W3 (`src/lib/action-tokens`) | `src/lib/email.*` |
| **B3.5** Recipient inventory | `GATE` | Concrete list of every recipient address, template, and send time → owner approval → execute exactly that inventory, nothing more | B3.1–B3.4 | none |
| **B3.6** Client rendering | `GATE` | Apple Mail, Gmail, Outlook — light **and** dark | B3.1 | none |
| **B3.7** Deployment | `BLOCKED` | Resend key and service-role key live in Supabase project secrets, set by the owner | escalation by design | none |

**Gate B-W3:** owner-approved inventory executed verbatim · three clients × two themes ·
tag `gate-b-w3`.

### Wave 4 — Metrics (last; requires data)

| Unit | Verdict | Scope | Depends on | Files (write) |
|---|---|---|---|---|
| **B4.1** Computation | `BUILD` | This week's consultations, confirmation rate, no-show rate, weekly series. Every figure traceable to a source record; **nothing estimated, nothing profile-derived** | B-W2 (real status data) | `src/lib/metrics.*` |
| **B4.2** Metric cards | `REPLACE` | Replaces today's cards, which mix real counts with `attorney.rating` and `attorney.review_count` — **a correction, not an addition**. DS §10: no Tab, `metric` scale, tabular figures | B4.1, A-W0b | `src/components/metrics/**` |
| **B4.3** Honest zero states | `BUILD` | Em-dash at `--text-4` in `metric` scale with a `body-s` line stating why. **Never `0` when the truth is "not yet measured"**, never a sample number, never a placeholder sparkline, never a greyed demo dataset | B4.2 | `src/components/metrics/**` |
| **B4.4** Weekly chart | `BUILD` | **One chart maximum.** `--accent` bars, `radius-xs` top corners only, no gradient fills, no shadows, no draw-in beyond a 260ms opacity fade. `recharts` already present | B4.1 | `src/components/metrics/**` |
| **B4.5** Zero-data proof | `GATE` | Seed a database with zero bookings and screenshot every card and the chart. **If any of it looks like it has data, it fails** | B4.2–B4.4 | none |

**Gate B-W4:** zero-data screenshots pass · tag `gate-b-w4`.

---

## Critical path

```
E1–E5 resolved → A-W0a merged → gate-b-w0 → A-W0b merged
  → W1 → W2 → (A-W2 integration) → W3 → W4
```

**E1 is the real risk.** It is not a schema convenience. The office-manager persona that is
the stated point of Track B has no representation in the data model, and both the W1 and W2
gates test against a firm boundary that does not currently exist. If it is deferred past
A-W0, W1 gets built against attorney-only RLS, and re-scoping it later touches every query,
every policy, and both gates.

---

## Operating rules in force

1. The Manifest is law. No child re-litigates scope.
2. Parallel work only inside disjoint file boundaries.
3. No wave starts until the previous gate fully passes.
4. Irreversible actions follow propose-inventory → owner-approves-inventory → execute-exactly.
5. Surprises escalate. Workers never resolve them locally.
6. Out of scope for this sprint, and not pullable forward: document collection, conflict
   checks, follow-up sequences, waitlists, daily digests, template libraries, multi-firm
   billing, the consumer directory, reviews, and subscription billing.
