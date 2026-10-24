-- Version 33: the doctor-call hand-off (server/SERVER_SPEC.md section 10.1). When she asks Qura to call her and ticks what to
-- share, the request waits here until Qura's endpoint has it. Then the health details (`topic`, `shared_data`) are deleted, and
-- only the reference and its status stay. The same happens when a request fails after 24 hours. Deleting her account deletes
-- her requests. Like every sakhi table: RLS on, no policies, not exposed through the REST API.

create table sakhi.call_requests (
  id           bigint generated always as identity primary key,
  ref          text not null unique check (ref ~ '^QC-[A-Z0-9]{6}$'),
  account_id   uuid not null references sakhi.accounts (id) on delete cascade,
  best_time    text not null check (best_time in ('morning', 'afternoon', 'evening', 'any')),
  lang         text not null check (lang ~ '^[a-z]{2}$'),
  notice       text not null check (char_length(notice) between 1 and 20),
  shared       text[] not null default '{}',                -- the sections she ticked, by key
  topic        text check (topic is null or char_length(topic) between 1 and 120),   -- null once Qura has it
  shared_data  json,                                        -- what she ticked, kept as sent (json keeps the order she saw); null once Qura has it or the request failed
  status       text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  tries        smallint not null default 0,
  next_try_at  timestamptz,                                 -- when a queued request is tried again
  last_error   text check (last_error is null or char_length(last_error) <= 80),   -- the kind of failure, never Qura's text
  qura_lead_id text check (qura_lead_id is null or char_length(qura_lead_id) <= 64),
  created_at   timestamptz not null,
  sent_at      timestamptz
);
alter table sakhi.call_requests enable row level security;
create index call_requests_account_idx on sakhi.call_requests (account_id, created_at desc);
create index call_requests_due_idx on sakhi.call_requests (next_try_at) where status = 'queued';
