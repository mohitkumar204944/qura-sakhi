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

## 53. Version 39.10: joining that personalises Sakhi; a first day that starts with the diary (Mohit, 25 Oct)

Mohit's request: joining should learn her stage and goals and shape the whole app, the way HealthifyMe does, and she should
no longer see "too many things, not knowing what to do". After joining: Today, a short tour, then Diary, where she starts
logging and hears why. Her plan comes after that first log. The design was approved on the canvas
(claude.ai/artifact/Psm8Y1BNf92T2d7qj2Ecxw), with his answers to every design question (25 Oct).

**Joining (app.js `renderOnboard`, `finishOnboard`).** The welcome has one way in (Start); "I just want to read" is gone.
Then 5 screens:
1. **About you:** her first name (optional; it fills sign-up's "Almost done"), then her age as a decade, then the year (the
   month only at 18). Under 18: the girls' reading path (`mem.under18`), with no account.
2. **Her stage:** 7 tiles in life order (`OB_TILES`). They are Regular periods, PMOS (PCOS / PCOD) / Irregular periods, Trying
   for a baby, I am pregnant, Recently had a baby, Periods changing after 40, and Menopause. Sakhi's stages (`OB_ENGINE`) are
   cycle, cycle, ttc, preg, post, meno and meno; Menopause sets `situation.stopped`.
3. **Her goals:** up to 3 from her tile's list (`OB_GOALS`), numbered in the order she picks them.
   - A 4th is refused with a line, and "Just tracking" stands alone.
   - Period pain, heavy periods and mood before periods are under both period tiles.
   - Her first goal chooses her plan; the others shape Today's tips and Explore.
4. **A few details, only what her stage needs:**
   - Periods, PMOS, trying and after 40: her last period (a guess is saved as a guess) and the usual gap (not after 40).
   - PMOS also asks "Has a doctor said you have PMOS (PCOS)?". Yes writes `situation.pcos`, and her goal "irregular" becomes
     "pmos".
   - Periods and PMOS also ask the V39.0 pill question.
   - Pregnant: her due date or last period (or later). After a birth: the birth date and breastfeeding. Menopause: when her
     periods stopped (chips, no date).
5. **Who uses this phone?** Unchanged (the shared-phone kit).

`finishOnboard` saves:
- `state.dob` and `state.situation`;
- `state.goals`: her stage token first, then her goals (`goalsList`);
- `state.focus` `{ tile, goals, at, lp }`;
- `state.intake` `{ at, stage, goal (her first), gap, dx, stopped }`;
- her last period as an event, and `state.fullTour` `{ st: 'first' }`;
- `prompts.planOffer`, when her first goal has a plan (`packFor`).

No plan is made while joining (no `startFromIntake`). `mem.ob` is still kept in localStorage, so joining survives a restart.

**"Your Sakhi", after sign-up (route `your-sakhi`, no tab bar).** It shows:
- her name, and her stage and goal chips;
- 3 rows on how Sakhi helps, by stage: logging, Today, and her plan (or Learn when her goals have no plan);
- "Out of your way: …" (the stages hidden), with "Change your stage any time in Me".

"Show me around · 30 seconds" starts the first-day tour; "Skip the tour" goes to Today. Both mark Today's own tip done. A
shared phone in plain words skips this screen (Today first, the PIN first).

**The first-day tour (`TOURS` `first-day`, kind `first`).** 3 steps on Today: her day (the Today card), My plan and Explore
(the tab bar), and Diary. Its last button, "Start my diary", opens Diary (`def.doneLabel`, `def.done`). It is not part of
the full tour or the tours menu; the full tour stays in Me > How to use Sakhi.

**Her first log (Diary, `firstLogCard`).** It shows at the top of Diary while `firstLogDue()`: she joined with Version 39.10
(`state.focus`), has no first log yet, isn't a sample, and the phone isn't shared in plain words.
- "Why log every day?": 3 numbered reasons for her stage.
- Periods, PMOS, trying and after 40: her last period (Change opens the period log), how many days it lasted (3 to 7+; saves
  the end), today's signs (cramps, acne, low mood, tired, nothing), and "Save my first log".
- Pregnant, after a birth, menopause: one button to her stage's own log (this week, the recovery check, the menopause diary).
- Diary's own tip and the + button wait while it shows (`URGENT` holds `#fl-card`).
- Whatever she logs first counts (`noteFirstLog` in `save()`). That is a day's signs, a note, a check-in, or a period date
  after joining, but not the date she gave while joining.
- A woman whose diary already had entries when she answers the Today card gets no first-log card.

**Her plan, after her first log (plan.js `offerCard`).**
- The card says "Ready for you", with the name of her first goal's plan, "Made from your answers and your first log", and
  See my plan or Later (3 days).
- It leads "Sakhi says" (`leads()`), and Today's tips wait while it is up (`S.plan.offering()`).
- See my plan opens the plan's own questions from screen 2 (`S.mem.planIntake`, `iq: 1`). The gap and the PMOS answer from
  joining are not asked again (`known`), unless she taps Change on the summary (`edit`).
- Then the V37.1 cards and Start, unchanged.
- While she sets it up, petals wait for her first check-in (`holdJoy` on `plan-goal`, `plan-reveal` and `plan-start`).
- If the app restarts during the plan's questions, she starts those 2 or 3 screens again from Today's card.

**Today.**
- At most 3 steps besides her tablets and reminders.
- In her first 30 days, before a plan, Today has "Log today" (periods-type stages, until she has logged today) and one read
  for her stage (the first she hasn't read).
- Today's own tip skips its "Your plan for today" step when Today holds only these rows (`firstDaysOnly`).

**Explore and Learn: other stages out of her way.**
- Explore shows only her stage's topics (`STAGE_TOPICS`); "All topics" is gone.
- Learn shows her stage's chapters and the ones for every woman (`LEARN_OK`), and Contents counts what she sees.
- A shared phone keeps the full grid and every chapter. Search still finds everything.
- Safety stays within 2 taps. Help (on every screen) holds 112, "Is someone hurting you?" and, new, Pregnancy loss
  (`#hs-loss`). STIs and safety are under Explore > Intimate health. Abortion is under Explore > Missed period in every stage
  but pregnancy, where search finds it.

**Women who joined before Version 39.10.**
- A card on Today, in its own row, not in "Sakhi says": "Tell Sakhi your stage and goals". It shows once.
- It opens the stage tiles (route `join-update`), then her goals (her old ones ticked), then the PMOS question on that tile.
- Her diary and her plan are untouched; a running plan keeps its goal first. Picking another stage opens the stage change
  sheet. "Not now" hides it for good.
- A stage change in Me asks again (`state.focus` is cleared).

**State.** `state.focus`, `prompts.planOffer`, `prompts.firstLog`, `prompts.planOfferNot` and `prompts.exAsked`. No new server
fields and nothing new leaves the phone; sign-up's name field is filled in from joining (`aboutOf`).

**Strings.** About 120 new English and Hindi keys (`ob_*`, `ys_*`, `fd*`, `fl_*`, `td_*`, `fx_*`, `plan_off_*`). The new health
lines are in the wording review, section 19.10: what each goal gives her (`ob_gs_*`), the "why we ask" lines, and the
reasons to log. Pilot builds carry them; they wait for the doctor.

**Tests.**
- `node test/joining.mjs`: 297 checks, including all 7 stages in English and Hindi at 360 px, the goal rules, a shared phone,
  a girl under 18 and a woman from before.
- `test/join.mjs` is the shared joining helper; signup, tours, firstday, companion, goals and protect use it.
- places and knowledge follow the new Explore and Learn.
- firstday-walk: the distinct screens before Today went from 20 to 11, and joining itself from 9 screens to 5.

## 54. Version 39.11: the diary's day page, a private sex log, the Cycles tab (Mohit, 25 Oct)

Mohit shared another tracker's screens and asked what our diary lacks. Of the 6 gaps found, he approved all 6, including the
sex log and the Cycles tab, and the mockup (claude.ai/artifact/MWM56ZYQU4GoBh3esJavbJ), then "go with your recommendations".
Principle-level only: nothing was copied from the other app.

**The day page (`openDay`).**
- **A week at a time.** The arrows move 7 days (never past today, never more than 90 days back). Under the date sits the week,
  Monday to Sunday (`dayStrip`), with her marks: period, spotting, fertile window, ovulation and symptom dots. Tapping a day
  opens it in place. Tapping the date opens that month in Diary.
- **The day's facts** (`dayFacts`, shared with the Days tab). These are the day of her period or cycle, the fertile window
  and ovulation (estimates, only where fertile days show), the chance of pregnancy that day, and the days to her next period.
  "Tomorrow" replaces "in 1 days". There's no card for a day that isn't a cycle day (pregnancy, after a birth, a pause). A
  shared phone keeps "Cycle day N" only.
- **Flow in one tap** on every bleeding day (`flowTiles`, `setPads`). There are 4 tiles by pads in the day (1–2, 3–5, 6 or
  more, soaked one every 1–2 hours). It is kept on the period's start, its end, or a day detail (V39.1's `start_detail`). A
  second tap clears it, and an empty day detail goes. Soaked every 1–2 hours shows the heavy-bleeding warning (`r2`). "Clots
  and pain" opens the details sheet as before.

**The sex log (`sexHtml`, `state.sex`).**
- **Two choices only:** "Without a method" (`'n'`) and "With a method" (`'y'`), one a day in `state.sex[iso]`. A second tap
  clears it. It is cleaned on load (`cleanSex`).
- **Only on this phone.** It is a key of its own (not `daily`), so the doctor's report, What you noted, What repeats,
  reminders and `net()` never see it; the sign-up leak check lists `sex` as a health key. It counts as a log for her first
  log.
- **Never shown** on a shared phone (plain words), to a girl under 18, in a pregnancy, or after menopause.
- **Not trying for a baby, without a method, within 3 days:** the emergency pill line, from the contraception guide's
  reviewed words ("take it as soon as you can, within 72 hours (3 days)"), with What to do (`contra-ec`) and Where it's free
  (`contra-free`).
- **Trying for a baby:**
  - On a fertile day it shows "On a fertile day (estimate)" and the trying-for-a-baby guide's line: "Sex every 2–3 days,
    all through the cycle, gives the best chance".
  - Hearts mark her days on the week strip and the calendar, with "Sex" in the legend.
  - The Days tab tags them.
  - Hearts never show when she isn't trying (`sexHearts`).

**The Cycles tab.** Diary's tabs are Calendar · Cycles · Days (the `trends` string, English and Hindi; the other 4 languages
keep their old word until a native speaker checks). The order is:
- her signal cards, if any;
- My cycles, where each cycle has "Edit dates";
- the glance, with her numbers inside;
- one Charts row, a `details` holding the gaps and period charts, which stays open once she opens it (`mem.chartsOpen`);
- What repeats, then This month's signs, the checks, What you noted, the report and her records.

The Diary tour's second tip says "Cycles".

**Edit dates (`openCycleEdit`).**
- **The sheet:** her period's start and end, Save, "This wasn't a period" and Cancel.
- **Refused:** an end before the start, longer than 20 days, in the future, or into another period (shown with a line; nothing
  changes).
- **Save:** moves the start, so a guessed date becomes a real one, and moves, adds or removes the end.
- **"This wasn't a period":** removes its start and end, with Undo.
- **The date of a cycle** still opens its first day.

**When fertile days start (`fwFew`).** With fewer than 6 cycles (`fertWhy() === 'few'`), the calendar says "Fertile days
show after 6 cycles. N more periods to log." "Why?" explains in 3 sentences, ending with "There is no safe day". Other
reasons (irregular cycles, hormones, a method, age) show nothing new, as before. There's nothing on a shared phone.

**Strings.** About 40 new English and Hindi keys (`sx_*`, `dy_sx_*`, `day_flow_q`, `day_clots`, `day_month`, `prev_week`,
`next_week`, `dy_*1`, `charts_*`, `mc_edit`, `ed_*`, `fw_*`). New wording is in the wording review, section 19.11. The
emergency pill and every-2–3-days lines reuse reviewed text; the rest waits for the doctor.

**Tests.** `node test/diary.mjs` checks the day page, flow, the sex log (including a shared phone, pregnancy, menopause and the
report), the Cycles tab, Edit dates, the fertile-days line, Hindi and 360 px. records, insights, fieldtest and signup follow
the new tab name, the cycle rows and the week arrows.

## 55. Version 39.12: plan follow-through (Mohit, 26 Oct)

Mohit: "we have yoga and diet etc. but it only asks did you ate, 10 minute walk and sleep". The audit kept the 3 daily steps and
found 7 gaps. Mohit approved the mockup (claude.ai/artifact/WYGamiymeknKbDL4nbVpFT), then "go with your recommendations". His 6
decisions:
- the nudge is off by default;
- bedtime is asked about last night;
- weight is optional, asked last and never judged;
- the family message goes from her own phone, with no health words;
- Qura's call is offered after 2 quiet weeks, at most once a month;
- the weekly plan can be skipped.

Everything stays on the phone; nothing new goes to the server.

**1. Today names the day's yoga or strength** (the `walk.cycle` adapter, the cycle plan only). Version 39.13 made yoga and the
walk two steps (section 56).
- The move step's title is the day's routine and its length ("Cycle care yoga · 8 min", "Strength at home · 11 min"). Its
  second line is "Or walk N minutes". Its `name` is "Yoga or a walk", used by the look-back's best step and the restart
  cards.
- On Today the step has **Start**: `nav`, a new Today item field for a button that opens a screen (`data-today-nav` in core).
  Start opens the routine; the row opens Yoga and moves. A `routine` step (the PMS plan's calm breath, 40+ strength days) has
  Start too.
- A routine that moves her (any but the calm breath) makes the step done by itself, as enough minutes do. Her own answer in
  the check-in still wins.

**2. Strength days she can see.** From her plan's day 4, Today's plan line shows the week's next strength day ("Thursday:
strength day · 0 of 2 this week", or "Tomorrow: …"). As in the mockup, it takes the place of the plain "Yesterday: N done"
line. Welcome back, the day-3 line, a rest day, a lighter week, the calm week and her period still come first. Once the week's
strength days are done, the line goes.

**3. The check-in asks only what it doesn't know.**
- A step that already counted today shows as done, with where it came from: "Counted from your yoga", "From your plate today",
  "Ticked on Today" or "Counted: N minutes today". It isn't asked. The date line says how many questions are left, and
  "Change an answer" opens every step. Saving leaves what counted as it was: 8 minutes of yoga stay 8.
- Half the plate sabzi tapped on today's thali counts the half-plate habit.
- Each food habit's second line is its meal: "At lunch or dinner", "Dal or besan cheela, for example", "At snack time",
  "When you cook" and so on.

**Bedtime is asked about last night.** "Last night: in bed by 11:30 pm?", with Yes, Close and No (d, p, n), kept on today's step.
The time is last night's target: `bed` on the step, from `bedTarget(d, iso)` by that day's week. A night shift keeps its own
question.

**4. Plan your week** (`plan-week`; `d.wplan[week] = { str, when, ifb, ift, at }`, kept 6 weeks).
- It takes 30 seconds and asks three things:
  - her strength days (the cycle plan only): as many as the week's target, not two in a row, and past days fixed;
  - her time to move;
  - one if-then plan for what got in the way last week (`IFT`: 2 or 3 choices for each barrier, from the reviewed tips).
- "Same as last week" copies last week's. Saving sets `d.when` too, and `todayPlan()` reads her strength days from
  `d.wplan[week].str` (else days 2 and 5 of her plan week, as before).
- It's offered on the weekly look-back once she has answered it ("Plan your week · 30 seconds"). It's always in Plan settings
  as "Plan this week", for plans that move (`moves`), but not in pregnancy or the first 6 weeks after a birth.
- When she names that barrier in the check-in, the tip is her own plan: "You planned: “I’ll split it into two short walks.”"

**5. A nudge at her time to move** (`nudgeSync`, the reminder `plan-nudge`).
- Plan settings has "Nudge at my time to move", off by default. Her time (`d.when`) sets the hour (`NUDGE_AT`: morning 7:30, after
  breakfast 9:30, after lunch 2 pm, evening 6 pm, after dinner 9:15 pm). If she hasn't picked a time, the switch opens Plan your
  week, and saving her time turns the nudge on.
- At most one a day. None once she has moved, checked in or taken a rest day (`doneOn`). During her week's pause it starts again
  when the pause ends. It goes when her plan stops, finishes, or pauses for a pregnancy, a birth or a loss, and comes back
  with the plan (`nudgeHeld`). If she deletes it in Reminders, it stays off.
- The phone says "Your time to move. Tap to start." On a shared phone, core says only "A reminder". A tap opens `plan-now`,
  which draws today's routine (or Yoga and moves, for a plan that walks) and takes its address.

**6. The 4-week check** (`plan-check`, `d.mcheck[1 to 3]`).
- It's due in weeks 5 to 6, weeks 9 to 10, and from week 13 (the end page asks "How do you feel after 12 weeks?"). It's offered on
  the month card, as a row on My plan, and on the end page. "Not now" waits 3 days. It's only for 12-week plans, and never on
  a shared phone, in pregnancy or in the first 6 weeks after a birth.
- It asks how her energy, sleep and mood are since she started (Better, Same, Worse), plus skin and hair for PMOS or skin. Then,
  in the cycle plan only, it asks for her waist and weight, both optional and last. They go into My body too.
- The result shows what she did beside what she noticed. What she did is the days she moved, strength days, food habits going
  and minutes; for light plans, the days she followed her plan. Waist and weight show as numbers only ("86 → 84 cm"). Anything
  "Worse" brings the free government doctor and a Qura doctor. My progress shows "How you felt", and her report carries her
  latest check.

**7. Two quiet weeks** (`cardKind` 'quiet', before the week-off offer).
- When it shows: from week 3, when her last 2 weeks and this one each have under 3 days, and she hasn't been asked about a week
  off in 4 weeks. It's one card, with no health words.
- "Make next week lighter": 7 days of a 10-minute walk or the gentle routine, and 2 steps at most (never a safety step), said on
  Today (`d.light`).
- "Ask family to walk with me": her own message, which she can change ("Will you walk with me after dinner? 15 minutes, every
  day this week."). It goes through her phone's share sheet (`S.share`), never a wa.me link.
- "Talk to a Qura doctor" (the first 20-minute call is free), "Pause for a week" and "Not now". Any answer counts as the plan's
  week-off offer (`pauseAsk`).

**Her goal in the feedback.** On a day she did something, the feedback leads with "Your goal · A step towards more regular
periods." (one line per goal, `plan_cg_*`). Then come the reason and the count, then two cycle-plan lines: "Strength: 0 of 2
this week · next: Thursday" and "Tomorrow: Sun salutation, slow · 7 min". The goal line never shows on a shared phone.

**Stopping and starting.** Stop clears the nudge and her weeks, checks and lighter week, and a new plan starts without them.

**Strings.** About 150 new English and Hindi keys (`plan_a_r*`, `plan_meal_*`, `plan_th_str*`, `plan_ci_*`, `plan_cg_*`,
`plan_wp_*`, `plan_ifq_*`, `plan_if_*`, `plan_nudge*`, `plan_mc_*`, `plan_q_*`, `plan_sum_mc`). New wording is in the wording
review, section 19.12. The goal lines and the "Worse" line wait for the doctor.

**Tests.**
- `node test/follow.mjs` checks all 7 gaps, the bedtime question, a shared phone, Hindi and 360 px.
- companion, firstday, notices, pmosplan, results, goals, carryon, foodsteps and pictures follow the new step words, Start and
  the goal line.
- golden.mjs was re-recorded. Only these changed:
  - the food step's second line (88 plan-days);
  - the cycle plan's move step (72);
  - My plan's two new settings rows (140);
  - the end page's 12-week check (23).

## 56. Version 39.13: yoga and the walk as two steps; a day with every step done (Mohit, 26 Oct)

Mohit, after Version 39.12: "instead of 3 option we can have 4 options walk and yoga should be separate and we need to make
sure user did all daily activities for the day".

**Four steps in the cycle plan.** In `progs/v1.js`: `slots.max` is 4, the new adapter `yoga.cycle` comes first, and the
changelog has R5. `progs.mjs` now allows 4 steps a day.
- **Yoga** (`yoga.cycle`; id `yoga`, kind `routine`). The day's routine: "Cycle care yoga · 8 min", or "Strength at home · 11
  min" on a strength day. Today shows it with Start. It's done when she finishes a routine that moves her (on a strength day,
  Strength at home) or answers Done in the check-in.
- **Walk** (`walk.cycle`; id `move`). "Walk N minutes", with Done. N is the rest of the day's minutes after the yoga, 10 at
  least: `max(10, ceil5(daySuggest − routine minutes))`. That way the week's minutes still grow as the plan intends.
  - Only walking minutes count. A routine keeps its own minutes in `rmin` (`logRoutine`).
  - The walk's Done tops up the walking minutes (`markAction`); the weekly ring still counts all minutes.
- Then the food habit and bedtime, as before.
- A lighter week keeps the walk and the food habit (`stepsFor`).
- The other plans keep their own steps, since only the cycle plan has a daily yoga routine.
- Version 39.12's "Or walk 10 minutes" and "Yoga or a walk" are gone (section 55, gap 1). The restart cards now name her walk.

**Making sure she does them all.**
- **Today:**
  - all 4 steps show (5 rows with a tablet); every other case keeps Version 39.10's 3 rows;
  - the count reads "x of 4";
  - when one step is left, "One more: In bed by 11:30 pm" shows in bold, in the plain "Yesterday" line's place;
  - a full day reads "All 4 done today".
- **The evening check-in reminder keeps coming until every step is done**, or she checks in or rests. This applies to every
  plan (`remSync`, `allDoneToday`). Before, one step (or the cycle plan's minutes) put it away for the day.
- **The nudge waits** for both her yoga and her walk.
- **The check-in asks each step on its own.** Its feedback names what she missed: "Tomorrow, add: Walk 10 minutes." (Version 39.51,
  section 94 item 17: only a step tomorrow has, so not today's yoga when tomorrow is Gentle start)
- **The weekly look-back** adds "All your steps on N of 7 days." when N is 1 or more (`fullDays`). It isn't shown at 0, since
  the weeks before this version had no yoga step.

**Fit.** On a 360 × 780 phone (Galaxy S23, S24) all 4 buttons sit above the tab bar, in English and Hindi. Three things make
the room:
- the yoga row has no second line;
- below 380 px, Today hides the bedtime tip (it stays on My plan);
- the gap under the plan line is 4 px.

**Tests.**
- follow.mjs section 12 (91 checks in all).
- companion, firstday, notices, pmosplan and carryon follow the 4 steps and the reminder rule.
- golden re-recorded: only the 9 cycle-plan variants changed (4 steps, "0 of 4").
- The progs baseline is re-recorded for cycle@1.

## 57. Version 39.14: Today is her checklist (Mohit, 26 Oct)

Mohit, 26 Oct: "maximum clarity on what needs to be done and why user should do it and what will impact of consistently
doing". The audit is `docs/home-plan-diary-audit-2026-10-26.md` (R1 to R6, R14). The mockup is
claude.ai/artifact/6CVQhWJnZmJFZ9sNcapHdr. He answered "go with your recommendations": done steps stay ticked, a full day
closes itself, plan weeks keep her start day and show as dots, and the order is Today, My plan, Diary.

**The checklist (R1).** The plan's `today` hook returns every step of the day, not only the ones left. Each item carries:
- `plan: true`, `tick` (a tick, habit, minutes or routine step; a link or a check is done in its own tool), `ok` (done),
  `next` (the first step left), `fold` (every step done);
- `act` to tick it (`markAction`, then `closeDay`) and `undo` to untick it (`unmark`);
- `why`, which opens the step's sheet (R3);
- `nav` and `primary` for a routine's Start.

Core's `todayHtml` draws the plan's items as their own list, `.today-plan-list`:
- A tick row (`.today-chk`, `data-today-row`): a tap anywhere on the row ticks it. The round tick on the right is
  `data-today-act`; once done, `data-today-undo` undoes it. A done row stays, soft green (`.today-ok`), and says where it
  counted ("Ticked on Today", "From your plate today", "Counted from your yoga").
- A routine not done yet has Start where its tick goes. A tap on the row starts it, and finishing the routine ticks it.
- A link or check step (pregnancy's Due now, the recovery check, a checklist) keeps its one-tap `.today-go` row to its tool,
  with a static tick once done there.
- "Why?" sits in the line under the name (`data-today-why`). A long line is cut, so "Why?" stays.
- Her plan's rows never fold into one row any more (Version 39.0's `plan-all` is gone). Tablets and her own reminders always
  show; beside a plan, one other row at most.

**One pink button (R14).** In the Today card it's the next step's Start, or the evening check-in once it is due (from 5 pm, her
check-in time, or once she has done a step). Other rows' Done buttons are plain. The check-in moved under her steps (the new
`todayFoot` hook). Before it is due, that place says "Check-in at 8 pm"; after it, "Checked in today".

**Undo.** `unmark(d, a)` sets the step's answer to `n`. For the walk, it takes away only the minutes the tick added
(`log.tkm`, written by `markAction`), never the ones she walked. A habit clears its plate habit, and a strength tick its
strength mark. Version 39.51 (Mohit's phone test, section 94 item 17): undo takes the answer away instead, so the step is
unanswered again and the check-in doesn't show "Not today" for a tap made by mistake; it is `n` only when her own minutes or a
routine she played would tick it straight back.

**A full day closes itself (R2).** The tick that completes her day (`closeDay`):
- sets `log.fd` and earns a petal through `S.emit('checkin', { quiet: true })`, once a day (`log.petal` when one was earned);
- puts the evening reminder away (`remSync` already counts `allDoneToday`).

The card then shows:
- "Day complete" and "All 4 done today";
- her goal line ("A step towards more regular periods.", wording review 19.12);
- her week, and "Tomorrow" with tomorrow's first two steps;
- "A petal for your garden ›" and "Add how it went (optional)", which opens the check-in.

Her ticked steps fold under "Your 4 steps" (`details.today-fold`), so a tick can still be undone.

**"Why?" (R3).** `openWhy(a)` opens a half sheet:
- the step's reviewed reason (`a.why`);
- how to do it: a food habit's own line, the walk's pace, a routine's minutes and moves, else the step's line;
- for the cycle plan's daily steps, "What keeping to your plan can bring", the reviewed timeline (`plan_ex_1` to `_3`; it is
  about her plan as a whole, so the heading says so);
- its tool (Start, Yoga and moves, My plate, My food, its page), and "Read more" (the Learn guide, Version 39.7).

A food step's sheet also has "Fasting today?" (Version 39.9's chip, moved from My plan). It isn't on a shared phone.

**"Plan day" (R4).** The plan line is the eyebrow "MY PMOS PLAN · WEEK 2 · PLAN DAY 10" (`ebLine`). A pregnancy or after-birth
plan keeps its own week, and "Cycle day" stays the only plain day count. Version 37.2's "Day 3" line is gone.

**Her week (R5).** Seven small dots for her plan week (her start day, as he chose), with today's count on the same line:
- a full day (every step) is filled; a day with some steps is outlined; a rest day is dashed;
- today is ringed, and a strength day ahead is gold;
- each dot's title gives that day's count ("Monday: 3 of 4 steps").

Under them, a notice ("One more: …", "Welcome back", a lighter week, a rest day, her period), or else her week line: "This week: 2
full days · strength on Thursday". It is never "0 full days": then only the strength day shows. The Version 37.2 "Yesterday:
…" line is gone; the dots carry it.

**The weekly moment (R6).** On the first 3 days of a new week, the look-back is inside the Today card (not the slot), right
under her steps:
- It starts as one line, "Week 1 is done · 5 of 7 days on your plan" with "Look back" (`#pl-rev-open`). A tap opens it in
  place (`reviewCard(d, true, true)`, `S.mem.planRevOpen`): what she did, the week's barrier, then her energy.
- After her answer: her tip, Plan your week and Got it, all plain buttons (her steps keep the pink one).
- The slot no longer shows it, unless she has no steps today.

The audit (R6) put it above her steps. It sits under them so her first 3 steps keep the first screen at 360 × 800 on the
tightest days: a late period, a fertile day, the trying plan (review FIXES-06, REGRESSIONS-08).

**Fit.** The plan line is two short lines, as Version 39.13's was. So on a 360 × 780 phone all 4 steps sit above the tab bar
in English and Hindi, on a day with no look-back. A routine row shows its name, with its minutes in the line under it.

**Tests.** `test/daily.mjs` sections 1 to 4 and 7. follow, companion, firstday, notices, goals, pmosplan, carryon, protect,
pictures, foodsteps and value follow the checklist. golden is re-recorded.

## 58. Version 39.15: My plan explains the plan (Mohit, 26 Oct)

The audit's R7 to R10 and R15, and the mockup's After 7. The page (`renderProgramme`, on My plan and at `plan-pmos`) now
reads top to bottom:
1. **Her goal and week.** "Goal: feeling better with PMOS · Week 2 of 12" (`plan_gv_*`). The diagnosis-style line ("I have PMOS
   (PCOS)") is gone. A shared phone sees only her week.
2. **How her plan works (R15).** Four columns: every day (N steps, check-in at her time); every week (look back, plan the
   week); every 4 weeks (a 1-minute check); after 12 weeks (your results). A plan with no 12 weeks shows the first two.
3. **Her daily steps (R7.2).** Each step shows:
   - its reviewed reason, always (not on a shared phone);
   - "How to do it", which opens the same sheet as Today's "Why?";
   - the same tick as Today's (`data-pl-tk`, `data-pl-un`), or Start for a routine.
   Under them: "Tick here or on Today: it's the same tick". The check-in button appears only when it is due (R9); before
   that, "Check-in at 8 pm".
4. **This week (R7.3).** Seven rings, one per day, with a part for each step. A full ring is a full day; a rest day is dashed;
   today is ringed, and a strength day ahead is marked. Then:
   - the legend ("Each ring has 4 parts: yoga, walk, food, sleep.");
   - her week line;
   - her minutes ("Active minutes 36 of 60", the cycle plan);
   - "+ Add minutes", and Plan this week (moved here from settings).
5. **Her garden (R10)**, right under her week.
6. **What consistency brings (R7.4, R8).**
   - The cycle plan's reviewed timeline, with "You are here". A trying plan has its reviewed line, a pregnancy plan its own.
   - Her own signs as they arrive: her energy from the look-backs ("Week 1: Good"); her 4-week check ("In 19 days", "Due
     now", "Done"); her days between periods ("28 before your plan · 30 since").
   - The reviewed "Periods often take 3 to 6 months to change" line.
   - Not on a shared phone. R8's line linking effort to results is not built: it is new health wording, and waits for the
     doctor.
7. **The rest.** The 12 weeks (the path's weeks 4 and 8 now read "Your 4-week check", "Your 8-week check"); the plan's tiles;
   her last plan; her care team; then **one row, Plan settings**. That row opens `plan-settings`: her reminder and its time,
   the nudge, pause, change what I work on, and stop (stopping there returns to My plan).

Gone from the page: the minutes ring hero, the "Today's steps" row and its morning check-in button, "Fasting today?" (now in
her food step's sheet), and the garden at the bottom. `heroRing`, `heroWeek`, `todayRow` and `wpRowSub` are removed.

**Tests.** `test/daily.mjs` section 5. carryon, foodsteps, follow, knowledge and pmosplan reach settings through its row.

## 59. Version 39.16: the 10-second daily note; My ASHA off Home, My plan and Diary (Mohit, 26 Oct)

**"How do you feel today?" (R11).** Five of the Diary's own words: Calm, Tired, Cramps, Low mood, Bloating (`FEEL`; no new
symptom). A tap saves it as that day's entry (`state.daily`), on the phone, and the garden counts it as a log. It appears:
- **on Home**, for every woman at the cycle, trying or midlife stage, in the card `feel-card`.
  - With no plan it's her daily job: "Today · 10 seconds", the 5 chips and More (which opens today's day sheet), why it helps,
    and the notes meter (R12).
  - With a plan it's short: the question and the chips, under her Today card.
  - The first days' "Log today" row makes way for it.
  - Never on a shared phone's Home, for a girl under 18, in pregnancy or after a birth (her stage's own checks lead there).
- **At the top of today's day sheet** (`feel-sec`), as the same entries as the chips below (`data-sym`).
- **In her plan's evening check-in** (`S.feel.on / chips / toggle`), so one evening ritual fills her plan and her Diary.

**The notes meter (R12).** "Noted on 9 of 27 days" for this month: a day counts with any symptom, note or period mark. Under
it, what her next entries unlock:
- "Next: 2 more periods, and your fertile days show." This shows only where fertile days can show, never on a shared phone.
- Else "Next: 1 more period with notes, and Sakhi shows what repeats for you." (the `patterns` rule).

There is no streak, and nothing is lost on a quiet day. The meter is on Home (no plan) and at the top of Cycles.

**The calendar's key (R13).** Two lines:
- the period marks (bleeding, spotting, likely range, predicted);
- "Dots: what you noted", with a "?" (`#cal-key`) that opens the full key: today's ring, every kind of dot, and hearts.

The fertile-days line stays when fertile days show.

**My ASHA (Mohit, 26 Oct: "Remove My Asha/ANM from home my plan and diary").**
- Home's setup card skips the ASHA step (`setupCard`; Me's setup card keeps it).
- My plan's care team has no My ASHA row.
- The pregnancy checklist's "ASHA and ambulance numbers" item never becomes Today's or My plan's "Due now" step (`preg.due`).
  It stays in her pregnancy checklist.
- The Diary had none.
- My ASHA stays in Help, Me, Explore (Care near me) and Search.

**Tests.** `test/daily.mjs` sections 4 and 6; value.mjs section 6 (the setup card).

## 60. Version 39.17: the daily note in 10 seconds (Mohit, 26 Oct: "proceed with your recommendation")

From the Diary audit (`docs/diary-audit-2026-10-26.md`, R1 to R5, R10). Labels only, no new health advice. The new lines are in
the wording review, section 19.17.

**One quick set (R3).** `FEEL` is Feeling okay, Tired, Cramps, Low mood, Bloating (`feelSet()`: her periods stopped, hot
flushes in place of cramps). The same 5 show in every place:
- Home's card, and the Diary's Today strip (`calToday`);
- the day page (`feel-sec`);
- her first log (in place of Cramps, Acne, Low mood, Tired and "Nothing");
- the period sheet (`openLog`, in place of its own 6);
- the plan's evening check-in (`S.feel.chips`).

Each place shows her answer once she has given it. The + menu's Symptoms and Mood are one "How I feel" (focus `feel`), so it
has 4 doors: Period started (or ended), Spotting, How I feel, Note.

**"Feeling okay" (R2).** A new entry, `d_ok`, in the Diary's mood group. It is a word, not a symptom:
- it counts in the notes meter and the garden;
- it shows in Days, the calendar's dots and "What you noted";
- it is never in the doctor's report or the month's summary (`joy.js`);
- it is never a pattern (not in `PAT_KEYS`).

`patterns()` counts a period only when she noted something from 8 days before to 4 days after it. So a period she felt fine in
now stays in the count: "in 3 of the 5 periods with notes", not "3 of 3".

**The short day page (R1).** At the cycle, trying and midlife stages (`feelStage()`, not pregnant), the page is:
- the day's facts;
- "How do you feel today?" (another day: "How did you feel?") with the 5 and "More signs" (`#day-more`);
- her period, sex and her note.

"More signs" (`#day-more-sec`) holds the other signs, never one of the 5 again. It opens:
- on a tap ("Fewer signs" folds it);
- by itself on a day that has one of them (no fold button then, so her answer stays in sight);
- from Home's More and Cycles' empty state (focus `more` or `sym`).

In a pregnancy and after a birth every group stays open as before, since their danger signs are among them. Measured at
360 × 780: today's page went from 2,128 px with 30 choices to 1,188 px with 10.

**Today on the Diary's first screen (R4).** `calToday()` is the Calendar's first card. It holds:
- her cycle day and next period in one line (the day page's own `dayFacts`);
- the 5 and More;
- the notes meter.

The meter moved here from Cycles. It carries the "Why?" link that the Calendar's own "Fertile days show after 6 cycles" line
had; that line (`fwFew`) shows only where the strip doesn't. The strip is not shown before her first log, on a shared phone,
for a girl under 18, or in a pregnancy.

**What a note counted towards (R5).**
- A note on today: "Noted · 9 of 27 days this month" (`notedToast`, the meter's own count `notedMonth`), with "What helps"
  where a sign has one.
- Another day: "Noted".
- The note, or the day page's period start, that completes her third period with notes: "What repeats for you is ready" with
  "See it" (`readyToast`). This shows only where that card shows.

**Read aloud (R10).** The day's facts, how she felt and the Today strip carry the card speaker (`data-say`; the day page calls
`sayButtons` on its sheet). The smoke test's 200% text check now includes the day page (with More signs open), Cycles and Days.

**Tests.** `test/daynote.mjs` sections 1 to 5 and 9; `test/smoke.mjs`.

## 61. Version 39.18: what her notes show, the doctor, her stage (Mohit, 26 Oct)

From the Diary audit (R6 to R9).

**Cycles in the order of her questions (R6).**
1. What repeats for you (or how many more periods with notes it needs);
2. My cycles;
3. Your cycle at a glance;
4. Report for my doctor (moved up from the bottom);
5. then the charts, What you noted, the monthly signs and My records.

Her records' signal cards stay on top.

**Days by period (R7).**
- A heading per period: "Period from 17 Oct · 28-day cycle", "· this cycle", or why it isn't counted. On a shared phone:
  "From 17 Oct".
- Each day shows "Day 9" (or "Day 2 of your period") and her notes.
- The estimates went; the day page keeps them. "N days before the next period" stays only in the 8 days before a period, the
  window "What repeats" reads. The fertile-days note at the foot went with them.

**The monthly signs, named by what they ask (R8).** `ciKind()` picks one of:

| Who | Row title | Line under it |
|---|---|---|
| Pregnant | "Pregnancy signs, once a month" | "The signs to tell your doctor about" |
| Up to a year after a birth | "Signs after the birth, once a month" | "The signs to tell your doctor about" |
| Midlife (`isMidlife`) | "Midlife signs, once a month" | "The signs a doctor asks about after 40" |
| PMOS or irregular periods (`obTileOf() === 'pmos'`), or her plan for them (`S.plan.goal()`) | "Skin and hair signs, once a month" | "The signs a doctor asks about in PMOS" |

These follow `checkinSet()`'s own sets. Any other woman sees no row: her daily note covers her mood and flow. The check-in page
and its reminder are unchanged.

**The Diary at her stage (R9).**
- **In a pregnancy:**
  - the Calendar shows "Week 21 of your pregnancy" with This week (not on a shared phone);
  - the period key, likely range, estimates and contraception line are gone;
  - there is no Today strip.
- **In the first 6 weeks after a birth, before any period (`earlyPost`):**
  - the day page's period row is "Bleeding after the birth", which opens the recovery check and its reviewed warning signs;
  - "Period started" doesn't show, as on Home and in the + menu;
  - nothing shows there on a shared phone;
  - "Period started" returns after 6 weeks or with her first period.
- **The key:** "Likely range" shows only when the calendar has one.

"Bleeding after the birth" is new wording on a safety path, so it waits for the doctor (wording review, section 19.18).

**Tests.** `test/daynote.mjs` sections 6 to 8.

## 62. Version 39.19: My plan with less clutter (Mohit, 26 Oct: "some information can be collapsable")

From `docs/myplan-and-sleep-advice-2026-10-26.md`, M1 to M5. In her first week My plan is as before. After it
(`weekNo(d) > 1`), what she reads once folds to one line each:
- **How your plan works** (`foldCard`): "Every day: 4 steps, check-in 8 pm".
- **Her steps' reasons:** behind "Why?" (`data-pl-how`, the same sheet as Today). Her fasting step's tips stay open (SAFETY-03).
- **What consistency brings:** her stage now, for example "Weeks 1 to 4: Many women feel more energy and sleep better."
- **Your 12 weeks:** last week and this week, then "The weeks ahead" (`.pl-path-more`). The pregnancy and after-birth paths
  stay as they were.
- **Your care team:** "Doctors, your report, help". Help stays in the top bar.

Her steps, this week, the garden, the tools and her settings stay open. A card she opens stays open while she uses the app
(`S.mem.plFold`, so a tick doesn't close it). Measured at 360 × 780: week 2 went from 3,580 px to 2,248 px (4.6 screens to
2.9; 431 words to 229), and week 6 from 5.0 screens to 3.3. Her 4 steps fit on the first screen.

**Tests.** `test/planfold.mjs` sections 1 to 4; daily and carryon updated; golden re-recorded (only the `myplan` text changed:
127 differences).

## 63. Version 39.20: a mantra or prayer at bedtime (Mohit, 26 Oct)

Mohit: "We dont need to record mantras as audio files just advise you can chant these or any devotional mantra you like to
chant for soothing sleep".

Relief's sleep routine gains a 5th step, `s5`, of 25 seconds, read aloud like the others: "A mantra or prayer, if you like".
It reads: "Chant softly, or in your mind: Om, the Gayatri mantra, the Hanuman Chalisa, or any prayer or devotional mantra you
like. When thoughts come, gently go back to it."
- The routine is still about 3 minutes, and step 1 still says to put the phone away when it ends.
- It has no recordings and makes no health claim for any one mantra (the evidence is for repetition: Benson's relaxation
  response).
- It's reached from the bedtime step on Today and My plan, which already opens this routine.

The recorded sessions came next, as Wind down (section 64).

**Tests.** `test/planfold.mjs` section 5.

## 64. Version 39.21: Wind down, in Dr. Megha's voice (Mohit, 26 Oct: "build it into the app")

Mohit chose the voice ("the selected one is a sample of megha voice lets use this everywhere"), the real hum for Bhramari
("keep the same length its a proper length for hmmm sound"), the three Freesound recordings ("use these 3") and the moving
pictures ("We just need some animation along with it"). He approved the sessions: "yes these are perfect".

**What she gets.** `mods/calm.js` adds Wind down (`calm`), with a player at `calm-<id>`:
- 3 guided sessions in Dr. Megha's voice, in English or Hindi:
  - Slow breaths (`breaths`, about 4 minutes): in for 4, out for 6, then out for 8.
  - Bhramari (`bhramari`, about 3 minutes): the real 9.8-second hum.
  - Yoga nidra (`nidra`, about 8 to 9 minutes).
- 3 sounds for sleep: a singing bowl with waves (`bowl`), Wandering (`wandering`) and Dunes (`dunes`).
  - They loop, and stop after her timer: 15, 30 or 45 minutes (30 unless she picks), kept as `mods.calm.mins`.
  - The last minute fades out. Only the time the sound played counts.
- Her voice language is `mods.calm.vl`. With none saved, it is the app's language (Hindi if the app is in Hindi, English
  otherwise).

**The player.**
- It is a dark screen (`.cm-night`, z-index 60) over everything, the tabs and the Help button included. Close (back arrow)
  returns to the list.
- Each session moves with her voice:
  - Slow breaths and Bhramari: a light that grows as she breathes in and shrinks as she breathes out. "Breathe in" and the
    count follow Dr. Megha's own count. While she hums, rings go out. When the session says "on your own", it keeps the last
    rhythm, marked "At your own pace", with no count.
  - Yoga nidra: a body on a mat, seen from above. A warm light goes to each part she names, and the whole limb lights up for
    "the whole right leg". The body sinks for heavy and floats for light. Then dawn for the calm place, and night at the end.
  - The sounds: slow waves of light (warm ones for Dunes), or the bowl's glow with rings going out.
- The pictures have no timers of their own. The player reads the sound's position 5 times a second and draws from it. The
  times come from `sounds/timelines.js` (`window.SAKHI_CALM.tl['<id>-<lang>']`: `len`, and `cues` with `k`, `t`, `d` and
  `items`). `web/tools/voice/timeline.mjs` measured them from the files.
- In pregnancy, yoga nidra (whose recording says "lie down on your back") shows: "In pregnancy, lie on your left side with a
  pillow, not flat on your back."
- Leaving the player any way stops the sound. A new draw of the same page keeps it playing.

**Core: `S.sound`** (app.js). Only the app's own files play: `sounds/<path>.ogg` (`SND_OK`). Nothing is fetched from a server.
- `play(src, { loop, mins, title, text, stop, secret })`: replaces what was playing.
- `timer(m)`, `pause()`, `resume()`, `stop()`.
- `state()` returns `{ playing, pos, dur, left, played }`.
- `clip(src)` and `stopClip()`: a relief step's short clip.
- In a browser an `<audio>` element plays. On the phone the bridge does (`soundPlay`, `soundPause`, `soundResume`,
  `soundStop`, `soundTimer`, `soundState`, `clip`, `clipStop`).

**Android.**
- `SoundService` is a foreground service of type `mediaPlayback`. It plays from the APK's assets, so a session goes on with
  the screen off.
  - It holds a partial wake lock only while playing.
  - A call or another app's sound pauses it. It carries on after a short interruption.
  - Her timer counts only the time it played, and fades over the last minute.
- Its notification:
  - It says the session's name and "Playing. Tap to open.", with a Stop button. The lock screen shows only "Playing. Tap to
    open.".
  - On a shared phone or in discreet mode, like her reminders, it says only "Wind down" and stays off the lock screen
    (`secret`).
  - Swiping it away when paused stops it.
- The manifest adds `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK` and `WAKE_LOCK`. All three are granted at
  install, with no prompt.
- `build-apk.sh` bundles `web/sounds` (voice, music, timelines.js) and links with `-0 ogg`, so the sounds stay uncompressed
  and play straight from the APK. The sounds add about 17 MB, which keeps the APK under its 30 MB ceiling.

**The relief routines speak in her voice.**
- Each step plays its clip, `sounds/voice/<lang>/rl-<step>.ogg` (20 steps, English and Hindi). The phone's own voice is the
  fallback.
- The clip stops on Pause, Next and leaving.
- The voice is on to start with, except on a shared phone or in discreet mode (as before). Her switch is kept.
- Each clip says the routine's reviewed words exactly: the heading, then the step. A changed step needs a new recording, and
  `test/calm.mjs` says so.

**Where she finds it.**
- Explore's Periods topic, beside "Feel better now" (`TOOLS_SPLIT`).
- Search. Its own words find it first ("yoga nidra", "bhramari", "sleep music", "wind down", "योग निद्रा"). "Yoga nidra" is
  rest, not exercise, so the yoga plan isn't boosted for it.
- The relief list.
- The sleep routine: on its first screen, one tap from her plan's bedtime step, and at its end ("Keep going: sounds for sleep
  and yoga nidra").
- Midlife: the relief list, and the check's sleep answer.

**Files.**
- `web/sounds/voice/{en,hi}`: 3 sessions and 20 relief clips each, mono Opus at 32 kbps.
- `web/sounds/music`: 3 tracks, mono Opus at 48 kbps, -23 LUFS.
- `web/sounds/timelines.js`.
- `web/sounds/CREDITS.md`: the Freesound recordings (CC0), Dr. Megha's voice and the hum.
- `web/tools/voice`:
  - `sessions.json`: the scripts and the order of each session.
  - `gen.py`: makes the clips. It needs the Replicate key and voice IDs, kept outside the repo.
  - `assemble.mjs`, `padcount.mjs` and `timeline.mjs`: join and time the clips.

**Wording.** The spoken scripts and the new lines wait for doctor review (wording review, section 19.21).

**Tests.** `test/calm.mjs`.

## 65. Version 39.22: meditation in the plan, a sound after a hard night, reminders by the research, a calmer My plan

Mohit, 27 Oct: "make meditation part of plan along with exercises and add sound helping you to sleep if facing sleep
difficulty when asking to log sleep schedule quality and my plan page still feels a little cluttered". He saw the mockup
(claude.ai/artifact/PZZQiSgZdz8KGMR1UfKwgG), then said "go ahead and build it with these changes and also research timing for
yoga and other activities and set reminders accordingly". The timing research is in
`docs/myplan-and-sleep-advice-2026-10-26.md`, section 3.

**The bedtime step winds down first** (`plan.js`, the `bed` adapter, where Wind down is in the build).
- My plan: "Wind down, in bed by {t}", with "Tonight: {session} with Dr. Megha" and a play button where the tick goes.
- Today keeps the short bedtime name ("In bed by {t}") with "Tonight: {session}" as its line, so the row fits at 360 px in
  Hindi. The same play button sits there in a night style. The pink button stays the next step's or the check-in's.
- **Its tip** (the "Why?" sheet's How): "Press play, put the phone face down and close your eyes. Keep the room dark and
  quiet." This replaces "Phone away half an hour before", which the session contradicts.
- **Tonight's session** (`windPick`): yoga nidra after a hard night (the check-in's Badly, or Poor sleep in her diary that
  day); Bhramari after a low, anxious or irritable day; slow breaths otherwise.
- **What counts:** a session or sound she listens to for 30 seconds counts the step that day (`S.calm.doneOn(iso)`), as a
  tick at bedtime does. She may fall asleep before it ends.
  - When it is her day's last step, the day closes as with a tick: Day complete, and her garden's petal.
  - The evening check-in still records last night's bedtime (section 55).
  - calm.js keeps `mods.calm.done[day] = { id, at }` for 60 days, on her phone only.
  - It emits a quiet `tool` event: her garden counts it without a pop-up, and her plan updates its reminders.
- **The step's line:** "Wound down: {session}" once done.
- **Yoga's line:** "Before a meal" (AYUSH: an empty or light stomach). On Today it comes first ("Before a meal · 8 min"),
  so a cut line keeps it. Her walk keeps her own time.
- **Wrapping on Today:** a row may set `wrap` to show its line whole (`today-sub.wrap`); no step uses it yet.

**Moves and calm** (`plan-moves` and the new `plan-calm`, two tabs).
- The Calm tab holds:
  - Dr. Megha's three sessions, each with where it fits: slow breaths sitting or lying, Bhramari sitting up, yoga nidra
    in bed;
  - Calm breath, moved from the moves list;
  - the sounds for sleep;
  - a safety card ("For rest and sleep, not treatment"), with the left-side line in pregnancy.
- Tonight's session carries "Tonight".
- Each session screen in Wind down has its own tip:
  - Bhramari: sit up, breathe through the nose, and skip it with a nose or ear infection (AYUSH);
  - yoga nidra: in bed, lights off, phone face down.
- The Wind down list says "3 min · sitting up" and "9 min · in bed".

**A hard night.**
- The check-in's bedtime row adds "How did you sleep? Well, Okay, Badly". It is optional, and kept as `log[day].slp`.
- Badly does three things:
  - notes Poor sleep (`d_sleep`) in her diary that day;
  - makes tonight's session yoga nidra;
  - after Save, shows a night card with yoga nidra and the singing bowl at her timer. Its line "Sleeping badly most nights
    for 2 weeks? Tell your doctor" waits for review.
- Otherwise, after Save, one row offers tonight's session.
- The Diary's Poor sleep shows Wind down beside the sleep routine (relief's `pick` returns `alt`, which core draws).

**Reminders by the research.**
- **The move nudge** (`plan-nudge`) is on unless she turns it off: `d.nudge !== false`. One she turned off, or deleted in
  Reminders, stays off (`nudgeMade`).
  - After a meal: "Time for your walk, right after the meal".
  - In the morning or evening, on a plan with yoga: "Yoga before you eat, then your walk".
- **The wind-down** (`plan-wind`) comes 30 minutes before her bedtime target, every day. It opens tonight's session (core's
  `notifGo` → `plan-wind` → `calm-<id>`).
  - It is on unless she turns it off (`d.wind`), and one she deletes stays off (`windMade`, `windGone`).
  - None comes once she has wound down that day, or on a rest day.
  - It is skipped when her check-in comes less than an hour before it; the check-in's saved screen carries the session.
  - A shared phone or discreet mode gets the plain words, as for every reminder.
- **Sync:** Plan settings has both switches. My plan and Plan settings sync the reminders as they open.

**My plan after her first week** (week 1 keeps everything open, as in section 62).
- **Title:** her settings move to a gear by the title, and the Plan settings row goes. "How it works" sits by her week and
  opens the rhythm in a sheet.
- **Steps:** one line under each, and one "Why these N steps?" sheet with every reason. The check-in button is plain here
  (Today keeps the pink one), and the "same tick" line goes.
- **This week:** "Plan the week" in its title, and what she planned in one line ("Strength: Thu, Sun · After dinner").
  + Add sits by her minutes, and her garden at its foot. No ring legend.
- **Her 12 weeks:** one card with what consistency brings. It holds this week, next week, her stage in one line and her
  4-week check when due. Every week, the timeline and her signs sit behind "All 12 weeks".
- **Tiles:** four small ones in one row; My progress keeps its count ("27 days"). "Yoga and moves" is now "Moves and
  calm".
- **Length:** week 6 went from 2,598 px to about 1,950 px at 390 px.

**Wording:** the wording review, section 19.22. The night card's doctor line and the session tips wait for doctor review.

**Tests:** `test/winddown.mjs`.

## 66. Version 39.23: her cycle first on Today, a plan day that ends at 4 am, period dates easy to fix

Mohit, 27 Oct, on his phone: "What time will app show next day i logged last night and its next day 11:40 AM still i am on
same day". A check-in after midnight had marked the next day done. After a walkthrough he saw the mockup
(claude.ai/artifact/RTA92ajojk5uXeLtgVC5jm) and said "go ahead and build it".

**The plan day ends at 4 am.**
- Core `planToday()` is today before 4 am and the calendar day after; `api.planToday` gives it to modules. Her diary, periods
  and the week strip keep the calendar day (a period that starts at 1 am starts that day).
- `plan.js`: `pToday()` replaces `S.today()` everywhere, so `todayISO()` is her plan day for steps, ticks, the check-in, the
  log, rest days, her week and its dots, and the plan reminder's `doneOn`. A check-in at 12:30 am closes Tuesday, and
  Wednesday's reminder still rings.
- The check-in is due from midnight to 4 am (`ciDueNow`), as after 5 pm.
- From midnight to 4 am, Today's plan card and My plan's steps card show a night note (`.pl-night-day`): "Still {d}’s plan"
  and "Your plan day ends at 4 am, so this counts for {d}." The check-in button and the check-in page say "How did {d} go?"
  ({d} her plan day's weekday).
- `calm.js`: a session after midnight counts for her plan day (`markDone`), so it ticks the night before's bedtime step.
- `joy.js`: an event may carry `day`. The plan's `checkin` and Wind down's `tool` carry the plan day, so the garden counts
  them for that day.
- Core redraws on a new calendar day or at 4 am (`dayKey()`): on resume, and each minute on Today, Diary and My plan (not
  while she edits her period dates).

**Her cycle first on Today** (`renderHome`, while her plan runs; it replaces Version 39.8's one-line card).
- **The headline card** (`.card.hero.head`):
  - the ring at 88 px with her cycle day;
  - the days to her next period, big, with "Likely {r} · from your last {n} cycles" (Version 31's countdown, `.cd-big`);
  - the dates line ("These dates are estimates…");
  - her 3 logs (`.ract-row.compact.hl-logs`);
  - "Change stage" (`#stage-btn`, V39.8 review SAFETY-03).
- **Taps:** a tap anywhere on the row opens her cycle (the Diary). The chevron (`.hl-go`, "See my cycle") is the button for a
  screen reader.
- **Today's chance** stays in the headline when fertile days show, on its own line across the card (V39.9 review FIXES-06).
- **The ring tour** stays off the headline, which has no key (V39.8 review PICTURES-10).
- **A late period** (past her likely range):
  - "Your period is {n} days late", {n} counted from the end of the range, as "{n} days past your likely range" was;
  - "Typical gap 21–{hi} days";
  - a "Period late?" row with the home-test line, which opens `pregtest` (`explain` where that module is held back).
- **A shared phone:** her cycle day only, with no dates or countdown; a late line stays.
- **Unchanged:** discreet mode keeps its hidden number, and with no plan running the full hero is as it was.
- **Plan card:** her plan's card comes under the headline, so fewer of her steps fit on the first screen. This was Mohit's choice
  (cycle first); Version 39.8's rule was all 3 or 4 steps.
  - At 360 x 800: two on a usual day, one on a late day; on a fertile-window day her plan's card starts there.
  - At 390 x 844: three on a usual day, two on a late day.
  - `pictures`, `foodsteps`, `daily` and `follow` check the new first screen.
- **"How I feel":** the third round button is now "How I feel" with the mood picture, the + menu's name for the same page (it
  was "Symptoms"). Discreet mode keeps its plain word.

**"Edit period dates"** (the Diary's calendar).
- **The button** (`#cal-edit`) sits under the month grid. Discreet mode says "Edit dates". There is none in a pregnancy.
- **Edit mode** (`mem.calEdit = { base, sel }`, `renderCalEdit`):
  - the month's days up to today are toggles, her bleeding days marked;
  - she can move between months;
  - days after today can't be marked;
  - Cancel and Save.
  - Changing Diary tab or leaving the Diary ends it.
- **Save** (`saveCalEdit`) rewrites only the periods she changed: each run of marked days that a changed day touches gets a
  start on its first day and an end on its last. The old start and end events inside the runs go, and a guessed start
  nearby too (`dropGuesses`).
  - A run that reaches today stays open until it is 6 days long.
  - Undo puts every event back.

**"Add a past period"** (Cycles).
- **Where:** My cycles shows from her first period (it needed two), with "Add a past period" (`#ap-add`, the main button while
  she has one period). It replaces the empty card's "Add today", which could start a period today by mistake. "What you
  noted" keeps its own "Add today" for notes.
- **Before two period starts:** "Your numbers" shows a faded example (`.ex-card`, "Example", `aria-hidden` tiles) and "Log two
  period starts to see the gap between them.".
- **The sheet** (`openPastPeriod`):
  - "When did it start?" and "A guess is fine. You can fix it later.", over a month calendar that starts 20 days before her
    first period;
  - "How many days did it last?" (1 to 14, from her average length);
  - Save is ready once she picks a day.
  - **Days she can't pick:** after today, inside a period, or within 9 days of a period's start (they would join it). A
    period can't run into one she has, or past today.
  - **Save** adds a start and an end; Undo takes them away.

**Wording:** the wording review, section 19.23.

**Tests:** `test/cyclefirst.mjs`. For the first screen: `pictures` 3 and 16, `foodsteps` 8, `daily` 7 and `follow` 12.

## 67. Version 39.24: Wind down that comes up properly

Mohit, 27 Oct: "can you check wind down sleep section its not properly coming up". His Flip5's log showed that he tapped "4
min" and pressed Back 4 seconds later. The audit (memory: winddown-audit-oct27) found three causes:
- every guided session shows a still picture with no words for its first 17 to 24 seconds;
- Back stopped the session;
- Wind down sits under Explore's Periods topic.

He saw the mockup (claude.ai/artifact/EofEApr38Rojv8656FPSHt) and said "go ahead and build it".

**The opening seconds** (`mods/calm.js`, `renderPlayer`). Until the picture first moves (`firstMove`: the first breath count,
the hum, or yoga nidra's first slow breath), the screen says "Dr. Megha is starting. Settle in." with "Breathing starts in {n}
s" and the session's tip.
- Bhramari's tip stays in view after that, because it carries the nose or ear infection line.
- When the session is tonight's (`S.plan.tonight()`), the screen also says "Tonight · Your wind-down · {n} min".

**Captions.**
- **Source:** `sounds/captions.js` (`window.SAKHI_CALM_CAP`) holds Dr. Megha's words, made by `tools/voice/captions.mjs` from
  the scripts her recordings came from (`tools/voice/sessions.json`). Remake it whenever a script changes.
- **What shows:** `capAt` shows the line she is saying. The counts and the hum keep her last words, and a list (yoga nidra's
  body parts) shows its last four parts as she names them.
- **The CC button** turns captions off, and it stays off (`mods.calm.cc`).
- **Her voice** (English or हिंदी) switches on the session screen, and the session starts again in that voice.

**Back keeps it playing.** Leaving the session screen no longer stops it (`afterRender` → `barSync`).
- **The bar:** on any other screen, a bar above the tabs (`#cm-mini`) shows "Playing · {a} of {b}" (or "Paused").
  - It has pause or play, and a tap opens the session where it is.
  - Its ✕ stops the session. The ✕ on the session screen still stops it too.
  - The bar goes when a session ends or a sound's timer runs out.
- **Around it:** the Diary's + button and the page's end move up above it.

**The end.** A guided session that ends shows:
- "Sleep well, {name}" ("Sleep well" in discreet mode or on a shared phone);
- "Your bedtime step is done for tonight" when her plan's bedtime step counted it;
- the sounds and yoga nidra (the sounds only after yoga nidra), the timer and Done.

The next tap on the same session starts it afresh.

**One Wind down page** (`listBody`, `wireList`), in the app's own colours. My plan's Calm tab is the same page. It shows, in
order:
- tonight's session first, in the night colour;
- the other sessions, and Calm breath where the plan has it (`S.plan.calmRow()`);
- the sounds, as rows that play (with the timer);
- the safety card.

**Explore's For you.** Wind down comes right after her goal's first tool, in the night colour.
- Her goal's first tool keeps the lead (Version 38's rule; after a birth, her recovery tools). The mockup had Wind down first.
- It shows when her plan has the bedtime step (then with "Tonight: {session}"), or when her goals include sleep, mood or PMS.
- None in discreet mode, as with all of For you.

**My plan in week 1.** The bedtime step says "Tonight: {session} with Dr. Megha", as it did from week 2.

**Yoga nidra.** A softer figure: rounded parts with a glow behind them. The same parts light as she names them.

**Wording:** the wording review, section 19.24.

**Tests:** `test/sleepwell.mjs` stands in for the phone's player, which moves with the clock and stops at the track's end.

## 68. Version 39.25: insights she can find, and a free plan beside the doctor

Mohit, 27 Oct: "in diary i added past 3 months of period dates and i see no insights when is expected ovulation and fertile
period when could be next period etc. can you audit and advise around all such gaps". Then "do a proper audit", and "also
consider if user is not on any plan but symptoms show then advise to start a relevant free plan along with doctor advise". The
audit is `docs/insights-audit-2026-10-27.md`. He saw the mockup (claude.ai/artifact/GkhV6csPv6vqrrQMt34sbw) and said "go ahead
and build it and dont offer free government doctor let it be in explore section".

**G1, why no date shows** (core `whyNot()`). One engine for Today and the Calendar. It returns:
- `{ k: 'hormones' }`: she is on the pill or another hormone medicine, so her bleeds follow it;
- `{ k: 'guess', d }`: the latest of her last 3 starts is still a guess (`guessedStart()`), so its gaps don't count;
- `{ k: 'few', n }`: fewer than 2 counted gaps; `n` is how many more starts she needs;
- `{ k: 'irregular', a, b }`: her last 6 counted gaps spread too far for a likely range (`rangeInfo`'s FIGO rule);
- `null` when a date shows, before her first period, or while her cycles aren't counted (a pregnancy, after a birth, a pause,
  periods stopped, a hysterectomy).

`reasonHtml(w)` draws the line (`.why-row`) and `wireWhy(v)` its one tap:
- hormones: Me's health (`me-health`);
- a guess: that period's dates (`openCycleEdit(d)`);
- too few: "Add a past period" (`openPastPeriod()`);
- irregular: What your diary shows, which explains how Sakhi counts (`explain`; Cycles in a build without it).

Where it shows:
- Today's cycle card, with or without a plan. It takes the place of "When gaps change a lot we show counts" and of the old
  guess note.
- The Calendar's Today strip, except for a guess: the calendar has its own box (G4).
- Never on a shared phone or in discreet mode.

**G2, What Sakhi can tell you** (`knowCard()`). The top of Cycles, under the signal cards, while something is missing:
- the next period date (`rangeInfo`);
- fertile days and ovulation, only when `fertWhy` is `'few'`, `'irregular'` or nothing (the build's launch gate, her stage, a
  method or her age hide the row);
- what repeats (`patterns()`).

Each row says what it still needs: "Needs 2 regular gaps · you have 1", "Needs 6 regular gaps of 21–35 days · you have 1", "Notes
on 3 periods · 0 so far". There is one "Add a past period" (`#ap-add`) on the page:
- in this card when past dates would help (fewer than 2 gaps, or fertile days need more);
- otherwise in My cycles (`cyclesCard(noAdd)`).

The "What repeats" waiting card gives way to its row (`patternsCard(quiet)`). The card is gone once nothing is missing.

**G3, the pill card** (`pillCard()`). On hormones, in place of G2:
- the pill reminder (`contra-mine`; "My method" for an injection, IUS or implant);
- "Missed a pill?" (`contra-missed`, pills only);
- a Qura doctor for bleeding between packs or side effects (`data-ask`);
- "Not on it now? Change it in Me" (`me-health`).

**G4, a guessed start.**
- The calendar marks it with a dashed day and a "?" (`.day.guess .gq`).
- "Is {d} your real start?" sits under the calendar for the latest guess (`guessBox`).
- "Is it right?" sits on its row in My cycles (`askGuess`).
- "Yes, it's right" drops `approx` from that start (`confirmGuess`), so its gaps count. "Fix the date" opens `openCycleEdit`.

**G5, Period late?** The row under her cycle once it is past her likely range now shows with or without a plan (Version 39.23
showed it only with a plan). Not on a shared phone or in discreet mode.

**G6 and G7, What your diary shows** (`mods/explain.js`, `actsHtml`):
- **A week or month card** leads with "Ask a Qura doctor about this" (the card's own topic, else its title), then "My report for
  the doctor". "Free government doctor" (`access-doctor`) is gone from the cards: free government care stays in Explore.
- **A "today" card** keeps "Free doctor or hospital" (`access-free`): a call-back can't come that soon.
- **"And meanwhile, a free plan"** (`planPair`) shows the 12-week plan for what the card shows, with Start (`data-xp-plan` →
  `S.plan.offer(goal)`, which opens that goal's questions). It replaces Version 39.1's "A 12-week plan for your periods" button.
  The map (`PAIR`):
  - long, short or varying gaps: My cycle plan (My PMOS plan when she has PMOS);
  - a long period, heavy flow or a low Hb: Stronger blood;
  - pain that stopped her day: Easier periods;
  - PMOS signs: My PMOS plan;
  - hot flushes, and low mood in midlife: My midlife plan. Low mood at other stages stays with the doctor.
- **When the pair shows:** only on week, month and watch cards, and only when `S.plan.offerOk(goal)` allows it. That means no
  plan running, waiting or set to start, not in a pregnancy or in discreet mode, and a goal her stage has.
- **Where:** the same buttons show on Diary's What it shows (the short cards). Today's "Sakhi says" row is unchanged: it opens
  the page.

**Wording:** section 19.25 of the review.

**Tests:** `test/whynot.mjs`.

## 69. Version 39.26: her last periods at joining, and when she stopped hormones

Mohit, 27 Oct: "last three months cycle date collection should be part of onboarding so patient has some symptomatic
diagnosis and plan advise from start". Then "yes make a mockup first" (claude.ai/artifact/MfYod5pV8wKtuDERCBjbWB) and "go
ahead and build it". Before this, joining asked only "When did your last period start?". Its quick choices save one guessed
date, and a guess isn't counted, so a new woman began with nothing for Sakhi to read (section 68, G1).

**The Details step** (`renderOnboard`, step 4, for the Regular periods, PMOS, Trying and Periods changing after 40 tiles):
- "Your last 3 periods". The pill question comes first.
- **A calendar** (`.jd-card`) opens on this month and goes back up to a year. Days after today can't be tapped.
  - A tap marks the day a period started; a second tap takes it off.
  - A start within 9 days of another moves that one.
  - Under it: "{n} periods marked · gaps of {a} and {b} days", and each date as a chip with ✕.
- **"How many days does it usually last?"**, 1 to 14 days, 5 at first.
- **Two ticks:** "Heavy" (soaking a pad in 1 to 2 hours, or big clots) and "Pain that stops my day".
- **"How far apart are your periods, usually?"** shows only until she has marked 2 dates. The PMOS question is unchanged.
- **Continue** asks for a date first ("Tap the day your last period started, or 'I don't remember the dates'").
- **"I don't remember the dates"** (`ob.nodates`) brings back Version 39.10's quick choices and why line, saved as a guess as
  before. "Mark dates on the calendar instead" returns to the calendar.
- **On the pill** (`ob.pill`, Regular periods and PMOS tiles): no calendar. Instead "Your bleeds follow the pill…", "Since
  when have you taken it?" (less than 3 months, 3 months or more, not sure), and the two ticks.

**What joining saves** (`finishOnboard`):
- Each marked day becomes a real start (no `approx`). It gets an end at start + days − 1, kept before the next start, but
  only once that day has passed: a period that may still be going stays open.
- The ticks go on her latest period: `pads: 'pads_4'` and `pain: 'pain_3'`, which her day page shows and the findings read.
  Without dates they go on the guessed start, and on `intake.heavy` and `intake.pain`.
- `intake.gap` comes from her dates when she gave 2 or more (`gapFrom`): most days apart, or `vary` when they differ by more
  than 7.
- `focus.read` and `focus.dates` mark that she gave dates, a tick or the pill.
- **On the pill:** "Less than 3 months" sets `hormonesSince` 90 days back, and "3 months or more" sets it 365 days back. Both
  set `hormonesAbout`, so Me shows no exact "since" date. "Not sure", or no answer, keeps today, as before. The answer is kept
  in `hormonesFor`. Dates she adds later from her time on it stay out of her averages.

**"Your Sakhi"** (`ysRead`) opens with **"What your dates show"** when `focus.read` is set:
- Her next period, the same countdown and likely dates as Today (or how late it is). Otherwise the one reason it can't show
  (`whyNot`, section 68). On the pill, the hormones line.
- What your diary shows' own short cards (`S.explain.diaryCards`, wired by the new `S.explain.wire`): a Qura doctor first,
  her report, "Check the signs", and the free plan beside the doctor step (section 68, G6). Start opens that plan's questions.
- "Your gaps are in the usual range" when her counted gaps are 21 to 35 days (45 in her first years) and no card shows.
- When fertile days start (`fertWhy` is `few`).
- "An early read from the dates you gave. Not a diagnosis." Nothing new shows for "I don't remember the dates" without a tick.

**Me, "When did you stop?"** (`openStopSheet`): switching "On hormone medicine" off asks first:
- **Today:** `setHormones(false)`, as before. Her cycle counts again from her next period.
- **Earlier:** a day up to 2 years back becomes `hormonesUntil`. The periods since then count.
- **I was never on it:** removes `hormones`, `hormonesSince`, `hormonesUntil`, `hormonesAbout` and `hormonesFor`. Earlier
  spans stay.
- **"Keep it on"** changes nothing.

Switching it back on starts a new exact "since" (the about-flag goes).

**Tests:** `test/joindates.mjs`. `test/join.mjs` takes `dates`, `dlen`, `heavy`, `pain` and `hfor`; without `dates` it opens "I
don't remember the dates" first, so the suites that join keep their guessed start. companion, firstday, firstday-walk and
protect tap "I don't remember the dates" before the quick choices.

**Wording:** section 19.26 of the review.

## 70. Version 39.27: fix the loop and the truth

Phase 1 of the minimalism audit (`docs/minimalism-audit-2026-10-27.md`, R01 to R07; mockup
claude.ai/artifact/2a1AsJqHy4x9RyqR61GFQ8). Mohit, 28 Oct: "go ahead and build it and make reminders by default on no need
to ask user and no need for 90 minute gap wherever needed have reminders". So reminders are on by default with no question in
Sakhi's words, and R02 keeps only the order fix: no spacing rule and no cap.

**R01, reminders on by default** (`autoNotify` in core):
- Phone reminders (`settings.notify`) are on from the start. On Android 10 to 12 there is no prompt, so they are simply on,
  at boot and whenever she comes back to the app.
- Android 13 and newer still shows its own "Allow" once (`prompts.notifyAuto`). It comes at the first of:
  - Today after her first-run tour (never during it);
  - "Start my plan";
  - a reminder she sets herself, which may ask again (`autoNotify(true, true)`).
- "Don't allow" is final: Sakhi doesn't ask again on its own.
- Off stays off. The Me > Reminders switch sets `settings.notifyOff`, and only she turns them on again (the switch, the
  heads-up card's "Remind me", or a reminder she sets, which clears it with a "Phone reminders are on" toast).
- **Gone:** the "Turn on phone reminders?" sheet (`askNotifyNow`), the "Get a heads-up before your period?" sheet
  (`askNotifyIntro`), the setup card's reminder row, and the Start card's "Allow reminders" and "Ring on time?" cards.
  "Ring on time?" now comes only when she sets a daily reminder herself (the pill, a medicine), as before.
- **The Start card** names what will ring, in her evening's order (`remLine`): "Reminders are on: your 9:15 pm walk, your 10
  pm check-in, your 10:30 pm wind-down and a note the day before your period. Nothing shows on the lock screen. Change them any
  time in Me > Reminders." Discreet mode leaves the period note out. When she switched them off, or the phone said no
  (`S.alerts.blocked`), the line says so and where to change it.
- **The heads-up card's "Remind me"** (`#hu-rem`) turns them on in one tap.
- **No period note while she is trying for a baby**, as the heads-up card already skipped her.
- `S.alerts` gains `auto(ask)`, `off()`, `blocked()` and `period()`.
- **Existing women:** a woman whose reminders were off without `notifyOff` gets them on once, on her next open. Sakhi can't
  tell an old "Not now" from never being asked.

**R02, the check-in after her last step** (`ciAt` in the plan):
- The check-in rings at her time (8 pm unless she picked one), or 45 minutes after her time to move when that is later, but
  not later than 45 minutes before her bedtime target. A walk after dinner (9:15 pm) puts it at 10 pm.
- A time she picks herself stays exactly as picked (`remPick`). That covers the Start card's chips, her plan settings and an
  evening time set in Reminders, which `pauseSync0` reads through `ciSet`.
- An older plan's 8 pm reminder moves after her walk on its next open.
- The times to pick gain 9:30 and 10 pm. Every screen that names the check-in time reads `ciAt`. Her settings say "10 pm,
  after your walk".
- **No spacing rule** (Mohit): the walk cue, the check-in and the wind-down each ring at their own time. Only a wind-down due
  within 15 minutes of the check-in rides on it (`windNear`, before: 60 minutes).

**R03, her steps carry on after week 12:**
- From day 85 a 12-week plan carries on by itself: `d.keep` (section 49's "Keep it light") and `d.carried`. `carrySync` runs
  in the plan's new `beforeRender` hook, so Today shows it at once.
- It doesn't carry on for the after-birth plan (it keeps its own end page), for pregnancy (no end), or for a woman who
  already saw her end page (`endSeen`).
- **Today**, until she opens her results: "Your 12 weeks are done. Your steps carry on." with "See your results"
  (`plan-end`) and a Stop that asks once. Her steps stay. No second card in "Sakhi says".
- **`plan-end`** (`renderEnd`) is her 12 weeks' results page: her days out of 84, her result, the card for everyone, and
  "Your steps carry on", "Work on something else" or "Stop my plan".
- **Reminders** (`remEnd`): a plan that carries on books its reminders to 4 weeks past week 12 from the start (day 112), so
  day 85 still rings. After that they run to 4 weeks past the last day she opened Sakhi, and never past month 12. Mohit wants
  reminders wherever they are needed, so the audit's 4-week stop with a "keep going" question was not built.
- A plan she leaves soon after day 85 counts to her last active week (`pastEntry`), so her next plan starts at her level.

**R04, every line about her is true:**
- Findings say "{k} of your last {m} gaps" with her real count (`vars.m`).
- `fertWhy` checks gaps outside 21 to 35 days (or more than 7 days apart) before "too few", so long gaps never promise
  fertile days. The notes meter then promises "what repeats for you, with a fuller report for your doctor" (`meter_rep`).
  "Needs 6 regular gaps · you have {n}" counts only gaps of 21 to 35 days.
- The ring legend says "Usual range 21–35 days".
- The weekly quiz card is headed "Sach ya Myth?".
- A period logged while she is trying for a baby counts for her garden quietly: no burst and no growing petal on screen.
- Wording fixes:
  - "Your step" for one step;
  - "Tomorrow" lines without "today";
  - a badge pop-up that says when she earned it, not "Earn your first petal.";
  - the check-in's footnote says only "Nothing is scored here." until she saves;
  - the current cycle in Cycles reads "cycle day 49", as Today counts it.
- Today and Diary keep room under the last card wherever the + button can show (`body.fab-page`).

**R05, each plan measures what it promises:**
- **Pain plan:** "Pain today?" with the day page's 4 answers.
  - It shows on the first 3 days of each period, once per period, in her plan line on Today, in place of "noted for your
    results".
  - If she skips it there, the evening check-in asks.
  - One tap saves it on today's period entry (`S.cycle.setPain`), where `painCompare` reads it.
  - Never on a shared phone or in discreet mode.
- **Hot-flush goal** (the midlife plan):
  - "Hot flushes" takes Bloating's place in her quick chips while the goal runs, before her periods stop too. This changes
    section 60's one quick set for her.
  - Her result is "Days with hot flushes", 30 days before her start against the last 30 days.
  - The weekly symptom diary is no longer a step for this goal (`progs/v1.js` meno R5); its tile stays for more detail.
- The golden plans and the plan baseline were re-recorded.

**R06, her free plan never folded away:**
- When a month or week doctor finding and her plan's offer (Today's "Ready for you", or a plan waiting to start) are due
  together, they are one card (`.xp-pair`): the finding, a Qura doctor and her report first, then "And meanwhile, a free plan"
  with "See my plan". The plan's own card steps aside (`S.explain.pairsPending`; `S.plan.offerPair`, `S.plan.offerGo`).
- With no finding, the offer is the first card in "Sakhi says".
- The journey recorder now fails on a tap inside a closed fold.

**R07, safety one tap closer:**
- The after-birth danger cards have "Call 108", "Call 102", "Call 112" (and 14416 where it applies). Each opens the phone's
  dialer with the number filled in, and Copy stays small under them.
- Help shows from the first joining screen. While she joins, its sheet holds only the rows that open on top: "Call 112 now",
  "Other helplines" and "Thoughts of harming myself or my baby".
- Help's first row is "Call 112 now" (a `tel:112` link), with "Other helplines" under it.

**Tests:** `test/minimal.mjs`. Updated: notify, tours, fieldtest, value, firstday, companion, notices, goals, pmosplan,
results, carryon, daily, winddown, follow, insights and cyclefirst, plus the re-recorded golden and progs baselines.

**Wording:** section 19.27 of the review. New lines wait for the doctor: "Pain today?", "Days with hot flushes", the meter's
promise, and the findings' "{k} of your last {m}".

## 71. Version 39.28: your doctor first

Mohit, 28 Oct: "I want to not always keep pushing for Asha/ANM because women in tier 1 and 2 will be consulting a private
gynaecologist". Mockup: claude.ai/artifact/TyUgHfhf9GNmpkEsMkMnsu ("go ahead and build it"). The government and ASHA wording
stays the default only for a woman who says that's where she goes. Before she answers, and for a private doctor or "Nowhere
yet", Sakhi says "your doctor", and the free government options become one quiet line (they stay in Explore). Emergency
numbers, danger signs, the tests and their weeks, and every dose are the same for everyone.

**Her answer** (`state.situation.care`):
- `'private'` (a private gynaecologist or doctor), `'govt'` (a government hospital or health centre), `'asha'` (her ASHA or
  ANM) or `'none'` (nowhere yet). No key means she hasn't answered.
- The government route is `govt` or `asha`. Everything else (unanswered, `private`, `none`) reads "your doctor"; `none` is
  "your doctor" with the government option one tap away, which is what "Sakhi shows you both kinds" promises.
- **Joining** (step 5, between Details and "Does anyone else use this phone?"; the share step is now 6):
  - "Where do you usually go for women's health?", with 4 answers, each with its line. One tap on an answer goes on.
  - Continue goes on without an answer. Back returns to Details. The progress bar stays on Details.
  - "You can change this any time in Me."
  - `finishOnboard` saves `sit.care`; the update flow (`join-update`) doesn't ask.
  - `test/join.mjs` takes `care` (without it, Continue) and `stop: 'care'`.
- **Me:** "Where I get care" (`#me-care`), after My health, shows her answer or "Not chosen yet".
  - It opens a sheet (`careSheet`): the same question, the 4 answers, and "This changes where Sakhi sends you for check-ups,
    tests and tablets. Emergency numbers stay the same for everyone."
  - Done saves it; closing the sheet keeps her old answer.

**For modules** (`S.care`, beside Care near me's `on` and `load`):
- `route()` gives her answer or null; `gov()` is true for `govt` and `asha`; `asha()` is true for `asha` only.
- `altRow(go, label)` is the free government option as one quiet row (`.item.care-alt`, a dashed outline), opening `go`.
- A module reads the doctor route as `!!(S.care && S.care.gov && !S.care.gov())`, so an older core keeps the government words.
- A line with doctor-route words carries them as `doc` beside its `en` and `hi` (iron's help lines, the findings' lines).

**Iron tablets** (`mods/iron.js`), on the doctor route:
- Her doctor's dose comes first and is suggested away from pregnancy and the 6 months after a birth: "As my doctor
  prescribed". The weekly tablet comes from the ASHA or ANM, so only the government route suggests it at 20 to 49.
- "Your iron tablet protects you…" (not "The red iron tablet"); the pregnancy plan without "red"; the weekly tablet "is free
  at government health centres under Anemia Mukt Bharat"; her doctor's dose "as often as they said".
- **"How often did your doctor say?"** (her doctor's dose, on every route): Every day, Every other day, or Once a week
  (`d.every`: 1, 2 or 7).
  - Once a week asks the day and works as the weekly tablet does.
  - Every other day: a tablet yesterday makes today a day off ("No tablet today. Your next one is tomorrow.", and nothing on
    Today). The reminder rings every 2 days from her last tablet (`every: 2`, starting at `lastTick`).
  - She can change it on the started plan; Once a week then keeps today's weekday.
  - The doctor's summary names "As my doctor prescribed" and the rhythm.
- The strip running low: "Get your next strip before it runs out, from your chemist or your doctor." No ANM stock line.
- "When to get help" and "If it upsets you" name her doctor (no ANM or ASHA). No "My ASHA or ANM" row unless she saved her
  ASHA's number.
- One quiet line, "Free iron tablets at government health centres (Anemia Mukt Bharat)", opens the schemes for her stage
  (pregnancy, after the birth, or periods). The footer says only "Your ticks stay on this phone."

**Pregnancy check-ups** (`mods/preg.js`), on the doctor route:
- "You need at least 4 check-ups; your gynaecologist may see you more often. Tick each one as you have it."
- Registration, scheme money, PMSMA and JSSK (`gov: true`) leave the plan, and so leave Home's "Due now", My plan's
  `S.preg.plan.due()` and the reminders. One quiet line takes their place: "Free at government hospitals: check-ups on the
  9th (PMSMA), the birth (JSSK) and scheme money (PMMVY)", to the pregnancy schemes.
- Her own tips (`DOC_TIP`): her gynaecologist and her reports in one file for the check-ups; the anomaly scan "Your
  gynaecologist will tell you where to book it"; iron and calcium "your doctor prescribed"; Td "at your check-ups"; "Your
  doctor's and ambulance numbers"; the hospital bag without the MCP card; folic acid without "Your ANM… gives it free".
- No "My MCP card" or "My ASHA" buttons and no U-WIN booking. "First check-up and tests" (without "free").
- A missed one: "ask your gynaecologist". The reminders line: "At 10 am on the first day of each check-up and test."

**After the birth** (`mods/post.js`), on the doctor route:
- The after-birth page has no "Next ASHA visit" row.
- Check-ups and baby's vaccines:
  - "Check-ups for you and your baby…";
  - her own check: "see your gynaecologist for a check for yourself, even if you feel well";
  - vaccines: "Your baby's doctor gives each vaccine and writes it on the vaccination card", "Missed a dose? Ask your
    baby's doctor what to give, and when.", the birth doses "check the vaccination card", and one line "Vaccines in the
    national schedule are free at government centres (Universal Immunisation Programme).";
  - iron and calcium "your doctor prescribed, for as long as they said", "Ask your doctor for a haemoglobin (Hb) test", and
    no JSSK note.
- The ASHA's visit days fold behind "Does an ASHA visit you? See her visit days" (`.pst-asha-q`), after her own check.
- The danger signs and their call buttons are unchanged.

**Help and the doctor screen** (core):
- "See a doctor" reads "A call with a Qura doctor, or a free government doctor" (the government route keeps "A free
  government doctor, or a call with a Qura doctor").
- "My ASHA" shows in Help for the government route, or when she saved her ASHA's number.
- On the doctor screen, the free government doctor comes after Qura's ways, as it already did with Qura's WhatsApp number
  (Version 32's order stays for the government route).
- "Call 112 now" is first for everyone.

**My plan** (`mods/plan.js`), on the doctor route: a Qura doctor comes before the free government doctor in her care team,
on the end page's card ("Show my doctor", a Qura doctor, then the free government doctor), in the plan's doctor row and in
the month card (`byRoute`). No words change.

**What your diary shows** (`mods/explain.js`), on the doctor route:
- Long or heavy periods and a low Hb: "Ask your doctor if you need iron tablets. They are also free at government health
  centres."
- A late period: "Any chemist sells one; your ASHA gives Nishchay kits free."

**Not in this version:** the Learn library (`content.json`) and the other modules' ASHA and ANM lines (access, contra, asha,
screen, pregtest, teen, pregtools, ttc, cond, intimate). The government services in Explore are unchanged for everyone.

**Tests:** `test/care.mjs`. Updated:
- me (the row order) and results (the end page's card order);
- companions, plans, fieldtest, knowledge (Kilkari) and protect (PMMVY), seeded on the government route (`care: 'govt'`);
- goals (registration is a government-route item);
- the suites that join by hand: firstday, firstday-walk, joining, joindates, companion, protect, journey-video and
  taps/join-run (one more tap while joining).
The golden plans were re-recorded. Only two things changed: the pregnancy plan's "Due now" line (no registration or scheme
money), and the order of the doctors on My plan.

**Wording:** section 19.28 of the review. Every doctor-route line waits for the doctor.

## 72. Version 39.29: the doctor route everywhere

Mohit, 28 Oct: "now do the Learn library and other modules too". Version 39.28 (section 71) routed the most-used screens. This
version carries the same rule through the Learn library and every other module. Before she answers, and with a private doctor
or "Nowhere yet", she reads her doctor (or the chemist, for supplies) first, and the free government option second.

**One switch in core** (`docOn()`: `situation.care` is neither `govt` nor `asha`):
- `t(key)` reads `key_doc` when it exists (checked in English first, so the check is cheap). A module adds a doctor-route
  line by adding `<key>_doc` beside `<key>`, in English and Hindi. No call site changes.
- `tx(o)` reads `o.doc` when the line carries one: `{ en, hi, doc: { en, hi } }`. Modules with an `L(en, hi)` helper add
  `LD(en, hi, docEn, docHi)` beside it.
- The Learn library: an article's `doc` holds its doctor-route paragraphs beside the reviewed ones, `doc["<field>_<lang>"]` (a
  string for title, summary and qura_line; `{ "<index>": "<text>" }` for body and see_doctor). Core's `L(a, k)` lays them over
  the reviewed paragraphs.
- A key that only ends in "_doc" (hs_doc, "See a doctor") has no base key, so it never switches.
- Version 39.28's explicit choices (iron, preg, post, explain) still work. preg's check-up tips moved onto the week tips'
  `doc`, so the week pages and the check-ups list read one text.

**What changed** (the full list, English and Hindi: `docs/doctor-route-review-2026-10-28.md`):
- **Learn** (73 paragraphs in 30 guides): lines that sent her first, or only, to the ASHA, ANM or PHC now name her doctor or
  gynaecologist (or a chemist) first, keeping the free option. Examples:
  - "Ask your doctor for a haemoglobin test; it is also free at the PHC";
  - "Your doctor decides these doses";
  - "Your 6-week check with your gynaecologist";
  - "Take your reports";
  - "Not sure if it counts: call your doctor";
  - "If an ASHA visits you, she comes on days 3, 7, 14, 21, 28 and 42".
- **Contraception:** your doctor checks a method is safe; "see your doctor" when an injection or a Copper-T is overdue or
  LAM ends; the emergency pill "any chemist sells it without a prescription"; missed pills "ask your doctor".
- **Pregnancy:**
  - "Your doctor's count wins";
  - the Hb and iron notes, "your doctor may increase your iron";
  - "My pregnancy card" for the MCP card page;
  - the week tips (folic acid, the first tests, Td, iron and calcium "your doctor prescribed", the anomaly scan, gentle
    exercise, the hospital bag);
  - "a hospital equipped for" a high-risk birth.
- **After the birth:**
  - weighing the baby and watching a feed with a nurse or her doctor first;
  - formula: "ask your baby's doctor";
  - the BP check for swelling "by your doctor";
  - contraception "your gynaecologist can give any of these".
- **The other modules:**
  - screening starts with her doctor;
  - the pregnancy test: the chemist first and "see a doctor to confirm it";
  - trying to conceive: a gynaecologist first;
  - intimate health, pregnancy loss, midlife, periods, anaemia, the iron journey, For my family, the birth plan, Tools'
    reports, My plan's doctor lines;
  - core's pregnancy page.

**What stays the same for everyone:** emergency numbers, danger signs and where to go in an emergency (the Learn danger-signs
guide keeps its CHC, FRU or district hospital list; the after-birth fever flag keeps "PHC, CHC or hospital today"). Also
unchanged:
- every dose, test and week;
- the government services in Explore (`access.js`), My ASHA, and the Learn "services" guides;
- scheme facts (PMMVY, JSY, JSSK, PMSMA, Anganwadi food, Kilkari);
- the free-supply and free-test lists, and the HPV vaccine programme;
- the teen programme pages (RKSK, for girls under 18, who don't sign up).

**Tests:** `test/care.mjs`, section 9:
- every `_doc` pair in English and Hindi, and every Learn override on a real paragraph in both languages;
- the switch both ways (`t`, `tx`, an article title);
- no string sending her to the ASHA or ANM without its doctor-route words outside the government pages (an explicit keep list
  for the rest);
- a Learn guide and the anaemia page by route;
- the guide in Hindi at 360 px.

**Wording:** section 19.29 of the review, with the packet above. Every new line waits for the doctor.

## 73. Version 39.30: a danger sign typed in search, for every woman

Mohit, 28 Oct, after walking a competitor tracker whose offline chat answered "very heavy bleeding and I feel faint" with its
welcome message ("build 1 first"; mockup claude.ai/artifact/Y4Kom9DHfyiw4buDUQRi8B). Until now only a pregnant woman's
search put the danger guide first (`dangerQ` stops at `isPregnant()`). For anyone else, "bahut bleeding ho rahi hai aur
chakkar aa raha hai" opened After an abortion first, and "very heavy bleeding and I feel faint" found How to read a pregnancy
test (its "faint T line"). Neither showed 112.

**The card** (`urgentCard(q)` in core, `.card.srch-urg`): when her words match one of Help's "Call 112 now" signs, one card
comes before everything else in `searchResults`, so in Explore's search and Learn's search, at every stage:
- Help's heading "Call 112 now if" and the sign that matched, in Help's own words: `s1b` (soaking a pad every 1–2 hours and
  feeling dizzy or breathless) or `s1a` (a late period or positive test with one-sided or shoulder-tip pain, dizziness or
  fainting); "Call 112 now" (`tel:112`) and "Help and safety" (`data-go="help"`).
- Thoughts of harming herself or her baby: Help's `hs_harm` and `hs_harm_s`, then Call 14416 (Tele-MANAS) first and Call 112,
  as in discreet mode's urgent card (review DP-5), and Help and safety.
- `data-urg` names the match (`s1b`, `s1a` or `harm`); `data-say` lets the speaker read it. It shows in discreet mode and on a
  shared phone too: she typed it.
- No new wording: every line is Help's, already doctor-checked in English and Hindi.

**What matches** (`urgentQ(q)`, on core's `norm`, so typed or spoken, Hinglish or Devanagari, with or without the nukta):
- **harm** (checked first): suicide, "kill myself", "end my life", "want to die", self-harm, harming herself or her baby,
  "khudkushi", "aatmhatya", "marna chahti", "mar jaana chahti", "jeena nahi chahti", "khud ko nuksan", "baby ko nuksan", and
  the same in Hindi script.
- **s1a**: a late or missed period, or a positive test, together with one-sided or shoulder pain, or dizziness or fainting.
- **s1b**: bleeding words (bleed, spotting, "pad … bhig/soak", "heavy period/flow", "period bahut zyada aa raha", and the blood
  words through `DANGER_BLOOD` with `DANGER_LAB` and `DANGER_BLEED`, as pregnancy uses them) together with dizziness,
  fainting, blacking out ("aankhon ke aage andhera") or breathlessness.
- **Not a sign:** bleeding or dizziness alone, "khoon ki kami" (and its dizziness), a blood test or blood group, a "faint line"
  or "faint positive" on a pregnancy test, period pain with dizziness, "this pain is killing me".

**Unchanged:** in pregnancy, `dangerQ` and its danger-signs guide as the quick answer, now under the card when a card shows;
the results themselves and their order; Help.

**Tests:** `test/urgent.mjs` (40 checks): the signs in English, Hinglish and Hindi, each card's heading, line and `tel:` links,
the card first; 12 near misses with no card; Help and safety opens Help; Learn's search; pregnancy (no card for bleeding
alone, the guide still the quick answer), after the birth, midlife, discreet mode; Hindi at 360 px, the harm card's 3 buttons
without sideways scroll; no page errors.

**Wording:** none new (section 19.30 of the review notes where Help's lines now also appear).

## 74. Version 39.31: the Cykel traps

Mohit, 28 Oct, after walking a competitor tracker ("build the trap suite first"). That app showed "Fertile window" and a
"Low" chance of pregnancy to a woman 16 days late, drew a next period that never came, read "High" on the first day of a
period because of a positive strip, said "regular" and "varies quite a bit" on one card, and kept a period reminder for a date
her new period had already moved. `test/traps.mjs` replays those states on Sakhi and reads every screen with dates (Today,
the Calendar this month and next, the Days tab's week, Cycles, the fertile-days page) and the reminders it books.

**What it holds Sakhi to** (91 checks):
- **The control:** steady cycles 2 days before ovulation show the chance (high), fertile days ahead, a predicted period and a
  period reminder, so the checks below can fail.
- **Late by 3, 16 and 60 days:**
  - no chance and no phase on Today;
  - no fertile days from today on;
  - no predicted period drawn;
  - the fertile-days page says "due or late";
  - no "Fertile window in" or "Ovulation in" on Days;
  - no period reminder for a range already past;
  - "Period late?" under her cycle from 16 days.
- **A period today with a positive strip:** no chance and today not fertile. **A positive strip** never changes the chance
  or the fertile days.
- **Hormones, a pregnancy, after the birth, midlife (46), discreet mode:** no chance and no fertile days anywhere. On hormones
  and in a pregnancy, no predicted period and no period or late reminder.
- **Gaps of 23 to 45 days, or only 2 gaps:** no chance or fertile days, and Cycles says what it needs.
- **Every scenario:**
  - no "Low chance";
  - no day called safe (only "no safe day" wording);
  - Cycles never shows "Regular" beside "Yours vary by".
- **Logging her period:** the old period and late reminders go, and new ones follow her new range.
- **Hindi:** the late case in Hindi at 360 px.

**The one gap it found, fixed:** 3 days late, the Calendar still drew "Predicted period" on today and tomorrow (the tail of a
period that didn't come) while Today said she was due or late. The Calendar now draws predicted period days only while
`predictInfo().late` is false; her likely range still shows.

**Wording:** none new.

## 75. Version 39.32: Getting ready for a baby, the full plan

Mohit, 28 Oct: "I need to have next plan for users who are planning for a baby", then "Build this plan personalised to users
who are planning for a baby". Design: `docs/plans-design-and-build-2026-10-24-programmes.md` section 8, rewritten doctor first
(sections 71 and 72); mockup claude.ai/artifact/LYTf9jYeCMPfWw5ZYjMY4r; every line for the doctor in
`docs/baby-plan-review-packet-2026-10-28.md` (page: claude.ai/artifact/XXz1VPJicgVJMAY6v3rrUt).

**The plan.** `web/progs/v1.js` gains `ttc` version 2 (live). Its `goals` are `[{ stage: 'ttc' }]`, so every goal of the trying
stage opens it: ready, irregular periods, PMOS and weight (the last three opened the cycle plan before). Version 1 stays in the
file and runs on for the women who started it (`d.pv`); they get version 2 at their next 12 weeks. `golden.mjs` is
byte-identical (its plans are version 1); `progs/baseline.json` gains `ttc@2`.

**A few things first** (the intake screen `baby`, after her goal; her body is asked only for the weight goal, as the PMOS plan
asks):
- 4 medicine lines (plan.js: a daily medicine, diabetes, a past pregnancy with a spine or brain defect, sickle cell or
  thalassaemia) and the 9 lines of Months of trying's verified list (`S.ttc.flagList()`), as checkboxes, none needed;
- ticked from Months of trying (`S.ttc.flagsOn()`) and from her goal (PMOS, very irregular periods);
- "How long have you been trying?" (4 answers, optional), not asked when Months of trying has a date (`S.ttc.since()`);
- on Start, Months of trying's own ticks become her answers (`S.ttc.setFlags`).

**Her version** (`babyOf`, saved in `d.intake`):
- `bdoc`: `meds` (any medicine line), `gyn` (any verified line, 40 or over, a year of trying under 35, 6 months at 35 to 39,
  or Months of trying's own rule from its date), `both`, or `std`;
- `bset`: `mix` for PMOS (her tick, Me's PMOS line or the PMOS goal) or the weight goal, else `std`; a BMI under 18.5 (My
  body's, or the start answers' `bmi`) makes her food set `uw` whatever her answers;
- `focus` stays `habits`, so her minutes stop at 150 a week (the packet's 250 waits for question 5).

**Her day** (the spec's steps; at most 4):
1. `ttc.folic`: "My folic acid tablet" ("My tablet" in discreet mode). Until she has it, done on its page (so the check-in doesn't ask): "Not got it yet? See where"
   opens `ttc-folic`; "Not yet: remind me tomorrow" answers today's step. Then a daily tick.
2. Her move: the ladder walk (cap 30 a day, the hold rule), or for `mix` the PMOS plan's yoga (`yoga.cycle`).
3. Her food habit (`plate`) from her set, one new every 2 weeks, each with its own reason (`plan_fb_b*`) and meal line:
   - `std`: greens, dal, fruit, the tea gap, milk or curd, half the plate sabzi;
   - `mix`: half the plate, no sweet drinks, greens, protein at breakfast, a millet swap, the tea gap (the PMOS plan's 4 keep
     their reviewed words);
   - `uw`: an extra katori, greens, peanuts or chana, milk or curd, fruit, the tea gap.
4. The first that is due: the ready check (`ttc.ready`: days 3 to 7, weeks 6 and 12, then every 4 weeks); strength at home on
   days 2 and 5 of her week from week 7 (Gentle start within 182 days of a birth; not for `mix`, whose yoga has its strength
   days); the calm few minutes (`ttc.calm`: from week 8, switched on, the 7 days before her likely period); her Hb test
   (`ttc.hb`: days 2 to 14, until she ticks it on the checklist); the checklist (day 4 of her week, from day 2); his part
   (`ttc.his`: from week 2, day 6 of her week, never on a shared phone). Day 1 has 3 steps.
- New vocabulary: `if` words `week:a-b` and `pday:a-b` (b may be empty: from a on); adapters `ttc.folic`, `ttc.hb`,
  `ttc.ready`, `ttc.his`, `ttc.calm`; intake screen `baby`.
- The 4-week check (`mcDue`) stays off: the ready check takes its place. How it works says "A 2-minute lesson and a look back"
  for every week.

**Her doctor card** (`babyDoc`, the spec's one `start` entry, `@plan_bdoc`): in Sakhi says from day 1 to day 21 until "Yes,
done" ("Remind me to book it" waits 3 days), and in the reveal for every version but the standard one:
- `std`: "Before you start trying", her gynaecologist, and the free line (the PHC or Ayushman Arogya Mandir, or eSanjeevani);
- `gyn`: "See a gynaecologist now", why, PMOS's own line when it applies, the trying page's start line (core's doctor route:
  her gynaecologist first; the government OPD and her ASHA for a woman who picked them) and "Go together";
- `meds`: "See your doctor before you start trying", the checklist's medicines line (if ticked), the higher-dose sentence of
  its folic acid line, and the steady-first line for diabetes;
- a birth under 24 months ago adds the spacing line; every card ends with the Qura doctor's line (food, sleep and habits).
- The months-of-trying `due` card (`@plan_doc_ttc`) is unchanged.

**ttc.js** keeps what the plan needs:
- `ttc-folic`: the checklist's folic acid line a sentence at a time (`VF.folic1` to `folic3`, no ANM line), the Learn library's
  strip line, "Where to get it", the free line; "I have my tablet" turns on her reminder `ttc-folic` (`mod: 'ttc'`,
  `kind: 'med'`, 9 pm daily, so the lock screen says "Time for your tablet", and "Reminder" in discreet mode). Her switch here
  or in Me stays as she leaves it; a reminder she deletes stays gone. It runs with the plan (`folicSync` from `remSync` and
  `pauseSync`), stops after a loss or at the plan's end, and carries on in a pregnancy that follows until 12 weeks. A tap opens
  Today (core `NOTIF_GO.ttc`).
- `ttc-lesson`: the 12 weekly lessons and 4 monthly ones (`LESSONS`), each card read aloud (`data-say`), most lines reused from
  these pages word for word (`VF`, the checklist's lines), urgent lines with Call 112. Today shows "This week's lesson · 2 min"
  as one row under her steps until she taps Done (no title on a shared phone); it waits while the week's look-back row shows,
  so there is one row at a time. My plan lists it. Week 8 has the calm switch.
- `ttc-ready`: 6 questions with no score, her folic acid answer from her last 7 days of ticks (`S.plan.ckDays`), the
  checklist's tobacco line after Sometimes or Daily, "Then and now" from her second check, "Just for me" and no "His part" on
  a shared phone. Saved in `mods.ttc.ready`.
- Core's `PIN_ROUTES` has `ttc-lesson` and `ttc-ready`: on a shared phone with a PIN, they open after it.
- Months of trying gains the warning for women on fertility tablets or injections (packet I6), also in week 11's lesson.
- `S.ttc` adds `flagList`, `flagsOn`, `setFlags`, `since`, `prepHas`, `prepAt`, `prep`, `vf`, `ohss`, `folic`, `lesson`,
  `ready`, `calmOn`, `setCalm`. `S.pregtest.lastPos()` (pregtest.js) is her latest saved positive result.

**Moves before her period** (`lutOn`): on this plan, in the 14 days before her likely period, all month when her dates can't
say, and while it is late (never on her period days), `stepsOf` gives Tadasana for Bhujangasana and sitting quietly for
Vakrasana (the routines' own reviewed moves), the sun salutation becomes Gentle start (`routineOk`, `todayPlan`), and Yoga and
moves says so. Yoga and moves also says "Moving most days is enough".

**Moments:**
- her period: "A fresh start" (`perLine`, `perBanner`), no failure words;
- a positive test she saved since her plan started (`posDue`): "Your test is positive" in Sakhi says; "Yes, move me on" marks
  her pregnant from her last period start, as Me does (with no period date in 300 days, Me asks); "Not now" for that test;
- a loss: the plan rests as before (section 43), with the line for after methotrexate or a molar pregnancy;
- her 12 weeks: My progress and the results count her tablet's days, her checklist and her minutes a week; the end card says
  her steps and her tablet carry on. Pregnancy is never a result.

**My plan** (`babyCard`, under her steps): her 12 weeks in 4 parts (this one marked) and her doctor month (12 months after
Months of trying's date, 6 at 35 to 39, none at 40 or over: a gynaecologist from the start), folded after week 1 to one line
(her doctor month, or this part of her 12 weeks); then this week's lesson and the ready check (`.pl-baby-tools`), and from
week 8 the calm switch. Her tablet is in her steps, so no row repeats it.

**The minimalist baseline** (Mohit, 28 Oct: "make this minimalist approach a baseline for this project for future plan
builds"; CLAUDE.md; `docs/minimalism-audit-2026-10-27.md`, sections 3 and 4). How this plan meets it:
- her evening as Version 39.27 set it (reminders on by default wherever she needs one, no spacing rule, no cap): the walk
  nudge, the check-in after it, her tablet as a medicine at 9 pm; no wind-down ring (no bedtime step);
- day 1 has 3 steps, any day at most 4; one row under her steps at a time; one "Sakhi says" card (her doctor card takes the
  first-day card's place);
- one new screen before her first step, "A few things first": it decides her doctor card (medicines first is a safety
  line), reuses Months of trying's answers and her goal, and needs no answer. "Your day" asks 2 questions fewer (no bedtime,
  no work), and her body only for the weight goal;
- one home for each fact; what she reads once folds after week 1; no new tours, tips or celebrations; the shared-phone
  check ("My tablet", his part hidden, lessons and the ready check behind her PIN).
- the reveal keeps a doctor card only for the versions that need a check first; the standard version's routine card shows
  on Today from day 1 (one home);
- measured with `web/test/taps/join-run.mjs ttc tour` (Neha, install to her plan started), against the committed build: 53
  taps as before, 24 screens (+1: A few things first), 7 scrolls (+2 on its 13 lines);
- `progs.mjs` 5b checks every live plan's evening order (the check-in after her move nudge).

**Found on Mohit's phone (28 Oct, the live test of 0.39.32-pilot; Mohit: "fix gaps 1, 2, 3, 5, 6 and 7").** No new wording.
- A plan made at another stage doesn't wait (`pendingOk`): after she switches to trying for a baby, an unstarted period-pain
  plan no longer stands between her and her stage's plans, and Today offers only a goal of her stage now (`offerCard`). It
  waits again if she switches back. (Installed as vc 60.)
- A plan she stopped earlier left `nudgeMade`, so the new plan's nudge looked deleted and the 6 pm the Start card named never
  rang: a fresh start (`commitStart`) and `closePlan` clear it.
- PMOS she told Sakhi is ticked on "A few things first" (`pcosSaid()`: Version 36's "What would you like help with?" in an
  older diary; a diagnosis in `situation.pcos` was ticked already through Months of trying), so her version is right
  without asking again.
- While she tries for a baby, "My PMOS plan" isn't offered (My plan's suggestions, Me's setup, Explore's PMOS tile) until a
  plan has started; `plan-pmos` opens My plan, where Getting ready carries the PMOS food and moves.
- Core's "Tell Sakhi your stage and goals" (an older diary after a stage change) waits while her plan for this stage runs or
  waits: the plan holds her stage and goal.
- How it looks: the tablet's reminder is the app's switch (`label.item`, as in Plan settings) with no "Noted." toast over
  it; a lesson card that opens with its story or its urgent line keeps it clear of the speaker; a read lesson's tick stays
  on its line.
- Then (Mohit: "yes fix and reinstall"): one "Your 12 weeks" on My plan. Getting ready's 4 parts (`BPH`) are the path card's
  own (`pathHtml`, as pregnancy and after a birth have theirs), this one marked, with her doctor month (`bdocMonth`); after
  week 1, `weeksCard`'s this week and next name her part (the 4-week check and her results stay). `babyCard` keeps only her
  tools: this week's lesson, the ready check, the calm switch.
- The "How to do it" sheet's tool button (`toolOf`) names a page with no tile by its step ("My folic acid tablet",
  "1-minute ready check"), never its address.

**Tests:** `node test/baby.mjs` (130 checks: starting, her version, day 1 and the doctor card, her tablet, her weeks, food,
moves, lessons, the ready check, moments, every verified line word for word, Hindi at 360 px, version 1 running on, the
baseline (her evening's order, one row under her steps, no repeated row, the fold), and sections 16 and 17 for what the live
test found). progs.mjs knows the new words and the two live versions of `ttc`, and checks every live plan's evening order.

**Wording:** section 19.32 of the review; every line in the packet, the new ones waiting for the doctor.

## 76. Version 39.33: the walkthrough's fixes (Today, My plan, Diary)

Mohit, 28 Oct: "can you do a walkthrough of home my plan and diary section if any gaps or bugs", then "Proceed fixing all".
Found on his Flip5 (vc 62): 3 bugs and 7 gaps. No new health wording; the new lines are UI words (review section 19.33).
- **Edit period dates** (core `renderCalEdit`): the + button stays off while it is open (`renderFab`: it sat on Save). The days
  Sakhi guessed (`guessDays()`: the 4 days `bleedingDays0` adds after a start with no end day) are lighter, with one line
  (`ce_guess`); a day she taps is hers. They stay marked: unmarked, one tap inside a period would save a new period. Save
  still rewrites only the periods she changed, and a run that reaches today stays open.
- **The calendar's key** (`periodKey`): a start (solid, "Period started"), the days after it (lighter, "Bleeding", as the
  calendar draws them), spotting, and "Predicted period" whenever the month shows predicted days. On a shared phone, one
  period word as before.
- **Today**: a step she marked "Partly" says "Partly done"; "Next" is the first step she hasn't touched, and none after her
  check-in (`nx`). Under "Your last gaps", a latest cycle left out says why in Days' own words ("Period from 1 Oct · not
  counted: hormones"); never on a shared phone or in discreet mode.
- **Cycles**: "Cycle length (last {n})" names the gaps it has; "3-day period · 23-day cycle"; a finished cycle with no end day
  says so (`mc_noend`).
- **"Feeling okay"** (`okRule`, in Today's quick set, the day page, the first log and the period sheet): a pain, body or
  low-mood sign she adds takes it off, and "Feeling okay" takes those off. Calm, happy and discharge stay, and so does a
  danger sign (bleeding or the baby moving less in a pregnancy).
- **My progress** (Getting ready): "From what you logged." (it compares nothing with before); her checklist's count once, in
  its own card (Version 38's "Before-pregnancy checklist", with "Open the checklist"), so her 12 weeks' line there leaves the
  checklist out (`resultOf(d, true)`, `plan_bres_p`); the end page and the month summaries keep the full line.
- **The day page's flow choices** one to a row, so "Soaked one every 1–2 hours" is as tall as the rest.

**By design, not changed:** the care team's order (V39.28 `byRoute`), "Sakhi says" hidden after the check-in, a cycle on the
pill not counted.

**Tests:** `node test/walkfix.mjs` (34 checks, a diary like Mohit's; 21 fail on the build before it).

**Then (Mohit, 29 Oct: "use recommended wordings"):** the plan's foot line says what the plan holds (`footT`): Getting ready's
folic acid tablet and versions (`plan_foot_ttc`), the pregnancy plan's iron tablets (`plan_foot_preg`), one neutral line on a
shared phone (`plan_foot_d`); a plan not started yet is read by the version it will start. Getting ready's "What consistency
brings" shows its tablet's and its Hb test's reviewed reasons and then "How long it usually takes" with the verified figure
(`plan_cons_tab`, `plan_cons_hb`, `plan_cons_long`). Golden re-recorded: only the pregnancy plan's foot line changed (56 days).
Tests: baby.mjs section 18 (137 checks). Wording: review section 19.33.1 (waits for the doctor).

## 77. Version 39.34: My pregnancy, safety first (`preg` version 2)

Mohit, 29 Oct: "next is I am pregnant custom plan can you advise how it will differ" (advice
`docs/pregnancy-plan-advice-2026-10-29.md`), "create mockup" (claude.ai/artifact/U54RRpvvHBVpAhBvPTcEgT), then "Proceed
building with minimalist approach". This builds the safety layer and the daily steps; the rest waits (77.6). New lines wait for
doctor review (review section 19.34).

### 77.1 The plan
- `web/progs/v1.js`, `preg` version 2. Version 1 runs on for a woman on it (`specOf(pk, d.pv)`). There is no offer card, as with
  Getting ready's version 2.
- `intake: { screens: [{ id: 'psafe' }], day: ['food', 'milk'] }`, `slots: { max: 4 }`. The steps in order:
  - Due now (`preg.due`).
  - Her walk by her tier (`first`): green `mins: 'light'` (cap 30, the hold rule); amber `mins: 10` with
    `sub: '@plan_walk_easy'`; red none.
  - Her goal's step (version 1's map).
  - The pelvic floor set (`pf`): a `link` to `post-pelvic`, counted from its trainer (`from`, `check`), `priv`,
    `if: ['gw:13-', 'pday:4-', 'route']`.
  - Day 1 has 3 steps or fewer.
- The engine's new vocabulary (`test/progs.mjs`):
  - `if` keys: `gw:a-b` (her pregnancy week, `gwAt(iso)` from `S.preg.info()`); `pt:green|amber|red` (her tier, live from
    her ticks and her week); `pnow` (a sign that doesn't wait, until she checks her answers again).
  - `minutes` steps take a whole number of minutes (5 to 30) and a `sub` (an `@key`).

### 77.2 Before you start (`psafe`)
- `renderIntake`'s `psafe` screen (`psafeHtml`, `wirePsafe`). Nothing has to be answered (`qsOf` asks nothing).
- Right now: core's `s1c` (the reviewed danger list) with "None of these" and "Yes, one of these". A yes shows Help's "Call 112
  now" card (`S.access.lv('now')`, access.js's `LV`) with 112, 108 and 102.
- Told by her doctor (`PSAFE`):
  - told to rest (`plan_ps_rest`, with `_doc` for the doctor route);
  - 7 of the MCP card's marks (`S.preg.risks()`, `S.preg.riskName(k)`). An earlier C-section and age hold nothing, so the
    screen doesn't ask them;
  - not sure.
- Her card's marks come ticked. At the start her ticks go back to the card (`S.preg.setRisks`, the 7 marks only).
- `psTier(flags, week)`:
  - red: told to rest, high-risk, high BP, Hb under 7, or twins from 28 weeks;
  - amber: any other tick;
  - green: none.
- The tier card changes as she ticks, and the summary shows it (`sumRows`).
- Her answers go in the plan's intake (`pregOf`): `pflags`, `psafeW` (her week) and `pnow` (the day she said yes).

### 77.3 Her answers again
- `cardKind` 'psafe' comes after a positive test's card and before day 1's. `psafeDue(d)` is:
  - 'now' the day after a yes, with only "Check my answers";
  - 'wk' once she reaches 14 or 28 weeks, having answered earlier, with "Nothing has changed" too (`#pl-ps-same` records her
    week).
- Its words are plain (`plan_ps_re_p`), so it shows on a shared phone.
- `plan-psafe` (`renderPsafe`) is the same screen for the plan she is on. Save updates her intake and her MCP card, and nothing
  restarts.
- My plan's settings has a row for it (`psSetRow`: "My safety answers", with her tier).

### 77.4 The check-in from 28 weeks
- `mvAsk(d)`: version 2, 28 weeks or more, and not on a shared phone.
- "Your baby's movements today" (`MV`: usual, less, unsure, none), never a count:
  - less or not sure: pregtools' `k_today`, with Call 108 and 112;
  - none: Help's "Call 112 now" label and pregtools' `k_now`, with 112, 108 and 102.
- The answer is saved in her day log (`mv`). Less, not sure or none sets `pnow`: her walk waits until she checks her answers
  again.
- The feedback keeps the call card. With "As usual" it shows "Tonight" and the symptom guide's side-sleeping line
  (`plan_mv_side`, a verified copy), then tonight's Wind down as before.

### 77.5 Home
- Core's pregnancy card, from 24 weeks: "Baby moving less? Get help" (`preg_less_b`) opens `pregtools-kicks`, whose 2 lines are
  at the top.
- It shows for every pregnant woman, not on a shared phone, and only where the kick page is shown (`api.toolShown`).

### 77.6 Not built yet (each needs a reviewer first)
- Pregnancy moves (3 routines, about 9 poses; a women's-health physiotherapist).
- The weekly "How are you in yourself?" and its crisis card (a psychologist or psychiatrist).
- Weekly lessons from the week pages, the bag and birth-plan steps, the quiet-spell card, leaks from 20 weeks, the 3-day pack
  for late joiners, and folic acid carrying on from Getting ready.
- An offer of version 2 to women on version 1.

### 77.7 The minimalist baseline (CLAUDE.md)
- **Her evening:** no new ring. Her check-in rings as before, her tablets ring from their pages, and there is no walk nudge in
  pregnancy (`careTime`).
- **Today:**
  - day 1 has 3 steps or fewer (the pelvic floor joins on day 4), and no day has more than 4;
  - "A quick check" is the one Sakhi says card.
- **Ask less:** one new screen before her first step, for safety. It reuses her MCP card's marks and Help's line, and nothing on
  it has to be answered.
- **One home for each fact:** her marks live on the MCP card, the movement lines on the kick page, the danger line in Help.
- **Read once:** no new explanation to fold, and the danger lines never fold.
- **No new tours, tips or celebrations.**
- **The shared phone:** the pelvic floor step is private. A shared phone gets no movements question and no button, and "A quick
  check" uses plain words.
- **Taps:**
  - starting a pregnancy plan takes one more screen and one more tap (Continue; nothing to answer);
  - the check-in from 28 weeks takes one optional tap;
  - `web/test/taps/` counts joining for the cycle, trying and no-plan stages only, so these come from the screens.

**Tests:** `node test/pregplan.mjs` (53 checks).

## 78. Version 39.35: the pregnancy walkthrough's fixes

Mohit, 29 Oct: "can you do a walkthrough on my phone and advise on gaps or bugs" (his Flip5, 0.39.34-pilot vc 66, marked 30
weeks pregnant), then "proceed" on gaps 1 to 7. These are interface words only, plus lines the doctor already checked (review
section 19.35).

- **The kick page** (`pregtools.js` `renderKicks`): its 2 lines are followed by Call 112, 108 and 102 (`.ptl-calls`), before
  the counter. Version 39.34's "Baby moving less? Get help" opens this page.
- **Bleeding inside a pregnancy** (core):
  - A start on or after her pregnancy's last-period date, with no end day, isn't stretched into Sakhi's 4 guessed days
    (`bleedingDays0`, `inPregAt`). The calendar and the week strip show only what she logged.
  - Today's pregnancy card shows the check-in's reviewed line (`ci_flag_preg`) with Call 112 while bleeding was logged in the
    last 3 days of the pregnancy (`pregBleedNow`, `.pg-bleed`). Never on a shared phone.
- **Reminders reach the phone** (`buildNotifs`): one reminder that can't be built, or a failing period heads-up or late nudge,
  no longer stops the rest of the list reaching Android. On the phone, the check-in's alarms stayed booked for a while after
  the stage switch. The test page sends the right list, so the cause wasn't reproduced. The app re-sends its list on every save
  and whenever it comes back to the front.
- **My plan's "Your pregnancy"**: a part that has passed is grey (`li.gone`), not ticked, because her check-ups there may still
  be due.
- **The stage sheet** (`openStage`), on "I am pregnant":
  - it asks the first day of her last period first, filled from her diary (`lmpGuess`: her last start within 310 days), then
    the scan's due date;
  - its note is in that order (`stage_preg_note2`);
  - a line says her week and due date as she enters them (`pregIsLine`, from `weeks_preg` and `due_on`). The scan's date wins,
    as in `pregInfo`.
- **One ask after a stage change:**
  - core's goals card (`exCard`) waits while "Your plan has changed" shows (`S.plan.changing`);
  - "See my pregnancy plan" opens on her goal (`wireChange`, iq 0), because her goal chooses her step.
- **"No, I marked it by mistake"**:
  - Starting a plan keeps the plan it replaced (`d.prevPlan`, `snapPlan`). It keeps everything but the log, the past plans, a
    waiting plan and her body measures, and it also keeps her answers.
  - The stage sheet's mistake (`pregEnd` with `mistake`) brings that plan back as it was (`restorePrev`): its start, version,
    answers and check-in reminder. The mistaken pregnancy plan isn't kept as her last plan.
  - "Yes, it ended" (a loss) brings nothing back.
  - Stop (`closePlan`) and the next start clear it.

**Not changed yet** (the walkthrough's items 8 to 15, waiting for Mohit):
- My plan's "start moves only after your doctor says" line beside the safety screen's walk;
- the plan reveal not naming the pelvic floor from day 4, the movements question or the 14 and 28-week checks;
- "My safety answers" titled "Before you start", and its row without a ›;
- the foot line's iron tablets;
- the "This week of pregnancy" tile's word break;
- the "Updated" toast over the tour;
- the soft pink "Call 112 now" cards;
- "Your day" asking food and milk again.

**Tests:** `node test/pregwalk.mjs` (25 checks; 16 fail on 0.39.34's code).

## 79. Version 39.36: the pregnancy walkthrough's gaps 8 to 15

Mohit, 29 Oct: "fix gaps 8 to 15 too" (section 78's list).
- **8:** My plan's "In pregnancy, start moves only after your doctor says it's OK for you" (`plan_preg_moves`) shows only on
  version 1. On version 2 her safety answers decide her walk.
- **9:** the reveal's "What happens when" for version 2 adds rows by her week (`pregRvRows`):
  - the pelvic floor from day 4 (`plan_rv_pf`), or from week 13 if she is earlier (`plan_rv_pf13`);
  - the checks of her answers still ahead: 14 and 28 weeks (`plan_rv_ps14`), or 28 only (`plan_rv_ps28`);
  - her baby's movements in "How did today go?", from 28 weeks (`plan_rv_mv28`) or each evening (`plan_rv_mv`).
  None of this shows on a shared phone.
- **10:** the safety answers page is called "My safety answers" (`plan_ps_set`), and its settings row has a ›.
- **11:** the foot line (`footT`) names "the iron tablets your doctor prescribes" (`plan_foot_preg`) only for her iron goal,
  whose steps include her tablet. Any other pregnancy goal gets the neutral line (`plan_foot_d`).
- **12:** the 4 tiles' labels break between syllables with a hyphen where they can (`hyphens: auto`). `overflow-wrap: anywhere`
  stays, so a word with no break point never runs off the tile at 200% text.
- **13:** while a tour card is open (`.tour-pop`), a toast shows at the top of the screen (`app.css`, `body:has(.tour-pop)`).
- **14:** the plan's "Call 112 now" cards (the safety screen's and the check-in's no-movement card) are ink, as Explore's
  urgent card on Home (`.card.dark.pl-urg`). Help's own card is unchanged.
- **15:** "Your day" isn't asked when everything it asks (food and milk) is already in My food (`S.food.known`, `daySkip`). The
  summary still shows her answer, with Change (`a.dayShow`), and the plan takes My food's answer (`dayFill`). Starting a
  pregnancy plan is one screen and one tap shorter for her.

**Tests:** `node test/pregwalk.mjs`, checks g8 to g15 (39 checks in all; 10 of the new ones fail on 0.39.35's code). baby.mjs
18 now checks the iron tablets line on an iron-goal pregnancy plan; pregplan.mjs reads the page's new name.

## 80. Version 39.37: the three-plan walkthrough's fixes

Mohit, 29 Oct: "can you do a walkthrough and verify if all three plans diary and home works properly". The walk is
`test/threeplans-walk.mjs`: PMOS, Getting ready and My pregnancy, day 1 to day 85, in the test browser, plus his Flip5. Then
he said "fix all 8". No new wording.
1. **Cycles' "Next period date"** (core `knowCard`): once today is past her likely range, it says how late she is, as Today
   does (`late_n`, `late_n1`), never a range that has passed.
2. **"Due now" doesn't hold her day** (My pregnancy):
   - the `preg.due` step is `soft`;
   - a soft step counts only when done (`held()`: `dayCount`, `allDoneToday`, Today's and My plan's counts, the check-in's
     count, the rings);
   - it comes after her daily steps (`actionsFor`), and My plan's heading counts her daily steps.
   So with her daily steps done, her day is full and closes itself, while the check-up waits for her visit.
3. **One "Tomorrow" line**: with tomorrow's own line (`s.tom`), the check-in says "See you tomorrow at {t}." (`plan_ci_see`),
   not "Tomorrow: the same steps" too.
4. **Trying for a baby, a long wait for her period** (explain `late_now`): its line starts with core's reviewed `late_p` ("A
   week or more late and you could be pregnant? A home test is the first step."), then the doctor. Not in midlife.
5. **Cycles in a pregnancy**: no example cycle numbers and no "Add a past period" (`exampleCard`).
6. **One home for what her records say**: Today's card and the card in Cycles. My plan's row (`recordsRow`) and the Diary's
   note on Calendar and Days (`xp-banner`) come only for what can't wait (now or today), so an urgent row keeps its Call
   button.
7. **The day her 12 weeks end**: Today shows the end card (`carryRow`) without the week's look back (`cardKind` 'rev').
8. **One celebration at a time** (`joy.js` `celebrate`, core `toast`):
   - the check-in's own "A petal for your garden" line, with no petal panel over it;
   - a badge earned with a petal comes as a short toast, not a panel over the page (her garden shows it);
   - a toast more than 0.7 s old doesn't follow her to the next screen.

**Tests:** `node test/threefix.mjs` (22 checks; 15 fail on 0.39.36's code). records.mjs 10 now checks that a signal that can
wait has no row on My plan. Golden is re-recorded for 2: the pregnancy plans' "Due now" after the daily steps, and the counts.

## 81. Version 39.38: the 38-week walk's fixes

Mohit, 29 Oct: "can you do a walkthrough on my phone and check gaps", at 38 weeks with My pregnancy running on his Flip5; then
"fix all 8". New wording: Help's "See a doctor" line in a pregnancy only (review section 19.38).
1. **Day complete counts her daily steps** (plan `dayDoneHtml`): `held()`, as Today's count, so a "Due now" that waits for her
   visit isn't in "All n done today" (a done one is).
2. **My plan counts the same steps**: "How your plan works · Every day n steps" (`rhythmGrid`) counts the steps that aren't
   `soft`, and the steps' bar has one mark for each step in `held()`, as the count beside it.
3. **Her tablets** (preg `PLAN` items `ifa` and `ca`):
   - each is started (`auto`, "Done: from your MCP card, logs or tools") once she takes it in Sakhi: its reminder on
     (`preg-ifa`, `preg-ca`), or a tick in the last 14 days (`tabStarted`); iron also from the iron tracker, as before;
   - Today's "Due now" (`S.preg.plan.due`, Home's row `dueNames()`, and `markedOn` for today) is check-ups and tests only
     (`TAB_IDS`): her tablets have their own rows and reminders. The doctor's report keeps them in its "Due now"
     (`dueNames(true)`), as before.
4. **"My baby is born"** (core stage sheet): from a pregnancy the birth date starts on today and "I am breastfeeding" starts
   ticked. She can change both. Without a pregnancy, nothing is filled in.
5. **Bleeding in a pregnancy, in the Diary** (core):
   - `inPregAt` starts 14 days after her last period's first day, so that period (her LMP, or a scan's date a few days off it)
     stays a period with its own days;
   - My cycles: a bleed inside the pregnancy is its date and "Bleeding · not counted: pregnancy", never "{d} – now · Cycle day
     n";
   - Days: its group is "Bleeding · {d} · not counted: pregnancy", and its tags say "Bleeding", not "Period started" or
     "Period ended";
   - no "Add a past period" while she is pregnant.
6. **For you from 34 weeks** (core `forYouTiles`, `FOR_YOU.pregLate`): her hospital bag, birth plan and contraction timer come
   right after her goal's first tool (that one leads, Version 38). Five tiles at most, as before.
7. **The week page's urgent card** (preg `urgentAction`): "Call 112 now if" has a "Call 112" button (`.pg-call`) under it.
8. **"See a doctor" in a pregnancy** (core Help and `renderAsk`):
   - Help's row says her ANM or gynaecologist (her gynaecologist on her doctor's route) looks after the pregnancy, and a Qura
     doctor helps with food, weight and sleep (`hs_doc_s_preg`, `_doc`);
   - the screen it opens starts with the pregnancy page's reviewed line (`ask_p_preg`, `_doc`, the words of preg
     `hub_ask_p`).

**Tests:** `node test/latepreg.mjs` (27 checks; 19 fail on 0.39.37's code). plans.mjs 1 now counts Home's row without the
tablets ("and 3 more"); the report's line is unchanged.

## 82. Version 39.39: the 3D figure in the player, and a rest between moves (Mohit, 29 Oct: "build it into the player with the rest screen")

The mockup: claude.ai/artifact/4mTtM4VPZWwrHs5bb1r2Ka (row 1, the rest screen; row 2, every move in 3D). The figure is made
with free tools in `web/tools/fig3d` (README.md there): Blender, MPFB and MakeHuman's CC0 packs. Every position is the app's
own drawing (`P`, `ANIM`, the sun salutation) posed on her, so no move changes. Section 81 is the other session's Version 39.38.

**What the app carries (`web/fig`, made by `web/tools/fig3d/install.py`, about 1.6 MB):**
- `fig/v/<name>.webm`: one loop per moving drawing (VP9, which plays in Android's WebView and in the tests' Chromium), with the
  drawing's own timing. Also `chairfwd`, the seated forward bend, and `sun-01` to `sun-11`, the sun salutation's flows.
- `fig/s/<pose>.webp`: a still of every position (the 43 drawings, `chairsit` and `chairfwd`), and `sun-00` to `sun-11`, each
  sun salutation position framed as its flow is.
- `fig/fig.js`: `window.SAKHI_FIG = { v: 1, loops, stills, sun }`, loaded by index.html before the modules. `android/build-apk.sh`
  copies `web/fig` when it is there.

**The player (`mods/plan.js`):**
1. Each move plays its loop (`figLoop`: the step's own `fig`, or the `ANIM` loop named by its pose). It is muted, looping and
   inline, with the move's still as its poster.
2. A held pose (tree, child pose, Shavasana, the calm sitting) shows its still. Shavasana and the calm sitting have her eyes
   closed.
3. The sun salutation shows its first position as a still. Each next position flows in once (no loop, about 1.2 s; the drawings, 0.9 s) and holds
   on its last frame.
4. "Reduce motion" shows the still. The left side is the same picture, mirrored (`pl-mirror`). Pause pauses the loop too.
5. A video that can't play (not found, can't decode, or the WebView wants a tap first) gives way to the move's still
   (`wireFig3d`). A build without `web/fig`, or `SAKHI_CONFIG.fig === false`, shows the drawings as before.
6. The routine's list, and the rest's next move, show each move's still (`figThumb`), or its drawing without `web/fig`.
7. `CHAIR_FWD` (child pose with knee pain) has its own loop, `fig: 'chairfwd'`. Its drawing still reuses the chair squat.
   Sun salutation steps carry their place in the twelve (`si`).
8. Previous, Pause and Next (`.pl-ctl`) stay above the tab bar (sticky) whenever the page is taller than the screen. On a
   short screen (860 px or less) the timer is 100 px and the gaps tighter. The time left shows once, in the ring; `#pl-left`
   still carries it for screen readers. At 720 px or less the figure is at most 220 px wide. Before this, on Mohit's Flip5
   (360 × 800 in the app), a move whose words take three lines pushed the buttons under the tab bar (30 Oct, "fix the
   buttons").

**Her arms (Mohit, 30 Oct: "hand movements needs improvement", then "i meant entire arm movements"; `web/tools/fig3d`):**
1. Her arms straighten. The elbow's limit counts from her rest pose, whose elbow is already bent about 34 degrees, so a straight
   arm stops 4 degrees short of straight. Before, no arm straightened past 34 degrees.
2. A loop moves a free arm joint by joint, in arcs: each pose keeps its arms as joint turns (`Kit.finish`). IK holds a hand that
   stays put, on the floor, a wall or her knees.
3. The forearm turns the palm. Her shoulders lift when her arms go overhead.
4. Each hand has a shape:
   - relaxed when the arms swing;
   - flat for namaste and overhead;
   - spread on the floor and the wall;
   - curled round her knees and feet;
   - a mudra when she sits.
5. Two loops now follow their own words rather than the drawing:
   - Palm tree opens the arms wide, meets them overhead and rises on the toes, as it says ("Rise on your toes if you can"). It
     takes 8 seconds.
   - Loosen up swings the arms in big circles ("swing your arms in big circles"), 3 seconds a circle.
   - Their stills: palms together overhead, and both arms up, the top of the circle.

**Her moves against their words (Mohit, 30 Oct: "butterfly needs rework", then "other moves need improvement too"):** every
pose was checked from the app's camera and from a three-quarter view, and every changed loop frame by frame.
1. Butterfly: the soles press together on their outer edges, toes ahead and heels drawn in; she sits tall with her hands over
   her feet, her fingers round her toes. Only her knees move, one slow flap in 2 seconds.
2. Step-ups: the whole step, "with one foot, then the other, and step down": the right foot up, then the left, standing tall
   on the step, then the right foot down behind and the left after it. Each foot lifts clear of the step's edge (no foot
   enters the step), and the back knee stays soft, so it never snaps straight. 4.8 seconds a step.
3. Child pose: she sits back on her heels (her hips just above them), her back rounds down and her forehead rests on the mat,
   her arms long in front. Before, her hips stayed high over her knees.
4. Half camel: her hips go forward of her knees ("push your hips forward") and she leans back a little, her head following
   her spine instead of dropping back.
5. March on the spot swings the arms as its drawing does: the forward arm bent with its hand at her chest, the back arm swung
   back past her hip. Before, both hands stayed in front of her. Walking's arms swing a little more.
6. Triangle: she looks up at her raised hand ("Look up if your neck is comfortable").
7. Anulom vilom has its own still (`fig: 'nostril'` on its step, `fig/s/nostril.webp`): her right hand at her nose in Nasika
   mudra, the thumb at her right nostril and the ring finger at her left, as its words say ("Close your right nostril with
   your thumb"). Bhramari and Sit quietly keep her sitting still; without `web/fig` all three keep the sitting drawing.
8. The sun salutation (30 Oct, "sun salutation moves need improvement too"):
   - Hasta uttanasana leans back a little, as it says: her hips forward, her upper back arching, her arms up past her head.
   - Ashwa sanchalanasana lifts her chest about 40 degrees with an arched back, the back knee down and her fingertips on the
     mat either side of the front foot. With her palms flat, her arms would hold her chest down near her thigh.
   - She stands where her hands come down, so the front foot of each lunge stays put and the other foot steps. Before, the
     front foot slid half a metre.
   - A foot that steps lifts clear of the mat, its knee pointing down as it steps back and forward as it steps through. A
     foot that turns over, its toes tucking or its top coming down, lifts as it turns, so no toe goes through the mat.
   - Her arms sweep down in front of her and back up through a swan dive, and from the cobra her hips rise through a plank
     line before her head drops between her arms (`SUN_MID`). Before, her face went 7 cm into the mat there.
   - A hand that turns from fingertips to a flat palm turns before it comes down. Where her body would still dip under the
     mat, the flow's middle lifts her, so nothing goes under by more than half a centimetre.
   - Each flow takes 1.2 seconds instead of 0.9.
   - Her standing positions share one camera and her positions on the mat another (`SUN_VIEWS`), so she fills the frame on
     the mat; the flows down to the mat and back up carry the camera across. Before, one loose camera framed all twelve and
     she lay along the bottom of the frame.
9. Strength at home (30 Oct, "strength moves need improvement too"):
   - Loosen up does all three things its words say: her head turns slowly to each side, one shoulder roll, then one big arm
     circle (8 seconds). It is filmed from her side, where the circle reads as forward, up, back and down; its still, both
     arms up, is too.
   - Chair squats lower slowly (1.8 seconds), sit a moment and stand without her hands: 4 seconds a squat.
   - Wall push-ups stand further back (the wall 80 cm from her heels) and lean from 16 to 26 degrees, so her chest comes
     close to the wall, as the drawing has it. Her palms rest on the wall's face, here and in heel raises (before, 2.7 cm
     into it).
   - Step-ups have a handrail beside the step ("Hold the railing"); her left hand holds it and slides up as she steps up.
   - Bridge lifts and heel raises come down slowly: the bridge holds, then lowers over 2.2 seconds; heel raises pause on her
     toes, then lower over 1.5 seconds.
10. Cycle care yoga (30 Oct, "cycle care yoga moves need improvement too"); its Loosen up, child pose, butterfly, half
    camel and bridge are above:
    - The cobra keeps her elbows bent and lifts her head with her chest ("lift your head and chest gently, elbows bent"), as
      the drawing has it. She starts with her hands beside her chest, so at the top they are under her shoulders. Before,
      her arms straightened, her hands ended far in front and she looked down at the mat. The sun salutation's cobra is the
      same.
    - Knees to chest is filmed three-quarters from her feet (`QUARTER`, stage.py's `VIEWS`), where "rock gently from side
      to side" shows. From her side the rock ran towards and away from the camera and hardly showed. It rocks 14 degrees
      each way (before, 9).

**The rest (the mockup's notes):**
1. After each move and each set: 15 seconds in Strength at home, 10 in Gentle start and Cycle care (`REST_S`, `restAfter`).
2. No rest inside the sun salutation or Calm breath, between her right and left side, or before Shavasana (it is the rest).
3. Getting ready's sun salutation that became Gentle start rests as Gentle start does.
4. The rest screen shows:
   - "Move 1 of 12 done" (`plan_p_done_t`) and "Rest";
   - a blue ring and its time;
   - +20s (as often as she likes), Pause, and Skip rest as the one pink button;
   - the next move's picture, name, time and words ("Next · Set 2 of 2").
5. With her voice on, it says "Rest. Next: {move}." (`plan_p_rest_say`, a visually hidden line); it is off on a shared phone,
   as before.
6. The phone buzzes as the rest starts. The screen stays on. When the rest runs out, the next move starts.
7. "Next" on a move goes straight to the next move: tapping it is skipping. A move after the first has Previous (`plan_p_prev`),
   which goes back one move and starts its time again.
8. The rest counts in her minutes, as Shavasana does. All of Strength at home with every rest is 12 minutes, against 10 for its
   moves alone. `routineMins` ("About N min") is unchanged, because Today, the walk's minutes and the golden plans read it.

**Words:** UI only, in English and Hindi: Previous, Rest, +20s, Skip rest, Next, "{x} done", and the voice line. No health
wording, so nothing waits for the doctor (review section 19.39).

**Tests:** `node test/moves3d.mjs` (63 checks). pmosplan.mjs keeps checking the drawings with `fig: false`, and now meets the
rest before move 2.

## 83. Version 39.40: the 39-week walk's gaps

Mohit, 30 Oct: "can you do a walkthrough on my phone and check gaps" (vc 70, 39 weeks, My pregnancy running), then "fix all 8".
Version 39.39 is the other session's 3D figure (section 82). New words are UI only (review section 19.40).
1. **The labour pain timer calls** (pregtools `ambulance(call)`): on the labour page 108, 102 and 112 each have Call
   (`tel:`), the first one pink. The kick page keeps its Call buttons above (Version 39.35) and its list as before.
2. **One pregnancy start** (core):
   - `excludedWhy` leaves gaps out from `pregInfo().lmp`: the scan's due date minus 280 days when she has one, as her weeks
     already do. Before, it used her last period's date (`pregnantSince`), so a scan months off counted periods inside the
     pregnancy;
   - inside the pregnancy (`inPregAt`, from 14 days after that start) every start is "Bleeding · not counted: pregnancy" in
     My cycles and its Days group, hormones or not, and no day is "Day n of your period" (`dayFacts`);
   - the Calendar draws it as bleeding (lighter), not a period's first day, and in a pregnancy its key is one swatch,
     "Bleeding";
   - Your numbers leave it out of "Periods logged" and the bleeding days;
   - the stage sheet says when her last period and the scan's due date are more than 3 weeks apart (`pregGapW`,
     `stage_preg_gap`): "Sakhi counts from the scan, so check both dates." Saving is as before.
3. **Her own doctor's number** (core `state.mydoc`, `S.mydoc.get()` and `S.mydoc.open(after)`; `data-mydoc` opens the sheet
   anywhere `S.wire` runs):
   - one number, kept on the phone (`net()` has no field for it): a 10-digit mobile, or 0, the STD code and the number;
     +91 is dropped. Save, Cancel, "Remove this number";
   - in a pregnancy on her doctor's route (not on a shared phone): My plan's care team starts with "My doctor · Add your
     doctor's number", then "Call my doctor" with her number; the doctor screen shows "Call my doctor" under the
     pregnancy line (or "Add your doctor's number"); the kick page and the labour timer put her number first, with Call;
   - Check-ups and tests: "Your doctor's and ambulance numbers" has "Add your doctor's number" (then "My doctor" to change
     it) and is done once it is saved;
   - Today's "Due now" (`preg.due`) counts that item on her doctor's route. On the government route it is still My ASHA,
     and stays off Today and My plan (Mohit, 26 Oct).
4. **The labour pain timer on Today** (core pregnancy card): from 37 weeks, "Labour pain timer" (the tile's own name)
   beside "Baby moving less? Get help". Not on a shared phone.
5. **The week page** (preg `wkP`): when her weeks come from the scan, it says the hub's reviewed `hub_scan` line (doctor's
   route: "Your doctor's count wins.") and "Every baby grows at its own pace." (`wk_pace`, `wk_p`'s second sentence).
6. **"Call 112 now if" in one card** (core `callNowCard`, `.action.pg-urg`; preg's `urgentAction`): the Call 112 button
   sits inside the card, under its words, on the week page and Check-ups and tests.
7. **Your numbers**: the spread is of as many gaps as there are ("Spread of last {n}", `spread_n`), and "–" until there
   are 2.
8. **The labour timer on her doctor's route**: "ask your doctor when they want you to come in" (`w_1_doc`).

Core's own About week page (`pregnancy`) only runs without the pregnancy module, so it is unchanged.

**Tests:** `node test/termwalk.mjs` (43 checks). On 0.39.38's code it fails 9 of them, then stops: My plan has no doctor's row.
daily.mjs 4 (My ASHA off Today and My plan) now seeds `care: 'govt'`. Golden is re-recorded for 2: the pregnancy plans' care
team starts with "My doctor", and "Due now" counts her doctor's and ambulance numbers from week 32.

## 84. Version 39.41: the three-plan walk's gaps

Mohit, 30 Oct: "can you do a walkthrough on my phone and check gaps properly for home my plan and diary for all three stage
users which we have curated plans" (My pregnancy on his Flip5, vc 71; PMOS and Getting ready lived day 1 to 85 in the test
browser), then "fix all 10". No new health wording; the new words are UI only (review section 19.41).
1. **Getting ready's 12 weeks** (`pathHtml`): a part that has passed is drawn as passed (`li.gone`, as the pregnancy's path,
   Version 39.35), never a ✓: she may not have done it.
2. **A routine done without the player counts its minutes, once** (`markAction`, `unmark`, `logRoutine`):
   - her Done in the check-in (or a tick) adds the routine's minutes (`routineMins`; Partly, half) to the day's minutes and
     `rmin`, kept in `x.tkr[routine]` so a tap on its tick takes back only those;
   - not when she played that routine today (`x.r`: the player counted it), and playing it later takes the Done's minutes back
     before the played ones go in. So "Active minutes" counts the yoga she does from memory, never twice.
3. **The check-in never asks "Do it now" for "Due now"** (`renderCheckin`): a check-up waits for her visit (the soft step stays
   on Today and My plan).
4. **A pregnancy's look back** (`revH`): "Plan week {n} is done" (`plan_rev_hp`), never a week that reads as her pregnancy's.
   Every other plan keeps "Week {n} is done".
5. **"Why these {n} steps?"** (`whyN`, `openWhyAll`) counts her daily steps, as the heading does.
6. **"A calm few minutes"** shows from week 8, so it says only "For the week before your period." (`plan_bcalm_p2`).
7. **Late while getting ready** (`lateTest`, `lateRow`; pregtest `lastTest()`): her period 14 days or more past its date and
   no test saved since: the week's lesson steps aside on Today (her cycle card's "Period late?" leads there), and My plan starts
   with that row, "Period late? · A week or more late and you could be pregnant? A home test is the first step.", to the test
   page. A positive test brings "Your test is positive · Yes, move me on" (Version 39.32); a saved test ends the row.
8. **"My doctor" in every plan's care team** on her doctor's route (Version 39.40 had it in a pregnancy only), and once her
   number is saved, "Call my doctor" on the doctor screen for every woman (adding it there stays a pregnancy's).
9. **The Diary in a pregnancy:** Days puts every day inside the pregnancy in one group, "In your pregnancy" (`dy_grp_preg`;
   on a shared phone "From {date}"), never under its last bleed; My cycles draws no cycle strip under a bleed in it.
10. **Layout:**
    - a yoga or strength step's minutes go on its Start button ("▶ 8 min", `plan_min_n`), as the wind-down step's already do,
      so its line keeps "Before a meal · Why?" whole from 390 px (at 360 px the line is still cut, but the minutes show). A
      wrapped line would push her first Done below the tab bar at 360 × 800 (FIXES-06) and break the wind-down step's short
      line;
    - from 37 weeks the pregnancy card's 4 buttons are two to a row, equal heights (`.row.hero-btns2`).

**Tests:** `node test/planwalk.mjs` (29 checks; on 0.39.40's code it fails the first and stops at the second: no Done
minutes). Updated for what changed on purpose:
- latepreg 5 and termwalk 2: the one "In your pregnancy" group;
- termwalk 3: "Call my doctor" for a woman who isn't pregnant but saved her number;
- care 6: "My doctor" first in the care team;
- goals 1: the check-in leaves out "Due now"; goals 10: "Plan week 20 is done" on a shared phone;
- follow 1 and 7, daily 1, winddown 2: the routine's minutes on its Start.

Golden is re-recorded for 3: "My doctor" in every care team on her doctor's route, "Plan week {n} is done" in a pregnancy,
and "Why this step?" counting her daily steps.

## 85. Version 39.42: the tracking-stage walk's gaps

Mohit, 30 Oct: "can you do a walkthrough on my phone and check gaps" (vc 72, Tracking periods with no plan running, after a
pregnancy marked by mistake), then "fix all 3". No new words.
1. **One ask on Today just after a stage change** (core): the stage sheet marks the change (`prompts.exStage`). Then, while
   the first card in Sakhi says is her plan offer (`pl-homerec` or `pl-offer`, which already knows her goal), "Tell Sakhi your
   stage and goals" (`exCard`) waits; "Not now" on the offer (or another card leading Sakhi says) brings it back. An older
   diary, which has no mark, is still asked once beside the offer (Version 39.10).
2. **The finding's free plan** (explain `pairGoal`): an irregular-gaps finding pairs "My PMOS plan" when PMOS is in her
   details or her goals, as Today and My plan read it (plan.js `pcosSaid`). Before, only her details counted, so the same
   woman was offered "My cycle plan" on Cycles and "My PMOS plan" everywhere else.
3. **My plan with no plan running** (`renderPlans` `opt.skip`): "What do you want to work on?" is the 12-week plans' one
   home, so "I have PMOS (PCOS) · Suggested" isn't repeated as "My PMOS plan" under Suggested for you or More plans. Short
   tools (For period cramps) stay suggested; when nothing else is, the section goes (no "Nothing to suggest yet" under a
   picker that holds the suggestion).

**Tests:** `node test/stagewalk.mjs` (13 checks; 4 fail on 0.39.41's code). pmosplan 14 finds her PMOS plan as the picker's
Suggested row, with her one other suggestion under it.

## 86. Version 39.43: the PMOS day-1 walk's gaps

Mohit, 30 Oct: "can you do a walkthrough on my phone and check gaps" (vc 75, My PMOS plan on day 1; his Flip5's main screen is
360 dp wide, not about 411 as section 84 said), then "fix all 4". No new words.
1. **A step's line that doesn't fit wraps** (core `fitSubs`): after Today draws (and again once the fonts are in), each step's
   line under its name that is cut (`.today-sub-t` wider than its box) gets `.today-sub.wrap`, a second line. A line that
   fits stays one short line. It is measured on her phone because her phone draws these lines wider than the test browser,
   which cut none of the three his phone cut ("Before a …", "At lunch or dinn…", "Tonight: sl…").
2. **The PMOS (cycle) plan starts day 1 with 3 steps** (`progs/v1.js`, its `sleep` step `if: ['pday:4-']`, as My
   pregnancy's pelvic floor): yoga, her walk and her food habit; her bedtime joins on day 4. Its wind-down reminder follows
   the step (`windOk`), so it starts ringing on day 4 too, and the Start card doesn't name it on day 1. The only live plan
   that had 4 steps on day 1 (the minimalist baseline, Mohit 28 Oct).
3. **Sakhi stays upright** (`android/AndroidManifest.xml`, `MainActivity` `screenOrientation="portrait"`): on its side the
   phone drew the wide-screen frame, taller than the screen, with the tab bar over her cards.
4. **My plan's routine row as Today's:** its name, and its minutes on the play button ("▶ 8 min"), as Today's row (section
   84) and the wind-down step on both pages; no "Start" beside "Cycle care yoga · 8 min".

**Tests:** `node test/phonefit.mjs` (10 checks). Golden is re-recorded for 2: the cycle plans' 3 steps on day 1 (no bedtime
step, "Each ring has 3 parts"), and the routines' minutes on My plan's play button. `progs/baseline.json` re-records `cycle@1`.

## 87. Version 39.44: a step's line wraps in CSS

Mohit, 30 Oct: "yes fix it, commit push and install". Section 86's `fitSubs` measured each step's line once as Today drew, and
on his Flip5 the bundled font landed after that, so the food line stayed cut ("At lunch or dinn…") while the yoga line wrapped.
Now `app.css` lets `.today-sub` wrap (`flex-wrap: wrap`, `white-space: normal`; `.today-sub-t` no longer cut with an ellipsis):
the browser breaks a line only where it doesn't fit, whenever the font lands, and a line that fits stays one short line.
`fitSubs` is gone. No new words.

**Tests:** `node test/phonefit.mjs` 1 counts a line's height (a second line where it doesn't fit, none cut, one line where it
fits).

## 88. Version 39.45: the PMOS walk's gaps

Mohit, 30 Oct: "can you do a walkthrough on my phone and check gaps" (vc 77, My PMOS plan on day 1), then "fix all 4". New
words are UI only (review section 19.45).
1. **My plan's play button keeps its label on one line** (`.pl-st-start`, `.pl-st-play`: `white-space: nowrap`, the icon
   16 px and `flex: none`, as Today's `.today-start`). On his Flip5 the icon had no size and "8 min" broke into "8" over "min".
2. **A bedtime her plan holds back is named before it comes** (`laterStep(d)`: a `use: 'bed'` step with `if: ['pday:N-']`,
   the cycle plan's from day 4 since section 86; its day and its own title as it will show on that day):
   - the reveal's steps card lists the steps of her first day ("Your 3 steps"); before, it said "Your 4 steps" with the
     bedtime while day 1 showed 3;
   - "What happens when" starts "From day 4: wind down, in bed by 11 pm" (`plan_rv_from`, the step's own reviewed title), as
     My pregnancy's "From day 4: your pelvic floor";
   - the Start card's reminders name its wind-down with its day: "your 8 pm check-in and your 10:30 pm wind-down from day 4"
     (`windSoon`, `plan_st_r_wind_n`). A plan whose bedtime is there from day 1 says "your 10:30 pm wind-down", as before;
   - My plan says the same line under her steps (`.pl-later`) until the step joins on day 4.
3. **"Your last plan" is a real one:**
   - "No, I marked it by mistake" with no plan before the pregnancy plan ends that plan (`closePlan(dd, true)`, not archived).
     Before, it stayed, and the next plan she started filed it as her last plan (his phone: "My pregnancy plan · 29 Oct to
     30 Oct · followed on 1 day");
   - with a plan before it (`restorePrev`), the entry made when the pregnancy plan replaced it goes, so the plan brought back
     isn't also her last plan, and the next plan doesn't file it twice;
   - phones that already hold one are mended when Sakhi opens (`mig`): no pregnancy plan with no pregnancy behind it (she
     isn't pregnant, and no loss or birth since it started), and no second copy of a plan or of the one she runs. A loss
     (`pregEndedOn`) or a birth (`deliveredOn`) keeps its pregnancy plan; after a loss it stays off show (review SAFETY-07).
4. **Moves and calm shows the 3D figure** (section 82): each routine's card shows its first position as the figure's still
   (`figThumb`, `.pl-rf3d`), and the walk card plays the walk loop (`walkFig`, its still for "reduce motion" or a video that
   can't play, `wireFig3d`). Without `web/fig`, or with `SAKHI_CONFIG.fig === false`, the drawings stay.

**Tests:** `node test/myplanwalk.mjs` (28 checks; 17 fail on 0.39.44's code).

## 89. Version 39.46: I had a baby, the full plan (`post` version 2)

Mohit, 30 Oct: "yes start with the I had a baby plan" (advice `docs/after-birth-plan-advice-2026-10-30.md`; mockup
claude.ai/artifact/RLz4dU7pQ5A5iVTFCcnqPa), then "proceed building", which takes the advice's 9 recommendations. This builds the
safety layer and the plan. The two new routines and the lessons come next (89.7). New lines wait for doctor review (review
section 19.46).

### 89.1 The plan
- `web/progs/v1.js`, `post` version 2 (live). Version 1 runs on for the women on it, with one offer (89.5).
- Clock: days since the birth (`birthWeek`), `length: { weeks: 0 }`. It runs to the first birthday, which ends it as before
  (`life.needs: 'birth:365'`). `slots: { max: 4 }`, `moves: true`.
- The steps in order:
  - the recovery check (`post.rcheck`, to day 41);
  - the squeezes (adapter `post.pf`). To day 13: "5 gentle squeezes", "during a feed", or "lying or sitting" if she doesn't
    breastfeed. From day 14: "10 squeezes, and the knack". They count from the pelvic floor trainer too;
  - her goal's step:
    - recovery and weight: "Walk a little, as you feel able", to day 13;
    - feeding: Breastfeeding (never after "My baby has died");
    - mood and sleep: the calm and sleep routines;
  - the walk: from day 14, 3 days a week. After back to strong, most days (cap 30, the hold rule);
  - Gentle start, 2 days a week after back to strong, until "Is my body ready?";
  - Strength at home, 2 days a week, from the day after "Is my body ready?" said yes;
  - food while she breastfeeds, once a week.
- Today shows the recovery check last: it is her evening.
- Day 1 has 3 steps or fewer, and no day has more than 4.
- New vocabulary (`test/progs.mjs`):
  - `if` words `unlock`, `pready` and `died`, and an open range `birth:a-`;
  - adapter `post.pf`;
  - `S.plan.actions(iso)` gives any day's steps.

### 89.2 Her evening
- **To day 41, the recovery check is her check-in.**
  - Today and My plan say "Recovery check at 8 pm", with no "How did today go?".
  - `plan-checkin` opens `post-recovery`, and so does its reminder.
  - A saved check marks tonight's reminder done (`recCi`: `ciDone`, `ciDueNow`, `remSync`, `onLog` 'tool' on
    `post-recovery`).
- **From day 42, "How did today go?" with one weekly question: "This week: any leaks?"**
  - Answers: never, sometimes or most days. After sometimes or most days, post.js's reviewed leaking tip.
  - Not within 6 days of her last answer, and never on a shared phone or in discreet mode.
- **The weekly "How are you in yourself this week?"** from day 42, in the recovery check's own mood words, with its crisis card
  (Tele-MANAS 14416, 112). It shows only with `SAKHI_CONFIG.drafts` until the psychologist has reviewed it (recommendation 6).
  To day 41 the recovery check asks about mood every evening, as before.
- **Her 6-week check reminder (`post-6wk`) turns on when she starts** (`commitStart`). The Start card names it ("your 6-week
  check on {d}"). This is the plan's one new ring, because her own check is the plan's backbone and many mothers skip it.
- No bedtime step and no wind-down ring: night feeds make a bedtime target unkind.

### 89.3 Sakhi says (`postDue`, one card at a time, first that applies)
1. For a week after "My baby has died": "We are so sorry", Call 14416, and Support after a loss (`loss-grief`).
2. Days 0 to 7: her baby's danger signs. They are the feeding page's reviewed list (`S.post.babySigns()`), with Call 108 and
   Call 102, and "Got it". Not on a shared phone or in discreet mode.
3. Days 2 to 10, after high BP in her pregnancy: "Your BP check this week".
4. Days 35 to 41: "Your own check at 6 weeks", in post.js's reviewed line for her care route. Under it:
   - "From your pregnancy": a BP check after high BP, the 75 g sugar test after sugar (`fromPreg`);
   - buttons: "Remind me on {d}", "I went", "What to ask for".
5. From day 42 until back to strong opens, "Ready to move a little more?". Its buttons:
   - "I went to my 6-week check";
   - "My doctor said I can exercise";
   - "I feel ready to start gently": a sheet with two checks, both needed (bleeding no heavier when she is active; stitches or
     wound not hurting when she walks);
   - "Not yet": asked again in a week.

   Any of the first three opens it (`d.six`, `d.unlock`).
6. From week 12, after back to strong: "Is your body ready for more?", which opens `plan-pready`.
   - 6 tests: walk 30 minutes; one leg 10 seconds by a wall; 10 sit-to-stands; lift the rice bag 10 times; carry a half bucket
     20 steps; 10 heel raises. A rice or atta bag, never the baby.
   - One question: any leak, heaviness, pain or bleeding?
   - All 6 and none: Strength at home from tomorrow. Otherwise she stays at her level 2 more weeks.
7. Days 21 to 120: "Before sex starts again: choose your method".
   - One optional question: "How is your baby fed now?" (only breast milk; breast and other milk; other milk only). Her answer
     goes in `situation.feedHow` and shows its line.
   - Buttons: See my choices (`post-contra`), I have a method.
   - After "My baby has died" there is no feeding question. Not shown in discreet mode.

The day-3 Qura call card doesn't show on version 2.

### 89.4 "My baby has died" (post.js; the 24 Oct review's blocker)
- **Where:** one link at the end of the after-birth page, and one under the birth date in core's stage sheet. Both open the
  same question, which says what stops and what stays, with "Stop them".
- **What it saves:** `situation.babyDied` (`S.post.died()`). The vaccine reminders are removed, and a feeding goal becomes her
  recovery (`onLog` 'babyDied'). No feeding or food-while-breastfeeding step, no baby card, no feeding question.
- **What changes on screen:**
  - the after-birth page starts with her support, with no feeds, vaccines or baby's age;
  - the feeding page says what it is and leads back to her recovery;
  - Check-ups keeps her own 6-week check, without the vaccines;
  - her recovery check says "Thoughts of harming myself", with its own line (`fl_harm_b`);
  - Today's card says "days since birth" and "Your recovery", with no Feeding button;
  - Explore's quick answers, For you and search leave feeding out.
- **Quiet:** it is saved quietly, so no petal or toast celebrates. "Marked this by mistake? Undo" is on the after-birth page.

### 89.5 Version 1
- Women on version 1 keep it (`d.pv`) and see "Your recovery plan has more now" once.
- "Switch to it" sets `d.pv` to 2. Her start, days and answers stay, because the clock is the birth's.
- "Not now" means it is never offered again.

### 89.6 My plan, the reveal and the recovery check
- **The reveal:**
  - "To your baby's first birthday · a few minutes a day";
  - her steps;
  - "At 8 pm, your recovery check: 2 minutes, with the signs that can't wait";
  - what happens when: day 14, day 42, week 12, the first birthday;
  - the Start card's evening line and its reminders.
- **How it works (week 1):** her steps with the recovery check's time, "Around day 42" and "From week 12".
- **"Your year, in 5 parts":** rest and heal, settle, back to strong, keep going, and her first year to the birthday. Passed parts
  are drawn as passed, with no tick.
- **My progress, Leaks:** first noted (the recovery check's "Leaking", days 14 to 41) and latest (her weekly answers).
- **From My pregnancy:** her high BP and sugar marks carry into the new plan's answers (`intake.pm`), with her MCP card's
  (`S.preg.risks()`).
- **The recovery check:** a new warning sign, "Fever and feeling very unwell", is a "now" sign (Call 112).

### 89.7 Not built yet (each needs a reviewer first)
- Gentle recovery (5 minutes, with a C-section version) and Core and posture (8 minutes), with about 10 new 3D poses. A
  women's-health physiotherapist reviews them first. Until then back to strong uses Gentle start and Strength at home.
- The weekly lessons (about 14, then monthly).
- The family's card on the signs of psychosis.
- The feeding questions on days 3, 7, 14 and 28.
- "Ask someone to take one night stretch".
- The year's look back at the first birthday.

### 89.8 The minimalist baseline (CLAUDE.md)
- **Her evening:** one ring to day 41, the recovery check at her time. One new ring, her 6-week check on its day (reason
  above). No bedtime, no wind-down.
- **Today:** day 1 has 3 steps or fewer and no day more than 4; one Sakhi says card; one row under her steps.
- **Ask less:** no new screen before her first step; one optional question on day 21; nothing from her pregnancy asked again.
- **One home for each fact:** the checks stay on their pages, and My plan names them.
- **Read once:** how it works folds after week 1.
- **No new tours, tips or celebrations.** Marking her baby's death is saved quietly.
- **The shared phone:** discreet titles and private steps hidden. No baby card, no contraception card, and no leaks or mood
  question.
- **Taps:** `web/test/taps/` counts the cycle, trying and no-plan stages, so these come from the screens:
  - starting takes the same screens as version 1;
  - day 21: one optional tap;
  - from day 42: one optional tap a week in the check-in;
  - "My baby has died": 2 taps.

**Tests:** `node test/afterbirth.mjs` (87 checks with 89.9; on 0.39.45's code 10 fail, then it stops: there is no baby card to put
away). companion.mjs's after-birth pelvic goal now names "Your pelvic floor squeezes". progs.mjs knows the new words and records
`post@2`. Golden is byte-identical (its plans are version 1).

### 89.9 The bug hunt before the commit (Mohit, 30 Oct: "can you first test for any bugs or issues")
Edge cases tried in the test browser, and what they found:
1. **"My baby has died" also ends breastfeeding** (`situation.breastfeeding` false, `bfWas` for the undo). So the old plan's
   food-while-breastfeeding step and My food's breastfeeding page go too.
2. **Every other way to the feeding page goes after it:**
   - Explore's Breastfeeding tile (the tile's `hidden`);
   - Check-ups shows as "Your own check at 6 weeks" (a second tile for the same page, `post_t_checks_s0`);
   - the myths deck's baby-feeding cards (joy.js);
   - the plan picker's breastfeeding plan.
3. **A recovery check after midnight is the evening before's**, as her plan's day ends at 4 am (Version 39.23).
   - The check keeps the time it was saved (`rec.at`). `S.post.checkedFor(iso)` reads it, and the plan uses it (`recDone`).
   - Before this, a check at 1 am left the evening's check undone and silenced the next evening's reminder.
4. **A changed birth date moves her 6-week check reminder** (`S.post.sixSync`, when Today draws and when the birth date is
   edited).
5. **A late joiner hears only what is still ahead** in "What happens when".
6. **In discreet mode, the plain words:** "Check-in at 8 pm", never "recovery check".
7. **A rest day in her first 6 weeks doesn't silence her recovery check:** only the check makes her evening done.
8. **Ask less:** after the birth, "Your day" isn't asked again when her pregnancy's answers hold it (`postPre`, `daySkip` with
   `a.known`). The change card goes straight to her answers and "Make my plan".
9. **No baby in her own lines after "My baby has died":**
   - the after-birth page's first line and its urgent box ("Thoughts of harming yourself: 14416 or 112");
   - the recovery check's self-care lines (water through the day; nothing heavy);
   - My plan's tile, "Your own check at 6 weeks".
10. **"Marked this by mistake? Undo" gives back her feeding goal** (`goalWas`, the `babyBack` event).
11. **Discreet mode can still reach back to strong:** "Ready for a little more?" in plain words, without the check after a birth.
    "Is your body ready for more?" is plain too. The other after-birth cards stay off a shared phone.
12. **Checked and fine:**
   - the new plan from My pregnancy;
   - the first birthday (the plan ends and is kept as her last plan);
   - a period logged at day 50;
   - the phone's reminders (neutral titles);
   - a shared phone;
   - the grief page, which "Support after a loss" opens (one line there is about early pregnancy loss: for the psychologist).

**Tests:** `node test/afterbirth.mjs` now has 87 checks, section 15 and section 8 for these. The full run passes on this tree.

## 90. Version 39.47: the four-plan walk's gaps

Mohit, 30 Oct: "Do a proper walkthrough on how all four plans built works, is there any gaps or bugs" (`test/fourplans-walk.mjs`:
one woman per plan joins on a 360 × 800 phone and lives her plan; My PMOS plan to day 85, Getting ready to a positive test, My
pregnancy from 10 weeks to "My baby is born", I had a baby to the first birthday), then "fix all 16". No new health wording: the
new words are UI only, and two lines move (review section 19.47).
1. **Her folic acid carries on into My pregnancy** (plan.js `ttcBefore`, `folicCarry`, `folicRun`, `S.plan.folicOn`; progs/v1.js
   preg version 2's first step `ttc.folic` with `if: ['folic']`; preg.js check-up `folic` `auto`). "Your folic acid carries on to
   12 weeks" said so, but once she started My pregnancy the tablet step and its 9 pm reminder went, and her check-ups said "Due
   now: Folic acid". Now a pregnancy plan that follows Getting ready (its plan before this pregnancy, or the one it replaces)
   keeps the tablet step first and its reminder until 12 weeks. Her check-ups count her tablet as started, from "Yes, move me
   on" on, so "Due now" doesn't name it too. Today's draw syncs it (`remWords`), so it ends at 12 weeks without a tick. The
   reveal says "Your 4 steps" for her (her tablet isn't new, so a new plan's 3 on day 1 isn't broken: it carries on).
2. **A card leads Sakhi says on 3 days at most** (core `leadSlot`, `slotKey`, `slotKeep`; `prompts.slotLead`,
   `prompts.slotAside`):
   - one card she hadn't answered led for months: a doctor finding for 12 weeks, the 14-week quick check to 39 weeks, "Ready to
     move a little more?" to the first birthday;
   - now, after 3 days a card waits under "More from Sakhi" for 7 days while the next card leads, then comes back;
   - her plan's own next card leads in that week (plan.js `aside`, read by `postDue` and `cardKind`): after a birth, her method
     before sex starts again (it showed only on days 21 to 34);
   - a card that keeps her safe always leads: her baby's danger signs, a BP check after high BP in pregnancy, her support after
     a loss, a sign that doesn't wait (`pl-ps-now`), a positive test, her plan's change of stage, or `data-slot-keep`. Urgent
     cards were never in the slot.
3. **The evening reminder says what her evening is** (plan.js `REM_RC`, `remT`, `remWords`): to day 41 after a birth, "Your
   recovery check · 1 minute", then "How did today go? 1 minute". A shared phone still sees "Reminder".
4. **A late period said one way** (pregtest.js `whenOut`): from her diary, "When can I test?" counts from the end of her likely
   range, as Today and Cycles do (the same day said 11 days there and 14 here). A date she types counts from that date.
5. **After a birth, "Plan week {n} is done"** (`revH`), as a pregnancy's: her headline counts weeks from the birth.
6. **The reveal says the Start card's time** (`rvAt`): "At 10 pm, Sakhi asks…" after a 9:15 pm walk, never a fixed 8 pm.
7. **The check-in after her walk, never at its minute** (`ciAt`): in bed by 10 pm with a 9:15 pm walk, 9:30 pm. Before, both
   rang at 9:15 pm.
8. **Her Hb test waits for her visit** (`ttc.hb` `soft`), as "Due now" does: counted once done, never "Do it now" at 9 pm.
9. **My plan's "Next week" never repeats this week** (`weeksCard`): Getting ready's parts and the light plans' lines span weeks.
10. **One length for her recovery check:** 1 minute, as its page says (`plan_rv_d2p`, `plan_st_at_pp`; the reveal and the Start
    card said 2).
11. **The walk of her first 2 weeks opens no page** (progs/v1.js `pwalk` `go: 'plan'`): its "Why?" offered the recovery check form.
12. **"Your baby was born today"** (`bornWhy`; "yesterday" on day 1), never "0 days ago".
13. **A shared phone: each hidden step its own place** (`discNm`): "Your step 2", "Your step 4"; one alone keeps "Your plan for
    today". Today, My plan and the check-in number them the same way.
14. **"Your Sakhi" says where her plan starts** (core `ys_plan_up`): with her plan's Start above, "Your plan: start it above, or
    later on Today", not "Your plan, after your first log".
15. **Free check-ups wait until 6 weeks after a birth** (screen.js `homeTop`), as they wait in pregnancy: her own 6-week check comes
    first. For the doctor to confirm (review 19.47).
16. **The first 6 weeks' line on Today's after-birth card** (core `pp_p0`, `pp_p0b`, `pp_p1`):
    - to day 20, the after-birth page's own healing line (its line without the baby after "My baby has died");
    - from day 21, "Periods can come back any time, and you can get pregnant before the first one.";
    - from day 43, the full line with "When bleeding starts again, log it here." Before, that showed while she was still
      bleeding after the birth.
    - For the doctor to confirm (review 19.47).

**Tests:** `node test/fourwalk.mjs` (37 checks; on 0.39.46's code 27 fail, at least one for each of the 16). Updated for what
changed on purpose:
- minimal 2: in bed by 10 pm, the check-in 9:30 pm after her 9:15 pm walk;
- afterbirth 1: "1 minute".

`progs/baseline.json` re-records `preg@2` (her tablet's step) and `post@2` (the walk's page). Golden is re-recorded for 9: "Next
week" isn't the same line again. The walk itself, `node test/fourplans-walk.mjs`, writes its screens and each woman's words to
`test/shots/fourplans-walk/` (not pass/fail).

## 91. Version 39.48: the switch walk's gaps

Mohit, 30 Oct: "can you do proper thorough check by walkthrough navigating between different stages and using different
programs ... make sure everything sync properly home, diary, my plan etc." (`test/switch-walk.mjs`: five women change their
stage and their plan through the real pages, and at each change Today, My plan, the Diary, Me, Explore, what rings and what is
saved are compared), then "fix all 5". New words are UI only (review section 19.48).
1. **The plan for now, when her stage moves between tracking and trying** (plan.js `fitWhy`, `fitCard`, `wireFit`; `S.plan.misfit`;
   core `finishUpdate`).
   - Getting ready ran on after "Tracking my periods" (folic acid, trying lessons, "you could be pregnant"), and Easier periods
     after "Trying for a baby", with no folic acid. "Your plan has changed" knew only a pregnancy and a birth, and "Tell Sakhi"
     kept the running plan's goal first.
   - Now one card in Sakhi says offers the plan for now:
     - "Not trying for a baby now?" with Choose my plan (her stage's plans) and Keep Getting ready;
     - "Trying for a baby now?" with See Getting ready and Keep {her plan}.
   - Her plan runs on until she chooses. "Keep" is remembered apart from "Your plan has changed" (`fitKeep`), so a pregnancy
     still asks.
   - While the card asks, the goals ask waits (`changing`). A plan that doesn't fit her stage doesn't keep its goal first in
     "Tell Sakhi".
   - A shared phone sees "A different plan may fit now" in plain words.
2. **After a pregnancy loss, Today waits 6 weeks** before "Tell Sakhi your stage and goals" (core `exCard`) and the free check-ups
   card (screen.js `homeTop`), as the check-ups wait after a birth (39.47). My plan keeps "Pick a goal when you're ready". After 6
   weeks, one ask at a time, as before (a plan for her first, then her goals). The timing is for the doctor (review 19.48).
3. **"Tracking my periods" (or trying) after a birth, with no period logged** (the stage sheet): "Log the day your periods came
   back" and the period log, never "Updated." first. Her first period after the birth moves her, as before.
4. **Her 6-week check reminder ends** (post.js `sixSync`, run as Today draws, whatever plan runs): the day after its date, with no
   birth, or in a new pregnancy. Me said "1 on" a year after the birth, with nothing to ring.
5. **The plan she starts leads her goals** (plan.js `commitStart`): changing PMOS for Easier periods left PMOS first, so For you
   showed PMOS pages while Easier periods rested.

**Tests:** `node test/stagesync.mjs` (27 checks; on 0.39.47's code 2 fail, then it stops: there is no card to choose from). Updated for
what changed on purpose: companion 2, her goals after she starts a plan (`["irregular","track"]`). The
walk itself, `node test/switch-walk.mjs [priya|neha|riya|meera|asha]`, writes its screens and each checkpoint's words to
`test/shots/switch-walk/` (not pass/fail).

## 92. Version 39.49: night sweats and sleep

Mohit, 30 Oct: "build the night sweats and sleep link", after the walk through a menopause app (principle notes only). Her hot
flushes and her sleep were both in Sakhi but never met. The midlife plan's check-in never asked how she slept, because that
question came only with a bedtime step (Version 39.22). After a hard night, the card offered a sound and nothing for a flush.
The night-sweats doctor card ("Hot flushes waking you at night", `m_hot`) fired only from the core check-in's "Woke me at
night", which a woman on a plan rarely opens. New lines wait for the doctor (review section 19.49).
1. **"How did you sleep?" in the midlife plan** (plan.js `slpAsk`, `slpCard`): for the hot-flush and sleep goals, on a card of its
   own after her steps and before "How do you feel today?". It is Version 39.22's question in its own words, and it needs no
   answer. Plans with a bedtime step keep it on that step, as before.
2. **"Hot flushes woke me"** (plan.js `slpHot`): a fourth answer for her hot-flush goal, or for a midlife woman (`S.cycle.isMidlife`)
   with hot flushes in her diary in the last 30 days. Never in discreet mode or on a shared phone. It is saved as `slp: 'hot'`,
   and her diary gets Hot flushes and Poor sleep today (`d_hotflush`, `d_sleep`), each only if it isn't there already.
3. **Tonight's card after it** (plan.js `nightHtml`, `.pl-night-hot`): "Hot flushes woke you. Tonight, keep the room cool." The
   card has light cotton clothes and water by her bed, and cooling down and slow breathing if a flush wakes her (the hot-flush
   routine's own steps). It offers the routine ("For hot flushes · 3 min", `S.relief.mins`, new) and yoga nidra, and says what
   was noted, with "Woken by them often? See a doctor: they are treatable." "Badly" keeps the hard-night card as it was.
4. **The doctor's card from her diary** (explain.js): in midlife (`kindNow() === 'meno'`), Hot flushes and Poor sleep on the same
   day on 3 or more of the last 14 days gives `m_hot` (see a doctor this month, treatments including HRT, `meno-hrt`). Its new
   `w2` line has the count: "You noted hot flushes and poor sleep together on {k} of the last 14 days." With her check-in's
   "Woke me at night" as well, it is still one card, now with the count. A finding's `w2` now fills its `{vars}`.
5. **The report for her doctor** (meno.js `summary`): "Hot flushes and sleep: Hot flushes and poor sleep on the same day: {k} of
   the last 28 days", in midlife only.

**Minimal baseline:**
- No new ring, step, tour or Today card.
- One optional question, asked only in the midlife plan's hot-flush and sleep goals, where it changes tonight's card and the
  doctor's card.
- The night lives in her diary (one home); the doctor's card and the report count it from there.
- On a shared phone, and in discreet mode, no hot-flush answer is shown.

**Tests:** `node test/nightsweats.mjs` (33 checks). Unchanged and passing: winddown, minimal, goals, records, maths, progs,
golden (no re-record), calm, daynote, smoke and check.

## 93. Version 39.50: the glass look

Mohit, 30 Oct, after the menopause app walk: "i like Its Glass UI not colour theme", then "Colour scheme should not be changed"
(the mockup claude.ai/artifact/UGJkPGEeHJLc2q9fVAVaVY), then "proceed doing glass UI for all screens". The look is Sakhi's own
colours, frosted. No colour, word or layout changes. Every rule is in one block at the end of `app.css`, "Version 39.50: glass".
1. **A still scene behind every screen** (`body::before`, fixed): her wash (`--wash1`, `--wash2`, `--bg`), kept beside the app's
   column at any width. In light it has two soft lights in the upper half, and her pink (`--accent-2`), lavender (`--h-purple`)
   and peach (`--peach`) low and gentle, where the page is lightest. Dark mode has her pink and plum.
   - Page intros and labels sit on the scene directly, so no glow is darker than the wash where text can pass. Muted text keeps
     4.5 or more over every point (the check's first try had a pink glow at about 3.5).
   - The page itself carries `--bg` (`html`). The body and `#app` are see-through, and the first-paint guard in `index.html`
     moved from `body` to the page for this.
2. **Her surfaces see-through, in her card colours** (`--glass`: white at 58%, dark `#2B1C1C` at 70%):
   - `.card` (hero included), `.item`, `.action`;
   - tiles (`.topic-card`, `.qa-tile`, `.feel-c`, `.ob-lt`), the symptom groups, helplines and the day page's boxes;
   - module cards, lifted with `:root` over the modules' own rules: `.xp-how`, `.tl-rem`, `.screen-row`, `.pg-acc`, `.pst-acc`,
     and from the route survey Help's lists `.access-sch`, the contraception choices `.contra-res` and the birth plan
     `.ptl-acc`;
   - with `--glass-2`: past medicines `.tl-acc`, reminders that are off, the intimate pages' first row and her notes after a
     loss.
   Inner panels inside a card (stats, meters, rows) keep their solid soft colour over the glass.
   - Soft cards and quiet rows use `--glass-2` (`--card-2` at 62%), and the Diary's paper cards `--glass-paper` (`--paper` at
     70%, the grain kept).
   - The edge is a light line drawn inside (`inset` shadows), so no box grows by a pixel.
3. **Frosted bars and sheets** (`backdrop-filter`):
   - the top bar is 80% solid with an 18 px blur;
   - the tab bar is 90% with a 22 px blur;
   - sheets are 90% with a 24 px blur;
   - the sticky strips are frosted like the bars: the moves player's Previous, Pause and Next (`.pl-ctl`, its own rounded glass
     strip in place of a fade) and the intimate check's question (`.intimate-qx`).
   The bars stay this solid so their labels read when a dark card scrolls under them.
4. **What stays as it was:** urgent and highlight cards (ink, `.card.dark`, `.xp-now`), coloured cards and tiles (`ok`, `warn`,
   `hue-*`, Wind down's night tile), buttons, chips, inputs, documents (`.tl-doc`), paper sheets, and print (white, no scene).
   Reduced transparency gets solid cards.

**Tests:** `node test/glass.mjs` (30 checks, light and dark):
- the scene;
- see-through surfaces on Today, My plan, the Diary, Explore, Help and Me, with no border added;
- frosted bars and sheets, and how solid the bars are;
- the urgent card, inputs and print;
- from a picture of the bare scene, muted text on the page at 4.5 or more over every point, and ink, text and muted on a
  card over its worst point.

`node test/glass-contrast.mjs . <the last commit's web folder>` checks every line of text on all routes for 5 sample women,
light and dark: about 104,000 lines.
- Each is measured against what is really behind it: its layers, then the bare scene's worst point, plus an ink card under a
  bar.
- It fails only on contrast the glass made worse. On Version 39.50 nothing is worse.
- The one line it caught: the after-birth vaccine line, gold at 4.17 on glass. It now takes `--gold-text` (`.pst-vx.past .pst-va
  span`).
- Eight lines fail the same before and after, so the glass didn't cause them:
  - the topbar's 9.5 px "QURA" over an ink card scrolling under it;
  - the "See a doctor this week" labels;
  - the language glyphs;
  - one dark-mode date on Plan the week.
- Reduced transparency gives solid cards and sheets (checked with the media feature emulated). At tablet width the column sits
  over the scene.

`node test/glass-survey.mjs` (not pass/fail) visits all 216 routes for 5 sample women, light and dark, plus the day sheet and
Help. It lists every surface still painted solid, and any opaque panel, to `test/shots/glass-survey.txt`. On Version 39.50
what is left is meant to stay solid:
- urgent ink;
- coloured notes, tiles, food tiles and symptom chips;
- the selected tile;
- segmented controls and inputs;
- inner panels inside glass cards.
The joining flow has none besides the coloured stage tiles and the number box.

The walk `node test/glass-walk.mjs [dir] [name]` photographs these to `test/shots/glass-walk/<name>/`:
- light and dark: Today (and scrolled), My plan, the Diary, Explore, Learn, Help, Me, a day sheet and the check-in;
- once: the welcome, Help's body parts, contraception, the moves player (resting and running), Wind down, Learn and an
  article, a relief routine, the report, Moves and calm, and the intimate check.
Run it on the last commit's web folder for "before".

## 94. Version 39.51: My midlife plan, version 2 ("Cool, calm and strong")

Mohit, 30 Oct: "start with the midlife plan", then "proceed building with your recommendations" (advice
`docs/midlife-plan-advice-2026-10-30.md`, its 11 decisions as recommended; mockup claude.ai/artifact/4K1ocG3KAXiAtPHQn3rymd). It
builds on Version 39.49 (the sleep card in the check-in), so it is committed after it. New health wording waits for the doctor
(review 19.51), the calm chapters for a psychologist too and the balance moves for a physiotherapist.
1. **The plan** (`web/progs/v1.js`, `meno` version 2, both midlife stages): 12 weeks in three 4-week parts in the order her goal
   needs, then her year to week 52 (`keep`). Version 1 runs on for the women on it and is offered version 2 once (`mpv2`); Try it
   starts a fresh 12 weeks from that day, so her parts begin at the first, and what she logged stays.
   - The order (plan.js `M2_ORDER`): hot flushes h r s; sleep r h s (the calm chapters q in place of h when her diary has no hot
     flushes in the last 60 days); worry or low mood q r s; bones s h r; weight and aches s r h. The parts are h Cool and calm, q a
     calmer mind, r Rest and s Strong and steady (`m2Part`, `m2Order`).
   - Her steps (`slots.max` 4): Today's skill (`meno.skill`: the week's practice or sleep rule, a tick that opens the chapter, or
     Steady on your feet, the new balance routine `plan-r-steady`, in Strong and steady; in her year her first part's, `M2_KEEP`);
     her walk (the ladder, or the light walk after "chest pain when you walk"); the plate for the weight goal, or a calcium food on
     plan days 1, 3 and 6, as version 1; Strength at home on plan days 2 and 5 (Gentle start after "chest pain when you walk").
   - Day 1 has 3 steps. No day has more than 3 (4 for weight, with the plate every day).
2. **The chapters** (`mods/midlife.js`, new; route `mid-lesson`, behind her PIN in discreet mode, `PIN_ROUTES`): 16 short chapters,
   4 a part (h1 to h4, a self-help course built on CBT; q1 to q4 its calm version; r1 to r4; s1 to s4). Each has its part and number,
   cards her speaker reads, this week's skill, "Why this works" folded, and Done (`S.midlife.lesson`: `title`, `skill`, `read`,
   `mark`, `ids`, `part`).
   - The week's chapter is one row under her steps until she reads it (`lessonRow` → `m2LessonRow`). In her year it is a Learn
     article a month, in turn (`M2_YEAR`), with no new wording; none on a shared phone.
   - Breathing and cooling are comfort while a flush passes, never a treatment (The Menopause Society 2023). `plan_fb_hot` is reworded
     so for every midlife plan, and `plan_fb_bones` names muscle first.
   - Its reasons open the Learn library (`WHY_ART`: hot flushes, sleep and mood, bones and heart).
3. **Her day's questions** ("Your day", the screen her plan already asks; no new screen): `mbone` (a doctor said her bones are weak,
   or a bone broke after a small fall) and `mheart` (chest pain, fainting or very breathless when she walks), each with its line under
   a yes (`warnOf`). My plan (`m2Card`): the week's chapter; "Your walk stays easy for now" with Call 112 and "My doctor says I can do
   more" (`intake.mheart = 'ok'`); "Your bones" with Bones and heart after 40.
4. **Her evening** (no new ring): the check-in asks her weekly number once a week from plan day 7 (`msAsk`, `msQ`; the day's log
   `ms`, 0 to 10; never on a shared phone or in discreet mode), and in Rest V39.49's "How did you sleep?" for every goal (`slpRest`).
5. **One card at a time in Sakhi says** (`menoDue`, `menoCardHtml`, `wireMeno`; none in discreet mode), each in its own weeks so
   none comes back for months:
   - once: her periods stopped before 45 (the reviewed `meno_tl_done_early`), at 40 to 44 and a year after her last period
     (`yearSinceBleed`; none in her diary means joining's "about a year ago" or more);
   - weeks 4 to 7, for hot flushes (her goal, or in her diary: `m2Hot`), aches and tiredness or hormone medicine: her doctor and hormone
     therapy; her hormone medicine's own warning signs with Call 112 if she takes one; blood tests for aches and tiredness;
   - weeks 12 to 16: her checks after 40 (BP, sugar and bones; the free check-ups card holds the screening), with Bones and heart
     after 40.
6. **Periods stopped before 40** (`poiHold`): no midlife plan (`packFor`) until she taps "My doctor has seen me"
   (`situation.poiOk`, which also offers her plan: `prompts.planOffer`). Today shows the reviewed POI line (`meno_tl_poi0`), whatever
   joining set, with Read about POI and Not now for 14 days (`prompts.poiNot`); My plan shows it in place of its goals (`wirePoi`).
7. **Her results** (`menoRes`, the end page): her weekly number and her good nights, her first 2 weeks beside her last 2, and her
   strength days, with no judging word.
8. **My plan's 12 weeks** (`pathHtml`): her 3 parts in her order with their weeks, then her year.
9. **Core:** the joining goal "Aches and tiredness" (`aches`) for both midlife stages, with Bones and heart in For you; `mid-lesson`
   in `PIN_ROUTES`.
10. **Not yet:**
    - the chapters and practices in Dr. Megha's voice wait for the reviewed words (the speaker reads them until then);
    - the 4 new 3D poses (one leg at the wall, heel to toe, tall back, side leg lift) wait for the 3D session and the
      physiotherapist, so Steady on your feet uses the nearest loops (march, walk, calf);
    - hypnosis audio isn't built.

**Tests:** `node test/midlife.mjs` (68 checks). Re-recorded on purpose:
- `progs/baseline.json`: meno 1 shows its two reworded lines, and meno 2 is new;
- `test/golden/plans.json`: 4 fields, the same two lines on version 1's My plan.
The plans test knows `meno.skill`, `mbone` and `mheart`.

11. **The midlife walk's fixes** (Mohit, 31 Oct, "can you do testing first for any gaps or bugs", then "fix all 12"; the walk is
    `node test/midlife-walk.mjs [kavita|sunita|asha|meera|vera]`, screens and words to `test/shots/midlife-walk/`):
    1. before 40, the gynaecologist first even though joining offered no plan, and My plan's goals held behind it;
    2. Aches and tiredness among the plan's midlife goals (`GOALS.meno`), so Today offers its plan and My plan lists it;
    3. her bones and heart answers saved with her plan (`ikBase`) and shown in "Here's what you told Sakhi"; Gentle start, in place of
       Strength at home, gives "Every small step counts." so My plan doesn't say her walk's reason twice;
    4. version 1 to 2: a fresh 12 weeks from that day (her check-in's reminder to the new end);
    5. before 45: at 40 to 44, a year after her last period;
    6. week 4 by her goal (no hot-flush card without hot flushes);
    7. week 12: BP, sugar and bones;
    8. her year: "Every day · from {her first part}" (`plan_m2_keep_s`);
    9. the sleep goal's chapters chosen on the day that part starts (`hotBefore`), so they never change inside it;
    10. a new plan starts its own cards (`commitStart` clears `w4Seen`, `w12Seen`, `mpv2No`);
    11. after her periods stop, the routine's safety line without "During your period" (`plan_stop_l_m`), and one leg at the wall
        without "Then the other foot";
    12. no "Start the weekly symptom diary" setup prompt while the midlife plan runs (meno.js `setup`); the diary stays a tool.
    `node test/midlife.mjs` section 11 checks each one (93 checks in all).
12. **The phone test's fixes** (Mohit, 31 Oct, "change my stage to midlife and test on phone" on his Flip5, then "Fix all 6"):
    1. midlife now (her stage or her goal) while a plan for her periods or for a baby runs: Version 39.48's plan for now gains a
       midlife case (`fitWhy` 'meno'): "My midlife plan may fit now", See it (her midlife goal's questions) or Keep hers; heavy periods
       keep their plan;
    2. "Your day" holds what her plan before holds: how active she is and her knees or back (`a.dayPre`), as her food comes from My
       food;
    3. the reveal's "What happens when" names her parts in her order, the chapter and look back each week, Strength at home twice a
       week from day 2 (Gentle start after a chest-pain yes) and her results (`m2RvRows`);
    4. "Why this works" draws its own arrow (the WebView drew no marker for a flex summary);
    5. the check-in names tomorrow's steps when they change ("Tomorrow: your skill, your walk, Strength at home.", `m2Tom`), not "the
       same steps";
    6. Moves and calm's Today is her plan's own routine (`tRs`): Strength at home on its days, Steady on your feet in Strong and
       steady, never the cycle plan's yoga.
    `node test/midlife.mjs` section 12 checks each one (103 checks in all).
13. **The second phone test's gaps** (Mohit, 31 Oct, "test the 6 fixes on phone" on his Flip5, then "fix all 3"):
    1. "Your last plan" (and "Before this" in the report for her doctor) skips a plan changed on the day it started with no day
       followed (`lastPast`; item 14 drops "with no day followed"), and shows the one before it; `d.past` itself stays as it was, so the fair new 12
       weeks and the folic acid carry-on read what they read before. One day reads "followed on 1 day" (`plan_past_p1`,
       `plan_sum_past1`);
    2. version 2 has no "Strength at home" row under My plan (`planRows`; it is a step, and on Moves and calm); version 1 keeps it.
       While her answer to chest pain, fainting or getting very breathless when she walks is yes (`heartHold`, until "My doctor
       says I can do more"), Gentle start takes Strength at home's place everywhere, as `plan_m2_heart_w` says: Moves and calm
       (`routineOk`, with the sun salutation), the search tile, the routine's own page (it opens Moves and calm), and My plan's
       line (`plan_m2_str_all` now names the routine);
    3. her time to move comes from the plan she is on (`whenRun`, `whenFill`): a new plan doesn't ask "When can you move for 10
       minutes?" again, the summary shows it, and Change asks it (`a.whenShow`). A first plan still asks; a plan that doesn't
       ask it gets no time, as before.
    `node test/midlife.mjs` section 13 checks each one (119 checks in all).
14. **The third phone test's gaps** (Mohit, 31 Oct, "test the 3 fixes on phone" on his Flip5, then "fix both"):
    1. "Your last plan" skips any plan changed on the day it started (`sameDay`), even when her check-in that day counted it as
       followed. A copy of the plan she is on is always one of these (its start is today), so it goes at once, not only when the
       app next opens (`mig`'s copy rule runs once per load);
    2. "Your day" holds her bones and heart answers from the midlife plan she is on (`a.mbone`, `a.mheart`), as it holds her
       activity and knees; after "My doctor says I can do more" (`mheart: 'ok'`) the question shows No, and her doctor's OK goes
       with her new plan. A plan that never asked them (PMOS) leaves both for her to answer.
    `node test/midlife.mjs` section 14 checks each one (125 checks in all).
15. **The fourth phone test's gap** (Mohit, 1 Nov, "test the 2 fixes on phone", then "fix it"): "Your day" fills in only the
    questions its own screen asks (`qsOf('day', a)`), and her bones and heart answers only from a midlife plan she is on
    (`menoV2(d0)`). A plan whose "Your day" doesn't ask them never keeps them (`ikBase`, `dayAsks`), so a PMOS plan made while
    her midlife plan ran (0.39.51.3 kept them) leaves both for her to answer when she comes back. `node test/midlife.mjs`
    section 15 checks it (128 checks in all).
16. **The exploratory phone test's gaps** (Mohit, 1 Nov, "test the midlife plan on phone for more gaps", then "fix all 4"):
    1. "Why?": Today's skill has its own How, this week's skill in its chapter's words (`S.midlife.lesson.how`, the chapter's
       "This week's skill" card); the calcium food has no How (`how: ''`; `howOf` now reads '' as none) instead of its subtitle
       again. Its reason stays "Every small step counts." until a midlife calcium line is reviewed;
    2. "How your plan works": every week, "A short chapter and a look back" (`plan_rh_wk_m2`), as Getting ready names its lesson;
    3. her plan's chapters, Getting ready's lessons and its ready check light My plan, not Explore (core `tabOf`);
    4. a plan started today after today's check-in (her plan before it) asks its own check-in tonight (`commitStart` clears the
       day's `ci`); her answers that day stay.
    `node test/midlife.mjs` section 16 checks each one (136 checks in all).
17. **The second exploratory phone test's gaps** (Mohit, 1 Nov, "test the midlife plan on phone for more gaps", then "fix all 3"):
    1. one "Tomorrow" line in the check-in: "Tomorrow, add" (`plan_ci_add`) names only steps tomorrow has (the same id and
       routine), and goes when the midlife plan's own line (`m2Tom`) names tomorrow's steps. Version 39.37's rule (section 80.3)
       holds again; the cycle plan keeps its routine line beside the add line;
    2. no "PMOS: food, yoga and moves" tile while a plan other than the PMOS (cycle) plan runs: it opened that plan under the
       PMOS plan's name;
    3. an undone tick is unanswered again (`unmark`; section 57's rule changes), so the evening check-in asks it with nothing
       picked; "Not today" only when her own minutes or a routine she played would tick it straight back.
    `node test/midlife.mjs` section 17 checks each one (142 checks in all); `node test/daily.mjs`'s two undo checks follow the
    new rule.
18. **The bone-safe stop-gap** (Mohit, 1 Nov, after the third exploratory phone test: "do the stop-gap"). The advice's decision 7
    ("bone-safe for every midlife woman: no forward bends, side bends or loaded flexion in any routine for this plan") was not built.
    Until the physiotherapist's swaps, `routineOk` holds back Cycle care yoga (Shashankasana, child pose) and the sun salutation
    (Hasta padasana, twice) while a midlife plan runs, or at midlife (`S.cycle.isMidlife`) with no plan running (`boneHold`), on
    Moves and calm and on their own pages (they open Moves and calm). A midlife woman who kept another plan keeps them: the PMOS
    plan rotates both. Strength at home, Steady on your feet and the warm-up are bone-safe. Still open for the physiotherapist:
    Gentle start (the plan's routine after a chest-pain yes, and on Moves and calm) has Trikonasana (a side bend), Vakrasana (a
    twist) and Pavanamuktasana (knees to chest), and `plan_m2_bone_w` says "Every move in this plan is bone-safe".
    `node test/midlife.mjs` section 18 checks it (147 checks in all); 13.2 now expects the sun salutation to stay off.
19. **The discreet path cards** (Mohit, 1 Nov, "fix the leak in both plans"): on a shared phone (`disc()`), My plan's "Your 12
    weeks" no longer names a plan's parts:
    1. week 1's path card (`pathHtml`) is left out for My midlife plan (its parts say "A short course for hot flushes") and for
       Getting ready ("your tablet, an Hb test, and his part"), as for a pregnancy and after a birth;
    2. from week 2 the weeks card (`weeksCard`) gives Getting ready's weeks as "Your daily steps", as other plans' are.
    `node test/midlife.mjs` section 19 checks both plans in week 1 and week 2, shared and not.
20. **Her parts on the weeks card** (Mohit, 1 Nov, "add the parts to that card too"): from week 2 My midlife plan's weeks card names
    each week's part in the order her goal needs (`m2Order`), as week 1's path card does: "Cool and calm · A short course for hot
    flushes, a chapter a week", "Rest · One sleep rule a week", "Strong and steady · Strength, balance and food for your bones". Her
    4-week and 8-week checks and her results keep their weeks; on a shared phone, "Your daily steps". `node test/midlife.mjs` section
    20 checks it (158 checks in all).
21. **POI while her plan runs** (Mohit, 1 Nov, after the fourth exploratory phone test: "card and hold"). Under 40 with her periods
    stopped and no "My doctor has seen me" (`poiHold`, now a hoisted function), a running midlife plan rests (`pausedFor` gives
    'poi'), as decision 6 says (no plan until her doctor's word), the way a pregnancy pauses a plan: no steps, no check-in reminder,
    no nudge. Today shows the reviewed gynaecologist card where her plan was (`offerCard`), and My plan shows it alone (no other
    pause line). "My doctor has seen me" (`poiOk`) brings her plan and its reminder back. At 40 and over, or while her periods
    still come, nothing changes. `node test/midlife.mjs` section 21 checks it (164 checks in all).
22. **The hold's phone test** (Mohit, 1 Nov, on his Flip5 with vc 97: "fix all 4"). While the gynaecologist card holds her
    plan:
    - Today shows the card where her plan's steps were, after the round buttons and before "How do you feel today?" (the card
      carries `data-plan-top`, and core puts such a card after her steps), not last in Sakhi says;
    - "Tell Sakhi your stage and goals" waits (`S.plan.poi`), even just after she set her stage: no goal leads to a plan until
      her doctor has seen her;
    - My plan shows the card alone, with no "Your last plan" above it (an earlier run read as if her resting plan had ended);
    - My plan's lists show no plan row beside the card. The 12-week plan's row had said "After your 6-week check", the pill
      for after a birth that marks any paused plan.
    With no plan yet (she joined at 37 with her periods stopped), the card stays her plan's offer in Sakhi says, and it always
    leads there (`data-slot-keep`), as a card that keeps her safe. No new words. `node test/midlife.mjs` section 22 checks it
    (171 checks in all).

## 95. Version 39.52: pregnancy yoga by trimester

Mohit, 1 Nov: "build the pregnancy yoga by trimester", after the walk through a prenatal yoga app (principle notes only). It
builds the pregnancy moves the programme design planned (`docs/plans-design-and-build-2026-10-24-programmes.md`, section 6,
"Routines and new poses"; the pregnancy advice, `docs/pregnancy-plan-advice-2026-10-29.md`, sections 2 and 5) as yoga for each
three months, inside My pregnancy (`preg` version 2). Every new line waits for the gynaecologist and a women's-health
physiotherapist (wording review 19.52).

1. **Three routines** in `mods/plan.js` `R`, by her week as the week pages count it (`triOf`): `preg1` to 13 weeks, `preg2` from
   14 to 27, `preg3` from 28 (`pyId(iso)`). Each is about 10 minutes at most (`routineMins` 8, 10, 10):
   - `preg1`, the first three months: Loosen up, Tadasana (feet flat, never on the toes), Vrikshasana at a wall, Marjariasana
     (cat and cow, small), Shashankasana with the knees wide (the chair forward bend with knee pain), Bhadrasana, slow breathing
     (4 in, 6 out), Shavasana (on the back is fine to 13 weeks; WHO 2020);
   - `preg2`, the middle three months: Loosen up, Tadasana, Vrikshasana at a wall, wall push-ups (one set), chair squats (8, hands
     if she needs them), Marjariasana ("don't let your back sag"), Bhadrasana, Bhramari, side-lying leg lift, rest on her side;
   - `preg3`, the last three months: Loosen up sitting (seated march), slow sit-to-stand (6, feet wide), long breaths out on the
     chair, wall push-ups, lean and sway at a wall or table, rocking on hands and knees, Bhadrasana against a wall, side-lying
     leg lift, rest on her side.
   The rules (the design's, WHO's): nothing on the back after 13 weeks, nothing on the tummy, no twist, no rising on the toes
   (no heel raises, no palm tree on the toes), no step-ups, no deep bends, no breath held, balance at a wall. The reused moves
   keep their reviewed words (Loosen up, wall push-ups, Bhramari, the chair forward bend). Rests: 10 seconds (`REST_S`), none
   between sides or before resting on her side (`restAfter`).
2. **Drawn, with her bump**: a routine with `draw: true` never takes the 3D figure (`fig3d`, `figThumb`), which isn't pregnant;
   `bump` (0, 0.75, 1) draws her bump (`bumpOf`): from her spine when side-on, round on her middle when she faces you
   (`fv: 1` on the front-view positions), resting towards the floor when she lies on her side (`bd: 'down'`). New positions in
   `P`: `seat`, `seatmarch`/`seatmarch2`, `allfours`/`rockback`, `cat`/`cow` (with `m`, a point mid-spine, so the back rounds
   and dips: `spine(f)`, and `lerp` carries it), `sidelie` (with a pillow prop), `sidedown`/`sideleg`, `leanfwd`/`leanfwd2`;
   new loops in `ANIM`: `seatmarch`, `allfours`, `cat`, `sideleg`, `leanfwd`. `web/tools/fig3d` keeps its own positions, so
   nothing there changes; a pregnant 3D figure is a later job.
3. **On Today** (`web/progs/v1.js`, `preg` version 2, revision R3): the move step's `first` group puts her three months' yoga
   (`kind: 'routine'`, `go: 'plan-r-preg1'` to `'plan-r-preg3'`, `priv`) on days 2 and 5 of her plan week, in the walk's place,
   when her tier is green and no sign that doesn't wait (`pt:green`, `!pnow`, `gw:0-13` / `gw:14-27` / `gw:28-`). Amber keeps
   the easy 10-minute walk and red has no move, as before. No new step, screen, question or reminder; day 1 is a walk day. Its
   "Why?" (`plan_fb_pyoga`) opens the reviewed pregnancy dos and don'ts (`WHY_ART`). The plan's steps before she starts (the
   reveal's `stepsList`) name it on the green tier in the walk's own line, "Walk or move 10 minutes, or Pregnancy yoga on 2 days
   a week" (`plan_pi_wy`), so the count of her steps doesn't grow: a new list word, `{ use: 'pyoga' }` (`pyTier`), after `today`. "Before you start"'s green
   tier names it (`plan_ps_t_green_p`).
4. **The player**: the stop card (`pyStopCard`: `plan_stop_h`; the signs for today, `plan_py_stop`; under "Call 112 now" the signs
   for now, `plan_py_now` (chest pain, fainting, regular painful tightenings), then Help's own line (core `s1c`) and Call 112) sits
   above Start, after "Go gently in a cool room, with water nearby" (`plan_py_go`). Every move has "Feeling unwell?" in the corner
   of its picture (in view and clear of the buttons at 360 × 800; `data-noread`, so the voice reads the move, not the button;
   `--accent`, 4.5 to 1 or more in light and dark): stop now and rest, both groups of signs, Call 112, 108 and 102; "I feel fine now" goes back to the move, paused; "Stop for today" keeps the minutes she did, sets
   `intake.pnow` (her walk and yoga wait until she checks her answers again, and "A quick check" leads the next day, as a sign
   that doesn't wait does) and shows the rest card. "Hard" after a pregnancy routine gives `plan_py_hard`, not Gentle start.
5. **Moves and calm in a pregnancy** (its tile is hidden, but search and guides open it): `routineOk` lets a pregnant woman open
   only her three months' yoga, on My pregnancy's green tier with no sign that doesn't wait (`pyOpen`), and Calm breath (no
   breath held; Wind down's row). Every other routine's page opens Moves and calm instead (they lie on the back or the tummy,
   twist or rise on the toes); this closes a gap where search's "yoga" led a pregnant woman to the cycle routine. When it isn't
   open, a note says why (`pyWhy`: `plan` no My pregnancy yet, `doc` amber or red, `now` a sign that doesn't wait) with My
   pregnancy plan or My safety answers; the pregnancy stop card replaces the cycle one. Outside a pregnancy the pregnancy yoga
   never shows and its pages refuse.
6. **A shared phone**: "Yoga" (`plan_r_d`), never "Pregnancy yoga", on Today (the step is `priv`), in the player and on Moves and
   calm, with no subtitle; the stop signs stay.
7. **The plans' vocabulary** (`test/progs.mjs`): routine ids may hold digits (`plan-r-[a-z][a-z0-9]*`), and `pyoga` is a list
   word. `web/progs/baseline.json` is re-recorded for `preg@2` (the plan changed on purpose). `golden.mjs` is unchanged (its
   pregnancy replays have no walk).
8. **Hooks**: `S.plan.rids()` (the routines Moves and calm would list now), `S.plan.pyId(iso)`, `S.plan.routine(id)`.
9. **The bug hunt before the commit** (Mohit, 1 Nov: "Can you test first for bugs and gaps"; the walk is
   `node test/pregyoga-walk.mjs`, screens and words to `test/shots/pregyoga-walk/`):
   1. the voice read "Feeling unwell?" before each move: the button is `data-noread`;
   2. the stop card said "tell your doctor today" for chest pain, fainting and regular painful tightenings: they now sit with
      "Call 112 now" (the safer default, for the doctor to confirm), and "Go gently" names a cool room and water;
   3. at 360 × 800 a move with many words pushed the timer under the buttons, and the breath circle (150 px) always did: every
      move's words are shorter, child pose keeps its one-line title, and on a short screen the breath circle is 120 px (every
      routine, as Version 39.39 did for the timer); the test checks every move of all three, in English and Hindi;
   4. on the first pregnancy plan (version 1), the note's button opened the plan she had, a dead end: it names "Change what I work
      on" in Plan settings, which starts version 2 with "Before you start" (`pyWhy` 'v1');
   5. "Feeling unwell?" was 3 to 1 on a dark card (`--accent-strong`): it uses `--accent`;
   6. with knee pain the first months' child pose became the seated forward bend, drawn as a half squat: a `chairfwd` drawing;
   7. search found no yoga for a pregnant woman (the Moves and calm tile was hidden in every pregnancy): the tile shows once her
      yoga is open (`pyOpen`), so "yoga" finds it; it stays hidden for amber, red and no plan;
   8. "…, or Pregnancy yoga on 2 days a week": lowercase in the sentence (`lowFirst`).
   Found and left (not this build): in the days after a loss the Moves and calm tile is hidden, but a guide's tool link still
   opens every routine's page (`routineOk` has no rule for `lossNow`); the plan picker says "12-week plan" in a pregnancy.

`node test/pregyoga.mjs` checks it (78 checks); `test/pregplan.mjs` expects the green tier's new line.

The minimalist baseline: no new ring (her check-in stays after her last step), at most 4 steps (the yoga takes the walk's row
on its days; day 1 has 3 or fewer), no new question or screen, one home for each fact, no new tour, tip or celebration, and
the shared-phone check above. Starting the yoga from Today is 2 taps (Start on Today, Start on its page); stopping for today
is 2 more. The tap suite's jobs (`web/test/taps/`: the cycle, Getting ready and no-plan women) don't pass through pregnancy.

## 96. Version 39.53: every guide leads to her plan

Mohit, 1 Nov: "i believe everything should leave to plan and for extended medical help qura doctor should be advised thats the
whole purpose of this app", then "build it", after the midlife plan's phone tests found the hot-flush guide led only to a routine.

**One row, `S.plan.forRow(topic)`** (plan.js), for the guides, routines and topic pages whose subject a plan covers:
- her running plan covers it: "Your plan for this" and her plan's name, with My midlife plan's part for the subject ("Weeks 1 to
  4: Cool and calm"; hot flushes: Cool and calm or its calm version; sleep: Rest; bones and aches: Strong and steady). A tap opens
  My plan;
- no plan running: "A free plan for this" and the name of the plan that fits her stage (`packFor(goal, stage)`). A tap starts its
  own questions (`S.plan.offer`, from any page; a sheet closes first);
- nothing while another plan runs (hers stays hers), while hers rests or is on its way, in a pregnancy, after a loss, on a shared
  phone, or where no plan at her stage covers the subject (sleep while she tracks her periods; before 40 with her periods stopped,
  `packFor` gives no midlife plan, so the gynaecologist card stays first).

Topics: hot, sleep, mood, bones (the midlife plan's goals), meno (her midlife goal), pain, heavy, pms, pmos, irregular, ready.

**Where it shows**, first among a page's actions (her plan, then the tools, then a Qura doctor):
- guides (`ART[key].plan`, app.js), on the full page and on the quick answer's sheet (so also "What helps" after a log): hot
  flushes; sleep, mood and dryness in midlife; sleep and hormones; bones and heart after 40; perimenopause; periods after 40;
  painful periods; periods dos and don'ts; heavy bleeding; mood and the cycle; what PMOS is; a thali for hormones; movement with
  PMOS; irregular cycles; Getting ready's checklist;
- the routines (relief.js), after Start: cramps (pain), hot flushes, poor sleep (sleep), anxious or low (mood);
- topic pages, before their Qura card: period pain and PMS (periods.js); endometriosis, fibroids and anaemia (cond.js); the
  Menopause page and Bones and heart (meno.js).

**A Qura doctor for medical help:**
- "Who treats what: Qura doctor or gynaecologist?" leads with "Ask a Qura doctor about this", as its own line says a Qura doctor
  does the first assessment. The free government doctor page is its second button.
- The urine-infection and bleeding-after-menopause guides keep the in-person doctor first, with a Qura doctor advised beside it.
  Their reviewed lines say: an MBBS doctor for the antibiotic; a gynaecologist in person first.
- The iron tablets page gains "Ask a Qura doctor about this".

New UI words: `plan_for_h_run` "Your plan for this" and `plan_for_h_offer` "A free plan for this", with Hindi. `node test/planfor.mjs`
checks it (26 checks).

## 97. Version 39.54: the 3D figure in pregnancy yoga

Mohit, 2 Nov, trying Version 39.52 on his Flip5: "pregnancy yoga doesnt have 3d model", then "proceed building", then "test
every one and if any inaccuracy is there just fix it and give finished moves with right movements". Section 95 item 2 drew the
three routines because the 3D woman wasn't pregnant; now she is, with MakeHuman's own pregnancy shape. No new words, steps,
screens, questions or reminders.

1. **Three bodies** (`web/tools/fig3d`): her usual figure (`b0`) for the first three months, when no bump shows; for the middle
   three months (`b2`) and the last three (`b3`), `char.py` with `FIG_BUMP` 0.6 and 1.0 (MPFB's `stomach-pregnant-incr` target), so
   her t-shirt and leggings fit over the bump. The drawings' bump stays 0.75 and 1 (`R.preg2.bump`, `R.preg3.bump`).
2. **New 3D positions** (`moves.py`'s pregnancy section), each loop as its step's words say, checked move by move against them:
   - Tadasana with her feet flat (`palm`); the tree at a wall (`treewall`, her right hand on a wall at her side, her left on her hip);
   - on hands and knees, her hands and knees planted: cat and cow (`cat`, `cow`), the first three months' smaller ones ("Keep it
     small": `catsmall`, `cowsmall`), and "rock slowly forward and back" (`allfours`, `rockback`, `rockfwd`: back towards her heels,
     through the middle and a little forward of her hands);
   - child pose with her knees wide (`childwide`, seen from behind her and to one side so her wide knees show);
   - lying on her right side (`sidelie` with a pillow between her knees, `sidedown`, `sideleg`);
   - Loosen up sitting, "Roll your shoulders, then march" (`seatshrug`, `seatroll`, then `seatmid`, `seatmarch`, `seatmarch2`);
   - the slow sit-to-stand, "Feet wide apart" (`chairupw`, `chairwide`, seen a little from her right so her wide feet show);
   - lean and sway, "Hands on a wall or a table ... sway your hips slowly, side to side or in circles": at a counter-height table,
     one slow hip circle (`leantable`, `leanleft`, `leanback`, `leanright`, `leanfore`), seen from her right and a little behind,
     where her bump and her hips' sway both show (from in front the table and her own body hide her hips);
   - Bhadrasana, "Sit tall on a folded sheet" (`butterflytall`: upright on a folded sheet, her hands on her knees, not the cycle
     routine's lean to her toes) and against a wall (`butterflywall`).
   Views: 'lie' (from in front and a little above), 'front3q', 'sideback', 'backq'. Props: a wall at her side, a wall behind her back
   and a pillow between her knees (the last two placed from her pose, `render.py` `after_props`), a folded sheet, a table.
3. **Rendering and install**: `render-preg.sh <work>` renders each body's stills and loops as `moves.PREG` lists them (two bodies at
   a time; stopped part way, it carries on where it was: each finished loop leaves a `.done`) and encodes them; `install.py <final>
   <web> <preg>/final-b0: <preg>/final-b2:b2- <preg>/final-b3:b3-` adds them to the regular set (`fig/v/b2-cat.webm`,
   `fig/s/b3-sidelie.webp`; her usual figure's new ones, `palm`, `catsmall`, `treewall`, `childwide` and `butterflytall`, have no
   prefix), leaving every regular file as it was. web/fig grows from 2.1 MB to 3.3 MB (34 loops, 70 stills).
4. **The player** (`mods/plan.js`): `R.preg1` to `R.preg3` carry `fb` ('', 'b2-', 'b3-') in place of `draw`; `stepsOf` gives each
   step `fb` and `bump`; `figName(s, n)` prefixes a step's still and loop names (`figThumb`, `fig3d`, `figLoop`), so the routine's
   page, the move and the rest's "Up next" show her body for those three months. Steps that need their own 3D position name it
   (`fig`): Tadasana `palm`, the tree `treewall`, the first months' cat `catsmall` (`PY_CAT(false)`), child pose `childwide`,
   Bhadrasana `butterflytall` or `butterflywall`, the slow sit-to-stand `chairwide`, lean and sway `leantable`, long breaths out
   `chairsit`. A routine's card picture on Moves and calm is her body's still of `ffig` (or `first`). Where a body's file isn't there
   (`SAKHI_CONFIG.fig` false, no web/fig, or a web/fig from before this version) the drawings, with her bump, stay.
   `S.plan.routine(id)` gives `fb` in place of `draw`. "Feeling unwell?" stays in the picture's corner, clear of her and the buttons.
5. **Checked**: `node test/pregyoga.mjs` (84 checks): each routine's body; every step's still for its body, and a loop where its
   drawing moves; the routine page and the first move in 3D on her middle-months body, the first months' on her usual figure, the
   last months' on her full bump; the drawings with her bump without the 3D files or without the pregnancy sets; Moves and calm's
   picture; and, as before, every move at 360 × 800 in English and Hindi with the timer in view, now with the 3D figure. Every loop
   was looked at frame by frame against its words (the fixes above came from that).

The minimalist baseline: nothing she sees or does changes but the picture: no new step, ring, question, screen, tour or words;
the shared-phone check is section 95's ("Yoga"). The physiotherapist's checklist for the pictures is review 19.54.

## 98. Version 39.55: My period plan

Mohit, 2 Nov: "proceed building with your recommendations", after the advice (`docs/period-plan-advice-2026-11-02.md`) and the
canvas (claude.ai/artifact/9YbP1fyNWG8gN5gF41c7vS). It is the last of the plans agreed on 30 Oct: the tracking stage's period
goals, which had light version 1 plans (Easier periods, Stronger blood, A calmer cycle) on a weekly clock.

**One plan, three leads.** `pain`, `heavy` and `pms` each gain version 2 (`web/progs/v1.js`), all titled "My period plan"
(`plan_pk_period`). The ids stay, so her goal still opens its plan (`packFor`), and a plan she started on version 1 runs on. Her
first period goal leads (its daily practice and its chapters); her other goals (`S.state.goals`) join only in the window where
they matter. Heavy periods after 40, while she still bleeds, keep this plan.

**Her cycle sets the steps.** New plan words (mods/plan.js `progIf`, `progWhen`):
- `when: 'before'` (from 7 days before her likely days to their last day, while she isn't bleeding: `perWin`), `'kitday'` (the
  same from 2 days before), `'between'`; `if` words `period` (a day she bleeds), `before`, `also:x` (another of her goals), `hbdone`
  (her Hb test ticked in her plan, or a result saved from 90 days before it began, `S.cond.hbLatest`). Past her likely days she is
  late, and no window opens;
- a tick step's own line (`sub`), and `slots.day1` (day 1 at 3 steps; `slots.max` 4).
With no likely range (hormones, few or uneven gaps) only the period days and the days between show, and a late period never opens
her kit ("Period late?" leads, as before).

| Lead | Every day | Period days | Before her period | Between |
|---|---|---|---|---|
| Period pain | Relax (Wind down's slow breaths; 4 days with a doctor's endometriosis or adenomyosis) | Her kit (warmth, the cramps routine, a rest position), rest or a 10-minute walk | Her kit ready (its last 2 days), Cycle care yoga on a moving day from week 6 | A walk on 3 days, strength on 2 of them from week 5 |
| Heavy periods | An iron food (the 21 iron days, then the rotation) | A rest lying down (yoga nidra) | | Her Hb test to day 21 until done; a light walk on 3 days (Calm breath instead while she is often tired and has no Hb test); strength from week 7 |
| The days before | Calm breath | | Her calm-week plan (its tool: the 3-minute routine for a hard moment) | A walk on 3 days, a calcium food on 5 (it opens My food) |

Joining: pain joins as her kit on period days; heavy as her Hb test and an iron food; the days before as the evening question.
Her questions: pain's screen (`pain2`) adds "Has a doctor told you that you have endometriosis or adenomyosis?", which needs no
answer (none is the standard version); a yes is kept (`intake.endo`) and shown in "Made from what you told Sakhi". Heavy periods
ask no activity (the walk is the light one, as in version 1).
The endometriosis version adds a weekly row for the pain diary (`cond-endo`). New adapters: `period.relax`, `period.rest`,
`period.hb`, `period.calmweek`; `food.calcium` takes the step's `go`.

**Her evening.** The check-in after her last step, as every plan's (no new ring; her doctor's iron tablet rings at its own time).
The nudge at her time to move rings only on her moving days (`moveDays`: the weekdays her plan's moving steps come on, as core's
`weekdays`; the test pass found it ringing every evening for a 3-days-a-week walk, and the same held for My recovery's walk from
day 14). A strength day counts as moving, and a day whose steps hold no move (her period days' rest) doesn't ring. In the check-in:
- "Pain today?" on each day she bleeds, to day 5, when pain is one of her goals (saved on that day's diary entry, `setPainToday`);
- "Your period today" when heavy periods are one of her goals, on days she bleeds: soaked within 1 to 2 hours, clots, and what it
  got in the way of (leaked through clothes, changed at night, couldn't do her day). The same 3 taps for pads or cloth. Core's new
  `S.cycle.setFlowToday` saves soaked (the day page's `pads_4`), clots and leaked on today's period entry, so her diary, the report
  and What your diary shows read them; changed at night and couldn't do her day stay in her plan's day (`pt`);
- "Did it get in the way today?" (a little, a lot) in the 7 days before her period, when the days before are one of her goals and
  she noted a sign today (`px`). None of these on a shared phone or in discreet mode.

**A chapter a week.** `mods/perplan.js`: 12 chapters for each lead (p1 to p12, h1 to h12, m1 to m12), one row under her steps until
she reads it (route `per-lesson`, under My plan, behind her PIN on a shared phone; its title hidden in discreet mode). Each has a
"Try this week", and its doctor cards ask a Qura doctor first. `S.plan.period.lesson()` gives the week's chapter.

**"Your plan is ready".** Each step says when it comes: "On your period days:", "The 7 days before your period:", "Just before
your period:", "3 days a week:" (a walk too: the minutes steps now carry `every`), "Once, in your first 3 weeks: Get your Hb
tested", and the iron food as version 1 said it ("One iron-rich food step every day"). "What happens when" (`perRvRows`) names her
cycle's steps that aren't today's, "Every week: a short chapter, and a look back at your week", week 4 (her first month and when to
see a doctor), her strength and yoga weeks and week 12; on a shared phone, the usual 3 rows. Today's plan offer (and the doctor
finding's pair) names the version that will start.

**One home for each fact.** While her "Get your kit ready" is on Today, core's heads-up card ("Your likely days start in 2 days")
steps aside (`S.plan.period.kitToday`); 3 days before, it still comes. On a shared phone a step that comes only on period days
keeps its title but not its line.

**One card at a time, a Qura doctor first** (`cardKind` 'per2', 'ppv2'; `perCardHtml`, `wirePer`):
- weeks 4 to 6: "When to see a doctor" with her goals' reviewed lines (`plan_rv_doc_pain`, Help's `r2`, `plan_rv_doc_pms`);
- her second period since she began, when the days before are hers: the reviewed `plan_rv_doc_pms`;
- version 1 offered version 2 once ("My period plan is here"; "Move me to it" starts a fresh 12 weeks, keeping what she logged);
- the doctor check's card gains "Ask a Qura doctor about this"; the end page's doctor card says "Still hard?".

**Her results.** My progress shows period pain's and heavy periods' before and since (`painCompare`, `heavyCompare`) for a goal that
joins, not only the one that leads, and her evening answers day by day (`perWayCards`; the test pass found them saved and never
read): "The week before your period: days it got in your way a lot" (what she told Sakhi, then her days since) and "Period days it
got in your way" (leaked, changed at night or couldn't do her day, since she started; her diary holds only the leaks, so nothing
before). Not on a shared phone. Beside her Hb results (`cond-anaemia`) one fixed line for every woman: below 8, see a doctor
this week; today when breathless, dizzy or with chest pain (WHO 2024 keeps severe anaemia below 8 g/dL).

**The phone test** (Mohit's Flip5, 2 Nov: "fix all 6"):
- Relax, the rest lying down on a period day and her kit each have a play button with their minutes, in daylight (the bedtime's
  night button stays for bedtime): slow breaths, yoga nidra, and the cramps routine. A tick step's `play: true` plays its `go`
  (a relief routine, at its own minutes, `S.relief.mins`). "Relax, 5 minutes" is now "Relax, a few minutes", as the session is 4.
  A daytime play button is not the bedtime wind-down (`windStep`): no wind-down ring, card or line comes from it.
- With no likely days (gaps that vary, hormones), "What happens when" names nothing for the days before her period: her kit is
  "On your period days: your period kit", with no Cycle care yoga row and no calm-week row.
- The check-in's "Tomorrow:" names tomorrow's steps when her days change them (the midlife plan's `m2Tom`), in one line: no
  "Tomorrow, add" and no "Tomorrow: the same steps" beside it.
- My plan's "How your plan works" says "A short chapter and a look back" each week.
- Her Hb test is a one-off (`once`): Done or Not today in the check-in, no Partly.
- A midlife plan at the tracking stage ("No, I marked it by mistake" brought it back; at 45 or more, choosing Tracking my periods
  saves `midlife: false`) gets Version 39.48's card (`fitWhy` 'per' and 'nomid'): "My period plan may fit now" for her first
  period goal ("See My period plan" opens its questions), or "A different plan may fit now" ("Choose my plan"), with "Keep".
  All of it is existing wording.

**The minimalist baseline** (CLAUDE.md):
- **Her evening:** no new ring. The check-in rings after her last step; the nudge at her time to move only on her moving days; her
  doctor's iron tablet at its own time. No bedtime, so no wind-down.
- **Today:** day 1 has 3 steps or fewer and no day more than 4; one Sakhi says card; one row under her steps (the chapter, after her
  look-back).
- **Ask less:** no new screen before her first step; one new question, optional (endometriosis); period pain asks no bedtime or
  work, heavy periods no activity.
- **One home for each fact:** "Get your kit ready" holds the heads-up card's advice, so the card steps aside; the reveal promises only
  what comes.
- **Read once:** how it works folds after week 1, as every plan's.
- **No new tours, tips or celebrations.**
- **The shared phone:** discreet titles, private steps as "Your step {n}", a period-day step without its line, no evening measures,
  no results beyond the days she followed, the chapters behind her PIN.
- **Taps** (`web/test/taps/`; its cycle woman joins with period pain): joining 44 to 43; days 1 to 10, 53 to 55, and days 1 to 7, 44
  to 47 (2 or 3 steps to tick instead of 1); the everyday jobs 68 to 70 (one more check-in answer, and the check-in button a scroll
  down Today); the trying woman unchanged.

`node test/periodplan.mjs` checks it (84 checks; section 7 holds the test pass's fixes, section 8 the phone test's). `node test/periodplan-walk.mjs [who]`
lives it: six women from a new install (period pain with heavy periods, the days before, heavy periods often tired, endometriosis
with no dates, heavy periods at 44, and version 1 moved to version 2), with their periods coming, screens and words to
`test/shots/periodplan-walk/`. `test/progs.mjs` knows the new words; its draft example is now version 3. Suites that check
version 1's plans seed `ppv2No` (she kept her plan); food, companion, minimal, myplanwalk and planfor check version 2 where
joining starts it (no bedtime step, so no wind-down).

## 99. Version 39.56: My pelvic floor plan

Mohit, 2 Nov: "design the pelvic floor plan", then "proceed building" with the 10 recommended decisions
(`docs/pelvic-floor-plan-advice-2026-11-02.md`, from the 24 Oct design, `docs/plans-design-and-build-2026-10-24-programmes.md`
section 4). It is the one programme on the 24 Oct roadmap that was never built.

**One plan, two tracks.** `pelvic` version 1 (`web/progs/v1.js`, "My pelvic floor plan", `plan_pk_pelvic`), for leaking urine or
heaviness down below. It sits before `meno` in the file, so its goal leads at the tracking and midlife stages; Getting ready and
the after-birth plan come earlier and keep their stages (`packFor('pelvic', 'ttc')` is Getting ready, `'post'` My recovery plan).
The goal `pelvic` joins `GOALS.cycle`, `ttc` and `meno` (mods/plan.js) and `OB_GOALS` for every stage but pregnancy (app.js). Outside
the after-birth stage its name is "Leaking urine or heaviness" (`ob_h_leak`, `ob_gs_leak`; core's `goalLabel(k, tile)`, plan.js's
`obName(k, st)` and `goalName(k, st)`, by the intake's own stage); after a birth it stays "Pelvic floor and leaks".
- Her track, from "When do you leak?" (screen `pftrack`: `pft` stress, urge, both, heavy or not sure, and `pfway`, how much it gets
  in the way, 0 to 3, optional): leaks for 12 weeks; heaviness with a doctor first, then to week 16 after "a doctor said prolapse".
  Both then keep strong to month 12 (the plan's `keep`, as every plan's); after a prolapse the 12 weeks carry on with 3 sets a day to
  week 16.
- "Before you start" (screen `pfsafe`, `pfflags`): 7 signs NICE NG123 1.3.20 sends to a doctor before exercises (can't pass urine
  or dribbling all the time, leaking all the time after a long labour or an operation, burning, fever or blood in the urine, a bulge
  that stays outside, wind or stool she can't hold, pain when she squeezes or with sex, a past operation for leaks or prolapse or
  pelvic cancer treatment). Each shows its line as she ticks it; nothing has to be answered. A plan that asks nothing about her day
  has no "Your day" (`screensOf`), and this one asks no time to move.

**Her sets: 8 levels from her sets, never the calendar** (`PF_LV`, `pfLevel`): lying 3 s × 8, lying 5 s × 8, sitting 5 s × 10
with 5 quick, sitting 7 s × 10 with 10 quick, standing 5, 8 and 10 s × 10 with 10 quick, then standing or walking. 5 days of sets at
a level open the next; each 3 weeks away steps her back one level ("Welcome back"), never to the start unless the break is long. Her days are the trainer's (`S.post.pfDays`) and her Done in
the check-in. Lying sets only (level 2) on the heaviness track until she says what the doctor said (`d.pfDoc`), and after a past
operation or pelvic cancer until "My doctor said more is fine" (`d.pfOk`); a cap counts from the day it lifts, so she moves up one
level. Pain (her safety answer, or "It hurts" twice in the trainer, `d.pfRelax`) makes her sets "Breathe and let go, a few minutes"
(Wind down's slow breaths) until "A doctor checked it" (`d.pfPainOk`). 3 sets a day; 1 on a period day; 1 a day after week 12,
except 3 to week 16 after "a prolapse" (`pfTarget`).

**Today, at most 3 steps** (`slots: { max: 3, day1: 2 }`; adapters `pelvic.sets`, `pelvic.find`, `pelvic.checked`, `pelvic.urge`,
`pelvic.habit`; `if` words `pfurge`, the urge track, and `pfgoal`, the pelvic floor among her goals):
- her squeeze sets, "{n} of {m} today · level {n}, {position}", partly done after one set; its play button opens the trainer with a
  set started (route `pf-go`, mods/pfplan.js: it draws the trainer at once, `S.post.renderPelvic`, and puts `post-pelvic` in its
  place in her history, so Back returns to Today; the trainer's afterRender keeps the set's timer for it);
- Find the right muscles on days 1 to 3 (day 1 has these 2 steps), and all of her first day at a new position (sitting at level 3,
  standing at 5, walking at 8: "Your sets are {position} now: find the squeeze that way first, then start");
- Get checked once by a doctor on the heaviness track, until "What did the doctor say?";
- When the urge comes (urge or both) from day 4, opening `pf-urge` ("stop, squeeze, breathe, walk calmly"; from week 3 a little
  longer each week);
- one habit a fortnight from week 2, opening the week's chapter: the knack (week 2), water through the day (3 to 4), knees up on the
  toilet, or less tea, coffee and cola for 2 weeks on the urge track (5 to 6; decision 5), lifting the safe way (7 to 8), one set
  standing at a task (9 to 12).

**The trainer** (mods/post.js `renderPelvic`), when her plan runs it or her sets join another plan (`S.plan.pelvic.on()`), and never
in pregnancy: her level sets the hold, the squeezes, the quick squeezes (1 s squeeze, 2 s let go, after the holds) and the position,
with its 3D still (`bridgedown`, `chairsit`, `wall`, `walk`; with no `web/fig`, no picture); a soft tone as each squeeze starts
and as she lets go (decision 6: tones, vibration and big numbers, never a word; Dr. Megha's voice as an option needs new clips from
the paid voice service, so it waits for Mohit); "Next level after {n} more days
of sets"; "It hurts" stops a set; her plan's sets for the day (1 on a period day); the knack after a set from week 2 (stress and both
tracks); in her first week, Find the right muscles first. Its intro and Back are for any stage (`pf_p_any`, back to Today); after a
birth and in pregnancy it is as it was. Without a recent birth, no after-birth lines (the belly gap check, "3 months after the birth", the
after-birth Qura doctor card and links): the prolapse guide as one row, and "Is it the right squeeze?" with a Qura doctor. A
finished set syncs her rings (`S.plan.pelvic.sync`).

**Her sets join another plan** as one step (`{ use: 'pelvic.sets', if: ['pfgoal'] }` at the end of ttc, heavy, meno, pain and pms
version 2): Getting ready when the pelvic floor is any of her goals at the trying stage, My period plan and My midlife plan when it is
a second or third goal. On a day already full, the sets are the one row under her steps until done (`pfJoinRow`, before the
chapter). "Your plan for this" on the guide leads to the plan she runs.

**Her evening.** The check-in after her last set, at her time, as every plan's; the evening ring names her last set ("Your last set,
then how did today go? 1 minute", `REM_PF`). One new ring, her morning set at 8 am (`plan-pf`, `pfSync`; its reason: NICE's 3 sets a
day for 3 months, and keeping going is where training fails), its words neutral, done for the day after a set, off in Me stays off;
it opens `pf-go`. In the check-in, never on a shared phone or in discreet mode:
- every week, the after-birth plan's reviewed "This week: any leaks?" (`lk`; "This week: any heaviness?" on the heaviness track);
  not sure of her track, a leak asks "When did it happen?" and her answer sets it;
- "Are you sure you’re squeezing the right way?" in weeks 1, 4 and 12 (`pfs`); "How much does it get in the way of your day?" in
  weeks 4, 8 and 12 (`pfw`); "Compared with when you started?" at week 12 (`pfc`).
Its 4-week measure is in the check-in, so the generic 4-week check (energy, sleep, mood) and its row don't come with it.

**One card at a time, a Qura doctor first** (`cardKind` 'pf', `pfDue`, `pfCardHtml`, `wirePf`): her doctor-first signs lead (from
day 1, before every other card; plain words on a shared phone) until "I’ve seen a doctor"; a past operation or pelvic cancer; pain;
"What did the doctor say?" once she has ticked Get checked once; "Is it the right squeeze?" in weeks 2 to 4 and whenever she isn't
sure (a Qura doctor first, then her own doctor or a women's health physiotherapist, with the government hospital's gynae OPD as one
quiet line; decision 4); after 12 weeks while she still leaks, "Still leaking or heavy?" (the treatments after exercises, Tele-MANAS
14416), after the end card. The end page's doctor card says the same, after "Still leaking or heavy?" (`plan_pf_end_p`).

**A chapter a week** (`mods/perplan.js`'s pattern, `mods/pfplan.js`): f1 to f12 for every track, v1 to v4 (weeks 13 to 16) after "a
doctor said prolapse"; route `pf-lesson`, under My plan, behind her PIN on a shared phone (with `pf-urge`); one row under her steps
until read. Chapter 10 has the 112 line. `S.plan.pelvic.lesson()` gives the week's chapter.

**Her results** (`pfResults`, on My progress): leaks (or heaviness) first and latest, how much it gets in the way at the start and
latest, sure of the squeeze first and latest, and her level with her days of sets; on a shared phone only her level. It never says
"cured".

**The 112 line** (a new line for the doctor): "Suddenly unable to control your bladder or bowel, with numbness between your legs,
weak legs or bad back pain" (`s1d`), in Help's "Call 112 now if", in the prolapse guide and in chapter 10.

**Her stage changes.** A pregnancy pauses it (My pregnancy has its own pelvic floor step); after a birth My recovery plan takes over;
at the trying stage Version 39.48's card offers Getting ready (`CYC_PACKS`), and Keep keeps it.

**The minimalist baseline** (CLAUDE.md):
- **Her evening:** one new ring, her morning set (its reason above); the check-in rings after her last set and names it; no spacing
  rule, no cap.
- **Today:** day 1 has 2 steps and no day more than 3; one Sakhi says card; one row under her steps (the chapter, or her joined sets).
- **Ask less:** one new screen before her first step, "Before you start" (its reason: NICE NG123 1.3.20 sends these signs to a doctor
  before 3 months of exercises, and constant leaking after a long labour can be a fistula); "When do you leak?"; nothing else, and no
  "Your day".
- **One home for each fact:** the trainer holds the sets, the guide the treatments, the check-in the measure (so no generic 4-week
  check), the chapter the habit's how.
- **Read once:** how it works folds after week 1, as every plan's.
- **No new tours, tips or celebrations.** A missed week steps her back a level, never to the start.
- **The shared phone:** "Your 2 minutes", neutral rings, no pelvic words on Today, no measures, the chapters behind her PIN.
- **Taps:** see the build summary.

**The test pass** (Mohit, 3 Nov: "can you throughly test for any bugs or gaps"; the test's section 17):
- Her 8 am ring follows her plan: Stop my plan ends it (`closePlan`), a pause, a pregnancy or another plan rests or ends it and it
  comes back with her plan (`pauseSync` runs `pfSync`), a plan she stopped earlier no longer makes a new plan's ring look deleted
  (`pfMade` and `pfHeld` go with a fresh start, as the nudge's Version 39.32 fix), and a plan that starts tomorrow books it from
  its first day (`commitStart`). A new plan's cards start fresh (what she put away belonged to the plan before); a doctor's
  answer, "My doctor said more is fine" and the pain hold stay hers.
- A set after midnight counts for the evening before: the trainer saves sets on the plan's day (`S.planToday`, the 4 am rule),
  which the after-birth plan's squeezes gain too. A "Partly" in the check-in is a day of sets.
- "Your plan is ready" names "your 8 am first set" among what will ring, says "Days 1 to 3: Find the right muscles" and "In your
  first weeks: Get checked once by a doctor", and a plan her sets join says "Every day: your squeeze sets, 3 a day". My plan's "How
  to do it" for her sets is her level's squeezes. Her habit opens the chapter that teaches it (route `pf-habit`; Chapters still
  opens this week's).
- The evening's "What got in the way?" has no "Weather or safety", and its tips and the weekly look-back's are the plan's own
  (`plan_pf_tip_*`), with no cramps routine button.
- Her report for the doctor: when she leaks and how much it gets in the way, her signs before she started, what the doctor said,
  her leaks first and latest, her level.
- Search: Help's new 112 sign in her words (a loss of bladder or bowel control, together with numbness, weak legs or bad back pain:
  `URG_LOSS`, `URG_HOLD`, `URG_NERVE`) puts the urgent card first, as Version 39.30's signs do; leaking on its own does not.
- The trainer: after a birth the after-birth lines stay even with this plan running; its tile says "Guided squeeze-and-relax timer,
  step by step" (the belly gap check is for after a birth); "A doctor checked it: back to squeezes" in its breathing card (her sets
  joined to another plan had no way back); "Your plan for this" when no plan of hers runs it; and her sets joined to another plan
  show the 7 signs once before her first set ("None of these", "I've seen a doctor", a Qura doctor; `d.pfSafeAt`), with no set
  until she answers, as the plan's own joining asks them.
- "I can exercise" gets no prolapse chapters and no 16 weeks; after "a prolapse", "Still leaking or heavy?" waits for week 16; "What
  happens when" says "If a doctor finds a prolapse".

**The phone test** (Mohit's Flip5, 3 Nov; "fix all 6"; the test's section 18):
- Her sets take the better of her check-in's answer and the trainer's count. The check-in fills each step in as it stands and saves
  it, and a saved answer used to win, so a "Partly" after her first set kept 3 of 3 at "Partly done" and her day never completed.
  `markAction` keeps the mode a step was in beside its answer (`log[day].ckm[id]`, here 's' squeezes or 'r' breathing and letting
  go; `unmark` clears it), and her sets read only an answer given in their own mode (`pfAns`; an answer from before has no mode and
  is a squeeze answer). So the day she moves to breathing and letting go, that step doesn't show her squeezes' "Partly done", and a
  breathing "Done" is not a day of squeezes for her level.
- A step can carry `subP`, its line while partly done: her sets say their count ("1 of 3 today · level 1, lying down") where other
  steps say "Partly done" (discreet mode keeps "Partly done").
- The trainer in week 1 leads with Find the right muscles only before her first set of the day; after it, her set's result and Start
  come first and Find stays below.
- Breathing and letting go teaches no squeezes: the trainer shows no Find card, no squeeze ticks (her last 14 days stay) and no "Is
  it the right squeeze?"; its card has Slow breaths, "Ask a Qura doctor about this" and "A doctor checked it: back to squeezes".
- Every urgent card is ink (`card dark urgent`, section 93): the 112 cards in the pelvic floor, midlife and period chapters, the
  prolapse guide's, and the check-in's crisis card (Tele-MANAS 14416 and 112) were plain light cards.
- The trainer her plan runs lights My plan's tab (`tabOf`: `post-pelvic` while `S.post.pfPlan()`, and `pf-go`); without her plan it
  stays Explore's, as the after-birth trainer.
- Every plan's week dots (Today's `.pl-d7` and My plan's `.pl-r7`, section 57) tell a screen reader "1 full day so far" and "{day}: 0
  of 1 step" for one (`plan_d7_aria1`, `plan_d7_t1`, as `plan_wk_full1`); they said "1 full days" and "0 of 1 steps" (Mohit, 3 Nov,
  after the phone check of the fixes: "fix the aria label too"). Hindi's words were already right.

`node test/pfplan.mjs` checks it (147 checks; section 17 holds the test pass, section 18 the phone test's fixes). `node test/pfplan-walk.mjs [who]` lives it: five women from a new install (stress leaks,
urge leaks with periods stopped, heaviness with a doctor's check, pain when she squeezes, and period pain with her sets joined),
screens and words to `test/shots/pfplan-walk/`. `test/progs.mjs` knows the new words, and the baseline re-records `pelvic@1` and the
5 plans her sets join (ttc, heavy, meno, pain and pms version 2).

## 100. Version 39.57: the all-plans walk's gaps

Mohit, 3 Nov: "can you do a proper walkthrough of all plans one by one and highlight major issues or gaps with UX and
functionalities", then "fix all 11". The walk and its findings: `docs/plans-walkthrough-2026-11-03.md` (four walks, 20 women, the 7
plans). Item by item:

1. **My pregnancy's pelvic floor set** (`progs/v1.js` preg v2, `id: 'pf'`) is a tick with the trainer to play (`play`, 2 minutes),
   not a check that only the trainer counts: the check-in asks it (Done, Partly, Not today), and a set in the trainer still counts.
   A step from a tool (`from`) is done when its tool says so, even after a partly answer (`one()`; it used to keep the answer).
2. **Getting ready's folic acid tablet**, before she has said she has the tablets, is asked in the check-in (`ciAsk`: Done or Not
   today, no Partly, `noPart`), where it said "Do it now"; after her "Not yet" on its page that day, "Do it now" stays (Version
   39.32's rule, `test/baby.mjs` 4). The question is optional (Mohit, 3 Nov: "make the folic question optional"): it isn't one
   of the questions left, Save works without it, and nothing is saved for it unanswered (`pl-ci-opt`; the tap counters skip it, as
   the check-in's other optional cards). Her Done there means she has them (`S.ttc.folic.have()`): the 9 pm ring
   is booked and the step is a tick from then on. Today's row still opens the tablet page ("Not got it yet? See where").
3. **The doctor loop.** Today's doctor finding (a `month` or `week` level, `mods/explain.js` `home()`) has "I've seen a doctor":
   off Today (as "Got it"), and her plan's doctor check done when her plan has one (`S.plan.docSeen()`). After 4 weeks on Today
   (`explain.shown[key]`), "See a doctor this month" reads "Still to see a doctor?". While her plan's own doctor check applies to
   the finding (`SEEN_IDS`, not `late_now`), the finding steps aside on Today (`S.plan.docOwns`) and the plan's "Did you get the
   doctor check?" leads (`data-slot-first`), past day 21 while the finding is open (`S.explain.openIds`).
4. **The doctor route on the missed-period pages** (`mods/pregtest.js`): "Where to get a test" says a chemist and her doctor, with
   one quiet line for the free test; a positive result keeps one quiet free line (the ANM's registering and tablets go). The
   12-week end page's order (a Qura doctor, then the free government doctor) is Version 39.28's and stays.
5. **Trying for a baby** (`situation.planning`): the missed-period page leads with the test, and its choices are one quiet row at the
   end ("Your choices"), with no abortion rows of their own; a positive result has no "Didn't plan this?" and no "Your choices",
   only the pregnancy guide. Today's "Period late? A home test is the first step" goes once a positive test is saved since her last
   period started (`S.pregtest.lastPos`); Sakhi says' "Your test is positive" holds it.
6. **"Your period today" in the check-in** asks whether a pad soaked through first; clots and "Did it get in your way?" follow once
   she answers (or when the day already has them). "Pain today?" was already asked once (Today or the check-in, never both).
7. **After the birth, day 42**: the stage card says "The first 6 weeks are done", not "Week 6 of 6" beside her plan's "Week 7".
8. **My plan after a plan change** shows the change card and her new stage's goals (the new plan's start) with no suggestions or
   more plans (`renderPlans` `bare`) until she answers it (`test/goals.mjs` 3 and 10 keep the goals). "For period cramps" isn't offered in the first 6 weeks after a birth.
9. **My midlife plan**: the hot-flush skill "carry on" is "carry on through a flush".
10. **My PMOS plan's first question**: equal gaps say "your last 2 gaps were both 42 days" (`plan_in_from_eq2`, or "all" for more).
11. **The anaemia page** says its 112 line once, at the top (the "See a doctor" card repeated it).

`node test/allwalk.mjs` checks it (26 checks; 22 of the first 25 fail on 97b02b2). With the folic question optional, the taps are
unchanged against 21a9a6d (the cycle woman 43, 55, 47 and 70; the trying woman 53, 57, 45 and 70). The baseline re-records `preg@2` (the pelvic floor step), and the
golden replay re-records `post/preg/food/born-mid-run` (My plan after the birth: no suggestions or more plans).

## 101. Version 39.58: the lives audit's quick fixes

Mohit, 3 Nov: "proceed with the quick fixes first", on `docs/lives-audit-2026-11-03.md` (one woman per stage lived over weeks and
months, `node test/lives-walk.mjs`; its section 5, phase A). Four fixes; the audit's fifth ("Have your periods stopped?" at 12 months)
was already built (meno.js `stopDue`, from 40) and is kept by a check. No new health wording: each new line reuses a reviewed one.
1. **The doctor check** (plan.js slot `doc`, "Did you get the doctor check?", every plan that has one): "Ask a Qura doctor"
   (`.pl-doc-qura`, `data-ask` with her plan's name; on a shared phone the call form with no topic) in every plan, where only My
   period plan had it. "Free government doctor" only on the government route (`S.care.gov()`), in its order (`byRoute`); on the
   doctor route (a private doctor, nowhere yet, or not answered) it goes, as Version 39.28 says. (Anjali, PMOS, saw only "Free
   government doctor" from day 48 to day 85.)
2. **Bleeding after her periods stopped** (core `stoppedNow`, `startLbl`, `endLbl`; `situation.stopped`, not pregnant):
   - Today's button, the + menu and the log sheet say "Bleeding" (`bleeding`), never "Period started", and "Bleeding stopped"
     (`bleed_end`) for its end; Days tags a start after `stoppedOn` "Bleeding" (`t_bleed`), as in a pregnancy.
   - Saving a start or spotting says "Saved. Any bleeding now needs a check with a doctor, even a little." (`logged_stop`: off_p_stopped's
     reviewed line) with "What this means" (What your diary shows, where `bleed_after_stop` leads) and Undo. A shared phone keeps its
     plain button and "Noted.".
3. **A negative test on Today** (core `lateRow`; `S.pregtest.negNote(from)`): "Period late?" after a negative test saved since her last
   period started says "Negative on {d}." and the reviewed "If your period still hasn't come, test again in 3–7 days with first morning
   urine."; two negatives 5 days apart or more give the reviewed two-negatives line (`NEG2`, the same object as the page's, with its
   doctor-route words). The row opens "When can I test?" (`pregtest-when`), where her next test is saved. A positive still takes the row
   away (Version 39.57).
4. **Her plan on a shared phone** (plan.js `offerCard`): discreet mode no longer hides "Ready for you". Its title is her plan's plain
   one ("My plan", `packTitle`), its words were already plain, and it carries `data-disc-ok`. Her plan's questions, cards and Start
   (`plan-goal`, `plan-reveal`, `plan-start`) join `PIN_ROUTES`, so on a shared phone with a PIN they ask it first. The POI card
   stays off a shared phone.

5. **Version 39.58.1, the setup card's government steps** (Mohit, 3 Nov: "fix the ASHA and free care setup steps too"; the lives
   audit's C4): "Save your ASHA or ANM's number" (`mods/asha.js` `setup`) only on the government route (her ASHA, or a government
   centre), and "Look at free care near you" (`mods/access.js` `setup`) on it and for "Nowhere yet" (`S.care.route() === 'none'`: the
   government option one tap away). A private doctor, or no answer, gets neither: Explore keeps its one Govt. services row. Pregnancy and
   after a birth keep "Check the scheme money you can get" (money she can claim wherever she goes), unchanged. An older core without
   `S.care` keeps both steps. Suites that check the government route's setup card seed `care: 'govt'` (`test/value.mjs` 6,
   `test/baby.mjs` 16); `test/firstday.mjs` 3 answers "Nowhere yet".

**State.** Nothing new is saved.

**Strings.** `bleed_end`, `logged_stop` (core); "Negative on {d}." (pregtest.js). English and Hindi.

**Tests.** `node test/lifefit.mjs` (37 checks; 39.58.1 added section 7, the setup steps by her care answer: the doctor check on each care route and a shared phone, bleeding after menopause in
English and Hindi at 360 px and on a shared phone, one and two negative tests on each route, a positive, an old negative, the shared-
phone offer and its PIN, the POI card, and the 12-month question). The walks behind it: `test/lives-walk.mjs`, `test/census-walk.mjs`
and `test/stagejump-walk.mjs` (not pass/fail).

## 102. Version 39.59: phase B, a calmer Today

Mohit, 3 Nov: "proceed with phase B" (`docs/lives-audit-2026-11-03.md`, section 4: R3, R4 and C3; `docs/personal-companion-
advice-2026-11-03.md`, 4.3). The age bands (R1) wait for the doctor (the audit's L1). No new words.
1. **Tips** (R4; core `autoGate`, `tipWeek`, `endTour`): a tip comes on its own only in her first 7 days with Sakhi (`joined`) or
   the 7 days after her stage changed (`prompts.exStage`), and one a day (`tourDay.n`; it was three). A tip that came on its own and
   that she puts off ("Not now", Close, Back) is `off` at once (it came back once before). Her welcome tour on her first Today is
   unchanged, and Me > How to use Sakhi plays any tour, as before.
2. **Cards that end** (R3):
   - Today's first-days read (`firstDaysRows`, `core-read`) shows on 3 days at most (`prompts.readDays` `{ n, d }`); Learn keeps it.
   - A "Sakhi says" card that leads 3 days and waits 7 (Version 39.47) waits 30 days after its second turn (`ASIDE_LONG`;
     `prompts.slotN` `{ key: { n, d } }`, which starts over after 60 days away). A card that keeps her safe always leads, unchanged.
3. **Today** (advice 4.3), with no plan on Today (no running plan, and no card holding its place: `heroFeel`): her log buttons
   (`.ract-row.hl-logs`) and her feelings' chips (`feelCard(disc, true)`, `.feel-card.feel-in`, "How do you feel today?" as a line) sit
   in the card with her body today; there is no feelings card of its own and no "How I feel" button (`heroFeelNow`). While a plan runs,
   Today stays as Version 39.23 made it: her steps start on the first screen (REGRESSIONS-08), her feelings card follows them, and
   "How I feel" stays in the headline. Pregnancy, after a birth and a shared phone are unchanged (no chips).
4. **One home** (C3): `S.plan.tileGo()` gives the pages her running plan's 4 tiles open, and Explore's For you leaves them out. Nothing
   fills their places, so a tool kept lower stays lower. Explore keeps its length: the library row is phase D.

**Measured** (`node test/census-walk.mjs`): with no plan on Today, 1 card and 1 tap fewer (day 1: Priya, Sana, Anjali, Neha 4–5 → 3–4
cards; Priya on day 8 4 → 3); on a plan, day 8 as before (Kavita and Sunita 6 → 5 cards, 32 → 31 taps, from a card that waits). `node test/lives-walk.mjs` (Priya, Anjali, Riya, Meera, Kavita): tips in the first 30 days 3, 4, 4,
4, 4 → 1, 1, 3, 3, 1 (Riya's and Meera's in their first week, one a day); Today's cards over months 5–7 → 2–6.

**State.** `prompts.readDays`, `prompts.slotN`.

**Tests.** `node test/calmtoday.mjs` (18 checks: tips by day and week, "Not now", Me's tours, a stage change's week, the read's 3 days,
a card's second turn, Today's one card for her body and feelings with and without a plan, pregnancy and a shared phone, Hindi at 360 px,
and For you without her plan's tiles). Updated for what changed on purpose: `tours.mjs` 1b (a screen's own tip in her first week, on a
day no other tip showed) and 2 (a tip put off is `off`), `goals.mjs` 8 and 11 and `afterbirth.mjs` 15a (her plan's tiles stay in My
plan), `daily.mjs` 6 (the feelings line in the card with her body today).

## 103. Version 39.60: "Share how I use Sakhi" through PostHog, events only

Mohit, 2 and 3 Nov: "my goal is to find what users like and spend time more on and then this will define our future roadmap", then
"find me a ready to use free solution that fits my needs" and, after the Flip5 test, "yes proceed". The research, the test and the
choices: `docs/activity-tracking-advice-2026-11-02.md`, sections 15 to 17.

**The rule it changes.** Until now only core `net()` talked to a server (section 24). Core's PostHog block is the one other way out,
and only as set here: events only, anonymous, on by default with her off switch, through an allowlist. Modules still never touch the network, and nothing in
this block reads the diary.

**What she sees.** In a build with a PostHog key, Me > Privacy's "Help improve Sakhi" has "Share how I use Sakhi" (`ph_h`, `ph_d`,
`ph_note`), above "Send what helps" when that one shows. It is **on by default** (Mohit, 3 Nov: "i need to keep it on by default"),
like Version 39.27's reminders: no question, and off in Me stays off. The data notice ("How Sakhi keeps your data", at signup and in
Me > About) has one more line in such a build (`ob_notice_6`, through `noticeItems()`), and the notice version she agrees to at signup
and with a call request is `NOTICE_V + '.ph'` (`noticeV()`), so the consent rows say which notice she saw. A build without the key has
no switch, no line and no PostHog code, and its notice version is unchanged.

**How it works (core, after the "What helps" block).**
- `phAvail()`: `CFG.ph` is a PostHog project key (`phc_...`, from `SAKHI_PH`). `phIsOn()`: `state.settings.ph !== false`. `phOn()`: both, a saved
  diary, no sample woman, not teen browsing, not discreet mode, not a shared phone. `phQuiet()`: not on, the lock is up, or the screen
  is private.
- `phStart()` (at start, and after any Me switch) loads `vendor/posthog.js` from the app's files (posthog-js 1.444.4, the
  `array.full.no-external` bundle, which never loads code) and starts it with: `persistence: 'localStorage'`,
  `opt_out_persistence_by_default`, `person_profiles: 'identified_only'` and never `identify()`, `ip: false`, no referrer or campaign
  params, `capture_pageview: false` (core sends its own), `capture_pageleave`, `autocapture` with `mask_all_text` and
  `mask_all_element_attributes`, rage and dead clicks, `capture_exceptions`, and off: recordings, heatmaps, surveys, product tours,
  conversations, web experiments, performance, external code, and flags (`advanced_disable_flags`, so PostHog's own settings never
  reach the app: its dashboard can't switch recordings or surveys on). `get_current_url` gives the neutral address.
- `phView(r)` (from `render()`, beside `usageMark`): a `$pageview` when the neutral screen changes; PostHog adds the time on the screen
  before (`$prev_pageview_duration`).
- `phScreen(r)`: `null` for a private screen (`PH_PRIVATE`: loss, a loss while trying, the abortion, options and after pages of a test,
  intimate health, midlife intimacy, emergency and missed-pill contraception, the mood page after a birth, teen pages, Tell a person,
  backup, account, Me's data and health pages, the picture check); the route itself for `PH_EXACT`; else the kind from `PH_FAMILY`
  (`plan-pmos` is `plan`, `per-lesson` is `lesson`, `relief-cramps` is `relief`, `cond-endo` is `condition`, `preg-week` is
  `pregnancy`, `a-...` is `article`); anything unlisted is `other`, never its route.
- `phKeep(e)` (`before_send`, so it sees every event PostHog makes): drops all while `phQuiet()`; keeps only `PH_EVENTS` (`$pageview`,
  `$pageleave`, `$autocapture`, `$rageclick`, `$dead_click`, `$exception`) and only `PH_PROPS` plus `$prev_pageview_*` and
  `$dead_click_*`; rebuilds `$elements_chain` as tags and positions (`phChain`); keeps an error's type and frames with file names only,
  never its message (`phErrors`; `$exception_values` goes); sets `$geoip_disable` (PostHog's server otherwise looked up her city, postal
  code and coordinates from the IP before discarding it: seen on the Flip5, 3 Nov); sets `$current_url`, `$pathname`, `$host` to `app.sakhi.invalid/<screen>`
  and adds `screen`, `lang` and `app`; deletes `$set` and `$set_once`.
- `safe()` hands the errors it catches to `phCatch` (type and place only).
- Off in Me, or Delete everything: `phStop()` opts out, resets and removes PostHog's `ph_` keys, so on again starts a new anonymous id.
  Discreet mode or a shared phone stop it at once through `phOn()`.

**Build.** `SAKHI_PH=phc_...` (`android/build-apk.sh`) adds `ph` and `phHost` (`https://eu.i.posthog.com`) to `config.js`, copies
`vendor/posthog.js` and its licence, and adds that one address to the CSP's `connect-src`. Without it: no vendor folder, no key, the CSP
as before. The PostHog project must be in the EU region with "Discard client IP data" on.

**State.** `settings.ph`: unset means on; `false` once she turns it off. PostHog's own `localStorage` keys (`ph_<key>_posthog` and its session) while it is on; Delete everything removes them too.

**Strings.** `ph_h`, `ph_d`, `ph_note`, `ob_notice_6`. English and Hindi; UI words only (no health wording). The notice line waits for counsel, as the notice does.

**API.** `S.ph` for the tests: `on()`, `ready()`, `screen(r)`, `keep(e)`.

**Tests.** `node test/posthog.mjs` (44 checks: no key (no line in the notice), turned off, on by default with a hostile PostHog config that switches recordings, heatmaps and
surveys on from its side; the allowlists, neutral names, no screen words, number, Hindi, route or file path; no other address; private
screens by capture time; Version 39.62's All topics and guides as `library`; an error without its message; discreet, shared, off and on
again with a new id; Hindi at 360 px). The test browser hides `navigator.webdriver`, because posthog-js drops events from headless browsers
as bots.

## 104. Version 39.61: phase C, joining that ends with her plan running

Mohit, 3 Nov: "proceed with phase C" (`docs/personal-companion-advice-2026-11-03.md`, 4.2 and decision D1: "Joining ends with her plan
running, and her first log becomes her first step. This replaces Version 39.10's order"). Version 39.60 and section 103 are the
activity-tracking session's (PostHog), uncommitted when this was built.
1. **Your Sakhi** (core `renderYourSakhi`): when her first goal has a plan (`prompts.planOffer`) and "What your dates show" doesn't
   already offer it (`data-xp-plan`), "Make my plan · about a minute" (`#ys-plan`) leads; "Show me around" stays, and "Just my diary
   for now" (`#ys-skip`) opens Today. Its plan row says "Your plan, from your answers" (`ys_plan_now`; it said "after your first log").
2. **Her plan's questions straight away** (`S.plan.offerGo` with `planIntake.fromJoin`; the dates card's free plan sets it too, on Your
   Sakhi): her goal and what joining holds aren't asked again (Version 39.10's `known`), there is no summary screen (`screensOf`: no
   `sum` from joining; Change my answers is on the next page), and Back on her first question returns to Your Sakhi. Her plan's own
   safety screens stay among her questions: pregnancy's "Before you start" (`psafe`), the pelvic floor plan's (`pfsafe`), the midlife
   plan's bones and chest questions.
3. **One page for her plan** (`renderReveal` with `S.mem.rvOne`, from joining only): her plan's ready card, her steps, her version's
   doctor card when it has one, and Start (day, check-in time, what will ring), divided by lines, with Change my answers once and the
   disclaimer; no Next and no card bar. Her days and weeks are in My plan's How it works (folded after week 1, Version 39.19). Every
   other way in keeps the cards.
4. **Her first log no longer holds her plan** (`offerCard`): Today offers her plan from the start, "Made from your answers."
   (`plan_off_p0`), and after her first log, as before, "…and your first log." The Diary's first-log card stays.

**Measured** (`web/test/taps/join-run.mjs`, the new path `plan`): install to her first plan step, the trying woman (7 dates) 52 taps and
24 screens → 44 and 17; the period-pain woman (her dates' free plan on Your Sakhi, path `ys`) 42 and 24 (her usual path then) → 34 and
17. The daily jobs aren't touched.

**Strings.** `ys_make`, `ys_diary`, `ys_plan_now` (core); `plan_off_p0` (plan.js). English and Hindi. UI words only.

**Tests.** `node test/planfirst.mjs` (16 checks: Your Sakhi's buttons and plan row, the questions without her goal or a summary, Back,
the one page and Start, the dates card's free plan, "Just my diary for now" and the offer's words before and after her first log,
pregnancy's "Before you start", Hindi at 360 px). Updated for what changed on purpose: `joining.mjs` (Today offers her plan from the
start), `firstday.mjs` 5 and `companion.mjs` 1.

## 105. Version 39.62: phase D, Explore and Learn by her day

Mohit, 3 Nov: "proceed with phase D" (`docs/personal-companion-advice-2026-11-03.md`, 4.6, phase D and decision D3).
1. **Explore's first screen** (core `renderCare`):
   - search, unchanged;
   - For you: her first 3 tools (`forYouTiles`, its order and rules, cut to 3) and her first 3 questions (`qaList`);
   - the government's free care, only for the government route and "Nowhere yet" (`freeFirst`, Version 39.28's rule);
   - her topic, one row (`.care-topic`: the first of `topicsFor()` with anything in it);
   - "All topics and guides" (route `library`);
   - Help and safety.
   No topic grid, Contents or dos and don'ts here. In discreet mode: search, the library row and Help. The line that says what
   Explore holds (`care_p`) shows in her first week and before she signs up, then folds away (explanation she reads once).
2. **The library** (route `library`, `renderLibrary`; under the Explore tab, Back to Explore, open in browse mode):
   - "More questions": her stage's dos and don'ts, then her questions after the first 3;
   - her topics grid as Explore had it (My food second; a shared phone's full grid);
   - the government's free care when Explore doesn't show it;
   - Contents (Learn).
   Explore's tour points at `.care-lib` (her topic and the library row).
3. **Her questions by her day** (`qaList`, `QA_GOAL`):
   - cycles and PMOS: a late period first, then her goals (pain, heavy, irregular, weight, skin);
   - a pregnancy: danger signs, then baby's movements from 20 weeks, and the sugar test from 24 to 29 weeks;
   - from 6 weeks after a birth, contraception after the birth;
   - trying, with a late period: the pregnancy test;
   - midlife: her goals (hot flushes, sleep, mood, bones, aches). Once her periods have stopped, bleeding after menopause comes
     next and "Periods after 40" goes. While they still come, bleeding after menopause comes last.
4. **PLACES-05 in Help** (`privHelp`, the Help sheet):
   - "Private help" holds the violence, abortion and STI pages, under their own reviewed titles;
   - they are 2 taps from every screen, at every stage, on a shared phone and in discreet mode;
   - in a pregnancy, "Pregnant and didn't plan it" (her choices) stands for the abortion page;
   - after a loss there is no abortion row, as in her topics (Version 39.0);
   - a page the build holds back isn't offered;
   - none while she joins, when only sheet rows work.
5. **Learn by her day** (`dayRead`, the advice's F4), used by Learn's Start here and Today's first-days read:
   - a pregnancy by her week:
     - to 12 weeks: registering, the check-ups, her tablets, the danger signs;
     - 13 to 23 weeks: the check-ups, the danger signs, her tablets, and the baby's movements from 16 weeks;
     - 24 to 33 weeks: the sugar test, the movements, the danger signs;
     - from 34 weeks: the danger signs, the movements, the after-birth guides;
     - "Register before 12 weeks" never after 12 weeks, and the after-birth guides never before 34;
   - after a birth: only the after-birth guides and the schemes;
   - midlife: her goal's guide first;
     - with her periods stopped: early menopause (before 45) and bleeding after menopause, without periods after 40 or
       contraception;
     - with her periods still coming: no bleeding after menopause, and no early menopause from 45;
   - trying: the pregnancy test first when her period is late, and PMOS and a baby for PMOS;
   - cycles and PMOS:
     - a late period first, then a girl's first periods, then her goals' guides, then period dos and don'ts on a period day;
     - never the girls' guide from 18;
   - then the rest of her chapter in book order.
   A plan's weekly chapter keeps its one home on Today and My plan, so Learn doesn't repeat it.

**Measured** (`node test/census-walk.mjs`, the 8 census women at 360 × 800; before on 1f578f2):
- Explore: 20 to 24 taps and 2.4 to 2.9 screens, down to 10 taps and 1.4 to 1.5 screens on days 1 and 8. The intro line folds from
  her 9th day, the same first week as the tips (Version 39.59).
- All six places on day 8: 141 to 167 taps, down to 130 to 154 (11 to 14 fewer for each woman); 12.4 to 13.4 screens, down to
  11.3 to 12.2.
- Learn and Today are unchanged. The Help sheet goes from 7 taps to 10 (the three private pages).
- Joining and the daily jobs keep their paths, so their tap counters weren't run.

**Tests.** `node test/library.mjs` (94 checks):
- Explore's first screen for the 8 women, and its folded line;
- her questions by her day;
- the library, the government route, "Nowhere yet" and discreet mode;
- PLACES-05 at 10 stages and from 7 screens, search, and joining;
- Start here and Today's read by her day;
- Hindi at 360 px.
Updated for what changed on purpose:
- `places.mjs`: her topics and Contents in the library; 11, the three pages through Help;
- `value.mjs` 2, 3 and 9: For you under search, and Govt. services on Explore only on the government route;
- `joining.mjs`: her topics in the library, and the abortion page through Help;
- `food.mjs` 4;
- `knowledge.mjs` 4 and 14: dos and don'ts in the library;
- `companion.mjs` 10b: her first 3 questions;
- `pictures.mjs` 11: 16 weeks;
- `pmosplan.mjs` 11;
- `latepreg.mjs` 6: For you's 3 tools, and the contraction timer on Today from 37 weeks;
- `check.mjs`: the route `library`.

**Strings.** `lib_h`, `lib_s`, `qa_more`, `hs_priv` (core). English and Hindi. UI words only. The reading order uses the reviewed
guides' own weeks (review 19.62, for the doctor to glance).

**Not changed.** A locked app hides the Help button, as before (`mem.locked`, the shared-phone rest screen and the PIN lock).
PostHog names the library "other" until section 103's list has it.

## 106. Version 39.63: phase E, the doctor ladder's first part

Mohit, 3 Nov: "proceed with phase E" (`docs/personal-companion-advice-2026-11-03.md`, 4.9 and decision D4). The advice puts a doctor
packet first: `docs/doctor-ladder-packet-2026-11-03.md` asks the doctor which doctor each sign in her diary should name first
(sections 2 to 4). That part waits for the answers. This version builds what doesn't need them. UI words only.
1. **3 taps to a sent call request, no typing** (core `ask`, `askDirect`, `renderAskCall`):
   - "Ask a Qura doctor" opens the call form straight away, with her topic in it. Before, it opened the doctor screen, then the
     form.
   - The doctor screen stays first in a pregnancy (her own doctor and the gynaecologist for the pregnancy), on the government route
     (the free government doctor), and where no call can be made. If Qura's side says it isn't taking calls, the form goes back to
     the doctor screen (`loadCalls` now redraws the form too).
   - The form offers up to 4 topics to tap (`.ac-tops`): the page she came from, her plan's name (`S.plan.titleNow`), her goals
     (not "just tracking"), and what she asked before. The first is chosen when she came without a topic. She can still type, and an
     empty topic still asks for one.
   - Measured, from Today's sign: 4 taps (the row, Ask, Ask for a call, Send), down to 3. From a guide: 3 down to 2. From Help: 4
     and typing, down to 3 and none.
2. **One label.** Help's row says "Ask a Qura doctor" (`hs_doc_q`) and opens the form with the page she was on as the topic
   (`pageTopic`: a guide's or a topic's title, a page's heading; none on the tabs or Me). In a pregnancy it stays "See a doctor",
   to the doctor screen. `doc_b` ("Speak to a doctor") is "Ask a Qura doctor" wherever it shows: the Help page, Tell, and the
   modules' doctor buttons.
3. **One doctor card on Today** (`S.explain.signOn`, plan.js `cardKind`): her plan's "Did you get the doctor check?" waits while a
   sign from her diary that the check doesn't cover is on Today (any level from "this month" up). It comes back when she puts the
   sign away ("Got it"). "I've seen a doctor" on the sign still counts as her plan's check (Version 39.57), and a check that covers
   the sign still leads.
4. **Her own doctor first** for a "See a doctor today" sign: "Call my doctor" (`.xp-mydoc`, her saved number, Version 39.40) leads.
   The free care near her follows. Without a saved number it leads, as before. Never in discreet mode.

**Waits for the doctor (the packet):**
- which doctor each sign names first ("See a gynaecologist", "See a doctor" or a Qura doctor), and the line under it;
- what "See a gynaecologist" opens;
- the order of a doctor card's buttons.

**Strings.** `hs_doc_q`, and `doc_b` changed (core). English and Hindi. UI words only. The other languages keep their own
`doc_b` until they're translated.

**Tests.** `node test/ladder.mjs` (27 checks):
- the taps from a sign, a guide and Help;
- typing;
- the doctor screen in a pregnancy, on the government route and without a server;
- one label;
- one doctor card on Today;
- "Call my doctor";
- Hindi at 360 px.

## 107. Version 39.64: phase E, the doctor ladder's second part

Mohit, 3 Nov, answering the doctor packet's questions himself (`docs/doctor-ladder-packet-2026-11-03.md`, section 7): "Qura first,
gynaecologist second", the gynaecologist button as "See a gynaecologist", "Tele-MANAS, then Qura" for low mood, and no line that
steers her away from the Qura doctor ("No recommend a qura doctor"). The locked app keeps Help hidden.
1. **The doctor a sign needs, second** (`mods/explain.js` `DOC_NEXT`, `docNext`; the finding cards on What your diary shows and the
   Diary):
   - every sign at "this week" or "this month" keeps "Ask a Qura doctor about this" first;
   - "See a gynaecologist" (`explain_gyn`) or "See a doctor" comes second, for the packet's map, which the doctor confirms:
     - a gynaecologist: bleeding after menopause or after sex, spotting, a long or heavy period, pain that stopped her day, pain
       during sex, long or short gaps, no period for 90 days, PMOS signs, discharge, hot flushes;
     - a doctor (MBBS): the sugar-test sign, low Hb, burning when she pees, a racing heartbeat;
   - the button calls her own doctor's number when she saved it (never in discreet mode);
   - otherwise, on the government route, it opens the guide to a gynaecologist at a government hospital, or the free doctor page for
     an MBBS sign;
   - otherwise it opens Care near me (Govt. services without its data).
2. **Low mood** (`MIND`: low mood or anxiety, low mood after the birth): "Call 14416" (Tele-MANAS) first, then "Ask a Qura doctor".
3. **The trying-for-a-baby and midlife tips** (`home-ttc`, `home-meno`) show on Explore, where their quick answers moved in Version
   37:
   - On Today their first step had nothing to point at, so the tip on its own ended at once. The full tour skipped to the trying
     tip's second step, the Explore tab, and showed none of the midlife tip.
   - Now the trying tip points at her questions, then her topic, Trying for a baby.
   - The midlife tip's second step, bleeding after menopause, shows where that question is among her first three: once her periods
     have stopped.
   - `tours.mjs` 11 follows: the trying woman's full tour has her own part on Explore, and Today in its two steps.

**Strings.** `explain_gyn` (explain.js). English and Hindi (the baby plan's Hindi for a gynaecologist). UI words only. The map is the
packet's, marked † for the doctor.

**Tests.** `node test/ladder.mjs` section 7 (now 34 checks):
- heavy flow: "Ask a Qura doctor", then "See a gynaecologist", with no line against the Qura doctor;
- her saved number;
- the government route;
- burning: "See a doctor";
- low mood: Tele-MANAS first;
- the trying tip on Explore.

## 108. Version 39.65: the stage-change rules

Mohit, 3 Nov: "proceed with the stage-change rules" (`docs/personal-companion-advice-2026-11-03.md`, 4.11; decision D7: ask, never
block). The case behind it: `node test/stagejump-walk.mjs` (Priya, 22, on My period plan, picks a midlife stage). Her records were
always kept. What changes is what Sakhi asks and offers.
1. **The stage sheet checks what Sakhi knows, and asks once before saving** (core `openStage`):
   - **Under 40, "Periods changing after 40"**: "This is for women around 40 and older. What's happening for you?" (`st_age_q`). Save
     waits for the answer:
     - "My periods have become irregular": Tracking, with irregular periods as her first goal;
     - "My periods have stopped": the next rule;
     - "I tapped it by mistake": the sheet closes and nothing changes.
   - **Under 40, "My periods have stopped"**:
     - the sheet shows the reviewed POI line (`meno_tl_poi0`), with "Ask a Qura doctor" first, "See a gynaecologist" (Version 39.64)
       and "Could you be pregnant? Take a test first" (the test pages);
     - Save notes it (`situation.stopAsk`) and keeps her on Tracking: her cycle keeps counting, her period buttons and estimates
       stay, and her plan runs on;
     - the POI card leads Sakhi says, on a running plan too (plan.js `poiAsk`, `poiDue`). It offers "Ask a Qura doctor", "See a
       gynaecologist" and "My doctor says my periods have stopped". That button (`S.stopConfirm`) counts them stopped from her last
       period, as Version 39.53's "My doctor has seen me" does for the hold.
   - **From 40, with a period in the last 6 weeks †, "My periods have stopped"**: "You logged a period on {d}. Have your periods
     stopped since then?" "No, not yet" picks "Periods changing after 40". "Yes" counts them stopped, never from the period she is
     on: from its logged end (Version 39.0's XS-1), or, while no end is logged, 9 days after its start if that is later.
2. **Only a plan that fits her age** (plan.js `fitWhy`): no "My midlife plan may fit now" under 40.
3. **A period after "stopped" asks first** (core `periodsBack`, from Today's button and the log sheet): "Your period came. Have your
   periods come back?"
   - Yes: her cycle counts again ("Periods changing after 40" from 40, Tracking before).
   - No: Version 39.58's line, "Any bleeding now needs a check with a doctor".
   - Under 40, within 4 months of the stop, Yes comes first †; otherwise No.
   - Under 40, with only her word for it (`stopAsk`, her cycle still counting), her next period asks too, Yes first. Yes takes the
     POI card away.
   - Never in discreet mode.
4. **Undo** (core `undoStage`; between Tracking, Trying, Periods changing after 40 and My periods have stopped):
   - "Updated" has Undo;
   - for 30 days the stage sheet offers "Changed by mistake? Back to “{stage}”" (`state.stageWas`);
   - either puts back her stage, her estimates and her goals;
   - a plan she started on the change 3 days ago or less gives way to the plan she had, at its own week (plan.js `stageUndo`, Version
     39.35's `restorePrev`), or ends if there was none.
   A pregnancy keeps its own "marked by mistake" (Version 39.35).
5. **One truth:** while her periods change after 40, the Diary's day page shows no next-period countdown, as Today shows none.

Updated for what changed on purpose: `lifefit.mjs` 2 (a period after "stopped" asks first; "No" keeps the line) and `fieldtest.mjs`
6 (she answers the 6-week question first).

**Strings.** Core: `st_age_q`, `st_age_irr`, `st_age_oops`, `st_poi_count`, `st_poi_test`, `st_poi_saved`, `st_last_q`, `st_last_y`,
`st_last_n`, `st_mistake`, `st_back`, `back_q`, `back_y`, `back_n`, `back_done`. plan.js: `plan_m2_poi_stop`. English and Hindi.
The lines marked † wait for the doctor (review 19.65).

**Tests.** `node test/stagerules.mjs` (31 checks):
- the age question and its three answers;
- the POI line and her cycle counting on a running plan;
- "My doctor says my periods have stopped";
- the 6-week question;
- "Have your periods come back?" both ways and its order, and after an unconfirmed stop;
- Undo, "Changed by mistake", and a plan's earlier week coming back;
- no midlife offer under 40;
- the Diary's countdown;
- Hindi at 360 px.

## 109. Version 39.66: plan questions on their day

Mohit, 4 Nov: "proceed with plan questions on their day". This is the advice's phase C leftover
(`docs/personal-companion-advice-2026-11-03.md`, 4.2: "Each question is asked on the day it first matters") and the minimalist
baseline: "Ask less: only what the plan uses, on the day it changes something".
1. **Before Start** (plan.js `DAY_NOW`, `qsAsk`): "Your day" asks only the midlife plan's two safety questions (weak bones, chest pain
   when she walks). For every other plan there is no "Your day" screen. "Change" on the summary's Your day row (`a.dayShow`) still
   shows every question; "Change" on another screen doesn't bring them in.
2. **At Start** (`startFromIntake`, `d.dayAsk`, one of `NEXT_KEYS`):
   - the plan's own day questions (its spec's `intake.day`) that weren't asked wait for their day: how active she is, how she eats,
     milk, her knees or back, her bedtime and her day;
   - an answer she gave before isn't asked again (an earlier plan's level, limits, bedtime or day; My food's diet), and her bedtime and
     her day carry on to the next plan as her level and food already did;
   - a default isn't an answer (`dayWait`): what still waits on the plan she is on keeps waiting on the next one, the summary and
     Change don't fill it in (`dayPre`), and after a birth her pregnancy's gentle default isn't taken as her knees or back;
   - meanwhile the gentlest level (0), gentle moves for her knees and back (both limits on), her food from My food or veg, and no
     bedtime target.
3. **The summary** (`sumRows`, `dayHeld`): when she changes plans, "Your day" shows the answers her plan before holds, with Change.
4. **On Today, one question at a time** (`dayQKey`, `dayQHtml`, `dayAnswer`), under her week where "Pain today?" sits. It shows on
   the first day a step uses the answer, in "Your day"'s own words, and one tap answers it:
   - her knees or back on a day with a routine (No, Knees, Back or Both, as My plan's settings ask it);
   - how she eats, then milk, on a day with a food step (her food habit, her calcium food or her iron food; saved to My food too);
   - her bedtime on the day her bedtime step joins (`bedDue`: day 4 on My PMOS plan), then her day;
   - how active she is, on a day with her move.
   Her steps follow at once (the routine's moves, the food, the bedtime step and its rings). Her answer is saved with her plan's
   answers and with `S.state.intake`, where her next plan reads them. A question she leaves stays as that one row on the days its step
   comes. Never in discreet mode or on a shared phone, where the defaults stay. A plan started before this version (no `dayAsk`) asks
   nothing.
5. **Her bedtime before day 4** (`laterStep`, `laterLine`): while it waits, the reveal's "What happens when" and My plan say "From day 4:
   a regular bedtime" (`plan_rv_bed0`), with no time; the Start card names only the rings she has. When she answers, the wind-down it
   brings is named in the Start card's words ("Reminders are on: your 11 pm wind-down. …").
6. **My PMOS plan's own page** (`renderStart`): no answer shown for what still waits; what it asks stops waiting, her bedtime and her
   day wait on.

**Strings.** One new UI line, `plan_rv_bed0` ("a regular bedtime", "सोने का एक तय समय", from `plan_pi_bed`). The questions are "Your
day"'s own (`plan_s_lim`, `plan_lim_*` with `plan_lim_both`, `plan_s_food`, `plan_in_milk`, `plan_in_bed`, `plan_in_work`,
`plan_s_level`), and the wind-down line is the Start card's (`plan_st_rem`, `plan_st_r_wind`).

**Tests.** `node test/onday.mjs` (28 checks):
- no "Your day" before Start, and the midlife plan's two safety questions;
- what waits at Start, with gentle moves, and My food not asked again;
- Today's one question by her steps, answered in one tap; knees, back or both;
- the bedtime question on day 4 and not before, its wind-down named, then her day;
- a default isn't an answer: a new plan, the summary and Change, My PMOS plan's page;
- nothing in discreet mode, on a shared phone, or for a plan from before;
- Hindi at 360 px.
The suites that walked through "Your day" (`companion`, `firstday`, `food`, `pictures`) now check what waits, and Today's question.
