-- Ask Sakhi, the chat helper (Version 40, prototype; server/SERVER_SPEC.md section 12). Daily totals only: how many questions
-- reached the model, were answered, refused or failed, how many were stopped by a daily limit, and the tokens they used. No
-- question, answer or account is kept here. Each woman's daily limit counts in sakhi.rate_hits (key 'chat:acct:<account id>'),
-- which the daily clean-up clears after 2 days. Like the rest of the schema, only the Edge Functions read or write it.

create table sakhi.chat_daily (
  day        date primary key,              -- India date
  questions  int    not null default 0,     -- requests sent to the model
  answered   int    not null default 0,
  refusals   int    not null default 0,     -- the model declined, or an answer broke a rule and was held back
  errors     int    not null default 0,
  cap_hits   int    not null default 0,     -- "Ask Sakhi is resting for today"
  in_tokens  bigint not null default 0,
  out_tokens bigint not null default 0
);

alter table sakhi.chat_daily enable row level security;
