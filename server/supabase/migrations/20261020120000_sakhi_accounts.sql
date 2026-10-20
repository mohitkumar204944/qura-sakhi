-- Qura Sakhi accounts (server/SERVER_SPEC.md sections 4-5). Sakhi's own Supabase project; nothing here holds diary data.
-- The schema is not exposed through the REST API: only the sakhi-api Edge Function reads it, as the database owner.

create schema if not exists sakhi;
revoke all on schema sakhi from public, anon, authenticated;

create table sakhi.accounts (
  id             uuid primary key default gen_random_uuid(),
  phone          text not null unique check (phone ~ '^\+91[6-9][0-9]{9}$'),
  birth_year     smallint not null check (birth_year between 1900 and 2100),
  name           text check (name is null or char_length(name) between 1 and 40),
  pincode        text check (pincode is null or pincode ~ '^[1-9][0-9]{5}$'),
  district       text,                       -- from sakhi.pincodes when she gives a PIN code
  state          text,
  heard          text check (heard is null or heard in ('doc', 'fam', 'wa', 'social', 'qura', 'other')),
  upd_sms        boolean not null default false,
  upd_wa         boolean not null default false,
  lang           text check (lang is null or lang ~ '^[a-z]{2}$'),
  platform       text check (platform is null or platform in ('android', 'web')),
  app_version    text check (app_version is null or char_length(app_version) <= 32),
  last_active_on date,                       -- India date; updated at most once a day
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table sakhi.otp_challenges (
  id          uuid primary key,              -- made by the function: the code's HMAC covers it
  phone       text not null,
  channel     text not null check (channel in ('whatsapp', 'sms')),
  code_hash   text not null,                 -- hex HMAC-SHA256(SAKHI_OTP_PEPPER, id || ':' || code)
  tries       smallint not null default 0,
  expires_at  timestamptz not null,          -- 10 minutes after it was sent
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index otp_challenges_phone_idx on sakhi.otp_challenges (phone, created_at desc);
create index otp_challenges_created_idx on sakhi.otp_challenges (created_at);

create table sakhi.sessions (
  token_hash   text primary key,             -- hex SHA-256 of the token; the token itself is never stored
  account_id   uuid not null references sakhi.accounts (id) on delete cascade,
  created_at   timestamptz not null default now(),
  last_used_on date not null default (now() at time zone 'Asia/Kolkata')::date,
  revoked_at   timestamptz
);
create index sessions_account_idx on sakhi.sessions (account_id);

create table sakhi.consents (
  id             bigint generated always as identity primary key,
  account_id     uuid not null references sakhi.accounts (id) on delete cascade,
  kind           text not null check (kind in ('terms', 'upd_sms', 'upd_wa')),
  granted        boolean not null,
  notice_version text not null,              -- the app sends '2026-10-20' today
  at             timestamptz not null default now()
);
create index consents_account_idx on sakhi.consents (account_id, kind, at desc);

-- Rate limits: one counter per key per fixed window. The function works out the window start, so tests can move the clock.
create table sakhi.rate_hits (
  key    text not null,                      -- e.g. 'otp:phone:<phone>:<channel>', 'otp:ip:<daily ip hash>'
  bucket timestamptz not null,
  hits   int not null default 0,
  primary key (key, bucket)
);
create index rate_hits_bucket_idx on sakhi.rate_hits (bucket);

create table sakhi.daily_stats (
  day      date primary key,                 -- India date
  signups  int not null default 0,
  active   int not null default 0,           -- accounts whose last_active_on moved to this day
  wa_sent  int not null default 0,
  sms_sent int not null default 0
);

create table sakhi.pincodes (                -- loaded once from the government's All India Pincode Directory (scripts/load-pincodes.mjs)
  pincode  text primary key,
  district text not null,
  state    text not null
);

-- Daily clean-up runs from the function itself (no cron extension needed on the free plan): the first code request
-- after 24 hours claims this row and clears old challenges, rate counters and dead sessions.
create table sakhi.jobs (
  name   text primary key,
  ran_at timestamptz not null
);
insert into sakhi.jobs (name, ran_at) values ('housekeep', '2000-01-01T00:00:00Z');

alter table sakhi.accounts       enable row level security;
alter table sakhi.otp_challenges enable row level security;
alter table sakhi.sessions       enable row level security;
alter table sakhi.consents       enable row level security;
alter table sakhi.rate_hits      enable row level security;
alter table sakhi.daily_stats    enable row level security;
alter table sakhi.pincodes       enable row level security;
alter table sakhi.jobs           enable row level security;
