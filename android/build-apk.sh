#!/bin/sh
# Builds QuraSakhi-prototype.apk from "../web" with the plain Android SDK tools (no Gradle, no Android Studio).
# Needs: Android SDK platform android-34 + build-tools 35.0.0, and a JDK (Java 17+).
set -e
cd "$(dirname "$0")"
SDK="${ANDROID_HOME:-/opt/homebrew/share/android-commandlinetools}"
[ -d "$SDK/platforms/android-34" ] || SDK="$HOME/Library/Android/sdk"
# build-tools 35: the d8 in 34.0.0 crashes on classes compiled by Java 21.
BT="$SDK/build-tools/35.0.0"; JAR="$SDK/platforms/android-34/android.jar"
[ -f "$JAR" ] || { echo "Android SDK not found (looked in $SDK). See README.txt."; exit 1; }
export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home}"
export PATH="$JAVA_HOME/bin:$PATH"
WEB="../web"
VERSION_CODE="${VERSION_CODE:-1}"; VERSION_NAME="${VERSION_NAME:-0.1-prototype}"
# The account server (../server/SERVER_SPEC.md), e.g. SAKHI_API=https://api.example.com/sakhi. Left empty, signup
# runs against the stand-in server inside the app: nothing is sent and the code is always 123456.
SAKHI_API="${SAKHI_API:-}"

rm -rf build && mkdir -p build/assets/www/mods build/classes build/dex build/gen

# 1. The web app, plus the Android bridge, the server address and the Learn library as scripts (WebView cannot fetch file:// URLs).
cp "$WEB/app.js" "$WEB/art.js" "$WEB/app.css" build/assets/www/
cp "$WEB"/mods/*.js build/assets/www/mods/
cp web/android-shim.js build/assets/www/
python3 - "$WEB" build/assets/www "$SAKHI_API" "$VERSION_NAME" <<'PY'
import sys, os, json, re
web, out, api, ver = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
c = json.load(open(os.path.join(web, 'content.json'), encoding='utf-8'))
open(os.path.join(out, 'content.js'), 'w', encoding='utf-8').write('window.SAKHI_CONTENT = ' + json.dumps(c, ensure_ascii=False, separators=(',', ':')) + ';\n')
open(os.path.join(out, 'config.js'), 'w', encoding='utf-8').write('window.SAKHI_CONFIG = ' + json.dumps({'api': api, 'app': ver, 'platform': 'android'}) + ';\n')
html = open(os.path.join(web, 'index.html'), encoding='utf-8').read()
html = html.replace('<script src="app.js"', '<script src="android-shim.js"></script>\n<script src="config.js"></script>\n<script src="content.js" charset="utf-8"></script>\n<script src="app.js"', 1)
open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(html)
PY

# 2. Resources and manifest.
"$BT/aapt2" compile --dir res -o build/res.zip
"$BT/aapt2" link -o build/base.apk -I "$JAR" --manifest AndroidManifest.xml -A build/assets --java build/gen \
  --min-sdk-version 24 --target-sdk-version 34 --version-code "$VERSION_CODE" --version-name "$VERSION_NAME" build/res.zip

# 3. Java -> dex.
javac -nowarn -Xlint:-options -source 8 -target 8 -bootclasspath "$JAR" -d build/classes \
  build/gen/com/quranutrition/sakhi/R.java $(find src -name "*.java")
"$BT/d8" --min-api 24 --lib "$JAR" --output build/dex $(find build/classes -name '*.class')

# 4. Package, align, sign (prototype debug key, made once and kept next to this script).
cp build/base.apk build/unaligned.apk
(cd build/dex && zip -q ../unaligned.apk classes.dex)
"$BT/zipalign" -p -f 4 build/unaligned.apk build/aligned.apk
if [ ! -f sakhi-prototype.keystore ]; then
  keytool -genkeypair -keystore sakhi-prototype.keystore -storepass android -keypass android -alias sakhi \
    -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Qura Sakhi prototype, O=Trinaya Wellness LLP, C=IN" >/dev/null 2>&1
fi
"$BT/apksigner" sign --ks sakhi-prototype.keystore --ks-pass pass:android --key-pass pass:android --ks-key-alias sakhi \
  --out QuraSakhi-prototype.apk build/aligned.apk
"$BT/apksigner" verify QuraSakhi-prototype.apk
echo "Built: $(pwd)/QuraSakhi-prototype.apk ($(du -h QuraSakhi-prototype.apk | cut -f1))"

# 5. Install on a phone connected by USB, if there is one.
if command -v adb >/dev/null 2>&1 && adb get-state >/dev/null 2>&1; then
  adb install -r QuraSakhi-prototype.apk && adb shell monkey -p com.quranutrition.sakhi -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1 && echo "Installed and opened on the phone."
fi
