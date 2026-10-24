# Brief for a Qura session: receive Sakhi's call requests

> **Superseded on 23 Oct** by Mohit's decisions (`docs/qura-sakhi-integration-plan-2026-10-23.md`, section 0) and the
> revised build prompt (`docs/qura-session-prompt-2026-10-23.md`). The request is now stored as an ordinary
> `campaign_leads` row with source `sakhi`, and confirmations go over WhatsApp. The stricter rules below (no WhatsApp, no
> Meta for her as a person, a separate home for her data) are deferred. The contract itself is unchanged.

23 Oct 2026. For a Claude session working in Qura's own repo (`~/Desktop/qura_nutrition-version1`). Sakhi sessions don't touch
that repo, so Qura's half of the doctor-call hand-off is built there from this brief. Sakhi's half is built and tested
(Version 33), and is not deployed yet. The contract is `server/SERVER_SPEC.md` section 10.1 in the Sakhi repo; copy that
section into Qura's repo as well, since both repos keep it.

## What happens

A woman using Sakhi taps "Ask Qura to call you". She writes what she wants to talk about, picks a time of day, and ticks
which parts of her Sakhi diary report a Qura doctor may see first. Nothing is ticked to start, and she sees exactly what
goes. Sakhi's server sends that one request to Qura and deletes its copy once Qura has it. Qura then calls her to arrange
and hold the call she asked for.

## The endpoint to build

```
POST https://quranutrition.com/api/partners/sakhi/v1/call-requests
Content-Type: application/json
X-Sakhi-Key: <shared secret>
```

The body, exactly these fields:

```json
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
```

| Field | What it is |
|---|---|
| `ref` | Sakhi's reference, `QC-` and 6 characters from `A-Z` and `2-9` (no 0, O, 1 or I). Unique per request. She sees it in the app, so staff can quote it. |
| `phone` | Her mobile number, `+91` and 10 digits. Verified by an OTP when she signed up for Sakhi. |
| `name` | Her first name, or `null`. |
| `best_time` | `morning`, `afternoon`, `evening` or `any`. |
| `topic` | What she wants to talk about, 1 to 120 characters, in her own words and any language. |
| `lang` | Her app language (two letters, such as `hi`). Speak to her in it where possible. |
| `asked_at` | When she asked, UTC. |
| `consent.notice` | The version of Sakhi's privacy notice in force when she asked. |
| `consent.shared` | The report sections she ticked, by key. It may be empty: she asked for a call and shared nothing. |
| `shared_data` | Those sections, exactly as her screen showed them, in `report_lang`. Keys: `about`, `periods`, `symptoms`, `checkins`, `tools`, `questions`, `notes`. Each has a `title` (up to 80 characters) and 1 to 40 `lines` (up to 300 characters each). Show them as plain text: escape them, never render them as HTML. |

The whole body is under 32 KB.

## What to answer

| Case | Answer | What Sakhi does |
|---|---|---|
| New request | `201 { "lead_id": "<id>" }` | Marks it sent and deletes its copy |
| The same `ref` again | `200` or `409` with the same `lead_id`; create nothing | The same (sent) |
| Wrong or missing `X-Sakhi-Key` | `401` | Gives up (failed); the app offers the booking link |
| A body that fails validation | `400` | Gives up (failed) |
| Busy or down | `5xx`, `429` or `408` | Tries again for 24 hours |

- Answer within 8 seconds. Sakhi times out after that and tries again, which is why the same `ref` must never make two
  leads. A unique index on `ref` is the simplest guarantee.
- Compare `X-Sakhi-Key` in constant time (for example `crypto.timingSafeEqual` on equal-length buffers).
- No CORS: this is server to server, never called from a browser.

## Rules for Qura's side (Mohit's rules for Sakhi, and the privacy notice she agreed to)

1. **Use it only to arrange and prepare the call she asked for.** Her consent screen says so. No marketing to her from this
   request. Any updates need her own, separate yes.
2. **Never send any of it to Meta or another ad or analytics platform.** Not the topic, not the shared data, and not her
   phone number either: no WhatsApp message carrying her health details, no Meta Conversions API or pixel event, no custom
   audience, no Google Ads offline conversion, no session-recording tool on the page that shows it. A notice to the care
   team may carry the reference only. If Qura's lead pipeline syncs leads to ad platforms automatically, leads with source
   `sakhi` must be left out.
3. **Only the care team sees it:** the doctors and the coordinator who arranges the call, behind login.
4. **Don't log the body.** Log the `ref`, the result and the time.
5. **Retention, for Mohit and counsel to decide:** how long the shared sections are kept after the call (a suggestion: delete
   `shared_data` 30 days after the call, keep the lead, `ref`, the consent fields and `asked_at`).
6. **A Sakhi account is not a lead.** Qura learns about a Sakhi woman only from a request like this.

## The shared secret

- Generate it once (48 hex characters or more, for example `openssl rand -hex 24`), set it as an environment variable in
  Qura's production project on Vercel, and on Sakhi's Supabase project as `SAKHI_QURA_KEY`, together with
  `SAKHI_QURA_HANDOFF_URL` (`server/DEPLOY.md` in the Sakhi repo, section 3, step 4).
- Never print it, commit it or paste it into a chat.
- Until both are set, Sakhi keeps the hand-off off, and women book on the website as before.

## Testing

- With a test key on a preview deployment, post the example body above with `curl`. Expect `201`, then `200` or `409` with
  the same `lead_id` on a second post. Expect `401` with a wrong key and `400` with a field missing.
- Sakhi's side is tested against these answers (`server/test/api.test.mjs` in the Sakhi repo, the hand-off sections).
- The first live test should come from a staff phone on a Sakhi test build, never from a woman's account.
