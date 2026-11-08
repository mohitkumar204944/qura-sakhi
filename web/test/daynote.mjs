// Versions 39.17 and 39.18: the Diary at its best (Mohit, 26 Oct: "proceed with your recommendation"; docs/diary-audit-2026-10-26.md,
// R1 to R10; MODULE_API sections 60 and 61). This file checks:
//   1 a short day page: how she felt (the 5), her period, sex and her note; the other signs under "More signs", which opens by
//     itself when one of them is chosen that day; no sign twice; every sign open in a pregnancy (its danger signs among them);
//   2 "Feeling okay": one tap for a good day, first everywhere; her first log saves it; never in the doctor's report; "What
//     repeats" counts the periods she felt fine in; her periods stopped: hot flushes in place of cramps;
//   3 one quick set: Home, the Diary's Today strip, the day page, her first log and the period sheet; the + menu's one "How I feel";
//   4 today on the Diary's first screen: her cycle day and next period, the 5, the notes meter (moved from Cycles, with "Why?");
//   5 the note says what it counted towards: "Noted · N of 27 days this month", and "What repeats for you is ready";
//   6 Cycles in the order of her questions, the report for her doctor up; the monthly signs named by what they ask, only where
//     they fit;
//   7 Days grouped by period: "Day 9" and her notes, no estimates, "N days before the next period" only in the 8 days before;
//   8 her stage: a pregnancy's week instead of period words; after a birth, "Bleeding after the birth" opens the recovery check;
//   9 speakers on the day page and the Today strip; Hindi at 360 px; a shared phone; no page errors.
// Usage: node test/daynote.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'daynote'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-27';   /* a Tuesday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (day, hm) => new Date(new Date(TODAY + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ANDROID = 'window.__sched = []; window.__shared = null; window.SakhiAndroid = { schedule(j){ try { window.__sched = JSON.parse(j); } catch (e) {} return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, share(t, x){ window.__shared = [t, x]; return true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.18-pilot', platform: 'android' };
/* periods every 28 days, the last one `last` days ago, `n` of them, 5 days each */
const regular = (last, n) => { const out = []; for (let k = (n || 3) - 1; k >= 0; k--) { const x = last + 28 * k; out.push({ d: ago(x), t: 'start', pain: 'pain_1' }, { d: ago(x - 5), t: 'end' }); } return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3), firstLog: ago(30) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 360, height: o.h || 780 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(Object.assign({}, LOCAL, o.config || {})) + ';');
  await ctx.addInitScript(ANDROID);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: o.now || at(0, '20:30') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const view = (page) => page.$eval('#view', (e) => e.innerText);
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000 }); await page.$eval(sel, (el) => el.click()); await settle(page, 300); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText).catch(() => '');
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const errsAll = [];
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const tab = async (page, k) => { await go(page, 'diary'); await page.evaluate((x) => { window.Saathi.mem.diaryTab = x; window.Saathi.render(); }, k); await settle(page, 300); };
const day = async (page, d, focus) => { await page.evaluate((a) => window.Saathi.openDay(a[0], a[1]), [d, focus || null]); await settle(page, 300); };
const closeDay = async (page) => { await page.evaluate(() => window.Saathi.closeSheet()); await settle(page, 200); };
/* the day page's choices: her period, sex, how she felt and the signs */
const choices = (page) => page.$$eval('#sheet-root .sheet [data-sym], #sheet-root .sheet [data-pev], #sheet-root .sheet [data-sx], #sheet-root .sheet [data-sgo]', (b) => b.map((x) => x.dataset.sym || x.dataset.pev || x.dataset.sx || x.dataset.sgo));
const sheetH = (page) => page.$eval('#sheet-root .sheet', (s) => s.scrollHeight).catch(() => 0);
const toastT = async (page) => (await txt(page, '#toast-root .toast > span')) || txt(page, '#toast-root .toast');   /* its words, without its buttons */
const FIVE = ['d_ok', 'd_tired', 'd_cramps', 'd_mood', 'd_bloat'];
const daily = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state.daily)));
/* notes around each period: the day before and the first day */
const around = (starts, keys) => { const o = {}; starts.forEach((s) => { o[ago(s + 1)] = keys.slice(); o[ago(s)] = keys.slice(); }); return o; };

/* ---------- 1 a short day page ---------- */
{
  const a = await open({ hash: '#diary', seed: { daily: around([66, 38], ['d_cramps']) } });
  await day(a.page, TODAY);
  const ch = await choices(a.page); const h = await sheetH(a.page);
  check('1 today\'s day page: 10 choices (the 5, her period, sex), no sign twice', ch.length === 10 && new Set(ch).size === ch.length && FIVE.every((k) => ch.indexOf(k) >= 0), ch);
  check('1 ... the 5 first, under "How do you feel today?", and "More signs"', /How do you feel today\?/.test(await txt(a.page, '#sheet-root .feel-sec')) && /More signs/.test(await txt(a.page, '#day-more')) && ch.slice(0, 5).join() === FIVE.join(), ch);
  check('1 ... and shorter than the 2,128 px it was (about 1.5 screens at 360 x 780)', h > 0 && h <= 1300, h);
  check('1 ... the other signs are folded away', !(await has(a.page, '#sheet-root [data-sym="d_headache"]')) && !(await has(a.page, '#day-more-sec')));
  await shot(a.page, '1-day-short');
  await tap(a.page, '#day-more');
  const ch2 = await choices(a.page);
  check('1 "More signs" opens the other signs, with none of the 5 again', ch2.indexOf('d_headache') >= 0 && ch2.indexOf('d_calm') >= 0 && new Set(ch2).size === ch2.length && /Fewer signs/.test(await txt(a.page, '#day-more')), ch2);
  await tap(a.page, '#sheet-root [data-sym="d_headache"]');
  check('1 ... a sign chosen there keeps them open (no Fewer button to hide her answer)', await has(a.page, '#day-more-sec [data-sym="d_headache"].on') && !(await has(a.page, '#day-more')));
  await closeDay(a.page);
  await day(a.page, TODAY);
  check('1 ... and they open by themselves on a day that has one', await has(a.page, '#day-more-sec [data-sym="d_headache"].on'));
  await closeDay(a.page);
  await day(a.page, ago(2));
  check('1 a past day asks "How did you feel?", short too', /How did you feel\?/.test(await txt(a.page, '#sheet-root .feel-sec')) && !(await has(a.page, '#day-more-sec')));
  await closeDay(a.page);
  await a.page.evaluate((d) => { delete window.Saathi.state.daily[d]; }, TODAY);
  await go(a.page, 'home');
  await tap(a.page, '#view #feel-more');
  check('1 Home\'s "More" opens today with the other signs open', await has(a.page, '#sheet-root #day-more-sec [data-sym="d_headache"]'));
  await done(a);
}
{
  const a = await open({ hash: '#diary', seed: { situation: { pregnant: true, pregnantSince: ago(150) }, events: [] } });
  await day(a.page, TODAY);
  const ch = await choices(a.page);
  check('1 in a pregnancy every sign stays open, bleeding among them, and no "More signs"', ch.indexOf('d_pbleed') >= 0 && !(await has(a.page, '#day-more')) && !(await has(a.page, '#sheet-root .feel-sec')), ch);
  await done(a);
}

/* ---------- 2 "Feeling okay" ---------- */
{
  const a = await open({ hash: '#home' });
  const hk = await a.page.$$eval('#view .feel-card [data-feel]', (b) => b.map((x) => x.dataset.feel));
  check('2 Home: "Feeling okay" first of the 5', hk.join() === FIVE.join(), hk);
  await tap(a.page, '#view .feel-card [data-feel="d_ok"]');
  check('2 one tap saves a good day', ((await daily(a.page))[TODAY] || []).join() === 'd_ok');
  check('2 ... and the note says what it counted towards', /Noted · 3 of 27 days this month/.test(await toastT(a.page)), await toastT(a.page));
  await go(a.page, 'report');
  check('2 "Feeling okay" is never in the doctor\'s report', !/Feeling okay/.test(await view(a.page)));
  await done(a);
}
{
  /* 5 periods: cramps around 3 of them, "Feeling okay" around the other 2 */
  const d0 = Object.assign(around([122, 94, 10], ['d_cramps']), around([66, 38], ['d_ok']));
  const a = await open({ hash: '#diary', seed: { events: regular(10, 5), daily: d0 } });
  await tab(a.page, 'tr');
  const pc = await txt(a.page, '#diary-body .pat-card');
  check('2 "What repeats" counts the periods she felt fine in: 3 of 5, not 3 of 3', /Cramps/.test(pc) && /in 3 of the 5 periods with notes/.test(pc), pc);
  await done(a);
}
{
  const a = await open({ hash: '#diary', seed: { focus: { tile: 'cycle', goals: [], at: ago(1) }, prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3) } } });
  const fk = await a.page.$$eval('#fl-card [data-fl-sign]', (b) => b.map((x) => x.dataset.flSign));
  check('2 her first log: the same 5, "Feeling okay" in place of "Nothing"', fk.join() === FIVE.join() && !/Nothing/.test(await txt(a.page, '#fl-card')), fk);
  check('2 ... and no Today strip above her first log', !(await has(a.page, '#diary-body .cal-today')));
  await tap(a.page, '#fl-card [data-fl-sign="d_ok"]'); await tap(a.page, '#fl-save');
  check('2 ... a good day saves', ((await daily(a.page))[TODAY] || []).indexOf('d_ok') >= 0);
  await done(a);
}
{
  const a = await open({ hash: '#home', seed: { dob: '1972-01-01', situation: { stopped: true, stoppedOn: ago(400), midlife: true }, events: [] } });
  const hk = await a.page.$$eval('#view .feel-card [data-feel]', (b) => b.map((x) => x.dataset.feel));
  check('2 her periods stopped: hot flushes in place of cramps', hk.join() === 'd_ok,d_tired,d_hotflush,d_mood,d_bloat', hk);
  await day(a.page, TODAY);
  const ch = await choices(a.page);
  check('2 ... the same on her day page', ch.slice(0, 5).join() === 'd_ok,d_tired,d_hotflush,d_mood,d_bloat' && new Set(ch).size === ch.length, ch);
  await done(a);
}

/* ---------- 3 one quick set ---------- */
{
  const a = await open({ hash: '#diary' });
  await tab(a.page, 'cal');
  const sk = await a.page.$$eval('#diary-body .cal-today [data-feel]', (b) => b.map((x) => x.dataset.feel));
  await a.page.evaluate((d) => window.Saathi.openLog('start', d), ago(10)); await settle(a.page, 300);
  const lk = await a.page.$$eval('#sheet-root [data-daily]', (b) => b.map((x) => x.dataset.daily));
  await a.page.evaluate(() => { document.getElementById('sheet-root').innerHTML = ''; });
  check('3 the Diary\'s strip and the period sheet ask the same 5 as Home', sk.join() === FIVE.join() && lk.join() === FIVE.join(), { sk, lk });
  await tab(a.page, 'tr');   /* Version 39.87 (the audit's D5): on the Diary's Calendar the + waits while her log tiles show, so the + menu opens from the Cycles tab */
  await tap(a.page, '#fab');
  const fab = await a.page.$$eval('.fab-it .fl', (b) => b.map((x) => x.innerText.trim()));
  check('3 the + menu: one "How I feel" for Symptoms and Mood (4 doors)', fab.length === 4 && fab.indexOf('How I feel') >= 0 && fab.indexOf('Symptoms') < 0 && fab.indexOf('Mood') < 0, fab);
  await a.page.$$eval('.fab-it', (b) => { const x = b.find((e) => /How I feel/.test(e.innerText)); if (x) x.click(); }); await settle(a.page, 400);
  check('3 ... it opens today at how she feels', await has(a.page, '#sheet-root .feel-sec'));
  await done(a);
}

/* ---------- 4 today on the Diary's first screen ---------- */
{
  const a = await open({ hash: '#diary' });
  await tab(a.page, 'cal');
  const first = await a.page.$eval('#diary-body', (b) => (b.firstElementChild || {}).className || '');
  const st = await txt(a.page, '#diary-body .cal-today');
  check('4 the Calendar opens on today: her cycle day and next period and the 5, with no notes meter (Version 39.68)', /cal-today/.test(first) && /Day 11 of your cycle/.test(st) && /until your next period/.test(st) && !/Noted on \d+ of/.test(st), { first, st });
  check('4 ... the Calendar\'s own line says when her fertile days show (Version 39.68: the meter is gone)', await has(a.page, '#diary-body .fw-few'), st);
  await tap(a.page, '#diary-body #fw-why');   /* Version 39.68: in the Calendar's own line */
  check('4 ... with its "Why?"', /Why 6 cycles\?/.test(await txt(a.page, '#sheet-root')));
  await a.page.evaluate(() => window.Saathi.closeSheet()); await settle(a.page, 200);
  await tap(a.page, '#diary-body .cal-today [data-feel="d_tired"]');
  check('4 one tap in the strip notes today', ((await daily(a.page))[TODAY] || []).indexOf('d_tired') >= 0 && await has(a.page, '#diary-body .cal-today [data-feel="d_tired"].on'));
  await tab(a.page, 'tr');
  check('4 Cycles no longer carries the meter', !(await has(a.page, '#diary-body .meter')));
  await done(a);
}
{
  const a = await open({ hash: '#diary', seed: { settings: { discreet: true } } });
  await tab(a.page, 'cal');
  check('4 a shared phone: no Today strip', !(await has(a.page, '#diary-body .cal-today')) && !(await has(a.page, '#diary-body .meter')));
  await done(a);
}

/* ---------- 5 the note says what it counted towards ---------- */
{
  /* notes around her first 2 periods; the third one's note makes 3 */
  const a = await open({ hash: '#diary', seed: { daily: around([66, 38], ['d_cramps']) } });
  await day(a.page, ago(3));
  await tap(a.page, '#sheet-root [data-sym="d_tired"]');
  check('5 a past day\'s note: "Noted"', (await toastT(a.page)).trim() === 'Noted', await toastT(a.page));
  await closeDay(a.page);
  await day(a.page, ago(10));
  await tap(a.page, '#sheet-root [data-sym="d_cramps"]');
  const tt = await toastT(a.page);
  check('5 the note that completes her third period with notes: "What repeats for you is ready"', /What repeats for you is ready/.test(tt), tt);
  await tap(a.page, '#toast-root [data-ta="0"]');
  check('5 ... "See it" opens it on Cycles', await has(a.page, '#diary-body .pat-card') && /What repeats for you/.test(await txt(a.page, '#diary-body .pat-card')));
  await done(a);
}

/* ---------- 6 Cycles in the order of her questions, and the monthly signs where they fit ---------- */
{
  const a = await open({ hash: '#diary', seed: { daily: around([66, 38, 10], ['d_cramps']) } });
  await tab(a.page, 'tr');
  const order = await a.page.$$eval('#diary-body > *', (els) => els.map((e) => e.className.split(' ').filter((c) => ['pat-card', 'mc-card', 'vd-card', 'rp-btn', 'charts-d', 'wis-records'].indexOf(c) >= 0)[0]).filter(Boolean));
  check('6 Cycles: what repeats, her cycles, is it usual, the report for her doctor, then the charts', order.slice(0, 5).join() === 'pat-card,mc-card,vd-card,rp-btn,charts-d', order);
  check('6 a woman with regular periods and no PMOS: no monthly signs (her daily note covers mood and flow)', !(await has(a.page, '#diary-body .wis-ci')));
  await shot(a.page, '6-cycles');
  await done(a);
}
for (const [label, seed, re] of [
  ['PMOS', { situation: { pcos: true } }, /Skin and hair signs, once a month/],
  ['irregular periods', { goals: ['track', 'irregular'] }, /Skin and hair signs, once a month/],
  ['47 and her periods changing', { dob: '1979-03-01', situation: { midlife: true } }, /Midlife signs, once a month/],
  ['pregnancy', { situation: { pregnant: true, pregnantSince: ago(150) }, events: [] }, /Pregnancy signs, once a month/]]) {
  const a = await open({ hash: '#diary', seed: seed });
  await tab(a.page, 'tr');
  const w = await txt(a.page, '#diary-body .wis-ci');
  check('6 the monthly signs named by what they ask: ' + label, re.test(w), w);
  await done(a);
}

/* ---------- 7 Days grouped by period ---------- */
{
  const a = await open({ hash: '#diary', seed: { daily: { [ago(12)]: ['d_cramps'], [ago(25)]: ['d_tired'], [ago(3)]: ['d_ok'] } } });
  await tab(a.page, 'days');
  const heads = await a.page.$$eval('#diary-body .dy-gh', (h) => h.map((x) => x.innerText.trim()));
  check('7 Days by period: this cycle first, then each past one with its length', /^Period from 17 Oct · this cycle$/.test(heads[0] || '') && /^Period from 19 Sept? · 28-day cycle$/.test(heads[1] || ''), heads);
  const c12 = await txt(a.page, '#diary-body [data-dy="' + ago(12) + '"]'); const c25 = await txt(a.page, '#diary-body [data-dy="' + ago(25) + '"]');
  check('7 a day as "Day N" and what she noted; "2 days before the next period" only near a period', /Day 27/.test(c12) && /2 days before the next period/.test(c12) && /Day 14/.test(c25) && !/before the next period/.test(c25) && /Tired/.test(c25), { c12, c25 });
  const all = await txt(a.page, '#diary-body');
  check('7 ... and no estimates (the day page keeps them)', !/estimate/i.test(all) && !/Fertile days are an estimate/.test(all), all.slice(0, 400));
  await shot(a.page, '7-days');
  await done(a);
}

/* ---------- 8 her stage ---------- */
{
  const a = await open({ hash: '#diary', seed: { situation: { pregnant: true, pregnantSince: ago(150) }, events: [] } });
  await tab(a.page, 'cal');
  const v = await txt(a.page, '#diary-body');
  check('8 a pregnancy: her week on the Diary, with This week', /Week 21 of your pregnancy/.test(v) && await has(a.page, '#diary-body .cal-pw [data-go="preg-week"]'), v.slice(0, 200));
  check('8 ... and no period words: no likely range, no contraception line, no strip', !/Likely range/.test(v) && !/avoid pregnancy/.test(v) && !(await has(a.page, '#diary-body .cal-today')), v);
  await shot(a.page, '8-preg');
  await done(a);
}
{
  const a = await open({ hash: '#diary', seed: { situation: { deliveredOn: ago(28), breastfeeding: true }, events: [] } });
  await tab(a.page, 'cal');
  check('8 four weeks after a birth: no "Likely range" in the key', !/Likely range/.test(await txt(a.page, '#diary-body')));
  await day(a.page, TODAY);
  const ch = await choices(a.page);
  check('8 ... her day page offers "Bleeding after the birth", never "Period started"', ch.indexOf('post-recovery') >= 0 && ch.indexOf('start') < 0 && /Bleeding after the birth/.test(await txt(a.page, '#sheet-root .pp-bleed')), ch);
  await tap(a.page, '#sheet-root [data-sgo="post-recovery"]');
  check('8 ... which opens her recovery check, with its warning signs', await a.page.evaluate(() => location.hash) === '#post-recovery' && !(await has(a.page, '#sheet-root .sheet')));
  await done(a);
}
{
  const a = await open({ hash: '#diary', seed: { situation: { deliveredOn: ago(56) }, events: [] } });
  await day(a.page, TODAY);
  check('8 eight weeks after a birth: "Period started" is back', (await choices(a.page)).indexOf('start') >= 0 && !(await has(a.page, '#sheet-root .pp-bleed')));
  await done(a);
}
{
  const a = await open({ hash: '#diary', seed: { situation: { deliveredOn: ago(28) }, events: [], settings: { discreet: true } } });
  await day(a.page, TODAY);
  check('8 a shared phone after a birth: neither "Period started" nor the birth words', !(await has(a.page, '#sheet-root .pp-bleed')) && (await choices(a.page)).indexOf('start') < 0);
  await done(a);
}

/* ---------- 9 speakers, Hindi at 360 px, a shared phone ---------- */
{
  const a = await open({ hash: '#diary' });
  await tab(a.page, 'cal');
  check('9 the Today strip reads aloud', await has(a.page, '#diary-body .cal-today > .say-b'));
  await day(a.page, TODAY);
  check('9 the day page: the day\'s facts and how she felt each have a speaker', await has(a.page, '#sheet-root .day-facts > .say-b') && await has(a.page, '#sheet-root .feel-sec > .say-b'));
  await done(a);
}
{
  const a = await open({ hash: '#diary', lang: 'hi', seed: { lang: 'hi', daily: around([66, 38, 10], ['d_cramps']) } });
  for (const k of ['cal', 'tr', 'days']) { await tab(a.page, k); check('9 Hindi at 360 px: ' + k + ' fits', await noScroll(a.page)); }
  await tab(a.page, 'cal');
  check('9 Hindi: the strip in Hindi', /आज आप कैसा महसूस कर रही हैं\?/.test(await txt(a.page, '#diary-body .cal-today')) && /ठीक हूँ/.test(await txt(a.page, '#diary-body .cal-today')));
  await day(a.page, TODAY);
  check('9 Hindi: the day page fits, with "और लक्षण"', await noScroll(a.page) && /और लक्षण/.test(await txt(a.page, '#day-more')));
  await shot(a.page, '9-hindi-day');
  await done(a);
}
{
  const a = await open({ hash: '#diary', seed: { settings: { discreet: true } } });
  await day(a.page, TODAY);
  const ch = await choices(a.page);
  check('9 a shared phone: the day page is short too, with no sex log', FIVE.every((k) => ch.indexOf(k) >= 0) && ch.indexOf('n') < 0 && await has(a.page, '#day-more'), ch);
  await done(a);
}
check('9 no page errors', errsAll.length === 0, errsAll.slice(0, 5));

await browser.close();
const passed = results.filter((r) => r.pass).length;
console.log(passed + '/' + results.length + ' checks passed');
process.exit(passed === results.length ? 0 : 1);
