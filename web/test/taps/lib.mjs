// Tap counter for Qura Sakhi (audit only; nothing in the repo is changed). Each user action goes through tap()/type(), which
// records: the tap, whether she had to scroll to reach it (and how far), the screen she was on, and what changed after it
// (route, onboarding step, sheet, tip, badge, toast).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { chromium } from '../pw.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');   /* web/ */
export const OUT = path.join(ROOT, 'test', 'shots', 'taps');   /* gitignored, like the other walks */
fs.mkdirSync(OUT, { recursive: true });
export const PAGE = pathToFileURL(path.join(ROOT, 'index.html')).href;
const CONTENT = fs.readFileSync(path.join(ROOT, 'content.json'), 'utf8');
export const ANDROID = 'window.__rings = []; window.SakhiAndroid = { schedule(j){ try { window.__rings.push(JSON.parse(j)); } catch (e) {} return 0; }, cancelAll(){}, canNotify(){ return true; }, askNotify(){}, canExactAlarms(){ return true; }, askExactAlarms(){}, speak(){ return true; }, stop(){}, voices(){ return "[]"; }, copy(){ return true; }, haptic(){}, setSecure(){}, setDisguise(){}, isDisguised(){ return false; }, keepAwake(){}, saveState(){ return true; }, loadState(){ return ""; } };';
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const D0 = '2026-10-26';   /* she joins on a Monday morning, as in journey-video.mjs */
export const at = (day, hm) => new Date(new Date(D0 + 'T' + hm + ':00+05:30').getTime() + day * 86400000);
export const iso = (day) => { const d = new Date(D0 + 'T12:00:00+05:30'); d.setDate(d.getDate() + day); return d.toISOString().slice(0, 10); };

/* what interrupts her: a tip (tour), a badge (joy), a sheet, a toast; watched on the whole body */
const WATCH = `(() => {
  window.__ev = [];
  const L = (o) => { o.ms = Date.now(); o.hash = location.hash; window.__ev.push(o); };
  const seen = new WeakSet();
  const scan = () => {
    const tip = document.querySelector('#tour-root .tour-pop'); if (tip && !seen.has(tip)) { seen.add(tip); L({ k: 'tip', h: ((tip.querySelector('#tour-h') || {}).innerText || '').trim(), p: (tip.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 220) }); }
    const bd = document.querySelector('#joy-root [role="dialog"]'); if (bd && !seen.has(bd)) { seen.add(bd); L({ k: 'badge', h: bd.getAttribute('aria-label') || '', p: (bd.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 220) }); }
    const sh = document.querySelector('#sheet-root .sheet'); if (sh && !seen.has(sh)) { seen.add(sh); L({ k: 'sheet', h: ((sh.querySelector('h2') || {}).innerText || '').trim(), p: (sh.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 220) }); }
    const to = document.querySelector('#toast-root .toast'); if (to && !seen.has(to)) { seen.add(to); L({ k: 'toast', h: (to.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 160) }); }
  };
  /* a sheet or tip added and taken away in the same moment never paints: the records still show it */
  const flash = (muts) => { for (const m of muts) for (const n of m.addedNodes) { if (!n.querySelector || n.isConnected) continue; const sh = n.classList && n.classList.contains('sheet') ? n : n.querySelector('.sheet'); if (sh) L({ k: 'sheet-gone', h: ((sh.querySelector('h2') || {}).innerText || sh.textContent || '').trim().slice(0, 80) }); const tp = n.classList && n.classList.contains('tour-pop') ? n : n.querySelector('.tour-pop'); if (tp) L({ k: 'tip-gone', h: (tp.textContent || '').trim().slice(0, 80) }); } };
  const start = () => { new MutationObserver((muts) => { flash(muts); scan(); }).observe(document.body, { childList: true, subtree: true }); };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  window.addEventListener('hashchange', () => L({ k: 'route' }));
})();`;

export async function launch() { return chromium.launch(); }

/* a new phone (o.state null) or a saved one (o.state = the two localStorage strings) */
export async function open(browser, o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, deviceScaleFactor: 1, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(Object.assign({ app: '0.39.26-pilot', platform: 'android' }, o.config || {})) + ';');
  await ctx.addInitScript(ANDROID);
  await ctx.addInitScript(WATCH);
  if (o.state) await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); ' + Object.entries(o.state).map(([k, v]) => 'localStorage.setItem(' + JSON.stringify(k) + ', ' + JSON.stringify(v) + ');').join(' ') + ' }');
  await ctx.route(/^https?:/, (r) => r.abort());
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: o.time || at(0, '09:00') });
  await page.goto(PAGE + '#' + (o.hash || 'home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi);
  const R = new Recorder(page, errs, ctx); await R.settle(600); return R;
}

export class Recorder {
  constructor(page, errs, ctx) { this.page = page; this.errs = errs; this.ctx = ctx; this.steps = []; this.job = null; }
  async settle(ms = 400) { for (let i = 0; i < Math.ceil(ms / 100); i++) { await this.page.clock.runFor(100); await sleep(8); } }
  /* where she is: the route, the onboarding step, the open sheet, the tip */
  async where() {
    return this.page.evaluate(() => {
      const S = window.Saathi; const ob = S && S.mem && S.mem.ob; const sh = document.querySelector('#sheet-root .sheet'); const tip = document.querySelector('#tour-root .tour-pop');
      const h1 = document.querySelector('#view h1'); const bd = document.querySelector('#joy-root [role="dialog"]');
      return { hash: location.hash.slice(1), stage: S && S.state && S.state.stage, ob: ob && ob.step ? ob.step : null, h1: h1 ? h1.innerText.trim().slice(0, 60) : '',
        sheet: sh ? ((sh.querySelector('h2') || {}).innerText || '(sheet)').trim().slice(0, 70) : '', tip: tip ? ((tip.querySelector('#tour-h') || {}).innerText || '(tip)').trim().slice(0, 70) : '', badge: bd ? (bd.getAttribute('aria-label') || '(badge)') : '',
        diaryTab: S && S.mem ? S.mem.diaryTab || '' : '' };
    });
  }
  key(w) { return [w.hash, w.stage, w.ob, w.h1, w.diaryTab].join('|'); }
  begin(name) { this.job = { name, taps: 0, scrolls: 0, typed: 0, screens: [], sheets: [], tips: [], badges: [], toasts: [], path: [], notes: [] }; this.evMark = 0; return this.job; }
  async startScreen() { const w = await this.where(); this.job.screens.push(this.label(w)); this.lastKey = this.key(w); this.lastSheet = w.sheet; this.evMark = await this.page.evaluate(() => window.__ev.length); }
  label(w) { return (w.hash || '(no hash)') + (w.stage !== 'app' ? ' [' + w.stage + (w.ob ? ' step ' + w.ob : '') + ']' : '') + (w.diaryTab && w.hash === 'diary' ? ' {' + w.diaryTab + '}' : '') + (w.h1 ? ' "' + w.h1 + '"' : ''); }
  /* how far she scrolls to reach it: 0 when it is on screen between the top bar and the tab bar */
  async reach(sel) {
    return this.page.evaluate((s) => {
      const el = document.querySelector(s); if (!el) return null;
      const inSheet = !!el.closest('#sheet-root'); const fixed = (() => { for (let e = el; e && e !== document.body; e = e.parentElement) { if (getComputedStyle(e).position === 'fixed') return true; } return false; })();
      const r = el.getBoundingClientRect(); const H = innerHeight; const tb = document.querySelector('#topbar'); const nav = document.querySelector('#tabbar');
      const top0 = tb && !inSheet ? tb.getBoundingClientRect().bottom : 0; const bot0 = nav && !nav.hidden && !inSheet ? nav.getBoundingClientRect().top : H;
      if ((fixed || el.closest('#topbar, #tabbar, #fab-root, #tour-root, #joy-root, #toast-root')) && !inSheet) return { px: 0, y: Math.round(r.top) };
      if (inSheet) { const sc = el.closest('.sheet'); const sr = sc.getBoundingClientRect(); const hid = r.bottom > Math.min(sr.bottom, H) ? r.bottom - Math.min(sr.bottom, H) : 0; return { px: Math.round(hid), y: Math.round(r.top), sheet: true }; }
      const below = r.bottom > bot0 ? r.bottom - bot0 + 16 : 0; const above = r.top < top0 ? top0 - r.top + 16 : 0;
      return { px: Math.round(below || above), y: Math.round(r.top + scrollY), view: Math.round(bot0 - top0) };
    }, sel);
  }
  async has(sel) { return !!(await this.page.$(sel)); }
  /* one tap: she scrolls to it if needed, taps it, and what happens is noted */
  async tap(sel, what, o = {}) {
    await this.page.waitForSelector(sel, { timeout: o.timeout || 6000, state: 'attached' });
    /* folded away (a closed "More from Sakhi", a closed section): she opens the fold first, and that is a tap too */
    for (let k = 0; k < 3; k++) {
      const fold = await this.page.$eval(sel, (e) => { const from = e.tagName === 'SUMMARY' ? e.parentElement.parentElement : e; const d = from && from.closest('details:not([open])'); if (!d) return null; const s = d.querySelector('summary'); d.setAttribute('data-tc-fold', '1'); return s ? (s.innerText || '').trim().slice(0, 50) : '(fold)'; });
      if (!fold) break;
      await this.tap('details[data-tc-fold="1"]:not([open]) > summary', 'opens the fold "' + fold + '"');
      await this.page.evaluate(() => document.querySelectorAll('[data-tc-fold]').forEach((d) => d.removeAttribute('data-tc-fold')));
    }
    const vis = await this.page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
    if (!vis) this.job.notes.push('tapped an element with no size (hidden?): ' + sel);
    const r = await this.reach(sel); let sc = 0;
    if (r && r.px > 0) { const vh = (r.view || 700) * 0.75; sc = Math.max(1, Math.ceil(r.px / vh)); this.job.scrolls += sc; }
    await this.page.$eval(sel, (e) => e.scrollIntoView({ block: 'center' }));
    const label = what || await this.page.$eval(sel, (e) => (e.innerText || e.value || e.getAttribute('aria-label') || e.id || '').trim().replace(/\s+/g, ' ').slice(0, 50));
    await this.page.$eval(sel, (e) => e.click());
    this.job.taps++; await this.settle(o.after || 450);
    await this.after(label + (sc ? ' (scroll ' + sc + ')' : ''));
  }
  async tapIf(sel, what, o) { if (await this.has(sel)) { await this.tap(sel, what, o); return true; } return false; }
  /* typing in a field: one tap to focus it, and the text */
  async type(sel, text, what) {
    await this.page.waitForSelector(sel, { timeout: 6000 });
    const r = await this.reach(sel); if (r && r.px > 0) this.job.scrolls += Math.max(1, Math.ceil(r.px / ((r.view || 700) * 0.75)));
    await this.page.$eval(sel, (e) => e.scrollIntoView({ block: 'center' }));
    await this.page.fill(sel, text); await this.page.$eval(sel, (e) => { e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); });
    this.job.taps++; this.job.typed += text.length; await this.settle(300);
    await this.after((what || sel) + ' (types ' + text.length + ' chars)');
  }
  async setDate(sel, val, what) {
    await this.page.waitForSelector(sel, { timeout: 6000 });
    await this.page.fill(sel, val); await this.page.$eval(sel, (e) => { e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); });
    this.job.taps += 3; await this.settle(300);   /* a date picker: open, pick the day (month changes not counted), OK */
    await this.after((what || sel) + ' (date picker: ~3 taps)');
  }
  async after(label) {
    const w = await this.where(); const k = this.key(w); const ev = await this.page.evaluate((m) => window.__ev.slice(m), this.evMark); this.evMark += ev.length;
    let note = '';
    if (k !== this.lastKey) { this.job.screens.push(this.label(w)); note += ' -> ' + this.label(w); this.lastKey = k; }
    if (w.sheet && w.sheet !== this.lastSheet) { this.job.sheets.push(w.sheet); note += ' [sheet: ' + w.sheet + ']'; }
    this.lastSheet = w.sheet;
    for (const e of ev) { if (e.k === 'tip') { this.job.tips.push(e.h); note += ' [tip: ' + e.h + ']'; } if (e.k === 'badge') { this.job.badges.push(e.h); note += ' [badge: ' + e.h + ']'; } if (e.k === 'toast') { this.job.toasts.push(e.h); note += ' [toast: ' + e.h + ']'; } if (e.k === 'sheet' && e.h !== w.sheet) { this.job.sheets.push(e.h); note += ' [sheet seen: ' + e.h + ']'; } }
    this.job.path.push(label + note);
  }
  note(s) { this.job.notes.push(s); }
  end() { const j = this.job; j.screenCount = j.screens.length; return j; }
  /* what is between her and the screen (a tip, a badge): noted; she closes it the quickest way, and those taps count */
  async clearBlockers(why) {
    const out = [];
    for (let k = 0; k < 8; k++) {
      const b = await this.page.evaluate((later) => {
        const jb = document.querySelector('#joy-root [role="dialog"]'); if (jb) { return { k: 'badge', h: jb.getAttribute('aria-label') || '', sel: '#joy-root [role="dialog"] button' }; }
        const tp = document.querySelector('#tour-root .tour-pop'); if (tp) { const h = ((tp.querySelector('#tour-h') || {}).innerText || '').trim(); const sel = (later ? ['#tour-root #tour-later', '#tour-root #tour-skip'] : []).concat(['#tour-root #tour-done', '#tour-root #tour-next', '#tour-root #tour-later', '#tour-root button']).find((s) => document.querySelector(s)); return { k: 'tip', h, sel, label: (document.querySelector(sel) || {}).innerText || '' }; }
        return null;
      }, !!process.env.TIP_LATER);
      if (!b) break; out.push(b.k + ': ' + b.h);
      if (this.job) await this.tap(b.sel, 'closes the ' + b.k + ' "' + b.h + '"' + (b.label ? ' with "' + b.label.trim() + '"' : '')); else { await this.page.$eval(b.sel, (e) => e.click()); await this.settle(300); }
    }
    return out;
  }
  async go(h) { await this.page.evaluate((x) => { if (location.hash === '#' + x) window.Saathi.render(); else location.hash = x; window.scrollTo(0, 0); }, h); await this.settle(600); }
  async jump(day, hm, h) { await this.page.clock.setSystemTime(at(day, hm)); await this.go('diary'); await this.go(h || 'home'); await this.settle(700); }
  async text(sel) { return this.page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => ''); }
  async shot(name, full) { await this.page.screenshot({ path: path.join(OUT, name + '.png'), fullPage: !!full }); }
  async dump() { return this.page.evaluate(() => ({ 'qura-saathi-v1': localStorage.getItem('qura-saathi-v1'), 'qura-sakhi-account-v1': localStorage.getItem('qura-sakhi-account-v1') })); }
  /* every visible control on the first screen of the current view, top to bottom (what she sees) */
  async controls() {
    return this.page.evaluate(() => [...document.querySelectorAll('#view button, #view a, #view summary, #fab, #topbar button, #tabbar button')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }).map((e) => { const r = e.getBoundingClientRect(); return { y: Math.round(r.top + scrollY), id: e.id, txt: (e.innerText || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 50), data: Object.keys(e.dataset).map((k) => k + '=' + e.dataset[k]).join(',').slice(0, 60) }; }));
  }
  async pageScreens() { return this.page.evaluate(() => +(document.documentElement.scrollHeight / innerHeight).toFixed(1)); }
}
