# Qura Sakhi: server spec, version 1 (accounts)

Written 20 Oct 2026 for the developer who builds Sakhi's server, and revised the same day for two decisions:
- no new spend;
- Sakhi stays separate from Qura in code, database and deploys.

**Status, 20 Oct 2026:** the server is built in `server/`: code, migration and tests (section 9). It is live on Sakhi's own
free project `qura-sakhi` (ref `jovplellzaxebcdekpax`, Mumbai), and it has sent real codes to a staff phone by WhatsApp and
by SMS. An app built without the server's address runs its stand-in server on the phone, which sends nothing (the code is
always 123456).

Mohit's rules:
- every woman signs up, and her health data stays on her phone;
- nothing here may cost new money;
- a change in Qura must never break Sakhi, and the reverse.

---

## 1. What the server does, and what it never does

**Does (version 1, this spec):**
- Signs a woman up with her mobile number and a 6-digit code sent on WhatsApp, or by SMS.
- Keeps her account details: number, birth year, first name and PIN code (needed), and the optional email, how she heard of
  Sakhi, and whether she wants updates by SMS or WhatsApp.
- Records the last day she opened Sakhi, plus her app version and language, once a day.
- Logs her out and deletes her account when she asks.

**Never does:**
- Receives or stores anything from her diary. That means no period dates, symptoms, moods, notes, check-ins, pregnancy or
  after-birth details, conditions, medicines, reports, her stage, her goals, or which health screens she opens.
- Shares account data with Meta or any ad platform, or sends it to a third-party tracker. The code messages themselves go
  through Meta (WhatsApp) or AuthKey (SMS) and carry only the code.
- Writes to Qura's database or Qura's lead tables.

**Later (phase 2, section 10, not built in the app yet):**
- The doctor-call hand-off to Qura: the only link between the two products.
- Anonymous usage counts, crash reports, content and safety switches, "Tell a person", and a locked cloud backup.

---

## 2. Rules the build must keep

1. **Allowlist both ends.** The app sends only the fields listed in section 5 (`SEND` in `web/app.js`). The server rejects
   any other field with `400 field_not_allowed`. It logs the field *name* only, never the value.
2. **Separate from Qura everywhere.**
   - **Code:** the server lives in this repo (`~/Desktop/QuraSakhi/sakhi/server`) and imports nothing from Qura's codebase.
     The roughly 100 lines that send codes are copied from Qura's `src/lib/authkey.js`, not shared, so a Qura change can't
     break Sakhi's login.
   - **Database:** Sakhi's own Supabase project (section 3).
   - **Login system:** no Supabase Auth, just these small account tables and opaque tokens. The codes go through Qura's WhatsApp
     template and AuthKey, which Supabase's built-in phone login can't use without extra hooks, and the app needs nothing
     more than a token.
   - **One connection only:** Sakhi never reads Qura's data and Qura never reads Sakhi's. The doctor-call hand-off
     (section 10.1) is the only connection.
3. **Not leads.** A Sakhi account is not a Qura lead. A woman reaches Qura's team only when she asks for a call, and only with
   what she agrees to share (section 10.1).
4. **Update messages only with her yes**, recorded as a consent row (section 4). They carry general news (new guides,
   government health programmes), never anything about her own health. On a shared phone, an SMS or WhatsApp message can be
   read by family.
5. **Store the minimum.**
   - No IP addresses in tables.
   - Phone numbers are hashed in logs.
   - Session tokens and codes are stored only as hashes.

---

## 3. Architecture (no new spend)

- **Where: Sakhi's own Supabase project on the free plan.** If Qura's Supabase organisation is on a paid plan, create a
  separate free organisation for Sakhi.
  - The free plan, according to third-party guides from 2026 (check supabase.com/pricing):
    - 2 active free projects per account;
    - 500 MB of database, enough for hundreds of thousands of accounts;
    - 500,000 function calls a month, enough for roughly 15,000 women opening Sakhi every day;
    - 50,000 monthly active users.
  - **It pauses after 7 days with no database activity.** Restoring it is one click. While it's paused, signup fails and the
    app lets her "Continue for now"; her diary is unaffected.
  - **No reliable backups.** Take the weekly export in section 9. If the data were ever lost, women would just sign in again;
    their diaries are on their phones.
  - Pay only if Sakhi outgrows these limits.
- **If there is no free slot:** a `sakhi` schema inside Qura's project, under these rules:
  - Sakhi's SQL stays in this repo and is applied with the SQL editor or `psql`, never through `supabase db push`. If both
    repos used Supabase's migration history, each would see migrations it doesn't have and `db push` would fail in both.
  - The schema is not exposed through the REST API.
  - Qura code never reads it, and Qura's CLAUDE.md marks it out of scope.
  - Secrets are prefixed `SAKHI_`.
  - The function is deployed by name from this repo, so Qura's deploys never touch it.
- **API:** one Edge Function, `sakhi-api`, that routes on the path after the function name: `/v1/otp/start`,
  `/v1/otp/verify`, `/v1/me`, `/v1/me/active`, `/v1/session/logout`.
  - Deploy it with JWT verification **off** (`verify_jwt = false` in `supabase/config.toml`, or `--no-verify-jwt`). The app
    sends its own Sakhi token, not a Supabase one, and sends none at all for the two code calls.
  - It reaches the database directly with postgres.js through `SUPABASE_DB_URL`, which Supabase gives every Edge
    Function. The REST API can't be used, because the `sakhi` schema isn't exposed through it.
  - Code: `server/supabase/functions/sakhi-api/`. `index.ts` starts it; `api.js`, `store-pg.js` and `send.js` hold the logic
    and run unchanged in the Node tests.
- **Base address:** the app is built with `SAKHI_API=<base>` (see `android/build-apk.sh`) and calls `<base>/v1/...`.
  - On the free plan that is the function's own address: `https://<ref>.supabase.co/functions/v1/sakhi-api`, so the first
    call goes to `https://<ref>.supabase.co/functions/v1/sakhi-api/v1/otp/start`.
  - A custom domain is a paid add-on, so it waits. Note that the address is built into the app.
- **CORS:**
  - `Access-Control-Allow-Origin: *`
  - Methods: `GET, POST, PATCH, DELETE, OPTIONS`
  - Headers: `content-type, authorization`
  - No cookies.
  - Answer `OPTIONS` with 204.
  - The Android app's page origin is `file://`, so browsers send `Origin: null`.
- **Sending codes: Qura's existing accounts, Sakhi's own code.**
  - **WhatsApp:**
    - Qura's existing WhatsApp Business number and its approved `otp` authentication template, sent through Meta's Cloud API.
    - Meta fixes the text and it is neutral: "123456 is your verification code. For your security, do not share this code.",
      with a copy-code button.
    - The template is English only today.
  - **SMS:** Qura's AuthKey account and its existing OTP SMS template, already registered under Trinaya Wellness LLP's DLT
    entity. No new number, provider or registration.
  - **Secrets:** Sakhi's function keeps its own copies as secrets: Meta access token, WhatsApp phone number ID, AuthKey key,
    AuthKey OTP SMS template ID.
    - The same token and key now live in two projects, so rotate them in both.
  - **Which channel:**
    - `auto` (default): WhatsApp first. If the WhatsApp call fails outright, send by SMS at once.
    - `sms`: SMS only. This is the app's "Not on WhatsApp? Send by SMS".
  - **Why SMS stays one tap away:** WhatsApp accepts a message for a number that isn't on WhatsApp and reports the failure
    later (error 131026) to Qura's webhook, which Sakhi doesn't read.
  - **Replies:**
    - A woman who replies to a code message reaches Qura's WhatsApp inbox, and Qura's bot greets her like any new chat.
    - This is accepted for now and needs no Qura change.
    - If replies become a nuisance, the fix is a separate number for Sakhi: a SIM, not a subscription.
- **Time:** "today" means India time (`Asia/Kolkata`) everywhere.
- **Other secrets:**
  - `SAKHI_OTP_PEPPER`: HMAC key for codes.
  - `SAKHI_IP_SALT_SEED`: HMAC key for daily IP hashes.

---

## 4. Tables

The SQL lives in `server/supabase/migrations/20261020120000_sakhi_accounts.sql`, which is the source of truth. All tables
are in a schema called `sakhi`, with RLS on and no policies:

| Table | Holds |
|---|---|
| `accounts` | Number, birth year, her details (first name, PIN code, optional email and the rest), district and state from the PIN code, language, platform, app version, last active day |
| `otp_challenges` | Each code sent: number, channel, HMAC of the code, tries, expiry, used time |
| `sessions` | SHA-256 of each token, its account, the last day it was used, revoked time |
| `consents` | Terms and update choices, with the notice version and time |
| `rate_hits` | One counter per key per time window (the function works out the window, so tests can move the clock) |
| `daily_stats` | Signups, active women, WhatsApp and SMS codes sent, per India date |
| `pincodes` | PIN code to district and state, loaded with `server/scripts/load-pincodes.mjs` |
| `jobs` | When the daily clean-up last ran |

**Daily clean-up, with no cron needed:** the first code request after 24 hours claims the `jobs` row and deletes:
- challenges older than a day;
- rate counters older than two days;
- sessions revoked more than 30 days ago or unused for 365 days.

---

## 5. API

- **Format:** JSON in and out. Errors look like `{ "error": "<code>" }`, sometimes with extra fields.
- **Login:** calls under `/v1/me` and `/v1/session` need `Authorization: Bearer <token>`.
- **Size:** request bodies are limited to 2 KB (`413 too_large`). Broken JSON is `400 bad_json`.
- **Unknown fields:** any field not listed for a call gives `400 field_not_allowed`.
- **Unknown paths:** `404 not_found`, or `405 method_not_allowed` for a known path with the wrong method.
- **Malformed values:** a challenge that isn't a UUID is `400 challenge_bad`, a code that isn't 6 digits is `400 code_bad`, and
  other fields give `400 <field>_bad`.

| Call | Fields the app may send (`SEND` in `web/app.js`) |
|---|---|
| `POST /v1/otp/start` | `phone`, `channel`, `lang`, `app`, `platform` |
| `POST /v1/otp/verify` | `challenge`, `code`, `birth_year`, `notice`, `lang`, `app`, `platform` |
| `PATCH /v1/me` | `name`, `pincode`, `heard`, `upd_sms`, `upd_wa`, `lang` |
| `POST /v1/me/active` | `app`, `lang` |
| `POST /v1/session/logout` | nothing |
| `DELETE /v1/me` | nothing |
| `GET /v1/me` | nothing (not called yet; also serves as "show me my data") |

### 5.1 `POST /v1/otp/start`

```json
{ "phone": "+919876543210", "channel": "sms", "lang": "hi", "app": "0.21-demo", "platform": "android" }
```

1. Check the phone matches `^\+91[6-9][0-9]{9}$` (`400 phone_bad`). `channel` is optional: `auto` (the default) or `sms`.
2. Apply the rate limits with `sakhi.hit` (`ip` = HMAC of the client IP with a salt that changes daily; the raw IP is never
   stored). If any limit is exceeded, return `429 too_many` with `retry_after` (seconds):

   | Key | Limit |
   |---|---|
   | `otp:phone:<phone>:<channel>` | 1 per 30 seconds (so switching to SMS works straight after a WhatsApp send) |
   | `otp:phone:<phone>` | 5 per hour, 10 per day |
   | `otp:ip:<ip>` | 20 per hour |

3. Make a 6-digit code from a secure random source. Store it as an HMAC, never as the plain SHA-256 that Qura's helper
   returns: a plain hash of a 6-digit number is reversed in moments.
4. Send it (section 3: WhatsApp first for `auto`, or straight to SMS) and add 1 to `daily_stats.wa_sent` or `sms_sent`.
   - If both channels fail, return `502 send_failed`.
5. Return the channel actually used:

   ```json
   { "challenge": "<uuid>", "channel": "whatsapp", "resend_after": 30, "expires_in": 600 }
   ```

   The answer is the same whether or not the number already has an account.

### 5.2 `POST /v1/otp/verify`

```json
{ "challenge": "<uuid>", "code": "424242", "birth_year": 1994, "notice": "2026-10-20",
  "lang": "en", "app": "0.21-demo", "platform": "android" }
```

1. Limit `verify:ip:<ip>` to 60 per hour (`429 too_many`).
2. Load the challenge.
   - Missing or already used: `400 challenge_bad`.
   - Past `expires_at`: `410 code_expired`.
3. Compare HMACs in constant time.
   - Wrong code: add 1 to `tries` and return `400 code_wrong` with `tries_left`.
   - At 5 tries: mark the challenge used and return `429 too_many`.
4. Mark the challenge used.
5. Find the account by phone.
   - **New account:**
     - `birth_year` is required (`400 birth_year_needed` if missing).
     - If `birth_year > (India year − 18)`, return `403 under_18`. The app already blocks under-18s and asks the month for the
       borderline year.
     - Insert the account with `lang`, `platform` and `app_version`.
     - Insert a consent row (`terms`, `granted = true`, `notice_version = notice`).
     - Add 1 to `daily_stats.signups`.
   - **Existing account:**
     - Fill `birth_year` only if it is empty.
     - If her latest `terms` consent has a different `notice_version`, add a new `terms` row.
6. Create a session: 32 random bytes as base64url. Store its SHA-256 and return the token once.
7. Return:

   ```json
   { "token": "<43 chars>", "is_new": true,
     "account": { "id": "<uuid>", "phone": "+919876543210", "birth_year": 1994, "name": null, "pincode": null,
                  "email": null, "heard": null, "upd_sms": false, "upd_wa": false } }
   ```

   When `is_new` is false and the account already has a first name and PIN code, the app skips the details screen.

### 5.3 `PATCH /v1/me`

Every field is optional in a request, so one edit can change one thing. Her first name and PIN code are needed: the app keeps
her on the details screen until both are in, and here they can be changed but never emptied. An empty string clears `email`
or `heard`. (Mohit, 20 Oct 2026: "app should collect email as optional name and pincode should be mandatory".)

| Field | Rule |
|---|---|
| `name` | Trimmed, control characters removed, 2–40 characters with at least one letter (any script) |
| `pincode` | `^[1-9][0-9]{5}$`, looked up in `sakhi.pincodes` to fill `district` and `state` (both null if not found) |
| `email` | Trimmed and lower-cased, at most 254 characters, `^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$`, no control characters. Only for Qura to reach her about her account |
| `heard` | One of `doc` `fam` `wa` `social` `qura` `other` |
| `upd_sms`, `upd_wa` | Booleans. A change adds a consent row with the new value and her newest `terms` version |
| `lang` | Two lowercase letters |

If a value is invalid, return `400 <field>_bad`. On success, return `200 { "account": { ...same shape as above } }`.

### 5.4 `POST /v1/me/active`

```json
{ "app": "0.21-demo", "lang": "hi" }
```

- If `last_active_on` is not today (India date): set it to today, set `app_version` and `lang`, and add 1 to
  `daily_stats.active`.
- Set `sessions.last_used_on` to today.
- Return `204`.
- The app sends this at most once a day, never for the sample women.

### 5.5 `POST /v1/session/logout`

Set `revoked_at` on this session and return `204`. The app clears the account on the phone whatever the answer.

### 5.6 `DELETE /v1/me`

- Delete the account. Sessions and consents go with it (cascade).
- Return `204`.
- The app treats `401` and `404` as "already deleted".

### 5.7 Login on every `/v1/me` and `/v1/session` call

Hash the bearer token and find its session where `revoked_at is null` and `last_used_on` is within 365 days. If none is found,
return `401 unauthorized`. The app then signs her out on the phone and shows the signup screen again; her diary is untouched.

### 5.8 How the app reads each answer

| Answer | What she sees |
|---|---|
| `channel: "whatsapp"` | "We sent a 6-digit code on WhatsApp to …" plus **Not on WhatsApp? Send by SMS** |
| `channel: "sms"` | "We sent a 6-digit code by SMS to …" |
| Network failure, timeout (15 s), 5xx or `send_failed` | "Couldn't reach Qura…", plus **Continue for now** (Home keeps a "Finish signing up" card) |
| `phone_bad` | "Enter a 10-digit mobile number." |
| `code_wrong` | "That code didn't match…" |
| `code_expired`, `challenge_bad` | "That code has expired. Ask for a new one." |
| `too_many` | "Too many tries. Please wait a little…" |
| `401` | Signed out on the phone; the signup screen comes back |
| Details screen failed offline | Kept on the phone and sent on the next app open or when the phone comes back online |

---

## 6. Security checklist

- **Codes:**
  - 6 digits from a secure random source.
  - Stored as an HMAC and compared in constant time.
  - Expire after 10 minutes, allow 5 tries, and can be resent after 30 seconds on the same channel.
  - Capped per number, per day and per IP hash.
  - Error messages never say whether a number has an account.
- **IP limits:** the IP is only ever stored as a daily HMAC. A request with no IP header skips the IP limits rather than
  sharing one counter with everyone.
- **Message-pumping guard:** Indian mobiles only, the caps above, and an alert when `daily_stats.wa_sent` plus `sms_sent`
  passes a threshold you set. Each message is paid for from Qura's Meta and AuthKey balances.
- **Tokens:**
  - 256-bit random; only the SHA-256 is stored.
  - Revoked on logout and on account deletion.
  - Expire after 365 days unused.
- **Logs:** never log request bodies, codes or tokens. Log phone numbers only as hashes. Supabase's platform logs keep request
  metadata, including the IP, for a short time; nothing in the `sakhi` tables keeps an IP.
- **Access:** service role inside the function only. Phone numbers are shown masked (`+91 ••••• •3210`) except to staff
  handling a deletion or support request.
- **Defense in depth:** reject unknown fields and wrongly typed values, and keep bodies under 2 KB.

---

## 7. Qura's view of Sakhi (free, and nothing inside Qura's admin)

Start with these as saved queries in Sakhi's Supabase SQL editor. A small dashboard can come later in this repo, never inside
Qura's admin panel.

```sql
-- Active women (India dates)
with t as (select (now() at time zone 'Asia/Kolkata')::date as d)
select count(*) filter (where last_active_on = t.d)      as today,
       count(*) filter (where last_active_on > t.d - 7)  as last_7_days,
       count(*) filter (where last_active_on > t.d - 30) as last_30_days
from sakhi.accounts, t group by t.d;

-- Still opening Sakhi N weeks after signing up, by signup week ("unbounded" retention:
-- last_active_on is the latest day she opened it, so on or after signup + N days means she was still using it then)
select date_trunc('week', created_at at time zone 'Asia/Kolkata')::date as signup_week,
       count(*) as signups,
       round(100.0 * count(*) filter (where last_active_on >= (created_at at time zone 'Asia/Kolkata')::date + 7)  / count(*), 1) as pct_after_1w,
       round(100.0 * count(*) filter (where last_active_on >= (created_at at time zone 'Asia/Kolkata')::date + 28) / count(*), 1) as pct_after_4w,
       round(100.0 * count(*) filter (where last_active_on >= (created_at at time zone 'Asia/Kolkata')::date + 84) / count(*), 1) as pct_after_12w
from sakhi.accounts group by 1 order by 1;

-- Signups by language, how she heard, and state
select lang, heard, state, count(*) from sakhi.accounts group by 1, 2, 3 order by 4 desc;
```

Read the newest weeks with care: weeks younger than N weeks can't have reached N yet. Deleted accounts drop out of every figure.

---

## 8. Load and cost

- **New spend: ₹0.** The Supabase project is on the free plan. Codes use Qura's existing WhatsApp number, template and AuthKey
  account.
- **Running cost:** one WhatsApp or SMS message per signup and per login on a new phone, the same per-message price Qura pays
  for website logins today.
- **The free plan covers** about 30,000 `me/active` calls a day at its limit (about 500,000 calls a month), and about 100 MB of
  rows per 100,000 accounts.
- **When to pay:** if daily users pass about 15,000, or if you want real backups. Make that call when the numbers justify it.

---

## 9. Testing, backups and rollout

1. **Server contract tests:** `node server/test/api.test.mjs` (197 checks).
   - Every row of section 5, run twice: once on an in-memory store, and once on the real SQL in PGlite (Postgres running
     inside the test).
   - Also covers the exact Meta and AuthKey requests, the daily clean-up, the PIN-code loader, and a check that the app's
     `SEND` list and the server's `ALLOW` list are identical.
2. **End to end:** `node server/test/app-e2e.mjs` (21 checks).
   - The real app in a browser signs up against the real server code over HTTP (a first name is asked for before anything
     is sent; the email lands lower-case), edits, logs out, signs back in by SMS and deletes the account.
   - It checks the database row by row, and that no request carried anything but allowlisted fields.
3. **App test** (`web/test/signup.mjs`, 80 checks): the same flow against a stand-in server inside the test. Keep it in step
   with any change here.
4. **Key script** (`server/test/set-qura-keys.test.mjs`, 15 checks): what `server/scripts/set-qura-keys.sh` saves and when it
   stops, with stand-in commands; it never prints a key.
5. **Everything at once:** `npm test`, or `npm run test:server` for the server only. Run it before every deploy.
6. **Weekly export** (free): `supabase db dump --data-only --schema sakhi`. Keep it in an encrypted folder, never in git: it
   holds phone numbers.
7. **Before real users:** follow `server/DEPLOY.md`.
   - Free project, migration, secrets, deploy, then staff phones only: sign up, edit, log out, sign back in, delete.
   - The release build needs the real signing key, not the prototype one.

---

## 10. Phase 2 (not built in the app yet)

### 10.1 The doctor-call hand-off: the only link between Sakhi and Qura

When she taps "Talk to a Qura doctor" and agrees on the itemised share screen (already in the app):
1. The app sends the request to Sakhi's server: a new endpoint, `POST /v1/requests`, logged in, with its own allowlist.
2. Sakhi's server forwards it to Qura:

   ```
   POST https://quranutrition.com/api/partners/sakhi/v1/call-requests
   X-Sakhi-Key: <shared secret, set in both projects>

   { "ref": "QC-4821", "phone": "+919876543210", "name": "Asha", "best_time": "morning", "topic": "Irregular periods",
     "lang": "hi", "consent": { "notice": "2026-10-20", "shared": ["periods", "situation"] },
     "shared_data": { ...only the items she ticked... } }
   ```

3. **Qura's side:**
   - Creates a lead with source `sakhi`, once per `ref` (a repeated request with the same `ref` is ignored).
   - Answers `201 { "lead_id": ... }`.
   - Contacts her only to arrange the call she asked for.
4. **Sakhi's side:**
   - Retries on network errors or 5xx for 24 hours.
   - After that, marks the request failed and shows her the booking link instead.

Other rules for the hand-off:
- This is the one place any health detail leaves her phone, only what she ticked, and only to Qura (never Meta). The privacy
  notice must say so.
- The contract is versioned. Both repos keep a copy of this section, and a change means a new `v2` path, never an edit to
  `v1`.
- This endpoint is the only thing Qura's codebase needs to know about Sakhi.

### 10.2 The rest

- **Anonymous usage counts:**
  - No login header and no IP stored.
  - Daily, weekly and monthly pings with app version, language, install week and which parts of the app were used.
  - Abortion, pregnancy loss, violence, sexual health and self-harm screens are never counted.
  - Added to the day's totals on arrival rather than stored ping by ping.
- **Crash reports:** error message, stack (with no user text), app version, phone model and app area.
- **Content and switches:** static JSON (`config.json`: newest and minimum version, download link, tools switched off, content
  version; plus content bundles). It is the same for every phone, so a tool can be switched off within hours if a doctor finds a
  mistake.
- **"Tell a person":**
  - The message goes to a coordinator queue with a 1-working-day timer, because the app promises that.
  - It uses the same hand-off pattern as 10.1 if Qura's team answers it.
- **Locked cloud backup:** the server stores only an encrypted blob made on the phone. The key comes from a long passphrase or
  recovery key that never leaves the phone.

---

## 11. Open decisions (Mohit, with counsel where marked)

1. Whether your Supabase account still has a free project slot. If not, use the schema fallback in section 3.
2. How opt-ins for WhatsApp updates are recorded and sent. WhatsApp's business rules need an opt-in, and the content stays
   general.
3. Retention, with counsel:
   - How long an account that is never opened is kept.
   - How long consent rows are kept after deletion.
   - Whether to keep a hashed "deleted, don't message" record.
4. The privacy notice and Grievance Officer (counsel). It must name the processors: Supabase (accounts), Meta via WhatsApp and
   AuthKey (code delivery). It must also cover the doctor-call hand-off once that is built.
5. Whether "Just read" readers must sign up. The app currently says yes; changing it is one line (`needsSignup` in
   `web/app.js`).
6. Whether she can keep using the diary after logging out or deleting her account. The app currently shows the signup screen
   again.
7. Replies to code messages land in Qura's WhatsApp inbox. This is accepted for now; a separate Sakhi number is the fix if
   needed.
