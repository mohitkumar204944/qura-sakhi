// In-memory stand-in for store-pg.js: same methods, same behaviour (including cascading deletes), for fast tests.
// server/test/api.test.mjs runs every check against this and against the real SQL on PGlite, so the two must agree.

export function memoryStore() {
  const db = { rate: new Map(), challenges: new Map(), accounts: new Map(), consents: [], sessions: new Map(), pincodes: new Map(), stats: new Map(), usage: new Map(), usageReports: new Map(), housekeptAt: 0 };
  let seq = 0;
  const copy = (o) => (o ? JSON.parse(JSON.stringify(o)) : null);
  const store = {
    db,
    async hit(key, windowS, max, nowMs) {
      const nowS = Math.floor(nowMs / 1000);
      const bucket = Math.floor(nowS / windowS) * windowS;
      const k = key + '@' + bucket;
      const n = (db.rate.get(k) || 0) + 1;
      db.rate.set(k, n);
      return { ok: n <= max, retryAfter: bucket + windowS - nowS };
    },
    async createChallenge(c) {
      db.challenges.set(c.id, { id: c.id, phone: c.phone, channel: c.channel, code_hash: c.codeHash, tries: 0, expires_at: c.expiresAt, used_at: null, created_at: Date.now() });
    },
    async getChallenge(id) { return copy(db.challenges.get(id)); },
    async bumpTries(id) {
      const c = db.challenges.get(id);
      if (!c || c.used_at) return null;
      c.tries += 1;
      return c.tries;
    },
    async useChallenge(id) {
      const c = db.challenges.get(id);
      if (!c || c.used_at) return false;
      c.used_at = new Date().toISOString();
      return true;
    },
    async findAccountByPhone(phone) {
      for (const a of db.accounts.values()) if (a.phone === phone) return copy(a);
      return null;
    },
    async createAccount(f) {
      const found = await store.findAccountByPhone(f.phone);
      if (found) return found;
      const a = { id: 'acc-' + (++seq), phone: f.phone, birth_year: f.birth_year, name: null, pincode: null, district: null, state: null, email: null, heard: null, upd_sms: false, upd_wa: false,
        lang: f.lang, platform: f.platform, app_version: f.app_version, last_active_on: null };
      db.accounts.set(a.id, a);
      return copy(a);
    },
    async latestConsent(accountId, kind) {
      const rows = db.consents.filter((c) => c.account_id === accountId && c.kind === kind);
      const last = rows[rows.length - 1];
      return last ? { notice_version: last.notice_version, granted: last.granted } : null;
    },
    async addConsent(accountId, kind, granted, notice) { db.consents.push({ account_id: accountId, kind, granted, notice_version: notice }); },
    async createSession(tokenHash, accountId, day) { db.sessions.set(tokenHash, { account_id: accountId, last_used_on: day, revoked_at: null }); },
    async sessionAccount(tokenHash, minDay) {
      const s = db.sessions.get(tokenHash);
      if (!s || s.revoked_at || s.last_used_on < minDay) return null;
      return copy(db.accounts.get(s.account_id));
    },
    async touchSession(tokenHash, day) {
      const s = db.sessions.get(tokenHash);
      if (s && s.last_used_on < day) s.last_used_on = day;
    },
    async updateAccount(id, fields) {
      const a = db.accounts.get(id);
      for (const k of ['name', 'pincode', 'district', 'state', 'email', 'heard', 'upd_sms', 'upd_wa', 'lang']) if (fields[k] !== undefined) a[k] = fields[k];
      return copy(a);
    },
    async lookupPincode(pin) { return copy(db.pincodes.get(pin)); },
    async markActive(id, day, app, lang) {
      const a = db.accounts.get(id);
      if (!a || a.last_active_on === day) return false;
      a.last_active_on = day;
      if (app) a.app_version = app;
      if (lang) a.lang = lang;
      return true;
    },
    async revokeSession(tokenHash) {
      const s = db.sessions.get(tokenHash);
      if (s && !s.revoked_at) s.revoked_at = Date.now();
    },
    async deleteAccount(id) {
      db.accounts.delete(id);
      db.consents = db.consents.filter((c) => c.account_id !== id);
      for (const [k, s] of db.sessions) if (s.account_id === id) db.sessions.delete(k);
    },
    async addUsage(month, pairs) {
      for (const [tool, bucket] of pairs) { const k = month + '|' + tool + '|' + bucket; db.usage.set(k, (db.usage.get(k) || 0) + 1); }
      db.usageReports.set(month, (db.usageReports.get(month) || 0) + 1);
    },
    async bumpStat(day, column) {
      if (!['signups', 'active', 'wa_sent', 'sms_sent'].includes(column)) throw new Error('unknown stat ' + column);
      const s = db.stats.get(day) || { signups: 0, active: 0, wa_sent: 0, sms_sent: 0 };
      s[column] += 1;
      db.stats.set(day, s);
    },
    async housekeepIfDue() {
      const t = Date.now();
      if (t - db.housekeptAt < 86400000) return false;
      db.housekeptAt = t;
      for (const [k, c] of db.challenges) if (c.created_at < t - 86400000) db.challenges.delete(k);
      return true;
    }
  };
  return store;
}
