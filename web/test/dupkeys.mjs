// Finds object literals that name the same key twice in app.js and the modules. JavaScript keeps the last one without a
// word, so a new string that reuses a key silently changes every screen that showed the old one (v28: `rp_show`).
// Used by smoke.mjs. Usage on its own: node test/dupkeys.mjs [dir]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* Comments, strings, template literals and regular expressions become spaces, keeping line breaks for line numbers. */
function strip(src) {
  let out = '', i = 0; const n = src.length;
  const blank = (s) => s.replace(/[^\n]/g, ' ');
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { const j = src.indexOf('\n', i); const e = j < 0 ? n : j; out += blank(src.slice(i, e)); i = e; continue; }
    if (c === '/' && d === '*') { const j = src.indexOf('*/', i + 2); const e = j < 0 ? n : j + 2; out += blank(src.slice(i, e)); i = e; continue; }
    if (c === "'" || c === '"' || c === '`') { let j = i + 1; while (j < n && src[j] !== c) { if (src[j] === '\\') j++; j++; } out += c + blank(src.slice(i + 1, j)) + c; i = j + 1; continue; }
    if (c === '/') {   /* a regular expression when the code before it can't end a value */
      const prev = out.replace(/\s+$/, '').slice(-1);
      if (!prev || '(,=:[!&|?{};+-*%<>~^'.includes(prev)) { let j = i + 1, cls = false; while (j < n && (src[j] !== '/' || cls)) { if (src[j] === '\\') j++; else if (src[j] === '[') cls = true; else if (src[j] === ']') cls = false; j++; } out += '/' + blank(src.slice(i + 1, j)) + '/'; i = j + 1; continue; }
    }
    out += c; i++;
  }
  return out;
}

export function dupKeys(root) {
  const found = [];
  const files = ['app.js'].concat(fs.readdirSync(path.join(root, 'mods')).filter((f) => f.endsWith('.js')).map((f) => 'mods/' + f));
  for (const f of files) {
    const s = strip(fs.readFileSync(path.join(root, f), 'utf8'));
    const stack = []; let line = 1, expectKey = false;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === '\n') { line++; continue; }
      if (c === '{' || c === '(' || c === '[') { stack.push({ ch: c, keys: {} }); expectKey = c === '{'; continue; }
      if (c === '}' || c === ')' || c === ']') { stack.pop(); expectKey = false; continue; }
      const top = stack[stack.length - 1];
      if (c === ',') { expectKey = !!top && top.ch === '{'; continue; }
      if (expectKey && /[A-Za-z_$]/.test(c)) {
        const m = /^([A-Za-z_$][\w$]*)\s*:(?!:)/.exec(s.slice(i, i + 80));
        if (m && top && top.ch === '{') { if (top.keys[m[1]]) found.push(f + ':' + line + ': the key "' + m[1] + '" is already used at line ' + top.keys[m[1]]); else top.keys[m[1]] = line; }
        expectKey = false; continue;
      }
      if (!/\s/.test(c)) expectKey = false;
    }
  }
  return found;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', process.argv[2] || '.');
  const d = dupKeys(root);
  console.log(d.length ? d.join('\n') : 'No key is used twice.');
  process.exit(d.length ? 1 : 0);
}
