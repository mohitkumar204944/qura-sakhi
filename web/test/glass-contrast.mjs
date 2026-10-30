// Version 39.50, the glass look: every line of text's contrast, light and dark, on all routes for 5 sample women, against what
// is really behind it: the layers under it (a glass card, a sheet, its dim backdrop), then the scene's worst point. A bar's text
// is also checked over an ink card scrolling under it. 4.5 is needed, or 3 for large text (24 px, or 18.7 px bold).
// With the last commit's web folder as the second argument it fails only on contrast that the glass made worse, and lists what
// it made better; with one folder it lists every line under the line (not pass/fail).
// Usage: node test/glass-contrast.mjs [dir] [beforeDir]   (report: test/shots/glass-contrast.txt)
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import { chromium } from './pw.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(here, '..', process.argv[2] || '.');
const BEFORE = process.argv[3] ? path.resolve(process.argv[3]) : null;
const SAMPLES = process.env.GC_SAMPLES ? process.env.GC_SAMPLES.split(',') : ['priya', 'sunita', 'meera', 'kamla', 'blank'];
const lumOf = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
/* a PNG screenshot's pixels (8-bit RGB or RGBA, filters 0 to 4) */
const png = (buf) => {
  let pos = 8, w = 0, h = 0, ct = 2; const idat = [];
  while (pos < buf.length) { const len = buf.readUInt32BE(pos); const type = buf.toString('ascii', pos + 4, pos + 8); const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); ct = data[9]; } else if (type === 'IDAT') idat.push(data); else if (type === 'IEND') break; pos += 12 + len; }
  const raw = zlib.inflateSync(Buffer.concat(idat)); const bpp = ct === 6 ? 4 : 3; const st = w * bpp; const out = Buffer.alloc(h * st);
  for (let y = 0; y < h; y++) { const f = raw[y * (st + 1)]; const o = y * (st + 1) + 1;
    for (let x = 0; x < st; x++) { const a = x >= bpp ? out[y * st + x - bpp] : 0, b = y ? out[(y - 1) * st + x] : 0, c = x >= bpp && y ? out[(y - 1) * st + x - bpp] : 0; let v = raw[o + x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1; else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : (pb <= pc ? b : c); }
      out[y * st + x] = v & 255; } }
  return { w, h, px: (x, y) => { const i = y * st + x * bpp; return [out[i], out[i + 1], out[i + 2], 1]; } };
};
/* in the page: each line of text against the layers under it, then the given bases (the scene, or the page's own colour) */
function auditPage(o) {
  const parse = (c) => { const m = c && c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const over = (t, u) => [0, 1, 2].map((i) => t[i] * t[3] + u[i] * (1 - t[3])).concat([1]);
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const out = []; let n = 0;
  [document.getElementById('app'), document.getElementById('sheet-root')].filter(Boolean).forEach((rt) => rt.querySelectorAll('*').forEach((el) => {
    if (el instanceof SVGElement || !Array.from(el.childNodes).some((t) => t.nodeType === 3 && t.textContent.trim().length > 1)) return;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') return;
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
    let op = 1; for (let e = el; e && e !== document.documentElement; e = e.parentElement) op *= parseFloat(getComputedStyle(e).opacity); if (op < 0.9) return;   /* disabled or fading */
    const layers = []; let bases = null; let bar = false;
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      if (e.classList.contains('topbar') || e.classList.contains('tabbar')) bar = true;
      const s = getComputedStyle(e); const img = s.backgroundImage;
      const stops = /gradient/.test(img || '') ? (img.match(/rgba?\([^)]+\)/g) || []).map(parse) : [];
      if (stops.length && stops.every((c) => c[3] >= 0.99)) { bases = stops; break; }
      const bg = parse(s.backgroundColor);
      if (bg && bg[3] >= 0.99) { bases = [bg]; break; }
      if (bg && bg[3] > 0.01) layers.push(bg);
    }
    if (!bases) bases = o.scene.slice();
    if (bar) bases = bases.concat([o.ink]);
    const fg0 = parse(cs.color); if (!fg0) return;
    const size = parseFloat(cs.fontSize), wt = parseInt(cs.fontWeight, 10) || 400; const need = size >= 24 || (size >= 18.66 && wt >= 700) ? 3 : 4.5;
    let worst = 99;
    bases.forEach((b) => { let c = b; for (let i = layers.length - 1; i >= 0; i--) c = over(layers[i], c); const fg = fg0[3] < 1 ? over(fg0, c) : fg0; worst = Math.min(worst, ratio(fg, c)); });
    n++;
    if (worst < need) { const txt = Array.from(el.childNodes).filter((t) => t.nodeType === 3).map((t) => t.textContent.trim()).join(' ').slice(0, 34);
      out.push({ k: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '') + ' "' + txt + '"', r: Math.round(worst * 100) / 100, need }); }
  }));
  return { out, n };
}
async function audit(root) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 } });
  const content = path.join(root, 'content.json'); if (fs.existsSync(content)) await ctx.addInitScript('window.SAKHI_CONTENT = ' + fs.readFileSync(content, 'utf8') + ';');
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href + '#home', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi);
  const routes = await page.evaluate(() => { const S = window.Saathi; const r = ['home', 'care', 'me', 'learn', 'help', 'checkin', 'diary', 'report', 'ask', 'tell', 'account', 'me-privacy', 'me-health', 'me-reminders', 'me-data', 'me-look', 'me-help', 'me-about']; S.modules.forEach((m) => { Object.keys(m.routes || {}).forEach((x) => r.push(x)); (m.testRoutes || []).slice(0, 4).forEach((x) => r.push(x)); }); S.sections.forEach((s) => r.push('topic-' + s)); return Array.from(new Set(r)); });
  const fails = {}; let texts = 0;
  for (const theme of ['light', 'dark']) {
    const load = (p) => page.evaluate((a) => { const S = window.Saathi; S.reset(); if (S.account) S.account._testSignIn(); if (a.p === 'blank') { S.state.stage = 'app'; S.state.consent.c1 = '2026-01-01'; S.state.dob = '1994-01-01'; } else S.loadSample(a.p); S.state.settings.theme = a.theme; S.state.settings.toursAuto = false; S.save(); document.documentElement.dataset.theme = a.theme; location.hash = '#home'; S.render(); }, { p, theme });
    /* the scene's darkest and lightest points in the content column (on the last commit, the page behind #app) */
    await load('blank');
    await page.evaluate(() => Array.from(document.body.children).forEach((e) => { e.dataset.gcVis = e.style.visibility; e.style.visibility = 'hidden'; }));   /* everything but the scene: the app, sheets, toasts */
    const im = png(await page.screenshot()); await page.evaluate(() => Array.from(document.body.children).forEach((e) => { e.style.visibility = e.dataset.gcVis || ''; delete e.dataset.gcVis; }));
    let lo = null, hi = null;
    for (let y = 0; y < im.h; y += 3) for (let x = 16; x < im.w - 16; x += 3) { const c = im.px(x, y); const l = lumOf(c); if (!lo || l < lumOf(lo)) lo = c; if (!hi || l > lumOf(hi)) hi = c; }
    if (process.env.GC_DEBUG) console.log(path.basename(path.dirname(root)), theme, 'scene', lo, hi);
    const ink = await page.evaluate(() => { const v = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim(); const h = v.replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).concat([1]); });
    for (const p of SAMPLES) {
      await load(p);
      for (const r of routes) {
        const ok = await page.evaluate((x) => { try { location.hash = '#' + x; window.Saathi.render(); return true; } catch (e) { return false; } }, r);
        if (!ok) continue;
        const res = await page.evaluate(auditPage, { scene: [lo, hi], ink });
        texts += res.n;
        res.out.forEach((f) => { const k = theme + ' | ' + f.k; if (!fails[k] || f.r < fails[k].r) fails[k] = { r: f.r, need: f.need, where: p + ' #' + r, n: (fails[k] ? fails[k].n : 0) + 1 }; else fails[k].n++; });
      }
    }
  }
  await browser.close();
  return { fails, texts };
}

const now = await audit(DIR);
const lines = []; let bad = 0;
const fmt = ([k, v]) => '  ' + String(v.r).padStart(5) + ' / ' + v.need + '  ' + k + '  (' + v.n + 'x, e.g. ' + v.where + ')';
if (BEFORE) {
  const was = await audit(BEFORE);
  const worse = Object.entries(now.fails).filter(([k, v]) => !was.fails[k] || v.r < was.fails[k].r - 0.05);
  const better = Object.entries(was.fails).filter(([k, v]) => !now.fails[k] || now.fails[k].r > v.r + 0.05);
  bad = worse.length;
  lines.push('Lines of text checked: ' + now.texts + ' now, ' + was.texts + ' on the last commit.', '',
    '== Made worse by the glass (' + worse.length + ')', ...worse.sort((a, b) => a[1].r - b[1].r).map(fmt), '',
    '== Made better (' + better.length + ')', ...better.slice(0, 40).map(([k, v]) => '  ' + v.r + ' -> ' + (now.fails[k] ? now.fails[k].r : 'passes') + '  ' + k), '',
    '== Under the line both before and after (' + Object.keys(now.fails).filter((k) => was.fails[k]).length + ', not the glass)', ...Object.entries(now.fails).filter(([k]) => was.fails[k]).sort((a, b) => a[1].r - b[1].r).slice(0, 60).map(fmt));
} else {
  lines.push('Lines of text checked: ' + now.texts, '', '== Under the line (' + Object.keys(now.fails).length + ')', ...Object.entries(now.fails).sort((a, b) => a[1].r - b[1].r).map(fmt));
}
fs.mkdirSync(path.join(here, 'shots'), { recursive: true });
fs.writeFileSync(path.join(here, 'shots', 'glass-contrast.txt'), lines.join('\n') + '\n');
console.log(lines.slice(0, 3).join('\n'));
console.log(BEFORE ? (bad ? 'GLASS CONTRAST FAIL: ' + bad + ' made worse (test/shots/glass-contrast.txt)' : 'GLASS CONTRAST OK: nothing made worse (test/shots/glass-contrast.txt)') : 'GLASS CONTRAST: report in test/shots/glass-contrast.txt');
process.exit(bad ? 1 : 0);
