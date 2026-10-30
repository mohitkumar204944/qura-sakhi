/* Sakhi's 8 plans as data (Version 39.4, the port R1: docs/plans-design-and-build-2026-10-24.md, sections 3.1 and 6.2;
   MODULE_API section 47). Pure data: no functions and no computed values, so test/progs.mjs can check it with a JSON round
   trip. Every word comes from the closed vocabulary that mods/plan.js implements; an unknown word fails progs.mjs.
   Text is '@key' only: a reviewed string the app already has (plan.js's, or another module's such as relief.js's), or '@tile'
   for the title of the tile its route opens. These are the v1 plans exactly as Version 39.3 runs them ('live': golden.mjs
   must replay byte for byte, and progs.mjs checks each against its baseline hash in progs/baseline.json). The order matters:
   the first plan whose `goals` match her stage and goal is hers.
   R2 (Version 39.5, still version 1): each plan has a hero and 4 tiles, 2 rest days a week she taps, the light plans' walks
   hold after a week with fewer than 3 days, and steps such as a checklist or a diary count from the tool itself.
   R3 (Version 39.6): a doctor path in every plan that needs one, from her answers ('start') or her own dates ('due'); and
   after 12 weeks "Keep it light": weekly look-backs to month 4, then monthly, closing at month 12 (keep). */
(window.SAKHI_PROGS = window.SAKHI_PROGS || []).push(
  {
    id: 'preg', ver: 1, status: 'live', tier: 'habit',
    title: [{ text: '@plan_pk_preg' }], discreetTitle: '@plan_h_d',
    goals: [{ stage: 'preg' }],
    life: { needs: 'pregnant', pause: ['loss'] },
    clock: 'pregWeek', length: { weeks: 0 },
    intake: { day: ['food', 'milk'] },
    slots: { max: 3 }, hero: 'timeline', rest: 2,
    tiles: [{ go: 'food', text: '@food_h', icon: 'ico:plate', hue: 'green' }, { go: 'preg-plan', text: '@preg_plan_h', icon: 'check', hue: 'orange', priv: true }, { go: 'preg-week', text: '@preg_t_week', icon: 'baby', hue: 'plum', priv: true }, { go: 'plan-progress', text: '@plan_tiles_prog', icon: 'chart', hue: 'sky' }],
    changelog: [{ ver: 1, r: 'R2', at: '2026-10-24', what: 'Version 39.5: a hero, 4 tiles and 2 rest days a week; the hold rule on light walks; steps that count from their tools' }, { ver: 1, r: 'R3', at: '2026-10-25', what: 'Version 39.6: a doctor path from her answers or her own dates in every plan that needs one; Keep it light to month 12' }, { ver: 1, r: 'R4', at: '2026-10-25', what: 'Version 39.9: the food step changes with her trimester (preg.food); the review\'s fix: each trimester opens with how much more to eat' }],
    steps: [
      { id: 'pdue', kind: 'adapter', use: 'preg.due', from: 'preg-plan', check: true },
      { goal: {
        nausea: [{ id: 'nausea', kind: 'tick', go: 'relief-nausea', title: '@relief_nausea_t', icon: 'leaf', hue: 'green', why: 'plan_fb_any', priv: true, from: 'relief:nausea' }],
        sleep: [{ id: 'rsleep', kind: 'tick', go: 'relief-sleep', title: '@relief_sleep_t', icon: 'moon', hue: 'purple', why: 'plan_fb_sleep', priv: true, from: 'relief:sleep' }],
        mood: [{ id: 'calm', kind: 'tick', go: 'relief-calm', title: '@relief_calm_t', icon: 'sparkle', hue: 'sky', why: 'plan_fb_calm', priv: true, from: 'relief:calm' }],
        iron: [{ id: 'iron', kind: 'adapter', use: 'journey.iron' }],
        '*': [{ id: 'food', kind: 'adapter', use: 'preg.food' }]
      } }
    ],
    list: [{ use: 'today' }],
    doctor: []
  },
  {
    id: 'preg', ver: 2, status: 'live', tier: 'habit',
    title: [{ text: '@plan_pk_preg' }], discreetTitle: '@plan_h_d',
    goals: [{ stage: 'preg' }],
    life: { needs: 'pregnant', pause: ['loss'] },
    clock: 'pregWeek', length: { weeks: 0 },
    intake: { screens: [{ id: 'psafe' }], day: ['food', 'milk'] },
    slots: { max: 4 }, hero: 'timeline', rest: 2,
    tiles: [{ go: 'food', text: '@food_h', icon: 'ico:plate', hue: 'green' }, { go: 'preg-plan', text: '@preg_plan_h', icon: 'check', hue: 'orange', priv: true }, { go: 'preg-week', text: '@preg_t_week', icon: 'baby', hue: 'plum', priv: true }, { go: 'plan-progress', text: '@plan_tiles_prog', icon: 'chart', hue: 'sky' }],
    changelog: [{ ver: 2, r: 'R1', at: '2026-10-29', what: 'Version 39.34: My pregnancy, safety first: the safety screen and its 3 tiers, a walk by her tier, the pelvic floor from week 13, her answers again at 14 and 28 weeks, and from 28 weeks the movements of her baby and sleeping on her side in the check-in' }, { ver: 2, r: 'R2', at: '2026-10-30', what: 'Version 39.47: her folic acid tablet from Getting ready carries on to 12 weeks, with its 9 pm reminder' }],
    steps: [
      { id: 'folic', kind: 'adapter', use: 'ttc.folic', if: ['folic'] },
      { id: 'pdue', kind: 'adapter', use: 'preg.due', from: 'preg-plan', check: true },
      { first: [
        { id: 'move', kind: 'minutes', use: 'walk', mins: 'light', cap: 30, grow: 'hold', why: 'plan_fb_move_g', if: ['pt:green', '!pnow'] },
        { id: 'move', kind: 'minutes', use: 'walk', mins: 10, sub: '@plan_walk_easy', why: 'plan_fb_move_g', if: ['pt:amber', '!pnow'] }
      ] },
      { goal: {
        nausea: [{ id: 'nausea', kind: 'tick', go: 'relief-nausea', title: '@relief_nausea_t', icon: 'leaf', hue: 'green', why: 'plan_fb_any', priv: true, from: 'relief:nausea' }],
        sleep: [{ id: 'rsleep', kind: 'tick', go: 'relief-sleep', title: '@relief_sleep_t', icon: 'moon', hue: 'purple', why: 'plan_fb_sleep', priv: true, from: 'relief:sleep' }],
        mood: [{ id: 'calm', kind: 'tick', go: 'relief-calm', title: '@relief_calm_t', icon: 'sparkle', hue: 'sky', why: 'plan_fb_calm', priv: true, from: 'relief:calm' }],
        iron: [{ id: 'iron', kind: 'adapter', use: 'journey.iron' }],
        '*': [{ id: 'food', kind: 'adapter', use: 'preg.food' }]
      } },
      { id: 'pf', kind: 'link', go: 'post-pelvic', title: '@plan_pf_t', icon: 'flower', hue: 'plum', why: 'plan_fb_pf', priv: true, from: 'post-pelvic', check: true, if: ['gw:13-', 'pday:4-', 'route'] }
    ],
    list: [{ use: 'today' }],
    doctor: []
  },
  {
    id: 'post', ver: 1, status: 'live', tier: 'habit',
    title: [{ text: '@plan_pk_post' }], discreetTitle: '@plan_h_d',
    goals: [{ stage: 'post' }],
    life: { needs: 'birth:365', pause: ['loss'] },
    clock: 'birthWeek', length: { weeks: 12 }, keep: { weekly: 17, until: 52 },
    intake: { day: ['food', 'milk', 'lim'], when: ['goal:weight'] },
    slots: { max: 3 }, hero: 'timeline', rest: 2,
    tiles: [{ go: 'food', text: '@food_h', icon: 'ico:plate', hue: 'green' }, { go: 'post-pelvic', text: '@post_t_pelvic', icon: 'flower', hue: 'plum', priv: true }, { go: 'post-checks', text: '@post_t_checks', icon: 'check', hue: 'rose', priv: true }, { go: 'plan-progress', text: '@plan_tiles_prog', icon: 'chart', hue: 'sky' }],
    changelog: [{ ver: 1, r: 'R2', at: '2026-10-24', what: 'Version 39.5: a hero, 4 tiles and 2 rest days a week; the hold rule on light walks; steps that count from their tools' }, { ver: 1, r: 'R3', at: '2026-10-25', what: 'Version 39.6: a doctor path from her answers or her own dates in every plan that needs one; Keep it light to month 12' }, { ver: 1, r: 'R4', at: '2026-10-25', what: 'Version 39.9: food while she breastfeeds, once a week (bfood); the review\'s fix: it comes before the pelvic step, and opens at its card' }],
    steps: [
      { id: 'rcheck', kind: 'adapter', use: 'post.rcheck', if: ['early', 'route:post-recovery'] },
      { goal: {
        recovery: [{ id: 'move', kind: 'minutes', use: 'walk', mins: 'post', grow: 'hold', why: 'plan_fb_move_g', if: ['!early'] }],
        feed: [{ id: 'feed', kind: 'tick', go: 'post-feed', title: '@tile', icon: 'drop', hue: 'rose', why: 'plan_fb_any', priv: true, if: ['route'] }],
        mood: [{ id: 'mood', kind: 'tick', go: 'relief-calm', title: '@relief_calm_t', icon: 'sparkle', hue: 'rose', why: 'plan_fb_calm', priv: true, if: ['route'], from: 'relief:calm' }],
        sleep: [{ id: 'sleep', kind: 'tick', go: 'relief-sleep', title: '@relief_sleep_t', icon: 'sparkle', hue: 'rose', why: 'plan_fb_sleep', priv: true, if: ['route'], from: 'relief:sleep' }],
        weight: [{ id: 'move', kind: 'minutes', use: 'walk', mins: 'post', grow: 'hold', why: 'plan_fb_move_g' }]
      } },
      { id: 'six', kind: 'link', go: 'post-checks', title: '@post_k_six', icon: 'check', hue: 'rose', why: 'plan_fb_recov', priv: true, if: ['birth:35-42', 'route'], once: true },
      { id: 'bfood', kind: 'tick', go: 'post-feed', at: 'bf-food', title: '@plan_a_bfood', icon: 'ico:plate', hue: 'green', why: 'plan_fb_any', priv: true, if: ['sit:breastfeeding', 'route'], when: 'days:2' },
      { id: 'pelvic', kind: 'tick', go: 'post-pelvic', title: '@tile', icon: 'flower', hue: 'plum', why: 'plan_fb_pelvic', priv: true, if: ['route'], from: 'post-pelvic' }
    ],
    list: [{ use: 'today' }],
    doctor: []
  },
  /* Version 39.46 (Mohit, 30 Oct: "yes start with the I had a baby plan", then "proceed building"; advice
     docs/after-birth-plan-advice-2026-10-30.md, mockup claude.ai/artifact/RLz4dU7pQ5A5iVTFCcnqPa). Days since the birth to the
     first birthday: rest and heal (0 to 13), settle (14 to 41), back to strong after her 6-week check (unlock), then strength
     after "Is my body ready?" (pready). Her recovery check is her evening form to day 41; her 6-week check, the unlock,
     contraception and the readiness tests come one at a time in Sakhi says (plan.js postCard). Version 1 runs on for the women on
     it, with an offer of this one. */
  {
    id: 'post', ver: 2, status: 'live', tier: 'habit',
    title: [{ text: '@plan_pk_post' }], discreetTitle: '@plan_h_d',
    goals: [{ stage: 'post' }],
    life: { needs: 'birth:365', pause: ['loss'] },
    clock: 'birthWeek', length: { weeks: 0 },
    moves: true,
    intake: { day: ['food', 'milk', 'lim'], when: ['goal:weight'] },
    slots: { max: 4 }, hero: 'timeline', rest: 2,
    tiles: [{ go: 'food', text: '@food_h', icon: 'ico:plate', hue: 'green' }, { go: 'post-pelvic', text: '@post_t_pelvic', icon: 'flower', hue: 'plum', priv: true }, { go: 'post-checks', text: '@post_t_checks', icon: 'check', hue: 'rose', priv: true }, { go: 'plan-progress', text: '@plan_tiles_prog', icon: 'chart', hue: 'sky' }],
    changelog: [{ ver: 2, r: 'R1', at: '2026-10-30', what: 'Version 39.46: to the first birthday; the recovery check as her evening form to day 41; the squeezes by her days; a walk from day 14; back to strong after her 6-week check; strength after Is my body ready?; nothing about the baby after My baby has died' }, { ver: 2, r: 'R2', at: '2026-10-30', what: 'Version 39.47: the gentle walk of the first 2 weeks opens no page (its Why? opened the recovery check)' }],
    steps: [
      { id: 'rcheck', kind: 'adapter', use: 'post.rcheck', if: ['early', 'route:post-recovery'] },
      { id: 'pelvic', kind: 'adapter', use: 'post.pf', if: ['route:post-pelvic'] },
      { goal: {
        recovery: [{ id: 'pwalk', kind: 'tick', go: 'plan', title: '@plan_a_pwalk', icon: 'ico:move', hue: 'purple', why: 'plan_fb_move_g', if: ['birth:0-13'] }],
        weight: [{ id: 'pwalk', kind: 'tick', go: 'plan', title: '@plan_a_pwalk', icon: 'ico:move', hue: 'purple', why: 'plan_fb_move_g', if: ['birth:0-13'] }],
        feed: [{ id: 'feed', kind: 'tick', go: 'post-feed', title: '@tile', icon: 'drop', hue: 'rose', why: 'plan_fb_any', priv: true, if: ['route', '!died'] }],
        mood: [{ id: 'mood', kind: 'tick', go: 'relief-calm', title: '@relief_calm_t', icon: 'sparkle', hue: 'rose', why: 'plan_fb_calm', priv: true, if: ['route'], from: 'relief:calm' }],
        sleep: [{ id: 'sleep', kind: 'tick', go: 'relief-sleep', title: '@relief_sleep_t', icon: 'sparkle', hue: 'rose', why: 'plan_fb_sleep', priv: true, if: ['route'], from: 'relief:sleep' }]
      } },
      { id: 'move', kind: 'minutes', use: 'walk', mins: 'post', grow: 'hold', why: 'plan_fb_move_g', if: ['birth:14-', '!unlock'], when: 'days:1,3,5' },
      { id: 'move', kind: 'minutes', use: 'walk', mins: 'post', grow: 'hold', cap: 30, why: 'plan_fb_move_g', if: ['unlock'] },
      { id: 'gentle', kind: 'routine', go: 'plan-r-gentle', title: '@plan_r_gentle', icon: 'ico:move', hue: 'green', why: 'plan_fb_move_g', if: ['unlock', '!pready'], when: 'days:2,5' },
      { id: 'str', kind: 'routine', go: 'plan-r-strength', title: '@plan_r_strength', icon: 'ico:move', hue: 'gold', why: 'plan_fb_move_g', if: ['pready'], when: 'days:2,5' },
      { id: 'bfood', kind: 'tick', go: 'post-feed', at: 'bf-food', title: '@plan_a_bfood', icon: 'ico:plate', hue: 'green', why: 'plan_fb_any', priv: true, if: ['sit:breastfeeding', 'route', '!died'], when: 'days:2' }
    ],
    list: [{ use: 'today' }],
    doctor: []
  },
  {
    id: 'ttc', ver: 1, status: 'live', tier: 'habit',
    title: [{ text: '@plan_pk_ttc' }], discreetTitle: '@plan_h_d',
    goals: [{ stage: 'ttc', goal: 'ready' }],
    life: { ends: 'pregnant', pause: ['preg', 'post', 'loss'] },
    clock: 'weeks', length: { weeks: 12 }, keep: { weekly: 17, until: 52 },
    moves: true,
    intake: { day: ['act', 'food', 'milk', 'lim', 'bed', 'work'], when: true },
    slots: { max: 3 }, hero: 'week', rest: 2,
    tiles: [{ go: 'food', text: '@food_h', icon: 'ico:plate', hue: 'green' }, { go: 'plan-moves', text: '@plan_tiles_moves', icon: 'ico:move', hue: 'purple' }, { go: 'ttc-prep', text: '@ttc_prep', icon: 'check', hue: 'green', priv: true }, { go: 'plan-progress', text: '@plan_tiles_prog', icon: 'chart', hue: 'sky' }],
    changelog: [{ ver: 1, r: 'R2', at: '2026-10-24', what: 'Version 39.5: a hero, 4 tiles and 2 rest days a week; the hold rule on light walks; steps that count from their tools' }, { ver: 1, r: 'R3', at: '2026-10-25', what: 'Version 39.6: a doctor path from her answers or her own dates in every plan that needs one; Keep it light to month 12' }, { ver: 1, r: 'R4', at: '2026-10-25', what: 'Version 39.9: once a week an earlier habit comes back; the review\'s fix: each one in turn' }],
    steps: [
      { id: 'move', kind: 'minutes', use: 'walk', mins: 'ladder', cap: 30, grow: 'hold', why: 'plan_fb_move_g' },
      { id: 'food', kind: 'adapter', use: 'plate', why: 'plan_fb_food_t' },
      { first: [
        { id: 'prep', kind: 'link', go: 'ttc-prep', title: '@plan_a_prep', icon: 'check', hue: 'green', why: 'plan_fb_prep', priv: true, when: 'days:0', if: ['route'], from: 'ttc-prep', check: true },
        { id: 'sleep', kind: 'adapter', use: 'bed' }
      ] }
    ],
    list: [
      { use: 'walk', mins: 'suggest', cap: 30, why: 'plan_fb_move_g' },
      { use: 'plate', why: 'plan_fb_food_t' },
      { use: 'item', icon: 'check', hue: 'green', text: '@plan_pi_prep', why: 'plan_fb_prep', priv: true },
      { use: 'bed' }
    ],
    doctor: [{ id: 'due', due: 'ttc-trying', text: '@plan_doc_ttc', go: 'ttc' }]
  },
  /* Version 39.32 (Mohit, 28 Oct: "Build this plan personalised to users who are planning for a baby"): Getting ready, version
     2, the full programme (docs/baby-plan-review-packet-2026-10-28.md; MODULE_API section 75). Every goal of the trying stage
     opens it. A few things first (the baby screen) choose her version: her doctor card (bdoc), and her food and moves (bset:
     mix for PMOS or a healthier weight; a BMI under 18.5 eats more, plan.js). Every day her tablet, her move and one food habit;
     a 4th step when it is due. Version 1 runs on for the women who started it. */
  {
    id: 'ttc', ver: 2, status: 'live', tier: 'habit',
    title: [{ text: '@plan_pk_ttc' }], discreetTitle: '@plan_h_d',
    goals: [{ stage: 'ttc' }],
    life: { ends: 'pregnant', pause: ['preg', 'post', 'loss'] },
    clock: 'weeks', length: { weeks: 12 }, keep: { weekly: 17, until: 52 },
    moves: true,
    intake: { screens: [{ id: 'baby' }], day: ['act', 'food', 'milk', 'lim'], when: true },
    slots: { max: 4 }, hero: 'week', rest: 2,
    tiles: [{ go: 'food', text: '@food_h', icon: 'ico:plate', hue: 'green' }, { go: 'plan-moves', text: '@plan_tiles_moves', icon: 'ico:move', hue: 'purple' }, { go: 'ttc-prep', text: '@ttc_prep', icon: 'check', hue: 'green', priv: true }, { go: 'plan-progress', text: '@plan_tiles_prog', icon: 'chart', hue: 'sky' }],
    changelog: [{ ver: 2, r: 'R1', at: '2026-10-28', what: 'Version 39.32: the full Getting ready programme: start questions and versions, her folic acid tablet, food by her situation, gentler yoga before her period, strength from week 7, a lesson a week, the ready check, her doctor card' }],
    steps: [
      { id: 'folic', kind: 'adapter', use: 'ttc.folic' },
      { first: [
        { id: 'yoga', kind: 'adapter', use: 'yoga.cycle', if: ['ans:bset=mix'] },
        { id: 'move', kind: 'minutes', use: 'walk', mins: 'ladder', cap: 30, grow: 'hold', why: 'plan_fb_move_g' }
      ] },
      { id: 'food', kind: 'adapter', use: 'plate', why: 'plan_fb_food_t' },
      { first: [
        { id: 'ready', kind: 'adapter', use: 'ttc.ready' },
        { id: 'str', kind: 'routine', go: 'plan-r-strength', title: '@plan_r_strength', icon: 'ico:move', hue: 'gold', why: 'plan_fb_str', when: 'days:1,4', if: ['week:7-', '!birth:0-182', '!ans:bset=mix'] },
        { id: 'str', kind: 'routine', go: 'plan-r-gentle', title: '@plan_r_gentle', icon: 'ico:yoga', hue: 'green', why: 'plan_fb_move_g', when: 'days:1,4', if: ['week:7-', 'birth:0-182', '!ans:bset=mix'] },
        { id: 'calm', kind: 'adapter', use: 'ttc.calm' },
        { id: 'hb', kind: 'adapter', use: 'ttc.hb' },
        { id: 'prep', kind: 'link', go: 'ttc-prep', title: '@plan_a_prep', icon: 'check', hue: 'green', why: 'plan_fb_prep', priv: true, when: 'days:3', if: ['route', 'pday:2-'], from: 'ttc-prep', check: true },
        { id: 'his', kind: 'adapter', use: 'ttc.his' }
      ] }
    ],
    list: [{ use: 'today' }],
    doctor: [{ id: 'start', any: ['ans:bdoc=std', 'ans:bdoc=gyn', 'ans:bdoc=meds', 'ans:bdoc=both'], text: '@plan_bdoc' }, { id: 'due', due: 'ttc-trying', text: '@plan_doc_ttc', go: 'ttc' }]
  },
  {
    id: 'heavy', ver: 1, status: 'live', tier: 'habit',
    title: [{ text: '@plan_pk_heavy' }], discreetTitle: '@plan_h_d',
    goals: [{ stage: 'meno', goal: 'heavy' }, { goal: 'heavy' }],
    life: { pause: ['preg', 'post', 'loss'] },
    clock: 'weeks', length: { weeks: 12 }, keep: { weekly: 17, until: 52 },
    moves: true,
    intake: { screens: [{ id: 'heavy' }], day: ['food', 'milk', 'lim'], when: true },
    slots: { max: 3 }, hero: 'week', rest: 2,
    tiles: [{ go: 'food', text: '@food_h', icon: 'ico:plate', hue: 'green' }, { go: 'plan-moves', text: '@plan_tiles_moves', icon: 'ico:move', hue: 'purple' }, { go: 'iron', text: '@iron_h', icon: 'drop', hue: 'rose', priv: true }, { go: 'plan-progress', text: '@plan_tiles_prog', icon: 'chart', hue: 'sky' }],
    changelog: [{ ver: 1, r: 'R2', at: '2026-10-24', what: 'Version 39.5: a hero, 4 tiles and 2 rest days a week; the hold rule on light walks; steps that count from their tools' }, { ver: 1, r: 'R3', at: '2026-10-25', what: 'Version 39.6: a doctor path from her answers or her own dates in every plan that needs one; Keep it light to month 12' }, { ver: 1, r: 'R4', at: '2026-10-25', what: 'Version 39.9: after the 21 days, one iron food a day from her own foods, changing over 7 days' }],
    steps: [
      { id: 'iron', kind: 'adapter', use: 'journey.iron' },
      { id: 'move', kind: 'minutes', use: 'walk', mins: 'light', grow: 'hold', why: 'plan_fb_move_g' }
    ],
    list: [
      { use: 'item', icon: 'drop', hue: 'rose', text: '@plan_pi_iron', why: 'plan_fb_iron', priv: true },
      { use: 'walk', mins: 'light', why: 'plan_fb_move_g' }
    ],
    doctor: [{ id: 'start', any: ['ans:pads=p12', 'ans:clots=y', 'sit:stopped'], text: '@plan_rv_doc_heavy' }, { id: 'start', any: ['ans:tired=y'], text: '@plan_rv_doc_hb', go: 'cond-anaemia' }]
  },
  {
    id: 'meno', ver: 1, status: 'live', tier: 'habit',
    title: [{ text: '@plan_pk_meno' }], discreetTitle: '@plan_h_d',
    goals: [{ stage: 'meno' }],
    life: { pause: ['preg', 'post', 'loss'] },
    clock: 'weeks', length: { weeks: 12 }, keep: { weekly: 17, until: 52 },
    moves: true,
    intake: { day: ['act', 'food', 'milk', 'lim'], when: true },
    slots: { max: 3 }, hero: 'week', rest: 2,
    tiles: [{ go: 'food', text: '@food_h', icon: 'ico:plate', hue: 'green' }, { go: 'plan-moves', text: '@plan_tiles_moves', icon: 'ico:move', hue: 'purple' }, { go: 'meno-diary', text: '@meno_diary', icon: 'diary', hue: 'orange', priv: true }, { go: 'plan-progress', text: '@plan_tiles_prog', icon: 'chart', hue: 'sky' }],
    changelog: [{ ver: 1, r: 'R2', at: '2026-10-24', what: 'Version 39.5: a hero, 4 tiles and 2 rest days a week; the hold rule on light walks; steps that count from their tools' }, { ver: 1, r: 'R3', at: '2026-10-25', what: 'Version 39.6: a doctor path from her answers or her own dates in every plan that needs one; Keep it light to month 12' }, { ver: 1, r: 'R4', at: '2026-10-25', what: 'Version 39.9: a calcium food on 3 days a week for 40+ bones (food.calcium); the review\'s fix: no repeat inside a week' }, { ver: 1, r: 'R5', at: '2026-10-28', what: 'Version 39.27 (minimalism audit R05): the hot-flush goal counts days with hot flushes from her quick chip; the weekly diary step is for her other goals (its tile stays for more detail)' }],
    steps: [
      { goal: {
        hot: [{ id: 'hot', kind: 'tick', go: 'relief-hot', title: '@relief_hot_t', icon: 'leaf', hue: 'orange', why: 'plan_fb_hot', priv: true, from: 'relief:hot' }],
        sleep: [{ id: 'rsleep', kind: 'tick', go: 'relief-sleep', title: '@relief_sleep_t', icon: 'moon', hue: 'purple', why: 'plan_fb_sleep', priv: true, from: 'relief:sleep' }],
        mood: [{ id: 'calm', kind: 'tick', go: 'relief-calm', title: '@relief_calm_t', icon: 'sparkle', hue: 'sky', why: 'plan_fb_calm', priv: true, from: 'relief:calm' }]
      } },
      { first: [
        { id: 'move', kind: 'routine', go: 'plan-r-strength', title: '@plan_r_strength', icon: 'ico:move', hue: 'gold', why: 'plan_fb_bones', if: ['goal:bones'], when: 'days:1,4' },
        { id: 'move', kind: 'minutes', use: 'walk', mins: 'ladder', cap: 30, grow: 'hold', why: 'plan_fb_move_g' }
      ] },
      { goal: { weight: [{ id: 'food', kind: 'adapter', use: 'plate', why: 'plan_fb_food' }], bones: [{ id: 'ca', kind: 'adapter', use: 'food.calcium', when: 'days:0,2,5' }] } },
      { id: 'diary', kind: 'tick', go: 'meno-diary', title: '@tile', icon: 'diary', hue: 'orange', why: 'plan_fb_any', priv: true, when: 'days:6', if: ['route', '!goal:hot'], from: 'meno-diary', check: true }
    ],
    list: [{ use: 'today' }],
    doctor: []
  },
  {
    id: 'meno', ver: 2, status: 'live', tier: 'habit',
    title: [{ text: '@plan_pk_meno' }], discreetTitle: '@plan_h_d',
    goals: [{ stage: 'meno' }],
    life: { pause: ['preg', 'post', 'loss'] },
    clock: 'weeks', length: { weeks: 12 }, keep: { weekly: 17, until: 52 },
    moves: true,
    intake: { day: ['act', 'food', 'milk', 'lim', 'mbone', 'mheart'], when: true },
    slots: { max: 4 }, hero: 'week', rest: 2,
    tiles: [{ go: 'food', text: '@food_h', icon: 'ico:plate', hue: 'green' }, { go: 'plan-moves', text: '@plan_tiles_moves', icon: 'ico:move', hue: 'purple' }, { go: 'meno-diary', text: '@meno_diary', icon: 'diary', hue: 'orange', priv: true }, { go: 'plan-progress', text: '@plan_tiles_prog', icon: 'chart', hue: 'sky' }],
    changelog: [{ ver: 2, r: 'R1', at: '2026-10-30', what: 'Version 39.51: Cool, calm and strong: three 4-week parts in the order her goal needs (a short CBT course for hot flushes or for worry, one sleep rule a week, strength and balance), a chapter a week, her weekly 0 to 10, the bones and heart questions, one card at a time (before 45, week 4, week 12), then a Learn article a month to month 12' }],
    steps: [
      { id: 'skill', kind: 'adapter', use: 'meno.skill' },
      { first: [
        { id: 'move', kind: 'minutes', use: 'walk', mins: 'light', grow: 'hold', why: 'plan_fb_move_g', if: ['ans:mheart=y'] },
        { id: 'move', kind: 'minutes', use: 'walk', mins: 'ladder', cap: 30, grow: 'hold', why: 'plan_fb_move_g' }
      ] },
      { goal: { weight: [{ id: 'food', kind: 'adapter', use: 'plate', why: 'plan_fb_food' }] } },
      { id: 'ca', kind: 'adapter', use: 'food.calcium', when: 'days:0,2,5', if: ['!goal:weight'] },
      { first: [
        { id: 'str', kind: 'routine', go: 'plan-r-gentle', title: '@plan_r_gentle', icon: 'ico:move', hue: 'green', why: 'plan_fb_any', when: 'days:1,4', if: ['ans:mheart=y'] },
        { id: 'str', kind: 'routine', go: 'plan-r-strength', title: '@plan_r_strength', icon: 'ico:move', hue: 'gold', why: 'plan_fb_bones', when: 'days:1,4' }
      ] }
    ],
    list: [{ use: 'today' }],
    doctor: []
  },
  {
    id: 'pain', ver: 1, status: 'live', tier: 'habit',
    title: [{ text: '@plan_pk_pain' }], discreetTitle: '@plan_h_d',
    goals: [{ goal: 'pain' }],
    life: { pause: ['preg', 'post', 'loss'] },
    clock: 'weeks', length: { weeks: 12 }, keep: { weekly: 17, until: 52 },
    moves: true,
    intake: { screens: [{ id: 'pain' }], day: ['act', 'food', 'milk', 'lim', 'bed', 'work'], when: true },
    slots: { max: 3 }, hero: 'week', rest: 2,
    tiles: [{ go: 'food', text: '@food_h', icon: 'ico:plate', hue: 'green' }, { go: 'plan-moves', text: '@plan_tiles_moves', icon: 'ico:move', hue: 'purple' }, { go: 'relief-cramps', text: '@relief_cramps_t', icon: 'leaf', hue: 'rose', priv: true }, { go: 'plan-progress', text: '@plan_tiles_prog', icon: 'chart', hue: 'sky' }],
    changelog: [{ ver: 1, r: 'R2', at: '2026-10-24', what: 'Version 39.5: a hero, 4 tiles and 2 rest days a week; the hold rule on light walks; steps that count from their tools' }, { ver: 1, r: 'R3', at: '2026-10-25', what: 'Version 39.6: a doctor path from her answers or her own dates in every plan that needs one; Keep it light to month 12' }],
    steps: [
      { id: 'cramps', kind: 'tick', go: 'relief-cramps', title: '@relief_cramps_t', icon: 'leaf', hue: 'rose', why: 'plan_fb_cramps', priv: true, when: 'periodDays', from: 'relief:cramps' },
      { id: 'move', kind: 'minutes', use: 'walk', mins: 'ladder', cap: 30, grow: 'hold', why: 'plan_fb_movep' },
      { id: 'sleep', kind: 'adapter', use: 'bed' }
    ],
    list: [
      { use: 'item', icon: 'leaf', hue: 'rose', text: '@plan_pi_cramps', why: 'plan_fb_cramps', priv: true },
      { use: 'walk', mins: 'suggest', cap: 30, why: 'plan_fb_movep' },
      { use: 'bed' }
    ],
    doctor: [{ id: 'start', any: ['ans:pain=stop'], text: '@plan_rv_doc_pain', check: 'selfcheck-endo' }, { id: 'start', any: ['ans:painDays=4'], text: '@plan_rv_doc_pdays', check: 'selfcheck-endo' }]
  },
  {
    id: 'pms', ver: 1, status: 'live', tier: 'habit',
    title: [{ text: '@plan_pk_pms' }], discreetTitle: '@plan_h_d',
    goals: [{ goal: 'pms' }],
    life: { pause: ['preg', 'post', 'loss'] },
    clock: 'weeks', length: { weeks: 12 }, keep: { weekly: 17, until: 52 },
    moves: true,
    intake: { screens: [{ id: 'pms' }], day: ['act', 'food', 'milk', 'lim', 'bed', 'work'], when: true },
    slots: { max: 3 }, hero: 'week', rest: 2,
    tiles: [{ go: 'food', text: '@food_h', icon: 'ico:plate', hue: 'green' }, { go: 'plan-moves', text: '@plan_tiles_moves', icon: 'ico:move', hue: 'purple' }, { go: 'plan-r-calm', text: '@plan_r_calm', icon: 'sparkle', hue: 'sky' }, { go: 'plan-progress', text: '@plan_tiles_prog', icon: 'chart', hue: 'sky' }],
    changelog: [{ ver: 1, r: 'R2', at: '2026-10-24', what: 'Version 39.5: a hero, 4 tiles and 2 rest days a week; the hold rule on light walks; steps that count from their tools' }, { ver: 1, r: 'R3', at: '2026-10-25', what: 'Version 39.6: a doctor path from her answers or her own dates in every plan that needs one; Keep it light to month 12' }],
    steps: [
      { id: 'calm', kind: 'routine', go: 'plan-r-calm', title: '@plan_r_calm', icon: 'sparkle', hue: 'sky', why: 'plan_fb_calm' },
      { id: 'move', kind: 'minutes', use: 'walk', mins: 'ladder', cap: 30, grow: 'hold', why: 'plan_fb_move_g' },
      { id: 'sleep', kind: 'adapter', use: 'bed' }
    ],
    list: [
      { use: 'item', icon: 'sparkle', hue: 'sky', text: '@plan_pi_calm', why: 'plan_fb_calm' },
      { use: 'walk', mins: 'suggest', cap: 30, why: 'plan_fb_move_g' },
      { use: 'bed' }
    ],
    doctor: [{ id: 'start', any: ['ans:pmsLevel=lot'], text: '@plan_rv_doc_pms', go: 'periods-pms' }]
  },
  {
    id: 'cycle', ver: 1, status: 'live', tier: 'habit',
    title: [{ if: ['sit:pcos'], text: '@plan_h' }, { if: ['goal:pmos'], text: '@plan_h' }, { if: ['goal:weight'], text: '@plan_pk_weight' }, { if: ['goal:ready'], text: '@plan_pk_ready' }, { text: '@plan_pk_cycle' }],
    discreetTitle: '@plan_h_d',
    goals: [{}],
    life: { pause: ['preg', 'post', 'loss'] },
    clock: 'weeks', length: { weeks: 12 }, keep: { weekly: 17, until: 52 },
    moves: true,
    intake: { screens: [{ id: 'cyc', if: ['!goal:weight'] }], day: ['act', 'food', 'milk', 'lim', 'bed', 'work'], when: true },
    slots: { max: 4 }, hero: 'ring', rest: 2,
    tiles: [{ go: 'plan-plate', text: '@plan_tiles_plate', icon: 'ico:plate', hue: 'green' }, { go: 'plan-moves', text: '@plan_tiles_moves', icon: 'ico:move', hue: 'purple' }, { go: 'plan-body', text: '@plan_tiles_body', icon: 'ico:body', hue: 'gold' }, { go: 'plan-progress', text: '@plan_tiles_prog', icon: 'chart', hue: 'sky' }],
    changelog: [{ ver: 1, r: 'R2', at: '2026-10-24', what: 'Version 39.5: a hero, 4 tiles and 2 rest days a week; the hold rule on light walks; steps that count from their tools' }, { ver: 1, r: 'R3', at: '2026-10-25', what: 'Version 39.6: a doctor path from her answers or her own dates in every plan that needs one; Keep it light to month 12' }, { ver: 1, r: 'R4', at: '2026-10-25', what: 'Version 39.9: once a week an earlier habit comes back; the review\'s fix: each one in turn' }, { ver: 1, r: 'R5', at: '2026-10-26', what: 'Version 39.13: yoga and the walk as two steps (yoga.cycle, walk.cycle), 4 steps a day' }],
    steps: [
      { id: 'yoga', kind: 'adapter', use: 'yoga.cycle' },
      { id: 'move', kind: 'adapter', use: 'walk.cycle' },
      { id: 'food', kind: 'adapter', use: 'plate', why: 'plan_fb_food' },
      { id: 'sleep', kind: 'adapter', use: 'bed', if: ['pday:4-'] }   /* Version 39.43: 3 steps on day 1 (the minimalist baseline); her bedtime from day 4 */
    ],
    list: [
      { use: 'item', icon: 'ico:yoga', hue: 'plum', text: '@plan_pi_yoga', why: 'plan_fb_move_g' },
      { use: 'walk', mins: 'suggest', why: 'plan_fb_move' },
      { use: 'plate', why: 'plan_fb_food' },
      { use: 'bed' }
    ],
    doctor: [{ id: 'start', any: ['ans:skips=y', 'ans:gap=g60', 'ans:gap=gt60', 'ans:gap=vary'], text: '@plan_rv_doc_cyc' }]
  }
);
