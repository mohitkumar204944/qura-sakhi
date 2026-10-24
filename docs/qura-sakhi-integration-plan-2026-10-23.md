# Where Qura and Sakhi meet: the plan (23 Oct 2026)

**Status: decided 23 Oct (section 0); the build prompt is ready.** Nothing is built on Qura's side. Sakhi's half of the call request (Version 33) is
built but not deployed, so its contract can still change; section 3 revises it.

Based on the Qura discovery report Mohit pasted on 23 Oct. That report was read from Qura's production code (`origin/main` at
`6c719c5c`) by a Qura session; no Sakhi session read Qura's repo. File paths below that start with `src/` or `supabase/` are
Qura's and come from that report.

---

## 0. Mohit's decisions (23 Oct): the simplest path

> "confirmations will go over whatsapp only for now i am not concerned about if meta gets any insight or not but i want to
> make it work with least complications and changes only must do changes should be done at qura rest proceed with
> recommendations"

So, for now:
- **A Sakhi request becomes an ordinary `campaign_leads` row** (source `sakhi`, status `new`), worked in the existing
  `/admin/leads` queue with the existing Book & Send. There's no separate table or queue.
- **Confirmations go over WhatsApp, as for any Qura lead.** Qura's usual events after she books, pays or attends stay as
  they are. There's no `no_ad_tracking` switch.
- **Qura's must-do changes:**
  - the endpoint;
  - `email_opt_in = false` on the row, so Book & Send makes her account with marketing off;
  - `sakhi` in the source filter;
  - a small "From Sakhi" block on the lead page;
  - the remarketing sweep and the audience export skip `sakhi`;
  - nothing that sends `raw_field_data` out of Qura (the AI's context, the sheet, Meta, OpenAI) carries her shared sections.
- **No migration should be needed.** The build prompt is `docs/qura-session-prompt-2026-10-23.md`.
- **The contract is the one Sakhi already sends** (SERVER_SPEC 10.1): POST only, with the `X-Sakhi-Key` header. Signing,
  status and withdrawal (section 3 below) wait until they're needed.
- **The rest follows the recommendations**, where they need no extra Qura work:
  - coordinator call first;
  - always a new row;
  - English or Hindi report lines;
  - Trinaya Wellness LLP as controller;
  - three attempts before giving up, which is Qura's own process.
  Who sees her sections: anyone who can open the lead, which means admins and coordinators. Doctors can't open leads, so
  the doctor hears them from the coordinator, or sees her report on the call.
- **Sakhi changed its wording to match:**
  - "Qura's care team" sees what she ticks, not "the doctor";
  - the done screen says a booking is confirmed on WhatsApp;
  - deleting her Sakhi account warns that requests already sent stay with Qura's care team.
- **Deferred (not must-do; revisit before a public release):**
  - a separate table and queue;
  - the no-ads switch;
  - deleting her shared sections after 30 days;
  - a doctor's view;
  - status in her app, and withdrawal;
  - signed calls;
  - the WhatsApp bot handling replies to Sakhi's sign-in codes (section 7).

Sections 1 to 8 below are the full analysis, kept for when those come back.

## 1. What the report changes

1. **A Sakhi request can't simply become a normal Qura lead.** Putting it in `campaign_leads` would set off about ten things
   that run on that table or its statuses, whatever the source:
   - remarketing WhatsApps and emails;
   - her full name in the metrics Google Sheet;
   - her name and phone in the money-at-risk and callback Google Calendar events;
   - disposition emails;
   - pay-link nudges;
   - the audience export script.
   Each would need its own exclusion. A separate table keeps her out of all of them by construction.
2. **Ad and analytics events follow bookings, payments and attendance, not the lead's source.** If she books, pays or attends
   through Qura, these fire with no source check:
   - Meta `Schedule`, `Purchase` and `ConsultAttended` (with hashed name, phone and email, plus the consult outcome);
   - OpenAI Ads events.
   "Nothing about her goes to Meta" holds only if Qura gets one per-person "no ad tracking" switch that every such send
   checks. That is the largest piece of Qura work, and it's needed before a Sakhi woman books a consult.
3. **There's no safe place in Qura for her shared report today.**
   - Telesales see full lead rows.
   - Doctors can't see leads at all.
   - Any doctor, and the `marketing_readonly` role, can read every booking's `intake_form_data`.
   - Nothing is encrypted, and nothing is ever deleted.
   So the shared sections need their own table, their own access rule and their own deletion job. They must never be copied
   into a booking.
4. **This would be Qura's first partner endpoint.** The best pattern to copy is Qura's Razorpay and Resend webhook checks: an
   HMAC of the raw body, compared in constant time, plus a timestamp (Resend's check rejects anything older than 5 minutes).
   Plain shared-key headers, which my first draft used, are weaker than what Qura already does for payments.
5. **Qura has never told another system anything.** Statuses for her app are easiest if Sakhi asks Qura (a GET), since
   Sakhi's server already checks on her request whenever her app asks. Qura then needs no outbound queue.
6. **The coordinator sees what she shares, not only the doctor.** The app currently asks "What can the doctor see before the
   call?" That wording needs to say "Qura's care team: the person who calls you and your doctor" (doctor and counsel review).

---

## 2. Decisions (the report's 13 questions, with a recommendation each)

| # | Question | Recommendation |
|---|---|---|
| 1 | Who is "the care team"? | Admins and the telesales coordinators see the Sakhi queue: someone has to call her. Her shared sections are visible only to admins, the coordinator the request is assigned to, and the doctor assigned to the consult it leads to. |
| 2 | Should Qura store her report sections, and for how long? | Yes, in a separate table (`sakhi_call_requests`), never in `campaign_leads` or `consultation_bookings`. Clear them 30 days after the request closes, and at once if she withdraws. |
| 3 | May Qura WhatsApp her about the call? Can the bot or the AI handle her messages? | Phone only, to arrange the call. No WhatsApp opener, bot or AI for a Sakhi request. Sakhi's app shows "Qura tried to call you" instead (section 3). |
| 4 | Is "no Meta, ads or analytics" per request, or does it follow her? | It follows her as a person: a permanent `no_ad_tracking` flag on her Qura account, checked by every ad and analytics send, remarketing and the newsletter. |
| 5 | Should a request create a Qura account? | Only when a consult is booked, because booking needs an account. Set marketing opt-ins to an explicit false and `no_ad_tracking` to true. |
| 6 | Her number is already a Qura lead or patient. What then? | Always a new Sakhi request row, with a "Already a Qura lead / patient" badge for the coordinator. Don't change or merge the other row. An old `do_not_contact` doesn't block this call: she asked for it. |
| 7 | A coordinator call first, or straight to the free 20-minute consult? | A coordinator call first, which is how Qura works and what the app promises ("Qura's team will call you"). The coordinator books the free consult during that call if she wants it. |
| 8 | Do the metrics sheet and the money-at-risk and callback calendars count as the care team? | Keep Sakhi requests out of all three. The separate table does that. A callback event for a Sakhi request carries the reference only, no name or phone. |
| 9 | Status mapping, attempts and promises | See the status list in section 3. Three attempts over two working days, then "couldn't reach". Internal target: first attempt within Qura's existing 4-hour New SLA, in working hours. The app promises no time. |
| 10 | Languages beyond English and Hindi | Sakhi sends the report lines in English or Hindi, as it already defaults. `lang` tells the coordinator her app language; Qura calls in English or Hindi. |
| 11 | Data controller | Trinaya Wellness LLP for both. Qura's privacy policy gets a Sakhi section (counsel). |
| 12 | Live flags, and the 8 local Qura commits | Mohit checks the flags in Vercel. The Qura build works from `origin/main`. Whether the 8 local commits ship first is Mohit's call. |
| 13 | How is she told about a booked consult? | In the Sakhi app (the consult time and join link come back with her status), by the coordinator on the call, and by email if she has one. Not by WhatsApp, which would tell Meta she has a consult. |

Question 13 isn't in the report; the plan raised it.

---

## 3. The contract, v1 (revised; nothing is deployed yet)

Three calls, all from Sakhi's server to Qura, all signed the same way, all safe to repeat.

**Signing (every call)**
- `X-Sakhi-Timestamp`: Unix seconds.
- `X-Sakhi-Signature`: `v1=` + hex HMAC-SHA256 of `<timestamp>.<METHOD>.<path>.<raw body>`, keyed with the shared secret.
  The body is empty for GET and DELETE.
- Qura rejects a timestamp more than 5 minutes off with `401`, and compares in constant time.
- Qura accepts two secrets at once (current and next), so the key can be rotated without downtime.
- Every call is idempotent, so a replay inside the 5 minutes changes nothing. That's why no replay ledger is needed.

**1. Create: `POST /api/partners/sakhi/v1/call-requests`**
- The body is as built: `ref`, `phone`, `name`, `best_time`, `topic`, `lang`, `asked_at`, `consent`, `shared_data`.
- Answers:
  - `201 { "request_id" }` for a new request;
  - `200` with the same id for a repeated `ref`;
  - `400` for a bad body;
  - `401` for a bad signature;
  - `503` if Qura's key isn't set;
  - `5xx` for anything else.
- Sakhi's retry rules are unchanged (SERVER_SPEC 10.1).

**2. Status: `GET /api/partners/sakhi/v1/call-requests/{ref}`**
- Answers `200 { "ref", "status", "consult_at", "join_url", "updated_at" }`, or `404` if Qura has no such request.
- `consult_at` and `join_url` are set only while a consult is booked and hasn't passed.
- Sakhi's server asks this only while a request is open and her app is asking, at most once every 10 minutes per request.
- Sakhi keeps `status` and `consult_at` on its own row. It passes `join_url` to her app without keeping it.

**3. Withdraw: `DELETE /api/partners/sakhi/v1/call-requests/{ref}`**
- Sakhi sends this when she taps "Cancel my request", or deletes her Sakhi account while a request is open.
- Qura marks the request `withdrawn` and clears the topic and shared sections. It keeps the reference, `asked_at`, the
  consent fields and the withdrawal time.
- A consult that's already booked is not cancelled automatically: the coordinator sees "withdrawn" and calls her.
- Answers `200 { "status" }`, the same on a repeat.
- If Qura can't be reached, Sakhi keeps a reference-only record and retries for 24 hours, even after her account is gone.

**The statuses she sees**

| Status | Set in Qura when | Her app says (draft, for review) |
|---|---|---|
| `received` | The request is stored | Qura has your request |
| `trying` | A call attempt is logged without reaching her | Qura tried to call you. They'll try again. |
| `talked` | The coordinator logs that they spoke | You spoke with Qura's team |
| `consult_booked` | A free consult is booked from the request | Your free consult: 28 Oct, 5:00 pm, plus a Join button |
| `could_not_reach` | 3 attempts over 2 working days fail | Qura couldn't reach you. Book a time yourself, or ask again. |
| `closed` | The coordinator closes it, after the call or the consult | Done |
| `withdrawn` | Sakhi's DELETE | You cancelled this request |

Sakhi's own delivery states (`queued`, `sent`, `failed`) stay as built. `sent` means Qura has it, and Qura's status takes
over from there.

---

## 4. Qura's side (built in a Qura session from `origin/main`)

1. **Tables**, using Qura's migration house style:
   - `sakhi_call_requests`:
     - from Sakhi: `ref` UNIQUE, `phone_digits`, `name`, `best_time`, `topic`, `lang`, `asked_at`, `notice_version`,
       `shared_keys`, `shared_data` (jsonb, nullable);
     - Qura's tracking: `status`, `attempts`, `last_attempt_at`, `assigned_to`, `booking_id`, `user_id`,
       `matched_lead_id`, `matched_user_id`, `closed_at`, `withdrawn_at`, `created_at`;
     - RLS on, with no policies.
   - `sakhi_call_request_events`: append-only (attempt, outcome, note, actor, time). Notes never hold her shared sections.
2. **The partner check** `verifySakhiSignature`: modelled on `src/lib/webhooks/svixSignature.js`. Constant-time, with the
   5-minute window and two secrets. It gets unit tests, including a signing helper for tests.
3. **The three routes** in section 3, all service-role. They never call `sendLeadOpener`, a Meta or OpenAI send, an email,
   the sheet, a calendar or the AI.
4. **A "Sakhi calls" queue** for admins and telesales. It's a new page or a new tab, not the campaign lead list. The detail
   page has:
   - her topic, best time and language;
   - the existing-lead or patient badge;
   - the shared sections as escaped plain text, shown only to admins and the assigned coordinator;
   - buttons: log an attempt, spoke with her, book the free consult, couldn't reach, close.
   Opening the page writes to `audit_logs`, as lead pages already do.
5. **Booking from a request:** a new booking lane `sakhi` that calls `bookFreeIntroConsult` with `reportConversion:false`.
   - It provisions her account with marketing opt-ins set to false and `no_ad_tracking` set to true.
   - Phone verification: the coordinator has just spoken to her on that number, and Sakhi verified it by OTP. Record that as
     the verification, which is a decision for Mohit.
   - Confirmation goes by email and through her Sakhi status, never WhatsApp.
6. **The doctor's view:** a doctor-only route that shows the shared sections to the doctor assigned to the consult booked
   from that request, until the request's sections are cleared. If this isn't built in time, the app wording must say the
   coordinator sees them and the doctor hears them on the call.
7. **`no_ad_tracking`**, checked by one helper, `adTrackingAllowed(person)`, in every place that sends:
   - `freeIntroConversion`, the payment webhook's Purchase-family and OpenAI events;
   - `consultAttendedCapi`, `bookingLeadCapi`;
   - the remarketing sweep and the newsletter;
   - the audience export script.
   Tests prove that a Sakhi-origin person sends nothing to Meta or OpenAI through booking, payment or attendance.
8. **A daily job** that clears `shared_data` and `topic` 30 days after a request closes. Withdrawal clears them at once.
9. **Docs:** a copy of this contract in Qura's repo (`docs/partners/sakhi-v1.md`), as both repos keep one.

---

## 5. Sakhi's side (this repo)

1. **Signing:** `send.js` signs every call with `X-Sakhi-Timestamp` and `X-Sakhi-Signature` instead of sending the key
   itself. Tests check the signature against a reference implementation.
2. **Status:**
   - `call_requests` gains `qura_status`, `consult_at`, `status_checked_at` and `closed_at`.
   - Sakhi's GET with her token asks Qura for open requests, at most once every 10 minutes each. The status and
     `consult_at` go back to her app; `join_url` is passed through without being kept.
   - A request counts as open until `could_not_reach`, `closed` or `withdrawn`, or 30 days.
3. **Withdraw:**
   - "Cancel my request" in the app.
   - Before `DELETE /v1/me` deletes her rows, Sakhi sends Qura a withdrawal for each open request, with reference-only
     retries.
4. **Retention:** Sakhi deletes its request rows 30 days after they close.
5. **App:**
   - status lines on Ask and on the done screen;
   - the consult time with a Join button, and an offer to set a Sakhi reminder for it;
   - the wording change from section 1, item 6;
   - Hindi for all of it, and the new lines in the wording review (doctor and counsel).
6. **Spec and tests:** SERVER_SPEC 10.1, the API tests (signature, status, withdraw, retention), `handoff.mjs` and the
   end-to-end test.

---

## 6. Order of work

1. **Mohit decides** section 2, and in particular items 1, 4, 5 and 13.
2. **Sakhi, about a day:** section 5, tested against a stand-in Qura. Still not deployed.
3. **Qura, in a Qura session:** section 4, in this order:
   1. `no_ad_tracking` and its tests;
   2. the table and the signature check;
   3. the three routes;
   4. the queue;
   5. booking and the doctor's view;
   6. the clean-up job.
   The no-ads switch comes first: without it, a Sakhi woman who books sends events to Meta.
4. **Together:** generate the secret once and set it in Vercel and on Sakhi's Supabase. Deploy Sakhi's server (Mohit's yes),
   then test with a staff phone end to end: create, try, speak, book, check the status in the app, withdraw.
5. **Later, the same pattern:**
   - "Tell a person": a `kind` of `message`, or its own route.
   - Picking a slot inside Sakhi: reading Qura's public `GET /api/availability`, plus a partner booking route.

---

## 7. Qura issues in the report that touch Sakhi women (Qura's to fix; not built from here)

- **Sakhi's sign-in codes go out on Qura's WhatsApp number.** Any reply from a Sakhi woman opens a thread in Qura's bot
  triage, and possibly the AI. Options:
  - the bot gives such threads a neutral, no-marketing reply;
  - or Sakhi gets its own WhatsApp number on Qura's business account (it needs a SIM).
  This is live today, separate from the call request.
- **RLS on `whatsapp_inbound_messages`.** It isn't enabled in any Qura migration, and the live state is unknown. If it's off,
  the public key could read message text.
- **Any doctor and `marketing_readonly` can read every booking's `intake_form_data`.** This is why the shared sections must
  never be copied into a booking.
- **Accounts default to opted in for marketing.** Qura's own migration comment says this doesn't meet DPDP. Sakhi-created
  accounts must set an explicit false.
- **Logs of who viewed a record.** Lead events don't show on `/admin/audit-log`, which reads another table, and doctor views
  aren't logged at all.

---

## 8. Still open for Mohit

- The decisions in section 2.
- Whether a coordinator's call plus Sakhi's OTP counts as phone verification for booking the free consult (section 4,
  item 5).
- Who at Qura owns the Sakhi queue during the pilot, and their working hours.
- Counsel on the consent and notice lines once the wording changes, and on Qura's privacy-policy section.
