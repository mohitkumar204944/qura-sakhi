// Version 39.6: results and the doctor loop (docs/roadmap-v39-2026-10-24.md, sections 2 and 3; journey audit P2-01, P2-03,
// P2-05, P2-06, P2-11, P2-13, P2-14; MODULE_API section 49). This file checks:
//   1 the end of 12 weeks: her result first (counts, no judging word), one card for everyone ("Show this page to a doctor",
//     free government doctor first), what next, details folded;  2 the month card is the month's summary;
//   3 "Keep it light": weekly look-backs to month 4, a month-4 results card, then monthly, closing at month 12;
//   4 a doctor path in every plan that needs one, from her answers (heavy and tired, pain on 4 days, PMS a lot) or her own
//     dates (months of trying);  5 "Yes, done": the diary's cards about the same thing rest; "What did the doctor say?"
//     where an answer has a home;  6 her report carries what she said, her result and her check;  7 the Qura doctor buttons
//     carry her plan as the topic;  8 the evening line and the look-back follow what she did;  9 her Hb below her report's
//     range;  10 a shared phone, Hindi, a 360 px screen, no page errors.
// Usage: node test/results.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'results'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-27';   /* a Tuesday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (day, hm) => new Date(new Date(TODAY + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ANDROID = 'window.__sched = []; window.SakhiAndroid = { schedule(j){ try { window.__sched = JSON.parse(j); } catch (e) {} return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.6-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start', pain: 'pain_1' }, { d: ago(x - 5), t: 'end' })); return out; };
/* her periods as gaps (oldest first), the latest start `last` days ago */
const cyc = (gaps, last) => { const ds = [last]; let x = last; for (let i = gaps.length - 1; i >= 0; i--) { x += gaps[i]; ds.unshift(x); } const out = []; ds.forEach((a) => out.push({ d: ago(a), t: 'start' }, { d: ago(a - 4), t: 'end' })); return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
const planOf = (pack, goal, start, extra) => Object.assign({ pack: pack, goalKey: goal, start: start, go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'evening', bed: 'b23', work: 'day', log: {}, weeks: {}, body: [] }, extra || {});
const REM = () => [{ id: 'plan', kind: 'plan', title: { en: 'How did today go? 1 minute', hi: 'आज कैसा रहा? 1 मिनट' }, time: '20:00', repeat: 'daily', on: true, start: ago(100) }];
const daily = (from, to, step) => { const l = {}; for (let i = from; i >= to; i--) l[ago(i)] = { ck: { [step || 'move']: 'd' }, min: 20 }; return l; };

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
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000, state: 'attached' }); await page.$eval(sel, (el) => el.click()); await settle(page, 300); };   /* attached: a card folded under "More from Sakhi" can still be tapped */
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText).catch(() => '');
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const sumOf = (page) => page.evaluate(() => JSON.stringify((window.Saathi.summaries() || []).filter((m) => m.mod === 'plan')));
const errsAll = [];

/* ---------- 1. The end of 12 weeks ---------- */
{
  const ev = cyc([45, 52, 30, 29], 5);   /* gaps before her plan 45 and 52; since 30 and 29 */
  const a = await open({ seed: { events: ev, intake: { goal: 'irregular', gap: 'g45' }, mods: { plan: planOf('cycle', 'irregular', ago(86), { log: daily(86, 10), intake: { goal: 'irregular', gap: 'g45' } }) } }, hash: '#plan-end' });   /* Version 39.27: her steps carry on; her results are their own page */
  const v = await view(a.page);
  const order = await a.page.evaluate(() => [...document.querySelectorAll('#view .pl-intro, #view .pl-head-res, #view .pl-end-doc, #view .pl-sec, #view details.pl-details')].map((e) => e.className.split(' ').find((c) => /^pl-/.test(c))));
  check('1 the end page: her days, her result, the card for everyone, what next, then the details', order.join() === 'pl-intro,pl-head-res,pl-end-doc,pl-sec,pl-details', order);
  check('1 her result is before and since, as counts (no judging word)', /Days between periods/.test(await txt(a.page, '#view .pl-head-res')) && /45/.test(await txt(a.page, '#view .pl-head-res')) && !/better|worse|improv/i.test(await txt(a.page, '#view .pl-head-res')), await txt(a.page, '#view .pl-head-res'));
  /* Version 39.28: on the doctor route (she hasn't said where she goes) a Qura doctor comes before the free government doctor */
  check('1 one card for everyone: "Show this page to a doctor", "Show my doctor", a Qura doctor, then the free government doctor', /Show this page to a doctor/.test(v) && (await a.page.$$eval('#view .pl-end-doc .btn', (x) => x.map((y) => y.dataset.go || 'ask'))).join() === 'report-show,ask,access-doctor', await a.page.$$eval('#view .pl-end-doc .btn', (x) => x.map((y) => y.dataset.go || 'ask')));
  check('1 no "If nothing has changed" judgement any more', !/If nothing has changed/.test(v));
  check('1 what next: her steps carry on, "Work on something else" or "Stop my plan" (Version 39.27, no gate); details folded', /Your steps carry on/.test(v) && !/Keep my habits/.test(v) && /Work on something else/.test(v) && /Stop my plan/.test(v) && await a.page.evaluate(() => !document.querySelector('#view details.pl-details').open));
  await shot(a.page, '01-end');
  await tap(a.page, '#view .pl-end-doc [data-go="report-show"]');
  check('1 "Show my doctor" opens the report she can show', (await a.page.evaluate(() => location.hash)) === '#report-show');
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 2. The month card is the month's summary ---------- */
{
  /* a diary with no card of its own, so the plan's month card leads Today */
  const a = await open({ seed: { events: regular(10), intake: { goal: 'irregular', gap: 'g45', skips: 'y' }, mods: { plan: planOf('cycle', 'irregular', ago(57), { log: Object.assign(daily(57, 30), daily(27, 20)), intake: { goal: 'irregular', gap: 'g45', skips: 'y' } }) } } });
  const m = await txt(a.page, '#view .pl-sl-m');
  check('2 month 2: her days this month against last month', /You followed your plan on \d+ days this month \(last month: \d+\)/.test(m), m);
  check('2 ... her result line', /Days between periods/.test(m), m);
  check('2 ... and her doctor check, still to do', /Your doctor check is still to do/.test(m), m);
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 3. Keep it light ---------- */
{
  const a = await open({ seed: { events: regular(10), intake: { goal: 'pain' }, reminders: REM(), mods: { plan: planOf('pain', 'pain', ago(86), { log: daily(86, 10) }) } }, hash: '#plan' });
  const s = await st(a.page);
  check('3 after week 12, Keep it light without a question (Version 39.27); the reminder runs 4 weeks past her last visit', s.mods.plan.keep === true && s.mods.plan.carried === TODAY && (s.reminders.find((r) => r.id === 'plan') || {}).until === iso(TODAY, 28), (s.reminders.find((r) => r.id === 'plan') || {}).until);
  check('3 ... her clock says "Keep it light"', /Keep it light/.test(await txt(a.page, '#view .pl-clock')), await txt(a.page, '#view .pl-clock'));
  errsAll.push(...a.errs); await a.ctx.close();
  /* week 15: a weekly look-back; week 19: none (one a month after month 4); week 21: the monthly one */
  const look = async (startAgo) => { const x = await open({ seed: { events: regular(10), intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(startAgo), { keep: true, log: daily(startAgo, 2) }) } }, hash: '#plan' }); const r = await has(x.page, '#view .pl-review'); errsAll.push(...x.errs); await x.ctx.close(); return r; };
  check('3 week 15: a weekly look-back', await look(14 * 7 + 1));
  check('3 week 19: no weekly look-back after month 4', !(await look(18 * 7 + 1)));
  check('3 week 21: the monthly look-back', await look(20 * 7 + 1));
  const b = await open({ seed: { events: regular(10), intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(16 * 7 + 1), { keep: true, log: daily(16 * 7 + 1, 2) }) } } });
  check('3 week 17: "Month 4: your results" on Today', /Month 4: your results/.test(await txt(b.page, '#view .pl-sl-m4')), await txt(b.page, '#view .today-card') + ' / ' + (await view(b.page)).slice(0, 300));
  await tap(b.page, '#view #pl-m4-go');
  check('3 ... it opens her results', (await b.page.evaluate(() => location.hash)) === '#plan-progress');
  errsAll.push(...b.errs); await b.ctx.close();
  const c = await open({ seed: { events: regular(10), intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(52 * 7 + 2), { keep: true }) } }, hash: '#plan' });
  check('3 month 12: "Your year is done"', /Your year is done/.test(await view(c.page)), (await view(c.page)).slice(0, 200));
  errsAll.push(...c.errs); await c.ctx.close();
}

/* ---------- 4. A doctor path in every plan that needs one ---------- */
{
  const docCard = async (pack, goal, ik, extra) => { const x = await open({ seed: Object.assign({ events: regular(10), intake: Object.assign({ goal: goal }, ik), mods: { plan: planOf(pack, goal, ago(4), { intake: Object.assign({ goal: goal }, ik) }) } }, extra || {}) }); const r = { t: await txt(x.page, '#view .pl-sl-doc'), go: await x.page.$$eval('#view .pl-sl-doc [data-go]', (y) => y.map((z) => z.dataset.go)) }; errsAll.push(...x.errs); await x.ctx.close(); return r; };
  const h = await docCard('heavy', 'heavy', { pads: 'p23', clots: 'n', tired: 'y' });
  check('4 heavy periods, often tired: "ask for an Hb test", with the anaemia page', /Hb test/.test(h.t) && h.go.indexOf('cond-anaemia') >= 0, h);
  const p = await docCard('pain', 'pain', { pain: 'pk', painDays: '4' });
  check('4 pain on 4 days or more: a doctor check, and "Check the signs" (the endometriosis self-check)', /4 days or more/.test(p.t) && p.go.indexOf('selfcheck-endo') >= 0, p);
  const m = await docCard('pms', 'pms', { pms: ['mood'], pmsLevel: 'lot' });
  check('4 PMS that affects her day a lot: a doctor can help, with the mood log', /a doctor can help/.test(m.t) && m.go.indexOf('periods-pms') >= 0, m);
  const n = await docCard('pms', 'pms', { pms: ['mood'], pmsLevel: 'little' });
  check('4 ... and no card when it affects her day a little', !n.t, n);
  /* trying: her own dates */
  const t1 = await open({ seed: { dob: '1994-05-01', situation: { planning: true }, intake: { goal: 'ready', stage: 'ttc' }, mods: { ttc: { since: ago(400) }, plan: planOf('ttc', 'ready', ago(20)) } } });
  const tt = await txt(t1.page, '#view .pl-sl-due');
  check('4 trying for 13 months: "Time for one doctor check", by her own dates', /Time for one doctor check/.test(tt) && /13 months/.test(tt), tt);
  await tap(t1.page, '#view #pl-due-not');
  check('4 ... "Not now" hides it for the month', !(await has(t1.page, '#view .pl-sl-due')));
  errsAll.push(...t1.errs); await t1.ctx.close();
  const t2 = await open({ seed: { dob: '1994-05-01', situation: { planning: true }, intake: { goal: 'ready', stage: 'ttc' }, mods: { ttc: { since: ago(100) }, plan: planOf('ttc', 'ready', ago(20)) } } });
  check('4 ... not at 3 months', !(await has(t2.page, '#view .pl-sl-due')));
  errsAll.push(...t2.errs); await t2.ctx.close();
}

/* ---------- 5. "Yes, done", and what the doctor said ---------- */
{
  const ev = cyc([45, 52, 47], 5);
  const a = await open({ seed: { events: ev, intake: { goal: 'irregular', gap: 'g45', skips: 'y' }, mods: { plan: planOf('cycle', 'irregular', ago(4), { intake: { goal: 'irregular', gap: 'g45', skips: 'y' } }) } } });
  const before = await a.page.evaluate(() => (window.Saathi.explain.top() || {}).id || null);
  await tap(a.page, '#view #pl-doc-yes');
  const after = await a.page.evaluate(() => (window.Saathi.explain.top() || {}).id || null);
  check('5 "Yes, done": the diary\'s gap card about the same check rests', /^gap_/.test(before || '') && !/^gap_/.test(after || ''), [before, after]);
  check('5 ... and Today asks "What did the doctor say?", only if she wants to say', /What did the doctor say\?/.test(await txt(a.page, '#view .pl-sl-said')) && /It stays on this phone/.test(await txt(a.page, '#view .pl-sl-said')));
  await tap(a.page, '#view [data-said="pmos"]');
  const s = await st(a.page);
  check('5 "It is PMOS (PCOS)" sets her PMOS line, as in Me, and her plan is "My PMOS plan"', s.situation.pcos === true && /My PMOS plan/i.test(await view(a.page)), s.situation);
  await go(a.page, 'plan-progress');
  check('5 her results say "You told Sakhi you had the doctor check"', /You told Sakhi you had the doctor check/.test(await view(a.page)));
  errsAll.push(...a.errs); await a.ctx.close();
  /* a late period of 90 days or more always shows */
  const b = await open({ seed: { events: cyc([30, 31], 95), intake: { goal: 'irregular', skips: 'y' }, mods: { plan: planOf('cycle', 'irregular', ago(4), { intake: { goal: 'irregular', skips: 'y' } }) } } });
  await tap(b.page, '#view #pl-doc-yes').catch(() => {});
  const lv = await b.page.evaluate(() => window.Saathi.explain.findings().filter((f) => f.id === 'late_now').map((f) => f.lv));
  const shown = await b.page.evaluate(() => (window.Saathi.explain.top() || {}).id || null);
  check('5 ... a period 90 days late still shows after "Yes, done"', lv.length && shown === 'late_now', [lv, shown]);
  errsAll.push(...b.errs); await b.ctx.close();
  /* heavy: "My Hb was low" opens her lab results to note it */
  const c = await open({ seed: { events: regular(10), intake: { goal: 'heavy', pads: 'p12' }, mods: { plan: planOf('heavy', 'heavy', ago(4), { intake: { goal: 'heavy', pads: 'p12' } }) } } });
  await tap(c.page, '#view #pl-doc-yes'); await tap(c.page, '#view [data-said="hb"]');
  check('5 heavy: "My Hb was low" opens her lab results', (await c.page.evaluate(() => location.hash)) === '#cond-labs');
  errsAll.push(...c.errs); await c.ctx.close();
}

/* ---------- 6. Her report carries what she said, her result and her check ---------- */
{
  const ev = cyc([45, 52, 30], 5);
  const a = await open({ seed: { events: ev, intake: { goal: 'irregular', gap: 'g45', skips: 'y' }, mods: { plan: planOf('cycle', 'irregular', ago(40), { intake: { goal: 'irregular', gap: 'g45', skips: 'y' } }) } } });
  const s1 = await sumOf(a.page);
  check('6 the report\'s plan section: what she said at the start, her result, and her doctor check (not done)', /At the start: /.test(s1) && /Days between periods/.test(s1) && /Doctor check at the start: not done yet/.test(s1), s1);
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 7. The Qura doctor buttons carry her plan as the topic ---------- */
{
  const a = await open({ seed: { events: regular(10), intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(10)) } }, hash: '#plan' });
  const ask = await a.page.$eval('#view .pl-care [data-ask]', (e) => e.dataset.ask).catch(() => '');
  check('7 My plan\'s care team: "A Qura doctor" opens the call form with "My plan (Easier periods): questions"', /My plan \(Easier periods\): questions/.test(ask), ask);
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 8. The evening line and the look-back follow what she did ---------- */
{
  const lines = [];
  for (const d of [9, 10]) {
    const a = await open({ seed: { events: regular(10), intake: { goal: 'pms' }, mods: { plan: planOf('pms', 'pms', ago(d)) } }, hash: '#plan-checkin', now: at(0, '20:30') });
    const ids = await a.page.$$eval('#view [data-ci$=":d"]', (x) => x.map((y) => y.dataset.ci));
    for (const k of ids) await tap(a.page, '#view [data-ci="' + k + '"]');
    await tap(a.page, '#view #pl-ci-save');
    lines.push((await txt(a.page, '#view #pl-ci-fb .pl-ci-why')) || (await txt(a.page, '#view #pl-ci-fb .lead')));   /* Version 39.12: her goal leads; the reason follows */
    errsAll.push(...a.errs); await a.ctx.close();
  }
  check('8 two evenings, the same steps done: two different lines', lines[0] && lines[1] && lines[0] !== lines[1], lines);
  const l = {}; for (let i = 13; i >= 7; i--) l[ago(i)] = { ck: { calm: 'd' } };
  const b = await open({ seed: { events: regular(10), intake: { goal: 'pms' }, mods: { plan: planOf('pms', 'pms', ago(13), { log: l, weeks: { 1: { e: 'low' } } }) } }, hash: '#plan' });
  const rv = await txt(b.page, '#view .pl-review');
  check('8 the look-back names her best step and, after a low-energy week, the tired tip', /Your best step: .*7 days/.test(rv) && /On tired days/.test(rv), rv);
  errsAll.push(...b.errs); await b.ctx.close();
}

/* ---------- 9. Her Hb below her report's range ---------- */
{
  const hbCard = async (lab, sd) => { const x = await open({ seed: Object.assign({ events: regular(10), mods: { cond: { labs: [Object.assign({ id: 'h1', k: 'hb', u: 'g/dL', d: ago(10) }, lab)] } } }, sd || {}) }); const f = await x.page.evaluate(() => window.Saathi.explain.findings().filter((y) => y.id === 'hb_low').map((y) => y.lv)); errsAll.push(...x.errs); await x.ctx.close(); return f; };
  check('9 Hb 9.5 with her report\'s range 12 to 15.5: "Your Hb was below your report\'s range", this month', (await hbCard({ v: 9.5, lo: 12, hi: 15.5 })).join() === 'month');
  check('9 ... Hb 6.5: this week', (await hbCard({ v: 6.5, lo: 12, hi: 15.5 })).join() === 'week');
  check('9 ... in g/L too (95 against 120)', (await hbCard({ v: 95, u: 'g/L', lo: 120, hi: 155 })).join() === 'month');
  check('9 ... no card within the range, without a printed range, or for a result over 6 months old', !(await hbCard({ v: 12.5, lo: 12, hi: 15.5 })).length && !(await hbCard({ v: 9.5, lo: '', hi: '' })).length && !(await hbCard({ v: 9.5, lo: 12, hi: 15.5, d: ago(200) })).length);
  check('9 ... and none in pregnancy (her pregnancy has its own Hb lines)', !(await hbCard({ v: 9.5, lo: 12, hi: 15.5 }, { situation: { pregnant: true, pregnantSince: ago(120) }, events: [] })).length);
  const y = await open({ seed: { events: regular(10), mods: { cond: { labs: [{ id: 'h1', k: 'hb', u: 'g/dL', d: ago(10), v: 9.5, lo: 12, hi: 15.5 }] } } } });
  check('9 the card reaches Today', /below your report’s range/.test(await txt(y.page, '#view')), (await view(y.page)).slice(0, 300));
  errsAll.push(...y.errs); await y.ctx.close();
}

/* ---------- 10. A shared phone, Hindi, a small screen ---------- */
{
  const ev = cyc([45, 52, 30, 29], 5);
  const a = await open({ seed: { events: ev, intake: { goal: 'irregular', gap: 'g45' }, mods: { plan: planOf('cycle', 'irregular', ago(86)) }, settings: { discreet: true, toursAuto: false, notify: true } }, hash: '#plan-end' });
  const v = await view(a.page);
  check('10 a shared phone: the end page has no result card and no Qura topic, but the card for everyone', !(await has(a.page, '#view .pl-head-res')) && !(await has(a.page, '#view .pl-end-doc [data-ask]')) && /Show this page to a doctor/.test(v));
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: { lang: 'hi', events: ev, intake: { goal: 'irregular', gap: 'g45' }, mods: { plan: planOf('cycle', 'irregular', ago(86)) } }, lang: 'hi', w: 360, h: 800, hash: '#plan-end' });
  const hv = await view(b.page);
  check('10 Hindi: "यह पेज डॉक्टर को दिखाएँ" and "डॉक्टर को दिखाएँ"', /यह पेज डॉक्टर को दिखाएँ/.test(hv) && /डॉक्टर को दिखाएँ/.test(hv), hv.slice(0, 300));
  check('10 360 px: no sideways scroll on the end page', await noScroll(b.page));
  await shot(b.page, '10-hindi-360');
  errsAll.push(...b.errs); await b.ctx.close();
}
/* ---------- 11. The 24 Oct review of V39.6 (MODULE_API 49.1): 20 findings confirmed, all fixed ---------- */
{
  /* SAFETY-01, DOCTOR-02: only the cycle plan's check stands in for "no period yet" */
  const late = [{ d: ago(75), t: 'start' }, { d: ago(70), t: 'end' }, { d: ago(45), t: 'start' }, { d: ago(40), t: 'end' }];
  const a = await open({ seed: { events: late, intake: { goal: 'pain', pain: 'stop' }, mods: { plan: planOf('pain', 'pain', ago(4), { intake: { stage: 'cycle', goal: 'pain', pain: 'stop' } }) } } });
  check('11 a pain plan\'s doctor card leaves "no period yet" on Today', /no period yet/i.test(await a.page.$eval('#view', (e) => e.textContent)));
  errsAll.push(...a.errs); await a.ctx.close();
  /* RESULTS-01, SAFETY-05: a kept plan counts to its year */
  const b = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(113), { keep: true, endSeen: ago(29), log: daily(113, 0) }) } } });
  check('11 month 4 of a kept plan counts every day she followed it (114, not 84)', /followed your plan on 114 days/.test(await b.page.$eval('#view', (e) => e.textContent)), (await b.page.$eval('#view .slot', (e) => e.textContent).catch(() => '')).slice(0, 300));
  errsAll.push(...b.errs); await b.ctx.close();
  const c = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(366), { keep: true, endSeen: ago(282), log: daily(366, 0) }) } } });
  check('11 Today at the end of her year: "Your year is done"', /Your year is done/.test(await txt(c.page, '#view .today-card')), await txt(c.page, '#view .today-card'));
  await go(c.page, 'plan');
  check('11 ... and the page counts the whole year: 364 of 364 days', /Your year is done/.test(await view(c.page)) && /You followed your plan on 364 of 364 days/.test(await view(c.page)), (await view(c.page)).slice(0, 300));
  check('11 ... with no "Keep my habits" after month 12', !(await has(c.page, '#view #pl-keep')));
  errsAll.push(...c.errs); await c.ctx.close();
  /* RESULTS-02: a plan kept before Version 39.6 gets its reminder's end */
  const d = await open({ seed: { intake: { goal: 'pain' }, reminders: [{ id: 'plan', mod: 'plan', kind: 'custom', every: 1, time: '20:00', on: true, until: null, start: ago(100) }], mods: { plan: planOf('pain', 'pain', ago(100), { keep: true, endSeen: ago(16) }) } } });
  await go(d.page, 'plan'); await go(d.page, 'home');
  const dr = (await st(d.page)).reminders.find((x) => x.id === 'plan');
  check('11 a reminder kept with no end (before V39.6) now has one: 4 weeks past her last visit (Version 39.27), never past month 12', dr && dr.until === iso(TODAY, 28) && dr.until < iso(ago(100), 52 * 7 - 1), dr);
  errsAll.push(...d.errs); await d.ctx.close();
  /* RESULTS-03, DOCTOR-04, SAFETY-02: a new plan starts with its own doctor check and month 4 */
  const e = await open({ seed: { intake: { goal: 'heavy', pads: 'p12' }, mods: { plan: planOf('heavy', 'heavy', ago(90), { doc: 'done', docAt: ago(85), docSaid: { k: 'hb', at: ago(84) }, m4Seen: ago(1), dueSeen: '2026-10' }) } } });
  await e.page.evaluate(() => { const S = window.Saathi; S.plan.startFromIntake({ stage: 'cycle', goal: 'irregular', gap: 'g60', skips: 'y', act: 0, bed: 'b23', work: 'day', when: 'evening', food: 'veg', lim: ['none'] }); S.plan.start('today', '20:00'); S.save(); });
  const ep = (await st(e.page)).mods.plan;
  check('11 a new plan doesn\'t carry the last plan\'s doctor answer or month-4 mark', !ep.docSaid && !ep.docAt && !ep.m4Seen && !ep.dueSeen && ep.goalKey === 'irregular', [ep.docSaid, ep.docAt, ep.m4Seen, ep.dueSeen]);
  errsAll.push(...e.errs); await e.ctx.close();
  /* RESULTS-05: no low-days result from no entries */
  const f = await open({ seed: { intake: { goal: 'pms' }, daily: {}, mods: { plan: planOf('pms', 'pms', ago(20)) } }, hash: '#plan-progress' });
  check('11 a PMS plan with nothing logged shows no "0 and 0" result', !/Low, anxious or irritable days/.test(await view(f.page)));
  errsAll.push(...f.errs); await f.ctx.close();
  /* RESULTS-06, DOCTOR-05: a "Yes, done" from before V39.6 (no date) */
  const g = await open({ seed: { intake: { goal: 'irregular', skips: 'y', gap: 'g60' }, mods: { plan: planOf('cycle', 'irregular', ago(30), { doc: 'done', intake: { stage: 'cycle', goal: 'irregular', skips: 'y', gap: 'g60' } }) } } });
  const gs = await sumOf(g.page);
  check('11 her report says she had the check, not "not done yet"', /You told Sakhi you had the doctor check\./.test(gs) && !/not done yet/.test(gs), gs.slice(0, 600));
  errsAll.push(...g.errs); await g.ctx.close();
  /* DOCTOR-03: after "My Hb was low", the Hb she noted for that check doesn't raise its own card */
  const labs = [{ id: 'r1', k: 'hb', v: 9.2, u: 'g/dL', d: ago(2), lo: 12, hi: 15 }];
  const h = await open({ seed: { intake: { goal: 'heavy', pads: 'p12' }, mods: { cond: { labs: labs }, plan: planOf('heavy', 'heavy', ago(20), { doc: 'done', docAt: ago(3), docSaid: { k: 'hb', at: ago(2) } }) } } });
  const h0 = await open({ seed: { mods: { cond: { labs: labs } } } });
  const ids = (pg) => pg.evaluate(() => window.Saathi.explain.findings().map((x) => x.id));
  check('11 the Hb result the doctor just told her about rests (without a plan answer it shows)', (await ids(h.page)).indexOf('hb_low') < 0 && (await ids(h0.page)).indexOf('hb_low') >= 0, [await ids(h.page), await ids(h0.page)]);
  errsAll.push(...h.errs, ...h0.errs); await h.ctx.close(); await h0.ctx.close();
  /* DOCTOR-09: "Time for one doctor check" only while she is trying */
  const tr = await open({ seed: { situation: { planning: false }, mods: { ttc: { since: ago(400) } } } });
  check('11 tryingNow is null once she has stopped trying', (await tr.page.evaluate(() => window.Saathi.ttc.tryingNow())) === null);
  errsAll.push(...tr.errs); await tr.ctx.close();
  /* DOCTOR-10, SAFETY-07: a tester build stores "My Hb was low" and stays */
  const k = await open({ config: { app: 'test-0.39' }, seed: { intake: { goal: 'heavy', pads: 'p12' }, mods: { plan: planOf('heavy', 'heavy', ago(10), { doc: 'done', docAt: ago(1), intake: { stage: 'cycle', goal: 'heavy', pads: 'p12' } }) } } });
  if (await has(k.page, '#view [data-said="hb"]')) { await tap(k.page, '#view [data-said="hb"]'); check('11 tester build: "My Hb was low" is stored and the page stays (no "Not in this version")', (await k.page.evaluate(() => location.hash)) !== '#cond-labs' && ((await st(k.page)).mods.plan.docSaid || {}).k === 'hb'); }
  else check('11 tester build: the "What did the doctor say?" card shows', false, await txt(k.page, '#view .slot'));
  errsAll.push(...k.errs); await k.ctx.close();
  /* DOCTOR-08: after day 21 the month card can still record the check */
  const m = await open({ seed: { intake: { goal: 'irregular', skips: 'y', gap: 'g60' }, mods: { plan: planOf('cycle', 'irregular', ago(28), { log: daily(28, 0), intake: { stage: 'cycle', goal: 'irregular', skips: 'y', gap: 'g60' } }) } } });
  check('11 the month card offers "Yes, done" while the doctor check is still to do', await has(m.page, '#view .pl-sl-m #pl-doc-yes'), await txt(m.page, '#view .slot'));
  errsAll.push(...m.errs); await m.ctx.close();
}
check('10 no page errors', errsAll.length === 0, errsAll.slice(0, 5));

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(results.length - failed.length + '/' + results.length + ' checks passed');
if (failed.length) process.exit(1);
