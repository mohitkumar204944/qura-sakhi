// Version 39.50, the glass look: a walk, not pass/fail. One woman on her PMOS plan's day 29 through the main screens at 360 x 800
// (the Flip5), light and dark, and a first-time visitor's welcome. Screens go to test/shots/glass-walk/<name>/.
// Usage: node test/glass-walk.mjs [dir] [name]   (dir defaults to this app folder; name to "now")
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const OUT = path.join(here, 'shots', 'glass-walk', process.argv[3] || 'now'); fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-11-26';   /* a Thursday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm) => new Date(TODAY + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, testNotify(){}, maker(){ return "google"; }, share(){ return true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Priya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.50-pilot', platform: 'android' };
/* three periods 42 days apart, the last 22 days ago */
const events = [64, 106, 22].sort((a, b) => b - a).flatMap((x) => [{ d: ago(x), t: 'start', pain: 'pain_1' }, { d: ago(x - 4), t: 'end' }]);
const log = {}; for (let i = 28; i >= 1; i--) if ((28 - i) % 7 < 4) log[ago(i)] = { min: 15, ci: 1, ck: { move: 'd', food: 'd', yoga: 'd', sleep: 'd' } };
const plan = { pack: 'cycle', goalKey: 'pmos', start: ago(28), started: ago(28), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '22:00', when: 'dinner', bed: 'b23', work: 'day', log: log, weeks: { 1: { e: 'good', seen: true }, 2: { e: 'good', seen: true }, 3: { e: 'good', seen: true }, 4: { e: 'good', seen: true } }, body: [], doc: 'done' };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1998-04-01', consent: { c1: ago(300), c2: null, c4: null }, situation: { pcos: true }, intake: { goal: 'pmos' }, events: events, daily: { [ago(2)]: ['d_tired'], [ago(9)]: ['d_cramps', 'd_bloat'] }, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(60), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30) }, mods: { plan: plan }, reminders: [] }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 2, locale: 'en-IN', timezoneId: 'Asia/Kolkata', colorScheme: o.dark ? 'dark' : 'light' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript(ANDROID);
  if (o.seed !== false) await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('page error:', String(e.message).slice(0, 200)));
  await page.clock.install({ time: at(o.hm || '09:30') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 800);
  return { ctx, page };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 600); await page.evaluate(() => window.scrollTo(0, 0)); await settle(page, 200); };
const shot = (page, name) => page.screenshot({ path: path.join(OUT, name + '.png') });

for (const dark of [false, true]) {
  const sfx = dark ? '-dark' : '';
  const a = await open({ dark: dark, seed: dark ? { settings: { theme: 'dark' } } : undefined });
  await shot(a.page, '01-today' + sfx);
  await a.page.evaluate(() => window.scrollTo(0, 700)); await settle(a.page, 300); await shot(a.page, '02-today-scrolled' + sfx);
  for (const [h, n] of [['plan', '03-myplan'], ['diary', '04-diary'], ['care', '05-explore'], ['learn', '06-learn'], ['help', '07-help'], ['me', '08-me']]) { await go(a.page, h); await shot(a.page, n + sfx); }
  await go(a.page, 'home');
  const day = await a.page.$('#view .wkstrip .wd:not(.today)');
  if (day) { await day.click(); await settle(a.page, 600); await shot(a.page, '09-day-sheet' + sfx); }
  await a.ctx.close();
  const c = await open({ dark: dark, hm: '22:10', hash: '#plan-checkin', seed: dark ? { settings: { theme: 'dark' } } : undefined });
  await shot(c.page, '10-checkin' + sfx); await c.ctx.close();
}
const w = await open({ seed: false, hash: '#home' });
await shot(w.page, '11-welcome'); await w.ctx.close();
/* the screens the route survey (test/glass-survey.mjs) pointed at, and the ones with their own look */
const m = await open({});
for (const [h, n] of [['access-symptoms', '12-help-bodypart'], ['contra', '13-contra'], ['plan-r-cycle', '14-player'], ['calm', '15-winddown'], ['learn', '16-learn'], ['relief-cramps', '17-relief'], ['report', '18-report'], ['plan-moves', '19-moves']]) { await go(m.page, h); await shot(m.page, n); }
await go(m.page, 'a-pmos.signs-to-notice'); await shot(m.page, '20-learn-page');
/* the player while a routine runs (its Previous, Pause and Next strip), and the intimate check scrolled under its question */
await go(m.page, 'plan-r-cycle');
if (await m.page.$('#pl-pstart')) { await m.page.$eval('#pl-pstart', (b) => b.click()); await settle(m.page, 800); await shot(m.page, '21-player-running'); }
await go(m.page, 'intimate-check');
await m.page.evaluate(() => { const b = document.querySelector('#view .chip, #view .btn:not(.primary)'); if (b) b.click(); }); await settle(m.page, 500);
await m.page.evaluate(() => window.scrollTo(0, 260)); await settle(m.page, 300); await shot(m.page, '22-intimate-check');
await m.ctx.close();
await browser.close();
console.log('GLASS WALK: screens in ' + OUT);
