// Her first 3 months on video (Mohit, 27 Oct: "Can you mimic user journey in a screen record from start to 3 months so we know
// how app works end to end for every patient"). One woman per joining stage opens Sakhi on a phone-size screen and lives 90
// days, fast-forwarded: joining and sign-up, "Your Sakhi" and the tour, her first log, her plan (its questions, its cards,
// Start), ticks and the evening check-in, Wind down, her periods, Diary and What it shows, her stage's own pages, the month
// look-back and monthly check-in, Explore, the end of 12 weeks, her report for the doctor and Me. Every filmed tap shows a
// pink ring. Between filmed days a labelled overlay fast-forwards, while she ticks most of her steps with Today's own buttons
// and logs her periods' ends. ffmpeg adds a caption band (who, which day, what she does) and writes one MP4 per woman.
// Not pass/fail: what each scene hit is in test/shots/journeys/<stage>.json.
// Usage: node test/journey-video.mjs [cycle pmos ttc preg post mid meno] [--encode]   (videos to test/shots/journeys/; --encode
// only re-captions the last recordings)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const OUT = path.join(here, 'shots', 'journeys'); const RAW = path.join(OUT, 'raw'); fs.mkdirSync(RAW, { recursive: true });
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const FONT = '/System/Library/Fonts/Supplemental/Arial.ttf';
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, setDisguise(){}, isDisguised(){ return false; }, keepAwake(){}, saveState(){ return true; }, loadState(){ return ""; } };';
/* a pink ring where she taps, and the fast-forward card (CSS animations run on the page's own timeline) */
const PROPS = `(() => { const css = '.jv-tap{position:fixed;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:23px;background:rgba(196,47,92,.30);border:3px solid rgba(196,47,92,.9);pointer-events:none;z-index:2147483646;animation:jvtap .55s ease-out forwards}@keyframes jvtap{0%{transform:scale(.45);opacity:1}100%{transform:scale(1.5);opacity:0}}' +
  '#jv-ff{position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:rgba(47,34,51,.88);color:#fff;font:600 20px/1.35 system-ui,sans-serif;text-align:center;padding:0 36px}#jv-ff b{font-size:38px;color:#F6C9D6}#jv-ff small{font-size:16px;font-weight:500;opacity:.9}';
  const add = () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); };
  if (document.head) add(); else document.addEventListener('DOMContentLoaded', add);
  window.addEventListener('hashchange', () => document.querySelectorAll('.jv-tap').forEach((e) => e.remove()));   /* a ring never lingers on the next screen */
  window.__jvTap = (x, y) => { document.querySelectorAll('.jv-tap').forEach((e) => e.remove()); const d = document.createElement('div'); d.className = 'jv-tap'; d.style.left = x + 'px'; d.style.top = y + 'px'; document.body.appendChild(d); };
  window.__jvFF = (on, a, b, c) => { let o = document.getElementById('jv-ff'); if (!on) { if (o) o.remove(); return; } if (!o) { o = document.createElement('div'); o.id = 'jv-ff'; document.body.appendChild(o); } o.innerHTML = '<span>Fast-forward</span><b>' + a + '</b><span>' + b + '</span><small>' + c + '</small>'; };
})();`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const D0 = '2026-10-26';   /* she joins on a Monday morning */
const at = (day, hm) => new Date(new Date(D0 + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const iso = (day) => { const d = new Date(D0 + 'T12:00:00+05:30'); d.setDate(d.getDate() + day); return d.toISOString().slice(0, 10); };
const when = (day, hm) => at(day, hm).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/* the 7 women, one per joining stage: her answers, her dates, and the days her periods start while we watch */
const WOMEN = {
  cycle: { name: 'Priya', age: 28, y: 1998, label: 'Regular periods · period pain', goals: ['pain'], dates: [-82, -54, -26], dlen: 5, pain: true, periods: [2, 30, 58, 86] },
  pmos: { name: 'Asha', age: 26, y: 2000, label: 'PMOS / irregular periods', goals: ['irregular'], dates: [-80, -39, -1], dlen: 6, dx: 'ns', periods: [39, 82] },
  ttc: { name: 'Neha', age: 29, y: 1997, label: 'Trying for a baby', goals: ['ready'], dates: [-186, -157, -128, -99, -70, -41, -12], dlen: 5, periods: [17, 46, 75] },
  preg: { name: 'Kavya', age: 27, y: 1999, label: 'Pregnant (10 weeks at joining)', goals: ['food'], lmp: -70, periods: [] },
  post: { name: 'Sunita', age: 30, y: 1996, label: 'Had a baby 2 weeks ago', goals: ['recovery'], birth: -14, periods: [] },
  mid: { name: 'Rekha', age: 46, y: 1980, label: 'Periods changing after 40', goals: ['hot'], dates: [-110, -48], dlen: 6, periods: [20, 81] },
  meno: { name: 'Lata', age: 54, y: 1972, label: 'Menopause', goals: ['bones'], mp: '2', periods: [] }
};
const wantList = process.argv.slice(2).filter((k) => WOMEN[k]); const KEYS = wantList.length ? wantList : Object.keys(WOMEN);

const browser = await chromium.launch();

async function journey(key) {
  const W = WOMEN[key]; const dir = path.join(RAW, key); fs.rmSync(dir, { recursive: true, force: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, locale: 'en-IN', timezoneId: 'Asia/Kolkata', recordVideo: { dir: dir, size: { width: 390, height: 844 } } });   /* Playwright records at the screen's own size */
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ app: '0.39.26-pilot', platform: 'android' }) + ';');
  await ctx.addInitScript(ANDROID);
  await ctx.addInitScript(PROPS);
  await ctx.route(/^https?:/, (r) => (/fonts\.(googleapis|gstatic)\.com/.test(r.request().url()) ? r.continue() : r.abort()));
  const page = await ctx.newPage(); const t0 = Date.now();
  const caps = []; const log = []; const errs = []; let day = 0; let hm = '09:00';
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  const head = () => W.name + ', ' + W.age + ' · ' + W.label;
  const sub = () => 'Day ' + (day + 1) + ' · week ' + (Math.floor(day / 7) + 1) + ' · ' + when(day, hm);
  const cap = (text) => { caps.push({ t: (Date.now() - t0) / 1000, a: head(), b: sub(), c: text }); };
  /* real time and the app's clock move together, so toasts and moving pictures look as they do on a phone */
  const beat = async (ms) => { for (let i = 0; i < Math.max(1, Math.round(ms / 100)); i++) { await page.clock.runFor(100); await sleep(100); } };
  const has = (sel) => page.$(sel).then((x) => !!x).catch(() => false);
  const route = (r) => page.evaluate((x) => !!(window.Saathi && window.Saathi.routeOwner && window.Saathi.routeOwner(x)), r).catch(() => false);
  async function tap(sel, after) {
    const el = await page.waitForSelector(sel, { timeout: 6000, state: 'attached' });
    /* Version 39.27 (minimalism audit R06): a woman can't tap what sits inside a closed fold, so the film can't either */
    if (await el.evaluate((e) => { const d = e.closest('details'); return !!(d && !d.open && !e.closest('summary')); })) throw new Error('tap inside a closed fold: ' + sel);
    await el.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'smooth' })); await beat(450);
    const b = await el.evaluate((e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await page.evaluate((q) => window.__jvTap && window.__jvTap(q.x, q.y), b); await beat(300);
    await el.evaluate((e) => e.click()); await beat(after == null ? 900 : after);
  }
  const tapIf = async (sel, after) => { if (await has(sel)) { await tap(sel, after); return true; } return false; };
  async function type(sel, text) { await tap(sel, 200); for (const ch of text) { await page.evaluate((q) => { const e = document.querySelector(q.s); e.value += q.c; e.dispatchEvent(new Event('input', { bubbles: true })); }, { s: sel, c: ch }); await sleep(85); } await beat(300); }
  const setVal = (sel, v) => page.evaluate((q) => { const e = document.querySelector(q.s); e.value = q.v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, { s: sel, v: v });
  async function go(h) { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; window.scrollTo(0, 0); }, h); await beat(1100); }
  /* scroll through a long screen as she would read it, then back to the top */
  async function read(screens) {
    const h = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    for (let i = 1; i <= screens && i * 430 - 430 < h; i++) { await page.evaluate((v) => window.scrollTo({ top: v, behavior: 'smooth' }), Math.min(i * 430, h)); await beat(1500); }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' })); await beat(700);
  }
  /* a badge, a tip or a sheet in her way: she reads it, then taps its button */
  async function clear(fast) {
    for (let k = 0; k < 8; k++) {
      const sel = await page.evaluate(() => { for (const s of ['#joy-root [role="dialog"] button', '#tour-root #tour-next', '#tour-root #tour-done', '#tour-root #tour-later', '#tour-root button']) if (document.querySelector(s)) return s; return ''; });
      if (!sel) break;
      if (fast) { await page.$eval(sel, (e) => e.click()).catch(() => {}); await page.clock.runFor(300); } else { await beat(900); await tap(sel, 700); }
    }
  }
  const sheetOpen = () => page.evaluate(() => !!document.querySelector('#sheet-root .sheet'));
  async function scene(text, fn) { cap(text); const s0 = { day: day + 1, text: text }; try { await fn(); s0.ok = true; } catch (e) { s0.ok = false; s0.err = String(e.message).slice(0, 160); } s0.at = await page.evaluate(() => location.hash).catch(() => ''); log.push(s0); }
  let ffHeld = false;   /* the fast-forward card stays up until the next filmed screen is ready */
  async function jump(d, time, h) { day = d; hm = time; await page.clock.setSystemTime(at(d, time)); await go(h || 'home'); await clear(); if (ffHeld) { await page.evaluate(() => window.__jvFF(false)); ffHeld = false; await beat(300); } }
  /* the days we don't film: she ticks most of her steps with Today's own buttons and logs her periods' ends */
  async function ff(from, to, note) {
    if (to < from) return;
    cap('Fast-forward: days ' + (from + 1) + ' to ' + (to + 1));
    for (let d = from; d <= to; d++) {
      await page.evaluate((q) => window.__jvFF(true, q.a, q.b, q.c), { a: 'Day ' + (d + 1), b: note || 'She ticks most of her steps each day', c: when(d, '20:00') });
      day = d; hm = '20:00'; await page.clock.setSystemTime(at(d, '20:00'));
      await page.evaluate(() => { if (location.hash !== '#home') location.hash = 'home'; else window.Saathi.render(); }); await page.clock.runFor(400); await sleep(60);
      await clear(true);
      const ends = (W.periods || []).concat((W.dates || []).length ? [W.dates[W.dates.length - 1]] : []).map((p) => p + (W.dlen || 5) - 1);
      if (ends.indexOf(d) >= 0 && await has('#view [data-log="end"]')) { await page.$eval('#view [data-log="end"]', (b) => b.click()); await page.clock.runFor(300); if (await has('#log-save')) { await page.$eval('#log-save', (b) => b.click()); await page.clock.runFor(400); } }
      if (d % 7 !== 3 && d % 7 !== 6) for (let k = 0; k < 4; k++) { const ok = await page.$eval('#view .today-card [data-today-act]', (b) => { b.click(); return true; }).catch(() => false); if (!ok) break; await page.clock.runFor(250); await clear(true); }
      if (await sheetOpen()) { await page.evaluate(() => { const b = document.querySelector('#sheet-root .sheet-foot .linkbtn, #sheet-root [id$="-cancel"], #sheet-root .sheet-foot .btn'); if (b) b.click(); }); await page.clock.runFor(300); }
      await sleep(170);
    }
    ffHeld = true;
  }
  /* ---------- day 1, morning: joining ---------- */
  await page.clock.install({ time: at(0, '09:00') });
  await scene('She opens Sakhi for the first time', async () => { await page.goto(PAGE + '#home', { waitUntil: 'domcontentloaded' }); await page.waitForFunction(() => !!window.Saathi); await beat(1800); });
  await scene('She picks her language', async () => { await tap('[data-ob-lang="en"]'); await beat(600); await read(1); await tap('#w-start'); });
  await scene('About her: her name and year of birth', async () => { await type('#ob-name', W.name); await tap('[data-ob-dec="' + (Math.floor(W.y / 10) * 10) + '"]'); await tap('[data-ob-y="' + W.y + '"]'); });
  await scene('Her stage', async () => { await beat(800); await tap('[data-ob-st="' + key + '"]'); });
  await scene('What she wants help with', async () => { for (const g of W.goals) await tap('[data-ob-goal="' + g + '"]'); await tap('#ob-next'); });
  if (key === 'preg') await scene('Her pregnancy: the first day of her last period', async () => { await tap('[data-ob-pq="lmp"]'); await setVal('#ob-lmp', iso(W.lmp)); await beat(900); await tap('#ob-next'); });
  else if (key === 'post') await scene('When her baby was born, and breastfeeding', async () => { await setVal('#ob-birth', iso(W.birth)); await beat(700); await tap('[data-ob-bf="yes"]'); await tap('#ob-next'); });
  else if (key === 'meno') await scene('When her last period was', async () => { await beat(900); await tap('[data-ob-mp="' + W.mp + '"]'); });
  else await scene('Her last periods: she taps the day each one started', async () => {
    await beat(900);
    for (const n of W.dates) {
      const d = iso(n);
      for (let i = 0; i < 26 && !(await has('[data-jd-day="' + d + '"]')); i++) { const first = await page.$eval('[data-jd-day]', (b) => b.dataset.jdDay); await tap(d < first ? '#jd-prev' : '#jd-next', 450); }
      await tap('[data-jd-day="' + d + '"]', 700);
    }
    for (let i = 5; i < (W.dlen || 5); i++) await tap('#jd-plus', 500);
    if (W.pain) await tap('[data-jd-tick="pain"]', 700);
    if (W.heavy) await tap('[data-jd-tick="heavy"]', 700);
    if (W.dx) await tap('[data-ob-dx="' + W.dx + '"]', 700);
    await beat(800); await tap('#ob-next');
  });
  await scene('Where she goes for check-ups: a private gynaecologist', async () => { await beat(700); await tap('[data-ob-care="' + (W.care || 'private') + '"]', 1200); });   /* Version 39.28 */
  await scene('Who uses this phone: only her', async () => { await beat(700); await tap('[data-ob-sh="me"]', 1200); });
  await scene('She signs up with her mobile number and the code she gets', async () => {
    await page.waitForSelector('#su-num', { timeout: 8000 }); await type('#su-num', '9876543210'); await tap('#su-send', 1500);
    await page.waitForSelector('#su-code', { timeout: 8000 }); await type('#su-code', '123456'); await beat(1500);
    if (await has('#su-done')) { await type('#su-pin', '302001'); await tap('#su-done', 1500); }
  });
  await scene('"Your Sakhi": what her dates show, and how Sakhi helps', async () => { await beat(1200); await read(5); });
  await scene('The 30-second tour of Today', async () => { if (await tapIf('#ys-tour', 1200)) { for (let k = 0; k < 8 && (await has('#tour-root button')); k++) { await beat(1600); await tap(await page.evaluate(() => (document.querySelector('#tour-root #tour-next') ? '#tour-root #tour-next' : (document.querySelector('#tour-root #tour-done') ? '#tour-root #tour-done' : '#tour-root button'))), 700); } } else await tapIf('#ys-skip'); });
  await scene('Today, her first morning', async () => { await go('home'); await clear(); await read(2); });
  await scene('Diary: her first log, how she feels today', async () => {
    await go('diary'); await clear();
    if (await has('#fl-card')) { await beat(1000); if (!(await tapIf('[data-fl-sign="d_tired"]', 700))) await tapIf('[data-fl-sign]', 700); if (!(await tapIf('#fl-save', 1400))) await tapIf('[data-fl-go]', 1400); }
    await clear(); await read(1);
  });
  await scene('Today offers her plan; she answers its questions', async () => {
    await go('home'); await clear(); await beat(800);
    if (!(await tapIf('#pl-off-go', 1200)) && !(await tapIf('#view .xp-pair [data-xp-off]', 1200))) return;   /* Version 39.27: inside the doctor finding's card when one shows */
    for (let i = 0; i < 12; i++) {
      if ((await page.evaluate(() => location.hash)) === '#plan-reveal') break;
      if (await tapIf('#pl-in-make', 1200)) continue;
      if (await has('[data-pl-when]')) { await tap('[data-pl-when="dinner"]', 700); continue; }
      const groups = await page.$$eval('[data-pl-q],[data-pl-m]', (bs) => [...new Set(bs.map((b) => (b.dataset.plQ || b.dataset.plM).replace(/:.*/, '') + '|' + (b.dataset.plQ ? 'q' : 'm')))]);
      for (const g of groups) { const [k, kind] = g.split('|'); if (await has('[data-pl-' + kind + '^="' + k + ':"].on')) continue; await tap('[data-pl-' + kind + '^="' + k + ':"]', 600); }
      if (!(await tapIf('#pl-in-next', 1000))) await tapIf('#pl-in-skip', 1000);
    }
  });
  await scene('Her plan, card by card, then "Start my plan"', async () => {
    for (let k = 0; k < 10 && (await has('#pl-rv-next')) && !(await has('#pl-rv-go')); k++) { await beat(1300); await tap('#pl-rv-next', 600); }
    if (await has('#pl-rv-go')) { await beat(1200); await tap('#pl-rv-go', 1600); }
    await clear(); if (await sheetOpen()) { await beat(1500); await tapIf('#sheet-root .sheet-foot .btn.primary', 1000); }
  });
  await scene('Today with her plan: her steps, each with why it helps', async () => { await go('home'); await clear(); await read(2); });
  if (key === 'post') await scene('Her recovery today', async () => { if (await route('post-recovery')) { await go('post-recovery'); await clear(); await read(2); } });
  if (key === 'preg') await scene('This week of her pregnancy', async () => { if (await route('preg-week')) { await go('preg-week'); await clear(); await read(3); } });
  if (key !== 'preg' && key !== 'post' && key !== 'meno' && W.periods[0] !== 2) await scene('Cycles: what her dates already tell her', async () => { await page.evaluate(() => { window.Saathi.mem.diaryTab = 'tr'; }); await go('diary'); await clear(); await read(3); });

  /* ---------- day 1, evening ---------- */
  await jump(0, '20:30');
  await scene('Evening: she ticks what she did today', async () => { for (let k = 0; k < 2; k++) await tapIf('#view .today-card [data-today-act]', 1100); await clear(); await read(1); });
  await scene('Her 1-minute evening check-in', async () => {
    if (!(await route('plan-checkin'))) return;
    await go('plan-checkin'); await clear(); await beat(800);
    const groups = await page.$$eval('[data-ci]', (b) => [...new Set(b.map((x) => x.dataset.ci.split(':')[0]))]);
    for (const g of groups.slice(0, 6)) await tapIf('[data-ci^="' + g + ':"]', 500);
    await tapIf('#pl-ci-save', 1600); await clear(); await read(1);
  });

  /* ---------- the weeks: every filmed stop in day order; the days between are fast-forwarded ---------- */
  const stops = []; const stop = (d, time, fn) => stops.push({ d: d, time: time, fn: fn });
  const cycles = (text) => scene(text, async () => { await page.evaluate(() => { window.Saathi.mem.diaryTab = 'tr'; }); await go('diary'); await clear(); await read(4); });
  stop(1, '08:30', async () => { await scene('Next morning: Today looks back at yesterday', async () => { await read(2); }); });
  stop(3, '22:00', async () => { await scene('Bedtime: Wind down with Dr. Megha', async () => { if (await route('calm')) { await go('calm'); await clear(); await read(2); } }); });
  if (key === 'post') stop(5, '14:00', async () => { await scene('Feeding her baby: help when she needs it', async () => { if (await route('post-feed')) { await go('post-feed'); await clear(); await read(2); } }); });
  stop(7, '09:00', async () => {
    await scene('Week 2 begins', async () => { await read(1); });
    await scene('My plan: how her first week went', async () => { await go('plan'); await clear(); await read(4); });
  });
  if (key === 'preg') stop(10, '11:00', async () => { await scene('Her check-ups, and what each one needs', async () => { if (await route('preg-plan')) { await go('preg-plan'); await clear(); await read(3); } }); });
  if (key === 'mid' || key === 'meno') stop(10, '21:00', async () => { await scene('Her hot flush week', async () => { if (await route('meno-diary')) { await go('meno-diary'); await clear(); await read(2); } }); });
  stop(14, '19:00', async () => {
    await scene('Diary: her calendar', async () => { await page.evaluate(() => { window.Saathi.mem.diaryTab = 'cal'; window.Saathi.mem.calMonth = null; }); await go('diary'); await clear(); await read(2); });
    await cycles('Cycles: what Sakhi can tell her, her cycles, and what her diary shows');
    if (await route('explain')) await scene('What her diary shows: a Qura doctor first, and a free plan beside it', async () => { await go('explain'); await clear(); await read(3); });
  });
  if (key === 'post') stop(21, '11:00', async () => { await scene('Her check-ups after the birth', async () => { if (await route('post-checks')) { await go('post-checks'); await clear(); await read(2); } }); });
  stop(28, '09:00', async () => {
    await scene('Month 1 done: her look-back', async () => { await clear(); if (await tapIf('#pl-m-go', 1300)) { await clear(); await read(3); await go('home'); } else await read(2); });
    await scene('"This month": her monthly check-in', async () => { await go('checkin'); await clear(); await beat(800); await tapIf('[data-chip]', 700); await tapIf('#ci-save', 1500); await clear(); });
  });
  stop(35, '13:00', async () => { await scene('Explore: guides and tools for her stage', async () => { await go('care'); await clear(); await read(3); }); });
  if (key === 'preg') stop(42, '10:00', async () => { await scene('Week 16 of her pregnancy', async () => { if (await route('preg-week')) { await go('preg-week'); await clear(); await read(2); } }); });
  if (key === 'meno' || key === 'mid') stop(42, '10:00', async () => { await scene('Strong bones and muscles', async () => { if (await route('meno-bones')) { await go('meno-bones'); await clear(); await read(2); } }); });
  stop(60, '09:00', async () => {
    await scene('Month 2: Today', async () => { await read(1); });
    await scene('My plan in month 2', async () => { await go('plan'); await clear(); await read(3); });
    if (W.periods.length) await cycles('Cycles after 2 months');
  });
  stop(84, '09:00', async () => {
    await scene(key === 'preg' ? 'Day 85: 22 weeks pregnant' : 'Week 12: her plan’s 12 weeks are done', async () => { await clear(); await read(2); });
    await scene(key === 'preg' ? 'My plan: what she has done so far' : 'Her results, honestly', async () => { await go('plan'); await clear(); await read(5); });
  });
  stop(89, '10:00', async () => {
    await scene('3 months in: Today', async () => { await read(2); });
    await scene('Her report for the doctor', async () => { await go('report'); await clear(); await read(3); });
    await scene('Me: her details, reminders and privacy', async () => { await go('me'); await clear(); await read(2); });
    await scene('3 months with Sakhi', async () => { await go('home'); await beat(2500); });
  });
  for (const p of W.periods) if (p >= 1 && p <= 89) stop(p, '08:15', () => scene('Her period starts: she taps "Period started"', async () => {
    await tap('#view [data-log="start"]', 900);
    if (await has('#log-save')) { await beat(900); await tap('#log-save', 1200); }
    await clear(); await beat(800); await read(1);
  }));
  stops.sort((x, y) => x.d - y.d || (x.time < y.time ? -1 : 1));
  let last = 0;
  for (const st of stops) {
    try { if (st.d > last + 1) await ff(last + 1, st.d - 1); await jump(st.d, st.time); await st.fn(); } catch (e) { log.push({ day: st.d + 1, text: 'stop', ok: false, err: String(e.message).slice(0, 160) }); }
    last = Math.max(last, st.d);
  }

  const dur = (Date.now() - t0) / 1000;
  await ctx.close();
  const raw = path.join(OUT, key + '.webm'); await page.video().saveAs(raw);
  fs.writeFileSync(path.join(OUT, key + '.json'), JSON.stringify({ woman: head(), seconds: Math.round(dur), errors: errs, scenes: log, captions: caps }, null, 1));
  return { key, raw, caps, dur, log, errs };
}

/* the caption band above the screen: who she is, which day, and what she does. Each caption is drawn as a picture (this Mac's
   ffmpeg has no text filter) and laid over the video for its scene. */
async function encode(key) {
  const J = JSON.parse(fs.readFileSync(path.join(OUT, key + '.json'), 'utf8')); const raw = path.join(OUT, key + '.webm');
  const W0 = 540, H0 = 1168, BAND = 166;   /* the phone's 390 x 844, scaled to 540 wide */ const cdir = path.join(RAW, key + '-cap'); fs.rmSync(cdir, { recursive: true, force: true }); fs.mkdirSync(cdir, { recursive: true });
  const pg = await browser.newPage({ viewport: { width: W0, height: BAND }, deviceScaleFactor: 1 });
  const e = (x) => String(x).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  for (let i = 0; i < J.captions.length; i++) {
    const c = J.captions[i];
    await pg.setContent('<body style="margin:0"><div style="width:' + W0 + 'px;height:' + BAND + 'px;box-sizing:border-box;padding:14px 20px;background:#2F2233;color:#fff;font-family:-apple-system,Helvetica Neue,Arial,sans-serif;display:flex;flex-direction:column;gap:3px">' +
      '<div style="font-size:18px;font-weight:600;color:#F6C9D6">' + e(c.a) + '</div><div style="font-size:16px;color:#D8CFE0">' + e(c.b) + '</div>' +
      '<div style="font-size:25px;font-weight:700;line-height:1.22;margin-top:6px">' + e(c.c) + '</div></div></body>');
    await pg.screenshot({ path: path.join(cdir, String(i).padStart(3, '0') + '.png') });
  }
  await pg.close();
  const ins = []; const parts = ['[0:v]fps=25,scale=' + W0 + ':' + H0 + ':flags=lanczos,pad=' + W0 + ':' + (H0 + BAND) + ':0:' + BAND + ':color=0x2F2233[b0]'];
  J.captions.forEach((c, i) => {
    const t1 = i + 1 < J.captions.length ? J.captions[i + 1].t : J.seconds + 5;
    ins.push('-i', path.join(cdir, String(i).padStart(3, '0') + '.png'));
    parts.push('[b' + i + '][' + (i + 1) + ":v]overlay=0:0:enable='between(t," + c.t.toFixed(2) + ',' + t1.toFixed(2) + ")'[b" + (i + 1) + ']');
  });
  parts.push('[b' + J.captions.length + ']null[out]');
  const sf = path.join(cdir, 'filter.txt'); fs.writeFileSync(sf, parts.join(';\n'));
  const mp4 = path.join(OUT, key + '.mp4');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw].concat(ins, ['-filter_complex_script', sf, '-map', '[out]', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4]));
  return mp4;
}

const ENC = process.argv.includes('--encode');
const results = [];
if (!ENC) for (let i = 0; i < KEYS.length; i += 4) {
  const batch = await Promise.all(KEYS.slice(i, i + 4).map((k) => journey(k).catch((e) => ({ key: k, fail: String(e.stack || e).slice(0, 400) }))));
  results.push(...batch);
}
for (const k of KEYS) {
  const r = results.find((x) => x.key === k) || {};
  if (r.fail) { console.log('FAILED', k, r.fail); continue; }
  if (!fs.existsSync(path.join(OUT, k + '.json'))) { console.log('no recording for', k); continue; }
  const J = JSON.parse(fs.readFileSync(path.join(OUT, k + '.json'), 'utf8')); const mp4 = await encode(k); const bad = J.scenes.filter((x) => !x.ok);
  console.log(k + ': ' + J.seconds + ' s, ' + J.scenes.length + ' scenes, ' + bad.length + ' missed, ' + J.errors.length + ' page errors → ' + path.relative(process.cwd(), mp4) + ' (' + (fs.statSync(mp4).size / 1048576).toFixed(1) + ' MB)');
  for (const x of bad) console.log('   missed: day ' + x.day + ' · ' + x.text + ' · ' + x.err);
  for (const x of J.errors.slice(0, 5)) console.log('   page error: ' + x);
}
await browser.close();
