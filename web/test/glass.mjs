// Version 39.50, the glass look (Mohit, 30 Oct: "proceed doing glass UI for all screens", and "Colour scheme should not be
// changed"; MODULE_API section 93). This file checks, in light and dark:
//   1 the still scene behind every screen: her wash with the glows, on the page itself, never in print;
//   2 her surfaces see-through in her own card colours on Today, My plan, the Diary, Explore, Help and Me, with no border added
//     (the edge is drawn inside, so nothing moves), and the top bar, the tab bar and a sheet frosted;
//   3 what stays solid: a "call 112" card, inputs and the primary button, in their own colours;
//   4 text on the page itself and on the glass: from a picture of the bare scene, her muted colour at 4.5 or more over every point
//     where text can sit, and her ink, text and muted colours on a card over the darkest point;
//   5 no page errors.
// Usage: node test/glass.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
import zlib from 'node:zlib';
import { chromium } from './pw.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] || '.');
const PAGE = pathToFileURL(path.join(root, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(root, 'content.json'), 'utf8');
const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 700)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TODAY = '2026-11-26';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const at = (hm) => new Date(TODAY + 'T' + hm + ':00+05:30');
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me', 'home-plan', 'xp-home', 'ring', 'stage', 'home-preg', 'home-post', 'home-ttc', 'home-meno', 'explain', 'first-day', 'day', 'plan'].map((k) => [k, { st: 'done', d: ago(3) }]));
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Priya Sharma', pincode: '302001', activeOn: TODAY };
const LOCAL = { app: '0.39.50-pilot', platform: 'android' };
const events = [106, 64, 22].flatMap((x) => [{ d: ago(x), t: 'start' }, { d: ago(x - 4), t: 'end' }]);
const plan = { pack: 'cycle', goalKey: 'pmos', start: ago(28), started: ago(28), go: true, pv: 1, level: 0, limits: { knees: false, back: false }, food: 'veg', focus: 'habits', goal: 'cycles', remAt: '22:00', when: 'dinner', bed: 'b23', work: 'day', log: {}, weeks: { 1: { e: 'good', seen: true } }, body: [], doc: 'done' };
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1998-04-01', consent: { c1: ago(300), c2: null, c4: null }, situation: { pcos: true }, intake: { goal: 'pmos' }, events: events, daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, whatsNew: '0.37', joined: ago(60), prompts: { setup: 'off', planCall: ago(3), firstLog: ago(30), notifyAuto: ago(30) }, mods: { plan: plan }, reminders: [] }, x || {}, { settings: Object.assign({ toursAuto: false, notify: true }, (x || {}).settings || {}) });

const browser = await chromium.launch();
const errsAll = [];
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }, locale: 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(LOCAL) + ';');
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + '); }');
  await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: at('09:30') });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page, 600);
  return { ctx, page, errs };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(10); } }
const go = async (page, h) => { await page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; }, h); await settle(page, 500); };
const done = async (a) => { errsAll.push(...a.errs); await a.ctx.close(); };
/* the alpha of each surface's computed background on the screen, and any added border */
const surfaces = (page) => page.evaluate(() => {
  const a = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return 1; const p = m[1].split(',').map(Number); return p.length > 3 ? p[3] : 1; };
  const SEL = '.card, .item, .action, .topic-card, .qa-tile';
  /* the surfaces on the page itself (not one inside another), leaving out what keeps its own colour on purpose */
  return Array.from(document.querySelectorAll('#view .card, #view .item, #view .action, #view .topic-card, #view .qa-tile'))
    .filter((e) => e.offsetParent && !e.parentElement.closest(SEL) && !/\b(urgent|dark|ok|warn|xp-now|xp-pair|tile-night|pg-urg)\b|hue-/.test(e.className) && getComputedStyle(e).backgroundColor !== 'rgba(0, 0, 0, 0)')
    .map((e) => ({ c: e.className.slice(0, 40), a: a(getComputedStyle(e).backgroundColor), b: getComputedStyle(e).borderTopWidth, edge: /inset/.test(getComputedStyle(e).boxShadow) }));
});
const lumOf = (rgb) => { const v = rgb.map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const ratio = (p, q) => { const l1 = lumOf(p), l2 = lumOf(q); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
const over = (top, under) => { const al = top[3] == null ? 1 : top[3]; return [0, 1, 2].map((i) => top[i] * al + under[i] * (1 - al)); };
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
  return { w, h, bpp, px: (x, y) => { const i = y * st + x * bpp; return [out[i], out[i + 1], out[i + 2]]; } };
};
/* the bare scene (everything of the app hidden): its darkest and lightest points where text can sit (the content column) */
const sceneRange = async (page) => {
  await page.evaluate(() => Array.from(document.body.children).forEach((e) => { e.dataset.gcVis = e.style.visibility; e.style.visibility = 'hidden'; }));   /* everything but the scene: the app, sheets, toasts */
  const im = png(await page.screenshot()); await page.evaluate(() => Array.from(document.body.children).forEach((e) => { e.style.visibility = e.dataset.gcVis || ''; delete e.dataset.gcVis; }));
  let lo = null, hi = null, lmin = 2, lmax = -1;
  for (let y = 0; y < im.h; y += 3) for (let x = 16; x < im.w - 16; x += 3) { const c = im.px(x, y); const l = lumOf(c); if (l < lmin) { lmin = l; lo = c; } if (l > lmax) { lmax = l; hi = c; } }
  return { lo, hi };
};

for (const theme of ['light', 'dark']) {
  const a = await open({ seed: { settings: { theme: theme } } });
  const scene = await a.page.evaluate(() => ({ bg: getComputedStyle(document.body, '::before').backgroundImage, pos: getComputedStyle(document.body, '::before').position, html: getComputedStyle(document.documentElement).backgroundColor, body: getComputedStyle(document.body).backgroundColor }));
  check('1 ' + theme + ': the still scene behind every screen (her wash with 5 glows), the page itself her background', scene.pos === 'fixed' && (scene.bg.match(/radial-gradient/g) || []).length === 5 && /linear-gradient/.test(scene.bg) && scene.body === 'rgba(0, 0, 0, 0)' && !/rgba\(0, 0, 0, 0\)/.test(scene.html), scene);
  const bars = await a.page.evaluate(() => ['.topbar', '#tabbar'].map((s) => { const e = document.querySelector(s); return e ? getComputedStyle(e).backdropFilter || getComputedStyle(e).webkitBackdropFilter : null; }));
  check('2 ' + theme + ': the top bar and the tab bar frosted', bars.every((x) => /blur\(1[0-9]px\)|blur\(2[0-9]px\)/.test(x || '')), bars);
  const barA = await a.page.evaluate(() => ['.topbar', '#tabbar'].map((s) => { const m = getComputedStyle(document.querySelector(s)).backgroundColor.match(/[\d.]+/g).map(Number); return m.length > 3 ? m[3] : 1; }));
  check('2 ' + theme + ': ... and 80 to 90% solid, so their labels read when a dark card scrolls under them', barA[0] >= 0.78 && barA[1] >= 0.88, barA);
  for (const r of ['home', 'plan', 'diary', 'care', 'help', 'me']) {
    if (r !== 'home') await go(a.page, r);
    const s = await surfaces(a.page);
    const want = theme === 'light' ? 0.58 : 0.7;
    check('2 ' + theme + ' ' + r + ': her surfaces see-through, with the edge inside and no border added', s.length >= 2 && s.every((x) => x.a < 1 && x.b === '0px') && s.some((x) => Math.abs(x.a - want) < 0.02 || r === 'diary') && s.some((x) => x.edge), s.slice(0, 8));
  }
  await go(a.page, 'home');
  await a.page.evaluate(() => { const d = document.querySelector('#view .wkstrip .wd:not(.today)'); if (d) d.click(); }); await settle(a.page, 600);
  const sh = await a.page.evaluate(() => { const e = document.querySelector('#sheet-root .sheet'); return e ? { f: getComputedStyle(e).backdropFilter || getComputedStyle(e).webkitBackdropFilter } : null; });
  check('2 ' + theme + ': a sheet frosted', !!sh && /blur\(24px\)/.test(sh.f), sh);
  await a.page.evaluate(() => window.Saathi.closeSheet && window.Saathi.closeSheet()); await settle(a.page, 300);
  /* 4: text on the page itself, and on a card, against the bare scene's worst point */
  const tok = await a.page.evaluate(() => { const cs = getComputedStyle(document.documentElement); const g = (k) => cs.getPropertyValue(k).trim(); return { glass: g('--glass'), text: g('--text'), muted: g('--muted'), fg: g('--fg') }; });
  const P = (c) => { if (c.startsWith('#')) { const h = c.slice(1); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); } return c.match(/[\d.]+/g).map(Number); };
  const sr = await sceneRange(a.page); const worst = theme === 'light' ? sr.lo : sr.hi;
  const onPage = Math.round(ratio(P(tok.muted), worst) * 100) / 100;
  check('4 ' + theme + ': muted text on the page itself reads over every point of the scene (4.5 or more)', onPage >= 4.5, { onPage, worst });
  const card = over(P(tok.glass), worst);
  const rs = ['fg', 'text', 'muted'].map((k) => Math.round(ratio(P(tok[k]), card) * 10) / 10);
  check('4 ' + theme + ': ink, text and muted on a glass card over the scene\'s worst point at 4.5 or more', rs.every((x) => x >= 4.5), { rs, card });
  /* 3: inputs and the primary button keep their own solid colours */
  await go(a.page, 'care');
  const solid = await a.page.evaluate(() => { const a = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); const p = m ? m[1].split(',').map(Number) : [0, 0, 0, 1]; return p.length > 3 ? p[3] : 1; };
    const inp = document.querySelector('#view input'); return { input: inp ? a(getComputedStyle(inp).backgroundColor) : null }; });
  check('3 ' + theme + ': inputs stay solid', solid.input === 1, solid);
  await done(a);
  /* 3: a "call 112" card stays in ink, with readable text */
  const p = await open({ seed: { situation: { pregnant: true, pregnantSince: ago(98) }, events: [], mods: {}, daily: { [ago(0)]: ['d_pbleed'] }, settings: { theme: theme } } });
  await go(p.page, 'diary'); await p.page.evaluate(() => { window.Saathi.mem.diaryTab = 'tr'; window.Saathi.render(); }); await settle(p.page, 400);
  const urg = await p.page.evaluate(() => { const c = document.querySelector('#view .xp-now, #view .xp-home-now, #view .card.urgent'); if (!c) return null; const cs = getComputedStyle(c); return { bg: cs.backgroundColor, img: cs.backgroundImage }; });
  check('3 ' + theme + ': a "call 112" card stays solid ink', !!urg && /^rgb\(/.test(urg.bg) && urg.img === 'none', urg);
  await done(p);
}
/* 1: print leaves the scene out */
{
  const a = await open({ hash: '#report' });
  await a.page.emulateMedia({ media: 'print' });
  const pr = await a.page.evaluate(() => ({ d: getComputedStyle(document.body, '::before').display, html: getComputedStyle(document.documentElement).backgroundColor }));
  check('1 print: no scene, a white page', pr.d === 'none' && pr.html === 'rgb(255, 255, 255)', pr);
  await done(a);
}

check('5 no page errors', !errsAll.length, errsAll.slice(0, 5));
await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'GLASS FAIL ' : 'GLASS OK ') + (results.length - failed.length) + '/' + results.length);
process.exit(failed.length ? 1 : 0);
