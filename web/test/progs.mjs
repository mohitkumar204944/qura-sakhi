// Version 39.4, the port R1: the plans as data (docs/plans-design-and-build-2026-10-24.md, sections 3.1, 6.2 and 6.3;
// MODULE_API section 47). This file checks web/progs/*.js:
//   1 pure data: a JSON round trip gives the same specs; no code, no network words; every file loads before the modules;
//   2 the closed vocabulary: every field, kind, adapter, `when` and `if` word is one the engine (mods/plan.js) knows;
//   3 every '@key' and reason has English and Hindi; every route has an owner; '@tile' routes have a tile;
//   4 the baseline hash: each live spec, with the words it shows in both languages, matches progs/baseline.json
//     (--record writes it; a change to a live plan must re-record it and say why);
//   5 the engine: drafts only with SAKHI_CONFIG.drafts; a plan she starts keeps its version (d.pv); old plans are version 1;
//   6 --equiv <dir>: every plan, goal and day matches another build (run once against the Version 39.3 copy for the port).
// Usage: node test/progs.mjs [--record] [--equiv <dir>] [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import crypto from 'node:crypto';
import util from 'node:util';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const RECORD = argv.includes('--record');
const EQ = argv.indexOf('--equiv') >= 0 ? argv[argv.indexOf('--equiv') + 1] : null;
const rest = argv.filter((x, i) => !x.startsWith('--') && !(i > 0 && argv[i - 1] === '--equiv'));
const root = path.resolve(here, '..', rest[0] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-10-27';   /* a Tuesday */
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (day, hm) => new Date(new Date(TODAY + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ANDROID = 'window.__sched = []; window.SakhiAndroid = { schedule(j){ try { window.__sched = JSON.parse(j); } catch (e) {} return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; } };';
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Riya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.4-pilot', platform: 'android' };
const regular = (last) => { const out = []; [last + 56, last + 28, last].forEach((x) => out.push({ d: ago(x), t: 'start', pain: 'pain_1' }, { d: ago(x - 5), t: 'end' })); return out; };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: regular(10), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', prompts: { setup: 'off', notifyIntro: ago(3), planCall: ago(3) }, mods: {} }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });
const planOf = (pack, goal, start, extra) => Object.assign({ pack: pack, goalKey: goal, start: start, go: true, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '20:00', when: 'evening', bed: 'b23', work: 'day', log: {}, weeks: {}, body: [], doc: 'done' }, extra || {});

const browser = await chromium.launch();
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(Object.assign({}, LOCAL, o.config || {})) + ';');
  await ctx.addInitScript(ANDROID);
  if (o.init) await ctx.addInitScript(o.init);
  if (o.seed !== null) await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: o.now || at(0, '10:00') });
  await page.goto((o.page || PAGE) + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const vtext = (page) => page.$eval('#view', (e) => e.textContent);
const errsAll = [];

/* ---------- 1. Pure data ---------- */
const PDIR = path.join(root, 'progs');
const files = fs.readdirSync(PDIR).filter((f) => /\.js$/.test(f)).sort();
const idx = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const specs = [];
for (const f of files) {
  const src = fs.readFileSync(path.join(PDIR, f), 'utf8');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  check('1 ' + f + ': no code (functions, arrows, templates, regular expressions) and no network words', !/\bfunction\b|=>|`|\bnew\s|fetch|XMLHttpRequest|https?:|wa\.me|\beval\b|\bdocument\b|\blocalStorage\b/.test(code));
  check('1 ' + f + ': only pushes data onto window.SAKHI_PROGS', /^\s*\(window\.SAKHI_PROGS = window\.SAKHI_PROGS \|\| \[\]\)\.push\(/.test(code));
  const win = {}; new Function('window', src)(win);
  const got = win.SAKHI_PROGS || [];
  check('1 ' + f + ': a JSON round trip gives the same specs', util.isDeepStrictEqual(JSON.parse(JSON.stringify(got)), got));
  check('1 ' + f + ': loaded by index.html before the modules', idx.indexOf('src="progs/' + f + '"') > 0 && idx.indexOf('src="progs/' + f + '"') < idx.indexOf('<!-- MODULES:START -->'));
  got.forEach((x) => specs.push(Object.assign({ _file: f }, x)));
}
check('1 the APK copies every plan file', /cp "\$WEB"\/progs\/\*\.js build\/assets\/www\/progs\//.test(fs.readFileSync(path.join(root, '..', 'android', 'build-apk.sh'), 'utf8')));

/* ---------- 2. The closed vocabulary (mods/plan.js implements each word once) ---------- */
const TOP = ['_file', 'id', 'ver', 'status', 'tier', 'purpose', 'title', 'discreetTitle', 'sensitive', 'goals', 'life', 'clock', 'length', 'moves', 'intake', 'slots', 'hero', 'tiles', 'rest', 'keep', 'steps', 'list', 'doctor', 'examples', 'changelog'];
const KINDS = ['minutes', 'tick', 'habit', 'routine', 'link', 'check', 'adapter'];
const ADAPTERS = ['walk.cycle', 'yoga.cycle', 'plate', 'bed', 'journey.iron', 'preg.due', 'post.rcheck', 'food.calcium', 'preg.food', 'ttc.folic', 'ttc.hb', 'ttc.ready', 'ttc.his', 'ttc.calm', 'post.pf', 'meno.skill', 'period.relax', 'period.rest', 'period.hb', 'period.calmweek', 'pelvic.sets', 'pelvic.find', 'pelvic.checked', 'pelvic.urge', 'pelvic.habit'];   /* pelvic.*: Version 39.56 */   /* period.*: Version 39.55 */   /* Version 39.51: meno.skill; Version 39.9; yoga.cycle: Version 39.13; ttc.*: Version 39.32; post.pf: Version 39.46 */
const STEP_KEYS = ['id', 'kind', 'use', 'go', 'title', 'icon', 'hue', 'why', 'priv', 'when', 'if', 'mins', 'cap', 'grow', 'from', 'check', 'once', 'at', 'sub', 'play'];   /* play: Version 39.55, a tick whose tool is a short routine plays it */   /* once: Version 39.5 review, a one-time step; at: V39.9 review, the card its link opens; sub: Version 39.34, a set walk's own line */
const FROM = /^(relief:[a-z]+|ttc-prep|meno-diary|post-pelvic|post-recovery|preg-plan)$/;
const HUES = ['purple', 'green', 'rose', 'sky', 'orange', 'gold', 'plum'];
const ifOk = (w) => /^!?(route(:[a-z0-9-]+)?|early|pnow|unlock|pready|died|folic|period|before|hbdone|pfurge|pfgoal|also:[a-z]+|goal:[a-z]+|sit:[a-z]+|pt:(green|amber|red)|ans:[a-zA-Z]+=[a-zA-Z0-9]+|(week|pday|gw|birth):\d+-\d*)$/.test(w);   /* week, pday: Version 39.32; gw, pt, pnow: Version 39.34; unlock, pready, died and an open birth range: Version 39.46; folic: Version 39.47 */
const whenOk = (w) => w == null || ['daily', 'periodDays', 'before', 'between', 'kitday'].indexOf(w) >= 0 || /^days:[0-6](,[0-6])*$/.test(w);   /* before, between, kitday: Version 39.55 */
const keyOk = (x) => typeof x === 'string' && /^@([a-z][a-z0-9_]*|tile)$/.test(x);
const bad = [];
const stepOk = (x, where) => {
  if (x.first) { if (!Array.isArray(x.first) || Object.keys(x).length !== 1) bad.push(where + ': first'); x.first.forEach((y, i) => stepOk(y, where + '.first' + i)); return; }
  if (x.goal) { if (Object.keys(x).length !== 1) bad.push(where + ': goal'); Object.keys(x.goal).forEach((g) => (x.goal[g] || []).forEach((y, i) => stepOk(y, where + '.goal.' + g + i))); return; }
  Object.keys(x).forEach((k) => { if (STEP_KEYS.indexOf(k) < 0) bad.push(where + ': key ' + k); });
  if (x.sub != null && !((x.kind === 'minutes' || x.kind === 'tick') && typeof x.sub === 'string' && /^@[a-z0-9_]+$/.test(x.sub))) bad.push(where + ': sub');   /* Version 39.34; a tick's own line: Version 39.55 */
  if (!/^[a-z]+$/.test(x.id || '')) bad.push(where + ': id');
  if (KINDS.indexOf(x.kind) < 0) bad.push(where + ': kind ' + x.kind);
  if (x.kind === 'adapter' && ADAPTERS.indexOf(x.use) < 0) bad.push(where + ': adapter ' + x.use);
  if (x.kind === 'minutes' && !(x.use === 'walk' && (['ladder', 'light', 'post'].indexOf(x.mins) >= 0 || (Number.isInteger(x.mins) && x.mins >= 5 && x.mins <= 30)))) bad.push(where + ': minutes');   /* a set walk: Version 39.34 */
  if (['tick', 'routine', 'link', 'check'].indexOf(x.kind) >= 0 && !(x.go && keyOk(x.title) && x.icon && HUES.indexOf(x.hue) >= 0 && /^plan_fb_[a-z_]+$/.test(x.why || ''))) bad.push(where + ': link step');
  if (x.kind === 'routine' && !/^plan-r-[a-z][a-z0-9]*$/.test(x.go || '')) bad.push(where + ': routine go');   /* Version 39.52: preg1 to preg3 */
  if (!whenOk(x.when)) bad.push(where + ': when ' + x.when);
  (x.if || []).forEach((w) => { if (!ifOk(w)) bad.push(where + ': if ' + w); });
  if (x.cap != null && !(x.cap > 0 && x.cap <= 120)) bad.push(where + ': cap');
  if (x.grow != null && !(x.grow === 'hold' && x.kind === 'minutes')) bad.push(where + ': grow');
  if (x.from != null && !FROM.test(x.from)) bad.push(where + ': from ' + x.from);
  if (x.check != null && !(x.check === true && x.from)) bad.push(where + ': check needs from');
};
const ids = {};
specs.forEach((p) => {
  const w = p._file + ':' + p.id;
  Object.keys(p).forEach((k) => { if (TOP.indexOf(k) < 0) bad.push(w + ': field ' + k); });
  if (!/^[a-z]+$/.test(p.id || '') || !(p.ver >= 1) || ['live', 'draft', 'approved'].indexOf(p.status) < 0 || ['habit', 'condition'].indexOf(p.tier) < 0) bad.push(w + ': id, ver, status or tier');
  const k = p.id + '@' + p.ver; if (ids[k]) bad.push(w + ': twice'); ids[k] = 1;
  if (!Array.isArray(p.title) || !p.title.length || p.title.some((x) => !keyOk(x.text) || (x.if || []).some((y) => !ifOk(y))) || (p.title[p.title.length - 1].if || []).length) bad.push(w + ': title (the last rule has no if)');
  if (!keyOk(p.discreetTitle)) bad.push(w + ': discreetTitle');
  if (!Array.isArray(p.goals) || p.goals.some((g) => Object.keys(g).some((x) => ['stage', 'goal'].indexOf(x) < 0))) bad.push(w + ': goals');
  const lf = p.life || {}; if ((lf.needs && !/^(pregnant|birth:\d+)$/.test(lf.needs)) || (lf.ends && lf.ends !== 'pregnant') || !Array.isArray(lf.pause) || lf.pause.some((x) => ['preg', 'post', 'loss'].indexOf(x) < 0) || lf.pause.indexOf('loss') < 0) bad.push(w + ': life (every plan pauses after a loss)');
  if (['weeks', 'pregWeek', 'birthWeek'].indexOf(p.clock) < 0 || !p.length || !(p.length.weeks >= 0)) bad.push(w + ': clock or length');
  const ik = p.intake || {}; if ((ik.screens || []).some((x) => ['cyc', 'pain', 'pain2', 'heavy', 'pms', 'baby', 'psafe', 'pftrack', 'pfsafe'].indexOf(x.id) < 0) || (ik.day || []).some((x) => ['act', 'food', 'milk', 'lim', 'bed', 'work', 'mbone', 'mheart'].indexOf(x) < 0) || (ik.when != null && ik.when !== true && !(Array.isArray(ik.when) && ik.when.every(ifOk)))) bad.push(w + ': intake');
  if (p.moves && (ik.day || []).indexOf('lim') < 0) bad.push(w + ': a plan with moves asks about knees and back');
  if (!p.slots || !(p.slots.max >= 1 && p.slots.max <= 4)) bad.push(w + ': at most 4 steps a day');   /* Version 39.13: the cycle plan's yoga and walk */
  if (p.hero != null && ['ring', 'week', 'timeline'].indexOf(p.hero) < 0) bad.push(w + ': hero');
  if (p.rest != null && !(p.rest >= 0 && p.rest <= 3)) bad.push(w + ': rest');
  if (p.tiles != null && !(Array.isArray(p.tiles) && p.tiles.length === 4 && p.tiles.every((x) => x.go && keyOk(x.text) && x.text !== '@tile' && x.icon && HUES.indexOf(x.hue) >= 0 && Object.keys(x).every((k) => ['go', 'text', 'icon', 'hue', 'priv'].indexOf(k) >= 0)))) bad.push(w + ': 4 tiles');
  (p.steps || []).forEach((x, i) => stepOk(x, w + '.steps' + i));
  (p.list || []).forEach((x, i) => { if (['walk', 'plate', 'item', 'bed', 'today', 'pyoga'].indexOf(x.use) < 0 || (x.use === 'item' && !keyOk(x.text)) || (x.use === 'walk' && ['suggest', 'light'].indexOf(x.mins) < 0)) bad.push(w + '.list' + i); });
  /* Version 39.6: 'start' (from her answers) and 'due' (from her own dates); check opens a self-check, go a page */
  (p.doctor || []).forEach((x, i) => { const ok = Object.keys(x).every((k) => ['id', 'any', 'text', 'check', 'go', 'due'].indexOf(k) >= 0) && keyOk(x.text) && x.text !== '@tile' &&
    ((x.id === 'start' && Array.isArray(x.any) && x.any.length && x.any.every(ifOk) && !x.due) || (x.id === 'due' && x.due === 'ttc-trying' && !x.any)) && (!x.check || /^selfcheck-[a-z]+$/.test(x.check)) && (!x.go || /^[a-z][a-z0-9-]*$/.test(x.go));
    if (!ok) bad.push(w + '.doctor' + i); });
  if (p.keep != null && !(p.keep.weekly >= 13 && p.keep.until >= p.keep.weekly && p.keep.until <= 104 && Object.keys(p.keep).length === 2)) bad.push(w + ': keep');
});
check('2 every spec uses only the engine\'s vocabulary', bad.length === 0, bad.slice(0, 12));
const live = specs.filter((p) => p.status === 'live');
check('2 the 8 v1 plans are there and live', ['preg', 'post', 'ttc', 'heavy', 'meno', 'pain', 'pms', 'cycle'].every((id) => live.some((p) => p.id === id && p.ver === 1)), live.map((p) => p.id));
check('2 the last plan catches every other goal (the cycle plan)', live.length && (live[live.length - 1].goals || []).some((g) => !g.stage && !g.goal));

/* the words each spec shows: its '@keys', its reasons (why) and the routes it opens */
const walk = (x, f) => { if (Array.isArray(x)) x.forEach((y) => walk(y, f)); else if (x && typeof x === 'object') { f(x); Object.keys(x).forEach((k) => walk(x[k], f)); } };
const wordsOf = (p) => { const keys = new Set(), routes = new Set(), tiles = new Set();
  walk(p, (o) => { ['title', 'text', 'discreetTitle'].forEach((k) => { if (typeof o[k] === 'string' && o[k] !== '@tile' && o[k].charAt(0) === '@') keys.add(o[k].slice(1)); });
    if (typeof o.why === 'string') keys.add(o.why); if (o.go) routes.add(o.go); if (typeof o.check === 'string') routes.add(o.check); if (o.title === '@tile' && o.go) tiles.add(o.go); (o.if || []).forEach((w) => { const m = /^!?route:(.+)$/.exec(w); if (m) routes.add(m[1]); }); });
  return { keys: [...keys].sort(), routes: [...routes].sort(), tiles: [...tiles].sort() }; };

/* ---------- 3 and 4. In the app: English and Hindi for every word, routes, tiles, the baseline hash ---------- */
{
  const a = await open({ seed: {} });
  const info = await a.page.evaluate((all) => { const S = window.Saathi; const T = S.strings || {};
    return all.map((w) => ({ miss: w.keys.filter((k) => !(T.en && T.en[k]) || !(T.hi && T.hi[k])), noRoute: w.routes.filter((r) => !S.routeOwner(r)), noTile: w.tiles.filter((r) => !(S.tiles ? S.tiles() : []).some((x) => x.route === r)),
      text: Object.fromEntries(w.keys.map((k) => [k, [(T.en || {})[k] || '', (T.hi || {})[k] || '']])) })); }, specs.map(wordsOf));
  specs.forEach((p, i) => {
    check('3 ' + p.id + '@' + p.ver + ': every word has English and Hindi', !info[i].miss.length, info[i].miss);
    check('3 ' + p.id + '@' + p.ver + ': every route it opens has an owner', !info[i].noRoute.length, info[i].noRoute);
    check('3 ' + p.id + '@' + p.ver + ': every "@tile" route has a tile', !info[i].noTile.length, info[i].noTile);
  });
  check('3 the engine has exactly the adapters this file knows', util.isDeepStrictEqual(await a.page.evaluate(() => window.Saathi.plan.progs.adapters().sort()), ADAPTERS.slice().sort()), await a.page.evaluate(() => window.Saathi.plan.progs.adapters()));
  /* Version 39.32: a plan with two live versions (Getting ready 1 and 2) runs its newest for a new start; version 1 runs on for the women on it */
  const top = []; live.forEach((p) => { const i = top.findIndex((x) => x.id === p.id); if (i < 0) top.push(p); else if (p.ver > top[i].ver) top[i] = p; });
  check('3 the app runs the 8 live plans, in their order, each at its newest version', (await a.page.evaluate(() => window.Saathi.plan.progs.list().map((x) => x.id + '@' + x.ver))).join() === top.map((p) => p.id + '@' + p.ver).join());
  /* the hash: the spec as sorted JSON, plus the words it shows in both languages, so editing a reviewed line anywhere shows */
  const canon = (x) => (Array.isArray(x) ? '[' + x.map(canon).join(',') + ']' : (x && typeof x === 'object' ? '{' + Object.keys(x).filter((k) => k !== '_file').sort().map((k) => JSON.stringify(k) + ':' + canon(x[k])).join(',') + '}' : JSON.stringify(x)));
  const hashes = {}; specs.forEach((p, i) => { if (p.status !== 'draft') hashes[p.id + '@' + p.ver] = crypto.createHash('sha256').update(canon(p) + '\n' + canon(info[i].text)).digest('hex'); });
  const BASE = path.join(PDIR, 'baseline.json');
  if (RECORD) { fs.writeFileSync(BASE, JSON.stringify(hashes, null, 1) + '\n'); console.log('BASELINE recorded: ' + Object.keys(hashes).length + ' plans -> ' + path.relative(root, BASE)); }
  else {
    const want = fs.existsSync(BASE) ? JSON.parse(fs.readFileSync(BASE, 'utf8')) : {};
    const diff = Object.keys(hashes).filter((k) => want[k] !== hashes[k]);
    check('4 every live plan matches its baseline hash (a change to a plan, or to a line it shows, re-records it and says why)', !diff.length, diff);
  }
  errsAll.push(...a.errs); await a.ctx.close();
}

/* ---------- 5. The engine ---------- */
{
  /* a draft plan (and a draft new version of an old one) shows only with SAKHI_CONFIG.drafts */
  const DRAFTS = '(window.SAKHI_PROGS = window.SAKHI_PROGS || []).push(' + JSON.stringify(Object.assign({}, live.find((p) => p.id === 'pain'), { ver: 3, status: 'draft', title: [{ text: '@plan_pk_pms' }] })) + ');';
  const off = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(3)) } } });
  const on = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(3), { pv: 1 }) } }, config: { drafts: true } });
  for (const x of [off, on]) { await x.page.evaluate((src) => { new Function(src)(); }, DRAFTS); await x.page.evaluate(() => window.Saathi.render()); await settle(x.page, 200); }
  const sumT = (page) => page.evaluate(() => { const m = (window.Saathi.summaries ? window.Saathi.summaries() : []).find((x) => x.mod === 'plan'); return m && m.sections && m.sections[0] ? m.sections[0].title : null; });
  const T = (page, k) => page.evaluate((x) => window.Saathi.t(x), k);
  check('5 without SAKHI_CONFIG.drafts, a draft plan is invisible', (await off.page.evaluate(() => window.Saathi.plan.progs.list().find((x) => x.id === 'pain').ver)) === 2 && (await sumT(off.page)) === (await T(off.page, 'plan_pk_pain')));
  check('5 with it, the draft is the version a new plan gets', (await on.page.evaluate(() => window.Saathi.plan.progs.list().find((x) => x.id === 'pain').ver)) === 3);
  check('5 ... while the plan she started on version 1 keeps version 1', (await sumT(on.page)) === (await T(on.page, 'plan_pk_pain')), await sumT(on.page));
  await on.page.evaluate(() => { const S = window.Saathi; S.plan.startFromIntake({ stage: 'cycle', goal: 'pain', pain: 'pk', painDays: '23', act: 0, food: 'veg', milk: 'y', lim: [], bed: 'b23', work: 'day', when: 'evening' }); S.plan.start('today', '20:00'); S.save(); S.render(); }); await settle(on.page, 200);
  check('5 ... and a plan started now gets version 3, with its words', (await on.page.evaluate(() => window.Saathi.state.mods.plan.pv)) === 3 && (await sumT(on.page)) === (await T(on.page, 'plan_pk_pms')), [await on.page.evaluate(() => window.Saathi.state.mods.plan.pv), await sumT(on.page)]);
  errsAll.push(...off.errs, ...on.errs); await off.ctx.close(); await on.ctx.close();
  /* d.pv: a plan she starts is stamped with its version; a plan saved before the port reads as version 1 */
  const b = await open({ seed: { intake: { goal: 'pain' } } });
  await b.page.evaluate(() => { const S = window.Saathi; S.plan.startFromIntake({ stage: 'cycle', goal: 'pain', pain: 'pk', painDays: '23', act: 0, food: 'veg', milk: 'y', lim: [], bed: 'b23', work: 'day', when: 'evening' }); S.plan.start('today', '20:00'); S.save(); });
  check('5 a plan she starts keeps its version (d.pv)', (await b.page.evaluate(() => window.Saathi.state.mods.plan.pv)) === 2);   /* Version 39.55: pain's live version is 2 */
  errsAll.push(...b.errs); await b.ctx.close();
  const c = await open({ seed: { intake: { goal: 'pain' }, mods: { plan: planOf('pain', 'pain', ago(10)) } } });
  await go(c.page, 'plan');
  check('5 a plan saved before the port reads as version 1, and still runs', (await c.page.evaluate(() => window.Saathi.state.mods.plan.pv)) === 1 && (await c.page.evaluate(() => window.Saathi.plan.packOf())) === 'pain');
  errsAll.push(...c.errs); await c.ctx.close();
  /* an unknown plan doesn't run (a saved pack that no spec has) */
  const u = await open({ seed: { mods: { plan: planOf('nosuch', 'pain', ago(10)) } } });
  check('5 a saved plan no spec knows doesn\'t run, and Today still draws', (await u.page.evaluate(() => window.Saathi.plan.packOf())) === null && !u.errs.length, u.errs);
  errsAll.push(...u.errs); await u.ctx.close();
}

/* ---------- 5b. The minimalist baseline (Mohit, 28 Oct: "make this minimalist approach a baseline for this project for future
   plan builds"; CLAUDE.md). Its evening rule is Version 39.27's (MODULE_API section 70): reminders on by default wherever she
   needs one, no spacing rule and no cap, in the order she lives her evening. So every live plan, started with her check-in at
   8 pm and her walk in the evening, rings its check-in after her move nudge. ---------- */
{
  const top2 = []; specs.filter((p) => p.status === 'live').forEach((p) => { const i = top2.findIndex((x) => x.id === p.id); if (i < 0) top2.push(p); else if (p.ver > top2[i].ver) top2[i] = p; });
  const ST = { preg: { situation: { pregnant: true, pregnantSince: ago(120) }, events: [] }, post: { situation: { deliveredOn: ago(60) }, events: [] }, ttc: { situation: { planning: true } }, meno: { situation: { midlife: true }, dob: '1976-03-01' } };
  const G = { preg: 'food', post: 'recovery', ttc: 'ready', meno: 'hot', heavy: 'heavy', pain: 'pain', pms: 'pms', cycle: 'irregular' };
  const CI = { id: 'plan', mod: 'plan', title: { en: 'How did today go? 1 minute', hi: 'आज का दिन कैसा रहा? 1 मिनट' }, start: ago(3), every: 1, time: '20:00', on: true };
  const over = []; const seen = [];
  for (const p of top2) {
    const stg = ['preg', 'post', 'ttc', 'meno'].indexOf(p.id) >= 0 ? p.id : 'cycle';
    const x = await open({ seed: Object.assign({ intake: { goal: G[p.id], stage: stg } }, ST[p.id] || {}, { mods: { plan: planOf(p.id, G[p.id], ago(3), { pv: p.ver }), ttc: { folic: { has: ago(3) } } }, reminders: [CI] }) });
    await go(x.page, 'plan'); await go(x.page, 'home');
    const ev = await x.page.evaluate(() => window.Saathi.reminders.list().filter((r) => r.on !== false && String(r.time || '') >= '17:00' && ['plan', 'ttc'].indexOf(r.mod) >= 0).map((r) => r.id + '@' + r.time));
    const ci = ev.find((x) => /^plan@/.test(x)), nu = ev.find((x) => /^plan-nudge@/.test(x));
    seen.push(p.id + ':' + ev.length); if (ci && nu && ci.slice(5) < nu.slice(11)) over.push([p.id + '@' + p.ver, ev]);
    await x.ctx.close();
  }
  check('5 the minimalist baseline: every live plan\'s check-in rings after her move nudge, in her evening\'s order (' + seen.join(' ') + ')', !over.length, over);
}

/* ---------- 6. --equiv <dir>: the same plans, goals and days as another build (once, for the port) ---------- */
if (EQ) {
  const other = pathToFileURL(path.join(path.resolve(EQ), 'index.html')).href;
  const STAGES = { cycle: {}, ttc: { planning: true }, preg: { pregnant: true, pregnantSince: ago(120) }, post: { deliveredOn: ago(20), breastfeeding: true }, post60: { deliveredOn: ago(60) }, meno: { midlife: true } };
  const GOALS = { cycle: ['irregular', 'pmos', 'pain', 'heavy', 'pms', 'skin', 'weight'], ttc: ['ready', 'irregular', 'pmos', 'weight'], preg: ['food', 'nausea', 'iron', 'sleep', 'mood'], post: ['recovery', 'pelvic', 'feed', 'mood', 'sleep', 'weight'], post60: ['recovery', 'feed', 'weight'], meno: ['hot', 'sleep', 'mood', 'bones', 'heavy', 'weight'] };
  const PACK = (st, g) => (st === 'preg' ? 'preg' : (st.indexOf('post') === 0 ? 'post' : (st === 'ttc' && g === 'ready' ? 'ttc' : (st === 'meno' ? (g === 'heavy' ? 'heavy' : 'meno') : ({ pain: 'pain', heavy: 'heavy', pms: 'pms' }[g] || 'cycle')))));
  const VARY = [{}, { work: 'night' }, { bed: 'b24', when: 'dinner' }, { bed: 'late', level: 2, limits: { knees: true, back: true } }, { food: 'nonveg', bed: 'b22' }, { food: 'egg', when: 'morning' }, { food: 'jain', level: 1 }];
  const LOG = { [ago(29)]: { ck: { move: 'd' }, min: 30 }, [ago(28)]: { plate: { half: true }, ck: { food: 'p' } }, [ago(27)]: { r: ['calm', 'strength'], str: true }, [ago(26)]: { ck: { sleep: 'n', iron: 'd', cramps: 'd' } } };
  const snap = (page) => page.evaluate(() => { const S = window.Saathi; return JSON.stringify({ pk: S.plan.packOf(), acts: S.plan.actions() || [] }); });
  let diffs = 0, n = 0; const show = [];
  for (const st of Object.keys(STAGES)) for (const g of GOALS[st]) for (let vi = 0; vi < VARY.length; vi++) {
    if (vi > 2 && (st === 'post60' || st === 'ttc')) continue;
    const pk = PACK(st, g); const sd = { dob: st === 'meno' ? '1976-03-01' : '1996-05-01', situation: STAGES[st], events: st === 'preg' || st.indexOf('post') === 0 ? [] : regular(10), intake: { goal: g, stage: st.replace('60', '') }, mods: { plan: planOf(pk, g, ago(30), Object.assign({ log: LOG, intake: { goal: g, stage: st.replace('60', ''), skips: 'y', pads: 'p12', pain: 'stop' } }, VARY[vi])) } };
    const A = await open({ seed: sd }), B = await open({ seed: sd, page: other });
    for (let day = -30; day <= 70; day += (vi ? 3 : 1)) {
      for (const x of [A, B]) { await x.page.clock.setFixedTime(at(day, '20:30')); await x.page.evaluate(() => window.Saathi.render()); await sleep(5); }
      const sa = await snap(A.page), sb = await snap(B.page); n++;
      if (sa !== sb) { diffs++; if (show.length < 6) show.push([st, g, vi, day, sa.slice(0, 300), sb.slice(0, 300)]); }
    }
    /* the pages that draw from the plan: My plan, Today's card, the doctor summary */
    for (const day of (vi ? [] : [0, 1, 13, 41, 55])) {
      const pp = [];
      for (const x of [A, B]) { await x.page.clock.setFixedTime(at(day, '20:30')); await go(x.page, 'plan'); const t1 = (await vtext(x.page)).replace(/\s+/g, ' '); await go(x.page, 'home'); const t2 = (await vtext(x.page)).replace(/\s+/g, ' '); const sm = await x.page.evaluate(() => JSON.stringify((window.Saathi.summaries ? window.Saathi.summaries() : []).filter((m) => m.mod === 'plan'))); pp.push(t1 + '\n' + t2 + '\n' + sm); }
      n++; if (pp[0] !== pp[1]) { diffs++; if (show.length < 6) show.push([st, g, vi, 'pages day ' + day, pp[0].slice(0, 300), pp[1].slice(0, 300)]); }
    }
    errsAll.push(...A.errs, ...B.errs); await A.ctx.close(); await B.ctx.close();
  }
  /* her plan screen before she starts: the steps list, the doctor card and the title, for every goal and its answers */
  const ANS = [{}, { skips: 'y' }, { gap: 'vary' }, { pads: 'p12' }, { pain: 'stop' }, { work: 'night' }, { bed: 'b24' }];
  for (const st of ['cycle', 'ttc', 'preg', 'post', 'meno']) for (const g of GOALS[st]) {
    const sd = { dob: st === 'meno' ? '1976-03-01' : '1996-05-01', situation: STAGES[st], events: st === 'preg' || st === 'post' ? [] : regular(10) };
    const X = [await open({ seed: sd }), await open({ seed: sd, page: other })];
    for (const an of ANS) {
      const pages = [];
      for (const x of X) {
        const cnt = await x.page.evaluate((a) => window.Saathi.plan.intake.count(a), { stage: st, goal: g });
        await x.page.evaluate((a) => { const S = window.Saathi; S.plan.startFromIntake(a); S.save(); }, Object.assign({ stage: st, goal: g, gap: 'g45', skips: 'n', dx: 'n', signs: ['acne'], pain: 'pk', painDays: '23', pads: 'p23', clots: 'n', tired: 'n', pms: ['mood'], pmsLevel: 'lot', act: 0, food: 'veg', milk: 'y', lim: [], bed: 'b23', work: 'day', when: 'evening' }, an));
        let all = 'screens ' + cnt;
        for (let k = 0; k < 6; k++) { await x.page.evaluate((i) => { window.Saathi.mem.rvCard = i; }, k); await go(x.page, 'plan-reveal'); all += '\n' + (await vtext(x.page)).replace(/\s+/g, ' '); }
        pages.push(all);
      }
      n++; if (pages[0] !== pages[1]) { diffs++; if (show.length < 10) show.push([st, g, JSON.stringify(an), 'reveal', pages[0].slice(0, 400), pages[1].slice(0, 400)]); }
    }
    for (const x of X) { errsAll.push(...x.errs); await x.ctx.close(); }
  }
  console.log('EQUIV ' + n + ' comparisons, ' + diffs + ' differences');
  show.forEach((x) => console.log('EQUIV DIFF ' + x.slice(0, 4).join(' ') + '\n  new ' + x[4] + '\n  old ' + x[5]));
  check('6 --equiv: every plan, goal, day and answer matches ' + EQ + ' (' + n + ' comparisons)', diffs === 0, diffs + ' differences');
}
check('no page errors', errsAll.length === 0, errsAll.slice(0, 5));

await browser.close();
const failed = results.filter((r) => !r.pass);
if (!RECORD) console.log(results.length - failed.length + '/' + results.length + ' checks passed');
if (failed.length) process.exit(1);
