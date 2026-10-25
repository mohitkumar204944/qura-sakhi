// Version 39.11: the diary's day page, sex log, Cycles tab and fertile-days line (MODULE_API section 54; Mohit, 25 Oct). Checks:
//   1 the day page: the day's facts at the top (the same lines as Days), the week strip (Monday to Sunday, a day opens in
//     place, a week at a time, never the future), and the date opening the month;
//   2 flow in one tap on a bleeding day (pads on the day's start, a day detail or its end; again to clear), the heavy-flow
//     warning, "Clots and pain" for the rest; no flow tiles on other days;
//   3 the sex log: two choices, saved on the phone and cleared by a second tap; the emergency pill card only when she isn't
//     trying, without a method, within 3 days; the fertile-day line while trying; hearts on her days only while trying;
//     none of it on a shared phone, in a pregnancy or after menopause; never in the doctor's report;
//   4 the Cycles tab: named Cycles, her cycles first, the charts behind one row, Edit dates (save, a wrong date refused,
//     "This wasn't a period" with Undo);
//   5 the calendar says when fertile days start (fewer than 6 cycles), and nothing new for other reasons;
//   6 Hindi, 360 px, and no page errors.
// Usage: node test/diary.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from './pw.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'diary'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 600)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NOW = '2026-10-23T13:57:00+05:30';   /* a Friday */
const LOCAL = { app: '0.39.11-pilot', platform: 'android' };
const ACCT = { token: 't', id: 't', phone: '+919876543210', name: 'Riya', pincode: '302001', activeOn: '2026-10-23' };
const PERIODS = [['2026-03-06', '2026-03-09'], ['2026-04-04', '2026-04-07'], ['2026-05-05', '2026-05-08'], ['2026-06-04', '2026-06-06'], ['2026-07-04', '2026-07-06'], ['2026-08-05', '2026-08-08'], ['2026-09-01', '2026-09-03'], ['2026-09-30', '2026-10-03']];
const evOf = (n) => { const ev = []; PERIODS.slice(-n).forEach(([a, b]) => ev.push({ d: a, t: 'start' }, { d: b, t: 'end' })); return ev; };
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'ring', 'xp-home', 'day'].map((k) => [k, { st: 'done', d: '2026-10-01' }]));
const seedOf = (n, x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: '2026-03-01' }, situation: {}, goals: ['track'], events: evOf(n),
  daily: { '2026-10-01': ['d_cramps'] }, notes: {}, checkins: {}, tours: TOURS_DONE, fullTour: { st: 'done', d: '2026-10-01' }, whatsNew: '0.37',
  prompts: { setup: 'off', notifyIntro: '2026-10-01', exAsked: '2026-10-01', firstLog: '2026-10-01' }, focus: { tile: 'cycle', goals: ['track'], at: '2026-10-01' }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false }, (x || {}).settings || {}) });
const TTC = { situation: { planning: true }, goals: ['ttc', 'ready'], focus: { tile: 'ttc', goals: ['ready'], at: '2026-10-01' } };

const browser = await chromium.launch();
const allErrs = [];
async function open(seed, o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: 844 }, locale: seed.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript('if (!sessionStorage.getItem("s")) { sessionStorage.setItem("s", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seed)) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  const reqs = []; await ctx.route(/^https?:/, (r) => { reqs.push(r.request().url() + ' ' + (r.request().postData() || '')); return r.abort(); });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => { errs.push(String(e.message).slice(0, 200)); allErrs.push(String(e.message).slice(0, 200)); });
  await page.clock.install({ time: new Date(NOW) });
  await page.goto(PAGE + (o.hash || '#diary'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 900);
  return { ctx, page, errs, reqs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000 }); await page.$eval(sel, (el) => el.click()); await settle(page, 300); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText).catch(() => '');
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const dayOpen = async (page, iso) => { await page.evaluate(() => window.Saathi.closeSheet && window.Saathi.closeSheet()); await settle(page, 200); await go(page, 'diary'); await page.evaluate((x) => { window.Saathi.mem.calMonth = x.slice(0, 8) + '01'; window.Saathi.mem.diaryTab = 'cal'; window.Saathi.render(); }, iso); await settle(page, 300); await tap(page, '[data-day="' + iso + '"]'); };
const sheetTxt = (page) => txt(page, '#sheet-root .sheet');
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1 && (!document.querySelector('#sheet-root .sheet') || document.querySelector('#sheet-root .sheet').scrollWidth <= document.querySelector('#sheet-root .sheet').clientWidth + 1));
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png') });

/* ---------- 1. The day page: facts, the week strip, the month ---------- */
{
  const { ctx, page, errs } = await open(seedOf(8));
  await dayOpen(page, '2026-10-01');
  const facts = await txt(page, '#sheet-root .day-facts');
  check('1 the day\'s facts at the top: day 2 of her period, her fertile window, ovulation and next period (estimates)', facts.split('\n').join('|') === 'Day 2 of your period|Fertile window in 10 days (estimate)|Ovulation in 15 days (estimate)|29 days until your next period (estimate)', facts);
  await shot(page, '1-day');
  const wk = await page.$$eval('#sheet-root .day-wk .wd', (x) => x.map((y) => y.innerText.replace(/\n/g, ' ') + (y.classList.contains('sel') ? '*' : '') + (y.disabled ? '!' : '')));
  check('1 the week strip: Monday to Sunday, her day marked', wk.length === 7 && /^M 28/.test(wk[0]) && /^T 1\*/.test(wk[3]) && /^S 4/.test(wk[6]), wk);
  await tap(page, '#sheet-root [data-wsel="2026-10-02"]');
  check('1 a day in the strip opens in place', /Fri, 2 Oct/.test(await txt(page, '#sheet-root .day-tt')) && /Day 3 of your period/.test(await txt(page, '#sheet-root .day-facts')), await txt(page, '#sheet-root .day-tt'));
  await tap(page, '#sheet-root [data-dweek="7"]');
  check('1 the next-week arrow moves a week', /Fri, 9 Oct/.test(await txt(page, '#sheet-root .day-tt')), await txt(page, '#sheet-root .day-tt'));
  await tap(page, '#sheet-root [data-dweek="7"]'); await tap(page, '#sheet-root [data-dweek="7"]');
  check('1 ... and stops at today, with no future day to open', /Today/.test(await txt(page, '#sheet-root .day-tt')) && await page.$eval('#sheet-root [data-dweek="7"]', (b) => b.disabled) && (await page.$$('#sheet-root .day-wk .wd[data-wsel]')).length === 5, await txt(page, '#sheet-root .day-tt'));
  await tap(page, '#sheet-root [data-dweek="-7"]');
  check('1 the week-before arrow moves back a week', /Fri, 16 Oct/.test(await txt(page, '#sheet-root .day-tt')), await txt(page, '#sheet-root .day-tt'));
  await page.evaluate(() => { window.Saathi.mem.calMonth = '2026-06-01'; }); await tap(page, '#sheet-root #day-month');
  check('1 the date opens its month in Diary', !(await has(page, '#sheet-root .sheet')) && /October 2026/.test(await txt(page, '#view .cal-mo')), await txt(page, '#view .cal-mo'));
  await go(page, 'diary'); await page.evaluate(() => { window.Saathi.mem.diaryTab = 'days'; window.Saathi.render(); }); await settle(page, 300);
  const dl = await page.$eval('#view [data-dy="2026-10-01"]', (e) => e.innerText).catch(() => '');
  check('1 the same facts as the Days tab', /Fertile window in 10 days \(estimate\)/.test(dl) && /Ovulation in 15 days \(estimate\)/.test(dl) && /29 days until your next period/.test(dl), dl);
  await dayOpen(page, '2026-10-10');
  check('1 the day before her fertile window says "tomorrow", not "1 days"', /Fertile window tomorrow \(estimate\)/.test(await txt(page, '#sheet-root .day-facts')) && !/\b1 days\b/.test(await sheetTxt(page)), (await txt(page, '#sheet-root .day-facts')));
  check('1 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 2. Flow in one tap ---------- */
{
  const { ctx, page, errs } = await open(seedOf(8));
  await dayOpen(page, '2026-09-30');
  check('2 a bleeding day: 4 flow tiles by pads in the day, and "Clots and pain"', (await page.$$('#sheet-root [data-pads]')).length === 4 && /Flow: pads in the day/.test(await sheetTxt(page)) && /Clots and pain/.test(await txt(page, '#sheet-root #day-flow')), await sheetTxt(page));
  await tap(page, '#sheet-root [data-pads="pads_2"]');
  let s = await st(page);
  check('2 one tap keeps it on her period\'s start', s.events.find((e) => e.d === '2026-09-30' && e.t === 'start').pads === 'pads_2' && await has(page, '#sheet-root [data-pads="pads_2"].on'));
  await tap(page, '#sheet-root [data-pads="pads_2"]');
  s = await st(page);
  check('2 a second tap clears it', !s.events.find((e) => e.d === '2026-09-30' && e.t === 'start').pads);
  await tap(page, '#sheet-root [data-wsel="2026-10-01"]'); await tap(page, '#sheet-root [data-pads="pads_4"]');
  s = await st(page);
  check('2 another day of her period: a day detail', s.events.some((e) => e.d === '2026-10-01' && e.t === 'start_detail' && e.pads === 'pads_4'), s.events.filter((e) => e.d === '2026-10-01'));
  check('2 soaked every 1–2 hours: the heavy-bleeding warning shows', await has(page, '#sheet-root .day-flowq .card.warn'));
  await tap(page, '#sheet-root [data-pads="pads_4"]');
  s = await st(page);
  check('2 cleared again, the empty day detail goes', !s.events.some((e) => e.d === '2026-10-01' && e.t === 'start_detail'));
  await tap(page, '#sheet-root [data-wsel="2026-10-03"]'); await tap(page, '#sheet-root [data-pads="pads_1"]');
  s = await st(page);
  check('2 her last day keeps it on the period\'s end', s.events.some((e) => e.d === '2026-10-03' && e.t === 'end' && e.pads === 'pads_1'));
  await tap(page, '#sheet-root #day-flow');
  check('2 "Clots and pain" opens the details', /Clots/.test(await txt(page, '#sheet-root')));
  await dayOpen(page, '2026-10-10');
  check('2 no flow tiles on a day that isn\'t a period day', !(await has(page, '#sheet-root [data-pads]')));
  check('2 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 3. The sex log ---------- */
{
  const { ctx, page, errs, reqs } = await open(seedOf(8));
  await dayOpen(page, '2026-10-23');
  check('3 the day page has the sex log: two choices, only on this phone', (await page.$$('#sheet-root [data-sx]')).length === 2 && /Sex/.test(await txt(page, '#sheet-root .sx-sec')) && /Only on this phone/.test(await txt(page, '#sheet-root .sx-sec')) && /Without a method/.test(await txt(page, '#sheet-root .sx-sec')) && /With a method/.test(await txt(page, '#sheet-root .sx-sec')), await txt(page, '#sheet-root .sx-sec'));
  await tap(page, '#sheet-root [data-sx="n"]');
  let s = await st(page);
  check('3 "Without a method" is kept on the phone for that day', s.sex && s.sex['2026-10-23'] === 'n', s.sex);
  const ec = await txt(page, '#sheet-root .sx-ec');
  check('3 not trying: the emergency pill line, within 72 hours, with what to do and where it\'s free', /Don’t want a pregnancy now\?/.test(ec) && /within 72 hours \(3 days\)/.test(ec) && await has(page, '#sheet-root .sx-ec [data-sgo="contra-ec"]') && await has(page, '#sheet-root .sx-ec [data-sgo="contra-free"]'), ec);
  await shot(page, '3-sex-ec');
  await tap(page, '#sheet-root .sx-ec [data-sgo="contra-ec"]');
  check('3 "What to do" opens the emergency pill guide', (await page.evaluate(() => location.hash)) === '#contra-ec');
  await dayOpen(page, '2026-10-23'); await tap(page, '#sheet-root [data-sx="y"]');
  s = await st(page);
  check('3 "With a method": kept, and no emergency pill line', s.sex['2026-10-23'] === 'y' && !(await has(page, '#sheet-root .sx-ec')));
  await tap(page, '#sheet-root [data-sx="y"]');
  s = await st(page);
  check('3 a second tap clears it', !(s.sex || {})['2026-10-23']);
  await tap(page, '#sheet-root [data-wsel="2026-10-19"]'); await tap(page, '#sheet-root [data-sx="n"]');
  check('3 four days ago: no emergency pill line (past 72 hours)', !(await has(page, '#sheet-root .sx-ec')));
  await tap(page, '#sheet-root [data-wsel="2026-10-21"]'); await tap(page, '#sheet-root [data-sx="n"]');
  check('3 two days ago: still within 72 hours', await has(page, '#sheet-root .sx-ec'));
  check('3 not trying: no hearts on her days', !(await has(page, '#sheet-root .day-wk .sx-ht')));
  await page.evaluate(() => window.Saathi.closeSheet()); await settle(page, 200);
  check('3 not trying: no hearts on the calendar', !(await has(page, '#view .cal .sx-ht')));
  await go(page, 'report');
  const rp = await txt(page, '#view');
  check('3 never in the doctor\'s report', /Report|report/.test(rp) && !/Sex|sex|without a method|with a method/i.test(rp), rp.slice(0, 300));
  check('3 nothing left the phone', !reqs.some((r) => /sex|2026-10-2[13]/.test(r)), reqs.slice(0, 3));
  check('3 no page errors', !errs.length, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open(seedOf(8, Object.assign({ sex: { '2026-10-13': 'n' } }, TTC)));
  await dayOpen(page, '2026-10-15'); await tap(page, '#sheet-root [data-sx="n"]');
  const fw = await txt(page, '#sheet-root .sx-fw');
  check('3 trying: on a fertile day, the line from her trying-for-a-baby guide', /On a fertile day \(estimate\)/.test(fw) && /Sex every 2–3 days, all through the cycle, gives the best chance/.test(fw) && !(await has(page, '#sheet-root .sx-ec')), fw);
  check('3 trying: hearts on her days in the week, with a line saying when they show', (await page.$$('#sheet-root .day-wk .sx-ht')).length === 2 && /Hearts show on your days only while you’re trying for a baby/.test(await txt(page, '#sheet-root .sx-sec')));
  await shot(page, '3-sex-ttc');
  await page.evaluate(() => window.Saathi.closeSheet()); await settle(page, 200);
  check('3 trying: hearts on the calendar too, with "Sex" in the legend', (await page.$$('#view .cal .sx-ht')).length === 2 && await has(page, '#view .legend .lk-sx'));
  await tap(page, '[data-day="2026-10-20"]'); await tap(page, '#sheet-root [data-sx="n"]');
  check('3 trying, after her fertile days: no card', !(await has(page, '#sheet-root .sx-fw')) && !(await has(page, '#sheet-root .sx-ec')));
  await page.evaluate(() => { window.Saathi.closeSheet(); window.Saathi.mem.diaryTab = 'days'; window.Saathi.render(); }); await settle(page, 300);
  check('3 trying: the Days tab shows it as a tag', /Sex without a method/.test(await txt(page, '#view [data-dy="2026-10-13"]')), await txt(page, '#view [data-dy="2026-10-13"]'));
  check('3 trying: no page errors', !errs.length, errs);
  await ctx.close();
}
for (const [name, x] of [['a shared phone', { settings: { discreet: true } }], ['a pregnancy', { situation: { pregnant: true, pregnantSince: '2026-09-01' } }], ['after menopause', { situation: { midlife: true, stopped: true, stoppedOn: '2025-09-01' }, dob: '1970-05-01' }]]) {
  const { ctx, page, errs } = await open(seedOf(8, x));
  await dayOpen(page, '2026-10-22');
  check('3 ' + name + ': no sex log on the day page', await has(page, '#sheet-root .sheet') && !(await has(page, '#sheet-root .sx-sec')), await sheetTxt(page));
  if (name === 'a shared phone') check('3 a shared phone: no facts about fertile days on the day page', !/Fertile|Ovulation|fertile/.test(await sheetTxt(page)), await sheetTxt(page));
  check('3 ' + name + ': no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 4. The Cycles tab ---------- */
{
  const { ctx, page, errs } = await open(seedOf(8));
  await page.evaluate(() => { window.Saathi.mem.diaryTab = 'tr'; window.Saathi.render(); }); await settle(page, 400);
  check('4 the tab is called "Cycles"', /Cycles/.test(await txt(page, '#view .dtabs [data-tab="tr"]')) && !/What it shows/.test(await txt(page, '#view .dtabs')), await txt(page, '#view .dtabs'));
  const order = await page.evaluate(() => [...document.querySelectorAll('#diary-body > *')].map((e) => (e.className || e.tagName).split(' ')[0]));
  check('4 her cycles first, then the glance, then one Charts row', order[0] === 'card' && (await page.$eval('#diary-body > *', (e) => e.classList.contains('mc-card'))) && order.indexOf('charts-d') > 1, order);
  check('4 the charts are folded behind the row', !(await page.$eval('#view .charts-d', (d) => d.open)) && await has(page, '#view .charts-d .bars'));
  await page.$eval('#view .charts-d', (d) => { d.open = true; d.dispatchEvent(new Event('toggle')); }); await settle(page, 200);
  await page.evaluate(() => window.Saathi.render()); await settle(page, 300);
  check('4 opened, the charts stay open', await page.$eval('#view .charts-d', (d) => d.open));
  check('4 each cycle has "Edit dates"', (await page.$$('#view .mc-card .mc-row [data-cyedit]')).length >= 4);
  await shot(page, '4-cycles');
  await tap(page, '#view [data-cyedit="2026-09-30"]');
  check('4 Edit dates: her start and end, Save, "This wasn\'t a period"', (await page.$eval('#ed-s', (e) => e.value)) === '2026-09-30' && (await page.$eval('#ed-e', (e) => e.value)) === '2026-10-03' && /This wasn’t a period/.test(await txt(page, '#sheet-root')), await txt(page, '#sheet-root'));
  await page.fill('#ed-e', '2026-09-28'); await tap(page, '#ed-save');
  check('4 an end before the start is refused, nothing changed', !(await page.$eval('#ed-err', (e) => e.hidden)) && (await st(page)).events.some((e) => e.t === 'end' && e.d === '2026-10-03'));
  await page.fill('#ed-s', '2026-09-29'); await page.fill('#ed-e', '2026-10-04'); await tap(page, '#ed-save');
  let s = await st(page);
  check('4 saved: the new start and end', s.events.some((e) => e.t === 'start' && e.d === '2026-09-29') && !s.events.some((e) => e.t === 'start' && e.d === '2026-09-30') && s.events.some((e) => e.t === 'end' && e.d === '2026-10-04') && !s.events.some((e) => e.t === 'end' && e.d === '2026-10-03'), s.events.slice(-4));
  await tap(page, '#view [data-cyedit="2026-09-01"]'); await tap(page, '#ed-del');
  s = await st(page);
  check('4 "This wasn\'t a period" removes its dates', !s.events.some((e) => e.d === '2026-09-01' || e.d === '2026-09-03'), s.events.slice(-6));
  await page.$eval('.toast [data-ta="0"]', (b) => b.click()); await settle(page, 300);
  s = await st(page);
  check('4 ... and Undo brings them back', s.events.some((e) => e.t === 'start' && e.d === '2026-09-01') && s.events.some((e) => e.t === 'end' && e.d === '2026-09-03'));
  await tap(page, '#view .mc-row .mc-open');
  check('4 a cycle\'s date opens its first day', await has(page, '#sheet-root .day-tt'));
  check('4 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 5. When fertile days start ---------- */
{
  const a = await open(seedOf(5));
  const few = await txt(a.page, '#view .fw-few');
  check('5 four cycles: "Fertile days show after 6 cycles. 2 more periods to log."', /Fertile days show after 6 cycles\. 2 more periods to log\./.test(few), few);
  await tap(a.page, '#view #fw-why');
  check('5 "Why?" says why, and that there is no safe day', /Why 6 cycles\?/.test(await txt(a.page, '#sheet-root')) && /There is no safe day/.test(await txt(a.page, '#sheet-root')));
  await shot(a.page, '5-few');
  check('5 no page errors', !a.errs.length, a.errs); await a.ctx.close();
  const b = await open(seedOf(6));
  check('5 one more to go: "1 more period to log."', /1 more period to log\./.test(await txt(b.page, '#view .fw-few')), await txt(b.page, '#view .fw-few'));
  await b.ctx.close();
  const c = await open(seedOf(8));
  check('5 with her fertile days showing, no line', !(await has(c.page, '#view .fw-few')) && await has(c.page, '#view .cal .day.ov'));
  await c.ctx.close();
  for (const [name, x] of [['on hormones', { situation: { hormones: true, hormonesSince: '2026-01-01' } }], ['a shared phone', { settings: { discreet: true } }]]) {
    const d = await open(seedOf(5, x));
    check('5 ' + name + ': no line', !(await has(d.page, '#view .fw-few')));
    await d.ctx.close();
  }
}

/* ---------- 6. Hindi, 360 px ---------- */
{
  const { ctx, page, errs } = await open(seedOf(5, { lang: 'hi' }), { w: 360 });
  check('6 Hindi: the tab is "चक्र" and the line says when fertile days start', /चक्र/.test(await txt(page, '#view .dtabs')) && /फ़र्टाइल दिन 6 चक्र के बाद दिखेंगे/.test(await txt(page, '#view .fw-few')), [await txt(page, '#view .dtabs'), await txt(page, '#view .fw-few')]);
  await dayOpen(page, '2026-10-01');
  const sh = await sheetTxt(page);
  check('6 Hindi day page: flow, the sex log and no untranslated words', /ब्लीडिंग: दिन में कितने pad/.test(sh) && /संबंध/.test(sh) && /बिना गर्भनिरोधक/.test(sh) && /सिर्फ़ इसी फ़ोन पर/.test(sh) && !/\b(sx|fw|ed|dy|day|mc|charts)_[a-z0-9_]+\b/.test(sh), sh.slice(0, 400));
  check('6 360 px: the day page doesn\'t scroll sideways', await noScroll(page));
  await shot(page, '6-hindi-day');
  await page.evaluate(() => { window.Saathi.closeSheet(); window.Saathi.mem.diaryTab = 'tr'; window.Saathi.render(); }); await settle(page, 300);
  check('6 360 px: the Cycles tab doesn\'t scroll sideways, in Hindi', await noScroll(page) && /तारीख़ें बदलें/.test(await txt(page, '#view .mc-card')));
  check('6 no page errors', !errs.length, errs);
  await ctx.close();
}

await browser.close();
const pass = results.filter((r) => r.pass).length;
console.log(pass + '/' + results.length + ' checks passed');
process.exit(pass === results.length && !allErrs.length ? 0 : 1);
