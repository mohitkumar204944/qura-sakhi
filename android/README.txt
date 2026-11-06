Qura Sakhi - Android app (prototype)

QuraSakhi-prototype.apk  The installable app (also copied to the QuraSakhi folder). About 5 MB, most of it the Care near me
                         data. It contains the whole app, its fonts and the Learn library, so it works offline; only signup
                         talks to the accounts server.

Install on a phone
  - By USB: plug the phone in (USB debugging on) and run ./build-apk.sh, or: adb install -r QuraSakhi-prototype.apk
  - Without a cable: send the APK to the phone (WhatsApp to yourself, Drive, email), open it, and allow
    "install unknown apps" for that app when Android asks.

Rebuild after changing the prototype
  ./build-apk.sh      (takes the files from "../web", builds, signs, installs if a phone is plugged in)
  Needs the Android SDK in /opt/homebrew/share/android-commandlinetools: platform android-36 and build-tools 36.0.0
  (added 29 Oct 2026 for Google Play's target SDK 36), and Java 21 (/opt/homebrew/opt/openjdk@21).
  VERSION_CODE is required and may not go below the last APK built; testers' phones refuse a lower one, and uninstalling
  deletes the diary. Testers get a build without "demo" in its name (it needs SAKHI_API, the server's https address):
    SAKHI_API=https://jovplellzaxebcdekpax.supabase.co/functions/v1/sakhi-api VERSION_CODE=34 VERSION_NAME=0.32-test ./build-apk.sh
  The pilot build (Version 33) has every tool on, fertile days and the self-checks included, with no sample women. The
  last one built is versionCode 65 (0.39.33.1-pilot: Version 39.33's app on target SDK 36), built without installing:
    PATH=/usr/bin:/bin:/usr/sbin:/sbin SAKHI_API=https://jovplellzaxebcdekpax.supabase.co/functions/v1/sakhi-api VERSION_CODE=65 VERSION_NAME=0.39.33.1-pilot ./build-apk.sh
  It needs Android 10 or newer (min SDK 29; Mohit, 25 Oct: newer phones only). The build stops above 30 MB unless
  MAX_APK_MB is raised on purpose.

What is in here
  AndroidManifest.xml     App id com.quranutrition.sakhi, name "Qura Sakhi"; internet (signup), notifications, restart,
                          exact alarms and vibrate permissions.
  src/.../MainActivity.java  Full-screen WebView; phone back button; links open in Chrome; photo picker for
                          the reports vault; read-aloud through Android text-to-speech; copy to clipboard.
  web/android-shim.js     Connects the web app's read-aloud and copy buttons to the Android side.
  res/                    Icon and light/dark themes. The icon is Sakhi's logo (Mohit, 6 Nov 2026), icon-src/sakhi-logo.webp:
                          the mark without the word, as an adaptive icon (white background, the mark inside the safe
                          circle), plus icon-512.png for Google Play. Remake all of them with: python3 make-icons.py
  sakhi-prototype.keystore  Prototype signing key (password: android), not in git. Back it up off this Mac: every update for
                          testers must be signed with it, and the build stops if it is missing (NEW_KEYSTORE=1 only for a
                          first build that no phone has).

Google Play (29 Oct 2026)
  The app targets SDK 36 (Android 16), Play's floor for new apps and updates since 31 Aug 2026. On Android 15 and later the
  window is edge to edge, so MainActivity pads the page clear of the status bar, the camera cut-out, the navigation bar and the
  keyboard. Back comes through OnBackInvokedCallback on Android 13 and later (enableOnBackInvokedCallback in the manifest), and
  through onBackPressed on Android 10 to 12. Both call the same back().

  Play takes an Android App Bundle (.aab), not an APK:
    PLAY=1 SAKHI_API=https://jovplellzaxebcdekpax.supabase.co/functions/v1/sakhi-api VERSION_CODE=65 VERSION_NAME=0.39.33.1-pilot ./build-apk.sh
  - It writes build-play/QuraSakhi-<name>-<code>.aab (not in git), installs nothing, and leaves QuraSakhi-prototype.apk alone.
  - It needs bundletool 1.18.3 at $SDK/bundletool/ (from github.com/google/bundletool, 29 Oct 2026).
  - It refuses a demo name. The name decides the tools, as for an APK: "-pilot" has every tool on, while a plain release name
    (e.g. 0.40) holds back the triage tools and fertile days until clinical sign-off (MODULE_API sections 34 and 35).
  - It checks the bundle with bundletool and the APK a phone would get from it: target SDK 36, the sounds stored
    uncompressed (bundle-config.json; Android plays them straight from the app), and the 30 MB ceiling.
  - Version codes are one count for APKs and bundles: the floor check reads both QuraSakhi-prototype.apk and build-play/last.apk.

  The upload key: sakhi-upload.keystore (made 29 Oct 2026 by make-upload-key.sh, alias "upload", not in git). Its password is
  only in this Mac's keychain, as "Qura Sakhi upload key"; the build reads it from there (or from SAKHI_UPLOAD_PASS).
  - Back up the file and the password off this Mac (a password manager).
  - Play App Signing keeps the key that signs what phones install. The upload key only proves an upload is ours: if it is
    lost, Play Console can reset it (it takes a few days).
  - Its certificate's SHA-256: 66:7A:C0:80:1C:EE:E1:19:E6:12:90:2F:54:85:9B:95:11:E8:8A:05:90:E0:CA:F5:F7:23:6D:98:F6:1D:49:D5

  Testers with the prototype APK can't update to Play's build in place (another key). They use "Move to a new phone" in Me
  to make a backup code, uninstall, install from Play, and restore.

  Google's reviewers sign in with one number and a fixed code (server/SERVER_SPEC.md, section 5.1a; server/DEPLOY.md,
  section 3, step 5).

  Still needed outside the code: the Play Console account (organisation, D-U-N-S), the privacy policy and account deletion
  web pages, the Data safety form, the health apps declaration, the foreground service declaration for Wind down's
  mediaPlayback service (a short video of the sound playing on with the screen off), and the store listing.
