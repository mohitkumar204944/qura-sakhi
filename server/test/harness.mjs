// Shared test setup for the Sakhi server: a real Postgres (PGlite, in this process) loaded with the migration, a fake
// clock, a sender that records codes instead of sending them, and a call() helper that speaks HTTP to the API.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { createApi } from '../supabase/functions/sakhi-api/api.js';
import { pgStore } from '../supabase/functions/sakhi-api/store-pg.js';
import { memoryStore } from './store-memory.js';

const here = path.dirname(fileURLToPath(import.meta.url));
export const MIGRATIONS = path.join(here, '..', 'supabase', 'migrations');
export const ENV = { SAKHI_OTP_PEPPER: 'test-pepper-0123456789abcdef0123456789abcdef', SAKHI_IP_SALT_SEED: 'test-ipsalt-0123456789abcdef0123456789abcdef' };

/* A fresh Postgres with every migration applied, as Supabase would. Supabase's roles are created first. */
export async function pgliteDb() {
  const db = new PGlite();
  await db.exec('create role anon; create role authenticated;');
  for (const f of fs.readdirSync(MIGRATIONS).filter((x) => x.endsWith('.sql')).sort()) await db.exec(fs.readFileSync(path.join(MIGRATIONS, f), 'utf8'));
  await db.exec("insert into sakhi.pincodes (pincode, district, state) values ('560001', 'Bengaluru Urban', 'Karnataka'), ('110001', 'New Delhi', 'Delhi')");
  /* The daily clean-up compares with the database's real clock, but the tests run on a fake one (20 Oct 2026). Marked as just
     run, it stays out of every test but its own, which sets it due on purpose. (From 22 Oct it deleted the fake-dated rate
     counters as two days old, and the rate limits stopped counting.) */
  await db.exec("update sakhi.jobs set ran_at = now() where name = 'housekeep'");
  return db;
}
export const pgQuery = (db) => (text, params) => db.query(text, params).then((r) => r.rows);

export async function makeStore(kind) {
  if (kind === 'memory') {
    const s = memoryStore();
    s.db.pincodes.set('560001', { district: 'Bengaluru Urban', state: 'Karnataka' });
    s.db.pincodes.set('110001', { district: 'New Delhi', state: 'Delhi' });
    return { store: s, db: null };
  }
  const db = await pgliteDb();
  return { store: pgStore(pgQuery(db)), db };
}

/* Records every code instead of sending it. Set fail.whatsapp / fail.sms to make a channel throw. The doctor-call hand-off
   (Version 33) records each request Qura would get and answers with `qura` (set qura.status to 503 and so on); fail.handoff
   makes it throw, like a network error or a timeout. */
export function fakeSender() {
  const outbox = [];
  const handoffs = [];
  const fail = { whatsapp: false, sms: false, handoff: false };
  const qura = { status: 201, data: { lead_id: 'L-1' } };
  return {
    outbox, fail, handoffs, qura,
    lastCode: () => (outbox.length ? outbox[outbox.length - 1].code : null),
    async whatsapp(phone, code) { if (fail.whatsapp) throw new Error('whatsapp down'); outbox.push({ channel: 'whatsapp', phone, code }); },
    async sms(phone, code) { if (fail.sms) throw new Error('sms down'); outbox.push({ channel: 'sms', phone, code }); },
    async handoff(payload) { if (fail.handoff) throw new Error('qura down'); handoffs.push(JSON.parse(JSON.stringify(payload))); return { status: qura.status, data: qura.data }; }
  };
}
/* The secrets that turn the hand-off on (spec section 10.1). */
export const HANDOFF_ENV = { SAKHI_QURA_HANDOFF_URL: 'https://qura.test/api/partners/sakhi/v1/call-requests', SAKHI_QURA_KEY: 'test-qura-key-0123456789abcdef0123456789' };

/* 20 Oct 2026, 10:00 India time, moved by tests with clock.add(seconds). */
export function fakeClock(start = Date.parse('2026-10-20T04:30:00Z')) {
  let t = start;
  return { now: () => t, add: (s) => { t += s * 1000; }, set: (ms) => { t = ms; } };
}

export function makeApi(store, opts = {}) {
  const send = opts.send || fakeSender();
  const clock = opts.clock || fakeClock();
  const logs = [];
  const api = createApi({ store, send, env: opts.env || ENV, now: clock.now, log: (event, data) => logs.push({ event, data }) });
  return { api, send, clock, logs };
}

/* One HTTP call to the API, the way the app makes it. */
export async function call(api, method, p, body, opts = {}) {
  const headers = { 'x-forwarded-for': opts.ip || '203.0.113.7' };
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (opts.token) headers.authorization = 'Bearer ' + opts.token;
  const req = new Request('https://sakhi.test/functions/v1/sakhi-api/v1/' + p, {
    method, headers, body: body === undefined ? undefined : (typeof body === 'string' ? body : JSON.stringify(body))
  });
  const res = await api(req);
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (e) { json = { raw: text }; }
  return { status: res.status, json, headers: res.headers };
}
