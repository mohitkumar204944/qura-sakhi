// Builds the offline data for "Care near me" (MODULE_API section 30; docs/care-near-me-data-2026-10-22.md).
//
// Two government lists, both on data.gov.in under the Government Open Data License – India (GODL):
//   - India Post's All India Pincode Directory: each post office with its PIN, district, state and map location;
//   - the NIN list of health facilities: each centre's name, type, address, PIN and map location.
// It writes small script files into web/care/: an index, the PIN codes in shards by their first two digits, and the
// facilities in 1-degree map squares. The app loads only the few files around her PIN, on the phone; nothing is sent.
//
// Two ways in:
//   A) CSV files you downloaded from data.gov.in yourself (each dataset page's Download button asks for a purpose and a
//      CAPTCHA, which you fill in; Sakhi's tools never do):
//        node web/tools/care-data.mjs --pins pincode.csv --facilities nin.csv
//   B) The data.gov.in API with your own key (data.gov.in → sign in → My Account → Generate API Key). The key is read
//      from the environment, never written anywhere, and never printed:
//        DATA_GOV_IN_KEY=... node web/tools/care-data.mjs --api
// Options: --out <dir> (default web/care), --nin-revised YYYY-MM-DD (the NIN list's last real revision; default
// 2021-12-10), --pins-updated / --fac-updated YYYY-MM-DD (CSV mode: the "Updated" date on each dataset page),
// --no-subcentres, --max-pages <n> (API mode, for a quick trial), --save <dir> (API mode: keep the downloaded lists there),
// --from <dir> (rebuild from lists kept with --save, without downloading again).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const has = (k) => argv.includes(k);
const OUT = path.resolve(opt('--out', path.join(here, '..', 'care')));
const NIN_REVISED = opt('--nin-revised', '2021-12-10');
const SUBCENTRES = !has('--no-subcentres');
const API_PINS = '5c2f62fe-5afa-4119-a499-fec9d604d5bd';   /* All India Pincode Directory */
const API_NIN = '0dfebd78-bac4-44be-9291-025a983323f4';    /* NIN health facilities, geo-coded (check on first use) */
const SRC = {
  pins: { name: 'India Post, All India Pincode Directory', url: 'https://www.data.gov.in/resource/all-india-pincode-directory-till-last-month' },
  fac: { name: 'NIN health facilities', url: 'https://www.data.gov.in/resource/nin-health-faclities-geo-code-and-additional-parameters-updated-till-last-month' }
};
const isoDay = (s) => (/^\d{4}-\d{2}-\d{2}/.test(String(s || '')) ? String(s).slice(0, 10) : '');
const die = (msg) => { console.error(msg); process.exit(1); };

/* ---------- reading ---------- */
function parseCSV(text) {
  const rows = []; let row = [], field = '', q = false, i = text.charCodeAt(0) === 0xfeff ? 1 : 0;
  for (; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.length > 1 || (r[0] || '').trim());
}
const norm = (h) => String(h || '').toLowerCase().replace(/[^a-z0-9]/g, '');
/* rows as objects keyed by normalised column names, so "Facility Type", "facility_type" and "facilitytype" all match */
const csvRecords = (file) => { const rows = parseCSV(fs.readFileSync(file, 'utf8')); const head = rows.shift().map(norm); return rows.map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()]))); };
const pick = (rec, keys) => { for (const k of keys) if (rec[k] != null && String(rec[k]).trim() !== '') return String(rec[k]).trim(); return ''; };
const needCols = (recs, cols, what) => { const keys = new Set(Object.keys(recs[0] || {})); const miss = Object.entries(cols).filter(([, ks]) => !ks.some((k) => keys.has(k))).map(([n]) => n); if (miss.length) die(what + ': no column for ' + miss.join(', ') + '. Columns found: ' + [...keys].join(', ')); };

async function apiRecords(id, label) {
  const key = process.env.DATA_GOV_IN_KEY || '';
  if (!/^[A-Za-z0-9]{20,100}$/.test(key)) die('Set DATA_GOV_IN_KEY to your own data.gov.in API key (letters and digits only).');
  const out = []; let offset = 0, total = Infinity, updated = '', page = 0; const LIMIT = 1000; const maxPages = +opt('--max-pages', 0) || Infinity;
  while (offset < total && page < maxPages) {
    let j = null;
    for (let tries = 0; tries < 5 && !j; tries++) {
      try {
        const r = await fetch('https://api.data.gov.in/resource/' + id + '?api-key=' + encodeURIComponent(key) + '&format=json&offset=' + offset + '&limit=' + LIMIT);
        /* only the status is printed: an error body could repeat the key */
        if (r.status === 429 || r.status >= 500) { console.log(label + ': HTTP ' + r.status + ', waiting'); await new Promise((s) => setTimeout(s, 3000 * (tries + 1))); continue; }
        if (!r.ok) die(label + ': HTTP ' + r.status + ' from api.data.gov.in. Check the key and the dataset id.');
        j = await r.json();
      } catch (e) { console.log(label + ': network error, retrying'); await new Promise((s) => setTimeout(s, 3000 * (tries + 1))); }
    }
    if (!j) die(label + ': gave up after 5 tries at offset ' + offset + '.');
    const fields = Array.isArray(j.field) ? j.field : [];
    const recs = Array.isArray(j.records) ? j.records : [];
    recs.forEach((r) => { const o = {}; Object.keys(r).forEach((k) => { o[norm(k)] = r[k] == null ? '' : String(r[k]).trim(); const f = fields.find((x) => x.id === k); if (f) o[norm(f.name)] = o[norm(k)]; }); out.push(o); });
    total = +j.total || 0; updated = isoDay(j.updated_date) || updated; offset += LIMIT; page++;
    if (page % 20 === 0) console.log(label + ': ' + Math.min(offset, total).toLocaleString('en-IN') + ' of ' + total.toLocaleString('en-IN'));
    if (!recs.length) break;
    await new Promise((s) => setTimeout(s, 250));
  }
  return { recs: out, updated };
}

/* ---------- cleaning ---------- */
const num = (s) => { const x = parseFloat(String(s).replace(/[^0-9.\-]/g, '')); return isFinite(x) ? x : null; };
const inIndia = (la, lo) => la != null && lo != null && la >= 6 && la <= 37.6 && lo >= 68 && lo <= 97.5;
/* some rows swap latitude and longitude */
const coords = (la, lo) => { la = num(la); lo = num(lo); if (inIndia(la, lo)) return [la, lo, false]; if (inIndia(lo, la)) return [lo, la, true]; return null; };
const title = (s) => (/^\s*(na|n\/a|null|-)?\s*$/i.test(String(s || '')) ? '' : String(s).toLowerCase().replace(/\s+/g, ' ').trim().replace(/(^|[\s(/-])([a-z])/g, (m, a, b) => a + b.toUpperCase()));   /* "NA" is blank, not a place */
const r4 = (x) => Math.round(x * 1e4) / 1e4;
const mode = (arr) => { const c = {}; let best = '', n = 0; arr.forEach((x) => { if (!x) return; c[x] = (c[x] || 0) + 1; if (c[x] > n) { n = c[x]; best = x; } }); return best; };
const median = (arr) => { const s = arr.slice().sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
/* the facility types Sakhi lists; anything else (AYUSH, private, labs, "others") is left out */
const typeOf = (raw) => {
  const s = String(raw || '').toLowerCase();
  if (/medical college/.test(s)) return 'mc';
  if (/m\s*&\s*cw|maternal and child welfare|mother and child|\bmch\b/.test(s)) return 'mcw';
  if (/maternity/.test(s)) return 'mh';
  if (/women|zanana/.test(s)) return 'wh';
  if (/sub[\s-]*divisional|sub[\s-]*district|\bsdh\b/.test(s)) return 'sdh';
  if (/district hospital|\bdh\b/.test(s)) return 'dh';
  if (/civil hospital|general hospital|bedded hospital|area hospital|referral hospital|rural hospital/.test(s)) return 'gh';
  if (/urban[\s-]*(primary|phc)|\buphc\b|urban health cent(er|re)/.test(s)) return 'uphc';
  if (/urban health post/.test(s)) return 'uhp';
  if (/community health|\bchc\b|\bfru\b/.test(s)) return 'chc';
  if (/primary health|\bphc\b/.test(s)) return 'phc';
  if (/sub[\s-]*cent(er|re)|\bsc\b|\bhsc\b/.test(s)) return 'sc';
  return null;
};

const PIN_COLS = { pincode: ['pincode', 'pin'], district: ['district', 'districtname'], state: ['statename', 'state'], latitude: ['latitude', 'lat'], longitude: ['longitude', 'long', 'lon'] };
const FAC_COLS = { name: ['healthfacilityname', 'facilityname', 'nameofhealthfacility', 'hospitalname', 'name'], type: ['facilitytype', 'typeoffacility', 'healthfacilitytype', 'facilitytypename', 'type'], latitude: ['latitude', 'lat'], longitude: ['longitude', 'long', 'lon'] };

/* Map locations in both lists have errors (checked on the real lists, 22 Oct 2026), and a wrong "nearest" is worse than
   none, so four rules:
   1. India Post: a post office far outside the rest of its district (beyond 15 km, or 3 times the district's median distance
      from its middle if that is more) is not used for its PIN code's location. Central Kolkata's 700001 had two of its
      three offices 25 km away in South 24 Parganas. A PIN code left with no usable office gets no location.
   2. NIN: a point shared by 4 or more facilities is a default, like a block or district centre, not where they are. Left out.
   3. A PIN code whose location disagrees by more than 50 km with where 3 or more of its own facilities agree it is (two
      thirds of them within 25 km of their middle) takes the facilities' location. PIN 486666 sat on India's geographic
      centre.
   4. A facility still more than 50 km from its own PIN code is left out: one of the two is wrong.
   5. A facility with no PIN code to check whose location is on whole minutes of arc, a town's gazetteer point, is left
      out. Goa's CHC Valpoi sat in Panaji that way. On the real list this drops about a hundred.
   6. A facility with no PIN code to check, whose own district is one India Post knows in the same state, is left out if it
      sits more than 40 km (or 3 times that district's median spread) from the district's middle. Errors of a district or
      so (Narsra, Sikar district, placed in Jaipur) are not caught without dropping real remote centres: the card's caveat
      covers those. */
const stateKey = (s) => String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z]/g, '').replace('telengana', 'telangana').replace(/^(the)?dadra.*|^daman.*/, 'dnhdd').replace(/^ladakh$/, 'jammuandkashmir');
const nameKey = (s) => String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/\bdistrict\b/g, '').replace(/[^a-z]/g, '');
const kmBetween = (a, b, c, d) => { const r = Math.PI / 180; const x = Math.sin((c - a) * r / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin((d - b) * r / 2) ** 2; return 12742 * Math.asin(Math.min(1, Math.sqrt(x))); };
const group = (arr, keyOf) => { const m = new Map(); arr.forEach((x) => { const k = keyOf(x); if (k == null) return; const a = m.get(k); if (a) a.push(x); else m.set(k, [x]); }); return m; };

function buildPins(recs) {
  needCols(recs, PIN_COLS, 'PIN codes');
  const offices = [];
  recs.forEach((r) => {
    const pin = pick(r, PIN_COLS.pincode).replace(/\D/g, ''); if (!/^[1-9]\d{5}$/.test(pin)) return;
    offices.push({ pin, c: coords(pick(r, PIN_COLS.latitude), pick(r, PIN_COLS.longitude)), d: title(pick(r, PIN_COLS.district)), s: title(pick(r, PIN_COLS.state)) });
  });
  /* rule 1 */
  let outliers = 0;
  for (const os of group(offices.filter((o) => o.c && o.d && o.s), (o) => o.s + '|' + o.d).values()) {
    const m = [median(os.map((o) => o.c[0])), median(os.map((o) => o.c[1]))];
    const ds = os.map((o) => kmBetween(o.c[0], o.c[1], m[0], m[1])); const thr = Math.max(15, 3 * median(ds));
    os.forEach((o, i) => { if (ds[i] > thr) { o.out = true; outliers++; } });
  }
  /* each district's middle and median spread, from its usable offices, for rule 6 */
  const districts = new Map();
  for (const [k, os] of group(offices.filter((o) => o.c && o.d && o.s && !o.out), (o) => stateKey(o.s) + '|' + nameKey(o.d))) {
    const m = [median(os.map((o) => o.c[0])), median(os.map((o) => o.c[1]))];
    districts.set(k, { m, spread: median(os.map((o) => kmBetween(o.c[0], o.c[1], m[0], m[1]))) });
  }
  const shards = {}; const loc = new Map();
  for (const [pin, os] of [...group(offices, (o) => o.pin).entries()].sort()) {
    const k = 'p' + pin.slice(0, 2); const sh = shards[k] || (shards[k] = { d: [], s: [], p: {} });
    const di = (x) => { const i = sh.d.indexOf(x); return i >= 0 ? i : sh.d.push(x) - 1; }, si = (x) => { const i = sh.s.indexOf(x); return i >= 0 ? i : sh.s.push(x) - 1; };
    const good = os.filter((o) => o.c && !o.out);
    const rec = [good.length ? r4(median(good.map((o) => o.c[0]))) : null, good.length ? r4(median(good.map((o) => o.c[1]))) : null, di(mode(os.map((o) => o.d))), si(mode(os.map((o) => o.s)))];
    sh.p[pin] = rec; loc.set(pin, rec);   /* the same array, so rule 3 can still move it */
  }
  return { shards, loc, districts, list: offices, rows: recs.length, pins: loc.size, offices: offices.length, outliers };
}

function buildFacilities(recs, P) {
  needCols(recs, FAC_COLS, 'Facilities');
  const raw = {}; let noCoord = 0, swapped = 0, other = 0; const all = []; const onPoint = new Map();
  const pointOf = (la, lo) => la.toFixed(4) + ',' + lo.toFixed(4);
  recs.forEach((r) => {
    const rt = pick(r, FAC_COLS.type) || '(blank)'; raw[rt] = (raw[rt] || 0) + 1;
    const c = coords(pick(r, FAC_COLS.latitude), pick(r, FAC_COLS.longitude));
    if (c) onPoint.set(pointOf(c[0], c[1]), (onPoint.get(pointOf(c[0], c[1])) || 0) + 1);   /* every type counts towards a shared point */
    const ty = typeOf(rt); if (!ty || (ty === 'sc' && !SUBCENTRES)) { other++; return; }
    if (!c) { noCoord++; return; } if (c[2]) swapped++;
    const name = pick(r, FAC_COLS.name).replace(/\s+/g, ' ').slice(0, 90); if (!name) return;
    /* the list writes empty fields as NA or \N */
    const parts = []; ['address', 'street', 'landmark', 'locality'].forEach((k) => { const v = String(r[k] || '').replace(/\\N/g, '').replace(/\s+/g, ' ').replace(/^[\s,]+|[\s,]+$/g, '').trim(); if (v && !/^(na|n\/a|null|0|-)$/i.test(v) && !parts.some((p) => p.toLowerCase().includes(v.toLowerCase()))) parts.push(v); });
    const pin = pick(r, ['pincode', 'pin']).replace(/\D/g, '');
    all.push({ dist: pick(r, ['districtname', 'district']), name, ty, la: c[0], lo: c[1], pin: /^[1-9]\d{5}$/.test(pin) ? pin : '', addr: parts.join(', ').slice(0, 100), st: pick(r, ['state', 'statename']) });
  });
  /* rules 2 and 5 */
  const wholeMinute = (v) => Math.abs(v * 60 - Math.round(v * 60)) < 0.02;
  const sharedOut = all.filter((f) => onPoint.get(pointOf(f.la, f.lo)) >= 4);
  const coarseOut = all.filter((f) => onPoint.get(pointOf(f.la, f.lo)) < 4 && (!f.pin || !P.loc.has(f.pin)) && wholeMinute(f.la) && wholeMinute(f.lo));
  const placed = all.filter((f) => sharedOut.indexOf(f) < 0 && coarseOut.indexOf(f) < 0);
  /* rule 3 */
  let pinMoved = 0, pinFilled = 0;
  for (const [pin, fs] of group(placed, (f) => (f.pin && P.loc.has(f.pin) ? f.pin : null))) {
    if (fs.length < 3) continue;
    const m = [median(fs.map((f) => f.la)), median(fs.map((f) => f.lo))];
    if (fs.filter((f) => kmBetween(f.la, f.lo, m[0], m[1]) <= 25).length < fs.length * 2 / 3) continue;
    const rec = P.loc.get(pin);
    if (rec[0] == null) { rec[0] = r4(m[0]); rec[1] = r4(m[1]); pinFilled++; }
    else if (kmBetween(rec[0], rec[1], m[0], m[1]) > 50) { rec[0] = r4(m[0]); rec[1] = r4(m[1]); pinMoved++; }
  }
  /* rule 4 */
  const near = placed.filter((f) => { const rec = f.pin ? P.loc.get(f.pin) : null; return !(rec && rec[0] != null && kmBetween(f.la, f.lo, rec[0], rec[1]) > 50); });
  /* rule 6 */
  const ok = near.filter((f) => { const rec = f.pin ? P.loc.get(f.pin) : null; if (rec && rec[0] != null) return true; const d = P.districts.get(stateKey(f.st) + '|' + nameKey(f.dist)); return !d || kmBetween(f.la, f.lo, d.m[0], d.m[1]) <= Math.max(40, 3 * d.spread); });
  const tiles = {}; const kept = {};
  ok.forEach((f) => { const k = 't' + Math.floor(f.la) + '_' + Math.floor(f.lo); (tiles[k] || (tiles[k] = [])).push([f.name, f.ty, r4(f.la), r4(f.lo), f.pin, f.addr]); kept[f.ty] = (kept[f.ty] || 0) + 1; });
  Object.values(tiles).forEach((t) => t.sort((a, b) => a[2] - b[2] || a[3] - b[3]));
  return { tiles, ok, rows: recs.length, kept: ok.length, types: kept, raw, noCoord, swapped, other, shared: sharedOut.length, coarse: coarseOut.length, farFromPin: placed.length - near.length, outOfDistrict: near.length - ok.length, pinMoved, pinFilled };
}

/* States where the facility list is missing most centres: fewer kept facilities per post office than 40% of the national
   figure. There the card says so instead of showing a "nearest" that may be far from the real nearest. On 22 Oct 2026:
   Kerala (2 facilities in the whole list), Gujarat (about a fifth), Arunachal Pradesh, Andaman and Nicobar, Lakshadweep. */
function thinStates(P, F) {
  const po = new Map(), fa = new Map(), name = new Map();
  P.list.forEach((o) => { const k = stateKey(o.s); if (!k) return; po.set(k, (po.get(k) || 0) + 1); if (!name.has(k)) name.set(k, o.s); });
  F.ok.forEach((f) => { const k = stateKey(f.st); if (k) fa.set(k, (fa.get(k) || 0) + 1); });
  const all = [...po.values()].reduce((a, b) => a + b, 0), national = F.kept / (all || 1);
  return [...po.keys()].filter((k) => (fa.get(k) || 0) / po.get(k) < 0.4 * national).map((k) => name.get(k)).sort();
}

/* ---------- writing ---------- */
const ascii = (s) => s.replace(/[\u0080-￿]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
const js = (name, data) => '(window.SAKHI_CARE = window.SAKHI_CARE || {}).' + name + ' = ' + ascii(JSON.stringify(data)) + ';\n';

const main = async () => {
  let pinsIn, facIn;
  const from = opt('--from'), save = opt('--save');
  if (from) {
    const rd = (f) => JSON.parse(fs.readFileSync(path.join(from, f), 'utf8'));
    pinsIn = rd('pins.json'); facIn = rd('facilities.json');
  } else if (has('--api')) {
    console.log('Reading the PIN code directory from api.data.gov.in…'); pinsIn = await apiRecords(API_PINS, 'PIN codes');
    console.log('Reading the NIN facility list from api.data.gov.in…'); facIn = await apiRecords(API_NIN, 'Facilities');
    if (save) {
      /* only the columns the builder reads, so the copy stays small; no key is in it */
      const KEEP = new Set([].concat(...Object.values(PIN_COLS), ...Object.values(FAC_COLS), ['address', 'street', 'landmark', 'locality', 'pincode', 'pin']));
      const slim = (x) => ({ updated: x.updated, recs: x.recs.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => KEEP.has(k)))) });
      fs.mkdirSync(save, { recursive: true });
      fs.writeFileSync(path.join(save, 'pins.json'), JSON.stringify(slim(pinsIn))); fs.writeFileSync(path.join(save, 'facilities.json'), JSON.stringify(slim(facIn)));
      console.log('Kept the downloaded lists in ' + save + ' (rebuild with --from ' + save + ').');
    }
  } else {
    const pf = opt('--pins'), ff = opt('--facilities');
    if (!pf || !ff) die('Usage: node web/tools/care-data.mjs --pins pincode.csv --facilities nin.csv   (or DATA_GOV_IN_KEY=... --api)');
    pinsIn = { recs: csvRecords(pf), updated: isoDay(opt('--pins-updated', '')) };
    facIn = { recs: csvRecords(ff), updated: isoDay(opt('--fac-updated', '')) };
  }
  const P = buildPins(pinsIn.recs), F = buildFacilities(facIn.recs, P);
  if (!P.pins || !F.kept) die('Nothing usable: ' + P.pins + ' PIN codes, ' + F.kept + ' facilities. Nothing was written.');
  const pinNoLoc = [...P.loc.values()].filter((x) => x[0] == null).length; const thin = thinStates(P, F);
  fs.mkdirSync(OUT, { recursive: true });
  fs.readdirSync(OUT).filter((f) => /^(index|p\d\d|t\d+_\d+)\.js$/.test(f)).forEach((f) => fs.unlinkSync(path.join(OUT, f)));
  let bytes = 0; const write = (name, data) => { const s = js(name, data); fs.writeFileSync(path.join(OUT, name + '.js'), s); bytes += Buffer.byteLength(s); };
  Object.entries(P.shards).forEach(([k, v]) => write(k, v));
  Object.entries(F.tiles).forEach(([k, v]) => write(k, v));
  const built = new Date(); const day = built.getFullYear() + '-' + String(built.getMonth() + 1).padStart(2, '0') + '-' + String(built.getDate()).padStart(2, '0');
  write('index', { v: 1, built: day, licence: 'GODL-India',
    pins: { src: SRC.pins.name, url: SRC.pins.url, updated: pinsIn.updated, rows: P.rows, pins: P.pins, noCoord: pinNoLoc },
    fac: { src: SRC.fac.name, url: SRC.fac.url, updated: facIn.updated, revised: NIN_REVISED, rows: F.rows, kept: F.kept, types: F.types },
    thin: thin, shards: Object.keys(P.shards).sort(), tiles: Object.keys(F.tiles).sort() });
  console.log('PIN codes: ' + P.pins + ' from ' + P.offices + ' post offices; ' + pinNoLoc + ' without a map location. Not used: ' + P.outliers + ' post offices far outside their district.');
  console.log('PIN codes moved to where 3 or more of their own facilities agree: ' + F.pinMoved + '; given a location that way: ' + F.pinFilled + '.');
  console.log('Facilities kept: ' + F.kept + ' of ' + F.rows + ' ' + JSON.stringify(F.types) + '; left out: ' + F.other + ' of other types, ' + F.noCoord + ' without a usable map location, ' + F.shared + ' on a point shared by 4 or more, ' + F.coarse + ' on a town-level point with no PIN code to check, ' + F.farFromPin + ' more than 50 km from their own PIN code, ' + F.outOfDistrict + ' with no PIN code, far outside their own district. Put right: ' + F.swapped + ' with latitude and longitude the wrong way round.');
  console.log('Facility types in the source: ' + Object.entries(F.raw).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([k, v]) => k + ' ' + v).join('; '));
  console.log('States where the list is missing most centres: ' + (thin.join(', ') || 'none') + '.');
  console.log('Wrote ' + (Object.keys(P.shards).length + Object.keys(F.tiles).length + 1) + ' files, ' + (bytes / 1048576).toFixed(1) + ' MB, to ' + OUT);
};
main();
