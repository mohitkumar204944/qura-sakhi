# The doctor ladder: which doctor for each sign (for the doctor, 3 Nov 2026)

Phase E of `docs/personal-companion-advice-2026-11-03.md` (section 4.9, decision D4). Mohit, 3 Nov: "proceed with phase E".
The advice says the doctor packet comes first. This is it.

**What we ask the doctor:**
1. For each sign in section 2: which doctor should the first button name? The choices are a gynaecologist, a Qura doctor, or a
   doctor today.
2. The new lines in section 3.
3. The order of a doctor card's buttons (section 4).

**Why it matters.** Qura's doctors are BAMS doctors. Today every sign in her diary leads with "Ask a Qura doctor about this", even
signs that need an exam, a scan or prescription medicine, such as bleeding after menopause. The lives audit (3 Nov) found that on
Sunita's page. The reviewed "see a doctor" lines in each card stay word for word. Only the buttons under them change.

**Update, 3 Nov:** Mohit answered sections 2 to 4 for the product (section 7, built as Version 39.64). The sign map waits for you, and
so do the private pages in Help (section 8).

**Built now, without waiting (Version 39.63, UI only):** the 3-tap request, one label, one doctor card at a time on Today, and her
own doctor's Call first for a "see a doctor today" sign. See section 5. Everything in sections 2 to 4 waits for your answers.

---

## 1. The ladder today

| Rung | Where | What she sees now | Taps to a sent call request |
|---|---|---|---|
| 0 Emergency | Help's "Call 112 now", danger words in search, a "now" sign | Call 112 (Tele-MANAS 14416 first for harm) | — |
| 1 A sign in her diary | Today's row, then "What your diary shows" | "Ask a Qura doctor about this" for every "this week" or "this month" sign; free care near her for "today" | 4 from Today's row |
| 2 Her plan's doctor moment | "Sakhi says" on Today | "Did you get the doctor check?", "Ask a Qura doctor" (V39.58) | 3 |
| 3 Any time | Help, then "See a doctor" | The doctor screen, then "Ask for a call", then she types a topic | 4, and typing |

The baby plan already says "See a gynaecologist now" where its version needs one (Version 39.32, waiting for your review). The
pregnancy plan sends the pregnancy itself to her ANM or gynaecologist (Version 39.38).

## 2. Each sign: the doctor now, and our proposal

The level is how soon her card says to see a doctor. "Proposed first" is our suggestion, marked † until you confirm it. With a
gynaecologist first, "Ask a Qura doctor" stays as the second button, for food, sleep and habits.

| Sign (finding) | Level | Reviewed line (unchanged) | Button now | Proposed first † | Why |
|---|---|---|---|---|---|
| Bleeding after her periods stopped (`bleed_after_stop`) | week | See a doctor within 2 weeks | Ask a Qura doctor | Gynaecologist | Needs a scan of the womb lining, sometimes a biopsy |
| Bleeding after sex (`aftersex`) | week | See a doctor within 2 weeks and ask for a cervix check (VIA or Pap) | Ask a Qura doctor | Gynaecologist | A speculum exam and a cervix test |
| Spotting between periods, 3 or more days (`spot_between`) | month | See a doctor this month | Ask a Qura doctor | Gynaecologist | An exam; sometimes a scan |
| A period over 8 days (`period_long`) | week | See a doctor this week and ask for an Hb test | Ask a Qura doctor | Gynaecologist | An exam and an Hb test; treatment can need prescription medicine |
| Heavy flow (`flow_heavy`) | week | See a doctor this week and ask for an Hb test | Ask a Qura doctor | Gynaecologist | As above |
| Pain that stopped her day (`pain_severe`) | month | See a doctor this month | Ask a Qura doctor | Gynaecologist | Checks for endometriosis and fibroids |
| Pain during sex (`sexpain`) | month | See a doctor this month | Ask a Qura doctor | Gynaecologist | An exam |
| Long gaps, 2 in 6 months (`gap_long`) | month | See a doctor this month. Blood tests for thyroid and hormones | Ask a Qura doctor | Gynaecologist | Hormone tests and a scan (PMOS) |
| Short gaps, 2 in 6 months (`gap_short`) | month | See a doctor this month and ask for TSH and Hb | Ask a Qura doctor | Gynaecologist | Tests and an exam |
| No period for 90 days (`late_now`) | month | See a doctor this month | Ask a Qura doctor | Gynaecologist | Tests for the cause, after a pregnancy test |
| Signs that can come with PMOS (`androgen`) | month | See a doctor this month. A blood test helps find the cause | Ask a Qura doctor | Gynaecologist | The diagnosis needs tests; the Qura doctor helps with food and habits after it |
| Dark velvety skin (`neck`) | month | Ask a doctor for a sugar test this month | Ask a Qura doctor | A doctor (MBBS) | A sugar test |
| Low Hb below her report's range (`hb_low`) | month | See a doctor this month. Usually iron tablets and a repeat test | Ask a Qura doctor | A doctor (MBBS) or gynaecologist | Iron is prescribed; the Qura doctor helps with iron foods |
| Burning when she pees (`burn`) | week; today in pregnancy | See a doctor in the next few days | Ask a Qura doctor | A doctor (MBBS) | A urine test and antibiotics |
| Unusual discharge or itching (`disch`) | week | See a doctor this week | Ask a Qura doctor | Gynaecologist | An exam and treatment |
| Hot flushes waking her (`m_hot`) | month | See a doctor this month. They can talk you through treatments, including HRT | Ask a Qura doctor | Qura doctor first, then a gynaecologist for HRT | Habits first; hormone therapy is prescribed |
| A racing heartbeat (`m_palp`) | month | See a doctor this month | Ask a Qura doctor | A doctor (MBBS) | An ECG and thyroid test |
| Low mood after the birth (`pp_mood`) | month | Talk to a doctor. Tele-MANAS 14416 | Ask a Qura doctor | Tele-MANAS 14416, then a doctor | BAMS isn't a mental-health professional (feature research, 22 Oct) |
| Low mood or anxiety most days (`mood`) | month | (Help) | Help | Tele-MANAS 14416 | As above |
| Leaking urine 3 months after the birth (`pp_leak`) | watch | Still leaking 3 months after the birth: see a doctor | — | Gynaecologist or a women's health physiotherapist | Pelvic floor check |

"Today" signs (burning in pregnancy, nausea she can't keep down, a red breast patch with fever, stitches, discharge with fever)
keep "See a doctor today". The free care near her stays the first button, and her own doctor's Call comes first when she has
saved the number (built now, section 5). "Now" signs keep Call 112, unchanged.

## 3. New lines (UI and health, for review)

| Where | Line | Notes |
|---|---|---|
| A sign's first button † | **See a gynaecologist** | In place of "Ask a Qura doctor about this", for the signs you confirm |
| Under it † | Qura’s doctors can help with food, sleep and habits. This check needs a gynaecologist. | From the baby plan's line (`plan_bdoc_qura`) |
| What the button opens † | Her own doctor's Call if she saved the number. Otherwise, by her care answer: the free government gynaecologist (the government route), or a gynaecologist near her (Care near me) | Her report goes with her if she says yes |
| A sign for a doctor (MBBS) † | **See a doctor** | The same, with "a doctor" for "a gynaecologist" |
| Help's row (built now) | **Ask a Qura doctor** | Was "See a doctor". In a pregnancy it stays "See a doctor", with her ANM or gynaecologist first |
| The Help page's button (built now) | **Ask a Qura doctor** | Was "Speak to a doctor" |
| The call form (built now) | Topic choices: the page she came from, her plan, her goals | So she doesn't have to type |

## 4. The order on a doctor card †

1. The right doctor first (section 2).
2. Her own doctor's Call, if saved (Version 39.41).
3. "Ask a Qura doctor" (food, sleep, habits; a free first call).
4. One quiet free line by her care answer: the free government doctor on the government route. Otherwise "Free care exists, for
   example eSanjeevani".
5. "I've seen a doctor", then "What did the doctor say?" (the loop, Versions 39.6 and 39.57).

## 5. Built now (Version 39.63), no new health wording

- **3 taps to a sent request**, with no typing:
  - "Ask a Qura doctor" opens the call form straight away, with the topic filled in. Before, it opened the doctor screen and then
    the form. The doctor screen stays for a pregnancy, the government route, and when a call can't be made.
  - The form offers topic choices: the page she came from, her plan, her goals.
  - Help's row "Ask a Qura doctor" opens the form with the page she was on as the topic.
- **One label:** "Ask a Qura doctor" on Help's row and on the Help page's button.
- **One doctor card at a time on Today:** her plan's "Did you get the doctor check?" waits while a sign from her diary is on Today.
  The sign leads; the plan's card comes back when she answers it.
- **Her own doctor first for a "today" sign:** "Call my doctor" leads when she saved the number, before the free care near her.

## 6. Questions

1. Section 2: for each sign, which doctor first? Where we wrote "Gynaecologist", is that right for a woman in a village with only a
   PHC? Should the first button then say "See a doctor (a gynaecologist if you can)"?
2. Heavy flow and long periods: gynaecologist first, or "a doctor" (MBBS, at the PHC) first with the Hb test?
3. Hot flushes: Qura doctor first (habits, the CBT course in the midlife plan), with HRT questions to a gynaecologist?
4. Low mood: Tele-MANAS 14416 first, then "a doctor"? Should a Qura doctor be offered at all for low mood?
5. Section 3's "Qura’s doctors can help with food, sleep and habits. This check needs a gynaecologist." Is that fair and clear?
6. Section 4's order: is her own doctor's Call before "Ask a Qura doctor" right?

---

## 7. Mohit's answers (3 Nov), built as Version 39.64

Mohit answered sections 2 to 4 himself, for the product. The sign map in section 2 still waits for the doctor (†).
- **Qura first, gynaecologist second.** Every sign keeps "Ask a Qura doctor" as its first button. "See a gynaecologist" (or "See a
  doctor" for an MBBS sign) is the second, for the signs section 2 marks. This replaces the "Proposed first" column: the right
  doctor is offered beside the Qura doctor, not before it.
- **No line that steers her away from the Qura doctor.** Section 3's "This check needs a gynaecologist" is dropped. His words: "No
  recommend a qura doctor".
- **A woman near a PHC:** the button says "See a gynaecologist".
  - It opens her own doctor's number if she saved it.
  - Otherwise, on the government route, it opens the guide to seeing a gynaecologist at a government hospital, or the free doctor
    page for an MBBS sign.
  - Otherwise it opens Care near me.
- **Low mood:** Tele-MANAS 14416 first, then "Ask a Qura doctor".
- **The locked app** keeps Help hidden, for privacy.

**Still for the doctor:**
1. Section 2's map: is each sign's second doctor right (gynaecologist, or an MBBS doctor)?
2. Section 8 below.

## 8. For the doctor to glance: the private pages in Help (Version 39.62)

Phase D moved three pages from Explore's topic grid into Help's "Private help": "Violence and your safety", "Safe, legal abortion"
and "STI tests: free and private". Each is now 2 taps from every screen, at every stage, through the Help button on every screen.
- In a pregnancy, "Pregnant and didn't plan it" (her choices, without judgement) stands for the abortion page.
- After a loss there is no abortion row, as in her topics.
- On a shared phone the group shows, with the pages' own titles.

Search still finds all three, and their topics are a tap further, in the library.

**Question:** is Help the right place for them, with these titles, on a shared phone too?
