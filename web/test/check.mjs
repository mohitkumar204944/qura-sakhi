// Headless check for Saathi modules.
// Usage: node test/check.mjs <modId[,modId...]|all> [--shots] [--quick]
//   Renders every route a module registers (plus its testRoutes) for each sample persona in EN and HI,
//   clicks every button once, and reports page errors, raw string keys, untranslated Hindi text,
//   horizontal overflow, empty screens and links to routes that don't exist.
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';


const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const argv = process.argv.slice(2);
const want = (argv.find((a) => !a.startsWith('--')) || 'all');
const SHOTS = argv.includes('--shots');
const QUICK = argv.includes('--quick');

const ORDER = JSON.parse(fs.readFileSync(path.join(root, 'mods', 'order.json'), 'utf8'));
const available = ORDER.filter((id) => fs.existsSync(path.join(root, 'mods', id + '.js')));
const ids = want === 'all' ? available : want.split(',').map((s) => s.trim()).filter(Boolean);
const missing = ids.filter((id) => !fs.existsSync(path.join(root, 'mods', id + '.js')));
if (missing.length) { console.log('MISSING module files: ' + missing.join(', ')); }
const loadIds = want === 'all' ? available : [...new Set([...available.filter((id) => ids.includes(id)), ...ids.filter((id) => fs.existsSync(path.join(root, 'mods', id + '.js')))])];
const AGREED = JSON.parse(fs.readFileSync(path.join(root, 'mods', 'routes.json'), 'utf8'));

const harness = path.join(root, 'test', '_h_' + ids.join('_').slice(0, 60) + '.html');
const idx = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
  .replace(/<!-- MODULES:START -->[\s\S]*<!-- MODULES:END -->/, loadIds.map((id) => '<script src="mods/' + id + '.js" charset="utf-8"></script>').join('\n'))
  .replace(/https:\/\/fonts\.googleapis\.com[^"]*/, 'about:blank');
// The harness lives in test/ so paths need ../
fs.writeFileSync(harness, idx.replace(/(href|src)="(?!https?:|about:)([^"]+)"/g, (m, a, p) => a + '="../' + p + '"'));
const url = pathToFileURL(harness).href;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errors = [];
let curCtx = '';
page.on('pageerror', (e) => errors.push({ where: curCtx, msg: String(e && e.message || e).slice(0, 300) }));
page.on('console', (m) => { if (m.type() === 'error') { const tx = m.text(); if (!/content\.json|Failed to load resource|ERR_FILE_NOT_FOUND|net::|fonts/.test(tx)) errors.push({ where: curCtx, msg: tx.slice(0, 300) }); } });
page.on('dialog', (d) => d.dismiss().catch(() => {}));

await page.goto(url + '#home', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => !!window.Saathi);

const reg = await page.evaluate((ids) => {
  const S = window.Saathi; const out = {};
  ids.forEach((id) => {
    const m = S.modules.find((x) => x.id === id);
    if (!m) { out[id] = null; return; }
    const en = Object.keys((m.strings || {}).en || {}); const hi = Object.keys((m.strings || {}).hi || {});
    out[id] = {
      routes: Object.keys(m.routes || {}), prefixes: Object.keys(m.prefixes || {}), testRoutes: m.testRoutes || [], tiles: (m.tiles || []).map((t) => t.route),
      retired: Object.keys(m.routes || {}).concat(m.testRoutes || []).filter((r) => S.retired && S.retired(r)),   /* Version 39.68: retired pages redirect, so they aren't rendered */
      badKeys: en.filter((k) => !k.startsWith(id + '_')).slice(0, 20), missingHi: en.filter((k) => hi.indexOf(k) < 0).slice(0, 40), missingEn: hi.filter((k) => en.indexOf(k) < 0).slice(0, 20),
      badRoutes: Object.keys(m.routes || {}).filter((r) => !(r === id || r.startsWith(id + '-'))), demoPersona: m.demoPersona || 'asha', hooks: ['home', 'me', 'summary', 'under18', 'sample', 'afterRender', 'beforeRender', 'topbar'].filter((h) => typeof m[h] === 'function')
    };
  });
  return out;
}, ids);

const report = { modules: {}, errors };
for (const id of ids) report.modules[id] = { registration: reg[id], issues: [] };
const unregistered = ids.filter((id) => !reg[id]);
unregistered.forEach((id) => report.modules[id].issues.push('module did not register (syntax error or exception at load?)'));

const personas = QUICK ? ['asha', 'meera'] : ['blank', 'browse', 'priya', 'asha', 'meera', 'sunita', 'kamla'];
const langs = ['en', 'hi'];

async function setup(persona, lang) {
  await page.evaluate(({ persona, lang }) => {
    try { localStorage.clear(); } catch (e) { }
    const S = window.Saathi;
    S.reset(); if (S.account) S.account._testSignIn(); if (persona === 'blank') { S.state.stage = 'app'; S.state.consent.c1 = S.toISO(S.today()); S.state.dob = '1994-01-01'; }
    else if (persona === 'browse') { S.state.stage = 'browse'; }
    else S.loadSample(persona);
    S.state.lang = lang; S.save();
  }, { persona, lang });
}
async function visit(r) {
  await page.evaluate((r) => { location.hash = '#__x'; location.hash = '#' + r; }, r);
  await page.waitForTimeout(25);
}
async function inspect(lang) {
  return page.evaluate(({ lang, AGREED }) => {
    const S = window.Saathi; const v = document.getElementById('view'); const text = v.innerText || '';
    const keys = new Set(Object.keys(S.strings.en));
    const leaked = (text.match(/[a-z][a-z0-9]*_[a-z0-9_]+/g) || []).filter((w) => keys.has(w));
    const overflow = document.documentElement.scrollWidth > window.innerWidth + 1;
    const wide = []; if (overflow) v.querySelectorAll('*').forEach((el) => { const r = el.getBoundingClientRect(); if (r.right > window.innerWidth + 1 && wide.length < 3) wide.push(el.tagName.toLowerCase() + '.' + (el.className || '').toString().slice(0, 30)); });
    let latin = [];
    if (lang === 'hi') {
      const w = document.createTreeWalker(v, NodeFilter.SHOW_TEXT); let n;
      while ((n = w.nextNode())) { const s = n.nodeValue.trim(); if (/[A-Za-z]+(\s+[A-Za-z,.'’()-]+){6,}/.test(s) && !/[ऀ-ॿ]/.test(s)) latin.push(s.slice(0, 70)); }
    }
    const dead = []; v.querySelectorAll('[data-go]').forEach((b) => { const g = b.dataset.go; const core = ['home', 'diary', 'learn', 'help', 'me', 'checkin', 'pattern', 'fertile', 'midlife', 'pregnancy', 'ask', 'tell', 'care', 'library', 'me-privacy', 'me-health', 'me-reminders', 'me-data', 'me-look', 'me-help', 'me-about']; const agreed = AGREED.exact.indexOf(g) >= 0 || Object.keys(AGREED.prefixes).some((p) => g.startsWith(p) && AGREED.prefixes[p].indexOf(g.slice(p.length)) >= 0); const owned = !!S.routeOwner(g) || S.modules.some((m) => Object.keys(m.prefixes || {}).some((p) => g.startsWith(p))); if (core.indexOf(g) < 0 && !g.startsWith('a-') && !g.startsWith('topic-') && !owned && !agreed) dead.push(g); });
    return { len: text.trim().length, leaked: [...new Set(leaked)].slice(0, 8), overflow, wide, latin: latin.slice(0, 4), dead: [...new Set(dead)], fellBackHome: !!v.querySelector('#bignum') || /Period started|पीरियड शुरू/.test(text) && !location.hash.startsWith('#home') };
  }, { lang, AGREED });
}

for (const id of ids) {
  const rg = reg[id]; if (!rg) continue;
  const M = report.modules[id];
  const routes = [...new Set([...rg.routes, ...rg.testRoutes])].filter((r) => rg.retired.indexOf(r) < 0);
  if (rg.badKeys.length) M.issues.push('string keys without "' + id + '_" prefix: ' + rg.badKeys.join(', '));
  if (rg.missingHi.length) M.issues.push('EN keys missing in HI: ' + rg.missingHi.join(', '));
  if (rg.missingEn.length) M.issues.push('HI keys missing in EN: ' + rg.missingEn.join(', '));
  if (rg.badRoutes.length) M.issues.push('routes not prefixed with "' + id + '-": ' + rg.badRoutes.join(', '));
  if (!rg.tiles.length) M.issues.push('no tiles registered for the Care hub');
  const mine = (r) => r === id || r.startsWith(id + '-');
  const agreedMine = AGREED.exact.filter(mine);
  const notDone = agreedMine.filter((r) => rg.routes.indexOf(r) < 0 && !rg.prefixes.some((p) => r.startsWith(p)));
  if (notDone.length) M.issues.push('agreed routes not implemented: ' + notDone.join(', '));
  Object.keys(AGREED.prefixes).filter(mine).forEach((p) => { if (rg.prefixes.indexOf(p) < 0) M.issues.push('agreed prefix not implemented: ' + p + '*'); else { const miss = AGREED.prefixes[p].map((x) => p + x).filter((r) => rg.testRoutes.indexOf(r) < 0); if (miss.length) M.issues.push('add these to testRoutes: ' + miss.slice(0, 12).join(', ') + (miss.length > 12 ? ' …' : '')); } });
  const seen = new Set();
  for (const persona of personas) {
    for (const lang of langs) {
      await setup(persona, lang);
      for (const r of ['care', 'home', ...routes]) {
        curCtx = id + ' ' + persona + ' ' + lang + ' #' + r;
        const before = errors.length;
        await visit(r);
        const res = await inspect(lang);
        const tag = (msg) => { const k = msg + ' @' + r + (lang === 'hi' ? ' [hi]' : ''); if (!seen.has(k)) { seen.add(k); M.issues.push(k + ' (' + persona + ')'); } };
        if (errors.length > before) errors.slice(before).forEach((e) => tag('page error: ' + e.msg));
        if (persona !== 'browse' && res.len < 20 && r !== 'home') tag('empty screen');
        if (res.leaked.length) tag('raw string keys shown: ' + res.leaked.join(', '));
        if (res.overflow) tag('horizontal overflow: ' + res.wide.join(' | '));
        if (res.latin.length) tag('possibly untranslated in Hindi: "' + res.latin[0] + '"');
        if (res.dead.length) tag('links to unknown routes: ' + res.dead.join(', '));
      }
    }
  }
  // click pass: every button / summary / checkbox once, per route, for two personas
  for (const persona of (QUICK ? ['meera'] : [rg.demoPersona, 'blank'])) {
    for (const lang of ['en']) {
      for (const r of routes) {
        await setup(persona, lang); await visit(r);
        const n = await page.evaluate(() => document.querySelectorAll('#view button:not([data-go]), #view summary, #view input[type=checkbox], #view input[type=radio]').length);
        for (let i = 0; i < Math.min(n, 45); i++) {
          curCtx = id + ' click ' + persona + ' #' + r + ' [' + i + ']';
          await setup(persona, lang); await visit(r);
          const before = errors.length; const hashBefore = await page.evaluate(() => location.href);
          const label = await page.evaluate((i) => { const els = document.querySelectorAll('#view button:not([data-go]), #view summary, #view input[type=checkbox], #view input[type=radio]'); const el = els[i]; if (!el) return null; const l = (el.innerText || el.getAttribute('aria-label') || el.id || el.className || el.tagName).toString().trim().slice(0, 40); el.click(); return l; }, i);
          await page.waitForTimeout(30);
          await page.evaluate(() => { const s = document.getElementById('sheet-root'); if (s) { s.querySelectorAll('.sheet button:not([data-go])').forEach((b, k) => { if (k < 6 && !/delete|हटाएँ|delete/i.test(b.innerText)) { try { b.click(); } catch (e) { } } }); s.innerHTML = ''; } });
          const nav = await page.evaluate(() => location.href);
          if (!nav.startsWith('file:')) M.issues.push('click navigated away from the app: "' + label + '" @' + r);
          if (errors.length > before) errors.slice(before).forEach((e) => { const k = 'page error on click "' + label + '" @' + r + ': ' + e.msg; if (!seen.has(k)) { seen.add(k); M.issues.push(k); } });
        }
      }
    }
  }
  if (SHOTS) {
    const dir = path.join(root, 'test', 'shots', id); fs.mkdirSync(dir, { recursive: true });
    for (const lang of langs) {
      await setup(rg.demoPersona, lang);
      for (const r of routes.slice(0, 30)) {
        await visit(r); await page.waitForTimeout(40);
        await page.screenshot({ path: path.join(dir, r.replace(/[^a-z0-9._-]/gi, '_') + '-' + lang + '.png'), fullPage: true });
      }
    }
    M.shots = path.relative(root, dir);
  }
}

await browser.close();
try { fs.unlinkSync(harness); } catch (e) { }
for (const id of ids) {
  const M = report.modules[id];
  const rg = M.registration;
  console.log('\n=== ' + id + ' === ' + (rg ? (rg.routes.length + ' routes, ' + rg.prefixes.length + ' prefixes, ' + rg.testRoutes.length + ' test routes, tiles: ' + rg.tiles.join(' ') + ', hooks: ' + rg.hooks.join(' ')) : 'NOT REGISTERED'));
  if (!M.issues.length) console.log('  OK: no issues found');
  M.issues.slice(0, 80).forEach((x) => console.log('  - ' + x));
  if (M.issues.length > 80) console.log('  ... ' + (M.issues.length - 80) + ' more');
  if (M.shots) console.log('  screenshots: ' + M.shots);
}
fs.writeFileSync(path.join(root, 'test', 'report-' + ids.join('_').slice(0, 60) + '.json'), JSON.stringify(report, null, 1));
/* Version 39.0: a missing file, a module that doesn't register, or any issue fails the run, so npm test stops here */
if (missing.length || ids.some((id) => !report.modules[id] || !report.modules[id].registration || report.modules[id].issues.length)) process.exitCode = 1;
