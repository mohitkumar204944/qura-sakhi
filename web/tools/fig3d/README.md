# The 3D figure

The woman who shows Sakhi's moves in 3D, made with free tools (Mohit, 29 Oct 2026: "B. 3D made here, free"). Every
position comes from the app's drawings (`mods/plan.js`: `P`, `ANIM` and the sun salutation), so the choreography is the
same one the drawings show.

## What it needs (not in git)

- Blender 4.5 LTS in `~/Applications/Blender.app`.
- MPFB 2.0.18, the MakeHuman add-on, installed from extensions.blender.org: `Blender --command extension install-file -r user_default -e add-on-mpfb-v2.0.18.zip`.
- MakeHuman's CC0 asset packs, unzipped into MPFB's user data folder
  (`~/Library/Application Support/Blender/4.5/extensions/.user/user_default/mpfb/data`):
  - makehuman_system_assets, hair01, shirts01, pants01 and poses02, from static.makehumancommunity.org;
  - faceunits01, for the expressions.
- ffmpeg, and Python 3 with Pillow.

The downloads are kept in `~/Desktop/QuraSakhi/3d-tools/`. Everything used is CC0, or GPL for the tools, so nothing needs a
credit line in the app.

## The files

- `char.py` builds her and saves `sakhi.blend`:
  - a mid-twenties woman of average build with medium-brown skin, dark-brown eyes, fuller brows, near-black hair in a bun
    and a gentle smile;
  - a rose t-shirt over leggings.
- `kit.py` is the posing kit:
  - her body is placed and turned at the pelvis, and the spine and neck bend bone by bone;
  - wrists and ankles go to IK targets, and knees and elbows only bend the way joints do (they straighten to 4 degrees short
    of straight, counted from her rest pose's bent elbow);
  - `point` gives a long arm in a direction, her shoulder lifting once the arm is above shoulder height; `relax` lets the
    hand carry on from the forearm;
  - palms and soles face where a pose says, and `shape` picks the fingers' shape (relaxed, flat, on the floor, holding,
    cupped over her toes, a mudra);
  - `finish` (run after every pose) shapes the fingers and keeps each arm as joint turns, with the forearm, not the wrist,
    turning the palm.
- `moves.py` holds the 43 positions, three the app has no drawing for (sitting on the chair, its forward bend, and Anulom
  vilom's hand at her nose), the in-between ones (Palm tree's open arms and toes, Loosen up's head turns, shoulder roll
  and arm circles, the step-ups' steps), the 17 loops and the sun salutation. The loops follow the moves' words: Palm tree
  opens the arms wide, meets them overhead and rises on the toes; Loosen up turns her head side to side, rolls her
  shoulders and swings her arms in big circles; in the butterfly only her knees lift and drop, while her seat, her feet
  (soles together) and her hands over her toes stay still; step-ups step up with one foot, then the other, and step down,
  each foot lifting clear of the step's edge, her left hand on the railing. The sun salutation stands where her hands come
  down, flows through a middle (a swan dive, a plank line, or half way with a stepping or turning foot lifted) and has a
  camera for her standing positions and another for those on the mat.
- `stage.py` sets up the backdrop, lights, props (chair, wall, step with its railing, yoga mat) and the camera: in front,
  at her side, or three-quarters from her feet for knees to chest, whose rock runs across her body.
- `render.py` renders a contact sheet, the stills, one loop, or the sun salutation. A loop's free arms move joint by joint,
  in arcs, while IK holds a hand that stays put (the floor, a wall, her knees); every turn takes the short way round, and a
  loop runs on round its seam without a stop.
- `look.py` renders two portraits.
- `render-all.sh <work dir>` does all of it (about 30 minutes on an M2).
- `encode.py` makes the videos (VP9 WebM for the app, which plays in Android's WebView and the tests' Chromium; H.264 MP4 for
  sharing) and small looping WebPs for previews.
- `install.py <work>/final ..` copies them into the app as `web/fig` (`v/` loops, `s/` stills, `fig.js` the list the player
  reads). The player: MODULE_API section 82, Version 39.39.

## Pregnancy yoga (Version 39.54)

Mohit, 2 Nov: "pregnancy yoga doesnt have 3d model". The three pregnancy routines (`mods/plan.js` `R.preg1` to `R.preg3`) use the
same woman on three bodies:
- `b0`, her usual figure (`<work>/sakhi.blend`), for the first three months, when no bump shows;
- `b2`, the middle three months, and `b3`, the last three: `char.py` with `FIG_BUMP` (0.6 and 1.0), MakeHuman's own
  `stomach-pregnant-incr` shape from MPFB's system assets, so the clothes fit over it.

`moves.py`'s pregnancy section adds their positions, each loop as its words say:
- Palm tree with her feet flat (`palm`), and the tree at a wall (`treewall`, her right hand on a wall at her side);
- on hands and knees, her knees and hands planted: rocking back and forward (`allfours`, `rockback`, `rockfwd`), cat and cow
  (`cat`, `cow`), and the first three months' smaller ones ("Keep it small": `catsmall`, `cowsmall`);
- child pose with her knees wide (`childwide`, from behind her and to one side, 'backq', so her wide knees show);
- lying on her right side (`sidelie` with a pillow between her knees, `sidedown`, `sideleg`);
- Loosen up sitting: a shoulder roll (`seatshrug`, `seatroll`), then the march (`seatmid`, `seatmarch`, `seatmarch2`);
- the slow sit-to-stand with her feet wide (`chairupw`, `chairwide`, a little from her right, 'front3q');
- lean and sway at a counter-height table, one slow hip circle (`leantable`, `leanleft`, `leanback`, `leanright`, `leanfore`,
  from her right and a little behind, 'sideback': her bump shows, and so does her hips' sway, which a table or her own body
  hides from in front);
- the butterfly sitting tall on a folded sheet (`butterflytall`, `butterflytall2`: "Sit tall on a folded sheet", her hands on
  her knees, not the cycle routine's lean to her toes) and against a wall (`butterflywall`, `butterflywall2`, 'front3q').
Lying on her side is filmed from in front and a little above ('lie'). `render.py` places the wall behind her back and the pillow
between her knees from her pose (`after_props`). `moves.PREG` lists each body's stills and loops. (`leanfwd` and `leanfwd2`, at
the wall, stay for the drawings' choreography but aren't rendered.)

```
./render-preg.sh <work dir>              # all three bodies, about 25 minutes on an M2 (two at a time)
python3 install.py <work>/final ../.. <work>/preg/final-b0: <work>/preg/final-b2:b2- <work>/preg/final-b3:b3-
```

`install.py` keeps the regular set and adds each body's files with its prefix (`fig/v/b2-cat.webm`, `fig/s/b3-sidelie.webp`;
her usual figure's new ones have none). The player picks the body from the routine (`fb`) and falls back to the drawings, with
her bump, when a body's file isn't there.

## Checking a change

```
B=~/Applications/Blender.app/Contents/MacOS/Blender
$B -b work/sakhi.blend --python render.py -- sheet work/sheet cobra,child   # small stills of the positions named
FIG_SIZE=360x300 FIG_SAMPLES=2 FIG_STEP=2 $B -b work/sakhi.blend --python render.py -- loop work/test/march march   # a quick loop
```
