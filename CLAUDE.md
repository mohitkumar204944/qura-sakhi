# Qura Sakhi

Free bilingual (English + Hindi) reproductive-health companion app for Indian women, made by Qura (Trinaya Wellness LLP).
This repo is Sakhi only. Qura's website and database live in `~/Desktop/qura_nutrition-version1` and are out of scope here:
don't read, search or change them from a Sakhi session. The one exception is the humanizer skill file named below. The single
planned link between the two products is the doctor-call hand-off in `server/SERVER_SPEC.md` section 10.1.

## Layout
- `web/`: the app (vanilla JS, no build step): `app.js` core, `mods/*.js` care areas, `progs/*.js` the plans as data
  (Version 39.4), `content.json` Learn library, `sounds/` Wind down's audio and the relief routines' voice (Version 39.21).
  Module contract and every version's rules: `web/MODULE_API.md`.
- `android/`: WebView wrapper. `build-apk.sh` builds `QuraSakhi-prototype.apk` from `web/`.
- `server/`: the accounts server, a Supabase Edge Function (`supabase/functions/sakhi-api`) with its migration and tests.
  - The spec is `server/SERVER_SPEC.md`; the deploy steps are `server/DEPLOY.md`.
  - It's live on Sakhi's own free Supabase project `qura-sakhi` (ref `jovplellzaxebcdekpax`). It sends real codes by
    WhatsApp and SMS through Qura's accounts; the keys are set with `server/scripts/set-qura-keys.sh`.
  - An APK built without `SAKHI_API` still runs the stand-in server, whose code is always 123456.
  - Version 30's opt-in "what helps" route (SERVER_SPEC 5.9) and Version 33's "Ask Qura to call me" hand-off (SERVER_SPEC
    10.1) are deployed with their migrations (23 Oct, Mohit ran them). The hand-off is ON: both `SAKHI_QURA_*` secrets are set
    and Qura's endpoint is live (`docs/qura-sakhi-integration-plan-2026-10-23.md`, section 0). Turning it off:
    `server/DEPLOY.md`, section 3.
  - The app's Terminal panel can't read Desktop folders, so Supabase commands that read files there fail ("operation not
    permitted"). Mohit runs them from a copy outside Desktop, or from the Mac's Terminal app. Production deploys from a Claude
    session are refused by the auto-mode safety check: hand Mohit the commands.
- `docs/history.md`: build log for 18–20 Oct 2026. It's long; read it only when the history matters.
- Outside the repo (business files, not in git): `../2 - Screenshots`, `../3 - Research and planning` (product vision,
  research, audits, internal-only Flo reference screenshots), `../4 - Learn library`, the .docx files, and the latest APK copy.

## Commands (run tests from `web/`)
- Tests:
  - `node test/signup.mjs`
  - `node test/tours.mjs`
  - `node test/me.mjs`
  - `node test/privacy.mjs` (help wording, lock, screen capture, shares, reminders, the APK's CSP)
  - `node test/companions.mjs` (iron tablets, check-ups due, My ASHA, Do it online)
  - `node test/plans.mjs` (pregnancy plan, scheme claims, the doctor report's language, big screen and PDF)
  - `node test/value.mjs` (Version 30: search, Explore's groups, Get care free, Today's rows, setup and visit cards, the slot,
    reminders, and the opt-in "what helps" counts)
  - `node test/insights.mjs` (Version 31: the countdown, today's chance, the calendar's estimates, Trends' verdict, My cycles,
    Days, and when fertile days stay hidden). The prediction maths is in `node test/maths.mjs`, sections 16 to 18.
  - `node test/fieldtest.mjs` (Version 32: the field-test audit's fixes, `docs/field-test-readiness-2026-10-23.md`)
  - `node test/handoff.mjs` (Version 33: "Ask Qura to call me", the doctor-call hand-off)
  - `node test/notify.mjs` (Version 34: phone notifications; the Android repeat maths: `npm run test:android`, needs Java 21)
  - `node test/pmosplan.mjs`:
    - Version 35, the 12-week PMOS plan: food by region, BMI, yoga and moves with moving drawings, progress. Approved by Mohit
      on 23 Oct, so `PLAN_RELEASE` in `web/app.js` is on; first shipped in `0.35-pilot`.
    - Version 36: the Plans tab (`plan`; the PMOS plan moved to `plan-pmos`), plans suggested from her diary, Care's one
      Govt. services row, and the joining question "What would you like help with?" (`docs/plans-audit-2026-10-23.md`). Its
      wording waits for doctor review (`docs/wording-review-v28.md`, section 13). Version 37 turned the Plans tab into My
      plan and that question into her goal.
  - `node test/companion.mjs` (Version 37, the companion core: joining by goal, the plan reveal, Today's steps and evening
    check-in, My plan, one "Sakhi says" slot, 4 tabs and the Help button, Explore's quick answers). Design:
    `docs/companion-journey-2026-10-23.md`; contract: `web/MODULE_API.md`, section 39. Its new wording waits for doctor
    review (`docs/wording-review-v28.md`, section 14).
  - `node test/firstday.mjs` (Version 37.1, her first day: the plan as cards that start only on "Start my plan", the
    answers summary, the Start screen, a protected first 3 days, "What's new"). Design: `docs/first-days-audit-2026-10-24.md`;
    contract: `web/MODULE_API.md`, section 40; wording: `docs/wording-review-v28.md`, section 15 (waits for doctor review).
  - `node test/notices.mjs` (Version 37.2, a companion that notices: the reminder opens the check-in, one count, her period
    noticed, the look-back on Today, the end of 12 weeks, honest results, discreet words). Design:
    `docs/ux-gaps-2026-10-24.md`; contract: `web/MODULE_API.md`, section 41; wording: section 15.4 of the review.
  - `node test/goals.mjs` (Version 38, a plan that fits every goal: one pregnancy plan, the after-birth check, a
    trying-for-a-baby plan, iron by diet, the midlife Today, the calm week, "This month", For you by goal). Contract:
    `web/MODULE_API.md`, section 42; wording: section 16 of the review (waits for doctor review).
  - `node test/protect.mjs` (Version 39.0, fix and protect: signals her records already hold, the stricter line in
    pregnancy and after a birth, discreet mode's urgent line, a loss pauses the plan, neutral reminder titles, the pill
    question at joining). Contract: `web/MODULE_API.md`, section 43; the gynaecologist's 3 confirmations:
    `docs/wording-review-v28.md`, section 18.0.
  - `node test/records.mjs` (Version 39.1, one home for what her records say: one engine for Trends' verdict and the
    cards, Diary's "What it shows", flow details on any bleeding day, Pattern check gone). Contract: MODULE_API section 44.
  - `node test/places.mjs` (Version 39.2, fewer places to look: topics by her stage, one Contents row, Me's one Reminders
    row, Back that leaves the app from Today). Contract: MODULE_API section 45.
  - `node test/food.mjs` (Version 39.3, food and search in her words: `mods/food.js`, My food, the plate by how she eats,
    joining asks only what the plan uses). Contract: MODULE_API section 46; wording: sections 17.1 and 19.3 of the review.
  - `node test/carryon.mjs` (Version 39.5, one plan page and plans that carry on: the hero and 4 tiles, rest days, welcome
    back, the hold rule, "Your plan has changed", her last plan, a fair new 12 weeks, pause, steps from their tools).
    Contract: MODULE_API section 48; wording: section 19.5 of the review.
  - `node test/results.mjs` (Version 39.6, results and the doctor loop: the end page, month summaries, Keep it light, a
    doctor path in every plan, "Yes, done" and what the doctor said, her Hb below her report's range). Contract:
    MODULE_API section 49; wording: section 18.2 of the review (waits for doctor review).
  - `node test/knowledge.mjs` (Version 39.7, knowledge that leads somewhere: each article's tool and guide, the book's ticks
    and Continue, dos and don'ts, quick answers in search, one danger list, Help's tabs, one myths deck, a weekly "Did you
    know?", "Why it helps", For my family, schemes checked at the official source). Contract: MODULE_API section 50; wording:
    sections 18.3 and 19.7 of the review (new lines wait for doctor review).
  - `node test/pictures.mjs` (Version 39.8, pictures first: food tiles and strips, Today's one-line cycle card, the plan
    screen with pictures, Help's danger-sign pictures, a speaker per card, Hindi type, the plate she can tap, the picture check
    for the field-test coordinator, the Android 10 floor and the APK size ceiling). Contract: MODULE_API section 51; wording:
    section 19.8 of the review.
  - `node test/foodsteps.mjs` (Version 39.9, food steps that change: the 7-day iron rotation by region and diet, an earlier
    habit back once a week, a calcium food for 40+ bones, pregnancy food by trimester, food while she breastfeeds, "Fasting
    today?" and the fasting step, fasting in pregnancy and while breastfeeding). Contract: MODULE_API section 52; wording:
    sections 17.4 and 19.9 of the review (new lines wait for doctor review).
  - `node test/joining.mjs` (Version 39.10, joining that personalises Sakhi: 7 stage tiles, up to 3 goals, a few details,
    "Your Sakhi" and the first-day tour, the first log in Diary, the plan offered on Today after it, other stages out of
    Explore and Learn, safety within 2 taps; every stage in English and Hindi at 360 px). `test/join.mjs` is the shared
    joining helper. Contract: MODULE_API section 53; wording: section 19.10 of the review (new lines wait for doctor review).
  - `node test/diary.mjs` (Version 39.11, the diary: the day's facts and a week strip on the day page, flow in one tap, a
    private sex log (the emergency pill line when she isn't trying, hearts only while trying, never on a shared phone or in
    the report), the Cycles tab with Edit dates, and when fertile days start). Contract: MODULE_API section 54; wording:
    section 19.11 of the review (new lines wait for doctor review).
  - `node test/follow.mjs` (Version 39.12, plan follow-through: Today names the day's yoga or strength with Start, strength
    days ahead, a food habit's meal, a check-in that shows what already counted and asks about last night's bedtime, her goal
    in the feedback, Plan your week, the nudge at her time to move (off by default), the 4-week check, and two quiet weeks).
    Version 39.13: the cycle plan's 4 steps (yoga and the walk apart), "One more", "All 4 done today", the evening check-in
    until every step is done. Contracts: MODULE_API sections 55 and 56; wording: sections 19.12 and 19.13 of the review (the
    goal lines wait for doctor review).
  - `node test/daily.mjs` (Versions 39.14 to 39.16, the daily job made clear (Mohit, 26 Oct; the Home, My plan and Diary audit):
    - Today as her checklist: a tick that stays and undoes, one pink button, "plan day", her week as dots, the look-back
      inside the card, "Why?" with how and her tool, and a full day that closes itself;
    - My plan explaining the plan: her goal, how it works, her steps with their reasons, this week as rings, what consistency
      brings, settings on their own page;
    - "How do you feel today?" on Home, the day sheet and the check-in, the notes meter, the calendar key in two lines;
    - My ASHA off Home, My plan and Diary.
    Contracts: MODULE_API sections 57 to 59; wording: sections 19.14 to 19.16 of the review.
  - `node test/daynote.mjs` (Versions 39.17 and 39.18, the Diary at its best (Mohit, 26 Oct; `docs/diary-audit-2026-10-26.md`):
    - the short day page with "More signs";
    - "Feeling okay" and one quick set everywhere (the + menu's one "How I feel");
    - today on the Diary's first screen, and a note that says what it counted towards;
    - Cycles in the order of her questions, with the report up; the monthly signs only where they fit;
    - Days grouped by period;
    - a pregnancy's week, and "Bleeding after the birth" opening the recovery check;
    - speakers on the day page.
    Contracts: MODULE_API sections 60 and 61; wording: sections 19.17 and 19.18 of the review ("Bleeding after the birth"
    waits for doctor review).
  - `node test/planfold.mjs` (Versions 39.19 and 39.20; Mohit, 26 Oct; `docs/myplan-and-sleep-advice-2026-10-26.md`):
    - My plan folded after her first week: how it works, the steps' reasons (behind "Why?"), what consistency brings, the weeks
      ahead and the care team;
    - the sleep routine's last step, "A mantra or prayer, if you like" (advice only, no recordings).
    Contracts: MODULE_API sections 62 and 63; wording: sections 19.19 and 19.20 of the review.
  - `node test/calm.mjs` (Version 39.21, Wind down; Mohit, 26 Oct: "build it into the app"):
    - slow breaths, Bhramari (Mohit's real hum recording) and yoga nidra in Dr. Megha's cloned voice, in English and Hindi;
    - 3 CC0 Freesound sounds for sleep with a 15, 30 or 45 minute timer that fades out;
    - pictures that move with her voice;
    - the relief routines' steps in her voice;
    - on the phone, `SoundService` plays on with the screen off.
    Files: `web/sounds/` (credits in `web/sounds/CREDITS.md`); scripts and tools: `web/tools/voice/` (the Replicate key and
    voice IDs stay in `~/Desktop/megha-voice`, never in the repo). A changed relief step needs a new clip: the test checks the
    words match. Contract: MODULE_API section 64; wording: section 19.21 of the review (waits for doctor review).
  - `node test/winddown.mjs` (Version 39.22; Mohit, 27 Oct; mockup claude.ai/artifact/PZZQiSgZdz8KGMR1UfKwgG):
    - meditation in the plan: the bedtime step winds down first, tonight's session from her day;
    - "How did you sleep?" in the check-in, with a sound after a hard night;
    - Moves and calm, with a Calm tab;
    - reminders by the timing research: the move nudge on by default, the wind-down 30 minutes before bed;
    - a calmer My plan after week 1.
    Research: `docs/myplan-and-sleep-advice-2026-10-26.md`, section 3. Contract: MODULE_API section 65; wording: section 19.22.
  - `node test/cyclefirst.mjs` (Version 39.23; Mohit, 27 Oct; mockup claude.ai/artifact/RTA92ajojk5uXeLtgVC5jm):
    - her cycle as Today's headline while her plan runs, her logs in the same card, "Period late?" when it is late;
    - the plan day ends at 4 am, so a check-in after midnight counts for the evening before;
    - "Edit period dates" under the calendar, and "Add a past period" on Cycles.
    Contract: MODULE_API section 66; wording: section 19.23 of the review.
  - `node test/sleepwell.mjs` (Version 39.24, Wind down that comes up properly; Mohit, 27 Oct; mockup
    claude.ai/artifact/EofEApr38Rojv8656FPSHt):
    - the opening seconds, and Dr. Megha's words as captions (`sounds/captions.js`, remade with
      `node tools/voice/captions.mjs` whenever a script changes);
    - her voice switch on the session screen;
    - Back keeps it playing, with a bar above the tabs;
    - "Sleep well" at the end;
    - one Wind down page (also My plan's Calm tab), and Wind down near the top of Explore's For you;
    - a softer yoga nidra.
    Contract: MODULE_API section 67; wording: section 19.24 of the review.
  - `node test/whynot.mjs` (Version 39.25, insights she can find; Mohit, 27 Oct; audit `docs/insights-audit-2026-10-27.md`;
    mockup claude.ai/artifact/GkhV6csPv6vqrrQMt34sbw):
    - one line on Today and the Calendar saying why no date shows, with its fix (hormones, a guessed start, too few gaps,
      gaps too far apart);
    - "What Sakhi can tell you" on Cycles, or the pill card on hormones;
    - "Is 1 Oct your real start?" for a guessed start;
    - "Period late?" with or without a plan;
    - on What your diary shows, "Ask a Qura doctor" first, no "Free government doctor" (it stays in Explore), and the free
      12-week plan beside the doctor step while no plan runs.
    Contract: MODULE_API section 68; wording: section 19.25 of the review (waits for doctor review).
  - `node test/joindates.mjs` (Version 39.26, her last periods at joining; Mohit, 27 Oct; mockup
    claude.ai/artifact/MfYod5pV8wKtuDERCBjbWB):
    - the Details step: the pill question first, a calendar where she taps each period's start, how long, two ticks (heavy,
      pain that stops her day), and "I don't remember the dates" for the old quick choices;
    - "Your Sakhi" opens with "What your dates show": her next period, her signs with a Qura doctor and a free plan, "an
      early read, not a diagnosis";
    - on the pill, "Since when?"; in Me, switching hormones off asks "When did you stop?" (today, earlier, never).
    `test/join.mjs` takes `dates`; without them it opens "I don't remember the dates" first. Contract: MODULE_API section 69;
    wording: section 19.26 of the review (waits for doctor review).
  - `node test/minimal.mjs` (Version 39.27, fix the loop and the truth; Mohit, 28 Oct: "make reminders by default on no need
    to ask user and no need for 90 minute gap"; audit `docs/minimalism-audit-2026-10-27.md`, R01 to R07; mockup
    claude.ai/artifact/2a1AsJqHy4x9RyqR61GFQ8):
    - reminders on by default with no question in Sakhi's words (Android 13's own "Allow" once), and off in Me stays off;
    - the Start card names what will ring;
    - the check-in after her walk (10 pm after a 9:15 pm walk), with no spacing rule;
    - day 85: her steps carry on, with her results (`plan-end`) and Stop on Today;
    - true lines ("2 of your last 2 gaps", no fertile-days promise for long gaps, "Sach ya Myth?");
    - "Pain today?" for the pain plan, and the hot-flush chip and its days;
    - a doctor finding and her plan's offer in one card;
    - Call buttons on the after-birth danger cards, "Call 112 now" first in Help, and Help while she joins.
    Contract: MODULE_API section 70; wording: section 19.27 of the review (new lines wait for doctor review).
  - `node test/care.mjs` (Version 39.28, your doctor first; Mohit, 28 Oct: "not always keep pushing for Asha/ANM"; mockup
    claude.ai/artifact/TyUgHfhf9GNmpkEsMkMnsu):
    - "Where do you usually go for women's health?" while she joins (`situation.care`), and "Where I get care" in Me;
    - the government and ASHA words only for a woman who picks them; otherwise "your doctor" and one quiet line for the free
      government option (iron tablets, pregnancy check-ups, after the birth, Help, the doctor screen, My plan's doctors, the
      findings);
    - iron as her doctor prescribed: every day, every other day or once a week;
    - Version 39.29, the same rule in the Learn library and every module: `<key>_doc` strings, `doc` lines and article `doc`
      paragraphs, read by core's `t`, `tx` and `L` (the full list for the doctor: `docs/doctor-route-review-2026-10-28.md`).
    Suites that check the government route seed `care: 'govt'`. Contract: MODULE_API sections 71 and 72; wording: sections 19.28
    and 19.29 of the review (waits for doctor review).
  - `node test/urgent.mjs` (Version 39.30, a danger sign typed in search, for every woman; Mohit, 28 Oct, after the Cykel walk;
    mockup claude.ai/artifact/Y4Kom9DHfyiw4buDUQRi8B): Help's "Call 112 now" signs in her words (bleeding with dizziness or
    fainting, a late period or positive test with one-sided pain, thoughts of harm) put one card above Explore's and Learn's
    results, at every stage, with Call 112 now (Tele-MANAS 14416 first for harm) and Help and safety. Help's own lines, no new
    wording. Contract: MODULE_API section 73; review section 19.30.
  - `node test/traps.mjs` (Version 39.31, the Cykel traps; Mohit, 28 Oct): a competitor's failures replayed on Sakhi across
    Today, the Calendar, Days, Cycles, the fertile-days page and the booked reminders. It checks late by 3, 16 and 60 days, a
    positive strip on period day 1, hormones, pregnancy, after the birth, midlife, discreet mode, irregular and few gaps,
    "regular" beside "vary", "Low chance", "safe" days, and stale period reminders, in English and in Hindi at 360 px. Run it
    after any change to predictions, the calendar or reminders. Contract: MODULE_API section 74.
  - `node test/baby.mjs` (Version 39.32, Getting ready for a baby, the full plan; Mohit, 28 Oct: "Build this plan personalised
    to users who are planning for a baby"; mockup claude.ai/artifact/LYTf9jYeCMPfWw5ZYjMY4r):
    - every trying-stage goal opens `ttc` version 2 (`web/progs/v1.js`; version 1 runs on for the women on it);
    - "A few things first" chooses her version: medicines first, see a gynaecologist first, both or standard, and her food and
      moves (PMOS or a healthier weight mixed; a BMI under 18.5 eats more);
    - every day her folic acid tablet (`ttc-folic`, a 9 pm reminder), her move and one food habit, and a 4th step when one is
      due (the ready check, strength from week 7, the calm few minutes, her Hb test, the checklist, his part);
    - a lesson a week (`ttc-lesson`), the 1-minute ready check (`ttc-ready`), gentler yoga in the 2 weeks before her period,
      her version's doctor card, a fresh start, a positive test ("Yes, move me on");
    - every line for the doctor: `docs/baby-plan-review-packet-2026-10-28.md` (page claude.ai/artifact/XXz1VPJicgVJMAY6v3rrUt;
      the new lines wait for doctor review). Contract: MODULE_API section 75; wording: section 19.32 of the review.
  - `node test/walkfix.mjs` (Version 39.33, the walkthrough's fixes; Mohit, 28 Oct: "Proceed fixing all"): on a diary like
    Mohit's, Edit period dates (no + over Save, Sakhi's guessed days lighter), the calendar's key (start, bleeding,
    predicted), Today ("Partly done", no "Next" after the check-in, the cycle left out of her gaps), Cycles ("last {n}",
    "3-day period", no end day), "Feeling okay" never with a sign that says otherwise (a danger sign stays), My progress, the
    flow choices one to a row, and Hindi at 360 px. Contract: MODULE_API section 76; wording: section 19.33 (UI words only).
  - `node test/pregplan.mjs` (Version 39.34, My pregnancy safety first; Mohit, 29 Oct: "Proceed building with minimalist
    approach"; advice `docs/pregnancy-plan-advice-2026-10-29.md`; mockup claude.ai/artifact/U54RRpvvHBVpAhBvPTcEgT):
    - the pregnancy stage opens `preg` version 2 (`web/progs/v1.js`; version 1 runs on for the women on it);
    - "Before you start", the one screen before her first step:
      - right now: Help's danger line; a yes shows Help's "Call 112 now" card and holds her walk until she checks again;
      - told by her doctor: her MCP card's marks, saved back to the card;
    - her tier: green (the light walk), amber (an easy 10 minutes), red (no walking target); the pelvic floor from week 13;
    - "A quick check" at 14 and 28 weeks, and the day after a sign that doesn't wait;
    - the check-in from 28 weeks: her baby's movements (the kick page's own lines and Call buttons), sleeping on her side;
    - "Baby moving less? Get help" on Home's pregnancy card from 24 weeks, for every pregnant woman.
    Contract: MODULE_API section 77; wording: section 19.34 of the review (new lines wait for doctor review).
  - `node test/pregwalk.mjs` (Version 39.35, the pregnancy walkthrough's fixes; Mohit, 29 Oct, on his Flip5):
    - Call buttons on the kick page;
    - bleeding in a pregnancy without guessed days, and the reviewed line on Today;
    - reminders that reach the phone;
    - no "done" ticks for the past parts of her pregnancy;
    - the stage sheet's last period first, from her diary, with her week and due date;
    - one ask after a stage change, and her goal asked;
    - "marked by mistake" bringing back her plan.
    Version 39.36 ("fix gaps 8 to 15 too"), checks g8 to g15:
      - the moves line only on version 1;
      - the reveal's later rows;
      - "My safety answers" by name;
      - the foot line's iron tablets only for the iron goal;
      - tile labels that hyphenate;
      - a toast clear of a tour card;
      - urgent cards in ink;
      - no "Your day" when My food holds it.
    Contracts: MODULE_API sections 78 and 79; wording: sections 19.35 and 19.36 of the review.
  - `node test/threefix.mjs` (Version 39.37, the three-plan walkthrough's fixes; Mohit, 29 Oct: "fix all 8"):
    - Cycles' next period date when she is late;
    - "Due now" not holding her pregnancy day;
    - one "Tomorrow" line;
    - the home test first for a late period while trying;
    - no example cycle numbers in a pregnancy;
    - one home for what her records say;
    - the end card alone on day 85;
    - one celebration at a time.
    Contract: MODULE_API section 80; wording: section 19.37 of the review.
  - `node test/latepreg.mjs` (Version 39.38, the 38-week walk's fixes; Mohit, 29 Oct: "fix all 8"):
    - Day complete and My plan counting her daily steps, not a "Due now" that waits;
    - her tablets started, not "due", once she takes them in Sakhi;
    - "My baby is born" on today's date, with breastfeeding ticked;
    - bleeding in a pregnancy as "Bleeding" in the Diary, with no "Add a past period";
    - from 34 weeks the hospital bag, birth plan and contraction timer in For you;
    - Call 112 on the week page;
    - her gynaecologist for the pregnancy in Help's "See a doctor".
    Contract: MODULE_API section 81; wording: section 19.38 of the review (Help's new line waits for doctor review).
  - `node test/moves3d.mjs` (Version 39.39, the 3D figure in the player and a rest between moves; Mohit, 29 Oct: "build it
    into the player with the rest screen"; canvas claude.ai/artifact/4mTtM4VPZWwrHs5bb1r2Ka):
    - each move's 3D loop, with its still for "reduce motion", the routine's list and the rest's Next;
    - the sun salutation's flows, the left side mirrored, and the drawings when there's no `web/fig`;
    - a rest of 15 seconds in strength and 10 in yoga, none between sides, before Shavasana or in the sun salutation, with
      +20s, Skip rest and Previous;
    - on the Flip5's 360 × 800 (and a small phone), Previous, Pause and Next above the tab bar, tappable, with the timer in
      view (30 Oct, "fix the buttons"). Its taps use `el.click()`, so it asks the page what a tap at each button would hit.
    `web/fig` is made by `web/tools/fig3d` (README.md there; Blender and MakeHuman's CC0 packs, outside the repo). After a
    re-render, run `python3 web/tools/fig3d/install.py <work>/final web <work>/preg/final-b0: <work>/preg/final-b2:b2-
    <work>/preg/final-b3:b3-` (the last three are pregnancy yoga's bodies, from `render-preg.sh`). Contract: MODULE_API section 82;
    wording: section 19.39 (UI words only).
    Version 39.67 (the 3D moves audit, `docs/3d-moves-audit-2026-11-04.md`; Mohit, 4 Nov: "Yes, fix both"), the test's section 8:
    the cramps routine's child's pose and knees to chest in 3D, with Pause and Next above the tab bar, and the 21 small steps'
    squats day opening Strength at home. `node test/fig-coverage.mjs` lists each routine step's 3D still and loop, and fails on a
    step with none, or (Version 39.69) one that holds still: run it after a re-render. Contract: MODULE_API section 110.
  - `node test/showmove.mjs` (Version 39.69, every exercise moving, never a still; Mohit, 5 Nov: "i dont want any still picture all
    exercises model should be doing right moves", and no see-through model; the audit's section 6):
    - a held pose comes into the pose once (`<pose>-in`), then holds, breathing: tree, tree at a wall, child pose (the cramps
      routine's too), Steady's one-leg stand;
    - the breathing steps breathe; Anulom vilom close up, her hand changing sides; the sun salutation's first position (`sun-00`);
    - Steady's two balance moves at the wall, and the belly gap check after a birth;
    - the pelvic floor trainer shows her level's position moving, breathing (a squeeze can't be seen from outside), pausing with
      her set;
    - stills only for "reduce motion", a clip that can't play and the lists.
    After a re-render, `render-all.sh` and `moves.PREG` render the new loops (`moves.NEW_LOOPS`), then
    `FIG_SUN_ONLY0=1 ... render.py -- sun` for `sun-00` alone. Contract: MODULE_API section 112 (no new wording; Steady's moves still
    go to the physiotherapist).
    Version 39.69.1 (the phone walkthrough, 6 Nov), the test's section 4: a move's breathing circle, or its timer, stays above Previous,
    Pause and Next on the Flip5, with the picture smaller for long words (Anulom vilom), never below 120 px. MODULE_API section 112.1.
    Version 39.69.2 (6 Nov, "Yes, all of them", after "are there anymore still pictures"), sections 5 and 6:
    - the sun salutation breathes in each position after its flow (`sunh-<pose>`, made with `FIG_SUN_HOLDS=1` in render.py);
    - the small pictures move: the lists, Moves and calm, Up next and My PMOS plan's page. They live in `fig/t`, made by
      `web/tools/fig3d/thumbs.py`, which install.py runs.
    MODULE_API section 112.2.
  - `node test/termwalk.mjs` (Version 39.40, the 39-week walk's gaps; Mohit, 30 Oct: "fix all 8"):
    - Call buttons on the labour timer;
    - one pregnancy start (the scan's), so every start inside it is "Bleeding", and her two dates far apart said;
    - her own doctor's number on the phone, with Call in My plan, the doctor screen, the kick page and the labour timer;
    - the labour timer on Today from 37 weeks;
    - the week page's scan line;
    - "Call 112 now if" in one card;
    - Your numbers' spread;
    - "ask your doctor" on the labour timer.
    Contract: MODULE_API section 83; wording: section 19.40 of the review (the dates line waits for doctor review).
  - `node test/planwalk.mjs` (Version 39.41, the three-plan walk's gaps; Mohit, 30 Oct: "fix all 10"):
    - no tick on Getting ready's passed parts;
    - a routine's minutes from her Done, once;
    - no "Do it now" for "Due now" in the check-in;
    - "Plan week {n} is done" in a pregnancy;
    - "Why these {n} steps?" by her daily steps;
    - the calm card's line;
    - "Period late?" on My plan while getting ready;
    - "My doctor" in every plan;
    - one "In your pregnancy" group in Days;
    - a routine's minutes on its Start, and the pregnancy card's buttons two to a row.
    Contract: MODULE_API section 84; wording: section 19.41 of the review (UI words only).
  - `node test/stagewalk.mjs` (Version 39.42, the tracking-stage walk's gaps; Mohit, 30 Oct: "fix all 3"):
    - one ask on Today just after a stage change, while a plan is offered;
    - the same PMOS plan on Cycles as on Today;
    - the PMOS plan once on My plan's picker page.
    Contract: MODULE_API section 85; review section 19.42 (no new wording).
  - `node test/phonefit.mjs` (Version 39.43, the PMOS day-1 walk's gaps; Mohit, 30 Oct: "fix all 4"; his Flip5 is 360 dp wide):
    - a step's line that doesn't fit wraps (Version 39.44: in CSS, whenever the font lands);
    - the PMOS plan's 3 steps on day 1 (her bedtime from day 4);
    - Sakhi upright (portrait);
    - My plan's routine minutes on its play button, as Today's.
    Contract: MODULE_API section 86; review section 19.43 (no new wording).
  - `node test/myplanwalk.mjs` (Version 39.45, the PMOS walk's gaps; Mohit, 30 Oct: "fix all 4"):
    - My plan's play button on one line;
    - a bedtime that joins on day 4, named before it comes (the reveal, the Start card, My plan);
    - "Your last plan" never a pregnancy marked by mistake, nor a copy of the plan she runs;
    - the 3D figure on Moves and calm.
    Contract: MODULE_API section 88; review section 19.45 (UI words only).
  - `node test/afterbirth.mjs` (Version 39.46, I had a baby, the full plan; Mohit, 30 Oct: "proceed building"; advice
    `docs/after-birth-plan-advice-2026-10-30.md`; mockup claude.ai/artifact/RLz4dU7pQ5A5iVTFCcnqPa):
    - the stage's plan opens `post` version 2, to the first birthday (version 1 runs on, with one offer);
    - to day 41 the recovery check is her evening form; the squeezes by her days; a walk from day 14;
    - one card at a time: her baby's signs in week 1, her own 6-week check, back to strong from day 42, "Is my body ready?"
      from week 12, her method before sex starts again;
    - leaks, her main measure; the weekly mood question waits for the psychologist (drafts only);
    - "My baby has died".
    The bug hunt before the commit: section 15 (MODULE_API 89.9).
    Contract: MODULE_API section 89; wording: section 19.46 of the review (new lines wait for doctor review).
  - `node test/fourwalk.mjs` (Version 39.47, the four-plan walk's gaps; Mohit, 30 Oct: "fix all 16"; the walk is
    `node test/fourplans-walk.mjs`, screens and each woman's words to `test/shots/fourplans-walk/`):
    - her folic acid carries on into My pregnancy, to 12 weeks;
    - a card leads Sakhi says on 3 days at most, then waits 7 days under "More from Sakhi" (a card that keeps her safe always
      leads), and her plan's next card leads;
    - "Your recovery check" as the reminder to day 41 after a birth;
    - one count for a late period; "Plan week {n}" after a birth; the reveal's check-in time; the check-in after her walk,
      never at its minute;
    - her Hb test waits for her visit; "Next week" never repeats; 1 minute for the recovery check; no page for the first
      weeks' walk; "born today"; "Your step {n}" on a shared phone; "Your Sakhi" says where her plan starts;
    - free check-ups and Today's after-birth line wait for the first 6 weeks.
    Contract: MODULE_API section 90; wording: section 19.47 of the review (UI words; two timings for the doctor).
  - `node test/stagesync.mjs` (Version 39.48, the switch walk's gaps; Mohit, 30 Oct: "fix all 5"; the walk is
    `node test/switch-walk.mjs [priya|neha|riya|meera|asha]`, screens and each checkpoint's words to `test/shots/switch-walk/`):
    - the plan for now when her stage moves between tracking and trying ("Not trying for a baby now?", "Trying for a baby now?",
      Keep), and a pregnancy still asks;
    - after a loss, the goals ask and free check-ups wait 6 weeks;
    - "Log the day your periods came back", never "Updated" first;
    - her 6-week check reminder ends;
    - the plan she starts leads her goals.
    Contract: MODULE_API section 91; wording: section 19.48 of the review (UI words; one timing for the doctor).
  - `node test/nightsweats.mjs` (Version 39.49, night sweats and sleep; Mohit, 30 Oct: "build the night sweats and sleep link",
    after the walk through a menopause app):
    - the midlife plan's hot-flush and sleep goals ask "How did you sleep?" in the evening check-in, on a card of its own;
    - "Hot flushes woke me", for her hot-flush goal or a midlife woman with hot flushes in her diary (never in discreet mode or
      on a shared phone), notes Hot flushes and Poor sleep, with tonight's card (a cool room, the hot-flush routine, yoga
      nidra);
    - the night-sweats doctor card from her diary (both on 3 of the last 14 days, with the count), and the days in her last 28
      in the report for her doctor.
    Contract: MODULE_API section 92; wording: section 19.49 of the review (new lines wait for doctor review).
  - `node test/glass.mjs` (Version 39.50, the glass look; Mohit, 30 Oct: "proceed doing glass UI for all screens" and "Colour
    scheme should not be changed"; mockup claude.ai/artifact/UGJkPGEeHJLc2q9fVAVaVY):
    - Sakhi's own colours, frosted: her wash stays still behind every screen with soft glows in her pink, lavender and peach;
    - cards, rows and tiles see-through in her card colours, with the edge drawn inside (nothing moves);
    - the top bar, the tab bar and sheets frosted, the bars 80 to 90% solid so their labels read over a dark card;
    - urgent cards, coloured tiles, buttons and inputs solid; print white; light and dark.
    One block at the end of `web/app.css` (the first-paint guard in `index.html` sits on the page, not the body). Muted text on
    the page keeps 4.5 over every point of the scene (checked from a picture of it).
    - `node test/glass-contrast.mjs . <last commit's web>` measures every line of text against what is behind it, on all routes,
      light and dark, and fails on anything the glass made worse. Run it after any change to the glass or the palette.
    - `node test/glass-survey.mjs` lists anything still solid across all routes (`test/shots/glass-survey.txt`).
    - The walk `node test/glass-walk.mjs [dir] [name]` photographs the screens to `test/shots/glass-walk/<name>/`.
    Contract: MODULE_API section 93 (no new wording).
  - `node test/midlife.mjs` (Version 39.51, My midlife plan, version 2, "Cool, calm and strong"; Mohit, 30 Oct: "start with the
    midlife plan", then "proceed building with your recommendations"; advice `docs/midlife-plan-advice-2026-10-30.md`; mockup
    claude.ai/artifact/4K1ocG3KAXiAtPHQn3rymd):
    - `meno` version 2 for both midlife stages: three 4-week parts in the order her goal needs (Cool and calm, a short CBT course
      for hot flushes, or its calm version for worry; Rest, one sleep rule a week; Strong and steady, strength and balance), then a
      Learn article a month to month 12; version 1 runs on, offered version 2 once;
    - day 1: Today's skill, her walk and a calcium food, and the week's chapter as one row (`mods/midlife.js`: 16 chapters, route
      `mid-lesson`);
    - "Your day" asks about weak bones and chest pain when she walks; her weekly 0 to 10 in the check-in from day 7;
    - one card at a time: before 45, weeks 4 to 7 (hormone therapy), weeks 12 to 16 (checks after 40); before 40, no plan until
      her doctor has seen her;
    - her results in her own numbers; Steady on your feet on Moves and calm, for midlife only.
    The walk is `node test/midlife-walk.mjs [kavita|sunita|asha|meera|vera]` (screens and words to `test/shots/midlife-walk/`); its
    12 fixes are the test's section 11; the phone test's 6 fixes (31 Oct, on Mohit's Flip5) are section 12, the second phone test's 3 are section 13, the third's 2 section 14, the fourth's 1 section 15, the exploratory one's 4 section 16, the second exploratory one's 3 section 17, the bone-safe stop-gap section 18, the discreet path cards section 19, her parts on the weeks card section 20, the POI hold section 21, and the hold's phone test section 22. It builds on Version 39.49. Contract: MODULE_API section 94; wording: section 19.51 of the
    review (new lines wait for doctor review, the calm chapters for a psychologist too, the moves for a physiotherapist).
  - `node test/pregyoga.mjs` (Version 39.52, pregnancy yoga by trimester; Mohit, 1 Nov: "build the pregnancy yoga by trimester"):
    - three routines by her week (`preg1` to 13 weeks, `preg2` 14 to 27, `preg3` from 28), about 10 minutes each: nothing on the
      back after 13 weeks, nothing on the tummy, no twist, no rising on the toes, no breath held, balance at a wall;
    - the 3D figure (Version 39.54; Mohit, 2 Nov: "pregnancy yoga doesnt have 3d model"): her usual figure to 13 weeks, then her
      with a middle and a full bump (`web/tools/fig3d/render-preg.sh`, `fig/v/b2-*`, `b3-*`); the drawings, with her bump,
      without them;
    - on Today on days 2 and 5 of her plan week, in the walk's place, on My pregnancy's green tier only;
    - the stop card above Start, "Feeling unwell?" on every move ("Stop for today" holds her walk and yoga until she checks her
      answers again);
    - Moves and calm in a pregnancy: only her three months' yoga and Calm breath, the other routines' pages refuse;
    - "Yoga" on a shared phone, and Hindi at 360 px.
    Contract: MODULE_API sections 95 and 97; wording: sections 19.52 and 19.54 of the review (new lines wait for the doctor and a
    physiotherapist, and the 3D pictures for the physiotherapist).
  - `node test/planfor.mjs` (Version 39.53, every guide leads to her plan; Mohit, 1 Nov: "everything should leave to plan and for
    extended medical help qura doctor should be advised", then "build it"):
    - one "Your plan for this" row on the guides, routines and topic pages a plan covers: her running plan (My midlife plan's part
      for the subject), or the plan that fits her stage, offered; her plan first, then the tools, then a Qura doctor;
    - nothing while another plan runs, in a pregnancy, after a loss, on a shared phone or before 40 with periods stopped;
    - "Who treats what" leads with "Ask a Qura doctor"; the iron tablets page asks a Qura doctor too.
    Contract: MODULE_API section 96; wording: section 19.53 of the review (UI words only).
  - `node test/periodplan.mjs` (Version 39.55, My period plan; Mohit, 2 Nov: "proceed building with your recommendations"; advice
    `docs/period-plan-advice-2026-11-02.md`; canvas claude.ai/artifact/9YbP1fyNWG8gN5gF41c7vS):
    - pain, heavy and pms version 2, all "My period plan": her first period goal leads, the others join where they matter
      (version 1 runs on, offered version 2 once);
    - her cycle sets the steps: her kit and "Pain today?" on period days, "Your period today" (3 taps) in the check-in when heavy
      periods are hers, her kit ready and Cycle care yoga before her period, her calm-week plan; Relax, moving on 3 days, strength,
      an iron or calcium food between;
    - day 1 at 3 steps, never more than 4; a chapter a week (`mods/perplan.js`, 36 chapters, route `per-lesson`);
    - one card at a time (week 4's "When to see a doctor", the second period's card for the days before), a Qura doctor first;
      the fixed Hb line beside her Hb results; her results by period, a goal that joins too.
    The walk is `node test/periodplan-walk.mjs [priya|anjali|rekha|sana|meena|vera]` (screens and words to
    `test/shots/periodplan-walk/`); its test pass's fixes (2 Nov) are section 7 of the test, the phone test's 6 (Mohit's Flip5,
    "fix all 6") section 8.
    Contract: MODULE_API section 98; wording: section 19.55 of the review (new lines wait for doctor review, the days-before
    chapters for a psychologist too).
  - `node test/pfplan.mjs` (Version 39.56, My pelvic floor plan; Mohit, 2 Nov: "design the pelvic floor plan", then "proceed
    building"; advice `docs/pelvic-floor-plan-advice-2026-11-02.md`):
    - `pelvic` version 1 for "Leaking urine or heaviness" at the tracking and midlife stages: "When do you leak?" (stress, urge, both,
      heaviness), "Before you start" (the signs that need a doctor first), then her squeeze sets in 8 levels that unlock from her
      sets in the trainer (`post-pelvic`, tones and big numbers), Find the right muscles, a habit a fortnight, When the urge comes,
      and on the heaviness track Get checked once (lying sets until a doctor has seen her; 16 weeks after a prolapse);
    - the weekly leaks question, "sure" and "gets in the way" in the check-in, one card at a time with a Qura doctor first, 16
      chapters (`mods/pfplan.js`, route `pf-lesson`), one new ring (her morning set), and the 112 line for a sudden loss of control;
    - her sets join My period plan, My midlife plan and Getting ready as one step (`pfgoal`).
    The walk is `node test/pfplan-walk.mjs [asha|kamla|sunita|rani|priya]` (screens and words to `test/shots/pfplan-walk/`); the
    test pass's fixes (3 Nov) are section 17 of the test, the phone test's 6 (Mohit's Flip5, "fix all 6") section 18.
    Contract: MODULE_API section 99; wording: section 19.56 of the review (new lines wait for the doctor and a women's health
    physiotherapist).
  - `node test/allwalk.mjs` (Version 39.57, the all-plans walk's gaps; Mohit, 3 Nov: "fix all 11"; the walk and its findings:
    `docs/plans-walkthrough-2026-11-03.md`):
    - My pregnancy's pelvic floor set and Getting ready's folic acid answered in the check-in (Done there means she has her tablets);
    - "I've seen a doctor" on Today's doctor finding, "Still to see a doctor?" after 4 weeks, and her plan's own doctor check leading;
    - the missed-period pages: her own doctor's route, and while she tries, the test first with her choices one quiet row; no
      "Period late?" on Today after a positive test;
    - the period card's first question first; day 42 after a birth; My plan after a plan change; the midlife skill's name; "both 42
      days"; the anaemia page's 112 line once.
    Contract: MODULE_API section 100; wording: section 19.57 of the review (the test pages' new lines wait for doctor review).
  - `node test/lifefit.mjs` (Version 39.58, the lives audit's quick fixes; Mohit, 3 Nov: "proceed with the quick fixes first"; the audit:
    `docs/lives-audit-2026-11-03.md`, after `docs/personal-companion-advice-2026-11-03.md`):
    - "Ask a Qura doctor" on every plan's doctor check, and the free government doctor only on the government route;
    - "Bleeding", never "Period started", once her periods have stopped, and saving it says it needs a check;
    - a negative test on Today's "Period late?", with when to test again (two negatives: the reviewed two-negatives line);
    - her plan offered on a shared phone in plain words, its questions behind her PIN;
    - Version 39.58.1: the setup card's ASHA number only on the government route, and free care near her on it and for "Nowhere yet".
    The walks behind it (not pass/fail): `node test/lives-walk.mjs` (one woman per stage over months, plus 14 edge ages; ~20 minutes;
    `WHO=`, `EDGES=0`), `node test/census-walk.mjs` (what each tab shows each woman) and `node test/stagejump-walk.mjs` (stage changes).
    Contract: MODULE_API section 101; wording: section 19.58 of the review (no new health lines).
  - `node test/calmtoday.mjs` (Version 39.59, phase B, a calmer Today; Mohit, 3 Nov: "proceed with phase B"; the lives audit's R3, R4
    and C3, and the advice's 4.3):
    - tips one a day, only in her first week or the week after her stage changes, and one she puts off doesn't come back;
    - a first-days read on 3 days at most, and a card that keeps coming back waits 30 days after its second turn;
    - with no plan on Today, her log buttons and her feelings' chips in the card with her body today (no feelings card, no second
      "How I feel"); on a plan, Today as Version 39.23 made it, her steps on the first screen;
    - Explore's For you without the pages her plan's tiles open.
    The age bands (the audit's R1) wait for the doctor. Contract: MODULE_API section 102; wording: section 19.59 (no new words).
  - `node test/planfirst.mjs` (Version 39.61, phase C, joining that ends with her plan running; Mohit, 3 Nov: "proceed with phase C";
    the advice's 4.2 and D1):
    - "Your Sakhi" leads with "Make my plan", then her plan's questions without her goal again or a summary, Back to Your Sakhi;
    - one page for her plan from joining (her steps and Start), and her plan offered on Today from the start ("Just my diary for now").
    `web/test/taps/join-run.mjs` takes the path `plan`. Contract: MODULE_API section 104; wording: section 19.61 (UI words only).
  - `node test/library.mjs` (Version 39.62, phase D, Explore and Learn by her day; Mohit, 3 Nov: "proceed with phase D"; the advice's 4.6):
    - Explore's first screen: search, For you (her first 3 tools and her first 3 questions, by her day), her topic, and "All topics
      and guides" (route `library`: dos and don'ts and her other questions, her topics, Govt. services off the government route, Contents);
    - the violence, abortion and STI pages in Help's "Private help", 2 taps from every screen at every stage (PLACES-05);
    - Learn's Start here and Today's first-days read by her week, her days after a birth, her goal and a late period (F4).
    Contract: MODULE_API section 105; wording: section 19.62 (UI words only; the reading order for the doctor to glance).
  - `node test/ladder.mjs` (Version 39.63, phase E, the doctor ladder's first part; Mohit, 3 Nov: "proceed with phase E"; the advice's 4.9):
    - "Ask a Qura doctor" opens the call form straight away, with topics to tap: 3 taps to a sent request from a sign, a guide or Help;
    - the doctor screen stays first in a pregnancy, on the government route and without a server; one label ("Ask a Qura doctor");
    - one doctor card on Today (her plan's check waits for a sign from her diary); "Call my doctor" first for a sign for today.
    Which doctor each sign names waits for the doctor: `docs/doctor-ladder-packet-2026-11-03.md`. Contract: MODULE_API section 106;
    wording: section 19.63 (UI words only).
    Version 39.64 (Mohit, 3 Nov, answering the packet: "Qura first, gynaecologist second"):
    - every sign keeps "Ask a Qura doctor" first, with "See a gynaecologist" or "See a doctor" second (her number, the government
      route's guide, or Care near me);
    - low mood leads with Tele-MANAS 14416;
    - the trying and midlife tips show on Explore.
    The test's section 7. Contract: MODULE_API section 107; wording: section 19.64 (the sign map for the doctor).
  - `node test/stagerules.mjs` (Version 39.65, the stage-change rules; Mohit, 3 Nov: "proceed with the stage-change rules"; the advice's
    4.11, decision D7: ask, never block; the case is `node test/stagejump-walk.mjs`):
    - under 40, "Periods changing after 40" asks what is happening;
    - under 40, "My periods have stopped" shows the POI line, a Qura doctor first, and her cycle keeps counting until "My doctor says
      my periods have stopped";
    - from 40, a period in the last 6 weeks asks first; a period after "stopped" asks "Have your periods come back?";
    - Undo and "Changed by mistake" for every stage (a plan started on the mistake gives way to her earlier one, at its own week); no
      midlife offer under 40; no next-period countdown in the Diary around 40.
    Contract: MODULE_API section 108; wording: section 19.65 (four timings for the doctor).
  - `node test/onday.mjs` (Version 39.66, plan questions on their day; Mohit, 4 Nov: "proceed with plan questions on their day"):
    - no "Your day" before Start (only the midlife plan's two safety questions stay);
    - how active she is, how she eats and milk, her knees or back, her bedtime and her day are asked on Today, one at a time, on the
      first day a step uses them (gentle moves meanwhile); never in discreet mode or on a shared phone;
    - a default is never taken as her answer, and a new plan carries her answers (the summary shows them, with Change);
    - "From day 4: a regular bedtime" until she answers on day 4.
    Contract: MODULE_API section 109; wording: section 19.66 (one UI line; one default for the doctor).
  - `node test/firebase.mjs` (Version 39.79, "Share how I use Sakhi" through Firebase Analytics, events only; Mohit, 7 Nov: "i want
    to move to firebase"; it replaces Version 39.60's PostHog and `test/posthog.mjs`, with the same rules; the goal stays Mohit's 3 Nov
    "find what users like and spend time more on", `docs/activity-tracking-advice-2026-11-02.md`):
    - only in an APK built with `android/google-services.json`; the page never talks to Google: the bridge (`usage`, `usageEvent`,
      `usageForget`) hands events to `android/usage/firebase/.../Usage.java`, which checks them again;
    - on by default, off in Me > Privacy stays off (`state.settings.ph`), and a line in the data notice (notice version `.fb`);
    - screen views with neutral names (Firebase adds the time on each), taps as their place in the page, rage and dead taps, errors
      without their message;
    - private screens, the lock, discreet mode, a shared phone and a sample woman switch Firebase off altogether; off forgets the id;
    - no ad ID, Android ID, ad consents or automatic screens (the manifest), and the ad permissions and Play's install referrer
      removed (no campaign or install source).
    The test's fake bridge keeps every call. Contract: MODULE_API section 122 (privacy words only).
  - `node test/retire.mjs` (Version 39.68, the doctors' feature review, part 1; Mohit, 5 Nov: "go"; the record and the answers:
    `docs/feature-review-2026-11-05.md`): what Dr. Megha and the gynaecologist removed is gone however she reaches it (core
    `RETIRED`, `RETIRED_TILES`, `S.retired`; links dropped by `dropTriageLinks`), and what they kept stays:
    - gone: the Govt. services pages, My ASHA, My garden and petals, 21 small steps, the doctor's-view preview, Tell a person,
      the self-check, the violence and STI pages, 12 Learn articles and 6 chapters;
    - gone from Today and Help: Today's look-back, the notes meter, tips that start on their own, the first-days read, Help on
      every screen (Today only now, and not while she joins), Help's Private help;
    - gone from her plan: the answers summary, Plan your week, Your last plan, + minutes, and the baby plan's ready check and
      strength step;
    - gone too: Marathi, Bengali, Tamil and Telugu (Hindi and English only), and "My baby has died" (leaving "I had a baby" stops
      every baby line, `situation.babyOff`);
    - and what they left behind (MODULE_API 111, item 10): setup steps and reminders for the removed pages, the report's claims
      line, "or a free government doctor" in Help, the midlife first log in the Diary, and the fixed Hb line on her lab results.

    This supersedes those parts of the entries above. Parts 2 to 4 are Versions 39.70 to 39.72 (below). Girls under 18 stay out
    for now (Mohit, 5 Nov: "keep 18 for now"). Contract: MODULE_API section 111; the doctors' sign-off of 138 rows: section 19.68 of
    the review.
  - `node test/emergency.mjs` (Version 39.70, the doctors' feature review, part 2, the emergency line; Mohit, 6 Nov: "commit
    39.68 and go with part 2"; answers 1 to 3 of `docs/feature-review-2026-11-05.md`):
    - "Go to the nearest hospital now" wherever "Call 112 now" was, with one ambulance number under it: 108, or 102 in pregnancy
      (core `ambNo`, `ambBtn`, `emNums`; `S.amb()`, `S.ambBtn()`, `S.emNums()` for modules);
    - Tele-MANAS, 181, Childline and every violence line gone, and nothing for thoughts of harm (no Help row, search card or
      chip);
    - the Learn library rewritten to match, in English and Hindi.
    It sweeps every live screen and Learn article, for 5 women in both languages, for the removed numbers. This supersedes the
    112, Tele-MANAS and 181 lines in the entries above. Contract: MODULE_API section 113; wording: section 19.70 of the review
    (its patterns wait for the doctors' one read).
  - `node test/wording.mjs` (Version 39.71, the doctors' feature review, part 3, the wording; Mohit, 6 Nov: "commit 39.70 and go
    with part 3"; the approved plan and answers 6, 8 and 10):
    - the renames: "your trainer" in Wind down, yoga and breathing (Version 39.77: no doctor is named anywhere), "Pelvic floor exercises
      (Kegels)", "My postpartum recovery", "Menopause transition and menopause", "Period comfort";
    - the medicine line (core `medRow`, `MED_ROUTES`, `MED_ARTS`, `S.medLine()`), the emergency pill's own line, and the tests line;
    - cloth and the Rs 1 pad out;
    - the doctors' added lines (sleep sounds, the PMS chapters, his part, the ovulation tests, weeks 4 and 10, her checks first,
      breastfeeding's basics, the girls' guides on one page, the supplements card, "or a doctor");
    - "Ask a doctor" on every button, with the doctors' line about Qura's doctors.
    Contract: MODULE_API section 114; wording: section 19.71 of the review (waits for the doctors' one read).
  - `node test/behave.mjs` (Version 39.72, the doctors' feature review, part 4, the behaviour; Mohit, 6 Nov: "commit 39.71 and go
    with part 4"; the approved plan, two more Amend rows, and answers 5, 7 and 12):
    - one reveal screen for every plan, and the goal asked once (My plan lists her stage's plans once; Back from her first question
      returns to where she picked it);
    - after the check-in, her count and tomorrow's steps only;
    - the pause offer: Today's card after 2 days with nothing done, and its 9 am notification the morning after, at most once a week
      (`S.plan.pauseRing()`, booked by core);
    - before 40 with her periods stopped, her plan starts, with the gynaecologist card as advice;
    - contraception: Home asks only after a birth and for 30 days after she stops trying (`situation.ttcStop`); the folic acid
      reminder as it was (trying, and to 12 weeks);
    - sun salutation as Moves and calm's "Morning session"; the PMOS walk, 10 minutes after lunch and after dinner and a brisk 30
      to 45 minutes when her day allows, as one step;
    - the Fertile days estimate tile only while she tries; no screenshot block in the Android app.
    Contract: MODULE_API section 115; wording: section 19.72 of the review (the new lines wait for the doctors' one read).
  - `node test/kegel.mjs` (Version 39.73, the Kegel trainer; Mohit, 6 Nov, after his phone walk: "Proceed"): her first sets begin
    from Get into position (her level and the reviewed "Find the right muscles" lines, Start under it); in a set the lift beside
    her rises on the squeeze and settles on the let-go, with "Keep breathing normally" (her body stays still, as the lines teach);
    lying framed on her; "Start set 2" under "Set done"; and a set counts in her diary as it is when it ends. Contract:
    MODULE_API section 116; wording: section 19.73 of the review (UI words only).
  - `node test/phonewalk.mjs` (Version 39.74, the phone walk's fixes; Mohit, 6 Nov: "can you do needful and test everything thoroughly
    live walkthrough on phone"; his Flip5 on vc 125, walked over adb):
    - My PMOS plan's walk question: "When is a walk easiest for you?", and what Sakhi does with it (her nudge);
    - Plan settings' times under their reminder; "A look back" for every plan (no "plan the week");
    - her Kegel sets named once on the reveal; the Start card names her 9 pm folic acid tablet; "1 week pregnant";
    - search: her stage's guides first, other stages' and a loss or abortion page she didn't ask about after them (never dropped);
    - no "Why some pages are still in Hindi or English"; on a touch screen the tab bar steps aside while she types;
    - after a birth, "My periods have stopped" or "Periods changing after 40" keeps her stage and every baby line, with the
      reviewed line instead of the POI card;
    - the after-meal walk nudge quiet once her walk is done, "Before: …" in the month summary, the end card alone on day 85.
    Contract: MODULE_API section 117; wording: section 19.74 of the review (UI words only).
  - `node test/uxfix.mjs` (Version 39.75, the UI and UX gaps; Mohit, 6 Nov: "fix all", after the phone walk's list):
    - her steps first on Today, a "this week" finding after them (a sign for now or today stays on top);
    - the PIN she skipped (she asked for a lock while joining) asked once more, on her first private page;
    - under 40, "My periods have stopped" never called menopause while she joins, on Your Sakhi or on Today;
    - her week's count only on Today and My plan; "Still to see a doctor?" a week on; one way to her plan on Your Sakhi;
    - "Fasting?" in the check-in only once she has marked a fast (`fastAt`, 90 days);
    - the call form's topics by her stage, the Kegel trainer's figure hidden from screen readers, a named search clear button.
    Contract: MODULE_API section 118; wording: section 19.75 of the review (one UI label).
  - `node test/playfix.mjs` (Version 39.76, the Play walk's UI and UX gaps; Mohit, 6 Nov: "fix all", after the walk before Play):
    - names Android keeps: icon toggles as plain buttons whose name says the state, switches with `aria-label`, text boxes with
      their label as a description (core `axNames`); "Previous month" and "Next month";
    - a sheet or the + menu leaves the page behind inert, and the sheet's handle is a Close button;
    - taps of 48 px ("Why?", "How to do it", icon buttons; the top bar as it was); the + away while she scrolls down;
    - joining's "Pain that stops my day" carried into her plan; sign-up's picture steps aside while she types;
    - About's "Privacy policy" link (`SAKHI_PRIVACY`), no coordinator tool in a Play build; fertile days on Your Sakhi only
      while she tries.
    Android's tree is the judge: check names on the phone with a uiautomator dump (desktop Chromium keeps names Android drops).
    Contract: MODULE_API section 119; wording: section 19.76 of the review (UI words only).
  - `node test/doctorchoice.mjs` (Version 39.77, Qura doctor or government doctor, place by place; Mohit, 6 Nov: his 96 choices on
    claude.ai/artifact/JbnFnzN9W5NC9tq7xQQRzL, the audit `docs/doctor-choice-audit-2026-11-06.md`):
    - Qura collects the leads for PCOD/PCOS, conceiving naturally, menopause, after pregnancy and cycle concerns; everything else goes to
      her gynaecologist or a free government doctor (eSanjeevani, Care near me), on core's "See a doctor" page (`doc-free`);
    - one rule in core (`DOC_WHO`, `S.docWho`, `S.docCard`, `S.govCard`): Q, G, B, or H by her answer; Help's row is H, pregnancy is G;
    - Qura's doctors in his words everywhere: "Qura doctors are Ayurveda doctors (BAMS). They help you with natural and Ayurvedic
      treatments." No line says they only help with food, sleep or routine, can't treat, or refer to a gynaecologist;
    - diary signs and the before-40 card lose "See a gynaecologist"; "how soon" and danger lines stay;
    - "How Qura helps" rewritten in his words, and no doctor named anywhere in the app (Mohit: "Dont give doctor names anywhere").
    The walks behind it: `node test/doctor-walk.mjs` (every screen, 7 women, 5 answers) and `node test/doctor-shots.mjs` then
    `node test/doctor-page.mjs` (the choice page's screenshots). Contract: MODULE_API section 120; wording: section 19.77 of the review
    (waits for the doctors' read).
  - `node test/launchfix.mjs` (Version 39.78, the launch QA's fixes; Mohit, 7 Nov: "Yes, fix all 8"; the QA: `docs/launch-qa-2026-11-07.md`):
    - Send code in one tap with the keyboard up (sign-up's picture stays aside once she has tapped a box);
    - no belly gap check or after-birth lines on a pregnant woman's pelvic floor trainer, and her figure sits up (never on her back);
    - no sound with no tap: MainActivity opens a notification's screen only on a real new launch, and a page Android restored waits for
      her tap (the bridge's `restored()`, core `S.autoplayOk()`);
    - the players' controls, the check-in's Save and the + menu above Wind down's bar and above the tab bar's real height (`--tb-h`,
      `--tb-gap`, `--mini-h`; 74 px at 100% text, as before);
    - "Ring on time?" when a medicine reminder is booked (her tap or her plan), on a phone that would ring late: the one exception to
      Version 39.27's "no question in Sakhi's words", for "a medicine rings at its own time"; never for her other reminders;
    - joining's next step, her plan's next question and the page she signed up on open at their top;
    - the Learn article on her data drawn from the joining notice; the language tile names Hindi and English only.
    On the phone the walk tools are `web/test/adb-ui.mjs` (the screen as text, taps by label) and `web/test/adb-cdp.mjs` (a debug copy's
    WebView). Contract: MODULE_API section 121; wording: section 19.78 of the review (UI and privacy words only).
  - `node test/water.mjs` (Version 39.80, water; Mohit, 7 Nov: "Build W1 to W7" on `docs/water-advice-2026-11-07.md`, its section 2a the
    amount by her stage):
    - a water step last in My pregnancy ("over 2 litres today", 8 to 12 glasses) and while she breastfeeds ("a glass at every feed"),
      from day 2 when a slot is free; with no slot its line goes under her food step ("Food and water while you breastfeed");
    - the pelvic floor water habit back once a week after week 4; the Water page (`mods/water.js`, Me > Reminders), with a reminder
      she turns on (3 a day, 8 am to 7 pm, quiet once she ticks water);
    - the hot months' card (April to June) and her monthly check-in's line in Sakhi says; the drinks habit's amount, two water myths.
    Contract: MODULE_API section 123; wording: section 19.80 of the review (new lines wait for the doctors' read).
  - `node test/playteen.mjs` (Version 39.81, under 18 in a Play build; Mohit, 7 Nov: "Do all", after the launch checklist): Play's target
    audience is 18 and over, so in a `PLAY=1` build a girl under 18 gets the safety guide only (Help, the doctor page's trusted-adult
    words, Care near me), with Back, no tab bar and no Learn pages; pilot APKs keep the reading path. Contract: MODULE_API section 124;
    wording: section 19.81 of the review (UI words only).
  - `node test/showgets.mjs` (Version 39.83, show what she gets; Mohit, 8 Nov: "Yes, build part 1", after the Clue walks; advice
    `docs/teach-and-show-advice-2026-11-08.md`, L1 to L4; mockup claude.ai/artifact/QQ7BurjQ7QVACoTbQkEG4y, Option A):
    - the report's "When it comes": her last 3 complete cycles, the 7 days before each period, the days she bled and the rest, on
      What repeats for you's gate (`patOn`, `timing()`; 7 days, the clinical week, as the PMS log's summary), in place of the 90-day counts (key `symptoms` kept for the share);
    - Me > Reminders shows what her phone shows: nothing on the lock screen, then her next reminder as booked (`notifPreview`);
    - examples while she waits: the empty report's "See an example", and one example line for What repeats for you;
    - the toast after a log says when that sign usually comes for her, on a day that fits (`patFit`).
    Contract: MODULE_API section 126; wording: section 19.83 of the review (UI words only).
  - `node test/bodynow.mjs` (Version 39.84, Your body now and the cycle in pictures; Mohit, 8 Nov: "you proceed as per your
    recommendations"; the advice's part 2, L5 and L6):
    - "What’s happening in your body?" in Today's cycle card (not while her plan runs: her steps stay on the first screen) and on
      today's day page opens `body-now`: her period days, her phase only where Sakhi already places one (6 regular gaps), a late
      period, gaps too far apart (PMOS's picture when PMOS is hers), or how a cycle works without placing her; never in a
      pregnancy, after a birth, on hormones, stopped, midlife, discreet mode or a shared phone;
    - the Learn library's reviewed sentences quoted (`artSent`, `artSum`), her own lines from her diary (What repeats for you,
      last cycle around this day);
    - six flat drawings of the womb, tubes and ovaries in `art.js` (`S.art.body`), never a body seen through.
    Contract: MODULE_API section 127; wording: section 19.84 of the review (labels only; the drawings and quotes for the doctors).
  - `node test/learnpage.mjs` (Version 39.85, articles in a better format; the advice's part 3, L7):
    - every article opens with "In short" (its summary, moved into a box under the title);
    - "Checked by doctors · {month}" only while an article's words are the ones the doctors checked: `reviewed: { at, h }` in
      `content.json`, a fingerprint of every field she reads (core `artHash`). Record a check with
      `node web/tools/stamp-reviewed.mjs <YYYY-MM> <group.id ...|--all>` (`--list` shows each article's state); stamp only what
      the doctors checked, in the month they checked it. Now all 60, as Nov 2026 (Mohit, 8 Nov: their 8 Nov read covered the library);
    - Version 39.84's drawings under the paragraphs they show (the cycle, PMOS, irregular cycles, painful periods).
    Contract: MODULE_API section 128; wording: section 19.85 of the review (two labels; which articles carry the line, for the doctors).
  - `node test/chartlang.mjs` (Version 39.86, the presentation audit's fixes and one chart language; the advice's part 4, L9 and L10;
    the audit: `docs/presentation-audit-2026-11-08.md`):
    - Help and safety: "Go to the nearest hospital now if" right under "Not an emergency?" again, on the first screen at 360 x 800;
    - a date never breaks inside itself (core `rangeHtml`); the tab bar's labels and the weekday letters at 13 px;
    - every chart of her data with its numbers on it (core `vBars`: her value on top of each bar, the usual band and the 8-day line
      labelled beside the bars; My progress's minutes on its bars and "target: {n}");
    - the report's "When it comes" with each sign's picture in its kind's colour, kept in print.
    The walk behind it (not pass/fail): `node test/present-walk.mjs [dir] [name]` (72 first screens and their measures to
    `test/shots/present-walk/<name>/`). Contract: MODULE_API section 129; wording: section 19.86 of the review (one UI label).
  - `node test/golden.mjs` replays 31 plans over 8 days against `web/test/golden/plans.json`; a change that means to alter
    a plan re-records it with `npm run golden:record` and says so.
  - `node test/progs.mjs` (Version 39.4, the plans as data in `web/progs/*.js`: pure data, the engine's vocabulary, Hindi,
    routes, drafts, `d.pv`, and each live plan's hash in `web/progs/baseline.json`, re-recorded with `npm run progs:record`
    when a plan or a line it shows changes). Contract: MODULE_API section 47.
  - Walks, not pass/fail (screens to `web/test/shots/`, gitignored): `node test/firstday-walk.mjs`,
    `node test/weeks-walk.mjs` (12 weeks, fast-forwarded), `node test/stages-walk.mjs` (every goal and stage) and
    `node test/threeplans-walk.mjs` (PMOS, Getting ready and My pregnancy lived from day 1 to day 85; Version 39.37). Run them
    before and after a change to compare. `node test/journey-video.mjs [stage ...]` films one woman per joining stage from
    install to 3 months (MP4s with captions to `web/test/shots/journeys/`, about 12 minutes for all 7; needs ffmpeg).
    `web/test/taps/` counts taps for joining and the everyday jobs (run `join-run.mjs <cycle|ttc|nopl> [tour|skip]`, then
    `days-run.mjs`, then `jobs-run.mjs`; output to `web/test/shots/taps/`): the baseline for
    `docs/minimalism-audit-2026-10-27.md`, Appendix B.
  - `node test/play.mjs` (Google Play, 29 Oct: target SDK 36, edge to edge, Back on Android 13+, the bundle and its upload
    key; reads the last Play bundle when there is one). The reviewer's sign-in is in `npm run test:server`.
  - `node test/maths.mjs`
  - `node test/smoke.mjs .`
  - `node test/check.mjs all --quick`
  - Server, from the repo root: `npm run test:server`. `npm test` runs everything.
- APK: `cd android && VERSION_CODE=<n> VERSION_NAME=<x>-demo ./build-apk.sh`.
  - The APK needs Android 10 or newer (min SDK 29). Mohit, 25 Oct: build for newer phones, not very cheap ones, so don't trade
    quality for old phones. The build refuses an APK over 30 MB unless `MAX_APK_MB` is raised on purpose: a guard against
    accidental bloat, not a budget (app size is not a barrier, below).
  - VERSION_CODE is required and may not go below the last APK built (testers' phones refuse it, and uninstalling deletes
    the diary). A missing `sakhi-prototype.keystore` stops the build: restore it from Mohit's backup; `NEW_KEYSTORE=1` only for
    a first build that no phone has.
  - Testers get a build without "demo" (for example `0.32-test`): no sample women, no fertile days, and the triage tools held
    back (MODULE_API section 34).
  - A pilot build (`0.33-pilot`) has every tool on, fertile days and the triage tools included, and still no sample women
    (MODULE_API section 35; Mohit's legal advice, 23 Oct). Every pilot and Play build adds
    `SAKHI_GRIEVANCE="Mohit Kumar, Trinaya Wellness LLP, E-1-121, Chitrakoot Yojna, Chitrakoot Marg, Vaishali Nagar, Jaipur, Rajasthan 302021, hello@quranutrition.com"`
    (Mohit, 7 Nov: he is the Grievance Officer; the LLP's registered address; the email on the website's privacy page).
  - For the live server, add `SAKHI_API=https://jovplellzaxebcdekpax.supabase.co/functions/v1/sakhi-api`. Every signup on
    such a build sends a real code.
  - Add `SAKHI_HELP_WA=91XXXXXXXXXX` (Qura's staffed WhatsApp number) for "Speak to a doctor" and "Tell a person". Without
    it the doctor screen offers Qura's booking page and "Tell a person" is hidden.
  - A version name without "demo" refuses to build unless `SAKHI_API` is https.
  - Add `SAKHI_PRIVACY=https://quranutrition.com/sakhi/privacy` (live since 7 Nov; www redirects to it): the "Privacy policy" link in
    About and privacy (Version 39.76; Play wants it in the app). https only; without it there is no link. `PLAY=1` builds hide the
    coordinator tool.
  - "Share how I use Sakhi" (Version 39.79) is in the build when `android/google-services.json` is there (Firebase project
    `qura-sakhi`, Mohit's account; the file is not in git). Without it the APK has no Firebase code and no switch. `SAKHI_PH`
    (PostHog, Version 39.60) is gone.
  - It installs and opens the app on the phone if one is on adb. To build without installing, run it with adb off the path:
    `PATH=/usr/bin:/bin:/usr/sbin:/sbin` before the command.
  - Copy the result to `../QuraSakhi-prototype.apk`.
  - It targets SDK 36 (Play's floor since 31 Aug 2026) with platform 36 and build-tools 36.0.0.
  - Since Version 39.79 it builds with Gradle (`./gradlew`, Gradle 9.9.0 and the Android plugin 9.5.1, downloaded once into
    `~/.gradle`; `build.gradle.kts`, output in `android/build-gradle/`). R8 shrinks the libraries and renames nothing.
  - `SAKHI_WEB=<dir>` builds from another copy of the web app, e.g. the last commit's while `web/` holds unfinished work
    (`android/build-apk.sh` says how). Check `git status web/` before a build: a build copies whatever is there.
- Google Play: `PLAY=1` with the same variables builds `android/build-play/QuraSakhi-<name>-<code>.aab` (not in git) and
  installs nothing. Steps, the upload key and what's still needed outside the code: "Google Play" in `android/README.txt`.
  - The upload key is `android/sakhi-upload.keystore` (not in git); its password is only in the Mac's keychain ("Qura
    Sakhi upload key"). Never print it or put it on a command line.
  - Play's reviewers sign in with one number and a fixed code: `server/SERVER_SPEC.md` 5.1a, `server/DEPLOY.md` section 3.5.
- Care near me data: `node web/tools/care-data.mjs` writes `web/care/` (not in git) from data.gov.in. To rebuild without
  downloading again: `node web/tools/care-data.mjs --from web/tools/care-src` (the 22 Oct lists, also not in git). It needs Mohit's own
  key or his hand-downloaded files: `docs/care-near-me-data-2026-10-22.md`. `build-apk.sh` bundles it when present.
- Preview: `../Open prototype.command`, or "Sakhi web" in `.claude/launch.json`.
- Web prototype (a private Claude artifact): https://claude.ai/artifact/25aocCU68U1DHebpjTmne6. To republish, copy
  `web/index.html` and the changed files to the session scratchpad and publish to that URL.
  - The published `index.html` adds `window.SAKHI_CONFIG = Object.assign({ care: 'care/' }, window.SAKHI_CONFIG || {});` before
    `app.js`.
  - `progs/*.js` (the plans as data, Version 39.4) go up with every publish, beside `mods/*.js`.
  - `sounds/` (Version 39.21, about 17 MB: `timelines.js`, `captions.js`, `voice/`, `music/`) goes up too, or Wind down and the relief
    voice stay silent there.
  - `fig/` (Version 39.39, about 6.7 MB: `fig.js`, `v/`, `s/`, and Version 39.69.2's `t/`) goes up too, or the player shows the drawings there.
  - The `care/*.js` data goes up too, at most 255 files a publish. Read every data file before publishing it, for example
    with a script that checks each record.
- Playwright: comes from this repo's node_modules after `npm install` here. Until then the tests borrow Qura's copy
  (see `web/test/pw.mjs`).

## Mohit's rules for Sakhi
- Reproductive health only. No new conditions; evidence is used only to strengthen existing features.
- App size is not a barrier (Mohit, 29 and 30 Oct: "App size is not a constraint i want to deliver best user experience").
  Spend the MB a better experience needs, such as the 3D moves, voices, sounds and pictures, and never cut quality to save
  size. When a wanted feature passes the 30 MB guard, raise `MAX_APK_MB` on purpose and say so in the build summary.
- The diary never leaves the phone.
  - Only core `net()` talks to a server, and only with allowlisted fields (MODULE_API section 24). The one other way out
    (Mohit, 3 Nov; Firebase since 7 Nov) is core's usage block, through the app's Java to Firebase Analytics: events only, anonymous,
    on by default with her off switch, through its allowlist, off altogether on private screens (MODULE_API section 122).
    Never recordings.
  - Modules never touch the network.
  - Never send health data to Meta.
- Every woman signs up, except girls under 18.
- No new spend: a free Supabase project, plus Qura's existing WhatsApp number and AuthKey account.
- Content was doctor-verified on 20 Oct 2026. New health wording needs doctor review before it ships.
- Loading a Demo sample replaces the diary on that phone. Never do it on Mohit's phone without asking.
- Never enter the phone's PIN or passwords, and don't wake or unlock the phone.
- Never write a Flo (or other competitor) walkthrough report; principle-level notes only.
- Commit, push or open PRs only when asked. Ask before downloads (npm install, SDKs), licence acceptance or publishing.
- Sakhi website or marketing copy: apply the humanizer in Dr. Megha's voice
  (`~/Desktop/qura_nutrition-version1/.claude/skills/humanizer/SKILL.md`).
- Keep every test inside this repo. The session scratchpad is wiped when the Mac restarts.
- Every plan build (a new plan, a new version, a plan feature) meets the minimalist baseline (Mohit, 28 Oct: "make this
  minimalist approach a baseline for this project for future plan builds"; `docs/minimalism-audit-2026-10-27.md`, section 3
  and the 10-second day in section 4). Check each point before building and again in the build summary:
  - Her evening is Version 39.27's (MODULE_API section 70): reminders on by default wherever she needs one, no question in
    Sakhi's words, no spacing rule and no cap, in the order she lives her evening (the check-in after her last step). A
    medicine rings at its own time. Every new ring needs a reason in the build summary.
  - Today: at most 4 steps a day, and a new plan starts day 1 with 3 or fewer. Anything else under her steps is one row at a
    time. One "Sakhi says" card.
  - Ask less: only what the plan uses, on the day it changes something. Reuse what joining and other pages already hold;
    an optional question needs no answer. A new screen before her first step needs a reason in the build summary.
  - One home for each fact: no row, card or tile that repeats a step, a tile or another card.
  - Explanation she reads once folds after week 1; her steps, tools and settings stay open.
  - No new tours, tips or celebrations. A lapse is never a broken streak.
  - The shared-phone check: discreet titles, private steps hidden, private pages behind her PIN.
  - Measure it: count taps with `web/test/taps/` (`join-run.mjs`, `days-run.mjs`, `jobs-run.mjs`) before and after, and
    report the difference. `node test/progs.mjs` checks every live plan's evening order.
