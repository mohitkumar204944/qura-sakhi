# Qura doctor or government doctor: every place, for you to decide (6 Nov 2026)

Mohit, 6 Nov: "on every place i dont want to show qura doctor some places it should be only government doctor and some places
only qura doctor can you audit and create a list so i can decide".

**Built as Version 39.77 (6 Nov, Mohit's 96 choices; MODULE_API section 120, `web/test/doctorchoice.mjs`). Not committed yet.**

**The same list with screenshots, to choose on:** claude.ai/artifact/JbnFnzN9W5NC9tq7xQQRzL (private). The walk and the page are
`web/test/doctor-walk.mjs`, `web/test/doctor-shots.mjs`, `web/test/doctor-rows.mjs` and `web/test/doctor-page.mjs`.

**Update, 6 Nov (Mohit):** "Qura has to collect leads for PCOD/PCOS, fertility (help to conceive naturally), menopause, post
pregnancy, and any help with cycle concerns; rest everything suggest to see a gynaecologist / Govt. doctor free portal." The page now
recommends each place by that rule (33 Qura, 44 gynaecologist or government doctor, 17 both, 2 keep as they are), with the reason.
The recommendations live in `web/test/doctor-rows.mjs` (`area`, `rec`, `why`). The "Suggested" column below is the earlier
starting point.

## How I checked

- **The walk.** `node web/test/doctor-walk.mjs` (new, not pass/fail) opened every live screen and Help, for 7 women:
  - irregular cycles, regular cycles, trying for a baby;
  - 24 weeks pregnant, a baby 3 weeks old;
  - 48 with periods changing, periods stopped.

  It did each woman 5 times, once for each answer to "Where do you usually go for women's health?": not answered, a private
  doctor, a government hospital, my ASHA or ANM, nowhere yet. It also opened every Learn page 5 times. That's 7,595 screens over
  216 routes, plus 300 Learn pages, with no page errors. On each screen it noted every line naming Qura, every line naming
  government care, every "Ask a doctor" button and every "See a gynaecologist" button, with where each goes. The full result,
  line by line: `web/test/shots/doctor-walk/by-place.txt` (not in git).
- **The code.** I read the code for the plans' doctor cards (section C), because they only show on certain plan days and the sample
  women don't reach them.

## How Sakhi decides today

1. A Qura doctor shows for every woman, whatever she answered (your rule of 3 Nov: Qura first).
2. Her answer only changes the government wording:
   - "A government hospital" or "My ASHA or ANM": the lines name the PHC, ASHA or ANM first.
   - Everyone else: "your doctor" or "a gynaecologist" first, then "it is also free at a government centre".
3. Emergencies are the same for everyone ("Go to the nearest hospital now", 108, or 102 in pregnancy). They aren't on this list.

## Five things to know before you decide

1. **"Ask a doctor" never says Qura, but it always opens the Qura call.** It's on about 70 pages, on every diary sign, in Help and
   in every plan. So for any place you mark G, its "Ask a doctor" button has to go too.
2. **"See a gynaecologist" and "See a doctor" open a government list.** Unless she saved her own doctor's number, these buttons
   (on diary signs, and on the midlife plan's before-40 card) open Care near me. Care near me lists only government care: ASHA,
   Ayushman Arogya Mandir, PHC, CHC, district hospital, Jan Aushadhi and 104. "Free doctor or hospital", on a "see a doctor today"
   sign, opens the same page. A woman who said "a private gynaecologist" lands on it too.
3. **A woman who said "government hospital" now sees only the Qura doctor in three places.** Version 39.68 removed the free
   government doctor pages, and with them the government option on:
   - the doctor screen;
   - My plan's "Your care team";
   - Today's "Did you get the doctor check?".

   On that answer, My plan also hides her own doctor's Call row.
4. **Explore's "Govt. services" topic now holds one page: "How Qura helps, and where it stops".**
5. **58 of the 60 Learn articles end with "How Qura can help".** Most also have a "Free help" line (PHC, Ayushman Arogya Mandir,
   eSanjeevani, 104), shown to every woman.

## How to answer

For each row, put one letter in **You**:

| Letter | Meaning |
|---|---|
| **Q** | Qura doctor only. The government lines and buttons there go. |
| **G** | Government doctor only. The Qura line and the "Ask a doctor" button there go. |
| **B** | Both, the same for every woman (as most rows are now). |
| **H** | By her answer: the government doctor if she said a government hospital or her ASHA, the Qura doctor for everyone else. |

**Now** uses these words:
- "all" means every woman, whatever she answered.
- "gov answer" means she said a government hospital or her ASHA.
- "switches" means government words for the gov answer, and "your doctor" first for the rest.

**Suggested** is my starting point, based on what each doctor can actually do. Qura's doctors are BAMS: food, sleep, habits,
tests, reading reports and referring on. They don't run pregnancy check-ups, give vaccines, fit a Copper-T or prescribe hormones
or abortion pills. Schemes such as JSY, PMSMA, JSSK and free contraception exist only in government care. Change any of it.

---

## A. Where she asks for a doctor

| # | Place | How she gets there | Now | Suggested | You |
|---|---|---|---|---|---|
| A1 | Help, the "Ask a doctor" row | Help button on Today | Qura (all): "A call with a Qura doctor" | Q | |
| A2 | Help in a pregnancy, the "See a doctor" row | Help, while pregnant | Both: "Your gynaecologist (gov answer: ANM or gynaecologist) for the pregnancy; a Qura doctor for food, weight and sleep" | B | |
| A3 | The doctor screen, "Talk to a Qura doctor" | "Ask a doctor" on the gov answer, in a pregnancy, or when a call can't be made | Qura only, for all. The free government doctor card went in 39.68 | Q (H puts a government card back for the gov answer) | |
| A4 | The call form, "Ask Qura to call me" | Any "Ask a doctor" (3 taps) | Qura only | Q | |
| A5 | The Help and safety page | Help, then "Help and safety" | Qura (all): "Not an emergency? Speak to a Qura doctor". Govt (all): "Soaking a pad every 1–2 hours (ask for a haemoglobin test; free at a government hospital)" | B | |
| A6 | Search with no match | Explore's search | Qura (all): "Ask a doctor" | Q | |
| A7 | "See a gynaecologist" / "See a doctor" button | A diary sign; the midlife plan's before-40 card | Her own doctor's number if saved, otherwise Care near me (government list), for all | H | |
| A8 | "Free doctor or hospital" button | A "see a doctor today" sign | Her own doctor's Call first if saved, then Care near me (government list), for all | G | |
| A9 | Care near me | A7 and A8 | Government only, for all: ASHA, ANM and Anganwadi, Ayushman Arogya Mandir, PHC and CHC, district hospital, Jan Aushadhi, Ayushman card hospitals, 104 | G | |
| A10 | The "Govt. services" topic | Explore, All topics and guides | Qura only: its one page is "How Qura helps, and where it stops" | Rename it, or move that page | |
| A11 | The question "Where do you usually go for women's health?" | Joining; Me, "Where I get care" | It is the switch for "switches" and for any H | Keep it if any row is H | |
| A12 | PMSMA-day reminders | Me, Reminders, while pregnant | Gov answer only | G | |

## B. Today and the Diary

| # | Place | How she gets there | Now | Suggested | You |
|---|---|---|---|---|---|
| B1 | A sign from her diary (heavy or long periods, spotting, late, long or short gaps, pain, pain with sex, discharge, burning, low mood, hot flushes, a racing heart, low Hb, bleeding after menopause) | Today's card; Diary, "What your diary shows" | "Ask a doctor about this" (Qura) first, for all; then "See a gynaecologist" / "See a doctor" (A7) | B: Qura first, then the doctor the sign needs | |
| B2 | A sign's iron and test lines | The same cards | Switches: "Ask your doctor if you need iron tablets. They are also free at government health centres" or "Free iron tablets come from your ASHA or health centre"; "Any chemist sells one; your ASHA gives Nishchay kits free" or "Free Nishchay kits come from your ASHA" | H | |
| B3 | "Due now: Scheme money: PMMVY and JSY" | Today and the Calendar, pregnant | Gov answer only | G | |

## C. Her plan (from the code)

| # | Place | When | Now | Suggested | You |
|---|---|---|---|---|---|
| C1 | Her plan's "Talk to a Qura doctor" button | The plan's doctor page before Start (when her answers need a doctor first), the end page, the "two quiet weeks" card | Qura (all). The free government doctor button beside it went in 39.68 | B | |
| C2 | My plan, "Your care team" | My plan, from week 2 folded | Rows: My doctor (her number; hidden on the gov answer), A Qura doctor, My report, Help. No government row since 39.68 | B (H: government row for the gov answer) | |
| C3 | "Did you get the doctor check?" | Today, when her plan needs a doctor's check | The line names the check (for PMOS: thyroid, prolactin and PMOS). For heavy bleeding or low Hb it adds "It is free at a government health centre" (gov answer) or "It is also free…" (the rest). Buttons: Yes, done; Ask a doctor (Qura); Later | B | |
| C4 | Day 3's card | Sakhi says, day 3 | Qura (all): "A Qura doctor can go through it with you. The first 20-minute call is free." | Q | |
| C5 | The 4-week check, if she's worse | The 4-week check | Ask a doctor (Qura). The free government doctor button went in 39.68 | B | |
| C6 | Her Hb test step; My period plan's Hb chapter | The plan's Hb step | Both (all): "Ask a Qura doctor, or your own doctor"; "it is free at government health centres" | B | |
| C7 | Getting ready for a baby, "A few things first" card | Days 1 to 21 | Gynaecologist first; "Free: the PHC or Ayushman Arogya Mandir, or eSanjeevani"; "A Qura doctor can help with food, sleep and habits on a free call; your fertility check is with a gynaecologist" (all) | B | |
| C8 | Getting ready: 6 or 12 months of trying | Sakhi says | "See a gynaecologist" (all) | H | |
| C9 | Getting ready: folic acid and Hb | Her daily tablet; the Hb step | Govt (all): "Free at the PHC or Ayushman Arogya Mandir"; "Free at the Ayushman Arogya Mandir" | H | |
| C10 | My pregnancy: check-ups, PMSMA, JSY and PMMVY, JSSK, her ASHA's number | Her check-ups page (`preg-plan`) | Gov answer: government only. The rest: "your gynaecologist" words, no government lines | G (for the gov answer as now) | |
| C11 | My pregnancy: "Before you start" | Before her first step | "Has your doctor or ANM told you…" (all) | B | |
| C12 | My postpartum recovery: the 6-week check | Days 1 to 42 | Switches: "your PHC, Ayushman Arogya Mandir or the hospital where you gave birth" | H | |
| C13 | My period plan's doctor chapters (week 4's "When to see a doctor", the Hb chapter) | Its chapters | Qura (all): "On a free call, a Qura doctor goes through your periods and your diary… refers you to a gynaecologist" | Q | |
| C14 | My pelvic floor plan's checks (weeks 1, 4 and 12; pain; still leaking) | Its cards | Qura first (all): "A Qura doctor can help", "a Qura doctor first, or your own". Gov answer adds "A government hospital's gynae OPD can check it too" | B | |
| C15 | My midlife plan: before 40, periods stopped | Its card | "Ask a doctor" (Qura) first, then "See a gynaecologist" (A7) | B | |
| C16 | My midlife plan: weeks 4 to 7, hot flushes | Its card | "Hormone therapy, prescribed by an MBBS gynaecologist" (all); the hormone therapy article | Q, then a gynaecologist | |
| C17 | My midlife plan: checks after 40 | Weeks 12 to 16 | Switches: "Free at your Ayushman Arogya Mandir", "Your ASHA can tell you when" | H | |

## D. Explore's pages (from the walk)

Every page in this section with "Ask a doctor about this" opens the Qura call. Where a row says nothing about Qura, the page has no
Qura line or button.

### Periods and conditions

| # | Page | Now | Suggested | You |
|---|---|---|---|---|
| D1 | Periods (hub and topic) | Govt (all): "See a doctor today if: soaking a pad… free at a government hospital"; Ask a doctor (Qura) | B | |
| D2 | Period pain | Qura (all): "A Qura doctor can go through your pain diary with you… refer you to a gynaecologist". Switches: "See a gynaecologist, or the gynaecology OPD…" or "Go to the gynaecology OPD at a government hospital" | B | |
| D3 | Fasting and periods | Qura only | Q | |
| D4 | Conditions (hub) | Qura only: "Not sure which page fits? A Qura doctor can listen, order tests…" | Q | |
| D5 | Fibroids | Qura (all); govt (all): "A gynaecologist at a district hospital or medical college…; PM-JAY" | B | |
| D6 | My lab reports | Qura only | Q | |
| D7 | PID and genital TB | Qura (all); govt (all): Suraksha clinics, free tests and medicines, the TB programme, a second opinion at a government hospital | B | |
| D8 | Early menopause (POI) | Qura (all); govt (all): "the gynaecology OPD of a district hospital or medical college" | B | |

### Contraception

| # | Page | Now | Suggested | You |
|---|---|---|---|---|
| D9 | Contraception (hub, topic, "Which method?") | Qura (all): "A Qura doctor (BAMS) can talk it through… Hormonal methods are started by an MBBS doctor"; "Book a free call". Govt switches: "Most methods here are also free at government centres" | B | |
| D10 | Free contraception | Government only (all): ASHA, sub-centre, PHC, CHC, ₹300 PPIUCD, sterilisation compensation, 104 | G | |
| D11 | Each method's page: the pill (Mala-N), Chhaya, Antara, Copper-T, implant, IUS, mini-pill, tubectomy, NSV | Govt (all): where it's free and who gives it. Qura (all): "Qura's BAMS doctors can explain it and refer you". Ask a doctor (Qura) | G (Qura can't start these) | |
| D12 | Condoms; breastfeeding as a method (LAM) | Govt: "Your ASHA brings Nirodh condoms home, free" (all); LAM's ASHA line (gov answer). Ask a doctor (Qura) | G | |
| D13 | Emergency pill; missed pill | Govt, switches: "Any chemist sells it…; also free from your ASHA, the sub-centre, PHC or CHC". No Qura | B (chemist or government) | |

### Intimate health, iron, check-ups

| # | Page | Now | Suggested | You |
|---|---|---|---|---|
| D14 | Intimate health (hub and topic) | Govt (all): the STI/RTI clinic, a free HIV test (ICTC). Ask a doctor (Qura) | B | |
| D15 | First time, or pain with sex | Govt (all): "Start at the gynae OPD of a district hospital or medical college". Ask a doctor (Qura) | B | |
| D16 | Prolapse | Switches: "A gynaecologist can examine you…; the gynae OPD of a district hospital…". Ask a doctor (Qura) | H | |
| D17 | Iron tablets | Switches: the gov answer gets Anemia Mukt Bharat and the ASHA, ANM or PHC (6 lines); the rest get "free at government health centres". Ask a doctor (Qura) | H | |
| D18 | Check-ups after 30 (hub and topic) | Qura (all): "A Qura doctor (BAMS) can go through your check-up list…"; "Book a free call". Govt (all): the ASHA's CBAC form, walk in to the Ayushman Arogya Mandir; switches | B | |
| D19 | Breast check, cervix (VIA), cancer signs, My check-ups | Govt (all or switches): free at the Ayushman Arogya Mandir or PHC, referred to the CHC. Ask a doctor (Qura) | G | |
| D20 | HPV vaccine | Govt only (all): free at 14 at government centres, U-WIN, the ASHA. Ask a doctor (Qura) | G | |

### Trying for a baby

| # | Page | Now | Suggested | You |
|---|---|---|---|---|
| D21 | Trying for a baby (hub and topic) | Qura (all): "Qura's doctors are BAMS… Ovulation tablets, IUI and IVF need an MBBS/MD gynaecologist". Govt switches: "your ASHA, the ANM and the Ayushman Arogya Mandir can do several of them free" | B | |
| D22 | Getting ready: the checklist | Govt (all): the free-test list at the Ayushman Arogya Mandir and bigger government hospitals; "ask the ANM… your ASHA can take you". Ask a doctor (Qura) | B | |
| D23 | Fertility tests; Trying for a year | Qura (all); govt (all): government infertility clinics, free TB treatment; switches: "Start with a gynaecologist, or the gynaecology OPD…" | B | |
| D24 | His semen test; two losses | Govt: government hospital labs and OPDs (switches). Ask a doctor (Qura) | H | |

### A pregnancy test, and her choices

| # | Page | Now | Suggested | You |
|---|---|---|---|---|
| D25 | Pregnancy test; reading the strip | Govt switches: "Your ASHA usually carries pregnancy test kits (Nishchay)…" or "any chemist… also free at a government health centre". Ask a doctor (Qura) | H | |
| D26 | Positive: your choices | Switches: "See a gynaecologist this week (or an ANM or PHC doctor)…". Govt (all): MTP free at government hospitals, CARA. Qura (all): "A Qura doctor can listen without judging… help you find a registered gynaecologist or a government hospital" | B | |
| D27 | Safe, legal abortion | Govt (all): free at government hospitals. Qura (all): "Qura's doctors are BAMS and cannot prescribe abortion pills"; "Qura's part" | G (Qura can't do it) | |
| D28 | After an abortion | Govt switches: "a haemoglobin test… free at a government hospital". Ask a doctor (Qura) | B | |

### Pregnancy

| # | Page | Now | Suggested | You |
|---|---|---|---|---|
| D29 | Pregnancy (hub and topic) | Govt (all): PMSMA on the 9th, JSSK, food from the Anganwadi. Qura (all), switches: "A free call with a Qura doctor (BAMS) can help with food, weight and sleep. Your (ANM or) gynaecologist looks after the pregnancy itself" | B | |
| D30 | Week by week (weeks 4 to 42) | Gov answer: "Your ANM's count wins" on every week. Weeks 5, 12, 23, 29 and 30 name government care for all. No Qura | H | |
| D31 | My MCP card | Govt by nature (the card is the government's) | G | |
| D32 | Food in pregnancy | Qura (all): "A Qura doctor (BAMS) can plan meals…". Govt (all): the Anganwadi's take-home ration | B | |
| D33 | My pregnancy numbers | Qura (all): "Your Qura doctor sees this at your next visit if you share it". Gov answer: "what your ANM or doctor measures" | Your doctor, not Qura (check this line) | |
| D34 | Hospital bag | Govt (all): government hospital rules (LaQshya, JSSK); her doctor's or ASHA's phone (switches) | B | |
| D35 | Birth plan | Qura only: "A free 20-minute call with a Qura doctor (BAMS) can help you list questions for your hospital visit…" | Q | |
| D36 | Contraction timer; kick counter | Govt (all): the JSSK ambulance, "your doctor or ANM". No Qura | G | |

### After a birth, and after a loss

| # | Page | Now | Suggested | You |
|---|---|---|---|---|
| D37 | After a birth (hub and topic) | Qura (all): "A Qura doctor (BAMS) can talk through recovery, sleep, food and feeding…". Gov answer: ASHA visit days, "Next ASHA visit" | B | |
| D38 | Checks and vaccines | Govt: vaccines free at government centres (all); the gov answer adds ASHA visits, iron for 180 days, the 6-week check at the PHC, JSSK; the rest get "Does an ASHA visit you?". No Qura | G | |
| D39 | Contraception after a birth | Qura (all): "A Qura doctor can talk through your options… refer you to a gynaecologist or a government facility". Govt switches | B | |
| D40 | Breastfeeding help | Switches: "A nurse…, your doctor, or your ASHA or ANM can watch a feed… A Qura doctor can also talk it through" | B | |
| D41 | Mood after the birth | Qura (all): "Talk it through with a Qura doctor". Gov answer: "…or your ASHA" | Q | |
| D42 | Pelvic floor after a birth; "Is my body ready?" | Qura (all): "A Qura doctor can talk it through on a free call. Your own doctor or a women's health physiotherapist can check it" | Q | |
| D43 | After a loss: recovery | Govt switches: "Your gynaecologist, or your nearest PHC, CHC or district hospital…", JSSK. No Qura | H | |
| D44 | After a loss: trying again; kinds of loss | Qura only: "Qura's doctors (BAMS) can help with food, weight and sleep…, order tests…, and refer you" | Q | |

### Midlife, girls, family, records

| # | Page | Now | Suggested | You |
|---|---|---|---|---|
| D45 | Menopause (hub and topic) | Qura (all): "On a free call a Qura doctor (BAMS) goes through your diary…". Govt switches: "the gynaecology OPD… BP and sugar free at your nearest Ayushman Arogya Mandir" | B | |
| D46 | Bones and heart after 40 | Qura (all): calcium meals and exercise. Govt switches: BP and sugar free at the Ayushman Arogya Mandir, the screening from 30 | B | |
| D47 | Hormone therapy; dryness; surgical menopause; the timeline | Qura only (each one refers to an MBBS gynaecologist for HRT) | Q | |
| D48 | Girls' guides (first periods) | Govt only (all): the teen clinic (AFHC), the school's health ambassadors, free pads | G | |
| D49 | For a mother of a girl | Qura (all): "you can book a free call with a Qura doctor (BAMS) about her periods…". Govt (all): AFHC, HPV | B | |
| D50 | For my family; For a partner | Govt (all): Hb free, PMSMA, free condoms, NSV. The partner page adds "Talk to a Qura doctor" | B | |
| D51 | My medicines | Govt (all): Jan Aushadhi, free medicines at government hospitals. Qura (all): "A Qura doctor (BAMS) can go through your list…" | B | |
| D52 | My reports | Govt switches: free tests at government hospitals, ABHA. Qura's line here is about privacy (ABDM), not a doctor | B | |
| D53 | Symptoms guide; the Support topic | Qura (all): "Speak to a Qura doctor. The first 20-minute call is free". Symptoms adds "free at a government hospital" | Q | |

## E. The Learn library (60 articles)

| # | Place | Now | Suggested | You |
|---|---|---|---|---|
| E1 | "How Qura can help", at the end of 58 articles (not "Pregnancy danger signs", not "Pads, cloth, cups") | Qura (all) | Q, except the pregnancy and after-birth articles (B) | |
| E2 | The "Free help" line in most articles: "your PHC or Ayushman Arogya Mandir, eSanjeevani, 104" | Govt (all) | H | |
| E3 | About 60 lines in 30 articles that switch by her answer (all listed in `docs/doctor-route-review-2026-10-28.md`) | Switches | H | |

By group, if you want to answer group by group. "Gov answer only" counts lines that only the gov answer sees.

| Group | Articles | Qura lines each | Government lines | You |
|---|---|---|---|---|
| Your cycle | 11 | 2 (first periods: 4) | 1 to 4; 3 articles have gov-answer-only lines | |
| PMOS | 9 | 2 | 1 to 3 | |
| Getting pregnant | 6 | 2 or 3 | 2 to 8; up to 4 gov answer only | |
| Pregnancy and after the birth | 8 | 2 or 3 (danger signs: 0) | 4 to 10; up to 8 gov answer only (check-ups, tablets, the first six weeks) | |
| Intimate health | 7 | 2 (pads: 0) | 1 to 6 | |
| Midlife | 9 | 2 | 1 to 9 (bones and heart: 9) | |
| Mind and body | 6 | 2 or 3 | 1 to 5 | |
| Qura and services | 4 | 2 to 8 ("How Qura helps", privacy) | 0 to 3 | |

## F. Not a doctor choice (these stay unless you say)

- **Emergencies:** "Go to the nearest hospital now", 108, and 102 in pregnancy: the same for every woman (the doctors' review, 6 Nov).
- **Qura as the company:** these name Qura as the app's maker, not as a doctor to see.
  - the welcome line "A Qura doctor is behind it when you want one";
  - the consent ("Qura's care team");
  - About and privacy, and Account;
  - the voice note on the language page.
- **The report for the doctor:** the prescriber names in it ("Doctor at the PHC", "ANM at my ANC visit") are what she typed.
- **Hindi** follows the English line for line, so one answer covers both.

## What happens after you answer

1. A row marked **Q, G or B** becomes one rule for every woman.
2. A row marked **H** keeps the joining question (A11) and uses it.
3. Where a row loses its government option, I check that she still has a way to a doctor. Points 2 and 3 of "Five things to know"
   show places where that's thin today.
4. New or changed health lines wait for the doctors' read, as usual. Removing a line or button doesn't need one.
