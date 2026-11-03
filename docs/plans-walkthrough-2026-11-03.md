# All plans walked through, 3 Nov 2026

Mohit, 3 Nov: "can you do a proper walkthrough of all plans one by one and highlight major issues or gaps with UX and
functionalities". Audit only: nothing here is built yet.

## How it was walked

The four plan walks ran on the code of `97b02b2` (APK vc 104): `test/fourplans-walk.mjs`, `test/midlife-walk.mjs`,
`test/periodplan-walk.mjs` and `test/pfplan-walk.mjs`. That is 20 women across the 7 plans a new woman can start. Each joins
from a new install on a 360 x 800 screen (the Flip5), starts her plan through its own screens, then lives it on about 4 days a
week. At each stop the walk saves Today, a tick, the evening check-in, what she sees after it, My plan, the Diary, Today at
night and what rings. Screens and words are in `web/test/shots/<walk>/` (not in git).

- Every screen was machine-checked (page errors, string keys, sideways scroll, empty views, lines said twice, more than 4
  steps, more than one "Sakhi says" card). The only flag in all four walks is item 11 below. No page errors.
- One woman per plan was read screen by screen: Priya (My PMOS plan), Neha (Getting ready for a baby, through a positive test
  into My pregnancy), Riya (My pregnancy, 10 weeks to the birth), Meera (I had a baby, day 3 to the first birthday), Kavita (My
  midlife plan, hot flushes), Priya (My period plan, pain with heavy periods). My pelvic floor plan was phone-tested on 3 Nov
  and fixed (e32a55c, 97b02b2); its walk is clean. The other 13 women were checked by the flags only.

## What works

Every plan joins in one flow (questions, "Here's what you told Sakhi", the reveal, Start) and names what will ring. Day 1 keeps
to 3 steps or fewer, later days to 4. Steps grow over the weeks (the PMOS walk from 10 to 25 minutes, the food habit changing
every two weeks, the bedtime from day 4). The check-in says what counted. The 12-week end page shows her own numbers. The plan
changes hands cleanly: a positive test offers "Yes, move me on" into My pregnancy, and "My baby is born" ends the pregnancy
plan and starts the after-birth one. Hindi and the shared phone hold at 360 px.

## Major issues and gaps, most serious first

1. **My pregnancy: her daily pelvic floor set can't be recorded unless she does it in the trainer.** From 13 weeks the step
   "Pelvic floor · 1 set" counts only from the trainer (`progs/v1.js` preg v2, `id: 'pf'`, `kind: 'link'`, `check: true`).
   The check-in offers just "Do it now" and Today has no tick. Squeezes done without the phone can't count, so her day
   stays "2 of 3 done" (Riya at 28 and 37 weeks). After the birth the same squeezes are a tick, and My pelvic floor plan
   counts a check-in answer.
   - Suggested: a tick on Today and Done / Not today in the check-in, still counting the trainer's sets.
2. **Getting ready: the folic acid tablet, the plan's most important step, waits on a toggle she has to find.** Until she
   opens the tablet page and taps "I have them", the step reads "Not got it yet? See where". Until then:
   - it can't be ticked, and the check-in offers only "Do it now";
   - no 9 pm ring is booked;
   - her day never completes (Neha: "2 of 3 done today" on every stop, day 1 to 61).
   Nothing asks whether she already takes it.
   - Suggested: "Already taking folic acid?" in "A few things first", or "I have them" on Today's row and in the check-in.
     Either books the 9 pm ring.
3. **My PMOS plan: the doctor loop never closes for long gaps.** "Your last gap was 42 days · See a doctor this month" leads
   Sakhi says every day for 12 weeks: 43 times in the walk, still there on day 85.
   - The card has no "I've seen a doctor", and "Got it" on What this means only hides it.
   - The plan's own "Did you get the doctor check?" (Yes, done, then what the doctor said) never shows for her. It shows
     only for the heavy-periods woman in the period walk.
   - So her results and her report can't say what the doctor found.
   - Suggested: "I've seen a doctor" on the card, leading to the plan's "what the doctor said". After 4 weeks, "Still to
     see a doctor?" in place of "this month".
4. **Government and ASHA words for women who chose a private doctor** (against the 28 Oct rule, Version 39.28 and 39.29).
   Priya and Neha both chose "A private gynaecologist or doctor", yet they see:
   - the missed-period and test pages: "Your ASHA usually carries test kits (Nishchay)", "The check is also free at the
     sub-centre, PHC or Ayushman Arogya Mandir", "Registering with your ANM is free too", "the ANM gives them free";
   - the 12-week end page: a "Free government doctor" button beside "Talk to a Qura doctor" (`mods/plan.js`, `endFree`).
   - Suggested: `_doc` versions ("a chemist or your doctor"), with one quiet line for the free option.
5. **Getting ready: the missed-period pages don't fit a woman who is trying.**
   - "Missed period: what now" lists "Pregnant and didn't plan it", "Safe, legal abortion" and "After an abortion" first.
   - A positive result says "Didn't plan this? You have choices".
   - After she saves a positive result, Today's cycle card still says "Period late? A week or more late and you could be
     pregnant? A home test is the first step", right beside Sakhi says' "Your test is positive".
   - Suggested: while she is trying, lead with the test and what comes next in a pregnancy, and keep the choices behind one
     quiet row. After a positive result, the cycle card says so.
6. **My period plan: on a period day the "1 minute" check-in grows to about 10 answers.** She gets her 3 steps, "Pain
   today?" (which Today also asks), the 3 period taps (soaked, clots, got in the way), fasting and how she feels.
   - Suggested: carry over Today's "Pain today?" answer, and fold the period taps into one row.
7. **I had a baby: two week counts on one screen.** On day 42 Today says "Week 6 of 6" in the stage card and "Week 7 after
   the birth" in the plan card.
   - Suggested: one count, e.g. the stage card says "6 weeks done" from day 42.
8. **My plan after a plan change is crowded.** It shows "Your plan has changed", then a goal picker, "Suggested for you" and
   "More plans". On the day of the birth, "More plans" offered "For period cramps".
   - Suggested: only the change card and the new plan's start, with no suggestions that don't fit her stage.
9. **My midlife plan after week 12: "Today's skill: carry on" doesn't say which skill.**
   - Suggested: name her skill.
10. **My PMOS plan's first question: "your last 2 gaps were 42 to 42 days".**
    - Suggested: "both 42 days".
11. **Known since 2 Nov, still open:** the Hb test page says "Call 112 now if: Soaking a pad every 1–2 hours and feeling
    dizzy or breathless" twice (the period walk's only flags: Priya day 5, Rekha day 1, Meena day 1).

## Wording

Items 4 and 5 change what health pages say (where to get a test, what a positive result means for her), so their new lines
need doctor review before they ship. Items 1, 2, 3 and 6 to 10 are UI words, or reuse lines the app already has.

## Fixed in Version 39.57 (3 Nov, "fix all 11")

All 11 are built (MODULE_API section 100, `web/test/allwalk.mjs`, 25 checks). Two corrections found while fixing:

- Item 4: the 12-week end page already follows the 28 Oct rule. A woman with her own doctor sees "Talk to a Qura doctor" first and
  the free government doctor after it (Version 39.28's order), so it stays. The test pages were the real gap: their "Where to get a
  test" doctor version still named her ASHA and the ANM, and a positive result named the ANM three times.
- Item 6: "Pain today?" is already asked once (on Today or in the check-in, never both); the walk never answered it on Today. The
  fix is the period card: its first question, then the other two once she answers.
- Item 3: the plan's own "Did you get the doctor check?" exists only when her plan has a doctor case (for PMOS: months skipped, or gaps
  over 45 days or varying a lot). For gaps of 36 to 45 days, as Priya's, the finding itself now has "I've seen a doctor" and says
  "Still to see a doctor?" after 4 weeks.
