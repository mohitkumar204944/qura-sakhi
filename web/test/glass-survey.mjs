// Version 39.50, the glass look: a survey, not pass/fail. Every route for 5 sample women, light and dark, plus the sheets most
// used: it lists each surface still painted solid (a rounded or shadowed box, 100 x 36 px or more, fully opaque) by its classes
// and colour, with how often and one route where it shows, and any opaque panel 300 x 300 px or more that hides the scene.
// Read it with the glass block in app.css: her coloured, urgent and highlight surfaces are meant to stay solid.
// Usage: node test/glass-survey.mjs [dir]   (dir defaults to this app folder; the report goes to test/shots/glass-survey.txt)
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 360, height: 800 } });
const content = path.join(root, 'content.json');
if (fs.existsSync(content)) await ctx.addInitScript('window.SAKHI_CONTENT = ' + fs.readFileSync(content, 'utf8') + ';');
const page = await ctx.newPage();
await page.goto(pathToFileURL(path.join(root, 'index.html')).href + '#home', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => !!window.Saathi);
const info = await page.evaluate(() => { const S = window.Saathi; const r = []; S.modules.forEach((m) => { Object.keys(m.routes || {}).forEach((x) => r.push(x)); (m.testRoutes || []).slice(0, 4).forEach((x) => r.push(x)); }); S.sections.forEach((s) => r.push('topic-' + s)); return r; });
const ROUTES = Array.from(new Set(['home', 'care', 'me', 'learn', 'help', 'checkin', 'diary', 'report', 'ask', 'tell', 'account', 'me-privacy', 'me-health', 'me-reminders', 'me-data', 'me-look', 'me-help', 'me-about', ...info]));
const found = {}; const panels = {};
const note = (bag, k, where) => { if (!bag[k]) bag[k] = { n: 0, where }; bag[k].n++; };
/* what is still solid on the screen now */
const survey = () => page.evaluate(() => {
  const al = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return 0; const p = m[1].split(',').map(Number); return p.length > 3 ? p[3] : 1; };
  const col = (c) => (c.match(/[\d.]+/g) || []).slice(0, 3).map((x) => Math.round(+x)).join(',');
  const out = [], big = [];
  [document.getElementById('view'), document.getElementById('sheet-root')].filter(Boolean).forEach((rt) => rt.querySelectorAll('*').forEach((el) => {
    if (el instanceof SVGElement || /^(INPUT|SELECT|TEXTAREA|IMG|CANVAS|VIDEO|OPTION)$/.test(el.tagName)) return;
    if (el.classList.contains('btn') || el.classList.contains('chip') || el.classList.contains('iconbtn')) return;
    const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const r = el.getBoundingClientRect(); if (r.width < 100 || r.height < 36) return;
    if (al(cs.backgroundColor) < 0.999 || cs.backgroundImage !== 'none') return;
    const key = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '') + ' [' + col(cs.backgroundColor) + ']';
    if (r.width >= 300 && r.height >= 300) big.push(key.slice(0, 120));
    if ((parseFloat(cs.borderTopLeftRadius) || 0) >= 8 || cs.boxShadow !== 'none') out.push(key.slice(0, 120));
  }));
  return { out, big };
});
for (const theme of ['light', 'dark']) {
  for (const p of ['priya', 'asha', 'meera', 'sunita', 'kamla', 'blank']) {
    await page.evaluate((a) => { const S = window.Saathi; S.reset(); if (S.account) S.account._testSignIn(); if (a.p === 'blank') { S.state.stage = 'app'; S.state.consent.c1 = '2026-01-01'; S.state.dob = '1994-01-01'; } else S.loadSample(a.p); S.state.settings.theme = a.theme; S.state.settings.toursAuto = false; S.save(); document.documentElement.dataset.theme = a.theme; }, { p, theme });
    for (const r of ROUTES) {
      const res = await page.evaluate((r) => { try { location.hash = '#' + r; window.Saathi.render(); return true; } catch (e) { return false; } }, r);
      if (!res) continue;
      const s = await survey(); const where = theme + ' ' + p + ' #' + r;
      s.out.forEach((k) => note(found, theme + ' | ' + k, where)); s.big.forEach((k) => note(panels, theme + ' | ' + k, where));
    }
    /* the sheets most used: a day, Help, the stage */
    for (const [name, fn] of [['day sheet', 'S.openDay(S.toISO(S.today()), "more")'], ['day sheet, a past day', 'S.openDay(S.toISO(S.addDays(S.today(), -3)))']]) {
      await page.evaluate((fn) => { const S = window.Saathi; location.hash = '#diary'; S.render(); try { eval(fn); } catch (e) {} }, fn);
      const s = await survey(); s.out.forEach((k) => note(found, theme + ' | ' + k, theme + ' ' + p + ' ' + name)); s.big.forEach((k) => note(panels, theme + ' | ' + k, theme + ' ' + p + ' ' + name));
      await page.evaluate(() => { const S = window.Saathi; if (S.closeSheet) S.closeSheet(true); });
    }
    await page.evaluate(() => { const S = window.Saathi; location.hash = '#home'; S.render(); const b = document.querySelector('#topbar .sosbtn, #topbar [data-go="help"], #topbar button'); if (b) b.click(); });
    const s = await survey(); s.out.forEach((k) => note(found, theme + ' | ' + k, theme + ' ' + p + ' topbar Help')); s.big.forEach((k) => note(panels, theme + ' | ' + k, theme + ' ' + p + ' topbar Help'));
    await page.evaluate(() => { const S = window.Saathi; if (S.closeSheet) S.closeSheet(true); });
  }
}
await browser.close();
const fmt = (bag) => Object.entries(bag).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => String(v.n).padStart(5) + '  ' + k + '   e.g. ' + v.where).join('\n');
const report = 'Routes: ' + ROUTES.length + '\n\n== Solid rounded or shadowed surfaces (100 x 36 px or more)\n' + fmt(found) + '\n\n== Opaque panels 300 x 300 px or more\n' + fmt(panels) + '\n';
fs.writeFileSync(path.join(here, 'shots', 'glass-survey.txt'), report);
console.log('GLASS SURVEY: ' + Object.keys(found).length + ' solid kinds, ' + Object.keys(panels).length + ' panels; test/shots/glass-survey.txt');
