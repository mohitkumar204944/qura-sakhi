# One Sakhi for each woman: personal, uncluttered, a daily companion (3 Nov 2026)

Mohit, 3 Nov: "today it shows everything to every user but i want a user experience where it is personalised and non
cluttered and fully serves purpose of app acting as a companion in daily life helping in improving with diet and lifestyle
and make a doctor available when needed, how should be best done from very start onboarding".

**Advice only. Nothing in the app was changed.**
- Measured on HEAD 97b02b2 (the vc 104 build on the Flip5), at 360 × 800, from a clean copy. Another session's unfinished
  V39.57 work was in the main folder, so the walks ran on the clean copy.
- Re-checked on 3988720 (V39.57) once it landed. The numbers are the same except two lines: Meera's My plan lost "For period
  cramps" (V39.57's item 8), and Riya's pelvic floor step now shows "2 min". F1 to F7 all still stand.
- Follow-up: `docs/lives-audit-2026-11-03.md` walks one woman per stage over weeks and months, plus 14 edge ages. It adds four
  rule sets for the composer: age bands, life-event checks, an end for every card, and an interruption budget.
- Tools: a new walk, `web/test/census-walk.mjs`, and the joining tap counter (`web/test/taps/join-run.mjs`).
- Screens and every line each woman saw are in `web/test/shots/census/`: `census.txt` and `items.txt`.

---

## 0. The answer on one page

**Where it stands.** Sakhi already personalises a lot:
- joining asks her stage and goals;
- Explore and Learn show her stage's topics;
- nine kinds of plan shape food, moves, sleep and calm to her answers;
- Help is on every screen.

But each of about 30 modules decides for itself where it appears. Her content is personal, but the screens around it are
the same for everyone, and they are long:

- **A lot to take in.** By day 8, each of the 8 women we joined had 143 to 171 things to tap across Today, My plan, Diary,
  Explore, Learn and Me. That is about 13 phone screens of scrolling. Explore alone is 22 to 24 taps and 2.6 to 2.9 screens
  for every one of them.
- **The same page in up to 5 places.** Riya's pregnancy plan and her week's page are each reachable from 5 places.
- **She is asked twice, then asked to choose again.** From install to her first plan step takes 42 taps and 24 screens, with
  two rounds of questions. On day 1, My plan asks "What do you want to work on?" and offers 13 to 18 plans and tools. She
  answered that question 5 minutes earlier.
- **Content in the book's order, not her day's.** Both a woman 20 weeks pregnant and a mother 3 weeks after the birth are
  shown "Pregnant? Register before 12 weeks".
- **Rules that drift from what was decided:**
  - every woman is asked to save her ASHA's number and to "Look at free care near you", though Version 39.28 keeps those
    words for women who choose government care;
  - a woman whose periods stopped is offered "Period started". When she taps it she hears "Period start saved", with no
    check-up line at that moment.
- **The doctor is everywhere and nowhere.** Each woman has 6 to 10 care entry points, mostly government and check-up rows. On
  day 1 and day 8, none of the 8 had "Ask a Qura doctor" anywhere on her tabs outside a fold.

**The cause.** Each module decides on its own what to show, so personalising never happens in one place. Every new feature
added another way in.

**The fix: decide once, in one place, from one profile.** Six changes:

1. **One profile, one composer.**
   - The profile holds what she told Sakhi, what her diary shows, where she is in her plan, her care answer and her phone. It
     stays on the phone.
   - The composer decides what every screen shows. Each screen has a budget, and each thing has one home: modules offer
     things, and the composer picks.
2. **Joining that ends with her plan running.**
   - One round of questions, only what day 1 needs.
   - Then "Your Sakhi" shows her plan, her first steps and where her doctor is, with one Start button.
   - Everything else is asked on the day it changes something.
   - Target: about 26 taps and 13 screens to her first step, down from 42 and 24.
3. **Today on one screen.** It holds three things:
   - her body today (cycle day, pregnancy week, days since the birth, or her midlife card), with one way to log;
   - her steps and the evening check-in;
   - one "Sakhi says".
4. **Her next step, not the catalogue.**
   - My plan shows her plan, or the one plan for her goal.
   - Explore leads with search and "For you" (6 rows at most). The library is one row.
   - Learn follows her week.
5. **A doctor ladder, the same in every plan.** Four rungs:
   - emergency: Help, unchanged;
   - a sign in her data: one card, with the right doctor first;
   - her plan's doctor moments;
   - any time: one home for "Ask a Qura doctor".
   Government and ASHA lines show only when her care answer asks for them.
6. **Measure clutter the way we measure taps.** The census becomes a test with budgets for each screen: nothing repeated,
   and nothing that isn't hers.

**Build order** (section 6). Each phase is checked with the census and the tap counters before and after:
- A: stop the drift, one small session, after V39.57 lands;
- B: the composer and Today;
- C: joining that starts her plan;
- D: Explore and Learn;
- E: the doctor ladder, with its doctor packet first;
- then the field test, with the opt-in "What helps" counts switched on.

**When her stage changes** (section 4.11, Mohit's case of a 22-year-old who picks the menopause stages): her records are safe,
but Sakhi doesn't notice her age. My midlife plan can start at 22, and "My periods have stopped" leads to a loop that never shows
the POI line. Five rules fix it, in phase A.

**Your decisions:** 7, in section 8.

---

## 1. The goal, in words we can test

| Goal | The test |
|---|---|
| **Personal** | Nothing on her screens that isn't for her this week (her stage, goal, week, care answer and phone), apart from Help, which is the same for everyone |
| **Uncluttered** | Every screen keeps to its budget (section 7), and each page has one way in from the tabs |
| **A daily companion for diet and lifestyle** | One small plan for her day: food, moving, sleep, calm and her tablets. Also a 1-minute check-in in the evening and one look back each week. Her steps change with her cycle, her pregnancy week, her nights and what she logs |
| **A doctor when needed** | When her diary or her plan says so, the right doctor is one tap away. When it doesn't, the doctor waits in one known place |

---

## 2. Where Sakhi stands today (measured)

### 2.1 How we looked

- **The census walk** (`node test/census-walk.mjs [web dir]`):
  - 8 women join the way a woman does: stage tile, goals, details, sign-up, Skip the tour;
  - each tab is counted on day 1;
  - her plan is then started from her answers, and the tabs are counted again on day 8;
  - counted on each screen: the cards, rows and buttons she can see (closed folds don't count), the words, and how many
    360 × 800 screens tall the page is.
- **Joining's tap counter** (job 12): the cycle woman, tour skipped.
- **The code** behind every surprising line, read on the same commit.

| Woman | Joined as | Her plan by day 8 |
|---|---|---|
| Priya, 24 | Regular periods, just tracking | none |
| Sana, 29 | Regular periods: period pain, mood before periods | My period plan |
| Anjali, 27 | PMOS: irregular periods, weight | My PMOS plan |
| Neha, 30 | Trying for a baby: getting ready | Getting ready for a baby |
| Riya, 26 | Pregnant, 20 weeks: food and activity | My pregnancy plan |
| Meera, 28 | Had a baby 3 weeks ago: recovery | My recovery plan |
| Kavita, 46 | Periods changing after 40: hot flushes, sleep | My midlife plan |
| Sunita, 54 | Menopause: hot flushes | My midlife plan |

### 2.2 What is already personal (keep all of it)

| Where | What already changes from woman to woman |
|---|---|
| Joining | 7 stage tiles, up to 3 goals, only the details her stage needs, where she gets care, the shared-phone kit (V39.10, V39.26, V39.28) |
| Today | Her stage's headline (cycle day, PREGNANT, AFTER BIRTH, SINCE YOUR LAST PERIOD, CYCLE COUNTING IS OFF), at most 4 steps, the check-in in her evening's order (V39.27), the 4 am plan day |
| Plans | Food by region, diet, fasting and trimester. Moves by level, with rest days. Sleep and calm by her nights. Doctor cards from her diary. Lessons a week |
| Explore and Learn | "For you", "Your questions" and topics for her stage. Other stages are out of her way, and search still finds everything |
| Help | The same safety for everyone, and "See a doctor" in her stage's words |
| Shared phone | Discreet titles. The full topic grid stays, so the screen doesn't give her stage away |

Sakhi has the right pieces. The problem is how they are put together.

### 2.3 The numbers

Things to tap / screens tall at 360 × 800. "All six" adds Today, My plan, Diary, Explore, Learn and Me. Diary's number includes
the calendar's 30 day cells.

| Woman | Day | Today | My plan | Diary | Explore | Learn | Me | All six |
|---|---|---|---|---|---|---|---|---|
| Priya | 1 | 25 / 2.1 | 16 / 2.1 | 52 / 2.3 | 24 / 2.8 | 23 / 2.2 | 14 / 1.7 | **154 / 13.2** |
| Sana | 8 | 31 / 2.3 | 21 / 1.9 | 52 / 2.3 | 24 / 2.9 | 23 / 2.2 | 14 / 1.7 | **165 / 13.3** |
| Anjali | 8 | 35 / 2.4 | 24 / 2.3 | 52 / 2.3 | 24 / 2.9 | 22 / 2.0 | 14 / 1.7 | **171 / 13.6** |
| Neha | 8 | 33 / 2.5 | 25 / 2.4 | 52 / 2.3 | 23 / 2.7 | 20 / 1.9 | 14 / 1.7 | **167 / 13.5** |
| Riya | 8 | 27 / 2.2 | 22 / 2.5 | 38 / 1.4 | 22 / 2.6 | 20 / 2.2 | 14 / 1.7 | **143 / 12.6** |
| Meera | 8 | 27 / 2.1 | 20 / 2.4 | 38 / 1.5 | 23 / 2.8 | 21 / 2.2 | 14 / 1.7 | **143 / 12.7** |
| Kavita | 8 | 32 / 2.5 | 23 / 2.2 | 51 / 2.1 | 22 / 2.7 | 20 / 2.2 | 14 / 1.7 | **162 / 13.4** |
| Sunita | 8 | 32 / 2.6 | 23 / 2.2 | 38 / 1.5 | 22 / 2.7 | 20 / 2.2 | 14 / 1.7 | **149 / 12.9** |

Day 1 for every woman, and Priya's day 8, are in Appendix A. On day 1 she already faces 125 to 154 things to tap across 11
to 14 screens, before she has done anything.

### 2.4 Seven reasons it still feels like "everything for everyone"

**F1. Personal content, but the same shell for everyone.**
- Explore is 22 to 24 taps and 2.6 to 2.9 screens for all 8 women.
- 7 of its rows are the same for all of them: search, Contents, Govt. services, My food, Intimate health and safety,
  Screening and check-ups, and Help and safety.
- Learn is 20 to 23 taps. Me is 14 rows for everyone, and 12 of them are identical.
- She gets a different list in the same long frame. About 60 versions in two weeks added a door for each new feature, and
  none was taken away.

**F2. She is asked twice, then asked to choose again.**
- From install to her first plan step: **42 taps, 6 scrolls, 27 characters typed and 24 screens** (measured today).
- Joining asks 9 screens of questions (18 taps). After her first log, her plan asks its own questions: 5 more screens and 10
  taps. Then come 4 plan cards, the last asking "When do you want to start?".
- On day 1, before any plan, the My plan tab opens on "What do you want to work on?" with 13 to 18 plans and tools.
  - Riya told Sakhi "food and activity" at joining. Her tab still offers Food and activity, Nausea, Iron and tablets, Sleep,
    Worry or low mood, and then more plans.
  - Priya chose "Just tracking", and her tab shows 8 plans and 8 tools.

**F3. The same thing in many places** (day 8, the same page reached from more than one tab):

| Woman | Repeated pages |
|---|---|
| Riya | Her pregnancy plan's page: 5 places (Today ×2, My plan ×2, Explore). This week's page: 5 (Today ×2, My plan, Diary, Explore). Her logs: 2. Pelvic floor: 2 |
| Meera | The recovery check: 4 places. Contraception after birth, the pelvic trainer, check-ups: 2 each |
| Neha | The getting-ready checklist: 4 places. Folic acid: 2 |
| Kavita, Sunita | The symptom diary: 2 to 3 places |
| Every woman with a plan | Help, in both My plan and Explore. My food too, for 6 of the 7 |
| Every woman | The free-care page (`access-free`), from both Explore and Learn |

On one screen, Today has two places to note a feeling: the headline's How I feel button, and the "How do you feel today?"
card with its chips and + More.

**F4. Content follows the book's order, not her day.**
- Today's read during her first 30 days is the first unread article in her stage's chapter (`firstDaysRows`, app.js).
- Riya at 20 weeks and Meera 3 weeks after the birth both get "Pregnant? Register before 12 weeks". Learn's Start here opens
  on the same article.
- Kavita and Sunita both get "Perimenopause: what it is" as Today's first read, though Sunita told Sakhi her periods have
  stopped.

**F5. Rules that drift between modules.**
- Version 39.28 decided that government and ASHA words are only for a woman who picks them. Two places still ignore her
  answer:
  - "Save your ASHA or ANM's number" is in every woman's setup list (`mods/asha.js:78` doesn't check her care answer). Priya,
    Sana and Anjali see it first on Me.
  - Today's setup card shows "Look at free care near you: Free doctors, schemes and helplines" (`mods/access.js:789`). It is
    still there on day 8, under a running plan.
- A 54-year-old in menopause has "Missed period and unplanned pregnancy" on Explore's first screen. That comes from the
  within-2-taps safety rule (PLACES-05), applied to every stage except pregnancy.
- **Most serious:** Sunita, whose periods stopped, has "Period started" as Today's main button. When she taps it she sees
  "Period start saved for today · Undo · Add details". The line that matters, "Any bleeding now needs a check with a doctor,
  even a little", sits in the card above, not at the moment she logs. The feelings card under it still says "A note a day
  shows what repeats in your cycle".

**F6. Today is long, and asks the same thing in different ways.**
- On day 8, Today is 5 to 6 cards, 2.1 to 2.6 screens and 25 to 35 taps.
- For Anjali it holds:
  - the week strip;
  - the headline card, with Period started, Spotting, How I feel and Change stage;
  - the plan card;
  - "How do you feel today?" with 6 chips;
  - "Set up Sakhi for you";
  - "More from Sakhi (2)".
- Anjali also got a "Change stage" tip on day 8, laid over her plan.

**F7. The doctor is everywhere and nowhere.**
- Each woman has 6 to 10 care entry points on her tabs by day 8:
  - Govt. services, Look at free care near you, Save your ASHA's number;
  - check-ups and Screening and check-ups;
  - Your care team (folded), and articles about doctors.
- On day 1 and day 8, none of the 8 has "Ask a Qura doctor" anywhere on her six places outside a fold. The only "Qura" line
  is an article title in Anjali's Learn ("Who treats what").
- The way in is Help → See a doctor → the call form. On 27 Oct that counted 5 taps, plus typing.
- Sakhi has the parts:
  - "Ask Qura to call me" is live (V33);
  - every plan has a doctor path (V39.6);
  - What your diary shows puts "Ask a Qura doctor" first (V39.25), and so does "Who treats what" (V39.53).
- But those parts are spread over many screens and wordings, and the government route reaches her first.

### 2.5 The cause

- Sakhi has 31 modules and 9 kinds of plan (16 plan versions), built in two weeks (about 60 versions since 20 Oct). Each
  decides for itself when to show:
  - `STAGE_TOPICS`, `LEARN_OK`, each module's `setup()` step;
  - For you's rules, "Sakhi says", and each plan's cards and rows.
- So personalising happens module by module, and four things follow:
  - the rules drift (F4, F5);
  - the doors multiply (F3);
  - the shell stays the same for everyone (F1);
  - joining's answers aren't carried into every screen (F2).
- Small fixes, one per walk, have kept each module right on its own terms. They can't fix this: one decision has to sit
  above all the modules.

---

## 3. What the research says

| # | Finding | Source | What it means for Sakhi |
|---|---|---|---|
| 1 | Tailoring works, modestly. Across 88 computer-tailored programmes, effects fell once a programme ended, but programmes that re-assessed people as they went did better over time than those tailored from one assessment | Krebs, Prochaska and Rossi 2010 | Joining's answers aren't enough on their own. Re-tailor as she goes: from her diary, her week and her check-ins, asking each question on the day it matters |
| 2 | Across 40 trials, web tailoring helped (d = 0.14 after, 0.16 at follow-up) | Lustria et al. 2013 | Small gains on each screen add up, if every screen is hers |
| 3 | "Feature fatigue": before use, people pick the product with more features (66%); after using it, most prefer the simpler one (56%; the university's summary). The authors advise fewer features in each product | Thompson, Hamilton and Rust 2005 | A full catalogue looks generous on install and tires her by week 2. Show her part of Sakhi, and keep the rest one search away |
| 4 | Too many choices hurt when the task is hard and her preferences are unclear | Chernev et al. 2015 | No catalogue of 16 plans and tools on day 1. One plan for her goal, with the others behind one row |
| 5 | Aim for *effective* engagement: enough to reach her outcome, not as much as possible | Yardley et al. 2016 | Budget each screen. More cards are not more help |
| 6 | Feedback, the right reminders and support from a coach keep people in mHealth studies. A lack of support and poor usefulness lose them | Amagai et al. 2022 (62 studies) | The companion loop: her steps, a same-day reply, the evening check-in, and a person behind her (a Qura doctor) |
| 7 | Prompts that adapt to her state, and only when they matter | Nahum-Shani et al. 2018 (JITAIs) | The doctor card appears when her data says so. Tips stop after day 3 |
| 8 | Human support works through accountability to someone trusted and expert | Mohr et al. 2011 | A Qura doctor at fixed moments in each plan, not only when something goes wrong |
| 9 | India's free government teleconsultation, eSanjeevani, passed 50 crore consultations on 15 Sep 2026; 57% were with women | Health Ministry, 6 Oct 2026 | The free option exists and is huge. Sakhi doesn't need to keep sending her there. One quiet line is enough, and the government route only for women who choose it |
| 10 | Shared phones are common, and trackers fail when they ignore her life stage | NFHS-5; GSMA 2025; Epstein et al. 2017 | Personalise discreetly (V39.10 keeps the full grid on a shared phone), and never show a stage she has left |

Rows 4, 5, 7, 8 and 10 are already in `docs/companion-journey-2026-10-23.md` (section 3) and the minimalism audit. Rows 1,
2, 3, 6 and 9 are new.

**The principles that follow:**

| # | Principle | In one line |
|---|---|---|
| P1 | Decide once | One profile and one composer for every screen. Modules offer, the composer picks |
| P2 | Her next step, not the catalogue | Each screen leads with what she does next. The full library is one row or one search away |
| P3 | Ask once, then on the day it matters | Joining asks only what day 1 uses. Each later question comes the day its answer changes a step |
| P4 | Her day, not the book's order | Reads, lessons and tools are ordered by her week, her days since the birth, her plan week and her cycle phase |
| P5 | One home for each thing | A page appears in one place on the tabs. Help is the exception: it's on every screen |
| P6 | Safety is never personalised away | Help, the urgent search card, 112 and Tele-MANAS are the same for everyone. Personalising removes clutter, never safety |
| P7 | The doctor, when her data says so | One card at the moment, with the right doctor first. The rest of the time, one known home |
| P8 | Personal on her phone | The composer runs on the phone, from the diary that never leaves it. No server, no model, no new fields. The rules are a table the doctor can read |

---

## 4. The design

### 4.1 Her profile and the composer

```
what she told Sakhi        what her diary shows          where she is
(stage, goals, details,    (findings, red flags,         (plan week and day, pregnancy
 care answer, phone)        logs, check-ins, sleep)       week, days since the birth,
                                                          cycle phase, time of day)
            \                       |                        /
             '------------->  HER PROFILE  <----------------'      (on the phone; read-only for modules)
                                     |
                              THE COMPOSER
       each module offers items: { id, page, home, priority, when(profile) }
       the composer keeps: hers, by priority, within each screen's budget, one home per page
                                     |
     Today · My plan · Diary · Explore (For you) · Learn (Start here) · Me (Set up) · reminders
```

- **The profile is built from state Sakhi already keeps.** That means `situation`, `goals`, `focus`, `intake`, the plan's
  state, `situation.care`, discreet mode, the events and the logs. Nothing new is asked to build it, and nothing leaves the
  phone.
- **The composer replaces the rules spread across modules.** That is `STAGE_TOPICS`, `LEARN_OK`, each `setup()`, For you's
  rules, `leads()` and `firstDaysRows`. It works from one table, the **personalisation map**: for each page, who it's for (stage,
  goal, plan, care answer, week) and its one home.
  - The map is data, like `web/progs/`, so the doctor and Mohit can read it.
  - One test checks it (section 5).
- **Priority for "Sakhi says"**, the one card under her steps:
  1. a safety line;
  2. a doctor finding from her diary;
  3. her plan's moment (week 4, a new part, results);
  4. something due (a tablet, a test, a check-up);
  5. her week's read or lesson;
  6. a setup step that is hers.
- Version 39.47's timing stays: a finding leads for 3 days, then waits under "More from Sakhi" for 7. A card that keeps her
  safe always leads.

### 4.2 Joining, from the first screen

| # | Today: 42 taps, 24 screens | Proposed: about 26 taps, 13 screens |
|---|---|---|
| 1–2 | Language, then "Your period diary, and a plan made for you" | Same |
| 3 | About you: name, decade, year | Same |
| 4 | Her stage: 7 tiles | Same |
| 5 | Her goals: up to 3 | Same. Her first goal names her plan, and the screen says so ("Your plan: My period plan") |
| 6 | Details: her last periods (1.9 screens) or her stage's dates | Same, plus at most 2 of her plan's questions that day 1 needs (for the pain plan, when her pain comes; for food, veg, egg or non-veg). Each plan's day-1 list comes from its `progs` entry |
| 7 | Where she usually goes for women's health | Same, and now used on every screen (F5) |
| 8 | Who uses this phone | Same |
| 9–11 | Sign-up: number, code, PIN code | Same (every woman signs up) |
| 12 | "Your Sakhi": how Sakhi helps; tour or skip | **Your Sakhi becomes her start page.** Her plan by name and length, her first 3 steps, "What's out of your way", "Your doctor: Ask a Qura doctor from Help, any time", and "Start my plan" (with a small "Just my diary for now"). Show me around stays as a link |
| 13–15 | Today, Diary's first-log card, Today's "Ready for you" offer | Today, with her plan running. **Her first log is her first step** ("Note today: 10 seconds"), with its reasons ("Why log every day?") folded in |
| 16–19 | The plan's own questions (4 screens) | Gone from the start. Each question is asked on the day it first matters. Bedtime already joins on day 4 this way (V39.45). Her move time is asked with her first walk, and her food with her first food step |
| 20–23 | 4 plan cards, then "When do you want to start?" | Folded into Your Sakhi. "Start tomorrow instead" is a small link |

- **Exceptions with a reason:**
  - My pregnancy keeps "Before you start" (V39.34, her safety answers) before her first step.
  - The after-birth plan keeps its safety cards for the first weeks.
  - A shared phone in plain words still skips Your Sakhi (PIN first).
- **Women who joined before this:** nothing is asked again. Their plans and diaries are untouched.

### 4.3 Today: one screen

| Part | What it holds | Changes from today |
|---|---|---|
| The week strip | Unchanged | — |
| **Her body today** | Her stage's headline and one row of logging that fits her stage: Period started or ended, and Spotting (cycles, trying, before 45 with periods); This week (pregnancy); Recovery today and Feeding (first 6 weeks after a birth); **Bleeding** after menopause, never "Period started". The day's feeling chips sit in this card | The separate "How do you feel today?" card and the extra How I feel button become one row (F3). After menopause the button says Bleeding, and saving it shows the existing check-up line with the right doctor (F5) |
| **Her day** | Her steps (at most 4) and the check-in line, with the week's look back inside, as built (V39.14, V39.33) | Unchanged |
| **Sakhi says** | One card, by the priority in 4.1 | The setup card, week-done cards and first-days reads all go through it, so it shows one of them at a time |
| More from Sakhi | One quiet row | Unchanged |

- **Tips:** no tips after day 3. "Change stage" stays as a link in the headline.
- **Budget:** at most 1.3 screens and 15 taps, besides the week strip.

### 4.4 My plan

- **With a plan:** the plan page as built (the hero and 4 tiles, folded after week 1).
  - Rows that already have a home elsewhere go: Help is in the top bar.
  - My food's home is My plan while a plan runs, so Explore's For you leaves it out.
- **Without a plan:** the one plan for her first goal, with Start. "Other plans" is one row.
  - The 16-row catalogue and the second "What do you want to work on?" go (F2).
- **"Just tracking":** decision D2. Either no My plan tab until she starts a plan, or the tab with one suggestion.
  - Either way, Today offers a plan when her diary shows a reason (V36's suggestions from her diary).

### 4.5 Diary

- Diary is already personal by stage, and it stays.
- One change: one way to note how she feels everywhere. That is the chips row, with the + menu for more (V39.17's one quick
  set).

### 4.6 Explore and Learn

| Part | What it holds |
|---|---|
| Search | First, unchanged. It still finds everything, for every stage, with the urgent card for danger words (V39.30) |
| **For you** | At most 6 rows: her stage's top 3 questions, her plan's tools that aren't on Today or My plan, and her week's page. The composer leaves out anything that already has a home |
| Her topic | One row (her stage's hub) |
| **All topics and guides** | One row to the library: today's topic grid, Contents, Learn's chapters, Sach ya Myth? |

- **Safety stays within 2 taps (PLACES-05).** The abortion, STI and violence pages move from Explore's grid into Help, which
  is on every screen. Help already holds the helplines and Pregnancy loss.
  - That also takes "Missed period and unplanned pregnancy" off a menopausal woman's first screen.
  - This needs the safety reviewer (decision D3).
- **Learn's Start here, and Today's read, follow her day:**
  - pregnancy articles by her week;
  - after the birth, by days since the birth;
  - in a plan, its lesson for the week (the midlife, period, pelvic floor and getting-ready lessons exist);
  - for cycles, by her goal, then her phase.
  This fixes F4.

### 4.7 Me

- Settings can be the same for everyone.
- "Set up Sakhi for you" lists only her steps: the ASHA number only for a woman who chose ASHA or government care; free care
  as one quiet line otherwise.
- Its home is Me. It reaches Today only as a "Sakhi says" card, when nothing else leads.

### 4.8 The daily companion for diet and lifestyle

The plans already do most of it. Each is a day of 3 or 4 steps:
- food by region, diet, fasting, trimester and breastfeeding;
- moving by level, with rest days and period days;
- sleep and calm by her nights (Wind down, a sound after a hard night);
- her tablets at their time;
- the evening check-in after her last step;
- the 4-week check, month summaries, results and welcome back.

What the composer adds is that her day knows everything Sakhi knows:

- **A reason from her own data.** Today's "Why?" uses her logs where a line exists: "You slept badly 2 nights this week, so
  tonight: slow breaths first", or "Period day 2: your gentle routine". These come from reasons already written in the plans.
  Any new line goes to the doctor.
- **One weekly moment, not several.** On plan day 7 the week's look back and "Plan your week" become one card, and they are
  her only weekly prompt.
- **For a woman without a plan** (decision D5): her cycle, her logging and one "Sakhi says" for her phase. The plan is offered
  when her diary gives a reason, not before.

### 4.9 The doctor ladder

The same 4 rungs in every plan and every stage. At most one doctor card on Today at a time:

| Rung | When | What she sees | Which doctor |
|---|---|---|---|
| 0 Emergency | A danger sign in Help, a danger word typed in search (V39.30), or a "Call 112" answer in a check-in | Help's "Call 112 now" card. Tele-MANAS 14416 first for harm | 112 or the hospital. Unchanged |
| 1 A sign that needs a doctor soon | Her diary's findings (long or late cycles, heavy bleeding, pain that stops her day, Hb below her report's range, night sweats with poor sleep, bleeding after menopause) | One "Sakhi says" card that leads. The right doctor first, then her own doctor's Call if saved, then one quiet free line by her care answer | Set with the doctor for each sign. Qura doctors are BAMS, so any sign that needs a gynaecologist names one (the product vision, section 1) |
| 2 Her plan's doctor moments | Week 4 ("Is it helping?"), the end of 12 weeks (results with her report), a new part (midlife's hormone therapy card), Getting ready's tests | One card at its moment, with her report attached if she says yes | As above |
| 3 Any time | She wants to ask | "Ask a Qura doctor" in My plan's care team and in Help → See a doctor, opening the call form with the topic of the page she came from | A Qura doctor |
| The loop | After any doctor card | "I've seen a doctor", then "What did the doctor say?", and the plan adapts (V39.6; V39.57, being built now, adds "I've seen a doctor" to Today's finding) | — |

- **One label everywhere:** "Ask a Qura doctor", or "See a gynaecologist" where that's the right doctor.
- **Government and ASHA words** only when her care answer is government or ASHA. Otherwise one quiet line: free care exists,
  for example eSanjeevani.
- **Target:** at most 3 taps from any doctor card or from Help to a sent request, with no typing. Today it is 5 taps plus
  typing.

### 4.10 What stays exactly as it is

- Help on every screen, the same for every woman.
- The urgent search card, 112, Tele-MANAS.
- Discreet mode and the shared-phone kit.
- The diary on the phone.
- Every plan's content, as doctor-verified.
- Reminders on by default, in her evening's order (V39.27).
- The 4 am plan day.
- Search finds everything at every stage.
- The minimal baseline in CLAUDE.md, which this extends from plans to the whole app.

### 4.11 When her stage changes (Mohit's case: 22, tracking, jumps to the menopause stages)

Measured with `node test/stagejump-walk.mjs` on 3988720. Priya, 22, joins with 3 periods and period pain. She runs My period
plan for a week, logs her period on day 5, then changes her stage on Today.

**Her records are safe.** Every period, note and check-in stays, and so does her plan history (up to 5 past plans). This is
right, and it stays.

**What else happens today:**

| She picks | What Sakhi does now | What's wrong |
|---|---|---|
| "Periods changing after 40" | Saves it with no question. Today drops her next-period estimate, but Diary still shows "26 days until your next period". Her period plan runs on (steps, 10 pm check-in, 9:15 pm walk). A card offers "My midlife plan may fit now", with Keep. Explore turns to hot flushes, hormone therapy and menopause | Nothing notices she is 22. If she takes the offer, **My midlife plan starts at 22**: hot-flush skills, calcium for bones, then the hormone therapy card (weeks 4 to 7) and checks after 40 (weeks 12 to 16). Today and Diary disagree about her next period |
| "Tracking my periods" again, after the midlife plan ran 2 days | Her estimate returns, and a card offers My period plan. Taking it starts the period plan again at week 1, day 1 | Her first week (7 of 7 days) is kept only as history, and the progress doesn't come back |
| "My periods have stopped" | Saves it with no question, though she is on day 3 of a period. Her periods count as stopped from that period. Today: "CYCLE COUNTING IS OFF". Her period plan runs on. The card offers "My midlife plan may fit now" | **A loop.** Under 40 the midlife plan is held back (the POI hold), so when she picks a goal she lands back on her period plan with no reason given, and the card stays. The reviewed line she most needs ("Periods that stop before 40 are not menopause. See a gynaecologist: it can be POI, which needs treatment, not waiting") is on none of these screens |
| Her next period, 4 weeks later | "Period start saved", and her plan says "Your period came after 28 days". Diary's What it shows says "See a doctor this week: Bleeding after your periods stopped … sometimes an early sign of something that needs treatment soon" | Two opposite messages, and nobody asks the obvious question: "Have your periods come back?" |

**The rules for a stage change** (this belongs in phase A; the lines marked † need the doctor):

1. **Check the stage against what Sakhi already knows, and ask once before saving. Never block.** She may truly have POI, or
   menopause after surgery.
   - **Under 40, picking "Periods changing after 40":** "This is for women around 40 and older. What's happening for you?"
     She chooses one of:
     - "My periods have become irregular": she stays on Tracking, with irregular periods as her goal, which leads to the
       PMOS/irregular plan and a doctor check;
     - "My periods have stopped": the next rule;
     - "I tapped it by mistake": nothing changes.
   - **Under 40, picking "My periods have stopped":**
     - the reviewed POI line first, with Ask a Qura doctor and See a gynaecologist;
     - a pregnancy test first if she could be pregnant †. Sakhi's late-period flow has it;
     - her cycle keeps counting until she taps "My doctor says my periods have stopped". This mirrors the POI hold's "My
       doctor has seen me".
   - **During a period, or with a period in the last 6 weeks †:** "You logged a period on 8 Nov. Have your periods stopped
     since then?" Then nothing is marked stopped from the period she is on now.
2. **Her plan.** Keep today's rule: it is never replaced without her choice. But only offer a plan that fits her age. Under
   40 there is no midlife offer; the POI card leads "Sakhi says", and her period plan runs on. That ends the loop.
3. **Her records.** Keep everything, and ask before re-reading them. When she logs a period after "stopped", ask first:
   "Your period came. Have your periods come back?" Yes means "Track my periods again", with her estimates back. No means the
   doctor card. Under 40, and within a few months, Yes comes first †.
4. **Undo.** The "Updated" toast gets Undo, and every stage gets "Marked by mistake", not only pregnancy. A mistaken change
   puts back her stage, her estimates and her plan where they were. A plan that ran 3 days or less after the mistake is
   dropped, and her earlier plan carries on at its own week instead of starting at week 1.
5. **One truth on every screen.** Today, Diary, Cycles and What your diary shows read the same profile, so they can't
   disagree about her next period (4.1).

---

## 5. How to build it

- **The registry.** Modules stop drawing rows on shared screens. Instead they offer items to the core:
  `S.offer({ id, page, home, prio, when })`.
  - `home` is one of today-says, today-steps, explore-foryou, learn-start, me-setup or plan.
  - The core's `compose(home)` filters items by the profile, sorts them by priority, cuts them to the budget and drops any page
    that already shows in a higher home.
  - This can come in one surface at a time: Today first, then Explore, Learn and Me. Modules not yet moved keep drawing as
    they do now.
- **The profile:** `S.profile()`, read-only, built from state (4.1). Modules read it instead of each working out the stage,
  the week and the care route for itself.
- **The personalisation map:** one data table, beside `web/progs/`, with its own hash (like `progs/baseline.json`). A change to
  who sees what is then a reviewed diff.
- **Tests:**
  - `node test/personal.mjs` (new) checks, for the 8 census women in English and in Hindi, on a shared phone and in discreet
    mode:
    - each screen's budget;
    - no page in two homes;
    - no government or ASHA words without that care answer;
    - reads in the order of her day;
    - Bleeding after menopause;
    - safety within 2 taps for every stage.
  - `node test/census-walk.mjs` reports the before and after.
  - The tap counters (`join-run`, `days-run`, `jobs-run`) measure joining and the daily jobs.
  - `golden` changes only in phase C, where a plan's questions move to their day, and is re-recorded then. The other phases
    don't touch the plans, only what is drawn around them.
- **What doesn't change:** no server, no new fields, nothing new leaves the phone. Women already using Sakhi keep their plans
  and diaries, and only the screens around them change.

---

## 6. Build order

| Phase | What | Size | Notes |
|---|---|---|---|
| **A. Stop the drift** | (1) After menopause, Bleeding instead of Period started, with the existing check-up line when she saves it. (2) Today's read and Learn's Start here by her week and days. (3) The ASHA and free-care setup steps by her care answer. (4) Today: one row for her feeling, and no tips after day 3. (5) My plan without a plan: her goal's plan first, the rest behind one row. (6) Stage changes, by 4.11: the age check, the POI loop, "Have your periods come back?", Undo | S to M, 1 session | After V39.57 lands, since it also touches government words and My plan. All UI words, except (1)'s flow: the doctor confirms which doctor the card names |
| **B. The composer and Today** | The profile, the registry, "Sakhi says" priority, and Today on one screen | M to L | Census and taps before and after |
| **C. Joining that starts her plan** | Each plan's day-1 questions in joining, Your Sakhi as her start page, her first log as her first step, later questions on their day | M | The tap counter: 42 → about 26. `test/joining.mjs` and `firstday.mjs` follow |
| **D. Explore and Learn** | For you (6 at most), the library in one row, safety pages in Help, Learn by her day | M | The safety reviewer, for PLACES-05 |
| **E. The doctor ladder** | Rungs 1 to 3 the same in every plan, one label, the 3-tap request, the government route by her care answer | M | A doctor packet first: which doctor for each sign, and any new lines |
| **F. Field test** | The pilot, with the opt-in "What helps" counts switched on | — | Today `CFG.usage` is never set by `build-apk.sh`, so no build counts anything (`docs/activity-tracking-advice-2026-11-02.md`). Without that, we can't learn what women actually use |

- Each phase is one fresh session, checked at 360 × 800, in Hindi, on a shared phone and in discreet mode.
- Phases A and D are routine (Sonnet is enough). Phases B, C and E need the careful setting (safety and the doctor).

---

## 7. How we'll know it works

| Measure | Today (3 Nov) | Target |
|---|---|---|
| Today on day 8 | 25–35 taps, 2.1–2.6 screens, 4–6 cards | 15 taps or fewer, 1.3 screens, 3 cards |
| Explore | 22–24 taps, 2.6–2.9 screens | 12 taps or fewer, 1.3 screens |
| All six places on day 8 | 143–171 taps, 12.6–13.6 screens | 90 taps or fewer, 8 screens |
| A page in two places on the tabs (Help aside) | 2 to 8 for each woman | 0 |
| Lines that aren't hers (government words without that care answer, reads out of her week, a period button after menopause) | Found for every woman we joined | 0 |
| Install to her first plan step | 42 taps, 24 screens | About 26 taps, 13 screens |
| Ask a Qura doctor, from a doctor card or from Help | 5 taps and typing (27 Oct) | 3 taps or fewer, no typing |
| In the field (pilot, opt-in counts) | Not measured | Back on day 2 and day 7; plan days in week 1; check-ins a week; doctor requests per finding |

---

## 8. Decisions for Mohit

| # | Decision | My recommendation |
|---|---|---|
| D1 | Joining ends with her plan running, and her first log becomes her first step. This replaces Version 39.10's order: first log, then the plan offer, then the plan's questions | **Yes.** It cuts about 16 taps and 11 screens. Her diary still starts on day 1 |
| D2 | A woman who chose "Just tracking": no My plan tab until she starts a plan, or the tab with one suggestion | **No tab until she starts one.** Today and Explore offer the plan when her diary gives a reason. Every other woman keeps the tab, with her goal's plan first |
| D3 | Explore's library behind one row ("All topics and guides"), with the abortion, STI and violence pages moving into Help so they stay within 2 taps | **Yes,** after the safety reviewer agrees |
| D4 | The doctor ladder (4.9): one doctor card at a time, the right doctor first, "Ask a Qura doctor" as the one home, government words by her care answer | **Yes.** The doctor packet comes first, especially which signs go to a gynaecologist |
| D5 | For a woman without a plan: nothing new (her cycle and one "Sakhi says" for her phase), or a light weekly habit | **Nothing new for now.** Look again after the field test's counts |
| D6 | Order: A now (after V39.57), then B to E, one per session | **Yes.** A is small and fixes the visible slips first. B decides how everything else is built |
| D7 | A stage that doesn't fit her age (4.11): ask once, or block | **Ask, never block.** A 22-year-old can truly have POI, or menopause after surgery. Under 40, "periods stopped" leads with the POI line and a doctor, and her cycle keeps counting until a doctor confirms. The doctor confirms the lines marked † |

---

## Appendix A. The census, every screen

Things to tap / screens tall / cards. Full lines: `web/test/shots/census/items.txt`. Screenshots: `web/test/shots/census/*.png`.

| Woman | Day | Today | My plan | Diary | Explore | Learn | Me | All six |
|---|---|---|---|---|---|---|---|---|
| Priya | 1 | 25 / 2.1 / 5 | 16 / 2.1 / 1 | 52 / 2.3 / 2 | 24 / 2.8 / 0 | 23 / 2.2 / 0 | 14 / 1.7 / 1 | 154 / 13.2 |
| Sana | 1 | 25 / 2.1 / 5 | 16 / 2.4 / 1 | 52 / 2.3 / 2 | 24 / 2.9 / 0 | 23 / 2.2 / 0 | 14 / 1.7 / 1 | 154 / 13.6 |
| Anjali | 1 | 25 / 2.1 / 5 | 14 / 1.9 / 1 | 52 / 2.3 / 2 | 24 / 2.9 / 0 | 22 / 2.0 / 0 | 14 / 1.7 / 1 | 151 / 12.9 |
| Neha | 1 | 25 / 2.2 / 5 | 14 / 2.0 / 1 | 52 / 2.3 / 2 | 23 / 2.7 / 0 | 20 / 1.9 / 0 | 14 / 1.7 / 1 | 148 / 12.8 |
| Riya | 1 | 20 / 1.6 / 4 | 11 / 1.7 / 1 | 38 / 1.4 / 3 | 22 / 2.6 / 0 | 20 / 2.2 / 0 | 14 / 1.7 / 1 | 125 / 11.2 |
| Meera | 1 | 19 / 1.4 / 4 | 15 / 2.2 / 1 | 38 / 1.5 / 2 | 23 / 2.8 / 0 | 21 / 2.2 / 0 | 14 / 1.7 / 1 | 130 / 11.8 |
| Kavita | 1 | 26 / 2.2 / 6 | 18 / 2.5 / 1 | 51 / 2.1 / 2 | 22 / 2.7 / 0 | 20 / 2.2 / 0 | 14 / 1.7 / 1 | 151 / 13.4 |
| Sunita | 1 | 26 / 2.2 / 6 | 17 / 2.4 / 1 | 38 / 1.5 / 2 | 22 / 2.6 / 0 | 20 / 2.2 / 0 | 14 / 1.7 / 1 | 137 / 12.6 |
| Priya | 8 | 25 / 2.1 / 5 | 16 / 2.1 / 1 | 52 / 2.3 / 2 | 24 / 2.8 / 0 | 23 / 2.2 / 0 | 14 / 1.7 / 1 | 154 / 13.2 |
| Sana | 8 | 31 / 2.3 / 6 | 21 / 1.9 / 5 | 52 / 2.3 / 2 | 24 / 2.9 / 0 | 23 / 2.2 / 0 | 14 / 1.7 / 1 | 165 / 13.3 |
| Anjali | 8 | 35 / 2.4 / 6 | 24 / 2.3 / 5 | 52 / 2.3 / 2 | 24 / 2.9 / 0 | 22 / 2.0 / 0 | 14 / 1.7 / 1 | 171 / 13.6 |
| Neha | 8 | 33 / 2.5 / 6 | 25 / 2.4 / 5 | 52 / 2.3 / 2 | 23 / 2.7 / 0 | 20 / 1.9 / 0 | 14 / 1.7 / 1 | 167 / 13.5 |
| Riya | 8 | 27 / 2.2 / 5 | 22 / 2.5 / 6 | 38 / 1.4 / 3 | 22 / 2.6 / 0 | 20 / 2.2 / 0 | 14 / 1.7 / 1 | 143 / 12.6 |
| Meera | 8 | 27 / 2.1 / 6 | 20 / 2.4 / 5 | 38 / 1.5 / 2 | 23 / 2.8 / 0 | 21 / 2.2 / 0 | 14 / 1.7 / 1 | 143 / 12.7 |
| Kavita | 8 | 32 / 2.5 / 6 | 23 / 2.2 / 5 | 51 / 2.1 / 2 | 22 / 2.7 / 0 | 20 / 2.2 / 0 | 14 / 1.7 / 1 | 162 / 13.4 |
| Sunita | 8 | 32 / 2.6 / 6 | 23 / 2.2 / 5 | 38 / 1.5 / 2 | 22 / 2.7 / 0 | 20 / 2.2 / 0 | 14 / 1.7 / 1 | 149 / 12.9 |

- Explore and Learn count no cards because they are made of rows and tiles.
- The Help sheet is 7 rows for every woman.
- There were 0 page errors in 16 walks.

Joining, measured today (job 12, the cycle woman, tour skipped), as taps / screens after each part:

| Part | Running total |
|---|---|
| language and hello | 2 / 3 |
| about you | 5 / 4 |
| stage | 6 / 5 |
| goals | 8 / 6 |
| details | 16 / 7 |
| care | 17 / 8 |
| phone | 18 / 9 |
| sign-up | 23 / 12 |
| Your Sakhi | 24 / 13 |
| first log | 27 / 15 |
| plan questions | 37 / 20 |
| plan cards and Start | 41 / 24 |
| the first tip | 42 / 24 |

## Appendix B. Sources

- Krebs P, Prochaska JO, Rossi JS. A meta-analysis of computer-tailored interventions for health behavior change. *Prev Med*
  2010;51:214–221. https://pmc.ncbi.nlm.nih.gov/articles/PMC2939185
- Lustria MLA et al. A meta-analysis of web-delivered tailored health behavior change interventions. *J Health Commun*
  2013;18:1039–1069 (an erratum exists). https://informahealthcare.com/doi/full/10.1080/10810730.2013.768727
- Thompson DV, Hamilton RW, Rust RT. Feature fatigue: when product capabilities become too much of a good thing. *J Mark
  Res* 2005;42:431–442. https://www.rhsmith.umd.edu/news/feature-fatigue-research-proves-simpler-products-are-better-manufacturers-advised-lose-extra
- Amagai S et al. Challenges in participant engagement and retention using mobile health apps: literature review. *JMIR*
  2022. https://pmc.ncbi.nlm.nih.gov/articles/PMC9092233
- eSanjeevani crosses 50 crore teleconsultations (Health Ministry, 6 Oct 2026).
  https://newsonair.gov.in/esanjeevani-achieves-milestone-of-50-cr-teleconsultations-from-across-the-country/ ;
  https://www.digitalhealthnews.com/women-account-for-57-14-of-esanjeevani-teleconsultations-as-platform-crosses-50-cr-mark
- Already cited in `docs/companion-journey-2026-10-23.md` (section 3) and `docs/minimalism-audit-2026-10-27.md` (Appendix
  D): Yardley et al. 2016, Chernev et al. 2015, Nahum-Shani et al. 2018, Mohr et al. 2011, Baumel et al. 2019, NFHS-5,
  GSMA 2025, Epstein et al. 2017.
