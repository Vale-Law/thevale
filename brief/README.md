# Brief — backend (Next.js + Supabase)

This is the backend for Brief: attorneys connect their **real Google or Outlook
calendar**, clients see **only genuinely free consultation times**, and booking
writes the appointment straight onto the attorney's calendar. There is **no
third-party scheduler** (no Cal.com/Nylas/Calendly) — we talk directly to the
Google Calendar API and Microsoft Graph.

It's written to be readable by a non-developer. This file explains what each
piece does, then walks you through registering the OAuth apps, the environment
variables, and testing locally and on Vercel.

---

## What's in here

```
brief/
  app/
    api/
      calendar/
        google/     connect · callback · notifications        (Google OAuth + webhook)
        microsoft/  connect · callback · notifications        (Microsoft OAuth + webhook)
        renew-watches/                                         (daily cron: keep webhooks alive)
      attorneys/[id]/slots/                                    (public: free times only)
      bookings/                                                (create a booking)
  lib/
    supabase.ts        server-side database client (admin)
    crypto.ts          encrypts calendar tokens before they're stored
    time.ts            timezone-correct "9–5 weekdays" math
    google.ts          Google: tokens, free/busy, create event, watch
    outlook.ts         Microsoft: tokens, free/busy, create event, subscription
    availability.ts    the engine: computes free slots
  supabase/schema.sql  the database tables + the anti-double-booking rule
  vercel.json          the daily cron schedule
  .env.example         every environment variable you need
```

## The core idea in plain language

1. **Connecting a calendar.** The attorney clicks "Connect Google/Outlook."
   That sends them to Google/Microsoft to log in and approve. Those providers
   send us back a one-time **code**, which we trade for two keys: a short-lived
   **access token** and a long-lived **refresh token**. We store them
   **encrypted**. The refresh token lets us get new access tokens forever
   without bothering the attorney again.

2. **Privacy — free/busy only.** To find open times we call each provider's
   *free/busy* endpoint (Google `freeBusy`, Microsoft `getSchedule`). These
   return only **blocks of busy time** — never event titles, guests, or notes.
   Clients only ever receive a list of **free start times**. There is no
   endpoint anywhere that returns an attorney's event details to a client.

3. **Computing slots (real time).** For the next two weeks we generate every
   weekday slot from **9:00 AM to 5:00 PM in the attorney's timezone**, in
   steps of their consultation length, then remove any that (a) hit a busy block
   on their real calendar, (b) hit an existing confirmed Brief booking, or
   (c) start less than an hour from now.

4. **Booking safely.** When a client books, we re-check the time is still free,
   then insert the booking. The database has a rule (`no_overlap`) that makes it
   **physically impossible** to save two overlapping confirmed bookings for the
   same attorney — even if two people click at the same instant, one simply
   fails and is asked to pick another time. Then we write the event to the
   attorney's calendar.

5. **Staying current.** When an attorney edits their own calendar, Google/
   Microsoft **notify us via a webhook** so availability reflects reality almost
   immediately. Those notification channels expire, so a **daily Vercel cron
   job** renews them.

---

## Setup

### 0. Install & Supabase

1. `cd brief && npm install`
2. Create a Supabase project (free tier is fine).
3. In Supabase → **SQL Editor**, paste all of `supabase/schema.sql` and **Run**.
   This creates the tables and the anti-double-booking rule.
4. Supabase → **Project Settings → API**: copy the **Project URL** and the
   **service_role** key into `.env.local` (see the variable list below).

### 1. Google Cloud Console (Google Calendar)

1. Go to <https://console.cloud.google.com> → create/select a project.
2. **APIs & Services → Library →** search **"Google Calendar API" → Enable**.
3. **APIs & Services → OAuth consent screen:**
   - User type **External**.
   - Fill app name, support email, developer email.
   - **Scopes:** add `.../auth/calendar.freebusy` and `.../auth/calendar.events`.
   - **Test users:** while in "Testing" mode, add every attorney email you'll
     test with (only listed users can connect until you publish).
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID:**
   - Application type **Web application**.
   - **Authorized redirect URIs** — add both:
     - `http://localhost:3000/api/calendar/google/callback`
     - `https://YOUR-APP.vercel.app/api/calendar/google/callback`
   - Create → copy **Client ID** and **Client secret** into `.env.local`.
5. **Going live:** back on the OAuth consent screen, click **Publish app**.
   Because we only use calendar scopes, Google may require verification before
   unlimited public use — until then the "Testing" mode + test users works for
   development and pilots.
6. **Webhooks (optional but recommended for production):** Google only pushes
   calendar change notifications to a **verified domain**. In
   **Search Console** verify your Vercel domain, then add it under
   **APIs & Services → Domain verification**. Until then, connecting still works
   and availability is still correct (we compute live) — you just won't get
   instant push updates. The code treats watch setup as best-effort.

### 2. Azure Portal (Outlook / Microsoft 365)

1. Go to <https://portal.azure.com> → **Microsoft Entra ID → App registrations
   → New registration**.
   - Name: Brief.
   - Supported account types: **Accounts in any organizational directory and
     personal Microsoft accounts** (so both work/school and personal Outlook can
     connect).
   - **Redirect URI:** platform **Web**, value
     `http://localhost:3000/api/calendar/microsoft/callback` (add the Vercel one
     too, below).
   - Register.
2. Copy the **Application (client) ID** → `MS_CLIENT_ID`.
3. **Certificates & secrets → New client secret** → copy the secret **Value**
   (not the ID) → `MS_CLIENT_SECRET`. (Note its expiry; you'll rotate it later.)
4. **API permissions → Add a permission → Microsoft Graph → Delegated
   permissions** → add **`Calendars.ReadWrite`** and **`offline_access`**
   (and `openid`, `email`). Click **Add permissions**. (For personal-account
   testing no admin consent is needed; for org accounts an admin may need to
   consent.)
5. **Authentication → Web → Redirect URIs:** ensure both localhost and your
   `https://YOUR-APP.vercel.app/api/calendar/microsoft/callback` are listed.

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | What it is |
| --- | --- |
| `APP_URL` | Public base URL of this app (localhost, ngrok, or Vercel URL). |
| `SUPABASE_URL` | Supabase Project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role secret (server-only). |
| `TOKEN_ENCRYPTION_KEY` | 32-byte hex key for encrypting tokens. `npm run gen:key`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | From Google Cloud Console. |
| `MS_CLIENT_ID` / `MS_CLIENT_SECRET` | From Azure Portal. |
| `CRON_SECRET` | Random string protecting the cron endpoint. `npm run gen:key`. |

---

## Testing locally

1. `npm run dev` → app on `http://localhost:3000`.
2. Add a test attorney row (Supabase → Table editor → `attorneys` → Insert),
   set a real `timezone` (e.g. `America/Chicago`) and note its `id`.
3. **Connect a calendar:** open in your browser
   `http://localhost:3000/api/calendar/google/connect?attorney_id=<THE_ID>`
   (or `.../microsoft/connect?...`). Approve. You'll be redirected to
   `/attorney/calendar?connected=google`. Check the
   `attorney_calendar_connections` table now has a row.
4. **See free slots:** open
   `http://localhost:3000/api/attorneys/<THE_ID>/slots`. You'll get JSON with a
   `slots` array. Put a busy event on your real calendar for tomorrow at 10am,
   reload — that slot disappears.
5. **Book:** send a POST (e.g. with the browser console or curl):
   ```bash
   curl -X POST http://localhost:3000/api/bookings \
     -H 'Content-Type: application/json' \
     -d '{"attorneyId":"<THE_ID>","startAt":"<one of the ISO slots>","caseSummary":"Test"}'
   ```
   You'll get the booking back, the event appears on your real calendar, and
   that slot no longer shows in `/slots`.

### Testing webhooks locally (optional)

Google/Microsoft can't reach `localhost`. To test the change-notification
webhooks, expose your dev server with a tunnel:

```bash
npx ngrok http 3000        # or: cloudflared tunnel --url http://localhost:3000
```

Set `APP_URL` to the `https://…ngrok…` URL, add that same callback URL to both
providers' redirect lists, and restart `npm run dev`.

## Deploying to Vercel

1. Push this `brief/` folder to a Git repo and **Import** it in Vercel (set the
   **Root Directory** to `brief` if it lives in a monorepo).
2. Vercel → **Settings → Environment Variables:** add every variable from the
   table above. Set `APP_URL` to your `https://YOUR-APP.vercel.app` domain.
3. Add the Vercel callback URLs to Google and Azure redirect lists (step 1 & 2).
4. Deploy. The cron in `vercel.json` runs `/api/calendar/renew-watches` daily;
   Vercel automatically authenticates it with `CRON_SECRET`.
5. Re-run the local test steps against your Vercel URL.

---

## How this connects to your frontend

Once you migrate the Brief frontend to this Next.js app (or point your existing
app at these URLs):

- **Attorney "Connect calendar" button** → link to
  `/api/calendar/google/connect?attorney_id=…` or the microsoft one.
- **Client booking screen** → `GET /api/attorneys/[id]/slots` to render free
  times, then `POST /api/bookings` to book.

## Security notes

- Tokens are encrypted at rest (AES-256-GCM, `lib/crypto.ts`). Keep
  `TOKEN_ENCRYPTION_KEY` safe and identical across environments that share a
  database — rotating it makes existing stored tokens unreadable.
- The database uses the service-role key and bypasses RLS **on purpose**; all
  access rules live in the API routes. If you ever let the browser query
  Supabase directly, turn on RLS and add policies first.
- Clients never receive calendar event details — only free start times.
