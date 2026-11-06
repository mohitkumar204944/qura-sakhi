# Renders the 3D figure's moves: Blender -b <sakhi.blend> --python render.py -- <mode> <out dir> [names]
#   sheet [a,b,..]  small stills of the app's 43 positions (or the names given), each framed on its own
#   stills [a,b,..] the same at full size, for the app's still drawings and the rest screen's "Next"
#   loop <name>     one of the app's loops (moves.LOOPS), frame by frame, with the drawing's timing
#   sun             the sun salutation: each flow from one position to the next, under the standing or the mat camera
#                   (FIG_SUN_HOLDS=1, or names: each position breathing after its flow instead, sunh-<name>; Version 39.69.2)
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
sc.render.use_overwrite = not os.environ.get('FIG_KEEP')   # Version 39.69: FIG_KEEP=1 carries on a stopped render, keeping its frames
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
    return ('front' if names[0] in moves.FRONT else 'quarter' if names[0] in moves.QUARTER else 'lie' if names[0] in moves.LIE
            else 'front3q' if names[0] in moves.FRONT3Q else 'sideback' if names[0] in moves.LEANV else 'backq' if names[0] in moves.BACKQ
            else 'front3ql' if names[0] in moves.FRONT3QL else 'side')


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
        elif kind == 'sidewall':
            m = stage.prop('sidewall', x=moves.SIDE_WALL_X)
        elif kind == 'leftwall':
            m = stage.prop('leftwall', x=moves.LEFT_WALL_X)
        elif kind == 'sheet':
            m = stage.prop('sheet', h=moves.SHEET_H)
        elif kind == 'table':
            m = stage.prop('table', y=moves.TABLE_NEAR, h=moves.TABLE_TOP)
        elif kind in ('backwall', 'pillow', 'nearwall'):
            continue   # placed from her pose (after_props)
        else:
            m = stage.prop('step', front=moves.STEP_FRONT, h=moves.STEP_H) + stage.prop('rail', a=moves.RAIL_A, b=moves.RAIL_B); framed += m
        made += m
    return made, framed


def body_extent(axis, z0, z1, hi=True):
    """The furthest her body (not her hair or clothes) reaches along an axis between two heights."""
    dg = bpy.context.evaluated_depsgraph_get(); e = k.body_obj.evaluated_get(dg); m = e.to_mesh(); mw = e.matrix_world
    ws = [mw @ v.co for v in m.vertices]; ws = [w[axis] for w in ws if z0 < w.z < z1]; e.to_mesh_clear()
    return max(ws) if hi else min(ws)


def after_props(names, snaps):
    """Props placed from her pose: the wall just behind her back for the butterfly against a wall, and the pillow between her
    knees when she lies on her side."""
    made = []
    kinds = {moves.PROPS.get(n) for n in names}
    if 'backwall' in kinds:
        y = -1e9
        for n in names:
            apply(snaps[n]); y = max(y, body_extent(1, 0.25, 0.95))
        made += stage.prop('backwall', y=y + 0.004)
    if 'nearwall' in kinds:   # standing with her back near a wall (the pelvic floor trainer's standing level): a hand's width behind
        y = -1e9
        for n in names:
            if moves.PROPS.get(n) == 'nearwall':
                apply(snaps[n]); y = max(y, body_extent(1, 0.25, 1.5))
        made += stage.prop('backwall', y=y + 0.05)
    for n in names:
        if moves.PROPS.get(n) == 'pillow':
            apply(snaps[n]); a, b = k.at('lowerleg01.L'), k.at('lowerleg01.R'); hp = (k.hip('L') + k.hip('R')) / 2
            mid = (a + b) / 2 + (hp - (a + b) / 2) * 0.18
            made += stage.prop('pillow', at=mid, size=(0.30, 0.26, max(0.07, (a - b).length - 0.085)))
    return made


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
    SET.extend(after_props(names, snaps))
    close = moves.CLOSE.get(names[0])
    if close:   # close up (Version 39.69): her head and chest, so a hand at her face shows
        lo = V((-close[0], lo.y, hi.z - close[1])); hi = V((close[0], hi.y, hi.z))
    if not any(n in moves.NO_MAT for n in names):
        if view in ('front', 'lie'):   # facing the camera, the mat runs across the frame
            cx, cy = (lo.x + hi.x) / 2, (lo.y + hi.y) / 2; half = max(0.9, (hi.x - lo.x) / 2 + 0.15); dep = max(0.62, hi.y - lo.y + 0.16)
            SET.extend(stage.prop('mat', lo=(cx - half, cy - dep / 2), hi=(cx + half, cy + dep / 2)))
            SET[-1].dimensions = (2 * half, dep, 0.006)
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


def halfway(a, b, lift=0.08, step=0.3):
    """The middle of a flow, every turn and target half way from a to b, except:
    - a foot that steps (30 cm or more) lifts clear of the mat, its knee pointing down as it steps back and forward as it
      steps through, as she steps back into a lunge or forward between her hands;
    - a foot that turns over (its toes tucking or untucking, its top coming down to the mat) lifts by as much as it turns,
      up to 10 cm, so its toes never go through the mat;
    - a hand that turns (from fingertips to a flat palm, say) stays as high as it was, so it turns before it comes down."""
    q = lambda x, y: x.slerp(-y if x.dot(y) < 0 else y, 0.5)
    m = {'rig': (a['rig'][0].lerp(b['rig'][0], 0.5), q(a['rig'][1], b['rig'][1])),
         'T': {n: (l.lerp(b['T'][n][0], 0.5), q(r, b['T'][n][1])) for n, (l, r) in a['T'].items()},
         'pb': {n: (q(r, b['pb'][n][0]), l.lerp(b['pb'][n][1], 0.5)) for n, (r, l) in a['pb'].items()},
         'c': dict(a['c']), 'sk': dict(a['sk']), 'aim': dict(a['aim']), 'hand': {s: a['hand'][s].lerp(b['hand'][s], 0.5) for s in LR}}
    for s in LR:
        fa, fb = a['T']['foot' + s][0], b['T']['foot' + s][0]
        steps = (fb - fa).length >= step
        up = (lift if steps else 0.0) + 0.1 * a['T']['footrot' + s][1].rotation_difference(b['T']['footrot' + s][1]).angle / math.pi
        l, r = m['T']['foot' + s]; l = l + V((0, 0, up)); m['T']['foot' + s] = (l, r)
        if steps:
            m['T']['knee' + s] = (l + (V((0, -0.7, 0.2)) if fb.y < fa.y else V((0, -0.2, -0.7))), m['T']['knee' + s][1])
        if a['T']['handrot' + s][1].rotation_difference(b['T']['handrot' + s][1]).angle > math.radians(25):
            l, r = m['T']['hand' + s]; m['T']['hand' + s] = (V((l.x, l.y, max(a['hand'][s].z, b['hand'][s].z))), r)
    return settle(m)


def settle(m):
    """A middle key as a pose of its own: her arms solved to its hand targets (as a position's are), so no frame pops."""
    apply(m)
    for s in LR:
        k.pb['wrist.' + s].constraints['aim'].influence = 1.0 if m['aim'][s] else 0.0
    k.resolve(LR, m['aim'])
    out = snapshot(); out['hand'] = {s: k.at('wrist.' + s).copy() for s in LR}; out['aim'] = dict(m['aim'])
    return out


def flow(a, b, T):
    """Keys one flow of the sun salutation, a to b in T frames, through its middle (moves.SUN_MID, or halfway). Where her
    body would still dip under the mat, the middle lifts her (from the pelvis, so a planted hand or foot stays put) by as
    much, until nothing goes under."""
    mid = snaps_mid.get((a, b)) or halfway(snaps[a], snaps[b])
    for _ in range(6):
        clear_anim(); key_seq([(1, snaps[a]), (T // 2 + 1, mid), (T, snaps[b])])
        low = min((sc.frame_set(f) or k.lowest()) for f in range(1, T + 1))
        if low > -0.004:
            return
        mid = settle(dict(mid, rig=(mid['rig'][0] + V((0, 0, 0.006 - low)), mid['rig'][1])))


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
    names = list(dict.fromkeys(n for _, n in seq))
    # Version 39.69: a hold that follows its coming-in clip (<name>-in) is framed with that clip's positions too, so the camera
    # doesn't jump when the player hands over from one to the other
    names += [n for _, n in moves.LOOPS.get(name + '-in', {}).get('seq', []) if n not in names]
    snaps = stage_for(names, BIG, SAMPLES)
    N = round(dur * FPS); once = isinstance(L, dict) and L.get('once')
    key_seq([(1 + round(t * N), snaps[n]) for t, n in seq], cyclic=not once)
    # the last key (frame N + 1) is the first again, so the loop closes; a clip played once (Version 39.69) ends on its last key
    sc.frame_start, sc.frame_end = 1, N + (1 if once else 0)
    sc.render.image_settings.file_format = 'PNG'; sc.render.filepath = os.path.join(OUT, name + '-')
    bpy.ops.render.render(animation=True); print('LOOP', name, N, flush=True)
    open(os.path.join(OUT, '.done'), 'w').write(str(N))   # a finished loop, so render-preg.sh can carry on after a stop
elif MODE == 'sun':
    snaps = stage_for(moves.SUN, BIG, SAMPLES)
    # each group of positions (moves.SUN_VIEWS) gets the camera that fits it; a flow from one group to the other moves the camera
    cam = sc.camera; views = {}
    for group in moves.SUN_VIEWS:
        lo, hi = V((1e9,) * 3), V((-1e9,) * 3)
        for n in group:
            apply(snaps[n]); a, b = k.bbox()
            lo = V([min(x, y) for x, y in zip(lo, a)]); hi = V([max(x, y) for x, y in zip(hi, b)])
        c = stage.frame('side', lo, hi)
        for n in group:
            views[n] = (c.location.copy(), c.rotation_euler.copy())
        bpy.data.objects.remove(c, do_unlink=True)
    sc.camera = cam

    def aim(n, f=None):
        cam.location, cam.rotation_euler = views[n]
        if f:
            cam.keyframe_insert('location', frame=f); cam.keyframe_insert('rotation_euler', frame=f)
    T = round(1.2 * FPS)
    holds = os.environ.get('FIG_SUN_HOLDS')
    if holds:   # Version 39.69.2: each position breathing after its flow (sunh-<name>), looping, under the camera its flow ends on
        N = round(moves.SUN_HOLD_S * FPS) // 2 * 2   # even, so a loop rendered every second frame closes as the others do
        for n in dict.fromkeys(moves.SUN):
            if holds != '1' and moves.SUN_HOLD[n] not in holds.split(','):
                continue
            pose(n + 'in'); sin = snapshot()
            clear_anim(); cam.animation_data_clear(); key_seq([(1, snaps[n]), (1 + round(0.4 * N), sin), (1 + N, snaps[n])], cyclic=True)
            sc.frame_start, sc.frame_end = 1, N; aim(n)
            sc.render.image_settings.file_format = 'PNG'; sc.render.filepath = os.path.join(OUT, 'sunh-' + moves.SUN_HOLD[n] + '-')
            bpy.ops.render.render(animation=True); print('SUNH', n, N, flush=True)
        sys.exit(0)
    if 'praysin' in moves.POSES:   # Version 39.69: sun-00, the first position breathing (in for 4 seconds, out for 6), looping
        pose('praysin'); sin = snapshot(); T0 = 10 * FPS
        clear_anim(); cam.animation_data_clear(); key_seq([(1, snaps['prays']), (1 + round(0.4 * T0), sin), (1 + T0, snaps['prays'])], cyclic=True)
        sc.frame_start, sc.frame_end = 1, T0; aim('prays')
        sc.render.image_settings.file_format = 'PNG'; sc.render.filepath = os.path.join(OUT, 'sun00-')
        bpy.ops.render.render(animation=True); print('SUN', 0, 'prays', flush=True)
        if os.environ.get('FIG_SUN_ONLY0'):
            sys.exit(0)
    snaps_mid = {}
    for (a, b), n in moves.SUN_MID.items():
        pose(n); snaps_mid[(a, b)] = snapshot()
    for i in range(1, len(moves.SUN)):
        a, b = moves.SUN[i - 1], moves.SUN[i]
        if a == b:
            continue
        cam.animation_data_clear()
        flow(a, b, T); sc.frame_start, sc.frame_end = 1, T
        aim(a, 1); aim(b, T)
        sc.render.image_settings.file_format = 'PNG'; sc.render.filepath = os.path.join(OUT, 'sun%02d-' % i)
        bpy.ops.render.render(animation=True); print('SUN', i, a, b, flush=True)
    clear_anim(); cam.animation_data_clear()
    for n in dict.fromkeys(moves.SUN):
        apply(snaps[n]); aim(n); still(n, os.path.join(OUT, 'sun-' + n + '.png'))
