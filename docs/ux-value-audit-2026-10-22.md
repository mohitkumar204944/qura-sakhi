# Sakhi: how women get the most value, a UX and UI audit (22 Oct 2026)

Mohit asked: "now we have so many things built can you audit and advise how users can maximize value whats best UX and UI
for users to maximize value and utility of this app".

This audit covers Version 29 (APK 0.29-demo). It's about value: whether a woman finds and keeps using what helps her. The
earlier audits covered trust and plumbing (`app-audit-2026-10-22.md`) and the Me page (`ux-audit-me-2026-10-22.md`).

**How it was measured**
- Seven women in Chromium at phone size (390 × 844): a new woman with an empty diary, a "just reading" visitor, and the
  sample women Priya (irregular cycles), Asha (regular, on the pill), Meera (24 weeks pregnant), Sunita (3 weeks after a
  birth) and Kamla (48, periods changing).
- For each woman:
  - Home, Care, Help and Me, block by block, with positions measured in phone screens;
  - the number of taps from Home to 20 high-value tools, found by a breadth-first walk over every link (tab bar and top bar
    included);
  - 18 searches in the Care hub, in English, Hinglish and Hindi.
- What drives value comes from `feature-research-2026-10-22.md`:
  - plans with reminders, and support for one medicine;
  - two-way contact that she starts;
  - records that shape the doctor's visit;
  - access to free care.

## 1. The short answer

Sakhi now has the pieces that change outcomes:
- **plans and reminders:** the pregnancy plan, iron, the pill, check-ups;
- **free care:** free doctors, care near her PIN, scheme claims, her ASHA;
- **records for the visit:** the report for the doctor.

**But they are presented as a library, not as her plan.** There are 116 tiles across 13 sections and 148 screens. Most
high-value tools are 2–3 taps from Home. Search misses a third of the obvious requests. Home is 2–3 screens of mixed
cards, where a daily task can sit below a quiz.

**The best UX puts four things on Home, around her stage, and lets the library sit behind them:**
1. **Today:** what she needs to do today.
2. **My plan:** what to set up, then what's next.
3. **Free care:** one place for every free doctor, scheme and helper.
4. **For my visit:** the report and her questions.

Most of this is rearranging what exists. It needs little new health wording.

## 2. What was measured

| | |
|---|---|
| Size | 116 Care tiles in 13 sections, 21 of them in one "tools" section; 148 screens; 69 articles. iron, asha and access-doctor each have more than one tile |
| Home length | 2.1 to 3.0 phone screens for women with data; 2.3 for a new woman; 1.0 for "just reading" |
| Daily actions on Home | Meera's iron card is at 0.9 screens and her "Due now" row at 0.8 (good). Asha's "Today's pill" is at **2.3 screens**, below Today for you, the flower garden, Your questions and Coming up |
| Taps from Home | Report for my doctor 2; Free doctor and care 2; My ASHA 2; Care near me 3; Schemes and claims 3; Do it online 3; Feel better now 3; 21-day journeys 3; Explain to family 3. The pregnancy plan and iron are 1 tap when pregnant and 3 otherwise. **The reminders centre is reached only through Home's "Coming up → See all" or the Care tools grid; it isn't in Me** |
| Care "For you" | Good: stage-aware (pregnancy, after a birth, midlife). But it shows guides, not her tools: no pregnancy plan for Meera, no iron for Sunita, and no free care or claims for anyone |
| Search | 6 of 18 searches don't put the obvious tool first. "report" → not the doctor report. "pregnancy plan" → pregnancy-test articles. "iron" → logs and food, with Iron tablets not in the top four. "doctor" and "डॉक्टर" → neither doctor page. "free doctor" → "Breast self-check" first. Duplicate tiles show twice |
| First week | The "first three petals" are "note how you feel, read one answer, today's myth card". They teach engagement, not the setup that brings value (her period date, a reminder, her ASHA, free care) |
| First run | Language, welcome, birth year (two steps), stage, last period, shared phone, number, code, then details (name and PIN code): about 10 screens before Home, then a 5-screen tour |
| Tools section | 21 tiles in this order: flower garden, quiz, ASHA, Feel better now, journeys, family, reminders, free doctor, medicines, care near me, schemes, online, iron, partner, feed, videos, symptoms, reports, summary, **Doctor's view (prototype)**, language |

## 3. What already works (keep it)

- **Home's top half:** the week strip, the stage hero (cycle ring, pregnancy weeks, days after birth) and one-tap logging.
  Clear, warm and bilingual.
- **Stage awareness:** "For you" in Care, the Home cards, the pregnancy "Due now" row and the iron card change with her
  life. Meera's Home is the model: her plan and her tablet are in the first screen.
- **One-tap daily actions:** the iron "I took it" and the pill card. Reminders reach the lock screen in discreet wording.
- **Trust and safety:** danger signs on Help, discreet mode, the lock, nothing sent, sources and "checked on" dates.
- **Visual design:** consistent cards, icons and hues; readable type; dark mode; text up to 200%.

## 4. The gaps that cost value

1. **No "today" view.** Daily tasks are split across a homeTop strip (iron, due now), a module card (the pill) and
   "Coming up". Their order depends on which module drew them, not on what's due. A woman on the pill scrolls past a quiz
   to take it.
2. **No setup path.** After signup and the tour she lands on Home with one prompt (log your period). Nothing tells her to
   turn on reminders, start her plan, save her ASHA's number or look at free care. Yet those set-ups are what bring her
   back.
3. **Free care is scattered.** Free doctor and care, Care near me, schemes and claims, Do it online and My ASHA are five
   tiles mixed in with games and settings. Help links to two of them.
4. **Reminders, the engine of follow-through, are hard to find.** There's no entry in Me, and none on Home until a
   reminder exists.
5. **Search ranks articles over tools** and doesn't know common words: doctor, report, plan, reminder, iron, and their
   Hindi.
6. **The report for the doctor lives in Me → My data.** It belongs on Help, on the Doctor screen (already linked) and on the
   day of a visit.
7. **Long Home.** About 10–13 blocks. Today for you, the flower garden and Your questions take the middle of the screen,
   and daily tasks sit below them.
8. **Prototype items reach real women:** the Demo section in Me, the "Doctor's view" tile and the sample footnote.
   *Correction (22 Oct, while building Version 30):* most of this was already closed. "Doctor's view" shows only with prototype
   labels on, and the Demo section and the footnote only after a sample is loaded. What was still open: five taps on the
   version, a long press on the Hello screen or a `#demo` link could load a sample in a release APK. Version 30 closes those.

## 5. Recommendations (Version 30 candidates)

Effort: S is a day or two, M up to a week. All of these keep Sakhi's rules: the diary stays on the phone, nothing goes to
Meta, no new spend, reproductive health only, and doctor review for any new health wording.

| # | Change | What she gets | Effort |
|---|---|---|---|
| **1** | **A "Today" block under the hero.** Up to four rows, each with one-tap Done: today's tablet (iron or pill), the plan's "Due now", a check-in or check-up due today, today's journey step. It's built from the reminders and modules she already has. Empty days show nothing | Daily follow-through in the first screen, for every stage | M |
| **2** | **"My plan" setup in place of "first three petals".** Four or five steps for her stage, with petals as the reward. For example, pregnant: add your dates; plan reminders on; start iron; save your ASHA; track PMMVY. Cycle: log your period; notifications on (with the period heads-up); check-ups (30+); save your ASHA; look at free care. It disappears when done | The set-ups that make Sakhi useful, in the first week | M |
| **3** | **One "Get care free" hub.** Free doctor and care becomes the hub for Qura's doctor, eSanjeevani, care near her PIN, schemes and claims, Do it online, My ASHA, ambulances and helplines. It goes high on Help and as one row at the top of Care. The five scattered tiles fold into it | Every free doctor, rupee and helper in one place, two taps at most | S–M |
| **4** | **Search that finds tools.** Tools rank above articles when the title or keywords match. A small synonym list in English, Hinglish and Hindi: doctor, report, plan, reminder, iron, scheme money, near me, ASHA. Results dedupe by screen. A test pins the 18 searches above | She types what she means and gets the tool | S |
| **5** | **Care's "For you" shows her tools first.** For pregnancy: the plan, iron and claims. After a birth: iron, contraception and PMMVY part 2. On the pill: My method. The guides follow | The stage hub is about doing, not just reading | S |
| **6** | **Reminders everywhere they belong.** A row in Me, an empty-state "Set a reminder" in Coming up, and an offer at the moment of value: after she logs a period, starts a method or turns on a plan, "Remind me?" | More reminders on, which is the strongest lever on follow-through | S |
| **7** | **The visit loop.** On a check-up day (from her plan or reminders), Home shows "Going to the doctor today?" with her questions and the report. The report also sits high on Help | The record shapes the visit, which is the research's fourth lever | S |
| **8** | **A shorter Home.** Today for you, the flower garden and Your questions collapse into one "More for you" row under Today and Coming up. Target: 1.5 screens for most women | Less scrolling past things she doesn't need today | S |
| **9** | **Split the tools section.** Named groups: Get care free; My plans and reminders; My records; Feel better; Just for fun. Demo, Doctor's view and the sample footnote go only into demo builds | A library she can scan, and nothing that confuses a real woman | S |
| **10** | **A private "what helps" counter (opt-in).** Counts on the phone of which tools she used this month, sent only if she agrees, as numbers with no health details. This is open decision 25 in the app audit | Mohit learns what delivers value without tracking her | M |

**Order:** 4, 5 and 9 first: cheap, no new wording, immediate findability. Then 1 and 8 together (Home), 2 (setup), 3 (hub),
and 6 and 7 (loops). 10 needs Mohit's decision.

## 6. How a woman gets the most from Sakhi (by stage)

This is the advice in plain words. It is also the content for the "My plan" setup (recommendation 2).

| Stage | Set up once | Then, each day or month |
|---|---|---|
| **Periods** | Log your last period; turn on phone notifications, which include a heads-up the day before your period may start; save your ASHA's number; at 30+, add your check-up dates | Tap when it starts and how you feel; the monthly check-in; "What your diary shows" if something is unusual; the report before any visit |
| **On a method** | Add your method in Contraception and turn on its reminder | Tick the pill; the refill or next-injection date; side effects noted for your ASHA or doctor |
| **Pregnant** | Your period date or due date; plan reminders on; start iron (from the fourth month); save your ASHA; track PMMVY | Today's iron; "Due now" in your plan; PMSMA on the 9th; Td on U-WIN; the report at each check-up; the danger signs on Help |
| **After a birth** | Iron for 180 days; contraception after a birth; your check-ups; PMMVY's second part | Daily recovery check; feeding and mood; free care and ambulances on one page |
| **Midlife** | Your check-ups; the weekly symptom diary | Feel better now routines; the report for HRT conversations |
| **Anyone** | Free doctor and care: know your free options before you need them | Help: when to go now; Tele-MANAS for low mood |

## 7. UI notes

- **One primary action per card.** Today's rows and the setup steps use the filled button. Guides and discovery stay quiet
  (soft cards).
- **Chips that tell value at a glance:** "Free" on government services, "Due" and "Done" on plan items, a progress ring
  for plans with a target (iron 43 / 180).
- **Fold long pages behind clear section headings** and keep each screen's main button visible without expanding. 15
  screens are longer than 4 phone screens (app audit).
- **Keep the top bar as it is** (Doctor, read-aloud, language, Me). In discreet mode the Doctor button is the one
  giveaway; the app audit already notes it.
- **Pictures and voice:** read-aloud is on every screen. For women who can call but not text (73% vs 25% in Bihar), a
  recorded Hindi voice for the plan's due items and the danger signs is the next step. Who records it is open decision 4.

## 8. What not to do

- No new tab or new modules: the gain is in arranging what exists.
- No streak pressure or punishment for missed days. Iron and the plan count what she did; they never shame.
- No pop-ups driven by her data. That's the CDSCO gate: Today shows only what she or her plan scheduled.
- No chatbot. Search over doctor-verified answers, made smarter (recommendation 4), is the right tool.

## 9. Decisions for Mohit

1. Build recommendations 4, 5 and 9 now, then Home (1 and 8), as Version 30?
2. Should "Get care free" (recommendation 3) live on Help, on Care, or on both?
3. The opt-in "what helps" counter (recommendation 10): yes or no?
4. Who records the Hindi voice (open decision 4)?

## 10. What was built (Version 30, 22 Oct 2026)

Mohit, 22 Oct: "do all recommendations". All ten are built and tested (`web/test/value.mjs`, 106 checks; the full `npm test`
passes). The rules are in `web/MODULE_API.md` section 32, and the new words are in `docs/wording-review-v28.md` section 7.

| # | Built | Measured on the sample women |
|---|---|---|
| 1 | **Today** under the round buttons: today's iron, pill or Chhaya day, pregnancy IFA and calcium, the plan's "Due now", today's journey step and her own reminders, up to four, each with one tap | Asha's pill: from 2.3 screens down to 1.1. Meera's iron and Due now: 0.8 |
| 2 | **"Set up Sakhi for you"**: up to five steps for her stage, listing the three still to do, with "Hide this". It replaced "first three petals" | A new woman: period, ASHA, free care. Meera: plan reminders, scheme money, ASHA |
| 3 | **"Get care free"**: one page for Qura's doctor, Free doctor and care, Care near me, schemes (with her claims), Do it online and her ASHA, plus the emergency line. First row of Care, and the link in Help's doctor card | 1 tap from Care or Help |
| 4 | **Search** ranks tools by where the words hit, knows the tool words in English, Hinglish and Hindi, and shows each screen once | All 18 of the audit's searches put the tool she means first |
| 5 | **For you** puts her tools first (plan, iron, schemes; iron, contraception, schemes; My method; check-ups and diary) | |
| 6 | **Reminders**: "My reminders" in Me; "Set a reminder" in an empty Coming up; on Android, the heads-up and the reminders centre offer phone alerts when they are off | |
| 7 | **A check-up today**: her visit reminders (PMSMA day, an injection, a Copper-T visit, her own) bring "Going for a check-up today?" with the report | |
| 8 | **"More for you"** folds the stories line, Feel better now, the flower and the ask box under the day's tasks (open while just reading) | Home once set up: 1.6 to 2.5 screens, from 2.1 to 3.0. While the setup card shows: 1.9 to 2.7 |
| 9 | **Five named groups** instead of "tools": Get care free; My plans and reminders; My records; Feel better, family and more; Just for fun. The report and Qura's doctor are tiles now. A release APK can't reach the prototype settings or the sample women | |
| 10 | **"What helps"**, opt-in in Me > Privacy: monthly counts on the phone, sent as 1, 2–5 or 6+ days with no account; the server keeps only monthly totals | Built and tested on both ends; **not deployed** |

**Still Mohit's decisions:**
1. Turning on "what helps": the privacy notice names it first (counsel), then deploy the migration and the function together
   (`server/DEPLOY.md`). SERVER_SPEC section 11, decision 8.
2. Doctor review of the short forms in wording review section 7 before a release.
3. Who records the Hindi voice (open decision 4).
