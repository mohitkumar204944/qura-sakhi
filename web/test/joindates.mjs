// Version 39.26: her last periods at joining (Mohit, 27 Oct: "last three months cycle date collection should be part of
// onboarding so patient has some symptomatic diagnosis and plan advise from start", then "yes make a mockup first" and "go
// ahead and build it"; the mockup: claude.ai/artifact/MfYod5pV8wKtuDERCBjbWB; MODULE_API section 69). This file checks:
//   1 the Details step: the pill question first, a calendar where she taps the day each period started (real dates, a year
//     back at most), the count and her gaps, ✕ to take one off, "How many days does it usually last?", two ticks (heavy,
//     pain that stops her day), the PMOS question; Continue asks for a date first;
//   2 what joining saves: real starts, ends once a period is over, the ticks on her latest period, the usual gap from her
//     dates; "Your Sakhi" opens with "What your dates show": her next period, What your diary shows' own cards (a Qura
//     doctor first, a free plan beside it, Start opens that plan) and "An early read ... Not a diagnosis";
//   3 regular dates: the date from day one, "Your gaps are in the usual range", fertile days after 6 gaps; no doctor card;
//   4 "I don't remember the dates": Version 39.10's quick choices, saved as a guess, and no read;
//   5 on the pill: "Since when have you taken it?" in place of dates; Me shows no exact "since" date; switching it off asks
//     "When did you stop?" (today waits for her next period, earlier counts the periods since, never removes it);
//   6 Hindi at 360 px, and no page errors.
// Usage: node test/joindates.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from './join.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'joindates'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/* the app's today, in India (joining runs on the real clock, like joining.mjs) */
const TODAY = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const LOCAL = { app: '0.39.26-pilot', platform: 'android' };
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  if (o.seed) await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(o.seed)) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.abort());
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.goto(PAGE + '#' + (o.hash || 'home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi);
  return { ctx, page, errs };
}
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 8000 }); await page.$eval(sel, (el) => el.click()); await sleep(200); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const view = (page) => txt(page, '#view');
const hashOf = (page) => page.evaluate(() => location.hash.slice(1));
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await sleep(400); };
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const KEYS = /\b(jd|ys|stop|kn|why)_[a-z0-9_]+\b/;   /* a string key on screen is a missing translation */
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
/* a day on the joining calendar: back or forward a month at a time until it shows, then tap it */
async function tapDay(page, d) {
  for (let i = 0; i < 26 && !(await has(page, '[data-jd-day="' + d + '"]')); i++) { const first = await page.$eval('[data-jd-day]', (b) => b.dataset.jdDay); await tap(page, d < first ? '#jd-prev' : '#jd-next'); }
  await tap(page, '[data-jd-day="' + d + '"]');
}
async function signUp(page) {
  await page.waitForSelector('#su-num'); await page.fill('#su-num', '9876543210'); await tap(page, '#su-send');
  await page.waitForSelector('#su-code'); await page.fill('#su-code', '123456');
  await page.waitForSelector('#su-done, #ys-tour, .card.hero', { timeout: 8000 });
  if (await has(page, '#su-done')) { await page.fill('#su-pin', '302001'); await tap(page, '#su-done'); }
  await sleep(700);
}
const finish = async (page) => { await tap(page, '#ob-next'); await tap(page, '#ob-care-go'); await tap(page, '[data-ob-sh="me"]'); await signUp(page); };

/* ---------- 1 and 2: the Details step, and what her dates show ---------- */
const LONG = [ago(80), ago(39), ago(1)];   /* gaps of 41 and 38 days; her latest period began yesterday */
{
  const a = await open();
  await join(a.page, { name: 'Asha', tile: 'pmos', goals: ['irregular'], stop: 'details' });
  const v0 = await view(a.page);
  check('1 the step is "Your last 3 periods", with why Sakhi asks', /Your last 3 periods/.test(v0) && /Tap the day each period started/.test(v0) && /Why we ask: Sakhi reads your gaps from these dates/.test(v0), v0.slice(0, 300));
  const order = await a.page.evaluate(() => { const p = document.querySelector('#ob-pill'), c = document.querySelector('.jd-card'); return !!(p && c && (p.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING)); });
  check('1 the pill question comes first, then the calendar', order);
  check('1 the calendar opens on this month, today marked, nothing after today to tap', await has(a.page, '.jd-cal [data-jd-day="' + TODAY + '"].today') && await a.page.$$eval('.jd-cal [data-jd-day]', (x) => { const t0 = window.Saathi.toISO(window.Saathi.today()); return x.filter((b) => b.dataset.jdDay > t0).every((b) => b.disabled); }));
  check('1 with no dates yet: how far apart they usually are, and the PMOS question', await has(a.page, '[data-ob-gap="n"]') && await has(a.page, '[data-ob-dx="ns"]'));
  await tap(a.page, '#ob-next');
  check('1 Continue asks for a date first', !(await a.page.$eval('#ob-lp-err', (e) => e.hidden)) && /Tap the day your last period started/.test(await txt(a.page, '#ob-lp-err')) && await has(a.page, '.jd-card'));
  for (const d of LONG) await tapDay(a.page, d);
  check('1 three periods marked, with her gaps', /3 periods marked · gaps of 41 and 38 days/.test(await txt(a.page, '.jd-gl')) && (await a.page.$$('.jd-mk')).length === 3, await txt(a.page, '.jd-gl'));
  check('1 with 2 or more dates, "How far apart" goes', !(await has(a.page, '[data-ob-gap="n"]')));
  await tap(a.page, '[data-jd-x="' + LONG[1] + '"]');
  check('1 ✕ takes one off', (await a.page.$$('.jd-mk')).length === 2 && /a gap of 79 days/.test(await txt(a.page, '.jd-gl')), await txt(a.page, '.jd-gl'));
  await tapDay(a.page, LONG[1]);
  await tapDay(a.page, ago(3));
  check('1 a day within 9 days of a start moves that start', await a.page.evaluate((x) => (window.Saathi.mem.ob.dates || []).join(), null) === [LONG[0], LONG[1], ago(3)].join(), await a.page.evaluate(() => window.Saathi.mem.ob.dates));
  await tapDay(a.page, ago(1));
  await tap(a.page, '#jd-plus');
  check('1 "How many days does it usually last?": 5, then 6', /6 days/.test(await txt(a.page, '.jd-len')), await txt(a.page, '.jd-len'));
  await tap(a.page, '#jd-minus');
  check('1 ... back to 5', /5 days/.test(await txt(a.page, '.jd-len')));
  await a.page.$eval('[data-jd-tick="heavy"]', (x) => { x.checked = true; x.dispatchEvent(new Event('change', { bubbles: true })); });
  check('1 the two ticks: heavy, and pain that stops her day', /Heavy/.test(await view(a.page)) && /Pain that stops my day/.test(await view(a.page)) && await a.page.evaluate(() => window.Saathi.mem.ob.heavy === true));
  await shot(a.page, 'details-en');
  await finish(a.page);
  const s = await st(a.page);
  const starts = s.events.filter((e) => e.t === 'start'); const ends = s.events.filter((e) => e.t === 'end').map((e) => e.d);
  check('2 her dates are real starts (not guesses)', starts.map((e) => e.d).join() === LONG.join() && !starts.some((e) => e.approx), starts);
  check('2 each period over by today has its end; the one still going stays open', ends.join() === [ago(76), ago(35)].join(), ends);
  check('2 "Heavy" sits on her latest period, where her day page shows it', starts[2].pads === 'pads_4' && !starts[0].pads, starts);
  check('2 the usual gap comes from her dates (36 to 45 days)', s.intake.gap === 'g45' && s.focus.read === true && s.focus.dates === 3, { intake: s.intake, focus: s.focus });
  check('2 then "Your Sakhi"', (await hashOf(a.page)) === 'your-sakhi', await hashOf(a.page));
  const ys = await view(a.page);
  check('2 "What your dates show": her next period, from the same engine as Today', /What your dates show/i.test(ys) && /39 days until your next period/.test(await txt(a.page, '.ys-read')), await txt(a.page, '.ys-read'));
  check('2 her signs as What your diary shows draws them: heavy flow this week, long gaps this month', await has(a.page, '#view .xp-dcard.xp-week') && await has(a.page, '#view .xp-dcard.xp-month') && /Your last gap was 38 days/.test(ys), ys.slice(0, 600));
  check('2 a Qura doctor first on each, and no "Free government doctor"', await a.page.$$eval('#view .xp-dcard', (x) => x.every((c) => { const b = c.querySelector('.xp-acts .btn'); return !!b && b.hasAttribute('data-ask'); })) && !/Free government doctor/.test(ys));
  check('2 a free plan beside the doctor: Stronger blood, and My cycle plan', /Stronger blood/.test(ys) && /My cycle plan/.test(ys) && /And meanwhile, a free plan/i.test(ys), ys.slice(0, 900));
  check('2 "An early read from the dates you gave. Not a diagnosis."', /An early read from the dates you gave\. Not a diagnosis\./.test(ys));
  check('2 how Sakhi helps her stays (3 rows), with the tour', (await a.page.$$('#view .ys-rows .item')).length === 3 && await has(a.page, '#ys-tour'));
  check('2 no sideways scroll', await noScroll(a.page));
  await shot(a.page, 'ys-long-en');
  await tap(a.page, '#view [data-xp-plan="heavy"]');
  const pi = await a.page.evaluate(() => window.Saathi.mem.planIntake || null);
  check('2 Start opens that plan’s questions', (await hashOf(a.page)) === 'plan-goal' && pi && pi.goal === 'heavy', { h: await hashOf(a.page), pi });
  await done(a);
}

/* ---------- 3 regular dates ---------- */
{
  const a = await open();
  await join(a.page, { name: 'Priya', tile: 'cycle', goals: ['track'], dates: [ago(57), ago(29), ago(1)], stop: 'share' });
  await tap(a.page, '[data-ob-sh="me"]'); await signUp(a.page);
  const r = await txt(a.page, '.ys-read');
  check('3 her next period from day one', /27 days until your next period/.test(r), r);
  check('3 "Your gaps are in the usual range"', /Your gaps are in the usual range/.test(r) && /21 to 35 days apart, and steady/.test(r), r);
  check('3 fertile days after 6 regular gaps', /Fertile days and ovulation \(estimate\)/.test(r) && /you have 2/.test(r), r);
  check('3 no doctor card for dates in the usual range', !(await has(a.page, '#view .xp-dcard')));
  await shot(a.page, 'ys-regular-en');
  await done(a);
}

/* ---------- 4 "I don't remember the dates" ---------- */
{
  const a = await open();
  await join(a.page, { name: 'Meena', tile: 'cycle', goals: ['track'], stop: 'details' });
  await tap(a.page, '#jd-none');
  const v = await view(a.page);
  check('4 the quick choices come back, with a way back to the calendar', await has(a.page, '[data-ob-lp="24"]') && await has(a.page, '#jd-cal') && !(await has(a.page, '.jd-card')) && /No problem\. Pick roughly when your last period started/.test(v), v.slice(0, 400));
  check('4 ... and Version 39.10’s why line', /Why we ask: Sakhi marks your next period, and notices longer gaps\./.test(v));
  await tap(a.page, '#jd-cal');
  check('4 "Mark dates on the calendar instead" brings it back', await has(a.page, '.jd-card'));
  await tap(a.page, '#jd-none'); await tap(a.page, '[data-ob-lp="24"]');
  await finish(a.page);
  const s = await st(a.page);
  check('4 her answer is saved as a guess, as before', s.events.length === 1 && s.events[0].approx === true && s.events[0].d === ago(24) && !s.focus.read, s.events);
  check('4 no read on "Your Sakhi" without dates', !/What your dates show/i.test(await view(a.page)) && await has(a.page, '#ys-tour'));
  await done(a);
}

/* ---------- 5 on the pill, and stopping it ---------- */
{
  const a = await open();
  await join(a.page, { name: 'Sunita', tile: 'cycle', goals: ['track'], stop: 'details' });
  await a.page.$eval('#ob-pill', (x) => { x.checked = true; x.dispatchEvent(new Event('change', { bubbles: true })); });
  await sleep(200);
  const v = await view(a.page);
  check('5 on the pill: no calendar, "Since when have you taken it?"', !(await has(a.page, '.jd-card')) && !(await has(a.page, '#jd-none')) && /Since when have you taken it\?/.test(v) && /Your bleeds follow the pill/.test(v), v.slice(0, 500));
  check('5 ... and the two ticks, for her bleeds', /Anything else about your bleeds\?/.test(v) && await has(a.page, '[data-jd-tick="pain"]'));
  await tap(a.page, '[data-ob-hfor="ge3"]');
  await shot(a.page, 'pill-en');
  await finish(a.page);
  const s = await st(a.page);
  check('5 hormones on, from about a year back (3 months or more)', s.situation.hormones === true && s.situation.hormonesSince === ago(365) && s.situation.hormonesAbout === true && s.situation.hormonesFor === 'ge3', s.situation);
  check('5 "Your Sakhi" says why there are no dates', await has(a.page, '#view .ys-read .why-row[data-why-k="hormones"]'), await txt(a.page, '.ys-read'));
  await go(a.page, 'me-health');
  const mh = await view(a.page);
  check('5 Me shows no exact "since" date for her answer', /On hormone medicine/.test(mh) && !/since \d/.test(mh), mh.slice(0, 500));
  await a.page.$eval('[data-sit="hormones"]', (x) => { x.checked = false; x.dispatchEvent(new Event('change', { bubbles: true })); });
  await sleep(250);
  const sh = await txt(a.page, '#sheet-root');
  check('5 switching it off asks "When did you stop?"', /When did you stop\?/.test(sh) && /Today/.test(sh) && /Earlier/.test(sh) && /I was never on it/.test(sh) && (await st(a.page)).situation.hormones === true, sh);
  await shot(a.page, 'stop-en');
  await tap(a.page, '#stop-keep');
  check('5 "Keep it on" keeps it', (await st(a.page)).situation.hormones === true && !(await has(a.page, '#sheet-root .stop-list')));
  await a.page.$eval('[data-sit="hormones"]', (x) => { x.checked = false; x.dispatchEvent(new Event('change', { bubbles: true })); });
  await sleep(250);
  await tap(a.page, '#sheet-root input[value="never"]'); await tap(a.page, '#stop-save');
  const s2 = await st(a.page);
  check('5 "I was never on it" removes it: no start, no stop, no waiting', s2.situation.hormones === false && !s2.situation.hormonesSince && !s2.situation.hormonesUntil && !s2.situation.hormonesAbout, s2.situation);
  await done(a);
}
{
  /* a diary on hormones since 200 days ago: "Today" waits for her next period; "Earlier" counts the periods since */
  const seed = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: { hormones: true, hormonesSince: ago(200) }, intake: { goal: 'track' }, events: [{ d: ago(90), t: 'start' }, { d: ago(86), t: 'end' }, { d: ago(30), t: 'start' }, { d: ago(26), t: 'end' }], daily: {}, notes: {}, checkins: {}, tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3), firstLog: ago(30) }, mods: {}, settings: { toursAuto: false, notify: true } }, x || {});
  const a = await open({ seed: seed(), hash: 'me-health' });
  await a.page.$eval('[data-sit="hormones"]', (x) => { x.checked = false; x.dispatchEvent(new Event('change', { bubbles: true })); });
  await sleep(250); await tap(a.page, '#stop-save');
  const s = await st(a.page);
  check('5 "Today": stopped today, so Today waits for her next period', s.situation.hormones === false && s.situation.hormonesUntil === TODAY, s.situation);
  await go(a.page, 'home');
  check('5 ... "Sakhi counts your cycle again from your next period"', /Sakhi counts your cycle again from your next period/.test(await txt(a.page, '#view .hero')), await txt(a.page, '#view .hero'));
  await done(a);
  const b = await open({ seed: seed(), hash: 'me-health' });
  await b.page.$eval('[data-sit="hormones"]', (x) => { x.checked = false; x.dispatchEvent(new Event('change', { bubbles: true })); });
  await sleep(250); await tap(b.page, '#sheet-root input[value="early"]');
  check('5 "Earlier" asks for the day', !(await b.page.$eval('#stop-d', (e) => e.hidden)));
  await b.page.fill('#stop-date', ago(60)); await tap(b.page, '#stop-save');
  const s2 = await st(b.page);
  check('5 ... the day she stopped is kept', s2.situation.hormones === false && s2.situation.hormonesUntil === ago(60), s2.situation);
  await go(b.page, 'home');
  check('5 ... and her period since then counts: Today shows her cycle, not the wait', !/Sakhi counts your cycle again from your next period/.test(await txt(b.page, '#view .hero')) && /Cycle day/i.test(await txt(b.page, '#view .hero')), await txt(b.page, '#view .hero'));
  await done(b);
}

/* ---------- 6 Hindi at 360 px ---------- */
{
  const a = await open({ w: 360, h: 800, lang: 'hi' });
  await join(a.page, { lang: 'hi', name: 'Asha', tile: 'pmos', goals: ['irregular'], stop: 'details' });
  for (const d of LONG) await tapDay(a.page, d);
  const v = await view(a.page);
  check('6 hi: आपके पिछले 3 पीरियड, with her gaps in Hindi', /आपके पिछले 3 पीरियड/.test(v) && /3 पीरियड चुने · 41 और 38 दिन के अंतर/.test(v) && !KEYS.test(v) && await noScroll(a.page), v.slice(0, 400));
  await shot(a.page, 'details-hi-360');
  await finish(a.page);
  const ys = await view(a.page);
  check('6 hi: आपकी तारीख़ें क्या बताती हैं, with no sideways scroll', /आपकी तारीख़ें क्या बताती हैं/.test(ys) && !KEYS.test(ys) && await noScroll(a.page), ys.slice(0, 400));
  await shot(a.page, 'ys-hi-360');
  await done(a);
}

check('6 no page errors', errsAll.length === 0, errsAll);
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' + failed.length + ' of ' : 'ALL PASS ') + results.length + ' checks (joindates)');
process.exit(failed.length ? 1 : 0);
