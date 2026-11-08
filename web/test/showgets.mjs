// Version 39.83: show what she gets (docs/teach-and-show-advice-2026-11-08.md, part 1; MODULE_API section 126).
// Mohit, 8 Nov, after the Clue walks: "Yes, build part 1". This file checks:
//   1 L1 the report's "When it comes": her last 3 complete cycles, the 7 days before each period, the days she bled and the
//     rest; the leading column in bold; the dates line; this cycle so far; Copy; big letters; Hindi at 360 px;
//   2 ... the counts stay below 2 complete cycles; a guessed start is left out; nothing in a pregnancy; What repeats for you
//     and the table agree; the doctor-call share keeps its key and sends a line a sign;
//   3 L2 Me > Reminders: "On your lock screen: nothing", then her next reminder as the phone gets it, following "Show what
//     each reminder is about"; discreet mode's words; nothing with reminders off or on the web; Hindi;
//   4 L3 the empty report's example (marked, made up, her diary untouched; not in big letters); the example line while What
//     repeats for you waits (on Cycles' card, or its own card in midlife), gone once it is ready;
//   5 L4 the toast after a log speaks from her pattern on a day that fits it (her logged start, her next logged start, or
//     Sakhi's own date), and not on a day that doesn't, in discreet mode or on a shared phone; Hindi; What helps stays;
//   6 no page errors.
// Usage: node test/showgets.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'showgets'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 900)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-11-08';   /* a Sunday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (day, hm) => new Date(new Date(TODAY + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
/* the Android bridge, keeping what Sakhi asks it to schedule */
const ANDROID = 'window.__sched = []; window.SakhiAndroid = { schedule(j){ try { window.__sched = JSON.parse(j); } catch (e) {} return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, setDisguise(){}, isDisguised(){ return false; }, keepAwake(){} };';
const CLIP = 'window.__copied = []; try { Object.defineProperty(navigator, "clipboard", { value: { writeText: (x) => { window.__copied.push(x); return Promise.resolve(); } }, configurable: true }); } catch (e) {}';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.83-pilot', platform: 'android' };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: [], daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.39', focus: { tile: 'cycle', goals: [], at: ago(30) }, prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
/* a daily pill at 9 pm, as test/notify.mjs books it */
const PILL = { id: 'pill', mod: 'contra', kind: 'med', title: { en: 'Take your pill', hi: 'अपनी गोली लें' }, every: 1, start: TODAY, time: '21:00', on: true };

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(Object.assign({}, LOCAL, o.config || {})) + ';');
  if (o.android !== false) await ctx.addInitScript(ANDROID);
  await ctx.addInitScript(CLIP);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  const sent = [];
  await ctx.route(/^https?:/, (r) => {
    const req = r.request(); const p = new URL(req.url()).pathname.replace(/^.*\/v1\//, ''); sent.push(req.method() + ' ' + p);
    const ans = o.server ? o.server(req.method(), p) : null;
    r.fulfill({ status: ans ? ans[0] : 200, contentType: 'application/json', body: JSON.stringify(ans ? ans[1] : {}) });
  });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: o.now || at(0, '10:00') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  return { ctx, page, errs, sent, name: o.name || 'page' };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const view = (page) => page.$eval('#view', (e) => e.innerText);
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000 }); await page.$eval(sel, (el) => el.click()); await settle(page, 300); };
const tapNow = async (page, sel) => { await page.$eval(sel, (el) => el.click()); await settle(page, 300); };   /* Home's feeling chips, clicked as the other suites do */
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText).catch(() => '');
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const toastT = async (page) => (await txt(page, '#toast-root .toast > span')) || txt(page, '#toast-root .toast');
const day = async (page, d) => { await page.evaluate((a) => window.Saathi.openDay(a), d); await settle(page, 300); };
const closeDay = async (page) => { await page.evaluate(() => window.Saathi.closeSheet()); await settle(page, 200); };
const cycles = async (page) => { await go(page, 'diary'); await page.evaluate(() => { window.Saathi.mem.diaryTab = 'tr'; window.Saathi.render(); }); await settle(page, 400); };
/* the report's "When it comes" table as rows of [name, before, during, other], and which cell is bold */
const grid = (page, scope) => page.$$eval((scope || '#view') + ' table.rp-tm tbody tr', (rs) => rs.map((r) => Array.from(r.cells).map((c) => (c.querySelector('b') ? '*' : '') + c.innerText.trim())));
const done = async (x) => { check((x.name || 'page') + ': no page errors', !x.errs.length, x.errs); await x.ctx.close(); };

/* ---------- her diary: starts (days ago), 5 days each, the latest `starts[last]` ---------- */
const evs = (starts, approx) => { const out = []; starts.forEach((s) => { out.push(Object.assign({ d: ago(s), t: 'start' }, (approx || []).indexOf(s) >= 0 ? { approx: true } : {}), { d: ago(s - 4), t: 'end' }); }); return out; };
const addTo = (o, dayIso, k) => { o[dayIso] = (o[dayIso] || []).concat([k]); };
/* Asha: gaps 31, 33, 43 and 35 days, her latest period 3 days ago. Low mood the 3 days before each of her last 3 periods, cramps
   on the first 2 days of every period, a headache on day 16 of 3 cycles, and okay or calm days that never count. */
const ASHA_STARTS = [145, 114, 81, 38, 3];
const ashaDaily = () => { const o = {};
  [81, 38, 3].forEach((n) => [3, 2, 1].forEach((k) => addTo(o, ago(n + k), 'd_mood')));
  ASHA_STARTS.forEach((s) => { addTo(o, ago(s), 'd_cramps'); addTo(o, ago(s - 1), 'd_cramps'); });
  [114, 81, 38].forEach((s) => addTo(o, ago(s - 15), 'd_headache'));
  addTo(o, ago(50), 'd_ok'); addTo(o, ago(60), 'd_calm');
  return o; };
const ASHA = () => ({ events: evs(ASHA_STARTS), daily: ashaDaily() });

/* ---------- 1. L1: the report's "When it comes" ---------- */
{
  const a = await open({ name: '1 report', hash: '#report', seed: ASHA() });
  const v = await view(a.page);
  check('1 the report has "When it comes (my last 3 cycles)" and no "What I noted (last 90 days)" (one home)', /When it comes \(my last 3 cycles\)/.test(v) && !/What I noted \(last 90 days\)/.test(v), v.slice(0, 900));
  const heads = await a.page.$$eval('#view table.rp-tm thead th', (xs) => xs.map((x) => x.innerText.trim()));
  check('1 its columns: Days noted, Before my period, During my period, Other days', heads.join('|') === 'Days noted|Before my period|During my period|Other days', heads);
  const g = await grid(a.page);
  check('1 her counts: low mood 9 before, cramps 6 during, headache 3 other; okay and calm never count; this cycle\'s cramps not in the table', JSON.stringify(g) === JSON.stringify([['Low mood', '*9', '0', '0'], ['Cramps', '0', '*6', '0'], ['Headache', '0', '0', '*3']]), g);
  check('1 the dates line: 17 Jul to 4 Nov, the 7 days before each period, the days she bled, and the rest', /17 Jul to 4 Nov: the 7 days before each period, the days I bled, and the rest\./.test(v), v);
  check('1 what she noted since her last period: "This cycle so far (from 5 Nov): Cramps 2 days"', /This cycle so far \(from 5 Nov\): Cramps 2 days/.test(v), v);
  await shot(a.page, '1-report');
  await tap(a.page, '#rp-copy'); await sleep(150);
  const copied = await a.page.evaluate(() => window.__copied.join('\n'));
  check('1 Copy: a line a sign, then the dates line', /When it comes \(my last 3 cycles\)\nLow mood: 9 days before my period, 0 during, 0 other\nCramps: 0 days before my period, 6 during, 0 other\nHeadache: 0 days before my period, 0 during, 3 other\n17 Jul to 4 Nov: /.test(copied), copied);
  await go(a.page, 'report-show');
  check('1 big letters: the same table', JSON.stringify(await grid(a.page)) === JSON.stringify(g) && await a.page.$eval('#view table.rp-tm', (e) => parseFloat(getComputedStyle(e).fontSize) >= 18));
  await cycles(a.page);
  const pat = await txt(a.page, '#diary-body .pat-card');
  check('1 What repeats for you agrees: low mood before her period, cramps from the first day', /Low mood[\s\S]*often about 3 days before your period/.test(pat) && /Cramps[\s\S]*usually from the first day of your period/.test(pat) && !/Headache/.test(pat), pat);
  await done(a);
}
{
  const h = await open({ name: '1 Hindi 360', hash: '#report', w: 360, h: 800, seed: Object.assign(ASHA(), { lang: 'hi' }) });
  const v = await view(h.page);
  check('1 Hindi: "यह कब होता है (मेरे पिछले 3 चक्र)" with its columns and her signs', /यह कब होता है \(मेरे पिछले 3 चक्र\)/.test(v) && /पीरियड से पहले/.test(v) && /पीरियड के दिनों में/.test(v) && /बाकी दिन/.test(v) && /मन उदास/.test(v) && /ऐंठन/.test(v), v.slice(0, 600));
  check('1 Hindi: the dates line and this cycle so far', /हर पीरियड से पहले के 7 दिन, ब्लीडिंग के दिन, और बाकी दिन।/.test(v) && /यह चक्र अब तक/.test(v), v);
  check('1 Hindi at 360 px: nothing runs off the screen', await noScroll(h.page));
  await shot(h.page, '1-report-hi-360');
  await done(h);
}

/* ---------- 2. L1: when the table shows, and the doctor-call share ---------- */
{
  const one = await open({ name: '2 one cycle', hash: '#report', seed: { events: evs([38, 3]), daily: (() => { const o = {}; addTo(o, ago(5), 'd_mood'); addTo(o, ago(38), 'd_cramps'); return o; })() } });
  const v = await view(one.page);
  check('2 one complete cycle: the counts stay, no table', /What I noted \(last 90 days\)/.test(v) && !(await has(one.page, 'table.rp-tm')), v.slice(0, 600));
  await done(one);
  const gs = await open({ name: '2 guessed start', hash: '#report', seed: { events: evs(ASHA_STARTS, [38]), daily: ashaDaily() } });
  const v2 = await view(gs.page); const g2 = await grid(gs.page);
  check('2 a guessed start: its two gaps are left out, so 2 cycles are read', /When it comes \(my last 2 cycles\)/.test(v2) && JSON.stringify(g2) === JSON.stringify([['Cramps', '0', '*4', '0'], ['Low mood', '*3', '0', '0'], ['Headache', '0', '0', '*1']]), [v2.slice(0, 400), g2]);
  await done(gs);
  const pg = await open({ name: '2 pregnant', hash: '#report', seed: Object.assign(ASHA(), { situation: { pregnant: true, pregnantSince: ago(30) } }) });
  check('2 in a pregnancy: no table', !(await has(pg.page, 'table.rp-tm')));
  await done(pg);
  const hy = await open({ name: '2 periods stopped', hash: '#report', seed: Object.assign(ASHA(), { situation: { stopped: true } }) });
  check('2 periods stopped: no table', !(await has(hy.page, 'table.rp-tm')));
  await done(hy);
  /* the doctor-call share: the same section key, a line a sign */
  const srv = (m, p) => (m === 'GET' && p === 'requests' ? [200, { available: true, requests: [] }] : null);
  const c = await open({ name: '2 call share', hash: '#ask', seed: ASHA(), config: { api: 'https://api.test.invalid' }, server: srv });
  if (await has(c.page, '#ask-call [data-go="ask-call"]')) await tap(c.page, '#ask-call [data-go="ask-call"]'); else await go(c.page, 'ask-call');
  const keys = await c.page.$$eval('[data-ac-sec]', (xs) => xs.map((x) => x.dataset.acSec));
  check('2 the doctor-call share still lists "symptoms"', keys.indexOf('symptoms') >= 0, keys);
  if (keys.indexOf('symptoms') >= 0) {
    await c.page.$eval('[data-ac-sec="symptoms"]', (x) => { x.checked = true; x.dispatchEvent(new Event('change')); }); await settle(c.page, 300);
    const prev = await c.page.$$eval('#ac-preview li', (xs) => xs.map((x) => x.innerText));
    check('2 ... and sends her table a line a sign', prev.some((l) => /^Low mood: 9 days before my period, 0 during, 0 other$/.test(l)) && prev.some((l) => /^Cramps: 0 days before my period, 6 during, 0 other$/.test(l)), prev);
    check('2 ... with its dates and this cycle so far, so her recent signs still go to the doctor', prev.some((l) => /^17 Jul to 4 Nov: the 7 days before each period/.test(l)) && prev.some((l) => /^This cycle so far \(from 5 Nov\): Cramps 2 days$/.test(l)), prev);
  }
  await done(c);
}

/* ---------- 3. L2: what her phone shows ---------- */
{
  const seed = Object.assign(ASHA(), { reminders: [PILL] });
  const a = await open({ name: '3 preview', hash: '#me-reminders', seed: seed });
  const card = await txt(a.page, '#view .np-card');
  check('3 Me > Reminders: "What your phone shows" and "On your lock screen: nothing"', /What your phone shows/.test(card) && /On your lock screen: nothing/.test(card), card);
  const first = async (page) => { await settle(page, 1200); return page.evaluate(() => { const xs = (window.__sched && window.__sched.items) || window.__sched || []; const l = Array.isArray(xs) ? xs : []; return l.slice().sort((x, y) => x.at - y.at)[0] || null; }); };   /* Sakhi books reminders 800 ms after a change */
  const nx = await first(a.page);
  const note = await a.page.$eval('#view .np-note', (e) => ({ t: e.querySelector('b').innerText, b: e.querySelector('.np-txt span').innerText })).catch(() => null);
  check('3 the preview is her next reminder exactly as the phone gets it (title and words)', !!nx && !!note && note.t === nx.title && note.b === nx.body && /your next reminder \(/.test(card), [nx, note, card]);
  check('3 ... and its words are plain by default (her pill tonight: "Time for your tablet")', !!note && !!nx && (nx.id.indexOf('r-pill') !== 0 || note.b === 'Time for your tablet') && !/Low mood|Cramps|pill/i.test(note.b), [nx, note]);
  await a.page.$eval('#me-notif-words', (x) => { x.checked = true; x.dispatchEvent(new Event('change')); }); await settle(a.page, 400);
  const nx2 = await first(a.page); const note2 = await a.page.$eval('#view .np-note', (e) => ({ t: e.querySelector('b').innerText, b: e.querySelector('.np-txt span').innerText })).catch(() => null);
  check('3 "Show what each reminder is about" on: the preview follows the booked reminder ("Take your pill")', !!nx2 && !!note2 && note2.b === nx2.body && (nx2.id.indexOf('r-pill') !== 0 || note2.b === 'Take your pill'), [nx2, note2]);
  check('3 the preview changes nothing she keeps: her reminders are as she set them', JSON.stringify((await st(a.page)).reminders) === JSON.stringify([PILL]), (await st(a.page)).reminders);
  await shot(a.page, '3-preview');
  await done(a);
  const d = await open({ name: '3 discreet', hash: '#me-reminders', seed: Object.assign({}, seed, { settings: { discreet: true, notify: true } }) });
  const dn = await d.page.$eval('#view .np-note', (e) => ({ t: e.querySelector('b').innerText, b: e.querySelector('.np-txt span').innerText })).catch(() => null);
  check('3 discreet mode: the lock-screen line, and her neutral words', /On your lock screen: nothing/.test(await txt(d.page, '#view .np-card')) && !!dn && dn.t !== 'Qura Sakhi' && dn.b === 'Reminder' && !(await has(d.page, '#me-notif-words')), dn);
  await done(d);
  const off = await open({ name: '3 off', hash: '#me-reminders', seed: Object.assign({}, seed, { settings: { notify: false, notifyOff: true } }) });
  check('3 reminders off: no preview', !(await has(off.page, '#view .np-card')));
  await done(off);
  const web = await open({ name: '3 web', hash: '#me-reminders', android: false, config: { platform: 'web' }, seed: seed });
  check('3 on the web (no phone reminders): no preview', !(await has(web.page, '#view .np-card')));
  await done(web);
  const hi = await open({ name: '3 Hindi', hash: '#me-reminders', w: 360, h: 800, seed: Object.assign({}, seed, { lang: 'hi' }) });
  const hc = await txt(hi.page, '#view .np-card');
  check('3 Hindi: "लॉक स्क्रीन पर: कुछ नहीं" and the open-phone line', /आपके फ़ोन पर क्या दिखता है/.test(hc) && /लॉक स्क्रीन पर: कुछ नहीं/.test(hc) && /फ़ोन खुला होने पर/.test(hc), hc);
  check('3 Hindi at 360 px: nothing runs off the screen', await noScroll(hi.page));
  await shot(hi.page, '3-preview-hi-360');
  await done(hi);
}

/* ---------- 4. L3: examples of what she gets ---------- */
{
  const a = await open({ name: '4 empty report', hash: '#report', seed: {} });
  check('4 an empty report offers "See an example"', /Nothing to show yet|nothing/i.test(await view(a.page)) && await has(a.page, '#rp-ex'), await view(a.page));
  const before = JSON.stringify((await st(a.page)).events) + JSON.stringify((await st(a.page)).daily);
  await tap(a.page, '#rp-ex');
  const sh = await txt(a.page, '#sheet-root .sheet');
  check('4 the example: marked "Example", made-up entries, her report\'s parts with the table', /Example/.test(sh) && /Made-up entries, to show what your report will look like\./.test(sh) && /My last periods/.test(sh) && /When it comes \(my last 3 cycles\)/.test(sh) && /Questions I want to ask/.test(sh) && (await grid(a.page, '#sheet-root')).length === 4, sh.slice(0, 700));
  await shot(a.page, '4-example-report');
  await tap(a.page, '#rpx-close');
  check('4 Close shuts it, and her diary is untouched', !(await has(a.page, '#sheet-root .sheet')) && JSON.stringify((await st(a.page)).events) + JSON.stringify((await st(a.page)).daily) === before);
  await go(a.page, 'report-show');
  check('4 big letters: no example button', !(await has(a.page, '#rp-ex')));
  await done(a);
  /* two periods with notes: Cycles' "What Sakhi can tell you" row counts them, with the example line */
  const w = await open({ name: '4 waiting', seed: { events: evs([66, 38, 3]), daily: (() => { const o = {}; [38, 3].forEach((s) => { addTo(o, ago(s), 'd_cramps'); addTo(o, ago(s - 1), 'd_cramps'); }); return o; })() } });
  await cycles(w.page);
  const row = await txt(w.page, '#diary-body .kn-rep');
  check('4 while What repeats for you waits: its row carries "Example" and the card\'s own words', /Notes on 3 periods · 2 so far/.test(row) && /Example/.test(row) && /Cramps · usually from the first day of your period/.test(row), row);
  await shot(w.page, '4-waiting-row');
  await done(w);
  const r = await open({ name: '4 ready', seed: ASHA() });
  await cycles(r.page);
  check('4 once it is ready: no example line', !(await has(r.page, '#diary-body .pat-ex-l')) && await has(r.page, '#diary-body .pat-card'));
  await done(r);
  /* midlife: no "What Sakhi can tell you" card, so the waiting card shows the example itself */
  const m = await open({ name: '4 midlife waiting', seed: { dob: '1979-05-01', events: evs([66, 38, 3]), daily: (() => { const o = {}; [38, 3].forEach((s) => addTo(o, ago(s), 'd_cramps')); return o; })() } });
  await cycles(m.page);
  const mc = await txt(m.page, '#diary-body .pat-card');
  check('4 midlife: the waiting card carries the example line', /Note how you feel around your periods/.test(mc) && /Example/.test(mc) && /Cramps · usually from the first day of your period/.test(mc), mc);
  await done(m);
}

/* ---------- 5. L4: the toast speaks from her pattern ---------- */
/* Asha again, moved so her latest period starts today; nothing noted before it yet */
const MOVED = [142, 111, 78, 35, 0];
const movedDaily = () => { const o = {}; [78, 35].forEach((n) => [3, 2, 1].forEach((k) => addTo(o, ago(n + k), 'd_mood'))); [111].forEach((n) => [3, 2, 1].forEach((k) => addTo(o, ago(n + k), 'd_mood')));
  [142, 111, 78, 35].forEach((s) => { addTo(o, ago(s), 'd_cramps'); addTo(o, ago(s - 1), 'd_cramps'); }); return o; };
{
  const a = await open({ name: '5 day 1', seed: { events: evs(MOVED), daily: movedDaily() } });
  await tapNow(a.page, '[data-feel="d_cramps"]');
  const t1 = await toastT(a.page);
  check('5 cramps on day 1 of her period: "Cramps noted · usually from the first day of your period"', /^Cramps noted · usually from the first day of your period$/.test(t1.trim()), t1);
  check('5 ... and What helps is still there', /What helps/.test(await txt(a.page, '#toast-root .toast')), await txt(a.page, '#toast-root .toast'));
  await shot(a.page, '5-toast-day1');
  await day(a.page, ago(2));
  await tap(a.page, '#sheet-root [data-sym="d_mood"]');
  const t2 = await toastT(a.page);
  check('5 low mood 2 days before the period she logged today: "often about 3 days before your period"', /^Low mood noted · often about 3 days before your period$/.test(t2.trim()), t2);
  await closeDay(a.page);
  await day(a.page, ago(20));
  await tap(a.page, '#sheet-root [data-sym="d_cramps"]');
  const t3 = await toastT(a.page);
  check('5 cramps mid-cycle: the usual "Noted", nothing about her pattern', t3.trim() === 'Noted', t3);
  await closeDay(a.page);
  await done(a);
  /* Sakhi's own date: gaps of 33, her period due in 3 days */
  const B = [162, 129, 96, 63, 30]; const bd = {}; B.forEach((s) => { addTo(bd, ago(s), 'd_cramps'); addTo(bd, ago(s - 1), 'd_cramps'); }); [129, 96, 63, 30].forEach((n) => [3, 2, 1].forEach((k) => addTo(bd, ago(n + k), 'd_mood')));
  const b = await open({ name: '5 her date', seed: { events: evs(B), daily: bd } });
  await tapNow(b.page, '[data-feel="d_mood"]');
  const t4 = await toastT(b.page);
  check('5 low mood 3 days before Sakhi\'s date for her next period: the pattern line', /^Low mood noted · often about 3 days before your period$/.test(t4.trim()), t4);
  await done(b);
  const d = await open({ name: '5 discreet', seed: { events: evs(MOVED), daily: movedDaily(), settings: { discreet: true, notify: true } } });
  /* Home shows her no sign names in discreet mode, so she notes it on the day page */
  await day(d.page, ago(0));
  const dChip = await has(d.page, '#sheet-root [data-sym="d_cramps"]');
  if (dChip) await tapNow(d.page, '#sheet-root [data-sym="d_cramps"]');
  const t5 = dChip ? await toastT(d.page) : '';
  check('5 discreet mode: no pattern words in the toast', !dChip || (!!t5 && !/usually|Cramps/.test(t5)), [dChip, t5]);
  await done(d);
  const h = await open({ name: '5 Hindi', w: 360, h: 800, seed: { lang: 'hi', events: evs(MOVED), daily: movedDaily() } });
  await tapNow(h.page, '[data-feel="d_cramps"]');
  const t6 = await toastT(h.page);
  check('5 Hindi: "ऐंठन दर्ज · अक्सर पीरियड के पहले दिन से"', /^ऐंठन दर्ज · अक्सर पीरियड के पहले दिन से$/.test(t6.trim()), t6);
  check('5 Hindi at 360 px: nothing runs off the screen', await noScroll(h.page));
  await done(h);
}

/* ---------- report ---------- */
await browser.close();
const fails = results.filter((r) => !r.pass);
console.log(results.length - fails.length + '/' + results.length + ' passed');
fs.writeFileSync(path.join(SHOTS, 'results.json'), JSON.stringify(results, null, 2));
process.exit(fails.length ? 1 : 0);
