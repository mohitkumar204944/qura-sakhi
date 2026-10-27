// Version 39.0: fix and protect (docs/roadmap-v39-2026-10-24.md, section 3; MODULE_API section 43). Mohit, 24 Oct: "yes to
// all four, start V39.0". This file checks:
//   1 the Iron tablets set-up reads normally (no text squeezed to a letter per line);
//   2 search: weight and food words don't bring up loss pages; loss pages still come when she asks;
//   3 For you: none on a shared phone (discreet mode); after a loss, the loss pages;
//   4 signals her records already hold reach Today: bleeding a year after the last one at 45+, the 12-month question,
//     pregnancy-log BP and Hb, the after-birth check's warning signs, headache and swelling in either order;
//   5 the stricter reviewed line wins: bleeding in pregnancy and "baby moving less" are "Call 112 now";
//   6 discreet mode shows that an urgent signal exists, in plain words, with call buttons or behind the PIN;
//   7 when a pregnancy ends: check-up reminders stop, a loss asks once about tablet reminders, a plan rests 6 weeks;
//   8 Help: a row for thoughts of harm; Tele-MANAS and 181 near the top of the numbers;
//   9 joining asks about the pill; Today never drops a tablet; a long plan folds into one row;
//  10 reminders show plain words on the phone unless she turns the words on;
//  11 small fixes: a claimed PMMVY ticks the plan, no kick-count step, no supplements card, "New this week" ends at 12
//     weeks, the Hindi word for energy, the pregnancy plan's settings line, discreet My plan with no plan;
//  12 Hindi, a 360 px screen, no page errors.
// Usage: node test/protect.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'protect'); fs.mkdirSync(SHOTS, { recursive: true });
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
const LOCAL = { app: '0.39.0-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start', pain: 'pain_1' }, { d: ago(x - 5), t: 'end' })); return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
const planOf = (pack, goal, start, extra) => Object.assign({ pack: pack, goalKey: goal, start: start, go: true, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'evening', bed: 'b23', work: 'day', log: {}, weeks: {}, body: [], doc: 'done' }, extra || {});
const PREG = (w) => ({ situation: { pregnant: true, pregnantSince: ago(w * 7) }, events: [] });
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

/* ---------- 1. Iron tablets set-up ---------- */
{
  const a = await open({ seed: { events: regular(10) }, hash: '#iron', w: 360, h: 800 });
  const m = await a.page.evaluate(() => { const els = [...document.querySelectorAll('#view .iron-plans .item .body')]; return { n: els.length, minW: Math.min(...els.map((e) => e.getBoundingClientRect().width)), screens: document.documentElement.scrollHeight / window.innerHeight }; });
  check('1 Iron tablets: every plan option has room for its words', m.n >= 3 && m.minW > 150, m);
  check('1 ... and the set-up is a normal length, not 13 screens', m.screens < 4, m);
  const thin = await a.page.evaluate(() => [...document.querySelectorAll('#view *')].filter((e) => { const r = e.getBoundingClientRect(); return e.children.length === 0 && (e.textContent || '').trim().length > 3 && r.width > 0 && r.width < 40 && r.height > 100; }).length);
  check('1 no text on the page is squeezed into a thin column', thin === 0, thin);
  await shot(a.page, 'iron-360'); errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 2. Search ---------- */
{
  const a = await open({ seed: {} });
  const wl = await search(a.page, 'weight loss');
  check('2 "weight loss" shows no pregnancy-loss page in its first results', !wl.slice(0, 5).some((r) => /loss|abortion/.test(r)), wl);
  const mc = await search(a.page, 'miscarriage');
  check('2 "miscarriage" still finds the loss pages first', /loss/.test(mc[0] || ''), mc);
  await a.ctx.close();
  const b = await open({ seed: PREG(14) });
  const g = await search(b.page, 'garbh me kya khaye');
  check('2 pregnant, "garbh me kya khaye": "Two or more miscarriages" is not near the top', g.slice(0, 5).indexOf('ttc-loss2') < 0, g);
  const wg = await search(b.page, 'weight gain');
  check('2 pregnant, "weight gain": no "Trying again" (after a loss) near the top', !wg.slice(0, 4).some((r) => /loss/.test(r)), wg);
  errsAll.push(...a.errs, ...b.errs); await b.ctx.close();
}

/* ---------- 3. For you ---------- */
{
  const a = await open({ seed: Object.assign({}, PREG(20), { settings: { discreet: true, toursAuto: false, notify: true } }), hash: '#care' });
  const t1 = await vtext(a.page);
  check('3 discreet mode: Explore has no For you naming her pregnancy', !(await has(a.page, '#view section.care-sec:first-of-type .tile')) || !/pregnan/i.test(t1.slice(0, 600)), t1.slice(0, 400));
  await a.ctx.close();
  const b = await open({ seed: { situation: { pregEndedOn: ago(10) }, events: regular(50) }, hash: '#care' });
  const fy = await b.page.$$eval('#view section.care-sec:first-of-type [data-go]', (x) => x.map((y) => y.dataset.go));
  check('3 after a loss, For you shows the loss pages', fy.length && fy.every((r) => /^loss/.test(r)), fy);
  errsAll.push(...b.errs); await b.ctx.close();
}

/* ---------- 4. Signals her records already hold ---------- */
{
  const a = await open({ seed: { dob: '1972-03-01', situation: { midlife: true }, events: [{ d: ago(480), t: 'start' }, { d: ago(475), t: 'end' }, { d: ago(420), t: 'start' }, { d: ago(416), t: 'end' }, { d: ago(2), t: 'start' }] } });
  const tc = await vtext(a.page);
  check('4 at 54, bleeding after 418 days without a period is "Bleeding after your periods stopped"', /Bleeding after your periods stopped/.test(tc), tc.slice(0, 700));
  check('4 ... at "see a doctor this week"', /See a doctor this week/.test(tc));
  await shot(a.page, 'postmeno-today'); await a.ctx.close();
  const b = await open({ seed: { dob: '1974-03-01', situation: { midlife: true }, events: [{ d: ago(400), t: 'start' }, { d: ago(395), t: 'end' }] } });
  const tb = await vtext(b.page);
  check('4 a year since her last period at 52: Today asks whether her periods have stopped', /A year since your last period/.test(tb), tb.slice(0, 600));
  await go(b.page, 'meno-timeline');
  check('4 ... the timeline asks once', await has(b.page, '#meno-stop-y'));
  await tap(b.page, '#meno-stop-y');
  const sb = await st(b.page);
  check('4 "Yes, they have stopped" records it, so any bleeding from now on is checked', sb.situation.stopped === true && !!sb.situation.stoppedOn && !!sb.prompts.stopAsk);
  await go(b.page, 'meno-timeline');
  check('4 ... and the question doesn\'t come back', !(await has(b.page, '#meno-stop-y')));
  errsAll.push(...a.errs, ...b.errs); await b.ctx.close();
  const c = await open({ seed: Object.assign({}, PREG(32), { mods: { preg: { bp: [{ id: 'b1', d: ago(1), s: 164, di: 112 }], hb: [], sug: [], w: [] } } }) });
  const tc2 = await vtext(c.page);
  check('4 pregnant, a BP of 164/112 yesterday: Today says to go to hospital now', /Your BP: 164\/112/.test(tc2) && /go to hospital now/.test(tc2), tc2.slice(0, 700));
  check('4 ... as an urgent card above the round buttons', await c.page.evaluate(() => { const u = document.querySelector('#view .xp-home-now'); const r = document.querySelector('#view .actions, #view .rbtns, #view [data-log]'); return !!u && (!r || u.getBoundingClientRect().top < r.getBoundingClientRect().top); }));
  await shot(c.page, 'preg-bp-today'); errsAll.push(...c.errs); await c.ctx.close();
  const d = await open({ seed: Object.assign({}, PREG(28), { mods: { preg: { bp: [], hb: [{ id: 'h1', d: ago(0), v: 6.4 }], sug: [], w: [] } } }) });
  const td = await vtext(d.page);
  check('4 pregnant, Hb 6.4 today: Today says see a doctor today', /Your Hb: 6\.4\s*See a doctor today/.test(td), td.slice(0, 600));
  await go(d.page, 'explain');
  check('4 ... and What your diary shows gives the logs\' own words', /Hb under 7: see a doctor today/.test(await vtext(d.page)));
  errsAll.push(...d.errs); await d.ctx.close();
  const e = await open({ seed: { situation: { deliveredOn: ago(9), breastfeeding: true }, events: [], mods: { post: { rec: { [ago(1)]: Object.assign({}, REC_OK, { danger: ['soak'] }) } } } } });
  const te = await vtext(e.page);
  check('4 after a birth, yesterday\'s "soaking a pad" in the recovery check is an urgent card on Today, with a call button', /Heavy bleeding/.test(te) && /get to hospital now/.test(te) && (await has(e.page, '#view .xp-home-now a[href="tel:112"]')), te.slice(0, 600));
  errsAll.push(...e.errs); await e.ctx.close();
  const f = await open({ seed: Object.assign({}, PREG(30), { daily: { [ago(2)]: ['d_headache'], [ago(1)]: ['d_swell'] } }) });
  check('4 pregnant, a headache one day and swelling the next: "Headache with swelling"', /Headache with swelling/.test(await vtext(f.page)));
  errsAll.push(...f.errs); await f.ctx.close();
}

/* ---------- 5. The stricter line ---------- */
{
  const a = await open({ seed: Object.assign({}, PREG(12), { daily: { [ago(0)]: ['d_pbleed'] } }) });
  const ta = await vtext(a.page);
  check('5 bleeding in pregnancy is "Call 112 now", leading with Help\'s line', /Call 112 now if in pregnancy: bleeding/.test(ta), ta.slice(0, 600));
  await a.ctx.close();
  const b = await open({ seed: PREG(31) });
  await b.page.evaluate(() => window.Saathi.openDay ? window.Saathi.openDay() : null); await settle(b.page, 300);
  if (!(await has(b.page, '[data-sym="d_moveless"]'))) { await b.page.evaluate(() => { const x = document.querySelector('[data-log="sym"], [data-plus], #plus'); if (x) x.click(); }); await settle(b.page, 300); }
  const chipAt31 = await b.page.evaluate(() => !!document.querySelector('[data-sym="d_moveless"]'));
  await b.page.evaluate(() => { const S = window.Saathi; const k = S.toISO(S.today()); S.state.daily[k] = (S.state.daily[k] || []).concat(['d_moveless']); S.save(); }); await go(b.page, 'home');
  const tb = await vtext(b.page);
  check('5 at 31 weeks, "Baby moving less" is "Call 112 now"', /Baby moving less than usual/.test(tb) && /Call 112 now/.test(tb), tb.slice(0, 600));
  errsAll.push(...a.errs, ...b.errs); await b.ctx.close();
  const c = await open({ seed: PREG(31), hash: '#diary' });
  await c.page.evaluate(() => { const b0 = [...document.querySelectorAll('#view button')].find((x) => /symptom/i.test(x.textContent)); if (b0) b0.click(); }); await settle(c.page, 300);
  const c31 = await has(c.page, '[data-sym="d_moveless"]');
  await c.ctx.close();
  const d = await open({ seed: PREG(20), hash: '#diary' });
  await d.page.evaluate(() => { const b0 = [...document.querySelectorAll('#view button')].find((x) => /symptom/i.test(x.textContent)); if (b0) b0.click(); }); await settle(d.page, 300);
  const c20 = await has(d.page, '[data-sym="d_moveless"]');
  check('5 the day sheet offers "Baby moving less" from 28 weeks, not before', (c31 || chipAt31) && !c20, { c31, chipAt31, c20 });
  await d.ctx.close();
}

/* ---------- 6. Discreet mode ---------- */
{
  const a = await open({ seed: Object.assign({}, PREG(12), { daily: { [ago(0)]: ['d_pbleed'] }, settings: { discreet: true, toursAuto: false, notify: true } }) });
  const ta = await vtext(a.page);
  check('6 discreet: bleeding in pregnancy shows "Something you noted needs help now"', /Something you noted needs help now/.test(ta), ta.slice(0, 500));
  check('6 ... with call buttons for 112, 108 and 102', (await a.page.$$eval('#view .disc-urg a[href^="tel:"]', (x) => x.map((y) => y.getAttribute('href')))).join() === 'tel:112,tel:108,tel:102');
  check('6 ... and no health word on Today', !/bleed|pregnan|garbh/i.test(ta), ta.match(/.{0,40}(bleed|pregnan).{0,30}/i));
  await shot(a.page, 'discreet-now'); errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: { events: [{ d: ago(40), t: 'start' }, { d: ago(35), t: 'end' }, { d: ago(5), t: 'start', pads: 'pads_4' }], settings: { discreet: true, toursAuto: false, notify: true, pinHash: null } } });
  const tb = await vtext(b.page);
  check('6 discreet: heavy flow shows "Something you noted needs a check"', /Something you noted needs a check/.test(tb), tb.slice(0, 500));
  await tap(b.page, '#view [data-disc-open]');
  check('6 ... and opens What your diary shows (no PIN set)', (await b.page.evaluate(() => location.hash)) === '#explain');
  errsAll.push(...b.errs); await b.ctx.close();
  const c = await open({ seed: { events: [{ d: ago(40), t: 'start' }, { d: ago(35), t: 'end' }, { d: ago(5), t: 'start', pads: 'pads_4' }], settings: { discreet: true, toursAuto: false, notify: true } } });
  await c.page.evaluate(() => { const S = window.Saathi; S.state.settings.pinHash = S.pinHashFor ? S.pinHashFor('1234') : 'x'; S.save(); S.render(); }); await settle(c.page, 300);
  await tap(c.page, '#view [data-disc-open]');
  check('6 with a PIN set, the check opens behind the PIN', (await has(c.page, '#pg-pad')) && !(await has(c.page, '#view .xp-card')));
  errsAll.push(...c.errs); await c.ctx.close();
}

/* ---------- 7. When a pregnancy ends ---------- */
{
  const rems = [{ id: 'preg-plan-anc2', mod: 'preg', title: { en: 'Due now: Second check-up', hi: 'अभी: दूसरी जाँच' }, dates: [ago(-3)], time: '09:00', on: true }, { id: 'preg-plan-pmsma', mod: 'preg', title: { en: 'PMSMA', hi: 'PMSMA' }, dates: [ago(-12)], time: '09:00', on: true }, { id: 'preg-ifa', mod: 'preg', title: { en: 'IFA tablet', hi: 'IFA गोली' }, every: 1, start: ago(30), time: '21:00', on: true }];
  const a = await open({ seed: Object.assign({}, PREG(10), { reminders: rems, mods: { plan: planOf('cycle', 'irregular', ago(100)) } }) });
  await go(a.page, 'pregnancy'); await a.page.$eval('#loss', (x) => x.click()); await settle(a.page, 300);   /* "The pregnancy ended" on the pregnancy page */
  check('7 "The pregnancy ended" ends the pregnancy', await a.page.evaluate(() => !window.Saathi.state.situation.pregnant && !!window.Saathi.state.situation.pregEndedOn));
  await go(a.page, 'home');
  const sa = await st(a.page);
  check('7 after a loss, the pregnancy plan\'s check-up and PMSMA reminders are gone', !(sa.reminders || []).some((r) => /^preg-plan-/.test(r.id)), (sa.reminders || []).map((r) => r.id));
  check('7 ... the tablet reminder stays until she answers', (sa.reminders || []).some((r) => r.id === 'preg-ifa'));
  const ta = await vtext(a.page);
  check('7 ... and Today asks once "Keep your tablet reminder?"', /Keep your tablet reminder\?/.test(ta), ta.slice(0, 600));
  await tap(a.page, '#tab-keep-n');
  const sa2 = await st(a.page);
  check('7 "Turn it off" removes the tablet reminders and the question', !(sa2.reminders || []).some((r) => r.id === 'preg-ifa') && !(sa2.prompts || {}).tabAsk);
  await go(a.page, 'plan');
  const pa = await vtext(a.page);
  check('7 after a loss, My plan rests: the loss pages and Help, and goals only when she asks', /Your plan is resting for now/.test(pa) && (await has(a.page, '#pl-loss-pick')) && !(await has(a.page, '[data-pl-pick]')), pa.slice(0, 400));
  await tap(a.page, '#pl-loss-pick');
  check('7 ... "Pick a goal when you\'re ready" shows the goals', await has(a.page, '[data-pl-pick]'));
  await go(a.page, 'home');
  const ha = await vtext(a.page);
  check('7 ... and her paused plan\'s steps aren\'t on Today', !/Your plan for today|done today/.test(ha) || !(await has(a.page, '#view .pl-th')), ha.slice(0, 500));
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: Object.assign({}, PREG(39), { reminders: rems }) });
  await b.page.evaluate(() => window.Saathi.openStage && window.Saathi.openStage('post')); await settle(b.page, 400);
  if (await has(b.page, '#st-birth')) { await b.page.fill('#st-birth', ago(1)); await tap(b.page, '#st-save'); }
  const sb = await st(b.page);
  check('7 after a birth, check-up reminders stop but the tablet reminder stays, and nothing asks about it', !!sb.situation.deliveredOn && !(sb.reminders || []).some((r) => /^preg-plan-/.test(r.id)) && (sb.reminders || []).some((r) => r.id === 'preg-ifa') && !(sb.prompts || {}).tabAsk, { d: sb.situation.deliveredOn, r: (sb.reminders || []).map((r) => r.id), p: sb.prompts });
  errsAll.push(...b.errs); await b.ctx.close();
}

/* ---------- 8. Help ---------- */
{
  const a = await open({ seed: {} });
  await a.page.evaluate(() => { const b = document.querySelector('.topbar [data-help], #help-btn, [data-go="help-sheet"], .help-btn'); if (b) b.click(); else if (window.Saathi.openHelpSheet) window.Saathi.openHelpSheet(); }); await settle(a.page, 300);
  if (!(await has(a.page, '#hs-harm'))) { await a.page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^\s*Help\s*$/.test(x.textContent)); if (b) b.click(); }); await settle(a.page, 300); }
  check('8 Help has a row for thoughts of harming myself or my baby', await has(a.page, '#hs-harm'));
  if (await has(a.page, '#hs-harm')) { await tap(a.page, '#hs-harm'); const nums = await a.page.$$eval('.sos-row .sos-n', (x) => x.map((y) => y.textContent.trim())); check('8 ... it gives Tele-MANAS and 112, nothing else to do', nums.indexOf('14416') >= 0 && nums.indexOf('112') >= 0 && nums.length <= 3, nums); }
  await a.page.evaluate(() => { const c = document.querySelector('.sheet-x, [data-close], .sheet .x'); if (c) c.click(); }); await settle(a.page, 200);
  await go(a.page, 'help'); await tap(a.page, '#sos-btn');
  const order = await a.page.$$eval('.sos-row .sos-n', (x) => x.map((y) => y.textContent.trim()));
  check('8 the emergency numbers put Tele-MANAS and 181 near the top', order[0] === '112' && order.indexOf('14416') <= 2 && order.indexOf('181') <= 4, order);
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 9. Joining, Today's list ---------- */
{
  const a = await open({ seed: null, hash: '#home' });
  /* Version 39.10: about you, her stage, her goals, then the details screen with her last period and the pill question */
  for (const s of ['[data-ob-lang="en"]', '#w-start', '[data-ob-dec="1990"]', '[data-ob-y="1999"]', '[data-ob-st="cycle"]', '[data-ob-goal="track"]', '#ob-next']) await tap(a.page, s);
  /* Version 39.26: the pill question comes first, her last periods (a calendar) under it; on the pill, "Since when?" instead */
  check('9 joining asks "I take the pill or another hormone medicine" with her last periods', await has(a.page, '#ob-pill') && await has(a.page, '[data-jd-day]') && await has(a.page, '#jd-none'));
  await a.page.$eval('#ob-pill', (x) => { x.checked = true; x.dispatchEvent(new Event('change', { bubbles: true })); });
  check('9 ... on the pill, "Since when have you taken it?" in place of dates', await has(a.page, '[data-ob-hfor="ge3"]') && !(await has(a.page, '[data-jd-day]')));
  await tap(a.page, '[data-ob-hfor="ge3"]');
  const ob = await a.page.evaluate(() => (window.Saathi.mem.ob || {}).pill);
  check('9 ... and remembers her answer', ob === true, ob);
  await tap(a.page, '#ob-next');
  if (await has(a.page, '[data-ob-sh]')) {
    await tap(a.page, '[data-ob-sh="me"]'); await settle(a.page, 400);
    await a.page.fill('#su-num', '9876543210'); await tap(a.page, '#su-send'); await a.page.fill('#su-code', '123456'); await settle(a.page, 900);
    if (await has(a.page, '#su-done')) { await a.page.fill('#su-name', 'Riya Sharma'); await a.page.fill('#su-pin', '302001'); await tap(a.page, '#su-done'); }
    await settle(a.page, 900);
  }
  const sa = await st(a.page);
  check('9 after joining, Sakhi knows she is on hormones (no false late-period or fertile cards)', sa.stage === 'app' && sa.situation.hormones === true, { stage: sa.stage, sit: sa.situation });
  errsAll.push(...a.errs); await a.ctx.close();
  const rem = [{ id: 'mine-1', mod: 'tools', kind: 'med', title: { en: 'Thyroid tablet', hi: 'थायरॉइड की गोली' }, every: 1, start: ago(10), time: '19:00', on: true }];
  const b = await open({ seed: { reminders: rem, mods: { plan: planOf('cycle', 'irregular', ago(3)), iron: { plan: 'weekly', start: ago(20), days: {} }, contra: { method: 'pill', start: ago(40), pill: { time: '21:00' } } } } });
  const rows = await b.page.$$eval('#view .today-card .today-it', (x) => x.map((y) => y.className + ' ' + y.textContent.slice(0, 40)));
  check('9 Today keeps her tablets and medicine reminders on a busy day', rows.some((r) => /today-rem-mine-1/.test(r)), rows);
  check('9 ... and keeps her plan\'s 4 steps as her checklist beside them (Version 39.14: never folded into one row)', rows.filter((r) => /today-plan-/.test(r)).length === 4 && !rows.some((r) => /today-plan-all/.test(r)), rows);
  errsAll.push(...b.errs); await b.ctx.close();
}

/* ---------- 10. Reminders on the phone's screen ---------- */
{
  const rem = [{ id: 'preg-ifa', mod: 'preg', title: { en: 'IFA tablet', hi: 'IFA गोली' }, every: 1, start: ago(5), time: '21:00', on: true }, { id: 'preg-plan-anc2', mod: 'preg', title: { en: 'Due now: Second check-up', hi: 'अभी: दूसरी जाँच' }, dates: [ago(-2)], time: '09:00', on: true }];
  const a = await open({ seed: Object.assign({}, PREG(20), { reminders: rem }) });
  await settle(a.page, 1500);
  const n1 = await a.page.evaluate(() => window.__sched.map((x) => x.body));
  check('10 by default the phone shows plain words: "Time for your tablet", not "IFA tablet"', n1.indexOf('Time for your tablet') >= 0 && !n1.some((b) => /IFA|check-up|pregnan/i.test(b)), n1.slice(0, 5));
  await go(a.page, 'me-reminders');
  check('10 Me > Reminders has a switch to show what each reminder is about', await has(a.page, '#me-notif-words'));
  await a.page.$eval('#me-notif-words', (x) => { x.checked = true; x.dispatchEvent(new Event('change', { bubbles: true })); }); await settle(a.page, 1500);
  const n2 = await a.page.evaluate(() => window.__sched.map((x) => x.body));
  check('10 ... with it on, the reminder says what it is', n2.some((b) => /IFA tablet/.test(b)), n2.slice(0, 5));
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 11. Small fixes ---------- */
{
  const a = await open({ seed: Object.assign({}, PREG(21), { mods: { access: { claims: { pmmvy: { started: ago(30), applied: ago(15), docs: {} } } } } }), hash: '#preg-plan' });
  const due = await a.page.evaluate(() => window.Saathi.preg.plan.due().map((x) => x.id));
  check('11 an applied PMMVY claim ticks "Scheme money" in the pregnancy plan', due.indexOf('scheme') < 0, due);
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: Object.assign({}, PREG(30), { mods: { plan: planOf('preg', 'food', ago(20)) } }) });
  const acts = await b.page.evaluate(() => (window.Saathi.plan.actions ? window.Saathi.plan.actions() : []).map((x) => x.id));
  check('11 the pregnancy plan has no kick-count step at 30 weeks', acts.indexOf('kicks') < 0, acts);
  await go(b.page, 'plan-settings');   /* Version 39.15: Plan settings is a page of its own */
  check('11 the pregnancy plan\'s settings say "Starts a new plan", not "a new 12 weeks"', /Starts a new plan/.test(await vtext(b.page)) && !/Starts a new 12 weeks/.test(await vtext(b.page)));
  errsAll.push(...b.errs); await b.ctx.close();
  const c = await open({ seed: { situation: { pcos: true }, mods: { plan: planOf('cycle', 'pmos', ago(40)) } }, hash: '#plan-progress' });
  check('11 no supplements or medicines card on My progress', !/supplement/i.test(await vtext(c.page)));
  errsAll.push(...c.errs); await c.ctx.close();
  const d = await open({ seed: { mods: { plan: planOf('cycle', 'irregular', ago(95), { keep: true }) } }, hash: '#plan' });
  check('11 after 12 weeks, "New this week" no longer sits on a habit', !/New this week/.test(await vtext(d.page)));
  errsAll.push(...d.errs); await d.ctx.close();
  const e = await open({ seed: { lang: 'hi', mods: { plan: planOf('cycle', 'irregular', ago(10)) } }, lang: 'hi' });
  const hi = await e.page.evaluate(() => window.Saathi.t('plan_rev_e') + ' | ' + window.Saathi.t('plan_prog_energy'));
  check('11 Hindi: energy is ऊर्जा, not ताक़त (which means strength)', /ऊर्जा/.test(hi) && !/ताक़त/.test(hi), hi);
  errsAll.push(...e.errs); await e.ctx.close();
  const f = await open({ seed: { settings: { discreet: true, toursAuto: false, notify: true } }, hash: '#plan' });
  const tf = await vtext(f.page);
  check('11 discreet, no plan: My plan shows "Pick a goal when you\'re ready" and no goal names', (await has(f.page, '#pl-disc-pick')) && !/PMOS|PCOS|Heavy periods|period/i.test(tf), tf.slice(0, 300));
  errsAll.push(...f.errs); await f.ctx.close();
  const g = await open({ seed: { events: [{ d: ago(150), t: 'start' }, { d: ago(145), t: 'end' }, { d: ago(102), t: 'start' }, { d: ago(97), t: 'end' }, { d: ago(55), t: 'start' }, { d: ago(50), t: 'end' }], mods: { plan: planOf('cycle', 'irregular', ago(20)) } } });
  const slot = await g.page.$eval('#view .slot', (x) => x.innerHTML).catch(() => '');
  check('11 a "see a doctor this month" signal comes first in "Sakhi says", ahead of her plan\'s cards', /data-xp-lv="month"/.test(slot.slice(0, slot.indexOf('slot-more') > 0 ? slot.indexOf('slot-more') : slot.length)), slot.slice(0, 300));
  errsAll.push(...g.errs); await g.ctx.close();
}

/* ---------- 13. The 24 Oct review of Version 39.0 (signals XS, privacy DP, flows life; each confirmed by a second agent) ---------- */
const PINH = (pin) => { let h = 2166136261; const str = 'sakhi:' + pin; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); };
const pinIn = async (page, pin) => { for (const k of pin) await tap(page, '#pg-pad [data-k="' + k + '"]'); await settle(page, 300); };
{
  /* DP-1: only tablets say "Time for your tablet" */
  const rem = [{ id: 'contra-antara', mod: 'contra', title: { en: 'Antara injection due', hi: 'अंतरा इंजेक्शन' }, kind: 'visit', dates: [ago(-2)], time: '10:00', on: true },
    { id: 'iron-test', mod: 'iron', title: { en: 'Ask for your repeat Hb test', hi: 'Hb टेस्ट' }, kind: 'checkup', dates: [ago(-3)], time: '10:00', on: true },
    { id: 'contra-pill', mod: 'contra', title: { en: 'Your pill', hi: 'गोली' }, kind: 'med', every: 1, start: ago(5), time: '21:00', on: true }];
  const a = await open({ seed: { reminders: rem } }); await settle(a.page, 1500);
  const by = await a.page.evaluate(() => Object.fromEntries(window.__sched.map((x) => [String(x.id).replace(/^r-/, '').replace(/-\d{4}-\d{2}-\d{2}.*$/, ''), x.body])));
  check('13 DP-1 an injection and a test reminder say "A reminder from Sakhi", a pill "Time for your tablet"', by['contra-antara'] === 'A reminder from Sakhi. Tap to see.' && by['iron-test'] === 'A reminder from Sakhi. Tap to see.' && by['contra-pill'] === 'Time for your tablet', by);
  await go(a.page, 'me-reminders');
  check('13 DP-9 the switch says her own reminders keep her words', /Reminders you wrote yourself keep your words/.test(await vtext(a.page)));
  errsAll.push(...a.errs); await a.ctx.close();
}
{
  /* DP-2, DP-10: on a shared phone with a PIN, What your diary shows asks for it however she gets there, with one title and Back */
  const a = await open({ seed: { events: [{ d: ago(40), t: 'start' }, { d: ago(35), t: 'end' }, { d: ago(5), t: 'start', pads: 'pads_4' }], settings: { discreet: true, toursAuto: false, notify: true, pinHash: PINH('2468') } } });
  for (const k of '2468') await tap(a.page, '#view [data-k="' + k + '"]');   /* the app's own lock first */
  await settle(a.page, 300); await go(a.page, 'explain');
  check('13 DP-2 #explain itself asks for the PIN', await has(a.page, '#view #pg-pad') && !(await has(a.page, '#view .xp-card')));
  check('13 DP-10 ... with one "Enter your PIN" and a Back button', ((await vtext(a.page)).match(/Enter your PIN/g) || []).length === 1 && await has(a.page, '#view [data-back]'), (await vtext(a.page)).slice(0, 200));
  await pinIn(a.page, '2468');
  check('13 DP-2 ... and the right PIN opens it', await has(a.page, '#view .xp-card'));
  errsAll.push(...a.errs); await a.ctx.close();
}
{
  /* DP-3 / life-8 and life-3: the tablet question on a shared phone names no tablet, and the pregnancy iron course is part of it */
  const rems = [{ id: 'preg-ifa', mod: 'preg', title: { en: 'IFA', hi: 'IFA' }, every: 1, start: ago(20), time: '21:00', on: true }];
  const a = await open({ seed: Object.assign({}, PREG(10), { reminders: rems, settings: { discreet: true, toursAuto: false, notify: true }, mods: { iron: { plan: 'preg', start: ago(20), remOn: true, time: '21:00', left: 14, log: {}, mig: 1 } } }) });
  await go(a.page, 'pregnancy'); await a.page.$eval('#loss', (x) => x.click()); await settle(a.page, 300); await go(a.page, 'home');
  const ta = await txt(a.page, '#view .tab-keep');
  check('13 DP-3 discreet: "Keep your daily reminder?" with no tablet named', /Keep your daily reminder\?/.test(ta) && !/iron|calcium|ASHA|IFA/i.test(ta), ta);
  await tap(a.page, '#tab-keep-n');
  const sa = await st(a.page);
  check('13 life-3 "Turn it off" turns off the Iron tablets course reminder too', !(sa.reminders || []).some((r) => r.id === 'iron' || r.id === 'preg-ifa') && sa.mods.iron.remOn === false, (sa.reminders || []).map((r) => r.id));
  errsAll.push(...a.errs); await a.ctx.close();
}
{
  /* DP-4: an urgent card a shared phone hides still gets the plain line, opening its own page */
  const a = await open({ seed: { mods: { contra: { method: 'antara', injLast: ago(130), since: ago(130), remOn: true } }, settings: { discreet: true, toursAuto: false, notify: true } } });
  const urgOpen = await a.page.$eval('#view .disc-urg[data-disc-open]', (b) => b.dataset.discOpen).catch(() => null);
  check('13 DP-4 discreet: a contraception method past its date shows "Something you noted needs a check"', !!urgOpen && urgOpen !== 'explain' && /Something you noted needs a check/.test(await vtext(a.page)), urgOpen);
  errsAll.push(...a.errs); await a.ctx.close();
}
{
  /* DP-5 / XS-5 and XS-4, XS-9: after a birth, thoughts of harm lead with Tele-MANAS; the check's own lead line comes first;
     today's check, when there is one, replaces yesterday's */
  const harm = Object.assign({}, REC_OK, { mood: 'harm' }); const faint = Object.assign({}, REC_OK, { danger: ['faint'] });
  const a = await open({ seed: { situation: { deliveredOn: ago(20), breastfeeding: true }, events: [], mods: { post: { rec: { [ago(0)]: harm } } } } });
  const hrefs = await a.page.$$eval('#view .xp-home-now a[href^="tel:"]', (x) => x.map((y) => y.getAttribute('href')));
  check('13 DP-5 thoughts of harm: Today\'s card calls 14416 first, then 112', hrefs.join() === 'tel:14416,tel:112', hrefs);
  await a.page.evaluate(() => { window.Saathi.state.settings.discreet = true; window.Saathi.save(); window.Saathi.render(); }); await settle(a.page, 400);
  const dh = await a.page.$$eval('#view .disc-urg a[href^="tel:"]', (x) => x.map((y) => y.getAttribute('href')));
  check('13 DP-5 ... and on a shared phone too', dh.join() === 'tel:14416,tel:112', dh);
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: { situation: { deliveredOn: ago(10), breastfeeding: true }, events: [], mods: { post: { rec: { [ago(0)]: faint } } } } });
  const fl = await b.page.evaluate(() => window.Saathi.post.flags().map((x) => x.see.en));
  check('13 XS-4 fainting after the birth leads with "Call 112 now, or go to the nearest hospital"', fl.some((x) => /^Call 112 now, or go to the nearest hospital\. Dizziness or fainting/.test(x)), fl);
  errsAll.push(...b.errs); await b.ctx.close();
  const c = await open({ seed: { situation: { deliveredOn: ago(10), breastfeeding: true }, events: [], mods: { post: { rec: { [ago(1)]: faint, [ago(0)]: REC_OK } } } } });
  check('13 XS-9 yesterday\'s warning goes once today\'s check says "None of these"', await c.page.evaluate(() => !window.Saathi.post.flags().length));
  errsAll.push(...c.errs); await c.ctx.close();
}
{
  /* DP-6 / XS-3: a monthly check-in's bleeding tick 40 days ago is "see a doctor today", not "call 112" */
  const a = await open({ seed: Object.assign({}, PREG(20), { checkins: { [ago(40).slice(0, 7)]: { chips: ['pbleed'], hot: 'hot_0', note: '', at: ago(40), kind: 'preg' } } }) });
  const f = await a.page.evaluate(() => window.Saathi.explain.findings().filter((x) => x.id === 'p_bleed').map((x) => x.lv));
  check('13 XS-3 an old check-in tick: "See a doctor today"', f.join() === 'today', f);
  errsAll.push(...a.errs); await a.ctx.close();
}
{
  /* DP-7, DP-8 / life-14: on a shared phone, one tap shows the goals, and only while she is on My plan */
  const a = await open({ seed: { situation: { pregEndedOn: ago(10) }, settings: { discreet: true, toursAuto: false, notify: true } } });
  await go(a.page, 'plan'); await tap(a.page, '#pl-loss-pick');
  check('13 DP-8 after a loss, one tap on "Pick a goal when you\'re ready" shows the goals', await has(a.page, '[data-pl-pick]'));
  await go(a.page, 'home'); await go(a.page, 'plan');
  check('13 DP-7 back on My plan later, the goals are hidden again', !(await has(a.page, '[data-pl-pick]')));
  errsAll.push(...a.errs); await a.ctx.close();
}
{
  /* XS-1: "Yes, they have stopped" keeps an open bleeding signal, and dates the stop to her last period */
  const ev = [{ d: ago(400), t: 'start' }, { d: ago(396), t: 'end' }, { d: ago(5), t: 'spot' }];
  const a = await open({ seed: { dob: '1974-03-01', situation: { midlife: true }, events: ev }, hash: '#meno-timeline' });
  check('13 XS-1 before she answers: "Bleeding after your periods stopped"', await a.page.evaluate(() => window.Saathi.explain.findings().some((x) => x.id === 'bleed_after_stop')));
  await tap(a.page, '#meno-stop-y');
  const s1 = await st(a.page);
  check('13 XS-1 "Yes, they have stopped": the stop is dated to her last period, and the bleeding card stays', s1.situation.stoppedOn === ago(396) && await a.page.evaluate(() => window.Saathi.explain.findings().some((x) => x.id === 'bleed_after_stop')), s1.situation.stoppedOn);
  errsAll.push(...a.errs); await a.ctx.close();
  /* XS-2: not on hormones, and not a first bleed after a birth */
  const b = await open({ seed: { dob: '1974-03-01', situation: { midlife: true, hormones: true, hormonesSince: ago(500) }, events: [{ d: ago(400), t: 'start' }, { d: ago(396), t: 'end' }, { d: ago(5), t: 'start' }] } });
  check('13 XS-2 on hormones at 52, a bleed after a year isn\'t "after your periods stopped"', await b.page.evaluate(() => !window.Saathi.explain.findings().some((x) => x.id === 'bleed_after_stop')));
  errsAll.push(...b.errs); await b.ctx.close();
  const c = await open({ seed: { dob: '1980-03-01', situation: { midlife: true, deliveredOn: ago(380) }, events: [{ d: ago(700), t: 'start' }, { d: ago(696), t: 'end' }, { d: ago(5), t: 'start' }] } });
  check('13 XS-2 ... nor her first period after a birth', await c.page.evaluate(() => !window.Saathi.explain.findings().some((x) => x.id === 'bleed_after_stop')));
  errsAll.push(...c.errs); await c.ctx.close();
}
{
  /* XS-6, XS-7: from 40, Today asks after 12 calendar months, and the card isn't folded away */
  const a = await open({ seed: { dob: '1984-03-01', events: [{ d: ago(380), t: 'start' }, { d: ago(376), t: 'end' }] } });
  check('13 XS-6 at 42, a year since her last period: Today asks, in the first place', /A year since your last period/.test(await txt(a.page, '#view .slot')) && !/A year since your last period/.test(await txt(a.page, '#view .slot-more')));
  errsAll.push(...a.errs); await a.ctx.close();
}
{
  /* life-1, life-4: after a loss, Today suggests no plan, but a plan she picks herself starts and runs */
  const a = await open({ seed: { situation: { pregEndedOn: ago(10) }, intake: { goal: 'pain' } } });
  check('13 life-4 after a loss, Today suggests no plan', await a.page.evaluate(() => !document.querySelector('#view .pl-rec')));
  await a.page.evaluate(() => { const S = window.Saathi; const d = S.data('plan'); d.next = { pack: 'pain', goalKey: 'pain', goal: 'cycles', focus: 'habits', level: 0, limits: { knees: false, back: false }, food: 'veg', remAt: '20:00', when: 'evening', intake: { goal: 'pain' }, at: S.toISO(S.today()) }; S.save(); });
  await go(a.page, 'plan');
  check('13 life-1 the plan she picked is offered, though she lost a pregnancy 10 days ago', await a.page.evaluate(() => window.Saathi.plan.pending()), await vtext(a.page).then((x) => x.slice(0, 300)));
  await a.page.evaluate(() => window.Saathi.plan.start('today', '20:00')); await go(a.page, 'plan');
  check('13 life-1 ... and once started it runs', await a.page.evaluate(() => window.Saathi.plan.running()));
  errsAll.push(...a.errs); await a.ctx.close();
}
{
  /* life-2: check-up reminders from a pregnancy that ended before Version 39.0 stop */
  const a = await open({ seed: { situation: { pregEndedOn: ago(60) }, reminders: [{ id: 'preg-plan-anc3', mod: 'preg', title: { en: 'Due now', hi: 'अभी' }, dates: [ago(-3)], time: '09:00', on: true }] } });
  await go(a.page, 'home');
  check('13 life-2 an old pregnancy\'s check-up reminder is gone', !((await st(a.page)).reminders || []).some((r) => /^preg-plan-/.test(r.id)));
  errsAll.push(...a.errs); await a.ctx.close();
}
{
  /* life-6: leaving "Pregnant" asks whether it ended; "by mistake" is not a loss */
  const a = await open({ seed: PREG(6) });
  await a.page.evaluate(() => window.Saathi.openStage('cycle')); await settle(a.page, 300);
  check('13 life-6 the stage sheet asks "Did your pregnancy end?"', /Did your pregnancy end\?/.test(await txt(a.page, '#sheet-root')));
  await tap(a.page, '#sheet-root [data-st-end="mistake"]'); await tap(a.page, '#sheet-root #st-save');
  const sa = await st(a.page);
  check('13 life-6 "No, I marked it by mistake": not pregnant, no loss weeks', !sa.situation.pregnant && !sa.situation.pregEndedOn, sa.situation);
  await go(a.page, 'care');
  check('13 life-6 ... and For you shows no loss pages', !(await a.page.$$eval('#view section.care-sec:first-of-type [data-go]', (x) => x.map((y) => y.dataset.go))).some((r) => /loss/.test(r)));
  errsAll.push(...a.errs); await a.ctx.close();
}
{
  /* life-7: a birth recorded after "My pregnancy ended" asks nothing about tablets */
  const rems = [{ id: 'preg-ifa', mod: 'preg', title: { en: 'IFA', hi: 'IFA' }, every: 1, start: ago(20), time: '21:00', on: true }];
  const a = await open({ seed: { situation: { pregEndedOn: ago(3), deliveredOn: ago(3) }, reminders: rems, prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3), tabAsk: ago(3) } } });
  check('13 life-7 after a birth, no "Keep your tablet reminder?"', !(await has(a.page, '#view .tab-keep')));
  errsAll.push(...a.errs); await a.ctx.close();
}
{
  /* life-9, life-10: search */
  const a = await open({ seed: { events: regular(10) } });
  const m = await search(a.page, 'miscarriages');
  check('13 life-9 "miscarriages" brings the loss pages first', /loss/.test(m[0] || ''), m.slice(0, 4));
  const s1 = await search(a.page, 'stitches');
  check('13 life-10 "stitches" doesn\'t lead with the itching page', !/intimate-check|itch/.test(s1[0] || ''), s1.slice(0, 4));
  const s2 = await search(a.page, 'sti');
  check('13 life-10 "sti" brings no loss pages', !s2.some((r) => /loss/.test(r)), s2.slice(0, 6));
  errsAll.push(...a.errs); await a.ctx.close();
}
{
  /* life-11: her own reminder never drops off Today */
  const rems = [{ id: 'mine', mod: 'tools', kind: 'custom', title: { en: 'Call Mum', hi: 'माँ को फ़ोन' }, every: 1, start: ago(5), time: '22:00', on: true }];
  const a = await open({ seed: Object.assign({}, PREG(20), { reminders: rems, mods: { plan: planOf('preg', 'food', ago(10)) }, reminders: rems.concat([{ id: 'preg-ifa', mod: 'preg', title: { en: 'IFA', hi: 'IFA' }, every: 1, start: ago(20), time: '21:00', on: true }]) }) });
  check('13 life-11 her own reminder stays on Today', /Call Mum/.test(await txt(a.page, '#view .today-card')), await txt(a.page, '#view .today-card'));
  errsAll.push(...a.errs); await a.ctx.close();
}
{
  /* life-12: a scheme claim from an earlier baby doesn't tick this pregnancy's plan */
  const a = await open({ seed: Object.assign({}, PREG(21), { mods: { access: { claims: { pmmvy: { started: ago(400), applied: ago(390), docs: {} } } } } }) });
  check('13 life-12 an earlier baby\'s PMMVY claim leaves "Scheme money" to do', await a.page.evaluate(() => window.Saathi.preg.plan.due().some((x) => x.id === 'scheme')));
  errsAll.push(...a.errs); await a.ctx.close();
}
{
  /* life-13: a birth date set on the After-birth page ends the pregnancy */
  const a = await open({ seed: PREG(39), hash: '#post' });
  if (await has(a.page, '#pst-birth')) { await a.page.fill('#pst-birth', ago(1)); await tap(a.page, '#pst-bset'); }
  const sa = await st(a.page);
  check('13 life-13 the After-birth page\'s birth date ends the pregnancy', !sa.situation.pregnant && sa.situation.deliveredOn === ago(1), sa.situation);
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 12. Hindi, 360 px, no errors ---------- */
{
  const a = await open({ seed: Object.assign({}, PREG(12), { lang: 'hi', daily: { [ago(0)]: ['d_pbleed'] } }), lang: 'hi', w: 360, h: 800 });
  const ta = await vtext(a.page);
  check('12 Hindi: bleeding in pregnancy leads with "अभी 112 पर कॉल करें"', /अभी 112 पर कॉल करें अगर गर्भ में/.test(ta), ta.slice(0, 400));
  check('12 360 px: no sideways scroll', await noScroll(a.page));
  errsAll.push(...a.errs); await a.ctx.close();
}
check('12 no page errors', errsAll.length === 0, errsAll.slice(0, 5));

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(results.length - failed.length + '/' + results.length + ' checks passed');
if (failed.length) process.exit(1);
