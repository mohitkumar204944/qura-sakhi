// Ready for Google Play, 29 Oct 2026 (android/README.txt, "Google Play"). No browser: it reads the
// Android build, manifest and code, and the last Play bundle's APK when there is one.
//   1 target SDK 36 against platform 36, still Android 10 and up;
//   2 edge to edge: on Android 15+ the page is padded clear of the bars, the cut-out and the keyboard, older phones untouched;
//   3 Back through OnBackInvokedCallback on Android 13+, onBackPressed on 10 to 12, one back() for both;
//   4 the bundle: PLAY=1, never a demo name, signed with the upload key whose password never reaches a command line, sounds
//     uncompressed, the size ceiling, one version count, and no bundle or key in git;
//   5 the last bundle's APK (skipped when none was built): target 36, the back flag, stored sounds, the upload key.
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
const key = read('make-upload-key.sh'), cfg = JSON.parse(read('bundle-config.json'));
const gi = fs.readFileSync(path.resolve(android, '../.gitignore'), 'utf8');

/* ---------- 1. target SDK 36 ---------- */
check('1 compiled against platform 36 with build-tools 36', /platforms\/android-36\/android\.jar/.test(sh) && /build-tools\/36\.0\.0/.test(sh) && !/android-34|35\.0\.0/.test(sh));
const targets = sh.match(/--target-sdk-version \d+/g) || [];
check('1 every link targets SDK 36 (the APK and the bundle)', targets.length === 2 && targets.every((x) => x === '--target-sdk-version 36'), targets);
check('1 still Android 10 and up', (sh.match(/--min-sdk-version 29 /g) || []).length === 2 && /d8" --min-api 29 /.test(sh));

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
const play = (sh.match(/if \[ "\$PLAY" = "1" \]; then\n  "\$BT\/aapt2" link --proto-format[\s\S]*?\n  exit 0\nfi\n/) || [''])[0];
check('4 PLAY=1 builds a bundle and stops before the APK is signed or installed', play && sh.indexOf(play) < sh.indexOf('# 4. Package, align, sign') && /exit 0/.test(play) && !/adb/.test(play));
check('4 never a demo build on Play', /if \[ "\$PLAY" = "1" \]; then\n  case "\$VERSION_NAME" in \*demo\*\) echo "A Play build is for real women/.test(sh));
check('4 the base module: protobuf resources, the manifest and the dex where bundletool wants them', /mv build\/bundle\/base\/AndroidManifest\.xml build\/bundle\/base\/manifest\//.test(play) && /cp build\/dex\/classes\.dex build\/bundle\/base\/dex\//.test(play) &&
  /build-bundle --modules=build\/bundle\/base\.zip --config=bundle-config\.json/.test(play));
check('4 signed with the upload key, alias upload, never the prototype key', /jarsigner -keystore "\$UPLOAD_KS" -storepass:env SAKHI_UPLOAD_PASS/.test(play) && / upload >\/dev\/null/.test(play) && !/sakhi-prototype/.test(play) && /jar verified/.test(play));
check('4 the upload password never on a command line (env or the keychain only)', !/pass:"?\$SAKHI_UPLOAD_PASS|storepass "\$SAKHI_UPLOAD_PASS|-w "\$SAKHI_UPLOAD_PASS" *$/m.test(sh) &&
  /security find-generic-password -s "Qura Sakhi upload key" -a sakhi -w/.test(sh) && /-storepass:env SAKHI_UPLOAD_PASS -keypass:env SAKHI_UPLOAD_PASS/.test(key));
check('4 the key script never makes a second key over the first, and keeps the password before the key', /\[ ! -f "\$KS" \] \|\|/.test(key) && key.indexOf('add-generic-password') < key.indexOf('keytool -genkeypair') && /delete-generic-password/.test(key));
check('4 sounds stay uncompressed in the bundle, and the build checks it', JSON.stringify(cfg.compression.uncompressedGlob) === '["assets/**.ogg"]' && /\$2 != "Stored"/.test(play));
check('4 bundletool validates it, and the size ceiling applies', /bundletool" validate --bundle=build\/signed\.aab/.test(play.replace(/\$BUNDLETOOL/g, 'bundletool')) && /-gt \$\(\(MAX_APK_MB \* 1024 \* 1024\)\)/.test(play));
check('4 one version count: the floor reads the last APK and the last bundle', /for LASTF in QuraSakhi-prototype\.apk build-play\/last\.apk; do/.test(sh));
check('4 no bundle, key or Play output in git', /^android\/build-play\/$/m.test(gi) && /^\*\.aab$/m.test(gi) && /^\*\.keystore$/m.test(gi));

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

const failed = results.filter((r) => !r.pass);
console.log(results.length - failed.length + '/' + results.length + ' Play checks passed');
if (failed.length) process.exit(1);
