Qura Sakhi - Android app (prototype)

QuraSakhi-prototype.apk  The installable app (also copied to the QuraSakhi folder). About 780 KB.
                         It contains the whole prototype and the Learn library, so it works offline.
                         Fonts load from Google when online; without internet it uses the phone's fonts.

Install on a phone
  - By USB: plug the phone in (USB debugging on) and run ./build-apk.sh, or: adb install -r QuraSakhi-prototype.apk
  - Without a cable: send the APK to the phone (WhatsApp to yourself, Drive, email), open it, and allow
    "install unknown apps" for that app when Android asks.

Rebuild after changing the prototype
  ./build-apk.sh      (takes the files from "../web", builds, signs, installs if a phone is plugged in)
  Needs the Android SDK installed on 18 Oct 2026: /opt/homebrew/share/android-commandlinetools
  (platform android-34, build-tools 35.0.0) and Java 21 (/opt/homebrew/opt/openjdk@21).
  Bump the version for each new build:  VERSION_CODE=2 VERSION_NAME=0.2-prototype ./build-apk.sh

What is in here
  AndroidManifest.xml     App id com.quranutrition.sakhi, name "Qura Sakhi", internet permission only.
  src/.../MainActivity.java  Full-screen WebView; phone back button; links open in Chrome; photo picker for
                          the reports vault; read-aloud through Android text-to-speech; copy to clipboard.
  web/android-shim.js     Connects the web app's read-aloud and copy buttons to the Android side.
  res/                    Icon (berry heart) and light/dark themes.
  sakhi-prototype.keystore  Prototype signing key (password: android). Fine for testing only.

Before the Play Store
  - Make a real release key and keep it safe (losing it means you can never update the app).
  - Target the API level Google Play requires at the time of upload.
  - Privacy policy URL, Data safety form, health-app declarations, and the compliance items in the product document.
