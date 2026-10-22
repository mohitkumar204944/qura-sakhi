# Qura Sakhi — module guide

Qura Sakhi is a **free reproductive-health companion for Indian women**, run as a social-service arm of Qura Nutrition
(an online clinic with BAMS doctors). It is a working **UI prototype**: everything runs in the browser, data stays in
`localStorage`, nothing is sent anywhere. It is bilingual (English + Hindi) and must work at phone width (≈390px).

Its jobs: (1) maximum self-serve help for Indian women across every life stage, (2) a trustworthy path to a Qura doctor
("Book a free call" = the lead funnel). It is **not** a diagnostic device and sells nothing inside health content.

The core (`app.js`, `app.css`, `index.html`) is finished. Each care area is a **module** in `mods/<id>.js`.
**Never edit `app.js`, `app.css`, `index.html` or another module's file.** If the core lacks something, work around it
inside your module (module-scoped CSS, your own helpers) and mention it in your final report.

Read `app.js` once before writing: it shows the house style for markup, the existing strings (`STR.en` / `STR.hi`) and
the four existing tools (`renderPattern`, `renderFertile`, `renderMidlife`, `renderPregnancy`) that your screens should feel
consistent with.

---

## 1. File shape

```js
/* <One line on what this module covers.> */
(function (S) {
  'use strict';
  if (!S) return;
  const t = S.t, esc = S.esc, tx = S.tx;           // pull what you need
  const D = () => S.data('contra');                 // this module's saved data (object, persisted by S.save())

  function renderHub(v) { /* v = the #view element; set v.innerHTML then S.wire(v) and add listeners */ }

  S.register({
    id: 'contra',                                   // module id; ALSO the required prefix for every string key and route
    demoPersona: 'asha',                            // which sample woman best shows this module (see §6)
    strings: { en: { contra_hub: 'Contraception', ... }, hi: { contra_hub: 'गर्भनिरोध', ... } },
    routes: { 'contra': renderHub, 'contra-chooser': renderChooser },        // every route = id or id-<something>
    prefixes: { 'contra-m-': (v, rest) => renderMethod(v, rest) },           // optional: parameterised routes (#contra-m-chhaya)
    testRoutes: ['contra-m-chhaya', 'contra-m-antara'],                      // list every prefix route the checker should open
    open: ['contra', 'contra-chooser', 'contra-m-*'],                        // routes readable WITHOUT a diary (browse mode). '*' = prefix
    tiles: [ { section: 'contra', route: 'contra', title: 'contra_hub', sub: 'contra_hub_s', icon: 'pill', order: 10, gated: false, keywords: 'condom copper-t pill injection' } ],
    css: '.contra-swatch { ... }',                   // optional, module-scoped classes only, colours only via var(--token)
    home: (S) => '',                                 // optional: HTML card on Home (return '' when not relevant; keep it rare)
    afterHome: (v, S) => {},                         // optional: wire listeners for your home card
    me: (S) => '',                                   // optional: items on the Me page
    afterMe: (v, S) => {},
    summary: (S) => [ { title: '…', lines: ['…'] } ],// optional: what the doctor-summary page shows from this module
    sample: (personaId, S) => {},                    // optional: add demo data when a sample woman is loaded (§6)
    under18: (S) => '',                              // optional: extra button on the under-18 screen (teen module only)
    topbar: (S) => '', afterTopbar: (tb, S) => {},   // optional: topbar icon buttons (read-aloud only)
    beforeRender: (v, route, S) => false,            // optional: return true if you rendered the whole view yourself (quick-exit cover)
    afterRender: (v, route, S) => {},                // optional: runs after every render (stop timers/speech here)
    langs: []                                        // lang module only: [{ code, label, name, locale, script, fallback, partial }]
  });
})(window.Saathi);
```

Rules for registration:
- Every string key starts with `<id>_`. Every route is `<id>` or starts with `<id>-`. Prefix routes too.
- Route names may only contain letters, digits, `-`, `_`, `.` (they live in `location.hash`). No `=` or `?`.
- `tiles[].section` must be one of: `periods contra pregtest ttc preg post loss intimate cond screen meno teen tools`.
  `icon` is one of: `home diary learn help gear back person check chev search leaf heart care pill drop baby bell file map speaker users chart clock flower ribbon moon sparkle lock play`, or your own `<svg …>` string (24×24, `stroke="currentColor"`).
- `title` / `sub` in tiles are string keys (or `{en,hi}` objects).

## 2. The API (`window.Saathi`, called `S`)

| Member | What it does |
|---|---|
| `S.state` | the whole saved state (getter; never cache it across renders — sample loading replaces it). Read-only for you except through the helpers below, `S.state.situation` (read), `S.state.events`, `S.state.checkins`, `S.state.daily`, `S.state.dob` (read). |
| `S.data(id)` | your module's persisted object, `state.mods[id]`. Mutate it, then `S.save()`. |
| `S.save()`, `S.render()` | persist; re-render the current route. |
| `S.setHash(route)`, `S.route()` | navigate; current route. |
| `S.wire(rootEl)` | wires `[data-go="route"]` (navigate), `[data-ask="topic"]` (opens the free-call form pre-filled), `[data-start-diary]`. Call after every `innerHTML`. |
| `S.t(key)`, `S.tf(key, {n:1})`, `S.tx({en,hi})` | translate a key; with `{placeholders}`; pick from an inline bilingual object. Fallbacks are automatic. |
| `S.esc(str)` | HTML-escape. **Escape every piece of text and every user value you put in innerHTML.** |
| `S.fmtD(date, opts)`, `S.fmtRange(a,b)` | locale dates (Intl options). |
| `S.today()`, `S.toISO(d)`, `S.fromISO('YYYY-MM-DD')`, `S.addDays(d,n)`, `S.diffDays(a,b)`, `S.monthKey(d)`, `S.clamp(n,a,b)`, `S.pad2(n)` | dates (local, midnight). |
| `S.I.<name>`, `S.icon(nameOrSvg)` | inline SVG icons (see list above). |
| `S.backRow(title, backRoute, gated)` | the standard screen header with a back button. The button returns to the screen she came from (in-app history; the artifact viewer has no browser back), falling back to `backRoute` (default `'care'`). `gated=true` adds the "Needs approval before launch" pill. Every screen must start with it. |
| `S.goBack(fallback)`, `S.backBtn(fallback)` | go back in the in-app history; a bare back button (`data-back`) for custom headers. |
| `S.gate()` | the gated pill alone. |
| `S.toast(msg)` | short confirmation. |
| `S.sheet(innerHtml, onWire(sheetEl))`, `S.closeSheet()` | bottom sheet. |
| `S.canSave()` | true only when the woman has started a diary. In browse mode, show guides but replace save actions with `S.needDiary()` (returns a card with a "Start my diary" button). |
| `S.ask(topic)` | open the free Qura call form with a topic. Or put `data-ask="topic text"` on a button. |
| `S.reminders.upsert({id, mod, title, kind, start, every, weekdays, dates, time, on})` | add/update a reminder in the shared list. `title` = string key or `{en,hi}`. `every` = days; `weekdays` = [0–6] (0=Sunday); `dates` = explicit list. `kind`: `med`, `checkup`, `visit`, `custom`, `log`. |
| `S.reminders.list()`, `.get(id)`, `.remove(id)`, `.next(r)` → Date|null, `.text(r)`, `.upcoming(days)` → [{r, date}] | read reminders. Home shows the next 3 days automatically. |
| `S.cycle.*` | `starts() gapsAll() usable() lastStart() cycleDay() bleedingDays() rangeInfo() bandHi() isPregnant() countsOff() ageYears() lastCheckins(n)` — the diary maths. |
| `S.coreSummary()`, `S.summaries()` | used by the doctor-summary page. |
| `S.state.situation` | `{ pregnant, pregnantSince, scanDate, breastfeeding, deliveredOn, hormones, hormonesSince, pcos, thyroid, hysterectomy, stopped, planning }` — set by the woman on the Me page. |
| `S.langs`, `S.langMeta(code)`, `S.strings` | language list and the string tables. |

## 3. Look and markup (reuse these classes; they already exist in app.css)

- Screen: start with `S.backRow(title, back, gated)`, then a short `<p class="small">` intro, then cards.
- `card` (white, rounded) · `card soft` (quiet panel) · `card dark` (maroon, used for "see a doctor"/Qura call; inside use `h3`/`h2` and `p class="small" style="color:var(--dark-text)"`) · `card ok` (green, reassurance) · `card warn` (gold border, caution).
- Buttons: `btn` · `btn primary` (one per screen, the main action) · `btn secondary` · `btn ghost` · `btn sm` · `btn block` · `btn on` (selected). Always `type="button"`.
- Choice chips: `<div class="chips"><button class="chip on">…</button></div>`.
- Lists of links: `<div class="list"><button class="item" data-go="…"><span class="ico-sm">${S.I.pill}</span><span class="body"><strong>Title</strong><span>Sub</span></span></button></div>`.
- Big action row: `<button class="action" data-go="…"><span class="ico">svg</span><span class="body"><strong>…</strong><span class="small">…</span></span><span class="go">›</span></button>`.
- Grids: `grid2` `grid3` `grid4` · `row` `row spread` `row wrap` · `stack`.
- Text: `h1` (screen title, set by backRow) · `h2` section · `h3` card title · `lead` · `small` · `eyebrow` (label) · `hl` (accent) · `note` (side note) · `footnote`.
- Pills: `pill` (gold) · `pill ok` · `pill accent` · `pill muted`.
- Red flags: `<div class="flag urgent">` (call 112 now), `<div class="flag">` (see a doctor soon), `<div class="flag ok">`.
- Checklists: `<div class="checklist"><label><input type="checkbox"> text</label></div>` (add class `done` to checked labels).
- Numbered steps: `<ol class="steps"><li>…</li></ol>`.
- Key/value: `<dl class="kv"><dt>…</dt><dd>…</dd></dl>`.
- Tables: wrap in `<div class="table-wrap"><table>…</table></div>`.
- Mini charts: inline `<svg class="spark" viewBox="0 0 300 80">` with classes `ln` (polyline), `pt` (circles), `gd` (grid lines), `text`. Draw to scale; label real values.
- Timers: `<div class="bigtimer">00:00</div>`.
- Collapsibles: `<details><summary>…</summary>…</details>`.
- Inputs: plain `<input>`, `<select>`, `<textarea>` (already styled). Label every input (`<label for>`).
- Colours: only `var(--bg --card --card-2 --fg --text --muted --accent --accent-soft --accent-2 --peach --peach-2 --gold --gold-soft --ok --ok-soft --dark --dark-text --line)`. No literal colours except `#FFFFFF` text on `--accent`. Dark mode then works for free.
- No horizontal page scroll at 390px. Long words must wrap. Give flex children with text `min-width:0`.
- No `alert/confirm/prompt` (they do nothing here) — build confirmations into the page. No `tel:`/`mailto:` as the only way: show numbers as text with a Copy button (see `renderHelp` in app.js). External links only to real official pages, as `<a href="https://…" target="_blank" rel="noopener">`, and only URLs you have verified exist. No iframes, no fetch to other sites, no external images.
- Timers/intervals/speech must stop when the woman leaves the screen: keep the handle in a module variable and clear it in `afterRender` when `route` is not yours.

## 4. Words: voice, Hindi, safety

**Voice.** Warm, plain, specific, like a trusted woman doctor talking to a patient (Qura's house voice is Dr. Megha). Short
sentences. Say what to do, when, and where it's free. No hype, no fear, no exclamation marks, no emojis.
Use numeric ranges like 21–35. Prefer "see a doctor this week" over vague "consult your healthcare provider".

**Hindi.** Everyday Hindi in Devanagari that a woman in Lucknow, Patna or Jaipur speaks, not Sanskritised textbook Hindi.
Keep common English health words the way Indian women say them (pad, test, scan, report, IUD/Copper-T, injection, PMOS,
BP, sugar, doctor/डॉक्टर) — written in Devanagari when that is how people write them, in Latin script for brand-like terms.
Address the woman respectfully in the feminine: "आप … करती हैं / कर सकती हैं". Every visible string needs a Hindi version.
Long guide text can use `S.tx({en, hi})` objects instead of keys; still both languages.

**Safety and compliance — these are hard rules.**
1. Not a diagnosis. No computer-generated health score, risk %, or condition label about her. Counts of her own entries are fine.
   Symptom/condition helpers list *possible* causes and *how urgent*, always say "not a diagnosis", and are `gated: true`.
   Two exceptions, asked for by Mohit on 19 Oct 2026, each with the guard rails in section 20: the Menopause Rating Scale
   (a validated symptom-burden score, `meno-score`) and the PMOS "your answers match" verdict in `selfcheck-pmos` (2023
   international PCOS guideline). No other module may add a score, a risk % or a condition verdict.
2. Red flags always route to action: "Call 112 now" for emergencies (heavy bleeding with dizziness, one-sided pain with fainting
   in possible pregnancy, seizures, etc.), "see a doctor today", "this week". Reuse the existing safety guide wording where it fits.
3. Never show "safe days" or present any calendar method as contraception. No fertility/ovulation claims beyond the existing tool.
4. Qura's doctors are BAMS (Ayurveda). They can advise on cycles, weight, diet, sleep, order tests, and refer. **Hormonal medicines,
   contraceptive prescriptions, HRT, abortion pills, fertility drugs and surgery need an MBBS/MD gynaecologist** — say so and say Qura refers.
   Never suggest an Ayurvedic/herbal remedy as treatment for a medical condition.
5. No product selling, no Qura kit, no prices of Qura products inside health guides. The only Qura touchpoint is
   "Ask a Qura doctor about this" / "Book a free call" (use `data-ask`), at most once per screen, never on emergency screens.
6. Give Indian public options first and say what is free: ASHA, ANM, Anganwadi, PHC/CHC/district hospital, Ayushman Arogya Mandir,
   Jan Aushadhi, government schemes. Helplines: 112 emergency, 108/102 ambulance, 104 health advice, 14416 Tele-MANAS,
   181 women helpline, 1098 Childline, 1097 NACO HIV/STI.
7. Facts must be correct and current for India (laws, scheme amounts, schedules, doses). If you are not sure of a number,
   leave the number out and say who to ask. Do not invent facility names, addresses, phone numbers, doctors, reviews or statistics.
8. Medicines: you may name what doctors commonly use and why, and safety rules (e.g. "emergency pill works best within 72 hours,
   sooner is better"). No dosing instructions beyond what a public government leaflet tells women. Always "your doctor decides".
9. Sensitive topics (abortion, violence, sex, loss) are handled with privacy first: no judgement, no gendered blame, mention discreet mode,
   never store what she didn't choose to save.
10. Under-18s: education only; no saving; mention Childline 1098 and that a parent/guardian or trusted adult can come along.
11. Sex determination of a fetus is illegal in India (PCPNDT Act) — any pregnancy/scan content must not hint otherwise.

## 5. Gated items
Anything that interprets her data or could act like a medical device (symptom helpers, kick counter, contraction timer,
heavy-bleeding scoring, risk-based prompts) and anything legally sensitive (abortion info) is `gated: true` on its tile and
uses `S.backRow(title, back, true)`. Gated screens still work fully in the prototype.

## 6. Sample women (call `S.loadSample(id)`; your `sample(id, S)` hook can add module data for them)
- `priya` — 27, irregular long cycles, diagnosed PMOS, hair/acne check-ins, one heavy period.
- `asha` — 31, regular 28–30 day cycles, not pregnant, not planning. Good for contraception/screening/PMS.
- `meera` — 29, pregnant, last period 2 May 2026 (≈24 weeks on 18 Oct 2026), scan date same. Good for pregnancy.
- `sunita` — 33, baby born 21 days ago, breastfeeding. Good for after-birth.
- `kamla` — 48, cycles changing (long gaps, heavy periods), hot flushes waking her at night. Good for menopause/midlife.
- `blank` (no sample) and `browse` (no diary) must also work: guides render, save actions show `S.needDiary()`.
Sample data you add must be plausible and clearly sample (no real names beyond the persona's first name).

## 7. Done means
1. `node --check mods/<id>.js` passes.
2. `node test/check.mjs <id> --shots` prints `OK: no issues found` (it opens every route for every sample woman in EN and HI,
   clicks every button, and flags page errors, raw keys, untranslated Hindi, overflow, empty screens and dead links).
3. You looked at the screenshots in `test/shots/<id>/` (Read the PNGs) and fixed anything that looks broken, cramped or unbalanced.
4. Every tile route opens; every screen has a way back; nothing is a dead end or "coming soon" unless the spec says so.

## 8. Core behaviour added in version 6 (UI/UX audit fixes)
- **Prototype labels** are off by default. `S.gate()` and `S.backRow(title, back, true)` render the "Needs approval" pill only when Me > Prototype > "Show prototype labels" is on (`S.flags.proto`). Do not hard-code approval tags.
- **Discreet mode** (`S.flags.discreet`): Home hides numbers, charts, dates and stage cards; module `home()` cards are not shown at all. Keep anything a family member could read neutral when this flag is on.
- **Home** shows at most three "today" items: the monthly check-in, the next reminders, and one or two module cards chosen by her stage (pregnant: preg, pregtools; after birth: post; planning: ttc; 45+ or periods stopped: meno; otherwise contra, periods; then access). Return `''` from `home()` when you have nothing useful today.
- **Care** shows "For you" (five tiles picked by stage and her onboarding goals in `S.state.goals`) and 13 topic pages `#topic-<section>`. Link to a topic with `data-go="topic-<section>"`.
- **Search** covers tiles and Learn articles in English and Hindi with Hinglish synonyms. Put extra words in a tile's `keywords`.
- **Tidy pass** after every render: any text under 13px is lifted to 13px (SVG, `.barlabels`, `.tl-labels`, `.cal`, `.bigtimer` excluded); the first `p.small` under the title is clamped to two lines with "More" when long; on long screens, text-only cards over 450 characters fold with "Show more". Cards with `.dark`, `.warn`, `.ok`, a `.flag`, a form control, a `.btn.primary`, `[data-copy]` or an emergency number never fold.
- **Navigation**: back returns to the same scroll position; re-rendering the same screen keeps the scroll; sheets close when the screen changes.
- **Colours**: use `var(--accent-strong)` for any filled background with white text (it stays deep berry in dark mode). `var(--accent)` is for text, icons and borders.
- **Toasts with actions**: `S.toastAct(message, [{ label, fn }])`.
- **App lock** and the Android "Notes" icon live in the core; modules need nothing for them.

## 9. Version 8: pictures and the petal garden
- **art.js** (core, loaded after app.js) draws every picture as inline SVG: `S.art.produce(week)` (the week's fruit, vegetable or
  staple, matching the pregnancy size text), `S.art.flower(month, petals, { fresh, grow, bg, leaves })`, `S.art.spot(key)` (a coloured
  picture for a Care section or a Learn group), `S.art.badge(icon, hue, earned)`. Colours are `--art-*` and `--h-*` tokens in app.css
  (light and dark). Use `class="hue-<name>"` (rose, teal, sky, green, orange, plum, purple, gold) to colour an icon circle: `.ico-sm.hue`.
- **Home**: a cycle ring (period days, the usual 21–35 gap, the likely range when there is one, today's marker), the week's produce and
  a trimester bar in pregnancy, a 6-week recovery ring after a birth. Discreet mode still hides all of it.
- **Care**: topics are a picture grid; every tile icon takes its section's colour. Learn rows take their group's icon and colour.
- **Events**: modules can register `event: (name, payload, S) => {}` and fire `S.emit(name, payload)`. The core fires `log`, `checkin`
  (`quiet` when the check-in raised a red flag), `read` (9 seconds on a guide), `ask`, and `tool` when a module saves right after her
  tap (`S.save()` does this; `S.saveQuiet()` saves without it). `quiet: true` is set on loss, abortion, violence and emergency screens.
- **homeTop** hook: one compact strip under the log buttons on Home (used by the garden).
- **mods/joy.js** (the petal garden): a petal for each kind of action, at most once per kind and 3 a day; 12 make the month's flower
  (a different Indian flower each month). "Sach ya Myth?" cards (31, humanized, EN/HI, chosen by stage, 5 a day, share on WhatsApp),
  12 badges, weeks in a row. It never celebrates on quiet screens, never shames a missed week, and is not a health score.

## 10. Version 9: explanations and checked maths
- **mods/explain.js** ("What your diary shows", gated): fixed rules turn what she logged into plain explanations: what is happening,
  common reasons, what she can do, and how soon to see a doctor (Call 112 now / today / this week / this month / keep an eye / usual).
  26 situations: short, long or usual gaps, a late period, long or heavy periods, severe pain, spotting, bleeding after periods stopped,
  a start re-logged within 10 days, and check-in answers in each stage (cycle, pregnancy, after birth, midlife). Home shows the most
  urgent one not yet marked "Got it" (urgent ones first); the diary shows a one-line note; the page ends with "How Sakhi works out your
  numbers", a table of her own starts and gaps with what was counted and why. Never a diagnosis, score or label.
- **Dating API**: `S.preg.info()` returns `{ lmp, edd, from: 'scan'|'lmp', days, weeks }`. A scan report's due date (`situation.scanEdd`)
  beats the last period; the old `scanDate` is never used for weeks. Every module counts pregnancy weeks through this one function.
- **Cycle maths**: `S.cycle.starts()` merges a start less than 10 days after the previous one; a gap is left out when hormones, a
  pregnancy or the year after a birth touches any part of it (`S.cycle.excludedWhy(from, to)`); `fertileInfo()`, `midlifeStage()`,
  `rawStarts()` are exposed. Bleeding days accept an end up to 20 days after the start (before the next start).
- **test/maths.mjs**: 37 hand-worked checks with the clock fixed at 18 Oct 2026 (cycle day, gaps, likely window, bleeding days,
  re-logged starts, hormone windows, pregnancy weeks from LMP and from a scan EDD, days after birth, fertile window, midlife stage,
  and which explanation each situation produces). Run it after any change to the maths.

## 11. Version 10: one tap
- **Home answers in place.** "How are you today?" chips (by stage) log a symptom in one tap and offer "What helps". "Your questions":
  an ask box (typed, or spoken on Android through `SakhiAndroid.listen(locale, prompt)` -> `window.__sakhiHeard(text)`) with results
  under the box as she types, and six picture tiles of the common questions for her stage. Guides open as a quick-answer sheet
  (`S.openAnswer('group.id')`: summary, Listen, full guide, when to see a doctor, Ask a Qura doctor, three related questions).
  Danger-sign and assault answers show the emergency path, never the Qura button.
- **Search** drops filler words (English, Hinglish, Hindi), maps Hindi/Hinglish words through SYN (late/der se/देर -> missed, hilna/हलचल ->
  kick, jalan -> burning…), stems longer English words, and ranks by words matched (title counts twice, whole phrase in a title +3,
  articles for her stage break ties). Care and Learn search use the same ranking.
- **SOS** in the top bar (app and browse): every helpline with Call (`tel:`; the phone's dialer opens) and Copy.
- **Stage picker** (`#stage-btn` on Home, `S.stageNow()`): periods, trying, pregnant (scan EDD or last period), had a baby (birth date,
  breastfeeding), periods stopped. Choosing periods within a year of a birth asks her to log the day periods came back.
- **Four tabs**: Home, Diary, Care, Help. Learn lives under Care (with a back button); Care ends with "All articles".
- **Android back** closes an open sheet first (`window.__sakhiBack()`), then goes back.
- Home no longer shows the six-gap chart (it is in Diary > Trends) or the "All guides" row (the Care tab).

## 12. Version 11: a lighter look
- **Theme**: lavender-grey page (`--bg #F7F4F8`), white cards, plum-ink text (`--fg #2F2233`), deeper berry accent (`--accent #BF2E5A`
  for text, `--accent-strong #C42F5C` behind white text), a blush-to-lavender wash at the top of every screen (`--wash1/--wash2`),
  translucent top and tab bars. `card dark` is now a light lavender highlight card (`--hl1/--hl2`) whose buttons turn berry; anything
  urgent uses `--ink`/`--ink-text` (toasts, `.flag.urgent`, `card dark urgent`, explanation "Call 112 now"). Every main screen passes
  WCAG AA contrast in light and dark.
- **Home**: a 7-day week strip (period days filled, spotting ringed, likely window dashed, a dot when she logged something; past days
  open the day sheet), round one-tap actions (Period started/ended, Spotting, Symptoms, Check-in with a dot until done; in pregnancy
  This week, Symptoms, Check-in, My logs), pastel question tiles. The old three-button log row and the chips row are gone.
- **Day sheet** (`openDay(date)`): step through days, toggle period start/end/spotting for that day, then symptom chips with small
  pictures in four groups (Pain, Body, Mood, Discharge); "What helps" after each new symptom; "Add flow and pain details" opens the
  detailed log. New daily keys: d_acne, d_calm, d_happy, d_anxious, d_irritable, d_disch_ok, d_disch_bad, d_itch, d_pbleed.
- **Calendar**: round days, dashed likely window, today ringed.
- **Appearance**: light by default on every phone (`settings.theme = 'light'`), with Dark and "Same as phone" on the Me page. A tiny script in index.html applies her saved choice before the first paint.

## 13. Version 13: ideas borrowed from paper diaries
- **The + button** (`#fab`, core): on Diary it is always there; on Home it appears once the round buttons scroll out of sight. Tapping it
  fans out today's entries: Period started/ended (smart), Spotting, Symptoms, Mood, Note, under a "Today · date" chip. Period entries
  log in one tap (with Undo); the others open the day sheet at that section. In pregnancy or after a hysterectomy there are no period
  entries. Android back, Escape or a tap outside closes it. Discreet mode uses the neutral words.
- **Day sheet** (`S.openDay(date, focus)`, now in the API): `focus` is `'sym'`, `'mood'` or `'note'`. New **note** per day in
  `state.notes['YYYY-MM-DD']` (text, max 600 characters, only on the phone, saved as she types; never in the doctor summary).
  Calendar days now open this sheet too; the detailed flow log is one tap inside it.
- **One colour per kind of entry** (`S.kinds`): pain orange, body green, mood purple, discharge teal, note sky (`{ hue, ico, label }`);
  the period keeps the bleed colour. Used by the day sheet groups, small dots under calendar days and week-strip days (with the kinds in
  the calendar's aria-label), the second calendar legend, the round Home buttons (spotting rose, symptoms orange, check-in green),
  the + menu and Trends > "What you noted" (days per symptom in the last 90 days, coloured bars).
- **First-use tips** (replaced by tours in version 16, section 16): one note at a time from Sakhi beside the thing it explains.
- **Sakhi** (`S.art.sakhi({ pose, look, bg, label })`): poses `'hi'` (waves), `'calm'`, `'cheer'`; four looks (skin, hair, clothes),
  picked in Me > "Sakhi's look" (`settings.look`). Skin and hair use `--art-skin-N`/`--art-hair` and keep natural colours in dark mode.
  She appears in tours, the first-log Home hero, empty Trends, the under-18 screen and the garden. She never "speaks" in the first person.
- **Paper diary**: Diary cards and the day sheet use `--paper` with a faint grain (`--grain`), dotted rules (`.dotrule`), handwritten
  headings (`.hand`, Kalam with Devanagari, falling back to the display serif), and ruled lines in the note box.
- Sample diaries (Priya, Asha, Kamla) now carry a few months of symptoms and notes so the colours show in a demo.

## 14. Version 14: a first run in her language, and a Home that fits her stage
- **First run** (core `renderWelcome` + `renderOnboard`): Language (phone language pre-selected, `state.langChosen`) -> Hello
  (three promises, Start / Just read, "How Sakhi keeps your data" sheet) -> Age (decade, then year; month only for someone who may
  be 17 or 18; under 18 goes to the read-only pages) -> Stage (one of six: periods, trying, pregnant, had a baby, periods changing
  after 40, just learning) -> one question for that stage (last period with "about N weeks ago" answers saved as
  `{ t: 'start', approx: true }`; due date from the scan or last period; baby's birthday and breastfeeding) -> "Does anyone else use
  this phone?" (if yes: lock, plain words, Notes icon on the spot; the PIN sheet opens on Home). No keyboard, about 200 words, 7 taps
  on the shortest path. **No consent step**: the diary works on her phone without one.
- **Guessed dates** (`S.cycle.approxStarts()`): a guessed start sets the cycle day, a gap touching it is not counted, and a real start
  within 10 days replaces it. Home says the date is a guess until she fixes it.
- **Midlife** (`S.cycle.isMidlife()`): periods stopped, or her choice (`situation.midlife`), or 45+ unless she chose otherwise
  (`midlife: false`). Used by stageNow, the check-in, Care "For you", explain and the daily cards. Me > My situation has the switch;
  the stage sheet separates "Periods changing after 40" (`mid`) from "My periods have stopped" (`meno`). `S.openStage(initial)`.
- **Per stage**: after a birth, until six weeks or her first period, Home and the + menu show Recovery today and Feeding instead of
  period buttons; PMOS set in Me puts irregular periods, signs, tests and food first in her questions; "Just learning" Home leads
  with the daily card and answers; the Qura card fits her stage (`data-qura`: qura, qura_pmos, qura_ttc, qura_meno) and is not shown
  in pregnancy or while breastfeeding / in the first six weeks after a birth, until the doctor-signed kit rule exists.
- **When her stage changes**: a week past the due date, Home asks "Has your baby arrived?" (Add the birth date / Not yet, a week's
  snooze in `state.prompts.baby` / "My pregnancy ended", which quietly opens loss support). A positive result on the test page offers
  "Switch to pregnancy" (she decides). Nothing switches on its own.
- **Sharing**: "Request a free call" books either way; before anything would leave the phone a sheet lists what the doctor would see
  and asks separately (`leads[].share`, `consent.c4` only on yes). The old pre-ticked box is gone.
- **First week**: joy's "Your first three petals" card (note how you feel, read one answer, today's card) for 7 days or until done.
  A quick answer read for 9 seconds now counts as reading.
- **Demo**: sample women moved off the first screen: press and hold Sakhi on the Hello screen, open the link with `#demo`, or Me > Demo.

## 15. Version 15: a doctor one tap away; emergency numbers for emergencies
- **Top bar**: a berry "Doctor" button (`#doc-btn`, stethoscope `I.steth`) replaces SOS on every screen and opens "Talk to a Qura
  doctor" (`ask('')`), with or without a diary. The brand stacks as a small QURA over Sakhi so the labelled button fits at 360 px,
  online or offline.
- **Help**: "Not an emergency? Speak to a doctor" comes first; "Call 112 now if" stays right below with an "Emergency numbers"
  button (`#sos-btn`, the same sheet as before, 112 first). The long helpline list left the page.
- **Modules**: the "see a doctor" boxes in Periods and Conditions, and the end of the symptom guide, offer "Speak to a doctor"
  (`data-ask=""`) instead of the safety page; Midlife lost a duplicate safety button (its doctor card stays).
- **Unchanged on purpose**: danger signs in pregnancy, explanation cards at "call 112 now", the ectopic warning on the test page,
  heavy bleeding or thoughts of self-harm after birth, assault and violence, loss, under-18 (Childline 1098), and the emergency line
  in Tell a person. A booked call cannot help in an emergency, so these keep their numbers and never offer a booking.
- The Help intro and the Hello promise now say "based on official health guidance" until a doctor has reviewed the content.

## 16. Version 16: tours
- **What**: a short walkthrough the first time she opens a screen. One feature at a time: the screen dims, the feature sits in a
  ring, and a card from Sakhi says what it is and how to use it (about 20 words), with Listen, Close, the step count, Not now or
  Back, and Next or Done. Three steps at most.
- **Tours**: Home (week strip, round buttons, ask box), Diary (calendar, Trends, the + button), Care (topics, the read-aloud
  speaker, the Doctor button), Help (Speak to a doctor, Emergency numbers), Me (privacy, Delete everything).
- **Try it**: the last Home and Diary steps pulse; tapping the real feature (the ask box, the +) ends the tour and does what it
  always does. Tapping any lit feature counts as done. Delete still asks first.
- **When**: on her first visit to a screen; one tour per visit, a minute between tours, two a day. Never on a sample diary, the
  lock screen, over a sheet or the + menu, or while an urgent explanation card is on screen. Help never starts on its own (she may
  be there in an emergency). Reading-only women get Care (where they land) and Help.
- **Not now**: the tour comes back once, on her next visit; a second "Not now" (Close, a tap outside, Android back and Escape count
  the same) turns that tour off. A replay never un-marks a tour she has seen.
- **How to use Sakhi**: in Help and Me, every tour she can use, replayable, with "seen" marked. Me also has "Show a tour on new
  screens" (`settings.toursAuto`, on), "Read tours aloud" (`settings.tourVoice`, off at first, for shared phones) and "Show the
  tours again" (clears `state.tours`).
- **Words**: plain words in discreet mode (`pd`, and "Your notes" for the Diary tour); the mic line only where the mic is (`pm`);
  "show the app as Notes" only in the Android app (`pw` is the web line). English and Hindi; other languages fall back like the
  rest of the UI.
- **State**: `state.tours[id] = { st: 'done' | 'later' | 'off', d }`, `state.tourDay = { d, n }`. `state.hintsSeen` is gone.
- **Layout**: four clear panels catch taps outside; the ring draws the dim with a spread shadow, so the hole follows the feature's
  corners and stays live. The card goes below the feature, else above, else floats; a feature taller than half the screen is lit
  from its top, with its heading, leaving room for the card. Re-placed on scroll and resize, and kept across a re-render.
- **Modules**: `register({ tours: [{ id, route, title, steps: [{ sel, h, p, pd?, pm?, pw?, tryIt? }], auto?, browse?, hue? }] })`.
  A step whose target is missing is skipped. API: `S.startTour(id)` (a replay), `S.tours()` (the ids).
- **Accessibility**: a labelled, described dialog that takes focus when it opens (the card, not a button, so touch phones get no
  heavy focus ring); Listen uses the read-aloud voices; reduced motion stops the pulse.

## 17. Version 17: tours for each stage, and for each feature the first time she meets it
- **Home by stage**: Home has a tour per stage, picked by `stageNow()`: pregnancy (her week and the size drawing, then This
  week / My logs for weight, BP, sugar, Hb and tablets, then questions with Danger signs and 112), after a birth (the 6-week
  recovery ring or, after 42 days, days since the birth; then Recovery today and Feeding, or logging the period again;
  then questions), trying (months of trying, then why no app can name her fertile day), midlife (questions after 40, then
  bleeding after menopause needs a doctor). Periods, trying and midlife keep the plain Home tour first; discreet mode always
  gets the plain one.
- **Features**: the day page (period, how you felt, the note; no period step in pregnancy), a quick answer (Listen, then a
  doctor; never on danger signs), the check-in, the cycle ring (once a period is logged; lit with its legend), Change stage
  (from her second day), the explanation card on Home (never an urgent one) and the explanation page, and the garden (after
  her first petal). The day page and answers are "moments": they start inside the sheet, and the tour leaves with the sheet.
- **"?"**: beside the cycle ring's legend and on the explanation page; it replays that feature's tour (`data-tour-q="id"`,
  handled for the whole app).
- **Rules**: one tour per screen visit or moment, a minute apart, now three a day (moments count). Never on samples, Help, the
  lock screen, or near an urgent card (urgent explanation cards on Home or the explanation page, the check-in's red flag).
- **How to use Sakhi**: two groups, Screens and Features, showing only what fits her stage. Replaying a moment opens it first
  (today's page; an ordinary answer for her stage).
- **Data**: `{ id, route | moment, title, titleD?, kind: 'screen' | 'feature', order?, when?(), auto?: bool | fn, open?(),
  menu?: false, browse?, hue?, steps: [{ sel, wrap?, h, p, pd?, pm?, pw?, vars?(), when?(), tryIt? }] }`. `h` and `p` may be
  functions; `{a}`/`{b}` in the words are filled by `vars()` with the buttons' own labels, so the words match in every
  language. Several tours can share a screen: the first eligible by `order` runs. Modules: explain (`xp-home`, `explain`)
  and joy (`garden`) register theirs; string keys keep the module prefix. API: `S.tourMoment(name)` for a module's sheet.

## 18. Version 18: feel better now, what repeats, the heads-up, family cards, her month with Sakhi
- **Feel better now** (`mods/relief.js`, routes `relief`, `relief-<id>`): about 3-minute routines for period cramps (never in
  pregnancy), nausea in pregnancy, poor sleep, an anxious or low mood (`calm`) and hot flushes. Each step has a timer (pause,
  next); breathing steps get a circle that grows and shrinks with "Breathe in / Hold / out" (4-6, box 4-4-4-4, 5-5). Steps can be
  read aloud (`S.speakEl`, `S.stopSpeech` from lang.js; off by default in discreet or shared-phone mode, her choice remembered).
  The end asks "Did this help?" (saved in `state.mods.relief.log`, a quiet petal) and always says when to see a doctor; the calm
  one keeps 14416/112 and offers no booking. No herbal remedies (rule 4). She lands back where she was unless she finished it
  or left it more than 10 minutes ago. Timers stop when she leaves (`afterRender`). Nothing celebrates on these screens.
  Where it shows: a button right under the symptom group she tapped on today's day page, a Home card (homeTop) until she
  has done it today, a Care > Tools tile, and the heads-up. API: `S.relief.pick(keys)`, `.forSym(key)`, `.helped('YYYY-MM')`.
- **What repeats for you** (core, Diary > Trends): from 3 to 6 of her last periods with notes (guessed dates left out), a
  symptom repeats when she noted it from 8 days before to 4 days after most of them, and not just as often mid-cycle. Up to 3,
  each with when ("usually from the first day of your period", "often about 2 days before") and "in 3 of your last 4 periods".
  Counts of her own entries, says it is not a diagnosis; none in pregnancy, after a birth, or once periods have stopped.
- **The heads-up** (core, Home, right under the round buttons): 1 to 3 days before her likely window (regular cycles only),
  with what repeated last time (up to two), what to keep ready, and the cramps routine when cramps is one of them. Not while
  trying for a baby. "Got it" hides it for that cycle (`state.prompts.heads`). Plain words in discreet mode.
- **Explain it to my family** (`mods/family.js`, route `family`): nine WhatsApp cards (periods, the first 40 days, mood after the
  baby, PMOS, iron tablets, check-ups, menopause, trying for a baby, talking to a daughter), her stage first, Send on WhatsApp
  (a `wa.me` link; a share petal) and Copy. Nothing about her goes in them; they end "From Qura Sakhi, a free health app for
  women." Written in the house voice (humanizer); needs a doctor's review. `data-nofold` keeps them from folding.
- **Her month with Sakhi** (joy.js, `joy-month`, `joy-month-YYYY-MM`): the month's flower, days she noted something, periods
  logged, days she read an answer, cards played, the check-in, what she noted most, what helped (from relief), and a kind line
  from Sakhi. Discreet mode hides periods and symptoms. "Share my flower" sends only the flower line. Home offers it in the
  last 3 days of a month and the first 5 of the next, until she opens it (`recapSeen`); every month in the garden opens its card.
- **Samples**: Asha now has notes around four periods (cramps from day 1, irritable 2 days before) and a "yes" on the cramps
  routine; Kamla a "a little" on hot flushes.

## 19. Version 19: the "premium" set, free (everything Flo and Maya charge for, except a chatbot)
- **Report for my doctor** (core route `report`; from Me, Help's doctor card, Trends, the self-check): her own entries on one
  screen for ANY doctor: about her (age, pregnancy week and due date, birth date, flags), her last 6 periods as a table (bleeding
  days, days to the next, heavy, guessed dates marked), average/shortest/longest gap, what she noted in 90 days, the last 3
  check-ins, every module's `summary` (so module data and the self-check show up), up to 4 questions from her own data, and her
  notes from the last 30 days only if she ticks the box (`mem.rpNotes`). Send on WhatsApp (`wa.me`) or Copy. The average,
  shortest and longest under the table come from the same gaps the table shows, so a doctor can check them; the long-gaps
  question looks at her last 6 usable gaps, the window the predictions use.
- **Move to a new phone** (core route `backup`, from Me): a backup code `SAKHI1.<base64url>` = 1 flag byte (gzip or not), 16-byte
  salt, 12-byte IV, AES-GCM ciphertext of the whole state; the key comes from her 4 to 6 digit PIN (PBKDF2-SHA256, 150,000 rounds).
  CompressionStream when available. Restore asks before replacing everything. Wrong PIN or code: one plain message. Not for
  sample diaries; hidden when WebCrypto is missing. Nothing leaves the phone unless she copies the code. The copy is honest about
  the PIN: PBKDF2 only slows guessing, so someone who has the code could guess a short PIN. It tells her to keep the code where
  only she can see it and suggests 6 numbers; it never says nobody can read it.
- **Should I get this checked?** (`mods/selfcheck.js`, `selfcheck`, `selfcheck-pmos|endo|fibroids`, gated): 7 yes/no/not-sure
  questions each, a line from her diary under some (never chosen for her), then "yes to N of M signs doctors ask about", how soon
  (very heavy periods: this week; 2+: this month; 1: keep noting), "not a diagnosis", what a doctor checks, where it is free, one
  doctor button, and "go now" signs with 112 at the top for endometriosis and fibroids. Never a label or a score. Pregnant: points
  to the pregnancy symptoms guide and saves nothing. Saved results feed the doctor summary and her report. Joy is quiet here (`QUIET` in app.js): the petal counts, but no confetti
  covers a result that may say "go now" or "this week".
- **21 days of small steps** (`mods/journey.js`, `journey`, `journey-pmos|iron`): one step a day (walks, meals, sleep, iron foods,
  the routines, her check-in), a petal each day she marks done, missed days never counted against her, an optional 9 am reminder
  (`reminders` id `journey`), a Home card for today's step (plain words in discreet mode), and a finish card with a doctor. No
  doses: tablets are always "the way the ASHA or doctor told you".
- **Today's stories** (access: `access-stories`, Home line via `homeTop`): the "Today for you" cards one at a time, full screen,
  with progress bars, Back/Next, tap left/right, auto-advance every 7 s (off with reduced motion), Pause, Listen, and an end card;
  seen today greys the Home line. Not in discreet mode. The old access Home card is retired.
- **Your menopause timeline** (meno: `meno-timeline`, first in the hub): her last period, "N of 12 months without a period" as a
  bar, her longest gap this year, the three stages (the middle one lights only after 12 months), what helps (routines, diary,
  HRT, bones, dryness) and a doctor. No score.
- **Weekly update for your husband** (family: `family-partner`, a card at the top of the family page in pregnancy): the week, the
  baby's size, 4 tips for this third of the pregnancy, and the hospital danger signs; she sends it herself.
- **Core API**: `S.routeOwner(route)` now resolves prefix routes too (`relief-hot`, `journey-iron`), so links can check them.
- **What stays out on purpose**: a chatbot, condition labels or scores, fertile-day predictions, an open community. (Section 20
  later added two guarded exceptions on request: the PMOS verdict and the perimenopause score.)

## 20. Version 20: the PMOS verdict and the perimenopause score (Mohit, 19 Oct: "build these properly")
Both cross rule 1 on purpose, so both stay gated, cite their source on screen, and say what they cannot tell.
- **PMOS verdict** (`selfcheck-pmos`): two questions were added (a blood test showed high testosterone; an ultrasound said
  polycystic ovaries, PCO or PCOD, or high AMH), each with "Not done" instead of "Not sure". The verdict follows the 2023
  international evidence-based PCOS guideline (summary pp. 2, 4, 7–11):
  - adults: 2 of 3 = "Your answers match PMOS (PCOS)": irregular periods (her answers, or her diary when she says "Not sure":
    2+ of her last 6 usable gaps under 21 or over 35 days, or any over 90); high male hormones (unwanted hair, which the guideline
    calls a valid self-report and predictive on its own, or the blood test); polycystic ovaries on a scan or high AMH. 1 = "match 1
    of the 3" (or "a scan finding alone doesn't mean PMOS"); 0 = "don't match". Acne or thinning hair alone are named as weak signs,
    never counted.
  - within 8 years of the first period (estimated as under 21): both of the first two are needed, the scan is never used, and one
    is "at risk", checked again in a year or two. Before 3 years, long gaps mean over 45 days and "fewer than 8" becomes a 3-month
    gap (guideline 1.1.1).
  - no verdict under 18, around menopause (`isMidlife`), after a hysterectomy, after a birth or while breastfeeding, or in
    pregnancy (nothing saved). On a hormonal method she answers about before she started. Already diagnosed: she sees the verdict
    with "it doesn't change your diagnosis".
  - always: "An app can't rule out other causes ... thyroid, prolactin and other hormones. Only then is it PMOS", the guideline
    named, "Not a diagnosis", one doctor button; a "See a doctor soon if" flag for hair that grew fast or a deeper voice (not
    typical of PMOS: tumours must be ruled out, guideline 1.3.7). Never "you have", never a percentage. The saved result (`v`) goes
    to the doctor summary and her report with "other causes not yet ruled out". Endometriosis and fibroids keep the count and the
    "how soon": neither has criteria a questionnaire can match.
- **Perimenopause score** (`meno-score`, Care > Menopause, second in the hub, gated): the Menopause Rating Scale, 11 symptoms rated
  None to Very severe (0–4) "at this time"; total out of 44 and three parts (body 1, 2, 3, 11; mood and energy 4–7; bladder,
  vagina and sex 8–10) with the bands from Heinemann et al. 2004 (Table 6): total 0–4 / 5–8 / 9–16 / 17+, mood 0–1 / 2–3 / 4–6 / 7+,
  body 0–2 / 3–4 / 5–8 / 9+, urogenital 0 / 1 / 2–3 / 4+. Shows the number, a 4-part bar, the parts, what the band means (moderate:
  worth a doctor; severe: this month; hormone therapy named as the most effective for flushes and sweats, a doctor checks what is
  safe), change since last time ("lower is better"), her history and chart, and what helps (routines, HRT, dryness, bones). Flags:
  severe heart discomfort (BP, pulse, Hb, thyroid; 112 with chest pain), severe low mood (14416, and the self-harm line). Says it is
  not a menopause test (her periods are: the timeline) and that thyroid, anaemia, depression and medicines look the same. Under 40:
  a POI note; pregnant: the pregnancy guide instead. Saved on finishing, one entry a day, the last 24. Kamla's sample has two months
  (18 then 15). The menopause diary keeps "no score": it is a different, unscored record.
- **Joy**: `QUIET` covers `meno-score` too (no confetti over "Severe").
- **Before launch**: (1) a commercial licence for the MRS from its developers (ZEG Berlin; the 2003 paper allows research use
  without permission, nothing covers apps); (2) the validated Hindi wording (MRS-H, Int J Reprod Contracept Obstet Gynecol 2019,
  doi 10.18203/2320-1770.ijrcog20193519) in place of ours; (3) doctor sign-off on every verdict and band text (Dr. Megha plus an
  MBBS gynaecologist: the verdict uses allopathic criteria); (4) CDSCO: both are closer to device software than anything else in
  the app; keep them gated until the determination.
- Tests: scratchpad `v20/walk_v20.mjs` (51), `v20/contrast20.mjs` (AA light/dark, EN/HI); `walk_v19` updated for 9 questions.

## 21. Version 21: existing features brought in line with the evidence (Mohit, 19 Oct: "keep sakhi focused on women reproductive health only and enhance current offerings with evidence if any else leave")
**Scope rule.** Sakhi covers women's reproductive health only. No new conditions: no standalone sleep or insomnia programme, no
diabetes-risk or bone score, no depression or anxiety screen. The evidence map (`docs/_research-sakhi-validated-tools-oct19.md`)
is used only to strengthen what already exists; where a feature already matched the evidence it was left alone.
Changed (each line names its source; walk `v21/walk_v21.mjs`, 28 checks):
- **Pelvic floor trainer** (post): "keep going every day for at least 3 months" (NICE NG123 1.4.4, NG210 1.6.14); a course line
  counted from her first set ("day N of 90 · done on M days"); in pregnancy a pregnancy intro and Back to the pregnancy guide,
  which now links the trainer (NICE NG210 1.3.11–1.3.13; Cochrane 2020: 62% less leaking late in pregnancy).
- **Kick counter** (pregtools): counting is optional; no proof that counting to a set number prevents problems; know her baby's
  pattern and call the same day, never wait to finish a count (RCOG GTG 57, April 2026, Grade A/B/C). Alarms unchanged.
- **Breast self-check** (screen): the evidence card (Cochrane CD003373: a strict monthly self-exam did not cut deaths and nearly
  doubled biopsies; Mumbai trial, BMJ 2021: health-worker breast exams cut deaths about 30% in women 50+); the reminder is optional;
  both studies in the sources. The 5-yearly free exam in My check-ups is unchanged (national programme).
- **Feel better now** (relief): nausea adds RCOG GTG 69's signs (medicines not staying down, weight loss, confused or unsteady) and
  "there are safe medicines for pregnancy sickness"; hot flushes adds the CBT self-talk step and names CBT as recommended (NICE NG23
  2024, IMS 2026 Grade A); sleep adds CBT-I's 20-minute rule and a fixed wake time; cramps adds fever or bad-smelling discharge
  (see a doctor today).
- **Period pain page** (periods): the same infection sign in the "not normal" list, marked "go today".
- **Anaemia page** (cond): heavy periods are heavy enough to see a doctor when they get in the way of work, sleep or going out,
  whatever the chart says (NICE NG88 1.1.1); the chart's 100 cut-off stays as a second trigger.
- **Iron journey**: "treating low Hb usually takes a daily tablet for about 3 months, then a repeat test" (Anemia Mukt Bharat 2026),
  no dose.
- **After-birth 6-week check** (post): a 75 g sugar test after gestational diabetes, then once a year (MoHFW GDM guideline 2018).
- **PMOS self-check, what a doctor checks** (selfcheck): the 2-hour glucose test, repeated every 1 to 3 years (2023 international
  PCOS guideline 1.9.2, 1.9.3, 1.9.9).
- **Emergency numbers** (core): Tele-MANAS toll-free 1800-891-4416 next to 14416 (official site).
Checked and left as they were: pregnancy sugar testing (MoHFW 75 g, first visit and 24–28 weeks), pre-eclampsia signs, the national
iron schedule on the anaemia page, PMS advice (CBT, two cycles of daily ratings), discharge pages (no self-treatment, warning on
steroid mix creams), leaking and prolapse ("every day for at least 3 months"), teen period pain, the endometriosis diary (no claim
that it speeds diagnosis), the contraception finder (every method stays; a provider checks), no ginger anywhere.

## 22. Version 22: the 10 serious bugs from the 20 Oct audit (Mohit, 20 Oct: "yes fix all 10 serious ones")
Audit: `docs/_audit-sakhi-bugs-oct20.md` (in the Qura repo). Walk `v22/walk_v22.mjs`, 39 checks, each replaying the auditor's own
steps; `v22/contrast22.mjs` for the new screens; maths gains 3 checks (49). The regression runner now includes v21 and v22.
1. **Me switches never invent or delete a date.** Ticking Pregnant opens the stage sheet for the scan due date or last period, and
   nothing is saved until she saves (an old scan date is not offered again); unticking it opens the same sheet to say what happened.
   Ticking Breastfeeding with no birth date opens the after-birth sheet; unticking it keeps the birth date. Unticking hormones keeps
   `hormonesSince` and adds `hormonesUntil`, so the months on hormones stay out of her averages (`excludedWhy` uses the stop date).
2. **Guessed starts.** A real start less than 21 days from an onboarding guess, before or after it, is the same period remembered
   better: it replaces the guess (`dropGuesses` on every way of logging a start; `liveStartEvents` covers diaries saved earlier).
   A real start 21 days or more away is another cycle, and the guess stays a guess. Was 10 days, so a guess of 24 Sep and a real
   12 Sep counted as two periods.
3. **Alarms run three weeks ahead.** `buildNotifs` lists every occurrence in the next 21 days, soonest first, at most 60 (the
   Android limit). The list is re-sent whenever the app comes back to the front, and Android re-arms the stored list after a phone
   restart or an app update (`BootReceiver`). Before, each reminder sent only its next 4 alarms.
4. **Times after midnight.** A reminder at 00:30 rings at 00:30 (hour 0 was read as missing and became 9).
5. **Menopause timeline.** Whole calendar months since the last period. "Menopause" only from 45; 40 to 44 is early menopause (see
   a doctor); under 40 it is POI, which needs a gynaecologist ("Read about POI"), from 4 months without a period or when she says her
   periods stopped. Pregnancy, the year after a birth, breastfeeding, hormones and a hysterectomy show why there is nothing to count.
   The longest gap includes the one still open and shows only before 12 months.
6. **Past 42 weeks** (more than 294 days by her dates): "go to your hospital today" sits right under the hero on Home and as the
   urgent flag in the pregnancy guide; "Not yet" on the baby prompt cannot hide it; discreet mode shows a plain-words line with no
   pregnancy words. Any urgent module card (`data-xp-urgent`) now sits under the hero, above the round buttons.
7. **Moving a period's date** in the log sheet keeps each day's own symptoms: the chips show the chosen day's symptoms plus what she
   tapped, and saving changes only what she tapped.
8. **Answers belong to one woman.** `S.onOwnerChange(fn)` runs when the diary changes owner (Delete everything, a sample, a
   restore). Cleared: self-check answers, the contraception finder, emergency-pill and missed-pill steps, the accessibility
   screens' entries, the after-birth mood answers and recovery draft, running relief, feeding, pelvic-floor, kick and contraction
   timers, and quiz answers kept without a diary. The core resets its own screen memory and keeps the lock as it was. Modules that
   already compared an owner (meno, loss, pregtest, ttc, tools, intimate) were left as they were.
9. **Shared-phone mode closes the diary, never signs her out.** When the app opens, after 10 minutes without a tap, and when she
   comes back after more than 30 seconds away, the diary closes: the PIN lock if she has a PIN, otherwise "Your diary is closed"
   with Open. Onboarding, goals and entries are untouched, and switching the mode on works at once. Android tells the page when it
   leaves and returns (`__sakhiPause`, `__sakhiResume`); the Me page line now says "Closes ... Nothing is deleted."
10. **Heavy-bleeding chart: no change.** Checked against Magnay et al. 2020 (BMC Women's Health; an author of the original chart is
   a co-author): Higham 1990 scored pads and tampons only, and recorded clots and flooding without scores. "The total counts pads
   only, as in the original chart" and the separate clots and flooding line are right.
Found while testing 1: after a birth, until her first period, nothing counts from the period before the pregnancy, breastfeeding or
not (`S.cycle.afterBirth()`, now part of `S.cycle.countsOff()`): no "Day 303, and no period yet", no period alarm, no 90-day flag
in the doctor view, and the PMS screen says why.

## 23. Version 23: the P1 and P2 bugs from the 20 Oct audit (Mohit, 20 Oct: "fix p1 and p2 also")
All 34 P1 and the P2 items in `docs/_audit-sakhi-bugs-oct20.md`. Walk `v23/walk_v23.mjs` (68 checks, each the auditor's own
steps), `v23/contrast23.mjs` for the changed screens, and maths now 66 checks (month ends, 29 Feb, birthdays, hormone windows, a
pregnancy that ended, regular-cycle windows, period length). The regression runner includes v23.
**Period maths (core).**
- One period length everywhere (`S.cycle.periodLen`): an end counts when it comes before the next start and within 20 days, on
  the calendar, in the report, in Trends and in the explanations.
- Spans keep things out of the averages after they end (`situation.spans`): hormones stopped and started again keep both windows;
  a pregnancy that ended (`endPregnancy`: the stage sheet, "My pregnancy ended", the visits page) leaves out the gap that holds
  it; an earlier birth keeps its year.
- The likely window (`rangeInfo`) is for regular cycles only (FIGO 2018: shortest to longest gap within 7 days at 26 to 41,
  within 9 at other ages) and never in pregnancy, the year after a birth, breastfeeding, after a hysterectomy, with periods
  stopped or on hormones. Past the window, Home says "N days past your likely range".
- The heads-up (Home card and phone alarm) only when no recent gap is long (`headsRange`). Explanations: the 90-day card at 90
  days whatever her window says; a long last gap stays on screen until then; no gap or late cards while on hormones.
- Home's main button (and the + menu): "Period ended" while her latest period is open (started in the last 10 days, no end
  logged), "Period started" once the end is logged.
- Age by the calendar: she is 30 on her 30th birthday.
- Pattern check: the pain row comes from her logs (pain that stopped her day in 2 or more of her last 6 periods); the two
  questions start blank (the PMOS one is the Me page flag; the nipple one stays on screen and adds a prolactin line). The
  midlife page counts only sleep as poor sleep.
- Report and Trends: gaps that are not counted are marked; each says which gaps its numbers use; "Periods logged"; discharge
  entries named as discharge; "end not logged" in the WhatsApp text; no "+" on exact gap numbers.
**Pregnancy and after birth.** The doctor view counts weeks from the last period (the scan date is only the label). With no date
there is no week number and every dead end opens the stage sheet; due dates at most 280 days ahead. Before 37 weeks the labour
timer shows only "go to hospital". Fasting sugar is flagged: 95 or more is above the national target (show a doctor this
week), 126 or more is the diabetes range (in the next few days). Vaccines follow the national schedule since 2023: fIPV-3 and
Vitamin A at 9 to 12 months, Vitamin A every 6 months from 16 months to 5 years. HBNC "Day 1" (home births) is the day of
birth. A feed across midnight counts today. Weeks 0 to 3 have no size and the husband card says "the first weeks"; past 42
weeks it leads with the hospital. Trimester bar 35/35/30; the 6-week ring is full at 6 weeks; "Has your baby arrived?" from 41
weeks; one flag per tab on the logs page.
**Reminders.** `S.addMonths` keeps dates inside the month (31 Aug + 6 months = 28 Feb). A reminder can carry `until` (a medicine
course's end) and `doneOn` (today already done: Next, Coming up and today's alarm move on). Contraception: the pill time lives on
the reminder, so an edit under All reminders sticks; Antara reminds when the window opens, on the due date, then weekly until 4
weeks late, with a Home card while late; LAM after 6 months, a Copper-T past its years and an implant or IUS past its date say it
may no longer protect her (method page and Home). Check-ups: monthly reminders from the due date until she adds a new date;
after 65 the cervical, breast and mouth screens are the doctor's call, with no reminders. The breast check "a week after my
period" follows every new period (module `event` hook). Journeys: the reminder ends with the 21 days and skips a day already
done; the finish card says "You did it" only after 21 steps. Fertility log: a fever is judged in her unit (100 °F), readings up
to 42 °C are kept with the fever advice and left off the chart. Android: exact alarms when the phone allows them; the Me page
offers "Allow on-time reminders" on Android 12 and later.
**Conditions and self-checks.** Endometriosis: one strong sign (pain that stops her day, deep pain with sex, pain passing stool or
urine) is "this month" (NICE NG73 1.1.1); very heavy periods "this week". PMOS question 1's diary line counts short gaps too.
Verdict rows say "Not known" for not sure or not done; at 19 the "at risk" verdict and the result line agree; under 18 comes
before after-birth. Lab values: grouping commas (1,050; 1,05,000); TSH in mIU/L and µIU/mL is one unit. "Highest pain logged"
counts every entry. The perimenopause score's answers reset at midnight. The verdict, the result and the score never fold.
**App-wide.** Discreet mode: no stage card or stage words on Home. A sheet that saved something refreshes the screen behind it
when it closes, by Android back too. Trends' report button works. In pregnancy, danger words in English, Hindi or Hinglish
(bleeding, swelling, blurred sight, fainting, fits, fever, leaking water, belly pain) put the danger-signs guide first. Under 18:
nothing is saved (`mem.teen`), Doctor shows Childline 1098 and a trusted adult, and the age question comes back next time. Demo
asks before replacing her own entries. Plurals: `S.one` makes "{n} days" (months, weeks, years) singular for 1 (English only).
The + button allows for the top bar; a tour card never covers its feature (the page moves instead); a language switch keeps
unsaved check-in answers and the call form; date ranges use one digit system; the log sheet refuses future dates and keeps one
start a day; the article list is "Learn" again; the day sheet's arrows stop at 90 days and past days say "Noted"; onboarding
asks the birth date once; a new phone can restore from the Hello screen.

## 24. Version 24: signup for every woman, the diary stays on the phone (Mohit, 20 Oct: "i want user signup data for all but healthdata stays private")

**What she sees.** After the first run (and after the birth-year step for "Just read"), a signup screen stands in for every
screen except Help: mobile number (+91), then a 6-digit code (sent on WhatsApp, with "Not on WhatsApp? Send by SMS" one
tap away), then optional details (first name, PIN code, how she heard of
Sakhi, updates by SMS or WhatsApp, both off until she ticks them). A returning number skips the details. Under 18: no account
and nothing saved (as before). The sample women never see it. If Qura can't be reached she can "Continue for now"; Home and the
readers' page then keep a "Finish signing up" card. Me (and the readers' page) link to "Your Sakhi account": the details Qura
keeps, Edit details, Log out, Delete my account. Logging out or deleting the account brings the signup screen back; the diary
stays on the phone either way. An older diary with no birth year gets a year field on the number screen (the year someone may
be 17 asks the month too). The notice, the age step and the Me page say what the account holds.

**The rules for module authors.**
1. Modules never touch the network: no `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket` or `EventSource`. Core `net()` is the
   only door out and it sends only the fields in `SEND` (app.js) for each call. `test/signup.mjs` fails if a module, art.js or a
   second core call site makes a request, and if any request carries a field or diary text the allowlist doesn't name.
2. The account is not in `S.state`. It lives under its own key (`qura-sakhi-account-v1`), so backups, samples, "Show my data"
   and `S.reset()` never carry it. Read it with `S.account.signedIn()` and `S.account.info()` (number, birth year, name, PIN
   code, email, how she heard, update choices); never copy it into `S.state` and never send it anywhere.
3. Nothing from the diary goes into the account: not her stage, dates, symptoms, notes, conditions, goals or which screens she
   opens. A module that needs the server (a call request, a reply to "Tell a person") needs a new endpoint in ../server/SERVER_SPEC.md, a
   new `SEND` entry in core, and her yes on screen first.
4. Every module screen sits behind the signup screen until she signs up, so a module never has to check for an account.
   Help is never covered.

**Server.** `../server/SERVER_SPEC.md` is the contract. With no server address (`window.SAKHI_CONFIG.api`, written by
`build-apk.sh` from `SAKHI_API`) the app runs a stand-in server on the phone: nothing is sent, the code is always 123456 and the
code screen says so. Tests: `node test/signup.mjs` (66 checks, stand-in server per the spec); `smoke.mjs`, `check.mjs` and
`maths.mjs` sign in a test account first (`S.account._testSignIn()`).

## 25. Version 25: first name and PIN code needed, email optional, and the full tour for a new woman (Mohit, 20 Oct: "app should collect email as optional name and pincode should be mandatory", "and also full tour should run for a new user")

**Her details.** The screen after the code now needs her first name and her 6-digit PIN code, and Skip is gone.
- A name is 2–40 characters with a letter, in any script.
- Email is new and optional ("Only for Qura to reach you about your account"). It is saved trimmed and lower-case.
- One line names the first thing to fix, and she is put in that field.
- The screen stays up until both are in. It comes back if she closes Sakhi on it, and when Qura already has an account
  without them (signing in on a new phone). Help stays open meanwhile.
- Edit details follows the same rules: the name and PIN code can be changed but never emptied, and the email can be cleared.
- The account page shows the email.
- The notice (`ob_notice_5`) says what the account holds. Its version is now `2026-10-20.2`.
- `SEND['PATCH me']` gains `email`, and the server matches: SERVER_SPEC 5.3 and migration
  `20261020180000_sakhi_account_email.sql`.
- Her details go to Qura once. While a save is on its way, `acctSync` leaves the pending details alone. Before this, the details
  screen sent them twice at the same moment, and the live server recorded each update choice twice (seen on 20 Oct).

**The full tour.** It starts the first time she reaches Home on a Sakhi that has it: a new woman, or one who used Sakhi before
and never had it. Mohit's phone, an existing diary, didn't get it under the first rule ("no tour seen yet"), so that rule was
dropped on 20 Oct.
- It needs tours switched on, her own diary, the app unlocked, and a minute since the last tour.
- The day's three-tour limit doesn't hold it back: it is her welcome.
- One tour takes her through Home (her stage's), Diary, Care, Help and Me.
- The count names the screen ("Diary · 2 of 3"). The last step on each screen says "Next: Care" and goes there. The very last
  says Done, and a note says How to use Sakhi replays it.
- Not now, Close, a tap outside or back stops the whole tour. That screen's tour comes back once, as before. The screens she
  hasn't toured keep their own first-visit tours.
- Using a lit feature (the ask box, the +) stops it there.
- Help is in it because the tour takes her there. Help still never starts a tour on its own.
- It counts as one of the day's three tours and runs once: `state.fullTour = { st: 'on' | 'done' | 'stopped', d }`.
  Switching tours off keeps it from starting on its own; the replay still works.
- How to use Sakhi lists "The full tour" first ("5 screens, one after another"; readers get Care and Help).
- "Show the tours again" also clears `state.fullTour`.
- API: `S.startFullTour()`.

**Tests.**
- `node test/signup.mjs` (80 checks): the needed fields, the email, the details going once, and the screen coming back after
  a restart and for an older account.
- `node test/tours.mjs` (36 checks):
  - the whole walk for a new woman;
  - Not now, and using a lit feature;
  - the full tour once for a woman who used Sakhi before;
  - past the day's three tours, and tours switched off;
  - the replay, and Show the tours again;
  - Hindi at 360 px, and readers.
- `S.account._testSignIn()` now gives the test account a name and PIN code.

## 26. Version 26: Me as a short page with a page for each part (Mohit, 22 Oct: "do quick wins and restructure together")

The audit is in `../docs/ux-audit-me-2026-10-22.md`. This version builds its quick wins and the restructure (a–j). Me was 5.7
screens with 12 sections and 66 controls; it is now about 1.2 screens.

**Me, top to bottom:**
1. Her name and masked number (→ account).
2. Privacy on a shared phone (→ `me-privacy`), with what's on: "On: App lock, Discreet mode" or "Nothing switched on yet".
3. My health details (→ `me-health`), showing her stage in the stage sheet's words. In discreet mode: "My details · Only you
   can see these", with no stage or condition named.
4. Reminders on this phone (→ `me-reminders`, Android only).
5. Language and read-aloud (the lang module's row).
6. My data (→ `me-data`).
7. Appearance (→ `me-look`).
8. How to use Sakhi (→ `me-help`).
9. About and privacy (→ `me-about`, with the version).
10. Delete everything on this phone, set apart at the bottom in the accent colour, asking first as before.

The Me tour still lights `#me-privacy` and `#me-del`.

**The pages:**
- **Privacy:** discreet mode, shared-phone mode, app lock, hide the app (Android).
- **Health:**
  - One Stage row that opens the stage sheet. It replaces the five stage checkboxes (pregnant, breastfeeding, periods
    stopped, after 40, planning a baby), which could contradict each other.
  - The four conditions as switches, with their doctor-verified wording unchanged.
  - With app lock on, the page asks for the PIN (or fingerprint) first. That holds until Sakhi goes to the background
    (`mem.healthOk`).
- **Data:**
  - Report for my doctor and Move to a new phone.
  - "Share with my Qura doctor" as a switch (was "—" and a Give button), next to "See what a doctor sees".
  - "What Sakhi keeps on this phone": counts in words, or one neutral count in discreet mode. The raw data is one tap further.
- **Appearance:** light, dark or same as phone; Sakhi's look; the garden.
- **Help:** the tour list (the same one as on the Help tab), the two tour switches, and Show the tours again.
- **About:** the notice, the notice text, the grievance contact (still a placeholder, waiting for Mohit) and the version.
  Five taps on the version show the prototype settings; the sample women appear once prototype labels are on. Women testing
  Sakhi never meet them by chance, and the doctor view's "Needs approval" tag shows only with prototype labels on.

**Switches:** every setting row's checkbox (`.item > input[type=checkbox]`) is drawn as an on/off switch. `wire()` gives it
`role="switch"`. Checkboxes in lists (`.checklist`, the intimate-health share box) stay checkboxes.

**Rules for module authors:**
1. A module's `me` hook still returns HTML. Core places it by module id (`ME_PLACE` in app.js):
   - `lang` → the main page;
   - `docportal` → My data;
   - `joy` → Appearance;
   - `pregtest` → My health details;
   - any other module → a "More" group on the main page.

   To place a new module elsewhere, add it to `ME_PLACE`.
2. `afterMe(v, api, page)` now gets the page (`main`, `health`, `data` or `look`).
3. To link to a setting, use its page: `data-go="me-health"` (hormone medicine, conditions, stage), `me-data` (sharing,
   report, backup), `me-privacy`. contra and docportal were moved from `me` to these.
4. Never name a stage or condition on the main Me page.

**Tests:**
- `node test/me.mjs` (58 checks): the order, fit and discreet wording; each page and where module rows went; switches; the
  Stage row; the PIN asked again; data in words; prototype behind the version; Delete everything; the Me tour; Hindi at
  360 px; the web without reminders.
- `tours.mjs` opens the tour list from `me-help`.
- `smoke.mjs` and `check.mjs` know the seven new routes.

## 27. Version 27: safe to hand to a woman (Mohit, 22 Oct: "can you plan to do all the fixes")

The audit is `../docs/app-audit-2026-10-22.md` and the plan `../docs/fix-plan-2026-10-22.md`. Numbers below are the audit's.

**Mohit's decisions (22 Oct):**
- D1, help until the doctor hand-off: WhatsApp only.
- D2, features awaiting approval: "make it visible without any tag and fully functional". The CDSCO question behind the
  tag (section 20) is still open; this is Mohit's call. The tag shows only with prototype labels on.
- D3, the app's name: stays "Qura Sakhi", in notifications too.
- D4, fonts: bundled in `fonts/` with their OFL licences. Nothing is fetched from Google.

**Help that reaches a person (1a).** Nothing inside Sakhi is sent anywhere until the hand-off (SERVER_SPEC 10.1).
- "Speak to a doctor" (`ask`) has no form. It opens WhatsApp to Qura's staffed number with a hello in her language
  (`ask_wa_hello`). Without a number it opens Qura's booking page.
- The number comes from the build: `SAKHI_HELP_WA=91XXXXXXXXXX ./build-apk.sh` puts it in `CFG.helpWa`.
- "Ask a Qura doctor about this" adds the topic to her questions for the call (`state.askTopics`, up to 8). They are shown on
  `ask`, stay on the phone and never go into the link.
- "Tell a person" (`tell`) opens WhatsApp the same way, and keeps 112, 14416 and the emergency numbers. It is hidden without a
  number and for girls under 18.
- Opening WhatsApp or the booking page adds `{ d, via }` to `state.leads`, for the garden's "brave" badge. Nothing else.
- Copy that said "Received", "Request saved", "replies within 1 working day" or "reads diaries once a week" is gone. That
  includes the check-in note and the share-with-doctor card, which now say the words stay on this phone.
- The share-consent sheet (`sh_*`) is no longer shown. Its wording is kept for the hand-off.

**Sharing (8).** `S.share(title, text)` sends text she chose to send through Android's share sheet (the bridge's `share`). On
the web it uses `navigator.share`, or copies. The doctor report, the family cards and the garden use it. The only `wa.me` link
left is the help hello, which carries nothing about her.

**A shared phone (2):**
- While app lock, shared-phone or discreet mode is on, the page asks the bridge for `setSecure(true)` (FLAG_SECURE): no
  screenshot, screen recording or recent-apps picture. On Android 13+ recents never shows Sakhi's screen.
- The lock takes Sakhi's PIN. A fingerprint opens it too only when she turns on "Fingerprint unlock" (`state.settings.bio`,
  Me > Privacy, with app lock on). It is never offered in shared-phone mode. The bridge accepts strong biometrics only, never
  the phone's own PIN or pattern. Section 26's PIN-before-health page follows the same rule.
- Reminders on a locked phone:
  - A phone set to hide sensitive notification content shows a plain "Reminder" (the public version).
  - A phone set to show all content (Samsung's default) shows the reminder's text, as before.
  - In discreet mode the lock screen shows nothing, whatever the setting (each alarm's JSON has `secret`).
  - The icon is a plain bell, and the channel text no longer names periods.
- Text the bridge copies is marked sensitive.

**Reminders (10):**
- The phone gets at most 59 alarms, plus one at 10 am on the day after the last. That one asks her to open Sakhi
  (`notif_refill`, or `d_refill` in discreet mode), since alarms only refill when the app opens.
- On phones whose battery saving is known to stop alarms, Me > Reminders shows how to allow Sakhi, with a button to its app
  settings.

**Android (9, 13, 28):**
- If the page's renderer dies, MainActivity builds a fresh WebView on Home. A restore that fails loads Home too.
- Text follows the phone's font size (`setTextZoom`).
- The WebView has no content access and no database.
- `build-apk.sh` adds a Content-Security-Policy. Only the app's own files and the two inline scripts (by hash) run, and the
  only server the page can reach is `SAKHI_API`.
- `build-apk.sh` refuses a version name without "demo" unless `SAKHI_API` is https, and checks `SAKHI_HELP_WA`.

**Text, read-aloud and languages (11, 18, 19, 30):**
- Chart and label text that was 9–10 px is now 12–13 px.
- `.view` breaks a long word rather than pushing the screen sideways.
- Read-aloud skips closed sections, reads an open sheet from its own speaker, and reads charts by their labels.
- Read-aloud prefers a voice that runs on the phone.
- Articles follow the language chain (Marathi falls back to Hindi).
- The emergency sheet uses the translated labels.

**Crash fallback and old backups (12):**
- A screen that fails shows a bilingual card (`data-crash`) with Home and Care.
- `tidyState()` repairs a malformed diary on load and on restore.

**Sources (17).** Internal working notes are gone from article sources. The list for the doctor to confirm is
`../docs/sources-cleanup-2026-10-22.md`.

**Rules for module authors:**
1. To send text she chose to send, call `S.share(title, text)`. Never build a `wa.me/?text=` link, and never put anything about
   her health in a URL.
2. Never say something was sent, received or will be read unless it really leaves the phone through core `net()`.
3. Text in charts and labels is at least 12 px as drawn, and 13 px for anything she must act on. Check new screens with
   smoke.mjs's 200% pass.
4. Link articles by an existing `group.id` key. smoke.mjs checks every quoted key.

**Bridge (android/src):**
- New: `setSecure(on)`, `share(title, text)`, `maker()`, `openAppSettings()`.
- `testNotify(title, body, secret)`: the test notification is kept off the lock screen in discreet mode, like a real reminder.
- `canBiometric()` now means strong biometrics are set up. `biometric()` asks for those only, with a Cancel button.
- `speak()` picks an installed voice that runs on the phone. `voices()` reports `localService` per language.

**Tests:**
- New `node test/privacy.mjs` (51 checks):
  - help wording and links, in English and Hindi, with and without a number;
  - screen capture blocked with each privacy setting;
  - the fingerprint rules;
  - shares through the share sheet, with no `wa.me` share links;
  - reminders: discreet, the last one, the battery card;
  - no approval tags, and nothing fetched from Google;
  - the APK page under its CSP (when `android/build` exists).
- `smoke.mjs` adds the 200% text pass and the article links, and catches the crash card.
- `signup.mjs` checks that Ask sends nothing about her.

## 28. Version 28, part 1: four tools that do something (Mohit, 22 Oct: "start with the four small items with version 28")

From `../docs/feature-research-2026-10-22.md`: A2, A4, B4 and B5. New wording for the doctor is in
`../docs/wording-review-v28.md`. The iron help lines reuse verified text word for word.

**Iron tablets (new module `iron`, route `iron`):**
- **Plans** (from Anemia Mukt Bharat):
  - pregnancy: daily, 180 days;
  - after the birth: daily, 180 days;
  - the weekly tablet (20–49, not pregnant or breastfeeding), on a weekday she picks;
  - her doctor's dose: daily, with an optional end date that brings a "repeat Hb test" reminder.
  - The plan is suggested from her stage and age.
- **Daily use:**
  - "I took it" here and as a Home card (homeTop, neutral words in discreet mode).
  - A 7-day strip to tick a forgotten day.
  - "Days taken: n of 180" since the plan began. Missed days are never held against her.
  - Optional tablets left in the strip, counting down with each tick, with a "few left" note at 5.
  - "If it upsets you" and "When to get help", in verified lines.
- **Reminder:** one, `iron` (kind `med`), at her time. Ticking today sets `doneOn`. Stopping the plan removes it and keeps
  the ticks.
- **One record with the pregnancy logs.** `S.iron = { taken(k), days(), mark(k, on), active() }`:
  - The pregnancy logs' tablet grid reads and ticks IFA days through it.
  - IFA days ticked there before Version 28 are copied once (`mig`).
  - Starting a plan removes the pregnancy logs' `preg-ifa` reminder.
  - While a plan is active, that card's reminder button is for calcium only.
- **Summary** (doctor report, ASHA screen): plan and start, days or weeks taken, the last 30 days.

**Free check-ups for you (screen module, Home card through homeTop):**
- **Who sees it:** at 30–65, when cervical screening or the breast exam by a health worker has no date or is due.
- **Ways out:** "See my check-ups" (a date or "never" there starts the existing monthly reminder) or "Later" (hidden for 60
  days, `mods.screen.snooze`).
- **Never shown** in pregnancy or in discreet mode.
- Only her age is used; nothing reads her diary.

**My ASHA or ANM (new module `asha`, routes `asha` and `asha-show`):**
- **Her ASHA's number:** a 10-digit mobile (+91, a leading 0 and spaces accepted), a role and an optional name. It's kept
  only on the phone, in `mods.asha`.
- **Call:** a `tel:` link, one tap.
- **"Show her my summary":** large type, made of:
  - about her (name, age, stage);
  - the summaries of preg, post, iron, screen and contra;
  - her questions for the call (`state.askTopics`).
  - Nothing is sent.
- **Where it's linked:** Help (next to Tell a person), Care near me, the iron page, and tiles in tools, pregnancy and after
  the birth.

**Do it online (access module, route `access-online`):**
- Six official sites, each with what it's for and what she needs: ABHA, U-WIN, PMMVY, the Ayushman card (PM-JAY),
  eSanjeevani and the Jan Aushadhi locator.
- All are https on gov.in, opened and checked on 22 Oct 2026.
- There's a warning about OTPs and paying anyone. There are no forms: Sakhi fills in nothing.
- JANANI waits until its official address can be checked.
- Linked from Care near me, plus a tools tile.

**Rules for module authors:**
1. Another module's data is read through its API (`S.iron`), never written directly. A module that owns a shared record says
   so in its header.
2. Numbers she saves for other people (her ASHA) stay in `S.data(id)`. They are not account fields and never pass through
   `net()`.
3. Links to government sites are https on gov.in or nic.in, opened and checked when added. Never automate a portal that has a
   CAPTCHA.

**Tests:** new `node test/companions.mjs` (49 checks), in `npm test`.

## 29. Version 28, part 2: the pregnancy plan, scheme claims and the report for the doctor (Mohit, 22 Oct: "do the pregnancy plan, schemes, care near me and report next")

From `../docs/feature-research-2026-10-22.md`: A1, B1 and C1. Care near me (B2) waits for the open-data check and gets its
own section. New wording for the doctor is in `../docs/wording-review-v28.md`, section 5.

**My pregnancy plan (preg module, route `preg-plan`):**
- **Items:** 19, each with a week window. They follow the national schedule as Sakhi's verified week tips already state it:
  - registration, folic acid, and the four check-ups (by 12, 14–26, 28–34, from 36 weeks);
  - Td, the early scan (if advised) and the anomaly scan (18–20, as its tip says);
  - the PMMVY and JSY money, iron, calcium, PMSMA on the 9th and the 75 g sugar test;
  - JSSK, the birth plan, the ASHA and ambulance numbers, and family planning after the birth;
  - the 41-week check, shown only from week 41.
- **Text:** each card shows its week's verified tip (the `W` table) word for word. The only new words are the item names and
  the page's own lines.
- **Status, from her dates alone:**
  - Due now; Coming up (the next four); Done; Not done yet.
  - A missed window is never an alarm: "If you missed one, ask your ANM about it at your next visit."
  - Windows that start at week 0 read "Up to week 12", not "Weeks 0 to 12".
- **Done by itself, from her own records:**
  - her MCP card: the registration date, a check-up date inside each window, and both Td doses or a booster;
  - the pregnancy logs: a 75 g test in weeks 24–28;
  - her iron plan (`S.iron.active()`) and her ASHA's number (`S.asha.saved()`).
  - Anything else she marks Done (the date is kept) and can Undo.
- **PMSMA** repeats: "I went today" counts her visits, the item stays due through its window, and the next 9th is shown.
- **Reminders:** off until she turns them on (`plan.rem`). Then:
  - one at 10 am on the first day of each future check-up or test window (`preg-plan-anc1`…`anc4`, `scan2`, `ogtt`);
  - PMSMA at 9 am on each 9th until the due date, up to 8 (`preg-plan-pmsma`);
  - Td-2 four weeks after Td-1, while only Td-1 is in her MCP card (`preg-plan-td2`).
  - Items already due, done or past get none.
  - `planSync()` removes every `preg-plan-*` reminder and adds them again after each change (a tick, an MCP save, the
    switch), so none can go stale.
- **Elsewhere:** one row on Home, "Due now: X, and n more". It is a `homeTop` strip, under the round buttons and above
  the iron card, so the three-card cap on Home's items can't push it off. It's hidden in discreet mode, like the rest of the
  pregnancy card. The summary adds "Due now: …" for the report and the ASHA screen.
- **Data:** `mods.preg.plan = { done: { id: date }, pmsma: [dates], rem: true|false }`. `S.pregAnc()` gives her check-up
  dates to other modules, read-only.

**My claims (access module, on every scheme page):**
- **"Track my claim"** on the seven schemes she applies for herself: PMMVY, JSY, Anganwadi food (Poshan 2.0), paid maternity
  leave, sterilisation compensation, the PM-JAY card and Ni-kshay Poshan. Services like JSSK and PMSMA have no claim.
- **Saved in her diary only:** `mods.access.claims[k] = { started, docs: { i: 1 }, applied, got }`. The finder's answers
  are still never saved.
- **Papers:** the scheme's verified documents line, split at its semicolons into ticks. This only happens when the English
  and Hindi split into the same number of items.
- **Steps:** Getting papers ready, then Applied (dated), then Money or card received (dated). She can tap back to an earlier
  step.
- **PMMVY:**
  - "Register by {date}": 270 days after the birth, from the verified "how" text.
  - Reminders (`access-pmmvy`, 10 am) a month and a week before that date, removed once she has applied.
  - In pregnancy, once her MCP card has two check-up dates, a line says she can apply for the first part (₹3,000) now.
    The ministry's FAQ (read 22 Oct) asks for one check-up in one answer and two in another, so the line waits for two.
- **"My claims"** sits at the top of every scheme page. The summary goes to the report and the ASHA screen.
- **What a birth costs:** the pregnancy list adds the 2025 out-of-pocket cost of a birth (NSS 80th round, PIB: ₹37,630
  private, ₹2,299 public), next to JSSK's verified line.

**The report for the doctor (core, routes `report` and `report-show`):**
- **Her questions first:** her own questions (`state.askTopics`, the last 4) open "Questions I want to ask", then the
  suggested ones, up to 7 in all.
- **Report language:**
  - Chips for her app's language, English and Hindi (a Marathi app shows Marathi first).
  - The report renders in the chosen language through `inLang()`. It swaps `state.lang` for the render, holds saving, and
    puts both back in `finally`.
  - The choice lives in `mem.rpLang` and is never saved. The app's own screens stay in her language.
- **"Show the doctor, in big letters"** (`report-show`): the same report in large type, with no buttons.
- **Share and Copy** send the text in the report's language.
- **PDF, on Android only:** "Save as PDF or print" calls `SakhiAndroid.printPage(title)`.
  - That opens the phone's own print screen (`PrintManager` with the WebView's print adapter), where Save as PDF works
    offline.
  - In discreet mode the document is called "My notes".
  - The web has no such button, because an artifact page can't open the print dialog.
- **Print styles:** `@media print` hides the bars, sheets, toasts, everything marked `.no-print`, and all buttons.

**Rules for module authors:**
1. Summary lines are built at call time with `S.t`, `tx` and `S.fmtD`, so they come out in the report's language. Never
   keep translated text from an earlier render.
2. `save()` does nothing while `inLang()` runs. Anything a summary changes is saved by the next ordinary save.
3. New wording gets a new string key. `test/dupkeys.mjs` (run by smoke) fails when an object names a key twice, because
   JavaScript would silently keep only the last one. Version 28 nearly shipped `rp_show` twice, which would have renamed
   Help's "Going to a doctor? Show this report".
4. A module that owns a set of reminders rebuilds the whole set (remove everything with its prefix, then add) rather than
   patching single ones.

**Tests:** new `node test/plans.mjs` (72 checks), in `npm test`. The duplicate-key scan runs in `smoke.mjs`.

## 30. Version 28, part 3: Care near me from bundled government lists (Mohit, 22 Oct: "do the pregnancy plan, schemes, care near me and report next")

B2 in `../docs/feature-research-2026-10-22.md`. Where the data comes from, and the one step only Mohit can do (a data.gov.in
key, or downloading two files by hand), is in `../docs/care-near-me-data-2026-10-22.md`.

**The data (`web/tools/care-data.mjs` → `web/care/`, not in git):**
- **Sources:** India Post's PIN code directory and the NIN list of health facilities, both from data.gov.in under GODL.
- **Files:** each is a small script that sets `window.SAKHI_CARE[name]`:
  - `index` (sources, dates, counts and file lists);
  - `p56` and the like: PIN codes by their first two digits, `{ d: [districts], s: [states], p: { pin: [lat, lon, d, s] } }`;
  - `t12_77` and the like: facilities in 1-degree map squares, `[name, type, lat, lon, pin, address]`.
- **Types kept:**
  - centres: sub-centre `sc`, PHC `phc`, urban PHC or urban health centre `uphc`, urban health post `uhp`;
  - hospitals: CHC `chc`, sub-district `sdh`, district `dh`, civil, general or "<100 bedded" `gh`, women's or maternity
    `wh`, medical college `mc`.
  - Other types ("Others", dispensaries, post-partum units) and rows without a usable map location are left out. Swapped
    latitude and longitude are put right. The builder prints what it kept and dropped.
  - The rules were set from the real list's labels on 22 Oct: "Women Hospital" and "Civil Hospital/General Hospital" were
    being dropped until then.
- **Freshness:** `fac.revised` is the earlier of two dates: the catalogue's revision (December 2021) and the date the API
  gives its own copy (27 August 2019 on 22 Oct 2026). The card shows its year, now 2019.
- **Personal details:** mobile numbers, landlines (with an STD separator, or as 11 digits) and e-mails are taken out of
  every name and address. On the real list, 119 facilities had one, mostly a staff member's mobile number. Codes such as
  "Area-2 (070607804)" stay.
- **Map squares** come from the rounded location, so 81.99997 (stored as 82) sits in square 82.
- **Cleaning the locations.** Both lists have errors, found on the real data on 22 Oct, and a wrong "nearest" is worse than
  none. Six rules; the builder prints each count:
  1. **Misplaced post offices:** an India Post office beyond 15 km from its district's middle, or 3 times the district's
     median distance if that is more, is not used for its PIN code's location. Central Kolkata's 700001 had two of its
     three offices 25 km away. About 10,000 offices are set aside this way.
  2. **Shared default points:** a point shared by 4 or more facilities is a default, like a block or district centre; those
     facilities are left out. About 8,500, for example 106 Rajasthan sub-centres on one point, and Goa sub-centres placed
     in Bengaluru.
  3. **PIN codes that disagree with their facilities:** a PIN code more than 50 km from where 3 or more of its own
     facilities agree it is takes their location. 416 moved, for example PIN 486666, which sat on India's geographic
     centre, and 166 got a location they lacked.
  4. **Facilities far from their PIN:** a facility still more than 50 km from its own PIN code is left out. About 5,800.
  5. **Town-level points:** a facility with no PIN code to check, sitting on whole minutes of arc (a town's gazetteer
     point), is left out. About 100, for example CHC Valpoi placed in Panaji.
  6. **Far outside its own district:** a facility with no PIN code, whose own district India Post knows, is left out if it
     sits more than 40 km (or 3 times the district's median spread) from that district's middle. About 1,000.
     - An error of one district (Narsra, of Sikar district, placed in Jaipur) isn't caught, because a tighter rule would
       drop real remote centres such as Valparai's hospital. The caveat covers it.
     - Addresses lose the list's empty markers (`NA`, `\N`).
- **States the list hardly covers:** in a state with fewer kept facilities per post office than 40% of the national figure
  (`index.thin`), the card says the list is missing most centres there instead of showing a list.
  - On 22 Oct these were Kerala (2 facilities in the whole list), Gujarat (about a fifth), Arunachal Pradesh, Andaman and
    Nicobar, and Lakshadweep.
  - When nothing in either group is within 50 km in a covered state, one plain line says so, and that this doesn't mean
    there are none.
- **The first real build (22 Oct 2026):** 19,586 PIN codes and 147,967 facilities, in 394 files totalling 12.3 MB. The APK
  grows from 2.0 to about 6 MB.

**Loading (core, `S.care`):**
- `S.care.on()` is true only when the build bundled the data: config `care`, set by `build-apk.sh` when `web/care/index.js`
  exists.
- `S.care.load(name)` adds the app's own script `care/<name>.js` and resolves with its data, or with null when it is
  missing. The folder must be a plain relative path, and the name letters, digits and _. A web address or `..` loads
  nothing.
- It is the only place in the app that makes a script element (`test/signup.mjs` checks this). Modules never load files
  themselves.

**The card (access module, `access-care`):**
- **Her PIN:** her account's PIN code is filled in, with a line saying so. A PIN she types (her mother's home, say) is used
  on this screen only and not saved.
- **The answer:** the PIN's district and state, then the three nearest health centres (sub-centre, PHC, urban PHC, urban
  health post) and the three nearest hospitals (CHC, sub-district, district, government, women's, medical college) within
  50 km. Each row has its type, a
  straight-line distance, the address and Directions. Directions opens a map at the centre, never at her.
- **Edge cases:**
  - a PIN not in India Post's list says so;
  - a PIN with no map location shows its district without distances;
  - no centre within 50 km says "None within 50 km in this list".
- **Caveat and sources:** straight-line distances; the list was last revised in {year}, so check with the ASHA or 104 before
  going. Then the date Sakhi checked it, GODL, and links to both data.gov.in pages.
- **Without the data**, the old card stays: the live app will list real facilities here.
- **Privacy:** nothing about the lookup is sent. The phone reads `index`, one PIN file and up to nine map squares.

**Rules for module authors:**
1. Bundled data goes through `S.care.load()` (or a loader like it in core), never a module's own `fetch` or script tag.
2. Data from a government list shows its source, its licence and how old it is, next to the data.
3. A list Sakhi may not reproduce (Jan Aushadhi, One Stop Centres, NACO, until permission comes) is only linked, never
   bundled.

**Builder options:** `--save <dir>` keeps the downloaded lists (only the columns it reads) so `--from <dir>` can rebuild
without downloading again.

**Web prototype:** the published copy of `index.html` adds `window.SAKHI_CONFIG = Object.assign({ care: 'care/' }, …)` before
`app.js`. The 394 `care/*.js` files go up in two publishes, because a publish takes at most 255 files. The repo's
`index.html` stays without it, so the tests' own config isn't overridden.

**Tests:** `node test/plans.mjs` section 4 runs the builder on made-up files in `test/fixtures/care/` (every name starts with
TEST) into `test/_care/` (not in git), then checks the card, the edge cases, Hindi, that nothing is sent, and that a bad
folder or name loads nothing. `plans.mjs` now has 115 checks.

**Also fixed while building Version 28, part 2:**
- `iron` and `asha` (part 1) were missing from `mods/order.json`. So `check.mjs all` skipped them, and running `build.py`
  would have dropped them from `index.html`. Both are now listed. `build.py` reproduces `index.html` unchanged, and the check
  covers all 25 modules.
- Two core strings were defined twice: the new `rp_show`, now `rp_big`, and an old, unused `learn_p`, now removed. The new
  `test/dupkeys.mjs`, run inside smoke, stops this from happening again.

## 31. Version 29: Free doctor and care (Mohit, 22 Oct: "yes build the free doctor and care section")

From `../docs/consult-booking-research-2026-10-22.md`. No booking API is open to an app like Sakhi:
- eSanjeevani has none, and its site is behind reCAPTCHA;
- booking through ABDM's UHI network needs paid certification.

So this section sends her to the right free service and says what to choose there.

**The page (access module, route `access-doctor`):**
- **"A doctor, free":**
  - **eSanjeevani**, with "choose your state's Obs & Gynae OPD, or else the General OPD" and the list of states that had one
    on 22 Oct. Links go to sign-in and to OPD timings.
  - **ORS:** a government-hospital OPD appointment, AIIMS included.
  - **Aarogya Setu 2.0:** the government's UHI app, with Scan and Share.
- **"In pregnancy":**
  - the PMSMA centre finder;
  - Td on U-WIN (self-registration log-in);
  - free ambulances on `tel:102` and `tel:108`, with the JSSK line.
- **"Hospital care and support":**
  - PM-JAY hospitals (`hem.nha.gov.in/search`), with the C-section referral note and "Check my card" (Do it online);
  - Tele-MANAS: `tel:14416`, `tel:18008914416` and the website, with the verified line about thoughts of harm.
- **Order:** for a pregnant woman, the pregnancy group comes first.
- **Footer:** "Or speak to a Qura doctor" (`data-ask`), the shared OTP warning, and the date the links were checked.
- **Wording:** reused word for word where it exists (week tips 23 and 29, Do it online's eSanjeevani and U-WIN lines, the
  helpline labels). The new lines are in `docs/wording-review-v28.md`, section 6.

**Ways in:**
- first in Care near me's list;
- a "Free government options" card on the Doctor screen (`ask`);
- a link under Help's doctor card;
- Care tiles under tools and pregnancy.
- The pregnancy plan's Td card gets "Book on U-WIN", and its PMSMA card gets "Find a PMSMA centre", until the item is done.
- The safety page gets "Find your nearest One Stop Centre" and "Book a visit to a One Stop Centre" (Mission Shakti).

**Rules:**
1. Every link is static and carries nothing about her (no number, PIN code or name). Links open outside Sakhi:
   `shouldOverrideUrlLoading` hands them to the browser or dialer.
2. **Links are https on gov.in or nic.in.** The one exception is Aarogya Setu, which links to its official Play listing
   (published by NHA) because aarogyasetu.gov.in did not answer on 22 Oct 2026.
3. Sakhi never books for her and never automates a CAPTCHA portal. If a booking API ever opens to apps like Sakhi without
   paid certification, it goes through core `net()` with her explicit yes, never from a module.

**Also fixed:** the Doctor screen's booking button (`#ask-web`, `#ask-wa`) showed a stethoscope as big as the button; its
icon is now 18 px.

**Tests:** `node test/companions.mjs` section 7 (now 71 checks). It covers:
- the order and content;
- that every web link is official and every number right;
- that nothing about her is in any link and nothing is sent;
- pregnancy first;
- every way in, the plan buttons (gone once Td is done) and the safety links;
- Hindi, and the icon size.

## 32. Version 30: how a woman gets the most from Sakhi (Mohit, 22 Oct: "do all recommendations")

From `../docs/ux-value-audit-2026-10-22.md`, recommendations 1 to 10. Most of it rearranges what exists; the few new lines
of wording are in `docs/wording-review-v28.md`, section 7.

**New hooks:**
- **`today(api)`** returns an item, a list of items, or null. An item is
  `{ id, title, sub, icon, hue, go, act, actLabel, done, rem, order }`.
  - `act()` is the one tap (it saves its own change); `done` is the toast; `rem` lists the reminder ids the row stands for, so
    Coming up doesn't show them again today.
  - Only what she or her plan scheduled: never something her entries suggest (the CDSCO line). Plain words in discreet mode,
    or no item.
  - Today shows up to four rows. Users: iron (order 10), contra's pill or Chhaya day (12), pregnancy IFA and calcium from the
    logs' reminders (13, 14), the plan's "Due now" (20, never in discreet mode), today's journey step (30). The core adds her
    own reminders and medicines due today (`mod: 'tools'`, kinds `custom` and `med`; 40).
- **`setup(api)`** returns a step `{ id, title, sub, go | act, done, order }` or null, for the "Set up Sakhi for you" card.
  - The card shows at most five steps for her stage, and lists the three still to do.
  - Core steps: log your last period, or your pregnancy dates (10), and phone reminders (Android only; 15, or 55 in pregnancy
    and after a birth).
  - Module steps:

    | Module | Step | Order |
    |---|---|---|
    | contra | your method and its reminder, on a method or avoiding pregnancy; a method after a birth | 20; 35 |
    | screen | check-up dates, 30 to 65 | 25; 58 after a birth |
    | preg | the plan's reminders | 20 |
    | iron | from week 13, or within 180 days of a birth (done also when My medicines has an iron tablet with a reminder) | 30 |
    | access | scheme money in pregnancy and after a birth; "look at free care" otherwise | 40; 60 |
    | asha | her ASHA's number | 50 |
    | meno | the weekly diary in midlife | 20 |

  - The card is gone when all are done or she taps "Hide this" (`state.prompts.setup = 'off'`). It never shows in discreet
    mode, for a girl under 18 or while just reading.
  - `S.setupShows(id)` is true while a step is listed. The check-ups card (screen's `homeTop`) waits while the setup card
    lists `checkups`.
- **`homeMore(api)`** returns HTML for "More for you", a closed `<details>` under the day's tasks. Users: the stories line
  (access), Feel better now (relief) and the flower (joy, without the first-week card, which the setup card replaced). The
  core adds the ask box and the quick questions.
  - `mem.homeMore` keeps it open while she moves around.
  - A tour step inside a closed `<details>` opens it first (`stepEl`).
- **Retired:** the `homeTop` cards of iron, preg and journey (now Today rows), contra's pill card and its `afterHome`, and joy's
  first-week card.

**Home, top to bottom:**
1. the week strip, the hero, urgent cards, the account and baby-born cards, the round buttons and the heads-up;
2. **Today**;
3. a check-up today;
4. the setup card;
5. `homeTop` (screen);
6. Coming up, then up to two stage cards;
7. **More for you**;
8. the Qura card.

**Also on Home:**
- **A check-up today:** her reminders of kind `visit` due today (PMSMA day, an Antara injection, a Copper-T visit, her own). It
  offers the report, which carries her questions. "Not today" hides it until tomorrow (`state.prompts.visit`). Not in
  discreet mode.
- **Coming up, when she has no reminders and no setup card:** one row, "Set a reminder", to the reminders centre.
- **The heads-up**, on Android with phone alerts off, offers "Remind me on this phone".

**Care:**
- **Five groups:** the old `tools` topic is now Get care free (`free`), My plans and reminders (`plans`), My records
  (`records`), Feel better, family and more (`support`) and Just for fun (`fun`). Modules still file tools under
  `section: 'tools'`; `TOOLS_SPLIT` in app.js maps each route to its group, and an unknown one goes to `support`. The
  `services` Learn articles moved to `free`.
- **New core tiles:** the report for the doctor (`report`, in `records`, only with a diary) and Qura's doctor (`ask`, in `free`).
- **"Get care free"** (access, route `access-free`) lists, in this order: Qura's doctor, Free doctor and care, Care near me,
  schemes (with "My claims: n" when she tracks any), Do it online and her ASHA, then the emergency line.
  - It is the first row of Care and the link in Help's doctor card.
  - Opening it sets `mods.access.seenFree`; opening a scheme page sets `seenSchemes`. Both are only dates, for the setup card.
- **For you puts her tools first:**
  - pregnancy: plan, iron, schemes;
  - after a birth: iron, contraception, schemes;
  - on a method: My method, missed pill, reminders (`S.contra.method()`);
  - midlife: check-ups and the diary;
  - periods: What your diary shows, check-ups, reminders.

**Search** (Care and Home's ask box):
- **Tools rank by where a word hits:** the title 3, keywords 2, subtitle or topic 1, doubled at the start of a word, so "plan"
  no longer finds "unplanned" first.
- **`TOOL_SYN`** puts a named tool first: report, doctor, free, plan, reminder, iron, scheme money, near me, ASHA, online,
  ambulance, in English, Hinglish and Hindi. In pregnancy or after a birth, her own schemes page comes first.
- **One row per screen.**
- **Articles keep their plain count**, so their order is unchanged.
- **Typed and stored Hindi are compared in NFC**, so फ़ matches either way.

**Reminders:**
- Me's first list has "My reminders" (`#me-rem-list`, "n on"), next to the phone-reminders row on Android.
- The reminders centre says when phone alerts are off (Android), with "Turn on" (`#tl-alerts`).
- `S.alerts = { can, on }` tells modules whether phone alerts exist and are on.

**Demo items stay in demo builds:**
- `demoBuild()` is true for the web prototype and for APKs whose version has "demo".
- A release APK never shows the prototype settings (five taps on the version do nothing).
- It never shows the Demo section in Me, even with a sample loaded.
- It never opens the sample women: no `#demo` link and no long press.

**What helps (rec 10, opt-in), core only:**
- **Off by default.** Me > Privacy > "Send what helps, once a month" (`state.settings.usage`).
- **Counting.** Only while it is on, the phone counts the days of the month she used each tool in `USAGE_KEYS`:
  - a screen she opens (articles count as `learn`, scheme pages as `access-schemes`, after-birth pages as `post`);
  - a Today tap, a setup tap, a search of three letters or more, and a one-tap period log.
- **What it never counts:** loss, abortion, safety, intimate health and STIs are not on the list.
- **What she can see.** "See what would be sent" shows this month's days and the bucket each would go as.
- **Off deletes.** Turning it off deletes `state.usage` and `state.usagePrev`.
- **Sending.**
  - Last month goes once, 60 to 120 seconds after she opens Sakhi, through `net('POST', 'usage')`.
  - Its allowlist is `month` and `counts`. Each count is a bucket: `1`, `2-5` or `6+`.
  - It goes without the account token (`ANON`).
  - It is never sent for a sample woman. A month older than last month is dropped, never sent.
- **The server** (SERVER_SPEC 5.9) refuses any token, any other field, any tool off the same list (`USAGE_TOOLS`, checked equal
  by the server tests) and any month but last month. It keeps only monthly totals.
- **Not deployed:** the live server doesn't have the route or the migration yet. Until it does, a report gets 404 and is
  dropped.

**Tests:** `node test/value.mjs` (106 checks). It covers:
- the audit's 18 searches for two women;
- Care's order and the five groups;
- Get care free;
- Today: the pill, the iron, the due row, a journey step and her own reminder, discreet mode;
- the visit card and the setup card, on the web and on Android;
- the fold and a tour into it;
- the reminders rows and the heads-up offer;
- Hindi, and a release build;
- what helps: off by default, counting, what is never counted, the preview, off deletes, and the anonymous monthly send
  (on a fake clock).
