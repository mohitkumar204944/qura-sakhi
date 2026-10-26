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
  Needs the Android SDK installed on 18 Oct 2026: /opt/homebrew/share/android-commandlinetools
  (platform android-34, build-tools 35.0.0) and Java 21 (/opt/homebrew/opt/openjdk@21).
  VERSION_CODE is required and may not go below the last APK built; testers' phones refuse a lower one, and uninstalling
  deletes the diary. Testers get a build without "demo" in its name (it needs SAKHI_API, the server's https address):
    SAKHI_API=https://jovplellzaxebcdekpax.supabase.co/functions/v1/sakhi-api VERSION_CODE=34 VERSION_NAME=0.32-test ./build-apk.sh
  The pilot build (Version 33) has every tool on, fertile days and the self-checks included, with no sample women. The
  last one built is versionCode 47 (0.39.13-pilot, Version 39.13 the cycle plan's 4 steps), built without installing:
    PATH=/usr/bin:/bin:/usr/sbin:/sbin SAKHI_API=https://jovplellzaxebcdekpax.supabase.co/functions/v1/sakhi-api VERSION_CODE=47 VERSION_NAME=0.39.13-pilot ./build-apk.sh
  It needs Android 10 or newer (min SDK 29; Mohit, 25 Oct: newer phones only). The build stops above 30 MB unless
  MAX_APK_MB is raised on purpose.

What is in here
  AndroidManifest.xml     App id com.quranutrition.sakhi, name "Qura Sakhi"; internet (signup), notifications, restart,
                          exact alarms and vibrate permissions.
  src/.../MainActivity.java  Full-screen WebView; phone back button; links open in Chrome; photo picker for
                          the reports vault; read-aloud through Android text-to-speech; copy to clipboard.
  web/android-shim.js     Connects the web app's read-aloud and copy buttons to the Android side.
  res/                    Icon (berry heart) and light/dark themes.
  sakhi-prototype.keystore  Prototype signing key (password: android), not in git. Back it up off this Mac: every update for
                          testers must be signed with it, and the build stops if it is missing (NEW_KEYSTORE=1 only for a
                          first build that no phone has).

Before the Play Store
  - Make a real release key and keep it safe (losing it means you can never update the app).
  - Target the API level Google Play requires at the time of upload.
  - Privacy policy URL, Data safety form, health-app declarations, and the compliance items in the product document.
