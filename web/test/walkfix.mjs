// Version 39.33: the walkthrough's fixes (Mohit, 28 Oct: "can you do a walkthrough of home my plan and diary section if any gaps
// or bugs", then "Proceed fixing all"; MODULE_API section 76). A diary like the one on Mohit's Flip5: periods on 5 Aug, 8 Sept,
// 1 Oct (on the pill until 20 Oct, so not counted) and 27 Oct, her Getting ready plan on its first day. This file checks:
//   1 Edit period dates: no + button over its Save;
//   2 Today: a step she marked "Partly" says so, "Next" is the first step she hasn't touched, and none after her check-in;
//   3 Cycles: "Cycle length (last 2)" when 2 gaps count;
//   4 the calendar's key: a start, the days after it, spotting, and the predicted days the month shows (no date needed);
//   5 Edit period dates: Sakhi's guessed days lighter, with their line; a day she taps is hers; Save with no change keeps all;
//   6 Today: the cycle left out of her gaps says why (never on a shared phone);
//   7 "Feeling okay" and a sign that says otherwise are never on together (a danger sign stays);
//   8 Cycles: "3-day period · 23-day cycle", "26-day cycle · no end day saved";
//   9 My progress: no comparison promised, her checklist's count once, its button in the same card;
//  10 the flow choices one to a row, all as tall;
//  11 Hindi at 360 px; 12 no page errors.
// Usage: node test/walkfix.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 900)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-28';   /* a Wednesday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm) => new Date(TODAY + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.33-pilot', platform: 'android' };
/* Mohit's phone: 5 Aug (to 8 Aug), 8 Sept (to 10 Sept), 1 Oct (no end day), 27 Oct (no end day, today is day 2) */
const EVENTS = [{ d: '2026-08-05', t: 'start' }, { d: '2026-08-08', t: 'end' }, { d: '2026-09-08', t: 'start' }, { d: '2026-09-10', t: 'end' }, { d: '2026-10-01', t: 'start' }, { d: '2026-10-27', t: 'start' }];
const SIT = { planning: true, hormones: false, hormonesSince: '2026-10-05', hormonesUntil: '2026-10-20' };   /* on the pill in October only: that cycle isn't counted */
const IK = { at: ago(1), stage: 'ttc', goal: 'ready', act: 1, food: 'veg', milk: 'y', lim: [], when: 'evening', bflags: [], trying: null, bmi: null, bset: 'std', bdoc: 'std' };
const baby = (log) => ({ pack: 'ttc', goalKey: 'ready', start: TODAY, started: TODAY, go: true, pv: 2, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'evening', log: log || {}, weeks: {}, body: [], intake: IK });
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: SIT, events: EVENTS, daily: {}, notes: {}, checkins: {}, goals: ['ttc'],
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30) }, mods: {}, reminders: [], intake: IK }, x || {}, { settings: Object.assign({ toursAuto: false }, (x || {}).settings || {}) });

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: at(o.hm || '21:30') });
  await page.goto(PAGE + '#' + (o.hash || 'home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 600);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (a, h) => { await a.page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(a.page, 500); };
const tap = async (a, sel) => { await a.page.waitForSelector(sel, { timeout: 8000, state: 'attached' }); await a.page.$eval(sel, (el) => el.click()); await settle(a.page, 400); };
const has = (a, sel) => a.page.$(sel).then((x) => !!x);
const txt = (a, sel) => a.page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const view = (a) => txt(a, '#view');
const st = (a) => a.page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const noScroll = (a) => a.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const KEYS = /\b(plan|ttc|ce|mc|vd)_[a-z0-9_]+\b/;   /* a string key on screen is a missing translation */
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const tabTo = async (a, k) => { await go(a, 'diary'); await tap(a, '[data-tab="' + k + '"]'); };

/* ---------- 1 and 5: Edit period dates ---------- */
{
  const a = await open({ hash: 'diary' });
  await tabTo(a, 'cal');
  check('1 the Calendar has its + button', await has(a, '#fab'));
  await tap(a, '#cal-edit');
  check('1 Edit period dates: no + button over its Save', !(await has(a, '#fab')) && (await has(a, '#ce-save')));
  const g = await a.page.evaluate(() => Array.from(document.querySelectorAll('.ce-d.bleed')).map((b) => b.dataset.ed + (b.classList.contains('light') ? ':g' : '')).join());
  check('5 her logged start solid, Sakhi\'s guessed days lighter (1 Oct with no end day; today, day 2 of a period with no end day)', g === '2026-10-01,2026-10-02:g,2026-10-03:g,2026-10-04:g,2026-10-05:g,2026-10-27,2026-10-28:g', g);
  check('5 ...and the line that says so', /Lighter days are Sakhi’s guess, as no end day is saved\. Keep them, or tap to take them off\./.test(await view(a)));
  await tap(a, '[data-ed="2026-10-05"]'); await tap(a, '[data-ed="2026-10-05"]');
  check('5 a guessed day she taps twice is hers: marked, not lighter', await a.page.$eval('[data-ed="2026-10-05"]', (b) => b.classList.contains('bleed') && !b.classList.contains('light')));
  const before = JSON.stringify((await st(a)).events);
  await tap(a, '#ce-save');
  check('5 Save with no change keeps every period as it was', JSON.stringify((await st(a)).events) === before);
  check('1 the + button is back after Save', await has(a, '#fab'));
  await tap(a, '#cal-edit'); await tap(a, '#ce-cancel');
  check('1 ...and after Cancel', await has(a, '#fab'));
  /* her current period stays open when she corrects an old one */
  await tap(a, '#cal-edit'); await tap(a, '[data-ed="2026-10-05"]'); await tap(a, '#ce-save');
  const ev = (await st(a)).events;
  check('5 correcting October: a start on 1 Oct and an end on 4 Oct; 27 Oct still open', ev.some((e) => e.d === '2026-10-04' && e.t === 'end') && ev.some((e) => e.d === '2026-10-27' && e.t === 'start') && !ev.some((e) => e.t === 'end' && e.d >= '2026-10-27'), ev.filter((e) => e.d >= '2026-10-01'));
  await done(a);
}

/* ---------- 4: the calendar's key ---------- */
{
  const a = await open({ hash: 'diary' });
  await tabTo(a, 'cal');
  const k = await txt(a, '#view .legend');
  const sw = await a.page.evaluate(() => Array.from(document.querySelectorAll('#view .legend .sw')).slice(0, 2).map((i) => getComputedStyle(i).backgroundColor));
  check('4 the key: a start (solid), the days after it (lighter, as the calendar draws them), spotting', /^Period started Bleeding Spotting/.test(k) && sw.length === 2 && sw[0] !== sw[1], { k, sw });
  check('4 ...her gaps vary, so no predicted days and no "Predicted period"', !/Predicted period/.test(k) && !(await has(a, '#view .cal .day.pred')) && /counts, not a date/.test(await view(a)));
  await tap(a, '#cal-key');
  const sh = await txt(a, '.sheet');
  check('4 What the marks mean: the same, and Today', /Period started Bleeding Spotting Today/.test(sh), sh.slice(0, 300));
  await done(a);
  /* regular gaps: next month shows her predicted days, and the key names them */
  const rg = await open({ hash: 'diary', seed: { situation: { planning: true }, events: [{ d: ago(66), t: 'start' }, { d: ago(62), t: 'end' }, { d: ago(38), t: 'start' }, { d: ago(34), t: 'end' }, { d: ago(10), t: 'start' }, { d: ago(6), t: 'end' }] } });
  await tabTo(rg, 'cal'); await tap(rg, '#cal-next');
  check('4 regular gaps: the predicted days and "Predicted period" in the key', (await has(rg, '#view .cal .day.pred')) && /Predicted period/.test(await txt(rg, '#view .legend')), await txt(rg, '#view .legend'));
  await done(rg);
  const d = await open({ hash: 'diary', seed: { settings: { discreet: true } } });
  await go(d, 'diary');
  check('4 a shared phone: no new period words in the key', !/Period started|Predicted period/.test(await txt(d, '#view .legend')));
  await done(d);
}

/* ---------- 2: Today's steps after "Partly" ---------- */
{
  const a = await open({ seed: { mods: { plan: baby({ [TODAY]: { min: 15, ci: 1, ck: { folic: 'd', move: 'd', food: 'p' } } }), ttc: { folic: { has: TODAY } } } } });
  const v = await view(a);
  check('2 after her check-in: her greens "Partly done", and no "Next"', /Greens with one meal Partly done/.test(v) && !/Next ·|Next step/.test(v), v.slice(0, 900));
  await done(a);
  const b = await open({ hm: '13:00', seed: { mods: { plan: baby({ [TODAY]: { ck: { folic: 'd', food: 'p' } } }), ttc: { folic: { has: TODAY } } } } });
  const w = await view(b);
  check('2 before it too: "Partly done" on her greens (her check-in button shows, so no "Next")', /Greens with one meal Partly done/.test(w) && !/Greens with one meal Next/.test(w) && /How did today go\?/.test(w), w.slice(0, 900));
  await done(b);
}

/* ---------- 6: the cycle left out of her gaps ---------- */
{
  const a = await open({});
  const v = await view(a);
  check('6 Today: her last gaps, and the cycle left out, in Days\' words', /Your last gaps: 34, 23 days/.test(v) && /Period from 1 Oct · not counted: hormones/.test(v), v.slice(0, 600));
  await done(a);
  const s = await open({ seed: { settings: { shared: true } } });
  check('6 not on a shared phone', !/not counted: hormones/.test(await view(s)));
  await done(s);
}

/* ---------- 3 and 8: Cycles ---------- */
{
  const a = await open({ hash: 'diary' });
  await tabTo(a, 'tr');
  const v = await view(a);
  check('3 "Cycle length (last 2)": the 2 gaps that count', /Cycle length \(last 2\)/.test(v) && !/last 6/.test(v), (v.match(/Cycle length[^)]*\)/) || [])[0]);
  check('8 "3-day period · 23-day cycle" and "4-day period · 34-day cycle"', /3-day period · 23-day cycle/.test(v) && /4-day period · 34-day cycle/.test(v) && !/days period/.test(v));
  check('8 a cycle with no end day says so', /26-day cycle · no end day saved · not counted: hormones/.test(v), (v.match(/1 Oct – 26 Oct[^E]*/) || [])[0]);
  await done(a);
}

/* ---------- 7: "Feeling okay" ---------- */
{
  const a = await open({ hash: 'diary', seed: { daily: { '2026-10-26': ['d_happy'] } } });
  await a.page.evaluate(() => window.Saathi.openDay('2026-10-26')); await settle(a.page, 500);
  const sel = async () => a.page.evaluate(() => (window.Saathi.state.daily['2026-10-26'] || []).slice().sort().join());
  await tap(a, '.sheet [data-sym="d_ok"]');
  await tap(a, '.sheet [data-sym="d_tired"]');
  check('7 the day page: a sign she adds takes "Feeling okay" off (happy stays)', (await sel()) === 'd_happy,d_tired', await sel());
  await tap(a, '.sheet [data-sym="d_ok"]');
  check('7 ...and "Feeling okay" takes the sign off (happy stays)', (await sel()) === 'd_happy,d_ok', await sel());
  await done(a);
  const h = await open({});
  await tap(h, '[data-feel="d_cramps"]'); await tap(h, '[data-feel="d_ok"]');
  const td = async () => h.page.evaluate((x) => (window.Saathi.state.daily[x] || []).slice().sort().join(), TODAY);
  check('7 Today\'s quick set: the same rule', (await td()) === 'd_ok', await td());
  await tap(h, '[data-feel="d_mood"]');
  check('7 ...both ways', (await td()) === 'd_mood', await td());
  await done(h);
  const p = await open({ hash: 'diary', seed: { situation: { pregnant: true, pregnantSince: ago(120) }, daily: { [TODAY]: ['d_pbleed'] } } });
  await p.page.evaluate(() => window.Saathi.openDay('2026-10-28')); await settle(p.page, 500);
  const okb = await has(p, '.sheet [data-sym="d_ok"]'); if (okb) await tap(p, '.sheet [data-sym="d_ok"]');
  const pd = await p.page.evaluate((x) => (window.Saathi.state.daily[x] || []).slice().sort().join(), TODAY);
  check('7 a danger sign stays when she taps "Feeling okay" (bleeding in a pregnancy)', okb && pd === 'd_ok,d_pbleed', { pd, okb });
  await done(p);
}

/* ---------- 9: My progress ---------- */
{
  const a = await open({ hash: 'plan-progress', seed: { mods: { plan: baby({ [TODAY]: { min: 15, ci: 1, ck: { folic: 'd', move: 'd', food: 'p' } } }), ttc: { folic: { has: TODAY } } } } });
  const v = await view(a);
  check('9 My progress: "From what you logged." (Getting ready compares nothing with before)', /From what you logged\./.test(v) && !/compared with before/.test(v), v.slice(0, 300));
  check('9 her checklist\'s count once, in its own card with its button', (v.match(/of 17/g) || []).length === 1 && /Before-pregnancy checklist 0 of 17 done Open the checklist/.test(v) && !/checklist/.test(await txt(a, '.pl-bres')), v.slice(0, 700));
  await done(a);
}

/* ---------- 10: the flow choices ---------- */
{
  const a = await open({ hash: 'diary', w: 360 });
  await a.page.evaluate(() => window.Saathi.openDay('2026-10-27')); await settle(a.page, 500);
  const f = await a.page.evaluate(() => { const ts = Array.from(document.querySelectorAll('.flow-tiles .flow-t, .sheet [data-pads], .sheet .opt-pads button')).slice(0, 4); const g = document.querySelector('.flow-tiles'); return { n: ts.length, cols: g ? getComputedStyle(g).gridTemplateColumns.split(' ').length : 0, h: ts.map((x) => Math.round(x.getBoundingClientRect().height)) }; });
  check('10 the flow choices one to a row, all as tall', f.n === 4 && f.cols === 1 && Math.max(...f.h) - Math.min(...f.h) <= 2, f);
  await done(a);
}

/* ---------- 11: Hindi at 360 px ---------- */
{
  const a = await open({ w: 360, seed: { lang: 'hi' } });
  const v = await view(a);
  check('11 Hindi Today: the cycle left out, in Days\' words', /से पीरियड · गिना नहीं गया: हॉर्मोन/.test(v) && !KEYS.test(v) && (await noScroll(a)), v.slice(0, 500));
  await tabTo(a, 'tr');
  const c = await view(a);
  check('11 Hindi Cycles: "(पिछले 2)" and the cycle with no end day', /चक्र की लंबाई \(पिछले 2\)/.test(c) && /ख़त्म होने का दिन सेव नहीं/.test(c) && !KEYS.test(c) && (await noScroll(a)));
  await tabTo(a, 'cal'); await tap(a, '#cal-edit');
  const e = await view(a);
  check('11 Hindi Edit period dates: the guessed days\' line', /हल्के रंग वाले दिन Sakhi का अंदाज़ा हैं/.test(e) && !KEYS.test(e) && (await noScroll(a)));
  await done(a);
  const p = await open({ w: 360, hash: 'plan-progress', seed: { lang: 'hi', mods: { plan: baby({}), ttc: { folic: { has: TODAY } } } } });
  check('11 Hindi My progress: "आपने जो दर्ज किया उससे।"', /आपने जो दर्ज किया उससे।/.test(await view(p)) && !KEYS.test(await view(p)) && (await noScroll(p)));
  await done(p);
}

check('12 no page errors', !errsAll.length, errsAll.slice(0, 5));
await browser.close();
const pass = results.filter((r) => r.pass).length;
console.log((pass === results.length ? 'PASSED ' : 'FAILED ') + pass + '/' + results.length + ' (walkfix)');
process.exit(pass === results.length ? 0 : 1);
