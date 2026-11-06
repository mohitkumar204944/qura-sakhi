// Version 39.74, the phone walk's fixes (Mohit, 6 Nov: "can you do needful and test everything thoroughly live walkthrough on phone";
// his Flip5 on vc 125, findings in MODULE_API section 117). This file checks:
// - 1 the PMOS plan's walk question asks when a walk is easiest and says what Sakhi does with it (her nudge); the other plans keep theirs;
// - 2 Plan settings: the check-in's times right under "Remind me every day", then "Change what I work on";
// - 3 My plan's "Every week" never says "plan the week" (Plan your week is gone since Version 39.68);
// - 4 the reveal names her Kegel sets once: as a step when they are one, as the later line when they join later;
// - 5 the Start card names her folic acid tablet's reminder when it rings from day 1 ("your 9 pm tablet" in discreet mode);
// - 6 "1 week pregnant";
// - 7 search: her stage's guides first, other stages' guides and a loss page she didn't ask about after them (never dropped);
// - 8 the language page: no "Why some pages are still in Hindi or English" with English and Hindi only;
// - 9 a touch screen: the tab bar, the + button and the playing bar step aside while she types;
// - 10 after a birth, "My periods have stopped" or "Periods changing after 40": the reviewed line, no POI card, her stage and every baby
//   line stay; leaving for Tracking still stops the baby lines (Version 39.68);
// - 12 the test app's walk on the phone: an after-meal nudge quiet once her walk is done, "Before: …" in Month 1, the end card alone;
// - 11 Hindi at 360 px, and no page errors.
// Usage: node test/phonewalk.mjs [web dir]
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
const LOCAL = { app: '0.39.74-pilot', platform: 'android' };
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
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata', hasTouch: !!o.touch, isMobile: !!o.touch });
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


const DAY = { act: '0', food: 'veg', milk: 'y', lim: [], bed: 'b23', work: 'day', when: 'evening' };
const make = (page, ans) => page.evaluate((ans) => { const S = window.Saathi; const d = S.plan.startFromIntake(ans); S.save(); location.hash = '#plan-reveal'; return !!d; }, ans);
const rv = async (page) => { await settle(page, 600); return txt(page, '#view'); };
/* the intake at its "when" screen: the screen number is found, not assumed */
const whenScreen = async (page, ans) => {
  for (let i = 0; i < 8; i++) {
    await page.evaluate(([a, i]) => { window.Saathi.mem.planIntake = Object.assign({}, a, { iq: i }); location.hash = '#plan-goal'; window.Saathi.render(); }, [ans, i]);
    await settle(page, 300);
    if (await has(page, '#view [data-pl-when]')) return txt(page, '#view');
  }
  return '';
};

/* ---------- 1. The PMOS plan's walk question ---------- */
{
  let a = await open({ seed: {}, hash: '#plan' });
  const v = await whenScreen(a.page, { stage: 'cycle', goal: 'pmos', gap: 'n', skips: 'n', signs: ['none'] });
  check('1.1 PMOS: "When is a walk easiest for you?" and what Sakhi does with it (her nudge)', /When is a walk easiest for you\?/.test(v) && /Sakhi nudges you to walk at this time each day\./.test(v) && !/When can you move for 10 minutes/.test(v) && !/puts your walk/.test(v), v.slice(0, 300));
  check('1.1 ... never a question about reminders (Version 39.27)', !/remind you/i.test(v), v.slice(0, 300));
  check('1.1 ... the same five times to choose', (await a.page.$$('#view [data-pl-when]')).length === 5);
  await done(a);
  a = await open({ seed: { situation: { planning: true }, intake: { goal: 'ready', stage: 'ttc' } }, hash: '#plan' });
  const v2 = await whenScreen(a.page, { stage: 'ttc', goal: 'ready', bdoc: 'std', trying: 'lt6' });
  check('1.2 Getting ready (her walk is at her time): the question as it was', /When can you move for 10 minutes\?/.test(v2) && /Sakhi puts your walk at this time each day\./.test(v2), v2.slice(0, 300));
  await done(a);
  a = await open({ seed: {}, hash: '#plan' });
  const v3 = await whenScreen(a.page, { stage: 'cycle', goal: 'heavy', pads: 'p23', clots: 'n', tired: 'n' });
  check('1.3 My period plan: the question as it was', /When can you move for 10 minutes\?/.test(v3), v3.slice(0, 300));
  await done(a);
}

/* ---------- 2. Plan settings: the times under their reminder ---------- */
{
  const a = await open({ seed: pmos(5, did(1, 2)), hash: '#plan-settings' });
  const ord = await a.page.evaluate(() => { const r = document.querySelector('#view #pl-rem'); const c = document.querySelector('#view .chips [data-pl-at]'); const g = document.querySelector('#view #pl-chg');
    if (!r || !c || !g) return null; const before = (x, y) => !!(x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING);
    return { rc: before(r, c), cg: before(c, g), sameList: r.closest('.list') === g.closest('.list') }; });
  check('2.1 "Remind me every day", then its times, then "Change what I work on" in a list of its own', !!ord && ord.rc && ord.cg && !ord.sameList, ord);
  await tap(a.page, '#view [data-pl-at="21:00"]');
  check('2.2 a time still sets her check-in', ((await st(a.page)).reminders.find((r) => r.id === 'plan') || {}).time === '21:00');
  await done(a);
}

/* ---------- 3. My plan: "Every week" ---------- */
{
  let a = await open({ seed: pmos(3, did(1, 2)), hash: '#plan' });
  let v = await view(a.page);
  check('3.1 PMOS plan: "Every week" says "A look back", never "plan the week"', /A look back/.test(v) && !/plan the week/i.test(v), v.slice(0, 600));
  await done(a);
  a = await open({ seed: Object.assign(pmos(3, did(1, 2)), { lang: 'hi' }), hash: '#plan', lang: 'hi' });
  v = await view(a.page);
  check('3.2 ... and in Hindi', /एक नज़र पीछे/.test(v) && !/हफ़्ता तय करें/.test(v), v.slice(0, 600));
  await done(a);
  const keys = await (async () => { const b = await open({ seed: {} }); const k = await b.page.evaluate(() => [window.Saathi.t('plan_rh_wk_s'), window.Saathi.t('plan_rh_wk_s2')]); await done(b); return k; })();
  check('3.3 the old line is gone from Sakhi\'s words', keys[0] === 'plan_rh_wk_s' && keys[1] === 'A look back', keys);
}

/* ---------- 4. The reveal names her Kegel sets once ---------- */
{
  let a = await open({ seed: { situation: { planning: true }, intake: { goal: 'ready', stage: 'ttc' }, goals: ['ready', 'pelvic'] }, hash: '#plan' });
  await make(a.page, Object.assign({}, DAY, { goal: 'ready', stage: 'ttc', bdoc: 'std', trying: 'lt6' }));
  let v = await rv(a.page);
  check('4.1 Getting ready with her pelvic floor goal: her sets are a step, named once', (v.match(/Kegel sets/g) || []).length === 1 && !/your Kegel sets, 3 a day/.test(v), v.slice(0, 900));
  await done(a);
  /* Mohit's phone: pain and heavy periods both hers, so her Hb test takes the third day-1 place and her sets come later */
  a = await open({ seed: { goals: ['pain', 'heavy', 'pelvic'] }, hash: '#plan' });
  await make(a.page, Object.assign({}, DAY, { goal: 'pain', stage: 'cycle', pain: 'pk', painDays: '23', endo: 'n' }));
  v = await rv(a.page);
  check('4.2 My period plan, her sets not a day-1 step: named once, in the later lines', (v.match(/your Kegel sets, 3 a day/g) || []).length === 1 && (v.match(/Kegel sets/g) || []).length === 1, v.slice(0, 900));
  await done(a);
  a = await open({ seed: { goals: ['pain', 'pelvic'] }, hash: '#plan' });
  await make(a.page, Object.assign({}, DAY, { goal: 'pain', stage: 'cycle', pain: 'pk', painDays: '23', endo: 'n' }));
  v = await rv(a.page);
  check('4.3 My period plan, her sets a day-1 step: named once, as the step', (v.match(/Kegel sets/g) || []).length === 1 && !/your Kegel sets, 3 a day/.test(v), v.slice(0, 900));
  await done(a);
}

/* ---------- 5. The Start card names her folic acid tablet ---------- */
{
  const ttc = (x) => Object.assign({ situation: { planning: true }, intake: { goal: 'ready', stage: 'ttc' } }, x || {});
  const card = async (seed, cfg) => { const a = await open({ seed: seed, hash: '#plan', config: cfg }); await make(a.page, Object.assign({}, DAY, { goal: 'ready', stage: 'ttc', bdoc: 'std', trying: 'lt6' })); await settle(a.page, 600); const r = await txt(a.page, '#view .pl-st-rem'); await done(a); return r; };
  let r = await card(ttc({ mods: { ttc: { folic: { has: ago(5) } } } }));
  check('5.1 she has her tablets: "your 9 pm folic acid tablet", after her check-in', /your 8 pm check-in.*your 9 pm folic acid tablet/.test(r), r);
  r = await card(ttc());
  check('5.2 no tablets yet (the step asks first): no tablet reminder named', !/tablet/.test(r) && /check-in/.test(r), r);
  r = await card(ttc({ mods: { ttc: { folic: { has: ago(5), rem: false } } } }));
  check('5.3 she switched it off: not named', !/tablet/.test(r), r);
  r = await card(ttc({ mods: { ttc: { folic: { has: ago(5) } } }, settings: { discreet: true } }));
  check('5.4 discreet mode: "your 9 pm tablet", no "folic"', /your 9 pm tablet/.test(r) && !/folic/i.test(r), r);
}

/* ---------- 6. "1 week pregnant" ---------- */
{
  for (const [n, w, re] of [[9, 1, /^1\s*week pregnant/], [16, 2, /^2\s*weeks pregnant/]]) {
    const a = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(n) }, intake: { goal: 'track', stage: 'preg' }, events: [{ d: ago(n), t: 'start' }] } });
    const big = await a.page.evaluate(() => { const b = document.querySelector('#view #bignum'); return b ? (b.innerText + ' ' + (b.nextElementSibling ? b.nextElementSibling.innerText : '')).replace(/\s+/g, ' ').trim() : ''; });
    check('6.' + w + ' week ' + w + ': "' + (w === 1 ? '1 week pregnant' : '2 weeks pregnant') + '"', re.test(big), big);
    await done(a);
  }
}

/* ---------- 7. Search: her stage's guides first ---------- */
{
  const tools = (page, q) => page.evaluate(async (q) => { const i = document.querySelector('#care-q'); i.value = q; i.dispatchEvent(new Event('input')); await new Promise((r) => setTimeout(r, 50)); const s = document.querySelector('#view .care-sec'); return s ? [...s.querySelectorAll('[data-go]')].map((x) => x.dataset.go) : []; }, q);
  const other = (r) => /^post-|^loss|^meno|^pregtest-(abortion|after)$|-loss/.test(r);
  let a = await open({ seed: {}, hash: '#care' });
  await settle(a.page, 300);
  let l = await tools(a.page, 'heavy bleeding and dizzy'); await settle(a.page, 300); l = await tools(a.page, 'heavy bleeding and dizzy');
  const firstOther = l.findIndex(other); const lastMine = l.map((r) => !other(r)).lastIndexOf(true);
  check('7.1 tracking her periods: her guides first, the after-birth, menopause, loss and abortion pages after them', l.length > 0 && (firstOther < 0 || firstOther > lastMine), l);
  check('7.1 ... never dropped: they are still in the list', l.some(other) && l.indexOf('pregtest-after') >= 0, l);
  l = await tools(a.page, 'abortion bleeding'); await settle(a.page, 300); l = await tools(a.page, 'abortion bleeding');
  check('7.2 she asks about an abortion: its pages lead', ['pregtest-after', 'pregtest-abortion'].indexOf(l[0]) >= 0 && ['pregtest-after', 'pregtest-abortion'].indexOf(l[1]) >= 0, l.slice(0, 4));
  await done(a);
  a = await open({ seed: { situation: { deliveredOn: ago(12), breastfeeding: true }, intake: { goal: 'recovery', stage: 'post' }, events: [] }, hash: '#care' });
  l = await tools(a.page, 'bleeding'); await settle(a.page, 300); l = await tools(a.page, 'bleeding');
  check('7.3 after a birth: her after-birth pages are hers, so they stay up', l.slice(0, 4).some((r) => /^post-/.test(r)), l.slice(0, 6));
  await done(a);
}

/* ---------- 8. The language page ---------- */
{
  const a = await open({ seed: {}, hash: '#lang' });
  const v = await view(a.page);
  check('8.1 English and Hindi only: no "Why some pages are still in Hindi or English"', /English/.test(v) && /हिंदी/.test(v) && !/Why some pages are still/.test(v), v.slice(0, 500));
  await done(a);
}

/* ---------- 9. A touch screen: the bars step aside while she types ---------- */
{
  const shown = (page) => page.evaluate(() => ['#tabbar', '#fab-root'].map((s) => { const e = document.querySelector(s); return e ? getComputedStyle(e).display !== 'none' : null; }));
  let a = await open({ seed: {}, hash: '#care', touch: true, w: 360, h: 800 });
  const b0 = await shown(a.page); await a.page.focus('#care-q'); await settle(a.page, 200); const b1 = await shown(a.page);
  await a.page.evaluate(() => document.activeElement.blur()); await settle(a.page, 200); const b2 = await shown(a.page);
  check('9.1 the tab bar shows, steps aside while she types, and comes back', b0[0] === true && b1[0] === false && b2[0] === true, { b0, b1, b2 });
  await done(a);
  a = await open({ seed: {}, hash: '#care' });
  await a.page.focus('#care-q'); await settle(a.page, 200); const c1 = await shown(a.page);
  check('9.2 a computer (no on-screen keyboard): it stays', c1[0] === true, c1);
  await done(a);
}

/* ---------- 10. After a birth: periods stopped, or changing ---------- */
{
  const post = (x) => Object.assign({ dob: '1996-05-01', situation: { deliveredOn: ago(10), breastfeeding: true }, intake: { goal: 'recovery', stage: 'post' }, events: [] }, x || {});
  const sheet = async (page, k) => { await page.evaluate((k) => window.Saathi.openStage(k), k); await settle(page, 400); return txt(page, '#sheet-root'); };
  const save = async (page) => { const b = await page.$('#sheet-root #st-save'); if (b) { await b.click(); await settle(page, 600); } };
  let a = await open({ seed: post() });
  let v = await sheet(a.page, 'meno');
  check('10.1 at 30, 10 days after the birth, "My periods have stopped": the reviewed line, no POI card', /Sakhi counts the days since your baby’s birth\. Periods can come back any time/.test(v) && !(await has(a.page, '#sheet-root .st-poi')) && !/premature ovarian/i.test(v), v.slice(0, 600));
  await save(a.page);
  let s = (await st(a.page)).situation;
  const stage = await a.page.evaluate(() => window.Saathi.stageNow());
  check('10.2 Save: still "I had a baby", every baby line on (no babyOff), no POI flag, not stopped', stage === 'post' && !s.babyOff && !s.stopAsk && !s.stopped && !s.midlife && s.breastfeeding === true, { stage, s });
  check('10.2 ... and no sheet left open', !(await has(a.page, '#sheet-root .sheet')));
  v = await sheet(a.page, 'mid');
  check('10.3 "Periods changing after 40": the same line, no "What\'s happening for you?"', /Periods can come back any time/.test(v) && !(await has(a.page, '#sheet-root .st-age')), v.slice(0, 400));
  await save(a.page);
  check('10.3 ... nothing changes', (await a.page.evaluate(() => window.Saathi.stageNow())) === 'post' && !(await st(a.page)).situation.babyOff);
  await done(a);
  a = await open({ seed: post({ dob: '1982-05-01' }) });
  v = await sheet(a.page, 'meno');
  check('10.4 at 44 after a birth: the same line, no "Have your periods stopped since…?" and no menopause', /Periods can come back any time/.test(v) && !(await has(a.page, '#sheet-root .st-last')), v.slice(0, 400));
  await save(a.page); s = (await st(a.page)).situation;
  check('10.4 ... her after-birth stage and baby lines stay', (await a.page.evaluate(() => window.Saathi.stageNow())) === 'post' && !s.stopped && !s.babyOff, s);
  await done(a);
  /* the doctors' rule stays: leaving "I had a baby" for Tracking stops every baby line (her period after the birth logged) */
  a = await open({ seed: post({ situation: { deliveredOn: ago(30), breastfeeding: false } }) });
  await sheet(a.page, 'cycle'); await save(a.page);
  check('10.5 leaving "I had a baby" for Tracking: the baby lines stop, as Version 39.68', (await st(a.page)).situation.babyOff === TODAY, (await st(a.page)).situation);
  await done(a);
}

/* ---------- 12. The test app's walk on the phone: the after-meal nudge, "Before:", the end card alone ---------- */
{
  const nudge = (page) => page.evaluate(() => { const r = (window.Saathi.state.reminders || []).find((x) => x.id === 'plan-nudge'); return r ? { at: r.time, doneOn: r.doneOn || null } : null; });
  const tickWalk = (page) => page.$$eval('#view .today-tick', (bs) => { const b = bs.find((x) => /Walk after lunch/.test(x.getAttribute('aria-label') || '')); if (b) b.click(); return !!b; });
  let a = await open({ seed: pmos(5, {}, {}, { when: 'dinner' }) });
  const n0 = await nudge(a.page); const tk = await tickWalk(a.page); await settle(a.page, 600); const n1 = await nudge(a.page);
  check('12.1 after dinner: her walk ticked, tonight\'s "Time for your walk, right after the meal" stays quiet (her yoga still to do)', !!n0 && n0.at === '21:15' && !n0.doneOn && tk && n1 && n1.doneOn === TODAY, { n0, n1, tk });
  await done(a);
  a = await open({ seed: pmos(5, {}, {}, { when: 'morning' }) });
  await tickWalk(a.page); await settle(a.page, 600); const n2 = await nudge(a.page);
  check('12.2 in the morning ("Yoga before you eat, then your walk"): it still waits for her yoga', !!n2 && !n2.doneOn, n2);
  await done(a);
  a = await open({ seed: Object.assign(pmos(28, did(26, 25)), { events: regular(2) }) });
  let v = await view(a.page);
  check('12.3 Month 1 done: "Before: …", never "Before 40"', /Month 1 done/.test(v) && /Before: \d/.test(v) && !/Before \d/.test(v), v.slice(0, 900));
  await done(a);
  a = await open({ seed: pmos(84, did(40, 39)) });
  v = await view(a.page);
  check('12.4 day 85: her end card, with no "Two quiet weeks" or "Take a week off?" beside it', /Your 12 weeks are done/.test(v) && !/Two quiet weeks/.test(v) && !/Take a week off\?/.test(v), v.slice(0, 900));
  await done(a);
}

/* ---------- 11. Hindi at 360 px, and no page errors ---------- */
{
  let a = await open({ seed: { lang: 'hi' }, hash: '#plan', lang: 'hi', w: 360, h: 800 });
  const v = await whenScreen(a.page, { stage: 'cycle', goal: 'pmos', gap: 'n', skips: 'n', signs: ['none'] });
  check('11.1 Hindi: the walk question in Sakhi\'s Hindi', /आपके लिए सैर का सबसे आसान समय कब है\?/.test(v) && /Sakhi हर दिन इसी समय आपको सैर की याद दिलाएगी/.test(v) && await noScroll(a.page), v.slice(0, 300));
  await done(a);
  a = await open({ seed: Object.assign(pmos(5, did(1, 2)), { lang: 'hi' }), hash: '#plan-settings', lang: 'hi', w: 360, h: 800 });
  check('11.2 Hindi Plan settings at 360 px: no sideways scroll', await noScroll(a.page) && await has(a.page, '#view #pl-chg'));
  await done(a);
}

check('no page errors', errsAll.length === 0, errsAll.slice(0, 5));
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(results.length - failed.length + '/' + results.length + ' passed');
if (failed.length) process.exit(1);
