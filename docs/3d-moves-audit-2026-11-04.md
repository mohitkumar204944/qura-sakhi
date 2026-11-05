# Do all yoga and exercises have a 3D model? (audit, 4 Nov 2026)

Checked against HEAD 302ccbc plus the working tree. Section 2's two gaps are fixed in Version 39.67 (Mohit, 4 Nov: "Yes, fix
both"; MODULE_API section 110). Section 1 is still open. `web/fig` holds 82 stills and
45 loops (34 moves and 11 sun salutation flows).

## 0. Verdict

- **The player's routines (Moves and calm): yes, all of them.** All 9 routines, 76 steps once each routine's knee-pain swaps
  and Getting ready's before-period swaps are counted, resolve to a 3D file, so no step falls back to the line drawing. 57 have a
  moving loop. The other 19 are held poses or breathing and show a 3D still on purpose (section 3). `node test/moves3d.mjs`: 63/63.
- **But 3 pictures show the wrong move** (section 1), and **2 moves outside the player had no picture at all** (section 2, now fixed).

## 1. A 3D picture that shows a different move from the words

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

## 3. No 3D loop, by design (a still, or nothing to show)

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
