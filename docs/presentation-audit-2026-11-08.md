# Presentation audit: the 12 screens she sees most (8 Nov 2026)

L9 of `docs/teach-and-show-advice-2026-11-08.md` (Mohit, 8 Nov: "you proceed as per your recommendations").

**Status:** Version 39.86 (MODULE_API section 129, `web/test/chartlang.mjs`) builds the fixes marked "built" below, together with
L10 (one chart language). The decisions in section 4 are Mohit's and are not built.

## 1. How it was done

- **The walk.** `node web/test/present-walk.mjs [dir] [name]` (in the repo) photographs and measures the first screen of each place,
  for four women: her cycle with no plan (8 regular periods, notes in the last 4); PMOS plan day 29; My pregnancy at 24 weeks; and
  one who joined today with nothing logged (the empty states). Screens and measures go to `web/test/shots/present-walk/<name>/`.
- **The screens.** Today (cycle, plan, pregnancy), the day page, the calendar, Cycles, the report, a Learn article, Help, My plan,
  Wind down, Your Sakhi, Explore, Me, and the empty Today, calendar, Cycles and report.
- **The ways.** English and Hindi, light and dark, at 360 x 800 (the Flip5): 72 first screens.
- **Measured:** every text under 13 px; the biggest text (the focal point); animations running; the page's length in screens.
- **Looked at by eye:** every screen in English light, and the busiest ones in Hindi and dark.
- **Added on the way:** My progress (its chart is one of L10's), and the Cycles tab's Charts section open.

## 2. Scores

Criteria (from the advice):
1. one focal point;
2. the number she came for is the biggest thing;
3. meaning never under 13 px;
4. the same picture and colour for each kind of sign;
5. colour only with meaning;
6. motion that explains, not decorates;
7. empty states say what comes next;
8. the 10-second day.

✓ holds, ~ partly, ✗ fails, – doesn't apply. "Tabs" means the tab bar's labels at 12 px.

| Screen | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Today, her cycle | ~ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | Two big numbers: cycle day 42 px, days to her period 34 px (D1). Its likely range broke inside a date ("26 Nov – 2 / Dec"; Hindi "2 / दिस॰"). Tabs. |
| Today, her plan | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | – | ✓ | Days to her period 50 px. Tabs. |
| Today, pregnancy | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | – | ✓ | "24 weeks" at 64 px. Tabs. |
| Day page | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | – | ✓ | Weekday letters at 12 px. |
| Calendar | ✓ | – | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | Weekday letters at 11 px. The + covers a day while she isn't scrolling (D5). |
| Cycles | ✓ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | – | What repeats for you leads, by Version 39.18's order. The Charts section's numbers at 12 px. Band and line explained only in the note under each chart. |
| Report | ✓ | ✓ | ~ | ✗ | ✓ | ✓ | ✓ | – | "When it comes" had no pictures, while What repeats for you and What you noted give each sign its picture and colour. |
| Learn article | ✓ | – | ~ | – | ✓ | ✓ | – | – | Version 39.85's format. |
| Help | ✓ | – | ~ | – | ✓ | ✓ | – | ✗ | "Go to the nearest hospital now if" started at 837 px, below the first screen. Version 15 put it right under "Not an emergency?"; Version 39.77's gynaecologist card had landed between them. |
| My plan | ✓ | ✓ | ~ | – | ~ | ✓ | – | ✓ | Two play-button styles: white for yoga, dark for Wind down. The dark means night, so it stays (D4). |
| My progress | ✓ | ✗ | ✗ | – | ✓ | ✓ | – | – | No minutes on the bars. The numbers under the bars were weeks, where the gap chart puts values. Chart text at about 10 px on the Flip5. |
| Wind down | ✓ | – | ~ | – | ✓ | ✓ | – | ✓ | Dark play buttons mean night. |
| Your Sakhi | ✓ | – | ✓ | – | ✓ | ✓ | – | ✓ | |
| Explore | ✓ | – | ~ | – | ~ | ✓ | – | – | Each topic row in its group's colour. |
| Me | ✓ | – | ~ | – | ~ | ✓ | – | – | Each row in its own colour, with no meaning (D3). |

Measured and fine everywhere: no animation loops on any first screen. The empty states all say what comes next:
- Today: "Log the day your last period started. Sakhi then shows your cycle day…";
- the Diary: "Why log every day?" with its three reasons;
- the report: "Nothing to show yet…", with "See an example".

## 3. Built in Version 39.86

- **P1, Help.** "Go to the nearest hospital now if" is right under "Not an emergency?" again, as Version 15 set it. It now starts at
  507 px (522 px in Hindi), on the first screen. The gynaecologist or free government card follows it. No words changed.
- **P2, dates.** Each date in Today's likely range stays on one line (`rangeHtml`, the words are `fmtRange`'s).
- **P3, 13 px.** These are now 13 px:
  - the tab bar's labels (from 12 px; the bar stays 65 px);
  - the calendar's weekday letters (from 11 px);
  - the day page's weekday letters (from 12 px);
  - every number on a chart.

  After the change, the only text under 13 px on the 72 first screens is "QURA" over the Sakhi wordmark, which is the logo.
- **L10, one chart language.**
  - Her value sits on top of each bar.
  - The usual band ("21–35") and the 8-day line ("8") are labelled beside the bars.
  - My progress shows her minutes on top of each week, the week under it, and "target: {n}" in its legend.
  - The report's "When it comes" gives each sign its own picture in its kind's colour, as What repeats for you does, and the
    colours stay in print.
- **Taps:** unchanged. Nothing was added that she has to tap: no screen, step or button.

## 4. Decisions for Mohit (not built)

- **D1. Today with no plan: one big number.** The ring's cycle day is 42 px and the days to her period 34 px. Once a plan runs, the
  days to her period is the biggest (50 px) and the cycle day sits in the small ring. Recommend the same for the no-plan card: the
  days to her period biggest, the cycle day in the ring at the plan card's size. That gives one focal point, the number most women
  open a period app for. Not built, because Version 39.23's card came from an approved mockup.
- **D2. Three type voices.** The serif titles, the handwritten section heads (What repeats for you, My cycles, the month) and the
  sans text. Recommend keeping them as they are and adding no fourth. Observation only.
- **D3. Rows that each take their own colour (Me).** That is colour without meaning. Recommend one colour per kind of row (her
  data, care, settings) or the page's one accent. Not built: it changes how the palette is used (Mohit, 30 Oct: the colour scheme
  stays).
- **D4. My plan's two play-button styles.** The dark one means night (Wind down). Keep.
- **D5. The + over a calendar day while she isn't scrolling.** It steps aside when she scrolls (Version 39.76). A little room under
  the calendar would clear it. Small; not built.

## 5. Measure again

Run `node web/test/present-walk.mjs . <name>` before and after any presentation change and compare `measures.json`. "now" is the
walk before Version 39.86 and "after" the walk after it. Both are in `web/test/shots/present-walk/`, which is gitignored.
