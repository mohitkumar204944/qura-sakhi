# Discovery prompt for a Claude session in the Qura project (23 Oct 2026)

Run this first, before `docs/qura-session-prompt-2026-10-23.md`. Paste everything below the line into a Claude session
opened in `~/Desktop/qura_nutrition-version1`. It only reads; it builds nothing. Bring its report back to a Sakhi session,
and the endpoints where Qura and Sakhi meet get planned from it. The build prompt is revised after that.

---

I want to understand how Qura manages a lead today, before we plan how Qura and Sakhi connect. This is a read-only
investigation: don't build or change anything yet.

CONTEXT
Sakhi is Qura's free reproductive-health app for Indian women (a separate repo and a separate Supabase project; don't look
for it). Women sign up in Sakhi with a mobile number verified by OTP (WhatsApp through Qura's number, or SMS through
AuthKey). Sakhi keeps their diary only on their phone. We plan a few touchpoints with Qura:
- A woman taps "Ask Qura to call you" in Sakhi, writes what she wants to talk about, picks a time of day, and ticks which
  parts of her diary report a Qura doctor may see. Sakhi's server sends that to Qura, which should create a lead and call
  her. A request carries: a reference (QC- and 6 characters), her mobile number, her first name, the best time (morning,
  afternoon, evening or any), her topic (up to 120 characters), her language, when she asked, the privacy-notice version she
  agreed to, and the report sections she ticked (each a title and up to 40 short lines).
- Maybe later: Qura tells Sakhi what happened (called, booked, couldn't reach) so her app can show it; a "Tell a person"
  message to a Qura coordinator; booking a slot from inside the app.
Rules that will apply to anything from Sakhi: it is used only for the call she asked for; nothing goes to Meta or any ad or
analytics platform (not even her phone number); only the care team sees it.

RULES FOR THIS TASK
- Read code, migrations, config files and docs only. Don't edit or create files, don't run migrations, don't call
  production APIs, and don't query the production database.
- Never print secrets, keys, tokens, environment-variable values, or any real customer data (names, phone numbers, emails,
  messages). Name fields, files and functions instead.
- Mark anything you inferred rather than saw in code as (inferred). If something isn't there, say "not found" rather than
  guessing.

WHAT TO FIND
1. Stack and layout: framework and version, hosting, database, auth, where API routes live, environment-variable naming,
   migration and test conventions, and how deploys happen.
2. Every way a lead comes in today: each page, form, route, webhook or import (website booking, contact forms, WhatsApp,
   ad lead forms, payments, manual entry). For each: the fields captured, the consent text shown, source or UTM tracking,
   and the file path.
3. The lead data model: tables or models and their columns (types, keys, indexes, constraints), status values, the source
   field and its values, how phone numbers are normalised, how duplicates are detected or merged, and how a lead links to
   customers, patients, consultations, bookings and payments.
4. The lead lifecycle: each status and what moves a lead between them (a person, a payment, a booking, a job). How the free
   first call is booked, held and recorded; how a doctor is assigned; where call outcomes and notes are kept.
5. The care team's side: the admin pages for leads, the roles and who can see what, how a coordinator works the queue
   (filters, assignment, reminders), and whether there is an audit log.
6. Everything that fires automatically when a lead is created or changes: WhatsApp templates, SMS, email, CRM or webhook
   syncs, Meta pixel or Conversions API, custom audiences, Google Ads conversions, analytics or session recording (for
   example Microsoft Clarity) on admin pages, and cron jobs. For each: the trigger, the data it sends and where, and the
   file path.
7. Health information today: does Qura store anything about a person's health (symptoms, conditions, reports, consult
   notes)? Where, who can read it, whether it's separated or encrypted, how consent is recorded, and how long it's kept or
   how it's deleted.
8. Existing machine-to-machine endpoints, such as payment webhooks or any partner API: how they authenticate (signatures,
   shared keys), how they avoid duplicates, what they log, and how they're tested. These are the patterns we would reuse.
9. Booking and availability: how slots, doctors and calendars work, and whether another system could read slots or create a
   booking (an existing API, or what it would take).
10. Contacting a lead: how Qura calls or messages a lead today (phone, WhatsApp, which numbers), and whether call attempts
    and outcomes are recorded.

THE REPORT
Reply with one report I can copy, under these headings, with file paths for everything you name:
1. Stack and layout
2. How leads come in
3. The lead data model
4. The lead lifecycle
5. The care team's tools
6. Automations on a lead (and what each sends where)
7. Health information and consent
8. Machine-to-machine patterns to reuse
9. Booking and availability
10. Contacting a lead
11. Where a Sakhi request would fit: which table, which status, which admin view, and every automation it would have to skip
12. Risks and gaps for the Sakhi touchpoints
13. Questions only Mohit can answer

Keep it factual and specific. Don't propose a full design yet: the endpoints will be planned from this report in the Sakhi
project.
