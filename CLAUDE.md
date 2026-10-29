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
  - `node test/golden.mjs` replays 31 plans over 8 days against `web/test/golden/plans.json`; a change that means to alter
    a plan re-records it with `npm run golden:record` and says so.
  - `node test/progs.mjs` (Version 39.4, the plans as data in `web/progs/*.js`: pure data, the engine's vocabulary, Hindi,
    routes, drafts, `d.pv`, and each live plan's hash in `web/progs/baseline.json`, re-recorded with `npm run progs:record`
    when a plan or a line it shows changes). Contract: MODULE_API section 47.
  - Walks, not pass/fail (screens to `web/test/shots/`, gitignored): `node test/firstday-walk.mjs`,
    `node test/weeks-walk.mjs` (12 weeks, fast-forwarded) and `node test/stages-walk.mjs` (every goal and stage). Run them
    before and after a change to compare. `node test/journey-video.mjs [stage ...]` films one woman per joining stage from
    install to 3 months (MP4s with captions to `web/test/shots/journeys/`, about 12 minutes for all 7; needs ffmpeg).
    `web/test/taps/` counts taps for joining and the everyday jobs (run `join-run.mjs <cycle|ttc|nopl> [tour|skip]`, then
    `days-run.mjs`, then `jobs-run.mjs`; output to `web/test/shots/taps/`): the baseline for
    `docs/minimalism-audit-2026-10-27.md`, Appendix B.
  - `node test/maths.mjs`
  - `node test/smoke.mjs .`
  - `node test/check.mjs all --quick`
  - Server, from the repo root: `npm run test:server`. `npm test` runs everything.
- APK: `cd android && VERSION_CODE=<n> VERSION_NAME=<x>-demo ./build-apk.sh`.
  - The APK needs Android 10 or newer (min SDK 29). Mohit, 25 Oct: build for newer phones, not very cheap ones, so don't trade
    quality for old phones. The build refuses an APK over 30 MB unless `MAX_APK_MB` is raised on purpose.
  - VERSION_CODE is required and may not go below the last APK built (testers' phones refuse it, and uninstalling deletes
    the diary). A missing `sakhi-prototype.keystore` stops the build: restore it from Mohit's backup; `NEW_KEYSTORE=1` only for
    a first build that no phone has.
  - Testers get a build without "demo" (for example `0.32-test`): no sample women, no fertile days, and the triage tools held
    back (MODULE_API section 34).
  - A pilot build (`0.33-pilot`) has every tool on, fertile days and the triage tools included, and still no sample women
    (MODULE_API section 35; Mohit's legal advice, 23 Oct). Add `SAKHI_GRIEVANCE="Name, Trinaya Wellness LLP, address, email"` once Mohit gives it.
  - For the live server, add `SAKHI_API=https://jovplellzaxebcdekpax.supabase.co/functions/v1/sakhi-api`. Every signup on
    such a build sends a real code.
  - Add `SAKHI_HELP_WA=91XXXXXXXXXX` (Qura's staffed WhatsApp number) for "Speak to a doctor" and "Tell a person". Without
    it the doctor screen offers Qura's booking page and "Tell a person" is hidden.
  - A version name without "demo" refuses to build unless `SAKHI_API` is https.
  - It installs and opens the app on the phone if one is on adb. To build without installing, run it with adb off the path:
    `PATH=/usr/bin:/bin:/usr/sbin:/sbin` before the command.
  - Copy the result to `../QuraSakhi-prototype.apk`.
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
  - The `care/*.js` data goes up too, at most 255 files a publish. Read every data file before publishing it, for example
    with a script that checks each record.
- Playwright: comes from this repo's node_modules after `npm install` here. Until then the tests borrow Qura's copy
  (see `web/test/pw.mjs`).

## Mohit's rules for Sakhi
- Reproductive health only. No new conditions; evidence is used only to strengthen existing features.
- The diary never leaves the phone.
  - Only core `net()` talks to a server, and only with allowlisted fields (MODULE_API section 24).
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
