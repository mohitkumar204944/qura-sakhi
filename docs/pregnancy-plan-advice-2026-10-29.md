# My pregnancy: how the custom plan differs and how it is personalised (advice, 29 Oct 2026)

Mohit, 29 Oct: "next is I am pregnant custom plan can you advise how it will differ from existing two plans how it will be
personalised". Advice only, nothing built. It starts from the researched design in
`docs/plans-design-and-build-2026-10-24-programmes.md`, section 6 ("My pregnancy"), and brings it up to the rules set since:
doctor first (Version 39.28 and 39.29), the minimalist baseline (CLAUDE.md, Version 39.27), and what Getting ready
(Version 39.32) taught.

## 1. The short answer

The two plans built so far help her change habits over 12 weeks towards a goal she chose. My pregnancy follows her pregnancy
week by week until the birth. Her doctor's care plan is its backbone, and safety comes before every step. So it is
personalised mainly by her week, by what her doctor told her and by where she gets care, not by a version chosen once at
the start.

Today's pregnancy plan (`web/progs/v1.js`, `preg` version 1) is a light habit plan with 2 steps. The first is "Due now",
from the 19-item check-up plan. The second is chosen by her goal: the food habit by trimester, the nausea, sleep or calm
routine, or the iron tablet. It has no lessons, no moves, no safety screen and no check-in questions of its own. The new
plan would be `preg` version 2; women on version 1 keep it unless they choose the new one ("Your plan has changed",
Version 39.5).

## 2. How it differs from the two plans built so far

| | My PMOS plan (`cycle`) | Getting ready for a baby (`ttc` v2) | My pregnancy (`preg` v2, proposed) |
|---|---|---|---|
| Purpose | Habits that help her cycle and PMOS signs | Ready and healthy before a pregnancy | A safe pregnancy: check-ups on time, tablets as her doctor said, the danger signs known, moving safely, ready for the birth |
| Clock | 12 weeks, then monthly | 12 weeks, then monthly until her doctor month | Her pregnancy week (4 to 41), to the birth; a late joiner lands on her own week |
| Phases | Weeks 1 to 4, 5 to 12, after | Weeks 1 to 2, 3 to 6, 7 to 12, after | First months (4 to 13), middle (14 to 20), strong middle (21 to 27), last months (28 to 35), ready for the birth (36 on) |
| Set up by | Her goal, food, BMI, activity and limits | "A few things first": 4 versions (standard, gynaecologist first, medicines first, both) and a food set | Her week, a 2-part safety screen (right now; told by her doctor), where she gets care, her goal |
| Daily steps | Yoga, walk, a food habit, bedtime (4) | Her tablet, a move, a food habit, a 4th when one is due | A walk or pregnancy moves; the pelvic floor set (from about week 13); food or tablets as one row. At most 3; "Due now" lives in the one Sakhi says card |
| Tablets | None | Folic acid daily, 9 pm | Iron and calcium as her doctor prescribed (every day, every other day or weekly), at her times; folic acid carries on from Getting ready to 12 weeks |
| Moving | PMOS yoga, walking 150 (250 with her doctor's OK) | Moderate only, gentler before her period, strength from week 7 | Walking at talk pace (any minutes count, about 150 a week); pregnancy moves only after a green screen; nothing on the back after 13 weeks; stop strips; heat advice |
| Evening check-in | Done, partly, not today; bedtime | The same | The same, plus from 28 weeks "your baby's movements today" (never counting) and "settle to sleep on your side"; weekly "How are you in yourself?"; leaks every 4th week from 20 |
| Lessons | No weekly lessons | 12 weekly, then monthly | One a week or two by her week (about 20 short), built from the week pages; folded once read |
| Doctor | Qura doctor for habits, gynaecologist for PMOS | Her version's doctor card; doctor month | Her own doctor (or ANM) runs the plan through the check-up list; no Qura offer for pregnancy topics; danger signs to 112, 108 or 102 the same day |
| Results | Gaps, signs, minutes | Tablet days, checklist, minutes; never pregnancy | Check-ups done on time by trimester, tablet days towards 180, minutes, pelvic floor level. Never a weight, BP, sugar or Hb verdict |
| It ends | After 12 weeks it carries on | A positive test moves her to My pregnancy ("Yes, move me on") | The birth moves her to After the birth (pelvic floor level, tablet days and her feeding decision carry over). A loss stops everything at once, gently |

## 3. How it is personalised: what she tells Sakhi, and what changes

| What Sakhi knows | Where it comes from | What it changes |
|---|---|---|
| Her week | Due date or last period, already in her diary (her doctor's count wins) | The phase, the lesson, the Due now items, which moves are open, the food habit, the check-in questions |
| Right now: bleeding, fluid leaking, regular pains before 37 weeks, a bad headache or blurred vision, the baby moving less | The safety screen, part A (start, weeks 14 and 28, after any danger tap) | Any yes: the go-now card, and no moves today |
| Told by her doctor: high BP, sugar on tablets or insulin, a low placenta after 28 weeks, a stitch, the baby growing slowly, twins, Hb under 7, a heart or lung problem, 2 or more losses, an early birth before | The safety screen, part B; her MCP card marks if she filled them | Green: the full plan. Amber (or "not sure"): easy walking, and "ask at your next visit". Red: daily life, breathing and the pelvic floor only. An earlier C-section alone holds nothing |
| Where she gets care | Joining's "Where do you usually go?" (Version 39.28) | "Your doctor" by default. The ASHA, ANM, PMSMA on the 9th, JSSK, Anganwadi food and schemes only for a woman who picks government care |
| Her goal: food, nausea, iron, sleep or mood | Joining, or My plan | Which row leads, and the emphasis: the nausea routine on nausea days, Wind down, calm |
| Her tablets | "What did your doctor give you, and when do you take it?" | The tablet row at her times; "Day 47 of 180"; refill prompts; "Missed a day? Just take today's". Sakhi sets no dose or time |
| Food: diet, region, milk, fasting | My food (already asked) | Trimester food habits in kitchen measures, with a fasting version; with sugar in pregnancy, "the food plan your doctor or dietitian gave you" |
| How active she is, knees or back, a standing or heavy job, the heat | "Your day" (2 questions, as Getting ready asks) | Where the walk starts (10, 15 or 20 minutes), the moves' version, early morning or after sunset on hot days |
| First pregnancy or not; an earlier C-section, loss or early birth | Her MCP card and the safety screen | The lessons' emphasis and the tier |
| Age 35 or over, twins | Her birth year; the safety screen | The tier and a few lesson lines (twins: amber after 28 weeks) |
| Where she is staying now | One tap on My plan (her husband's home, her mother's home, another town) | Her care places, foods, and which family card speaks to whom, without a restart |
| A shared phone | Discreet mode | Neutral titles and reminders; private steps hidden; pregnancy pages behind her PIN |
| From Getting ready | Her plan's records | Her folic acid days, her Hb test, her checklist, her medicine and diabetes ticks ("tell your doctor this week"), her BMI. Nothing is asked again |

## 4. The minimalist baseline, applied

- **Day 1:** at most 3 rows (a walk or the nausea routine; food or tablets; the pelvic floor set from about week 13).
  "Due now" or this week's one action is the one Sakhi says card.
- **One new screen before her first step:** the safety screen. The reason is safety. It reuses her MCP card's marks and
  joining's answers, and "not sure" is fine.
- **Her evening:** the check-in after her last step; her tablets at her own times (a medicine rings at its own time); the
  walk nudge; a neutral "A visit is due" on the day a check-up falls due (the reason: check-ups are the plan's backbone).
  Pregnancy words never reach the lock screen.
- **Read once, then folded:** lessons and how it works fold after week 1. The danger signs never fold: they are always one
  tap away (Help, and a "Baby moving less?" button for every pregnant woman).
- **One home for each fact:** the check-up list stays in Pregnancy plan, the week's facts in This week, the tablet days in
  her iron record. My plan points to them and doesn't copy them.
- **No new tours or celebrations.** A missed day is never a broken streak.

## 5. What it reuses and what is new

- **Reuse:** her week (`S.preg.info()`), the 19-item check-up plan, the week pages, `preg-diet` and trimester food
  (Version 39.9), the symptom guide, the MCP card's risk marks, the bag, birth plan, contraction timer and the pattern-first
  kick tool (`pregtools`), iron tablets as prescribed (`iron.js`, Version 39.28), the nausea, sleep and calm routines in
  Dr. Megha's voice, Wind down, the pelvic floor trainer, the family card, My ASHA, Care near me, and the schemes pages.
- **New:** the safety screen and its tiers; pregnancy moves (3 routines, about 9 new poses, a pregnancy stop strip); the
  weekly lessons; the check-in's movement, side-sleeping, mood and leaks questions; the handover to After the birth; about
  4,000 to 4,500 English words plus Hindi. It is the largest plan so far, because it runs for up to 40 weeks.
- **Reviewers:** an obstetrician (every line); a women's-health physiotherapist (every pose and cue); Dr. Megha (food); a
  psychologist or psychiatrist (the mood question's crisis card); the lawyer. Then a teach-back of the danger and stop signs
  with 5 to 8 women. The safety packet goes first, then steps and routines, then lessons.

## 6. Decisions for Mohit (with recommendations)

1. **Moves after a green screen alone, or also her doctor's OK?** Recommended: green alone opens them. Amber and red wait for
   her doctor.
2. **Pelvic floor from day 1, or from about week 13?** Recommended: from week 13, sitting or side-lying, when most trials
   began. The physiotherapist confirms.
3. **The weekly "How are you in yourself?" from week 1?** Recommended: yes, with the crisis card (Tele-MANAS 14416, 112, 181)
   reviewed before it ships.
4. **A Qura doctor in pregnancy?** Recommended: not offered for pregnancy topics; her own doctor runs her care.
5. **Women already on today's pregnancy plan:** move them to the new plan, or offer it? Recommended: offer it ("Your plan has
   changed"). Version 1 runs on for anyone who doesn't choose it.
6. **Late joiners (28 weeks or more):** a 3-day catch-up pack (danger signs and movements; the bag and birth plan; the first
   feed and family)? Recommended: yes.
7. **Build order:** the safety layer first (the screen, the danger strip, the "Baby moving less?" button, a loss clearing
   every pregnancy reminder), then the plan. Recommended: yes. It is the roadmap's Version 40 for this plan.

## 7. Next step

As with Getting ready: a mockup first (Day 1 Today, the safety screen and its 3 tiers, a week in each phase, the check-in at
30 weeks, My plan, the birth handover), then the doctor's packet, then the build.
