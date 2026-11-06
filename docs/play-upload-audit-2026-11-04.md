# Before Sakhi's first upload to Google Play: audit, 4 Nov 2026

Checked against:
- the repo at HEAD 302ccbc (Version 39.66), with the uncommitted working tree;
- the last APK built (vc 118, `0.39.66-pilot`);
- the live website;
- Google Play's current policies.

The Play account (Trinaya Wellness LLP, "Qura Sakhi") is fully verified, and **no app has been created yet**.

**Verdict: not ready to upload yet.**
- Part A, in the app and build: 4 items. Items 1, 2 and 4 must be done before any upload; item 3 before a public release.
- Part B, outside the app: 3 items, needed before review.
- Part C: Play Console's forms and the store listing, filled in once A and B are done.

| | Item | Blocks | Who |
|---|---|---|---|
| A1 | The Android 16 build has never run on a phone, and isn't committed | Any upload | Claude builds; Mohit tests |
| A2 | A fresh Play bundle from the current app, and the build type decision | Any upload | Claude builds; Mohit decides the type |
| A3 | Health wording still waiting for the doctor | Public release | Dr. Megha / gynaecologist |
| A4 | Two disclaimers Play requires: not a medical device, and not affiliated with the government | Review | Claude adds; Mohit approves |
| B1 | The privacy and account-deletion pages, and the Sakhi page itself, are 404, and they don't mention PostHog | Review | Qura website session |
| B2 | Reviewer login: server code uncommitted and not deployed | Review | Mohit deploys |
| B3 | Grievance Officer details, the PostHog consent question, and CDSCO for a public listing | Public release | Mohit and counsel |

---

## A. In the app and the build

### A1. The Android 16 build has never run on a phone (blocker)

- Since 31 Aug 2026, Play only accepts apps that target Android 16 (SDK 36). The work for that was done on 29 Oct and is
  still **uncommitted** in the working tree:
  - targeting SDK 36;
  - edge to edge;
  - Back through the new API;
  - `PLAY=1` builds a bundle;
  - the upload key;
  - the reviewer route.
- Every APK built since then came from the committed code, which still **targets SDK 34**. That includes vc 118, installed
  on your Flip5 today. So the SDK-36 code has never run on a phone.
- On Android 15 and 16, targeting SDK 36 changes two things everywhere in the app:
  - **Edge to edge.** The page could slide under the status bar, the camera cut-out or the gesture bar, and the keyboard could
    cover the signup and search boxes. MainActivity now pads the page clear of all four, untested.
  - **Back.** Android 16 no longer calls the old Back handler. The new callback is in place, untested.

**To do:**
1. Commit the Play work (it needs your OK).
2. Build vc 119 at SDK 36 with the prototype key, so it installs over your current app with your diary kept.
3. Run it on the Flip5. Check:
   - the top and bottom bars, on both screens;
   - the keyboard on signup and search;
   - Back: closing a sheet, going back a screen, leaving from Today, with both gestures and 3-button navigation;
   - Wind down playing with the screen off;
   - a reminder;
   - the discreet "Notes" icon;
   - the reports file picker, Print, voice typing and the fingerprint lock.

### A2. A fresh Play bundle, and which build type goes to Play (blocker)

- The only bundle so far is vc 65, from 29 Oct, which is 53 builds old. The new one needs:
  - vc 119 or higher, built with `PLAY=1`;
  - the live server (`SAKHI_API`) and PostHog (`SAKHI_PH`);
  - `SAKHI_GRIEVANCE` once you have the Grievance Officer's details (B3).
- **The build type is decided by its version name, and that's your decision:**
  - **"-pilot"** has every tool on: the self-checks and triage tools, and fertile days. Your lawyer's 23 Oct advice covers a
    pilot. It suits **closed testing** with known testers.
  - **A plain name** (e.g. `1.0`) holds back the triage tools and fertile days until clinical sign-off. It suits a **public
    release** until the CDSCO question (B3) is answered.
  - Testers see the version name, so "0.39.66-pilot" is fine for a test track. A public listing should carry a clean name.

### A3. Health wording still waiting for the doctor (blocker for a public release)

- Your rule: content was verified on 20 Oct, and new health wording needs a doctor's review before it ships.
- Since then, about 28 build sections have shipped lines marked "waits for doctor review": Versions 33 to 39.66, the plans,
  the pregnancy, after-birth and midlife lines, and the doctor ladder's sign map. Some also need a psychologist or a
  physiotherapist.
- The feature review page for Dr. Megha (499 rows: keep 423, remove 56, amend 14, defer 6) is still open.
- Testers on a closed track get the same content as the pilot APK today, so a closed track can go ahead.
- A **public** listing shouldn't go live until this review is done and its removals and amendments are built. Google's
  health-misinformation policy also makes unreviewed clinical lines a review risk.

### A4. Two disclaimers Play asks for (needed for review; small)

- **Medical:** an app that isn't a regulated medical device must say in its store description that it "is not a medical
  device and does not diagnose, treat, cure, or prevent any medical condition", and remind users to consult a healthcare
  professional.
  - The app itself has scattered "not a diagnosis" lines, but no general statement.
  - Add one line to About and privacy, and to the joining notice, in English and Hindi. It's a disclaimer, not health advice.
- **Government information:** Sakhi shows government schemes, free check-ups and Care near me facilities from data.gov.in.
  - Play asks apps that aren't affiliated with a government to say so, and to show their sources, in the description and
    store listing.
  - Add "Sakhi isn't affiliated with any government; scheme details link to the official source" to the description, and the
    same line on the schemes page.
  - Never use the national emblem or the word "official" in the listing.

### Already fine (no change needed)

- No self-update or APK-download links in the app, and no native code, so the 16 KB page-size rule doesn't apply. The app
  isn't debuggable.
- The size is fine: vc 118 is 25.6 MB, well under Play's limits.
- Demo builds can't go to Play: `PLAY=1` refuses a "demo" name, so no sample women.
- The prototype settings exist only in demo builds. The picture check shows only in pilot builds.
- Account deletion is in the app: Me, then her name, then Delete my account.
- Permissions are all justified:
  - internet, vibrate, notifications;
  - restart, to put reminders back;
  - exact alarms;
  - the media-playback foreground service, for Wind down;
  - wake lock.
- There's no advertising ID, and PostHog doesn't use one.

### Review risks to explain in the reviewer notes

- **The discreet "Notes" icon.** The app can switch its home-screen icon to a plain yellow "Notes" icon. Play's
  deceptive-behaviour policy watches for apps that disguise themselves.
  - It's a real safety feature for women on shared phones, and the icon is generic, not a copy of Samsung's or Google's.
  - Say so in the review notes (App access), so the reviewer doesn't read it as impersonation.
- **Wind down's background sound** uses a media-playback foreground service. Play Console asks for a short description and
  a video of the sound playing on with the screen off.

---

## B. Outside the app, needed before review

### B1. The website pages are 404, and their draft doesn't mention PostHog

- On 4 Nov, `quranutrition.com/sakhi`, `/sakhi/privacy` and `/sakhi/delete-account` all return **404**. The Qura session's
  pages aren't live. Play needs both the privacy policy URL and the deletion URL.
- **The 29 Oct draft is now out of date.** It says the app has "no trackers". Since Version 39.60, PostHog is on by
  default:
  - it sends screen views, time on each screen, tap positions and errors to PostHog in Europe;
  - each phone gets an anonymous ID;
  - she can turn it off in Me.
- The privacy page needs a PostHog section that matches the in-app notice (`ob_notice_6` and `ph_d`). Then:
  - the "no trackers" lines change to "no advertising trackers";
  - PostHog joins the list of providers.
- The **Data safety** answers change too. Collected, not shared, because PostHog acts for Trinaya:
  - App activity, App interactions: Analytics;
  - Device or other IDs (the anonymous ID): Analytics;
  - App info and performance, Diagnostics (the errors): Analytics.
- Screen names can show her stage (the in-app note says so), so declaring **Health info** for Analytics as well is the safer
  reading.
- Mark these "optional", since she can turn it off.

### B2. Reviewer login (needed for review)

- Google's reviewers can't get a WhatsApp or SMS code on an Indian number. The route that lets them in has three parts, none
  of them live yet:
  - the code (`server/SERVER_SPEC.md` 5.1a) is written and tested, but uncommitted;
  - the server needs deploying with it;
  - the two secrets need setting (`server/DEPLOY.md`, section 3, step 5).
- Then add the number and code in Play Console, under App access.

### B3. Decisions for you and your lawyer

- **The Grievance Officer** (name, address, email): the app's notice, the privacy page and the deletion page all wait for
  it. It's required under India's IT Rules and the DPDP Act.
- **PostHog on by default:** the DPDP Act wants consent by "a clear affirmative action".
  - Sakhi has an off switch, a line in the joining notice, and no name or number.
  - Ask your lawyer whether on-by-default analytics in a health app meets that, or whether it should be asked for at joining.
- **CDSCO:** does the pilot exemption cover a public Play listing? Until there's an answer, use a closed track with the
  "-pilot" build, or a public release with the plain build (A2).

---

## C. Play Console forms and the store listing, once A and B are done

| Form | Answer |
|---|---|
| Privacy policy | https://quranutrition.com/sakhi/privacy, once it's live (B1) |
| App access | Reviewer number and code (B2); notes on discreet mode and the Notes icon |
| Ads | No |
| Content rating (IARC) | Answer honestly: sexual-health education, the sex log, contraception and abortion information. Expect an adult rating. |
| Target audience | 18 and over |
| Data safety | `docs/play-store-pages-2026-10-29.md`, Part 2, **plus the PostHog rows above** |
| Health apps | The 14 categories in that document; Medical device: No (after counsel) |
| Government apps | No (Sakhi isn't run by a government) |
| Financial features | None |
| Foreground service | Media playback (Wind down), with the video |
| Advertising ID | Not used |
| Store listing | App name "Qura Sakhi"; short description (80 characters) and full description, with both disclaimers (A4); category Health & Fitness; free |
| Graphics | Icon 512 × 512 (`android/icon-512.png` exists); **feature graphic 1024 × 500 (needed)**; **phone screenshots, 2 to 8**. The ones in `marketing/download-page/shots` are from 23 Oct and predate the glass look and the plans, so make new ones. |

**Release order:**
1. **Internal testing**: you and a few staff, no review wait. Check the Play-signed build installs and works.
2. **Closed testing**: the pilot testers. They move their diary with "Move to a new phone", because Play signs with a
   different key from the prototype APK.
3. **Production**, after A3 and B3.

The organisation account doesn't need the 12-tester, 14-day test.

**Keep safe:** the upload key `android/sakhi-upload.keystore` and its keychain password ("Qura Sakhi upload key"), backed up
off this Mac.

## What Claude can do next, on your go

1. Commit the Play work, build vc 119 at SDK 36, and install it on the Flip5 when it's connected (A1).
2. Add the two disclaimer lines in English and Hindi, with a test (A4).
3. Update the website prompt and the Data safety answers for PostHog (B1).
4. Draft the store descriptions, and make fresh screenshots and a feature graphic (C).
5. Build the Play bundle once you pick the build type (A2).

Sources:
- [Health Content and Services](https://support.google.com/googleplay/android-developer/answer/16679511?hl=en)
- [Requirements for apps that communicate government information](https://support.google.com/googleplay/android-developer/answer/9514050?hl=en)
- [Provide information for Google Play's Data safety section](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)
- [User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en)
- [Deceptive Behavior](https://support.google.com/googleplay/android-developer/answer/17006354)
