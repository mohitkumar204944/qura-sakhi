# Full-journey audit: all findings (24 Oct 2026)

The 105 findings behind `docs/journey-audit-2026-10-24.md`, grouped by pillar. A second agent checked each against the code;
"Checked" gives its correction where it had one (one P0, J-02, was judged P1 by its checker). Six more findings were dropped by the
checkers, five as duplicates of the diet audit and one as wrong; they are listed at the end. Screenshots are under
`web/test/shots/journey-audit/` (not in git). Line numbers are for the 0.38-pilot code (commit 418075d).

## Pillar 1: track, and what her records may point to (26)

### P0 · Discreet mode hides every urgent finding from Today, including 'call 112 now' (J-01, cross-pillar journeys)

- **Where:** web/app.js:1831-1832; web/mods/explain.js:255-260
- **Found:** Seeded 3 cases and checked each with discreet mode off and on. (1) After a birth, 'Bleeding heavier than a period after the birth' (level now, call 112). (2) Pregnancy, 'Bleeding in pregnancy' (see a doctor today). (3) 'Heavy flow in your last period' (this week). Each showed 1 urgent card normally and 0 in discreet mode, with the Sakhi says slot gone (null). Cause: app.js:1831 calls moduleCards only when !disc || planLeads(), then drops every card without data-disc-ok, and explain's home cards (mods/explain.js:258-259) never carry it. The only discreet exception is the past-42-weeks line (app.js:1832).
- **Why it matters:** Women on a shared phone get no warning at the moment pillar 1 matters most, for bleeding after a birth or in pregnancy. The red-flag routing promised in the companion design breaks for the users discreet mode exists for.
- **Advice (fix):** Reuse the past-42-weeks pattern. For any finding at level now, today or week, discreet mode shows one plain-words urgent line under the hero ('Something you noted needs a doctor soon. Open'). It opens What your diary shows, behind the app lock when one is set. It replaces nothing and adds no health words. Add the 3 cases to test/privacy.mjs.
- **Effort:** S; new wording needs doctor review
- **Checked:** Small correction to the impact: the monthly check-in still shows its in-screen red flag in discreet mode as she ticks the chip (ci_flag_post, ci_flag_preg, app.js:2912), so she does get one warning while logging. What discreet mode drops is every finding afterwards: on Today and on the Notes tab (explain.js afterRender returns when discreet), and for heavy flow logged from the period sheet.
- **Screenshot:** `web/test/shots/journey-audit/journey/disc-urgent-postLochia-discreet/01-today.png (compare disc-urgent-postLochia/01-today.png)`

### P0 · Bleeding after menopause is missed, and reassured, unless she ticked 'periods stopped' (P1-01, pillar 1 audit)

- **Where:** web/mods/explain.js:156; web/app.js:1781-1786 (midlife hero); web/mods/meno.js:78 (timeline)
- **Found:** Seeded: age 54, situation.midlife, previous periods 480 and 420 days ago, then a 'Period started' 2 days ago. explain.findings() returned [] and S.cycle.gapsAll() showed the 418-day gap as not usable. Today shows 'PERIOD 3 · Period day' and 'Around 40 and after, gaps between periods change. Keep noting each period.' (postmeno-unflagged-today-fold.png). The menopause timeline says 'Your periods are still coming… Longest gap in the last year: 418 days' (postmeno-unflagged-timeline.png). The same bleed with situation.stopped set gives an urgent 'Bleeding after your periods stopped · See a doctor this week' card at y=521 (postmeno-today-fold.png). The rule at explain.js:156 runs only when sit.stopped is set, and nothing sets it automatically after 12 months.
- **Why it matters:** A woman of 45 or more whose last period was over a year ago, who simply logs the bleed as a period, gets no warning. Postmenopausal bleeding is a red flag that needs a check within 2 weeks. Instead Today tells her this is the usual change around 40.
- **Advice (fix):** In explain.findings, treat any start or spotting that comes 365 days or more after the previous bleed (age 45+, or a midlife stage) as bleed_after_stop. Reuse its reviewed card and wording ('Any bleeding after your periods have stopped needs a check, even a little'). When 12 months pass with no period, the timeline asks once 'Have your periods stopped?' and sets stoppedOn. No new health wording; the doctor confirms the 365-day trigger.
- **Effort:** S; no new health wording
- **Screenshot:** `web/test/shots/journey-audit/p1-track/postmeno-unflagged-today-fold.png`

### P0 · A severe BP reading in pregnancy never reaches Today (P1-02, pillar 1 audit)

- **Where:** web/mods/preg.js:629-641, 883-889; web/mods/explain.js:157-199
- **Found:** Seeded: 32 weeks pregnant, mods.preg.bp = [{d: yesterday, s: 164, di: 112}]. My pregnancy logs shows '160/110 or higher… go to hospital now. Call 112' (preg-bp-logs.png). Today shows only the week hero, 'Due now: Td injections, and 7 more' and 'A plan for you' (preg-bp-today-fold.png). explain.findings() returned []. The report lists 'BP: 164/112 (26 Oct 2026)' with no flag. The flags exist only in preg.js flagsFor(), drawn inside the logs screen; preg.js home() and explain.js never read them.
- **Why it matters:** She types in a reading her ANM gave her, or one from a home cuff. The one screen she opens every day says nothing about a pre-eclampsia-range BP. The same holds for Hb under 7 and a 2-hour sugar of 140 or more.
- **Advice (link):** Have explain.findings read the latest pregnancy-log flags from the last 3 days: bpLevel 2 → 'now', bpLevel 1 → 'today', Hb under 7 → 'today', sugar flag → 'week'. Use preg.js's reviewed lines (bp_urgent, bp_today, hb_flag, sug_flag), so each shows as an urgent card on Today and in the Diary and as a flag on the report. No new wording.
- **Effort:** S; no new health wording
- **Screenshot:** `web/test/shots/journey-audit/p1-track/preg-bp-today-fold.png`

### P0 · Discreet mode hides every urgent signal completely (P1-03, pillar 1 audit)

- **Where:** web/app.js:1831-1832; web/mods/explain.js:253-260, 322-329
- **Found:** Seeded: discreet mode, 32 weeks pregnant, 'Bleeding or spotting' logged today (explain gives p_bleed at level 'today'). Today shows only 'TODAY · (blurred) weeks · Add a note · This month' (discreet-preg-bleed-today.png), and the Diary has no note either. The heavy-flow 'see a doctor this week' card also disappears (discreet-heavy-today-fold.png). Causes: app.js:1831 drops module cards without data-disc-ok; explain.js:258-259 never sets it; explain.js:324 returns early in discreet mode. The only discreet urgent line in the app is the over-42-weeks one (app.js:1832).
- **Why it matters:** Women on shared phones, the ones discreet mode is for, never learn that something they logged needs a doctor today. Hiding the words is right; hiding that a signal exists at all is not.
- **Advice (fix):** For 'now', 'today' and 'week' findings in discreet mode, show one neutral line with data-disc-ok, like late_preg_d: 'Something in your notes needs a check soon · Open'. Opening it shows the card after the existing tap-to-show (or PIN). No condition words, never in a notification.
- **Effort:** S; no new health wording
- **Checked:** Small: the proposed neutral line ('Something in your notes needs a check soon') is new UI copy, not health wording. It still needs a Hindi string and a case in test/privacy.mjs.
- **Screenshot:** `web/test/shots/journey-audit/p1-track/discreet-preg-bleed-today.png`

### P1 · What her records point to is spread over 8 surfaces in 3 tabs, with three tools answering one question (MIN-01, clutter audit)

- **Where:** app.js:1012, 2787-2815, 2885, 2907, 3350; mods/explain.js:258, 322; mods/selfcheck.js
- **Found:** The 8 surfaces: - the Diary banner (mods/explain.js:322, afterRender); - Trends' 'Your cycle at a glance', 'What repeats for you' and 'Your numbers' (app.js:2796, 2787, 2885); - the 'What your diary shows' page (mods/explain.js), which lights Explore; - Pattern check (app.js:3350); - 'Should I get this checked?' (selfcheck); - the monthly 'This month' signs check-in (app.js:2907), a round button on Today; - explain's card on Today (mods/explain.js:258-259); - the plan's doctor check card.  For Riya (irregular goal), Explore's For you spends 3 of its 5 slots on selfcheck, pattern and explain (FOR_GOAL.irregular, app.js:1012). On the same diary (gaps of 42 and 44 days): - Pattern check says 'PMOS pattern: Not enough data'; - explain says '2 of your last 6 gaps were longer than 35 days. See a doctor this month'.
- **Why it matters:** Mohit's pillar 1 promise, 'it tells you what your records point to', has no single home. She meets three verdicts on the same data, in different tabs, with different answers.
- **Advice (merge):** Give it one home in Diary.  Rename Trends 'What it shows'. From the top: - explain's flag cards, inline (the same reviewed cards); - one verdict card, with 'Your numbers' merged in; - What repeats; - a 'This month's signs' row (moved off Today); - a 'Check the signs' link to the validated self-check, shown only when a flag points to it (PMOS gap rule, endometriosis pain rule).  The explain route stays as the deep page, but lit as Diary. Remove Pattern check (MIN-02). For you for the irregular goal becomes selfcheck plus explain.  Wording stays 'may point to'; no 'you have X'. The doctor confirms the merged order.
- **Effort:** M; new wording needs doctor review
- **Checked:** Holds. Two small additions. (1) The 'This month' check-in collects signs; it gives no verdict, so it is an input surface rather than a ninth answer. (2) The merged Diary home must keep explain's discreet-mode suppression (its afterRender skips discreet). The validated self-check it links to is TRIAGE-held in tester builds, so that link is pilot/demo only.
- **Screenshot:** `web/test/shots/journey-audit/minimalism/tab-riya-en-diary-tr.png`

### P1 · Pattern check shows an unfinished 'Doctor's verdict: Pending review' and repeats two other tools (MIN-02, clutter audit)

- **Where:** app.js:86, 1012, 3350-3366
- **Found:** renderPattern (app.js:3350-3366) shows: - 'Doctor's verdict' with the pill 'Pending review' (strings at app.js:86); - 'Ask my Qura doctor to confirm'; - the footnote 'Rule P3, version 1. Signed by Qura's doctors and an independent gynaecologist before launch.'  Its 'Thyroid-type pattern: Not enough data' can never fill, because the app has no thyroid input. It shows in pilot builds (fullTools) and is in For you for the irregular, weight and PMOS goals. Seen in pattern-check.png.
- **Why it matters:** It implies a doctor will review her data when none will. It is a third PMOS verdict next to the self-check's and explain's, with a different answer (MIN-01).
- **Advice (remove):** Remove the Pattern check tile and route from pilot builds; release builds already hold it back (TRIAGE). Its PMOS rule is already explain's gap_long card plus the self-check. If the doctor wants the nipple-discharge question kept, move it into the self-check's PMOS questions.
- **Effort:** S; new wording needs doctor review
- **Checked:** One sub-claim is wrong. The thyroid row can never fill because renderPattern hard-codes it to 'pc_nodata'. The app does have a thyroid input: My lab results (cond-labs) records TSH and Free T4 (mods/cond.js:352-353). Also, 'Pending review' is a gold-text span, not a pill.
- **Screenshot:** `web/test/shots/journey-audit/minimalism/pattern-check.png`

### P1 · 'See a doctor this week/this month' never offers the free government doctor; the self-check's main button is a Qura doctor (J-03, cross-pillar journeys)

- **Where:** web/mods/explain.js:221-224; web/mods/selfcheck.js:158-161; web/mods/cond.js (anaemia ask card)
- **Found:** In What your diary shows, the free-care button appears only at level 'today'. Every week or month finding offers 'Ask a Qura doctor about this' (mods/explain.js:221-224). Riya's day-118 finding (thyroid and hormone tests) offered Read more, Ask a Qura doctor and Got it. The self-check result's primary button is 'Talk to a Qura doctor about this' (selfcheck.js:161), with 'Free at a PHC' only as text. The Anaemia page ends on 'Ask a Qura doctor about this'. The free doctor took 3 taps through Ask, on a 457-word, 4-screen page.
- **Why it matters:** Outside a plan, every doctor hand-off in pillar 1 points first to a Qura doctor (BAMS; tests and plans cost money), not the free PHC that the wording itself recommends.
- **Advice (reuse):** Reuse the existing 'Free government doctor' button (plan_rv_free, access-doctor) as the first button on every week or month finding and on the self-check result. The Qura doctor moves second. No new wording.
- **Effort:** S; no new health wording
- **Checked:** Minor: when Qura's WhatsApp number isn't set, the Ask page puts the 'Free government doctor' card first (app.js:3144-3146). From a finding it is therefore 2 taps (Ask a Qura doctor, then Free government doctor), not 3. The labels still point to Qura first, as stated.
- **Screenshot:** `web/test/shots/journey-audit/journey/riya-360/14-day118-explain.png`

### P1 · Two PMOS checks contradict each other; 'Read about it' opens the old Pattern check with 'Doctor's verdict: Pending review' (J-04, cross-pillar journeys)

- **Where:** web/app.js:84-87, 1012, 3350-3365; web/mods/selfcheck.js:35, 160
- **Found:** The self-check said 'Your answers match 1 of the 3 signs… worth a doctor's check' and 'See a doctor this month'. Its 'Read about it' (selfcheck.js:35 more:'pattern'; :160) opens Pattern check, which said 'PMOS (PCOS) pattern: Not enough data', 'Doctor's verdict: Pending review' and 'Rule P3, version 1. Signed by Qura's doctors… before launch' (app.js:84-87, 3350-3363). It shows in Hindi too ('डॉक्टर की राय: समीक्षा बाक़ी'). Pattern check is also in For you for the irregular and PMOS goals (app.js:1012) and in the Conditions list. The field-test audit's 3.4 flagged the 'Pending review' contradiction on 23 Oct, and it is still there.
- **Why it matters:** Two features give one woman different verdicts. A 'doctor's verdict' screen fed by her own data is the most diagnosis-like surface in the app (the CDSCO risk) and reads as unfinished.
- **Advice (merge):** Keep one PMOS check. Remove Pattern check from every link (self-check 'Read about it' goes to the reviewed article a-pmos.what-pmos-is; drop it from FOR_GOAL and the Conditions list). Its one useful question ('Has a doctor told you that you have PMOS?') moves into the self-check, writing the same situation.pcos flag. Retire the route later.
- **Effort:** S; no new health wording
- **Checked:** Small correction: Pattern check has two questions, not one useful one. The second ('Any milky discharge from the nipples?', pc_q2/pc_q2_y, a prolactin check) would be lost if the screen is retired, so it has to move with the PMOS question. The 'Not enough data' result comes from its rule needing 3 gaps and 2 check-ins (app.js:3354).
- **Screenshot:** `web/test/shots/journey-audit/journey/riya-360/19-pattern-check-from-read-about-it.png`

### P1 · Heavy bleeding and severe pain given at joining get a doctor check once, on the reveal, then never again (P1-04, pillar 1 audit)

- **Where:** web/mods/plan.js:1398-1404, 1743-1755
- **Found:** Joined from an empty diary with 'Heavy periods' and the answers 'a pad every 1–2 hours', 'clots', 'often tired or dizzy'. The joining screen and the reveal say 'Bleeding this heavy needs a doctor's check and an Hb test… Please see a doctor soon' (join-heavy-answer-warning.png, join-heavy-reveal-last.png). Today on day 1 says 'Day 1 of your plan · Your first step: Your iron tablet', explain.findings() is [], and the diary holds only an approximate start with no flow detail (join-heavy-today-day1.png). The heavy and pain plans on days 6 and 13 show 'Shall we start again, small?' with no doctor card (heavy-plan-day13-today.png, pain-plan-day13-today.png). The 'doc' card exists only for the cycle plan (plan.js:1751). The companion design planned these doctor moments (docs/companion-journey-2026-10-23.md:437-438).
- **Why it matters:** The earliest early signal Sakhi gets, her own description of flooding with dizziness or pain that stops her day, fades after one screen. A woman with suspected anaemia or endometriosis may follow a food plan for 12 weeks without the Hb test or examination.
- **Advice (reuse):** Extend cardKind 'doc' to plan_rv_doc_heavy and plan_rv_doc_pain (days 2 to 21, 'Yes, done' / 'Later', as for the cycle plan), with the free government doctor button. When she said dizzy or breathless, rank it as an urgent 'this week' card. Save 'Yes, done' with its date so the report says 'Saw a doctor on …'. Reviewed wording only.
- **Effort:** S; no new health wording
- **Checked:** Overstated as 'never again'. (1) At the 12-week finish, renderFinished (plan.js:480-485) shows a doctor card for any docCase, so plan_rv_doc_heavy and plan_rv_doc_pain do return, as the generic plan_fin_doc 'If nothing has changed, see a doctor'. (2) The heavy plan's iron steps (the 21-day journey) include day 15 'Know your Hb: Ask for an Hb test at your next check-up… free' (journey.js:48), but only as a tick step, with no doctor check and no 'Yes, done'. The pain plan has neither. So the gap is days 2 to 84 for pain, and everything except one Hb-test step for heavy.
- **Screenshot:** `web/test/shots/journey-audit/p1-track/join-heavy-today-day1.png`

### P1 · Flow and pain severity can be logged only on the day her period starts (P1-05, pillar 1 audit)

- **Where:** web/app.js:2074-2117, 2233-2241, 2523-2537
- **Found:** On period day 2 the + menu offers only Note, Mood, Symptoms, Spotting and Period ended (day2-plus-menu.png). The day sheet has no 'Add flow and pain details' link, because #day-flow appears only when that day has a start (app.js:2082) (day2-day-sheet.png). 'Cramps' is yes or no. explain.js:143 and plan.js:895 read 'start_detail' events, but in the code only the sample diary creates them (app.js:723). Logging details on another day means logging a second start, which then shows as 'Two period starts N days apart'.
- **Why it matters:** Flow is usually heaviest on days 2 and 3, and pain may peak then too. The heavy-flow and severe-pain signals, the heavy plan's before-and-since results, the self-check hints and the report's 'Heavy' column all count only day 1, so she is under-flagged.
- **Advice (move):** Show the existing 'Flow and pain' block (pads, clots, leaked, two pads, pain 0–3) in the day sheet on every bleeding day, saved as start_detail events, which explain and the plan already read. This is a re-layout of one sheet, not a new tracker.
- **Effort:** S; no new health wording
- **Checked:** Add: the 'Period ended' log sheet (openLog('end'), reached from quickLog's 'Add details' toast) also shows the Flow and pain block and saves pads, clots and pain on the end event (app.js:2536, 2547). explain, plan.signals, the report's Heavy column and the self-check heavy hint never read end events, so those details are silently lost. The fix also has to widen the report (app.js:2623 reads only the start event) and the self-check hint (selfcheck.js:30, start only), not just explain and plan.
- **Screenshot:** `web/test/shots/journey-audit/p1-track/day2-day-sheet.png`

### P1 · The heavy-bleeding chart, a low Hb result and tiredness never trigger a signal (P1-06, pillar 1 audit)

- **Where:** web/mods/cond.js:470-510; web/mods/explain.js:115-201
- **Found:** Seeded: PBAC chart total 161 (5 days with full pads, clots and flooding), Hb 8.4 g/dL saved with her report's range of 12 to 15, 'Tired' on 12 of the last 33 days. explain.findings() gives only gap_usual:ok, and Today's first card is 'Free check-ups for you' (heavy_pbac-today-fold.png). The chart shows a fixed line, 'Doctors use a total of 100 or more as a sign of heavy periods' (cond.js:486-490); the Hb row shows only an 'Outside the range you entered' pill (cond.js:509). explain never reads mods.cond. The research file asks for 'heavy-bleeding tracking… with a prompt to get a blood count for anaemia'.
- **Why it matters:** The most careful woman, who fills in the doctor's chart and saves her lab report, gets less than one who taps 'Soaked one every 1–2 hours' once. Anaemia, the commonest consequence in Indian women, goes unflagged.
- **Advice (link):** explain.findings adds: a PBAC total of 100 or more → the existing flow_heavy card ('week'); an Hb below her own report's range → one short card, 'Your Hb is below the range on your report: see a doctor this week' (new line, for the doctor), linking the anaemia page and free Hb. Never call the PBAC total a diagnosis.
- **Effort:** S; new wording needs doctor review
- **Screenshot:** `web/test/shots/journey-audit/p1-track/heavy_pbac-today-fold.png`

### P1 · No signal card offers the matching self-check; the endometriosis and fibroids checks are never suggested (P1-07, pillar 1 audit)

- **Where:** web/mods/explain.js:19-102, 140-146; web/mods/plan.js:917, 930-937
- **Found:** Where each card's 'Read more' goes: pain_severe → periods-pain, flow_heavy and period_long → cond-anaemia, gap_long → topic-cond (a topic list), androgen → pattern (explain.js:29, 42, 44, 48, 76). The second button is always 'Ask a Qura doctor'. The plan catalogue holds only 'Could it be PMOS?' (plan.js:930). The endometriosis and fibroids self-checks are 4 taps from Today. Seeded: 'Couldn't do my day' (pain_3) in 3 earlier periods, plus pain-diary entries of 8/10 with bowel, pee and sex pain (NICE's 'consider endometriosis' signs in the research file). No finding, because explain.js:145 reads only the latest period and never the pain diary. The only response is a plan suggestion reading 'You needed a painkiller in 3 of your last 3 periods', which plays down her own answer (plan.js:1880; pain-today-fold.png).
- **Why it matters:** The pillar's promise, 'your records may point to something → a validated self-check → a doctor', works only for PMOS. Endometriosis, which in India often takes years to diagnose, is never named as something worth checking.
- **Advice (link):** Add one 'Check the signs' button to the pain_severe, flow_heavy, period_long, androgen and gap_long cards, opening selfcheck-endo, -fibroids or -pmos. It shows until she has done that check in the last 90 days. pain_severe also fires on pain_3 in 2 of her last 3 periods, or a pain-diary entry of 7 or more with bowel, pee or sex pain. The plan's reason line uses her own word: 'Pain stopped your day in 3 of your last 3 periods'.
- **Effort:** S; new wording needs doctor review
- **Checked:** 'Never suggested' is wrong for endometriosis. The Pattern check's pain row (app.js:3352-3360) counts pain_3 in the last 6 periods and, when seen, shows 'Should I get this checked?', which goes to selfcheck-endo. Probe with pain_3 in 3 periods: Pattern check 'Pain pattern (endometriosis-type) · Pattern seen … Should I get this checked?' → selfcheck-endo. That screen is reached only via the androgen card, the PMOS self-check's 'Read about it' or the Conditions tile, and it is a TRIAGE tool hidden in tester builds. The fibroids check is never suggested. If P1-12 removes the Pattern check, this pain→endometriosis link has to move into explain.
- **Screenshot:** `web/test/shots/journey-audit/p1-track/pain-today-fold.png`

### P1 · The self-checks ask again what her diary and joining already answer (P1-08, pillar 1 audit)

- **Where:** web/mods/selfcheck.js:28-32, 128-134
- **Found:** Endometriosis self-check for a diary with pain_3 in 4 periods and pain-diary types bowel, pee and sex: 0 diary hints and 0 prefilled answers (pain3-selfcheck-endo.png). prefill() works only for PMOS and only from joining (selfcheck.js:128-134). Hints exist only for gaps, heavy (start events only) and cramp days (selfcheck.js:28-32). The PMOS check doesn't prefill 'Extra hair' from 3 check-ins that said so, and 'Fewer than 8 periods in the last year' has no hint even though the diary has the starts. Her joining answers 'It stops my day' and 'a pad every 1–2 hours' don't prefill endometriosis question 1 or fibroids question 1.
- **Why it matters:** She is asked twice and may answer differently from what she logged, so the check reflects her memory rather than her records, which is the reason a tracker should come first.
- **Advice (reuse):** Extend hint and prefill: - Endometriosis: Q1 from pain_3 or the joining answer 'stop'; Q3 and Q4 from pain-diary 'sex', 'bowel' and 'pee'. - Fibroids: Q1 from pads_4, PBAC 100+ or joining 'p12'; Q2 from period length over 7 days; Q7 from tired days or joining 'tired'. - PMOS: hair and acne from check-ins; 'few' from her starts in the last 12 months.  She still sees and confirms every answer, as with the existing 'Some answers come from…' line.
- **Effort:** S; no new health wording
- **Checked:** Small nuance: the PMOS verdict already falls back to the diary's irregular gaps (pmosVerdict odDiary via diaryIrregular, selfcheck.js:19, 102) when she hasn't answered No. The diary does shape that verdict even though no 'few' hint is shown.
- **Screenshot:** `web/test/shots/journey-audit/p1-track/pain3-selfcheck-endo.png`

### P1 · While a plan runs, 'see a doctor this month' signals fold out of sight (P1-09, pillar 1 audit)

- **Where:** web/app.js:1727-1747, 1840-1841
- **Found:** The same PMOS diary (long gaps, hair in check-ins) on day 9 of the cycle plan. The slot leads with 'Week 1 is done · You followed your plan on 0 of 7 days'. The 'Signs that can come with PMOS · See a doctor this month' card sits inside 'More from Sakhi (3)' at y=1341 on an 800 px screen (pmos_plan-today-full.png). With no plan it is the first card at y=633 (pmos-today-fold.png). Cause: app.js:1736 puts the plan first when planLeads(); only cards marked data-xp-urgent (now, today, week) jump ahead.
- **Why it matters:** The women most engaged with their plan are the least likely to see the prompt to get checked. The plan's own doctor check exists only for skipped periods.
- **Advice (move):** A new 'month' finding she hasn't marked 'Got it' leads the slot ahead of the plan's look-back and month cards, or joins the plan card as one line: 'Also: your diary shows something worth a doctor check this month · See'. Only 'keep an eye on it' cards wait behind the plan.
- **Effort:** S; no new health wording
- **Screenshot:** `web/test/shots/journey-audit/p1-track/pmos_plan-today-full.png`

### P1 · Pregnancy danger signs: the day sheet can't record most of them, and the head-plus-swelling rule needs both on the same day (P1-10, pillar 1 audit)

- **Where:** web/app.js:2060-2064, 2902; web/mods/explain.js:195-199
- **Found:** Pregnancy day-sheet chips: Bleeding or spotting, Nausea, Heartburn, Swelling and Headache (app.js:2060-2064). There is no 'baby moving less', water leaking, severe belly pain, fever or blurred vision. Seeded swelling yesterday and headache today at 32 weeks: no finding (preg_swell-today-fold.png), because explain.js:197 needs d_swell and d_headache on the same day. The monthly check-in asks about bleeding once a month (app.js:2902).
- **Why it matters:** A woman who opens her diary to note 'baby moved less today' finds nowhere to put it, and nothing points her to call the hospital the same day. Pre-eclampsia signs logged a day apart are missed.
- **Advice (add):** - From week 28, add one 'Baby moving less' chip. It shows the kick counter's reviewed k_today line with a call button at once; it is not stored as a quiet entry. - Add one 'Something else feels wrong' row that opens the existing danger-signs answer. - Widen head plus swelling to either order within 3 days.  Nothing replaced; pregnancy only.
- **Effort:** S; new wording needs doctor review
- **Checked:** 'Nothing points her to call the hospital' is overstated. Help's emergency list says 'In pregnancy: bleeding, fits, severe headache with blurred vision, fluid leaking, baby moving less' (app.js s1c). Search maps 'moving less', 'hilna' and 'हलचल' to the kick counter (app.js:1070). From 28 weeks the pregnancy plan's Today steps link the kick counter (plan.js:1339), whose k_today line says call the hospital now. That works in pilot and demo builds; the kick counter is a TRIAGE tool hidden in tester builds. What holds is that the diary itself can't record it, and that headache plus swelling must fall on the same day.
- **Screenshot:** `web/test/shots/journey-audit/p1-track/preg_swell-today-fold.png`

### P1 · After a birth, yesterday's warning signs are forgotten on Today (P1-11, pillar 1 audit)

- **Where:** web/mods/post.js:904-909; web/mods/explain.js:166-172
- **Found:** Seeded: day 12 after birth; yesterday's recovery check saved heavy bright-red bleeding and a fever of 38 °C or more. Today shows the day ring, 'Recovery today' and 'A plan for you: Daily recovery check' (post_flag-today-fold.png). The recovery page lists only 'Your last checks · Mon, 26 Oct · Warning signs: 2' (post-flag-recovery-next-day.png). post.js home() never reads past checks (post.js:904-909), and explain reads only the monthly check-in chips.
- **Why it matters:** The warning showed once, at the moment she answered. If she didn't go, Sakhi never asks again, during the weeks when postpartum haemorrhage and sepsis happen.
- **Advice (link):** explain.findings reads the last 2 days of post.rec: heavy bleeding, fever, wound, can't pee or thoughts of harm map to 'now' or 'today', using post.js's reviewed fl_* lines. Today shows it as an urgent card, with 'Did you see a doctor? Yes / Not yet' (new line, for the doctor).
- **Effort:** S; new wording needs doctor review
- **Screenshot:** `web/test/shots/journey-audit/p1-track/post_flag-today-fold.png`

### P1 · There is no one place for 'what my records say' (P1-13, pillar 1 audit)

- **Where:** web/mods/explain.js:243-251; web/app.js:2885-2896, 3249-3277
- **Found:** Her picture is split across about 10 screens: - What your diary shows (current findings only; 3 taps via Explore > Conditions when nothing is flagged; taps.mjs); - Trends (7 cards, 2778 px, 3.5 screens at 360 px; pmos-trends.png); - My cycles and Days; - the Pattern check; - self-check results (only as 'Last time…' inside the self-check list); - the PBAC total and Hb (inside Anaemia, 3830 px); - pain-diary counts (4147 px); - 'My midlife picture' and 'Your menopause timeline'; - the report and the 'Summary for my doctor'.  Me > My health holds only stage and condition toggles (app.js:3263-3268). Her gaps alone are drawn 8 times: the Today ring, Trends' glance, the bar chart, My cycles, Your numbers, the explain table, the report and tools-summary.
- **Why it matters:** She can't answer 'Is anything wrong, what did my checks say, and what should I do next?' in one look. The pillar reads as a set of tools, not one health picture.
- **Advice (merge):** Rename 'What your diary shows' to 'What my records say', one page in 4 parts: 1. Findings by urgency, as now. 2. 'Checks you did': each self-check result with its date and re-check date. 3. 'Your numbers': the Trends glance lines, the last Hb and the PBAC total. 4. The report button.  Entry points: one row at the top of all three Diary tabs, and Me > My health. This replaces the Pattern check, and Trends' 'Your numbers' card moves here. New section labels only.
- **Effort:** M; no new health wording
- **Checked:** Minor: Me > My health also carries the pregtest Me row (ME_PLACE pregtest: 'health', app.js:3167), not only stage and condition toggles. Trends' verdict also links to What your diary shows, but only when it says 'Outside the usual' or 'Irregular'.
- **Screenshot:** `web/test/shots/journey-audit/p1-track/pmos-trends.png`

### P1 · Signals and self-check results are never followed up (P1-14, pillar 1 audit)

- **Where:** web/mods/selfcheck.js:165-172; web/mods/explain.js:250; web/mods/plan.js:930, 1756-1759
- **Found:** - The PMOS self-check saves {d, n, m, yes, v} with no re-check date (selfcheck.js:169-171). - 100 days after a 'match', Today shows only the gap card: nothing about the check or a doctor visit (sc_old-today-fold.png). - The catalogue drops the self-check for good once done (plan.js:930, !s.scDone). - The young-woman 'at risk' verdict says check again 'in a year or two', with no reminder. - 'Got it' on a 'see a doctor this week' card hides it with no 'did you go?' (explain.js:250). - The only 'doctor done' record is the cycle plan's 'Yes, done' (plan.js:1758), and it isn't on the report.
- **Why it matters:** An early signal that is noticed but not acted on looks the same as one that was dealt with. The companion promise ('acts as a companion to achieve your goals') stops at the first card.
- **Advice (add):** One follow-up rule inside explain: - A 'week' finding marked 'Got it' returns once after 14 days, and a 'month' one after 30 days, as 'Did you see a doctor? Yes / Not yet'. - 'Yes' saves {doc: date}, shown in 'What my records say' and on the report. - Each self-check result carries a re-check date (3 months; 12 for 'at risk') that brings it back as a 'keep an eye on it' card.  It uses the existing slot; no new screen.
- **Effort:** M; new wording needs doctor review
- **Screenshot:** `web/test/shots/journey-audit/p1-track/sc_old-today-fold.png`

### P2 · Tracking screens live under Explore: every tracker tested lights the Explore tab (MIN-08, clutter audit)

- **Where:** app.js:895-903, 2569-2600
- **Found:** tabOf returns 'care' for any module route (app.js:895-903). Ten screens tested all light Explore: explain, selfcheck, pattern, preg-logs, meno-diary, periods-pms, cond-endo, ttc-signs, iron and tools-reminders. The doctor report lights no tab (explore.json).  At least 13 trackers sit outside Diary: the PMS log, endometriosis pain diary, fertility signs, months of trying, pregnancy logs, kick counter, labour timer, feed log, recovery check, weekly midlife diary, lab results, medicines and iron. Diary's calendar legend shows only period, symptoms, mood, discharge, note and plan.
- **Why it matters:** She logs in Diary and in a dozen Explore screens. The tab bar tells her she is reading when she is tracking, and Back leads somewhere unexpected.
- **Advice (move):** Add one 'My trackers' list to Diary's 'What it shows', listing only her stage's 2-4 trackers. Core maps tracker routes to the Diary tab (a small route-to-tab table, with no change to modules). Search still finds every tracker.
- **Effort:** M; no new health wording
- **Checked:** Add a discreet-mode rule: a 'My trackers' list in Diary (called 'Notes' in discreet mode) must use neutral names or hide stage-revealing trackers such as Pregnancy logs and Kick counter. Small fix: the Language row in Me is lang.js:771, not 739.
- **Screenshot:** `web/test/shots/journey-audit/minimalism/tab-riya-en-explain.png`

### P2 · Trends shows the same gaps four ways, and only cycle charts in pregnancy and after a birth (MIN-09, clutter audit)

- **Where:** app.js:2796-2898
- **Found:** renderTrends (app.js:2885) shows the same gaps four times: - the verdict ('42-44 days'); - the 'Last 12 gaps' bars; - the 'My cycles' list ('44-day cycle'); - 'Your numbers' (average, spread, shortest, longest).  It is 3.31 screens for Riya and 3.95 for Asha. Meera at 25 weeks pregnant gets 5 cycle cards on 3.24 screens and nothing about her pregnancy (tab-meera-en-diary-tr.png). Sunita, 3 weeks after a birth, gets 4 cycle cards on 2.31 screens.
- **Why it matters:** Diary is long and repetitive. In pregnancy and after a birth it says nothing about what she is tracking now.
- **Advice (merge):** The verdict card absorbs 'Your numbers'. The bars stay. 'My cycles' folds under 'See each cycle'. Aim for under 2 screens. In pregnancy, after a birth and from 40, show her stage's tracker summary first (pregnancy logs, the recovery checks and feeds, the weekly diary trend) and fold the cycle history. This only re-lays out existing charts.
- **Effort:** M; no new health wording
- **Screenshot:** `web/test/shots/journey-audit/minimalism/tab-meera-en-diary-tr.png`

### P2 · Midlife: hot flushes are recorded in 4 places that don't read each other; 'My midlife picture' says 0 (J-14, cross-pillar journeys)

- **Where:** web/app.js:2904, 3389-3400; web/mods/meno.js:40-72
- **Found:** Kavita can note hot flushes in (1) the plan's evening check-in (the hot-flush routine), (2) the weekly symptom diary (12 symptoms, 0-3), (3) the monthly 'This month' (None, Mild, Moderate, Woke me at night; app.js:2904) and (4) the daily symptom chips. My midlife picture (app.js:3389-3398) reads only monthly check-ins: 'Hot flushes 0 · Poor sleep 0 · Before changes', while her weekly diary had weeks rated 'a lot'. The menopause hub offers 3 'where am I' tools: Your menopause timeline, Perimenopause score and My midlife picture (710 words, 4.5 screens).
- **Why it matters:** Two screens say different things about the same symptom. Her weekly effort never reaches the screens that show where she may be.
- **Advice (merge):** Make the weekly diary the one record for 40+. The monthly check-in drops its hot-flush row for midlife and links to the diary. My midlife picture reads the diary, or merges into the timeline. Keep one placing tool.
- **Effort:** M; no new health wording
- **Checked:** Small correction: the plan's evening check-in records whether she did the cooling routine (relief-hot), not her hot flushes, so there are three hot-flush records (the weekly diary, This month's hot row and the daily d_hotflush chip), not four. The three placing tools are on the menopause hub at meno.js:119-121, not 40-72.
- **Screenshot:** `web/test/shots/journey-audit/journey/kavita-360/20-core-midlife-page.png`

### P2 · The self-check is folded under 'More from Sakhi' and labelled 'A plan for you' (J-19, cross-pillar journeys)

- **Where:** web/app.js:1727-1745, 1841; web/mods/plan.js:1026-1035, 1874
- **Found:** Day 118: the first card was 'Your last gap was 49 days · See a doctor this month'. The self-check sat inside 'More from Sakhi (2)' as 'A PLAN FOR YOU · Could it be PMOS?', next to 'Set up Sakhi for you 1/4'. moduleCards keeps 2 cards with explain first (app.js:1735-1741); the plan's homeRec label is 'A plan for you' (plan.js:1874, 2170). It took 14 taps from the card to the self-check result. Taps were also measured from the plan's doctor card.
- **Why it matters:** The validated check pillar 1 relies on is hidden and mislabelled, so she has to know to open a fold to find it.
- **Advice (merge):** Link. Put 'Check the signs (2 minutes)' as a button on the long-gap finding itself, reusing the self-check tile. Drop the duplicate plan card. Never label a check 'A plan for you'.
- **Effort:** S; no new health wording
- **Screenshot:** `web/test/shots/journey-audit/journey/riya-360/16-day118-more-from-sakhi.png`

### P2 · 'Just keeping track' learns nothing at joining; the first doctor-level signal waits until day 118 (J-20, cross-pillar journeys)

- **Where:** web/mods/plan.js:1185 (track ends the intake); web/mods/explain.js:122-135
- **Found:** The track path asks only her last period. The goal screen leads straight to the shared-phone question (14 taps), so the cycle answers that a plan goal asks are skipped. The long-gap finding reaches 'see a doctor this month' only with 2 logged long gaps (explain.js:127-128). Riya saw it on day 118. Day 62 said only 'Keep an eye on it', and day 69 to 99 showed the same 'gap 47 days' card for 30 days.
- **Why it matters:** Many women join to track. The pattern they already know about ('mine come 45 to 60 days apart') can't speed up pillar 1.
- **Advice (reuse):** Reuse one existing chip row. On the track path, ask the intake's 'How far apart are your periods, usually?' (Q.gap), optional, 1 tap. Explain and the self-check use it only as a hint ('You said 46 to 60 days'), never as a finding by itself. A watch-level card folds after 7 days.
- **Effort:** S; new wording needs doctor review
- **Screenshot:** `web/test/shots/journey-audit/journey/riya-360/11-day99-same-card.png`

### P2 · Next steps favour a Qura call over free care for 'this week' and 'this month' signals (P1-15, pillar 1 audit)

- **Where:** web/mods/explain.js:220-225; web/mods/selfcheck.js:158-161
- **Found:** explain.js:221-224 shows a free-care button only on 'today' cards; 'week' and 'month' cards get 'Ask a Qura doctor about this'. The self-check result's primary button is 'Talk to a Qura doctor about this', and free care appears only as text ('Free at a PHC or district hospital') (selfcheck.js:159-161; pmos-selfcheck-result.png). A PMOS 'match' needs thyroid, prolactin and hormone blood tests, and Qura's doctors are BAMS (MODULE_API section 34). My plan's 'Your care team' already lists the free government doctor first.
- **Why it matters:** The clear next step for a heavy-bleeding or PMOS signal is a free government gynaecology or Hb visit. Leading with a private Ayurveda call can delay the tests the card itself asks for.
- **Advice (reuse):** Show the same three buttons on every 'week' and 'month' card and on the self-check result, in this order: 'Free doctor near me' (access-doctor), 'My report for the doctor', then 'Talk to a Qura doctor'. This reuses My plan's care-team order; no new wording.
- **Effort:** S; no new health wording
- **Screenshot:** `web/test/shots/journey-audit/p1-track/pmos-selfcheck-result.png`

### P2 · Anaemia signs can't be logged, and tiredness leads to a sleep plan (P1-18, pillar 1 audit)

- **Where:** web/app.js:2060-2064; web/mods/plan.js:933, 941
- **Found:** The day sheet has 'Tired' but no 'Dizzy or breathless' (app.js:2062), yet the flow warning r2 and joining both ask about dizziness, and the anaemia page lists it as a sign. Seeded tired plus poor sleep on 13 of 25 days: no finding; the only response is 'A plan for you: For poor sleep · You slept badly on 13 days this month' (tired-today-fold.png).
- **Why it matters:** Anaemia is very common in Indian women, and her own logs point to it, but Sakhi suggests a breathing or sleep routine instead of a free Hb test.
- **Advice (fix):** Rename the 'Tired' chip 'Tired or dizzy'; it stays one chip. Tired on 10 or more days in 30, or tired with heavy flow, gives a 'keep an eye on it' card linking the anaemia page and the free Hb test, using the reviewed IRON line. The doctor checks the trigger.
- **Effort:** S; new wording needs doctor review
- **Checked:** 'Tiredness leads to a sleep plan' holds only when poor sleep is logged too. With tiredness alone, plan.catalogue scores the 21-day iron journey (pt(s.tired >= 5, 2, 'You felt tired on {n} days this month'), plan.js:932), and that journey includes a 'Know your Hb… free' step (journey.js:48). Probe with Tired on 11 days and nothing else: recs ['journey-iron 2 You felt tired on 11 days this month.']. Still, no explain card and nothing on Today names the free Hb test. Folding 'dizzy' into the 'Tired' chip would also blur a red-flag sign (dizziness with heavy flow means call 112, explain.js:44) into an everyday one. A separate chip, or a tired-plus-heavy rule, is safer; the doctor should decide.
- **Screenshot:** `web/test/shots/journey-audit/p1-track/tired-today-fold.png`

### P3 · The urgency pill and the advice text disagree on two cards (P1-20, pillar 1 audit)

- **Where:** web/mods/explain.js:54-62
- **Found:** bleed_after_stop and aftersex are level 'week', so the pill reads 'See a doctor this week', but the text says 'See a doctor within 2 weeks' (explain.js:54-56, 60-62; postmeno-explain.png).
- **Why it matters:** Mixed timing on a red-flag card makes it unclear how soon to go.
- **Advice (fix):** Make the text match the pill ('this week'), or add a 'within 2 weeks' pill for both. The doctor picks one.
- **Effort:** S; new wording needs doctor review
- **Checked:** Prefer the 'within 2 weeks' option. The reviewed menopause pages say 'see a gynaecologist within 2 weeks' for the same sign (meno.js:151, 288, 456), so changing the card text to 'this week' would contradict them.
- **Screenshot:** `web/test/shots/journey-audit/p1-track/postmeno-explain.png`

## Pillar 2: tailored plans and the companion (32)

### P1 · Two screens are both called 'My pregnancy plan', with two reminder switches (MIN-03, clutter audit)

- **Where:** mods/preg.js:973; mods/plan.js:1647 (renderMyPlan), 1576-1630
- **Found:** For Meera, 25 weeks pregnant: - The My plan tab (route plan) is titled 'My pregnancy plan': 2.48 screens, 13 controls, and a 'Remind me every day 8 pm' switch. - preg-plan (mods/preg.js:973) is also titled 'My pregnancy plan': 3.79 screens, 29 controls, it lights Explore, and it has its own switch, 'Remind me when each one is due'.  Today's step 'Due now: Scheme money... Your pregnancy plan' opens preg-plan, not the tab. Seen in name-meera-plan.png and name-meera-preg-plan.png.
- **Why it matters:** The real pregnancy plan (the due-now checklist, coming up, PMSMA) lives under Explore, while the tab of the same name is a thin wrapper. She can switch one reminder off and believe both are off.
- **Advice (merge):** In pregnancy, My plan's body is preg-plan's 'Due now' and 'Coming up', under the plan's line, look-back and trimester path. The preg-plan route opens My plan. One reminder setting lists what it reminds about (the 8 pm check-in and each due item). No new wording.
- **Effort:** M; no new health wording
- **Screenshot:** `web/test/shots/journey-audit/minimalism/name-meera-preg-plan.png`

### P1 · Week-12 results never reach the doctor: no report button, light plans send no results, stale questions (J-07, cross-pillar journeys)

- **Where:** web/mods/plan.js:476-488, 852-866; web/app.js:2612-2640
- **Found:** renderFinished (plan.js:476-488) offers Keep going, Start again and the doctor buttons, but no report link. Your care team isn't drawn there. summary() for light plans (plan.js:858-862) sends only the week, days followed and goal, so Lakshmi's report lacks 'heavy flow: before every 1-2 hours, since 1 of 3' and Kavita's lacks her hot-flush change. The report asks 'My periods are heavy. Should I have an Hb test?' (app.js:2637) after 58 days of the doctor's iron dose (lakshmi-360/34-report.png).
- **Why it matters:** The plan ends without the thing Mohit wants her to carry to the doctor. Pillar 2's evidence doesn't feed back into pillar 1's doctor visit.
- **Advice (link):** Link and reuse. Add a 'Show your doctor' button (the report) to the end screen and to Today's end card, in place of the supplements card (J-21). summary() adds the lightResults lines that already exist. Skip rp_q_heavy when an Hb result or a doctor's iron course exists.
- **Effort:** S; no new health wording
- **Checked:** Small correction: the report already carries some of this through the module summaries. Each period row is marked heavy (rpRowLine), the iron plan and its days come from iron.js summary, the latest Hb comes from cond.js labs summary, and the weekly midlife diary comes from meno.js summary. What is missing is the plan's own before-and-since lines, a report link on the end screen, and rp_q_heavy being skipped once an Hb result or a doctor's iron course exists.
- **Screenshot:** `web/test/shots/journey-audit/journey/lakshmi-360/34-report.png`

### P1 · Results don't say what changed for her goal: no verdict, no severity, no starting point, wrong measures (J-08, cross-pillar journeys)

- **Where:** web/mods/plan.js:476-499, 1590-1620
- **Found:** Riya: 'Before 47, 49 · Since 49, 46', then 'If nothing has changed, see a doctor', although noChange() already computes it (plan.js:492-499, 482). Kavita: her weekly hot-flush rating fell from 3 ('a lot') in weeks 1-4 to 1 ('mild') in weeks 9-12, but results read 'Weeks with hot flushes · 4 weeks before you started – · Last 4 weeks 3 of 3' (plan.js:1601-1604 counts any rating above 0). Joining asks no hot-flush question, so 'before' is always blank for a new woman. Lakshmi: 'Days between periods' is shown for a heavy-bleeding goal; no Hb, no tablet days.
- **Why it matters:** Week 12 is the moment that should show progress. Kavita sees no improvement that happened, Riya has to compare numbers herself, and Lakshmi sees nothing about her blood.
- **Advice (fix):** One plain sentence for each goal, from data already computed (Riya: 'Your gaps are about the same: 46 to 49 days. A doctor can look for the cause'). Midlife shows the average rating for the first 4 weeks against the last 4, not just 'weeks with'. The midlife intake reuses the weekly diary's 0-3 hot-flush row as one question, which becomes 'before'. Heavy results swap the gap card for Hb before and after (cond-labs) and tablet days (iron). Nothing is promised.
- **Effort:** M; new wording needs doctor review
- **Checked:** Minor: for the heavy goal, lightResults also shows 'Periods with heavy flow' before and since (heavyCompare), so Lakshmi does see her flow. What is missing is Hb and tablet days. noChange is at plan.js:490-497.
- **Screenshot:** `web/test/shots/journey-audit/journey/kavita-360/23-end-results.png`

### P1 · The companion goes quiet after week 3 and repeats itself (P2-01, pillar 2 audit)

- **Where:** web/mods/plan.js renderCheckin (1519-1556), reviewCard (453-467), todayHead (1687-1717), cardKind (1743-1755)
- **Found:** A woman who checks in every evening for 84 days (companion12.mjs; 9 goals): something new is said (numbers ignored) on only 5–11 of 84 days. The longest silence is 27 days (pain, heavy, PMS) to 55 days (cycle, PMOS, trying, pregnancy, after a birth). The check-in feedback is always the first Done step's reason (plan.js:1549-1550), so there are 1 or 2 different lines over 84 evenings (cycle: the walking line 82 times). The weekly look-back tip comes only from the barrier (plan.js:464-466): 'Well done. Keep going.' in 12 of 12 weeks, and her energy answer changes nothing. The plan's card leads 'Sakhi says' on only 15 or 16 of 84 days.
- **Why it matters:** Pillar 2's promise ('acts as a companion') holds for about 3 weeks. After that, Sakhi doesn't notice what she has done, so the evening check-in feels like a form, and she drifts off.
- **Advice (reuse):** Add no new card. Make the existing lines rotate and refer to her: 1. The check-in feedback cycles through the reviewed reasons of the steps she did, not only the first one. 2. The look-back's tip uses her energy answer (low energy → the existing 'tired' tip) and names her best step from the week's ticks ('Your walk: 5 of 7 days'). 3. Once a week the yesterday line becomes a 'Sakhi noticed' line from her own log. Keep it to one line on the existing Today line. Keep it in Hindi, and plain in discreet mode.
- **Effort:** M; new wording needs doctor review
- **Checked:** Some numbers are off. Days with something new: 6 to 12 of 84, not 5 to 11 (pregnancy 6, PMS 12). Longest silence: 27 days for pain, heavy and PMS; 55 for cycle, PMOS, trying and pregnancy; 48 after a birth; 53 for midlife. The cycle plan's feedback isn't the walking line 82 times: it's the walking line 61 times and the strength line ('Stronger muscles use sugar well…') 23 times. The '12 of 12 weeks' look-back tip comes from a probe woman who never had a barrier; for anyone else the tip follows the week's top barrier. The rest holds.
- **Screenshot:** `web/test/shots/journey-audit/p2-plans/c12-cycle-today-d30.png`

### P1 · Joining asks answers the plan never uses (P2-02, pillar 2 audit)

- **Where:** web/mods/plan.js SCREENS/qsOf (1091-1135), actionsFor (1294-1360), ikOfAnswers (1228)
- **Found:** tailor.mjs: of 25 single-answer changes, only 9 changed her daily steps. - Asked but never used: bedtime and work for the heavy, pregnancy, after-birth and midlife plans (qsOf 'day' asks them for every pack, plan.js:1133, but sleep() runs only for cycle, pain, trying and PMS, plan.js:1309, 1312, 1325, 1328); activity level for heavy and after-birth (lightWalk ignores it, plan.js:1292). - Only echoed on the reveal: PMS symptoms and how much they affect her day, how many days the pain lasts, and 'often tired or dizzy' with heavy periods (plan.js:1406-1416). - No effect for the cycle plan: irregular, skin and PMOS goals give identical steps, and the diet answer changes nothing on Today. Pregnancy and after-birth women answer 2 day questions, both unused.
- **Why it matters:** Joining is long (24 screens to Today), yet many answers don't shape the plan. That breaks the 'tailored to your needs' promise and costs taps on low-end phones.
- **Advice (remove):** Minimalism first: drop the questions a pack doesn't use (bedtime and work for heavy, pregnancy, after-birth and midlife; activity for heavy and after-birth). Make the rest count with content the app already has: - 'often tired or dizzy' adds the existing Hb-test doctor line; - 'affects my day a lot' (PMS) adds the PMS/PMDD log's doctor line (see P2-05); - pain for 4 or more days, or pain that stops her day, links the existing endometriosis self-check (selfcheck.js). The self-check never says 'you have X'.
- **Effort:** M; new wording needs doctor review
- **Checked:** Small fixes. A pregnant woman with the iron goal also answers the food question, and it is used; an after-birth woman with the weight goal answers 3 day questions (activity, bed, work), none of them used. So '2 questions, both unused' is true only for the other pregnancy and after-birth goals. In the recommendation, the endometriosis self-check (selfcheck-endo) and the months-of-trying style rules are TRIAGE tools (app.js:983): link them only where S.toolShown allows (pilot and demo builds).
- **Screenshot:** `web/test/shots/stages/cycle-pms-reveal.png`

### P1 · The end screen is not a summary she can keep or show a doctor (P2-03, pillar 2 audit)

- **Where:** web/mods/plan.js renderFinished (476-489), progressCore (797-818), summary (852-871)
- **Found:** End page at 360 px (cmp-end-360.png): 2.2 screens, 181 words. - Her main-goal result, 'Days between periods', is the 4th card, below the fold, under minutes, 'Strength days this week' and 'Food habits, last 7 days'. Those are snapshots of this week, not totals for the 12 weeks (plan.js:797-802). - No report link, no share and no care team on this page (plan.js:476-489). - The report's plan line (cmp-report-d84.png) has minutes, 'Strength: 0 days a week' and food, but no before-and-since results, no joining answer and no doctor-check status (summary(), plan.js:852-871). - The week-12 look-back is skipped: energy shows weeks 1 to 11 only. - The doctor card says 'If nothing has changed' even though it shows only when the app has already worked out that nothing changed (plan.js:480, 492). On the pain plan it appeared when painkiller periods got worse, 0 of 3 before and 3 of 3 since (cmp-end-pain.png).
- **Why it matters:** No sense of completion, and nothing to take to a doctor at the moment the app itself tells her to see one.
- **Advice (fix):** Reorder the same page; no new screen: 1. One headline card with her goal's before and since (the existing cycleCompare, painCompare, heavyCompare or lightResults lines). 2. Days followed. 3. What next. Fold minutes, strength, food and energy under 'Details'. Add one 'Show my doctor' button that opens the existing report-show. Add the result lines to the plan's summary doctorLines so they reach the report and the Qura hand-off. In the doctor card, state the result ('Your gaps are still about 45 days') instead of 'if nothing has changed'.
- **Effort:** M; new wording needs doctor review
- **Checked:** Two points need fixing. (1) The doctor card shows when docCase(d) OR noChange(d) (plan.js:480). So for a woman whose joining answers needed a check, it shows whatever her results are, and 'If nothing has changed' isn't always redundant. The wording mismatch is real when noChange triggers it, including the pain case that got worse (0 of 3 before, 3 of 3 since). (2) The week-12 look-back isn't skipped altogether: it is missing from the end screen, but after 'Keep going' the 'Week 12 is done' look-back appears in week 13. It is lost only for 'Start a new 12 weeks', which resets d.weeks. The report as a whole does show her gaps table and the explain line; only the plan's own line lacks results.
- **Screenshot:** `web/test/shots/journey-audit/p2-plans/cmp-end-360.png`

### P1 · 'Start a new 12 weeks' resets her to the very beginning (P2-04, pillar 2 audit)

- **Where:** web/mods/plan.js renderFinished #pl-again (488), startFromIntake (1231-1243), commitStart (1246-1258)
- **Found:** completion.mjs: Riya walked up to 30 minutes a day (150 minutes a week target) and kept the food habits. 'Start a new 12 weeks' gives: - 'Walk or move 10 minutes'; - 'Week 1 of 12 · 0 of 50 minutes'; - 'Strength days: 0 of 1'; - 'Half the plate sabzi · New this week' again. commitStart copies a fresh level from the activity answer and resets the weeks (plan.js:1237, 1246-1258). The intake replays 6 screens with her old answers (again-screens). Nothing suggests the next plan from her result.
- **Why it matters:** A woman who succeeded is sent back to 10 minutes. There is no progression and no 'next plan' that fits her results.
- **Advice (merge):** Merge the two 'What next' rows into one result-aware choice: - 'Keep my habits' (maintenance, see P2-05); - 'Work on something else' (opens the goal screen only). A new plan on the same goal starts at her last 4 weeks' average minutes, and treats habits she ticked on 4 of 7 days or more as kept, starting at the next one. No new wording beyond two row labels.
- **Effort:** M; no new health wording
- **Checked:** Small fix: the replayed intake does ask 'How active are you now?' again, so she could pick 'Most days' (START 120 a week, 25 min a day). Nothing sets the level from what she actually did, and the food habits always restart at week 1. 'Sent back to 10 minutes' happens when she keeps her earlier answer.
- **Screenshot:** `web/test/shots/journey-audit/p2-plans/cmp-end-360.png`

### P1 · 'Keep going' has no structure, no month-4 follow-up and no end (P2-05, pillar 2 audit)

- **Where:** web/mods/plan.js reviewCard (453-467), cardKind (1743-1755), remOnNow (446)
- **Found:** After 'Keep going': - Look-backs stop after week 12 (planWeeks cap in reviewCard, plan.js:454), and there are no month cards (weeks 5 and 9 only, plan.js:1748). - The steps freeze at week 12. 'Less oil · New this week' still shows at week 20 (c12-cycle-myplan-last.png; plan.js:423, 443). - The reminder never ends (until: null, plan.js:446). - In 56 days, 3–9 days with anything new (companion12). - A woman who stopped checking in sees the same 'Shall we start again, small?' card every day from day 91 to day 182 ('Not now' hides it for a day only, plan.js:1753, 1760). The month-4-to-6 follow-up ('How have your periods been?'), the moment where the 50 to 60% target is measured (companion-journey section 6, Oberg 2018), doesn't exist.
- **Why it matters:** The period result she joined for usually shows at 3 to 6 months, exactly when Sakhi has gone silent. And Mohit can't measure the outcome.
- **Advice (reuse):** Make 'Keep going' a light maintenance mode with 3 reused pieces: 1. The weekly look-back carries on (lift the 12-week cap when kept). 2. One results card around day 112 to 120 that reuses the end screen's headline card and its doctor card. 3. After 14 quiet days, one 'Pause the reminder?' card instead of the daily restart card. Fix the 'New this week' pill. Only the month-4 heading is new wording.
- **Effort:** M; new wording needs doctor review
- **Checked:** One clarification: the week-12 look-back does show once in week 13 after Keep going; after that, none. The rest is accurate. The month-4 follow-up is listed as V39 work in companion-journey section 12 (line 541), so it is planned but not built. The '14 quiet days → pause' idea is the same as P2-17's, so build it once.
- **Screenshot:** `web/test/shots/journey-audit/p2-plans/cmp-myplan-after-keep.png`

### P1 · No doctor path in the PMS, midlife, trying and after-birth plans (P2-06, pillar 2 audit)

- **Where:** web/mods/plan.js docCase (1398), noChange (492), cardKind (1751)
- **Found:** Both doctor rules cover only the cycle, heavy and pain plans: docCase (plan.js:1398-1404) and noChange (plan.js:492-498). - PMS: she said 'affects my day a lot', and her low/anxious days rose from 0 to 9 in 30 days. No doctor card at the reveal or at week 12 (cmp-end-pms.png). The app's own PMS/PMDD log has a PMDD 'when to see a doctor' section (periods.js:117-179). - Midlife (hot flushes): never. - Trying for a baby: the months-of-trying rule exists (ttc.js:195-204) but never reaches the plan. - After a birth: the 6-week check content and its reminder button exist (post.js:286-287, 866) but never appear in the plan.
- **Why it matters:** Pillar 1 and 2 promise to send her to a doctor when her records point to something. Four of eight plans never do.
- **Advice (reuse):** Extend docCase and noChange with lines the app already has, never 'you have X': - PMS: 'a lot', or low days rising → the PMS log's PMDD doctor line; - trying: the months-of-trying card at 12 months (6 if 35+); - after a birth: the 6-week check as a step on days 35 to 42; - midlife: no better after 12 weeks → the midlife module's own doctor line. The doctor confirms where each one goes.
- **Effort:** M; new wording needs doctor review
- **Checked:** Overstated for after a birth: every after-birth plan's first step until day 42 is the daily recovery check, whose danger signs send her to 112 or a doctor (post.js:89, 123-138). What's missing there is the 6-week check and anything after day 42. The trying plan's weekly before-pregnancy checklist also includes check-ups to discuss with her doctor or ASHA. What's missing is a results-driven doctor rule (months of trying, PMS 'a lot' or rising low days, midlife no change). The PMS and midlife gaps hold as stated. The months-of-trying tool is gated, so offer it only where toolShown allows.
- **Screenshot:** `web/test/shots/journey-audit/p2-plans/cmp-end-pms.png`

### P1 · Weekly targets don't adapt to what she did (P2-07, pillar 2 audit)

- **Where:** web/mods/plan.js target (155), reviewCard (453-467), journeyCycle ring (418)
- **Found:** target() depends only on the week number and her starting level (plan.js:155), and the look-back says 'Next week: {target}' (plan.js:466). - weeks-walk: she moved 10 minutes on 1 of 7 days in week 1, then saw '0 of 60 minutes'; after 0 of 7 days in week 4, '0 of 90 minutes' (shots/weeks d29-my-plan). - A diligent woman's look-back still says 'Next week: 60 / 70 / 80 minutes'. The companion plan's V38 promise ('weekly targets that adapt to what she did') isn't built.
- **Why it matters:** A woman who struggles sees a growing gap ('0 of 90'). That's the kind of number that makes people quit, and it contradicts 'Missed a day? Nothing to catch up.'
- **Advice (fix):** If last week's minutes were under half the target, hold that week's target (or step back one week) and say so in the look-back with the existing plan_rev_next string. No new screen.
- **Effort:** S; no new health wording
- **Checked:** None. If anything it's stronger than stated: in the probe a woman who moved 70 minutes in week 1 was told 'Next week: 60 minutes', a target below what she had already done.
- **Screenshot:** `web/test/shots/weeks/16-d29-my-plan.png`

### P1 · After a pregnancy loss, My plan offers PMOS and period plans (P2-08, pillar 2 audit)

- **Where:** web/mods/plan.js renderMyPlan (1647-1661), catalogue (912-962); app.js afterLossNow (623)
- **Found:** lifechange.mjs, a loss at 10 weeks (pregEndedOn set, as endPregnancy does): - Today's top card is 'Free check-ups for you'. - My plan shows 7 period goals plus 12 more plans: 'My PMOS plan', 'Could it be PMOS?', 'Strength at home'. 304 words, no mention of the loss, no link to the loss pages (lc-preg-loss-myplan.png). - GOALS has no after-loss stage (plan.js:1049-1050); stageNowKey falls back to 'cycle' (1516).
- **Why it matters:** Unkind at the hardest moment, on a shared phone too. It reads as if the app didn't notice.
- **Advice (hide):** While S.cycle.afterLoss() holds, replace My plan's goal list and catalogue with one card: - the loss module's own 'after a loss' page; - 'Trying again', when she wants it; - Help; - 'Pick a goal when you're ready' as a text link. No plan suggestions for 6 weeks unless she asks. Use a neutral title in discreet mode.
- **Effort:** S; new wording needs doctor review
- **Checked:** Holds, and it's worse than stated. pauseWhy (plan.js:59) knows only a pregnancy and the first 6 weeks after a birth. So a cycle or light plan that was paused by the pregnancy resumes the day the pregnancy ends: its steps and 'Shall we start again, small?' card return, and its reminder comes back via pauseSync (188-193). If its dates have run out, it shows 'Your 12 weeks are done' instead. The fix should also hold any paused plan while S.cycle.afterLoss() is true. Note that the end-pregnancy button does open the loss hub once (app.js:1854); My plan and Today never link back to it.
- **Screenshot:** `web/test/shots/journey-audit/p2-plans/lc-preg-loss-myplan.png`

### P1 · Life changes end her plan silently, with no 'new chapter' and wrong offers (P2-09, pillar 2 audit)

- **Where:** web/mods/plan.js packOf (1056-1062), renderMyPlan (1647-1661), catalogue (912-962), homeRec (1026-1035)
- **Found:** lifechange.mjs: - Cycle plan, then pregnant on day 30: Today loses the plan line. My plan shows the paused card, the goal list and 'Pick one... Sakhi makes your 12-week plan' (plan.js:1658, though a pregnancy plan has no 12-week end). - Trying plan, then pregnant: the plan vanishes, and Today shows 'A plan for you: My pregnancy plan', which opens the check-up checklist, not a plan. - Pregnancy plan, then birth: 3 days after the birth, More plans lists 'My PMOS plan', 'For period cramps' and 'Small steps for PMOS' (lc-preg-to-birth-myplan.png). catalogue fits relief-cramps and journey-pmos on !preg only (plan.js:936, 960). - None shows what she did on the plan that ended. The companion plan's 'one new chapter screen' (section 6) isn't built.
- **Why it matters:** The moments where she most needs her companion (positive test, birth) give her a menu instead.
- **Advice (merge):** One shared 'Your plan has changed' card in the slot and on My plan whenever the stage ends her plan: - what she did (days followed and one result line); - the one plan for her new stage, already set up with the goal pre-filled (pregnancy → My pregnancy plan; birth → recovery), so she just taps Start. Filter the catalogue by stage: nothing for periods or PMOS in pregnancy or the first 6 weeks after a birth.
- **Effort:** M; new wording needs doctor review
- **Checked:** Small fix: 3 days after the birth, More plans' 'My PMOS plan' row carries the pill 'After your 6-week check' (paused: early && !pOn, plan.js:928), so that row is stage-aware. 'For period cramps', 'Small steps for PMOS' and 'My plate' are not, since their fit is only !preg.
- **Screenshot:** `web/test/shots/journey-audit/p2-plans/lc-preg-to-birth-myplan.png`

### P1 · Changing her goal or starting again erases her weekly look-backs (P2-10, pillar 2 audit)

- **Where:** web/mods/plan.js commitStart (1246-1258), stop (1636), renderProgress (826-833), summary (852-853)
- **Found:** commitStart sets d.weeks = {} (plan.js:1252), deleting every weekly energy answer of the previous plan. The settings row promises 'Starts a new 12 weeks. What you logged stays.' (plan_set_goal_s, plan.js:1624). Stopping also hides the old results: renderProgress needs packOf (plan.js:829), and the plan's section leaves the doctor report (summary returns [], plan.js:853).
- **Why it matters:** A small but real data loss under the 'P0: data loss' rule. Not P0 because the diary and the daily plan log stay; only the weekly energy answers go, against the screen's own promise.
- **Advice (fix):** Before resetting, keep the old plan as d.past[] {pack, goal, start, end, weeks, result lines}. Show one 'Your last plan' results card on My plan, and keep its line in the report. No new screen.
- **Effort:** S; no new health wording
- **Checked:** None. Also note that the daily log (d.log, keyed by date) and d.body survive, but progressCore and cycleCompare count from the new d.start, so the old plan's minutes and results don't show anywhere either.
- **Screenshot:** `web/test/shots/journey-audit/p2-plans/lc-stop-after.png`

### P2 · My plan repeats Today's steps and the check-in button (MIN-10, clutter audit)

- **Where:** mods/plan.js:407, 1639, 1647
- **Found:** journeyCycle (mods/plan.js:407) and renderLight (mods/plan.js:1639) draw a 'Today' block with the same steps Today shows, their Done and +10 to +30 controls, and 'How did today go?'. Riya's My plan is 3.34 screens with 22 controls (tab-riya-en-plan.png).  In pregnancy, My plan's 'Today's steps' lists 2 rows while Today lists 4: two different lists under the same name. Diet audit 5.6 already found the useful tiles 2 screens down.
- **Why it matters:** There are two places to tick the same step, and the plan's own content (path, results, tiles) is pushed down the page.
- **Advice (remove):** Replace the block with one row, 'Today: 1 of 3 done · Check in', that opens Today. Move the tiles from diet audit 5.6 into the freed space. Minutes become an option on Done (ux-gaps F4). This also shortens My plan by about a screen.
- **Effort:** S; no new health wording
- **Checked:** Minor: in the cycle plan the duplicated controls are the +10/+15/+20/+30 minute chips plus habit and sleep checkboxes, not Done buttons. In light plans (todaySteps) the rows are links plus 'How did today go?'. This is not a duplicate of diet audit 5.6/F10, which is about where the tiles sit, not the repeated Today block.
- **Screenshot:** `web/test/shots/journey-audit/minimalism/tab-riya-en-plan.png`

### P2 · The pregnancy plan's settings say 'Starts a new 12 weeks' (MIN-17, clutter audit)

- **Where:** mods/plan.js:1624, 1928, 2118
- **Found:** plan_set_goal_s, 'Starts a new 12 weeks. What you logged stays.' (mods/plan.js:1928), shows for every plan, including the pregnancy plan, which runs until the birth (planWeeks 0, MODULE_API section 41). Seen in name-meera-plan.png.
- **Why it matters:** It tells a pregnant woman something false about her own plan.
- **Advice (fix):** Use a line for each plan, for example 'Choose a different focus for your pregnancy plan'. This is interface wording, in English and Hindi.
- **Effort:** S; no new health wording
- **Screenshot:** `web/test/shots/journey-audit/minimalism/name-meera-plan.png`

### P2 · When results show no change, the biggest button is a supplements consult (J-21, cross-pillar journeys)

- **Where:** web/mods/plan.js:476-488, 824
- **Found:** Riya's end screen, after 'Before 47, 49 · Since 49, 46' and 'If nothing has changed, see a doctor', ends with a large pink card: 'Want advice on supplements or medicines? … Qura's doctors are Ayurveda (BAMS) doctors… Ask a Qura doctor about supplements or medicines' (pmosAsk, plan.js:486, 824).
- **Why it matters:** At the low point of 'nothing changed', the most prominent call to action points to supplements and a paid-adjacent consult instead of the free doctor and her report.
- **Advice (remove):** Remove the card from the results page. It can stay in My plan settings or Help. The end actions become 'Free government doctor' and 'Show your doctor' (the report button from J-07).
- **Effort:** S; no new health wording
- **Checked:** Minor: the card is the dark (ink) card with a full-width button (askCard, plan.js:824), not pink.
- **Screenshot:** `web/test/shots/journey-audit/journey/riya-360/43-plan-end-results.png`

### P2 · Weekly look-backs lead with zero, and a petal pops up over 'see a doctor' (J-22, cross-pillar journeys)

- **Where:** web/mods/plan.js:453-467 (reviewCard); web/mods/joy.js (petal toast)
- **Found:** A new mother at week 6 saw 'Week 6 is done · You followed your plan on 0 of 7 days' as the top card. Lakshmi, on her heavy-period day, saw 'Week 2 is done · 0 of 7 days' above 'More from Sakhi'. On day 118, Riya's 'See a doctor this month' arrived with the 'A petal for today · February flower' pop-up.
- **Why it matters:** These are the emotional low points of the journey, made worse by a count of nothing or a celebration at a worrying moment.
- **Advice (hide):** Hide. A 0-of-7 week shows the existing fresh-start line once, not a look-back. There are no counts in the first 6 weeks after a birth. No petal pop-up on a day a doctor-level finding appears. All existing lines.
- **Effort:** S; no new health wording
- **Screenshot:** `web/test/shots/journey-audit/journey/pooja-360/49-post-day45.png`

### P2 · No follow-up after week 12; the end card stays indefinitely (J-23, cross-pillar journeys)

- **Where:** web/mods/plan.js:1687-1695, 476-488
- **Found:** On day 215, 12 days after Riya's plan ended, Today still showed 'MY PMOS PLAN · Your 12 weeks are done · See your results' (todayHead finished, plan.js:1693), next to the finding 'Your last gap was 46 days · See a doctor this month'. No code path asks at months 4 to 6 how her periods have been. The companion design planned this as V39's 'Month-4 follow-up' (companion-journey §6 and §12), and it is the point where the 50-60% target is measured.
- **Why it matters:** The companion goes quiet once the 12 weeks end, which is exactly when cycle change shows (3 to 6 months).
- **Advice (add):** Add one card that replaces the lingering end card after 14 days. At weeks 16 to 24, 'How have your periods been since your plan?' reuses cycleCompare against her start, with Keep going and the free doctor. No new screen.
- **Effort:** M; new wording needs doctor review
- **Screenshot:** `web/test/shots/journey-audit/journey/riya-360/45-day215-after-plan.png`

### P2 · The month 1 and 2 'look-backs' are only a link (P2-13, pillar 2 audit)

- **Where:** web/mods/plan.js planCard month (1732), afterHomePlan #pl-m-go (1761)
- **Found:** The reveal promises 'Week 4: a look at your first month' (plan_rv_w4, plan.js:1477), and the path labels it 'Month 1 look-back'. What she gets is a slot card, 'Month 1 done · See how your habits and your cycle are doing', in the first 3 days of weeks 5 and 9 (plan.js:1732, 1748). It opens plan-progress (cycle) or the same My plan page she uses daily (light plans) (plan.js:1761; c12 monthPage). There's no month summary, no 'Did you get the doctor check?' (companion-journey section 6, week 4), and nothing changes.
- **Why it matters:** A promised milestone that delivers nothing new weakens trust in 'what happens when'.
- **Advice (fix):** The month card is the summary itself, 3 lines in the slot: - days followed this month against last month; - her goal's result line; - the doctor check's status, if it was needed and not done. The link stays underneath. It reuses the results code; no new screen.
- **Effort:** S; new wording needs doctor review
- **Checked:** None. The month card is also hidden in discreet mode (cardKind !disc(), plan.js:1748), so a discreet-mode woman gets no month milestone at all.
- **Screenshot:** `web/test/shots/journey-audit/p2-plans/c12-pain-month-w5.png`

### P2 · The plan's doctor check and the diary's 'see a doctor' card don't talk (P2-14, pillar 2 audit)

- **Where:** web/mods/explain.js home (254-262); web/mods/plan.js afterHomePlan (1758)
- **Found:** The irregular-periods woman taps 'Yes, done' on the plan's doctor check on day 2 (plan.js:1758 sets d.doc='done'). Yet 'Your last gap was 42 days · See a doctor this month' still leads 'Sakhi says' on 68 of 84 days, and on most days of 'Keep going' (companion12 cycle and PMOS). explain.js:256-258 holds back only the 'late_now' watch card, and only while the plan's card is showing.
- **Why it matters:** She is told daily to do what she has already told Sakhi she did, so she learns to ignore 'see a doctor'.
- **Advice (link):** When she taps 'Yes, done', mark explain's gap and late cards as seen (its existing 'seen' map) for 90 days, and note 'You told Sakhi you had the check' on her results. A red-flag card (90 days with no period) still always shows.
- **Effort:** S; new wording needs doctor review
- **Checked:** Small fix: she can hide explain's card herself with its 'Got it' on the explain page (seen[id:at], explain.js:251). That holds until the next period changes the finding's key, so the 68 of 84 days applies to a woman who never taps it. Still, 'Yes, done' on the plan's check doesn't tell explain anything, which is the point of the finding.
- **Screenshot:** `web/test/shots/journey-audit/p2-plans/c12-cycle-today-d30.png`

### P2 · Ticking 'Done' on a link step doesn't touch the tool (P2-15, pillar 2 audit)

- **Where:** web/mods/plan.js renderCheckin (1524, 1536), markAction (1362-1369)
- **Found:** The check-in asks Done / Partly / Not today for every step except 'check' (plan.js:1524), including link steps: - Trying: 'Before-pregnancy checklist' ticked Done every week for 12 weeks, then results say '0 of 17 done' (c12-ttc). - Midlife: 'Weekly symptom diary' Done 12 times, then 'Fill in your weekly symptom diary to see this' (c12-meno, cmp-end-meno.png). - Pregnancy: 'Due now: Register your pregnancy' ticked Done on 31 evenings while it stayed due.
- **Why it matters:** 'Followed 84 of 84 days' sits next to empty results, and the pregnancy plan can't tell what is really done.
- **Advice (reuse):** Treat 'link' steps like the V38 'check' kind. No Done chips; the check-in shows 'Do it now' or 'Done today' from the tool's own record (S.ttc.prepDone, S.meno.thisWeek, S.preg.plan.due). The pattern exists already.
- **Effort:** S; no new health wording
- **Checked:** None. Only three steps are kind 'link': ttc prep, the meno diary and the pregnancy 'Due now' (the relief and pelvic links are 'tick'). Today already hides Done for them (NO_TAP), so the gap is only in the check-in.
- **Screenshot:** `web/test/shots/journey-audit/p2-plans/cmp-end-meno.png`

### P2 · Strength days never count from Today or the check-in (P2-16, pillar 2 audit)

- **Where:** web/mods/plan.js actionsFor (1306), markAction (1362-1369)
- **Found:** On a strength day the step is a 'minutes' walk that opens the strength routine (plan.js:1306). markAction sets the strength day only for the 'routine' kind (plan.js:1367). A woman who ticks every step Done for 84 of 84 days sees 'Strength days: 0 of 2' every week and 'STRENGTH DAYS THIS WEEK 0 / 2' at the end. The doctor report says 'Strength: 0 days a week' (cmp-report-d84.png).
- **Why it matters:** Wrong numbers on the end screen and in the doctor report. It also looks like she failed a target nobody explained.
- **Advice (fix):** On a strength day, Done on the step (Today or the check-in) also marks the strength day. Or make the strength routine itself the step (kind 'routine', which already counts).
- **Effort:** S; no new health wording
- **Checked:** Small fix: strength days do count when she opens and finishes the strength routine itself (plan.js:706: run.id === 'strength' sets x.str). They don't count from Today's Done button or the check-in, as stated.
- **Screenshot:** `web/test/shots/journey-audit/p2-plans/c12-cycle-end.png`

### P2 · Stopping is a cliff: no pause, no smaller plan (P2-17, pillar 2 audit)

- **Where:** web/mods/plan.js settingsHtml/wireSettings (1621-1637), cardKind lapse (1753)
- **Found:** 'Stop my plan' asks once ('Stop your plan? What you logged stays on your phone'). Then: - My plan shows the generic catalogue; - Today shows 'Free check-ups for you' first (lifechange stop-after, lc-stop-after.png); - her results become unreachable. There's no pause for travel or illness, though the companion plan's section 7.5 planned one. A lapsing woman gets the same restart card daily (completion: day 91 to 182) while the 8 pm reminder keeps ringing.
- **Why it matters:** She has only all or nothing. Women who would pause for a week stop for good, and Sakhi loses her.
- **Advice (fix):** Put two choices in the same confirm card: - 'Pause for a week': the reminder and restart card go quiet, then it resumes; - 'Stop': her results stay as 'Your last plan' (P2-10). After 14 quiet days, offer the pause once instead of the daily restart card. Two labels only.
- **Effort:** S; no new health wording
- **Checked:** None on the facts. Its 'pause after 14 quiet days' is the same idea as P2-05 item 3, so build it once.
- **Screenshot:** `web/test/shots/journey-audit/p2-plans/lc-stop-after.png`

### P2 · The PMS plan ignores her symptoms and the PMS log (P2-18, pillar 2 audit)

- **Where:** web/mods/plan.js actionsFor pms (1326-1328), lightResults (1608-1612); web/mods/periods.js (117-179)
- **Found:** The PMS plan is the same 3 steps for 84 days (calm breath, walk, bed): plan.js:1326-1328, c12-pms stepSets = 1. Headache, breast pain and bloating give the same plan as low mood (tailor.json). The app's PMS/PMDD daily log lined up by cycle day ('Mood and body through your cycle', periods.js:117) is never a step or a result. The results count generic low-mood days instead (plan.js:1608-1611). The validated-tools research (RCOG GTG 48) names a two-cycle daily diary as good practice.
- **Why it matters:** 'Tailored' in name only, and her best evidence (two cycles of the log) is collected nowhere.
- **Advice (merge):** Merge: on her calm week (the trigger exists, plan.js:1377) the PMS log becomes a 'check'-kind step for 2 cycles, and its cycle-day chart becomes the PMS plan's result. Keep the symptom answers as the log's pre-ticked rows. No scored screen (PSST and DRSP wait for the M0 partner).
- **Effort:** M; new wording needs doctor review
- **Checked:** None. calmWeek() (plan.js:1377) is used only to change Today's sub line (1712); the steps never change.
- **Screenshot:** `web/test/shots/journey-audit/p2-plans/w390-hi-pms-myplan.png`

### P2 · The after-birth recovery plan never moves on (P2-19, pillar 2 audit)

- **Where:** web/mods/plan.js actionsFor post (1340-1348), pathHtml (1559-1575)
- **Found:** With goal 'recovery' the steps are 'Daily recovery check | Pelvic floor trainer' every day from day 14 to day 98 after the birth, and forever after Keep going (c12-post stepSets = 1; plan.js:1341-1348). post.js's own check card stops at day 42 (post.js:905). The 6-week check text and its reminder button exist (post.js:286-287, 866) but are never a plan step. My plan shows two week counts: 'Week 5 after the birth' and 'Week 3 of 12', because pathHtml special-cases only pregnancy (plan.js:1559-1575; w390-post-myplan-two-weeks.png).
- **Why it matters:** Daily danger-sign checks at 14 weeks feel pointless, while the one key moment (the 6-week check) is missing. The two week counts confuse.
- **Advice (reuse):** On days 35 to 42 the step is 'Your 6-week check' (post.js's reviewed line and its reminder). From day 43, recovery moves to a short walk plus pelvic floor (lightWalk exists), and the daily check stays in Explore. The after-birth path counts her own weeks after the birth, like pregnancy.
- **Effort:** S; new wording needs doctor review
- **Checked:** Small fix: the titles stay the same, but the recovery step changes kind at day 42, from 'check' (done only by doing the check) to an ordinary 'tick' link to the same page. That's why stepSets = 1 by title.
- **Screenshot:** `web/test/shots/journey-audit/p2-plans/w390-post-myplan-two-weeks.png`

### P2 · Midlife results depend on a separate diary; her MRS score is unused (P2-20, pillar 2 audit)

- **Where:** web/mods/plan.js lightResults meno (1603-1607); web/mods/meno.js meno-score
- **Found:** The midlife plan's hot-flush, sleep and mood results come only from the weekly symptom diary (plan.js:1603-1607). After 12 weeks of check-ins, the result reads 'Fill in your weekly symptom diary to see this' (cmp-end-meno.png). The app already has the Menopause Rating Scale, which says 'Take it again each month to see what changes, and show it to your doctor' (meno.js:514-596, 662), but the plan never uses it. It is a triage tool, on in pilot builds (app.js:983).
- **Why it matters:** Midlife women finish 12 weeks with an empty 'How it is going', so the plan can't show change honestly.
- **Advice (reuse):** Where S.toolShown('meno-score') holds, make the score the plan's step in week 1 and week 12, and its before-and-since the headline result. The weekly diary stays as it is. Use plain words ('your score went from 14 to 11'), never a verdict. Tester builds keep the diary only.
- **Effort:** S; new wording needs doctor review
- **Checked:** Context: the weekly symptom diary is already a plan step (day 7 of each week, plan.js:1357). The empty result comes from ticking that link step Done without filling the diary, which is P2-15. Using the MRS as a week-1 and week-12 step fits only where toolShown('meno-score') holds (TRIAGE, app.js:983). Show it as plain numbers, never a severity verdict.
- **Screenshot:** `web/test/shots/journey-audit/p2-plans/cmp-end-meno.png`

### P2 · Knee or back pain is never asked, so everyone gets kneeling poses (P2-21, pillar 2 audit)

- **Where:** web/mods/plan.js Q (1107-1125), startFromIntake (1237), stepsOf (336-347)
- **Found:** The V37 intake has no knee or back question (Q, plan.js:1107-1125), and every new plan gets limits {knees: false, back: false} (plan.js:1237). The question exists only on the old V35 form (plan_s_lim, plan.js:513), which is unreachable in normal use. 'Cycle care yoga' for every woman is warmup, child pose, butterfly, half camel ×2, cobra ×3, locust ×2, bridge (tailor.json base routine). The knee and back swaps (plan.js:300, 336) never switch on.
- **Why it matters:** Women with knee or back pain are shown moves the app itself would swap. Low harm, since 'Stop and rest if' exists, but it's needless.
- **Advice (move):** One chip row on the existing 'When can you move' screen ('Do your knees or back hurt?' with the existing plan_s_lim labels), or ask once when she first opens a routine. No new screen.
- **Effort:** S; no new health wording
- **Checked:** 'Unreachable in normal use' is wrong. The V35 form with 'Any pain in your knees or back?' is reached whenever a woman with no plan running opens plan-pmos: My plan > More plans > 'My PMOS plan', Explore's 'PMOS: food, yoga and moves' tile, the 'Start your PMOS plan' setup card, or My progress's empty-state button. renderHub shows 'Start my plan', and that opens plan-start. It holds that the V37 joining intake and 'Change what I work on' never ask, so most women get limits {knees: false, back: false}.
- **Screenshot:** `web/test/shots/firstday/A-12-when-move.png`

### P2 · Joining says 'what you told Sakhi' twice; 24 screens to Today (P2-23, pillar 2 audit)

- **Where:** web/mods/plan.js SCREENS (1091-1102), renderReveal (1445-1515)
- **Found:** firstday-walk counts 24 screens before Today: 15 joining, 3 sign-up and 6 plan cards (about 506 words on the cards). - The 'Here's what you told Sakhi' summary (A14, 75 words) and card 1's 'Made from what you told Sakhi: …' (A19) repeat the same echo. - 'How each day works' and 'What happens when' are separate cards (A21, A22). - The optional 'Your body' screen is asked for every cycle goal but used only for the weight goal (P2-02). The diet audit's 4.6 already covers the cards' word count and the repeated disclaimer.
- **Why it matters:** Length without new information, on low-end phones where every screen costs time.
- **Advice (merge):** Merge the summary into card 1 (its 'Change' links move there). Merge cards 3 and 4 into one 'Your days and weeks' card. Ask the body screen only for the weight goal. That makes 21 screens with the same reviewed text, reordered.
- **Effort:** S; no new health wording
- **Checked:** Two fixes. (1) It's 23 screens before Today, not 24: 14 joining, 3 sign-up, 6 plan cards. The walk's 'periods-q-answered' snapshot is the same screen as 'periods-q'. (2) The body screen's answers are used beyond the weight goal: they feed My body, the 'Your body' card on My progress, and the doctor summary's weight, waist and BMI lines (plan.js:815-816, 865-869). They change the daily steps only for the weight goal. The reveal word count and the repeated footnote are diet audit 4.6/VD-07, as the finding says.
- **Screenshot:** `web/test/shots/firstday/A-14-summary.png`

### P3 · 'Your care team' repeats the Help sheet on every My plan (MIN-19, clutter audit)

- **Where:** mods/plan.js:1576-1600; app.js:876-886
- **Found:** careTeam (mods/plan.js:1576) shows Free government doctor, My ASHA, A Qura doctor and Report for any doctor: 4 rows, about half a screen, on every plan. The Help sheet (app.js:876-886) has 'See a doctor' and 'My ASHA', and Explore's Govt. services has the free doctor and ASHA again. So ASHA appears in 3 places and a doctor in 3.
- **Why it matters:** It makes My plan longer with links she already has one tap away in the header.
- **Advice (merge):** Make it one 'Your care team' row that opens the Help sheet, and add the report to that sheet. Show the full team only at the plan's doctor moments (the doctor check, or week 12 with no change).
- **Effort:** S; no new health wording

### P3 · Joining to her first Today takes 22 screens and 33 taps (MIN-20, clutter audit)

- **Where:** app.js:1261-1356; mods/plan.js (intake, renderReveal)
- **Found:** join.json, cycle goal at 360 px. The screens, in order: - language and welcome; - birth decade, then year (two screens for one answer); - stage, then last period; - her goal, then 4 question screens and the summary; - the shared-phone question; - 3 sign-up screens; - 5 plan cards and the Start screen.
- **Why it matters:** Every screen before value loses some women (first-days audit). These are small cuts that keep V37.1's expectation-setting.
- **Advice (merge):** Keep Mohit's four V37.1 decisions. Merge decade and year into one picker. Merge card 3 ('How each day works') and card 4 ('What happens when') into one card, with the diet audit's 4.6 three-icon day strip and the disclaimer once. That takes 22 screens to 20 and shortens the plan cards to one idea each.
- **Effort:** S; no new health wording
- **Checked:** Correction: birth decade and year are one screen, not two. Step 1 re-renders the year chips under the decade chips on the same page (app.js:1276-1280), with one progress step and 2 taps. So joining is 21 screens before the first Today, not 22. Merging decade and year saves at most a tap, not a screen. Merging reveal cards 3 and 4 takes 21 to 20. join.json also logs 'after signup' and 'card 1' as two entries for the same 'Your plan is ready' screen.
- **Screenshot:** `web/test/shots/journey-audit/minimalism/join-cycle-irregular-first-today.png`

### P3 · Hindi uses ताक़त for both 'energy' and 'strength days' (P2-24, pillar 2 audit)

- **Where:** web/mods/plan.js hi strings (1989-2048)
- **Found:** The same results page shows 'इस हफ़्ते ताक़त के दिन 0 / 2' (strength days) next to 'हर हफ़्ते आपकी ताक़त: कम / ठीक' (energy). The look-back asks 'इस हफ़्ते आपकी ताक़त कैसी रही?' (plan.js:1989, 1996, 2045, 2048; cmp-end-hi-360.png).
- **Why it matters:** A Hindi reader can't tell her energy from her strength workouts.
- **Advice (fix):** Energy becomes 'ऊर्जा', or 'आप कैसा महसूस कर रही थीं'; ताक़त stays for strength. The translator checks it.
- **Effort:** S; no new health wording
- **Checked:** None.
- **Screenshot:** `web/test/shots/journey-audit/p2-plans/cmp-end-hi-360.png`

### P3 · 'New this week' stays on 'Less oil' for good (P2-25, pillar 2 audit)

- **Where:** web/mods/plan.js journeyCycle (423), wkStart (443)
- **Found:** wkStart() caps at week 12 (plan.js:443), and the pill shows when h.wk === wkStart (plan.js:423). 'Less oil · New this week' shows from week 11 and still at week 20 after Keep going (c12-cycle-myplan-last.png). The look-back also stops being honest about what's new.
- **Why it matters:** A small detail that makes the plan feel unattended after week 12.
- **Advice (fix):** Show the pill only in the 2 weeks a habit is added, and never once the plan is kept going.
- **Effort:** S; no new health wording
- **Checked:** Small fix: showing it in weeks 11 and 12 is correct, the same 2 weeks every other habit gets. The bug is only after week 12: todayPlan caps the week at N (plan.js:174), so wkStart stays 11 and the pill never goes. This differs from diet audit 2.3, which is about the food step staying 'Less oil', not the pill; P2-05 repeats this point.
- **Screenshot:** `web/test/shots/journey-audit/p2-plans/c12-cycle-myplan-last.png`

## Pillar 3: knowledge, the self-help book and schemes (24)

### P1 · Explore shows the same 16 topics and 173 items to every stage (MIN-07, clutter audit)

- **Where:** app.js:1157-1178 (renderCare), 1167
- **Found:** renderCare maps every section into the topic grid (app.js:1167). The grid was identical for all 6 stages tested (explore.json). Items that don't fit her stage: - 27, not trying: 50 of 173 (29%: pregnancy 23, after birth 10, menopause 17); - 25 weeks pregnant: 76 (44%: periods 25, contraception 6, missed period 6, trying 16, menopause 17, girls 6); - 48: 55 (32%: trying 16, pregnancy 23, after birth 10, girls 6).  The Explore root is 3.44-3.49 screens with 32 controls for everyone. Hiding the off-stage cards in the page (simulated) left 8-11 cards and 2.64-2.89 screens (sim-explore-meera.png).
- **Why it matters:** Pillar 3 reads as a library for every woman, not her guide. A pregnant woman scrolls past menopause and trying-to-conceive topics.
- **Advice (hide):** Under 'Topics for you', show only the topics that fit her stage (stageNow), plus any her goal or contraception method needs. One 'All topics' row opens the full grid. Pregnancy loss stays reachable by search and All topics, never pushed. The Food card from diet audit 5.1 goes first.
- **Effort:** S; no new health wording
- **Checked:** Two corrections. (1) In discreet mode the stage-only grid would reveal her pregnancy or stage on a shared phone, as diet audit F9 already found for For you. Keep the full or neutral grid in discreet mode. (2) Contraception is not off-stage in pregnancy: choosing a method after the birth (PPIUCD) is advised during antenatal care. Keep it for pregnancy, which makes Meera's off-stage count 70 rather than 76.
- **Screenshot:** `web/test/shots/journey-audit/minimalism/tab-riya-en-care.png`

### P1 · Two libraries that almost never link to each other or to the tools (P3-01, pillar 3 audit)

- **Where:** web/app.js:2131 relatedHtml, 2950 renderArticle; all mods/*.js guide pages
- **Found:** There are 69 Learn articles (17,425 words) and 63 module guide pages (median 487 words), and they barely connect. - In 25 modules there are only 2 links to a Learn article (journey.js 'a-pmos.what-pmos-is'; iron.js 'pregnancy.iron-folic-acid-calcium-td'). - renderArticle (web/app.js:2950-2962) offers only "Ask a Qura doctor" and "also asked". "Also asked" is the first 3 articles of the same group (relatedHtml, app.js:2131), not related ones. "Painful periods" offers "What a menstrual cycle is", "usual gap" and "why irregular", but no link to the cramps routine or the endometriosis pain diary, although its own text says "a diary of your pain matters". - 32 of 69 articles are referenced by no screen, quick answer or "what helps" table, including 7 of 8 Free services articles. - About 30 articles repeat a module guide's topic: painful-periods/periods-pain, common-period-myths/periods-myths, pads-cloth-cups-tampons/periods-products, first-periods-for-teens/teen-first, hormone-therapy-explained/meno-hrt, bones-heart-after-40/meno-bones, government-support-schemes/access-schemes-preg, after-birth-first-six-weeks/post.
- **Why it matters:** She reads about pain and never meets the tool that helps, or the reverse. The same topic sits in two places with two layouts, so the library feels like scattered pages, not one book.
- **Advice (link):** Add one small map in core: article id, guide route, tool route. - An article shows one "Use the tool" row from the map, for example Painful periods leads to the cramps routine and the pain diary. - A guide shows one "Read more" row back to its article. - "Also asked" uses the map instead of the group's first 3. - Where an article and a guide cover the same topic, the guide becomes the long read and the article its 1-minute version. - On reading pages, make the tool the main button and "Ask a Qura doctor" the second. This needs no new wording.
- **Effort:** M; no new health wording
- **Checked:** Minor: there are 26 module files in web/mods (25 plus lang.js); still only 2 article links (journey.js:24, iron.js:147). The '~30 articles repeat a guide topic' count was not re-counted, but the examples given do exist.
- **Screenshot:** `web/test/shots/journey-audit/pillar3/article-painful-periods-en-360.png`

### P1 · After a pregnancy loss, Explore offers contraception, period pain and PCOD (still open from the 23 Oct audit) (P3-03, pillar 3 audit)

- **Where:** web/app.js:1000 FOR_YOU, 1019 forYouKeys, 2119 qaHtml
- **Found:** Set-up: pregEndedOn 14 days ago (afterLoss() is true). - For you: What your diary shows, My check-ups, Reminders, Period pain, Contraception. - Your questions: Period late?, Period pain, White discharge, Heavy bleeding, PCOD / PMOS, Irregular periods. - Today's slot: "Free check-ups for you". - No loss guide appears anywhere. forYouKeys (app.js:1019-1031) and FOR_YOU (app.js:1000) still have no loss group. This is P1 #1 of docs/for-you-audit-2026-10-23.md, unbuilt. The same audit's item 7 is also still open: a "Just learning" woman gets diary tools first.
- **Why it matters:** It hurts at the worst moment: contraception and "Period late?" two weeks after a miscarriage, while the 5 reviewed loss guides stay one topic card away.
- **Advice (fix):** Do as the for-you audit advised. - While afterLossNow(), For you shows: Your body after a loss, Grief and your feelings, What happened in plain words, My check-ups, Govt. services. - Your questions come from the loss guides. - No contraception or trying tiles. - Add a learner group: Periods guides, check-ups, Govt. services. These are existing reviewed tiles only.
- **Effort:** S; no new health wording
- **Checked:** Today's slot read 'Set up Sakhi for you 2/5 · Add your check-up dates · Free from 30: cervical screening and a breast exam', not 'Free check-ups for you'. Same meaning. Also note that loss-recovery (loss.js:165) already covers contraception after a loss, so taking the Contraception tile off For you loses nothing.
- **Screenshot:** `web/test/shots/journey-audit/pillar3/explore-after-loss-en-360.png`

### P1 · No dos and don'ts for pregnancy; sex, travel and sleeping position aren't covered (P3-04, pillar 3 audit)

- **Where:** mods/preg.js, mods/pregtools.js, content.json pregnancy group, mods/post.js
- **Found:** Search, pregnant woman: - "pregnancy dos and donts" and "pregnancy precautions": My pregnancy plan, This week of pregnancy, How to read a pregnancy test; articles "Missed period: what to do first" and "Folic acid…before pregnancy". - "garbh me kya na kare" puts "Two or more miscarriages" 3rd (the same loss-demotion miss as diet audit item 1.2). - "sex in pregnancy": How to read a pregnancy test. - "safar" and "travel": nothing. Content: - 0 lines on sex in pregnancy, travel or sleeping position in preg.js, pregtools.js or the 8 pregnancy articles. - What exists is scattered: tobacco and alcohol (preg.js:510), the bed-rest myth (joy card 'rest'), kicks, and danger signs. - After a birth, "jaapa" and "sawa mahina" return nothing, and post.js has no lines on bathing or the 40-day stay-at-home customs (the diet audit covers only the food side, 3.8).
- **Why it matters:** "What should I not do?" is the first question of most pregnant women and their families. Sakhi has most of the reviewed answers but no single place that gives them, and search sends her to test-kit and loss pages.
- **Advice (add):** Add one "Dos and don'ts" quick answer per stage (pregnancy, after birth, periods) as the first tile in Explore's existing "Your questions", in the answer-sheet format with Listen. - Build it mostly from reviewed lines (tobacco, rest, kicks, danger signs, the kesar and eating-for-two myths). - Add 3 to 4 new lines for pregnancy (sex, travel, sleeping on her side) and 2 to 3 for after a birth (bathing, customs that keep her from care). These need doctor review. - Route the do/don't search words to it. No new screen.
- **Effort:** S; new wording needs doctor review
- **Checked:** Sleeping position is already covered: preg.js:346 (the week-28 tip) says 'go to sleep on your side, left or right; it is safer for the baby than lying on your back'. Reuse that line; only sex and travel in pregnancy are missing, so about 2 new pregnancy lines need review, not 3 to 4. The 'garbh me kya na kare' loss ranking overlaps diet audit 1.2, as the finding itself says.

### P1 · An applied PMMVY claim still shows as "Scheme money" due in the pregnancy plan and on Today (P3-05, pillar 3 audit)

- **Where:** mods/preg.js:926 PLAN 'scheme'; mods/access.js claims
- **Found:** Pregnant at week 21, with a PMMVY claim marked Applied 15 days ago (mods.access.claims.pmmvy.applied). - preg-plan still lists "Scheme money: PMMVY and JSY" under Due now. - S.preg.plan.due() returns it, so Today reads "Due now: Td injections, and 4 more". - The plan item { id: 'scheme' } (mods/preg.js:926) has no auto rule, while 'ifa', 'asha' and 'reg' are ticked automatically from their own tools.
- **Why it matters:** Two trackers for one claim. Her companion keeps telling her to claim money she has already applied for, and she has to tick it twice.
- **Advice (fix):** Make the 'scheme' item done automatically when a pmmvy or jsy claim has applied or got set, through a read-only S.access.claims(). This follows the ifa/asha pattern. No new wording.
- **Effort:** S; no new health wording
- **Screenshot:** `web/test/shots/journey-audit/pillar3/claims-preg-plan-after-applied-en-360.png`

### P1 · Searching by scheme name fails, and the Hindi "जननी सुरक्षा" leads to violence pages (P3-06, pillar 3 audit)

- **Where:** web/app.js:1102 SYN, 1162 TOOL_SYN, 1200 searchResults; mods/access.js SCH
- **Found:** Pregnant woman: - "matru vandana", "poshan", "kilkari", "9 tarikh", "5000", "chutti", "tika" and "sonography" return nothing. - "janani suraksha" puts STI tests first. - "जननी सुरक्षा" lists Intimate health and safety, Violence and your safety, and Feelings, friends and safety. - "nasbandi" finds only Contraception, not the sterilisation compensation. - "menstrual hygiene scheme" returns 24 unrelated tools. Cause: search scores tile titles, keywords and subtitles, and article titles and summaries only (app.js:1144-1160 searchResults, 1162 TOOL_SYN). It never reads scheme names inside access.js or any page body.
- **Why it matters:** Women ask for a scheme by its full or local name. On a shared phone, a pregnancy-money search that opens violence pages is confusing and could be alarming.
- **Advice (fix):** Add TOOL_SYN rows for each scheme's abbreviation, full name, Hinglish and Hindi name, and amounts (5000, 1400, 9 tarikh). Each opens the schemes page with that card open (access mem.open). Pin about 15 of these searches in test/value.mjs. No new wording.
- **Effort:** S; no new health wording
- **Checked:** 'menstrual hygiene scheme' does not return only unrelated tools. Its top 3 are the scheme pages (Government schemes for you; Money and free care in pregnancy; Schemes after the birth), then period guides. The real miss is that the ₹6 Menstrual Hygiene Scheme pads are not on any scheme page. Line references: SYN is app.js:1046, TOOL_SYN 1106, searchResults 1144 (not 1102/1162/1200).

### P2 · Each topic page and its module hub list the same tools twice (MIN-11, clutter audit)

- **Where:** app.js:1180-1185; the hub tiles in each module (for example mods/periods.js, mods/contra.js, mods/preg.js)
- **Found:** renderTopic (app.js:1180) lists the module's hub tile plus its tools. The hub then lists 75 of those 83 tools again (hubs.mjs): periods 6/6, contraception 5/5, trying 7/7, pregnancy 11/14, conditions 8/11, menopause 7/7, and others. Explore > Periods (4.67 screens) > All period guides (2.3 screens) > the page. Compare topic-periods.png with hub-periods.png.
- **Why it matters:** There are two index screens in a row with the same list, 12 times over, and she can't tell which one is 'the' topic.
- **Advice (merge):** One page per topic: the topic route draws the module's hub (its intro, cross-links, method and week pages) with the Learn articles under it, and the hub tile goes. That removes 12 index screens and 75 repeated links. Tools stay 3 taps away; hub content moves from 3 taps to 2.
- **Effort:** M; no new health wording
- **Screenshot:** `web/test/shots/journey-audit/minimalism/hub-periods.png`

### P2 · Four Explore 'topics' are tool drawers, not topics (MIN-12, clutter audit)

- **Where:** app.js:797-800; mods/lang.js:739; mods/journey.js:157; mods/joy.js
- **Found:** TOOLS_SPLIT (app.js:797-800) turns tools into four topic cards: - 'My plans and reminders' (4: the 21-day journey, reminders, medicines, iron); - 'My records' (3: the report, ABHA reports, the summary); - 'Feel better, family and more' (8, including Language, Today for you, Doctor videos and Symptom guide); - 'Just for fun' (2: the garden and the myth quiz).  Language is also a Me row (lang tile, mods/lang.js:739). Seen in topic-support.png and tab-riya-en-care.png.
- **Why it matters:** A quarter of the topic grid is settings and records that belong to other tabs, which makes Explore longer and blurs pillar 3.
- **Advice (move):** Move each drawer's contents to where it belongs: - reminders and medicines to Me's Reminders; - records to Diary (one report, MIN-16); - the journey into the plans (MIN-13); - the garden to My plan as the check-in reward (companion doc, section 9); - the myth quiz into Sakhi's book; - Feel better now and Explain to my family into For you by goal.  Remove the Language tile, since Me has it. That is 4 topic cards fewer.
- **Effort:** S; no new health wording
- **Checked:** Small fixes. lang.js:739 is the Explore tile; the Me row is the me hook at lang.js:771. 'Feel better, family and more' also holds 'Talk to a Qura doctor' (ask). Removing the Language tile also takes it out of search, which matches tiles. Keep language findable by search (for example 'bhasha' leading to the Me row), since diet audit F15 already found language hard to find.
- **Screenshot:** `web/test/shots/journey-audit/minimalism/topic-support.png`

### P2 · 'Today for you' is a second Today with dengue and heat cards, and 'Doctor videos' are all 'Planned' (MIN-14, clutter audit)

- **Where:** mods/access.js:682-683, 695, 762, 906-911, 1040-1063
- **Found:** The access-feed tile (mods/access.js:1052) shows in pilot builds. Its daily feed includes: - 'Dengue season' (paracetamol, aspirin and ibuprofen advice), July to November; - 'Heat season', March to June (mods/access.js:682-683).  Both are outside reproductive health, and the feed repeats Today's cycle-day and free-care cards (access-feed.png). access-videos (mods/access.js:762) lists talks that are each tagged 'Planned' (access-videos.png). access-stories can be reached only from storyRow, a homeMore hook core no longer draws.
- **Why it matters:** It breaks the 'reproductive health only' rule and adds a second 'Today' under Explore. A videos screen with no videos reads as unfinished.
- **Advice (remove):** Remove the Today for you and Doctor videos tiles and the stories route. Bring the videos back once they are recorded and reviewed.
- **Effort:** S; no new health wording
- **Checked:** Correction: the 'Today for you' tile is not pilot-only. It is gated:true, but 'gated' only adds a pill in proto mode (tileHtml, app.js:1040), and access-feed is not in TRIAGE, so it shows in every build. 'Planned' appears as the tile subtitle ('Planned talks, with a short text version now') and as a 'Recording planned' pill in each talk's sheet. Each talk does have a short text version, so removing the tile removes that text too.
- **Screenshot:** `web/test/shots/journey-audit/minimalism/access-feed.png`

### P2 · The library has two different groupings, and Learn is a 6-screen list (MIN-15, clutter audit)

- **Where:** app.js:997, 2935-2948
- **Found:** Learn (renderLearn, app.js:2935) shows 69 articles in 8 groups with their own names: Periods and cycles, PMOS, Planning a baby, Pregnancy and schemes, Personal care, After 35, Mind and food, Free services. Explore's 16 topics use other names: TOPIC_GROUPS (app.js:997) puts Mind and food under Periods, After 35 under Menopause, and Personal care under Intimate health.  Learn is 5.95 screens with 43 controls and 893 words (1,612 in Hindi). Mohit's pillar 3 asks for a self-help book.
- **Why it matters:** The same article sits under different names in two places, and a 6-screen flat list doesn't read as a book she can return to.
- **Advice (merge):** Use one grouping. 'Sakhi's book' takes the topic names as chapters, her stage's chapters first. Each chapter is a collapsed row that opens that topic's articles, and the Learn root drops to about 1.5 screens. Article text is unchanged; the diet audit's 4.4 pictures come later.
- **Effort:** M; no new health wording
- **Checked:** Small correction: Learn is not a flat list of 69. Its 'All' view has a group tab row and shows each group's first 3 articles plus a link to the rest (renderLearn, app.js:2940-2942), about 24 rows. It is still 5.95 screens, as stated.

### P2 · The library never meets the plan: 0 article links in 12 weeks; findings open topic lists (J-16, cross-pillar journeys)

- **Where:** web/mods/plan.js (no a- links); web/mods/explain.js:29, 214-220
- **Found:** mods/plan.js has 0 links to any Learn article ('a-…' routes). Riya's 12-week PMOS plan never surfaced any of the 10 PMOS articles (tests a doctor orders, same signs with a different cause). The finding's 'Read more' opens the Conditions topic list (516 words, 3.8 screens, 20 links) rather than the article (explain.js:29). The diet audit's 4.4 covers article layout; this is about the link.
- **Why it matters:** Pillar 3 (dos and don'ts, the self-help book) stays something she has to go looking for, instead of arriving when the plan or a finding makes it relevant.
- **Advice (link):** Reuse reviewed articles. Add one 'Read' link step a week in the plan, from her goal's articles (for example a-pmos.tests-and-why in the doctor-check week). Each finding's 'Read more' opens its one matching article. No new wording.
- **Effort:** S; no new health wording
- **Screenshot:** `web/test/shots/journey-audit/journey/riya-360/15-explain-read-more-topic-cond.png`

### P2 · JSY is missing after the birth; overdue scheme steps just pile up (J-18, cross-pillar journeys)

- **Where:** web/mods/access.js:234-236; web/mods/preg.js:920-934
- **Found:** The after-birth schemes list omits 'jsy' (access.js:236), though JSY cash is paid after an institutional delivery. In pregnancy, 'Due now: Scheme money: PMMVY and JSY' stays a quiet link from week 5 to 40. By week 34 Today read 'Due now: Td injections, and 7 more', with no overdue cue or 'ask your ASHA this week'. After the birth, the unticked scheme step disappears with the pregnancy.
- **Why it matters:** Pillar 3's schemes are present but drift away from the moment she can claim them.
- **Advice (reuse):** Reuse. Add 'jsy' to the after-birth list (the card exists). Carry an unticked 'Scheme money' step into the recovery plan's first 2 weeks. After its window, mark a due step 'overdue: ask your ASHA'. Check JSY timing at the primary source first.
- **Effort:** S; no new health wording
- **Checked:** Correction to the second half: at week 34 those steps are within their windows, not overdue (Td runs to 36 weeks, schemes to 40). The pile-up comes from long windows. Missed windows already show as 'past' on the pregnancy plan with 'If you missed one, ask your ANM about it at your next visit' (preg.js:14), and the module rules out alarms by design (preg.js:916-917). Drop the 'overdue' marker. Keep the JSY fix and the carry-over of an unticked scheme step into the first weeks after the birth.
- **Screenshot:** `web/test/shots/journey-audit/journey/pooja-360/47-schemes-post.png`

### P2 · PMMVY's two payments are tracked as one (P3-07, pillar 3 audit)

- **Where:** mods/access.js claimBlock / myClaims / claimSync
- **Found:** Claim steps are STEPS = ['ready','applied','got'] (mods/access.js, My claims block). After the birth, a claim with got set shows "Money or card received · 29 Jun 2026" and is finished. - The scheme's own benefit text says ₹3,000 after a check-up, then ₹2,000 after the 14-week vaccines. - At day 100 after the birth, past 14 weeks, neither Today nor My claims mentions the second part.
- **Why it matters:** The second ₹2,000 is the part women most often miss, and the tracker can't show it.
- **Advice (fix):** For PMMVY's first child only, split the received step into "Part 1 received" and "Part 2 received". Once the baby is 14 weeks old (from deliveredOn, as post-checks' vaccine dates already work out), show one line from the verified benefit text. Labels only.
- **Effort:** S; no new health wording

### P2 · The scheme finder asks what Sakhi knows, forgets the rest and ignores her state (P3-08, pillar 3 audit)

- **Where:** mods/access.js:223 Q, TAGS, renderSchemes, renderFree
- **Found:** - A 48-year-old on access-schemes is asked "Are you pregnant now?" and "Did you have a baby in the last 12 months?"; she gets 0 "Likely for you" and 10 "Check if it fits". - A pregnant woman still sees "Are you pregnant now?". It is preset only by the page tag (TAGS.preset, mods/access.js). - Govt. services' schemes row always opens the all-schemes page, whatever her stage (renderFree). - "Which child", "ration card" and "Ayushman card" are never saved (by design, comment in access.js), so they are asked again after each restart. - The JSY card lists 10 states and two amounts, though her PIN's state is on the phone whenever Care near me's data is bundled.
- **Why it matters:** 5 questions take the first screen (schemes start about 2 screens down, p-access-schemes-preg-preg-en-360.png), and the answer is still "check if it fits".
- **Advice (fix):** - Prefill pregnant, baby and girl-under-18 from her diary and hide those questions. - Open her stage's page (access-schemes-preg or -post) from Govt. services. - Offer "Remember on this phone" for the 3 answers, with a Forget button and nothing sent. - With Care data, show her state's JSY amount. Labels only.
- **Effort:** S; no new health wording
- **Checked:** 'Girl under 18 at home' cannot be prefilled from her diary: Sakhi stores only her own age. Only 'pregnant' and 'baby in last 12 months' can be prefilled. The first scheme heading sits about 1.2 screens down on access-schemes and about 1.4 on access-schemes-preg at 360×800, not about 2. Saving the answers reverses a deliberate 'not saved' choice (access.js:12, 562), so it is Mohit's call.
- **Screenshot:** `web/test/shots/journey-audit/pillar3/p-access-schemes-meno-en-360.png`

### P2 · The schemes list lags the guides on pads and Kilkari, and carries off-scope TB and dengue items (P3-09, pillar 3 audit)

- **Where:** mods/access.js SCH, TAGS, feedCards; mods/teen.js; mods/periods.js
- **Found:** - teen.js and periods.js already state the ₹6 pack of 6 pads from the ASHA (Menstrual Hygiene Scheme) and the Supreme Court's order of 30 Jan 2026 (Dr Jaya Thakur v Union of India) for free pads in schools (https://www.scobserver.in/supreme-court-observer-law-reports-scolr/dr-jaya-thakur-v-government-of-india18873/). The schemes page's Periods filter lists only Suvidha ₹1 pads, AMB, RKSK and PM-JAY (TAGS.period). - Kilkari appears only inside the Learn article government-support-schemes. - The general list includes Ni-kshay Poshan (TB in any family member). - Today for you shows a "Dengue season" card in October and a heat card in March to June (access.js:680-683). Both are outside reproductive health. - PMMVY isn't run in Odisha or Telangana, which run their own schemes (MAMATA; KCR Kit and Amma Odi) per a Lok Sabha answer (https://eparlib.sansad.in/bitstream/123456789/3011039/1/AU5654_T1uj3k.pdf). The app only says "ask your Anganwadi worker".
- **Why it matters:** A girl or mother checking "what am I owed" misses free pads the app knows about, and sees TB and dengue items that break "reproductive health only".
- **Advice (move):** - Add one "Free and ₹6 pads for girls" card reusing the teen.js wording. - Add the Kilkari line (from the article, with its shared-phone note) to the pregnancy plan's scheme item. - Show Ni-kshay only on the genital TB page. - Drop the dengue and heat cards. - For Odisha and Telangana, add one line naming the state scheme. Check each against the state's own official page first.
- **Effort:** S; no new health wording
- **Checked:** Kilkari is in two Learn articles, not one: register-by-12-weeks and government-support-schemes, the latter with the shared-phone note. It is in no module.

### P2 · Topic pages and module hubs list the same guides: a third list layer (P3-10, pillar 3 audit)

- **Where:** web/app.js:1180 renderTopic; each module's renderHub
- **Found:** Across 12 topics, 75 of the 83 guides on the topic pages (besides the hub itself) are listed again on the module hub: - periods 6/6, contra 5/5, pregtest 5/5, teen 5/5, intimate 5/5, loss 4/4, cond 8/11, screen 5/5, ttc 7/7, preg 11/14, post 7/9, meno 7/7. - The path is Explore, then topic-periods, then "All period guides", then the guide: three list pages. - topic-periods is 4.7 screens at 360 px (7 tools, then 18 articles with long summaries).
- **Why it matters:** Extra taps and two near-identical pages per topic, with no extra information. It is the main reason the library reads as scattered.
- **Advice (merge):** Merge them. - A topic card opens its module hub directly. - The hub gains that topic's Learn articles, titles only, at the bottom, and becomes the topic's chapter page. - renderTopic stays only for topics without a module (records and the like, which P3-11 moves away anyway). This removes 12 list pages.
- **Effort:** S; no new health wording
- **Checked:** The 'three list pages' path is wrong. renderTopic lists every guide tile itself (topic-periods shows 6 guides plus 'All period guides'), so the path is Explore → topic → guide. The hub is a redundant parallel list, not a required step. The overlap numbers are exact.
- **Screenshot:** `web/test/shots/journey-audit/pillar3/topic-periods-cycle-en-360.png`

### P2 · Articles sit under the wrong topics, so some topics show none and 8 articles have no home (P3-13, pillar 3 audit)

- **Where:** web/app.js:997 TOPIC_GROUPS, renderCare; mods/access.js renderFree
- **Found:** TOPIC_GROUPS (app.js:997) maps whole groups, not articles. - "After a pregnancy loss: care and support" sits in the conceive group, so it shows under Trying for a baby. The Pregnancy loss topic has 0 articles. - After birth has 0, though "The first six weeks after birth" exists (pregnancy group). - Contraception has 0, though "Contraception in perimenopause" exists. - Girls and families has 0, though "First periods: a guide for girls" and "For a daughter or sister under 18" exist. - The 8 Free services articles appear under no topic, because the Free card is skipped when access-free exists (renderCare). Govt. services doesn't link them: 0 code references to doctor-visit-bring-and-ask, reading-prescription-tests and see-gynaecologist-government-hospital.
- **Why it matters:** A woman after a loss, or a mother of a girl, opens her topic and finds no reading. The how-to-use-free-care articles are cut off from the services they explain.
- **Advice (move):** - Tag topics per article; an article may sit in two topics. - Add one "How to use free care" row on Govt. services opening those 3 articles. Move only; no new wording.
- **Effort:** S; no new health wording

### P2 · The book doesn't know what she has read, and doesn't start at her stage (P3-14, pillar 3 audit)

- **Where:** web/app.js:2935 renderLearn, artHtml; mods/joy.js:187 reads
- **Found:** - After "Painful periods" was open for 10 s, its Learn row was unchanged, though state.mods.joy.reads recorded 'cycle.painful-periods' (used only for a badge). - There is no read mark, no "continue", no progress per group and no save. - Learn opens on All, groups in content order, with Periods first even for a pregnant woman. It is 884 words over 5.9 screens, showing 3 of each group (learn-all-cycle-en-360.png). - Listening to one card is diet audit item 4.8; not repeated here.
- **Why it matters:** Without a sense of place or progress she can't use it as a self-help book she works through.
- **Advice (reuse):** Reuse joy.reads; don't add bookmarks: - a ✓ on rows she has read; - "3 of 10 read" on each chapter; - one "Continue: <next unread in your stage's chapter>" row at the top; - Learn opens at her stage's group. No new storage.
- **Effort:** S; no new health wording
- **Screenshot:** `web/test/shots/journey-audit/pillar3/learn-all-cycle-en-360.png`

### P2 · The same fact in several copies with different numbers: myths, pad changes, danger signs (P3-15, pillar 3 audit)

- **Where:** mods/joy.js:60 CARDS, mods/periods.js:332 MYTHS, mods/family.js, content.json, web/app.js renderHelp
- **Found:** - Period myths are answered in 4 places: the Learn article "Common myths about periods" (7 myths), periods-myths (10, MYTHS at periods.js:332), Sach ya Myth (16 period cards of 31) and the family card "Periods are normal". The pickle myth is in all 4, worded differently. - Pad changes: "every 4 to 6 hours" (joy.js card 'pad', family.js daughter card) against "every 4–8 hours" (periods.js twice, teen.js, the Learn pads article). - Pregnancy danger signs are listed in at least 6 places: the Learn danger-signs article, Help, family.js DANGER, access-partner, preg-symptoms and access-symptoms.
- **Why it matters:** Two numbers for one rule erode trust. Every copy is another place for a doctor's correction to be missed.
- **Advice (merge):** Use one shared myths deck and one danger-sign list in core, read by every screen (the same approach as the diet audit's one foods table). - The periods myths page, the Learn myths article and the family card become views of the deck. - The doctor picks one pad-change number.
- **Effort:** M; new wording needs doctor review
- **Checked:** Some numbers are wrong, but the inconsistency is real and wider than stated. The pad rule reads '4 to 6 hours' (joy.js:71, family.js:46), '4–8 hours' (teen.js:170 and the Learn first-periods-for-teens article), 'at least every 6 hours' (the Learn pads article) and 'every few hours' (periods.js:280). The periods.js 4–8 h lines (282, 314) and the pads article's 4–8 h line are about tampons, not pads. Sach ya Myth has 8 period-myth cards (9 with teen irregular); 16 is the number of cards shown to a 'cycle'-stage woman, including contraception and screening cards. The pickle myth is in all 4 places.

### P2 · Contraception fears and myths get one line (P3-16, pillar 3 audit)

- **Where:** mods/contra.js renderHub/renderChooser; mods/joy.js
- **Found:** - contra.js has no myths or worries section. Its only myth-style line is "Antara does not cause infertility". - Sach ya Myth has 4 contraception cards: pregnancy during a period, Copper-T and later fertility, the emergency pill, condoms. - Nothing answers common fears such as a Copper-T moving inside the body, or pills and weight or cancer. - Searching "copper t" finds tools only.
- **Why it matters:** Fear of side effects is the main reason methods are refused or stopped. The chooser gives facts but doesn't meet her worries.
- **Advice (add):** Add "Worries and facts" on the contraception hub, drawn from the shared deck (P3-15): reuse the 4 cards and add a few new doctor-reviewed ones. No new screen.
- **Effort:** S; new wording needs doctor review
- **Checked:** Sach ya Myth has 5 contraception cards, not 4: it also has 'pppreg', getting pregnant after a birth before periods return. contra.js has a few more myth-style lines than the Antara one: NSV 'does not affect strength, manliness or sex' (contra.js:302), Chhaya with no hormone side effects (95), the Copper-T 'can come out whenever you want' (183), and per-method 'what to expect' lists (heavier periods; it can slip out). 'copper t' finds 11 tools plus 1 article (Contraception in perimenopause).

### P2 · Knowledge searches in her words miss or rank the wrong stage (beyond the diet audit's food words) (P3-17, pillar 3 audit)

- **Where:** web/app.js:1102 SYN, 1162 TOOL_SYN, 1193 rankTiles
- **Found:** 20 of 124 knowledge and scheme searches were empty. - No results: "kya karna chahiye", "gharelu upay", "tanke", "टांके", "tika", "sonography", "jaapa", "sawa mahina". - An adult on the irregular-periods plan searching "irregular periods" gets first the tool "Your first period" and the article "First periods: a guide for girls and parents". - "safe days" ranks Intimate health and safety first, not "Why no app can name your fertile day". - "breast lump" ranks Breastfeeding first. - "pap smear" ranks Food in pregnancy 3rd.
- **Why it matters:** She types the question the way she would ask a friend and gets nothing, or a girls' guide.
- **Advice (fix):** - Add these words to SYN and TOOL_SYN, resolved by stage. - Rank teen pages lower for women 20 and over. - Send "safe days" to the fertile-day article. - Send "kya kare / kya na kare / precautions" to P3-04's dos and don'ts answer. - Pin the queries in test/value.mjs. No new wording.
- **Effort:** S; no new health wording
- **Checked:** The '20 of 124' total was not re-run; every example checked is accurate. 'tika' and 'sonography' repeat P3-06.

### P2 · Module guides are long and use many layouts; the longest grew since 22 Oct (P3-19, pillar 3 audit)

- **Where:** mods/teen.js, mods/intimate.js, mods/access.js, mods/family.js, mods/periods.js and other guide renderers
- **Found:** - 63 module guide pages: median 487 words, range 93 to 1,313; 19 are over 4 screens at 360 px. - The longest grew since the app audit (item 21, still open): teen-mother 8.6 screens (was 7.7), intimate-safety 6.5 (was 5.8), access-partner 6.1 (was 5.4). - Layouts differ page to page: accordions (14 on the schemes page, 11 in post-feed), card stacks (9 in family), flag stacks (10 in periods-myths), heading stacks. - Sources: Learn folds them under every article. Modules mix a linked Sources fold (access, screen, contra, cond, meno, loss), a one-line "Sources: RCOG, NHS" (periods), and no Sources line at all (teen.js, intimate.js, family.js, relief.js: 0 matches for 'source'). - Learn articles are uniform at 200 to 329 words.
- **Why it matters:** Every page reads differently, which makes the book harder to learn, read aloud and review.
- **Advice (fix):** Adopt the Learn template for guides: summary, sections folded under clear headings, "When to see a doctor", then sources and checked date. Start with the 5 longest. This only re-lays out reviewed text; pictures are diet audit 4.4.
- **Effort:** M; no new health wording
- **Checked:** post.js also has 0 'source' matches, so the list is not exhaustive. The 63-page median of 487 words was not re-counted.

### P2 · The best-evidence self-help programmes (menopause CBT, CBT for insomnia) are one-line mentions (P3-20, pillar 3 audit)

- **Where:** mods/meno.js, mods/relief.js, mods/plan.js meno pack
- **Found:** The research file (19 Oct, sections A and E2) puts these under "build now": - a 4 to 6 week menopause CBT course (NICE NG23 2024; IMS 2026 Grade A); - CBT for insomnia (European guideline 2023, Grade A). In the code: - meno.js has 2 lines saying CBT helps. - relief.js has 3-minute hot-flush and sleep routines. - The midlife plan's steps reuse those routines (plan.js actionsFor, meno pack). - plan.js has 0 CBT matches.
- **Why it matters:** The self-help book offers 3-minute routines where a proven weekly course would strengthen an existing feature, the 40+ plan.
- **Advice (add):** Use the existing plan engine. The midlife plan's weekly step becomes a 6-week CBT lesson (one card a week, read aloud), and the sleep goal gets a CBT-I version. No new screen. Our own words, with doctor review.
- **Effort:** L; new wording needs doctor review

### P3 · Three static "when to see a doctor" lists (P3-21, pillar 3 audit)

- **Where:** web/app.js:2967 renderHelp; mods/access.js:850 renderSymptoms; mods/screen.js:401 renderSigns
- **Found:** - Help's safety guide (by urgency, the same for all; app.js:2967). - Symptom guide (access-symptoms: 8 body areas). It reuses Help's own keys (K(key), access.js) and is filed under "Feel better, family and more". - Warning signs worth a check (screen-signs, by organ). - Each Learn article also has its own block.
- **Why it matters:** She has to know which of three lists to open. The most usable one, by body area, is the hardest to find.
- **Advice (merge):** Make the Symptom guide's body-area chips into tabs inside Help's "When to see a doctor", with screen-signs as the "Screening signs" tab. This removes one tile and reuses the wording.
- **Effort:** S; no new health wording
- **Checked:** access-symptoms is in the TRIAGE list (app.js:983), so it is hidden in tester builds, and screen-signs is gated, while Help shows in every build. Merged tabs inside Help must keep those gates.

## Across the pillars: hand-overs (13)

### P0 · After the PMOS self-check, an undiagnosed woman with long gaps is offered no plan (J-02, cross-pillar journeys)

- **Where:** web/mods/plan.js:928-931; web/mods/selfcheck.js:160-161
- **Found:** Riya, day 118: 2 logged gaps of 47 and 49 days, self-check done (2 of 9 signs, 1 of 3 PMOS criteria, 'See a doctor this month'), no diagnosis. S.plan.recs() returned []. My plan says 'Suggested for you: Nothing to suggest yet. Log your periods and how you feel'. The cycle plan scores only for PCOS, a 'match' verdict or check-in signs (mods/plan.js:928-929). The self-check entry stops counting once it is done (plan.js:930). The self-check result has no plan button (mods/selfcheck.js:160-161).
- **Why it matters:** Pillar 1 hands her to pillar 2 only if she already knows to open My plan and pick 'Irregular or late periods'. That is the plan built for exactly her.
- **Advice (link):** Link, don't add. (1) The self-check result and the long-gap finding each get one 'Next step' row: '12-week plan for irregular periods', opening plan-goal with goal 'irregular'. (2) The catalogue gives the cycle plan points from s.long >= 2 whatever the PMOS status, so My plan suggests it. Reuse the existing labels (ob_h_irregular, plan_d_12w).
- **Effort:** S; no new health wording
- **Checked:** Small correction: plan-pmos also scores for a 'risk' verdict (young women, 2 points) and for the weight, skin and irregular goals (plan.js:928-929). An adult with 1 of 3 signs gets level 'one', and the long-gap point needs !s.sc, so she scores 0. Severity reads as P1 (a disconnect, no harm), not P0.
- **Screenshot:** `web/test/shots/journey-audit/journey/riya-after-selfcheck/02-myplan-after-selfcheck.png`

### P1 · Today has 15 to 17 separate things to tap on a busy day (MIN-04, clutter audit)

- **Where:** app.js:1767, 1838, 1841 (slot), 2037-2039
- **Found:** today.json, 360x800 at 8:30 pm: 5 blocks in every case (the V37 target). Tappable things, excluding the header and tabs: Riya and Asha 15, Sunita and Kamla 16, Meera and Priya 17. That is 28-31 controls on 1.80-2.01 screens.  Things that need not be there every day: - the 'This month' round button, which carries a red dot every day until the monthly check-in is done (app.js:2039); - the hero's 'Change stage' link (app.js:1838; also in Me > My health details); - the pregnancy hero's 'This week' and 'Check-up visits' (app.js:1767). These repeat the 'This week' round button (app.js:2037) and the plan's 'Due now' step; - the 'More from Sakhi (2-4)' fold of setup, check-ups and Coming up.  Removing these in the page (simulated) cut controls from 28-30 to 21-22 and length to 1.55-1.71 screens. The first plan step moved from y=805 to 662 (Riya), 861 to 723 (Meera) and 738 to 698 (Kamla), against a fold at 735.
- **Why it matters:** Her plan, the reason for the app, competes with a dozen other taps. On a 360 px phone the first step is below the fold. This adds to the diet audit's finding 4.9, which shrinks the hero.
- **Advice (remove):** Remove from Today: - the 'This month' round button (it moves to Diary, MIN-01); - the 'Change stage' link; - the pregnancy hero's two buttons; - the 'More from Sakhi' fold.  Show one 'Sakhi says' card at a time; the next comes when she has dealt with it. Setup becomes a Me row while unfinished (MIN-18); Coming up lives in Reminders. Keep 3 round buttons (Period, Spotting, Symptoms) and the + on scroll.
- **Effort:** S; no new health wording
- **Checked:** Three corrections. (1) Not '5 blocks in every case': women with an urgent explain card (sample Priya, 'Nita') have 6 blocks (today.json). (2) The quoted y-positions after removal include deleting the ring legend (.ring-key, 97 px), which the recommendation does not list. With only the named removals, Riya's first step moves from 805 to 765 and is still below the 735 fold. Meera (861 to 723) and Kamla (738 to 698) do clear it. Getting Riya's step above the fold also needs diet audit 4.9's hero shrink. (3) The 'keep Period, Spotting, Symptoms' advice fits the cycle stage only. In pregnancy and the first weeks after a birth the round buttons are different (This week, My logs, Recovery, Feeding), so keep them stage by stage.
- **Screenshot:** `web/test/shots/journey-audit/minimalism/sim-today-meera.png`

### P1 · Today's 4-row cap silently drops a tablet or reminder due today into a fold (MIN-05, clutter audit)

- **Where:** app.js:1920-1937; mods/plan.js:836-841
- **Found:** todayHtml keeps only the first 4 rows (app.js:1930, .slice(0, 4)), and plan steps take order 25 and up (mods/plan.js:840). - Asha on the cycle plan: her pill and 3 plan steps fill the 4 rows. Her own reminder, 'Call Didi about the camp' at 11:00, becomes the 4th folded card under 'More from Sakhi (4)'. - Meera at 29 weeks: iron, 'Due now', 'Food in pregnancy' and 'Kick counter' fill the rows. Her 13:00 calcium tablet moves to the folded 'Coming up'.  Nothing says that a row was left out. Seen in cap-asha-cycleplan.png and cap-meera-w29.png.
- **Why it matters:** The one thing Today must never hide, a medicine due today, is two taps and a scroll away. Missed doses of iron and calcium are what the plans exist to prevent.
- **Advice (fix):** Never cap medicines or her own reminders. When there are more than 4 rows, fold the plan's steps into one row, 'Your plan: 3 steps', under the plan's line; tapping it opens them in place. The only new words are that row label, in English and Hindi.
- **Effort:** S; no new health wording
- **Checked:** Precision: the tablets that modules supply already sort ahead of plan steps (iron order 10; pregnancy IFA 13 and calcium 14, mods/preg.js:898-899; the pill). Only reminders set in Medicines or Reminders (tools reminders, order 40, app.js:1927) get dropped. In the Meera case the dropped calcium tablet is a tools-meds reminder.
- **Screenshot:** `web/test/shots/journey-audit/minimalism/cap-asha-cycleplan.png`

### P1 · A 'see a doctor this month' signal is folded behind the weekly look-back, while Diary puts it first (MIN-06, clutter audit)

- **Where:** app.js:1736-1745; mods/explain.js:259
- **Found:** moduleCards puts the plan before explain whenever a plan runs (app.js:1736). explain's month-level cards are not marked urgent; only 'today' and 'week' are (mods/explain.js:259). - Riya: 'Your last gap was 44 days · See a doctor this month' is folded under 'Week 1 is done', an energy question. - Meera and Kamla: 'Low mood or anxiety most days · See a doctor this month' is folded the same way.  The same card is the first thing on Diary (explore.json, diaryTop). Seen in today-riya-cycle-plan-360-en-2030.png.
- **Why it matters:** Pillar 1's early signal loses to a routine look-back, and Today and Diary disagree on what matters today.
- **Advice (fix):** Rank the 'Sakhi says' slot by level: 1. urgent; 2. month-level doctor signals; 3. plan moments (week done, the end, a fresh start, day 1); 4. 'keep an eye on it' cards; 5. setup and the rest.  This keeps V37.2's demotion of 'keep an eye on it' cards and its first-3-days rule. No new wording.
- **Effort:** S; no new health wording
- **Screenshot:** `web/test/shots/journey-audit/minimalism/today-riya-cycle-plan-360-en-2030.png`

### P1 · The plan's questions ignore 4 months of diary; the doctor card depends on the chip she guesses (J-05, cross-pillar journeys)

- **Where:** web/mods/plan.js:1155-1240, 1398-1403
- **Found:** Riya had logged gaps of 47 and 49 days and done the self-check. My plan, then 'I have PMOS', asked again: 'How far apart are your periods, usually?' (6 chips), 'Do some months get skipped?' and the signs, with nothing pre-filled. renderIntake and ikOfAnswers (plan.js:1155-1240) never read S.cycle. docCase (plan.js:1400) asks for the doctor check only on skips, 46-60, more than 60 or 'vary'. A woman with 47-day gaps who taps '36 to 45' gets none, while What your diary shows tells her to see a doctor this month. Joining the plan took 21 taps.
- **Why it matters:** It feels as if Sakhi forgot her, and her starting point and doctor check rest on recall rather than her records.
- **Advice (reuse):** Reuse the self-check's pre-fill pattern in reverse. Pre-select gap and skipped months from her usable gaps with the existing 'From your diary:' line (selfcheck_from) and her self-check signs. docCase also returns the cycle doctor card when her diary has 2 of 6 gaps over 35 days (or one over 45). The questions stay; she can change any answer.
- **Effort:** S; no new health wording
- **Screenshot:** `web/test/shots/journey-audit/journey/riya-360/26-plan-intake-periods.png`

### P1 · The doctor loop never closes: 'Yes, done' records nothing, and heavy and pain plans never ask (J-06, cross-pillar journeys)

- **Where:** web/mods/plan.js:1743-1760; web/app.js:3249-3275; web/mods/cond.js (labs)
- **Found:** The cycle plan's 'Did you get the doctor check? Yes, done' only sets doc='done' (plan.js:1758). The doctor card exists only for the cycle plan (plan.js:1751). The heavy reveal says 'Please see a doctor soon' (lakshmi-360/12-reveal-card-5.png) and is never followed up. A diagnosis can be noted only at Me, My health details, PMOS switch (3 taps plus the switch) or on Pattern check. An Hb result only through Anaemia's 'Add an Hb result' or My lab results (cond-labs); nothing asks for either.
- **Why it matters:** Pillar 1's preliminary signal never learns the doctor's answer, so the plan can't adjust (PMOS words, thyroid, a doctor's iron dose), and the results can't show it.
- **Advice (fix):** After 'Yes, done', ask one chip question in place of the toast: 'What did the doctor say?' with PMOS, Thyroid, Low Hb (tablets), Tests pending, Nothing found. Each writes an existing store (situation.pcos or thyroid, iron's 'doctor' plan, a cond-labs prompt). Show the same card for heavy and pain plans on days 2 to 21. No new screen.
- **Effort:** M; new wording needs doctor review
- **Checked:** Small correction: a PMOS diagnosis can also be noted at joining (goal 'I have PMOS' or dx 'yes' sets situation.pcos, app.js:1364) and in My plan's 'What you want help with' chips (plan.js:1021), not only at Me or Pattern check. 'Yes, done' shows no toast. It sets doc='done' and re-renders.
- **Screenshot:** `web/test/shots/journey-audit/journey/riya-360/23-me-health.png`

### P1 · After the birth, Today stays pregnant (kick counter included); recording the birth is hidden, more so in discreet mode (J-09, cross-pillar journeys)

- **Where:** web/app.js:1825-1826, 1838
- **Found:** Pooja gave birth at 38 weeks 5 days and opened Sakhi 3 days later. Today showed '39 weeks pregnant', 'Due now: Scheme money…', 'Food in pregnancy · Done' and 'Kick counter · Done'. 'Has your baby arrived?' shows only from 7 days after the due date and never in discreet mode (app.js:1825-1826). The only route is the small 'Change stage' link (4 taps), which is hidden in discreet mode (app.js:1838). On a shared phone it is Me, My details, stage, After birth, date, Save (6 taps, in English and Hindi).
- **Why it matters:** An emotional low point. A new mother is asked to count kicks, and the plan's evening check-in keeps asking about the pregnancy. The after-birth recovery check, the most important step, waits until she finds a hidden link.
- **Advice (move):** Move, don't add. From week 37, the pregnancy hero's second 'This week' button (it duplicates the round button) becomes 'My baby is born'. It opens the existing stage sheet with After birth selected. It also shows in discreet mode, in neutral words. Reuse the bb_h and bb_add strings. Keep the late-due-date card for women who never tap it.
- **Effort:** S; no new health wording
- **Screenshot:** `web/test/shots/journey-audit/journey/pooja-360/36-after-birth-day3-still-pregnant.png`

### P1 · Stage changes have no hand-over: the pregnancy plan ends silently and after-birth My plan lists 18 options, including PMOS (J-10, cross-pillar journeys)

- **Where:** web/mods/plan.js:1647-1662, 912-968
- **Found:** After the birth was recorded, the pregnancy plan disappeared with no closing line. My plan showed 'What do you want to work on?' (6 goals), 'Suggested for you' (4), 'What you want help with · Nothing picked yet', and 'More plans' (8). The last group includes 'My PMOS plan · After your 6-week check', 'Small steps for PMOS' and 'For period cramps' for a mother 3 days after a birth: 211 words, 2.7 screens. The companion design's 'new chapter' screen (companion-journey §6) isn't built.
- **Why it matters:** The companion forgets her at the biggest moment of her journey, and pillar 2 starts over from a catalogue.
- **Advice (merge):** Merge into one card. On a stage change, show 'Your pregnancy plan is complete. Next: your recovery plan' with the stage's top goal ready (Start, or Choose another goal). It replaces the goal list, suggestions and 'More plans' on that first visit. Hide plans that don't fit her stage (PMOS and cramps in the first 6 weeks).
- **Effort:** M; new wording needs doctor review
- **Screenshot:** `web/test/shots/journey-audit/journey/pooja-360/41-post-myplan.png`

### P1 · Discreet mode: My plan with no plan lists 'I have PMOS (PCOS)', 'Heavy periods' and 'Could it be PMOS?' (J-12, cross-pillar journeys)

- **Where:** web/mods/plan.js:1655-1662, 969-998
- **Found:** With discreet mode on (the brand reads 'My notes'), the My plan tab showed 'Irregular or late periods', 'I have PMOS (PCOS)', 'Heavy periods', 'Mood or body changes before periods', the suggestion 'Could it be PMOS?', and 'For period cramps', 'Small steps for PMOS' and 'A daily log for PMS and PMDD'. The goal list (plan.js:1658) and the catalogue rows have no disc() check. This is a different screen from the diet audit's Explore For-you leak; the same fix pattern applies.
- **Why it matters:** One tap on a tab shows what discreet mode hides on Today, on a shared phone.
- **Advice (hide):** In discreet mode, My plan with no plan shows only 'Pick a goal', and the goal names appear after a tap (or use neutral labels, as the running plan does with plan_h_d). Drop the catalogue. Add the check to test/privacy.mjs.
- **Effort:** S; no new health wording
- **Screenshot:** `web/test/shots/journey-audit/journey/riya-discreet/02-discreet-myplan.png`

### P1 · Heavy plan, iron tablets, Hb and the heavy-bleeding chart run separately and disagree (J-13, cross-pillar journeys)

- **Where:** web/mods/journey.js:34, 48; web/mods/cond.js:441-562; web/mods/iron.js:183; web/mods/plan.js:1294-1317, 1380
- **Found:** (1) Day 1's step is 'Your iron tablet: if the ASHA or a doctor gave you iron tablets…' (journey.js:34) before any Hb test, which comes on day 15 (journey.js:48). (2) Lakshmi logged the period in the diary as soaked pads, large clots and leaked (7 taps). The Anaemia page's heavy-bleeding chart for that same period read 'Total 0 · Clots: 0 small, 0 large · Flooding: 0': PBAC (cond.js:441-562) and the diary's flow fields don't share data. (3) Today showed 'Iron tablet today · I took it' (iron.js:183) beside the plan's iron step. 58 tablet days never count in the plan or its results. (4) The plan's period line talks about the gap ('about 28 days'), not the flow (plan.js:1380).
- **Why it matters:** For anaemia the pillars should form one chain (flow, then Hb, then free tablets, then results). Instead she keeps two records of the same bleeding and two iron to-dos, and the chart a doctor would read is empty.
- **Advice (merge):** Merge. Once iron.js is active, the tablet becomes the plan's step, as a link counted by iron's own tick, the way the recovery check works. Day 1 opens with the existing 'Know your Hb' step. The chart pre-fills that period's day from the diary's flow entry (or the plan uses diary flow only and the chart stays an optional extra). The heavy plan's period line names the flow.
- **Effort:** M; new wording needs doctor review
- **Checked:** Correction to the recommendation: don't pre-fill the PBAC chart from the diary's summary fields. PBAC is a pad-by-pad count scored by Higham 1990, and inventing entries from 'soaked pads, large clots' would show the doctor a made-up score. Keep the alternative: the plan reads the diary's flow, and the chart stays an optional extra. Also note that day 1's tablet step is conditional ('if the ASHA or a doctor gave you iron tablets').
- **Screenshot:** `web/test/shots/journey-audit/journey/lakshmi-360/23-anaemia-page.png`

### P1 · Knowledge never reaches a cycle-plan or trying-plan woman unless she goes to Explore (P3-02, pillar 3 audit)

- **Where:** web/app.js renderHome slot; mods/plan.js actionsFor/renderCheckin; mods/joy.js:213 stripHtml
- **Found:** 14-day walk on Today: - Cycle plan (irregular) and trying plan: 0 links to any guide or article across 14 days. - The evening check-in: 0 for all 5 stages. - My plan: only "Free doctor and care". The pregnancy plan also links Food in pregnancy; the 40+ plan the hot-flush routine. - Compare: pregnancy got "This week" on 42 renders and Food in pregnancy on 14; after a birth got the post and post-feed links; 40+ only the hot-flush routine. V37 stopped drawing the homeMore fold (MODULE_API §39). It carried the stories line and the daily Sach ya Myth card (joy.js stripHtml). Nothing replaced them.
- **Why it matters:** For the irregular-periods and PMOS women the app is built around, pillar 3 is on demand only. The check-in's "what it does for you" lines never lead to the reviewed article that explains the habit.
- **Advice (reuse):** Reuse existing cards and slots; nothing new is built. - One "Did you know?" card a week in the existing "Sakhi says" slot, from her goal's topic. It reuses a Sach ya Myth card (31, reviewed) or a quick answer (answer-sheet format with Listen), and is hidden in discreet mode. - Each plan step's "Why?" links its Learn article: walk to movement-busy-day, sleep to sleep-and-hormones, food habit to simple-indian-plate. - Today for you's stage-moment cards (P3-12) can feed this one card. No new card type and no new wording.
- **Effort:** S; no new health wording
- **Checked:** Partly overstated for the trying plan. In my 14-day walk its Today linked ttc-prep ('Before you start: checklist', a module guide) on days 1 and 8, and My plan linked it every day (plan.js:1325). What it never links is a Learn article or myth card. The claim holds fully for the irregular-periods cycle plan. There, Today links only 'What your diary shows' (explain), Free doctor and reminders. My plan's only knowledge link is access-doctor (Free doctor and care). The check-in had 0 links in both walks.
- **Screenshot:** `web/test/shots/journey-audit/pillar3/today-cycle-d0-en-360.png`

### P1 · 'Ask Qura to call me' is at only 3 plan moments, with no topic (P2-11, pillar 2 audit)

- **Where:** web/mods/plan.js careTeam (1576-1582), docCard (1432-1436), renderFinished (484), planCard call (1736); app.js renderAskCall (3095-3136)
- **Found:** Human touchpoints in the plan: - the reveal's doctor card; - one 'Questions about your plan?' card on days 3 to 5 (plan.js:1752); - the week-12 no-change card (plan.js:484); - the care-team row. Every button is data-go='ask' with no topic (plan.js:484, 1435, 1736), so the call form starts with topic '' and nothing ticked (app.js:3096). The data-ask topic mechanism already exists (app.js:856). Nothing at month 1 or 2, after a long lapse, or at the month-4 results. Not done from the V39 list ('the doctor review through Ask Qura to call me', 'a coordinator check-in rhythm', companion-journey section 12). In the probe stub (no SAKHI_API) the call form redirects to the Ask page, so the form itself was read from code.
- **Why it matters:** Human support raises completion (companion research row 6), but here it arrives late and without context, so the doctor gets a blank request.
- **Advice (link):** Use data-ask with a plan topic ('My 12-week plan: results', 'My plan: questions') on the existing buttons, so the call form opens pre-filled. Sharing stays her own tick. Add the same button to the month-2 card and the month-4 results card only when nothing changed. That's 2 placements and no new card. Never in discreet mode.
- **Effort:** S; no new health wording
- **Checked:** Two fixes. (1) Not every plan button lacks a topic: the PMOS plan's askCard on the end screen and My progress already uses data-ask with plan_ask_topic ('My PMOS plan: supplements or medicines', plan.js:825, 485). (2) data-ask doesn't pre-fill the call form. ask(topic) (app.js:856) adds the topic to state.askTopics, which feeds the Ask page's question list and the report's 'Questions I want to ask' (app.js:2634); renderAskCall always starts with topic '' (3097). Pre-filling the call form needs a small change there (for example, seed a.topic from the latest askTopic).
- **Screenshot:** `web/test/shots/journey-audit/p2-plans/cmp-askcall-from-end.png`

### P2 · Six engines read the same diary with different rules, so screens contradict each other (P1-16, pillar 1 audit)

- **Where:** web/mods/explain.js:115; web/mods/plan.js:890-909; web/app.js:2796-2813, 3350-3356, 2634-2639; web/mods/selfcheck.js:19
- **Found:** The engines: - explain.findings (explain.js:115; the last gap within 60 days); - plan.signals (plan.js:890; 'long' is always over 35 days); - the Pattern check (app.js:3351; 2 of 6 gaps plus hair in 2 of 6 check-ins); - the self-check's diaryIrregular (selfcheck.js:19); - the Trends verdict (app.js:2799; any gap outside 21 to 35 gives 'Outside the usual'); - the report questions (app.js:2636).  Seeded one 40-day gap 3 cycles ago. Trends shows 'Outside the usual · 28–40 days' with a 'What your diary shows' button (contradiction-trends.png), which opens 'Nothing unusual in what you logged in the last few weeks' (contradiction-explain.png).
- **Why it matters:** Contradictions erode trust in every signal. Each new rule has to be added in up to 6 places, which is how the gaps in P1-01 to P1-11 arise.
- **Advice (merge):** Make one engine: S.explain.findings plus one shared 'irregular(gaps)' helper, called by Trends' badge, plan.signals, the report questions and the self-check hints. When Trends says 'Outside the usual', explain lists the gap that caused it as a 'keep an eye on it' card. Engineering only; no new wording.
- **Effort:** M; no new health wording
- **Checked:** Small: the existing gap cards' titles read 'Your last gap was {n} days', so listing an older gap that Trends flags needs a title variant. That is one new line, so it is not quite 'no new wording'.
- **Screenshot:** `web/test/shots/journey-audit/p1-track/contradiction-trends.png`

## Minimalism and clutter (10)

### P1 · My plan with no plan stacks three goal pickers and 12 'More plans' (J-11, cross-pillar journeys)

- **Where:** web/mods/plan.js:969-999, 1000-1024, 1647-1662
- **Found:** For a tracking woman, My plan has 'What do you want to work on?' (7 goals), 'Suggested for you', 'What you want help with · Nothing picked yet · Change' (a second goal store, state.goals, helpCard plan.js:1000-1024), and 'More plans' with 12 rows. Those rows include two 21-day journeys and 'My PMOS plan' for an undiagnosed woman: 260 words, 2.8 screens. Version 38 removed 'Other plans' only while a plan runs.
- **Why it matters:** The front door of pillar 2 makes her choose between three ways to say what she wants, and the 21-day journeys compete with the 12-week plan.
- **Advice (remove):** Keep one picker: 'What do you want to work on?', with the top suggestion marked 'Suggested' inline on its goal row. Remove 'What you want help with' (merge into the goal). The catalogue's routines and tools are already in Explore, so 'More plans' moves there.
- **Effort:** S; no new health wording
- **Checked:** Small correction to the recommendation: Strength at home, Yoga and moves and My plate have no Explore tile of their own. Explore reaches them only through the PMOS plan tile, which the diet audit (F7) found opens another plan for women already on one. Moving 'More plans' into Explore therefore needs tiles for them first.
- **Screenshot:** `web/test/shots/journey-audit/journey/riya-360/07-day0-myplan.png`

### P1 · Too many plan-like things, with clashing names (P2-12, pillar 2 audit)

- **Where:** web/mods/plan.js catalogue (912-962), renderPlans (969-996); mods/journey.js; mods/preg.js:10; app.js SECTIONS (795-798)
- **Found:** - 10 plan titles in one engine (plan_pk_*, plan.js). - catalogue() lists 23 'plans' (plan.js:912-961), including a 2-minute self-check, five 3-minute routines, an iron-tablet tracker, My plate, Yoga and moves, and two 21-day journeys with their own 9 am reminder (journey.js:111). The heavy plan already runs the iron journey's 21 steps (plan.js:1315), and the PMOS journey repeats the cycle plan. - Two pages are called 'My pregnancy plan': the plan pack, and the preg-plan checklist (preg.js:10) (lc-preg-two-plan-pages.png). - Explore's 'My plans and reminders / मेरी योजनाएँ और रिमाइंडर' topic doesn't contain My plan (app.js:795-798; clutter-topic-plans-en.png). Hindi uses both प्लान and योजना. - With no plan, My plan shows 7 goals, 1 suggestion and 11 more plans: 2.8 screens (lc-noplan-myplan.png).
- **Why it matters:** The opposite of minimalist: she can't tell which 'plan' is hers. Two daily reminders can run at once (plan at 8 pm, journey at 9 am).
- **Advice (merge):** Merge: 1. 'My plan' is the only thing called a plan. Rename preg-plan to 'Pregnancy check-ups', and the Explore topic to 'Reminders and trackers'. 2. Retire the 21-day journeys as separate programmes; their steps already live in the heavy and cycle plans. Keep the pages as reading. 3. plan-pmos becomes an alias of My plan (the diet audit's 5.3 covers the tile). 4. With no plan, My plan shows the goals and at most 3 suggestions. Routines, trackers and the self-check move back to their Explore topics. Use one Hindi word, प्लान.
- **Effort:** M; no new health wording
- **Checked:** Partly covered by the diet audit already. The 21-day iron journey duplicating the heavy plan is DIET 5.9/F14, the PMOS tile is 5.3 (the finding defers to it), and one-name-per-thing is 5.7/F11. These are new: the 23-item catalogue on My plan, the two pages titled 'My pregnancy plan' (plan_pk_preg and preg.js plan_h; their Hindi titles differ, प्रेग्नेंसी vs गर्भावस्था), the 'My plans and reminders' topic without My plan, and plan vs योजना in Hindi (योजना is also the word for government schemes in access.js, which makes one Hindi word for plans more important). The plan_pk_* keys give 9 distinct titles plus plan_h, so 10 holds.
- **Screenshot:** `web/test/shots/journey-audit/p2-plans/lc-noplan-myplan.png`

### P1 · The Pattern check is a second PMOS engine with stale, misleading lines (P1-12, pillar 1 audit)

- **Where:** web/app.js:84-87, 3350-3366
- **Found:** The pattern route shows: - 'PMOS (PCOS) pattern · Pattern seen'; - 'Doctor's verdict · Pending review', though no review flow exists; - 'Ask my Qura doctor to confirm'; - 'Rule P3, version 1. Signed by Qura's doctors and an independent gynaecologist before launch.' (pmos-pattern-check.png; app.js:84-87).  'Thyroid-type pattern' is hard-coded to 'Not enough data' (app.js:3360). 'Heavy-bleeding pattern · Not seen' shows in green when she has logged no flow at all. The field-test audit flagged the 'Signed by' and 'Pending review' contradiction (docs/field-test-readiness-2026-10-23.md:255), and it is still there. The androgen card's 'Read more' opens this screen.
- **Why it matters:** It implies a doctor will issue a verdict and that sign-off has happened, labels her with a 'pattern', and falsely reassures her about heavy bleeding. All of this duplicates the PMOS self-check, which does the job properly.
- **Advice (remove):** Remove the pattern route and its tile. Point the androgen card at selfcheck-pmos. Move the nipple-discharge question and its reviewed prolactin line (pc_q2_y) into the PMOS self-check's 'See a doctor soon if' block. 'Has a doctor told you that you have PMOS?' already lives in Me > My health.
- **Effort:** S; no new health wording
- **Checked:** Add to the removal: the PMOS self-check's 'Read about it' also opens 'pattern' (selfcheck.js:35, more: 'pattern'). FOR_GOAL lists 'pattern' for irregular, pmos and weight (app.js:1012-1013). cond.js:678 has the tile. All of these need repointing. The Pattern check is also the only screen that links pain_3 periods to selfcheck-endo (see P1-07), so that link must move into explain before the route goes.
- **Screenshot:** `web/test/shots/journey-audit/p1-track/pmos-pattern-check.png`

### P2 · Pregnancy: two 'My pregnancy plan's, two check-up lists, two 'This week' buttons (J-17, cross-pillar journeys)

- **Where:** web/app.js:3402-3416, 1751-1800; web/mods/preg.js:665, 901-905
- **Found:** Pregnancy Today showed 'This week' twice (the hero button and the round button), 'Check-up visits' (core 'pregnancy' route, app.js:3402-3416), and 'Due now: Register your pregnancy, and 4 more · Your pregnancy plan' under the heading 'MY PREGNANCY PLAN'. The slot repeated it as 'Your first step: Due now: Register…'. Before she started, the goal picker listed 'Suggested for you: My pregnancy plan' (the preg.js checklist) while she was choosing a goal for the tab's 'My pregnancy plan'.
- **Why it matters:** Two plans with one name, and two lists of the same check-ups, on the first screen of pregnancy.
- **Advice (merge):** Merge. Fold 'Check-up visits' into the checklist, which already lists the visits. Rename the preg.js page 'Check-ups and tests' so 'My pregnancy plan' means the tab. Drop the hero's 'This week' button (it becomes 'My baby is born' from week 37, see J-09). Labels only.
- **Effort:** S; no new health wording
- **Screenshot:** `web/test/shots/journey-audit/journey/pooja-360/21-preg-plan-today.png`

### P2 · Explore shows the same 16 topics to everyone; 4 are drawers of tools and the library is last (P3-11, pillar 3 audit)

- **Where:** web/app.js:797 TOOLS_SPLIT, 1157 renderCare
- **Found:** - 16 topic cards for every stage, including Pregnancy loss and "Missed period and unplanned pregnancy" for a pregnant woman. - The grid runs from 1.52 to about 3.2 screens at 360 px. "All articles", the library, is the last row at 3.22 screens. - 4 cards are not topics: My plans and reminders (4 tools), My records (3), Just for fun (garden and Sach ya Myth), and "Feel better, family and more". That last one holds Qura doctor, Feel better now, family, partner, Today for you, Doctor videos, Symptom guide, and Language and read-aloud. - docs/companion-journey §9 decided the myth quiz goes to Learn; TOOLS_SPLIT still files 'joy-quiz' under 'fun' (app.js:800).
- **Why it matters:** The self-help book's best parts (Feel better now, Sach ya Myth, the library) are buried in a junk drawer and at the bottom of a 3.4-screen page.
- **Advice (move):** - Show her stage's 4 to 6 topics first, with the rest under "More topics". - Move records and reminders to Me, where the report already is. - Move Sach ya Myth into Learn. - Feel better now joins the self-help chapter of her stage. - Language lives only in Me. - Put a "Contents: all guides and articles" row right under search. This takes 4 cards off the grid.
- **Effort:** S; no new health wording
- **Screenshot:** `web/test/shots/journey-audit/pillar3/explore-cycle-en-360.png`

### P2 · Orphaned and placeholder knowledge screens: stories, Today for you, Doctor videos (P3-12, pillar 3 audit)

- **Where:** mods/access.js:762, 879-911, 1040-1063; mods/relief.js and mods/joy.js homeMore
- **Found:** - "Your cycle, in plain words" stories (access-stories) is reachable only from storyRow in the homeMore hook (access.js:1063), which core no longer draws: app.js has no runHook('homeMore'). The route is dead. - "Today for you" (access-feed) repeats Today with 5 rule cards, including dengue (p-access-feed-cycle-en-360.png). companion-journey §9 said remove it; it is still a tile. - "Doctor videos" lists 10 talks marked "Planned" (access.js:762-770): a coming-soon screen in a pilot. App audit P0 #6 asked that half-offered features be hidden.
- **Why it matters:** Dead code, a second "today" and a promise of videos that don't exist all add clutter and doubt.
- **Advice (remove):** - Remove the stories route, storyRow and the other homeMore registrations. - Remove the Today for you tile; its stage-moment rules can feed P3-02's one weekly card. - Hide Doctor videos until recordings exist. Their text versions are a third copy of existing guides.
- **Effort:** S; no new health wording
- **Checked:** App audit P0 #6 is specifically about gated 'Needs approval' features. It ends 'Don't leave them half-offered', so applying it to the planned videos is a stretch, but it fits.
- **Screenshot:** `web/test/shots/journey-audit/pillar3/topic-support-cycle-en-360.png`

### P2 · Four family and partner pages cover overlapping ground (P3-18, pillar 3 audit)

- **Where:** mods/family.js, mods/access.js:600-690 PARTNER, mods/ttc.js
- **Found:** - Explain it to my family: 9 cards, 782 words, 5.3 screens. - Weekly update for your husband: pregnancy only. - For your husband or partner (access-partner): 819 words, 6.1 screens. - For your partner (ttc-partner): 360 words. - 6 topics are covered at least twice: periods, after birth, mood, menopause, pregnancy check-ups, trying for a baby.
- **Why it matters:** Three tiles and two long pages for one job: helping her family understand.
- **Advice (merge):** Make one "For my family" page: shareable cards with her stage first and the weekly pregnancy card on top. - access-partner's sections become cards, for example NSV myths and consent. - ttc-partner folds into the trying card. This removes 2 tiles and reuses the content.
- **Effort:** M; no new health wording
- **Screenshot:** `web/test/shots/journey-audit/pillar3/p-family-cycle-en-360.png`

### P2 · Overlapping trackers log the same symptoms on different scales (P1-17, pillar 1 audit)

- **Where:** web/mods/periods.js:15, 42; web/mods/cond.js:84-180; web/app.js:3387-3401; web/mods/ttc.js:399; web/mods/meno.js:78
- **Found:** - Pain on 3 scales: the day-sheet 'Cramps' chip (yes or no), start pain 0 to 3, and the endometriosis diary 0 to 10 with zones (tracker-cond-endo.png). - Heavy flow 3 ways: start pads and clots, PBAC, and the monthly 'Heavy flow or clots'. - PMS symptoms twice: the PMS log's CORE_MAP reads only 4 of the 7 symptoms both share (periods.js:15). Day-sheet entries for Irritable, Anxious and Sore breasts never reach the PMS chart: 2 days logged, 'Days logged in these cycles: 1' (tracker-periods-pms.png). - Hot flushes 4 ways: the day chip, monthly 0 to 3, the weekly diary and the MRS score. - The midlife picture twice: core 'midlife' (app.js:3389) and 'meno-timeline' (meno.js:78). - LH strips twice: state.strips (app.js:3387) and ttc signs.lh (ttc.js:399). - Hb twice: cond labs and preg logs. - Two doctor summaries: see diet audit 5.7.
- **Why it matters:** She doesn't know where to log. Data logged in one place is invisible to the others, so charts look emptier than her diary is, and the app feels like many apps.
- **Advice (merge):** Keep the day sheet as the one daily log, and make the specialist screens views of it: - map all 7 shared PMS symptoms; - feed pain-diary rows from day-sheet pain, plus an optional 0 to 10 and 'where' detail; - fold 'My midlife picture' into the menopause timeline; - keep one LH store (the ttc log, read by the Fertile screen); - keep one Hb store (labs), read by the pregnancy logs.  No new screens; 2 routes removed.
- **Effort:** L; no new health wording
- **Screenshot:** `web/test/shots/journey-audit/p1-track/tracker-periods-pms.png`

### P3 · Dead code is still registered and parsed on every start (MIN-21, clutter audit)

- **Where:** app.js:1028, 1874; mods/access.js:906-911, 1063; mods/joy.js:416; mods/relief.js:215
- **Found:** The leftovers: - the homeMore hooks in mods/access.js:1063, mods/joy.js:416 and mods/relief.js:215, never drawn since V37 (MODULE_API section 39); - quraCard (app.js:1874), defined but never called; - the access-stories route, reachable only from the dead storyRow; - FOR_YOU.avoid and the 'avoid' goal (app.js:1028), which nothing sets any more (for-you audit, item 9).
- **Why it matters:** Code nobody sees still has to be kept in step and tested, and it adds to start-up parsing on low-end phones.
- **Advice (remove):** Remove these hooks, functions and routes, and run the test suites after.
- **Effort:** S; no new health wording
- **Checked:** One caveat: 'avoid' is not read by FOR_YOU alone. contra.js:846 also checks state.goals for 'avoid'. Diaries that joined through the V36 goal question (g_avoid, app.js:145) may still hold it, so remove both reads together, or keep them if any V36 build reached phones.

### P3 · 'Set up Sakhi for you' sits on Today for 215 days (J-24, cross-pillar journeys)

- **Where:** web/app.js:1952-1966
- **Found:** 'Set up Sakhi for you · 1/4 (then 2/5) · Turn on reminders on this phone' was in the Sakhi says slot from day 0 to day 215 of Riya's walk, folded or not, even while her plan's 8 pm check-in was set (app.js:1952-1966). The same 'gap 47 days' finding stayed the top card for 30 days.
- **Why it matters:** Small, constant noise in the one slot meant for the most important thing.
- **Advice (hide):** Hide. The setup card retires after 30 days or once a plan reminder exists. Its reminder step moves to the plan's Start screen, which already offers 'Allow reminders'.
- **Effort:** S; no new health wording
- **Checked:** Correction to the recommendation: a plan reminder existing doesn't mean it can ring. The setup step tracks state.settings.notify (phone permission), and without it her 8 pm check-in never reaches her. Retire the card after about 30 days, or move the step to the plan Start screen's 'Allow reminders', but don't retire it just because a plan reminder exists. Also note the card already has a 'Hide this' link (setup_hide).
- **Screenshot:** `web/test/shots/journey-audit/journey/riya-360/45-day215-after-plan.png`

## Dropped by the checkers (6)

- P1-19 (pillar 1 audit): Sex and contraception can't be logged, so signals that depend on them guess. Wrong as titled and in its impact. Contraception is logged: contra.js 'My method and reminders' (contra_mine, contra_my, lines 518, 714, 874), plus the hormones toggle in Me. Sakhi already says when a test is reliable: pregtest-when takes 'Date of unprotected sex (optional)' and shows 'Earliest reliable test day' (pregtest.js:152-163, 342), and late_now's 'Read more' opens it. It also offers emergency contraception within its window: the contra-ec calculator shows 'About {h} hours ago', within 72 h for the pill, within 5 days for a Copper-T (contra.js:778-803, 920-922). What remains true is narrow: the day sheet has no intercourse entry, and 'Bleeding after sex' and 'Pain during sex' are asked only in the monthly check-in's More. That is a P3 diary gap at most, and a daily sex chip adds privacy risk on shared phones.
- P2-22 (pillar 2 audit): Discreet mode makes the steps impossible to tell apart. Duplicate of diet audit DIET-16 ('Discreet mode hides the food step itself', diet-ux-audit findings, P2): same cause (plan.js:841, private and minutes steps mapped to plan_today_d) and same symptom (identical 'Your plan for today' rows). New here: the check-in becomes unanswerable when 2 or more steps are private (after a birth, pregnancy, midlife), and the fix of distinct neutral labels by kind. Fold both into DIET-16 rather than listing them separately.
- J-15 (cross-pillar journeys): At 45, bones and strength sit outside the hot-flush plan; Strength at home is unreachable. Duplicate of diet audit 5.4 / F8 ('Yoga and moves exist only inside the PMOS plan': unreachable within 5 taps for 40+, with the advice 'for 40+, put the strength and balance routine first'). The bones-page links overlap DJ-13. The only new idea is turning the midlife walk into Strength at home 2 days a week for every 45+ goal. That is a plan-content change and should go to doctor review.
- MIN-13 (clutter audit): The 21-day journeys still sit beside the 12-week plans. duplicate of diet audit 5.9 (F14, 'Starting a 21-day journey while a plan runs does nothing visible'). The diet audit already found that the heavy plan holds the same 21 iron steps and that starting a journey does nothing on Today or My plan; its checker also noted that 'does nothing visible' is overstated. Only the advice differs (remove the tile, versus hide Start and link to My plan).
- MIN-16 (clutter audit): Two screens each build a document for the doctor. duplicate of diet audit 5.7 (F11, 'The same thing under two to four names'). F11 already lists 'Report for my doctor' (report) and 'Summary for my doctor' (tools-summary), says both describe one page of her entries for a visit, and advises 'Report for my doctor everywhere, with the summary folded in as its short version'. That is the same merge.
- MIN-18 (clutter audit): Me has two reminder rows, and setup lives on Today instead of Me. duplicate of diet audit 5.7 (F11): it already reports 'My reminders' and 'Reminders on this phone' side by side in Me (app.js:3212) and advises 'one Reminders row in Me, with the phone switch inside it'. Only the 'Set up Sakhi (2 of 5)' row in Me is new. Fold that one line into MIN-04, which already points to it.
