// Version 39.31: the Cykel traps (Mohit, 28 Oct, after walking a competitor tracker: "build the trap suite first"). That app
// showed "Fertile window" and a "Low" chance of pregnancy to a woman 16 days late, drew a period that never came, read "High"
// on the first day of a period because of a positive strip, said "regular" and "varies quite a bit" on one card, and kept a
// period reminder for a date her new period had already moved. This file replays those states on Sakhi and checks every screen
// that shows dates (Today, the Calendar this month and next, the Days tab's week, Cycles, the fertile-days page) and the phone
// reminders it books. Nothing here changes the app; a failure is a gap to fix.
//   1 the control: steady cycles, 2 days before ovulation: the chance and the fertile days do show (so 2 to 9 mean something);
//   2 late by 3, 16 and 60 days: no chance, no phase, no fertile days or predicted period from today on, the fertile-days page
//     says why, "Period late?" from 16 days, no period reminder in the past;
//   3 a period today with a positive strip: no chance; a strip never moves the estimate or raises the chance;
//   4 hormones, a pregnancy, after the birth, midlife (45 and over), discreet mode: no chance and no fertile days anywhere;
//     no period or late reminder on hormones or in a pregnancy;
//   5 cycles too far apart, too few gaps: no chance and no fertile days, and Cycles says what it needs;
//   6 no screen says "regular" beside "Yours vary by", and no screen ever shows "Low chance" or calls a day "safe";
//   7 logging her period moves the period reminder: none left for the old range;
//   8 Hindi at 360 px for the late case; no page errors.
// Usage: node test/traps.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'traps'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-28';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm) => new Date(TODAY + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.31-pilot', platform: 'android' };   /* a pilot build: fertile days and the chance are on (MODULE_API section 35) */
/* the phone: reminders land in window.__sched (the last list Sakhi booked) */
const BRIDGE = 'window.__sched = null; window.SakhiAndroid = { schedule(j) { window.__sched = j; return 0; }, cancelAll() {}, canNotify() { return true; }, askNotify() {}, canExactAlarms() { return true; }, askExactAlarms() {}, testNotify() {}, speak() { return true; }, stop() {}, voices() { return "[]"; }, copy() { return true; }, haptic() {}, setSecure() {} };';
/* periods `gaps` apart (oldest first), the last one `last` days ago, 5 days each */
const periods = (last, gaps) => { const out = []; let x = last + gaps.reduce((a, b) => a + b, 0); [0].concat(gaps).forEach((g) => { x -= g; out.push({ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' }); }); return out; };
const steady = (last) => periods(last, Array(6).fill(28));
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, intake: { goal: 'track' }, events: steady(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3), firstLog: ago(30) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript(BRIDGE);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: at('09:30') });
  await page.goto(PAGE + '#home', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 1200);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const t = (page, k) => page.evaluate((k) => window.Saathi.t(k), k);
const tab = async (page, k) => { await page.evaluate((k) => { window.Saathi.mem.diaryTab = k; window.Saathi.mem.calMonth = null; }, k); await go(page, 'diary'); };

/* Everything one woman's screens say about dates, read from the page itself */
async function sweep(page) {
  const out = { text: {} };
  const read = () => page.evaluate((today) => {
    const v = document.querySelector('#view'); const cells = [...v.querySelectorAll('.day[data-day]')];
    const wk = [...v.querySelectorAll('.wd[data-wsel]')];
    return { text: v.innerText.replace(/\s+/g, ' '),
      chance: [...v.querySelectorAll('.chance')].map((e) => e.innerText.trim()),
      fertFut: cells.filter((c) => (c.classList.contains('fw') || c.classList.contains('ov')) && c.dataset.day >= today).map((c) => c.dataset.day),
      fertAll: cells.filter((c) => c.classList.contains('fw') || c.classList.contains('ov')).map((c) => c.dataset.day),
      pred: cells.filter((c) => c.classList.contains('pred')).map((c) => c.dataset.day),
      wkFert: wk.filter((c) => (c.classList.contains('fw') || c.classList.contains('ov')) && c.dataset.wsel >= today).map((c) => c.dataset.wsel),
      lateGo: !!v.querySelector('.hl-late-go') };
  }, TODAY);
  await go(page, 'home'); const h = await read(); out.text.home = h.text; out.chance = h.chance; out.lateGo = h.lateGo;
  await tab(page, 'cal'); const c1 = await read();
  await page.evaluate(() => { const n = new Date(2026, 10, 1); window.Saathi.mem.calMonth = n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-01'; window.Saathi.render(); }); await settle(page, 400);
  const c2 = await read();
  out.text.cal = c1.text + ' ' + c2.text; out.fertFut = c1.fertFut.concat(c2.fertFut); out.fertAll = c1.fertAll.concat(c2.fertAll); out.pred = c1.pred.concat(c2.pred);
  await tab(page, 'days'); const d = await read(); out.text.days = d.text; out.wkFert = d.wkFert.concat(c1.wkFert);
  await tab(page, 'tr'); out.text.cycles = (await read()).text;
  await go(page, 'fertile'); out.text.fertile = (await read()).text;
  out.all = Object.values(out.text).join(' ');
  out.sched = await page.evaluate(() => { try { return JSON.parse(window.__sched || '[]'); } catch (e) { return []; } });
  return out;
}
/* the words that would be a trap on any screen */
const NEG_SAFE = /(no|never|not a|isn.t a|there is no|calls? any day) ["“]?safe/i;
const safeWords = (s) => (s.match(/[^.]*\bsafe days?\b[^.]*/gi) || []).filter((x) => !NEG_SAFE.test(x));
async function universal(page, w, label) {
  const low = [await t(page, 'chn_low'), await t(page, 'chd_low')];
  check(label + ': no screen shows "Low chance"', !low.some((x) => w.all.indexOf(x) >= 0));
  check(label + ': no screen calls a day safe', safeWords(w.all).length === 0, safeWords(w.all));
  const reg = await t(page, 'vb_regular'); const vary = (await t(page, 'vd_cyc_var')).split('{n}')[0];
  check(label + ': Cycles never says "Regular" beside "' + vary.trim() + '"', !(w.text.cycles.indexOf(reg) >= 0 && w.text.cycles.indexOf(vary) >= 0));
}
const noFert = (w) => !w.chance.length && !w.fertFut.length && !w.wkFert.length;

/* ---------- 1 the control: steady cycles, 2 days before ovulation ---------- */
{
  const a = await open({ seed: { events: steady(12) } });
  const w = await sweep(a.page);
  check('1 control: Today shows the chance (high)', w.chance.length === 1 && w.chance[0].indexOf(await t(a.page, 'chn_high')) >= 0, w.chance);
  check('1 control: the calendar shows fertile days ahead', w.fertFut.length > 0, w.fertFut);
  check('1 control: a predicted period ahead', w.pred.length > 0);
  check('1 control: a period reminder booked before her range', w.sched.some((r) => /^period-/.test(r.id)), w.sched.map((r) => r.id));
  await universal(a.page, w, '1 control');
  const strip0 = w.chance[0];
  await a.page.evaluate((d) => { const s = window.Saathi.state; s.strips = s.strips || {}; s.strips[d] = 'positive'; window.Saathi.save(); }, TODAY); await settle(a.page, 1200);
  const w2 = await sweep(a.page);
  check('3 a positive strip on a fertile day changes nothing: same chance, same fertile days', w2.chance[0] === strip0 && w2.fertAll.join() === w.fertAll.join(), [w2.chance, strip0]);
  await done(a);
}

/* ---------- 2 late by 3, 16 and 60 days ---------- */
for (const late of [3, 16, 60]) {
  const a = await open({ seed: { events: steady(28 + late) } });
  const w = await sweep(a.page);
  const L = '2 late by ' + late + ' days';
  check(L + ': no chance on Today', !w.chance.length, w.chance);
  check(L + ': no phase on Today (no "Fertile window", "Ovulation", "After ovulation")', ![await t(a.page, 'phs_fertile'), await t(a.page, 'phs_ov'), await t(a.page, 'phs_after'), await t(a.page, 'phs_before')].some((x) => w.text.home.indexOf(x) >= 0));
  check(L + ': no fertile days from today on (calendar and week)', !w.fertFut.length && !w.wkFert.length, [w.fertFut, w.wkFert]);
  check(L + ': no predicted period drawn (no made-up cycle)', !w.pred.length, w.pred);
  check(L + ': the fertile-days page says why (due or late)', w.text.fertile.indexOf((await t(a.page, 'fe_late')).slice(0, 40)) >= 0, w.text.fertile.slice(0, 300));
  check(L + ': no "Fertile window in" or "Ovulation in" on Days', ![await t(a.page, 'dy_fw_in'), await t(a.page, 'dy_ov_in')].map((x) => x.split('{n}')[0]).some((x) => w.text.days.indexOf(x) >= 0));
  check(L + ': no period reminder for a range already past', !w.sched.some((r) => /^period-/.test(r.id)), w.sched.map((r) => r.id));
  if (late >= 16) check(L + ': "Period late?" under her cycle', w.lateGo);
  await universal(a.page, w, L);
  if (late === 16) await a.page.screenshot({ path: path.join(SHOTS, '2-late16.png') });
  await done(a);
}

/* ---------- 3 a period today, with a positive strip ---------- */
{
  const ev = steady(28).concat([{ d: TODAY, t: 'start' }]);
  const a = await open({ seed: { events: ev, strips: { [TODAY]: 'positive' } } });
  const w = await sweep(a.page);
  check('3 period day 1 with a positive strip: no chance on Today', !w.chance.some((x) => /chance/i.test(x)), w.chance);
  check('3 period day 1: today is not marked fertile (calendar, week)', w.fertAll.indexOf(TODAY) < 0 && w.wkFert.indexOf(TODAY) < 0);
  await universal(a.page, w, '3 period day 1');
  await done(a);
}
{
  const a = await open({ seed: { events: steady(3), strips: { [TODAY]: 'positive' } } });
  const w = await sweep(a.page);
  check('3 a positive strip outside the fertile days raises no chance', !w.chance.some((x) => /chance/i.test(x)), w.chance);
  await done(a);
}

/* ---------- 4 hormones, a pregnancy, after the birth, midlife, discreet mode ---------- */
const STATES = [
  ['hormones', { events: steady(12), situation: { hormones: true } }],
  ['a pregnancy', { events: steady(70), situation: { pregnant: true, pregnantSince: ago(70) } }],
  ['after the birth', { events: periods(330, [28, 28]), situation: { deliveredOn: ago(40), breastfeeding: true } }],
  ['midlife (46)', { events: steady(12), dob: '1980-03-01' }],
  ['discreet mode', { events: steady(12), settings: { discreet: true } }]
];
for (const [name, seed] of STATES) {
  const a = await open({ seed: seed });
  const w = await sweep(a.page);
  check('4 ' + name + ': no chance and no fertile days anywhere', noFert(w) && !w.fertAll.length, [w.chance, w.fertAll, w.wkFert]);
  if (name === 'hormones' || name === 'a pregnancy') {
    check('4 ' + name + ': no predicted period drawn', !w.pred.length, w.pred);
    check('4 ' + name + ': no period or late reminder booked', !w.sched.some((r) => /^(period|late)-/.test(r.id)), w.sched.map((r) => r.id));
  }
  await universal(a.page, w, '4 ' + name);
  await done(a);
}

/* ---------- 5 cycles too far apart, too few gaps ---------- */
{
  const a = await open({ seed: { events: periods(10, [23, 40, 26, 38, 30, 45]) } });
  const w = await sweep(a.page);
  check('5 gaps of 23 to 45 days: no chance and no fertile days', noFert(w) && !w.fertAll.length, [w.chance, w.fertAll]);
  check('5 gaps of 23 to 45 days: counts, not a date (Cycles says why)', w.text.cycles.indexOf(await t(a.page, 'kn_fert_irr')) >= 0 || w.text.cycles.indexOf((await t(a.page, 'why_irr')).split('{a}')[0]) >= 0, w.text.cycles.slice(0, 400));
  check('5 gaps of 23 to 45 days: the fertile-days page says hidden', w.text.fertile.indexOf((await t(a.page, 'fe_hidden')).slice(0, 30)) >= 0);
  await universal(a.page, w, '5 irregular');
  await done(a);
}
{
  const a = await open({ seed: { events: periods(12, [28, 28]) } });
  const w = await sweep(a.page);
  check('5 only 2 gaps: no chance and no fertile days', noFert(w) && !w.fertAll.length, [w.chance, w.fertAll]);
  check('5 only 2 gaps: Cycles says fertile days need 6 regular gaps', w.text.cycles.indexOf((await t(a.page, 'kn_fert_need')).split('{n}')[0]) >= 0, w.text.cycles.slice(0, 400));
  await universal(a.page, w, '5 few gaps');
  await done(a);
}

/* ---------- 7 logging her period moves the period reminder ---------- */
{
  const a = await open({ seed: { events: steady(22) } });   /* due in 6 days: the period reminder is booked; her period comes early, today */
  const before = (await a.page.evaluate(() => JSON.parse(window.__sched || '[]'))).filter((r) => /^(period|late)-/.test(r.id)).map((r) => r.id);
  await a.page.evaluate((d) => { const s = window.Saathi.state; s.events.push({ d: d, t: 'start' }); window.Saathi.save(); }, TODAY); await settle(a.page, 1500);
  const after = (await a.page.evaluate(() => JSON.parse(window.__sched || '[]'))).filter((r) => /^(period|late)-/.test(r.id)).map((r) => r.id);
  check('7 before: a period reminder for the coming range', before.some((x) => /^period-/.test(x)), before);
  check('7 after logging her period: none of the old reminders left', !before.some((x) => after.indexOf(x) >= 0), [before, after]);
  check('7 after logging her period: the next one is for her new range', after.some((x) => /^period-/.test(x) && x.slice(7) > iso(TODAY, 14)), after);
  await done(a);
}

/* ---------- 8 Hindi at 360 px, the late case ---------- */
{
  const a = await open({ seed: { lang: 'hi', events: steady(44) }, w: 360 });
  const w = await sweep(a.page);
  check('8 Hindi, late by 16 days: no chance, no fertile days, no made-up period', noFert(w) && !w.pred.length, [w.chance, w.fertFut, w.pred]);
  check('8 Hindi: the fertile-days page says why in Hindi', w.text.fertile.indexOf((await t(a.page, 'fe_late')).slice(0, 20)) >= 0 && /[ऀ-ॿ]/.test(w.text.fertile));
  await universal(a.page, w, '8 Hindi late');
  check('8 Hindi at 360 px: no sideways scroll', await a.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await done(a);
}

check('8 no page errors', errsAll.length === 0, errsAll);
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' + failed.length + ' of ' : 'traps: all ') + results.length + ' checks' + (failed.length ? '' : ' passed'));
process.exit(failed.length ? 1 : 0);
