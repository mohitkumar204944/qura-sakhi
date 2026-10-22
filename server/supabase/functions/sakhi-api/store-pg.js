// The Sakhi API's database, on the tables in server/supabase/migrations. `q(text, params)` runs one parameterised
// statement and resolves to its rows: postgres.js `sql.unsafe` in the Edge Function, PGlite in the tests. Column names
// in dynamic SQL only ever come from the fixed lists below; every value is a parameter.

const STATS = new Set(['signups', 'active', 'wa_sent', 'sms_sent']);
const EDITABLE = new Set(['name', 'pincode', 'district', 'state', 'email', 'heard', 'upd_sms', 'upd_wa', 'lang']);
const COLS = ['id::text', 'phone', 'birth_year', 'name', 'pincode', 'district', 'state', 'email', 'heard', 'upd_sms', 'upd_wa', 'lang', 'platform', 'app_version', 'last_active_on::text'];
const ACCOUNT = COLS.join(', ');
const ACCOUNT_A = COLS.map((c) => (c.includes('::') ? 'a.' + c + ' as ' + c.split('::')[0] : 'a.' + c)).join(', ');

export function pgStore(q) {
  const one = async (text, params) => (await q(text, params))[0] || null;
  const store = {
    /* One counter per key per fixed window, starting where the clock says (so tests can move it). */
    async hit(key, windowS, max, nowMs) {
      const nowS = Math.floor(nowMs / 1000);
      const bucket = Math.floor(nowS / windowS) * windowS;
      const r = await one('insert into sakhi.rate_hits (key, bucket, hits) values ($1, to_timestamp($2), 1) on conflict (key, bucket) do update set hits = sakhi.rate_hits.hits + 1 returning hits', [key, bucket]);
      return { ok: r.hits <= max, retryAfter: bucket + windowS - nowS };
    },
    async createChallenge(c) {
      await q('insert into sakhi.otp_challenges (id, phone, channel, code_hash, expires_at) values ($1::uuid, $2, $3, $4, $5::timestamptz)', [c.id, c.phone, c.channel, c.codeHash, c.expiresAt]);
    },
    async getChallenge(id) {
      return one('select id::text, phone, channel, code_hash, tries, expires_at, used_at from sakhi.otp_challenges where id = $1::uuid', [id]);
    },
    async bumpTries(id) {
      const r = await one('update sakhi.otp_challenges set tries = tries + 1 where id = $1::uuid and used_at is null returning tries', [id]);
      return r ? r.tries : null;
    },
    /* True only for the request that marks it used. */
    async useChallenge(id) {
      return !!(await one('update sakhi.otp_challenges set used_at = now() where id = $1::uuid and used_at is null returning id', [id]));
    },
    async findAccountByPhone(phone) {
      return one('select ' + ACCOUNT + ' from sakhi.accounts where phone = $1', [phone]);
    },
    /* Two first sign-ins at once for one number: the second gets the account the first made. */
    async createAccount(f) {
      const r = await one('insert into sakhi.accounts (phone, birth_year, lang, platform, app_version) values ($1, $2::smallint, $3, $4, $5) on conflict (phone) do nothing returning ' + ACCOUNT,
        [f.phone, f.birth_year, f.lang, f.platform, f.app_version]);
      return r || store.findAccountByPhone(f.phone);
    },
    async latestConsent(accountId, kind) {
      return one('select notice_version, granted from sakhi.consents where account_id = $1::uuid and kind = $2 order by at desc, id desc limit 1', [accountId, kind]);
    },
    async addConsent(accountId, kind, granted, notice) {
      await q('insert into sakhi.consents (account_id, kind, granted, notice_version) values ($1::uuid, $2, $3::boolean, $4)', [accountId, kind, granted, notice]);
    },
    async createSession(tokenHash, accountId, day) {
      await q('insert into sakhi.sessions (token_hash, account_id, last_used_on) values ($1, $2::uuid, $3::date)', [tokenHash, accountId, day]);
    },
    async sessionAccount(tokenHash, minDay) {
      return one('select ' + ACCOUNT_A + ' from sakhi.sessions s join sakhi.accounts a on a.id = s.account_id where s.token_hash = $1 and s.revoked_at is null and s.last_used_on >= $2::date',
        [tokenHash, minDay]);
    },
    async touchSession(tokenHash, day) {
      await q('update sakhi.sessions set last_used_on = $2::date where token_hash = $1 and last_used_on < $2::date', [tokenHash, day]);
    },
    async updateAccount(id, fields) {
      const keys = Object.keys(fields).filter((k) => EDITABLE.has(k));
      if (!keys.length) return one('select ' + ACCOUNT + ' from sakhi.accounts where id = $1::uuid', [id]);
      const sets = keys.map((k, i) => k + ' = $' + (i + 2));
      return one('update sakhi.accounts set ' + sets.join(', ') + ', updated_at = now() where id = $1::uuid returning ' + ACCOUNT, [id].concat(keys.map((k) => fields[k])));
    },
    async lookupPincode(pin) {
      return one('select district, state from sakhi.pincodes where pincode = $1', [pin]);
    },
    /* True when this is her first visit of the day (so the day's active count goes up once). */
    async markActive(id, day, app, lang) {
      return !!(await one('update sakhi.accounts set last_active_on = $2::date, app_version = coalesce($3, app_version), lang = coalesce($4, lang), updated_at = now() where id = $1::uuid and last_active_on is distinct from $2::date returning id',
        [id, day, app, lang]));
    },
    async revokeSession(tokenHash) {
      await q('update sakhi.sessions set revoked_at = now() where token_hash = $1 and revoked_at is null', [tokenHash]);
    },
    async deleteAccount(id) {
      await q('delete from sakhi.accounts where id = $1::uuid', [id]);
    },
    /* What helps: one more phone in each tool's bucket for the month, and one more report for the month */
    async addUsage(month, pairs) {
      for (const [tool, bucket] of pairs) await q('insert into sakhi.usage_counts (month, tool, bucket, phones) values ($1, $2, $3, 1) on conflict (month, tool, bucket) do update set phones = sakhi.usage_counts.phones + 1', [month, tool, bucket]);
      await q('insert into sakhi.usage_reports (month, phones) values ($1, 1) on conflict (month) do update set phones = sakhi.usage_reports.phones + 1', [month]);
    },
    async bumpStat(day, column) {
      if (!STATS.has(column)) throw new Error('unknown stat ' + column);
      await q('insert into sakhi.daily_stats (day, ' + column + ') values ($1::date, 1) on conflict (day) do update set ' + column + ' = sakhi.daily_stats.' + column + ' + 1', [day]);
    },
    /* Once a day, whichever request claims the job row first clears out old rows (spec section 4, housekeeping). */
    async housekeepIfDue() {
      const due = await one("update sakhi.jobs set ran_at = now() where name = 'housekeep' and ran_at < now() - interval '1 day' returning name", []);
      if (!due) return false;
      await q("delete from sakhi.otp_challenges where created_at < now() - interval '1 day'", []);
      await q("delete from sakhi.rate_hits where bucket < now() - interval '2 days'", []);
      await q("delete from sakhi.sessions where (revoked_at is not null and revoked_at < now() - interval '30 days') or last_used_on < (now() at time zone 'Asia/Kolkata')::date - 365", []);
      return true;
    }
  };
  return store;
}
