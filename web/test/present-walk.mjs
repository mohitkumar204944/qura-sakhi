// The presentation audit's walk (L9 of docs/teach-and-show-advice-2026-11-08.md): a walk, not pass/fail. The 12 screens she sees
// most, for three women (her cycle with no plan, PMOS plan day 29, My pregnancy at 24 weeks), in English and Hindi, light and dark,
// at 360 x 800 (the Flip5), and a fourth who joined today with nothing logged (the empty states). Each first screen is photographed and measured: text under 13 px, the biggest text (the focal point),
// how many lines compete with it, running animations, and the page's length in screens.
// Output: test/shots/present-walk/<name>/<lang>-<theme>/NN-screen.png and measures.json.
// Usage: node test/present-walk.mjs [dir] [name]   (dir defaults to this app folder; name to "now")
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const OUT = path.join(here, 'shots', 'present-walk', process.argv[3] || 'now'); fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-11-11';   /* a Wednesday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm) => new Date(TODAY + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, setDisguise(){}, isDisguised(){ return false; }, keepAwake(){} };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Priya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.85-pilot', platform: 'android' };
const base = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1997-04-01', consent: { c1: ago(300), c2: null, c4: null }, situation: { care: 'private' }, events: [], daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.39', joined: ago(200), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30) }, mods: {}, reminders: [] }, x);

/* 1. her cycle, no plan: 8 periods 28 days apart (the last 10 days ago), cramps and tiredness on her first days, bloating and
   a headache in the days before, so What repeats for you and the report have something to show */
const starts1 = [10, 38, 66, 94, 122, 150, 178, 206];
const daily1 = {}; starts1.slice(0, 4).forEach((s) => { daily1[ago(s)] = ['d_cramps', 'd_tired']; daily1[ago(s - 1)] = ['d_cramps']; daily1[ago(s + 3)] = ['d_bloat', 'd_irritable']; daily1[ago(s + 2)] = ['d_headache']; });
daily1[ago(1)] = ['d_ok'];
const cycleW = base({ events: starts1.flatMap((s) => [{ d: ago(s), t: 'start', flow: 'medium' }, { d: ago(s - 4), t: 'end' }]), daily: daily1, focus: { tile: 'cycle', goals: [], at: ago(200) }, intake: { goal: 'track', stage: 'cycle' } });

/* 2. PMOS plan day 29 (the glass walk's woman): three periods 42 days apart */
const log2 = {}; for (let i = 28; i >= 1; i--) if ((28 - i) % 7 < 4) log2[ago(i)] = { min: 15, ci: 1, ck: { move: 'd', food: 'd', yoga: 'd', sleep: 'd' } };
const plan2 = { pack: 'cycle', goalKey: 'pmos', start: ago(28), started: ago(28), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '22:00', when: 'dinner', bed: 'b23', work: 'day', log: log2 };
const planW = base({ situation: { pcos: true, care: 'private' }, intake: { goal: 'pmos', stage: 'cycle' }, events: [106, 64, 22].flatMap((x) => [{ d: ago(x), t: 'start', pain: 'pain_1' }, { d: ago(x - 4), t: 'end' }]), focus: { tile: 'cycle', goals: ['pmos'], at: ago(60) }, mods: { plan: plan2 } });

/* 3. My pregnancy (version 2) at 24 weeks, started 2 weeks ago */
const IK = { at: ago(14), stage: 'preg', goal: 'food', food: 'veg', milk: 'y', act: null, lim: [], pflags: [], psafeW: 22, pnow: null };
const pregW = base({ situation: { pregnant: true, pregnantSince: ago(7 * 24 + 3), care: 'private' }, goals: ['food'], intake: IK, focus: { tile: 'preg', goals: ['food'], at: ago(20) },
  mods: { plan: { pack: 'preg', goalKey: 'food', start: ago(14), started: ago(14), go: true, pv: 2, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: null, log: {}, weeks: {}, body: [], intake: IK } } });

/* 4. new: joined today, nothing logged yet (the empty states) */
const newW = base({ joined: TODAY, focus: { tile: 'cycle', goals: [], at: TODAY }, intake: { goal: 'track', stage: 'cycle' }, prompts: { setup: 'off', planCall: ago(3), notifyAuto: ago(30) } });

const browser = await chromium.launch();
async function open(seed, o) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 2, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript(ANDROID);
  const s = Object.assign({}, seed, { lang: o.lang, settings: { toursAuto: false, notify: true, theme: o.dark ? 'dark' : 'light' } });
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(s)) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: at('10:30') });
  await page.goto(PAGE + '#home', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 800);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 600); await page.evaluate(() => window.scrollTo(0, 0)); await settle(page, 200); };
/* what the first screen shows */
const measure = (page) => page.evaluate(() => {
  const vh = innerHeight; const out = [];
  const shown = (el) => { const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1 || r.bottom <= 0 || r.top >= vh) return false; for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; } return true; };
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) {
    const s = n.textContent.replace(/\s+/g, ' ').trim(); const el = n.parentElement; if (!s || !el || el.closest('script, style, [inert]')) continue;   /* text a screen reader skips (aria-hidden) still has to be read by eye */
    if (!shown(el)) continue; const cs = getComputedStyle(el); const cls = typeof el.className === 'string' ? el.className : '';
    out.push({ s: s.slice(0, 50), fs: parseFloat(cs.fontSize), fw: parseInt(cs.fontWeight, 10) || 400, el: el.tagName.toLowerCase() + (cls ? '.' + cls.split(' ').slice(0, 2).join('.') : ''), top: Math.round(el.getBoundingClientRect().top) });
  }
  const seen = {}; const small = out.filter((x) => x.fs < 13).filter((x) => { const k = x.el + '|' + x.fs; if (seen[k]) return false; seen[k] = 1; return true; });
  const big = out.slice().sort((a, b) => b.fs - a.fs || b.fw - a.fw).slice(0, 4);
  const top = big.length ? big[0].fs : 0; const rivals = out.filter((x) => x.fs >= Math.max(20, top * 0.85)).length;
  const anims = document.getAnimations().filter((a) => a.playState === 'running').map((a) => { const t = a.effect && a.effect.target; const c = t ? (typeof t.className === 'string' ? t.className : (t.className && t.className.baseVal) || t.tagName) : ''; const it = a.effect && a.effect.getTiming ? a.effect.getTiming().iterations : null; return String(c).slice(0, 40) + (it === Infinity ? ' (loops)' : ''); });
  return { small: small, big: big, rivals: rivals, anims: Array.from(new Set(anims)), screens: Math.round(document.documentElement.scrollHeight / vh * 10) / 10, lines: out.length };
});

const M = {};
const WOMEN = [['cycle', cycleW], ['plan', planW], ['preg', pregW], ['new', newW]];
for (const lang of ['en', 'hi']) for (const dark of [false, true]) {
  const dir = path.join(OUT, lang + '-' + (dark ? 'dark' : 'light')); fs.mkdirSync(dir, { recursive: true });
  const snap = async (page, name) => { await page.screenshot({ path: path.join(dir, name + '.png') }); M[lang + '-' + (dark ? 'dark' : 'light') + '/' + name] = await measure(page); };
  for (const [who, seed] of WOMEN) {
    const a = await open(seed, { lang: lang, dark: dark });
    await snap(a.page, '01-today-' + who);
    if (who === 'cycle') {
      await a.page.evaluate((d) => window.Saathi.openDay(d), TODAY); await settle(a.page, 600); await snap(a.page, '02-day-page');
      await a.page.evaluate(() => { const b = document.querySelector('#sheet-root .sheet-close, #sheet-root [data-close], #sheet-root .handle'); if (b) b.click(); }); await settle(a.page, 400);
      await go(a.page, 'diary'); await a.page.evaluate(() => { const b = document.querySelector('#view [data-tab="cal"]'); if (b) b.click(); }); await settle(a.page, 500); await snap(a.page, '03-calendar');
      await a.page.evaluate(() => { const b = document.querySelector('#view [data-tab="tr"]'); if (b) b.click(); }); await settle(a.page, 500); await a.page.evaluate(() => window.scrollTo(0, 0)); await snap(a.page, '04-cycles');
      await a.page.evaluate(() => { const b = document.querySelector('#view [data-tab="cal"]'); if (b) b.click(); }); await settle(a.page, 300);
      for (const [h, n] of [['report', '05-report'], ['a-cycle.what-is-a-menstrual-cycle', '06-article'], ['help', '07-help'], ['calm', '09-winddown'], ['your-sakhi', '10-your-sakhi'], ['care', '11-explore'], ['me', '12-me']]) { await go(a.page, h); await snap(a.page, n); }
    }
    if (who === 'plan') { await go(a.page, 'plan'); await snap(a.page, '08-plan'); }
    if (who === 'new') {
      await go(a.page, 'diary'); await a.page.evaluate(() => { const b = document.querySelector('#view [data-tab="cal"]'); if (b) b.click(); }); await settle(a.page, 500); await snap(a.page, '13-calendar-new');
      await a.page.evaluate(() => { const b = document.querySelector('#view [data-tab="tr"]'); if (b) b.click(); }); await settle(a.page, 500); await a.page.evaluate(() => window.scrollTo(0, 0)); await snap(a.page, '14-cycles-new');
      await a.page.evaluate(() => { const b = document.querySelector('#view [data-tab="cal"]'); if (b) b.click(); }); await settle(a.page, 300);
      await go(a.page, 'report'); await snap(a.page, '15-report-new');
    }
    if (a.errs.length) console.log(lang, dark ? 'dark' : 'light', who, 'page errors:', a.errs);
    await a.ctx.close();
  }
  console.log('done', lang, dark ? 'dark' : 'light');
}
fs.writeFileSync(path.join(OUT, 'measures.json'), JSON.stringify(M, null, 1));
await browser.close();
console.log('screens and measures in ' + OUT);
