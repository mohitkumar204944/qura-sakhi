-- Ask Sakhi, phase 1 (Version 40.2, prototype; server/SERVER_SPEC.md section 12.3). Four more daily totals, still no text: answers
-- she marked helpful or not helpful, actions she did from an answer (logged a sign or her period, added a doctor question), and
-- questions asked from a guide ("Ask Sakhi about this").

alter table sakhi.chat_daily
  add column thumbs_up    int not null default 0,
  add column thumbs_down  int not null default 0,
  add column actions_done int not null default 0,
  add column about_used   int not null default 0;
