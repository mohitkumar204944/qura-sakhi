// Fast smoke test of a folder with index.html + all modules wired: every route, 7 sample setups, EN + HI,
// plus discreet mode and prototype labels on. No clicks. Also: every screen at the phone's largest text (200%), and every
// Learn article the code links to exists (audit fixes 11 and 30), and no object names the same key twice.
// Usage: node test/smoke.mjs <dir-relative-to-this-app-folder>
import fs from 'node:fs';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dupKeys } from './dupkeys.mjs';
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
    const res = await page.evaluate((r) => { location.hash = '#' + r; window.Saathi.render(); const v = document.getElementById('view'); const t = (v.innerText || '').trim(); return { len: t.length, err: !!v.querySelector('[data-crash]'), over: document.documentElement.scrollWidth > window.innerWidth + 1 }; }, r);
    if (errs.length > before) problems.push(where + ': ' + errs.slice(before).join(' / '));
    else if (res.err) problems.push(where + ': render error');
    else if (res.len < 20 && su.p !== 'browse') problems.push(where + ': empty');
    if (res.over) problems.push(where + ': overflow');
  }
}
/* The phone's largest text (audit fix 11): Android passes its font size to the WebView (textZoom), up to 200%. Every
   element's text doubled on a 360 px phone, and no screen may scroll sideways. */
await page.setViewportSize({ width: 360, height: 760 });
for (const lang of ['en', 'hi']) {
  await page.evaluate((lang) => { const S = window.Saathi; S.reset(); if (S.account) S.account._testSignIn(); S.loadSample('priya'); S.state.lang = lang; S.save(); }, lang);
  for (const r of ['home', 'care', 'me', 'learn', 'help', 'checkin', 'diary', 'report', 'ask', 'tell', 'account', 'me-privacy', 'me-health', 'me-reminders', 'me-data', 'me-look', 'me-help', 'me-about', ...info.routes]) {
    const over = await page.evaluate((r) => {
      location.hash = '#' + r; window.Saathi.render();
      const els = Array.from(document.querySelectorAll('#app, #app *')).filter((el) => !(el instanceof SVGElement));
      const sizes = els.map((el) => parseFloat(getComputedStyle(el).fontSize));
      els.forEach((el, i) => el.style.setProperty('font-size', sizes[i] * 2 + 'px', 'important'));
      const o = document.documentElement.scrollWidth > window.innerWidth + 1;
      els.forEach((el) => el.style.removeProperty('font-size'));
      return o;
    }, r);
    if (over) problems.push(lang + ' #' + r + ': scrolls sideways with the phone\'s text at 200%');
  }
  /* Version 39.17 (Diary audit R10): the Diary's Cycles and Days tabs and the day page (with "More signs" open), at 200% too */
  for (const step of ['tr', 'days', 'day']) {
    const over = await page.evaluate((step) => {
      const S = window.Saathi; location.hash = '#diary'; S.mem.diaryTab = step === 'day' ? 'cal' : step; S.render();
      if (step === 'day') S.openDay(S.toISO(S.today()), 'more');
      const els = Array.from(document.querySelectorAll('#app, #app *, #sheet-root, #sheet-root *')).filter((el) => !(el instanceof SVGElement));
      const sizes = els.map((el) => parseFloat(getComputedStyle(el).fontSize));
      els.forEach((el, i) => el.style.setProperty('font-size', sizes[i] * 2 + 'px', 'important'));
      const sh = document.querySelector('#sheet-root .sheet');
      const o = document.documentElement.scrollWidth > window.innerWidth + 1 || (!!sh && sh.scrollWidth > sh.clientWidth + 1);
      els.forEach((el) => el.style.removeProperty('font-size'));
      if (sh) S.closeSheet(); S.mem.diaryTab = 'cal';
      return o;
    }, step);
    if (over) problems.push(lang + ' diary ' + step + ': scrolls sideways with the phone\'s text at 200%');
  }
}
await browser.close();
/* Every article key the code names (group.id, quoted, e.g. 'pregnancy.danger-signs-call-112') must be in content.json */
if (fs.existsSync(content)) {
  const lib = JSON.parse(fs.readFileSync(content, 'utf8')); const groups = lib.groups.map((g) => g.group);
  const ids = new Set(lib.groups.flatMap((g) => (g.articles || []).map((a) => g.group + '.' + a.id)));
  const pat = new RegExp('[\'"`#](?:a-)?((?:' + groups.join('|') + ')\\.[a-z0-9_-]+)[\'"`]', 'g'); let named = 0;
  for (const f of ['app.js'].concat(fs.readdirSync(path.join(root, 'mods')).filter((x) => x.endsWith('.js')).map((x) => 'mods/' + x))) {
    for (const m of fs.readFileSync(path.join(root, f), 'utf8').matchAll(pat)) { named++; if (!ids.has(m[1])) problems.push(f + ': links to a missing article ' + m[1]); }
  }
  if (named < 30) problems.push('article link check found only ' + named + ' links: has the key format changed?');
}
/* No string or setting is named twice in one object: the second would silently replace the first */
for (const x of dupKeys(root)) problems.push(x);
console.log(JSON.stringify({ mods: info.mods.length, routes: info.routes.length, tiles: info.tiles, setups: setups.length }));
console.log(problems.length ? problems.slice(0, 60).join('\n') + (problems.length > 60 ? '\n… ' + (problems.length - 60) + ' more' : '') : 'SMOKE OK: no errors, no empty screens, no overflow');
if (problems.length) process.exitCode = 1;   /* Version 39.0: a problem fails the run */
