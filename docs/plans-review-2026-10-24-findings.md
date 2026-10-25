# Review of the plans design docs: all findings (24 Oct 2026)

The 108 verified findings behind `docs/roadmap-v39-2026-10-24.md`, from a review of `docs/plans-design-and-build-2026-10-24.md`,
its appendix `docs/plans-design-and-build-2026-10-24-programmes.md` and the earlier outline `docs/programmes-every-condition-2026-10-24.md`.
Five reviewers (code facts, rules, programmes 1 to 4, programmes 5 to 8, the red-flag bank and safety layer); a skeptic checked each
finding and dropped 19 (listed at the end). "Checked" gives the skeptic's correction where it had one. Code at commit 418075d.

## Red-flag bank and safety layer (22)

### Blocker · S3 · safety

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, B.1 afterProcedure (line 139)
- **The doc says:** afterProcedure: heavy bleeding, fever or pain after an abortion, miscarriage, birth or procedure: Now if soaking 2 thick pads an hour, else Today.
- **Issue:** Putting 'a birth' under a 2-pads-an-hour Now threshold contradicts the bank's own postBleed (soaking a pad in an hour → Now) and the reviewed post.js lines. A woman after a birth soaking 1 pad an hour (post-partum haemorrhage range) would get Today from this row and Now from postBleed: two ids, two answers, and the merge rule ('by bank id') doesn't settle it. After a miscarriage it also contradicts loss.js, which sends 1 thick pad an hour for 2 hours, and severe pain that painkillers don't help, to Now. 'Else Today' downgrades both.
- **Evidence:** post.js:71 u_1 'You soak a pad in an hour, or pass clots egg-sized or bigger' (Call 112 now); post.js:126 fl_bleed; explain pp_lochia lv 'now' (explain.js:88 and 167). loss.js:49 URGENT 'soaks a pad every hour ... call 112'; loss.js:53 'soaks a thick pad every hour, for 2 hours in a row'; loss.js:55 and pregtest.js:55 'Severe belly pain that painkillers don't help' under RED_NOW. pregtest.js:53 (abortion pills) '2 thick pads an hour, for 2 hours in a row or longer'.
- **Fix:** Split it into three rows that reference the reviewed lines: after a birth = postBleed (@post:u_1); after a miscarriage = @loss RED_NOW and RED_TODAY; after abortion pills = @pregtest RED_NOW (2 thick pads an hour for 2 hours). Never Today for 1 pad an hour after a birth.
- **Checked:** Real contradiction, but less exposed than claimed. Major rather than blocker. afterProcedure appears only in Easier periods, Stronger blood and Getting ready (appendix 359, 559, 1781), not in After the birth, which uses postBleed. Stronger blood excludes the first 6 weeks after a birth, and programmes pause after a loss. So the 'two ids, two answers' collision for a woman days after a birth is unlikely. Still, the row applies the abortion-pill threshold (pregtest: 2 thick pads an hour for 2 hours) to miscarriage and birth too, which contradicts loss.js (1 thick pad an hour for 2 hours, and severe pain painkillers don't help → Now) and post.js u_1 (a pad in an hour → 112). 'Else Today' downgrades loss.js and pregtest.js RED_NOW pain. Splitting it into per-context references is the right fix.

### Blocker · S4 · safety

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, B.1 faint, anaemiaMove; B.3 Before-you-move
- **The doc says:** faint: chest pain → Now. anaemiaMove: breathless or heart racing on a short walk, chest pain, feeling faint → 'Stop; Hb test this week; fainting Now'. B.3 Q2: chest pain, breathlessness or faintness when you walk fast → easy walking only plus 'ask your doctor'.
- **Issue:** Chest pain on effort gets three urgencies inside the bank: Now, 'Hb test this week', and 'easy walking'. Two of them could delay emergency care for chest pain with a cardiac cause, and 'easy walking' still clears her to exercise. They also contradict the reviewed explain m_palp line.
- **Evidence:** Appendix lines 136, 163, 190-192. explain.js:102 m_palp 'With chest pain, breathlessness or fainting: call 112 now'. preg.js SYM breath worry 'Sudden breathlessness, chest pain ... call 112 now'. post.js:73 u_3 'Chest pain, breathlessness ...' under Call 112 now.
- **Fix:** Chest pain at any time = Now (faint), in every strip and screen. Limit anaemiaMove to 'breathless or heart racing on a short walk → stop, Hb test this week; faint or chest pain → Now'. On B.3, a yes to chest pain or fainting on effort means 'no moves until a doctor has seen you', not easy walking.
- **Checked:** The contradiction inside the bank holds: anaemiaMove puts chest pain under 'Stop; Hb test this week' while the faint row says chest pain is Now. Severity should be major, not blocker, because the programme sections override it. Midlife pins 'faint, chest pain spreading to the jaw or arm' as Now on every routine screen (line 1134), and pregnancy's adaptivity says 'breathless at rest, chest pain or fainting opens go-now'. The B.3 part is overstated: Q2 asks about a recurring history ('Do you get...'), and 'easy walking plus ask your doctor first' is the standard pre-exercise screen response. Also, the reviewed lines aren't uniform: cond.js anaemia says 'Chest pain, fainting, or breathless while resting: get medical help today; call 112 if it is severe'. The fix should be 'chest pain during a move = Now' in anaemiaMove and the stop strips.

### Blocker · S5 · gap

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, B.1 Pregnancy set (lines 165-170)
- **The doc says:** The pregnancy set comes from the MCP card and the reviewed danger article.
- **Issue:** Fever is missing. It is the first ICMR danger signal and the MCP card lists high fever in pregnancy, and the reviewed danger article puts it under go-now. The general rows only catch fever with very ill (feverIll) or with belly pain or bad-smelling discharge (feverPain), so a pregnant woman with fever alone matches no row. B3's always-on strip, built from this set, would leave it out. Also missing: breathless at rest or palpitations, and passing less urine (ICMR; preg.js urine), and past 42 weeks (preg.js hub_late, which already shows in discreet mode).
- **Evidence:** ICMR STW antenatal care (fetched, pdftotext): 'DANGER SIGNALS FOR PATIENT TO REPORT TO HEALTH FACILITY • Fever • Persistent vomiting • Abnormal vaginal discharge • Palpitations ... breathlessness at rest ... • Vaginal bleeding • Decreased or absent fetal movements at > 28 weeks • Leaking ... • Severe headache/ blurring of vision/ convulsion • Passing lesser amounts of urine and/or burning • Itching all over the body' (https://www.icmr.gov.in/icmrobject/uploads/STWs/1771568619_ante-natalmanagementofnormalpregnancy-7.pdf). content.json 'danger-signs-call-112' body: '- Fever. Burning or very little urine...' under 'call 112 or 108'. Search snippet of the NHM MCP card: high fever during pregnancy → take her to hospital immediately. preg.js:58 hub_late.
- **Fix:** Add pregFever (urgency for the gynaecologist: the danger article says go now, ICMR says report to a facility), pregBreath, pregLowUrine and pregPast42 (calendar-based, allowed). Check the set row by row against the ICMR list and the danger article.
- **Checked:** The core claim holds: fever on its own in pregnancy matches no row. The doc-verified danger article lists 'Fever' under 'call 112 or 108 ... or 102', and ICMR STW lists it first. feverIll needs her to be very ill, feverPain needs belly pain or discharge, and burning covers only urine burning. Passing little urine is also missing. Two of the suggested additions are already covered elsewhere. Past 42 weeks is in the pregnancy programme's doctor moments ('Weeks 36, 37+, 41, 42 | Routine to Now ... past 42 weeks go today'). Breathless at rest is the bank's faint row (Now), and pregnancy adaptivity opens go-now for it. Major rather than blocker, but it matters because the pregnancy set is what gets 'Pinned on My plan and every move screen'.

### Major · S7 · contradiction

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, B.1 pregMovesLess; section 6 Part A and doctor moments
- **The doc says:** pregMovesLess: less than usual or different from 28 weeks → Today, even at night.
- **Issue:** Two sets of reviewed lines disagree, and the docs pick different ones. Help s1c (shown on the pregnancy week page and planned for B3) and the danger article put 'baby moving less' under Call 112 or go now. pregtools k_today and the babys-movements article say the same day, even at night. The appendix's own pregnancy section opens the go-now card for 'baby moving less' (Part A) but uses Today in its doctor moments. The journey audit plans Help's line. The generic 'Today' label in explain.js reads 'See a doctor today', which drops 'even at night, don't wait till morning'.
- **Evidence:** app.js:64 s1c 'In pregnancy: bleeding, fits, severe headache with blurred vision, fluid leaking, baby moving less' under call_now (app.js:2971 and 3412). content.json danger-signs-call-112: 'After 28 weeks: the baby moving less, or not at all' → 'call 112 or 108 ... or 102'. pregtools.js:28-29 k_now and k_today. Appendix lines 1216-1217 vs 1366. Journey audit line 282. explain.js:282 explain_lv_today 'See a doctor today'.
- **Fix:** Put this first in §20. Whichever level the doctor picks, give it its own label ('Go to the hospital today, even at night. Don't wait till morning' with a 102/108 call button), not the generic Today. Then edit s1c or k_today so they match.

### Major · S8 · contradiction

- **Doc and section:** `web/mods/explain.js vs docs/plans-design-and-build-2026-10-24-programmes.md`, B.1 pregBleed; explain p_bleed
- **The doc says:** pregBleed: any bleeding in pregnancy → Now (bank, Help s1c, preg.js, danger article, ICMR).
- **Issue:** The bank is right, but the card women actually see on Today today says 'See a doctor today', with no 112, for bleeding in pregnancy. That is explain p_bleed at level today. The bank never lists this conflict, so it would stay live alongside a Now bank row.
- **Evidence:** explain.js:162 `if (has('pbleed')) add({ id: 'p_bleed', lv: 'today' ...})`; explain.js:81 'See a doctor today. Heavy bleeding, or bleeding with pain or fainting: call 112 now.' preg.js SYM discharge worry 'Watery fluid leaking, or any bleeding: go to hospital now'. Probe C (not discreet): Today shows 'Bleeding in pregnancy' and 'See a doctor today', and /112/ is not found.
- **Fix:** Add it to the 39.0 doctor decisions (S2 in the summary order). If Now, change p_bleed to lv 'now' and lead with the go-now line. List it in the §20 conflicts register.
- **Checked:** The code fact is confirmed. I didn't re-run the probe, but the journey audit's findings file logs the same p_bleed 'today' level.

### Major · S9 · contradiction

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, B.1 soak, soakDizzy (lines 137-138)
- **The doc says:** soak: a pad every 1 to 2 hours, or clots bigger than a ₹10 coin → Today. soakDizzy → Now. 'Reconciled with r2.'
- **Issue:** It is not reconciled. The line shown in the diary itself when she taps pads_4 or clots_2 (r2) says 'this week' for the same sign. Help splits it: today for soaking (s2a), this week for clots (s4a). explain flow_heavy says this week, but 112 now for a pad every hour. r2 says dizzy → 'today, or 112', where s1b says Call 112 now. 'Bigger than' vs 'the size of' a ₹10 coin also differs.
- **Evidence:** app.js:54 r2; app.js:2536 (r2 shown inline when pads_4 or clots_2 is logged); app.js:65 s2a; app.js:67 s4a; app.js:64 s1b; explain.js:43-44 and :144 (lv 'week'); app.js pads_4 'Soaked one every 1–2 hours', clots_2 '₹10 coin or bigger'.
- **Fix:** One pad-change number and one clot size, decided by the gynaecologist (the journey audit's decision 5 already asks for 'one pad-change number'). Then rewrite r2, s2a, s4a and flow_heavy to it in the same commit, and make the bank rows references to them.
- **Checked:** Small nuance: the 'reconciled' claim is the bank's general intro (appendix 124-126), not a note on the soak row. The journey audit's decision 5 already asks the gynaecologist for 'one pad-change number', so the issue is known but not carried into the bank or the §20 conflicts list.

### Major · S10 · contradiction

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, B.1 pregBP, pregPains
- **The doc says:** pregBP: sudden swelling of face or hands, pain under the ribs → Now. pregPains: regular pains, pelvic pressure, dull backache, or 'a change in discharge' before 37 weeks → Now.
- **Issue:** pregBP matches NHS ('checked immediately') and the danger article, but contradicts three reviewed module lines that say today. pregPains' 'a change in discharge' is broad enough to send thrush or bacterial vaginosis to emergency care. It contradicts preg.js discharge (this week) and isn't what the preterm-labour sources say (watery, mucus or bloody).
- **Evidence:** preg.js:435 'Sudden swelling of the face, hands or feet: see a doctor today and get your BP checked'; preg.js:420 'burning ... with pain under the ribs, a headache or swelling: get your BP checked today'; post.js:135 fl_swell (today); explain.js:83 and :163 p_headswell (lv today). preg.js:450 'Itching, soreness, a bad smell, or green, yellow or curd-like discharge: see a doctor this week.' March of Dimes: 'change in vaginal discharge (watery, mucus or bloody)' (https://marchofdimes.org/find-support/topics/birth/signs-and-symptoms-preterm-labor). NHS https://www.nhs.uk/conditions/pre-eclampsia/.
- **Fix:** pregPains: 'watery, mucus-like or bloody discharge, or more than usual, before 37 weeks'. pregBP: the doctor picks Now or today; then align preg.js 420 and 435, post.js fl_swell and explain p_headswell.

### Major · S11 · evidence

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, B.1 pregnancy set source line (165)
- **The doc says:** The pregnancy set is taken from 'the MCP card and the reviewed danger article'.
- **Issue:** The set mostly uses preg.js SYM's levels (itching today, vomiting today, burning today), not the danger article's. The doctor-verified danger article puts all of these under 'call 112 or 108, or 102': itching all over, vomiting that won't stop, burning or very little urine, fever, unusual discharge. So the bank cites one reviewed source and follows another, and the app ships both. A woman reading the article and then the plan gets two answers.
- **Evidence:** content.json danger-signs-call-112 body: 'Fever. Burning or very little urine. Vomiting that will not stop. Breathing fast or with difficulty. Itching all over the body. Discharge that smells bad or looks unusual...' followed by 'For any of these: call 112 or 108 ... or 102'; its see_doctor adds 'Not sure if it counts: call your ANM, or 104 ... treat it as yes and go'. preg.js:416, :450 and :455-461 (today and this week levels).
- **Fix:** In §20, settle the two-tier split (go now / same day) once and edit the article or SYM to match. Cite ICMR STW, which lists them as 'report to health facility', as the base.

### Major · S12 · code-fact

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md`, 3.9 item 4 (four urgency levels)
- **The doc says:** Four urgency levels, 'mapped from the reviewed lines in app.js': Now, Today, This week, At your next visit.
- **Issue:** The reviewed lines use six levels. explain.js's LV has now, today, week, month, watch and ok; Help has 'within about 2 weeks'. 'At your next visit' appears in no reviewed line. The bank itself uses 'Within 2 weeks' (4 rows), 'Stop', and in midlife 'soon'. explain.js already shows a 'This week' pill over text that says 'within 2 weeks', for bleeding after menopause and bleeding after sex. And 'this month' (r_pain, 8 explain findings) has nowhere to map, which is why stopsDay and lowMood quietly move to This week.
- **Evidence:** explain.js:10 `const LV = ['now', 'today', 'week', 'month', 'watch', 'ok']`; explain.js:282 level labels; app.js:63 weeks2 'See a gynaecologist within about 2 weeks if'; explain.js:56 'See a doctor within 2 weeks' with lv 'week' at :156; explain.js:62 with lv 'week' at :179. Appendix lines 142, 150, 152, 153, 163, 1140-1141.
- **Fix:** Adopt one labelled scale that covers the reviewed lines: Now / Today (with an 'even at night' variant) / This week / Within 2 weeks / This month / Next visit. Use it in both explain and the bank, and fix explain's pill-vs-text mismatches in 39.0.
- **Checked:** One sub-claim is wrong: 'At your next visit' does appear in shipped lines (access.js:786 'Routine: at your next check-up' / 'At your next visit'; docportal.js:49 lv_visit 'Next visit'). The rest holds. Also, the stopsDay move to This week is flagged, not quiet (appendix line 148 asks to reconcile it with r_pain); lowMood's move is the unflagged one.

### Major · S13 · contradiction

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, B intro and B.1 (reconciliation)
- **The doc says:** Urgencies are 'reconciled with the reviewed core lines', and only stopsDay is flagged.
- **Issue:** Beyond S3 to S11, these rows contradict reviewed lines without saying so: - calf: Today, vs post.js u_3 and fl_clot (one calf alone → 112 now; NHS DVT supports Today, but the after-birth stage needs an override); - faint or breathless at rest: Now, vs cond.js anaemia 'today; 112 if severe' and preg.js breath (today); - lowMood: this week, vs explain mood and pp_mood (this month); - stopsDay: this week, vs r_pain and explain pain_severe (this month), and Help s4b (this week); - afterSex plus between periods: this week, vs explain spot_between (watch or this month) and aftersex ('within 2 weeks'); - urineBlood: within 2 weeks, vs explain burn ('blood in your urine: see a doctor today'); - ovarian: '40+, most days for 3 weeks', vs screen.js ('12 or more days a month', no age). Many other rows restate reviewed lines in new words instead of referencing them (TORSION, ECTOPIC, G.baby, PAINS, loss RED_NOW), which adds review load and lets wording drift.
- **Evidence:** post.js:73 and :552; cond.js:552; preg.js:467; explain.js:17 and :177, :97 and :171; app.js:237 r_pain; explain.js:48 and :145; app.js:67 s4b; explain.js:52-53 and :153; explain.js:62; explain.js:65; screen.js:397. NHS DVT (fetched): leg symptoms alone → 'urgent GP appointment or ... 111'; with breathlessness or chest pain → 'Call 999' (https://www.nhs.uk/conditions/deep-vein-thrombosis-dvt/).
- **Fix:** Write a crosswalk table for §20 with: bank id, every existing key with the same sign, its current level, the decided level, and 'reference (@mod:key) or new'. Edit the core lines to the decision in the same commit. The diary-independence test then checks one source.
- **Checked:** Small nuance: the explain 'burn' line gives 'today' for blood in the urine together with burning, which is narrower than the bank's 'Blood in the urine, even once'. The calf conflict matters mainly after a birth, where post.js says one calf alone → 112 now.

### Major · S14 · safety

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, B.1 iud (line 147)
- **The doc says:** iud: new pain after a Copper-T, threads she can't feel, pain during sex → this week.
- **Issue:** 'Threads she can't feel' assumes she checks the threads internally. That contradicts the reviewed contra.js line saying Indian guidance doesn't need her to, and the main doc's own 'no internal self-examination' (section 7). It also leaves out the rest of the reviewed PAINS list.
- **Evidence:** contra.js:188 'Indian guidance says you do not need to feel for the threads yourself.'; contra.js:908 contra_cut_threads; contra.js:190-196 PAINS ('S: string (thread) problems, or you or your husband can feel the device'). Main doc line 505.
- **Fix:** Reference PAINS (@contra) for the sign list. Keep only the extra urgency overrides: fever → today; a late period with a Copper-T → a test today; with one-sided pain → lateOneSided (Now).

### Major · S15 · safety

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, B.1 blackStool, painkillerHarm; B.6 tablet lesson; main 3.11 'Painful and heavy' pair
- **The doc says:** blackStool: black, sticky stools that began before iron, or with dizziness → Today. painkillerHarm: black stools after painkillers → Now. B.6: 'black stools are normal with iron'.
- **Issue:** The planned pair 'Easier periods plus the iron add-on' puts a woman on period painkillers and iron at once. She would see three answers for black stools: normal, Today, and Now. The reviewed iron and anaemia lines say 'normal', which could hide bleeding in the stomach caused by painkillers.
- **Evidence:** Appendix lines 145, 161, 220. iron.js:48 and journey.js:49 'Black stools are normal with iron'; cond.js anaemia 'Black stools are normal with iron and not harmful.' Main doc line 339 (Easier periods + iron add-on).
- **Fix:** One line, decided by the doctor: 'Black stools are common with iron. Black, sticky stools with dizziness, belly pain or vomiting, or vomiting blood: [level]'. Show it on both the iron and pain surfaces, and drop the 'began before iron' test, which she can't apply.
- **Checked:** The appendix partly saw this. The Easier periods fixes (line 235) say 'With the iron add-on: a black-stools line about painkillers.' So the conflict isn't unnoticed. What stands is that the bank rows still give Today (blackStool) vs Now (painkillerHarm), and B.6's 'black stools are normal with iron' sits beside them. The 'began before iron' test is one she can't apply. One reviewed line used on both surfaces is still the right fix.

### Major · S16 · contradiction

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md`, 3.9 crisis sheet; 3.10.1; B1
- **The doc says:** The crisis sheet has two neutral choices: 'Thoughts of harming myself' (14416, 112) and 'Someone at home hurts or scares me' (181, 112). Logs label it 'Need help now?'.
- **Issue:** After a birth, the reviewed lines and the bank's own harm row cover thoughts of harming the baby, which the sheet's label leaves out. The psychosis line ('do not leave her alone') has no row. Childline 1098 is missing, though HELPLINES and Help s5b give it and Help opens in browse and teen mode. 'Need help now?' is already the title of the emergency-numbers sheet, so two different sheets would share one name.
- **Evidence:** post.js:74 u_4 'Thoughts of harming yourself or your baby'; post.js:130 fl_harm; explain.js:97 pp_mood; appendix line 157 harm 'herself or her baby'; post.js:438 G.fam psychosis line. app.js:2966 HELPLINES includes ['1098', 'Childline, under 18']; app.js:68 s5b. app.js:232 sos_h 'Need help now?' used by openSOS (app.js:2165-2166).
- **Fix:** Label: 'Thoughts of harming myself or my baby'. Add a third neutral line, 'Someone I'm with is confused or not safe to leave alone' → 112. Show 1098 when mem.teen or under-18. Give the crisis sheet its own title.
- **Checked:** Severity is closer to moderate. The bank already has a psychosis row (Now, 'do not leave her alone'), and After the birth shows a psychosis family card in week 1, so only the sheet itself lacks a row for it. 'Logs label it Need help now?' matches the after-birth check-in option (appendix 1501), which shares the emergency-numbers sheet title.

### Major · S17 · safety

- **Doc and section:** `docs/journey-audit-2026-10-24.md vs docs/plans-design-and-build-2026-10-24.md`, Journey P0 3 fix; main 3.12; appendix rules line 26-27
- **The doc says:** In discreet mode, one neutral line, 'Something you noted needs a check soon · Open', opens behind the app lock (journey audit). Red flags are 'reworded, with details one tap in' (appendix).
- **Issue:** For Now-level signs (post-partum haemorrhage, bleeding in pregnancy, post-partum pre-eclampsia, thoughts of harm), 'needs a check soon' downgrades the urgency. Putting the details behind the PIN adds a step when minutes matter. Emergency numbers reveal nothing about her health.
- **Evidence:** Journey audit lines 82-85. Main doc lines 292 and 354-355. post.js:571 (u flags carry 112 and 108 buttons). Probe C: in discreet mode, a bleeding-in-pregnancy check-in leaves nothing on Today, while the Help sheet and 'Emergency: call 112' stay visible.
- **Fix:** Use two neutral lines that keep the level: Now = 'Something you noted needs help now' with visible 112, 108 and 102 call buttons and no PIN; Today = 'Something you noted needs a check today · Open', with details behind the lock. Neither goes in a notification.
- **Checked:** Minor nuance: the 'behind the PIN' step only applies when she has set an app lock. The level-dropping wording ('needs a check soon') for 112-level signs is the substantive problem, and it's in the journey audit's 39.0 fix, which the plans doc's 'reworded, details one tap in' inherits.

### Major · S19 · safety

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md`, 3.10.4 and B4 (notification budget)
- **The doc says:** At most 2 health reminders a day.
- **Issue:** A pregnant woman already has a daily IFA reminder, a calcium reminder 'with lunch and dinner', and the plan's evening reminder, plus due items. Contraceptive pill reminders come from contra.js. A cap of 2 would drop a medicine or contraception reminder: a safety and pregnancy risk.
- **Evidence:** preg.js:795 preg-ifa (kind 'med'); preg.js:791 preg-ca 'Calcium tablet with lunch and dinner'; plan.js:446 plan reminder every 1 day; preg.js:965-971 due-item reminders; contra.js:482 contra reminders; iron.js:87-88.
- **Fix:** The budget covers only nudges (plan, journey, check-in, setup, fresh-start). Reminders she set for a medicine, a vaccine or a check-up are never dropped or merged. Ship the neutral-title part in 39.0 (labels only).
- **Checked:** Small correction: the doc doesn't say an over-budget reminder is dropped rather than merged, so 'would drop' should be 'could drop'. The cap is undefined for medicine reminders, and a pregnant woman with the default reminders already has 3 a day.

### Major · S20 · safety

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md`, 3.10.2 and B2 (care after a loss)
- **The doc says:** endPregnancy and 'My baby has died' clear every pregnancy, iron, vaccine and plan reminder.
- **Issue:** Clearing reminders silently is right for pregnancy and baby-vaccine reminders. But an iron or calcium tablet reminder can be treatment for anaemia, and that doesn't end with the pregnancy. After a stillbirth or a newborn death she is post-partum, often after blood loss. Silently removing it breaks the doc's own 'offer, never apply silently' principle.
- **Evidence:** Main doc lines 318-320 and 488. iron.js:87-92 (daily plan; REM_TEST 'Ask for your repeat Hb test'). preg.js:639 hb_flag. cond.js anaemia 'the doctor or ANM may give the red tablet daily, often for about 3 months, and test again'.
- **Fix:** Silently clear pregnancy, PMSMA, baby-vaccine and plan reminders. For iron and calcium, ask once, gently: 'Keep your tablet reminder?' with a neutral title. Keep the iron repeat-Hb reminder and her own 6-week check.

### Major · S21 · rule

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 5 Midlife doctor moments (line 1140)
- **The doc says:** 'Any, her taps | By the bank': night sweats with fever, a cough of 2 weeks or weight loss (this week; the free TB test); hot, swollen or red joints (soon); flushes with weight loss and shaky hands (soon).
- **Issue:** These aren't bank ids. They bring in non-reproductive conditions (TB of the lungs, inflammatory arthritis, an overactive thyroid) against 'Reproductive health only; no new conditions' and the journey audit's 'no thyroid content'. They also use a seventh urgency word, 'soon'.
- **Evidence:** Appendix lines 1140-1141. CLAUDE.md 'Reproductive health only. No new conditions'. Journey audit line 276 ('no thyroid content or plan').
- **Fix:** Drop them, or replace them with one neutral line, 'Something else that worries you: see a doctor', referencing Help. Keep midlife red flags to the reproductive ones (afterMenopause, midlifeBleed, ovarian, breast) plus the exercise stop signs.
- **Checked:** Partly a judgement call. These are safety-net lines for symptoms that overlap with midlife ones (night sweats, aches, flushes), not plans for new conditions, so dropping them could lose a useful 'this isn't menopause' prompt. The rule problem is naming TB and thyroid (also 'often Hb and thyroid' on the aches start card, line 1137) and the extra 'soon' level. 'Soon' is also used for the impact-ready check and falls (lines 1141-1142), not just line 1140. Better fix: one neutral 'see a doctor this week' line that names no condition, mapped onto the agreed scale.

### Minor · S22 · feasibility

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md`, 3.10.3 and B3 ('in tester builds too')
- **The doc says:** Pregnancy go-now and 'Baby moving less?' from 28 weeks, with or without a plan, in tester builds too.
- **Issue:** Tester builds hold back pregtools-kicks and preg-symptoms as triage tools (MODULE_API section 34), so B3 can't be a link into them. The probe confirms the kicks route is missing in 0.38-test. Section 34 says red flags stay, so B3 must be a fixed red-flag card. Starting at 28 weeks matches ICMR and the danger article, but the reviewed pregtools k_early line also covers movements slowing or stopping before 28 weeks.
- **Evidence:** MODULE_API.md section 34 ('pregtools-kicks' and 'preg-symptoms' in TRIAGE; 'the red flags ... stay'). Probe B: 0.38-test kicks route shows none of 'Stop at 10', 'Fewer or weaker' or 'Kick counter'. pregtools.js:57 k_early.
- **Fix:** Build B3 from Help s1c and the danger article's lines (reviewed), with call buttons and no tool link. From 20 to 28 weeks, show k_early's 'slow down or stop → same day' line. Note the section 34 interaction in MODULE_API.

### Minor · S23 · gap

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, B.2 stop strips
- **The doc says:** The stop strips list when to stop moving.
- **Issue:** They say 'stop', but not what to do next. Several stop signs are themselves Now-level red flags: in pregnancy, bleeding, fluid leaking and regular tightenings; in the period strip, sharp or one-sided pain; after the birth, chest pain and calf pain.
- **Evidence:** Appendix lines 179-185; appendix line 1359 ('Any stop sign during a move | Now or today').
- **Fix:** Each stop item carries its bank id, so a tap opens that sign's urgency card (pregBleed, pregWaters, pregPains, lateOneSided or torsion, faint, calf).
- **Checked:** Partly handled: for pregnancy, appendix line 1359 maps 'Any stop sign during a move' to 'the go-now path, or stop and get checked today'. It just doesn't say which sign gets which. The other strips (stopPeriod, stopGeneral, stopPost) have no such mapping. Tying each stop item to its bank id is a sensible refinement.

### Minor · S24 · contradiction

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, B.3 Before-you-move
- **The doc says:** Pregnancy, after the birth and midlife have their own screens.
- **Issue:** The appendix's midlife section uses the adult Before-you-move screen plus an impact-ready check, not a separate one. Women over 40 are where the heart and chest-pain questions matter most.
- **Evidence:** Appendix line 193 vs line 1006 ('- The adult Before-you-move screen.') and lines 1137, 1141.
- **Fix:** Say that midlife always asks the adult screen first, then the impact-ready check.
- **Checked:** A wording inconsistency only, with no safety gap: the midlife section does ask the adult screen first.

### Minor · S26 · evidence

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md`, 3.9 routing table; 3.9 crisis sheet numbers
- **The doc says:** Pregnancy and after the birth route to '104'; Tele-MANAS '1-800-891-4416'.
- **Issue:** 104 is a state-run helpline, not pan-India; the reviewed danger article says '104 in states that run it' (PIB Fact Check). Tele-MANAS is written differently from the HELPLINES constant the crisis sheet should reuse.
- **Evidence:** Main doc lines 298 and 307. content.json danger-signs-call-112 sources ('PIB Fact Check, Nov 2024: 104 is a state-run health helpline'). app.js:2966 '1800-891-4416'.
- **Fix:** Write '104 where your state runs it'. Have the crisis sheet read numbers only from HELPLINES.
- **Checked:** Minor. The doc already says 'Numbers live in one constant', so the Tele-MANAS formatting is moot once the sheet reads HELPLINES. HELPLINES itself labels 104 'Health advice helpline' without the state caveat.

### Minor · S27 · gap

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md`, 3.10.5 and 3.12
- **The doc says:** There is one recorded safety-audio bank, but read-aloud is off by default on a phone marked shared.
- **Issue:** Women on shared phones, often the least literate, would lose spoken red flags by default. That cuts against 'short, spoken, picture-led' and the teach-back plan.
- **Evidence:** Main doc lines 326-327 and 355-356; lesson 7 (line 121).
- **Fix:** Keep tap-to-hear on red-flag and stop-strip cards in shared mode (her tap, no autoplay), and make the pictograms carry each sign without words.
- **Checked:** Minor and ambiguous rather than a confirmed loss. Line 355 ties 'read-aloud off by default' to routine counts ('so counts use tones and vibration'), and stopPreg is 'read aloud on tap'. The doc should say outright that tap-to-hear on red-flag and stop cards stays in shared mode.

## Programmes 5-8 (32)

### Blocker · B1 · safety

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md (6.1 step B2) + programmes appendix §6`, 6. My pregnancy, fixes: 'Blocker 2: a loss clears every pregnancy reminder (core step B2)'
- **The doc says:** Clearing reminders after a loss is a core step (B2), scheduled after the golden test and port A0-A6 (main doc 6.1, about 4 to 6 weeks of code).
- **Issue:** This harm is live in today's 0.38-pilot build, not a future programme risk. After 'The pregnancy ended', every pregnancy-plan reminder stays in state and is handed to Android to fire, including check-ups and PMSMA days months ahead. 'My baby is born' uses the same path (app.js 2183-2192 calls endPregnancy), so it probably leaves them too.
- **Evidence:** Probe2 (scratchpad p5to8/probe2.mjs): a woman 10 weeks pregnant turns on plan reminders, then taps #loss. state.situation.pregnant becomes false, but reminders preg-plan-anc2, scan2, pmsma, ogtt, anc3 and anc4 remain. The last SakhiAndroid.schedule payload still holds 'Due now: Second check-up' (24 Nov), 'PMSMA: free check-up today' (9 Dec, 9 Jan, 9 Feb), 'Due now: Anomaly scan' (22 Dec) and 'Due now: Sugar test (75 g)' (2 Feb). Code: app.js 708-709 endPregnancy removes no reminders; preg.js 959-969 planSync runs only on pregnancy-page actions; app.js 3444-3459 buildNotifs schedules every reminder with no pregnancy check.
- **Fix:** Take the reminder clean-up out of B2 and ship it in 39.0 'Fix and protect': on endPregnancy and setBirth, remove mod 'preg' preg-plan-* reminders, plus the IFA and calcium reminders if a loss. Add a privacy.mjs or notify.mjs test that a loss leaves no pregnancy notification in the schedule payload. No new wording is needed.

### Blocker · B2 · safety

- **Doc and section:** `programmes appendix`, §7 After the birth, Who (lines 1453-1457) and blocker fix (1435-1436); main doc 3.10 item 2
- **The doc says:** The programme is for a baby 'born alive'. 'A loss or a baby's death switches to care after a loss'. Only 'My baby has died' keeps 'a baby-free recovery check to day 41'.
- **Issue:** After a stillbirth or a late loss (20+ weeks) her body is recovering from a birth: postpartum haemorrhage, pre-eclampsia that starts after delivery, clots and sepsis. Yet she is routed to loss.js, which has none of the after-birth danger signs. A baby who dies on day 2 gets the full recovery check; a baby stillborn at 38 weeks gets none.
- **Evidence:** Probe A (probe.mjs): a pregnancy ended 3 days ago at about 38 weeks shows no recovery check on Home. The loss hub and 'Your body after a loss' pages contain no 'headache', 'vision', 'fits', 'calf' or 'chest pain' (only soaking and fever). loss.js 48-62 (URGENT, RED_NOW, RED_TODAY) has no BP or clot signs. post.js 127 fl_pe: pre-eclampsia 'can start in the days or weeks after birth'; post.js 128 fl_clot: 'The risk is higher in the weeks after birth'.
- **Fix:** In B2: any pregnancy ending at 20+ weeks, or a loss recorded as stillbirth, gets the same baby-free recovery check to day 41 as 'My baby has died', with the BP and sugar follow-ups and the 6-week check. Add this to loss.mjs (stillbirth at 38 weeks shows the head, vision, fits, calf and chest signs).
- **Checked:** Small addition: loss.js's 'After a later loss or a stillbirth' block (178-181) already says the body recovers as after any birth and advises a BP check a few weeks later. Main doc 3.10 item 2 already plans to store 'stillbirth' as a kind of loss, so the fix fits naturally in B2 as proposed. The danger signs themselves (headache, vision, fits, calf, chest) are what's missing.

### Blocker · B3 · safety

- **Doc and section:** `programmes appendix`, §8 Getting ready, blocker fix (lines 1655-1658); main doc 3.10 item 2
- **The doc says:** After methotrexate or a molar pregnancy, Getting ready restarts 'only after "my doctor says I can try again"', and the folic acid record ends.
- **Issue:** The gate depends on Sakhi knowing the kind of loss, and it fails open. endPregnancy stores no kind, loss.js stores nothing by design, the after-loss pause ends at her next period, and losses from before she joined are never recorded. Getting ready's day-1 step is folic acid. During methotrexate treatment for an ectopic, folic acid is to be avoided until her doctor says so, because folate can stop the medicine working.
- **Evidence:** Probe B: a loss 50 days ago with a period since gives situation = {pregEndedOn} only, and S.cycle.afterLoss() returns false. app.js 708-709 (endPregnancy sets only pregEndedOn); loss.js 7-8 ('reading never creates storage'); loss.js 170 ('After the methotrexate injection: ... no folic acid tablets ... until your doctor says'); appendix 1698 (day 1: folic acid get-or-tick).
- **Fix:** Make the gate fail closed. Getting ready's intake asks once, 'Has a pregnancy ended in the last 6 months?' On yes or not sure: 'Did you have an injection for it (methotrexate), or was it a molar pregnancy?' Yes, not sure or prefer not to say holds folic acid and the plan behind 'My doctor says I can'. Show loss.js line 170 on the folic acid card's first day for every woman. Test it in loss.mjs, including a loss that was never recorded.
- **Checked:** Main doc 3.10 item 2 plans for loss.js to store the kind of loss (ectopic with or without methotrexate, molar...). So the fail-open is narrower than 'endPregnancy stores no kind' implies: it covers losses never recorded in Sakhi (before she joined) and kinds she skips or doesn't know. Probe B shows today's code, not the planned design. The core point stands: the gate depends on a record that may not exist, and Getting ready's day 1 is folic acid.

### Blocker · B4 · safety

- **Doc and section:** `programmes appendix`, B.1 red-flag bank, `afterProcedure` (line 139); used by §8 (line 1781) and covering 'a birth'
- **The doc says:** Heavy bleeding after an abortion, a miscarriage, a birth or a procedure is 'Now if soaking 2 thick pads an hour; else Today'.
- **Issue:** This threshold is twice the reviewed one and puts the after-birth case below the reviewed urgency. Bank lines 'apply at once' (main doc 5.8), so a woman soaking one pad an hour after a miscarriage or a birth would be told 'Today' instead of 'Now'.
- **Evidence:** Reviewed lines: loss.js 48-53 (URGENT 'soaks a pad every hour' → 112; RED_NOW 'soaks a thick pad every hour, for 2 hours in a row' → 112); post.js 91 and 126 (d_soak and fl_bleed: 'Soaking a pad in an hour' → hospital now). The bank's own `postBleed` (line 172) also uses 1 pad an hour.
- **Fix:** Drop 'a birth' from afterProcedure; postBleed covers it. After a miscarriage, abortion or procedure, use loss.js's reviewed words ('a thick pad every hour for 2 hours: Now'). Add a progs.mjs check that every bank urgency for bleeding is at least as strict as the reviewed module line it replaces.
- **Checked:** Not quite 'twice the reviewed one' everywhere. For abortion pills there is a reviewed line with the same threshold: pregtest.js 53 RED_NOW, 'soaks 2 thick pads an hour, for 2 hours in a row or longer', which matches CAC/WHO guidance. The bank's version, with no 2-hour condition, is even a little stricter. The under-triage is real for a miscarriage (loss.js 49 and 53: one pad an hour means 112) and for a birth (post.js 91/126). In practice After the birth uses postBleed, not afterProcedure, and programmes stop after a recorded loss, so exposure is narrower: major rather than blocker. Fix: keep the 2-pad line for abortion only, use loss.js's words for miscarriage, and drop 'a birth'.

### Major · M1 · contradiction

- **Doc and section:** `programmes appendix`, §7 Doctor moments (lines 1569, 1572); B.1 `calf` (155), `severeBelly` (135)
- **The doc says:** After the birth shows `calf` 'with breathlessness' and `severeBelly` as Now, and each recovery-check sign 'Today'. The bank says it is reconciled with post.js flagsOf (line 125).
- **Issue:** It is not reconciled, and one sign is under-triaged. Calf pain alone is Now (112) in the reviewed recovery check but Today in the bank, in the weeks when clot risk is highest. Severe belly pain is Today in the recovery check but Now in the bank. A woman would see different urgencies for the same sign on the programme strip and in the check.
- **Evidence:** post.js 552: `if (on('calf') || on('chest') || on('breath')) add('danger','u','fl_clot')`, which is the urgent level, alone; post.js 556: `on('belly')` gives 'd' (doctor today); bank 155 `calf`: 'Today; with breathlessness Now'; bank 135 `severeBelly`: Now.
- **Fix:** Add an after-birth stage override in the bank: calf pain or swelling alone is Now up to 12 weeks after a birth. Choose one belly-pain urgency in §20 (post.js 136 fl_belly already escalates to 112 with fever, fainting or heavy bleeding). Add both to the §20 conflicts register.
- **Checked:** Minor: the bank's severeBelly gist ('with a hard belly, or unable to stand straight') is narrower than post.js's 'belly' chip, so the belly conflict is partly two different signs. But the appendix §7 fix (1437) says outright 'severe belly pain are Now' against post.js fl_belly (Today, 112 only with fever, fainting or heavy bleeding). The calf conflict is clear-cut.

### Major · M2 · contradiction

- **Doc and section:** `programmes appendix`, B.1 pregnancy set (lines 165-170) and §6 Part A (1265, 1356)
- **The doc says:** The pregnancy bank urgencies come from 'the MCP card and the reviewed danger article' and are reconciled with the core lines.
- **Issue:** Four signs disagree with the reviewed pregnancy pages: (1) `pregMovesLess` is Today, but the reviewed go-now list and the near-term weekly tip say go now, and Part A sends 'baby moving less' to the go-now card. (2) `pregBP` makes sudden swelling alone Now; the reviewed page says today, and now only with headache or blurred vision. (3) `pregPains` makes 'a change in discharge before 37 weeks' Now, while the reviewed discomforts page says more discharge is normal and a smell or colour change is 'this week'. (4) `faint` makes breathlessness at rest Now; the reviewed page says today. None of these is in the main doc's §5 conflicts list.
- **Evidence:** pregtools.js 76-79 (go_h 'Go to hospital now' plus go_3 'moving less than usual'); preg.js 395 ('Fewer movements ... go to hospital now'); pregtools.js 29 k_today (same day, 'straight away ... even in the middle of the night'); preg.js 435-436 (swelling: today; with headache or vision: now); preg.js 448-451 (discharge: normal; this week; watery fluid: now); preg.js 467-468 (breathless at rest: today; sudden: 112).
- **Fix:** In §20, settle each one: (1) Keep k_today's 'straight away, even at night, don't wait till morning' wording whatever the label, and make Part A and the check-in agree. (2) Swelling alone is Today; with headache, vision or pain under the ribs it is Now. (3) Narrow to 'watery, mucus-like or blood-streaked discharge before 37 weeks'. (4) Breathless at rest is Today; sudden breathlessness or chest pain is Now. Add pregtools go_3 and preg.js 395, 435, 448 and 467 to the conflicts register.
- **Checked:** On (1): the bank's 'Today, even at night' for pregMovesLess matches reviewed k_today (pregtools.js 29) and preg.js 347 ('the same day, not the next morning'). The reviewed pages disagree with each other (go_3 and preg.js 395 say go now). So the conflict is among reviewed lines plus Part A sending 'baby moving less' to go-now while the check-in sends 'less' to the same-day card, not simply the bank against the reviewed pages. Points (2) to (4) hold as stated.

### Major · M3 · safety

- **Doc and section:** `programmes appendix`, §6 Before you move (lines 1216-1217, 1265, 1357-1358) and open question 1421
- **The doc says:** Part B asks what she was 'told by your doctor or ANM'. A green screen alone unlocks Pregnancy moves (recommended).
- **Issue:** Several contraindications (low placenta, cervical weakness, a baby growing slowly, pre-eclampsia) are known only after check-ups and scans. A woman with no check-up yet has been told nothing, so she honestly answers 'no' to everything, gets green, and is offered the moves routine from week 14. 'Not sure counts as amber' doesn't catch her, because she is sure nobody told her anything.
- **Evidence:** Appendix 1265: 'Part B "told by your doctor or ANM" ... A green screen unlocks the routine'. preg.js 923: the anc1 item, with ancIn auto-detection from her MCP visit dates; preg.js 930: anomaly scan at 18-20 weeks, after the week-14 screen.
- **Fix:** Add an answer 'I haven't had a check-up yet', which gives amber (easy walking only) until anc1 is done in her plan or she ticks it. Ask again at week 21 once scan2 falls due, not only at 28. Make Part A week-aware: no 'baby moving less' or 'regular pains' items before 20 weeks.
- **Checked:** Open question 1421 already asks whether a green screen alone should unlock moves. The specific 'no check-up yet' gap isn't raised, though. Also, by SOGC 2019, previa counts only after 28 weeks (when the screen is re-asked), so the week-21 re-ask matters mainly for cervical insufficiency and growth problems.

### Major · M4 · gap

- **Doc and section:** `programmes appendix + main doc 6.1 B2`, §7 blocker fix (1435-1436); main doc B2 '§20 (mostly reused)'
- **The doc says:** The baby-death path keeps 'a baby-free recovery check to day 41', mostly with reused wording.
- **Issue:** At least 6 reviewed recovery-check lines carry baby or feeding words, so the baby-free check is new wording. Two lines would give wrong advice after a death ('keep feeding from that side'), and the breast tips link to the breastfeeding guide.
- **Evidence:** Probe D: the mood chip reads 'Thoughts of harming myself or my baby' (post.js 120 mo_harm). Other lines: post.js 132 fl_mast ('Keep feeding from that side: the milk is safe for your baby'), 141 fl_redpatch ('keep feeding often'), 142 tp_sore ('Feed often from both sides'), 147 tp_mood ('baby blues'), 148 tp_sleep ('Sleep when the baby sleeps'); post.js 568 TIP_LINK sends tp_sore and fl_redpatch to R.feed. loss.js 180 already has reviewed 'milk coming in' wording.
- **Fix:** Cost and review a baby-free variant in §20: harm chip 'Thoughts of harming myself', breast lines from loss.js 180 (a medicine to stop the milk, or let it dry up), no TIP_LINK to feeding, and grief wording for the mood line. Test that no screen in that path contains 'baby' or 'feed' in English or Hindi.
- **Checked:** There are even more lines than listed: fl_bleed ('keep the baby at the breast if you can') and fl_harm ('stay with you and the baby. You are not a bad mother') also carry baby wording.

### Major · M5 · rule

- **Doc and section:** `programmes appendix vs main doc 3.9`, §7 Doctor moments (1581); §7 fix (1439-1440); main doc table (line 298)
- **The doc says:** Weeks 2 and 7 and quiet spells offer 'Want someone to call you?', including Qura 'only for habits'. Only the mood page's BAMS card is removed when reached from the programme.
- **Issue:** The main doc says pregnancy and 'the weeks after a birth' should never get 'a Qura call from a programme trigger'; week 2 after a birth is exactly that. The programme also links daily into after-birth and pregnancy pages that still carry Qura (BAMS) call cards: feeding, contraception, pelvic floor, the hub, pregnancy food and birth preparation.
- **Evidence:** main doc 298; appendix 1581; post.js 712 (feeding), 756 (contraception), 816 (pelvic) and 896 (hub) askCard; preg.js 669 and 831 data-ask; pregtools.js 125 r_ask_p ('A free 20-minute call with a Qura doctor (BAMS)...') at 458.
- **Fix:** For After the birth, offer only her ASHA and the free government doctor until at least the 6-week check (or never Qura from programme triggers, as the main table says). Hide the ask cards on pages opened from the pregnancy and after-birth programmes, as the appendix already does for the mood page. If Mohit wants Qura after week 6, change the main table in writing.
- **Checked:** Small point: the main doc contradicts itself too. The 3.9 table (298) says never a Qura call from a programme trigger for pregnancy and the weeks after a birth, but decision 16 says only 'never from pregnancy triggers or for mood'. The fix should settle both in writing.

### Major · M6 · minimalism

- **Doc and section:** `programmes appendix vs main doc 3.9 item 5`, §5 Doctor moments (1134-1147), esp. line 1140; also §7 (1569-1581), §8 (1774-1786)
- **The doc says:** '5 to 7 red flags per programme from the bank' (main doc 291).
- **Issue:** Midlife lists about 17 distinct urgent or soon signs. Several are new non-reproductive conditions: TB (night sweats with fever, a 2-week cough), inflammatory arthritis (hot or swollen joints, stiffness over an hour), overactive thyroid (racing heart with weight loss and shaky hands), and stroke or clot signs on hormone therapy. That breaks 'No new conditions', multiplies review and teach-back, and dilutes the signs that matter. After the birth and Getting ready also exceed the cap; for pregnancy and after-birth a long list is clinically justified by the MCP card, but the cap should then say so.
- **Evidence:** Appendix 1140 lists `ovarian`, TB signs, joints, `breast`, palpitations or thyroid, and hormone-therapy clot or stroke signs; 1134-1146 add afterMenopause, midlifeBleed, faint, chest pain to the jaw, soakDizzy, heat, back-fracture proxies, a vaginal bulge, a fall with injury, lowMood and crisis. CLAUDE.md: 'Reproductive health only. No new conditions.' meno.js 275 already has a reviewed palpitations card.
- **Fix:** Amend 3.9 item 5 to 'at most 7 pinned; the rest one tap in under When to get help'. For Midlife v1, pin afterMenopause or midlifeBleed (by stage), faint and chest pain, soakDizzy, ovarian, breast, a fall with injury, and lowMood or harm. Replace the TB, joint and thyroid lines with the reviewed meno.js 275 card or one generic 'other new symptoms: see a doctor' line. Keep the hormone-therapy clot or stroke line on the reviewed HRT page, not in the plan.
- **Checked:** Whether referral lines for TB, arthritis or thyroid 'break No new conditions' is arguable (they are referral lines, not plans). The firmer points: they aren't in the shared bank at all, they exceed main doc 3.9 item 5's '5 to 7 red flags per programme', and each adds new non-reproductive wording to review.

### Major · M7 · contradiction

- **Doc and section:** `programmes appendix vs journey audit §8`, §5 Her measure (1111-1119), B.5 num10 (212), prerequisites (1172)
- **The doc says:** Midlife's main measure is a new weekly 0-to-10 problem rating plus coping, with the 12-symptom diary only secondary. It needs a new spoken 0-to-10 scale.
- **Issue:** The journey audit written the same day says 'The midlife plan's result is her weekly diary in her own words'. meno.js already logs a weekly 12-item diary with levels, and plan.js already reads it for midlife results. A second weekly rating means duplicate entry for her, new scale infrastructure, and a 0-10 'problem rating' that mirrors the Hot Flush Rating Scale's (HFRS) first item, which the doc says it doesn't use.
- **Evidence:** journey-audit-2026-10-24.md line 275; meno.js 42 (SYM: 12 items), 71 (trend API); plan.js 1603-1604 (midlife results already read S.meno.trend for hot, sleep and mood); appendix 1118 ('not ... HFRS').
- **Fix:** Make the main measure her goal's item in the existing midlife diary (weeks with flushes or poor sleep at level 2 or more, first 4 vs last 4). Add only the one coping question. Drop num10, the spoken scale and the field-test comparison from v1.

### Major · M8 · feasibility

- **Doc and section:** `programmes appendix`, §5 Midlife whole section (1025-1209); reuse/new 1165-1179
- **The doc says:** About 4,700 new words (the largest pack), 8 to 11 code days, four reviewer roles (two not yet named), with 7 goal-ordered module sequences and several new prerequisites.
- **Issue:** Most of the load sits in features used only by Midlife or still unapproved: - 7 order variants (1029-1037); - a morning note with a picture-clock picker and a morning reminder (1065, 1172); - a beep-timed one-leg check (1068); - an impact-ready check, a stamp builder and an 'I fell' path (1059, 1141-1142), while open question 1204 asks whether stamps belong in an unsupervised app at all; - a calm variant that needs a psychologist (1064, 1078); - a new hormone-therapy decision aid (1087), although a reviewed HRT page exists; - a POI version. It also has the most unresolved open questions (1201-1209).
- **Evidence:** Appendix lines cited; main doc table line 378 (8 to 11 code days, the most of any programme); meno.js already has the hormone-therapy, bones, intimate and surgical pages (appendix 1167); the 'Rest' module is closest to the evidence map's excluded 'standalone sleep/CBT-I programme' (reference_sakhi_evidence_map).
- **Fix:** Cut v1 to: - two orders: A first for flushes, sleep and mood; C first for bones, weight and aches; - Rest as 4 weekly lessons with one rule a week, measured by the diary's sleep item, with no morning note, picker or morning reminder; - no stamps until a physiotherapist signs the ready check (heel raises only); - a link to the reviewed meno HRT page instead of a decision aid; - POI as the existing cond-poi card, not a version. This plausibly halves the new words and removes the psychologist for everything except the calm variant.
- **Checked:** 'Plausibly halves the new words' is an estimate, not measured. The evidence map lists CBT-I among things to strengthen and excludes only a standalone sleep programme, so Rest inside Midlife isn't a rule breach, just a scope risk.

### Major · M9 · minimalism

- **Doc and section:** `programmes appendix vs earlier outline`, §6 Weekly lessons (1281-1307), new words (1396); outline 4.6 (line 469)
- **The doc says:** 23 weekly pregnancy lessons, about 4,000 to 4,500 new English words.
- **Issue:** Most lesson gists duplicate reviewed weekly tips already in preg.js (39 'tip' entries, weeks 4 to 41): register early, sickness, medicines, ectopic signs, first-visit tests, Td, schemes, IFA and calcium, the second check-up, the anomaly scan, extra food, swelling, PMSMA, the sugar test, Hb, BP, movements, JSSK, Anganwadi food, waters, the birth plan, eclampsia, labour signs, first-hour feeding, family planning and 41 weeks. The earlier outline planned to show 'this week's pregnancy page (already reviewed)' as the lesson. Two reused tips also break 'no calorie counting'.
- **Evidence:** preg.js tips sampled at 271, 291, 295, 315, 331, 347, 395 and others (grep -c 'tip: { en:' = 39); outline line 469; preg.js 315 and 476 ('about 350 extra calories a day').
- **Fix:** Build each week's lesson from the reviewed week page, with doses stripped at render as appendix 1389 already plans. Write new cards only for the gaps: moving in pregnancy and the stop signs, the pelvic floor, side-sleeping, 'Looking after you', and feeding with family. Add preg.js 315 and 476 to the §20 conflicts (kitchen measures, not calories). That saves about 2,500 words of review.
- **Checked:** The appendix's Reuse line already plans to show the week pages with doses stripped. And the ~4,000 to 4,500 words also cover routines, steps and screens, not only lessons, so the 2,500-word saving is an estimate.

### Major · M10 · minimalism

- **Doc and section:** `programmes appendix`, §6 Adaptivity (1376-1377); §7 Adaptivity (1593-1594); §7 open question 1645
- **The doc says:** 'Where I'm staying now' (husband's home, my mother's home, the city) changes her ASHA, Care near me, foods and family audience without a restart.
- **Issue:** This is a new data model (several ASHAs and locations per woman) inside two content programmes, with no evidence cited. The appendix's own open question (1645) asks whether it is for now or later.
- **Evidence:** Appendix 1376, 1593, 1645; asha.js today keeps one saved ASHA (preg.js 936 auto: S.asha.saved()).
- **Fix:** Cut it from v1 of both programmes and keep one My ASHA. Revisit after the field test if women report moving to their maternal home.
- **Checked:** §7's open question 1645 already asks whether the 'where I'm staying' switch is for now or later. §6 (1376) states it as design with no question, and the main doc's step-C prerequisites don't budget for it.

### Major · M11 · feasibility

- **Doc and section:** `programmes appendix`, Shared rules (lines 15-17); §7 phases (1467), daily steps (1476-1503), lessons (1508-1509)
- **The doc says:** 'Days 1 to 3: at most 3 steps and one card besides red flags.'
- **Issue:** In week 1 after a birth the plan stacks: - 3 rows: the recovery check (12 groups), a pelvic set or Gentle recovery, and the dated ASHA item; - feeding check-ins on days 3 and 7; - lesson 1 and the blues lesson on days 3 to 5; - the psychosis signs card and the newborn danger card; - the weekly night-stretch step from week 1; - 'one small thing for me' weekly. That is far beyond one card and about 2 minutes a day, for a mother in her first week.
- **Evidence:** Appendix 1467 ('feeding check-ins days 3 and 7; lesson 1; the psychosis signs card; blues on days 3 to 5'), 1488-1490 (ASHA prompts; feeding days 3, 7, 14...; night stretch weekly weeks 1-8). Probe C: today's V38 day-3 after-birth Today already shows 3 rows (rcheck, feed, pelvic).
- **Fix:** Week 1: the recovery check, plus one combined card ('signs for you and your baby': lesson 1, the newborn list and the family psychosis line), plus the ASHA-day item. Offer the pelvic set from day 3. Make night stretch a lesson card, not a step. Hold feeding check-ins on days 3, 7 and 42 only. Add a plans-walk assertion for days 1 to 7.
- **Checked:** Partly overstated. The shared rule (15-17) exempts red flags and other urgent cards, so the newborn danger card and the family psychosis card arguably don't count. 'One small thing for me' starts in weeks 3 to 6, not week 1. The real overload in days 1 to 7 is lesson 1 plus the blues lesson (days 3 to 5), feeding check-ins on days 3 and 7, a weekly night-stretch step from week 1 and ASHA-day cards on top of 3 rows.

### Major · M12 · evidence

- **Doc and section:** `programmes appendix`, §7 Her measure (1548-1553); Adaptivity goals (1595-1596)
- **The doc says:** The main measure for every after-birth woman is leaks this week, wind and stool control, and heaviness.
- **Issue:** The goals are recovery, pelvic, feed, mood, sleep and weight, yet 6 of the 7 get a continence result. WHO 2022 does not recommend starting routine PFMT after childbirth for prevention (very low certainty); it says inform every woman and treat those who leak. Framing every after-birth plan's result around leaks goes beyond that.
- **Evidence:** WHO 2022 recommendation, fetched (bigg-rec.bvsalud.org/.../7b3c277d...): 'starting routine pelvic floor muscle training (PFMT) after childbirth' is 'not recommended' for prevention; 'All women should be informed ... about potential pelvic floor problems'. Appendix 1621-1625 cites the same.
- **Fix:** Measure by goal, as Midlife does: pelvic gives leaks; feed gives feeding check-ins answered; recovery gives checks done and the 6-week check; mood, sleep and weight give days followed only. Keep the weekly leaks question for everyone as the WHO 'inform' step, not as the result.
- **Checked:** '6 of the 7' should read 'all 6 goals'. The doc already sends 'the WHO vs Canada pelvic floor framing' to the obstetrician (reviewers line, decision 10), and Canada 2025 does recommend daily pelvic floor training, so the evidence is mixed. The measure-by-goal point is not addressed anywhere and stands.

### Major · M13 · contradiction

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md vs docs/programmes-every-condition-2026-10-24.md`, Main doc lines 11-12; outline header lines 7-9; outline §6 lines 594-595 and §7 line 611
- **The doc says:** Main doc: the outline's 'sections 0, 1, 3 and 6 to 8 still stand'. Outline header: 'Sections 0, 1 and 3 still hold.'
- **Issue:** The two docs disagree about whether outline §6 to §8 stand. Outline §6, if it stands, says 'pregnancy moves only after her doctor's OK' and 'after-birth moves only after the 6-week check'. The appendix instead opens moves on a green screen (1265) and gentle moves from week 1 (1467). Outline §7 also sets numeric success bars (midlife 'down by about 1 to 2 points out of 10'). A build session could follow either rule set.
- **Evidence:** plans-design-and-build line 11; programmes-every-condition lines 7-9, 594-595, 611; appendix 1265, 1469, 1485.
- **Fix:** Mark outline §6 and §7 'superseded where the appendix differs' (or remove '6 to 8' from main doc line 11), and repeat the pregnancy and after-birth move gates once, in the appendix only.
- **Checked:** Severity is lower than major. The outline header doesn't say §6 to §8 are void; it is silent on them. The main doc's 'except as below' plus its 'What changed' table explicitly replace the outline's move gates (My pregnancy: screen instead of doctor's OK; After the birth: gentle moves from week 1). A session reading the main doc gets the new rule; the risk is a session reading only the outline. Worth fixing as doc hygiene.

### Major · M14 · contradiction

- **Doc and section:** `programmes appendix`, B.3 adult Before-you-move (lines 187-193) vs §5 Doctor moments (1137)
- **The doc says:** B.3: '(4) Do you take tablets for BP? Any yes: easy walking only'. Midlife: 'Easy walking only on a yes; strength held at level 2'.
- **Issue:** The two rules contradict each other, and neither gives a way to unlock. Taking BP tablets is common at 40+, so the strength-and-balance module (the bone and falls core of Midlife) would close for a large share of its own users, with no 'my doctor said OK' path.
- **Evidence:** Appendix 191-192 and 1137.
- **Fix:** One rule. BP tablets alone: strength at levels 1 to 2 with 'tell your doctor you're starting', and higher levels after 'My doctor said OK'. Chest pain, faintness or a heart or lung problem: walking only until the doctor's OK. Have the gynaecologist or physiotherapist sign it in §20.
- **Checked:** B.3 does say 'Ask your doctor before doing more', which implies a doctor's OK could unlock, but no unlock mechanism is specified. The Midlife line ('Easy walking only on a yes; strength held at level 2') contradicts itself as well as B.3.

### Major · M15 · rule

- **Doc and section:** `programmes appendix`, §8 Doctor moments (line 1781)
- **The doc says:** Getting ready shows 'his sudden severe testicle pain (Now); a testicle lump (soon)'.
- **Issue:** Testicular torsion and testicular lumps are men's conditions and appear in no reviewed Sakhi page. Adding them breaks 'Reproductive health only. No new conditions' and adds urology wording for the gynaecologist to sign.
- **Evidence:** ttc.js 472-479 (the partner page covers fertility only: heat, mumps, varicocele, surgery); CLAUDE.md rule.
- **Fix:** Cut both lines. Keep 'his part' to fertility, as in the reviewed partner page.
- **Checked:** These are two lines, so major may overstate the size, but the rule point is right.

### Minor · m1 · contradiction

- **Doc and section:** `programmes appendix`, §6 Tablets today (1271), measure (1338); §7 tablet row (1491), add-on (1600)
- **The doc says:** Pregnancy shows 'Day 47 of 180' and 'tablet days towards 180'; After the birth uses 'Day {n}' with 'no dose or duration words', yet its add-on is a 'default suggestion, 180 days'.
- **Issue:** There is no single rule on whether a tablet duration counts as a dose word, so a lint in progs.mjs can't be written.
- **Evidence:** Appendix lines cited; §7 Reuse (1610) lists the iron.js post plan's 'duration words' as something to rewrite.
- **Fix:** Decide once in §20 (for example, the national 180-day course is allowed as 'about 6 months, as your ANM advises') and apply it to both programmes and the lint.

### Minor · m2 · contradiction

- **Doc and section:** `programmes appendix`, §8 Doctor moments (line 1780)
- **The doc says:** 'Breathless at rest or on light work, a racing heart, fainting, swollen feet or face' is Today.
- **Issue:** Fainting is Now in the bank (`faint`) and in `anaemiaMove`.
- **Evidence:** Appendix 136 (`faint` Now) and 163 (`anaemiaMove`: 'fainting Now') vs 1780.
- **Fix:** Split it: fainting is Now; the other signs are Today.

### Minor · m3 · safety

- **Doc and section:** `programmes appendix`, §6 How are you in yourself? (1275) and Doctor moments (1364)
- **The doc says:** 'Low most days' shows the fixed crisis card, with urgency 'This week'.
- **Issue:** This mixes low mood with crisis. The bank's `lowMood` sends her to an MBBS doctor or Tele-MANAS this week, and After the birth uses lowMood (1574). Showing the harm or 181 sheet for a 'low' answer may frighten her or teach her to skip the question.
- **Evidence:** Appendix 159 (`lowMood`), 157 (`harm`), 1574.
- **Fix:** For 'low most days', show the lowMood card with a one-tap 'Thoughts of harming yourself?' button that opens the crisis sheet.

### Minor · m4 · safety

- **Doc and section:** `programmes appendix`, §7 Adaptivity, not breastfeeding (line 1590)
- **The doc says:** 'fertility can return within 4 to 6 weeks'.
- **Issue:** If she isn't breastfeeding, ovulation can come before 4 weeks. That is why the appendix's own contraception card starts at day 21. 'Within 4 to 6 weeks' can read as 'safe until 4 weeks'.
- **Evidence:** Appendix 1492 (the contraception card from day 21).
- **Fix:** Use 'you can get pregnant from about 3 weeks after the birth', matching the day-21 card (gynaecologist to word it).

### Minor · m5 · contradiction

- **Doc and section:** `programmes appendix`, §7 Adaptivity (1585-1586), Add-ons (1600) vs §4 (808, 826-827)
- **The doc says:** After the birth: leaks or heaviness 'offer the full pelvic floor course as the pf step's content'.
- **Issue:** §4 says heaviness gets only find-it and lying sets for up to 4 weeks, with 'Get checked once' leading, and the 16-week core opens only after 'a doctor said prolapse'.
- **Evidence:** Appendix 808 and 826-827.
- **Fix:** After a birth, heaviness gives 'Get checked once' plus lying sets, following §4. Leaks give the full course.

### Minor · m7 · contradiction

- **Doc and section:** `programmes appendix`, §5 Routines (1096 vs 1099-1100)
- **The doc says:** 'Gentle yoga, bone-safe (twist and triangle removed)' and 'Smooth twists are allowed (ROS)'.
- **Issue:** The two lines contradict each other inside the bone-safe rule.
- **Evidence:** Appendix 1096, 1099-1100.
- **Fix:** The physiotherapist picks one. If smooth twists stay, keep the seated twist and drop only loaded or end-range twists.

### Minor · m8 · evidence

- **Doc and section:** `programmes appendix`, §5 Evidence (line 1196)
- **The doc says:** 'App-delivered balance training: 16% fewer falls over 2 years, 30 to 40% reached the dose (Delbaere 2021, corrected).'
- **Issue:** StandingTall enrolled adults 70+. The 16% is the fall rate, not the share of people who fell (which didn't differ), and the abstract doesn't report '30 to 40% reached the dose'. It doesn't support the effect in 40 to 60 year olds.
- **Evidence:** Fetched researchnow.flinders.edu.au abstract: 503 community-dwelling adults aged 70+; IRR 0.84 (0.72-0.98); 'proportion of people who fell ... did not differ'; 52.0% still exercising at 24 months (median 120.4 min/week).
- **Fix:** Label it 'adults 70+, fall rate' and rest the steady minute on Strong, Steady and Straight (Brooke-Wavell 2022) instead.

### Minor · m9 · contradiction

- **Doc and section:** `programmes appendix vs main doc decision 5`, §5 Fix before linking (1169-1170)
- **The doc says:** 'The diary's data-driven hormone pointer (lotHot >= 2) becomes a fixed card; the palpitations line becomes a fixed red flag.'
- **Issue:** This edits a reviewed pillar-1 feature in meno.js. Decision 5(a), the recommended option, keeps signals from her records in pillar 1 and only keeps them out of the programme layer.
- **Evidence:** meno.js 267-275; main doc 591-601.
- **Fix:** Make it conditional: if decision 5(a), leave meno.js as is and simply don't link to it from the programme; if 5(b), convert it.

### Minor · m10 · minimalism

- **Doc and section:** `programmes appendix`, §8 Who (1683, 1686-1688), open question 1835
- **The doc says:** At the trying stage every goal runs Getting ready, and PMOS gets a 'PMOS version' with the cycle plan's routines.
- **Issue:** This moves PMOS women who are trying off the Mohit-approved V35 PMOS plan onto a near-copy, which then needs new review.
- **Evidence:** plan.js 1076 (PMOS or goal pmos gives the approved plan title); CLAUDE.md (PLAN_RELEASE approved 23 Oct).
- **Fix:** Keep the approved PMOS plan for PMOS women who are trying, and add the folic-acid add-on plus the doctor-first card (the alternative in open question 1835).
- **Checked:** The doc already raises this as open question 1835, with changing the mapping as its recommendation; this finding argues for the alternative it lists. That is a valid disagreement, not a missed issue.

### Minor · m12 · gap

- **Doc and section:** `programmes appendix`, §8 Hand-off (1702); §6 fixes (1221); preg.js plan item `folic`
- **The doc says:** Getting ready carries 'the folic acid row (to 12 weeks)' into pregnancy; in trimester 1 the iron goal 'gets folic acid'.
- **Issue:** A woman could see up to three folic acid items at once: the carried row, the pregnancy plan's 'folic' due item (weeks 0-12), and the iron-goal step.
- **Evidence:** preg.js 922 `{ id: 'folic', w: [0, 12] }`.
- **Fix:** One folic acid record. A tick there marks preg.js's 'folic' item done, and the iron goal's trimester-1 step becomes iron food only.

### Minor · m13 · code-fact

- **Doc and section:** `programmes appendix`, §6 Her measure (1335) and Results (1344)
- **The doc says:** Check-ups count 'the sugar test' in its window; results read 'done on time / done late / still to ask'.
- **Issue:** The reviewed pages say the 75 g test is done at the first visit and again at 24 to 28 weeks, but only the second counts. 'Done late' can read as blame where access is poor.
- **Evidence:** preg.js 135 sug_how ('done at the first visit and again at 24-28 weeks'); preg.js 932 ogtt window [24, 28].
- **Fix:** Count the first-visit test as part of anc1. Use 'done' and 'still to ask' only.

### Minor · m14 · gap

- **Doc and section:** `programmes appendix`, §6 fixes (1222) and Part B (1357-1358)
- **The doc says:** 'Risk marks map to tiers in one table.'
- **Issue:** The table is not in the appendix. The MCP marks don't map cleanly: r_tw 'Twins or more' can't tell triplets (red at any week) from twins (red after 28); r_gdm doesn't say whether the sugar is controlled; r_hr 'high-risk' and r_prev are not mapped.
- **Evidence:** preg.js 194-202 (r_hr, r_bp, r_an, r_gdm, r_cs, r_tw, r_prev, r_age, r_oth).
- **Fix:** Write the table into the appendix. r_hr gives at least amber; r_tw asks one follow-up (twins or three+); r_gdm asks 'on tablets or insulin, and told it's not under control?'.
- **Checked:** Part B's red and amber lists (1357-1358) cover r_bp, r_an, twins after 28 or triplets, uncontrolled sugar and r_cs. Still, there is no table covering r_hr, r_prev, r_age or r_oth, and r_tw and r_gdm need follow-up answers to map.

### Minor · m15 · feasibility

- **Doc and section:** `programmes appendix + main doc §0`, Order of programmes 5-8 (main doc line 59-60, table 378-381)
- **The doc says:** Order: Midlife, My pregnancy, After the birth, Getting ready.
- **Issue:** Getting ready is the smallest (2 to 4 code days, about 1,550 words, no poses, no physiotherapist) and its main value (folic acid in the first fortnight) is time-critical. Midlife is the largest and needs the two reviewer roles that are not yet named.
- **Evidence:** Main doc table 378-381 and word counts 383-384.
- **Fix:** Among 5 to 8, consider Getting ready, then After the birth, then My pregnancy, then Midlife last, once its v1 is cut back (M8).
- **Checked:** Small correction: Getting ready still needs one of the two unnamed roles, a psychiatrist or psychologist for the waiting-week cards (reviewers line in §8), unless the waiting-week step is cut. Its first-fortnight urgency is about her timeline, not a reason in itself to release it first. Getting ready is still the cheapest of 5 to 8, so the reorder is a reasonable suggestion.

## Programmes 1-4 (25)

### Blocker · P14-01 · safety

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 2 Stronger blood, Daily steps 'Your period today' (line 482); 1 Easier periods 'How is the pain today?' (line 281)
- **The doc says:** "3 taps, the same for pads and cloth: 'Did it soak through within 1 to 2 hours?' yes/no; clots none / small / ₹10 coin or bigger ... Diary fields existing; per-day storage new"
- **Issue:** The new period-day notes ask exactly the questions that trigger core's reviewed warnings in the diary sheet: soaking every 1 to 2 hours or ₹10-coin clots trigger r2, and "Couldn't do my day" triggers r_pain. No section says the notes show those warnings.  The main doc's diary-independence test requires identical red-flag cards for diaries that differ only in health values. So a builder following the spec would ship a note that records 'soaked within 1-2 hours' every evening and shows nothing.  Main doc 3.4 says period-day logs open the diary's own sheet (S.openLog). But the heavy note's fields (changed at night, couldn't do my day) are not the sheet's fields, so both statements can't be true.
- **Evidence:** - `app.js:2536`: the diary sheet shows `t('r2')` when `d.pads === 'pads_4' || d.clots === 'clots_2'`, and `t('r_pain')` when `d.pain === 'pain_3'`. - `app.js:54`: the r2 text ("see a doctor this week ... dizzy or breathless: see a doctor today, or call 112"). - Main doc line 216: "Period-day logs open the diary's own sheet (S.openLog), so the diary is the only writer." - Main doc line 285: "programmes link, never recompute". - Main doc lines 475-476: the independence test ("identical doctor and red-flag cards every day").
- **Fix:** Add one rule to appendix A and main doc 3.9: any surface that collects a flow or pain value shows core's reviewed warning for that value (r2, r_pain), through one shared core function. The independence test whitelists those core warnings and checks that they appear.  Either: - add the heavy note's fields to the diary sheet and open S.openLog, or - have the note call the shared function.  Add a `fieldtest`/`notices` test: answering "yes, soaked" in the note shows r2.
- **Checked:** The heavy note's gap is real, but parts of the finding are overstated, so it should be major, not a blocker. Main doc 3.9.2 already says "The diary's reviewed warnings stay core's (pads_4, clots_2, pain_3); programmes link, never recompute", so the needed rule mostly exists and only needs making explicit for the period note. The pain tap is already handled: appendix line 360 shows the stopsDay card on "Couldn't do my day". The real gap is the heavy note (line 482): its "soaked within 1-2 hours" and "₹10 coin" answers are wired to nothing. Its 'got in the way: couldn't do my day' is a bleeding-impact option, not the diary's pain field, so it is not what triggers r_pain. The clash with 3.4 (S.openLog) stands: the sheet has no 'changed at night' field.

### Major · P14-02 · contradiction

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md`, 3.1 tag table (line 168), with triggers in appendix sections 1, 2 and 4
- **The doc says:** health value (pain level, flow, Hb, mood): steps "Only to offer a choice"; doctor cards, red flags, offers "Never"
- **Issue:** The programmes break their own main safety rule.  **Doctor cards from health values:** - Pain line 282: a 'harder' look-back shows the doctor card. - Pain line 360: a pain tap at "Couldn't do my day" shows the stopsDay card. - Heavy line 562: "very heavy periods with PMOS or a high weight" shows a womb-lining card. - Pelvic line 938: "Repeat infections (2 in 6 months)" shows a doctor card.  **Steps gated silently by health values:** - Heavy line 481: the walk opens only after "no dizzy tick in 7 days". - Heavy line 487: Strength unlocks only after no dizzy or breathless check-in in 7 days.  The taxonomy also sorts by where the data comes from, not what it says. An intake answer `ans:pain=stop` may trigger a card; the same fact logged as a pain level may not. CDSCO reads intended use from the whole product, so this split won't hold up.
- **Evidence:** - Main doc line 168 (tag table) and line 170 ("the main safety rule"). - Appendix lines 282, 360, 481, 487, 562, 938. - Main doc line 593: "doctor prompts computed from her diary values are what CDSCO's 2026 guidance treats as triage".
- **Fix:** Restate the rule by what the trigger computes: - **(a) Allowed in programmes ('inform'):** a fixed reviewed line shown whenever she reports that one sign, anywhere. - **(b) Pillar 1 only (decision 5), with doctor-set triggers:** anything that counts, compares or combines her values across days (2 of 6 periods, 2 in 6 months, 7 dizzy-free days, noChange).  Then rewrite the six triggers: - The stopsDay card shows on the tap (type a). - The dizzy gate becomes an offer ("Dizzy today? Do the rest routine instead") plus anaemiaMove. - Drop 'high weight' and '2 in 6 months', or move them to pillar 1.
- **Checked:** The contradiction is clear only for the two dizzy-tick gates. Lines 481 and 487 lock the walk and Strength until there has been 'no dizzy tick in 7 days', and main doc 8.2 and decision 6 say health values 'may offer a change, never make it'. Line 360 (a pain_3 tap shows a card) is arguably the 'link' that 3.9.2 allows for pain_3. Line 282's easier/same/harder look-back is a tap on a fixed list, which the tag table allows. Lines 562 and 938 never say what triggers them; PMOS and '2 infections in 6 months' could be her own answers. The CDSCO argument is opinion, not something the docs show.

### Major · P14-03 · feasibility

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 1 Easier periods: Move (line 275), Period yoga (line 279), Pain window (line 375)
- **The doc says:** Move: "3 days she picks, not in her pain window ... +5 when all 3 sessions done ... aims at about 90 minutes a week by week 8"; Strength "2 of her 3 move days"
- **Issue:** **The pain window takes out a week of moves every cycle.** It starts 5 days before her likely start and lasts up to 7 days, so every cycle loses a full week of moves. That contradicts the main doc's own principle that "Exercise never gets 'harder' or 'gentler' by phase" (line 122).  **Period yoga can never be scheduled.** It is set as "one move day in the 5 days before her likely start", which falls inside the window where moves are excluded.  **The two growth rules disagree.** Main doc 3.6's generic adaptive rule ("Up one step after 5+ days followed; same after 3 to 4; down after 2 or fewer") can never step up a 3-day-a-week step.  **Strength may cut the dose in half.** Strength (8 minutes, lesson 5) "on 2 of her 3 move days" is ambiguous: replace or add? If it replaces walks, the 90-minute dose is roughly halved.
- **Evidence:** Probe `/private/tmp/claude-501/-Users-mohitkumar-Desktop-QuraSakhi-sakhi/b9bf9384-58ca-43bf-bc4c-c16065541e84/scratchpad/plansreview/p1to4/move-sim.mjs` (perfect adherence, Mon/Wed/Fri, 28-day cycles): - Each cycle has a plan week with 0 of 3 sessions (for example weeks 2, 6 and 10). - Main doc generic rule: the target stays at 10 minutes (20 to 30 minutes a week). - Pain rule with Strength replacing walks: weeks 5 to 12 average 40 minutes a week. - Only with Strength added on top: about 83 to 105 minutes a week.  Source check: Xiang 2025 (PMID 40078380) recommends sessions over 30 minutes and at least 90 minutes a week.
- **Fix:** - Keep Move on her chosen days except actual pain days (her tap, or logged bleeding with pain at level 2 or more), and offer a lighter day on those. - Make Period yoga a kit option, not a move day. - Say whether Strength minutes are added to, or count towards, the 90. - Add a `perWeek` growth word (sessions done out of sessions scheduled) with its own `kit.mjs` test, instead of reusing the daily 5-of-7 rule.
- **Checked:** Most of this holds, but 'Period yoga can never be scheduled' misreads the doc. The priority line (269) is 'that day's move or Period yoga', so Period yoga is the move-slot routine on one of her picked days in the window, a separate step not gated by !window:pain. 'A plan week with 0 of 3' depends on how the cycle falls against the plan weeks. The general point holds: any 7-day window contains each of her 3 chosen weekdays once, so about 3 sessions are lost per cycle, over 1 or 2 plan weeks. Line 376 ('On a pain day the kit replaces Move') also contradicts line 275 and the spec's if: ['!window:pain']. The clash with line 122 is arguable, since the doc counts windows as body-timed care, not cycle phases.

### Major · P14-04 · safety

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 1 Easier periods, lesson 2 (line 297)
- **The doc says:** "Warmth: hot, not boiling, water; check the bag for leaks; wrap it in cloth ..."
- **Issue:** 'Hot' contradicts the reviewed cramps routine ("Warm, not hot"), and the appendix says the heat-safety lines "join its warmth step" (line 322). So both phrases would sit side by side.  The evidence supports low heat. The appendix's own open question (line 425) says the trials used low heat for hours and a hot water bag is hotter. Jo and Lee 2018 pooled heat wraps and pads, and the appendix notes burns in one trial (line 415). Hot water bags are a common source of contact burns, and the bank needs a heatInjury line at all because of them.
- **Evidence:** - `web/mods/relief.js:149`, relief_c1_p: "Put warmth on your lower belly ... Warm, not hot." - `web/mods/periods.js:217`: "wrapped in a cloth so it does not burn". - Jo and Lee 2018 (PMID 30389956, fetched): heating pads vs painkillers SMD -0.72, "relatively few trials with small sample sizes". - Appendix line 425.
- **Fix:** Reuse `@relief:c1_p` ("Warm, not hot") and add the safety lines that don't conflict: never boiling water, wrap it, check your skin after about 20 minutes, never sleep on it, no heat on numb skin.  The physiotherapist sets the duration.
- **Checked:** The wording conflict is real, but it is minor, not a major safety issue. In the gist, 'hot, not boiling, water' is about the water that fills the bag, which is standard hot-water-bottle safety advice. The same gist already says wrap it in cloth, check your skin, never sleep on it, and no heat on numb skin. Appendix line 425 already sends heat duration and temperature to the physiotherapist and doctor. The fix is just to keep the reviewed 'Warm, not hot' next to the 'not boiling water' line.

### Major · P14-05 · gap

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 1 Easier periods, red flags (line 108 and Doctor moments line 359); B.1 bank
- **The doc says:** Pain's bank list: lateOneSided, torsion, severeBelly, feverIll, afterProcedure, feverPain, stopsDay, otherDays, afterSex, iud, urineBlood, painkillerHarm, heatInjury, anaemiaMove, unsafeHome
- **Issue:** The reviewed signs that point to endometriosis or adenomyosis are missing for women who have no diagnosis yet: - pain during or after sex; - pain when passing stool or urine; - pain that has got worse over the years, or periods that became heavier.  The bank's `afterSex` covers *bleeding* after sex, not pain. These signs appear only in the endometriosis-swap lesson (line 309), which is shown to women already diagnosed. The undiagnosed woman, who most needs a prompt to get assessed, doesn't see them.  The earlier outline listed them as red flags (programmes-every-condition 4.1), and the NICE CKS secondary-dysmenorrhoea check is marked "Not checked" (line 430).
- **Evidence:** - `web/mods/periods.js:229-232`, the reviewed "Not normal: see a doctor this week" list: "Pain during or after sex, or when passing stool or urine" and "Pain that has got worse over the years, or periods that became heavier or irregular". - Appendix B.1 line 146: `afterSex` = "Bleeding after sex or between periods". - `docs/programmes-every-condition-2026-10-24.md` §4.1, doctor moments ("pain during sex, pain passing urine or stool").
- **Fix:** - Add a bank sign `endoSigns` at This week, with its wording referenced from periods-pain's reviewed list (@ref). - Put it in Easier periods' 5 to 7 shown flags and in lesson 3, "Is my pain the usual kind?". - Run the NICE CKS secondary-dysmenorrhoea check before §20.

### Major · P14-06 · contradiction

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, B.1 red-flag bank (lines 124-163); 1 Doctor moments (line 363); 4 Doctor moments (line 926)
- **The doc says:** "Urgencies are proposals for the MBBS gynaecologist, reconciled with the reviewed core lines (s1 to s6, r2, r_pain, explain.js levels, relief.js doctor lines, post.js flagsOf, cond.js TORSION)"
- **Issue:** Several urgencies are not reconciled with the reviewed lines. The bank also contradicts the heavy programme's own table: - `soak` is Today (line 138), but r2 and heavy's own table (line 555) say this week; `soak` also drops r2's "bleeding more than 8 days". - `soakDizzy` is Now, but r2 and heavy's table (line 556) say Today. - `faint` is Now, but cond-anaemia says "get medical help today; call 112 if it is severe". - A bulge stuck outside is "Now if very painful", but intimate.js says Today. - `midlifeBleed` is for 40+, but heavy uses it from 45+ (line 559). - `lowMood` is This week, but explain.js says this month.  B.1 also uses 'Within 2 weeks' (4 times), 'Stop' and 'Crisis sheet'. None of these is one of the 'Four urgency levels' in main doc 3.9.4.  Pain's period-3 card says "needs a doctor now" inside a This-week card, where 'Now' means 112.
- **Evidence:** - Probe `/private/tmp/claude-501/-Users-mohitkumar-Desktop-QuraSakhi-sakhi/b9bf9384-58ca-43bf-bc4c-c16065541e84/scratchpad/plansreview/p1to4/flags-count.mjs`: 18 distinct urgency strings in B.1. - `app.js:54` (r2). - `web/mods/cond.js:549` (the cond-anaemia line). - `web/mods/intimate.js:369` ("Today: ... the bulge is stuck outside, very painful or bleeding"). - `explain.js` MOOD_SEE ("Talk to a doctor this month"). - `periods.js:228` (stopsDay is already "this week" in reviewed text). - Main doc line 288.
- **Fix:** - Put a reconciliation table at the top of §20: sign, reviewed line(s) and their urgency, proposed urgency, the gynaecologist's decision. - Add 'Within 2 weeks' as a fifth level, or map it to one of the four. - Add a `progs.mjs` lint that bans the word 'now' outside Now-level cards. - Restore r2's '>8 days' in `soak`.

### Major · P14-07 · feasibility

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md`, 3.9 item 5 (line 291), with the appendix Doctor moments in sections 1 to 4
- **The doc says:** "5 to 7 red flags per programme from the bank: at the start, in lesson 1, in 'When to get help', and on every routine"
- **Issue:** Every programme names 8 to 16 signs: - **Pain:** 15 bank ids. - **Heavy:** 13 bank ids, plus 3 unbanked lines. - **PMS:** 8 bank ids, plus 3 extras. - **Pelvic:** 7 bank ids, plus about 9 unbanked lines.  Pain's own worked example lists a different set of 6 (line 108).  The content estimates assume far fewer: "about 6 pictograms" for pain (line 397), a picture card "in 4 levels" (B.6), and a teach-back with about 5 low-literacy women. 15 signs per programme won't fit those, and red flags "on every routine" won't fit a phone screen.
- **Evidence:** - Probe `flags-count.mjs` output: pain 15, heavy 13, PMS 8, pelvic 7 bank ids. Counting the unbanked rows in the Doctor moments tables (appendix lines 926-938, 559) brings heavy and pelvic to about 16. - Main doc line 291. - Appendix lines 108, 397, 400, 216.
- **Fix:** For each programme, choose the 5 to 7 'shown' flags: the ones lessons, routines, pictograms and the teach-back carry. Keep the rest in 'When to get help' behind a 'More signs' row.  Size the pictogram and teach-back budgets to those 5 to 7.
- **Checked:** Small misread: B.6's 'in 4 levels' means 4 urgency groups, not a limit of 4 signs. The main point stands: each programme names 8 to 16 signs against main doc 3.9.5's '5 to 7', with no rule for which ones are shown on routines and in lesson 1.

### Major · P14-08 · safety

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, B.1 painkillerHarm and blackStool (lines 145, 161); B.6 tablet lesson (line 220); 1 lesson 6 (line 301); 1 Add-ons (line 387)
- **The doc says:** painkillerHarm: "Black stools, vomiting blood or severe stomach pain after painkillers; wheezing after a painkiller: Now; wheezing: stop it, Today"
- **Issue:** Painful and heavy periods run as Easier periods plus the iron add-on (main doc line 339).  **The black-stools lines conflict.** The shared tablet lesson says black stools are normal with iron. Lesson 6 and painkillerHarm say black stools after a painkiller mean hospital now. A woman taking both will either be sent to hospital for normal iron stools, or learn to ignore black stools and miss a painkiller bleed. blackStool's "began before iron" test can't help a woman who started both together.  **A medicine-reaction line was lost.** The bank drops the reviewed allergy line (rash, swelling or fever after a painkiller). It also rates wheezing 'Today'. Trouble breathing, or swelling of the face or lips, after a tablet should be Now.
- **Evidence:** - `web/mods/iron.js:48` and `web/mods/cond.js:531`: "Black stools are normal with iron". - `web/mods/periods.js:226`: "If a painkiller gives you a rash, swelling or fever, stop it and see a doctor." - `web/mods/cond.js:535`: "rash, swelling or trouble breathing: stop and see a doctor". - Appendix lines 145, 161, 220, 235, 301, 387.
- **Fix:** - Replace both black-stool lines with one bank line that tells them apart by look and symptoms: "Stools black and sticky like tar, or with dizziness, or vomiting blood: Now. Dark or black ordinary stools on iron tablets are expected." - Add a bank sign `medReaction`: rash, swelling of the face or lips, wheeze or trouble breathing after a tablet. Stop it; trouble breathing or swelling: Now; rash alone: Today. - The gynaecologist signs both.

### Major · P14-09 · feasibility

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 2 Stronger blood: Her measure (line 533), Results and what to expect (lines 544-549), Doctor moments (line 561)
- **The doc says:** Main measure: "days heavy bleeding got in her way, each period ... and bleeding days", compared before vs since
- **Issue:** The programme's own 'what to expect' says "tablets and food don't lighten the bleeding itself". Its actual levers are Test, Treat, Talk: the Hb test, the tablets, the doctor visit.  So for most women the headline result can't change in 12 weeks unless a doctor treats the bleeding. The results page will read as 'no change' by design, and the week-12 'Still heavy?' card fires for almost everyone.  The measure tracks something the programme admits it doesn't move.
- **Evidence:** - Appendix line 548: "tablets and food don't lighten the bleeding itself, but a doctor can treat heavy periods". - Line 533 (main measure). - Line 544 ("before vs since, like with like"). - Main doc line 128, lesson 13 ("One measure at its natural rhythm"). - Main doc line 274 (heavy's measure in the table).
- **Fix:** - Make the main measure the care steps done, with dates: Hb tested, doctor seen, tablet days on schedule, retest booked or done. - Make bleeding-impact days the doctor-summary line and a plain record ('for your doctor'), not a result she is meant to improve. - Update main doc 3.8's table to match.
- **Checked:** Two parts are overstated, and one makes the problem worse. The programme does have some levers on impact days: lesson 6 'Managing a heavy day' (night pad, thicker cloth, what to carry) can cut leaks through clothes, and treated anaemia may help with 'couldn't do my day'. So 'can't change' is too strong. The week-12 'Still heavy?' card is shown to every woman by design (line 561), whatever her measure says. Making it worse: line 573 resets her starting point when treatment changes, so even a doctor's treatment won't show as a before-vs-since change. Care steps done, which the fix proposes as the main measure, are already a secondary measure (line 537).

### Major · P14-10 · code-fact

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 2 Stronger blood: 'Get a free Hb test' (line 477), Her measure (line 535), Reuse (line 584)
- **The doc says:** Hb step "Done on 'Done' or a saved number"; "her Hb exactly as she typed it, with date and her report's range"; measure source `mod:cond.hb`; reuses `cond-labs`
- **Issue:** Hb numbers are entered through `cond-labs`, which is one of the 11 TRIAGE tools held back in tester and release builds. Its links are removed from every page there.  So in any non-pilot build: - the 'saved number' path and the fixed 'below 8' education line next to every Hb entry have nowhere to appear; - 'Hb first and latest' in results stays empty.  The journey audit requires tests in both pilot and tester builds for exactly this reason.
- **Evidence:** - `app.js:983`: `const TRIAGE = [..., 'cond-labs', ...]`. - `app.js:984-985`: triageHidden and dropTriageLinks. - `web/mods/cond.js:564`: `#cond-addhb` → `S.setHash('cond-labs')`. - `docs/journey-audit-2026-10-24.md` line 266: "tester builds hide the triage tools many links depend on".
- **Fix:** Either: - give the programme its own small Hb entry (number, date, unit hint, "What did your ANM or doctor tell you?") in cond's store outside cond-labs, or - take Hb-only entry out of TRIAGE, with the lawyer's view.  Add a tester-build case to the programme's kit test.
- **Checked:** Small correction: the Hb step still completes on 'Done' ('never blocks the plan'). What's lost in tester and release builds is the saved number, the fixed Hb line beside it, and Hb first and latest in results.

### Major · P14-11 · contradiction

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 2 Stronger blood, Her measure (lines 537-538); Daily steps (lines 481, 487)
- **The doc says:** "low-energy days a week from one new check-in chip row ('Energy today: good / ok / low', plus 'Dizzy or breathless today')"
- **Issue:** The journey audit's critic ruled this chip out. Dizziness or breathlessness with heavy flow is itself a red flag (`soakDizzy`, `anaemiaMove`).  As a daily chip it becomes a count: - she can log a red-flag sign every evening and get no answer; - the same tick then silently gates the walk and Strength, a health value changing her steps (see P14-02).
- **Evidence:** - `docs/journey-audit-2026-10-24.md` lines 272-273: "No 'Tired or dizzy' chip: dizziness with heavy flow stays a red-flag line". - Appendix B.1 lines 137 and 163. - Appendix lines 481, 487, 538.
- **Fix:** - Drop the 'Dizzy or breathless today' chip. Dizziness stays a bank sign she taps, which shows `anaemiaMove`/`soakDizzy` straight away. - Keep 'Energy today' only if Mohit revisits the journey audit's rule. - Make the walk and Strength gates offers, not silent locks.

### Major · P14-12 · safety

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 3 Calmer cycle, lesson 7 (line 691); B.1 harm (line 157); main doc 3.9 crisis sheet (lines 306-307)
- **The doc says:** Lesson 7: "If you fear you'll hurt your child or anyone, put the child somewhere safe, step away and use 'Need help now?'"
- **Issue:** The crisis sheet offers two choices: - "Thoughts of harming myself" (14416, 112); - "Someone at home hurts or scares me" (181, 112).  Neither fits a woman who fears she will hurt her child or someone else. The lesson sends her to a sheet with no matching choice. The bank's `harm` sign ("harming herself or her baby") routes there too.
- **Evidence:** - Main doc lines 306-307: the crisis sheet's two neutral choices. - Appendix line 157 (`harm`: "Thoughts of harming herself or her baby: Now (crisis sheet)"). - Appendix line 691.
- **Fix:** Change the first choice to "Thoughts of harming myself or someone else, including my child" (Tele-MANAS 14416, 112), worded by the psychiatrist or psychologist.  Add a `loss.mjs`/`kit.mjs` check that every lesson or bank line that routes to the crisis sheet has a matching choice.

### Major · P14-13 · rule

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 3 Calmer cycle, fixes (lines 634-635) and Doctor moments (line 738)
- **The doc says:** "An active safety question ... asked at the reveal and once each calm week": "In the last 2 weeks, have you had thoughts of harming yourself?", "Now on yes", never stored
- **Issue:** **It conflicts with the evidence-map gate.** This rebuilds the PHQ-9 item-9 path, with the same 2-week frame. The evidence map holds that path for M0 (an MBBS partner, and Mental Healthcare Act concerns because BAMS doctors are not mental health professionals). The pilot's lawyer exemption covers CDSCO, not this.  **The evidence comes from a different population.** Eisenlohr-Moul 2022 (checked) surveyed 599 people recruited from PMDD support groups and social media, with prospectively confirmed PMDD. Most women who pick 'calmer days before your period' are not that group.  **The routing is too blunt.** Every 'yes' goes to the Now tier, so passive thoughts are treated like an emergency. With nothing stored and no person in the loop, no one follows up. And the question is asked up to 13 times a year, including on shared phones.
- **Evidence:** - Memory file `reference_sakhi_evidence_map.md`: "PHQ-9/GAD-7 ... wait for M0 ... MHCA (BAMS ≠ mental health professional) + item-9 crisis path". - Eisenlohr-Moul 2022, PMID 35303811 (fetched): "invited ... through online support groups for PMDD and social media posts", 72% lifetime active suicidal ideation. - Appendix lines 634-635, 738, 654 (keep going to month 12).
- **Fix:** - Hold the active question until the psychiatrist or psychologist reviewer is named and the M0 gate is decided. - Until then, keep the always-visible 'Need help now?' and the fixed lines in lessons 1 and 11. - If it is kept later, split the answers:   - "right now, or I might act on them" → 112 or 14416 now;   - "in the last 2 weeks" → Tele-MANAS today. - Ask once per cycle at most, never on a discreet or shared-phone screen.
- **Checked:** Two corrections. 'Now on yes' routes to the crisis sheet, whose first option is Tele-MANAS 14416, a fitting 24-hour line for passive thoughts too, so 'treated like an emergency' is overstated. The doc already requires psychiatrist or psychologist approval (line 633) and labels Eisenlohr-Moul's sample as self-selected (line 781). The parts that stand: the question is close to PHQ-9 item 9 (the same 2-week frame); the evidence map holds the item-9 crisis path for M0; and it is asked roughly every cycle to month 12, with no shared-phone rule.

### Major · P14-14 · safety

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 4 Strong pelvic floor, Add-ons (lines 954-955); main doc 3.6 'level' (line 233); 7 After the birth (line 1484)
- **The doc says:** "One trainer, one store and one level across all stages, so her level carries from pregnancy into After the birth"
- **Issue:** A woman at L6 or L7 (8- to 10-second holds near full effort) at 39 weeks would resume those holds in the first days after a tear, an episiotomy or a C-section.  After the birth limits her position (lying or sitting to day 42, line 1484), but the effort and hold time carry over. That goes against the reviewed after-birth line, "Start gently when it feels comfortable, even after stitches or a C-section", and the usual practice of restarting gently after a birth.
- **Evidence:** - `web/mods/post.js:258` (pf_p): "Start gently when it feels comfortable, even after stitches or a C-section." - Appendix lines 847, 955, 1484. - Main doc line 233: "carries across a chain".
- **Fix:** - A birth resets her to L1 (lying or side-lying, short holds). Surgery and the mesh/radiation hold reset her the same way. - After the 6-week check or her doctor's OK, give her a fast path back to her old level. - The physiotherapist confirms; add a `kit.mjs` example for a pregnancy-to-birth chain.
- **Checked:** The doc already lists 'levels before the 6-week check' as an open physiotherapist question (line 990), so this is about making the default safe until that's answered. In pregnancy, 'sitting or side-lying only' (line 847) may stop her reaching the standing levels L5 to L8, so her carried level may be L4 rather than L6 or L7. The After the birth table also contradicts the carry-over: it schedules 'levels 3 and 4' in weeks 7 to 12 (line 1469).

### Major · P14-15 · feasibility

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 4 Strong pelvic floor, 'Get your squeeze checked, free' (line 856); Open questions (line 994)
- **The doc says:** "The care team: a government physiotherapist or doctor, her ASHA or ANM, Ask Qura"
- **Issue:** Checking a squeeze needs a trained clinician, usually with an internal or perineal exam. An ASHA isn't trained for it, and a phone call with Qura can't do it.  The appendix's own open question admits nobody knows who can do it in practice. The research it cites shows women already overrate their own squeeze, so a false 'checked' is worse than no check.
- **Evidence:** - Appendix line 978: "24% correct vs 71% sure (Nepal 2025)". - Line 994: "Who can do a free squeeze check in practice ... can an ANM or AAM doctor check externally". - Line 856.
- **Fix:** - List only a government gynaecology OPD doctor or a women's-health physiotherapist, with "you can ask for a woman doctor". - For women who can't go, offer the shared 5-mistakes check (no internal self-exam, per main doc 7). - Remove ASHA and Ask Qura from this card.
- **Checked:** Partly overstated. Reviewed text already uses the ASHA or ANM as a navigator ('Your ASHA or ANM can help you get there', intimate.js), so listing her as a route to the check can stay if the wording makes that clear. The valid core: neither an ASHA nor a phone call with Qura can check a squeeze, and the card doesn't say who actually does the check.

### Major · P14-16 · rule

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 4 Strong pelvic floor, Doctor moments (line 938)
- **The doc says:** "Repeat infections (2 in 6 months), thirst with weight loss | Routine | See a doctor; a sugar test at the AAM"
- **Issue:** Thirst with weight loss leading to a sugar test is a diabetes prompt. That breaks Mohit's rule of reproductive health only, with no new conditions; the evidence map explicitly keeps diabetes risk screening out.  '2 in 6 months' counts her history, which makes it a computed signal (see P14-02).  The urgency is also wrong: if thirst with weight loss is real it can be serious, so 'Routine' is too slow.
- **Evidence:** - `CLAUDE.md`, Mohit's rules: "Reproductive health only. No new conditions". - Memory file `reference_sakhi_evidence_map.md`: "no IDRS/CBAC diabetes risk". - Appendix line 938.
- **Fix:** - Keep a fixed line: "Urine infections that keep coming back: see a doctor". - Drop the thirst, weight-loss and sugar-test part.
- **Checked:** '2 in 6 months' may be her own answer on the safety screen rather than a count from her records, so the computed-signal point (P14-02) is unproven. The scope and urgency points stand: 'thirst with weight loss' with an AAM sugar test is a diabetes prompt, and 'Routine' is too slow if it's real.

### Major · P14-17 · minimalism

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 1 Routines (lines 313-320); 2 Routines (lines 517-518); B.4
- **The doc says:** New routines: Unwind (belly breathing 4 in 6 out, tense and release feet to face, knee rocking, side-lying rest), Period yoga (butterfly, cat-cow, child's pose, reclined butterfly, knees to chest, pelvic tilt, bridge), Rest and restore (knees to chest, legs on a chair, reclined butterfly, side-lying rest, slow breathing)
- **Issue:** **Unwind and Rest and restore are mostly reviewed steps already.** Unwind is about 80% relief-sleep's reviewed steps plus relief-cramps' knee rocking. Rest and restore is Unwind again.  **Period yoga repeats the existing reviewed Cycle care yoga,** with a chair swap. It also keeps only one of the three poses Rakhshaee 2011 tested (cobra, cat, fish, done before the period), while the existing routine already includes cobra.  The result is three new routines, about 4 new poses, a physiotherapist sheet section and Hindi, mostly for content that has already been reviewed.
- **Evidence:** - `web/mods/relief.js:160` (s2: "Breathe in for 4, and out slowly for 6"). - `web/mods/relief.js:161` (s3: "Squeeze your toes ... legs, hands, shoulders"). - `web/mods/relief.js:151` (c3: "hug your knees ... Rock gently"). - `web/mods/plan.js:300+`: `R.cycle` with child (chair swap), butterfly, camel, cobra, locust; plan_r_cycle 'Cycle care yoga' at line 1840. - Rakhshaee 2011, PMID 21514190 (fetched): "Cobra, Cat, and Fish Poses ... at luteal phase".
- **Fix:** - Build one shared 'Rest and unwind' in `_bank.js` from reviewed steps by @ref (new words only for side-lying rest and legs on a chair). Use it in pain, heavy and pelvic relax-first. - Replace Period yoga with Cycle care yoga, plus the knee and back swaps. - Only cat-cow stays a candidate new pose. - This saves about 2 routines, about 3 poses and one physiotherapist review section.
- **Checked:** Unwind does reuse reviewed steps heavily. Two parts are overstated: - Rest and restore is not 'Unwind again': it adds legsChair and recbut, sharing only side-lying rest, slow breathing and knees to chest. - Period yoga shares about 5 of its 9 steps with Cycle care yoga (warm-up aside), but it deliberately leaves out the tummy-lying cobra and locust and the camel, because there is 'no tummy-lying on bleeding days' (line 320). So the proposed fix, 'Replace Period yoga with Cycle care yoga', would put tummy-lying poses on pain and bleeding days. A bleeding-day version of Cycle care yoga would avoid that. The Rakhshaee point holds: the trial tested cobra, cat and fish poses in the luteal phase.

### Major · P14-18 · minimalism

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 4 Strong pelvic floor: Squeeze sets (line 847), Phases (lines 831-835), Rewrite for review (lines 961-963)
- **The doc says:** 8 levels: "L1 lying 3 s ×8; L2 sitting 3 s ×10 + 5 quick; ... L6 8 s; L7 10 s ×10; L8 10 s ×8 to 12 ... A level unlocks after 5 days with a full set"
- **Issue:** **The table rewrites the reviewed trainer without listing what changes.** Reviewed text says a set is 10 squeezes and "A set counts only when all 10 are done", with 10 quick squeezes after each set, and the trainer only offers 3, 5 or 10-second holds. The table needs 6, 7 and 8-second holds, sets of 8 or 12, and 5 quick squeezes.  **The rewrite list misses four reviewed keys.** It omits pf_start, pf_leave and pf_goal (English). It also omits pf_p_preg's "sitting or lying down", which conflicts with the new 'no lying on the back after trimester 1' lint and with "sitting or side-lying only".  **Levels outrun the lessons.** At 5 days per level, standing (L5) arrives around day 21 and L8 by day 36. Lesson 7 'Standing up strong' and standing daily-life practice are fixed at weeks 7 to 8.
- **Evidence:** - `web/mods/post.js:260` ("Start a set: 10 squeezes"). - `web/mods/post.js:269` ("A set counts only when all 10 are done"). - `web/mods/post.js:271` (pf_goal). - `web/mods/post.js:270` (pf_p_preg, "sitting or lying down"). - `web/mods/post.js:793` (`[3, 5, 10]` holds) and `post.js:819` (`reps: 10`). - Appendix lines 834, 847, 871. - Main doc line 471 (the lint).
- **Fix:** - Use 4 levels on the existing 3/5/10-second holds with 10 reps: lying or side-lying, then sitting, then standing, then during a task. Quick squeezes become a toggle. - Tie position lessons to the level she reaches, not to the week. - Add pf_start, pf_leave, pf_goal and pf_p_preg to the rewrite-for-review list. - The physiotherapist confirms.
- **Checked:** The doc covers part of this. Line 810 already says 'position lessons keyed to her level'; it contradicts the lessons table, which fixes lesson 7 at week 7. The prerequisites (line 964) list levels and quick squeezes as trainer changes, and the table is marked 'Physiotherapist to confirm' (lines 847 and 990). pf_goal is on the rewrite list, but only for its missing Hindi sentence. The rest holds: pf_start, pf_leave, pf_goal's English and pf_p_preg's 'lying down' aren't on the rewrite list, and sets of 8 or 12 clash with 'A set counts only when all 10 are done'.

### Minor · P14-19 · contradiction

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 1 Her measure (lines 332-335); fixes (line 239)
- **The doc says:** "painCompare, the diary day view, docportal and the report line read it; explain.js does not. The period sheet's pain fills from the worst pain_day"
- **Issue:** If the period's start event takes the worst `pain_day`, then explain.js reads it anyway: its pain signal fires on pain_3 in 2 of her last 6 periods.  The fill also makes the programme a writer of diary events, contrary to main doc 3.4 ("the diary is the only writer").
- **Evidence:** - `app.js:3352-3353`: `startEv(d).pain === 'pain_3'` over `starts().slice(-6)`. - Main doc line 216. - Appendix lines 239, 334-335.
- **Fix:** Choose one: - (a) the diary writes `pain_day` and the start event's pain, and explain.js may read them (pillar 1, decision 5); or - (b) keep `pain_day` out of start events and out of explain.js.  Then state the choice in step C.
- **Checked:** The cited code is the wrong reader. app.js:3352-3353 is renderPattern, the pattern check: pain_3 in 2 of the last 6 periods. explain.js's own reader is mods/explain.js:144-145: any pain_3 on the latest period's start or start_detail events gives 'pain_severe' at the month level. Either way, filling the start event's pain from pain_day lets explain.js read it. The 'programme becomes a writer' point is weak: step C makes pain_day a diary event, so the diary could do the fill itself.

### Minor · P14-20 · feasibility

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 2 Daily steps (lines 478-481) and Adaptivity (line 567)
- **The doc says:** Tea step "Daily | 2 to 5, then a sub-line"; order: "a due milestone, her tablet, the period note or refill, the food habit, then the walk"
- **Issue:** In weeks 2 to 5, the tablet, the iron food and the tea gap are all daily rows, and the tea row has no place in the stated slot order. With the Hb-test or doctor-visit milestones also due, the 3-row cap means the walk never shows in weeks 1 to 5, and the tea row's position is undefined.
- **Evidence:** - Appendix lines 477-481 and 567. - The add-on version already folds food in as a sub-line of the tablet (line 579: "the tablet tick, with food as its sub-line").
- **Fix:** - Make tea a sub-line of the tablet row from week 2, as the add-on does. - Add a `kit.mjs` example for day 10 that shows which 3 rows appear.

### Minor · P14-22 · rule

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 4 Weekly lessons, crisis link (line 880)
- **The doc says:** "Feeling low or alone because of this? Tele-MANAS 14416 is free."
- **Issue:** This puts a helpline number inside a programme file. That contradicts the appendix's own rule (line 29: "no helpline digits in programme files ({help:crisis} instead)"), and the planned `progs.mjs` helpline-digits lint would fail.
- **Evidence:** - Appendix lines 29 and 880. - Main doc line 471 (the lints include "helpline digits").
- **Fix:** Write it as "Feeling low or alone because of this? {help:crisis}" (or a Tele-MANAS token rendered by core).

### Minor · P14-23 · contradiction

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 3 Who (lines 639, 650); 1 Who (line 250)
- **The doc says:** PMS: "Not offered within 365 days of a birth or while breastfeeding, whatever the stage says"; Pain: "within 365 days of a birth or while breastfeeding with no period back"
- **Issue:** The two exclusions differ, and the PMS one has no end.  Many women breastfeed for 2 years or more with their periods back. Calmer cycle would shut them out for that whole time, while Easier periods lets them in once a period returns. Main doc line 559 says "or while breastfeeding" for both.
- **Evidence:** Appendix lines 250, 639, 650; main doc line 559.
- **Fix:** Use one rule for both: "not within 365 days of a birth, or while breastfeeding with no period back". After that, mood after a birth stays offered beside the programme.

### Minor · P14-25 · rule

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 1 Reuse (line 393); lesson 6 (line 301)
- **The doc says:** Reuse "periods-pain's 'What helps', caution note and 'Not normal' list"; lesson 6 "No medicine names or doses"
- **Issue:** The reused reviewed periods-pain lines name medicines: "ibuprofen or mefenamic acid, or paracetamol ... Take it as the pack or your doctor says".  Stronger blood lists dose-free versions of every reused line (line 587-588). Easier periods doesn't, so reusing these lines by reference would bring medicine names into programme words.
- **Evidence:** - `web/mods/periods.js:220` ("Doctors commonly suggest ibuprofen or mefenamic acid"). - `web/mods/periods.js:226` (caution note). - Appendix lines 301, 393, 587-588.
- **Fix:** List name-free versions of the 'What helps' painkiller row and the caution note for programme screens ("a painkiller your doctor or pharmacist suggests"). The originals stay on the Learn page.
- **Checked:** Small caveat: line 393's '(as the bank source)' may mean the periods-pain lines feed the bank rather than appear word for word. Still, any @mod:key reuse of 'What helps' or the caution note would show ibuprofen and mefenamic acid on programme screens, and Easier periods has no dose-free list like Stronger blood's.

### Minor · P14-26 · safety

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 3 Doctor moments (line 740)
- **The doc says:** "drinking or extra tablets to get through (soon)"
- **Issue:** 'Extra tablets to get through' can mean taking too many tablets, which is a self-harm signal. The urgency word 'soon' isn't one of the defined levels either.
- **Evidence:** Appendix line 740; urgency words at line 25 (Now, Today, This week, Next visit).
- **Fix:** - Split it: "taken more tablets than you should, or thinking about it" → the crisis sheet (Now); "drinking to get through these days" → This week, with a doctor or Tele-MANAS. - The psychiatrist or psychologist words both.

### Minor · P14-27 · gap

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 4 Length and phases (line 826); 'Get checked once' (line 857)
- **The doc says:** "Heaviness: up to 4 weeks of find-it and lying sets before a doctor has seen her, then 16 weeks once she ticks 'a doctor said prolapse'"
- **Issue:** The spec doesn't say what happens in week 5 if she hasn't been examined. Rural women may not reach a gynaecology OPD within 4 weeks, so the track stalls with no steps.
- **Evidence:** Appendix lines 826, 857, 931.
- **Fix:** After week 4, continue at lying and sitting levels with 'Get checked once' still leading, and pause lifting steps. The 16-week extension still opens only after a doctor.

## Mohit's rules (14)

### Blocker · F1 · safety

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md`, 3.10 item 2 (Care after a loss); 6.3 loss.mjs; appendix 8 fixes
- **The doc says:** "Care after a loss in loss.js ... It stores the kind of loss (miscarriage, ectopic with or without methotrexate, molar, abortion, stillbirth, newborn or infant death) ... after methotrexate or a molar pregnancy only once she ticks 'my doctor says I can try again'." (line 317-321)
- **Issue:** This reverses a deliberate privacy rule. loss.js is built so that reading creates no storage and 'nothing on the phone shows she opened these pages', and its pages tell her they save nothing. A saved 'abortion' or 'ectopic + methotrexate' record would sit in localStorage, in her backup file and in 'Show my data' on a phone the doc itself treats as often shared (it cites spousal violence at 22.3%). Disclosure to family is a real harm, especially for an abortion record. The methotrexate/molar gate needs one bit, not the kind of loss.
- **Evidence:** web/mods/loss.js:7-8 ('reading never creates storage ... nothing on the phone shows she opened these pages'); loss.js:44-45 ('These pages are private and save nothing'); app.js:708-709 endPregnancy saves only pregEndedOn; main doc line 126 (NFHS-6 22.3%). Probe (scratchpad plansreview/rules-review/probe.mjs): after visiting loss, loss-types, loss-recovery, loss-grief and loss-again, state.mods.loss is 'absent' and mods keys are [].
- **Fix:** Never save the kind of loss. Choose the follow-up page from her answer in memory for that session only. Save only: the existing pregEndedOn date; one neutral flag set by her own tick ('Wait for my doctor's OK before trying again'), with no reason stored; and the reminder clean-up itself. Keep 'these pages save nothing' true, and have loss.mjs check that no kind of loss appears in state, backup, report or summaries.
- **Checked:** Small corrections. The current app already records that a pregnancy ended without a birth: endPregnancy sets pregEndedOn and also adds a {k:'preg'} span. What the design adds is the kind of loss, including 'abortion' and 'ectopic + methotrexate', and that breaks loss.js's promise to save nothing. 'Blocker' fits as a must-fix before B2 is built, though nothing is built yet. The fix also needs one more neutral bit. 'My baby has died' has to keep baby, feeding and vaccine items off for the rest of the after-birth year (the baby-free recovery check to day 41), so a single 'no baby items' flag must persist alongside the doctor's-OK tick, again with no reason stored.

### Major · F2 · rule

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md + appendix`, 3.2 Release gate; 6.4; 8.1 Regulation row; decisions 4 and 19; appendix A 'tier'
- **The doc says:** Specs have 'tier: habit or condition'; 'approved' specs match their signed record; 'build-apk.sh leaves drafts out of non-demo builds'; 'the lawyer's written view before anything leaves demo builds'.
- **Issue:** Nothing keeps a signed condition-tier programme out of tester or release builds. That covers the 'my doctor said' versions (endometriosis or adenomyosis, fibroids, PMDD, POI, the sugar-in-pregnancy branch), the 16-week prolapse track, 'Low Hb, or told I have anaemia', and the stress/urge/mixed leak tracks. The origin gate holds condition prompts and personalised red-flag alerts until CDSCO's risk class, and the lawyer's exemption is verbal and covers the pilot only. The app already enforces this pattern with FERT_RELEASE and TRIAGE_RELEASE. The doc's own risk row cites CDSCO 2026 example 10 (coaching and tracking to mitigate a disease). A disease-free purpose line can't neutralise a programme whose entry is 'my doctor said endometriosis', because CDSCO reads intended use from the whole product. These variants are not new conditions (cond-endo, cond-fibroids, cond-poi and cond-anaemia all exist); the problem is the regulatory class.
- **Evidence:** web/app.js:646 FERT_RELEASE = false; app.js:982-984 TRIAGE_RELEASE = false and triageHidden(); memory project_sakhi_origin_vision.md lines 17-19 and 31-36; main doc lines 186-193 and 529; appendix line 42; web/mods/cond.js:666-672 (existing condition routes).
- **Fix:** Add one rule and one constant: tier 'condition' specs, every variant, and the leak-type tracks run only where fullTools() is true (pilot and demo), behind CONDITION_RELEASE = false until the CDSCO answer. Tester and release builds get habit-tier versions only. The progs.mjs gate enforces it, with a test in both build flavours.
- **Checked:** 'Nothing keeps it out' goes too far. The doc does have human gates: section 8.1 says 'the lawyer's written view before anything leaves demo builds', and decision 19 asks for an ethics committee's view 'before any condition-tier programme reaches a tester'. What's missing is a build-flavour gate tied to the CDSCO risk class, like FERT_RELEASE and TRIAGE_RELEASE. Once a spec is signed, nothing in the design keeps it out of test or release APKs. The worked example marks the base 'pain' spec itself as tier 'condition', so the fix has to say which habit-tier versions testers get.

### Major · F4 · rule

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md + appendix`, 3.9 routing table and line 304; decision 16; appendix doctor moments in sections 1, 2, 3, 4, 5 and 8
- **The doc says:** "Qura confirms bookings on WhatsApp, so it must confirm in writing that the template never carries the topic." The programmes add Qura offers at week 2, on quiet days, at milestones, on the squeeze-check card, in Midlife's week 2 and on Getting ready's doctor-first card.
- **Issue:** The WhatsApp template is the smaller leak. The integration plan found that when a Sakhi woman books, pays or attends, Qura fires Meta Schedule, Purchase and ConsultAttended events with hashed name, phone and email plus the consult outcome, and that 'nothing about her goes to Meta' holds only with a per-person no_ad_tracking switch. Mohit's 23 Oct decision went ahead without that switch, and CLAUDE.md still says 'Never send health data to Meta'. The programmes add about six new offer points that feed this pipeline. Also: Easier periods' week-2 card offers 'a Qura doctor (Ayurveda)' to women in the endometriosis version, though the doc's own table sends endometriosis to an MBBS gynaecologist and never to herbal advice; Calmer cycle offers Qura on drift inside a mood programme; and the existing topic box invites health detail.
- **Evidence:** CLAUDE.md:104; docs/qura-sakhi-integration-plan-2026-10-23.md:14-15, 21-22, 67-72; main doc lines 297-304 and 622-624; appendix lines 361, 560, 743, 856, 1143 and 1778; web/app.js:207 ac_topic_ph ('For example: my periods come every 40 days').
- **Fix:** Add no new Qura offer points in programmes for V39; keep today's three plan moments. Before adding any, either Mohit reconciles CLAUDE.md:104 with his 23 Oct decision in writing, or Qura builds the no_ad_tracking flag (integration plan section 2, Q4 and Q5). When offers come, they carry only the fixed topic 'A call about my plan' and never appear in the endometriosis or fibroids versions or in Calmer cycle.
- **Checked:** This is a reconciliation for Mohit, not a fact the doc missed. In his 23 Oct quote Mohit accepted that Meta may gain insight from booking confirmations, and the integration plan defers the no-ads switch to 'revisit before a public release'. The main doc does list only the WhatsApp template as its condition (line 304) and leaves out the Meta Schedule, Purchase and ConsultAttended events, so the finding's main point stands. The journey audit already puts the programme content packs after V39, so 'no new offer points in V39' costs nothing.

### Major · F5 · rule

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 3 Calmer cycle: fixes and doctor moments
- **The doc says:** "An active safety question in our own words ... is asked at the reveal and once each calm week": "In the last 2 weeks, have you had thoughts of harming yourself?" (lines 633, 738).
- **Issue:** This copies the stem and time window of PHQ-9 item 9 and pushes it as an active screen to every woman on the PMS plan, every cycle. The 19 Oct evidence map held PHQ-type screens back until M0 (an MBBS partner and CDSCO; a BAMS team isn't a mental-health professional under the MHCA; an item-9 crisis path is needed), and the scope decision said no PHQ, GAD or EPDS screens. A positive answer reaches only a static sheet. The doc's own evidence (Weise 2019) excluded acute suicidality, and its rule bans versions that copy scored items.
- **Evidence:** memory reference_sakhi_evidence_map.md lines 10 and 12; appendix lines 633-634, 738 and 777-778; main doc line 507 ('No scored or licensed questionnaires, and no versions that copy their items'); existing reviewed pattern: web/mods/post.js:120 mo_harm as one option in a mood picker.
- **Fix:** Drop the active question. Use the reviewed post.js pattern instead: a mood row in the check-in where 'Thoughts of harming myself or someone' is one choice that opens the crisis sheet, plus 'Need help now?' always visible in the calm week. Revisit active screening only at M0, with the psychiatrist.
- **Checked:** One credit the finding leaves out: the doc does require the psychiatrist or psychologist to approve the question, and says it is never stored and computes nothing. That doesn't settle the conflict with Mohit's 19 Oct scope decision (no PHQ, GAD or EPDS screens) or the evidence map's rule that PHQ-type screens wait for M0, so the finding stands.

### Major · F6 · safety

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md + appendix`, 3.9 the crisis sheet; appendix 3 lesson 7; appendix 7 crisis path
- **The doc says:** "The crisis sheet is one core component with two neutral choices: 'Thoughts of harming myself' (14416, 1-800-891-4416, 112) and 'Someone at home hurts or scares me' (181, 112)."
- **Issue:** Calmer cycle lesson 7 tells a woman who fears she'll hurt her child or anyone to 'use Need help now?', and After the birth's crisis path uses mo_harm ('myself or my baby'). Yet the one shared sheet offers neither harming someone else nor her baby. A frightened mother may not see herself in either choice. Its other properties (stores nothing, works offline, no Qura row) are right.
- **Evidence:** Main doc lines 306-309; appendix line 691 (lesson 7) and line 1438 ('uses the reviewed mo_harm wording'); web/mods/post.js:120 mo_harm 'Thoughts of harming myself or my baby'.
- **Fix:** Make the first choice 'Thoughts of harming myself or someone else, like my child', extending mo_harm's reviewed wording, with the same numbers (14416, 1-800-891-4416, 112). It's one component, so the pregnancy, after-birth, PMS and Help entries all share it. Add it to the §20 psychiatrist review.
- **Checked:** The appendix half-handles this, which makes the docs inconsistent rather than silent. Its after-birth fix (line 1438) says the crisis path 'uses the reviewed mo_harm wording' ('myself or my baby'), but the main doc defines one shared component that reads only 'Thoughts of harming myself'. Calmer cycle lesson 7's wider case ('hurt your child or anyone') is covered by neither wording.

### Major · F7 · feasibility

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md`, 3.10 item 5; 3.13; 5.5-5.6; 6.3 Devices; 6.4 acceptance; decisions 7 and 19
- **The doc says:** Reviewers include a physiotherapist and a psychiatrist or RCI-registered psychologist; 'one combined comprehension study ... through ASHAs (20 to 30 women ...)' with written consent; a per-programme teach-back with about 5 women; 'one recorded safety-audio bank'; 'a native-speaker writer drafts the Hindi'; 'one or two low-end phones'; 'an ethics committee's view'; 'the lawyer's written view' per condition programme. Most are acceptance gates in 6.4.
- **Issue:** Each of these is a likely cost, and 6.4 makes them hard release gates, so programmes would either stall or force spending. Only decision 7 asks how two roles could be filled for free. Indian ethics committees usually charge review fees; using ASHAs for a private company's study needs district permission and usually participant compensation; voice recording and translation cost money unless done in-house; written legal opinions are billable.
- **Evidence:** CLAUDE.md:106 ('No new spend'); main doc lines 326-327, 362-363, 399-404, 481, 491-493, 603-605 and 628-629.
- **Fix:** Give each item a zero-cost route or mark it optional. Dr. Megha records the safety audio on her phone (or the phone's own voice where it has Hindi, picture cards otherwise). Hindi is drafted in-session and read by Dr. Megha and the gynaecologist. Fold the teach-back and the picture check into the field test Mohit already runs, under its consent. List the ethics committee and written legal views as 'before public release', not per-programme gates. Mohit approves any line that costs money.

### Major · F8 · contradiction

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md vs docs/journey-audit-2026-10-24.md`, plans: lines 11-12, stages 1-5, 6.1, decision 5; journey: 7 (39.4, 39.5), decision 1
- **The doc says:** Plans doc: 'The kit here is step 39.4 of the journey audit.' Journey audit: '39.0 to 39.3 first (no new health wording), then 39.4 to 39.8'; 39.4 is 'Labels only | L'; 39.5 adds 'new signals with doctor-set triggers (PBAC 100+, Hb below her report's range, tiredness)'.
- **Issue:** (a) The plans doc's A0 to A6, B1 to B5 and R2 come to roughly 45 to 70 of its own code days, and B needs new health wording (§20: crisis sheet, care after a loss, go-now), yet neither doc says where B1 to B5 sit in V39. Some of B overlaps 39.0 (the neutral urgent line in discreet mode; a paused plan staying paused after a loss). (b) The plans doc says doctor prompts computed from diary values are what CDSCO treats as triage, and it takes the 'a total of 100 or more' line off programme screens, while 39.5 builds exactly those value-driven signals. Building V39 from both as written would build features and then remove them.
- **Evidence:** plans main lines 11-12, 50-60, 429-445, 553 and 591-601; appendix lines 539-540; journey-audit lines 250, 254-255 and 294-296.
- **Fix:** Write one merged V39 list now. 39.0 to 39.3 stay as the journey audit says. 39.4 becomes the plans doc's A0 to A4 only (golden test and port, R1). The reuse-only safety items move into 39.0: clear pregnancy, iron and plan reminders after a loss; discreet mode never hides urgent lines; Tele-MANAS higher in HELPLINES; a crisis row in Help using existing lines. B items with new wording, A5 and A6, R2, and 39.5's value-driven signals wait for decision 5 and §20, after V39.
- **Checked:** Two corrections. First, the size: A0 to A6 plus B1 to B5 plus R2 come to about 32 to 48 code days by the doc's own table (A 19 to 29, B 11 to 16, R2 2 to 3), not 45 to 70. Second, part (b) is mostly handled already. Decision 5 names the journey audit's 39.5 signals (Hb below range, a chart total of 100, tiredness) and recommends option (a), keeping them in pillar 1 with doctor-set triggers. Under that option nothing gets built and then removed. The leftover conflict is the appendix's open question on dropping 'a total of 100 or more' 'from all three places', which would collide with 39.5's 'PBAC 100+' trigger. Part (a) is accurate: neither doc places B1 to B5 in V39, and they overlap 39.0.

### Major · F9 · contradiction

- **Doc and section:** `all three plan docs + journey audit`, plans decision 2; journey decision 6; earlier outline 5 'Testers'
- **The doc says:** Plans: 'give the 8 to 10 women only R1 and freeze their plans with d.pv'. Journey: 'start the 8 to 10 women on a 39.0 to 39.3 build and freeze the plan engine'. Earlier outline: 'The field test can start on the kit (step 1), with the period programmes following.'
- **Issue:** Three incompatible answers. R1 needs the port, which the journey audit puts after 39.3, so 'R1 only' and '39.0 to 39.3' can't both hold. The earlier outline even plans to add period programmes during the field test. This decides when the field test can start.
- **Evidence:** docs/plans-design-and-build-2026-10-24.md:585-586; docs/journey-audit-2026-10-24.md:303-304; docs/programmes-every-condition-2026-10-24.md:571-572.
- **Fix:** Pick one. Recommended: field-test women start on the 39.3 build (or on R1 if the port lands first), frozen with d.pv for their 12 weeks, with no programme content during their weeks. Strike the earlier outline's line.
- **Checked:** The cited earlier-outline line (programmes-every-condition 571-572) sits in its section 5, which both newer docs already mark as superseded. Its section 0, which both say still holds, carries the same idea, though: the period programmes are 'the field test's women'. The plans doc also contradicts itself. Decision 2 says 'only R1', while section 8.1 says 'Cover R1 or R2 plus Easier periods'. The core clash with journey decision 6 is real: d.pv doesn't exist until the port (R1), and the journey audit starts the women on a 39.3 build, before the port.

### Major · F10 · contradiction

- **Doc and section:** `docs/programmes-every-condition-2026-10-24.md`, supersession note (line 7-9) vs plans line 11-12; sections 0, 6 and 7
- **The doc says:** Earlier outline: 'Sections 0, 1 and 3 still hold.' Plans doc: 'sections 0, 1, 3 and 6 to 8 still stand'. Section 7's bars include 'Fewer leaks; some women stop leaking', 'Down by about 1 to 2 points out of 10', 'Hb up if she took tablets'; section 6 says 'pregnancy moves only after her doctor's OK; after-birth moves only after the 6-week check'.
- **Issue:** The two docs disagree on what still stands. Section 7's 'what would count as working' targets are outcome numbers taken from efficacy trials (Cochrane 56% vs 6%; MENOS -1.5), which contradicts the new doc's lesson 21 ('field-test bars are about process') and its 'no promised outcomes'; they could also leak into the protocol or marketing. Section 6's exercise rules are reversed by the new doc (a green screen opens Pregnancy moves; gentle moves from week 1 after a birth). Section 0's table and order are superseded too.
- **Evidence:** docs/programmes-every-condition-2026-10-24.md:7-9, 28-90, 594-595 and 603-616; docs/plans-design-and-build-2026-10-24.md:11-12, 135, 516 and 610-613.
- **Fix:** Mark the earlier outline superseded except section 3 (the condition map) and section 1 (the code read). State this once in both docs, and delete or replace section 7 with process measures only (days followed, steps done, check-ups done on time).
- **Checked:** The section 6 exercise reversals are already covered by the plans doc's 'except as below' and its 'What changed' table (the My pregnancy and After the birth rows), so they aren't a live contradiction. Section 0's order also matches the new doc's order. The real problems are three: the two docs disagree on whether sections 6 to 8 still stand; section 7's outcome bars (56% vs 6%, -1.5 points, 'Hb up') contradict lesson 21's process-only bars and 'no promised outcomes'; and section 0's line that the period programmes are the field test's women.

### Major · F11 · rule

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 5 Midlife: Her measure, Results; main 3.8 table
- **The doc says:** Main measure: 'flushes, a weekly 0-to-10 problem rating plus coping' and 'aches, a weekly 0-to-10 how much did they get in your way'; results: 'her number, first 2 weeks vs last 2'. HFRS is listed as excluded.
- **Issue:** A 0-to-10 'how much of a problem were your flushes' is the Hot Flush Rating Scale's problem item (the MENOS trials' main outcome) in all but name, and 'get in your way' is its interference item. Showing first 2 weeks against last 2 presents a validated-score change as a treatment effect. The journey audit's rules check forbade this ('never a change in a validated score (that would read as a treatment effect)'), and the doc's own rule bans versions that copy items.
- **Evidence:** Appendix lines 1113-1119 and 1123; main doc lines 266-267 and 276; journey-audit line 275; earlier outline line 411.
- **Fix:** Use the midlife diary's own words (S.meno.trend: weeks with flushes, nights woken) and a 3-step 'Could you handle them? Not well / partly / well' as the main measure. Show counts, not a 0-to-10 before-and-after. If a 0-to-10 is kept, show it only to her and her doctor, never as a before-and-since result.
- **Checked:** Narrower than stated. HFRS's problem rating averages three 1-10 items: problem, distress, and interference with daily routine. A weekly 0-to-10 flush 'problem rating' is therefore a near-copy of one HFRS item and of the MENOS trials' main outcome. The earlier outline even set '-1.5 points' (MENOS@Work) as the bar for this number. The aches question ('how much did they get in your way') isn't an HFRS item, since HFRS asks only about flushes. The doc does say 'plain counts, never improved', and it lists the 0-to-10 versus picture-scale choice as an open question, but it never raises the HFRS likeness.

### Minor · F12 · rule

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, B.3; 1 (endometriosis measure); 4 (Her measure)
- **The doc says:** The Before-you-move questions are 'in our own words' (heart or lung problem; chest pain or faintness on effort; very low Hb; BP tablets); leaks 'never / sometimes / most days' plus 'When?' plus 'How much does it get in the way of your day? (0 to 3)', with 'a reviewer compares the wording with ICIQ-UI SF items 3 and 4'; endometriosis 'I felt in control this week'.
- **Issue:** The leak set mirrors ICIQ-UI SF items 3, 5 and 6 (how often, interference, when it leaks), but the reviewer is asked to check only items 3 and 4. ICIQ needs a paid licence. 'In control' mirrors EHP-30's control and powerlessness domain (licensed). The four move questions track PAR-Q+ items 1-3 and 5, whose commercial use needs permission.
- **Evidence:** Appendix lines 189-192, 338-339 and 905-910; memory reference_sakhi_evidence_map.md line 12 ('ICIQ-UI SF paid licence ... EHP ... fees or unclear').
- **Fix:** Have the reviewer check ICIQ items 3 to 6, EHP-30 control items and PAR-Q+ 1 to 7. Reword any near-match, for example 'Did leaks stop you doing something this week? yes / no' instead of a 0-to-3 interference scale.
- **Checked:** Limit this mainly to ICIQ. The leak set (how often, 'When?', and 0-to-3 interference) maps onto ICIQ-UI SF items 3, 6 and 5, while the reviewer is asked to compare only items 3 and 4 (item 4 is amount, which the doc doesn't use). EHP is already handled: the appendix says the endometriosis items are 'checked against EHP-5 and EHP-30 item stems so none is copied'. The PAR-Q+ likeness is at the level of concepts; any pre-exercise screen asks about heart conditions and chest pain, and B.3 already rewords them and notes that the forms need permission. That part is low risk.

### Minor · F13 · rule

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 5 Midlife Module A; 6 lesson 'Looking after you'; 7 'One small thing for me'
- **The doc says:** 'A 4-chapter CBT course for flushes in our own words, one chapter a week' (A1 midlife explained and noting flushes; A2 stress and slow breath; A3 thoughts during a flush; A4 night sweats and keeping it going); pregnancy and after-birth cards 'Me, my baby, my people'.
- **Issue:** The wording is new, but the 4-week order closely follows the copyrighted Hunter and Smith self-help guide used in MENOS@Work (the earlier outline itself notes 'the MENOS book is a Routledge title'). 'Me, my baby, my people' echoes WHO Thinking Healthy's three focus areas, which the evidence map lists as all-rights-reserved: 'link, don't copy'. Ideas are free; close structure and labels in a commercial app are a risk.
- **Evidence:** Appendix lines 1044, 1072-1077, 1301 and 1496; docs/programmes-every-condition-2026-10-24.md:437; memory reference_sakhi_evidence_map.md line 15.
- **Fix:** Record each lesson's source in the claims register. Build Module A from NICE NG23, IMS 2026 and NAMS principles in Sakhi's own order and examples, and replace 'Me, my baby, my people' with Sakhi's own label. Or ask Prof. Hunter and WHO for written permission, which costs nothing to request.
- **Checked:** The risk is low. Copyright protects expression, not the published CBT sequence (information and monitoring, then stress and paced breathing, then thoughts, then night sweats and keeping going), which appears in many academic papers. Recording sources and asking for permission are cheap safeguards, not must-fixes.

### Minor · F16 · rule

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md + appendix`, decision 12; appendix 8 'My folic acid tablet'; appendix 6 'Tablets today'; appendix 7 'Today's tablet'
- **The doc says:** Folic acid as 'a daily tick with no dose words, as a carve-out from no supplements in programme words'; pregnancy 'Day 47 of 180 as a filling bar'; after the birth 'Day {n} with no dose or duration words'; a lesson line '75 g, 2 hours, no need to fast'.
- **Issue:** This isn't really a carve-out: reviewed text already names folic acid with doses (cond.js:527 'daily folic acid tablet (400 mcg)', preg.js:251, iron.js:38), and iron.js already tracks tablets 'as advised'. The tick is a tracker of what she was given, under the same rule as iron.js. Programme wording is inconsistent on duration words (180 days shown in pregnancy, banned after the birth), and the planned dose lint will catch reused reviewed numbers ('75 g', from preg.js:134-135).
- **Evidence:** web/mods/cond.js:524-527; web/mods/preg.js:134-135 and 251; web/mods/iron.js:38; appendix lines 1271, 1297, 1491 and 1708; diet-ux-audit §9 ('No supplements, herbs, powders ... or doses').
- **Fix:** Decide decision 12 as 'track what her ASHA or doctor gave, like iron.js', using a dose-free version of cond.js:527 on programme screens and a separate folic acid record. Pick one rule for duration words (recommended: 'Day {n}' only everywhere), and give progs.mjs's dose lint an allowlist of reviewed '@key' lines.

### Minor · F18 · contradiction

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md + appendix`, 2 lesson 12; 3.7; 3.12; 5.4 conflicts list; appendix 7 doctor moments
- **The doc says:** Family cards are 'shown on her screen, never sent, off until she turns it on'; conflicts list: "family.js's iron card shared to WhatsApp"; After the birth: psychosis signs as a 'family card, default-visible in week 1'.
- **Issue:** family.js doesn't share by WhatsApp link. It uses S.share, the phone's own share sheet, deliberately with no wa.me link (audit fix 8), though its tile copy says 'Short WhatsApp cards'. 'Never sent' therefore reverses an existing feature the programmes plan to reuse ('Existing partner card'), and the default-visible psychosis family card contradicts 'off until she turns them on'.
- **Evidence:** web/app.js:2153-2160 (shareText, 'Never a wa.me link'); web/mods/family.js:80, 98 and 111; main doc lines 126, 258-259 and 419; appendix lines 1279 and 1571.
- **Fix:** Pick one rule: family cards may go through S.share on her tap (the existing, audited path), with no programme card sending automatically. Rename the tile copy to 'Short cards to show or send'. Keep the psychosis card default-visible as a named, deliberate exception for week 1, approved by the psychiatrist, and keep 181 off the face of any card meant to be shown to family.
- **Checked:** Narrow it. The family.js conflict is already in the doc's section 5.4 conflicts list for review in §20. 'Shared to WhatsApp' is fair shorthand, since family.js's own tile copy says 'Short WhatsApp cards' and the share sheet usually goes there, even though there's no wa.me link. What remains: the default-visible psychosis family card contradicts 'off until she turns it on' without being named as an exception, and the shared 'Telling your family' lesson puts the 181 line on content that may be shown to family.

## Code facts (15)

### Blocker · CF-01 · safety

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md`, 3.9 item 5; 3.10; 6.1 B5
- **The doc says:** Discreet mode rewords red flags and never hides them; the fix is plan.js lines 480 and 1448 (main doc lines 291-292).
- **Issue:** The biggest hiding place is core, not plan.js. In discreet mode, Home drops every module card not marked data-disc-ok, including urgent ones. Only the past-42-weeks line survives. plan.js:1750 also returns '' before the 'doc' slot card. A builder following the doc would fix two plan.js lines and leave 'see a doctor today' warnings invisible on shared phones.
- **Evidence:** app.js:1831 `if (!disc || planLeads()) moduleCards().forEach((h) => { if (disc && h.indexOf('data-disc-ok') < 0) return; ...`; app.js:1832 (only >294 days survives); plan.js:1750 `if (disc()) return '';` before the 'doc' card at 1751. Probe /private/tmp/claude-501/-Users-mohitkumar-Desktop-QuraSakhi-sakhi/b9bf9384-58ca-43bf-bc4c-c16065541e84/scratchpad/plansreview/codecheck/discreet-urgent.mjs (pregnant at 17 weeks, d_pbleed logged today): discreet off shows urgent 'Bleeding in pregnancy See a doctor today'; discreet on shows [] and no 'bleed' word, with and without a plan. The journey audit's P0 3 names the same line (journey-audit lines 82-85).
- **Fix:** Rewrite the B5 fix list: app.js:1831-1832 (one neutral urgent line that opens behind the lock, as in journey audit 39.0), plan.js:480, 1448 and 1750. Add the probe as a test in privacy.mjs or fieldtest.mjs. Ship it in the first step, not after the port.
- **Checked:** The code facts are right, but this is not an unaddressed blocker. The plans doc puts itself at step 39.4 of the journey audit (main doc line 12), and the journey audit's 39.0 'Fix and protect' already schedules the app.js:1831 fix (P0 3, a neutral urgent line). So the real defect is that the plans doc's B5 and 3.9 item 5 name only plan.js lines and don't point to 39.0. Severity: major (cross-reference and order, see CF-02), not blocker. Also, plan.js:1750's 'doc' card (and 480/1448) are cycle-plan doctor-check cards, not red flags.

### Major · CF-02 · contradiction

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md`, 0 (five stages); 6.1; 9 decision 2
- **The doc says:** Build the golden test and port first (R1), then the kit, then a safety layer (B1-B5); give field-test women R1 only (main doc lines 51-60, 585-586). The kit 'is step 39.4 of the journey audit' (line 12).
- **Issue:** The journey audit, written the same day, puts 'Fix and protect' (discreet urgent line, pregnancy log flags into Today, a paused plan staying paused after a loss) first as 39.0. It starts the field test on a 39.0-39.3 build. The plans doc's own table puts B1-B5 after about 19-29 code days of A0-A6. The two docs give Mohit opposite orders and different field-test builds.
- **Evidence:** journey-audit-2026-10-24.md:250 (39.0), :294 (decision 1: 39.0 to 39.3 first), :303-304 (field test on 39.0-39.3); plans doc :51-60 and the 6.1 table rows A0-A6 before B1-B5.
- **Fix:** Merge before deciding V39. Put B1 (crisis sheet), B2 (reminder clean-up after a loss), B3 (go-now and 'Baby moving less?') and B5 (discreet) into 39.0. Keep A0-A6 as 39.4. Give the field test 39.0-39.3, with the plan engine frozen by d.pv.
- **Checked:** 'Opposite orders' overstates it. The plans doc explicitly sits inside the journey audit as 39.4 (line 12), so 39.0 to 39.3 come before its A0. The real conflicts are narrower. (1) The plans doc's stage 3 safety layer (B1-B5) comes after the port and kit, yet some of it (the discreet urgent line, a paused plan staying paused after a loss) is already in 39.0. Other parts (the crisis sheet, clearing reminders after a loss, 'Baby moving less?') have no early slot in either doc. (2) The field-test build differs: plans decision 2 says R1 frozen by d.pv; journey decision 6 says a 39.0-39.3 build with the plan engine frozen. The plans doc is also inconsistent with itself: section 8.1 line 534 says 'Cover R1 or R2 plus Easier periods'. The proposed fix (move B1, B2, B3 and B5 into 39.0) is sound.

### Major · CF-03 · safety

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md`, 3.10 item 2 (care after a loss)
- **The doc says:** Care after a loss in loss.js 'stores the kind of loss (miscarriage, ectopic with or without methotrexate, molar, abortion, stillbirth, newborn or infant death)' (main doc lines 317-318).
- **Issue:** loss.js deliberately stores nothing unless she saves a note, so a shared phone shows no trace of these pages. Storing 'abortion' or 'ectopic' (needed for the methotrexate gate) breaks that rule. It would also travel in backups and could surface in the report. The doc doesn't mention the change.
- **Evidence:** loss.js:7-8 'reading never creates storage. state.mods.loss is written only when she taps "Save note" ... so nothing on the phone shows she opened these pages'; MODULE_API.md:150 rule 9 (sensitive topics privacy first).
- **Fix:** Make it a decision: store only a neutral flag plus a date, behind the PIN, kept out of the report and summaries, with an expiry. Or ask the methotrexate question at the moment of restart instead of storing it. Add it to section 9 and to the §20 packet.
- **Checked:** Small addition: endPregnancy already stores a neutral pregEndedOn date and a pregnancy span, so a neutral date plus flag is close to today's behaviour. Storing the kind of loss is the new, sensitive part, and neither the main doc nor the appendix mentions changing loss.js's store-nothing rule.

### Major · CF-04 · feasibility

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md`, 3.1 Text; 5 step 1; appendix A
- **The doc says:** Programme text is { en, hi } or a reference to reviewed text, '@plan_key' or '@mod:key' (another module's string), both resolved into the hash (main doc lines 154-156).
- **Issue:** '@mod:key' reaches only strings in a module's keyed strings table. Most reviewed lines the programmes plan to reuse are inline bilingual literals with no key. Examples: iron.js UPSET/HELP, post.js:335's cue and the G lists, cond.js:553, intimate.js:363 and 365, periods.js:177/221/226, explain.js:94. Before they can be referenced and hashed, each must be moved into a strings table (words unchanged), touching thousands of literals across modules, with test churn. No step or effort row covers this.
- **Evidence:** Inline literal counts: access 532 L(), intimate 292, preg 289, cond 270, meno 257, ttc 218, periods 194, loss 171, explain 166, post 111 L(), iron 22 L(); iron.js:44-53 UPSET/HELP arrays; post.js:332-345 G; relief.js and pregtools.js are keyed (relief.js:138, pregtools.js:490).
- **Fix:** Add a per-packet step 'key the reused lines' (mechanical, words unchanged, with a test that the rendered text is identical), costed at about 0.5-1 day per programme. Or define a locator such as '@mod:route#n', hashed from the rendered text.
- **Checked:** 'Thousands of literals' overstates the work. The per-module counts are totals, and only lines quoted into programme screens would need keys. Many 'Reuse' entries are routes or tools the programme links to (relief-cramps, cond-endo, the post-pelvic trainer), not text references. The core point stands: '@mod:key' can't reach the inline L()/{en,hi} literals the appendix plans to reuse (iron.js UPSET and HELP, post.js G lists and mood lines, periods-pain's 'What helps'), and no step or effort row covers keying them.

### Major · CF-05 · feasibility

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md`, 3.2 Release gate; 5 steps 7-8; 6.4
- **The doc says:** Release needs a signed hash; 'approved' specs must match docs/reviews/<id>-v<ver>.json (by, registration, role, date, section, hash ...) (main doc lines 20, 183, 192-193, 405).
- **Issue:** The record is a JSON file in the repo. The gate can prove the text matches a recorded hash (integrity), but not that a doctor signed it (authenticity). Any session, including a Claude build session, can write the record and pass the gate, so the 'doctor review before it ships' rule wouldn't really be enforced.
- **Evidence:** main doc line 183 (record fields) and 192-193; no signing mechanism specified; CLAUDE.md: 'New health wording needs doctor review before it ships.'
- **Fix:** Specify who writes it: only Mohit, in a signed git commit (SSH commit signing is free), referencing the reviewer's dated sign-off file kept in the business folder by sha256. Add a CLAUDE.md rule that sessions never create or edit docs/reviews/*.json. Have the gate verify the commit signature or author.
- **Checked:** Accurate. A plaintext JSON record plus a hash proves the text hasn't drifted, not who approved it. Severity is arguably between minor and major: the gate's main stated job is catching drift ('Any later edit breaks the hash'). But the doc does call it a 'signed record' and treats it as the release gate for doctor review, and nothing stops a build session from writing it.

### Major · CF-06 · contradiction

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 1 Easier periods: daily steps and doctor moments
- **The doc says:** 'A pain tap at "Couldn't do my day" or a "harder" look-back → This week: the same stopsDay card for everyone' (appendix lines 282, 360).
- **Issue:** That tap is the diary's pain level (pain_3). It is a health value driving a doctor card, which the main doc's tag table forbids ('health value ... Never' for doctor cards, line 168). It also re-computes a reviewed core warning (r_pain/pain_3) that 'programmes link, never recompute' (lines 285-286). And three diaries that differ only in pain level would get different doctor cards, so the diary-independence test (line 475-476) fails by design.
- **Evidence:** main doc :168, :285-286, :475-476; appendix :282, :360; app.js:2536 already shows r_pain in the log sheet on pain_3.
- **Fix:** Pick one. Either the pain programme shows only the core r_pain line where core already shows it, with the programme adding nothing. Or explicitly reclassify pain taps as fixed-list taps, and tell the lawyer that this is a value-triggered prompt. Then update the independence test to match.

### Major · CF-08 · feasibility

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md`, 6.1 A0 golden test; 6.2
- **The doc says:** A0: '25 goal cases for 84 days ... a birth on day 40'; A0 to A6 leave the golden output byte-identical (lines 429, 458).
- **Issue:** The 25 cases are plans-walk's. They skip three live goals and never reach some branches the port must preserve. Pregnancy seeded at LMP minus 60 days runs weeks 8 to 20, so plan.js:1339 (the kick link from week 28, which the doc wants to remove) is never recorded. Answers are fixed (work 'day', bed 'b23', food 'veg'), so the night-shift step, other bedtimes and heavy's egg/nonveg lines go unrecorded. There's no tester-build pass, though S.toolShown and TRIAGE decide whether the kick link appears. A port that changes these would keep the golden 'identical'.
- **Evidence:** test/plans-walk.mjs:33 GOALS (ttc: ['ready'] only), :27 preg pregnantSince iso(-60), :26 post deliveredOn iso(-50), :24 ANS; plan.js:1049 GOALS (ttc also irregular, pmos, weight); plan.js:1302 (night shift), 1316 (egg/nonveg), 1339 (weeks>=28 && toolShown), 1344-1347 (early post); app.js:983-984 TRIAGE/triageHidden.
- **Fix:** Add the 3 trying-stage goals, pregnancy starts at weeks 8, 20 and 30, an in-run birth plus a day-10 after-birth start, varied answers (night shift; bedtimes b22, b24 and later; egg and nonveg food; knee/back limits), and a tester-build pass. Record from S.plan.actions() and the HTML, not screenshots, to keep the run short.
- **Checked:** A0 is not literally plans-walk. Its spec adds 'a birth on day 40', so at least one pregnancy case must start late (about 34 weeks) and would pass week 28, where plan.js:1339's kick link appears in a pilot config. The claim that 1339 is never recorded applies to plans-walk, not necessarily to A0. The other gaps stand. '25 goal cases' matches plans-walk's 25, which leaves out 3 live trying-stage goals (irregular, pmos, weight). The spec lists no varied answers (night shift, bedtimes, egg/nonveg, limits). It has discreet and Hindi passes but no tester-build pass, though S.toolShown/TRIAGE gate the kick link.

### Minor · CF-09 · code-fact

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md`, 3.2 Adapters; appendix A vocabulary
- **The doc says:** Module-owned steps go through adapters moved unchanged from actionsFor (cycle.today, bed, preg.due, post.rcheck, journey.iron, ttc.prep, meno.diary); growth is table, adaptive or level (lines 189-190, 6.3 table).
- **Issue:** Four 'light' plans take their walk minutes from the cycle plan's ladder (todayPlan/target, capped at 30), and the trying plan and midlife weight goal take food habits from habitsOn. Heavy and after-birth weight use lightWalk. Pain's period-day cramps and the per-goal relief links are separate branches too. None of these maps to a listed adapter or growth rule, so the v1 specs can't reproduce today's output without a 'cycle ladder' growth word and a lightWalk table. The outline's 'only the cycle plan grows' is also inaccurate.
- **Evidence:** plan.js:1298 tp = todayPlan; 1312 (pain), 1321-1322 (ttc), 1328 (pms), 1355-1356 (meno) use Math.min(tp.walk, 30) and habitsOn(tp.wk); 1317 and 1347 lightWalk; 1311 relief-cramps on periodToday; outline lines 104-106.
- **Fix:** Add adapters or growth words such as cycle.walk30, cycle.habits, lightWalk and relief:<id>, with a periodDays rule for cramps, to the A1-A2 vocabulary. Correct the outline's section 1.
- **Checked:** Narrower than stated. lightWalk is a fixed table by week (10/15/20/30), so it fits the doc's existing `table` growth rule. Cramps on period days fit the existing `periodDays` clock word with a link step, and per-goal relief links are plain link steps, not adapters. The real gap: pain, ttc, pms and meno take walk minutes from the cycle plan's ladder (todayPlan().walk capped at 30), and ttc and meno-weight take food habits from habitsOn. That is the cycle ladder, which the doc keeps 'inside cycle.today', so the adapter list needs a capped walk and a habits entry point. The outline's 'only the cycle plan grows ... light plans only lengthen the walk (lightWalk)' is inaccurate.

### Minor · CF-11 · code-fact

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md`, What changed table
- **The doc says:** 'No code in content (check.mjs fails a mods file that registers no module)' (line 18).
- **Issue:** check.mjs never fails anything. It prints issues and has no non-zero exit, so 'npm test' passes. It also checks only ids listed in mods/order.json; a mods/prog-*.js file not in order.json is ignored. The choice of web/progs/ is still sound; the reason given isn't.
- **Evidence:** test/check.mjs:20-21 (ORDER/available from order.json), :61-62 (unregistered → issue text only); no process.exit in check.mjs; package.json test chain.
- **Fix:** Give the real reasons: pure data, one review packet per file, hashable. Separately, have check.mjs exit 1 on 'module did not register' so this guard actually works.

### Minor · CF-14 · code-fact

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 7 After the birth: prerequisites
- **The doc says:** The 'Baby born?' prompt is 'in app.js, today shown only after the due date' (appendix lines 1611-1612).
- **Issue:** Today it shows from 7 days after the due date, and never in discreet mode, because pi0 is null when disc is on. That makes the 28-week prompt more needed than stated.
- **Evidence:** app.js:1825 `const pi0 = isPregnant() && !disc ? pregInfo() : null`; app.js:1826 `today() >= addDays(fromISO(pi0.edd), 7)`; journey-audit line 97.
- **Fix:** Correct the wording, and add a plain-words discreet version of the prompt.

### Minor · CF-15 · gap

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 1 Easier periods reuse; 3 Calmer cycle
- **The doc says:** Easier periods reuses periods-pain's 'What helps' and caution note; lesson 6 has 'No medicine names or doses'; dose-free versions are listed only for Stronger blood (appendix 301, 393-394, 587-588).
- **Issue:** The reused pages name medicines: ibuprofen, mefenamic acid and paracetamol. Reusing them by reference would put medicine names into programme screens. Name-free versions aren't planned for these packs.
- **Evidence:** periods.js:221 'Doctors commonly suggest ibuprofen or mefenamic a…', :226 'Ask a pharmacist or doctor before ibuprofen or mefenamic acid…', :177 'Paracetamol or ibuprofen can ease headache and sore breasts.'
- **Fix:** Add name-free versions of periods.js:177, 221 and 226 to the §20 register for Easier periods and Calmer cycle, as was done for Stronger blood.
- **Checked:** Narrower than stated. Calmer cycle reuses the periods-pms log, grid and doctor card (appendix 764), not the PMS page's 'What helps' paragraph at periods.js:177, and that line already goes to §20 for its 'small meals' (appendix 708; main doc register line 419). Name-free counterparts already exist in the new text: lesson 6 is the caution note without drug names, and 'Get your kit ready' says 'a painkiller only if your doctor or chemist suggested one'. The real gap: Easier periods' reuse line (appendix 393) lists periods-pain's 'What helps' and caution note with no name-free note, as Stronger blood has at 587-588.

### Minor · CF-16 · gap

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 2 Stronger blood: daily steps
- **The doc says:** Weeks 1-3 reuse 'the reviewed iron journey (with this pack's food-only versions of days 1, 8 and 10, and cooked sprouts on day 18)'; the family card is shown on screen, never sent (appendix 448, 479, 492).
- **Issue:** Day 19 of the reused iron journey is 'Tell your family: Send the iron card from Explain it to my family'. It links to family.js, which shares through the phone's share sheet, so that step contradicts 'never sent'. The day numbering for 1, 8, 10 and 18 is otherwise correct.
- **Evidence:** journey.js iron days[18] `[L('Tell your family'...), L('Send the iron card from Explain it to my family.'...), 'family']`; family.js:98 S.share.
- **Fix:** Add day 19 to the replaced days (a 'show your family' card with no Share button).
- **Checked:** Small addition: the main doc's §20 register already lists 'family.js's iron card shared to WhatsApp' as a conflict (line 419), so the share itself is known. The gap is only that iron-journey day 19, which falls inside the reused weeks 1-3, isn't among the replaced days.

### Minor · CF-17 · code-fact

- **Doc and section:** `docs/plans-design-and-build-2026-10-24-programmes.md`, 1, 2, 4, 5 Who; prerequisites
- **The doc says:** Only lowhb gets a packFor/goalsFor change 'with a test that it never opens the cycle or midlife plan' (appendix 591).
- **Issue:** packFor treats any unknown goal as the cycle plan, and at the midlife stage everything except heavy as the midlife plan. So the other new goals would silently open the wrong plan unless packFor and GOALS change: leaks or heaviness at every adult stage, aches and tiredness, painful periods for diagnosed women of 40+ (appendix 248-249), and PMS at 40+.
- **Evidence:** plan.js:1053 `if (st === 'meno') return goal === 'heavy' ? 'heavy' : 'meno'; return { pain: 'pain', heavy: 'heavy', pms: 'pms' }[goal] || 'cycle';`; plan.js:1049-1050 GOALS.meno has no pain, pms or pelvic.
- **Fix:** Turn the lowhb test into a table test: every stage-goal pair maps to its intended programme, and no new goal falls through to the cycle or midlife plan.
- **Checked:** Minor nuance: a diagnosed woman of 40+ falls through to the midlife plan only if her stage is 'meno' (midlife), not just because of her age. The point stands for every new goal: only lowhb is given a packFor/goalsFor change and a test.

### Minor · CF-19 · code-fact

- **Doc and section:** `docs/plans-design-and-build-2026-10-24.md`, 3.9 crisis sheet (one constant)
- **The doc says:** Numbers live in one constant; 14416 is typed 122 times in code, 79 in content.json and '84 more in its source files in web/content/' (lines 308-309).
- **Issue:** The counts are right, but the 84 are the same Learn text that assemble_content.py copies into content.json, not a second set. All 79 sit inside doctor-verified article bodies, which a JS constant can't reach. The 69 module strings (not 122) also embed the number in reviewed sentences.
- **Evidence:** web/assemble_content.py (content.json built from content/*.json, KEEP fields); grep: 69 lines in mods hold 108 occurrences.
- **Fix:** Scope B1 to the module and core strings using a {tm} placeholder. Either leave Learn bodies out of scope or add a render-time token, and note that any token change in content needs the doctor's glance.
- **Checked:** Small correction: the doc's 122 is right as an occurrence count (14 in app.js plus 108 in mods; 10 plus 69 lines). The doc does call the 84 'its source files', so it doesn't strictly claim a second set, but the '84 more' reads as extra work. The useful point stands: the 79 sit in doctor-verified Learn bodies that a JS constant can't reach without a render-time token.

### Minor · CF-20 · contradiction

- **Doc and section:** `docs/programmes-every-condition-2026-10-24.md`, Header; sections 0 and 3
- **The doc says:** The outline's header says sections 0, 1 and 3 still hold (outline lines 7-9); the main doc says 0, 1, 3 and 6 to 8 still stand (main lines 11-12).
- **Issue:** The two docs disagree on which sections stand. The outline's section 0 and section 3 also contradict the new design, yet are marked as standing: 'Move all 8 plans onto the kit first', '45 minutes', 'CBT weeks 1 to 6', '12,000 to 15,000 words', '~20 drawings' and the goal label 'Tired, low iron'.
- **Evidence:** outline :7-9, :60-61, :67-71, :86-87, :182; main doc :11-12, :24-33 'What changed' table.
- **Fix:** Mark the outline's section 0 tables and its 'Tired, low iron' row as superseded, and make both headers agree on which sections stand.

## Dropped by the skeptics (19)

- CF-07 (code facts): The conflicts register lists the existing pages to reconcile in §20 (main doc lines 411-419); routing says low mood never goes to 'A Qura (BAMS) call' (line 299). Dropped because: The appendix already handles this. After the birth's fixes say 'The mood page's BAMS call card is removed when reached from the programme' (appendix lines 1439-1440), and its routing says 'never for mood' (line 1581). What remains is minor: the main doc's §20 register doesn't list post.js:665/m_ask_*, and the card stays on the mood page outside the programme. Whether to drop it app-wide is a fair minor suggestion, but 'the register doesn't list it' misses the appendix's explicit fix.
- CF-10 (code facts): 'Today "Iron tablet" shows on the lock screen unless discreet or shared mode is on' (line 325). Dropped because: VISIBILITY_SECRET only hides a notification on a secure lock screen (PIN, pattern or password). On a phone with a swipe-only or no lock, which is common on shared phones, Android shows the full notification on the lock screen, including the body 'Iron tablet'. So 'Nothing shows on the lock screen in any mode' is wrong, and the doc's statement is roughly right for exactly the shared-phone case it worries about. Two small precisions do hold: 'Iron tablet' is the body, not the title (the title is notifBrand()); and the Java ignores the secret flag, with discreet/shared handled in JS by a neutral body and channel. The heads-up point (meds channel at 'high' outside quiet mode) is correct. The fix (neutral bodies) is right either way.
- CF-12 (code facts): 'A PROGS block in index.html, written by build.py, before the modules'; build-apk.sh leaves drafts out (lines 186-187, 193). Dropped because: The build-apk.sh facts are right, but the doc already plans for them. 'Not .json, because the WebView can't fetch file://' plus 'a PROGS block ... written by build.py', modelled on the MODULES block, which holds <script src> tags, points to separate script files, not an inline data block. Step A4 lists 'build, gate, tools, scans, CLAUDE.md publish steps'. Section 3.2 says build-apk.sh drops drafts, and 'Scans' adds progs/ to the old-WebView scan. At most a one-line clarification.
- CF-13 (code facts): 'The kick counter's "Stop at 10" goes'; the conflict is pregtools.js 'Stop at 10' (lines 323-324, 412). Dropped because: The docs already scope this as a redesign or a hold-back. B3 is 'kick tool without a number' (main doc line 438), section 7 says 'No kick counting to a number', and the appendix says 'the kick tool redesigned without "Stop at 10" (or held back everywhere)' (line 1394), with the same open question at line 1421. That is exactly the proposed fix. Only small points remain: the main doc's 3.10 item 3 and its register name just the one line, and the §20 register should list every count key (k_done, k_part, k_range, k_one, k_chart, k_row10, k_rowp, k_s3).
- CF-18 (code facts): d.pv keeps a running woman on her version; v1 specs are '@key' text only with a baseline hash (lines 178, 408). Dropped because: Not silent. The release gate requires 'live specs match their baseline hash' (main doc line 192), and npm test and build-apk.sh run it, so an in-place reword of a key that v1 references fails the gate loudly and forces a deliberate re-baseline (6.2: re-recorded 'in a commit that names the difference'). The doc also intends some fixes to reach running women at once ('Bank safety lines apply at once'), so freezing v1's words isn't the goal. A 'new key per reword' rule is a reasonable design option, not a defect.
- F3 (Mohit's rules): Pregnancy Part A 'right now' (any yes: the go-now card, moves locked); a daily check-in 'As usual / less than usual / not sure / not felt any movement today' mapped to Today/Now; acceptance: "'Baby moving less?' shows from 28 weeks with no plan and in a tester build". Dropped because: The finding gets the app's own split backwards. Sakhi doesn't hold back tools because they are answer-driven. It holds back tools that set their own thresholds or label her. The after-birth recovery check is a tapped sign mapped to its fixed urgency, the same shape as Part A, and it runs in tester builds by design. preg-symptoms, which is held back, is a static accordion guide, which is just what the finding's fix proposes for tester builds. The doc's own tag table allows 'tap (her own tap on a fixed list)' to drive doctor cards and red flags. The movements question drops counting, so it no longer sets a threshold of its own the way the kick counter's 'Stop at 10' does. The acceptance criterion covers only the static 'Baby moving less?' button, which the journey audit already puts in every build and the finding's own fix keeps. The one real gap is that the doc doesn't say which builds the programme gates run in, and that belongs under F2. The lawyer could confirm that Part A and the movements check-in sit on the 'point her to care' side, like post-recovery.
- F14 (Mohit's rules): 'for many women regular movement and Unwind make periods a little easier over 2 to 3 periods'; 'leaks and heaviness are common and exercise helps many women'; 'a set a day keeps it'; 'stand-ups and balance get easier'; purpose 'Habits for more comfortable periods'; titles 'Easier periods', 'Stronger Dropped because: This overstates what the doc's rules forbid. 'No promised outcomes' bans promises, not hedged education. 'For many women ...' and 'exercise helps many women' are hedged and backed by the exercise and NICE pelvic floor evidence the doc cites. Section 8.3 bans 'easier for up to 6 periods' because that arc rested on Blödt 2018, which tested acupressure; it isn't a ban on every expectation line. The titles already ship (V37 and V38). The doc already sends each one to the lawyer with a ready fallback, so 'use the fallbacks now' is a preference, not a gap. Kernel worth passing to reviewers: the pain line 'make periods a little easier over 2 to 3 periods' has the same form as the banned line; 'a set a day keeps it' is an unhedged maintenance claim; and the Hindi 'ख़ून की ताक़त' could be checked for tonic-ad tone.
- F15 (Mohit's rules): New goal labels: 'Leaks or heaviness down below' at every adult stage except pregnancy; 'Low Hb, or told I have anaemia' while she has periods; 'Aches and tiredness' at 40+, with the card 'Ask your doctor which blood tests you need (often Hb and thyroid; vitamin D if your doctor advises)'. Dropped because: The finding agrees with the doc on the leaks and low-Hb goals. Its case for dropping 'Aches and tiredness' rests on two misreadings. First, the journey audit's 'no thyroid content or plan' rule is about the 'What did the doctor say?' answers, not a fixed 'ask your doctor which blood tests you need' referral line. Second, the diabetes-symptom card ('thirst with weight loss') is in the pelvic floor section, not midlife. Joint aches and exhaustion are standard midlife symptoms, and 'joints' is already in the midlife diary and linked to the bones page, so the goal stays within reproductive health. The TB, inflammatory-arthritis and thyroid red flags check other causes of night sweats, joint pain and flushes or palpitations, the same signposting the finding's own fix keeps. The one fair point: 'tiredness' is non-specific, so Mohit could use a narrower label such as 'Aches and stiffness' or fold it into Bones (decision 11).
- F17 (Mohit's rules): 'A version check through net() that sends nothing about her, or a written recall procedure.' Dropped because: The code fact is right, but the conclusion overstates the risk. The doc's own requirement, 'a version check ... that sends nothing about her', already rules out the account token and any pack or version. Decision 18 names 'the app audit's update check', which is the static latest-and-minimum-version file the finding recommends. net() already has an anon path (the ANON table and the anon argument, used since V33). The fix is a fine implementation note consistent with the doc, not a defect in it.
- P14-21 (programmes 1-4): "Exercise effect grew to 22 mm ... by 7 months (Kannan 2019, n=70)"; "Tea taken an hour after a meal restored absorption (Ahmad Fuzi 2017, n=12)"; "Same pelvic floor app: 2.2 vs 3.9 points (Rygh 2021)" Dropped because: Two of the three lines match their sources. - **Kannan 2019:** line 407 reports the 22 mm at 7 months correctly, and main doc 8.3 already uses Kannan only to support the 6-period arc (effects lasting), not the dose. - **Rygh 2021:** 2.2 is the severity-weighted figure, the like-for-like comparison with the trial's 3.9. The raw 1.31 would make 'real-world effects are smaller' stronger, not weaker. - **Ahmad Fuzi 2017:** 'restored absorption' matches the reported means (5.7% with water and 5.7% with tea an hour later), though the authors say 'attenuates' (inhibition 37.2% to 18.1%). Valid leftovers: Ahmad Fuzi was a porridge meal in 12 iron-replete UK women, so it can't set tablet timing. Rygh's 0.24 drop for slight leaks is a fair warning that results for mild cases will look flat.
- P14-24 (programmes 1-4): "Pregnancy, pressure or heaviness before 37 weeks | Now | pregPains" Dropped because: ACOG lists pelvic or lower belly pressure among the signs of preterm labour and says 'do not wait. Call ... right away or go to the hospital'. The finding's fix, 'tell your ANM or doctor this week', would under-triage. Main doc 8.2 decided on purpose that 'pressure before 37 weeks is a go-now card', after a review blocker. At most, the obstetrician might move pressure alone (with no tightenings, fluid or bleeding) from Now (112) to Today, meaning same-day contact.
- P14-28 (programmes 1-4): "Order: Easier periods, Stronger blood, Calmer cycle, Strong pelvic floor" Dropped because: The word counts are right (pain 3,200, heavy 1,350 new), but the reorder's case is wrong in two places, and it misses the doc's stated reason for putting Easier periods first. - **Heavy needs the physiotherapist:** the doc lists one for heavy's routines and gates (line 593). Even with P14-17's reuse, side-lying rest and legs on a chair are new poses. - **Pelvic floor is the most physiotherapist-heavy programme:** every cue, level and position, plus 7 poses and 2 props (lines 967-968). Moving it to second doesn't avoid the unnamed reviewers. - **Every programme in the first four needs at least one unnamed reviewer:** PMS needs the psychiatrist or psychologist; pain needs both. - **The doc's reason:** main doc 8.1 ties Easier periods to the field test ('Cover R1 or R2 plus Easier periods'). What survives: Stronger blood is the smallest new-word packet, and Calmer cycle can't ship until a psychiatrist or psychologist is named.
- m6 (programmes 5-8): Core opens after day 42 on 'I feel ready to start gently'; the C-section version runs 'until her doctor's OK'. Dropped because: The doc already covers this. The C-section branch (1588-1589) states the fallback condition ('core also needs my wound doesn't hurt when I walk; no date promised'), and open question 1640 ('What unlocks core after a C-section...?') leaves the obstetrician to settle it. The suggested 'no earlier than the obstetrician's chosen week' is one possible answer to that open question, not a missed gap.
- m11 (programmes 5-8): Cycle care yoga swaps cobra and twist 'in the 14 days before her likely period'. A calm few minutes runs in the 7 days before her likely period. Dropped because: Partly wrong. Main doc §0 explicitly allows timing to 'the days before her period', so these windows aren't against the 'never to cycle phases' principle. 'A calm few minutes' already has a fallback for irregular cycles (the 'I'm waiting to know' tap is the default until her range exists, 1715). Its one-study evidence and the 'lesson only' option are already in the doc (1829, open question 1837). What holds: the cycle-care yoga swap (1742) has no fallback when her range is unknown. Since §6 already bans tummy-lying and deep twists, dropping cobra and twists from Getting ready entirely is a sound simplification.
- S1 (red-flag bank and safety layer): Golden test and port first (A0 to A6, 'byte-identical'), then the safety layer. Field-test women get R1 only. Dropped because: Overstated. The main doc's line 12 says "The kit here is step 39.4 of the journey audit", so the journey audit's order (39.0 to 39.3 first) already puts the three P0 fixes ahead of A0. R1 is "identical" to whatever build comes before it, not to 0.38. What is left is a small clarity gap, not a blocker. Section 6.1 dropped the earlier outline's "step 0" (programmes-every-condition §5), and neither 6.1 nor decision 2 says again that A0 starts on a 39.0+ build. One sentence fixes it: "Record the golden test after 39.0 to 39.3; R1 = that build + the port." Separately, the doc's own B1 to B5 items (crisis sheet, clearing reminders after a loss, "My baby has died") come after A6, and decision 2 doesn't say whether the field-test build includes them.
- S2 (red-flag bank and safety layer): The safety layer is the crisis sheet, care after a loss, pregnancy go-now, a notification budget and the bank, and B5 makes 'discreet never hides red flags' (fix plan.js lines 480 and 1448). Dropped because: Misreads the scope. The three P0s (bleeding after menopause, pregnancy and after-birth log flags reaching Today, the neutral discreet line at app.js:1831) belong to the journey audit's 39.0, which comes before this kit (main doc line 12). Decision 5 explicitly keeps signals from her records in pillar 1 ("the diary's reviewed warnings, explain.js, and the journey audit's planned ... signals"), and 3.9.2 keeps core warnings core's. B5's bank is for programmes and comes after A4 by design. The core B items (B1 crisis sheet, B2 loss.js, B3 preg.js) don't depend on _bank.js. The code facts are right: plan.js:480 and 1448 hide the plan's doctor cards; app.js:1831 hides non-data-disc-ok module cards; preg.js flagsFor stays on the logs screen; explain.js:156 needs sit.stopped. They just belong to 39.0, which the plans doc correctly doesn't repeat. The one useful addition: B5 should note that its plan.js fix sits alongside 39.0's app.js:1831 fix.
- S6 (red-flag bank and safety layer): After-birth set: postBleed, postWound, postBreast, newbornDanger. Dropped because: Misreads the doc. The After the birth programme's doctor moments do cover post-partum pre-eclampsia and the rest. 'Start and any day | Now | postBleed, pregHeadVision (also after the birth), faint, calf with breathlessness, feverIll (sepsis), severeBelly, newbornDanger'. 'Days 0 to 41: a single tapped sign in the recovery check | Today | Each sign's own fixed line' brings in post.js's fl_fever, fl_swell, fl_belly, fl_cantpee and fl_heavy. 'Any day: thoughts of harming herself or her baby' goes to the crisis sheet, and the psychosis family card is in week 1. The only residue is tidiness: B.1's after-birth set doesn't list pregHeadVision or the recovery-check lines. Also 'calf with breathlessness' (Now) vs post.js, where one calf alone → 112; that conflict belongs to S13.
- S18 (red-flag bank and safety layer): Health values never drive doctor cards or red flags. 'Logged BP, sugar or Hb values never change her steps; only her own ticks do.' pregAnaemia is her own tick that Hb is under 7. Dropped because: Misreads the scope. The tag table (3.1) governs words in programme spec files. 3.9.2 says 'The diary's reviewed warnings stay core's ... programmes link, never recompute'. 3.4 and the appendix rules put 'other modules' urgent cards' above the plan. Decision 5 explicitly keeps value-driven signals (explain.js, the journey audit's 39.5 signals) in pillar 1. So nothing forbids core bp_urgent, hb_flag or the sugar flags reaching Today; that's 39.0's job. pregAnaemia as her own tick is a deliberate choice to keep the programme free of her values (CDSCO), not an oversight. The one small residual: say that an active core log flag triggers 3.6's existing offer ('Make today a rest day?' / pause moves), so a logged Hb 6.5 doesn't sit beside an unpaused move step.
- S25 (red-flag bank and safety layer): New rows: 'wheezing after a painkiller: stop it'; fistula 'it can be repaired free'; heat illness; stroke-like headache. Dropped because: Mostly already covered. The whole bank is 'Reviewed once, in §20, before any programme packet' (appendix 124), and 5.1 requires a source on every health line, so heat and headache rows already go to §20. Rule 3.9.6 is about 'My doctor said' variants never naming or changing a medicine. Advising her to stop a painkiller that causes wheezing is ordinary adverse-reaction advice, and cond.js has a precedent. Only the fistula row's 'it can be repaired free' is a genuine unsourced claim: give it a source (NHM) or drop it.
