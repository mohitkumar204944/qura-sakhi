// Every goal's first days (docs/ux-gaps-2026-10-24.md): for each stage and goal, the plan screen, Today on day 1 and day 8,
// and My plan on day 8, on a 390 px phone. Also Hindi and a shared phone (discreet mode). Not pass/fail: run it before and
// after a change to compare.
// Usage: node test/stages-walk.mjs   (screens and text to test/shots/stages/)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const OUT = path.join(here, 'shots', 'stages'); fs.mkdirSync(OUT, { recursive: true });
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, setDisguise(){}, isDisguised(){ return false; }, keepAwake(){}, saveState(){ return true; }, loadState(){ return ""; } };';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const D0 = '2026-10-26';
const at = (day, hm) => new Date(new Date(D0 + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const iso = (day) => { const d = new Date(D0 + 'T12:00:00+05:30'); d.setDate(d.getDate() + day); return d.toISOString().slice(0, 10); };
const CASES = [
  ['ttc-ready', { situation: { planning: true }, goals: ['ttc'], events: [{ d: iso(-20), t: 'start' }, { d: iso(-49), t: 'start' }] }, { stage: 'ttc', goal: 'ready', gap: 'n', skips: 'n', dx: 'n', signs: ['none'], act: 1, food: 'egg', bed: 'b23', work: 'day', remind: '20:00', when: 'evening' }],
  ['cycle-pain', { goals: ['track', 'pain'], events: [{ d: iso(-3), t: 'start', pain: 'pain_2' }, { d: iso(-31), t: 'start', pain: 'pain_2' }] }, { stage: 'cycle', goal: 'pain', pain: 'pk', painDays: '23', act: 0, bed: 'b24', work: 'day', remind: '20:00', when: 'evening' }],
  ['cycle-heavy', { goals: ['track', 'heavy'], events: [{ d: iso(-10), t: 'start', pads: 'pads_4' }, { d: iso(-38), t: 'start' }] }, { stage: 'cycle', goal: 'heavy', pads: 'p23', clots: 'n', tired: 'y', act: 1, food: 'veg', bed: 'b23', work: 'home', remind: '18:00', when: 'morning' }],
  ['cycle-pms', { goals: ['track', 'pms'], events: [{ d: iso(-22), t: 'start' }, { d: iso(-50), t: 'start' }] }, { stage: 'cycle', goal: 'pms', pms: ['mood', 'irr', 'bloat'], pmsLevel: 'lot', act: 0, bed: 'b24', work: 'day', remind: '21:00', when: 'dinner' }],
  ['preg-nausea', { situation: { pregnant: true, pregnantSince: iso(-60) }, goals: ['preg', 'nausea'], events: [] }, { stage: 'preg', goal: 'nausea', bed: 'b23', work: 'home', remind: '13:00' }],
  ['post-recovery', { situation: { deliveredOn: iso(-14), breastfeeding: true }, goals: ['baby', 'recovery'], events: [] }, { stage: 'post', goal: 'recovery', bed: 'late', work: 'home', remind: '13:00' }],
  ['meno-hot', { situation: { midlife: true }, dob: '1977-07-01', goals: ['meno', 'hot'], events: [{ d: iso(-70), t: 'start' }, { d: iso(-130), t: 'start' }] }, { stage: 'meno', goal: 'hot', act: 0, bed: 'b23', work: 'home', remind: '20:00', when: 'evening' }]
];
const browser = await chromium.launch();
const rows = [];
async function one(name, extra, intake, opt = {}) {
  const ctx = await browser.newContext({ viewport: { width: opt.w || 390, height: 844 }, locale: opt.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ app: '0.37-pilot', platform: 'android' }) + ';');
  await ctx.addInitScript(ANDROID);
  const seed = Object.assign({ lang: opt.lang || 'en', langChosen: true, stage: 'app', whatsNew: '0.37', dob: '1995-07-01', consent: { c1: iso(-1) }, situation: {}, daily: {}, notes: {}, checkins: {},
    tours: Object.fromEntries(['home', 'diary', 'care', 'help', 'me'].map((k) => [k, { st: 'done', d: iso(0) }])), fullTour: { st: 'reveal', d: iso(0) }, settings: { notify: true, toursAuto: false, discreet: !!opt.disc }, prompts: { notifyIntro: iso(0) }, mods: {} }, extra);
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seed)) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify({ token: 'test', id: 'test', phone: '+919876543210', name: 'Asha Verma', pincode: '226001' })) + '); }');
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: at(0, '10:00') });
  await page.goto(PAGE + '#home', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi);
  const settle = async (ms = 500) => { for (let i = 0; i < Math.ceil(ms / 100); i++) { await page.clock.runFor(100); await sleep(10); } };
  const go = async (h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(700); };
  const snap = async (label) => {
    const m = await page.evaluate(() => { const txt = (s) => { const e = document.querySelector(s); return e ? e.innerText.trim().replace(/\n{2,}/g, '\n') : ''; };
      return { hash: location.hash, view: txt('#view'), sheet: txt('#sheet-root .sheet'), badge: (document.querySelector('#joy-root [role="dialog"]') || {}).ariaLabel || '', slot: [...document.querySelectorAll('#view .slot > .card, #view .slot > button')].map((e) => e.innerText.trim().split('\n')[0]), more: (document.querySelector('#view .slot-more summary') || {}).innerText || '', screens: +(document.documentElement.scrollHeight / window.innerHeight).toFixed(1) }; });
    await page.screenshot({ path: path.join(OUT, name + '-' + label + '.png'), fullPage: true });
    rows.push(Object.assign({ case: name, label }, m));
  };
  await page.evaluate((a) => { window.Saathi.plan.startFromIntake(a); window.Saathi.save(); }, intake);
  await go('plan-reveal'); await snap('reveal');
  /* Version 37.1: the plan's cards come first; "Start my plan" is on the last one */
  for (let k = 0; k < 8 && (await page.$('#pl-rv-next')) && !(await page.$('#pl-rv-go')); k++) { await page.$eval('#pl-rv-next', (e) => e.click()); await settle(400); }
  if (await page.$('#pl-rv-go')) { await snap('start-screen'); await page.$eval('#pl-rv-go', (e) => e.click()); await settle(1200); }
  await page.evaluate(() => { const jb = document.querySelector('#joy-root [role="dialog"] button'); if (jb) jb.click(); }); await settle(300);
  await snap('d1-today');
  await page.clock.setSystemTime(at(7, '09:00')); await go('diary'); await go('home'); await settle(900);
  await page.evaluate(() => { const jb = document.querySelector('#joy-root [role="dialog"] button'); if (jb) jb.click(); }); await settle(300);
  await snap('d8-today');
  await go('plan'); await snap('d8-my-plan');
  if (errs.length) rows.push({ case: name, label: 'ERRORS', view: errs.join(' || ') });
  await ctx.close();
}
for (const [name, extra, intake] of CASES) await one(name, extra, intake);
await one('cycle-irregular-hi', { goals: ['track', 'irregular'], events: [{ d: iso(-38), t: 'start' }, { d: iso(-80), t: 'start' }] }, { stage: 'cycle', goal: 'irregular', gap: 'g45', skips: 'y', dx: 'ns', signs: ['acne'], act: 0, food: 'veg', bed: 'late', work: 'day', remind: '20:00', when: 'dinner' }, { lang: 'hi' });
await one('cycle-irregular-discreet', { goals: ['track', 'irregular'], events: [{ d: iso(-38), t: 'start' }, { d: iso(-80), t: 'start' }] }, { stage: 'cycle', goal: 'irregular', gap: 'g45', skips: 'y', dx: 'ns', signs: ['acne'], act: 0, food: 'veg', bed: 'late', work: 'day', remind: '20:00', when: 'dinner' }, { disc: true });
fs.writeFileSync(path.join(OUT, 'stages.json'), JSON.stringify(rows, null, 1));
for (const r of rows) console.log('== ' + r.case + ' · ' + r.label + ' ' + (r.hash || '') + (r.screens ? ' ' + r.screens + 'scr' : '') + (r.badge ? ' BADGE[' + r.badge + ']' : '') + (r.sheet ? ' SHEET[' + r.sheet.replace(/\n/g, ' / ').slice(0, 80) + ']' : '') + (r.slot && r.slot.length ? ' SLOT' + JSON.stringify(r.slot) + ' ' + r.more : '') + '\n   ' + String(r.view || '').replace(/\n/g, ' / ').slice(0, 900));
await browser.close();
