# Me page: UX audit, 22 Oct 2026

Version 25 (APK 0.24-demo). Rendered in Chromium at Android phone sizes, with a stand-in for the Android bridge so the
phone-only rows show. The test woman is signed in, on periods, with PMOS ticked; English and Hindi. Mohit asked: "audit UX of
me page and advise on scope of optimization and improvement".

**Built on 22 Oct (a–j, "do quick wins and restructure together"):** version 26 in `web/MODULE_API.md` section 26, tested by
`web/test/me.mjs`. Me is now about 1.2 screens. Still open: the Grievance Officer's details, the larger items (k, l), and
doctor review if any health wording changes later.

## Verdict

Everything on Me works and can be reached. But the page has grown into a 5.7-screen scroll of 12 sections and 66 controls,
in no particular order:

- The controls a woman on a shared phone needs most (app lock, plain words, hiding the app) sit two screens down.
- The top shows her health conditions in plain words, even in discreet mode.

It needs restructuring more than polishing. A short main page of about 1.5 screens, with sub-pages, fixes most of what
follows.

## What was measured

Android, 390 px wide, signed in.

| | |
|---|---|
| Height | 4,790 px = 5.7 screens (Hindi 5.6, 360 px phone 5.9, web without the Android rows 5.3) |
| Sections / controls / switches | 12 / 66 / 17 |
| Screens down to each thing | account 0.2 · language 1.8 · plain words 2.0 · app lock 2.3 · reminders 2.6 · report for doctor 2.9 · backup 3.0 · Delete everything 3.2 · theme 3.4 · tours 3.7–5.1 · privacy notice 5.5 |
| Fine | No sideways scroll. Text contrast passes in light and dark. Every switch's whole row is tappable (the 24 px checkbox sits in a full-width row). No page errors. |

Order on the page today:

1. Me
2. Your Sakhi account
3. My situation (9 checkboxes)
4. My garden, followed by the doctor-view preview and Language and read-aloud
5. Discretion
6. Reminders on this phone
7. Consent and my data, ending with Show my data and Delete everything
8. Appearance
9. Sakhi's look
10. How to use Sakhi (full tour, 5 screen tours, 7 feature tours, 2 switches)
11. Prototype
12. Privacy notice and grievance placeholder

## Findings, most important first

### 1. Health conditions in plain words on a shared phone

"My situation" opens the page. It shows Pregnant, Breastfeeding, Diagnosed PMOS (PCOS) ✓, My periods have stopped and
Planning a baby. Discreet mode changes none of it: the app calls itself "My notes" and the Diary tab "Notes", yet Me still
says "periods" and shows the ticked condition. Anyone who opens Me on a shared phone sees them.

### 2. Privacy controls are buried

Discreet mode, Shared-phone mode, App lock and Hide the app name and icon sit two screens down. Their heading is the formal
"Discretion"; the tour for the same section is called "Privacy on a shared phone".

### 3. Rows under the wrong heading

Modules add rows to Me without a heading of their own. "See what a doctor sees when you share" and "Language and read-aloud"
therefore appear under "My garden".

### 4. The stage is set in two places, and contradictions are possible

Five of the nine situation checkboxes are really her stage: Pregnant, Breastfeeding, My periods have stopped, Periods changing
after 40 and Planning a baby. "Change stage" on Home sets the same thing.

- The checkboxes allow contradictions (Pregnant and Planning a baby together).
- Ticking "Pregnant" opens a sheet instead of ticking the box.

### 5. How to use Sakhi takes 1.6 screens

It has 15 tour rows and 2 switches, and the same list is also on the Help tab.

### 6. Prototype leftovers in front of testers

- The "Prototype" section.
- The "Needs approval" tag on the doctor-view row.
- The notice line "The live app will name every processor…".
- "Grievance Officer: [NAME, ADDRESS]". This one has to be filled in before real users: Indian rules expect a named grievance
  contact.

### 7. The data section is unclear

- "Share with my Qura doctor" shows "—" with a "Give" button: a dash for off, and a button where every other setting has a
  switch.
- "Show my data" dumps raw JSON into a box.
- "Delete everything" is an equal-size button next to "Show my data". Its note reads "Immediate, no undo window, so no one can
  find it later."

### 8. Settings look like a form

Every setting is a square checkbox rather than an on/off switch. Screen readers get no switch role.

### 9. Small, dense text

Descriptions are 14 px and run 2–3 lines each. In Hindi they mix in English medical words: endometriosis, fibroids, HRT,
steroids. Changing that wording needs the doctor's review.

### 10. Large text on the phone probably does nothing

All 138 font sizes in app.css are in px, and the Android app doesn't pass the phone's font size to the WebView (no
`setTextZoom`). A woman who uses large text on her phone likely gets normal-size Sakhi. This needs checking on a real phone,
and the fix is app-wide.

### 11. Missing

- App version.
- Send feedback / talk to us.
- Share Sakhi with a friend.
- What's new.

The last two support "keep improving so women use it regularly".

## Scope

### Quick wins (small: a few hours each, about a day together)

- **a.** Rename "Discretion" to "Privacy on a shared phone" and move it to just below the account row.
- **b.** Give module rows proper homes: language near the top, the doctor view with the data rows.
- **c.** Collapse How to use Sakhi into one row that opens a tours page.
- **d.** Hide the Prototype section and approval tags unless prototype labels are on. Move the notice and grievance contact
  into an "About and privacy" row.
- **e.** Move Delete everything to the bottom, in its own danger area, with plainer words.
- **f.** On/off switches instead of checkboxes, with `role="switch"`.

### Medium (1–2 days)

- **g.** Restructure into a short page of rows that open sub-pages, each row with a status summary such as "Lock on · Plain
  words off". This takes Me from 5.7 screens to about 1.5. The rows: Account · Privacy · My health details · Reminders ·
  Language and voice · My data · Look · Help · About.
- **h.** Keep health details private on a shared phone. They go behind the "My health details" row: in discreet mode Me shows
  no condition names, and with app lock on, the row asks for the PIN.
- **i.** One "Stage" row (opens the existing stage sheet) instead of five stage checkboxes. Only true conditions stay as
  switches: hormone medicine, PMOS, thyroid / endometriosis / fibroids, hysterectomy. Any changed health wording needs the
  doctor's review.
- **j.** "Show my data" becomes a readable summary: what is kept, how many entries, the last backup.

### Larger (3–5 days)

- **k.** Real large-text support: rem units and WebView text zoom, across the whole app.
- **l.** Feedback, Share Sakhi, What's new and the version. Feedback needs an endpoint or a WhatsApp link; sharing needs a
  link to send, and distribution is still undecided.

### Needs Mohit

- The Grievance Officer's name and contact.
- Where feedback should go.
- Doctor review of any changed health wording.

## Recommendation

Do the quick wins and the restructure (a–j) together as one version, about 2–3 days with tests; most quick wins fall out of
the restructure anyway. If only part is done first, do 1 and 2: health details private and privacy controls first. They are
the ones that matter on a shared phone.

## Proposed main page

1. Header: Sakhi's look + her name + masked number → Account
2. Privacy on a shared phone → (lock, plain words, shared-phone mode, hide the app) · summary "Lock on · Plain words off"
3. My health details → (stage, conditions) · summary hidden in discreet mode
4. Reminders → (notifications, test, exact alarms) · Android only
5. Language and voice → (existing language page)
6. My data → (report for my doctor, share with my Qura doctor + what a doctor sees, move to a new phone, show my data)
7. Look → (theme, Sakhi's look, my garden)
8. Help → (the full tour, all tours, show tours on new screens, read tours aloud)
9. About and privacy → (notice, grievance contact, version, feedback)
10. Danger area: Delete everything on this phone
