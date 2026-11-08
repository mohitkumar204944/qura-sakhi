# Teach and show: taking Sakhi past Clue (advice, 8 Nov 2026)

Mohit, 8 Nov, after the Clue walks: "Clue is better at teaching and presentation and sakhi needs to level up ... sakhi needs
to be the best in all aspects". Clue's notes stay at principle level (the competitor-report rule); this document is about Sakhi.

**Status:** part 1 (L1 to L4) is Version 39.83 (committed 590363e; MODULE_API section 126). Mohit, 8 Nov: "you proceed as per
your recommendations": part 2 (L5, L6) is Version 39.84 (MODULE_API section 127, `web/test/bodynow.mjs`), built without a
separate mockup (its screens are the real app's). Part 3's L7 is Version 39.85 (MODULE_API section 128, `web/test/learnpage.mjs`);
L8, the recorded voice, waits for Mohit's OK (it runs on his paid voice account). Part 4 (L9's audit, `docs/presentation-audit-2026-11-08.md`,
and L10) is Version 39.86 (MODULE_API section 129, `web/test/chartlang.mjs`); the audit's decisions D1, D3 and D5 are Version 39.87
(MODULE_API section 130, `web/test/auditdecide.mjs`); D2 and D4 stay as they are. L7's subheads are Version 39.88 (MODULE_API
section 131): the articles' own lead-ins and labels; three proposed subheads for one article wait for the doctors (review 19.88).

## 0. In one paragraph

Clue's lead comes from **when and how** it teaches: at the moment of need (today, just logged, late), with pictures, a bold
look, and a doctor report that shows timing. Sakhi already has much of what Clue charges for: her own patterns, a doctor
report, plans, a full pregnancy week page. It also has what Clue lacks: honest dates, safety cards, Hindi, read-aloud, working
offline, and every guide leading to something to do. So the level-up is not copying Clue's look. It is:
- teaching at the moment of need;
- teaching from her own diary;
- teaching honestly about what Sakhi can't know;
- teaching in pictures and a natural Hindi voice;
- ending every explanation in one thing to do;
- then a presentation pass, so Sakhi looks as good as it is.

Ten recommendations follow, in four parts. Part 1 needs no doctor review and can be built now.

## 1. Scoreboard

| Aspect | Ahead now | What puts Sakhi clearly ahead |
|---|---|---|
| Teaching at the moment of need ("what's happening in my body") | Clue | L5 Your body now; L4 a log toast from her own patterns |
| Pictures of the body | Clue | L6 the cycle in pictures |
| Voice for women who read less | Sakhi (the phone's own reading voice) | L8 a natural recorded voice for the key explainers |
| Her own patterns | Sakhi ("What repeats for you" is free; Clue's analysis is paid) | L1 and L4 put them to work |
| Doctor report | Clue (symptom timing) | L1 "When it comes" (mockup ready) |
| Showing the payoff before effort | Clue | L3 |
| Reminders she can trust | Even (Clue shows a preview; Sakhi is discreet) | L2 a lock-screen preview |
| Visual polish, charts | Clue | L9 a presentation audit; L10 one chart language |
| Articles: format and trust | Even (both have sources) | L7 "In short", a real picture, and when a doctor checked it |
| Honest dates | Sakhi | keep `test/traps.mjs` green |
| Safety (danger signs in search, doctor steps) | Sakhi | keep `test/urgent.mjs` green |
| Privacy and working offline | Sakhi | keep (the diary never leaves the phone) |
| Cost | Sakhi (free; Clue charges ₹599 a year) | say so in the Play listing |
| Language and India fit | Sakhi | Hindi parity at 360 px for every new screen |
| Plans that lead to doing | Sakhi (Clue has none) | keep V39.53's "every guide leads to her plan" |
| Accessibility | Sakhi (named controls; many of Clue's switches had no name for screen readers) | keep V39.76 |
| Library size | Clue | depth through format, not count (L7, L8); add only the questions women ask in the pilot |

## 2. What Sakhi already has (don't rebuild it)

- **What repeats for you** (core `patterns()`, Diary): symptoms she noted from 8 days before to 4 days after most of her last 3
  to 6 periods, not just as often mid-cycle. Ready after 3 periods with notes, with "What repeats for you is ready".
- **After a log**: "Noted · {n} days this month" with **What helps** going to the right answer (`helpFor`, per stage).
- **Articles**: summary, body, When to see a doctor, How Qura can help, her plan, the tool, Ask a doctor, related, Sources,
  Listen (the phone's reading voice), and a group picture.
- **Day facts**: "Day {n} of your cycle/period" and days to the next period (estimate). The phase label shows on calendar days
  only where Sakhi has a fertile estimate.
- **Pictures**: food, danger signs, pregnancy produce, Sakhi herself (all inline SVG in `art.js`, offline, themed). Also the 3D
  moves, and the recorded voice with captions in Wind down and the relief routines.
- **Elsewhere**: the weekly "Did you know?", "Sach ya Myth?", the pregnancy week page, month summaries, and Your Sakhi's "What
  your dates show".

## 3. How Sakhi should teach (the principles)

1. **At the moment of need.** Today, the day she just logged, a late period: not only in Learn.
2. **Her diary first, general facts second.** "Your cramps usually come on day 1" beats a paragraph on cramps.
3. **Honest about what Sakhi can't know.** With long or few gaps, say so and teach that instead of drawing phases.
4. **Picture and voice first, text third.** About 3 in 10 women aged 15 to 49 in India can't read (NFHS-5). Pictures raise
   attention, understanding, recall and following advice (Houts 2006). Spoken words with a picture teach better than printed
   words with a picture (Mayer and Moreno 2003).
5. **One thing to do at the end.** A plan step, a tool, or a doctor, as V39.53 already does for guides.
6. **Nothing new on Today.** One tap from a line she already reads. No tours, tips or celebrations (the minimal baseline).

## 4. Recommendations

### Part 1: show what she gets (UI words only, no doctor wait)

**L1. Report for my doctor: "When it comes".** Mockup: claude.ai/artifact/QQ7BurjQ7QVACoTbQkEG4y.
- What: one table of days noted per symptom: before her period, during it, and other days, over her last 3 complete cycles.
  It replaces "What I noted (last 90 days)" once 2 complete cycles have notes (one home per fact). It appears in Share/Copy,
  big letters and the PDF.
- Build it on the **same engine as What repeats for you** (its gate and cycles), so the Diary and the report never disagree. As
  built: the week before her period is 7 days, the clinical week, which is also the PMS log's window in the same report (What
  repeats for you keeps its 8-day look-back for finding repeats).
- Why: doctors confirm PMS and PMDD from day-by-day records over at least 2 cycles (ACOG guideline, 2023). Pain outside the
  period is a question for the doctor too.
- Hidden: pregnant, on hormones, after a birth until periods return, periods stopped, fewer than 2 complete cycles, guessed
  starts.
- Size M. Review: labels only.

**L2. The lock-screen preview.**
- What: where her reminders are named (the Start card, Me > Reminders), show what the lock screen will display, e.g.
  "On your lock screen: Sakhi, with no details" (or her words if she turned them on; discreet mode's own words).
- Why: it makes the privacy promise visible. Today Sakhi says "Nothing shows on the lock screen" but never shows it.
- No question, no new ring (V39.27). Size S.

**L3. Show the payoff.**
- On the report's empty state: "See an example", a made-up report clearly marked "Example, not your data". It is rendered
  read-only and never touches her diary (unlike the demo samples).
- On What repeats for you's waiting card: a small example of what will appear after 3 periods with notes.
- Nothing new before her first step. Size S.

**L4. The log toast speaks from her patterns.**
- What: when she logs a symptom that's in What repeats for you, the toast says so, e.g. "Cramps noted · usually on day 1 of
  your period (3 of 3)". It uses the existing `pat_*` lines and keeps What helps.
- It says nothing when the day doesn't fit her pattern: no alarms from a guess.
- Why: Clue answers a log with context. Sakhi can answer from her own diary, for free. Size S.

### Part 2: Your body now (new lines, so the doctors' one read)

**L5. "Your body now", one tap from the day line she already reads.**
- What: "Day 22 of your cycle" on Today's cycle card and the day page opens one page. It changes with what Sakhi can honestly
  know:
  - **Period days**: what's happening, what's normal for flow and pain, the relief routine, and when to see a doctor (the
    reviewed heavy-bleeding lines).
  - **A cycle Sakhi can place** (it already has a fertile estimate): before ovulation, fertile days (estimate), after
    ovulation, with 3 lines each. While trying, the fertile-days page.
  - **A cycle Sakhi can't place** (long or few gaps, guessed start): "Day 42 of a long cycle". It says why Sakhi can't tell
    the phase (the V39.25 lines), what long gaps can mean and when to see a doctor (reviewed lines), and her plan's offer
    (V39.53). This honest version is where Sakhi beats Clue for women with PMOS.
  - Every state adds "Last cycle around this day you noted ..." from her diary, a picture (L6) and Listen.
- Hidden: pregnant (the week page exists), after a birth (recovery days exist), on hormones (the pill card), periods stopped,
  discreet mode and a shared phone.
- Baseline: no card on Today, no tip; the page is one tap behind an existing line.
- Size L. Review: about 30 short lines in each language. Mockup first.

**L6. The cycle in pictures.**
- What: 6 simple drawings in `art.js` style (inline SVG, offline, light and dark, labelled in both languages):
  1. the cycle as a circle in 4 parts;
  2. the lining building;
  3. an egg leaving the ovary;
  4. the period;
  5. PMOS: many small follicles, not "cysts";
  6. a long cycle, no egg released yet.
- Used by L5, the cycle and PMOS articles, and "Period late?".
- Note: Mohit's 5 Nov "no see-through model" was about the exercise figure. These are flat teaching drawings, but his call.
- Size M. Review: the doctors check the drawings with the lines.

### Part 3: Learn that speaks

**L7. Articles in a better format.**
- What:
  - an "In short" box at the top (the article's `summary`, already written and reviewed, today shown only in lists);
  - 2 to 4 subheads in the body;
  - one picture that teaches where one exists (L6, the danger-sign and food pictures);
  - "Checked by Qura's doctors · Oct 2026" only on articles whose current text was reviewed (a per-article flag; no names,
    Mohit's 6 Nov rule).
- Size M. Review: the subheads only.

**L8. A natural voice for the explainers that matter most.**
- What: recorded narration, Hindi first, then English, with captions, for:
  - the "In short" and "When to see a doctor" parts of the 15 most-read articles;
  - the L5 states;
  - Help's danger signs.
- It uses the existing voice tools (`web/tools/voice`, `captions.mjs`, "your trainer" voice). The phone's reading voice stays
  the fallback for everything else.
- Why: Hindi reading voices on many phones sound robotic. A warm, clear voice is the one teaching channel Clue doesn't have.
- Record only reviewed text. Size M (a few MB, fine: app size is not a barrier).

### Part 4: look the best

**L9. A presentation audit of the 12 screens she sees most.**
- Screens: Today (cycle, plan and pregnancy states), the day page, the calendar, Cycles, the report, a Learn article, Help, the
  plan page, Wind down, Your Sakhi, Explore, Me. In English and Hindi at 360 px, light and dark.
- Score each against:
  - one focal point;
  - the number she came for is the biggest thing;
  - meaning never under 13 px;
  - the same icon and hue per symptom kind everywhere (the report has none today);
  - colour only with meaning;
  - motion that explains, not decorates;
  - empty states that say what comes next;
  - the 10-second day.
- Shots come from the existing walks (`glass-walk`, `census-walk`). The output is a scored list and the fixes.
- Sakhi's colours stay (Mohit's 30 Oct rule), and `glass-contrast` must pass. Size M.

**L10. One chart language for her data.**
- The same bars, bands and labels for:
  - her cycle lengths, with her usual range as a band;
  - the L1 timing table (and Option B in the PDF if chosen);
  - month summaries;
  - Trends.
- Numbers written on the chart, the symptom-kind hues, and the same in the PDF. Size M.

## 5. Order

1. **Part 1 (L1 to L4) as one version, now.** UI words only, so nothing waits for the doctors. L1 needs Mohit's pick from the
   mockup (Option A recommended).
2. **Part 2 (L5, L6).** Mockup first, then one doctor packet with the lines and drawings.
3. **Part 3 (L7, L8).** L7's format can go first. L8 records only reviewed text.
4. **Part 4 (L9, L10).** The audit can run any time, since it reads only. Its fixes go into the version after.

## 6. Measure it

- **Understanding, in the pilot.** The field-test coordinator asks 10 women 5 teach-back questions (Schillinger 2003), before
  and after 2 weeks:
  1. what to do first when a period is late;
  2. two signs that mean go to the hospital now;
  3. when Sakhi says her next period is, and how sure it is;
  4. when her cramps usually come;
  5. what helps them.

  Answers stay on paper: nothing leaves the phone. Aim for 4 of 5.
- **Taps**, per the baseline: `web/test/taps/` before and after each part.
- **Use**: taps on the new places through the existing usage events, by place only. Never a topic name, and never on a private
  screen.

## 7. Don't copy

- tips and coach marks on every tab;
- a community feed;
- a 30-group log list (and the search it needs);
- paywalls and countdown deals;
- "1 in 3 users feel ..." lines: Sakhi can't count other women, because the diary never leaves the phone. Published figures
  could stand in, with the doctors' read.
- phases drawn for cycles Sakhi can't place.

## 8. Decisions for Mohit

1. L1: Option A or B (or A, with B in the PDF); 3 cycles or up to 6.
2. L6: are simple flat drawings of the uterus and ovaries all right?
3. L8: narrate in the Wind down trainer's voice, or record a new one?
4. L7: "Checked by Qura's doctors · {month}" with no names: all right?
5. Start with part 1 now?

## Evidence

From my own knowledge: check exact figures before quoting them outside.

- Houts PS, Doak CC, Doak LG, Loscalzo MJ. The role of pictures in improving health communication. Patient Educ Couns.
  2006;61(2):173-190.
- Mayer RE, Moreno R. Nine ways to reduce cognitive load in multimedia learning. Educ Psychol. 2003;38(1):43-52.
- Schillinger D, et al. Closing the loop: physician communication with diabetic patients who have low health literacy. Arch
  Intern Med. 2003;163(1):83-90 (teach-back).
- ACOG Clinical Practice Guideline No. 7: Management of premenstrual disorders. Obstet Gynecol. 2023 (prospective daily symptom
  ratings over at least 2 cycles).
- van Eijk AM, et al. Menstrual hygiene management among adolescent girls in India: a systematic review and meta-analysis. BMJ
  Open. 2016;6:e010290 (about half were told about periods before their first one).
- NFHS-5 (2019-21), India fact sheet: about 7 in 10 women aged 15 to 49 are literate.
