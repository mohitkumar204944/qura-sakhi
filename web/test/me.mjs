// The Me page as a short page of rows with a page each (Mohit, 22 Oct 2026: "do quick wins and restructure together";
// docs/ux-audit-me-2026-10-22.md). Checks: the main page fits about two screens with privacy first; no health condition is
// named on it (and none in discreet mode); each sub-page and where module rows went; on/off switches; one Stage row; the
// PIN asked again for health details; the data summary; the prototype settings hidden behind five taps on the version;
// Delete everything; the Me tour still finds its features; Hindi on a 360 px phone; the web version without reminders.
// Usage: node test/me.mjs [dir]   (dir defaults to this app folder). Screenshots go to test/shots/me-*.png.
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const shots = path.join(here, 'shots'); fs.mkdirSync(shots, { recursive: true });
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 500)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const iso = (d) => new Date(Date.now() - d * 864e5).toISOString().slice(0, 10);
/* the Android app's bridge, as far as Me uses it */
const ANDROID = 'window.SakhiAndroid = { schedule(){}, setDisguise(){}, isDisguised(){ return false; }, canNotify(){ return true; }, askNotify(){}, testNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, canBiometric(){ return false; }, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){} };';
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me'].map((k) => [k, { st: 'done', d: iso(3) }]));
const seedOf = (extra) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1994-07-01', consent: { c1: iso(30), c2: null, c4: null }, situation: { stage: 'cycle', pcos: true },
  events: [{ d: iso(52), t: 'start' }, { d: iso(47), t: 'end' }, { d: iso(24), t: 'start' }, { d: iso(19), t: 'end' }], daily: { [iso(2)]: { pain: ['cramps'] } }, notes: { [iso(1)]: 'x' }, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: iso(3) }, settings: { toursAuto: false } }, extra || {});

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = { api: "", app: "test-0.25", platform: "android" };');
  if (o.android !== false) await ctx.addInitScript(ANDROID);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify({ token: 'test', id: 'test', phone: '+919876543210', name: 'Asha', pincode: '560001', activeOn: iso(0) })) + '); }');
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.goto(PAGE + (o.hash || '#me'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await sleep(300);
  return { ctx, page, errs };
}
const tap = (page, sel) => page.$eval(sel, (el) => el.click());
const go = async (page, h) => { await page.evaluate((x) => { location.hash = x; }, h); await sleep(250); };
const view = (page) => page.$eval('#view', (e) => e.innerText);
const rows = (page) => page.$$eval('#view .item', (xs) => xs.map((x) => { const s = x.querySelector('strong'); return { go: x.dataset.go || '', id: x.id || '', t: s ? s.innerText : x.innerText.trim().slice(0, 40) }; }));
const CONDITIONS = /PMOS|PCOS|Pregnant|Breastfeeding|Planning a baby|periods have stopped|hormone medicine|Hysterectomy|Thyroid/;

/* ---------- 1. The main page: short, privacy first, no condition named ---------- */
{
  const { ctx, page, errs } = await open();
  const r = await rows(page);
  const order = r.map((x) => x.go || x.id);
  check('1 the rows, in order: account, privacy, health, reminders, language, data, look, help, about, then delete',
    JSON.stringify(order) === JSON.stringify(['account', 'me-privacy', 'me-health', 'me-reminders', 'lang', 'me-data', 'me-look', 'me-help', 'me-about', 'me-del']), order);
  check('1 her name and masked number head the page', r[0].t === 'Asha' && /Asha\s*\+91\u00a0•••••\u00a0•3210/.test(await view(page)), await view(page));
  check('1 privacy says what is on', /Privacy on a shared phone/.test(await view(page)) && /Nothing switched on yet/.test(await view(page)));
  check('1 health shows her stage, and names no condition', /Tracking my periods/.test(await view(page)) && !CONDITIONS.test(await view(page)), await view(page));
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  check('1 it fits about two screens (was 5.7)', h <= 2 * 844, h);
  check('1 no prototype section and no approval tag on Me', !/Prototype|Needs approval/.test(await view(page)));
  check('1 the doctor view and the garden moved to their pages', !r.some((x) => x.go === 'docportal' || x.go === 'joy'));
  await page.screenshot({ path: path.join(shots, 'me-1-main.png'), fullPage: true });
  check('1 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 2. Discreet mode: the main page names nothing about her health ---------- */
{
  const { ctx, page, errs } = await open({ seed: { settings: { toursAuto: false, discreet: true } } });
  const tx = await view(page);
  check('2 discreet: "My details", "Only you can see these"', /My details/.test(tx) && /Only you can see these/.test(tx));
  check('2 discreet: no stage, condition or "period" on Me', !CONDITIONS.test(tx) && !/period|Tracking/i.test(tx), tx);
  check('2 discreet shows in the privacy summary', /On: Discreet mode/.test(tx));
  check('2 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 3. Privacy: four switches; a switch is a switch ---------- */
{
  const { ctx, page, errs } = await open();
  await go(page, '#me-privacy');
  const sw = await page.$$eval('#view .item > input[type=checkbox]', (xs) => xs.map((x) => ({ role: x.getAttribute('role'), w: Math.round(x.getBoundingClientRect().width), app: getComputedStyle(x).appearance })));
  check('3 four switches: discreet, shared phone, app lock, hide the app', sw.length === 4, sw);
  check('3 drawn and announced as switches', sw.every((x) => x.role === 'switch' && x.w === 48 && x.app === 'none'), sw);
  await page.$eval('[data-set="discreet"]', (el) => el.click()); await sleep(200);
  await go(page, '#me');
  check('3 the main page summary follows', /On: Discreet mode/.test(await view(page)));
  await page.screenshot({ path: path.join(shots, 'me-3-privacy.png') });
  check('3 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 4. Health details: one Stage row, four conditions; with app lock, the PIN again ---------- */
{
  const { ctx, page, errs } = await open();
  await go(page, '#me-health');
  const sits = await page.$$eval('#view [data-sit]', (xs) => xs.map((x) => x.dataset.sit + (x.checked ? '+' : '')));
  check('4 the conditions stay as switches; the stage ones are gone', JSON.stringify(sits) === JSON.stringify(['hormones', 'pcos+', 'thyroid', 'hysterectomy']), sits);
  check('4 one Stage row in the stage sheet\'s own words', /Tracking my periods/.test(await page.$eval('#me-stage', (e) => e.innerText)) && /Change stage/.test(await page.$eval('#me-stage', (e) => e.innerText)));
  await tap(page, '#me-stage'); await sleep(250);
  check('4 it opens the stage sheet', (await page.$$('#sheet-root [data-stage]')).length === 6);
  await page.evaluate(() => { document.querySelector('#st-cancel').click(); }); await sleep(150);
  await page.$eval('[data-sit="thyroid"]', (el) => el.click()); await sleep(150);
  check('4 a condition switch saves', await page.evaluate(() => window.Saathi.state.situation.thyroid === true));
  /* app lock on, through the real PIN sheet */
  await go(page, '#me-privacy'); await page.$eval('#me-lock', (el) => el.click()); await sleep(200);
  const pin = async (digits) => { for (const d of digits) { await page.$eval('[data-k="' + d + '"]', (el) => el.click()); await sleep(40); } await sleep(150); };
  await pin('1234'); await pin('1234');
  check('4 app lock set', await page.evaluate(() => !!window.Saathi.state.settings.pinHash));
  await go(page, '#me-health');
  check('4 with app lock, health details ask for the PIN first', !!(await page.$('#view .pinpad')) && !(await page.$('#view [data-sit]')));
  await pin('0000');
  check('4 a wrong PIN is refused', /did not match/.test(await view(page)) && !(await page.$('#view [data-sit]')), await view(page));
  await pin('1234');
  check('4 the right PIN opens them', !!(await page.$('#view [data-sit]')));
  await go(page, '#me'); await go(page, '#me-health');
  check('4 it holds while she stays in Sakhi', !!(await page.$('#view [data-sit]')));
  await page.evaluate(() => { window.__sakhiPause(); window.__sakhiResume(); }); await go(page, '#me'); await go(page, '#me-health');
  check('4 after Sakhi went to the background, the PIN again', !!(await page.$('#view .pinpad')));
  check('4 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 5. My data: report, backup, sharing as a switch with the doctor view, what Sakhi keeps ---------- */
{
  const { ctx, page, errs } = await open();
  await go(page, '#me-data');
  const r = await rows(page);
  check('5 report, backup, sharing and the doctor view are here', ['report', 'backup', 'docportal'].every((g) => r.some((x) => x.go === g)) && !!(await page.$('#me-c4')));
  check('5 no approval tag unless prototype labels are on', !/Needs approval/.test(await view(page)));
  check('5 sharing is off and says so', /Share with my Qura doctor\s*Off/.test(await view(page)) && (await page.$eval('#me-c4', (e) => e.getAttribute('role'))) === 'switch');
  await page.$eval('#me-c4', (el) => el.click()); await sleep(200);
  check('5 switching it on records today', await page.evaluate(() => window.Saathi.state.consent.c4 === window.Saathi.toISO(window.Saathi.today())) && /Given/.test(await view(page)));
  const keeps = await page.$eval('#me-keeps', (e) => e.innerText);
  check('5 what Sakhi keeps, in words', /Periods logged\s*2/.test(keeps) && /Days with something noted\s*2/.test(keeps) && /saved only on this phone/.test(keeps), keeps);
  await tap(page, '#me-export'); await sleep(150);
  check('5 the raw data is one tap further', /"events"/.test(await page.$eval('#me-out textarea', (e) => e.value)));
  check('5 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 6. Appearance (theme, Sakhi's look, the garden), Help (tours), About (notice, version, prototype) ---------- */
{
  const { ctx, page, errs } = await open();
  await go(page, '#me-look');
  check('6 appearance: three themes, four looks, the garden', (await page.$$('[data-theme-pick]')).length === 3 && (await page.$$('[data-look]')).length === 4 && !!(await page.$('#view [data-go="joy"]')));
  await tap(page, '[data-theme-pick="dark"]'); await sleep(150);
  check('6 a theme choice saves', await page.evaluate(() => window.Saathi.state.settings.theme === 'dark'));
  await go(page, '#me-help');
  check('6 help: the full tour, the tours, the two switches and Show the tours again', !!(await page.$('[data-tour-full]')) && (await page.$$('[data-tour-run]')).length >= 10 && !!(await page.$('[data-set="toursAuto"]')) && !!(await page.$('#me-tips')));
  await go(page, '#me-about');
  const tx = await view(page);
  check('6 about: the notice, the grievance contact and the version', (await page.$$('#view .ob-ul li')).length === 5 && /Grievance Officer/.test(tx) && /Version test-0\.25/.test(tx));
  check('6 no prototype settings at first', !/Prototype/.test(tx) && !(await page.$('[data-set="proto"]')));
  for (let i = 0; i < 5; i++) { await tap(page, '#me-version'); await sleep(40); }
  await sleep(200);
  check('6 five taps on the version show them', !!(await page.$('[data-set="proto"]')));
  await page.$eval('[data-set="proto"]', (el) => el.click()); await sleep(250);
  check('6 prototype labels on: the sample women appear', (await page.$$('[data-demo]')).length === 5);
  check('6 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 7. Delete everything: apart, asks first ---------- */
{
  const { ctx, page, errs } = await open();
  await tap(page, '#me-del'); await sleep(150);
  check('7 it asks first', /There is no undo/.test(await page.$eval('#me-out', (e) => e.innerText)));
  await tap(page, '#del-no'); await sleep(100);
  check('7 Cancel keeps everything', !(await page.$eval('#me-out', (e) => e.innerText)) && await page.evaluate(() => window.Saathi.state.stage === 'app'));
  await tap(page, '#me-del'); await sleep(100); await tap(page, '#del-yes'); await sleep(300);
  check('7 Yes deletes the diary on this phone', await page.evaluate(() => window.Saathi.state.stage === 'welcome' && !window.Saathi.state.events.length));
  check('7 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 8. The Me tour still finds its two features; back from a page returns to Me ---------- */
{
  const { ctx, page, errs } = await open();
  await page.evaluate(() => window.Saathi.startTour('me')); await sleep(600);
  const lit = async () => page.evaluate(() => { const h = document.querySelector('#tour-root #tour-h'); return h ? h.innerText : null; });
  check('8 step 1 lights the privacy row', (await lit()) === 'Privacy on a shared phone');
  await tap(page, '#tour-next'); await sleep(400);
  check('8 step 2 lights Delete everything', (await lit()) === 'Delete everything');
  await tap(page, '#tour-next'); await sleep(300);
  await go(page, '#me-data'); await page.$eval('#view .backrow button', (el) => el.click()); await sleep(250);
  check('8 back from a page returns to Me', (await page.evaluate(() => location.hash)) === '#me');
  check('8 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 9. Hindi on a 360 px phone: every Me page fits ---------- */
{
  const { ctx, page, errs } = await open({ seed: { lang: 'hi' }, w: 360, lang: 'hi' });
  const bad = [];
  for (const h of ['#me', '#me-privacy', '#me-health', '#me-reminders', '#me-data', '#me-look', '#me-help', '#me-about']) {
    await go(page, h);
    const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: window.innerWidth, raw: /\b(me|su|acc)_[a-z_]+\b/.test(document.getElementById('view').innerText) }));
    if (o.sw > o.w || o.raw) bad.push(h + ' ' + JSON.stringify(o));
  }
  check('9 every Me page fits 360 px in Hindi, with no raw keys', !bad.length, bad);
  await go(page, '#me');
  check('9 Hindi words', /मेरी सेहत की जानकारी/.test(await view(page)) && /शेयर्ड फ़ोन पर निजता/.test(await view(page)) && /इस फ़ोन से सब कुछ delete करें/.test(await view(page)));
  await page.screenshot({ path: path.join(shots, 'me-9-hindi-360.png'), fullPage: true });
  check('9 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 10. The web version (no Android app): no reminders row, and the page says why ---------- */
{
  const { ctx, page, errs } = await open({ android: false });
  check('10 no reminders row on the web', !(await rows(page)).some((x) => x.go === 'me-reminders'));
  await go(page, '#me-reminders');
  check('10 the reminders page explains', /Android/.test(await view(page)));
  check('10 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 11. Module buttons that pointed at Me now point at the right page ---------- */
{
  const src = (f) => fs.readFileSync(path.join(root, f), 'utf8');
  check('11 the contraception note opens My health details', /data-go="me-health">' \+ esc\(t\('contra_open_me'\)\)/.test(src('mods/contra.js')));
  check('11 the doctor portal\'s "change it" opens My data', /data-go="me-data">' \+ esc\(TF\('you_change'/.test(src('mods/docportal.js')));
}

await browser.close();
const pass = results.filter((r) => r.pass).length;
console.log(pass + '/' + results.length + ' Me checks pass');
process.exit(pass === results.length ? 0 : 1);
