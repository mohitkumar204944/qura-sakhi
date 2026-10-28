# Less to tap, same value: a minimalism and daily-use audit (27 Oct 2026)

Mohit asked (27 Oct): can Sakhi give the same value in fewer steps, the way Apple designs? The goal is a woman who comes
back every day. That means the most value with the least complexity, clutter and tapping. No value lost, and real delight.
He asked for research, an audit and advice, based on the journey videos and the code.

Version checked: 0.39.26-pilot (commit 2571c85).

**Status, 28 Oct:** Phase 1 (R01 to R07) is built as Version 39.27 (MODULE_API section 70, `web/test/minimal.mjs`), with
Mohit's changes: "make reminders by default on no need to ask user and no need for 90 minute gap wherever needed have
reminders". So reminders are on with no question in Sakhi's words, there is no spacing rule or cap, and after week 12 the
reminders carry on with her steps (4 weeks past her last visit, to month 12 at most), with no "keep going" question. Phases
2 to 4 are not built.

## 0. The answer on one page

Sakhi's daily core is already close to Apple-grade:
- logging a period is 1 tap, with Undo;
- a plan step is 1 tap;
- her next period shows with no tap at all;
- danger signs are 2 taps away;
- the words never shame her.

Daily use isn't at risk from missing value. It's at risk from three leaks around that core.

1. **The prompt is broken.**
   - A woman who taps only "Start my plan" gets no reminder at all.
   - One who allows reminders can get 3 in an evening, and the 8 pm one asks about a walk that isn't due until 9:15.
   - On day 85 her steps disappear from Today.
2. **The same thing lives in too many places.**
   - There are 3 ways to note a feeling on one screen.
   - A doctor finding shows on 5 screens.
   - Week 1 brings up to 21 tour steps, and there are two monthly check-ins.
   - Today runs to about 2 screens, and her first plan step costs 44 taps.
3. **Small untruths spend her trust.**
   - Asha is told about "your last 6 gaps" when she has 2.
   - A myth is printed under "Did you know?".
   - The pain plan can't measure pain, and the hot-flush plan can't count hot flushes.

The Apple answer is subtraction with good defaults:
- one prompt, at the right time;
- one screen that answers "where am I, what's my one thing, how do I feel";
- one home for each fact;
- one celebration a day;
- each question asked on the day it changes something;
- the plan carrying on by default.

Nothing that keeps her safe goes. Help stays within 2 taps and gets closer. The diary never leaves the phone. New health
words go to the doctor.

### The 8 biggest changes

| # | Change | Today | After |
|---|---|---|---|
| 1 | Reminders that ring, in the right order (R01, R02) | No reminder unless she spots a small button; up to 3 evening rings, the first one before her walk | One ask, on "Start my plan"; reminders in the order of her evening, at most 2 |
| 2 | Her steps carry on after week 12 (R03) | Steps vanish on day 85 until she opens her results and picks (2–3 taps) | 0 taps: her steps carry on |
| 3 | Every line about her is true; plans measure what they promise (R04, R05) | Pain result "…" after 3 periods; hot-flush result empty at week 12 | Pain filled in by 1 tap on her period's first day; hot flushes by 1 chip |
| 4 | Her free plan never folded away on day 1 (R06) | Open the fold, scroll twice, tap (2 taps + 2 scrolls) | 1 tap, inside the doctor's card |
| 5 | Safety one tap closer (R07) | 112 in 3 taps; an ambulance from the feeding page in 4 steps (copy, open the dialer, paste, call); no Help on the first joining screens | 112 in 2 taps; the ambulance in 1 tap to the dialer; Help on every screen |
| 6 | The 10-second day (R08, R09, R10, R13) | A plan day: about 6 taps and 2 scrolls, a page to leave, up to 3 celebrations | 2–4 taps, no scroll, no page to leave, one celebration |
| 7 | Day 1 through one door; tips at first use (R11, R12) | First plan step after 44 taps, 23 screens and 3 tips; up to 21 tour steps in week 1 | About 31–37 taps, 17–20 screens, 1 tip; at most 1 tip a day |
| 8 | Wind down in one tap at bedtime (R19) | 4 taps and a scroll (3 more if Explore's tour fires) | 1 tap |

**Build order:** Phase 1 (V39.27) is the 7 P0 fixes, each small or medium. The field-test numbers then decide the pace of
the rest (section 8).

**Checked twice.** Two reviewers checked every recommendation against the code, the earlier audits and the sources: one
for value and safety, one for whether it can be built. Their changes are applied. Where they disagreed, the recommendation
says so (summary in Appendix C). "The first draft" below means a recommendation as it stood before that check.

## 1. How we looked

- **The 7 journey videos.** One woman per joining stage, from install to day 90, with captions and each tap shown as a pink
  ring (`web/test/shots/journeys/<stage>.mp4` and `.json`):
  - Priya (regular periods, pain): cycle;
  - Asha (PMOS): pmos;
  - Neha (trying for a baby): ttc;
  - Kavya (pregnant): preg;
  - Sunita (had a baby 2 weeks ago): post;
  - Rekha (periods changing after 40): mid;
  - Lata (menopause): meno.

  "Video cycle 135 s" means that video at 135 seconds. Two cautions:
  - The videos run at machine speed. Real women are much slower.
  - The recorder sometimes taps a hidden button with code (`web/test/journey-video.mjs:156`) or jumps straight to a page
    (`:191`), so a few paths look easier on film than they are.
- **The code.** `app.js`, `mods/*.js`, `progs/v1.js` and MODULE_API sections 39 to 69. Every claim carries a file:line.
- **Measured taps.** A script drove the web app with the 0.39.26-pilot settings and a stand-in for the phone.
  - Four women joined from a fresh install by real taps: Priya, Asha, Neha (7 period dates) and Meena (tracking only).
    Priya also joined once more and said no to the plan.
  - Each then lived days 1 to 10, opening Sakhi at 8:30 am, 8:30 pm and 10:15 pm.
  - We timed 12 everyday jobs at 390 × 844, and the key ones again at 360 × 800 in English and Hindi.
  - Results are in Appendix B; "job n" below points there.
  - The scripts sit in this session's scratch folder, which is wiped on restart. Section 7 asks for them in the repo.
- **Outside research.** Apple's Human Interface Guidelines (2026), Android's notification guidance, and studies on habits,
  reminders, rewards, period tracking, low literacy and shared phones in India. Principle level only: no walkthrough of any
  other app. Sources: Appendix D.

Nothing in the repo was changed except this file.

## 2. What the journeys show

### Where she works too hard, or is let down

1. **Joining is long.** On film she reaches Today at 65 s and her first plan step at 113 s (video cycle 0–112.9 s).
   - The order: language, about her, stage, goal, dates, phone, sign-up, "Your Sakhi", then a 30-second tour (53.8–65.4 s).
   - Then a first log in the Diary (70.3 s), the plan's questions (78.5 s) and 4 plan cards (98.4–112.9 s).
   - By real taps that's 44 taps and 23 screens (job 12), about 13 to 18 minutes for a careful reader.
2. **Her plan is hidden on day 1.** For Priya and Asha the plan offer is folded under "More from Sakhi", behind the doctor
   card. The film doesn't show it, because the recorder taps the hidden button (cycle 79.4–81.4 s, pmos 81.5–84.5 s).
3. **Today is about 2 screens.** The feeling chips and "Sakhi says" sit below the first screen (cycle 113–116 s).
4. **One period tap brings 4 responses:** the "saved" bar, a petal pop, the plan line, then a doctor-call card
   (cycle 132.8–139.0 s).
5. **The check-in ends on a page she has to leave** (cycle 121.6–129.4 s). The finished day card says "Your 1 steps" and
   "TOMORROW · Move 10 minutes today" (cycle 120.5 s).
6. **Wind down isn't on Today.** The film jumps straight to it (cycle 141.2 s).
7. **Week 12 stops the daily loop.**
   - On day 85 "See your results" shows twice.
   - "You followed your plan on 51 of 84 days" sits under "Noted on 0 of 18 days" (cycle 263.5–267.4 s).
   - On day 90 Today has no steps (cycle 283 s).
8. **A myth in bold.** On day 90 the quiz card puts the bath myth under the heading "Did you know?", and the + button covers
   "Myth" (cycle 283 s).
9. **Untrue counts.** Asha has 2 gaps and reads "2 of your last 6 gaps were longer than 35 days" (pmos 54 s).
10. **A petal at a disappointing moment.** Neha, trying for a baby, gets "A petal for today · December flower 7 of 12" just as
    her period arrives (ttc 242.5 s).
11. **A day that can never be finished.** Kavya's pregnancy card says "Due now: Register your pregnancy, and 4 more" and "0 of
    2 done" every day, and a "Day 1 of your plan" card below repeats it (preg 86 s).
12. **Copy, not call.** Sunita's sick-baby card offers "Copy 108" and "Copy 102" (post 130.5 s). Her first article, 14 days
    after the birth, is "Pregnant? Register before 12 weeks" (post 56 s).
13. **Empty results.**
    - Priya's pain result reads "Since you started …" after 3 periods (cycle 268 s).
    - Rekha's hot-flush plan says "Fill in your weekly symptom diary to see this" at month 1 and at week 12 (mid 203.4 s,
      285.6 s).
    - The main button on Rekha's end page is "Do your 12-week check" (mid 288 s).
14. **The wrong buttons for her stage.** Lata, past menopause, gets a pink "Period started" as her first button (meno 53.5 s)
    and "Add a past period" on Cycles (meno 152.4–155.9 s).
15. **Being right passes in silence.** Rekha was told "likely 14–24 Jan". Her period came on 15 Jan, and nothing said so
    (mid 259.3 s, 274.9 s).

### Moments of delight (keep them)

1. **"Period started" in one tap, with Undo** (cycle 132.8 s).
2. **Sakhi notices.** "Your period came after 28 days. Sakhi noted it for your results." (cycle 135 s; Asha's "43 days",
   pmos 279 s).
3. **Day complete**, with her goal line and tomorrow's step (cycle 120.5 s).
4. **"Why?" on every step**, in plain words (cycle 115.5 s).
5. **The joining calendar** shows her gaps as she taps: "4 periods marked · gaps of 29, 29 and 29 days" (ttc 40 s).
6. **"Your Sakhi"** puts the doctor first, with a free plan beside it, and says "An early read… Not a diagnosis" (pmos 54 s).
7. **Wind down in Dr. Megha's voice**, with a sleep timer and "For rest and sleep, not treatment" (cycle 143 s).
8. **"Welcome back. Nothing to catch up: just today."** (cycle 239.5 s).
9. **The pregnancy week page:** her body this week, tablets and vaccines, and "Call 112 now if" on the same page
   (preg 91 s).
10. **Honest results**, with no judging word (cycle 267.4 s).

## 3. The principles we apply

Each principle has its source (Appendix D) and what it means for Sakhi.

1. **Every element earns its place.**
   - **The principle.**
     - Apple's design principles ask for only what's necessary, with secondary actions easy to find (HIG, 2026).
     - Hick's law: more choices slow every decision. Cut too far, though, and a screen turns cryptic.
   - **For Sakhi.**
     - One way in for each job on Today. Today she has 3 ways to note a feeling: the chips, the round "How I feel" button
       and the + menu (`app.js:2738`, `:3093`).
     - One pink action per moment: the chips in the morning, the next step in the day, the check-in in the evening, and
       "Period started" on period days.
2. **Engagement that serves her, stage by stage.**
   - **The principle.**
     - "Effective engagement" means enough use to reach the outcome, not as much use as possible (Yardley 2016;
       Perski 2017).
     - Most people stop using health apps in open use (Eysenbach 2005).
   - **For Sakhi.** Daily use is the right goal for a woman on a plan. Tracking, pregnancy and menopause need a 10-second
     daily touch plus strong weekly and monthly loops. Judge each stage by its own loop, not by raw opens.
3. **Tiny, prompted, tied to a routine.**
   - **The principle.**
     - A behaviour happens when motivation, ability and a prompt meet. Making it easier beats pushing harder (Fogg).
     - Habits form by repetition in a stable setting. The median time is 59–66 days, with a range of 4–335 (Singh 2024).
     - One missed day doesn't matter (Lally 2010: 18–254 days).
   - **For Sakhi.** Steps tied to meals are right (`plan.js:2506-2534`). Week 12 is too early to stop (R03).
4. **Fewer prompts, at the moment she can act.**
   - **The principle.**
     - A daily notification made opening the app in the next hour about 3.5 times more likely, with no fading over 30 days.
       It didn't change how soon people stopped using the app (Bell 2023).
     - More notifications go with more negative feelings (Pielot 2014).
     - Support works best when the person can act on it, and sometimes sending nothing is right (Nahum-Shani 2018).
     - Android: ask for permission in context. Android also shows her how many notifications each app sends.
   - **For Sakhi.** One ask, at Start. The check-in after her last step. Never a pile-up (R01, R02).
5. **Defaults over questions; help in context.**
   - **The principle.**
     - Apple: make onboarding fast and optional, teach by doing, put off non-essential setup, and infer what you can.
     - NN/g: tutorials up front made tasks feel harder; help in context works better.
   - **For Sakhi.** Start the plan from "Your Sakhi", reuse what she already said, and show one tip at first use (R11, R12).
6. **One picture of progress; one short celebration.**
   - **The principle.**
     - Apple keeps the Activity rings the same everywhere and warns against mixing ring styles.
     - A quick, genuine celebration right after the action builds the habit (Fogg). Feedback should be brief (Apple,
       motion).
     - Gamification's effect fades to small by about 14 weeks (Mazeas 2022).
     - People remember the high point and the end (the peak-end rule, NN/g).
   - **For Sakhi.** "Day complete" is the day's one moment, and her results lead with her own change (R13, R16).
7. **Lapses are normal.**
   - **The principle.**
     - Showing a broken streak lowers later use (Silverman and Barasch 2023).
     - Apple lets people pause their rings for up to 90 days.
     - A clean slate helps people come back (Epstein 2015).
   - **For Sakhi.** "Nothing to catch up: just today" is the model. No grey slots for missed days.
8. **Honest predictions are the core value.**
   - **The principle.**
     - Accuracy is central to period trackers. Show ranges, let her say when a prediction was wrong, and remember that the
       end of a period is the entry women forget most (Epstein 2017).
     - 85% of app users (368 of 431) used their app to predict their next period (Hong 2024).
     - A gap between the predicted and the real date causes distress (Levy 2019).
   - **For Sakhi.** Every line about her must be true (R04), and Sakhi should say so when it was right (R20).
9. **Logging in one tap; the app fills in the rest.**
   - **The principle.**
     - Partly automatic tracking lowers the effort and keeps the awareness (Choe 2017).
     - One woman quit a tracker over about 15 minutes of logging a day (Levy 2019).
   - **For Sakhi.** Her pain answer comes with her period tap, and hot flushes are a chip (R05). "Still bleeding?" is one tap
     (R20).
10. **Built for her phone, her reading and her family.**
    - **The principle.**
      - 56 of 90 first-time, low-literacy users couldn't use nested menus, and 48 didn't understand scroll bars. Pictures
        and voice helped (Medhi 2011).
      - Women in South Asia share phones and are watched on them (Sambasivan 2018). About 58% of rural shared-device users
        are women (IAMAI 2024).
      - In the Kilkari trial, 49% of phones were shared, and 65% of women listened to most of the calls they answered.
    - **For Sakhi.** Her main jobs sit on the first screen, with voice and pictures (R08). Every new idea passes the
      shared-phone check.
11. **Warmth without guilt.**
    - **The principle.**
      - Guilt appeals work weakly, and blaming ones work worse still (Peng 2023). Shaming buttons are a dark pattern.
      - Being kind to oneself goes with more healthy behaviour (Sirois 2015).
    - **For Sakhi.** Keep the tone. Never "you missed".

## 4. The 10-second day

A woman on a plan, on a phone at 360 × 800, in English or Hindi.

### The prompt (no tap)

- **Her check-in reminder rings after her last step is due.**
  - Never before the step, and never later than 45 minutes before her bedtime.
  - Today a walk after dinner is nudged at 9:15 pm, but the check-in rings at 8 pm (`plan.js:1946`, `:2508`).
- **At most 2 plan reminders an evening.** With your current defaults, that's the walk nudge and the check-in, which carries
  tonight's Wind down. It's one if decision 2 goes the other way.
- **On a shared phone the words stay neutral**, and nothing shows on the lock screen (`ReminderReceiver.java:58-72`).
- **Once a month:** 9 am the day before her likely dates. Never for a woman trying for a baby.
- **No morning prompt.** Today is there whenever she opens it.

### The glance (0 taps)

Today's first screen answers three questions without a scroll:
- **Where am I?** "Cycle day 12 · next period in about 16 days, likely 22–28 Nov". Or "Week 22 · due around 24 May",
  "14 days since the birth", "Calcium 2 of 3 days this week".
- **How do I feel?** 5 picture chips.
- **What's my one thing?** Her 1 to 4 steps, each with a tick and "Why?", and one pink button.

Urgent cards sit above everything. Help stays in the top bar.

### The doing (1 to 4 taps, about 10 seconds)

- One chip for how she feels.
- One tick for each step she did, including yoga done without the phone.
- The last tick closes the day:
  - "Day complete · a step towards easier periods";
  - the day's petal grows inside the card;
  - "Tomorrow: Gentle start yoga · 9 min".

  No form, and no page to leave.
- If steps are still open after her check-in time: the pink button, then Save. A step she didn't touch counts as "Not
  today".
- On her period's first day: "Period started" (1 tap). On a pain plan, "Pain today?" (1 tap).

### The close (optional, 1 tap)

After her check-in time, a night row appears: "Wind down · Yoga nidra 9 min". One tap plays Dr. Megha's voice.

### The reward: honest, never guilt

- **One celebration a day:** the petal growing in "Day complete".
- **Being noticed:**
  - "Your period came after 28 days" (exists);
  - "Right on time: inside the dates Sakhi showed you" (new, R20).
- **Her own before and since,** in "Your month" and at week 12.
- **No streak to lose.** After a gap: "Nothing to catch up: just today".

### Why she comes back tomorrow

- The one prompt arrives when she can act on it, and "Tomorrow" names her next step.
- The month's flower is nearly full.
- Each period she logs sharpens her dates. The meter says truthfully what her next entries unlock ("2 more periods and Sakhi
  shows what repeats for you").
- The weekly "Sach ya myth?" game.
- After week 12, her steps carry on.

### Other stages

- **Tracking only:** 0 or 1 tap a day (a chip). The month is the loop: the heads-up, a 1-tap "Period started", then "Right on
  time".
- **Trying for a baby:** her next fertile days on Today, when they can show (R15). No petal pop when her period comes.
- **Pregnancy:** the week card plus one habit tick, and her next check-up with "Done".
- **After a birth:** today's bleeding and "No warning signs today", 2 taps. The full danger list stays on the screen.
- **Midlife and menopause:** "Hot flushes" as a chip. Each tap fills her results.
- **Shared phone or discreet mode:** as now. Cycle day only, no fertile line, neutral words.

### What a day costs

| | Today | After |
|---|---|---|
| Note how she feels | 1 scroll + 1 tap (or 3 taps through the round button) | 1 tap, no scroll |
| Evening check-in | 3–4 taps + 1 to leave the page (Neha: 4 taps + 2 scrolls) | 0 when every step is ticked; otherwise 1–2 taps, no page to leave |
| A whole plan day | About 6 taps + 2 scrolls | 2–4 taps, no scroll |
| Wind down at bedtime | 4 taps + 1 scroll | 1 tap |

## 5. Recommendations

**Priority.** P0 fixes a leak in the daily loop, in trust or in safety: build it first. P1 builds the 10-second day and day
1. P2 means fewer places to look.

**Effort** (relative, tests included): S small, M medium, L large.

**"Doctor"** says whether new health words need the doctor's review.

**"Reviewers"** says what the two checks changed, and where they disagreed.

### P0: fix the daily loop and the truth

**R01. Reminders that ring: one ask, on "Start my plan".** *P0 · S · Doctor: no (the line above Start goes to the wording
review).*
- **Change.**
  - **Start turns reminders on.** On Android 13 and newer, the phone's own "Allow" prompt appears at that moment. Android
    10–12 has no prompt, so the line above Start carries the consent.
  - **That line names everything that will ring,** because one switch covers all of it: "Your 8 pm check-in, and a note the
    day before your period. Nothing shows on the lock screen." The period heads-up and the late-period note share the
    switch (`app.js:4731-4735`).
  - **A full-size second button, "Start without reminders",** not a small link.
  - **Start no longer opens the "Ring on time?" alarm sheet** straight after Allow (`app.js:4773`). That sheet comes when she
    sets a pill or medicine reminder, where timing matters (`app.js:4788-4792`).
  - **Fewer asks.**
    - The day-1 sheet "Get a heads-up before your period?" no longer shows to a woman who is offered a plan or who is trying
      for a baby (`app.js:4779`).
    - The setup card's reminder row drops after any answer.
  - **Discreet mode, a shared phone, or no plan:** she keeps today's one ask, the heads-up card's "Remind me" button
    (`app.js:2519-2530`). It now turns reminders on directly.
  - **No period heads-up for a woman trying for a baby.** The card already skips her (`app.js:2514-2518`); the notification
    doesn't (`app.js:4731`).
- **Why.**
  - Today a woman who taps only Start gets no reminder. Start marks both reminder questions as answered
    (`plan.js:2005-2007`), while "Allow reminders" is a small second button (`plan.js:1985`). In the 10-day run, nothing was
    booked for her.
  - Meanwhile she is asked about reminders in up to 5 places, again and again (video cycle 67 s, 106 s, 188 s, 292.5 s).
  - A daily reminder is the strongest trigger in the evidence (Bell 2023). Android and Apple both say: ask once, in context.
- **Value kept.** Every switch stays in Me > Reminders. Titles stay neutral, and the lock-screen view stays hidden.
- **Taps.** Today: no reminder unless she spots the small button, and up to 5 asks. After: 1 ask (Start, then Allow).
- **Delight.** Her reminder just works, at the time she picked.
- **Risks.**
  - Consent must be informed, which is why the line above Start names what will ring.
  - Without the alarm permission (off by default from Android 14), a reminder can ring up to an hour late
    (`app.js:4788-4790`). That's fine for a check-in, which is why the pill and medicines still ask for it.
  - Tests to update: `notify.mjs:136-148`, `firstday.mjs:184`, `firstday-walk.mjs:84`; MODULE_API sections 36 and 40
    (MODULE_API.md:2005-2007).
- **Reviewers.** Both amended it with the same fixes: no chained alarm sheet, an honest line, and the heads-up card's
  button as the one in-card ask.
  - They split on a "your fertile days start tomorrow" heads-up for a woman trying for a baby. The value reviewer would
    allow it, only when fertile days can show, with neutral words and the doctor's review. The build reviewer would defer
    it, as a new kind of notification that needs a shared-phone review.
  - Deferred: decision 1.

**R02. Evening reminders in the order she lives her evening.** *P0 · S–M · Doctor: only if a reminder's words change.*
- **Change (both reviewers agree).**
  1. **The check-in rings after her last step is due.** That's her chosen time, or 45 minutes after her last step's time if
     that is later. Never later than 45 minutes before her bedtime target. The check-in times gain 9:30 and 10 pm; today
     they run 6 to 9 pm (`plan.js:1936`).
  2. **No two plan reminders within 90 minutes, and at most 2 a day.** When two would collide, one reminder carries both
     jobs, as the check-in already carries tonight's session when the wind-down is near (`plan.js:2486`, today 60
     minutes).
  3. **The cap covers only the plan's own 3 reminders** (check-in, move nudge, wind-down). Care reminders are never capped
     or moved: pregnancy and after-birth check-ups, the baby's vaccines, screening dates, her own reminders, the pill, iron
     and medicines.
- **Why.**
  - The defaults measured: 8:00 pm check-in, 9:15 pm walk nudge, wind-down at 10:30 pm (pain plan) or 11 pm (PMOS)
    (`plan.js:1946`, `:2508`, `:2485`).
  - The 8 pm check-in asks about a walk that isn't due until 9:15. Checking in then records the walk as not done and
    silences its cue (`plan.js:2526`).
  - Three rings happen on evenings she ignores the first one. The check-in is skipped once every step is done
    (`plan.js:173`).
  - Sakhi's own sleep research says the check-in should come after her last step
    (`docs/myplan-and-sleep-advice-2026-10-26.md:185`). The 90-minute spacing comes from HeartSteps (`:196`).
  - More notifications go with more negative feelings (Pielot 2014).
- **Value kept.** The walk nudge stays as the walk's cue (Reynolds 2016, cited in Version 39.22). Tonight's session still
  reaches her. Every switch stays.
- **Taps.** Today: up to 3 evening rings, the first before her walk. After: at most 2, in order.
- **Delight.** The reminder arrives just after she has done the thing it asks about.
- **Risks.** `winddown.mjs`, `follow.mjs` and `notify.mjs` change.
- **Reviewers.** They disagreed on the default.
  - The value reviewer would merge all three into one plan reminder by default, and offer the nudge and the wind-down only
    when they help: after 2 days without the walk, or after a "Badly" sleep answer.
  - The build reviewer would keep your 27 Oct defaults (MODULE_API.md:4249-4255) and fix only the order and the spacing.
  - They also split on a new rule, "after 3 unanswered reminders, ask once". The build reviewer would drop it, because the
    "two quiet weeks" ask already exists (`plan.js:2658`). The value reviewer would keep a stricter version. We drop it.
  - This audit builds the agreed part now. The default is decision 2.

**R03. Her steps carry on after week 12.** *P0 · S–M · Doctor: no.*
- **Change.**
  - **From day 85, Today keeps her steps at the same pace.** This uses Version 39.5's carry-on path ("Keep it light",
    `d.keep`).
  - **One row on Today, not folded, until she opens her results:** "Your 12 weeks are done. Your steps carry on · See your
    results", with a visible "Stop".
  - **The second "Your 12 weeks are done" card in "Sakhi says" goes** (`plan.js:2359`).
  - **Her reminder carries on for 4 more weeks only,** to the existing "Month 4: your results" card in week 17
    (MODULE_API.md:2930). One tap there keeps it going to month 12; otherwise the reminder stops and her steps stay.
  - **The reminder's end is set from the start** with the carry-on in mind. Today it is booked to stop on day 84
    (`plan.js:175`), so the phone's alarms would end there even if her steps carried on.
  - **The results page offers "Work on something else" and "Stop my plan"** as choices, not as a gate. Its doctor card stays.
  - **Pregnancy and after-birth plans keep today's behaviour.** The after-birth plan can already carry on to the baby's first
    birthday (`plan.js:148-149`); pregnancy has no carry-on (`progs/v1.js:18`).
- **Why.**
  - On day 85 her steps vanish until she opens the end page and picks "Keep my habits" (`plan.js:2316`, `:654-660`;
    video cycle 283 s).
  - Habits take a median of 59–66 days, often far longer (Singh 2024). Week 12 is the worst moment to make her decide again.
- **Value kept.** The results, her before and since, "Show this page to a doctor", and a choice one tap away. The doctor
  check that is due for a woman trying for a baby is unaffected.
- **Taps.** Today: 2–3 (open, scroll, pick). After: 0.
- **Delight.** "Your 12 weeks are done. Your steps carry on": a graduation, not a dead end.
- **Risks.** Tests to update: `notices.mjs` section 6 (lines 204-216), `results.mjs` section 11, `goals.mjs:300`; MODULE_API
  section 49.
- **Reviewers.** Both amended it. The value reviewer added the 4-week limit on the reminder and the visible Stop, so it never
  rings for 40 weeks she didn't choose. The build reviewer added the reminder-end fix and removed the duplicate card.

**R04. Every line about her is true.** *P0 · S · Doctor: the finding templates (number-only fixes ship first).*
- **Change.**
  1. Findings say "{k} of your last {n} gaps", with her real number (`explain.js:24`, `:29`).
  2. "Needs 6 regular gaps of 21–35 days · you have {n}" counts only gaps of 21 to 35 days (`app.js:1840`).
  3. When her gaps so far fall outside 21–35 days, the notes meter never promises fertile days. Today the check for "too
     few" comes before the check for "irregular" (`app.js:741-743`, `:1948`). The meter promises what will come instead:
     "What repeats for you", and a fuller doctor report.
  4. The ring legend says "Usual range: 21–35 days" (`app.js:2407`). Optionally it shows her own "Your gaps: 38–43 days",
     but never on a shared phone or in discreet mode.
  5. The weekly quiz card's heading becomes "Sach ya myth?" (Hindi "सच या भ्रम?"), instead of "Did you know?" above a myth
     (`joy.js:392`, `:433`; the bath myth, `joy.js:61`).
  6. When a woman trying for a baby logs a period, the petal still counts, silently: no pop-up, no flower animation, as on
     the quiet screens (`app.js:949`). The line about her next fertile days is built once, with R15.
  7. Wording bugs:
     - "Your 1 steps" (`app.js:27`);
     - "TOMORROW · Move 10 minutes today" (`plan.js:2733-2734`);
     - "Earn your first petal." after she has earned it (`joy.js:428`);
     - "Saved. Thank you." under the Save button before she saves (`app.js:4077`);
     - "48 days" and "49 days so far" on one screen (video mid 111–118 s).
  8. Space under the last card, so the + button never covers "Myth", "Not now" or the check-in button (video cycle 283 s).
- **Why.**
  - Honest predictions are why women keep a tracker (Epstein 2017).
  - Asha (pmos 54 s), the day-90 myth (cycle 283 s) and Neha's petal (ttc 242.5 s) each spend trust.
- **Value kept.** Every finding, meter, legend and quiz stays where it is. Only the words become true.
- **Taps.** None change. This is about trust.
- **Delight.** The quiz reads as a game.
- **Risks.** Item 3 changes the order of one check that several cards use. Re-run `insights.mjs`, `whynot.mjs`, `maths.mjs`
  sections 16–18, `diary.mjs` and `cyclefirst.mjs`.
- **Reviewers.** The value reviewer kept her own gaps off a shared phone (item 4) and kept the petal she earned (item 6).
  The build reviewer flagged the re-tests, and that items 6 and R15 need one shared line.

**R05. Each plan measures what it promises.** *P0 · M · Doctor: "Pain today?" and "Days with hot flushes".*
- **Change.**
  - **Pain plan.**
    - On the first 3 days of each period, her plan line on Today asks once: "Pain today?".
    - The answers are the day page's 4 reviewed ones (`app.js:56`): No pain · Mild · Needed a painkiller · Couldn't do my
      day.
    - One tap saves it on that period, and the plan's result reads it (`plan.js:954-963`).
    - If she skips it, the evening check-in asks once.
    - The question replaces the line's "noted for your results" sentence, so a period start doesn't gain a fifth response.
    - Never on a shared phone or in discreet mode. Today the plan line hides only in discreet mode (`plan.js:1758`).
  - **Hot-flush goal** (midlife, menopause).
    - While the goal runs, "Hot flushes" joins her quick chips in place of Bloating, even before her periods stop. Today it
      appears only after they stop (`app.js:1901-1902`).
    - Her result counts days with hot flushes. "Since" comes from the chip; "Before" comes from her joining answer, as
      other results do (`plan.js:1875`).
    - The 12-row weekly grid becomes optional "More detail" (`meno.js:42`).
    - The validated menopause questionnaire stays separate (`meno.js:539-545`).
- **Why.**
  - Priya's pain result is "…" after 3 periods (video cycle 268 s), because a one-tap period log saves no pain.
  - Rekha's result is empty at week 12 (mid 285.6 s). The pay-off is missing for the very thing she joined for.
- **Value kept.** The day page's pain choices, the full weekly grid and the questionnaire all stay. No new symptom.
- **Taps.**
  - Pain: today 3 or more taps, in the few seconds the "Add details" link shows. After: 1 tap.
  - Hot flushes: today a weekly grid of 48 options. After: 1 chip on a day she has them.
- **Delight.** At week 12: "Periods that needed a painkiller: before 3 of 3, since 1 of 3".
- **Risks.**
  - It changes the "one quick set everywhere" rule (MODULE_API section 60) for women with the hot-flush goal.
  - The golden plans and the plan baseline are re-recorded. `results.mjs`, `goals.mjs` and `daynote.mjs` change.
- **Reviewers.** Both made the same fix. The first draft used the plan's own habit answers (`plan.js:2949`) and had no
  "No pain", so a pain-free period, the plan's success, could never be counted.

**R06. Her free plan, never folded away on day 1.** *P0 · S · Doctor: no.*
- **Change.**
  - **When a doctor finding and the plan offer are due together, Today shows them as one card.** The finding and "Ask a
    Qura doctor" come first, then "And meanwhile, a free plan · See my plan". It's the same pair Version 39.25 draws on
    "Your Sakhi" and in the Diary. The separate offer card is hidden.
  - **With no finding,** the offer takes the first place in "Sakhi says".
  - **A test, in English and Hindi at 360 × 800.** On day 1 of a pain join and a PMOS join, the doctor line and "See my plan"
    both show with no fold.
  - **The recorder fails when it taps something inside a closed fold** (`journey-video.mjs:71-76`, `:156`).
- **Why.**
  - "Sakhi says" ranks a month-level finding first and folds everything after the first card (`app.js:2330-2338`,
    `:2465`).
  - So the plan sits folded, 1435 to 1455 pixels down, for Priya and Asha: the women it was built for.
  - This was gap 5 in the first-days audit (`docs/first-days-audit-2026-10-24.md:85-101`; MODULE_API.md:3555), and it has
    come back.
- **Value kept.** The doctor always comes first (Versions 39.0 and 39.25).
- **Taps.** Today: open the fold, scroll twice, tap (2 taps + 2 scrolls). After: 1 tap. A scroll remains until R08 and R09
  move "Sakhi says" up.
- **Delight.** The free plan shows up right where Sakhi explains her dates.
- **Note.** Since Version 39.26, "Your Sakhi" already shows the plan's Start beside the doctor card (video pmos 54 s), so a
  woman who reads that screen has one way in.
- **Reviewers.** Both rejected the first draft's shortcut, marking the offer "first" (`app.js:2335`). It would have put the
  plan above the doctor and folded the finding away.

**R07. Safety one tap closer.** *P0 · S · Doctor: no (same numbers, same reviewed words).*
- **Change.**
  1. **Call buttons on the danger cards.** On the feeding and recovery pages, the cards get "Call 108", "Call 102" and
     "Call 112". Help's SOS sheet already works this way (`app.js:3026`). "Copy" stays as a small second button.
     - A call button opens the dialer with the number filled in. She still presses call, so a mistaken tap is harmless
       (`MainActivity.java:100-104`).
  2. **Help shows from the first joining screen.** Today it shows only once she's in the app (`app.js:998`).
     - During joining it holds the rows that open on top of the screen: "Call 112 now", other helplines, and "Is someone
       hurting you?".
     - Pregnancy loss and "When to see a doctor" join once those pages can open during joining. Today joining draws only
       its own screens (`app.js:1091`).
  3. **Help's first row dials 112:** "Call 112 now", with "Other helplines" under it.
- **Why.**
  - In an emergency, copying a number takes 4 steps (video post 130.5 s; `post.js:504-509`, used at `:580`, `:590`,
    `:710`).
  - Help is missing for the first 6–7 joining screens (video cycle 1.5–35.5 s).
  - 112 takes 3 taps across 2 sheets (job 7b).
- **Value kept.** Every helpline, danger list and Copy button.
- **Taps.** Ambulance from the feeding page: 4 steps → 1 tap to the dialer. 112: 3 → 2. Help during joining: missing → on
  every screen.
- **Delight.** A frightened mother reaches the ambulance in one tap.
- **Risks.** Tests: `joining.mjs:143-146`, `places.mjs`, `protect.mjs`.
- **Reviewers.** The value reviewer kept it as written. The build reviewer found that rows which open a new page can't work
  during joining, so only the sheet rows show then.

### P1: the 10-second day, day 1, and screens that fit her

**R08. Today answers her three questions on the first screen.** *P1 · L (first slice S) · Doctor: only if the
contraception line is shortened.*
- **Change.**
  - **The first slice (both reviewers agree).**
    1. The "How do you feel today?" chips sit directly under the cycle headline, wherever they show: regular periods,
       trying for a baby, menopause. They don't show in discreet mode or for girls under 18.
    2. Where the chips show, the round "How I feel" button goes, because they do the same job. It stays wherever the chips
       don't show: pregnancy, after a birth, discreet mode, under 18 (`app.js:1903-1904`).
    3. The plan card's 4 lines of detail become one: "Plan day 10 · 2 full days this week". The notice line stays (period
       noted, welcome back, calm week), and so does the rest-day offer when there is one (`plan.js:2326-2345`).
    4. Every step and the evening pink button sit above the tab bar at 360 × 800, in English and Hindi. This is the test
       that decides it's done (`daily.mjs`, `cyclefirst.mjs`, `pictures.mjs`).
    5. The full ring and its legend show in week 1 and behind "?". After that, Version 39.23's compact headline.
  - **Held for decisions.**
    - **The plan card's week dots** (Version 39.14, from your approved mockup): keep them, but mark only the days she did,
      with no grey slots? Or drop them, since the week strip already marks plan days (`app.js:2768`)? Decision 4.
    - **The contraception line.** The doctor may shorten it to one line. It stays wherever likely dates, fertile days or
      today's chance show.
- **Why.**
  - The chips start 813 pixels down at 390 × 844 (848 at 360 × 800, 856 in Hindi). The first screen ends at 779 (735 at
    360 × 800).
  - Three controls open the same day page (`app.js:2722`, `:2738`, `:3093`).
  - On the evening a plan week starts, the pink button sits below the fold at 360 × 800 (865–915 pixels down).
- **Value kept.** Every control keeps a home: past days on the week strip, the full day page through "+ More", the full ring
  in the Diary and behind "?". "Change stage" stays on the headline.
- **Taps.** How she feels: 1 scroll + 1 tap (or 3 taps through the round button) → 1 tap. Evening check-in at 360 × 800:
  1 scroll + 1 tap → 1 tap.
- **Delight.** Opening Sakhi answers where she is, how she feels and what her one thing is, at a glance.
- **Risks.** It's the most-changed screen in the app. Re-run `daily.mjs`, `cyclefirst.mjs`, `pictures.mjs` and `daynote.mjs`
  before and after.
- **Reviewers.**
  - Both kept the round button for the women the chips never reach.
  - Moving "Change stage" off Today is out. It's a safety-review decision (SAFETY-03; MODULE_API.md:3297, `:4306`) with its
    own tests (`cyclefirst.mjs:84`, `pictures.mjs:400`), and moving it saves one small link. The value reviewer dropped it;
    the build reviewer held it for the safety reviewer.
  - "The week look-back only in the morning" is out too. The build reviewer dropped it, because it would hide the look-back
    from women who open Sakhi only in the evening, and it's already one line (`plan.js:611`). The value reviewer would have
    kept it.

**R09. One "Sakhi says" card a day, chosen by a fixed order.** *P1 · M · Doctor: no.*
- **Change.**
  - **Today shows one card, in this order:**
    1. urgent cards, above everything, as now;
    2. doctor cards: a finding with its free plan, the plan's doctor check, what the doctor said, a check that is due,
       tablets after a loss;
    3. stage safety cards: the after-birth recovery card, "Have your periods stopped?";
    4. plan moments;
    5. the rest: the weekly quiz, free check-ups.
  - **A card that loses today waits for tomorrow;** it isn't dropped.
  - **"More from Sakhi (n)" goes.** In its place, a quiet link, "Everything Sakhi has for you", opens a list page, so nothing
    becomes unreachable.
  - **Setup.**
    - The steps that matter for safety stay on Today until done or "Not now": the pill or contraceptive reminder, pregnancy
      dates, iron.
    - The nice-to-have steps move to Me after day 3, with a dot on the Me button. This is merged with R24, so setup moves
      once.
  - **A care reminder due tomorrow** (a check-up, a vaccine) stays as one line on Today.
  - **Free check-ups,** the app's only cervical-screening prompt (`screen.js:569-573`), join the card-of-the-day turn with
    "Done" and "Not for me". They come back every 6 months until she answers.
  - **The "Day 1 of your plan" card goes.** It repeats the plan card above it (video preg 86 s; `plan.js:2360`).
- **Why.**
  - The slot sits below the first screen and folds everything after its first card (`app.js:2464-2465`). Few women open
    the fold (`docs/home-plan-diary-audit-2026-10-26.md`, item 7).
  - On day 85 two cards said the same thing (video cycle 265–267 s).
  - Free check-ups stayed for 90 days because she never tapped them (video mid 203.4–293.2 s).
- **Value kept.** Urgent cards are untouched. Every card still shows on its day, or in the list.
- **Taps.** Today: open the fold (1 tap), then scroll. After: 0 to see today's card. It's still below the fold until R08
  lands.
- **Delight.** Sakhi speaks once a day, about what matters today.
- **Risks.**
  - Tests: `firstday.mjs` (14 references to the slot), `notices.mjs`, `value.mjs`, `knowledge.mjs` section 9,
    `companion.mjs`, `joining.mjs`.
  - Update MODULE_API section 50.
- **Reviewers.** The value reviewer set the order, the queue, the list page and the safety setup steps. The build reviewer
  kept the screening card from vanishing, and merged setup with R24.

**R10. The evening check-in is the ticks she already made.** *P1 · M · Doctor: only the fasting rule for women who aren't
pregnant or breastfeeding.*
- **Change.**
  - **No check-in screen when the day is done:** every step is ticked, including the recovery check, and today has a
    feeling. The "Day complete" card closes the day. This is partly built already (`plan.js:2735-2741`; the reminder is
    skipped, `plan.js:173`).
  - **With steps still open:**
    - The pink button opens the same checklist.
    - Done, Partly and Not today stay visible as chips, with no hidden "second tap".
    - A step she didn't touch counts as "Not today", so Save is 1 tap. Today Save refuses until every step has an answer
      (`plan.js:2077`).
  - **What shows, and when.**
    - "What got in the way" stays optional and shows when a step is missed, as now.
    - The feelings chips show only when today has none.
    - "Add how it went" shows only when a sleep or bedtime question is waiting.
  - **After Save she's back on Today.** The "Day complete" card shows the evening's reason, her goal line, her if-then tip
    and tonight's session. The bad-night card and its doctor line stay (`plan.js:2041-2046`, `:2095-2101`).
  - **A bug fix.** Never "All counted. Just save." while a check step, such as the recovery check, is still open (video post
    103.5 s; `plan.js:2020`, `:2048`).
  - **Fasting.**
    - No change in pregnancy or while she breastfeeds. The chips come every day, so the doctor's line reaches her
      (MODULE_API.md:3448-3452, SAFETY-03).
    - For other women, once the doctor agrees: only on a food-step day, after a fast logged in the last 7 days.
- **Why.**
  - With 4 steps the form is 1.83 screens, with 25 things to tap, 17 of them chips. It ends on a page that costs a tap to
    leave (video cycle 126 s). Neha's takes 4 taps and 2 scrolls (job 4).
  - The reminder opens this screen, so it's her most common evening path.
- **Value kept.** Partly answers, what got in the way, last night's bedtime and sleep, and fasting where it applies. The
  results read the same fields.
- **Taps.** Today: 3–4 taps + 1 to leave. After: 0 when the day is complete; 1–2 taps otherwise, with no page to leave.
- **Delight.** When the day is done, it is simply done.
- **Risks.**
  - The golden plans are re-recorded.
  - `follow.mjs`, `daily.mjs`, `foodsteps.mjs`, `winddown.mjs`, `notices.mjs` and `carryon.mjs` change.
- **Reviewers.**
  - Both removed the first draft's hidden "second tap means Partly". New smartphone users won't find it, and screen readers
    announce it poorly.
  - Both kept fasting daily in pregnancy and while breastfeeding.
  - They split on "What got in the way". The value reviewer: whenever a step is missed, because it feeds her if-then tip.
    The build reviewer: only when 2 or more are missed. We keep it as now, because it's optional and costs no tap.

**R11. Day 1 through one door: from "Your Sakhi" to her first step.** *P1 · R11a S, R11b L · Doctor: the new headings.*
- **R11a (small).**
  - **The Diary first-log card is skipped when she gave dates, a tick or the pill answer at joining** (`app.js:1799`,
    `plan.js:1242`). Her first note is her first feelings chip on Today. "I don't remember the dates" keeps the card.
  - **"Your Sakhi" ends with her plan as the main button:** "See my plan · 12 weeks, about 10 minutes a day". "Show me
    around" becomes a quiet link (`app.js:1855`). When a finding shows, the doctor card stays first.
  - **Every way into the plan reuses what she already said:** gap, PMOS, pain and heavy flow (`app.js:1785-1786`; today the
    two ways in pass different answers, `plan.js:1261` against `:2810`).
    - If she ticked "pain that stops my day", that answer is reused.
    - The plan's 3-level pain question shows only when the tick was off.
  - **The offer's line "Made from your answers and your first log" gets new words** (`plan.js:2928`).
- **R11b (large, your call, after the field test).**
  - **The "Here's what you told Sakhi" screen goes** (`plan.js:1517`). The ready card keeps "Change my answers".
  - **The reveal becomes "Your plan", then the doctor card, then "Your days".**
    - "Your plan" holds the goal, the length, and the steps with "Why?".
    - The doctor card, "First, one check", shows whenever her answers call for it (`plan.js:1975-1977`).
    - "Your days" holds the day strip, "Missed a day? Nothing to catch up", weeks 1, 4 and 12 in one line, the start day,
      the reminder time and Start.
  - **"Your day" asks less.**
    - It asks food and bedtime.
    - It keeps "Your day is mostly" as one chip row with "Night shifts" in view, because her wind-down and bedtime depend on
      it (`plan.js:2485`).
    - Knees and back are asked on the first routine's own Start screen.
  - **The day-1 tour and the "Your plan for today" tip become one tip:** "Tap how you feel: that's your first note", where
    the chips show. Otherwise it points at This week or the recovery check.
  - **The joining calendar opens on her latest period.** For a woman trying for a baby:
    - 3 dates by default, with "Add more if you have them written down";
    - a live line that counts correctly towards fertile days, which need 7 period starts (`app.js:741`);
    - the line shows only in builds where fertile days can show, and never counts guessed dates.
- **Why.**
  - Before her first plan step she passes 23 screens and 44 taps (Asha 47, Neha 52), with 3 tips.
  - Along the way there are two ways into the plan that ask different questions, a first-log card that repeats joining, and
    a summary of answers she gave a minute earlier.
  - The shortest path that exists, Start on "Your Sakhi", is 38 taps, but it isn't the main button (job 12c).
  - Since Version 39.26 her diary starts at joining, so "plan after the first log" no longer buys anything.
- **Value kept.** Every answer the plan uses, every line that sets her expectations (first-days audit), the doctor card,
  and the tour as a replay in Me.
- **Taps.** Today: 44 taps, 23 screens, 3 tips. R11a: about 37 taps, 20 screens, 1 tip. R11a + R11b: about 31–33 taps and
  17–18 screens. These are estimates; the walk test in section 7 measures them.
- **Delight.** Two minutes after "Your Sakhi" she's on her first step, and Sakhi already knows her answers.
- **Risks.**
  - It reverses Version 39.10's "diary first", which was chosen when joining saved only one guessed date. R11b also changes
    part of Version 37.1's plan cards.
  - Tests: `joining.mjs`, `firstday.mjs`, `companion.mjs`, `tours.mjs`, `joindates.mjs`, `firstday-walk.mjs`.
- **Reviewers.** The value reviewer restored the doctor card, the night-shift question and the 3-date default for women
  trying for a baby. The build reviewer split the work in two (R11a, R11b).

**R12. One tip at a time, at first use.** *P1 · S (tests M) · Doctor: no.*
- **Change.**
  - **Multi-step tours that start on their own become at most one single-step tip,** shown when a screen is first used.
  - **At most 1 a day, none on a period day, none after day 7.** Today's limit is 3 a day, 60 seconds apart
    (`app.js:3192-3196`).
  - **These stay as automatic tips:**
    - the Help pointer (`app.js:3159`);
    - the "bleeding after menopause" pointer (`app.js:3156-3157`);
    - "Change stage" (SAFETY-03);
    - the one day-1 tip (R11).
  - **Every tour stays on its "?",** and in Me as "Replay the welcome tour".
  - **The rest is decided from the field-test coordinator's notes** of every "what is this?".
- **Why.**
  - In week 1 a curious new woman meets up to 21 tour steps in 9 tours: 11 tip taps with a plan, 16 without.
  - Tours still fire on days 10, 15, 29, 36, 84 and 90 (the ring's tour comes back on day 84, when the full ring returns).
    The day-page tour blocks her first note on day 10 (`app.js:3164`).
  - "Change stage"'s tour starts on a period day (video cycle 138.5 s).
  - In NN/g's study, tutorials shown up front made tasks feel harder; help in context worked.
- **Value kept.** The replays, read-aloud on every card, and the safety pointers.
- **Taps.** Week 1 today: 11–16 tip taps, and 6 more on later first visits. After: at most 1 a day.
- **Delight.** Her first week feels calm: Sakhi shows, it doesn't lecture.
- **Risks.**
  - First-time smartphone users may miss a feature, which is why the coordinator's notes decide the rest.
  - On 20 Oct you asked for a full tour (`tours.mjs:1-3`), and Version 37 already cut it to one tip per screen: decision 5.
  - `tours.mjs` (77 checks) changes.
- **Reviewers.** The build reviewer kept the first draft, which retired every automatic tour. The value reviewer kept
  single-step tips and the safety pointers; this audit takes that version.

**R13. One celebration a day, one meaning of "full day".** *P1 · M · Doctor: no.*
- **Change.**
  - **The "Day complete" card is the moment.** The last tick animates and the day's petal grows inside the card.
  - **These go:**
    - the toasts on the same tap ("Well done.", "Day complete. Well done.");
    - the separate "A petal for your garden" row.
  - **Badges go quiet:** a dot on My garden, not a 5.2-second burst over the screen (`joy.js:191-227`).
  - **"Full day" has one meaning:** every plan step done, or one note on a day without a plan. It earns the day's petal.
    The badge line "Earn all 3 petals" (`joy.js:428`) changes to match.
  - **The Diary's meter counts her plan days too,** so it agrees with her plan (`app.js:1932-1939`). Today already hides
    the meter while a plan runs (`app.js:1914`).
  - **At a period start, only the scheduled day-3 "Talk to a Qura doctor" card waits for the evening** (`plan.js:2374`).
    Urgent findings and the findings due today or this week, such as heavy flow or bleeding after periods stopped, still
    show at once.
  - **What stays:** each tick's short vibration, the full burst for the month's flower, and reduced motion.
- **Why.**
  - One evening action earns up to 3 celebrations, and one period tap brings 4 responses (video cycle 134.5–139.0 s).
  - Priya followed her plan on 51 of 84 days, then read "Noted on 1 of 23 days" (cycle 265 s against 282 s).
  - Rewards fade by about 14 weeks (Mazeas 2022). A quick celebration right after the act builds the habit (Fogg).
- **Value kept.** The garden, the month's flower, all 12 badges, and weeks in a row.
- **Taps.** Today: a burst that blocks the screen and 1–3 toasts each evening. After: 0.
- **Delight.** One clear, warm moment a day.
- **Risks.** Tests: `firstday.mjs`, `knowledge.mjs`, `daily.mjs`, `diary.mjs`, `daynote.mjs`, `records.mjs`.
- **Reviewers.**
  - Both found that the first draft's "move the meter off Today" was already built.
  - The value reviewer kept urgent findings immediate.
  - The build reviewer added the Diary meter fix, and noted that the badge burst closes itself (but still blocks the
    screen).

**R14. Every stage can reach "Day complete".** *P1 · M · Doctor: what the after-birth button saves.*
- **Change.**
  - **Pregnancy.**
    - "Due now: Register your pregnancy, and 4 more" leaves the daily checklist.
    - The pregnancy card shows the next check-up instead: "Next: Register your pregnancy, by week 12 · and 4 more due", with
      "Done" and "Already done".
    - Overdue items keep their urgent colour.
    - Her daily habit alone completes the day.
  - **Yoga and strength steps** get a small tick beside Start, "Did it without the phone", so every step can be ticked in one
    tap.
  - **After a birth.**
    - Under the full danger list, a "No warning signs today" button saves that answer in one tap.
    - One more tap records today's bleeding, the trend that matters.
    - The other groups stay unanswered unless she taps them, and the form never folds (`post.js:614-616`).
- **Why.**
  - In pregnancy the day can never finish: the due item is a check step that only its own tool can complete
    (`progs/v1.js:24`, `plan.js:1454`, `:2687`; video preg 86 s).
  - In PMOS, yoga, the plan's main step, has only Start (`app.js:2605-2611`; video pmos 279 s).
  - After birth the form invites 10–12 taps (video post 91.4–97.5 s), although "None of these" + Save already saves a day
    in 2 (`post.js:913`).
- **Value kept.**
  - The check-up page, dates, the MCP card and U-WIN.
  - Start stays the main button for a routine.
  - Every danger sign stays on the recovery check's first screen.
- **Taps.** Pregnancy: a day that never completes → 1 tap. Yoga: run it, or wait for the check-in → 1 tap. Recovery: 2 taps,
  clearly offered.
- **Delight.** Every stage can reach "Day complete".
- **Risks.**
  - The plan baseline and golden are re-recorded.
  - Tests: `goals.mjs`, `carryon.mjs`, `daily.mjs`, `value.mjs`, `plans.mjs`, `fieldtest.mjs`, `daynote.mjs`, `progs.mjs`.
- **Reviewers.**
  - Both rejected the first draft's "All fine today". It would have saved "normal" answers for bleeding, fever and mood
    that she never gave, into her record and her doctor's report. The mood group carries the self-harm flag.
  - The value reviewer allowed only "No warning signs". The build reviewer added the bleeding tap. This audit uses both.

**R15. One home for each fact.** *P1 · M · Doctor: the fertile line on Today (with the safety reviewer).*
- **Change.**
  1. **Next period.** It shows on Today's headline and in "Your cycle at a glance" in Cycles. The calendar strip keeps the
     cycle day, and "What Sakhi can tell you" lists only what is still missing.
  2. **Trying for a baby.**
     - Outside the window, one line on Today's cycle card: "Next fertile days: 22–27 Nov, an estimate".
     - It shows only when fertile days can show. Never when her period is late, never on a shared phone, never in discreet
        mode, never in a tester build.
     - Cycles shows the dates instead of "On your calendar".
     - This is the same line R04 item 6 needs, built once. The contraception line stays beside it.
  3. **A doctor finding has one home:** "What your diary shows".
     - One line stays on Today until she taps "Got it" or "Booked". Opening it isn't enough.
     - My plan keeps its row only for urgent findings and those due today or this week, with their call buttons (112,
       14416). Month-level and watch findings leave My plan.
     - Two stacked "Keep an eye on it" cards become one, which keeps each finding's own doctor line.
  4. **"For my doctor"** (the report and My records) goes back to the top of Cycles.
  5. **One way of counting days** everywhere.
- **Why.**
  - Her next period shows in 4 places.
  - Asha's finding sits on 5 surfaces (video pmos 56 s, 120 s, 129 s, 150 s, 181.5 s, 294 s, 298.5 s).
  - The report has slid 2 screens down Cycles (job 11; `app.js:4043-4048`).
  - Neha must open the calendar to see her next window (job 6).
  - Rekha sees "48 days" and "49 days so far" on one screen (video mid 111–118 s).
- **Value kept.** Each fact still shows where she looks first. The finding leads Today until she acts on it.
- **Taps.** Report: 3 taps + 2 scrolls → 2 taps. Next fertile window: 1 tap + 1 scroll → 0.
- **Delight.** A woman trying for a baby sees her next window the moment she opens Sakhi.
- **Risks.** Tests: `insights.mjs`, `whynot.mjs`, `records.mjs`, `cyclefirst.mjs`, `diary.mjs`.
- **Reviewers.**
  - The value reviewer kept the "Got it" rule and My plan's call buttons.
  - The build reviewer flagged the fertile line as new display under Version 32's fertile-days rules (`app.js:2401-2404`),
    for the doctor and the safety reviewer.

**R16. Results lead with what she came for.** *P1 · S–M · Doctor: the new result lines.*
- **Change.**
  - **The 12-week page and the monthly look-back open with her goal's before and since,** then "Followed on n of 84 days".
  - **Plans with no result line today get one:**
    - midlife: hot flushes (from R05's chip days) and sleep;
    - PMOS: her gaps before and since.

    Today their before and since sit only in the folded Details (`plan.js:1872-1886`, `:655`), while the page says "Your
    before and since are here" (video mid 288 s).
  - **The 12-week check's 3 questions sit on the page, below the result,** not behind a pink button above it. "Worse" keeps
    its doctor card (`plan.js:2593-2611`).
  - **The doctor card.** "Show my doctor" stays the main button, then the free government doctor and Qura. That holds unless
    you extend your 27 Oct rule to plan pages (decision 10).
  - **Trying for a baby.** Her cycles (and fertile windows where they can show), plus the before-pregnancy checklist count
    and its next item. Today her only result is "0 of 17 done" (video ttc 287.5–289.0 s).
- **Why.** People remember the high point and the end (NN/g, peak-end rule).
- **Value kept.** Every number, the 12-week check, the doctor buttons and "What next".
- **Taps.** Midlife and PMOS: 1 tap to unfold Details → 0.
- **Delight.** Week 12 ends on her own change.
- **Risks.** Tests: `results.mjs`, `notices.mjs` section 6, `goals.mjs`.
- **Reviewers.**
  - The build reviewer narrowed it. The result is already unfolded for the regular-periods, pain, heavy-flow, trying, PMS
    and mood plans; the gap is the plans with no result line.
  - The value reviewer kept the 12-week check on the page, and kept the free government doctor.

**R17. The monthly check-in asks what fits her.** *P1 · quick fix S, merge L · Doctor: the merged set.*
- **The quick fix (now).** Under 40, the 4-level hot-flush scale goes. "Hot flushes" becomes an optional chip under "More":
  one tap if she has them. It stays because early hot flushes can matter to a doctor.
  - Today every woman with cycles gets the scale (`app.js:4062-4063`). So Priya (28) and Neha (29) are asked about hot
    flushes, and never about pain (video cycle 197.5 s; pmos 217–218.5 s).
- **The merge (after the field test).** One 1-minute "Your month" replaces four surfaces: Today's "Month 1 done" card, the
  plan's 4-week check, the Diary's "This month", and the garden recap.
  - **Her goal's question comes first:**
    - pain: "Did you need a painkiller this period?";
    - PMOS: the PMOS signs in one wording, filled in from her plan answers;
    - trying for a baby: her cycles and windows;
    - midlife: hot flushes;
    - pregnancy and after birth: their own sets.
  - **The screening chips stay for every woman with cycles,** under a folded "Anything else?". They cover bleeding after
    sex, burning, discharge and itch, pain during sex, heavy flow, low mood, the PMOS signs and neck patches. Each feeds a
    finding (`explain.js:222-235`), and the day page has no chip for several of them (`app.js:2761-2766`).
  - **Each stage's red-flag chips keep their urgent lines exactly as now** (bleeding in pregnancy, lochia, the breast flags;
    `app.js:4069`).
  - **Women with regular cycles keep a 1-tap monthly mood question.** Today only that answer raises the low-mood finding
    (`explain.js:224`), which carries the Tele-MANAS line, 14416 (`explain.js:17`). It stays until the doctor sets a rule for
    raising that finding from daily "Low mood" chips.
  - **The weekly energy question** is asked once, on the right day, and dropped after 2 days.
- **Why.**
  - Six monthly surfaces and two 1-minute monthly check-ins overlap.
  - Asha is asked the PMOS signs in two wordings (video pmos 84.5 s against 218.5 s).
  - Questions left on My plan go unanswered (video cycle 242.5 s; mid 252.8 s; ttc 254.5 s).
- **Value kept.** Every sign is still asked and still reaches her report. Red flags stay one tap away in Help.
- **Taps.** Today: up to 2 monthly check-ins plus a weekly question, 4–5 taps each. After: one minute, 2–4 taps.
- **Delight.** Once a month, one minute that shows her own change.
- **Risks.**
  - The monthly petal rule (`joy.js:307`), the journey module (`journey.js:31`, `:53`) and the plan's monthly check change
    together.
  - Tests: `insights.mjs`, `records.mjs`, `knowledge.mjs`, `results.mjs`, `follow.mjs`.
- **Reviewers.** Both dropped two parts of the first draft:
  - "only her goal's questions", which would have removed screening;
  - "no monthly page for regular cycles", which would have closed the only path to the 14416 line.

**R18. Screens true to her stage.** *P1 · M · Doctor: "Any bleeding" and its guidance link.*
- **Change.**
  1. **Her first article follows her goal and stage.**
     - Pain: "Period pain: what helps".
     - After a birth: "After birth: the first six weeks" first, the order "Continue reading" already uses (`app.js:4100`).
     - Menopause: an after-menopause article.

     A test checks each stage's first article.
  2. **Menopause.**
     - "Period started" and "Spotting" become one "Any bleeding" button: same size, same place, quieter colour only.
     - It saves a spotting entry, so the existing "bleeding after menopause" finding still fires (`explain.js:61-63`,
       `:203`), cycle counting stays off, and the guidance opens.
     - The top card shows her goal: "Calcium 3 of 3 days this week · Strength next: Thursday".
  3. **Cycles fits her stage.** In pregnancy it shows weeks and check-ups. After menopause it shows her symptom trend and
     "Log any bleeding". Neither shows example period numbers or "Add a past period" (`app.js:4049`).
  4. **Explore keeps "Missed period and unplanned pregnancy" for every stage but pregnancy,** because the abortion page lives
     there (MODULE_API.md:3572-3574). For a woman trying for a baby it may be retitled "Missed period? Take a test", with
     the same pages inside. The midlife tile reads "Midlife and menopause".
  5. **No period wording for a pregnant woman,** in tips or reminder asks (`app.js:230`; video preg 250.8 s).
- **Why.**
  - A mother 14 days after the birth gets "Pregnant? Register before 12 weeks" (video post 56 s; `app.js:1958-1961`).
  - Lata gets a pink "Period started" first (video meno 53.5 s; `app.js:2369-2371`).
  - A pregnant woman sees example period numbers (video preg 161.9–165.3 s).
  - Each mismatch tells her the app isn't for her.
- **Value kept.** Every article stays in Learn. Bleeding after menopause gets easier to log, not harder.
- **Delight.** Each woman sees an app made for where she is.
- **Reviewers.**
  - The value reviewer required "Any bleeding" to keep feeding the finding, at the same size.
  - The build reviewer dropped the first draft's idea of hiding the missed-period topic. It would break a written safety
    rule, which `joining.mjs:86` checks.

**R19. Wind down, one tap away at bedtime.** *P1 · S–M · Doctor: no (same audio, same page).*
- **Change.**
  - **The night row.** From her check-in time, or 9 pm without a plan, Today shows one night row for every woman in a build
    with Wind down: "Wind down · Yoga nidra 9 min", tonight's pick, which plays on one tap.
  - **Not in the 6 weeks after a loss,** unless she has used Wind down before. "For you" shows only loss items then
    (`app.js:1152`).
  - **In pregnancy,** the row carries the line "lie on your left side, not flat on your back" (`calm.js:218`, `:293`), or
    tonight's pick is slow breaths.
  - **Already built, kept:**
    - the voice follows the app language (`calm.js:29`);
    - the timer starts at 30 minutes (`calm.js:30`);
    - the voice switch is on the session screen;
    - the wind-down reminder opens tonight's session (`app.js:4704`);
    - the check-in's saved screen offers it (`plan.js:2098`).
  - **Later (P2): one Calm page.** Tonight, Right now (the 3-minute relief routines) and Sounds. It keeps the routes from her
    symptoms ("What helps") and the plan steps that open a routine.
- **Why.**
  - At 10:15 pm Priya can't find Wind down. It isn't on Today, and "For you" shows it only with a bedtime step or a sleep,
    mood or PMS goal (`app.js:1186-1191`).
  - It takes 4 taps and a scroll (job 9). The film skips this by jumping to the page (`journey-video.mjs:191`).
  - Dr. Megha's voice is Sakhi's strongest delight. In Kilkari, women kept listening to recorded calls; the doctor's voice
    itself wasn't tested on its own.
- **Value kept.** Every session and sound, the timer, and "For rest and sleep, not treatment".
- **Taps.** Today: 4 taps + 1 scroll (3 more if Explore's tour fires). After: 1 tap.
- **Delight.** Every night can end with Dr. Megha's voice, one tap away.
- **Risks.** Tests: `calm.mjs`, `winddown.mjs`, `sleepwell.mjs`.
- **Reviewers.** The build reviewer found half of the first draft already built, and moved the Calm page to P2. The value
  reviewer added the loss and pregnancy rules.

**R20. Moments of being right.** *P1 · S–M · Doctor: the three lines.*
- **Change.**
  1. **"Still bleeding?"** (Yes · It stopped yesterday) on the morning after her usual period length, when no end is logged.
     - "Yes" records that day as a bleeding day, so a period longer than 8 days still raises the "long period" finding
       (`explain.js:168-173`).
     - "It stopped yesterday" logs the end.
  2. **"Not yet"** when her likely dates pass with no period, so Sakhi knows she didn't forget.
     - It also cancels the late-period notification.
     - "Period late?" keeps its path to the pregnancy test.
  3. **"Right on time: inside the dates Sakhi showed you"** in the plan line, when her period starts inside the range
     (worked out without the new start).
     - Not for a woman trying for a baby (she gets R15's next-window line instead).
     - Not in pregnancy, after a birth, or after her periods stop.

  None of these show on a shared phone or in discreet mode.
- **Why.**
  - The end of a period is the entry women forget most (Epstein 2017). Sakhi keeps a period open for up to 10 days
    (`app.js:681-686`).
  - A prediction that comes true passes in silence (video mid 259.3 s, 274.9 s).
- **Value kept.** Nothing is removed, and her dates get more accurate.
- **Taps.** Logging a period's end: open the Diary and log it → 1 tap on Today.
- **Delight.** Sakhi is visibly right about her, which is the best reason to keep logging.
- **Risks.** Tests: `cyclefirst.mjs`, `whynot.mjs`, `insights.mjs`.
- **Reviewers.**
  - The value reviewer kept "Right on time" away from a woman trying for a baby, as the heads-up card already does
    (`app.js:2514-2518`). The reviewer also made "Yes" count as bleeding.
  - The build reviewer added the late notification and how the range is worked out.

### P2: fewer places to look

**R21. My plan tells the story; Today does the doing.** *P2 · M · Doctor: no.*
- **Change.**
  - **My plan shows:**
    - her goal;
    - where she is in the 12 weeks (12 dots and the next milestone, "4-week check in 19 days");
    - what changes next;
    - at most 3 tool tiles, none repeating a step.
  - **Steps become read-only rows** (name, one line, a done mark). A tap opens Today or the tool.
  - **"How it works" and "Why these steps?" are folded from day 1.**
  - **The path rows hide when both say "Your daily steps".**
  - **The care team becomes one row, "A doctor for my plan".** It opens a sheet with the free government doctor and Qura
    (first call free). "Show my doctor" (the report) stays as a link in the plan's story.
  - **The records row shows only while a finding is open.**
- **Why.**
  - My plan repeats Today's checklist ("Tick here or on Today: it's the same tick", `plan.js:3037`).
  - It runs 4.36 screens in week 1 and 2–2.6 later.
  - Its path says "This week: Your daily steps · Next week: Your daily steps" (`plan.js:2141-2150`).
- **Value kept.** Every reason, line, tile and setting stays one tap away.
- **Taps.** Week 1: 4.36 screens → about 1.5.
- **Risks.** It reverses Version 39.19's "My plan fully open in week 1" (decision 9). Tests: `planfold.mjs`, `daily.mjs`,
  `winddown.mjs`.
- **Reviewers.** The value reviewer kept free care and the report on the plan page. The first draft had left a paid
  partner as the only doctor there.

**R22. Explore: fewer places to look.** *P2 · M (the search fix S) · Doctor: no.*
- **Change.**
  - **The search fix (small, can ship any time).** Searching "plan" or "प्लान" opens My plan, or the plan picker. Today it
    finds the pregnancy plan, iron and the older 21-day journey (`app.js:1288`).
  - **Explore becomes 4 parts:**
    - Search, which shows "Browse all 53 guides" when nothing is typed;
    - For you, at most 3 (with "What your diary shows" only when a finding is open);
    - Your questions;
    - Topics.
  - **What goes:** the intro line, the Contents row and the bottom Help row. Help stays in the top bar, in browse mode too
    (`app.js:998`).
  - **Learn uses Explore's search.**
  - **A topic page** shows its tools, "When to see a doctor", and one row, "Read the 11 guides".
  - **The standalone "start a 21-day journey" entry goes.** The journey's data stays, because the iron plan's first 21 days
    use it (`plan.js:1407`).
- **Why.**
  - Explore runs 2.98 screens, 210 words and 24 tap targets. The Periods topic page runs 5.26 screens.
  - "Period pain" appears 3 times (video cycle 211.4–225.2 s).
- **Value kept.** All 53 guides, every tool and topic, and Govt. services. Women already in the journey finish it.
- **Taps.** Explore: 2.98 screens → about 1.5. A topic page: 5.26 → about 2.
- **Risks.** Tests: `places.mjs`, `knowledge.mjs`, `value.mjs`.
- **Reviewers.** Both protected the journey's data.

**R23. A lighter Cycles, same 3 Diary tabs.** *P2 · S · Doctor: no.*
- **Change.** Calendar, Cycles and Days all stay.
  - The charts fold into "Your cycle at a glance".
  - "Add a past period" becomes a link in the "My cycles" header once she has 2 or more periods. That header shows whenever
    she can log periods.
  - The calendar's Today strip shows her answer as one line ("Today: Tired · change") once she has answered.
- **Why.** Cycles runs 2.73 screens (regular) to 3.36 (PMOS), with 8 or more blocks. The calendar repeats Today's chips
  (video cycle 156.8–178.9 s).
- **Value kept.** Every note and period stays in its place.
- **Risks.** Tests: `diary.mjs`, `daynote.mjs`, `records.mjs`.
- **Reviewers.** They disagreed.
  - The value reviewer accepted the first draft's 2 tabs, with "All notes" right under My cycles.
  - The build reviewer kept 3 tabs. Days grouped by period and the calendar's chips were built on 26 Oct with your approval
    (Versions 39.17 and 39.18), and moving Days would make a long page longer.
  - This audit takes the smaller version. The 2-tab idea is in Appendix A.

**R24. One Reminders page, a lighter Me and sign-up.** *P2 · M · Doctor: no.*
- **Change.**
  1. **One Reminders page.** Me > Reminders and the reminders list become one page: every reminder with its switch and time
     (mostly built, `tools.js:267-290`).
     - It adds a switch for the period heads-up, which has none today (`app.js:4731`).
     - Plan settings and each tool link there, and searching "reminder" finds it.
  2. **Setup moves once,** as in R09.
  3. **"Display and language".** Appearance and Language merge. The theme stays light by default, on purpose
     (`app.js:993`), unless you want it to follow the phone.
  4. **Languages.** Wind down's voice already follows the app language. The report's language stays a visible choice on the
     report itself, because many doctors read English. The monthly reminder is offered once, after her first "Your month".
  5. **A shorter sign-up.** "Almost done" keeps her name (filled in) and her PIN code. Email, "How did you hear about
     Sakhi?" and the update switches (opt-in, unticked) move to a one-time card in week 2, or to Me > Account. Yours and
     Qura's call (decision 11).
- **Why.**
  - Reminder switches live in 4 places, and the setup card stays on Today for 30 days (`app.js:2638-2640`).
  - At her most impatient moment, sign-up asks 6 things, and 4 of them serve Qura rather than her first day
    (`app.js:2153-2160`; video cycle 43–46.5 s).
- **Value kept.** Every setting. Qura still gets its answers, a week later.
- **Risks.** Tests: `me.mjs`, `notify.mjs`, `places.mjs`, `signup.mjs`.
- **Reviewers.** Both dropped automatic code filling by SMS. It needs Google Play services, which the APK's build doesn't
  have (`android/build-apk.sh:112-119`). The code field already offers the phone's own fill-in (`app.js:2177`).

**R25. A doctor call without typing; a date fixed in 3 taps.** *P2 · S · Doctor: no.*
- **Change.**
  1. **Topic chips on the "Ask Qura to call me" form:** Period pain · My plan · Something else. Today a typed topic is
     required (`app.js:4287`).
     - None is picked for her, unless she came from a card that carries a topic.
     - Nothing is filled in on a shared phone or in discreet mode.
     - The consent line and "What will be sent" sit directly above Send (SERVER_SPEC 10.1).
     - No new Help row: "See a doctor" stays.
  2. **"Edit dates" on Today's cycle card and on the day page.** It opens "Edit period dates" on that period's month. It
     doesn't go on the "Period start saved" bar: a third action won't fit at 360 px in Hindi (`app.js:2555-2558`).
- **Why.**
  - Asking a doctor takes 5 taps, typing and 2 scrolls across 3 screens (job 8).
  - Fixing a start date takes 5 taps and a scroll, and tapping the day opens a page that can't move it (job 10;
    `app.js:3494-3535`).
- **Value kept.** The fields sent to Qura and her consent don't change.
- **Taps.**
  - Doctor: 5 taps + typing + 2 scrolls → 5 taps, no typing. That's 4 if Help's "See a doctor" opens the form directly
    (decision 10), and about 3 from a card that carries a topic.
  - Date fix: 5 taps + 1 scroll → 3 taps.
- **Risks.** Tests: `handoff.mjs`, `places.mjs`, `cyclefirst.mjs`.
- **Reviewers.**
  - Both rejected the first draft's new Help row. It would duplicate "See a doctor", and put a paid partner's call in the
    emergency sheet next to 112.
  - The build reviewer would let "See a doctor" open the form directly. That skips the page that also offers the free
    government doctor (`app.js:27`, "A free government doctor, or a call with a Qura doctor"), so it's your call.

## 6. What to cut, merge, move, and what must stay exactly as it is

### Cut

- The round "How I feel" on Today, where the chips show (R08).
- The "More from Sakhi (n)" fold (R09).
- The day-1 reminder sheet for women offered a plan or trying for a baby, and the alarm sheet straight after Start (R01).
- The day-85 gate, and the second "12 weeks are done" card (R03).
- The first-log card, when she gave dates at joining (R11a).
- The "Here's what you told Sakhi" screen; the plan cards go from 4 to 2, plus the doctor card when it applies (R11b).
- Tours of several steps that start on their own (R12).
- Badge bursts, the "Well done." toasts, and the separate petal row (R13).
- The "All counted. Just save." page, and the rule to answer every step before Save (R10).
- The "Day 1 of your plan" card (R09).
- The hot-flush scale under 40 (R17).
- The empty path rows, and My plan's second tick list (R21).
- From Explore: the intro line, the Contents row, the bottom Help row, Learn's second search box, and the standalone 21-day
  journey entry (R22).
- The charts as a separate block (R23).
- "Copy" as the main emergency button (R07).
- The setup card after day 3, for nice-to-have steps only (R09, R24).

### Merge

- The finding and the free plan on Today: one card (R06).
- The fertile line for a woman trying for a baby: R04 item 6 and R15 item 2 become one line.
- Four monthly surfaces into one "Your month" (R17, after the field test).
- Two reminder lists into one page; Appearance and Language into one (R24).
- Wind down, My plan's Calm tab and "Feel better now" into one Calm page (R19, later).

### Move

- The plan offer: from the fold to the top of "Sakhi says" (R06).
- The feelings chips: right under the headline (R08).
- The report: back to the top of Cycles (R15).
- The 12-week check: onto the page, below the result (R16).
- Nice-to-have setup: to Me after day 3 (R09).
- Knees and back: to the first routine's Start screen (R11b).
- Email, "How did you hear" and the update switches: to week 2, if you agree (R24).

### Keep exactly as it is

- 1-tap "Period started" and "Period ended", with Undo (video cycle 132.8 s).
- The joining calendar that shows her gaps as she taps (video ttc 40 s).
- Today's checklist: one tick per step, "Why?" on each, and "Day complete" with tomorrow's step.
- Copy that never shames: "Nothing to catch up: just today", "Nothing is scored here", "Every week counts".
- Sakhi noticing: "Your period came after 43 days. Sakhi noted it for your results." (video pmos 279 s).
- Help in the top bar on every screen, and danger signs within 2 taps.
- Urgent cards above everything (`app.js:2445-2447`), and the doctor first in every finding.
- "Change stage" on Today's headline (SAFETY-03).
- The "not a way to avoid pregnancy" line, wherever dates, fertile days or chances show.
- The fasting chips every day in pregnancy and while breastfeeding (SAFETY-03).
- The recovery check never folded, with every danger sign on its first screen.
- The monthly screening chips, and the mood question that leads to 14416.
- Read-aloud on every card, Hindi throughout, pictures first, and labels under icons.
- Honest results, "Show the doctor, in big letters", and the report in English and Hindi.
- Wind down in Dr. Megha's voice, with the timer and "For rest and sleep, not treatment".
- The garden and its monthly flower, and weeks in a row that never punish a missed week.
- Shared-phone and discreet modes, neutral notification titles, the hidden lock-screen view, and the PIN.
- The pregnancy week page, the after-birth ring, vaccines dated from the birth, and the 1-tap breastfeeding timer.
- For a woman trying for a baby: the fertile window and "High chance today" on Today.
- "Sach ya myth?", now with a heading that asks the question.
- Regional food steps and the 7-day iron rotation.
- The 4 tabs (Today, My plan, Diary, Explore), with Me and Help in the top bar and no "More" tab.
- "Your diary stays on this phone", and only allowlisted fields ever leave it.

### Rules every change must pass

The reviewers found the same few traps in several places. Every build in section 8 checks each one.

1. **Doctor first.** No plan, offer or card ever sits above a doctor finding.
2. **Fertile days through one gate.** Any fertile line shows only when the existing fertile-days check passes
   (`app.js:735-745`). That check already covers tester builds, hormones, a method, age and irregular gaps.
3. **A shared phone, not only discreet mode.** The plan module's private-mode check means discreet mode only
   (`plan.js:57`), so every new line on Today needs its own shared-phone check.
4. **Never write an answer she didn't give.**
5. **Never cap or move a care, pill, iron or medicine reminder, or one she set herself.**
6. **The fasting line reaches her every day in pregnancy and while she breastfeeds.**
7. **The monthly mood question's path to 14416 stays.**
8. **Reviewed words only.** New health lines go to the doctor before they ship.

## 7. How to know it works

Stickiness can be measured without any analytics on her health. The server already records one thing a day: "she opened
Sakhi today", with the app version and the language, and no diary data (SERVER_SPEC 5.4). Everything else stays on the phone,
or with the field-test coordinator. Nothing goes to Meta.

The server can't tell who is on a plan, by design. So plan-only numbers come from the coordinator and the phone, never from
the server.

| Measure | How | Target |
|---|---|---|
| Daily use: daily opens ÷ women active in the last 30 days | SERVER_SPEC section 7 queries (`daily_stats.active`, `last_30_days`), read weekly, by build | Record the 0.39.26 baseline first. After Phase 2, 25% or more. For scale: an industry rule of thumb calls 20% good, and tracker apps' median is about 6% of installs opening on a given day (Baumel 2019) |
| Still using Sakhi 1, 4 and 12 weeks after joining | SERVER_SPEC section 7 (`pct_after_1w`, `_4w`, `_12w`), by signup week | Each phase's group beats the 0.39.26 group by 10 points at 4 weeks, with no drop at 12 weeks (R03). A pilot runs far above open use (one program: 22.5% finished in a trial, 0.5% in open use; Eysenbach 2005), so compare group to group |
| Day 1: taps to her first plan step | A walk test in the repo (extend `test/firstday-walk.mjs`) for the regular-periods, PMOS and trying joins; a stopwatch in the field | At most 37 taps after R11a and 33 after R11b, with 1 tip (today 44, 47 and 52). Field time under 10 minutes (today an estimated 13–18) |
| The 10-second day | A test at 360 × 800, English and Hindi, every stage: the chips, every step and the evening button above the tab bar; taps for a full day and for Wind down | A full day in 2–4 taps, with no scroll (today about 6 + 2 scrolls). Wind down in 1 tap (today 4 + a scroll) |
| Interruptions in week 1 | Count tips, pop-ups and sheets that start on their own, on the phone. Shown only on a coordinator screen in Me > About; never sent. Port the 10-day walk into the repo | At most 1 a day (today 11–16 tip taps, 2 badge bursts and about 13 toasts in week 1) |
| Reminders that reach her | A test reads the reminders booked each day; the coordinator notes how many plan starters have reminders on | At most 2 plan reminders a day, never two within 90 minutes, care reminders untouched. 70% or more of plan starters with reminders on (today none, for women who tap only Start) |
| Full days per week | Her plan log, on the phone. She sees it in "Your month", and the coordinator sees it. Optional: a new allowlisted bucket in the opt-in monthly counts (SERVER_SPEC 5.9), only with your yes | Median 4 of 7 days in weeks 1–4, 3 of 7 in weeks 9–12. Every finished plan still shows steps on day 85, unless she stopped |
| Nothing untrue about her | Checks over the 7 journey replays and the golden plans (the R04 items; pain and hot-flush results filled in by week 12). One interview question: "Did Sakhi ever say something wrong about you?" | 0 in the replays, 0 in the field |

Two housekeeping notes:
- `web/test/journey-video.mjs` isn't in git yet. It should fail when it taps inside a closed fold (R06).
- The tap scripts from this audit are in the session's scratch folder, which is wiped on restart. Keep them in the repo
  (CLAUDE.md: every test inside this repo).

## 8. Build order

Each phase is one session, checked as it's built: at 360 × 800, in Hindi, on a shared phone and in discreet mode. Golden is
re-recorded where noted.

| Phase | Version | What | Size | Why this order |
|---|---|---|---|---|
| 0 | none | Baseline. The tap walks (joining, the 10-day run, the 7 journeys) and the server's daily-use and weeks-later numbers for the 0.39.26 group. The coordinator's week-1 interview notes | Half a day | Each phase is judged against it |
| 1 | V39.27 | **Fix the loop and the truth:** R01, R02 (the agreed part), R03, R04, R05, R06, R07. If there's room, two small fixes: the under-40 hot-flush fix (R17) and the "plan" search (R22) | S to M each; golden re-recorded for R05 | Leaks first: the prompt, week 12, trust, safety. All small, before the field test |
| 2 | V39.28 | **The 10-second day:** R08 (first slice), R09, R10, R12, R13, R14, R19 (the night row) | M to L; golden for R10 and R14 | The daily loop itself. Build it after Phase 1's numbers come in |
| 3 | V39.29 | **Day 1 and the truth around her:** R11a, R15, R16, R18, R20; R25 (small) | M | Her first minutes, and facts in one place |
| 4 | V39.30 | **Fewer places, after the field test:** R11b, the "Your month" merge (R17), R21, R22, R23, R24, the Calm page (R19) | L | The biggest changes and the reversals wait for evidence |

**One doctor batch**, sent with Phase 1 so it's back before Phases 2 and 3:
- the findings' "{k} of your last {n} gaps" and the meter's new promise (R04);
- "Pain today?" and "Days with hot flushes" (R05);
- the reminder words, if they change (R02);
- the fasting rule for women who aren't pregnant or breastfeeding (R10);
- the new reveal headings and the calendar heading for a woman trying for a baby (R11);
- what "No warning signs today" saves (R14);
- the fertile line on Today, with the safety reviewer (R15);
- the new result lines for midlife, PMOS and trying (R16);
- "Your month" and its questions, and the under-40 chip (R17);
- "Any bleeding" and its guidance link (R18);
- "Still bleeding?", "Not yet" and "Right on time" (R20);
- a shorter contraception line, if you want one (R08).

## 9. Decisions for Mohit

1. **Reminders at Start (R01).** May "Start my plan" turn her reminders on, with a line above it naming what will ring and a
   full-size "Start without reminders"? *(Recommended: yes.)* A "your fertile days start tomorrow" note for a woman trying
   for a baby: build it later with the doctor's and safety reviewer's yes, or never? *(Recommended: later.)*
2. **The evening default (R02).** The order fix and the cap of 2 happen either way. Keep your 27 Oct defaults (walk nudge and
   wind-down on), or move to one plan reminder a day, with the other two offered when they help? *(Recommended: keep
   yours for the field test; decide from "reminders that reach her" and "full days per week".)*
3. **Carry on after week 12 by default (R03),** with the reminder limited to 4 more weeks and a one-tap "keep going" at
   month 4? *(Recommended: yes.)*
4. **The plan card's week dots (R08):** keep them but mark only the days she did, or drop them because the week strip already
   marks plan days? *(Recommended: keep, done days only.)* And should the doctor shorten the contraception line?
5. **Tips (R12):** replace tours with one single-step tip at first use (at most 1 a day, none after day 7), keeping the Help,
   menopause-bleeding and "Change stage" pointers and every replay? This changes your 20 Oct "full tour".
   *(Recommended: yes.)*
6. **Badges as a quiet dot on My garden, instead of a burst (R13)?** *(Recommended: yes.)*
7. **The check-in (R10):** untouched steps count as "Not today", so Save never refuses? *(Recommended: yes.)* The fasting
   card for women who aren't pregnant or breastfeeding is the doctor's call.
8. **Day 1 (R11).** R11a now: the plan from "Your Sakhi", and no first-log card when she gave dates. This reverses Version
   39.10's "diary first". R11b after the field test: 2 plan cards plus the doctor card. *(Recommended: R11a yes; R11b
   after the field test.)*
9. **Reversals.**
   - My plan's steps read-only and folded from day 1 (R21, reverses Version 39.19)?
   - The Diary in 2 tabs (dropped for now; Versions 39.17 and 39.18)?
10. **The free government doctor.** Does your 27 Oct rule ("let it be in Explore") also cover:
    - the 12-week end page (R16);
    - the plan's doctor sheet (R21);
    - Help's "See a doctor" path (R25)?

    *(Recommended: keep it on those pages unless you extend the rule. It's the only free doctor option there.)*
11. **Sign-up (R24):** move email, "How did you hear" and the update switches to week 2? It may cost Qura some answers.
12. **Help by stage** (left out of this set): show her stage's danger pictures first, and the other stages behind a tap?
    That changes "the same text for everyone", so it's the doctor's call. It stays out unless you say yes.
13. **Measuring.**
    - Read the server's daily-use and weeks-later queries weekly?
    - A coordinator-only "Field-test numbers" screen that never sends anything?
    - Optional new keys in the opt-in monthly counts (needs a SERVER_SPEC change)?
14. **Order and budget.** Build Phase 1 now as V39.27, then wait for field-test numbers before Phase 2? One phase per session
    fits your weekly usage budget.

## Appendix A. Dropped ideas, and why

| Idea | Why it's out | Reviewers |
|---|---|---|
| "Done" and "Not today" buttons on the notification (R26) | Large build: a new receiver, a queue the app reads, the 4 am rule, tests on Android 10–15. Small reach: buttons only with notification words on, which is off by default (`app.js:4707`) and never on a shared or discreet phone. "Done" would have to mean every step, which inflates her results. It also removes the app open that carries "Sakhi says" and Wind down. Revisit after the field test | Build reviewer: drop. Value reviewer: keep, with strict limits (none in pregnancy, in the 6 weeks after a birth, on days with a check step or a daily safety question, or with the app lock on) |
| Moving "Change stage" off Today (R08 item 5) | A safety-review decision (SAFETY-03) with its own tests, and moving it saves one small link | Value: drop. Build: hold for the safety reviewer |
| The week look-back only in the morning (R08 item 7) | Hides it from women who open Sakhi only in the evening; it's already one line | Build: drop. Value: keep |
| Hiding "Missed period" from a woman trying for a baby (R18 item 4) | Breaks the rule that abortion information sits under Explore > Missed period in every stage but pregnancy (MODULE_API.md:3572-3574; `joining.mjs:86`). It also holds the pregnancy-test guidance she needs most | Build: drop. Value: no objection |
| Code filled in automatically by SMS (R24 item 6) | Needs Google Play services and a new build system (`android/build-apk.sh:112-119`), a download you'd have to approve. Codes go by WhatsApp first, and the field already offers the phone's own fill-in (`app.js:2177`) | Both: drop |
| Moving the notes meter off Today (R13) | Already done (`app.js:1914`) | Both |
| Marking the plan offer "first" (R06 shortcut) | Puts the plan above the doctor (`app.js:2335`) | Both |
| A second doctor row in Help (R25) | Duplicates "See a doctor", and puts a paid partner's call next to 112 | Both |
| "A second tap means Partly" (R10) | A hidden third state; new users won't find it, and screen readers announce it poorly | Both |
| "All fine today" saving normal answers for every group (R14) | Writes answers she never gave into her record and her doctor's report | Both |
| "Only her goal's questions" and "no monthly page for regular cycles" (R17) | Removes screening (bleeding after sex, burning, pain during sex) and the only path to the 14416 line | Both |
| The Diary in 2 tabs (R23) | Days and the calendar's chips were built on 26 Oct with your approval; moving Days makes a long page longer | Build: keep 3 tabs. Value: 2 tabs, with "All notes" under My cycles |
| "After 3 unanswered reminders, ask once" (R02) | The two-quiet-weeks ask (`plan.js:2658`) and "Welcome back" (`plan.js:2326`) already do this | Build: drop. Value: keep a stricter version |
| A fertile-days notification for a woman trying for a baby (R01) | A new kind of notification: new words and a shared-phone review. Deferred, not refused (decision 1) | Build: defer. Value: allow with limits |
| A home-screen widget | One more place to look, and a risk on shared phones. If ever: opt-in, wordless, never on a shared phone | Not recommended now |
| A weekly 60–90 second voice note in Dr. Megha's voice (from the research) | Promising (Kilkari), but it's new spoken health content: new recordings and the doctor's review. An idea for after the field test | Not in this set |
| Picking her own time for each step from picture chips (from the research) | Habits she chooses herself are stronger (Singh 2024), but it adds a question at joining. An idea for after R11b | Not in this set |

### Claims corrected while checking

So you can trust the numbers above, here is what the reviewers corrected in the first draft.
- The notes meter already hides on Today while a plan runs (`app.js:1914`). Day 90's "Noted on 1 of 23 days" showed only
  because her plan had ended.
- The recovery check already saves a normal day in 2 taps ("None of these", then Save, `post.js:913`). The form invites
  more.
- "Start, then Allow" would have been 3–4 taps on Android 14 and newer, because the code chains the alarm sheet
  (`app.js:4773`). R01 removes the chain.
- Pregnancy's due item is a check step, not a link (`progs/v1.js:24`, `plan.js:1454`). The effect is the same.
- The after-birth plan already has a carry-on, to the baby's first birthday (`plan.js:148-149`).
- The end page's result is folded only for plans with no result line (`plan.js:1872-1886`).
- Wind down's voice already follows the language, and the timer already starts at 30 minutes (`calm.js:29-30`).
- The reminders list already shows every reminder with its switch (`tools.js:267-290`). The heads-up card already has
  "Remind me" (`app.js:2519-2530`).
- Three evening rings happen only on evenings she ignores the first one (`plan.js:173`, `:2486`, `:2526`). The real bug is
  the order.
- The tracker survey was misquoted. In Hong 2024, 62.3% is the share of the 692 women who use a tracker app; 85% of those
  app users use it to predict their next period. Checked at the source.
- A new bug, found by the value reviewer: "All counted. Just save." shows while the recovery check still says "Do it now"
  (video post 103.5 s; `plan.js:2020`, `:2048`). It's in R10.

## Appendix B. The measured taps

Priya, plan day 10, at 390 × 844 unless noted. The "after" column assumes the recommendation named.

| Job | Today | After | Lowest possible |
|---|---|---|---|
| 1. Log that her period started | 1 tap, first screen (also at 360 × 800) | 1 (keep) | 1 |
| 2. Note how she feels (one of five) | 1 tap + 1 scroll (chips 813 pixels down; 848 at 360 × 800; 856 in Hindi). Through the round button: 3 taps, or 6 the first time with the day-page tour | 1 tap, no scroll (R08) | 1 |
| 2b. Note a sign not in the five (headache) | 3 taps + 1 scroll (6 the first time) | 3 taps, no scroll, no tour (R08, R12) | 2 |
| 3. Tick a plan step | 1 tap | 1 | 1 |
| 4. Evening check-in from Today, nothing ticked | 3 taps + 1 to leave the page (+1 scroll at 360 × 800). Neha: 4 taps + 2 scrolls | 1–2 taps, no page to leave (R10, R08) | 1 |
| 4b. Check-in from the 8 pm notification | 2 taps (Neha: 3 + 1 scroll), and only if she tapped "Allow reminders" | 2 taps, and it rings for every plan starter (R01, R10) | 1 (notification buttons, dropped for now) |
| 5. See her next period | 0 | 0 | 0 |
| 6. See her fertile days (Neha) | 1 tap + 1 scroll; Cycles says only "On your calendar" | 0 (R15) | 0 |
| 7. Find danger signs | 2 taps | 2, and on every joining screen (R07) | 1 |
| 7b. Call 112 | 3 taps | 2 (R07) | 2 |
| 8. Ask a Qura doctor | 5 taps + typing + 2 scrolls, 3 screens | 5 taps, no typing; 4 with a direct path; about 3 from a card with a topic (R25) | 3 |
| 9. Wind down at bedtime | 4 taps + 1 scroll (+3 with Explore's tour) | 1 tap (R19) | 1 |
| 10. Fix a wrong start date | 5 taps + 1 scroll | 3 taps (R25) | 2 |
| 11. Open her report for the doctor | 3 taps + 2 scrolls | 2 taps (R15) | 2 |
| 12. Joining to her first plan step (the tour path) | 44 taps, 23 screens, 3 tips, 7 scrolls, 27 characters typed | About 37 and 20, 1 tip (R11a); about 31–33 and 17–18 (with R11b) | About 23 |
| 12b. The same, skipping the tour | 43 taps, 23 screens | As 12 | About 23 |
| 12c. The shortest path today (Start on "Your Sakhi") | 38 taps, 20 screens, 1 tip | Becomes the main path (R11a) | About 23 |
| 12d. Joining, PMOS (Asha) | 47 taps, 24 screens | About 41 (R11a); about 33–35 (with R11b) | About 23 |
| 12e. Joining, trying for a baby, 7 dates (Neha) | 52 taps, 22 screens (20 taps on the dates) | About 34–40, depending on how many dates she adds (R11b) | About 24 |
| 12f. Joining, tracking only (Meena) | 28 taps, 14 screens | About 24 (no first-log card, 1 tip) | About 16 |
| Interruptions, week 1 | 11 tip taps with a plan, 16 without, 12 for Neha; 2 badge bursts; about 13–14 toasts; 6 more tips on later first visits | At most 1 a day; no bursts; toasts only for saves with Undo (R12, R13) | none |

**Joining, in detail (Priya).** 33 questions are shown, and about 20 are answered by taps.

The estimated time adds 1.5 seconds per tap, typing time and 30 seconds for the code:
- about 12.6 minutes at 150 words a minute;
- about 17.9 minutes at 100 words a minute.

The recorder took 113 seconds.

## Appendix C. Where the reviewers disagreed

| Item | Value and safety reviewer | Build reviewer | This audit |
|---|---|---|---|
| R02, the evening default | One plan reminder by default; the nudge and wind-down offered when they help | Keep your 27 Oct defaults; fix the order and the spacing | The agreed fix now; the default is decision 2 |
| R02, "3 unanswered" | Keep a stricter version | Drop | Dropped |
| R01, a fertile-days note | Allow, with limits and the doctor's review | Defer | Deferred (decision 1) |
| R07, Help during joining | Keep as written | Only the rows that open sheets work then | Sheet rows only, until the pages can open |
| R08, "Change stage" | Drop the move | Hold for the safety reviewer | Stays on Today |
| R08, the look-back only in the morning | Keep | Drop | Dropped |
| R10, "What got in the way" | Whenever a step is missed | Only when 2 or more are | As now, optional |
| R12, tips | Single-step tips at first use, plus the safety pointers | Retire automatic tours | The value reviewer's version |
| R14, the after-birth check | Save only "No warning signs" | One bleeding tap, then "All fine" | Both: the bleeding tap and "No warning signs" |
| R18, the missed-period topic | No objection | Drop the hiding | Dropped; optional retitle |
| R23, the Diary | 2 tabs, "All notes" under My cycles | Keep 3 tabs | 3 tabs |
| R25, the doctor path | Keep the "See a doctor" page | Open the form directly | Chips now; the direct path is decision 10 |
| R26, notification buttons | Keep, with strict limits | Drop | Dropped for now |

## Appendix D. Sources

**Apple and Google design guidance**
- Apple, design principles (2026): https://developer.apple.com/tutorials/data/design/human-interface-guidelines/design-principles.json
- Apple, designing for iOS: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/designing-for-ios.json
- Apple, onboarding: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/onboarding.json
- Apple, settings: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/settings.json
- Apple, notifications: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/notifications.json
- Apple, managing notifications: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/managing-notifications.json
- Apple, activity rings: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/activity-rings.json
- Apple, motion: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/motion.json
- Apple, feedback: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/feedback.json
- Apple, offering help: https://developer.apple.com/design/human-interface-guidelines/offering-help
- Apple, writing: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/writing.json
- Apple, widgets: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/widgets.json
- Apple, WWDC17 session 802 (essential design principles): https://developer.apple.com/videos/play/wwdc2017/802/
- Apple Watch, pausing rings: https://support.apple.com/en-bw/guide/watch/apd29b30023c/watchos
- Apple, cycle tracking: https://support.apple.com/en-us/HT210407
- Android, notification permission: https://developer.android.com/develop/ui/views/notifications/notification-permission
- Android, building a notification: https://developer.android.com/develop/ui/views/notifications/build-notification
- Android, widgets: https://developer.android.com/design/ui/mobile/guides/widgets
- Google, SMS User Consent: https://developers.google.com/identity/sms-retriever/user-consent/overview

**Habits, prompts, rewards and engagement**
- Fogg behaviour model: https://behaviormodel.org/ and https://behaviormodel.org/prompts/
- Singh et al. 2024, time to form a health habit: https://pmc.ncbi.nlm.nih.gov/articles/PMC11641623/
- Lally et al. 2010, habit formation: https://doi.org/10.1002/ejsp.674
- Yardley et al. 2016, effective engagement: https://ueaeprints.uea.ac.uk/id/eprint/62088/
- Perski et al. 2017, engagement: https://pmc.ncbi.nlm.nih.gov/articles/PMC5526809/
- Eysenbach 2005, the law of attrition: https://pmc.ncbi.nlm.nih.gov/articles/PMC1550631/
- Bell et al. 2023, daily notifications (micro-randomised trial): https://pmc.ncbi.nlm.nih.gov/articles/PMC10337295
- Bidargaddi et al. 2018, tailored push and self-logging: https://pmc.ncbi.nlm.nih.gov/articles/PMC6293241
- Pielot et al. 2014, notifications in daily life: https://ic.unicamp.br/~oliveira/doc/MHCI2014_An-in-situ-study-of-mobile-phone-notifications.pdf
- Nahum-Shani et al. 2018, just-in-time support: https://pmc.ncbi.nlm.nih.gov/articles/PMC5364076
- Mazeas et al. 2022, gamification and activity: https://pmc.ncbi.nlm.nih.gov/articles/PMC8767479/
- Silverman and Barasch 2023, streaks: https://www.colorado.edu/business/news/2023/04/20/research-streaks-marketing-tech-barasch
- NN/g, mobile tutorials: https://www.nngroup.com/articles/mobile-tutorials/
- NN/g, the peak-end rule: https://www.nngroup.com/articles/peak-end-rule/
- NN/g, a theory of user delight: https://www.nngroup.com/articles/theory-user-delight/
- Hick's law: https://lawsofux.com/hicks-law/
- Baumel et al. 2019, real-world use of mental-health apps: https://pmc.ncbi.nlm.nih.gov/articles/PMC6785720
- Retention benchmarks (Phiture): https://phiture.com/mobilegrowthstack/managing-retention-rate-benchmarks-and-expectations/
- Peng et al. 2023, guilt appeals: https://pmc.ncbi.nlm.nih.gov/articles/PMC10568480
- Sirois et al. 2015, self-compassion and health behaviour: https://pubmed.ncbi.nlm.nih.gov/25243717/
- Confirmshaming: https://www.deceptive.design/types/confirmshaming
- UbiFit Garden: https://www.consolvo.org/ubifit

**Period tracking**
- Epstein et al. 2017, examining menstrual tracking: https://pmc.ncbi.nlm.nih.gov/articles/PMC5432133
- Epstein et al. 2015, lapses in tracking: https://my.eng.utah.edu/~cs5540/au16/readings/PersonalInformatics-Epstein2015.pdf
- Hong et al. 2024, women's use of period-tracking apps: https://pmc.ncbi.nlm.nih.gov/articles/PMC11502972/
- Levy and Romo-Avilés 2019, period-tracking apps: https://pmc.ncbi.nlm.nih.gov/articles/PMC6724299/
- Choe et al. 2017, semi-automated tracking: https://users.ece.utexas.edu/~ethomaz/papers/j1.pdf

**India, literacy and shared phones**
- Medhi et al. 2011, low-literacy users: https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/ToCHI2711_Medhi.pdf
- Sambasivan et al. 2018, privacy on shared phones in South Asia: https://www.usenix.org/conference/soups2018/presentation/sambasivan
- IAMAI–Kantar 2024, internet in India: https://www.theweek.in/wire-updates/business/2025/01/16/dcm51-biz-iamai-internet-usage-report.html
- Kilkari randomised trial: https://pmc.ncbi.nlm.nih.gov/articles/PMC9288869/
- GSMA Mobile Gender Gap Report 2025: https://www.gsma.com/newsroom/press-release/progress-closing-the-mobile-internet-gender-gap-stalls-in-lmics-gsma-mobile-gender-gap-report-2025
- Health pictograms and low literacy: https://hsag.co.za/index.php/hsag/article/view/2192

**Sakhi's own documents**
- `docs/home-plan-diary-audit-2026-10-26.md`, `docs/diary-audit-2026-10-26.md`, `docs/first-days-audit-2026-10-24.md`
- `docs/ux-gaps-2026-10-24.md`, `docs/insights-audit-2026-10-27.md`, `docs/myplan-and-sleep-advice-2026-10-26.md`
- `docs/notifications-audit-2026-10-23.md`
- `web/MODULE_API.md`, sections 39 to 69
- `server/SERVER_SPEC.md`, sections 5.4, 5.9, 7 and 10.1
