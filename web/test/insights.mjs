// Version 31: her cycle insights (MODULE_API section 33). The maths is pinned in test/maths.mjs, sections 16 to 18; this file
// checks what she sees:
//   - Home: the days to her next period with the likely range, and today's phase and chance (never in discreet mode);
//   - the calendar's predicted period, fertile window and ovulation day, with "there is no safe day";
//   - Trends: the verdict with its badges, the period-length chart and My cycles;
//   - Days: every day she noted, newest first, with where it sat in her cycle;
//   - the fertile-days screen; no fertile days for irregular gaps, on the pill, or in a release APK; a long period;
//   - Hindi, the library article, no page errors, and nothing sent anywhere.
// Usage: node test/insights.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 600)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isoAgo = (d) => { const x = new Date(); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() - d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me'].map((k) => [k, { st: 'done', d: isoAgo(3) }]));
/* the feedback diary: gaps 27, 31, 31, 27, 28, 26, 30, 32, 27, 29; periods of 3 to 5 days; today is day 24 */
const LENS = [27, 31, 31, 27, 28, 26, 30, 32, 27, 29], PLEN = [3, 3, 3, 3, 3, 4, 3, 4, 3, 5, 5];
const startsAgo = (() => { let a = 23; const out = [a]; for (let i = LENS.length - 1; i >= 0; i--) { a += LENS[i]; out.unshift(a); } return out; })();
const feedbackEvents = (plen) => startsAgo.flatMap((a, i) => [{ d: isoAgo(a), t: 'start', pads: i === startsAgo.length - 1 ? 'pads_2' : '' }, { d: isoAgo(a - (plen ? plen[i] : PLEN[i]) + 1), t: 'end' }]);
const seedOf = (extra) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: isoAgo(300), c2: null, c4: null }, situation: { stage: 'cycle', planning: true },
  events: feedbackEvents(), daily: { [isoAgo(0)]: ['d_bloat'], [isoAgo(3)]: ['d_tired'], [isoAgo(23)]: ['d_cramps', 'd_mood'] }, notes: { [isoAgo(3)]: 'Slept badly' }, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: isoAgo(3) }, prompts: { setup: 'off' } }, extra || {}, { settings: Object.assign({ toursAuto: false }, (extra || {}).settings || {}) });
const ANDROID = 'window.SakhiAndroid = { schedule(){}, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){} };';

const browser = await chromium.launch();
const sent = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ api: 'https://api.test.invalid', app: o.app || 'test-0.31-demo', platform: o.android ? 'android' : 'web' }) + ';');
  if (o.android) await ctx.addInitScript(ANDROID);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify({ token: 'test', id: 'test', phone: '+919876543210', name: 'Asha', pincode: '560001', activeOn: isoAgo(0) })) + '); }');
  await ctx.route(/^https?:/, (r) => { sent.push(r.request().url()); r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }); });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await sleep(300);
  return { ctx, page, errs };
}
const go = async (page, h) => { await page.evaluate((x) => { location.hash = x; }, h); await sleep(250); };
const view = (page) => page.$eval('#view', (e) => e.innerText);
const card = (page, sel) => page.$eval(sel, (e) => e.innerText).catch(() => '');
const tab = async (page, k) => { await go(page, 'diary'); await page.$eval('[data-tab="' + k + '"]', (b) => b.click()); await sleep(250); };
const P = (page) => page.evaluate(() => { const S = window.Saathi; const p = S.cycle.predict(); const iso = (d) => (d ? S.toISO(d) : null); return p && { next: iso(p.next), daysTo: p.daysTo, plen: p.plen, ov: p.fert && iso(p.fert.ov), fw: p.fert && [iso(p.fert.fwFrom), iso(p.fert.fwTo)] }; });
/* the calendar month holding a date, with its cells' classes */
const calCells = async (page, isoD) => { await page.evaluate((d) => { const S = window.Saathi; S.mem.calMonth = d.slice(0, 8) + '01'; S.mem.diaryTab = 'cal'; location.hash = 'diary'; S.render(); }, isoD); await sleep(250);
  return page.$$eval('.cal .day[data-day]', (cs) => cs.map((c) => ({ d: c.dataset.day, cls: c.className, aria: c.getAttribute('aria-label') }))); };

/* ---------- 1. Home: the countdown, the likely range, today's phase and chance ---------- */
{
  const { ctx, page, errs } = await open();
  const hero = await card(page, '#view .card.hero');
  check('1 the days until her next period, as one number', /6\s+days until your next period/.test(hero), hero.slice(0, 300));
  check('1 the likely range stays under it, with how many cycles it comes from', /Likely .* · from your last 10 cycles/.test(hero), hero);
  /* Version 32: the NHS says ovulation can come as late as 10 days before the next period, so with a longest recent gap of 32
     days, day 24 is still a possible fertile day: medium, never "low" (field-test audit 2.1) */
  check('1 today: after ovulation, medium chance of pregnancy (NHS: ovulation 10 to 16 days before the next period)', /After ovulation \(luteal phase\) · Medium chance of pregnancy from sex today/.test(hero), hero);
  check('1 never a "low chance" label', !/Low chance/i.test(hero), hero);
  check('1 the hero says the dates are estimates and not a way to avoid pregnancy', /These dates are estimates from your diary\. They are not a way to avoid pregnancy\./.test(hero));
  await page.evaluate(() => { const S = window.Saathi; S.state.settings.discreet = true; S.save(); }); await go(page, 'learn'); await go(page, 'home');
  check('1 discreet mode: no chance of pregnancy on Home', !/chance of pregnancy/i.test(await view(page)) && !(await page.$('#view .chance')));
  check('1 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 2. The calendar: predicted period, fertile window, ovulation ---------- */
{
  const { ctx, page, errs } = await open();
  const p = await P(page);
  const ovMonth = await calCells(page, p.ov);
  const ovCell = ovMonth.find((c) => c.d === p.ov);
  check('2 the ovulation day is marked, and named for a screen reader as an estimate', !!ovCell && /\bov\b/.test(ovCell.cls) && /ovulation, an estimate/.test(ovCell.aria), ovCell);
  const fwDays = []; for (let d = new Date(p.fw[0] + 'T12:00:00'); d <= new Date(p.fw[1] + 'T12:00:00'); d.setDate(d.getDate() + 1)) fwDays.push(d.toISOString().slice(0, 10));
  const fwMarked = (await Promise.all([...new Set(fwDays.map((d) => d.slice(0, 7)))].map((m) => calCells(page, m + '-01')))).flat().filter((c) => /\bfw\b/.test(c.cls) || /\bov\b/.test(c.cls)).map((c) => c.d).filter((d) => fwDays.indexOf(d) >= 0);
  check('2 the 6-day fertile window is marked (5 days, then ovulation)', fwMarked.length === 6, { fwDays, fwMarked });
  const nextMonth = await calCells(page, p.next);
  const pred = nextMonth.filter((c) => /\bpred\b/.test(c.cls)).map((c) => c.d);
  check('2 the predicted period days are marked from the predicted start', pred.length >= 1 && pred[0] === p.next, { pred, next: p.next });
  const legend = await card(page, '#diary-body');
  check('2 the legend names the estimates, and the note says there is no safe day', /Predicted period/.test(legend) && /Fertile window \(estimate\)/.test(legend) && /Ovulation \(estimate\)/.test(legend) && /There is no safe day/.test(legend), legend.slice(-600));
  check('2 the old promise "no fertile days are shown" is gone', !/No fertile or safe days/.test(legend));
  check('2 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 3. Trends: the verdict, the period lengths, My cycles ---------- */
{
  const { ctx, page, errs } = await open();
  await tab(page, 'tr');
  const vd = await card(page, '#view .vd-card');
  check('3 the verdict: 26–32 days, Regular, with the usual range under it', /26–32 days/.test(vd) && /Regular/.test(vd) && /Usual: 21 to 35 days apart, varying by 7 days or less/.test(vd), vd);
  check('3 the verdict: 3–5 days, Normal, with what is usual', /3–5 days/.test(vd) && /Normal/.test(vd) && /Bleeding usually lasts 2 to 7 days\. More than 8 days is longer than usual\./.test(vd), vd);
  check('3 the verdict gives the next period', /Next period: in about 6 days, likely/.test(vd), vd);
  check('3 the period-length chart: a bar for each period with an end, and the 8-day line', (await page.$$('#view .pbars .col')).length === 11 && !!(await page.$('#view .pbars .pline')));
  const rows = await page.$$eval('#view .mc-card .mc-row', (rs) => rs.map((r) => ({ t: r.innerText, p: r.querySelectorAll('.mc-pills i.p').length, f: r.querySelectorAll('.mc-pills i.f').length, o: r.querySelectorAll('.mc-pills i.o').length, n: r.querySelectorAll('.mc-pills i').length })));
  check('3 My cycles: the current cycle first, with its days so far', /– now/.test(rows[0].t) && /5 days period · 24 days so far/.test(rows[0].t) && rows[0].n === 24 && rows[0].p === 5, rows[0]);
  check('3 My cycles: each cycle shows its fertile window and one ovulation day', rows.slice(0, 3).every((r) => r.f === 5 && r.o === 1), rows.slice(0, 3));
  check('3 My cycles: a past cycle shows its own length', /29-day cycle/.test(rows[1].t), rows[1]);
  check('3 My cycles: four rows open, the rest under Show all', rows.length === 11 && (await page.$$('#view .mc-card > .mc-list > .mc-row')).length === 4 && /Show all 11/.test(await card(page, '#view .mc-more summary')), rows.length);
  await page.$eval('#view .mc-row .mc-open', (b) => b.click()); await sleep(250);   /* Version 39.11: the row's date opens it; Edit dates sits beside it */
  check('3 a cycle opens its first day', !!(await page.$('#sheet-root .sheet')));
  check('3 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 4. Days: every day she noted, newest first ---------- */
{
  const notes = {}; for (let i = 30; i < 55; i++) notes[isoAgo(i)] = 'Note ' + i;
  const { ctx, page, errs } = await open({ seed: { notes: Object.assign(notes, { [isoAgo(3)]: 'Slept badly' }) } });
  await tab(page, 'days');
  const cards = await page.$$eval('#view .dy-card', (cs) => cs.map((c) => ({ d: c.dataset.dy, t: c.innerText })));
  check('4 newest first, today on top', cards[0].d === isoAgo(0) && cards[1].d === isoAgo(3), cards.slice(0, 3).map((c) => c.d));
  check('4 today: day 24, medium chance, 6 days to the next period, and what she noted', /Day 24 of your cycle/.test(cards[0].t) && /Medium chance of pregnancy from sex that day \(estimate\)/.test(cards[0].t) && /6 days until your next period \(estimate\)/.test(cards[0].t) && /Bloating/.test(cards[0].t), cards[0].t);
  check('4 a note shows', /Slept badly/.test(cards[1].t), cards[1].t);
  const start = cards.find((c) => c.d === isoAgo(23));
  check('4 the day her period started: day 1 of her period, the window and ovulation ahead, the pads she logged', !!start && /Day 1 of your period/.test(start.t) && /Fertile window in \d+ days \(estimate\)/.test(start.t) && /Ovulation in \d+ days \(estimate\)/.test(start.t) && /Period started/.test(start.t) && /Pads: 3–5/.test(start.t), start);
  check('4 twenty at a time, then Show more', cards.length === 20 && !!(await page.$('#dy-more')));
  await page.$eval('#dy-more', (b) => b.click()); await sleep(250);
  check('4 Show more shows the next twenty', (await page.$$('#view .dy-card')).length === 40);
  await page.$eval('#view .dy-card', (b) => b.click()); await sleep(250);
  check('4 a day opens its day sheet', !!(await page.$('#sheet-root .sheet')));
  await page.evaluate(() => window.Saathi.closeSheet()); await page.evaluate(() => { const S = window.Saathi; S.state.settings.discreet = true; S.save(); S.render(); }); await sleep(250);
  check('4 discreet mode: the cycle day only, no chance or ovulation', !/chance|ovulation|fertile/i.test(await view(page)) && /Day 24 of your cycle/.test(await view(page)));
  check('4 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 5. When fertile days and the countdown don't show ---------- */
{
  const irr = [['2026-02-28'], ['2026-03-31'], ['2026-05-16'], ['2026-07-17'], ['2026-08-21'], ['2026-09-30']];
  const ago = (iso) => Math.round((new Date(isoAgo(0) + 'T12:00:00') - new Date(iso + 'T12:00:00')) / 86400000);
  const shift = ago('2026-10-23');   /* keep the irregular diary's shape relative to today */
  const events = irr.map((x) => ({ d: isoAgo(ago(x[0]) - shift), t: 'start' }));
  const { ctx, page, errs } = await open({ seed: { dob: '1999-04-12', events: events, situation: { stage: 'cycle', pcos: true } } });
  check('5 irregular gaps: no countdown and no chance on Home', !(await page.$('#view .cd-n')) && !(await page.$('#view .chance')));
  await tab(page, 'tr');
  const vd = await card(page, '#view .vd-card');
  /* Version 39.1: the signal cards themselves sit above the verdict in What it shows, each with "What this means" */
  check('5 irregular gaps: the verdict says Irregular (or outside the usual), with the gap\'s card above it', /Irregular|Outside the usual/.test(vd) && !!(await page.$('#view .xp-diary .xp-dcard [data-go="explain"]')), vd);
  check('5 irregular gaps: no fertile marks in My cycles', (await page.$$('#view .mc-pills i.f, #view .mc-pills i.o')).length === 0);
  check('5 no page errors', !errs.length, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ seed: { mods: { contra: { method: 'pill', since: isoAgo(400), remOn: true } } } });
  check('5 on the pill: the countdown shows, but no chance of pregnancy', /days until your next period/.test(await card(page, '#view .card.hero')) && !(await page.$('#view .chance')));
  const cells = await calCells(page, isoAgo(0));
  check('5 on the pill: no fertile window or ovulation on the calendar', !cells.some((c) => /\b(fw|ov)\b/.test(c.cls)));
  await go(page, 'fertile');
  check('5 on the pill: the fertile-days screen says why it is hidden', /Hidden for now/.test(await view(page)) && /6 logged gaps/.test(await view(page)));
  check('5 no page errors', !errs.length, errs);
  await ctx.close();
}
{
  const { ctx, page, errs } = await open({ android: true, app: 'test-0.31' });
  check('5 a release APK: no chance of pregnancy on Home', !(await page.$('#view .chance')) && /days until your next period/.test(await card(page, '#view .card.hero')));
  const cells = await calCells(page, isoAgo(0));
  check('5 a release APK: no fertile marks on the calendar', !cells.some((c) => /\b(fw|ov)\b/.test(c.cls)));
  await go(page, 'fertile');
  check('5 a release APK: fertile days are switched off until they are approved', /switched off in this version of Sakhi until doctors and the regulator approve them/.test(await view(page)));
  check('5 no page errors', !errs.length, errs);
  await ctx.close();
}
{
  const plen = PLEN.slice(); plen[9] = 10;
  const { ctx, page, errs } = await open({ seed: { events: feedbackEvents(plen) } });
  await tab(page, 'tr');
  const vd = await card(page, '#view .vd-card');
  check('5 a 10-day period: Longer than usual, with when to see a doctor', /Longer than usual/.test(vd) && /Bleeding more than 8 days, or soaking a pad every 1–2 hours: see a doctor this week/.test(vd), vd);
  check('5 the 10-day bar is marked long', (await page.$$('#view .pbars .col.long')).length === 1);
  check('5 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 6. The fertile-days screen ---------- */
{
  const { ctx, page, errs } = await open({ hash: '#fertile' });
  const p = await P(page);
  const v = await view(page);
  const fmt = (iso) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(iso + 'T12:00:00'));
  check('6 it shows the estimated ovulation day, the highest-chance days and the possible days', v.indexOf(fmt(p.ov)) >= 0 && /Highest chance/.test(v) && /Possible fertile days/.test(v), v.slice(0, 700));
  check('6 it says there is no safe day', /There is no safe day/.test(v));
  check('6 no page errors', !errs.length, errs);
  await ctx.close();
}

/* ---------- 7. Hindi, and the library article ---------- */
{
  const { ctx, page, errs } = await open({ lang: 'hi', seed: { lang: 'hi' } });
  check('7 Hindi: the countdown and today\'s chance', /दिन में अगला पीरियड/.test(await card(page, '#view .card.hero')) && /आज संबंध बनाने पर गर्भ ठहरने की संभावना मध्यम/.test(await card(page, '#view .card.hero')));
  await tab(page, 'tr');
  check('7 Hindi: the verdict and My cycles', /आपका चक्र एक नज़र में/.test(await view(page)) && /नियमित/.test(await view(page)) && /मेरे चक्र/.test(await view(page)));
  await tab(page, 'days');
  check('7 Hindi: the Days tab', /चक्र का दिन 24/.test(await view(page)) && (await page.$eval('[data-tab="days"]', (b) => b.innerText)) === 'दिन');
  await go(page, 'a-conceive.why-no-app-can-name-your-fertile-day');
  check('7 the library article no longer says Sakhi never names fertile days', /सिर्फ़ आपकी तारीख़ों से अंदाज़े के रूप में/.test(await view(page)) && !/दो चीज़ें यह ऐप कभी नहीं करेगा/.test(await view(page)));
  check('7 no page errors', !errs.length, errs);
  await ctx.close();
}

check('nothing was sent anywhere but the daily last-active call', sent.every((u) => /\/v1\/me\/active$/.test(u)), sent);
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(failed.length ? 'INSIGHTS FAIL ' + (results.length - failed.length) + '/' + results.length : 'INSIGHTS OK ' + results.length + '/' + results.length);
process.exit(failed.length ? 1 : 0);
