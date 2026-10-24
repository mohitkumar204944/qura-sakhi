# Her first day with Sakhi: audit, research and the fix (24 Oct 2026)

Mohit, 24 Oct, after using 0.37-pilot on his phone:
> "I still see some gaps can you properly audit i just entered details while onboarding and i am straight on to program, i
> felt i am not sure whats happening my expectations were not set etc. etc. can you research and advise how this can be
> improved for a better experience"

What I took from it: the questions work, but the moment between "I answered" and "I'm in a 12-week plan" doesn't. Nobody tells
her what will happen each day, what Sakhi will do, what she must do, or when she'll see anything. Then her first day buries
the plan under other things.

**Status, 24 Oct:** built as Version 37.1, with Mohit's four decisions (section 10): sign-up stays before the plan; all
three steps from day 1; Dr. Megha's player now, her recording later; one day-3 card. The contract is `web/MODULE_API.md`,
section 40, and the tests are `web/test/firstday.mjs`. The new wording waits for the doctor (`docs/wording-review-v28.md`,
section 15). Not in an APK yet.

This was research and advice when written. Other apps are described by their principles only (Mohit's rule).
Measurements come from `0.37-pilot` on a 390 px phone screen, 24 Oct: a new woman joining (Mohit's own example: periods 36
to 45 days apart, some months skipped), plus Mohit's actual path, an existing diary that changes its goal in My plan. The
walk is `web/test/firstday-walk.mjs` (screens to `web/test/shots/firstday/`), so the same walk can be measured again
after the fix.

---

## 0. The answer on one page

**Why it felt like being dropped into a programme:**
1. **The promise changes halfway.** The welcome screen says "Your period diary" and "Start my diary". The word "plan" first
   appears at question 7. Nothing says how long joining takes, or that a 12-week plan comes at the end.
2. **The plan starts silently, and its "Start" button means something else.** The plan begins the moment she answers the
   last question: Today already shows "Week 1 of 12 · 0 of 3 done". The big "Start today" button only turns on a reminder.
   If she leaves the plan screen, as Mohit did, Today shows the plan as running while a folded card still says "Your plan is
   ready · Start today".
3. **The plan screen describes results, not her days.** It never mentions the evening check-in, the reminder, how long
   each day takes, what happens if she misses a day, the week-4 look-back, or that she should keep noting her periods.
4. **Her first minute is crowded.** Within two seconds of "Start today" come a petal toast, a reminders sheet ("this
   reminder won't ring", about a reminder nobody mentioned), a 3-step tip about the week strip, and a "New badge" pop-up on
   top of it. The first "Sakhi says" card is free check-ups (or, on Mohit's phone, "Spotting between periods"), not her
   plan.

**The fix, in one line: tell her, show her, let her choose, then start.**
- At the door: say what Sakhi will do and how long joining takes.
- Before the plan: show what she told Sakhi, so she sees she was heard.
- The plan screen becomes 4 short cards: her goal, her 3 steps (with why), **how each day works**, and **what happens
  when**.
- She chooses when to start (today, tomorrow or Monday) and her check-in time, and Android's reminder permission is asked
  right there, with the reason.
- Her first day is protected: only her plan, one tip, and the evening check-in. Everything else waits 3 days unless it's
  urgent.
- The first week is scripted: day 1, day 2, day 3, day 7.

Size: medium (one version, "V37.1"). The new wording needs doctor review, like section 14 of the wording review.

---

## 1. What I measured

**A new woman, 0.37-pilot (Android, 390 px):**

| Part | Screens | What it tells her about what comes next |
|---|---|---|
| Language, welcome | 2 | "Your period diary, in your language"; "Start my diary". No plan, no time. |
| Age, stage, last period | 3 | Nothing. A 9-segment progress bar with no labels. |
| "What do you want to work on first?" | 1 | "Sakhi builds your plan around it": the first mention of a plan. |
| Her periods; her day; when she can move; her body | 4 | One line ("So your plan fits your life"). 4 to 5 questions a screen, 1.3 screens long. "When should Sakhi remind you?" comes before she knows there's a check-in. |
| Shared phone | 1 | Nothing. |
| Sign-up (number, code, details) | 3 | Nothing about the plan. The app's tabs already show behind it, with My plan lit. |
| The plan screen ("Here's your plan, Riya") | 1 | 197 words, 2.1 screens, 5 parts. Results by month, not her routine. |
| Today | 1 | 4 interruptions in 2 seconds (above). |

- **14 screens before she sees her plan** (11 for joining, 3 for sign-up), about 27 taps and 4 typed fields, roughly 3 to 4
  minutes. The length is fine; the story isn't.
- **The plan screen, word by word:** no "check-in", no "evening", no "remind", no "miss", no "look-back", no "note your
  periods". It says "3 to 6 months: periods may start to come more regularly". That's honest, but the plan is 12 weeks long
  and nothing explains the difference.
- **What she's told versus what she gets:** the plan screen lists three things: walking from 10 minutes, one food change
  every two weeks, and a bedtime. My plan then shows a weekly minutes ring ("10 of 50 minutes"), "Strength days: 0 of 1",
  "Cycle care yoga · 8 min", a plate checklist, "My body" and "My progress". None of those were mentioned.

**Mohit's path (an existing diary, PMOS plan going, My plan > Change what I work on):**
- The questions, then the plan screen, then he tapped Today instead of "Start today".
- Today: "My PMOS plan · Week 1 of 12 · 0 of 3 done today", three steps with Done buttons, and a "How did today go?"
  button. So the plan looks started.
- "Sakhi says" shows "Spotting between periods", with a tip pointing at it ("Sakhi noticed something"). The plan's own
  card ("Your plan is ready · Start today") is folded third under "More from Sakhi (3)", after free check-ups.
- In the code, the plan starts when the last question is answered; "Start today" only turns on the daily reminder.

---

## 2. The gaps, in order

**P0: break the companion promise on day 0**
1. **The welcome promises a diary, not a companion.** "Your period diary", "Start my diary". The plan is a surprise.
2. **The plan's state is unclear.** It starts silently at the last question; "Start today" only sets a reminder; leaving
   the plan screen leaves her in a running plan she never started.
3. **No process expectations.** The plan screen says what may change, not what she'll do each day, what Sakhi will do,
   how long it takes, or what a missed day means.
4. **Four interruptions in her first two seconds**, none about her plan. The badge text reads "Earn your first petal" just
   after she has earned it.
5. **Her plan isn't first on her first day.** The top "Sakhi says" card is free check-ups or a diary note; the plan's
   card can be folded.

**P1: cause doubt in week 1**
6. **The plan screen and My plan describe different plans** (minutes a week, strength days, yoga, plate, body, progress).
7. **Sign-up breaks the story.** Three screens with no link to her plan, after twelve screens of questions; the tabs show
   behind it.
8. **"More than a month ago" saves no date.** That's the likely answer for exactly the women this plan is for (40 to 45
   days, months skipped). Today then asks "Log the day your last period started" again, and results have no starting
   point.
9. **Questions without reasons.** "When should Sakhi remind you?" — remind her of what? Most screens ask 4 or 5 things with
   no word on why.
10. **The doctor check reads like a gate.** "First, one check" with two buttons that leave the plan screen. It doesn't say
    she can start her habits today and book the check within a few weeks.
11. **"How did today go?" from the first minute**, on the morning of day 1, before she has done anything.
12. **No word to women who update.** Mohit's phone changed tabs, Help moved and Care became Explore, with no "what's new".

**P2: polish**
13. Starting at 1 am: "Good morning", today's walk "after dinner" 19 hours away, and no choice to start tomorrow.
14. The progress bar has no labels and no time.
15. The plan's name follows PMOS when she has it ("My PMOS plan") even when she chose "Irregular or late periods". That's
    right clinically, but the plan screen should say why.

---

## 3. What the research says

| Principle | Evidence | What it means for Sakhi |
|---|---|---|
| Clear, process-oriented expectations, set with her | Supportive accountability (Mohr, Cuijpers & Lehman 2011): adherence improves with "clear, process-oriented expectations that the patient is involved in determining", and with benefits made explicit | Say what she does and what Sakhi does each day, and let her choose the start and check-in time |
| Tell people what will happen, step by step | Sensory and procedural preparatory information reduces distress (Suls & Wan 1989, meta-analysis); later reviews call the evidence supportive but tentative | "How each day works" and "What happens when" cards, before she starts |
| Session 1 of good lifestyle programmes is about the programme itself | CDC National DPP Lifestyle Coach guide, session 1: the programme's organisation and goals, what's expected of participants and of the coach, and how to self-monitor | Our session 1 is the plan screen: it has to do the same job |
| Outcome expectations: honest, and about her own data | Dalle Grave et al.: higher expected loss predicted dropout in 2005 (1,785 patients); a 2015 study found the reverse. The evidence is mixed | Keep "different for every woman"; promise a fair comparison with where she started, never a percentage |
| "When and where" plans | Implementation intentions, d = 0.65 across 94 tests (Gollwitzer & Sheeran 2006) | Her walk "after dinner" and her check-in at 8 pm, confirmed back to her in her words |
| Starting fresh | Temporal landmarks (a new week, month or year) increase goal pursuit (Dai, Milkman & Riis 2014) | Offer "Start on Monday" or "Start tomorrow", not only "now" |
| Ask for permission in context | Android's own guidance: request the notification permission in context, so it's clear what the notifications are for and why to opt in | Ask on the "Start" screen, with the reason ("so the 8 pm check-in reaches you"), not as a sheet on Today |
| Fewer pop-ups | NN/g: overlays are disliked, usually appear at the wrong time, and one study participant abandoned a task after several popups in a row | One thing at a time on day 1 |
| Tutorials don't teach; context does | NN/g: 70 users and 4 apps; users who read deck-of-cards tutorials found tasks harder and were no faster or more successful. Contextual "pull" help works better | One tip on her plan, when it's on screen, not a tour of the week strip |
| Value before sign-up | Gradual engagement (Wroblewski): show what the service does and why it's worth it before the form | "Save your plan to your number", after she has seen it |
| Reasons must name a real benefit | Justifications that advertised weak benefits made users withhold data (Knijnenburg & Kobsa 2013) | "Why we ask" lines say exactly what Sakhi does with the answer, or say nothing |
| Guide through a sequence | Persuasive System Design: tunneling and reduction (Oinas-Kukkonen & Harjumaa 2009) | A clear path from the last question to the first step, with nothing else on it |
| One step or three? | Sequential versus simultaneous change is unresolved for diet and activity (James et al. 2016, six direct trials) | Let her choose: all three steps, or start with the walk and add the rest in week 2 |
| Guided onboarding alone isn't enough | In a 2026 JMIR mHealth study, assisted onboarding raised installs (15 of 15 versus 10 of 16) but not later use; adherence was 27% | Expectations get her started; the daily loop and the people behind it keep her going |

---

## 4. How good programmes set expectations (principles only)

- **A beginner running programme (NHS Couch to 5K):** the whole shape is told up front: 9 weeks, 3 runs a week, what
  week 1 looks like. A coach's voice guides each session. Repeating a week is normal.
- **A diabetes prevention lifestyle programme (CDC National DPP):** the first session is about how the programme works,
  its two goals, and what the participant and the coach will each do, before any change starts.
- **Language-learning apps:** she picks a daily goal (how many minutes) before the first lesson. The first lesson starts
  right away, and the reminder is tied to the time she picked.
- **Meditation apps:** a short first course with a fixed number of days, and the daily reminder chosen with its reason.
- **Weight-management apps:** before the plan, a summary of her answers ("this is you"), so the plan feels made for her,
  and the time it asks for each day.
- **India's Kilkari messages for pregnant women:** a fixed weekly rhythm, about 90 seconds a call, in one trusted voice
  ("Dr Anita"). She always knows when the next one comes.

The common thread: before day 1, people are told **the shape** (how long, how often, how much time), **the daily routine**
(what they do, what the programme does), **the milestones** (when they'll see progress), and **what to do if they slip**.

---

## 5. Her first day, redesigned

New health wording below needs doctor review before it ships. The sample screens were shown in chat.

**5.1 The welcome (app.js, hello screen)**
- Title: "Your period diary, and a plan made for you"
- Three lines:
  - "Tell Sakhi what you want to work on. Get a 12-week plan."
  - "Small steps each day, and a 1-minute check-in each evening."
  - "Your diary stays on this phone. Free. No ads."
- Button: "Start · about 3 minutes" ("Just read" stays).

**5.2 Joining**
- A labelled progress bar in 3 parts: **About you · What you want · Your plan**.
- "When did your last period start?": **"More than a month ago"** asks "About how long ago?" (5 to 6 weeks · about 2 months ·
  3 months or more · pick a date), saved as a guess, the way "3 to 4 weeks ago" already is.
- One "why we ask" line per screen, only where it names what Sakhi does with the answer:
  - her periods: "So Sakhi knows where you're starting, and can show you what changes."
  - her day: "So your steps fit your day."
  - when she can move: "Sakhi puts your walk at this time each day."
- **The reminder time moves** to the Start screen (5.5), after she knows what the check-in is.
- **A summary, last:** "Here's what you told Sakhi" (gaps, skipped months, signs; her day; her walk time), with Edit, then
  "Make my plan".

**5.3 The plan, in 4 cards (replaces the long plan screen; one idea per card, Next and Listen on each)**
1. **"Your plan is ready, Riya":** her goal, "Made from what you told Sakhi: …", and "12 weeks · from about 10 minutes a day".
2. **"Your 3 steps":** each step with its one-line reason (the reviewed lines from wording-review §14.6), and how it grows
   (walk 10 to 30 minutes; one food change every two weeks; bedtime moves 30 minutes at a time).
3. **"How each day works":**
   1. Today shows your steps.
   2. Tap Done when you do one.
   3. At 8 pm Sakhi asks "How did today go?" It takes a minute.
   4. Sakhi tells you what it did for you.

   "Missed a day? Nothing to catch up. Just start again."
4. **"What happens when":**
   - Every week: a look-back.
   - Week 4: your first month.
   - Week 12: your results, compared with where you started.

   "Periods often take 3 to 6 months to change. Keep noting them: that's how Sakhi sees the change. It is different for
   every woman."

Only when her answers need it, a 5th card: **"Alongside your plan: one doctor check"**. "Periods that skip months need one
check: thyroid, prolactin and PMOS. You can start your steps today. Book the check in the next 3 weeks; Sakhi will remind
you." Buttons: "Find a free doctor" (opens over the card and comes back), "Remind me".

My plan's extra parts (yoga, strength days, the plate, body, progress) are named on card 2 as "and in My plan: yoga, your
plate, your progress", or held back until week 2, so what she's told matches what she gets.

**5.4 "Save your plan" (sign-up, same rules)**
- Every woman still signs up (Mohit's rule). It just comes after card 1, framed as **"Save your plan to your number"**.
- Same screens, same server. One new line: "Your diary and your plan stay on this phone. Qura gets only your account
  details."
- No tabs behind it.

**5.5 "When do you want to start?" (the commitment screen)**
- Start: **Today · Tomorrow · Monday** (after 9 pm the default is tomorrow).
- "Sakhi checks in at [8 pm]" (her choice of times).
- "Allow reminders" opens Android's permission dialog right here, with the reason: "So the 8 pm check-in reaches you. It
  says only 'Your plan for today'."
- One choice that the research leaves open: **"Start with all 3 steps"** or **"Start with the walk; add the others in
  week 2"**.
- The button "Start my plan" is the only thing that starts the plan: its first day, its steps on Today and its reminder.

**5.6 Day 1 on Today**
- The plan's card is first in "Sakhi says" for the first 3 days: "Day 1. Your first step: walk after dinner. At 8 pm, a
  1-minute check-in." Screening, setup and heads-up cards wait 3 days. Urgent and safety cards never wait.
- One tip, on her plan card (the existing "Your plan for today" tip), not the week strip.
- No petal toast or badge until her first check-in; the petal is the check-in's reward.
- "How did today go?" appears from 5 pm, or after her first Done.
- If she chose tomorrow: "Your plan starts tomorrow. Your first step: walk after dinner." No steps yet.
- A plan that hasn't been started shows one top card, "Your plan is ready: see it and start", and no steps.

**5.7 The first check-in**
- First time only: "This takes a minute. Your answers stay on this phone."
- After saving: what the habit did for her (as now), then "Tomorrow: the same steps. See you at 8 pm."

---

## 6. Her first week

| Day | On Today | Notes |
|---|---|---|
| 1 | "Day 1. Your first step …" and the 8 pm check-in | As 5.6 |
| 2 | "Day 2. Yesterday: 2 of 3. Same steps today." | One line in the plan's card |
| 3 | "3 days in. Small steps add up." Now the other cards can show | Optional, Mohit's decision (section 10): "Questions about your plan? Ask Qura to call you" (the existing hand-off, which shares only what she ticks) |
| 4 to 6 | The usual Today | The fresh-start card after 3 quiet days (exists) |
| 7 | "Your first week: 5 of 7 days" and the week's look-back (exists) | Then week 2's new food step is named |

---

## 7. Women who already use Sakhi, and goal changes

- **After an update, once:** "What's new in Sakhi":
  - "Sakhi can now make you a 12-week plan for what you want to work on."
  - "Home is now Today, Care is now Explore, and Help is at the top of every screen."
  - Buttons: "See my plan" or "Later".
- If she already has the V35 PMOS plan: "Your PMOS plan carries on. You can change it in My plan."
- **Changing the goal:** the old plan keeps running until she presses "Start my plan" on the new one. The cards say:
  "Your new plan replaces your PMOS plan when you start it. What you logged stays."

---

## 8. Build plan: V37.1, "her first day"

| Change | Where | Size |
|---|---|---|
| Welcome promise and time; labelled 3-part progress | `app.js` (`renderWelcome`, `renderOnboard`) | S |
| "More than a month ago" follow-up, saved as a guess | `app.js` (`renderOnboard` step 3) | S |
| "Why we ask" lines; the reminder time moves to the Start screen | `mods/plan.js` (`SCREENS`, `Q`, `qsOf`) | S |
| "Here's what you told Sakhi" summary | `mods/plan.js` (intake end) | S |
| The plan as 4 or 5 cards, viewable before sign-up | `mods/plan.js` (`renderReveal`); core gate lets the preview through | M |
| "Save your plan" framing for sign-up | `app.js` (sign-up copy when a plan preview exists) | S |
| The Start screen: day, check-in time, permission in context, all or one step | `mods/plan.js`; `S.alerts.ask` | M |
| The plan starts only on "Start my plan" (pending state) | `mods/plan.js` (`startFromIntake`, `packOf`, `todayHead`, `planCard`, `renderMyPlan`, the goal-change flow) | M |
| Day 1 to 3: the plan first; other cards wait; one tip; petal after the first check-in; check-in button timing | `app.js` (slot order), `mods/joy.js`, tours | S |
| First check-in lines; day 2 and 3 lines | `mods/plan.js` | S |
| "What's new" once for updating women | `app.js` | S |
| Greeting after midnight; a start after 9 pm defaults to tomorrow | `app.js`, `mods/plan.js` | S |

**Acceptance criteria (tests in `web/test/companion.mjs`):**
1. The welcome names the plan, the daily steps, the evening check-in and "about 3 minutes".
2. "More than a month ago" asks how long ago and saves a guessed date.
3. Before her plan she sees what she told Sakhi, and can change it.
4. The plan cards say what she does each day, how long it takes, when Sakhi checks in, what a missed day means, and what
   she sees at weeks 1, 4 and 12. No percentage anywhere.
5. Until "Start my plan": no plan steps on Today, no week count, and the top card is "Your plan is ready".
6. On "Start my plan" the reminder permission is asked on that screen, and Today opens with at most one tip and no other
   pop-up.
7. Days 1 to 3: the plan's card is first in "Sakhi says"; screening, setup and heads-up cards wait; urgent cards don't.
8. "Tomorrow" makes tomorrow day 1, and Today says so.
9. A woman updating from 0.36 sees "What's new" once.
10. A goal change keeps the old plan until the new one starts.
11. Hindi for all of it, a 360 px screen, discreet mode (no health words in the plan cards), and no page errors.

---

## 9. How we'll know it works (field test, 8 to 10 women)

- **Right after joining, ask three questions** (comprehension). Target: 8 of 10 answer all three.
  - "What will Sakhi ask you tonight, and when?"
  - "How long will your plan take each day?"
  - "When will you first see how it's going?"
- **Start:** 9 of 10 press "Start my plan". Note how many pick today, tomorrow or Monday.
- **Day 1:** 8 of 10 check in on their first evening (already a target in the companion doc, section 11).
- **Feel:** "I knew what to expect" scores 4 of 5 or higher at the week-1 call.
- **Watch for:** anyone who says "I didn't know it would…": that's a gap in the cards.

---

## 10. Decisions for Mohit

1. **Sign-up after the plan preview ("Save your plan").** Every woman still signs up; she sees her plan first. Recommended.
2. **Day 1 steps:** all three, or the walk first with the others in week 2? The evidence is open. Recommended: her choice,
   with all three as the default.
3. **A 30-second welcome from Dr. Megha** (audio, Hindi and English) on the "How each day works" card. No new spend, but it
   needs her to record it, and the doctor review covers it.
4. **A day-3 offer of "Ask Qura to call me"** for questions about the plan (the human support in Mohr's model). It uses the
   existing hand-off, and she chooses what's shared.

---

## Sources

- Mohr DC, Cuijpers P, Lehman K. Supportive accountability: a model for providing human support to enhance adherence to
  eHealth interventions. J Med Internet Res 2011;13(1):e30. https://www.jmir.org/2011/1/e30/
- Suls J, Wan CK. Effects of sensory and procedural information on coping with stressful medical procedures and pain: a
  meta-analysis. J Consult Clin Psychol 1989;57(3):372–379 (as summarised in
  https://www.aped-dor.org/images/diversos/flip/acute_pain/files/basic-html/page269.html).
- CDC National Diabetes Prevention Program, Lifestyle Coach guide, session 1: https://stacks.cdc.gov/view/cdc/146482/cdc_146482_DS1.pdf
- Dalle Grave R et al. Weight loss expectations and attrition (2005, Obesity Research; 2015, Obesity Facts:
  https://doaj.org/article/1ed59b861f674bd7aa6b92ae2db3e965).
- Gollwitzer PM, Sheeran P. Implementation intentions and goal achievement: a meta-analysis. Adv Exp Soc Psychol
  2006;38:69–119. https://kops.uni-konstanz.de/entities/publication/2e749bfb-8533-437c-8203-7e788c910c5f
- Dai H, Milkman KL, Riis J. The fresh start effect. Management Science 2014;60(10):2563–2582.
  https://faculty.wharton.upenn.edu/wp-content/uploads/2014/06/Dai_Fresh_Start_2014_Mgmt_Sci.pdf
- Android Developers. Notification runtime permission. https://developer.android.com/develop/ui/views/notifications/notification-permission
- Nielsen Norman Group. Popups: 10 problematic trends and alternatives. https://www.nngroup.com/articles/popups/ ; Mobile-app
  onboarding tutorials. https://www.nngroup.com/articles/mobile-tutorials/
- Wroblewski L. Sign up forms must die (gradual engagement). https://alistapart.com/article/signupforms/
- Knijnenburg BP, Kobsa A. Making decisions about privacy: information disclosure in context-aware recommender systems.
  ACM TiiS 2013;3(3). https://isr.uci.edu/?p=10
- Oinas-Kukkonen H, Harjumaa M. Persuasive systems design: key issues, process model, and system features. CAIS
  2009;24:28. https://aisel.aisnet.org/cais/vol24/iss1/28/
- James E et al. Comparative efficacy of simultaneous versus sequential multiple health behavior change interventions among
  adults: a systematic review of randomised trials. Prev Med 2016.
  https://acquire.cqu.edu.au/articles/journal_contribution/Comparative_efficacy_of_simultaneous_versus_sequential_multiple_health_behavior_change_interventions_among_adults_A_systematic_review_of_randomised_trials/13434104
- Koller et al. Impact of different onboarding strategies on low adoption and engagement with a self-monitoring and
  management app for chronic musculoskeletal pain: prospective study. JMIR mHealth uHealth 2026;e78827.
  https://mhealth.jmir.org/2026/1/e78827
- Buell RW, Norton MI. The labor illusion. Management Science 2011;57(9):1564–1579. (Considered and not used: a fake
  "building your plan" wait would not be honest.)
- NHS Couch to 5K (programme structure): https://www.wcrf.org/about-us/news-and-blogs/a-beginners-guide-to-completing-couch-to-5k/
- Kilkari (India): https://gh.bmj.com/content/6/Suppl_5/e005213 ; https://clinicaltrials.gov/study/NCT03576157
