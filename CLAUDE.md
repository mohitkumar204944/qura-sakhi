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
  - Version 30's opt-in "what helps" route and its migration are built but not deployed (SERVER_SPEC 5.9). The next `db push`
    or function deploy would carry them, so either waits for Mohit's yes.
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
  - `node test/value.mjs` (Version 30: search, Care's groups, Get care free, Home's Today, setup and visit cards, the fold,
    reminders, and the opt-in "what helps" counts)
  - `node test/maths.mjs`
  - `node test/smoke.mjs .`
  - `node test/check.mjs all --quick`
  - Server, from the repo root: `npm run test:server`. `npm test` runs everything.
- APK: `cd android && VERSION_CODE=<n> VERSION_NAME=<x>-demo ./build-apk.sh`.
  - For the live server, add `SAKHI_API=https://jovplellzaxebcdekpax.supabase.co/functions/v1/sakhi-api`. Every signup on
    such a build sends a real code.
  - Add `SAKHI_HELP_WA=91XXXXXXXXXX` (Qura's staffed WhatsApp number) for "Speak to a doctor" and "Tell a person". Without
    it the doctor screen offers Qura's booking page and "Tell a person" is hidden.
  - A version name without "demo" refuses to build unless `SAKHI_API` is https.
  - It installs and opens the app on the phone if one is on adb. To build without installing, run it with adb off the path:
    `PATH=/usr/bin:/bin:/usr/sbin:/sbin` before the command.
  - Copy the result to `../QuraSakhi-prototype.apk`.
- Care near me data: `node web/tools/care-data.mjs` writes `web/care/` (not in git) from data.gov.in. It needs Mohit's own
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
