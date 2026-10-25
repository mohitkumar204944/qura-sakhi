# A full programme for every condition (advice, 24 Oct 2026)

Mohit, 24 Oct:
> "check sakhi app and advise currently only a PMOS program is there we need for all other conditions also can you advise
> what needs to be built"

**Superseded in part (24 Oct, later the same day):** `docs/plans-design-and-build-2026-10-24.md` and its appendix
`docs/plans-design-and-build-2026-10-24-programmes.md` replace sections 2, 4 and 5 below with a researched design (8
research tracks, verified, plus 3 architectures and 8 skeptic-reviewed programme designs). Sections 0, 1 and 3 still hold.

**Status: advice only.** Nothing in the app changed. One new measuring walk, `web/test/plans-walk.mjs` (not pass/fail, like
`stages-walk.mjs`), starts every goal's plan and runs it for 12 weeks on a fake clock. It records each day's steps and what
My plan shows on days 8 and 50. Screens and `plans-walk.json` go to `web/test/shots/plans-walk/` (gitignored). Run it
before and after building to see each programme get deeper.

This builds on two documents and doesn't repeat them:
- `docs/lifestyle-plans-research-2026-10-23.md`: the evidence for plans, and the order it suggested (PMOS, easier periods,
  pregnancy, after birth, 40+). Only PMOS was ever built in full.
- `docs/diet-ux-audit-2026-10-24.md` (written earlier today, not committed yet): food, pictures and findability. Every
  programme's food part below takes its food from that audit's shared foods table and food tiles. Build those first.

The evidence comes from the 19 Oct evidence report (`../3 - Research and planning/Research - validated tools and self-help
evidence (19 Oct 2026).md`) and the 23 Oct lifestyle research. No new sources were needed. Every programme stays inside
Mohit's rule: "Reproductive health only. No new conditions."

---

## 0. The answer on one page

**You're right.** Sakhi has 8 plans, but only one is a real programme: the cycle plan, which covers PMOS, irregular
periods, acne and hair, and weight. The other 7 were made in Versions 37 and 38 as "light" plans. Each is one to three
links to tools Sakhi already had, repeated every day for 12 weeks.

Measured with the new walk (12 fake weeks for each goal, 390 px):

| Plan (her goal) | Steps a day | Different steps in 12 weeks | Food | Routine with moving drawings | Results from her own measure | Pictures on My plan | Tiles on My plan |
|---|---|---|---|---|---|---|---|
| **Cycle plan** (PMOS, irregular, skin, weight) | 3 | 8 | 6 habits, one new every 2 weeks | 5 routines, rotating; minutes build to 150 a week | Minutes, strength days, gaps, signs | 4 | Plate, Moves, Body, Progress |
| Easier periods (pain) | 2 | 2, plus the cramps routine on days she logged a period | None | No | Pain per period | 0 | None |
| Stronger blood (heavy) | 2 | 23: 21 iron steps, then "An iron-rich food today" for 63 days | Iron steps | No | Heavy periods | 0 | None |
| A calmer cycle (PMS) | 3 | 3: calm breath, walk and bed time, every day | None | Calm breath only | Low days | 0 | None |
| Getting ready for a baby | 3 | 9: the PMOS food habits and a weekly checklist link | PMOS habits, no folate foods | No | Checklist | 0 | None |
| My pregnancy plan (5 goals) | 2 | 3: "Due now" and one tool link for 84 days (24 for the iron goal) | A link to one page | No | Days followed | 0 | None |
| My recovery plan (6 goals) | 1 to 2 | 1 to 2: the pelvic floor trainer and one tool link | None | No | Days followed | 0 | None |
| My midlife plan (6 goals) | 1 to 2 | 3: a 3-minute routine link, a walk, the weekly diary (8 for weight) | None, except weight | Strength twice a week for bones | Weeks with flushes | 0 | None |

So a woman with painful periods gets a walk (10 minutes, growing to 30) and a bed time on every one of 84 days. Every
ordinary week on her 12-week path says "Your daily steps". She has no plan for her period week, no yoga, no heat, no
lesson and no picture. A woman on the PMOS plan gets a minutes ring, a moving figure, a routine that changes, a new food
habit every two weeks and four tool tiles.

**What to build: a programme kit once, then each programme as content.**
1. **The kit** (section 2). The PMOS plan's parts are made general so every programme gets them: the page, a path that
   adds something each week, routines with moving drawings, a food slot, her own measure, results, doctor moments and the
   four tiles. It adds three things even PMOS lacks:
   - a short lesson each week;
   - targets that follow what she actually did;
   - one optional add-on next to her main plan (pelvic floor, iron tablets or the PMS log).

   Move all 8 plans onto the kit first, with today's reviewed content. Every plan then gets the page, pictures and tiles
   at once, with no new health wording.
2. **The programmes** (section 4), each a content pack for the doctor to review. Seven new or upgraded programmes sit
   next to the cycle plan, plus pelvic floor as a programme of its own:

| # | Programme | For | Length | The core of it | Evidence |
|---|---|---|---|---|---|
| 1 | **Easier periods** | Painful periods (and diagnosed endometriosis) | 12 weeks, about 3 periods | Movement 3 days a week building to 45 minutes; a period-week plan (heat, period yoga, the cramps routine); pain noted each period day | Cochrane 2019 (exercise); AAFP 2021 (exercise, heat, TENS: B) |
| 2 | **Stronger blood** | Heavy periods, low iron (and diagnosed fibroids) | 12 weeks: the 3-month iron course | An Hb test in week 1, tablets as advised, iron food by region and diet, flow noted each period, a retest in week 12 | NICE NG88; Anemia Mukt Bharat 2026 |
| 3 | **Calmer cycle** | PMS, PMDD | 3 cycles | A 20-second daily log for 2 cycles, movement, one CBT skill a week, then her own "calm week" plan | RCOG GTG 48 (CBT Grade A; the 2-cycle diary); Pearce 2020 |
| 4 | **Strong pelvic floor** | Leaks or heaviness, at any adult stage | 12 to 16 weeks | 3 short sets a day that build (holds of 3 to 10 seconds), "the knack", leaks noted weekly | NICE NG123 and NG210; Cochrane: leaks cured in 56% vs 6% |
| 5 | **Midlife: cool, calm, strong** | 40+: flushes, sleep, mood, bones, weight | 12 weeks | Weeks 1 to 6: a CBT course for flushes. Weeks 7 to 12: strength, balance and sleep steps. Calcium foods throughout | NICE NG23 (2024); IMS 2026 (CBT and exercise Grade A); MENOS@Work |
| 6 | **My pregnancy** | Pregnant | To the birth, by her week | Each trimester's steps: food, tablets, safe moves after her doctor's OK, the sugar test at 24 to 28 weeks, her baby's own movement pattern, getting ready for the birth | WHO 2020; MoHFW GDM 2018; RCOG GTG 57 (2026); MCP card |
| 7 | **After the birth** | Baby under a year | 6 weeks of recovery, then 12 weeks "back to strong" | The recovery check, food for feeding, iron, pelvic floor. After the 6-week check: core, walks with the baby, strength | NICE NG210; WHO 2020; Anemia Mukt Bharat |
| 8 | **Getting ready for a baby** | Trying | 12 weeks, then on to month 12 (or 6) | The checklist, folate and iron foods, moves, her partner's part, when to see a doctor | Anemia Mukt Bharat; Sakhi's reviewed trying pages |

The cycle plan keeps everything it has and gains the kit's lessons and adaptive targets.

**Order** (section 5):
1. The kit, with every plan moved onto it.
2. The three period programmes: pain, heavy and PMS. These are the field test's women: at least 4 with irregular periods or
   PMOS, and 2 with painful or heavy periods.
3. Pelvic floor, and midlife.
4. Pregnancy, and after the birth.
5. Getting ready.

**The slow part is review, not code.** The programmes need about 12,000 to 15,000 words of new health wording (English,
plus Hindi) and about 20 new move drawings. Sections 13 to 16 of the wording review still wait for the doctor, and the
diet audit adds a 17th. Send one packet per programme, with each line's source beside it, and add a physiotherapist for
the moves.

**No new conditions.** Every programme belongs to an area Sakhi already covers. Section 3 maps every condition in the app
to its programme, or says why it has none.

---

## 1. Why only the PMOS plan feels like a programme (the code)

- **Steps:** `actionsFor` (`web/mods/plan.js:1294`) builds each light plan from one to three fixed links:
  - pain: a walk and a bed time, plus the cramps routine on a day she has logged her period;
  - PMS: calm breath, a walk and a bed time;
  - pregnancy: "Due now" and one tool for her goal;
  - after a birth: the pelvic floor trainer and one tool;
  - midlife: one 3-minute routine, a walk, and the weekly diary.
- **Growth:** only the cycle plan grows. `target()` builds the minutes to 150 a week, `habitsOn()` adds a food habit every 2
  weeks, `todayPlan()` rotates the routines and strength days, and `sunRounds()` adds rounds. Light plans only lengthen the
  walk from 10 to 30 minutes (`lightWalk`).
- **Page:** the cycle plan has `journeyCycle` (`plan.js:407`): the ring, week strip, moving figure, routine, food ticks and
  four tiles. Light plans get `renderLight` (`plan.js:1639`): a list of steps, the path, a days-followed chart and one
  before-and-since card.
- **Path:** `pathHtml` (`plan.js:1559`) writes "{n} minutes a week · new: {habit}" for the cycle plan. Every other plan gets
  `plan_path_light` ("Your daily steps") for each ordinary week.
- **Routines:** the 5 full routines (gentle start, cycle care yoga, sun salutation, strength at home, calm breath) live in
  plan.js. Light plans mostly link to `relief.js`'s 3-minute routines (cramps, nausea, sleep, calm, hot flushes), which use
  a timer rather than the plan's moving figure, or to tools such as the pelvic floor trainer.
- **Doctor:** at the start, `docCase` (`plan.js:1398`) checks only cycle, heavy and pain answers. The doctor-check card on
  Today (`cardKind` 'doc', `plan.js:1743`) shows only for the cycle plan.
- **Reach:** with no tiles, food and yoga are out of reach for most goals. The diet audit found Yoga and moves more than 5
  taps away for heavy periods and 40+.

**What the light plans do well (keep it):**
- They use reviewed tools.
- They follow her stage: pregnancy weeks, the 42-day recovery check, the calm week before her period.
- They never double up with a tool's own Today row (Version 38).
- The check-in, look-back, care team and reminders already work for all of them.

---

## 2. The programme kit

**What every programme gets** ("Today" says what exists now):

| Part | Today | In the kit |
|---|---|---|
| Her goal in her words, the questions it needs, the reveal, "Start my plan" | Every plan | Same |
| A path where each week adds something ("Week 5 · new: period yoga") | Cycle plan only | Every programme declares its weeks: what's new and the week's focus |
| 2 or 3 daily steps that grow | Cycle plan only | Any step can grow: minutes, seconds held, sets, days a week |
| Steps that follow her body | Partly: the cramps routine on a logged period day, the PMS calm week, pregnancy weeks, days since the birth | One shared set of rules for every programme: her period week (from a logged start, or 2 days before her likely range), the week before her period, the rest of her cycle, her trimester, weeks since the birth |
| A home routine with moving drawings, a timer and read-aloud | Cycle plan (5 routines); PMS (calm breath) | 1 to 3 routines per programme on the same figure engine (`P`, `ANIM`), about 20 new poses in all (section 5) |
| Food for her goal | Cycle plan (plate and 6 habits) | A food slot filled from the diet audit's shared foods table: general plate, iron, folate, calcium and protein, pregnancy by trimester, breastfeeding |
| Her own measure | Cycle plan (minutes, strength days, gaps, signs) | Each programme names one main measure, mostly already in the diary (section 4) |
| A weekly look-back | Every plan | Plus one question for her programme, such as "How bad was the pain this period?" |
| Results: before and since, and "what to expect" as a timeline | Cycle plan in full; partly for light plans | Every programme: its own measure before and since, and its own reviewed timeline. Never a promised number |
| Doctor moments | At the start for 3 plans; the Today card for the cycle plan only | Each programme's fixed rules: at the start, any red flag (always first on Today), a test that's due, no change by week 12 |
| **A short lesson each week** | None | 3 picture cards of about 25 words each, read aloud card by card, shown once at the start of the week and kept under "What I've learned". For PMS and midlife, the lessons are the CBT, so they're the evidence-based part |
| **Targets that follow her** | None: the cycle plan's target rises every week whatever she did | If she followed her plan on fewer than 3 days last week, next week keeps the same target, said kindly. On 5 days or more, it steps up. Goals with feedback and review work best (Michie 2009, in the companion journey doc) |
| **One add-on** | None: tablet rows sit apart from the plan | One optional extra step from a short list (pelvic floor sets, iron tablets, the PMS log) next to her main programme. Her main goal stays one |
| Tiles on My plan: My food, My moves, My measure, My progress | Cycle plan only | Every programme. Moves stay hidden in pregnancy until she ticks "My doctor said I can exercise", and for 6 weeks after a birth (except pelvic floor and breathing) |

**How to build it:**
- **A programme registry.** Each programme is data: weeks and phases, step rules, routines, food kind, measure, lessons,
  results, doctor rules, path lines and discreet names. It replaces the per-plan branches in `actionsFor`, `stepsList`,
  `pathHtml`, `lightResults`, `docCase` and `packTitle`.
- **One file for each programme's content**, for example `mods/prog-pain.js` registering with `S.plan.pack('pain', {...})`.
  - Each doctor-review packet then matches one file, and plan.js (335 KB today) stays the engine.
  - Modules already look each other up at call time (MODULE_API §42), so load order is safe. List the new files in
    `order.json` and `routes.json`.
- **One page for every programme:** `journeyCycle` made general, and `renderLight` retired.
- **Port first, then deepen.**
  - Move all 8 plans onto the kit with today's content, keeping `pmosplan`, `companion`, `firstday`, `notices` and `goals`
    green.
  - That alone gives every plan its page, pictures and tiles (diet audit 4.5 and 5.4), and the only new wording is labels.
- **Depth checks in the tests.** `plans-walk.mjs` becomes the yardstick. Every programme should reach:
  - at least 8 different steps over 12 weeks (the cycle plan's count);
  - something new on the path at least every 2 weeks;
  - 6 or more lessons;
  - its own measure in results;
  - at least 3 pictures on My plan, and the four tiles;
  - full Hindi, and neutral words in discreet mode.
- **The doctor summary:** each programme adds one line to the existing "tools" section (`DOCTOR_MODS`), so the server needs
  no change.

---

## 3. Every condition in Sakhi, and the programme that covers it

| Condition (where it lives today) | Programme | Note |
|---|---|---|
| Irregular periods, PMOS, acne or extra hair, weight (`plan`, `selfcheck`) | Cycle plan (exists) | Gains the kit's lessons and adaptive targets |
| Period pain (`periods-pain`, `relief-cramps`) | 1 Easier periods | |
| Endometriosis (`cond-endo`, with its pain diary) | 1 Easier periods, in a "my doctor said endometriosis" version | ESHRE 2022 recommends no specific self-help, so the words say "may help you cope", and the pain diary is for her gynaecologist. Never a self-check result |
| Heavy periods (the diary's flow, `cond-anaemia`'s blood-loss chart) | 2 Stronger blood | |
| Anaemia, low Hb (`cond-anaemia`, `iron`, the iron journey) | 2 Stronger blood | A new goal choice, "Tired, low iron", next to heavy periods |
| Fibroids, polyps (`cond-fibroids`) | 2 Stronger blood, in a "my doctor said fibroids" version | Treatment is her doctor's; the programme is her blood and her tracking |
| PMS, PMDD (the `periods-pms` log) | 3 Calmer cycle | |
| Leaks, prolapse (`intimate-prolapse`, `post-pelvic`, `meno-intimate`) | 4 Strong pelvic floor | A new goal, "Leaks or heaviness down below", for every adult stage (today it's offered only after a birth) |
| Hot flushes, sleep, mood and bones at 40+ (`meno`, the perimenopause score) | 5 Midlife | |
| Periods stopping before 40 (`cond-poi`) | 5 Midlife's bones and sleep parts | Wording reviewed for women under 40; hormone therapy is her doctor's |
| Pregnancy, nausea, sugar in pregnancy, anaemia in pregnancy (`preg`, `pregtools`, `iron`) | 6 My pregnancy | |
| After the birth: recovery, feeding, mood, contraception (`post`) | 7 After the birth | |
| Trying for a baby (`ttc`) | 8 Getting ready | |
| Pregnancy loss, repeated loss (`loss`, `ttc-loss2`) | **No habit plan** | Daily ticks and petals don't fit grief. Keep the pages, the doctor, her ASHA and Tele-MANAS, and offer Getting ready only when she chooses it |
| Contraception (`contra`) | No programme | Pill, injection and device reminders already exist |
| Discharge, STIs, PID, genital TB (`intimate`, `cond-pid`) | No programme | A doctor treats these; medicine reminders already exist (`tools-meds`) |
| Hysterectomy, surgical menopause (`cond-hyst`, `meno-surgical`) | Not now | A "before and after surgery" programme could come later |
| Girls under 18 (`teen`) | No programme | No sign-up under 18 (Mohit's rule), so nothing could be saved |
| Breast and cervical check-ups (`screen`) | No programme | Check-ups that are due already show on Today |

---

## 4. The programmes

Each one says what she does, what she sees, what Sakhi reuses, and what's new for review. "As advised" means her doctor's
or ASHA's plan, noted in the app. No dose ever appears in a programme's words.

### 4.1 Easier periods (period pain; diagnosed endometriosis)

- **Length:** 12 weeks, about 3 periods.
- **Weeks:**
  - 1 to 4, "know your pattern": move on 3 days a week for 20 minutes, and set up her period-week kit.
  - 5 to 8, "build": up to 45 minutes on 3 days a week (the dose most trials used), with period yoga on one of them.
  - 9 to 12, "your period-week plan": what helped her, kept as her own plan.
- **Daily steps:**
  - Most days: movement on her 3 days, a stretch or rest on the others, and a bed time.
  - 2 days before her likely period: "Get your period kit ready": a hot water bag, and a painkiller only if her doctor or
    chemist has suggested one.
  - Period days: heat for 20 minutes, the cramps routine or period yoga, and one tap for "How bad was the pain today?"
    using the diary's own 4 levels (no pain, mild, needed a painkiller, couldn't do my day).
- **Routines:**
  - Period yoga (new, 8 to 10 minutes): butterfly, child pose (a chair bend for sore knees), knees to chest, bridge and
    rest, which exist, plus cat-cow and reclined butterfly as new poses.
  - The cramps routine, Strength at home and Gentle start (exist).
- **Food:** her general plate from My food. No food is said to ease pain (diet audit rule).
- **Her measure:**
  - the worst pain level each period;
  - days she "couldn't do my day";
  - painkiller days;
  - a new tick, "missed work or school".
- **Lessons (12):**
  - why periods hurt, in plain words, and what's normal and what isn't;
  - heat, movement and sleep;
  - painkillers: ask your doctor which one and when;
  - telling family, school or work;
  - her period-week plan;
  - when pain isn't normal (the ESHRE signs: pain during sex, or when passing stool or urine; pain between periods);
  - what the doctor checks, and endometriosis, said carefully;
  - keeping it going.
- **Results:** pain each period, the 3 before she started against those since; days lost.
- **Doctor moments:**
  - At the start: pain that stops her day (exists).
  - Any time, the red flags: pain that keeps getting worse, pain with fever, bleeding or pain between periods, pain during
    sex, pain passing urine or stool.
  - No better after 3 periods: a gynaecologist with her pain diary, through the free government doctor or "Ask Qura to
    call me".
- **Diagnosed endometriosis:**
  - The same plan, with "your doctor's treatment comes first; these may help you cope".
  - Her `cond-endo` pain diary is the measure, with a card to prepare for her visit.
  - ESHRE 2022 makes no recommendation for any specific self-help, so nothing is claimed beyond coping.
- **Reuse:** `relief-cramps`, the period pain page, `cond-endo`, `painCompare`, the figure engine, Cycle care yoga.
- **New for review:**
  - 1 routine (2 new poses), about 12 lessons, the step lines and the red-flag lines;
  - reviewed by a doctor (a gynaecologist for the red flags and endometriosis) and a physiotherapist (the yoga).
- **Evidence:**
  - Cochrane 2019: exercise lowered pain by about 25 points out of 100 (low certainty), usually 45 to 60 minutes 3 times a
    week.
  - AAFP 2021: exercise, heat, TENS and self-acupressure (SORT B).
  - Heat against painkillers: "suggestive" (Jo and Lee 2018).
- **Size:** M.

### 4.2 Stronger blood (heavy periods; low iron; diagnosed fibroids)

- **Length:** 12 weeks: the 3-month iron course and a retest (Anemia Mukt Bharat).
- **Weeks:**
  - 1, "know your Hb": a free blood test at the Ayushman Arogya Mandir or PHC, with her result saved in Lab results.
  - 1 to 3: the 21-day iron steps, by what she eats (exist).
  - 4 to 12: one iron food a day that changes, by region and diet (diet audit 39.4).
  - 12: the retest, and her before and after.
- **Daily steps:**
  - An iron food, with lemon or amla, and tea an hour away from it.
  - Her tablet, if her doctor or ASHA gave her one (the iron tracker, counted in her plan).
  - A gentle walk: "stop if you feel breathless or dizzy".
  - Period days: "How heavy today?" (pads, clots, leaks: the diary's own fields), or the blood-loss chart if she uses it.
- **Routines:** Gentle start. Nothing harder until her Hb is known.
- **Food:** iron foods as picture tiles (vegetarian, Jain, eggs, non-vegetarian; low-cost first), vitamin C alongside, and
  the iron kadhai.
- **Her measure:**
  - heavy days each period (`heavyCompare` exists), and the blood-loss chart score if she uses it;
  - tablet days;
  - her Hb, first and latest;
  - tired days, from the check-in.
- **Lessons:**
  - what counts as heavy (by how it affects her life, as NICE defines it), and why she's tired;
  - tablets: black stools and constipation are common, and what helps (the iron module's reviewed lines);
  - when to have tea and milk;
  - deworming;
  - what the doctor checks: Hb, thyroid, and a scan for fibroids or polyps;
  - free tests and tablets;
  - food that builds blood;
  - telling the family;
  - the retest.
- **Results:** heavy periods before and since; Hb before and after; tablet days.
- **Doctor moments:**
  - At the start: soaking a pad in an hour or less, clots the size of a ₹10 coin, dizziness or breathlessness (exist).
  - No Hb by week 2: a reminder.
  - Hb under 8: see a doctor now (Anemia Mukt Bharat refers).
  - The week-12 retest.
  - Heavy periods unchanged: a gynaecologist for a scan.
- **Reuse:** `iron`, the iron journey, `cond-anaemia` with the blood-loss chart, `cond-labs`, `heavyCompare`.
- **New for review:** about 10 lessons (much of it already reviewed in `cond-anaemia` and `iron`), the rotating food steps
  (diet audit), and the doctor lines.
- **Evidence:**
  - NICE NG88: heavy bleeding is defined by its effect on her life, and everyone with heavy bleeding gets a full blood
    count.
  - Anemia Mukt Bharat 2026: treatment is a tablet a day for 3 months, then a retest; Hb under 8 is referred.
  - NFHS-5: 57% of women aged 15 to 49 are anaemic.
- **Size:** M, mostly joining up what exists.

### 4.3 Calmer cycle (PMS, PMDD)

- **Length:** 3 cycles.
- **Cycles:**
  - 1 and 2, "notice":
    - a 20-second daily log of mood and body, lined up by cycle day (the existing `periods-pms` log, which is RCOG's
      two-cycle diary);
    - movement building over 8 weeks;
    - one skill a week.
  - 3, "your calm week": her own plan for the days before her period.
- **Daily steps:**
  - the 20-second log;
  - a walk or a move;
  - calm breath (exists, with moving drawings) or a bed time.
  - In the week before her period, the steps get lighter and calm breath comes first. Version 38's "calm week" line becomes
    a real plan.
- **Routines:** Calm breath and Gentle start (exist); a short evening wind-down (new).
- **Food:** her general plate. No food is said to ease PMS.
- **Her measure:** symptom days each cycle and how much the worst day stopped her; low, anxious or irritable days (exists).
- **Lessons (CBT-informed, in our own words):**
  - is it PMS (it comes before the period and goes once the period starts);
  - noticing the thought, and the pause;
  - planning the hard days, and saying no;
  - sleep and movement;
  - telling family;
  - irritability;
  - when it's more than PMS (PMDD), and medicines being a doctor's choice;
  - help numbers.
- **Results:** symptom days in cycle 3 against cycles 1 and 2.
- **Doctor moments:**
  - A big effect on work or relationships (possible PMDD): an MBBS doctor.
  - Low mood that isn't tied to her cycle: a doctor, or Tele-MANAS 14416.
  - Thoughts of harming herself: 112 or 14416, now.
- **Reuse:** `periods-pms`, `relief-calm`, the plan's calm routine, `calmWeek()`, the low-days result.
- **New for review:** about 12 lessons (the main content), the log's daily prompt and the doctor lines. A doctor checks the
  PMDD and crisis wording.
- **Evidence:**
  - RCOG GTG 48: CBT for severe PMS (Grade A); a two-cycle diary is good practice; exercise shows "some benefit".
  - Pearce 2020: 8 weeks or more of exercise lowered PMS scores (SMD −1.08, low-quality trials).
- **Size:** M.

### 4.4 Strong pelvic floor (leaks or heaviness, at any adult stage)

- **Length:** at least 12 weeks; 16 for a feeling of heaviness (prolapse symptoms).
- **Weeks:**
  - 1 and 2: find the right muscles (picture cues), 8 squeezes, holds of 3 seconds.
  - 3 to 6: holds of 5 seconds, plus quick squeezes.
  - 7 to 12: holds of 10 seconds; "the knack" (squeeze before a cough, sneeze or lift); squeezing while standing and
    walking.
- **Daily steps:** 3 short sets of about 2 minutes, tied to her day (after brushing, after lunch, before bed); the weekly
  leaks question.
- **Routine:** the existing trainer (a timer, squeeze and relax, 3 sets a day, the 3-month count), plus each week's holds
  and a simple figure cue.
- **Food:** water through the day, and fibre against constipation (her plate).
- **Her measure:**
  - sets each day (exists);
  - a weekly "Did you leak this week? Never / sometimes / most days", and when: a cough or sneeze, or rushing to the
    toilet.
  - These are our own words, not the licensed ICIQ.
- **Lessons:**
  - what the pelvic floor does, and how to find it (don't practise by stopping the flow of urine);
  - common mistakes: holding the breath, squeezing the buttocks;
  - the knack;
  - bladder habits, lifting and constipation;
  - after a birth, and after menopause;
  - when to see a doctor;
  - keeping it going after 12 weeks.
- **Results:** leaks in the first 2 weeks against the last 2; days she trained.
- **Doctor moments:**
  - Soon: bladder pain that doesn't go away, trouble passing urine, leaking stool (NICE NG123), or a bulge she can feel or
    see.
  - Still leaking at 3 months: a doctor or physiotherapist, with the free government doctor first.
- **Reuse:** `post-pelvic` and its 3-month course, `intimate-prolapse`, `meno-intimate`.
- **New for review:** the weekly progression, about 12 lessons and the leaks question. A physiotherapist checks the cues and
  the progression.
- **Evidence:**
  - NICE NG123: at least 3 months of supervised training, at least 8 squeezes 3 times a day.
  - NICE NG210: the same during and after pregnancy.
  - Cochrane 2018: stress leaks cured in 56% vs 6% (high quality).
  - For prolapse symptoms, at least 16 weeks (NG123; the POPPY trial).
- **Size:** S to M. This has the strongest evidence of any programme here, and the trainer already exists.

### 4.5 Midlife: cool, calm, strong (40+)

- **Length:** 12 weeks. Her goal (flushes, sleep, mood, bones or weight) changes the emphasis, not the shape.
- **Weeks:**
  - 1 to 6, "cool and calm": a CBT course for hot flushes and night sweats, in our own words. It covers what happens,
    triggers, paced breathing, thoughts during a flush, night sweats and stress.
  - 7 to 12, "strong and rested": strength twice a week, balance, and sleep steps from CBT for insomnia (a fixed wake time,
    the bed for sleep, no clock-watching).
- **Daily steps:**
  - paced breathing practice (the hot-flush routine exists);
  - a move: a walk, strength or balance;
  - a sleep step;
  - a calcium food on 3 or 4 days a week;
  - the weekly symptom diary (exists).
- **Routines:**
  - Strength and balance (new). Mostly existing moves: chair squats, wall push-ups, heel raises and tree pose. New poses: a
    one-leg stand and a heel-to-toe walk.
  - Paced breathing (exists) and gentle yoga.
- **Food:** calcium and protein (ragi, til, curd, milk, dal, paneer, eggs) from the 40+ bones page, as picture tiles (diet
  audit 39.4).
- **Her measure:**
  - weeks with flushes (`S.meno.trend`, exists);
  - a weekly "How much of a problem were your flushes? 0 to 10" (our own words);
  - nights of bad sleep;
  - strength days.
- **Lessons:**
  - the 6-week course itself;
  - then bones and falls, sleep and mood;
  - questions for her doctor about hormone therapy (`meno-hrt`);
  - check-ups after 40: BP, sugar, breast and cervix.
- **Results:** weeks with flushes and the problem score, the first 4 weeks against the last 4; sleep; strength days.
- **Doctor moments:**
  - Bleeding after a year with no periods: see a doctor (exists, always first).
  - Flushes that stop her day: ask about hormone therapy (an MBBS gynaecologist).
  - Low mood most days: a doctor, or 14416.
  - A bone check if she has risk factors.
  - Periods stopped before 40: a doctor first (POI).
- **Reuse:** the symptom diary and its trend, `relief-hot`, `relief-sleep`, `relief-calm`, the 40+ bones and hormone therapy
  pages, Strength at home, the perimenopause score.
- **New for review:**
  - the 6-week course (the biggest single piece of writing), the sleep steps, and about 4 new poses;
  - a doctor checks the course and the hormone therapy lines; a physiotherapist checks the balance work.
- **Evidence:**
  - NICE NG23 (2024): "consider" menopause CBT for flushes, sleep and low mood.
  - Indian Menopause Society 2026: CBT Grade A when hormone therapy isn't suitable; exercise Grade A for flush severity;
    yoga for 8 weeks or more, Grade B.
  - MENOS@Work: an unguided booklet cut the problem rating by about 1.5 points out of 10 at 6 weeks.
  - CBT for insomnia is first-line (European guideline 2023, Grade A).
- **Size:** L. The course is new writing: the MENOS book is a Routledge title, so nothing is copied.

### 4.6 My pregnancy (to the birth)

- **Length:** her pregnancy, by her own week. The Version 38 plan already runs to the birth.
- **Trimesters:**
  - 1: food safety, nausea, registering, the first tests (her "Due now" items).
  - 2:
    - tablets as advised;
    - "move about 150 minutes a week", once she ticks "My doctor said I can exercise";
    - the pregnancy-safe routine and pelvic floor;
    - the sugar test at 24 to 28 weeks.
  - 3:
    - knowing her baby's own movement pattern (no counting to a number);
    - getting ready for the birth (bag, birth plan) and for breastfeeding;
    - danger signs and schemes.
- **Daily steps:**
  - "Due now" (exists);
  - a food step for her trimester (diet audit 39.4, from the week pages' reviewed tips);
  - tablets (the iron tracker);
  - a walk or the routine, after her doctor's OK;
  - pelvic floor;
  - from 28 weeks, "Did the baby move as usual today?"
- **Routines:**
  - Pregnancy moves (new): seated and side-lying moves, pelvic tilts on hands and knees, cat-cow, butterfly, wall push-ups,
    and breathing. No lying flat on the back later in pregnancy, no holding the breath, and stop signs on every screen.
  - Pelvic floor.
- **Food:**
  - By trimester and region (NIN's regional pregnancy charts are the model), with pregnancy-safe tags.
  - If she's diagnosed with sugar in pregnancy: "your doctor or dietitian sets your plan", and no plate driven by her
    readings (diet audit rule).
- **Her measure:** check-ups done on time, tablet days, active minutes, and her own weight, BP and sugar logs (exist).
- **Lessons:** this week's pregnancy page (already reviewed), shown as the week's lesson cards.
- **Results:** check-ups and tablets on time, and her minutes. No outcome results.
- **Doctor moments:**
  - Danger signs (the MCP card) always come first.
  - The sugar test when it's due.
  - Movements slower or stopped: go now (exists in the kick tool's words).
- **Reuse:** `preg-plan` (19 items), the week pages, `preg-diet`, the logs, the kick tool, the bag and birth plan, `iron`,
  and the nausea, sleep and calm routines.
- **New for review:** the pregnancy routine (an MBBS doctor and a physiotherapist), the trimester food steps, and the
  "doctor's OK" line.
- **Evidence:**
  - WHO 2020: about 150 minutes a week of moderate activity in pregnancy, unless there's a medical reason not to.
  - MoHFW GDM 2018: test at the first visit and at 24 to 28 weeks (free to reproduce).
  - Cochrane 2020: pelvic floor training in pregnancy, 62% less leaking late in pregnancy.
  - RCOG GTG 57 (2026): know her baby's pattern; no counting to set numbers.
- **Size:** M.

### 4.7 After the birth (recovery, then back to strong)

- **Length:** to day 42 (recovery), then 12 weeks after her 6-week check.
- **Recovery (to day 42):**
  - the daily recovery check and its danger signs (exists; done only by doing it);
  - the feeding log;
  - food for feeding (diet audit): dal, milk or curd, eggs or paneer, sabzi and water at every feed. Jaapa food is eaten
    as food, and water, fruit and vegetables are never cut;
  - iron tablets for 180 days, as advised;
  - gentle pelvic floor when comfortable, and short walks;
  - check-ups (exist), contraception by 6 weeks (exists), and the mood check (exists).
- **Back to strong (after the 6-week check):**
  - the pelvic floor programme (4.4);
  - a core and posture routine (new; it uses the existing belly-gap check);
  - walks with the baby, building to 150 minutes a week;
  - strength twice a week.
- **Routines:**
  - Core and posture (new, about 6 poses): pelvic tilt, heel slides, side-lying leg lifts, wall posture, and bridge (exists).
  - Pelvic floor and Gentle start.
- **Her measure:** recovery checks (to day 42), leaks each week, pelvic floor days, active minutes, tablet days.
- **Lessons:** the existing after-birth pages as weekly lessons, plus new ones on returning to exercise, the belly gap, food
  while feeding, sleep in short pieces, and asking family for help.
- **Results:** leaks, minutes, pelvic floor days.
- **Doctor moments:**
  - danger signs (exist);
  - low mood for 2 weeks: a doctor. Thoughts of harm: 112 or 14416, now;
  - leaks at 3 months;
  - a belly gap with pain or a bulge: a doctor or physiotherapist;
  - the 6-week check.
- **Reuse:** everything in `post.js`, and programme 4.4.
- **New for review:** the core routine (a physiotherapist), the feeding food cards (diet audit), about 8 lessons.
- **Evidence:**
  - NICE NG210;
  - WHO 2020: a gradual return to 150 minutes a week;
  - Anemia Mukt Bharat: iron for 180 days while breastfeeding.
- **Size:** M.

### 4.8 Getting ready for a baby

- **Length:** 12 weeks. The months-trying count then carries on to month 12, or month 6 at 35 to 39 as the trying page says.
- **Weeks:**
  - 1 to 4, the checklist: tests, vaccines, folic acid as her doctor or ASHA advises, no tobacco, gutkha or alcohol, and
    her partner's part.
  - 5 to 12: habits, fertile days (shown in pilot builds), stress and sleep.
- **Daily steps:** a walk or a move; a folate or iron food (dal, chana, rajma, green leaves, citrus); the checklist once a
  week (exists).
- **Routines:** Gentle start, Strength at home, Cycle care yoga (exist).
- **Food:** folate and iron foods as tiles. Today the plan reuses the PMOS habits (diet audit 2.10).
- **Her measure:** the checklist, a of b (exists); months trying (exists).
- **Lessons:**
  - the checklist, and fertile days;
  - how long it usually takes (the reviewed "8 in 10 couples within a year");
  - her partner's part;
  - weight and PMOS, and stress;
  - when tests help, and the ART Act basics (exists).
- **Doctor moments:**
  - 12 months of trying, or 6 at 35 to 39 (the trying page's rule). "Sooner with irregular periods or PMOS" is new wording
    for review.
  - Two or more losses: the repeated-loss page.
- **Reuse:** `ttc-prep`, `ttc-partner`, `ttc-tests`, the months-trying count, the fertile window view.
- **New for review:** the folate food steps and about 8 lessons.
- **Size:** S to M.

---

## 5. Order, size and who reviews

| Step | What | New health wording | Reviewer | Size |
|---|---|---|---|---|
| 0 | The diet audit's 39.0 fixes: the iron tablet page bug, loss pages in food searches, discreet For you | None | — | S |
| 1 | **The kit**, with all 8 plans moved onto it using today's content, and the `plans-walk.mjs` targets in the tests | Labels only | — | L |
| 2 | **Easier periods, Stronger blood, Calmer cycle.** Needs the diet audit's foods table (39.2) for the iron foods | Yes | A doctor; a gynaecologist for red flags, endometriosis and PMDD; a physiotherapist for period yoga | M each |
| 3 | **Strong pelvic floor** (with its new goal for every stage), then **Midlife** | Yes | A physiotherapist; a doctor for the CBT course and hormone therapy lines | S to M; L |
| 4 | **My pregnancy**, then **After the birth** | Yes | An MBBS doctor and a physiotherapist for every move | M; M |
| 5 | **Getting ready** | Yes | A doctor | S to M |

- **Review load:**
  - About 1,500 to 2,500 words of new English per programme (lessons, steps, doctor lines, results), plus Hindi. That's
    about 12,000 to 15,000 words in all.
  - Send one packet per programme (wording review §18 onwards, after the diet audit's §17), with each line next to its
    source, so the review becomes a tick list.
- **Drawings:**
  - About 20 new poses on the existing figure engine: cat-cow, reclined butterfly, side-lying moves, pelvic tilt, heel
    slides, a one-leg stand, a heel-to-toe walk, seated moves and a pelvic floor cue.
  - They're code, not image files, so the APK barely grows. A physiotherapist checks each one.
- **Testers:** nothing new reaches testers before review (Mohit's rule). The field test can start on the kit (step 1), with
  the period programmes following.
- **Languages:** English and Hindi in full, as now. The other 4 languages stay partly translated.

---

## 6. What not to build

- **No new conditions:** no diabetes, thyroid, mental-health or weight-loss programmes.
- **No scored screens or licensed questionnaires** (EPDS, PHQ-9, ICIQ, PSST, DRSP). Every measure uses our own words: the
  diary's pain levels and flow, a 0-to-10 problem rating, "never / sometimes / most days".
- **No doses in programme words.** Tablets, folic acid, calcium and painkillers are "as your doctor or ASHA advised",
  noted in the iron tracker or the medicines list.
- **No counting kicks to a number** (RCOG GTG 57, Grade A).
- **No self-diagnosis** of endometriosis, fibroids or infections. The "my doctor said" versions open only when she says a
  doctor told her.
- **No food said to ease a symptom** (cramps, bloating, PMS).
- **No promised result or percentage.** "What to expect" is a reviewed timeline: the Drugs and Magic Remedies Act, section
  3(c), and CDSCO's 2026 software guidance both apply. Check public claims with the lawyer before launch.
- **No habit plan after a loss.**
- **No streaks.** Missed days never count against her.
- **Exercise safety:**
  - stop signs on every routine;
  - pregnancy moves only after her doctor's OK;
  - after-birth moves only after the 6-week check (pelvic floor and breathing can start earlier).
- **Privacy:**
  - The diary stays on the phone.
  - Summaries go only in the existing "tools" section, and only when she ticks them.
  - Discreet mode says "My plan" and uses neutral step names for every programme.

---

## 7. How we'll know it works (field test; nothing is promised)

| Programme | Her measure | What would count as working by week 12 | Why that's a fair bar |
|---|---|---|---|
| Easier periods | Worst pain each period; days she couldn't do her day | Lower pain level, fewer days lost | Cochrane: about 25 points out of 100 with exercise (low certainty) |
| Stronger blood | Hb before and after; heavy days | The Hb retest done; Hb up if she took tablets | Anemia Mukt Bharat's 3-month course |
| Calmer cycle | Symptom days each cycle | Fewer in cycle 3 than in cycles 1 and 2 | RCOG: CBT Grade A for severe PMS |
| Strong pelvic floor | Leaks each week | Fewer leaks; some women stop leaking | Cochrane: cured in 56% vs 6% after at least 3 months |
| Midlife | Flush problem score; weeks with flushes | Down by about 1 to 2 points out of 10 | MENOS@Work: −1.5 at 6 weeks |
| My pregnancy | Check-ups and tablets on time; minutes | Every due item done in its window | The MoHFW schedule |
| After the birth | Leaks, minutes, recovery checks | Recovery checks to day 42; pelvic floor on most days | NICE NG210 |
| Getting ready | The checklist | Checklist done by week 4 | Sakhi's reviewed checklist |

For every programme, also track days followed each week, against the same targets as the companion journey (section 11).

---

## 8. Decisions for Mohit

1. **Kit first** (recommended), with all 8 plans moved onto it, rather than more branches in plan.js?
2. **Order:** the period programmes first (recommended), then pelvic floor and midlife, then pregnancy and after the
   birth, then getting ready?
3. **Reviewers:**
   - Dr. Megha for food, habits and lessons;
   - an MBBS gynaecologist for red flags, endometriosis, PMDD and the hormone therapy lines;
   - a physiotherapist for every move.

   Who, and is a weekly review slot possible? Sections 13 to 16 already wait.
4. **Two new goal choices** for content Sakhi already has: "Leaks or heaviness down below" for every adult stage, and
   "Tired, low iron" next to heavy periods?
5. **One main programme plus one add-on** (recommended), or strictly one at a time?
6. **Endometriosis and fibroids** as "my doctor said" versions inside Easier periods and Stronger blood (recommended),
   rather than programmes of their own?
7. **The midlife CBT course** written in our own words from NICE, IMS and the MENOS trials (recommended; the MENOS book
   can't be copied)?
8. **Girls under 18:** no programme for now (recommended), or a read-only "easier periods" for girls later?

---

## Sources

All checked on 19 or 23 Oct. The links are in the evidence report and in `docs/lifestyle-plans-research-2026-10-23.md`.
- **Period pain:** Cochrane, Armour 2019 (exercise); AAFP 2021; Jo and Lee 2018 (heat); Arik 2022 (TENS); ESHRE 2022
  (endometriosis).
- **Heavy periods and anaemia:** NICE NG88; Anemia Mukt Bharat operational guidelines 2026; NFHS-5.
- **PMS:** RCOG Green-top 48; Pearce, BJGP Open 2020.
- **Pelvic floor:** NICE NG123 and NG210; Cochrane, Dumoulin 2018 and Woodley 2020; POPPY (Lancet 2014).
- **Midlife:** NICE NG23 (2024); Indian Menopause Society 2026; MENOS 1, MENOS 2 and MENOS@Work; European insomnia
  guideline 2023.
- **Pregnancy and after the birth:** WHO 2020 physical activity guidelines; MoHFW GDM guideline 2018; RCOG Green-top 57
  (2026); NICE NG201; the MCP card.
- **Food:** ICMR-NIN Dietary Guidelines for Indians 2024 (through the diet audit).
- **Behaviour:** Michie 2009; Lally 2010 (in the companion journey doc).
