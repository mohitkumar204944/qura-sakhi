// Version 39.34: My pregnancy, version 2, safety first (Mohit, 29 Oct: "Proceed building with minimalist approach"; advice
// docs/pregnancy-plan-advice-2026-10-29.md; mockup canvas U54RRpvvHBVpAhBvPTcEgT; MODULE_API section 77). The pregnancy
// stage's plan opens version 2. This file checks:
//   1 starting: one new screen before her first step, "Before you start" (right now: Help's pregnancy line, a yes shows Help's
//     "Call 112 now" card; told by her doctor: her MCP card's marks, ticked as she ticked them there, and 2 lines of its own;
//     "Not sure"), the tier as she ticks, the government route's words, the summary, her ticks saved back to her MCP card,
//     and no new reminder;
//   2 her tier on Today: green (the light walk), amber (an easy 10 minutes), red (no walking target), twins red from 28
//     weeks, the pelvic floor from week 13 and day 4 (its page's pregnancy line), 3 steps or fewer on day 1, 4 at most;
//   3 a sign that doesn't wait: no walk that day, "A quick check" the next day (no "Nothing has changed"), her answers again;
//   4 her answers again at 14 and 28 weeks, "Nothing has changed", neutral words on a shared phone, My plan's settings row;
//   5 the check-in from 28 weeks: her baby's movements (never a count), less or not sure (the kick page's "get checked
//     today" line), none (Help's "Call 112 now" and the kick page's line), her walk held after it, sleeping on her side
//     tonight; not before 28 weeks, not on a shared phone;
//   6 "Baby moving less? Get help" on the pregnancy card from 24 weeks, for every pregnant woman (never on a shared phone);
//   7 every verified line word for word, from the pages they come from; 8 version 1 runs on for a woman on it;
//   9 Hindi at 360 px; 10 no page errors.
// Usage: node test/pregplan.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SRC = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const SHOTS = path.join(here, 'shots', 'pregplan'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 900)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-29';   /* a Thursday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm, day) => new Date((day || TODAY) + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.34-pilot', platform: 'android' };
/* pregnant `w` weeks today (her last period 7w + 3 days ago), with her doctor (or o.care) */
const sit = (w, o) => Object.assign({ pregnant: true, pregnantSince: ago(7 * w + 3), care: 'private' }, o || {});
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: sit(10), events: [], daily: {}, notes: {}, checkins: {}, goals: ['food'],
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30) }, mods: {}, reminders: [], intake: { goal: 'food', stage: 'preg' } }, x || {}, { settings: Object.assign({ toursAuto: false }, (x || {}).settings || {}) });
/* her saved answers, and a running My pregnancy (version 2) that started `startAgo` days ago (0: today, her day 1) */
const IK = (o) => Object.assign({ at: ago(1), stage: 'preg', goal: 'food', food: 'veg', milk: 'y', act: null, lim: [], pflags: [], psafeW: 10, pnow: null }, o || {});
const preg = (startAgo, o) => Object.assign({ pack: 'preg', goalKey: 'food', start: ago(startAgo), started: ago(startAgo), go: true, pv: 2, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: null, log: {}, weeks: {}, body: [], intake: IK() }, o || {});
const withPlan = (startAgo, o, seed) => Object.assign({}, seed || {}, { mods: Object.assign({ plan: preg(startAgo, o) }, (seed || {}).mods || {}), intake: (o && o.intake) || IK() });

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
  await page.clock.install({ time: o.now || at(o.hm || '10:00') });
  await page.goto(PAGE + '#' + (o.hash || 'home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, o.wait || 600);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (a, h) => { await a.page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(a.page, 500); };
const tap = async (a, sel) => { await a.page.waitForSelector(sel, { timeout: 8000, state: 'attached' }); await a.page.$eval(sel, (el) => el.click()); await settle(a.page, 400); };
const has = (a, sel) => a.page.$(sel).then((x) => !!x);
const txt = (a, sel) => a.page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const view = (a) => txt(a, '#view');
const st = (a) => a.page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const acts = (a) => a.page.evaluate(() => window.Saathi.plan.actions().map((x) => ({ id: x.id, kind: x.kind, title: x.title, sub: x.sub, go: x.go || null, priv: !!x.priv, mins: x.mins || null })));
const ids = async (a) => (await acts(a)).map((x) => x.id);
const noScroll = (a) => a.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = (a, name) => a.page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const KEYS = /\b(plan|preg|pregtools)_[a-z0-9_]+\b/;   /* a string key on screen is a missing translation */
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const tels = (a, sel) => a.page.$$eval(sel + ' a[href^="tel:"]', (xs) => xs.map((x) => x.getAttribute('href').slice(4)).join());
const LABELS = ['My doctor told me to rest, or not to exercise', 'Marked as a high-risk pregnancy', 'High BP', 'Severe anaemia (Hb under 7)', 'Twins or more', 'Sugar in pregnancy, or diabetes', 'Problems in an earlier pregnancy (bleeding, fits, high BP, loss)', 'Something else', 'Not sure about any of these'];
const S1C = 'In pregnancy: bleeding, leaking water, fever, severe headache or blurred vision, fits, swelling of face or hands, or the baby moving less after 28 weeks';   /* core's s1c, from the reviewed danger list (app.js DANGER) */
const K_TODAY = "Fewer or weaker movements than usual: call your hospital or doctor straight away and get checked today, even if it is the middle of the night. Don't wait until tomorrow, and don't go to sleep on it.";
const K_NOW = 'No movement at all, or the movements have stopped: go to hospital now. Free ambulance 108 or 102.';
const LV_NOW = 'Call 112, or 108 or 102 for a free ambulance, and go to the nearest district hospital or the hospital where you are registered. Do not wait to see if it settles.';
const SIDE = 'From 28 weeks, go to sleep on your side, left or right. A pillow under your belly and between your knees helps.';
const PF_P = 'Doing these in pregnancy lowers the chance of leaking urine late in pregnancy and after the birth.';
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/* her plan's answers on the next screens, then the reveal's cards to Start */
async function startFromSummary(a) {
  for (let i = 0; i < 4 && !(await has(a, '#pl-in-make')); i++) await tap(a, '#pl-in-next');
  await tap(a, '#pl-in-make'); await settle(a.page, 600);
  if (!/plan-reveal/.test(await a.page.evaluate(() => location.hash))) await go(a, 'plan-reveal');
  for (let i = 0; i < 8 && !(await has(a, '#pl-rv-go')); i++) await tap(a, '#pl-rv-next');
  await tap(a, '#pl-rv-go'); await settle(a.page, 800);
}

/* ---------- 1 starting ---------- */
{
  const a = await open({ seed: { mods: { preg: { mcp: { risk: { r_cs: true } } } } } });
  check('1 the pregnancy stage opens My pregnancy version 2: 4 screens (her goal, Before you start, her day, the summary)', (await a.page.evaluate(() => window.Saathi.plan.packFor('food', 'preg') + ':' + window.Saathi.plan.intake.count({ stage: 'preg', goal: 'food' }) + ':' + window.Saathi.plan.progs.list().find((x) => x.id === 'preg').ver)) === 'preg:4:2');
  await a.page.evaluate(() => window.Saathi.plan.offer('food')); await settle(a.page, 600);
  const v = await view(a);
  check('1 Before you start: its 2 questions, Help\'s own pregnancy line, her MCP card\'s marks and 2 lines of its own, "Not sure?"', new RegExp('^Before you start Two questions keep your plan safe for you\\. Your answers stay on this phone\\. Right now, do you have any of these\\? ' + esc(S1C) + ' None of these Yes, one of these Has your doctor told you any of these\\? ' + LABELS.map(esc).join(' ') + ' Not sure\\? Tick it\\. Sakhi keeps your walk easy until your doctor says\\. Your full plan ').test(v), v.slice(0, 900));
  check('1 an earlier C-section alone holds nothing, so it isn\'t asked; nothing ticked: green', !(await a.page.$$eval('[data-pl-ps]:checked', (xs) => xs.length)) && !/C-section/.test(v) && (await txt(a, '#pl-ps-tier')).indexOf('Your full plan A walk at a pace you can talk, growing over the weeks, with yoga for your stage of pregnancy on 2 days, the pelvic floor from week 13, and the step for your goal.') === 0);   /* Version 39.52: the yoga named */
  await tap(a, '[data-pl-pnow="y"]');
  check('1 "Yes, one of these": Help\'s "Call 112 now" card, word for word, with 112, 108 and 102, and no walk until she checks again', (await txt(a, '#pl-ps-now')) === 'Call 112 now ' + LV_NOW + ' Call 112 Call 108 Call 102 No walk until you check your answers again; your other steps stay. Sakhi asks you tomorrow.' && (await tels(a, '#pl-ps-now')) === '112,108,102', await txt(a, '#pl-ps-now'));
  await tap(a, '[data-pl-pnow="n"]');
  check('1 "None of these" takes the card away', (await txt(a, '#pl-ps-now')) === '');
  await a.page.$eval('[data-pl-ps="unsure"]', (c) => { c.checked = true; c.dispatchEvent(new Event('change')); }); await settle(a.page, 200);
  check('1 "Not sure": amber, an easy walk until her doctor says, and the question for her next check-up', (await txt(a, '#pl-ps-tier')) === 'Easy walking, until your doctor says An easy 10-minute walk, the pelvic floor from week 13, and the step for your goal. At your next check-up, ask: “Is it fine for me to exercise?”');
  await a.page.$eval('[data-pl-ps="r_bp"]', (c) => { c.checked = true; c.dispatchEvent(new Event('change')); }); await settle(a.page, 200);
  check('1 High BP: red, gentle days', /^Gentle days No walking target\. The pelvic floor from week 13 and the step for your goal stay\. Your doctor decides when you can do more\.$/.test(await txt(a, '#pl-ps-tier')));
  await a.page.$eval('[data-pl-ps="r_bp"]', (c) => { c.checked = false; c.dispatchEvent(new Event('change')); });
  await a.page.$eval('[data-pl-ps="unsure"]', (c) => { c.checked = false; c.dispatchEvent(new Event('change')); });
  await a.page.$eval('[data-pl-ps="r_gdm"]', (c) => { c.checked = true; c.dispatchEvent(new Event('change')); }); await settle(a.page, 200);
  await shot(a, 'before-you-start');
  await tap(a, '#pl-in-next');
  for (let i = 0; i < 3 && !(await has(a, '#pl-in-make')); i++) await tap(a, '#pl-in-next');
  const sv = await view(a);
  check('1 the summary: Before you start, as she answered', /Before you start Easy walking, until your doctor says Change/.test(sv), sv.slice(0, 600));
  await startFromSummary(a);
  const s = await st(a); const d = s.mods.plan || {};
  check('1 started: version 2, her ticks, the week she gave them, no sign that doesn\'t wait', d.pack === 'preg' && d.pv === 2 && JSON.stringify((d.intake || {}).pflags) === '["r_gdm"]' && d.intake.psafeW === 10 && !d.intake.pnow, { pv: d.pv, ik: d.intake });
  check('1 her ticks saved back to her MCP card (one home), the C-section mark she made there kept', JSON.stringify(Object.keys(((s.mods.preg || {}).mcp || {}).risk || {}).sort()) === '["r_cs","r_gdm"]', (s.mods.preg || {}).mcp);
  check('1 no new reminder: her check-in only (no walk nudge in pregnancy, her tablets ring from their own pages)', s.reminders.map((r) => r.id).join() === 'plan', s.reminders.map((r) => r.id));
  await done(a);
  const pre = await open({ seed: { mods: { preg: { mcp: { risk: { r_bp: true, r_age: true } } } } } });
  await pre.page.evaluate(() => window.Saathi.plan.offer('food')); await settle(pre.page, 600);
  check('1 her MCP card\'s marks come ticked (High BP), so red before she taps anything', (await pre.page.$$eval('[data-pl-ps]:checked', (xs) => xs.map((x) => x.dataset.plPs).join())) === 'r_bp' && /^Gentle days/.test(await txt(pre, '#pl-ps-tier')));
  await done(pre);
  const gv = await open({ seed: { situation: sit(10, { care: 'govt' }) } });
  await gv.page.evaluate(() => window.Saathi.plan.offer('food')); await settle(gv.page, 600);
  const gvv = await view(gv);
  check('1 a woman who picked government care: "your doctor or ANM"', /Has your doctor or ANM told you any of these\? My doctor or ANM told me to rest, or not to exercise/.test(gvv), gvv.slice(0, 500));
  await done(gv);
}

/* ---------- 2 her tier on Today ---------- */
{
  const g1 = await open({ seed: withPlan(0) });
  const x1 = await acts(g1);
  const mv1 = x1.find((x) => x.id === 'move');
  check('2 green, day 1 at 10 weeks: 3 steps or fewer, the light walk (10 minutes, at a pace she can talk), no pelvic floor yet', x1.length <= 3 && mv1 && mv1.title === 'Walk or move 10 minutes' && mv1.sub === 'Brisk: you can talk, but not sing' && !x1.some((x) => x.id === 'pf'), x1);
  await shot(g1, 'today-green-day1');
  await done(g1);
  const g16 = await open({ seed: withPlan(4, { intake: IK({ psafeW: 16 }) }, { situation: sit(16) }) });
  const x16 = await acts(g16); const pf = x16.find((x) => x.id === 'pf');
  check('2 green at 16 weeks, day 5: the pelvic floor joins (private, from its trainer), 4 steps at most', pf && pf.title === 'Pelvic floor · 1 set' && pf.priv && pf.go === 'post-pelvic' && x16.some((x) => x.id === 'move') && x16.length <= 4, x16);
  await go(g16, 'post-pelvic');
  check('2 the pelvic floor page: its own pregnancy line', (await view(g16)).indexOf(PF_P) >= 0);
  await done(g16);
  const am = await open({ seed: withPlan(4, { intake: IK({ psafeW: 16, pflags: ['r_gdm'] }) }, { situation: sit(16) }) });
  const xa = await acts(am); const mva = xa.find((x) => x.id === 'move');
  check('2 amber (sugar in pregnancy): an easy 10 minutes with its own line, and the pelvic floor', mva && mva.title === 'Walk or move 10 minutes' && mva.sub === 'Easy: slow, at a pace you can talk. Stop if you feel dizzy.' && xa.some((x) => x.id === 'pf'), xa);
  await done(am);
  const am8 = await open({ seed: withPlan(60, { intake: IK({ psafeW: 16, pflags: ['unsure'] }), log: Object.fromEntries(Array.from({ length: 60 }, (x, i) => [ago(i + 1), { min: 20, ck: {} }])) }, { situation: sit(24) }) });
  check('2 amber stays at 10 minutes, however many weeks she walks', ((await acts(am8)).find((x) => x.id === 'move') || {}).title === 'Walk or move 10 minutes', await acts(am8));
  await done(am8);
  const rd = await open({ seed: withPlan(4, { intake: IK({ psafeW: 16, pflags: ['r_bp'] }) }, { situation: sit(16) }) });
  const xr = await acts(rd);
  check('2 red (high BP): no walking target, the pelvic floor and her goal\'s step stay', !xr.some((x) => x.id === 'move') && xr.some((x) => x.id === 'pf') && xr.length >= 2, xr);
  await shot(rd, 'today-red');
  await done(rd);
  const tw = await open({ seed: withPlan(4, { intake: IK({ psafeW: 29, pflags: ['r_tw'] }) }, { situation: sit(20) }) });
  check('2 twins before 28 weeks: amber (an easy walk)', ((await acts(tw)).find((x) => x.id === 'move') || {}).sub === 'Easy: slow, at a pace you can talk. Stop if you feel dizzy.');
  await done(tw);
  const tw2 = await open({ seed: withPlan(4, { intake: IK({ psafeW: 29, pflags: ['r_tw'] }) }, { situation: sit(29) }) });
  check('2 twins from 28 weeks: red (no walking target)', !(await ids(tw2)).includes('move'), await acts(tw2));
  check('2 the plan\'s own maths: twins amber at 27, red at 28; Hb under 7 red; a C-section alone green', (await tw2.page.evaluate(() => { const T = window.Saathi.plan.psTier; return [T(['r_tw'], 27), T(['r_tw'], 28), T(['r_an'], 10), T([], 10)].join(); })) === 'amber,red,red,green');
  await done(tw2);
}

/* ---------- 3 a sign that doesn't wait ---------- */
{
  const n0 = await open({ seed: withPlan(4, { intake: IK({ psafeW: 16, pnow: TODAY }) }, { situation: sit(16) }) });
  check('3 the day she said yes: no walk, no card yet (she has just seen the call card)', !(await ids(n0)).includes('move') && !(await has(n0, '.pl-sl-psafe')), await ids(n0));
  await done(n0);
  const n1 = await open({ seed: withPlan(4, { intake: IK({ psafeW: 16, pnow: ago(1) }) }, { situation: sit(16) }) });
  const nv = await txt(n1, '.pl-sl-psafe');
  check('3 the next day: "A quick check" before her next walk, with no "Nothing has changed"', nv === 'A quick check You told Sakhi about a sign that doesn’t wait. Before your next walk, check your answers. Check my answers' && !(await ids(n1)).includes('move'), nv);
  await shot(n1, 'quick-check-now');
  await tap(n1, '.pl-sl-psafe [data-go="plan-psafe"]');
  check('3 Check my answers: the same 2 questions, her ticks kept', /^My safety answers Two questions keep your plan safe for you\./.test(await view(n1)) && (await n1.page.evaluate(() => location.hash)) === '#plan-psafe');
  await tap(n1, '[data-pl-pnow="n"]'); await tap(n1, '#pl-ps-save');
  const s1 = await st(n1);
  check('3 None of these, Save: her walk is back, the card gone, the week she answered in', !s1.mods.plan.intake.pnow && s1.mods.plan.intake.psafeW === 16 && (await ids(n1)).includes('move') && !(await has(n1, '.pl-sl-psafe')), s1.mods.plan.intake);
  await done(n1);
}

/* ---------- 4 her answers again at 14 and 28 weeks ---------- */
{
  const w14 = await open({ seed: withPlan(14, { intake: IK({ psafeW: 12 }) }, { situation: sit(14) }) });
  check('4 at 14 weeks: "A quick check", with "Nothing has changed"', (await txt(w14, '.pl-sl-psafe')) === 'A quick check Two questions, so your steps still fit you. Check my answers Nothing has changed');
  await tap(w14, '#pl-ps-same');
  check('4 "Nothing has changed": the card goes until 28 weeks', (await st(w14)).mods.plan.intake.psafeW === 14 && !(await has(w14, '.pl-sl-psafe')));
  await done(w14);
  const w29 = await open({ seed: withPlan(60, { intake: IK({ psafeW: 20 }) }, { situation: sit(29) }) });
  check('4 at 28 weeks: the check again', await has(w29, '.pl-sl-psafe'));
  await done(w29);
  const w20 = await open({ seed: withPlan(30, { intake: IK({ psafeW: 20 }) }, { situation: sit(20) }) });
  check('4 between the checks: no card', !(await has(w20, '.pl-sl-psafe')));
  await done(w20);
  const dsc = await open({ seed: withPlan(4, { intake: IK({ psafeW: 16, pnow: ago(1) }) }, { situation: sit(16), settings: { discreet: true } }) });
  check('4 on a shared phone the card shows in plain words (no sign named)', (await txt(dsc, '.pl-sl-psafe')) === 'A quick check Two questions, so your steps still fit you. Check my answers');
  await done(dsc);
  const set = await open({ seed: withPlan(4, { intake: IK({ psafeW: 16, pflags: ['r_gdm'] }) }, { situation: sit(16) }), hash: 'plan-settings' });
  check('4 My plan\'s settings: My safety answers, with her tier', /My safety answers Easy walking, until your doctor says/.test(await view(set)));
  await tap(set, '.pl-ps-set [data-go="plan-psafe"]');
  check('4 it opens her answers, ticked as she left them', (await set.page.$$eval('[data-pl-ps]:checked', (xs) => xs.map((x) => x.dataset.plPs).join())) === 'r_gdm');
  await done(set);
}

/* ---------- 5 the check-in from 28 weeks ---------- */
{
  const ci = async (w, o, seed) => { const a = await open({ seed: withPlan(o && o.ago != null ? o.ago : 60, { intake: IK({ psafeW: 30 }) }, Object.assign({ situation: sit(w) }, seed || {})), hm: '21:00', hash: 'plan-checkin' }); return a; };
  const answerAll = (a) => a.page.$$eval('[data-ci$=":d"]', (xs) => xs.forEach((x) => x.click()));
  const a = await ci(30);
  const v = await view(a);
  check('5 at 30 weeks: her baby\'s movements today, her baby\'s own pattern, never a number', /Your baby’s movements today Your baby’s own pattern, not a number\. As usual Less than usual Not sure Not felt any movement today/i.test(v), v.slice(0, 900));
  await tap(a, '[data-ci-mv="less"]');
  check('5 less than usual: the kick page\'s own line, with Call 108 and 112', (await txt(a, '#pl-ci-mvout')) === K_TODAY + ' Call 108 Call 112' && (await tels(a, '#pl-ci-mvout')) === '108,112', await txt(a, '#pl-ci-mvout'));
  await tap(a, '[data-ci-mv="none"]');
  check('5 no movement: Help\'s "Call 112 now" and the kick page\'s own line, with 112, 108 and 102', (await txt(a, '#pl-ci-mvout')) === 'Call 112 now ' + K_NOW + ' Call 112 Call 108 Call 102', await txt(a, '#pl-ci-mvout'));
  await shot(a, 'checkin-none');
  await tap(a, '[data-ci-mv="less"]');
  await answerAll(a); await settle(a.page, 300); await tap(a, '#pl-ci-save');
  const fb = await view(a); const s = await st(a);
  check('5 saved with "less": the line stays on the feedback, no sleep card, her walk held until she checks again', fb.indexOf(K_TODAY) >= 0 && fb.indexOf(SIDE) < 0 && s.mods.plan.log[TODAY].mv === 'less' && s.mods.plan.intake.pnow === TODAY, { fb: fb.slice(0, 600), mv: s.mods.plan.log[TODAY], ik: s.mods.plan.intake });
  await done(a);
  const u = await ci(30);
  await answerAll(u); await settle(u.page, 300); await tap(u, '[data-ci-mv="usual"]'); await tap(u, '#pl-ci-save');
  const fu = await view(u); const su = await st(u);
  check('5 saved with "As usual": tonight, sleeping on her side, the verified line; her walk stays', fu.toLowerCase().indexOf(('Tonight ' + SIDE).toLowerCase()) >= 0 && su.mods.plan.log[TODAY].mv === 'usual' && !su.mods.plan.intake.pnow, fu.slice(0, 700));
  await shot(u, 'checkin-usual');
  await done(u);
  const e = await ci(20);
  check('5 at 20 weeks: no movement question', !/Your baby’s movements today/i.test(await view(e)));
  await done(e);
  const ds = await ci(30, null, { settings: { discreet: true } });
  check('5 on a shared phone: no movement question', !/movements/i.test(await view(ds)));
  await done(ds);
}

/* ---------- 6 "Baby moving less? Get help" ---------- */
{
  const h24 = await open({ seed: { situation: sit(24) } });
  for (let i = 0; i < 4 && !(await has(h24, '.pg-less')); i++) await settle(h24.page, 500);   /* the pregnancy card comes a moment after Home */
  const b = await txt(h24, '.pg-less');
  check('6 from 24 weeks, for every pregnant woman (no plan needed): "Baby moving less? Get help" on her pregnancy card', b === 'Baby moving less? Get help' && (await h24.page.$eval('.pg-less', (x) => x.dataset.go)) === 'pregtools-kicks', b);
  await tap(h24, '.pg-less');
  const kv = await view(h24);
  check('6 it opens the kick page, with its 2 lines', kv.indexOf(K_NOW) >= 0 && kv.indexOf(K_TODAY) >= 0, kv.slice(0, 500));
  await done(h24);
  const h20 = await open({ seed: { situation: sit(20) } });
  check('6 not before 24 weeks', !(await has(h20, '.pg-less')));
  await done(h20);
  const hd = await open({ seed: { situation: sit(30), settings: { discreet: true } } });
  check('6 never on a shared phone', !(await has(hd, '.pg-less')));
  await done(hd);
}

/* ---------- 7 every verified line word for word ---------- */
{
  const a = await open({ seed: withPlan(0), wait: 300 });
  const L = await a.page.evaluate(() => { const S = window.Saathi; const r = {}; ['en', 'hi'].forEach((l) => { S.state.lang = l; r[l] = { side: S.t('plan_mv_side'), pf: S.t('plan_fb_pf'), s1c: S.t('s1c'), core: S.dangerLine ? (l === 'hi' ? 'गर्भ में: ' : 'In pregnancy: ') + S.dangerLine('preg', l) : '', kt: S.t('pregtools_k_today'), kn: S.t('pregtools_k_now') }; }); S.state.lang = 'en'; return r; });
  const preg = SRC('mods/preg.js'), post = SRC('mods/post.js'), app = SRC('app.js'), tools = SRC('mods/pregtools.js'), acc = SRC('mods/access.js');
  const inSrc = (s, x) => s.indexOf(x.replace(/'/g, "\\'")) >= 0 || s.indexOf(x) >= 0;
  check('7 sleeping on her side: the symptom guide\'s own line (English and Hindi)', L.en.side === SIDE && preg.indexOf("en: '" + SIDE + "', hi: '" + L.hi.side + "'") >= 0, L.hi.side);
  check('7 the pelvic floor\'s reason: the trainer\'s pregnancy line, its first sentence (English and Hindi)', L.en.pf === PF_P && post.indexOf("pf_p_preg: ['" + PF_P) >= 0 && post.indexOf("', '" + L.hi.pf) >= 0, L.hi.pf);
  check('7 the movements lines: the kick page\'s own (English and Hindi)', L.en.kt === K_TODAY && L.en.kn === K_NOW && inSrc(tools, L.hi.kt) && inSrc(tools, L.hi.kn));
  check('7 Right now: Help\'s pregnancy line; the call card: Help\'s own', L.en.s1c === S1C && L.en.s1c === L.en.core && L.hi.s1c === L.hi.core && app.indexOf("['the baby moving less after 28 weeks', ") >= 0 && acc.indexOf(LV_NOW) >= 0);
  await done(a);
}

/* ---------- 8 version 1 runs on ---------- */
{
  const v1 = await open({ seed: withPlan(30, { pv: 1, intake: IK({ psafeW: null, pflags: ['r_bp'] }) }, { situation: sit(16) }) });
  const x = await ids(v1);
  check('8 a woman on version 1 keeps it: no walk, no pelvic floor, no check card, her 2 steps', !x.includes('move') && !x.includes('pf') && x.length <= 2 && !(await has(v1, '.pl-sl-psafe')), x);
  await go(v1, 'plan-psafe');
  check('8 her answers page isn\'t hers: My plan instead', !/Before you start/.test(await view(v1)));
  await done(v1);
}

/* ---------- 9 Hindi at 360 px ---------- */
{
  const h = await open({ w: 360, seed: withPlan(4, { intake: IK({ psafeW: 16, pflags: ['r_gdm'] }) }, { lang: 'hi', situation: sit(16) }), hash: 'plan-psafe' });
  await tap(h, '[data-pl-pnow="y"]');
  const hv = await view(h);
  check('9 Hindi at 360 px: Before you start and the call card, no missing words, no side scroll', /^मेरे सुरक्षा वाले जवाब दो सवाल/.test(hv) && /क्या आपकी डॉक्टर ने आपको इनमें से कुछ बताया है\?/.test(hv) && /हल्का टहलना, जब तक आपकी डॉक्टर न कहें/.test(hv) && !KEYS.test(hv) && (await noScroll(h)), hv.slice(0, 700));
  await shot(h, 'hi-before-you-start');
  await done(h);
  const hc = await open({ w: 360, seed: withPlan(60, { intake: IK({ psafeW: 30 }) }, { lang: 'hi', situation: sit(30) }), hm: '21:00', hash: 'plan-checkin' });
  await tap(hc, '[data-ci-mv="none"]');
  const hcv = await view(hc);
  check('9 Hindi at 360 px: the movements question and the call card', /आज आपके बच्चे की हलचल/.test(hcv) && !KEYS.test(hcv) && (await noScroll(hc)), hcv.slice(0, 600));
  await done(hc);
}

check('10 no page errors', !errsAll.length, errsAll.slice(0, 5));
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' : 'PASSED ') + (results.length - failed.length) + '/' + results.length + ' (pregplan)');
process.exit(failed.length ? 1 : 0);
