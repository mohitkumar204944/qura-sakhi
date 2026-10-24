// Screenshots of Sakhi for the download-page mockup (marketing/download-page/index.html). Uses the app's own sample diaries
// only (never anyone's real diary), a fixed date, and the pilot APK's settings. Nothing leaves the machine.
// Usage: node marketing/download-page/make-shots.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const web = path.resolve(here, '..', '..', 'web');
const { chromium } = await import(pathToFileURL(path.join(web, 'test', 'pw.mjs')).href);
const CONTENT = fs.readFileSync(path.join(web, 'content.json'), 'utf8');
const out = path.join(here, 'shots'); fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BRIDGE = 'window.SakhiAndroid = { schedule() { return 0; }, cancelAll() {}, canNotify() { return true; }, askNotify() {}, canExactAlarms() { return true; }, askExactAlarms() {}, testNotify() {}, speak() { return true; }, stop() {}, voices() { return "[]"; }, copy() { return true; }, haptic() {}, setSecure() {}, setDisguise() {}, isDisguised() { return false; }, saveState() { return true; }, loadState() { return ""; }, printPage() {} };';

const browser = await chromium.launch();
async function shot(name, o) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  await ctx.addInitScript('window.SAKHI_CONFIG = { app: "0.34.1-pilot", platform: "android" };');
  await ctx.addInitScript(BRIDGE);
  await ctx.route(/^https?:/, (r) => r.abort());
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date('2026-10-23T10:00:00+05:30') });
  await page.goto(pathToFileURL(path.join(web, 'index.html')).href + '#home', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi);
  await page.evaluate((o) => {
    const S = window.Saathi; S.loadSample(o.sample);
    S.state.settings.toursAuto = false; S.state.fullTour = { st: 'done', d: '2026-10-20' }; S.state.prompts = Object.assign({}, S.state.prompts, { notifyIntro: '2026-10-20', setup: 'off' });
    if (o.lang) S.state.lang = o.lang; if (o.notify) S.state.settings.notify = true;
    S.state.langChosen = true; S.save(); location.hash = '#' + (o.hash || 'home'); S.render();
  }, { sample: o.sample, lang: o.lang, notify: o.notify, hash: o.hash });
  for (let i = 0; i < 12; i++) { await page.clock.runFor(100); await sleep(20); }
  if (o.before) { await page.evaluate(o.before); for (let i = 0; i < 8; i++) { await page.clock.runFor(100); await sleep(20); } }
  await page.evaluate(() => { document.querySelectorAll('#tour-root, .toast').forEach((e) => { e.innerHTML = ''; }); window.scrollTo(0, 0); });
  if (o.scroll) { await page.evaluate((y) => window.scrollTo(0, y), o.scroll); await sleep(200); }
  await page.screenshot({ path: path.join(out, name + '.png') });
  await ctx.close();
  console.log('shot', name);
}
await shot('home', { sample: 'asha' });
await shot('diary', { sample: 'priya', hash: 'diary' });
await shot('pregnancy', { sample: 'meera' });
await shot('care', { sample: 'asha', hash: 'care' });
await shot('report', { sample: 'priya', hash: 'report' });
await shot('ask-call', { sample: 'priya', hash: 'ask-call', before: () => { const i = document.querySelector('#ac-topic'); if (i) { i.value = 'My periods come every 40 to 60 days'; i.dispatchEvent(new Event('input')); } const c = document.querySelector('[data-ac-sec="periods"]'); if (c) { c.checked = true; c.dispatchEvent(new Event('change')); } } });
await shot('reminders', { sample: 'meera', hash: 'tools-reminders', notify: true });
await shot('hindi', { sample: 'asha', lang: 'hi' });
await shot('help', { sample: 'asha', hash: 'help' });
await browser.close();
