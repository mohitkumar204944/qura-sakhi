# Build prompt for a Claude session in the Qura project (23 Oct 2026, revised)

Paste everything below the line into a Claude session opened in `~/Desktop/qura_nutrition-version1`. It is self-contained.

It follows Mohit's decisions on `docs/qura-sakhi-integration-plan-2026-10-23.md` (23 Oct): "confirmations will go over
whatsapp only for now i am not concerned about if meta gets any insight or not but i want to make it work with least
complications and changes only must do changes should be done at qura rest proceed with recommendations". So a Sakhi
request becomes an ordinary `campaign_leads` row worked in the existing queue, with only the changes it can't work without.
Sakhi's server already sends exactly this contract; nothing on Sakhi's side changes.

---

Build Qura's side of the Sakhi call request, with the fewest changes possible. Work from origin/main (the local checkout is
behind). Only the changes listed here; nothing else.

WHAT IT IS
Sakhi is Qura's free reproductive-health app (a separate repo and Supabase project; don't look for it). A woman taps "Ask
Qura to call you", writes what she wants to talk about, picks a time of day, and ticks which parts of her diary report
Qura's care team may see. Sakhi's server sends it here. It should arrive as a normal lead in /admin/leads, a coordinator
calls her, and if she wants the free consult, the coordinator books it with the existing Book & Send. Confirmations go over
WhatsApp as usual.

FIRST, READ AND TELL ME (no code yet)
1. Everything that reads campaign_leads.raw_field_data or notes and sends it outside Qura's database: the WhatsApp bot and
   the Anthropic AI context, the metrics Google Sheet, Meta or OpenAI events, emails, calendars. The file and what it sends.
2. The remarketing sweep's lead filter, and the Meta audience export script's query.
3. Where /admin/leads keeps the hard-coded source filter list, and how the lead detail page shows source-specific blocks.
4. Anything that would stop an insert with source 'sakhi', a client_lead_id derived from a hash, or an empty email.
Then propose the smallest plan and wait for my OK.

THE ENDPOINT
POST https://quranutrition.com/api/partners/sakhi/v1/call-requests
Headers: Content-Type: application/json, and X-Sakhi-Key: <shared secret>

Body, exactly these fields:
{
  "ref": "QC-7KQ2MX",
  "phone": "+919876543210",
  "name": "Asha",
  "best_time": "evening",
  "topic": "My periods come every 40 days",
  "lang": "hi",
  "asked_at": "2026-10-23T04:30:00Z",
  "consent": { "notice": "2026-10-23.2", "shared": ["periods", "questions"] },
  "shared_data": {
    "report_lang": "en",
    "sections": [
      { "key": "periods", "title": "My last periods", "lines": ["1 Sep: bled 5 days, next period after 40 days"] },
      { "key": "questions", "title": "Questions I want to ask", "lines": ["Is there anything here I should keep an eye on?"] }
    ]
  }
}

Field rules (anything else is 400 { "error": "<field>_bad" }):
- ref: "QC-" + 6 characters from A-Z and 2-9.
- phone: "+91" + 10 digits starting 6-9 (OTP-verified by Sakhi).
- name: her first name, or null.
- best_time: "morning", "afternoon", "evening" or "any".
- topic: 1 to 120 characters, any language.
- lang: two lower-case letters.
- asked_at: UTC, like 2026-10-23T04:30:00Z.
- consent.notice: up to 20 characters. consent.shared: section keys she ticked, no repeats; may be empty.
- shared_data: report_lang (two letters) and sections, one per key in consent.shared, each with key (about, periods,
  symptoms, checkins, tools, questions or notes), title (up to 80 characters) and lines (1 to 40, each up to 300 characters).
- No other fields. Refuse a body over 64 KB with 413.

Answers:
- 201 { "lead_id": "<campaign_leads.id>" } for a new request.
- The same ref again: 200 with the same lead_id, and nothing new created. Two at once with the same ref must make one row.
- Missing or wrong X-Sakhi-Key: 401, compared in constant time (hash both with SHA-256, then crypto.timingSafeEqual).
- The key isn't configured: 503.
- Anything failing on Qura's side: 5xx. Answer within 8 seconds.
Sakhi's server treats 2xx and 409 as delivered, retries 5xx, 408, 429, timeouts and network errors for 24 hours, and gives
up on any other 4xx. No CORS. The URL must not redirect: tell me the exact final URL.

HOW TO STORE IT (no migration should be needed)
Insert one campaign_leads row:
- source 'sakhi', and raw_field_data.source 'sakhi' too (leadOriginOf reads that first);
- status 'new';
- full_name from name (if null and the column needs a value, use "Sakhi user");
- phone_digits via normalizeMobile; preferred_language = lang;
- email_opt_in = false, so an account made later by Book & Send gets marketing off;
- client_lead_id = a UUID derived from SHA-256 of the ref, the same way wizardDropoffLeads.js does, with the existing
  unique-violation recovery returning the first row;
- raw_field_data.sakhi = { ref, best_time, topic, asked_at, consent, shared_data } exactly as received;
- notes = "Sakhi request <ref> · best time: <best_time> · <topic>", so the queue shows it with no new UI.
Always a new row, even if the phone already has a lead or an account: don't merge, and don't change any other row.
Don't call sendLeadOpener, any Meta or OpenAI conversion function, a welcome email, or the bot. Nothing fires at creation.

THE ONLY OTHER CHANGES
1. Add 'sakhi' to the /admin/leads source filter list, and to the source column's comment.
2. On the lead detail page, for source 'sakhi', show a small "From Sakhi" block: reference, best time, language, topic, and
   each shared section's title and lines as escaped plain text, never HTML, with the note "Shared by her for this call only."
   Reuse existing components.
3. The remarketing sweep and the Meta audience export script skip source 'sakhi'. She agreed to be contacted only for this
   call.
4. Anything from step 1 of FIRST, READ that would send raw_field_data.sakhi outside Qura (the AI's context, the Google Sheet,
   Meta, OpenAI, email) leaves it out. Her name and phone in the internal sheet and calendars can stay as for any lead.
Everything else stays as Qura does it today, including WhatsApp confirmations and Qura's usual events after she books.

TESTS (in this repo's style)
- 201 with a lead_id; the row has source 'sakhi', status 'new', email_opt_in false and the sakhi block in raw_field_data;
- repeat: the same lead_id, one row; two at once: one row;
- wrong or missing key: 401; key not configured: 503;
- missing field, wrong value, extra field, section not matching consent.shared: 400; over 64 KB: 413;
- shared [] with sections []: 201;
- no opener, conversion, email or bot call at creation (mocks);
- the remarketing sweep and the audience export skip a sakhi lead;
- a line containing <script> shows as text on the detail page;
- the request body never reaches the logs.

THE SHARED SECRET
- Read it from an environment variable named SAKHI_PARTNER_KEY (or this repo's naming).
- Never print, log or commit it, and never ask me to paste it here. I'll generate it with openssl rand -hex 24 and set it in
  Vercel myself.
- The same value goes on Sakhi's server as SAKHI_QURA_KEY, with SAKHI_QURA_HANDOFF_URL set to this endpoint's final URL.
  That's done from the Sakhi side.

ALSO CHECK AND TELL ME
- The live intro_consult_mode. Sakhi tells her the first call is free; if it's paid_99, Book & Send would send her a pay
  link instead.
- Add this contract to docs/partners/sakhi-v1.md, so both repos keep a copy.

ASK ME BEFORE
Deploying, committing or pushing, running anything on the production database, or changing environment variables.

WHEN YOU'RE DONE, GIVE ME
The exact final URL, the environment variable's name, the test results, a curl command to try a preview with a test key,
and the list of what you changed.
