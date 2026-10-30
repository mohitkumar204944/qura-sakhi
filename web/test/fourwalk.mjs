// Version 39.47: the four-plan walk's gaps (Mohit, 30 Oct: "Do a proper walkthrough on how all four plans built works, is there
// any gaps or bugs", then "fix all 16"; the walk is test/fourplans-walk.mjs; MODULE_API section 90). This file checks:
//   1 her folic acid carries on into My pregnancy after "Yes, move me on" (its step first, its 9 pm reminder, not "Due now" too),
//     until 12 weeks;
//   2 a card leads Sakhi says on 3 days at most, then waits under "More from Sakhi" for 7 days (the 14-week quick check; after a
//     birth "Ready to move a little more?", so her method before sex starts again comes); her baby's danger signs always lead;
//   3 to day 41 after a birth the evening reminder says "Your recovery check", then "How did today go?";
//   4 a late period said one way: the test page counts as Today does;
//   5 after a birth, "Plan week {n} is done"; 6 the reveal says the Start card's check-in time; 7 the check-in never at her walk's
//     minute; 8 her Hb test waits for her visit (counted once done, no "Do it now"); 9 My plan's "Next week" never repeats this
//     week; 10 the recovery check takes 1 minute everywhere; 11 the walk of the first 2 weeks opens no recovery check;
//   12 "Your baby was born today"; 13 a shared phone: each hidden step its own place ("Your step 2"); 14 "Your Sakhi" says where
//     her plan starts; 15 free check-ups wait until 6 weeks after a birth; 16 the first 6 weeks' hero line; 17 no page errors.
// Usage: node test/fourwalk.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import { join } from './join.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'fourwalk'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 900)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-29';   /* a Thursday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm, day) => new Date((day || TODAY) + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.47-pilot', platform: 'android' };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1994-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: { care: 'private' }, events: [], daily: {}, notes: {}, checkins: {}, goals: [],
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30) }, mods: {}, reminders: [], intake: {} }, x || {}, { settings: Object.assign({ toursAuto: false }, (x || {}).settings || {}) });
const bridge = 'window.__calls = []; window.SakhiAndroid = { schedule(j) { __calls.push(["schedule", j]); return 0; }, cancelAll() {}, canNotify() { return true; }, askNotify() {}, ' +
  'canExactAlarms() { return true; }, askExactAlarms() {}, testNotify() {}, speak() { return true; }, stop() {}, voices() { return "[]"; }, copy() { return true; }, haptic() {}, setSecure() {}, ' +
  'setDisguise() {}, isDisguised() { return false; }, saveState() { return true; }, loadState() { return ""; } };';
const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 360, height: o.h || 800 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript(bridge);
  if (o.seed !== null) await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => (o.seed === null ? r.abort() : r.fulfill({ status: 200, contentType: 'application/json', body: '{}' })));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200))); page.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED|ERR_ABORTED|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
  await page.clock.install({ time: o.now || at(o.hm || '10:00') });
  await page.goto(PAGE + '#' + (o.hash || 'home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, o.wait || 700);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (a, h) => { await a.page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(a.page, 500); };
const tap = async (a, sel) => { await a.page.waitForSelector(sel, { timeout: 8000, state: 'attached' }); await a.page.$eval(sel, (el) => el.click()); await settle(a.page, 400); };
const has = (a, sel) => a.page.$(sel).then((x) => !!x);
const txt = (a, sel) => a.page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const view = (a) => txt(a, '#view');
const st = (a) => a.page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const ids = (a) => a.page.evaluate(() => window.Saathi.plan.actions().map((x) => x.id));
const rems = (a) => a.page.evaluate(() => window.Saathi.reminders.list().map((r) => ({ id: r.id, time: r.time, on: r.on !== false, en: r.title && r.title.en })));
const remOf = async (a, id) => (await rems(a)).find((r) => r.id === id) || null;
const first = (a) => a.page.$eval('#view section.slot', (s) => { const c = s.children[1]; return c && c.tagName !== 'DETAILS' ? c.className : ''; }).catch(() => '');
const moreHas = (a, cls) => a.page.$$eval('#view section.slot details.slot-more .' + cls, (x) => x.length).catch(() => 0);
const day = async (a, n, hm) => { await a.page.clock.setSystemTime(at(hm || '10:00', iso(TODAY, n))); await go(a, 'plan'); await go(a, 'home'); };
const shot = (a, name) => a.page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const dueLine = async (a) => { const v = await a.page.$eval('#view', (e) => e.innerText).catch(() => ''); const m = v.match(/Due now:[^\n]*/); return m ? m[0] : ''; };
/* her plan's own questions (answers she gave are kept), the reveal's cards, Start */
async function startFlow(a, goal) {
  for (let i = 0; i < 12; i++) {
    if ((await a.page.evaluate(() => location.hash)) === '#plan-reveal') break;
    if (await has(a, '#pl-in-make')) { await tap(a, '#pl-in-make'); continue; }
    if (await has(a, '[data-pl-goal]')) { await tap(a, (await has(a, '[data-pl-goal="' + goal + '"]')) ? '[data-pl-goal="' + goal + '"]' : '[data-pl-goal]'); continue; }
    if ((await has(a, '[data-pl-pnow]')) && !(await has(a, '[data-pl-pnow].on'))) await tap(a, '[data-pl-pnow="n"]');
    await a.page.evaluate(() => { document.querySelectorAll('#view .chips[role="group"]').forEach((g) => { const c = g.querySelectorAll('[data-pl-q]'); if (c.length && !g.querySelector('.on')) c[0].click(); }); }); await settle(a.page, 200);
    if (await has(a, '#pl-in-next')) await tap(a, '#pl-in-next'); else break;
  }
  return reveal(a, true);
}
async function reveal(a, startIt) {
  const cards = []; if ((await a.page.evaluate(() => location.hash)) !== '#plan-reveal') await go(a, 'plan-reveal');
  for (let i = 0; i < 9; i++) { cards.push({ v: await view(a), rem: await txt(a, '#view .pl-st-rem') }); if (await has(a, '#pl-rv-go')) break; await tap(a, '#pl-rv-next'); }
  if (startIt) { await tap(a, '#pl-rv-go'); await settle(a.page, 900); }
  return cards;
}
const PLAN = (pack, startAgo, o) => Object.assign({ pack: pack, goalKey: 'ready', start: ago(startAgo), started: ago(startAgo), go: true, pv: 2, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'evening', log: {}, weeks: {}, body: [], intake: {} }, o || {});
const REM = (startAgo, time) => ({ id: 'plan', mod: 'plan', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(startAgo), every: 1, time: time || '20:00', on: true, doneOn: null });
const followed = (from, to, o) => { const l = {}; for (let d = from; d <= to; d++) if (d % 7 !== 1) l[ago(d)] = Object.assign({ ci: 1, min: 20 }, o || {}); return l; };
const periods = (starts) => starts.flatMap((n) => [{ d: ago(n), t: 'start' }, { d: ago(n - 4), t: 'end' }]);
const TTCIK = { at: ago(62), stage: 'ttc', goal: 'ready', act: 0, food: 'veg', milk: 'y', lim: [], when: 'evening', bflags: [], trying: null, bmi: null, bset: 'std', bdoc: 'std' };
/* after a birth: born `born` days ago, her plan (version 2) started `startAgo` days ago */
const POST = (startAgo, o) => PLAN('post', startAgo, Object.assign({ goalKey: 'recovery', intake: { at: ago(startAgo + 1), stage: 'post', goal: 'recovery', food: 'veg', milk: 'y', lim: [] } }, o || {}));
const pseed = (born, startAgo, o, x) => Object.assign({ situation: Object.assign({ care: 'private', deliveredOn: ago(born), breastfeeding: true }, (x || {}).sit || {}), goals: ['recovery'], intake: { goal: 'recovery', stage: 'post' }, reminders: [REM(startAgo)], settings: { notify: true }, mods: { plan: POST(startAgo, o) } }, x || {});

/* ---------- 1 her folic acid carries on into My pregnancy, to 12 weeks ---------- */
{
  const s = { situation: { planning: true, care: 'private' }, goals: ['ready'], intake: TTCIK, events: periods([127, 99, 71, 43]), settings: { notify: true },
    mods: { plan: PLAN('ttc', 60, { intake: TTCIK, log: followed(1, 59, { ck: { folic: 'd' } }) }), ttc: { folic: { has: true, remSet: true } }, pregtest: { tests: [{ d: TODAY, r: 'pos' }] } },
    reminders: [REM(60), { id: 'ttc-folic', mod: 'ttc', kind: 'med', title: { en: 'My folic acid tablet', hi: 'मेरी folic acid की गोली' }, start: ago(59), every: 1, time: '21:00', on: true, doneOn: null }] };
  const a = await open({ seed: s });
  check('1 Getting ready, day 61, her test positive: "Yes, move me on"', await has(a, '#pl-pos-yes'));
  await tap(a, '#pl-pos-yes'); await go(a, 'home');
  check('1 moved on, before My pregnancy starts: her tablet still rings, and "Due now" doesn\'t name it', !!(await remOf(a, 'ttc-folic')) && !/Folic acid/.test(await dueLine(a)), [await dueLine(a), await rems(a)]);
  await tap(a, '#pl-chg-go'); const cards = await startFlow(a, 'food');
  const sc = (cards.find((c) => /Your \d steps/.test(c.v)) || {}).v || '';
  check('1 the reveal: her tablet first of her steps ("Your 4 steps · Every day: My folic acid tablet")', /Your 4 steps Every day: My folic acid tablet/.test(sc), sc.slice(0, 300));
  await go(a, 'home');
  const p = (await st(a)).mods.plan;
  check('1 My pregnancy (version 2) runs, her tablet its first step, its 9 pm reminder on', p.pack === 'preg' && p.pv === 2 && (await ids(a))[0] === 'folic' && ((await remOf(a, 'ttc-folic')) || {}).time === '21:00', [p.pack, await ids(a), await rems(a)]);
  check('1 ... and her check-ups don\'t say "Due now: Folic acid" (one home for her tablet)', !/Folic acid/.test(await dueLine(a)) && /Due now/.test(await dueLine(a)), await dueLine(a));
  await shot(a, '1-preg-folic');
  await day(a, 42);   /* 12 weeks */
  check('1 at 12 weeks: the tablet step and its reminder end', (await ids(a)).indexOf('folic') < 0 && !(await remOf(a, 'ttc-folic')), [await ids(a), await rems(a)]);
  await done(a);
  /* a pregnancy that didn't come after Getting ready has no tablet step */
  const b = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(45), care: 'private' }, goals: ['food'], mods: { plan: PLAN('preg', 3, { goalKey: 'food', intake: { stage: 'preg', goal: 'food', pflags: [], psafeW: 6, pnow: null } }) }, reminders: [REM(3)], settings: { notify: true } } });
  check('1 a pregnancy plan on its own: no tablet step, folic acid in her check-ups', (await ids(b)).indexOf('folic') < 0 && /Folic acid/.test(await dueLine(b)), [await ids(b), await dueLine(b)]);
  await done(b);
}

/* ---------- 2 a card leads Sakhi says on 3 days at most; a card that keeps her safe always leads ---------- */
{
  const ik = { at: ago(32), stage: 'preg', goal: 'food', food: 'veg', milk: 'y', lim: [], pflags: [], psafeW: 10, pnow: null };
  const a = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(7 * 14 + 2), care: 'private' }, goals: ['food'], mods: { plan: PLAN('preg', 31, { goalKey: 'food', intake: ik, log: followed(1, 30) }) }, reminders: [REM(31)], settings: { notify: true } } });
  const seen = [await first(a)]; for (let n = 1; n <= 3; n++) { await day(a, n); seen.push(await first(a)); }
  check('2 14 weeks: "A quick check" leads Sakhi says on 3 days', seen.slice(0, 3).every((c) => /pl-sl-psafe/.test(c)), seen);
  check('2 ... then on the 4th it waits under "More from Sakhi", and another card leads', !/pl-sl-psafe/.test(seen[3]) && !!seen[3] && (await moreHas(a, 'pl-sl-psafe')) === 1, [seen[3], await moreHas(a, 'pl-sl-psafe')]);
  await shot(a, '2-quick-check-aside');
  await day(a, 10);
  check('2 ... and after 7 days it leads again', /pl-sl-psafe/.test(await first(a)), await first(a));
  await done(a);
  /* after a birth: "Ready to move a little more?" (day 42) steps aside, so her method before sex starts again comes */
  const b = await open({ seed: pseed(45, 42, { log: followed(1, 41) }) });
  const sb = [await first(b)]; for (let n = 1; n <= 3; n++) { await day(b, n); sb.push(await first(b)); }
  check('2 after a birth, day 45: "Ready to move a little more?" leads on 3 days', sb.slice(0, 3).every((c) => /pl-p2-un/.test(c)), sb);
  await day(b, 3); await go(b, 'plan'); await go(b, 'home');
  check('2 ... then her method before sex starts again leads ("Before sex starts again")', /pl-p2-contra/.test(await first(b)) && /Before sex starts again/.test(await txt(b, '#view section.slot')), [await first(b), (await txt(b, '#view section.slot')).slice(0, 200)]);
  await done(b);
  /* her baby's danger signs (week 1) always lead */
  const c = await open({ seed: pseed(1, 0) });
  const sc2 = [await first(c)]; for (let n = 1; n <= 4; n++) { await day(c, n); sc2.push(await first(c)); }
  check('2 her baby\'s danger signs lead on every day of week 1 (a card that keeps her safe)', sc2.every((x) => /pl-p2-nb/.test(x)), sc2);
  await done(c);
}

/* ---------- 3 the evening reminder says what her evening is ---------- */
{
  const a = await open({ seed: pseed(3, 0) });
  check('3 to day 41 after a birth: "Your recovery check · 1 minute"', ((await remOf(a, 'plan')) || {}).en === 'Your recovery check · 1 minute', await remOf(a, 'plan'));
  await settle(a.page, 1200);
  const bodies = await a.page.evaluate(() => { const s = (window.__calls || []).filter((c) => c[0] === 'schedule'); return s.length ? JSON.parse(s[s.length - 1][1]).filter((x) => /^r-plan-\d/.test(x.id)).map((x) => x.body) : []; });
  check('3 ... and that is what her phone says', bodies.length > 0 && bodies.every((x) => x === 'Your recovery check · 1 minute'), bodies.slice(0, 3));
  await day(a, 39);   /* day 42 after the birth */
  check('3 from day 42: "How did today go? 1 minute"', ((await remOf(a, 'plan')) || {}).en === 'How did today go? 1 minute', await remOf(a, 'plan'));
  await done(a);
}

/* ---------- 4 a late period said one way ---------- */
{
  const a = await open({ seed: { situation: { care: 'private' }, goals: ['track'], events: periods([127, 99, 71, 43]) } });
  const n1 = ((await view(a)).match(/(?:Your period is (\d+) days late|(\d+) days past your likely range)/) || []).slice(1).find(Boolean);   /* Today's words, with a plan or without */
  await go(a, 'pregtest-when');
  const n2 = ((await view(a)).match(/Your period is (\d+) days late/) || [])[1];
  check('4 Today and "When can I test?" say the same number of days late', !!n1 && n1 === n2, [n1, n2]);
  await done(a);
}

/* ---------- 5 after a birth, "Plan week {n} is done" ---------- */
{
  const a = await open({ seed: pseed(17, 14, { log: followed(1, 14) }) });
  const t1 = await view(a); await go(a, 'plan'); const t2 = await view(a);
  check('5 after a birth, the look-back says "Plan week 2 is done" (her weeks count from the birth)', /Plan week 2 is done/.test(t1 + ' ' + t2) && !/(^|[^n] )Week 2 is done/.test(t1 + ' ' + t2), (t1 + ' || ' + t2).slice(0, 900));
  await done(a);
}

/* ---------- 6 and 7 the evening's times: the reveal as the Start card, never at her walk's minute ---------- */
{
  const pm = { situation: { care: 'private', pcos: true }, goals: ['pmos'], events: periods([120, 78, 36]), intake: { goal: 'pmos', stage: 'cycle' }, settings: { notify: true } };
  const ans = { stage: 'cycle', goal: 'pmos', gap: 'g45', skips: 'n', signs: ['none'], act: '0', food: 'veg', milk: 'y', lim: [], work: 'day', when: 'dinner' };
  const a = await open({ seed: pm });
  await a.page.evaluate((x) => window.Saathi.plan.startFromIntake(x), Object.assign({ bed: 'b24' }, ans)); await settle(a.page, 300);
  const cards = await reveal(a, false); const days = (cards.find((c) => /How each day works/.test(c.v)) || {}).v || ''; const last = cards[cards.length - 1];
  check('6 the reveal says the check-in time the Start card gives her (10 pm, after her 9:15 pm walk)', /At 10 pm, Sakhi asks/.test(days) && /your 9:15 pm walk, your 10 pm check-in/.test(last.rem), [days.slice(0, 300), last.rem]);
  await done(a);
  const b = await open({ seed: pm });
  await b.page.evaluate((x) => window.Saathi.plan.startFromIntake(x), Object.assign({ bed: 'b22' }, ans)); await settle(b.page, 300);
  const cb = await reveal(b, true);
  check('7 in bed by 10 pm with a 9:15 pm walk: the check-in at 9:30 pm, after it (never the same minute)', /your 9:15 pm walk,? (and )?your 9:30 pm check-in/.test(cb[cb.length - 1].rem) && ((await remOf(b, 'plan')) || {}).time === '21:30' && ((await remOf(b, 'plan-nudge')) || {}).time === '21:15', [cb[cb.length - 1].rem, await rems(b)]);
  await done(b);
}

/* ---------- 8, 9 and 13 Getting ready: her Hb test waits for her visit; "Next week"; a shared phone ---------- */
{
  const s = (startAgo, x) => Object.assign({ situation: { planning: true, care: 'private' }, goals: ['ready'], intake: TTCIK, events: periods([66, 38, 10]), mods: { plan: PLAN('ttc', startAgo, { intake: TTCIK, log: followed(1, startAgo) }) }, reminders: [REM(startAgo)], settings: { notify: true } }, x || {});
  const a = await open({ seed: s(7) });
  const v = await view(a);
  check('8 Getting ready, day 8: her Hb test is there, not counted until done ("0 of 3")', (await ids(a)).indexOf('hb') >= 0 && /0 of 3 done today/.test(v), [await ids(a), v.slice(0, 500)]);
  await a.page.clock.setSystemTime(at('21:00')); await go(a, 'plan-checkin');
  check('8 ... and the evening check-in never asks "Do it now" for a blood test', !(await has(a, '#view .pl-ci-row [data-go="ttc-prep"]')) && !/Haemoglobin \(Hb\) test Do it now/.test(await view(a)), (await view(a)).slice(0, 500));
  await done(a);
  const b = await open({ seed: s(28) }); await go(b, 'plan');
  const dds = await b.page.$$eval('#view .pl-kv dd', (xs) => xs.map((x) => x.textContent.trim()));
  check('9 week 5: My plan\'s "Next week" never says this week\'s line again', dds.length >= 1 && new Set(dds).size === dds.length, dds);
  await done(b);
  const c = await open({ seed: s(7, { settings: { notify: true, discreet: true } }) });
  const card = await txt(c, '#view .card.pl-today, #view .today-card');
  const n0 = ((await view(c)).match(/Your plan for today/g) || []).length;
  check('13 a shared phone: two hidden steps, each its own place ("Your step 2", "Your step 4"), never the same words twice', /Your step 2/.test(await view(c)) && /Your step 4/.test(await view(c)) && n0 <= 1, [n0, (await view(c)).slice(0, 600), card.slice(0, 100)]);
  await done(c);
}

/* ---------- 10 and 11 after a birth: one length for her recovery check; the walk opens no recovery check ---------- */
{
  const a = await open({ seed: { situation: { care: 'private', deliveredOn: ago(4), breastfeeding: true }, goals: ['recovery'], intake: { goal: 'recovery', stage: 'post' }, settings: { notify: true } } });
  await a.page.evaluate(() => window.Saathi.plan.startFromIntake({ stage: 'post', goal: 'recovery', food: 'veg', milk: 'y', lim: [] })); await settle(a.page, 300);
  const cards = await reveal(a, false); const all = cards.map((c) => c.v).join(' || ');
  check('10 the reveal and the Start card: "your recovery check: 1 minute", "Each evening, 1 minute", never "2 minutes"', /your recovery check: 1 minute/.test(all) && /Each evening, 1 minute: your recovery check/.test(all) && !/2 minutes/.test(all), all.slice(0, 600));
  await done(a);
  const b = await open({ seed: pseed(3, 0) });
  await tap(b, '#view .today-plan-pwalk [data-today-why]'); await settle(b.page, 300);
  check('11 the walk of the first 2 weeks: its "Why?" opens no recovery check', (await has(b, '#sheet-root .pl-why-sh')) && !(await has(b, '#sheet-root [data-go="post-recovery"]')), await txt(b, '#sheet-root'));
  await done(b);
}

/* ---------- 12 "Your baby was born today" ---------- */
{
  for (const [born, want] of [[0, 'Your baby was born today.'], [1, 'Your baby was born yesterday.']]) {
    const a = await open({ seed: { situation: { care: 'private', deliveredOn: ago(born), breastfeeding: true }, goals: ['recovery'], intake: { goal: 'recovery', stage: 'post' } } });
    await go(a, 'plan');
    check('12 born ' + born + ' days ago: "' + want + '", never "0 days ago"', (await view(a)).indexOf(want) >= 0 && !/born 0 days ago/.test(await view(a)), (await view(a)).slice(0, 700));
    await done(a);
  }
}

/* ---------- 14 "Your Sakhi" says where her plan starts ---------- */
{
  const a = await open({ seed: null });
  await join(a.page, { lang: 'en', name: 'Priya', tile: 'pmos', goals: ['irregular'], dx: 'y', dates: [ago(120), ago(78), ago(36)], dlen: 5, care: 'private', stop: 'share' });
  await tap(a, '[data-ob-sh="me"]');
  await a.page.waitForSelector('#su-num', { timeout: 10000 }); await a.page.fill('#su-num', '9876543210'); await tap(a, '#su-send');
  await a.page.waitForSelector('#su-code', { timeout: 10000 }); await a.page.fill('#su-code', '123456');
  await a.page.waitForSelector('#su-done, #ys-tour, .card.hero', { timeout: 10000 }); if (await has(a, '#su-done')) { await a.page.fill('#su-pin', '302001'); await tap(a, '#su-done'); }
  await settle(a.page, 900);
  const rows = await a.page.$$eval('#view .ys-rows .item strong', (xs) => xs.map((x) => x.textContent.trim()));
  check('14 "Your Sakhi" with her plan\'s Start above: "Your plan: start it above, or later on Today"', (await has(a, '#view [data-xp-plan]')) && rows.indexOf('Your plan: start it above, or later on Today') >= 0 && rows.indexOf('Your plan, after your first log') < 0 && rows.length === 3, rows);
  await done(a);
}

/* ---------- 15 and 16 the first 6 weeks after a birth: free check-ups wait, and the hero's line ---------- */
{
  const hero = async (born, x) => { const a = await open({ seed: Object.assign({ situation: Object.assign({ care: 'private', deliveredOn: ago(born), breastfeeding: true }, (x || {}).sit || {}), goals: ['recovery'], intake: { goal: 'recovery', stage: 'post' } }, x || {}) }); const h = await txt(a, '#view .card.hero'); const scr = await a.page.$$eval('#view .screen-home', (y) => y.length); await done(a); return { h, scr }; };
  const d14 = await hero(14), d50 = await hero(50);
  check('15 two weeks after a birth: no free check-ups card (her own 6-week check comes first)', d14.scr === 0, d14);
  check('15 ... from 6 weeks it shows', d50.scr === 1, d50);
  const d3 = await hero(3), d25 = await hero(25), dd = await hero(5, { sit: { babyDied: ago(1), breastfeeding: false } });
  check('16 day 3: "The first weeks after a baby are for healing…", no "log it here"', /The first weeks after a baby are for healing\. Check yourself daily, feed often, and know the warning signs\./.test(d3.h) && !/log it here/.test(d3.h), d3.h);
  check('16 day 25: "you can get pregnant before the first one", still no "log it here"', /Periods can come back any time, and you can get pregnant before the first one\./.test(d25.h) && !/log it here/.test(d25.h), d25.h);
  check('16 day 50: the full line, "When bleeding starts again, log it here."', /When bleeding starts again, log it here\./.test(d50.h), d50.h);
  check('16 after "My baby has died": the line without the baby', /The first weeks after a birth are for healing\. Check yourself daily, and know the warning signs\./.test(dd.h) && !/feed often/.test(dd.h), dd.h);
  const hi = await open({ seed: { lang: 'hi', situation: { care: 'private', deliveredOn: ago(3), breastfeeding: true }, goals: ['recovery'], intake: { goal: 'recovery', stage: 'post' } } });
  check('16 Hindi at 360 px: the same line, no sideways scroll', /बच्चे के बाद के पहले हफ़्ते शरीर के भरने के होते हैं/.test(await txt(hi, '#view .card.hero')) && await hi.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), await txt(hi, '#view .card.hero'));
  await done(hi);
}

check('17 no page errors', !errsAll.length, errsAll.slice(0, 6));
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' : 'PASSED ') + (results.length - failed.length) + '/' + results.length);
process.exit(failed.length ? 1 : 0);
