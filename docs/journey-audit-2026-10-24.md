# From joining to the end of a plan: an audit by the three pillars (24 Oct 2026)

Mohit, 24 Oct:
> "can you also audit from onboarding to completing plans full journey as our philosophy for this app is 1. it helps you to
> track and manage your cycle and symptoms and gives you preliminary diagnosis as your records point to something 2. As
> per your needs and goals creates tailored fit plans and acts as a companion to achieve your goals 3. Gives you
> information and knowledge about dos and donts and a self help book also information about govt. schemes and programs
> for women reproductive health . I want to know where this app lacks features or UI/UX so it is able to deliver maximum
> with a minimalist non cluttered approach, then together with this we will act on version 39"

The three pillars, as this audit uses them:
1. **Track, and what her records may point to.** Logging her cycle and symptoms, and a safe early signal when her records
   point to something, leading to a validated self-check and a doctor.
2. **Tailored plans and a companion.** A plan made for her goal, and a companion that stays with her to the end of it.
3. **Knowledge and schemes.** Dos and don'ts, a self-help book, and the government schemes and programmes for women's
   reproductive health.

**Status: audit and advice only.** Nothing in the app was changed. This builds on the diet audit written earlier today
(`docs/diet-ux-audit-2026-10-24.md`), which it refers to rather than repeats. It also fits with
`docs/programmes-every-condition-2026-10-24.md` (written in another session today, untracked), whose "programme kit" is
step 39.4 here.

**One word to change: "preliminary diagnosis".** The app already never says "you have X"; it says what her records "may
point to", how soon to see a doctor, and that this is not a diagnosis. Keep it that way in the app and in marketing. CDSCO's
guidance on medical device software (CDSCO/MD/GD/MDSW/01/2026, section 7) counts software used "to triage or identify early
signs of a disease or condition" as driving clinical management, and notes that use by non-clinical users in a serious
condition "without the support from specialized professionals" may raise its risk class. The pilot is exempt on your lawyer's advice, but the design that keeps her safe is the same one that keeps
Sakhi on the "inform" side: every signal ends with a person, a free doctor first.

---

## How I looked

All on the `0.38-pilot` code (commit 418075d, the build on the Flip5), with a fake clock so months pass in minutes.

| Part | What it did |
|---|---|
| Pillar 1 | 28 seeded diaries covering 18 signals (long gaps, heavy flow, severe pain, spotting, a late period, PMOS signs, anaemia, pregnancy danger signs, after-birth warning signs, bleeding after menopause), in English and Hindi, discreet mode. 94 screenshots |
| Pillar 2 | The three walks re-run (first day, 12 weeks, every stage). 9 goals fast-forwarded 140 days with a check-in every evening; 25 single-answer changes at joining; the end of a plan; 4 life changes (pregnancy, trying then pregnant, a birth, a loss). 95 screenshots |
| Pillar 3 | The 69 Learn articles, 63 module guide pages, 31 myth cards, 5 relief routines, 14 schemes; 102 screens measured; 124 knowledge and scheme searches; a 14-day Today walk for 5 stages; facts checked against official sources. 61 screenshots |
| Across the pillars | 4 women joined from an empty phone through the real joining and sign-up, then lived 3 to 7 months: Riya (24, irregular, undiagnosed), Lakshmi (33, heavy periods), Pooja (27, late period, then pregnant, then a birth), Kavita (45, irregular and hot flushes). About 180 screenshots |
| Minimalism | An inventory of every route, tile, card, sheet and reminder source; Today on a busy evening for 7 women; every tab root measured; duplicates counted; a minimal structure proposed and partly simulated in the page. 135 files |
| Research | Principles with sources: screening versus diagnosis language and CDSCO's guidance, plan completion and maintenance, minimalist structure for many-feature health apps, and how to present schemes |
| Checks | Each finding went to a skeptic who checked it against the code. 105 held (most with small corrections, used here); 6 were dropped, 5 of them as repeats of the diet audit. A last critic checked for gaps and rule breaks, and merged everything into one Version 39 |

All 105 findings, with evidence, screenshot paths and the checkers' corrections, are in
`docs/journey-audit-2026-10-24-findings.md`. Screenshots are in `web/test/shots/journey-audit/` (not in git).

---

## 0. The answer on one page

**Each pillar works on its own. The hand-overs between them are where Sakhi loses her, and the app has grown by adding
parallel copies rather than joining what it has.**

| Pillar | Today | The gap |
|---|---|---|
| 1. Track and signal | Logging is the strongest part of the app: one-tap buttons, a quick day sheet, predictions from her own year. 27 fixed rules turn entries into plain words with how soon to act, and no screen says "you have X" | 10 of 18 signals tested were missed or shown once: a pregnancy BP of 164/112, bleeding at 54 after 418 days without a period, a heavy-bleeding chart of 161 with Hb 8.4, every urgent card in discreet mode. No signal card offers its self-check. Her picture is spread over 8 surfaces read by 6 engines that can disagree. Nothing follows up |
| 2. Plans and companion | Weeks 1 to 3 are good: goal-first joining, a reveal with a doctor check, 2 or 3 steps on Today, an 8 pm check-in, honest counts, a gentle restart | Tailoring is shallow: only 9 of 25 joining answers change her steps. The companion says something new on 5 to 11 of 84 days, with silences of 27 to 55 days. The end is a cliff: no summary to show a doctor, "Start a new 12 weeks" resets her to day 1, "Keep going" never ends. Four plans have no doctor path. Life changes end plans silently, and after a loss she is offered PMOS and period plans |
| 3. Knowledge and schemes | The content is broad, Indian, sourced and doctor-checked: 69 articles, 63 guides, 31 myth cards, 14 schemes with papers, claim steps and a PMMVY deadline reminder | It's three libraries that rarely link to each other or to the tools; 32 articles are reached from no screen. The same 16 topics for every woman. No dos and don'ts for pregnancy. The book doesn't know what she has read. Schemes are hard to find by name, and a PMMVY claim she has applied for still shows as due |
| Minimalism | The frame is right: 4 labelled tabs, Help in the header, Today in 5 blocks | About 120 tiles and 125 routes; 15 to 17 things to tap on a busy Today; two PMOS engines, two "My pregnancy plan" pages, three goal pickers on My plan, four hot-flush records. Nearly every gap is better fixed by removing or merging than by adding |

**What Version 39 should be:** fix the safety slips first, then give each pillar one home and make the hand-overs
automatic, then make the plans carry on to a real end, and only then add pictures and new content. Section 7 has the
steps. The first four add no new health wording, so they can ship while sections 13 to 16 of the wording review wait for
the doctor.

---

## 1. Fix first: three P0s (and the iron bug)

1. **Bleeding after menopause is missed, and reassured.** A 54-year-old with 418 days since her last period logs a bleed
   as a period. Sakhi shows "Period day 3" and "Around 40 and after, gaps between periods change. Keep noting each period."
   The urgent "Bleeding after your periods stopped · See a doctor this week" card exists, but only if she had ticked
   "periods stopped" (`explain.js:156`), and nothing sets that after 12 months. Fix: a bleed 365 or more days after the
   previous one, at 45+ or in midlife, uses the existing card; at 12 months with no period, the timeline asks once "Have
   your periods stopped?". The doctor confirms the 365-day trigger.
2. **A severe BP in pregnancy never reaches Today.** At 32 weeks with 164/112 saved in My pregnancy logs, the logs screen
   says "go to hospital now, call 112", but Today shows the week card and "Due now". The flags live only inside the logs
   screen (`preg.js:629-641`); the same is true for Hb under 7 and a high sugar test. Fix: the signal engine reads the last
   3 days of log flags and shows the reviewed lines as urgent cards.
3. **Discreet mode hides every urgent signal.** On a shared phone, bleeding in pregnancy, heavy flow and bleeding after a
   birth ("call 112 now") each show nothing at all on Today or in Notes (`app.js:1831`). Hiding the words is right; hiding
   that a signal exists is not. Fix: one neutral line, "Something you noted needs a check soon · Open", which opens behind
   the app lock and is never in a notification. The past-42-weeks line already works this way.
4. From the diet audit: the **Iron tablets** set-up shows one letter per line (a one-line CSS fix).

Close behind, also in step 39.0:
- **Women on the pill or the injection are never identified at joining,** so an Antara user with no bleeds gets the 90-day
  "see a doctor" card and a pill user's withdrawal bleeds get fertile days. The pill question (`pill_q`) exists but isn't
  asked.
- **After a pregnancy loss,** a plan that was paused by the pregnancy comes straight back with its reminder and "Shall we
  start again, small?". Part of this is mine: today's reminder fixes bring a paused plan's reminder back when the
  pregnancy ends. After a loss the plan should stay paused, and My plan and For you should show only the loss pages for
  6 weeks unless she asks.
- **After the birth, Today stays pregnant** ("39 weeks pregnant", the kick counter) until she finds a small "Change stage"
  link; "Has your baby arrived?" waits until 7 days after the due date and never shows in discreet mode.

---

## 2. Pillar 1: track, and what her records may point to

**Works well:** one-tap logging with Undo; a day sheet grouped the way a doctor asks; the late-period card at the end of
her own range, with the ectopic warning word for word; "How Sakhi works out your numbers"; the PMOS self-check that uses
her diary, follows the 2023 guideline, says "match" and goes into the report; urgent cards above the round buttons on the
first screen, in Hindi too; fertile days well guarded (never a "safe day").

**What's missing:**
| # | Finding | Where |
|---|---|---|
| 2.1 | **Stage records never become signals.** The pregnancy logs (BP, Hb, sugar), yesterday's after-birth warning signs, the heavy-bleeding chart (PBAC), a low Hb from her lab report, the endometriosis pain diary, and the heavy or severe answers she gave at joining all sit in their own screens | `preg.js`, `post.js`, `cond.js`, `explain.js` |
| 2.2 | **No signal card offers the matching self-check.** 0 of 27 cards link to one; the endometriosis and fibroids checks are 4 taps deep and never suggested. The PMOS self-check sits folded under "More from Sakhi", labelled "A plan for you" | `explain.js`, `selfcheck.js` |
| 2.3 | **Two PMOS engines disagree.** The self-check says "1 of 3 signs, see a doctor this month"; its "Read about it" opens the old Pattern check, which says "Not enough data" and "Doctor's verdict: Pending review" | core `pattern` route |
| 2.4 | **Her picture is spread over 8 surfaces in 3 tabs** (Diary banner, Trends verdict, What repeats, Your numbers, the explain page, Pattern check, the self-check, This month), read by 6 engines with different rules. Trends can say "Outside the usual" while its button opens "Nothing unusual" | `app.js`, `explain.js` |
| 2.5 | **The next step favours a paid call over free care.** "See a doctor this week / this month" cards never offer the free government doctor; the self-check's main button is a Qura doctor. No card opens the report | `explain.js`, `selfcheck.js` |
| 2.6 | **Nothing is followed up:** no "Did you see a doctor?", no re-check date for a self-check, nothing told to the plan or the report | everywhere |
| 2.7 | **Flow and pain can be logged only on the start day;** details added on "Period ended" are saved but never read. The self-checks ask again what her diary and joining already answer | `app.js:2536`, `selfcheck.js:30` |
| 2.8 | **While a plan runs, "see a doctor this month" folds out of sight** behind the weekly look-back | `app.js` slot order |
| 2.9 | Pregnancy danger signs: the day sheet can't record most of them, and headache plus swelling only counts on the same day. Tiredness leads to a sleep plan, and anaemia signs can't be logged | `explain.js`, day sheet |
| 2.10 | "Just keeping track" asks nothing about her cycle, so Riya's first doctor-level signal came on day 118 | joining |

**The minimal direction:** one engine and one home, not more tools.
- `explain.findings` becomes the single engine and reads the stage records the app already keeps.
- Diary's Trends tab becomes **"What it shows"**: the signals by urgency, the verdict with "Your numbers" folded in, What
  repeats, "Checks you did" with dates, My cycles, and the report button.
- Every signal card gets the same three buttons, in this order: **Free doctor near me**, **Show my doctor** (the report,
  with that card's question first), and Ask a Qura doctor (never on urgent cards). "Check the signs" appears only where a
  validated check exists, and hides for 90 days after she does it.
- Pattern check goes; its two useful parts move into the endometriosis link and the PMOS self-check.
- One follow-up rule: a "this week" card returns after 14 days, a "this month" card after 30, as "Did you see a doctor?
  Yes / Not yet". Yes saves the date for the report.

## 3. Pillar 2: tailored plans and the companion

**Works well:** one plan at a time on one engine; start today, tomorrow or Monday; the 8 pm reminder opens the check-in;
honest, forgiving counts with no streaks; her period noticed the day she logs it; the skipped-months doctor check; a
week-12 doctor card when results don't change; pregnancy and after-birth plans that follow her own weeks; discreet mode
and Hindi throughout.

**What's missing:**
| # | Finding | Where |
|---|---|---|
| 3.1 | **Joining asks what the plan never uses.** Of 25 single-answer changes, 9 changed her steps, 11 only the reveal's echo, 5 nothing. Bedtime and work go unused for heavy, pregnancy, after-birth and midlife plans; activity for heavy and after-birth; PMS severity, pain days and "often tired or dizzy" are only echoed. Irregular, skin and PMOS goals give identical steps. Knee or back pain is never asked, so everyone gets kneeling poses | `plan.js:1133, 1309` |
| 3.2 | **The companion goes quiet after week 3.** New messages on 5 to 11 of 84 days, silences of 27 to 55 days, 1 or 2 different evening lines in 84 evenings, "Well done. Keep going." in 12 of 12 look-backs. Targets keep rising after a week of nothing ("0 of 90 minutes") | `plan.js` |
| 3.3 | **Completing a plan is weak.** Week 4 and week 8 "look-backs" are only a link. The end page puts her main result 4th, shows this week's numbers rather than 12 weeks', has no "Show my doctor" button, and the report carries none of the plan's results. Lakshmi's report still asks "Should I have an Hb test?" after 58 tablet days | `plan.js:476-489, 852-871` |
| 3.4 | **After the end:** "Start a new 12 weeks" resets her to 10 minutes a day and the first food habit; "Keep going" has no look-backs, no month-4 follow-up and no end; the end card was still on Today on day 215 | `plan.js` |
| 3.5 | **No doctor path in the PMS, midlife, trying and after-birth plans,** though the app has the lines (the PMS log's doctor line, the months-of-trying rule, the 6-week check) | `plan.js` |
| 3.6 | **Life changes have no "new chapter".** The pregnancy plan ends without a word; after a birth My plan lists 18 options including "My PMOS plan"; after a loss, 7 period goals and 12 more plans with no word about the loss. Changing goal erases her weekly look-backs, though the screen says "what you logged stays". Stopping is a cliff: no pause | `plan.js` |
| 3.7 | **Too many plan-like things:** 10 plan titles and 23 catalogue "plans", two 21-day journeys that repeat the heavy and cycle plans, two pages called "My pregnancy plan", three goal pickers on My plan with no plan | `plan.js`, `journey.js`, `preg.js` |
| 3.8 | **Steps don't touch their tools:** Done on a strength day doesn't count the strength day; iron tablets run as a separate Today row beside the heavy plan; the PMS log and midlife diary sit outside their plans | `plan.js`, `iron.js` |
| 3.9 | "Ask Qura to call me" appears at only 3 plan moments, with no topic; when results show no change, the biggest button is a supplements consult | `plan.js` |

**The minimal direction:** fix the engine and the ending once, before writing any new programme.
- **One plan page for all 8 plans** (the programmes doc's kit): the cycle plan's ring, week path and four tiles (My food,
  My moves, My measure, My progress) for every goal, replacing the "light" page.
- **Targets follow what she did,** life changes hand over with one "Your plan has changed" card, past plans are kept,
  "Start a new 12 weeks" starts from where she is, and stopping offers "Pause for a week".
- **The end page becomes the summary:** one headline with her goal's before and since and one plain sentence, then days
  followed and what next, with "Show my doctor" and "Free government doctor". "Keep it light" replaces "Keep going",
  with one results card around month 4.
- **A doctor path in every plan,** using lines the app already has.
- Joining asks only what the plan uses (2 to 4 fewer questions per plan), adds knees-or-back and how she eats as chips on
  existing screens, and pre-fills the cycle questions from her diary.

## 4. Pillar 3: knowledge, the self-help book and schemes

**Works well:** every Learn article has a summary, "When to see a doctor" and sources; the quick-answer sheet (summary,
Listen, full guide, when to see a doctor, in 174 words) is the best bite-size format in the app; pregnancy week tips reach
Today every day; schemes are accurate and sourced, with papers as ticks, claim steps and a PMMVY deadline reminder; the
Govt. services hub is lean (5 rows); myths are answered with respect; five 3-minute self-help routines with voice.

**What's missing:**
| # | Finding | Where |
|---|---|---|
| 4.1 | **Two libraries that almost never meet.** Modules link to Learn articles 2 times in all; articles never link to a tool; 32 of 69 articles are reached from no screen; 75 of 83 guides on topic pages are listed again on the module hubs | `app.js`, `content.json` |
| 4.2 | **Knowledge arrives at the right moment only in pregnancy** and after a symptom log. A woman on the cycle or trying plan gets 0 links to any guide in 14 days | Today, My plan |
| 4.3 | **It isn't a book yet:** no contents, no order, nothing shows what she has read (though `joy.reads` already stores it), the library is the last row of Explore, 3.2 screens down, and Learn is 6 screens long | `app.js:2935` |
| 4.4 | **No dos and don'ts for pregnancy.** "Pregnancy precautions" finds the test guide; sex and travel in pregnancy have no lines (sleeping on her side does, at week 28). After a birth, "jaapa" and "sawa mahina" find nothing | `preg.js` |
| 4.5 | **After a loss, Explore still offers contraception, period pain and PCOD** (open since the 23 Oct For-you audit) | `app.js` For you |
| 4.6 | **Schemes:** an applied PMMVY claim still shows as "Scheme money" due in the pregnancy plan; PMMVY's two payments are tracked as one; JSY is missing after the birth; the finder asks what Sakhi knows and ignores her state; scheme names don't search ("matru vandana", "9 tarikh", "5000" find nothing, and "जननी सुरक्षा" leads to violence pages); the ₹6 Menstrual Hygiene Scheme pack is in the guides but not on any scheme page | `access.js`, `preg.js:926`, `app.js:1106` |
| 4.7 | **The same fact in several copies with different numbers** (pad changes, myths, danger signs); three static "when to see a doctor" lists; four family and partner pages | `joy.js`, `periods.js`, `family.js` |
| 4.8 | **Off-scope and placeholder screens:** "Today for you" (a second Today with dengue and heat cards), "Doctor videos" (all "Planned"), an orphaned stories screen, TB and dengue items on the schemes list | `access.js` |
| 4.9 | Contraception fears get one line; the best-evidence self-help programmes (CBT for menopause symptoms and sleep) are one-line mentions; the longest guides grew since 22 Oct | `contra.js`, `meno.js` |

**The minimal direction:** every read ends in one thing to do, and every chapter ends at free care.
- **One small map** linking each article, guide and tool: an article shows one "Use the tool" row and one next article for
  her stage; a guide shows one "Read more"; a plan step's "Why?" opens its article.
- **Sakhi's book:** Learn's chapters take the topic names, her stage's chapters first, a ✓ on what she has read and one
  "Continue" row, each chapter ending with "Where to get it free". About 6 screens become about 1.5.
- **One myths deck and one danger-sign list** used everywhere; the doctor picks one pad-change number.
- **One "Dos and don'ts" quick answer per stage,** first in "Your questions", built mostly from reviewed lines (about 6 to
  10 new ones for sex and travel in pregnancy and a few after a birth).
- **Schemes that close the loop:** a claimed scheme ticks the plan's step; PMMVY's two payments; JSY after the birth; the
  finder pre-filled from her diary; every scheme findable by its name, Hinglish, Hindi or amount.
- Remove Today for you, Doctor videos and the stories route; merge the family pages into one.

## 5. Across the pillars: where the hand-overs break

The four lived journeys, in short:
- **Riya (irregular, undiagnosed):** joining asked nothing about her cycle, so her first doctor-level card came on day 118.
  From the card to the self-check result took 14 taps, the result's main button was a paid call, and its "Read about it"
  contradicted it. After the check, with 2 long gaps and no diagnosis, My plan said "Nothing to suggest yet": no plan was
  offered (the cycle plan scores only for a diagnosis or a "match"). Her 12 weeks then worked (60 of 84 days), but the end
  had no report button, said "If nothing has changed" though Sakhi knew, and never followed up.
- **Lakshmi (heavy periods):** the reveal's doctor card offered the free government doctor first (good), but day 1's step
  was the iron tablet before any Hb test. The heavy-bleeding chart read 0 for the period she had just logged as soaked
  with clots; iron ran as a separate Today row; her Hb was never asked; at week 12 there was no Hb or tablet count.
- **Pooja (late period, then pregnant):** late card to "pregnant" in 5 taps, schemes and danger signs in 2 (good). Then two
  "My pregnancy plan"s, overdue steps piling up ("Td injections, and 7 more" at week 34), Today still pregnant 3 days
  after the birth, the pregnancy plan ending without a word, 18 options after the birth, JSY missing, and "Week 6 is done ·
  0 of 7 days" for a new mother.
- **Kavita (45, hot flushes):** the midlife Today fits her. But hot flushes can be noted in 4 places that don't read each
  other ("My midlife picture" said 0 while her diary held weeks of "a lot"), and her rating fell from 3 to 1 yet the
  results showed "3 of 3 weeks", so the change was invisible.

The pattern: notice → understand → check → show a doctor → the right plan → back to the doctor at the end. Each arrow is
currently something she has to find herself.

## 6. Minimalism: the structure, by pillar

Sakhi has about 120 tiles over 114 routes, 121 module routes plus 25 core routes, 17 topic pages, 69 articles, 18 tours,
13 sources of reminders, and 15 to 17 separate things to tap on Today on a busy evening (28 to 31 controls). Explore shows
the same 16 topics (173 items) to every woman; for a 25-week pregnant woman 44% of them are off-stage. Every tracker screen
lights the Explore tab.

The proposal keeps the 4 labelled tabs and Help in the header, and gives each tab one pillar:

| Tab | Becomes | Removed or merged |
|---|---|---|
| **Today** = her day | A status line (the cycle card shrinks while a plan runs), the list of her plan steps and everything due today with no silent cap (when it's long, her plan's steps fold into one row), the check-in button, one "Sakhi says" card ranked urgent → doctor signals → plan moments → the rest | The "This month" round button (to Diary), the "Change stage" link (Me has it), the pregnancy hero's duplicate buttons (one becomes "My baby is born" from week 37), the "More from Sakhi" fold, the setup card after about 30 days |
| **My plan** = pillar 2 | One page for every plan: "Today: 1 of 3 done · Check in", her path and results, the food, moves and body tiles, one care-team row, settings. In pregnancy this is the pregnancy plan | The repeated Today block, "Your care team" in full, the second "My pregnancy plan", the 21-day journeys as programmes, 2 of 3 goal pickers |
| **Diary** = pillar 1 | Calendar, **What it shows** (signals, verdict, What repeats, her stage's 2 to 4 trackers, checks she did, the report), Days | Pattern check, the Symptom guide tile (into Help), the separate "Your numbers" card, trackers scattered under Explore |
| **Explore** = pillar 3 | Search, For you, Govt. services, her stage's topics (8 to 11 of 16, with "All topics"), Sakhi's book under the same topic names | About 12 index pages (a topic opens its hub), 4 tool drawers moved to their tabs, Today for you, Doctor videos, the duplicate Language tile. Discreet mode keeps the full neutral grid |
| **Me** | One Reminders row; setup while unfinished; her goal with a Change link; "Me / मैं" label | The second reminders row |

Net effect, as measured or simulated: things to tap on Today from about 15 to 17 down to about 10; topic cards per stage
from 16 to 7 to 9; pillar-1 surfaces from 8 in 3 tabs to 1 home plus 1 Today card; doctor documents from 2 screens to 1;
"My pregnancy plan" from 2 screens to 1. Also worth measuring once: a cold start on a low-end phone (the app parses about
3.3 MB of JavaScript and JSON on every start, and nothing times it), so the removals show up as speed.

---

## 7. Version 39, merged with the diet audit

The critic merged the diet audit's 39.0 to 39.5 with this audit into nine steps. Each ships on its own, and each removes or
merges at least as much as it adds.

| Step | What | Removes or merges | New health wording | Size |
|---|---|---|---|---|
| **39.0 Fix and protect** | The iron bug; the three P0s (bleeding after menopause, pregnancy log flags and after-birth warning signs into the signal engine, a neutral urgent line in discreet mode); loss pages out of weight and food searches; neutral For you in discreet mode; the pill question at joining (stops false signals for women on a method); a paused plan stays paused after a loss; Today's slot ranked urgent first and her tablets never folded; small fixes (a claimed PMMVY or JSY ticks the plan, no "Starts a new 12 weeks" in pregnancy, the stuck "New this week" pill, the supplements card off the results page) | Three warning systems into one; the supplements card | None (reviewed lines reused); the doctor confirms two triggers | M |
| **39.1 One home for what her records say** | Diary's "What it shows"; one engine; the same three buttons on every signal; "Check the signs" where a validated check exists; flow and pain on every bleeding day; the PMOS result and the long-gap card offer the irregular-periods plan | Pattern check, the Symptom guide tile, the "A plan for you" self-check card; 6 engines into 1; 8 surfaces into 1 | Labels only | M |
| **39.2 Fewer places to look** | Explore by stage with Contents and All topics; topics open their hubs; drawers moved; one pregnancy plan page; My plan with one picker and one Today row; Today's fold and links gone; "My baby is born"; one name per thing; Back to Today; "Me / मैं" | About 12 index pages, 75 repeated links, 4 Explore cards, 3 tiles, the stories route, the 21-day journeys as programmes, a duplicate pregnancy page | Labels only | M |
| **39.3 Food and search in her words; joining asks only what it uses** | The diet audit's one food home and how she eats (Jain, no milk, vegetarian by default, one shared foods table); joining drops unused questions and adds knees-or-back; cycle questions pre-filled from her diary; the reveal one card shorter; search for food, scheme names, "kya kare / kya na kare", pinned in tests | 9 food screens behind one entry; 4 iron lists into one table; 2 to 4 questions per plan; one reveal card | Labels only | M |
| **39.4 Plans that carry on** | One plan page and registry for all 8 plans (the programmes kit); targets that follow her; "Your plan has changed"; past plans kept; a fair "new 12 weeks"; "Pause for a week"; steps that count from their tools (strength, iron, PMS log, midlife diary, 6-week check); a companion that keeps noticing | The light plan page and five sets of per-plan branches; iron tablets into the heavy plan; the PMS log into the PMS plan | Labels only | L |
| **39.5 Results and the doctor loop** | The end page as a summary she can show a doctor; month cards as summaries; "Keep it light" with one month-4 results card; a doctor path in every plan; "Did you see a doctor?" and "What did the doctor say?" (existing reproductive stores only); new signals with doctor-set triggers (PBAC 100+, Hb below her report's range, tiredness) | The end card that never leaves; the reminder with no end; duplicate doctor nudges | Yes, about 15 to 25 lines (§18) | M |
| **39.6 Knowledge that leads somewhere** | The article-guide-tool map; Sakhi's book with chapters, ✓ and Continue; one myths deck and danger list; dos and don'ts per stage; the scheme fixes; one family page; the 5 longest guides in the Learn layout | "Also asked", the myth game as a separate screen, 2 family tiles, duplicate facts; 3 libraries into 1 book | Small, about 6 to 10 lines (§18) | M |
| **39.7 Pictures first** | The diet audit's picture steps: food tiles from the 31 existing drawings plus about 25 new, My plate as pictures, "Foods that help" strips, Today's smaller cycle card, the reveal with pictures, danger-sign pictograms, a speaker per card, Hindi type | First-screen text of 4 food pages folded; 5 repeated disclaimers | Captions (§17), plus a field check that women name each drawing | L |
| **39.8 Food steps that change** | The diet audit's iron rotation, earlier habits brought back, a 40+ calcium step, a pregnancy food step by trimester, breastfeeding food cards, "Fasting today" | 63 days of one iron line; 26 weeks of one pregnancy link | Mostly reused; new fasting and breastfeeding lines (§17) | M |

Rules for every step: English and Hindi, and discreet mode, on every new surface; tests in the repo, run in both the
pilot and the tester build (tester builds hide the triage tools many links depend on); the walks run before and after;
one budget for the "Sakhi says" slot, since several steps add candidate cards to it.

**After Version 39, in order:** the diet audit's meals, recipes and weekly thali; the programme content packs from the
programmes doc (each with its own review packet, from §19); CBT-based coping only inside the midlife programme; the book as
a deck of one-message cards; merging the remaining trackers; the people side of the companion (a coordinator rhythm and the
doctor review, by phone, once `SAKHI_HELP_WA` is set); scheme extras that need a source; catching the other languages up;
the release-build gates, which stay off until the CDSCO risk-class answer.

## 8. Rules check

The critic fixed these before they reached the plan above:
- No "Tired or dizzy" chip: dizziness with heavy flow stays a red-flag line; tiredness on 10 of 30 days gives a
  "keep an eye on it" card with the reviewed iron line and the free Hb test.
- The midlife plan's result is her weekly diary in her own words, never a change in a validated score (that would read as
  a treatment effect).
- "What did the doctor say?" offers only existing reproductive answers (PMOS, low Hb with tablets, tests pending, nothing
  found, "something else: see my report"); no thyroid content or plan; hidden in discreet mode.
- Qura's button comes third, after the free doctor and the report, only at doctor moments, with a neutral, editable topic;
  the supplements card goes.
- The heavy-bleeding chart is never filled in from summary flow entries; only real chart entries of 100 or more count.
- "Baby moving less" shows Help's reviewed line and a call button in every build, with no kick count.
- Lab-value signals read only the range printed on her report, say "may", and the doctor sets the urgency.
- Scheme helplines, amounts and new scheme lines ship only after checking the official portal or PIB, with the source and
  date.
- Explore by stage keeps the full neutral grid in discreet mode, and scheme-finder answers are never saved.
- "Preliminary diagnosis" appears nowhere; an intended-use line in Me > About ("A period diary, a guide and habit plans.
  Sakhi doesn't diagnose; a doctor does") is checked by your lawyer; store copy goes through the humanizer in Dr. Megha's
  voice.

## 9. Decisions for Mohit

The ones that shape Version 39 (the full list of 14 is in the critic's notes, summarised here):
1. **Build order:** 39.0 to 39.3 first (no new health wording), then 39.4 to 39.8? Recommended.
2. **The plan engine:** build the programme kit inside V39 (39.4, recommended), so later programmes are content only,
   rather than patching `plan.js` now and porting later.
3. **Scope:** recipes, meals and the programme content packs move to after V39? Recommended.
4. **The words:** "what your records may point to", never "diagnosis", in the app and in marketing; the intended-use line
   in Me, checked by your lawyer.
5. **Reviewers:** sections 13 to 16 before any tester build; then §17 (food) and §18 (this audit's lines). Name who
   reviews what: Dr. Megha for food and habits, an MBBS gynaecologist for the triggers (365 days at 45+, the BP mapping,
   PBAC 100, Hb below range, tiredness, "within 2 weeks", one pad-change number), and a Hindi reviewer for every new line.
6. **Field test:** start the 8 to 10 women on a 39.0 to 39.3 build and freeze the plan engine for their 12 weeks?
   Recommended, so their results can be read.
7. **Women on a method:** add the existing pill question to joining? Recommended. And should "Avoiding pregnancy" come
   back as a goal whose plan is just her method and its reminder?
8. **Remove:** Pattern check, Today for you, Doctor videos, the stories route and the supplements card? Recommended.
9. **Explore by stage,** with All topics and the full neutral grid in discreet mode? Recommended.
10. **Before real pilot installs:** the real signing key and the update check (a server route you deploy), and a "Keep a
    backup" setup step after about 30 days of entries.
11. Plus the diet audit's decisions (its section 10): the food home, who sets kitchen measures, recipes, fasting, the NIN
    letter and the drawings.

## 10. What already works and should stay

- Logging: one tap, Undo, the day sheet, predictions from her own year, and the transparency of "How Sakhi works out your
  numbers".
- The signal wording: "may", how soon to act, "This is not a diagnosis", and no "you have X" anywhere.
- The PMOS self-check's use of her diary and the 2023 guideline; the late-period card with the ectopic warning; well-guarded
  fertile days.
- The plan's first weeks: goal-first joining, the reveal's doctor card with the free doctor first, honest counts, the 8 pm
  check-in, a gentle restart; pregnancy and after-birth plans in her own weeks; the after-birth check done only by doing it.
- The quick-answer sheet, the pregnancy week tips on Today, the respectful myths, the self-help routines.
- Schemes: accurate, sourced, with papers, claim steps and the PMMVY deadline; the lean Govt. services hub.
- The frame: 4 labelled tabs, Help in the header, Today in 5 blocks, a lean check-in, Hindi and discreet mode throughout,
  and 0 page errors in thousands of renders.
