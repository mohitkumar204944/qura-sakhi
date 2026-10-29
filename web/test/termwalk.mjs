// Version 39.40: the 39-week walk's gaps (Mohit's Flip5, 30 Oct: "can you do a walkthrough on my phone and check gaps", then
// "fix all 8"; MODULE_API section 83). This file checks:
//   1 the labour pain timer's ambulance numbers call (the kick page keeps its Call buttons above the list);
//   2 one pregnancy start: the scan's due date, when she has one, decides the weeks and which gaps count, so every start
//     inside the pregnancy is "Bleeding" (hormones or not) in My cycles, Days and the Calendar; her two dates far apart are
//     said on the stage sheet;
//   3 her own doctor's number, kept on the phone: added from My plan, the doctor screen or Check-ups and tests, then Call on
//     each and above the ambulance numbers; Today's "Due now" names "Your doctor's and ambulance numbers" on her route;
//   4 the labour pain timer on Today's pregnancy card from 37 weeks;
//   5 the week page says when her weeks come from the scan;
//   6 "Call 112 now if" and its Call button in one card;
//   7 Your numbers: the spread of as many gaps as there are, and periods without the bleeding in a pregnancy;
//   8 the labour timer's "ask your doctor" on her doctor's route;
//   9 Hindi at 360 px; 10 the number never leaves the phone, and no page errors.
// Usage: node test/termwalk.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SRC = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const SHOTS = path.join(here, 'shots', 'termwalk'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 900)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-29';   /* a Thursday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm, day) => new Date((day || TODAY) + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.34-pilot', platform: 'android' };
/* pregnant `w` weeks today (her last period 7w + 3 days ago), with her doctor (or o.care) */
const sit = (w, o) => Object.assign({ pregnant: true, pregnantSince: ago(7 * w + 3), care: 'private' }, o || {});
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: sit(10), events: [], daily: {}, notes: {}, checkins: {}, goals: ['food'],
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30) }, mods: {}, reminders: [], intake: { goal: 'food', stage: 'preg' } }, x || {}, { settings: Object.assign({ toursAuto: false }, (x || {}).settings || {}) });
/* her saved answers, and a running My pregnancy (version 2) that started `startAgo` days ago (0: today, her day 1) */
const IK = (o) => Object.assign({ at: ago(1), stage: 'preg', goal: 'food', food: 'veg', milk: 'y', act: null, lim: [], pflags: [], psafeW: 10, pnow: null }, o || {});
const preg = (startAgo, o) => Object.assign({ pack: 'preg', goalKey: 'food', start: ago(startAgo), started: ago(startAgo), go: true, pv: 2, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: null, log: {}, weeks: {}, body: [], intake: IK() }, o || {});
const withPlan = (startAgo, o, seed) => Object.assign({}, seed || {}, { mods: Object.assign({ plan: preg(startAgo, o) }, (seed || {}).mods || {}), intake: (o && o.intake) || IK() });

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  if (o.bridge) await ctx.addInitScript(bridge({ notify: true }));   /* the Android bridge, as test/notify.mjs fakes it */
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200))); page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
  await page.clock.install({ time: o.now || at(o.hm || '10:00') });
  await page.goto(PAGE + '#' + (o.hash || 'home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, o.wait || 600);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (a, h) => { await a.page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(a.page, 500); };
const tap = async (a, sel) => { await a.page.waitForSelector(sel, { timeout: 8000, state: 'attached' }); await a.page.$eval(sel, (el) => el.click()); await settle(a.page, 400); };
const has = (a, sel) => a.page.$(sel).then((x) => !!x);
const txt = (a, sel) => a.page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const view = (a) => txt(a, '#view');
const st = (a) => a.page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const acts = (a) => a.page.evaluate(() => window.Saathi.plan.actions().map((x) => ({ id: x.id, kind: x.kind, title: x.title, sub: x.sub, go: x.go || null, priv: !!x.priv, mins: x.mins || null })));
const ids = async (a) => (await acts(a)).map((x) => x.id);
const noScroll = (a) => a.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = (a, name) => a.page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const KEYS = /\b(plan|preg|pregtools)_[a-z0-9_]+\b/;   /* a string key on screen is a missing translation */
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const tels = (a, sel) => a.page.$$eval(sel + ' a[href^="tel:"]', (xs) => xs.map((x) => x.getAttribute('href').slice(4)).join());

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const stat = (a, label) => a.page.$$eval('.vd-nums .stat', (xs, l) => { const x = xs.find((y) => y.querySelector('span').textContent === l); return x ? x.querySelector('b').textContent : null; }, label).catch(() => null);
const tc = (a, sel) => a.page.$eval(sel, (e) => e.textContent.replace(/\s+/g, ' ').trim()).catch(() => '');   /* closed <details> too */
const fd = (a, d) => a.page.evaluate((x) => window.Saathi.fmtD(new Date(x + 'T12:00:00')), d);
const pd = (a) => a.page.evaluate(() => { const x = window.Saathi.plan.actions().find((y) => y.id === 'pdue'); return x ? x.title : null; });
const DOC = '9812345678';
const scan39 = (o) => sit(39, Object.assign({ pregnantSince: ago(50), scanEdd: iso(TODAY, 7) }, o || {}));   /* her last period says 7 weeks, the scan 39 */

/* ---------- 1 the labour pain timer calls ---------- */
{
  const a = await open({ seed: { situation: sit(39) }, hash: 'pregtools-contractions' });
  check('1 the labour timer: Call 108, 102 and 112', (await tels(a, '#view .stack .helpline')) === '108,102,112' && !(await has(a, '#view [data-ptl-copy]')), await tels(a, '#view'));
  check('1 ... and "ask your doctor" on her doctor\'s route (8)', /ask your doctor when they want you to come in/.test(await view(a)) && !/doctor or ANM/.test(await view(a)));
  await done(a);
  const k = await open({ seed: { situation: sit(39) }, hash: 'pregtools-kicks' });
  check('1 the kick page: its Call buttons above, and the list as before', (await tels(k, '#view .ptl-calls')) === '112,108,102' && (await has(k, '#view [data-ptl-copy]')));
  await done(k);
  const g = await open({ seed: { situation: sit(39, { care: 'govt' }), mydoc: { tel: DOC } }, hash: 'pregtools-contractions' });
  check('8 the government route: "your doctor or ANM", and no doctor\'s row', /ask your doctor or ANM/.test(await view(g)) && !(await has(g, '#view .ptl-mydoc')));
  await done(g);
}

/* ---------- 2 one pregnancy start ---------- */
const pEv = [{ d: ago(330), t: 'start' }, { d: ago(326), t: 'end' }, { d: ago(300), t: 'start' }, { d: ago(296), t: 'end' }, { d: ago(110), t: 'start' }, { d: ago(106), t: 'end' }, { d: ago(80), t: 'start' }, { d: ago(77), t: 'end' },
  { d: ago(50), t: 'start' }, { d: ago(47), t: 'end' }, { d: ago(2), t: 'start' }];
{
  const a = await open({ seed: { situation: scan39({ hormonesSince: ago(60), hormonesUntil: ago(45) }), events: pEv }, hash: 'diary' });
  check('2 her weeks come from the scan: 39', (await a.page.evaluate(() => window.Saathi.preg.info().weeks)) === 39);
  const cal = await a.page.$eval('[data-day="' + ago(2) + '"]', (e) => e.className).catch(() => '');
  check('2 the Calendar: bleeding in the pregnancy is drawn as bleeding, not a period\'s first day, and its key says Bleeding', /\bbleed\b/.test(cal) && /\blight\b/.test(cal) && /Bleeding/.test(await txt(a, '#view .legend:not(.legend-dots)')), { cal, key: await txt(a, '#view .legend:not(.legend-dots)') });
  await tap(a, '[data-tab="tr"]');
  const mc = await tc(a, '.mc-card');
  const rows = []; for (const d of [ago(2), ago(50), ago(80), ago(110)]) rows.push(new RegExp(esc(await fd(a, d)) + '\\s*Edit dates\\s*Bleeding · not counted: pregnancy').test(mc));
  check('2 My cycles: every start inside the pregnancy is "Bleeding · not counted: pregnancy", the one on hormones too', rows.every(Boolean) && !/Cycle day|not counted: hormones/.test(mc), { rows, mc: mc.slice(0, 600) });
  check('2 ... her period before it stays a period', /\d-day period/.test(mc), mc.slice(0, 600));
  const nums = await tc(a, '.vd-nums');
  check('2 Your numbers: 2 periods logged and the one gap before the pregnancy (the bleeding in it left out)', /\b2\s*Periods logged/.test(nums) && /\b30\s*Average gap/.test(nums), nums);
  await tap(a, '[data-tab="days"]');
  const heads = await a.page.$$eval('.dy-gh', (xs) => xs.map((x) => x.innerText.trim()));
  const dv = await a.page.$$eval('.dy-grp', (xs) => xs.filter((g) => /^In your pregnancy$/.test(g.querySelector('.dy-gh').innerText.trim())).map((g) => g.textContent).join(' '));   /* the group inside the pregnancy (Version 39.41) */
  check('2 Days: the bleeds in the pregnancy are "Bleeding" in one "In your pregnancy" group (Version 39.41), and no day is "Day n of your period"', heads.filter((h) => h === 'In your pregnancy').length === 1 && (dv.match(/Bleeding/g) || []).length >= 4 && !/Day \d+ of your period/.test(dv), { heads });
  await done(a);
  const s = await open({ seed: { situation: scan39(), events: pEv } });
  await tap(s, '#stage-btn'); if (!(await has(s, '#st-preg-is'))) await tap(s, '[data-stage="preg"]');
  check('2 the stage sheet: her two dates 32 weeks apart, said', /39 weeks pregnant/.test(await txt(s, '#st-preg-is')) && /Your last period and your scan’s due date are 32 weeks apart\. Sakhi counts from the scan, so check both dates\./.test(await txt(s, '#st-preg-is')), await txt(s, '#st-preg-is'));
  await s.page.fill('#st-lmp', ago(275)); await s.page.$eval('#st-lmp', (e) => e.dispatchEvent(new Event('input'))); await settle(s.page, 200);
  check('2 ... and gone once they agree', /39 weeks pregnant/.test(await txt(s, '#st-preg-is')) && !/apart/.test(await txt(s, '#st-preg-is')), await txt(s, '#st-preg-is'));
  await done(s);
}

/* ---------- 3 her own doctor's number ---------- */
const reqs = [];
{
  const a = await open({ seed: withPlan(30, {}, { situation: sit(35) }) });
  a.page.on('request', (r) => reqs.push(r.url() + ' ' + (r.postData() || '')));
  const due = await a.page.evaluate(() => window.Saathi.preg.plan.due().map((x) => x.id));
  check('3 Today: "Due now" counts "Your doctor\'s and ambulance numbers" on her doctor\'s route', due.indexOf('asha') >= 0 && new RegExp('and ' + (due.length - 1) + ' more').test(await pd(a)), { due, pd: await pd(a) });
  await go(a, 'plan');
  check('3 My plan: "My doctor · Add your doctor’s number" first in her care team', /^My doctor\s*Add your doctor’s number/.test(await tc(a, '#view .pl-care .list')), await tc(a, '#view .pl-care .list'));
  await tap(a, '#view .pl-mydoc');
  check('3 ... it opens a sheet for the number, kept on the phone', (await has(a, '#md-tel')) && /It stays on this phone\. Sakhi never sends it anywhere\./.test(await txt(a, '#sheet-root')));
  await a.page.fill('#md-tel', '12345'); await tap(a, '#md-save');
  check('3 a number that isn\'t one is refused', (await has(a, '#md-tel')) && !(await st(a)).mydoc);
  await a.page.fill('#md-tel', '+91 98123 45678'); await tap(a, '#md-save');
  check('3 +91 98123 45678 is saved as 9812345678', ((await st(a)).mydoc || {}).tel === DOC && !(await has(a, '#md-tel')));
  check('3 My plan: "Call my doctor" with her number', (await a.page.$eval('#view .pl-mydoc', (e) => e.getAttribute('href')).catch(() => '')) === 'tel:' + DOC && /Call my doctor\s*9812345678/.test(await tc(a, '#view .pl-mydoc')));
  await go(a, 'ask');
  check('3 the doctor screen: Call my doctor', (await a.page.$eval('#ask-mydoc', (e) => e.getAttribute('href')).catch(() => '')) === 'tel:' + DOC);
  await go(a, 'pregtools-contractions');
  check('3 the labour timer: her doctor first, then the ambulances', (await tels(a, '#view .ptl-mydoc')) === DOC && (await tels(a, '#view')).indexOf(DOC + ',108') === 0, await tels(a, '#view'));
  await go(a, 'pregtools-kicks');
  check('3 the kick page: her doctor in the list too', (await tels(a, '#view .ptl-mydoc')) === DOC);
  await go(a, 'preg-plan');
  check('3 Check-ups and tests: "Your doctor\'s and ambulance numbers" is done, with My doctor to change it', /Done: from your/.test(await tc(a, '[data-plan="asha"]')) && (await has(a, '[data-plan="asha"] [data-mydoc]')), await tc(a, '[data-plan="asha"]'));
  await tap(a, '[data-plan="asha"] [data-mydoc]'); await a.page.fill('#md-tel', '0141 256 0291'); await tap(a, '#md-save');
  check('3 a hospital\'s number with its STD code: 01412560291', ((await st(a)).mydoc || {}).tel === '01412560291');
  await tap(a, '[data-plan="asha"] [data-mydoc]'); await tap(a, '#md-del');
  check('3 Remove this number', !(await st(a)).mydoc && !/Done: from your/.test(await tc(a, '[data-plan="asha"]')));
  await go(a, 'ask');
  check('3 the doctor screen without a number: Add your doctor’s number', await has(a, '#ask-mydoc-add'));
  await done(a);
  const g = await open({ seed: withPlan(30, {}, { situation: sit(35, { care: 'govt' }), mydoc: { tel: DOC } }) });
  const dg = await g.page.evaluate(() => window.Saathi.preg.plan.due().map((x) => x.id));
  check('3 the government route: My ASHA stays off Today, no doctor\'s row, as before', new RegExp('and ' + (dg.filter((x) => x !== 'asha').length - 1) + ' more').test(await pd(g)) && (await go(g, 'plan'), !(await has(g, '#view .pl-mydoc'))), { dg, pd: await pd(g) });
  await go(g, 'ask'); check('3 ... and none on the doctor screen', !(await has(g, '#ask-mydoc')) && !(await has(g, '#ask-mydoc-add')));
  await done(g);
  const c = await open({ seed: { situation: { care: 'private' }, mydoc: { tel: DOC }, events: [{ d: ago(20), t: 'start' }] }, hash: 'ask' });
  check('3 not pregnant, her number saved: Call my doctor, and no add link (Version 39.41)', (await has(c, '#ask-mydoc')) && !(await has(c, '#ask-mydoc-add')));
  await done(c);
  const d = await open({ seed: Object.assign(withPlan(30, {}, { situation: sit(35), mydoc: { tel: DOC } }), { settings: { discreet: true } }), hash: 'plan' });
  check('3 a shared phone: no doctor\'s row', !(await has(d, '#view .pl-mydoc')));
  await done(d);
}

/* ---------- 4 the labour pain timer on Today ---------- */
{
  const a = await open({ seed: { situation: sit(38) } });
  check('4 38 weeks: "Labour pain timer" on Today\'s pregnancy card', /Labour pain timer/.test(await txt(a, '#view .hero [data-go="pregtools-contractions"]')));
  await done(a);
  const b = await open({ seed: { situation: sit(36) } });
  check('4 36 weeks: not yet', !(await has(b, '#view .hero [data-go="pregtools-contractions"]')));
  await done(b);
  const c = await open({ seed: { situation: sit(38), settings: { discreet: true } } });
  check('4 a shared phone: not on the card', !(await has(c, '#view .hero [data-go="pregtools-contractions"]')));
  await done(c);
}

/* ---------- 5, 6 the week page ---------- */
{
  const a = await open({ seed: { situation: sit(39, { pregnantSince: ago(273), scanEdd: iso(TODAY, 7) }) }, hash: 'preg-week' });
  check('5 weeks from the scan: the hub\'s words', /Counted from the due date on your scan report\. Your doctor's count wins\. Every baby grows at its own pace\./.test(await view(a)), (await view(a)).slice(0, 200));
  const inside = await a.page.evaluate(() => { const c = document.querySelector('#view .pg-urg'); const b = c && c.querySelector('.pg-call a[href="tel:112"]'); if (!b) return false; const r = c.getBoundingClientRect(), q = b.getBoundingClientRect(); return q.top >= r.top && q.bottom <= r.bottom && q.left > r.left; });
  check('6 "Call 112 now if" and its Call 112 in one card', inside && (await has(a, '#view .pg-urg [data-go="help"]')));
  await done(a);
  const b = await open({ seed: { situation: sit(39) }, hash: 'preg-week' });
  check('5 weeks from her last period: as before', /Counted from the first day of the last period\. Every baby grows at its own pace\./.test(await view(b)));
  await done(b);
  for (const h of ['preg-plan']) {
    const c = await open({ seed: { situation: sit(39) }, hash: h });
    check('6 ' + h + ': the same card', (await tels(c, '#view .pg-urg .pg-call')) === '112');
    await done(c);
  }
}

/* ---------- 7 Your numbers ---------- */
{
  const cy = (n) => { const e = []; for (let i = 0; i < n; i++) { const s = 2 + i * 30 + (i === 2 ? 2 : 0); e.push({ d: ago(s), t: 'start' }, { d: ago(s - 4), t: 'end' }); } return e; };
  const a = await open({ seed: { situation: { care: 'private' }, events: cy(3) }, hash: 'diary' }); await tap(a, '[data-tab="tr"]');
  check('7 two gaps: "Spread of last 2", 2 days', (await stat(a, 'Spread of last 2')) === '2' && (await stat(a, 'Spread of last 6')) === null, await tc(a, '.vd-nums'));
  await done(a);
  const b = await open({ seed: { situation: { care: 'private' }, events: cy(2) }, hash: 'diary' }); await tap(b, '[data-tab="tr"]');
  check('7 one gap: no spread yet', (await stat(b, 'Spread of last 6')) === '–' || !(await has(b, '.vd-nums')), await tc(b, '.vd-nums'));
  await done(b);
}

/* ---------- 9 Hindi at 360 px ---------- */
{
  const a = await open({ w: 360, seed: Object.assign(withPlan(30, {}, { situation: scan39({ pregnantSince: ago(50) }), events: pEv }), { lang: 'hi' }), hash: 'plan' });
  check('9 Hindi at 360 px: My plan\'s My doctor row', /मेरी डॉक्टर/.test(await tc(a, '#view .pl-mydoc')) && (await noScroll(a)));
  await go(a, 'pregtools-contractions');
  check('9 Hindi at 360 px: the labour timer calls', (await tels(a, '#view .stack .helpline')) === '108,102,112' && (await noScroll(a)) && /अपनी डॉक्टर से पूछें/.test(await view(a)));
  await go(a, 'home'); await tap(a, '#stage-btn'); if (!(await has(a, '#st-preg-is'))) await tap(a, '[data-stage="preg"]');
  check('9 Hindi at 360 px: the dates line', /हफ़्ते का फ़र्क है/.test(await txt(a, '#st-preg-is')) && (await noScroll(a)), await txt(a, '#st-preg-is'));
  await shot(a, 'hi-stage');
  await done(a);
}

check('10 her doctor\'s number never left the phone', !reqs.some((x) => x.indexOf(DOC) >= 0 || x.indexOf('98123') >= 0), reqs.filter((x) => x.indexOf('98123') >= 0).slice(0, 3));
check('10 no page errors', !errsAll.length, errsAll.slice(0, 5));
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' : 'PASSED ') + (results.length - failed.length) + '/' + results.length + ' (termwalk)');
process.exit(failed.length ? 1 : 0);
