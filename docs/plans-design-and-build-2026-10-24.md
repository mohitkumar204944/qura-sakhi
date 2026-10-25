# How to design and build the remaining plans (advice, 24 Oct 2026)

Mohit, 24 Oct:
> "can you thoroughly research across other apps and researches and then advise how we structurally design and build
> other remaining plans"

**Status: advice only.** Nothing in the app changed. This session wrote two files: this one, and its appendix
`docs/plans-design-and-build-2026-10-24-programmes.md`. The appendix gives each of the 8 programmes week by week, the full
spec format, and the full source list.

**This replaces sections 2, 4 and 5 of `docs/programmes-every-condition-2026-10-24.md`** (written earlier today) where they
differ. That doc's sections 0, 1, 3 and 6 to 8 still stand, except as below. The kit here is step 39.4 of the journey audit.

**What changed:**

| Area | Earlier doc | Now |
|---|---|---|
| Where programmes live | `mods/prog-<id>.js` with `S.plan.pack(...)` | Pure-data files in `web/progs/`, read by one engine in `plan.js`. No code in content (`check.mjs` fails a mods file that registers no module) |
| The port | "Move all 8 plans onto the kit" | A day-by-day golden test first, then the port inside `plan.js`, one plan per commit. The cycle plan keeps its approved maths |
| Versions | Not covered | Each woman stays on the version she started (`d.pv`). Drafts only when `SAKHI_CONFIG.drafts` is true. Release needs a signed hash |
| Doctor moments | Fixed rules, including "no change by week 12" | Inside a programme, the same card for every woman at fixed points, never computed from her diary values. Where signals from her records live (pillar 1) is decision 5 |
| Rest days | Not covered | Offered as a tap; never applied silently |
| Daily load | 2 or 3 steps | At most 3 step rows across main plus add-on, plus one card. Red flags on top |
| Easier periods | 12 weeks; 45 minutes on 3 days | 12-week core plus "keep going" to her 6th period; a daily relaxation anchor; about 90 minutes a week with strength from week 5 |
| Stronger blood | "Tired, low iron"; 12 weeks | Care steps first (Test, Treat, Talk, Track); keep strong to month 12; "Low Hb, or told I have anaemia", only while she has periods |
| Calmer cycle | Log plus a skill a week | Results compare her week before the period with days 4 to 10; a crisis sheet and an active safety question |
| Pelvic floor | Holds of 3 to 10 seconds | 8 levels that unlock by doing; the knack in weeks 1 to 2; tracks by leak type; heaviness only after a doctor has seen her, never in pregnancy |
| Midlife | CBT weeks 1 to 6, strength 7 to 12 | Three 4-week modules in the order of her goal; strength and balance from week 1; an "aches and tiredness" entry; no computed sleep window in version 1 |
| My pregnancy | Moves after her doctor's OK | A two-part screen ("right now" signs go to go-now; "told by a doctor" sets the tier), asked again at weeks 14 and 28; no kick counting |
| After the birth | 6 weeks, then 12 "back to strong" | Dated from the birth to 1 year; the ASHA visit days; gentle moves from week 1 (obstetrician to agree); a path when a baby dies |
| Getting ready | Checklist for 12 weeks | Folic acid and the Hb test in the first fortnight; screen first, coach only her gaps; stops at once after a loss |
| Review sections | §18 onwards | §19 kit labels; §20 shared safety bank; §21 to §28 the programmes (§17 diet, §18 journey audit) |
| Size | 12,000 to 15,000 words, ~20 poses, 5 to 6 months | ~22,000 words as drafted (cut to ~16,000 by sharing lessons), ~28 poses, 6 to 9 months |

---

## 0. The answer on one page

**Build every programme on one skeleton.** Other apps' trials and the research agree on its shape:
- **A short core, then a long light "keep going" phase.** A weekly session (a lesson and a look-back), then one a month.
- **About 2 minutes on the phone a day.** At most 3 small steps and one card. The doing happens away from the phone.
- **Something new every week or two** on her path: a step, a level or a lesson.
- **Targets that follow what she did,** up or down. Slack, not streaks. A warm "welcome back".
- **Timed to her body** (period days, the days before her period, her pregnancy week, days since the birth), never to
  "cycle phases".
- **One measure in her own words.** Results are her before and since, never a verdict.
- **The same doctor cards for everyone** at fixed points, and a short fixed red-flag list. A person reads her data.
- **People at fixed moments** (week 2, a quiet spell, the ASHA visit days), sent only on her tap.

**Build it in five stages:**
1. **Golden test, then the port** (2 to 3 weeks). Record what all 8 plans do today; move them onto a registry in `plan.js`
   with identical output. Ship as R1, which changes nothing she sees.
2. **The kit's features** (about 2 weeks), against a fixture programme with placeholder words.
3. **A safety layer that doesn't depend on any programme** (2 to 3 weeks): one crisis sheet, care after a loss with every
   pregnancy reminder cleared, always-on pregnancy go-now signs, a notification budget, red flags discreet mode never hides.
4. **R2** (2 to 3 days, when you choose): today's 8 plans get tiles, a picture hero, rest days and welcome back, with no new
   health wording.
5. **The programmes, one at a time,** as data files: draft in demo builds, one review packet, release when the signed hash
   matches. Order: Easier periods, Stronger blood, Calmer cycle, Strong pelvic floor, Midlife, My pregnancy, After the birth,
   Getting ready.

**All 8 skeptic reviews said "fix needed":** 9 blockers and about 100 major issues, all applied in the appendix. The
blockers were safety gaps: a period-pain kit that could open on an ectopic pregnancy; pregnancy reminders ringing after a
loss; no path when a baby dies; "water leaking" sent to pelvic floor exercises; a heaviness track in pregnancy; abnormal
bleeding missing from midlife; an unsafe crisis button; an anaemia plan after a hysterectomy; and folic acid continuing
after methotrexate.

**The slow part is review:** about 22,000 new English words plus Hindi, about 28 poses, and four reviewer roles, two not yet
named. Code is not the limit. The sizes in this doc are conventional developer-days, and Claude build sessions have moved
much faster here (Versions 37.1 to 38, with three review rounds, took one day). With a weekly review slot, expect roughly one
programme every 3 to 4 weeks once the kit and the safety layer are in.

**The decisions that matter most** (section 9): the `web/progs/` layout; field-test women on R1 only; where signals from
her records live (decision 5, which touches your pillar 1); who reviews each tier; and health entries that only *offer*
changes.

---

## 1. How the research was done

**Eight tracks,** each with a researcher, then a verifier who checked every finding against its source:

| Track | Confirmed | Corrected | Refuted | Unverifiable | Unchecked |
|---|---|---|---|---|---|
| Periods (pain, endometriosis, PMS/PMDD, heavy) | 13 | 10 | 0 | 0 | 0 |
| Pelvic floor and return to exercise after a birth | 16 | 5 | 0 | 0 | 0 |
| Midlife | 11 | 9 | 0 | 0 | 1 |
| Pregnancy and after the birth | 11 | 10 | 0 | 1 | 0 |
| Preconception and anaemia | 15 | 8 | 0 | 0 | 0 |
| Design science (how programmes are structured) | 15 | 8 | 0 | 0 | 0 |
| Designing for Indian women | 15 | 3 | 0 | 1 | 2 |
| Safety, regulation and governance | 15 | 6 | 0 | 0 | 0 |
| **Total (175 kept)** | **111** | **59** | **0** | **2** | **3** |

"Corrected" means the verifier fixed a wrong number, population or claim. Some corrections change the design: the exercise
frequency rule in one paper's abstract was backwards (Xiang 2025), and the winning pelvic floor cue was tested in 56
physiotherapy students, not women with leaks (Ben Ami and Dar 2018).

**Limits.** The shared web-search budget ran out early, so verifiers fetched known pages by URL and PubMed ID. Many were
blocked (NICE 403, ACOG paywall, WHO IRIS 403). Wording from memory is marked "unverified".

**The design round:** three architecture proposals, scored 7.3, 7.9 and 7.5, merged into one (section 3); eight programme
designs, each reviewed by a skeptic who read the code (all "fix needed"); and a completeness critic (about 30 gaps, 30
contradictions and 25 weak claims, used in sections 8 and 9). Sources a designer fetched by ID are marked "(direct fetch)".

**Rules here:** only verified or corrected findings are evidence. Other apps appear at principle level, from published
trials and public pages. No app was installed or walked through.

---

## 2. What other apps and the research teach about programme structure

| # | Lesson | What it means for Sakhi | Source |
|---|---|---|---|
| 1 | **A weekly core, then light maintenance.** Programmes that just stop lose their gains | Every programme has a core and a "keep going" phase (one session a month, mostly to month 12). A missed session waits | DPP: 16 weekly then 6 monthly sessions (CMS 2026); follow-on support g≈0.39 (Middleton 2012); only ~8% of 54 gym programmes still worked after ending (Milkman 2021) |
| 2 | **Length follows the behaviour and the body** | Periods counted in periods; pelvic floor 3 months plus maintenance; midlife never "done"; pregnancy to the birth; after the birth to 6 months, then monthly | Cue-tied habits take weeks, exercise 4 to 7 months (Buyalskaya 2023); NICE NG123; flushes last a median 7.4 years (Avis 2015); Anemia Mukt Bharat |
| 3 | **Targets that follow what she did** beat calendar targets | A little above her typical day over the last 7 to 9 days; can step down; her "Keep the same" wins | Adams 2013, 2017 (rewards there were small payments; petals are our inference) |
| 4 | **Slack, not streaks. Reward the comeback** | "Every day, with 2 rest days." No miss shown. "Welcome back" and a petal after a gap | Sharif and Shu 2019 (4.00 vs 3.11 and 2.83 goal days; benefit only when people used the skip themselves); Milkman 2021 |
| 5 | **Something new each week; every screen ends in an action** | "Week 5 · new: Strength at home". Each lesson ends in "Try this today". Count steps done, not opens | Kelders 2012; Donkin 2013 (only activities per log-in predicted benefit) |
| 6 | **Lessons are an active ingredient, but broadcast alone fails** | For pain, PMS and midlife the lessons carry the evidence. Each ends in one action, checked back | Erol 2025 (pain-science teaching); Weise 2019; MENOS@Work; Kilkari's 72 one-way calls didn't change exclusive breastfeeding (LeFevre 2022) |
| 7 | **Short, spoken, picture-led** | 3 cards of 25 words or fewer, read aloud: 60 to 90 seconds. No video, no text-only screens | Kilkari calls averaged 77 s; Guo 2014; Meppelink 2015 (spoken animation closed the low-literacy recall gap); Medhi 2011 |
| 8 | **Time care to her body; never cycle syncing** | Symptom care in her own windows. Exercise never gets "harder" or "gentler" by phase | McNulty 2020; Colenso-Semple 2023; the period-pain app trial began 5 days before the expected period (Wang 2020) |
| 9 | **Expect 25 to 45% to stop; front-load essentials** | Red flags, the most useful skill and her measure all in weeks 1 to 3 | 43% pooled dropout (Meyerowitz-Katz 2020); 65.5% in a self-guided endometriosis pilot (Kronthaler 2026); 72.7% → 58.6% use by week 12 (Rohloff 2024) |
| 10 | **People at fixed moments and on drift,** rationed | Week-2 offer, a quiet-spell offer, ASHA days; sent only on her tap | Guidance matters for more severe symptoms (Karyotaki 2021); 12 calls = 24 (Spring 2020); targeted calls cut drop-off 32% vs standard care, not significantly more than calling in turn (ARMMAN 2022) |
| 11 | **Build on visits she will really get** | Pregnancy on the MCP schedule; after the birth on the ASHA days. Measure "done on time", not facility outcomes | ImTeCHO RCT: first-week visits +10.2 points, exclusive breastfeeding +13.4, facility care unchanged (Modi 2019) |
| 12 | **Write for her family, as her choice** | "What elders may say" cards; an optional "For him" card shown on her screen, never sent, off until she turns it on | Family norms beat the message (Scott 2021); CHARM couple sessions (Raj 2016); spousal violence 22.3% (NFHS-6) |
| 13 | **One measure at its natural rhythm** | Pain per period, leaks per week, flushes per week, the PMS log daily for 2 cycles only. "Most days" is success | Patel 2021; Etkin 2016; fixed-week bother questions (Tät II, Wadensten 2021) |
| 14 | **Screen first, coach the gaps** | Getting ready asks once, then coaches only what she isn't doing; asks again every 6 weeks | Smarter Pregnancy RCT, diet risk β 0.75 (van Dijk 2020) |
| 15 | **Levels unlock by doing** | Pelvic floor and balance levels unlock from completed sessions plus an "easy" tap | Tät trials (Hoffman 2017; Wadensten 2021); StandingTall (Delbaere 2021) |
| 16 | **A tablet's first days decide; one aid at a time** | A "what to expect" card, a day-3 check, a calendar from week 3 | Anemia Mukt Bharat toolkit; CSBC trial (calendar alone helped, calendar plus card didn't) |
| 17 | **Reminders: specific, tapering, one-way** | One evening reminder by default, fewer once steady, nothing needs a reply | Head 2013; Klasnja 2019; replies fell to 10.8% by week 24 (Soepnel 2022) |
| 18 | **Points fade after the end** | Petals in the core; her own results afterwards | g=0.42 during, 0.15 after (Mazeas 2022) |
| 19 | **Safety by fixed lists, not triage** | 5 to 7 red flags per programme at fixed urgency, the same for everyone | Symptom checkers right 57% of the time, and over-referred (Semigran 2015); CDSCO 2026 §7 |
| 20 | **Privacy is the condition for messaging to help** | Neutral names, private lessons behind the PIN, nothing on WhatsApp | Ames 2019 (Cochrane qualitative); Sambasivan 2018 |
| 21 | **Real-world effects are smaller** | "What to expect" has no numbers; field-test bars are about process | Same pelvic floor app: 2.2 vs 3.9 points (Rygh 2021) |

**Avoid** (seen across the field, principle level): community feeds; cloud chatbots and voice input; WhatsApp delivery;
paid courses with cure timelines; supplement and test bundles; cycle-phase workout calendars; paywalled content; analytics
SDKs.

---

## 3. The structural design

### 3.1 A programme is a data file

Each programme is one pure-data file in `web/progs/`, with no functions or computed values (`progs.mjs` checks a JSON round
trip). Its rules are words from a closed vocabulary; new behaviour means one new engine word with its own test. The full
spec format and a worked example are in the appendix's introduction. A spec declares: id, version and status (`live`,
`draft`, `approved`); tier (habit or condition); a disease-free purpose; titles; goals and "my doctor said" variants; life
rules (pauses, chains); its clock and length; phases; hero; slots; rest days; windows; steps; routines; food; measures;
results; lessons; "what to expect"; red flags; doctor cards; offers; safety; add-ons; and worked examples.

**Text** is `{ en, hi }`, or a reference to reviewed text: `'@plan_key'` or `'@mod:key'` (another module's string). Both are
resolved into the hash, so editing a reviewed line anywhere breaks the signed hash. The token `{help:crisis}` renders the
one crisis component, so no programme file holds a helpline number.

**Every word has a tag, and the tag decides where it may be used:**

| Tag | Examples | Steps? | Doctor cards, red flags, offers? |
|---|---|---|---|
| answer | `ans:pain=stop`, `variant:endo`, `gate:move=red`, `csec` | Yes | Yes |
| calendar | `week:5`, `trimester:2`, `pregWeek:28`, `birthDay:42` | Yes | Yes |
| clock (her logged dates) | `period:3`, `periodDays`, `window:pain` | Yes | Milestone timing only (decision 4) |
| stage | `stage:preg`, `phase:build`, `module:rest` | Yes | Yes |
| tap (her own tap on a fixed list) | `tap:redflag:x`, `tap:lighter`, `tap:flare` | Yes | Yes |
| usage | `quiet:7` | No | Offers only |
| health value (pain level, flow, Hb, mood) | | **Only to offer a choice** ("Make today a rest day?") | **Never** |

That last row is the main safety rule: it keeps Sakhi on the "inform" side of CDSCO's line on triage, and matches the
finding that rest helps when she chooses it. The diary-independence test (6.3) enforces it.

### 3.2 The engine and the files

```
web/progs/order.json   _bank, v1, pain, heavy, pms, pelvic, meno, preg, post, ttc
web/progs/_bank.js     shared poses and routines, lesson drawings, red-flag bank, stop strips, scales, screens
web/progs/v1.js        today's 8 plans as 'live' specs ('@key' text only, baseline hash)
web/progs/<id>.js      one programme each = one review packet
web/mods/plan.js       the engine and its pages: registry, clock, vocabulary, adapters, stepsFor, growVal,
                       resultsFor, doctorAt, renderProgramme
web/tools/progs.mjs    check · packet <id> · hash <id> · gate --release
docs/reviews/<id>-v<ver>.json   the signed record (by, registration, role, date, section, hash, teach-back, next)
```

- **Loading:** a PROGS block in `index.html`, written by `build.py`, before the modules; `plan.js` reads the registry at
  call time. Not `.json`, because the WebView can't fetch `file://`.
- **Adapters, not code in specs:** module-owned steps go through engine adapters moved unchanged from `actionsFor`
  (`cycle.today`, `bed`, `preg.due`, `post.rcheck`, `journey.iron`, `ttc.prep`, `meno.diary`). The cycle plan's ladder stays
  inside `cycle.today`.
- **Unmoved:** `R`, `SUN`, `P`, `ANIM`, `Q` and the food tables stay in `plan.js`; new poses merge from `_bank.js`.
- **Release gate:** `live` specs match their baseline hash; `approved` ones match their signed record. `npm test` and
  `build-apk.sh` run the gate; `build-apk.sh` leaves drafts out of non-demo builds.
- **Scans:** the network, `wa.me` and old-WebView scans in `signup.mjs`, `privacy.mjs` and `fieldtest.mjs` add `progs/`.

### 3.3 One page for every programme

`journeyCycle` and `renderLight` become `renderProgramme`, in a fixed order: her clock ("Period 2", "Week 18 of
pregnancy"); the urgent row (always first); a hero; today's steps; this week's lesson; the look-back; her path with "new this
week"; four tiles (My food, My moves, My measure, My progress); one results line; care team and "When to get help".

Heroes: `ring` (today's exact cycle-plan markup), `list` (today's light-plan markup), `window` (period kit or calm week),
`sets` (pelvic floor), `module` (midlife), `timeline` (pregnancy, after the birth), `milestones` (Stronger blood, Getting
ready).

### 3.4 The daily loop

- **Today: at most 3 step rows and one card.** The rows come from the main programme and add-on together, in this order:
  a check or gate due today; the anchor step; the move or food step. The add-on takes the lowest slot on its days. The card
  is the week's lesson, a due check-up or a milestone. Red flags and other modules' urgent cards sit above and don't count.
- **Days 1 to 3** (MODULE_API §40): at most 3 steps and one card besides red flags. Lesson 1 opens from the evening
  check-in; tests and checklists start on day 2 or later.
- **Doing:** routines on the figure engine with a timer, read-aloud, swaps and a stop strip; then "easy / just right / hard"
  and "Did this help?".
- **Evening check-in** at her time: each step done, partly or not today; her log in 3 taps or fewer; "Rest day"; one line of
  feedback and a petal. Period-day logs open the diary's own sheet (`S.openLog`), so the diary is the only writer.
- **Drift:** after 3 quiet days, the fresh-start card; after 7 (5 in late pregnancy and the first 6 weeks after a birth),
  "Want someone to call you?", routed as in 3.9.

### 3.5 The weekly loop

On day 1 of each plan week (shown days 1 to 3): what she did ("5 of 7 days", rest days counted); the programme's one
question; next week's target with "Keep the same / A bit more"; this week's lesson; what's new on the path. Fixed moments sit
on their own days, the same for everyone. Programmes counted in periods show a "This period" card when each period ends.
After the core, a monthly session replaces the weekly one.

### 3.6 Progression and adaptivity

| Growth rule | How | Used by |
|---|---|---|
| `table` | Fixed rows by week, pregnancy week or days since the birth | v1 plans; pregnancy; early after-birth weeks |
| `adaptive` | Up one step after 5+ days followed; same after 3 to 4; down after 2 or fewer; floor and cap; frozen for the week | Walking and minutes everywhere |
| `level` | Unlocks after 5 days with a full set; "easy" twice offers it sooner; she can stay or go back; carries across a chain | Pelvic floor (8 levels), balance (5), after-birth core |

The cycle plan keeps its approved ladder until you decide otherwise.

- **Her body:** `periodDays`; `window:pain` (5 days before her likely start to her last pain day, at most 7; from her first
  bleed if irregular, and never while her period is late); `beforePeriod`. No step gets harder in a window.
- **Kindness:** 2 rest days a week she taps. When she logs a day her pain stopped her day, heavy flow, a flare or a red-flag
  sign, Sakhi *offers* "Make today a rest day?". "Lighter day" swaps in a gentler routine. Fresh starts at the last level she
  managed. No streaks, never "you missed".
- **Gates, from her own answers:**
  - Pregnancy, in two parts. "Right now" signs open the go-now card. "Told by a doctor" signs set red (daily life, breathing
    and pelvic floor only) or amber (easy walking). Asked again at weeks 14 and 28 and after any danger tap.
  - Adults: a short screen for every programme with moves (heart or lung problem; chest pain or faintness on effort; very low
    Hb; BP medicines). A yes means easy walking plus "ask your doctor".
  - After the birth: C-section; everyday load tests; a fallback unlock after day 42.
  - Midlife: bone-safe moves by default; an impact-ready check.
  - Pelvic floor: squeezes that hurt switch to relax-first.
- **Variants** ("my doctor said") open only from her answer, starting with "Keep following your doctor's treatment; this
  plan adds habits around it".

### 3.7 Lessons

3 picture cards of 25 words or fewer, read aloud card by card; pictures are figure poses, small SVG scenes or icons. A lesson
unlocks on its clock and its id is pinned, so an update can't change a week in progress; an unopened one waits. CBT chapters
can be split into 1 or 2 cards a day. Weeks 1 to 3 carry the red flags, the most useful skill and her measure. With no Hindi
voice on the phone, lessons work as picture-first cards. Family cards are off until she turns them on and are shown, never
sent. **Shared lessons cut words:** one "when to see a doctor", one "telling your family", one "find your pelvic floor", one
tablet "what to expect".

### 3.8 Measures and results

One main measure per programme, at its natural rhythm, from the diary where it already exists. Our own words only, from a
shared scale bank (a 3-point frequency scale, a 4-level impact scale tied to the diary's pain levels, one picture severity
scale). No ICIQ, PSST, DRSP, EHP, EPDS, PHQ, ISI, PSQI, HFRS, MRS, Wong-Baker, PBAC as a score or PAR-Q+. Results are counts
and charts, never a verdict, never a percentage; like with like; enough days logged; "Periods vary; look at several".
Discreet mode shows only days followed. Each programme adds one doctor-summary line, sent only when she ticks it.

| Programme | Main measure | Compared |
|---|---|---|
| Easier periods | Worst pain and days she couldn't do her day | 3 periods before vs since; periods 1 to 3 vs 4 to 6 |
| Stronger blood | Days bleeding got in her way; Hb as she typed it | First vs latest, same product |
| Calmer cycle | Days with her signs in the 7 days before each period, and on days 4 to 10 | Cycle 3 vs cycles 1 and 2, as share of logged days |
| Strong pelvic floor | Leaks this week, and when | First 2 weeks vs last 2 |
| Midlife | Her goal's one weekly number | First 2 weeks vs last 2 |
| My pregnancy | Check-ups and tests done in their window | By trimester |
| After the birth | Leaks this week, plus wind and stool | Weeks 3 to 4 vs last 2 |
| Getting ready | Her 1-minute ready check | Then vs now |

### 3.9 Doctor moments and safety

1. **Same for everyone.** Only her answers, the calendar, her logged dates (for milestone timing), her stage and her taps.
   Never health values.
2. **The diary's reviewed warnings stay core's** (`pads_4`, `clots_2`, `pain_3`); programmes link, never recompute.
3. **Inside a programme, every woman sees the same end card.** Whether today's `noChange()` ("nothing changed: see a
   doctor") lives on as a pillar-1 signal from her records, or retires, is decision 5.
4. **Four urgency levels,** mapped from the reviewed lines in `app.js`: **Now** (112, 108, 102); **Today**; **This week**;
   **At your next visit**. One urgency per sign, in one bank, with stage overrides (burning urine: "this week", but "today"
   in pregnancy).
5. **5 to 7 red flags per programme** from the bank: at the start, in lesson 1, in "When to get help", and on every routine.
   Discreet mode rewords them; it never hides them (fix `plan.js` lines 480 and 1448).
6. **"My doctor said" versions** never name, change or stop a medicine.

| Topic | First | Never |
|---|---|---|
| Danger signs | 112, 108, 102; the nearest 24-hour facility | A Qura call |
| Pregnancy, the weeks after a birth | ASHA or ANM, PHC, the free government doctor; 104 | A Qura call from a programme trigger |
| Low mood, thoughts of harm | Tele-MANAS 14416; 112 if in danger now; an MBBS doctor | A Qura (BAMS) call |
| Not safe at home | Women Helpline 181; 112 | Anything sent to another phone |
| Hormones, endometriosis, fertility treatment, surgery | An MBBS gynaecologist, government OPD first | Herbal or tonic advice |
| Habits and plan questions | "Ask Qura to call me": one-off, her tap, topic "A call about my plan" | Ongoing coaching driven by her data |

Qura confirms bookings on WhatsApp, so it must confirm in writing that the template never carries the topic.

**The crisis sheet** is one core component with two neutral choices: "Thoughts of harming myself" (14416, 1-800-891-4416,
112) and "Someone at home hurts or scares me" (181, 112). No Qura row; stores nothing; works offline. Logs label it "Need
help now?". Numbers live in one constant with a dated test call each release; today `14416` is typed 122 times in `app.js`
and the modules, 79 times in `content.json` and 84 more in its source files in `web/content/`.

### 3.10 Safety that doesn't depend on any programme

Most women won't finish a programme, so these go into core or their own module, for every woman, in every build:
1. **The crisis sheet**, from Help, every check-in and every lesson. Today Help's second row, "See a doctor", opens the
   doctor page with the Qura call card on it (`openHelpSheet`, `app.js` 876 to 889, calls `ask('')`); the crisis sheet gets
   its own row instead, and Tele-MANAS moves up from 5th place in the emergency numbers (`HELPLINES`).
2. **Care after a loss** in `loss.js`: no steps or petals. It stores the kind of loss (miscarriage, ectopic with or without
   methotrexate, molar, abortion, stillbirth, newborn or infant death), shows go-now signs, follow-up checks (hCG, anti-D,
   the 6-week check, milk coming in), the crisis sheet and spacing. `endPregnancy` and a new "My baby has died" clear every
   pregnancy, iron, vaccine and plan reminder. Getting ready restarts only on her tap, and after methotrexate or a molar
   pregnancy only once she ticks "my doctor says I can try again".
3. **Pregnancy go-now in `preg.js`:** the danger strip and "Baby moving less?" from 28 weeks, with or without a plan, in
   tester builds too. The kick counter's "Stop at 10" goes.
4. **A notification budget:** at most 2 health reminders a day, neutral titles in every mode (today "Iron tablet" shows on
   the lock screen unless discreet or shared mode is on).
5. **One recorded safety-audio bank** (red flags, stop strip, crisis) for every programme, instead of per-programme
   recordings that would add 15 to 25 MB to a 5.4 MB APK. Its text is hashed, so a wording change forces a new recording.

### 3.11 Add-ons and overlapping conditions

One main programme plus at most one add-on: one step a day and one measure line, plus its own safety and milestone cards.
Add-ons: iron tablets with the Hb milestones; pelvic floor sets (or relax-first); the period-week kit; the PMS log; folic acid.

**When they meet:** the strictest gate and the lowest target win; the add-on inherits the main programme's gates; red flags
merge by bank id at the highest urgency for her stage; one weekly question; one shared period-day card; the 3-row cap holds.

| Pair | How it runs |
|---|---|
| Painful and heavy (adenomyosis, fibroids) | Easier periods plus the iron add-on; one period-day card; the move target holds until the Hb test is done |
| Endometriosis and trying | Getting ready "doctor-first", with the period kit; no pre-period kit in the two weeks before a likely period |
| PMOS and trying | Getting ready "PMOS" version (doctor-first card, cycle routines in the move slot), not two main plans |
| Heavy at 40+ | Stronger blood; a fixed gynaecologist card from 45 |
| After the birth with low Hb | After the birth plus iron (180 days) |
| Pregnancy with sugar | A "support my care" branch inside My pregnancy |
| Leaks | Pelvic floor sets as an add-on; never a heaviness track in pregnancy; add-on only at the trying stage |
| Midlife with leaks | A leak and heaviness check before any impact step |

A **maintenance slot** sits apart from the main slot, so a woman in keep-going can start the plan she needs next.

### 3.12 Discreet mode and shared phones

Neutral titles ("My plan") and step names everywhere; sensitive programmes (pelvic floor, PMS, getting ready, mood after a
birth) stay neutral even outside discreet mode. Notification text belongs to the engine and never names a condition,
pregnancy, loss, leaks or iron. Discreet mode hides private lessons (they open after the PIN), results except days followed,
the trimester path and family cards; it never hides red flags. On a phone marked shared, plan start offers discreet mode in
one tap; read-aloud is off by default, so counts use tones and vibration. The hand-off topic is always neutral.
`plans-walk.mjs` scans screens, reminders, shares and topics for health words in English and Hindi.

### 3.13 Languages

English and Hindi complete for every text (`progs.mjs` fails otherwise); Marathi falls back to Hindi, Bengali, Tamil and
Telugu to English. A programme is offered in a language only when its safety bank exists in that language. A native-speaker
writer drafts the Hindi, and the gynaecologist reads the Hindi of every safety line, because it sits in her signed hash.

---

## 4. The 8 programmes at a glance

Programme 0, the cycle plan, stays as approved. It joins the claims register now (a disease-free purpose; the "PMOS plan"
summary heading `plan_sum_h` renamed) and gets a dated v2 later.

| # | Programme | For | Shape | Daily anchor | Main measure | Fixed doctor moments | Code days |
|---|---|---|---|---|---|---|---|
| 1 | **Easier periods** (`pain`) | Painful periods; doctor-diagnosed endometriosis or adenomyosis | 12 weeks, keep going to period 6 | Unwind (relaxation); moving 3 days to ~90 min a week; the pain-window kit | Worst pain, days lost | Start; week 4; week 12 or period 3; period 6 | 5 to 7 |
| 2 | **Stronger blood** (`heavy`) | Heavy periods; low Hb while she has periods; doctor-diagnosed fibroids or polyps | Test, Treat, Talk, Track in 12 weeks; keep strong to month 12 | Tablet as advised; iron food; 3-tap period note | Days bleeding got in her way; Hb | Hb test week 1; doctor weeks 2 to 3; check week 5; retest; months 6 and 12 | 3 to 5 |
| 3 | **Calmer cycle** (`pms`) | PMS; PMDD beside a doctor | 3 cycles; keep going to month 12 | Calm breath; the log in the check-in for 2 cycles; one CBT skill a week | Sign days before vs after the period | At her 2nd logged period; end of core | 4 to 6 |
| 4 | **Strong pelvic floor** (`pelvic`) | Leaks or heaviness, any adult stage | 12 weeks (leaks), 16 (heaviness, after a doctor); keep strong | 1 to 3 sets at her level; the knack | Leaks this week | Squeeze check weeks 2 to 4; heaviness check-ins; 3 months | 4 to 5 |
| 5 | **Midlife** (`meno`) | 40+; POI only after a doctor | Three 4-week modules by goal; keep going | A move row; today's skill | Her goal's weekly number | Week 2; week 4; week 8; week 12 | 8 to 11 |
| 6 | **My pregnancy** (`preg`) | Weeks 4 to 41 | To the birth | Due now; moves after the screen; pelvic floor; food or tablets | Check-ups done on time | MCP schedule; screen at start, 14, 28; sugar test; weeks 36 and 41 | 5 to 7 |
| 7 | **After the birth** (`post`) | A live birth in the last year | 18-week core; to 6 months; monthly to 1 year | Recovery check to day 41; a set during a feed; walk | Leaks, wind and stool | ASHA days; 6-week check; sugar and BP if needed; weeks 8 and 13 | 5 to 6 |
| 8 | **Getting ready** (`ttc`) | Trying or planning, 18+ | 12 weeks; monthly until pregnant or her doctor month | Folic acid as advised; walk; food | Ready check | Doctor-first on day 1 if her answers say so; weeks 6, 12, monthly | 2 to 4 |

**New English words as drafted:** pain ~3,200; heavy ~1,350 (plus ~900 reused); PMS ~2,200; pelvic ~2,600; midlife ~4,700;
pregnancy ~4,000 to 4,500; after the birth ~3,000; getting ready ~1,550. About 22,600 in all, plus Hindi.

---

## 5. How content gets made, reviewed, translated and versioned

1. **Author** in `web/progs/<id>.js` from the fixture skeleton, English and Hindi side by side, reusing reviewed lines by
   reference, a source on every health line, poses from the shared library (one name per pose).
2. **Check:** `progs.mjs`, `kit.mjs --prog <id>`, `plans-walk.mjs --prog <id> --assert`.
3. **Packet:** `web/tools/progs.mjs packet <id>` prints the section: line id, English, Hindi, source, kind; "please check"
   vs "please glance"; a physio sheet; a hazard log; the purpose; a diff; the sha256; screenshots. Split into **A**
   (safety), **B** (steps and routines), **C** (lessons), so A and B can ship first.
4. **Sections in `docs/wording-review-v28.md`:** §19 kit labels; §20 the safety bank, crisis sheet, care after a loss and
   the conflicts register; §21 Easier periods; §22 Stronger blood; §23 Calmer cycle; §24 Strong pelvic floor; §25 Midlife;
   §26 My pregnancy; §27 After the birth; §28 Getting ready.
5. **Reviewers by content:** habits and lessons to Dr. Megha (and a physiotherapist for moves). Every packet A to an MBBS
   gynaecologist, plus a psychiatrist or RCI-registered clinical psychologist for mood and crisis lines. Purpose lines,
   titles and store copy to the lawyer.
6. **Women:** one combined comprehension study of the shared safety pictograms and poses through ASHAs (20 to 30 women;
   redraw any safety icon under about 85% correct), then per programme only its new icons, plus a teach-back of its red
   flags with about 5 low-literacy Hindi-speaking women. Written consent for both.
7. **Sign-off:** `docs/reviews/<id>-v<ver>.json`, status `approved`. Any later edit breaks the hash.
8. **Versions:** new starts get the new version; `d.pv` keeps a running woman on hers. Bank safety lines apply at once
   (from R2) and are named in What's new.
9. **Re-review:** safety lines yearly; lessons every 2 to 3 years; sooner when a watched guideline changes. Lessons show
   "Checked by a doctor, {month year}".

**Conflicts with existing pages** (reviewed in §20 first):
- `pregtools.js` "Stop at 10", and `plan.js` line 1339 adding the kick counter from week 28.
- `post.js` line 335 (cue leads with "stopping your wee"), line 344 (belly gap "usually closes by 8 weeks"), line 271
  (Hindi `pf_goal` missing a sentence).
- `explain.js` line 94; `intimate.js` lines 363 and 365.
- `iron.js` "Below 7 needs a higher centre"; dose words; a tea timing that differs from other pages.
- `relief.js` named nausea foods, "Sip something cool", box-breathing holds.
- `plan.js` `plan_fb_hot`, `plan_fb_calm`, `plan_fb_bones`, `plan_gv_heavy`, and `plan_fb_sleep` ("your cycle").
- The PMS page's "small meals"; the blood-loss chart's "100 or more"; `family.js`'s iron card shared to WhatsApp.

---

## 6. The build plan

### 6.1 Steps in order

| # | Step | New health wording | Size |
|---|---|---|---|
| A0 | `web/test/plans-golden.mjs`: 25 goal cases for 84 days, check-ins most evenings, periods on days 25, 53 and 81, a birth on day 40; records steps, Yesterday, card kinds, reminders and My plan HTML, with discreet and Hindi passes | None | 1 to 2 days |
| A1 | The 8 v1 specs as data inside `plan.js` | None | 1 to 2 |
| A2 | `stepsFor` and adapters, one plan per commit (pms, pain, ttc, meno, heavy, post, preg, cycle) | None | 5 to 7 |
| A3 | Reveal, path, results, start card and summary from the spec; `noChange()` behind a legacy flag | None | 2 to 3 |
| A4 | Out to `web/progs/`: build, gate, tools, scans, `CLAUDE.md` publish steps = **R1** | None | 2 to 3 |
| A5 | `renderProgramme` with `ring` and `list` heroes | None | 1 to 2 |
| A6 | Kit features against `fixtures/progs-kit.js` | None | 7 to 10 |
| B1 | Crisis sheet, helpline constant, Help order | §20 (labels) | 2 to 3 |
| B2 | Care after a loss; reminder clean-up; "My baby has died" | §20 (mostly reused) | 3 to 5 |
| B3 | Pregnancy go-now and "Baby moving less?" in `preg.js`; kick tool without a number | §20 | 2 to 3 |
| B4 | Notification budget; neutral titles; tapering through Android rescheduling | Labels | 2 to 3 |
| B5 | The safety bank in `_bank.js`; discreet never hides red flags | §20 | 2 |
| R2 | Uplift for today's 8 plans; golden re-recorded in one commit naming each change | §19 | 2 to 3 |
| C | Module prerequisites, each before its programme (below) | In each packet | 20 to 35 in all |
| D1–8 | Programmes: draft, packet, teach-back, signed hash, pilot | §21 to §28 | 36 to 51 in all |
| E | Retire v1; cycle plan v2 | Cycle v2 | Later |

**About 90 to 130 code days in all,** beside review. These are conventional developer-days from the architecture round;
with Claude build sessions the code has gone much faster in this repo, so reviewer hours set the calendar: all 8
programmes in about 6 to 9 months at one weekly review slot, sooner with more.

**Prerequisites (step C):** a per-day pain event read by `painCompare`, the diary, `docportal` and the report but not
`explain.js`; per-day flow with the product and a cloth path; "Did this help?" after plan routines; `S.iron.info()`, several
tablet plans at once and an every-other-day rhythm; pelvic levels and a stage-neutral trainer store in `post.js`;
`situation.feedHow` beside the true/false `breastfeeding` (about 12 readers); `stageNow` staying "post" while the plan runs;
a "Baby born?" prompt from 28 weeks; a PMS window-count API in `periods.js`; a morning reminder; a discreet-aware relief
player; a picture-clock picker and spoken 0-to-10 scale.

### 6.2 Moving today's plans with every test green

- A0 to A6 leave the golden output byte-identical; it is re-recorded only from R2, in a commit that names the difference.
- No existing suite sets `SAKHI_CONFIG.drafts`, so none sees a draft (including `pmosplan`, whose default is a demo config).
- Every suite stays green at every step (signup, tours, me, privacy, companions, plans, value, insights, fieldtest, handoff,
  notify, pmosplan, companion, firstday, notices, goals, maths, smoke, `check.mjs all --quick`, server, Android), and the
  four walks run before and after.
- Saved data only gains fields. Tests seed V35, V37 and V38 shapes for every changed module, and one test restores an old
  backup into the new build.

### 6.3 Tests and depth targets

- **`progs.mjs`** (node, under a second): purity, schema, vocabulary and tags, complete Hindi, every reference exists,
  lesson limits, stable ids, lints in both languages (doses, percentages, helpline digits, promise words, licensed tool
  names, kick counts, food-for-symptom, "meridian"), neutral private names, poses exist, no lying on the back after trimester
  1, no network or `wa.me` code, hashes, overdue reviews.
- **`kit.mjs`** (about 150 checks on the fixture), **`loss.mjs`** (a loss with each plan; methotrexate gate; reminders
  cleared), and **`kit.mjs --prog <id>`** (each spec's worked examples).
- **The diary-independence test:** each programme with three diaries that differ only in health values gives identical
  doctor and red-flag cards every day, and identical steps apart from offered chips.
- **`plans-walk.mjs --prog <id> --assert`:** 8+ different steps; something new at least every 2 weeks or every period; 6+
  lessons; her measure in results by day 50; 3+ pictures and 4 tiles on day 8; 3 step rows or fewer plus one card; the days
  1 to 3 budget; about 2 minutes a day outside routines; each doctor moment on its day only; no Latin text on Hindi screens;
  no health word in discreet mode; no page errors.
- **Devices:** one or two low-end phones, the no-Hindi-voice path, the largest font; `build-apk.sh` fails above a size
  ceiling (proposed 12 MB).

### 6.4 Acceptance criteria

- **R1:** golden identical; all suites green; the APK boots under its CSP; a build with adb off the path succeeds.
- **Kit:** `kit.mjs` and the independence test green on the fixture; a draft is invisible without the flag.
- **Safety layer:** after a loss no pregnancy, iron or plan reminder remains; the crisis sheet has no Qura row and stores
  nothing; "Baby moving less?" shows from 28 weeks with no plan and in a tester build; no health word in any default
  notification title.
- **Each programme:** release gate passes with a signed record; its tests, walks, independence test and discreet scan
  green; Hindi complete; teach-back done; new safety icons at about 85% or redrawn; the lawyer's written view for
  condition-tier titles and purpose; checked on the Flip5 and a low-end phone.

---

## 7. What not to build

- **No new conditions:** no diabetes-prevention plan after a birth (no effect in the LIVING trial), no general insomnia,
  mental-health, weight-loss or thyroid plan.
- **No anaemia plan without periods:** after a hysterectomy or menopause, low Hb gets a doctor card.
- **No scored or licensed questionnaires,** and no versions that copy their items.
- **No doses, supplements, herbs, tonics or "fertility teas"** in programme words.
- **No food said to ease a symptom,** raise fertility or decide the baby's sex.
- **No self-diagnosis** of endometriosis, fibroids, prolapse or infection; no internal self-examination.
- **No kick counting to a number.**
- **No interactive triage;** no doctor prompt from her values.
- **No computed sleep window** in Midlife version 1.
- **No running, jumping or heavy lifting** in any programme.
- **No press-point routine for now** (a new technique; needs drawings the figure engine can't show; decision 13).
- **No streaks,** no "you missed", no ending a plan for absence.
- **No habit plan after a loss.**
- **No feeds, chatbots, voice input, analytics SDKs, WhatsApp, SMS or Meta.**
- **No video,** and no per-programme audio libraries.
- **No server-side drop-out prediction.**
- **No promised outcomes** in the app, store listing or website.

---

## 8. Gaps and risks

### 8.1 The biggest risks

| Risk | What keeps it small |
|---|---|
| **Review capacity:** ~22,000 words plus Hindi, ~28 poses, four reviewer roles (two unnamed), §13 to §16 still waiting | Name reviewers before D1; packets A/B/C; shared lessons; v1 stays live; drafts in demo builds |
| **Port regressions** | The golden test; one plan per commit; adapters moved unchanged; the cycle plan untouched |
| **Safety harm** (pregnancy, after a birth, anaemia, osteoporosis, ectopic, loss) | The core safety layer; gates; one stop strip; brisk-walk ceiling; a physiotherapist signs every pose; the late-period gate before any period kit |
| **Regulation** (CDSCO 2026 example 10: coaching and tracking to mitigate a disease) | Disease-free purpose lines; claims lints; no verdicts; same-for-everyone doctor cards; the lawyer's written view before anything leaves demo builds |
| **No recall** for a bad line once released | A version check through `net()` that sends nothing about her, or a written recall procedure (decision 18) |
| **Shared-phone exposure** | Neutral defaults; PIN-only lessons; opt-in family cards; the discreet scan |
| **An unrepresentative test bench** (only a Flip5) | Low-end phones and the no-voice path every release |
| **Storage** over a year of daily logs | A 12-month storage test; backup covers every new field |
| **The field test can't judge 8 programmes** on 8 to 10 women | Cover R1 or R2 plus Easier periods; a written protocol with consent and process endpoints; an ethics committee's view (decision 19) |

### 8.2 Where the designs disagreed, and what this doc decides

| Disagreement | Decision |
|---|---|
| `mods/prog-*.js` (designs) vs `web/progs/` (architecture) | `web/progs/`; the designs' special screens become kit features |
| Review numbering differed in every design | §19, §20, §21 to §28 |
| Steps: 3 plus add-on plus "try" vs 3 across both | 3 rows across both, plus one card; the "try" lives in the lesson card |
| Add-ons of 3 parts | One step plus one measure line, with its own safety and milestone cards |
| Rest applied automatically in five designs | Offered as one tap |
| Period milestones use her logged dates; doctor rules refused cycle words | Her logged starts count as her clock for milestone timing only (decision 4) |
| Health values gating steps | They may offer a change, never make it |
| Pelvic: "1 set is on track" vs the reviewed "10 squeezes, 3 times a day" | 1 set counts as followed; the words say "a good start; 3 a day is the full dose" |
| Four level-unlock rules for one trainer | One rule (3.6), physiotherapist to confirm |
| Quiet offer after 5 or 7 days; Qura in pregnancy and for mood | 7 days (5 in late pregnancy and the first 6 weeks after a birth); routing by topic; from 24 weeks the card first asks "Has anything changed?" |
| A 30-week cap vs keep-going to month 12 | No cap; a maintenance slot |
| Helpline numbers inside lessons | `{help:crisis}` |
| `@key` covering only `plan.js` | `@mod:key`, inside the hash |
| Hb never compared vs a "below 8" line vs the journey audit's "below range" signal | Never compared; one fixed education line beside every Hb entry (MBBS wording); the journey audit signal goes to decision 5 |
| Red flags hidden in discreet mode | Never hidden; reworded |
| Heaviness track in pregnancy | Removed; pressure before 37 weeks is a go-now card |
| After-birth moves after 6 weeks vs from week 1 | Gentle moves from week 1 if the obstetrician agrees (decision 10) |
| Folic acid as a link vs a daily tick | A tick with no dose words, if agreed (decision 12) |
| Three tea timings | The gynaecologist picks one in §20; until then reuse `iron.js`'s line |
| Pain and PMS offered within a year of a birth | Not within 365 days or while breastfeeding |
| No walk on heavy days | Optional, with a rest routine beside it |

### 8.3 Claims to handle with care

- **The 6-period arc** leans on Blödt 2018, which tested self-acupressure, not in this programme. Kannan 2019 and the
  maintenance literature carry it; it's a design choice. Never "easier for up to 6 periods" in app words.
- **ACOG CO 760** covers adolescents whose treated pain hasn't eased in 3 to 6 months; never a reason to wait.
- **Self-guided micro-CBT** at Sakhi's dose is untested (Weise 2019 was therapist-guided, about 5 hours a week, and excluded
  acute suicidality).
- **Rest days Sakhi applies** were never tested; **targeted calls** weren't significantly better than calling in turn.
- **Indian pelvic floor data** are conference abstracts.
- **Midlife:** IMS 2026's "yoga Grade B" wasn't found at source; NAMS 2023 says movement and breathing don't treat flushes.
- **Brooke-Wavell 2022** means 50 impacts per session, not per leg.
- **NICE NG88 and NG123 referral lists** were written from memory (403); re-check before §20.
- **Anemia Mukt Bharat 2026** details rest on secondary summaries. **NFHS-5's 26.0% for 180 tablet days** couldn't be opened
  (unverified). **WHO 2019 and 2015** recommendations were quoted from memory (unverified).
- **Canada 2025's** numbers were read by one designer but couldn't be re-fetched by the reviewer; re-check.
- **MMNP's** 90-days-before result is per-protocol (intention-to-treat null).
- **The regulatory readings** are the research team's, not a lawyer's; the pilot exemption is verbal advice.

---

## 9. Decisions for Mohit

1. **Layout:** pure-data programmes in `web/progs/`, one engine in `plan.js`? Recommended.
2. **Field test:** give the 8 to 10 women only R1 and freeze their plans with `d.pv`; R2 before they start or after their 12
   weeks? Recommended.
3. **Drafts:** only when `SAKHI_CONFIG.drafts` is true (demo APKs), and in the private web prototype with a "draft" banner?
   Recommended.
4. **Milestones timed by her own logged periods** ("after your 3rd period"), with text the same for everyone? Recommended,
   with the lawyer's written view.
5. **Where signals from her records live.** This touches your pillar 1 ("preliminary diagnosis as your records point to
   something", in the journey audit). The research round found that doctor prompts computed from her diary values are what
   CDSCO's 2026 guidance treats as triage. Two options:
   - **(a) Recommended:** programmes show the same doctor cards for everyone. The signals from her records stay in pillar
     1: the diary's reviewed warnings, `explain.js`, and the journey audit's planned 39.5 signals (Hb below her report's
     range, a chart total of 100, tiredness on 10 of 30 days). Each has doctor-set triggers and the lawyer's written view.
     If `noChange()` is kept, it moves out of the plan into pillar 1.
   - **(b) Most cautious:** also retire `noChange()` and the planned 39.5 signals.

   Pillar 1 is your call. The research only shows that keeping it out of the programme layer keeps the programmes simpler
   to defend.
6. **Health entries only offer** changes to her steps, never make them silently? Recommended.
7. **Reviewers:** who signs each tier, with registration numbers in `docs/reviews/`; a weekly packet slot; the 5-woman
   teach-back as a release gate (recommended); and where the physiotherapist and psychiatrist or psychologist come from
   without new spend (a government medical college, a physiotherapy college, a Tele-MANAS state cell)?
8. **Easier periods:** 12-week core and keep going to period 6, a daily relaxation anchor, about 90 minutes a week with
   strength from week 5? Recommended.
9. **Midlife:** three modules by her goal, strength and balance from week 1, an "aches and tiredness" goal, sleep rules
   without a computed window? Recommended. Flush wording follows NAMS ("some women find flushes feel easier too")?
   Recommended.
10. **After the birth:** gentle moves and walking from week 1 after a vaginal birth, the C-section version until her
    doctor's OK; one light daily pelvic floor set for everyone and the full course for women who leak? Recommended, if the
    obstetrician agrees.
11. **New goal labels:** "Leaks or heaviness down below" at every adult stage except pregnancy ("Keep my pelvic floor
    strong"); "Low Hb, or told I have anaemia" while she has periods; "Aches and tiredness" at 40+? Recommended.
12. **Folic acid:** a daily tick with no dose words, as a carve-out from "no supplements in programme words"? Recommended,
    with the gynaecologist; otherwise a weekly link.
13. **Press points** for period pain: hold for later, behind a flag? Recommended.
14. **One main plus at most one add-on,** with the precedence rules in 3.11? Recommended.
15. **Reminders:** one evening reminder by default, an opt-in morning one only for Midlife's sleep note, and a core budget of
    2 health reminders a day? Recommended.
16. **The Qura call** in programmes for habits only, with a neutral topic, never from pregnancy triggers or for mood, and only
    after Qura confirms WhatsApp confirmations never carry the topic? Recommended. Can the care team take the week-2 and
    quiet-days offers? (`SAKHI_HELP_WA` is still pending.)
17. **Care after a loss** as a core "care, not habit" track, with a newborn or infant death path? Recommended.
18. **Recall:** the app audit's update check (a version check sending nothing about her) before the first condition-tier
    release? Recommended.
19. **Field-test protocol:** which programmes, written consent, and an ethics committee's view on condition-tier content?
    Recommended before any condition-tier programme reaches a tester.
20. **The cycle plan:** keep its ladder and page until after the field test, then decide on lessons, keep-going and adaptive
    minutes with re-review; rename the "PMOS plan" summary heading now? Recommended.

---

## Sources

The full list, with every link, is at the end of the appendix. The ones this doc leans on most:

- **Programme structure:** CMS Medicare DPP 2026 https://www.cms.gov/files/document/mln34893002-medicare-diabetes-prevention-program-expanded-model.pdf ;
  Middleton 2012 https://pubmed.ncbi.nlm.nih.gov/22212682/ ; Adams 2017 https://pubmed.ncbi.nlm.nih.gov/28356097/ ;
  Sharif and Shu 2019 https://anderson-review.ucla.edu/wp-content/uploads/2021/03/Sharif-Shu_EmergencyReserveFailure_OBHDP2019.pdf ;
  Milkman 2021 https://www.nature.com/articles/s41586-021-04128-4 ; Kelders 2012 https://pubmed.ncbi.nlm.nih.gov/23151820/ ;
  Donkin 2013 https://pubmed.ncbi.nlm.nih.gov/24135213/ ; Meyerowitz-Katz 2020 https://www.jmir.org/2020/9/e20283
- **India:** Kilkari RCT https://pmc.ncbi.nlm.nih.gov/articles/PMC9288869/ ; ImTeCHO https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1002939 ;
  ARMMAN https://arxiv.org/abs/2109.08075 ; Scott 2021 https://pmc.ncbi.nlm.nih.gov/articles/PMC8327813/ ;
  Meppelink 2015 https://www.jmir.org/2015/1/e11/ ; NFHS-6 note https://indiainatlanta.gov.in/public_files/assets/pdf/NFHS_6_Note_for_International_Media_13062026v2.pdf
- **Periods:** Blödt 2018 https://pubmed.ncbi.nlm.nih.gov/29155036/ ; Tsai 2024 https://pubmed.ncbi.nlm.nih.gov/38816591/ ;
  Xiang 2025 https://pubmed.ncbi.nlm.nih.gov/40078380/ ; C-PASS https://pubmed.ncbi.nlm.nih.gov/27523500/ ;
  Eisenlohr-Moul 2022 https://pubmed.ncbi.nlm.nih.gov/35303811/ ; da Silva Filho 2021 https://pubmed.ncbi.nlm.nih.gov/34047657/
- **Pelvic floor and after the birth:** Wadensten 2021 https://pmc.ncbi.nlm.nih.gov/articles/PMC8056293 ; Miller 2020
  https://pmc.ncbi.nlm.nih.gov/articles/PMC7583334 ; Davenport 2025 https://www.casem-acmse.org/wp-content/uploads/2025/04/515.full_.pdf ;
  Goom 2019 https://athleticsni.org/download/files/Returning_to_running_postnatal_guideline_for_medical_health_and_fitness_professionals_managing_this_population.05.pdf
- **Midlife:** NAMS 2023 https://depts.washington.edu/mbwc/content/page-files/NAMS_2023-nonhormone-therapy-position-statement_(1)22.pdf ;
  IMS 2026 https://pmc.ncbi.nlm.nih.gov/articles/PMC12948155/ ; MENOS@Work https://nottingham-repository.worktribe.com/output/930688
- **Pregnancy and getting ready:** WHO 2020 https://bjsm.bmj.com/content/54/24/1451 ; SOGC/CSEP 2019
  https://www.gov.nl.ca/tcar/files/Canadian-Guideline-for-Physical-Activity-Throughout-Pregnancy.pdf ; Smarter Pregnancy
  https://repub.eur.nl/pub/127234 ; WINGS https://pmc.ncbi.nlm.nih.gov/articles/PMC9597398 ; Anemia Mukt Bharat toolkit
  https://nhm.hp.gov.in/storage/app/media/uploaded-files/English_Anemia%20Mukt%20Bharat%20Training%20Modules%20Folder_Lowress.pdf
- **Safety:** CDSCO 2026 https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/Guidance-document-on-Medical-Device-Software-under-MDR-2017.pdf ;
  FDA wellness 2026 https://www.fda.gov/media/90652/download ; Semigran 2015 https://pmc.ncbi.nlm.nih.gov/articles/PMC4496786/ ;
  Martinengo 2019 https://pmc.ncbi.nlm.nih.gov/articles/PMC6921471/ ; NICE ESF https://pmc.ncbi.nlm.nih.gov/articles/PMC8236783/
