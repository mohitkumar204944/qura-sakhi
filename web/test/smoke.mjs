// Fast smoke test of a folder with index.html + all modules wired: every route, 7 sample setups, EN + HI,
// plus discreet mode and prototype labels on. No clicks.
// Usage: node test/smoke.mjs <dir-relative-to-this-app-folder>
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', process.argv[2] || '.');
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const content = path.join(root, 'content.json');
if (fs.existsSync(content)) await ctx.addInitScript('window.SAKHI_CONTENT = ' + fs.readFileSync(content, 'utf8') + ';');
const page = await ctx.newPage();
const errs = []; let where = '';
page.on('pageerror', (e) => errs.push(where + ' :: ' + String(e.message).slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error' && !/content\.json|Failed to load|net::|fonts/.test(m.text())) errs.push(where + ' :: ' + m.text().slice(0, 200)); });
await page.goto(pathToFileURL(path.join(root, 'index.html')).href + '#home', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => !!window.Saathi);
const info = await page.evaluate(() => { const S = window.Saathi; const r = []; S.modules.forEach((m) => { Object.keys(m.routes || {}).forEach((x) => r.push(x)); (m.testRoutes || []).slice(0, 4).forEach((x) => r.push(x)); }); S.sections.forEach((s) => r.push('topic-' + s)); return { mods: S.modules.map((m) => m.id), routes: r, tiles: S.tiles().length }; });
const problems = [];
const setups = [];
for (const p of ['blank', 'browse', 'priya', 'asha', 'meera', 'sunita', 'kamla']) for (const lang of ['en', 'hi']) setups.push({ p, lang });
setups.push({ p: 'priya', lang: 'en', discreet: true }, { p: 'meera', lang: 'hi', discreet: true }, { p: 'asha', lang: 'en', proto: true });
for (const su of setups) {
  await page.evaluate((su) => { const S = window.Saathi; S.reset(); if (S.account) S.account._testSignIn(); if (su.p === 'blank') { S.state.stage = 'app'; S.state.consent.c1 = '2026-01-01'; S.state.dob = '1994-01-01'; } else if (su.p === 'browse') S.state.stage = 'browse'; else S.loadSample(su.p); S.state.lang = su.lang; S.state.settings.discreet = !!su.discreet; S.state.settings.proto = !!su.proto; S.save(); }, su);
  for (const r of ['home', 'care', 'me', 'learn', 'help', 'checkin', 'diary', 'account', 'me-privacy', 'me-health', 'me-reminders', 'me-data', 'me-look', 'me-help', 'me-about', ...info.routes]) {
    where = su.p + ' ' + su.lang + (su.discreet ? ' discreet' : '') + (su.proto ? ' proto' : '') + ' #' + r; const before = errs.length;
    const res = await page.evaluate((r) => { location.hash = '#' + r; window.Saathi.render(); const v = document.getElementById('view'); const t = (v.innerText || '').trim(); return { len: t.length, err: /hit an error in the prototype/.test(t), over: document.documentElement.scrollWidth > window.innerWidth + 1 }; }, r);
    if (errs.length > before) problems.push(where + ': ' + errs.slice(before).join(' / '));
    else if (res.err) problems.push(where + ': render error');
    else if (res.len < 20 && su.p !== 'browse') problems.push(where + ': empty');
    if (res.over) problems.push(where + ': overflow');
  }
}
await browser.close();
console.log(JSON.stringify({ mods: info.mods.length, routes: info.routes.length, tiles: info.tiles, setups: setups.length }));
console.log(problems.length ? problems.slice(0, 60).join('\n') + (problems.length > 60 ? '\n… ' + (problems.length - 60) + ' more' : '') : 'SMOKE OK: no errors, no empty screens, no overflow');
