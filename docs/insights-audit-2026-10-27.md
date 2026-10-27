# Insights audit: when her diary should say something (27 Oct 2026)

**Mohit's asks:**
- "in diary i added past 3 months of period dates and i see no insights when is expected ovulation and fertile period when
  could be next period etc. can you audit and advise around all such gaps"
- "do a proper audit for more such gaps and keep best UI/UX in mind and wherever needed recommend a consultation with qura
  doctor"
- "also consider if user is not on any plan but symptoms show then advise to start a relevant free plan along with doctor
  advise"

Audit only; nothing is built. Evidence: Mohit's Flip5 (read-only), the code, and 12 kinds of user run through the app at
390 px (sample data, Version 39.24).

## 1. What happened on Mohit's phone

His diary has 3 periods: 5 Aug, 8 Sep and 1 Oct. That makes two gaps, 34 and 23 days. Three rules block every prediction:

1. **On hormones.** His profile says he takes "the pill or another hormone medicine" (the joining question, or the switch in
   Me). While that is on, Sakhi predicts no period, no fertile days and no ovulation. That is medically right, because on the
   pill bleeds follow the pack. But the only sign of it is "not counted: hormones" on each cycle in Diary → Cycles.
2. **1 Oct is a guess.** That gap is left out, so Sakhi counts one gap (34 days). The note "Your start date is a guess" shows
   on one day a week at most.
3. **The gaps are irregular.** Even with 1 and 2 fixed, 34 and 23 differ by 11 days. A date needs two gaps within 7 days, and
   fertile days need 6 regular gaps of 21–35 days. So with these dates there is no date and no ovulation estimate.

Today said only "Your last gaps: 34 days", which gave none of these reasons.

## 2. How Sakhi turns a diary into insights today

| Insight | Where it shows | What it needs |
|---|---|---|
| Cycle day | Today, calendar, day page | one period start |
| Next period: the days to go and the likely dates | Today, calendar strip, calendar (dashed days) | 2 counted gaps within 7 days of each other (9 days under 26 or over 41). Never on hormones, in pregnancy, after a birth, loss or stopping hormones, while breastfeeding, after a hysterectomy or once periods stop |
| A counted gap | Cycles, Your numbers | 10 to 400 days; both starts real (not guessed); no hormones, pregnancy or the year after a birth inside it |
| Fertile window, ovulation, today's chance | Today, calendar, Cycles rows | pilot and demo builds; 6 counted gaps, all 21–35 days and within 7 days; not on hormones or a method that stops ovulation; age 18–44 |
| What repeats for her | Cycles | notes on 3 periods |
| Her cycle at a glance (regular, outside the usual, irregular) | Cycles | counted gaps |
| What your diary shows (findings) | Today's "Sakhi says", the Explain page, Cycles | short, long or varying gaps; late; a period over 8 days; heavy flow; severe pain; bleeding after sex; discharge; mood; PMOS signs; thyroid signs; midlife signs; pregnancy and after-birth signs |
| A free plan suggested | Today's "Sakhi says", My plan | her goals, plus a few diary signs: low mood days, cramps, hot flushes, poor sleep, PMOS. From findings: only a long gap leads to the irregular-periods plan |

**The doctor ladder in findings (it works well):**
- **Now:** call 112 (14416 for thoughts of harm).
- **Today:** free care near her.
- **This week or this month:** a free government doctor, her report, and "Ask a Qura doctor about this".
- **Keep an eye on it:** "Ask a Qura doctor" as an extra.

## 3. What 12 kinds of user see

| Her diary | Today | Calendar | Cycles and findings | Doctor or plan offered |
|---|---|---|---|---|
| 1 period | cycle day only | "Day 11 of your cycle" | example numbers, "Add a past period" | none |
| 2 periods (1 gap) | "Your last gaps: 28 days" | cycle day | numbers from 1 gap | none |
| 3 regular | the days to go, likely dates | the same | "Regular 28–29 days" | none needed |
| 7 regular | plus fertile window and chance | fertile and ovulation days | fertile rows | none needed |
| PMOS, gaps 34/23/41/30 | gaps, "we show counts, not a date" | cycle day | "Keep an eye on it: a 41-day gap" | Ask Qura ✓, PMOS plan offered ✓ |
| **on the pill** | **cycle day, no reason** | **nothing** (even the cycle line goes) | "not counted: hormones" on every cycle; no numbers, no findings | **none** |
| **last start guessed** | 1 gap; the guess note one day a week | cycle day | "date guessed" | none |
| **late, day 46** | "14 days past your likely range" | the likely range | "Day 46, and no period yet" | Ask Qura ✓; **no home-test prompt on Today** (only plan users get "Period late?") |
| short gaps 19/18/20 | the days to go | the same | "See a doctor this month: TSH and Hb" | free doctor, report, Ask Qura ✓; **no plan** |
| **a 10-day period** | the days to go | the same | "See a doctor this week: Hb" | doctor ✓; **no iron plan offered** |
| 47, gaps 24/45/33 | days since her last period | cycle day | "Keep an eye on it: a 45-day gap" | Ask Qura ✓ |
| trying, 7 regular | the days to go, fertile window, "High chance" | fertile days | fertile rows | trying-for-a-baby checklist ✓ |

The engine is sound. The gaps are in saying why, showing what comes next, and pairing a doctor step with a self-care step.

## 4. The gaps, and what to do

Each fix keeps Sakhi's safety rules: no "safe days", fertile days only after 6 regular cycles, estimates called estimates.

### G1. Nothing says why a prediction is missing (P0)
- **Now:** Today and the calendar show gaps or a cycle day and stop. The reason (hormones, a guessed date, too few gaps,
  irregular gaps) is buried in Cycles, or nowhere.
- **Fix:** one reason line, on Today's cycle card (the headline and the full card) and the calendar strip. It gives the most
  important reason first, with one tap to act on it:
  1. **Hormones:** "On the pill or another hormone medicine: your bleeds follow it, so Sakhi doesn't predict periods or fertile
     days." The tap: "Not on it now? Change it".
  2. **A guessed start:** "Your 1 Oct start is a guess, so it isn't counted." The tap: "Fix the date".
  3. **Too few gaps:** "1 more period start and your next period date shows." The tap: "Add a past period".
  4. **Irregular:** "Your gaps vary from 23 to 34 days, so Sakhi shows counts, not a date." The tap: "What this means".
- **One engine:** the reason comes from one core function (`whyNot()`) used everywhere, the way findings use one engine (V39.1).

### G2. No progress toward the next insight (P0)
- **Now:** only fertile days have a counter, and only for one of their reasons.
- **Fix:** a small "What Sakhi can tell you" card at the top of Cycles, reached from the reason line. Three rows, each with a
  tick or what's missing:
  - "Next period date": "needs 2 regular gaps (you have 1)";
  - "Fertile days and ovulation (estimate)": "needs 6 regular gaps of 21–35 days", or "off while you take hormones";
  - "What repeats for you": "notes on 3 periods (2 more)".

### G3. On the pill, Sakhi goes silent (P0)
- **Now:** cycle day only; no numbers, no findings, no reason.
- **Fix:** a card for her:
  - why there are no predictions;
  - what is still worth noting: bleeding between packs, spotting, side effects;
  - her pill tools: the reminder, and "Missed a pill?" (the contraception module has both);
  - the switch in Me, if it's wrong.
- **Doctor:** "Bleeding between packs for 3 months, or side effects: ask a Qura doctor". Wording needs review.

### G4. A guessed date is left out without a word (P0)
- **Now:** "date guessed" in the Cycles list; the Today note on one day a week.
- **Fix:**
  - a "?" on the guessed day in the calendar;
  - one line on the cycle row: "Is 1 Oct right?" with **"Yes, it's right"** (removes the guess, and the gap counts at once)
    and **"Fix the date"**;
  - the same choice in "Edit period dates".

### G5. Late, no plan: no home-test prompt (P0, safety)
- **Now:** Version 39.23 added "Period late?" (with the home-test line) only to the headline that plan users see. Without a
  plan, Today says "14 days past your likely range" and nothing else.
- **Fix:** the same "Period late?" row on the full cycle card once she is past her range. It opens the pregnancy test guide.
  - Discreet mode keeps plain words.
  - A woman trying for a baby gets her own words for it.
- **Doctor:** a negative test and still no period at 90 days → "see a doctor" (the finding exists) → Ask Qura.

### G6. Symptoms with no plan going: no free plan offered (P0; Mohit's third ask)
- **Now:** findings offer a doctor, but only a long gap offers a plan (the irregular-periods plan). Heavy flow, a long period,
  pain, mood and PMOS signs don't.
- **Fix:** every finding that has a fitting free plan shows two next steps in the same card:
  - the doctor step: free doctor or Ask Qura, by urgency as now;
  - **"Start a free plan for this"**.

  The map is in section 6. A plan is offered only when she has none going (as `offerOk` checks now), never in pregnancy or
  the first 6 weeks after a birth unless it is that stage's plan, never after a loss, and never instead of an urgent doctor
  step.

### G7. The "Sakhi says" slot hides the pairing (P1)
- **Now:** one card shows, and the rest fold under "More from Sakhi". The finding wins, so its plan goes out of sight.
- **Fix:** the finding card itself carries the plan step (G6), so the pair stays together on the first screen.

### G8. Irregular cycles get no forward look (P1)
- **Now:** "We show counts, not a date". Nothing about what to expect, or when to worry.
- **Fix:**
  - **A possible window** from her own shortest to longest gap: "Your next period could start between 31 Oct and 11 Nov
    (from your gaps of 23 to 34 days). An estimate, not a way to avoid pregnancy." Wording needs review.
  - **A long-gap line for PMOS:** "Gaps over 35 days are common with PMOS. No period for 90 days: see a doctor."
- **Doctor:** "Irregular for 6 months: ask a Qura doctor about PMOS checks (hormones, thyroid, an ultrasound)".
- **Plan:** offer the PMOS or irregular-periods 12-week plan (G6).

### G9. Trying for a baby with irregular cycles: no fertile days, no other help (P1)
- **Now:** fertile days need 6 regular gaps, so a woman with PMOS who is trying never sees them, and nothing says what to do
  instead.
- **Fix:** "With irregular cycles, dates can't show ovulation. Ovulation tests, the slippery discharge before ovulation, or a
  doctor's scan can." Plus the trying-for-a-baby checklist plan.
- **Doctor:** Ask Qura, right away with PMOS or irregular gaps. Otherwise after 12 months of trying (6 months from age 35);
  the plan's "see a gynaecologist now" path covers this once her plan runs. Wording needs review.

### G10. New users (1 or 2 periods) aren't told what unlocks (P1)
- **Fix:** in her first weeks, Today's reason line says "Add your last 2 periods to see when the next may come", with "Add a
  past period" (Version 39.23's sheet).
- After she adds periods, a short line says what changed: "Now: your next period date shows", or "1 more regular gap to go".

### G11. Numbers before they mean anything (P2)
- **Now:** "Spread of last 6: 0" with one gap.
- **Fix:** show "–" with "needs 3 gaps" until then. The same goes for "Shortest" and "Longest" with one gap.

### G12. On hormones the calendar loses even the cycle day (P2)
- **Fix:** keep "Day 11 since your last bleed" on the calendar strip, plain enough for discreet mode.

## 5. Where to recommend a Qura doctor

| What her diary shows | Urgency now | Add or keep |
|---|---|---|
| Danger signs (heavy bleeding with dizziness, pain with a late period, bleeding in pregnancy) | 112 and Help | keep; never a plan |
| A "see a doctor today" finding | free care near her | keep; Qura after the visit |
| Short gaps (2 of 6 under 21 days) | free doctor this month, TSH and Hb, Ask Qura | keep |
| A period over 8 days, or heavy flow | free doctor this week, Hb, Ask Qura | keep; **add the iron plan (G6)** |
| Late: past her range, or day 90 | keep an eye; at 90 days see a doctor, Ask Qura | **add "Period late?" for everyone (G5)** |
| Irregular gaps over 6 months | keep an eye (a quiet card) | **add Ask Qura about PMOS checks (G8)** |
| Severe pain, 2 periods running | this month, Ask Qura | keep; **add the cramps routine (G6)** |
| Low mood before periods, most cycles | this month | keep; **add the calm week or PMS tools (G6)**; PMDD words need review |
| PMOS signs (hair, acne) | this month | keep; **add the PMOS plan (G6)** |
| On the pill: bleeding between packs, side effects | nothing | **add Ask Qura (G3)** |
| Trying: irregular cycles, or 12 months (6 from 35) | the plan's doctor path only | **add Ask Qura without a plan (G9)** |
| Midlife: gaps over 60 days, hot flushes | keep an eye or this month | keep; offer the hot-flush routine (it exists) |
| Bleeding after periods stopped | this week | keep (no plan) |

## 6. Free plans to offer when symptoms show and no plan runs (G6)

| Finding or signs | The free plan | With the doctor step |
|---|---|---|
| A long gap, or irregular gaps | the irregular-periods 12-week plan (the cycle plan) | Ask Qura about PMOS checks |
| PMOS said, or PMOS signs | My PMOS plan | Ask Qura |
| Heavy flow or a period over 8 days | Iron by diet (21 days) and the iron tablet reminder if prescribed | Hb test this week (free doctor), Ask Qura |
| Severe cramps | the cramps routine (3 months) | Ask Qura about endometriosis signs |
| Low mood or irritability before periods | the calm routine and PMS tracker | Ask Qura if it disrupts life (PMDD) |
| Poor sleep for 2 weeks | Wind down and the sleep routine | doctor if it goes on |
| Hot flushes (40+) | the hot-flush routine and the weekly symptom diary | Ask Qura |
| Trying for a baby | Before you start: checklist | Ask Qura per G9 |
| Short gaps | none until a doctor has checked thyroid and Hb | free doctor first |

## 7. UI and UX principles for all of this

- **Never a dead end.** Every "nothing yet" says why and what unlocks it, with one tap to do it.
- **One reason at a time,** the most important first: stage and hormones, then a guessed date, then too few gaps, then
  irregular gaps.
- **Progress, not rules.** "1 more regular gap", not "needs 2 counted gaps within 7 days".
- **Two next steps, side by side:** a doctor step and a self-care step (a free plan), each one tap. An urgent doctor step
  stands alone.
- **The same answer on every screen,** from one engine: Today, the calendar, Cycles, the day page and the report.
- **Honest uncertainty.** Ranges and "estimate". Never "safe days". The "not a way to avoid pregnancy" line wherever dates
  show.
- **Plain words in discreet mode** and on a shared phone; Hindi at 360 px; no new place to look. Reasons sit where the
  missing insight would have been.

## 8. Build order (proposed)

- **Version 39.25 (P0):**
  - G1 the reason line, from one engine;
  - G2 "What Sakhi can tell you";
  - G3 on the pill;
  - G4 "Is 1 Oct right?";
  - G5 "Period late?" for everyone;
  - G6 and G7 a free plan beside the doctor step.
- **Version 39.26 (P1 and P2):**
  - G8 the possible window and the long-gap line;
  - G9 trying with irregular cycles;
  - G10 first weeks and "what changed";
  - G11 and G12 the numbers and the pill calendar.

Each version gets a mockup first.

## 9. For the doctor's review

All new health wording:
- the hormones reason;
- the pill card and its bleeding line;
- the possible window;
- the PMOS long-gap line;
- trying with irregular cycles (ovulation tests, discharge, scan);
- "Ask a Qura doctor about PMOS checks";
- the PMDD line;
- each "Start a free plan for this" pairing.
