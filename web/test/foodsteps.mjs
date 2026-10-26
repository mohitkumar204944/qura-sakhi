// Version 39.9: food steps that change (docs/roadmap-v39-2026-10-24.md, section 3; diet audit sections 2 and 3, 3.6 to 3.8;
// MODULE_API section 52). Mohit, 25 Oct: "do upto v39.9 only". This file checks:
//   1 the iron rotation: after the 21 days, one iron food a day over 7 days, from her region and how she eats;
//   2 an earlier habit comes back once a week ("Still doing ...?");  3 a calcium food on 3 days a week for 40+ bones;
//   4 the pregnancy food step by trimester, from the pregnancy food page's reviewed lines;
//   5 food while she breastfeeds: a weekly step and its card;  6 fasting: "Fasting today?" on Today, today and tomorrow on the
//     check-in, the fasting step in place of her food steps, in pregnancy too, and the fasting page's new section;
//   7 Hindi, a shared phone, 360 px, no page errors;
//   8 the 25 Oct review of V39.9 (MODULE_API 52.1): a check for each finding, each failing on the reviewed copy.
// Usage: node test/foodsteps.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'foodsteps'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-27';   /* a Tuesday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (day, hm) => new Date(new Date(TODAY + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ANDROID = 'window.__sched = []; window.SakhiAndroid = { schedule(j){ try { window.__sched = JSON.parse(j); } catch (e) {} return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.9-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start', pain: 'pain_1' }, { d: ago(x - 5), t: 'end' })); return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(300), prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
const planOf = (pack, goal, start, extra) => Object.assign({ pack: pack, goalKey: goal, start: start, go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'evening', bed: 'b23', work: 'day', log: {}, weeks: {}, body: [], doc: 'done' }, extra || {});
const PREG = (w) => ({ situation: { pregnant: true, pregnantSince: ago(w * 7) }, events: [] });
const MENO = { dob: '1976-05-01', situation: { stopped: true }, events: [] };

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 360, height: o.h || 800 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(Object.assign({}, LOCAL, o.config || {})) + ';');
  await ctx.addInitScript(ANDROID);
  const seed = seedOf(Object.assign({ lang: o.lang || 'en' }, o.seed || {}));
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seed)) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  const net = [];
  await ctx.route(/^https?:/, (r) => { net.push(r.request().url()); r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }); });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: o.now || at(0, '10:00') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  return { ctx, page, errs, net };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const view = (page) => page.$eval('#view', (e) => e.innerText);
const allText = (page) => page.$eval('#view', (e) => e.textContent);
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000, state: 'attached' }); await page.$eval(sel, (el) => el.click()); await settle(page, 300); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const acts = (page) => page.evaluate(() => window.Saathi.plan.actions().map((a) => ({ id: a.id, title: a.title, sub: a.sub, go: a.go, kind: a.kind })));
/* move the phone's clock to another day and draw again */
const dayTo = async (page, k) => { await page.clock.setSystemTime(at(k, '10:00')); await page.evaluate(() => window.Saathi.render()); await settle(page, 200); };
const errsAll = [];

/* ---------- 1. The iron rotation ---------- */
{
  const a = await open({ seed: { intake: { goal: 'heavy' }, mods: { plan: planOf('heavy', 'heavy', ago(21)) } } });
  /* her PIN (302001) is in the west list, so its foods come first */
  const pick = await a.page.evaluate(() => window.Saathi.food.pick('i', { region: 'west', skip: /^amla$/i }).slice(0, 7).map((x) => window.Saathi.food.name(x)));
  const seen = [];
  for (let k = 0; k < 7; k++) { await dayTo(a.page, k); const s = (await acts(a.page)).find((x) => x.id === 'iron'); seen.push(s ? s.title : ''); }
  const foods = seen.map((x) => (/^Today’s iron food: (.+)$/.exec(x) || [])[1] || '');
  check('1 after the 21 days: "Today\'s iron food" every day, from her foods', foods.every((x) => x && pick.indexOf(x) >= 0), { seen, pick });
  check('1 ... 7 days, 5 or more different foods, none of them amla on its own', new Set(foods).size >= 5 && foods.indexOf('Amla') < 0, foods);
  check('1 ... with lemon, amla or guava under it', ((await acts(a.page)).find((x) => x.id === 'iron') || {}).sub === 'Eat it with lemon, amla or guava.');
  check('1 ... vegetarian: no eggs, fish or chicken', !foods.some((x) => /egg|fish|chicken/i.test(x)), foods);
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: { intake: { goal: 'heavy' }, mods: { food: { type: 'jain', milk: true }, plan: planOf('heavy', 'heavy', ago(25), { food: 'jain' }) } } });
  const jf = []; for (let k = 0; k < 7; k++) { await dayTo(b.page, k); const s = (await acts(b.page)).find((x) => x.id === 'iron'); jf.push(s ? s.title : ''); }
  const jok = await b.page.evaluate(() => { const S = window.Saathi; return S.food.pick('i', { skip: /^amla$/i }).every((x) => S.food.ok(x)); });
  check('1 Jain: every food in the rotation fits how she eats', jok && jf.every((x) => /^Today’s iron food: /.test(x)), jf);
  errsAll.push(...b.errs); await b.ctx.close();
  const c = await open({ seed: { intake: { goal: 'heavy' }, mods: { plan: planOf('heavy', 'heavy', ago(10)) } } });
  check('1 in the 21 days: the journey\'s own iron steps, unchanged', !/^Today’s iron food/.test(((await acts(c.page)).find((x) => x.id === 'iron') || {}).title || ''));
  errsAll.push(...c.errs); await c.ctx.close();
}

/* ---------- 2. An earlier habit, once a week ---------- */
{
  const a = await open({ seed: { intake: { goal: 'irregular' }, mods: { plan: planOf('cycle', 'irregular', ago(18)) } } });
  const t19 = ((await acts(a.page)).find((x) => x.id === 'food') || {}).title;
  await dayTo(a.page, -1); const t18 = ((await acts(a.page)).find((x) => x.id === 'food') || {}).title;
  check('2 week 3, the 5th day of the plan week: "Still doing half the plate sabzi?"', t19 === 'Still doing half the plate sabzi?', t19);
  check('2 ... the day before: her newest habit', t18 === 'Protein at breakfast', t18);
  await dayTo(a.page, 0); await go(a.page, 'home');
  const btn = await a.page.$('#view .today-row [data-act], #view [data-today-act]');
  await a.page.evaluate(() => { const S = window.Saathi; const a1 = S.plan.actions().find((x) => x.id === 'food'); const d = S.data('plan'); d.log[S.toISO(S.today())] = Object.assign({}, d.log[S.toISO(S.today())] || {}, { plate: { half: true } }); S.save(); return !!a1; });
  check('2 ... ticking it marks that habit for today', ((await acts(a.page)).find((x) => x.id === 'food') || {}).title === 'Still doing half the plate sabzi?' && ((await st(a.page)).mods.plan.log[TODAY].plate || {}).half === true, btn ? 1 : 0);
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: { intake: { goal: 'irregular' }, mods: { plan: planOf('cycle', 'irregular', ago(4)) } } });
  check('2 week 1 (one habit so far): no "Still doing"', !/^Still doing/.test(((await acts(b.page)).find((x) => x.id === 'food') || {}).title || ''));
  errsAll.push(...b.errs); await b.ctx.close();
}

/* ---------- 3. A calcium food for 40+ bones ---------- */
{
  const a = await open({ seed: Object.assign({}, MENO, { intake: { goal: 'bones' }, mods: { food: { type: 'veg', milk: false }, plan: planOf('meno', 'bones', ago(0)) } }) });
  const days = []; for (let k = 0; k < 7; k++) { await dayTo(a.page, k); days.push(((await acts(a.page)).find((x) => x.id === 'ca') || {}).title || ''); }
  const on = days.map((x, i) => (x ? i : -1)).filter((i) => i >= 0);
  check('3 bones: a calcium food on 3 days of the week (plan days 1, 3 and 6)', JSON.stringify(on) === '[0,2,5]', days);
  check('3 ... "Today\'s calcium food", and without milk foods for a woman who takes no milk', days.filter(Boolean).every((x) => /^Today’s calcium food: /.test(x) && !/milk|curd|paneer|dahi/i.test(x)), days);
  await dayTo(a.page, 0); const s = (await acts(a.page)).find((x) => x.id === 'ca') || {};
  check('3 ... it opens "Calcium from your kitchen"', s.go === 'meno-bones' && s.sub === 'Calcium from your kitchen, for your bones', s);
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: Object.assign({}, MENO, { intake: { goal: 'hot' }, mods: { plan: planOf('meno', 'hot', ago(0)) } }) });
  check('3 other midlife goals: no calcium step', !(await acts(b.page)).some((x) => x.id === 'ca'));
  errsAll.push(...b.errs); await b.ctx.close();
}

/* ---------- 4. The pregnancy food step by trimester ---------- */
{
  /* each trimester opens with how much more to eat, then a card a week (V39.9 review FOOD-04) */
  const more2 = ['This week: How much more to eat', 'From the 4th month until the birth: about 350 extra calories a day.'];
  const want = { 8: ['This week: How much more to eat', 'First three months: no extra food is needed.'], 14: more2, 20: ['This week: Protein: dal, milk, eggs', 'Have dal or beans with every main meal.'], 28: more2, 32: ['This week: Iodised salt and water', 'Use only iodised salt.'] };
  for (const w of [8, 14, 20, 28, 32]) {
    const a = await open({ seed: Object.assign({}, PREG(w), { intake: { goal: 'food' }, mods: { plan: planOf('preg', 'food', ago(3)) } }) });
    const s = (await acts(a.page)).find((x) => x.id === 'food') || {};
    check('4 week ' + w + ': "' + want[w][0] + '" with the food page\'s own line', s.title === want[w][0] && s.sub === want[w][1] && s.go === 'preg-diet', s);
    errsAll.push(...a.errs); await a.ctx.close();
  }
  const b = await open({ seed: Object.assign({}, PREG(20), { intake: { goal: 'food' }, mods: { plan: planOf('preg', 'food', ago(3)) } }), hash: '#preg-diet' });
  check('4 the pregnancy food page links "Fasting in pregnancy"', await has(b.page, '#view [data-go="periods-fasting"]'));
  errsAll.push(...b.errs); await b.ctx.close();
}

/* ---------- 5. Food while she breastfeeds ---------- */
{
  const a = await open({ seed: { situation: { deliveredOn: ago(60), breastfeeding: true }, events: [], intake: { goal: 'feed' }, mods: { plan: planOf('post', 'feed', ago(2)) } } });
  const s = (await acts(a.page)).find((x) => x.id === 'bfood');
  check('5 after 6 weeks, breastfeeding: once a week, "Food while you breastfeed"', s && s.title === 'Food while you breastfeed' && s.go === 'post-feed', await acts(a.page));
  await dayTo(a.page, 1);
  check('5 ... and not the next day', !(await acts(a.page)).some((x) => x.id === 'bfood'));
  await go(a.page, 'post-feed'); const v = await allText(a.page);
  check('5 the feeding page: "Food while you breastfeed", open, with water at every feed and no herbal powders without a doctor', /Food while you breastfeed/.test(v) && /drink a glass at every feed/.test(v) && /ask your doctor first/.test(v) && (await a.page.$$eval('#view details.pst-acc[open] summary', (xs) => xs.map((x) => x.textContent))).indexOf('Food while you breastfeed') >= 0);
  check('5 ... and links fasting while you breastfeed', await has(a.page, '#view [data-go="periods-fasting"]'));
  errsAll.push(...a.errs); await a.ctx.close();
  const b = await open({ seed: { situation: { deliveredOn: ago(60), breastfeeding: false }, events: [], intake: { goal: 'feed' }, mods: { plan: planOf('post', 'feed', ago(2)) } } });
  check('5 not breastfeeding: no breastfeeding food step', !(await acts(b.page)).some((x) => x.id === 'bfood'));
  errsAll.push(...b.errs); await b.ctx.close();
}

/* ---------- 6. Fasting ---------- */
{
  const a = await open({ seed: { intake: { goal: 'irregular' }, mods: { plan: planOf('cycle', 'irregular', ago(9)) } } });
  check('6 Today keeps to her 3 steps: no fasting question there', !(await has(a.page, '#view #pl-fast-tog')));
  await go(a.page, 'plan');
  check('6 My plan: "Fasting today?" under today\'s row', (await a.page.$eval('#view #pl-fast-tog', (e) => e.textContent).catch(() => '')) === 'Fasting today?');
  await tap(a.page, '#view #pl-fast-tog');
  const f = await acts(a.page);
  check('6 ... tapped: her food step makes way for "On your fast today"', f.some((x) => x.id === 'fast' && x.title === 'On your fast today' && /sargi or sehri/.test(x.sub)) && !f.some((x) => x.id === 'food'), f);
  check('6 ... the fasting step opens the fasting page, and the link now says "Not fasting today"', (f.find((x) => x.id === 'fast') || {}).go === 'periods-fasting' && (await a.page.$eval('#view #pl-fast-tog', (e) => e.textContent).catch(() => '')) === 'Not fasting today');
  await a.page.evaluate(() => { const S = window.Saathi; const d = S.data('plan'); d.log[S.toISO(S.today())] = { ck: { fast: 'd' } }; S.save(); });
  check('6 ... a fasting day she ticks counts as a day she followed her plan', await a.page.evaluate((x) => window.Saathi.plan.dayDone(x), TODAY));
  await tap(a.page, '#view #pl-fast-tog');
  check('6 ... "Not fasting today" brings her food step back', (await acts(a.page)).some((x) => x.id === 'food'));
  /* the evening check-in: today and tomorrow */
  await a.page.clock.setSystemTime(at(0, '20:30')); await go(a.page, 'plan-checkin');
  check('6 the check-in asks "Fasting?": today or tomorrow', (await has(a.page, '#view #pl-ci-fast-today')) && (await has(a.page, '#view #pl-ci-fast-tom')));
  await tap(a.page, '#view #pl-ci-fast-tom');
  check('6 ... "Fasting tomorrow" is kept for tomorrow only', JSON.stringify((await st(a.page)).mods.plan.fast) === JSON.stringify({ [iso(TODAY, 1)]: 1 }), (await st(a.page)).mods.plan.fast);
  await dayTo(a.page, 1); await go(a.page, 'home');
  check('6 ... and tomorrow her food step is the fasting one', (await acts(a.page)).some((x) => x.id === 'fast'));
  await dayTo(a.page, 10);
  check('6 ... old fasting days are cleared after a week (the day she set, 9 days on)', await a.page.evaluate((k) => { const d = window.Saathi.state.mods.plan; return !(d.fast && d.fast[k]); }, iso(TODAY, 1)));   /* V39.9 review FOOD-08: it read a day it never set */
  errsAll.push(...a.errs); await a.ctx.close();
  /* in pregnancy */
  const p = await open({ seed: Object.assign({}, PREG(20), { intake: { goal: 'food' }, mods: { plan: planOf('preg', 'food', ago(3), { fast: { [TODAY]: 1 } }) } }) });
  const ps = (await acts(p.page)).find((x) => x.id === 'fast') || {};
  check('6 pregnant and fasting: "Talk to your doctor before a fast without water"', ps.sub === 'Talk to your doctor before a fast without water', ps);
  check('6 ... her due check-ups stay on Today', (await acts(p.page)).some((x) => x.id === 'pdue') || !(await p.page.evaluate(() => window.Saathi.preg.plan.due().length)));
  errsAll.push(...p.errs); await p.ctx.close();
  /* the fasting page */
  const g = await open({ hash: '#periods-fasting' });
  const v = await allText(g.page);
  check('6 the fasting page: "If you are pregnant or breastfeeding", with sehri, iftar and the stop signs', /If you are pregnant or breastfeeding/.test(v) && /Sehri or sargi/.test(v) && /Iftar, or breaking the fast/.test(v) && /very little or dark urine/.test(v));
  check('6 ... the baby moving less: go to hospital now', /if the baby moves less than usual: break the fast and go to hospital now/.test(v) && await g.page.$$eval('#view .flag.urgent', (xs) => xs.some((x) => /baby moves less/.test(x.textContent))));
  check('6 ... vrat food starts with kuttu or singhara roti, and sabudana and aloo go easy with PMOS or sugar', /For a vrat: kuttu or singhara roti with curd/.test(v) && /go easy on sabudana and aloo/.test(v));
  check('6 ... its sections as chips at the top, the new one included', (await g.page.$$eval('#view .jump-row .chip', (xs) => xs.map((x) => x.textContent))).indexOf('If you are pregnant or breastfeeding') >= 0);
  errsAll.push(...g.errs); await g.ctx.close();
  /* a shared phone */
  const d = await open({ seed: { intake: { goal: 'irregular' }, mods: { plan: planOf('cycle', 'irregular', ago(9)) }, settings: { discreet: true, toursAuto: false } } });
  await go(d.page, 'plan');
  check('6 a shared phone: no fasting question', !(await has(d.page, '#view #pl-fast-tog')));
  errsAll.push(...d.errs); await d.ctx.close();
}

/* ---------- 7. Hindi, 360 px, no page errors ---------- */
{
  const a = await open({ lang: 'hi', seed: { lang: 'hi', intake: { goal: 'heavy' }, mods: { plan: planOf('heavy', 'heavy', ago(25)) } } });
  const s = (await acts(a.page)).find((x) => x.id === 'iron') || {};
  check('7 Hindi: "आज का आयरन वाला खाना" with a Hindi food name', /^आज का आयरन वाला खाना: [ऀ-ॿ]/.test(s.title || '') && s.sub === 'इसे नींबू, आँवला या अमरूद के साथ खाएँ।', s);
  await go(a.page, 'plan'); await tap(a.page, '#view #pl-fast-tog'); await go(a.page, 'home');
  check('7 Hindi: the fasting step', ((await acts(a.page)).find((x) => x.id === 'fast') || {}).title === 'आज आपका व्रत है');
  check('7 Hindi, 360 px: no sideways scroll on Today', await noScroll(a.page));
  await go(a.page, 'periods-fasting');
  check('7 Hindi: the fasting page\'s new section', /अगर आप गर्भवती हैं या स्तनपान करा रही हैं/.test(await allText(a.page)) && await noScroll(a.page));
  await shot(a.page, '07-fasting-hi');
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 8. The 25 Oct review of V39.9 (MODULE_API 52.1). Each check fails on the reviewed copy ---------- */
{
  const searchQ = async (page, q) => { if (!(await has(page, '#care-q'))) await go(page, 'care'); await page.fill('#care-q', q); await settle(page, 300); };
  const quick = (page) => page.$eval('#view .ans-first [data-qa]', (e) => e.dataset.qa).catch(() => '');
  const tools = (page) => page.$$eval('#view .care-sec .item.tile[data-go]', (xs) => xs.map((b) => b.dataset.go).slice(0, 4)).catch(() => []);
  const remOf = (page, id) => page.evaluate((i) => { const r = (window.Saathi.state.reminders || []).find((x) => x.id === i); return r ? { on: r.on !== false } : null; }, id);
  const remOff = async (page, id) => { await go(page, 'tools-reminders'); await page.$eval('[data-rtog="' + id + '"]', (c) => { c.checked = false; c.dispatchEvent(new Event('change')); }); await settle(page, 300); };
  const ticks = (ids, days) => { const log = {}; days.forEach((n) => { log[ago(n)] = { ck: Object.fromEntries(ids.map((i) => [i, 'd'])) }; }); return log; };
  const best = async (page) => { await go(page, 'plan'); return page.$eval('#view .pl-best', (e) => e.textContent).catch(() => ''); };
  const doneBottoms = (page) => page.evaluate(() => ({ nav: Math.round(document.querySelector('#tabbar').getBoundingClientRect().top), done: Array.from(document.querySelectorAll('#view .today-card [data-today-act], #view .today-card [data-today-nav]')).map((x) => Math.round(x.getBoundingClientRect().bottom)) }));   /* Version 39.12: her yoga's Start counts as its button */
  const fits = (m, n) => m.done.length >= n && m.done.slice(0, n).every((y) => y <= m.nav);
  const Q = { preg: 'pregnancy.dos-and-donts', post: 'pregnancy.after-birth-dos-and-donts', cycle: 'cycle.period-dos-and-donts', loss: 'conceive.after-a-pregnancy-loss-care-and-support', danger: 'pregnancy.danger-signs-call-112' };
  const askAll = async (page, qs) => { const o = {}; for (const q of qs) { await searchQ(page, q); o[q] = await quick(page); } return o; };

  /* SAFETY-01, FIXES-01: a loss she types or Sakhi holds comes before any stage word; her pregnancy before period words */
  const l = await open({ seed: { situation: { pregEndedOn: ago(14), pregEndedHow: 'loss' }, events: regular(80) }, hash: '#care' });
  const lq = await askAll(l.page, ['garbhpat ke baad kya kare', 'गर्भपात के बाद क्या करें', 'garbh gir gaya kya kare', 'गर्भ गिरने के बाद क्या करें', 'pregnancy loss ke baad kya kare', 'kya kare']);
  check('8 SAFETY-01 14 days after a loss: her words about it get the loss guide, never the pregnancy dos and don\'ts', Object.values(lq).every((x) => x === Q.loss), lq);
  errsAll.push(...l.errs); await l.ctx.close();
  const p1 = await open({ seed: PREG(12), hash: '#care' });
  const pq = await askAll(p1.page, ['period jaisa dard kya kare', 'पीरियड जैसा दर्द क्या करें', 'kya kare']);
  check('8 SAFETY-01 pregnant: "period jaisa dard kya kare" keeps the pregnancy guide', Object.values(pq).every((x) => x === Q.preg), pq);
  const pq2 = await askAll(p1.page, ['garbhpat ho raha hai kya kare', 'abortion karana hai kya kare']);
  check('8 SAFETY-01 pregnant: a loss happening now is the danger guide; asking for an abortion gets no guide (the tools lead)', pq2['garbhpat ho raha hai kya kare'] === Q.danger && pq2['abortion karana hai kya kare'] === '', pq2);
  errsAll.push(...p1.errs); await p1.ctx.close();
  const b1 = await open({ seed: { situation: { deliveredOn: ago(20) }, events: [] }, hash: '#care' });
  const bq = await askAll(b1.page, ['pregnancy ke baad kya kare', 'प्रेग्नेंसी के बाद क्या करें', 'after pregnancy precautions', 'delivery ke baad kya kare']);
  check('8 SAFETY-01 after a birth: "pregnancy ke baad" is the after-birth guide', Object.values(bq).every((x) => x === Q.post), bq);
  errsAll.push(...b1.errs); await b1.ctx.close();
  const c1 = await open({ hash: '#care' });
  const cq = await askAll(c1.page, ['गर्भनिरोधक गोली भूल गई क्या करें', 'pregnancy rokne ke liye kya kare', 'pregnant hone ke liye kya kare', 'pregnancy me kya kare', 'kya kare', 'garbhpat ke baad kya kare']);
  check('8 SAFETY-01 not pregnant: contraception and "to get pregnant" are not the pregnancy guide; a stage she names still is', cq['गर्भनिरोधक गोली भूल गई क्या करें'] !== Q.preg && cq['pregnancy rokne ke liye kya kare'] !== Q.preg && cq['pregnant hone ke liye kya kare'] !== Q.preg && cq['pregnancy me kya kare'] === Q.preg && cq['kya kare'] === Q.cycle && cq['garbhpat ke baad kya kare'] === Q.loss, cq);
  /* FIXES-03: a question mark after a phrase */
  await searchQ(c1.page, 'pregnancy test?'); const pt = await tools(c1.page);
  check('8 FIXES-03 "pregnancy test?" still leads with When to test', pt[0] === 'pregtest-when', pt);
  errsAll.push(...c1.errs); await c1.ctx.close();
  /* SAFETY-02: the danger guide for 2 more of Help's signs, and not for a blood test or anaemia question */
  const d1 = await open({ seed: PREG(30), hash: '#care' });
  const dq = await askAll(d1.page, ['severe headache', 'sir me tez dard', 'bachcha kam hil raha hai', 'बच्चा कम हिल रहा है', 'baby moving less', 'bleeding', 'khoon aa raha hai']);
  check('8 SAFETY-02 pregnant: a severe headache and the baby moving less lead with the danger guide (and bleeding still does)', Object.values(dq).every((x) => x === Q.danger), dq);
  const fq = await askAll(d1.page, ['खून की कमी में क्या खाएँ', 'khoon ki kami', 'blood test kab hota hai', 'blood group']);
  check('8 SAFETY-02 pregnant: anaemia and blood-test questions are not the danger guide', Object.values(fq).every((x) => x !== Q.danger), fq);
  await searchQ(d1.page, 'bachcha kam hil raha hai'); const kt = await tools(d1.page);
  check('8 SAFETY-02 ... and her baby\'s movements lead with the kick counter, not trying for a baby', kt[0] === 'pregtools-kicks', kt);
  await searchQ(d1.page, '9 tarikh?'); const nt = await tools(d1.page);
  check('8 FIXES-03 pregnant: "9 tarikh?" still leads with her pregnancy schemes', nt[0] === 'access-schemes-preg', nt);
  errsAll.push(...d1.errs); await d1.ctx.close();

  /* FIXES-02: a PMMVY reminder she switched off stays off when Today or a schemes page checks the claim */
  for (const [rid, claim] of [['access-pmmvy2', { started: ago(120), applied: ago(110), got: ago(100), docs: {} }], ['access-pmmvy', { started: ago(10), docs: {} }]]) {
    const a = await open({ seed: { situation: { deliveredOn: ago(20), breastfeeding: true }, events: [], mods: { access: { claims: { pmmvy: claim } } } }, hash: '#access-schemes-post' });
    const r0 = await remOf(a.page, rid); await remOff(a.page, rid);
    await go(a.page, 'home'); await dayTo(a.page, 1); await go(a.page, 'access-schemes-post');
    check('8 FIXES-02 "' + rid + '": switched off, it stays off after Today, the next day and the schemes page', r0 && r0.on && JSON.stringify(await remOf(a.page, rid)) === JSON.stringify({ on: false }), [r0, await remOf(a.page, rid)]);
    errsAll.push(...a.errs); await a.ctx.close();
  }
  /* FIXES-05: the PMMVY card's lines for a second child, check-ups before this pregnancy, and an older baby */
  const card = (page) => page.$eval('[data-claim="pmmvy"]', (e) => e.textContent).catch(() => '');
  const pm = async (seed) => { const a = await open({ seed, hash: '#access-schemes-preg' }); const v = await card(a.page); errsAll.push(...a.errs); await a.ctx.close(); return v; };
  const anc = (xs) => ({ preg: { mcp: { anc: xs } } });
  const second = await pm({ situation: { pregnant: true, pregnantSince: ago(140) }, events: [], mods: Object.assign(anc([ago(70)]), { access: { claims: { pmmvy: { started: ago(10), docs: {}, second: true } } } }) });
  const first = await pm({ situation: { pregnant: true, pregnantSince: ago(140) }, events: [], mods: Object.assign(anc([ago(70)]), { access: { claims: { pmmvy: { started: ago(10), docs: {}, second: false } } } }) });
  check('8 FIXES-05 a second child: no "first part (₹3,000) now" line (a first child still gets it)', !/first part \(₹3,000\)/.test(second) && /first part \(₹3,000\)/.test(first), [second.slice(0, 300), first.slice(0, 300)]);
  const before = await pm({ situation: { pregnant: true, pregnantSince: ago(42) }, events: [], mods: Object.assign(anc([ago(200), ago(150)]), { access: { claims: { pmmvy: { started: ago(5), docs: {} } } } }) });
  check('8 FIXES-05 check-ups from before this pregnancy don\'t count', !/first part \(₹3,000\)/.test(before), before.slice(0, 300));
  const older = await pm({ situation: { pregnant: true, pregnantSince: ago(140), deliveredOn: ago(730) }, events: [], mods: Object.assign(anc([ago(70)]), { access: { claims: { pmmvy: { started: ago(10), applied: ago(8), got: ago(2), docs: {} } } } }) });
  check('8 FIXES-05 an older baby\'s birth: no past "Register by" date and no "second part" in a new pregnancy', !/Register by/.test(older) && !/second part/.test(older), older.slice(0, 300));

  /* FIXES-04: a pause never switches back on a plan reminder she switched off, even after a time change during it */
  const REM = [{ id: 'plan', kind: 'custom', mod: 'plan', title: { en: 'How did today go? 1 minute', hi: 'आज कैसा रहा? 1 मिनट' }, time: '20:00', every: 1, on: true, start: ago(30) }];
  for (const end of ['button', 'week']) {
    const a = await open({ seed: { reminders: REM, intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(20)) } }, hash: '#plan' });
    await tap(a.page, '#view #pl-pause'); await tap(a.page, '#view [data-pl-at="21:00"]'); await go(a.page, 'plan');
    await remOff(a.page, 'plan');
    if (end === 'button') { await go(a.page, 'plan'); await tap(a.page, '#view #pl-unpause'); } else { await a.page.clock.setSystemTime(at(8, '10:00')); await go(a.page, 'home'); await go(a.page, 'plan'); }
    check('8 FIXES-04 paused, time changed, switched off: still off when the pause ends (' + end + ')', JSON.stringify(await remOf(a.page, 'plan')) === JSON.stringify({ on: false }), await remOf(a.page, 'plan'));
    errsAll.push(...a.errs); await a.ctx.close();
  }
  /* FIXES-07: an after-birth plan at her baby's first birthday is kept as "Your last plan" */
  const k = await open({ seed: { situation: { deliveredOn: ago(366) }, events: [], intake: { goal: 'weight', stage: 'post' }, mods: { plan: planOf('post', 'weight', ago(345), { keep: true }) } } });
  const ks = (await st(k.page)).mods.plan; await go(k.page, 'plan');
  check('8 FIXES-07 the first birthday: her after-birth plan ends, and My plan shows it as "Your last plan"', !ks.start && (ks.past || []).length === 1 && ks.past[0].pack === 'post' && ks.past[0].end >= ago(7) && ks.past[0].end <= ago(1) && /Your last plan/.test(await view(k.page)), { start: ks.start, past: ks.past });
  errsAll.push(...k.errs); await k.ctx.close();
  const k2 = await open({ seed: { situation: { deliveredOn: ago(450) }, events: [], intake: { goal: 'weight', stage: 'post' }, mods: { plan: planOf('post', 'weight', ago(90)) } } });
  const ks2 = (await st(k2.page)).mods.plan;
  check('8 FIXES-07 ... a plan started 5 days before the birthday, opened months later, ends on the birthday', (ks2.past || []).length === 1 && ks2.past[0].end === ago(85), ks2.past);   /* the check of the fixes */
  errsAll.push(...k2.errs); await k2.ctx.close();
  /* FIXES-08: a general "Speak to a doctor" keeps the words she typed in the call form */
  const q = await open({ config: { app: 'test-0.39-demo' } });
  await q.page.evaluate(() => window.Saathi.ask('About my periods')); await settle(q.page, 300);
  await go(q.page, 'ask-call'); await q.page.fill('#ac-topic', 'About my periods, and pain during sex'); await settle(q.page, 200);
  await go(q.page, 'help'); await q.page.$eval('#view [data-ask=""]', (b) => b.click()); await settle(q.page, 400); await go(q.page, 'ask-call');
  check('8 FIXES-08 the call form keeps her own words after a general "Speak to a doctor"', (await q.page.$eval('#ac-topic', (e) => e.value).catch(() => '')) === 'About my periods, and pain during sex');
  errsAll.push(...q.errs); await q.ctx.close();

  /* FIXES-06, SAFETY-03: at 360 x 800 her 3 Done buttons sit above the tab bar on the trying plan, a late period and a
     fasting day; on a day the card carries today's chance, the chance and its estimate line come first */
  const ev7 = (last) => { const out = []; for (let i = 6; i >= 0; i--) out.push({ d: ago(last + i * 28), t: 'start' }, { d: ago(last + i * 28 - 5), t: 'end' }); return out; };
  for (const lang of ['en', 'hi']) {
    for (const [name, seed] of [['trying plan', { situation: { planning: true }, goals: ['ttc'], intake: { goal: 'ready', stage: 'ttc' }, mods: { plan: planOf('ttc', 'ready', ago(9)) } }], ['a late period', { events: regular(46), intake: { goal: 'irregular', stage: 'cycle' }, mods: { plan: planOf('cycle', 'irregular', ago(9)) } }]]) {
      const a = await open({ lang, seed: Object.assign({ lang }, seed) }); const m = await doneBottoms(a.page);
      check('8 FIXES-06 ' + lang + ', ' + name + ': all 3 Done buttons above the tab bar', fits(m, 3), m);
      errsAll.push(...a.errs); await a.ctx.close();
    }
    const f = await open({ lang, seed: { lang, intake: { goal: 'irregular', stage: 'cycle' }, mods: { plan: planOf('cycle', 'irregular', ago(9)) } } });
    await go(f.page, 'plan'); await tap(f.page, '#view #pl-fast-tog');
    const tips = await view(f.page); await go(f.page, 'home'); const fm = await doneBottoms(f.page);
    check('8 SAFETY-03 ' + lang + ', a fasting day: all 3 Done buttons above the tab bar, and her fasting tips on My plan', fits(fm, 3) && (lang === 'en' ? /On your fast today: a proper sargi or sehri/.test(tips) : /आज आपका व्रत है: सरगी या सेहरी/.test(tips)), [fm, tips.slice(0, 400)]);
    errsAll.push(...f.errs); await f.ctx.close();
    const c = await open({ lang, seed: { lang, events: ev7(12), intake: { goal: 'irregular', stage: 'cycle' }, mods: { plan: planOf('cycle', 'irregular', ago(9)) } } });
    const ct = await c.page.$eval('#view .hero.mini', (e) => e.textContent).catch(() => ''); const cm = await doneBottoms(c.page);
    check('8 FIXES-06 ' + lang + ', a fertile-window day: today\'s chance and "not a way to avoid pregnancy" in the card, then her steps (' + (lang === 'en' ? 2 : 1) + ' Done above the tab bar)', (lang === 'en' ? /High chance of pregnancy/.test(ct) && /not a way to avoid pregnancy/.test(ct) : /गर्भ ठहरने की संभावना/.test(ct) && /गर्भ रोकने का/.test(ct)) && fits(cm, lang === 'en' ? 2 : 1), [cm, ct.slice(0, 200)]);
    errsAll.push(...c.errs); await c.ctx.close();
  }

  /* FOOD-01: in pregnancy and while she breastfeeds, the fasting step reaches every plan; a chip only for a day it changes */
  const n = await open({ seed: Object.assign({}, PREG(10), { intake: { goal: 'nausea', stage: 'preg' }, mods: { plan: planOf('preg', 'nausea', ago(5)) } }) });
  await go(n.page, 'plan'); const nTog = await has(n.page, '#view #pl-fast-tog'); if (nTog) await tap(n.page, '#view #pl-fast-tog');
  const na = await acts(n.page);
  check('8 FOOD-01 pregnant (nausea plan, no food step): "Fasting today?" brings the fasting step with its doctor line; her check-ups stay', nTog && na.some((x) => x.id === 'fast' && x.sub === 'Talk to your doctor before a fast without water') && na.some((x) => x.id === 'nausea') && (na.some((x) => x.id === 'pdue') || !(await n.page.evaluate(() => window.Saathi.preg.plan.due().length))), na);
  errsAll.push(...n.errs); await n.ctx.close();
  const pb = await open({ seed: { situation: { deliveredOn: ago(21), breastfeeding: true }, events: [], intake: { goal: 'feed', stage: 'post' }, mods: { plan: planOf('post', 'feed', ago(14), { fast: { [TODAY]: 1 } }) } } });
  const pa = await acts(pb.page);
  check('8 FOOD-01 3 weeks after a birth, breastfeeding, fasting: the recovery check stays and the fasting step takes the pelvic step\'s place', pa.length === 3 && pa[0].id === 'rcheck' && pa.some((x) => x.id === 'fast') && !pa.some((x) => x.id === 'pelvic'), pa);
  errsAll.push(...pb.errs); await pb.ctx.close();
  const mb = await open({ seed: Object.assign({}, MENO, { intake: { goal: 'bones' }, mods: { plan: planOf('meno', 'bones', ago(1)) } }), now: at(0, '20:30') });
  await go(mb.page, 'plan-checkin');
  check('8 FOOD-01 a day with no food step: the check-in offers only "Fasting tomorrow" (its calcium day)', !(await has(mb.page, '#view #pl-ci-fast-today')) && (await has(mb.page, '#view #pl-ci-fast-tom')));
  errsAll.push(...mb.errs); await mb.ctx.close();
  /* FOOD-02: food while she breastfeeds shows in the first weeks too, and opens at its card */
  const bf = await open({ seed: { situation: { deliveredOn: ago(1), breastfeeding: true }, events: [], intake: { goal: 'feed', stage: 'post' }, mods: { plan: planOf('post', 'feed', ago(0)) } } });
  await dayTo(bf.page, 2); await go(bf.page, 'home'); const ba = await acts(bf.page);
  check('8 FOOD-02 the 3rd day of her plan, 3 days after the birth: "Food while you breastfeed" with the recovery check', ba.some((x) => x.id === 'bfood') && ba.some((x) => x.id === 'rcheck'), ba);
  if (await has(bf.page, '#view .today-go[data-go-at="bf-food"]')) await tap(bf.page, '#view .today-go[data-go-at="bf-food"]');
  const at1 = await bf.page.evaluate(() => { const e = document.querySelector('#view [data-at="bf-food"]'); return { hash: location.hash, open: !!(e && e.open), top: e ? Math.round(e.getBoundingClientRect().top) : null, vh: window.innerHeight }; });
  check('8 FOOD-02 ... it opens the feeding page at that card, open', at1.hash === '#post-feed' && at1.open && at1.top != null && at1.top >= 0 && at1.top < at1.vh / 2, at1);
  errsAll.push(...bf.errs); await bf.ctx.close();
  /* FOOD-04: each trimester opens with how much more to eat; the middle months include salt and water */
  const tips4 = {}; const tp = await open({ seed: PREG(20) });
  for (const w of [13, 14, 18, 28]) tips4[w] = await tp.page.evaluate((x) => window.Saathi.preg.foodTip(x), w);
  check('8 FOOD-04 weeks 14 and 28 open with "How much more to eat" (350 extra calories); week 18: iodised salt and water', tips4[14].t === 'How much more to eat' && /350 extra calories/.test(tips4[14].p) && tips4[28].t === 'How much more to eat' && tips4[18].t === 'Iodised salt and water', tips4);
  errsAll.push(...tp.errs); await tp.ctx.close();
  /* FOOD-05: every earlier habit comes back in her 12 weeks */
  const sv = await open({ seed: { intake: { goal: 'irregular' }, mods: { plan: planOf('cycle', 'irregular', ago(0)) } } });
  const still = []; for (const d of [18, 25, 32, 39, 46, 53, 60, 67, 74, 81]) { await dayTo(sv.page, d); const s = (await acts(sv.page)).find((x) => x.id === 'food'); still.push(s ? s.title : ''); }
  check('8 FOOD-05 "Still doing ...?" brings back each of her 5 earlier habits by week 12', still.every((x) => /^Still doing /.test(x)) && new Set(still).size === 5, still);
  errsAll.push(...sv.errs); await sv.ctx.close();
  const sr = await open({ seed: { intake: { goal: 'irregular' }, mods: { plan: planOf('cycle', 'irregular', ago(0), { hab0: 1 }) } } });
  const still1 = []; for (const d of [4, 11, 18, 25, 32, 39, 46, 53, 60, 67, 74, 81]) { await dayTo(sr.page, d); const s = (await acts(sr.page)).find((x) => x.id === 'food'); still1.push(s ? s.title : ''); }
  check('8 FOOD-05 ... after a fair restart (she kept her first habit) too', still1.every((x) => /^Still doing /.test(x)) && new Set(still1).size === 5, still1);   /* the check of the fixes */
  errsAll.push(...sr.errs); await sr.ctx.close();
  /* FOOD-06: summaries name a step, not one day's food or question */
  const h6 = await open({ seed: { intake: { goal: 'heavy' }, mods: { plan: planOf('heavy', 'heavy', ago(28), { log: ticks(['iron'], [7, 6, 5, 4, 3, 2, 1]), weeks: { 4: { e: 'ok', b: 'none', d: ago(0) } } }) } } });
  const hb6 = await best(h6.page);
  check('8 FOOD-06 the look-back after the iron rotation: "An iron-rich food today, 7 days"', /An iron-rich food today, 7 days/.test(hb6) && !/Today’s iron food/.test(hb6), hb6);
  errsAll.push(...h6.errs); await h6.ctx.close();
  const c6 = await open({ seed: { intake: { goal: 'irregular' }, mods: { plan: planOf('cycle', 'irregular', ago(21), { log: ticks(['food'], [7, 6, 5, 4, 3]), weeks: { 3: { e: 'ok', b: 'none', d: ago(0) } } }) } } });
  const cb6 = await best(c6.page);
  check('8 FOOD-06 ... and her week\'s habit, not the "Still doing" question', /Protein at breakfast, 5 days/.test(cb6) && !/Still doing/.test(cb6), cb6);
  errsAll.push(...c6.errs); await c6.ctx.close();
  const nextPlan = (pack, goal) => ({ next: { pack: pack, goalKey: goal, goal: 'cycles', focus: 'habits', level: 0, limits: { knees: false, back: false }, food: 'veg', when: 'evening', bed: 'b23', work: 'day', remAt: '20:00', at: TODAY, intake: { goal: goal } }, log: {}, weeks: {}, body: [] });
  const r6 = await open({ seed: Object.assign({}, MENO, { intake: { goal: 'bones' }, mods: { plan: nextPlan('meno', 'bones') } }), hash: '#plan-reveal' });
  for (let i = 0; i < 3; i++) { if (await has(r6.page, '#view .pl-rv-steps')) break; if (!(await has(r6.page, '#pl-rv-next'))) break; await tap(r6.page, '#pl-rv-next'); }
  const rs6 = await r6.page.$$eval('#view .pl-rv-steps strong', (xs) => xs.map((x) => x.textContent)).catch(() => []);
  check('8 FOOD-06 the plan screen: "3 days a week: Calcium from your kitchen, for your bones"', rs6.indexOf('3 days a week: Calcium from your kitchen, for your bones') >= 0 && !rs6.some((x) => /Every day: Today’s calcium food/.test(x)), rs6);
  errsAll.push(...r6.errs); await r6.ctx.close();
  /* FOOD-07: the calcium food doesn't repeat inside a week */
  const ca7 = await open({ seed: Object.assign({}, MENO, { intake: { goal: 'bones' }, mods: { food: { type: 'veg', milk: true }, plan: planOf('meno', 'bones', ago(0), { region: 'north' }) } }) });
  const wk7 = []; for (let w = 0; w < 2; w++) { const row = []; for (const d of [0, 2, 5]) { await dayTo(ca7.page, w * 7 + d); row.push(((await acts(ca7.page)).find((x) => x.id === 'ca') || {}).title || ''); } wk7.push(row); }
  check('8 FOOD-07 north, with milk: 3 different calcium foods in each of 2 weeks', wk7.every((r) => r.every(Boolean) && new Set(r).size === 3), wk7);
  errsAll.push(...ca7.errs); await ca7.ctx.close();
  /* FOOD-08: a fasting day is cleared after a week even if she never taps a fasting chip again */
  const pr = await open({ seed: { intake: { goal: 'irregular' }, mods: { plan: planOf('cycle', 'irregular', ago(9)) } } });
  await go(pr.page, 'plan'); await tap(pr.page, '#view #pl-fast-tog'); const f0 = (await st(pr.page)).mods.plan.fast || {};
  await dayTo(pr.page, 9); await go(pr.page, 'home'); const f9 = (await st(pr.page)).mods.plan.fast || {};
  check('8 FOOD-08 "Fasting today?" is kept on the phone for a week at most', f0[TODAY] === 1 && !(TODAY in f9), [f0, f9]);
  errsAll.push(...pr.errs); await pr.ctx.close();
}

check('no page errors', errsAll.length === 0, errsAll.slice(0, 5));
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' : 'OK ') + (results.length - failed.length) + '/' + results.length + ' checks (foodsteps)');
process.exit(failed.length ? 1 : 0);
