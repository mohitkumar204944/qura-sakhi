# The Diary: an audit for daily use, with the evidence for each change (26 Oct 2026)

Mohit, 26 Oct: "can you properly audit and advise what should be done to bring it in best version and validate your every
suggestion with impact".

This follows `docs/home-plan-diary-audit-2026-10-26.md`, whose Diary items (R11 to R13) shipped in Version 39.16: "How do you
feel today?", the notes meter and the two-line key.

## Built (26 Oct)

Mohit, 26 Oct: "proceed with your recommendation". All 5 decisions went with the recommendation, and R1 to R10 were built.
- **Version 39.17** (R1 to R5, R10): MODULE_API section 60.
- **Version 39.18** (R6 to R9): MODULE_API section 61.
- **Tests:** `test/daynote.mjs`. The smoke test's 200% check now includes the day page, Cycles and Days.
- **Wording:** sections 19.17 and 19.18 of the wording review. "Bleeding after the birth" waits for the doctor.

Measured once built, at 360 × 780 (the woman with 3 months of entries):

| What | Before | Estimated | Built |
|---|---|---|---|
| Today's day page | 2,128 px, 30 choices | about 900 px, 10 choices + More signs | 1,188 px, 10 choices + More signs |
| The same choice twice on one page | 5 | 0 | 0 |
| Quick-choice sets | 4 | 1 | 1 |
| Note today from the Diary | 3 taps | 1 | 1 |
| + menu | 5 doors | 4 | 4 |
| "What repeats" on Cycles | 1,249 px down | first screen | first card |
| Report for my doctor | after 2.9 screens | within 1.5 screens | 1.8 screens (her cards above it are long) |
| Days, 15 entries | 262 words | about 150 | 188 (with the period headings) |

The day page is longer than estimated. Her period row, the sex row and the note box stay open, as R1 intended.

One extra beyond the audit: a woman whose periods have stopped sees hot flushes in place of cramps in the 5.

## How I checked

- **The build:** Version 39.16 (uncommitted), at 360 × 780, in English and Hindi.
- **The women:**
  - a woman with 3 months of entries (3 periods with flow and pain, 10 noted days, 2 notes);
  - a new woman (her first log);
  - a shared phone;
  - pregnancy;
  - 4 weeks after a birth;
  - a woman of 47.
- **Every Diary screen:**
  - the Calendar and its key;
  - the day page (today, and a period day);
  - the period details sheet;
  - the + menu;
  - Cycles, Days, "This month's signs" and Edit dates.
- **Measured:** each screen's length (in screens at 780 px), its choices, its words, and the taps for common jobs.
- **How each recommendation is backed up.** Each one gives:
  1. the problem, measured in the app;
  2. the research it rests on (sources at the end);
  3. the expected change in something we can count (taps, screens, choices, words);
  4. what to watch in the field test to confirm it.

  We can't promise percentages before the field test. The direction is backed by the research; the size will come from
  the pilot.

## What the Diary is for

A study of menstrual tracking drew on 687 people surveyed, 2,000 app reviews and 12 interviews (Epstein et al., CHI 2017). It found women track:
- to know where they are in their cycle;
- to remember and predict their period;
- to talk to a doctor.

Women often track without a goal of action, for awareness of where they are in their cycle. Apps fail them when their
predictions are wrong, and when they ignore life stages such as young adulthood, pregnancy and menopause.

So the best Diary does four jobs, in this order:
1. note today in seconds, and see that it counted;
2. show where she is: her cycle day, her next period, and when fertile days start;
3. show what her notes add up to: what repeats, and whether it's usual;
4. take it to a doctor.

It should also fit her stage, and stay plain on a shared phone.

## What already works (keep it)

- **Period and flow:**
  - "Period started" in one tap on Home;
  - flow in one tap on any bleeding day;
  - Edit dates.
- **The day page:** a week at a time, with the day's facts at the top.
- **"How do you feel today?"** on Home and in the evening check-in (Version 39.16).
- **The notes meter**, and the calendar's key in two lines.
- **My cycles, "Your cycle at a glance" and "What you noted"** (90 days, in plain words).
- **The private sex log** and its emergency pill line.
- **A shared phone:** plain words and no estimates.
- **Report for my doctor.**

## Findings (measured)

### A. Noting a day (job 1)

1. **The day page is a long form.**
   - Today's page is 2,128 px long: 2.7 screens, 41 buttons.
   - It offers 30 choices: 3 for her period, 2 for sex, and 25 signs in 5 groups.
   - A period day is 2,169 px. After a birth it's 1,782 px; on a shared phone, 1,857 px.
2. **Five choices appear twice on today's page.** Calm, Tired, Cramps, Low mood and Bloating sit in "How do you feel today?"
   and again in their groups. She can't tell whether she has to answer both.
3. **Four different "quick" sets.** In each place, the quick choices are different:

   | Place | Its quick choices |
   |---|---|
   | The first log | Cramps, Acne, Low mood, Tired, Nothing |
   | Home and the evening check-in | Calm, Tired, Cramps, Low mood, Bloating |
   | The period details sheet | Cramps, Headache, Bloating, Low mood, Tired, Poor sleep |
   | The + menu | "Symptoms" and "Mood": two doors to the same page |
4. **There's no way to note a good day.**
   - "Nothing" on the first log saves nothing.
   - "Calm" is a mood, not "I'm fine".
   - A day she was fine looks exactly like a day she didn't open Sakhi, so the meter can't count her good days.
   - "What repeats" counts a period only when she noted something from 8 days before it to 4 days after (`patterns()` in
     `app.js`). A period when she felt fine and noted nothing drops out of the count, so cramps in 3 of her last 5 periods
     can read "in 3 of the 3 periods with notes".
5. **The Diary doesn't open on "note today".**
   - The Calendar's only prompt is "Tap a day to log", in small print under the key.
   - Noting today from the Diary takes 3 taps (the date, a choice, Done); on Home it's 1.
6. **A note's toast doesn't say what it counts towards.** It says "Noted for today". What her notes unlock is only in the
   meter, which isn't on the Diary's first screen.

### B. Knowing where she is (job 2)

7. **One "what's next" line in two places.**
   - The Diary opens on the Calendar, but the meter is on Cycles.
   - The Calendar has its own line saying the same thing: "Fertile days show after 6 cycles. 4 more periods to log." The
     meter says "Next: 4 more periods, and your fertile days show."
8. **The Calendar's first screen doesn't show her cycle day or next period.** Home and the day page do.

### C. Seeing what her notes show (job 3)

9. **Cycles is long, and what repeats comes late.**
   - Cycles is 2,269 px (2.9 screens): 9 blocks, 203 words.
   - "What repeats for you" starts 1,249 px down (1.6 screens), after My cycles, the glance, "Your numbers" and Charts.
10. **Two habits make the same promise.**
    - "This month's signs" (once a month) says "It helps Sakhi notice what repeats". The daily note says "A note a day shows
      what repeats in your cycle".
    - The monthly one asks about PMOS signs (hair, acne, scalp, dark patches), heavy flow, mood and hot flushes. For most
      women at the cycle stage, little of it applies to them.
11. **Days is long and repetitive.**
    - 15 entries take 2,081 px and 262 words.
    - Every entry repeats an estimate, such as "20 days until your next period (estimate)". On a past day that reads oddly.
    - Entries aren't grouped by period, so a pattern like "cramps the day before" is hard to spot.

### D. Taking it to a doctor (job 4)

12. **"Report for my doctor" is at the bottom of Cycles**, after 2.9 screens. Yet talking to a doctor is one of the main
    reasons women track.

### E. Life stages

13. **In pregnancy the Diary shows period words.**
    - The key shows Bleeding, Spotting and Likely range.
    - The calendar says "These dates are estimates from your diary. They are not a way to avoid pregnancy."
    - It doesn't show her pregnancy week.
14. **After a birth the day page offers "Period started", with nothing for the bleeding after a birth.**
    - Her recovery check (with its warning signs) is where that bleeding is asked about, but the Diary doesn't point there.
    - So bleeding in the weeks after a birth can be logged as a period. The + menu already hides "Period started" in
      those weeks; the day page doesn't.
    - The key also shows "Likely range", though there's no estimate after a birth.
15. **At 47 it works well.** Above the calendar, "50 days since your last period" leads, with "What this means". Nothing to
    change.

### F. Reading and seeing

16. **Words.** The Calendar has 86 words, the day page 98 and Cycles 203, and Hindi has the same structure. The smoke test
    checks the Diary's first screen at the phone's largest text (200%) in both languages, but not the day page, Cycles or
    Days.

## Recommendations

Each has the problem it fixes, the evidence, the expected change, and what to watch in the field test.

### P0. The daily note: 10 seconds, every day (Version 39.17)

**R1. A short day page.** It opens with:
- the day's facts;
- her period row (and flow, on a bleeding day);
- "How do you feel?" with 5 choices and More;
- the 2-choice sex row;
- her note.

The other 20 signs sit under "More signs". That section opens by itself when one of them is already chosen for the day.

- Fixes 1 and 2.
- **Evidence:**
  - Longer questionnaires came with more burden, and fewer and poorer answers (Eisele et al. 2022; 163 students, 30 or 60
    items, 3 to 9 times a day for 14 days). A 2025 reanalysis of the same data found careless answers rose with how often
    people were asked, not with length (Ulitzsch et al. 2025). So the case for a short page rests on burden and the number
    of answers; R3 keeps the asking to once a day.
  - Showing the main choices and putting the rest one tap away improves learning, speed and error rates. What's used most
    must stay visible (Nielsen Norman Group, progressive disclosure).
  - Choosing takes longer as the number of options grows (Hick's law).
- **Expected change:**
  - today's page from 2,128 px to about 900 px (2.7 screens to about 1.2);
  - visible choices from 30 to 10, plus "More signs";
  - repeated choices from 5 to 0.
- **Watch in the field test:**
  - the share of days with any entry (the meter counts it);
  - the time from opening the page to Done;
  - how often "More signs" is opened. If one sign there is used by more than a third of the women, it moves up.

**R2. "Feeling okay": one tap for a good day.** This adds one new choice to the Diary (a word, not a symptom), and it is
the first chip everywhere.

- Fixes 4.
- **Evidence:**
  - A day with no entry is missing data, not a "no".
  - Her own "What repeats" rule only counts periods she noted something around (finding 4). "Feeling okay" keeps the
    periods she felt fine in, so a sign reads "in 3 of the 5 periods with notes" instead of "3 of 3". Checked in
    `patterns()`: with 2 more noted periods, the bar for "repeats" rises from 2 periods to 3.
  - A positive one-tap also makes the habit about checking in, not about feeling unwell. Habits grow fastest in the first
    repetitions (Lally et al. 2010).
- **Expected change:**
  - good days count in the meter;
  - "What repeats" counts the periods she felt fine in;
  - "Nothing" on the first log saves something.
- **Watch:** the share of entries that are "Feeling okay", and the days noted per month.

**R3. One set of quick choices everywhere.** The set is: Feeling okay, Tired, Cramps, Low mood, Bloating, then More. It
goes on:
- Home;
- the day page;
- the first log;
- the evening check-in;
- the period details sheet.

Once she has answered, each of those places shows her answer instead of asking again.

The + menu's "Symptoms" and "Mood" become one "How I feel": Period started (or ended), Spotting, How I feel and Note, 4
doors instead of 5.

- Fixes 3.
- **Evidence:**
  - "Consistency and standards" is one of Nielsen's 10 usability heuristics: the same words and actions should mean the
    same thing everywhere.
  - Fewer options means faster choices (Hick's law).
  - Careless answers rose with how often people were asked (Ulitzsch et al. 2025), so one question a day, answered once.
- **Expected change:**
  - quick sets from 4 to 1;
  - the + menu from 5 doors to 4;
  - the same choices in the same place, learned in days.
- **Watch:** wrong taps undone within a minute (the "Undo" toast), and the time to note.

**R4. Note today on the Diary's first screen.** A "Today" strip goes above the calendar:
- her cycle day and next period, in one line;
- the same 5 choices and More;
- the meter ("Noted on 9 of 27 days · Next: …"), moved here from Cycles.

The Calendar's own fertile-days line merges into the meter.

- Fixes 5, 7 and 8.
- **Evidence:**
  - Women often track for awareness of where they are in their cycle (Epstein et al. 2017), and the Calendar is the first
    thing the Diary shows.
  - Measured: noting today from the Diary takes 3 taps now, 1 with the strip.
- **Expected change:**
  - noting today from the Diary from 3 taps to 1;
  - two "what's next" lines become one;
  - her cycle day on the first screen.
- **Watch:** how many notes start on the Diary, and the days noted per month.

**R5. Say what the note counted towards.**
- After a note, the toast becomes "Noted · 9 of 27 days this month".
- On the period that completes 3 with notes: "What repeats for you is ready" (only where that card shows; it needs 3
  periods with notes).
- Fixes 6.
- **Evidence:** in 122 evaluations (44,747 people), noting what you do worked best when combined with feedback or a goal:
  an effect of 0.42 against 0.26 (Michie et al. 2009).
- **Expected change:** every note shows its reason to come back, at the moment she notes it.
- **Watch:** the share of women who note again the next day.

### P1. What her notes show, the doctor, her stage (Version 39.18)

**R6. Cycles in the order of her questions:**
1. What repeats for you (or how many more periods with notes it needs);
2. My cycles;
3. Is it usual (the glance);
4. Report for my doctor (moved up from the bottom);
5. then the charts, What you noted and My records.

- Fixes 9 and 12.
- **Evidence:** women track for awareness and for talking to a doctor (Epstein et al. 2017).
- **Expected change:**
  - "What repeats" moves from 1,249 px down to the first screen;
  - the doctor report moves from the bottom (2.9 screens) to within the first 1.5 screens.
- **Watch:** report opens per month, and taps on "What repeats".

**R7. Days grouped by period.**
- Each period gets a heading: "Period from 17 Oct · 28-day cycle".
- Each entry shows only "Day 9" and her notes. The estimate lines go (the day page keeps them).
- In past cycles, "2 days before your period" stays only on entries from the 8 days before a period, where patterns are.
- Fixes 11.
- **Evidence:**
  - Grouping related items limits how much she weighs at once (the design advice that follows from Hick's law).
  - Sakhi's own "What repeats" looks at 8 days before each period to 4 days after. Days grouped by period shows her the
    same window, so she can see what Sakhi sees.
- **Expected change:**
  - the same 15 entries in about 150 words instead of 262;
  - her pattern visible period by period.
- **Watch:** time spent on Days, and edits from Days.

**R8. "This month's signs" named by what it asks, and shown where it fits.**
- It becomes "Skin and hair signs, once a month" for PMOS (her goal, or Sakhi's suggestion), and "Midlife signs" for women
  40 and over.
- Its line changes to what it's for: the signs a doctor asks about in PMOS, or in midlife.
- Women it doesn't fit don't see it. Their daily note covers mood and flow.
- Fixes 10.
- **Evidence:**
  - Two habits with the same promise make her choose between them.
  - Shorter questionnaires came with less burden (Eisele et al. 2022), and asking only what applies to her is shorter.
- **Expected change:** one daily habit, plus one monthly with a clearly different job, only for the women it fits.
- **Watch:** the monthly completion rate where it shows (it should hold or rise).

**R9. The Diary at her stage.**
- In pregnancy: no period marks, no estimates and no contraception line. Show her week instead ("Week 21 of your
  pregnancy").
- In the first weeks after a birth:
  - the day page shows "Bleeding after the birth" in place of "Period started", which opens her recovery check (its
    reviewed warning signs);
  - no "Likely range";
  - "Period started" comes back once she says her periods have returned.
- Fixes 13 and 14.
- **Evidence:**
  - Period apps fail women in pregnancy and menopause (Epstein et al. 2017).
  - Bleeding after a birth needs the recovery check's warning signs, not a period entry.
- **Expected change:**
  - no period words in pregnancy;
  - bleeding after a birth reaches the reviewed warning signs.
- **Watch:** after-birth bleeding entries that open the recovery check.
- **Doctor:** the "Bleeding after the birth" label is new wording on a safety path. It should go to the doctor before it
  ships.

### P2. Reading (any version)

**R10. Read aloud and Hindi for every new line.**
- The day page and the Today strip get the speaker that cards already have (Version 39.8).
- Labels stay 1 to 3 words, with a picture.
- The smoke test's 200% text check adds the day page, Cycles and Days (finding 16).
- **Evidence:** text interfaces weren't usable by first-time low-literacy users, and caused errors even for literate users
  new to phones. A graphical interface had the highest task completion, and speech was faster for those at ease with it
  (Medhi et al. 2011: 90 people in India, Kenya, the Philippines and South Africa, then over 70 in India).
- **Expected change:** every new screen readable without reading.
- **Watch:** read-aloud taps on the Diary in the field test.

## Before and after (the numbers to check once built)

| What | Now | After |
|---|---|---|
| Today's day page | 2,128 px (2.7 screens), 41 buttons, 30 choices | about 900 px (1.2 screens), 10 choices + More signs |
| The same choice shown twice on one page | 5 | 0 |
| Quick-choice sets | 4 | 1 |
| Note today from the Diary | 3 taps | 1 tap |
| A good day | can't be noted | 1 tap |
| + menu | 5 doors | 4 |
| A period she felt fine in | left out of "What repeats" | counted |
| "What's next" lines on Diary | 2 (in two tabs) | 1, on the first screen |
| "What repeats" on Cycles | 1,249 px down | first screen |
| Report for my doctor | after 2.9 screens | within 1.5 screens |
| Days, 15 entries | 262 words | about 150 |
| Period words in pregnancy | yes | none |

## Build order

| Version | What | Size |
|---|---|---|
| 39.17 | R1 to R5: the short day page, "Feeling okay", one quick set, Today on the Diary, what a note counts | Medium. Tests: diary, daily, joining (first log), protect, records |
| 39.18 | R6 to R9: Cycles by her questions, Days by period, the monthly signs where they fit, her stage | Small to medium. Tests: records, diary, goals (stages); one label for the doctor (R9) |
| any | R10 | Small |

**Wording.**
- New labels: "Feeling okay", "More signs", "Noted · 9 of 27 days this month", "What repeats for you is ready", and the
  monthly check-in's new names.
- No new health advice. R8 reuses the reviewed sign lists, and R9 reuses the reviewed recovery check.
- "Bleeding after the birth" goes to the doctor first.

## Decisions for Mohit

1. **"Feeling okay" as a new choice** (recommended), or keep "Calm" as the good-day choice?
2. **The day page short, with "More signs"** (recommended), or keep every sign open?
3. **"This month's signs" only for PMOS and 40 and over, by its new names** (recommended), or for everyone under a new name?
4. **Report for my doctor moved up in Cycles** (recommended)?
5. **Order:** P0 first (Version 39.17), then P1 (39.18)?

## Sources

- Epstein D. A. et al. (2017). Examining Menstrual Tracking to Inform the Design of Personal Informatics Tools. CHI 2017.
  https://pmc.ncbi.nlm.nih.gov/articles/PMC5432133/
- Eisele G. et al. (2022). The effects of sampling frequency and questionnaire length on perceived burden, compliance, and
  careless responding in experience sampling data. Assessment.
  https://cris.maastrichtuniversity.nl/en/publications/the-effects-of-sampling-frequency-and-questionnaire-length-on-per/
  Reanalysis: Ulitzsch E. et al. (2025), Psychological Assessment.
  https://cris.maastrichtuniversity.nl/ws/files/262214670/Viechtbauer-2025-Investigating-the-effect-of-experience-sampling.pdf
- Nielsen Norman Group. Progressive Disclosure. https://www.nngroup.com/videos/progressive-disclosure/
- Nielsen J. 10 Usability Heuristics for User Interface Design (Nielsen Norman Group).
  https://www.nngroup.com/articles/ten-usability-heuristics/
- Hick's law, in Yablonski, Laws of UX (O'Reilly). https://oreilly.com/library/view/laws-of-ux/9781098146955/ch04.html
- Lally P. et al. (2010). How are habits formed: Modelling habit formation in the real world. European Journal of Social
  Psychology 40, 998–1009. Summary: https://bps.org.uk/research-digest/how-form-habit
- Michie S. et al. (2009). Effective techniques in healthy eating and physical activity interventions: a meta-regression.
  Health Psychology 28(6), 690–701. https://pubmed.ncbi.nlm.nih.gov/19916637/
- Medhi I., Patnaik S., Brunskill E., Gautama S. N. N., Thies W., Toyama K. (2011). Designing Mobile Interfaces for Novice
  and Low-Literacy Users. ACM TOCHI.
  https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/ToCHI2711_Medhi.pdf
