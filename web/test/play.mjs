// Ready for Google Play, 29 Oct 2026 (android/README.txt, "Google Play"). No browser: it reads the
// Android build, manifest and code, and the last Play bundle's APK when there is one.
//   1 target SDK 36 against platform 36, still Android 10 and up;
//   2 edge to edge: on Android 15+ the page is padded clear of the bars, the cut-out and the keyboard, older phones untouched;
//   3 Back through OnBackInvokedCallback on Android 13+, onBackPressed on 10 to 12, one back() for both;
//   4 the bundle: PLAY=1, never a demo name, signed with the upload key whose password never reaches a command line, sounds
//     uncompressed, the size ceiling, one version count, and no bundle or key in git;
//   5 the last bundle's APK (skipped when none was built): target 36, the back flag, stored sounds, the upload key;
//   6 the Gradle build (Version 39.79): pinned versions, no Kotlin library, no SDK downloads mid-build, the manifest, the
//     prototype key's signatures, and R8 shrinking that renames nothing and keeps the page's bridge.
// The reviewer's sign-in is checked with the server: server/test/api.test.mjs, 5.1a.
// Usage: node test/play.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const android = path.resolve(here, '../../android');
const read = (f) => fs.readFileSync(path.join(android, f), 'utf8');
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 300)); };

const sh = read('build-apk.sh'), mf = read('AndroidManifest.xml'), main = read('src/com/quranutrition/sakhi/MainActivity.java');
const key = read('make-upload-key.sh');
// Version 39.79: Gradle builds the app; build-apk.sh prepares the web app and runs it
const gk = read('build.gradle.kts'), gp = read('gradle.properties'), gw = read('gradle/wrapper/gradle-wrapper.properties');
const gi = fs.readFileSync(path.resolve(android, '../.gitignore'), 'utf8');

/* ---------- 1. target SDK 36 ---------- */
check('1 compiled against platform 36 with build-tools 36', /platforms\/android-36\/android\.jar/.test(sh) && /build-tools\/36\.0\.0/.test(sh) && !/android-34|35\.0\.0/.test(sh) &&
  /compileSdk = 36\b/.test(gk) && /buildToolsVersion = "36\.0\.0"/.test(gk));
check('1 the app targets SDK 36 (one setting for the APK and the bundle)', /targetSdk = 36\b/.test(gk) && (gk.match(/targetSdk = \d+/g) || []).length === 1 && !/--target-sdk-version/.test(sh));
check('1 still Android 10 and up', /minSdk = 29\b/.test(gk) && (gk.match(/minSdk = \d+/g) || []).length === 1);

/* ---------- 2. edge to edge ---------- */
const fit = (main.match(/private void fitBars\(\) \{[\s\S]*?\n    \}\n/) || [''])[0];
check('2 fitBars runs once, before the WebView, on the holder that makeWeb fills', /setContentView\(root\);\s*fitBars\(\);/.test(main) && /root\.addView\(web,/.test(main) && !/setContentView\(web\)/.test(main));
check('2 only on Android 15+, where the window goes edge to edge', /if \(Build\.VERSION\.SDK_INT < 35\) return;/.test(fit));
check('2 padded clear of the system bars, the cut-out and the keyboard', /WindowInsets\.Type\.systemBars\(\) \| WindowInsets\.Type\.displayCutout\(\)/.test(fit) && /WindowInsets\.Type\.ime\(\)/.test(fit) &&
  /setPadding\(bars\.left, bars\.top, bars\.right, Math\.max\(bars\.bottom, keys\.bottom\)\)/.test(fit));
check('2 a plain navigation bar, as on target 34', /setNavigationBarContrastEnforced\(false\)/.test(fit));
check('2 the window keeps resizing for the keyboard on older phones', /android:windowSoftInputMode="adjustResize"/.test(mf));
check('2 no lambdas (android.jar has no LambdaMetafactory for d8 here)', !/->/.test(main.replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, '').replace(/"(?:[^"\\]|\\.)*"/g, '""')));

/* ---------- 3. Back ---------- */
check('3 the manifest switches the callback on for Android 13+', /<application[^>]*android:enableOnBackInvokedCallback="true"/.test(mf));
check('3 Android 13+: OnBackInvokedCallback calls back()', /if \(Build\.VERSION\.SDK_INT >= 33\) \{\s*getOnBackInvokedDispatcher\(\)\.registerOnBackInvokedCallback\(OnBackInvokedDispatcher\.PRIORITY_DEFAULT, new OnBackInvokedCallback\(\) \{\s*@Override public void onBackInvoked\(\) \{ back\(\); \}/.test(main));
check('3 Android 10 to 12: onBackPressed calls the same back()', /public void onBackPressed\(\) \{ back\(\); \}/.test(main));
const back = (main.match(/private void back\(\) \{[\s\S]*?\n    \}\n/) || [''])[0];
check('3 back() still asks the page first, then WebView history, then closes', /__sakhiBack/.test(back) && /r==='exit'\?2/.test(back) && /web\.canGoBack\(\)\) web\.goBack\(\); else finish\(\);/.test(back));

/* ---------- 4. the bundle ---------- */
const play = (sh.match(/if \[ "\$PLAY" = "1" \]; then\n  rm -rf "\$OUT\/bundle"[\s\S]*?\n  exit 0\nfi\n/) || [''])[0];
check('4 PLAY=1 builds a bundle and stops before the APK is signed or installed', play && sh.indexOf(play) < sh.indexOf('# 4. The APK') && /exit 0/.test(play) && !/adb|assembleRelease/.test(play));
check('4 never a demo build on Play', /if \[ "\$PLAY" = "1" \]; then\n  case "\$VERSION_NAME" in \*demo\*\) echo "A Play build is for real women/.test(sh));
check('4 Gradle makes the bundle (bundleRelease), with the version code and name from the script', /\n  gw --no-daemon -Psakhi\.signing=upload bundleRelease/.test(play) &&
  /-Psakhi\.versionCode="\$VERSION_CODE" -Psakhi\.versionName="\$VERSION_NAME"/.test(sh) && /versionCode = prop\("sakhi\.versionCode"/.test(gk) && /versionName = prop\("sakhi\.versionName"/.test(gk));
const upl = (gk.match(/create\("upload"\) \{[\s\S]*?\n        \}/) || [''])[0];
check('4 signed with the upload key, alias upload, never the prototype key', /keyAlias = "upload"/.test(upl) && /"sakhi-upload\.keystore"/.test(upl) && !/prototype/.test(upl) &&
  /signingConfigs\.getByName\(if \(findProperty\("sakhi\.signing"\) == "upload"\) "upload" else "proto"\)/.test(gk) && !/sakhi-prototype/.test(play) && /jar verified/.test(play));
check('4 the upload password never on a command line or on disk (env or the keychain only)', !/pass:"?\$SAKHI_UPLOAD_PASS|storepass "\$SAKHI_UPLOAD_PASS|-w "\$SAKHI_UPLOAD_PASS" *$|injected\.signing/m.test(sh) &&
  /security find-generic-password -s "Qura Sakhi upload key" -a sakhi -w/.test(sh) && /-storepass:env SAKHI_UPLOAD_PASS -keypass:env SAKHI_UPLOAD_PASS/.test(key) &&
  /storePassword = System\.getenv\("SAKHI_UPLOAD_PASS"\)/.test(upl) && /keyPassword = System\.getenv\("SAKHI_UPLOAD_PASS"\)/.test(upl) &&
  /^org\.gradle\.configuration-cache=false$/m.test(gp) && /--no-daemon/.test(play));
check('4 the key script never makes a second key over the first, and keeps the password before the key', /\[ ! -f "\$KS" \] \|\|/.test(key) && key.indexOf('add-generic-password') < key.indexOf('keytool -genkeypair') && /delete-generic-password/.test(key));
check('4 sounds stay uncompressed in the bundle and the APK, and the build checks both', /noCompress \+= listOf\("ogg"/.test(gk) && /\$2 != "Stored"/.test(play) &&
  (sh.match(/\$2 != "Stored"/g) || []).length === 2 && !fs.existsSync(path.join(android, 'bundle-config.json')));
check('4 bundletool validates it, and the size ceiling applies', /bundletool" validate --bundle=build\/signed\.aab/.test(play.replace(/\$BUNDLETOOL/g, 'bundletool')) && /-gt \$\(\(MAX_APK_MB \* 1024 \* 1024\)\)/.test(play));
check('4 one version count: the floor reads the last APK and the last bundle', /for LASTF in QuraSakhi-prototype\.apk build-play\/last\.apk; do/.test(sh));
check('4 no bundle, key, Play or Gradle output in git', /^android\/build-play\/$/m.test(gi) && /^\*\.aab$/m.test(gi) && /^\*\.keystore$/m.test(gi) &&
  /^android\/build-gradle\/$/m.test(gi) && /^android\/\.gradle\/$/m.test(gi));

/* ---------- 4b. the icon: Sakhi's logo (Mohit, 6 Nov), made by android/make-icons.py ---------- */
const adaptive = read('res/mipmap-anydpi-v26/ic_launcher.xml');
check('4b an adaptive icon: a white background and the mark as the foreground', /<background android:drawable="@android:color\/white" \/>/.test(adaptive) && /<foreground android:drawable="@mipmap\/ic_launcher_foreground" \/>/.test(adaptive));
const pngSize = (f) => { const b = fs.readFileSync(path.join(android, f)); return b.toString('ascii', 1, 4) === 'PNG' ? [b.readUInt32BE(16), b.readUInt32BE(20)] : null; };
const dens = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
check('4b each density has the 108 dp foreground and the 48 dp plain icon', Object.entries(dens).every(([n, d]) =>
  String(pngSize('res/mipmap-' + n + '/ic_launcher_foreground.png')) === String([108 * d, 108 * d]) && String(pngSize('res/mipmap-' + n + '/ic_launcher.png')) === String([48 * d, 48 * d])));
check("4b Google Play's icon is a 512 x 512 PNG, and the logo it comes from is kept", String(pngSize('icon-512.png')) === '512,512' && fs.existsSync(path.join(android, 'icon-src/sakhi-logo.webp')));

/* ---------- 5. the last bundle, if one was built ---------- */
const last = path.join(android, 'build-play/last.apk');
const aapt2 = (process.env.ANDROID_HOME || '/opt/homebrew/share/android-commandlinetools') + '/build-tools/36.0.0/aapt2';
if (!fs.existsSync(last) || !fs.existsSync(aapt2)) console.log('SKIP 5: no Play bundle built yet (PLAY=1 android/build-apk.sh)');
else {
  const badging = execFileSync(aapt2, ['dump', 'badging', last], { encoding: 'utf8' });
  check("5 the bundle's APK targets SDK 36 from Android 10", /targetSdkVersion:'36'/.test(badging) && /minSdkVersion:'29'/.test(badging) && /package: name='com\.quranutrition\.sakhi'/.test(badging));
  const xml = execFileSync(aapt2, ['dump', 'xmltree', '--file', 'AndroidManifest.xml', last], { encoding: 'utf8' });
  check('5 its manifest has the back callback on', /enableOnBackInvokedCallback\(0x0101066c\)=true/.test(xml));
  const list = execFileSync('unzip', ['-v', last], { encoding: 'utf8', maxBuffer: 1 << 26 }).split('\n').filter((l) => /\.ogg$/.test(l));
  check('5 every sound is stored, not compressed', list.length > 0 && list.every((l) => l.trim().split(/\s+/)[1] === 'Stored'), list.length);
  const aab = fs.readdirSync(path.join(android, 'build-play')).filter((f) => f.endsWith('.aab')).sort((a, b) => fs.statSync(path.join(android, 'build-play', b)).mtimeMs - fs.statSync(path.join(android, 'build-play', a)).mtimeMs)[0];
  const java = (process.env.JAVA_HOME || '/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home') + '/bin/keytool';
  const cert = aab && fs.existsSync(java) ? execFileSync(java, ['-printcert', '-jarfile', path.join(android, 'build-play', aab)], { encoding: 'utf8' }) : '';
  check('5 the newest bundle is signed by the upload key, not the prototype key', /Owner: CN=Qura Sakhi, O=Trinaya Wellness LLP, C=IN/.test(cert) && !/prototype/.test(cert), aab);
}

/* ---------- 6. the Gradle build (Version 39.79) ---------- */
check('6 Gradle and its Android plugin at pinned versions, the download checked against its checksum', /gradle-9\.9\.0-bin\.zip/.test(gw) && /^distributionSha256Sum=[0-9a-f]{64}$/m.test(gw) &&
  /id\("com\.android\.application"\) version "\d+\.\d+\.\d+"/.test(gk) && fs.existsSync(path.join(android, 'gradle/wrapper/gradle-wrapper.jar')));
check("6 no Kotlin library in a Java app, and no SDK downloads in the middle of a build", /^android\.builtInKotlin=false$/m.test(gp) && /^android\.builder\.sdkDownload=false$/m.test(gp));
check('6 the app is still com.quranutrition.sakhi: Gradle reads the manifest without its package line', /package="com\.quranutrition\.sakhi"/.test(mf) &&
  /sed 's\/ package="com\\\.quranutrition\\\.sakhi"\/\/' AndroidManifest\.xml > build\/AndroidManifest\.xml/.test(sh) &&
  /namespace = "com\.quranutrition\.sakhi"/.test(gk) && /applicationId = "com\.quranutrition\.sakhi"/.test(gk) && /manifest\.srcFile\("build\/AndroidManifest\.xml"\)/.test(gk) && /assets\.setSrcDirs\(listOf\("build\/assets"\)\)/.test(gk));
const proto = (gk.match(/create\("proto"\) \{[\s\S]*?\n        \}/) || [''])[0];
check("6 testers' APKs keep the prototype key, signed as before (v2, v3 and v4)", /file\("sakhi-prototype\.keystore"\)/.test(proto) && /keyAlias = "sakhi"/.test(proto) &&
  /enableV2Signing = true; enableV3Signing = true; enableV4Signing = true/.test(proto) && /\ngw -Psakhi\.signing=proto assembleRelease\n/.test(sh));
const pro = read('proguard-rules.pro');
check("6 R8 shrinks the libraries but renames nothing, and keeps every method the page calls", /isMinifyEnabled = true/.test(gk) && /proguardFiles\(getDefaultProguardFile\("proguard-android-optimize\.txt"\), "proguard-rules\.pro"\)/.test(gk) &&
  /^-dontobfuscate$/m.test(pro) && /-keepclassmembers class \* \{\s*@android\.webkit\.JavascriptInterface <methods>;\s*\}/.test(pro) && /^-keepattributes JavascriptInterface/m.test(pro) && !/isShrinkResources = true/.test(gk));
check('6 the build folder is set before anything uses it (R8 found its rules in build/, which build-apk.sh empties)', gk.indexOf('layout.buildDirectory.set(file("build-gradle"))') > 0 && gk.indexOf('layout.buildDirectory.set') < gk.indexOf('android {'));

const failed = results.filter((r) => !r.pass);
console.log(results.length - failed.length + '/' + results.length + ' Play checks passed');
if (failed.length) process.exit(1);
