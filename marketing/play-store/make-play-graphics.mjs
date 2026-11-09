// Google Play's graphics for Qura Sakhi (Mohit, 6 Nov 2026: "Make them"): the feature graphic (1024 x 500) and 8 phone screenshots
// (1080 x 1920, 9:16), each a caption above the app's screen. The screens come from the app's own sample women only (never anyone's
// real diary), on a fixed date, with the pilot APK's settings; nothing is sent anywhere. No doctor is named (Mohit, 6 Nov). The final
// images are 24-bit PNGs without an alpha channel, as Play asks.
// Usage: node marketing/play-store/make-play-graphics.mjs   (needs Pillow for images.py)
// Writes: marketing/play-store/feature-graphic.png, marketing/play-store/screenshots/en-*.png (and build/, the raw screens)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const web = path.resolve(here, '..', '..', 'web');
const { chromium } = await import(pathToFileURL(path.join(web, 'test', 'pw.mjs')).href);
const CONTENT = fs.readFileSync(path.join(web, 'content.json'), 'utf8');
const BUILD = path.join(here, 'build'); const OUT = path.join(here, 'screenshots');
fs.mkdirSync(BUILD, { recursive: true }); fs.mkdirSync(OUT, { recursive: true });
const FONTS = pathToFileURL(path.join(web, 'fonts', 'fonts.css')).href;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BRIDGE = 'window.SakhiAndroid = { schedule() { return 0; }, cancelAll() {}, canNotify() { return true; }, askNotify() {}, canExactAlarms() { return true; }, askExactAlarms() {}, testNotify() {}, speak() { return true; }, stop() {}, voices() { return "[]"; }, copy() { return true; }, haptic() {}, setSecure() {}, setDisguise() {}, isDisguised() { return false; }, saveState() { return true; }, loadState() { return ""; }, printPage() {} };';
const NOW = new Date('2026-11-06T10:00:00+05:30');

/* the 8 screenshots, in the order Play shows them (the first three matter most): tracking her cycle first, then the stages (Mohit,
   7 Nov: "Tacking cycles is first thing and one screenshot of stages instead of my plan screen"). Mohit, 7 Nov, before that: "Screenshots should cover major
   features, i.e. diary, different plans, diet guidance as per area, yoga exercise with 3d model screens, meditation and tools" */
const SHOTS = [
  { name: '01-diary', sample: 'asha', hash: 'diary', at: '#view .cal', up: 70, h: 'Track your periods', p: 'Your diary stays on your phone.',
    before: () => { const b = document.querySelector('#view #cal-prev'); if (b) b.click(); } },
  { name: '02-stages', sample: null, hash: 'home', at: '#view h1', up: -2, h: 'For every stage of your life', p: 'Periods, PCOS, a baby, pregnancy, after the birth and menopause.',
    clicks: ['#w-start', '[data-ob-dec="1990"]', '[data-ob-y="1994"]'],
    before: () => { document.querySelectorAll('#view .ob-parts, #view .ob-top .progress, #ob-back').forEach((e) => { e.style.visibility = 'hidden'; }); } },   /* the step labels scrolled under the top bar */   /* joining's "What's happening for you now?", from a fresh start */
  { name: '03-today', sample: 'priya', hash: 'home', at: '#view .today-plan-list', up: 165, h: 'Your day, in a few small steps', p: 'Tick each one off as you go.',
    before: () => { const S = window.Saathi; const d = S.state.mods && S.state.mods.tools; if (d) d.meds = [];   /* no medicine's name in a store picture */
      S.state.reminders = (S.state.reminders || []).filter((r) => !/smp-p1|metformin/i.test(JSON.stringify(r))); S.save(); S.render(); } },
  { name: '04-yoga', sample: 'priya', hash: 'plan-r-gentle', wait: 2600, h: 'Yoga you can follow', p: 'A 3D model shows every pose, with a timer for each one.',
    before: () => { const b = document.querySelector('#pl-pstart'); if (b) b.click(); for (let i = 0; i < 6; i++) { const n = document.querySelector('#pl-next'); if (n) n.click(); } } },   /* Trikonasana, the triangle */
  { name: '05-food', sample: 'priya', hash: 'plan-plate', at: '#view h2.pl-more', up: 12, h: 'Food from your part of India', p: 'Bajra roti in the North, ragi in the South, the way you eat.',
    before: () => { const b = document.querySelector('#pl-reg'); if (b) b.click(); } },   /* the six regions open, North India picked from her PIN code */
  { name: '06-pregnancy', sample: 'meera', hash: 'home', h: 'Your pregnancy, week by week', p: 'Check-ups, tablets and the signs that need a doctor.' },
  { name: '07-calm', sample: 'priya', hash: 'calm-nidra', h: 'Wind down at night', p: 'Slow breathing, yoga nidra and sleep sounds, in Hindi or English.' },
  { name: '08-tools', sample: 'asha', hash: 'care', h: 'Tools for your stage', p: 'What your diary shows, the check-ups that are due, and answers.',
    before: () => { const S = window.Saathi; if (S.state.mods) delete S.state.mods.contra; S.save(); S.render(); } }   /* her contraception stays out of a store picture */
];
const only = process.env.ONLY ? process.env.ONLY.split(',') : null;

const browser = await chromium.launch();
const errs = [];

/* the app's screen, 360 x 720 dp at 3x (1080 x 2160 px): tall enough for the 3D model at full size, the timer and the controls */
async function capture(s) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 720 }, deviceScaleFactor: 3, locale: s.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = { app: "' + (s.app || '0.39.81-pilot') + '", platform: "android", care: "care/" };');
  await ctx.addInitScript(BRIDGE);
  await ctx.route(/^https?:/, (r) => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errs.push(s.name + ': ' + String(e.message).slice(0, 160)));
  await page.clock.install({ time: NOW });
  await page.goto(pathToFileURL(path.join(web, 'index.html')).href + '#home', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi);
  await page.evaluate((o) => {
    const S = window.Saathi; S.loadSample(o.sample);
    S.state.settings.toursAuto = false; S.state.fullTour = { st: 'done', d: '2026-11-01' }; S.state.whatsNew = '9.99';
    S.state.prompts = Object.assign({}, S.state.prompts, { notifyIntro: '2026-11-01', setup: 'off', notifyAuto: '2026-11-01' });
    S.state.lang = o.lang || 'en'; S.state.langChosen = true; S.save(); location.hash = '#' + o.hash; S.render();
  }, { sample: s.sample, lang: s.lang, hash: s.hash });
  for (let i = 0; i < 14; i++) { await page.clock.runFor(100); await sleep(20); }
  for (const sel of s.clicks || []) { await page.evaluate((x) => { const e = document.querySelector(x); if (e) e.click(); }, sel); for (let i = 0; i < 5; i++) { await page.clock.runFor(100); await sleep(20); } }
  if (s.before) { await page.evaluate(s.before); for (let i = 0; i < Math.ceil((s.wait || 800) / 100); i++) { await page.clock.runFor(100); await sleep(20); } }
  await page.evaluate(() => { document.querySelectorAll('#tour-root, .toast').forEach((e) => { e.innerHTML = ''; }); window.scrollTo(0, 0); });
  if (s.at) { await page.evaluate(([sel, up]) => { const el = document.querySelector(sel); const head = document.querySelector('.topbar, #topbar'); const hb = head ? head.getBoundingClientRect().bottom : 0; if (el) window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + window.scrollY - hb - (up || 12))); }, [s.at, s.up]); }
  await sleep(250);
  const file = path.join(BUILD, 'raw-' + s.name + '.png');
  await page.screenshot({ path: file });
  await ctx.close();
  return file;
}

/* one page of HTML at its own size, photographed */
async function render(html, w, h, file) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const tmp = path.join(BUILD, path.basename(file, '.png') + '.html');
  fs.writeFileSync(tmp, html);
  await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready); await sleep(300);
  await page.screenshot({ path: file });
  await ctx.close();
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
/* Sakhi's own colours: her warm wash, the rose accent, deep brown ink; soft glows in the logo's petal colours */
const WASH = 'radial-gradient(900px 700px at 0% 0%, rgba(232,104,139,.20), transparent 62%), radial-gradient(900px 800px at 100% 18%, rgba(167,139,250,.18), transparent 60%), radial-gradient(1000px 800px at 50% 105%, rgba(243,214,189,.70), transparent 62%), #F7EFEA';

const shotHtml = (s, img) => `<!DOCTYPE html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${FONTS}"><style>
html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; }
body { background: ${WASH}; color: #4A2424; }
.cap { position: absolute; left: 96px; right: 96px; top: 104px; }
h1 { margin: 0; font: 700 86px/1.06 'Cormorant Garamond', Georgia, serif; letter-spacing: -0.5px; text-wrap: balance; }
p { margin: 22px 0 0; font: 400 40px/1.32 'DM Sans', system-ui, sans-serif; color: #6D5C55; text-wrap: balance; }
.phone { position: absolute; left: 50%; transform: translateX(-50%); top: 470px; padding: 16px; border-radius: 70px; background: #2A1A1F; box-shadow: 0 36px 90px rgba(74, 36, 36, .26); }
.phone img { display: block; width: 700px; border-radius: 52px; }
</style></head><body><div class="cap"><h1>${esc(s.h)}</h1><p>${esc(s.p)}</p></div><div class="phone"><img src="${pathToFileURL(img).href}"></div></body></html>`;

const featureHtml = (mark) => `<!DOCTYPE html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${FONTS}"><style>
html, body { margin: 0; width: 1024px; height: 500px; overflow: hidden; }
body { background: radial-gradient(520px 420px at 0% 0%, rgba(232,72,180,.16), transparent 70%), radial-gradient(520px 420px at 100% 100%, rgba(99,102,241,.14), transparent 70%), radial-gradient(480px 380px at 100% 0%, rgba(240,128,110,.14), transparent 70%), radial-gradient(480px 380px at 0% 100%, rgba(52,211,153,.14), transparent 70%), #FFF9F6; color: #4A2424; }
.mark { position: absolute; left: 74px; top: 50%; transform: translateY(-50%); width: 352px; height: 352px; }
.t { position: absolute; left: 474px; right: 56px; top: 50%; transform: translateY(-50%); }
.qura { font: 700 26px 'DM Sans', system-ui, sans-serif; letter-spacing: .32em; color: #6D5C55; }
.name { font: 700 132px/0.95 'Cormorant Garamond', Georgia, serif; color: #C2345B; margin-top: 4px; }
.tag { font: 500 32px/1.3 'DM Sans', system-ui, sans-serif; margin-top: 20px; text-wrap: balance; }
.small { font: 400 24px/1.35 'DM Sans', system-ui, sans-serif; color: #6D5C55; margin-top: 14px; }
</style></head><body><img class="mark" src="${pathToFileURL(mark).href}"><div class="t"><div class="qura">QURA</div><div class="name">Sakhi</div>
<div class="tag">Your periods and your health plan, in Hindi and English.</div><div class="small">Free. Your diary stays on your phone.</div></div></body></html>`;

const finals = [];
const mark = path.join(BUILD, 'mark.png');
execFileSync('python3', [path.join(here, 'images.py'), 'mark', mark], { stdio: 'inherit' });
if (!only || only.indexOf('feature') >= 0) { const f = path.join(here, 'feature-graphic.png'); await render(featureHtml(mark), 1024, 500, f); finals.push(f); }
for (const s of SHOTS) {
  if (only && only.indexOf(s.name) < 0) continue;
  const raw = await capture(s);
  const f = path.join(OUT, 'en-' + s.name + '.png');
  await render(shotHtml(s, raw), 1080, 1920, f); finals.push(f);
}
await browser.close();
if (finals.length) execFileSync('python3', [path.join(here, 'images.py'), 'finish'].concat(finals), { stdio: 'inherit' });
console.log(JSON.stringify({ images: finals.length, pageErrors: errs }));
