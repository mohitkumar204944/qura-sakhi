# Qura Sakhi

Free bilingual (English + Hindi) reproductive-health companion app for Indian women, made by Qura (Trinaya Wellness LLP).
This repo is Sakhi only. Qura's website and database live in `~/Desktop/qura_nutrition-version1` and are out of scope here:
don't read, search or change them from a Sakhi session. The one exception is the humanizer skill file named below. The single
planned link between the two products is the doctor-call hand-off in `server/SERVER_SPEC.md` section 10.1.

## Layout
- `web/`: the app (vanilla JS, no build step): `app.js` core, `mods/*.js` care areas, `content.json` Learn library.
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
  - Walks, not pass/fail (screens to `web/test/shots/`, gitignored): `node test/firstday-walk.mjs`,
    `node test/weeks-walk.mjs` (12 weeks, fast-forwarded) and `node test/stages-walk.mjs` (every goal and stage). Run them
    before and after a change to compare.
  - `node test/maths.mjs`
  - `node test/smoke.mjs .`
  - `node test/check.mjs all --quick`
  - Server, from the repo root: `npm run test:server`. `npm test` runs everything.
- APK: `cd android && VERSION_CODE=<n> VERSION_NAME=<x>-demo ./build-apk.sh`.
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
