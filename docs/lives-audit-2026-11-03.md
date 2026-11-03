# Every stage, lived: where Sakhi gets cluttered or stops fitting her (3 Nov 2026)

Mohit, 3 Nov: "can you test all possible scenarios as i want one user to see the app personlised to their own age and stage
of life we can collect age and plan goals during onboarding but first i want to explore all possible scenarios how experience
can get cluttered and address those, navigate from real user POVs take 1 different user for every different stage and then
advise how the experience gets compromised".

**Audit only. Nothing in the app was changed.** This builds on `docs/personal-companion-advice-2026-11-03.md` (the census, and
section 4.11 on stage changes) and uses its words: the profile, the composer, one home, budgets.

---

## 0. The answer on one page

**What already works, and must stay:**
- Each stage gets its own headline, plan, topics and safety lines.
- The big life changes are smooth:
  - a positive test while trying shows "Your test is positive · Move on to My pregnancy?", one tap moves her on, and her
    folic acid carries on;
  - "My baby is born" starts the recovery plan with the baby's danger signs;
  - her first period after a birth moves her headline back to her cycle;
  - bleeding after menopause puts "See a doctor this week" on Today, with "I've seen a doctor".
- **Age is used in places:**
  - trying for a baby at 41 gets "See a gynaecologist now: you don't need to wait 12 months";
  - menopause at 41 gets the "stopped before 45: early menopause" card;
  - screening steps start at 30.
- **The under-18 page is right:** 5 taps, Childline 1098, read-only guides, and nothing saved.
- **Reminders are not the problem:** 1 or 2 are on for each woman, in her evening's order.

**Where the experience gets compromised.** Eight ways, most widespread first:

| # | What happens | How widespread |
|---|---|---|
| C1 | **It grows as she uses it.** Today is 21–32 taps on day 1 and 31–39 by weeks 4–12, with 5–7 cards. My plan is 2.9–4.0 screens tall on her first day. Explore is 2.6–2.9 screens at every checkpoint | Every woman with a plan. Explore was over budget at all 53 checkpoints |
| C2 | **Tips keep coming in the first month.** 3–4 tips in 30 days for every woman with a plan (2 to 3 without one), and they return: "Sakhi noticed something" 12 times across the women, "Your plan for today" 10, "Change stage" 7. "Your first 6 weeks" came back at week 1, at "1 of 3" instead of "1 of 2" | All 8 women who signed up |
| C3 | **The same page in 2 to 4 places.** In a pregnancy, the week's page is on Today, My plan, Diary and Explore. My food is on My plan and Explore for every plan. The check-in and the garden are on both Today and My plan | 183 cases, 21 of 22 women |
| C4 | **Government and ASHA words for women who didn't choose them:** "Govt. services … ASHA", "Free government doctor" in My plan, "Look at free care near you", "Save your ASHA or ANM's number". **Anjali's PMOS doctor check offers only "Free government doctor"**: no Qura doctor and no "your doctor", from day 48 to day 85 | All 20 women who didn't choose government care |
| C5 | **Age is used for some stages, not others.** Pregnancy at 19 and at 40 is word for word the same. The midlife plan starts at 38 (and at 22, advice 4.11). At 54 and 62, with periods stopped, Today still offers "Period started". My cycle plan is the same at 19 and 44 | Pregnancy, midlife and menopause |
| C6 | **Life moves on, and Today doesn't follow.** Priya's negative test leaves Today saying "A home test is the first step". A stage that doesn't fit her age is saved with no question (advice 4.11). (Corrected: at 12 months without a period, Kavita *is* asked "Have your periods stopped?" on Today. The first read of the walk missed that row) | Tests, and stage changes |
| C7 | **Cards that never leave until she taps them.** "A quick check", due at 28 weeks, is still on Today at 38 weeks. "Did you get the doctor check?" stays from day 48 to day 85. The first-week read "What a menstrual cycle is" is still there on days 10 and 16 | Pregnancy, PMOS, tracking |
| C8 | **A shared phone gets privacy, but no companion.** The plan offer is switched off in discreet mode (`offerCard` returns nothing), so the goal she gave at joining is dropped. My plan says only "Pick a goal when you're ready". Explore shows every stage's topics (on purpose) | Every shared phone |

Neha, trying for a baby, has a goal-level gap of her own. On cycle day 12 Today shows no fertile days, and Diary says "Next: 3
more periods, and your fertile days show". The one thing she came for waits about 3 months. Explore's estimate tool is the only
place it appears.

**The cause** is the one the advice found. Each module decides on its own when to show, and nothing gives a card an end,
caps how often she is interrupted, or checks her age and stage against what her diary shows.

**The fix:** the profile and composer from the advice, with four rule sets this audit adds (section 4):
1. **Age bands for each stage,** used everywhere (the doctor confirms the clinical ones).
2. **Life-event checks:** Sakhi asks when her diary says her stage may have moved on.
3. **Every card has an end.**
4. **An interruption budget:** at most 1 tip a day, none after her first week, and no tour shown twice.

Most of this fits phase A (small fixes) and phase B (the composer) of the advice. Section 5 has the order, and section 6 the
decisions.

---

## 1. How we looked

- **`node test/lives-walk.mjs`** (new, on 3988720, Version 39.57) runs at 360 × 800, one woman per stage:
  - each joins as a woman does: her stage tile, her goals, her details, her care answer, who uses the phone, sign-up, Skip
    the tour;
  - she starts her plan from Today's offer, answering its questions as she would;
  - she lives her stage. Her steps are ticked on her active days, and her periods and feelings logged. Her stage's events
    happen: a late period and a test, a positive test, the birth, periods coming back, a year without a period, bleeding
    after menopause. There is a lapse, and a return;
  - **at each checkpoint, every tab is counted** (cards, taps, screens tall), and every line she can see is kept. We also
    note what interrupted her since the last checkpoint (tips, badges, sheets, toasts) and which reminders are on;
  - then 14 more women join at the edges of each stage's ages, and start their plan (day 1 only);
  - flags at the end mark lines that don't fit her age, her stage or her care answer, pages reached from two tabs, and
    screens over budget. Every flag was read before it went into this report.
- **`node test/stagejump-walk.mjs`** (the stage changes in section 4.11 of the advice) runs alongside it.
- Screens and lines: `web/test/shots/lives/` (`lives.txt` for each checkpoint, `flags.txt` for each flag).

### The women

| Woman | Stage | Her care answer | What she lives (days from joining) |
|---|---|---|---|
| Priya, 24 | Regular periods, just tracking | Private doctor | Her periods for 3 months. Late by 9 days, a negative test, then her period |
| Anjali, 27 | PMOS (diagnosed): irregular periods, weight, skin | Not answered | My PMOS plan. A period after 72 days, the 4-week check, 19 days away, back, day 85 |
| Neha, 31 | Trying for a baby | Private doctor | Getting ready. Her fertile days, a late period, a positive test, moving on to My pregnancy |
| Riya, 26 | Pregnant, 20 weeks | Government | My pregnancy from 20 to 38 weeks, the birth, the first week after |
| Meera, 29 | Had a baby 3 weeks ago, breastfeeding | Private doctor | My recovery plan. The 6-week check, week 9, periods back at 6 months |
| Kavita, 46 | Periods changing after 40: hot flushes, sleep | Not answered | My midlife plan, weeks 1 to 12, then a year with no period |
| Sunita, 54 | Menopause: hot flushes, bones | Government | My midlife plan. Bleeding on day 10 |
| Asha, 33 | Period pain, shared phone (family) | Not answered | My period plan on a family phone. Her period on day 7 |
| Pooja, 16 | Under 18 | — | The girls' reading path, no account |
| 14 edge ages | Every stage, at its youngest and oldest likely age (19/44, 18/38, 23/41, 19/40, 20/39, 38/52, 41/62) | — | Day 1, her plan started |


---

## 2. What each woman lived

Numbers are things to tap / screens tall on Today. Each woman's checkpoints are in Appendix A.

**Priya, 24, just tracking.**
- What goes right: her cycle ring, her next period and the late-period line ("A week or more late and you could be pregnant? A
  home test is the first step") all fit her.
- Day 1, Today (24 / 2.1): the read "What a menstrual cycle is" (still there on days 10 and 16), "Set up Sakhi for you: Look
  at free care near you" (she chose a private doctor), a tip, and on day 10 two more tips and a badge.
- After her negative test on day 40, Today is unchanged: "Period late? … A home test is the first step." It never says
  "Negative today: test again in 3 days if no period".
- One 39-day cycle turns her date into counts ("Your gaps vary from 28 to 39 days"). That's honest, and it stays.
- Explore: 24 taps, 2.8 screens, the same at every checkpoint.

**Anjali, 27, PMOS: irregular periods, weight, skin.**
- What goes right: the plan starts from Today's offer and runs well. Her 72-day gap is noted for her results. Day 85 says
  "Your 12 weeks are done · Your steps carry on".
- Today grows from 26 taps and 4 cards on day 1 to 36 taps and 7 cards by week 4. Week 4's card alone holds "Month 1 done",
  her days, her gaps, "Your doctor check is still to do", "Do your 4-week check" and "Yes, done".
- "Did you get the doctor check?" appears on day 48 and is still there on day 85. Its buttons are "Yes, done", **"Free
  government doctor"** and "Later": no "Ask a Qura doctor", though she never chose government care.
- "Look at free care near you" is on Today from day 8 to day 22.
- My plan on day 1 is 4.0 screens tall.

**Neha, 31, trying for a baby.**
- What goes right: Getting ready runs well, and age changes it at the edges (section 3). The positive test is the best
  transition in the app: "Your test is positive · Move on to My pregnancy? Your folic acid carries on to 12 weeks … See your
  gynaecologist within a few days · Yes, move me on". After that, My pregnancy starts, with her last plan kept.
- On cycle day 12 there are no fertile days on Today or in Diary ("Next: 3 more periods, and your fertile days show").
- 3 tips by day 8.

**Riya, 26, pregnant from 20 weeks.**
- What goes right: each week's headline, "Baby moving less? Get help" from 24 weeks, the labour timer and "My baby is born"
  near the end, and on the birth day the recovery plan with the baby's danger signs.
- "A quick check", due at 28 weeks, is still on Today at 38 weeks: 10 weeks of the same card.
- 3 tips in her first fortnight ("Your plan for today", "Your week of pregnancy", "Change stage").
- After the birth, "Your first 6 weeks" showed as "1 of 2", then as "1 of 3" a week later.
- Today grows to 31 taps by 38 weeks.

**Meera, 29, baby 3 weeks ago.**
- What goes right: the plan follows her days. "Ready to move a little more?" comes at 6 weeks, and "Before sex starts again:
  choose your method" at 9 weeks. When her period comes at 6 months, the headline moves to her cycle and the plan carries on
  to the first birthday.
- 3 tips by 6 weeks.
- Later, "Two quiet weeks" offers a lighter week and a message for her family.
- Today reaches 32 taps and 6 cards.

**Kavita, 46, periods changing: hot flushes, sleep.**
- What goes right: the midlife plan runs its 3 parts, "Your 12 weeks are done" comes at day 85, and "Your year is done" at
  day 400. At 12 calendar months without a period, Today asks "A year since your last period · Have your periods stopped?"
  (from 40, `stopDue` in meno.js), and Yes moves her to "My periods have stopped".
- Today reaches **39 taps, 2.6 screens and 7 cards** at week 12, the most of any woman. There are 3 tips in week 5.
- Beside that question, Today still says "Keep noting each period" and "Next: 3 more periods with notes". That's minor, and
  it goes once she answers.

**Sunita, 54, menopause, government care.**
- What goes right: her spotting on day 10 puts "Bleeding after your periods stopped · See a doctor this week · What this means"
  on Today.
- The save itself says only "Spotting saved for today · Undo · Add details".
- Its page leads with "Ask a Qura doctor about this". Qura's doctors are BAMS, and this needs a gynaecologist's scan (the
  doctor confirms).
- Today still offers "Period started", and the feelings card says "A note a day shows what repeats in your cycle".
- Today reaches 37 taps, 2.7 screens and 7 cards by week 5.

**Asha, 33, period pain, on a family phone.**
- What goes right: discreet mode works. Today is 10 taps on one screen ("Hidden for privacy. Tap the number to show"), the
  tabs say Notes, and the PIN comes first.
- No plan is offered: the offer card is switched off in discreet mode. The period pain she named at joining is dropped, and
  My plan says "Pick a goal when you're ready".
- Explore shows all 13 topics, from pregnancy to menopause. That's on purpose, so the screen doesn't give her stage away.

**Pooja, 16.**
- Everything here goes right: "This diary is for women 18 and over · Nothing you typed was saved", Childline 1098, the safety
  guide, read-only guides for girls, Sach ya Myth?. 5 taps.

## 3. Age: what changes today, and what should

The 14 edge women, each on her first day with her plan started:

| Stage | Ages | What Sakhi changes by age today | What should change († the doctor confirms) |
|---|---|---|---|
| Regular periods | 19 / 44 | Nothing. My cycle plan is word for word the same | 40 and over: one line that cycles change from the 40s, and what to note †. Screening by age, as now |
| PMOS | 18 / 38 | Nothing. "Periods may start to come more regularly" for both | 35 and over: sugar and BP checks with the doctor check †; the trying-for-a-baby line if she is trying |
| Trying | 23 / 41 | **Yes:** at 41, "See a gynaecologist now: you don't need to wait 12 months"; 35 and over, a check after 6 months | Keep |
| Pregnant | 19 / 40 | **Nothing.** Word for word the same | Under 20 and 35 and over: one line, "Your age is one reason doctors watch a pregnancy more closely: ask about extra checks" †, in her check-ups |
| After a birth | 20 / 39 | Nothing | Probably nothing new † |
| Periods changing | 38 / 52 | Nothing. At 38: "Around 40 and after, gaps between periods change" | Under 40: the stage question and the doctor first (advice 4.11) |
| Menopause | 41 / 62 | **Yes:** at 41, the "stopped before 45: early menopause" card. Under 40, the POI hold | Remove "Period started" for every age, and use "Bleeding" (advice phase A 1). From 55, no contraception lines † |

The pattern: age is used where a plan's author thought of it (trying, early menopause), not as a rule for the whole app. In the
profile, age bands become one table that every screen reads (section 4).

## 4. The four rule sets this audit adds

These go into the composer (advice, section 4.1). The lines marked † need the doctor.

**R1. Age bands for each stage** (section 3's table). Joining already collects her age and goals. The change is that one
table decides what each age gets, and no module checks age on its own.

**R2. Life-event checks.** Sakhi asks one question, on Today, when her diary says her stage may have moved on:

| Her diary shows | Sakhi asks | Today |
|---|---|---|
| A positive test while trying | "Move on to My pregnancy?" | Works (keep) |
| A negative test with her period still late | "Negative today. No period in 3 days? Test again" †, then the late-period card at its next step | Missing (C6) |
| 12 months with no period, 40 or over | "A year since your last period · Have your periods stopped?" | Works (keep). The first read of the walk missed it |
| A period after "stopped" | "Your period came. Have your periods come back?" (advice 4.11) | Missing |
| A stage that doesn't fit her age | One question before saving (advice 4.11) | Missing |
| 42 weeks of pregnancy and no birth logged | "Has your baby been born?" † | To check |
| Her first period after a birth | Her headline moves to her cycle | Works (keep) |

**R3. Every card has an end.** Each card is ended in one of four ways:
- done;
- dismissed;
- dated (it leaves after its weeks);
- moved into the evening check-in as one question after 7 days unanswered.

Safety cards keep leading, but no card stands for 10 weeks. Concretely:
- "A quick check" becomes a check-in question after a week;
- "Did you get the doctor check?" asks once a week, not every day;
- a first-days read leaves after 3 days.

**R4. An interruption budget:**
- at most 1 tip a day, and none after day 7;
- a tour never shows twice;
- no tip on the day of a badge or a plan event;
- "Sakhi noticed something" points once to the finding it means, and after that the finding speaks for itself.

**And the advice's rules, which this audit confirms:**
- one home for each page (C3);
- government and ASHA words only by her care answer, and every doctor card with "Ask a Qura doctor" or the right specialist
  first (C4);
- budgets: Today at most 1.3 screens, 15 taps and 3 cards; My plan's first day at most 2 screens; Explore at most 1.3 screens
  (C1);
- **on a shared phone, her plan offered behind her PIN.** Plans already have plain titles there ("Your step {n}"), so the
  offer can come back in discreet mode (C8).

## 5. Build order

These fold into the advice's phases.

| Phase (advice section 6) | What this audit adds | Size |
|---|---|---|
| **A. Stop the drift** | Anjali's doctor check: "Ask a Qura doctor" and "your doctor", and government only by her care answer (C4). "Bleeding" for every woman whose periods stopped (C5). The negative test on Today (R2). The shared-phone plan offer behind her PIN (C8) | S to M |
| **B. The composer and Today** | R1 (age bands), R3 (card ends), R4 (the interruption budget), one home (C3) | M to L |
| **C. Joining** | Nothing new. Joining already asks her age and goals: the profile carries them | — |
| **D. Explore and Learn** | Explore within budget (C1) | M |
| **E. The doctor ladder** | The right doctor for bleeding after menopause, for the doctor check and for the pregnancy age line (†) | M |

Measure each phase with `node test/lives-walk.mjs` before and after: taps and screens for each checkpoint, flags by rule,
tips in the first 30 days. Target: 0 flags in C3 to C5 and C8, every Today within budget, and at most 1 tip a day.

## 6. Decisions for Mohit

| # | Decision | My recommendation |
|---|---|---|
| L1 | The age bands (section 3): which lines the doctor writes for pregnancy under 20 and 35 and over, cycles from 40, and PMOS from 35 | **Send section 3's table to the doctor with the advice's packet** |
| L2 | (Withdrawn: "Have your periods stopped?" after 12 months already shows on Today from 40) | — |
| L3 | Cards that wait: move into the evening check-in after 7 days | **Yes,** except safety cards, which keep leading |
| L4 | Tips: none after day 7, at most 1 a day | **Yes** |
| L5 | A shared phone: offer her plan after her PIN, in plain words | **Yes.** The plan already has plain titles on a shared phone |
| L6 | Fertile days for a woman trying, before she has 6 gaps: an early range, or wait as now | **Ask the doctor.** Sakhi's maths waits for enough gaps on purpose (the Cykel traps); an early range for a regular cycle may be fair |

---

## Appendix A. Each checkpoint

Today taps / screens / cards, My plan screens and Explore screens. Full lines: `web/test/shots/lives/lives.txt`.

| Woman | Checkpoints (day: Today · My plan · Explore) |
|---|---|
| Priya | 0: 24/2.1/5 · 2.1 · 2.8 — 10: 24/2.1/5 — 34 (late): 24/1.8/3 — 40 (negative test): 24/1.8/3 — 90: 23/1.8/3 |
| Anjali | 0: 26/1.9/4 · 4.0 · 2.9 — 7: 33/2.2/6 — 22: 34/2.3/6 — 28: 36/2.3/7 — 48: 34/2.2/6 — 84: 36/2.3/6 |
| Neha | 0: 28/2.2/4 · 3.8 · 2.7 — 7: 33/2.3/6 — 26: 34/2.4/6 — 49 (positive): 35/2.2/7 — 50 (pregnant): 22/2.2/3 · 3.3 — 56: 25/2.4/4 |
| Riya | 0: 23/2.3/3 · 2.9 · 2.6 — 14: 29/2.2/5 — 56: 29/2.3/5 — 126: 31/2.3/5 — 130 (born): 21/2.2/3 · 3.2 — 137: 25/2.3/5 |
| Meera | 0: 21/2.0/3 · 3.0 · 2.8 — 21: 28/2.2/6 — 42: 25/2.0/5 — 160 (period back): 32/2.4/6 |
| Kavita | 0: 32/2.4/4 · 3.4 · 2.7 — 28: 37/2.3/7 — 84: 39/2.6/7 — 400: 28/1.9/6 — 420: 28/1.8/5 |
| Sunita | 0: 29/2.3/4 · 3.3 · 2.7 — 10 (bleeding): 33/2.6/6 — 28: 37/2.7/7 |
| Asha (shared phone) | 0: 10/1.0/1 · 1.0 · 2.1 — 8: 10/1.0/1 |

How to run it again:
- `node test/lives-walk.mjs`, about 20 minutes for all 23 women. `WHO=riya,kavita` picks women, and `EDGES=0` skips the edge
  ages.
- `node test/stagejump-walk.mjs` for the stage changes.
- `node test/census-walk.mjs` for the tab census.

Two notes on reading the results:
- The walk ticks steps but doesn't do the evening check-ins, so check-in-led cards may show a little more often than for a
  woman who checks in every night.
- A first run had the test step on the wrong page; Priya and Neha were re-run with it fixed, and only those runs are reported.
