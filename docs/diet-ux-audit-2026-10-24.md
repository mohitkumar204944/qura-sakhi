# Diet and UI/UX audit (24 Oct 2026)

Mohit, 24 Oct:
> "Can you audit thoroughly and research with a similar app i found some gaps with Diet and UI/UX can you thoroughly audit
> and advise whats missing for a good user experience" … "Try to access selena the korean app for reference"

He then confirmed the reference app ("PCOS Diet - Selena") and named the gaps he saw (all four of the ones offered):
1. **Diet feels thin:** not enough food guidance she can act on (meals, recipes, swaps, portions).
2. **Not Indian enough:** foods don't match her region, budget, fasting days or vegetarian/Jain habits.
3. **Looks text-heavy:** walls of words, not enough pictures, cards or visual cues.
4. **Hard to find things:** too many taps, unclear where things are, too much on one screen.

**Status: audit and advice only.** Nothing in the app was changed. The one serious bug found (section 1, item 1) is not
fixed yet; it is a one-line fix waiting for Mohit's go.

About the reference app: "PCOS Diet - Selena" is not Korean. It is made by Explora SAS (Aura App Studio), a small studio
in France, in English and French only. No Korean app called Selena turned up in English or Korean searches. As Mohit's
rule asks, Selena and the other apps appear here only as principle-level notes from their public store pages and
websites. Nothing was installed or downloaded.

---

## How I looked

All on the `0.38-pilot` code (the build now on the Flip5), with a fake clock so weeks pass in minutes.

| Part | What it did |
|---|---|
| Diet audit | Every food touchpoint in the code and the Learn library. 5 seeded women (a vegetarian north-Indian PMOS plan, an egg-eating Chennai woman with heavy periods, a non-vegetarian pregnant woman, a breastfeeding mother, a 48-year-old), English and Hindi at 360 px, discreet mode. 116 screenshots |
| Visual density | 54 screens measured at 360×800 in English and Hindi (108 runs), 16 at 390 px, 6 in dark mode: visible words, pictures and their share of the screen, scroll length, font sizes, tap targets, contrast |
| Findability | 6 women. A link walk from Today counted the fewest taps to about 300 screens each (about 1,850 renders). 25 common tasks, 46 diet searches in English, Hinglish and Hindi, the phone's Back button |
| Persona journeys | 5 women joined from an empty diary through the real joining flow, then 30 to 131 days fast-forwarded: Riya (Jaipur, vegetarian, PMOS), Lakshmi (Chennai, egg and fish, heavy periods, tight budget), Shabana (Lucknow, pregnant, keeps Ramzan), Meera (Ahmedabad, Jain, breastfeeding), Sunita (47, a Bihar village, Hindi only, shared phone). 137 screenshots, 74 food searches |
| Research | Selena plus 5 similar apps at principle level (an Indian diet app, an Indian pregnancy app, two PCOS diet apps, Monash's free AskPCOS), from store listings, reviews and websites. The Indian diet evidence (ICMR-NIN, IFCT 2017, Anaemia Mukt Bharat, the 2023 PCOS guideline, MoHFW). UX research for low-literacy, Hindi-first, shared-phone health apps |
| Checks | Each audit's findings went to a skeptic who checked them against the code. All 74 held; 55 came back with corrections (mostly small: a line number, a count, something that exists elsewhere), which this doc uses. A last critic looked for gaps and for advice that breaks Mohit's rules |

Screenshots are in `web/test/shots/diet-ux/` (not in git). The six key screens are in one image,
`web/test/shots/diet-ux/diet-ux-key-screens.png`.

---

## 0. The answer on one page

**All four complaints hold up.** The food content Sakhi has is accurate and safe (ICMR-NIN plate, "no food is banned",
no calorie counting, Indian myths answered). But she can't act on it, it doesn't sound like her kitchen, it's written as
long reading, and it's scattered.

| Complaint | What the numbers say |
|---|---|
| Diet feels thin | 0 meals, 0 recipes, 0 weekly thali, 0 shopping list anywhere. Of 7 plans, 3 have a real daily food step. After a birth, 40+ bones and PMS: 0 food steps. Heavy periods: the same iron line on days 22 to 84 (63 days). Pregnancy food: one 649-word page, the same link every day for 26 weeks |
| Not Indian enough | 3 diet types (no Jain, no onion-garlic-free, no "no milk"), and a woman who is never asked is treated as non-vegetarian. Region from her PIN is good, but it reaches only My plate, never the daily steps (a Chennai woman is told rajma and sarson). No budget lens. Fasting days aren't part of her plan. Jaapa food after a birth: one folded myth |
| Text-heavy | 35 of 54 screens have no picture. The food pages are the worst: anaemia 864 words, 40+ bones 847, pregnancy food 651, fasting 497, all with 0 pictures. My plate shows 40 foods as 13 px text chips. Yet the app already has 31 food drawings it never uses outside the pregnancy week cards |
| Hard to find | Food lives on 9 screens with 9 names under 6 topics, and Explore has no Food topic. 24 of 74 food searches return nothing ("recipe", "nashta", "jain", "khana" in pregnancy, "क्या खाएं"). "PMOS: food, yoga and moves" opens a different plan for anyone not on the PMOS plan. Yoga is unreachable for most goals. Diet type and region can be changed only inside the PMOS plan |

The tools Sakhi built as tools are already good and visual: Today's ring and week strip, the round log buttons, the
Diary calendar (31% pictures), the lean evening check-in (33 words), 42 yoga figures. The problem is almost all in the
food and reading pages.

**The fix, in one sentence:** one food home for her stage, food steps that change and link somewhere, picture-first food
pages built from drawings the app already has, and food that follows how she eats (diet type, region, budget, fasting).
Recipes and a weekly thali come last, after the doctor has reviewed the basics.

---

## 1. Fix first: one bug, and four safety and privacy slips

These need no new health wording (except item 5) and protect her now.

1. **P0: the Iron tablets set-up can't be read.** Each plan option renders one letter per line, so the page is about 13
   screens tall (8 in Hindi) for 182 words. The cause is one CSS rule: every input gets `width: 100%` (`web/app.css:33`),
   and only checkboxes are excused (`app.css:146`); `web/mods/iron.js:108` is the only radio in the app. It blocks the iron
   tracker that the heavy-periods, pregnancy and after-birth plans send her to, and it is in the 0.38 build on Mohit's phone.
   Fix: a radio rule next to the checkbox one, plus a layout check (no visible text narrower than 40 px) in the tests. I
   confirmed it from the screenshot.
2. **Weight and food searches surface loss and abortion pages.** "weight loss" lists Pregnancy loss and Two or more
   miscarriages at results 2 to 4; a pregnant woman's "weight gain" shows "Trying again" (after a loss); "garbh me kya
   khaye" shows "Two or more miscarriages" third. Causes: "loss" is a loss word, partial matches ("gain" inside "again"),
   and the demotion misses `ttc-loss2`. Fix: treat "weight loss" and "lose weight" as phrases, match whole words, tag every
   loss route. Keep Version 32's rule that a demotion never drops a match.
3. **Discreet mode: Explore's For you still names her pregnancy or PMOS** ("Food in pregnancy, My pregnancy plan…").
   `forYouTiles` (`app.js:1033`) has no discreet check. On a shared phone one tap on Explore shows what Today hides. Fix:
   neutral names, or drop For you in discreet mode. Add to `test/privacy.mjs`.
4. **Pregnancy safety in shared food lists.** The anaemia page's iron list has "fish and liver" (`cond.js:543`) and the
   iron steps suggest raw sprouts; any shared foods table that also feeds pregnancy needs a pregnancy tag (caution or
   avoid) before it is built.
5. **An eating-worry line** on My plate, My body and My progress: "If worries about food or weight take over your day,
   talk to a doctor, or call Tele-MANAS 14416 (free)." The 2023 PCOS guideline asks for this next to weight work. This one
   is new wording, so it goes to the doctor.

---

## 2. Diet feels thin

What she can act on today: food lists and one habit tick. What's missing: the step from "these foods are good" to "this
is what I put on tonight's thali, this much, and what I buy".

| # | Finding | Where |
|---|---|---|
| 2.1 | **My plate is a list, not something she can cook from.** 39 to 44 food chips, the ½·¼·¼ plate and 2 to 3 habit ticks. No meal-by-meal day, no recipes, no weekly view, no shopping list. Kitchen measures exist only scattered in text (pregnancy, bones, one Learn article) | `plan.js:536-565` |
| 2.2 | **Three plans have no food step at all.** After a birth (every goal, including feeding and weight), 40+ bones (only "Move 10 minutes"), and PMS. The 40+ bones page already lists ragi, til, curd and milk in katori measures, but her plan never asks her to eat any | `plan.js:1326-1357`, `meno.js:364-374` |
| 2.3 | **Food steps repeat.** Heavy periods: one identical iron line on days 22 to 84. The PMOS plan: each habit is the food step for 14 days, and from week 11 it's "Less oil" for good (and forever after "Keep going"). Pregnancy: the same "Food in pregnancy" link every day for 26 weeks | `plan.js:1315, 1307, 1338` |
| 2.4 | **Food steps lead nowhere.** All 11 heavy-periods food steps open My plan, the page they're on. A food idea she taps teaches her nothing more | `plan.js:1316, 1337` |
| 2.5 | **Pregnancy food is a gram table.** "240 g cereals, 80 g pulses, 400 ml milk" (with the roti-dal-milk line above it, in words). A village kitchen can't turn grams into rotis | `preg.js:480-491` |
| 2.6 | **Breastfeeding: her own food is one line**, 3.1 screens down the recovery check. Nothing on eating more while feeding, in food terms | `post.js:166` |
| 2.7 | **Food isn't noticed.** Only the newest habit is asked about; earlier ones drop off Today; progress is one "4 / 7" number; "Food cravings" and "Bloating" in her log lead nowhere | `plan.js:1307`, `periods.js:417` |
| 2.8 | **Gaps in pregnancy food safety:** high-mercury fish and "cook sprouts in pregnancy" aren't mentioned; diabetes in pregnancy gets "follow your doctor's diet" and nothing else | `preg.js:498-536` |
| 2.9 | **Screens contradict each other.** Gur builds blood on the anaemia page but is a "less often" sweet on the plate. The PMOS article says chaas, not curd, at night, while the plate puts curd by every meal. Iron foods are listed four different ways in four files. Vegetarians are shown "paneer, egg or fish" on their own plate | `cond.js:542`, `plan.js:100, 547` |
| 2.10 | Trying for a baby reuses the PMOS habits with no folate foods | `plan.js:1318-1325` |

**What to add** (in the order of section 8):
- A real link from every food step: heavy periods to "Food that builds blood", 40+ to "Calcium from your kitchen",
  pregnancy to its food page, after birth to a new breastfeeding food card. No new wording for the links.
- **Food steps that change:** a 7-day iron rotation by region and diet; earlier habits brought back once a week ("Still
  doing half the plate sabzi?"); a calcium food 3 or 4 days a week for 40+ bones; a pregnancy food step that changes by
  trimester, built from the weekly pregnancy guide's already-reviewed food tips; a weekly breastfeeding food card.
- **"My day of meals":** 4 picture cards (morning, lunch or tiffin, evening, dinner) built on the phone by rules from the
  regional lists, her diet type and her stage, with amounts in katori and roti, a Swap button, and family-pot tips ("take
  your sabzi out before the extra tadka", "keep your katori of dal aside; eat with the family"). The doctor or a dietitian
  sets the measures.
- **Recipes and a weekly thali, last:** about 30 to 36 everyday recipes in our own words, filtered by tags (diet, region,
  low cost, pregnancy-safe), 4 to 6 pictured steps each, no video. A shopping list she can tick, shared only through the
  phone's share sheet when she taps it.
- The doctor settles the contradictions (gur, curd at night) once, and every food screen reads one shared foods table.

## 3. Not Indian enough

| # | Finding | Where |
|---|---|---|
| 3.1 | **Only 3 diet types**: vegetarian, eggs too, non-vegetarian. No Jain or onion-garlic-free, no "I don't take milk". A Jain mother is shown gajar, sprouts and eggs | `plan.js:1120, 134` |
| 3.2 | **Most women are never asked how they eat**, and the plate then defaults to non-vegetarian. Only the cycle, heavy, trying, 40+ weight and pregnancy-iron plans ask; pain, PMS, after birth, 40+ bones and pregnancy food never do | `plan.js:539, 1133` |
| 3.3 | **Region reaches only My plate.** The iron, pregnancy and after-birth food is national. Lakshmi's PIN resolves to South India and her plate shows keerai and sundal, but her iron steps say bathua, sarson and rajma | `journey.js:37-40`, `plan.js:1315` |
| 3.4 | **Regions are coarse.** "West" gives a Jaipur woman Marathi words (bhakri, nachni, usal); "East" mixes Bihar sattu with Bengal kalmi saag. The PIN code could pick a state list offline | `plan.js:62-133` |
| 3.5 | **No budget lens.** Oats, brown rice and nuts sit next to chana and peanuts with no cost marker; iron day 13 suggests pumpkin seeds. "sasta" and "budget" find nothing | `plan.js:91-96`, `journey.js:46` |
| 3.6 | **Fasting days aren't part of the plan.** On a nirjala vrat the step stays "Protein at breakfast". The (good, faith-respectful) fasting page sits under Periods, is a button at the bottom of My plate, and lists sabudana first, though sabudana and aloo raise sugar fast for PMOS and diabetes in pregnancy | `periods.js:367-400`, `plan.js:558` |
| 3.7 | **Ramzan in pregnancy or while breastfeeding:** nothing notices it, and the only advice is one line ("talk to your doctor before fasting if you are pregnant") on a page under Periods. "iftar" finds nothing | `periods.js:379` |
| 3.8 | **Jaapa food after a birth** gets one folded myth card (ghee, laddoos, gond, methi). Nothing on keeping water, fruit and vegetables when the family restricts them | `post.js:384` |
| 3.9 | **Joint-family cooking** gets one line; the look-back's "what got in the way" has no food barrier ("my family decides the food"). The common pattern of the woman eating last, after the family, appears nowhere | `plan.js:449, 1811` |
| 3.10 | Season: 4 of 110 food items mention one | `plan.js:90-133` |
| 3.11 | Tamil is offered, but 174 of 237 words on Lakshmi's Today stay English (the language screen does say "partly translated") | `lang.js` |

**What to add:**
- **Ask how she eats, once, for every goal**, on the existing "Your day" screen: Vegetarian / Eggs too / Non-vegetarian /
  Jain (no onion, garlic or root vegetables), plus a separate "I don't take milk". Default to vegetarian, not
  non-vegetarian. Let her change it in one place (Me > My health details, and every plan's settings) without restarting
  her plan. Filter every food string by it.
- **One shared foods table, used everywhere,** with tags: food group, iron, calcium, protein, folate, diet type, Jain,
  region (state lists picked from the PIN), low cost, pregnancy caution. The iron steps, the pregnancy plate, the
  breastfeeding card and recipes all read from it.
- **Low cost first**, with a "Keep it low-cost" choice: chana, sattu, peanuts, seasonal saag, eggs, home-set curd, guava
  or amla, and links to the free food she's owed (Anganwadi ration in pregnancy and for 6 months after a birth, fortified
  ration rice once that line is checked at its primary source).
- **Fasting that fits:** "Fasting today" on the evening check-in, which swaps tomorrow's food step for its vrat or roza
  version; vrat ideas reordered for PMOS and sugar (kuttu or rajgira roti with curd, makhana, fruit with nuts, less
  sabudana and aloo); a "Fasting in pregnancy and while breastfeeding" section linked from both food pages, with sehri
  and iftar plates, fluids and the stop signs (including the baby moving less). An optional "I keep fasts on some days"
  question after day 3, never during joining. Faith-neutral, no religious rulings, never sent anywhere.
- **"Food after the birth" cards:** keep dal, milk or curd, eggs or paneer, sabzi and water at every feed; laddoos and
  panjiri as food in smaller helpings; never restrict water, fruit or vegetables. Name foods only; for herbal powders and
  kadhas, "ask your doctor".

## 4. Text-heavy

| # | Finding | Where |
|---|---|---|
| 4.1 | **The food pages are walls of words with no pictures:** anaemia 864 words (4.8 screens), 40+ bones 847 (4.7), pregnancy food 651 (4.4), fasting 497 (2.9), the two thali articles 447 and 425. Hindi versions run 900 to 1,400 words | `cond.js`, `meno.js`, `preg.js`, `periods.js` |
| 4.2 | **My plate:** 40 foods as 13 px text chips with one generic icon per food group (bhakri, ragi and khichdi all show the same grain). 149 of its 245 words are under 14 px. The only picture is the plate diagram | `plan.js:536, 2197` |
| 4.3 | **The art is already there and unused.** `art.js` holds 31 offline, themed food drawings (chana, rajma, masoor, matar, amla, nimbu, amrood, lauki, chawal, atta…) but they're reachable only by pregnancy week (`art.js:143`). The plate diagram is private to `plan.js` | `art.js:143`, `plan.js:368` |
| 4.4 | **Learn is text-only:** 69 articles, median 251 words, no pictures; `renderArticle` draws no art | `app.js:2950` |
| 4.5 | **My plan for every goal except PMOS** has no picture at all (visual share under 1%), and an empty "days you followed" chart before any data | `plan.js:1647` |
| 4.6 | **The plan reveal:** "Your 3 steps" is 126 words with 20 px icons, and the 20-word disclaimer repeats on all 6 cards (26% of the reveal) | `plan.js:1445` |
| 4.7 | **Danger signs are text bullets** on Help, Breastfeeding and Anaemia. A woman who can't read must listen to the whole page from the top | `app.js:2967`, `post.js:681` |
| 4.8 | **Read-aloud reads the whole page,** not the card she needs | `lang.js:545` |
| 4.9 | **Today at 360 px:** the cycle card fills the first screen, and her plan's steps start under the tab bar (first step at y=766; the tab bar starts at 735). Her main daily action is below the fold on a common low-end phone | `app.js:1751`, `app.css:380-401` |
| 4.10 | Hindi food pages keep many English words (40+ bones 66, pregnancy food 32: calcium, mg, protein, IFA, calorie) and show calorie numbers that the rest of the app avoids | `meno.js`, `preg.js` |
| 4.11 | Small details: 13 px Devanagari food words; icon buttons shrink to 40 px on 360 px phones (the app's own rule is 44); joining's goal list and food question are text only; check-in answers are words only; one icon means four things on Explore's question tiles, and a food step shows a blood drop | `app.css:514`, `plan.js:1155` |

**What to add:**
- **One food tile component:** a drawing, a 15 to 16 px name (Devanagari in Hindi), and a ✓ / – / ✗ badge as well as the
  colour. Use the 31 existing drawings through a one-line `S.art.food(key)` accessor, plus about 25 new ones for regional
  staples (bajra roti, ragi, idli, dosa, poha, a katori of dal, paneer, egg, fish, chaas, sattu…) and 4 kitchen measures
  (katori, roti, glass, spoon). One SVG sprite, at most about 100 KB, no photos, checked on the Android 7 WebView.
- **Picture-first food pages:** a "Foods that help" strip of 6 to 8 drawings at the top of the anaemia, 40+ bones,
  pregnancy food and fasting pages, at most about 120 words on the first screen, the existing reviewed text folded below
  "Read more". Calcium as "katoris a day" dots instead of mg. This re-lays out reviewed text; only new captions need
  review.
- **My plate as 2-column picture tiles,** and the plate she can tap: she ticks what was on her thali and the drawing fills
  in, with one gentle "add" suggestion. No score, no "bad plate", no camera.
- **Today:** while a plan runs, shrink the cycle card to one line (a small ring and "Cycle day 39"), so the 3 steps, as
  large picture rows, sit on the first screen at 360 px.
- **My plan, one layout for every goal:** days followed as a ring, step rows with pictures, a food tile for her stage,
  "your first bar appears tomorrow" instead of an empty chart.
- **The reveal:** one picture per step, 6 to 8 words each with "Why?" on tap, the day as a 3-icon strip (Done → 8 pm
  check-in → Sakhi answers), the disclaimer once.
- **Danger signs as a pictogram grid** with the same verified words underneath and a big call button; the soaked-pad and
  clot drawings already exist in `cond.js:457-459`. Neutral enough for discreet mode.
- **A speaker on each card** (the sheet's Listen pattern exists), so she can hear just the iron foods or just the danger
  signs.
- Hindi: food chips 15 px and line height 1.65; nutrient words in Devanagari (कैल्शियम), English once in brackets;
  calories and grams moved into a "for your doctor" fold.
- Learn: a picture and "3 things to remember" at the top of each article (new wording, so reviewed), titles only in the
  list with the summary on tap.

## 5. Hard to find

The core daily actions are easy: logging (1 tap), the check-in (1), Help and emergency numbers (2), the pregnancy plan (1),
the after-birth check (1). Food and yoga are not.

| # | Finding | Where |
|---|---|---|
| 5.1 | **No single place for food.** 9 screens, 9 names, 6 topics: My plate, PMOS food and moves, two near-duplicate thali articles, pregnancy food, anaemia, the 21-day iron journey, 40+ bones, fasting. Explore's 16 topics have no Food card. After a birth there is no food entry on any tab | `app.js:795` |
| 5.2 | **Search misses how women ask.** 24 of 74 food searches return nothing (recipe, nashta, tiffin, jain, poha, sasta, iftar, "khana" in pregnancy, सत्तू). "what to eat" for a pregnant woman lists Tests and treatments and Violence and your safety, and no food page. "food" ranks pregnancy food first for every woman; "calcium" ranks pregnancy logs first for a 48-year-old | `app.js:1106-1135` |
| 5.3 | **"PMOS: food, yoga and moves" opens a different plan** for any woman on another plan (heavy periods lands on "Stronger blood", 40+ on her midlife plan), with no food or yoga. It's also the first result for diet, khana, thali and yoga | `plan.js:403` |
| 5.4 | **Yoga and moves are orphaned** for most goals: unreachable within 5 taps for heavy periods and 40+, 4 taps after a birth, 0 search results and no word in pregnancy | `plan.js:427` |
| 5.5 | **Diet type and region can be changed only inside the PMOS plan.** Everyone else has to "Change what I work on", which restarts the 12 weeks | `plan.js:1639`, `app.js:3249` |
| 5.6 | **My plan is 3 screens,** and the food, moves, body and progress tiles sit about 2 screens down, under the look-back and the path. The reminder switch and "Change what I work on" are near the bottom; her goal isn't shown in Me | `plan.js:407, 1621` |
| 5.7 | **One thing, several names:** the doctor report has 4 names, reminders 4 places, free care 4 names, results 2 | `app.js`, `tools.js`, `plan.js:1576` |
| 5.8 | **The phone's Back walks through the other tabs' screens** (4 presses from My plan to Today after visiting an article) | `app.js:768-783, 911` |
| 5.9 | Starting a 21-day journey while a plan runs does nothing on Today or My plan; the heavy plan already contains the same 21 steps | `journey.js:119` |
| 5.10 | Me is an unlabelled person icon, and language hides inside it, written only in the current language | `app.js:864-871`, `lang.js:771` |
| 5.11 | After 40 she can't pick "irregular periods" as a goal; food steps on Today don't say what to do ("Your plate today") | `plan.js` GOALS |

**What to add:**
- **One food home for her stage, with no new tab:** a "My food" card on every plan page and a Food card first in Explore.
  It opens her plate (diet type and region she can change there), then her stage's food sections as picture chips (iron,
  calcium, pregnancy, breastfeeding, fasting), each linking to the full page. It lives in core, so it doesn't vanish when
  `PLAN_RELEASE` is off. Merge the two thali articles into one and link it from My plate.
- **Food search in her words,** resolved by her stage: khana, khaana, kya khaye, क्या खाएं, खाना, आहार, भोजन, नाश्ता,
  nashta, tiffin, recipe, रेसिपी, thali, jain, vrat, iftar, sabzi, dal, doodh, sattu, calcium, protein, and the food names
  in the regional lists. Pregnancy → pregnancy food; after a birth → breastfeeding food; 40+ → calcium; heavy → iron
  foods; otherwise → My plate. When nothing matches, show "Food for you" and 3 tools for her stage. Pin the queries in
  `test/value.mjs` like its 18 existing ones.
- **Yoga and moves from every plan except pregnancy** (and not in the first 6 weeks after a birth); 40+ gets strength and
  balance first; in pregnancy, one line: moves come after her doctor's OK.
- **The PMOS tile** opens My plate and Yoga and moves in browse mode for women on another plan, or steps aside for the
  Food and Moves entries.
- **My plan order:** the food, moves, body and progress tiles right under Today's steps; a settings gear in the header for
  goal, reminder time and My food; her goal shown in Me with a Change link.
- One name per thing ("Report for my doctor", one "Reminders" row, "Free government care"); a tab tap replaces the history
  entry so Back goes to Today; label "Me / मैं" and show the Language row in English and Hindi.

---

## 6. What Selena and similar apps teach (principles only)

Selena is small and new (4.8 from 13 ratings in the US store, 4.7 from 147 in France, about 1,000 Play downloads), so it
offers design principles rather than proof. The comparison apps were an Indian diet app, an Indian pregnancy app with
diet charts, two PCOS diet apps and Monash's free AskPCOS app.

**Worth borrowing, in Sakhi's own way:**
- **Food is the front door.** It is the first thing these apps offer, and a quick answer about a real meal is what users
  praise most. Sakhi's version: the tap-a-plate check and "My day of meals", on the phone.
- **Recipes and ideas filtered by how she eats** (diet type first).
- **A short daily to-do of about 3 actions**, which Sakhi already has.
- **Bite-sized, illustrated lessons** in short programmes: a 60-second, 3-card "why" for each fortnight's food habit,
  shown once.
- **Personalisation she can see and change any time**, with few questions. Sakhi already does this by goal; add how she
  eats.
- **A summary she can show a doctor**, which Sakhi already has.

**Not to borrow:**
- **A cloud photo scanner.** Selena's App Store privacy label lists data used to track her across other companies' apps
  and for third-party advertising. Sending meal photos and health answers to a server breaks "the diary never leaves the
  phone" and "no new spend".
- **A 0 to 100 food score or "bad" foods.** Reviews of the PCOS diet apps repeat that grades on everyday foods confuse and
  shame; the PCOS guideline warns about disordered eating. Sakhi's "no food is banned" plate is the better model.
- **A PCOS "sub-type" quiz,** which the 2023 guideline doesn't support and reads as a diagnosis.
- **Weight-loss framing, paywalls, cycle-phase meal plans, calorie or macro logging, community feeds.** The reviews'
  biggest complaint across these apps is paywalls before any value. Sakhi is free, private and has no tracking: a real
  edge worth saying plainly on the store listing.

## 7. Evidence Sakhi can lean on

- **ICMR-NIN Dietary Guidelines for Indians 2024** ("My Plate for the Day"): already the basis of My plate. Add the
  household measures (katori, roti, glass), "read the packet" (sugar, salt, trans fat) and the 3:1 cereal-to-pulse cue.
- **NIN's region-specific pregnancy diet charts** (meals from breakfast to dinner for 6 regions, shared with Anganwadis in
  2020) are the model for a pregnancy "day of meals".
- **Breastfeeding:** extra food in portions (not calories), and the Anganwadi ration for mothers.
- **MoHFW's iron guidance:** what helps (vitamin C, iron kadhai) and what blocks (tea and coffee near meals), with a
  picture list of iron foods with Hindi names. It lists gur as an iron food, which the plate puts under "less often": the
  doctor should settle it.
- **The 2023 PCOS guideline:** healthy eating for the family, no special "PCOS diet", no restrictive lists, weight-inclusive.
  Sakhi already follows it; the "family pot" cue builds on it.
- **Millets** with their official Hindi names and regional grains; kuttu, rajgira and samak count as millets on vrat days.
  No health promises (the Gazette's "anti-diabetic" claims must not be repeated).
- **40+ bones:** a calcium ladder from Indian food and protein at each meal; doses stay with the doctor.
- **Licences:** NIN's material is copyrighted with no open licence. Use relative cues and our own drawings, credit the
  source, and (Mohit's decision) send one letter to the NIN Director asking to use the plate, household measures and the
  regional charts in a free app.

Two research claims didn't survive checking and are left out: a supposed iron.js line about thalassaemia and fortified
food (no such line exists), and the fortified-rice wording, which waits for the FSSAI rule to be checked at its source.

---

## 8. What to build, in order

A suggested Version 39, "Food that fits her", in five steps. Each step works on its own and can ship before the next.

| Step | What | New wording? | Size |
|---|---|---|---|
| **39.0 Fix and protect** | The iron radio bug; loss pages out of weight and food searches; discreet For you; the pregnancy tag rule; a layout check in the tests | Only the eating-worry line | S |
| **39.1 One food home and search** | "My food" card on every plan and in Explore, by stage; every food step links somewhere; food search in her words, pinned in tests; Yoga and moves from every plan; the PMOS tile fixed; tiles moved up on My plan | No (links to reviewed pages) | M |
| **39.2 How she eats** | Diet type asked once for every goal, with Jain and "no milk", default vegetarian, changeable in Me and plan settings without a restart; one shared foods table with tags (region by state, low cost, pregnancy caution); every food string filtered by it | Labels only | M |
| **39.3 Pictures first** | The food tile component (31 existing drawings plus about 25 new, one sprite under 100 KB); My plate as picture tiles and the tap-a-plate check; "Foods that help" strips on the long food pages with the text folded; Today's smaller cycle card at 360 px; one My plan layout; the reveal shortened; danger-sign pictograms; a speaker per card; Hindi type | Captions and shortened lines | L |
| **39.4 Food steps that change** | 7-day iron rotation by region and diet; earlier habits brought back weekly; a 40+ calcium step; a pregnancy step by trimester; breastfeeding food cards; "Fasting today" on the check-in and the vrat or roza version of the step; fasting in pregnancy and breastfeeding | Yes, mostly reusing reviewed lines | M |
| **39.5 Meals and recipes** | "My day of meals" (4 cards with Swap and kitchen measures); about 30 to 36 recipes with pictured steps; a weekly thali; a shopping list via the share sheet | Yes, the biggest review load | L |

All new wording goes to the doctor in one packet (a new section 17 of `docs/wording-review-v28.md`), with the kitchen
measures set by a doctor or dietitian. Sections 13 to 16 already wait for review, so 39.0 to 39.2 are the steps that can
move without waiting. Add food tasks to the field test ("find what to eat today", "name this drawing", "change to Jain"),
so we learn whether the drawings are understood (the research's bar is 85% of women naming a picture correctly).

## 9. Rules check: what not to build

- No cloud food scanner or AI meal planner, no ad or analytics SDKs: the diary stays on the phone.
- No calorie or macro logging, no food scores, no "bad plate", no streaks on food.
- No supplements, herbs, powders (including after-birth herbal mixes) or doses: "ask your doctor".
- No food tips triggered by symptoms (cramps, bloating, PMS) and no relief claims for food.
- No diabetes-in-pregnancy plate driven by her sugar readings (that is clinical decision support); at most a general plate
  when she says she's diagnosed, with "your doctor or dietitian sets your sugar plan".
- No "sugar-test plate": "eat as usual before your sugar test".
- No PCOS sub-type quiz, no cycle-phase meal plans, no weight-loss promises; the BMI bar only after she enters numbers,
  and no BMI verdict after a birth or while breastfeeding.
- No fasting question during joining and no festival pushes; faith never leaves the phone.
- Every new screen in Hindi and discreet mode (neutral titles such as "Today's thali"); shares only through `S.share`.

## 10. Decisions for Mohit

1. **Fix 39.0 now?** The iron bug is in the build on your phone; the fix and the search and discreet fixes need no new
   wording.
2. **The food home:** a "My food" card on My plan and a Food card in Explore (recommended), rather than a fifth tab.
3. **Who reviews food:** the doctor for health claims, and who sets the kitchen measures (Dr. Megha or a dietitian)?
4. **Recipes:** about 30 to 36 in our own words (recommended), and who writes them?
5. **Fasting:** "Fasting today" on the check-in plus an optional question after day 3 (recommended)?
6. **The NIN letter:** send one asking to use the plate, household measures and regional charts in a free app?
7. **Drawings:** about 25 food drawings and 10 danger-sign pictograms, drawn in the app's existing style.

## 11. What already works and should stay

- The evidence and tone: the ICMR-NIN plate, "no food is banned", no calorie counting, no supplements, Indian myths answered
  (kesar, papaya, eating for two, ghee for milk).
- Region from her PIN code, worked out on the phone, with 80 regional foods in both scripts.
- Diet type filtering the plate and the iron steps; practical Indian iron habits (lemon on dal, tea away from meals, the
  iron kadhai).
- The fasting page: faith-respectful and safety-first.
- The visual tools: Today's ring and week strip, round log buttons, the Diary calendar, the yoga figures, Explore's topic
  pictures; the lean check-in; the plate drawing.
- Read-aloud on every screen, fonts bundled offline, contrast that passes AA, no sideways scroll on any of 108 runs, and no
  page errors in about 1,850 renders.
- Free, private, no tracking: the clearest difference from the apps compared.

---

## Appendix: all 74 findings

The full findings, with evidence, screenshot paths and the checkers' corrections, are in
`docs/diet-ux-audit-2026-10-24-findings.md`; the main ones are in sections 1 to 5 above. Counts by complaint: diet feels thin 12, not Indian enough 14, text-heavy 21, hard to
find 16, other (bugs, safety, privacy) 11. By severity: P0 3 (the same iron bug, found by three audits), P1 37, P2 27, P3 7.
