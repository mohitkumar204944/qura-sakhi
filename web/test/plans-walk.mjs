// Every plan side by side (docs/programmes-every-condition-2026-10-24.md): each stage and goal's plan is started and run for 12
// weeks on a fake clock. For each it records the daily steps (how many different ones; food, movement, routine or link) and,
// on days 8 and 50, what My plan shows (sections, tiles, pictures, words, where its buttons go). Not pass/fail: run it before
// and after a change to compare.
// Usage: node test/plans-walk.mjs   (plans-walk.json and screens to test/shots/plans-walk/)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const OUT = path.join(here, 'shots', 'plans-walk'); fs.mkdirSync(OUT, { recursive: true });
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const ANDROID = 'window.SakhiAndroid = { schedule(){ return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, setDisguise(){}, isDisguised(){ return false; }, keepAwake(){}, saveState(){ return true; }, loadState(){ return ""; } };';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const D0 = '2026-10-26';
const at = (day, hm) => new Date(new Date(D0 + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const iso = (day) => { const d = new Date(D0 + 'T12:00:00+05:30'); d.setDate(d.getDate() + day); return d.toISOString().slice(0, 10); };
const DAYS = 84;
/* every answer a goal's screens can ask; each plan reads only its own */
const ANS = { gap: 'g45', skips: 'n', dx: 'n', signs: ['none'], pain: 'pk', painDays: '23', pads: 'p23', clots: 'n', tired: 'y', pms: ['mood', 'bloat'], pmsLevel: 'lot', act: 0, food: 'veg', bed: 'b23', work: 'day', remind: '20:00', when: 'evening' };
const cyc = { events: [{ d: iso(-20), t: 'start' }, { d: iso(-66), t: 'start' }] };
const ST = {
  cycle: cyc,
  ttc: Object.assign({ situation: { planning: true } }, cyc),
  preg: { situation: { pregnant: true, pregnantSince: iso(-60) }, events: [] },
  post: { situation: { deliveredOn: iso(-50), breastfeeding: true }, events: [] },
  meno: { situation: { midlife: true }, dob: '1977-07-01', events: [{ d: iso(-70), t: 'start' }, { d: iso(-130), t: 'start' }] }
};
const GOALS = { cycle: ['irregular', 'pmos', 'pain', 'heavy', 'pms', 'skin', 'weight'], ttc: ['ready'], preg: ['food', 'nausea', 'iron', 'sleep', 'mood'], post: ['recovery', 'pelvic', 'feed', 'mood', 'sleep', 'weight'], meno: ['hot', 'sleep', 'mood', 'bones', 'heavy', 'weight'] };
const browser = await chromium.launch();
const rows = [];
async function one(stage, goal) {
  const name = stage + '-' + goal;
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ app: '0.38-pilot', platform: 'android' }) + ';');
  await ctx.addInitScript(ANDROID);
  const seed = Object.assign({ lang: 'en', langChosen: true, stage: 'app', whatsNew: '0.38', dob: '1995-07-01', consent: { c1: iso(-1) }, situation: {}, daily: {}, notes: {}, checkins: {}, goals: [goal],
    tours: Object.fromEntries(['home', 'diary', 'care', 'help', 'me'].map((k) => [k, { st: 'done', d: iso(0) }])), fullTour: { st: 'reveal', d: iso(0) }, settings: { notify: true, toursAuto: false }, prompts: { notifyIntro: iso(0) }, mods: {} }, JSON.parse(JSON.stringify(ST[stage])));
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seed)) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify({ token: 'test', id: 'test', phone: '+919876543210', name: 'Asha Verma', pincode: '226001' })) + '); }');
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: at(0, '10:00') });
  await page.goto(PAGE + '#home', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi);
  const settle = async (ms = 500) => { for (let i = 0; i < Math.ceil(ms / 100); i++) { await page.clock.runFor(100); await sleep(10); } };
  const go = async (h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(700); };
  const started = await page.evaluate((a) => { const S = window.Saathi; S.plan.startFromIntake(a); const ok = S.plan.start('today', '20:00'); S.save(); return { ok: ok, pack: S.plan.packOf() }; }, Object.assign({ stage: stage, goal: goal }, ANS));
  /* the steps, day by day (no screens: the plan's own rules) */
  const steps = {}; const kinds = {}; const routes = {}; let total = 0;
  for (let day = 0; day < DAYS; day++) {
    await page.clock.setSystemTime(at(day, '19:00'));
    const acts = await page.evaluate(() => window.Saathi.plan.actions().map((a) => ({ id: a.id, kind: a.kind, title: a.title, go: a.go, mins: a.mins || 0 })));
    total += acts.length;
    for (const a of acts) { const k = a.id + ' | ' + a.title.replace(/\d+/g, 'n'); steps[k] = (steps[k] || 0) + 1; kinds[a.kind] = (kinds[a.kind] || 0) + 1; routes[a.go] = (routes[a.go] || 0) + 1; }
  }
  /* My plan, as she sees it */
  const view = async (day, label) => {
    await page.clock.setSystemTime(at(day, '19:00')); await go('diary'); await go('plan'); await settle(600);
    const m = await page.evaluate(() => { const v = document.querySelector('#view'); const words = (v.innerText || '').split(/\s+/).filter(Boolean).length;
      return { hash: location.hash, words: words, screens: +(document.documentElement.scrollHeight / window.innerHeight).toFixed(1), pics: v.querySelectorAll('svg').length - v.querySelectorAll('.chev svg, .iconbtn svg, .ico-sm svg').length,
        heads: [...v.querySelectorAll('h1, h2, h3')].map((e) => e.innerText.trim()).filter(Boolean), tiles: [...v.querySelectorAll('.pl-tile')].map((e) => e.dataset.go), ring: !!v.querySelector('.pl-weekcard'),
        goes: [...new Set([...v.querySelectorAll('[data-go]')].map((e) => e.dataset.go))] }; });
    await page.screenshot({ path: path.join(OUT, name + '-' + label + '.png'), fullPage: true });
    return m;
  };
  const d8 = await view(7, 'd8-my-plan'); const d50 = await view(49, 'd50-my-plan');
  rows.push({ case: name, pack: started.pack, started: started.ok, stepsPerDay: +(total / DAYS).toFixed(1), distinct: Object.keys(steps).length, steps: steps, kinds: kinds, routes: routes, d8: d8, d50: d50, errors: errs });
  await ctx.close();
}
for (const st of Object.keys(GOALS)) for (const g of GOALS[st]) await one(st, g);
fs.writeFileSync(path.join(OUT, 'plans-walk.json'), JSON.stringify(rows, null, 1));
for (const r of rows) {
  console.log('== ' + r.case + ' (' + r.pack + ')  steps/day ' + r.stepsPerDay + ', distinct ' + r.distinct + ', kinds ' + JSON.stringify(r.kinds) + (r.errors.length ? '  ERRORS ' + r.errors.join(' | ') : ''));
  console.log('   steps: ' + Object.entries(r.steps).map(([k, n]) => k + ' x' + n).join(' ; '));
  console.log('   My plan d8: ' + r.d8.words + ' words, ' + r.d8.screens + ' screens, ' + r.d8.pics + ' pictures, ring ' + r.d8.ring + ', tiles ' + JSON.stringify(r.d8.tiles) + '; goes ' + JSON.stringify(r.d8.goes));
  console.log('   heads d8: ' + r.d8.heads.join(' / '));
}
await browser.close();
