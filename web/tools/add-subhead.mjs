#!/usr/bin/env node
/* Version 39.88 (MODULE_API section 131): add a subhead the doctors approved to a Learn article.

     node tools/add-subhead.mjs <group.id> <paragraph> "<English>" "<Hindi>"

   It puts "## English" and "## Hindi" before that paragraph (counted from 0) in body_en and body_hi, and moves the article's
   doctor-route paragraphs (doc.body_en, doc.body_hi, keyed by position) along with the text they replace, so each still lands on
   its own paragraph. A subhead is a change to the words she reads: the article's "Checked by doctors" line goes until the doctors'
   check is recorded again (node tools/stamp-reviewed.mjs <YYYY-MM> <group.id>). Add only subheads the doctors approved. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(HERE, '..', 'content.json');

export function addSubhead(c, key, at, en, hi) {
  const [g, id] = String(key).split('.'); const grp = (c.groups || []).find((x) => x.group === g); const a = grp && grp.articles.find((x) => x.id === id);
  if (!a) throw new Error('no such article: ' + key);
  if (!en || !hi || /^\s*#/.test(en) || /^\s*#/.test(hi)) throw new Error('give the subhead in English and in Hindi, without "##"');
  const n = (a.body_en || []).length; if ((a.body_hi || []).length !== n) throw new Error(key + ': its English and Hindi bodies have different lengths');
  if (!(at >= 0 && at <= n) || at !== Math.floor(at)) throw new Error('paragraph must be 0 to ' + n);
  a.body_en.splice(at, 0, '## ' + en.trim()); a.body_hi.splice(at, 0, '## ' + hi.trim());
  ['body_en', 'body_hi'].forEach((f) => { const o = a.doc && a.doc[f]; if (!o) return; const out = {}; Object.keys(o).forEach((k) => { const i = +k; out[i >= at ? i + 1 : i] = o[k]; }); a.doc[f] = out; });
  return a;
}

function main(argv) {
  const [key, at, en, hi] = argv;
  if (!key || at == null || !en || !hi) { console.error('usage: node tools/add-subhead.mjs <group.id> <paragraph> "<English>" "<Hindi>"'); return 1; }
  const raw = fs.readFileSync(FILE, 'utf8'); const c = JSON.parse(raw);
  if (JSON.stringify(c) !== raw) { console.error('content.json is not in its usual one-line form; refusing to rewrite it'); return 1; }
  try { addSubhead(c, key, +at, en, hi); } catch (e) { console.error(e.message + ' (nothing changed)'); return 1; }
  fs.writeFileSync(FILE, JSON.stringify(c));
  console.log('added "' + en + '" before paragraph ' + at + ' of ' + key + '. Its "Checked by doctors" line goes until you record the doctors\' check again:\n  node tools/stamp-reviewed.mjs <YYYY-MM> ' + key);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
