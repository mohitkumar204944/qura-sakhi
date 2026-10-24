// Her 12 weeks, fast-forwarded (docs/ux-gaps-2026-10-24.md): Riya starts the cycle plan on a Monday, checks in on day 1,
// misses days 2 to 4, logs a period, and reaches week 2, the month-1 look-back and the end of week 12. Every stop is
// photographed, with the screen's text, any sheet, tip or toast, and what the phone was asked to ring. Not pass/fail: run it
// before and after a change to compare.
// Usage: node test/weeks-walk.mjs   (screens and text to test/shots/weeks/)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const OUT = path.join(here, 'shots', 'weeks'); fs.mkdirSync(OUT, { recursive: true });
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const ANDROID = 'window.__rings = []; window.SakhiAndroid = { schedule(j){ try { window.__rings.push(JSON.parse(j)); } catch (e) {} return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, setDisguise(){}, isDisguised(){ return false; }, keepAwake(){}, saveState(){ return true; }, loadState(){ return ""; } };';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const D0 = '2026-10-26';   /* a Monday */
const at = (day, hm) => new Date(new Date(D0 + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const iso = (day) => { const d = new Date(D0 + 'T12:00:00+05:30'); d.setDate(d.getDate() + day); return d.toISOString().slice(0, 10); };

const browser = await chromium.launch();
const rows = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-IN', timezoneId: 'Asia/Kolkata' });
await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ app: '0.37-pilot', platform: 'android' }) + ';');
await ctx.addInitScript(ANDROID);
const seed = { lang: 'en', langChosen: true, stage: 'app', whatsNew: '0.37', dob: '1996-07-01', consent: { c1: iso(-1) }, situation: {}, goals: ['track', 'irregular'],
  events: [{ d: iso(-80), t: 'start', approx: true }, { d: iso(-38), t: 'start', approx: true }], daily: {}, notes: {}, checkins: {},
  tours: { home: { st: 'done', d: iso(0) } }, fullTour: { st: 'reveal', d: iso(0) }, settings: { notify: true }, prompts: { notifyIntro: iso(0) }, mods: {} };
await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seed)) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify({ token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001' })) + '); }');
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
const page = await ctx.newPage(); const errs = [];
page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
await page.clock.install({ time: at(0, '10:00') });
await page.goto(PAGE + '#home', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => !!window.Saathi);
const settle = async (ms = 500) => { for (let i = 0; i < Math.ceil(ms / 100); i++) { await page.clock.runFor(100); await sleep(10); } };
const go = async (h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(700); };
const jump = async (day, hm, h) => { await page.clock.setSystemTime(at(day, hm)); await go('diary'); await go(h || 'home'); await settle(900); };
const tap = async (sel) => { await page.waitForSelector(sel, { timeout: 5000 }); await page.$eval(sel, (el) => el.click()); await settle(500); };
let n = 0;
/* what stands between her and the screen: a badge pop-up, a tip, a sheet. Noted, then closed the way she would. */
async function clear(label) {
  const b = await page.evaluate(() => ({ badge: (document.querySelector('#joy-root [role="dialog"]') || {}).ariaLabel || '', tip: (document.querySelector('#tour-root #tour-h') || {}).innerText || '', sheet: ((document.querySelector('#sheet-root .sheet h2') || {}).innerText || '') }));
  if (b.badge || b.tip || b.sheet) rows.push({ n: 0, label: 'blockers before ' + label, view: JSON.stringify(b) });
  for (let k = 0; k < 6; k++) {
    const did = await page.evaluate(() => {
      const jb = document.querySelector('#joy-root [role="dialog"] button'); if (jb) { jb.click(); return 'badge'; }
      const tl = document.querySelector('#tour-root #tour-later, #tour-root #tour-next'); if (tl) { tl.click(); return 'tip'; }
      return '';
    });
    if (!did) break; await settle(400);
  }
}
async function snap(label) {
  n++; const f = String(n).padStart(2, '0') + '-' + label.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  const m = await page.evaluate(() => {
    const txt = (s) => { const e = document.querySelector(s); return e ? e.innerText.trim().replace(/\n{2,}/g, '\n') : ''; };
    return { hash: location.hash, now: new Date().toString().slice(0, 21), view: txt('#view'), sheet: txt('#sheet-root .sheet'), tour: txt('#tour-root .tour-pop'), toast: txt('.toast'),
      slot: [...document.querySelectorAll('#view .slot > .card, #view .slot > button, #view .slot .slot-in > *')].map((e) => e.innerText.trim().split('\n')[0]),
      screens: +(document.documentElement.scrollHeight / window.innerHeight).toFixed(1) };
  });
  await page.screenshot({ path: path.join(OUT, f + '.png'), fullPage: true });
  rows.push(Object.assign({ n, label }, m));
}

/* day 0 (Monday): her plan is made and started from the plan screen */
await page.evaluate(() => { window.Saathi.plan.startFromIntake({ stage: 'cycle', goal: 'irregular', gap: 'g45', skips: 'y', dx: 'ns', signs: ['acne'], act: 0, food: 'veg', bed: 'late', work: 'day', remind: '20:00', when: 'dinner' }); window.Saathi.save(); });
await go('plan-reveal');
/* Version 37.1: the plan's cards come first; "Start my plan" is on the last one */
for (let k = 0; k < 8 && (await page.$('#pl-rv-next')) && !(await page.$('#pl-rv-go')); k++) await tap('#pl-rv-next');
await tap('#pl-rv-go'); await settle(1500);
await snap('d1-10am-today-after-start');
const rings0 = await page.evaluate(() => JSON.parse(JSON.stringify(window.__rings || [])));
rows.push({ n: 0, label: 'rings-after-start', view: JSON.stringify(rings0.slice(-1)).slice(0, 1500) });
/* she walks after dinner and taps Done; 8 pm check-in */
await jump(0, '20:05');
await snap('d1-8pm-today');
await clear('tapping Done'); const done = await page.$('#view .today-card [data-today-act]'); if (done) { await page.$eval('#view .today-card [data-today-act]', (e) => e.click()); await settle(800); }
await snap('d1-after-walk-done');
await clear('the check-in'); await go('plan-checkin'); await snap('d1-checkin');
for (const s of await page.$$eval('[data-ci]', (b) => [...new Set(b.map((x) => x.dataset.ci.split(':')[0]))])) { const pick = s.indexOf('walk') >= 0 ? 'd' : 'p'; await page.$eval('[data-ci="' + s + ':' + pick + '"]', (e) => e.click()).catch(() => {}); await settle(150); }
await snap('d1-checkin-answered');
await tap('#pl-ci-save'); await settle(1200); await snap('d1-checkin-feedback');
await go('home'); await snap('d1-today-after-checkin');
/* day 2 morning: what does Today say about yesterday? */
await jump(1, '08:30'); await snap('d2-8am-today');
/* the reminder she taps at 8 pm: where does it take her? */
const goTo = await page.evaluate(() => { const r = window.Saathi.reminders.get('plan'); return r ? { title: r.title, time: r.time, until: r.until } : null; });
rows.push({ n: 0, label: 'plan-reminder', view: JSON.stringify(goTo) });
/* the screen her plan's alarm opens (its "go"), as Android hands it back on a tap */
const ringGo = await page.evaluate(() => { const all = (window.__rings || []).slice(-1)[0] || []; const r = all.find((x) => /^r-plan-/.test(x.id)); return r ? r.go : null; });
rows.push({ n: 0, label: 'plan-alarm-opens', view: String(ringGo) });
await jump(1, '20:01', ringGo || 'home'); await snap('d2-8pm-reminder-tap-lands-on');
/* days 2 to 4 quiet; day 5 */
await jump(4, '09:00'); await snap('d5-today-after-3-quiet-days');
/* day 8: week 2 begins */
await jump(7, '09:00'); await snap('d8-week2-today');
await go('plan'); await snap('d8-week2-my-plan');
/* a period starts on day 20 */
await jump(19, '09:00');
await page.evaluate((d) => { const S = window.Saathi; S.state.events.push({ d, t: 'start' }); S.save(); S.emit('log', { type: 'start' }); }, iso(19));   /* as the diary does when she logs it */
await go('diary'); await go('home'); await snap('d20-period-started-today');
/* day 29: week 5 begins, month 1 done */
await jump(28, '09:00'); await snap('d29-month1-today');
await clear('month 1'); const mg = await page.$('#pl-m-go'); if (mg) { await page.$eval('#pl-m-go', (e) => e.click()); await settle(900); await snap('d29-month1-lookback'); }
await go('plan'); await snap('d29-my-plan');
/* day 85: the 12 weeks are over */
await jump(84, '09:00'); await snap('d85-after-12-weeks-today');
await go('plan'); await snap('d85-my-plan');
await go('plan-checkin'); await snap('d85-checkin');
const rings = await page.evaluate(() => JSON.parse(JSON.stringify((window.Saathi.reminders.list() || []).map((r) => ({ id: r.id, title: r.title, time: r.time, until: r.until, on: r.on })))));
rows.push({ n: 0, label: 'reminders-at-end', view: JSON.stringify(rings).slice(0, 1500) });
if (errs.length) rows.push({ n: 99, label: 'ERRORS', view: errs.join(' || ') });
fs.writeFileSync(path.join(OUT, 'weeks.json'), JSON.stringify(rows, null, 1));
for (const r of rows) console.log('#' + r.n + ' ' + r.label + ' ' + (r.hash || '') + ' ' + (r.now || '') + (r.screens ? ' ' + r.screens + 'scr' : '') + (r.tour ? ' TOUR[' + r.tour.replace(/\n/g, ' / ').slice(0, 90) + ']' : '') + (r.sheet ? ' SHEET[' + r.sheet.replace(/\n/g, ' / ').slice(0, 90) + ']' : '') + (r.toast ? ' TOAST[' + r.toast.replace(/\n/g, ' / ').slice(0, 60) + ']' : '') + (r.slot && r.slot.length ? ' SLOT' + JSON.stringify(r.slot) : '') + '\n   ' + String(r.view || '').replace(/\n/g, ' / ').slice(0, 700));
await browser.close();
