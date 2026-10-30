# Renders the 3D figure's moves: Blender -b <sakhi.blend> --python render.py -- <mode> <out dir> [names]
#   sheet [a,b,..]  small stills of the app's 43 positions (or the names given), each framed on its own
#   stills [a,b,..] the same at full size, for the app's still drawings and the rest screen's "Next"
#   loop <name>     one of the app's loops (moves.LOOPS), frame by frame, with the drawing's timing
#   sun             the sun salutation: each flow from one position to the next, under one camera
import math, os, sys
import bpy
sys.dont_write_bytecode = True   # no __pycache__ beside the scripts
sys.path.insert(0, os.path.dirname(__file__))
import stage, moves
from kit import Kit, V, LR, ARM

args = sys.argv[sys.argv.index('--') + 1:]
MODE, OUT = args[0], args[1]
os.makedirs(OUT, exist_ok=True)
FPS = 24
BIG = tuple(int(x) for x in os.environ.get('FIG_SIZE', '720x600').split('x'))
SAMPLES = int(os.environ.get('FIG_SAMPLES', '40'))
sc = bpy.context.scene; sc.render.fps = FPS
sc.frame_step = int(os.environ.get('FIG_STEP', '1'))   # every nth frame, for a quick look at a loop
k = Kit()
SET = []   # what the stage added, cleared between stills


def clear_set():
    for o in SET:
        if o.name in bpy.data.objects:
            bpy.data.objects.remove(o, do_unlink=True)
    SET.clear()


def build_set(view, size, samples):
    before = set(bpy.data.objects)
    stage.setup(size, view, samples)
    SET.extend(o for o in bpy.data.objects if o not in before)


def view_of(names):
    return 'front' if names[0] in moves.FRONT else 'side'


def pose(name):
    k.reset(); moves.POSES[name](k); k.finish(); k.upd()


def snapshot():
    k.upd()
    return {
        'rig': (k.rig.location.copy(), k.rig.rotation_quaternion.copy()),
        'T': {n: (e.location.copy(), e.rotation_quaternion.copy()) for n, e in k.T.items()},
        'pb': {p.name: (p.rotation_quaternion.copy(), p.location.copy()) for p in k.pb},
        'c': {(p.name, c.name): c.influence for p in k.pb for c in p.constraints},
        'sk': {n: k.keys[n].value for n in ('!ex-eyeBlinkLeft', '!ex-eyeBlinkRight') if n in k.keys},
        'hand': {s: k.info[s]['hand'].copy() for s in LR}, 'aim': {s: k.info[s]['aim'] for s in LR},
    }


def apply(s):
    k.rig.location, k.rig.rotation_quaternion = s['rig']
    for n, (l, q) in s['T'].items():
        k.T[n].location, k.T[n].rotation_quaternion = l, q
    for n, (q, l) in s['pb'].items():
        k.pb[n].rotation_quaternion, k.pb[n].location = q, l
    for (pn, cn), v in s['c'].items():
        k.pb[pn].constraints[cn].influence = v
    for n, v in s['sk'].items():
        k.keys[n].value = v
    k.upd()


def props_for(names):
    made, framed = [], []
    for kind in sorted({moves.PROPS[n] for n in names if n in moves.PROPS}):
        if kind == 'chair':
            m = stage.prop('chair'); framed += m
        elif kind == 'wall':
            m = stage.prop('wall', y=moves.WALL_Y)
        elif kind == 'calfwall':
            m = stage.prop('calfwall', y=moves.CALF_WALL_Y)
        else:
            m = stage.prop('step', front=moves.STEP_FRONT, h=moves.STEP_H); framed += m
        made += m
    return made, framed


def stage_for(names, size, samples):
    """Builds the set for these positions and returns their snapshots, posed once each."""
    view = view_of(names)
    build_set(view, size, samples)
    made, framed = props_for(names); SET.extend(made)
    snaps, lo, hi = {}, V((1e9,) * 3), V((-1e9,) * 3)
    for n in names:
        if n not in snaps:
            pose(n); snaps[n] = snapshot()
            a, b = k.bbox(framed)
            lo = V((min(lo.x, a.x), min(lo.y, a.y), min(lo.z, a.z))); hi = V((max(hi.x, b.x), max(hi.y, b.y), max(hi.z, b.z)))
    if not any(n in moves.NO_MAT for n in names):
        if view == 'front':   # facing the camera, the mat runs across the frame
            cx, cy = (lo.x + hi.x) / 2, (lo.y + hi.y) / 2; half = max(0.9, (hi.x - lo.x) / 2 + 0.15)
            SET.extend(stage.prop('mat', lo=(cx - half, cy - 0.31), hi=(cx + half, cy + 0.31)))
            SET[-1].dimensions = (2 * half, 0.62, 0.006)
        else:
            SET.extend(stage.prop('mat', lo=(lo.x, lo.y), hi=(hi.x, hi.y)))
    SET.append(stage.frame(view, lo, hi, margin=max([1.14] + [moves.FRAME_MARGIN.get(n, 1.14) for n in names])))
    return snaps


def clear_anim():
    for o in [k.rig] + list(k.T.values()):
        o.animation_data_clear()
    if k.body_obj and k.body_obj.data.shape_keys:
        k.body_obj.data.shape_keys.animation_data_clear()


def key_seq(frames, cyclic=False):
    """Keys each (frame, snapshot) in turn and eases between them. Arms move joint by joint (Kit.finish keeps their pose as
    joint turns). Where a hand stays put while her body moves (on the floor, a wall, her feet), that arm is then solved
    again frame by frame, as the stills are, so the hand stays planted. Every rotation takes the short way round."""
    last = {}
    for f, s in frames:
        sc.frame_set(f); apply(s)
        for name, o in [('rig', k.rig)] + list(k.T.items()) + [(p.name, p) for p in k.pb]:
            q = o.rotation_quaternion
            if name in last and q.dot(last[name]) < 0:
                o.rotation_quaternion = -q
            last[name] = o.rotation_quaternion.copy()
        k.upd(); k.key(f)
    ease_all(cyclic)
    for (f0, a), (f1, b) in zip(frames, frames[1:]):
        sides = [s for s in LR if a is not b and (a['hand'][s] - b['hand'][s]).length < 0.02]
        if not sides:
            continue
        bones = [k.pb[n + '.' + s] for s in sides for n in ARM]
        for f in range(f0 + 1, f1):
            sc.frame_set(f); was = [p.rotation_quaternion.copy() for p in bones]
            k.resolve(sides, a['aim'])
            for p, q0 in zip(bones, was):
                if p.rotation_quaternion.dot(q0) < 0:
                    p.rotation_quaternion = -p.rotation_quaternion
                p.keyframe_insert('rotation_quaternion', frame=f); p.keyframe_insert('location', frame=f)


def ease_all(cyclic=False):
    """Eases between keys. A loop's curves run on round the seam, so a march or an arm circle never stops where the video
    starts again."""
    acts = [o.animation_data.action for o in [k.rig] + list(k.T.values()) if o.animation_data and o.animation_data.action]
    if k.body_obj and k.body_obj.data.shape_keys and k.body_obj.data.shape_keys.animation_data:
        acts.append(k.body_obj.data.shape_keys.animation_data.action)
    for a in acts:
        for fc in a.fcurves:
            const = fc.data_path.endswith('.influence')
            for kp in fc.keyframe_points:
                kp.interpolation = 'CONSTANT' if const else 'BEZIER'; kp.handle_left_type = kp.handle_right_type = 'AUTO_CLAMPED'
            if cyclic and not const:
                fc.modifiers.new('CYCLES')
            fc.update()


def still(name, path):
    sc.render.filepath = path; bpy.ops.render.render(write_still=True)


if MODE in ('sheet', 'stills'):
    names = args[2].split(',') if len(args) > 2 else moves.DRAWINGS + moves.EXTRA
    size, samples = ((300, 250), 16) if MODE == 'sheet' else (BIG, SAMPLES + 24)
    for n in names:
        clear_set(); snaps = stage_for([n], size, samples); apply(snaps[n])
        still(n, os.path.join(OUT, n + '.png')); print('STILL', n, flush=True)
elif MODE == 'loop':
    name = args[2]; L = moves.LOOPS[name]
    if isinstance(L, dict):
        dur, seq = L['dur'], L['seq']
    else:
        a, b, dur, hold = L
        seq = [(0, a), (0.3, b), (0.7, b), (1.0, a)] if hold else [(0, a), (0.5, b), (1.0, a)]
    snaps = stage_for(list(dict.fromkeys(n for _, n in seq)), BIG, SAMPLES)
    N = round(dur * FPS)
    key_seq([(1 + round(t * N), snaps[n]) for t, n in seq], cyclic=True)
    sc.frame_start, sc.frame_end = 1, N    # the last key (frame N + 1) is the first again, so the loop closes
    sc.render.image_settings.file_format = 'PNG'; sc.render.filepath = os.path.join(OUT, name + '-')
    bpy.ops.render.render(animation=True); print('LOOP', name, N, flush=True)
elif MODE == 'sun':
    snaps = stage_for(moves.SUN, BIG, SAMPLES)
    T = round(0.9 * FPS)
    for i in range(1, len(moves.SUN)):
        a, b = moves.SUN[i - 1], moves.SUN[i]
        if a == b:
            continue
        clear_anim()
        key_seq([(1, snaps[a]), (T, snaps[b])]); sc.frame_start, sc.frame_end = 1, T
        sc.render.image_settings.file_format = 'PNG'; sc.render.filepath = os.path.join(OUT, 'sun%02d-' % i)
        bpy.ops.render.render(animation=True); print('SUN', i, a, b, flush=True)
    clear_anim()
    for n in dict.fromkeys(moves.SUN):
        apply(snaps[n]); still(n, os.path.join(OUT, 'sun-' + n + '.png'))
