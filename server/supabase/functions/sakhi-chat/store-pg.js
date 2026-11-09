// Ask Sakhi's database calls (server/SERVER_SPEC.md section 12), on the tables in server/supabase/migrations. `q(text, params)`
// runs one parameterised statement and resolves to its rows: postgres.js `sql.unsafe` in the Edge Function, PGlite in the tests.
// It reads a session to check her token, counts her questions in sakhi.rate_hits (cleared by sakhi-api's daily clean-up after 2
// days), and adds to the day's totals in sakhi.chat_daily. Column names in dynamic SQL only ever come from COLS.

const COLS = new Set(['questions', 'answered', 'refusals', 'errors', 'cap_hits', 'in_tokens', 'out_tokens']);

export function chatStore(q) {
  const one = async (text, params) => (await q(text, params))[0] || null;
  return {
    async sessionAccount(tokenHash, minDay) {
      return one('select a.id::text as id, a.birth_year from sakhi.sessions s join sakhi.accounts a on a.id = s.account_id where s.token_hash = $1 and s.revoked_at is null and s.last_used_on >= $2::date', [tokenHash, minDay]);
    },
    /* One more in this key's window; resolves to the count so far. nowMs may be shifted (India time) so the window starts at her midnight. */
    async hit(key, windowS, nowMs) {
      const bucket = Math.floor(Math.floor(nowMs / 1000) / windowS) * windowS;
      const r = await one('insert into sakhi.rate_hits (key, bucket, hits) values ($1, to_timestamp($2), 1) on conflict (key, bucket) do update set hits = sakhi.rate_hits.hits + 1 returning hits', [key, bucket]);
      return r.hits;
    },
    async dayCount(day) {
      const r = await one('select questions from sakhi.chat_daily where day = $1::date', [day]);
      return r ? r.questions : 0;
    },
    async bump(day, fields) {
      const keys = Object.keys(fields).filter((k) => COLS.has(k) && Number.isFinite(fields[k]) && fields[k] > 0);
      if (!keys.length) return;
      const vals = keys.map((k) => Math.round(fields[k]));
      await q('insert into sakhi.chat_daily (day, ' + keys.join(', ') + ') values ($1::date, ' + keys.map((k, i) => '$' + (i + 2)).join(', ') + ') on conflict (day) do update set ' +
        keys.map((k) => k + ' = sakhi.chat_daily.' + k + ' + excluded.' + k).join(', '), [day].concat(vals));
    }
  };
}
