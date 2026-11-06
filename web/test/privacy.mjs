// Privacy and honesty on a shared phone (audit fixes 1a, 2, 6, 7, 8, 10, 28; docs/fix-plan-2026-10-22.md, Version 27).
// Checks: help never says "sent" or promises a reply; WhatsApp gets only a hello; with no number there is no "Tell a person";
// screens can't be captured while a privacy setting is on; the lock takes Sakhi's PIN, with a fingerprint only when she
// turned it on and never on a shared phone; shares use the phone's share sheet (no wa.me links); reminders hide from the lock
// screen in discreet mode and end with "open Sakhi"; approval tags only with prototype labels on; no request to Google; and,
// when android/build exists, the APK's page boots under its Content-Security-Policy with no violation.
// Usage: node test/privacy.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 500)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const iso = (d) => new Date(Date.now() - d * 864e5).toISOString().slice(0, 10);
const WA = '919876500000';
/* the Android bridge, recording what the page asks of it */
const ANDROID = (o) => 'window.__calls = []; const rec = (n) => (...a) => { window.__calls.push([n].concat(a)); return true; }; window.SakhiAndroid = { schedule: rec("schedule"), setDisguise(){}, isDisguised(){ return false; }, canNotify(){ return true; }, askNotify(){}, testNotify: rec("testNotify"), canExactAlarms(){ return true; }, askExactAlarms(){}, ' +
  'canBiometric(){ return ' + (o.bio ? 'true' : 'false') + '; }, biometric: rec("biometric"), setSecure: rec("setSecure"), share: rec("share"), maker(){ return "' + (o.maker || 'Google') + '"; }, openAppSettings: rec("openAppSettings"), speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){} };';
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me'].map((k) => [k, { st: 'done', d: iso(3) }]));
const seedOf = (extra) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1994-07-01', consent: { c1: iso(30), c2: null, c4: null }, situation: { stage: 'cycle' },
  events: [{ d: iso(52), t: 'start' }, { d: iso(47), t: 'end' }, { d: iso(24), t: 'start' }, { d: iso(19), t: 'end' }], daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: iso(3) } }, extra || {}, { settings: Object.assign({ toursAuto: false }, (extra || {}).settings || {}) });

const browser = await chromium.launch();
const google = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ api: '', app: 'test-0.26', platform: o.android === false ? 'web' : 'android', helpWa: o.wa === undefined ? WA : o.wa }) + ';');
  if (o.android !== false) await ctx.addInitScript(ANDROID(o));
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify({ token: 'test', id: 'test', phone: '+919876543210', name: 'Asha', pincode: '560001', activeOn: iso(0) })) + '); }');
  await ctx.route(/^https?:/, (r) => { const u = r.request().url(); if (/google|gstatic/.test(u)) google.push(u); r.abort(); });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await sleep(300);
  return { ctx, page, errs };
}
const tap = (page, sel) => page.$eval(sel, (el) => el.click());
const go = async (page, h) => { await page.evaluate((x) => { location.hash = x; }, h); await sleep(250); };
const view = (page) => page.$eval('#view', (e) => e.innerText);
const calls = (page, n) => page.evaluate((x) => window.__calls.filter((c) => c[0] === x), n);
const FALSE_PROMISE = /Received|Request saved|1 working day|replies within|reads this on working days|Reference Q[CS]-|In the live app|nothing was sent/i;

/* ---------- 1. Help that reaches a person, with nothing about her health in the link ---------- */
{
  const { ctx, page, errs } = await open({ hash: '#help' });
  check('1 Help no longer offers "Tell a person" (Version 39.68, the doctors\' review)', !(await page.$('#view [data-go="tell"]')));
  check('1 Help makes no reply-time promise', !FALSE_PROMISE.test(await view(page)), await view(page));
  await go(page, 'tell');
  check('1 the Tell page lands on Explore (Version 39.68)', (await page.evaluate(() => location.hash)) === '#care');
  /* "Ask a Qura doctor about this" keeps her questions on the phone; the WhatsApp text never carries them */
  await page.evaluate(() => { window.Saathi.ask('Heavy bleeding'); }); await sleep(250);
  await page.evaluate(() => { window.Saathi.ask('Thyroid test'); }); await sleep(250);
  const ask = await view(page);
  const askHref = await page.$eval('#ask-wa', (a) => a.getAttribute('href'));
  check('1 Ask books on WhatsApp with a hello only, no topic', decodeURIComponent(askHref.split('?text=')[1]) === 'Hello Qura team, I would like to book the free call with a Qura doctor. I am writing from the Sakhi app.' && !/bleeding|thyroid/i.test(decodeURIComponent(askHref)), askHref);
  check('1 Ask lists her questions for the call, kept on this phone', /Your questions for the call/.test(ask) && /Heavy bleeding/.test(ask) && /Thyroid test/.test(ask) && /Saved on this phone only/.test(ask), ask);
  check('1 Ask has no form and no "Request saved"', !(await page.$('#ask-form')) && !FALSE_PROMISE.test(ask), ask);
  await tap(page, '#ask-q-clear'); await sleep(200);
  check('1 the list clears', !(await page.$('#ask-qs')) && (await page.evaluate(() => window.Saathi.state.askTopics.length)) === 0);
  check('1 no page errors', errs.length === 0, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ hash: '#help', wa: '' });
  check('2 without a WhatsApp number, no "Tell a person"', !(await page.$('#view [data-go="tell"]')));
  await go(page, 'ask');
  check('2 without a number, Ask offers Qura\'s booking page', (await page.$eval('#ask-web', (a) => a.getAttribute('href'))) === 'https://quranutrition.com/book-consultation' && !(await page.$('#ask-wa')));
  await go(page, 'tell');
  check('2 an old link to Tell lands on Explore (Version 39.68: Tell a person is gone)', (await page.evaluate(() => location.hash)) === '#care');
  await go(page, 'checkin');
  check('2 no page errors', errs.length === 0, errs);
  await ctx.close();
}
{
  /* the check-in note for her doctor, and the share-with-doctor card, say the words stay on the phone */
  const { ctx, page } = await open({ hash: '#checkin', seed: { consent: { c1: iso(30), c2: null, c4: iso(5) } } });
  const ph = await page.$eval('#ci-note', (e) => e.getAttribute('placeholder')).catch(() => '');
  check('3 the check-in note says it stays on this phone', /stays in your diary on this phone/.test(ph) && !/working day|reads diaries/.test(await view(page)), ph);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ hash: '#ask', lang: 'hi', seed: { lang: 'hi' } });   /* Version 39.68: Tell a person is gone; Ask's hello is the one left */
  const href = await page.$eval('#ask-wa', (a) => a.getAttribute('href'));
  check('4 Hindi: the hello is in Hindi, the screen has no promise', /^नमस्ते Qura टीम/.test(decodeURIComponent(href.split('?text=')[1])) && !/कार्यदिवस में जवाब|मिल गया/.test(await view(page)), href);
  check('4 no page errors', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 2. Screen capture (Version 39.68, the doctors' answer 5: no screenshot block, whatever she turns on; Version 39.72: the page never asks for it); the lock takes Sakhi's PIN ---------- */
{
  const { ctx, page, errs } = await open({ hash: '#me-privacy', bio: true });
  check('5 nothing on: screen capture allowed (no call to the screenshot block)', (await calls(page, 'setSecure')).length === 0, await calls(page, 'setSecure'));
  await page.$eval('[data-set="discreet"]', (el) => el.click()); await sleep(200);
  check('5 discreet mode on: capture still allowed', (await calls(page, 'setSecure')).length === 0);
  check('5 no fingerprint switch without app lock', !(await page.$('[data-set="bio"]')));
  await page.evaluate(() => { const s = window.Saathi.state; s.settings.discreet = false; s.settings.pinHash = 'x'; window.Saathi.saveQuiet(); window.Saathi.render(); }); await sleep(200);
  check('5 app lock on: capture still allowed', (await calls(page, 'setSecure')).length === 0);
  check('5 the fingerprint switch is there, off by default', (await page.$eval('[data-set="bio"]', (el) => el.checked)) === false && /The phone’s own PIN never does/.test(await view(page)));
  await page.evaluate(() => { window.Saathi.mem.locked = true; window.Saathi.render(); }); await sleep(500);
  check('5 locked, fingerprint not turned on: no fingerprint button, no prompt', !(await page.$('#lock-bio')) && (await calls(page, 'biometric')).length === 0);
  await page.evaluate(() => { const s = window.Saathi.state; s.settings.bio = true; window.Saathi.saveQuiet(); window.Saathi.render(); }); await sleep(500);
  check('5 locked, fingerprint on: the button, and the prompt opens', !!(await page.$('#lock-bio')) && (await calls(page, 'biometric')).length === 1);
  await page.evaluate(() => { const s = window.Saathi.state; s.settings.shared = true; window.Saathi.mem.bioAuto = false; window.Saathi.saveQuiet(); window.Saathi.render(); }); await sleep(500);
  check('5 shared phone: no fingerprint even when turned on', !(await page.$('#lock-bio')) && (await calls(page, 'biometric')).length === 1);
  await page.evaluate(() => { window.Saathi.mem.locked = false; window.Saathi.render(); }); await sleep(200);
  await go(page, 'me-privacy');
  check('5 shared phone: Me says why fingerprint is off', !(await page.$('[data-set="bio"]')) && /Off while the phone is shared/.test(await view(page)));
  await page.evaluate(() => { const s = window.Saathi.state; s.settings.shared = false; s.settings.pinHash = null; window.Saathi.saveQuiet(); window.Saathi.render(); }); await sleep(200);
  check('5 all off again: capture allowed', (await calls(page, 'setSecure')).length === 0);
  check('5 no page errors', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 3. Shares go through the phone's share sheet ---------- */
{
  const { ctx, page, errs } = await open({ hash: '#report' });
  check('6 the report has a Share button, not a wa.me link', !!(await page.$('button#rp-send')) && !(await page.$('#view a[href*="wa.me"]')));
  await tap(page, '#rp-send'); await sleep(150);
  const sh = await calls(page, 'share');
  check('6 Share hands the report to the share sheet', sh.length === 1 && sh[0][1] === 'Report for my doctor' && /My last periods/.test(sh[0][2]), sh);
  for (const h of ['family', 'joy-quiz']) {
    await go(page, h);
    check('6 ' + h + ': no wa.me link', !(await page.$('#view a[href*="wa.me"]')));
  }
  await go(page, 'family');
  await page.$eval('#view [data-fam-share]', (el) => el.click()); await sleep(150);
  check('6 a family card goes to the share sheet', (await calls(page, 'share')).length === 2);
  const src = ['app.js'].concat(fs.readdirSync(path.join(root, 'mods')).map((f) => 'mods/' + f)).map((f) => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
  check('6 the only wa.me link in the code is the help hello', (src.match(/wa\.me\//g) || []).length === 1 && /'https:\/\/wa\.me\/' \+ waNum\(\)/.test(src));
  check('6 no page errors', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 4. Reminders: hidden from the lock screen in discreet mode, and a last "open Sakhi" ---------- */
{
  const rem = [{ id: 'm1', kind: 'med', title: { en: 'Iron tablet', hi: 'आयरन की गोली' }, time: '21:00', every: 1, on: true, start: iso(1) }];
  const { ctx, page, errs } = await open({ hash: '#me-reminders', maker: 'Xiaomi', seed: { reminders: rem, settings: { notify: true } } });
  await sleep(1100);
  const sched = await calls(page, 'schedule');
  const list = sched.length ? JSON.parse(sched[sched.length - 1][1]) : [];
  const last = list[list.length - 1] || {};
  check('7 reminders are queued, each carrying its rule so Android books the next itself (Version 34: no "open Sakhi" alarm needed)', list.length > 2 && list.every((x) => x.rep && x.rep.every === 1 && x.rid === 'm1') && !list.some((x) => /^refill-/.test(x.id)), list.slice(-2));
  check('7 at most 60 alarms, and not hidden outside discreet mode', list.length <= 60 && list.every((x) => x.secret === false));
  check('7 battery-saving help on a Xiaomi phone, with a settings button', /battery saving stops reminders/.test(await view(page)) && !!(await page.$('#me-batt-b')));
  await tap(page, '#me-batt-b'); await sleep(100);
  check('7 the button opens Sakhi\'s app settings', (await calls(page, 'openAppSettings')).length === 1);
  await page.evaluate(() => { window.Saathi.state.settings.discreet = true; window.Saathi.save(); }); await sleep(1100);
  const s2 = await calls(page, 'schedule'); const l2 = JSON.parse(s2[s2.length - 1][1]);
  check('7 discreet mode: every reminder is kept off the lock screen, in neutral words', l2.length > 2 && l2.every((x) => x.secret === true && !/Iron|period|Sakhi/i.test(x.body + x.title)), l2.slice(-2));
  await page.evaluate(() => window.Saathi.render()); await sleep(200); await tap(page, '#me-notif-test'); await sleep(150);
  const tn = (await calls(page, 'testNotify')).slice(-1)[0] || [];
  check('7 discreet mode: the test notification is hidden from the lock screen too, in neutral words', tn[3] === true && tn[2] === 'Reminder' && !/Sakhi/.test(tn[1]), tn);
  check('7 no page errors', errs.length === 0, errs);
  await ctx.close();
}
{
  const { ctx, page } = await open({ hash: '#me-reminders', maker: 'Google', seed: { settings: { notify: true } } });
  check('7 no battery card on a phone that keeps alarms', !(await page.$('#me-batt')));
  await ctx.close();
}

/* ---------- 5. Approval tags only with prototype labels on; no request to Google ---------- */
{
  const { ctx, page, errs } = await open({ hash: '#care' });
  const routes = ['care', 'cond', 'periods', 'meno', 'post', 'preg', 'pregtest', 'intimate', 'screen', 'ttc'];
  let tagged = [];
  for (const r of routes) { await go(page, r); if (/Needs approval|approval/i.test(await view(page))) tagged.push(r); }
  check('8 no "needs approval" tag for women (D2: visible and working)', tagged.length === 0, tagged);
  check('8 no page errors', errs.length === 0, errs);
  await ctx.close();
}
check('9 no request to Google (fonts are bundled)', google.length === 0, google);
check('9 index.html loads fonts from the app, not Google', !/fonts\.googleapis|fonts\.gstatic/.test(fs.readFileSync(path.join(root, 'index.html'), 'utf8')));

/* ---------- 6. The APK's page under its Content-Security-Policy (needs a build: android/build-apk.sh) ---------- */
{
  const apk = path.resolve(root, '../android/build/assets/www/index.html');
  if (!fs.existsSync(apk)) console.log('SKIP 10: no android/build yet (run android/build-apk.sh)');
  else {
    const html = fs.readFileSync(apk, 'utf8');
    check('10 the APK page has a Content-Security-Policy', /http-equiv="Content-Security-Policy"[^>]*default-src 'none'/.test(html));
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage(); const bad = []; const errs = [];
    page.on('console', (m) => { if (/Content Security Policy|Refused to/i.test(m.text())) bad.push(m.text().slice(0, 200)); });
    page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
    await page.goto(pathToFileURL(apk).href, { waitUntil: 'load' });
    await page.waitForFunction(() => !!window.Saathi, null, { timeout: 5000 }).catch(() => { });
    await sleep(800);
    check('10 the APK page boots under its policy', !!(await page.evaluate(() => !!window.Saathi && document.querySelector('#view').innerText.length > 20)));
    check('10 no CSP violation and no page error', bad.length === 0 && errs.length === 0, bad.concat(errs));
    await ctx.close();
  }
}

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'PRIVACY FAIL ' : 'PRIVACY OK ') + (results.length - failed.length) + '/' + results.length);
process.exit(failed.length ? 1 : 0);
