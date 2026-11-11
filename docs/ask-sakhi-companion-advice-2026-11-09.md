# Ask Sakhi as a true companion: how to make the chat personal, useful and safe

9 Nov 2026. Advice only, nothing here is built yet. Mohit, 9 Nov: "research and advise how this chat can be made to offer maximum
value and utility; it should be able to give personalised answers; that's our vision, to make Sakhi a true companion to the user."
This builds on today's prototype:
- built: Version 40 and 40.1 (MODULE_API 132; SERVER_SPEC 12);
- measured: a 30-question eval (all answered, US$0.0018 a question, median 5.8 s);
- tested: on Mohit's Flip5 (median about 10 s).

## 1. The recommendation

Make Ask Sakhi personal by sending **facts, not the diary**.

**What she sees.** Her phone turns her diary into a short summary written in her words, built by Sakhi's own doctor-reviewed engines:
- her stage and age band;
- her usual cycle and today's cycle day;
- her plan and week;
- the signs she logged;
- what Sakhi has already found.

**When it goes.** She sees the summary and turns it on with one tap. It goes with her question only when she asks, and only to
write that answer. Sakhi's server keeps none of it.

**What never leaves.** Her notes, exact dates, sex log, name and number stay on her phone. It is never used in discreet mode, on a
shared phone, or for a girl under 18.

**Pair it with three things that make answers useful rather than just personal:**
- **"Ask Sakhi about this"** from the cards and guides she is already on;
- **answers that end in one action** she confirms with a tap: log it, remind me, add to my doctor questions, start the routine;
- **faster, shorter answers**: first words in about 2 seconds, a one-line answer first, and three follow-up questions to tap.

**What it needs from you.** This changes your rule "the diary never leaves the phone" to "her diary never leaves the phone; a summary
she can see leaves only when she turns it on, only to answer her, and is never kept by Sakhi". That is your decision first, then
counsel's (the privacy notice, the Play data-safety form) and the doctors' (personal answers).

## 2. What she would get

**Today** (the prototype). She asks "My period is late, should I worry?" The answer is the same for every woman: usual gaps, take a
test, see a doctor if... It is correct, but it doesn't know that she is on the pill, or trying for a baby, or that her gaps have
always been 38 days.

**With her summary on.** She is 27, trying for a baby, with usual gaps of 32 to 38 days, and this period is 5 days past her usual:
- **The answer:** "You're 5 days past your usual. Since you're trying for a baby, a home test now is the best next step. Test with your
  first urine of the morning."
- **Buttons:** [Log the test result] [Remind me to test tomorrow at 7 am].
- **The source line:** "Sakhi used: your cycle summary, your goal, the guide 'Pregnancy test: when and how'."

**Ask Sakhi about this.** Her Diary card says "2 of your last 2 gaps were longer than 35 days. See a doctor this month." She taps
"Ask Sakhi about this", and the chat opens already holding that finding. She can ask "Is it PCOS?":
- It won't diagnose.
- It explains what the doctor checks, and offers [Add "Is it PCOS?" to my doctor questions] and [Ask a Qura doctor] (a Qura area).

**Voice, start to end.** In Talk mode she says "Aaj pet mein bahut dard hai" ("my stomach hurts a lot today"). Sakhi answers aloud
with what helps, then asks "Log cramps for today?". She says "haan" (yes), and it is logged.

**An example of the summary sheet she would see once, before it is used:**

> **To answer you, Sakhi can use this (from your phone):**
> - You're 27 and trying for a baby
> - Your periods usually come every 32 to 38 days; this one started 12 days ago
> - Your plan: Getting ready for a baby, week 3
> - Signs you logged in the last 4 weeks: cramps on 3 days, headache on 1
>
> Not your notes, your dates, your name or your number. Sakhi's server keeps none of it.
> [Use my summary]  [Not now]   (change any time in Me > Privacy)

## 3. What the research says (short)

- **The demand is personal.** SnehAI, the Population Foundation of India's Hinglish sexual-health chatbot, exchanged 8.2 million
  messages in 5 months, and nearly half of all incoming messages were *personal* questions. Women will ask real questions about
  themselves in private, in Hinglish.
- **What works in maternal health is stage-based personalisation plus triage plus a human backstop.** Jacaranda Health's PROMPTS
  (Kenya) uses messages by pregnancy stage and a two-way AI helpdesk, with staff taking over when a mother isn't satisfied. A
  pre-post study found mothers about 1.9 times as likely to report postnatal checks for themselves and their babies. Jacaranda
  reports routing 90% of high-risk cases to hospital, and that its AI still errs often enough that humans stay in the loop. For
  Sakhi the lesson is to personalise by stage first, keep the danger route sharp, and hand off to a doctor.
- **Personalisation alone isn't magic.** A 2025 pilot trial of a personalised retrieval chatbot (kidney disease, Seoul; a preprint)
  found no outcome difference against a general one. Pair personal answers with actions and Sakhi's plans, and measure.
- **Large language models in women's health:** expert panels rate the accuracy of answers to common pregnancy questions as good, but
  completeness and safety lower, especially on the safety of mother and baby. Endometriosis answers were weaker on treatment. This
  is why the guides come first, the safety rules are hard, and pregnancy stays conservative.
- **Competitors.** Store listings show cycle apps whose assistants answer from the user's own cycle data (Bloom Cycles, Lena,
  PERIOD.). They compete on "encrypted" and "never used for training"; independent reviews (Mozilla's of Flo) find the practice
  doesn't always match the claims.
  - Personal answers are becoming expected.
  - Sakhi's edge can be the one no one else offers: she sees exactly what is sent, and nothing is kept.
- **India's rules shape the design** (section 6):
  - the Telemedicine Practice Guidelines 2020 don't let AI platforms counsel patients or prescribe medicines; AI may only assist a
    registered doctor;
  - CDSCO's draft guidance on medical device software (Oct 2025) classifies software by its medical purpose;
  - the DPDP Rules were notified on 13 Nov 2025, with most duties from 2027.

## 4. The design: facts, not the diary

**Built on the phone, by core.** Modules never touch the network. Each field comes from an engine Sakhi already has, and only from
an allowlist, as `SEND` is for the accounts server:

| Field | Example | From |
|---|---|---|
| stage, age band | trying for a baby, 25 to 29 | `stageNow()`, `ageYears()` (never the birth date) |
| cycle | day 12; usual 32 to 38 days; last 3 gaps 34, 38, 32; 0 days late | the cycle engine, as Today and Cycles show it |
| on hormones, periods stopped | pill: yes | `situation` |
| pregnancy, after a birth | 30 weeks; 21 days since the birth, breastfeeding | `pregInfo()`, after-birth days |
| plan | Getting ready, week 3, 4 of 7 days done | the plan engine |
| signs, last 4 weeks | cramps 3 days, headache 1 day | the diary, counted (never the notes) |
| Sakhi's findings | "gaps longer than 35 days, 2 of 2" | What your diary shows / Cycles' reasons (doctor-reviewed keys) |
| labs she saved | Hb 10.9, 2 months ago | her report's results |
| how she eats, region | vegetarian, North | My food's answers |
| where she gets care | private doctor | `situation.care` (so answers say "your doctor", not "your ANM") |
| things Sakhi remembers | "works night shifts" | a list she approved and can edit (upgrade 7) |

**What never goes:**
- notes text, the sex log, partner details, exact dates (only days and ranges), her name, number, PIN code or account;
- a pregnancy loss or abortion (unless she brings it up in the chat herself);
- mood entries;
- anything at all in discreet mode, on a shared phone, for a sample woman, or for a girl under 18.

**Her yes:**
- The first time a question is about her ("my", "mera", "meri", or she is asked for a fact), the chat shows the summary sheet.
- The sheet shows the real text that would go.
- After that, a chip under the box shows it's on, and she can turn it off.
- Every personal answer ends with "Sakhi used: your summary".
- Me > Privacy holds the switch and shows the sheet.

**The server:**
- It accepts one more field, `context`, with a strict schema: enums, small numbers and short app-made strings, nothing free-form
  from her diary.
- The summary goes into her turn as a labelled block, "Her Sakhi summary (from her phone, with her permission)". It never goes in the
  system prompt, which stays the same so it can be cached.
- Nothing is logged or stored. `chat_daily` only counts how many answers used a summary.

**The AI's extra rules:**
- Tailor timing and relevance to her facts.
- Repeat Sakhi's own findings rather than making new judgments about her data.
- Never draw a diagnosis from her numbers.
- If a fact it needs is missing, ask her one short question ("Could you be pregnant?") instead of guessing.
- If her words and her summary disagree, trust her words.

**Later, even less data: tools on the phone.**
- The model asks for one fact at a time ("her last 3 gaps"); the phone answers after her tap, and only that fact goes.
- This needs a back-and-forth protocol: the phone keeps the model's turn and sends it back.
- A good second step once the summary works.

**Not yet: a model on the phone.**
- Today's small phone models are weak in Hindi and need gigabytes.
- On-device AI on Android (Gemini Nano) runs only on some recent phones.
- Revisit in 2027.

## 5. Ten upgrades, ranked by value for her

| # | Upgrade | Why it matters | Data that leaves | Effort |
|---|---|---|---|---|
| 1 | **Her summary, with her yes** (section 4) | "Is this normal *for me*?" is the question women ask most | the summary, when on | 1 to 2 weeks with reviews |
| 2 | **Ask Sakhi about this** on Today's cards, What your diary shows, Cycles, a guide, a plan step's "Why?", a logged sign | she asks where the worry is; no hunting | only what she tapped (an app line), plus her summary if on | 2 to 3 days |
| 3 | **Answers end in an action** she confirms: log a sign or period, set a reminder, add to my doctor questions (the report's "Questions" section already exists), start a routine or plan, open Care near me | turns talk into something done; the companion leap | nothing more (the model suggests; the phone does it after her tap) | 1 week |
| 4 | **Faster and shorter**: stream the answer (first words in about 2 s instead of 10), a one-line answer first, up to 3 short points, about 90 words, 3 follow-up questions to tap | low literacy and voice; today's answers average 135 words and take 10 s on the phone | none | 3 to 4 days |
| 5 | **Your doctor's words**: "your doctor" unless she uses the government route or asks about free care (the Version 39.28 rule; today's answers repeat "ANM / PHC") | consistency with the rest of Sakhi | her care route, in the summary; or one rule in the AI's instructions, with no data | half a day |
| 6 | **The doctor, with the chat**: "Ask a Qura doctor" from a chat in a Qura area (PCOS, conceiving, menopause, after a birth, cycles) carries the topic and, if she ticks it, a 3-line summary of the chat | a better-informed call | what she ticks, to Qura (the Version 33 hand-off) | 3 to 4 days |
| 7 | **Sakhi remembers**: the AI may suggest "Remember that you're vegetarian?"; she taps Yes; a list in Me she can edit or clear; sent with her summary | continuity: she doesn't repeat herself | in the summary, when on | 3 days |
| 8 | **Report a wrong answer**: a button that sends that one question and answer to Sakhi's doctors, with her yes | the only way to see real failures, since nothing is kept | that one Q&A, when she sends it | 2 days |
| 9 | **A conversational check-in**: the evening check-in as a 3-question chat for women who prefer it (the form stays) | warmth; voice users | none beyond today's | 1 week (later) |
| 10 | **More languages**: answers in Tamil, Bengali, Marathi and others only once doctors have checked a sample in that language; until then, offer English or Hindi | trust | none | per language |

Before any of these, the minimalist baseline still holds:
- no new tours or celebrations;
- one "Sakhi says" card;
- an "Ask Sakhi about this" row only where a card already is;
- no new reminders unless she sets one through the chat.

## 6. Safety, law and trust

- **Information, not consultation.** The Telemedicine Practice Guidelines 2020 don't let AI platforms counsel patients or prescribe
  medicines. Ask Sakhi stays health information and navigation:
  - it never prescribes, and never diagnoses;
  - personal answers repeat Sakhi's reviewed findings and send her to a doctor;
  - write this intended use down. Counsel should confirm it, and also confirm that CDSCO's medical-device-software rules don't apply
    while the purpose stays educational. A chat that turns her own data into treatment advice is where a medical-device question
    would start.
- **DPDP:**
  - Consent must be specific, itemised and easy to withdraw. The summary sheet is that consent; record its version, as the app
    already does for the notice.
  - Name Anthropic as a processor, and say where (USA). Cross-border transfer is allowed unless the government restricts a
    country; watch for that order.
  - Most duties under the Rules apply from 2027; build to them now.
- **Anthropic's retention:**
  - By default, API inputs and outputs are deleted within 30 days and are not used for training.
  - Zero data retention is by agreement and may not cover every model or feature.
  - Ask Anthropic about ZDR for this use, and say "kept by Anthropic for up to 30 days for safety" in the notice until it's settled.
- **Safety layer, kept and widened:**
  - the phone's danger card (Version 39.89 widens it);
  - the AI's danger flag, the hard rules, the "safe days" hold-back, and "ask a doctor or chemist" for medicines;
  - pregnancy stays conservative;
  - add a simple check that holds back any dose ("mg", "tablet × times") the guides don't give.
- **WHO's guidance on these models** (Jan 2024) asks for transparency, testing before release, audits after release, and human
  oversight:
  - "Prototype" and "Sakhi used:" on every answer;
  - the eval before each release;
  - "Report a wrong answer" to the doctors;
  - "Ask a doctor" on every answer.
- **The self-harm line and personal answers** go to the doctors (and a psychologist) before women outside the team use them.

## 7. Speed and cost

- **Speed:**
  - Stream the answer; the Edge Function can send it as it is written.
  - Let the phone send the guide ids its own search picks, so most answers need 1 model call, not 2 or 3.
  - Keep effort low.
  - Target: first words under 3 s, the whole answer under 6 s, on a phone.
- **Cost:**
  - A summary adds about 400 input tokens (US$0.00004), so an answer stays about US$0.002.
  - 10,000 women asking 5 questions a month: about US$100 a month.
  - The caps (20 a woman a day, 300 in all) are secrets you can change without a redeploy.

## 8. How we'll know it works (without keeping chats)

- **Before each release:**
  - the 30-question eval plus a persona eval: the five sample women (Priya, Asha, Meera, Sunita, Kamla), 10 personal questions each,
    with and without the summary;
  - the doctors grade safe, unsafe or not helpful;
  - the bar is at least 98% safe and no unsafe answer in pregnancy.
- **Live, as daily totals only** (`chat_daily`, no text):
  - questions;
  - answers from guides, general or none;
  - danger flags;
  - answers that used a summary;
  - actions offered and done, by kind;
  - thumbs up and down;
  - doctor requests from the chat;
  - "Report a wrong answer" sent.
- **The north star:** she leaves with a trustworthy answer about her own body, in her language, and one next step done. Track:
  - actions done ÷ answers (aim for 30% or more);
  - thumbs up (aim for 80% or more).

## 9. Roadmap

1. **Faster and clearer** (about 1 week; no new data leaves):
   - streaming;
   - the short format and follow-up questions;
   - one model call by default;
   - "your doctor" wording;
   - Ask Sakhi about this (upgrade 2, without her summary);
   - thumbs, and Report a wrong answer.
2. **Knows her, with her yes** (about 2 weeks, with the doctors' and counsel's reviews):
   - the summary and its sheet;
   - Sakhi remembers;
   - the persona eval;
   - the privacy notice and Play form updates.
3. **Does things for her** (about 2 weeks):
   - actions with a confirm tap;
   - the doctor with the chat;
   - phone tools for single facts.
4. **Companion rhythm** (later):
   - the conversational check-in and plan coaching in the chat;
   - more languages after review;
   - a model on the phone when one is good enough.

## 10. Decisions for Mohit

1. **Your rule:** change it to "a summary she sees and turns on, never kept by Sakhi"? *Recommended: yes.* Without it, answers can't
   be personal beyond what she types.
2. **Her yes:** ask at her first personal question (*recommended*), on by default, or off until she finds it in Me?
3. **Actions in the chat with a confirm tap** (log, remind, add a doctor question, start a routine)? *Recommended: yes.*
4. **Sakhi remembers** (on her phone, editable)? *Recommended: yes, in phase 2.*
5. **The doctor with the chat** (her ticked 3-line summary to Qura)? *Recommended: yes, for Qura areas.*
6. **Anthropic retention:** ask Anthropic about zero data retention for this use? *Recommended: yes, before women outside the team.*
7. **Languages beyond English and Hindi:** only after doctors check each? *Recommended: yes.*
8. **Start with phase 1 now** (no new data leaves, about a week)? *Recommended: yes.*

## Sources

- SnehAI, Population Foundation of India's Hinglish chatbot: Wang et al., JMIR 2022,
  https://pmc.ncbi.nlm.nih.gov/articles/PMC8764609
- Jacaranda Health PROMPTS:
  - pre-post study, BMC Pregnancy and Childbirth 2024:
    https://BMCpregnancychildbirth.biomedcentral.com/counter/pdf/10.1186/s12884-024-06373-7.pdf
  - the helpdesk and its error rate: https://idrc-crdi.ca/en/stories/technology-support-maternity
  - organisation-reported results: https://www.ai4d.ai/innovations/prompts
- Personalised retrieval chatbot pilot trial (preprint): https://preprints.jmir.org/preprint/96501
- Chatbots and pregnancy questions:
  https://cm.healio.com/news/womens-health-ob-gyn/20250214/chatgpt-should-be-used-with-caution-for-common-pregnancy-questions
- Chatbots and endometriosis:
  https://www.healio.com/news/womens-health-ob-gyn/20250612/ai-chatbots-provide-insufficient-responses-for-some-questions-about-endometriosis
- Cycle apps whose AI answers from the user's data:
  - https://apps.apple.com/us/app/bloom-cycles/id6751174521
  - https://apps.apple.com/nl/app/period-cycle-period-tracker/id6757947793?l=en-GB
- Mozilla's privacy review of Flo: https://www.mozillafoundation.org/en/nothing-personal/flo-app-privacy-review/
- India's Telemedicine Practice Guidelines 2020 on AI (IBA summary; check the official text):
  https://www.ibanet.org/article/15234243-b534-45f6-b303-4919cfe9a2dc
- CDSCO's draft guidance on medical device software (Oct 2025): https://india-briefing.com/news/cdsco-draft-guidance-medical-software-40691.html
- DPDP Rules 2025:
  - https://www.india-briefing.com/news/dpdp-rules-2025-india-data-protection-law-compliance-40769.html/
  - https://www.azbpartners.com/bank/update-indias-digital-personal-data-protection-framework-comes-into-effect/
- WHO guidance on large multi-modal models (Jan 2024):
  https://www.who.int/news/item/18-01-2024-who-releases-ai-ethics-and-governance-guidance-for-large-multi-modal-models
- Anthropic API data retention:
  - https://platform.claude.com/docs/en/build-with-claude/api-and-data-retention
  - https://privacy.claude.com/en/articles/8956058-i-have-a-zero-data-retention-agreement-with-anthropic-what-products-does-it-apply-to
- Sakhi's own numbers:
  - `~/Downloads/sakhi-unicef-handoff/ask-sakhi-eval.md` (30 questions);
  - `~/Downloads/sakhi-unicef-handoff/ask-sakhi-report.md` (the phone test).
