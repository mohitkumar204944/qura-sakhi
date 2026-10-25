// Version 39.3: food and search in her words; joining asks only what it uses (docs/roadmap-v39-2026-10-24.md, section 3;
// MODULE_API section 46). This file checks:
//   1 My food: how she eats (vegetarian unless she says otherwise, Jain, no milk) and her stage's food pages;
//   2 one foods table, read by her plate and filtered by how she eats;  3 the gate: no pregnancy-caution food reaches a
//   pregnant woman;  4 Explore's Food card and search in her words;  5 joining asks only what the plan uses, with her
//   diary's answers and her knees or back;  6 food steps lead somewhere; yoga and moves from every plan;  7 the reveal one
//   card shorter;  8 Hindi, 360 px, no page errors.
// Usage: node test/food.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'food'); fs.mkdirSync(SHOTS, { recursive: true });
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
const LOCAL = { app: '0.39.3-pilot', platform: 'android' };
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

const cyc6 = (gaps, last) => { const ds = [last]; let x = last; for (let i = gaps.length - 1; i >= 0; i--) { x += gaps[i]; ds.unshift(x); } const out = []; ds.forEach((a) => out.push({ d: ago(a), t: 'start' }, { d: ago(a - 4), t: 'end' })); return out; };
/* the food lists on My plate (not the choice chips or the plate's legend) */
const plateText = async (page) => { await go(page, 'plan-plate'); return page.$$eval('#view .pl-fcard', (x) => x.map((y) => y.textContent).join(' | ')); };
const MEN = (dob) => ({ dob: dob || '1996-05-01' });
/* My plan's "What do you want to work on?": pick a goal and answer until the screen with question `until` (or the end) */
async function goalFlow(page, goal, until) {
  await go(page, 'plan'); await tap(page, '#view [data-pl-pick="' + goal + '"]');
  for (let i = 0; i < 8; i++) {
    const keys = await page.$$eval('[data-pl-q],[data-pl-m]', (bs) => [...new Set(bs.map((b) => (b.dataset.plQ || b.dataset.plM).replace(/:.*/, '')))]);
    if (until && keys.indexOf(until) >= 0) return keys;
    if (await has(page, '#pl-in-make')) return keys;
    if (await has(page, '[data-pl-when]')) { await tap(page, '[data-pl-when="dinner"]'); continue; }
    if (await has(page, '#pl-in-skip')) { await tap(page, '#pl-in-skip'); continue; }
    const groups = await page.$$eval('[data-pl-q],[data-pl-m]', (bs) => [...new Set(bs.map((b) => (b.dataset.plQ || b.dataset.plM).replace(/:.*/, '') + '|' + (b.dataset.plQ ? 'q' : 'm')))]);
    for (const g of groups) { const [k, kind] = g.split('|'); if (!(await has(page, '[data-pl-' + kind + '^="' + k + ':"].on'))) await tap(page, '[data-pl-' + kind + '^="' + k + ':"]'); }
    if (!(await has(page, '#pl-in-next'))) return keys;
    await tap(page, '#pl-in-next');
  }
  return [];
}

/* ---------- 1. My food: how she eats, and her stage's food pages (diet audit 5.1, 3.2) ---------- */
{
  const a = await open({ seed: { events: regular(10) }, hash: '#food' });
  const v = await vtext(a.page);
  check('1 My food: Vegetarian is chosen unless she says otherwise', /How you eat/.test(v) && await has(a.page, '#view [data-food-type="veg"].on') && (await a.page.$$('#view [data-food-type]')).length === 4);
  check('1 ... with Jain and "I don\'t take milk, curd or paneer"', /Jain: no onion, garlic or root vegetables/.test(v) && /I don’t take milk, curd or paneer/.test(v));
  const rows = await a.page.$$eval('#view .food-rows [data-go]', (x) => x.map((y) => y.dataset.go));
  check('1 tracking her periods: her plate, food that builds blood, fasting days', rows.join() === 'plan-plate,cond-anaemia,periods-fasting', rows);
  await shot(a.page, '01-my-food'); errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: PREG(20), hash: '#food' });
  const rb = await b.page.$$eval('#view .food-rows [data-go]', (x) => x.map((y) => y.dataset.go));
  check('1 pregnant: food in pregnancy first, and no PMOS plate', rb[0] === 'preg-diet' && rb.indexOf('plan-plate') < 0, rb);
  errsAll.push(...b.errs); await b.ctx.close();
  const c = await open({ seed: { dob: '1977-03-01', events: regular(10) }, hash: '#food' });
  const rc = await c.page.$$eval('#view .food-rows [data-go]', (x) => x.map((y) => y.dataset.go));
  check('1 at 49: calcium from her kitchen first', rc[0] === 'meno-bones', rc);
  errsAll.push(...c.errs); await c.ctx.close();
  const d = await open({ seed: { situation: { deliveredOn: ago(30), breastfeeding: true }, events: [] }, hash: '#food' });
  const rd = await d.page.$$eval('#view .food-rows [data-go]', (x) => x.map((y) => y.dataset.go));
  check('1 after a birth: food while she breastfeeds', rd.indexOf('post-feed') >= 0, rd);
  errsAll.push(...d.errs); await d.ctx.close();
  const e = await open({ seed: Object.assign({}, PREG(20), { settings: { discreet: true, toursAuto: false, notify: true } }), hash: '#food' });
  check('1 a shared phone: no stage words on My food', !/pregnan|breastfeed|blood/i.test(await vtext(e.page)), (await vtext(e.page)).slice(0, 300));
  errsAll.push(...e.errs); await e.ctx.close();
}

/* ---------- 2. One foods table, read by her plate, filtered by how she eats (diet audit 3.1, 2.9) ---------- */
{
  const a = await open({ seed: { events: regular(10) } });
  let v = await plateText(a.page);
  check('2 vegetarian by default: no eggs, fish or meat on her plate', !/Eggs|egg bhurji|Fish|chicken/i.test(v) && /Green leafy sabzi/.test(v), v.slice(0, 400));
  await a.page.evaluate(() => window.Saathi.food.set('nonveg', true)); v = await plateText(a.page);
  check('2 fish or meat too: they show', /Fish or chicken, not fried/.test(v));
  await a.page.evaluate(() => window.Saathi.food.set('jain', true)); v = await plateText(a.page);
  check('2 Jain: no carrots, sprouts or onion dishes', !/gajar|Sprouts|carrot|sprouts chaat|Jhalmuri/i.test(v) && /Green leafy sabzi/.test(v), v.match(/.{0,30}(gajar|Sprouts|carrot).{0,30}/i));
  await a.page.evaluate(() => window.Saathi.food.set('veg', false)); v = await plateText(a.page);
  check('2 no milk: no curd, paneer, milk or chaas', !/Curd, paneer, milk|Chaas or lassi|Paneer, dahi/.test(v), v.match(/.{0,30}(paneer|Chaas).{0,30}/i));
  await go(a.page, 'food');
  check('2 My food shows the change, and the plan keeps going', await has(a.page, '#view [data-food-type="veg"].on') && await a.page.$eval('#food-milk', (x) => x.checked));
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 3. The gate: no pregnancy-caution food reaches a pregnant woman ---------- */
{
  const a = await open({ seed: PREG(20) });
  const v = await plateText(a.page);
  check('3 pregnant: no papaya on her plate', !/papaya|पपीता/i.test(v), v.match(/.{0,30}papaya.{0,30}/i));
  await a.page.evaluate(() => window.Saathi.food.set('nonveg', true)); const v2 = await plateText(a.page);
  check('3 pregnant: sprouts only cooked, on any plate she sees', !/\bSprouts\b(?!, cooked)/.test(v2.replace(/cooked sprouts/g, '')) && !/papaya/i.test(v2), v2.match(/.{0,30}[Ss]prouts.{0,30}/g));
  const caution = await a.page.evaluate(() => { const S = window.Saathi; const T = S.food.table; const all = T.MORE.concat(T.LESS, ...Object.values(T.LOCAL)); return all.filter((x) => /papaya|sprouts/i.test(x[1]) && !x[5]).map((x) => x[1]); });
  check('3 every papaya or sprouts food in the table has a pregnancy version', caution.length === 0, caution);
  const s1 = await search(a.page, 'khana');
  check('3 pregnant: "khana" finds food in pregnancy first', s1[0] === 'preg-diet' && s1.indexOf('food') >= 0, s1.slice(0, 4));
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 4. Explore and search in her words (diet audit 5.2, journey audit P3-06) ---------- */
{
  const a = await open({ seed: { events: regular(10) }, hash: '#care' });
  /* her stage's own topic stays first (pregnancy, a loss), and My food comes straight after it */
  check('4 Explore: the Food card comes right after her first topic', (await a.page.$$eval('#view .topic-grid [data-go]', (bs) => bs.map((b) => b.dataset.go)))[1] === 'food', await a.page.$$eval('#view .topic-grid [data-go]', (bs) => bs.map((b) => b.dataset.go)));
  for (const q of ['khana', 'nashta', 'recipe', 'jain', 'sabzi', 'doodh', 'sattu', 'क्या खाएं', 'thali']) { const r = await search(a.page, q); check('4 search "' + q + '" opens My food first', r[0] === 'food', r.slice(0, 4)); }
  for (const [q, r0] of [['vrat', 'periods-fasting'], ['iftar', 'periods-fasting'], ['yoga', 'plan-moves'], ['जननी सुरक्षा', 'access-schemes'], ['janani suraksha', 'access-schemes']]) { const r = await search(a.page, q); check('4 search "' + q + '" finds ' + r0 + ' first', r[0] === r0, r.slice(0, 4)); }
  const s2 = await search(a.page, 'जननी सुरक्षा');
  check('4 "जननी सुरक्षा" is a scheme, not the safety page first', s2[0] !== 'intimate-safety', s2.slice(0, 4));
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: { events: regular(10), settings: { discreet: true, toursAuto: false, notify: true } }, hash: '#care' });
  check('4 a shared phone: no Food card among the topics', !(await has(b.page, '#view .topic-grid [data-go="food"]')));
  errsAll.push(...b.errs); await b.ctx.close();
}

/* ---------- 5. Joining asks only what the plan uses (journey audit P2-02, P2-21, P2-23, J-05) ---------- */
{
  const a = await open({ seed: { events: regular(10) } });
  const kh = await goalFlow(a.page, 'heavy', 'food');
  check('5 heavy periods: "Your day" asks how she eats and about milk, not activity, bedtime or work', kh.indexOf('food') >= 0 && kh.indexOf('milk') >= 0 && ['act', 'bed', 'work'].every((k) => kh.indexOf(k) < 0), kh);
  check('5 ... and her knees or back (the plan has moves)', kh.indexOf('lim') >= 0, kh);
  check('5 ... with Jain among the answers, and vegetarian already chosen', await has(a.page, '[data-pl-q="food:jain"]') && await has(a.page, '[data-pl-q="food:veg"].on'));
  const kp = await goalFlow(a.page, 'pain', 'food');
  check('5 painful periods: activity, bedtime and work are asked (her sleep and moves use them)', ['act', 'bed', 'work', 'food', 'milk', 'lim'].every((k) => kp.indexOf(k) >= 0), kp);
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: { events: cyc6([40, 44, 38, 42, 39, 45], 10) } });
  await go(b.page, 'plan'); await tap(b.page, '#view [data-pl-pick="irregular"]');
  check('5 irregular periods: her diary answers the gap question, which she can change', /From your diary: your last 6 gaps were 38 to 45 days/.test(await vtext(b.page)) && await has(b.page, '[data-pl-q="gap:g45"].on'), (await vtext(b.page)).slice(0, 400));
  errsAll.push(...b.errs); await b.ctx.close();
  const c = await open({ seed: { events: regular(10) } });
  await goalFlow(c.page, 'irregular', null);
  check('5 the body screen is only for the weight goal', !(await c.page.evaluate(() => !!document.querySelector('#pl-in-cm'))) );
  errsAll.push(...c.errs); await c.ctx.close();
}

/* ---------- 6. Food steps lead somewhere; yoga and moves from every plan (diet audit 2.4, 5.4) ---------- */
{
  const a = await open({ seed: { events: regular(10), mods: { plan: planOf('heavy', 'heavy', ago(3)) } } });
  const ir = await a.page.evaluate(() => (window.Saathi.plan.actions() || []).find((x) => x.id === 'iron'));
  check('6 the heavy plan\'s iron step opens My food', !!ir && ir.go === 'food', ir);
  await go(a.page, 'plan');
  /* Version 39.5: My food and Yoga and moves are the plan's own tiles */
  check('6 My plan (heavy): My food and Yoga and moves', await has(a.page, '#view .pl-tiles [data-go="food"]') && await has(a.page, '#view .pl-tiles [data-go="plan-moves"]'));
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: { dob: '1976-03-01', events: regular(10), mods: { plan: planOf('meno', 'hot', ago(5)) } }, hash: '#plan' });
  const mv = (await b.page.$$eval('#view .pl-moves-row [data-go]', (x) => x.map((y) => y.dataset.go))).concat(await b.page.$$eval('#view .pl-tiles [data-go="plan-moves"]', (x) => x.map((y) => y.dataset.go)));
  check('6 from 40: strength first, then yoga and moves', mv.join() === 'plan-r-strength,plan-moves', mv);
  errsAll.push(...b.errs); await b.ctx.close();
  const c = await open({ seed: Object.assign({}, PREG(20), { mods: { plan: planOf('preg', 'food', ago(5)) } }), hash: '#plan' });
  check('6 pregnancy: no moves row, and moves wait for her doctor\'s OK', !(await has(c.page, '#view .pl-moves-row')) && /start moves only after your doctor says it’s OK/.test(await vtext(c.page)));
  errsAll.push(...c.errs); await c.ctx.close();
  const d = await open({ seed: { situation: { deliveredOn: ago(20), breastfeeding: true }, events: [], mods: { plan: planOf('post', 'feed', ago(5)) } }, hash: '#plan' });
  check('6 the first 6 weeks after a birth: no moves row', !(await has(d.page, '#view .pl-moves-row')));
  errsAll.push(...d.errs); await d.ctx.close();
}

/* ---------- 7. The reveal is one card shorter (journey audit P2-23, MIN-20) ---------- */
{
  const a = await open({ seed: { events: regular(10) } });
  await goalFlow(a.page, 'pain', null); if (await has(a.page, '#pl-in-make')) await tap(a.page, '#pl-in-make');
  const n = await a.page.$$eval('#view .pl-rv-top .progress i', (x) => x.length);
  await a.page.evaluate(() => { window.Saathi.mem.rvCard = 2; window.Saathi.render(); }); await settle(a.page, 300);
  const v = await vtext(a.page);
  check('7 the plan screen: 4 cards for painful periods (ready, steps, days and weeks, start)', n === 4, n);
  check('7 "Your days and weeks" holds how each day works and what happens when', /Your days and weeks/.test(v) && /How each day works/.test(v) && /What happens when/.test(v), v.slice(0, 300));
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 8. Hindi, 360 px, no page errors ---------- */
{
  const a = await open({ seed: { lang: 'hi', events: regular(10) }, lang: 'hi', w: 360, h: 800, hash: '#food' });
  check('8 Hindi: "मेरा खाना", "आप क्या खाती हैं" and the Jain answer', /मेरा खाना/.test(await vtext(a.page)) && /आप क्या खाती हैं/.test(await vtext(a.page)) && /जैन/.test(await vtext(a.page)));
  check('8 360 px: no sideways scroll on My food', await noScroll(a.page));
  await shot(a.page, '08-hindi-360'); errsAll.push(...a.errs); await a.ctx.close();
}
/* ---------- 9. The V39.2 and V39.3 review (review-v39-2-3): one check per confirmed finding ---------- */
{
  const step = (page) => page.evaluate(() => (window.Saathi.plan.actions() || []).find((x) => x.id === 'iron') || null);
  /* FOOD-01, PRIVACY-05: in pregnancy, the iron day with sprouts says cooked */
  const a = await open({ seed: Object.assign({}, PREG(20), { mods: { plan: planOf('preg', 'iron', ago(17)) } }) });
  const s1 = await step(a.page);
  check('9 FOOD-01 pregnant, iron day 18: "Cooked sprouts", never raw', !!s1 && /Cooked sprouts/.test(s1.title) && /boiled/.test(s1.sub), s1);
  errsAll.push(...a.errs); await a.ctx.close();
  /* FOOD-03: Jain and no-milk women get iron days they eat */
  const b = await open({ seed: { events: regular(10), mods: { food: { type: 'jain', milk: true }, plan: planOf('heavy', 'heavy', ago(17)) } } });
  const s2 = await step(b.page);
  check('9 FOOD-03 Jain, iron day 18: no sprouts ("Dates or raisins")', !!s2 && /Dates or raisins/.test(s2.title), s2);
  errsAll.push(...b.errs); await b.ctx.close();
  const c = await open({ seed: { events: regular(10), mods: { food: { type: 'veg', milk: false }, plan: planOf('heavy', 'heavy', ago(13)) } } });
  const s3 = await step(c.page);
  check('9 FOOD-03 no milk, iron day 14: "Tea at another time", not milk', !!s3 && /Tea at another time/.test(s3.title), s3);
  errsAll.push(...c.errs); await c.ctx.close();
  /* FOOD-03: the protein habit's words follow how she eats */
  for (const [dt, bad, good] of [[{ type: 'veg', milk: true }, /egg/i, /paneer/], [{ type: 'jain', milk: true }, /egg|sprouts/i, /paneer/], [{ type: 'veg', milk: false }, /paneer|curd|egg/i, /roasted chana/], [{ type: 'egg', milk: true }, /^$/, /an egg/]]) {
    const x = await open({ seed: { events: regular(10), mods: { food: dt, plan: planOf('cycle', 'irregular', ago(16)) } }, hash: '#plan-plate' });
    const ht = await txt(x.page, '#view label.pl-hab:has([data-pl-hab="protein"]) .small');
    check('9 FOOD-03 the protein habit for ' + dt.type + (dt.milk ? '' : ', no milk') + ' says only foods she eats', good.test(ht) && !bad.test(ht), ht);
    errsAll.push(...x.errs); await x.ctx.close();
  }
  /* FOOD-04, PRIVACY-04: the plate's picture and what Listen reads follow how she eats */
  const lab = async (dt) => { const x = await open({ seed: { mods: { food: dt } }, hash: '#plan-plate' }); const r = await x.page.$eval('#view svg.pl-plate', (e) => [e.getAttribute('aria-label'), e.textContent]); errsAll.push(...x.errs); await x.ctx.close(); return r; };
  const l1 = await lab({ type: 'veg', milk: true }), l2 = await lab({ type: 'veg', milk: false }), l3 = await lab({ type: 'nonveg', milk: false });
  check('9 FOOD-04 vegetarian: the plate\'s label has no egg or fish', !/egg|fish/i.test(l1[0]) && /paneer/.test(l1[0]), l1[0]);
  check('9 FOOD-04 no milk: the bowl is "Dal" and the label has no curd', /Dal/.test(l2[1]) && !/curd/i.test(l2[0]), l2);
  check('9 FOOD-04 fish or meat, no milk: "dal, chana, egg or fish", no paneer', /dal, chana, egg or fish/.test(l3[0]) && !/paneer/.test(l3[0]), l3[0]);
  /* FOOD-02: a period months ago isn't pre-filled as "21 to 35 days" */
  const d = await open({ seed: { events: [{ d: ago(180), t: 'start' }, { d: ago(175), t: 'end' }, { d: ago(150), t: 'start' }, { d: ago(145), t: 'end' }, { d: ago(120), t: 'start' }, { d: ago(115), t: 'end' }] }, hash: '#plan' });
  await tap(d.page, '[data-pl-pick="irregular"]');
  check('9 FOOD-02 no period for 120 days: pre-filled "more than 60 days", months skipped, and it says so', (await has(d.page, '[data-pl-q="gap:gt60"].on')) && (await has(d.page, '[data-pl-q="skips:y"].on')) && /last period started 120 days ago/.test(await view(d.page)), (await view(d.page)).slice(0, 400));
  errsAll.push(...d.errs); await d.ctx.close();
  /* FOOD-05: the PMOS plan's own start form asks how she eats as joining does, and keeps it */
  const e = await open({ seed: { situation: { pcos: true }, mods: { food: { type: 'veg', milk: true } } }, hash: '#plan-start' });
  check('9 FOOD-05 the PMOS start form: her saved answer on, Jain and milk asked', await has(e.page, '[data-pl-f="food"][data-v="veg"].on') && await has(e.page, '[data-pl-f="food"][data-v="jain"]') && await has(e.page, '[data-pl-f="milk"]'));
  for (const [k, val] of [['goal', 'cycles'], ['level', '0'], ['lim', 'none'], ['food', 'nonveg'], ['milk', 'n'], ['region', 'west']]) await tap(e.page, '[data-pl-f="' + k + '"][data-v="' + val + '"]');
  await tap(e.page, '#pl-go');
  check('9 FOOD-05 ... and My food follows her answer', await e.page.evaluate(() => { const x = window.Saathi.food.diet(); return x.type === 'nonveg' && x.milk === false; }));
  errsAll.push(...e.errs); await e.ctx.close();
  /* FOOD-06, PRIVACY-06, PLACES-04: My food opens for a woman just reading; My plate's chips work */
  const f = await open({ seed: { stage: 'browse', events: [] }, hash: '#food' });
  check('9 FOOD-06 just reading: My food opens (not the "Just reading" page)', /How you eat|My food/.test(await view(f.page)) && !/Start my diary/.test(await txt(f.page, '#view .card h2')), (await view(f.page)).slice(0, 200));
  await go(f.page, 'plan-plate'); await tap(f.page, '[data-pl-fd="nonveg"], [data-food-type="nonveg"], .chip[data-v="nonveg"]').catch(() => {});
  errsAll.push(...f.errs); await f.ctx.close();
  /* FOOD-07: after a birth: knees and back are asked; no moves tiles in the first 6 weeks */
  const g = await open({ seed: { situation: { deliveredOn: ago(10) }, events: [] } });
  const qs = await g.page.evaluate(() => { const S = window.Saathi; return S.plan.progs.spec('post', 1).intake.day; });
  check('9 FOOD-07 the after-birth plan asks about knees and back', qs.indexOf('lim') >= 0, qs);
  check('9 FOOD-07 10 days after a birth, "yoga" doesn\'t offer Yoga and moves', (await search(g.page, 'yoga')).indexOf('plan-moves') < 0, await search(g.page, 'yoga'));
  errsAll.push(...g.errs); await g.ctx.close();
  /* FOOD-08: knee pain leaves out the sun salutation */
  const h = await open({ seed: { events: regular(10), mods: { plan: planOf('cycle', 'irregular', ago(40), { level: 1, limits: { knees: true, back: false } }) } }, hash: '#plan-moves' });
  check('9 FOOD-08 knee pain: no sun salutation in Yoga and moves', !(await has(h.page, '#view [data-go="plan-r-sun"]')));
  errsAll.push(...h.errs); await h.ctx.close();
  /* FOOD-09: "fast" isn't fasting; milk words after a birth open breastfeeding; tablets aren't food */
  const i1 = await open({ seed: Object.assign({}, PREG(30)) });
  const r1 = await search(i1.page, 'baby moving fast'), r2 = await search(i1.page, 'calcium tablet');
  check('9 FOOD-09 pregnant: "baby moving fast" opens the kick counter first, not fasting', r1[0] === 'pregtools-kicks', r1);
  check('9 FOOD-09 pregnant: "calcium tablet" opens her medicines first, food pages not in the top 3', r2[0] === 'tools-meds' && ['food', 'preg-diet', 'plan-plate'].every((k) => r2.slice(0, 3).indexOf(k) < 0), r2);
  errsAll.push(...i1.errs); await i1.ctx.close();
  const i2 = await open({ seed: { situation: { deliveredOn: ago(12), breastfeeding: true }, events: [] } });
  const r3 = await search(i2.page, 'doodh kam');
  check('9 FOOD-09 after a birth: "doodh kam" opens breastfeeding first', r3[0] === 'post-feed', r3);
  errsAll.push(...i2.errs); await i2.ctx.close();
  /* FOOD-10: no My plate in pregnancy; FOOD-11: "bmi" opens My body, and one name for the third food answer */
  const j = await open({ seed: Object.assign({}, PREG(20)) });
  check('9 FOOD-10 pregnant: "thali" doesn\'t offer My plate', (await search(j.page, 'thali')).indexOf('plan-plate') < 0, await search(j.page, 'thali'));
  errsAll.push(...j.errs); await j.ctx.close();
  const k = await open({ seed: { events: regular(10) } });
  check('9 FOOD-11 "bmi" opens My body first', (await search(k.page, 'bmi'))[0] === 'plan-body', await search(k.page, 'bmi'));
  check('9 FOOD-11 one name for the third answer: "Fish or meat too"', (await k.page.evaluate(() => window.Saathi.t('plan_f_nonveg'))) === 'Fish or meat too' && (await k.page.evaluate(() => window.Saathi.t('food_t_nonveg'))) === 'Fish or meat too');
  errsAll.push(...k.errs); await k.ctx.close();
}
check('8 no page errors (and in 9)', errsAll.length === 0, errsAll.slice(0, 5));

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(results.length - failed.length + '/' + results.length + ' checks passed');
if (failed.length) process.exit(1);
