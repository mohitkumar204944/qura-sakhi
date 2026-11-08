// Version 39.84: Your body now and the cycle in pictures (docs/teach-and-show-advice-2026-11-08.md, part 2, L5 and L6;
// MODULE_API section 127). Mohit, 8 Nov: "you proceed as per your recommendations". This file checks:
//   1 one tap from Today's cycle card (inside that card, not a card of its own) and from today's day page, to "Your body now";
//   2 each state says only what Sakhi can know: her period days; her phase only with 6 regular gaps (with the estimate line);
//     a late period; gaps too far apart (PMOS's picture when PMOS is hers); otherwise how a cycle works, never placing her;
//   3 the health words are the Learn library's own sentences, quoted; her own lines come from her diary;
//   4 the six drawings: one per key, labelled for a screen reader, in the art tokens (light and dark);
//   5 never in a pregnancy, after a birth, on hormones, with periods stopped, in midlife, in discreet mode or on a shared phone;
//   6 Hindi at 360 px, and no page errors.
// Usage: node test/bodynow.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const C = JSON.parse(CONTENT);
const SHOTS = path.join(here, 'shots', 'bodynow'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 900)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-11-08';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const TOURS = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, setDisguise(){}, isDisguised(){ return false; }, keepAwake(){} };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: [], daily: {}, notes: {}, checkins: {},
  tours: TOURS, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.39', focus: { tile: 'cycle', goals: [], at: ago(30) }, prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
const evs = (starts) => { const out = []; starts.forEach((s) => out.push({ d: ago(s), t: 'start' }, { d: ago(s - 4), t: 'end' })); return out; };
const reg = (last, n, gap) => Array.from({ length: n }, (_, i) => last + i * gap);
/* the Learn library's sentences, as the page quotes them */
const art = (g, id) => C.groups.find((x) => x.group === g).articles.find((x) => x.id === id);
const sent = (a, lang, para, i) => (a['body_' + lang][para].split(/(?<=[.?!।])\s+/)[i] || '').replace(/^(Yes, |हाँ, )/, '').replace(/^[a-z]/, (c) => c.toUpperCase());
const CYC = art('cycle', 'what-is-a-menstrual-cycle'); const PM = art('pmos', 'what-pmos-is'); const IRR = art('cycle', 'why-cycles-become-irregular');

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata', colorScheme: o.dark ? 'dark' : 'light' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ app: '0.39.84-pilot', platform: 'android' }) + ';');
  await ctx.addInitScript(ANDROID);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: new Date(TODAY + 'T10:00:00+05:30') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  return { ctx, page, errs, name: o.name || 'page' };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 500) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const view = (page) => page.$eval('#view', (e) => e.innerText);
const has = (page, sel) => page.$(sel).then((x) => !!x);
const tapNow = async (page, sel) => { await page.$eval(sel, (el) => el.click()); await settle(page, 400); };
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const done = async (x) => { check(x.name + ': no page errors', !x.errs.length, x.errs); await x.ctx.close(); };
/* the page for a diary: its eyebrow, its picture's key and its words */
const bodyNow = async (page) => { await go(page, 'body-now'); return page.evaluate(() => ({ hash: location.hash, eyebrow: (document.querySelector('#view .bn-hero .eyebrow') || {}).textContent || '', pic: Array.from(document.querySelectorAll('#view svg.body')).map((s) => s.getAttribute('class').replace('art body ', '')), text: document.querySelector('#view').innerText })); };

/* ---------- 1. the way in: one link inside Today's cycle card, and today's day page ---------- */
{
  const a = await open({ name: '1 Today', seed: { events: evs(reg(20, 8, 28)) } });
  const inCard = await a.page.evaluate(() => { const l = document.querySelector('#view .bn-go'); return !!(l && l.closest('.card.hero')); });
  check('1 Today\'s cycle card has "What’s happening in your body?", inside the card (no card of its own)', inCard && /What’s happening in your body\?/.test(await view(a.page)));
  check('1 ... and Today has no other "Your body now" card', (await a.page.$$('#view .bn-hero')).length === 0);
  await shot(a.page, '1-today');
  await tapNow(a.page, '#view .bn-go');
  check('1 the link opens Your body now', await a.page.evaluate(() => location.hash === '#body-now') && /Your body now/.test(await view(a.page)));
  await go(a.page, 'home'); await a.page.evaluate((d) => window.Saathi.openDay(d), TODAY); await settle(a.page, 300);
  check('1 today\'s day page has the link too', await has(a.page, '#sheet-root #day-bn'));
  await tapNow(a.page, '#sheet-root #day-bn');
  check('1 ... it closes the day page and opens Your body now', !(await has(a.page, '#sheet-root .sheet')) && await a.page.evaluate(() => location.hash === '#body-now'));
  await a.page.evaluate((d) => window.Saathi.openDay(d), ago(3)); await settle(a.page, 300);
  check('1 another day\'s page has no link (it is about now)', !(await has(a.page, '#sheet-root #day-bn')));
  await done(a);
}
/* while her plan runs, Today's one-row cycle card keeps her steps on the first screen (Version 39.23; pictures 3, foodsteps 8):
   the link waits on today's day page */
{
  const plan = { pack: 'cycle', goalKey: 'irregular', start: ago(9), started: ago(9), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'evening', bed: 'b23', work: 'day', log: {} };
  const a = await open({ name: '1 plan', w: 360, h: 800, seed: { events: evs(reg(20, 8, 28)), intake: { goal: 'irregular', stage: 'cycle' }, mods: { plan: plan } } });
  const m = await a.page.evaluate(() => { const nav = document.querySelector('#tabbar').getBoundingClientRect().top; const rows = Array.from(document.querySelectorAll('#view .today-card .pl-row, #view .today-card .item')).filter((x) => x.querySelector('button'));
    return { mini: !!document.querySelector('#view .hero.head'), link: !!document.querySelector('#view .bn-go'), nav: nav, tops: rows.map((x) => Math.round(x.getBoundingClientRect().top)) }; });
  check('1 her plan running: no link in Today\'s one-row cycle card, so her first 2 steps start on the first screen at 360 x 800', m.mini && !m.link && m.tops.length >= 2 && m.tops.slice(0, 2).every((y) => y < m.nav), m);
  await a.page.evaluate((d) => window.Saathi.openDay(d), TODAY); await settle(a.page, 300);
  check('1 ... and today\'s day page has it', await has(a.page, '#sheet-root #day-bn'));
  await done(a);
}

/* ---------- 2 and 3. each state, in the library's own words ---------- */
const CASES = [
  ['period', { events: evs(reg(1, 5, 31)) }, (r) => /Day 2 of your period/.test(r.eyebrow) && r.pic.join() === 'period' && r.text.includes(sent(CYC, 'en', 1, 3)) && r.text.includes(sent(CYC, 'en', 3, 0)) && r.text.includes(art('cycle', 'painful-periods').summary_en) && r.text.includes(art('cycle', 'heavy-bleeding-how-to-tell').summary_en) && /For period cramps/.test(r.text) && /Painful periods/.test(r.text)],
  ['build', { events: evs(reg(7, 8, 28)) }, (r) => /Day 8 of your cycle · Before ovulation/.test(r.eyebrow) && r.pic.join() === 'build' && r.text.includes(sent(CYC, 'en', 1, 1)) && /These dates are estimates from your diary\. They are not a way to avoid pregnancy\./.test(r.text)],
  ['egg', { events: evs(reg(13, 8, 28)) }, (r) => /Day 14 of your cycle · (Fertile window|Ovulation day \(estimate\))/.test(r.eyebrow) && r.pic.join() === 'egg' && r.text.includes(sent(CYC, 'en', 1, 2)) && /not a way to avoid pregnancy/.test(r.text)],
  ['after', { events: evs(reg(20, 8, 28)), daily: { [ago(20 + 28 - 21)]: ['d_bloat'], [ago(20 + 3)]: ['d_ok'] } }, (r) => /Day 21 of your cycle · After ovulation/.test(r.eyebrow) && r.pic.join() === 'after' && r.text.includes(sent(CYC, 'en', 1, 3)) && /8 days until your next period \(estimate\)/.test(r.text) && /Last cycle around this day you noted: Bloating/.test(r.text) && !/Feeling okay/.test(r.text)],
  ['late', { events: evs(reg(36, 6, 29)) }, (r) => /Your period is \d+ days late/.test(r.eyebrow) && r.pic.length === 0 && r.text.includes(art('cycle', 'missed-period-what-to-do-first').summary_en) && /Missed period: what to do first/.test(r.text)],
  ['pmos', { situation: { pcos: true }, events: evs([42, 82, 115, 158]) }, (r) => /Day 43 of your cycle/.test(r.eyebrow) && r.pic.join() === 'pmos' && r.text.includes('On an ultrasound the ovaries can look full of small bubbles.') && r.text.includes(sent(PM, 'en', 1, 2)) && /Sakhi shows counts, not a date/.test(r.text) && !/Before ovulation|Fertile window|After ovulation/.test(r.text)],
  ['long', { events: evs([42, 82, 115, 158]) }, (r) => /Day 43 of your cycle/.test(r.eyebrow) && r.pic.join() === 'long' && r.text.includes(IRR.summary_en) && !/Before ovulation|Fertile window|After ovulation|bubbles/.test(r.text)],
  ['steps', { events: evs([12, 41, 70]) }, (r) => /Day 13 of your cycle/.test(r.eyebrow) && !/·/.test(r.eyebrow) && r.pic.join() === 'build,egg,period' && /How a cycle works/.test(r.text) && /As your diary grows, Sakhi can show where you are in your cycle\./.test(r.text) && !/Fertile window|ovulation \(|estimates from your diary/.test(r.text)],
];
for (const [name, seed, ok] of CASES) {
  const a = await open({ name: '2 ' + name, seed: seed });
  const r = await bodyNow(a.page);
  check('2 ' + name + ': the page says only what Sakhi can know, in the library\'s words', r.hash === '#body-now' && ok(r), { eyebrow: r.eyebrow, pic: r.pic, text: r.text.slice(0, 700) });
  await shot(a.page, '2-' + name);
  await done(a);
}
{
  /* her own pattern: low mood before her period in 3 periods */
  const st = reg(20, 5, 28); const daily = {}; st.slice(1).forEach((s) => [3, 2, 1].forEach((k) => { daily[ago(s - 28 + k)] = ['d_mood']; }));
  st.forEach((s) => { daily[ago(s)] = (daily[ago(s)] || []).concat(['d_cramps']); });
  const a = await open({ name: '3 her pattern', seed: { events: evs(st), daily: daily } });
  const r = await bodyNow(a.page);
  check('3 From your diary: What repeats for you, in its own words', /From your diary/.test(r.text) && /Cramps · usually from the first day of your period/.test(r.text), r.text.slice(0, 900));
  await done(a);
}

/* ---------- 4. the drawings ---------- */
for (const dark of [false, true]) {
  const a = await open({ name: '4 drawings ' + (dark ? 'dark' : 'light'), dark: dark, seed: { events: evs(reg(20, 8, 28)), settings: { theme: dark ? 'dark' : 'light' } } });   /* the app's own theme (Me), not the phone's */
  const d = await a.page.evaluate(() => { const S = window.Saathi; const box = document.createElement('div'); box.innerHTML = S.art.bodyKeys.map((k) => S.art.body(k, 'label ' + k)).join(''); document.body.appendChild(box);
    const out = Array.from(box.querySelectorAll('svg')).map((s) => ({ cls: s.getAttribute('class'), role: s.getAttribute('role'), label: s.getAttribute('aria-label'), fills: Array.from(s.querySelectorAll('path,ellipse,circle')).map((e) => getComputedStyle(e).fill).filter((f) => f && f !== 'none') }));
    box.remove(); return { keys: S.art.bodyKeys, out: out }; });
  check('4 the app is in its ' + (dark ? 'dark' : 'light') + ' theme', await a.page.evaluate(() => document.documentElement.getAttribute('data-theme')) === (dark ? 'dark' : 'light'));
  check('4 six drawings, one per key (' + (dark ? 'dark' : 'light') + ')', d.keys.join() === 'build,egg,after,period,pmos,long' && d.out.length === 6 && d.out.every((x, i) => x.cls === 'art body ' + d.keys[i]));
  check('4 ... each labelled for a screen reader', d.out.every((x, i) => x.role === 'img' && x.label === 'label ' + d.keys[i]));
  check('4 ... each drawn in the art tokens (every fill resolves)', d.out.every((x) => x.fills.length >= 6 && x.fills.every((f) => /^rgb/.test(f))), d.out.map((x) => x.fills.length));
  await done(a);
}

/* ---------- 5. never where it would be wrong or private ---------- */
const HIDDEN = [
  ['pregnant', { situation: { pregnant: true, pregnantSince: ago(60) }, events: evs([62]) }],
  ['after a birth', { situation: { deliveredOn: ago(40), breastfeeding: true }, events: [] }],
  ['on hormones', { situation: { hormones: true, hormonesSince: ago(300) }, events: evs(reg(20, 8, 28)) }],
  ['periods stopped', { situation: { stopped: true }, events: evs(reg(400, 3, 28)) }],
  ['midlife (47)', { dob: '1979-05-01', events: evs(reg(20, 8, 28)) }],
  ['discreet mode', { events: evs(reg(20, 8, 28)), settings: { discreet: true, notify: true } }],
  ['a shared phone', { events: evs(reg(20, 8, 28)), settings: { shared: true, notify: true } }],
  ['no period logged yet', { events: [] }],
];
for (const [name, seed] of HIDDEN) {
  const a = await open({ name: '5 ' + name, seed: seed });
  const link = await has(a.page, '#view .bn-go');
  await go(a.page, 'body-now');
  const h = await a.page.evaluate(() => location.hash); const shown = await has(a.page, '#view .bn-hero');
  check('5 ' + name + ': no link, and the page never shows (home, or the app\'s own gate)', !link && !shown && (h === '#home' || name === 'a shared phone'), { link, h, shown });
  await done(a);
}

/* ---------- 6. Hindi at 360 px ---------- */
{
  const a = await open({ name: '6 Hindi', w: 360, h: 800, seed: { lang: 'hi', events: evs(reg(20, 8, 28)), daily: { [ago(20 + 28 - 21)]: ['d_bloat'] } } });
  check('6 Hindi: Today\'s link', /आपके शरीर में अभी क्या हो रहा है\?/.test(await view(a.page)));
  const r = await bodyNow(a.page);
  check('6 Hindi: the page in Hindi, the library\'s Hindi sentence', /आपका शरीर अभी/.test(r.text) && /चक्र का दिन 21/.test(r.eyebrow) && r.text.includes(sent(CYC, 'hi', 1, 3)) && /पिछले चक्र में इसी दिन के आसपास आपने नोट किया/.test(r.text), r.text.slice(0, 600));
  check('6 Hindi at 360 px: nothing runs off the screen', await noScroll(a.page));
  await shot(a.page, '6-hindi-360');
  const s = await open({ name: '6 Hindi steps', w: 360, h: 800, seed: { lang: 'hi', events: evs([12, 41, 70]) } });
  const r2 = await bodyNow(s.page);
  check('6 Hindi: how a cycle works, three pictures at 360 px', r2.pic.length === 3 && /चक्र कैसे चलता है/.test(r2.text) && await noScroll(s.page));
  await done(s);
  await done(a);
}

await browser.close();
const fails = results.filter((r) => !r.pass);
console.log(results.length - fails.length + '/' + results.length + ' passed');
fs.writeFileSync(path.join(SHOTS, 'results.json'), JSON.stringify(results, null, 2));
process.exit(fails.length ? 1 : 0);
