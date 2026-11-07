// Version 39.80: water (Mohit, 7 Nov: "we dont have water intake in plans and reminder and its an important part", then "Build W1
// to W7" on docs/water-advice-2026-11-07.md; MODULE_API section 123). This file checks:
//   1 W1, My pregnancy: no water step on day 1; from day 2 "Water: over 2 litres today" (8 to 12 glasses) when a slot is free, last
//     of her daily steps and never a 5th; small sips with the nausea goal; none on a fasting day; plain words on a shared phone;
//     its line leads with the heat from April to June; its Why? says what a glass is and the doctor's limit, and opens Water;
//   2 W2, while she breastfeeds: "Water: a glass at every feed" (10 to 12 a day); none when she doesn't breastfeed;
//   3 W5: no slot left, the water line goes under her food step (the salt-and-water week shows both sentences) or "Food and water
//     while you breastfeed"; with its own step, the food step keeps one line (one home); the pelvic floor plan's water habit comes
//     back once a week after week 4 ("Still drinking water through the day?");
//   4 W4, the hot months' card: April to June, once a season, until "Got it"; her stage's line and 102 in a pregnancy; plain words
//     and 108 in discreet mode; none in July;
//   5 W3, what her monthly check-in says, for 7 days: constipation in a pregnancy whose plan has no water step; leaking urine after
//     a birth or in midlife without the pelvic floor plan; never in discreet mode;
//   6 W6, the water reminder: off until she turns it on (Me > Reminders lists Water); 3 rings at 11 am, 2 pm and 5 pm she can move
//     (8 am to 7 pm only); no "Ring on time?"; a tick on her water step quiets the rest of the day, an undo brings it back; off
//     removes them; Coming up leaves them out; the phone gets "Water: a glass now", opening Today;
//   7 W7: the drinks habit's amount (and before lunch and dinner for the weight goal), the two water myths, the period chapter's
//     line, the pelvic floor habit's doctor's limit; the Water page by her stage;
//   8 Hindi at 360 px; 9 no page errors.
// Usage: node test/water.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'water'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 900)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let TODAY = '2026-11-07';   /* a Saturday, not a hot month */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm, day) => new Date((day || TODAY) + 'T' + hm + ':00+05:30');
const TOURS = () => Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, ago(30)]));
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1994-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: { care: 'private' }, events: [], daily: {}, notes: {}, checkins: {},
  tours: TOURS(), fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30) }, mods: {}, reminders: [], intake: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
const bridge = 'window.__calls = []; window.__exactAsk = 0; window.SakhiAndroid = { schedule(j) { __calls.push(j); return 0; }, cancelAll() {}, canNotify() { return true; }, askNotify() {}, ' +
  'canExactAlarms() { return false; }, askExactAlarms() { window.__exactAsk++; }, testNotify() {}, speak() { return true; }, stop() {}, voices() { return "[]"; }, copy() { return true; }, haptic() {}, setSecure() {}, ' +
  'setDisguise() {}, isDisguised() { return false; }, saveState() { return true; }, loadState() { return ""; }, restored() { return false; } };';
const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 360, height: o.h || 800 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ app: '0.39.80-pilot', platform: 'android' }) + ';');
  await ctx.addInitScript(bridge);
  const acct = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(acct)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200))); page.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED|ERR_ABORTED|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
  await page.clock.install({ time: at(o.hm || '10:00', o.day) });
  await page.goto(PAGE + '#' + (o.hash || 'home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 800);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (a, h) => { await a.page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(a.page, 500); };
const tap = async (a, sel) => { await a.page.waitForSelector(sel, { timeout: 8000, state: 'attached' }); await a.page.$eval(sel, (el) => el.click()); await settle(a.page, 400); };
const has = (a, sel) => a.page.$(sel).then((x) => !!x);
const txt = (a, sel) => a.page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
const view = (a) => txt(a, '#view');
const acts = (a) => a.page.evaluate(() => (window.Saathi.plan.actions() || []).map((x) => ({ id: x.id, title: x.title, sub: x.sub || '', water: !!x.water, how: x.how || '', why: x.why || '', go: x.go || '', priv: !!x.priv })));
const actOf = async (a, id) => (await acts(a)).find((x) => x.id === id) || null;
const rems = (a) => a.page.evaluate(() => window.Saathi.reminders.list().map((r) => ({ id: r.id, mod: r.mod, kind: r.kind, time: r.time, on: r.on !== false, doneOn: r.doneOn || null, en: r.title && r.title.en })));
const waterRems = async (a) => (await rems(a)).filter((r) => r.mod === 'water');
const slotTxt = (a) => a.page.$eval('#view section.slot', (s) => s.textContent.replace(/\s+/g, ' ')).catch(() => '');
const slotKeys = (a) => a.page.$$eval('#view section.slot [data-key]', (xs) => xs.map((x) => x.dataset.key)).catch(() => []);
const shot = (a, name) => a.page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
const rowAct = (a, re, kind) => a.page.evaluate(([src, k]) => { const r = [...document.querySelectorAll('[data-today-row]')].find((x) => new RegExp(src).test(x.innerText)); const b = r && r.querySelector('[data-today-' + k + ']'); if (b) b.click(); return !!b; }, [re, kind || 'act']);
const overflow = (a) => a.page.evaluate(() => [...document.querySelectorAll('#view *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > window.innerWidth + 1; }).map((e) => e.tagName + '.' + e.className).slice(0, 5));

/* her plan's saved answers, a running My pregnancy (version 2) started `startAgo` days ago (0: today, her day 1), pregnant `w` weeks */
const IK = (o) => Object.assign({ at: ago(1), stage: 'preg', goal: 'food', food: 'veg', milk: 'y', act: null, lim: [], pflags: [], psafeW: 10, pnow: null }, o || {});
const PLAN = (pack, startAgo, o) => Object.assign({ pack: pack, goalKey: 'food', start: ago(startAgo), started: ago(startAgo), go: true, pv: 2, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: null, log: {}, weeks: {}, body: [] }, o || {});
const pregSeed = (w, startAgo, o, x) => Object.assign({ situation: { pregnant: true, pregnantSince: ago(7 * w + 3), care: 'private' }, goals: [(o || {}).goalKey || 'food'], intake: IK({ goal: (o || {}).goalKey || 'food', psafeW: w }),
  mods: { plan: PLAN('preg', startAgo, Object.assign({ intake: IK({ goal: (o || {}).goalKey || 'food', psafeW: w }) }, o || {})) } }, x || {});
const POSTIK = (sa) => ({ at: ago(sa + 1), stage: 'post', goal: 'recovery', food: 'veg', milk: 'y', lim: [] });
const postSeed = (born, startAgo, bf, x) => Object.assign({ situation: { care: 'private', deliveredOn: ago(born), breastfeeding: bf }, goals: ['recovery'], intake: { goal: 'recovery', stage: 'post' },
  mods: { plan: PLAN('post', startAgo, { goalKey: 'recovery', intake: POSTIK(startAgo) }) } }, x || {});

/* ---------- 1 W1: My pregnancy ---------- */
{
  let a = await open({ seed: pregSeed(20, 0) });
  let xs = await acts(a);
  check('1.1 day 1 has no water step, and 3 steps or fewer', !xs.some((x) => x.id === 'water') && xs.length <= 3, xs.map((x) => x.id));
  await done(a);
  a = await open({ seed: pregSeed(20, 1) });
  xs = await acts(a); const w = xs.find((x) => x.id === 'water');
  check('1.2 day 2: "Water: over 2 litres today", 8 to 12 glasses', !!w && w.title === 'Water: over 2 litres today' && /^8 to 12 glasses: one with each meal and each tablet, more on hot days\.$/.test(w.sub), w);
  const daily = xs.filter((x) => x.id !== 'pdue');
  check('1.3 water comes last of her daily steps, and never a 5th step', daily.length && daily[daily.length - 1].id === 'water' && xs.length <= 4, xs.map((x) => x.id));
  check('1.4 plain words: not a private step, so a shared phone shows it', !!w && !w.priv, w);
  check('1.5 it opens the Water page', !!w && w.go === 'water', w && w.go);
  await rowAct(a, '^\\s*Water: over 2 litres', 'why'); await settle(a.page, 400);
  const sh = await txt(a, '.pl-why-sh');
  check('1.6 its Why? says what a glass is and the doctor\'s limit, with the pregnancy reasons', /A glass is about 250 ml, a full steel glass/.test(sh) && /If your doctor has told you to drink less \(for your heart or kidneys\), follow your doctor/.test(sh) && /constipation and piles/.test(sh) && /do not cut down/.test(sh), sh);
  check('1.7 its tool button is the Water page', await has(a, '.pl-why-sh [data-go="water"]'));
  await tap(a, '.pl-why-sh [data-go="water"]');
  check('1.8 the Water page gives her pregnancy amount', /8 to 12 glasses \(2 to 3 litres\) a day in your pregnancy: at least 2 litres/.test(await view(a)), (await view(a)).slice(0, 400));
  await shot(a, '1-preg-water-page');
  await done(a);
  a = await open({ seed: pregSeed(10, 4, { goalKey: 'nausea' }) });
  const wn = await actOf(a, 'water');
  check('1.9 the nausea goal: small sips, in the pregnancy page\'s own words', !!wn && wn.title === 'Water: small sips all day' && /^Sip water, nimbu pani or coconut water through the day instead of drinking a lot at once\.$/.test(wn.sub), wn);
  await done(a);
  a = await open({ seed: pregSeed(20, 1, { fast: { [TODAY]: true }, fastAt: TODAY }) });
  xs = await acts(a);
  check('1.10 a fasting day: no water step (the fasting step holds water)', !xs.some((x) => x.id === 'water') && xs.some((x) => x.id === 'fast'), xs.map((x) => x.id));
  await done(a);
  a = await open({ seed: pregSeed(20, 1, {}, { settings: { discreet: true, notify: true } }) });
  const ws = await actOf(a, 'water'); const tv = await view(a);
  check('1.11 discreet mode (the shared-phone check) still shows "Water: over 2 litres today"', !!ws && /Water: over 2 litres today/.test(tv), tv.slice(0, 300));
  await done(a);
  TODAY = '2027-05-12';
  a = await open({ seed: pregSeed(20, 1, {}, { mods: { plan: PLAN('preg', 1, { intake: IK({ psafeW: 20 }) }), water: { heat: '2027' } } }) });
  const wh = await actOf(a, 'water');
  check('1.12 in May its line leads with the heat', !!wh && /^Hot days: drink more\. 8 to 12 glasses or more/.test(wh.sub), wh);
  await done(a);
  TODAY = '2026-11-07';
}

/* ---------- 2 W2: while she breastfeeds ---------- */
{
  let a = await open({ seed: postSeed(30, 1, true) });
  const w = await actOf(a, 'water');
  check('2.1 breastfeeding: "Water: a glass at every feed", about 10 to 12 a day', !!w && w.title === 'Water: a glass at every feed' && w.sub === 'About 10 to 12 glasses a day, to your thirst.', w);
  await rowAct(a, '^\\s*Water: a glass at every feed', 'why'); await settle(a.page, 400);
  const sh = await txt(a, '.pl-why-sh');
  check('2.2 its Why? says drinking more than thirst doesn\'t make more milk', /doesn’t make more milk/.test(sh) && /A glass is about 250 ml/.test(sh), sh);
  await done(a);
  a = await open({ seed: postSeed(30, 2, false) });
  check('2.3 not breastfeeding: no water step', !(await acts(a)).some((x) => x.id === 'water'), (await acts(a)).map((x) => x.id));
  await done(a);
}

/* ---------- 3 W5: the water line when no slot is left; the pelvic floor habit back ---------- */
{
  /* 18 weeks: the salt-and-water week; day 5 has her walk, food, pelvic floor set and "Due now": no slot for water */
  let a = await open({ seed: pregSeed(18, 4) });
  let xs = await acts(a); const f = xs.find((x) => x.id === 'food');
  check('3.1 slots full: no water step, its line under the food step', !xs.some((x) => x.id === 'water') && !!f && f.water && /Drink plenty: over 2 litres a day, counting water, buttermilk and nimbu pani\.$/.test(f.sub), xs.map((x) => x.id + ':' + x.sub));
  check('3.2 the salt-and-water week shows both of its sentences', !!f && /^Use only iodised salt\. Drink plenty: over 2 litres a day/.test(f.sub), f && f.sub);
  check('3.3 Today shows the food step\'s water line', /Drink plenty: over 2 litres a day/.test(await view(a)));
  await done(a);
  a = await open({ seed: pregSeed(18, 1) });
  xs = await acts(a); const f2 = xs.find((x) => x.id === 'food');
  check('3.4 with its own step, the food step keeps one line (one home)', xs.some((x) => x.id === 'water') && !!f2 && !f2.water && f2.sub === 'Use only iodised salt.', xs.map((x) => x.id + ':' + x.sub));
  await done(a);
  /* after a birth, the day "Food while you breastfeed" comes with every slot taken: born 60 days ago, so her strength days have begun */
  const findFull = async () => { for (let s = 1; s <= 13; s++) { const b = await open({ seed: postSeed(70, s, true, { mods: { plan: PLAN('post', s, { goalKey: 'recovery', intake: POSTIK(s), unlockAt: ago(s + 30), readyAt: ago(s + 20) }) } }) }); const ys = await acts(b); if (ys.some((y) => y.id === 'bfood') && !ys.some((y) => y.id === 'water')) return { b, ys }; await done(b); } return null; };
  const ff = await findFull();
  if (ff) {
    const bf = ff.ys.find((y) => y.id === 'bfood');
    check('3.5 no slot after a birth: "Food and water while you breastfeed" with the feeding page\'s line', bf.title === 'Food and water while you breastfeed' && bf.sub === 'Keep water near you, and drink a glass at every feed.' && bf.water, bf);
    await done(ff.b);
  } else {
    a = await open({ seed: postSeed(30, 2, true) }); xs = await acts(a);
    check('3.5 a day with "Food while you breastfeed" and the water step keeps both, each with its own words', xs.some((x) => x.id === 'water') && (xs.find((x) => x.id === 'bfood') || {}).title === 'Food while you breastfeed', xs.map((x) => x.id + ':' + x.title));
    await done(a);
  }
  /* My pelvic floor plan: week 6, the 5th day of her plan week (plan day 40) */
  const pfIk = { at: ago(41), stage: 'cycle', goal: 'pelvic', pft: 'stress', pfsafe: [], act: 0, food: 'veg', milk: 'y', lim: [] };
  const pf = (startAgo) => ({ situation: { care: 'private' }, goals: ['pelvic'], intake: { goal: 'pelvic', stage: 'cycle' }, mods: { plan: PLAN('pelvic', startAgo, { goalKey: 'pelvic', pv: 1, intake: pfIk, pfSafeAt: ago(startAgo) }) } });
  a = await open({ seed: pf(39) });
  let h = await actOf(a, 'habit');
  check('3.6 week 6, the 5th day of her plan week: "Still drinking water through the day?"', !!h && h.title === 'Still drinking water through the day?', h);
  check('3.7 its How keeps the habit\'s line and adds the doctor\'s limit', !!h && /About 6 to 8 glasses|about 6 to 8 glasses/i.test(h.how) && /follow your doctor/.test(h.how), h && h.how);
  await done(a);
  a = await open({ seed: pf(40) });
  h = await actOf(a, 'habit');
  check('3.8 the next day, the week\'s own habit again', !h || h.title !== 'Still drinking water through the day?', h);
  await done(a);
  a = await open({ seed: pf(18) });
  h = await actOf(a, 'habit');
  check('3.9 week 3: "Water through the day", as before', !h || h.title === 'Water through the day', h);
  await done(a);
}

/* ---------- 4 W4: the hot months' card ---------- */
{
  TODAY = '2027-04-20';
  let a = await open({ seed: { situation: { care: 'private' } } });
  let keys = await slotKeys(a); let v = await slotTxt(a);
  check('4.1 April: "Hot days are here" in Sakhi says (it takes its turn there)', keys.indexOf('wt-hot') >= 0 && /Hot days are here/.test(v) && /Drink water often, even before you feel thirsty/.test(v) && /12 noon to 3 pm/.test(v), keys);
  check('4.2 the heat illness line and the ambulance (108)', /Very hot skin, confusion, fainting, or no sweat in the heat: go to the nearest hospital now/.test(v) && await has(a, '.wt-hot a[href="tel:108"]'), v.slice(0, 600));
  await shot(a, '4-hot-card');
  await tap(a, '[data-wt-ok="heat"]');
  check('4.3 "Got it": gone for the season', (await slotKeys(a)).indexOf('wt-hot') < 0 && (await a.page.evaluate(() => window.Saathi.state.mods.water.heat)) === '2027');
  await done(a);
  a = await open({ seed: pregSeed(26, 30) });
  const inSlot = await slotTxt(a);
  check('4.4 a pregnancy: her line and the ambulance 102', /In your pregnancy: 8 to 12 glasses, and more on the hottest days/.test(inSlot) && await has(a, '.wt-hot a[href="tel:102"]'), inSlot.slice(0, 500));
  await done(a);
  a = await open({ seed: Object.assign(pregSeed(26, 30), { settings: { discreet: true, notify: true } }) });
  const ds = await slotTxt(a);
  check('4.5 discreet mode: the card in plain words, 108, no pregnancy line', /Hot days are here/.test(ds) && !/pregnancy/i.test(ds) && await has(a, '.wt-hot a[href="tel:108"]'), ds.slice(0, 500));
  await done(a);
  a = await open({ seed: postSeed(60, 40, true) });
  const bs = await slotTxt(a);
  check('4.6 breastfeeding a small baby: a glass at every feed, and breast milk only for the baby', /While you breastfeed: a glass at every feed/.test(bs) && /Breast milk gives a baby all the water it needs for the first 6 months, even in summer/.test(bs), bs.slice(0, 600));
  await done(a);
  TODAY = '2027-07-10';
  a = await open({ seed: { situation: { care: 'private' } } });
  check('4.7 July: no hot card', (await slotKeys(a)).indexOf('wt-hot') < 0);
  await done(a);
  TODAY = '2026-11-07';
}

/* ---------- 5 W3: her monthly check-in's line ---------- */
{
  const mk = TODAY.slice(0, 7);
  const ci = (chips, kind, n) => ({ [mk]: { chips: chips, hot: 'hot_0', note: '', at: ago(n == null ? 2 : n), kind: kind } });
  let a = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(7 * 20 + 3), care: 'private' }, checkins: ci(['constip'], 'preg') } });
  let keys = await slotKeys(a); let v = await slotTxt(a);
  check('5.1 a pregnancy without her plan, constipation ticked 2 days ago: the water and fibre line', keys.indexOf('wt-con') >= 0 && /Drink over 2 litres a day\. Eat fibre: whole grains, dal, vegetables and fruit\. Walk every day\./.test(v), keys);
  await tap(a, '[data-wt-ok="con"]');
  check('5.2 "Got it": gone for that check-in', (await slotKeys(a)).indexOf('wt-con') < 0);
  await done(a);
  a = await open({ seed: Object.assign(pregSeed(20, 1), { checkins: ci(['constip'], 'preg') }) });
  check('5.3 with her plan\'s water step today: no card (one home)', (await slotKeys(a)).indexOf('wt-con') < 0);
  await done(a);
  a = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(7 * 20 + 3), care: 'private' }, checkins: ci(['constip'], 'preg', 9) } });
  check('5.4 a check-in 9 days ago: no card', (await slotKeys(a)).indexOf('wt-con') < 0);
  await done(a);
  a = await open({ seed: { situation: { care: 'private', deliveredOn: ago(120), breastfeeding: false }, checkins: ci(['leak'], 'post') } });
  keys = await slotKeys(a); v = await slotTxt(a);
  check('5.5 after a birth, leaking urine: "keep drinking", in the pelvic floor plan\'s words', keys.indexOf('wt-leak') >= 0 && /Many women drink less to leak less/.test(v) && /about 6 to 8 glasses a day/i.test(v), keys);
  await done(a);
  a = await open({ seed: { situation: { care: 'private', deliveredOn: ago(120), breastfeeding: false }, checkins: ci(['leak'], 'post'), settings: { discreet: true, notify: true } } });
  check('5.6 discreet mode: no leaking card', (await slotKeys(a)).indexOf('wt-leak') < 0);
  await done(a);
}

/* ---------- 6 W6: the water reminder ---------- */
{
  let a = await open({ seed: pregSeed(20, 1), hash: 'me-reminders' });
  check('6.1 Me > Reminders lists Water', await has(a, '#view [data-go="water"]'), await view(a));
  await tap(a, '#view [data-go="water"]');
  check('6.2 the water reminder is off until she turns it on', !(await a.page.$eval('#wt-rem', (e) => e.checked)) && (await waterRems(a)).length === 0);
  await a.page.mouse.click(5, 5); await tap(a, '#wt-rem'); await settle(a.page, 1500);
  let wr = await waterRems(a);
  check('6.3 on: 3 rings at 11 am, 2 pm and 5 pm, every day', wr.length === 3 && wr.map((r) => r.time).join() === '11:00,14:00,17:00' && wr.every((r) => r.on && r.kind === 'water' && r.en === 'Water: a glass now'), wr);
  check('6.4 no "Ring on time?" for water', (await a.page.evaluate(() => window.__exactAsk)) === 0 && !(await has(a, '.sheet #ex-ok, .sheet [data-ex]')));
  const opts = await a.page.$$eval('#wt-t0 option', (os) => os.map((o) => o.value));
  check('6.5 her times run from 8 am to 7 pm, never the hours before bed', opts[0] === '08:00' && opts[opts.length - 1] === '19:00', opts);
  await a.page.selectOption('#wt-t1', '15:00'); await settle(a.page, 500);
  check('6.6 she moves the 2 pm ring to 3 pm', (await waterRems(a)).find((r) => r.id === 'water-2').time === '15:00');
  check('6.7 the page says a tick on Today quiets the rest of the day', /Once you tick water on Today, the rest of the day stays quiet/.test(await view(a)));
  await go(a, 'home');
  check('6.8 Coming up leaves the water rings out', !/Water: a glass now/.test(await view(a)));
  await rowAct(a, '^\\s*Water: over 2 litres', 'act'); await settle(a.page, 1500);
  wr = await waterRems(a);
  check('6.9 her tick quiets today\'s water rings', wr.every((r) => r.doneOn === TODAY), wr);
  const nb = await a.page.evaluate(() => { const j = JSON.parse(window.__calls[window.__calls.length - 1] || '[]'); return j.filter((x) => /Water/.test(x.body || '')).map((x) => ({ body: x.body, at: x.at, go: x.go })); });
  check('6.10 the phone gets "Water: a glass now" from tomorrow, opening Today', nb.length >= 1 && nb.every((x) => x.body === 'Water: a glass now' && x.go === 'home' && new Date(x.at) > new Date('2026-11-07T23:59:00+05:30')), nb.slice(0, 4));
  await rowAct(a, '^\\s*Water: over 2 litres', 'undo'); await settle(a.page, 600);
  check('6.11 an undo brings them back for today', (await waterRems(a)).every((r) => r.doneOn !== TODAY), await waterRems(a));
  await go(a, 'water'); await tap(a, '#wt-rem'); await settle(a.page, 500);
  check('6.12 off: the water rings are gone', (await waterRems(a)).length === 0);
  await done(a);
}

/* ---------- 7 W7 and the Water page by her stage ---------- */
{
  let a = await open({ seed: { situation: { care: 'private' } } });
  const r = await a.page.evaluate(() => {
    const deck = (window.Saathi.joy && window.Saathi.joy.deck ? window.Saathi.joy.deck('period') : []) || [];
    return { ids: deck.map((c) => c.id), cold: (deck.find((c) => c.id === 'coldwater') || {}).w };
  });
  check('7.1 the periods myths deck has the cold water myth', r.ids.indexOf('coldwater') >= 0 && /does not cause cramps or clots/.test((r.cold || {}).en || ''), r.ids.slice(-4));
  const joySrc = fs.readFileSync(path.join(root, 'mods', 'joy.js'), 'utf8');
  check('7.2 Sach ya Myth? has the pregnancy swelling myth, with the danger sign', /C\('swelling', false, \['preg'\]/.test(joySrc) && /Drinking less does not stop swelling[^']*go to the nearest hospital now\./.test(joySrc));
  await go(a, 'water');
  let v = await view(a);
  check('7.3 the Water page: about 8 glasses, what a glass is, what counts, the toilet line, the doctor\'s limit', /About 8 glasses \(2 litres\) a day\./.test(v) && /A glass is about 250 ml/.test(v) && /Milk, chaas, nimbu pani, coconut water and tea count/.test(v) && /Don’t drink less to go to the toilet less/.test(v) && /follow your doctor/.test(v), v.slice(0, 700));
  await done(a);
  a = await open({ seed: { situation: { care: 'private' }, dob: '1962-03-01' }, hash: 'water' });
  check('7.4 from 60: at least 6 to 7 glasses, even when not thirsty', /From 60, thirst comes later/.test(await view(a)));
  await done(a);
  a = await open({ seed: postSeed(40, 20, true), hash: 'water' });
  v = await view(a);
  check('7.5 breastfeeding: 10 to 12 glasses, and the baby needs no water', /About 10 to 12 glasses \(2.5 to 3 litres\) a day while you breastfeed/.test(v) && /Breast milk gives a baby all the water it needs/.test(v), v.slice(0, 500));
  await done(a);
  a = await open({ seed: Object.assign(pregSeed(20, 1), { settings: { discreet: true, notify: true } }), hash: 'water' });
  check('7.6 discreet mode: the plain amount, never her stage', /About 8 glasses \(2 litres\) a day\./.test(await view(a)) && !/pregnancy/i.test(await view(a)));
  await done(a);
  /* the PMOS plan's drinks habit (week 7) and the weight goal */
  const cyc = (goal) => ({ situation: { care: 'private' }, goals: [goal], intake: { goal: goal, stage: 'cycle' }, mods: { plan: PLAN('cycle', 7 * 7 + 1, { goalKey: goal, pv: 1, intake: { at: ago(52), stage: 'cycle', goal: goal, act: 0, food: 'veg', milk: 'y', lim: [], bed: '22:30', work: 'day' } }) } });
  a = await open({ seed: cyc('pmos') });
  let how = await a.page.evaluate(() => { const x = (window.Saathi.plan.actions() || []).find((y) => y.id === 'food'); return x ? { habit: x.habit, title: x.title } : null; });
  const howTxt = async (b) => { await rowAct(b, 'sweet drinks', 'why'); await settle(b.page, 400); return txt(b, '.pl-why-sh'); };
  if (how && how.habit === 'drinks') {
    const s1 = await howTxt(a);
    check('7.7 "No sweet drinks" says about 8 glasses a day', /About 8 glasses \(2 litres\) a day, more on hot days/.test(s1) && !/Before lunch and dinner/.test(s1), s1);
  } else check('7.7 week 8 of the PMOS plan shows "No sweet drinks"', false, how);
  await done(a);
  a = await open({ seed: cyc('weight') });
  how = await a.page.evaluate(() => { const x = (window.Saathi.plan.actions() || []).find((y) => y.id === 'food'); return x ? { habit: x.habit } : null; });
  if (how && how.habit === 'drinks') check('7.8 the weight goal: a glass or two before lunch and dinner', /Before lunch and dinner, drink a glass or two of water first/.test(await howTxt(a)));
  else check('7.8 week 8 of the weight goal shows "No sweet drinks"', false, how);
  await done(a);
  /* My period plan's comfort chapter */
  const src = fs.readFileSync(path.join(root, 'mods', 'perplan.js'), 'utf8');
  check('7.9 the period comfort chapter: keep drinking, about 8 glasses', /Keep drinking water through your period: about 8 glasses a day\. Don’t drink less to change pads less often\./.test(src));
}

/* ---------- 8 Hindi at 360 px ---------- */
{
  let a = await open({ seed: Object.assign(pregSeed(20, 1), { lang: 'hi' }) });
  const w = await actOf(a, 'water');
  check('8.1 Hindi: "पानी: आज 2 लीटर से ज़्यादा"', !!w && w.title === 'पानी: आज 2 लीटर से ज़्यादा' && /^8 से 12 गिलास/.test(w.sub), w);
  check('8.2 Today fits 360 px', (await overflow(a)).length === 0, await overflow(a));
  await go(a, 'water');
  const v = await view(a);
  check('8.3 the Water page in Hindi, fitting 360 px', /गर्भ में दिन में 8 से 12 गिलास/.test(v) && /एक गिलास लगभग 250 ml/.test(v) && (await overflow(a)).length === 0, (await overflow(a)));
  await shot(a, '8-water-hi');
  await done(a);
  TODAY = '2027-05-02';
  a = await open({ seed: { situation: { care: 'private' }, lang: 'hi' } });
  const hs = await slotTxt(a);
  check('8.4 the hot card in Hindi, fitting 360 px', /गर्मी के दिन आ गए हैं/.test(hs) && /दोपहर 12 से 3 बजे/.test(hs) && (await overflow(a)).length === 0, hs.slice(0, 300));
  await done(a);
  TODAY = '2026-11-07';
}

check('9 no page errors', errsAll.length === 0, errsAll.slice(0, 6));
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' : 'PASSED ') + (results.length - failed.length) + '/' + results.length);
process.exit(failed.length ? 1 : 0);
