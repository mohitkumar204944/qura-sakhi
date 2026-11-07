// Version 34: phone notifications (docs/notifications-audit-2026-10-23.md). What the page hands Android: repeat rules so
// daily reminders renew themselves, channels by kind in her language, neutral words on a shared phone, the late-period
// nudge, the route a tap opens, and reminders on by default (Version 39.27: Android's own "Allow" once, no question in
// Sakhi's words; "Ring on time?" only for a daily reminder she sets, and since Version 39.78 for a medicine reminder,
// test/launchfix.mjs section 5). A fixed clock (Asia/Kolkata); a stand-in for
// the Android bridge records every call; nothing leaves the machine. The Android side's repeat maths is in
// android/test/ReminderMathTest.java.
// Usage: node test/notify.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NOW = '2026-10-23T10:00:00+05:30';
const TODAY = '2026-10-23';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const regular = (last, n, gap) => { const ev = []; for (let i = n - 1; i >= 0; i--) { const st = ago(last + i * (gap || 28)); ev.push({ d: st, t: 'start' }, { d: iso(st, 4), t: 'end' }); } return ev; };
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me'].map((k) => [k, { st: 'done', d: ago(3) }]));
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', whatsNew: '0.37', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: [], daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, prompts: { setup: 'off' } }, x || {}, { settings: Object.assign({ toursAuto: false }, (x || {}).settings || {}) });
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Asha', pincode: '560001', activeOn: TODAY };
/* the Android bridge: canNotify and canExactAlarms as given; askNotify grants (or not) after a moment */
const bridge = (o) => 'window.__calls = []; window.__notify = ' + (o.notify === true) + '; window.SakhiAndroid = { schedule(j) { __calls.push(["schedule", j]); return 0; }, cancelAll() {}, ' +
  'canNotify() { return window.__notify; }, askNotify() { __calls.push(["askNotify"]); setTimeout(() => { window.__notify = ' + (o.grant !== false) + '; window.__sakhiNotify && window.__sakhiNotify(' + (o.grant !== false) + '); }, 30); }, ' +
  'canExactAlarms() { return ' + (o.exact === true) + '; }, askExactAlarms() { __calls.push(["askExactAlarms"]); }, testNotify() {}, speak() { return true; }, stop() {}, voices() { return "[]"; }, copy() { return true; }, haptic() {}, setSecure() {}, ' +
  'setDisguise() {}, isDisguised() { return false; }, saveState() { return true; }, loadState() { return ""; } };';

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ api: 'https://api.test.invalid', app: 'test-0.34-pilot', platform: 'android' }) + ';');
  await ctx.addInitScript(bridge(o));
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"available":false}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: new Date(o.now || NOW) });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 1500);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(15); } }
const go = async (page, h) => { await page.evaluate((x) => { location.hash = x; }, h); await settle(page, 500); };
const view = (page) => page.$eval('#view', (e) => e.innerText);
const sheet = (page) => page.$eval('#sheet-root', (e) => e.innerText).catch(() => '');
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const tap = async (page, sel) => { await page.$eval(sel, (el) => el.click()); await settle(page, 400); };
const calls = (page, n) => page.evaluate((x) => window.__calls.filter((c) => c[0] === x), n);
const lastSchedule = async (page) => { const s = await calls(page, 'schedule'); return s.length ? JSON.parse(s[s.length - 1][1]) : null; };
const resave = async (page) => { await page.evaluate(() => window.Saathi.save()); await settle(page, 1200); };
const cleanup = async (x) => { check(x.name + ': no page errors', !x.errs.length, x.errs); await x.ctx.close(); };
const at = (d, hh, mm) => new Date(d + 'T' + String(hh).padStart(2, '0') + ':' + String(mm || 0).padStart(2, '0') + ':00+05:30').getTime();
const PILL = { id: 'pill', mod: 'contra', kind: 'med', title: { en: 'Take your pill', hi: 'अपनी गोली लें' }, every: 1, start: TODAY, time: '21:00', on: true };
const IRON = { id: 'iron-wk', mod: 'iron', kind: 'med', title: { en: 'Weekly iron tablet', hi: 'हफ़्ते की आयरन गोली' }, weekdays: [0], start: TODAY, time: '09:00', on: true };
const VAX = { id: 'post-vax-9m', mod: 'post', kind: 'checkup', title: { en: "Baby's vaccines: 9 months", hi: 'बच्चे के टीके: 9 महीने' }, dates: [iso(TODAY, 200)], time: '10:00', on: true };

/* ---------- 1. Off until she turns them on ---------- */
{
  const T = await open({ seed: { reminders: [PILL] } });
  check('1 phone reminders off: nothing is booked', JSON.stringify(await lastSchedule(T.page)) === '[]');
  await cleanup(Object.assign(T, { name: '1' }));
}

/* ---------- 2. What a reminder carries: its rule, channel, route; the next 8 days of a repeat, a year of one-offs ---------- */
{
  const T = await open({ notify: true, exact: true, seed: { settings: { notify: true }, reminders: [PILL, IRON, VAX] } });
  const L = await lastSchedule(T.page);
  const pill = L.filter((x) => /^r-pill-/.test(x.id));
  check('2 a daily pill: tonight and the next 8 days only, each carrying its rule so Android carries on', pill.length === 9 && pill[0].id === 'r-pill-' + TODAY && pill[0].at === at(TODAY, 21) && pill.every((x) => x.rid === 'pill' && x.rep && x.rep.every === 1 && x.hh === 21 && x.mm === 0 && x.until === 0), pill.slice(0, 2));
  check('2 the pill rings in the medicines channel, as a heads-up, and a tap opens My method', pill.every((x) => x.ch === 'sakhi_meds' && x.chname === 'Medicines' && x.imp === 'high' && x.go === 'contra-mine' && x.secret === false && x.body === 'Time for your tablet' && x.title === 'Qura Sakhi'), pill[0]);   /* Version 39.0: plain words on the lock screen by default */
  const iron = L.filter((x) => /^r-iron-wk-/.test(x.id));
  check('2 a weekly tablet: this Sunday only (the 8 days), carrying its weekday, opening the iron screen', iron.length === 1 && iron[0].id === 'r-iron-wk-' + iso(TODAY, 2) && iron.every((x) => JSON.stringify(x.rep) === '{"wd":[0]}' && x.go === 'iron' && x.ch === 'sakhi_meds'), iron);
  const vax = L.filter((x) => /^r-post-vax-9m-/.test(x.id));
  check('2 a vaccine 200 days away is booked now, with no rule, in the pregnancy, baby and check-ups channel', vax.length === 1 && !vax[0].rep && vax[0].ch === 'sakhi_care' && vax[0].go === 'post' && vax[0].at === at(iso(TODAY, 200), 10), vax);
  check('2 under 60, so no "open Sakhi" alarm', L.length < 60 && !L.some((x) => /^refill-/.test(x.id)), L.length);
  check('2 soonest first', L.every((x, i) => i === 0 || L[i - 1].at <= x.at));
  await T.page.evaluate(() => { window.Saathi.state.lang = 'hi'; }); await resave(T.page);
  const H = await lastSchedule(T.page);
  check('2 channel names follow her language', H.find((x) => x.rid === 'pill').chname === 'दवाएँ' && H.find((x) => /vax/.test(x.id)).chname === 'गर्भ, शिशु और जाँच');
  await cleanup(Object.assign(T, { name: '2' }));
}

/* ---------- 3. A shared phone or discreet mode: neutral words, one neutral channel, off the lock screen ---------- */
{
  const T = await open({ notify: true, exact: true, seed: { events: regular(10, 6), settings: { notify: true, shared: true }, reminders: [PILL, VAX] } });
  const L = await lastSchedule(T.page);
  check('3 shared phone: every reminder says only "Reminder", in the "Reminders" channel, hidden on the lock screen', L.length > 5 && L.every((x) => x.body === 'Reminder' && x.ch === 'sakhi_reminders' && x.chname === 'Reminders' && x.imp === 'default' && x.secret === true), L.slice(0, 2));
  check('3 and nothing she could read names a pill, a period or a baby', !JSON.stringify(L.map((x) => [x.title, x.body, x.chname])).match(/pill|period|Period|baby|vaccine/i));
  check('3 the rule still rides along, so it carries on', L.filter((x) => x.rid === 'pill').every((x) => x.rep && x.rep.every === 1));
  await T.page.evaluate(() => { const S = window.Saathi; S.state.settings.shared = false; S.state.settings.discreet = true; }); await resave(T.page);
  const D = await lastSchedule(T.page);
  check('3 discreet mode does the same, under the disguise name', D.every((x) => x.body === 'Reminder' && x.ch === 'sakhi_reminders' && x.secret === true && x.title !== 'Qura Sakhi'), D[0]);
  await cleanup(Object.assign(T, { name: '3' }));
}

/* ---------- 4. Her period: the heads-up, and the late nudge three days after her own range ---------- */
{
  /* regular 28-day cycles, the last started 10 days ago: likely range 22 to 32 days later */
  const T = await open({ notify: true, exact: true, seed: { events: regular(10, 6), settings: { notify: true } } });
  const L = await lastSchedule(T.page);
  const ri = await T.page.evaluate(() => { const r = window.Saathi.cycle && window.Saathi.cycle.rangeInfo ? window.Saathi.cycle.rangeInfo() : null; return r ? { from: window.Saathi.toISO(r.from), to: window.Saathi.toISO(r.to) } : null; });
  const head = L.find((x) => /^period-/.test(x.id)); const late = L.find((x) => /^late-/.test(x.id));
  check('4 the heads-up the day before her likely days, in the period channel, opening Home', head && head.body === 'A reminder from Sakhi. Tap to see.' && head.ch === 'sakhi_period' && head.go === 'home', head);
  check('4 the late nudge: three days after her range ends, 10 am, with no health words', late && late.body === 'Open Sakhi: your dates need a look.' && late.go === 'home' && late.ch === 'sakhi_period' && (!ri || late.at === at(iso(ri.to, 3), 10)), { late, ri });
  check('4 the nudge comes after the heads-up', head && late && late.at > head.at);
  await T.page.evaluate((d) => { const S = window.Saathi; S.state.events.push({ d: d, t: 'start' }); }, TODAY); await resave(T.page);
  const L2 = await lastSchedule(T.page);
  check('4 logging her period moves both on: no nudge for the old range', !L2.some((x) => x.id === (late || {}).id));
  await T.page.evaluate(() => { window.Saathi.state.situation.pregnant = true; }); await resave(T.page);
  const L3 = await lastSchedule(T.page);
  check('4 pregnant: no period heads-up and no late nudge', !L3.some((x) => /^(period|late)-/.test(x.id)), L3.map((x) => x.id));
  await cleanup(Object.assign(T, { name: '4' }));
}

/* ---------- 5. Too many to book: the soonest 59, then one "open Sakhi" ---------- */
{
  const many = Array.from({ length: 9 }, (_, i) => ({ id: 'm' + i, mod: 'tools', kind: 'med', title: { en: 'Medicine ' + i, hi: 'दवा ' + i }, every: 1, start: TODAY, time: '2' + (i % 4) + ':00', on: true }));
  const T = await open({ notify: true, exact: true, seed: { settings: { notify: true }, reminders: many } });
  const L = await lastSchedule(T.page);
  check('5 at most 60, and only when some were left out a last alarm asks her to open Sakhi', L.length === 60 && /^refill-/.test(L[59].id) && L[59].body === 'Open Sakhi so your reminders keep coming.' && L[59].go === 'home', L.slice(-1));
  check('5 a medicine from the medicines screen opens My medicines', L[0].go === 'tools-meds');
  await cleanup(Object.assign(T, { name: '5' }));
}

/* ---------- 6. Version 39.27 (minimalism audit R01; Mohit, 28 Oct: "reminders by default on, no need to ask"): on from the
   start, with no question in Sakhi's words; Android 13's own "Allow" once, after the first-run tour ---------- */
{
  const T = await open({ notify: false, exact: false, seed: { events: regular(10, 3) } });
  await settle(T.page, 800);
  check('6 Android 13+: the phone\'s own "Allow" once on Today, then reminders are on', (await calls(T.page, 'askNotify')).length === 1 && (await st(T.page)).settings.notify === true, [await calls(T.page, 'askNotify'), (await st(T.page)).settings]);
  check('6 no sheet in Sakhi\'s words: no "Get a heads-up?", no "Ring on time?" after it', !(await sheet(T.page)), await sheet(T.page));
  check('6 and the reminders are booked at once', ((await lastSchedule(T.page)) || []).some((x) => /^period-|^late-/.test(x.id)));
  await go(T.page, '#diary'); await go(T.page, '#home'); await settle(T.page, 1800);
  check('6 not asked again', (await calls(T.page, 'askNotify')).length === 1 && !(await sheet(T.page)));
  await cleanup(Object.assign(T, { name: '6 yes' }));
  const N = await open({ notify: false, grant: false, seed: { events: regular(10, 3) } });
  await settle(N.page, 800); await go(N.page, '#diary'); await go(N.page, '#home'); await settle(N.page, 1800);
  check('6 "Don\'t allow" is final: asked once, off, no sheet', (await calls(N.page, 'askNotify')).length === 1 && (await st(N.page)).prompts.notifyAuto === TODAY && !(await st(N.page)).settings.notify && !(await sheet(N.page)));
  await cleanup(Object.assign(N, { name: '6 no' }));
  const F = await open({ notify: false, seed: { events: regular(10, 3), fullTour: { st: 'on', d: TODAY } } });
  check('6 never during the first-run tour', (await calls(F.page, 'askNotify')).length === 0);
  await cleanup(Object.assign(F, { name: '6 tour' }));
  const E = await open({ notify: false, seed: { events: [] } });
  await settle(E.page, 800);
  check('6 on by default, so it doesn\'t wait for a logged period', (await calls(E.page, 'askNotify')).length === 1);
  await cleanup(Object.assign(E, { name: '6 empty' }));
  const A = await open({ notify: true, exact: true, seed: { events: regular(10, 3) } });
  check('6 Android 10 to 12 (no "Allow" exists): on at once, nothing asked', (await calls(A.page, 'askNotify')).length === 0 && (await st(A.page)).settings.notify === true && ((await lastSchedule(A.page)) || []).some((x) => /^period-/.test(x.id)));
  await cleanup(Object.assign(A, { name: '6 android 12' }));
}

/* ---------- 7. Turning them on from Me: on, and the page's own card for ringing on time (no sheet after it) ---------- */
{
  const T = await open({ notify: false, exact: false, hash: '#me-reminders', seed: { prompts: { setup: 'off', notifyAuto: ago(5) }, settings: { notifyOff: true } } });
  await T.page.$eval('#me-notif', (c) => { c.checked = true; c.dispatchEvent(new Event('change')); }); await settle(T.page, 1000);
  const s7 = await st(T.page);
  check('7 the Me switch: reminders on, "off" forgotten, no "Ring on time?" sheet; the page offers it', s7.settings.notify === true && !s7.settings.notifyOff && !(await sheet(T.page)) && !!(await T.page.$('#me-exact')), [s7.settings, await sheet(T.page)]);
  await cleanup(Object.assign(T, { name: '7' }));
}

/* ---------- 8. A tapped notification opens its screen ---------- */
{
  const T = await open({ notify: true, exact: true, seed: { settings: { notify: true } } });
  await T.page.evaluate(() => window.__sakhiOpen('checkin')); await settle(T.page, 500);
  check('8 a route from Android opens that screen', await T.page.evaluate(() => location.hash) === '#checkin');
  await T.page.evaluate(() => { window.__sakhiOpen('../x'); window.__sakhiOpen('Home'); window.__sakhiOpen('a b'); }); await settle(T.page, 300);
  check('8 anything else is ignored', await T.page.evaluate(() => location.hash) === '#checkin');
  await cleanup(Object.assign(T, { name: '8' }));
}

/* ---------- 9. The two optional monthly reminders: the check-in, and a fresh backup code ---------- */
{
  const T = await open({ notify: true, exact: true, hash: '#checkin', seed: { settings: { notify: true } } });
  check('9 the check-in offers a monthly reminder, off', /Remind me every month/.test(await view(T.page)) && !(await T.page.$eval('#ci-rem', (c) => c.checked)));
  await T.page.$eval('#ci-rem', (c) => { c.checked = true; c.dispatchEvent(new Event('change')); }); await settle(T.page, 1200);
  const r = (await st(T.page)).reminders.find((x) => x.id === 'checkin');
  check('9 on: once a month at 7 pm, from a month from now', r && r.every === 30 && r.time === '19:00' && r.start === iso(TODAY, 30), r);
  const L = await lastSchedule(T.page); const ci = L.find((x) => /^r-checkin-/.test(x.id));
  check('9 its first ring, a month away, is booked: in "Other reminders", opening the check-in, carrying its rule', ci && ci.id === 'r-checkin-' + iso(TODAY, 30) && ci.at === at(iso(TODAY, 30), 19) && ci.ch === 'sakhi_other' && ci.go === 'checkin' && ci.rep && ci.rep.every === 30, ci);
  await T.page.$eval('#ci-rem', (c) => { c.checked = false; c.dispatchEvent(new Event('change')); }); await settle(T.page, 1200);
  check('9 off again: gone', !(await st(T.page)).reminders.some((x) => x.id === 'checkin') && !(await lastSchedule(T.page)).some((x) => /^r-checkin-/.test(x.id)));
  await go(T.page, '#backup');
  check('9 the backup screen offers a monthly nudge, off', /Your diary is only on this phone/.test(await view(T.page)) && !(await T.page.$eval('#bk-rem', (c) => c.checked)));
  await T.page.$eval('#bk-rem', (c) => { c.checked = true; c.dispatchEvent(new Event('change')); }); await settle(T.page, 1200);
  const b = (await lastSchedule(T.page)).find((x) => /^r-backup-/.test(x.id));
  check('9 on: it opens the backup screen', b && b.go === 'backup' && b.body === 'Make a fresh backup code of your diary', b);
  await cleanup(Object.assign(T, { name: '9' }));
}

await browser.close();
const bad = results.filter((r) => !r.pass);
console.log(bad.length ? 'NOTIFY FAIL ' + (results.length - bad.length) + '/' + results.length : 'NOTIFY OK ' + results.length + '/' + results.length);
process.exit(bad.length ? 1 : 0);
