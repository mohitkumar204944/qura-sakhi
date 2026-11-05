// Version 39.5: one plan page, and plans that carry on (docs/roadmap-v39-2026-10-24.md, section 3; journey audit P2-04,
// P2-07, P2-09, P2-10, P2-15, P2-16, P2-17, P2-19, P2-25, MIN-10; MODULE_API section 48). This file checks:
//   1 one page for every plan: her clock, a hero (ring, week or timeline), one row for today, 4 tiles, results on My progress;
//   2 Today's budget: at most 3 plan steps (the cycle plan's 4: Version 39.13) and one plan card;  3 rest days she taps, and the offer on a hard day she logged;
//   4 welcome back after quiet days;  5 the hold rule on the light plans (the cycle plan's ladder is unchanged);
//   6 "Your plan has changed" when a pregnancy or a birth stops her plan;  7 her last plan is kept, on My plan and the report;
//   8 a fair new 12 weeks on the same goal;  9 pause for a week, and the one-time offer after 14 quiet days;
//  10 steps that count from their tools, and a strength day's Done;  11 after the birth: the 6-week check, then walks;
//  12 a shared phone, Hindi, a 360 px screen, no page errors.
// Usage: node test/carryon.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'carryon'); fs.mkdirSync(SHOTS, { recursive: true });
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
const LOCAL = { app: '0.39.5-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start', pain: 'pain_1' }, { d: ago(x - 5), t: 'end' })); return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
const planOf = (pack, goal, start, extra) => Object.assign({ pack: pack, goalKey: goal, start: start, go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'evening', bed: 'b23', work: 'day', log: {}, weeks: {}, body: [], doc: 'done', ppv2No: '2026-10-01' }, extra || {});   /* Version 39.55: she kept her plan when My period plan was offered (periodplan.mjs checks the offer) */
const PREG = (w) => ({ situation: { pregnant: true, pregnantSince: ago(w * 7) }, events: [] });
const REM = (on) => [{ id: 'plan', kind: 'plan', title: { en: 'How did today go? 1 minute', hi: 'आज कैसा रहा? 1 मिनट' }, time: '20:00', repeat: 'daily', on: on !== false, start: ago(30) }];
/* a log where she followed her plan on `days` of every week so far (one step done each day) */
const logged = (startAgo, weeks, days, step) => { const l = {}; for (let w = 0; w < weeks; w++) for (let k = 0; k < days; k++) l[ago(startAgo - w * 7 - k)] = { ck: { [step || 'move']: 'd' }, min: 15 }; return l; };

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
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000 }); await page.$eval(sel, (el) => el.click()); await settle(page, 300); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText).catch(() => '');
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const tiles = (page) => page.$$eval('#view .pl-tiles [data-go]', (x) => x.map((y) => y.dataset.go));
const acts = (page) => page.evaluate(() => window.Saathi.plan.actions().map((a) => a.id + ':' + a.kind + ':' + (a.state || '') + ':' + (a.mins || '')));
const errsAll = [];

/* ---------- 1. One page for every plan ---------- */
{
  const a = await open({ seed: { events: regular(10), intake: { goal: 'irregular', stage: 'cycle' }, mods: { plan: planOf('cycle', 'irregular', ago(9)) } }, hash: '#plan' });
  let v = await view(a.page);
  check('1 cycle plan: her clock line ("Week 2 of 12")', /Week 2 of 12/.test(await txt(a.page, '#view .pl-clock')), await txt(a.page, '#view .pl-clock'));
  check('1 cycle plan: her week as rings and her minutes, with no "+ Add minutes" (Version 39.68)', await has(a.page, '#view .pl-wkc .pl-r4') && /Active minutes/.test(await txt(a.page, '#view .pl-wkc')) && !(await has(a.page, '#view .pl-addmin')));
  check('1 cycle plan: her steps with their reasons (behind "Why these steps?" after week 1, Version 39.22) and today\'s Start or tick, and no quick-add chips or plate habits', await has(a.page, '#view .pl-steps-card [data-pl-start]') && await has(a.page, '#view .pl-steps-card #pl-whyall') &&   /* Version 39.22: one "Why these steps?" */ !(await has(a.page, '#view [data-pl-add]')) && !(await has(a.page, '#view .pl-hab')) && !(await has(a.page, '#view .pl-today')));
  check('1 cycle plan: 4 tiles (My plate, Yoga and moves, My body, My progress)', (await tiles(a.page)).join() === 'plan-plate,plan-moves,plan-body,plan-progress', await tiles(a.page));
  check('1 ... and My progress says how many days so far', /\d+ days/.test(await txt(a.page, '#view .pl-tile[data-go="plan-progress"]')));
  check('1 her care team ends with Help (danger signs, who to call)', await has(a.page, '#view .pl-care [data-go="help"]'));
  await shot(a.page, '01-cycle');
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: { events: regular(10), intake: { goal: 'pain', stage: 'cycle' }, mods: { plan: planOf('pain', 'pain', ago(9), { log: logged(9, 1, 3) }) } }, hash: '#plan' });
  check('1 pain plan: her week as rings (Version 39.15)', await has(b.page, '#view .pl-wkc .pl-r4') && /This week/.test(await txt(b.page, '#view .pl-wkc')), await txt(b.page, '#view .pl-wkc'));
  check('1 pain plan: 4 tiles (My food, Yoga and moves, For period cramps, My progress)', (await tiles(b.page)).join() === 'food,plan-moves,relief-cramps,plan-progress', await tiles(b.page));
  check('1 pain plan: her results live on My progress, not in a long section here', !/Days you followed your plan, each week/.test(await view(b.page)));
  await shot(b.page, '01-pain');
  await go(b.page, 'plan-progress');
  check('1 ... My progress shows the light plan\'s results', /Days you followed your plan, each week/.test(await view(b.page)), (await view(b.page)).slice(0, 300));
  errsAll.push(...b.errs); await b.ctx.close();
  const c = await open({ seed: Object.assign({}, PREG(20), { intake: { goal: 'food', stage: 'preg' }, mods: { plan: planOf('preg', 'food', ago(9)) } }), hash: '#plan' });
  v = await view(c.page);
  check('1 pregnancy plan: her trimesters are the hero, and her own week is the clock', /Weeks 1 to 13/.test(v) && /Week 20 of pregnancy/.test(await txt(c.page, '#view .pl-clock')), (await txt(c.page, '#view .pl-clock')));
  check('1 pregnancy plan: tiles for food, check-ups, this week and progress, no moves', (await tiles(c.page)).join() === 'food,preg-plan,preg-week,plan-progress', await tiles(c.page));
  check('1 ... and the note that moves wait for her doctor', await has(c.page, '#view .pl-preg-moves'));
  await shot(c.page, '01-preg');
  errsAll.push(...c.errs); await c.ctx.close();
  const p = await open({ seed: { situation: { deliveredOn: ago(20), breastfeeding: true }, events: [], intake: { goal: 'feed', stage: 'post' }, mods: { plan: planOf('post', 'feed', ago(9)) } }, hash: '#plan' });
  v = await view(p.page);
  check('1 after the birth: her own weeks after the birth (one count, not "of 12")', /After the birth/.test(v) && /Week 3 after the birth/.test(await txt(p.page, '#view .pl-clock')) && !/of 12/.test(await txt(p.page, '#view .pl-clock')), await txt(p.page, '#view .pl-clock'));
  check('1 after the birth: tiles for food, pelvic floor, check-ups and progress', (await tiles(p.page)).join() === 'food,post-pelvic,post-checks,plan-progress', await tiles(p.page));
  await shot(p.page, '01-post');
  errsAll.push(...p.errs); await p.ctx.close();
}

/* ---------- 2. Today's budget: at most 3 plan steps and one plan card ---------- */
{
  for (const [pk, goal, sd] of [['cycle', 'irregular', {}], ['pain', 'pain', {}], ['ttc', 'ready', { situation: { planning: true } }], ['post', 'recovery', { situation: { deliveredOn: ago(36) }, events: [] }], ['meno', 'bones', { dob: '1976-03-01', situation: { midlife: true } }]]) {
    const a = await open({ seed: Object.assign({ intake: { goal: goal }, mods: { plan: planOf(pk, goal, ago(15)) } }, sd), now: at(0, '19:00') });
    const n = await a.page.evaluate(() => ({ rows: document.querySelectorAll('#view .today-card .today-it[class*="today-plan-"]').length, cards: document.querySelectorAll('#view .pl-slot').length }));
    check('2 ' + pk + ': Today has at most ' + (pk === 'cycle' ? 4 : 3) + ' plan steps and one plan card', n.rows <= (pk === 'cycle' ? 4 : 3) && n.cards <= 1, n);   /* Version 39.13: the cycle plan's yoga and walk */
    errsAll.push(...a.errs); await a.ctx.close();
  }
}

/* ---------- 3. Rest days ---------- */
{
  const a = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(8)) } }, hash: '#plan-checkin', now: at(0, '20:30') });
  check('3 the check-in offers a rest day, with how many are left this week', /Rest day today/.test(await view(a.page)) && /2 left this week/.test(await view(a.page)), (await view(a.page)).slice(0, 300));
  await tap(a.page, '#pl-ci-rest');
  check('3 ... she taps it: "Rest well", and it counts as a day she followed her plan', /Rest well/.test(await view(a.page)) && await a.page.evaluate(() => { const d = window.Saathi.state.mods.plan; return !!(d.log[Object.keys(d.log).sort().pop()] || {}).rest; }));
  await go(a.page, 'home');
  check('3 Today says "Rest day"', /Rest day/.test(await txt(a.page, '#view .today-card')), await txt(a.page, '#view .today-card'));
  check('3 ... and Today shows none of the plan\'s steps', !(await has(a.page, '#view .today-card [class*="today-plan-"]')));
  /* two rest days used this week: no third */
  await a.page.evaluate(() => { const S = window.Saathi; const d = S.state.mods.plan; const k = Object.keys(d.log).sort().pop(); d.log[S.toISO(S.addDays(S.fromISO(k), -1))] = { rest: true, ci: 1 }; S.save(); });
  await a.page.clock.setFixedTime(at(1, '20:30')); await go(a.page, 'plan-checkin');
  check('3 two rest days a week at most', !(await has(a.page, '#pl-ci-rest')) || (await a.page.evaluate(() => window.Saathi.plan.actions().length === 0)), (await view(a.page)).slice(0, 200));
  errsAll.push(...a.errs); await a.ctx.close();
  /* a day she logged pain that stopped her day: Sakhi offers a rest day, and never applies one */
  const ev = regular(30).concat([{ d: TODAY, t: 'start', pain: 'pain_3' }]);
  const b = await open({ seed: { events: ev, intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(8)) } } });
  check('3 a day she logged pain that stopped her day: "Make today a rest day?"', /Make today a rest day\?/.test(await txt(b.page, '#view .today-card')), await txt(b.page, '#view .today-card'));
  check('3 ... offered, not applied', await b.page.evaluate(() => !((window.Saathi.state.mods.plan.log || {})['2026-10-27'] || {}).rest));
  await tap(b.page, '#pl-rest-yes');
  check('3 ... "Yes, rest today" makes it a rest day', await b.page.evaluate(() => !!((window.Saathi.state.mods.plan.log || {})['2026-10-27'] || {}).rest));
  errsAll.push(...b.errs); await b.ctx.close();
  const c = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(8)) } } });
  check('3 no hard day logged: no rest-day offer', !(await has(c.page, '#pl-rest-yes')));
  errsAll.push(...c.errs); await c.ctx.close();
}

/* ---------- 4. Welcome back ---------- */
{
  const l = { [ago(5)]: { ck: { move: 'd' }, min: 15 } };
  const a = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(12), { log: l }) } } });
  check('4 back after quiet days: "Welcome back. Nothing to catch up"', /Welcome back\. Nothing to catch up/.test(await txt(a.page, '#view .pl-th-y')), await txt(a.page, '#view .today-card'));
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(12), { log: { [ago(1)]: { ck: { move: 'd' }, min: 15 } } }) } } });
  check('4 ... not when she was here yesterday', !/Welcome back/.test(await txt(b.page, '#view .today-card')));
  errsAll.push(...b.errs); await b.ctx.close();
}

/* ---------- 5. The hold rule (light plans); the cycle plan's ladder is unchanged ---------- */
{
  const walk = (page) => page.evaluate(() => (window.Saathi.plan.actions().find((a) => a.id === 'move') || {}).mins);
  const a = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(28), { level: 1 }) } } });
  const held = await walk(a.page); errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(28), { level: 1, log: logged(28, 4, 4) }) } } });
  const grew = await walk(b.page);
  check('5 pain plan, week 5: quiet weeks hold her walk (15 minutes); weeks of 3+ days let it grow (25)', held === 15 && grew === 25, [held, grew]);
  await go(b.page, 'plan'); errsAll.push(...b.errs); await b.ctx.close();
  const c = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(8), { log: { [ago(8)]: { ck: { move: 'd' }, min: 15 } } }) } }, hash: '#plan' });
  await tap(c.page, '#view [data-pl-e="ok"]');
  check('5 the look-back after a week with fewer than 3 days: "the same pace"', /the same pace/.test(await view(c.page)), (await view(c.page)).slice(0, 500));
  errsAll.push(...c.errs); await c.ctx.close();
  const d = await open({ seed: { intake: { goal: 'irregular' }, mods: { plan: planOf('cycle', 'irregular', ago(28)) } } });
  const cyc = await d.page.evaluate(() => { const S = window.Saathi; const a = S.plan.actions(); const w = (a.find((x) => x.id === 'move') || {}).mins; const y = a.find((x) => x.id === 'yoga'); return { w: w, y: y ? S.plan.routineMins(y.r, S.state.mods.plan) : 0 }; });
  check('5 the cycle plan keeps its approved ladder (week 5: 20 minutes even after quiet weeks; Version 39.13: her yoga, then her walk for the rest)', cyc.w === Math.max(10, Math.ceil((20 - cyc.y) / 5) * 5) && cyc.w + cyc.y >= 20, cyc);
  errsAll.push(...d.errs); await d.ctx.close();
}

/* ---------- 6. "Your plan has changed" ---------- */
{
  const a = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(40) }, events: [], intake: { goal: 'irregular' }, mods: { plan: planOf('cycle', 'irregular', ago(50), { log: logged(50, 2, 4) }) } } });
  const v = await txt(a.page, '#view .pl-sl-chg');
  check('6 pregnant during her plan: one card, "Your plan has changed", with what she did', /Your plan has changed/.test(v) && /You followed it on 8 days/.test(v), v);
  await shot(a.page, '06-changed');
  await tap(a.page, '#view #pl-chg-go');
  check('6 ... "See my pregnancy plan" opens the pregnancy plan\'s questions', (await a.page.evaluate(() => location.hash)) === '#plan-goal' && (await a.page.evaluate(() => (window.Saathi.mem.planIntake || {}).stage)) === 'preg');
  await go(a.page, 'home'); await tap(a.page, '#view #pl-chg-not').catch(() => {});
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(40) }, events: [], intake: { goal: 'irregular' }, mods: { plan: planOf('cycle', 'irregular', ago(50)) } } });
  await tap(b.page, '#view #pl-chg-not');
  check('6 "Not now" puts it away', !(await has(b.page, '#view .pl-sl-chg')));
  errsAll.push(...b.errs); await b.ctx.close();
  const c = await open({ seed: { situation: { deliveredOn: ago(4) }, events: [], intake: { goal: 'food', stage: 'preg' }, mods: { plan: planOf('preg', 'food', ago(60)) } } });
  check('6 her baby is born: the pregnancy plan ends, and the after-birth plan is offered', /Your baby is here/.test(await txt(c.page, '#view .pl-sl-chg')) && /See my after-birth plan/.test(await txt(c.page, '#view .pl-sl-chg')), await txt(c.page, '#view .today-card'));
  errsAll.push(...c.errs); await c.ctx.close();
  const d = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(40) }, events: [], intake: { goal: 'irregular' }, mods: { plan: planOf('cycle', 'irregular', ago(50)) }, settings: { discreet: true, toursAuto: false, notify: true } }, hash: '#plan' });
  const dv = await view(d.page);
  check('6 a shared phone: My plan says only that her plan changed (Today shows no plan cards while none runs)', /Your plan has changed/.test(dv) && !/pregnan/i.test(dv), dv.slice(0, 400));
  errsAll.push(...d.errs); await d.ctx.close();
}

/* ---------- 7. Her last plan is kept ---------- */
{
  const a = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(20), { log: logged(20, 3, 3) }) } }, hash: '#plan-settings' });   /* Version 39.15: Plan settings is a page of its own */
  await tap(a.page, '#view #pl-stop'); await tap(a.page, '#view #pl-stop-yes');
  const s = await st(a.page);
  check('7 stopping keeps the plan in d.past, with the days she followed', (s.mods.plan.past || [])[0] && s.mods.plan.past[0].pack === 'pain' && s.mods.plan.past[0].days === 9, s.mods.plan.past);
  check('7 ... My plan has no "Your last plan" card (Version 39.68: Undo and "Changed by mistake" bring it back)', !/Your last plan/.test(await view(a.page)), (await view(a.page)).slice(0, 400));
  const sum = await a.page.evaluate(() => JSON.stringify((window.Saathi.summaries() || []).filter((m) => m.mod === 'plan')));
  check('7 ... and her doctor report keeps its line', /Before this: Easier periods/.test(sum), sum);
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 8. A fair new 12 weeks ---------- */
{
  const l = {}; for (let i = 0; i < 84; i++) l[ago(90 - i)] = { min: 30, ck: { move: 'd' }, plate: { half: true, protein: true } };
  const a = await open({ seed: { intake: { goal: 'irregular' }, mods: { plan: planOf('cycle', 'irregular', ago(90), { log: l }) } }, hash: '#plan-end' });
  const v = await view(a.page);
  check('8 the end of 12 weeks: her steps carry on, or "Work on something else" (Version 39.27)', /Your steps carry on/.test(v) && /Work on something else/.test(v), v.slice(0, 500));
  await a.page.evaluate(() => { const S = window.Saathi; S.plan.startFromIntake({ stage: 'cycle', goal: 'irregular', gap: 'g45', skips: 'n', dx: 'n', signs: ['none'], act: 0, food: 'veg', milk: 'y', lim: [], bed: 'b23', work: 'day', when: 'evening' }); S.plan.start('today', '20:00'); S.save(); });
  const d = await a.page.evaluate(() => window.Saathi.state.mods.plan);
  check('8 the same goal again starts at her last 4 weeks\' minutes, with the habits she kept', d.base >= 200 && d.hab0 === 2 && (d.past || [])[0].pack === 'cycle', { base: d.base, hab0: d.hab0 });
  await go(a.page, 'home');
  const mins = await a.page.evaluate(() => { const S = window.Saathi; const a = S.plan.actions(); const y = a.find((x) => x.id === 'yoga'); return ((a.find((x) => x.id === 'move') || {}).mins || 0) + (y ? S.plan.routineMins(y.r, S.state.mods.plan) : 0); });
  check('8 ... so day 1 is her level (30 minutes, the most the plan asks, as her yoga and her walk), not back to 10', mins >= 30 && mins < 40, mins);
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 9. Pause for a week ---------- */
{
  const a = await open({ seed: { intake: { goal: 'pain' }, reminders: REM(), mods: { plan: planOf('pain', 'pain', ago(10)) } }, hash: '#plan-settings' });
  await tap(a.page, '#view #pl-pause');
  let s = await st(a.page);
  /* Version 39.5 review (ENGINE-03): the reminder stays on and starts again the day the pause ends, so the phone rings then */
  check('9 "Pause for a week": until 7 days from now, and the reminder rests until then', s.mods.plan.pauseUntil === iso(TODAY, 7) && s.reminders.find((r) => r.id === 'plan').on !== false && s.reminders.find((r) => r.id === 'plan').start === iso(TODAY, 7), [s.mods.plan.pauseUntil, s.reminders.find((r) => r.id === 'plan')]);
  await go(a.page, 'home');
  check('9 Today: "Paused until", "Start again now", and no steps', /Paused until/.test(await txt(a.page, '#view .pl-th')) && await has(a.page, '#view #pl-unpause') && !(await has(a.page, '#view .today-card [class*="today-plan-"]')));
  await a.page.clock.setFixedTime(at(8, '10:00')); await go(a.page, 'plan'); await go(a.page, 'home');
  s = await st(a.page);
  check('9 after the week, it carries on and the reminder comes back', !s.mods.plan.pauseUntil && s.reminders.find((r) => r.id === 'plan').on !== false, [s.mods.plan.pauseUntil, (s.reminders.find((r) => r.id === 'plan') || {}).on]);
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(25), { log: { [ago(18)]: { ck: { move: 'd' }, min: 15 } } }) } } });
  check('9 after 14 quiet days: one card with a week off instead of the restart card (Version 39.12: "Two quiet weeks")', /Two quiet weeks/.test(await txt(b.page, '#view .pl-sl-quiet')) && /Pause for a week/.test(await txt(b.page, '#view .pl-sl-quiet')) && !(await has(b.page, '#view .pl-sl-pause')) && !(await has(b.page, '#view .pl-sl-lapse')), await txt(b.page, '#view .slot'));
  await tap(b.page, '#view #pl-q-not');
  check('9 ... "Not now" asks once (the quiet card was the week-off offer)', !(await has(b.page, '#view .pl-sl-quiet')) && !(await has(b.page, '#view .pl-sl-pause')) && !!(await st(b.page)).mods.plan.pauseAsk);
  errsAll.push(...b.errs); await b.ctx.close();
  const b2 = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(25), { quietAt: ago(20), log: { [ago(18)]: { ck: { move: 'd' }, min: 15 } } }) } } });   /* a quiet card seen without a week-off answer */
  check('9 ... otherwise the one "Take a week off?" card', /Take a week off\?/.test(await txt(b2.page, '#view .pl-sl-pause')), await txt(b2.page, '#view .slot'));
  await tap(b2.page, '#view #pl-pause-not');
  check('9 ... "Not now" asks once', !(await has(b2.page, '#view .pl-sl-pause')));
  errsAll.push(...b2.errs); await b2.ctx.close();
  const c = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(10)) } }, hash: '#plan-settings' });
  await tap(c.page, '#view #pl-stop');
  check('9 the stop card offers "Or pause it for a week instead"', await has(c.page, '#view #pl-pause-alt'));
  errsAll.push(...c.errs); await c.ctx.close();
}

/* ---------- 10. Steps that count from their tools ---------- */
{
  const t1 = await open({ seed: { situation: { planning: true }, intake: { goal: 'ready', stage: 'ttc' }, mods: { plan: planOf('ttc', 'ready', ago(7)) } } });
  let a1 = await acts(t1.page);
  check('10 trying: the weekly checklist step is done in the checklist, not by a tap', a1.some((x) => /^prep:check:/.test(x)) && !(await has(t1.page, '#view .today-plan-prep [data-today-act]')), a1);
  await t1.page.evaluate(() => { const S = window.Saathi; const d = S.data('ttc'); d.prep = { folic: true }; d.prepAt = { folic: S.toISO(S.today()) }; S.save(); S.render(); }); await settle(t1.page, 200);
  a1 = await acts(t1.page);
  check('10 ... ticking an item today marks it done', a1.some((x) => /^prep:check:d/.test(x)), a1);
  errsAll.push(...t1.errs); await t1.ctx.close();
  const m1 = await open({ seed: { dob: '1976-03-01', situation: { midlife: true }, intake: { goal: 'sleep' }, mods: { plan: planOf('meno', 'sleep', ago(6)) } } });
  const ma = await acts(m1.page);
  check('10 midlife: no weekly symptom diary step (Version 39.68: the Diary logs the same signs)', !ma.some((x) => /^diary:/.test(x)), ma);
  errsAll.push(...m1.errs); await m1.ctx.close();
  const p1 = await open({ seed: { events: regular(1), intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(8)), relief: { log: [{ d: TODAY, id: 'cramps', r: 'yes' }] } } } });
  const pa = await acts(p1.page);
  check('10 pain: doing the cramps routine marks the cramps step done', pa.some((x) => /^cramps:tick:d/.test(x)), pa);
  errsAll.push(...p1.errs); await p1.ctx.close();
  /* a strength day's Done counts the strength day (journey audit P2-16) */
  const s1 = await open({ seed: { intake: { goal: 'irregular' }, mods: { plan: planOf('cycle', 'irregular', ago(8)) } } });   /* plan day 9: a strength day */
  const ok = await s1.page.evaluate(() => { const S = window.Saathi; const a = S.plan.actions().find((x) => x.id === 'yoga'); return a ? a.go : null; });   /* Version 39.13: strength is the yoga step */
  if (ok === 'plan-r-strength') {
    await go(s1.page, 'plan-checkin'); for (const g of await s1.page.$$eval('[data-ci]', (x) => [...new Set(x.map((y) => y.dataset.ci.split(':')[0]))])) await tap(s1.page, '[data-ci="' + g + ':' + (g === 'yoga' ? 'd' : 'n') + '"]'); await tap(s1.page, '#pl-ci-save');   /* Version 39.12: Today\'s button opens the routine; the check-in\'s Done counts it (39.13: on the yoga step) */
    check('10 a strength day: "Done" on the step counts the strength day', await s1.page.evaluate(() => { const d = window.Saathi.state.mods.plan; return Object.keys(d.log).some((k) => d.log[k].str); }));
  } else check('10 a strength day: (seed lands on a strength day)', false, ok);
  errsAll.push(...s1.errs); await s1.ctx.close();
}

/* ---------- 11. After the birth: the 6-week check, then walks ---------- */
{
  const a = await open({ seed: { situation: { deliveredOn: ago(37) }, events: [], intake: { goal: 'recovery', stage: 'post' }, mods: { plan: planOf('post', 'recovery', ago(30)) } } });
  const aa = await acts(a.page);
  check('11 days 35 to 42: "Your 6-week check" is a step', aa.some((x) => /^six:/.test(x)) && /6-week check/.test(await txt(a.page, '#view .today-card')), aa);
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: { situation: { deliveredOn: ago(50) }, events: [], intake: { goal: 'recovery', stage: 'post' }, mods: { plan: planOf('post', 'recovery', ago(40)) } } });
  const ba = await acts(b.page);
  check('11 after 6 weeks, recovery moves on: a short walk and the pelvic floor, no daily danger-sign check', ba.some((x) => /^move:minutes/.test(x)) && ba.some((x) => /^pelvic:/.test(x)) && !ba.some((x) => /^(rcheck|recovery):/.test(x)), ba);
  errsAll.push(...b.errs); await b.ctx.close();
}

/* ---------- 12. A shared phone, Hindi, a small screen ---------- */
{
  const a = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(9)) }, settings: { discreet: true, toursAuto: false, notify: true } }, hash: '#plan' });
  check('12 a shared phone: no health tile (no "For period cramps")', (await tiles(a.page)).indexOf('relief-cramps') < 0 && !/cramp/i.test(await view(a.page)), await tiles(a.page));
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: { lang: 'hi', intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(9)) } }, lang: 'hi', w: 360, h: 800, hash: '#plan' });
  const v = await view(b.page);
  check('12 Hindi: her week, her steps and the tiles in Hindi (Version 39.15)', /इस हफ़्ते/.test(v) && /आपके रोज़ के \d क़दम/.test(v) && /मेरी प्रगति|अब तक/.test(v), v.slice(0, 400));
  check('12 360 px: no sideways scroll on My plan', await noScroll(b.page));
  await shot(b.page, '12-hindi-360');
  await go(b.page, 'plan-checkin');
  check('12 Hindi: the rest-day button', /आज आराम का दिन/.test(await view(b.page)));
  errsAll.push(...b.errs); await b.ctx.close();
}
/* ---------- 13. The 24 Oct review of V39.4 and V39.5 (MODULE_API 47.1/48.1): 27 findings confirmed, all fixed ---------- */
{
  const POST = (days) => ({ situation: { deliveredOn: ago(days), breastfeeding: true }, events: [] });
  /* SAFETY-01, ENGINE-01: a heavy bleed in the first 6 weeks is never answered with a rest day, and the recovery check stays */
  const a = await open({ seed: Object.assign(POST(14), { events: [{ d: TODAY, t: 'start', pads: 'pads_4', clots: 'clots_2' }], mods: { plan: planOf('post', 'recovery', ago(10)) } }) });
  check('13 after a birth, a heavy bleed logged: no rest-day offer on Today', !(await has(a.page, '#view #pl-rest-yes')));
  await a.page.clock.setFixedTime(at(0, '20:30')); await go(a.page, 'plan-checkin');
  check('13 ... and no rest button in the check-in while the recovery check is undone', !(await has(a.page, '#view #pl-ci-rest')));
  for (const g of await a.page.$$eval('[data-ci]', (x) => [...new Set(x.map((y) => y.dataset.ci.split(':')[0]))])) await tap(a.page, '[data-ci="' + g + ':n"]');
  await tap(a.page, '#pl-ci-save'); await go(a.page, 'home');
  check('13 after the check-in, the daily recovery check is still on Today', await has(a.page, '#view .today-plan-rcheck'), await txt(a.page, '#view .today-card'));
  errsAll.push(...a.errs); await a.ctx.close();
  /* SAFETY-01, PAGES-01: no pause in pregnancy; a week's pause hands Today back to her stage's own cards */
  const p = await open({ seed: Object.assign(PREG(20), { mods: { plan: planOf('preg', 'food', ago(30)) } }), hash: '#plan-settings' });
  check('13 pregnancy: no "Pause for a week" in her plan settings', !(await has(p.page, '#view #pl-pause')));
  errsAll.push(...p.errs); await p.ctx.close();
  const q = await open({ seed: Object.assign(PREG(24), { mods: { plan: planOf('preg', 'food', ago(30)) } }) });
  check('13 pregnancy, 30 quiet days: no "Take a week off?"', !(await has(q.page, '#view .pl-sl-pause')));
  errsAll.push(...q.errs); await q.ctx.close();
  const r = await open({ seed: Object.assign(POST(70), { mods: { plan: planOf('post', 'weight', ago(40), { pauseUntil: iso(TODAY, 3) }) } }) });
  check('13 a paused after-birth plan: S.plan.running() is false, so her stage\'s own cards come back', (await r.page.evaluate(() => window.Saathi.plan.running())) === false);
  errsAll.push(...r.errs); await r.ctx.close();
  /* ENGINE-02, PAGES-02: a step done in its own tool counts the day */
  const pf = {}; for (let i = 1; i <= 20; i++) pf[ago(i)] = 2;
  const b = await open({ seed: Object.assign(POST(63), { mods: { post: { pf: pf }, plan: planOf('post', 'pelvic', ago(20)) } }) });
  check('13 pelvic floor sets done in their trainer count as days she followed her plan', (await b.page.evaluate((d) => window.Saathi.plan.dayDone(d), ago(1))) === true && !(await has(b.page, '#view .pl-sl-pause')) && !/Welcome back/.test(await txt(b.page, '#view .pl-th')));
  errsAll.push(...b.errs); await b.ctx.close();
  /* ENGINE-03: a reminder she deleted during the pause stays deleted */
  const c = await open({ seed: { intake: { goal: 'pain' }, reminders: REM(), mods: { plan: planOf('pain', 'pain', ago(10)) } }, hash: '#plan-settings' });
  await tap(c.page, '#view #pl-pause');
  await c.page.evaluate(() => { window.Saathi.reminders.remove('plan'); window.Saathi.save(); });
  await c.page.clock.setFixedTime(at(8, '10:00')); await go(c.page, 'plan'); await go(c.page, 'home');
  check('13 a reminder deleted during the pause is not brought back', !(await st(c.page)).reminders.find((x) => x.id === 'plan'));
  errsAll.push(...c.errs); await c.ctx.close();
  /* SAFETY-03: "Your plan has changed" after a birth only while its line holds (the first 6 weeks) */
  const d1 = await open({ seed: Object.assign(POST(10), { mods: { plan: planOf('preg', 'food', ago(200)) } }), hash: '#plan' });
  const d2 = await open({ seed: Object.assign(POST(50), { mods: { plan: planOf('preg', 'food', ago(240)) } }), hash: '#plan' });
  check('13 "Your plan has changed": 10 days after the birth, yes; 50 days after, no', (await has(d1.page, '#view .pl-chg')) && !(await has(d2.page, '#view .pl-chg')));
  errsAll.push(...d1.errs, ...d2.errs); await d1.ctx.close(); await d2.ctx.close();
  /* SAFETY-04: ticking a check-up that isn't due doesn't tick "Due now" */
  const e = await open({ seed: Object.assign(PREG(10), { mods: { plan: planOf('preg', 'food', ago(14)), preg: { plan: { done: { jssk: TODAY } } } } }) });
  check('13 pregnancy: ticking an item that isn\'t due yet leaves "Due now" undone', (await e.page.evaluate(() => window.Saathi.plan.actions().find((x) => x.id === 'pdue') || {})).state !== 'd');
  errsAll.push(...e.errs); await e.ctx.close();
  /* ENGINE-05, SAFETY-07, PAGES-04: her last plan's real end; a past pregnancy plan after a loss isn't shown */
  const f = await open({ seed: { intake: { goal: 'irregular' }, mods: { plan: planOf('cycle', 'irregular', ago(100)) } } });
  await f.page.evaluate(() => { const S = window.Saathi; S.plan.startFromIntake({ stage: 'cycle', goal: 'pain', pain: 'pk', painDays: '23', act: 0, bed: 'b23', work: 'day', when: 'evening', food: 'veg', lim: ['none'] }); S.plan.start('today', '20:00'); S.save(); });
  const fp = (await st(f.page)).mods.plan.past[0];
  check('13 a finished plan is kept with its own last day, not today', fp && fp.end === iso(ago(100), 83) && fp.pack === 'cycle', fp);
  errsAll.push(...f.errs); await f.ctx.close();
  const g = await open({ seed: { situation: { pregEndedOn: ago(10), pregEndedHow: 'loss' }, events: [], mods: { plan: { past: [{ pack: 'preg', goalKey: 'food', pv: 1, start: ago(90), end: ago(10), days: 20, wk: 12, weeks: {} }] } } }, hash: '#plan' });
  check('13 after a loss, no "Your last plan" card for the pregnancy plan', !(await has(g.page, '#view .pl-past')));
  errsAll.push(...g.errs); await g.ctx.close();
  /* PAGES-05: the 6-week check is a one-time step */
  const h = await open({ seed: Object.assign(POST(37), { mods: { plan: planOf('post', 'recovery', ago(30), { log: { [ago(1)]: { ci: 1, ck: { six: 'd' } } } }) } }) });
  const ha = await acts(h.page);
  check('13 the 6-week check, done yesterday, stays done today', ha.some((x) => /^six:link:d/.test(x)) && (await has(h.page, '#view .today-plan-six.today-ok')), ha);   /* Version 39.14: a done step stays, ticked */
  errsAll.push(...h.errs); await h.ctx.close();
  /* PAGES-06: the trying plan's checklist step rests once the checklist is complete */
  const tk = await open({ seed: { situation: { planning: true }, mods: { plan: planOf('ttc', 'ready', ago(7)) } } });
  const all = await tk.page.evaluate(() => { const S = window.Saathi; const n = S.ttc.prepDone().b; const st = S.data('ttc'); st.prep = st.prep || {}; return n; });
  await tk.page.evaluate((ks) => { const S = window.Saathi; const st = S.data('ttc'); st.prep = {}; ks.forEach((k) => { st.prep[k] = true; }); S.save(); }, ['folic', 'hb', 'bg', 'sugar', 'tsh', 'infect', 'thal', 'rubella', 'bmi', 'dental', 'tobacco', 'meds', 'control', 'p_tests', 'p_tobacco', 'p_meds', 'p_read']);
  const full = await tk.page.evaluate(() => { const p = window.Saathi.ttc.prepDone(); return p.a >= p.b; });
  check('13 the trying plan: no checklist step once every item is ticked', full && !(await acts(tk.page)).some((x) => /^prep:/.test(x)), [all, full, await acts(tk.page)]);
  errsAll.push(...tk.errs); await tk.ctx.close();
  /* PAGES-07, PAGES-09: every plan's month card opens My progress; the end page promises the carry-over only on the cycle plan */
  const m = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(28)) } } });
  if (await has(m.page, '#view #pl-m-go')) { await tap(m.page, '#view #pl-m-go'); check('13 a light plan\'s month card opens My progress', (await m.page.evaluate(() => location.hash)) === '#plan-progress'); }
  else check('13 a light plan\'s month card opens My progress (card present)', false, await txt(m.page, '#view .slot'));
  errsAll.push(...m.errs); await m.ctx.close();
  const n = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(90)) } }, hash: '#plan-end' });   /* Version 39.27: her results page while her steps carry on */
  check('13 a pain plan\'s end page: "Pick a goal for your next plan."', /Pick a goal for your next plan\./.test(await view(n.page)) && !/starts from where you are now/.test(await view(n.page)));
  errsAll.push(...n.errs); await n.ctx.close();
  /* ENGINE-08, PAGES-10: after the pause offer, the restart card comes once a week (Mondays) */
  const lp = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(33), { pauseAsk: ago(1) }) } } });   /* not a look-back day either day */
  check('13 still quiet after "Not now": no restart card on a Tuesday', !(await has(lp.page, '#view .pl-sl-lapse')));
  await lp.page.clock.setFixedTime(at(6, '10:00')); await go(lp.page, 'home');
  check('13 ... and one on Monday', await has(lp.page, '#view .pl-sl-lapse'), await txt(lp.page, '#view .slot'));
  errsAll.push(...lp.errs); await lp.ctx.close();
  /* ENGINE-10: a plan that starts tomorrow offers no pause */
  const so = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', iso(TODAY, 1)) } }, hash: '#plan' });
  check('13 a plan starting tomorrow: no "Pause for a week"', !(await has(so.page, '#view #pl-pause')) && !(await has(so.page, '#view #pl-pause-alt')));
  errsAll.push(...so.errs); await so.ctx.close();
}
check('12 no page errors', errsAll.length === 0, errsAll.slice(0, 5));

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(results.length - failed.length + '/' + results.length + ' checks passed');
if (failed.length) process.exit(1);
