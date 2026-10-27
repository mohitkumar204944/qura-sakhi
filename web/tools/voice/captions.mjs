// Wind down (Version 39.24): Dr. Megha's words for the captions on the session screen, from the scripts her recordings were
// made from (sessions.json). Each clip is split at its <#x#> pauses, the way timeline.mjs splits it, so a list's parts (yoga
// nidra's body parts) line up with the items in sounds/timelines.js. Remake it whenever a script changes.
// Usage: node tools/voice/captions.mjs   (from web/; writes sounds/captions.js)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const spec = JSON.parse(fs.readFileSync(path.join(here, 'sessions.json'), 'utf8'));
const used = new Set();
['breaths', 'bhramari', 'nidra'].forEach((s) => (spec.sessions[s] || []).forEach(([id]) => used.add(id)));
const out = {};
for (const lang of ['en', 'hi']) {
  out[lang] = {};
  for (const id of [...used].sort()) {
    const tx = (spec.clips[lang] || {})[id];
    if (tx) out[lang][id] = tx.split(/<#[0-9.]+#>/).map((x) => x.trim()).filter(Boolean);
  }
}
const head = "/* Wind down (Version 39.24): Dr. Megha's words, for the captions on the session screen. Made by tools/voice/captions.mjs from\n" +
  "   tools/voice/sessions.json, the scripts her recordings were made from; remake it whenever a script changes. Each clip is split\n" +
  "   at its pauses, so a list's parts line up with the items in sounds/timelines.js. */\n";
const file = path.join(here, '..', '..', 'sounds', 'captions.js');
fs.writeFileSync(file, head + 'window.SAKHI_CALM_CAP = ' + JSON.stringify(out) + ';\n');
console.log('captions.js:', Object.keys(out.en).length, 'English clips,', Object.keys(out.hi).length, 'Hindi clips');
