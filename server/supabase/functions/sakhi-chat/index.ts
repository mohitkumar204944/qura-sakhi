// Supabase Edge Function entry for Ask Sakhi, the chat helper (Version 40, prototype; server/SERVER_SPEC.md section 12). The logic is
// plain JavaScript (chat.js, store-pg.js, guides.js) that the Node tests in server/test run unchanged. Deploy: server/DEPLOY.md, section 8.
// The Anthropic key is a function secret (ANTHROPIC_API_KEY), set by Mohit; it never goes in the app, git or a log.
import postgres from 'npm:postgres@3.4.5';
import Anthropic from 'npm:@anthropic-ai/sdk@1.6.0';
import { createChat } from './chat.js';
import { chatStore } from './store-pg.js';

const env = Deno.env.toObject();
/* SUPABASE_DB_URL is provided to every Edge Function. prepare: false suits the pooled connection. */
const sql = postgres(env.SUPABASE_DB_URL, { prepare: false, max: 3, idle_timeout: 20 });
/* 30 seconds a call and one retry: an answer takes 1 to 4 calls, and the app waits up to 60 seconds */
const client = env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, timeout: 30_000, maxRetries: 1 }) : null;

const chat = createChat({
  store: chatStore((text: string, params: unknown[]) => sql.unsafe(text, params as never[])),
  // deno-lint-ignore no-explicit-any
  claude: client ? (params: any) => client.messages.create(params) : null,
  env,
  log: (event: string, data: Record<string, unknown>) => console.log(JSON.stringify({ event, ...data })),
});

Deno.serve(chat);
