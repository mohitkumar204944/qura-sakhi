// Version 39.60: "Share how I use Sakhi" through PostHog, events only (MODULE_API section 103;
// docs/activity-tracking-advice-2026-11-02.md, sections 15 to 17). A fake PostHog answers with a hostile config (recordings,
// heatmaps and surveys switched on from its side) and keeps every request, so the checks see exactly what would leave.
// Checks:
//   1. a build without a key: no switch, no posthog-js, nothing sent;
//   2. with a key it is on by default (Mohit, 3 Nov); turned off, posthog-js never loads; the data notice says it;
//   3. on: only screen views, taps, rage and dead taps and errors leave, with allowlisted properties, neutral screen names
//      (a plan's or condition's name never), no words from the screens, no number, no Hindi, no file path or route;
//   4. no recordings, heatmaps or surveys, whatever PostHog's own settings say, and no request to any other address;
//   5. private screens (loss, intimate health) send nothing, even taps;
//   6. errors go with their type and place, never their message;
//   7. discreet mode and a shared phone stop it at once; off in Me stops it and forgets the anonymous id;
//   8. Hindi at 360 px.
// Usage: node test/posthog.mjs [dir]   (dir defaults to this app folder)
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
const isoAgo = (d) => { const x = new Date(); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() - d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me'].map((k) => [k, { st: 'done', d: isoAgo(3) }]));
const seedOf = (extra) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1992-07-01', consent: { c1: isoAgo(30), c2: null, c4: null }, situation: { stage: 'cycle' },
  events: [{ d: isoAgo(52), t: 'start' }, { d: isoAgo(47), t: 'end' }, { d: isoAgo(24), t: 'start' }, { d: isoAgo(19), t: 'end' }], daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: isoAgo(3) } }, extra || {}, { settings: Object.assign({ toursAuto: false }, (extra || {}).settings || {}) });
const KEY = 'phc_TestKeyForSakhiOnly0123456789';
const PH = 'https://ph.test.invalid';
/* PostHog's side switched everything on: Sakhi must still send none of it */
const HOSTILE = { token: KEY, hasFeatureFlags: true, captureDeadClicks: true, capturePerformance: { web_vitals: true, network_timing: true }, autocapture_opt_out: false,
  autocaptureExceptions: true, heatmaps: true, surveys: [{ id: 's1', name: 'x', type: 'popover', questions: [{ type: 'open', question: 'Why?' }], conditions: null, start_date: '2026-01-01T00:00:00Z' }],
  defaultIdentifiedOnly: true, elementsChainAsString: true, siteApps: [],
  sessionRecording: { endpoint: '/s/', consoleLogRecordingEnabled: true, recorderVersion: 'v2', sampleRate: '1.00', networkPayloadCapture: { recordBody: true, recordHeaders: true } } };

const decode = (buf) => {
  if (!buf || !buf.length) return null;
  try {
    if (buf[0] === 0x1f && buf[1] === 0x8b) buf = zlib.gunzipSync(buf);
    let s = buf.toString('utf8');
    if (/^data=/.test(s)) { const d = new URLSearchParams(s).get('data') || ''; try { s = Buffer.from(d, 'base64').toString('utf8'); JSON.parse(s); } catch (e) { s = d; } }
    return JSON.parse(s);
  } catch (e) { return buf.toString('utf8'); }
};
const eventsOf = (body) => (Array.isArray(body) ? body : (body && body.batch) ? body.batch : (body && body.event) ? [body] : []);

const browser = await chromium.launch();
async function open(o = {}) {
  /* a phone's browser: posthog-js drops events from headless browsers as bots */
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', userAgent: 'Mozilla/5.0 (Linux; Android 16; SM-F731B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/156.0.0.0 Mobile Safari/537.36' });
  await ctx.addInitScript('Object.defineProperty(navigator, "webdriver", { get: () => false }); Object.defineProperty(navigator, "userAgentData", { get: () => undefined });');
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  const cfg = { api: 'https://api.test.invalid', app: 'test-0.39.60-demo', platform: 'web' };
  if (o.key !== false) Object.assign(cfg, { ph: KEY, phHost: PH });
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(cfg) + ';');
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + '); localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify({ token: 'test', id: 'test', phone: '+919876543210', name: 'Asha', pincode: '560001', activeOn: isoAgo(0) })) + '); }');
  const reqs = [];
  await ctx.route(/^https?:/, (r) => {
    const q = r.request(); const u = new URL(q.url());
    reqs.push({ host: u.host, path: u.pathname, type: q.resourceType(), body: decode(q.postDataBuffer()), at: Date.now() });
    if (u.origin === PH && /\/array\/[^/]+\/config/.test(u.pathname)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(HOSTILE) });
    if (u.origin === PH && /^\/(flags|decide)/.test(u.pathname)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ flags: {}, featureFlags: {}, featureFlagPayloads: {}, errorsWhileComputingFlags: false }) });
    r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":1}' });
  });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => { if (!/SAKHI-TEST-THROW/.test(e.message)) errs.push(String(e.message).slice(0, 200)); });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await sleep(400);
  return { ctx, page, errs, reqs };
}
const go = async (page, h, ms) => { await page.evaluate((x) => { location.hash = x; }, h); await sleep(ms || 350); };
const phEvents = (reqs) => reqs.filter((x) => 'https://' + x.host === PH).flatMap((x) => eventsOf(x.body).map((e) => Object.assign({ _path: x.path, _at: x.at }, e)));
const flush = () => sleep(4200);   /* posthog-js sends its queue every 3 seconds */
const tapAll = (page, n) => page.evaluate((k) => { const b = [...document.querySelectorAll('#view button, #view a, #view [data-go]')].filter((x) => x.offsetParent).slice(0, k); b.forEach((x) => x.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 20, clientY: 20 }))); return b.length; }, n);

/* ---------- 1. A build without a key ---------- */
{
  const { ctx, page, errs, reqs } = await open({ key: false });
  await go(page, 'me-privacy');
  check('1 no key: no "Share how I use Sakhi" switch', !(await page.$('[data-set="ph"]')) && !/Share how I use Sakhi/.test(await page.$eval('#view', (e) => e.innerText)));
  await go(page, 'home'); await go(page, 'diary'); await tapAll(page, 3); await sleep(600);
  check('1 no key: posthog-js never loads', await page.evaluate(() => !window.posthog && !document.querySelector('script[src*="posthog"]')));
  check('1 no key: nothing goes to PostHog', !reqs.some((x) => /posthog|ph\.test/.test(x.host)), reqs.map((x) => x.host));
  await go(page, 'me-about');
  check('1 no key: the data notice has no PostHog line', !/PostHog/.test(await page.$eval('#view', (e) => e.innerText)));
  check('1 no key: no page errors', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 2. Off when she turned it off ---------- */
{
  const { ctx, page, errs, reqs } = await open({ seed: { settings: { ph: false } } });
  await go(page, 'home'); await go(page, 'diary'); await tapAll(page, 3); await sleep(600);
  check('2 turned off: posthog-js never loads, nothing goes', await page.evaluate(() => !window.posthog) && !reqs.some((x) => 'https://' + x.host === PH));
  await go(page, 'me-privacy');
  check('2 turned off: the switch shows off', !(await page.$eval('[data-set="ph"]', (e) => e.checked)));
  check('2 turned off: no page errors', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 3 to 7. With a key, on by default (Mohit, 3 Nov) ---------- */
{
  const { ctx, page, errs, reqs } = await open();
  await page.waitForFunction(() => window.Saathi.ph.ready(), null, { timeout: 8000 }).catch(() => {});
  check('3 on by default: posthog-js starts without her touching anything', await page.evaluate(() => window.Saathi.ph.on() && window.Saathi.ph.ready()));
  await go(page, 'me-privacy');
  const sw = await page.$('[data-set="ph"]');
  check('3 the switch is in Me > Privacy, under "Help improve Sakhi", and shows on', !!sw && /Help improve Sakhi[\s\S]*Share how I use Sakhi/.test(await page.$eval('#view', (e) => e.innerText)) && await page.$eval('[data-set="ph"]', (e) => e.checked));
  check('3 its words say what goes, where, and how to turn it off', /never the words on them/.test(await page.$eval('#view', (e) => e.innerText)) && /PostHog in Europe/.test(await page.$eval('#view', (e) => e.innerText)) && /Private pages, discreet mode and a shared phone send nothing/.test(await page.$eval('#view', (e) => e.innerText)) && /on unless you turn it off here/.test(await page.$eval('#view', (e) => e.innerText)));
  await go(page, 'me-about');
  check('3 the data notice says it, and where to turn it off', /How you use Sakhi: which screens you open[\s\S]*PostHog in Europe[\s\S]*Privacy on a shared phone/.test(await page.$eval('#view', (e) => e.innerText)));
  check('3 posthog-js loads from the app\'s own files', await page.evaluate(() => window.Saathi.ph.ready() && [...document.scripts].some((s) => /vendor\/posthog\.js$/.test(s.src) && s.src.startsWith('file:'))));
  const words = new Set();
  const grab = async () => (await page.$eval('#view', (e) => e.innerText)).split(/\s+/).filter((w) => /^[A-Za-z]{6,}$/.test(w)).forEach((w) => words.add(w));
  const walk = ['home', 'diary', 'plan', 'plan-pmos', 'per-lesson', 'relief-cramps', 'calm', 'cond-endo', 'preg-week', 'periods-pain', 'ask-call', 'report', 'help', 'home'];
  for (const h of walk) { await go(page, h, 450); await grab(); await tapAll(page, 2); }
  /* a rage tap: four quick taps in one place; a dead tap: on plain text */
  await page.evaluate(() => { const el = document.querySelector('#view h1, #view h2, #view p'); for (let i = 0; i < 4; i++) el.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 40, clientY: 120 })); });
  await page.mouse.click(30, 200); await sleep(3200);
  /* an error with words in its message */
  await page.evaluate(() => setTimeout(() => { throw new Error('SAKHI-TEST-THROW period pain 9000000001'); }, 0)); await sleep(300);
  await flush();
  /* 5. private screens: nothing at all while she is there, taps included */
  /* judged by when each event was taken, not sent: a dead tap is reported a few seconds after it */
  await go(page, 'loss', 500); const t0 = Date.now(); await tapAll(page, 4); await page.mouse.click(60, 300);
  await go(page, 'intimate-sti', 500); await tapAll(page, 4);
  await flush(); const t1 = Date.now();
  await go(page, 'home', 500); await flush();
  const inPrivate = phEvents(reqs).filter((e) => { const at = Date.parse(e.timestamp); return at >= t0 && at <= t1; });
  const during = inPrivate.length;

  const evs = phEvents(reqs);
  const names = [...new Set(evs.map((e) => e.event))];
  const OK_EVENTS = ['$pageview', '$pageleave', '$autocapture', '$rageclick', '$dead_click', '$exception'];
  check('3 only screen views, taps, rage and dead taps and errors leave', names.every((n) => OK_EVENTS.indexOf(n) >= 0) && names.includes('$pageview') && names.includes('$autocapture'), names);
  const OK_PROPS = new Set(['token', 'distinct_id', '$device_id', '$session_id', '$window_id', '$pageview_id', '$insert_id', '$time', '$lib', '$lib_version', '$os', '$os_version', '$browser', '$browser_version', '$device_type', '$device_model', '$screen_height', '$screen_width', '$viewport_height', '$viewport_width', '$event_type', '$ce_version', '$elements_chain', '$process_person_profile', '$is_identified', '$exception_list', '$exception_types', '$exception_level', '$current_url', '$pathname', '$host', '$geoip_disable', 'screen', 'lang', 'app']);
  const extra = [...new Set(evs.flatMap((e) => Object.keys(e.properties || {})).filter((k) => !OK_PROPS.has(k) && !/^\$(prev_pageview|dead_click)_/.test(k)))];
  check('3 every property is on the allowlist', extra.length === 0, extra);
  check('3 no $set or $set_once (no person profile)', evs.every((e) => !e.$set && !e.$set_once && !(e.properties || {}).$set));
  const screens = [...new Set(evs.map((e) => (e.properties || {}).screen))];
  const OK_SCREENS = new Set(['home', 'your-sakhi', 'join-update', 'diary', 'learn', 'help', 'me', 'checkin', 'pattern', 'fertile', 'ask', 'ask-call', 'care', 'report', 'report-show', 'calm', 'plan',
    'plan-start', 'plan-goal', 'plan-reveal', 'plan-checkin', 'plan-end', 'plan-progress', 'plan-plate', 'plan-body', 'plan-moves', 'plan-calm', 'plan-wind', 'food', 'explain', 'docportal', 'lang',
    'joy', 'joy-quiz', 'asha', 'asha-show', 'iron', 'journey', 'relief', 'lesson', 'article', 'condition', 'pregnancy-test', 'pregnancy', 'after-birth', 'midlife', 'trying', 'periods',
    'contraception', 'screening', 'selfcheck', 'care-access', 'tools', 'family', 'other']);
  check('3 screen names are neutral: a plan, lesson or condition keeps only its kind', screens.every((s) => OK_SCREENS.has(s)) && ['plan', 'lesson', 'relief', 'condition', 'pregnancy', 'periods'].every((s) => screens.includes(s)), screens);
  const pv = evs.filter((e) => e.event === '$pageview');
  check('3 time on the screen before goes with the next view', pv.some((e) => typeof (e.properties || {}).$prev_pageview_duration === 'number'), pv.map((e) => e.properties.$prev_pageview_duration));
  check('3 every event tells PostHog not to look up her location from the IP', evs.length > 0 && evs.every((e) => e.properties.$geoip_disable === true));
  check('3 her language and the app version go with each event', evs.every((e) => e.properties.lang === 'en' && e.properties.app === 'test-0.39.60-demo'));
  const all = JSON.stringify(evs);
  const ROUTES = /pmos|per-lesson|relief-cramps|cramps|cond-endo|endo\b|preg-week|periods-pain|ask-call"|index\.html|file:|#[a-z]/i;
  check('3 no route, file path or plan name anywhere in what leaves', !ROUTES.test(all.replace(/"screen":"ask-call"|"\/ask-call"|app\.sakhi\.invalid\/ask-call|\$pathname":"\/ask-call/g, '')), (all.match(ROUTES) || [])[0]);
  const leaked = [...words].filter((w) => !OK_SCREENS.has(w.toLowerCase()) && !/^(Sakhi|screen|pageview|autocapture|exception|button|android|Chrome|Error|Mobile|Desktop|Windows|Linux|generic)$/i.test(w) && new RegExp('\\b' + w + '\\b').test(all));
  check('3 no words from the screens she saw', leaked.length === 0, leaked.slice(0, 12));
  check('3 no phone number, no Hindi', !/(?<![0-9a-f-])[6-9][0-9]{9}(?![0-9])/.test(all) && !/[ऀ-ॿ]/.test(all));
  const chains = evs.filter((e) => e.properties.$elements_chain).map((e) => e.properties.$elements_chain);
  check('3 a tap is its place in the page only (tag and position)', chains.length > 0 && chains.every((c) => /^([a-z][a-z0-9-]*(:nth-child="\d+"nth-of-type="\d+")?;?)+$/.test(c)), chains.slice(0, 3));
  check('3 a rage tap is counted', names.includes('$rageclick'), names);
  /* 4 */
  const paths = [...new Set(reqs.filter((x) => 'https://' + x.host === PH).map((x) => x.path.replace(/\/array\/[^/]+\//, '/array/KEY/')))];
  check('4 no recordings, whatever PostHog\'s settings say', !paths.some((p) => /^\/s\/?$/.test(p)) && !names.includes('$snapshot'), paths);
  check('4 no heatmaps, surveys, flags or web vitals', !names.some((n) => /heatmap|survey|feature_flag|web_vitals|\$opt_in|\$identify/.test(n)) && !paths.some((p) => /flags|decide|surveys/.test(p)), names.concat(paths));
  check('4 no survey on the screen', await page.evaluate(() => !document.querySelector('[class*="PostHogSurvey"], [class*="posthog-survey"], .survey-form')));
  /* what the page itself sends (a link she follows opens a page, which is hers to choose) */
  const bg = reqs.filter((x) => x.type !== 'document');
  check('4 nothing goes to any other address', bg.every((x) => ['ph.test.invalid', 'api.test.invalid'].indexOf(x.host) >= 0), [...new Set(bg.map((x) => x.host + ' ' + x.type))]);
  check('4 posthog-js loads no code from the network', await page.evaluate(() => [...document.scripts].every((s) => !s.src || s.src.startsWith('file:'))));
  /* 5 */
  check('5 a private screen sends nothing, taps included', during === 0, inPrivate.map((e) => [e.event, e.properties.screen, e.timestamp]));
  /* 6 */
  const ex = evs.filter((e) => e.event === '$exception');
  check('6 an error goes with its type and place', ex.length > 0 && ex.every((e) => (e.properties.$exception_list || []).length && e.properties.$exception_list[0].type === 'Error'), ex.length);
  check('6 never its message', !/SAKHI-TEST-THROW|9000000001/.test(all) && ex.every((e) => !('value' in (e.properties.$exception_list || [{}])[0]) && !e.properties.$exception_values));
  check('6 a file in it is named, never its path', ex.every((e) => JSON.stringify(e.properties.$exception_list).indexOf('file:') < 0));

  /* ---------- 7. Discreet, shared, off ---------- */
  const n1 = phEvents(reqs).length;
  await page.evaluate(() => { window.Saathi.state.settings.discreet = true; }); await go(page, 'diary'); await tapAll(page, 3); await go(page, 'plan'); await flush();
  check('7 discreet mode: nothing goes', phEvents(reqs).length === n1, phEvents(reqs).length - n1);
  await page.evaluate(() => { window.Saathi.state.settings.discreet = false; window.Saathi.state.settings.shared = true; }); await go(page, 'home'); await tapAll(page, 3); await flush();
  check('7 shared phone: nothing goes', phEvents(reqs).length === n1, phEvents(reqs).length - n1);
  await page.evaluate(() => { window.Saathi.state.settings.shared = false; }); await go(page, 'me-privacy');
  const ids = [...new Set(evs.map((e) => e.properties.distinct_id))];
  await page.$eval('[data-set="ph"]', (e) => e.click()); await flush();   /* the tap on the switch was taken while it was on */
  const n2 = phEvents(reqs).length;
  await go(page, 'home'); await go(page, 'diary'); await tapAll(page, 3); await flush();
  check('7 off in Me: nothing more goes', phEvents(reqs).length === n2, phEvents(reqs).length - n2);
  check('7 off in Me: the anonymous id is forgotten', await page.evaluate((old) => !Object.keys(localStorage).some((k) => /^ph_/.test(k) || old.some((id) => String(localStorage.getItem(k)).indexOf(id) >= 0)), ids), ids);
  await go(page, 'me-privacy'); await page.$eval('[data-set="ph"]', (e) => e.click()); await sleep(300);
  const n3 = phEvents(reqs).length; await go(page, 'home'); await go(page, 'calm'); await flush();
  const after = phEvents(reqs).slice(n3);
  check('7 on again: it starts afresh with a new id', after.length > 0 && after.every((e) => evs.every((o) => o.properties.distinct_id !== e.properties.distinct_id)), after.length);
  check('page errors: none', errs.length === 0, errs);
  await ctx.close();
}

/* ---------- 8. Hindi at 360 px ---------- */
{
  const { ctx, page, errs } = await open({ lang: 'hi', w: 360, seed: { lang: 'hi' } });
  await go(page, 'me-privacy');
  const txt = await page.$eval('#view', (e) => e.innerText);
  check('8 Hindi: the switch in her language', /मैं Sakhi कैसे इस्तेमाल करती हूँ/.test(txt) && /PostHog/.test(txt) && /निजी पन्ने/.test(txt), txt.slice(0, 300));
  check('8 Hindi: nothing wider than the screen', await page.evaluate(() => document.documentElement.scrollWidth <= 360));
  check('8 Hindi: no page errors', errs.length === 0, errs);
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log((failed.length ? 'FAILED ' + failed.length + ' of ' : 'All ') + results.length + ' checks' + (failed.length ? '' : ' passed') + ' (posthog: Version 39.60)');
process.exit(failed.length ? 1 : 0);
