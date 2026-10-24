# Sakhi as her companion: research and the journey to build (23 Oct 2026)

Mohit, 23 Oct:
> "UX and UI is still a little confusing. When i onboard then only it should clearly understand my needs and then personalize
> entire experience. App feels too many things but disintegrated, do proper research and advise how to bring best user
> exerience"

> "assume i join this app today and start using it how it will act as my companion in order to achieve my goal for example
> assume today i have 40-45 days apart period sometime a month gets skipped, this app should take me to atleast 50-60%
> improvement by helping me correcting diet,exercise,routine sleeping etc. in 12 weeks being a constant companion and guide
> pushing me to log what i did what i didnt did and how its gonna impact me"

> "you are free to add or remove whatever you feel right and yes will rollout with 8-10 women when this matches my vision"

**Status (24 Oct): Version 37, the companion core (section 12), is built and tested, not yet on testers' phones.** Mohit said
"Build" on 23 Oct. The module contract is `web/MODULE_API.md`, section 39; the acceptance tests are `web/test/companion.mjs`;
the new wording for the doctor is `docs/wording-review-v28.md`, section 14. Testers wait for that review. Still to come:
plans for every goal in full (V38), and results with human follow-up (V39).

What changed from this plan while building:
- **The tour:** each screen keeps its own short first-visit tip, as section 9 says; the 14-step full tour is gone for new
  women but stays in Me > How to use Sakhi.
- **"Set up Sakhi for you":** kept, but as one step at a time inside the slot.
- **The fold's quick answers:** they moved to Explore ("Your questions"), with the voice search, as section 9 says.
- **The PMOS self-check:** joining asks its sign questions and shows them on the reveal, but doesn't save them as a
  self-check yet (V38).

This started as research and advice. Other apps are described by their principles only: no screen-by-screen walkthroughs
(Mohit's rule). Measurements come from `0.36-pilot`, run on a 390 px phone screen on 23 Oct.

---

## 0. The answer on one page

**Today Sakhi is a library with a diary attached.** It has 26 care areas and 120 tools, and every Home shows 9 to 12 cards from
different modules. It learns her stage when she joins, but not her goal. Nothing connects what she does today to what she wants.

**Build one thing: a companion loop around one goal she picks when she joins.**

1. **Joining becomes an intake (about 4 minutes).** Her goal, where she is now, her day (food, movement, sleep, work), and when
   she can act. It ends with **"Here's your plan, Riya"**: her own words reflected back, what the 12 weeks hold, what to expect
   honestly, a safety check, and the first three things for today.
2. **Every day, Today shows two or three small actions** for her goal. One evening check-in takes 30 seconds: done, partly or
   not today, and one line on what it did for her.
3. **Every week, a one-minute look-back.** What went well, what got in the way, and the next week adjusts.
4. **Every period, an honest comparison** with where she started. Gaps, skipped months and signs.
5. **A doctor at fixed moments:** at the start when the signs need one (skipped months), at any red flag, and at week 12 if
   nothing has changed. Help is also always one tap away.

**The structure follows the loop.**
- **Navigation:** 4 tabs (**Today, My plan, Diary, Explore**), a **Help** button, read-aloud and Me. Today there are 5 tabs and
  4 header buttons.
- **Explore:** holds all 120 tools, findable by search, and never pushed onto Today.
- **Today:** has one "Sakhi says" slot that picks the single most important thing from every module.

**What goes:**
- the 14-step tour;
- the generic setup card;
- five different "for you" sections;
- the doctor banner on every Home;
- the separate Help and Plans tabs;
- the 21-day journeys running as programmes beside the plan (their content moves into the plans).

**Is 50–60% realistic?** The best trial matches it: a coached 4-month lifestyle programme for women with PCOS improved periods
in **59% of women, against 24% without it** (Oberg 2018). That needed real coaching, and it was measured at 4 months, not 3. So
the plan runs 12 weeks, the result is checked at month 4, and human support sits at the decisive moments. The 50–60% is **our
target to measure in the field test**. It is never promised to her: Indian law limits claims about correcting menstrual
disorders.

---

## 1. The goal, restated

Riya, 26, joins today. Her periods come 40 to 45 days apart, and some months they skip. For the next 12 weeks Sakhi should:
- **turn that into a goal she owns:** more regular periods;
- **guide her day by day** on food, movement, sleep and routine, in small steps that grow;
- **ask what she did and didn't do,** and tell her plainly what each habit does for her body;
- **show her progress** from her own diary: habits within days, her cycle over months;
- **get her to a doctor** when her signs say so, or when lifestyle isn't enough;
- **feel like one companion,** not 26 tools.

The same loop then serves every other goal: painful or heavy periods, PMS, PMOS signs, weight, trying, pregnancy, after a
birth, and 40+ (section 8).

---

## 2. What is wrong today (measured)

| What | Measured on 0.36-pilot |
|---|---|
| Screens before Home | 11: 8 joining (language, welcome, birth decade, birth year, stage, last period, help, shared phone) + 3 sign-up |
| First run | A 14-step tour of buttons across 5 screens (Home 3, Diary 3, Care 3, Help 2, Me 3). It ends on the Me settings page, with "Delete everything" in view |
| Her answers on her first Home | She picked "painful" and "irregular". One card in seven reflects it, mid-page, under a generic 5-step setup card |
| Home for the five sample women | 9 to 12 cards, 37 to 39 things to tap, 200 to 300 words, 2.3 to 3 phone screens long |
| Always-on navigation | 9 controls: 5 tabs (Home, Diary, Plans, Care, Help) + Doctor, read-aloud, language, Me |
| Care | 120 tools in 17 sections; the page is 2.7 screens long |
| Help | 17 blocks, 400 words, 4 screens: the safety guide and the tour menu mixed together |
| "For you" | Five places: Care's For you, Plans for you, More for you, Set up Sakhi for you, A plan for you |
| Ways to a doctor | Seven: the Doctor button, Help's doctor card, Home's Qura card, Care's "Talk to a Qura doctor", Ask Qura to call me, the plan's "Ask a Qura doctor", the free government doctor |
| The same thing twice | Asha (regular cycles) is offered the 3-minute cramps routine twice on one Home. Meera's pregnancy plan appears in her hero, in "A plan for you" and first in For you |
| Parallel programmes | The 12-week plan, two 21-day journeys, five relief routines, the pregnancy plan, the pelvic floor course and iron tablets each bring their own reminders, Today items and setup steps |

**Root cause.** The product vision of 18 Oct planned "one diary plus context flags, not five products". It also planned "one
home card that changes with her situation" and about 35–40 screens. Each version since then added a module with its own Home
card, tile, setup step and tour. Each was right on its own, but nothing ranks them against each other or ties them to a goal.
Sakhi now has 118 screens with their own address, 165 counting the week and routine pages.

---

## 3. What the research says

### 3.1 How companions keep people going

| # | Finding | Source | What it means for Sakhi |
|---|---|---|---|
| 1 | Aim for **effective** engagement: enough to reach the outcome, not as much as possible | Yardley et al. 2016; Perski et al. 2017 | Two or three actions a day and one check-in. More cards are not more help |
| 2 | Self-monitoring works best with goals, feedback and review together (effect 0.42 against 0.26 without) | Michie et al. 2009, 122 evaluations | Every action has a goal, she logs it, she gets feedback the same day, and reviews weekly |
| 3 | "When and where" plans roughly double follow-through (d = 0.65) | Gollwitzer and Sheeran 2006, 94 tests | When the plan starts, ask "When will you walk? After dinner, morning, evening tea" |
| 4 | Habits take a median of **66 days** to become automatic (range 18 to 254), measured in a 12-week study | Lally et al. 2010 | 12 weeks is the right length. Some women need longer, so "keep going" follows week 12 |
| 5 | Most health-app users leave within weeks: median 30-day retention 3.3%, trackers 6.1% | Baumel et al. 2019, 93 apps | The first week decides everything: value on day 0, a win on day 1, a reason to come back tomorrow |
| 6 | Human support raises completion (about 12% more finish) through accountability to someone trusted and expert | Psychological Medicine meta-analysis 2021/22; Mohr et al. 2011 | A Qura doctor or coordinator at fixed moments; her ASHA for free government care |
| 7 | A caring character helps: a relational agent coach increased walking over 2 months | Bickmore et al. (geriatric walking trial) | Sakhi speaks as one warm companion, uses her name, and remembers what she said |
| 8 | Light game elements help a little (g = 0.42; 0.23 against an active comparison) | Mazeas et al. 2022, 16 trials | Keep the petal garden as a quiet daily reward. No leaderboards |
| 9 | A broken streak makes people stop; a chance to repair it softens that | Silverman and Barasch (consumer streaks) | Count "days this week", never "you broke your streak". Offer a fresh restart |
| 10 | New beginnings motivate: new week, new month, after a landmark | Dai, Milkman and Riis 2014 | Start plans on a day she picks. Offer a restart on Monday, the 1st, or after her period |
| 11 | A head start and visible effort raise commitment (34% vs 19% completed a card with 2 free stamps) | Nunes and Drèze 2006; Buell and Norton 2011 | The plan reveal shows how her answers shaped the plan, and day 1 starts with "joined" already ticked |
| 12 | Too many choices hurt when the task is hard and preferences are unclear | Chernev et al. 2015 | One main goal, one path. Everything else waits in Explore |
| 13 | A single guided path helped new users understand what to do | Duolingo's 2022 path redesign | My plan is one path of 12 weeks, not a grid of tools |
| 14 | Timely, personal reminders beat random ones (+2% new-user retention) | Yancey and Settles 2020 (Duolingo) | One daily reminder at her chosen time, with its words chosen by her progress |
| 15 | Prompts should adapt to her state and avoid needless nudges | Nahum-Shani et al. 2018 (JITAIs) | Nudge only for things that matter now: no check-in yet, period due, a dose due, a red flag |

### 3.2 Her goal: irregular periods

| Finding | Source |
|---|---|
| A healthy lifestyle is first-line for every woman with PMOS (PCOS), with no single diet. Women carrying extra weight aim for about 5% weight loss | 2023 international PCOS guideline; FOGSI practice points (India) |
| Even modest loss (2–5%) can improve ovulation and regularity | FOGSI practice points |
| **RCT, 68 women (BMI 27+), 4-month coached programme:** periods improved in **59% vs 24%**; regular cycles 32% vs 21%; weight down only 2.1% | Oberg, Hirschberg et al. 2018, *Clinical Endocrinology* |
| Weight-loss trials together: **2.6 more periods a year** on average, with 3.8 kg lost | 2024 meta-analysis of randomised trials |
| App-led programmes improve weight, diet and exercise adherence (Korea 12 weeks, n = 28; China, n = 122) | Lee and Lee 2023; Wang et al. 2022 |
| Night work goes with irregular and long (32–50 day) cycles | Nurses' Health Study 3, 2015 |
| Normal cycles are 24–38 days apart; more than 38 is "infrequent" | FIGO 2018 |

**What this means:** food and movement carry the evidence. Sleep and routine are supported by association; they help her
energy and are safe to include. The change shows over 3 to 6 months. Coaching roughly doubles the effect.

### 3.3 India

| Finding | Source |
|---|---|
| Only 54% of women aged 15–49 had a phone they themselves use, and 33% had ever used the internet (2019–21) | NFHS-5 |
| In South Asia, 76% of women own a mobile and 51% use mobile internet (2025) | GSMA Mobile Gender Gap 2025 |
| Stage-timed voice messages reached many women but changed behaviour only a little. In Kilkari, 65% heard half the content, and the gains were small | Kilkari RCT 2022 (LeFevre et al.); mMitra evaluation |
| PCOS apps score middling (MARS 3.6 of 5), weakest on engagement. Women want current, evidence-based information | JMIR 2025 review of 15 apps; Ask PCOS |
| Period trackers fail when predictions are wrong and when they ignore life stages | Epstein et al. 2017 (CHI) |

**What this means:**
- **Shared phones are normal:** discreet mode, neutral notifications, and a PIN.
- **Pictures and voice beat text.**
- **One-way messages aren't enough:** the loop has to be two-way, with her logging and Sakhi answering.
- **Sakhi's edge** is doctor-reviewed content plus a companion. No app reviewed does both well.

---

## 4. What other apps do (principles only)

| Kind of app | Example | The principle | What the evidence shows | Sakhi takes | Sakhi avoids |
|---|---|---|---|---|---|
| Coached weight programme | Noom | A long intake becomes a personal plan; short daily lessons; logging; a coach | Observational: 78% of 35,921 users reported weight loss; logging dinner was the strongest predictor (Chin 2016) | Intake that shapes the plan; logging the one behaviour that matters; short daily lessons | Projected weight dates; paywalled quizzes |
| Habits and learning | Duolingo | One clear path, a daily goal, streaks with repair, reminders tuned to the person | The path was "to make it so that new users understood"; reminder tuning +2% new-user retention | One path, one daily goal, one smart reminder, forgiving counts | Guilt and loss-framed nagging |
| Activity rings and points | Apple Watch rings; Google Fit Heart Points | Simple daily targets, frequent feedback, a target suggested weekly, goals based on WHO | Wearables help modestly on average; daily all-or-nothing rings are criticised for having no rest days | Minutes ring; weekly target that adapts; rest days | Daily all-or-nothing |
| Structured programme | NHS Couch to 5K | A fixed weekly progression with an audio coach | One study: 27% finished, and dropout was linked to the progression and injury | Weekly steps; voice | Rigid jumps. Sakhi adapts to the week she had |
| Digital plus human | Omada (diabetes prevention) | Coach, group, lessons, and a scale | Single-arm study: about 4.9% weight loss at one year | Human support at key moments | Hardware and cost |
| India: PCOS care programmes | Veera Health; MyTatva | A care team (gynaecologist, nutrition, skin, mind) and a care manager, in paid 3–6 month plans (from about ₹2,333 a month) | Outcomes are self-reported only | The care-team idea: Sakhi, a Qura doctor and her ASHA | Paywall; claims without evidence |
| India: digital therapy | Fitterfly | A 90-day coached programme | Observational: more engagement went with better results | The 90-day horizon; tying engagement to her result | — |
| Government messaging | Kilkari; mMitra | Stage-timed voice messages | Wide reach, small effects | Stage-timed content in her language, with voice | One-way broadcast with no loop |

**What the best ones share:**
1. A goal she picks.
2. A plan built from her answers that she can see.
3. One small daily action, logged in seconds.
4. Feedback the same day.
5. A weekly review that adjusts.
6. Progress she can see.
7. A human when it matters.

Sakhi has most of these parts already, scattered across modules. The work is to join them into one loop.

---

## 5. Positioning, problems and people

**Positioning.** For Indian women 18+ who want to fix a reproductive-health problem (irregular, painful or heavy periods, PMOS
signs) or get through a life stage (trying, pregnancy, after a birth, 40+), Sakhi is a free companion in Hindi and English. It
turns her goal into a personal 12-week plan, guides her every day, shows her progress from her own diary, and brings in a
doctor when she needs one.
- **Unlike period trackers,** which only predict dates.
- **Unlike paid programmes,** which sell plans and kits.

Sakhi is free and private (the diary never leaves her phone), and honest about what lifestyle can and can't do.

This keeps the vision of 18 Oct: one diary, a doctor behind it, Hindi first, discreet, free, honest. It adds what was missing:
a goal, and a companion that walks her towards it.

**Her problem.** Women with irregular periods get general advice ("lose weight, exercise") but no day-by-day guidance that
fits their lives. They have no way to see whether it's working and no one keeping them on track. So most stop within weeks,
and many see a doctor late.

**Sakhi's problem.** The parts are there (diary, plans, routines, guides, doctors), but they don't form a journey. She can't
tell what to do today, why, or whether it's working.

**People.** These are hypotheses until the field test.

| Who | Goal | What decides it for her |
|---|---|---|
| **Riya, 26** (primary) | Periods 40–45 days apart, some months skipped, not diagnosed. Works, shares her phone sometimes, Hindi and English | Seeing early wins in her habits; hearing the truth about timelines; a doctor check she can afford (free) |
| Priya, 27 | Diagnosed PMOS, trying for a baby | A plan that respects trying; when to see a gynaecologist |
| Asha, 31 | Regular cycles, period pain, on the pill | Less pain; pill reminders |
| Meera, 29 | 24 weeks pregnant | The week-by-week plan, tablets, danger signs |
| Sunita, 33 | Baby 3 weeks old, breastfeeding | Recovery, the pelvic floor, mood |
| Kamla, 48 | Periods changing, hot flushes | Hot flushes, sleep, bones |

---

## 6. Riya's 12 weeks

**Day 0: joining (about 4 minutes)**
- She picks Hindi, then "My periods", then **"Make my periods regular"**.
- Sakhi asks how far apart her periods usually are ("40 to 45 days", "some months skip"), when the last one started (5 weeks
  ago), and whether a doctor has said PMOS ("not sure"). It asks about extra hair, acne or dark patches on the neck: she ticks
  acne. These are the PMOS self-check's own questions, so the self-check is done as part of joining.
- **Her day:**
  - she hardly exercises;
  - she's vegetarian;
  - she sleeps at 12:30 and wakes at 7;
  - she works days;
  - she wants a reminder at 8 pm.
  She'll walk **after dinner**. Height and weight are optional, and she skips them.
- She shares her phone sometimes, so discreet words are turned on.
- **"Save your plan"**: her mobile number, the code, her name and PIN code.
- **"Here's your plan, Riya":**
  - **Your goal:** more regular periods (now about 40–45 days apart, some months skipped).
  - **For 12 weeks:**
    - walking that grows from 10 minutes a day;
    - one food change every two weeks, starting with half the plate sabzi;
    - in bed by 12, then 11:30.
  - **What to expect:** more energy in weeks 1 to 4, and habits get easier by week 12. Periods may become more regular over 3
    to 6 months. "It's different for every woman."
  - **First, a check:**
    - "Periods that skip months need one doctor check: thyroid, prolactin, and whether it's PMOS."
    - "If your period is late and you could be pregnant, do a test first."
    - Buttons: Free government doctor · Free call with a Qura doctor · Remind me later.
  - **Today:** walk 10 minutes after dinner · half your plate sabzi at dinner · in bed by 12.

**Day 1**
- Today shows her three actions. At 8 pm the reminder says "Your plan for today" (neutral on a shared phone).
- She taps done for the walk and the plate, and "not today" for sleep.
- Sakhi answers: "2 of 3 today. Walking after a meal helps your body use sugar better, and that matters for regular periods."
  A petal for her garden.

**Week 1**
- The same three actions, so the habit can form.
- **Day 3:** one short "why" card ("Why your plate matters for your cycle").
- **Day 7: the look-back.** "You walked 4 of 7 days. How was your energy? What got in the way?" She answers "no time". The
  tip: two 5-minute walks count. Next week: 15 minutes, and protein at breakfast joins.

**Weeks 2–4**
- One new food habit every two weeks, the six habits of the V35 plan.
- Movement builds towards 150 minutes a week, plus two short strength days with moving pictures.
- **A lapse:** three days with no check-in, then Sakhi says: "Shall we start again small? Just today's walk." No streak to
  lose, and Monday offers a fresh start.
- **Her period comes on day 26.** She logs it, and Sakhi compares honestly: "This gap: 44 days. Your usual: 40–45. Change
  usually shows after 3 to 6 months. Your habits are on track: 9 of 14 walks."
- **Week 4, month 1 review:**
  - her habits, energy and sleep compared with week 1;
  - "Did you get the doctor check?";
  - an option to talk to a doctor.

**Weeks 5–8**
- **Holding on:**
  - routines change so they don't get boring;
  - a sleep step joins (same wake-up time on weekends);
  - she gets a short card on stress and the cycle.
- **Week 6:** an optional free call with a Qura doctor about her progress, with her summary if she chooses to share it.
- **Week 8:** If no period has come for 90 days at any point, Today's slot shows the doctor message first, above everything
  else.

**Weeks 9–12**
- The last two food habits (snack, oil). The targets hold. "You're doing what helps."

**Week 12: results**
- **Before and since:** habits (minutes, food habits, sleep), cycle gaps before and since she started, skipped months,
  energy, and waist or weight if she noted them.
- **Next:**
  - Keep going: same plan, light reminders.
  - A new goal.
  - Talk to a doctor about my results (suggested first if her cycle hasn't changed).

**Month 4 to 6: the follow-up**
- "How have your periods been?" Her gaps against the start. This is where the 50–60% target is measured, per Oberg 2018.

**If her life changes:** a positive test pauses the plan and starts the pregnancy journey. Loss, a birth or 40+ change the
journey the same way, with one "new chapter" screen that says what changes.

---

## 7. The new app

### 7.1 Navigation

| Now | New |
|---|---|
| Tabs: Home · Diary · Plans · Care · Help | **Today · My plan · Diary · Explore** |
| Header: Doctor · read-aloud · language · Me | **Help** (doctor, 112, safety guide, talk to a person) · read-aloud · **Me** (language moves here) |

Four tabs match the vision's own plan (Today, Diary, Help, Me), with Help moved to the header so it's always one tap away.

### 7.2 Joining

| # | Screen | Why |
|---|---|---|
| 1 | Language | Keep |
| 2 | Welcome: "I'm Sakhi. I'll help you, one small step at a time." Start · Just read | Sets the companion role |
| 3 | Birth year | Keep: the under-18 rule |
| 4 | What's happening now? (stage) | Keep |
| 5 | **What do you want to work on first?** One main goal for her stage, or "Just track my periods" | One plan, one path (research rows 12–13) |
| 6–7 | **Goal questions** (2–3 per goal). For regular periods: usual gap, skipped months, last period, diagnosis, signs | Her baseline; the PMOS self-check folds in |
| 8 | **Your day:** activity, food, sleep and wake times, work (days, nights, at home), reminder time | The plan fits her life; night work matters (NHS3) |
| 9 | **When will you do it?** ("After dinner") | Implementation intention (d = 0.65) |
| 10 | Body (optional): height, weight, waist | BMI and waist with the Indian cut-offs; skippable |
| 11 | Does anyone else use this phone? | Keep |
| 12–14 | **Save your plan:** number, code, name and PIN code | Same sign-up, but now it saves something she made |
| 15 | **Your plan** (the reveal, with the safety check) | Decisive moment 1 |

- **Length:** about 4 minutes. A progress bar says "about 3 minutes left".
- **Optional questions:** each says so, and shows how its answer changes the plan.
- **Saving progress:** answers are saved after every screen, so a call or a switch to WhatsApp for the code doesn't lose them.
  Today they live only in memory.

### 7.3 Today

At most five blocks, always in this order:
1. **Greeting:** "Good evening, Riya · Week 2, day 10". Cycle day as a chip, with discreet words when shared.
2. **Today's plan:** her 2–3 actions with tick circles, plus one row to note her day (period, symptoms, mood).
3. **This week:** seven day dots and the minutes ring ("48 of 75 minutes"). A tap opens My plan.
4. **Sakhi says:** one slot, ranked across all modules:
   1. safety (red flags, danger signs);
   2. due today (tablets, pills, a check-up);
   3. her period (heads-up, late);
   4. the plan (look-back due, restart);
   5. anything else.

   Everything not shown waits in My plan or Diary.
5. **Evening:** after her reminder time, block 2 becomes **"How did today go?"**

No setup card, no doctor banner, no "More for you" fold. The doctor appears when there's a reason, and Help is always there.

### 7.4 The evening check-in (decisive moment 2)
- **One screen, under 30 seconds:** each action gets done, partly or not today. If not, one tap on what got in the way.
- **Feedback names the habit and her goal:** "Walking after a meal helps your body use sugar better. That matters for regular
  periods." The line is from doctor-reviewed content and changes daily.
- **The tally:** a petal in her garden, and "5 of 7 days this week". Never a broken streak.

### 7.5 My plan

1. **The path:** 12 weekly stops. Each shows that week's focus; finished weeks show what she did, and the current week is lit.
2. **Results:**
   - habits (minutes, food habits, sleep) as charts;
   - her cycle gaps against her starting point;
   - skipped months and signs from check-ins;
   - waist or weight only if she noted them;
   - "What to expect" as a timeline.
3. **Weekly look-back** (exists in V35): energy, what got in the way, one tip, next week's target.
4. **Your care team:**
   - her free government doctor and her ASHA's number;
   - a Qura doctor, with "Ask Qura to call me" and her summary, which she ticks;
   - the doctor moments (section 10).
5. **Plan settings:** change goal, reminder time, pause (travel, illness), start again.

### 7.6 Diary
Keep: calendar, trends, days. Plan check-ins show as dots on the calendar, so the diary and the plan read as one record.

### 7.7 Explore
- **Search first.** Then:
  - **For your goal** (3–5 tools tied to her plan);
  - **Your stage**;
  - **All topics** (the 13 life topics);
  - **Govt. services** (one row);
  - **Learn** (articles);
  - **Just for fun** (myth quiz).
- **Plans:** other plans she can switch to sit here too.

### 7.8 Help (header)
One sheet:
- **Emergency:** call 112.
- **See a doctor:** free government doctor, or a free call with a Qura doctor.
- **Talk to a person.**
- **The safety guide:** "When to see a doctor".

The tours menu moves to Me ("How to use Sakhi").

### 7.9 Me
Profile, privacy on a shared phone, reminders, language and read-aloud, my data, how to use Sakhi, about.

### 7.10 Notifications
- **By default, one a day,** at her time: "Your plan for today". Neutral in discreet mode.
- **Also:**
  - the period heads-up and the late nudge (V34);
  - reminders she sets (pills, tablets, check-ups);
  - the Sunday look-back.
- **Never** more than two a day.
- **No WhatsApp:** no health data goes to Meta, so the companion lives in app notifications.

### 7.11 Sakhi's voice
- **Where Sakhi speaks as "I":** her companion moments only (greeting, the reveal, feedback, the look-back). For example: "I'll
  remind you at 8 pm."
- **Everything else** stays plain and neutral.
- **She uses Riya's name** and remembers her answers ("after dinner, as you planned").
- **Read-aloud** on every companion line, in her language.

### 7.12 One look
- **Today uses three kinds of card:** action (icon, title, one line, one button), information, and alert.
- **One colour per goal,** carried through Today, My plan and the reminders.
- **One main button per block.** At most one strong button on screen.

Today, each module brings its own card style. That's part of why it feels like many apps.

---

## 8. Plans for every goal

One plan engine (the V35 PMOS plan, generalised) drives all of these. Each goal brings its own content pack.

| Goal she picks | Plan | Daily actions | What it tracks | Doctor moments | Content |
|---|---|---|---|---|---|
| Regular periods (and "I have PMOS") | **My cycle plan**, 12 weeks; PMOS words only when she has PMOS | Walking that builds to 150 min a week; one food habit every 2 weeks; sleep and wake times; 2 strength days | Gaps, skipped months, PMOS signs, energy; waist or weight optional | At the start if months skip; 90 days with no period; week 12 if no change | **Exists** (V35); the sleep and routine steps are new wording |
| Painful periods | **Easier periods**, 3 cycles | Daily movement; the cramps routine on period days; heat; sleep | Pain each period, painkiller days, days missed | Pain that stops her day, twice; the endometriosis self-check | Cramps routine and period-pain guide exist; plan wording is new |
| Heavy periods | **Stronger blood**, 12 weeks | Iron-rich food (from the 21-day journey); iron tablets if prescribed | Pads and clots each period, tiredness | Soaking a pad in 1–2 hours, ₹10-coin clots, dizziness; an Hb test | Iron journey, iron tablets and anaemia guide exist |
| Mood or body changes before periods | **Calmer cycle**, 3 cycles | Calm breath; movement; sleep; logging in the days before | Symptom days each cycle (the PMS log) | Low mood most days; PMDD | Calm routine and PMS log exist |
| Acne or extra hair | Part of **My cycle plan** | As above | Signs in check-ins | Skin and hormone check | Exists |
| Weight and fitness | **Healthy body**, 12 weeks | Moves and the plate | Minutes; waist or weight optional | BMI under 18.5; fast change | Moves and plate exist |
| Trying for a baby | **Getting ready**, 12 weeks | Checklist steps; folic acid (her doctor's advice); cycle tracking; habits | Checklist; cycles | 12 months of trying, or 6 if 35+ or with PMOS | Checklist exists |
| Pregnant | **My pregnancy**, to 40 weeks | Tablets; food; kicks in the third trimester; check-ups | Visits, tablets | Danger signs | Exists |
| After a birth | **Recovery**, 6 weeks then 12 | Recovery check; pelvic floor; feeding; short walks | Recovery signs, mood | Danger signs; the 6-week check | Exists |
| 40+ | **Midlife**, 12 weeks | Strength; calm; sleep; the hot-flush routine | Weekly symptom diary | Bleeding after menopause and the other red flags | Exists |
| Just tracking | No plan: Today shows her cycle and logging | — | — | Pattern flags as now | Exists. Sakhi offers a plan when a pattern appears |

---

## 9. Keep, merge, remove

| Part | Decision | Where it lives after |
|---|---|---|
| Diary: periods, calendar, trends, check-in | **Keep** | Diary; the check-in feeds the plan |
| `plan` (V35, V36) | **Becomes the companion engine** | My plan, and Today's actions |
| `journey` (21-day PMOS and iron) | **Merge** into the plans' first weeks | Cycle plan and Stronger blood |
| `relief` (5 routines) | **Keep** as routines inside plans | Plans; Explore |
| `explain` (What your diary shows) | **Merge:** urgent items go to Today's slot; the rest to results | Today slot; My plan; Diary trends |
| `selfcheck` | **Merge** the PMOS questions into joining; keep the tool | Joining; Explore |
| `periods`, `contra`, `pregtest`, `intimate`, `loss`, `teen`, `family` | **Keep** as the library; only the slot surfaces them, when relevant (a pill due, a late period) | Explore; Today slot |
| `ttc`, `preg`, `pregtools`, `post`, `meno` | **Keep** as stage journeys on the same engine | My plan for her stage |
| `cond`, `screen` | **Keep**; check-ups due go to Today's slot | Explore; Today slot |
| `iron`, `asha` | **Keep** inside plans and "Your care team" | My plan |
| `tools` (reminders, medicines, reports, summary) | **Keep** | Me and Explore; plans create their reminders |
| `access` (Govt. services, 12 tools) | **Keep**, as one row plus the Help sheet; its "Today for you" cards are **removed** (Today does this job) | Explore; Help |
| `joy` | Garden = **the daily check-in reward**; the myth quiz goes to Learn | My plan; Explore |
| `docportal`, sample women | **Demo builds only** (as now) | — |
| `lang` | **Keep** | Me |
| The 14-step first-run tour | **Remove.** The reveal plus one tip the first time she opens each screen | — |
| "Set up Sakhi for you" (5 generic steps) | **Remove.** Steps move into joining (reminder time) and week 1 ("Your care team") | — |
| Home fold "More for you" | **Remove** | Explore |
| Qura doctor banner on Home | **Remove** | Help; the doctor moments |
| Help tab, Plans tab | **Remove** as tabs | Header Help; My plan |
| The heads-up card, "Coming up", the four round buttons | **Merge** | Today slot; My plan; the "Note your day" row |

All 120 tools stay reachable through Explore and search. Nothing she uses today disappears. The change is what gets pushed at
her, and in what order.

---

## 10. Safety, honesty and the law

- **No promises.**
  - Nothing says it will "fix", "cure" or "regularise" her periods, or names a percentage.
  - The Drugs and Magic Remedies Act, section 3(c), restricts claims about correcting menstrual disorders. The vision
    already lists it for Sakhi's wording.
  - A promised outcome from her data also edges towards a medical-device claim (CDSCO).
  - Wording says what the habit does and what may change, "different for every woman".
- **Skipped months:** one doctor check is offered at the start (thyroid, prolactin, PMOS), and a pregnancy test first if she
  could be pregnant. 90 days with no period goes to the top of Today.
- **Red flags first:** the fixed safety guide keeps priority over every plan item.
- **No harm from diet advice:**
  - no calorie counting and no crash diets;
  - "eat more" when her BMI is under 18.5, and a doctor if she's losing weight without trying;
  - no supplements or medicines from the app.
- **Shared phones:** discreet mode, neutral reminders, the PIN and screen-capture block as now.
- **The diary stays on her phone.** Only the summary she ticks goes to a doctor.
- **New wording waits for doctor review:** the "why it matters" lines, the joining questions, the reveal, the results, and
  the sleep and routine steps.

---

## 11. How we'll know it works

**Field-test targets for 8–10 women over 12 weeks, plus a month-4 follow-up** (HEART framework):

| Area | Target | How we see it |
|---|---|---|
| Joining (task success) | 9 of 10 finish in 5 minutes or less, and can say their plan in one sentence | Watch her join on her own phone; ask "What will Sakhi help you with?" |
| Adoption | 8 of 10 check in on day 1 | Her app (she shows it), or the opt-in counts |
| Engagement | 6 of 10 check in on 4+ days a week in weeks 1–4 | Weekly call |
| Retention | 7 of 10 active at week 4; 5 of 10 at week 12 | Calls at weeks 4, 8 and 12 |
| Happiness | SUS 75+ at week 2; "feels like a companion" 4 of 5 or higher | Short survey |
| Her habits | Targets met in 8 of 12 weeks | My plan results |
| Her goal (irregular periods) | **Half or more of those who keep the plan have shorter gaps or no skipped month by month 4–6** (Oberg 2018: 59% vs 24%) | Her gaps before and after, from her diary, shown by her |
| Safety | Every woman with skipped months sees the doctor check; every red flag is routed | Checklist at each call |

**Protocol**
- **Who:** 8–10 women. At least 4 with irregular periods or PMOS, 2 with painful or heavy periods, and the rest across other
  stages.
- **Day 0:** she joins on her own phone while someone watches, without helping ("think aloud").
- **Calls:** a 10-minute call on day 3 and day 7, then calls at weeks 4, 8 and 12, and a follow-up at months 4–6.
- **Human support:** Mohit or a named coordinator as the person she's accountable to (Mohr 2011), by phone. Not WhatsApp: no
  health data to Meta.
- **Her diary stays on her phone.** She shows her screens or ticks her summary if she wants to.

**Decision rules**
- Fewer than 8 finish joining, or they can't say their plan: fix joining first.
- Day-1 check-ins under 6: simplify Today.
- Week-4 retention under 6: look at the lapse and restart flows and the reminder timing.
- Any confusion about Help: fix before anything else.

---

## 12. Build plan

| Version | What | Size |
|---|---|---|
| **V37: the companion core** (for the field test) | New joining with the reveal and safety check; Today (plan card, check-in, the slot); My plan (path, look-back, results, care team); 4 tabs and Help; remove the tour, setup card, fold, banner and the Help and Plans tabs; **My cycle plan** in full, with sleep and routine steps; light plans for every other goal from existing reviewed content; joining saves as she goes | L |
| **V38: plans for every goal** | Easier periods, Stronger blood, Calmer cycle, Getting ready and Midlife as full content packs; weekly targets that adapt to what she did | M–L |
| **V39: results and people** | Month-4 follow-up; the doctor review through "Ask Qura to call me" (live); a coordinator check-in rhythm; nudges tuned to her state | M |

V37 needs doctor review of the new wording before the field test (CLAUDE.md rule).

### 12.1 Acceptance criteria for V37

Every UI test lives in this repo; manual checks run on the Flip5.

1. **Goal first.** As Riya, I want Sakhi to ask what I want to fix, so that the app is about my goal.
   - Given a new woman on the stage screen picks "My periods",
   - When she continues,
   - Then she picks one main goal from her stage's list, and "Make my periods regular" asks about her gaps, skipped months,
     diagnosis and signs.
   - Test: Playwright, `web/test/companion.mjs`.
2. **The reveal.** Given she finished joining with 40–45-day gaps and skipped months,
   - When she saves her plan,
   - Then the reveal shows her goal in her words, her 3 actions for today, what to expect without any percentage, and the
     doctor check (with the pregnancy-test line), and Today shows the same 3 actions.
   - Test: Playwright, plus wording review.
3. **Joining survives interruption.** Given she is on screen 8 and the app restarts, when she opens Sakhi again, then she
   returns to screen 8 with her answers kept.
   - Test: Playwright (reload mid-joining).
4. **The check-in.** Given her plan is on and it's past her reminder time,
   - When she marks 2 of 3 actions done and picks "no time" for the third,
   - Then she sees feedback naming the habit and her goal, the week's count updates, the diary calendar shows the day, and
     no "streak" wording appears.
   - Test: Playwright.
5. **One slot.** Given a tablet is due, her period heads-up is due and a plan suggestion exists, when Today loads, then the
   slot shows only the tablet, and the others wait in My plan or Diary. A red flag always wins the slot.
   - Test: Playwright.
6. **Look-back.** Given 7 days have passed, when she opens Today, then the look-back is in the slot; her answer picks one
   tip and next week's target, and the next action joins.
   - Test: Playwright (fake clock).
7. **Lapse and restart.** Given no check-in for 3 days, when she opens Sakhi, then she sees "Shall we start again small?",
   with no broken-streak message; Monday offers a fresh start.
   - Test: Playwright (fake clock).
8. **Honest results.**
   - Given 2 periods logged since she started, then My plan shows gaps before and since against her starting point, with
     "change takes 3 to 6 months".
   - Given none, it says what it's waiting for.
   - Test: Playwright, plus wording review.
9. **Safety moments.**
   - Given "some months skip" at joining, then the reveal and week 1 show the doctor check.
   - Given 90 days with no period, then Today's slot shows the doctor message first.
   - Test: Playwright.
10. **Navigation.** Given any stage, then there are 4 tabs and a Help button, and Help opens 112, doctors and the guide in
    one tap. Search in Explore finds all 120 tools.
    - Test: Playwright, plus 360 px manual QA.
11. **Shared phone.** Given discreet mode, then Today, the reveal and notifications use neutral words.
    - Test: Playwright (extend `privacy.mjs`).
12. **Every stage.** Given each sample woman (Priya, Asha, Meera, Sunita, Kamla), then Today shows her stage's plan with
    at most 5 blocks, and nothing about another stage.
    - Test: Playwright.

**QA standards for every screen**
- 360 px wide with no sideways scroll, including at the phone's largest text (the smoke test checks this).
- Touch targets 48 px (Sakhi's own rule, above the 44 px minimum).
- Text 16 px, never under 12.
- Safe-area padding on the tab bar.
- Multi-step flows saved as she goes.

---

## 13. Risks

| Risk | What we do |
|---|---|
| A longer joining loses women | Every question shows how it shapes her plan; optional ones say so; a progress bar; save as she goes; the field test measures it |
| Too many reminders | One a day by default, never more than two |
| Promising too much | No percentages, doctor-reviewed wording, an honest timeline, the doctor at week 12 if no change |
| Doctor capacity at Qura | The doctor moments are few and optional; free government care is offered beside Qura |
| Rebuilding Home and navigation breaks things | Keep the modules and their hooks; add the slot as a ranking layer over the existing `today`, `setup` and `home` hooks; run the full suite (about 1,000 checks) each step |
| Shared phones and privacy | Discreet words at joining when shared; the PIN; neutral notifications; nothing to WhatsApp |
| One goal feels limiting | One main goal at a time, others listed as "next"; she can switch any time in plan settings |

---

## 14. Sources

**Engagement and behaviour change**
- Yardley L et al. Understanding and promoting effective engagement with digital behavior change interventions. *Am J Prev Med* 2016. https://discovery.ucl.ac.uk/id/eprint/1528600/
- Perski O et al. Conceptualising engagement with digital behaviour change interventions. *Transl Behav Med* 2017. https://pubmed.ncbi.nlm.nih.gov/27966189/
- Michie S et al. Effective techniques in healthy eating and physical activity interventions: a meta-regression. *Health Psychol* 2009. https://pubmed.ncbi.nlm.nih.gov/19916637/
- Gollwitzer PM, Sheeran P. Implementation intentions and goal achievement: a meta-analysis. *Adv Exp Soc Psychol* 2006 (effect size as reported in https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.565202/pdf)
- Lally P et al. How are habits formed. *Eur J Soc Psychol* 2010, doi 10.1002/ejsp.674 (summary: https://bps.org.uk/research-digest/how-form-habit)
- Baumel A et al. Objective user engagement with mental health apps. *JMIR* 2019. https://pmc.ncbi.nlm.nih.gov/articles/PMC6785720
- Guidance and adherence meta-analysis, *Psychological Medicine*. https://www.cambridge.org/core/product/F9E36D5E38AA65EFDDB0F756199E25C5
- Mohr DC et al. Supportive accountability. *JMIR* 2011. https://pubmed.ncbi.nlm.nih.gov/21393123/
- Bickmore T et al. Relational agents and walking. https://www.ccs.neu.edu/~bickmore/publications/IWC05.pdf
- Mazeas A et al. Gamification and physical activity: meta-analysis. *JMIR* 2022. https://www.jmir.org/2022/1/e26779
- Silverman J, Barasch A. Consumer streaks (summary). https://knowledge.insead.edu/marketing/consumer-streaks-are-motivating-key-keeping-them-alive
- Dai H, Milkman KL, Riis J. The fresh start effect. *Management Science* 2014. https://faculty.wharton.upenn.edu/wp-content/uploads/2014/06/Dai_Fresh_Start_2014_Mgmt_Sci.pdf
- Nunes JC, Drèze X. The endowed progress effect. *J Consum Res* 2006 (summary: https://uxdesign.cc/endowed-progress-effect-give-your-users-a-head-start-97d52d8b0396)
- Buell RW, Norton MI. The labor illusion. *Management Science* 2011. https://ideas.repec.org/a/inm/ormnsc/v57y2011i9p1564-1579.html
- Chernev A et al. Choice overload: a conceptual review and meta-analysis. *J Consum Psychol* 2015. https://www.kellogg.northwestern.edu/academics-research/research/detail/2015/when-product-assortment-leads-to-choice-overload-a-conceptual/
- Nahum-Shani I et al. Just-in-time adaptive interventions. *Ann Behav Med* 2018. https://pmc.ncbi.nlm.nih.gov/articles/PMC5364076
- Rodden K et al. The HEART framework. CHI 2010. https://research.google.com/pubs/archive/36299.pdf

**Other apps (principles)**
- Duolingo path: https://blog.duolingo.com/new-duolingo-home-screen-design/ and https://www.nbcnews.com/tech/tech-news/duolingos-update-redesign-luis-von-ahn-interview-rcna44655
- Yancey K, Settles B. A sleeping, recovering bandit algorithm for optimizing recurring notifications. KDD 2020. https://research.duolingo.com/papers/yancey.kdd20.pdf
- Chin SO et al. Successful weight reduction and maintenance by using a smartphone application (Noom). *Sci Rep* 2016. https://pmc.ncbi.nlm.nih.gov/articles/PMC5098151
- Omada two-year results. https://diatribe.org/diabetes-technology/omada-healths-prevent-program-prediabetes-publishes-two-year-weight-and-a1c
- Couch to 5K completion: https://clok.uclan.ac.uk/48883/1/ijerph-20-06682.pdf; design review: https://pmc.ncbi.nlm.nih.gov/articles/PMC10487403/
- Apple Watch activity goals: https://www.macworld.com/article/3183369/ring-toss-why-the-apple-watch-activity-goals-need-an-update.html
- Fitterfly real-world study. *JMIR Diabetes* 2023. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10193208/
- Veera Health: https://yourstory.com/herstory/2021/07/womens-wellness-startup-veera-health; MyTatva PCOS programme: https://tatvacare.in/?p=5391
- PCOS apps rated with MARS. *JMIR* 2025. https://www.jmir.org/2025/1/e71118; Ask PCOS: https://digital.library.adelaide.edu.au/items/dcfeb1c8-4d2d-43e1-a581-63f8ca5f537a

**Her goal**
- Oberg E, Hirschberg AL et al. Behavioural modification programme in overweight women with PCOS (RCT). *Clin Endocrinol* 2018, doi 10.1111/cen.13919. Summary: https://www.healio.com/news/endocrinology/20181228/lifestyle-changes-may-restore-menstrual-regularity-in-pcos
- Weight-loss interventions in PCOS, meta-analysis of randomised trials (2024). https://mdedge.com/content/weight-loss-interventions-improve-key-features-pcos
- International evidence-based PCOS guideline 2023 (Nordic perspective): https://pubmed.ncbi.nlm.nih.gov/37983875/; FOGSI practice points: https://www.fogsi.org/wp-content/uploads/2024/11/Fogsi-Focus-PCOS-Practice-Points_PCOS-and-Lifestyle-Modification.pdf
- Lee and Lee. Integrated mobile app for overweight women with PCOS (RCT). *Life* 2023. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10381787/
- Wang et al. Transtheoretical-model mobile app for PCOS (RCT). 2022. https://pmc.ncbi.nlm.nih.gov/articles/PMC9097413
- Lawson CC et al. Work schedule and menstrual function (Nurses' Health Study 3). 2015. https://pubmed.ncbi.nlm.nih.gov/25634477/
- FIGO normal menstrual parameters: https://www.merckmanuals.com/professional/multimedia/table/normal-menstrual-parameters

**India**
- NFHS-5 on women's phones and internet: https://insights.dataful.in/articles/womens-internet-use-nearly-doubles-but-access-gaps-remain
- GSMA Mobile Gender Gap Report 2025: https://www.gsma.com/gender-gap-2025/
- Kilkari RCT (LeFevre et al. 2022): https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9288869/; mMitra: https://bmcpublichealth.biomedcentral.com/track/pdf/10.1186/s12889-020-08965-2
- Epstein DA et al. Examining menstrual tracking. CHI 2017. https://pmc.ncbi.nlm.nih.gov/articles/PMC5432133
- Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954: https://www.indiacode.nic.in/indiacode/bitstream/123456789/1412/1/A1954-21.pdf

**Internal**
- `../3 - Research and planning/Product vision - womens health companion.md` (18 Oct): one diary plus context flags, one home
  card, about 35–40 screens.
- `docs/lifestyle-plans-research-2026-10-23.md`, `docs/plans-audit-2026-10-23.md`, `web/MODULE_API.md` sections 37–38.
