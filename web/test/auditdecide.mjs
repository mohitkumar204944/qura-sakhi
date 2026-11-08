// Version 39.87: the presentation audit's three decisions (docs/presentation-audit-2026-11-08.md, D1, D3, D5; MODULE_API section 130).
// Mohit, 8 Nov: "also do The audit's three decisions as per your recommendations". This file checks:
//   1 D1, Today without a plan: while her countdown shows, the days to her period are the card's one big number (as on the plan's
//     card) and her cycle day sits in the smaller ring, so "How do you feel today?" reaches the first screen; with no countdown (a
//     late period, one period logged, discreet mode) the ring's cycle day stays big; the plan's card is unchanged; English and Hindi
//     at 360 x 800;
//   2 D3, Me: one colour per kind of row: rose for her own, teal for her care, purple for how Sakhi works on her phone;
//   3 D5, the Diary's Calendar: the + waits while her "How do you feel today?" tiles are on screen, then comes when they scroll away;
//     the Cycles tab and Today keep theirs;
//   4 no page errors.
// Usage: node test/auditdecide.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'auditdecide'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 900)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-11-11';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const TOURS = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, setDisguise(){}, isDisguised(){ return false; }, keepAwake(){} };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Priya Sharma', pincode: '302001', activeOn: TODAY };
const base = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1997-04-01', consent: { c1: ago(300), c2: null, c4: null }, situation: { care: 'private' }, events: [], daily: {}, notes: {}, checkins: {},
  tours: TOURS, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.39', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30) }, mods: {}, reminders: [], focus: { tile: 'cycle', goals: [], at: ago(200) }, intake: { goal: 'track', stage: 'cycle' } }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
const evs = (starts) => starts.flatMap((s) => [{ d: ago(s), t: 'start' }, { d: ago(s - 4), t: 'end' }]);
const REG = evs([10, 38, 66, 94, 122, 150, 178, 206]);   /* 8 periods 28 days apart, the last 10 days ago: a countdown shows */
const LATE = evs([40, 68, 96, 124, 152, 180]);           /* the same rhythm, last 40 days ago: late */
const log2 = {}; for (let i = 28; i >= 1; i--) if ((28 - i) % 7 < 4) log2[ago(i)] = { min: 15, ci: 1, ck: { move: 'd', food: 'd', yoga: 'd', sleep: 'd' } };
const PLAN = { situation: { pcos: true, care: 'private' }, intake: { goal: 'pmos', stage: 'cycle' }, events: evs([106, 64, 22]), focus: { tile: 'cycle', goals: ['pmos'], at: ago(60) },
  mods: { plan: { pack: 'cycle', goalKey: 'pmos', start: ago(28), started: ago(28), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '22:00', when: 'dinner', bed: 'b23', work: 'day', log: log2 } } };

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 360, height: o.h || 800 }, locale: (o.seed || {}).lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ app: '0.39.87-pilot', platform: 'android' }) + ';');
  await ctx.addInitScript(ANDROID);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(base(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: new Date(TODAY + 'T10:30:00+05:30') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 700);
  return { ctx, page, errs, name: o.name || 'page' };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 500) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); await page.evaluate(() => window.scrollTo(0, 0)); await settle(page, 200); };
const done = async (x) => { check(x.name + ': no page errors', !x.errs.length, x.errs); await x.ctx.close(); };
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png') });
/* Today's card: its row, the ring, the countdown, the biggest text on the first screen (the top bar's wordmark is the logo) */
const hero = (page) => page.evaluate(() => {
  const card = document.querySelector('#view .card.hero'); if (!card) return null; const ring = card.querySelector('.ringwrap'); const cd = card.querySelector('.cd-n'); const day = card.querySelector('.ringc b');
  const vh = innerHeight; let big = { fs: 0, s: '' };
  const w = document.createTreeWalker(document.querySelector('#view'), NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) { const s = n.textContent.trim(); const el = n.parentElement; if (!s || !el) continue; const r = el.getBoundingClientRect(); if (r.bottom <= 0 || r.top >= vh || !r.width) continue; const fs = parseFloat(getComputedStyle(el).fontSize); if (fs > big.fs) big = { fs: fs, s: s }; }
  const feel = Array.from(document.querySelectorAll('#view h2, #view h3, #view b, #view strong, #view p')).find((x) => /How do you feel today\?|आज आप कैसा महसूस कर रही हैं\?/.test(x.textContent) && x.children.length < 3);
  return { first: !!card.querySelector('.hero-row.cd-first'), mini: card.classList.contains('head'), ring: ring ? Math.round(ring.getBoundingClientRect().width) : 0, bignum: !!document.querySelector('#bignum'),
    cd: cd ? { s: cd.textContent, fs: parseFloat(getComputedStyle(cd).fontSize) } : null, day: day ? parseFloat(getComputedStyle(day).fontSize) : 0, big: big,
    feelTop: feel ? Math.round(feel.getBoundingClientRect().top) : 9999, nav: document.querySelector('#tabbar').getBoundingClientRect().top, noScroll: document.documentElement.scrollWidth <= innerWidth + 1 };
});

/* ---------- 1. D1 ---------- */
for (const lang of ['en', 'hi']) {
  const a = await open({ name: '1 Today ' + lang, seed: { lang: lang, events: REG } });
  const h = await hero(a.page);
  check('1 ' + lang + ': with her countdown, the days to her period are the card\'s one big number (50 px, the biggest text on the first screen)', h && h.first && h.cd && h.cd.s === '18' && h.cd.fs === 50 && h.big.fs === 50 && h.big.s === '18', h);
  check('1 ' + lang + ': ... her cycle day in the ring at the plan card\'s size (88 px, 30 px)', h && h.ring === 88 && h.day === 30, h);
  check('1 ' + lang + ': ... so "How do you feel today?" starts on the first screen at 360 x 800, with no sideways scroll', h && h.feelTop < h.nav - 30 && h.noScroll, h);
  await shot(a.page, '1-today-' + lang);
  await done(a);
}
for (const [name, seed, want] of [['a late period', { events: LATE }, 'ring'], ['one period logged', { events: evs([10]) }, 'ring'], ['discreet mode', { events: REG, settings: { discreet: true } }, 'bignum'], ['her plan running', PLAN, 'mini']]) {
  const a = await open({ name: '1 ' + name, seed: seed });
  const h = await hero(a.page);
  /* the full-size ring is 128 px at 360 px (148 px on a wider phone); discreet mode shows her cycle day alone (#bignum, 64 px) */
  const ok = want === 'mini' ? h && h.mini && !h.first : (want === 'bignum' ? h && h.bignum && !h.first && h.big.s === '11' && h.big.fs >= 42 : h && !h.first && !h.mini && h.ring >= 128 && h.day === 42 && h.big.fs === 42);
  check('1 ' + name + ': ' + (want === 'mini' ? 'the plan\'s one-row card, unchanged' : 'no countdown, so her cycle day stays the big number'), ok, h);
  await done(a);
}

/* ---------- 2. D3 ---------- */
{
  const a = await open({ name: '2 Me', seed: { events: REG }, hash: '#me' });
  const rows = await a.page.evaluate(() => Array.from(document.querySelectorAll('#view .item')).map((it) => { const ic = it.querySelector('.ico-sm'); const m = ic ? (ic.className.match(/hue-(\w+)/) || [])[1] : null; return { go: it.dataset.go || it.id, hue: m }; }).filter((x) => x.hue));
  const want = { account: 'rose', 'me-health': 'rose', 'me-data': 'rose', 'me-care': 'teal', 'me-reminders': 'teal', 'me-privacy': 'purple', lang: 'purple', 'me-look': 'purple', 'me-help': 'purple', 'me-about': 'purple' };
  const got = Object.fromEntries(rows.map((x) => [x.go, x.hue]));
  check('2 Me: one colour per kind of row: rose for her own, teal for her care, purple for how Sakhi works on her phone', Object.keys(want).every((k) => got[k] === want[k]), got);
  check('2 Me: ... three colours on the page\'s rows', new Set(rows.map((x) => x.hue)).size === 3, rows);
  await shot(a.page, '2-me');
  await done(a);
}

/* ---------- 3. D5 ---------- */
{
  const a = await open({ name: '3 Diary', seed: { events: REG }, hash: '#diary' });
  const fab = () => a.page.evaluate(() => { const f = document.querySelector('#fab'); if (!f) return null; const r = f.getBoundingClientRect(); const cs = getComputedStyle(f);
    const over = Array.from(document.querySelectorAll('#view .cal .day, #view .cal button')).filter((d) => { const b = d.getBoundingClientRect(); return b.width && !(b.right < r.left || b.left > r.right || b.bottom < r.top || b.top > r.bottom); }).length;
    return { away: f.classList.contains('away'), shown: cs.visibility !== 'hidden' && +cs.opacity > 0.5, over: over }; });
  await a.page.evaluate(() => { const b = document.querySelector('#view [data-tab="cal"]'); if (b) b.click(); }); await settle(a.page, 600);
  const f0 = await fab();
  check('3 the Diary\'s Calendar: the + waits while her "How do you feel today?" tiles are on screen, so it sits on no day', f0 && f0.away && !f0.shown && !!(await a.page.$('#view .cal-today')), f0);
  await shot(a.page, '3-diary-top');
  await a.page.evaluate(() => { const c = document.querySelector('#view .cal-today'); window.scrollTo(0, c.getBoundingClientRect().bottom + window.scrollY); }); await settle(a.page, 600);
  await a.page.evaluate(() => window.scrollBy(0, -30)); await settle(a.page, 600);
  const f1 = await fab();
  check('3 ... once the tiles have scrolled away, the + comes (here after a little scroll back up)', f1 && !f1.away && f1.shown, f1);
  await a.page.evaluate(() => { const b = document.querySelector('#view [data-tab="tr"]'); if (b) b.click(); }); await settle(a.page, 600);
  const f2 = await fab();
  check('3 the Cycles tab keeps its + showing', f2 && !f2.away && f2.shown, f2);
  await done(a);
  const b = await open({ name: '3 Today', seed: { events: REG } });
  const f3 = await b.page.evaluate(() => { const f = document.querySelector('#fab'); return f ? f.classList.contains('away') : null; });
  check('3 Today keeps its rule: the + waits while her log row is on screen', f3 === true, f3);
  await done(b);
}

await browser.close();
const fails = results.filter((r) => !r.pass);
console.log(results.length - fails.length + '/' + results.length + ' passed');
fs.writeFileSync(path.join(SHOTS, 'results.json'), JSON.stringify(results, null, 2));
process.exit(fails.length ? 1 : 0);
