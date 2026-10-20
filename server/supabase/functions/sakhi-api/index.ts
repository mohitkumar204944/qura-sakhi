// Supabase Edge Function entry for the Sakhi accounts API. The logic lives in plain JavaScript (api.js, store-pg.js,
// send.js) that the Node tests in server/test run unchanged. Deploy: see server/DEPLOY.md.
import postgres from 'npm:postgres@3.4.5';
import { createApi } from './api.js';
import { pgStore } from './store-pg.js';
import { makeSender } from './send.js';

const env = Deno.env.toObject();
/* SUPABASE_DB_URL is provided to every Edge Function. prepare: false suits the pooled connection. */
const sql = postgres(env.SUPABASE_DB_URL, { prepare: false, max: 3, idle_timeout: 20 });

const api = createApi({
  store: pgStore((text: string, params: unknown[]) => sql.unsafe(text, params as never[])),
  send: makeSender(env),
  env,
  log: (event: string, data: Record<string, unknown>) => console.log(JSON.stringify({ event, ...data })),
});

Deno.serve(api);
