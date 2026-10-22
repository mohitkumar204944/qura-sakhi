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
# Qura's staffed WhatsApp number for "Speak to a doctor" and "Tell a person", e.g. SAKHI_HELP_WA=9198XXXXXXXX (91 and the
# 10-digit mobile number, no +). Left empty, the doctor screen offers Qura's booking page and "Tell a person" is hidden.
SAKHI_HELP_WA="${SAKHI_HELP_WA:-}"
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

rm -rf build && mkdir -p build/assets/www/mods build/classes build/dex build/gen

# 1. The web app, plus the Android bridge, the server address and the Learn library as scripts (WebView cannot fetch file:// URLs).
cp "$WEB/app.js" "$WEB/art.js" "$WEB/app.css" build/assets/www/
cp "$WEB"/mods/*.js build/assets/www/mods/
# the bundled fonts and their licences: the app never fetches fonts from Google
mkdir -p build/assets/www/fonts && cp "$WEB"/fonts/*.woff2 "$WEB"/fonts/fonts.css "$WEB"/fonts/OFL-*.txt build/assets/www/fonts/
cp web/android-shim.js build/assets/www/
python3 - "$WEB" build/assets/www "$SAKHI_API" "$VERSION_NAME" "$SAKHI_HELP_WA" <<'PY'
import sys, os, json, re, hashlib, base64
from urllib.parse import urlsplit
web, out, api, ver, wa = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5]
c = json.load(open(os.path.join(web, 'content.json'), encoding='utf-8'))
open(os.path.join(out, 'content.js'), 'w', encoding='utf-8').write('window.SAKHI_CONTENT = ' + json.dumps(c, ensure_ascii=False, separators=(',', ':')) + ';\n')
open(os.path.join(out, 'config.js'), 'w', encoding='utf-8').write('window.SAKHI_CONFIG = ' + json.dumps({'api': api, 'app': ver, 'platform': 'android', 'helpWa': wa}) + ';\n')
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
