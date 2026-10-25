# The 8 programmes, week by week (appendix, 24 Oct 2026)

This is the appendix to `docs/plans-design-and-build-2026-10-24.md`. **Status: advice only.** Nothing in the app changed.

It holds:
- **A. The spec format:** the full field list, the closed vocabulary, a worked example, and what's saved on her phone.
- **B. The shared bank** (`web/progs/_bank.js`): the red-flag bank with one urgency per sign, the stop strips, the adult
  Before-you-move screen, the pose library, the scale bank and the shared lessons. Every programme draws on it.
- **1 to 8. The programmes,** one section each: who it's for, length and phases, daily steps, weekly lessons (gists, not
  final wording), routines and new poses, food, her measure, results and what to expect, doctor moments, adaptivity,
  reuse and new content, evidence, and open questions. Each starts with the fixes from its skeptic review.
- **C. The full source list.**

**Rules every programme follows** (so they aren't repeated in each section):
- **Today:** at most 3 step rows (main programme plus add-on) and one card (this week's lesson, a due check-up or a
  milestone). Red flags and other modules' urgent cards sit above and don't count. Days 1 to 3: at most 3 steps and one
  card besides red flags.
- **Kindness:** 2 rest days a week that she taps. When she logs a hard day (pain that stopped her day, heavy flow, a flare,
  a red-flag sign), Sakhi *offers* "Make today a rest day?"; it never applies it silently. "Lighter day" swaps in the gentler
  routine. No streaks. "Welcome back" and a petal after a gap. After 3 quiet days the fresh-start card; after 7 (5 in late
  pregnancy and the first 6 weeks after a birth) one "Want someone to call you?" card.
- **Routing** (main doc 3.9): danger signs to 112, 108 or 102; pregnancy and after-birth questions to the ASHA, ANM and the
  free government doctor; mood and harm to the crisis sheet and Tele-MANAS; violence at home to 181; hormones, surgery and
  fertility treatment to an MBBS gynaecologist; habits only to "Ask Qura to call me", with the topic "A call about my plan".
- **Urgency words:** **Now** (112, 108, 102, or the nearest 24-hour hospital); **Today**; **This week**; **Next visit**.
- **Red flags** come from the bank by id, are shown at the start, in lesson 1, in "When to get help" and on every routine,
  and are never hidden in discreet mode (only reworded, with details one tap in).
- **No doses** ("as your doctor or ASHA advised"); no food said to ease a symptom; no promised result; no licensed scales; no
  helpline digits in programme files (`{help:crisis}` instead); neutral names in discreet mode; Hindi complete.
- **Evidence labels:** findings verified or corrected in the research round carry no label. "(Direct fetch)" means a source
  checked by ID in the design round. "Unverified" means from memory or unreachable.

---

## A. The spec format

**Fields of a programme spec** (`web/progs/<id>.js`; pure data, checked by a JSON round trip):

| Field | What it holds |
|---|---|
| `id`, `ver`, `status` | The saved `d.pack` (never renamed); the version, pinned at Start as `d.pv`; `live` (a ported v1, must match its baseline hash), `draft` (shown only when `SAKHI_CONFIG.drafts`), `approved` (hash matches `docs/reviews/<id>-v<ver>.json`) |
| `tier` | `habit` or `condition`; packet A is always reviewed at condition tier |
| `purpose` | The intended purpose in disease-free words; store and website copy reuse it |
| `title`, `discreetTitle`, `sensitive` | Titles; `sensitive: true` keeps the neutral title even outside discreet mode |
| `goals`, `variants` | Which stage and goal open it; "my doctor said" versions, opened only by her answer |
| `life` | Pauses (pregnancy, the year after a birth, a loss), ends, and chains (`next: { on: 'pregnant', to: 'preg', carry: [...] }`) |
| `clock`, `length` | `weeks`, `periods`, `pregWeek` or `birthDay`; the core and the keep-going phase |
| `intake` | Question ids from `plan.js` `Q` or the bank; at most 5 new taps |
| `phases`, `hero`, `slots` | Phase names and focus; the page hero; slot order and the 3-row cap |
| `restDays`, `lighter`, `flare` | Kindness rules, only in specs that declare them |
| `windows` | Body windows (`pain`, `beforePeriod`) with their fallbacks and gates |
| `choose` | Things she picks (her period kit) and when she picks again |
| `gates` | Fixed-question screens (pregnancy, adult, impact-ready) and what each tier allows |
| `steps` | Each step: id, slot, kind, when, from and to, if, growth, title, why, source |
| `routines`, `food` | Routine ids from `plan.js` `R` or the bank; the food kind |
| `measures`, `results`, `summary` | Her measure and its source; comparisons; the one doctor-summary line |
| `lessons`, `expect` | 3-card lessons with a picture, text and source each, and a "Try this today"; the reviewed timeline |
| `redflags`, `doctor`, `offers`, `safety` | Bank ids; fixed doctor cards with urgency; human offers; crisis and stop-strip flags |
| `addOns`, `asAddon`, `tiles`, `weekly` | Which add-ons it accepts; what it brings when it is the add-on; the 4 tiles; the one weekly question |
| `examples`, `changelog` | Worked examples run by `kit.mjs --prog <id>`; what changed per version |

**Text:** `{ en, hi, mr?, bn?, ta?, te?, src? }`, or `'@plan_key'`, or `'@mod:key'` (resolved into the hash). Placeholders
`{n}`, `{t}`, `{d}`, `{x}`, `{level}`, `{who}`, `{help:crisis}`. Line ids are derived: `pain@2.lessons.p3.cards.1`.

**The vocabulary** (each word is implemented once in `plan.js` with a `kit.mjs` test; an unknown word fails `progs.mjs`):
- `when`: `daily` · `days:1,4` · `perWeek:n` · `weekly:d` · `periodDays` · `window:<name>` · `beforePeriod` · `once:<at>` ·
  `pregWeek:a-b` · `birthDay:a-b` · `birthDays:3,7,14,21,28,42`
- `at`, `from`, `to`: `start` · `end` · `keep` · `week:n[-m]` · `period:n` · `week:n|period:m` (whichever first) ·
  `trimester:n` · `pregWeek:n` · `birthDay:n` · `quiet:n` (offers only)
- `if` (an AND-list; `!` negates): answer words `ans:q=v`, `variant:x`, `chosen:set:item`, `gate:id=tier`, `limits:knees`,
  `limits:bones`, `csec`, `gdm`, `hold:hbFirst`; stage words `stage:x`, `phase:x`, `module:x`; clock words `periodDays`,
  `window:x`, `late`; tap words `tap:x`; usage `quiet:n` (offers only)
- `kind`: `minutes` · `tick` · `habit` · `routine` · `link` · `check` · `log` · `sets` · `test` · `adapter`
- `grow.by`: `table` · `adaptive` · `level`
- adapters: `cycle.today` · `bed` · `preg.due` · `post.rcheck` · `post.goal` · `journey.iron` · `ttc.prep` · `meno.goal` ·
  `meno.diary` · `relief:<id>`
- measure sources: `diary:painDayWorst` · `diary:painDaysLost` · `diary:painkillerDays` · `diary:flowImpactDays` ·
  `diary:bleedDays` · `diary:lowDays` · `plan:days` · `plan:minutes` · `plan:sets` · `mod:meno.trend.<k>` ·
  `mod:iron.days` · `mod:post.checks` · `mod:cond.hb` · `mod:periods.windows` · `mod:ttc.prep` · `own`
- compare: `periods:before3|since` · `periods:1-3|4-6` · `weeks:first2|last2` · `weeks:before4|last4` · `windows:share` ·
  `firstLatest` · `towards:N` · `count:aOfB` · `thenNow`
- pictures: `fig:<pose>` · `scene:<id>` · `ico:<icon>`

**A worked example (trimmed):**

```js
(window.SAKHI_PROGS = window.SAKHI_PROGS || []).push({
  id: 'pain', ver: 2, status: 'draft', tier: 'condition',
  purpose: { en: 'Habits for more comfortable periods', hi: '...' },
  title: '@plan_pk_pain', discreetTitle: '@plan_h_d',
  goals: [{ stage: 'cycle', goal: 'pain' }],
  variants: [{ id: 'endo', ask: 'dxEndo', is: 'y' }],
  life: { pause: ['preg', 'post365', 'loss'], next: null },
  clock: 'periods', length: { weeks: 12, keep: { to: 'week:24|period:6', then: 'monthly' } },
  phases: [{ id: 'learn', at: 'week:1-4' }, { id: 'build', at: 'week:5-8' }, { id: 'mine', at: 'week:9-12' }, { id: 'keep', at: 'keep' }],
  hero: 'window', slots: { max: 3, order: ['check', 'care', 'move', 'calm'] },
  restDays: 2, lighter: 'unwind', flare: { if: ['variant:endo'], days: 3, keep: ['heat', 'unwind'] },
  windows: { pain: { from: -5, to: 'lastPainDay', max: 7, irregular: 'firstBleed', gate: '!late' } },
  steps: [
    { id: 'unwind', slot: 'calm', kind: 'routine', routine: 'unwind', when: 'daily', from: 'week:1' },
    { id: 'move', slot: 'move', kind: 'minutes', when: 'perWeek:3', if: ['!window:pain'],
      grow: { by: 'adaptive', start: [10, 15, 20], step: 5, floor: 10, cap: 45, hold: 'hbFirst' } },
    { id: 'kit', slot: 'care', kind: 'routine', when: 'window:pain', if: ['chosen:kit'] },
    { id: 'howbad', slot: 'care', kind: 'log', when: 'periodDays', opens: 'diary' }
  ],
  measures: [{ id: 'pain', main: true, src: 'diary:painDayWorst', per: 'period' }],
  results: [{ measure: 'pain', compare: 'periods:before3|since', then: 'periods:1-3|4-6' }],
  redflags: ['bank:lateOneSided', 'bank:torsion', 'bank:feverPain', 'bank:severeBelly', 'bank:stopsDay', 'bank:afterSex'],
  doctor: [{ id: 'p3', at: 'week:12|period:3', urgency: 'week', text: '@prog:pain_doc_p3' }],
  offers: [{ id: 'w2', at: 'week:2', quiet: true }, { id: 'quiet', at: 'quiet:7' }],
  safety: { crisis: false, stop: 'bank:stopPeriod' }, addOns: ['iron', 'pelvicRelax'],
  examples: [{ seed: 'regular28', day: 25, today: ['unwind', 'kit', 'howbad'] }]
});
```

**Her saved plan** (`state.mods.plan`) only gains keys: `pv`, `variant`, `chosen{}`, `tg{}` (adaptive targets by week),
`lvl{}` (levels), `gates{}`, `m{}` (her own measures by date), `les{}`, `tried{}`, `docs{}`, `addon`, `flare`, `past[]`,
plus a separate maintenance slot.

---

## B. The shared bank (`web/progs/_bank.js`)

Reviewed once, in §20, before any programme packet. Urgencies are proposals for the MBBS gynaecologist, reconciled with the
reviewed core lines (`s1` to `s6`, `r2`, `r_pain`, `explain.js` levels, `relief.js` doctor lines, `post.js` `flagsOf`,
`cond.js` TORSION).

### B.1 The red-flag bank

| Id | Sign (gist) | Urgency |
|---|---|---|
| `lateOneSided` | Late period or positive test with pain on one side, shoulder-tip pain, bleeding or brown discharge with pain, dizziness or fainting | Now |
| `torsion` | Sudden severe one-sided lower belly pain with vomiting | Now |
| `severeBelly` | Severe belly pain with a hard belly, or unable to stand straight | Now |
| `feverIll` | Fever or shivering with feeling very ill, too weak to get up, confused, or breathing fast | Now |
| `faint` | Fainting; chest pain; breathless at rest | Now |
| `soakDizzy` | Soaking a pad every 1 to 2 hours with dizziness or breathlessness | Now |
| `soak` | Soaking a pad every 1 to 2 hours, or clots bigger than a ₹10 coin | Today |
| `afterProcedure` | Heavy bleeding, fever or pain after an abortion (including pills from a chemist), a miscarriage, a birth or a procedure | Now if soaking 2 thick pads an hour; else Today |
| `feverPain` | Fever with belly pain or a bad-smelling discharge | Today |
| `burning` | Burning when passing urine | This week; **Today** in pregnancy, or with fever, shivering or back pain under the ribs |
| `urineBlood` | Blood in the urine, even once | Within 2 weeks; Today with clots or if she can't pass urine |
| `cantPee` | Can't pass urine, or only drops with a full, hard or painful lower belly | Today |
| `fistula` | Urine or stool leaking all the time, day and night, or from the vagina | This week (it can be repaired free) |
| `blackStool` | Black, sticky stools that began before iron, or with dizziness; vomiting blood | Today; vomiting blood Now |
| `afterSex` | Bleeding after sex or between periods | This week |
| `iud` | New pain after a Copper-T, threads she can't feel, pain during sex | This week; Today with fever; a late period with a Copper-T: a test today |
| `stopsDay` | Pain that stops her day (school, work, housework) even after medicine | This week (reconcile with `r_pain` and `cond-endo`, which say "this month") |
| `otherDays` | Pain on many days of the month, not only with the period | This week |
| `afterMenopause` | Any bleeding after 12 months without a period | Within 2 weeks |
| `midlifeBleed` | Periods every 2 to 3 weeks, lasting more than 8 days, very heavy, or bleeding after sex (40+ still bleeding) | This week |
| `ovarian` | 40+: bloating, feeling full quickly, belly or pelvic pain, or needing to pass urine more often, on most days for 3 weeks | Within 2 weeks |
| `breast` | A new breast lump, blood from the nipple, skin dimpling | Within 2 weeks |
| `headache` | Sudden very severe headache, or headache with weakness, numbness, trouble speaking, loss of vision | Now |
| `calf` | One calf swollen, red or painful | Today; with breathlessness Now |
| `heat` | Confused, very hot dry skin, fainting or vomiting in the heat | Now |
| `harm` | Thoughts of harming herself or her baby | Now (crisis sheet) |
| `unsafeHome` | Someone at home hurts, threatens or scares her | Crisis sheet (181, 112) |
| `lowMood` | Low or anxious most days for 2 weeks | This week (MBBS doctor or Tele-MANAS) |
| `psychosis` | Confused, hearing voices, strange beliefs, or not sleeping at all for days | Now (do not leave her alone) |
| `painkillerHarm` | Black stools, vomiting blood or severe stomach pain after painkillers; wheezing after a painkiller | Now; wheezing: stop it, Today |
| `heatInjury` | A blister or red patch that stays after a hot water bag | This week |
| `anaemiaMove` | Breathless or heart racing on a short walk, chest pain, feeling faint | Stop; Hb test this week; fainting Now |

**Pregnancy set** (the MCP card and the reviewed danger article): `pregBleed` (any bleeding, Now); `pregWaters` (a gush, or a
trickle she can't stop, Now); `pregPains` (regular pains, pelvic pressure, a dull backache that comes and goes, or a change in
discharge before 37 weeks, Now); `pregHeadVision` (severe headache, blurred vision, fits, Now); `pregBP` (sudden swelling of
face or hands, pain under the ribs, Now); `pregMovesStopped` (no movement at all, Now); `pregMovesLess` (less than usual or
different from 28 weeks, Today, even at night); `pregVomit` (can't keep food or water down for 24 hours, Today); `pregItch`
(itching all over, Today); `pregAnaemia` (her own tick that Hb is under 7: a doctor the same day).

**After-birth set:** `postBleed` (soaking a pad in an hour, egg-sized clots, Now); `postWound` (a bad smell, pus, the wound
opening, Today); `postBreast` (a painful red breast with fever, Today); `newbornDanger` (the reviewed `G.baby` list: not
feeding, fast breathing or chest pulling in, fever or cold, fits or floppy, yellow palms or soles, yellow on day 1: 108 or
102, Now).

### B.2 Stop strips

- `stopPeriod`: stop if pain becomes sharp or one-sided, you feel faint, or bleeding is much heavier than your usual; plus
  `anaemiaMove`.
- `stopGeneral`: stop if you can't talk, feel dizzy, have chest pain or sharp joint pain; plus `anaemiaMove` and `heat`.
- `stopPreg`: the 9 ACOG stop signs (bleeding, regular painful tightenings, fluid leaking, breathless before starting,
  dizziness, headache, chest pain, weakness affecting balance, calf pain or swelling), read aloud on tap.
- `stopPost`: heavier or bright red bleeding again, the wound hurting more, leaking or heaviness, dizziness, chest pain,
  calf pain.

### B.3 The adult Before-you-move screen

Asked once at the start of every programme with move steps, in our own words (PAR-Q+ and CSEP's forms need written
permission for apps, so nothing is copied): (1) Has a doctor said you have a heart or lung problem? (2) Do you get chest
pain, breathlessness or faintness when you walk fast? (3) Has a doctor or ANM said your Hb is very low? (4) Do you take
tablets for BP? Any yes: easy walking only, and "Ask your doctor before doing more". Pregnancy, after the birth and midlife
have their own screens (sections 6, 7, 5).

### B.4 The pose library

Existing poses reused: warm-up, march, chair and chair-up, wall push-up, calf raise, step, tree, arms up, triangle,
butterfly, twist, bridge, knees to chest, child, cobra, rest, sit, chair forward bend. **New poses, about 28 with props,
one name each:** `sidelie` (side-lying rest), `sideleg` (side-lying leg lift), `recbut` (reclined butterfly), `tilt` (pelvic
tilt lying), `catcow`, `allfours` (hands-and-knees rocking), `armreach`, `heelslide`, `kneefall`, `ankle` (ankle pumps),
`rollside` (rolling to sit up), `legsChair` (legs resting on a chair), `seatmarch`, `pelviccircle`, `leanfwd`, `oneleg`,
`tandem` (heel-to-toe walk), `tallback` (shoulder blades back against a wall), `sidelift` (standing side leg lift at a chair),
`floorstand`, `liftpot`, `hipchild`, `cough` (scene), `standtask` (at the stove), `walkbaby`, the pelvic floor cue overlay
(a dot that lifts on the squeeze), and two props (a bundle or rice bag, a water pot). One physio sheet and one pictogram
test cover the whole library.

### B.5 The scale bank

- `freq3`: never / sometimes / most days.
- `impact4`: the diary's own pain levels (No pain / Mild / Needed a painkiller / Couldn't do my day).
- `sev5`: a 5-picture scale (none to very much).
- `num10`: a spoken 0-to-10 tap scale, for Midlife only, field-tested against `sev5`.

### B.6 Shared lessons

- **When to see a doctor:** the programme's bank red flags as a picture card in 4 levels, read aloud.
- **Telling your family:** one fact and one need, the "what elders may say" format, and the 181 line.
- **Find your pelvic floor:** "squeeze as if holding in wind, then lift; keep breathing"; the 5 mistakes (bottom, thighs,
  holding the breath, pulling the tummy in hard, pushing down); never practise by stopping your wee.
- **A new tablet: what to expect:** day 0 (black stools are normal with iron; an upset stomach is common in the first
  days), day 3 ("How is it suiting you?"), "tell your ASHA instead of stopping".

---

## 1. Easier periods (`pain`)

**Fixes from the review, applied here:**
- **Blocker:** no period kit, period yoga or "Pain started" kit opens while her period is late or she could be pregnant.
  A late-period gate comes first (Adaptivity).
- The 6-period arc no longer rests on Blödt 2018 (that trial tested self-acupressure, which isn't in this programme). It is
  justified by Kannan 2019 and the maintenance literature, and it's called a design choice. No "easier for up to 6 periods"
  line anywhere.
- The period-3 and period-6 cards never suggest waiting: pain that stops her day needs a doctor now.
- Red flags come from the bank with one urgency each, and the missing ones are added.
- With the iron add-on: a black-stools line about painkillers. The move target holds at its start until the Hb test is done
  when her periods are heavy too.
- Pauses: in pregnancy; for 365 days after a birth (or until After the birth ends and periods return); after a loss until
  her first period.
- Per-day pain becomes its own diary event, never read by `explain.js`.
- "Did this help?" is added to plan routines and to warmth and rest.
- Discreet mode never hides red flags or milestones.
- No promise in why-lines; the title goes to the lawyer.
- The programme never links to the pattern check or the endometriosis self-check.
- The week-2 human offer is quiet and opt-in, with the free government OPD first.

### Who

Women 18+ at the periods stage who pick "Painful periods". The "my doctor said endometriosis or adenomyosis" version opens
only when she answers that a doctor told her, including women of 40+ already diagnosed. Not offered: in pregnancy; within
365 days of a birth or while breastfeeding with no period back; after periods stop or a hysterectomy; for new or worse pain
after 40 with no diagnosis (that gets a doctor card first). As the "period kit" add-on it joins the cycle plan, Stronger
blood and Getting ready (with the two-week-wait rule below).

### Length and phases

A 12-week core of about 3 periods, then an optional lighter "keep going" to her 6th period, ending at week 24 at the latest
(or week 12 and week 24 for women on hormones whose periods have stopped). The plan is counted in weeks; "period n" is
whatever she logs. If fewer than 3 periods come in 12 weeks, results say so plainly.

| Weeks | Phase (discreet name) | Focus | New this phase |
|---|---|---|---|
| 1 to 4 | Know your pain, ready your kit (Getting started) | How pain is made and calmed; Unwind on most days; moving 3 days; choose her kit; one tap for pain on each period day; red flags in week 3 | Week 1: Unwind short version, choose the kit, the pain tap. Week 2: full Unwind, the quiet human offer. Week 3: "Is my pain the usual kind?", "Get your kit ready". Week 4: targets follow her; the week-4 card |
| 5 to 8 | Build (Building up) | Moving builds towards about 90 minutes a week; Strength at home on 2 of her 3 days; Period yoga before her likely period | Week 5: Strength. Week 6: Period yoga. Week 7: a small kit for her bag. Week 8: the family card |
| 9 to 12 | My period-week plan (My own plan) | Hold the dose; keep the 2 kit items that helped; get her pain record ready for a doctor | Week 9: "What helped you?". Week 10: Unwind at bedtime before her period. Week 11: the pain record. Week 12: results and the period-3 card |
| 13 to period 6 | Keep going | Unwind 4 days, movement held, her own kit, one lesson a month; reminders taper | Monthly lessons; periods 1 to 3 vs 4 to 6 in results; the period-6 card |

### Daily steps and how they grow

Priority on any day: the late-period gate or a doctor step, then the kit or pain tap, then that day's move or Period yoga,
then Unwind, then "Get your kit ready". The lesson is the card.

| Step | When | Weeks | Grows | Existing or new |
|---|---|---|---|---|
| **Unwind** (6 min; discreet "Unwind") | Daily, with 2 rest days; endometriosis: 4 days of her choice | 1 to 12, then 4 days | Weeks 1 to 2 a 3.5-minute version; full 6 to 8 minutes from week 3; Calm breath may replace it from week 9 | New routine |
| **Move** (walk or Gentle start; discreet "Move") | 3 days she picks, not in her pain window | 1 to 12 | Adaptive: starts at 10, 15 or 20 minutes; +5 when all 3 sessions done; floor 10 (endometriosis 5), cap 45 a session (30); aims at about 90 minutes a week by week 8. **Held at its start**, with Strength at 1 round, when she said her periods are heavy too, until she taps "Hb test done" or "My doctor said I can" | Existing step, new adaptive rule |
| **Strength at home** | 2 of her 3 move days | 5 to 12 | 1 round, then 2 from week 7 | Existing routine |
| **Choose your kit** (card, not a row) | Week 1, again week 9 | 1, 9 | Picks 2 or 3 of: warmth, the Cramps routine, Period yoga, Unwind, a rest position | New |
| **Get your kit ready** (discreet "Get your things ready") | 2 days before her likely range; no range: the day after each period ends | 3 to 12 | Fixed; "a painkiller only if your doctor or chemist suggested one" | New |
| **Period yoga** (discreet "Gentle stretches") | One move day in the 5 days before her likely start; no range: her first pain day | 6 to 12 | Fixed; she can switch it off | New routine |
| **Your period kit** (discreet "Warm and rest") | Her pain window, after the late-period gate | 1 to 12 | Her chosen items, 1 to 3 times on a pain day; each ends with "Did this help?" | Existing routines; merged step new |
| **How is the pain today?** (discreet "How was today?") | Each pain-window day | 1 to 12 | One tap on the diary's 4 levels; optional "What did it stop?" and "Took a painkiller today" | Levels existing; `pain_day` event new |
| **This period vs your usual** (in the check-in) | The day after her window closes | 1 to 12 | Easier / same / harder; "harder" shows the same doctor card for everyone | New |
| **Doctor visit** (her answer "It stops my day") | Weekly in weeks 1 to 4 until "booked" or "been" | 1 to 4 | Fixed | New |
| **What helped you? Keep 2** | Week 9, confirmed week 12 | 9 to 12 | Her own ratings as plain counts; she writes when she starts them and picks a reward | New |
| Endometriosis: **Write your flare plan** | Once, weeks 1 to 2 | 1 to 2 | 5 picture slots: warmth, a rest position, a breath, who to call, what to tell family or work | New |
| Endometriosis: **Bad day? Open my flare plan** (discreet "Rest day") | Any day, a button | All | Pauses build steps 3 days | New |
| Endometriosis: **Pain diary for your doctor** | Weekly | All | Opens `cond-endo` | Existing |

Lesson "Try this" actions: week 7 "Put a small kit in your bag"; week 8 "Show your family card"; week 11 "Get your pain
record ready for a doctor".

### Weekly lessons (gists)

| Week | Title | Card gists |
|---|---|---|
| 1 | Why periods hurt (Meena's first period on the plan) | The womb squeezes; the pain is real. Warmth, slow breathing and moving can calm pain signals, and many women find it takes a few periods to notice. Try: Unwind once |
| 2 | Your period-week kit | Warmth: hot, not boiling, water; check the bag for leaks; wrap it in cloth; check your skin; never sleep on it; no heat on numb skin. Rest positions. Try: pick 2 or 3 kit items |
| 3 | Is my pain the usual kind? | Usual pain starts with the period and lasts up to about 3 days. The bank card in 4 levels. Free help at the Ayushman Arogya Mandir or the government gynaecology OPD; heavy too? a free Hb test |
| 4 | Moving on the days in between | Any movement counts; you can talk but not sing. Try: pick your 3 days |
| 5 | A strong body | Strength at home, 8 minutes, twice a week |
| 6 | Medicines: ask, don't guess | Ask a doctor or chemist which painkiller and when; never someone else's. Ask first with a stomach ulcer, asthma, kidney, liver or heart disease, or if you could be pregnant. Stomach pain or heartburn after painkillers: tell the doctor; black stools or vomiting blood: hospital now. No medicine names or doses |
| 7 | Pain days at college or work | Asking for a quiet moment is fine; a breath you can do sitting. Written for adults |
| 8 | Telling your family | The shared lesson; respectful answers to "what elders may say"; the 181 line |
| 9 | What helped you? | Your own record; keep 2; decide when you start them |
| 10 | Calm evenings before your period | A tired body feels pain more; Unwind at bedtime |
| 11 | What a doctor checks | Questions, maybe an exam and an ultrasound. Only a doctor can name a cause (endometriosis, adenomyosis, fibroids) |
| 12 | Keeping it going | Your results; your period-week plan; choose keep going |
| M4 to M6 | Monthly | Your plan one period at a time; the smallest version for busy months; six periods on |
| Endometriosis swaps (weeks 1, 2, 3, 4, 6, 8, 10, 11) | Endometriosis and you; your flare plan; pacing; moving gently (5 to 10 minutes; next-day soreness can happen); your treatment and your plan ("My treatment changed"); talking to family and work; low days (`lowMood`, crisis sheet); pain with sex, stool or urine: tell your doctor | |

### Routines and new poses

- **Unwind (new):** belly breathing with knees bent (4 in, 6 out), tense and release from feet to face, gentle knee rocking
  (renamed from "side to side" to match the existing animation), side-lying rest, rest. A seated or in-bed version for
  homes with no privacy. New pose: `sidelie`. Stop strip `stopPeriod`.
- **Period yoga (new):** butterfly, cat-cow (a seated version with knee limits), child's pose (chair forward bend with knee
  limits), reclined butterfly, knees to chest, pelvic tilt, bridge (marked `back: true`, skipped with back pain; the
  physiotherapist decides about bleeding days), side-lying rest, rest. Described as a design choice from Common Yoga Protocol
  poses that are comfortable on a period, "inspired by" Rakhshaee 2011, which tested cobra, cat and fish poses. New poses:
  `catcow`, `recbut`, `tilt`, `sidelie`. No inversions or tummy-lying on bleeding days. Never shown in pregnancy.
- **Cramps (existing `relief-cramps`):** warmth, child's pose (gets the chair forward bend swap with knee limits),
  knees to chest, slow breaths. The heat-safety lines above join its warmth step.
- **Strength at home, Gentle start (existing).**

### Food

Her general plate from My food (the diet audit's foods table). No food steps. Nothing is said to ease cramps. "Heavy too"
offers the Stronger blood add-on, which brings its iron food and the free Hb test.

### Her measure

- **Main:** worst pain level each period and days she couldn't do her day, from a new `pain_day` event (date and level).
  One helper, `painByPeriod()`, lets a period's window open up to 2 days before its start. `painCompare`, the diary day
  view, `docportal` and the report line read it; `explain.js` does not. The period sheet's pain fills from the worst
  `pain_day`, so she never enters it twice.
- **Secondary:** painkiller days (from the chip), her period look-back, move minutes, Unwind days, what helped.
- **Endometriosis version:** "days I could do what I needed" (0 to 7) and "I felt in control this week: never / sometimes /
  most days", checked against EHP-5 and EHP-30 item stems so none is copied; the `cond-endo` pain diary for her
  gynaecologist.
- **Before the start:** her last 3 periods from the diary, or "what you told Sakhi".

### Results and what to expect

**Results:** pain each period, her 3 periods before vs since, then periods 1 to 3 vs 4 to 6. Days lost, painkiller days,
her look-backs, days followed. The endometriosis version leads with control and days she could do what she needed, never
with less pain. Every card says "Periods vary from month to month, and what you take can change this; look at several."

**What to expect** (reviewed timeline, no numbers): week 1, warmth and rest can make a pain day easier; the first period on
the plan is too soon to judge; for many women regular movement and Unwind make periods a little easier over 2 to 3
periods; any time, pain that stops your day needs a doctor. Endometriosis: these habits are about coping and doing more of
your day; your doctor's treatment works on the pain.

### Doctor moments

| When | Urgency | Gist |
|---|---|---|
| Start, her answer "It stops my day" | This week | The reviewed `plan_rv_doc_pain` line, then a weekly "Doctor visit: booked / been / not yet" step to week 4 |
| Start, every woman | Fixed card | The bank card for this programme; endometriosis: "Keep following your doctor's treatment; this plan adds habits around it" |
| Any day, her tap on a bank sign | By the bank | `lateOneSided`, `torsion`, `severeBelly`, `feverIll`, `afterProcedure`, `feverPain`, `stopsDay`, `otherDays`, `afterSex`, `iud`, `urineBlood`, `painkillerHarm`, `heatInjury`, `anaemiaMove`, `unsafeHome` |
| A pain tap at "Couldn't do my day" or a "harder" look-back | This week | The same `stopsDay` card for everyone |
| Week 2 (quiet, opt-in) | Routine | "Questions about your plan?" Free government gynaecology OPD first; "a Qura doctor (Ayurveda) who can refer you" second |
| Week 4, every woman | Routine | "When to see a doctor", beside her own facts |
| Week 12 or period 3; week 24 or period 6 | This week | "Pain that stops your day needs a doctor now, if you haven't been. If a doctor treated it and it still stops your day, go back, and take your record" |
| Endometriosis, weeks 1 to 4 | This week | The doctor-visit card; the fertility card from `cond-endo` |
| Pregnancy logged | Pause | The programme pauses; `lateOneSided` shows if she has pain |

### Adaptivity

- **The late-period gate:** before any kit step opens on a "Pain started" tap with no bleeding, or on any day after her
  likely range has ended without a period (or more than 35 days since her last start, or no dates and she's trying), Sakhi
  shows "Could you be pregnant? Take a test (free from your ASHA or PHC)", with `lateOneSided` on top. The kit opens only after
  "Period came" or "Not pregnant". As an add-on to Getting ready, no pre-period kit or Period yoga in the 14 days before her
  likely period unless she taps that her period has started. A `firstday`/`notices` test checks that a late period plus a
  pain tap never opens a kit routine first.
- **Pain window:** from 5 days before her likely start (from her first bleed or pain tap if irregular or on hormones) to the
  day after her last pain tap, at most 7 days. On a pain day the kit replaces Move and Unwind, and Sakhi offers "Make today a
  rest day?".
- **Targets:** adaptive, said kindly when they step down; held while `hold:hbFirst` applies.
- **Endometriosis:** "following the plan" means 4 days a week of 5 to 10 minutes; the flare tap pauses build steps 3 days;
  "My treatment changed" pauses any step that could conflict until she confirms.
- **Limits:** knee pain swaps step-ups for marching and child's pose for the chair forward bend; back pain skips bridges.
- **Fasting or festivals:** the walk moves after the fast opens; "Pause for the festival", then a fresh start.
- **Keep going:** no growth; reminders only on move days and pain days; petals give way to her own results.

### Add-ons

The iron add-on (when periods are heavy too) shares one period-day card with the pain tap. Pelvic floor sets only as the
relax-first version if squeezes hurt or sex is painful. The PMS log in the 5 days before her period, if she wants it. As
the "period kit" add-on elsewhere: the kit and the pain tap on period days only.

### Reuse and new content; reviewers

- **Reuse:** `relief-cramps` and its doctor line; `periods-pain`'s "What helps", caution note and "Not normal" list (as the
  bank source); `cond-endo` (pain diary, explainer, fertility card); the diary's `pain_0` to `pain_3` labels; `painCompare`;
  `docCase`; the figure engine; Strength, Gentle start and Calm breath; Free doctor and care.
- **Retired for this pack:** `renderLight`, `lightWalk`, the bed-time step, `plan_path_light`, `noChange()`.
- **New:** about 3,200 English words (about 900 are the endometriosis swaps), 5 poses, about 6 pictograms (most shared).
- **Reviewers:** Dr. Megha (lessons, kit, habits); an MBBS gynaecologist (packet A, the endometriosis version, lesson 6,
  lesson 11, milestone cards, expect); a physiotherapist (Unwind, Period yoga, every pose, bridges on bleeding days); a
  psychiatrist or psychologist (the low-days card); the lawyer (purpose and title). Teach-back of the red flags with about 5
  women. Packet: **§21**.

### Evidence

- A 6-cycle app trial of self-acupressure: responders 37% at cycle 3 and 58% at cycle 6, against 23% and 24% (Blödt 2018).
  Used only to show that effects can grow past 3 cycles; this programme does not include acupressure.
- Exercise effect grew to 22 mm on a 100 mm scale by 7 months (Kannan 2019, n=70).
- Relaxation exercise ranked best at 4 and 8 weeks, with fewer dropouts (Tsai 2024, 29 RCTs; small trials).
- About 90 minutes a week, 8 weeks or more, with strength work; frequency not established (Xiang 2025, corrected).
- Pain-science teaching plus exercise beat anatomy teaching plus exercise (Erol 2025, n=38).
- No basis for training by cycle phase (McNulty 2020).
- Endometriosis: regular exercisers more often had better pain the next day, and soreness happens (Ensari 2022,
  observational, corrected); a therapist-led programme improved control, not pain (Hansen 2023, corrected); app use 72.7% to
  58.6% at 4 days a week (Rohloff 2024, maker-run); ESHRE 2022 recommends no specific self-help (direct fetch).
- Heat beat painkillers in 2 small trials, with burns in one (Jo and Lee 2018, direct fetch).
- Self-guided endometriosis programme: 65.5% dropout; women wanted more professional contact (Kronthaler 2026).
- 84.1% of school girls with pain took no leave (Karthika 2026).

### Open questions

- Press points: held for a later version (main doc decision 13).
- The urgency of `stopsDay` (this week, or this month as in `r_pain`, `cond-endo` and `explain.js`): the gynaecologist
  reconciles it in §20.
- Unwind's dose: read the trials in Tsai's relaxation group and match it before calling it "daily".
- Heat duration: the trials used low heat for hours; a hot water bag is hotter. Physiotherapist and doctor.
- Bridges on bleeding days, and the stop line's "much heavier than your usual".
- Is the offered rest day on a "Couldn't do my day" tap acceptable as her own tap? Lawyer.
- Does the title "Easier periods" read as a promise? Lawyer; "My period-week plan" is the fallback.
- Can Qura's call team take the week-2 offers in the field test?
- Not checked: NICE CKS secondary-dysmenorrhoea features (for example new pain after 25); Indian diagnostic-delay data
  (unverified; a follow-up search could find them).

---

## 2. Stronger blood (`heavy`)

**Fixes from the review, applied here:**
- **Blocker:** no plan after a hysterectomy, after periods stop, or with no period for 12 months. "Low Hb" is offered only
  while she has periods (age 18 to 55, not stopped). Low Hb without periods gets a doctor card; the iron tracker stays
  available as a tool.
- A fixed line for everyone beside every Hb entry, so severe anaemia isn't missed; `iron.js`'s "Below 7" line is replaced.
- Walking is gated for women who feel tired, dizzy or breathless.
- The missing red flags are added from the bank, and urgencies are mapped from the reviewed lines (tired plus heavy is
  "this week: Hb test", not "today").
- `iron.js` gets a read API, an every-other-day rhythm, no weekly pre-selection for low Hb, and a switch prompt in pregnancy.
- Dose-free versions of every reused line; no outcome words.
- One product-neutral period question, so cloth users aren't misjudged.
- The family card is shown on screen, never sent.
- Costed prerequisites; a `lowhb` goal that can never open the cycle plan.

### Who

Women 18+ at the periods stage, or 40+ and still bleeding, who pick "Heavy periods" (from a picture of the signs as well as
the word) or "Low Hb, or told I have anaemia". The "my doctor said fibroids or polyps" version opens only from her answer.
Not this programme: pregnancy (My pregnancy's iron goal, with her Hb history carried over); the first 6 weeks after a birth
(After the birth); periods stopped or a hysterectomy (a doctor card); thalassaemia major or repeated transfusions (the
tablet step is off, with the existing `iron.js` warning).

### Length and phases

A 12-week core on Anemia Mukt Bharat's Test, Treat, Talk, Track, for her, offline, with nothing sent to any portal. Then
"Keep strong", monthly, to month 12. The retest follows her doctor's course-end date if she entered one, otherwise week 12.

| Weeks | Phase | Focus | New this phase |
|---|---|---|---|
| 1 to 2 | Know your blood (Test) | A free Hb test; the go-now signs; the period note; tablets only if given | Hb test step; lesson 1; the period note; the tablet tick with the day-0 card and day-3 check; tea gap (week 2); doctor-visit card (weeks 2 to 3) |
| 3 to 5 | Start strong (Treat) | Keeping the tablets going; the doctor visit; the one-month check if her doctor asked | The calendar ("Day 18 of 90 · repeat test on 12 Jan", only if she entered an end date; else "Day 18"); iron food by region and diet; family card (week 4); one-month check (week 5); refill |
| 6 to 9 | Steady (Talk) | Comparing periods; managing heavy days; energy; family; other causes of low Hb | Heavy-day lesson; optional Strength from week 7; month-2 look-back; other-causes card (week 9) |
| 10 to 12 | Retest and my plan (Track) | The repeat test; results; her keep-strong plan; the universal "still heavy?" card | Book the retest; keep-strong plan (picked, no typing); results |
| Months 4 to 12 | Keep strong | One monthly session; tablets as advised; the period note; rechecks at about months 6 and 12 | Monthly card; rechecks; "restart my plan"; hand-offs to Getting ready or My pregnancy |

### Daily steps and how they grow

| Step | When | Weeks | Grows | Existing or new |
|---|---|---|---|---|
| **Get a free Hb test** (discreet "A check-up to book") | Weeks 1 to 2, then weekly until done | 1 to 2 | Done on "Done" or a saved number; never blocks the plan | New step; reuses `cond-anaemia`, Care near me |
| **Ask your ANM or ASHA whether you need tablets** | Weeks 1 to 2 if no iron plan | 1 to 2 | Goes once a plan is set or "Not given to me" | Existing `iron.js` set-up |
| **Today's tablet, as your doctor or ASHA said** (discreet "Today's tablet") | Her rhythm: daily, every other day, weekly, or until her end date; only scheduled days count | 1 to 12 and Keep strong | Day 0 card; day 3 check; day 7 win; calendar from week 3 (one aid at a time); refill at 5 left | Existing tracker; new cards |
| **Today's iron food** (discreet "Today's food step") | Daily; 3 days a week in Keep strong | 1 to 12 | Weeks 1 to 3 the reviewed iron journey (with this pack's food-only versions of days 1, 8 and 10, and cooked sprouts on day 18); from week 4 a 7-day rotation by region and diet; a fasting version | Existing journey; new rotation |
| **Tea an hour away from food and your tablet** | Daily | 2 to 5, then a sub-line | Never "stop tea"; the exact wording waits for the §20 tea line | Existing lines |
| **A gentle walk, 10 minutes** (discreet "Today's movement") | 3 days she picks; **optional** on her first 3 bleeding days, with Rest and restore beside it | 1 to 12 | Adaptive from 10 to 20 minutes, up to 4 days; never steps up in a period week. **If she said she's often tired, dizzy or breathless:** weeks 1 to 2 are Calm breath or Rest and restore only, and the walk opens after the Hb test or her own "I feel OK to walk" with no dizzy tick in 7 days | Existing step, new rules |
| **Your period today** (discreet "A note for today") | Each bleeding day, in the evening | All | 3 taps, the same for pads and cloth: "Did it soak through within 1 to 2 hours?" yes/no; clots none / small / ₹10 coin or bigger; got in the way: leaked through clothes / changed at night / couldn't do my day. The product is saved with each day; a change resets her starting point | Diary fields existing; per-day storage new |
| **Rest and restore** (discreet "A rest routine") | Offered on heavy days | All | A swap that counts as done | New routine |
| **Get ready: your period is likely in 2 days** | 2 days before her likely range; never with irregular cycles | All | Fixed | New |
| **See a doctor about your periods** (discreet "A visit to plan") | Weeks 2 to 3, then weekly until "went" or "not now" | 2 to 3 | "Went" saves the date for her report | Existing card kind, new for this pack |
| **One-month check, if your doctor asked** | Week 5 | 5 | Done / they didn't ask / later | New |
| **Strength at home** | 2 days, replacing a walk | 7 to 12 | Unlocks only after "I feel OK for a bit more" and no dizzy or breathless check-in in 7 days | Existing routine |
| **Ask for your repeat Hb test** | Her course end, else weeks 10 to 12 | 10 to 12 | Fixed | Existing reminder, new milestone |
| **My keep-strong plan** | Weeks 11 to 12 | 11 to 12 | Tablet as advised, 3 iron foods, the tea gap, recheck dates | New |
| **Hb recheck** | About months 6 and 12 | Keep strong | Fixed | New |

The family card is a week-4 card ("Show your family why your tablet matters"), shown on her screen with no Share button.

### Weekly lessons (gists)

| Week | Title | Card gists |
|---|---|---|
| 1 | Is my bleeding heavy? (Rekha's story) | Judged by her life: changing at night, leaking, staying home, tiredness. The go-now picture card from the bank. A free Hb test |
| 2 | Starting the tablet | The shared "what to expect" lesson; the bedtime tip; tell your ASHA instead of stopping |
| 3 | Food helps, tablets treat | Iron foods from her region; tea an hour away; lemon on dal if she has it (never a condition of the tablet); the kadhai is a tip only |
| 4 | What the doctor checks | Hb, and sometimes iron stores or thyroid; a scan can look for causes; heavier periods in the first 3 to 6 months after a Copper-T are common; take your note; only a doctor finds the cause |
| 5 | Is it working? | Many doctors check about a month after starting; low Hb has many causes; don't stop when you feel better |
| 6 | Managing a heavy day | A night pad or a thicker folded cloth and an old sheet; cloth care; what to carry; ₹1 pads at Jan Aushadhi |
| 7 | Energy and moving with low Hb | Tiredness from low Hb is real; the stop signs; stand up slowly |
| 8 | Telling your family | The shared lesson, shown, not sent; 181 if home isn't safe |
| 9 | Other reasons Hb gets low | Deworming (ask your ANM); some inherited traits and low B12 or folate, which iron can't fix; easy bruising or nosebleeds; at 50+, or if Hb stays low, the doctor may check the stomach and gut too |
| 10 | Heavy periods can be treated | Tablets that reduce bleeding, hormone treatment or a procedure, decided by a gynaecologist (no names or doses); iron by injection or drip if tablets don't suit you; told you need an operation? ask these questions, get a second opinion, ask about your Hb first |
| 11 | The repeat test | Ask for it; show your doctor; rechecks at about 6 and 12 months |
| 12 | My keep-strong plan | What you did; your plan; restart signs; planning a baby: Getting ready; pregnant: My pregnancy |
| Months 4 to 12 | One card a month | Family; fasting weeks; recheck; still heavy?; seasonal foods; planning a pregnancy (folic acid as advised); treatment changed; restarting; the year |

### Routines and new poses

- **Gentle start (existing),** with dizzy-safe cues: tree pose at a wall; arms up without rising on the toes; get up slowly
  through your side. For 40+ or a "weak bones" answer: a gentle seated side-bend instead of the twist, and knee rocking
  without pulling.
- **Rest and restore (new, 6 minutes):** knees to chest, legs resting on a chair, reclined butterfly, side-lying rest with a
  pillow between the knees, slow breathing out longer than in. New poses: `legsChair`, `sidelie`, `recbut` (shared).
- **Calm breath, Strength at home (existing).**
- Stop strip: `stopGeneral`, with `anaemiaMove` first.

### Food

`food: iron`. Weeks 1 to 3: the reviewed 21 iron days (with this pack's food-only versions). Weeks 2 to 5: the tea gap.
Weeks 4 to 12: a 7-day rotation from the diet audit's foods table by region and diet (veg, Jain, egg, non-veg, no milk),
cheapest first, with swaps and a fasting version. Milk or curd and any calcium tablet at a different time from iron. The
iron kadhai is a tip on the food tile only (mixed evidence). The tile heading is "Foods with iron", not "Food that builds
blood". Pregnancy-caution tags in the shared table: liver, raw sprouts, halim seeds. No food is said to raise Hb or lighten
bleeding.

### Her measure

- **Main:** days heavy bleeding got in her way, each period (any "leaked", "changed at night" or "couldn't do my day"),
  and bleeding days.
- **Secondary:** her Hb exactly as she typed it, with date and her report's range, and no verdict (the ANM's verbal result
  can be typed without a range; a gentle "check the unit on your report" catches a g/L slip); tablet days on scheduled days
  only; care steps done with dates; low-energy days a week from one new check-in chip row ("Energy today: good / ok / low",
  plus "Dizzy or breathless today").
- **The blood-loss chart** stays optional for pad users, as counts only: "this period vs your last, for your doctor". The
  line "a total of 100 or more" comes off programme screens (decision in §20 for all three places it appears).

### Results and what to expect

**Results:** bleeding days and impact days per period, before vs since, like with like; Hb first and latest ("your doctor
says what this means"); tablet days; care steps; low-energy days, weeks 1 to 2 vs 11 to 12.

**What to expect:** week 1, you'll know your Hb and what heavy means for you; the first days of the tablet; many doctors
check after a month; building your blood back up takes months; **tablets and food don't lighten the bleeding itself, but a
doctor can treat heavy periods**; after the course, a repeat test and rechecks at about 6 and 12 months.

### Doctor moments

| When | Urgency | Gist |
|---|---|---|
| Start: a pad every 1 to 2 hours, two at once, or ₹10-coin clots | This week | The reviewed `plan_rv_doc_heavy` line, then the doctor-visit card |
| Start: the same, plus soaking with dizziness or breathlessness | Today | The reviewed `r2` line; fainting or breathless at rest: Now |
| Start: heavy plus "often tired" | This week | An Hb test this week |
| Beside every Hb entry, the same for everyone | Fixed line | "If your report or ANM says your Hb is below 8, see a doctor this week; today if you're breathless, dizzy or have chest pain" (MBBS wording for non-pregnant women). Then "What did your ANM or doctor tell you?": bigger hospital / injection or drip / keep taking tablets / nothing or not sure, each with its fixed card |
| Any, her taps | By the bank | `soakDizzy`, `soak`, `faint`, `feverPain`, `afterProcedure`, `blackStool`, `afterSex`, `midlifeBleed` (45+), `iud`, `severeBelly`, `torsion` (fibroid version), `unsafeHome`, `lowMood`; heavy bleeding 12 weeks after a birth; heavy bleeding on blood-thinning medicine (Today); a reaction to an iron injection (Now) |
| Week 1, weeks 2 to 3, week 5, retest, months 6 and 12 | Routine | The milestones; the free government gynaecologist first, Qura second |
| Week 12, every woman | Routine | "Still heavy? A gynaecologist can look for causes and treat the bleeding" (replaces `noChange()`) |
| Rare, then very heavy periods with PMOS or a high weight | This week | The womb lining may need a check |
| Pregnancy | Hand-off | My pregnancy's iron goal; `iron.js` shows its set-up card to switch plan (never automatic) |

### Adaptivity

- 3 rows across main and add-on, in this order: a due milestone, her tablet, the period note or refill, the food habit, then
  the walk.
- Tablet trouble: an upset stomach gets one coping tip; "I stopped" becomes "Ask your ASHA or doctor about another way",
  with no nagging.
- Hb results change her steps only through what she says she was told, never through the number.
- Fasting days and festival weeks, as in the shared rules, plus "Fasting often? Ask your doctor or ASHA about your tablet".
- Treatment changed (a hormone coil, tablets that reduce bleeding, surgery): comparisons pause and her starting point resets.
- Reminders: the tablet reminder at her time, with a neutral title; the evening check-in tapers after week 4.

### Add-ons

As main, it takes pelvic floor sets or the PMS log. As the "iron-care" add-on elsewhere, it brings one step (the tablet
tick, with food as its sub-line) and its Hb milestone cards. One iron record everywhere (`S.iron`); the iron row on Today
steps aside while the plan shows the tablet step.

### Reuse and new content; reviewers

- **Reuse:** `iron.js` (plans, tick, strip count, `until`, reminder, `UPSET` and `HELP`); the journey's 21 iron days;
  `cond-anaemia`, `cond-labs`, `cond-fibroids`, `cond-hyst`; the diary's flow fields and `r2`; the Learn articles on heavy
  bleeding, pads and cloth, thyroid and anaemia tests, periods after 40, and the doctor visit.
- **Dose-free versions** for programme screens of the lines that name 60 mg, 500 mcg, 400 mcg, albendazole or tranexamic
  acid ("the weekly red tablet your ASHA gives", "a deworming tablet", "tablets that reduce bleeding"). The originals stay.
- **Prerequisites:** `S.iron.info()` (plan, start, until, tablets left, rhythm); an every-other-day rhythm; no weekly
  pre-selection for "told I have low Hb"; the radio-button fix (`app.css` lines 33 and 146); per-day flow with the product;
  the energy chips; `packFor` and `goalsFor` for `lowhb`, with a test that it never opens the cycle or midlife plan.
- **New:** about 1,350 English words (plus about 900 reused), 1 routine with 2 new poses, about 8 food tiles.
- **Reviewers:** Dr. Megha (food, habits, lessons, family card); an MBBS gynaecologist (packet A, the Hb line, treatment and
  IV-iron lines, the fibroid version, the 45+ and bleeding-tendency cards, "Hb before an operation"); a physiotherapist
  (routines and gates); the lawyer (purpose, goal names, title). Packet: **§22**.

### Evidence

- Women wait a mean 2.9 years; 40% never saw a professional; only 20% had a diagnosis and treatment (da Silva Filho 2021).
- About 18% who called a period heavy tracked no heavy flow; long periods are remembered short (Shea 2023, maker-authored).
- Most patient material misses when to go now and the link to iron (Carere 2026).
- Daily charting acceptable to 97.1% of Asian women; best cut-off 76, not 100 (Ko 2021); cut-offs range 50 to 185 (Magnay
  2020, corrected).
- Iron deficiency caused under a third of anaemia in an 8-state venous survey (Ghosh and Sachdev 2025).
- Gains faded within a year after 90 days of IFA (ICMR-NIN 2022, a news report); only 32% took the course (STAR).
- Reminder plus lesson: adherence OR 4.07 (Shao 2024, corrected); one month of phone support raised adherence and Hb (Sharma
  2023); one aid at a time (CSBC, corrected); most stop in the first days (AMB toolkit).
- Tea taken an hour after a meal restored absorption (Ahmad Fuzi 2017, n=12).
- Vitamin C added nothing to tablets (Li 2020), so lemon is never a condition.
- Monitor in the first 4 weeks, continue about 3 months, blood counts about 3-monthly for 12 months (BSG 2021, direct
  fetch; adult IDA, used by analogy).

### Open questions

- Should the gynaecologist set the fixed Hb line at "below 8" for non-pregnant women (WHO 2024 severe band, unverified
  here)? And should the `cond-labs` "Outside the range you entered" pill stay? It compares only with her own report's range.
- The blood-loss chart's "100 or more": dropped from all three places, or kept with its source in the doctor summary?
- Recheck interval: about months 6 and 12 (recommended), or 3-monthly for 12 months as BSG says?
- Ferritin and thyroid wording in lesson 4: NICE NG88's current text couldn't be checked (403).
- Deworming for women aged 20 to 49, and the AMB women-of-reproductive-age age band: confirm from the primary AMB 2026 PDF.
- Keep the bleeding-tendency card, the 45+ womb-lining line and "Hb before an operation"? Gynaecologist.
- One tablet-timing line for `iron.js`, `cond-anaemia` and the day-0 card (§20).
- Does the title "Stronger blood" read as a promise? Lawyer; "My blood and periods plan" is the fallback.

---

## 3. Calmer cycle (`pms`)

**Fixes from the review, applied here:**
- **Blocker:** the "I don't feel safe" button is replaced by "Need help now?". It opens the core crisis sheet with two
  neutral choices (harming myself; someone at home hurts or scares me). It stores nothing, changes no plan state, adds no
  follow-up card and offers no call.
- An active safety question in our own words, approved by the psychiatrist or psychologist, is asked at the reveal and once
  each calm week. It's never stored and computes nothing.
- Results count share of logged days, so a change in logging can't look like change in symptoms. The core-ticks-only
  low-days card and the cycle-length card are dropped.
- The calm week runs from 7 days before her earliest likely day until her period is logged (or 2 days past her range), so
  it never ends before the period.
- Not offered within 365 days of a birth or while breastfeeding, whatever the stage says.
- Evidence re-graded; no "the lessons are the CBT" claim; no promises.
- The log lives inside the evening check-in, so there's one evening form.
- Cycles are counted from her logged starts.
- Qura comes last for this programme, labelled "for routines, sleep and your plan".
- The missing red flags are added.

### Who

Women 18+ at the periods stage (or 45+ with regular logged cycles still) who pick "Calmer days before your period". It
covers PMDD as self-care alongside a doctor, never as a label. Not offered in pregnancy, within 365 days of a birth or while
breastfeeding (mood after a birth instead), or after periods stop (Midlife's calm variant).

### Length and phases

Three cycles (about 12 weeks, up to 16 if her third period is late), then keep going to month 12 with one check per cycle.
Cycles are counted from her logged starts; days before her first logged start are "getting started". With gaps over 35 days
it runs in weeks, using her "my hard days have started" taps as anchors.

| Phase | Focus | New |
|---|---|---|
| Getting started and cycle 1 (about weeks 1 to 4): Notice | The log for good days too; calm breath; moving 3 days; the pause; the crisis sheet and "is it PMS?" up front | Week 1: the log in the check-in, calm breath short version, lesson 1, the safety question at the reveal. Week 2: the pause. Week 3: full calm breath; Gentle start as a move option. A starter calm-week plan is available from day 1 for any calm week that comes early |
| Cycle 2 (about weeks 5 to 8): Skills | Kinder thoughts; people and anger; one thing for me; the log continues daily until 2 complete windows of each kind exist | Week 5: one kinder thought. Week 6: tell one person (optional; only if it feels safe). Week 7: anger. Week 8: her own calm-week plan |
| Cycle 3 (about weeks 9 to 12): Your calm week | Her plan runs before each period; logging drops to the two windows (daily stays optional); sleep | Week 9: the wind-down (`relief-sleep`) and a steady get-up time. Week 10: "one thing for me" daily in the calm week. Week 11: when it's more than PMS. Week 12: her plan for keeping |
| Keep going (to month 12) | One check per cycle | Monthly look-back; restart any lesson |

### Daily steps and how they grow

Slot order: (1) calm breath, or the calm-week item; (2) the move or that week's skill; (3) bed time, or the add-on on its
days. The log is part of the check-in, and the lesson is the card.

| Step | When | Grows | Existing or new |
|---|---|---|---|
| **How was today?** (the first check-in card; discreet "Today's note") | Daily until 2 complete windows of each kind; then the 7 days before her period and cycle days 4 to 10 | Her signs first (up to 3, from all 9; add or drop any time). "All fine today" is one tap. A hard day is about 3 taps. Core mood ticks (`d_calm`, `d_happy`) count as a logged fine day | Existing `periods-pms` log; new placement |
| **Calm breath** | Daily; first in the calm week | 2 minutes in weeks 1 to 2, then the full 5; the wind-down may replace it from week 9 | Existing routine |
| **Move** | 3 days she picks | Adaptive, 10 to 30 minutes a session; held in the calm week, where a 10-minute or Gentle start day counts in full | Existing step, new rule |
| **The week's skill** | Non-move days, and every calm-week day | Weeks 2 to 4 "A pause"; 5 to 6 "One kinder thought"; 6 to 7 "Tell one person" (optional, shown only if family cards are on); 7 to 8 "One thing for me" | New (reuses `relief-calm` lines) |
| **Bed time** | Non-move days if she picked poor sleep; everyone weeks 9 to 10 as a steady get-up time | Existing `bedTarget` | Existing |
| **Plan my calm week** | Once a cycle, 2 days before her calm week or on her "hard days have started" tap | Starter plan (3 defaults) from day 1; her own from week 8; her kept plan from week 12 | New |
| **Hard moment? 3 minutes** (pinned in the calm week) | Any time | Not counted | Existing `relief-calm`, with the 4-in, 6-out breath instead of box breathing's holds for this pin |
| **How often could you handle the hard days this cycle?** | Once, at each logged period start, in the check-in | Rarely / sometimes / most days | New |

### Weekly lessons (gists)

| Week | Title | Card gists |
|---|---|---|
| 1 | Is it PMS? Your month, mapped | Changes before the period that ease once bleeding starts; log every day for 2 cycles, good days too; help is always one tap away (`{help:crisis}`) |
| 2 | Notice, name, pause (Meena's story) | The spark before her period; thoughts, feelings and actions are linked; the pause |
| 3 | Stress makes the hard days louder | Stress and little sleep make them bigger; calm breath as daily practice |
| 4 | Moving, gently | Any movement counts; lighter on hard days; tie it to something you already do |
| 5 | Catch the thought | Hard-day thoughts; "is this the hard days talking?"; a kinder thought |
| 6 | People around you (discreet title) | Only if it feels safe: one line to tell someone; ask for one thing; the card is yours to show or not; 181 |
| 7 | When anger flares | Body signs first; step away for 5 minutes; repair afterwards. **If you fear you'll hurt your child or anyone, put the child somewhere safe, step away and use "Need help now?"** |
| 8 | Plan the hard week | Your 2 cycles of log; move big jobs away from the hardest days; your plan |
| 9 | Sleep | A steady get-up time; the wind-down; up after 20 minutes awake (sit up first, a small light, stand slowly) |
| 10 | One thing for me | Small good things you plan for yourself |
| 11 | When to get more help (discreet title) | For some women the days before the period bring anger, hopelessness or feeling out of control that hurts work or family; a doctor can help with talking therapy and medicines; take your log; low most of the month, or thoughts of harm, is not PMS |
| 12 | My calm week plan, for keeping | What helped; 2 or 3 steps for the days before each period; restart any lesson |

Read-aloud is off by default for lessons 6, 7 and 11 (a headphones hint is shown). Lessons 2, 5 and 7 go into the
teach-back, because thought-challenging is the most abstract content.

### Routines

Calm breath, Gentle start, `relief-sleep` as the wind-down (no new poses), and `relief-calm` as the hard moment.

### Food

Her general plate only. No daily food step. Nothing is said to ease PMS (no calcium, B6, magnesium, evening primrose,
chasteberry, herbs). The PMS page's "small meals every 2 to 3 hours" is a §20 decision. "Fasting today" never counts as
missed.

### Her measure

- **Main:** for each cycle, the share of logged days with any of her signs in the 7 days before the period (days -7 to -1),
  and how many got in the way "a lot". The same for cycle days 4 to 10. A window needs at least 3 of 7 days logged, or it
  says "Not enough days logged this cycle".
- **Secondary:** her coping answer each cycle; days followed.
- **How:** a new `periods.js` API, `windows(startISO)`, returns logged days, sign days and "a lot" days for both windows.
  `CORE_MAP` gains `d_anxious` and `d_irritable` (a deliberate change to the existing grid and summary, with tests updated).
  The intake's sign ids are mapped to the log's, and "tearful" and "poor sleep" are added to the intake.
- **Licence:** our own words; C-PASS gives only which days to compare and the 3-of-7 minimum, never its 30% threshold or a
  label.

### Results and what to expect

**Results on My progress:** a bar per cycle for hard days before the period (as a share of logged days), with "a lot" days
shaded; her coping answers; days followed. The days 4 to 10 comparison appears on the existing grid and in the doctor
summary only, never as a two-bar "gap", which could read as a diagnosis.

**What to expect:** cycles 1 and 2, you're learning your pattern; after 2 cycles you and your doctor can see whether the
hard days follow your cycle; by cycle 3 you'll have your own calm-week plan and three cycles of your log to look back on
with a doctor. No line promises she'll cope better.

### Doctor moments

| When | Urgency | Gist |
|---|---|---|
| Reveal, every woman | Fixed | "If a doctor already treats you for PMS, PMDD or low mood, keep following their plan, and tell them you're using this" |
| Reveal and once each calm week: the safety question ("In the last 2 weeks, have you had thoughts of harming yourself?") | Now on yes | The crisis sheet. Not stored; no label |
| Any calm-week screen: "Need help now?" | Now | The crisis sheet (14416, 112; 181, 112) |
| Any, her taps | By the bank | `lowMood`, `harm`, `unsafeHome`, `psychosis`, `headache`, `breast`, `ovarian` (40+), `faint`; mood changes since starting a hormonal method (tell the doctor who prescribed it); drinking or extra tablets to get through (soon); new pre-period mood after 40 (tell your doctor) |
| At her 2nd logged period after joining (fallback week 10), every woman | This week | "If the week before your period stops you working, studying or caring for your family in most cycles, see a doctor within 2 weeks (gynaecology or psychiatry OPD); take your log" |
| End of core, every woman | Routine | "Still finding these days hard? A doctor can offer more help, including talking therapy and medicines" |
| Week 2, and on drift | Routine | Free government doctor first, then Tele-MANAS, then her ASHA; Qura last, "for routines, sleep and your plan", with the note that Qura confirms by WhatsApp |

### Adaptivity

- Calm-week mode: calm breath first; the walk becomes an optional lighter day that counts; the hard moment pinned. No range:
  her "my hard days have started" tap turns it on for up to 10 days or until a period is logged.
- After an "a lot" day, Sakhi offers a lighter day tomorrow; the crisis sheet stays visible.
- Missed lessons wait (at most 2 in a week). Missed log days: told kindly, with the 3-of-7 rule.
- Reminders: one evening reminder in weeks 1 to 8, then only on window and calm-week days; never naming PMS, mood or
  periods.
- Pregnancy pauses it. A birth or breastfeeding turns the windows off and points to mood after a birth.

### Add-ons

As main: iron tablets or pelvic floor sets. As "The PMS log" add-on to the cycle plan, Easier periods, Stronger blood or
Getting ready: the log, the calm-week line, the hard moment, the crisis sheet, the cycle-2 card, and the lessons read-only.
Its log replaces that plan's third step on window days only. The `periods.js` Home row "How are you feeling today?" hides
while the plan's log runs.

### Reuse and new content; reviewers

- **Reuse:** the `periods-pms` log, grid and doctor card; `relief-calm`; `relief-sleep`; Calm breath; Gentle start; the
  plan's check-in, look-back, lapse and month cards.
- **New:** about 2,200 English words; no new poses; 4 to 6 lesson pictures from existing art; the window API; the safety
  question.
- **Reviewers:** Dr. Megha (habits, lessons); an MBBS gynaecologist (packet A, the cycle-2 card, lesson 11); a psychiatrist
  or RCI-registered clinical psychologist (the safety question, the crisis sheet wording, lessons 7 and 11), with a dated
  test call to 14416; a teach-back with about 5 women on the crisis sheet, the calm week and lessons 2, 5 and 7. The
  `periods-pms` tile's own "needs approval" gate clears first. Packet: **§23**.

### Evidence

- CBT is the evidence-based core; a prospective diary for 2 cycles (RCOG GTG 48, via the earlier doc; ACOG 2023 grades
  unverified).
- Therapist-guided 8-week iCBT for PMDD (n=174), effects held at 6 months, about 5 hours a week, acute suicidality excluded
  (Weise 2019; Kues 2014 protocol). Moderate, for guided CBT only; Sakhi's dose is untested.
- Retrospective reports predict poorly; days -7 to -1 vs 4 to 10, at least 3 of 7 days, at least 2 cycles (C-PASS,
  Eisenlohr-Moul 2017).
- In 599 self-selected people with PMDD, 72% reported lifetime suicidal ideation and 34% attempts; the authors call for
  frequent screening (Eisenlohr-Moul 2022, corrected).
- Trackers need ease on bad days, chosen and droppable symptoms, and insight back (Apsey 2024, corrected; n=12).
- Exercise for PMS: exploratory subgroups favour 9 to 12 weeks (Li 2026, low).
- India: PMS 43% and PMDD 8% pooled, with high heterogeneity (Dutta and Sharma 2021, direct fetch).

### Open questions

- Never store the "Need help now?" tap (recommended), even though a doctor might find it useful?
- The log's shape: today's signs plus one impact level (recommended, no migration), or per-sign levels?
- Weeks 9 to 12: logging only in the windows (recommended), or daily for more data?
- Is calm breath's 2-minute start acceptable, given the routine was approved at 5 minutes?
- Who reviews the PMDD and crisis wording, and can a weekly slot be held?
- The cycle-2 card is still a C-PASS-like contrast next to lesson 11: lawyer to confirm it stays on the "inform" side.
- Not checked: ACOG CPG 7 grades (paywall); NICE CKS PMS. A follow-up search could do both.

---

## 4. Strong pelvic floor (`pelvic`)

**Fixes from the review, applied here:**
- **Blocker:** no heaviness track in pregnancy. Pressure or heaviness before 37 weeks opens the pregnancy go-now card;
  pregnancy gets its own goal, "Keep my pelvic floor strong", with sets only.
- Bladder training is off in pregnancy, until the 6-week check after a birth, and whenever she taps "hard to empty" or
  burning.
- Overflow and fistula get their own lines, which override "wait 3 months".
- Burning is "today" in pregnancy; blood in the urine has its own line.
- Heaviness before an exam: find-it and lying sets only, up to 4 weeks, while "Get checked once" leads; the 16-week core
  opens only after "a doctor said prolapse".
- One level-unlock rule; position lessons keyed to her level.
- The daily load is capped at 3 rows.
- Bone-safe swaps by default in midlife.
- Pregnancy limited to sets and knack cards.
- The fibre tag and the food half of the toilet step are dropped.
- No promise words.

### Who

Any woman 18+ at any stage who leaks urine (with a cough, sneeze, laugh or lift, or on the way to the toilet), feels
heaviness down below, or wants to keep it strong. In pregnancy: sets only. After a birth: inside After the birth's pelvic
step. At the trying stage: an add-on only. Not for diagnosis or treatment of prolapse, fistula, infection or nerve problems,
which go to a doctor through the bank. Pain on squeezing, or painful sex, switches her to relax-first and a doctor card.

### Length and phases

Leaks (stress, urge or mixed): 12 weeks. Heaviness: up to 4 weeks of find-it and lying sets before a doctor has seen her,
then 16 weeks once she ticks "a doctor said prolapse". Both then "Keep strong" to month 12.

| Weeks | Phase | Focus | New |
|---|---|---|---|
| 1 to 2 | Find it | The right squeeze and full let-go; mistake checks; level 1 lying or side-lying; the knack from week 2 | The find-it check (days 1 to 3, after which she's asked whether squeezing hurts); the trainer; lesson 1; heaviness: "Get checked once"; urge: one "wait a little longer" step (not in pregnancy or before the 6-week check) |
| 3 to 4 | Build the hold | Longer holds as levels unlock; quick squeezes; water through the day | 4-week bother question; "Get your squeeze checked, free" offer |
| 5 to 6 | Less pushing down | Toilet position and no straining; urge: the gap between trips grows | The toilet step (heaviness: weeks 2 to 4) |
| 7 to 8 | Standing and lifting | Standing sets once her level reaches them; safe lifting; daily-life practice | The lift step; the daily-life routine (not before a C-section's 6-week check); halfway look-back |
| 9 to 12 | Into your day | Near-full effort during tasks; the red-flag lesson; her keep-strong plan | In-your-day step; results; the 3-month card |
| 13 to 16 (heaviness, after a doctor) | Steady | Day-end rest; pessary and sex lessons; check-ins at weeks 2, 6, 11 and 16 | The day-end rest step |
| Keep strong (to month 12) | Keep strong | 1 set a day or sets on 3 days; monthly question; a recap card a month | Her plan |

### Daily steps and how they grow

Three rows at most: (1) the sets (the knack card plays after the set, with no extra tick); (2) one rotating "small habit"
(wait, water, toilet, lift or in-your-day, by fortnight); (3) a check, a gate or the daily-life routine on its days. The
optional toilet-trip tap counter lives on the My measure tile, not on Today.

| Step | When | Grows | Existing or new |
|---|---|---|---|
| **Squeeze sets** (discreet "Your 2 minutes") | Daily at her chosen anchors (after brushing, after lunch, bedtime, during a feed) | 8 levels: L1 lying 3 s ×8; L2 sitting 3 s ×10 + 5 quick; L3 sitting 5 s ×10 + 5 quick; L4 5 s ×10 + 10 quick; L5 standing 7 s ×10 + 10 quick; L6 8 s; L7 10 s ×10; L8 10 s ×8 to 12 near full effort during a task. Let-go as long as the hold. A level unlocks after 5 days with a full set at it; "easy" twice offers it sooner; she can stay or go back. 1 set counts as followed ("a good start"); 3 a day is the full dose. Partial sets count as "partly". Pregnancy from week 13: sitting or side-lying only. Physiotherapist to confirm the table | Existing trainer; levels, voice count and pain stop new |
| **The knack** (card after each set) | From week 2 | Scenes change every 2 weeks: cough or sneeze; standing up from the floor or a chair; lifting a water pot, bucket or child; stairs and carrying | New |
| **When the urge comes: stop, squeeze, breathe, walk calmly** | Daily, urge and mixed tracks only | Weeks 1 to 2 get through one urge; from week 3 the gap grows a little each week, towards a comfortable gap (the target is a doctor or physiotherapist decision). Off in pregnancy, until the 6-week check after a birth, and after a "hard to empty" or burning tap; in pregnancy instead: "Go when you need to, at least every 3 to 4 hours, and tell your doctor about rushing" | Extends a reviewed `intimate.js` line |
| **Water through the day** | Weeks 3 to 4 | "Drink through the day so your urine is pale; drink more when it's hot or you're feeding." Never cut water to stop leaks | Reuses `meno.js` line |
| **On the toilet: knees up, breathe out, no hard pushing** | Weeks 5 to 6 (heaviness 2 to 4) | Toilet position only; no food in this step | New |
| **Lift the safe way** | Weeks 7 to 8 (heaviness 3 to 8) | Water pot, bucket, fodder, a child; lighter loads with heaviness and after a birth | Reuses `intimate.js` |
| **One set standing at a task** | Weeks 9 to 12 | Standing, then walking or carrying (L8) | New |
| **End of day: one lying set, feet up 5 minutes** | Heaviness, weeks 9 to 16 | Fixed | New |
| **Find the right muscles** | Days 1 to 3, and the first day of each new position | Fixed | Partly existing (cue reworded) |
| **Get your squeeze checked, free** (card) | Weeks 2 to 4, and on a "not sure" tap | The care team: a government physiotherapist or doctor, her ASHA or ANM, Ask Qura | New |
| **Get checked once for the heaviness** | Heaviness, from week 1 until done | Opens `intimate-prolapse` "Where to go" and Care near me | New |
| **Breathe and let go** | The relax-first branch, in place of sets | Fixed; squeezing levels pause until a doctor or physiotherapist says | New routine |
| **My keep-strong plan** | Week 12 (heaviness 16) | 1 set a day or 3 days a week; 2 anchors; a reward | New |

### Weekly lessons (gists)

| Week | Title | Card gists |
|---|---|---|
| 1 | Your hidden muscles (Meena, 34, two children) | A hammock of muscles; leaks and heaviness are common and exercise helps many women; the shared "find your pelvic floor" lesson; never practise by stopping your wee |
| 2 | Is it the right squeeze? | The 5 mistakes; let go fully; not sure by week 4? a free check (you can ask for a woman doctor) |
| 3 | The knack | Squeeze just before a cough, sneeze or lift; it may help some women leak less; your scenes |
| 4 | Your bladder's habits | Going "just in case" teaches the bladder to hold less; the urge routine; tea and coffee (the wording Mohit decides, below); don't drink less water |
| 5 | Water and the toilet | Straining pushes down; knees up, breathe out |
| 6 | Lifting without pushing down (Kamla's water pots) | Bend your knees, hold it close, breathe out and squeeze; share loads (an optional "For him" card about heavy loads only, never her symptoms) |
| 7 | Standing up strong | Sets sitting, then standing at a wall, as your level reaches them |
| 8 | Halfway | Your weeks so far; muscles take about 3 months; still unsure? the free check |
| 9 | Cough, smoke and weight | A cough over 2 weeks needs a doctor's check; chulha or beedi smoke; extra weight adds load |
| 10 | Your stage (one of four) | After a birth: leaks are common at first, the 6-week check. 40+: dryness and rushing, a doctor's option of a treatment inside the vagina, bleeding after menopause within 2 weeks. Pregnancy: keep going sitting or on your side; fluid from the vagina may be your waters: go now |
| 11 | When to see a doctor | The bank card for this programme in 4 levels; other treatments (a ring, surgery), free or low-cost with PM-JAY |
| 12 | Keep it strong | Muscles weaken if you stop; your plan |
| 13 to 16 (heaviness) | Heaviness through the day; a ring that holds things up (and its warning signs); sex and your pelvic floor; your 16 weeks (exercise can ease heaviness but doesn't put things back) | |
| Keep strong | Monthly recap | One earlier card, her month, a fresh start |

A one-line crisis link sits in lesson 1 and in results: "Feeling low or alone because of this? Tele-MANAS 14416 is free."

### Routines and new poses

- **Squeeze sets** (the existing trainer, levelled): ready, squeeze and lift, hold with a count, let go as long, repeat,
  quick squeezes. The default count is non-verbal (vibration, tones and big numbers), because read-aloud is off on shared
  phones; voice is opt-in. New poses: `sidelie`, the cue overlay, `cough`.
- **The knack scenes:** cough or sneeze, `floorstand`, `liftpot`, `hipchild`, stairs, the urge scene.
- **Daily-life practice (weeks 7 to 12):** chair sit-to-stand with a squeeze, bridge with a squeeze, floor-to-stand at a
  wall, a light pot carry. In midlife (bone-safe by default): chair sit-to-stand instead of floor-to-stand, and no carry.
  Not before a C-section's 6-week check and her doctor's OK. In pregnancy: not offered.
- **Breathe and let go (relax-first):** belly breathing, reclined butterfly, child's pose, gentle knee rocking (in midlife,
  supported breathing replaces knee rocking).
- Stop strip: stop if it hurts, if you feel pushing or bulging down, if you hold your breath or feel dizzy; pain twice
  switches to relax-first.

### Food

Two plate habits only: water through the day, and dal, sabzi, fruit and whole grains as part of every plate on the food
tile, never paired with the toilet step and never said to ease constipation or leaks. The reviewed "cut down tea, coffee and
cola" line (`intimate.js`) pairs a drink with a symptom: Mohit decides whether it stays as a rule exception, or becomes
"tell your doctor how much tea or coffee you drink".

### Her measure

- **Main:** "Did you leak this week? Never / sometimes / most days", plus "When? A cough, sneeze, laugh or lift / rushing to
  the toilet / both". Heaviness track: the same about heaviness.
- **Secondary:** set days and level (from the trainer, never a tap); "How much does it get in the way of your day?" (0 to 3)
  at the start and weeks 4, 8 and 12; "Are you sure you're squeezing the right way?" at weeks 1, 4 and 12; urge track: the
  optional tap counter in week 1 and week 7; "Compared with when you started: better / same / worse".
- **Licence:** our own words. A reviewer compares the wording with ICIQ-UI SF items 3 and 4 and with POP-SS.

### Results and what to expect

**Results:** leaks, first 2 weeks vs last 2; bother at start vs week 12; set days and level reached; "sure" at week 1 vs 12;
urge trips week 1 vs 7. Beside them, the same card for everyone: "Still leaking or heavy after 3 months of exercises? See a
doctor or physiotherapist; other treatments help."

**What to expect:** weeks 1 to 2, the muscles can be hard to find; the knack can help some women early; many women notice
small changes over weeks; about 3 months for the muscles to get stronger; heaviness can ease but exercise doesn't put things
back; a set a day keeps it.

### Doctor moments

| When | Urgency | Gist |
|---|---|---|
| Start, her taps on the safety screen | By the bank | `cantPee`, `fistula`, `burning` (Today in pregnancy), `urineBlood`, `feverIll`; a bulge that stays outside (Today; Now if very painful); wind or stool hard to hold (This week); pain on squeezing or with sex (relax-first plus a doctor card) |
| Any | Now | Sudden loss of bladder or bowel control with numbness between the legs, leg weakness or bad back pain: 112 (new line, gynaecologist) |
| Any | This week | A gradual leak with tingling, numbness or weakness in the legs |
| Start: a past operation for leaks or prolapse (mesh), or pelvic cancer surgery or radiation | Hold | "Show this plan to your doctor first"; levels held at L2 until a doctor or physiotherapist says OK |
| Heaviness, week 1 | Routine | "Get checked once: a doctor names the cause, not the app" |
| Heaviness after a doctor: weeks 2, 6, 11, 16 | Routine | A self-review card, the same for everyone |
| Weeks 2 to 4, and a "not sure" tap | Routine | The free squeeze check |
| Week 12 (16), month 12 | Routine | The 3-month card for everyone |
| Pregnancy, any leak that may be fluid | Now | `pregWaters`, above every pelvic floor screen |
| Pregnancy, pressure or heaviness before 37 weeks | Now | `pregPains` |
| 40+ | Within 2 weeks | `ovarian`, `afterMenopause` |
| A ring pessary in place with bleeding, a bad smell, pain, or an overdue check | This week | Fixed card |
| Repeat infections (2 in 6 months), thirst with weight loss | Routine | See a doctor; a sugar test at the AAM |

### Adaptivity

- Levels unlock from her sets, never the calendar. After 3 weeks away, holds step back one level.
- A look-back "It's getting worse" tap offers lying sets and pauses lifting and daily-life steps for 2 weeks, with the bank
  card. Pain during a set twice switches to relax-first.
- Period days: a lying set counts; one set is enough. Pregnancy and after a birth, as above. Midlife: if she leaks when
  stamping, Midlife's impact step becomes heel raises.
- She can add "rushing" or "heaviness" in the look-back; heaviness adds "Get checked once" and, after a doctor, extends to
  16 weeks without a restart.
- At most 2 reminders a day, neutral words; optional set reminders at her anchors.

### Add-ons

As main (periods, trying-as-add-on-only, midlife stages): iron tablets or the PMS log. As the "pelvic" add-on: one set step
a day and the weekly leak question in the same look-back. One trainer, one store and one level across all stages, so her
level carries from pregnancy into After the birth.

### Reuse and new content; reviewers

- **Reuse:** the `post-pelvic` trainer, `intimate-prolapse`, `meno-intimate`, the check-in chips "leak" and "urine", the
  menopause diary's urine symptom.
- **Rewrite for review:** the cue in `post.js` 335, `explain.js` 94 and `intimate.js` 365 (lead with holding in wind);
  "usually an infection" in `intimate.js` 363; `pf_p` "helps stop" (and its Hindi "से बचाता है") to "may help"; `pf_goal`'s
  missing Hindi sentence; stage-neutral versions of `pf_topic`, `G.see` and `tp_leak`.
- **Prerequisites:** levels, quick squeezes, a level field and a stage-neutral route and store in `post.js`, with migration;
  the course counted from the plan's start, not her first ever set; an `S.pelvic` API; the back row no longer always going
  to the after-birth hub.
- **New:** about 2,600 English words; 7 poses and 2 props; a "mistakes" figure.
- **Reviewers:** a women's-health physiotherapist (every cue, level, position, routine, the relax-first branch, pregnancy and
  C-section rules); an MBBS gynaecologist (packet A, including the new fistula, numbness and retention lines, the heaviness
  pathway, urge targets); Dr. Megha (habits, scenes). Packet: **§24**.

### Evidence

- Standalone app and postal programmes work: Tät ICIQ 11.1 to 7.0 vs 11.0 to 10.2; URinControl non-inferior to GP care
  (Hou 2022, corrected); Tät II for urge and mixed leaks with a 7-step bladder programme (Wadensten 2021).
- No app group averaged 3 sets a day; daily use went with improvement (Harper 2023).
- Bø's principles: 8 to 12 near-maximum squeezes, building positions; NICE NG123: at least 8, 3 times a day, 3 months.
- Self-belief outruns ability: 24% correct vs 71% sure (Nepal 2025, a conference abstract); the "squeeze the anus" cue beat
  "stop the flow" in 56 students (Ben Ami and Dar 2018, corrected).
- The knack (Miller 1998, n=27; Miller 2020 narrated tutorial).
- POPPY: 16 weeks of one-to-one physiotherapy for newly diagnosed prolapse, a modest effect (direct fetch of the abstract);
  PREVPROL maintenance (figures unverified).
- Biofeedback adds nothing (OPAL); group training non-inferior (GROUP).
- Real-world gains are smaller (Rygh 2021).
- Antenatal training in continent women: late-pregnancy leaks RR 0.38, 3 to 6 months after the birth RR 0.71 (Woodley 2020,
  direct fetch).

### Open questions

- Physiotherapist: the 8-level table, positions by stage, the bridge in pregnancy, levels before the 6-week check.
- The urge gap target: numbers allowed (for example "towards 3 to 4 hours"), or only "a little longer each week"?
- The tea, coffee and cola line (above).
- The new fistula, numbness and retention lines, and a re-check of NICE NG123's referral list (403 today).
- Who can do a free squeeze check in practice (district physiotherapy OPDs; can an ANM or AAM doctor check externally)?
- The pain-with-sex question: at joining, or only behind "just for me" after the find-it check?
- Hindi naming: "पेल्विक फ़्लोर" or an everyday phrase such as "नीचे की मांसपेशियाँ"?

---

## 5. Midlife: cool, calm, strong (`meno`)

**Fixes from the review, applied here:**
- **Blocker:** for women still having periods (the "mid" stage), the pinned card adds the reviewed line on bleeding after
  sex, bleeding between periods, periods every 2 to 3 weeks or longer than 8 days.
- New red flags: ovarian warning signs, night sweats with fever (TB), hot or swollen joints.
- The adult Before-you-move screen.
- Bone-safe versions by default for every midlife woman.
- Proxies for a broken bone in the back, and a heaviness question before any impact.
- Impacts in version 1 are firm stamping or brisk marching only, after 8 weeks of strength and the ready check, building to
  50 per session. Module C is capped at levels 1 to 3 when it comes first.
- A fixed 3-row day.
- Rest is cited to stimulus control (AASM 2021), with a safer 20-minute rule and a shared-bed version.
- No promise words; the Qura offer discloses WhatsApp confirmation and uses a neutral topic; Qura callers get a crisis script.
- A fall with injury is "Now".
- A coded under-40 gate and a 40 to 45 card.

### Who

Women 40+ at the midlife stage (periods changing) or after menopause (stopped 12 months, or after an operation), whose goal
is flushes or night sweats, sleep, mood, bones and strength, weight, or (new) aches and tiredness. Under 40, no programme
starts until she taps that a doctor told her (POI version); 40 to 45 with periods stopped gets a pinned "early menopause:
tell your doctor" card, with the overlay after her tap. Heavy bleeding at 40+ is Stronger blood. Women 40+ with PMOS keep the
cycle plan (open question). Pregnancy pauses it.

### Length and phases

Three 4-week modules in the order of her goal, then keep going to month 12. Rest can stretch to 6 weeks at her choice.

| Her worst problem | Order |
|---|---|
| Daytime flushes | A Cool and calm → B Rest → C Strong and steady |
| Night sweats and waking, or sleep | B → A (the calm variant if she has no flushes) → C |
| Mood or worry | A (calm variant) → B → C |
| Bones | C → A → B |
| Weight | C → B → A |
| Aches and tiredness | C (after the blood-test card) → B → A |
| POI or early menopause, with a doctor | C → A → B |

Strength and balance run at a low dose from week 1 in every order (2 short strength days and the steady minute), and the
bone lessons sit in whichever module comes first.

| Module | Focus | New each week |
|---|---|---|
| **A. Cool and calm** | A 4-chapter CBT course for flushes in our own words, one chapter a week, with a 2-minute daily practice; the calm variant uses the same spine with worry and low-mood examples | Note one flush; slow breathing as a skill; your calm line; night kit and "my flush plan"; the week-2 check and the week-4 treatment card |
| **B. Rest** | A 30-second morning note plus behaviour rules that grow weekly; no computed sleep window | Note and a fixed get-up time; the 20-minute rule; naps, light and the wind-down; "my sleep plan" and the sleep doctor card |
| **C. Strong and steady** | Strength, balance, a straight back, safe lifting, bone foods; impacts only as below | Ready check and the tall-back move; lifting the safe way and a balance level; second sets; results and her keep-going plan |
| **Keep going** (to month 12) | One monthly session; one kept step; rejoin any module | Monthly lessons: hormone-therapy questions; dryness and urine; the heart after 40; weight and muscle; mood; check-ups |

### Daily steps and how they grow

Three rows: (1) **Move** (a walk; Strong and steady on its 2 days; the steady minute folded into walk days); (2) **Today's
skill** (the module's CBT practice or sleep rule, never dropped); (3) food on its days, otherwise folded into the check-in.

| Step | When | Grows | Existing or new |
|---|---|---|---|
| **A brisk walk** (you can talk but not sing) | Daily with 2 rest days | Adaptive from 10, 15 or 20 minutes towards 150 a week; cool hours on hot days | Existing, new rule |
| **Strong and steady** | 2 non-consecutive days | A level every 2 weeks if 3 of her last 4 sessions were done and not "hard": 8, 10, 12 reps, then slower lowering, 2 sets, a held load (a water bottle). Capped at levels 1 to 3 in the first 8 weeks whatever the order | Existing strength routine, new poses |
| **A steady minute by the wall** | The other 4 days, inside the walk row | Up a level after "easy" twice: 2 hands, 1 hand, fingertips, heel-to-toe, one leg with a head turn; always at a wall | New |
| **Firm stamps or brisk marching** | After 8 weeks of strength sessions and the impact-ready check | 10, building by 10 a week to 50 impacts in a session; never jumps or heel drops in version 1 | New |
| **Note one flush** (A, week 1) | Daily | Picture chips for what was happening; "No flush today" counts | New |
| **Slow breathing while you're calm** (A, week 2) | Daily | A skill to get through a flush, never said to reduce flushes | Existing `relief-hot` |
| **Your calm line** (A, week 3) | Daily | She picks one of 3 lines | New |
| **Night kit ready** (A, week 4) | Daily | Her flush plan, made once | New |
| Calm variant (A) | Daily | Note a tense or low moment; a kinder thought; one thing for me; the crisis sheet on every screen | New (reuses `relief-calm`) |
| **Morning note** (B) | Daily, morning, in Rest weeks only | 4 taps with picture clocks: bed time, got-up time, awake in the night, how rested. The week's rule shows under it | New |
| **A bone food today** | 3 days a week in A and B, daily in C | A calcium food, then protein at each meal, then greens and dal; kitchen measures | Existing list, new tiles |
| **My week** (in the look-back) | Weekly | Her goal's 0-to-10 number and "How well could you handle them? Not well / partly / well" | New |
| **My steady check** | Weeks 1, 4, 8, 12, then monthly | Seconds on one leg at the wall, timed by beeps (a beep every 5 seconds, a double beep at 30), never looking at the screen | New |

### Weekly lessons (gists)

| Week | Title | Card gists |
|---|---|---|
| A1 (opener in every order) | Midlife, explained | Periods change and stop, on average about 46 in India; many women also find things easier; treatments exist from an MBBS gynaecologist; herbal products aren't advised. Still having periods: the contraception card (you can still get pregnant) |
| A2 | Stress and the slow breath | Stress turns the heat alarm up; breathing as a skill; the week-2 check |
| A3 | Thoughts during a flush | "Everyone is staring" makes it feel bigger; your calm line |
| A4 | Night sweats, and keeping it going | Night kit; flushes can come and go for years; the treatment card |
| A1 to A4 calm variant | Mood in the midlife years | Low days are common; most women don't get depression; a past low spell makes it likelier (asked only in this variant); small steps; Tele-MANAS |
| B1 | Why sleep changes now | Steady habits change sleep more than a page of tips; the morning note |
| B2 | A steady get-up time, and the 20-minute rule | Awake about 20 minutes? Sit up first, put on a small light, stand up slowly, sit somewhere dim until sleepy; in a shared room, sit up in bed or a corner with the calm breath |
| B3 | Naps, light and winding down | A short nap before 3 pm or none; morning light; the wind-down |
| B4 | When sleep needs a doctor | Loud snoring with gasps, dozing off while sitting or talking, restless legs; sleeping pills are a doctor's choice; your sleep plan |
| C1 | Bones after 40 in India | Walking is good but not enough; strength and balance are part of looking after your bones (never "builds bone"); a physiotherapist can supervise heavier training |
| C2 | Steady on your feet | Balance can be trained; level up when easy; a safe home |
| C3 | Bend and lift the safe way | Bend your knees, back long, hold it close; the tall-back move; weak bones or a back fracture: no forward bends or side bends, walking only for impact |
| C4 | Food for bones, check-ups after 40, your keep-going plan | Ragi, til, curd, greens, protein; tablets only as your doctor advises; BP and sugar yearly (free at the AAM); Hb is free there, ask what else is; a bone scan if you have risk factors |
| Months 4 to 12 | Monthly | Hormone therapy as a decision aid (questions for your doctor); dryness, urine and the pelvic floor add-on; the heart; weight and muscle; mood; check-ups; flushes back? sleep slipping? your year |

### Routines and new poses

- **Strong and steady (new; replaces Strength at home for this pack):** loosen up, march, chair stand-ups, wall push-ups,
  heel raises at a wall, step-ups with the rail, one-leg stand, heel-to-toe walk, the tall-back move (back to a wall,
  shoulder blades back, hold 3 to 5 seconds, 3 to 5 times, instead of a standing backbend), side leg lift at a chair,
  bridge (optional), rest. New poses: `oneleg`, `tandem`, `tallback`, `sidelift`.
- **Steady minute (new),** **When a flush starts** (`relief-hot`; step 2 reworded as comfort, "have water close by", not
  relief), **Wind-down** (`relief-sleep`), **Calm breath**, **Gentle yoga, bone-safe** (twist and triangle removed; knees to
  chest and child's pose swapped for supported breathing).
- **Bone-safe by default:** a "bones" limit, beside today's knee and back limits, removes forward bends, side bends and
  loaded flexion from every routine in the app for this pack, including `relief-cramps` steps 2 and 3. Smooth twists are
  allowed (ROS).
- Stop strip: `stopGeneral`, plus `heat`.

### Food

`food: bones`. Calcium and protein foods in kitchen measures from the shared table: milk, curd, ragi, til, paneer, chaulai,
methi, sarson, moringa, rajma, chana, soy, small fish, eggs, dal. Habits as above. For the weight goal, the PMOS plate
habits framed as muscle and waist, never a weight-loss target. No food said to ease flushes, sleep or mood. No soy,
shatavari, ashoka or "natural hormone" products. Calcium and vitamin D tablets only "as your doctor advises", never with
iron, never a dose.

### Her measure

- **Main, by goal:** flushes, a weekly 0-to-10 problem rating plus coping; sleep, nights she woke rested (from the morning
  note); mood, low or worried days a week; aches, a weekly 0-to-10 "how much did they get in your way"; bones, strength days
  and seconds on one leg; weight, strength days and optional waist.
- **Secondary:** weeks with flushes, poor sleep and low mood from the optional 12-symptom diary (`S.meno.trend`); walk
  minutes; energy; what helped.
- **Licence:** our own words; not MRS (the existing perimenopause score stays a separate gated tool and never feeds the
  plan's summary line), HFRS, Greene, ISI, PSQI or the Consensus Sleep Diary.

### Results and what to expect

**Results:** her number, first 2 weeks vs last 2; coping; good nights, first 7 notes vs last 7; strength days; seconds on
one leg week 1 vs week 12; minutes; energy. Plain counts, never "improved".

**What to expect:** weeks 1 to 2 you get to know your pattern; flushes may feel easier to handle even when they still come;
sleep settles slowly over weeks; stand-ups and balance get easier; bones change too slowly to feel, so the habits are what
count; flushes can come and go for years, and your skills and your doctor's treatments stay open.

### Doctor moments

| When | Urgency | Gist |
|---|---|---|
| Pinned, stage "stopped" | Within 2 weeks | `afterMenopause` |
| Pinned, stage "mid" | This week | `midlifeBleed` (the reviewed hub line) |
| Any routine or lesson screen | Now | `faint`, chest pain spreading to the jaw or arm, `soakDizzy`, `heat` |
| Start, the adult screen | Routine | Easy walking only on a yes; strength held at level 2 |
| Start, POI (under 40, her doctor's tap) | Routine | "Your doctor's plan comes first; hormone therapy is usually advised until about the usual age of menopause (it isn't contraception); ask about a bone scan; BP and weight yearly" |
| Start, aches and tiredness | Routine | "Ask your doctor which blood tests you need (often Hb and thyroid; vitamin D if your doctor advises)"; never labelled iron |
| Any, her taps | By the bank | `ovarian`; night sweats with fever, a cough of 2 weeks or weight loss (this week; the free TB test); hot, swollen or red joints, or stiffness over an hour (soon); `breast`; a racing heartbeat that doesn't settle, or flushes with weight loss and shaky hands (soon); on hormone therapy, one swollen calf, sudden breathlessness, or weakness on one side or trouble speaking (Now) |
| Impact-ready check | Routine | Lost height, a bent back, or sudden bad back pain after bending, lifting or a small fall: see a doctor soon; walking-only impact; heaviness or a bulge in the vagina: no impacts, the pelvic add-on, a doctor soon |
| "I fell" in the steady minute | Now if she hit her head, can't stand or bear weight, or a bone looks wrong; otherwise soon | Level-ups pause; a physiotherapist or doctor |
| Week 2 | Routine | "How is it going? Pick your one goal." "Want someone from Qura to call you?" (habits only; "Qura confirms on WhatsApp"; topic "A call about my plan") |
| Week 4 (end of A), the same for everyone | Routine | "If flushes still stop your day or your sleep most weeks, an MBBS gynaecologist can talk you through hormone and non-hormone treatment" |
| Week 8 (end of B) | Routine | "Poor sleep most nights for weeks even with steady habits: worth a doctor's visit" |
| Any mood or look-back screen | Now / this week | The crisis sheet; `lowMood`; never the Qura call |
| Week 12 | Routine | The check-ups-after-40 card, the same for everyone |

### Adaptivity

- Modules re-order if her goal changes; finished chapters are kept. Chapters wait if missed.
- A bad-week tap gives a lighter week: the skill stays, the walk becomes optional, no level-ups, and the end-of-module card
  can be opened early on her tap. No doctor card ever opens from diary values.
- Impacts as above; a leak or pain with stamps gives heel raises plus the pelvic add-on offer.
- After any birth at 40 to 45: Strong and steady restarts at level 1, with no impacts or held loads until 12 weeks and a "no
  heaviness or leaks" answer.
- Hot days, fasting days and pregnancy as in the shared rules.
- One evening reminder; a morning one only in Rest weeks (decision 15).

### Add-ons

Pelvic floor sets (offered by leaks in the ready check, a dryness lesson or the look-back); iron tablets only if her doctor
prescribed them. The existing `meno-diary` Today row is de-duplicated.

### Reuse and new content; reviewers

- **Reuse:** `meno.js` (diary, trend, bones page, hormone-therapy page, intimate page, surgical page, the hub's doctor list,
  `poiCard`); `relief-hot`, `relief-sleep`, `relief-calm`; the strength routine and poses; the 9 midlife Learn articles.
- **Fix before linking:** the diary's data-driven hormone pointer (`lotHot >= 2`) becomes a fixed card; the palpitations
  line becomes a fixed red flag; `plan_fb_hot` and `plan_fb_bones` reworded; Rest gets its own why-line instead of
  `plan_fb_sleep`'s "your cycle".
- **Prerequisites:** an exported `voiceDefault` and a calm-line hook in `relief.js`; a discreet-aware relief player; a
  per-pack week count; the morning reminder; the picture-clock picker; the spoken 0-to-10 scale.
- **New:** about 4,700 English words (the largest pack, because the CBT course is the content); 4 to 5 new poses; about 15
  to 20 card drawings from `S.art`.
- **Reviewers:** an MBBS gynaecologist (packet A, the CBT flush wording against NAMS and IMS, the hormone-therapy decision
  aid, POI, every doctor card); Dr. Megha (food, habits, voice); a physiotherapist (every pose, the stamp build, balance,
  bone-safe swaps); a psychiatrist or RCI-registered clinical psychologist (the calm variant, the crisis card, the Qura caller
  script); the lawyer. A teach-back on the red flags and the impact-ready questions. Packet: **§25**.

### Evidence

- NAMS 2023: CBT and clinical hypnosis recommended for flushes; paced breathing, cooling, avoiding triggers, exercise, yoga
  and relaxation not recommended as flush treatments.
- IMS 2026: Indian women reach menopause about 46.6; aches and tiredness 73.7% vs flushes 16.5 to 88%; rule out vitamin D,
  anaemia, thyroid, autoimmune disease and arthritis first; walking alone isn't enough for bone; balance is essential; with
  severe osteoporosis avoid forward and side bending. (Its yoga grade for flushes is D, not B, as found at source.)
- The tested self-help CBT dose is 4 weeks (MENOS@Work, corrected); coping beliefs carry the benefit (Norton 2014).
- Sleep tips alone barely help (ISI −1.1 vs −7.7 for CBT-I; Drake 2019, Kalmbach 2019); phone CBT-I over 8 weeks in women
  with flushes (McCurry 2016); a strict sleep window has contraindications (RACGP BBTI; Kyle 2014); compression was slower
  and therapist-guided (CompRest, corrected, low). Stimulus control alone is a conditional recommendation (AASM 2021,
  unverified here).
- At least 50 impacts per session; brisk walking only with vertebral fractures (Brooke-Wavell 2022, read by the reviewer).
- A supervised heavy programme raised spine BMD while the home control lost bone (LIFTMOR, corrected), so no bone promise.
- Flushes last a median 7.4 years (Avis 2015).
- App-delivered balance training: 16% fewer falls over 2 years, 30 to 40% reached the dose (Delbaere 2021, corrected).
- POI: hormone therapy until the usual age of menopause; a bone scan at diagnosis (ESHRE/ASRM/IMS 2024, direct fetch).

### Open questions

- Flush wording: NAMS (recommended) or IMS?
- Should "Aches and tiredness" join the midlife goals (decision 11)?
- The weekly rating: spoken 0 to 10, or the 5-picture scale? Field-test both.
- Stamps at all in an unsupervised app, or only heel raises until a physiotherapist approves the ready check?
- POI version: its own fertility and grief lesson for women under 40, reviewed separately?
- When does a woman 40+ with PMOS move from the cycle plan to midlife?
- A hypnosis audio later, with a validated protocol and a trained Hindi voice, or never?
- Not checked: Indian yoga trials for menopausal sleep; one-leg-stand data in Indian women 40 to 60; NICE NG23's CBT wording
  at source. A follow-up search could do these.

---

## 6. My pregnancy (`preg`)

**Fixes from the review, applied here:**
- **Blocker 1:** the Before-you-move screen is split. Part A, "right now" (bleeding, leaking fluid, regular pains before 37
  weeks, severe headache, baby moving less), opens the go-now card. Part B, "has your doctor or ANM told you", sets the tier.
- **Blocker 2:** a loss clears every pregnancy reminder (core step B2 in the main doc).
- "Not felt any movement today" is a 4th answer and means Now.
- Sakhi sets no tablet times; one tick per time she sets.
- In trimester 1 the iron goal gets folic acid and iron food, not an iron tablet row.
- Uncontrolled sugar or thyroid, heart or lung disease, and triplets move to red.
- Risk marks map to tiers in one table; Hb under 7 shows a same-day line.
- The full danger list as pictograms, with ectopic signs under 13 weeks.
- A waters line on every leaks card.
- Qura is not offered for pregnancy topics; the day-3 Qura card is hidden for this pack.
- The safety layer lives in core `preg.js`.
- A nausea routine with no named foods.
- From 24 weeks, a quiet spell first asks "Has anything changed?".
- 181 on the crisis card; the mood question from week 1.
- The kick counter step removed; the verified `pf_goal` dose kept.
- The measure counts only real check-ups and tests.
- Notifications neutral by default.

### Who

Women 18+ who said they're pregnant (with a due date or last period), at any week from 4 to 41. A late joiner lands on her
own week with a 3-day catch-up pack. It never runs after a logged loss or past 42 weeks. One programme for every pregnancy
goal (food, nausea, iron, sleep, mood); the goal changes the emphasis. "Just keep track" gets only the core safety layer.

### Length and phases

To the birth, dated from her due date or last period (her ANM's count wins). A weekly session every week; something new on
the path at least every 2 weeks.

| Weeks | Phase | Focus | New |
|---|---|---|---|
| 4 to 13 | First months | Danger signs; register before 12 weeks; first check-up and free tests; folic acid as advised; food safety; nausea; moving gently; find the pelvic floor | Lesson 1 and the numbers to save; the screen; walking at talk pace (any minutes count); pelvic floor levels 1 to 2; the food-safety habit; the nausea routine on nausea days |
| 14 to 20 | Middle months | Tablets as advised; walking towards about 150 minutes a week; Pregnancy moves after a green screen; second check-up, anomaly scan, PMSMA on the 9th | The tablets add-on; the screen again at week 14; no lying-on-the-back poses; the middle-months routine on 2 days; levels 3 to 4; food habits |
| 21 to 27 | Strong middle | First movements; the sugar test at 24 to 28 weeks; swelling and BP signs; the knack; looking after herself | "Felt your baby move yet?" at 20 and 24; the sugar test due; levels 5 to 6; the knack for 2 weeks |
| 28 to 35 | Last months | Her baby's own pattern, no counting; sleeping on her side; third check-up; JSSK; the birth plan; deciding first-hour breastfeeding with her family | The movements question in every check-in; the screen again at week 28; the last-months routine; levels 7 to 8; the birth plan |
| 36 to birth | Ready for the birth | The bag; the fourth check-up and "when and where to come in"; labour signs; family planning; the first 6 weeks | The ready-for-birth routine; the bag; the 41-week check |

### Daily steps and how they grow

Three rows: (1) body (the screen, a walk, or the routine); (2) the pelvic floor set; (3) food, which becomes "Tablets today"
from her tablet start with the food habit as its sub-line, or the nausea routine on nausea days. The Care card shows one
thing: Due now, this week's "Try this", or the bag. Movements (from 28 weeks), side-sleeping, "How are you in yourself?" and
leaks are check-in and look-back questions, not rows.

| Step | When | Grows | Existing or new |
|---|---|---|---|
| **Due now** (Care card; discreet "A visit is due") | When an item falls due, then days 1 and 4 of each week | Follows her week; done by its own record; a passed window says "ask your ANM at your next visit" | Existing 19-item plan |
| **This week: one action** (Care card) | Weekly | One 10-word action per lesson | New |
| **Before you move** (discreet same) | Start, week 14, week 28, and after any danger tap | Part A "right now" (any yes: the go-now card, moves locked); Part B "told by your doctor or ANM" (red or amber; "not sure" counts as amber). A green screen unlocks the routine; amber needs her doctor's OK, asked on her next ANC card | New, our own words |
| **Walk** (you can talk but not sing) | Daily with 2 rest days | From 10, 15 or 20 minutes; adaptive; floor 10, cap 30 a day and about 150 a week; no step-ups from 36 weeks; "very hot today" moves it to early morning or after sunset | Existing kind, new targets |
| **Pregnancy moves** | Days 2 and 5 | Middle months (1 round, then 2), last months, ready for the birth | New routines |
| **Pelvic floor set** | Daily, tied to a moment she picks | Levels as in section 4, sitting or side-lying from week 13; the verified `pf_goal` ("10 squeezes, 3 times a day") stays the stated goal; 1 set counts as "a good start" | Existing trainer, levels new |
| **Today's food** | Daily | A new habit every 2 weeks by trimester; earlier ones return weekly; by diet and region; fasting versions; with sugar in pregnancy: "the food plan your doctor or dietitian gave you" | New steps |
| **Feeling sick today? 3 minutes** | Nausea days, weeks 4 to 20 | A programme version of `relief-nausea`: fresh air, sips of water, "eat whatever you can keep down", slow breaths; no named foods; the doctor line stays | Existing routine, new version |
| **Tablets today** | From the day she starts (usually week 14) | "Which tablets did your ANM give you, and when do you take them?" One tick per time she sets; Sakhi sets no times. "Day 47 of 180" as a filling bar; tablets-left refill prompts; "Missed a day? Just take today's" | Existing records, new row |
| **How is the tablet suiting you?** | Day 0 card, day 3, day 7, then every 14 days | The shared lesson's lines | New question |
| **Your baby's movements today** (check-in) | Daily from 28 weeks; once at 20 and 24 | As usual / less than usual / not sure / **not felt any movement today**. "Less" and "not sure": the same-day card (even at night). "Not felt any": Now (108, 102 or 112). Never counting. A "Baby moving less?" button lives in core `preg.js` all day | New question; core button |
| **Tonight: settle to sleep on your side** (check-in close) | From 28 weeks | Never counted as missed | New line |
| **How are you in yourself?** (look-back) | Weekly from week 1 | Mostly good / up and down / low most days; "low most days" shows the fixed crisis card | New |
| **Any leaks this week?** (look-back) | Every 4th week from 20 | Every leaks card adds the waters line | New |
| **Collect your Anganwadi food** | Monthly | Fixed | Existing line |
| **Pack 5 things for your bag** | From 32 weeks until packed | 5 items at a time | Existing |
| **Show your family this week's card** | Weekly from 20 (opt-in) | Shown on her screen by default; key cards at 28, 33 and 36 weeks | Existing partner card; new elders cards |

### Weekly lessons (gists)

| Week | Title | Card gists |
|---|---|---|
| Day 1 (and the catch-up pack after 28 weeks) | Your plan, and the signs that don't wait | Check-ups first; the full danger strip (about 8 pictograms); under 13 weeks the ectopic line; save 112, 108, 102 and your ASHA's number |
| 5 to 6 | Register early, and what is free | MCP card; 4 or more check-ups; tablets and Td free; PMSMA on the 9th; JSSK; ask which papers for scheme money |
| 7 to 8 | Your medicines | Don't start or stop on your own; tell your doctor this week if you take tablets for thyroid, fits, BP or sugar; no tobacco or alcohol |
| 8 to 10 | Sickness and tiredness | Common early; eases by 16 to 20 weeks for most; can't keep water down for 24 hours: today |
| 9 to 10 | Your first check-up | The free tests; Td; results on your card; ask "is it fine for me to exercise?" |
| 11 to 12 | Moving in pregnancy | Good for most women; the talk test; no jumping, falls or hot rooms; the stop signs in pictures; "Rest only?" rest and gentle moving both help |
| 13 to 14 | Your pelvic floor | The shared lesson, sitting or on your side |
| 14 to 15 | The red tablet and the white tablet | As your ANM advises (no doses); the shared tablet lesson; iron and calcium at different times, as advised |
| 16 to 18 | Second check-up and the anomaly scan | BP, weight, Hb and urine at every visit; telling the baby's sex is a crime (PCPNDT); PMSMA |
| 19 to 20 | Better food, not double food | A little extra in kitchen measures; myths |
| 21 to 22 | Swelling, headaches and BP | Mild foot swelling is common; sudden face or hand swelling, a bad headache or blurred vision: hospital now |
| 23 to 24 | Your baby's first movements | Usually 16 to 24 weeks; nothing by 24: tell your ANM |
| 24 to 26 | The sugar test | 75 g, 2 hours, no need to fast; if told you have sugar, your doctor or dietitian sets your food |
| 26 to 27 | The knack, and leaks | Squeeze before you lift; leaks are common and you can tell your ANM; a gush or a trickle you can't stop may be your waters: go now |
| 28 | Know your baby's own pattern | No number to reach; less than usual or different: hospital the same day; not felt at all: now; going twice is fine |
| 29 to 30 | Sleep on your side | Left or right; woke on your back? just turn over |
| 30 to 31 | Looking after you | Me, my baby, my people; a kinder thought; ask for one help |
| 31 to 32 | JSSK, your hospital, your birth plan | Free cashless birth; a 24-hour facility that can do a C-section; a companion of your choice |
| 33 to 34 | Feeding from the first hour | Decide with your family now; only breast milk, no ghutti, water, honey or ghee |
| 35 to 36 | The bag and your fourth check-up | Ask when and where to come in labour |
| 37 to 38 | Signs of labour and when to go | The verified go-now list |
| 38 to 39 | After the birth | ASHA days 3, 7, 14, 21, 28, 42; decide family planning now; your plan carries on |
| 40 to 41 | Waiting for your baby | Movements continue into labour; the 41-week check; never past 42 weeks at home |

### Routines and new poses

- **Pregnancy moves, middle months** (about 10 minutes): loosen up, march, sit-to-stand, wall push-ups, heel raises with both
  hands on the wall (or seated ankle pumps; physiotherapist decides), standing pelvic tilt at a wall, cat-cow with a neutral
  back after 28 weeks, side-lying leg lift, butterfly sitting tall, side-lying rest, one pelvic floor set.
- **Last months** (8 to 10 minutes): seated marching, shoulder rolls, slow sit-to-stand, wall push-ups, hands-and-knees
  rocking, pelvic circles at a chair, side-lying leg lift and rest.
- **Ready for the birth** (5 to 6 minutes): long breaths out, hands-and-knees rocking, leaning forward and swaying, sitting
  upright, letting the pelvic floor go, side-lying rest. Never "makes labour easier".
- New poses: `tilt` (standing version), `catcow`, `sideleg`, `sidelie`, `seatmarch`, `allfours`, `pelviccircle`, `leanfwd`,
  the cue overlay.
- `relief-sleep` from 28 weeks says "lie on your side"; `relief-calm` uses the 4-in, 6-out breath, not box holds.
- Stop strip: `stopPreg`. No supine poses after 13 weeks, no tummy-lying, no breath-holding, no jumping, no rising on the
  toes in palm tree, no deep twists, no hot rooms. With sugar treated by insulin or tablets: "shaky, sweaty or confused while
  walking: stop, take something sweet, tell your doctor".

### Food

Pregnancy food by trimester from the shared table (diet, region, pregnancy-caution tags), in kitchen measures. Trimester 1:
food safety, iodised salt, small plain meals, water. Trimester 2: a little extra; dal at 2 meals; greens; a calcium food;
tea an hour away from food and the tablet (the §20 tea wording); the ration. Trimester 3: protein at every meal; smaller,
more frequent meals; water and buttermilk. Never a food said to ease nausea, heartburn or swelling, or to give a fair,
healthy or easy baby or birth. Fasting: the vrat or roza version, with "talk to your doctor or ASHA before fasting".

### Her measure

- **Main:** check-ups and tests done in their window: anc1 to anc4, Td, the anomaly scan, the sugar test and the IFA start
  only (scheme money, the birth plan, the ASHA item and family planning become a checklist outside the measure; scan 1 and
  schemes have "Not for me / my doctor said not needed").
- **Secondary:** tablet days towards 180; active minutes this week vs her first plan week; pelvic floor level and set days;
  lessons seen. Leaks are "what to tell your ANM" and carry into After the birth, not a pregnancy result.
- No weight, BP, sugar or Hb verdicts; the gated pregnancy logs keep their own charts for her doctor.

### Results and what to expect

**Results:** done on time / done late / still to ask, by trimester; tablet days; minutes; pelvic floor level. At the birth a
"Your pregnancy with Sakhi" card goes into After the birth.

**What to expect:** check-ups and danger signs always come first; sickness eases for most by 16 to 20 weeks; most women feel
the baby between 16 and 24 weeks; pelvic floor muscles take about 3 months of regular sets; tablet days from the 4th month
towards at least 180; moving gets slower near the end; after the birth your plan carries on.

### Doctor moments

| When | Urgency | Gist |
|---|---|---|
| Pinned on My plan and every move screen | Now | The pregnancy bank set |
| Start, Part A any yes | Now | The go-now card |
| Start, Part B red | Ask your doctor | Daily life, breathing and pelvic floor only. Red: bleeding checked but coming back; low placenta after 28 weeks; a cervix stitch; baby growing slowly; told BP is high (`r_bp`); twins after 28 weeks or triplets at any week; sugar or thyroid on tablets or insulin not under control; a heart or lung problem a doctor told her about; her own tick that Hb is under 7 (`r_an`, plus "a doctor the same day; ask which higher centre") |
| Start, Part B amber, or "not sure" | Next visit | Easy walking only. Amber: told Hb is low and feels very tired, dizzy or breathless; eating very little; 2 or more losses; an earlier early birth. An earlier C-section alone (`r_cs`) doesn't hold moves |
| Any stop sign during a move | Now or today | The go-now path, or "stop and get checked today"; the screen is asked again |
| Tablets: "I stopped" or vomiting every tablet | This week | Tell your ASHA instead of stopping; ask the ANM to refer you |
| Due items by her week | Routine | The 19-item plan |
| Week 24, "not felt yet" | This week | Tell your ANM |
| From 28 weeks: less / not sure; not felt at all | Today; Now | Same-day check even at night; or go now |
| "Low most days" | This week | The crisis card (14416; 112 now; 181 if unsafe at home); never Qura |
| Weeks 36, 37+, 41, 42 | Routine to Now | When to come in; labour signs; the 41-week check; past 42 weeks go today |
| Week 2; from 24 weeks after 5 quiet days | Routine | "Has anything changed? My baby is born / my pregnancy ended / still pregnant", with no petals until she answers; then "Talk to my ASHA" or the free doctor. No Qura offer from pregnancy triggers |

### Adaptivity

- Everything is worked out from her week, so a reinstall or a late start lands correctly; a joiner at 28+ weeks gets the
  catch-up pack (danger signs and movements; bag and birth plan; first feed and family).
- A danger or stop tap pauses moves for the day and asks the screen again. The "very tired" chip splits: "tired or
  breathless on stairs" gives rest plus "ask for an Hb test this week"; "breathless at rest, chest pain or fainting" opens
  go-now.
- Logged BP, sugar or Hb values never change her steps (CDSCO); only her own ticks do.
- "Where I'm staying now" (husband's home, my mother's home, the city) changes her ASHA, Care near me, foods and which family
  member the cards speak to, without a restart.
- A loss stops everything at once (core). A birth hands over to After the birth, carrying the pelvic floor level, tablet
  days, the feeding decision and the summary card.

### Add-ons

Only the iron tablets add-on (one row, a tick per time she set); `iron.js`'s and `preg.js`'s own tablet rows step aside
while the plan runs. Pelvic floor is built in. Sugar in pregnancy is a branch inside, never its own programme. Other
programmes pause in pregnancy; Getting ready and Stronger blood hand over their data.

### Reuse and new content; reviewers

- **Reuse:** `S.preg.info()`, `S.preg.plan.due()` and the 19 items; the week pages (with doses stripped in programme cards);
  `preg-diet`; the symptom guide's help and worry lines; `preg-mcp`'s risk marks as intake answers; `pregtools` (bag, birth
  plan, birth guide, go-now and when-to-go lists, `k_late`, `k_today`, `k_now`, `k_doppler`); `iron.js`; `relief-nausea`,
  `relief-sleep`, `relief-calm`; the pelvic trainer; the family partner card; My ASHA; the verified pregnancy articles.
- **Core prerequisites:** the "Baby moving less?" button and danger strip in `preg.js` for every pregnant woman in every
  build; the kick tool redesigned without "Stop at 10" (or held back everywhere); `plan.js` line 1339 removed; the day-3 Qura
  card hidden for this pack; neutral pregnancy reminder titles by default.
- **New:** about 4,000 to 4,500 English words (the largest after Midlife, because it runs to 40 weeks); about 9 poses.
- **Reviewers:** an MBBS obstetrician-gynaecologist (every line); a women's-health physiotherapist (every pose and cue);
  Dr. Megha (food, habits, voice); a psychiatrist or psychologist (the crisis card); the lawyer. A teach-back of the danger
  and stop signs with 5 to 8 women. Packets **§26** A (safety), B (steps and routines), C (lessons), in that order.

### Evidence

- WHO 2020: active in pregnancy without contraindications, building to 150 minutes, no lying on the back after the first
  trimester, know the danger signs.
- SOGC/CSEP 2019 absolute and relative contraindications (confirmed by the reviewer's direct fetch: uncontrolled diabetes,
  hypertension or thyroid disease, serious heart or lung disease and high-order multiples are absolute; symptomatic anaemia
  and twins after 28 weeks are relative).
- Antenatal pelvic floor training: late-pregnancy leaks RR 0.38 (moderate) and 3 to 6 months after the birth RR 0.71 (high)
  (Woodley 2020, direct fetch).
- Going to sleep on the back at 28+ weeks: aOR 2.63 for late stillbirth; right and left the same (Cronin 2019, direct
  fetch).
- RCOG GTG 57 (2026): her baby's own pattern, same-day check, no counting (through Sakhi's reviewed article).
- One-way messages alone didn't change feeding; family norms won (Kilkari RCT and qualitative); ImTeCHO; ARMMAN; scheduled
  breastfeeding support (Gavine 2022, corrected).
- Digital diabetes tools help only alongside clinic care (meta-analysis 2022).
- Postpartum depression in India about 22% (Upadhyay 2017, direct fetch).
- NFHS-5: 26.0% take IFA for 180+ days (unverified this round).

### Open questions

- The kick tool: redesign it without the 10, or hold it back in every build?
- Does a green screen alone open Pregnancy moves (recommended), or must she also tick her doctor's OK?
- Walking: hold step-ups from 36 weeks, or let 150 a week stand to the birth?
- Pelvic floor from plan day 1 at any week, or from about 14 to 20 weeks, when most trials began? Physiotherapist.
- When should "Looking after you" start: week 14, 20 or 30? Who reviews the crisis card?
- A goal "Staying active and ready for the birth"?
- Heat guidance for pregnant women (MoHFW heat plans) and Indian prenatal yoga trials weren't checked; a follow-up search.
- Fasting in pregnancy: a reviewed line beyond "talk to your doctor or ASHA"?

---

## 7. After the birth (`post`)

**Fixes from the review, applied here:**
- **Blocker:** a path when a baby dies (core step B2 in the main doc). "My baby has died" stops every baby, feeding, LAM and
  vaccine item, keeps a baby-free recovery check to day 41, the 6-week check, contraception and grief support.
- Sepsis signs and severe belly pain are Now.
- The crisis path uses the reviewed `mo_harm` wording, has a separate home-safety choice (181), and shows psychosis signs in
  week 1 for her and her family. The blues lesson comes on days 3 to 5. The mood page's BAMS call card is removed when
  reached from the programme.
- Newborn danger signs in week 1 and on the ASHA days.
- No dose words on programme screens; one tea line.
- The recovery check's why-line no longer says "spots early".
- Symptom-triggered swaps are offered as choices.
- The readiness tests open Strength only (no running or jumping) and use a rice bag, never the baby.
- The LAM-ends card fires on mixed feeding, work and first foods.
- A BP follow-up step, and an anaemia line on every move screen.
- Wind and stool in the weekly question, and a fistula line.
- A fallback unlock after day 42 for women who skip the 6-week check.
- A new `feedHow` field; the stage stays "post" while the plan runs; a "Baby born?" prompt from 28 weeks.
- The reused lines that break the rules go to §20.

### Who

Any signed-up woman (18+) whose baby was born alive in the last year, any mode of birth, breastfeeding or not. Women on My
pregnancy move across when the birth is logged. A loss or a baby's death switches to care after a loss (core). A new
pregnancy hands over to My pregnancy.

### Length and phases

Dated from the birth (`situation.deliveredOn`), to 1 year. Core 18 weeks; keep going to 6 months; monthly to 1 year. A late
joiner lands on her own week, with a catch-up set first (go-now signs, the 6-week check, contraception, finding the pelvic
floor); her moves and pelvic floor start at level 1 from her own start date.

| Weeks | Phase | Focus | New |
|---|---|---|---|
| 1 to 2 (days 0 to 13) | Heal | Safety and rest; the daily recovery check as her evening form; feeding; gentle movement; finding the pelvic floor; the first ASHA visits | Recovery check (with a "Meals and water today" row); a set during a feed; Gentle recovery "if you feel able"; ASHA-day cards (with the newborn danger card on days 1 to 7); feeding check-ins days 3 and 7; lesson 1; the psychosis signs card; blues on days 3 to 5 |
| 3 to 6 (days 14 to 41) | Settle | The mood thread at its busiest; short walks; the knack; contraception; the 6-week check and sugar or BP tests | Walk; knack; "one small thing for me"; weekly leaks question; food habits; contraception card (from day 21); 6-week check card (from day 35) |
| 7 to 12 | Back to strong: start | Opens on "6-week check done", "My doctor said I can exercise", or after day 42 "I feel ready to start gently" (bleeding no heavier with activity, stitches or wound not hurting on walking) | Core and posture; walks towards about 120 minutes over 4+ days; levels 3 and 4; belly-gap card (week 8); lifting scenes; "Is my body ready?" (week 12) |
| 13 to 18 | Back to strong: build | Strength at home after the readiness tests; the 3-month card; going back to work | Strength; the 3-month card; the work lesson (week 16, with a LAM-ends card); her keep-going plan (week 18) |
| 19 to 26 | Keep going to 6 months | Only breast milk; tablet days as advised; periods returning; LAM ending; first foods | Periods and spacing; first foods; LAM-ends card; a second keep-going plan |
| 27 to 52 | Her first year | Monthly sessions; ASHA visits at 6, 9 and 12 months; mood at any time; 24 months before the next baby; yearly tests if needed | Monthly lessons; her year look-back |

### Daily steps and how they grow

Weeks 1 to 6: [recovery check, with the food row] [a pelvic floor set during a feed, or Gentle recovery on its days] [the
day's dated item, or the walk from week 2]. Weeks 7 to 26: [pelvic floor set and knack] [move: core on days 1, 3, 5; strength
on days 2 and 5 from week 13; a walk on other days] [food habit or the dated item]. The iron tablet takes a slot on its days,
with food as its sub-line.

| Step | When | Grows | Existing or new |
|---|---|---|---|
| **Today's recovery check** (her evening form to day 41; discreet "Today's check") | Daily to day 41 | Why-line: "A short daily look at how you are, with the signs that mean act now." After day 14 a short form (danger chips first, then "anything new?"). Closing card on day 41 | Existing check; new row and form |
| **One set during a feed** | Daily when comfortable | Levels from section 4 (lying or sitting to day 42); her level carries from pregnancy; sets anchored to brushing or naps if not breastfeeding | Existing trainer |
| **Gentle recovery** (5 minutes) | Days 1, 3, 5 | Rises a little every 2 weeks; C-section version until her doctor's OK (breathing, ankle pumps, the pelvic floor, rolling to sit up, a short walk) | New routine (obstetrician to agree) |
| **Walk, then walk with the baby** | Days 2, 4, 6 in weeks 2 to 6; most days from week 7 | 5 to 15 minutes, then adaptive (floor 5, cap 30, aim 120 over 4+ days) | Existing step, new rule |
| **Food** | Daily (inside the recovery check to day 41) | Water at every feed; dal, egg or paneer at 2 meals; green leaves; a fruit; milk or curd (ragi or til if no milk); jaapa foods as food beside a full plate | New cards (diet audit §17) |
| **Your ASHA may visit today: ask her about...** | Days 1 (home birth), 3, 7, 14, 21, 28, 42 (from day 7 after a C-section), then 6, 9, 12 months | Each day one thing to ask; days 3 and 7 "ask her to check the baby" with the newborn danger card | Existing text, new prompts |
| **How is feeding going?** | Days 3, 7, 14, 28, 42, 91, 152 | Changes by day; not breastfeeding: only the day-3 breast-fullness card, plus "feeding other milk? ask your ASHA or doctor how to make it safely" | New questions, existing answers |
| **Ask someone to take one night stretch** | Weekly, weeks 1 to 8 | "After a feed; wake her when the baby is hungry; no water, ghutti or bottle." "No one right now" shows the help line and "your ASHA can help" | Existing lines, new step |
| **Today's tablet, as advised** | Her plan's rhythm | "Day {n}" with no dose or duration words; the shared tablet cards | Existing tracker |
| **Choose your method before sex starts again** | Days 21 to 42; again on mixed feeding, at the work lesson, at first foods, at 6 months, or her first logged period | "I already have a method (Copper-T after the birth, operation, other)" closes it | Existing |
| **Your own 6-week check** | Days 35 to 56 until "I went" | One-tap reminder; "I went" plus "My doctor said I can exercise" unlocks core | Existing list |
| **Your sugar test at 6 weeks** | Only if she said she had sugar in pregnancy | Then yearly after the plan ends | Existing line |
| **Your BP check** | Only if she had high BP or BP tablets in pregnancy | The first week, the 6-week check, then yearly; "140/90 or more: see a doctor" (obstetrician wording) | New |
| **One small thing for me** | Weekly | Me, my baby, my people | New |
| **How are you feeling today?** (check-in) | 3 days a week in weeks 7 to 8, then 2, then monthly (the recovery check covers days 0 to 41) | Okay / low / worried / "Need help now?" (the crisis sheet) | Existing options, new placement |
| **Core and posture** | Days 1, 3, 5 from week 7 | Lying, side-lying, hands and knees, standing; no sit-ups, crunches or planks | New routine |
| **Is my body ready for more?** | Once from week 12, before Strength | Walk 30 minutes; one leg 10 seconds at a wall; 10 sit-to-stands; lift a rice bag of about the baby's weight from the floor 10 times; carry a half bucket 20 steps; 10 heel raises. Any leak, heaviness, pain or bleeding: stay at this level 2 weeks. Opens Strength only | New |
| **Strength at home** | Days 2 and 5 from week 13 | Chair squats holding a rice bag (never the baby) | Existing routine |
| **Leaks this week** (look-back) | Weekly from week 3, then less often | Never / sometimes / most days; when; "Can you hold in wind and potty?"; heaviness yes/no | New |
| **My keep-going plan** | Weeks 18 and 26 | 2 steps, when and where, a reward | New |

### Weekly lessons (gists)

| Week | Title | Card gists |
|---|---|---|
| 1 | The first days: what's normal, and when to go now | Bleeding changes colour; the go-now pictograms including sepsis and the newborn danger list; rest and gentle movement both help healing |
| 1 (days 3 to 5) | Baby blues, and when it's more | Crying and worry in the first 2 weeks are common; low most days for more than 2 weeks: talk to someone this week; the psychosis signs for her family (family-safe) |
| 2 | Your pelvic floor | The shared lesson; the knack |
| 4 | Only breast milk: what families may say | No water, ghutti, honey, gripe water or tea for 6 months; respectful answers; show your family |
| 5 | Sleep in short pieces | Broken sleep is normal; one longer stretch with help |
| 6 | Your 6-week check, and choosing a method | What to ask for; you can get pregnant before your first period; 2 years before the next baby |
| 7 | Back to strong | Move on by how your body feels; the stop signs; after a C-section the inside heals more slowly; nothing heavier than the baby at first |
| 8 | Your belly gap | A gap is common and can last months; doming or a bulge, pain, or back pain that doesn't settle: a doctor or physiotherapist; still bleeding at 8 weeks and not a period: a doctor (replaces "usually closes by 8 weeks") |
| 9 to 10 | Lifting and carrying | Knees bent, squeeze, breathe out; share heavy loads |
| 10 | Food while feeding | A full plate and water; jaapa foods as food; no special food makes more milk |
| 11 | Your tablets and tiredness | As advised; the shared tablet lesson; very tired or breathless: a free Hb test |
| 12 | Is your body ready for more? | The 6 tests as pictures; running, jumping and skipping are outside this plan: ask a physiotherapist or doctor first |
| 13 | Three months: your pelvic floor | Still leaking, heavy, or can't control wind or potty: a doctor or physiotherapist, the free government doctor first; squeezes hurt or sex is painful: relax first and tell your doctor (links to the intimate pages, not the period-pain plan) |
| 16 | Going back to work | Leave and nursing breaks; expressing and storing milk; LAM no longer protects if feeds are mixed |
| 20 | Periods, and the next baby | Periods can come back any time; LAM's 3 conditions; 2 years before the next baby |
| 24 | Six months | First foods; the tablet course ends as advised; your keep-going plan |
| 30 to 48 (monthly) | Your first year | Mood (14416 free); strength and pelvic floor; your yearly check |
| 52 | Your year | Your own numbers, before and since |

### Routines and new poses

- **Gentle recovery (new, 5 minutes):** belly breathing lying on the side or with knees bent; a pelvic floor squeeze and
  full let-go; ankle pumps; pelvic tilt; knee fall-outs; heel slides; roll to the side to sit up; walk around the house. New
  poses: `sidelie`, `tilt`, `kneefall`, `heelslide`, `ankle`, `rollside`.
- **Core and posture (new, 8 minutes):** pelvic tilt, heel slides, side-lying leg lifts, bridge, cat-cow on hands and knees,
  one arm reach, back to the wall with a gentle squeeze, sit-to-stand holding the rice bag. New poses: `sideleg`, `allfours`,
  `catcow`, `armreach`, the bundle prop.
- **Walk with the baby** (`walkbaby`), **Strength at home**, **Calm breath**, `relief-sleep`.
- Stop strip: `stopPost`, plus `anaemiaMove` and "Told your BP is high, or on BP medicines? Ask your doctor before more than
  gentle walks", on every move screen.

### Food

`food: breastfeeding`, from the diet audit's breastfeeding cards and shared foods table, by region and diet, in kitchen
measures. Never cut water, fruit or vegetables; no food said to make more milk, heal stitches or "clean the womb"; no BMI
verdict or weight target while breastfeeding; herbal powders and kadhas: ask your doctor. "Fasting today" swaps the version
and adds "fasting while breastfeeding: talk to your doctor".

### Her measure

- **Main:** leaks this week (never / sometimes / most days), when, wind and potty control, and heaviness, from week 3.
- **Secondary:** active days and minutes; pelvic floor days and level; recovery checks done to day 41; the 6-week check;
  tablet days; feeding check-ins answered. Low-mood days are not a result (they would frame the plan as treating mood); the
  fixed "talk to someone" line sits by the mood question for everyone.
- **Not used:** the mood page's two Whooley-style questions are not linked from the programme (the mood reviewer and lawyer
  decide whether they stay on the page).

### Results and what to expect

**Results:** leaks weeks 3 to 4 vs the last 2; active days weeks 7 to 8 vs the last 2; pelvic floor days and level; checks
done; tablet days. At week 18 petals give way to her own results.

**What to expect:** bleeding lessens and changes colour in 2 weeks; by about 6 weeks it has usually stopped; the pelvic
floor takes about 3 months of most days; a belly gap is common and can last months; strength comes back over months; after
a C-section the inside heals more slowly than the scar looks; sleep comes in short pieces; she can get pregnant before her
period returns.

### Doctor moments

| When | Urgency | Gist |
|---|---|---|
| Start and any day | Now | `postBleed`, `pregHeadVision` (also after the birth), `faint`, `calf` with breathlessness, `feverIll` (sepsis), `severeBelly`, `newbornDanger` |
| Any day: thoughts of harming herself or her baby; someone at home hurts or scares her | Now | The crisis sheet (14416 or 112; 181 or 112) |
| Any day: strange talk, hearing voices, not sleeping at all (family card, default-visible in week 1) | Now | Don't leave her alone; 112 or hospital today |
| Days 0 to 41: a single tapped sign in the recovery check | Today | Each sign's own fixed line, free under JSSK, without naming an infection |
| `cantPee`, overflow, `fistula` | Today; this week | Fistula overrides "wait 3 months" |
| Week 3, repeated at weeks 6, 12, 26, 40, the same for everyone | This week | `lowMood`: an MBBS doctor, her ASHA or ANM, or Tele-MANAS 14416 |
| ASHA days | Routine | What to ask her |
| Days 35 to 56 | Routine | The 6-week check |
| Sugar test, BP check (from her own pregnancy answers) | Routine | As above |
| Week 8, the same for everyone | This week | Doming, a bulge, pain; bleeding at 8 weeks that isn't a period |
| Week 12, printed for everyone | Routine | The readiness tests' line |
| Week 13, the same for everyone | This week | The 3-month pelvic floor card |
| Weeks 2 and 7, and quiet spells | Routine | "Want someone to call you?": her ASHA, the free government doctor; Qura only for habits, with the topic "A call about my plan"; never for mood |

### Adaptivity

- A danger tap pauses moves that day. Heavier bleeding or more wound pain after activity: Sakhi offers Gentle recovery and
  holds the walk target for 3 days. Leaks or heaviness keep the readiness tests closed and offer the full pelvic floor
  course as the pf step's content.
- C-section branch: ASHA cards from day 7; the C-section version of Gentle recovery until her doctor's OK; core also needs
  "my wound doesn't hurt when I walk"; no date promised.
- Not breastfeeding: sets anchored to other moments, LAM hidden, "fertility can return within 4 to 6 weeks", no judgement.
- Her period returns: LAM no longer protects; the Hb line if bleeding is heavy.
- Hot days are her tap ("Hot today?"), not weather data. Fasting and festivals as in the shared rules.
- The stage stays "post" while the plan runs, even after a logged period. "Where I'm staying now" changes the care team and
  family audience.
- Her goal (recovery, pelvic, feed, mood, sleep, weight) orders the steps and lessons; "weight" never brings a target while
  breastfeeding.

### Add-ons

The iron tablet (default suggestion, 180 days) or, for leaks or heaviness, the full pelvic floor course as the pf step's
content. Baby vaccines, contraception reminders, medicines and schemes stay beside the programme, not inside it.

### Reuse and new content; reviewers

- **Reuse:** `post.js` (recovery check, danger list, normal-bleeding strip, urgent box, mood page lines, feeding guides,
  contraception and LAM, the pelvic trainer, ASHA days, the six list and reminder, JSSK); `iron.js`; `plan.js` routines and
  poses; `relief-calm`, `relief-sleep`; the diet audit's breastfeeding cards; `loss.js`.
- **Rewrite in §20:** `post.js` 335 and 344; `tp_potty` and `iron.js`'s constipation tip (no foods); `pf_p`, `tp_leak` and
  `ppd_p` ("may help", no "most women"); `fl_mast`, `fl_smell`, `fl_fever` ("needs a doctor today" without naming the
  infection); `meds_1` and the `iron.js` post plan's duration words for programme screens.
- **Prerequisites:** `situation.feedHow`; the `stageNow` rule; the "Baby born?" prompt from 28 weeks (in `app.js`, today
  shown only after the due date); "My baby has died"; pelvic levels.
- **New:** about 3,000 English words; about 14 poses or pairs (4 shared with pregnancy); about 10 picture cards.
- **Reviewers:** an MBBS obstetrician-gynaecologist (packet A, the C-section branch, sugar and BP lines, contraception, the
  WHO vs Canada pelvic floor framing, gentle moves from week 1); a pelvic-health physiotherapist; Dr. Megha (food, habits,
  lessons); a psychiatrist or psychologist (mood lines, crisis path); the lawyer. A teach-back with about 5 new mothers
  recruited through an ASHA. Packet: **§27**.

### Evidence

- Canada 2025: at least 120 minutes over 4+ days in the first year; light activity early, moving on once healed and when
  bleeding doesn't increase; daily pelvic floor training; bed rest has known adverse effects; medical clearance not needed
  (Davenport 2025; numbers to re-check, as the reviewer couldn't re-fetch it).
- WHO 2022: routine postnatal pelvic floor training for prevention not recommended (very low certainty); inform every woman
  (corrected).
- Return to running: phases by week; no impact before 3 months; load tests (Goom 2019, expert consensus).
- After a C-section, fascia regains only part of its strength by 6 weeks (Ceydeli 2005, via Goom; never told to every
  mother).
- A belly gap in about 60% at 6 weeks and a third at 12 months (Sperstad 2016).
- HBNC visit days (corrected: 5 visits from day 7 after a C-section).
- Sets tied to feeds kept 74% going (Kale 2021, no control group).
- Mamma Mia: a small effect busiest in weeks 2 to 8 (corrected); India pooled postpartum depression 22% (Upadhyay 2017,
  direct fetch).
- The LIVING trial: a postpartum lifestyle programme did not slow worsening sugar (corrected), so the step is the test.

### Open questions

- Obstetrician: gentle moves from week 1 after a vaginal birth (recommended), or all moves after the 6-week check except
  pelvic floor and breathing?
- What unlocks core after a C-section, and what lifting line replaces "nothing heavier than the baby"?
- Pelvic floor framing: a light daily set for everyone plus the full course for women who leak (recommended)?
- Activity target: Canada's 120 minutes (recommended) or WHO's 150?
- Core 18 weeks, keep going to 6 months, monthly to a year (recommended), or end at 6 months?
- Physiotherapist: the 6 readiness tests; a function-only belly-gap check?
- Is the day-3 "who can hold the baby?" question and the "where I'm staying" switch for now or later?
- Does the not-breastfeeding path need its own reviewed lessons on other milk?
- The Anganwadi ration line for breastfeeding mothers: check at source.
- WHO 2022's mental-health and activity wording, Indian confinement-practice studies, and postpartum anaemia prevalence:
  a follow-up search.

---

## 8. Getting ready for a baby (`ttc`)

**Fixes from the review, applied here:**
- **Blocker:** after a loss the programme stops in `packOf` and the folic acid record ends with its reminder removed. It
  restarts only on her tap, through `loss-again`, and after methotrexate or a molar pregnancy only after "my doctor says I
  can try again".
- Medicines and long-term conditions move to weeks 1 to 2.
- A tick for the groups who usually need a different folic acid tablet opens a "see your doctor first" card.
- Weekly IFA and daily folic acid are kept apart, in a separate record with neutral reminder titles.
- In tester and release builds, her months of trying are her own tap and are never computed.
- The Hb step no longer depends on the held-back lab tool.
- Severe anaemia symptoms get a card.
- The ectopic line is complete and shown in context, never behind the PIN.
- Day 1 has 3 steps only.
- The folic acid tick waits for a decision.
- 181 on the crisis card.
- Evidence re-graded.
- The hand-off is a card she taps.
- "Baby basics" is one step.
- A spacing card within 24 months of a birth.

### Who

Women 18+ at the trying stage who pick "Getting ready for a baby", whether planning or already trying. Versions from her own
answers:
- **Standard.**
- **Doctor-first:** she ticks PMOS or very irregular periods, endometriosis, fibroids found on a scan, a past pelvic
  infection or TB, tube or womb surgery, a partner's known issue, or 2 or more losses; or she's 40+; or she has been trying
  12+ months (6+ at 35 to 39). It runs alongside her doctor's care.
- **35 to 39:** the 6-month mark.
- **PMOS:** the doctor-first card, with the cycle plan's routines in the move slot.

Not offered while pregnant, after a loss until she chooses it, or in the first 42 days after a birth. Within 24 months of a
birth, the spacing card comes first. At the trying stage every goal runs Getting ready: PMOS or irregular get the PMOS
version, painful periods get the period-kit add-on, and weight gets the standard version with the steady-weight lesson
earlier. This changes today's mapping, which sends PMOS at the trying stage to the cycle plan (open question).

### Length and phases

A 12-week core, then monthly until a pregnancy or her doctor month (12 months of trying under 35, 6 at 35 to 39, at the
start at 40+). Pregnancy often comes fast, so the time-critical steps are in the first fortnight, and an early pregnancy
counts as success.

| Weeks | Phase | Focus | New |
|---|---|---|---|
| 1 to 2 | First things first | Folic acid as advised; the free Hb test; medicines and long-term conditions; the red flags; the first ready check; an ASHA or ANM visit | Day 1: folic acid get-or-tick, the walk, one food habit. Day 2: the Hb step. Days 3 to 7: the ready check. Day 8: the checklist link. The medicines card; lesson 1; the week-2 offer |
| 3 to 6 | Both of you, and the tests | His part (if she chose it); the bigger-hospital tests; moving most days; fertile days without stress | Week 3: dal or chana daily; week 4: the tests card (rubella: wait 1 month after the vaccine); week 5: fruit, and the fertile-days lesson; week 6: ready check 2 and the universal doctor card |
| 7 to 12 | Steady, strong and calm | Strength twice a week; sleep; the monthly wait; family pressure; steady weight | Week 7: tea gap, Strength (Gentle start instead within 6 months of a birth); week 8: the waiting-week step (opt-in); week 9: milk or curd; week 10: bed time; week 11: half the plate sabzi and "what elders may say"; week 12: ready check 3, results, her plan, and "when the test is positive" |
| 13 onwards | Keep going | Folic acid continues; one lesson, look-back and ready check a month; a fresh start on her period day | Monthly lessons; her doctor month card |
| Hand-off | On to My pregnancy, or stop after a loss | A positive test shows a card she taps | Carries only the folic acid row (to 12 weeks), her Hb result and her walking level; routines end with "Ask your doctor or ANM before yoga or strength in pregnancy"; at week 13 `iron.js` shows its pregnancy set-up card |

### Daily steps and how they grow

| Step | When | Grows | Existing or new |
|---|---|---|---|
| **My folic acid tablet, as my ASHA advised** (discreet "My tablet") | Daily or her rhythm | If "not yet": a link, "Get your tablet: ask your ASHA or ANM". Then a tick; day-0, day-3 and day-7 cards with folic-specific tips (folic acid alone rarely upsets the stomach); from week 3 "tablet days so far". Kept in a separate folic acid record with its own neutral reminder, never counted as weekly IFA days | New record on `iron.js`; waits for decision 12 (fallback: a weekly link) |
| **Get your Hb test, free** | Day 2, then weekly to week 2 | Done on "Done" or the anaemia page's "Add an Hb result"; never shown beside a table of cut-offs | New step |
| **Walk or move 15 minutes** | Daily with 2 rest days | Adaptive from her answer; capped at 150 moderate minutes, never vigorous; routines count; bed time on rest days in weeks 9 to 12 | Existing, new rule |
| **A food habit** | Daily | A new one every 2 weeks: greens; dal, chana or cooked sprouts; a fruit; tea an hour away (a gap, never "stop tea"); milk or curd; half the plate sabzi. Vrat and Jain versions; underweight: "add a katori" | New habits |
| **Your before-pregnancy checklist** (discreet "This week's list") | Weekly from day 8 | 17 items (13 for her, 4 for him); with "Not for me" for his part, only her 13 count | Existing |
| **His part this week** (hidden in discreet mode) | Weeks 2, 4, 6, 8, 10, if she chose it | A card she shows; the reused copy text is her choice; never sent by Sakhi | Existing wording |
| **My 1-minute ready check** | Days 3 to 7, week 6, week 12, then monthly | 6 picture questions, then and now; its folic acid item fills from her tablet days | New |
| **A calm few minutes** | The 7 days before her likely period (or her "I'm waiting to know" tap, which is the default until her range exists), weeks 8+, opt-in | Calm breath plus one coping card a day; `{help:crisis}` on every card | Existing routine, new cards |
| **Note the day your period started** | When it comes | A fresh-start card, no failure words | Existing log |
| **Period late? When and how to test** | The day after her likely range ends, or 21 days after sex if irregular | With the ectopic line | Existing |

### Weekly lessons (gists)

| Week | Title | Card gists |
|---|---|---|
| 1 | The first month counts (Rekha and Amit's story) | Folic acid before pregnancy, as your ASHA or doctor advises; the free Hb test; the ectopic line (late period or positive test with one-sided pain, shoulder-tip pain, bleeding or brown discharge with pain, pain on passing urine or stool, dizziness or fainting: 112) |
| 1 to 2 | Your medicines and conditions | Medicines for fits, BP, sugar, thyroid, acne or skin: see the doctor who prescribed them before trying; don't stop on your own; PMOS, thyroid, sugar and BP steady first |
| 2 | It's for both of you | A reason sits with the man in about 4 to 5 of 10 slow couples; his test is simple and early; his habits count from now |
| 3 | Food that gets your body ready | Everyday food; tea an hour away; no food, herb, powder or ritual can promise a baby or choose a boy or girl |
| 4 | Tests, and where they're free | AAM, PHC, the bigger government hospital; rubella: avoid pregnancy for 1 month after the vaccine |
| 5 | Fertile days, without the stress | The egg's day moves month to month; sex every 2 to 3 days works as well as timing it; there is no safe day; when your periods are regular, Sakhi can show a range of days |
| 6 | How long it usually takes | More than 8 in 10 couples within a year when the woman is under 40; when to see a doctor |
| 7 | Moving, and weight, gently | Moving most days is enough; very thin or quite heavy can both stop eggs; steady changes, no crash diets |
| 8 | The waiting week | Hope and worry are normal; a kinder thought; Tele-MANAS |
| 9 | Steady first | With PMOS, see a gynaecologist when you start trying; after the injection (Antara), periods and pregnancy can take some months to return |
| 10 | Sleep, and pressure from others | A short answer to "When is the good news?"; one "together" plan; if anyone hurts, threatens or blames you: 181 |
| 11 | What elders may say | "It's always the woman": doctors check both partners; "ordinary daily work is fine; rest when you're tired" (no claim about pregnancy); no honest person can promise a pregnancy; clinics must be registered |
| 12 | Your plan, and when the test is positive | The 2 steps that helped; keep folic acid to 12 weeks; see your ASHA or PHC within days. The story never announces a pregnancy |
| 13+ monthly | Tests doctors do; IVF clinics and the law; his test again; when to see a doctor | |

A second story voice (a woman whose husband works away) carries the partner weeks.

### Routines

Gentle start, Cycle care yoga (in the 14 days before her likely period, Bhujangasana and Vakrasana are swapped for Gentle
start, physiotherapist to confirm), Strength at home from week 7 (Gentle start instead within 6 months of a birth), Calm
breath. No new poses.

### Food

`food: folate-iron`, six habits from the shared table by region and diet, household measures, no claims. Underweight: add-food
versions, never weight-loss lines. Overweight: steady habits only; never "lose weight before trying" or "delay the doctor
for weight". The iron kadhai stays a tip.

### Her measure

- **Main:** the 1-minute ready check in our own words: greens or vegetables; fruit; folic acid as advised; tobacco, gutkha or
  alcohol; moving 30 minutes or active work most days; his part. Then and now, per item, never a score. "Just for me" behind
  the PIN in discreet mode.
- **Secondary:** checklist done; folic acid tablet days; active minutes; months of trying only where `ttc-trying` shows (in
  full-tools builds); an optional monthly "How was the waiting this month?".
- Pregnancy is never a result or a measure.

### Results and what to expect

**Results:** ready check week 1 vs latest; checklist; tablet days; minutes; weeks followed. Week 12 never says it "didn't
work".

**What to expect:** this fortnight, your tablet and your Hb test; by week 4, most of your checklist; his changes count from
now; more than 8 in 10 couples within a year when the woman is under 40; if it hasn't happened by your doctor month, a check
helps; nothing here can promise a pregnancy.

### Doctor moments

| When | Urgency | Gist |
|---|---|---|
| Late period card, positive-test tap, `pregtest`, a one-sided pain tap while late; always on Help | Now | `lateOneSided`, in neutral discreet words, never behind the PIN |
| A positive test, then heavy bleeding, clots or severe cramps | Now | The reviewed loss-article line |
| Start, every woman | Routine | "Before you start trying: a check for folic acid, the tests and your medicines. Free at the PHC or AAM, or eSanjeevani" |
| Start, daily medicines, diabetes, a past baby with a spine or brain problem, sickle cell or thalassaemia (new intake tick) | Soon | "See your doctor before you start trying: your medicines may need changing, and some women need a different folic acid tablet." No doses |
| Start, the doctor-first answers | Soon | "See a gynaecologist now; no need to wait 12 months." The government infertility OPD or eSanjeevani first; the Qura call labelled "for support and food and habits; your fertility check is with a gynaecologist" |
| Days 2 to 14 | Routine | The Hb test; if your Hb is low, go back for treatment before trying |
| Any, her tap | Today | Breathless at rest or on light work, a racing heart, fainting, swollen feet or face |
| Any, her tap | By the bank | `feverPain`, `afterSex`, `afterProcedure` (after a tube test or procedure); on ovulation tablets or injections from her doctor, a swollen painful belly, vomiting or breathlessness (Now); never ovulation tablets on a chemist's or relative's advice; `unsafeHome` (181); `harm`; his sudden severe testicle pain (Now); a testicle lump (soon) |
| Rh negative | Routine | "Find out your partner's group; your doctor plans the anti-D injection" |
| Weeks 6 and 12, then monthly, the same for everyone | Routine | When to see a doctor: 12 months under 35, 6 at 35 to 39, at the start at 40+, sooner with irregular periods or PMOS, earlier whenever worried |
| Two negative tests and no period | Soon | See a doctor |
| 2 or more losses | Soon | `ttc-loss2` first |
| Within 24 months of a birth | Routine | The spacing card; "Was it a caesarean? Ask your doctor how long to wait" |

### Adaptivity

- Day 1 to 3 budget as above.
- A fresh start is offered on her period day after a quiet spell; the programme is never ended for absence.
- Fertile days are never required; the fertile link shows only where the fertile view is allowed.
- A positive test shows the hand-off card; a loss stops everything at once (core).
- A "Fasting today" tap swaps the food step; night shift uses the shift bed step.
- Once she does a step on most days for 3 weeks, its reminder gets less frequent.

### Add-ons

The iron tablet with retest (when her doctor gives a course for low Hb), with folic acid folded into that row as advised, or
light optional pelvic floor sets. Its own add-on elsewhere, "Baby basics", is one step: the folic acid row. The checklist and
"For him" sit in the care-team row.

### Reuse and new content; reviewers

- **Reuse:** `ttc.js` (checklist, flags, `tryingState`, the ectopic and BAMS lines, the partner page, tests page,
  `ttc-loss2`, the signs page); the 8 verified conceive articles; `app.js` fertile and range functions and the late card;
  the plan's routines and habits; `iron.js`; `cond-anaemia`'s Hb entry; `pregtest`; `loss.js`; My ASHA; Free doctor and care.
- **Fixes in existing text:** "Fibroids, found on a scan by a doctor" in FLAGS; the `DOCTOR_MODS` line sends only "Getting
  ready: week n; folic acid days x"; the hand-off topic is neutral.
- **New:** about 1,550 English words; 12 to 15 simple card drawings; no poses.
- **Reviewers:** Dr. Megha (food, habits, lessons); an MBBS gynaecologist (packet A, folic acid and IFA wording, the hand-off,
  the loss stop, Rh, PMOS, the elders card); a psychiatrist or psychologist (waiting-week cards); the lawyer (no-promise
  lines, ART Act, Magic Remedies Act). Packet: **§28**.

### Evidence

- Folic acid before conception to 12 weeks (WHO, through Sakhi's reviewed articles); neural tube defects about 4.5 per 1,000
  births in India (Allagh 2015).
- AMB: switch to folic acid when planning, continue to 12 weeks; ANMs give it at VHNDs; family cards.
- Pregnancy often comes fast: 38% in cycle 1, 81% by cycle 6 in a German cohort (Gnoth 2003, direct fetch; for design only).
- Screen first, coach the gaps: diet risk β 0.75 (van Dijk 2020, corrected; no pregnancy effect shown).
- Pooled preconception lifestyle trials: no effect on pregnancy or live birth; 10+ sessions an exploratory subgroup (Torkel
  2026, confirmed by the reviewer).
- MMNP's food effect only when started 90+ days before conception, per-protocol (the reviewer found the intention-to-treat
  result null).
- WINGS: preconception Hb gains faded unless continued in pregnancy (confirmed by the reviewer).
- Lifestyle programmes before fertility treatment didn't improve births (Mutsaerts 2016; Legro 2022; direct fetch).
- Vigorous activity linked to lower fecundability in lean women (Wise 2012, observational, direct fetch).
- The waiting-week coping card rests on one IVF feasibility study (Lancastle and Boivin 2008, direct fetch); the later RCT
  wasn't verified.

### Open questions

- Folic acid as a coached tick (decision 12)?
- Should every goal at the trying stage run Getting ready, changing today's PMOS mapping (recommended), or keep the cycle
  plan for PMOS with a folic acid add-on?
- Keep the waiting-week step at all, or only the week-8 lesson?
- Keep going until her doctor month, or open-ended?
- May her months-trying count sit beside the fixed card in release builds? Lawyer.
- May the "For him" cards name the semen test in read-aloud mode, or only behind the PIN?
- Should a positive test move her on automatically? Recommended: a card she taps.
- The spacing and caesarean lines are new wording for the gynaecologist.
- Hindi neutral words and the elders answers: test with 5 to 8 women recruited through an ASHA.

---

## C. Full source list

Verified or corrected in the research round unless marked "(direct fetch)" (checked by ID in the design round) or
"(unverified)".

**Period pain, endometriosis, PMS, heavy bleeding**
- Blödt 2018: https://pubmed.ncbi.nlm.nih.gov/29155036/ ; Blödt 2013 protocol: https://pmc.ncbi.nlm.nih.gov/articles/PMC3821547/
- Yu 2025 acupressure meta-analysis: https://pubmed.ncbi.nlm.nih.gov/41138782/
- Tsai 2024: https://pubmed.ncbi.nlm.nih.gov/38816591/ ; Xiang 2025: https://pubmed.ncbi.nlm.nih.gov/40078380/ ; Zheng 2024: https://pubmed.ncbi.nlm.nih.gov/39550537/
- Kannan 2019: https://pubmed.ncbi.nlm.nih.gov/31071464/ ; ACOG CO 760: https://pubmed.ncbi.nlm.nih.gov/30461690/
- Erol 2025: https://pubmed.ncbi.nlm.nih.gov/40868570/ ; Inkaya and Coban 2026: https://pubmed.ncbi.nlm.nih.gov/42169005/ ; Armour 2019 (PLoS One): https://pubmed.ncbi.nlm.nih.gov/31339951/
- Wang 2020 (Luna): https://pmc.ncbi.nlm.nih.gov/articles/PMC7055820/ ; Rakhshaee 2011: https://pubmed.ncbi.nlm.nih.gov/21514190/
- McNulty 2020: https://pubmed.ncbi.nlm.nih.gov/32661839/ ; Colenso-Semple 2023: https://pubmed.ncbi.nlm.nih.gov/37033884/
- Ensari 2022: https://pubmed.ncbi.nlm.nih.gov/35851021/ ; Hansen 2023: https://pubmed.ncbi.nlm.nih.gov/36797461/
- Rohloff 2024: https://pmc.ncbi.nlm.nih.gov/articles/PMC11417970/ ; Kronthaler 2026: https://pubmed.ncbi.nlm.nih.gov/41712923/
- ESHRE 2022 (direct fetch): https://pmc.ncbi.nlm.nih.gov/articles/PMC8951218/ ; Jo and Lee 2018 (direct fetch): https://pmc.ncbi.nlm.nih.gov/articles/PMC6214933/
- Weise 2019: https://pubmed.ncbi.nlm.nih.gov/30783069/ ; Kues 2014 protocol: https://pmc.ncbi.nlm.nih.gov/articles/PMC4265499/
- Borji-Navan 2022: https://pubmed.ncbi.nlm.nih.gov/34996424/ ; Mazaheri Asadi 2022: https://pubmed.ncbi.nlm.nih.gov/35782413/
- C-PASS (Eisenlohr-Moul 2017): https://pubmed.ncbi.nlm.nih.gov/27523500/ ; Eisenlohr-Moul 2022: https://pubmed.ncbi.nlm.nih.gov/35303811/
- Apsey 2024: https://pubmed.ncbi.nlm.nih.gov/39718601/ ; Li 2026: https://pubmed.ncbi.nlm.nih.gov/41507956/ ; Dutta and Sharma 2021 (direct fetch): https://pubmed.ncbi.nlm.nih.gov/34195039/
- da Silva Filho 2021: https://pubmed.ncbi.nlm.nih.gov/34047657/ ; Munro 2023: https://pubmed.ncbi.nlm.nih.gov/37538011/
- Shea 2023: https://pubmed.ncbi.nlm.nih.gov/37041503/ ; Carere 2026: https://pubmed.ncbi.nlm.nih.gov/42274078/
- Trépanier 2023: https://pubmed.ncbi.nlm.nih.gov/36761398/ ; Seo and Seo 2025: https://pmc.ncbi.nlm.nih.gov/articles/PMC12245543/
- Lee and Kim 2019: https://pubmed.ncbi.nlm.nih.gov/30946478/ ; Karthika 2026: https://pubmed.ncbi.nlm.nih.gov/42257129/
- BSG 2021 (direct fetch): https://pmc.ncbi.nlm.nih.gov/articles/PMC8515119/

**Pelvic floor and return to exercise after a birth**
- Hou 2022: https://pmc.ncbi.nlm.nih.gov/articles/PMC9531466/ ; Wadensten 2021: https://pmc.ncbi.nlm.nih.gov/articles/PMC8056293
- Harper 2023: https://pmc.ncbi.nlm.nih.gov/articles/PMC10722367 ; Bø principles: https://thepogp.co.uk/_userfiles/pages/files/bok_1.pdf
- Nepal ICS 2025: https://www.ics.org/2025/abstract/70 ; Ben Ami and Dar 2018: https://cris.haifa.ac.il/en/publications/what-is-the-most-effective-verbal-instruction-for-correctly-contr/
- OPAL: https://doaj.org/article/71bcbaee15514d91a248764759f1d928 ; Miller 2020: https://pmc.ncbi.nlm.nih.gov/articles/PMC7583334
- NICE QS77: https://www.nice.org.uk/guidance/QS77/chapter/quality-statement-5-bladder-training
- PREVPROL: https://evidence.nihr.ac.uk/alert/pelvic-floor-exercises-may-reduce-need-for-further-treatments-for-pelvic-organ-prolapse
- POPPY (direct fetch of the abstract): https://pubmed.ncbi.nlm.nih.gov/24290404/ ; Dumoulin 2018 (direct fetch): https://pubmed.ncbi.nlm.nih.gov/30288727/
- Woodley 2020 (direct fetch): https://pubmed.ncbi.nlm.nih.gov/32378735/
- WHO 2022 PFMT: https://bigg-rec.bvsalud.org/en/recommendations/7b3c277db171edac6338e7e165a3af9261e1ca22
- Goom 2019: https://athleticsni.org/download/files/Returning_to_running_postnatal_guideline_for_medical_health_and_fitness_professionals_managing_this_population.05.pdf
- Davenport 2025: https://www.casem-acmse.org/wp-content/uploads/2025/04/515.full_.pdf ; belly gap review 2025: https://pmc.ncbi.nlm.nih.gov/articles/PMC12151038/
- GROUP: https://pedro.org.au/english/group-based-pelvic-floor-muscle-training-is-not-inferior-to-individual-training-for-urinary-incontinence-in-older-women/
- Mishra 2020: https://doaj.org/article/46a0ec709222439ba9ebfc6b7b4464fb ; Kale ICS 2021: https://www.ics.org/2021/abstract/508
- Squeezy instructions for use (public page, principle only): https://squeezyapp.com/instructions-for-use/ ; Caagbay 2017: https://jnhrc.com.np/index.php/jnhrc/article/view/3900
- Rygh 2021: https://pubmed.ncbi.nlm.nih.gov/33397664/

**Midlife**
- NAMS 2023: https://depts.washington.edu/mbwc/content/page-files/NAMS_2023-nonhormone-therapy-position-statement_(1)22.pdf
- Indian Menopause Society 2026: https://pmc.ncbi.nlm.nih.gov/articles/PMC12948155/
- MENOS@Work: https://nottingham-repository.worktribe.com/output/930688 ; Norton 2014 summary: https://beckinstitute.org/blog/cognitive-behavior-therapy-for-menopausal-symptoms-hot-flushes-and-night-sweats-moderators-and-mediators-of-treatment-effects/
- Stefanopoulou and Hunter 2014: https://www.imsociety.org/2013/12/09/cognitive-behavior-therapy-and-hot-flushes/
- Drake and Kalmbach 2019 trial: https://clinicaltrials.gov/study/NCT01933295 ; McCurry 2016: https://pmc.ncbi.nlm.nih.gov/articles/PMC4935624
- RACGP BBTI: https://www.racgp.org.au/clinical-resources/clinical-guidelines/handi/a-z/b/brief-behavioural-therapy-insomnia-in-adults ; CompRest: https://clinicaltrials.gov/study/NCT02743338
- Consensus Sleep Diary: https://pmc.ncbi.nlm.nih.gov/articles/PMC3250369/
- Strong, Steady and Straight: https://blogs.bmj.com/bjsm/2023/10/30/steady-and-straight-uk-consensus-statement-on-physical-activity-and-exercise-for-osteoporosis/
- LIFTMOR: https://academic.oup.com/jbmr/article-abstract/33/2/211/7605709 ; Berin 2019: https://pubmed.ncbi.nlm.nih.gov/31239119/
- Hypnosis app study: https://pmc.ncbi.nlm.nih.gov/articles/PMC11757980 ; Duffecy 2025: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12187029/
- SWAN (Avis 2015): https://pmc.ncbi.nlm.nih.gov/articles/4433164 ; Lancet 2024 empowerment model (KCL summary): https://www.kcl.ac.uk/news/overmedicalisation-of-menopause
- StandingTall: https://researchnow.flinders.edu.au/en/publications/e-health-standingtall-balance-exercise-for-fall-prevention-in-old/
- Osteoporosis and incontinence (news): https://www.continence.org.au/news/study-encouraging-women-osteoporosis-and-incontinence
- ESHRE/ASRM/IMS POI guideline 2024 (direct fetch): Human Reproduction Open 2024, hoae065

**Pregnancy**
- Kilkari RCT: https://pmc.ncbi.nlm.nih.gov/articles/PMC9288869/ ; mMitra: https://pmc.ncbi.nlm.nih.gov/articles/PMC6823296
- ImTeCHO: https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1002939
- ARMMAN: https://research.google/blog/using-ml-to-boost-engagement-with-a-maternal-and-child-health-program-in-india/ ; https://arxiv.org/abs/2109.08075
- WHO 2020 physical activity: https://bjsm.bmj.com/content/54/24/1451
- Canadian pregnancy guideline 2019: https://www.gov.nl.ca/tcar/files/Canadian-Guideline-for-Physical-Activity-Throughout-Pregnancy.pdf ; CSEP (reviewer's direct fetch): https://csepguidelines.ca/guidelines/pregnancy
- ACOG CO 804 (Lamaze summary): https://lamaze.org/Giving-Birth-with-Confidence/GBWC-Post/exercise-during-pregnancy-postpartum-advice-from-experts-at-acog
- Digital tools for diabetes in pregnancy: https://pmc.ncbi.nlm.nih.gov/articles/PMC9931335/ ; LIVING (report): https://www.hcplive.com/view/lifestyle-intervention-glycemic-deterioration-women-gdm
- NFHS-5 fact sheet (unverified this round): https://dhsprogram.com/pubs/pdf/OF43/India_National_Fact_Sheet.pdf
- Nagpur iron call trial: https://pmc.ncbi.nlm.nih.gov/articles/PMC9588298/
- Gavine 2022: https://discovery.dundee.ac.uk/ws/files/85620705/Gavine_et_al_2022_Cochrane_Database_of_Systematic_Reviews.pdf
- Patel 2018 (Nagpur breastfeeding): https://bmcpediatr.biomedcentral.com/articles/10.1186/s12887-018-1308-3
- Thinking Healthy (Vietnam): https://pmc.ncbi.nlm.nih.gov/articles/PMC4032350/ ; Mamma Mia: https://pmc.ncbi.nlm.nih.gov/articles/PMC6650775/
- Miura 2023: https://pmc.ncbi.nlm.nih.gov/articles/PMC10265566/ ; MomConnect: https://pmc.ncbi.nlm.nih.gov/articles/PMC5922474
- Brown 2019 (pregnancy apps' nutrition): https://pmc.ncbi.nlm.nih.gov/articles/PMC7650606
- HBNC (unreachable): https://hbnc-hbyc.mohfw.gov.in/about/hbnc
- Upadhyay 2017 (direct fetch): https://pmc.ncbi.nlm.nih.gov/articles/PMC5689195/ ; Cronin 2019 (direct fetch): EClinicalMedicine 2019;10:49

**Getting ready and anaemia**
- Smarter Pregnancy: https://repub.eur.nl/pub/127234 ; Torkel 2026: https://pmc.ncbi.nlm.nih.gov/articles/PMC12766448/
- MMNP: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4196482/ ; WINGS: https://pmc.ncbi.nlm.nih.gov/articles/PMC9597398
- AMB training toolkit: https://nhm.hp.gov.in/storage/app/media/uploaded-files/English_Anemia%20Mukt%20Bharat%20Training%20Modules%20Folder_Lowress.pdf
- AMB 2026 (secondary summary): https://www.drishtiias.com/daily-updates/daily-news-analysis/anemia-mukt-bharat-abhiyaan-operational-guidelines
- Allagh 2015: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4358993/
- Ghosh and Sachdev 2025: https://www.stjohns.in/publications/anaemia-and-iron-deficiency-in-india-a-venous-blood-based-survey-of-adolescents-adults-and-the-elderly-in-eight-states
- STAR (news): https://thesouthfirst.com/health/when-iron-pills-reached-every-doorstep-in-telangana-why-did-two-thirds-refuse-to-take-them
- Shao 2024: https://www.frontiersin.org/journals/medicine/articles/10.3389/fmed.2024.1375622/full ; Sharma 2023: https://pmc.ncbi.nlm.nih.gov/articles/PMC10509657/
- CSBC: https://csbc.org.in/projects/Improving-uptake-of-iron-and-folic-acid-supplementation-among-pregnant-women.php ; Soepnel 2022: https://pmc.ncbi.nlm.nih.gov/articles/PMC9437786/
- Ahmad Fuzi 2017: https://pubmed.ncbi.nlm.nih.gov/29046302/ ; Li 2020: https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2772395
- Iron cookware review: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6719866/ ; Stoffel 2020: https://pubmed.ncbi.nlm.nih.gov/31413088/
- Ko 2021: https://www.hkmj.org/system/files/hkmj208743.pdf ; Magnay 2020: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7011238/
- ECLIPSE qualitative study: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9997654/
- Gnoth 2003 (direct fetch): https://pubmed.ncbi.nlm.nih.gov/12923157/ ; Lancastle and Boivin 2008 (direct fetch): https://pubmed.ncbi.nlm.nih.gov/18628259/
- Mutsaerts 2016 (direct fetch): https://pubmed.ncbi.nlm.nih.gov/27192672/ ; Legro 2022 (direct fetch): https://pubmed.ncbi.nlm.nih.gov/35041662/
- Wise 2012 (direct fetch): https://pubmed.ncbi.nlm.nih.gov/22425198/ ; Tiplady 2013 (direct fetch): https://pubmed.ncbi.nlm.nih.gov/23081872/

**Design science**
- Mair 2023: https://pmc.ncbi.nlm.nih.gov/articles/PMC10498822/ ; Greaves 2011: https://pubmed.ncbi.nlm.nih.gov/21333011/
- Adams 2017: https://pubmed.ncbi.nlm.nih.gov/28356097/ ; Sharif and Shu 2019: https://anderson-review.ucla.edu/wp-content/uploads/2021/03/Sharif-Shu_EmergencyReserveFailure_OBHDP2019.pdf
- Milkman 2021: https://www.nature.com/articles/s41586-021-04128-4 ; Buyalskaya 2023: https://pmc.ncbi.nlm.nih.gov/articles/PMC10151500
- CMS DPP 2026: https://www.cms.gov/files/document/mln34893002-medicare-diabetes-prevention-program-expanded-model.pdf ; Middleton 2012: https://pubmed.ncbi.nlm.nih.gov/22212682/
- Meyerowitz-Katz 2020: https://www.jmir.org/2020/9/e20283 ; Kelders 2012: https://pubmed.ncbi.nlm.nih.gov/23151820/ ; Donkin 2013: https://pubmed.ncbi.nlm.nih.gov/24135213/
- Karyotaki 2021: https://pubmed.ncbi.nlm.nih.gov/33471111/ ; Klasnja 2019: https://pubmed.ncbi.nlm.nih.gov/30192907/ ; Patel 2021: https://pubmed.ncbi.nlm.nih.gov/33624440/
- Mazeas 2022: https://pubmed.ncbi.nlm.nih.gov/34982715/ ; Guo 2014: https://www.cs.rochester.edu/hci/pubs/pdfs/edX-MOOC-video-production-and-engagement_LAS-2014.pdf
- Ames 2019: https://pubmed.ncbi.nlm.nih.gov/31608981/ ; Rygh 2021: https://pubmed.ncbi.nlm.nih.gov/33397664/ ; McNulty 2020 (above)

**Designing for Indian women**
- Meppelink 2015: https://www.jmir.org/2015/1/e11/ ; Schubbe 2020: https://pubmed.ncbi.nlm.nih.gov/32466864/ ; Medhi 2011: https://www.microsoft.com/en-us/research/publication/designing-mobile-interfaces-for-novice-and-low-literacy-users/
- NFHS-6 note: https://indiainatlanta.gov.in/public_files/assets/pdf/NFHS_6_Note_for_International_Media_13062026v2.pdf
- Scott 2021 (phone use): https://pmc.ncbi.nlm.nih.gov/articles/PMC8461288/ ; Scott 2021 (family norms): https://pmc.ncbi.nlm.nih.gov/articles/PMC8327813/
- Mohan 2022: https://pmc.ncbi.nlm.nih.gov/articles/PMC9366343/ ; Mate 2022: https://arxiv.org/abs/2109.08075 ; Ward 2020: https://pubmed.ncbi.nlm.nih.gov/33425329/
- CHARM: https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0153190 ; Sambasivan 2018: https://www.usenix.org/conference/soups2018/presentation/sambasivan
- Tripathy 2010: https://pubmed.ncbi.nlm.nih.gov/20207411/ ; Glazier 2018: https://pubmed.ncbi.nlm.nih.gov/30359228/
- Murthy 2020 (mMitra): https://pmc.ncbi.nlm.nih.gov/articles/PMC7268375/ ; ARMMAN report 2026: https://armman.org/wp-content/uploads/2026/06/Q4-2025-2026-Impact-Report.pdf
- KPMG and Google 2017 (unchecked): https://assets.kpmg.com/content/dam/kpmg/in/pdf/2017/04/Indian-languages-Defining-Indias-Internet.pdf
- Android Go app size: https://developer.android.com/guide/topics/androidgo/optimize-size
- WHO 2019 digital guideline (recommendation wording unverified): https://www.who.int/publications/i/item/9789241550505

**Safety, regulation, governance**
- CDSCO 2026: https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/Guidance-document-on-Medical-Device-Software-under-MDR-2017.pdf
- FDA general wellness 2026: https://www.fda.gov/media/90652/download ; FDA device software functions 2022: https://www.fda.gov/media/80958/download
- NICE ESF (Unsworth 2021): https://pmc.ncbi.nlm.nih.gov/articles/PMC8236783/ ; MHRA intended purpose: https://www.gov.uk/government/publications/crafting-an-intended-purpose-in-the-context-of-software-as-a-medical-device-samd/crafting-an-intended-purpose-in-the-context-of-software-as-a-medical-device-samd
- NHS exercise in pregnancy: https://www.nhs.uk/pregnancy/keeping-well/exercise/ ; PIF TICK: https://pifonline.org.uk/pif-tick/
- Semigran 2015: https://pmc.ncbi.nlm.nih.gov/articles/PMC4496786/ ; Martinengo 2019: https://pmc.ncbi.nlm.nih.gov/articles/PMC6921471/
- PAR-Q+ terms: https://eparmedx.com/terms-and-conditions/ ; Labrique 2020: https://pmc.ncbi.nlm.nih.gov/articles/PMC7501250/
- DPDP Rules 2025: https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf
- Drugs and Magic Remedies Act (secondary summary): https://en.wikipedia.org/wiki/Drugs_and_Magic_Remedies_(Objectionable_Advertisements)_Act,_1954
