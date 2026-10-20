// Tests server/scripts/set-qura-keys.sh with stand-in `curl` and `supabase` commands: what it saves, when it stops, and
// that it never prints a key, even when Meta's error repeats the token (it did on 20 Oct 2026). The real Supabase CLI is
// kept off PATH and the project ref points nowhere, so nothing here can reach the live server.
// Usage: node server/test/set-qura-keys.test.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const script = path.resolve(here, '..', 'scripts', 'set-qura-keys.sh');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sakhi-keys-'));
const bin = path.join(dir, 'bin');
fs.mkdirSync(bin);
const log = path.join(dir, 'calls.log');
fs.writeFileSync(path.join(bin, 'curl'), '#!/bin/sh\necho "curl $*" >> "$LOG"\nprintf \'%s\' "$CURL_OUT"\n', { mode: 0o755 });
fs.writeFileSync(path.join(bin, 'supabase'), '#!/bin/sh\necho "supabase $*" >> "$LOG"\n'
  + 'case "$*" in *"secrets list"*) printf \'   NAME | DIGEST\\n  ---|---\\n   SAKHI_META_TOKEN | aa\\n\';; *) echo "Finished supabase secrets set.";; esac\n', { mode: 0o755 });

const results = [];
const check = (name, cond, extra) => { results.push({ name, pass: !!cond }); if (!cond) console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 400)); };
const REF = 'test-not-a-project';
const TOKEN = 'EAAfake' + 'Q7x'.repeat(40);
const OK = JSON.stringify({ display_phone_number: '+91 98765 43210', verified_name: 'Qura', id: '1234567890' });
const META_190 = JSON.stringify({ error: { message: 'Malformed access token ' + TOKEN, type: 'OAuthException', code: 190 } });
const META_100 = JSON.stringify({ error: { message: 'Unsupported get request. Token ' + TOKEN, type: 'GraphMethodException', code: 100, error_subcode: 33 } });
const outputs = [];

function run(lines, curlOut) {
  fs.writeFileSync(log, '');
  const r = spawnSync('/bin/bash', [script], {
    input: lines.join('\n') + '\n', encoding: 'utf8',
    env: { PATH: bin + ':/usr/bin:/bin', HOME: dir, LOG: log, CURL_OUT: curlOut, SAKHI_PROJECT_REF: REF }
  });
  const out = (r.stdout || '') + (r.stderr || '');
  outputs.push(out);
  return { code: r.status, out, calls: fs.readFileSync(log, 'utf8').split('\n').filter(Boolean) };
}
const saved = (r) => r.calls.find((c) => c.startsWith('supabase secrets set')) || '';
const KEYS = (token) => 'SAKHI_META_TOKEN=' + token + ' SAKHI_WA_PHONE_ID=1234567890 SAKHI_AUTHKEY_KEY=akey123 SAKHI_AUTHKEY_OTP_SID=1001';

/* Pasted the messy way: a whole NAME="value" line, a stray CR, single quotes */
let r = run(['META_WA_ACCESS_TOKEN="' + TOKEN + '"', '1234567890\r', "'akey123'", '1001', ''], OK);
check('clean values are saved on the named project and nowhere else', r.code === 0 && saved(r) === 'supabase secrets set --project-ref ' + REF + ' ' + KEYS(TOKEN), r.calls);
check('Meta is asked about this number ID on v21.0, and its number is shown', r.calls[0] === 'curl -s -m 20 -H Authorization: Bearer ' + TOKEN + ' https://graph.facebook.com/v21.0/1234567890?fields=display_phone_number,verified_name'
  && r.out.includes('+91 98765 43210'), r);
check('every supabase call names the project', r.calls.filter((c) => c.startsWith('supabase')).every((c) => c.includes('--project-ref ' + REF)) && r.calls.length === 3, r.calls);

r = run([TOKEN, '+919876543210', 'akey123', '1001', ''], OK);
check('a phone number pasted as the number ID stops before anything is sent or saved', r.code === 1 && r.calls.length === 0 && /not the phone number itself/.test(r.out), r);

r = run([TOKEN, '1234567890', 'akey123', '1001', '', 'y'], META_190);
check('error 190 (broken token) stops without saving, even with a "y" waiting', r.code === 1 && !saved(r) && /error 190/.test(r.out), r);

r = run([TOKEN, '1234567890', 'akey123', '1001', '', 'n'], META_100);
check('another refusal asks first, and "n" saves nothing', r.code === 1 && !saved(r) && /error 100/.test(r.out), r);
r = run([TOKEN, '1234567890', 'akey123', '1001', '', 'y'], META_100);
check('another refusal asks first, and "y" saves', r.code === 0 && saved(r).endsWith(KEYS(TOKEN)), r.calls);

for (const [label, bad] of [['a trailing ellipsis', TOKEN + '…'], ['a space inside quotes', '"' + TOKEN + ' "'], ['another service\'s key shape', 'sk_live_' + 'Q7x'.repeat(10)]]) {
  r = run([bad, '1234567890', 'akey123', '1001', ''], OK);
  check('a token with ' + label + ' stops before Meta is asked', r.code === 1 && r.calls.length === 0 && /isn't a whole Meta token/.test(r.out), r);
}
r = run(['', '1234567890', 'akey123', '1001', ''], OK);
check('an empty paste stops before anything is sent', r.code === 1 && r.calls.length === 0, r);
r = run([TOKEN], OK);
check('input that ends early saves nothing', r.code === 1 && !saved(r), r);

r = run([TOKEN, '1234567890', 'akey123', '1001', 'v22.0'], OK);
check('a graph version is used for the check and saved', r.code === 0 && r.calls[0].includes('/v22.0/') && saved(r).endsWith(KEYS(TOKEN) + ' SAKHI_META_GRAPH_VERSION=v22.0'), r.calls);
r = run([TOKEN, '1234567890', 'akey123', '1001', '22'], OK);
check('a malformed graph version stops before anything is sent', r.code === 1 && r.calls.length === 0, r);

check('no run ever printed the token or the AuthKey key', outputs.every((o) => !o.includes('Q7xQ7x') && !o.includes('akey123')), outputs.filter((o) => o.includes('Q7xQ7x') || o.includes('akey123')));

fs.rmSync(dir, { recursive: true, force: true });
const pass = results.filter((x) => x.pass).length;
console.log(pass + '/' + results.length + ' key-script checks pass');
process.exit(pass === results.length ? 0 : 1);
