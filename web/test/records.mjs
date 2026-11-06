// Version 39.1: one home for what her records say (docs/roadmap-v39-2026-10-24.md, section 3; MODULE_API section 44).
// Mohit, 24 Oct: "build and deliver best version build one by one from V39 to V48". This file checks:
//   1 Diary's "What it shows": her signals first, the verdict with her numbers inside, "This month's signs", the report;
//   2 Trends' verdict and What your diary shows never disagree (the roadmap's gate for 39.1), over 7 diaries;
//   3 Pattern check is gone: no tile, no For you, no Conditions link; an old link lands on the PMOS self-check;
//   4 the PMOS self-check asks Pattern check's two questions, free care first, and offers the plan for her periods;
//   5 the same buttons on every signal: free care, her report (with that card's question first), a Qura doctor;
//   6 "Check the signs" where a validated check exists, until she did it; held back in a tester's build;
//   7 flow and pain on every bleeding day, read by explain, the report and the self-check;
//   8 pain that stopped her day in 2 of her last 3 periods;  9 the heavy-bleeding chart at 100 or more;
//  10 My plan shows what her records say as one row;  11 no check labelled a plan; the symptom guide in Help;
//  12 a shared phone, Hindi, a 360 px screen, no page errors;  13 the V39.1 review: one check per confirmed finding.
// Usage: node test/records.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'records'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-27';   /* a Tuesday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (day, hm) => new Date(new Date(TODAY + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain'].map((k) => [k, { st: 'done', d: ago(3) }]));
/* the Android bridge, keeping what Sakhi asks it to schedule */
const ANDROID = 'window.__sched = []; window.SakhiAndroid = { schedule(j){ try { window.__sched = JSON.parse(j); } catch (e) {} return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, setDisguise(){}, isDisguised(){ return false; }, keepAwake(){} };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.1-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start', pain: 'pain_1' }, { d: ago(x - 5), t: 'end' })); return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
const planOf = (pack, goal, start, extra) => Object.assign({ pack: pack, goalKey: goal, start: start, go: true, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'evening', bed: 'b23', work: 'day', log: {}, weeks: {}, body: [], doc: 'done' }, extra || {});
const PREG = (w) => ({ situation: { pregnant: true, pregnantSince: ago(w * 7) }, events: [] });
const PINH = (pin) => { let h = 2166136261; const str = 'sakhi:' + pin; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); };
const REC_OK = { danger: ['none'], bleed: 'light', colour: 'brown', wtype: 'stitch', wound: 'fine', fever: 'no', breast: 'fine', pee: 'fine', potty: 'fine', mood: 'ok', sleep: 'some' };

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(Object.assign({}, LOCAL, o.config || {})) + ';');
  await ctx.addInitScript(ANDROID);
  if (o.seed !== null) await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: o.now || at(0, '10:00') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const view = (page) => page.$eval('#view', (e) => e.innerText);
const vtext = (page) => page.$eval('#view', (e) => e.textContent);
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000 }); await page.$eval(sel, (el) => el.click()); await settle(page, 300); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText).catch(() => '');
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const search = async (page, q) => { await go(page, 'care'); await page.evaluate((x) => { window.Saathi.mem.careQ = x; window.Saathi.render(); }, q); await settle(page, 300); return page.$$eval('#view section.care-sec:first-of-type [data-go]', (x) => x.map((y) => y.dataset.go)); };
const errsAll = [];

/* her periods as gaps (oldest first), the latest start `last` days ago; each period lasts 5 days unless `len` says */
const cyc = (gaps, last, extra, len) => { const ds = [last]; let x = last; for (let i = gaps.length - 1; i >= 0; i--) { x += gaps[i]; ds.unshift(x); } const out = []; ds.forEach((a) => out.push(Object.assign({ d: ago(a), t: 'start' }, extra || {}), { d: ago(a - ((len && len[a]) || 5) + 1), t: 'end' })); return out; };
const agree = (page) => page.evaluate(() => { const S = window.Saathi; const vd = S.cycle.verdict(); const f = S.explain.findings().filter((x) => x.lv !== 'ok');
  return { cls: vd ? vd.cls : null, longP: vd ? vd.longP.length : 0, gaps: f.filter((x) => /^gap_/.test(x.id)).map((x) => x.id + ':' + x.lv + (x.quiet ? ':quiet' : '')), per: f.filter((x) => x.id === 'period_long').map((x) => x.lv + (x.quiet ? ':quiet' : '')) }; });
const diaryShows = async (page) => { await go(page, 'diary'); await page.evaluate(() => { window.Saathi.mem.diaryTab = 'tr'; window.Saathi.render(); }); await settle(page, 400); };

/* ---------- 1. Diary's "What it shows": one home, in one order ---------- */
{
  const a = await open({ seed: { events: cyc([40, 29, 42, 30, 28, 29], 10) } });
  check('1 Today has no "This month" round button any more', !(await has(a.page, '#view .ract-row [data-go="checkin"]')));
  await go(a.page, 'diary');
  check('1 the Diary tab is called "Cycles" (Version 39.11; it was "What it shows")', /Cycles/.test(await txt(a.page, '#view .tabs')) && !/What it shows/.test(await txt(a.page, '#view .tabs')), await txt(a.page, '#view .tabs'));
  await diaryShows(a.page);
  check('1 Version 39.17: the notes meter moved to the Calendar (Cycles has none)', !(await has(a.page, '#diary-body .meter')));
  const order = await a.page.evaluate(() => [...document.querySelectorAll('#diary-body > *:not(.meter)')].map((e) => e.className.split(' ').filter((c) => /^(xp-diary|vd-card|mc-card|pat-card|kn-card|wis-ci|wis-checks|rp-btn|card)$/.test(c)).join('.') || e.tagName));
  /* Version 39.25: with notes on fewer than 3 periods, "What Sakhi can tell you" counts them in place of the waiting "What repeats" card */
  check('1 her signals come first, then what Sakhi can tell her (what repeats, still to come), her cycles and the verdict (Version 39.18, in the order of her questions)', /^xp-diary/.test(order[0] || '') && /kn-card/.test(order[1] || '') && /mc-card/.test(order[2] || '') && /vd-card/.test(order[3] || '') && !order.some((x) => /pat-card/.test(x)), order);
  const v = await view(a.page);
  check('1 "Your numbers" sits inside the verdict card, once', (v.match(/Your numbers/g) || []).length === 1 && await has(a.page, '#view .vd-card details.vd-nums'), (v.match(/Your numbers/g) || []).length);
  check('1 the report for her doctor comes right after the verdict, and no monthly signs for a woman without PMOS (Version 39.18)', order.indexOf('rp-btn') === order.findIndex((x) => /vd-card/.test(x)) + 1 && !(await has(a.page, '#view .wis-ci')), order);
  await go(a.page, 'explain');
  check('1 What your diary shows is lit as Diary', /Diary/.test(await txt(a.page, '#tabbar .on')), await txt(a.page, '#tabbar .on'));
  await shot(a.page, '01-what-it-shows'); errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 2. Trends and What your diary shows never disagree (the roadmap's gate for 39.1) ---------- */
{
  const cases = [
    ['regular', { events: cyc([28, 29, 28, 30, 28, 29], 10) }, (r) => r.cls === 'regular' && !r.gaps.length],
    ['a long last gap', { events: cyc([28, 29, 28, 30, 28, 42], 5) }, (r) => r.cls === 'outside' && r.gaps.join() === 'gap_long:watch'],
    ['one long gap 4 periods back', { events: cyc([28, 45, 28, 30, 28, 29], 10) }, (r) => r.cls === 'outside' && r.gaps.join() === 'gap_long:watch:quiet'],
    ['two long gaps', { events: cyc([40, 29, 42, 30, 28, 29], 10) }, (r) => r.cls === 'outside' && r.gaps.join() === 'gap_long:month'],
    ['uneven, inside the usual range', { events: cyc([22, 34, 23, 33, 24, 34], 8) }, (r) => r.cls === 'irregular' && r.gaps.join() === 'gap_vary:watch:quiet'],
    ['on the pill', { events: cyc([28, 45, 28, 30, 28, 29], 10), situation: { hormones: true } }, (r) => r.cls === null && !r.gaps.length],
    ['a 10-day period 3 months ago', { events: cyc([28, 29, 28, 30, 28, 29], 10, null, { 97: 10 }) }, (r) => r.longP === 1 && r.per.join() === 'week:quiet']
  ];
  for (const [name, seed, ok] of cases) {
    const a = await open({ seed: seed });
    const r = await agree(a.page);
    check('2 ' + name + ': Trends\' verdict and the signal cards agree', ok(r), r);
    await diaryShows(a.page);
    const pill = await txt(a.page, '#view .vd-card .vd-row .pill');
    const cards = await a.page.$$eval('#view .xp-dcard h3', (x) => x.map((y) => y.textContent));
    if (r.cls === 'outside') check('2 ' + name + ': "Outside the usual" shows with the gap that caused it', /Outside the usual/.test(pill) && cards.some((c) => /gap was|gaps were|recent gaps/.test(c)), { pill, cards });
    if (r.cls === 'irregular') check('2 ' + name + ': "Irregular" shows with "Your gaps vary by"', /Irregular/.test(pill) && cards.some((c) => /Your gaps vary by 12 days/.test(c)), { pill, cards });
    if (r.cls === 'regular' && !r.longP) check('2 ' + name + ': "Regular", and no gap card', /Regular/.test(pill) && !cards.some((c) => /gap/.test(c)), { pill, cards });
    if (name === 'on the pill') check('2 on the pill: no verdict card at all', !(await has(a.page, '#view .vd-card')));
    if (r.longP) check('2 ' + name + ': "Longer than usual" shows with the period card', /Longer than usual/.test(await txt(a.page, '#view .vd-card')) && cards.some((c) => /lasted 10 days/.test(c)), cards);
    /* a quiet card waits on the Diary, not on Today */
    if (/quiet/.test(r.gaps.join() + r.per.join())) { await go(a.page, 'home'); check('2 ' + name + ': the older card stays off Today', !(await has(a.page, '#view .xp-home'))); }
    errsAll.push(...a.errs); await a.ctx.close();
  }
}

/* ---------- 3. Pattern check is gone ---------- */
{
  const a = await open({ seed: { events: cyc([40, 29, 42, 30, 28, 29], 10), intake: { goal: 'irregular' }, goals: ['irregular'] } });
  await go(a.page, 'topic-cond');
  const cond = await a.page.$$eval('#view [data-go]', (x) => x.map((y) => y.dataset.go));
  check('3 no Pattern check tile in Conditions', cond.indexOf('pattern') < 0, cond);
  await go(a.page, 'care');
  const fy = await a.page.$$eval('#view section.care-sec:first-of-type [data-go]', (x) => x.map((y) => y.dataset.go));
  check('3 For you (irregular periods) has no Pattern check and no self-check (Version 39.68)', fy.indexOf('pattern') < 0 && !fy.some((g) => /^selfcheck/.test(g)), fy);
  await go(a.page, 'cond');
  check('3 the Conditions page links neither Pattern check nor a self-check (Version 39.68)', !(await has(a.page, '#view [data-go="pattern"]')) && !(await has(a.page, '#view [data-go^="selfcheck"]')));
  await go(a.page, 'pattern');
  check('3 an old #pattern link lands on the Diary (Version 39.68: no self-check)', await a.page.evaluate(() => location.hash) === '#diary', await a.page.evaluate(() => location.hash));
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 4. The PMOS self-check (Version 39.68: gone, the doctors' review) ---------- */
{
  const a = await open({ seed: { events: cyc([40, 29, 42, 30, 28, 29], 10) }, hash: '#selfcheck-pmos' });
  await settle(a.page, 300);
  check('4 the PMOS self-check lands on Explore (Version 39.68: the doctors removed the self-checks)', (await a.page.evaluate(() => location.hash)) === '#care', await a.page.evaluate(() => location.hash));
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 5. The same buttons on every signal ---------- */
{
  const a = await open({ seed: { events: cyc([40, 29, 42, 30, 28, 29], 10) } });
  await diaryShows(a.page);
  const b = await a.page.$$eval('#view .xp-dcard.xp-month .xp-acts:not(.xp-more) .btn', (x) => x.map((y) => y.textContent.trim()));
  /* Version 39.25 (Mohit, 27 Oct: "dont offer free government doctor let it be in explore section"): a Qura doctor first */
  /* Version 39.64 (phase E; Mohit, 3 Nov: "Qura first, gynaecologist second"): the doctor the sign needs comes second */
  check('5 a "this month" card: a Qura doctor, then the gynaecologist, then her report; no "Free government doctor"', b.join(' | ') === 'Ask a doctor about this | See a gynaecologist | My report for the doctor', b);   /* Version 39.71: the label */
  check('5 ... a free plan beside it and "What this means", and no "Check the signs" (Version 39.68: no self-checks)', !/Check the signs/.test(await txt(a.page, '#view .xp-dcard.xp-month')) && /And meanwhile, a free plan/i.test(await txt(a.page, '#view .xp-dcard.xp-month')) && await has(a.page, '#view .xp-dcard.xp-month .xp-plan [data-xp-plan]') && /What this means/.test(await txt(a.page, '#view .xp-dcard.xp-month')), await txt(a.page, '#view .xp-dcard.xp-month'));
  await tap(a.page, '#view .xp-dcard.xp-month [data-xp-rp]');
  const q = await a.page.$$eval('#view ol.steps li', (x) => x.map((y) => y.textContent));
  check('5 her report opens with that card\'s question first', /^#report/.test(await a.page.evaluate(() => location.hash)) && /gaps between periods are often longer than 35 days/.test(q[0] || ''), q);
  await go(a.page, 'home');
  check('5 ... and only that report: back on Today the question is gone', await a.page.evaluate(() => !window.Saathi.mem.rpFirst));
  await a.ctx.close();
  const p = await open({ seed: Object.assign({}, PREG(14), { daily: { [ago(0)]: ['d_pbleed'] } }) });
  await go(p.page, 'explain');
  const pb = await p.page.$$eval('#view .xp-now .btn', (x) => x.map((y) => y.textContent.trim()));
  check('5 a "go now" card: a call button for her ambulance (Version 39.70: 102 in pregnancy), no Qura doctor', pb.some((x) => /Call 102/.test(x)) && !pb.some((x) => /Call 112/.test(x)) && !pb.some((x) => /Qura/.test(x)), pb);
  check('5 ... and one button to Help, not two', (await p.page.$$('#view .xp-now [data-go="help"]')).length === 1, pb);
  errsAll.push(...a.errs, ...p.errs); await p.ctx.close();
}

/* ---------- 6. "Check the signs" where a validated check exists (Version 39.68: the doctors removed the self-checks) ---------- */
{
  const a = await open({ seed: { events: cyc([28, 29, 28, 30, 28, 29], 3).map((e, i, all) => (e.t === 'start' && e.d === all.filter((x) => x.t === 'start').pop().d ? Object.assign({}, e, { pain: 'pain_3', pads: 'pads_4' }) : e)) } });
  await diaryShows(a.page);
  const gos = await a.page.$$eval('#view [data-xp-check]', (x) => x.map((y) => y.dataset.go));
  check('6 period pain that stopped her day, heavy flow: no "Check the signs" (Version 39.68)', gos.length === 0 && await has(a.page, '#view .xp-dcard'), gos);
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: { events: cyc([40, 29, 42, 30, 28, 29], 10), mods: { selfcheck: { pmos: { d: ago(5), n: 3, m: 9, yes: ['gaps', 'few', 'hair'] } } } } });
  await diaryShows(b.page);
  check('6 an old PMOS check: no "You did this check on …" and no button (Version 39.68)', !/You did this check on/.test(await txt(b.page, '#view .xp-dcard.xp-month')) && !(await has(b.page, '#view .xp-dcard.xp-month [data-xp-check]')) && await has(b.page, '#view .xp-dcard.xp-month'), await txt(b.page, '#view .xp-dcard.xp-month'));
  check('6 ... and no "Checks you did" list', !/Checks you did/.test(await view(b.page)) && !(await has(b.page, '#view .wis-checks')));
  errsAll.push(...b.errs); await b.ctx.close();
  const c = await open({ seed: { events: cyc([40, 29, 42, 30, 28, 29], 10) }, config: { app: 'test-0.39' } });
  await diaryShows(c.page);
  check('6 a tester\'s build holds the self-checks back: no "Check the signs"', !(await has(c.page, '#view [data-xp-check]')) && await has(c.page, '#view .xp-dcard'));
  errsAll.push(...c.errs); await c.ctx.close();
}

/* ---------- 7. Flow and pain on every bleeding day ---------- */
{
  const ev = cyc([28, 29, 28, 30, 28], 2);   /* her period started 2 days ago */
  const a = await open({ seed: { events: ev } });
  await go(a.page, 'diary');
  await tap(a.page, '#view [data-day="' + ago(1) + '"]');
  check('7 day 2 of her period: the day sheet offers "Add flow and pain details"', await has(a.page, '#sheet-root #day-flow'));
  await tap(a.page, '#sheet-root #day-flow');
  check('7 ... which asks only about that day\'s flow and pain', await has(a.page, '#sheet-root [data-opt="pads"]') && !(await has(a.page, '#sheet-root [data-type]')) && !(await has(a.page, '#sheet-root #log-date')));
  await tap(a.page, '#sheet-root [data-opt="pads"][data-val="pads_4"]'); await tap(a.page, '#sheet-root [data-opt="pain"][data-val="pain_3"]'); await tap(a.page, '#sheet-root #log-save');
  const s = await st(a.page);
  check('7 saved as that day\'s details', s.events.some((e) => e.t === 'start_detail' && e.d === ago(1) && e.pads === 'pads_4' && e.pain === 'pain_3'), s.events.filter((e) => e.d >= ago(3)));
  check('7 Sakhi reads them: heavy flow and pain that stopped her day', await a.page.evaluate(() => { const f = window.Saathi.explain.findings().map((x) => x.id); return f.indexOf('flow_heavy') >= 0 && f.indexOf('pain_severe') >= 0; }));
  await go(a.page, 'report');
  check('7 her report marks that period heavy', /heavy/i.test(await txt(a.page, '#view .rp-table tbody tr:last-child')), await txt(a.page, '#view .rp-table'));
  await go(a.page, 'selfcheck-fibroids');
  check('7 the fibroids check lands on Explore (Version 39.68: no self-checks)', (await a.page.evaluate(() => location.hash)) === '#care');
  await go(a.page, 'diary'); await a.page.evaluate(() => { window.Saathi.mem.diaryTab = 'days'; window.Saathi.render(); }); await settle(a.page, 300);
  check('7 Days shows that day\'s details', /Soaked one every 1–2 hours|pads/i.test(await txt(a.page, '#view [data-dy="' + ago(1) + '"]')), await txt(a.page, '#view [data-dy="' + ago(1) + '"]'));
  errsAll.push(...a.errs); await a.ctx.close();
  /* details on the day she logged her period ended count too */
  const ev2 = cyc([28, 29, 28, 30, 28], 6).map((e) => (e.t === 'end' && e.d === ago(2) ? Object.assign({}, e, { pads: 'pads_4' }) : e));
  const b = await open({ seed: { events: ev2 } });
  check('7 heavy flow noted on the "Period ended" day counts', await b.page.evaluate(() => window.Saathi.explain.findings().some((x) => x.id === 'flow_heavy')), ev2.slice(-2));
  errsAll.push(...b.errs); await b.ctx.close();
}

/* ---------- 8. Pain that stopped her day in 2 of her last 3 periods ---------- */
{
  const ev = cyc([28, 29, 28, 30, 28], 3); const st3 = ev.filter((e) => e.t === 'start').slice(-3).map((e) => e.d);
  const seed = ev.map((e) => (e.t === 'start' && (e.d === st3[0] || e.d === st3[1]) ? Object.assign({}, e, { pain: 'pain_3' }) : (e.t === 'start' && e.d === st3[2] ? Object.assign({}, e, { pain: 'pain_1' }) : e)));
  const a = await open({ seed: { events: seed } });
  check('8 two of her last three periods stopped her day: "Period pain that stopped your day" (this month)', await a.page.evaluate(() => window.Saathi.explain.findings().some((x) => x.id === 'pain_severe' && x.lv === 'month')));
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 9. The heavy-bleeding chart (PBAC) at 100 or more ---------- */
{
  const day = (f) => ({ l: 0, h: 0, f: f, cs: 0, cl: 0, fl: 0 });
  const ev = cyc([28, 29, 28, 30, 28], 9);
  const a = await open({ seed: { events: ev, mods: { cond: { pbac: { [ago(9)]: { d: [day(2), day(2), day(1), day(0), day(0), day(0), day(0), day(0), day(0), day(0)] } } } } } });
  check('9 a chart total of 100 gives the heavy-flow card', await a.page.evaluate(() => window.Saathi.explain.findings().some((x) => x.id === 'flow_heavy')));
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: { events: ev, mods: { cond: { pbac: { [ago(9)]: { d: [day(2), day(1), day(1), day(0), day(0), day(0), day(0), day(0), day(0), day(0)] } } } } } });
  check('9 ... and 80 doesn\'t', await b.page.evaluate(() => !window.Saathi.explain.findings().some((x) => x.id === 'flow_heavy')));
  errsAll.push(...b.errs); await b.ctx.close();
}

/* ---------- 10. My plan shows what her records say, as one row ---------- */
{
  const a = await open({ seed: { events: cyc([40, 29, 42, 30, 28, 29], 10), intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(5)) } } });   /* review FLOWS-11: a real pack */
  await go(a.page, 'plan');
  check('10 My plan: no row for a signal that can wait (Version 39.37: Today and Cycles hold it; one that can\'t wait has its row, check 13)', !(await has(a.page, '#view .pl-xp')));
  await a.page.evaluate(() => { window.Saathi.state.settings.discreet = true; window.Saathi.save(); }); await go(a.page, 'plan');
  check('10 not on a shared phone', !(await has(a.page, '#view .pl-xp')));
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 11. No check labelled "A plan for you"; the symptom guide is in Help ---------- */
{
  const a = await open({ seed: { events: cyc([40, 29, 42, 30, 28, 29], 10), goals: ['irregular'], intake: { goal: 'irregular' } } });
  check('11 "Could it be PMOS?" is no longer offered as a plan', await a.page.evaluate(() => !(window.Saathi.plan.catalogue() || []).some((x) => x.id === 'selfcheck-pmos')));
  await go(a.page, 'help');
  check('11 the symptom guide sits in Help (Version 39.7: as its "By body part" tab)', await has(a.page, '#view [data-htab="access-symptoms"]'));
  await go(a.page, 'topic-tools'); const t1 = await a.page.$$eval('#view [data-go]', (x) => x.map((y) => y.dataset.go));
  await go(a.page, 'topic-help'); const t2 = await a.page.$$eval('#view [data-go]', (x) => x.map((y) => y.dataset.go));
  check('11 ... and not in Explore\'s topics', t1.concat(t2).indexOf('access-symptoms') < 0, t1.concat(t2));
  await search(a.page, 'symptom');
  check('11 search still finds it', await has(a.page, '#view [data-go="access-symptoms"]'));
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 12. A shared phone, Hindi, a small screen ---------- */
{
  const a = await open({ seed: { events: cyc([40, 29, 42, 30, 28, 29], 10), settings: { discreet: true, toursAuto: false, notify: true } } });
  await diaryShows(a.page);
  check('12 discreet: What it shows has no signal cards', !(await has(a.page, '#view .xp-dcard')) && !(await has(a.page, '#view .xp-banner')));
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: { lang: 'hi', events: cyc([40, 29, 42, 30, 28, 29], 10) }, lang: 'hi', w: 360, h: 800 });
  await go(b.page, 'diary');
  check('12 Hindi: the tab is "चक्र" (Version 39.11: Cycles)', /चक्र/.test(await txt(b.page, '#view .tabs')) && !/क्या दिखता है/.test(await txt(b.page, '#view .tabs')), await txt(b.page, '#view .tabs'));
  await diaryShows(b.page);
  check('12 Hindi: the buttons read "इस बारे में Qura की डॉक्टर से पूछें" and "डॉक्टर के लिए मेरी रिपोर्ट" (Version 39.25: no "मुफ़्त सरकारी डॉक्टर")', /इस बारे में डॉक्टर से पूछें/.test(await view(b.page)) && /डॉक्टर के लिए मेरी रिपोर्ट/.test(await view(b.page)) && !/मुफ़्त सरकारी डॉक्टर/.test(await view(b.page)));
  check('12 360 px: no sideways scroll on What it shows', await noScroll(b.page));
  await shot(b.page, '12-hindi-360'); errsAll.push(...b.errs); await b.ctx.close();
}
/* ---------- 13. The V39.1 review (review-v39-1): one check per confirmed finding ---------- */
const ids = (page) => page.evaluate(() => window.Saathi.explain.findings().map((x) => x.id + ':' + x.lv));
const unlock = async (page, pin) => { for (const k of pin) await tap(page, '#view [data-k="' + k + '"]'); await settle(page, 300); };
{
  /* ENGINE-01: 2 long (or 2 short) gaps get "this month" even when the other kind sits between them */
  for (const [gaps, want] of [[[40, 42, 28, 29, 18, 28], 'gap_long:month'], [[18, 19, 28, 29, 42, 28], 'gap_short:month']]) {
    const a = await open({ seed: { events: cyc(gaps, 10) } }); const f = await ids(a.page);
    check('13 ENGINE-01 gaps ' + gaps.join(',') + ': ' + want, f.indexOf(want) >= 0, f); errsAll.push(...a.errs); await a.ctx.close();
  }
  /* ENGINE-02, PRIVACY-02: thoughts of harm call Tele-MANAS 14416 first on What it shows and the explain page too. Version 39.70 (the
     doctors' answer 2): an old harm answer shows no card and no number on either */
  const h = await open({ seed: { situation: { deliveredOn: ago(10) }, events: [], mods: { post: { rec: { [ago(0)]: Object.assign({}, REC_OK, { mood: 'harm' }) } } } } });
  await diaryShows(h.page); const c1 = await h.page.$$eval('#view .xp-now a[href^="tel:"]', (x) => x.map((y) => y.getAttribute('href')));
  await go(h.page, 'explain'); const c2 = await h.page.$$eval('#view .xp-now a[href^="tel:"]', (x) => x.map((y) => y.getAttribute('href')));
  check('13 ENGINE-02 an old harm answer: no call card on What it shows or the explain page', !c1.length && !c2.length, [c1, c2]);
  errsAll.push(...h.errs); await h.ctx.close();
  /* ENGINE-03, PRIVACY-01: a "call 112" card reads on Diary's paper, light and dark */
  for (const theme of ['light', 'dark']) {
    const p = await open({ seed: Object.assign({}, PREG(14), { daily: { [ago(0)]: ['d_pbleed'] }, settings: { theme: theme, toursAuto: false, notify: true } }), w: 360, h: 800 });
    await diaryShows(p.page);
    const con = await p.page.evaluate(() => { const c = document.querySelector('#view .xp-now'); const hd = c && c.querySelector('h3'); if (!c || !hd) return null;
      const rgb = (x) => (x.match(/[\d.]+/g) || []).slice(0, 3).map(Number); const lum = (a) => { const v = a.map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
      const l1 = lum(rgb(getComputedStyle(c).backgroundColor)), l2 = lum(rgb(getComputedStyle(hd).color)); return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 10) / 10; });
    check('13 PRIVACY-01 (' + theme + ') a "call 112" card on Diary\'s paper has readable text (contrast 4.5 or more)', con != null && con >= 4.5, con);
    errsAll.push(...p.errs); await p.ctx.close();
  }
  /* ENGINE-04: a second "Period started" 2 days later doesn't hide her day-1 flow and pain */
  const e4 = cyc([28, 29], 12).map((e) => (e.t === 'start' && e.d === ago(12) ? Object.assign({}, e, { pads: 'pads_4', pain: 'pain_3' }) : e)).concat([{ d: ago(10), t: 'start' }]);
  const a4 = await open({ seed: { events: e4 } }); const f4 = await ids(a4.page);
  check('13 ENGINE-04 a second start 2 days later: her day-1 heavy flow still counts', f4.some((x) => /^flow_heavy:/.test(x)), f4);
  errsAll.push(...a4.errs); await a4.ctx.close();
  /* ENGINE-05: the heavy plan's results count "needed two pads" as heavy, as the engine does */
  const e5 = cyc([28, 29, 28], 10).map((e) => (e.t === 'start' && e.d === ago(10) ? Object.assign({}, e, { pads: 'pads_2', two: true }) : e));
  const a5 = await open({ seed: { events: e5, intake: { goal: 'heavy' }, mods: { plan: planOf('heavy', 'heavy', ago(30)) } } });
  await go(a5.page, 'plan-progress');   /* Version 39.5: results are on My progress */
  const h5 = await a5.page.evaluate(() => { const c = [...document.querySelectorAll('#view .card')].find((x) => /Periods with heavy flow/.test(x.innerText)); return c ? c.innerText.replace(/\s+/g, ' ') : ''; });
  check('13 ENGINE-05 the heavy plan counts "needed two pads" as a heavy period', /1 of 1/.test(h5), h5);
  errsAll.push(...a5.errs); await a5.ctx.close();
  /* ENGINE-06, FLOWS-03, PRIVACY-05: a Hindi diary's card question, in a report drawn in English: once, in English */
  const a6 = await open({ seed: { lang: 'hi', events: cyc([40, 29, 42, 30, 28, 29], 10) }, lang: 'hi' });
  await diaryShows(a6.page); await tap(a6.page, '#view .xp-dcard.xp-month [data-xp-rp]'); await tap(a6.page, '#view [data-rp-lang="en"]');
  const q6 = await a6.page.$$eval('#view ol.steps li', (x) => x.map((y) => y.textContent));
  check('13 FLOWS-03 a Hindi diary, an English report: the card\'s question once, in English', q6.filter((x) => /longer than 35 days/.test(x)).length === 1 && !q6.some((x) => /[ऀ-ॿ]/.test(x)), q6);
  errsAll.push(...a6.errs); await a6.ctx.close();
  /* ENGINE-08: her numbers show while the verdict can't (one counted gap) */
  const a8 = await open({ seed: { events: cyc([29], 10) } }); await diaryShows(a8.page);
  check('13 ENGINE-08 with one counted gap, "Your numbers" still shows', /Your numbers/.test(await txt(a8.page, '#view .vd-nums-card')), (await view(a8.page)).slice(0, 400));
  errsAll.push(...a8.errs); await a8.ctx.close();
  /* ENGINE-09: a heavy-bleeding chart from an older period is "one of your recent periods" */
  const day = (f) => ({ l: 0, h: 0, f: f, cs: 0, cl: 0, fl: 0 });
  const e9 = cyc([28, 30], 5).map((e) => (e.t === 'start' && e.d === ago(5) ? Object.assign({}, e, { pads: 'pads_1' }) : e));
  const a9 = await open({ seed: { events: e9, mods: { cond: { pbac: { [ago(35)]: { d: [day(3), day(3), day(2), day(0), day(0), day(0), day(0), day(0), day(0), day(0)] } } } } } });
  const t9 = await a9.page.evaluate(() => { const f = window.Saathi.explain.findings().find((x) => x.id === 'flow_heavy'); return f ? window.Saathi.explain.label(f).t : null; });
  check('13 ENGINE-09 a heavy chart from an older period: "Heavy flow in one of your recent periods"', /one of your recent periods/.test(t9 || ''), t9);
  errsAll.push(...a9.errs); await a9.ctx.close();
  /* ENGINE-10: long gaps against her own usual range (45 days for a 15-year-old) */
  const a10 = await open({ seed: { dob: '2011-06-01', events: cyc([40, 42, 38, 50, 47, 30], 10), checkins: { [TODAY.slice(0, 7)]: { at: ago(2), kind: 'cycle', chips: ['acne'] } } } });
  /* the reason line is in the catalogue (since the V39.2 review, My PMOS plan isn't suggested without PMOS) */
  const v10 = await a10.page.evaluate(() => ((window.Saathi.plan.catalogue() || []).find((x) => x.id === 'plan-pmos') || {}).why || '');
  check('13 ENGINE-10 a 15-year-old\'s long gaps are counted against 45 days, not 35', /longer than 45 days/.test(v10) && !/longer than 35 days/.test(v10), v10);
  errsAll.push(...a10.errs); await a10.ctx.close();
  /* ENGINE-11, FLOWS-01: on the day her period ended, the flow button changes that day's own details */
  const e11 = cyc([28, 29, 28, 30, 28], 6).map((e) => (e.t === 'end' && e.d === ago(2) ? Object.assign({}, e, { pads: 'pads_4' }) : e));
  const a11 = await open({ seed: { events: e11 } });
  await go(a11.page, 'diary'); await tap(a11.page, '#view [data-day="' + ago(2) + '"]'); await tap(a11.page, '#sheet-root #day-flow');
  check('13 FLOWS-01 the flow button on her "Period ended" day opens that day\'s own details', await has(a11.page, '#sheet-root [data-opt="pads"][data-val="pads_4"].on'));
  await tap(a11.page, '#sheet-root [data-opt="pads"][data-val="pads_1"]'); await tap(a11.page, '#sheet-root #log-save');
  const s11 = (await st(a11.page)).events.filter((e) => e.d === ago(2));
  check('13 FLOWS-01 ... and her correction replaces them (one entry, no heavy card)', s11.length === 1 && s11[0].t === 'end' && s11[0].pads === 'pads_1' && !(await ids(a11.page)).some((x) => /^flow_heavy:/.test(x)), s11);
  errsAll.push(...a11.errs); await a11.ctx.close();
  /* ENGINE-12, FLOWS-04: an old #pattern link replaces itself, so Back isn't trapped; in a tester's build it lands on Diary */
  const a12 = await open({ seed: { events: cyc([40, 29, 42, 30, 28, 29], 10) }, hash: '#diary' });
  await go(a12.page, 'pattern'); const h1 = await a12.page.evaluate(() => location.hash);
  await a12.page.evaluate(() => history.back()); await settle(a12.page, 500); const h2 = await a12.page.evaluate(() => location.hash);
  check('13 FLOWS-04 #pattern lands on the Diary (Version 39.68: no self-check), and Back isn\'t trapped', h1 === '#diary' && h2 === '#diary', [h1, h2]);
  errsAll.push(...a12.errs); await a12.ctx.close();
  const t12 = await open({ seed: { events: cyc([40, 29, 42, 30, 28, 29], 10) }, hash: '#diary', config: { app: 'test-0.39' } });
  await go(t12.page, 'pattern');
  check('13 FLOWS-04 ... in a tester\'s build it lands on Diary', (await t12.page.evaluate(() => location.hash)) === '#diary' && !/Not in this version/.test(await view(t12.page)), await t12.page.evaluate(() => location.hash));
  errsAll.push(...t12.errs); await t12.ctx.close();
  /* FLOWS-02: a woman on a plan isn't offered a new 12-week plan by a card */
  const a2 = await open({ seed: { situation: { pcos: true }, events: cyc([40, 29, 42, 30, 28, 29], 10), intake: { goal: 'pmos' }, mods: { plan: planOf('cycle', 'pmos', ago(15)) } } });
  const o2 = await a2.page.evaluate(() => [window.Saathi.plan.offerOk('irregular'), window.Saathi.plan.offerOk('pmos')]);
  await diaryShows(a2.page);
  check('13 FLOWS-02 on her PMOS plan, no card offers "A 12-week plan for your periods"', o2.join() === 'false,false' && !/A 12-week plan for your periods/.test(await view(a2.page)), o2);
  errsAll.push(...a2.errs); await a2.ctx.close();
  /* FLOWS-07: saving "This month's signs" goes back to What it shows */
  const a7 = await open({ seed: { events: cyc([28, 29, 28], 10), situation: { pcos: true } } });   /* Version 39.18: the monthly signs show with PMOS */
  await diaryShows(a7.page); await tap(a7.page, '#view .wis-ci [data-go="checkin"]'); await tap(a7.page, '#view #ci-save');
  check('13 FLOWS-07 saving "This month\'s signs" goes back to Diary', (await a7.page.evaluate(() => location.hash)) === '#diary', await a7.page.evaluate(() => location.hash));
  errsAll.push(...a7.errs); await a7.ctx.close();
  /* FLOWS-08: Days shows "Leaked through clothes" */
  const a8b = await open({ seed: { events: cyc([28, 29, 28, 30, 28], 2).concat([{ d: ago(1), t: 'start_detail', leaked: true }]) } });
  await go(a8b.page, 'diary'); await a8b.page.evaluate(() => { window.Saathi.mem.diaryTab = 'days'; window.Saathi.render(); }); await settle(a8b.page, 300);
  check('13 FLOWS-08 Days shows "Leaked through clothes"', /Leaked through clothes/.test(await txt(a8b.page, '#view [data-dy="' + ago(1) + '"]')), await txt(a8b.page, '#view [data-dy="' + ago(1) + '"]'));
  errsAll.push(...a8b.errs); await a8b.ctx.close();
  /* FLOWS-10, PRIVACY-07: a woman who is only reading finds the symptom guide in Help */
  const b10 = await open({ seed: { stage: 'browse', events: [] }, hash: '#help' });
  check('13 FLOWS-10 "Just read": the symptom guide is in Help (its tab)', await has(b10.page, '#view [data-htab="access-symptoms"]'));
  errsAll.push(...b10.errs); await b10.ctx.close();
  /* FLOWS-11: the report opens with the tapped card's own question, ahead of the questions it would ask anyway */
  const r5 = await open({ seed: { events: cyc([40, 29, 42, 30, 28, 29], 10).map((e) => (e.t === 'start' && e.d === ago(10) ? Object.assign({}, e, { pads: 'pads_4' }) : e)) } });
  await diaryShows(r5.page); await tap(r5.page, '#view .xp-dcard.xp-week [data-xp-rp]');
  const q5 = await r5.page.$$eval('#view ol.steps li', (x) => x.map((y) => y.textContent));
  check('13 FLOWS-11 the heavy card\'s report asks about heavy periods first, then her gaps', /periods are heavy/.test(q5[0] || '') && q5.slice(1).some((x) => /longer than 35 days/.test(x)), q5);
  errsAll.push(...r5.errs); await r5.ctx.close();
  /* FLOWS-12, PRIVACY-09: the Diary tour names the tab as it reads */
  const tr = await open({ seed: { events: cyc([28, 29, 28], 10) }, hash: '#diary' });
  await tr.page.evaluate(() => window.Saathi.startTour('diary')); await settle(tr.page, 600); await tap(tr.page, '#tour-next');
  check('13 FLOWS-12 the Diary tour\'s second tip names the tab: "Cycles" (Version 39.11)', /Cycles/.test(await txt(tr.page, '#tour-root #tour-h')), await txt(tr.page, '#tour-root #tour-h'));
  errsAll.push(...tr.errs); await tr.ctx.close();
  /* PRIVACY-03: on a shared phone with a PIN, the report asks for it too */
  const a3 = await open({ seed: { events: cyc([40, 29, 42, 30, 28, 29], 10), settings: { discreet: true, toursAuto: false, notify: true, pinHash: PINH('2468') } } });
  await unlock(a3.page, '2468'); await go(a3.page, 'report');
  check('13 PRIVACY-03 with a PIN, her report asks for it', await has(a3.page, '#view #pg-pad') && !(await has(a3.page, '#view .rp-table')));
  errsAll.push(...a3.errs); await a3.ctx.close();
  /* PRIVACY-04: a "call 112" row on My plan can call */
  const a4b = await open({ seed: Object.assign({}, PREG(14), { daily: { [ago(0)]: ['d_pbleed'] }, intake: { goal: 'food', stage: 'preg' }, mods: { plan: planOf('preg', 'food', ago(5)) } }) });
  await go(a4b.page, 'plan');
  check('13 PRIVACY-04 a "go now" row on My plan has its call button (Version 39.70: her ambulance, 102)', await has(a4b.page, '#view .pl-xp a[href="tel:102"]'));
  errsAll.push(...a4b.errs); await a4b.ctx.close();
  /* PRIVACY-06: with a PIN, the self-check doesn't show her PMOS diagnosis */
  const a6b = await open({ seed: { situation: { pcos: true }, events: cyc([40, 29, 42, 30, 28, 29], 10), settings: { toursAuto: false, notify: true, pinHash: PINH('2468') } } });
  await unlock(a6b.page, '2468'); await go(a6b.page, 'selfcheck-pmos');
  check('13 PRIVACY-06 with a PIN, the PMOS self-check hides her diagnosis', !(await has(a6b.page, '#view .sc-dx')) && /PMOS|PCOS/.test(await view(a6b.page)));
  errsAll.push(...a6b.errs); await a6b.ctx.close();
  /* PRIVACY-08, PRIVACY-10: at 360 px the Diary's three tabs fit, and "This month's signs" keeps its dot */
  const a8c = await open({ seed: { events: cyc([28, 29, 28], 10), situation: { pcos: true } }, w: 360, h: 800 });
  await go(a8c.page, 'diary');
  check('13 PRIVACY-08 at 360 px the Diary\'s three tabs fit', await a8c.page.evaluate(() => { const tb = document.querySelector('#view .tabs'); return !!tb && tb.scrollWidth <= tb.clientWidth + 1 && [...tb.querySelectorAll('button')].every((b) => b.getBoundingClientRect().right <= window.innerWidth + 1); }));
  await diaryShows(a8c.page);
  check('13 PRIVACY-10 "This month\'s signs" shows its not-done dot', await a8c.page.evaluate(() => { const d = document.querySelector('#view .wis-ci .rdot'); if (!d) return false; const r = d.getBoundingClientRect(); return r.width > 0 && r.height > 0; }));
  errsAll.push(...a8c.errs); await a8c.ctx.close();
}
check('12 no page errors (and in 13)', errsAll.length === 0, errsAll.slice(0, 5));

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(results.length - failed.length + '/' + results.length + ' checks passed');
if (failed.length) process.exit(1);
