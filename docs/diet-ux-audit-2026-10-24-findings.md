# Diet and UI/UX audit: all findings (24 Oct 2026)

The 74 findings behind `docs/diet-ux-audit-2026-10-24.md`, grouped by Mohit's four complaints. Each was checked against the code
by a second agent; "Checked" gives that agent's correction where it had one. Screenshots are under `web/test/shots/diet-ux/`
(not in git; re-create them by re-running the walks). Line numbers are for the 0.38-pilot code (commit 418075d).

## Bugs, safety and privacy (11)

### P0 · Iron tablets set-up is unreadable: the plan options collapse to one letter per line (DIET-01, diet audit)

- **Where:** web/mods/iron.js:108 (label.item with input type=radio), web/app.css:33
- **Found:** The radio input in each '.iron-plans .item' takes the generic rule 'input, select, textarea { width: 100%; min-height: 46px }' (app.css:33). That squeezes span.body to 0 px. Measured scrollHeight: 10,340 px at 320, 10,344 at 360, 10,329 at 390 and 10,329 at 412 px, with only 182 words (12.9 screens at 360; 8.2 in Hindi). It's the same for the heavy-periods and pregnant women.
- **Why it matters:** Every woman who opens Iron tablets for the first time can't read the dose plans (pregnancy, after birth, weekly tablet, doctor's dose) and has to scroll about 13 screens to reach Start. That blocks the iron tool that the heavy-periods, pregnancy and after-birth plans send her to.
- **Advice:** Add '.item > input[type=radio] { width: auto; min-height: 0; flex-shrink: 0; }' next to the checkbox rules (app.css:146), or a global radio and checkbox exception to line 33. Add a layout check to test/companions.mjs: #iron scrollHeight under 3 screens and every .iron-plans span.body wider than 100 px.
- **Effort:** S; no new health wording
- **Screenshot:** `web/test/shots/diet-ux/diet/iron-plan-picker-broken-360-crop.png`

### P0 · Iron tablets: plan picker renders one letter per line, page 12 screens tall (F1, findability)

- **Where:** web/mods/iron.js:108 (iron plan picker) and web/app.css:33; route #iron
- **Found:** Measured on every persona: - The #iron page is 12.24 screens tall at 390 px, 12.93 at 360 px, and 8.21 in Hindi at 360 px, for only 182 words. - In the DOM, each plan row's span.body is 0 px wide while its radio input is 262 px x 46 px, so the text wraps one character per line. - The 'Start' button sits at the bottom. - Cause: app.css:33 gives every input 'width:100%; min-height:46px'. Only '.item > input[type=checkbox]' is restyled (app.css:146), and iron.js:108 puts the radios inside .item rows. iron.js is the only file with radios.
- **Why it matters:** This blocks task 18 (set an iron tablet reminder). She can't read the four choices (Pregnancy / After the birth / Weekly tablet / My doctor's dose) and has to scroll 12 screens to Start. Iron is the core tool for heavy periods, pregnancy and after birth, and it is also the first result for 'iron food' and 'आयरन वाला खाना' and the target of Today's 'Your iron tablet' row.
- **Advice:** Add a radio rule next to the checkbox one, for example '.item > input[type=radio] { width:22px; height:22px; min-height:0; flex-shrink:0; margin:0; accent-color:var(--accent); }'. Add a smoke check that fails when any #view element is under 24 px wide and over 300 px tall. Then re-run the iron page at 360 px in Hindi.
- **Effort:** S; no new health wording
- **Checked:** Small fixes only. At 360 px the radio input is 232 px wide; 262 px is the 390 px figure. Today's iron row reads 'Iron tablet today' (iron.js:183). 'Your iron tablet' is day 1 of the 21 iron steps, which also opens #iron.
- **Screenshot:** `web/test/shots/diet-ux/findability/B-iron-heavy-390-top.png`

### P0 · Iron tablets page: the plan choices show one letter per line (DJ-01, persona journeys)

- **Where:** #iron, the 'Your plan' card (mods/iron.js:108; app.css:33)
- **Found:** app.css:33 sets every input to width:100%. Only checkboxes get an override (app.css:146), and iron.js:108 puts a radio inside label.item. Measured at 360, 390 and 412 px: the option text box is 0 px wide, the radio is 232 to 284 px wide, each option is 1,306 to 3,388 px tall, and the page is 12.2 screens tall for 182 words. It is the only radio in the app.
- **Why it matters:** Lakshmi's plan opens here on day 8 ('A reminder for your tablet'), and Shabana (iron from the 4th month) and Meera (iron for 180 days after the birth) start their tablet tracking here. None of them can read which plan they are choosing, which blocks the iron tracker for every stage.
- **Advice:** Add `.item > input[type=radio] { width: 22px; height: 22px; min-height: 0; flex-shrink: 0; margin: 0; accent-color: var(--accent); }` next to the checkbox rule. Add a check to the test walks that no visible text element is narrower than 40 px.
- **Effort:** S; no new health wording
- **Screenshot:** `web/test/shots/diet-ux/journeys/lakshmi/iron-plans-360.png`

### P1 · A pregnant woman searching for food is shown 'Two or more miscarriages' (F5, findability)

- **Where:** web/app.js:1133 (toolBoost loss demotion), web/mods/ttc.js:556
- **Found:** - Pregnant woman, query 'garbh me kya khaye': My pregnancy plan, This week of pregnancy, Two or more miscarriages (ttc-loss2), Pregnancy guide. No food page. - The Hindi UI gives the same third result. - The demotion for loss pages covers only section 'loss' and pregtest-abortion (app.js:1133), not ttc-loss2, which sits in the 'ttc' section (ttc.js:556).
- **Why it matters:** It breaks one rank down the Version 32 rule 'a loss or an abortion ranks first only when she asks about one'. It can distress her while she is pregnant, and she still doesn't get food. This borders on P0 (harm).
- **Advice:** Tag every loss-themed route (ttc-loss2, loss-*, pregtest-abortion) for the demotion. In pregnancy, leave them out of results entirely unless she types a loss word. Add the query to the search test.
- **Effort:** S; no new health wording
- **Checked:** 'No food page' is wrong: Food in pregnancy is listed, 10th among tools. ttc-loss2 ranks 3rd, not 1st, so the Version 32 rule ('ranks first only when she asks') isn't broken as written. Its intent is, because the demotion skips ttc-loss2. The tile is defined at ttc.js:583, section 'ttc'; ttc.js:556 is its string.
- **Screenshot:** `web/test/shots/diet-ux/findability/S-preg-en-garbh_me_kya_khaye.png`

### P1 · Discreet mode: Explore's For you still names her pregnancy or PMOS (F9, findability)

- **Where:** web/app.js:1033 (forYouTiles), app.js:1163-1166 (renderCare)
- **Found:** - Discreet mode on: the brand reads 'My notes', Diary reads 'Notes', and Today has 0 period words. - Yet Explore's For you lists 'Food in pregnancy, My pregnancy plan, Iron tablets, This week of pregnancy, My pregnancy logs' for the pregnant woman, and 'PMOS: food, yoga and moves, My lab results, Pattern check' for the PMOS woman (variants.mjs: 10 and 7 stage words on Explore). - The neutral picture tiles are hidden instead: app.js:1166 passes discreet to qaHtml, while forYouTiles (app.js:1033) ignores it.
- **Why it matters:** On a shared phone, one tap on the Explore tab reveals what discreet mode hides on Today. This is privacy, next to findability.
- **Advice:** In discreet mode, either show For you with neutral names only (her plan, 'Food ideas', 'Tablets', 'Reminders'), or drop For you and lead with the topic grid. Keep the library itself. Add the case to privacy.mjs.
- **Effort:** S; no new health wording
- **Checked:** Small correction: the quick-answer tiles that discreet mode hides aren't 'neutral'. qaHtml(disc) drops them because they name stage topics. discreet_d promises hiding only on Today and the Diary rename, so this is a gap in what the mode covers, not a broken promise.
- **Screenshot:** `web/test/shots/diet-ux/findability/V-preg-390-en-disc-care.png`

### P2 · Food isn't noticed: one yes/no tick, earlier habits drop off Today, cravings ignored (DIET-14, diet audit)

- **Where:** web/mods/plan.js:115, 169, 1307-1308, 802-806; web/mods/periods.js:417
- **Found:** Today and the check-in show only the newest habit (hb[hb.length - 1], plan.js:1307-1308). In week 3 the check-in asks 'Walk, Protein at breakfast, In bed by 11'; 'Half the plate sabzi' survives only as a checkbox in My plan. Progress shows one number, 'Food habits, last 7 days 0 / 7', with no per-habit view (plan-progress text). 'Food cravings' and 'Bloating' in the PMS log (periods.js:417) lead to nothing.
- **Why it matters:** The habits she built in weeks 1 and 2 are never asked about again, and Sakhi can't reflect her eating back to her ('5 days of half-plate sabzi this week'). The companion stops noticing food.
- **Advice:** Once a week, rotate one earlier habit into the check-in ('Still doing half the plate sabzi?'). Show each habit as a row of 7 dots in My progress. When cravings or bloating are logged 2 or more times in the week before a period, show the PMS food tip. Everything stays on the phone.
- **Effort:** S; new wording needs doctor review
- **Checked:** Earlier habits do survive in two places: as checkboxes on My plan (journeyCycle, plan.js:423) and on My plate's 'Your food habits' card (plan.js:549).
- **Screenshot:** `web/test/shots/diet-ux/diet/pmos-plan-progress-en-360.png`

### P2 · Diet screens contradict each other (DIET-15, diet audit)

- **Where:** web/mods/cond.js:538-545; web/mods/plan.js:94, 100, 544-549, 1967; web/content.json (pmos.food-for-hormones); web/mods/preg.js:498
- **Found:** (a) cond-anaemia lists 'til and gur; dates, raisins' as food that builds blood (cond.js:542), while the plate puts 'Sugar, mithai, sweets made with gur' under less often (plan.js:100). (b) Learn pmos.food-for-hormones says chaas instead of curd at night because curd 'pushes insulin', while the plate puts 'curd or chaas' beside every meal and 'Curd, paneer, milk' under more often (plan.js:94, 1817). (c) Iron foods are listed 4 ways: journey.js iron days, plan_a_ironf (plan.js:1967), cond.js:538-545 and preg.js:498. (d) The heavy-periods plate shows the PMOS habits 'Half the plate sabzi, Protein at breakfast, One millet swap' as 'Your food habits' with checkboxes that aren't in her plan. (e) A pregnant woman can open plan-plate and see the cycle habit and no pregnancy avoid list.
- **Why it matters:** Mixed messages undermine trust ('is gur good or bad?'). Duplicate lists drift apart, and every fix has to be made in four places.
- **Advice:** Use one foods table with tags (group, iron, calcium, protein, folate, diet type, Jain, region, cost, season) that every food screen reads from. Ask the doctor to settle the gur and curd-at-night lines. Show only the habits that belong to her plan on the plate. In pregnancy, send plan-plate to preg-diet.
- **Effort:** M; new wording needs doctor review
- **Checked:** (b) is a tension, not a direct contradiction. The plate says 'curd or chaas' on the side with no time of day; the article prefers chaas over curd at night.
- **Screenshot:** `web/test/shots/diet-ux/diet/heavy-plan-plate-en-360.png`

### P2 · Discreet mode hides the food step itself (DIET-16, diet audit)

- **Where:** web/mods/plan.js:1316, 1329-1339 (priv flags)
- **Found:** In discreet mode the heavy-periods woman's Today reads 'Your plan for today · Done' twice in a row, and the pregnant woman's plan shows two 'Your plan for today' rows (heavy-home-en-360-disc, preg-plan-en-360-disc). The iron food step is priv: true (plan.js:1316), so 'Green leafy sabzi, chana, rajma or eggs, with lemon or amla' is hidden, though food words reveal nothing.
- **Why it matters:** On a shared phone she loses the very thing to do today. Two identical rows look broken.
- **Advice:** In discreet mode, show the food line without the health word (for example 'Green leafy sabzi with lemon today') and keep only the iron, blood and pregnancy labels hidden. The 23 Oct research already judged words like 'dal at dinner' safe to show.
- **Effort:** S; no new health wording
- **Checked:** On the heavy woman's Today, the second identical 'Your plan for today' row is the walk. Today hides every 'minutes' step in discreet mode (plan.js:841: a.priv || a.kind === 'minutes'), so showing the food line alone still leaves one generic row. For the pregnant woman, the food row's title 'Food in pregnancy' reveals the pregnancy and has to stay hidden.
- **Screenshot:** `web/test/shots/diet-ux/diet/heavy-home-en-360-disc.png`

### P2 · No eating-worry safety line next to the plate, BMI and weight (DIET-17, diet audit)

- **Where:** web/mods/plan.js:536-565 (plate), renderBody, renderProgress
- **Found:** plan.js has no Tele-MANAS or 14416 line and no 'if food or weight worries take over' line on plan-plate, plan-body or plan-progress. The research (docs/lifestyle-plans-research-2026-10-23.md, section 4) asked for one on every food screen. The 2023 PCOS guideline (EBR 2.5.1, PP 3.6.4) asks to consider disordered eating during weight management.
- **Why it matters:** Weight and waist tracking alongside food lists can feed restrictive eating in a few women, and there's no signpost to help.
- **Advice:** Add one gentle line to the plate, body and progress screens: 'If worries about food or weight take over your day, talk to a doctor, or call Tele-MANAS 14416 (free).' Add it to the plan tests.
- **Effort:** S; new wording needs doctor review
- **Screenshot:** `web/test/shots/diet-ux/diet/pmos-plan-plate-en-360.png`

### P2 · Icon buttons shrink to 40 px on 360 px phones (VD-12, visual density)

- **Where:** web/app.css:514, web/app.css:126, web/mods/plan.js:536
- **Found:** app.css:514 shrinks every .iconbtn to 40x40 at 374 px and below. The Back button measured 40x40 on 34 of 54 screens at 360x800 (44x44 at 390). The top-bar read-aloud and Me buttons and the sheet's Listen are also 40 px. Diary calendar days and prev/next are 40x40, week-strip days 43x67, and the plate's summary 312x32. Sakhi's own rule is 44 px (app.css:294), and the companion design asks for 48.
- **Why it matters:** Missed taps on cheap 360 px phones, worst for older women. Read-aloud, the main aid for low-literacy women, is one of the shrunk buttons.
- **Advice:** Keep a 44 px hit area: shrink the glyph to 20 px or trim the brand instead. Pad summaries to 44 px.
- **Effort:** S; no new health wording
- **Checked:** Accurate. One small fix: the 40 px calendar day height is set at app.css:121, not app.css:126 (that line is the other-month rule).
- **Screenshot:** `web/test/shots/diet-ux/density/plate-en.png`

### P3 · A few small labels fall below contrast AA (VD-17, visual density)

- **Where:** web/app.css:563, web/app.css:126
- **Found:** - Week-strip future-day letters: 3.5:1 at 12 px (opacity 0.85, app.css:563). - Diary other-month dates: 2.08:1 (opacity 0.5, app.css:126). - Start screen's '✓ Reminders are on.': 4.35:1. Body text passes: minimum 4.64:1 in light theme and 5.34:1 in dark.
- **Why it matters:** Hard to read in sunlight on cheap screens.
- **Advice:** Use --muted at full opacity, with weight or a dot for future days, and a darker green for the confirmation line.
- **Effort:** S; no new health wording
- **Checked:** The week-strip letters render at 13 px, not 12 px. The CSS says 12 px, but the app's tidyView raises anything smaller to 13 px (app.js:3610). The 3.5:1 ratio still holds. In dark mode the diary's other-month dates also fail, at 2.79:1.
- **Screenshot:** `web/test/shots/diet-ux/density/diary-en.png`

## Diet feels thin (12)

### P1 · 'My plate' is a food list, not something she can cook from: no meals, portions, recipes, weekly thali or shopping list (DIET-02, diet audit)

- **Where:** web/mods/plan.js:90-144, 536-565; web/content.json (mind_body.simple-indian-plate)
- **Found:** plan-plate (renderPlate, plan.js:536-565) shows 39 chips for the vegetarian north woman, 43 for the egg-eating south woman and 44 for the non-vegetarian east woman (62 distinct food names). It has 0 meal ideas, 0 recipes, 0 kitchen-measure portions beyond 'half, a quarter, a quarter' and 2-3 habit checkboxes. The only kitchen-measure thali in the app is inside Learn article mind_body.simple-indian-plate (two ladles of sabzi, a bowl of thick dal, one or two rotis, a bowl of dahi). The 6 habits (plan.js:137-144) say 'Protein at breakfast' without naming a breakfast.
- **Why it matters:** She learns which foods are good but not what to put on tonight's thali, how much, or what to buy. This is Mohit's complaint 1 for the PMOS plan, Sakhi's main diet feature.
- **Advice:** Add a 'Meal ideas' layer built from the existing regional lists. For each region and diet type: 3 breakfasts, 3 lunches or dinners and 3 snacks as picture cards. Each card has kitchen measures (katori, roti, ladle, glass), one swap line, and '10 minutes' or 'low cost' tags. Add a 7-day 'this week's thali' rotation chosen from them, and an optional on-phone shopping list. Reuse the steel-thali line from the Learn article on the plate itself. Start with 2 regions (north, south) × 3 diets × 9 cards = 54 cards in English and Hindi, then grow. The principle from Selena: recipes organised by eating pattern, written for Indian kitchens.
- **Effort:** L; new wording needs doctor review
- **Checked:** The plate itself has no meals or recipes, but kitchen measures do appear elsewhere. pmos.food-for-hormones says 'Two rotis with a bowl of dal and plenty of sabzi is a good meal', preg-diet says 'Roughly one roti, a bowl of dal and a glass of milk', meno-bones says 'A katori of dahi' and journey says 'a bowl of dal or chana to dinner'. So simple-indian-plate is not the only one. The plate also has 'A small handful of nuts or seeds'. The protein habit does name a breakfast: 'Add dal, besan cheela, sprouts, paneer, curd or an egg to breakfast' (plan.js:139).
- **Screenshot:** `web/test/shots/diet-ux/diet/pmos-plan-plate-en-360.png`

### P1 · The midlife bones and PMS plans have no food step, though their own pages already say what to eat (DIET-03, diet audit)

- **Where:** web/mods/plan.js:1326-1328, 1349-1357, 1422-1426; web/mods/meno.js:364-374; web/mods/periods.js:177
- **Found:** actionsFor: the meno pack adds a food habit only when goalKey === 'weight' (plan.js:1349-1357). The 48-year-old's 'Bones and strength' Today has 1 step, 'Move 10 minutes today' (meno-home text). Yet meno-bones (meno.js:364-374) lists ragi, til, curd, milk (about 300 mg a glass or katori), paneer, chaulai and small fish. The PMS pack has calm, walk and sleep only (plan.js:1326-1328), while the PMS page already advises 'small meals every 2–3 hours' (periods.js:177). 'Food cravings' and 'Bloating' in the PMS log trigger nothing.
- **Why it matters:** A midlife woman whose goal is her bones never gets a calcium step, and the PMS plan ignores food. The plans look thinner than the content Sakhi already has.
- **Advice:** Midlife bones: 'One calcium food today', rotating ragi roti or porridge, til chutney, a katori of dahi, a glass of milk, chaulai or methi, filtered by diet type and the no-milk answer, and tapped like the other habits. PMS: in the calm week (V38 already predicts it), 'Small meals every 2–3 hours' and 'Less salt and pickle this week' when bloating is logged. Most of the wording comes from already-reviewed pages; the step titles are new.
- **Effort:** M; new wording needs doctor review
- **Screenshot:** `web/test/shots/diet-ux/diet/meno-plan-en-360.png`

### P1 · Pregnancy 'food' goal = a daily tick for opening a 649-word page in raw grams (DIET-05, diet audit)

- **Where:** web/mods/plan.js:1133, 1329-1339; web/mods/preg.js:472-536, 820-833
- **Found:** plan.js:1338: for goalKey 'food' the step is link('food','preg-diet') every day. Today shows 'Food in pregnancy · Done'. preg-diet: 649 words, 0 pictures, 4.4 screens, 8 long paragraphs. The daily amounts are raw grams (preg.js:480-491: cereals 240 g, pulses 80 g, milk 400 ml, vegetables 300 g, greens 150 g), folded behind 'Show more'. The only change by stage is 'first three months: no extra food'. Joining never asks diet type for this goal (plan.js:1133 asks food only when goal is 'iron'), and pregnancy uses no region.
- **Why it matters:** The plan she chose for 'eating well in pregnancy' gives her nothing to do each day. A pregnant woman in a village can't turn '240 g raw cereal' into rotis.
- **Advice:** Ask diet type for the pregnancy food goal. Give a daily food step that rotates by trimester: iron food with lemon or amla, a calcium food, dal at every meal, iodised salt, water, and from 14 weeks 'one roti, a katori of dal and a glass of milk extra'. Replace the gram table with a thali drawing in kitchen measures per trimester (the doctor sets the measures), keeping the grams in a 'for your doctor' fold. Reuse the regional lists for her foods.
- **Effort:** M; new wording needs doctor review
- **Checked:** 'The only change by stage is first three months: no extra food' is wrong. The first card on preg-diet, 'How much more to eat', is visible and not folded. It says 'From the 4th month… Roughly one roti, a bowl of dal and a glass of milk', plus 450 if underweight and extra protein by trimester. So the suggested '14 weeks: one roti, a katori of dal and a glass of milk extra' already exists as text. What is missing is a daily step that changes, a diet-type question, and region.
- **Screenshot:** `web/test/shots/diet-ux/diet/preg-preg-diet-en-360.png`

### P1 · Today's food steps lead nowhere for heavy periods; bones and feeding goals never get one (F3, findability)

- **Where:** web/mods/plan.js:1316 and 1337 (actionsFor food and iron steps), plan.js:1639 (renderLight)
- **Found:** From a 28-day walk of Today (days.mjs): - Heavy-periods plan: 11 different food steps (Poha with lemon, Ragi or bajra, Cook in iron, Sprouts, Amla, guava or orange, Rajma or lobia...). Every one opens 'plan' (plan.js:1316 and 1337, `go: s.go || 'plan'`). On My plan the same rows link to 'plan' again, so tapping the chevron just reloads the page (rows.mjs: 'first row data-go plan -> now at plan'). - 40+ with the 'bones' goal: 0 food steps in 28 days, only Move, Strength at home and the Weekly symptom diary. - After a birth with the 'feeding' goal: 0 food steps. - Pregnancy: the same static 'Food in pregnancy' link on 28 of 28 days. - Neither the heavy nor the 40+ My plan page links to any food page (links.mjs).
- **Why it matters:** Task 1 (today's food idea) works only for the PMOS plan. She taps an iron food idea to learn more and lands back on the same row. The bones and breastfeeding goals have no food at all, though food is the point of both.
- **Advice:** Give every food step a destination: - heavy periods → 'Food that builds blood' on the Anaemia page (scroll to the anchor), or My plate filtered to iron foods; - bones → 'Calcium from your kitchen' on Bones and heart; - after a birth → a breastfeeding food card; - pregnancy → one rotating idea a day taken from Food in pregnancy. Add a test that no Today or My plan row links to the screen it sits on. Linking existing pages needs no review; the new daily steps for bones and feeding do.
- **Effort:** M; new wording needs doctor review
- **Checked:** None needed. One nuance: on Today the heavy food row does open a different screen (My plan); the reload loop happens on My plan itself.
- **Screenshot:** `web/test/shots/diet-ux/findability/D1-heavy-pmos-tile.png`

### P1 · No simple day of meals anywhere: food help is lists and one habit line (DJ-02, persona journeys)

- **Where:** Today food row; #plan-plate (mods/plan.js:536-566)
- **Found:** Riya's 12 weeks give 6 food habit titles of 3 to 5 words, one every 2 weeks (plan.js:137-144). Today's row reads 'Half the plate sabzi / Your plate today'. My plate is 239 to 299 words of food names over 3.3 to 3.8 screens, with no breakfast, lunch or tiffin, snack or dinner and no portions beyond ½·¼·¼. Her answer 'Work or college in the day' is used only for her bedtime. Searches for recipe, nashta, breakfast, tiffin and poha return nothing (riya.json).
- **Why it matters:** Riya, with an office job, knows to eat 'more sabzi' but not what to pack in her tiffin or cook tonight. The same gap hits every persona. It is Mohit's complaint 1.
- **Advice:** Add a 'My day of meals' card on My plate and as the food step's detail: 4 picture cards (morning, tiffin or lunch, evening snack, dinner). Build them offline from her region list, her diet type, her stage and her goal, with amounts in katori and roti. A Swap button picks another food from the same group. Add a 'Cooking for the family' line, for example 'take your dal before the tadka; add salad first'. Add a few 3-step home recipes per region (sprouts chaat, besan cheela, ragi dosa, sattu drink). Content is about 6 regions × 4 diets × 10 cards.
- **Effort:** L; new wording needs doctor review
- **Checked:** Two details are off. My plate does have a Snacks group (GROUPS includes 'snack'), and its habit lines do name breakfast and lunch or dinner. What is missing is a meal-by-meal day. The habit titles run 2 to 5 words, not 3 to 5 ('Less oil' has 2). Of the work answer, only 'night' changes anything (a shift-sleep step, plan.js:1302); 'day' appears only in the summary.
- **Screenshot:** `web/test/shots/diet-ux/journeys/riya/d01-plate.png`

### P1 · Heavy periods: one identical iron line every day from day 22 to day 84 (DJ-03, persona journeys)

- **Where:** Today and #plan for the heavy-periods plan ('Stronger blood')
- **Found:** plan.js:1315: after day 21 the step is always plan_a_ironf_nonveg (plan.js:1967), 'Green leafy sabzi, chana, eggs, fish or meat, with lemon or amla'. Lakshmi's days 22 to 35 are identical (lakshmi.json). The links on her My plan go to the plan, the check-in, the free doctor, ASHA, Qura's doctor and the report, but not to My plate or any food page.
- **Why it matters:** For 9 of her 12 weeks Lakshmi sees nothing new about food. The plan that should fight her tiredness goes stale and gives her no list to cook from.
- **Advice:** After day 21, give a weekly 'iron food of the week' that rotates through her region and diet, with one picture card and one way to cook it (for the South: murungai keerai, ragi kanji, kollu sundal, eggs, small dried fish). Link My plan to 'Iron foods for me', a low-cost list with vitamin C pairings. Keep one tap to mark it done.
- **Effort:** M; new wording needs doctor review
- **Checked:** My plan and the step itself have no food link. But a food list does exist: Explore's For you for the heavy goal shows Iron tablets and 'Anaemia and heavy periods' first (FOR_GOAL.heavy, app.js:1012). That page has a 'Food that builds blood' card with greens, ragi/bajra, dals including kulthi, til, gur and fish/liver, plus vitamin C pairing (cond.js ~540). So the gap is the stale daily step and the missing link from My plan, not a missing list.
- **Screenshot:** `web/test/shots/diet-ux/journeys/lakshmi/d22-today.png`

### P1 · Breastfeeding: no food step, and her only food line sits 3.1 screens down (DJ-07, persona journeys)

- **Where:** Today and #plan (after-birth plan); #post-feed; #post-recovery
- **Found:** The breastfeeding plan's steps are the Breastfeeding page, which is about the baby, and the pelvic floor trainer (plan.js:1342-1346; meera.json todayItems). The only line about her own food is 'Eat proper meals…' at 3.1 screens down the Daily recovery check (post.js:166). Nothing says how much more to eat while breastfeeding, and there are no calcium or iron food lists. Searching 'breastfeeding food' returns Food in pregnancy first; 'gond laddu' and 'stanpan' return nothing.
- **Why it matters:** Meera feeds every 2 to 3 hours on 180 days of iron, and Sakhi says nothing about what she should eat. The family's traditional confinement foods go unaddressed beyond one myth card.
- **Advice:** Add a 'Food while you breastfeed' card and a weekly plan step. The extra need goes in food terms (one extra small meal: roti, dal and a glass of milk or curd), with water at every feed, calcium and iron foods, and Jain and region aware. Traditional foods (gundar pak, batrisu, methi laddoo, panjiri) are 'fine as food, not milk medicine; go easy on sugar and ghee'. Link it from Breastfeeding and the after-birth hub.
- **Effort:** M; new wording needs doctor review
- **Checked:** Her own food comes up in more places than the one line, though all of them are generic. The mood page's help list says 'Eat regular meals, and drink water at every feed' (post.js:427). The family list says 'Bring her food and a glass of water' (post.js:434). The Breastfeeding page's myths already say that ghee, laddoos, gond and methi 'are food, and a new mother needs good food' but don't make more milk (post.js:384). Still missing: a breastfeeding food page or step, the extra need in food terms, and calcium and iron food lists.
- **Screenshot:** `web/test/shots/diet-ux/journeys/meera/post-recovery-food-line.png`

### P1 · 40+ 'Bones and strength' plan has no food step; the calcium card isn't linked (DJ-13, persona journeys)

- **Where:** Today and #plan for the midlife plan; #meno-bones
- **Found:** Sunita's plan has one step a day, a walk or strength on 2 days (plan.js:1354). Food type isn't asked (plan.js:1133). The calcium card on #meno-bones isn't linked from her plan or Today, and neither is My plate, although its East list has sattu, chana and saag. Searching 'सत्तू' returns nothing.
- **Why it matters:** Sunita picked bones, and food (calcium, protein) does most of the protecting, as Sakhi's own page says. Her plan only tells her to walk.
- **Advice:** Add a calcium-and-protein food step 3 or 4 days a week, from her region and diet: a katori of dahi, sattu sharbat, til, chana, ragi or mandua, saag. Show it as a picture card in plain Hindi, and link 'Calcium from your kitchen' and My plate from her plan.
- **Effort:** S; new wording needs doctor review
- **Checked:** Bones and heart is reachable in one tap: it is the first For you tile in Sunita's Explore (FOR_GOAL.bones = ['meno-bones'], app.js:1014; sunita explore-hi capture) and is listed on the Menopause hub. As stated, though, it is not linked from her plan or Today.
- **Screenshot:** `web/test/shots/diet-ux/journeys/sunita/myplan.png`

### P2 · Pregnancy food safety misses high-mercury fish and raw sprouts; no diet guidance for diabetes in pregnancy (DIET-18, diet audit)

- **Where:** web/mods/preg.js:498, 508-520, 535, 636
- **Found:** preg.js:516-520 (food safety) and 508-513 (avoid) don't mention high-mercury fish (shark, king mackerel or surmai, swordfish) or the amount of fish a week, though the non-vegetarian Kolkata woman is the target. preg.js:498 recommends sprouts for iron without 'cook them'. For diabetes in pregnancy the page says only to follow the doctor's diet (preg.js:535), though Sakhi logs her sugar (preg.js:636). The 23 Oct research listed both under 'avoid in pregnancy' and a diabetes-in-pregnancy plate.
- **Why it matters:** Coastal non-vegetarian women eat surmai often, and raw sprouts are a common 'healthy' snack. A woman with diabetes in pregnancy who logs high sugar gets no food help.
- **Advice:** Add 'Fish 2 or 3 times a week is good: rohu, katla, sardine (mathi), pomfret. Avoid shark and king mackerel (surmai)' and 'Cook sprouts in pregnancy'. When she logs sugar above target or ticks diagnosed, show a diabetes-in-pregnancy plate from the MoHFW GDM 2018 guideline. All new wording to be doctor-checked.
- **Effort:** M; new wording needs doctor review
- **Checked:** The diabetes line is at preg.js:536 (ask_p). The sug_flag lines (preg.js:134-140) also say 'Food changes and walking control the sugar for most women', with no food detail. Surmai (seer fish) is not exactly the FDA's high-mercury king mackerel, so the doctor should settle the fish list.
- **Screenshot:** `web/test/shots/diet-ux/diet/preg-preg-diet-en-360.png`

### P2 · Vegetarians are shown eggs and fish in their own plan (DJ-17, persona journeys)

- **Where:** #plan-plate; the Today food row in week 3
- **Found:** Week 3 habit for vegetarian Riya: 'Add dal, besan cheela, sprouts, paneer, curd or an egg to breakfast' (plan.js:139). The plate legend 'A quarter: dal, chana, paneer, egg or fish' (plan_plate_prot, plan.js:547) shows with Vegetarian selected (riya/d15-plate.png).
- **Why it matters:** It tells Riya and Meera that Sakhi didn't hear their answer, right after the summary screen said it had.
- **Advice:** Pick these strings by diet (veg, egg, non-veg, Jain), as Version 38 already does for iron day 9 (journey.js:54-56).
- **Effort:** S; no new health wording
- **Checked:** Line slip: the Version 38 diet-specific alternative for iron day 9 is at journey.js:60-61, not 54-56.
- **Screenshot:** `web/test/shots/diet-ux/journeys/riya/d15-plate.png`

### P2 · A PMOS woman's 'Keeping a vrat?' button leads to a sabudana-first fasting menu (DJ-18, persona journeys)

- **Where:** #plan-plate, then #periods-fasting
- **Found:** My plate links 'Keeping a vrat (fast)?' (plan.js:558) to the general fasting page, whose vrat ideas start with 'sabudana khichdi with peanuts' (periods.js:395). The PMOS plan otherwise says fewer refined carbs.
- **Why it matters:** During Navratri or Ekadashi, Riya gets mixed messages. Vrat days are where many Indian women eat the most refined starch.
- **Advice:** Add vrat swaps that fit PMOS, pregnancy and sugar. Lead with rajgira or kuttu roti with curd, makhana, paneer, fruit with nuts and singhara, and less sabudana and aloo. Show it from the plate when the plan is PMOS.
- **Effort:** S; new wording needs doctor review
- **Checked:** The page already lists kuttu or singhara roti with curd, makhana, fruit and chaas in the same bullet, so the fix is mostly reordering plus a PMOS, pregnancy and sugar note, not new foods.
- **Screenshot:** `web/test/shots/diet-ux/journeys/shabana/fasting.png`

### P3 · The trying-for-a-baby plan reuses the PMOS habits, with no folate foods (DIET-19, diet audit)

- **Where:** web/mods/plan.js:1318-1325, 1425; web/mods/ttc.js:65
- **Found:** The ttc pack uses habitsOn (the PMOS habits) with plan_fb_food_t (plan.js:1321-1323, 1425). Folate-rich foods (green leafy vegetables, dal, chana, citrus) aren't named, though folic acid tops the before-pregnancy checklist (ttc.js:65).
- **Why it matters:** A small missed chance to tie food to her goal. The tablet stays the doctor's job.
- **Advice:** Make one of the first two trying-for-a-baby habits 'A folate food today', rotating green leafy sabzi, dal or chana, and orange or amla, with no dose words. Doctor review.
- **Effort:** S; new wording needs doctor review

## Not Indian enough (14)

### P1 · After birth: the mother's own food is one bullet, and jaapa food customs are barely touched (DIET-04, diet audit)

- **Where:** web/mods/post.js:166, 384, 609; web/mods/plan.js:1340-1348
- **Found:** The after-birth plan has 0 food steps for any goal (plan.js:1340-1348). For the breastfeeding mother, Today shows 'Breastfeeding · Done' and 'Pelvic floor trainer'. Her food is one line on the recovery page ('Eat proper meals: dal, eggs or paneer, milk, green vegetables and fruit. Drink a glass of water every time you feed', post.js:166), plus one folded myth about ghee, laddoos, gond and methi (post.js:384). There's nothing on how much more to eat while breastfeeding, and nothing on confinement restrictions such as less water or no vegetables or fruit. The post-feed page names 1 food (milk).
- **Why it matters:** Breastfeeding raises her needs, and many Indian families follow strict jaapa diets: heavy ghee and sugar laddoos, or restricting water and vegetables. She gets no practical, culturally aware guide, and the after-birth plan never mentions food.
- **Advice:** A 'Food after the birth' card set, linked from post-feed and from the after-birth plan as a weekly step: - Keep: dal, milk or curd, eggs or paneer, green sabzi, water at every feed. - Make smaller: laddoos and panjiri heavy in ghee and sugar (suggest til, ragi, dry fruit, a smaller laddoo). - Drop: restricting water, fruit or vegetables. - How much extra: in rotis and katoris, from ICMR-NIN's breastfeeding needs (exact amounts to be set by the doctor). Filter by diet type and region. Call the customs 'tradition', the way the pregnancy myths do.
- **Effort:** M; new wording needs doctor review
- **Checked:** The finding contradicts itself. post-feed's visible text names only milk, but its folded myth (post.js:384) names ghee, laddoos, gond and methi. Two more places mention her food: the 'First 40 days' card in Explain it to my family ('good food like dal, milk, eggs or paneer…', family.js:18), and Anganwadi take-home food for mothers until the baby is 6 months old on the after-birth schemes page (access.js 'thr').
- **Screenshot:** `web/test/shots/diet-ux/diet/post-plan-en-360.png`

### P1 · Heavy periods: one repeated iron line for 63 days, blind to her region, with no plate link (DIET-06, diet audit)

- **Where:** web/mods/plan.js:1313-1317, 1639-1645; web/mods/cond.js:538-545; web/mods/journey.js (iron days)
- **Found:** plan.js:1315: after day 21 the step is always plan_a_ironf ('An iron-rich food today: Green leafy sabzi, chana, rajma or eggs, with lemon or amla'), the same text on days 22 to 84. The Chennai egg-eater gets 'rajma', not keerai, drumstick leaves, ragi or sundal, though LOCAL.south has them (plan.js:121-123). The light plan page (renderLight, plan.js:1639-1645) has no My plate tile. The richest iron list is on cond-anaemia (cond.js:538-545: gongura, kulthi, rajgira, halim) and the plan doesn't use it.
- **Why it matters:** Nine weeks of the same sentence reads as a copy-paste companion, and her local iron foods never appear. The 12-week iron promise loses its food half.
- **Advice:** Turn the iron step into a 7-day rotation by region and diet type: one green, one pulse, one millet, one vitamin C pairing, one 'iron kadhai' day, and, for egg or non-vegetarian women, one egg or fish day. Use LOCAL plus the anaemia list. Add an 'Iron foods' section to the plate (tagged foods), and a My plate tile on every light plan that has food.
- **Effort:** M; new wording needs doctor review
- **Screenshot:** `web/test/shots/diet-ux/diet/heavy-plan-en-360.png`

### P1 · Only 3 diet types: no Jain, no onion-garlic-free, no 'no milk' (DIET-07, diet audit)

- **Where:** web/mods/plan.js:93, 120-134, 138-139, 1120
- **Found:** Q.food offers veg, egg and nonveg only (plan.js:1120; plate chips plan.js:548). dietOk filters only eggs and meat (plan.js:134). A Jain woman is shown 'Salad: kheera, gajar, tamatar' (plan.js:93), 'Beans, carrot, cabbage' (south) and sprouts as a breakfast protein (HABITS 'protein', journey day 18). The no-milk case exists only as one line on meno-bones (meno.js:374).
- **Why it matters:** Jain and onion-garlic-free (satvik) households are a big group in the north and west. Showing root vegetables tells them the app isn't for them, and they can't filter.
- **Advice:** Add 'Jain' and 'No onion or garlic' as diet options, plus a separate 'I don't take milk' toggle. Tag foods 'root', 'og' and 'dairy' and filter as dietOk does. Give Jain swaps (lauki, tori, raw banana, moong; a curd-based salad instead of gajar). Ask in joining with the other food question.
- **Effort:** S; new wording needs doctor review
- **Checked:** The MORE list salad with gajar (plan.js:93) is inside the folded 'All foods' details when a region is known. The south LOCAL list (carrot) and the sprouts chips are visible.
- **Screenshot:** `web/test/shots/diet-ux/diet/pmos-plan-plate-en-360.png`

### P1 · Her vrat and roza days aren't part of her plan; vrat ideas ignore PMOS sugar (DIET-08, diet audit)

- **Where:** web/mods/plan.js:558, 1304-1309; web/mods/periods.js:367-400
- **Found:** The plan never asks about fasting. On a fast day the step stays 'Protein at breakfast' or 'One millet swap' (plan.js:137-144, 1305-1308). The good fasting page is a button at the very bottom of the plate (plan.js:558). Its vrat ideas lead with 'sabudana khichdi with peanuts' (periods.js:395), with no note that sabudana and potato raise sugar fast for women with PMOS or diabetes in pregnancy. No festival-month card.
- **Why it matters:** Weekly vrats (Monday, Thursday, Ekadashi), Navratri and Ramzan are routine for many of the women Sakhi serves. A plan that tells her to eat protein at breakfast on a nirjala day feels foreign, and she drops it.
- **Advice:** Ask 'Do you fast?' in joining: a weekly day, Ekadashi, Navratri, Ramzan, Karva Chauth. On those days the food step becomes its vrat version: rajgira, kuttu or singhara roti with curd, makhana, fruit, roasted peanuts, and sabudana in a smaller helping with peanuts for PMOS. Sehri and iftar versions for Ramzan. Add a month card ('Navratri starts in 5 days') from a festival calendar bundled offline. Link to the fasting page from the plan, not only from the plate.
- **Effort:** M; new wording needs doctor review
- **Screenshot:** `web/test/shots/diet-ux/diet/pmos-periods-fasting-en-360.png`

### P1 · Veg/egg/non-veg and region can be changed only inside the PMOS plan (F2, findability)

- **Where:** web/mods/plan.js:1639 (renderLight), plan.js:533 (renderPlate chips), web/app.js:3249 (renderMeHealth)
- **Found:** - My plate (plan-plate) is linked only from the cycle (PMOS) plan. Within 6 taps from Today it is never reached for the heavy-periods, pregnant or 40+ women (bfs-heavy/preg/meno-en.json: NOT REACHED). After a birth it takes 4 taps via Explore > Conditions > PMOS. - The page for every other plan (plan.js:1639-1644, renderLight) has no food section. Its Plan settings hold only the reminder, 'Change what I work on' and 'Stop my plan' (tasks-out.txt T5). - Me > My health details has no food row. - The only route is 'Change what I work on', at 2.78 screens down My plan. It 'Starts a new 12 weeks' and asks the joining questions again. - The PMOS woman can change food in 2 taps (Today food row, then chips at 0.72 screens) and region in 3 (the 'Change' link, then a region chip).
- **Why it matters:** A woman whose eating changes, who keeps Jain or festival habits, who moves region, or who answered wrong at joining can't fix it without losing her plan's weeks. Her heavy-periods iron steps keep following the old answer, because plan.js:1316 reads d.food. This hits complaint 2 (not Indian enough) and complaint 4 (hard to find).
- **Advice:** Add one 'My food' row in Me > My health details and in every plan's Plan settings. It covers Vegetarian / Eggs too / Non-veg / Jain (no onion, garlic or root vegetables), her fasting days, and her region (from her PIN, and changeable). It writes the same d.food and d.region and never restarts the plan. Show her current choice as a small chip on My plate and on Today's food row (for example 'Veg · West India · Change').
- **Effort:** M; new wording needs doctor review
- **Checked:** Mostly right, with these fixes: - 'Linked only from the cycle plan' is wrong. My plate is also on My plan's plan list when no plan runs (catalogue, plan.js:950; 2 taps for the no-plan woman, at 2.26 screens). The TTC plan's daily food step links to it (plan.js:1323), and so does the 40+ weight goal's (plan.js:1356). - In pregnancy My plate is hidden on purpose (fit: !preg), with Food in pregnancy instead. - For the heavy-periods woman, 'Change what I work on' is at 2.25 screens; 2.78 is the PMOS page. - The BFS stopped at 5 taps, not 6. - The chips are at plan.js:548. - My plate's chips already write D().food and D().region for any running plan without restarting it (plan.js:561, 563). So linking My plate from every plan page except pregnancy covers most of the fix; a new 'My food' row is optional.
- **Screenshot:** `web/test/shots/diet-ux/findability/T5-heavy-my-plan.png`

### P1 · Iron, pregnancy and after-birth food ignore her region (DJ-04, persona journeys)

- **Where:** mods/journey.js (iron), mods/preg.js (DIET), mods/post.js (self_2)
- **Found:** Her PIN code resolves to South India and My plate shows keerai and sundal, but the iron steps are fixed North Indian: day 4 'palak, methi, bathua or sarson' (journey.js:37) and day 7 'rajma or lobia' (journey.js:40). Food in pregnancy has one national list in grams (preg.js:481-491). After birth there is one generic line (post.js:166). The region lists (plan.js:108-135) are used only on #plan-plate.
- **Why it matters:** Lakshmi in Chennai is told to cook bathua and sarson. Shabana in Lucknow and Meera in Ahmedabad get no local food at all. It is Mohit's complaint 2.
- **Advice:** Make the region lists a shared helper (S.food.local(region, diet, tag)). Tag foods for iron, calcium, protein and pregnancy-safe, and fill the iron steps, the pregnancy plate and a breastfeeding plate from it, keeping the national list as a fallback. No network is needed.
- **Effort:** M; new wording needs doctor review
- **Checked:** Two parts are overstated. After a birth there are a few generic lines, not one: recovery self_2 (post.js:166), the mood page's 'Eat regular meals, and drink water at every feed' (post.js:427) and a constipation tip (post.js:146). My plate, with its West list, is an open route that fits a post-birth woman in the catalogue (plan.js:950), but it is reached only through the PMOS hub or search, never from the after-birth pages. For Shabana in Lucknow, the national pregnancy list already names North Indian greens (palak, methi, sarson) and rajma/chana, so 'no local food at all' mostly applies to Meera and to non-North regions.
- **Screenshot:** `web/test/shots/diet-ux/journeys/lakshmi/plate-south.png`

### P1 · No budget lens: nothing marks food as low-cost, and some picks are dear (DJ-05, persona journeys)

- **Where:** #plan-plate, the iron steps, #preg-diet
- **Found:** Joining never asks about budget, and the plate shows no cost markers. Iron day 13 suggests pumpkin seeds (journey.js:46). The pregnancy iron card names 'dry fruits'. Searches for sasta and budget return nothing; 'cheap iron' returns Iron tablets and the pregnancy logs (lakshmi.json).
- **Why it matters:** Lakshmi, on a limited budget, can't tell which iron foods she can afford every day, and she may skip the plan as 'not for me'.
- **Advice:** Mark each food in the shared list with a cost: ₹ (low cost) or ₹₹. Show low-cost foods first and add a 'Keep it low-cost' choice in 'Your day'. Name cheap iron and calcium foods first: chana, poha with lemon, til, ragi, drumstick leaves and local saag, eggs, small dried fish and liver for those who eat them, and the free Anganwadi ration in pregnancy.
- **Effort:** S; new wording needs doctor review
- **Checked:** Part of the recommendation already exists. The free Anganwadi ration is on Food in pregnancy ('Free food for you') and in the week-30 tip. The Anaemia page's iron list is mostly low-cost already (greens, ragi/bajra, dals, til, gur, fish/liver). What is missing is any cost marker, any low-cost ordering, and a budget question.
- **Screenshot:** `web/test/shots/diet-ux/journeys/lakshmi/d01-today.png`

### P1 · No Jain choice, and food type is never asked after a birth or for pregnancy food (DJ-06, persona journeys)

- **Where:** Joining 'Your day' screen; #plan-plate; post.js
- **Found:** The diet options are only vegetarian, eggs too and non-vegetarian (plan.js:1121, plate chips plan.js:548). The food question is asked only for the cycle, heavy, trying, 40+ weight and pregnancy iron plans (plan.js:1133), so Meera and Shabana are never asked. Meera's only food line says 'dal, eggs or paneer' (post.js:166). The national list has 'Salad: kheera, gajar, tamatar' (plan.js:93), and gajar is a root vegetable. Searches for jain and 'no onion garlic' return nothing.
- **Why it matters:** Meera, a Jain mother, is offered eggs and root vegetables and learns Sakhi doesn't know how she eats. Shabana's non-vegetarian food is never asked about.
- **Advice:** Ask 'What do you eat?' for every goal, with Jain added (and optionally 'fish but no meat'). Use a Jain filter: no root vegetables, onion or garlic, plus a note about meal timing for those who eat before sunset. Filter every food string by diet. Add Jain fasts (Paryushan, ayambil) to the fasting page.
- **Effort:** S; new wording needs doctor review
- **Checked:** Minor line slips: the food options are at plan.js:1120 and qsOf is at plan.js:1133. The 'gajar' salad item is in the national MORE list, which sits under the collapsed 'all foods' details when a region is set.
- **Screenshot:** `web/test/shots/diet-ux/journeys/meera/plate-west.png`

### P1 · Ramzan in pregnancy: nothing notices it, and the only page is under Periods (DJ-08, persona journeys)

- **Where:** #periods-fasting; #preg-diet; pregnancy plan on Today
- **Found:** Shabana's Today on day 105 (about 8 Feb 2027, 28 weeks) says nothing about Ramzan (shabana/d105-ramzan-today.png). The fasting page is 'Fasting and periods' in the Periods section (periods.js:95, 482). For pregnancy it says only 'Talk to your doctor before fasting if you are pregnant' (periods.js:379). Food in pregnancy and the pregnancy plan don't link to it (preg.js:471-540).
- **Why it matters:** Shabana, who keeps roza, would look under Pregnancy and find nothing on sehri, iftar, fluids or the signs to stop. At 28 weeks the stop signs include the baby moving less. Breastfeeding women who fast are in the same spot.
- **Advice:** Add a 'Fasting in pregnancy and while breastfeeding' section. Say respectfully that pregnant and breastfeeding women are exempt in most traditions. If she chooses to fast: sehri and iftar plates (non-veg and veg), fluids between iftar and sehri, a doctor visit before Ramzan for GDM, BP or anaemia, and stop signs (dizziness, very dark urine, less movement from the baby, contractions). Link it from Food in pregnancy and Breastfeeding. Optionally ask once 'Do you keep fasts? Which?', and show one Today card the week before, with festival dates worked out offline.
- **Effort:** M; new wording needs doctor review
- **Checked:** Search does find the page: 'roza', 'ramzan', 'ramadan' and 'sehri' all open Fasting and periods. 'iftar' finds nothing.
- **Screenshot:** `web/test/shots/diet-ux/journeys/shabana/fasting-first-screen.png`

### P2 · Region is coarse and never reaches the daily steps (DIET-11, diet audit)

- **Where:** web/mods/plan.js:62-85, 108-133, 137-144, 1315
- **Found:** 6 regions (plan.js:62-70). 'east' mixes Bihar sattu, Bengal kalmi saag and fish, and Odisha mandia (plan.js:125-127). 'west' mixes Rajasthan ker-sangri and Goa fish. The habit texts are national regardless of region: the millet swap says 'bajra, jowar or ragi roti, daliya or brown rice' to a Bengali rice-eater, and the breakfast habit offers besan cheela to a Tamil woman (plan.js:139-140). The iron steps never read the region (plan.js:1315).
- **Why it matters:** Her own foods appear only on the plate, not in what Sakhi asks her to do each day. The daily step reads like a north-Indian default.
- **Advice:** Make the habit and iron step texts take a regional example: east 'one katori less rice, one more of dal'; south 'ragi dosa or idli with sambar'; west 'bajra bhakri'. Then split the biggest mixed buckets by state (the PIN code already gives the state): Bihar and Jharkhand, Bengal, Odisha; Rajasthan, Gujarat, Maharashtra, Goa; Kerala, Tamil Nadu.
- **Effort:** M; new wording needs doctor review
- **Screenshot:** `web/test/shots/diet-ux/diet/heavy-plan-plate-en-360.png`

### P2 · No budget or season: costly items sit next to cheap ones, and only 3 of 110 items mention a season (DIET-12, diet audit)

- **Where:** web/mods/plan.js:90-133; web/mods/preg.js:521
- **Found:** The 'more often' lists include oats, brown rice, a handful of nuts and paneer alongside chana and peanuts, with no cost tag (plan.js:91-96). Season appears 3 times in 110 items ('Bajra or makki roti in winter', 'ber in season', 'jamun in season'). Free food is mentioned only for pregnancy (Anganwadi, preg.js:521). There's no ration (PDS) millet or dal link for other stages.
- **Why it matters:** For a low-income woman, 'brown rice or oats' reads as not for her. Without season, the lists ask for guava or sarson when they're out of season or expensive.
- **Advice:** Tag foods 'low cost' and list the cheapest first (roasted chana, peanuts, seasonal greens, sattu, eggs where she eats them). Add a month-wise 'in season now' card per region from a small table bundled offline. Mention ration millets and dals where states give them, checked state by state.
- **Effort:** M; no new health wording
- **Checked:** 4 of 110 items mention a season, not 3: 'Seasonal vegetables' (MORE) is one too. Free food is not pregnancy-only. The after-birth schemes page (access.js 'thr', in the post list) offers Anganwadi take-home ration until the baby is 6 months old. Nothing mentions PDS millets or dals for other stages.
- **Screenshot:** `web/test/shots/diet-ux/diet/pmos-plan-plate-en-360.png`

### P2 · Joint-family cooking gets one line; food barriers aren't asked about (DIET-13, diet audit)

- **Where:** web/mods/plan.js:449, 1811, 1820
- **Found:** Family cooking appears only in plan_tip_family ('One healthy plate can feed the whole family', plan.js:1811) and the plate footnote ('Eat what your family eats, with these changes', plan.js:1820). The look-back's 'what got in the way' options are time, tired, pain, family, out and none (plan.js:449). None of them is about food: who decides the menu, no time to cook, or cost.
- **Why it matters:** Most of these women cook one meal for the family and don't choose the menu, which the lifestyle research flagged. Without 'cook once, change your plate' tips, the habits stay theory.
- **Advice:** Add 'one pot, your plate' tips: - take your sabzi out before the extra oil or tadka; - add one more katori of dal to your own plate; - make one bajra roti among the wheat ones; - eat the salad first. Add a food barrier ('My family decides the food') with a matching tip. Add a food card to 'Explain it to my family'.
- **Effort:** S; new wording needs doctor review
- **Checked:** Outside plan.js the app does touch family cooking. pmos.food-for-hormones says 'the plate your family already eats, arranged differently'. simple-indian-plate says 'Add a bowl of dal or sabzi to the meal you already eat'. The family cards include food for after birth ('forty') and pregnancy (partner card: 'A little more food every day'). None of these is a 'cook once, change your plate' tip, and there is no food-barrier option.
- **Screenshot:** `web/test/shots/diet-ux/diet/pmos-plan-en-360.png`

### P2 · 'West India' gives a Jaipur woman Marathi food words (DJ-14, persona journeys)

- **Where:** #plan-plate, 'From West India'
- **Found:** plan.js:113-115: bhakri, nachni, matki usal, shepu, taak, and in Hindi उसळ and नाचणी with the Marathi ळ. Rajasthan's only item is ker-sangri. regionOfPin already separates PIN prefixes 30 to 34 for Rajasthan, 36 to 39 for Gujarat and 40 to 44 for Maharashtra (plan.js:71-82), but maps them all to one region.
- **Why it matters:** Riya reads foods her family doesn't cook or call by those names, so the 'local' list feels generic.
- **Advice:** Add state sub-lists inside the big regions, starting with the largest. Rajasthan: bajra roti, moth and moong, kadhi, methi, chaas, ker-sangri, gatte with less oil. Gujarat: rotla, khichdi-kadhi, dhokla, thepla with less oil. Uttar Pradesh and Bihar split from North and East. Pick the list from the first 2 or 3 PIN digits, offline.
- **Effort:** M; new wording needs doctor review
- **Checked:** regionOfPin does not already separate the states. It is one range: `if (p2 >= 30 && p2 <= 44) return 'west'` (plan.js:76), and the states appear only in a comment, so a split would be new (though simple and offline). The West list mixes Marathi words (bhakri, nachni/नाचणी, usal/उसळ, shepu, taak) with Gujarati ones (rotla, khakhra, dudhi, gavar). It already has bajra, moth (as 'matki'), methi and chaas, which fit Rajasthan but carry Marathi names.
- **Screenshot:** `web/test/shots/diet-ux/journeys/riya/d01-plate-hi.png`

### P3 · Tamil is offered at joining, but most of Today stays in English (DJ-21, persona journeys)

- **Where:** Language screen; Today in 'ta'
- **Found:** Lakshmi's Today in Tamil: 174 of 237 words in English, 25 in Tamil (lakshmi.json taLatin). Joining lists Tamil as a partial translation, and there is no Gujarati for Meera in Ahmedabad.
- **Why it matters:** A Chennai woman who picks Tamil reads her iron steps in English.
- **Advice:** Until the food content is translated, say on the language screen which parts are in Tamil. Translate food steps and food names first, since they are short and reused.
- **Effort:** M; new wording needs doctor review
- **Checked:** Part of the recommendation already exists. Joining marks Tamil 'Partly translated' (ob_partly), and the language sheet says 'Main screens and the safety guide. The rest in English for now.' (lang.js status(), lang_st_part_en). What is left is naming the food content specifically, and translating it.
- **Screenshot:** `web/test/shots/diet-ux/journeys/lakshmi/today-ta.png`

## Text-heavy (21)

### P1 · Food pages are walls of words with no food pictures (DIET-10, diet audit)

- **Where:** web/mods/preg.js:820-833; web/mods/meno.js:362-420; web/mods/cond.js:504-560; web/mods/periods.js:367-400; web/mods/plan.js:368, 542
- **Found:** At 360 px, English: - preg-diet: 649 words, 0 pictures, 4.4 screens - meno-bones: 847 words, 0 pictures, 4.7 screens - cond-anaemia: 883 words, 0 pictures, 4.8 screens - periods-fasting: 496 words, 0 pictures, 2.9 screens - Learn pmos.food-for-hormones: 447 words, 0 pictures; Learn mind_body.simple-indian-plate: 425 words, 0 pictures The plate has 1 drawing (plateSvg, plan.js:368). Its 39 to 44 chips carry only 6 generic group icons (icoHtml by group), not pictures of the foods.
- **Why it matters:** Women with low reading skill or little time skip long pages. Food is the most picturable topic in the app, and it has the fewest pictures (Mohit's complaint 3; his own 23 Oct vision asked for graphics over text).
- **Advice:** Draw about 40 offline SVG food icons in the same style as Sakhi's figures (roti, bhakri, rice, ragi, dal katori, rajma, chana, egg, fish, paneer, curd, sabzi, saag, salad, guava, amla, chaas, peanuts...) and use them on the chips, meal cards and steps. Add 4 kitchen-measure icons (katori, ladle, glass, spoon). Put a one-screen picture summary on top of each long food page ('Your day in pregnancy: 3 pictures') and fold the rest. Make the plate interactive: she taps what's on her thali and the drawing fills, with one gentle next step. This is the private, offline answer to Selena's photo scanner, with no score and no camera.
- **Effort:** L; no new health wording
- **Screenshot:** `web/test/shots/diet-ux/diet/meno-meno-bones-en-360.png`

### P1 · Pregnancy 'Food and activity' is one 649-word article, repeated daily for 26 weeks (DJ-09, persona journeys)

- **Where:** Today pregnancy plan; #preg-diet
- **Found:** plan.js:1338: the pregnancy food step is a link to #preg-diet with a Done button, and it is identical on days 2, 8, 15, 43, 71, 105, 111 and 131 (shabana.json). The page is 649 words, 4.4 screens and 0 pictures. Amounts are raw grams (240 g cereals, 80 g pulses, 300 g vegetables; preg.js:481-491), and 'calories' appears 4 times. Hindi keeps 32 English words (IFA, calcium, protein, mg, brewed caffeine, cold drink, dietitian). There is no veg/non-veg view and no activity step, although the goal says 'Food and activity'.
- **Why it matters:** Shabana taps Done on the same long page each day and learns nothing new by trimester. Grams mean nothing to her in a home kitchen.
- **Advice:** Make the food step change by trimester: nausea foods (weeks 6 to 14), iron with vitamin C and calcium from 14 weeks, the sugar-test plate at 24 to 28 weeks, small frequent meals in the third trimester. Each is a picture card with katori, roti and glass measures (240 g cereal is about 6 roti or 3 katori of rice), no calorie numbers, a diet filter, and the avoid list as one picture card. Add the walk step behind a doctor's OK, as the lifestyle research planned.
- **Effort:** M; new wording needs doctor review
- **Checked:** Some of this already exists. The extra-need line is in kitchen terms ('Roughly one roti, a bowl of dal and a glass of milk', preg.js ~476). The weekly pregnancy guide has trimester food tips (week 20: extra food in roti/dal/milk; week 25: fibre; week 29: smaller meals for heartburn; week 30: Anganwadi). What is missing is the food step changing by trimester. 'calories' is in the source 4 times, but only 3 show, since one sits in a closed myth.
- **Screenshot:** `web/test/shots/diet-ux/journeys/shabana/preg-diet.png`

### P1 · Food screens are long text with almost no food pictures (DJ-12, persona journeys)

- **Where:** #plan-plate, #preg-diet, #cond-anaemia, #meno-bones, #post-feed, #periods-fasting
- **Found:** Words / screens / pictures: - My plate: 239 to 299 / 3.3 to 3.8 / 1. Its 41 glyphs are one icon per food group, not per food. - Food in pregnancy: 649 / 4.4 / 0. - Anaemia: 853 / 4.2 / 0, longest paragraph 65 words. - Bones and heart: 902 / 4.3 / 0. The calcium card folds after 2 foods. - Breastfeeding: 406 / 3.7 / 0. - Fasting: 496 / 2.9 / 0.
- **Why it matters:** Sunita reads slowly and only Hindi, and Riya scans between meetings. Neither gets the 'graphics over text' Mohit asked for in the lifestyle research (section 8). It is Mohit's complaint 3.
- **Advice:** Make food pages picture-first: - a simple line drawing per food, offline SVG in art.js's style; - the ½·¼·¼ plate filled with her own foods; - the first 3 foods per group, with more on tap; - at most about 120 words on the first screen, the details folded below. Keep read-aloud on every card.
- **Effort:** L; no new health wording
- **Checked:** Small number fixes. The Bones and heart figure of 902 words / 4.3 screens is the Hindi page; English is 847 / 4.7. Anaemia is 853 words over 4.7 screens at 360×800, and Breastfeeding is 406 words over 4.1. My plate is 238 to 299 words, depending on the habits card.
- **Screenshot:** `web/test/shots/diet-ux/journeys/sunita/meno-bones-calcium.png`

### P1 · Pregnancy food page is a 4.4-screen wall of words with no pictures (VD-01, visual density)

- **Where:** web/mods/preg.js:820 (renderDiet), web/mods/preg.js:481 (DIET.plate table)
- **Found:** preg-diet at 360x800: 651 visible words (+172 folded myths), 4.41 screens, 0 pictures (visual share 0.0%), 136 words on the first screen, 104 words under 14 px. The day's food is a grams table (240 g cereals, 80 g pulses, 400 ml milk, 300 g vegetables) plus 'about 350 extra calories a day'. The Hindi version (674 words) mixes in English: 'IFA और calcium', '350 calorie', 'protein', 'g'.
- **Why it matters:** A woman with low literacy or numeracy can't turn grams and calories into a meal, so the pregnancy food guidance (a core V38 plan) goes unused. Calories also run against the no-calorie-counting rule in spirit.
- **Advice:** Lead with one picture plate for the day: a row of food drawings with household measures (2 rotis, 1 katori dal, 1 glass milk, 1 fruit). Show 'from the 4th month add' as a picture sum (roti + katori dal + glass of milk) instead of calories. Show the avoid list as red-cross picture cards. Keep the myths folded, and keep the grams table in a 'For your doctor' fold. Already in the app: 31 produce drawings in art.js (chawal, atta, chana, rajma, masoor, matar, amla, nimbu, amrood, papita, nariyal…), which need a small S.art.food(key) accessor because today they're only reachable by pregnancy week (art.js:143). New art: katori, glass, roti, thali, egg, fish, til, ragi (about 8 small SVGs). Food pictures are neutral, so they are safe in discreet mode.
- **Effort:** M; new wording needs doctor review
- **Checked:** Accurate on the pictures and the grams table. Four details need correcting. (1) The page already turns the calories into household words: "Roughly one roti, a bowl of dal and a glass of milk" (preg.js:476), and the milk row already reads "(about 2 glasses)". The new part is drawing them, not finding the measures. (2) About 84 of the 651 counted words sit in a card the app already folds behind "Show more" (tidyView, app.js:3627-3636), so less is readable at first glance than stated. (3) Some art.js drawings need variants before they work as food tiles. chawal and atta are sacks labelled "1 kg"/"2 kg", and khaskhas, rai and masoor sit under a magnifying glass. (4) The 350-calorie figure is doctor-verified ICMR-NIN guidance, not calorie counting. Picturing it fits the rules, but turning the grams table into rotis and katoris is new wording that needs doctor review, which the finding already flags.
- **Screenshot:** `web/test/shots/diet-ux/density/preg-diet-en.png`

### P1 · Iron, calcium, breastfeeding and fasting food pages have zero pictures (VD-02, visual density)

- **Where:** web/mods/cond.js:504 (renderAnaemia), web/mods/meno.js:361 (renderBones), web/mods/post.js:681 (renderFeed), web/mods/periods.js:368 (renderFasting)
- **Found:** - anaemia: 864 words, 4.79 screens, 192 lines of text, a 65-word block, 0 pictures. - meno-bones: 847 words, 201 on the first screen, calcium given as 'about 300 mg' rows, 0 pictures. - post-feed: 407 visible + 902 folded words, 0 pictures. - fasting: 497 words, 192 on the first screen, 0 pictures. Hindi versions run 902 to 1,406 words.
- **Why it matters:** The diet guidance that strengthens heavy periods, midlife bones, breastfeeding and fasting days is buried in reading. These are the 'diet feels thin' screens: the content exists, but she can't see it.
- **Advice:** Open each page with a 'Foods that help' strip of 6 to 8 drawings, then fold the existing verified text under 'Read more'. Use the same food-tile component as My plate (VD-03). - Iron: chana, rajma, masoor, matar, plus nimbu, amla and amrood for vitamin C. All are already drawn in art.js. - Calcium: ragi, til, dahi, milk (new art). Show calcium as a 'katoris a day' dot meter instead of mg. - Breastfeeding: an extra katori and a water glass. - Fasting: a sargi/sehri plate and an ORS glass.
- **Effort:** M; new wording needs doctor review
- **Checked:** The zero-pictures claim holds, but several details are wrong. (1) post-feed is not a food page. It is the breastfeeding page: a feed timer, left/right logging, the baby's danger signs, and folded guides on latch, supply and storage. The mother's own food appears only in the ghee/laddoo myth line, so "an extra katori" would be new health wording that needs doctor review. (2) The anaemia page already has small pad and clot pictograms in its heavy-bleeding chart (cond.js:457-459). (3) meno-bones already gives calcium per household portion: "A glass of milk: about 300 mg" and "A katori of dahi". (4) Much of the counted text is already folded behind the app's "Show more": about 370 of 864 words on anaemia, 274 of 847 on meno-bones and 167 of 497 on fasting. (5) The Hindi range is 444 to 948 visible words. The 1,406 figure is post-feed including its folded guides, and fasting is 559. The fasting sargi/sehri and ORS idea does match text the page already has.
- **Screenshot:** `web/test/shots/diet-ux/density/meno-bones-en.png`

### P1 · My plate lists 40 foods as small text chips, not pictures (VD-03, visual density)

- **Where:** web/mods/plan.js:536 (renderPlate), web/mods/plan.js:2197 (.pl-f font-size 13px), web/mods/plan.js:354 (ICO: 9 group icons)
- **Found:** plate at 360x800: 245 visible words over 3.46 screens. The 40 food chips use 13 px text and one 18 px icon per food group, so bajra bhakri, ragi bhakri and khichdi all show the same grain icon. 149 of the 245 words are under 14 px. The only picture is the 280x174 plate diagram. Colour (12 px dots) is the main cue for more often / less often / avoid. The 'Everywhere in India' summary is 32 px tall.
- **Why it matters:** The main food tool reads like a list, so she can't scan it in a shop or kitchen. Women with low literacy or colour-blindness lose the green/amber/red meaning.
- **Advice:** Use 2-column food tiles: a drawing, a 15–16 px name (Devanagari in Hindi), and a ✓ / – / ✗ badge as well as the colour. Show group headers as icons and keep the plate diagram on top. Turn 'Your food habits' into picture cards. Already in the app: 31 art.js produce drawings, the plate SVG, the 3 colours. New art: about 20–25 regional staples (bajra/jowar roti, ragi, idli, dosa, poha, upma, a dal katori, paneer, egg, fish, chaas, sprouts, peanuts, khakhra). The foods themselves don't change, so no new health wording.
- **Effort:** L; no new health wording
- **Checked:** The 40 chips are a total, but 18 of them (the MORE list) are folded under "Everywhere in India". Only 22 show without a tap. Colour is not the only cue at section level either: each group has a written heading (eat more often, less often, avoid) next to the 12 px dot. Individual chips do carry only colour. The rest checks out: 13 px chips, one 18 px group icon per food group, and the same grain icon on bhakri, nachni bhakri and khichdi.
- **Screenshot:** `web/test/shots/diet-ux/density/plate-en.png`

### P1 · Learn articles and the library are text-only (VD-05, visual density)

- **Where:** web/app.js:2950 (renderArticle), web/app.js:2935 (renderLearn), web/app.js:1044 (artHtml rows)
- **Found:** - Plate article (a-mind_body.simple-indian-plate): 425 visible words, 2.81 screens, a 72-word paragraph, 0 pictures. It describes a steel thali in words ('two ladles of sabzi, a bowl of thick dal…'). - Hormone-food article (a-pmos.food-for-hormones): 447 words, 7 sentences over 20 words. - Learn library: 884 words, 5.95 screens, 0 pictures; every row has a summary of about 40 words. renderArticle draws no art at all.
- **Why it matters:** The doctor-verified library is out of reach for a low-literacy reader. The food articles describe a picture that the app already draws elsewhere (the plate SVG).
- **Advice:** Articles: an art.spot hero, '3 things to remember' as icon bullets, and a Listen button at the top. Embed the plate SVG (plan.js:368) and food drawings in the food articles, and fold the body after the first section. Learn list: titles with the group picture only, summary on tap (about 884 → 300 words). All assets exist. The new '3 things' lines are new health wording, so they need review.
- **Effort:** M; new wording needs doctor review
- **Checked:** (1) Learn row summaries average about 26 words on the All view (13 to 50 across all 69 articles), not about 40. (2) The plate drawing (plateSvg) is private to plan.js and is not in the S.plan exports (plan.js:1770). It also sits in the plan module, which PLAN_RELEASE can switch off. The core renderArticle would need an exported accessor to use it. (3) Learn rows already show a 20 px group icon, and the larger S.art.spot pictures already exist for Learn groups (art.js:189-191) but are unused there. The other numbers hold.
- **Screenshot:** `web/test/shots/diet-ux/density/art-plate-en.png`

### P1 · Plans other than PMOS get a picture-less My plan, with an empty chart (VD-06, visual density)

- **Where:** web/mods/plan.js:1647 (renderMyPlan), web/mods/plan.js:387 (renderHub), web/mods/plan.js:427 (tiles)
- **Found:** - My plan for pregnancy, heavy periods, midlife, after birth, trying and PMS: 0 pictures, visual share 0.6–0.9%, 143–208 words, 2.2–3.1 screens. The PMOS version has a minutes ring and 2 moving figures. - 'Days you followed your plan, each week' draws a blank box of about 150 px with '0' labels when there is no data. - The 12-week path repeats 'Your daily steps' on every week. - The plate / moves / body / progress tiles appear only on the PMOS plan, at y=1670 (about 2.1 screens down).
- **Why it matters:** Most goals (V38) get a plain text page. Their food guidance has no tile to reach it, and the empty chart looks broken.
- **Advice:** One My plan layout for every goal: - a progress ring at the top (days followed this week); - step rows with their pictures; - a food tile that opens the stage's own food page (preg-diet, the iron foods, post-feed, meno-bones); - ghost bars with 'Your first bar appears tomorrow' instead of the empty chart; - path weeks labelled with the habit added that week and its icon. All assets already exist in the app.
- **Effort:** M; no new health wording
- **Checked:** The picture-less page, the empty chart and the PMOS-only tile grid are all accurate. The claim that the food guidance has nothing to reach it is wrong for most goals: the step rows already link to it. For pregnancy (food goal), the "Food in pregnancy" step opens preg-diet; it is visible in the cited myplan-preg-en.png (plan.js:1336). The after-birth feed goal opens post-feed (plan.js:1343). The trying-for-a-baby and midlife-weight food steps open My plate (plan.js:1320, 1355). Only the heavy-periods iron step (it opens 'plan') and pregnancy's nausea, sleep and mood goals have no food link. The pregnancy path shows trimesters, not a repeated "Your daily steps" (plan.js:1561-1566). Also post-feed is the breastfeeding page, not a food page.
- **Screenshot:** `web/test/shots/diet-ux/density/myplan-preg-en.png`

### P1 · Plan reveal: 'Your 3 steps' is 126 words with 20 px icons; the disclaimer repeats 6 times (VD-07, visual density)

- **Where:** web/mods/plan.js:1445 (renderReveal)
- **Found:** The reveal is 487 words over 6 cards. Card 2 has 126 words (106 above the fold) and three 20 px icons, and each step's reason runs 25–30 words. The 21-word 'Everyday habits from national guidelines…' line repeats on all 6 cards (126 words, 26% of the reveal). Cards 3–6 have no picture (visual share 0.2%). Hindi card 2 is 143 words.
- **Why it matters:** The moment that sets her expectations is mostly reading. Women skim past the 3 steps they're meant to remember.
- **Advice:** - One picture card per step: the animated walk figure (P.walk), the plate SVG, a moon or bed. - 6–8 words a step, with the reason behind a 'Why?' tap and read aloud. - 'How each day works' as a 3-icon strip: tap Done → 8 pm check-in → Sakhi answers. - The disclaimer once, on the Start card. The assets exist. The shortened lines are new wording (section 15 of the review already waits for the doctor).
- **Effort:** S; new wording needs doctor review
- **Checked:** The step reasons run 16 to 22 words, not 25 to 30 (plan_fb_move 22, plan_fb_food 16, plan_fb_sleep 16). The repeated footnote is 20 words. The day card can also play Dr. Megha's audio (plan_rv_aud) when that clip exists, which partly covers the read-aloud idea. The rest holds: the footnote is on every card, cards 3 to 6 have no picture, and the reveal totals 487 words.
- **Screenshot:** `web/test/shots/diet-ux/density/reveal-card-2-en.png`

### P1 · Danger signs are text bullets only (VD-08, visual density)

- **Where:** web/app.js:2967 (renderHelp), web/mods/post.js:681 (renderFeed), web/mods/cond.js:504
- **Found:** - Help: 300 words, 3.02 screens, 0 pictures. 'Call 112 now if' is 3 long bullets (about 60 words) in a dark card, followed by 'See a doctor today if' bullets. - Breastfeeding: 'Take your baby to hospital now if' is 5 text bullets. - Anaemia: its 'Call 112 now if' line is text. The only aid for a woman who can't read is the top-bar read-aloud, which reads the whole page from the top.
- **Why it matters:** Possible harm: she may miss the sign that matters. The Indian MCP card convention uses pictures for exactly these signs.
- **Advice:** A 2-column pictogram grid: heavy bleeding (a soaked pad), fits, headache with blurred eyes, baby not feeding, fever, breathlessness. Keep the same verified words under each, with a large Call 108/112 button. Add a per-card speaker (the sheet-say pattern exists). New art: about 10 pictograms. Help is the same for everyone, so the pictograms must be neutral enough for discreet mode.
- **Effort:** M; new wording needs doctor review
- **Checked:** The three "Call 112 now if" bullets total about 42 words (16, 12 and 14), or 48 with the heading and button, not about 60. Not all of the roughly 10 pictograms are new: a soaked-pad drawing at three levels plus clot drawings already exists (cond.js:457-459, padIcon and clotIcon, used in the anaemia heavy-bleeding chart) and could be reused. The rest checks out: Help has no pictures, the after-birth list is 5 text bullets, and anaemia's urgent line is text.
- **Screenshot:** `web/test/shots/diet-ux/density/help-en.png`

### P2 · On the long diet pages, the food sits screens down, as text, sometimes folded (F12, findability)

- **Where:** web/mods/cond.js:839 (cond-anaemia), web/mods/preg.js:820 (renderDiet), web/mods/meno.js:361 (renderBones), web/mods/periods.js (fasting); web/app.js:3620 (tidyView)
- **Found:** From deep.mjs: - Anaemia and heavy periods: 4.27 screens, 883 words, 0 pictures. 'Food that builds blood' starts at 2.9 screens, and its card is folded behind 'Show more'. - Food in pregnancy: 3.97 screens, 649 words, 0 pictures. - Bones and heart: 4.28 screens, 847 words. Calcium is at 0.3 screens but folds at 0.6. - Fasting and periods: 2.68 screens; the sargi ideas start at 2.0 screens and are folded. - The folding comes from app.js:3620 (tidyView), which collapses long text cards.
- **Why it matters:** Even when she finds the right page, the food is 3 screens and one fold away. Task 2 becomes 3 taps plus 3 screens of scroll.
- **Advice:** Put the food block first on these pages, as picture chips in My plate's style. Add jump chips at the top: 'Foods · Tablets · When to see a doctor'. Mark food cards data-nofold so they never fold. This only re-lays out doctor-reviewed text.
- **Effort:** M; no new health wording
- **Checked:** None. Keep the medical order in mind: on the Anaemia page, food can't replace the tablets. Moving food above 'Free from the government' and 'Taking the tablet' may need doctor sign-off.
- **Screenshot:** `web/test/shots/diet-ux/findability/L-heavy-cond-anaemia.png`

### P2 · Food words on My plate are 13 px; most of the page is small text (DJ-15, persona journeys)

- **Where:** #plan-plate (mods/plan.js css)
- **Found:** plan.js:2196-2197: .pl-glab and .pl-f are font-size 13px. 55 of 63 visible text nodes on Riya's plate are under 14 px. Sunita's Hindi plate has 36 nodes at 13 px, 6 at 14 px and 4 at 16 px.
- **Why it matters:** Devanagari at 13 px is hard for Sunita, a slow reader at 47, and the food words are the content she came for.
- **Advice:** Make food chips 15 to 16 px and group labels 14 px. Let them wrap to full width, and follow the app's text-size setting.
- **Effort:** S; no new health wording
- **Checked:** The app has no text-size setting to follow (none in app.js or app.css). The fix is the larger fixed sizes, or rem-based sizes that follow Android's font scale.
- **Screenshot:** `web/test/shots/diet-ux/journeys/sunita/plate-east.png`

### P2 · Hindi food and midlife pages keep many English words (DJ-16, persona journeys)

- **Where:** #meno-bones, #meno, #preg-diet in Hindi
- **Found:** English words left in Hindi: - Bones and heart: 66, including calcium, mg, tofu, moringa, osteoporosis, DEXA scan, 'supplement dose sachet injection' and 'Indian Menopause Society'. - Menopause hub: 39. - Food in pregnancy: 32. - My plate: 1. (sunita.json, shabana.json)
- **Why it matters:** Sunita reads only Hindi, so the key nutrient words on her bones page are in a script she can't read.
- **Advice:** Write these in Devanagari and plain Hindi: कैल्शियम, मिलीग्राम, सहजन, हड्डियों का कमज़ोर होना. Put source names in the footnote only. The translations need doctor review.
- **Effort:** S; new wording needs doctor review
- **Screenshot:** `web/test/shots/diet-ux/journeys/sunita/meno-bones.png`

### P2 · Joining: the goal list and the food question are text-only (VD-09, visual density)

- **Where:** web/mods/plan.js:1155 (renderIntake), web/app.css:723 (.ob-parts 12px)
- **Found:** join-7-goal: 8 text rows with 0 icons, right after the stage screen's 6 pictures (visual share 0.2% vs 6.6%). join-9-yourday: 'What do you eat?' is answered with Vegetarian / Eggs too / Non-vegetarian text chips. The joining part labels are 12 px. The Yes/No chips measure 36x48 and 32x48.
- **Why it matters:** The joining flow loses its picture cues exactly where she picks her goal and food. These two choices shape her whole plan.
- **Advice:** Give each goal row an icon from the app.js icon set (drop, chart, sparkle, moon, heart…). Mark the food choice with the familiar Indian green-dot / brown-dot food mark, drawn as a plain square with a dot (no logo). Make chips at least 44 px wide and use 13–14 px labels.
- **Effort:** S; no new health wording
- **Checked:** Accurate. Two small notes on the recommendation. India's non-veg food mark is now a brown triangle in a square under the FSSAI 2020 labelling rules, not a brown dot, and there is no standard mark for "eggs too". Reusing the drop icon for goal rows would add to the overuse VD-11 describes.
- **Screenshot:** `web/test/shots/diet-ux/density/join-9-yourday-en.png`

### P2 · The iron tablet screen never shows the tablet (VD-10, visual density)

- **Where:** web/mods/iron.js:114 (render)
- **Found:** iron: 306 words, 2.85 screens, 0 pictures. The text says 'one red iron-folic acid tablet', but no tablet is drawn. 'Tablets left in your strip' is a number field, 'If it upsets you' is 5 text bullets, and the day buttons are 35x60 px.
- **Why it matters:** Women identify the tablet by its colour, and staying on it (one third finish 180 days, iron.js:3) depends on simple cues.
- **Advice:** Draw the red tablet and a strip with pills punched out to show tablets left. Show 'If it upsets you' as icons: a clock after the meal, a crossed-out tea cup, a lemon-water glass (the nimbu drawing exists). Make day buttons at least 44 px wide. New art: tablet and strip (small SVGs). Its colour and description must match Anemia Mukt Bharat, so a doctor should check it.
- **Effort:** S; new wording needs doctor review
- **Checked:** Accurate as stated.
- **Screenshot:** `web/test/shots/diet-ux/density/iron-en.png`

### P2 · Repeated icons blunt the cues, and a food step shows a blood drop (VD-11, visual density)

- **Where:** web/app.js:1043 (GROUP_ICONS), web/app.js:2122 (qa tiles), web/mods/plan.js:1300-1330 (step icons)
- **Found:** - Explore 'Your questions': 4 of 6 tiles use the same drop (Period late, Period pain, Heavy bleeding, Irregular periods). - Learn: all 10 Periods articles use the drop and all 10 PMOS articles the chart (GROUP_ICONS). - The heavy-periods plan's food step 'Poha with lemon' uses the blood-drop icon (myplan-heavy-en.png).
- **Why it matters:** When one picture means four things, she has to read anyway. A period drop on a food step misleads.
- **Advice:** One meaning per icon: calendar-with-? for a late period, a hot-water bag for pain, a pad for heavy bleeding. Food steps show the food: the nimbu drawing exists, poha is new.
- **Effort:** S; no new health wording
- **Checked:** Accurate. The drop comes from three places: S.icon('drop') in actionsFor and stepsList (plan.js:1313, 1425), the iron journey's own icon (journey.js:33), and the after-birth feed step, which also uses it (plan.js:1343). In discreet mode the Explore question tiles are hidden (qaHtml returns nothing), so the repeat matters only outside discreet mode.
- **Screenshot:** `web/test/shots/diet-ux/density/explore-en.png`

### P2 · Hindi type is no larger than English, though Hindi runs 10% longer (VD-13, visual density)

- **Where:** web/app.css:21-26, web/app.css:254, web/mods/plan.js:2197
- **Found:** Across 54 screens: 11,716 Hindi words vs 10,690 English (+10%). Hindi h1 is 24 px vs 28 px in English (app.css:26), and the back-row title 22 px (app.css:254). Food chips are 13 px Devanagari, and body line-height is 1.5 (app.css:21). English words sit inside Hindi diet text (preg-diet-hi: 5%, e.g. 'IFA और calcium', '350 calorie', 'protein', 'g'), and Me has 8%. No Hindi clipping or sideways scroll was found.
- **Why it matters:** Devanagari at 13 px with tight spacing is harder to read than Latin at the same size, so Hindi readers carry more words at a smaller effective size.
- **Advice:** Hindi small text and food chips at 15 px with line-height 1.65; Hindi headings at least the English size. Write food names in Devanagari under their pictures. Replace g/mg with household measures (VD-01).
- **Effort:** S; no new health wording
- **Checked:** The word counts, the same-size body text and the 13 px chips hold. The heading claim is misleading. English h1 is set in Cormorant Garamond, a display serif whose lowercase letters stand only about 11 px tall at 28 px. Hindi h1 uses Noto Sans Devanagari at 24 px, where the letters stand about 16 px tall (22 px with a matra), so Hindi headings already look larger than English ones. Raising them to 28 px is not needed. Body text and chips are the same px in both languages (15/16 and 13 px), with a runtime floor of 13 px (app.js:3610). So the case for bigger Devanagari rests on small and body text, not on headings.
- **Screenshot:** `web/test/shots/diet-ux/density/plate-hi.png`

### P2 · Read-aloud reads the whole page, not the card she needs (VD-14, visual density)

- **Where:** web/mods/lang.js:545, web/app.css:859 (.sheet-say)
- **Found:** The speaker is on all 54 screens, but it reads the visible text of #view from the top, block by block (mods/lang.js:545). Nine pages have more than 300 visible words (anaemia 864, meno-bones 847, preg-diet 651…). Only sheets have their own Listen button (sheet-say).
- **Why it matters:** A woman who can't read has to listen through a long page to reach the iron foods or the danger signs.
- **Advice:** Add a small speaker to each card or section header that reads just that block, reusing the sheet-say pattern. Prefer on-phone voices (app audit item 8).
- **Effort:** M; no new health wording
- **Checked:** Accurate that the page reader reads all of #view from the top. Sheets are not the only place with their own speaker, though. The quick-answer sheet has a Listen button (app.js:2142), tour pop-ups have one (app.js:2461), Sakhi stories have one (access.js:896), and the routine and relief players read each step (plan.js:731, relief.js:102). The page reader skips only closed <details>. It still reads text inside cards the app has folded behind "Show more", so a long page is even longer to listen to than it looks.
- **Screenshot:** `web/test/shots/diet-ux/density/anaemia-en.png`

### P2 · Body and Progress show numbers and text where a picture is ready (VD-15, visual density)

- **Where:** web/mods/plan.js:581 (renderBody), web/mods/plan.js:826 (renderProgress)
- **Found:** - My body: 81 words and 0 pictures until she types. The Indian BMI band bar (bmiBar) only appears with data. - Progress: food habits as '4 / 7', 'What to expect' as a text list, 'Days between periods' as '…'. - Visual share: 0.2% (body) and 4.6% (progress).
- **Why it matters:** The tracker Mohit asked for ('graphics, less text') shows numbers where she expected a picture of her progress.
- **Advice:** Show the empty BMI band bar (with the Indian cut-offs) from the start. Show food habits as 7 small plate dots, and 'What to expect' as an icon path with 'You are here'. All in-app assets.
- **Effort:** S; no new health wording
- **Checked:** Body and the 4/7 food count are accurate. "What to expect" is not a plain text list: it is already a timeline with past and current stages coloured and a "You are here" pill on the current one (plan.js:819-822, plan_ex_now = 'You are here', visible in progress-en.png). Only icons would be new. Progress also already has a weekly minutes bar chart.
- **Screenshot:** `web/test/shots/diet-ux/density/progress-en.png`

### P3 · Hindi food pages mix scripts and keep calorie numbers (DIET-20, diet audit)

- **Where:** web/mods/preg.js:39, 473-499, 529; web/mods/meno.js:364-380
- **Found:** Latin-script words on the Hindi pages: preg-diet 20 (calorie ×3, protein, iron, calcium, caffeine), meno-bones 51 (calcium ×7, vitamin ×5), plate 0 (it writes प्रोटीन). preg-diet shows '350 calorie' and '450 calorie' and protein grams (preg.js:476-478, 529), while everywhere else Sakhi avoids calorie numbers.
- **Why it matters:** Hindi-only readers trip over English words. Calorie numbers sit oddly in an app that avoids counting.
- **Advice:** Write in Devanagari, with the English term in brackets once (कैल्शियम (calcium)). Lead with the food ('one more roti, a katori of dal and a glass of milk') and move the calorie and gram numbers into a 'for your doctor' fold.
- **Effort:** S; new wording needs doctor review
- **Checked:** Counts depend on what is counted. My count of Latin tokens: preg-diet Hindi ≈32 including units and names (iron ×4, calorie ×3, protein ×3, calcium ×3, caffeine ×2); meno-bones ≈66 (calcium ×7, vitamin ×6). Calorie numbers are not confined to preg-diet: the pregnancy week tip (preg.js:315) and the joy.js myth card (92) also say 350 calories. Every mention already pairs it with 'roughly one roti, a bowl of dal and a glass of milk'.
- **Screenshot:** `web/test/shots/diet-ux/diet/preg-preg-diet-hi-360.png`

### P3 · Check-in answers are words only (VD-16, visual density)

- **Where:** web/mods/plan.js:1519 (renderCheckin)
- **Found:** The check-in is lean (33 words, 1 screen), but Done / Partly / Not today are text chips, and the weekly energy question uses Low / Okay / Good text chips (myplan-pmos-en.png).
- **Why it matters:** A small reading load on the screen she sees every evening.
- **Advice:** Add ✓ / half-circle / ✗ and 3 simple faces above the words, keeping the words below.
- **Effort:** S; no new health wording
- **Checked:** Accurate as stated. The energy chips are on My plan's weekly look-back card, not on the check-in screen itself, as the finding's screenshot reference implies.
- **Screenshot:** `web/test/shots/diet-ux/density/checkin-en.png`

## Hard to find (16)

### P1 · Food is hard to find outside the PMOS plan; search sends the wrong stage to the wrong page (DIET-09, diet audit)

- **Where:** web/app.js:1011-1013, 1122-1123 (synonyms), 1144 (searchResults); web/mods/plan.js:950, 2165 (keywords)
- **Found:** Across 16 food queries per woman (search.mjs in my scratch folder): - plan-plate never appears in search. - 'diet', 'khana', 'thali' and 'what to eat' open plan-pmos, which for the heavy-periods and midlife women renders their own light plan with no plate link (heavy-plan-pmos text). - 'food' and 'breastfeeding food' rank preg-diet first for the breastfeeding mother and the 48-year-old. - 'calcium' ranks preg-logs first for non-pregnant women. - 'recipe', 'jain', 'nashta' and 'आहार' return nothing; 'khana' returns nothing in pregnancy. The plate is suggested only when not pregnant and not PMOS (plan.js:950). The FOR_GOAL lists have no food tool for heavy, after birth or midlife (app.js:1011-1013).
- **Why it matters:** Outside PMOS, she can't get to the app's best food screen. Typing 'khana' or 'आहार' gives nothing or the wrong stage's page, which is Mohit's complaint 4.
- **Advice:** One 'Food' entry for her stage, as an Explore tile and a My plan tile on every plan: - the plate, with her iron or calcium section, for the cycle, heavy, trying and midlife plans; - the pregnancy food page in pregnancy; - the after-birth food cards after a birth. Rank food results by stage. Add synonyms: aahaar, bhojan, nashta, recipe, vidhi, banane ka tarika, jain, thali; Hindi आहार, भोजन, नाश्ता, रेसिपी, जैन. Pin these in test/value.mjs.
- **Effort:** S; no new health wording
- **Checked:** The FOR_GOAL part is partly wrong. heavy lists cond-anaemia, which has a 'Food that builds blood' card, and bones lists meno-bones ('Calcium from your kitchen'), so heavy and midlife-bones goals do surface a food page, just not the plate. After birth (feed: post-feed) has no food tool. Also, 'food' ranks preg-diet first for every woman, not only the mother and the 48-year-old.
- **Screenshot:** `web/test/shots/diet-ux/diet/heavy-plan-pmos-en-360.png`

### P1 · Search misses diet words in Hindi and Hinglish, and ranks pregnancy tools for everyone (F4, findability)

- **Where:** web/app.js:1106-1135 (TOOL_SYN, toolBoost), app.js:1097-1103 (score, hitAt)
- **Found:** 25 diet queries across 5 women, English and Hindi UI (search-en.json, search-hi.json, search2.mjs). Zero results: - 'क्या खाएं', 'kya khaye', 'recipe', 'veg', 'nashta', 'breakfast': 6 of 25 for the PMOS woman; - 8 of 25 for the pregnant woman, whose 'khana' and 'yoga' also return nothing; - 'नाश्ता' and 'jain' return nothing too. Pregnant woman: - 'what to eat' → Tests and treatments, Period pain, Common discomforts, Violence and your safety, and no Food in pregnancy; - 'garbhavastha khana' → Food in pregnancy 7th of 24; - 'प्रेगनेंसी में क्या खाएं' → Food in pregnancy not listed. Not pregnant: - 'diet', 'khana', 'thali', 'खाना' → 'PMOS: food, yoga and moves' first, whatever her goal; - 'food' → Food in pregnancy first, for every woman; - 'calcium' → My pregnancy logs first, for a 48-year-old; - 'iron food' → Iron tablets, then Food in pregnancy. Causes: - TOOL_SYN maps every diet word only to plan-pmos (app.js:1123); - 'eat' matches inside 'treatments', because hitAt and score count hits in the middle of a word (app.js:1097, 1102); - there is no stage weighting except for schemes (app.js:1131).
- **Why it matters:** The words women actually type about food find nothing, or a page for another stage. This is complaint 4, and it makes complaint 1 look worse than the content really is.
- **Advice:** - Add one food row to TOOL_SYN: khana, khaana, kya khaye, क्या खाएं, खाना, diet, डाइट, recipe, nashta, नाश्ता, breakfast, thali, थाली, veg, jain, sabzi, roti, dal, doodh, दूध, calcium, कैल्शियम, protein. - Resolve that row by stage: pregnancy → preg-diet; after a birth → breastfeeding food; 40+ → meno-bones; heavy periods or anaemia → iron foods; otherwise → My plate. - Count a term of 4 letters or fewer only at the start of a word. - Boost tools of her own stage and demote other stages' tools. - When nothing matches, show 'Food for you' and 3 tools for her stage before 'Ask a Qura doctor'. - Pin these queries in a test, like value.mjs pins its 18.
- **Effort:** S; no new health wording
- **Checked:** None. 'garbhavastha khana' puts Food in pregnancy 7th among tools (8th for women who aren't pregnant), as stated.
- **Screenshot:** `web/test/shots/diet-ux/findability/S-preg-en-what_to_eat.png`

### P1 · No single place for food: 9 screens, 9 names, 6 topics, no cross-links (F6, findability)

- **Where:** web/app.js:795 (SECTIONS), app.js:1157 (renderCare); content.json pmos.food-for-hormones and mind_body.simple-indian-plate
- **Found:** Diet content lives in 9 places: - My plate; - PMOS: food, yoga and moves; - A thali that helps your hormones (Conditions, 2.24 screens down the topic page); - Food for hormone health: a simple Indian plate (Periods, 3.11 screens down). This and the article above are near-duplicate thali articles (212 and 246 words); - Food in pregnancy; - Anaemia and heavy periods (its food starts at 2.9 screens and is folded); - More iron in 21 days (4 taps: Explore > My plans and reminders > 21 days); - Bones and heart; - Fasting and periods. Explore's All topics has 16 cards and no Food card. Links inside the pages (links.mjs): both thali articles 0, Food in pregnancy 0 (only Ask), More iron in 21 days 0, My plate 1 (to fasting). First food entry on each tab (foodword.mjs): - after-birth woman: nothing on Today, My plan, Diary, Explore or Me; - woman with no plan: only 'More iron in 21 days', at 1.43 screens on My plan; - 40+ woman: only Explore's For you.
- **Why it matters:** She has to know which condition her food question belongs to before she can find the answer. This is complaint 4 at its root, and it makes the diet look thinner than it is (complaint 1).
- **Advice:** One stage-aware Food entry, with no new tab: - a 'My food' card on every plan page; - a Food card first in Explore's All topics and in Your questions. It opens her plate (region and veg choice from F2), then her stage's food sections as picture chips (iron, calcium, pregnancy, breastfeeding, fasting days), each linking to the full page. Merge the two thali articles into one and link it from My plate. Link every food page back to the hub.
- **Effort:** M; new wording needs doctor review
- **Checked:** The core holds; some details are overstated: - 'No cross-links' is too strong. My plate links to Fasting, Fasting links to Anaemia (cond-anaemia), Anaemia links to Iron tablets, and Bones links to screen-mine and meno-surgical. - The no-plan woman has more than 'only More iron in 21 days' on My plan. My PMOS plan ('…foods') is at 1.20, More iron at 1.43, My plate at 2.26 and Small steps for PMOS ('meals') at 2.37. foodword.mjs kept only the first match. - PMOS women already get a 'Food for hormones' quick answer in Explore's Your questions (QA.pmos, app.js:2001). - Merging the two doctor-verified thali articles needs doctor review, as flagged.
- **Screenshot:** `web/test/shots/diet-ux/findability/pmos-care.png`

### P1 · 'PMOS: food, yoga and moves' opens a different plan for women on any other plan (F7, findability)

- **Where:** web/mods/plan.js:403 (renderHub), plan.js:2164 (the tile)
- **Found:** - The heavy-periods woman taps Explore > Conditions > 'PMOS: food, yoga and moves' (the first tile) and lands on 'Stronger blood', her own plan. - The 40+ woman lands on 'My midlife plan'. - Code: plan.js:403, `if (packOf(raw()) && packOf(raw()) !== 'cycle') { renderMyPlan(v); return; }`. - Those pages have no food or yoga (D1 screenshot). - The tile is also the first search result for diet, khana, thali, yoga and खाना (F4).
- **Why it matters:** The label promises food and yoga, and the page shows her plan without either. It's a loop that teaches her the food isn't in the app.
- **Advice:** While another plan runs, open My plate and Yoga and moves in a browse mode, or hide the tile and let the generic Food (F6) and Moves (F8) entries take its place. Add a check to the link walk that a tile's title matches the title of the page it opens.
- **Effort:** S; no new health wording
- **Checked:** 'Those pages have no food or yoga' is slightly overstated. The heavy page shows one daily iron-food step ('Poha with lemon', which links back to My plan). The 40+ page shows 'Strength at home' (one of the moves routines) on some days. Neither page has My plate, a food section or yoga.
- **Screenshot:** `web/test/shots/diet-ux/findability/D1-heavy-pmos-tile.png`

### P1 · Yoga and moves exist only inside the PMOS plan (F8, findability)

- **Where:** web/mods/plan.js:427 (tiles in journeyCycle only), plan.js:1639 (renderLight)
- **Found:** - Within 6 taps, Yoga and moves (plan-moves) is unreachable for the heavy-periods and 40+ women. - After a birth it takes 4 taps via Conditions > PMOS. For the PMOS woman it is 2 taps (My plan tile at 1.99 screens). - The tiles exist only in the cycle plan's page (plan.js:427). - The page renders fine for the other women by its address (orphan.mjs), so the content is orphaned, not missing. - Searching 'yoga' or 'योग' gives them the PMOS tile, which opens their own plan (F7). - A pregnant woman gets 0 results and no word about why.
- **Why it matters:** Task 15 fails for most goals, though Mohit's 23 Oct vision asks for yoga and exercise for every condition.
- **Advice:** Link 'Yoga and moves' from every plan's page except pregnancy, and from Explore. For 40+, put the strength and balance routine first. In pregnancy, answer the search with one line: moves for pregnancy come after her doctor's OK, with a link to Help.
- **Effort:** S; new wording needs doctor review
- **Checked:** The title is too broad: - Yoga and moves is also linked from the PMOS intro page (plan.js:399, before a plan starts or while paused). - It is on My plan's list when no plan runs (plan.js:949): 2 taps for the no-plan woman, at 2.16 screens. So it isn't only in the cycle plan's page (plan.js:427). - The BFS covered 5 taps, not 6. - The 40+ bones woman already gets 'Strength at home' on Today twice a week. - The fix should also skip the first 6 weeks after a birth, where moves are deliberately off (moveOk = !preg && !early). - The '23 Oct vision' quote isn't in the repo docs.
- **Screenshot:** `web/test/shots/diet-ux/findability/T5-meno-my-plan.png`

### P1 · Food has no home in Explore, and food searches miss (DJ-10, persona journeys)

- **Where:** #care (Explore) and its search (app.js:1091-1160)
- **Found:** Explore has 16 topics (app.js:795) and none is food. Food lives in at least 7 places across 5 areas: My plate inside the PMOS plan, Food in pregnancy, Anaemia under Conditions, Bones and heart under Menopause, Fasting under Periods, and 2 Learn articles. 'khana' maps only to plan-pmos (app.js:1123), so a pregnant woman gets 'No match' (shabana/search-khana.png). 'क्या खाएँ' returns Common discomforts, discharge and breast self-check (sunita/search-kya-khayen.png). 'egg' returns Fertile days estimate. 24 of 74 food searches returned nothing.
- **Why it matters:** All five women. Unless the food step is on Today, there is no obvious place to look. It is Mohit's complaint 4.
- **Advice:** Add one 'Food for me' row in Explore and a tile in My plan that opens the right page for her stage and goal: plate, pregnancy, breastfeeding, iron, 40+ calcium, and fasting. Add food words to TOOL_SYN for every stage (khana, खाना, क्या खाएँ, recipe, nashta, tiffin, sattu, keerai, fish, egg as food, jain, gond). Index the food names from the region lists so 'poha' or 'सत्तू' finds My plate. Pin these searches in test/value.mjs.
- **Effort:** S; no new health wording
- **Checked:** 'No obvious place to look' is overstated. Explore's For you already puts her stage's food page first by goal (FOR_GOAL, app.js:1012-1015). That means Food in pregnancy for a pregnant woman with the food goal, and Bones and heart first for Sunita (her own Explore capture shows 'हड्डियाँ और दिल / भारतीय खाने से calcium'). It means plan-pmos for PMOS, and Anaemia for heavy periods. PMOS quick answers include a food answer ('pmfood'), and the Hindi 'खाना' finds preg-diet through its keywords. Explore shows 16 topic cards (17 SECTIONS, with 'free' shown as its own row). Not all of the 24 empty searches are food words ('gas', 'budget', 'sasta').
- **Screenshot:** `web/test/shots/diet-ux/journeys/shabana/search-khana.png`

### P1 · Weight searches surface pregnancy-loss and abortion pages (DJ-11, persona journeys)

- **Where:** Explore search (app.js:1127-1140)
- **Found:** 'weight loss' puts Pregnancy loss, Your body after a loss and Two or more miscarriages at tools 2 to 4, because 'loss' is in LOSS_WORDS (app.js:1127), which switches off the loss demotion (riya/search-weight-loss.png). A pregnant woman's 'weight gain' shows 'Trying again' (after a loss) third (shabana/search-weight-gain.png). 'weight after delivery' shows 'After an abortion' third (meera/search-weight-after-delivery.png).
- **Why it matters:** A pregnant Shabana or a new mother Meera, looking for food or weight help, meets miscarriage and abortion pages. That is distressing, and the help she wanted stays hidden.
- **Advice:** Treat 'weight loss' and 'lose weight' as phrases that are not loss words. Show loss and abortion tools only when the query has a real loss word (not just demote them). Map weight words to the right food page for her stage, and add these 3 queries to the search test.
- **Effort:** S; no new health wording
- **Checked:** Root causes: 'loss' is in LOSS_WORDS, and hitAt counts 'gain' inside 'again' and 'after' in 'After an abortion'. Dropping loss tools outright would undo Version 32's deliberate rule that a demotion never drops a match (app.js comment above rankTiles). A narrower fix keeps that rule: treat 'weight loss' and 'lose weight' as non-loss phrases, and match whole words only.
- **Screenshot:** `web/test/shots/diet-ux/journeys/riya/search-weight-loss.png`

### P1 · On a 360 px phone, Today's plan steps start under the tab bar (VD-04, visual density)

- **Where:** web/app.js:1751 (renderHome), web/app.css:380-401 (hero and ring, 128 px at ≤360 px)
- **Found:** probe2.mjs at 360x800, PMOS plan week 3: the cycle hero card is 312x252 at y=161, the plan card starts at y=532, and the first step's icon is at y=740, while the tab bar covers y=735–800. The 3 steps and their Done buttons are below the fold. Pregnancy, after-birth, midlife and heavy-periods Today look the same: today-preg-en.png, today-post-en.png, today-meno-en.png, today-heavy-en.png.
- **Why it matters:** Her main daily action (the plan's steps, including the food step) isn't on the first screen of a common low-end phone width. The first screen is spent on cycle numbers.
- **Advice:** While a plan runs, shrink the hero to a one-line chip (a small ring plus 'Cycle day 39') or move it below the steps. Show the 3 steps as large picture rows (walk figure, food drawing, moon) with Done. These are all assets already in the app. Target: the first step fully visible above the tab bar at 360x800.
- **Effort:** M; no new health wording
- **Checked:** The exact positions depend on the test data, and the substance holds. With the audit's main data at 360x800: the hero card is 278 px tall at y=161, a 91 px quick-action row follows at y=453, the plan card starts at y=558, and the first step's icon sits at y=766 under the tab bar (735 to 800). At 390x844 the first step's icon (754 to 790) is still half covered by the tab bar (779).
- **Screenshot:** `web/test/shots/diet-ux/density/today-pmos-w3-en.png`

### P2 · Food, moves, goal and reminder sit low on a 3-screen My plan (F10, findability)

- **Where:** web/mods/plan.js:407 (journeyCycle layout), plan.js:1621 (settingsHtml); web/app.js:3249 (renderMeHealth)
- **Found:** - The PMOS woman's My plan is 3.14 screens (3.27 in Hindi at 360). - The My plate / Yoga and moves / My body / My progress tiles are at 1.99 to 2.12 screens, below the look-back and the 12-week path. - 'Remind me every day' is at 2.69 screens and 'Change what I work on' at 2.78. - Her goal isn't shown or changeable in Me > My health details (T11-heavy-me-health.png). - Changing her goal takes My plan, a scroll, a tap, the goal, then about 5 questions, and the plan restarts.
- **Why it matters:** Tasks 10, 11 and 12 need hunting, and the doors to food and yoga sit under two screens of other cards.
- **Advice:** - Move the 4 tiles (food, moves, body, progress) right under Today's steps. - Add a small Plan settings gear in My plan's header for goal, reminder time and My food (F2). - Show her goal in Me > My health details, with a Change link.
- **Effort:** S; no new health wording
- **Checked:** None.
- **Screenshot:** `web/test/shots/diet-ux/findability/pmos-plan.png`

### P2 · The same thing under two to four names (F11, findability)

- **Where:** web/app.js CORE_TILES (report), app.js:3210-3214 (Me rows); web/mods/tools.js (tools-summary); web/mods/plan.js:1576 (careTeam)
- **Found:** - Doctor documents: 'Report for my doctor' (report), 'Report for any doctor' (My plan's label), 'Summary for my doctor' (tools-summary; both describe one page of her entries for a visit), and 'Going to a doctor? Show this report' (ask). - Reminders: 'My reminders' and 'Reminders on this phone' are next to each other in Me (app.js:3212). There is also 'Remind me every day' on My plan and 'Coming up · Set a reminder' inside More from Sakhi (B8). - Free care: 'Govt. services' (Explore), 'Free doctor and care' (the page), 'Free government doctor' (My plan), and Help's 'See a doctor'. Its subtitle promises a free government doctor, but it lands on 'Talk to a Qura doctor'. - Results: 'My progress' (cycle plan) vs 'How it is going' (other plans). - Food: two thali articles (F6).
- **Why it matters:** She can't tell whether two rows are the same thing, so she opens both or neither.
- **Advice:** One name per thing, in both languages: - 'Report for my doctor' everywhere, with the summary folded in as its short version; - one 'Reminders' row in Me, with the phone switch inside it; - 'Free government care' everywhere; - Help's row says 'A doctor: free government or Qura'.
- **Effort:** S; no new health wording
- **Checked:** One sub-claim is off. Help's 'See a doctor' row (subtitle 'A free government doctor, or a call with a Qura doctor') opens the page titled 'Talk to a Qura doctor', but that page has a free-government-doctor card linking to access-doctor. In a build without SAKHI_HELP_WA that card comes first (app.js:3144-3146). The title doesn't match the subtitle; the promise itself is kept.
- **Screenshot:** `web/test/shots/diet-ux/findability/pmos-me.png`

### P2 · The phone's Back walks back through the other tabs' screens (F13, findability)

- **Where:** web/app.js:768-783 (trackNav, goBack), app.js:911 (tab bar); android/src/com/quranutrition/sakhi/MainActivity.java:508
- **Found:** - Walk B1: Explore > Conditions > an article, then a tap on My plan. - The phone's Back then goes to the article, then Conditions, then Explore, then Today: 4 presses to reach Today. - A tab tap resets only the app's own stack (app.js:911, `nav.stack = []`), while the phone's Back follows the WebView history (MainActivity.java:508-511).
- **Why it matters:** Back surprises her: she leaves My plan and lands in an article she closed. Women who don't read much lean on the Back button.
- **Advice:** On a tab tap, replace the history entry instead of adding one (history.replaceState, or location.replace). Back from a tab's first screen then goes to Today, and Back on Today closes the app, as Android bottom tabs usually do.
- **Effort:** S; no new health wording
- **Checked:** None.

### P2 · Starting a 21-day journey while a plan runs does nothing visible (F14, findability)

- **Where:** web/mods/journey.js:119; Explore > topic-plans > journey
- **Found:** - With the PMOS plan running: Explore > My plans and reminders > 21 days of small steps > More iron in 21 days > 'Start this journey'. - It saves as active, and the journey list shows 'Day 1 of 21'. - Today and My plan never show it, because journey.js:119 returns nothing while a plan runs (journey.mjs). - The heavy-periods plan already contains the same 21 iron steps (plan.js:1316).
- **Why it matters:** A dead end that looks like a broken app, and a duplicate of her own plan.
- **Advice:** While a plan runs, the journey page says 'These steps are part of your plan now', with a button to My plan, and 'Start' is hidden. Or the journey's iron foods join her plan's food steps.
- **Effort:** S; no new health wording
- **Checked:** 'Does nothing visible' is overstated. After Start, the journey page itself shows 'Day 1 of 21 · Today's step', a Done button and a reminder switch. Only Today and My plan leave it out while a plan runs.
- **Screenshot:** `web/test/shots/diet-ux/findability/J-journey-started-today.png`

### P2 · Me is an unlabelled icon, and language hides inside it (F15, findability)

- **Where:** web/app.js:864-871 (renderTopbar), web/mods/lang.js:771
- **Found:** - The header has Help (labelled), a speaker, and a person icon whose only label is for screen readers (aria-label, app.js:869). - Me holds language, discreet mode, reminders, the report and backup. - Once she is in the app, the header has no language button (app.js:868 shows it only before sign-up). - The Language row has a speaker icon and is written only in the current language (lang.js:771). - Tasks 21 and 22 each take 3 taps.
- **Why it matters:** A woman who picked the wrong language must find an unlabelled icon, then read a row in a script she can't read.
- **Advice:** Label the icon 'Me / मैं'. Give the Language row an 'अ/A' icon and its name in both English and Hindi. Optionally, a long press on the brand opens the language list.
- **Effort:** S; no new health wording
- **Checked:** None.
- **Screenshot:** `web/test/shots/diet-ux/findability/T22-language.png`

### P2 · After 40 she can't pick 'irregular periods' as a goal (DJ-19, persona journeys)

- **Where:** Joining goal screen for 'Periods changing after 40'
- **Found:** GOALS.meno is hot, sleep, mood, bones, heavy, weight and track (plan.js:1049-1050). Sunita's goal screen in Hindi has no option for irregular periods (sunita/j06-goal.png).
- **Why it matters:** Sunita's real concern has no plan, so she settles for 'bones' or 'just keeping track', and her food help depends on that choice.
- **Advice:** Add 'पीरियड अनियमित हो रहे हैं' for 40+. Map it to the midlife timeline, the weekly diary, the warning signs (bleeding after 12 months without a period, very heavy bleeding) and iron foods when bleeding is heavy.
- **Effort:** S; new wording needs doctor review
- **Checked:** Some context: a woman over 40 who picks the 'I have periods' stage can still choose 'irregular', and the meno quick answers include the 'Periods after 40' article. But the 'Periods changing after 40' stage has no such goal.
- **Screenshot:** `web/test/shots/diet-ux/journeys/sunita/j06-goal.png`

### P3 · Small labels: the vague 'More from Sakhi (2)', unheaded diet chips, an answer sheet lost on Back (F16, findability)

- **Where:** web/app.js renderHome (the slot_more fold), web/mods/plan.js:533 (renderPlate)
- **Found:** - 'More from Sakhi (2)' on Today holds 'See my check-ups' and 'Coming up · Set a reminder', and the label names neither (B8). - On My plate, the Vegetarian / Eggs too / Non-vegetarian chips have no visible heading, only a screen-reader label (renderPlate, plan.js:533). - Explore quick answer > 'Read the full guide' > Back returns to Explore with the answer sheet closed (B4).
- **Why it matters:** Small extra guesswork on screens she uses every day.
- **Advice:** Name what the fold holds, for example '2 more: check-ups, a reminder'. Add a 'What you eat' heading above the chips. Reopen the answer sheet when she comes back from the full guide.
- **Effort:** S; no new health wording
- **Checked:** Small fixes only. The diet chips are at plan.js:548 (renderPlate starts at 536). The fold also holds a 'Later' button for the check-ups row.
- **Screenshot:** `web/test/shots/diet-ux/findability/B8-more-from-sakhi-open.png`

### P3 · Food steps on Today don't say what to do (DJ-20, persona journeys)

- **Where:** Today's plan rows
- **Found:** Riya's food row reads 'Half the plate sabzi / Your plate today'. The instruction ('At lunch or dinner, fill half your plate…') is about 1 screen down My plate. In discreet mode Sunita's only row reads 'आज का आपका प्लान / सुबह', while the Sakhi says card below names the step (sunita/d01-today.png; plan.js:1281).
- **Why it matters:** She has to tap and scroll to learn the step, and on a shared phone the row gives her no hint at all.
- **Advice:** Put a short how-to as the row's subtitle ('Lunch or dinner: half the plate sabzi'). In discreet mode show neutral food and walk words, which the lifestyle research already counts as safe ('walk', 'dal at dinner').
- **Effort:** S; no new health wording
- **Screenshot:** `web/test/shots/diet-ux/journeys/riya/d01-today.png`
