#!/bin/sh
# Builds QuraSakhi-prototype.apk from "../web": this script puts the web app in build/assets, then Gradle (./gradlew, the
# version pinned in gradle/wrapper; build.gradle.kts) makes and signs the app in build-gradle/ (Version 39.79).
# With PLAY=1 it builds the Android App Bundle for Google Play instead (see "Google Play" in README.txt).
# Needs: Android SDK platform android-36 + build-tools 36.0.0, and a JDK (Java 17+); PLAY=1 also needs bundletool, for its checks.
# Gradle and its Android plugin are downloaded once, on the first build, into ~/.gradle.
set -e
cd "$(dirname "$0")"
# Version 40 (prototype): Ask Sakhi, the chat (../server/SERVER_SPEC.md section 12). SAKHI_CHAT is the sakhi-chat function's address,
# e.g. https://jovplellzaxebcdekpax.supabase.co/functions/v1/sakhi-chat. It makes a test app for team phones only: never a Play
# build, a version name with "ask-proto", the same server as SAKHI_API (one address in the page's CSP), its own app ID
# (com.quranutrition.sakhi.ask, so it installs beside the Play app), no Firebase, the label "Sakhi Ask test", and its own file,
# QuraSakhi-ask-prototype.apk. Never put it on the website or on Play.
SAKHI_CHAT="${SAKHI_CHAT:-}"
PKG="com.quranutrition.sakhi"; OUT_APK="QuraSakhi-prototype.apk"
if [ -n "$SAKHI_CHAT" ]; then
  [ "$PLAY" = "1" ] && { echo "Ask Sakhi is a prototype for team phones: SAKHI_CHAT is never in a Play build."; exit 1; }
  case "$VERSION_NAME" in *ask-proto*) ;; *) echo "A build with SAKHI_CHAT needs a version name with \"ask-proto\", e.g. 0.40-ask-proto."; exit 1 ;; esac
  case "$SAKHI_CHAT" in https://*/functions/v1/sakhi-chat) ;; *) echo "SAKHI_CHAT must be the sakhi-chat function's https address (…/functions/v1/sakhi-chat)."; exit 1 ;; esac
  [ "${SAKHI_CHAT%%/functions/*}" = "${SAKHI_API%%/functions/*}" ] || { echo "SAKHI_CHAT must be on the same server as SAKHI_API (the page may reach one address)."; exit 1; }
  PKG="com.quranutrition.sakhi.ask"; OUT_APK="QuraSakhi-ask-prototype.apk"
fi
# Version 40.2: SAKHI_DEBUGGABLE=1 makes the Ask Sakhi test app debuggable, so its WebView can be measured from the Mac
# (web/test/adb-cdp.mjs). Never Play, never a build without SAKHI_CHAT.
if [ "$SAKHI_DEBUGGABLE" = "1" ] && { [ "$PLAY" = "1" ] || [ -z "$SAKHI_CHAT" ]; }; then echo "SAKHI_DEBUGGABLE is only for the Ask Sakhi test app (SAKHI_CHAT), never Play."; exit 1; fi
SDK="${ANDROID_HOME:-/opt/homebrew/share/android-commandlinetools}"
[ -d "$SDK/platforms/android-36" ] || SDK="$HOME/Library/Android/sdk"
# Target SDK 36 (Android 16): Google Play's floor for new apps and updates since 31 Aug 2026. MainActivity keeps the page
# clear of the bars (edge to edge) and takes Back through OnBackInvokedCallback, as Android 16 asks.
BT="$SDK/build-tools/36.0.0"; JAR="$SDK/platforms/android-36/android.jar"
[ -f "$JAR" ] && [ -x "$BT/aapt2" ] || { echo "Android SDK platform 36 and build-tools 36.0.0 not found (looked in $SDK). See README.txt."; exit 1; }
export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home}"
export PATH="$JAVA_HOME/bin:$PATH"
# SAKHI_WEB: build from another copy of the web app, e.g. the last commit's while web/ has work in progress:
#   git archive HEAD web | tar -x -C /tmp/head && cp -R web/care /tmp/head/web/ && SAKHI_WEB=/tmp/head/web ./build-apk.sh
WEB="${SAKHI_WEB:-../web}"
VERSION_NAME="${VERSION_NAME:-0.1-prototype}"
# Version 32 (field-test audit 3.6): testers' phones only take an update with the same signing key and a versionCode at least
# as high as theirs; otherwise the only way is to uninstall, which deletes the diary. So VERSION_CODE must be given, it may
# not go below the last APK built here, and a missing keystore stops the build instead of making a new key.
[ -n "$VERSION_CODE" ] || { echo "Give VERSION_CODE (at least the last one built: see README.txt)."; exit 1; }
case "$VERSION_CODE" in *[!0-9]*) echo "VERSION_CODE must be a whole number."; exit 1 ;; esac
# The account server (../server/SERVER_SPEC.md), e.g. SAKHI_API=https://api.example.com/sakhi. Left empty, signup
# runs against the stand-in server inside the app: nothing is sent and the code is always 123456.
SAKHI_API="${SAKHI_API:-}"
# Qura's staffed WhatsApp number for "Speak to a doctor" and "Tell a person", e.g. SAKHI_HELP_WA=9198XXXXXXXX (91 and the
# 10-digit mobile number, no +). Left empty, the doctor screen offers Qura's booking page and "Tell a person" is hidden.
SAKHI_HELP_WA="${SAKHI_HELP_WA:-}"
# The Grievance Officer's name and contact for the privacy notice, e.g. SAKHI_GRIEVANCE="Name, Trinaya Wellness LLP, address,
# email". Left empty, the notice leaves the line out (never a placeholder).
SAKHI_GRIEVANCE="${SAKHI_GRIEVANCE:-}"
# Version 39.76: the full privacy policy's web address, for the link in Me, About and privacy (Play wants it in the app as well
# as in the listing), e.g. SAKHI_PRIVACY="https://www.quranutrition.com/sakhi/privacy". https only; without it the link is left out.
SAKHI_PRIVACY="${SAKHI_PRIVACY:-}"
# Version 39.79: "Share how I use Sakhi" goes through Firebase Analytics, in the app's Java (MODULE_API section 122), when
# google-services.json from the Firebase console is in this folder. Without it the app has no Firebase code and no switch. The page
# itself reaches only the accounts server either way. PostHog (Version 39.60, SAKHI_PH) is gone.
if [ -n "$SAKHI_PH" ]; then echo "Note: SAKHI_PH is no longer used: usage goes through Firebase (google-services.json, README.txt)."; fi
if [ -f google-services.json ]; then echo "Firebase Analytics: in this build (google-services.json)."
else echo "Note: no google-services.json, so this build has no Firebase and no \"Share how I use Sakhi\" switch (README.txt)."; fi
case "$SAKHI_HELP_WA" in
  ""|91[6-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]) ;;
  *) echo "SAKHI_HELP_WA must be 91 followed by a 10-digit mobile number, e.g. 919876543210."; exit 1 ;;
esac
# A build for real women (a version name without "demo") must talk to the real server, over https: never the stand-in
# server whose code is always 123456.
case "$VERSION_NAME" in
  *demo*) ;;
  *) case "$SAKHI_API" in
       https://?*) ;;
       *) echo "VERSION_NAME $VERSION_NAME is not a demo build, so SAKHI_API must be the server's https address."; exit 1 ;;
     esac ;;
esac

# Version 39.8: a size ceiling, so nothing big slips into the APK by accident (raw data, say). It is not a budget for cheap
# phones: Sakhi is built for newer phones, Android 10 or later (min SDK 29 below; Mohit, 25 Oct). Raise MAX_APK_MB on purpose
# when something big is meant to go in. (V39.8 review SAFETY-07: a whole number, checked before anything is built.)
MAX_APK_MB="${MAX_APK_MB:-30}"
case "$MAX_APK_MB" in ''|*[!0-9]*) echo "MAX_APK_MB must be a whole number of MB (it is \"$MAX_APK_MB\")."; exit 1 ;; esac

# Google Play (PLAY=1): an .aab signed with the upload key, never the prototype key. Play signs what phones install with its
# own key, so a Play build is a new app to the testers' phones: they move their diary with "Move to a new phone".
UPLOAD_KS="${SAKHI_UPLOAD_KEYSTORE:-sakhi-upload.keystore}"
BUNDLETOOL="${BUNDLETOOL:-$SDK/bundletool/bundletool-all-1.18.3.jar}"
if [ "$PLAY" = "1" ]; then
  case "$VERSION_NAME" in *demo*) echo "A Play build is for real women: VERSION_NAME may not contain \"demo\"."; exit 1 ;; esac
  [ -f "$BUNDLETOOL" ] || { echo "bundletool not found at $BUNDLETOOL (README.txt, Google Play)."; exit 1; }
  [ -f "$UPLOAD_KS" ] || { echo "The upload key $UPLOAD_KS is missing: restore it from your backup, or make it once with ./make-upload-key.sh."; exit 1; }
  # Its password: SAKHI_UPLOAD_PASS, or the Mac's keychain, where make-upload-key.sh put it. Never on the command line.
  [ -n "$SAKHI_UPLOAD_PASS" ] || SAKHI_UPLOAD_PASS="$(security find-generic-password -s "Qura Sakhi upload key" -a sakhi -w 2>/dev/null || true)"
  [ -n "$SAKHI_UPLOAD_PASS" ] || { echo "No password for the upload key: set SAKHI_UPLOAD_PASS, or unlock the keychain item \"Qura Sakhi upload key\"."; exit 1; }
  export SAKHI_UPLOAD_PASS
elif [ ! -f sakhi-prototype.keystore ] && [ "$NEW_KEYSTORE" != "1" ]; then
  echo "sakhi-prototype.keystore is missing. Every update for testers must be signed with the same key: restore it from your"
  echo "backup. Only for a first build that no phone has yet, run again with NEW_KEYSTORE=1."; exit 1
elif [ -f sakhi-prototype.keystore ]; then
  # The prototype key's password: SAKHI_PROTO_PASS, or the Mac's keychain item "Qura Sakhi prototype key" (as the upload key's).
  # Never in git, never on the command line.
  [ -n "$SAKHI_PROTO_PASS" ] || SAKHI_PROTO_PASS="$(security find-generic-password -s "Qura Sakhi prototype key" -a sakhi -w 2>/dev/null || true)"
  [ -n "$SAKHI_PROTO_PASS" ] || { echo "No password for the prototype key: set SAKHI_PROTO_PASS, or unlock the keychain item \"Qura Sakhi prototype key\"."; exit 1; }
  export SAKHI_PROTO_PASS
fi
# One count for both: the last APK built here, and the last bundle for Play (Play refuses a version code it already has).
for LASTF in QuraSakhi-prototype.apk QuraSakhi-ask-prototype.apk build-play/last.apk; do
  [ -f "$LASTF" ] || continue
  LAST=$("$BT/aapt2" dump badging "$LASTF" 2>/dev/null | sed -n "s/.*versionCode='\([0-9]*\)'.*/\1/p" | head -1)
  if [ -n "$LAST" ] && [ "$VERSION_CODE" -lt "$LAST" ]; then echo "VERSION_CODE $VERSION_CODE is below the last build ($LAST, $LASTF): phones with $LAST won't take it."; exit 1; fi
done

rm -rf build && mkdir -p build/assets/www/mods

# 1. The web app, plus the Android bridge, the server address and the Learn library as scripts (WebView cannot fetch file:// URLs).
cp "$WEB/app.js" "$WEB/art.js" "$WEB/app.css" build/assets/www/
cp "$WEB"/mods/*.js build/assets/www/mods/
# the plans as data (Version 39.4): progs/*.js, loaded before the modules
mkdir -p build/assets/www/progs && cp "$WEB"/progs/*.js build/assets/www/progs/
# Wind down and the relief routines in Dr. Megha's voice (Version 39.21): Opus sounds, kept uncompressed (-0 ogg below) so
# Android plays them straight from the APK; web/sounds/CREDITS.md says where each came from.
mkdir -p build/assets/www/sounds && cp -R "$WEB"/sounds/voice "$WEB"/sounds/music "$WEB"/sounds/timelines.js "$WEB"/sounds/captions.js build/assets/www/sounds/
# The 3D figure (Version 39.39): each move's loop (VP9 .webm; the WebView streams it, so it needs no -0 like the sounds)
# and its still, made by web/tools/fig3d; without web/fig the player shows the drawings.
if [ -f "$WEB/fig/fig.js" ]; then
  mkdir -p build/assets/www/fig && cp -R "$WEB"/fig/v "$WEB"/fig/s "$WEB"/fig/fig.js "$WEB"/fig/CREDITS.md build/assets/www/fig/
  # Version 39.69.2: and the lists' small moving pictures (fig/t, animated WebPs made by web/tools/fig3d/thumbs.py)
  if [ -d "$WEB/fig/t" ]; then cp -R "$WEB"/fig/t build/assets/www/fig/; fi
fi
# the bundled fonts and their licences: the app never fetches fonts from Google
mkdir -p build/assets/www/fonts && cp "$WEB"/fonts/*.woff2 "$WEB"/fonts/fonts.css "$WEB"/fonts/OFL-*.txt build/assets/www/fonts/
cp web/android-shim.js build/assets/www/
# Care near me: the PIN codes and health facilities made by web/tools/care-data.mjs from data.gov.in (not in git; see
# docs/care-near-me-data-2026-10-22.md). Without them the app explains what the live list will show.
CARE=""
if [ -f "$WEB/care/index.js" ]; then
  mkdir -p build/assets/www/care && cp "$WEB"/care/*.js build/assets/www/care/ && CARE="care/"
  echo "Care near me: $(ls "$WEB"/care/*.js | wc -l | tr -d ' ') data files bundled."
else
  echo "Note: no Care near me data in web/care, so this build lists no facilities (docs/care-near-me-data-2026-10-22.md)."
fi
# Dr. Megha's 30-second welcome (Version 37.1): her recordings, once made, go in web/audio as megha-welcome-<lang>.mp3. The
# plan's "How each day works" card offers the ones listed in SAKHI_CONFIG.audio; without them it shows no button.
AUDIO=""
if ls "$WEB"/audio/megha-welcome-*.mp3 >/dev/null 2>&1; then
  mkdir -p build/assets/www/audio && cp "$WEB"/audio/megha-welcome-*.mp3 build/assets/www/audio/
  AUDIO="$(cd "$WEB/audio" && ls megha-welcome-*.mp3 | sed 's/\.mp3$//' | paste -sd, -)"
  echo "Dr. Megha's welcome bundled: $AUDIO"
fi
python3 - "$WEB" build/assets/www "$SAKHI_API" "$VERSION_NAME" "$SAKHI_HELP_WA" "$CARE" "$SAKHI_GRIEVANCE" "$AUDIO" "${PLAY:-}" "$SAKHI_PRIVACY" "$SAKHI_CHAT" <<'PY'
import sys, os, json, re, hashlib, base64
from urllib.parse import urlsplit
web, out, api, ver, wa, care, grv, audio = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5], sys.argv[6], sys.argv[7], sys.argv[8]
play, priv = sys.argv[9], sys.argv[10]   # Version 39.76: a Play build (no coordinator tools), the privacy policy's address
chat = sys.argv[11] if play != '1' else ''   # Version 40 (prototype): Ask Sakhi's address, never in a Play build
if priv and not priv.startswith('https://'): sys.exit('SAKHI_PRIVACY must be an https address: ' + priv)
c = json.load(open(os.path.join(web, 'content.json'), encoding='utf-8'))
open(os.path.join(out, 'content.js'), 'w', encoding='utf-8').write('window.SAKHI_CONTENT = ' + json.dumps(c, ensure_ascii=False, separators=(',', ':')) + ';\n')
open(os.path.join(out, 'config.js'), 'w', encoding='utf-8').write('window.SAKHI_CONFIG = ' + json.dumps(dict({'api': api, 'app': ver, 'platform': 'android', 'helpWa': wa}, **({'care': care} if care else {}), **({'grievance': grv} if grv else {}), **({'audio': audio.split(',')} if audio else {}), **({'store': 'play'} if play == '1' else {}), **({'privacy': priv} if priv else {}), **({'chat': chat} if chat else {})), ensure_ascii=False) + ';\n')
html = open(os.path.join(web, 'index.html'), encoding='utf-8').read()
html = html.replace('<script src="app.js"', '<script src="android-shim.js"></script>\n<script src="config.js"></script>\n<script src="content.js" charset="utf-8"></script>\n<script src="app.js"', 1)
# Content-Security-Policy (audit fix 28): only the app's own files run, and the only server the page can reach is the
# accounts server. The two small inline scripts in index.html are allowed by their hashes.
inline = re.findall(r'<script(?: id="[^"]*")?>(.*?)</script>', html, re.S)
assert len(inline) == 2, 'index.html should have exactly two inline scripts; update the CSP step in build-apk.sh'
hashes = ' '.join("'sha256-" + base64.b64encode(hashlib.sha256(x.encode('utf-8')).digest()).decode() + "'" for x in inline)
origin = (lambda u: u.scheme + '://' + u.netloc)(urlsplit(api)) if api else "'none'"
csp = ("default-src 'none'; script-src 'self' file: " + hashes + "; style-src 'self' file: 'unsafe-inline'; font-src 'self' file:; "
       "img-src 'self' file: data: blob:; media-src 'self' file: data: blob:; connect-src " + origin + "; base-uri 'none'; form-action 'none'; object-src 'none'")
html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="' + csp + '">', 1)
assert 'Content-Security-Policy' in html
open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(html)
PY

# 2. The manifest Gradle reads: AndroidManifest.xml without its package line (Gradle takes the app's name from the namespace
# in build.gradle.kts, the same com.quranutrition.sakhi).
sed 's/ package="com\.quranutrition\.sakhi"//' AndroidManifest.xml > build/AndroidManifest.xml
if grep -q 'package="' build/AndroidManifest.xml; then echo "AndroidManifest.xml's package line didn't come out (build-apk.sh, step 2)."; exit 1; fi
# Version 40: the Ask Sakhi test app has its own name on the phone, so no one mistakes it for Sakhi from Play
if [ -n "$SAKHI_CHAT" ]; then sed -i.bak 's/android:label="Qura Sakhi"/android:label="Sakhi Ask test"/g' build/AndroidManifest.xml && rm -f build/AndroidManifest.xml.bak; fi

# 3. Gradle: resources, Java, dex, then the signed APK, or the signed bundle for Play, in build-gradle/outputs. The version
# code and name come from here; the sounds stay uncompressed (noCompress in build.gradle.kts), so Android plays them straight
# from the app.
export ANDROID_HOME="$SDK"
OUT=build-gradle/outputs
gw() { ./gradlew --console=plain --quiet --warning-mode=summary -Psakhi.versionCode="$VERSION_CODE" -Psakhi.versionName="$VERSION_NAME" ${SAKHI_CHAT:+-Psakhi.idSuffix=.ask} ${SAKHI_DEBUGGABLE:+-Psakhi.debuggable=true} "$@"; }

# 4 for Play (PLAY=1): the bundle, signed with the upload key (its password from the environment, never the command line),
# then checked: its signature, bundletool's own validation, and the APK a phone would get, for its target SDK, its stored
# sounds and the size ceiling.
if [ "$PLAY" = "1" ]; then
  rm -rf "$OUT/bundle"
  gw --no-daemon -Psakhi.signing=upload bundleRelease   # no Gradle left running afterwards with the password in its memory
  cp "$OUT/bundle/release/QuraSakhi-release.aab" build/signed.aab
  jarsigner -verify build/signed.aab | grep -q "jar verified" || { echo "The bundle's upload signature didn't verify."; exit 1; }
  java -jar "$BUNDLETOOL" validate --bundle=build/signed.aab >/dev/null
  java -jar "$BUNDLETOOL" build-apks --bundle=build/signed.aab --output=build/check.apks --mode=universal   # only looked at, never installed
  (cd build && unzip -q -o check.apks universal.apk)
  "$BT/aapt2" dump badging build/universal.apk | grep -q "targetSdkVersion:'36'" || { echo "The bundle doesn't target SDK 36."; exit 1; }
  if unzip -v build/universal.apk 'assets/www/sounds/*' | awk '$NF ~ /\.ogg$/ && $2 != "Stored"' | grep -q .; then
    echo "Some sounds are compressed in the bundle: Android can't play those from the app (noCompress, build.gradle.kts)."; exit 1
  fi
  APK_BYTES=$(wc -c < build/universal.apk | tr -d ' ')
  if [ "$APK_BYTES" -gt $((MAX_APK_MB * 1024 * 1024)) ]; then
    echo "The app is $((APK_BYTES / 1024 / 1024)) MB, over the ${MAX_APK_MB} MB ceiling: shrink it, or raise MAX_APK_MB on purpose." >&2; exit 1
  fi
  mkdir -p build-play
  AAB="build-play/QuraSakhi-$VERSION_NAME-$VERSION_CODE.aab"
  mv -f build/signed.aab "$AAB" && mv -f build/universal.apk build-play/last.apk
  echo "Built for Play: $(pwd)/$AAB ($(du -h "$AAB" | cut -f1)). Upload it in Play Console; nothing was installed."
  exit 0
fi

# 4. The APK, signed with the prototype key (made once and kept next to this script), then checked.
if [ ! -f sakhi-prototype.keystore ]; then   # only with NEW_KEYSTORE=1 (checked above)
  # a new key gets a random password, kept in the keychain first (a key whose password was lost would be no use)
  SAKHI_PROTO_PASS="$(openssl rand -base64 48 | tr -d '/+=\n' | cut -c1-40)"; export SAKHI_PROTO_PASS
  security add-generic-password -U -s "Qura Sakhi prototype key" -a sakhi -j "Prototype signing key for Qura Sakhi testers' APKs (android/sakhi-prototype.keystore)" -w "$SAKHI_PROTO_PASS"
  keytool -genkeypair -keystore sakhi-prototype.keystore -storetype PKCS12 -storepass:env SAKHI_PROTO_PASS -keypass:env SAKHI_PROTO_PASS -alias sakhi \
    -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Qura Sakhi prototype, O=Trinaya Wellness LLP, C=IN" >/dev/null 2>&1
fi
rm -rf "$OUT/apk"
gw -Psakhi.signing=proto assembleRelease
cp "$OUT/apk/release/QuraSakhi-release.apk" build/signed.apk
[ -f "$OUT/apk/release/QuraSakhi-release.apk.idsig" ] && cp "$OUT/apk/release/QuraSakhi-release.apk.idsig" build/signed.apk.idsig   # for adb's fast install
"$BT/apksigner" verify build/signed.apk
if unzip -v build/signed.apk 'assets/www/sounds/*' | awk '$NF ~ /\.ogg$/ && $2 != "Stored"' | grep -q .; then
  echo "Some sounds are compressed in the APK: Android can't play those from the app (noCompress, build.gradle.kts)."; exit 1
fi
# The ceiling is checked before the new APK replaces the last good one, so that one (and its version code, which the floor
# check above reads) survives a build that is too big.
APK_BYTES=$(wc -c < build/signed.apk | tr -d ' ')
if [ "$APK_BYTES" -gt $((MAX_APK_MB * 1024 * 1024)) ]; then
  echo "The APK is $((APK_BYTES / 1024 / 1024)) MB, over the ${MAX_APK_MB} MB ceiling: shrink it, or raise MAX_APK_MB on purpose. The last good APK is kept." >&2
  exit 1
fi
mv -f build/signed.apk "$OUT_APK"
[ -f build/signed.apk.idsig ] && mv -f build/signed.apk.idsig "$OUT_APK.idsig"
echo "Built: $(pwd)/$OUT_APK ($(du -h "$OUT_APK" | cut -f1))"

# 5. Install on a phone connected by USB, if there is one.
if command -v adb >/dev/null 2>&1 && adb get-state >/dev/null 2>&1; then
  adb install -r "$OUT_APK" && adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1 && echo "Installed and opened on the phone."
fi
