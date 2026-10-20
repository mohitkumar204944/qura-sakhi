// Turns the government's All India Pincode Directory (a CSV you download from data.gov.in) into SQL that fills
// sakhi.pincodes, so a PIN code can show which district and state Sakhi reaches. One row per PIN code; when post
// offices under one PIN code disagree, the first one listed wins.
// Usage: node server/scripts/load-pincodes.mjs <directory.csv> > pincodes.sql
// Then run pincodes.sql in Sakhi's Supabase SQL editor.
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

/* Minimal CSV reader: quoted fields, doubled quotes, commas and newlines inside quotes. */
function parseCsv(text) {
  const rows = []; let row = []; let field = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim()));
}
/* "BENGALURU URBAN" -> "Bengaluru Urban"; names already in mixed case are left as they are. */
const tidy = (s) => { const t = String(s || '').trim().replace(/\s+/g, ' '); return t && t === t.toUpperCase() ? t.toLowerCase().replace(/(^|[\s(-])\p{L}/gu, (m) => m.toUpperCase()) : t; };
const lit = (s) => "'" + String(s).replace(/'/g, "''") + "'";

export function pincodeSql(csvText, batch = 1000) {
  const rows = parseCsv(csvText.replace(/^﻿/, ''));
  const head = rows.shift().map((h) => h.trim().toLowerCase().replace(/[^a-z]/g, ''));
  const col = (...names) => head.findIndex((h) => names.includes(h));
  const iPin = col('pincode', 'pin'); const iDist = col('district', 'districtname'); const iState = col('statename', 'state');
  if (iPin < 0 || iDist < 0 || iState < 0) throw new Error('CSV needs Pincode, District and StateName columns; found: ' + head.join(', '));
  const seen = new Map();
  for (const r of rows) {
    const pin = String(r[iPin] || '').trim();
    if (!/^[1-9]\d{5}$/.test(pin) || seen.has(pin)) continue;
    const district = tidy(r[iDist]); const state = tidy(r[iState]);
    if (district && state) seen.set(pin, [district, state]);
  }
  const values = [...seen].map(([pin, [d, s]]) => '(' + lit(pin) + ', ' + lit(d) + ', ' + lit(s) + ')');
  const out = [];
  for (let i = 0; i < values.length; i += batch) out.push('insert into sakhi.pincodes (pincode, district, state) values\n' + values.slice(i, i + batch).join(',\n') + '\non conflict (pincode) do nothing;');
  return { sql: out.join('\n\n') + '\n', count: values.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = process.argv[2];
  if (!file) { console.error('Usage: node server/scripts/load-pincodes.mjs <directory.csv> > pincodes.sql'); process.exit(1); }
  const { sql, count } = pincodeSql(fs.readFileSync(file, 'utf8'));
  process.stdout.write(sql);
  console.error(count + ' PIN codes');
}
