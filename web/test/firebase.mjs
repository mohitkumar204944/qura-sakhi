// Version 39.79: "Share how I use Sakhi" through Firebase Analytics, events only (MODULE_API section 122). It replaces Version
// 39.60's PostHog (test/posthog.mjs) with the same rules. The page never talks to Google: it hands each event to the Android app
// (the bridge's usage, usageEvent and usageForget), whose Java (android/usage/firebase/.../Usage.java) checks it again. A fake
// bridge keeps every call, so the checks see exactly what would reach Firebase.
// Checks:
//   1. a build without Firebase: no switch, no notice line, nothing sent;
//   2. turned off: Firebase never switched on, nothing sent;
//   3. on by default (Mohit, 3 Nov): only Sakhi's five events, with their own parameters, neutral screen names (a plan's or
//      condition's name never), taps as their place in the page, no words from the screens, no number, no Hindi, no route;
//   4. the page itself reaches no other address (Firebase lives in the app's Java);
//   5. private screens switch Firebase off: nothing at all while she is there, taps included;
//   6. errors go with their type and place, never their message;
//   7. discreet mode and a shared phone switch it off at once; off in Me switches it off and forgets the anonymous id; on again
//      starts afresh;
//   8. Hindi at 360 px;
//   9. the app's side: the manifest keeps ad IDs, Android ID, ad consents and automatic screens off and drops AD_ID and the install
//      referrer, Firebase is off until the page says, the Java checks the same five events and values, and a build without
//      google-services.json has no Firebase at all.
// Usage: node test/firebase.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const android = path.resolve(here, '../../android');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isoAgo = (d) => { const x = new Date(); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() - d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me'].map((k) => [k, { st: 'done', d: isoAgo(3) }]));
const seedOf = (extra) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1992-07-01', consent: { c1: isoAgo(30), c2: null, c4: null }, situation: { stage: 'cycle' },
  events: [{ d: isoAgo(52), t: 'start' }, { d: isoAgo(47), t: 'end' }, { d: isoAgo(24), t: 'start' }, { d: isoAgo(19), t: 'end' }], daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: isoAgo(3) } }, extra || {}, { settings: Object.assign({ toursAuto: false }, (extra || {}).settings || {}) });
/* the Android app's bridge: only the usage methods, each call kept with when it was made */
const bridge = (ok) => 'window.__fb = { calls: [] }; window.SakhiAndroid = { usageOk(){ return ' + (ok ? 'true' : 'false') + '; }, ' +
  'usage(on){ window.__fb.calls.push({ k: "usage", on: on, at: Date.now() }); }, usageEvent(n, j){ window.__fb.calls.push({ k: "event", name: n, p: JSON.parse(j), at: Date.now() }); }, ' +
  'usageForget(){ window.__fb.calls.push({ k: "forget", at: Date.now() }); } };';

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ api: 'https://api.test.invalid', app: 'test-0.39.79-demo', platform: 'android' }) + ';');
  if (o.bridge !== null) await ctx.addInitScript(bridge(o.bridge !== false));
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify({ token: 'test', id: 'test', phone: '+919876543210', name: 'Asha', pincode: '560001', activeOn: isoAgo(0) })) + '); }');
  const reqs = [];
  await ctx.route(/^https?:/, (r) => { const q = r.request(); reqs.push({ host: new URL(q.url()).host, type: q.resourceType() }); r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":1}' }); });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => { if (!/SAKHI-TEST-THROW/.test(e.message)) errs.push(String(e.message).slice(0, 200)); });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await sleep(400);
  return { ctx, page, errs, reqs };
}
const go = async (page, h, ms) => { await page.evaluate((x) => { location.hash = x; }, h); await sleep(ms || 350); };
const calls = (page) => page.evaluate(() => (window.__fb ? window.__fb.calls : []));
const events = async (page) => (await calls(page)).filter((c) => c.k === 'event');
const lastOn = async (page) => { const u = (await calls(page)).filter((c) => c.k === 'usage'); return u.length ? u[u.length - 1].on : null; };
const tapAll = (page, n) => page.evaluate((k) => { const b = [...document.querySelectorAll('#view button, #view a, #view [data-go]')].filter((x) => x.offsetParent).slice(0, k); b.forEach((x) => x.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 20, clientY: 20 }))); return b.length; }, n);
const viewText = (page) => page.$eval('#view', (e) => e.innerText);

/* ---------- 1. A build without Firebase ---------- */
for (const kind of ['no bridge', 'usageOk false']) {
  const { ctx, page, errs, reqs } = await open({ bridge: kind === 'no bridge' ? null : false });
  await go(page, 'me-privacy');
  check('1 ' + kind + ': no "Share how I use Sakhi" switch', !(await page.$('[data-set="ph"]')) && !/Share how I use Sakhi/.test(await viewText(page)));
  await go(page, 'home'); await go(page, 'diary'); await tapAll(page, 3); await sleep(300);
  check('1 ' + kind + ': Firebase is never switched on and nothing is sent', (await calls(page)).every((c) => c.k === 'usage' ? c.on === false : false), await calls(page));
  await go(page, 'me-about');
  check('1 ' + kind + ': the data notice has no usage line', !/Firebase|PostHog|How you use Sakhi/.test(await viewText(page)));
  check('1 ' + kind + ': the page reaches only the accounts server', reqs.every((x) => x.host === 'api.test.invalid'), reqs);
  check('1 ' + kind + ': no page errors', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 2. Off when she turned it off ---------- */
{
  const { ctx, page, errs } = await open({ seed: { settings: { ph: false } } });
  await go(page, 'home'); await go(page, 'diary'); await tapAll(page, 3); await sleep(300);
  const c = await calls(page);
  check('2 turned off: Firebase never switched on, nothing sent', c.every((x) => x.k === 'usage' && x.on === false), c);
  await go(page, 'me-privacy');
  check('2 turned off: the switch shows off', !(await page.$eval('[data-set="ph"]', (e) => e.checked)));
  check('2 turned off: no page errors', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 3 to 7. On by default (Mohit, 3 Nov) ---------- */
{
  const { ctx, page, errs, reqs } = await open();
  check('3 on by default: Firebase is switched on without her touching anything', (await lastOn(page)) === true && (await page.evaluate(() => window.Saathi.fb.on())));
  check('3 the first screen is named', (await events(page)).some((e) => e.name === 'screen_view' && e.p.screen_name === 'home'), await events(page));
  await go(page, 'me-privacy');
  const txt = await viewText(page);
  check('3 the switch is in Me > Privacy, under "Help improve Sakhi", and shows on', /Help improve Sakhi[\s\S]*Share how I use Sakhi/.test(txt) && await page.$eval('[data-set="ph"]', (e) => e.checked));
  check('3 its words say what goes, where, what Google also sees, and how to turn it off', /never the words on them/.test(txt) && /Google Firebase Analytics/.test(txt) && /phone's type and your rough area/.test(txt) &&
    /never your exact place/.test(txt) && /Private pages, discreet mode and a shared phone send nothing/.test(txt) && /on unless you turn it off here/.test(txt) && !/PostHog|Europe/.test(txt), txt.slice(0, 900));
  await go(page, 'me-about');
  check('3 the data notice says it, and where to turn it off', /How you use Sakhi: which screens you open[\s\S]*Google Firebase Analytics[\s\S]*rough area[\s\S]*Privacy on a shared phone/.test(await viewText(page)));
  check('3 the notice she agrees to is marked ".fb"', /Version 39\.79/.test(fs.readFileSync(path.join(root, 'app.js'), 'utf8')) && /NOTICE_V \+ \(fbAvail\(\) \? '\.fb' : ''\)/.test(fs.readFileSync(path.join(root, 'app.js'), 'utf8')));
  const words = new Set();
  const grab = async () => (await viewText(page)).split(/\s+/).filter((w) => /^[A-Za-z]{6,}$/.test(w)).forEach((w) => words.add(w));
  const walk = ['home', 'diary', 'plan', 'plan-pmos', 'per-lesson', 'relief-cramps', 'calm', 'cond-fibroids', 'preg-week', 'periods-pain', 'ask-call', 'report', 'help', 'library', 'home'];
  for (const h of walk) { await go(page, h, 450); await grab(); await tapAll(page, 2); }
  /* a rage tap: four quick taps in one place */
  await page.evaluate(() => { const el = document.querySelector('#view h1, #view h2, #view p'); for (let i = 0; i < 4; i++) el.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 40, clientY: 120 })); });
  /* a dead tap: a button that does nothing */
  await page.evaluate(() => { const b = document.createElement('button'); b.type = 'button'; b.id = 'fb-dead'; b.textContent = 'Nothing'; document.querySelector('#view').appendChild(b); });
  await sleep(200); await page.evaluate(() => document.getElementById('fb-dead').dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 50, clientY: 400 }))); await sleep(1900);
  /* errors with words in their message: one thrown on its own, one inside Sakhi's safe() */
  await page.evaluate(() => setTimeout(() => { throw new TypeError('SAKHI-TEST-THROW period pain 9000000001'); }, 0)); await sleep(300);
  await page.evaluate(() => window.Saathi.fb.safe(() => { throw new RangeError('SAKHI-TEST-THROW pregnancy 9000000002'); })); await sleep(200);
  /* 5. private screens: Firebase off while she is there, and nothing sent, taps included */
  /* taps that stay on the page (text and headings, four quick ones on one spot too): a button there could take her back to Home */
  const tapText = () => page.evaluate(() => { const els = [...document.querySelectorAll('#view h1, #view h2, #view h3, #view p, #view li')].filter((x) => x.offsetParent).slice(0, 6);
    els.forEach((x) => x.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 30, clientY: 30 }))); for (let i = 0; i < 4 && els[0]; i++) els[0].dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 40, clientY: 90 })); return els.length; });
  await go(page, 'loss', 500); const t0 = Date.now(); const offAtLoss = await lastOn(page); const tappedLoss = await tapText(); const stillLoss = await page.evaluate(() => location.hash);
  await go(page, 'pregtest-abortion', 500); const tappedAb = await tapText(); await sleep(1700); const t1 = Date.now();
  const offAtAbortion = await lastOn(page); const stillAb = await page.evaluate(() => location.hash);
  await go(page, 'home', 500);
  const all = await calls(page);
  const inPrivate = all.filter((c) => c.k === 'event' && c.at >= t0 && c.at <= t1);

  const evs = all.filter((c) => c.k === 'event');
  const names = [...new Set(evs.map((e) => e.name))];
  check('3 only screen views, taps, rage and dead taps and errors leave', names.every((n) => ['screen_view', 'tap', 'rage_tap', 'dead_tap', 'app_error'].indexOf(n) >= 0) && names.includes('screen_view') && names.includes('tap'), names);
  const OK_P = { screen_view: ['screen_name', 'screen_class'], tap: ['screen', 'place', 'to'], rage_tap: ['screen', 'place'], dead_tap: ['screen', 'place'], app_error: ['screen', 'type', 'file', 'line'] };
  const extra = evs.filter((e) => Object.keys(e.p).some((k) => OK_P[e.name].indexOf(k) < 0));
  check('3 every parameter is on its event\'s allowlist', extra.length === 0, extra.slice(0, 3));
  const OK_SCREENS = new Set(['home', 'your-sakhi', 'join-update', 'diary', 'learn', 'help', 'me', 'checkin', 'pattern', 'fertile', 'ask', 'ask-call', 'care', 'library', 'report', 'report-show', 'calm', 'plan',
    'plan-start', 'plan-goal', 'plan-reveal', 'plan-checkin', 'plan-end', 'plan-progress', 'plan-plate', 'plan-body', 'plan-moves', 'plan-calm', 'plan-wind', 'food', 'explain', 'docportal', 'lang',
    'joy', 'joy-quiz', 'asha', 'asha-show', 'iron', 'journey', 'relief', 'lesson', 'article', 'condition', 'pregnancy-test', 'pregnancy', 'after-birth', 'midlife', 'trying', 'periods',
    'contraception', 'screening', 'selfcheck', 'care-access', 'tools', 'family', 'other']);
  const screens = [...new Set(evs.flatMap((e) => ['screen_name', 'screen_class', 'screen', 'to'].filter((k) => k in e.p).map((k) => e.p[k])))];
  check('3 screen names are neutral: a plan, lesson or condition keeps only its kind', screens.every((s) => OK_SCREENS.has(s)) && ['plan', 'lesson', 'relief', 'condition', 'pregnancy', 'periods', 'library'].every((s) => screens.includes(s)), screens);
  const views = evs.filter((e) => e.name === 'screen_view' && e.at < t0).map((e) => e.p.screen_name);   /* before the private screens' break */
  check('3 a screen is named once when she arrives, not on every repaint', views.every((v, i) => i === 0 || v !== views[i - 1]), views);
  const blob = JSON.stringify(evs.map((e) => [e.name, e.p]));
  const ROUTES = /pmos|per-lesson|relief-cramps|cramps|fibroids|preg-week|periods-pain|index\.html|file:|#[a-z]/i;
  check('3 no route, file path or plan name anywhere in what leaves', !ROUTES.test(blob), (blob.match(ROUTES) || [])[0]);
  const leaked = [...words].filter((w) => !OK_SCREENS.has(w.toLowerCase()) && !/^(screen|button|article|section|header|footer|details|summary|select|option|strong|figure|TypeError|RangeError)$/i.test(w) && new RegExp('\\b' + w + '\\b').test(blob));
  check('3 no words from the screens she saw', leaked.length === 0, leaked.slice(0, 12));
  check('3 no phone number, no Hindi, no spaces in any value', !/(?<![0-9a-f-])[6-9][0-9]{9}(?![0-9])/.test(blob) && !/[ऀ-ॿ]/.test(blob) && evs.every((e) => Object.values(e.p).every((v) => typeof v === 'number' || !/\s/.test(v))));
  const places = evs.filter((e) => e.p.place).map((e) => e.p.place);
  check('3 a tap is its place in the page only (tag and position)', places.length > 0 && places.every((c) => /^[a-z][a-z0-9-]*:\d+(<[a-z][a-z0-9-]*:\d+)*$/.test(c) && c.length <= 100), places.slice(0, 3));
  check('3 a tap that opens a screen names it neutrally ("to")', evs.some((e) => e.name === 'tap' && e.p.to) && evs.filter((e) => e.p.to).every((e) => OK_SCREENS.has(e.p.to)));
  check('3 a rage tap is counted', names.includes('rage_tap'), names);
  check('3 a dead tap is counted (a button that did nothing)', evs.some((e) => e.name === 'dead_tap'), names);
  /* 4 */
  check('4 the page reaches no address but the accounts server (Firebase lives in the app\'s Java)', reqs.filter((x) => x.type !== 'document').every((x) => x.host === 'api.test.invalid'), [...new Set(reqs.map((x) => x.host))]);
  check('4 the page loads no analytics code', await page.evaluate(() => [...document.scripts].every((s) => !/posthog|firebase|gtag|analytics/i.test(s.src))) && !(await page.evaluate(() => !!window.posthog || !!window.firebase || !!window.gtag)));
  /* 5 */
  check('5 a private screen switches Firebase off', offAtLoss === false && offAtAbortion === false, [offAtLoss, offAtAbortion]);
  check('5 ... and sends nothing while she is there, taps included', tappedLoss > 0 && tappedAb > 0 && stillLoss === '#loss' && stillAb === '#pregtest-abortion' && inPrivate.length === 0, [tappedLoss, tappedAb, stillLoss, stillAb, inPrivate.map((e) => [e.name, e.p])]);
  check('5 back on a public screen, it is on again', (await lastOn(page)) === true);
  /* 6 */
  const ex = evs.filter((e) => e.name === 'app_error');
  check('6 errors go with their type, thrown anywhere or inside safe()', ['TypeError', 'RangeError'].every((t) => ex.some((e) => e.p.type === t)), ex.map((e) => e.p));
  check('6 never their message', !/SAKHI-TEST-THROW|9000000001|9000000002|pain|pregnancy"/.test(JSON.stringify(ex)), ex.map((e) => e.p));
  check('6 a file is named, never its path', ex.every((e) => !e.p.file || /^[A-Za-z0-9_.-]+\.js$/.test(e.p.file)));

  /* ---------- 7. Discreet, shared, off ---------- */
  const n1 = (await events(page)).length;
  await page.evaluate(() => { window.Saathi.state.settings.discreet = true; }); await go(page, 'diary'); await tapAll(page, 3); await go(page, 'plan');
  check('7 discreet mode: Firebase off, nothing goes', (await lastOn(page)) === false && (await events(page)).length === n1, (await events(page)).length - n1);
  await page.evaluate(() => { window.Saathi.state.settings.discreet = false; window.Saathi.state.settings.shared = true; }); await go(page, 'home'); await tapAll(page, 3);
  check('7 shared phone: Firebase off, nothing goes', (await lastOn(page)) === false && (await events(page)).length === n1, (await events(page)).length - n1);
  await page.evaluate(() => { window.Saathi.state.settings.shared = false; }); await go(page, 'me-privacy');
  const forgets0 = (await calls(page)).filter((c) => c.k === 'forget').length;
  await page.$eval('[data-set="ph"]', (e) => e.click()); await sleep(300);
  const n2 = (await events(page)).length;
  await go(page, 'home'); await go(page, 'diary'); await tapAll(page, 3); await sleep(300);
  check('7 off in Me: Firebase off, nothing more goes', (await lastOn(page)) === false && (await events(page)).length === n2, (await events(page)).length - n2);
  check('7 off in Me: the anonymous id is forgotten, once', (await calls(page)).filter((c) => c.k === 'forget').length === forgets0 + 1);
  await go(page, 'me-privacy'); await page.$eval('[data-set="ph"]', (e) => e.click()); await sleep(300);
  const n3 = (await events(page)).length; await go(page, 'home'); await go(page, 'calm');
  check('7 on again: Firebase on, and screens are named again', (await lastOn(page)) === true && (await events(page)).slice(n3).some((e) => e.name === 'screen_view' && e.p.screen_name === 'calm'));
  check('page errors: none', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 7b. A sample woman sends nothing ---------- */
{
  const { ctx, page, errs } = await open({ seed: { sample: 'priya' } });
  await go(page, 'home'); await go(page, 'diary'); await tapAll(page, 3); await sleep(300);
  check('7b a sample woman: Firebase never switched on, nothing sent', (await calls(page)).every((x) => x.k === 'usage' && x.on === false), await calls(page));
  check('7b no page errors', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 8. Hindi at 360 px ---------- */
{
  const { ctx, page, errs } = await open({ lang: 'hi', w: 360, seed: { lang: 'hi' } });
  await go(page, 'me-privacy');
  const txt = await viewText(page);
  check('8 Hindi: the switch in her language', /मैं Sakhi कैसे इस्तेमाल करती हूँ/.test(txt) && /Google Firebase Analytics/.test(txt) && /मोटा-मोटा इलाका/.test(txt) && /निजी पन्ने/.test(txt) && !/PostHog|यूरोप/.test(txt), txt.slice(0, 300));
  check('8 Hindi: nothing wider than the screen', await page.evaluate(() => document.documentElement.scrollWidth <= 360));
  check('8 Hindi: no page errors', errs.length === 0, errs);
  await ctx.close();
}
await browser.close();

/* ---------- 9. The app's side ---------- */
{
  const rd = (f) => fs.readFileSync(path.join(android, f), 'utf8');
  const mf = rd('AndroidManifest.xml'), gk = rd('build.gradle.kts'), sh = rd('build-apk.sh'), main = rd('src/com/quranutrition/sakhi/MainActivity.java');
  const fbj = rd('usage/firebase/com/quranutrition/sakhi/Usage.java'), none = rd('usage/none/com/quranutrition/sakhi/Usage.java');
  const meta = (k, v) => new RegExp('<meta-data android:name="' + k + '" android:value="' + v + '" />').test(mf);
  check('9 the manifest: off until the page turns it on; no ad ID, Android ID, ad storage, ad data, ad personalisation or automatic screens',
    meta('firebase_analytics_collection_enabled', 'false') && meta('google_analytics_adid_collection_enabled', 'false') && meta('google_analytics_ssaid_collection_enabled', 'false') &&
    meta('google_analytics_default_allow_ad_storage', 'false') && meta('google_analytics_default_allow_ad_user_data', 'false') && meta('google_analytics_default_allow_ad_personalization_signals', 'false') &&
    meta('google_analytics_automatic_screen_reporting_enabled', 'false'));
  check('9 the manifest takes out the ad permissions Firebase brings (the advertising ID, the Privacy Sandbox\'s ad ID and ad attribution, Play\'s install referrer)', ['com.google.android.gms.permission.AD_ID', 'android.permission.ACCESS_ADSERVICES_AD_ID', 'android.permission.ACCESS_ADSERVICES_ATTRIBUTION', 'com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE'].every((p) => mf.indexOf('<uses-permission android:name="' + p + '" tools:node="remove" />') >= 0) && /xmlns:tools="http:\/\/schemas\.android\.com\/tools"/.test(mf));
  check('9 Firebase is switched off as the app opens, before the page loads', /Usage\.on\(getApplicationContext\(\), false\);[\s\S]*tts = new TextToSpeech/.test(main));
  check('9 the bridge has the four usage calls and nothing else of Firebase', ['usageOk', 'usage', 'usageEvent', 'usageForget'].every((m) => new RegExp('public \\w+ ' + m + '\\(').test(main)) && !/FirebaseAnalytics/.test(main));
  const jsNames = Object.keys({ screen_view: 1, tap: 1, rage_tap: 1, dead_tap: 1, app_error: 1 }).join('|');
  check('9 the Java checks the same five events and short values with no spaces', fbj.indexOf('"^(' + jsNames + ')$"') >= 0 && /"\^\[A-Za-z0-9:<_\.-\]\{1,100\}\$"/.test(fbj) &&
    /const FB_VALUE = \/\^\[A-Za-z0-9:<_\.-\]\{1,100\}\$\//.test(fs.readFileSync(path.join(root, 'app.js'), 'utf8')) && /n < 25/.test(fbj));
  check('9 ad consents always denied, analytics only while on', /AD_STORAGE, FirebaseAnalytics\.ConsentStatus\.DENIED/.test(fbj) && /AD_USER_DATA, FirebaseAnalytics\.ConsentStatus\.DENIED/.test(fbj) &&
    /AD_PERSONALIZATION, FirebaseAnalytics\.ConsentStatus\.DENIED/.test(fbj) && /ANALYTICS_STORAGE, on \? FirebaseAnalytics\.ConsentStatus\.GRANTED : FirebaseAnalytics\.ConsentStatus\.DENIED/.test(fbj) &&
    /setAnalyticsCollectionEnabled\(on\)/.test(fbj) && /resetAnalyticsData\(\)/.test(fbj));
  check('9 without google-services.json: no Firebase code, plugin or library, and no switch', /val firebase = file\("google-services\.json"\)\.exists\(\)/.test(gk) && /if \(firebase\) apply\(plugin = "com\.google\.gms\.google-services"\)/.test(gk) &&
    /if \(firebase\) "usage\/firebase" else "usage\/none"/.test(gk) && /if \(firebase\) \{\s*implementation\(platform\("com\.google\.firebase:firebase-bom:[\d.]+"\)\)\s*implementation\("com\.google\.firebase:firebase-analytics"\)/.test(gk) &&
    /static final boolean AVAILABLE = false;/.test(none) && !/firebase/i.test(none.replace(/\/\*[\s\S]*?\*\//g, '')));
  check('9 the settings file stays out of git, and PostHog is gone from the build', /^android\/google-services\.json$/m.test(fs.readFileSync(path.resolve(android, '../.gitignore'), 'utf8')) &&
    !/posthog\.com|vendor\/posthog|PH_HOSTS/.test(sh) && !fs.existsSync(path.join(root, 'vendor/posthog.js')));
}

const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' + failed.length + ' of ' : 'All ') + results.length + ' checks' + (failed.length ? '' : ' passed') + ' (firebase: Version 39.79)');
process.exit(failed.length ? 1 : 0);
