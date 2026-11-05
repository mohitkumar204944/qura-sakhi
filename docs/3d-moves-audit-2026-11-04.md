# Do all yoga and exercises have a 3D model? (audit, 4 Nov 2026)

Checked against HEAD 302ccbc plus the working tree. Section 2's two gaps are fixed in Version 39.67 (Mohit, 4 Nov: "Yes, fix
both"; MODULE_API section 110). Section 1's three wrong pictures are fixed in Version 39.69, where every exercise moves (section 6;
MODULE_API section 112). `web/fig` holds 82 stills and
45 loops (34 moves and 11 sun salutation flows).

## 0. Verdict

- **The player's routines (Moves and calm): yes, all of them.** All 9 routines, 76 steps once each routine's knee-pain swaps
  and Getting ready's before-period swaps are counted, resolve to a 3D file, so no step falls back to the line drawing. 57 have a
  moving loop. The other 19 are held poses or breathing and show a 3D still on purpose (section 3). `node test/moves3d.mjs`: 63/63.
- **But 3 pictures show the wrong move** (section 1), and **2 moves outside the player had no picture at all** (section 2, now fixed).

## 1. A 3D picture that shows a different move from the words (fixed in Version 39.69, section 6)

| Where | Step (her words) | What the 3D shows | Why |
|---|---|---|---|
| Steady on your feet (midlife, `steady`) | **One leg at the wall**: side-on to a wall, one hand on it, lift one foot a little and hold | `march`: marching on the spot with a high knee and swinging arms. No wall, and no hold | Borrowed pose; the comment in `mods/plan.js` says "the 3D loops are the nearest poses until the new ones are made" |
| Steady on your feet | **Heel to toe at the wall**: one hand on a wall, one foot right in front of the other | `walk`: an ordinary long stride, no wall | Same |
| Pelvic floor trainer, level card (`mods/post.js`, `PF_POSE.stand`) | Squeezes **"standing, your back near a wall"** | `wall`: the wall push-up, facing the wall and leaning onto her hands | Borrowed still |

The first two matter most. They are balance moves for women at risk of falls, and the picture shows something harder and
different from the words. Heel raises in the same routine (`calf`) are correct.

## 2. Moves with no picture at all (fixed in Version 39.67)

| Where | Move | Now | Possible fix |
|---|---|---|---|
| Feel better now → Period cramps (`mods/relief.js`, steps c2 and c3) | **Child's pose** and **Knees to chest** | Words and a timer only | The same moves already have 3D files (`child` still, `knees` loop) with matching words in Cycle care yoga. Code only: no new renders, no new wording |
| 21 small steps → PMOS, day 16 (`mods/journey.js`) | **"Do 10 squats or 10 push-ups against a wall"** | Words only, no button | Add an Open button to Strength at home, which has both moves in 3D (`chair`, `wall`) |

## 3. No 3D loop, by design (a still, or nothing to show): until Version 39.69, which moves them all (section 6)

- **Held poses, 3D still only:** tree (and tree at a wall), child pose (and wide-knee child pose), Shavasana, rest on your side,
  sitting for breathing (`sit`, `nostril` for Anulom vilom, `chairsit`). A loop would only show her getting into the pose.
- **Pelvic floor squeezes:** the muscle is inside, so a figure can't show the squeeze. In a plan, the level card shows her
  position (lying `bridgedown`, sitting `chairsit`, walking `walk`; standing is wrong, see section 1). The trainer without a
  plan shows no position, and doesn't need one.
- **Breathing and relaxation** (relief routines, Wind down, Calm breath): Wind down has its own moving pictures. The relief
  routines use the breathing circle.
- **Walks** (every plan's walk step): no picture needed.
- **Belly gap check after a birth** (`mods/post.js`, `gap_h`): a self-check in 3 written steps, not an exercise. A picture
  would help, but it would be a new render.

## 4. What each fix needs

1. **Relief cramps pictures**: done in Version 39.67, with the existing `child` still and `knees` loop. Pause and Next now stay
   above the tab bar, as in the player.
2. **Journey day 16 button**: done in Version 39.67. It opens Strength at home, and isn't shown in a pregnancy.
3. **Steady on your feet, 2 new 3D moves** (one-leg stand at a wall, tandem walk at a wall): new renders in
   `web/tools/fig3d` (Blender and MakeHuman, outside the repo), then `install.py`. The moves are still drafts for the
   physiotherapist (wording review 19.51), so ask the physiotherapist before rendering.
4. **Pelvic floor "standing" still**: one new still (standing tall, back near a wall). Until then, the card could show no
   picture for that level instead of the wrong one.

## 5. How it was checked, and re-running it

`node test/fig-coverage.mjs` (from `web/`, new) reads the routine table out of `mods/plan.js` and resolves each step's still and
loop the way the player does (`figKey`, `figName`, the pregnancy body's `b2-`/`b3-` prefix). It exits 1 if any step has no 3D
still. It can't tell whether a picture shows the right move, so the borrowed poses in section 1 were checked by eye. Run it
after any re-render or any change to a routine.

## 6. Every exercise moving (Version 39.69, 5 Nov)

Mohit, 5 Nov, on his Flip5's pelvic floor page: "the model is not functional", then "All, pelvic floor first". I first advised a
see-through view of the pelvis. He corrected it: "my goal is not have a see through model but i dont want any still picture all
exercises model should be doing right moves". So nothing is a diagram, and no exercise shows a still: the woman herself, on the
3D figure, does each one. Stills stay only for "reduce motion", a clip that can't play, and the routine list's thumbnails.

### 6.1 What moves now

- **Held poses: into the pose, then the hold.** A clip played once brings her into the pose (`<pose>-in`), then a loop holds it
  while she breathes:
  - tree (from palms together, her foot up her leg to her calf, then her arms up), and tree at a wall on her usual figure and
    the middle three months' body;
  - child pose (kneeling, sitting back on her heels, folding forward) and its wide-knee version in pregnancy, which the cramps
    routine uses too;
  - Steady on your feet's "One leg at the wall": her hand on the wall, she lifts a foot a little, then holds.
- **Breathing steps breathe**, in for 4 and out for 6, as the steps count:
  - Bhramari, Sit quietly, Slow breathing and "Sit quietly" before her period (`sit`);
  - Shavasana (`rest`), rest on your side in pregnancy (`sidelie`), and "Long breaths out" on a chair (`chairsit`);
  - the sun salutation's first position, palms together (`sun-00`, under its own camera).
- **Anulom vilom, close up:** her thumb closes her right nostril as she breathes in through the left. Then her hand rolls, her
  ring finger closes the left and her thumb comes away, and she breathes out through the right, then back again: one round in 20
  seconds.
- **Heel to toe at the wall:** her left hand on the wall, each foot landing right in front of the other's toes, on the spot as the
  walk is filmed.
- **The pelvic floor trainer** shows her level's position moving, on the level card and in the set, pausing with it. She lies with
  her knees bent, sits on a chair or stands with her back near a wall, each breathing (`bridgedown`, `chairsit`, `pfstand`), or she
  walks (`walk`).
  - A squeeze can't be seen from outside. Done right, nothing else moves (her tummy, bottom and thighs stay still), so the figure
    shows exactly that, and nothing that would teach squeezing her bottom or pulling in her tummy.
  - The standing level has its own position now, her back near a wall, not the wall push-up.
- **The belly gap check** after a birth: on her back, knees bent, her fingertips at her belly button; her head and shoulders lift,
  and she lies back (`gapcheck`).

### 6.2 How it's made

- `moves.py`: the new positions, a breath-in version of each held pose (`_inhale`, `_breathed`), and the loops. A clip with
  `once: True` ends on its pose. `CLOSE` frames Anulom vilom from her head to her chest. Steady is filmed from her left and in
  front (`front3ql`), with the wall at her right side.
- `render.py`: `once`, `CLOSE`, the near wall behind her and the wall at her left, and `sun-00` before the flows
  (`FIG_SUN_ONLY0=1` renders only it).
- `kit.py`: a fix. A loop's hands that stay put are solved again frame by frame, and that solve let a tiny scale creep into her arm
  bones and grow. Over a 10-second loop it stretched her hands into long sticks (first seen on `sit`). The arm bones now keep a
  scale of 1.
- `render.py` also frames a hold with its coming-in clip's positions, so the camera doesn't jump between them. `FIG_STEP=2` renders a
  slow breath every second frame, and `encode.py` keeps its length. `FIG_KEEP=1` carries on a stopped render.
- `install.py` writes `sun0` into `fig.js`. The player (`mods/plan.js`), the cramps routine (`mods/relief.js`) and the trainer
  (`mods/post.js`) play `<pose>-in` once, then its loop.

### 6.3 Still open

- Steady's two balance moves are drafts for the physiotherapist (review 19.51). Their pictures now match their words, and go to
  the physiotherapist with them.
- The sun salutation holds each position for the rest of its step after its flow, as before. Only its first position had no clip.
