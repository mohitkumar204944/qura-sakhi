-- What helps (Version 30, opt-in; server/SERVER_SPEC.md section 5.9). Monthly totals only: how many phones used each tool on
-- 1, 2-5 or 6+ days of a month, and how many phones reported that month. No row identifies a phone or a woman, and a report
-- carries no account. Like the rest of the schema, only the sakhi-api Edge Function reads or writes it.

create table sakhi.usage_counts (
  month  text not null check (month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  tool   text not null check (tool ~ '^[a-z][a-z-]{0,31}$'),
  bucket text not null check (bucket in ('1', '2-5', '6+')),
  phones int  not null default 0,
  primary key (month, tool, bucket)
);

create table sakhi.usage_reports (
  month  text primary key check (month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  phones int  not null default 0
);

alter table sakhi.usage_counts  enable row level security;
alter table sakhi.usage_reports enable row level security;
