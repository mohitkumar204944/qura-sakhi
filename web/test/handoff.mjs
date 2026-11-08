// Version 33: "Ask Qura to call me", the doctor-call hand-off (server/SERVER_SPEC.md section 10.1, MODULE_API section 35),
// checked the way she meets it: the Ask screen, what she can tick, the preview, what goes to the server, the statuses and the
// errors. A fixed clock (Asia/Kolkata); every http(s) request goes to a local stand-in for Sakhi's server, and nothing
// leaves the machine. The server side (Qura's endpoint, retries, deletion) is in server/test/api.test.mjs and app-e2e.mjs.
// Usage: node test/handoff.mjs [dir]   (dir defaults to this app folder)
import fs from 'node:fs';
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
const NOW = '2026-10-23T10:00:00+05:30';
const TODAY = '2026-10-23';
const iso = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ago = (n) => iso(TODAY, -n);
const regular = (last, n, gap) => { const ev = []; for (let i = n - 1; i >= 0; i--) { const st = ago(last + i * (gap || 28)); ev.push({ d: st, t: 'start' }, { d: iso(st, 4), t: 'end' }); } return ev; };
const TOURS_DONE = Object.fromEntries(['home', 'diary', 'care', 'help', 'me'].map((k) => [k, { st: 'done', d: ago(3) }]));
const seedOf = (x) => Object.assign({ lang: 'en', langChosen: true, stage: 'app', dob: '1996-05-01', consent: { c1: ago(300), c2: null, c4: null }, situation: {}, events: regular(10, 6), daily: {}, notes: {}, checkins: {},
  tours: TOURS_DONE, fullTour: { st: 'done', d: ago(3) }, prompts: { setup: 'off' } }, x || {}, { settings: Object.assign({ toursAuto: false }, (x || {}).settings || {}) });
const ACCT = { token: 'test', id: 'test', phone: '+919876543210', name: 'Asha', pincode: '560001', activeOn: TODAY };
const NOTE = 'MARKER-NOTE: pain on the left side';

const browser = await chromium.launch();
/* o.server(method, path, body) answers [status, json], or 'offline' to drop the connection */
async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: o.lang === 'hi' ? 'hi-IN' : 'en-IN', timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript('window.SAKHI_CONTENT = ' + CONTENT + ';');
  const cfg = o.cfg || { api: 'https://api.test.invalid', app: 'test-0.33-pilot', platform: 'android' };
  await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify(cfg) + ';');
  await ctx.addInitScript('if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seedOf(o.seed))) + ');' + (o.noAcct ? '' : ' localStorage.setItem("qura-sakhi-account-v1", ' + JSON.stringify(JSON.stringify(ACCT)) + ');') + ' }');
  const sent = [];
  await ctx.route(/^https?:/, (r) => {
    const req = r.request(); const u = new URL(req.url()); const p = u.pathname.replace(/^.*\/v1\//, '');
    let b = null; const raw = req.postData(); try { b = raw ? JSON.parse(raw) : null; } catch (e) { b = raw; }
    sent.push({ method: req.method(), path: p, body: b, raw: raw || '', auth: req.headers().authorization || '' });
    const ans = o.server ? o.server(req.method(), p, b) : null;
    if (ans === 'offline') { r.abort(); return; }
    if (ans) r.fulfill({ status: ans[0], contentType: 'application/json', body: JSON.stringify(ans[1]) }); else r.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
  await page.clock.install({ time: new Date(o.now || NOW) });
  await page.goto(PAGE + (o.hash || '#home'), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.Saathi); await settle(page);
  return { ctx, page, errs, sent };
}
async function settle(page, ms) { for (let i = 0; i < Math.ceil((ms || 400) / 100); i++) { await page.clock.runFor(100); await sleep(15); } }
const go = async (page, h) => { await page.evaluate((x) => { location.hash = x; }, h); await settle(page, 400); };
const view = (page) => page.$eval('#view', (e) => e.innerText);
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.Saathi.state)));
const tap = async (page, sel) => { await page.$eval(sel, (el) => el.click()); await settle(page, 400); };
const tick = async (page, key) => { await page.$eval('[data-ac-sec="' + key + '"]', (c) => { c.checked = !c.checked; c.dispatchEvent(new Event('change')); }); await settle(page, 300); };
const typeTopic = (page, v) => page.$eval('#ac-topic', (i, x) => { i.value = x; i.dispatchEvent(new Event('input')); }, v);
const cleanup = async (x) => { check(x.name + ': no page errors', !x.errs.length, x.errs); await x.ctx.close(); };
/* a stand-in for Sakhi's server: GET requests answers `available`; POST requests answers with `post` */
const server = (o) => (m, p, b) => {
  if (m === 'GET' && p === 'requests') return [200, { available: o.available !== false, requests: o.list || [] }];
  if (m === 'POST' && p === 'requests') return typeof o.post === 'function' ? o.post(b) : (o.post || [201, { ref: 'QC-ABC234', status: 'sent' }]);
  return null;
};

/* ---------- 1. Off on the server: the Ask screen stays as it was ---------- */
{
  const T = await open({ server: server({ available: false }), hash: '#ask' });
  await settle(T.page, 600);
  const v = await view(T.page);
  check('1 the server says the hand-off is off: no call card, booking stays the way to book', !(await T.page.$('#ask-call')) && /How to book/.test(v) && /Book at quranutrition.com/.test(v), v.slice(0, 500));
  const g = T.sent.filter((x) => x.path === 'requests');
  check('1 the app asked the server once, with GET, no body and no account token: opening Ask tells the server nothing about her', g.length === 1 && g[0].method === 'GET' && g[0].raw === '' && g[0].auth === '', g);
  await cleanup(Object.assign(T, { name: '1' }));
}

/* ---------- 2. On: the card comes first; the form starts with nothing ticked; the preview is exactly what goes ---------- */
{
  let got = null;
  const T = await open({ server: server({ post: (b) => { got = b; return [201, { ref: 'QC-ABC234', status: 'sent' }]; } }), hash: '#ask',
    seed: { notes: { [TODAY]: NOTE }, daily: { [ago(2)]: ['d_cramps'], [ago(3)]: ['d_cramps'], [ago(4)]: ['d_cramps'] } } });
  const { page } = T;
  await settle(page, 600);
  check('2 the call card is on the Ask screen, and booking yourself is the other way', !!(await page.$('#ask-call [data-go="ask-call"]')) && /Or book a time yourself/.test(await view(page)));
  check('2 only one primary button: "Ask for a call"', await page.$$eval('#view .btn.primary', (xs) => xs.length === 1 && /Ask for a call/.test(xs[0].innerText)));
  await tap(page, '#ask-call [data-go="ask-call"]');
  const keys = await page.$$eval('[data-ac-sec]', (xs) => xs.map((x) => x.dataset.acSec + ':' + x.checked));
  check('2 her report sections are listed, nothing ticked', keys.length >= 4 && keys.every((k) => /:false$/.test(k)) && keys.some((k) => /^periods/.test(k)) && keys.some((k) => /^notes/.test(k)), keys);
  check('2 with nothing ticked the preview says nothing from her diary goes', /Nothing from your diary/.test(await page.$eval('#ac-preview', (e) => e.innerText)));
  check('2 it shows her number and says what the doctors are and what costs money', /\+91\s98765\s43210/.test(await view(page)) && /BAMS/.test(await view(page)));
  check('2 it says Qura\'s care team sees what she ticks, not only the doctor', /What can Qura’s care team see before the call\?/.test(await view(page)));
  await tap(page, '#ac-send');
  check('2 no topic: it asks for one and sends nothing', /Write a few words/.test(await view(page)) && !T.sent.some((x) => x.method === 'POST'));
  await typeTopic(page, '  My periods\tcome late  ');
  await tick(page, 'periods'); await tick(page, 'questions');
  const prev = await page.$$eval('#ac-preview li', (xs) => xs.map((x) => x.innerText));
  check('2 the preview lists the doctor\'s lines of what she ticked: her last period, the days between, her own question, no catch-all', prev.length === 3 && /^Last period started .+ and lasted 5 days$/.test(prev[0]) && /^Days between periods: 28, 28, 28, 28, 28 \(average 28\)$/.test(prev[1]) && /period pain stops my day/.test(prev[2]) && !prev.some((l) => /MARKER|keep an eye on/.test(l)), prev);
  await tap(page, '[data-ac-time="evening"]');
  check('2 the topic she typed stays when she taps a time', (await page.$eval('#ac-topic', (i) => i.value)) === '  My periods\tcome late  ');
  await tap(page, '#ac-send'); await settle(page, 500);
  check('2 one POST with only the allowlisted fields', got && JSON.stringify(Object.keys(got).sort()) === JSON.stringify(['best_time', 'lang', 'notice', 'shared', 'shared_data', 'topic']), got);
  check('2 the topic is cleaned (no tab, trimmed), her time and language and the notice go with it', got && got.topic === 'My periods come late' && got.best_time === 'evening' && got.lang === 'en' && got.notice === '2026-10-23.2', got);
  check('2 exactly what the preview showed goes, in its order, and nothing she left unticked', got && JSON.stringify(got.shared) === '["periods","questions"]' && JSON.stringify(got.shared_data.sections.flatMap((x) => x.lines)) === JSON.stringify(prev) && !JSON.stringify(got).includes('MARKER') && got.shared_data.report_lang === 'en', got);
  check('2 Qura has it: the done screen gives her reference, and says a booking is confirmed on WhatsApp', /Qura has your request/.test(await view(page)) && /QC-ABC234/.test(await view(page)) && /confirms it on WhatsApp/.test(await view(page)));
  const s = await st(page);
  check('2 the phone keeps the reference, her topic and what she ticked', s.calls.length === 1 && s.calls[0].ref === 'QC-ABC234' && s.calls[0].status === 'sent' && s.calls[0].topic === 'My periods come late' && JSON.stringify(s.calls[0].shared) === '["periods","questions"]', s.calls);
  await go(page, '#ask'); await settle(page, 400);
  check('2 back on Ask: her request is listed with its status', /Calls you asked for/.test(await view(page)) && /QC-ABC234/.test(await view(page)) && /Sent to Qura/.test(await view(page)));
  await page.evaluate(() => { window.Saathi.state.settings.discreet = true; window.Saathi.save(); window.Saathi.render(); }); await settle(page);
  check('2 discreet mode: the list hides what she wrote', !/My periods come late/.test(await page.$eval('#ask-calls', (e) => e.innerText)));
  await cleanup(Object.assign(T, { name: '2' }));
}

/* ---------- 3. Waiting for Qura, then sent: her status follows the server ---------- */
{
  let list = [];
  const T = await open({ server: (m, p, b) => server({ list: list, post: [201, { ref: 'QC-WAIT22', status: 'queued' }] })(m, p, b), hash: '#ask-call' });
  const { page } = T;
  await settle(page, 400);
  await typeTopic(page, 'White discharge'); await tap(page, '#ac-send'); await settle(page, 400);
  check('3 not with Qura yet: she is told it is saved and Sakhi keeps trying, with her reference', /Your request is saved/.test(await view(page)) && /keeps trying for 24 hours/.test(await view(page)) && /QC-WAIT22/.test(await view(page)));
  list = [{ ref: 'QC-WAIT22', status: 'sent', created_at: '2026-10-23T04:30:00Z', sent_at: '2026-10-23T04:40:00Z' }];
  await page.evaluate(() => window.dispatchEvent(new Event('online'))); await settle(page, 600);
  check('3 when she comes back online, the app asks again and the status turns to sent', (await st(page)).calls[0].status === 'sent', (await st(page)).calls);
  const gets = T.sent.filter((x) => x.method === 'GET' && x.path === 'requests');
  check('3 while her request waited, the app asked with her token', gets.length >= 1 && gets[gets.length - 1].auth === 'Bearer test', gets.map((x) => x.auth));
  await go(page, '#home'); await page.evaluate(() => { window.Saathi.mem.calls = null; }); await go(page, '#ask'); await settle(page, 400);
  const g2 = T.sent.filter((x) => x.method === 'GET' && x.path === 'requests').pop();
  check('3 once it was sent, Ask goes back to asking without her token', g2 && g2.auth === '', g2);
  await cleanup(Object.assign(T, { name: '3' }));
}

/* ---------- 4. When it can't go: off, too soon, offline, refused ---------- */
{
  let ans = [503, { error: 'handoff_off' }];
  const T = await open({ server: (m, p, b) => server({ post: () => ans })(m, p, b), hash: '#ask-call' });
  const { page } = T;
  await settle(page, 400);
  await typeTopic(page, 'Cramps');
  await tap(page, '#ac-send');
  check('4 switched off on the server: she is told, with the booking link, and nothing is kept', /isn’t taking call requests/.test(await view(page)) && !!(await page.$('#ac-err #ac-book')) && !(await st(page)).calls.length);
  await go(page, '#ask'); await settle(page, 200);
  check('4 and the call card is gone from Ask', !(await page.$('#ask-call')));
  await page.evaluate(() => { window.Saathi.mem.calls = null; }); await go(page, '#home'); await go(page, '#ask'); await settle(page, 600);
  await tap(page, '#ask-call [data-go="ask-call"]');
  check('4 her words are still there when she comes back', (await page.$eval('#ac-topic', (i) => i.value)) === 'Cramps');
  ans = [429, { error: 'too_many', retry_after: 290 }]; await tap(page, '#ac-send');
  check('4 asked a few minutes ago: try again in 5 min', /Try again in 5 min/.test(await view(page)));
  ans = [429, { error: 'too_many', retry_after: 50000 }]; await tap(page, '#ac-send');
  check('4 three times today: try tomorrow, with the booking link', /three times today/.test(await view(page)) && !!(await page.$('#ac-err #ac-book')));
  ans = 'offline'; await tap(page, '#ac-send');
  check('4 offline: nothing was sent', /You’re offline/.test(await view(page)));
  ans = [500, { error: 'server_error' }]; await tap(page, '#ac-send');
  check('4 server down: try again in a few minutes', /isn’t answering/.test(await view(page)));
  check('4 none of them was kept as a request on the phone', !(await st(page)).calls.length);
  await cleanup(Object.assign(T, { name: '4' }));
}

/* ---------- 5. Hindi, and a report language for the doctor ---------- */
{
  let got = null;
  const T = await open({ server: server({ post: (b) => { got = b; return [201, { ref: 'QC-HINDI2', status: 'sent' }]; } }), hash: '#ask-call', seed: { lang: 'hi' } });
  const { page } = T;
  await settle(page, 400);
  const v = await view(T.page);
  check('5 Hindi: the screen is in Hindi', /Qura से कॉल माँगें/.test(v) && /कुछ भी टिक नहीं है/.test(v) && /Qura को ठीक यही मिलेगा/.test(v), v.slice(0, 300));
  await typeTopic(page, 'पीरियड देर से'); await tick(page, 'periods');
  await tap(page, '[data-ac-lang="en"]');
  const prev = await page.$$eval('#ac-preview li', (xs) => xs.map((x) => x.innerText));
  check('5 she can show the doctor her periods in English while Sakhi stays in Hindi', prev.some((l) => /^Last period started/.test(l)) && /Qura से कॉल माँगें/.test(await view(page)), prev);
  await tap(page, '#ac-send'); await settle(page, 300);
  check('5 the request says her language is Hindi and the lines are English', got && got.lang === 'hi' && got.shared_data.report_lang === 'en' && got.topic === 'पीरियड देर से', got);
  check('5 the done screen is in Hindi', /Qura को आपका अनुरोध मिल गया/.test(await view(page)));
  await cleanup(Object.assign(T, { name: '5' }));
}

/* ---------- 6. A long diary is trimmed to fit, and the screen says so ---------- */
{
  let got = null; let raw = '';
  /* 31 days of long notes in Hindi (3 bytes a letter) and four long questions: more than the server takes */
  const notes = {}; for (let i = 0; i <= 30; i++) notes[ago(i)] = 'N' + i + ' ' + 'क'.repeat(400);
  const T = await open({ server: (m, p, b) => { if (m === 'POST' && p === 'requests') { got = b; raw = JSON.stringify(b); } return server({})(m, p, b); }, hash: '#ask-call', seed: { notes: notes, askTopics: [1, 2, 3, 4].map((n) => 'Q' + n + ' ' + 'ख'.repeat(400)) } });
  const { page } = T;
  await settle(page, 400);
  await typeTopic(page, 'Long notes'); await tick(page, 'notes'); await tick(page, 'periods'); await tick(page, 'questions');
  check('6 the screen says some lines were left out', /Some lines were left out/.test(await view(page)));
  const prev = await page.$$eval('#ac-preview li', (xs) => xs.map((x) => x.innerText));
  await tap(page, '#ac-send');
  check('6 what goes fits the server (under 32 KB), each line under 300 characters', got && Buffer.byteLength(raw) < 32768 && got.shared_data.sections.every((x) => x.lines.every((l) => l.length <= 300)), Buffer.byteLength(raw));
  const nl = got ? got.shared_data.sections.find((x) => x.key === 'notes').lines : [];
  check('6 the newest notes stay, the oldest go, and it matches the screen', got && JSON.stringify(got.shared_data.sections.flatMap((x) => x.lines)) === JSON.stringify(prev) && nl.some((l) => /: N0 /.test(l)) && !nl.some((l) => /: N30 /.test(l)) && nl.length < 31, nl.map((l) => l.slice(0, 14)));
  check('6 her own questions and the periods table stay whole', got && got.shared_data.sections.find((x) => x.key === 'questions').lines.filter((l) => /^Q\d /.test(l)).length === 4 && got.shared_data.sections.find((x) => x.key === 'periods').lines.length === 2);
  await cleanup(Object.assign(T, { name: '6' }));
}

/* ---------- 7. Who never sees it ---------- */
{
  const S = await open({ server: server({}), hash: '#ask', noAcct: true, seed: { sample: 'priya' } });
  await settle(S.page, 600);
  check('7 a sample woman on a real server: no card, and nothing asked of the server', !(await S.page.$('#ask-call')) && !S.sent.some((x) => x.path === 'requests'));
  await cleanup(Object.assign(S, { name: '7 sample' }));
  const W = await open({ cfg: { app: 'web-prototype', platform: 'web' }, hash: '#ask', noAcct: true, seed: { sample: 'priya' } });
  await settle(W.page, 800);
  check('7 the web prototype: the stand-in server offers it, and nothing leaves the page', !!(await W.page.$('#ask-call')) && !W.sent.length);
  await tap(W.page, '#ask-call [data-go="ask-call"]'); await typeTopic(W.page, 'Demo'); await tap(W.page, '#ac-send'); await settle(W.page, 600);
  check('7 the stand-in answers like Qura: sent, with a QC- reference, and still nothing sent anywhere', /Qura has your request/.test(await view(W.page)) && /QC-[A-HJ-NP-Z2-9]{6}/.test(await view(W.page)) && /your mobile number/.test(await view(W.page)) && !W.sent.length);
  await cleanup(Object.assign(W, { name: '7 web' }));
}

/* ---------- 8. The privacy notice says what goes ---------- */
{
  const T = await open({ server: server({}), hash: '#me-about' });
  check('8 the notice says what goes to Qura when she asks for a call, and that the server deletes it', /If you ask Qura to call you/.test(await view(T.page)) && /deletes them once Qura has them/.test(await view(T.page)));
  await cleanup(Object.assign(T, { name: '8' }));
}

/* ---------- 9. Deleting her Sakhi account says requests already sent stay with Qura (Mohit, 23 Oct: Qura keeps them as leads) ---------- */
{
  const T = await open({ server: server({}), hash: '#account', seed: { calls: [{ ref: 'QC-SENT22', d: TODAY, topic: 'Cramps', shared: [], status: 'sent' }] } });
  await tap(T.page, '#acc-del');
  check('9 with a request sent to Qura, the delete warning says it stays with Qura\'s care team', /Calls you asked Qura for stay with Qura’s care team/.test(await view(T.page)), (await view(T.page)).slice(-400));
  await cleanup(Object.assign(T, { name: '9 sent' }));
  const N = await open({ server: server({}), hash: '#account' });
  await tap(N.page, '#acc-del');
  check('9 with none sent, the warning is as before', /Delete your Sakhi account\?/.test(await view(N.page)) && !/Calls you asked Qura for/.test(await view(N.page)));
  await cleanup(Object.assign(N, { name: '9 none' }));
}

/* ---------- 10. Only what a doctor needs goes (Mohit, 23 Oct: "only relevant for doctor should push through") ---------- */
{
  const W = await open({ cfg: { app: 'web-prototype', platform: 'web' }, hash: '#home', noAcct: true });
  await W.page.evaluate(() => { const S = window.Saathi; S.loadSample('priya'); S.state.settings.toursAuto = false; S.state.langChosen = true; S.save(); location.hash = '#ask-call'; S.render(); });
  await settle(W.page, 500);
  await W.page.$$eval('[data-ac-sec]', (xs) => xs.forEach((c) => { c.checked = true; c.dispatchEvent(new Event('change')); })); await settle(W.page, 500);
  const all = await W.page.$$eval('#ac-preview li', (xs) => xs.map((x) => x.innerText));
  check('10 the app\'s own "see a doctor" flags, checklists, reminders and the catch-all question stay on her phone', all.length > 10 && !all.some((l) => /What your diary shows|checklist|Next: |keep an eye on|Days logged|No score, no diagnosis/.test(l)), all);
  /* Version 39.83: with 2 complete cycles with notes, her symptoms are her report's "When it comes", a line a sign */
  check('10 her symptoms come a line a sign, her top five, as her report\'s "When it comes"', all.filter((l) => /^(Cramps|Bloating|Acne|Low mood|Tired): (1 day|\d+ days) before my period, \d+ during, \d+ other$/.test(l)).length === 5 && all.includes('Cramps: 0 days before my period, 4 during, 0 other') && all.includes('Bloating: 1 day before my period, 1 during, 0 other'), all);
  check('10 each check-in sign once, with in how many months', all.includes('Coarse dark hair on lip, chin, chest, belly or back: 3 of 3 months') && !all.some((l) => /^July 2026/.test(l)));
  check('10 the clinical tools go whole, one fact a line: results, medicines, trying since, the cycle pattern', all.includes('My lab results: TSH: 3.1 mIU/L (10 Sept 2026; Report range 0.27–4.2)') && all.some((l) => /^Current medicines: Metformin/.test(l)) && all.some((l) => /^Trying for a baby: Trying since/.test(l)) && all.some((l) => /^Mood and body through your cycle: Most logged in the 7 days before a period/.test(l)) && !all.some((l) => /…$/.test(l)));
  await go(W.page, '#report');
  check('10 her own report for any doctor is unchanged: the full table and the catch-all question', /Days of bleeding/.test(await view(W.page)) && /keep an eye on/.test(await view(W.page)));
  await cleanup(Object.assign(W, { name: '10' }));
}

await browser.close();
const bad = results.filter((r) => !r.pass);
console.log(bad.length ? 'HANDOFF FAIL ' + (results.length - bad.length) + '/' + results.length : 'HANDOFF OK ' + results.length + '/' + results.length);
process.exit(bad.length ? 1 : 0);
