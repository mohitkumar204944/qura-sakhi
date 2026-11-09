// Ask Sakhi's 30-question eval for the doctors (Version 40, prototype; server/SERVER_SPEC.md section 12). Each question goes through
// the same code the phone and the server run: on the phone, the danger-sign check (Help's card) and the guides search would show
// if Sakhi couldn't answer; on the server, chat.js with the real Claude Haiku 5.5 (the official SDK, as index.ts calls it). The
// table it writes has a blank "Doctor's verdict" column (safe, unsafe or not helpful) for the doctors.
//
// It costs money: about US$0.002 to US$0.01 a question, well under US$0.50 for all 30. It needs:
//   - the Anthropic SDK, once, outside the repo (the repo's node_modules stays as package.json has it):
//       mkdir -p ~/.cache/sakhi-eval && cd ~/.cache/sakhi-eval && echo '{"private":true}' > package.json && npm install @anthropic-ai/sdk@1.6.0
//     (or SAKHI_SDK_DIR for another folder; an SDK in the repo's node_modules is used first)
//   - the prototype's key, never on a command line or in a file in this repo: ANTHROPIC_API_KEY in the environment, or a file
//     outside the repo (default ~/.config/sakhi/anthropic-key, or SAKHI_ANTHROPIC_KEY_FILE). It is never printed or logged.
// Usage: node server/scripts/chat-eval.mjs --go [--out <file.md>] [--only 1,8,30]
//   (without --go it lists the questions and what they would cost, and calls nothing)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { createChat, MODEL } from '../supabase/functions/sakhi-chat/chat.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..', '..');
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const GO = args.includes('--go');
const OUT = arg('--out', path.join(os.homedir(), 'Downloads', 'sakhi-unicef-handoff', 'ask-sakhi-eval.md'));
const ONLY = (arg('--only', '') || '').split(',').map(Number).filter(Boolean);
const QS = JSON.parse(fs.readFileSync(path.join(ROOT, 'server', 'test', 'chat-eval-questions.json'), 'utf8')).questions.filter((q) => !ONLY.length || ONLY.includes(q.n));
/* Claude Haiku 5.5's list prices (prompts under 100K tokens), US$ per million tokens: input, cache write (5 minutes), cache read, output */
const PRICE = { in: 0.10, write: 0.125, cached: 0.01, out: 0.50 };
const cost = (u) => (u.in * PRICE.in + u.write * PRICE.write + u.cached * PRICE.cached + u.out * PRICE.out) / 1e6;

/* ---------- the phone's side, in the real app: Help's card and the guides search ---------- */
async function phoneSide() {
  const { chromium } = await import(pathToFileURL(path.join(ROOT, 'web', 'test', 'pw.mjs')).href);
  const content = fs.readFileSync(path.join(ROOT, 'web', 'content.json'), 'utf8');
  const browser = await chromium.launch(); const out = {};
  for (const preg of [false, true]) {
    const ctx = await browser.newContext({ timezoneId: 'Asia/Kolkata' });
    await ctx.addInitScript('window.SAKHI_CONTENT = ' + content + ';');
    await ctx.addInitScript('window.SAKHI_CONFIG = { app: "0.40-ask-proto", platform: "web" };');
    const seed = { lang: 'en', langChosen: true, stage: 'app', dob: '1995-01-01', consent: { c1: '2026-01-01' }, situation: preg ? { pregnant: true, dueDate: '2027-01-20' } : {}, events: [], settings: { toursAuto: false }, tours: {}, fullTour: { st: 'done' }, prompts: { setup: 'off' } };
    await ctx.addInitScript('localStorage.setItem("qura-saathi-v1", ' + JSON.stringify(JSON.stringify(seed)) + ');');
    await ctx.route(/^https?:/, (r) => r.fulfill({ status: 200, body: '{}' }));
    const page = await ctx.newPage();
    await page.goto(pathToFileURL(path.join(ROOT, 'web', 'index.html')).href + '#care');
    await page.waitForFunction(() => !!window.Saathi && !!window.Saathi.chat);
    for (const q of QS.filter((x) => !!x.preg === preg)) out[q.n] = await page.evaluate((s) => ({ card: window.Saathi.chat.danger(s), guides: window.Saathi.chat.guides(s), sent: window.Saathi.chat.scrub(s) }), q.q);
    await ctx.close();
  }
  await browser.close();
  return out;
}

function readKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY.trim();
  const f = process.env.SAKHI_ANTHROPIC_KEY_FILE || path.join(os.homedir(), '.config', 'sakhi', 'anthropic-key');
  if (path.resolve(f).startsWith(ROOT + path.sep)) { console.log('The key file must be outside the repo.'); process.exit(2); }
  try { return fs.readFileSync(f, 'utf8').trim(); } catch (e) { return ''; }
}

const cell = (s) => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
const phoneCard = (k) => (k === 's1a' ? 'Yes (late period + pain or fainting)' : k === 's1b' ? 'Yes (bleeding + dizziness)' : k === 's1d' ? 'Yes (bladder control + numbness)' : k === 'p' ? 'Yes (pregnancy danger words)' : 'No');

const phone = await phoneSide();
if (!GO) {
  QS.forEach((q) => console.log(q.n + '. [' + q.lang + ', ' + q.kind + '] ' + q.q + '  | phone card: ' + phoneCard(phone[q.n].card) + ' | guides if it fails: ' + phone[q.n].guides.join(', ')));
  console.log('\n' + QS.length + ' questions, about US$' + (QS.length * 0.004).toFixed(2) + ' (up to US$' + (QS.length * 0.012).toFixed(2) + '). Nothing was sent. Run again with --go to ask Claude.');
  process.exit(0);
}
const key = readKey();
if (!key) { console.log('No key: set ANTHROPIC_API_KEY in this terminal, or put the key in ~/.config/sakhi/anthropic-key (outside the repo).'); process.exit(2); }
let Anthropic;
try { Anthropic = (await import('@anthropic-ai/sdk')).default; } catch (e) {
  try { const m = createRequire(path.join(process.env.SAKHI_SDK_DIR || path.join(os.homedir(), '.cache', 'sakhi-eval'), 'x.js'))('@anthropic-ai/sdk'); Anthropic = m.Anthropic || m.default || m; } catch (e2) {
    console.log('The Anthropic SDK is not installed: see the top of this file (~/.cache/sakhi-eval).'); process.exit(2); }
}
const client = new Anthropic({ apiKey: key, timeout: 30_000, maxRetries: 1 });

/* the server's code, with a stand-in database: one signed-in account, no limits hit, nothing kept */
const store = { sessionAccount: async () => ({ id: 'eval', birth_year: 1990 }), hit: async () => 1, dayCount: async () => 0, bump: async () => {} };
const logs = [];
const chat = createChat({ store, claude: (p) => client.messages.create(p), env: { SAKHI_CHAT_ACCT_DAY_MAX: '1000', SAKHI_CHAT_DAY_MAX: '1000' }, log: (e, d) => logs.push({ e, d }) });

const rows = [];
for (const q of QS) {
  const p = phone[q.n];
  const t0 = Date.now();
  const res = await chat(new Request('https://eval.local/functions/v1/sakhi-chat/v1/chat', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer eval_' + 'x'.repeat(40) }, body: JSON.stringify({ messages: [{ role: 'user', text: p.sent }], lang: q.lang === 'Hindi' ? 'hi' : 'en' }) }));
  const secs = (Date.now() - t0) / 1000; const j = await res.json();
  const u = j.usage || { in: 0, write: 0, cached: 0, out: 0, calls: 0 };
  rows.push({ q, p, j, secs, u, usd: cost(u) });
  console.log(q.n + '. ' + (j.ok ? j.source + (j.danger ? ' DANGER' : '') : 'FAILED ' + (j.reason || j.error)) + ' · ' + secs.toFixed(1) + ' s · US$' + cost(u).toFixed(4));
}

const ok = rows.filter((r) => r.j.ok);
const secsAll = rows.map((r) => r.secs).sort((a, b) => a - b);
const median = secsAll[Math.floor(secsAll.length / 2)] || 0;
const total = rows.reduce((n, r) => n + r.usd, 0);
const md = [
  '# Ask Sakhi: 30-question eval for the doctors',
  '',
  'Run on ' + new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC through Sakhi\'s own code: the phone\'s danger-sign check, then the sakhi-chat server code with ' + MODEL + ' (low effort, the doctor-checked guides first). The questions were written from the Learn library\'s topics, not from any real patient.',
  '',
  '**For the doctor:** please fill in the last column for each answer: **safe**, **unsafe** or **not helpful**, with a word on why if you like.',
  '',
  '- Answered: ' + ok.length + ' of ' + rows.length + '. From the guides: ' + ok.filter((r) => r.j.source === 'guides').length + '. General information (said so in the app): ' + ok.filter((r) => r.j.source === 'general').length + '. Could not answer: ' + ok.filter((r) => r.j.source === 'none').length + '.',
  '- Danger flagged by the answer: ' + ok.filter((r) => r.j.danger).length + '. Help\'s card shown by the phone\'s own check: ' + rows.filter((r) => r.p.card).length + '.',
  '- Cost: US$' + total.toFixed(4) + ' for all ' + rows.length + ' (US$' + (total / Math.max(1, rows.length)).toFixed(4) + ' a question, about ₹' + (total / Math.max(1, rows.length) * 88).toFixed(2) + '). Time: median ' + median.toFixed(1) + ' s, slowest ' + (secsAll[secsAll.length - 1] || 0).toFixed(1) + ' s.',
  '',
  '| # | Language | Kind | Question | Help\'s card on the phone | Guides Sakhi read | Answer | Source | Danger flag | Tokens in / cache write / cache read / out | Cost (US$) | Seconds | Doctor\'s verdict |',
  '|---|---|---|---|---|---|---|---|---|---|---|---|---|',
  ...rows.map((r) => '| ' + [r.q.n, r.q.lang, r.q.kind, cell(r.q.q), phoneCard(r.p.card), cell((r.j.read || []).join(', ') || '(none)'),
    cell(r.j.ok ? r.j.answer : 'Not answered (' + (r.j.reason || r.j.error) + '). The phone shows: "Sakhi couldn\'t answer this" and the guides ' + (r.p.guides.join(', ') || '(none)')),
    r.j.ok ? r.j.source + (r.j.off_topic ? ' (off topic)' : '') : '-', r.j.ok ? (r.j.danger ? 'Yes' : 'No') : '-', r.u.in + ' / ' + r.u.write + ' / ' + r.u.cached + ' / ' + r.u.out, r.usd.toFixed(4), r.secs.toFixed(1), ' '].join(' | ') + ' |'),
  ''
].join('\n');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, md);
console.log('\nWrote ' + OUT + ' · US$' + total.toFixed(4) + ' in all · median ' + median.toFixed(1) + ' s');
