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
- **homeLast** hook (Version 39.7): a card for Today's "Sakhi says" that waits behind every other one (after setup and Coming
  up). Each module's homeTop and homeLast card counts as its own entry in "More from Sakhi (n)".
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

## 33. Version 31: her cycle at a glance, with predictions from up to a year (Mohit, 23 Oct: "yes build them as version 31 ... also Fertile window, ovulation day, 'non-fertile day' and 'chances of pregnancy', A one-day countdown, A bare 'Normal' badge. the other tracker is predicting from 8 months history we also need similar calculations")

Feedback said another tracker's cycle views and insights help. Sakhi now has the same kinds of views, with its own maths and
wording. The rule "never predict fertile or safe days" (product vision, 18 Oct) is **overridden by Mohit** for fertile days. As
with the PMOS verdict (section 20), the features are built and gated. **Safe days are still never named.**

**The maths (core, `app.js`; `S.cycle.predict()`, `cycleList()`, `fertWhy()`, `chanceOn()`, `phaseOn()`):**
- **Next period:** a weighted average of her last 12 counted gaps, which is about a year, where the last 3 count double so a
  change shows soon. It stays inside her last 6 gaps' shortest to longest. It needs rangeInfo's window (steady gaps, no hormones,
  pregnancy or year after a birth), as before.
  - The likely window is unchanged: her last 6 gaps' shortest and longest, plus 2 days each side.
  - Her period length is the average of the periods she logged an end for.
- **Fertile days** (estimates for planning a pregnancy):
  - **Ovulation:** 14 days before the predicted start. The NHS says 12 to 16; the Learn library's article cites about 12 on
    average, ranging from 7 to 17.
  - **Fertile window:** the 6 days ending on ovulation (Wilcox 1995, also in the library).
  - **Possible fertile days:** from 21 days before the earliest next start her gaps allow (her shortest gap) to 12 days before
    the latest (her longest). That is, ovulation as early as 16 days before, less 5 days for sperm, through ovulation as late as
    12 days before.
  - **Chance of pregnancy from sex without a method:** high on the 3 days ending on ovulation; medium on the rest of the
    window and the possible days; low otherwise.
  - **"Low" always says "not zero".** No day is called non-fertile or safe. The NHS says there is no safe time of the month,
    and the calendar note says so.
  - **Phase names:** period, before ovulation, fertile window, ovulation day (estimate), after ovulation (luteal phase).
- **When fertile days show** (`fertWhy()` gives the reason when they don't):
  - at least 6 counted gaps, and steady (rangeInfo);
  - age 18 to 44;
  - not pregnant, not in the year after a birth or while breastfeeding, periods not stopped, no hysterectomy;
  - no hormones and no method that stops ovulation or pregnancy (`NO_FERT`: pill, Chhaya, POP, Antara, Copper-T, IUS,
    implant, tubectomy, NSV, LAM). Condoms keep them, because the chance is for sex without a method.
  - **Release builds:** `FERT_RELEASE = false` hides them in a release APK until CDSCO's risk-class decision and the doctors'
    review. The web prototype and "demo" APKs show them.

**What she sees:**
- **Home:**
  - The days until her predicted start as one number ("6 days until your next period"), or "tomorrow", "today" or "any day
    now".
  - The likely range under it ("Likely 24 Oct – 3 Nov · from your last 10 cycles").
  - When fertile days show: today's phase and chance, never in discreet mode.
  - "These dates are estimates from your diary. They are not a way to avoid pregnancy."
- **Calendar:**
  - Predicted period days (from today on), the fertile window and the ovulation day, for this cycle and the next.
  - The legend names each estimate. The note says "There is no safe day: without a method, pregnancy can happen at any time of
    the month". None of this shows in discreet mode.
  - "Likely range, never one day" is now "Likely range".
- **Trends, top to bottom:**
  - **"Your cycle at a glance":**
    - **Cycle length** over the last 6 gaps, with a badge: Regular, Irregular (varies by more than 7 days, or 9 outside ages
      26 to 41, FIGO) or Outside the usual (a gap outside 21 to 35, or 45 in the first years).
    - **Period length**, with a badge: Normal, or Longer than usual for more than 8 days, which brings the checked "see a
      doctor this week" line.
    - Under each badge, the usual range it was judged against. Then the next period, and a link to What your diary shows when
      something is off.
  - The 12 gaps, as before.
  - The new **period-length chart** (a bar per logged period, a line at 8 days).
  - **My cycles:** each cycle as a row of days: period, fertile window and ovulation (estimates), with dates, the period's
    days and the cycle's length or days so far. Cycles left out of the maths are marked, and so are guessed dates. Four rows
    are open; "Show all" opens the rest; a row opens its first day.
  - Then What repeats, What you noted, the report and Your numbers, as before.
- **Days** (a third Diary tab), for every day she noted in the last year, newest first, 20 at a time:
  - where the day sat: "Day 2 of your period" or "Day 24 of your cycle";
  - the estimates around it: fertile window or ovulation in n days, or the chance on that day, and the days to the next
    period;
  - what she noted: period start, end and spotting, pads, pain and clots, symptoms with their colour, and the note.
  - Tapping a day opens it. In discreet mode only the cycle day and what she noted show.
- **Fertile days screen** (trying for a baby):
  - It uses the same engine: the window, the ovulation day, the 3 highest-chance days, the possible days, today's chance, the
    LH strip and "confirm it".
  - When fertile days are hidden it says why; a release APK says they are switched off until approved.

**Lines changed because they promised no fertile days** (all in `docs/wording-review-v28.md` section 8, for the doctor):
- Home's and the calendar's notes;
- Contraception's "safe days" line;
- Trying for a baby's temperature card;
- What your diary shows' fertile line;
- the fertile screen's own notes;
- the last paragraph of the library article "Why no app can name your fertile day".

**Gated:** in prototype-labels mode, the verdict card, the calendar's fertile legend, My cycles' fertile marks, Home's chance
line and the Days note carry "Needs approval before launch".

**Before launch:** CDSCO's risk-class decision (contraceptive apps are Class C), the doctors' review of section 8, and then
`FERT_RELEASE`.

**Tests:**
- `node test/maths.mjs` sections 16 to 18 (15 checks; 81 in all):
  - the feedback diary: next start in 6 days, ovulation, window, possible days, the chance and phase by day, the next cycle,
    and My cycles' own windows;
  - recency weighting;
  - every reason fertile days stay hidden.
- `node test/insights.mjs` (55 checks):
  - Home, the calendar, Trends, Days and the fertile screen;
  - irregular gaps, the pill, a release APK and a 10-day period;
  - discreet mode, Hindi and the library article.

## 34. Version 32: ready for the field test (Mohit, 23 Oct: "go", on `docs/field-test-readiness-2026-10-23.md`)

Mohit asked whether Sakhi was ready to give to 8–10 women around him. The audit found 10 safety and data issues and about 40
smaller ones, and Mohit said "go" to fixing them all with the recommended defaults. Section and item numbers below are the
audit's. Testers get a build without "demo" in its name (`0.32-test`).

**The decisions, as built**
- **Fertile days and the chance of pregnancy (decision 1).**
  - A release or test APK still hides them (`FERT_RELEASE`).
  - Where they do show (demo builds, the web prototype), they show only while she is trying for a baby (`situation.planning`;
    `fertWhy()` gives `'goal'` otherwise). They also need cycles of 21 to 35 days that vary by 7 days or less at any age.
  - The chance shows only as medium or high (`chanceShown()`), never "low", which can read as a safe day.
  - The lines say "from sex today" (Hindi "आज संबंध बनाने पर…").
  - Once the predicted day has passed (`predict().late`), there's no chance for today and no next window (2.3).
  - **Corrected maths (2.1).** The NHS says ovulation comes "around 10 to 16 days before the next period" and sperm survive "up
    to 7 days". Possible fertile days now run from her shortest gap − 23 to her longest − 9, from her last 6 gaps like her
    likely range. Version 31 used 12 to 16 days, 5-day sperm and 12 gaps.
- **Held back in a release or test APK (decision 3).** These are the self-checks and triage tools that label her, judge
  eligibility, or set their own go-to-hospital thresholds (`TRIAGE`):
  - `pattern`, `selfcheck`, `intimate-check`, `cond-labs`, `meno-score`, `midlife`;
  - `pregtest-abortion`, `access-symptoms`, `preg-symptoms`, `pregtools-kicks`, `pregtools-contractions`.
  They leave the tile lists and search. Links to them are removed from screens and sheets (`dropTriageLinks`), and the route
  shows "Not in this version". What your diary shows, the red flags, the pregnancy visits and the after-birth recovery and
  mood checks stay. Demo builds keep everything (`TRIAGE_RELEASE` turns them on).
- **Help (decision 4).** Without `SAKHI_HELP_WA`, the doctor screen puts the free government doctor first. Qura's card adds
  "Qura's doctors are Ayurveda (BAMS) doctors. The first call is free; tests and plans cost money." In What your diary shows,
  findings that say "see a doctor today" point to free care, not to booking a call.
- **The notice (decision 5).** It now says:
  - where the account is kept (a server in Mumbai, Supabase), and until when (until she deletes her account);
  - who sends the code (WhatsApp/Meta, or AuthKey by SMS).
  The Grievance Officer line comes from the build (`SAKHI_GRIEVANCE`, `CFG.grievance`) and is left out until given; it is
  never a placeholder. Notice version `2026-10-23.1`.
- **Inert switches.** "Share with my Qura doctor" and "Send what helps" show only where they work: demo builds, or
  `CFG.share` / `CFG.usage`.

**Safety and her data (section 2)**
- **After a pregnancy ends any other way than a birth** (a loss, or "it's over"), `pregEndedOn` is kept. Home waits for her
  next period: "Sakhi counts your cycle again from your next period", with no cycle day, late card, estimates or alarm
  (`afterLossNow`). The same happens after she stops hormones (`afterHormonesNow`). A start on or after that day ends the
  pause.
- **Days, My cycles and the day sheet** no longer count a pregnancy, the year after a birth or hormone months as one long
  cycle: "not counted: pregnancy", "Cycle count paused".
- **The late card comes at the end of her own likely range** (it waited until day 37). It says "later than your own likely
  dates" when that comes before 35 days, and it carries the pregnancy-test pages' ectopic warning word for word.
- **Cards she answers (chips with `aria-pressed`) are never folded**, and `.pst-form` has `data-nofold`: the after-birth check
  had hidden its warning signs behind "Show more".
- **Care near me** leaves out hospitals with a private sign in their name, and "<100" or "100–500 bedded" hospitals without a
  government sign (`web/tools/care-data.mjs`). That's 242 on the 22 Oct list, including Apollo, Sir Ganga Ram and St.
  Stephen's. The source lists are kept in `web/tools/care-src/` (gitignored) for rebuilding with `--from`.
- **A second copy of the diary.** On Android every save also goes through `SakhiAndroid.saveState(json)` to a private file,
  written at once. At start the newer copy wins (`savedAt`). A copy that can't be read is kept as `qura-saathi-v1-rescue`.
  The WebView writes localStorage up to a minute late.
- **Samples and "start from the welcome screen"** ask first in demo builds.
- **Reminders on a locked phone show nothing** (`VISIBILITY_SECRET`); the details appear once she unlocks. Turning on the
  Notes icon also turns on discreet mode.
- **The day sheet has no speaker** over its next-day arrow (`data-nosay`).
- **Hindi:** "गर्भ में जाँच" is now "गर्भावस्था में मुफ़्त जाँच".

**So the test isn't wasted (section 3)**
- **Signup:**
  - `netErr` carries the HTTP status. A 5xx, `send_failed`, `server_error` or `too_many` offers "Continue for now", with its
    own message: "couldn't send a code", "server isn't answering", or "try again in N min".
  - Five wrong tries say "ask for a new code" and free the button.
  - "New code" after "Send by SMS" stays on SMS.
  - Back and "Send code" again for the same number return to its code screen.
  - The code step is kept for its 10 minutes (`qura-sakhi-signup-v1`: number, challenge, channel; never the code), so an
    Android reload doesn't lose it.
  - The wrong-code message no longer names SMS.
- **Logging:**
  - A second tap within 2.5 seconds is ignored.
  - "Period ended" on the start's own day opens the sheet.
  - On days 11 to 20 of an open period, the + menu keeps "Period ended", and "Period started" asks "A new period?".
  - An end replaces an earlier one of the same period (`dropEnds`; `periodEnd` takes the latest).
  - Turning a start into "Ended" keeps the start.
  - Deleting a start takes its end along, with Undo.
  - Undo restores exactly what was there, including the onboarding guess.
- **Home** re-renders on a new day, when she comes back or every minute on Home or Diary. The heads-up says "Your likely
  days start in N days", so it no longer gives a second "next period".
- **Stage changes:**
  - Tracking, trying or after-40 clears breastfeeding.
  - "Periods stopped" keeps `stoppedOn`, and only bleeding logged after it is flagged.
  - A hormonal method in My method starts and ends the hormones span (`S.cycle.setHormones`).
  - The bleeding checks run while she breastfeeds with her periods back.
- **Trends' period badge** judges the last 6 months only.
- **Reminders:**
  - Setting one while phone reminders are off asks "Turn on phone reminders?", once every 3 days at most (`askNotifyNow`).
  - On Android the Reminders page says they ring as notifications.
  - The battery card adds Autostart for Xiaomi, Vivo, Oppo and Realme.
- **Delete everything** also signs her out on this phone, clears the alarms and deletes the second copy. A forgotten PIN
  offers "Restore from my backup code" first, and a restored backup never brings back a lock PIN (`adoptBackup`).
- **Android:**
  - Back steps through first-run and signup steps (`#ob-back`, `#su-back`), and the app's own ← uses `history.back()`.
  - Dark navigation buttons in the light theme (`res/values-v27`).
  - `VIBRATE`.
  - `build-apk.sh` needs `VERSION_CODE`, refuses one below the last APK built, and stops when the keystore is missing (unless
    `NEW_KEYSTORE=1`).
- **Old WebViews:**
  - A note asks to update Android System WebView if the app never starts.
  - Longhand positions replace CSS `inset`.
  - A `padStart` fallback.
  - The `\p{L}` patterns are built at run time.
- **Words:**
  - The "prototype", "browser" and "draft" lines on the APK are rewritten.
  - The PMMVY helpline is 1515.
  - The library's registration-number placeholder is removed.
  - The after-birth "to be checked before launch" line is gone.
- **Hindi:**
  - Search finds her pregnancy before loss pages (a loss demotes but never drops them) and the fertile tool by its Hindi
    names, and ignores the nukta.
  - Ordinals are rewritten ("हफ़्ता {n} (6 में से)").
  - "पीरियड संभावित समय से {n} दिन देर से है".
  - "पीरियड की संभावित तारीख़ें".
  - Fertile-screen labels; spellings फ़र्टाइल and ओव्यूलेशन.
  - The teen-mother page addresses her as a woman.

**Tests:**
- `node test/fieldtest.mjs` (109 checks): every item above the way a tester meets it.
- `maths.mjs` sections 16 to 18 now use the NHS figures, with 6 new checks (87 in all).
- `insights.mjs` uses a diary of a woman trying for a baby (56 checks).
- `me.mjs` checks the inert switches are hidden in a tester's APK (62 checks).

## 35. Version 33: the pilot build, fertile days for every woman, and "Ask Qura to call me" (Mohit, 23 Oct: "CDSCO approval i discussed with my legal can be skipped for pilot can you remove this restriction and roll out full working version", then "fertile days should show to every women ,and build server side for share with my qura doctor")

**The pilot build**
- A version name with "pilot" (`0.33-pilot`) on Android is a pilot build (`pilotBuild()`). It has every tool a demo build has
  (`fullTools()`): fertile days and the chance of pregnancy, and the 11 `TRIAGE` tools. Like a release build it has no sample
  women, no prototype settings, and none of the inert switches (section 34).
- Mohit's legal advice is that CDSCO approval can wait for the pilot. A release or test build is unchanged: `FERT_RELEASE`
  and `TRIAGE_RELEASE` stay `false` until that question is settled for a public release.
- **Fertile days for every woman.** `fertWhy()` no longer returns `'goal'`: a woman need not be trying for a baby. Every
  other rule stays: steady cycles (6 logged gaps of 21 to 35 days, varying by 7 days or less), not pregnant, not on a method
  that stops ovulation, 18 to 44, not late, never "low chance", hidden in discreet mode. The screen says it is "an
  estimate from dates, not a measurement, and not a way to avoid pregnancy".
- Mohit, 23 Oct: "doctor reviewed and approved" (`docs/wording-review-v28.md`). Wording added after that note, including this
  section's, needs its own review.

**"Ask Qura to call me": the doctor-call hand-off** (server/SERVER_SPEC.md section 10.1; Qura's half:
`docs/qura-handoff-brief-2026-10-23.md`)
- **Where:** a card at the top of Ask ("Talk to a Qura doctor"), leading to `#ask-call`. Booking on WhatsApp or the website
  stays below it as "Or book a time yourself". Without the card, Ask is as it was.
- **When it shows (`callCan()`):** on a real server, only for a signed-in woman who isn't a sample, and only once the server
  says `available` (Qura's endpoint and the shared key are set). With the stand-in server (web prototype, demo builds with no
  `SAKHI_API`) it always shows, and nothing leaves the phone. Never for a girl under 18 or the teen path.
- **What she does:**
  - She writes what she wants to talk about (120 characters) and picks morning, afternoon, evening or any time.
  - She ticks what the doctor may see first, from her report's sections (`reportParts`, each part now has a key `k`). Nothing
    is ticked to start. Notes are their own section.
  - The preview shows exactly the lines that go (`shareSections`, `callShare`), in the language she picks for the doctor.
  - If the body would pass 30 KB, the oldest notes and periods go first, then the last lines of the longest section, and the
    screen says so. What the screen showed (`mem.ac.shown`) is what is sent.
  - The consent line names Qura (Trinaya Wellness LLP), the use and the deletion. One button sends it.
- **The calls (core `net()` only; modules never touch the network):**
  - `POST requests` with `topic`, `best_time`, `lang`, `notice`, `shared`, `shared_data` (`SEND`; the server's `ALLOW` and
    `SHARE_KEYS` match, and its tests check).
  - `GET requests` asks **without her token** when she opens Ask (`net(..., anon)`), so opening Ask tells the server nothing
    about her. Only while one of her requests is still `queued` does the app ask with her token, from Ask or from the
    background sync when she opens Sakhi or comes online. That also makes the server try it again.
  - `net()` no longer sends a body with a GET, and a 401 on a call made without her token never signs her out.
- **After sending:** "Qura has your request" with her `QC-` reference, or "Your request is saved" (Sakhi keeps trying for 24
  hours), or "didn't reach Qura" with the booking link. The phone keeps the reference, the date, her topic, the keys she
  ticked and the status (`state.calls`, last 10). Ask lists them under "Calls you asked for"; discreet mode hides the topic.
- **Errors keep her words:** off on the server (booking link, and the card goes), "try again in N min", "three times today"
  (booking link), offline, server down, refused.
- **The notice** gains one line on what goes to Qura and that the server deletes it. Notice version `2026-10-23.2`.
- **Server:** `POST /v1/requests` and `GET /v1/requests` in `api.js`, the `call_requests` table, `send.handoff`, retries for
  24 hours with no cron, and her topic and shared sections set to null once Qura has them or the request fails. Off until
  `SAKHI_QURA_HANDOFF_URL` (https) and `SAKHI_QURA_KEY` (32+ characters) are set (`server/DEPLOY.md`, section 3).

**Mohit's decisions on Qura's side (23 Oct)** (`docs/qura-sakhi-integration-plan-2026-10-23.md`, section 0):
- A request becomes an ordinary Qura lead (source `sakhi`), and bookings are confirmed on WhatsApp.
- So the app now says "Qura's care team" sees what she ticks, not "the doctor".
- The done screen says a booking is confirmed on WhatsApp.
- Deleting her Sakhi account warns, when she has sent a request (`acc_del_calls`), that it stays with Qura's care team.

**Only what a doctor needs (Mohit, 23 Oct, after the first live request: "only relevant for doctor should push through")**
- What goes is a short summary for the doctor (`doctorLines` in `web/app.js`), not her whole report. The sections and their
  keys are the same, so Qura needed no change.
- **Periods:** the last period, and the days between periods with the average. A third line appears only if any were
  heavy.
- **Symptoms:** her top five, in one line.
- **Check-ins:** each sign once, with in how many of the last months.
- **Questions:** hers and the ones her diary raises. The catch-all "anything to keep an eye on?" stays in her report only.
- **Tools:** only the modules a doctor reads (`DOCTOR_MODS`: medicines, results, pregnancy, iron, after birth,
  contraception, trying, midlife, the cycle pattern, her saved self-checks). Each line goes whole, where one long joined line
  used to be cut at 300 characters, losing data.
- **A module's summary section may carry `doctorLines`:** the subset worth a doctor's time.
  - `periods`: the pattern and the impact, without the count of days or the note.
  - `ttc`: without her checklist progress.
  - `contra`: without the next reminder.
  - `preg`: without "due now", which mixes scheme money with check-ups.
- **Not sent:** "What your diary shows" flags, scheme claims, screening dates, ASHA details, hospital-bag and birth-plan
  progress.
- Her own "Report for my doctor" is unchanged.
- In the five sample diaries, a request with everything ticked went from 8 to 29 lines down to 13 to 25, all of them whole.

**Tests:**
- `node test/handoff.mjs` (61 checks): the card, nothing ticked, the preview, the exact body, statuses, errors, Hindi, a long
  diary, who never sees it, and the notice.
- `server/test/api.test.mjs`: the hand-off sections (refusals, what Qura gets, deletion, rate limits, retries, giving up,
  expiry, claiming), run on both stores; the sender; `SEND`/`ALLOW` and `SHARE_KEYS` matching.
- `server/test/app-e2e.mjs`: the real app asks for a call against the real server code, and Qura gets exactly her screen.
- `fieldtest.mjs` section 19: a pilot build. `maths.mjs`: fertile days for every woman with steady cycles.

## 36. Version 34: phone notifications that work (Mohit, 23 Oct: "can you fix all and get notifications working in perfect state", on `docs/notifications-audit-2026-10-23.md`)

**What the page hands Android** (`buildNotifs` in `web/app.js`):
- **A repeating reminder** (every N days, or on weekdays) carries its rule: `rid`, `rep` (`{ every }` or `{ wd }`, 0 =
  Sunday), `hh`, `mm`, and `until` (epoch ms, 0 = no end).
  - Only its next 8 days go from the page, but always its first ring, even a month away.
  - When one rings, Android books the next itself (`Reminders.chain`), so a daily pill keeps ringing even if she never opens
    Sakhi.
  - After a restart, a missed repeat moves on to its next time (`ReminderMath.firstAfter`).
- **One-off reminders** go up to 400 days ahead (a baby's vaccines run past a year).
- **Channels by kind**, named in her language (`ch`, `chname`, `imp`):
  - `sakhi_meds` "Medicines" (pill, iron, IFA and calcium, medicines) rings as a heads-up;
  - `sakhi_care` "Pregnancy, baby and check-ups";
  - `sakhi_period` "Period";
  - `sakhi_other` "Other reminders".
  In discreet mode **or on a shared phone** (`notifQuiet`), everything uses the neutral `sakhi_reminders` "Reminders"
  channel and says only "Reminder". The lock screen never shows any of it.
- **`go`, the screen a tap opens** (`notifGo`): her method, iron, the pregnancy plan or tablets, after birth, screening, her
  medicines, the check-in, backup, or Home. Android hands it to `window.__sakhiOpen` (letters, digits and dashes only); a
  PIN lock still comes first.
- **The late nudge:** three days after her own likely range ends, at 10 am, "Open Sakhi: your dates need a look." It has no
  health words, and logging her period moves it on.
- **At most 60**, soonest first. Only when some are left out does a last alarm ask her to open Sakhi.

**Asks**
- **Once, on Home, she's asked to turn reminders on** (`askNotifyIntro`): after the first-run tour, once she has a period
  logged. "Not now" is final; the switch stays on Me > Reminders.
- **"Ring on time?"** (`askExactNow`) opens Android's "Alarms and reminders" setting, which is off by default from Android
  14. It's asked right after reminders are turned on (either way), and when she sets a daily reminder, at most once a week.
  Android re-arms the alarms when that permission changes (`BootReceiver`).

**Optional monthly reminders**, off unless she turns them on, at 7 pm:
- the check-in ("Remind me every month" under Save);
- a fresh backup code (on Backup).

**Android:**
- `ReminderMath` holds the repeat maths with no Android code, and `android/test/ReminderMathTest.java` checks it (22
  checks: `npm run test:android`).
- The receiver shows each reminder in its channel, then books the next. Alarms booked by older versions still show.
- Each notification has its own tap target, so the last route no longer wins for all of them.

**Tests:** `node test/notify.mjs` (49 checks); `privacy.mjs` 7 now expects the rule on each reminder, not the "open Sakhi"
alarm. `tours.mjs` section 9 installs the pilot APK's way: Android, the server's answers, reminders not yet allowed. The full
tour runs on her first Home, all 13 steps with nothing popping up in between, and only afterwards does Home ask about
reminders, once (46 checks).

### 36.1 Version 34.1: the tour's gaps (Mohit, 23 Oct: "is there any gap with tour", then "proceed fixing")

- **A stray tap no longer ends the welcome tour.** The dimmed screen ignores taps. "Not now" and the cross still stop it.
  Android Back steps back a step, and only on a first step does it stop the tour.
- **A tour she stopped part-way is offered once more.** At least 10 minutes later, Home shows "Finish the tour? It shows
  where everything is" with "Continue the tour", which picks up at the screen where she stopped (`fullTour.leg`). This runs
  before the reminders question.
- **Shared phone:** the privacy kit's PIN is chosen on her first Home, after sign-up (`prompts.pinDue`), not on top of the
  sign-up screen. The tour starts as soon as the PIN box closes, whether she sets it, cancels or taps outside (`closeSheet`).
- **Her stage:**
  - Women trying for a baby, or in midlife, get Home in two parts in the welcome, the second their own (`fullLegs`). The
    button between the parts says "Next".
  - The trying-for-a-baby Home tour lost a step that pointed at a link Home no longer has; it now points to Care, where her
    tools are.
  - Pregnant women and women after a birth get Diary steps without periods (`td2_pp`, `td3_pp`).
  - A reader who came to learn is told she can start noting whenever she wants (`tw2_pl`).
- **Me** points to Reminders (Android) and "Your data and backup", not "Delete everything".
- **The doctor steps** in Care and Help name the free government doctor as well as a call with a Qura doctor.
- **Not done:** Bengali, Tamil and Telugu still show the tour in English (Marathi shows Hindi), as those languages are only
  partly translated.
- **Tests:** `tours.mjs` sections 9 to 13 (76 checks) install the pilot APK's way: stray taps and Back, resuming, trying,
  pregnant, learner, and a family phone with the PIN set, cancelled or tapped away. `me.mjs` 8 now expects Reminders and
  backup.

## 37. Version 35: the 12-week PMOS plan (Mohit, 23 Oct: "Go ahead with the PMOS plan first", then "can you add GIFs")

Research and design: `docs/lifestyle-plans-research-2026-10-23.md`, sections 3 and 8. The wording for the doctor is in
`docs/wording-review-v28.md`, section 12.

**Where it shows (`PLAN_RELEASE` in `app.js`, `S.planOn()`):** every build. Mohit, 23 Oct: "plan approved build apk" (first
in `0.35-pilot`, versionCode 40). With `PLAN_RELEASE` false, builds other than demo builds would show nothing:
- no tile;
- the route says "not in this version";
- no Today item, setup step or summary.

**`mods/plan.js`** (routes `plan`, `plan-start`, `plan-plate`, `plan-body`, `plan-moves`, `plan-progress`, `plan-r-<routine>`):
- **Start:** her goal (regular periods, energy, skin, a healthier weight, less pain), how active she is now (3 levels), knee
  or back pain, what she eats (veg, eggs, non-veg), and her region.
  - The region comes from her PIN code on the phone (`regionOfPin`: India Post's first digits, Sikkim's 737 is the
    North-east).
  - She can change it, and pick one if she has no PIN code.
  - "A healthier weight" sets her focus to "habits and weight"; every other goal starts as "habits first".
- **Weekly target:**
  - Active minutes build from 50, 75 or 120 to 150 a week, or to 250 with "habits and weight" when her BMI is 23 or more (2023
    PCOS guideline 3.4.3).
  - Two strength days, not one after the other.
  - Today's suggestion is a fifth of the week's minutes, at least 10.
  - One food habit is added every two weeks (six in all).
- **Hub:** the 12-week dots, a ring of minutes against the target, the week's days, today's walk with +10/+15/+20/+30, today's
  routine, today's food habits as ticks, four picture tiles, the daily reminder (her time; until the 12 weeks end), and "Stop my
  plan" (asks first).
- **Weekly look-back:** on the first day of a new week, her energy (low, okay, good) and what got in the way. That brings one
  tip and next week's target. "Got it" puts it away.
- **My plate:**
  - The plate picture (half sabzi, a quarter grains, a quarter dal or protein, curd on the side).
  - Her food habits.
  - "More often": her region's foods first, then everywhere in India, folded. Then "less often", then "avoid" (trans fats,
    crash diets, weight-loss pills or powders without a doctor).
  - Filtered by what she eats. ICMR-NIN 2024. No folk bans and no Ayurvedic food rules.
- **My body (optional):**
  - Height in feet and inches or centimetres, weight and waist; one entry a day, at most 60 kept.
  - BMI and waist bars with the cut-offs for Indian women (2009 consensus: 18.5, 23, 25; waist 80 cm).
  - A plain sentence for her band; no "obese" or "overweight".
  - Her focus: habits first, or habits and weight. With a BMI under 23 the target stays at 150.
  - Discreet mode hides the numbers until she taps Show, and they hide again when she leaves.
  - "Delete my body notes" (asks first). Not in pregnancy: "your doctor watches your weight".
- **Yoga and moves:**
  - Five routines (gentle start, cycle care, sun salutation, strength at home, calm breath), plus walking with the talk test
    and "stop and rest if".
  - Knee pain swaps kneeling moves (child pose for a chair forward bend, half camel for tadasana, step-ups for marching).
  - Back pain skips the half locust and the sun salutation.
- **The player:**
  - Each move has a moving drawing that loops like a GIF: one figure whose joints move between two positions (`P`, `ANIM`).
  - The sun salutation flows from pose to pose and holds. One-sided moves are done right then left, mirrored.
  - There's a timer (or a breathing circle), and the steps are read aloud (off on a shared phone unless she turns it on).
  - With "reduce motion" the drawings stay still.
  - Finishing logs the minutes she actually spent, and the strength day. "How did it feel?" ("Hard" suggests Gentle start).
  - Timers and drawings stop when she leaves.
- **My progress:**
  - Minutes for each of the 12 weeks against the target, strength days, and food habits in the last 7 days.
  - From her diary, before and since she started: the days between periods, periods that needed a painkiller, and the PMOS
    signs in her check-in.
  - Her energy from the look-backs; weight and waist first and latest, only as she noted them (not in discreet mode).
  - "What to expect" as a timeline (weeks 1 to 4, 4 to 12, 3 to 6 months), never a predicted number.
  - One Qura button: "Ask a Qura doctor about supplements or medicines".
- **Paused:** in pregnancy (the tile is hidden, so the pregnancy food guide stays first in search) and for the first 42 days
  after a birth.
- **Elsewhere:**
  - Home's Today (move N minutes today, the newest food habit; one tap each; "Your plan for today" in discreet mode).
  - The setup card for a woman with PMOS ("Start your PMOS plan").
  - "For you" for PMOS (first).
  - Search: food, yoga, exercise and BMI words, in `TOOL_SYN`.
  - The doctor summary (`DOCTOR_MODS` + `plan`): her week, average minutes and strength over the last weeks, food habits, and
    her weight, waist and BMI. It travels in the existing "tools" section of "Ask Qura to call me", so the server needs no
    change.
  - Priya's sample is three and a half weeks in.
- **Rules kept:**
  - No calorie counting, weight target, supplements, herbs or doses.
  - Nothing leaves the phone except the summary she ticks.
  - The module never touches the network.
- **Tests:** `node test/pmosplan.mjs` (129 checks):
  - the plan is on in pilot, test, demo and web builds;
  - the rules: PIN codes, targets, knee and back pain, sets and sides, every animation's drawings;
  - starting, minutes, habits, Today, discreet mode, the routines and their drawings, "reduce motion", the look-back;
  - the plate, body, progress, pausing, the reminder, For you, setup and search;
  - the doctor summary and the call form; Hindi; no network.

## 38. Version 36: the Plans tab, plans suggested from her diary, and Govt. services (Mohit, 23 Oct: "Audit this it has bugs and also plan should be handy not deep hidden all other information which is information only about government services should be compacted in Govt. services ...")

Audit and design: `docs/plans-audit-2026-10-23.md`. The wording for the doctor is in `docs/wording-review-v28.md`, section 13.

**Routes (`mods/plan.js`):**
- `plan` is now the Plans page (`renderPlans`); the PMOS plan's home moved to `plan-pmos` (`renderHub`).
- Every link moved with it: the tile, For you, `TOOL_SYN`, Today, setup, the player's "Back to my plan" and progress.
- Sub-pages go back to the page she came from (`S.mem.planFrom`: `plan` or `plan-pmos`).
- `open` adds `plan-pmos`, so both pages work in browse mode.

**The Plans tab (core):**
- `planTab()` puts a fifth tab, Plans (`I.target`), between Diary and Care when the stage is `app`, the `plan` route exists and
  `S.planOn()`.
- `tabOf` lights it for `plan` and every `plan-*` route.

**The Plans page:** "Your plans now" (a started PMOS plan with its ring, week and minutes; an active 21-day journey), "Suggested
for you" (the top 4, each with its reason and duration), "What you want help with" (her answers, with Change), "More plans" (the
rest of the catalogue that fits her stage), and the footnote "not a diagnosis".

**Suggestions:**
- `signals()` reads her diary on the phone:
  - the last 6 usable gaps and how many were over 35 days;
  - flow and pain in her last 3 periods (each start and its details in the first week);
  - PMOS signs, heavy flow, low mood and hot flushes (moderate or night-waking) in her last 3 check-ins;
  - her PMOS self-check (`mods.selfcheck.pmos.v`);
  - days logged with cramps or acne (60 days), tired, low/anxious/irritable, poor sleep or hot flushes (30 days), and nausea
    (14 days);
  - her stage, the days since a birth, breastfeeding, PMOS (`situation.pcos` or the goal `pmos`) and her goals.
- `catalogue()` lists 23 plans, each `{ id, go, t, s, dur, icon, hue, active, paused, score, why }`. A plan's points come from
  `[n, why]` pairs; the biggest pair gives its reason. Paused and active plans score 0.
  - A plan is left out when it doesn't fit her stage, its route is missing, or the build holds it back (`S.toolShown`).
  - Tile-backed plans (iron, PMS, menopause, after-birth, pregnancy and trying tools) take their own title and sub from the
    tile, and are left out if the tile is hidden.
  - The table is in the audit doc, section 3.
- `recsOf()`: 2 points or more, best first, ties in catalogue order, at most 4.
- Exposed for tests and core: `S.plan.catalogue()`, `S.plan.recs()` (Care's Plans row count) and `S.plan.signals()`.
- **Never a diagnosis:** long gaps without PMOS suggest the self-check first. "You told Sakhi you have PMOS" needs her own
  answer.

**"What you want help with":**
- The same choices as joining, for her stage now (`S.helpKeys(stage)`), without "Just keeping track".
- Saving replaces the help goals of her current stage in `state.goals` and keeps the others (the stage goal from joining,
  answers from another stage).
- "I have PMOS (PCOS)" sets `situation.pcos` either way, as Me > My situation does. Not in pregnancy.

**Home (`home` and `afterHome` hooks):**
- "A plan for you" is the top suggestion, with its reason and duration. `moduleCards` now asks `explain`, then `plan`, then
  the stage's modules.
- It shows only when:
  - the top suggestion has 3 points or more;
  - no plan or journey is going;
  - discreet mode is off;
  - she hasn't tapped "Not now" in the last 14 days (`prompts.planRec`, an ISO date);
  - the setup card isn't offering the PMOS plan (`S.setupShows('plan')`).

**Care (core `renderCare`):**
1. a "Plans for you" row (`.care-plans`, "{n} suggested from your diary");
2. For you, without `access-*` or `asha`;
3. one "Govt. services" row (`.care-free`, to `access-free`);
4. the topic grid, without the free-care card.

Other Care changes:
- `sec_free` and `access_free` are "Govt. services" (सरकारी सेवाएँ).
- The Qura "ask" row left `access-free`: `TOOLS_SPLIT.ask` is `support`.
- `TOOL_SYN`: food, yoga and BMI words go to `plan-pmos`; "govt", "government", "sarkar", "सरकार" and "सरकारी सेवा" go to
  `access-free`, `access-doctor` and `access-schemes`.

**Joining (core `renderOnboard`):**
- New step 4, "What would you like help with?" (`OB_HELP[stage]`, chips `data-ob-help`, `#ob-help-next`). The shared-phone
  question is now step 5 (the `learn` stage skips step 3, so it has 4 steps).
- "Just keeping track" clears the others.
- `finishOnboard` stores `state.goals = [stage goal].concat(help)` (no `track`). `pmos` also sets `situation.pcos`, except in
  pregnancy.

**The plan's audit fixes:**
- Wording: "Strength days: {a} of {t}", "You moved {a} minutes. Your target was {t}.", "Routine done. Every move counts.", and
  "Keeping it going" on Today after week 12.
- Today's routine shows "✓ Done today" (`log.r`). Its row names the routine, then "Today's yoga · About N min".
- +minutes has Undo (`S.toastAct`). The weekly look-back sits under Today.
- Reminders:
  - With the daily reminder on and phone notifications off (`S.alerts.can() && !S.alerts.on()`), a warning card offers "Turn
    them on" (`S.alerts.ask`, new in core).
  - Switching the reminder on doesn't ask again: core's own sheet already asks once (`reminders.upsert`).
  - A tap on the reminder opens the PMOS plan (`NOTIF_GO.plan`; it opened the reminders list).
  - While the plan is paused, its reminder is removed (`pauseSync`).
- The screen stays on during a routine. `awake()` calls the Android bridge `keepAwake(boolean)` (`FLAG_KEEP_SCREEN_ON`, new
  in `MainActivity`), or `navigator.wakeLock` on the web. It is released when she pauses, finishes or leaves.
- Dark mode chart bars, bigger move pictures, and sized arrows on the plan's action rows.

**Core API added:**
- `S.helpKeys(stage)`;
- `S.toolShown(route)`: the route exists and isn't a held-back triage tool, by exact route or by its first part;
- `S.alerts.ask(then)`.

**Tests:**
- `node test/pmosplan.mjs` (189 checks; sections 1 to 13 updated for `plan-pmos`). New sections:
  - 14: the Plans page and tab, and what each diary suggests. Cases: PMOS; long gaps without a diagnosis; a tester build;
    heavy periods; pregnancy; 3 weeks after a birth; 40+ with hot flushes. Also "What you want help with", Home's card and
    "Not now", and Care's Plans count.
  - 15: the audit fixes.
- `signup.mjs`, `tours.mjs` and `server/test/app-e2e.mjs` tap `#ob-help-next` when joining. `value.mjs` follows Care's new
  order.

## 39. Version 37: the companion core (Mohit, 23 Oct: "Build", on `docs/companion-journey-2026-10-23.md`)

Research, design and the 12 acceptance criteria: `docs/companion-journey-2026-10-23.md`, sections 7 to 12. The new health
wording for the doctor is in `docs/wording-review-v28.md`, section 14.

**Joining (core `renderOnboard`, `finishOnboard`):**
- Step 4 is now the plan module's intake, `S.plan.intake.render(v, a, ctx)` with `ctx = { head, chip, back, done, prev,
  redraw }`. It replaces V36's "What would you like help with?" (`OB_HELP`, `#ob-help-next` are gone).
  - First, "What do you want to work on?" (`data-pl-goal`): her stage's goals (`S.plan.intake.goals(stage)`), with "Just
    keeping track" last. That choice ends the intake and starts no plan.
  - Then only the screens her goal needs (`SCREENS` in `mods/plan.js`): her periods (gap, skipped months, a PMOS diagnosis,
    signs) for a cycle goal; pain, heavy bleeding or mood before periods for those goals; her day (how active, food,
    bedtime, work, the reminder time); when she can move for 10 minutes; her height and weight, which she can skip.
  - Chips are `data-pl-q="key:value"` (one) and `data-pl-m` (several); values are split at the first colon only, so a time
    such as `remind:20:00` survives.
  - A warning shows under an answer that needs a doctor (`warnOf`): pain that stops her day; a pad an hour or less, or clots.
  - The step count grows with her answers (`S.plan.intake.count(a)`).
- Joining is kept on the phone as she goes (`localStorage` key `qura-sakhi-ob-v1`), so a call or a trip to WhatsApp for the
  code loses nothing. It is cleared when she finishes.
- `finishOnboard`:
  - `state.goals` is her stage goal plus her plan goal (never `track`);
  - `pmos`, or a PMOS diagnosis, sets `situation.pcos` (not in pregnancy);
  - `state.fullTour = { st: 'reveal' }`, so the full tour doesn't start on its own;
  - `S.plan.startFromIntake(a)`, then the reveal (`plan-reveal`) if a plan started, else Today.

**The plan engine (`mods/plan.js`):**
- One plan at a time in `state.mods.plan`. `pack` is `cycle` (the V35 plan, for irregular periods, PMOS, skin, weight and
  trying) or a light plan: `pain`, `heavy`, `pms`, `preg`, `post` or `meno` (`packFor(goal, stage)`). A V35 plan with no
  `pack` is a cycle plan.
- `state.intake` keeps her answers, dated, for the reveal, the doctor check and results.
- Light plans are built from Sakhi's own reviewed routines and tools: the relief routines, the iron journey's step, the kick
  counter from week 28, the pelvic floor routine and the menopause diary.
- The cycle and light plans pause in pregnancy and for 6 weeks after a birth. The pregnancy plan ends with the pregnancy; the
  after-birth plan a year after the birth.
- `actionsFor(d)` gives today's 2 or 3 actions, `{ id, icon, hue, kind, title, sub, go, state, why }`:
  - cycle: the walk (one tap; on strength days its row opens the strength routine), the newest food habit, and sleep (her
    bedtime target, or a line for night shifts);
  - pain: the cramps routine on period days, a walk, sleep. Heavy: today's iron step, a walk. PMS: calm breathing, a walk,
    sleep;
  - pregnancy: one routine for her goal, plus kicks from week 28. After a birth: a tool for her goal and the pelvic floor.
    40+: a routine for her goal, a walk or strength (for bones on days 1 and 4), the weekly diary on day 7.
- The day's log: `log[date].ck = { actionId: 'd' | 'p' | 'n' }` (`markAction`), `ci` (checked in) and `bar` (what got in
  the way).

**Routes (`mods/plan.js`):**
- `plan`: My plan (`renderMyPlan`). The cycle plan's page (`journeyCycle`), a light plan's page (`renderLight`), the PMOS
  hub while a plan is paused, or, with no plan, "What do you want to work on?" (`data-pl-pick`).
- `plan-reveal`: her name, her goal as the change she wants, where she is now, her 12 weeks (`pillars`), what to expect (never
  a percentage), a doctor card when her answers need one (`docCase`), and today's steps.
  - Start (`#pl-rv-go`) turns on the daily reminder at her time and opens Today.
  - "Change my answers" (`#pl-rv-edit`) reopens the intake.
- `plan-checkin`: the evening check-in.
  - Each action is done, partly or not today (`data-ci="id:d|p|n"`), and she can say what got in the way (`data-ci-b`).
  - The feedback (`#pl-ci-fb`) says what each habit does for her, counts the week, gives a tip and adds a petal. No streaks.
- `plan-goal`: the intake again, from My plan (`S.mem.planIntake`): for a woman who joined before Version 37, or who changes
  her goal.
- `plan-pmos` is still the V35 hub. V36's Plans page lives on in My plan, as the no-plan screen and "Other plans".
- A plan screen with nothing to show (no plan, or paused) draws My plan in place rather than redirect.

**My plan:**
- The 12-week path (`pathHtml`: a dot a week, last week, this week, next week and the next month's review).
- The look-back, results (`plan-progress` for the cycle plan; before-and-since cards for light plans).
- "Your care team" (`careTeam`): a free government doctor, her ASHA, a Qura doctor and the report for the doctor.
- Settings (`settingsHtml`): the daily reminder and its time (`data-pl-at`), phone notifications (`#pl-notif`), change goal
  (`#pl-chg`) and stop (`#pl-stop`, `#pl-stop-yes`).
- Other plans (`otherPlans`).

**Today (core `renderHome`):**
- The page and its tab are "Today" (`t('home')`; Hindi आज).
- The Today card opens with a greeting (the time of day and her first name; "Today" in discreet mode), then the new
  `todayHead` hook. The plan's hook gives its name, its week, "{a} of {n} done today", and the check-in button: primary from
  6 pm or her reminder time; "Checked in today" once done.
- The plan's actions are Today rows (the `today` hook).
- One "Sakhi says" slot (`section.slot`). The first card shows; the rest fold under "More from Sakhi (n)"
  (`details.slot-more`; `mem.slotMore` keeps it open). The order:
  1. a check-up today;
  2. module cards (`explain`, then the plan's card, then her stage's modules);
  3. the period heads-up;
  4. `homeTop` (free check-ups);
  5. the next setup step (one step at a time now, not the whole list);
  6. Coming up.
- The plan's slot card (`planCard`) is one of:
  - Start, if she left the reveal;
  - the doctor check, on days 2 to 21 when her periods skip (`#pl-doc-yes`; `#pl-doc-later` waits 3 days);
  - a fresh start after 3 quiet days, said so on a Monday (`#pl-lapse-not`);
  - a month done (`#pl-m-go`).
- Gone from Today:
  - the "More for you" fold, with the ask box, the stories line, Feel better now and the flower;
  - the setup card's list;
  - V36's "A plan for you" while a plan is going.
- Core no longer draws `homeMore`. `access`, `relief` and `joy` still register it.

**Tabs and Help (core):**
- The tabs are Today, My plan (`planTab()`), Diary and Explore (`I.search`).
- Help is a header button (`#help-btn`) on every screen. It opens a sheet:
  - Emergency: call 112 (`#hs-sos`);
  - See a doctor (`#hs-doc`);
  - When to see a doctor: the safety guide (`#hs-guide`);
  - My ASHA (`#hs-asha`);
  - Tell a person (`#hs-tell`, with `SAKHI_HELP_WA`).
- The safety guide (`help`) has a back row. Its tour menu moved to Me > How to use Sakhi.
- The language button sits in the header only before joining; after that it is in Me.

**Explore (core `renderCare`):**
- The order: the heading "Explore", search, For you, Govt. services, "Your questions", the topics, Help and safety, and All
  articles. There is no Plans row.
- Search has Speak on Android (`#care-q-mic`, `SakhiAndroid.listen`).
- "Your questions" (`qaHtml`) are her stage's quick answers, Danger signs first in pregnancy. They are not shown in discreet
  mode. They moved here from Today's ask box.
- A search with no match offers "Ask a Qura doctor about this" (`data-ask`).

**Tours:**
- The full tour no longer starts on its own for a new woman. Each screen keeps its own first-visit tip, and Me > How to use
  Sakhi replays the full tour. A diary that never had the full tour still gets it once.
- Home's tour ends on "Your plan for today" (`.today-card`, `tw4_*`). So do the pregnancy and after-birth Home tours, whose
  quick-answer step went with the ask box. Explore's last step points at the Help button.
- When a sheet held Home's first tip back (her PIN, the reminders question), the tip starts as the sheet closes
  (`homeTipDue`).

**Words:**
- "Home" is "Today" and "Care" is "Explore", in the tab names and in every line that names them: English, Hindi, Marathi,
  Bengali, Tamil and Telugu.
- The "My plan" tab name is added for Marathi, Bengali, Tamil and Telugu.

**Core API added:**
- `S.plan.intake` (`render`, `count`, `goals`), `S.plan.startFromIntake`, `S.plan.packFor`, `S.plan.packOf`;
- `S.plan.dayDone(iso)`, which drives the diary calendar's plan mark (`KINDS.plan`), and `S.plan.actions()`;
- the `todayHead` hook.

**Tests:**
- `node test/companion.mjs` (123 checks):
  - the 12 acceptance criteria, every goal and stage, and a woman who joined before Version 37;
  - "Just keeping track" and "Just learning";
  - Explore's quick answers and voice search;
  - Hindi.
- `tours.mjs` (88): Today's own tip for a new woman, one tip a screen, the full tour for an old diary and from How to use
  Sakhi. The try-it step is now Diary's "Add for today".
- `value.mjs` (108): no ask box on Today, Explore's order, one setup step at a time, and the slot.
- `pmosplan.mjs`, `plans.mjs`, `signup.mjs` and `server/test/app-e2e.mjs` follow the new joining and Today.

## 40. Version 37.1: her first day (Mohit, 24 Oct: "Plan to do all three properly", on `docs/first-days-audit-2026-10-24.md`)

Why: Mohit joined 0.37-pilot on his phone and wrote "i just entered details while onboarding and i am straight on to
program, i felt i am not sure whats happening my expectations were not set". The design and its acceptance criteria are in
`docs/first-days-audit-2026-10-24.md`, sections 5 to 8. Mohit's four decisions (24 Oct):
- sign-up stays before the plan;
- all three steps from day 1;
- Dr. Megha's welcome: the player now, her recording later;
- on day 3, one "Questions about your plan?" card.

The new wording for the doctor is in `docs/wording-review-v28.md`, section 15.

**The plan waits until she starts it (`mods/plan.js`):**
- `startFromIntake(a)` no longer starts a plan. It writes the plan she would get to `d.next` (`pack`, `goalKey`, `goal`,
  `focus`, `level`, `limits`, `food`, `region`, `remAt`, `when`, `bed`, `work`, `body`, `intake`, `at`) and sets
  `prompts.reveal`. "Just keeping track" saves `state.intake` and makes no plan, as before.
- A plan she is on keeps running, with its own answers (`d.intake`, and `state.intake`), until she starts the new one.
  `docCase` and `nowLine` read `d.intake` first.
- `viewOf(d)` is the waiting plan as a plan starting today, to draw its cards.
- `commitStart(when, at)` is "Start my plan":
  - it copies `d.next` in;
  - `d.start` is today, tomorrow or next Monday (`startDay`), and `started` is the day she tapped;
  - it sets `go` and `remAt`, resets `weeks`, `doc`, `lapse` and `keep`, and keeps `log`;
  - `state.intake` becomes `next.intake`, and `d.next` and `prompts.reveal` go;
  - the daily reminder starts on `d.start`, so "Tomorrow" doesn't ring tonight. It goes in quietly (the Start screen asked).
- A plan whose start is still to come (`upcoming`) isn't on yet: `packOf` needs `d.start <= today`.
  - Today's line says "Your plan starts tomorrow · Your first step: …".
  - My plan says when, with "Start today instead" (`#pl-soon-now`).
- There is one way in. Joining, "Change what I work on", "Start again" after 12 weeks (now the questions, `#pl-again`) and
  the V35 form (`plan-start`, `#pl-go`) all make a waiting plan and open its cards.
- The migration runs the first time each saved plan is read (`mig`, in `raw()` and `D()`), because saved data loads after
  the modules register:
  - a Version 37 plan with `go: false` and nothing done since its start waits to be started (Mohit's phone). Its stray plan
    reminder goes, and a morning check-in time becomes 8 pm;
  - one she followed, and a V35 plan (no `go`), keep running.
- `pauseSync` uses `pausedFor`, so a pregnancy or after-birth plan keeps its reminder.
- The doctor summary (`summary`) is titled by her plan. Minutes, strength and food are for the cycle plan only, and a plan
  that isn't on yet has no summary.

**Her plan's cards (`plan-reveal`, `renderReveal`):** one idea each, with Next and Back (`#pl-rv-next`, `#pl-rv-back`). The
card she is on stays (`S.mem.rvCard`), so a doctor page opened from one comes back to it.
1. "Your plan is ready, {name}": her goal, "Made from what you told Sakhi: …", and "12 weeks · from about {n} minutes a day"
   (`dayMins`). When another plan runs, a line says the new one replaces it when she starts it. "Change my answers"
   (`#pl-rv-edit`).
2. "Your {n} steps" (`stepsList`, which replaces `pillars`): each step with what it does for her (the reviewed `plan_fb_*`
   lines). For the cycle plan, this week's minutes and "In My plan too: yoga, your plate and your progress".
3. "How each day works": Today and Done, the check-in at her time, what each step does, and "Missed a day? Nothing to catch
   up." Dr. Megha's welcome (`#pl-rv-aud`) shows when the build lists `megha-welcome-<lang>` in `SAKHI_CONFIG.audio`
   (`android/build-apk.sh` bundles `web/audio/megha-welcome-*.mp3`).
4. "What happens when": every week, week 4 and week 12. Period plans add that periods often take 3 to 6 months to change.
5. Only when her answers need it (`docCase`), and not in discreet mode: "Alongside your plan: one doctor check".
6. The Start screen:
   - Today, Tomorrow or Monday (`data-rv-when`). After 9 pm, tomorrow is picked;
   - the check-in time, evening only (`data-rv-at`: 6, 7, 8 or 9 pm). My plan's time chips are evening only too;
   - on Android with reminders off, "Allow reminders" (`#pl-st-allow`, `S.alerts.ask`). With reminders on but alarms that may
     ring late, "Allow" (`#pl-st-exact`, `S.alerts.askExact`);
   - "Start my plan" (`#pl-rv-go`). When reminders were offered here, it sets `prompts.notifyAsk` and `notifyIntro`, so
     Today doesn't ask again.
- Discreet mode: no health words. The goal says "My plan", the reasons go, private steps say "Your plan for today", and there
  is no doctor card.
- A waiting plan is her plan: the My plan tab and `plan-pmos` draw its cards.

**Joining (core):**
- The welcome: "Your period diary, and a plan made for you", three lines (`ob_v1` to `ob_v3`) and "Start · about 3
  minutes" (`ob_start`).
- The progress bar is named in three parts (`.ob-parts`): About you, What you want, Your plan. `S.plan.intake.part(a)` puts
  the summary in part 3.
- "More than a month ago" asks "About how long ago?" (`data-ob-lpm`: 38, 60 or 90 days), saved as a guess.
- The plan's questions:
  - one "why we ask" line on her periods, her day and her walk time;
  - the check-in time left "Your day" for the Start screen;
  - a last screen, "Here's what you told Sakhi" (`sum`, `sumRows`). `data-pl-edit` reopens a question and `#pl-in-make`
    makes the plan.
- When a plan waits, sign-up says "Your plan is ready. Sign up, and Sakhi shows it next." (`su_plan_wait`). The tabs hide
  while sign-up shows.
- Joining (and "Just read") sets `state.whatsNew`, so a new woman never sees "What's new".

**Today (core `renderHome`, `moduleCards`):**
- Urgent cards (`data-xp-urgent`) are taken from every module first, then two others. While her plan waits or runs
  (`S.plan.leads()`), it comes first.
- Her plan's first 3 days (`S.plan.early()`; also while a new plan waits, for 3 days, and before a later start):
  - these wait: "keep an eye on it" cards (`data-xp-lv="watch"`), the heads-up, `homeTop`, the setup step and Coming up;
  - month-level and urgent cards don't.
- `todayHead` is called in discreet mode too, and the plan writes it in plain words. Module cards marked `data-disc-ok` show
  in discreet mode.
- The plan's line:
  - "Day {n}" for the first week, then "Week {n} of 12";
  - the check-in button from 5 pm, at her time, or after her first Done; before that, "Check-in at {t}";
  - from day 2, "Yesterday: …"; on day 3, "3 days in: small steps add up.";
  - no "All done for today" under it.
- The plan's cards (`planCard`), first that applies:
  1. "Your plan is ready" (`data-disc-ok`). When another plan runs: "Your new plan is ready", with "Keep my plan"
     (`#pl-next-drop`);
  2. "Day 1 of your plan" (`data-disc-ok`), until her first check-in;
  3. the doctor check (days 2 to 21);
  4. "Questions about your plan?" once, from day 3 (`prompts.planCall`; `#pl-call-go` opens `ask`, `#pl-call-not`), never
     in discreet mode;
  5. the fresh start, then a month done.
- "Hello" before 5 am.
- Tours: a new tip, `home-plan` (one step on `.today-card`), runs on its own only on her plan's first days. Home's own tips,
  the stage tips, the ring, the stage tip and explain's `xp-home` wait then (`auto`).
- "What's new in Sakhi" (`openWhatsNew`) shows once, for a diary from before Version 37 (`state.whatsNew` unset): the plan,
  Today and Explore, Help, and "Your plan carries on." when one runs. "See my plan" or "Not now".

**Petals (`mods/joy.js`):** from "Start my plan" to her first check-in, at most to day 3 (`S.plan.holdJoy()`), petals and
badges are counted but not shown. The check-in calls `S.joy.release()`, which shows one celebration (no second petal if the
check-in just showed one).

**The check-in:** the first time, "This takes a minute. Your answers stay on this phone." After saving, "Tomorrow: the same
steps. See you at {t}." (later, "See you tomorrow at {t}."). In discreet mode its reason line is "Every small step counts."

**Core API added:**
- `S.plan.pending()`, `running()`, `leads()`, `early()`, `holdJoy()`, `start(when, at)` and `intake.part(a)`;
- `S.joy.release()`;
- `S.reminders.upsert(r, { quiet: true })`, which skips the reminders question (the screen asked);
- `S.alerts.exact()` and `S.alerts.askExact()`.

**Tests:**
- `node test/firstday.mjs` (111 checks): the 16 criteria of the plan, discreet mode, Hindi, 360 px and the doctor summary.
- `companion.mjs` (127) and `pmosplan.mjs` (192) walk the cards to Start. `notify.mjs` marks its diaries as current
  (`whatsNew`).
- The walks (`firstday-walk.mjs`, `weeks-walk.mjs`, `stages-walk.mjs`) follow the cards. `weeks-walk` follows the plan
  alarm's own `go`.

## 41. Version 37.2: a companion that notices (Mohit, 24 Oct: "Plan to do all three properly", on `docs/ux-gaps-2026-10-24.md`)

Why: the 12-week fast-forward (`web/test/weeks-walk.mjs`) showed:
- Sakhi didn't notice what she did: no word about yesterday, a period or week 12;
- her plan was hidden behind "no period yet";
- two counts disagreed;
- the 8 pm reminder opened the wrong page;
- discreet mode leaked health words.

The design and its 8 acceptance criteria are in `docs/ux-gaps-2026-10-24.md`, sections 1 and 3. The new wording for the
doctor is in `docs/wording-review-v28.md`, sections 15.4 and 15.5.

**The evening reminder (core `NOTIF_GO`, `notifCh`; `mods/plan.js` `remOnNow`):**
- It opens the check-in (`plan-checkin`), and says "How did today go? 1 minute".
- It has its own channel, `sakhi_plan` ("Your plan", `ch_plan`). Android already accepts `sakhi_[a-z]+` and the route.
  Discreet or shared mode keeps the neutral channel and words.
- The migration (`mig`) updates a saved "Your plan for today" title and moves a check-in time before 5 pm (Version 37
  offered 8 am and 1 pm) to 8 pm. My plan's times are 6 to 9 pm.

**One count (`countLine`):**
- Today's line and the check-in both say "2 of 3 done today", or "1 done, 2 partly today". The check-in adds "· {w} of 7
  days this week".
- Once she has checked in, the plan's Today rows go (the `today` hook returns nothing), and the plan's line keeps the day's
  count.
- Core shows no "All done for today" under a `todayHead` line.

**Her period (`event` hook, `onLog`):** a period start logged during the plan stores
`d.per = { at, d, days, guess }`, from the gap that just ended. For 2 days:
- Today's line and My plan (`perBanner`) say "Your period came after {n} days. Sakhi noted it for your results." ("about"
  when a date was a guess);
- the pain plan adds the cramps line;
- discreet mode doesn't show it.

**Today's cards (`planCard`, `cardKind`)**, first that applies:
1. her weeks done (`end`, until she opens My plan: `d.endSeen`);
2. day 1;
3. a month done (weeks 5 and 9). After 3 quiet days its words carry the restart ("You started on {d}. Start again small
   today: …");
4. the week's look-back, on the first 3 days of a new week (`rev`);
5. the doctor check;
6. "Questions about your plan?";
7. the fresh start.

In discreet mode only the end, day 1 and the look-back, which carry `data-disc-ok`.
- `S.plan.docShowing()` is true while the doctor check is the card shown. explain's Home card then skips a `watch`-level
  `late_now` ("no period yet" before 90 days). At 90 days, as a `month` card, it always shows.
- A finished plan still leads Today (`leads`).

**The look-back (`reviewCard`):**
- It leads with what she did ("You followed your plan on {n} of 7 days."; the cycle plan adds the minutes, never the target).
- It names the week's most common check-in barrier ("No time on 3 days.", `weekBars`).
- It asks only her energy (`data-pl-e`; the barrier chips `data-pl-b` are gone) and stores `weeks[k] = { e, b }`. Then a tip
  for that barrier, and "Got it".

**The end (`planWeeks`, `finished`, `remEnd`, `renderFinished`):**
- Every plan runs 12 weeks, except a pregnancy plan, which runs until the birth (`planWeeks` 0: no end, no `until` on its
  reminder).
- Today's line says "Your 12 weeks are done · See your results".
- My plan shows:
  - "You followed your plan on {n} of 84 days" (`followedDays`), and "Want to try again, smaller?" under 12 days;
  - her results (`progressCore`, or `lightResults` for a light plan);
  - when her answers needed a doctor or nothing changed (`noChange`: no period, or every gap still over 35 days; every
    period still painful or still heavy), "If nothing has changed, see a doctor";
  - What next: "Keep going" (`#pl-keep`: `keep`, and the reminder carries on with no end) or "Start a new 12 weeks"
    (`#pl-again`, the questions again). `renderLight` ends the same way.

**Results (`cycleCompare`):**
- A gap that ended during the plan counts as "since", even if it began before. A guessed date makes it "about {n}".
- With no clean gap before, "before" is her own joining answer ("You said: 36 to 45 days"). The pain and heavy results do
  the same.
- The cycle results add "Periods often take 3 to 6 months to change."

**Discreet mode:**
- My plan has no goal label, and "Cycle care yoga" is "Today's yoga" (`rName`, `rSub`).
- Iron steps are private. The check-in's labels use the plain words, it has no "Pain" chip, and its reason line is "Every
  small step counts."
- There are no "Other plans", no period, pain or signs results, and no "What to expect".

**Core:**
- explain's late card from 40 (`S.stageNow() === 'meno'`): "Day {n} since your last period" and the years-before-menopause
  line (`tMid`, `wMid`).
- The ring says "Typical gap 21–35 days".
- "Your start date is a guess" shows on one day a week (`prompts.approxNote`).

**API added:** `S.plan.docShowing()`; the plan module's `event` hook.

**Tests:**
- `node test/notices.mjs` (76 checks): the 8 criteria.
- `pmosplan.mjs` (the reminder opens the check-in; the look-back), `companion.mjs` (one count, rows after the check-in, the
  look-back's barrier) and `firstday.mjs` (112: the reminder's words, "no period yet" folded into the doctor check) follow it.
- `weeks-walk.mjs` announces the period as the diary does (`S.emit('log', { type: 'start' })`).

## 42. Version 38: a plan that fits every goal (Mohit, 24 Oct: "Plan to do all three properly", on `docs/ux-gaps-2026-10-24.md`)

Why: the every-goal walk (`web/test/stages-walk.mjs`) showed some plans that didn't fit her goal or stage:
- two pregnancy plans, and the same after-birth check twice;
- the cycle plan's words for a woman trying for a baby;
- a 21-day iron loop that offered meat to vegetarians;
- a cycle countdown from 40;
- two "check-ins", other programmes on top of her plan, and For you by stage only.

New wording for the doctor is in `docs/wording-review-v28.md`, section 16. Each owning module exposes a small API and keeps
writing its own data. `mods/plan.js` looks them up at call time, so the load order doesn't matter.

**One pregnancy plan:**
- `preg.js` adds `S.preg.plan.due()`: what her pregnancy plan has due now, as `[{ id, name }]` (not after 42 weeks).
- The plan's `preg` pack (now "My pregnancy plan") takes it as its first step: "Due now: {x}" (kind `link`, opening
  `preg-plan`, no Done on Today). Then her goal's routine, and kicks from week 28.
- While that plan runs, preg.js's own "Due now" Today row steps aside (`planOwns`). The tablet rows stay.
- journey.js's Today row steps aside while any plan runs.
- Her weeks are her own (`ownWeek`): "Week {n} of pregnancy" on Today, My plan and the doctor summary. The path is her
  trimesters (`plan_tri_*`). In discreet mode the plain label returns.

**One after-birth check:**
- Until day 42, every after-birth goal starts with the daily recovery check: kind `check`, opening `post-recovery`. It is
  done only by post's own record (`S.post.checkedToday()`), never by a tap.
- On Today it has no Done. The check-in shows "Do it now" or "Done today" instead of chips. `markAction` skips it.
- post.js's own Today card steps aside while the plan runs.
- "Week {n} after the birth".

**Trying for a baby (`ttc` pack, goal `ready`):**
- Its steps are a walk and the food habit. On plan days 1, 8, 15 and so on, a link to her before-pregnancy checklist
  (`ttc-prep`), which is advice for her doctor and ASHA: there's no dose in the plan's words.
- Its own reasons (`plan_fb_food_t`, `plan_fb_prep`), and its own "what happens when": the trying page's own reviewed line,
  more than 8 in 10 couples within a year. No promise about periods or waist.
- Its results show checklist progress (`S.ttc.prepDone()` gives `{ a, b }`).
- A pregnancy ends it: `packOf` is null, and My plan offers the pregnancy goals.

**Heavy periods:**
- `S.journey.step(id, n, { food })` gives a vegetarian ("Poha with lemon") or egg ("Eggs today") step in place of day 9's
  "Eggs, fish or meat".
- After day 21, one iron food a day from her own diet (`plan_a_ironf_*`) replaces the loop.

**From 40:**
- For a midlife woman whose periods still come (`isMidlife()`, not stopped, not discreet), Today's hero is days (then
  months) since her last period, with her weekly symptom diary one tap away (`S.meno.thisWeek()`). There is no ring, and
  the ring's tip isn't offered.
- The midlife plan's results for hot flushes, sleep or mood come from the weekly diary: weeks with it in the 4 weeks before
  she started, and in the last 4 (`S.meno.trend(key, from, to)`).

**PMS:** in the 7 days before her likely period (`S.cycle.rangeInfo()`), her plan's line says "Your calm week: the days
before your period. Your calm breath comes first." It isn't shown in discreet mode.

**One name for each thing:**
- The monthly signs check-in is "This month" (round button `checkin_b`, page `ci_title`). No pre-fill.
- While a plan runs, My plan has no "Other plans" (`otherPlans` is gone). "Change what I work on" stays in its settings.
- The PMOS self-check opens with her plan's answers (selfcheck.js `prefill`, from `state.intake`): gap to `gaps`, and the
  signs. Skipped months do not answer `few` ("fewer than 8 periods a year" is a different question; review fix 42.1). A line says so. The test, scan and baby questions stay open, so no verdict comes until she
  answers them. TRIAGE gating is unchanged.
- My plan's minute chips sit under "Add minutes".

**For you by goal:** her plan's goal (`S.plan.goal()`), or the goal she joined with, puts its own 2 or 3 tools first
(`FOR_GOAL` in core, tile routes only).

**API added:**
- `S.preg.plan.due()`, `S.post.checkedToday()`, `S.ttc.prepDone()`, `S.meno.trend()`, `S.meno.thisWeek()`;
- `S.journey.step(id, n, { food })`, `S.plan.goal()`;
- step kinds `link` and `check`, in `NO_TAP` with `routine`.

**Tests:** `node test/goals.mjs` (71 checks). `companion.mjs` follows the `ttc` pack and the new pregnancy plan name.

### 42.1 The 24 Oct review (a multi-agent review of V37.1 to V38: 57 findings, 52 confirmed by a second agent)

Every confirmed finding is fixed. The checks are in `web/test/goals.mjs`, section 10; a second six-agent pass re-checked
each fix and found 4 only partly fixed and 7 new slips, all fixed with the checks in section 11. A third pass (each
reported slip tried by a skeptic) confirmed 5 more from that round, fixed with the checks in section 12.
- **Reminders:** `pauseSync` also removes the plan reminder when a plan no longer applies: a pregnancy ended, the trying plan
  after a pregnancy, or an after-birth plan in a new pregnancy. A pregnancy plan's reminder ends 2 weeks after her due date
  (`remEnd`). `remSync`'s done mark is a quiet upsert, so Start no longer sets off the reminders or exact-alarm sheets. Core
  shows a shared phone's PIN before any reminders question. Coming back from the alarm setting redraws the Start screen.
- **Weeks:** `wkNow(d)` counts the real week for a plan with no end (pregnancy) and after "Keep going". It is used in the
  doctor summary, light results (the latest 12 weeks), the check-in's week count, the ring and strength count. In discreet
  mode an endless plan says "Week {n}" (`plan_wk_n`), and the summary says "Plan week {n}" (`plan_sum_wkn`).
- **Safety:**
  - an expired contraceptive (or Antara past its late window) is `data-xp-urgent`, so no plan card pushes it off Today;
  - once her periods have stopped there is no "Heavy periods" goal, and the heavy plan's doctor card applies (`goalsFor`,
    `docCase`);
  - the PMOS self-check no longer answers "fewer than 8 periods" for her.
- **Discreet mode:**
  - a pregnancy plan's cards (`plan_rv_len_d`, no "danger signs"), its trimester path (hidden), the trying checklist step,
    and the mood and sleep links are private;
  - the supplements card shows only on the PMOS plan, and never on a shared phone (`pmosAsk`).
- **Flows:**
  - a light plan's PMOS page, and a routine's "Back to my plan", open its own page;
  - a waiting plan shows on the end and "starts tomorrow" pages;
  - `endSeen` resets with each plan;
  - a plan paused by pregnancy or a birth shows why, then the goals for now (a new plan replaces it);
  - after 12 weeks the check-in opens the end page;
  - "Change my answers" keeps "None of these";
  - joining remembers "About how long ago?".
- **Counting and results:**
  - her period line shows once, only for her latest start, and goes if she takes it back (`latestStart`). Core emits `log`
    before it redraws Today, so it shows at once;
  - `docShowing` is false while a new plan's card shows;
  - yesterday counts a routine and the after-birth check (`S.post.checkedOn`);
  - a barrier she took back isn't kept;
  - "A petal for your garden" shows only when one came (`S.joy.petals`, and `S.joy.release()` now returns whether it showed
    something);
  - heavy results count only periods with flow details, and pain results count one period once;
  - the signs results go by each check-in's own date;
  - midlife results use whole weeks ("4 weeks before you started", "Last 4 weeks").
- **Goals:**
  - For you takes a running plan's goal, or a joining goal that fits her stage now (`goalNow`), with stage-specific tools for
    after-birth and midlife goals (`FOR_GOAL_ST`);
  - the pregnancy iron goal gets the diet-aware steps and the daily habit after day 21 (and asks what she eats);
  - iron steps keep their links;
  - the kick counter only shows where the build shows it (`S.toolShown`);
  - journey day 20 is "This month".
- **Words:**
  - month 1 for pregnancy, after a birth and 40+ says "See how your plan is going." (`plan_sl_m_p2`);
  - the midlife late card counts days like Today's hero ("{d} days since your last period"), which switches to months only
    after 60 days;
  - "What's new" names the tabs by their own labels in her language (`wn_2` takes `{h}` and `{c}`).

**The re-check (second round, 24 Oct):**
- **Reminders:** when Sakhi takes a plan's reminder away (a pause, or a plan that no longer applies) it marks `remGone`;
  `pauseSync` puts the reminder back, quietly, once the plan applies again (for example the trying plan after a pregnancy
  ends). A reminder she turned off herself stays off. A pregnancy plan's reminder end follows her due date when a scan moves
  it.
- **Paused and waiting plans:** a plan paused after a birth is paused on My plan (no running card or minutes ring). A light
  plan's card there has its own name and no ring. A waiting plan that would be paused as soon as it starts isn't offered
  (`pendingOk` checks `pausedFor`).
- **Yesterday** counts what Today counted that day: her ticks, minutes only at the walk's target, a routine only when it is
  one of her steps, and the recovery check only until 6 weeks after the birth (`rcheckOn`, also used by `dayDone`).
- **Weeks:** the doctor summary averages the 4 complete weeks before this one (a finished plan's weeks 9 to 12), and a
  plan kept going past 12 weeks says "Plan week {n}". The path card on a kept plan shows "Keeping it going" and this week.
  Midlife "Last 4 weeks" is this week and the 3 before it.
- **Results:** pain and heavy results go by period as Days counts them: two starts logged within 10 days are one period
  (`periodsOf`).
- **For you:** a running after-birth or midlife plan keys its goal's tools on the plan, not the stage (an after-birth plan
  stays one once her periods come back). Any other plan keys on her stage, so a kept cycle plan after a birth still leads
  with the after-birth tools.

**The third check (24 Oct):**
- **Reminders:** only a reminder that was on is marked `remGone`, so one she switched off in Reminders stays off. An evening
  time she sets in Reminders becomes her check-in time (`d.remAt`), so a reminder that comes back keeps it; `mig` still
  moves a daytime one to 8 pm.
- **The first 6 weeks after a birth:** `stageNowKey` is `post` while `pauseWhy()` is, so My plan and "Change what I work on"
  offer the after-birth goals even with a period logged. A waiting plan that is paused says why on My plan.
- **Yesterday** is `actionsFor(d, iso)` for yesterday: its week's walk and food habit, its weekday, its log, and the recovery
  check while it was one (`todayPlan`, `lightWalk`, `periodToday` and `planDayAt` take the day too). A step she ticked that
  day which today's list can't rebuild (a pregnancy plan's "Due now" once nothing is due) still counts. A fourth check
  found only that one; section 12 has its test (104 checks in all).

## 43. Version 39.0: fix and protect (Mohit, 24 Oct: "yes to all four, start V39.0", on `docs/roadmap-v39-2026-10-24.md`)

Why: the journey audit (`docs/journey-audit-2026-10-24.md`) and the review of the plans docs found safety and privacy gaps
that the app's own records and reviewed lines already cover. Mohit's four decisions: start now; the stricter reviewed
line wins in pregnancy and after a birth; remove Pattern check, Today for you, Doctor videos, the stories page and the
supplements card (the supplements card goes now; the rest in 39.1 and 39.2); and ask the existing pill question at
joining. There is no new health wording. Interface copy is listed in `docs/wording-review-v28.md`, section 19. The three
triggers the gynaecologist confirms before other women get this build are in section 18.0.

**Signals her records already hold (`mods/explain.js`):**
- `S.explain = { findings(), top() }`. `top()` is the most urgent open finding she hasn't marked "Got it" (or null).
- **Bleeding after a year:** at 45 or more, or in midlife, a start or spot in the last 60 days that comes 365 or more days
  after the bleed before it gives `bleed_after_stop` (`week`), whether or not she ticked "periods stopped".
- **Pregnancy:** "Baby moving less" (`d_moveless`, a day-sheet chip from week 28) in the last 2 days gives `p_moves`
  (`now`). Headache and swelling within 3 days of each other, in either order, give `p_headswell`.
- **Module flags:** explain asks `S.preg.flags()` and `S.post.flags()` for warning lines their own records hold. Each
  flag is `{ id, lv, at, t, see, go }` (`t` and `see` are `{ en, hi }`). They are drawn in their own reviewed words and
  never share an id with explain's table (`X`).
  - `S.preg.flags()` (pregnant only, entries in the last 3 days): `pg_bp` (BP at the urgent line, `now`; at the
    see-today line, `today`), `pg_hb` (Hb under 7, `today`), `pg_sug` (2-hour test 140 or more, `week`), `pg_sugf`
    (fasting 95 or more, `week`).
  - `S.post.flags()` (0 to 84 days after a birth): the recovery check's urgent (`now`) and see-today (`today`) answers
    for today and yesterday, as `pp_<key>`, opening `post-recovery`.

**The stricter line wins (decision 2):**
- `p_bleed` and `p_moves` are `now`, and a `now` card leads with Help's own line (`seeNow: 's1c'`): "Call 112 now. …".
- Today's `now` card has a call button (`tel:112`) and "What this means".

**Discreet mode (a shared phone):**
- Core's `discUrgent()` puts one plain line on Today:
  - for a `now` finding, a dark card with 112, 108 and 102 and "Open";
  - for `today` and `week`, a button, "Something you noted needs a check".
  - Opening it goes through `privateGo(route)`, which asks for her PIN when one is set (`pinHash`).
- The plan's doctor cards show on a shared phone too (`data-disc-ok`), in plain words (`plan_doc_d`). `cardKind 'doc'` is
  checked before the discreet return.
- My plan with no plan shows only "Pick a goal when you're ready" (`#pl-disc-pick`).
- For you is empty in discreet mode.

**Today's slot:** urgent cards first (as before). A `month`-level card from her records (`data-xp-lv="month"`) now ranks
before her plan's moment cards, so it never folds under "More from Sakhi"; her plan's own heading still leads Today.
Medicines never fold: a plan's rows fold into "Your plan: {n} steps" past 4 items, but a row with `icon: 'pill'`, id
`iron` or `med: true` stays.

**After a loss or a birth:**
- `endPregnancy` emits `pregEnd` with `{ birth }`. preg.js clears its `preg-plan-*` reminders on it.
- After a loss with tablet reminders on, Today asks once "Keep your tablet reminder?" (`tabKeepCard`, `prompts.tabAsk`).
- `plan.js`: `lossNow()` is true for 42 days after `pregEndedOn` (not pregnant). `pauseWhy()` and `pausedFor()` give
  `'loss'`, unless she started the plan on or after that day. My plan then shows the loss card (the loss pages, Help and
  "Pick a goal when you're ready"); For you shows only the loss pages (`FOR_YOU.loss`).
- The plan's evening reminder rests while the plan is paused, and comes back after (`remGone`, as in 42.1).

**Help:**
- A new top row reuses the reviewed line "Thoughts of harming myself or my baby" (`hs_harm`). It opens `openHarm()`:
  14416, 1800-891-4416 and 112.
- `HELPLINES` now run 112, 14416, 1800-891-4416, 181, 108, 102, 104 and the rest.

**Reminders on the lock screen:** `notifWords(r)` gives medicine reminders "Time for your tablet" and every other
module's reminder "A reminder from Sakhi. Tap to see." Tools, the plan, backup and the monthly check-in keep their own
titles, which have no health words. The period heads-up is neutral unless she turns on Me > Reminders > "Show what each
reminder is about" (`settings.notifWords`).

**Joining:** the cycle "last period" screen asks "I'm on the pill, an injection or a hormonal IUD" (`#ob-pill`).
`finishOnboard` sets `situation.hormones`, so those months are left out of her averages and their late or missing
bleeds aren't flagged.

**Small fixes:**
- A claimed PMMVY or JSY (`S.access.claimed(k)`, giving `applied` or `got`) ticks the pregnancy plan's scheme step.
- A pregnancy plan's settings say "Starts a new plan" (`plan_set_goal_s2`), not "a new 12 weeks".
- "New this week" shows only during the plan's weeks.
- The Hindi for energy is ऊर्जा.
- The supplements card (`pmosAsk`, `askCard`) and the kick step in the plan are gone. The kick counter itself stays where
  the build shows it.
- Search:
  - loss pages are left out of weight and food searches ("weight loss" is a phrase, not "loss");
  - a mid-word hit counts only for terms over 4 letters.
- The Iron tablets radio buttons get their own size (`app.css`).

**Tests:**
- `node test/protect.mjs` (61 checks).
- Updated: `notify.mjs` (neutral titles), `pmosplan.mjs` (no supplements card), `firstday.mjs` (a month card leads the
  slot; the doctor check in plain words), `goals.mjs` (a plan rests 6 weeks after a loss), and `maths.mjs` (bleeding in
  pregnancy is `now`).
- `maths.mjs`, `smoke.mjs` and `check.mjs` now set a non-zero exit code on any failure, so `npm test` stops there.

### 43.1 The 24 Oct review (3 reviewers, each finding retried by a skeptic: 36 findings, 34 confirmed, all fixed)

The checks are in `web/test/protect.mjs`, section 13. The two not confirmed: "Not yet" keeping the 365-day card (the
documented rule; asked of the gynaecologist in wording review 18.0b), and a BP entry with no date (no app path makes one).
- **Signals:**
  - "Yes, they have stopped" (and the "My periods have stopped" stage) dates `stoppedOn` to her last period (core
    `lastBleedISO`, meno.js `lastBleed`), so bleeding after it stays flagged.
  - The 365-day rule skips hormones (and a stop within the gap, `hormonesUntil`), breastfeeding, and a gap with a birth
    or a pregnancy's end in it.
  - A check-in's `pbleed` is `now` for 2 days, then `today`.
  - Post flags lead with the check's own line (`fl_112` or `fl_today`); `fl_harm` carries `call: '14416'`, and Today's
    and the shared phone's cards call 14416 first. Today's check replaces yesterday's.
  - A "call 112" card that opens Help has one Help button.
- **The year-without-a-period question:** from 40 (meno is in Today's list from 40), after 12 calendar months (as the
  timeline counts, `monthsSince`). It is `data-slot-first`, which Today ranks before every other card (core `moduleCards`, r
  -1), because answering it settles the late-period card.
- **Reminders on the phone:** `isTablet(r)` (kind `med`, `preg-ifa`, `preg-ca`, `iron`) says "Time for your tablet";
  injections, visits and tests from contra and iron say "A reminder from Sakhi. Tap to see." Me's switch says her own
  reminders keep her words.
- **The PIN on a shared phone:** `privateGo(route)` no longer opens a sheet. On a shared phone with a PIN, `explain` asks
  for the PIN on the page however she reaches it (`PIN_ROUTES`, `pinGated`, `renderPinGate`: one title, Back). Other
  routes go through `#pin`, which asks and then opens `mem.pinNext`.
- **A hidden urgent card:** a module's `data-xp-urgent` card that a shared phone hides (no `data-disc-ok`) still gives the
  plain line. "Open" goes to that card's first `data-go`.
- **After a loss:**
  - the tablet question names no tablet on a shared phone (`tab_keep_hd`, `tab_keep_pd`);
  - it includes the Iron tablets course started for her pregnancy (`S.iron.pregRem()`; "Turn it off" calls
    `S.iron.remOff()`);
  - it isn't asked once a birth is recorded.
- **A plan she picks after a loss:** `viewOf` gives the pending plan today's `started`. `pausedFor` no longer falls through
  to `'loss'` for a plan started on or after `pregEndedOn`. Today suggests no plan in the 6 weeks.
- **On a shared phone:** after a loss one tap shows the goals, and they hide again once she leaves My plan's pages
  (`discPick` and `lossPick` reset in plan.js's `afterRender`).
- **A pregnancy that ended before 39.0** leaves no `preg-plan-*` reminders: preg.js's `afterRender` clears them whenever
  she isn't pregnant.
- **Leaving "Pregnant":** the stage sheet asks "Did your pregnancy end?". "No, I marked it by mistake" calls
  `unmarkPregnant()`: no span, no `pregEndedOn`, no loss weeks, and `pregEnd` with `{ mistake: true }`, so the check-up
  reminders still stop.
- **A birth date on the After-birth page** calls core's new `S.birthOn(iso)`, which ends the pregnancy like the stage
  sheet.
- **Joining on the pill** sets `hormonesSince` too.
- **Search:**
  - plural loss words count as asking;
  - a word of 3 letters or fewer matches whole words only;
  - a synonym counts only as a whole word or phrase in what she typed.
- **Today:** her own reminders (`rem-*`) never drop out, like tablets.
- **A scheme claim:** `S.access.claimed(k, since)` counts only a claim started on or after `since`. The pregnancy plan
  passes `pregnantSince`.

## 44. Version 39.1: one home for what her records say (Mohit, 24 Oct: "build and deliver best version build one by one from V39 to V48", on `docs/roadmap-v39-2026-10-24.md`)

Why: the journey audit found what her records point to on 8 surfaces in 3 tabs, with three tools answering one question
differently (Pattern check, the self-check, What your diary shows). The roadmap's gate for 39.1 is a test that Trends and
explain never disagree. There is no new health wording: wording review 18.1 lists when existing cards now show, and 19.1
the labels.

**One engine (core):**
- `S.cycle.verdict()` (core `cycleVerdict`) is the one reading of her last 6 counted gaps and her periods of the last 6
  months: `{ gaps, days, tol, hiB, spread, outside, longN, shortN, cls, pers, longP }`. `cls` is `outside`, `irregular`,
  `regular` or null (fewer than 2 gaps).
  - It is null while her cycles aren't counted (`S.cycle.counting()`: pregnancy, the year after a birth, hormones,
    periods stopped, a hysterectomy).
  - Trends' verdict, explain, the plan's suggestions (`signals().long`), the report's questions and the self-check hints all
    read it.
- `S.cycle.periodFlow(d0)` gives a period's flow and pain from its start, the details added on any of its days
  (`start_detail`), and its end. `S.cycle.heavyEv(e)` is the one heavy test (`pads_4`, `clots_2`, leaked, two pads).
  explain, the report's Heavy column, the self-check hints and plan.js's results use them.

**explain.js agrees with the verdict:**
- **An older gap:** when the verdict is `outside` and the last gap has no card, the most recent gap outside the range gets
  `gap_long` or `gap_short` with `old: true` (title `tOld`, "One of your recent gaps was {n} days"). It is `month` at 2 or
  more outside, otherwise `watch` and `quiet`.
- **Uneven gaps:** when the verdict is `irregular`, `gap_vary` ("Your gaps vary by {n} days", the verdict's own line), at
  `watch` and `quiet`.
- **A long period:** while counting, `period_long` is the verdict's latest period over 8 days in the last 6 months (`old`
  when not her latest, `quiet` after 75 days). Not counting, the old rule stays.
- **Quiet findings** (`quiet: true`) show on Diary and the explain page, never on Today (`home`, `top`).
- **New triggers for reviewed cards:**
  - flow and pain from any day of her period;
  - `pain_severe` for `pain_3` in 2 of her last 3 periods (within 120 days);
  - `flow_heavy` for her latest PBAC chart at 100 or more within 75 days (`S.cond.pbacLatest()` gives `{ d, pts, n }`).

**The same buttons on every signal (`actsHtml`):**
- **Order:**
  - for `now`: a call button (`tel:112`) and Help;
  - for `today`: free care near her (`access-free`);
  - for `week` and `month`: "Free government doctor" (`access-doctor`), then "My report for the doctor", then "Ask a Qura
    doctor about this" (never on `now` or `today`).
- **The report:** "My report for the doctor" sets `S.mem.rpFirst` to that card's question (`RPQ`: the reviewed `rp_q_*`
  line, or the card's title) and opens the report. That question leads the report's list. Core clears it on any other
  route.
- **"Check the signs (2 minutes)":**
  - `CHECK` maps `pain_severe` to `selfcheck-endo`; `flow_heavy` and `period_long` to `selfcheck-fibroids`; `gap_long`,
    `androgen` and `neck` to `selfcheck-pmos`.
  - It shows where the build shows the check (`S.toolShown`). Once she has done the check in the last 90 days it becomes
    "You did this check on {d}: yes to {n} of {m}" (`S.selfcheck.last(id)`).
- **The plan offer:** a `month` `gap_long` card offers "A 12-week plan for your periods" when `S.plan.offerOk('irregular')`;
  `S.plan.offer(goal)` opens the goal's questions.

**Diary's "What it shows" (was Trends):**
- **In this order:**
  1. explain's cards, short (`S.explain.diaryCards()`: how soon, the date, the title, when to see a doctor, the buttons,
     and "What this means" to the full page);
  2. the verdict, with "Your numbers" folded into it (no separate card);
  3. the charts and her cycles;
  4. What repeats;
  5. "This month's signs" (the monthly check-in, moved off Today's round buttons);
  6. "Checks you did" (`S.selfcheck.list()`);
  7. What she noted;
  8. the report button.
- **Shared phone:** no signal cards. Today's plain line stays the only sign.
- **On the calendar and Days:** one line opens What it shows.
- **The explain route** stays as the deep page, lit as Diary, and Back goes to Diary.

**Flow and pain on every bleeding day:** the day sheet offers "Add flow and pain details" on every day of her period and the
day it ends. On a day that isn't the start, the log sheet asks only flow and pain and saves a `start_detail` event (nothing
saved when every answer is empty). Days shows those details.

**Pattern check is gone (Mohit's decision 3):**
- **What was removed:** its tile, For you (pmos, irregular, weight goals), the Conditions link (now the self-check),
  explain's links and the self-check's "Read about it" (now the PMOS article `a-pmos.what-pmos-is`).
- **An old link:** `#pattern` lands on `selfcheck-pmos`, or the diary where the build holds the check back.
- **Its two questions** are in the PMOS self-check:
  - "Has a doctor already told you that you have PMOS?" at the top, which writes `situation.pcos`;
  - after the 9 signs, the nipple question with the prolactin line, on screen only and not counted.
- **The result:** free care first, then her report and a Qura doctor, then "A 12-week plan for your periods" when her
  answers or diary show irregular periods (goal `pmos` for a match or a known diagnosis, else `irregular`).

**Fewer places:**
- "Could it be PMOS?" is no longer a plan suggestion ("A plan for you" never labels a check).
- The symptom guide sits in Help (tile `place: 'help'`: out of Explore's topics, still found by search).

**My plan:** one row under the heading for explain's top open finding (`S.explain.top()`, drawn by `S.explain.label(f)`),
opening What your diary shows. Not on a shared phone. The plan never works it out itself (roadmap decision 5a).

**API added:**
- `S.cycle.verdict`, `periodFlow`, `heavyEv`, `counting`;
- `S.explain.diaryCards`, `label`;
- `S.selfcheck.last`, `list`;
- `S.plan.offerOk`, `offer`;
- `S.cond.pbacLatest`;
- tile `place`.

**Tests:**
- `node test/records.mjs` (68 checks).
- Updated:
  - `pmosplan.mjs` (no self-check as a plan; "Check the signs" instead);
  - `fieldtest.mjs` (the held-back tool is `#selfcheck-pmos`);
  - `goals.mjs` ("This month's signs" in What it shows).

### 44.1 The 24 Oct review of V39.1 (3 reviewers, each finding retried by a skeptic: 34 findings, 29 confirmed, all fixed)

The checks are in `web/test/records.mjs`, section 13 (94 checks in all). Not confirmed, and left as they were:
- a gap from years ago in her last 6 counted gaps (the verdict reads her last 6 counted gaps with no date window, as
  documented);
- "Checks you did" opening a blank check (a check is answered fresh each time; the saved result keeps only her "yes"
  answers);
- the Qura button on a "keep an eye on it" card (section 44 keeps it off `now` and `today` cards only);
- the androgen card's link, and the PMOS line in the self-check carried over from Pattern check.

Two of those were still changed, as small safety and privacy gains: the androgen card's reading link opens the reviewed
PMOS article (Pattern check is gone), and on a phone with a PIN the self-check hides her PMOS diagnosis until she has
entered the PIN for her health details (`S.mem.healthOk`), as Me does.
- **One engine, counted the same way:**
  - the gap cards use the verdict's own counts: 2 or more long gaps give `gap_long` at `month` (and 2 or more short ones
    `gap_short`), even when the other kind sits between them; a month card replaces that gap's watch card;
  - flow and pain come from her period's real start, so a second "Period started" tapped within 10 days doesn't hide
    them;
  - a heavy-bleeding chart from an older period is titled "Heavy flow in one of your recent periods" (`tOld`);
  - the heavy plan's results use `S.cycle.heavyEv` (so "Needed two pads" counts);
  - the plans' long-gap reason counts against her own usual range (`{b}`: 45 days for a teen), only while her cycles
    count.
- **Her numbers:** when the verdict can't show (one counted gap, hormones, breastfeeding, pregnancy), "Your numbers"
  shows open on its own card (`.vd-nums-card`).
- **Calls:** a thoughts-of-harm card calls Tele-MANAS 14416 first, then 112, on What it shows and the explain page too.
  `S.explain.label(f)` gains `call` (`'112'` or `'14416'` for a `now` card), and My plan's records row shows the call
  buttons under its row.
- **Her report:** the card's question travels as a key (`S.mem.rpFirst = { k }` or `{ f }`), and
  `S.explain.question(q)` draws it in the report's own language, so a report in the doctor's language asks it once.
- **On a shared phone with a PIN:** `report` and `report-show` join `PIN_ROUTES`.
- **Flows:**
  - on the day her period ended, "Add flow and pain details" edits that day's own entry (`openLog('end', d, ev)`);
  - an old `#pattern` link replaces itself (`location.replace`), so Back isn't trapped; `pattern` left `TRIAGE`, so a
    tester's build lands on Diary;
  - a card's plan offer needs no plan running, waiting or starting soon (`offerOk`);
  - saving "This month's signs" goes back (`goBack`), to What it shows when she came from there;
  - Days shows "Leaked through clothes" and "Needed two pads";
  - the symptom guide is in Help for a woman who is only reading (stage `browse`) too.
- **Words and screens:** the Diary tour's second tip is "What it shows" (`td2_h`, `td2_p`); a `now` card reads on the
  Diary's paper in light and dark; the Diary's three tabs share a 360 px screen (`.tabs.dtabs`); "This month's signs"
  keeps its not-done dot.

## 45. Version 39.2: fewer places to look (Mohit, 24 Oct, the same goal; `docs/roadmap-v39-2026-10-24.md`, section 3)

Why: the journey audit counted 16 topics and 173 items for every stage in Explore, a second index after each topic, four
tool drawers, three goal pickers on My plan, two pages called "My pregnancy plan", two Reminders rows in Me, a setup card on
Today for 215 days, and a Back button that walked through other tabs. The roadmap's gate: Help, 112, loss, violence, STI
and abortion information within 2 taps and in search (`web/test/places.mjs`, section 11). Labels only (wording review
19.2); the intended-use line goes to the lawyer.

**Explore:**
- **By stage:** "Topics for you" shows only her stage's topics (`STAGE_TOPICS` by `stageNow()`; `teen` first under 18;
  after a loss, `loss` first and no contraception, trying or missed-period topics). "All topics ({n})" opens the rest in
  place (`mem.allTopics`). A shared phone keeps the full grid, titled as before.
- **The tool drawers are gone** (`DRAWERS`: plans, records, support, fun). Their tools moved:
  - reminders, medicines and iron tablets into Me's one Reminders page;
  - the reports page into Diary's What it shows ("My records");
  - Sach ya Myth into Learn;
  - her garden into My plan;
  - Language into Me only;
  - the symptom guide into Help (39.1).
  Search still finds every tile.
- **Contents:** "Contents: all guides and articles" sits right under search (it was the last row).
- **A topic opens its own guide** (`TOPIC_HUB`): the topic route draws the module's hub. Under it go the section's tiles
  the hub doesn't link ("Guides and tools") and the Learn articles. There is no second list of the same guides.

**Removed (Mohit's decision 3):**
- Today for you (`access-feed`), Doctor videos (`access-videos`) and the stories page (`access-stories`): their routes,
  tiles and `routes.json` entries.
- The `homeMore` hooks in access, joy and relief, which core stopped drawing in Version 37.

**Pregnancy:**
- preg.js's checklist page is "Check-ups and tests" (`plan_h`); "My pregnancy plan" means only the My plan tab.
- Core's old `pregnancy` route (check-up visits) opens `preg-plan` while she is pregnant.
- Today's hero has one button, "Check-ups and tests" (the round "This week" button stays). From 37 weeks it adds "My baby
  is born" (`#bb-born`), which opens the stage sheet at After birth. A shared phone sees "Change stage" instead.
- The pregnancy plan's My plan page has the same row from 28 weeks (`planRows`).

**My plan:**
- **One picker:**
  - "What you want help with" (`helpCard`) is no longer drawn;
  - "Suggested for you" shows at most 3;
  - "My PMOS plan" is listed only for a woman with PMOS (for everyone else it is her PMOS goal);
  - the goal her records point to (`suggestedGoal`: PMOS, heavy flow in 2 periods, pain in 2, long gaps in 2) carries a
    "Suggested" pill, never on a shared phone.
- **The 21-day journeys stop being programmes:** the catalogue lists one only while she is on it. A journey's page is for
  reading (all 21 steps), with "Open My plan" and no Start. A journey already started runs to its end.
- **Her garden** is a row at the end of My plan.

**Today:** the setup card leaves Today 30 days after she joined (`joinedDays`, from `consent.c1`). Me shows it while it is
unfinished (`setupCard(disc, true)`, wired by `wireHomeV30`).

**One name for each thing:**
- "Report for my doctor" on My plan's care team too (was "Report for any doctor");
- "My progress" for every plan's results (was "How it is going" for light plans);
- the doctor summary is titled by her plan (`packTitle`), not "PMOS plan";
- Me has one Reminders row (`me-reminders`), and the page lists her reminders, medicines and iron tablets above the
  phone's alert switches.

**Back:**
- A tab tap replaces the history entry (`location.replace`).
- The phone's Back from a tab's first screen (Diary, Explore, My plan, Help, Me) goes to Today.
- Back on Today closes the app: `__sakhiBack()` returns `'exit'`, and `MainActivity` finishes on it.

**Me:**
- The top bar's Me button is labelled "Me / मैं".
- The Language row has an अ/A mark and its name in English and Hindi.
- About has the intended-use line (`intended_use`).

**Tests:** `node test/places.mjs` (54 checks).

## 46. Version 39.3: food and search in her words; joining asks only what it uses (roadmap section 3)

Why: the diet audit found 9 food screens with 9 names, food steps that opened the page they were on, only three diets and a
non-vegetarian default, papaya and raw sprouts suggested in pregnancy, and 24 of 74 food searches finding nothing. The
journey audit found joining questions the plans never used. The gate: no pregnancy-caution food reaches a pregnant woman
(`web/test/food.mjs`, section 3). Then the golden test is recorded on this build (`web/test/golden.mjs`).

**One foods table (new module `mods/food.js`, before plan.js in `order.json` and `index.html`):**
- `S.food.table` = `{ GROUPS, MORE, LESS, AVOID, LOCAL }`, moved unchanged from plan.js. Each food is
  `[group, en, hi, diet, flags, pregnancy version]`, and the tags sit in one `TAGS` map by English name:
  - `r` is onion, garlic or a root vegetable, and `j` other foods many Jain families leave out;
  - `m` is milk, curd or paneer;
  - `i` is iron, `c` calcium, and `b` low cost (for 39.9 and F1).
- `S.food.diet()` returns `{ type, milk }`. `type` is `veg`, `egg`, `nonveg` or `jain`, vegetarian by default; a plan
  made before 39.3 keeps its own answer. `S.food.set(type, milk)` changes it, and her plan keeps going.
- `S.food.ok(food, { type, milk })` is the one filter. `S.food.name(food)` gives the pregnancy version while she is
  pregnant.
- `S.food.simple(type)` maps Jain to vegetarian, for the screens that know only three diets (the 21-day iron steps).
- `S.food.plate` is the plate icon.
- plan.js reads the table through `FT()`, filters through `dietOk`, and names foods through `foodName`. My plate's
  protein and side lines follow her diet (`protKey`: vegetarians are no longer shown "paneer, egg or fish").

**My food (route `food`):**
- How she eats: four choices plus "I don't take milk, curd or paneer".
- Her stage's reviewed food pages, as rows:
  - pregnancy: food in pregnancy;
  - from 40: calcium from your kitchen (`meno-bones`);
  - My plate (not in pregnancy);
  - after a birth: breastfeeding;
  - food that builds blood (`cond-anaemia`);
  - fasting days.
- On a shared phone, only the plate and how she eats.
- **Where it appears:** in Explore's "Topics for you" right after her stage's own topic (her pregnancy or a loss stays first;
  not on a shared phone), as a tile on every plan's My plan page (the cycle plan's tile is My plate; Version 39.5), and in
  search.

**Food steps and moves:**
- The heavy plan's iron step, and the pregnancy iron goal's, open My food instead of My plan.
- **Moves on every plan:** every plan except pregnancy and the first 6 weeks after a birth has a "Yoga and moves" row. The
  midlife plan starts with "Strength at home". Pregnancy has one line instead: "In pregnancy, start moves only after your
  doctor says it's OK for you."
- **Search tiles** (tools section, so search finds them but they aren't topics): Yoga and moves, Strength at home and My
  plate, hidden in pregnancy.

**Search in her words (`TOOL_SYN`):**
- Food words in English, Hinglish and Hindi (khana, nashta, recipe, sabzi, dal, doodh, sattu, jain, क्या खाएं, आहार…) open
  My food first. In pregnancy, food in pregnancy comes first.
- Fasting words (vrat, iftar, roza, व्रत…) open fasting days.
- Yoga opens Yoga and moves, and BMI or weight opens My body.
- Scheme names in English and Hindi (janani suraksha, जननी सुरक्षा, मातृ वंदना, jssk) open the schemes pages, not the safety
  page.

**Joining asks only what the plan uses:**
- **"Your day":**
  - it asks how she eats (now with Jain) and about milk for every plan;
  - it asks her activity except for heavy periods, pregnancy and after a birth;
  - it asks bedtime and work only where sleep is a step (not heavy periods, pregnancy, after a birth or midlife);
  - it asks her knees or back (`lim`, multi) where the plan has moves; `startFromIntake` sets `limits`.
  - Milk isn't required, and how she eats is pre-filled from `S.food.diet()`.
- **The period questions** are pre-filled from her diary (`diaryGaps`: the median of her last 6 counted gaps, "vary" over a
  21-day spread, "skips" for any gap over 60), with "From your diary: your last {n} gaps were {a} to {b} days."
- **The body screen** shows only for the weight goal.
- **The plan screen** has one card fewer: "How each day works" and "What happens when" are one card, "Your days and weeks"
  (`days`).

**The golden test:**
- `node test/golden.mjs --record` writes `web/test/golden/plans.json`: 18 plans and goals × 8 plan days. Each holds the steps
  (id, kind, title, sub, link, state), Today's plan line, My plan's page text and the doctor summary.
- A plain run compares with it.
- Any change to what a plan shows re-records it in the same commit, with the change named. It is recorded on this build,
  as the roadmap asks before 39.4.

**Tests:** `node test/food.mjs` (49 checks); `node test/golden.mjs` (2).

### 45.1 and 46.1 The 24 Oct review of V39.2 and V39.3 (3 reviewers, each finding retried by a skeptic: 30 findings, 25 confirmed, all fixed)

The checks are in `web/test/places.mjs`, section 13 (67 checks in all), and `web/test/food.mjs`, section 9 (72). Not
confirmed: "Change stage" on a shared phone opening the stage sheet (the documented design; the sheet shows none of her
data), stage-led first search results on a shared phone (long-standing and documented), My food's empty list in pregnancy
on a shared phone (the documented result of two rules), value.mjs opening the old drawer pages by URL (a stale test), and
the garden tour's dead row (dead since Version 37).
- **Places:**
  - an old `#pregnancy` link replaces itself (`location.replace`), so Back isn't trapped; the pregnancy topic has one row for
    her check-ups, and Check-ups and tests has "Change my dates" (My details, behind the PIN);
  - `state.joined`, set when she joins (and from her diary's oldest date for a diary from before), so the setup card leaves
    Today 30 days after she joined;
  - "My PMOS plan" is suggested only to a woman with PMOS (situation or her PMOS goal), in every list (`pcosSaid`);
  - abortion, STI and violence pages within 2 taps at every stage: "Missed period" is one of her topics after a birth and
    in midlife, "Intimate health" when she is only reading, and the pregnancy topic links "Your choices";
  - the partner page sits in Contraception, the family page in Girls and families, the relief routines in Periods;
  - a finished 21-day journey points to My plan (no "Do it again");
  - one name for the checklist, "Check-ups and tests" (the paused card's button, the pregnancy plan's due step);
  - teen mode's own topic is first.
- **Food:**
  - the iron days know her pregnancy and how she eats: day 18 is cooked sprouts in pregnancy and dates or raisins for a Jain
    woman; day 14 is tea at another time for a woman who takes no milk (`S.journey.step(id, n, { food, preg, jain, nomilk })`);
  - the protein and drinks habits name only foods she eats (`habitP`); My plate's drawing, its bowl and what Listen reads
    follow her diet (`plateSvg(food)`), with a line for fish or meat without milk (`plan_plate_prot_nn`);
  - joining's period answers count the gap still open: no period for 120 days is "more than 60 days, months skipped", and
    it says "Your last period started {n} days ago.";
  - the PMOS plan's own start form asks Jain and milk, starts from her saved answer, and saves it (`S.food.set`);
  - My food opens for a woman just reading (`open: ['food']`), and My plate's chips work for her;
  - the after-birth plan asks about knees and back; no Yoga and moves or Strength tile in the first 6 weeks after a birth;
    knee pain leaves out the sun salutation, as back pain does;
  - search: the fasting row matches whole words ("baby moving fast" opens the kick counter), tablet and medicine words don't
    open food pages, and after a birth milk words open breastfeeding first;
  - My plate is hidden in pregnancy; "BMI" opens My body (a tile now); the third food answer is "Fish or meat too" everywhere.

## 47. Version 39.4: the plans as data, the port R1 (roadmap section 3; `docs/plans-design-and-build-2026-10-24.md`, 3.1, 6.2)

Nothing she sees changes. The 8 plans that Version 39.3 runs are now pure data in `web/progs/v1.js`, and `mods/plan.js`
reads them. Each later programme (V41 on) is one more file: one review packet, one engine.

**The files:**
- `web/progs/v1.js` pushes 8 specs onto `window.SAKHI_PROGS`: `preg`, `post`, `ttc`, `heavy`, `meno`, `pain`, `pms`,
  `cycle`. The order matters: her plan is the first whose `goals` match her stage and goal, so `cycle` (`goals: [{}]`) is
  last.
- `index.html` loads `progs/*.js` after `art.js` and before the modules; `android/build-apk.sh` copies them.
- `web/progs/baseline.json` holds each live spec's hash (below).

**A spec** (every field is data; `progs.mjs` checks a JSON round trip and fails on any other word):

| Field | What it holds |
|---|---|
| `id`, `ver`, `status`, `tier` | `d.pack` (never renamed); the version (a plan she starts keeps it as `d.pv`); `live`, `draft` (only with `SAKHI_CONFIG.drafts`) or `approved`; `habit` or `condition` |
| `title`, `discreetTitle`, `sensitive` | Title rules `[{ if, text }]`, the last with no `if`; the shared-phone title; `sensitive` keeps it everywhere |
| `goals` | `[{ stage?, goal? }]`: which stages and goals open it |
| `life` | `needs` (`pregnant`, `birth:365`), `ends` (`pregnant`), `pause` (`preg`, `post`, `loss`; every plan pauses after a loss) |
| `clock`, `length` | `weeks`, `pregWeek` or `birthWeek` (My plan's week line); `length.weeks` (0: until the birth) |
| `moves`, `intake` | A plan with moves asks about knees and back (`lim`); `intake.screens` (the goal's own questions), `intake.day` (Your day's questions), `intake.when` (`true` or an `if` list) |
| `slots` | `max`: at most 3 steps a day |
| `steps` | The day's steps (below) |
| `list` | Her plan screen's "Your steps": `walk`, `plate`, `item`, `bed`, or `today` (the day's steps, labelled) |
| `doctor` | `[{ id: 'start', any: [if words], text }]`: the doctor check alongside the plan |

**Text** is `'@key'` (a reviewed string of any module, resolved with `t`) or `'@tile'` (the title of the tile the step's
route opens). Reasons (`why`) are `plan_fb_*` keys.

**Steps:** `{ id, kind, use?, go?, title?, icon?, hue?, why?, priv?, when?, if?, mins?, cap? }`, or `{ first: [steps] }`
(the first that shows), or `{ goal: { <goal>: [steps], '*': [steps] } }` (her goal's own steps).
- `kind`: `minutes` (`use: 'walk'`, `mins`: `ladder`, `light` or `post`, with `cap`), `tick`, `habit`, `routine`
  (`go: 'plan-r-*'`), `link`, `check`, `adapter`.
- Adapters, the steps other modules own, moved unchanged from Version 39.3's `actionsFor`: `walk.cycle` (the cycle plan's
  walk and its strength days; not `cycle.*`, which smoke.mjs reads as a Learn article), `plate` (the week's food habit), `bed`, `journey.iron`, `preg.due`, `post.rcheck`.
- `when`: `daily`, `periodDays`, `days:a,b` (days of her plan week; 0 is the day she started).
- `if` (an AND list; `!` negates): `route[:r]` (the route has an owner), `early` (under 6 weeks after a birth), `goal:x`,
  `sit:x`, `ans:q=v`.
- Icons: a `S.icon` name, or `ico:move` and `ico:plate` (plan.js's own drawings).

**The engine** (`mods/plan.js`): `progs()` (one entry per plan, at the highest allowed version), `specOf(id, ver)`,
`stepsFor(d, iso)`, `progIf`, `progWhen`, `ADAPT`. `packFor`, `packOf`, `pausedFor`, `packTitle`, `planWeeks`, `ownWeek`,
`docCase`, `screensOf`, `qsOf('day')`, `stepsList` and `actionsFor` now read the spec. A saved plan no spec knows doesn't run.

**For tests:** `S.plan.progs = { list(), spec(id, ver), adapters() }`.

**Her saved plan:** gains `pv` (the version she started). A plan saved before 39.4 reads as version 1.

**The gate** (roadmap: "Golden output byte-identical in both builds"):
- `node test/golden.mjs` replays byte for byte: 31 plans and goals × 8 days. Before the port it was fixed and widened, then
  recorded on the Version 39.3 copy:
  - its summary filter had compared an empty string (`m.mod === 'plan'` now), so the doctor summary is compared too;
  - added, as the roadmap asks: the 3 trying-stage goals that use the cycle plan; pregnancy from weeks 8, 20 and 30; a birth
    in the middle of a pregnancy plan; varied answers (night shift, late bed, level 2, back pain, non-veg, Jain, knees);
    and a tester's build (3 plans).
- `node test/progs.mjs --equiv <dir>` compared this build with the Version 39.3 copy once: 8,854 comparisons, no
  differences. It covered:
  - every plan, goal and stage, with 7 variations of her answers, each day from 30 days before to 70 after;
  - My plan, Today and the summary on 5 days;
  - her plan screen (all 6 cards) for every goal with 7 answer sets.
- `progs.mjs`'s own checks: pure data, the vocabulary, English and Hindi for every word, every route and tile, drafts,
  `d.pv`, and the baseline hash. A live spec's hash covers the spec and the words it shows in both languages, so editing a
  reviewed line anywhere shows; a change re-records it (`npm run progs:record`) and names why.
- Older tests that seeded a plan with pack `'light'` (no plan has that name; Version 39.3 let it "run" with no steps) now
  seed `'pain'` (places.mjs, protect.mjs). No saved plan ever had it.

**Tests:** `node test/progs.mjs` (43 checks).

## 48. Version 39.5: one plan page; plans that carry on (roadmap section 3; journey audit P2-04, P2-07, P2-09, P2-10, P2-15 to P2-17, P2-19, P2-25, MIN-10)

**One page for every plan** (`renderProgramme`, which replaces `journeyCycle` and `renderLight`; design doc 3.3). In order:
- her clock (`.pl-clock`: "Week 3 of 12 · her goal", "Week 18 of pregnancy", "Week 3 after the birth");
- the urgent row (My plan's `recordsRow`);
- the banners (waiting plan, period noticed, paused);
- a hero from the spec (`hero`):
  - `ring`: the cycle plan's week ring, today's yoga and "+ Add minutes", which opens Yoga and moves;
  - `week`: the light plans' days this week, rest days drawn dashed;
  - `timeline`: pregnancy's trimesters, or after a birth weeks 1 to 6, 7 to 12 and months 4 to 12;
- one row for today ("Today's steps · 1 of 3 done today", opening Today) and the check-in button, instead of a second copy
  of Today's controls (MIN-10): the minutes are on Yoga and moves and the food habits on My plate;
- the look-back, then her path (not with a timeline hero);
- the spec's 4 `tiles` (My food or My plate, Yoga and moves, the plan's own tool, My progress with "{n} days so far").
  A tile marked `priv` is hidden on a shared phone, and no tile opens moves in pregnancy or after a birth;
- her last plan, her care team (now ending with Help: danger signs, and who to call), and the settings.

Every plan's results are on My progress (`plan-progress`): the cycle plan's as before, and `lightResults` for the others.

**The spec (R2, still version 1; `progs/baseline.json` re-recorded):** `hero`, `tiles` (4 of `{ go, text, icon, hue, priv? }`),
`rest` (rest days a week), and on steps `grow: 'hold'`, `from` and `check`. `if` gains `birth:a-b` (days after the birth).
Each plan has a `changelog`.

**Plans that carry on:**
- **Rest days:** 2 a week she taps ("Rest day today · 2 left this week" in the check-in). A rest day counts as a day she
  followed her plan (`dayDone`), hides that day's steps and says "A rest day today". On a day she logged pain that stopped
  her day or heavy flow, Today *offers* "Make today a rest day?"; Sakhi never applies one.
- **Welcome back:** after 2 quiet days or more, Today's line says "Welcome back. Nothing to catch up: just today."
- **The hold rule** (P2-07): a light plan's walk (pain, heavy, PMS, trying, midlife, after a birth) grows only after a week
  with 3 days or more (`heldWk`); the look-back then says "the same pace". The cycle plan keeps its approved ladder.
- **"Your plan has changed"** (P2-09): when a pregnancy stops her plan, or her baby's birth ends the pregnancy plan, one card
  on Today and My plan says what she did and offers the plan for her new stage with its goal set ("See my pregnancy plan",
  "See my after-birth plan"). "Not now" puts it away (`d.chg`). A shared phone gets neutral words, on My plan.
- **Her last plan is kept** (P2-10): a plan she replaces or stops goes into `d.past` (the last 5: pack, goal, dates, days
  followed, weeks, and for the cycle plan her last 4 weeks' minutes and the habits she kept). My plan and My progress show
  "Your last plan", and the doctor summary keeps "Before this: …".
- **A fair new 12 weeks** (P2-04): the end page offers "Keep my habits" or "Work on something else". The same cycle goal
  again within 30 days starts at her last 4 weeks' minutes (`d.base`, so day 1 is her level, up to the plan's most) with the
  habits she kept on 8 of her plan's last 14 days still on (`d.hab0`).
- **Pause for a week** (P2-17): in the settings, and in the stop card. Her steps, the plan's cards and the reminder rest for
  7 days (`d.pauseUntil`, `d.remPaused`); Today says "Paused until …" with "Start again now"; then it carries on. After 14
  quiet days, Today offers the pause once ("Take a week off?") instead of the daily restart card.
- **Steps that count from their tools** (P2-15, P2-16): the before-pregnancy checklist, the weekly symptom diary and what
  her pregnancy has due are `check` steps, done in the tool itself (no Done tap); the relief routines and the pelvic floor
  trainer count when she did them there (she can still tap Done). A strength day's Done counts the strength day. The tools
  say so through small read-only APIs: `S.relief.doneOn(id, iso)`, `S.ttc.prepOn(iso)` (ttc.js now keeps `prepAt` dates),
  `S.meno.diaryOn(iso)`, `S.post.pelvicOn(iso)`, `S.preg.plan.markedOn(iso)`.
- **After the birth** (P2-19): days 35 to 42 have "Your 6-week check" (post.js's reviewed line, opening Check-ups and baby's
  vaccines); from 6 weeks the recovery goal moves on to a short walk and the pelvic floor.

**The golden test, re-recorded on this build.** Every difference has a name:
- all 248 snapshots: My plan's page (the one page above);
- 118 snapshots' steps:
  - the light plans' walks hold at 10 minutes in golden's quiet diaries (the hold rule);
  - the trying plan's checklist, midlife's diary and pregnancy's due step are `check` steps;
  - pregnancy's due step says "Check-ups and tests";
  - after a birth, recovery's step after 6 weeks is a walk.

**Tests:** `node test/carryon.mjs` (63 checks). Updated: `pmosplan.mjs` (the minutes and habits on Yoga and moves and My
plate), `goals.mjs`, `companion.mjs`, `records.mjs` (results on My progress, the stage-change card, tool steps), `food.mjs`
(tiles).

## 49. Version 39.6: results and the doctor loop (roadmap sections 2 and 3; journey audit P2-01, P2-03, P2-05, P2-06, P2-11, P2-13, P2-14)

The rule from roadmap section 2 (decision 5(a)): a plan's doctor paths use only her answers, the calendar and her own logged
dates. A health value (pain level, flow, Hb, mood) never decides a doctor card inside a plan; it can only offer a choice,
such as a rest day. Signals from her records live in pillar 1 (`explain.js`).

**The end of 12 weeks (P2-03; "The end sentence").** `renderFinished` shows, in order:
1. her days ("You followed your plan on 77 of 84 days");
2. her result as counts with no judging word (`resultCard`: before and since, from `resultOf`);
3. one card for every woman, "Show this page to a doctor", with buttons for the free government doctor, then "Show my
   doctor" (`report-show`, behind the PIN on a shared phone), then a Qura doctor with her plan as the topic;
4. what next ("Keep my habits", "Work on something else");
5. the details (minutes, food, energy), folded.

`noChange()` is gone: the card is the same for everyone. `resultOf(d)` gives her plan's main measure:
- days between periods (cycle);
- periods that needed a painkiller (pain);
- heavy periods (heavy);
- low days (PMS, and mood after a birth or in midlife);
- the before-pregnancy checklist (trying).

**The month card is the month's summary (P2-13):** her days this month against last month, her result line, and "Your
doctor check is still to do" when her start check isn't done.

**Keep it light (P2-05; roadmap "After the core").** "Keep my habits" sets `d.keep`. After that:
- weekly look-backs run to month 4 (the spec's `keep.weekly`, 17), then one a month;
- "Month 4: your results" comes on Today in week 17, opening My progress, with "Show my doctor";
- the plan closes at month 12 (`keep.until`, 52): "Your year is done";
- the reminder's `until` is month 12 (it had none);
- her clock says "Keep it light".

**A doctor path in every plan that needs one (P2-06, P2-02).** The spec's `doctor` entries:
- `start` comes from her answers. The first entry that matches is the reveal's "First, one check", and from day 2 to 21
  Today's "Did you get the doctor check?":
  - cycle: skipped months or gaps over 45 days;
  - heavy: soaking a pad in 1 to 2 hours, clots, or her periods have stopped; and, new, "often tired or dizzy", with the
    Hb test line and the anaemia page;
  - pain: pain that stops her day, and, new, pain on 4 days or more; both get "Check the signs" (the endometriosis
    self-check, pilot builds);
  - PMS: new, "affects my day a lot", with the mood log.
- `due` comes from her own dates. For trying, months of trying from ttc.js's own rule (`S.ttc.tryingNow()`: 12 months, 6 at
  35 to 39, at once with a reason she ticked) gives "Time for one doctor check" on Today. "Not now" hides it for the month.
- check, go: a self-check, or a page, on the card.

**"Yes, done" (P2-14):**
- the diary's cards about the same thing rest (`S.explain.seenIds`: the gap cards for the cycle plan, heavy flow for the
  heavy plan, severe pain for the pain plan); a period 90 days late or more always shows;
- "What did the doctor say?" comes next, only where an answer has a home already (`SAID`):
  - cycle: "It is PMOS (PCOS)" sets her PMOS line, as Me does;
  - heavy: "My Hb was low" opens her lab results to note it;
  - "Something else" and "I'd rather not say" store nothing more;
- her results and her report say "You told Sakhi you had the doctor check on {d}".

**The 90-day card has a key of its own (found while testing V39.6).** A diary card's key is its id and date. The early "no
period yet" (`watch`) and the 90-day one (`month`) come from the same gap, so they shared a key. Resting the early card
("Got it", or the plan's "Yes, done") also hid the 90-day card for that gap. The 90-day card's key now ends in `:month`.
A woman who had already tapped "Got it" on a 90-day card sees it once more.

**Her report (P2-03):** the plan's section adds what she told Sakhi at the start, her result line, and her doctor check
(done, or "not done yet").

**The Qura doctor buttons (P2-11)** open the call form with her plan as the topic ("My plan (Easier periods): questions" on
her care team and the day-3 card; "…: results" on the end page). Never on a shared phone.

**The companion keeps noticing (P2-01):** each evening's line is the reason of another step she did, in turn; the
look-back names her best step ("Your best step: Calm breath, 7 days.") and gives the tired tip after a low-energy week.

**Pillar 1: her Hb below her own report's range.** `explain.js` adds `hb_low` when her latest Hb in her lab results
(`S.cond.hbLatest()`) is below the range printed on that report, within 6 months:
- "See a doctor this month"; under 7 g/dL (70 g/L), "this week";
- not in pregnancy, which has its own Hb lines;
- the urgency is for the gynaecologist to confirm (wording review 18.2).

**The golden test, re-recorded.** Its two differences:
- the doctor summary carries her result (112 snapshots);
- the new end page (23 snapshots, day 90).

**Tests:** `node test/results.mjs` (44 checks). Updated to this section: `notices.mjs` 3 (the early card rests after
"Yes, done", and the 90-day card still shows) and 6 (the one end card; the kept plan's reminder ends at month 12),
`pmosplan.mjs` 15 and `goals.mjs` 11 ("Keep it light"), and `maths.mjs` (Kamla's sample Hb of 9.8 is under her report's
range, so she gets `hb_low`).

### 47.1 and 48.1 The 24 Oct review of V39.4 and V39.5 (3 reviewers, each finding retried by a skeptic: 33 findings, 27 confirmed, all fixed)

**Safety steps survive everything optional.** The recovery check (`rcheck`), the 6-week check (`six`) and pregnancy's Due now
(`pdue`) are `SAFE` steps:
- a rest day or a check-in no longer takes an undone one off Today (`today()` keeps it);
- the check-in offers no rest button while one is undone;
- pregnancy and the first 6 weeks after a birth (`careTime`) get no rest-day offer (`hardDay` is not asked), no "Take a week
  off?" and no "Pause for a week";
- during a week's pause, `S.plan.running()` is false, so post.js, preg.js and journey.js draw their own cards again.

**Counting and the hold rule.**
- `dayDone` counts a day when a spec step was done in its own tool (`specFlat`: her plan's steps on that day as written, read
  through `fromDone`).
- `holds(d, k)` asks the steps she gets in week k, not the whole spec.
- `preg.plan.markedOn(iso)` counts only an item that was due then, and today only once nothing is left due.

**Pause.** The reminder stays on and its `start` moves to `pauseUntil`, so the phone rings the day the pause ends without Sakhi
being opened. One she deletes during the pause stays deleted.

**Her last plan.**
- `pastEntry`/`endAt`: a finished plan keeps its own last day (12 weeks, or its year when kept); a pregnancy plan ends on the
  birth or loss date; a plan her stage paused, on that date.
- A plan that hasn't started is never archived.
- A plan saved without `pack` (Version 35, the demo sample) is the cycle plan in `archive`, `changedWhy` and the fair restart.
- After a loss, "Your last plan" shows no pregnancy plan.
- The fair restart (`fairOf`) is applied on the plan screen too (`viewOf`), so what she is shown is what Start gives.

**Smaller fixes.**
- "Your plan has changed" after a birth shows only in the first 6 weeks.
- The shared-phone version of that card on My plan offers "Show my plans" and "Not now".
- The 6-week check is a one-time step (`once`, a new step word): done on any day of days 35 to 42, it stays done. It sits after
  her goal's step, so on days 35 to 41 the pelvic floor trainer waits on My plan's tile.
- The trying plan's checklist step rests once every item is ticked.
- The month card opens My progress on every plan. The walk step opens Yoga and moves, except in pregnancy and the first 6 weeks.
- A light plan's end page says "Pick a goal for your next plan." (the carry-over promise is the cycle plan's).
- After the pause offer, a quiet plan's restart card comes on Mondays only. Each new plan gets its own pause offer.
- A plan starting tomorrow offers no pause.
- A woman who read first and joins later counts her days from joining (`state.joinedAs`).

**The golden test, re-recorded** (every difference named):
- the walk row opens Yoga and moves (174 snapshots);
- no "Pause for a week" in pregnancy (56);
- "Pick a goal for your next plan." on 14 light-plan end pages;
- "Your plan has changed" gone 50 days after a birth (3).

**Tests:** `carryon.mjs` section 13 (82 checks in all).

### 49.1 The 24 Oct review of V39.6 (3 reviewers, each finding retried by a skeptic: 30 findings, 20 confirmed, all fixed)

- **"No period yet" (the one P1):** `S.plan.docShowing()` is true only for the cycle plan's own check, so the heavy, pain and
  PMS plans' doctor cards never hide the late-period card (with its pregnancy-test and 112 lines).
- **A kept plan counts its year:**
  - `followedDays` counts to `keepUntil`;
  - the month-4 card, the year-end page ("364 of 364 days") and "Your last plan" agree;
  - the year's end shows on Today once ("Your year is done", `d.yearSeen`);
  - its weeks stop at week 52;
  - "Keep my habits" is not offered once the year can't run;
  - a reminder kept before V39.6 (no end) gets month 12.
- **A new plan starts clean:** `commitStart`, Stop and the plan screen clear `docAt`, `docSaid`, `m4Seen`, `dueSeen` and
  `yearSeen`.
- **Results:**
  - the low-days result is shown nowhere when she logged nothing in either window (My progress uses `resultOf` too);
  - "since" counts from her start;
  - a check marked done before V39.6 (no date) reads "You told Sakhi you had the doctor check." and never "not done yet".
- **The doctor loop:**
  - after "My Hb was low", explain rests `hb_low` for a result dated up to 7 days after the check (`S.plan.saidHbAt`); a newer
    result shows;
  - a tester build stores the answer and stays (the lab tool is held back there);
  - after day 21 the month card offers "Yes, done";
  - `S.ttc.tryingNow()` is null unless she is trying.
- **The Qura buttons** now start the call form from the plan's topic (`mem.acTopic`).

**The golden test, re-recorded:** the low-days result is gone where she logged nothing (9 snapshots).

**Tests:** `results.mjs` section 11 (57 checks in all).

## 50. Version 39.7: knowledge that leads somewhere (roadmap section 3; journey audit P3-01, P3-02, P3-04, P3-07 to P3-09, P3-13 to P3-18, P3-21)

**The article map (P3-01).** Core's `ART` gives each Learn article its tool, its long guide and the questions asked next:
- An article page leads with "Use it in Sakhi" (the tool, the main button), then "The full guide", then "Ask a Qura doctor".
- The answer sheet leads with the tool too.
- A tool or guide shows only where the build shows it (`artOk`): a held-back check or fertile days never appear in a tester build.
- "Also asked" comes from the map. Without an entry, it is the next three in the chapter, not its first three.
- A guide in `GUIDE_ART` ends with "Read it in 1 minute" (its article as an answer sheet), unless the page links it already.
- Modules read an article's title and summary through `S.article(key)`.

**The book (P3-14).**
- Learn opens at her stage's chapter once a session (`STAGE_GROUP`; PMOS opens at PMOS; after a loss, All).
- A tick marks what she has read (joy.js's reads), and each chapter says "{a} of {b} read".
- "Continue reading" (or "Start here") is the next guide in her chapter she hasn't read.
- A chapter ends with "Where to get it free" (Govt. services).
- `learn-<group>` opens a chapter from any link.

**Dos and don'ts (P3-04).** Three new Learn guides:
- `cycle.period-dos-and-donts`, `pregnancy.dos-and-donts` and `pregnancy.after-birth-dos-and-donts`;
- built from reviewed lines, plus 4 new ones (wording review 18.3);
- her stage's guide is the first, wide tile of "Your questions" (never in discreet mode).

**Search in her words (P3-06, P3-17).**
- `ANS_FIRST` puts a quick answer above the results: "kya kare", "precautions" and the like give her stage's dos and don'ts;
  "safar", "travel" and "sex" (pregnant only) give the pregnancy one; "jaapa" and "sawa mahina" the after-birth one; "safe days"
  the fertile-day guide; "tanke" the first six weeks; "sonography" the four check-ups.
- New `TOOL_SYN` rows cover Kilkari, Poshan, "9 tarikh", ₹5,000 and ₹1,400, "chutti", "breast lump", "pap smear", "tika",
  "gharelu" and "jaapa".
- For a woman of 20 or more, the girls' pages come after the rest (never dropped).

**One danger list (P3-15).**
- Core's `DANGER.preg` is the reviewed "Your four check-ups" list. `S.dangerLine('preg', lang)` gives it as one sentence.
- Help's Call-112 line, the family check-ups card, the husband's weekly card and the husband's page all read it.
- The symptom guide's pregnancy "Today" lines no longer repeat a sign the list carries.
- The crosswalk is wording review 18.3.

**One myths deck (P3-15, P3-16).**
- joy.js's Sach ya Myth cards are the deck: `S.joy.deck(topic)` gives the `period` or `contra` cards.
- The periods myths page is a view of it; its own 6 myths joined the deck.
- The contraception hub gets "Worries and facts": the deck's contra cards folded, including 5 worries (3 new lines need review).

**A weekly "Did you know?" (P3-02).**
- joy.js's card comes once a week, on a new hook, `homeLast`, after setup and Coming up. Each module's slot card now counts on its
  own in "More from Sakhi (n)".
- It is a Sach ya Myth card she hasn't answered. She answers it there and it rests until next week.
- Never on a shared phone, after a loss, or without a diary.

**Why it helps (P3-02).** A plan step's reason links its Learn guide (plan.js `WHY_ART`), on the plan's steps card and after
the check-in. Never in discreet mode.

**One family page (P3-18).**
- "For my family" (was "Explain it to my family"). Her stage's cards come first, the husband's page's sections among them as
  cards (`S.access.partner()`); the rest fold under "More cards (n)".
- The trying card opens his page.
- The partner page and the trying-partner page keep their routes but no longer have tiles.

**Help's three tabs (P3-21).** By urgency (Help), By body part (the symptom guide) and Screening signs, each shown where the
build shows it. In a tester build: Help and Screening signs. Screening signs moved under Help (`place: 'help'`).

**Topics and free care (P3-13).**
- `TOPIC_ARTS` puts an article in a second topic: loss, after the birth, contraception, girls, pregnancy test, screening.
- Govt. services lists "How to use free care" (3 guides).

**Schemes (P3-07 to P3-09; every amount checked at the official source, wording review 18.3).**
- PMMVY has "Part 1 received" and "Part 2 received". From 14 weeks after the birth, a line and a reminder (`access-pmmvy2`) name
  the second part.
- The finder takes "pregnant" and "a baby this year" from her diary, with "Answer these myself"; answers are still not saved.
- Govt. services opens her stage's schemes page.
- A "Free and ₹6 pads for girls" card. JSY is on the after-birth list. Ni-kshay (TB) is only on the genital TB page.
- Kilkari is on the pregnancy plan's scheme item.
- The dead Today-for-you, videos and stories code is gone (the dengue and heat cards with it).

**Not built (decisions for Mohit):** saving the finder's other answers (`ration`, `card`, `child`: they are kept off the phone by
design); the JSY amount by her state (no PIN-to-state table on the phone yet); the guides' re-layout to the Learn template
(P3-19) and the CBT courses (P3-20, programmes).

**Tests:** `node test/knowledge.mjs` (101 checks).

### 50.1 The 25 Oct review of V39.7 (3 reviewers, each finding retried by a skeptic: 36 findings, 31 confirmed, all fixed)

**The danger list.**
- FACTS-01, KNOWLEDGE-01 (P1): the husband's danger signs were English in Hindi text and in the WhatsApp share. The language
  now reaches `S.dangerLine(k, lang)`. The husband's pregnancy card is built when shown, not when access.js loads.
- FACTS-02 (P1): Marathi, Bengali, Tamil and Telugu kept an old five-sign Call-112 line without fever and swelling. Those
  lines are gone, so each language falls back to the one list (Hindi for Marathi, English for the rest).
- Core's `hiWords()` (her language or its fallback is Hindi) picks the list's words for Help's pictures and the line. Hindi
  joins the last sign with ", या", as the reviewed four check-ups line does.

**Schemes.**
- FACTS-05: the Learn schemes guide's PMMVY bullet now matches the checked card (one check-up within 6 months; a second
  child registered in pregnancy; PM-KISAN in her own name; women already on paid maternity benefit excluded). Its FAQ
  source is the PMMVY portal; the old link fails its certificate check.
- FACTS-06: the finder works out "pregnant" and "a baby this year" on every render. They are never written into the
  session's answers, so a stage change in the same session shows at once.
- FACTS-07: the PMMVY reminders are checked on Today once a day, and when the birth date changes.
- FACTS-09:
  - "Apply now" needs a recorded check-up within 182 days of her last period.
  - The claim asks "First or second child?" (`c.second`). A second child has no 270-day deadline, no reminders for it
    and no second part; it is paid once.
- FACTS-11: the girls' pads card is never "For everyone".
- FACTS-12: a claim tracked before V39.7 (Ni-kshay) keeps its card on the all list, so she can update or stop it.
- FACTS-08, KNOWLEDGE-06: the Hindi pads line is whole again.

**Search and the guides.**
- KNOWLEDGE-02: in pregnancy, a typed danger sign makes the danger-signs guide the quick answer (`dangerQ`).
- KNOWLEDGE-04:
  - Vaccine words lead with the HPV vaccine, except in pregnancy (check-ups) and after a birth.
  - Scan words count only in pregnancy.
  - "kilkari" leads with the pregnancy plan's scheme item.
  - Phrases match whole words ("9 tarikh" is not "29 tarikh").
  - `TOOL_SYN` rows take a 4th field, the stage: `preg`, `post` or `other`.
- KNOWLEDGE-07: only the girls' own pages go last; For my family is for everyone.
- KNOWLEDGE-08:
  - A stage she types picks the dos and don'ts ("pregnancy me", "delivery ke baad").
  - Midlife has no dos-and-don'ts tile or answer.
  - Within 6 weeks of a loss, the quick answer is the loss guide.
  - "nahana" is not a pregnancy question.
- KNOWLEDGE-03: reading a guide about loss, abortion, violence or danger signs is quiet (`quietRead`): the petal counts, with
  no celebration.
- KNOWLEDGE-05: a page without a tile is named by its own string (`ttc-partner`). A tool or guide button without words is
  never drawn.
- KNOWLEDGE-09: `S.redrawn(v)` gives a module that redraws its own page core's rows back (the 1-minute row, Help's tabs,
  speakers, jump chips). Help's tabs share the width at 360 px (`dtabs`).
- KNOWLEDGE-10, FACTS-04:
  - "Why it helps" fits her plan. No exercise guide in pregnancy or the first 6 weeks after a birth (after the birth: the
    first six weeks).
  - The calm step's guide is midlife's for the midlife plan, the first six weeks after a birth, and none in pregnancy.
- KNOWLEDGE-11: after a birth, Learn's "Start here" is the after-birth guides.
- KNOWLEDGE-12: the folic-acid article's tool is the before-pregnancy checklist.

**The plan engine.**
- FIXES-01: one bleeding map until the next save. `dayDone` reads the spec only for plans with a step that counts from its
  own tool (`hasFrom`). The plan screen's fair restart reads her last plan only when it can apply.
- FIXES-03: a pause moves the reminder's start (`remPaused: 'start'`), and ending it leaves her own on/off choice alone.
- FIXES-04: after Stop, Start gives the fair restart the plan screen promised.
- FIXES-05: in pregnancy, PMSMA doesn't hold back today's count, and a past day uses its own pregnancy week.
- FIXES-06: on a shared phone, "Your plan has changed" has one pick button.
- FIXES-07: "My Hb was low" is kept with past plans (`hbAt`); `S.plan.saidHbAt()` reads the latest.
- FIXES-08: a kept plan's report stops at its year's last week.
- FIXES-10: the finished checklist rests its step from the day after the last tick (`S.ttc.prepLast()`).
- FIXES-11: the call form follows the topic she tapped last.

**Older bugs the checkers reproduced (not caused by V39.7), fixed too.**
- FIXES-02: a kept after-birth plan's year stops at the baby's first birthday (`keepCap`), so it ends with its end page.
  Keep isn't offered when no time is left.
- FIXES-09: a pause in her first 3 days lets Today's cards back (`early()` and `leads()` skip a self-paused plan).

**Not changed.**
- FACTS-03: "the baby moving less after 28 weeks" is the reviewed list (wording review 18.3).
- FACTS-10: the Copper-T line is on the doctor's list (18.3).
- FIXES-12: a pause saved by V39.6 can't exist; no V39.5 or V39.6 build was installed.

**Tests:** `node test/knowledge.mjs` section 14. Each of its checks fails on the V39.7 copy and passes now.

## 51. Version 39.8: pictures first (roadmap section 3; diet audit 4.1 to 4.9, VD-01 to VD-03, VD-08, VD-10 and section 5)

**The drawings (art.js).**
- 45 food and kitchen drawings (`S.art.food(key)`, `S.art.hasFood(key)`) and 11 danger signs (`S.art.sign(key)`), in the
  existing 64 x 64 style. Their colours are `--art-*` tokens, so both themes work. All in one file (about 52 KB).
- Every food on My plate has its own drawing. food.js's `ART_RULES` picks it by group (the earliest match in the English name
  wins); `S.food.artOf(x)`.

**Food as pictures (food.js).**
- `S.food.tile(x, mark)`: a picture tile with the food's name and a mark as well as the colour (✓ more often, – less often,
  ✗ not at all). Each mark has a spoken name.
- `S.food.strip(items, title)`: a "Foods that help" strip. The names come from the page's own reviewed text, and it has a
  speaker.
- `S.food.mark(type)`: the marks on how she eats (a green dot for vegetarian and Jain, a brown triangle for fish or meat, an egg).
- My plate shows the foods as tiles (one column under 420 px, two above) and the diet chips with their marks.
- Strips on anaemia, 40+ bones, pregnancy food and fasting (`cond.js`, `meno.js`, `preg.js`, `periods.js`). My food's rows
  each have a drawing.

**The plate she can tap (plan.js `thaliCard`).**
- "What was on your plate today?": she taps the 4 parts (sabzi, dal or protein, roti or rice, the bowl), and the drawing
  fills in.
- One line names the first missing part ("Next meal, you could add …"), from the plate's reviewed words. With all four: "A
  full plate today." No score.
- Only today's ticks are kept (`d.thali = { d, on }`), on the phone. Her plan's log is untouched.

**Today (core).**
- While her plan runs, the cycle card is one line (a small ring, "Cycle day N ›" to her cycle, and Change stage, as fixed in
  51.1), so her 3 steps fit on the first screen at 360 x 800.
- The estimate line stays when her likely days show on the week strip. A late period keeps its line.
- Never in discreet mode.

**The plan (plan.js).**
- The plan screen has one picture per step, its reason behind "Why?", and the day as 3 pictures (Done, the check-in, Sakhi
  answers). The footnote shows once, on the Start screen.
- Joining has a picture on each goal row and the marks on how she eats.
- The check-in draws ✓ Done, ½ Partly and ✗ Not today beside the words.
- The weekly look-back's energy has a face (Low, Okay, Good), on My progress too.
- My progress shows the 12 weeks as bars, the weeks to come as outlines, and "Your first bar fills in as you follow your plan
  this week." instead of an empty chart.
- The iron food step has a leaf, not a drop.

**Help, the guides and Explore (core).**
- Help's "Call 112 now" card shows the pregnancy danger signs as 7 pictures (`dangerGrid`), with `DANGER.preg`'s reviewed
  words under them, in the card's own text colour. They are the same for everyone, on a shared phone too.
- A speaker on each card (`data-say`, core's `sayButtons`) reads only that card: Help's cards and the food strips.
- An article opens with its chapter's picture and a Listen button.
- Explore's quick answers for Period pain, Heavy periods, Tablets, PMOS food and Bones have their own drawing. Danger signs
  keeps the Help shield.
- Iron tablets has the tablet and the strip drawn.
- A long page that leads with safety lists its sections as chips at the top, named by its own headings (`data-jump`, core's
  `jumpRow`): anaemia and fasting.

**Hindi type.** Small text, food names and the "Why?" lines are 15 px with a line height of 1.65.

**The picture check (core, `pic-check`; pilot and demo builds only).** For the field-test coordinator:
- each drawing alone, its name hidden until asked;
- "Named it" or "Not quite", and her answers at the end to write down.
- Nothing is saved or sent. A release or tester build has no link, and the address goes back to About.

**Phones (Mohit, 25 Oct: "build it for newer phones").**
- The APK needs Android 10 or newer (min SDK 29), the oldest Android whose Chrome and WebView Google still updates.
- No workarounds for old WebViews.
- `build-apk.sh` refuses an APK over 30 MB unless `MAX_APK_MB` is raised on purpose.

**New words:** captions and labels only (wording review 19.8). The danger words, strips and plate lines are reviewed lines.

**Not built:**
- "3 things to remember" on each article (new health wording for 72 guides).
- Calcium as "katoris a day" (it needs Dr. Megha's kitchen measures, V39.9 and food track F1).
- Recipes and "My day of meals" (food tracks F1 and F2).

**Tests:** `node test/pictures.mjs`.

### 51.1 The 25 Oct review of V39.8 (3 reviewers, each finding retried by a skeptic: 26 findings, 21 confirmed, all fixed)

**Help in every language (SAFETY-01, PICTURES-01, REGRESSIONS-01; P1).**
- Marathi, Bengali, Tamil and Telugu each have the 7 danger signs in their own words, in `DANGER.preg`'s order (lang.js
  `dg_w`, `dg_preg`, `s1c`). 5 reuse each language's earlier words; fever and swelling are added.
- Core's `ownWords()` gives Help's pictures, their speaker and the Call-112 line her own words. The symptom guide reads the
  same `s1c`.

**Today's one-line cycle card.**
- SAFETY-03, PICTURES-02, REGRESSIONS-03: one row: "Cycle day N ›" opens her cycle (its name for a screen reader: "See my
  cycle"), and "Change stage" (`#stage-btn` and its tour) sits on the right. When fertile days show it keeps today's
  chance, and the estimate line goes under it.
- PICTURES-10: the ring tour waits for the full card.
- REGRESSIONS-08: the one-row card and 44 px quick-log circles while a plan runs. The greeting by name stays (V37). All 3
  Done buttons sit above the tab bar at 360 x 800, in English and Hindi (since 52.1, except on a day the card shows today's
  chance).

**Food pictures.**
- SAFETY-02, PICTURES-05, REGRESSIONS-06: a strip item is `[drawing, name, flags, pregnancy name]`, with the foods table's
  flags. Strips follow how she eats (no milk foods without milk; no sprouts for Jain) and show the pregnancy name ("Sprouts,
  cooked"). My food's calcium row draws ragi for a woman who takes no milk.
- PICTURES-06: pregnancy food's "1 roti + 1 katori dal + 1 glass milk" shows from week 13, and never with milk for a woman
  who takes none.
- SAFETY-06, PICTURES-04: `ART_FIRST` puts a dish before its ingredient (upma, bhakri) and less of a food before the food
  ("Less rice, more dal" is dal). Sweets are a laddoo, a new drawing, not the gur block that means "helps" on the anaemia page.
- The danger drawings: the "moving less" arrow is red, the hair has an edge, and the water drops and the bolt are outlined
  (a new `--art-water-2`). The skeptics found them visible already; the outlines stay.
- The plate she taps fills in its colour, and an empty part is a dashed outline.

**Speakers and targets (PICTURES-08, PICTURES-09).**
- A second card's speaker stops the first and reads its own card. The one reading shows a stop icon and `aria-pressed`, and
  lang.js clears it when reading ends (`S.reading()`).
- The danger grid's and the strips' speakers sit beside their heading, not on a drawing.
- An article's picture and Listen aren't read aloud.
- Speakers, "Why?", and the picture check's Skip and Back one are 44 px targets.

**The picture check and the build.**
- SAFETY-04, PICTURES-03, REGRESSIONS-05: its answers read "Named it", "Not quite" and "Skipped".
- It now has all 61 drawings a food screen can show (PICTURES-11, refuted as documented, added anyway).
- SAFETY-07: `build-apk.sh` checks `MAX_APK_MB` is a whole number before building. It checks the size before the new APK
  replaces the last good one, so that APK and its version code survive.

**Tests.** REGRESSIONS-07: companion.mjs reads the reasons behind "Why?" too. pictures.mjs section 16 has a check for each
finding; every one fails on the V39.8 copy and passes now.

**Not changed.**
- REGRESSIONS-02: the countdown and range on the one-line card are the design; the chance line is back.
- REGRESSIONS-04: the two Hindi cards were already folded in English. The fold height still allows for Hindi's larger type
  (391 px), and the kick counter's doppler card and the loss page's accordions never fold.
- SAFETY-05, PICTURES-07: the drawings were visible at phone density; the outlines were added anyway.

## 52. Version 39.9: food steps that change (roadmap section 3; diet audit sections 2 and 3, 3.6 to 3.8)

**Her foods for a step (food.js).** `S.food.pick(tag, o)` gives her foods with a tag (`i` iron, `c` calcium):
- her region's foods first (`o.region`), then the national list;
- only foods that fit how she eats (vegetarian, eggs, fish or meat, Jain, no milk);
- one entry per name, in her language (the pregnancy version in pregnancy).

**The steps (plan.js and progs/v1.js).**
- **Iron:** after the journey's 21 days, "Today's iron food: {x}" changes day by day over 7 of her foods (`ironRot`). The
  line under it is "Eat it with lemon, amla or guava." Amla on its own is never the food of the day. The heavy-periods plan
  and pregnancy's iron goal use it.
- **An earlier habit, once a week:** on the 5th day of a plan week, once she has two habits or more, the food step brings
  one of her earlier habits back: "Still doing half the plate sabzi?". It ticks that habit for the day.
- **Calcium for 40+ bones:** a new adapter `food.calcium` on plan days 1, 3 and 6 of each week (`days:0,2,5`), goal bones
  only: "Today's calcium food: {x}", opening "Calcium from your kitchen".
- **Pregnancy food by trimester:** a new adapter `preg.food`. The food step is "This week: {heading}" with its first
  sentence, from the pregnancy food page's reviewed lines (`S.preg.foodTip(week)`). In the first 3 months it starts with
  "no extra food is needed"; from the 4th month, with the 350 extra calories. Then protein, iron with vitamin C, calcium,
  and salt and water, week by week.
- **Breastfeeding:** a weekly step "Food while you breastfeed" (plan day 3 of each week, `sit:breastfeeding`), opening the
  feeding page's new card (open): water at every feed, the meals, laddoos and panjiri in small helpings, never cutting out
  water, fruit or vegetables, and herbal powders only after asking a doctor.

**Fasting (plan.js; diet audit 3.6 and 3.7).**
- `d.fast[iso]`: the days she fasts, on the phone only, cleared after a week.
- On a fasting day, her food steps (`food`, `iron`, `ca`, `bfood`) make way for one step, "On your fast today" ("A proper
  sargi or sehri, water when you can, and break the fast gently"; in pregnancy or while breastfeeding: "Talk to your doctor
  before a fast without water"). It opens the fasting page. A fasting day she ticks counts as a day she followed her plan.
- My plan's today row has "Fasting today?" (and "Not fasting today" to take it back); Today keeps to her 3 steps. The evening
  check-in asks "Fasting?": today or tomorrow. Never on a shared phone, and never during joining; nothing about it leaves
  the phone.
- The fasting page has a new section, "If you are pregnant or breastfeeding": talk to the doctor first, sehri, iftar, water,
  the signs to break the fast, and "if the baby moves less than usual: break the fast and go to hospital now".
- Its vrat food now starts with kuttu or singhara roti with curd, and goes easy on sabudana and aloo with PMOS or sugar in
  pregnancy.
- The pregnancy food page and the feeding page link to it.

**Engine vocabulary:** 2 new adapters, `food.calcium` and `preg.food` (test/progs.mjs knows them). Baselines re-recorded
for preg, post and meno.

**Golden, re-recorded (41 differences, all named):**
- the iron rotation (16): the cycle, midlife and non-vegetarian heavy-periods plans, and pregnancy's iron goal, from day 27;
- the pregnancy food step by trimester (24): every pregnancy food plan (from week 17, week 8 and the tester build), every day;
- the calcium step (1): midlife bones, day 1;
- then 131 days where My plan's page text gains "Fasting today?" (re-recorded after the link moved off Today).

**New words:** labels, plus about 20 lines of new food and fasting advice (wording review 17.4). Pilot builds carry them;
they wait for the doctor and Dr. Megha.

**Not built:**
- Kitchen measures ("a katori of dal") and "My day of meals": they need Dr. Megha's measures (food track F1).
- The optional "I keep fasts on some days" question after day 3 (diet audit decision 5, still open).
- Recipes and the weekly thali (F2).

**Tests:** `node test/foodsteps.mjs` (88 checks, with section 8 for the review below).

### 52.1 The 25 Oct review of V39.9 (3 reviewers, each finding retried by a skeptic: 23 findings, 20 confirmed, all fixed)

The 20 confirmed findings come to 16 distinct fixes once duplicates are merged (SAFETY-01 is FIXES-01; SAFETY-04 is
FOOD-08; SAFETY-06 is FOOD-05).

**The dos and don'ts she asks for (SAFETY-01, FIXES-01; P1).** V39.7's typed-stage rule read "pregnancy" and "period"
anywhere in her words, before her own stage and before a loss. `dosKey` now goes in this order:
- Care after a loss or an abortion ("garbhpat ke baad", "गर्भ गिर गया", "pregnancy loss") is the loss guide.
- Asking for an abortion gets no guide, so the tools lead. In pregnancy, a loss happening now is the danger guide.
- Contraception ("गर्भनिरोधक गोली भूल गई", "pregnancy rokne") gets no guide.
- Within 6 weeks of a loss Sakhi holds, the loss guide.
- "Pregnancy ke baad", "after pregnancy" and "delivery ke baad" are the after-birth guide.
- "To get pregnant" ("pregnant hone ke liye") gets no guide.
- A stage she names ("pregnancy me") is that stage's guide.
- In pregnancy, period words ("period jaisa dard") keep her pregnancy guide.

**The danger guide in search (SAFETY-02).**
- Blood words are bleeding only outside a test or anaemia question: "khoon ki kami", "blood test", "blood group",
  "blood sugar" and "BP" don't count, but "khoon aa raha hai" still does.
- A severe headache (with a word for severe, or the eyes) and the baby moving less ("bachcha kam hil raha hai", "हलचल
  कम") count. These are 2 of Help's 7 signs that were missing; the gap was older than this diff.
- In pregnancy, words about her baby's movements lead with the kick counter, not trying for a baby.

**Search and the call form.**
- FIXES-03: tool phrases match with a "?" or "।" after them ("9 tarikh?").
- FIXES-08: a "Speak to a doctor" button with no topic keeps the words she typed in the call form.

**Schemes.**
- FIXES-02: Today and the schemes pages move only a PMMVY reminder's dates; one she switched off stays off.
- FIXES-05: for a second child, no "first part (₹3,000) now" line. Only this pregnancy's check-ups count (0 to 182 days
  after her last period).
- FIXES-05: in a new pregnancy, an older baby's birth gives no past "Register by" date and no "second part" (`claimBirth`).
  The finder still reads the real birth for "a baby under 1".

**The plan engine.**
- FIXES-04: a pause moves only the reminder's start, even after she changes her check-in time during it, and ending the
  pause never switches it on.
- FIXES-07: an after-birth plan at her baby's first birthday ends and is kept as "Your last plan" (`closePlan`, also used by
  Stop). Its end is the birthday at the latest.
- FOOD-05: "Still doing …?" brings back the habit that left Today last, then each earlier one in turn. All 5 come back in
  12 weeks.
- FOOD-06: a step whose title changes daily has a steady name for summaries: "An iron-rich food today", the week's newest
  habit, "Calcium from your kitchen, for your bones", and the pregnancy food tile. The plan screen says "3 days a week" for
  a step on some days (`plan_pi_days`). Pregnancy food reads the week of the day it is for.
- FOOD-07: the calcium food goes through her foods by calcium day, so a week has no repeat when she has 3 or more.
- FOOD-04: each trimester opens with how much more to eat (weeks 14 and 28: the 350 extra calories). The middle months now
  include iodised salt and water.

**Food while she breastfeeds (FOOD-02).** The weekly step now comes before the pelvic step, so it shows from week 1. In week
6 the 6-week check comes first for the feed, mood, sleep and weight goals. Its link opens the feeding page at its card, open:
a step's `at`, a Today row's `data-go-at`, and the page's `data-at` (core scrolls there after drawing). progs.mjs knows
`at`.

**Fasting (FOOD-01, FOOD-08, SAFETY-03).**
- In pregnancy and while she breastfeeds, "Fasting today?" and the check-in's chips come on every day of her plan, so the
  doctor line ("Talk to your doctor before a fast without water") always reaches her. With no food step to swap, the
  fasting step takes a free slot, or the last step that isn't a safety step (never the recovery check, the 6-week check or
  Due now).
- The check-in shows a chip only for a day it changes.
- Old fasting days are cleared on Today once a day, not only when she taps a fasting control.
- On Today the fasting step shows only its doctor line. Her fasting tips ("On your fast today: a proper sargi or
  sehri, …") show on My plan, under the fasting link.

**Today at 360 x 800 (FIXES-06, SAFETY-03).**
- The one-line card's late line and today's chance span the card under its row.
- Today's rows and the quick-log circles are a little tighter. The plan's name and count each take one line, with the
  check-in time under them.
- Her 3 Done buttons now sit above the tab bar on the trying plan, on a late period and on a fasting day, in English and
  Hindi.
- On a day the card shows today's chance (pilot builds, steady cycles), the chance and "not a way to avoid pregnancy" come
  first, and the third step is a short scroll away (the second too in Hindi). This is deliberate: the estimate line stays
  whole, beside the chance it qualifies.

**Not changed (refuted as documented):** FOOD-03 and SAFETY-05 (the pregnancy food step's lines are the food page's own
reviewed lines for every diet), and FIXES-09 (girls' pages last for a woman of 20 or more: V39.7's rule, unchanged here).

**Tests.** foodsteps.mjs section 8 has a check for each finding; every one fails on the V39.9 copy and passes now. Its
section 4 follows the trimester order, and the fasting check in section 6 now clears the day it set. Golden and the plan
baselines are re-recorded, with the differences named below.

**Golden, re-recorded again (62 differences, all named):**
- the pregnancy food step's trimester order (17): the pregnancy food plans from week 14 (week 17, week 8 from day 55, and the
  tester build);
- "Fasting today?" on My plan (45): pregnancy plans with no food step (mood, nausea at week 20, sleep at week 30) and the
  after-birth plans while she breastfeeds (recovery, feed, weight).

The plan baselines are re-recorded for preg, post, ttc, heavy, meno and cycle (their changelogs' R4 entry; post's step
order and `at`).

**The check of the fixes.** A second review read only these fixes. It stalled after about 35 minutes, and its two finds were
fixed and tested inline:
- "Still doing …?" picks the earlier habit asked longest ago (`stillPick`), with one that just left Today first. All 5 come
  back after a fair restart (`hab0`) too, and in a kept year.
- An after-birth plan's end (`endAt`) is never later than the baby's first birthday, even when she opens Sakhi months later.

Both checks are in foodsteps.mjs section 8. Each fails on the earlier fixed copy and passes now.
