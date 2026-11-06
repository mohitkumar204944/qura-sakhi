// Version 39.72, the doctors' feature review, part 4: the behaviour (Mohit, 6 Nov: "commit 39.71 and go with part 4";
// docs/feature-review-2026-11-05.md, the approved plan and answers 5, 7 and 12; MODULE_API section 115). This file checks:
// - 1 one reveal screen for every plan: her steps and Start, no Next and no cards;
// - 2 the goal asked once: My plan lists her stage's plans once (no "Suggested for you" or "More plans"), and Back from her first
//   question returns to where she picked it, never to the goal question again;
// - 3 after the check-in: today's count leads, tomorrow's lines stay, no goal line or step's reason again;
// - 4 the pause offer: Today's card after 2 days with nothing done, its 9 am notification the morning after, at most once a week,
//   and none in pregnancy, in discreet mode, while she rests or with her plan's reminder off;
// - 5 before 40 with her periods stopped: her plan starts and runs, with the gynaecologist card as advice;
// - 6 contraception: no step for "avoiding pregnancy" at joining, the step after a birth, one card for 30 days after she stops
//   trying, and her method's reminder whenever she sets one up;
// - 7 the folic acid reminder only while she tries and to 12 weeks of a pregnancy after it (answer 7: as it was);
// - 8 Moves and calm: sun salutation as her morning session;
// - 9 the PMOS walk: 10 minutes after lunch and after dinner, and a brisk 30 to 45 minutes when her day allows, as one step;
// - 10 the Fertile days estimate tile only while she tries (the calendar's fertile window stays);
// - 11 the screenshot block gone from the page and the Android app;
// - 12 Hindi at 360 px, and no page errors.
// Usage: node test/behave.mjs [web dir]
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 900)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-11-06';   /* a Friday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (day, hm) => new Date(new Date(TODAY + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ANDROID = 'window.__sched = []; window.__secure = []; window.SakhiAndroid = { schedule(j){ try { window.__sched = JSON.parse(j); } catch (e) {} return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(on){ window.__secure.push(on); }, setDisguise(){}, isDisguised(){ return false; }, keepAwake(){}, testNotify(){}, maker(){ return "samsung"; }, share(){ return true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.72-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' })); return out; };
const planRem = (startAgo, on) => ({ id: 'plan', mod: 'plan', kind: 'custom', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(startAgo), until: iso(ago(startAgo), 83), every: 1, time: '20:00', on: on !== false, doneOn: null });
const planOf = (pack, goalKey, startAgo, extra) => Object.assign({ pack: pack, goalKey: goalKey, start: ago(startAgo), started: ago(startAgo), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'evening', bed: 'b23', work: 'day', log: {}, weeks: { 1: { e: 'good', seen: true } }, body: [], doc: 'done', ppv2No: '2026-10-01', pv2No: '2026-10-01', mpv2No: '2026-10-01' }, extra || {});
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, intake: { goal: 'irregular', stage: 'cycle' }, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyIntro: ago(3) }, mods: {}, reminders: [] }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
/* her PMOS plan (the cycle plan), started startAgo days ago, with a log */
const pmos = (startAgo, log, x, px) => Object.assign({ situation: { pcos: true }, intake: { goal: 'pmos', stage: 'cycle' }, mods: { plan: planOf('cycle', 'pmos', startAgo, Object.assign({ log: log || {}, intake: { goal: 'pmos', stage: 'cycle', act: '0', food: 'veg', milk: 'y', lim: [], when: 'evening' } }, px || {})) }, reminders: [planRem(startAgo)] }, x || {});
const did = (...days) => Object.fromEntries(days.map((n) => [ago(n), { ck: { move: 'd' }, min: 20, ci: 1 }]));

const browser = await chromium.launch();
const errsAll = [];
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
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 1200);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 600); };
const view = (page) => page.$eval('#view', (e) => e.innerText.replace(/\s+/g, ' ').trim());
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000 }); await page.$eval(sel, (el) => el.click()); await settle(page, 400); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const hash = (page) => page.evaluate(() => location.hash.slice(1));
const sched = async (page) => { await settle(page, 1200); return page.evaluate(() => window.__sched || []); };
const ring = (list) => list.find((x) => /^pause-/.test(x.id)) || null;
const ringOn = (r) => (r ? new Date(r.at + 5.5 * 3600000).toISOString().slice(0, 16).replace('T', ' ') : null);   /* her clock, IST */
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const move = (page) => page.evaluate(() => { const a = window.Saathi.plan.actions().find((x) => x.id === 'move'); return a ? { title: a.title, sub: a.sub, mins: a.mins, state: a.state || '' } : null; });
const save = (page) => page.evaluate(() => window.Saathi.save());

/* ---------- 1. One reveal screen for every plan ---------- */
const DAY = { act: '0', food: 'veg', milk: 'y', lim: [], bed: 'b23', work: 'day', when: 'evening' };
const make = (page, ans) => page.evaluate((ans) => { const S = window.Saathi; const d = S.plan.startFromIntake(ans); S.save(); location.hash = '#plan-reveal'; return !!d; }, ans);
{
  const cases = [['irregular', {}, { goal: 'irregular', stage: 'cycle', gap: 'n', skips: 'n', dx: 'n', signs: ['none'] }], ['pain', {}, { goal: 'pain', stage: 'cycle', pain: 'pk', painDays: '23' }],
    ['ready', { situation: { planning: true }, intake: { goal: 'ready', stage: 'ttc' } }, { goal: 'ready', stage: 'ttc', bdoc: 'std' }],
    ['hot', { dob: '1975-03-01', situation: { stopped: true }, intake: { goal: 'hot', stage: 'meno' }, events: regular(400) }, { goal: 'hot', stage: 'meno', mbone: 'n', mheart: 'n' }]];
  for (const [g, x, ans] of cases) {
    const a = await open({ seed: x, hash: '#plan' });
    const made = await make(a.page, Object.assign({}, DAY, ans)); await settle(a.page, 600);
    const h = await hash(a.page); const v = await view(a.page);
    check('1 ' + g + ': her plan opens on one screen', made && h === 'plan-reveal' && await has(a.page, '#view .pl-rv-one') && await has(a.page, '#view .pl-rv-steps') && await has(a.page, '#pl-rv-go'), { made, h, v: v.slice(0, 300) });
    check('1 ' + g + ': no Next, no card dots, no "How each day works" card', !(await has(a.page, '#pl-rv-next')) && !(await has(a.page, '#view .pl-rv-top')) && !(await has(a.page, '#view .pl-rv-strip')), v.slice(0, 300));
    if (g === 'irregular') {
      await tap(a.page, '#pl-rv-go');
      check('1 Start my plan starts it, on Today', (await hash(a.page)) === 'home' && !!(await a.page.evaluate(() => window.Saathi.plan.running() || !!window.Saathi.state.mods.plan.start)), await hash(a.page));
    }
    await done(a);
  }
}

/* ---------- 2. The goal asked once ---------- */
{
  let a = await open({ seed: { intake: { goal: 'track', stage: 'cycle' } }, hash: '#plan' });
  const picks = await a.page.$$eval('#view [data-pl-pick]', (xs) => xs.map((x) => x.dataset.plPick));
  const v = await view(a.page);
  check('2.1 My plan: "What do you want to work on?" with her stage\'s plans, each once', /What do you want to work on\?/.test(v) && picks.length >= 5 && new Set(picks).size === picks.length, picks);
  check('2.1 ... and nothing under it that repeats them ("Suggested for you", "More plans")', !/Suggested for you|More plans/.test(v) && !(await has(a.page, '#view .pl-sec')) && !(await has(a.page, '#view .pl-rec')), v.slice(-500));
  await tap(a.page, '#view [data-pl-pick="pain"]');
  check('2.2 tapping a plan opens its first question, not the goal again', (await hash(a.page)) === 'plan-goal' && !(await has(a.page, '#view [data-pl-goal]')), await view(a.page));
  await tap(a.page, '#pl-in-back');
  check('2.2 Back from her first question returns to My plan, not to the goal question', (await hash(a.page)) === 'plan' && !(await has(a.page, '#view [data-pl-goal]')), await hash(a.page));
  await done(a);
  /* Today's offer (her goal from joining) */
  a = await open({ seed: { intake: { goal: 'pain', stage: 'cycle' }, prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), planOffer: ago(1) } } });
  const off = await has(a.page, '#pl-off-go');
  if (off) { await tap(a.page, '#pl-off-go'); await tap(a.page, '#pl-in-back'); }
  check('2.3 Today\'s offer: Back from its first question returns to Today, no goal question', off && (await hash(a.page)) === 'home', { off, h: await hash(a.page) });
  await done(a);
  /* her own edit still shows the goal she picked, to change it */
  a = await open({ seed: { intake: { goal: 'track', stage: 'cycle' } }, hash: '#plan' });
  await make(a.page, Object.assign({}, DAY, { goal: 'pain', stage: 'cycle', pain: 'pk', painDays: '23' })); await settle(a.page, 600);
  const onRev = (await hash(a.page)) === 'plan-reveal';
  if (onRev) await tap(a.page, '#pl-rv-edit');
  check('2.4 "Change my answers" on her plan opens her answers from her goal (she asked to change them)', onRev && await has(a.page, '#view [data-pl-goal="pain"].on'), { onRev, h: await hash(a.page) });
  await done(a);
}

/* ---------- 3. After the check-in ---------- */
{
  const a = await open({ seed: pmos(4, did(1, 2, 3)), hash: '#plan-checkin', now: at(0, '20:30') });
  await a.page.$$eval('#view [data-ci$=":d"]', (xs) => xs.forEach((x) => x.click())); await settle(a.page, 300);
  await tap(a.page, '#pl-ci-save');
  const fb = await txt(a.page, '#pl-ci-fb'); const r = await a.page.evaluate(() => window.Saathi.t('plan_fb_move'));
  check('3 after the check-in: today\'s count leads', await has(a.page, '#pl-ci-fb .lead.pl-ci-cnt') && /of \d+ today|All \d+ done today/.test(await txt(a.page, '#pl-ci-fb .lead')), fb);
  check('3 ... no goal line, no step\'s reason, no "Why it helps"', !(await has(a.page, '#pl-ci-fb .pl-ci-goal')) && !/Your goal|Why it helps/.test(fb) && fb.indexOf(r) < 0, fb);
  check('3 ... tomorrow\'s line stays', /Tomorrow|See you/.test(fb), fb);
  await done(a);
}

/* ---------- 4. The pause offer ---------- */
{
  /* her last step 3 days ago: 2 full days with nothing done, and nothing yet today */
  let a = await open({ seed: pmos(12, did(3, 4, 5, 6, 7)) });
  check('4.1 2 days with nothing done: "Take a week off?" leads Sakhi says', /Take a week off\?/.test(await txt(a.page, '#view .pl-sl-pause')), (await view(a.page)).slice(0, 500));
  let rg = ring(await sched(a.page));
  check('4.1 today\'s 9 am ring has gone by, so the next is a week on, at 9 am, opening Today on its card', !!rg && ringOn(rg) === iso(TODAY, 7) + ' 09:00' && rg.go === 'plan-pause' && /Take a week off\?/.test(rg.body), rg);
  await tap(a.page, '#pl-pause-not');
  check('4.2 Not now: the card goes, and the restart card does not take its place today', !(await has(a.page, '#view .pl-sl-pause')) && !(await has(a.page, '#view .pl-sl-lapse')), (await view(a.page)).slice(0, 400));
  rg = ring(await sched(a.page));
  check('4.2 ... and the next ring waits a week from her answer', !!rg && ringOn(rg) === iso(TODAY, 7) + ' 09:00', ringOn(rg));
  await done(a);
  /* yesterday counted: the ring is booked for the morning after 2 quiet days */
  a = await open({ seed: pmos(12, did(1, 2)) });
  rg = ring(await sched(a.page));
  check('4.3 her plan counted yesterday: no card, and the ring is booked for the day after tomorrow, 9 am', !(await has(a.page, '#view .pl-sl-pause')) && ringOn(rg) === iso(TODAY, 2) + ' 09:00', ringOn(rg));
  await a.page.evaluate(() => { const d = window.Saathi.state.mods.plan; d.log[window.Saathi.toISO(window.Saathi.today())] = { ck: { move: 'd' }, min: 20 }; window.Saathi.save(); });
  rg = ring(await sched(a.page));
  check('4.3 a step done today moves it on: 3 days from today', ringOn(rg) === iso(TODAY, 3) + ' 09:00', ringOn(rg));
  await done(a);
  /* the morning it rings: tapping it opens Today with the card */
  a = await open({ seed: pmos(12, did(3, 4)), now: at(0, '09:00') });
  check('4.4 the morning it rings (9 am): Today shows the card', /Take a week off\?/.test(await txt(a.page, '#view .pl-sl-pause')));
  await tap(a.page, '#pl-pause-go');
  const s1 = await st(a.page); rg = ring(await sched(a.page));
  check('4.4 Pause for a week: her plan rests 7 days, and no pause ring is booked while it rests', s1.mods.plan.pauseUntil === iso(TODAY, 7) && !rg, { p: s1.mods.plan.pauseUntil, r: ringOn(rg) });
  await done(a);
  /* her pause ended yesterday and nothing since: its last day counts as her last, so the ring is tomorrow morning */
  a = await open({ seed: pmos(20, did(10, 11), null, { pauseUntil: ago(1), pauseAsk: ago(8), pauseOff: ago(8) }) });
  rg = ring(await sched(a.page));
  check('4.4 ... after the pause, the first ring is the morning after 2 quiet days', ringOn(rg) === iso(TODAY, 1) + ' 09:00' && !(await has(a.page, '#view .pl-sl-pause')), ringOn(rg));
  await done(a);
  /* where it never rings */
  a = await open({ seed: Object.assign(pmos(12, did(3, 4)), { reminders: [planRem(12, false)] }) });
  check('4.5 her plan\'s reminder off: no pause ring (the card on Today stays)', !ring(await sched(a.page)) && await has(a.page, '#view .pl-sl-pause'), ring(await sched(a.page)));
  await done(a);
  const none = [['discreet mode', pmos(12, did(3, 4), { settings: { discreet: true } })],
    ['a pregnancy plan', { situation: { pregnant: true, pregnantSince: ago(100) }, events: [], intake: { goal: 'preg', stage: 'preg' }, mods: { plan: planOf('preg', 'preg', 12, { pv: 2 }) }, reminders: [planRem(12)] }]];
  for (const [nm, sd] of none) {
    a = await open({ seed: sd });
    check('4.5 ' + nm + ': no pause ring and no pause card', !ring(await sched(a.page)) && !(await has(a.page, '#view .pl-sl-pause')), ring(await sched(a.page)));
    await done(a);
  }
  /* her plan's doctor check leads Sakhi says on an ordinary day; the notification's tap opens on the pause card */
  const docSeed = Object.assign(pmos(6, {}, null, { doc: null }), { intake: { goal: 'irregular', stage: 'cycle' } });
  docSeed.mods.plan.goalKey = 'irregular'; docSeed.mods.plan.intake = { goal: 'irregular', stage: 'cycle', gap: 'g45', skips: 'y', act: '0', food: 'veg', milk: 'y', lim: [], when: 'evening' };
  a = await open({ seed: docSeed });
  const lead0 = await a.page.$eval('#view .slot > .card', (e) => e.className).catch(() => '');
  await a.page.evaluate(() => window.__sakhiOpen('plan-pause')); await settle(a.page, 600);   /* the notification's tap */
  const lead1 = await a.page.$eval('#view .slot > .card', (e) => e.className).catch(() => '');
  check('4.7 an ordinary day: her plan\'s doctor check leads; from the notification: the pause card leads, on Today', /pl-sl-doc/.test(lead0) && /pl-sl-pause/.test(lead1) && (await hash(a.page)) === 'home', { lead0, lead1, h: await hash(a.page) });
  await done(a);
  /* a shared phone: the ring says only "Reminder" */
  a = await open({ seed: pmos(12, did(1), { settings: { shared: true } }) });
  rg = ring(await sched(a.page));
  check('4.6 a shared phone: the ring has neutral words', !!rg && !/week off|plan/i.test(rg.body), rg);
  await done(a);
}

/* ---------- 5. Before 40, her periods stopped ---------- */
{
  const ans = { goal: 'hot', stage: 'meno', act: '0', food: 'veg', milk: 'y', lim: [], mbone: 'n', mheart: 'n', when: 'dinner' };
  const poi = (x) => Object.assign({ dob: '1989-03-01', situation: { stopped: true, midlife: true }, intake: { goal: 'hot', stage: 'meno' }, events: regular(400), mods: { plan: planOf('meno', 'hot', 2, { pv: 2, intake: ans }) }, reminders: [planRem(2)] }, x || {});
  let a = await open({ seed: poi() });
  const v = await view(a.page);
  check('5.1 at 37 with her periods stopped: her plan runs on Today', await has(a.page, '#view .today-plan-skill') || await has(a.page, '#view .today-plan-list'), v.slice(0, 500));
  check('5.1 ... with the gynaecologist card as advice, in its reviewed words', /Periods stopped before 40\? See a gynaecologist/.test(await txt(a.page, '#view .pl-m2-poi')) && /not menopause/.test(await txt(a.page, '#view .pl-m2-poi')) && !/Before a plan/.test(v), await txt(a.page, '#view .pl-m2-poi'));
  check('5.1 her plan\'s reminder stays on', !!(await st(a.page)).reminders.find((r) => r.id === 'plan' && r.on !== false));
  await go(a.page, 'plan');
  check('5.2 My plan: her plan, not the card alone', await has(a.page, '#view .pl-steps-card') || /Today/.test(await view(a.page)), (await view(a.page)).slice(0, 300));
  await done(a);
  a = await open({ seed: poi({ mods: {}, reminders: [] }), hash: '#plan' });
  check('5.3 no plan yet: the card above her goals, and a goal starts its questions', await has(a.page, '#view .pl-m2-poi') && await has(a.page, '#view [data-pl-pick]'), (await view(a.page)).slice(0, 400));
  await tap(a.page, '#view [data-pl-pick="hot"]');
  check('5.3 ... her midlife plan\'s questions open (no hold)', (await hash(a.page)) === 'plan-goal', await hash(a.page));
  await done(a);
  a = await open({ seed: poi() });
  await tap(a.page, '#pl-m2-poi-ok');
  check('5.4 "My doctor has seen me": the card goes, her plan carries on', !(await has(a.page, '#view .pl-m2-poi')) && !!(await st(a.page)).situation.poiOk && !!(await a.page.evaluate(() => window.Saathi.plan.running())));
  await done(a);
}

/* ---------- 6. Contraception ---------- */
{
  const ct = (page) => page.evaluate(() => { const S = window.Saathi; const m = S.modules.find((x) => x.id === 'contra'); const y = m && m.setup ? m.setup(S) : null; return y ? y.title : null; });
  let a = await open({ seed: { goals: ['avoid'], intake: { goal: 'track', stage: 'cycle' }, joined: ago(5), prompts: { planCall: ago(3), firstLog: ago(3), notifyIntro: ago(3) } } });
  check('6.1 avoiding pregnancy at joining: no contraception step on Home', !(await ct(a.page)) && !/Add the method you use|Turn on your method/.test(await view(a.page)), await ct(a.page));
  await done(a);
  a = await open({ seed: { situation: { deliveredOn: ago(20), breastfeeding: true }, events: [], intake: { goal: 'recovery', stage: 'post' }, joined: ago(5), prompts: { planCall: ago(3), firstLog: ago(3), notifyIntro: ago(3) } } });
  check('6.2 after a birth: the step stays ("Choose a method for after the birth")', /Choose a method for after the birth/.test((await ct(a.page)) || ''), await ct(a.page));
  await done(a);
  a = await open({ seed: { situation: { ttcStop: ago(2) }, intake: { goal: 'track', stage: 'cycle' } } });
  check('6.3 she stopped trying 2 days ago: one card for her method', /Add the method you use/.test(await txt(a.page, '#view .ct-stop')) && await has(a.page, '#view .ct-stop [data-go="contra-mine"]'), (await view(a.page)).slice(0, 500));
  await tap(a.page, '#ct-stop-not');
  check('6.3 Not now: it goes', !(await has(a.page, '#view .ct-stop')));
  await done(a);
  a = await open({ seed: { situation: { ttcStop: ago(31) }, intake: { goal: 'track', stage: 'cycle' } } });
  check('6.4 31 days on: no card', !(await has(a.page, '#view .ct-stop')));
  await done(a);
  a = await open({ seed: { situation: { ttcStop: ago(2) }, intake: { goal: 'track', stage: 'cycle' }, mods: { contra: { method: 'pill', since: ago(1), time: '21:00', start: ago(1) } } } });
  check('6.5 with a method set: no card', !(await has(a.page, '#view .ct-stop')));
  await done(a);
  /* the stage sheet notes the day she stops trying, and clears it when she tries again */
  a = await open({ seed: { situation: { planning: true }, intake: { goal: 'ready', stage: 'ttc' } } });
  const flip = async (k) => { await a.page.evaluate((k) => window.Saathi.openStage(k), k); await settle(a.page, 400); const b = await a.page.$('#sheet-root #st-save, #sheet-root .btn.primary'); if (b) { await b.click(); await settle(a.page, 600); } };
  await flip('cycle'); const s1 = (await st(a.page)).situation;
  await flip('ttc'); const s2 = (await st(a.page)).situation;
  check('6.6 tracking after trying sets the day; trying again clears it', s1.ttcStop === TODAY && !s1.planning && !s2.ttcStop, { s1: s1.ttcStop, s2: s2.ttcStop });
  await done(a);
}

/* ---------- 7. The folic acid reminder (answer 7) ---------- */
{
  const rem = (page) => page.evaluate(() => !!(window.Saathi.state.reminders || []).find((r) => r.id === 'ttc-folic'));
  let a = await open({ seed: { situation: { planning: true }, intake: { goal: 'ready', stage: 'ttc' }, mods: { ttc: { folic: { has: ago(5) } }, plan: planOf('ttc', 'ready', 5, { pv: 2, intake: { goal: 'ready', stage: 'ttc', bdoc: 'std', act: '0', food: 'veg', milk: 'y', lim: [] } }) }, reminders: [planRem(5)] } });
  await go(a.page, 'home');
  check('7.1 while she tries, with her tablets: the 9 pm folic acid reminder', await rem(a.page));
  await done(a);
  a = await open({ seed: { intake: { goal: 'track', stage: 'cycle' }, mods: { ttc: { folic: { has: ago(5) } } } }, hash: '#me-reminders' });
  check('7.2 tracking her periods: no folic acid reminder, and none on her Reminders page', !(await rem(a.page)) && !/folic/i.test(await view(a.page)), await view(a.page));
  await done(a);
}

/* ---------- 8. Moves and calm: her morning session ---------- */
{
  let a = await open({ seed: pmos(20, did(1)), hash: '#plan-moves' });
  const mo = await a.page.$$eval('#view .pl-mv-morning [data-go]', (xs) => xs.map((x) => x.dataset.go));
  const lab = await a.page.$$eval('#view .pl-mgrp', (xs) => xs.map((x) => x.innerText.trim()));
  check('8.1 Moves and calm: "Morning session" first, with sun salutation, then "Any time of day"', mo[0] === 'plan-r-sun' && /^Morning session$/i.test(lab[0] || '') && /^Any time of day$/i.test(lab[1] || ''), { mo, lab });
  check('8.1 ... sun salutation listed once', (await a.page.$$('#view [data-go="plan-r-sun"]')).length === 1);
  await done(a);
  a = await open({ seed: pmos(20, did(1), null, { limits: { knees: true, back: false } }), hash: '#plan-moves' });
  check('8.2 knees that hurt: no sun salutation, so no morning group', !(await has(a.page, '#view .pl-mv-morning')) && !(await has(a.page, '#view [data-go="plan-r-sun"]')));
  await done(a);
}

/* ---------- 9. The PMOS walk ---------- */
{
  let a = await open({ seed: pmos(20, did(1)) });
  let m = await move(a.page);
  check('9.1 one step: "Walk 10 minutes after lunch and after dinner", 20 minutes', !!m && m.title === 'Walk 10 minutes after lunch and after dinner' && m.mins === 20, m);
  check('9.1 ... and "And a brisk walk of 30 to 45 minutes when your day allows"', !!m && m.sub === 'And a brisk walk of 30 to 45 minutes when your day allows', m);
  check('9.1 Today says it in short: "Walk after lunch and dinner", "10 minutes each" (the brisk walk behind Why?)', /Walk after lunch and dinner\s*10 minutes each/.test(await view(a.page)), (await view(a.page)).slice(0, 600));
  check('9.1 ... and its Why? holds the brisk walk', await a.page.evaluate(() => (window.Saathi.plan.actions().find((x) => x.id === 'move') || {}).how || '').then((h) => /a brisk walk of 30 to 45 minutes when your day allows\. Brisk: you can talk, but not sing\./.test(h)));
  await go(a.page, 'plan');
  check('9.2 My plan names it the same way', /Walk 10 minutes after lunch and after dinner|A 10-minute walk after lunch and after dinner/.test(await view(a.page)), (await view(a.page)).slice(0, 800));
  await go(a.page, 'plan-checkin');
  const ciNm = await a.page.$$eval('#view .pl-ci-row strong', (xs) => xs.map((x) => x.innerText));
  check('9.3 the check-in asks about it by name', ciNm.some((x) => /after lunch and after dinner/.test(x)), ciNm);
  await a.page.$eval('#view [data-ci="move:p"]', (x) => x.click()).catch(() => {}); await settle(a.page, 200);
  await a.page.$$eval('#view [data-ci$=":d"]', (xs) => xs.filter((x) => !/^move:/.test(x.dataset.ci)).forEach((x) => x.click())); await settle(a.page, 200);
  await tap(a.page, '#pl-ci-save');
  const lg = (await st(a.page)).mods.plan.log[TODAY] || {};
  check('9.3 Partly: one of the two walks, 10 minutes', (lg.min || 0) - (lg.rmin || 0) === 10, lg);
  await done(a);
  a = await open({ seed: pmos(20, did(1), null, { light: { from: ago(1), until: iso(TODAY, 6) } }) });
  m = await move(a.page);
  check('9.4 a lighter week she chose: one 10-minute walk', !!m && m.mins === 10 && m.title === 'Walk 10 minutes', m);
  await done(a);
}

/* ---------- 10. The Fertile days estimate tile ---------- */
{
  const find = async (page) => { await go(page, 'care'); await page.fill('#care-q', 'fertile days'); await settle(page, 800); return page.$$eval('#view [data-go="fertile"]', (xs) => xs.length); };
  let a = await open({ seed: { situation: { planning: true }, intake: { goal: 'ready', stage: 'ttc' } } });
  check('10.1 trying for a baby: the tile is in Explore\'s search', (await find(a.page)) > 0);
  await go(a.page, 'topic-ttc');
  check('10.1 ... and on Trying for a baby', await has(a.page, '#view [data-go="fertile"]'));
  await done(a);
  const six = []; [0, 1, 2, 3, 4, 5, 6].forEach((k) => six.push({ d: ago(10 + 28 * k), t: 'start' }, { d: ago(6 + 28 * k), t: 'end' }));
  a = await open({ seed: { intake: { goal: 'track', stage: 'cycle' }, events: six } });
  check('10.2 tracking her periods: not in search', (await find(a.page)) === 0);
  await go(a.page, 'topic-ttc');
  check('10.2 ... nor on Trying for a baby', !(await has(a.page, '#view [data-go="fertile"]')));
  await go(a.page, 'diary');
  check('10.3 her calendar keeps her fertile window (answer 9)', /Fertile window/.test(await view(a.page)), (await view(a.page)).slice(0, 400));
  await done(a);
}

/* ---------- 11. The screenshot block ---------- */
{
  const a = await open({ seed: { settings: { discreet: true, shared: true, lock: true } } });
  await go(a.page, 'me'); await go(a.page, 'diary');
  check('11.1 the page never asks for the screenshot block, whatever she turns on', (await a.page.evaluate(() => window.__secure)).length === 0, await a.page.evaluate(() => window.__secure));
  await done(a);
  const java = fs.readFileSync(path.join(root, '..', 'android', 'src', 'com', 'quranutrition', 'sakhi', 'MainActivity.java'), 'utf8');
  check('11.2 the Android app never sets FLAG_SECURE, and has no setSecure for the page', !/addFlags\([^)]*FLAG_SECURE/.test(java) && !/public void setSecure/.test(java));
  check('11.2 ... and the recent-apps list still shows Sakhi\'s icon, not her diary (Android 13+)', /setRecentsScreenshotEnabled\(false\)/.test(java));
}

/* ---------- 12. Hindi at 360 px ---------- */
{
  let a = await open({ seed: pmos(12, did(3, 4, 5, 6, 7), { lang: 'hi' }), lang: 'hi', w: 360 });   /* week 2: two quiet weeks would bring their own card */
  check('12.1 Hindi: the pause card and the walk, no sideways scroll', /एक हफ़्ते की छुट्टी लें\?/.test(await view(a.page)) && /दोपहर और रात के खाने के बाद सैर\s*हर बार 10 मिनट/.test(await view(a.page)) && await noScroll(a.page), (await view(a.page)).slice(0, 500));
  await go(a.page, 'plan-moves');
  check('12.1 ... Moves and calm\'s "सुबह का सत्र"', /सुबह का सत्र/.test(await view(a.page)) && await noScroll(a.page));
  await done(a);
  const ans = { goal: 'hot', stage: 'meno', act: '0', food: 'veg', milk: 'y', lim: [], mbone: 'n', mheart: 'n', when: 'dinner' };
  a = await open({ seed: { lang: 'hi', dob: '1989-03-01', situation: { stopped: true, midlife: true }, intake: { goal: 'hot', stage: 'meno' }, events: regular(400), mods: { plan: planOf('meno', 'hot', 2, { pv: 2, intake: ans }) }, reminders: [planRem(2)] }, lang: 'hi', w: 360 });
  check('12.2 Hindi: the gynaecologist card\'s heading', /40 से पहले पीरियड बंद\? स्त्री रोग विशेषज्ञ को दिखाएँ/.test(await txt(a.page, '#view .pl-m2-poi')) && await noScroll(a.page), await txt(a.page, '#view .pl-m2-poi'));
  await done(a);
  a = await open({ seed: { lang: 'hi', situation: { ttcStop: ago(2) }, intake: { goal: 'track', stage: 'cycle' } }, lang: 'hi', w: 360 });
  check('12.3 Hindi: the method card', await has(a.page, '#view .ct-stop') && await noScroll(a.page));
  await done(a);
}

check('12 no page errors', errsAll.length === 0, errsAll.slice(0, 8));
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log('\n' + (results.length - failed.length) + '/' + results.length + ' passed');
process.exit(failed.length ? 1 : 0);
