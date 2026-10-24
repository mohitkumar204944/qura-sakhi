# Plans: audit of Version 35 and the Version 36 build (23 Oct 2026)

Mohit, 23 Oct, after installing `0.35-pilot` on the Flip5: "Audit this it has bugs and also plan should be handy not deep
hidden all other information which is information only about government services should be compacted in Govt. services, my
goal is let user keep a track of their reproductive health and based on symptomatic conditions advise these plans to fix
issues using lifestyle with best UI and UX, also check if we need more information during onboarding journey and can give
most value available handy to user".

Version 36 is built and tested. Its wording needs the doctor's review before it ships (section 5).
Technical notes: `web/MODULE_API.md`, section 38.

## 1. What the audit found

### Bugs in the PMOS plan (Version 35)

| # | What happened | Fixed in Version 36 |
|---|---|---|
| 1 | The plan was 3 taps deep (Care, Conditions, PMOS). In "For you" only with PMOS, so an after-birth diary never saw it. | Plans tab, Home card, Plans row at the top of Care |
| 2 | Daily reminder on, phone notifications off: nothing said it could not ring. | Warning card with "Turn them on" |
| 3 | Tapping the plan's reminder opened the reminders list, not the plan. | It opens the PMOS plan |
| 4 | The reminder kept ringing while the plan was paused (pregnancy, first 6 weeks after a birth). | Removed while paused |
| 5 | The screen slept during a routine. The timer stopped and the read-aloud cut off. | Screen stays on during a routine (`keepAwake` on Android, wake lock on the web); off when she pauses, finishes or leaves |
| 6 | A short routine ended with "Every move counts. Try the whole routine next time.", which reads as a telling-off. | "Routine done. Every move counts." |
| 7 | Today's routine never showed as done. | "✓ Done today" and a green row |
| 8 | "Strength: 1 of 1 days" and "You moved 120 of 50 minutes". | "Strength days: 1 of 1" and "You moved 120 minutes. Your target was 50." |
| 9 | After week 12 with "Keep going", Home's Today still said "Week 12 of 12". | "Keeping it going" |
| 10 | A slip on +30 added 30 minutes with no way back. | The toast has Undo |
| 11 | The weekly look-back sat above Today and pushed her day down. | Moved under Today |
| 12 | In dark mode the minutes chart bars were almost invisible. | Stronger bars in both themes |
| 13 | The arrow on the routine row never drew (an icon in a slot sized for text). | Sized; the move pictures are bigger too |
| 14 | The routine row said "Today's yoga: Cycle care yoga". | Routine name first, then "Today's yoga · About 8 min" |
| 15 | A pregnant woman opening "Make the plan yours" saw a blank page. | The plan's page, with why it is paused |
| 16 | With the phone's largest text, two routine pages scrolled sideways. | They wrap |

### Gaps against the goal (track, then advise)

- There was no single place for the plans. The 12-week PMOS plan, the two 21-day journeys, the five 3-minute routines, the
  pregnancy plan and the after-birth courses sat in different Care topics.
- Nothing linked what she logs (long gaps, heavy or painful periods, low mood, poor sleep, hot flushes) to a plan that helps.
- Joining asked her stage but not what she wanted help with. Until her diary had months in it, every woman in a stage saw
  the same app.
- Government pages filled "For you" (free doctor, care near me, schemes, ASHA, online services). Care also had both a
  "Get care free" row and a topic card for the same thing.

## 2. What Version 36 changes

**Plans tab** (between Diary and Care), with a page called "Plans for you":
1. **Your plans now:** a started PMOS plan (minutes ring, week, minutes against the target) or a 21-day journey (day n of 21).
2. **Suggested for you:** up to 4 plans, each with the reason from her diary, for example "You needed a painkiller in 2 of
   your last 3 periods.", and how long it takes (12 weeks, 21 days, 3 minutes, every day).
3. **What you want help with:** her answers from joining, which she can change here. Women who joined before Version 36
   start here.
4. **More plans:** every other plan that fits her stage, in one list.

**Home:** "A plan for you" shows the top suggestion, with its reason, when:
- it scores 3 points or more;
- she has no plan going (Today already carries a started plan);
- discreet mode is off;
- she hasn't tapped "Not now" in the last 14 days;
- the setup card isn't already offering the same plan.

**Care**, top to bottom:
1. a "Plans for you" row ("2 suggested from your diary");
2. For you, with no government pages;
3. one "Govt. services" row (free doctor, care near me, schemes, ASHA and online services; renamed from "Get care free");
4. the topics, without the duplicate card.

Qura's own "Ask a Qura doctor" row left the government page. It stays in Support and on the Doctor button.

**Joining:** a new step, "What would you like help with?" Its choices depend on her stage:

| Stage | Choices |
|---|---|
| Periods | irregular or late periods · I have PMOS (PCOS) · painful periods · heavy periods · mood or body changes before periods · acne or extra hair · weight and fitness · just keeping track |
| Trying | irregular or late periods · I have PMOS (PCOS) · weight and fitness · painful periods · heavy periods · just keeping track |
| Pregnant | nausea · food and activity · iron and tablets · sleep · worry or low mood |
| After a birth | recovering after the birth · pelvic floor and leaks · breastfeeding · worry or low mood · sleep · weight and fitness |
| 40+ | hot flushes and night sweats · sleep · worry or low mood · bones and strength · heavy periods · weight and fitness |

She can pick any or skip. "Just keeping track" clears the others. "I have PMOS (PCOS)" also ticks PMOS on Me > My situation,
the same answer she gives there.

I looked at asking more when she joins (height and weight, diet, activity, PIN code). I left them out. The PMOS plan asks its
own questions when she starts it. Her PIN code comes from her account. Every extra step at sign-up loses women before they
reach Home.

## 3. How a plan is suggested

Every plan gets points from her diary and her answers, all worked out on the phone. The plan with the most points comes first.
Its reason is the single biggest source of its points. "Suggested" means 2 points or more; Home needs 3.

| Plan | Fits | Points |
|---|---|---|
| My PMOS plan (12 weeks) | not pregnant; 40+ only with PMOS; waits for the 6-week check after a birth | she has PMOS 5 · self-check "matches" 4, "1 of 2 signs" 2 · no diagnosis but 2+ long gaps and PMOS signs in a check-in 2 · asked for weight 2 (1 with PMOS), skin 1, irregular 1 |
| Could it be PMOS? (self-check) | periods or trying; no PMOS; self-check not done; not held back in this build | 2+ cycles over 35 days 4 · PMOS signs in 2+ check-ins 3 · acne on 3+ days 1 · asked for irregular 3, skin 2 |
| More iron in 21 days | everyone | heavy flow in 2+ of the last 3 periods 4, in 1 period 3 · heavy flow in a check-in 3 · asked for heavy 3, iron 2 · tired on 5+ days this month 2 |
| Iron tablets | everyone | pregnant 4 · under 180 days after a birth 3 · asked for iron 3 |
| For period cramps (3 min) | not pregnant | painkiller in 2+ of the last 3 periods 4, in 1 period 2 · cramps on 3+ days in 2 months 3 · asked for pain 3 |
| When you feel anxious or low (3 min) | everyone | low, anxious or irritable on 3+ days this month 3 · low mood in a check-in 3 · asked for mood 3, PMS 2 |
| Mood and body through your cycle | periods or trying | asked for PMS 3 · low on 3+ days 1 |
| For poor sleep (3 min) | everyone | poor sleep on 3+ days this month 3 · asked for sleep 3 |
| For hot flushes (3 min) | 40+, or she logged them | hot flushes on 2+ days this month 4 · moderate or night-waking in a check-in 3 · asked for hot flushes 4 |
| Weekly symptom diary | 40+ | asked for hot flushes 3 · hot flushes on 2+ days 2 · 40+ 1 |
| Bones and heart | 40+ | asked for bones 3 · 40+ 1 |
| Strength at home | not pregnant, not in the first 6 weeks after a birth | asked for bones 3 · 40+ 1 |
| Yoga and moves; My plate | not pregnant (moves also not in the first 6 weeks); not with PMOS (her plan has both) | asked for weight 3 each · asked for food: plate 3, moves 1 |
| Daily recovery check | after a birth | under 6 weeks 4 · asked for recovery 4 |
| Pelvic floor trainer | after a birth | every woman after a birth 3 · asked for pelvic floor 4 |
| Breastfeeding | after a birth | asked for feeding 3 · breastfeeding 2 |
| Mood after birth | after a birth | asked for mood 3 · low on 3+ days 3 |
| My pregnancy plan | pregnant | pregnant 5 |
| Food in pregnancy | pregnant | asked for food 3 · pregnant 2 |
| For nausea in pregnancy (3 min) | pregnant | asked for nausea 3 · nausea on 2+ days in 2 weeks 3 |
| Before you start: checklist | trying | trying 3 |
| Small steps for PMOS (21 days) | not pregnant | listed under More plans only |

Ties keep the order of this table. A started plan or journey moves to "Your plans now".

## 4. Rules the suggestions keep

- **Never a diagnosis.** Long gaps without a diagnosis point to the self-check first. "You told Sakhi you have PMOS" appears
  only when she said so; "matched PMOS" only after her own self-check.
- **Tester builds** never suggest a triage tool they hold back (the self-check): `S.toolShown`.
- **Discreet mode:** no plan card on Home, and no reasons from her diary on the Plans page.
- **Pregnancy:** no PMOS plan and no cramps routine. In the first 6 weeks after a birth the PMOS plan and the moves wait for
  her check-up.
- **Nothing is sent.** The page reads her diary on the phone. Only the doctor summary she ticks in "Ask Qura to call me"
  leaves it, as before.

## 5. Before it ships

- **Doctor review:** the reasons, the joining question and the table in section 3 are new health wording, so they wait for
  review (`docs/wording-review-v28.md`, section 13).
- **APK:** versionCode 41, `0.36-pilot`. It needs the phone connected.
- **Still to build:** the other lifestyle plans from the research (periods, pregnancy, after a birth, 40+;
  `docs/lifestyle-plans-research-2026-10-23.md`, section 8). Until then the Plans page links the tools that already exist.
