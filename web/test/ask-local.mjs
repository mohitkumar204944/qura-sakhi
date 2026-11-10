// Ask Sakhi end to end on this Mac (Version 40.5.3, 10 Nov 2026; Mohit: "you sign in using a seeded test account and test
// thoroughly"). The real app (web/) in a browser signs up with a test number against the real server code: sakhi-api (api.js) and
// sakhi-chat (chat.js, the file the live function runs), on a real Postgres (PGlite, every migration), served over https on
// 127.0.0.1 at the live functions' own paths, with the real Claude Haiku 5.5. The sign-in code is the one this run's server makes,
// captured instead of sent. Then it asks the phone test's 11 chats (ask-chats.mjs) and the scenario suite's stage-* cases through
// the Ask tab, and checks each answer as the screen shows it.
// It never touches the live server or a phone, and the test account lives only in this run's database. The certificate is made for
// the run and thrown away; only this test's browser is told to accept it (the app turns Ask on for an https address only).
// It costs a few cents (about US$0.0005 an answer). Needs, as server/scripts/chat-eval.mjs does, the SDK in ~/.cache/sakhi-eval and
// the prototype's key outside the repo (~/.config/sakhi/anthropic-key); never printed.
// Usage (from web/): node test/ask-local.mjs [only,ids]     (ids: the chats' ids, or "stage" for the stage cases)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import https from 'node:https';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from './pw.mjs';
import { join } from './join.mjs';
import { CHATS, notAsHers, has, not } from './ask-chats.mjs';
import { createApi } from '../../server/supabase/functions/sakhi-api/api.js';
import { pgStore } from '../../server/supabase/functions/sakhi-api/store-pg.js';
import { createChat } from '../../server/supabase/functions/sakhi-chat/chat.js';
import { chatStore } from '../../server/supabase/functions/sakhi-chat/store-pg.js';
import { pgliteDb, pgQuery, fakeSender, ENV } from '../../server/test/harness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const web = path.resolve(here, '..');
const ROOT = path.resolve(web, '..');
const OUT = path.join(here, 'shots', 'ask-local');
const ONLY = (process.argv[2] || '').split(',').filter(Boolean);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* the model, as the live function calls it (index.ts): streamed when the phone streams */
const keyFile = path.join(os.homedir(), '.config', 'sakhi', 'anthropic-key');
const key = (process.env.ANTHROPIC_API_KEY || (fs.existsSync(keyFile) ? fs.readFileSync(keyFile, 'utf8') : '')).trim();
if (!key) { console.log('No key: see the top of server/scripts/chat-eval.mjs.'); process.exit(2); }
const sdk = createRequire(path.join(process.env.SAKHI_SDK_DIR || path.join(os.homedir(), '.cache', 'sakhi-eval'), 'x.js'))('@anthropic-ai/sdk');
const Anthropic = sdk.Anthropic || sdk.default || sdk;
const client = new Anthropic({ apiKey: key, timeout: 60_000, maxRetries: 2 });
const claude = async (params, onText) => {
  if (!onText) return client.messages.create(params);
  const stream = client.messages.stream(params); stream.on('text', (d) => onText(d)); return await stream.finalMessage();
};

/* both functions on one database, as on Supabase; the careful tries counted by the net that asked for them */
const db = await pgliteDb();
const send = fakeSender();
const retries = {};
const api = createApi({ store: pgStore(pgQuery(db)), send, env: Object.assign({}, ENV), now: Date.now });
const chat = createChat({ store: chatStore(pgQuery(db)), claude, env: { SAKHI_CHAT_ACCT_DAY_MAX: '1000', SAKHI_CHAT_DAY_MAX: '1000' }, now: Date.now,
  log: (ev, d) => { if (ev === 'chat_retry') { const k = (d && d.why) || '?'; retries[k] = (retries[k] || 0) + 1; } } });

/* https on 127.0.0.1 with a throwaway certificate; each request goes to its function as a web Request, the answer streamed back */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ask-local-'));
execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', path.join(tmp, 'key.pem'), '-out', path.join(tmp, 'cert.pem'), '-days', '1', '-subj', '/CN=127.0.0.1'], { stdio: 'ignore' });
const srv = https.createServer({ key: fs.readFileSync(path.join(tmp, 'key.pem')), cert: fs.readFileSync(path.join(tmp, 'cert.pem')) }, async (req, res) => {
  try {
    const chunks = []; for await (const c of req) chunks.push(c);
    const body = Buffer.concat(chunks);
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
    headers.set('x-forwarded-for', '127.0.0.1');
    const fn = req.url.indexOf('/functions/v1/sakhi-chat/') === 0 ? chat : req.url.indexOf('/functions/v1/sakhi-api/') === 0 ? api : null;
    if (!fn) { res.writeHead(404); res.end(); return; }
    const out = await fn(new Request('https://127.0.0.1' + req.url, { method: req.method, headers, body: body.length && req.method !== 'GET' && req.method !== 'HEAD' ? body : undefined }));
    res.writeHead(out.status, Object.fromEntries(out.headers));
    if (out.body) { const rd = out.body.getReader(); for (;;) { const { done, value } = await rd.read(); if (done) break; res.write(Buffer.from(value)); } }
    res.end();
  } catch (e) { res.writeHead(500); res.end(); console.log('server error:', String(e && e.message).slice(0, 200)); }
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const BASE = 'https://127.0.0.1:' + srv.address().port + '/functions/v1/';

/* the app in a browser at the Flip5's width, told to accept this run's certificate */
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }, locale: 'en-IN', timezoneId: 'Asia/Kolkata', ignoreHTTPSErrors: true });
await ctx.addInitScript('window.SAKHI_CONTENT = ' + fs.readFileSync(path.join(web, 'content.json'), 'utf8') + ';');
await ctx.addInitScript('window.SAKHI_CONFIG = ' + JSON.stringify({ api: BASE + 'sakhi-api', chat: BASE + 'sakhi-chat', app: '0.40.5.3-ask-local', platform: 'web' }) + ';');
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
const page = await ctx.newPage();
const errs = []; page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 200)));
const tap = (sel) => page.$eval(sel, (el) => el.click());

const results = []; const log = [];
const check = (chatId, turn, name, pass) => { results.push({ chat: chatId, turn, check: name, pass: !!pass }); log.push('  ' + (pass ? 'PASS ' : 'FAIL ') + name); };

/* she joins and signs up with a test number; the code is the one the server made */
await page.goto(pathToFileURL(path.join(web, 'index.html')).href + '#home', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => !!window.Saathi);
await join(page, { tile: 'cycle', goals: ['track'], care: 'private' });   /* her own doctor, as the team phone's account */
await page.waitForSelector('#su-num');
await page.evaluate(() => { window.Saathi.state.settings.toursAuto = false; window.Saathi.save(); });
await page.fill('#su-num', '98765 43210'); await tap('#su-send');
await page.waitForSelector('#su-code');
await page.fill('#su-code', send.lastCode());
await page.waitForSelector('#su-name');
await page.fill('#su-name', 'Asha'); await page.fill('#su-pin', '560001'); await tap('#su-done');
await page.waitForSelector('#ys-skip'); await tap('#ys-skip');
await page.waitForSelector('.card.hero');
const signedIn = (await db.query('select count(*)::int as n from sakhi.sessions')).rows[0].n === 1;
log.push('# Ask Sakhi on this Mac: the real app, both functions and Claude Haiku 5.5 (' + new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC)', '',
  'Signed up with a test number on this run\'s own server: ' + (signedIn ? 'one session in its database' : 'NO SESSION') + '.', '');
if (!signedIn) { console.log('Sign-up did not reach the server.'); process.exit(1); }

/* the Ask tab, its notice accepted */
await page.evaluate(() => { location.hash = 'ask-sakhi'; });
await page.waitForSelector('#chat-ok', { timeout: 15000 }); await tap('#chat-ok');
await page.waitForSelector('#chat-q');

/* what the screen shows for her latest answer */
const readLast = () => page.evaluate(() => {
  /* a finished answer carries its Listen button (or, failed, Try again); the one still streaming in carries neither */
  const v = document.querySelector('#view'); const all = [...v.querySelectorAll('.chat-msg.sakhi')].filter((m) => m.querySelector('[data-chat-say], [data-chat-retry], .chat-fail')); const last = all[all.length - 1];
  if (!last) return { n: 0 };
  /* the first sentence and each point on a line of its own, as the phone test reads them; the doctors' line apart */
  const txt = last.querySelector('.chat-txt'); let answer = ''; let med = '';
  if (txt) {
    const m = txt.querySelector('.chat-med'); if (m) med = m.textContent.trim();
    answer = [...txt.querySelectorAll('p, li')].filter((e) => !e.closest('.chat-med')).map((e) => e.textContent.trim()).filter(Boolean).join('\n');
  }
  /* its rows: the guides and the doctor-checked pages (both in .chat-guides), the doctor question and the screens */
  const rows = [...last.querySelectorAll('.chat-guides button, .chat-doc button, .chat-screens [data-go]')].map((b) => b.innerText.trim()).filter(Boolean);
  return { n: all.length, answer, med, rows, urgent: !!v.querySelector('.chat-urg'), failed: !!last.querySelector('.chat-fail') || !txt };
});
const count = () => page.evaluate(() => [...document.querySelectorAll('#view .chat-msg.sakhi')].filter((m) => m.querySelector('[data-chat-say], [data-chat-retry], .chat-fail')).length);
async function waitAnswer(before, ms = 90000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    await sleep(500);
    const busy = await page.$('#view .chat-msg.sakhi.busy, #chat-live');
    if (!busy && (await count()) > before) { await sleep(300); return { x: await readLast(), secs: (Date.now() - t0) / 1000 }; }
  }
  return { x: await readLast(), secs: (Date.now() - t0) / 1000, timeout: true };
}
async function askTyped(q) { const before = await count(); await page.fill('#chat-q', q); await tap('#chat-send'); return waitAnswer(before); }
async function askChip(re, sel) {
  const b = await page.evaluateHandle(([src, flags, s]) => { const re = new RegExp(src, flags); return [...document.querySelectorAll(s)].filter((e) => re.test(e.dataset.chatEx || '')).pop() || null; }, [re.source, re.flags, sel]);
  const el = b.asElement(); if (!el) return null;
  const q = await el.evaluate((e) => e.dataset.chatEx); const before = await count(); await el.evaluate((e) => e.click());
  const r = await waitAnswer(before); r.q = q; return r;
}
async function clearChat() { if (await page.$('#chat-clear')) { await tap('#chat-clear'); await sleep(400); } return !(await page.$('#view .chat-msg')); }
const show = (r, q) => {
  const x = r.x;
  log.push('- ' + q + '  (' + r.secs.toFixed(1) + ' s' + (r.timeout ? ', TIMED OUT' : '') + ')', '  ' + (x.failed ? '(Sakhi couldn’t answer this)' : String(x.answer).replace(/\n/g, '\n  ')));
  if (x.med) log.push('  [under it] ' + x.med);
  if (x.rows && x.rows.length) log.push('  [rows] ' + x.rows.join(' | '));
  if (x.urgent) log.push('  [Help\'s card on top]');
};

/* 1. the phone test's chats */
for (const c of CHATS) {
  if (ONLY.length && ONLY.indexOf(c.id) < 0) continue;
  const cleared = await clearChat();
  log.push('', '## ' + c.id + (cleared ? '' : ' (the chat did not clear)'));
  for (const [i, tn] of c.turns.entries()) {
    let r = null; let q = tn.q;
    if (tn.chip) { r = await askChip(tn.chip, '.chat-ex [data-chat-ex]'); q = r && r.q; }
    else if (tn.chipFollow) { r = await askChip(tn.chipFollow, '.chat-fu-b[data-chat-ex]'); q = r && r.q; if (!r) { q = tn.fallback; r = await askTyped(q); } }
    else r = await askTyped(q);
    if (!r) { check(c.id, i + 1, 'the turn could be sent', false); break; }
    show(r, q);
    for (const [name, fn] of Object.entries(tn.checks)) check(c.id, i + 1, name, !r.timeout && !r.x.failed && fn(r.x));
  }
}

/* 2. the scenario suite's stage cases (Version 40.5.3), typed as she would; Hindi in Devanagari, which a browser can type */
const STAGE = JSON.parse(fs.readFileSync(path.join(ROOT, 'server', 'test', 'chat-cases.json'), 'utf8')).cases.filter((c) => /^stage-/.test(c.id));
const SAID = /preg-|afterbirth|twoturn/;
const IRON = /iron|आयरन/i;
const HEDGE = /if you are pregnant|if you're pregnant|agar (aap|ap) pregnant|अगर (आप )?गर्भवती/i;
for (const c of (ONLY.length && ONLY.indexOf('stage') < 0) ? [] : STAGE) {
  const cleared = await clearChat();
  log.push('', '## ' + c.id + ' (' + c.lang + (SAID.test(c.id) ? ', she says she is pregnant or had a baby' : ', she never says she is pregnant') + ')' + (cleared ? '' : ' (the chat did not clear)'));
  for (const [i, q] of c.turns.entries()) {
    const r = await askTyped(q); show(r, q);
    const ok = (fn) => !r.timeout && !r.x.failed && fn(r.x);
    check(c.id, i + 1, 'answered', ok(() => true));
    check(c.id, i + 1, c.lang === 'hi' ? 'in Devanagari' : 'in Roman letters', ok(c.lang === 'hi' ? has(/[ऀ-ॿ]{4}/) : not(/[ऀ-ॿ]/)));
    const lastTurn = i === c.turns.length - 1;
    if (!SAID.test(c.id)) check(c.id, i + 1, 'no pregnancy facts as hers', ok(notAsHers));
    else if (lastTurn) { check(c.id, i + 1, 'her iron tablet answered for her', ok((x) => IRON.test(x.answer))); check(c.id, i + 1, 'no "if you are pregnant" (she said she is)', ok(not(HEDGE))); }
    if (c.id === 'stage-iron-remind-en') { check(c.id, i + 1, 'yes, Reminders or My medicines', ok(has(/Reminders|My medicines/i))); check(c.id, i + 1, 'does not deny it', ok(not(/\b(can.?t|cannot|can not|doesn.?t|does not)\b[^.,;]{0,30}\bremind|no reminders/i))); }
  }
}

/* 3. nothing the page sent left this run's server, and the page raised no error */
const pass = results.filter((r) => r.pass).length;
log.push('', 'Careful tries (a safety net held the first answer back): ' + (Object.keys(retries).map((k) => k + ' ' + retries[k]).join(', ') || 'none') + '.');
log.push('Page errors: ' + (errs.length ? errs.join(' | ') : 'none') + '.', '', pass + '/' + results.length + ' local Ask checks pass');
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'last-run.md'), log.join('\n') + '\n');
console.log(log.join('\n'));
console.log('\n' + pass + '/' + results.length + ' local Ask checks pass · careful tries: ' + (Object.keys(retries).map((k) => k + ' ' + retries[k]).join(', ') || 'none') + ' · test/shots/ask-local/last-run.md');
await browser.close(); srv.close(); fs.rmSync(tmp, { recursive: true, force: true });
process.exit(pass === results.length && !errs.length ? 0 : 1);
