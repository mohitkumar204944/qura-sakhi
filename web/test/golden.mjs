// The golden test (roadmap 39.3 and 39.4): it records what every plan shows on this build, so the port of the plans to data
// files (Version 39.4) can be checked byte for byte. Record on a known-good build with --record; any change to what a plan
// shows must re-record it in the same commit, naming the change.
// Usage: node test/golden.mjs [--record] [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv.slice(2).find((x) => !x.startsWith('--')) || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const SHOTS = path.join(here, 'shots', 'golden'); fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-27';   /* a Tuesday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (day, hm) => new Date(new Date(TODAY + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain'].map((k) => [k, { st: 'done', d: ago(3) }]));
/* the Android bridge, keeping what Sakhi asks it to schedule */
const ANDROID = 'window.__sched = []; window.SakhiAndroid = { schedule(j){ try { window.__sched = JSON.parse(j); } catch (e) {} return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, setDisguise(){}, isDisguised(){ return false; }, keepAwake(){} };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.3-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start', pain: 'pain_1' }, { d: ago(x - 5), t: 'end' })); return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
const planOf = (pack, goal, start, extra) => Object.assign({ pack: pack, goalKey: goal, start: start, go: true, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'evening', bed: 'b23', work: 'day', log: {}, weeks: {}, body: [], doc: 'done' }, extra || {});
const PREG = (w) => ({ situation: { pregnant: true, pregnantSince: ago(w * 7) }, events: [] });
const REC_OK = { danger: ['none'], bleed: 'light', colour: 'brown', wtype: 'stitch', wound: 'fine', fever: 'no', breast: 'fine', pee: 'fine', potty: 'fine', mood: 'ok', sleep: 'some' };

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(Object.assign({}, LOCAL, o.config || {})) + ';');
  await ctx.addInitScript(ANDROID);
  if (o.seed !== null) await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: o.now || at(0, '10:00') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const view = (page) => page.$eval('#view', (e) => e.innerText);
const vtext = (page) => page.$eval('#view', (e) => e.textContent);
const tap = async (page, sel) => { await page.waitForSelector(sel, { timeout: 5000 }); await page.$eval(sel, (el) => el.click()); await settle(page, 300); };
const has = (page, sel) => page.$(sel).then((x) => !!x);
const txt = (page, sel) => page.$eval(sel, (e) => e.innerText).catch(() => '');
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const search = async (page, q) => { await go(page, 'care'); await page.evaluate((x) => { window.Saathi.mem.careQ = x; window.Saathi.render(); }, q); await settle(page, 300); return page.$$eval('#view section.care-sec:first-of-type [data-go]', (x) => x.map((y) => y.dataset.go)); };
const errsAll = [];

/* Every plan, every goal, on the days that matter: the steps (id, kind, title, sub, link, state), Today's plan line, My plan's
   page and the doctor summary, as text. --record writes test/golden/plans.json; a plain run compares with it. */
const RECORD = process.argv.includes('--record');
const FILE = path.join(here, 'golden', 'plans.json'); fs.mkdirSync(path.dirname(FILE), { recursive: true });
const DAYS = [0, 1, 6, 13, 27, 55, 83, 90];
const PLANS = [
  ['cycle', 'cycle', 'irregular'], ['cycle', 'cycle', 'pmos'], ['cycle', 'cycle', 'skin'], ['cycle', 'cycle', 'weight'],
  ['cycle', 'pain', 'pain'], ['cycle', 'heavy', 'heavy'], ['cycle', 'pms', 'pms'],
  ['ttc', 'ttc', 'ready'], ['preg', 'preg', 'food'], ['preg', 'preg', 'iron'], ['preg', 'preg', 'mood'],
  ['post', 'post', 'recovery'], ['post', 'post', 'feed'], ['post', 'post', 'weight'],
  ['meno', 'meno', 'hot'], ['meno', 'meno', 'bones'], ['meno', 'meno', 'weight'], ['meno', 'heavy', 'heavy'],
  /* Version 39.4 (roadmap section 2, "The port"): widened. The 3 trying-stage goals that use the cycle plan; pregnancy from
     weeks 8, 20 and 30; a birth in the middle of a pregnancy plan; varied answers; and a tester's build */
  ['ttc', 'cycle', 'irregular'], ['ttc', 'cycle', 'pmos'], ['ttc', 'cycle', 'weight'],
  ['preg', 'preg', 'food', { tag: 'wk8', situ: { pregnant: true, pregnantSince: ago(56) } }], ['preg', 'preg', 'nausea', { tag: 'wk20', situ: { pregnant: true, pregnantSince: ago(140) } }],
  ['preg', 'preg', 'sleep', { tag: 'wk30', situ: { pregnant: true, pregnantSince: ago(210) } }],
  ['post', 'preg', 'food', { tag: 'born-mid-run', situ: { deliveredOn: ago(5) }, start: ago(30) }],
  ['cycle', 'cycle', 'irregular', { tag: 'night-late-lv2-back', plan: { work: 'night', bed: 'late', level: 2, limits: { knees: false, back: true }, when: 'dinner' } }],
  ['cycle', 'heavy', 'heavy', { tag: 'nonveg', plan: { food: 'nonveg' } }], ['cycle', 'pain', 'pain', { tag: 'jain-knees', plan: { food: 'jain', limits: { knees: true, back: false }, bed: 'b24' } }],
  ['cycle', 'cycle', 'irregular', { tag: 'tester', config: { app: 'test-0.39' } }], ['cycle', 'pain', 'pain', { tag: 'tester', config: { app: 'test-0.39' } }],
  ['preg', 'preg', 'food', { tag: 'tester', config: { app: 'test-0.39' } }]
];
const SITU = { cycle: {}, ttc: { planning: true }, preg: { pregnant: true, pregnantSince: ago(120) }, post: { deliveredOn: ago(60), breastfeeding: true }, meno: { midlife: true } };
const DOB = { meno: '1976-03-01' };
const out = {};
for (const [st, pack, goal, x0] of PLANS) {
  const x = x0 || {}; const key = st + '/' + pack + '/' + goal + (x.tag ? '/' + x.tag : '');
  const a = await open({ config: x.config, seed: { dob: DOB[st] || '1996-05-01', situation: x.situ || SITU[st], events: st === 'preg' || st === 'post' ? [] : regular(10), intake: { goal: goal, stage: st }, mods: { plan: planOf(pack, goal, x.start || TODAY, Object.assign({ intake: { goal: goal, stage: st } }, x.plan || {})) } } });
  out[key] = {};
  for (const n of DAYS) {
    await a.page.clock.setFixedTime(at(n, '20:30')); await a.page.evaluate(() => window.Saathi.render()); await settle(a.page, 300);
    const snap = await a.page.evaluate(() => { const S = window.Saathi; const acts = (S.plan.actions() || []).map((x) => [x.id, x.kind || '', x.title || '', x.sub || '', x.go || '', x.state || ''].join(' | '));
      const head = (document.querySelector('#view .pl-th') || document.querySelector('#view .today-card') || {}).innerText || '';
      const sum = (S.summaries ? S.summaries() : []).filter((m) => m.mod === 'plan').map((m) => (m.sections || []).map((x) => x.title + ': ' + (x.lines || []).join(' / ')).join(' // ')).join('');
      return { pack: S.plan.packOf(), acts: acts, head: head.replace(/\s+/g, ' ').trim(), sum: sum }; });
    await go(a.page, 'plan');
    snap.myplan = (await vtext(a.page)).replace(/\s+/g, ' ').trim();
    await go(a.page, 'home');
    out[key]['day ' + n] = snap;
  }
  errsAll.push(...a.errs); await a.ctx.close();
}
if (RECORD) { fs.writeFileSync(FILE, JSON.stringify(out, null, 1) + '\n'); console.log('GOLDEN recorded: ' + Object.keys(out).length + ' plans x ' + DAYS.length + ' days -> ' + path.relative(root, FILE)); }
else {
  const want = JSON.parse(fs.readFileSync(FILE, 'utf8')); let diffs = 0;
  for (const k of Object.keys(want)) for (const dkey of Object.keys(want[k])) {
    const w = JSON.stringify(want[k][dkey]), g = JSON.stringify((out[k] || {})[dkey]);
    if (w !== g) { diffs++; if (diffs <= 12) console.log('DIFF ' + k + ' ' + dkey + '\n  want ' + w.slice(0, 400) + '\n  got  ' + (g || '').slice(0, 400)); }
  }
  check('golden: every plan, goal and day matches the recorded build', diffs === 0, diffs + ' differences');
}
check('golden: no page errors', errsAll.length === 0, errsAll.slice(0, 5));
await browser.close();
const failed = results.filter((r) => !r.pass);
if (!RECORD) console.log(results.length - failed.length + '/' + results.length + ' checks passed');
if (failed.length) process.exit(1);
