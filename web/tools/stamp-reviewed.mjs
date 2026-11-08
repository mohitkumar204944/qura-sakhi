#!/usr/bin/env node
/* Version 39.85 (L7 of docs/teach-and-show-advice-2026-11-08.md; MODULE_API section 128): the record of the doctors' check on
   Learn articles, behind "Checked by doctors · {month}" on the article page.

     node tools/stamp-reviewed.mjs <YYYY-MM> <group.id ...>   stamp those articles: the doctors checked them in that month
     node tools/stamp-reviewed.mjs <YYYY-MM> --all            stamp every article
     node tools/stamp-reviewed.mjs --list                     each article: checked (and when), changed since, or not stamped
     node tools/stamp-reviewed.mjs --same-as <content.json>   the articles whose words match an older library, word for word

   A stamp is { at: 'YYYY-MM', h: <fingerprint> } on the article in content.json. The fingerprint covers every field she reads
   (RV_FIELDS: title, summary, body, see a doctor, the Qura line, in both languages, and the doctor-route paragraphs); the
   sources list is left out. The app works out the same fingerprint (core artHash) and shows the line only while the two
   match, so a changed word takes the line away until the doctors check the article again and it is stamped again.
   Stamp only what the doctors actually checked, with the month they checked it. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(HERE, '..', 'content.json');

export const RV_FIELDS = ['title_en', 'title_hi', 'summary_en', 'summary_hi', 'body_en', 'body_hi', 'see_doctor_en', 'see_doctor_hi', 'qura_line_en', 'qura_line_hi', 'doc'];
/* FNV-1a over the fields as JSON, as core's artHash */
export const artHash = (a) => { const s = JSON.stringify(RV_FIELDS.map((f) => (a[f] === undefined ? null : a[f]))); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); };
export const stateOf = (a) => (!a.reviewed ? 'none' : (a.reviewed.h === artHash(a) ? 'ok' : 'changed'));

const all = (c) => c.groups.flatMap((g) => g.articles.map((a) => [g.group + '.' + a.id, a]));
const thisMonth = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };

function main(argv) {
  const raw = fs.readFileSync(FILE, 'utf8'); const c = JSON.parse(raw); const arts = all(c);
  if (JSON.stringify(c) !== raw) { console.error('content.json is not in its usual one-line form; refusing to rewrite it'); return 1; }
  if (argv[0] === '--list') {
    const n = { ok: 0, changed: 0, none: 0 };
    arts.forEach(([k, a]) => { const s = stateOf(a); n[s]++; console.log((s === 'ok' ? 'checked ' + a.reviewed.at : (s === 'changed' ? 'CHANGED since ' + a.reviewed.at : 'not stamped')).padEnd(22) + k); });
    console.log('\n' + n.ok + ' checked, ' + n.changed + ' changed since their check, ' + n.none + ' not stamped (' + arts.length + ' articles)');
    return 0;
  }
  if (argv[0] === '--same-as') {
    if (!argv[1]) { console.error('--same-as needs an older content.json'); return 1; }
    const old = new Map(all(JSON.parse(fs.readFileSync(argv[1], 'utf8'))));
    const same = arts.filter(([k, a]) => old.has(k) && artHash(old.get(k)) === artHash(a)).map(([k]) => k);
    console.log(same.join('\n') + '\n\n' + same.length + ' of ' + arts.length + ' articles have the same words');
    return 0;
  }
  const at = argv[0]; const keys = argv.slice(1);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(at || '') || !keys.length) { console.error('usage: node tools/stamp-reviewed.mjs <YYYY-MM> <group.id ...|--all>   (or --list, or --same-as <content.json>)'); return 1; }
  if (at > thisMonth()) { console.error(at + ' is after this month'); return 1; }
  const want = keys[0] === '--all' ? arts.map(([k]) => k) : keys;
  const byKey = new Map(arts); const unknown = want.filter((k) => !byKey.has(k));
  if (unknown.length) { console.error('no such article: ' + unknown.join(', ') + ' (nothing stamped)'); return 1; }
  want.forEach((k) => { const a = byKey.get(k); a.reviewed = { at: at, h: artHash(a) }; });
  fs.writeFileSync(FILE, JSON.stringify(c));
  console.log('stamped ' + want.length + ' article' + (want.length === 1 ? '' : 's') + ' as checked in ' + at);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
