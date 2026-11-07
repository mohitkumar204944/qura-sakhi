# Water in Sakhi: what's there, what the evidence says, what to build (7 Nov 2026)

Mohit, 7 Nov: "we dont have water intake in plans and reminder and its an important part can you check and advise".
Built as Version 39.80 (Mohit, 7 Nov: "Build W1 to W7"), with the defaults below for D2 to D4: `web/MODULE_API.md` section 123,
`node test/water.mjs`. What changed while building: W3 reads her monthly check-in (the Diary's daily signs have no constipation or
leaking sign, and hot flushes already have cool water on their own page); the hot card takes its turn in "Sakhi says"; NCDC's
hours are 12 noon to 3 pm.

## 0. The short answer

- Water is already in Sakhi, but mostly as advice she has to go and read. More than 25 lines cover it, across pregnancy,
  after the birth, the pelvic floor plan, the fasting page, midlife and the urine infection sign.
- On Today it's thin:
  - My pelvic floor plan's "Water through the day" (weeks 1, 3 and 4) is the only real water step.
  - The PMOS plan's "No sweet drinks" (from week 7) is about what she drinks, not how much.
  - Two more are hidden. My pregnancy's "Iodised salt and water" week shows only the salt sentence. "Food while you
    breastfeed", once a week, keeps "a glass at every feed" a tap away.
- None of her reminders mentions water, and the Diary can't log it. Apart from the fasting page, nothing tells her what to do
  on a hot day.
- The amounts Sakhi already gives are right, but only 3 of the 7 plans give one, in 3 different units (litres, glasses, a
  glass per feed), and no screen says how big a glass is. Section 2a sets the right amount for every plan.
- You're right that it's a gap, and it matters most in pregnancy, while breastfeeding, in the pelvic floor plan and in
  India's hot months.
- The usual fix, an 8-glass counter that pings every 2 hours, would be wrong for Sakhi:
  - the right amount differs by stage;
  - the evidence for water pings is thin;
  - a woman annoyed by pings may switch reminders off altogether, and lose her iron tablet and check-in with them.
- What I recommend is water where it changes something (section 3):
  - a daily water step in My pregnancy and while she breastfeeds;
  - her own diary signs bringing the water line;
  - one hot-months card;
  - the hidden lines made visible;
  - a water reminder she can switch on if she wants it.

## 1. What Sakhi has today

| Where | What she sees | On Today? |
|---|---|---|
| My pelvic floor plan | The habit "Water through the day: a little at a time, about 6 to 8 glasses. Too little makes the bladder more urgent." (`plan_pf_h2`, weeks 1, 3 and 4, `mods/plan.js:1880`). For an urgent bladder, "Less tea, coffee and cola, for 2 weeks". Its chapter: don't drink less to leak less, pale yellow urine means enough, less in the last 2 hours before bed (`mods/pfplan.js:51-65`). | Yes, a tick, 3 weeks in 12 |
| PMOS plan | "No sweet drinks: water, chaas or nimbu pani without sugar instead of cold drinks, packaged juice or very sweet chai", from week 7 (`mods/plan.js:128`). Getting ready has the same habit only in its PMOS or healthier-weight set (`BSETS.mix`). | Yes, but what she drinks, not how much |
| My pregnancy | The food step rotates weekly by trimester. Its "Iodised salt and water" week shows only "Use only iodised salt." (`mods/preg.js:1082-1089` takes the first sentence of the first line). "Drink plenty: over 2 litres a day, counting water, buttermilk and nimbu pani" stays on the food page. Elsewhere: constipation (over 2 litres), needing to pee often ("Keep drinking water; do not cut down"), nausea (sip through the day), light-headedness, clean or boiled water. | The word "water" in a title, one week in 4 or 5 |
| My postpartum recovery | "Food while you breastfeed" on day 2 of each week opens the feeding page, which says "Keep water near you, and drink a glass at every feed". The recovery check's tips for burning and constipation say to drink more water. | A tap away, once a week |
| Fasting page | Nirjala fasts, ORS, breaking the fast when dizzy, extra water while breastfeeding (`mods/periods.js:351-385`). | Only once she marks a fast |
| My midlife plan | Cool water for a hot flush (the skill's text), "Have your tea or coffee before 2 pm" (a sleep rule), "Don't drink less water to avoid leaking" (`mods/meno.js:492`). | Not as water |
| Urine infection sign | "Often a bladder infection (UTI). Drink water and see a doctor; sooner if a fever starts or you are pregnant." (`mods/access.js:730`) | After the sign |
| Babies | "Breast milk gives a baby all the water it needs for the first 6 months, even in summer." (Learn) Keep it: water for small babies is a common practice in India. | No |
| Retired | 21 small steps' "Water first: start the day with a glass of water, before tea" went with the doctors' review (Version 39.68). | Gone |

Missing:
- a water reminder (none of her reminders mentions water);
- a way to log water;
- hot-weather advice outside the fasting page;
- water as a step in My period plan, My midlife plan, and Getting ready's standard set.

## 2. What the evidence says

| Who | What and why | Strength |
|---|---|---|
| Every woman | ICMR-NIN: "about 8 glasses (2 litre) of water per day", more in very hot weather and hard physical work (2011 edition, Guideline 13, page 70). A 2025 review summarises the 2024 edition as 8 to 12 glasses by climate and activity; the 2024 PDF itself was too big to fetch. Its "8 glasses = 2 litres" makes a glass 250 ml. Milk, chaas, tea and nimbu pani count; sweet drinks don't replace water. EFSA: 2.0 litres total water; IOM: 2.7 litres total including food, about 2.2 litres of drinks. Pale yellow urine means enough. Thirst is a fair guide for a healthy woman, except in the heat: NCDC says thirst is not a good guide then. | Strong (guideline agreement) |
| Pregnancy | More: ICMR-NIN "plenty of fluids including 8-12 glasses of water per day" (2011, Guideline 2, page 22); EFSA +300 ml; IOM 3.0 litres total, about 9 to 10 glasses of drinks. Helps with constipation and piles, urine infections, light-headedness and heat. In heat, the odds of a preterm birth rise about 5% per 1 °C and 16% in a heatwave (Chersich 2020). NCDC names pregnant women as high-risk in heat. | Strong |
| Breastfeeding | More: EFSA +700 ml (2.7 litres total, roughly 9 glasses of drinks); IOM 3.8 litres total, about 12 glasses of drinks. So about 10 to 12 glasses (2.5 to 3 litres). ICMR-NIN 2011 gives no amount. "A glass at every feed" is a cue she already has, and it lands in that range. But drinking more than her thirst doesn't make more milk (Cochrane 2014: no evidence), so no milk claim. | Strong for the need, none for milk |
| Repeated urine infections | Women who drank under 1.5 litres and added 1.5 litres of water a day had about half as many infections in a year (1.7 against 3.2; Hooton 2018, a randomised trial). | Strong, for low drinkers |
| Leaking urine, urgent bladder | NICE NG123: correct too little or too much drink; try less caffeine for an urgent bladder; drink less in the evening if she wakes at night to pass urine. NHS bladder leaflets put the amount at 1.5 to 2 litres (6 to 8 glasses), more in heat or when very active; more than that makes her go more often. The pelvic floor plan already says this. | Strong |
| Period pain | One non-randomised study of 140 women who drank under 1.6 litres: those who drank more had less pain and took fewer painkillers (Torkan 2021). Cold water during periods: no evidence of harm, though many believe it. | Weak: "may help", no claim |
| PCOS and weight | Water instead of sweet drinks (ICMR-NIN). 500 ml of water before main meals added 1.3 kg of weight loss in 12 weeks in adults with obesity (Parretti 2015). | Moderate |
| Trying for a baby | No evidence that water changes fertility. | None: don't claim |
| Midlife | The same 8 glasses as every woman: IOM and EFSA don't change it after 50. From about 60 thirst weakens, so she should drink even when not thirsty: at least 6 to 7 glasses (1.6 litres; ESPEN's good-practice point, Volkert 2019). Cool water eases a flush (it doesn't stop it). Less to drink in the evening if she wakes to pass urine. | Amount strong; comfort lines weak |
| Too much | Rare in a healthy woman. But heart or kidney disease may need a limit her doctor sets, and in the pelvic floor plan too much makes leaks worse. Every water line needs "If your doctor has told you to drink less, follow your doctor." | Safety line |
| India | Some women without a toilet at home avoid drinking and hold their urine (10.7% and 12% in two studies in Maharashtra's poorer urban areas), which is linked to urine infections; doctors report working women doing the same. Nirjala fasts. Three or four hot months a year. | Context |
| Reminders | Water reminder apps have only small, short trials: 22 women, and one trial of men in Indonesia. Plausible, not established. Tying a habit to something she already does (a meal, a tablet, a feed) has better support. | Weak for pings |

## 2a. The right amount, plan by plan

One glass is 250 ml, the size behind ICMR-NIN's "8 glasses (2 litre)". Many steel glasses hold 200 ml, so Sakhi should give
litres and glasses together, and say once how big a glass is.

| Plan | How much a day | What changes it | What Sakhi says now |
|---|---|---|---|
| My PMOS plan | About 8 glasses (2 litres), counting milk, chaas, tea and nimbu pani | More on hot days. For the weight goal, optionally 2 glasses half an hour before lunch and dinner, inside the day's total (Parretti 2015) | No amount ("No sweet drinks" from week 7) |
| Getting ready for a baby | About 8 glasses (2 litres) | More on hot days. Water doesn't change fertility, so no claim. A positive test moves her to the pregnancy amount | No amount |
| My pregnancy | 8 to 12 glasses (2 to 3 litres), at least 2 litres | More on hot days. With nausea, small sips through the day; not keeping any fluid down for a day needs a doctor. The same amount all through: the guidelines don't split it by trimester. Tea and coffee in moderation (caffeine) | "Over 2 litres a day" (food page, constipation): right, the low end of 8 to 12 |
| My postpartum recovery, breastfeeding | About 10 to 12 glasses (2.5 to 3 litres), to her thirst | A glass at every feed covers most of it. More on hot days. More than her thirst doesn't make more milk | "A glass at every feed": right, but no daily total |
| My postpartum recovery, not breastfeeding | About 8 glasses (2 litres) | More, with fibre, for constipation in the first weeks | Nothing of its own |
| My period plan (pain, heavy periods, the days before) | About 8 glasses (2 litres) | Don't drink less on period days to change pads less often. Heavy bleeding needs no set extra; dizziness or fainting with it is a danger sign (the existing lines). Warm or cool water are both fine | No amount |
| My pelvic floor plan | 6 to 8 glasses (1.5 to 2 litres), a little at a time | More on hot days or when very active, and not more than that otherwise. Less in the last 2 hours before bed if she wakes at night to pass urine. Less tea, coffee and cola for an urgent bladder | "About 6 to 8 glasses ... more in the heat": right |
| My midlife plan | About 8 glasses (2 litres); from about 60, at least 6 to 7 glasses (1.6 litres) even when not thirsty | Cool sips in a flush. Less in the last 2 hours before bed if she wakes at night; tea or coffee before 2 pm (the existing sleep rule). With leaks, the pelvic floor amount | No amount |

For every plan:
- **Hot days:** more, enough to keep her urine pale yellow, and before she feels thirsty (NCDC). ICMR-NIN 2024's upper end,
  12 glasses, is for heat and hard work.
- **Heart or kidney disease:** her doctor's limit comes first.
- **A baby under 6 months** gets no water, only breast milk (ICMR-NIN, and Sakhi's Learn line).
- **Fasting:** the fasting page's existing advice.

What this means for the app:
- The amounts Sakhi gives today are right.
- Only 3 of the 7 plans give one, in 3 different units, and nothing says how big a glass is.
- So W1 and W2 should give both units: "over 2 litres (8 to 12 glasses)", and "a glass at every feed, about 10 to 12 a day".
- The plans with no amount get "about 8 glasses (2 litres)" in the one place they mention water (W5 and W7).

## 3. What I recommend: water where it changes something

**W1. My pregnancy: a daily water step.**
- Title "Water: over 2 litres today" (the app's own amount), with "8 to 12 glasses: one with each meal and each tablet, more
  on hot days" under it.
- From day 2 (day 1 keeps its 3 steps), on any day a slot is free; her other steps come first, never a 5th step. When all 4
  slots are full, the water line goes under her food step instead, so no pregnancy day is without it.
- Its "Why?" uses the app's existing lines: constipation and piles, needing to pee often ("Keep drinking water; do not cut
  down"), heat.
- With the nausea goal, the line under it becomes the existing "Sip water, nimbu pani or coconut water through the day
  instead of drinking a lot at once."
- Water is a neutral word, so the step shows on a shared phone and in discreet mode.
- The evening check-in asks about it like any other step, so it needs no new ring.

**W2. While she breastfeeds: the same step, "Water: a glass at every feed", about 10 to 12 glasses a day, to her thirst.**
- In My postpartum recovery from day 2, on any day a slot is free; the same fallback under "Food while you breastfeed" on
  its day.
- One new line for the doctor in "Why?": "Drink to your thirst. Drinking more than that doesn't make more milk."

**W3. Her diary's signs bring the water line, at every stage, with no new question.**
- The day after she logs one of these, "Sakhi says" carries the water line, unless that sign's own card already says it:
  - Constipation: water and fibre. In pregnancy this is the existing "over 2 litres, fibre, walk" line; the same idea for
    other stages is a new line.
  - Leaking urine: "Don't drink less to leak less" (existing).
  - Hot flushes: cool water (existing).
- A sign that needs care now or today keeps its place on top (Version 39.75).
- Burning when peeing keeps its existing card, with the doctor route rule of Version 39.77.

**W4. Hot months: one card a season.**
- April to June (decision D3), one "Sakhi says" card on her first hot day of the season, for every woman, in stronger words
  for pregnancy, breastfeeding and women over 60.
- From NCDC's heat advisory:
  - drink water often, even before you feel thirsty;
  - keep ORS at home;
  - stay out of the sun from 12 noon to 3 pm;
  - signs of heat illness (very hot skin, confusion, fainting, no sweat): go to the nearest hospital now (108, or 102 in
    pregnancy, the Version 39.70 rule).
- Babies under 6 months: breast milk only, even in summer (the existing Learn line).
- In those months W1's line leads with "more on hot days".
- New wording, for the doctor.

**W5. Make the hidden lines visible (no new wording).**
- My pregnancy's "Iodised salt and water" week shows the water sentence too.
- The pelvic floor plan's water habit comes back once a week after week 4, the way earlier food habits already return
  (Version 39.9).
- "Food while you breastfeed" becomes "Food and water while you breastfeed".

**W6. Reminders: nothing new by default, and a water reminder she can turn on.**
- The water step is asked in the evening check-in like her other steps, so there's no new ring (Version 39.27: every new ring
  needs a reason).
- Me > Reminders gains "Water":
  - off until she turns it on;
  - then up to 3 rings a day at times she picks (11 am, 2 pm and 5 pm to start);
  - silent once her water step is ticked that day;
  - never in the last 2 hours before her bedtime.
- Why not on by default: the evidence for water pings is thin, and annoyed women switch reminders off altogether. Decision
  D2 is whether to make it on by default in pregnancy's hot months, where NCDC gives the reason.

**W7. Small wording additions, for the doctor.**
- On every water line's "Why?": "If your doctor has told you to drink less (for your heart or kidneys), follow your doctor."
- Two cards for "Sach ya Myth?":
  - "Cold water during periods causes cramps or clots": myth.
  - "Drinking less water stops swelling in pregnancy": myth. Swelling with a headache or blurred vision is a danger sign.
- Optional, for the PMOS weight goal: "and a glass of water before lunch and dinner" inside "No sweet drinks" (Parretti 2015).
- My period plan gets no water step (the evidence is weak), just one line in the period-day kit: "Keep drinking water
  through the day."

**What I'd leave out:**
- a glass counter (8 taps a day, against "ask less"), or a water log in the Diary;
- pings every hour or two, a water score or a streak;
- "detox water", "warm lemon water burns fat" or "water for fertility" claims;
- water as a fix for an infection instead of a doctor;
- one 8-glass rule for everyone, which is wrong for the pelvic floor, the heart and the kidneys.

## 4. The minimalist check

- **Today:** at most 4 steps. The water step only fills a free slot, and never on day 1. W3 and W4 use the one "Sakhi says"
  slot, one at a time.
- **Ask less:** no new question; the signals come from the diary she already keeps.
- **One home for each fact:** the water step is the only water place on Today. The hidden lines move; they aren't repeated.
- **Her evening:** unchanged; the check-in asks about the water step. There's no new ring by default, and the optional one
  has its own switch.
- **No new tours, tips or celebrations.** A missed water day is never a broken streak.
- **Shared phone:** water is a neutral word, so the step stays visible in discreet mode.
- **Measure it:** one tap a day where the step shows (her tick). Check with `days-run.mjs` before and after.

## 5. Decisions for you

- **D1.** Build W1 to W7 (recommended), or only W5, the light fix that makes the hidden lines visible with no new wording?
- **D2.** The water reminder: only when she turns it on (recommended), or on by default in pregnancy's hot months?
- **D3.** Hot months: April to June everywhere (the simplest), or by region, for example March to May in the South?
- **D4.** The new lines go to the doctors' next read:
  - W1's title and line;
  - W2's milk line;
  - W3's constipation line outside pregnancy;
  - W4's heat card;
  - W7.

  The lines already in the app can ship with the build, each under its own review status in the wording review.

## Build notes

- Files:
  - `web/progs/v1.js`: a `water` step in `preg` version 2 and `post` version 2, with changelogs; re-record the progs baseline
    and the golden plans.
  - `web/mods/plan.js`: the step, its place in the slots, and the check-in.
  - `web/mods/preg.js` and `web/mods/post.js`: the lines.
  - The "Sakhi says" sign cards.
  - Me > Reminders: the optional water reminder.
  - A new `web/test/water.mjs`, MODULE_API and the wording review.
- `web/app.js`, `web/content.json` and `web/MODULE_API.md` hold the Firebase move's uncommitted changes (Version 39.79).
  Build water after that lands, as Version 39.80.

## Sources

- ICMR-NIN, Dietary Guidelines for Indians, 2011 edition (read here):
  https://www.nin.res.in/downloads/DietaryGuidelinesforNINwebsite.pdf. Guideline 13, page 70: about 8 glasses (2 litre) a day,
  more in heat and hard work. Guideline 2, page 22: 8 to 12 glasses in pregnancy. No amount for breastfeeding.
- ICMR-NIN, Dietary Guidelines for Indians, 2024 edition: https://nin.res.in/dietaryguidelines/pdfjs/locale/DGI_2024.pdf.
  It's over 10 MB, too big to fetch here. Singh, Agrawal and Bhardwaj summarise its water guideline as 8 to 12 glasses by
  climate and activity (Indian J Community Med 2025;50(6):1088-9, https://pmc.ncbi.nlm.nih.gov/articles/PMC12735365/). The
  doctor should confirm the 2024 wording.
- ESPEN guideline on clinical nutrition and hydration in geriatrics (Volkert et al., Clinical Nutrition 2019;38(1):10-47):
  older women at least 1.6 litres of drinks a day. That figure comes from an excerpt of the guideline:
  https://hk-fresubin.web01.fresenius.com/hk/sites/default/files/2020-02/ESPEN%20Geriatric-Guidelines.pdf
- NHS bladder leaflets, 1.5 to 2 litres:
  https://www.uhs.nhs.uk/Media/UHS-website-2019/Patientinformation/Womenshealth/Bladder-retraining-for-an-overactive-bladder-1220-PIL.pdf
  and https://mft.nhs.uk/app/uploads/sites/4/2024/12/SMPIL-24-072-Fluid-Modification-Advice.pdf
- EFSA's pregnancy and breastfeeding additions, summarised by the EU:
  https://knowledge4policy.ec.europa.eu/health-promotion-knowledge-gateway/defining-water-recommendations-3_en
- EFSA, Scientific Opinion on Dietary Reference Values for water (2010).
- Institute of Medicine, Dietary Reference Intakes for Water, Potassium, Sodium, Chloride, and Sulfate (2004).
- NCDC, Public Health Advisory, Extreme Heat/Heatwave:
  https://ncdc.mohfw.gov.in/uploads/pdf/5.%20Public%20Health%20Advisory_Extreme%20HeatHeatwave.pdf
- Chersich et al., BMJ 2020;371:m3811 (heat and preterm birth).
- Hooton et al., JAMA Internal Medicine 2018;178(11):1509-15 (water and repeated bladder infections).
- Ndikom et al., Cochrane Database of Systematic Reviews 2014, CD008758 (extra fluids while breastfeeding).
- NICE NG123 (2019), urinary incontinence and pelvic organ prolapse in women.
- Torkan et al., BMC Women's Health 2021 (water and period pain): https://pmc.ncbi.nlm.nih.gov/articles/PMC7845092/
- Parretti et al., Obesity 2015;23(9):1785-91 (water before meals).
- Women avoiding drink without a toilet (Maharashtra):
  https://mcpune.bharatividyapeeth.edu/media/pdfs/journals/bvmj.in/journal/devane_2024.pdf and
  https://search.bvsalud.org/gim/resource/fr/sea-201542
- Water reminder trials:
  https://scholar.ui.ac.id/en/publications/effect-of-smartphone-application-with-reminder-on-total-fluid-int/ and
  https://digitalcommons.murraystate.edu/faculty/209
