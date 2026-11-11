# Qura Sakhi

Qura Sakhi is a free Android app, in Hindi and English, that keeps a woman's health diary on her own phone across her
reproductive life: periods, planning a baby, pregnancy, after a birth and midlife. It watches her diary for warning
signs, tells her how soon to see a doctor, and finds her nearest government health centre, even offline.

It is made by Qura (Trinaya Wellness LLP), an online women's health service in India. Sakhi has no ads and sells
nothing.

**Status.** Sakhi 1.0 (versionCode 147) was submitted to Google Play for review on 9 November 2026. Ask Sakhi, an AI
helper that answers questions from the app's guides, is a prototype for team phones: its code is in `main`, but it is
switched on only in test builds made with `SAKHI_CHAT`, and never in the Play build.

> Sakhi is not a doctor and does not diagnose. Its findings say how soon to see one.

## What it does

- **Diary.** Periods, flow, pain, symptoms, moods and notes, with a calendar and next-period ranges.
- **Findings.** 30 fixed rules, reviewed by doctors, turn her diary into findings with a time to see a doctor: this
  month, this week, today, or "Go to the nearest hospital now". Cycle lengths are checked against FIGO 2018. The same
  rules apply to every woman, and a finding is never a diagnosis.
- **Care near me.** 147,742 government health centres and hospitals, found by PIN code without a connection, built
  from open government data. The "See a doctor" page also links to eSanjeevani, the government's free online doctor
  service.
- **Plans and guides.** Seven 12-week plans (irregular periods and PMOS/PCOS, period problems, getting ready for a
  baby, pregnancy, after a birth, midlife, pelvic floor), 60 doctor-checked guides with 287 source citations, a
  contraception chooser, and food advice for six Indian regions.
- **For shared phones.** A PIN lock, a discreet mode that hides numbers, charts and words like "period", and
  reminders with neutral titles.
- **A doctor's call, if she asks.** "Ask Qura to call me" sends Qura her first name, number and only the diary parts
  she ticks. Nothing is sent unless she asks.
- **Report.** Her dates become a one-page report, in English or Hindi, that she can show any doctor.

## Privacy and safety by design

- **The diary stays on her phone.** The server never receives it, and Android backup is off for the app.
- **The server** (`server/`) holds only her account: phone number, sign-up details and the last day she opened the
  app. It sends her sign-in code by WhatsApp or SMS.
- **Qura's hand-off** sees only what she sends with "Ask Qura to call me": her first name and number, what she wants to
  talk about, the language and time for the call, and only the diary parts she ticks (nothing is ticked to start).
- **The Play build** includes Google Firebase Analytics (events only: screen names and tap places, never her words).
  It is on by default and she can turn it off in Me > Privacy; it is off on private screens and in discreet mode. The
  open build leaves Firebase out.
- **Danger signs** (for example, heavy bleeding in pregnancy) show "Go to the nearest hospital now", with a call
  button for the ambulance, 108 (102 in pregnancy).
- **Age.** Sakhi is for women 18 and over. In the Play build, a girl under 18 sees only the safety guide.
- **The app lock** is a lock for a shared phone, not encryption. The app relies on Android's sandbox and the phone's
  own encryption. See [SECURITY.md](SECURITY.md).

## How the repo is laid out

| Folder | What is in it |
|---|---|
| `web/` | The app itself: plain JavaScript, HTML and CSS, with no framework and no build step |
| `web/app.js` | The core: diary, cycle predictions, screens, the danger-sign check |
| `web/mods/` | 32 care-area modules. The findings rules are in `web/mods/explain.js` |
| `web/progs/v1.js` | The seven plans, as data |
| `web/content.json` | The 60 Learn guides, with their sources and the month the doctors checked each one |
| `web/art.js`, `web/fig/`, `web/sounds/` | Drawings, the 3D exercise figure, and the sounds and voice clips |
| `web/care/` | The health-centre data. Generated, not in git: see "Care near me data" below |
| `android/` | A Java app hosting the web layer in a WebView (`MainActivity.java`), with reminders, read-aloud and fingerprint unlock |
| `server/` | Two Supabase Edge Functions (`sakhi-api` for accounts, `sakhi-chat` for the Ask Sakhi prototype), the Postgres migrations for the `sakhi` schema, and their tests |
| `docs/` | Specs, audits, reviews and the build history |

The module contract and each version's rules are in `web/MODULE_API.md`; the server's spec is `server/SERVER_SPEC.md`.

## Running it

### In a browser

```bash
python3 -m http.server 4990 --directory web
```

Then open http://localhost:4990. Without a server address the app uses a stand-in server inside the page: nothing is
sent, and the sign-in code is always 123456.

### Tests

You need Node.js. The tests use Playwright (Chromium) and PGlite (Postgres in memory); `npm test` also runs the
Android reminder maths, which needs Java 21.

```bash
npm install
npx playwright install chromium
npm test
```

`npm test` runs 96 app suites (`web/test/`), the server's tests (`server/test/`, also `npm run test:server`) and the
Android test. Each suite can run on its own from `web/`, for example `node test/urgent.mjs`.

### The open Android build (no Firebase)

You need JDK 17 or newer (21 is what we use), the Android SDK with platform 36 and build-tools 36.0.0, and Python 3.
Sakhi runs on Android 10 (API 29) and newer. Leave out `android/google-services.json` (it is not in git) and the build
has no Firebase code at all (`android/usage/none`).

```bash
cd android
ANDROID_HOME=/path/to/android-sdk JAVA_HOME=/path/to/jdk VERSION_CODE=1 VERSION_NAME=0.1-demo NEW_KEYSTORE=1 SAKHI_PROTO_PASS='choose-a-password' ./build-apk.sh
```

- `NEW_KEYSTORE=1` makes your own signing key, `android/sakhi-prototype.keystore`, the first time. Keep it and its
  password: every later update must be signed with the same key. On a Mac you can leave out `SAKHI_PROTO_PASS`, and
  the build makes one and keeps it in the keychain.
- A version name with `demo` runs against the stand-in server and includes sample women. For a real server, add
  `SAKHI_API=https://<your-project>.supabase.co/functions/v1/sakhi-api` and use a name without `demo`.
- If a phone is connected over adb, the script installs the APK and opens it. Everything the build takes is described
  at the top of `android/build-apk.sh` and in `android/README.txt`.

### The server

The server is a Supabase project with the `sakhi` schema and two Edge Functions. Its setup, from creating the project
to checking it, is in [server/DEPLOY.md](server/DEPLOY.md), including the list of its settings (names only). Its tests
run locally without a Supabase project: `npm run test:server`.

### Care near me data

`web/care/` is built from two data.gov.in lists (India Post's All India Pincode Directory and the NIN health
facilities list) and is not in git. Build it in one of two ways:

```bash
# A) from the CSV files you downloaded from each dataset's page on data.gov.in
node web/tools/care-data.mjs --pins pincode.csv --facilities nin.csv
```

```bash
# B) with your own data.gov.in API key (data.gov.in > My Account > Generate API Key), read from the environment
DATA_GOV_IN_KEY=your-key node web/tools/care-data.mjs --api
```

Without `web/care/`, the app builds and runs without the Care near me search (`build-apk.sh` bundles the data when
it is there). Details:
`docs/care-near-me-data-2026-10-22.md` and the top of `web/tools/care-data.mjs`.

## The clinical rules, their sources and the doctors' review

- **Findings:** the 30 rules in `web/mods/explain.js` (what may be happening, what she can do, and how soon to see a
  doctor). The cycle maths and its FIGO 2018 limits are in `web/app.js`, checked by `web/test/maths.mjs`.
- **Danger signs:** Help's "Go to the nearest hospital now" list and the danger-sign check in `web/app.js`, checked by
  `web/test/urgent.mjs` and `web/test/emergency.mjs`.
- **Guides:** each guide in `web/content.json` lists its sources, and carries "Checked by doctors" with the month only
  while its words are the ones the doctors checked (`web/tools/stamp-reviewed.mjs`).
- **The doctors' review:** Qura's doctors (an Ayurveda doctor and a gynaecologist) checked the content in October 2026
  and every feature in November 2026 (`docs/feature-review-2026-11-05.md`). Every wording change and whether it still
  waits for their review is recorded in `docs/wording-review-v28.md`.

## Ask Sakhi (prototype)

Ask Sakhi is a chat tab that answers her questions from Sakhi's own guides, in English, Hindi or Hinglish, using
Anthropic's Claude through the `sakhi-chat` function. It is a prototype for team phones only:

- it is on only in a build made with `SAKHI_CHAT` and a version name containing `ask-proto`; `build-apk.sh` refuses
  `SAKHI_CHAT` for a Play build, and the app turns the tab off in a Play build too;
- her question is sent with email addresses and phone numbers scrubbed, and never her diary; the server keeps daily
  totals only, not the questions or the answers;
- danger signs typed in the chat show the same "Go to the nearest hospital now" card as Help.

Its spec, tests and evaluation are in `server/SERVER_SPEC.md` (section 12), `server/test/chat.test.mjs`,
`web/test/chat.mjs` and `server/scripts/`.

## Adapting Sakhi for another language or country

Most of the app is data, but some things are written for India today:

- emergency numbers (108, and 102 in pregnancy);
- the health-centre builder, PIN codes and +91 phone numbers;
- government schemes and health workers (ASHA, ANM, JSSK, PMSMA, the MCP card);
- foods (six Indian regions, from ICMR-NIN 2024);
- the time zone, Hindi search words, and the legal text (India's DPDP Act, a Grievance Officer).

A health guide adapted for another country should be reviewed by a doctor who practises there.

## Licences

- **Code:** MIT. See [LICENSE](LICENSE).
- **Content:** the guides, plan text, food lists, app wording, drawings and 3D renders are under CC BY 4.0. See
  [LICENSE-content.md](LICENSE-content.md).
- **Third-party pieces** keep their own licences: fonts under the SIL Open Font License, sleep sounds and 3D assets
  under CC0, and the health-centre data under the Government Open Data License – India. See [NOTICE.md](NOTICE.md).
- **Not licensed:** the names "Qura" and "Sakhi" and the logo are trademarks, and the voice clips in
  `web/sounds/voice/` are left out of every licence for now.

## Who made it

Sakhi is made by Trinaya Wellness LLP (Qura), with Mohit Kumar leading the product and Qura's doctors reviewing its
health content. The code was written with Claude Code, Anthropic's coding agent, under Mohit's direction; every commit
carries its co-author line.

Questions: hello@quranutrition.com. Security reports: see [SECURITY.md](SECURITY.md).
