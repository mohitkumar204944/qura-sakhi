# Care's "For you": audit and advice (23 Oct 2026)

Mohit asked: "can you audit and advise if For you section gets actually personalised to stage of patient and inputs ?"
This audit reads `forYouKeys`, `FOR_YOU` and `forYouTiles` in `web/app.js` (around lines 966 to 997). It ran 21 kinds of woman
through the app in a pilot build (`0.34.1-pilot`) and a test build (`0.34-test`), using the sample diaries plus edits, and
read the five tiles each one got. Nothing was changed.

## Verdict

**Partly.** "For you" follows her **stage** well. It also follows her **contraceptive method** and the **PCOS** switch, but only
when nothing else applies. It **ignores what she logs**, so a late period, heavy flow or a pregnancy loss changes nothing.
There are also three cases where it shows the wrong thing.

## How it works today

- Her situation gives a list of groups, in this order: pregnant, after a birth (up to 365 days), trying, PCOS, 45 or over /
  midlife, on a method, avoiding pregnancy, then the general "cycle" group.
- Each group has 5 fixed tiles. Tiles are taken group by group until there are 5. **In practice the first group that applies
  fills all 5 places.**
- Inputs it reads:
  - stage flags: `pregnant`, `deliveredOn`, `planning`, midlife or age 45 and over;
  - `pcos` (from Me > My situation, or the Pattern check);
  - her contraceptive method;
  - whether she has a diary at all.
- Inputs it doesn't read:
  - period starts, late or missed periods, flow, pain, symptoms, discharge, mood;
  - check-in answers;
  - a pregnancy that ended;
  - `breastfeeding`, `thyroid`, `hysterectomy`, `hormones`;
  - age under 45;
  - whether the diary is empty.
- Test builds hide the triage tools (`fertile`, `pattern`, `cond-labs`, `midlife`). The list just moves up, so nothing breaks.

## What each woman gets (pilot build)

| Her situation | "For you" shows | Right? |
|---|---|---|
| Pregnant, 24 weeks | Pregnancy plan, Iron, Money and free care, This week, Pregnancy logs | Yes |
| Baby 3 weeks old | Iron, Contraception after birth, Schemes, Recovery check, Breastfeeding | Yes |
| Trying for a baby | Trying, Before you start, Fertile days, Signs log, Tests | Yes |
| Age 47, or periods changing | Check-ups, Symptom diary, Menopause, Midlife picture, HRT | Yes |
| On the pill | My method, Missed pill, Reminders, What your diary shows, Check-ups | Yes |
| PCOS, not trying | What your diary shows, Pattern check, Lab results, Mood and body, Anaemia | Yes |
| **Pregnancy ended 2 weeks ago** | What your diary shows, Check-ups, Reminders, **Period pain, Contraception** | **No**: nothing on loss; contraception two weeks after a miscarriage can hurt |
| **Baby 5 months, periods back, stage set to "Tracking my periods"** | Iron, Contraception after birth, Schemes, Recovery check, Breastfeeding | **No**: Home says "periods", For you stays on "after birth" for the whole first year |
| **Baby 3 weeks, not breastfeeding** | ...Breastfeeding | **No**: the Breastfeeding tile shows anyway |
| Period 3 weeks late | What your diary shows, Check-ups, Reminders, Period pain, Contraception | Weak: "Missed period: what now" exists but isn't offered |
| Irregular cycles and heavy flow | Same 5 as anyone | Weak: Home says "see a doctor this week"; For you offers Period pain, not "Anaemia and heavy periods" |
| PCOS and trying (Priya) | 5 trying tiles | Weak: no PCOS tile at all |
| PCOS and on the pill | 5 PCOS tiles | Weak: **"Missed or late pill" disappears** |
| New, nothing logged / "Just learning" | What your diary shows, Check-ups, Reminders, Period pain, Contraception | Weak: diary tools before she has a diary; a learner gets the same as a tracker |
| Browse only (no diary), adult | All guides for girls, Periods, Contraception, Missed period, Check-ups | Weak: the girls' guides come first for every age |
| Pregnant, due date 3 months past | Still "This week of pregnancy" | Minor: Home already asks "Has your baby arrived?" |

The test build gives the same answers, minus the triage tools.

## Gaps, most important first

**P1, wrong or hurtful:**
1. **After a pregnancy loss**, "For you" shows Contraception and Period pain. The loss guides (Types of loss, Recovery, Grief)
   aren't offered. Home already knows (`afterLossNow`).
2. **After a birth**, the after-birth tiles stay for 365 days even once her periods are back and she has switched to "Tracking
   my periods". `forYouKeys` has its own date rule instead of using `stageNow()`, which Home uses.
3. **Breastfeeding tile when she isn't breastfeeding.**

**P2, misses what she logged:**

4. **A late period** doesn't bring "Missed period: what now" (`pregtest`), although Home flags it.
5. **Heavy flow or irregular cycles** don't bring "Anaemia and heavy periods" or the irregular-cycle guide, although Home and
   "What your diary shows" flag them.
6. **Two situations at once:** the first group takes all 5 places. PCOS and trying shows no PCOS tile. PCOS and on the pill
   loses "Missed or late pill", the most time-critical tile a pill user has.

**P3, polish:**

7. **Empty diary or "Just learning":** diary tools come first. Guides, check-ups and free care would help more.
8. **Browse-only adults** get the girls' guides first. Those should come first only for under-18s.
9. **Unused inputs:** `hysterectomy` (she still gets Period pain), `thyroid`, and the `avoid` goal. The goal picker that set
   `avoid` is no longer shown, so `FOR_YOU.avoid` is dead code.

## Advice

The fix stays in `forYouKeys` and `forYouTiles`. It only changes **which existing tiles** show and in what order. All of those
tiles are already doctor-reviewed, so it needs no new health wording and no doctor review.

1. **Use `stageNow()`** as the one source of her stage, so Home and Care always agree (fixes 2).
2. **Add a loss group.** While `afterLossNow()` is true, show Loss recovery, Grief and your feelings, Types of loss, Check-ups
   and Get care free, and no contraception or trying tiles (fixes 1).
3. **One "now" tile first, from her diary.** It reuses the flags Home and "What your diary shows" already raise:
   - late period → Missed period: what now;
   - heavy flow → Anaemia and heavy periods;
   - irregular → What your diary shows;
   - low mood after a birth → Mood after birth.

   It adds no new thresholds (fixes 4, 5).
4. **Share the places between her situations.** Give 3 to her stage group, then 2 to the next one. Always keep "Missed or late
   pill" for a pill user (fixes 6).
5. **Skip tiles that don't fit her:**
   - Breastfeeding when `breastfeeding` is off;
   - Period pain after a hysterectomy;
   - diary tools while the diary is empty (use Periods guides, Check-ups and Get care free instead);
   - the girls' guides unless she's under 18 (fixes 3, 7, 8).
6. **Remove the dead `avoid` group,** or bring back a one-tap "Avoiding pregnancy" choice. My advice is to remove it: her method
   already covers this (9).
7. **Test it:** add this table as a matrix test (in `value.mjs`, or a new `foryou.mjs`) so the answers stay right.

**Effort:**
- Small to medium, all in `web/app.js`, with no server or Qura change.
- It needs a new APK (versionCode 40 or later).
- Point 2 must agree with the loss module's own Home card, so that both show the same thing.
