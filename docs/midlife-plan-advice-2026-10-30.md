# My midlife plan: what it becomes and how it is personalised (advice, 30 Oct 2026)

Mohit, 30 Oct: "start with the midlife plan" (the order agreed: I had a baby, then one plan for the midlife stages, then the
period goal plans). Advice only, nothing built.

It starts from the researched design in `docs/plans-design-and-build-2026-10-24-programmes.md`, section 5 ("Midlife: cool,
calm, strong"). It brings that design up to the rules set since:
- doctor first (Versions 39.28 and 39.29);
- the minimalist baseline (CLAUDE.md, Version 39.27);
- one card at a time in Sakhi says, led for 3 days at most (39.47);
- what Getting ready (39.32), My pregnancy (39.34 to 39.40) and I had a baby (39.46) taught;
- Wind down (39.21 to 39.24) and the 3D figure (39.39);
- "app size is not a barrier".

Another session is building Version 39.49, "night sweats and sleep" (`test/nightsweats.mjs`, uncommitted). The plan builds on
it and doesn't redo it.

## 1. The short answer

Today's midlife plan (`web/progs/v1.js`, `meno` version 1) is a light plan:
- one routine for her goal (hot flushes, sleep or calm), the same every day;
- a walk;
- strength twice a week and a calcium food for the bones goal, or the plate for weight;
- a weekly diary tick.

It runs 12 weeks, then weekly to a year. It teaches nothing, it doesn't change over the weeks, and it never says what helps
flushes. The proposed plan is `meno` version 2, **"Cool, calm and strong"**, for both midlife stages: periods changing after
40 (`mid`) and periods stopped (`meno`). It has three 4-week parts, in the order her goal needs, then a year of keeping it
going:

| Part | What it does | How |
|---|---|---|
| **A. Cool and calm** | Flushes and night sweats feel easier to handle, even when they still come | A short self-help CBT course in Dr. Megha's voice, one chapter a week, with a 2-minute daily practice. CBT is what NICE (updated Nov 2024) and The Menopause Society (2023) recommend beside hormone therapy. The calm version uses the same spine for worry and low mood |
| **B. Rest** | Steadier sleep | One sleep rule a week (a steady get-up time; get up after about 20 minutes awake; naps and light; when sleep needs a doctor), with Wind down at bedtime and Version 39.49's "How did you sleep?" as her sleep note. No computed sleep window |
| **C. Strong and steady** | Muscle, balance and safer bones | Strength at home on 2 days, a steady minute at the wall on the other days, bone foods, and bone-safe moves for everyone. No impacts in version 1 |
| **Keep going** (months 4 to 12) | Keeps what worked | One kept step a day, the evening check-in, and one lesson a month (hormone therapy questions for her doctor, dryness and urine, the heart after 40, weight and muscle, mood, check-ups) |

It is personalised by her goal (it sets the order), her stage (still bleeding or not), her bones and heart answers (they set
the moves), her diary (flushes and sleep), her care route and her food. It is not personalised by a version chosen once.

What it never does:
- it never promises fewer flushes from breathing, yoga, food or cooling (The Menopause Society recommends none of them as
  flush treatments; paced breathing, Level I, for lack of benefit);
- it never names herbs, soy or "natural hormones";
- it never doses a tablet. Hormone therapy is her doctor's choice, and the plan helps her ask.

## 2. How it differs from the four plans built so far

| | My PMOS plan | Getting ready | My pregnancy | I had a baby | **My midlife plan (`meno` v2, proposed)** |
|---|---|---|---|---|---|
| Purpose | Habits for her cycle | Ready for a pregnancy | A safe pregnancy | Heal, feed, back to strong | Easier flushes and nights, steadier mood, stronger muscles and bones |
| Clock | 12 weeks, then monthly | 12 weeks | Her pregnancy week | Days since the birth | 12 weeks in 3 parts by her goal, then monthly to month 12 |
| Daily steps | Yoga, walk, food, bedtime | Tablet, move, food | Walk, pelvic floor, food | Squeezes, goal step, recovery check | Today's skill (the part's practice), a walk, a bone food on its days; strength on 2 days |
| Lessons | None | 12 weekly | By her week | Planned | 12 weekly (4 per part), then monthly |
| Evening | "How did today go?" | The same | + movements from 28 weeks | Recovery check to day 41 | "How did today go?", with "How did you sleep?" (39.49) and one weekly question: her goal's 0 to 10 |
| Doctor | Qura doctor for habits | Her version's card | Her own doctor | Her own doctor | Her own doctor (gynaecologist) for treatment, including hormone therapy. One card at week 4 for everyone, a sleep card at week 8, check-ups after 40 at week 12 |
| Results | Gaps, signs, minutes | Tablets, checklist | Check-ups, tablets | Leaks | Her goal's number (first 2 weeks against the last 2), good nights, strength days, seconds on one leg. Plain counts, never "improved" |

## 3. How it is personalised: what she tells Sakhi, and what changes

| What Sakhi knows | Where it comes from | What it changes |
|---|---|---|
| Her stage | Joining's tile, or the stage sheet: periods changing (`mid`), periods stopped (`meno`), after an operation (`meno-surgical`) | Still bleeding: her cycle card stays, the reviewed "bleeding changes to tell your doctor about" line is pinned, and contraception is still needed. Stopped: bleeding after menopause is a "see a doctor" sign |
| Her age | Joining's year of birth | Under 40 with periods stopped: no plan until she taps that a doctor told her (an early-menopause card first). 40 to 45: "early menopause: tell your doctor" pinned once |
| Her goal | Joining (hot, sleep, mood, bones, weight, heavy), or My plan | The order of the parts (below). Heavy periods at 40+ keep the heavy-periods plan, with the bleeding-changes card |
| Her bones and heart | Two questions in the plan's own questions (no new screen): "Has a doctor told you about weak bones, or a bone that broke after a small fall?" and "Chest pain, fainting or breathlessness when you walk?" | Bones: walking and strength stay, with no forward or side bends anywhere. Heart: easy walking only until her doctor says, strength held at level 2 |
| Her diary | The midlife diary (`S.meno.trend`) and 39.49's sleep answers | Which chapter's examples she sees; 39.49's doctor card (flushes and poor sleep together on 3 of 14 days) |
| Hormone medicine | Joining's pill question ("The pill, a hormonal IUD, an injection, an implant or HRT") | On hormone therapy: the doctor's plan comes first, flushes still count, and its own warning signs (one swollen calf, sudden breathlessness, weakness on one side) |
| Where she gets care | Joining's "Where do you usually go?" (39.28) | "Your doctor" by default. The free checks at 30+ (BP, sugar, breast and cervical screening at the Ayushman Arogya Mandir) as one quiet line, or first for a woman who picks government care |
| Her day and food | Joining's details, My food (diet, region, milk, fasting), her knees or back | Where the walk starts; bone foods by region and diet (ragi, til, curd, greens, dal); swaps for knees or back |
| A shared phone | Discreet mode | Neutral titles and reminders; the lessons' titles plain; private steps hidden |

**The order of the parts:**

| Her goal | Order |
|---|---|
| Hot flushes or night sweats | A Cool and calm, B Rest, C Strong and steady |
| Sleep | B, A (the calm version if she has no flushes), C |
| Mood or worry | A (calm version), B, C |
| Bones and strength | C, A, B |
| Weight | C, B, A (the plate habits framed as muscle and waist, never a weight-loss target) |

Strength and balance run at a low dose from week 1 in every order (2 short strength days), so C is never missing for 8 weeks.

## 4. The minimalist baseline, applied

- **Day 1: 3 rows at most:**
  - today's skill (the first chapter's practice);
  - a walk;
  - her goal's small thing (a bone food, or nothing).
  Strength joins on its 2 days as the 4th row at most. The day's lesson is the one Sakhi says card.
- **Her evening:** one check-in at her time (V39.27 rules: after her walk, never at its minute, 39.47). No morning ring.
  - The Rest part's sleep note is Version 39.49's "How did you sleep?" in the same check-in, about last night.
  - The goal's weekly 0 to 10 is one more question, once a week (as leaks after a birth).
  - No new ring, except Wind down's existing 30 minutes before bed when her goal is sleep (already the rule).
- **Ask less:** the two bones and heart questions sit in the plan's own questions, and only for moves. Her goal, stage, age,
  hormones, food and care come from joining. Nothing is asked twice.
- **One home for each fact:**
  - the weekly lesson is the one Sakhi says card, never also a row;
  - the midlife diary's Today row goes (the plan's check-in holds it);
  - the doctor cards come one at a time.
- **Explanation folds after week 1;** the parts, steps and settings stay open.
- **No new tours, tips or celebrations.** A lapse is never a broken streak; a bad week brings a lighter week.
- **The shared-phone check:** "Today's skill" and the lessons keep plain titles; the mood version's crisis line works in
  discreet mode.
- **Measure it:** taps for joining and the everyday jobs before and after, as each build does.

## 5. Safety first: what must exist before the plan

1. **Bleeding:**
   - Stopped: any bleeding after a year without periods → "see a doctor within 2 weeks". This is the reviewed
     `afterMenopause` line, today on the midlife page, reachable from the plan's check-in and Help.
   - Still bleeding: bleeding after sex, between periods, every 2 to 3 weeks, or longer than 8 days → "this week". The
     reviewed hub line, pinned for `mid`.
2. **Now, on every routine and lesson screen:**
   - chest pain or pressure spreading to the jaw or arm;
   - fainting;
   - a fall where she hit her head, can't stand or a bone looks wrong.
   The Call 112 card first (Help's lines, 39.27).
3. **This week:**
   - night sweats with fever, a cough over 2 weeks or weight loss (the free TB test);
   - a breast lump;
   - bloating, feeling full quickly or belly pain most days for 3 weeks (ovarian signs);
   - a racing heartbeat that doesn't settle;
   - hot, swollen joints.
4. **Mood:**
   - the calm version carries the crisis card (Tele-MANAS 14416 first, 112);
   - the weekly mood question waits for the psychologist (drafts only, as after a birth);
   - never a Qura call for mood.
5. **On hormone therapy:** one swollen calf, sudden breathlessness, or weakness on one side or trouble speaking → Now.
6. **Under 40:** no plan until her doctor's word (early menopause needs a doctor's plan first); the POI version later, with
   its own review.
7. **Moves:** bone-safe for every midlife woman (no forward bends, side bends or loaded flexion in any routine for this plan).
   Heel raises instead of impacts until a physiotherapist approves an impact-ready check.

## 6. What it reuses and what is new

- **Reuse:**
  - `meno.js`: the hub, the diary and its trend, the bones page, the hormone therapy page, intimate health, the surgical page,
    the timeline and the POI card;
  - Version 39.49's sleep question, "Hot flushes woke me", tonight's card and the doctor card;
  - the routines: `relief-hot` (its words already frame comfort and coping, not treatment), `relief-sleep`, `relief-calm`,
    and Wind down's yoga nidra, Bhramari and slow breaths;
  - Strength at home with the 3D figure (39.39); the food engine (`food.calcium`, My food);
  - the lesson engine (Getting ready's `ttc-lesson`), the weekly question card (after a birth), the 3-day Sakhi says rule;
  - the 9 midlife Learn articles.
- **New:**
  - the CBT course (4 chapters and 4 two-minute practices, in Dr. Megha's voice, English and Hindi, with her cloned voice);
  - the sleep rules' 4 lessons;
  - Strong and steady's 4 lessons and its routine: Strength at home with the bone-safe swaps, plus a steady minute.
    4 new 3D poses (one-leg stand at a wall, heel-to-toe walk, tall back against the wall, side leg lift at a chair), from
    the 3D session's pipeline;
  - 8 monthly lessons (months 4 to 12);
  - the weekly 0 to 10 question;
  - results;
  - the bones and heart questions;
  - the doctor cards.
  About 4,500 English words, mostly the CBT course.
- **Fix before linking:**
  - the diary's data-driven hormone pointer becomes the fixed week-4 card;
  - `plan_fb_hot` ("Cooling down and slow breathing can make hot flushes easier to get through") is reworded around the CBT
    course, with breathing as comfort only; `plan_fb_bones` stays close to its words but names muscle first;
  - Rest gets its own reason line, not `plan_fb_sleep`'s "your cycle".
- **Reviewers:**
  - an MBBS gynaecologist: every health line, the CBT flush wording against NICE 2024 and The Menopause Society 2023, the
    hormone therapy questions, the doctor cards, the red flags;
  - an RCI-registered clinical psychologist: the CBT and calm version, the crisis card;
  - a physiotherapist: every pose, bone-safe swaps, balance levels, no impacts;
  - Dr. Megha: food, voice and the recordings.

## 7. Decisions for Mohit (with recommendations)

1. **One plan for both midlife stages** (`meno` version 2; version 1 runs on with one offer to switch, as after a birth).
   *Recommend: yes.*
2. **The CBT course as the heart of the flush part** (NICE 2024 and The Menopause Society 2023 both recommend CBT; neither
   recommends breathing or yoga as a flush treatment). *Recommend: yes, 4 weekly chapters, reviewed by the gynaecologist and
   the psychologist before it ships.*
3. **Add "Aches and tiredness" as a goal** (in Indian studies backache and tiredness are often the most common midlife
   complaints). It starts with Strong and steady and a blood-tests card ("ask your doctor which tests: often Hb and thyroid;
   vitamin D if your doctor advises"). *Recommend: yes.*
4. **The sleep note in the evening check-in** (Version 39.49's question about last night), not a morning ring. *Recommend:
   the evening, so no new ring.*
5. **No impacts (stamping, marching) in version 1:** heel raises, balance and strength only, until a physiotherapist approves.
   *Recommend: yes.*
6. **The bones and heart questions inside the plan's own questions** (no new screen before her first step). *Recommend: yes.*
7. **Under 40 with periods stopped:** no plan until her doctor's word; a POI version later. *Recommend: yes.*
8. **A woman 40+ with PMOS** keeps the PMOS plan until she picks a midlife goal or stage (her tile decides). *Recommend: yes.*
9. **Hypnosis audio** (The Menopause Society recommends clinical hypnosis): not now; it needs a validated protocol and a
   trained Hindi voice. *Recommend: later, if at all.*
10. **4 new 3D poses** by the 3D session's pipeline (one-leg stand, heel-to-toe, tall back, side leg lift). *Recommend: yes, with
    the physiotherapist.*
11. **The weekly measure:** "This week: how much did flushes (or sleep, mood, aches) get in your way? 0 to 10" and "How well
    could you handle them?" *Recommend: the 0 to 10 with pictures, spoken in her voice; field-test it.*

## 8. Next step

Built on 30 Oct as Version 39.51 (Mohit: "proceed building with your recommendations"): MODULE_API section 94, review section
19.51, `node test/midlife.mjs`.

The mockup: claude.ai/artifact/4K1ocG3KAXiAtPHQn3rymd (10 screens, 30 Oct). As for the after-birth plan, it shows: Today on day 1, the evening check-in with the sleep question and the weekly
number, a CBT chapter, a Rest week, a Strong and steady day with the 3D figure, the bones and heart questions, My plan, the
safety cards, the periods-changing stage, and the 12-week results. Then "proceed building", after Version 39.49 is
committed, since both touch the midlife plan and the check-in.

## Sources (checked 30 Oct 2026)

- NICE NG23, updated November 2024: [news](https://www.nice.org.uk/news/articles/updated-guideline-recommends-more-treatment-choices-for-menopause-symptoms),
  [resource impact summary](https://www.nice.org.uk/guidance/ng23/resources/resource-impact-summary-report-13559541229)
  (menopause-specific CBT for flushes, alongside hormone therapy or when it isn't wanted or advised; also for low mood and
  sleep problems; the evidence is low quality but CBT is safe).
- The Menopause Society (NAMS) 2023 nonhormone therapy position statement, *Menopause* 2023;30(6):573-590:
  [release](https://menopause.org/wp-content/uploads/press-release/nonhormone-therapy-position-statement-release.pdf). CBT and
  clinical hypnosis are recommended (Level I). Paced breathing is not (Level I). Yoga, exercise, cooling, trigger avoidance,
  supplements and soy are not recommended as flush treatments. Weight loss is recommended at a lower level.
- Age at menopause in India: about 46 (NFHS-5 and LASI; 44 in Bihar to 47.6 in Kerala), pooled 46.6 across household surveys
  ([PubMed 33524647](https://www.pubmed.gov/33524647/)). Indian studies report flushes from about 24% to over 80%, with
  backache often the most common symptom ([Puducherry 2024](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11000683/)).
- The 24 Oct design's evidence on sleep (CBT-I over sleep tips), bone (LIFTMOR, Brooke-Wavell 2022), balance (Delbaere 2021)
  and POI (ESHRE/ASRM/IMS 2024) stands; see its section 5.
