# Sakhi: ready to give to 8–10 women? A field-test audit (23 Oct 2026)

Mohit asked: "can you once thoroughly audit if any bugs or gaps or is ready for testing i can give to 8-10 women around me".

This audit covers Version 31 as it stands in the working tree (not committed yet), and the APK built from it:
- 0.31-demo, versionCode 33;
- the live accounts server;
- no help WhatsApp number;
- the Care near me data bundled.

The testers in mind are women around Mohit in India:
- of mixed ages and life stages;
- reading Hindi or English;
- on their own Android phones of several brands and ages;
- installing the APK sent over WhatsApp.

**How it was checked**
- **The full test suite passes:**
  - app: signup 81, tours 36, Me 60, privacy 51, companions 74, plans 115, value 106, insights 55, plus maths, smoke and the module checks;
  - server: 223, end to end 21, key script 15.
- **The live server**, read through the Supabase CLI without calling it: `sakhi-api` is active, version 6, deployed on 20 Oct at
  17:19 IST together with the email migration. Its code matches the repo, except for Version 30's "what helps" route, which isn't
  deployed.
- **Six reviewers in parallel.** Each used headless Chromium at phone sizes (360×640 to 412×915) with the APK's own settings and
  Content-Security-Policy, a stand-in for the Android bridge, and a local stand-in for the server. Nothing was sent to the live
  server and the phone wasn't touched.
  1. Android: install and update, old WebViews, the Back button, reminders, large fonts.
  2. First use in English: 152 screens for each of three diaries, signup edge cases, logging, reminders, the report.
  3. Hindi: all 3,737 strings, 207 screens, the Version 29–31 wording.
  4. Cycle maths and logging: 21 diary shapes, periods up to 100 days late, stage changes, midnight, leap day.
  5. Data safety, privacy and accounts: storage, deleting, backups, the network, and signup run against the live server's own
     code on this Mac.
  6. Health wording and help paths: the review status, warning signs, helplines and schemes checked against official sources,
     and the Care data.
- **I re-checked every serious finding myself**, in the code, by re-running the reviewers' probes, or against official sources.
  Where a finding still needs a phone to confirm, it says so.
- **Not covered:**
  - a run on a real phone (the Flip5 holds Mohit's own diary);
  - Play Protect's verdict on the APK;
  - a really old phone.

## Update: Version 33, the pilot build (23 Oct)

Mohit's lawyer advised that CDSCO approval can wait for the pilot, and he asked for the full version. Testers now get
`0.33-pilot` (versionCode 35) instead of `0.32-test`:
- Fertile days and the chance of pregnancy show for every woman with steady cycles, not only one trying for a baby. They are
  still never "low", never once she's late, and "not a way to avoid pregnancy".
- The 11 self-checks held back in section 4, decision 3, are back.
- No sample women and no prototype settings, as before.
- "Ask Qura to call me" is built (app and server) but stays off until the server is deployed, Qura's endpoint exists and the
  shared key is set. Until then Ask looks as it did.

Details: `web/MODULE_API.md` section 35. The items below still apply. Version 33 adds three: the doctor's review of section 10
of `docs/wording-review-v28.md`; counsel on the new consent and notice lines; and Mohit's yes to deploy the server.

## Status: Version 32 built the fixes (23 Oct, Mohit: "go")

Every item in sections 2 and 3 is fixed in Version 32, with Mohit's recommended defaults for the six decisions (section 4). The
details are in `web/MODULE_API.md` section 34, and `node test/fieldtest.mjs` checks each fix (109 checks). Testers get
`0.32-test`, a build without "demo".

**Left for Mohit before the APK goes out:**
1. **Back up `android/sakhi-prototype.keystore` and its password off this Mac.** Every update must be signed with it.
2. **The doctor's review:** sections 6 to 9 of `docs/wording-review-v28.md`. Section 8's NHS figures are corrected, and section
   9 lists Version 32's new lines.
3. **The Grievance Officer's name and contact** for the notice. Build with `SAKHI_GRIEVANCE="…"`; until then the line is left
   out.
4. **Confirm Dr. Megha's registration number (28526).** The library article still shows it; it's marked unverified in the
   sources review.
5. **Optional:** Qura's staffed WhatsApp number (`SAKHI_HELP_WA`), if someone can answer testers there.

**Also done from section 5:**
- discreet mode no longer shows predicted period days or the Fertile days page;
- the Autostart step for reminders;
- `VIBRATE`;
- the Hindi spellings in the library;
- Marathi, Bengali, Tamil and Telugu no longer say fertile days are never shown;
- a damaged saved diary is kept aside instead of overwritten.

**Not done (still section 5):**
- large-font clipping;
- the tab bar over the keyboard;
- the backup code's length with photos;
- unlimited PIN tries;
- the other Care data junk and far-off map pins (the card's "check with your ASHA or 104" stays);
- the heavy-bleeding wording and 112-list questions for the doctor;
- "1 days".

## 1. The short answer

**Not yet, but it's close.** The app itself is in good shape:
- **No crashes:** no page errors on 150+ screens for each of three diaries, 260 screens under the APK's own settings, or 207
  screens in Hindi.
- **Fast on slow phones:** the first screen appears in about 0.25 s with the processor slowed 4×, and 0.6 s at 10×.
- **Private:** only the accounts server is ever called, and only with the allowed fields. Nothing from the diary leaves the phone.
- **Complete in Hindi:** every string and all 69 articles.
- **Correct maths:** the cycle maths matches a hand calculation for 21 diary shapes, and no screen calls any day "safe".

What stops it:
- **10 issues that could mislead or harm a tester, or lose her data** (section 2). Three are the most serious:
  - the "Low chance of pregnancy" days are worked out with the wrong numbers;
  - after a pregnancy loss, Home tells her to take a pregnancy test;
  - the after-birth check hides its own warning signs.
- **About 40 smaller issues that would get testers stuck or cost their trust** (section 3). For example:
  - a server hiccup at signup locks her out of her own diary;
  - reminders never ring unless she finds a switch in Me;
  - a double tap on "Period started" ends the period on day 1.
- **6 decisions only Mohit can make** (section 4), such as whether testers see fertile days at all.

Most fixes are small. They fit in one build, Version 32 (APK 0.32-test).

## 2. Fix before any woman gets it: safety and her data

1. **Fertile days and "chance of pregnancy": the "Low" days aren't safe, and nothing has been reviewed.**
   - A "-demo" APK shows them as soon as she has 6 steady gaps. That happens quickly if she fills in past periods from memory.
     She'd see "After ovulation (luteal phase) · Low chance of pregnancy today, not zero" on Home, plus the fertile and ovulation
     marks on the calendar. No "needs approval" tag shows, because prototype labels are off by default.
   - **The maths uses the wrong numbers.** The NHS says ovulation happens "around 10 to 16 days before the next period" and sperm
     "can survive … for up to 7 days". Version 31 used 12–16 days and 5 days (`fertFor`, `chanceOn`; app.js:592–596). So on a
     28-day cycle, day 19 shows "Low chance" although it can be the ovulation day. Low shows on 16 of 28 days.
   - It shows to women who chose "Avoiding pregnancy", to condom users, and to pill users who never set their method. Neither the
     first run nor Change stage asks about the pill.
   - The wording (wording-review section 8) is unreviewed. MODULE_API section 33 itself says fertile days wait for "CDSCO's
     risk-class decision" (contraceptive apps are Class C) and the doctors' review.
   - **Fix:** turn them off for the test (decision 1). Correct the maths to 10–16 days and 7 days before any later release.
2. **After a pregnancy loss, Home says "Day 67, and no period yet" and suggests a pregnancy test.**
   - When she ends a pregnancy in the app, nothing records the date. `afterBirthNow` covers births only (app.js:559), so Home
     counts from her period before the pregnancy.
   - Its explanation lists "Pregnancy, if you have had sex since your last period" and "take a home test… test again in a week",
     although a test can stay positive for weeks after a loss.
   - From day 90 it says "See a doctor this month". The calendar draws a fertile window on the dates she was pregnant.
   - Days and My cycles also count a pregnancy, or the months after a birth, as one long cycle ("Day 139 of your cycle" at 20 weeks).
   - The loss page promises the opposite: "The diary then counts from your next period".
   - **Fix:** save the date the pregnancy ended. Treat it like a birth: no cycle day, late card or estimates until her next
     period, and Days shows the pause.
3. **A late period gets the wrong messages.**
   - From the day after her predicted start until her likely range ends, Home still says "Low chance of pregnancy today, not zero".
     In Hindi, "आज गर्भ ठहरने की संभावना कम" reads as "you're probably not pregnant", just when she should be pointed to a test.
   - The calendar keeps drawing the next cycle's fertile window, projected from a period that never came.
   - The first late advice waits until day 37, however short her cycles. With 22-day cycles, Home shows only "10 days past your
     likely range" for days with nothing to do (explain.js:126–128).
   - Home's own "A week or more late… a home test is the first step" card never shows.
   - The Hindi headline "संभावित समय से 6 दिन आगे" reads as "6 days early".
   - **Fix:**
     - once the predicted day has passed, drop the chance line and the next window;
     - show the late card at the end of her own range, with "If you could be pregnant, take a home test" and the ectopic warning;
     - Hindi: "पीरियड संभावित समय से {n} दिन देर से है".
4. **The after-birth "Daily recovery check" hides its warning signs behind "Show more".**
   - The long-card folding (app.js:3045–3056) folds the form at 260 px. Fits, calf pain, chest pain, breathlessness, fainting,
     bad-smelling discharge, sudden swelling and severe belly pain all sit under "Show more", with "Save" right below.
   - "None of these" then records "No warning signs".
   - **Fix:** never fold a card that holds choices (`data-nofold` on `.pst-form`, and skip cards with `[aria-pressed]` chips).
5. **Care near me calls private hospitals "Government hospital".**
   - The government list's "general hospital" type includes private ones: Indraprastha Apollo, Rockland, "(Pvt. Hospital)",
     nursing homes. About 60–70 of the 390 rows labelled "Government hospital" have private names.
   - A pregnant tester could go there expecting free care.
   - 14,503 of the 130,211 facilities sit more than 25 km from their own PIN code, so some distances and Directions are wrong. For
     PIN 110001, "about 2 km" is really about 12.5 km.
   - **Fix:** in `web/tools/care-data.mjs`, drop private-named "general hospital" rows (or label them "Hospital: ask if it's
     government"), and drop facilities far from their own PIN code. Then regenerate `web/care/`.
6. **An entry can be lost if Sakhi is closed within about a minute of saving.**
   - The browser engine inside the app writes saved data to disk in batches: the first change after about 5 s, later ones about
     once a minute.
   - The reviewer killed the engine 1 s and 8 s after a save, and the entry was lost both times. With report photos in the vault,
     writes are slower still.
   - Swiping Sakhi out of Recents, a restart, or Android closing it can lose what she just logged.
   - This was confirmed in Chromium, not yet on a phone. The two-minute phone check: log a period, add a note 10 s later, go Home,
     swipe Sakhi away within 30 s, and reopen.
   - **Fix:** on every save, also write a copy through the Android bridge (a file, or `SharedPreferences.commit()`), and at start
     load whichever copy is newer.
7. **A sample woman can replace her diary.**
   - In a "-demo" APK: Me → About → tap the version 5 times → "Show prototype labels" → tap a sample. That's 8 taps, with no
     question and no undo.
   - Holding Sakhi's picture on the Hello screen also opens the samples, and one tap loads one and skips signup.
   - **Fix:** testers get an APK without "demo" in its name, which removes both paths. Add the existing "this replaces your diary"
     question to the About path too.
8. **Reminder text shows on the lock screen by default.**
   - Unless discreet mode is on, notifications read "Qura Sakhi · Take your pill", "Antara injection due" and "Your period may
     start in the next few days. Keep a pad handy." Most phones show full notification text on the lock screen.
   - Even with the "Notes" icon, the notification header still says "Qura Sakhi".
   - **Fix:** neutral lock-screen text by default ("Sakhi: a reminder"), with the details only once the phone is unlocked.
     Turning on the Notes icon also turns on discreet mode.
9. **"Listen" sits on top of the day sheet's "next day" arrow, so tapping the arrow reads her diary aloud.**
   - It reads lines such as "Tue, 20 Oct. Cycle day 12. Period. Period started…". On a shared phone that is a privacy leak.
   - **Fix:** move the speaker out of the header row's way.
10. **"गर्भ में जाँच" on Get care free and the Doctor screen reads like a test of the baby in the womb.**
   - In India that sounds like sex determination (PCPNDT).
   - **Fix:** "गर्भावस्था में मुफ़्त जाँच".

## 3. Fix so the test isn't wasted

### 3.1 Signup
- **A server hiccup locks her out.**
  - When WhatsApp and SMS both fail (502 `send_failed`), the database errs (500), or a rate limit hits (429), she sees "Couldn't
    reach Qura. Check your internet" with no "Continue for now". Every screen except Help becomes the signup form.
  - Cause: the app takes the server's error word, so a 5xx with a body never counts as "offline" (app.js:1245, 1329).
  - A 500 on her name and PIN code drops them for good.
  - Fix: treat any 5xx and `too_many` like offline. Say "couldn't send a code" or "try again in N min".
- **"New code" after "Send by SMS" goes back to WhatsApp**, and each round uses up the 5-an-hour limit (app.js:1368).
- **Back plus "Send code" within 30 s** gives "Too many tries" with no countdown, and the first code then stops working.
- **Android may reload Sakhi while she reads the code in WhatsApp** (2–3 GB phones), and she's back at an empty number screen.
  Fix: keep the code step for 10 minutes.
- **A wrong code always says "Check the SMS"**, even when it came by WhatsApp. After 5 wrong tries, tell her to ask for a new code.
- **8–10 women signing up on one Wi-Fi can hit the server's limit** of 20 code requests per IP per hour. Raising it means a server
  deploy (decision 6). The easier way: each signs up on her own mobile data, or a few at a time.

### 3.2 Logging and dates
- **A double tap on "Period started" ends the period the same day.** The button turns into "Period ended" under her finger, and a
  later end can't replace the first one (app.js:1620–1628, 548).
- **Editing her start and picking "Ended" replaces the start with an end.** Home jumps from day 7 to "3 days past your likely
  range" (app.js:2252, 2264).
- **From day 11 of a long period, the big button only says "Period started"**, and one tap creates a 10-day "cycle". On days 6–10,
  Home already says "Before ovulation" while she may still be bleeding.
- **The app left open overnight shows yesterday:** the cycle day, countdown and "Today" in the strip (app.js:3137–3142). Fix:
  re-render on resume when the date has changed.
- **Two "next period" answers on Home:** "7 days until your next period" next to "Your period may come in about 2 days".
- **Old one-offs keep counting:**
  - One long period 9 months ago keeps "see a doctor this week" on Trends all year. Judge recent periods only.
  - One old odd gap changes today's chance, because the possible days use 12 gaps while the range uses 6. Use the same 6.
- **Stage changes give wrong advice:**
  - "Breastfeeding" never switches off when she goes back to tracking (app.js:1942). Predictions stay off for good, Home blames
    her gaps, and the heavy-bleeding checks stay off.
  - Choosing the pill in My method doesn't set those months aside (contra.js:722). After "None now", Home can show "High chance
    of pregnancy" from pill bleeds. Unticking hormones after an injection gives "61 days past your likely range… see a doctor"
    the same day.
  - "My periods have stopped" right after a logged period gives "Bleeding after your periods stopped · See a doctor this week"
    (explain.js:147).
- **Undo and delete:**
  - Undo after her first "Period started" also deletes her onboarding date.
  - "Delete this entry" has no undo, and leaves the period's end behind.

### 3.3 Reminders
- **Pill, iron and plan reminders never ring unless she turns on Me → Reminders → phone notifications**, which is off by default
  (app.js:2968–2972). My method says "Reminders show on Home and in your reminders list", and the phone gets 0 alarms.
  Fix: ask for notification permission the moment a tool turns a reminder on.
- **On the APK, the Reminders page says reminders come "in one WhatsApp message" and "In this prototype nothing is sent"**
  (tools.js:37–39, 288). Fix: say they ring as phone alarms.
- **Xiaomi, Vivo, Oppo and Realme need "Autostart" for reminders to survive a restart**, and their "clear all" cancels them. The
  help card mentions only the battery setting. Add the steps to the tester note (section 6).

### 3.4 Words that look unfinished, or promise what the build can't do
- **"Prototype", "browser" and "draft" wording:**
  - "Prototype: this stays on this phone" (contra.js:906, 719);
  - "photos stay only in this browser… Clearing the browser deletes them" (tools.js:100);
  - "This prototype does not connect" (tools.js:139);
  - "your browser may keep a list of pages" (intimate.js:456);
  - "Draft for doctor review" on Preparing for birth (pregtools.js:127);
  - "Partly translated in this prototype" (app.js:123).
- **The privacy notice she agrees to at signup** ends "Grievance Officer: [NAME, ADDRESS]" and "The live app will name every
  processor…". It doesn't say that her number goes through WhatsApp (Meta) or AuthKey for the code. Needs decision 5.
- **"How Qura helps" shows "registration number [to be added before this page goes live]".** Dr. Megha's number is marked
  unverified.
- **Two screens contradict the review status:**
  - the after-birth screens say the content is "to be checked by Qura's doctors and an independent gynaecologist before launch";
  - Pattern check says "Signed by Qura's doctors…" next to "Doctor's verdict: Pending review".
- **"Speak to a doctor" opens Qura's booking website.**
  - Nothing there says Ayurveda (BAMS), or that tests and plans cost money. The only cost line is "the first 20-minute call is
    free".
  - It's also offered on findings that say "see a doctor today".
  - See decision 4.
- **Two switches in Me do nothing in this build:**
  - "Share with my Qura doctor" records consent, but nothing is shared;
  - "Send what helps" goes to a server route that isn't deployed, which answers 404, and the counts are dropped.
  - Hide both for the test.
- **The PMMVY helpline is 1515**, which replaced 14408 on 1 Nov 2025 (Ministry of Women and Child Development). The app still
  says 14408 (access.js:252).

### 3.5 Deleting and the lock
- **"Delete everything on this phone" leaves her account signed in.** The next person to set Sakhi up skips signup and sees her
  name, number and PIN code. Her reminders also keep ringing, and come back after a restart (app.js:2975).
- **A forgotten PIN can only be cleared by deleting everything.**
  - A backup code restores the forgotten PIN along with the diary.
  - "My family uses it" asks for a PIN in her first minute, over the signup screen.
  - Fix: restoring a backup drops the PIN, and "Forgot your PIN?" offers "restore from my backup code" first.

### 3.6 Android
- **The phone's Back button closes Sakhi mid-onboarding and mid-signup**, and her answers are lost. After the app's own ← arrow,
  Back replays screens forward. Fix: step back through onboarding, signup and the app's own history.
- **Back, Home and Recents are white on a cream bar in light mode** on phones with 3-button navigation, which many Samsung and
  budget phones use (res/values/styles.xml has no `windowLightNavigationBar`; read from the code, not yet seen on a phone).
  Mohit's Flip5 is in dark mode, so it looks fine there.
  Fix: add `res/values-v27/styles.xml`.
- **Old WebViews:**
  - If app.js can't run, the screen is blank with no message.
  - Below Chrome/WebView 87, bottom sheets (logging a day, SOS) open off-screen, because of the CSS `inset` property.
  - Fix: a plain "please update Android System WebView" line that start-up replaces, and longhand positions before each `inset`.
    Also ask testers to update WebView and Chrome first.
- **The build script falls back to versionCode 1 and makes a new signing key if the file is missing.** Either way the next update
  won't install over the testers' app, and uninstalling deletes the diary. Fix: the script stops in both cases. Back up
  `android/sakhi-prototype.keystore` and its password off this Mac today.
- **`VIBRATE` isn't in the manifest**, so the kick counter's and pelvic-floor cues never vibrate. It's a one-line, no-prompt fix.

### 3.7 Hindi (each with the corrected Hindi in the reviewer's notes)
- **Search "गर्भ" gives a pregnant woman miscarriage and abortion first.**
  - "ओव्यूलेशन", "फ़र्टाइल" and "फर्टाइल" find nothing.
  - Fix: TOOL_SYN rows for pregnancy, keywords on the fertile tile, and drop the nukta in `norm()`.
- **Wrong ordinals** "1वाँ, 2वाँ, 3वाँ, 6वाँ" in the after-birth weeks, months of trying, the report and family. Say "हफ़्ता {n} (6 में से)".
- **The calendar legend says "संभावित अंतर" (likely gap)** for the likely period days. It should be "पीरियड की संभावित तारीख़ें".
- **Meaning fixes in Version 29–31 lines:**
  - "बिना तरीक़े के" → "बिना गर्भनिरोधक के"
  - "मेरे पास इलाज" → "मेरे आसपास इलाज"
  - "30 से मुफ़्त" → "30 साल की उम्र से मुफ़्त"
  - Days' headings, "बस हो गया", "ORS:" (reads as rehydration salts), and "Qura के डॉक्टर" → "की"
- **One spelling each for फ़र्टाइल, ओव्यूलेशन and "सेफ़ डेज़ (सुरक्षित दिन)"**, in the app and the library.
- **The teen-mother page addresses her as masculine** ("कह सकते हैं" → "सकती हैं").

## 4. Decisions for Mohit

1. **Fertile days and chance of pregnancy in the testers' APK.**
   - Recommended: off for this test, by building `0.32-test` without "demo". That also removes the sample women. Turn them on after
     the doctor signs off on section 8 with the corrected NHS figures, and then only for women who chose "Trying for a baby", with
     no "Low" label.
   - The alternative is to keep them on now. That goes against the rule that new health wording is reviewed first.
2. **The doctor's review before the test.**
   - Sections 1, 3, 5.1–5.5, 6, 7 and 8 of `wording-review-v28.md` are open, and no sign-off is recorded anywhere.
   - Recommended: have the doctor read sections 6–8 first (Versions 29–31), at least what testers will see.
   - The alternative is to run a small known group as a pilot and accept the risk. That's Mohit's call.
3. **The 21 "Needs approval" self-check and triage tools:**
   - PMOS pattern check, "Should I get this checked?", the discharge checker, cancer warning signs, lab-result flags, the PBAC
     chart;
   - the kick counter, labour timer, after-birth mood check, perimenopause score;
   - the abortion law and weeks counter, months of trying.
   They're visible and untagged (decision D2 of 22 Oct). Recommended: hide them for testers, or get them signed.
4. **Help path.**
   - Option 1: build with `SAKHI_HELP_WA` (Qura's staffed WhatsApp), so "Tell a person" and "Speak to a doctor" reach a person.
     Someone at Qura must then answer testers.
   - Option 2: keep the booking site, but say "Ayurveda (BAMS) clinic · first call free · tests and plans are paid", and put the
     free government doctor first.
5. **The privacy notice:**
   - the Grievance Officer's name and address;
   - how long account details are kept;
   - the processors (Supabase in Mumbai for the account; WhatsApp/Meta and AuthKey for the code).
6. **The server's 20-per-hour limit.**
   - Raising it means deploying the function, which also switches on the undeployed "what helps" route.
   - Recommended: no deploy; testers sign up on their own mobile data, or a few at a time.

## 5. Can wait until after the test
- **Storage:**
  - A damaged saved diary makes the app start over without a word, and her first tap overwrites it.
  - A full store stops saving silently.
  - A diary with an empty field blanks Home, Care and Me.
- **The backup code is too long with report photos:** 754,665 characters, while WhatsApp takes 65,536.
- **The lock allows unlimited PIN guesses.**
- **Signing out or deleting the account puts her own diary behind the signup screen.**
- **Large phone fonts:**
  - The logo becomes "Sakh" at 125%.
  - At 200%, the ring label, the "Today" chip and the onboarding decade chips overlap or overflow.
- **The tab bar** stays above the keyboard and can cover the field she's typing in.
- **Discreet mode:**
  - The calendar's predicted period days and the Fertile days page still show.
  - The share sheet is still titled "Report for my doctor".
- **Fertile days for steady cycles outside 21–35 days, and the 9-day spread at some ages** (a question for the doctor's review).
- **Read-aloud:**
  - A false "no Hindi voice" in the first 1.5 s.
  - A listed but not downloaded voice fails silently.
- **Dark phone, light app:** dark bars around a light page. "Save as PDF" in the dark theme gives a dark page.
- **Weekly iron says "Taken this week. Well done." right after she starts.**
- **"When can I test?" uses a different due date from Home.**
- **"1 days so far", and a negative cycle day when the phone's clock is wrong.**
- **Marathi, Bengali, Tamil and Telugu** still say "fertile or safe days are not shown".
- **420 Hindi strings mix in Latin-script words** (test, scan, save, pad and so on): one spelling pass.
- **Heavy-bleeding urgency differs between screens** (this week, today, 112). The doctor picks one rule.
- **Severe belly pain in pregnancy isn't on the "call 112" list** (doctor). 104, 102 and 108 should say "in most states".
- **Care data junk:**
  - 13 facilities named "NA";
  - 3,308 PINs not in India Post's list;
  - 562 exact duplicates.
- **Letrozole is called "first-line"** (sources-cleanup item 3, still open).

## 6. Handing it out: the field-test kit
**Before building**
- Back up `android/sakhi-prototype.keystore` and its password somewhere off this Mac. Every update must be signed with it.
- Commit Version 31, then Version 32.
- Build with a name without "demo" and versionCode 34 or more:
  ```
  cd android && SAKHI_API=https://jovplellzaxebcdekpax.supabase.co/functions/v1/sakhi-api VERSION_CODE=34 VERSION_NAME=0.32-test ./build-apk.sh
  ```
- Send only `QuraSakhi-prototype.apk` (5.3 MB), not the `.idsig`.
- Make sure the Supabase project isn't paused: free projects pause after a week without use.

**A one-page note for each tester (Hindi and English)**
- What it is: a test version from Qura. Her diary stays on her phone. Her number, first name, PIN code, birth year and (if she
  gives it) email go to Qura for her account. It isn't medical advice.
- Before installing: update "Android System WebView" and Chrome in Play Store.
- Installing:
  - open the APK from WhatsApp and allow "Install unknown apps";
  - if Play Protect asks, tap "Install anyway".
- Sign up on her own mobile data, not shared Wi-Fi.
- Reminders:
  - turn on Me → Reminders → phone notifications, and allow "Alarms & reminders";
  - on Xiaomi, Redmi, Vivo, Oppo or Realme, also allow Autostart and set the battery setting to "No restrictions".
- Updates: install the new APK over the old one. Never uninstall: uninstalling deletes the diary.
- Screenshots for feedback: with the app lock, discreet or family mode on, Android blocks screenshots. She can describe the
  screen instead.

**What to ask**
- **Day 1:**
  - Did install and signup work?
  - Which words were unclear?
- **Week 1:**
  - Did she log, and could she fix a mistake?
  - Did reminders ring?
- **After her next period:**
  - Did the dates make sense?
  - Did she trust them?
- Throughout: anything that felt wrong, scary or too much.

## 7. The doctor's review: where it stands
- `docs/wording-review-v28.md` has no status column, and no sign-off is recorded anywhere. Sections 1, 3, 5.1–5.5, 6, 7 and 8
  are open. 5.3 still has the PMMVY one-or-two check-ups question.
- **Missing from section 8, for Version 31:**
  - "Likely range, never one day" became "Likely range", while Home now counts down to one day;
  - the fertile screen now names one ovulation date;
  - the verdict has variants section 8 doesn't show ("21 to 45 days apart", "varying by 9 days or less");
  - "Low chance" also shows on period days, on late days, on past days in Days, and to women avoiding pregnancy.
- **Section 8 states the NHS figures wrongly:** "12 to 16 days" should be 10 to 16, and sperm survive up to 7 days. Correct it
  before the doctor reads it.
- **Added since 20 Oct but in no section:**
  - the "cadence" note ("Heavy bleeding with dizziness, one-sided pain with fainting… call 112 now");
  - "This is not for emergencies";
  - the ASHA and ANM lines.
- **The 7 "Please check first" items in `sources-cleanup-2026-10-22.md` are still open.**

## 8. Checked and working
- **Install:**
  - minSdk 24 and targetSdk 34 are above the install floors of Android 14 and 15.
  - Only 4 ordinary permissions, none on India's Play Protect sideload block list.
  - Not debuggable; v2+v3 signature; the APK matches the tree byte for byte.
- **Storage:** the signing key has never been in git, and the repo is private. The same key and a higher versionCode update in
  place and keep the diary.
- **Privacy:**
  - Only `net()` calls the server, with the allowed fields. Nothing goes to Meta, and there's no health data in any link.
  - Discreet mode: neutral, lock-screen-hidden reminders, "My notes" PDFs, and blocked screenshots.
  - The app lock locks after 30 s away, and Recents thumbnails are hidden on Android 13+.
- **Signup:**
  - Number formats like "+91 98765 43210", "098765 43210" and "91-98765-43210" all work.
  - The SMS fallback works; codes expire after 10 minutes with 5 tries.
  - Under-18s are refused on the phone and by the server.
  - Offline, timeouts and gateway errors offer "Continue for now". Sessions last a year.
- **Cycle maths:**
  - Correct for 21 shapes, Dec→Jan and 29 Feb.
  - A future start is refused, and repeated starts merge.
  - Pregnancy switches estimates and alarms off. "Periods stopped" works both ways.
  - The verdict thresholds match the library (21–35 days; 2–7 days, more than 8 long; a spread of 7 or 9).
  - No screen calls a day safe.
- **Warning signs and helplines:**
  - All the red flags are present, each with what to do and where.
  - Helplines 112, 108, 102, 104, 181, 1098, 1097, 14416, 14490, 15100, 14555, 1930 and the 1800 numbers are correct.
  - The amounts for JSY, JSSK, PMSMA and PMMVY are correct. 10 Learn articles spot-checked.
- **Hindi:** all 3,737 strings and all 69 articles. No raw keys, clipped text or sideways scroll at 360 px. She's addressed as a
  woman in Versions 29–31.
- **Everyday use:**
  - Every stage in the first run; the full tour; logging and Undo.
  - Care near me PIN checks; search in Hindi and Hinglish.
  - The report: Share, Copy, Save as PDF.
  - Reminders, once turned on: 21 days ahead, re-set after a restart or an update.

Reviewers' probes and screenshots: the session scratchpad, `audit/` (wiped when the Mac restarts). Each finding above names its
file and line, so it can be rebuilt as a test in the repo when it's fixed.
