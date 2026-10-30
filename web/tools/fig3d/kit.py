# The posing kit for the 3D figure: her pelvis is placed and turned by moving the armature object; the spine and neck
# bend bone by bone; wrists and ankles go to targets (IK) with elbows and knees pointing at poles; palms and soles face
# where a pose says. finish() then keeps each arm's pose as plain joint turns, so a loop moves arms the way joints do.
# Used inside Blender by moves.py and render.py.
import math
import bpy
from mathutils import Euler, Matrix, Quaternion, Vector

V = Vector
LR = ('L', 'R')
SX = {'L': 1, 'R': -1}   # her left is +X; she faces -Y
SPINE = ['spine05', 'spine04', 'spine03', 'spine02', 'spine01']
NECK = ['neck01', 'neck02', 'neck03', 'head']
TOES = ['toe1-1', 'toe2-1', 'toe3-1', 'toe4-1', 'toe5-1']
ARM = ['upperarm01', 'upperarm02', 'lowerarm01', 'lowerarm02', 'wrist']
UP, FWD, LEFT = V((0, 0, 1)), V((0, -1, 0)), V((1, 0, 0))


def D(a):
    return math.radians(a)


# Hand shapes (MakeHuman's own hand is flat with the fingers spread). spread: how far the index, ring and little fingers close
# in on the middle one (0 to 1); curl: the bend at each of the finger's three joints, towards the palm (degrees); thumb: the
# same for the thumb, tspread how far it closes in on the index; index: the index finger's own curl, when it differs.
SHAPES = {
    'relaxed': {'spread': 0.55, 'curl': (14, 24, 12), 'thumb': (6, 10, 8), 'tspread': 0.25},   # an arm swinging or hanging
    'flat': {'spread': 0.85, 'curl': (2, 4, 2), 'thumb': (0, 4, 2), 'tspread': 0.55},          # namaste, a palm on the wall
    'floor': {'spread': 0.25, 'curl': (0, 3, 2), 'thumb': (0, 3, 2), 'tspread': 0.1},          # a palm on the mat, fingers apart
    'hold': {'spread': 0.8, 'curl': (38, 48, 26), 'thumb': (12, 22, 16), 'tspread': 0.45},     # round a shin or a foot
    'mudra': {'spread': 0.5, 'curl': (16, 26, 14), 'thumb': (14, 24, 16), 'tspread': 0.4, 'index': (36, 42, 24)},
}


def unit(v):
    return V(v).normalized()


class Kit:
    def __init__(self, pole_angle=-90):
        self.rig = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
        self.rig.rotation_mode = 'QUATERNION'
        self.pb = self.rig.pose.bones
        self.M0 = self.rig.matrix_world.copy()
        self.P0 = self.rest('spine05')            # the point between her hips the body turns about
        self.body_obj = bpy.data.objects.get('sakhi.body')
        self.meshes = [o for o in bpy.data.objects if o.type == 'MESH' and o.parent == self.rig]
        self.T = {}
        sc = bpy.context.scene
        # her upper arm and forearm, shoulder to elbow to wrist
        self.U = (self.rest('lowerarm01.L') - self.rest('upperarm01.L')).length
        self.F = (self.rest('wrist.L') - self.rest('lowerarm01.L')).length
        for s in LR:
            for name in ('hand', 'elbow', 'foot', 'knee', 'handrot', 'footrot'):
                e = bpy.data.objects.new(name + '.' + s, None); e.empty_display_size = 0.04; e.rotation_mode = 'QUATERNION'
                sc.collection.objects.link(e); self.T[name + s] = e
            for bone, tgt, pole in (('lowerarm02.' + s, 'hand', 'elbow'), ('lowerleg02.' + s, 'foot', 'knee')):
                c = self.pb[bone].constraints.new('IK'); c.name = 'ik'; c.target = self.T[tgt + s]
                c.pole_target = self.T[pole + s]; c.chain_count = 4; c.pole_angle = D(pole_angle)
            # elbows and knees bend at the joint, not along the forearm or shin
            for b in ('upperarm02.', 'lowerarm02.', 'upperleg02.', 'lowerleg02.'):
                p = self.pb[b + s]; p.lock_ik_x = True; p.lock_ik_z = True
            # knees and elbows are hinges that only bend one way (about their own X, which flexes them), so a deep
            # fold never flips a knee backwards; they straighten to 4 degrees short of straight (her rest pose already bends
            # the elbow by about 34, which the limit counts from)
            for b, most in (('lowerleg01.', 160), ('lowerarm01.', 150)):
                p = self.pb[b + s]; p.lock_ik_y = True; p.lock_ik_z = True
                p.use_ik_limit_x = True; p.ik_min_x = -D(max(0.0, self.rest_bend(b + s) - 4)); p.ik_max_x = D(most)
            for bone, tgt in (('wrist.' + s, 'handrot'), ('foot.' + s, 'footrot')):
                c = self.pb[bone].constraints.new('COPY_ROTATION'); c.name = 'aim'; c.target = self.T[tgt + s]
                c.target_space = 'WORLD'; c.owner_space = 'WORLD'
        self.keys = self.body_obj.data.shape_keys.key_blocks if self.body_obj and self.body_obj.data.shape_keys else {}
        self.reset()

    # ---------- basics ----------
    def upd(self):
        bpy.context.view_layer.update()

    def rest(self, bone, end='head'):
        b = self.rig.data.bones[bone]; return self.M0 @ (b.head_local if end == 'head' else b.tail_local)

    def rest_bend(self, bone):
        """How far a joint is already bent in her rest pose (degrees): the angle between a bone and its parent."""
        b = self.rig.data.bones[bone]
        y0 = b.parent.matrix_local.col[1].to_3d().normalized(); y1 = b.matrix_local.col[1].to_3d().normalized()
        return math.degrees(math.acos(max(-1.0, min(1.0, y0.dot(y1)))))

    def at(self, bone, end='head'):
        self.upd(); b = self.pb[bone]
        return self.rig.matrix_world @ (b.head if end == 'head' else b.tail)

    def sh(self, s):
        return self.at('upperarm01.' + s)

    def hip(self, s):
        return self.at('upperleg01.' + s)

    def axis(self, v):
        """A direction in her body's frame, in the world."""
        return (self.rig.matrix_world.to_3x3() @ V(v)).normalized()

    def reset(self):
        self.rig.matrix_world = self.M0.copy()
        for p in self.pb:
            p.rotation_mode = 'QUATERNION'; p.rotation_quaternion = (1, 0, 0, 0); p.location = (0, 0, 0); p.scale = (1, 1, 1)
        self.upd()
        for s in LR:
            self.T['hand' + s].location = self.rest('lowerarm02.' + s, 'tail')
            self.T['elbow' + s].location = self.rest('lowerarm01.' + s) + V((0.3 * SX[s], 0.35, 0))
            self.T['foot' + s].location = self.rest('lowerleg02.' + s, 'tail')
            self.T['knee' + s].location = self.rest('lowerleg01.' + s) + V((0, -0.6, 0))
            self.pb['wrist.' + s].constraints['aim'].influence = 0.0
            for b in ('lowerarm02.', 'lowerleg02.'):
                self.pb[b + s].constraints['ik'].influence = 1.0
            self.T['handrot' + s].rotation_quaternion = (1, 0, 0, 0)
            self.flat(s)
        for k in ('!ex-eyeBlinkLeft', '!ex-eyeBlinkRight'):
            if k in self.keys:
                self.keys[k].value = 0.0
        self.handshape = {'L': 'relaxed', 'R': 'relaxed'}
        self.upd()

    # ---------- the body ----------
    def body(self, pelvis=None, rot=(0, 0, 0)):
        """Places the point between her hips and turns her whole body about it (degrees, X then Y then Z):
        +X pitches her forward (90 lies her face down, -90 on her back), -Y leans her to her right."""
        R = Euler([D(a) for a in rot], 'XYZ').to_matrix().to_4x4()
        p = V(pelvis) if pelvis is not None else self.P0
        self.rig.matrix_world = Matrix.Translation(p) @ R @ Matrix.Translation(-self.P0) @ self.M0
        self.upd()

    def rot(self, bone, axis, deg):
        """Turns a bone (and so everything after it) about its own head, about an axis of her body's frame."""
        self.upd(); pbn = self.pb[bone]; M = pbn.matrix.copy(); h = M.translation.copy()
        pbn.matrix = Matrix.Translation(h) @ Matrix.Rotation(D(deg), 4, V(axis)) @ Matrix.Translation(-h) @ M
        self.upd()

    def chain(self, bones, bend=0, side=0, twist=0, weights=None):
        w = weights or [1] * len(bones); tot = float(sum(w))
        for b, wi in zip(bones, w):
            f = wi / tot
            if twist: self.rot(b, (0, 0, 1), twist * f)
            if side: self.rot(b, (0, 1, 0), side * f)
            if bend: self.rot(b, (1, 0, 0), bend * f)

    def spine(self, bend=0, side=0, twist=0, weights=None):
        """bend + is forward (flexion), - back; side + to her left; twist + turns her chest to her left."""
        self.chain(SPINE, bend, side, twist, weights)

    def neck(self, bend=0, side=0, twist=0):
        self.chain(NECK, bend, side, twist)

    # ---------- hands and feet ----------
    def arm(self, s, hand, elbow=None, palm=None, fingers=None):
        self.T['hand' + s].location = V(hand)
        if elbow is not None:
            self.T['elbow' + s].location = V(elbow)
        if palm is not None and fingers is not None:
            y = unit(fingers); x = V(palm) * SX[s]             # the palm faces the wrist's +X on her left, -X on her right
            x = (x - y * x.dot(y)).normalized(); z = x.cross(y)
            self.T['handrot' + s].rotation_quaternion = Matrix((x, y, z)).transposed().to_quaternion()
            self.pb['wrist.' + s].constraints['aim'].influence = 1.0
        else:
            self.pb['wrist.' + s].constraints['aim'].influence = 0.0

    def bent(self, bend):
        """How far her wrist is from her shoulder when the elbow bends by bend degrees."""
        u, f = self.U, self.F
        return math.sqrt(u * u + f * f + 2 * u * f * math.cos(D(bend)))

    def shrug(self, s, deg):
        """Lifts her shoulder (the collarbone turns up at its outer end), as it does when the arm goes overhead."""
        self.rot('clavicle.' + s, (0, 1, 0), -SX[s] * deg)

    def chest_up(self):
        self.upd(); return (self.rig.matrix_world.to_3x3() @ self.pb['spine01'].matrix.col[1].to_3d()).normalized()

    def point(self, s, d, bend=5.0, elbow=None, palm=None, fingers=None):
        """A long arm from the shoulder towards d (a world direction), the elbow bent by bend degrees and pointing at
        elbow (by default out, back and down from the arm). Above shoulder height her shoulder lifts with the arm."""
        d = unit(d)
        up = math.degrees(math.acos(max(-1.0, min(1.0, -d.dot(self.chest_up())))))   # 0 hanging, 180 straight up
        if up > 90:
            self.shrug(s, min(16.0, (up - 90) * 0.2))
        sh = self.sh(s)
        if elbow is None:
            pref = self.axis((SX[s] * 0.35, 0.55, -0.75)); p = pref - d * pref.dot(d)
            elbow = sh + d * 0.2 + (p.normalized() if p.length > 1e-4 else self.axis((SX[s], 0, 0))) * 0.5
        if palm is not None and fingers is None:
            fingers = d
        self.arm(s, sh + d * self.bent(bend), elbow=elbow, palm=palm, fingers=fingers)

    def relax(self, s, palm, flex=12.0):
        """Once an arm is placed: the hand carries on from the forearm, a little bent towards the palm, the palm facing palm."""
        self.upd()
        fa = (self.rig.matrix_world.to_3x3() @ self.pb['lowerarm02.' + s].matrix.col[1].to_3d()).normalized()
        n = unit(palm); n = n - fa * n.dot(fa)
        n = n.normalized() if n.length > 1e-4 else self.axis((-SX[s], 0, 0))
        self.arm(s, self.T['hand' + s].location.copy(), palm=n, fingers=fa * math.cos(D(flex)) + n * math.sin(D(flex)))

    def leg(self, s, foot, knee=None, toes=None, sole=None):
        self.T['foot' + s].location = V(foot)
        if knee is not None:
            self.T['knee' + s].location = V(knee)
        if toes is not None and sole is not None:
            self.footdir(s, toes, sole)

    def footdir(self, s, toes, sole):
        """The foot bone points from the ankle to the middle of the foot; sole is the way the sole faces (down when standing)."""
        y = unit(toes); z = V(sole); z = (z - y * z.dot(y)).normalized(); x = y.cross(z)
        self.T['footrot' + s].rotation_quaternion = Matrix((x, y, z)).transposed().to_quaternion()

    def flat(self, s, yaw=0.0, pitch=0.0):
        """A foot flat on the floor, toes turned by yaw (+ to her left); pitch + lifts the heel (toes stay down)."""
        h = V((math.sin(D(yaw)), -math.cos(D(yaw)), 0))
        y = 0.91 * h - 0.41 * UP; z = -0.41 * h - 0.91 * UP     # the foot bone's resting angle
        if pitch:
            R = Matrix.Rotation(D(pitch), 3, h.cross(UP).normalized() * -1)
            y = R @ y; z = R @ z
        self.footdir(s, y, z)

    def fold_leg(self, s, hip, knee):
        """Bends the hip forward and the knee back before the IK solves, so a deeply bent leg folds the right way."""
        self.rot('upperleg01.' + s, (1, 0, 0), -hip)
        self.rot('lowerleg01.' + s, (1, 0, 0), knee)

    def toes(self, s, deg):
        """Bends the toes up (+) so they stay on the floor when the heel lifts or the toes are tucked."""
        for t in TOES:
            self.rot(t + '.' + s, (1, 0, 0), -deg)

    def shape(self, sides, name):
        """Chooses a hand shape (SHAPES) for 'L', 'R' or 'LR'; hands() puts it on once the pose is done."""
        for s in sides:
            self.handshape[s] = name

    def hands(self):
        """Shapes the fingers of both hands, towards each palm as the hand is turned now: run after the pose."""
        for s in LR:
            sh = SHAPES[self.handshape.get(s, 'relaxed')]
            def axes(b):
                self.upd(); m = self.pb[b].matrix
                return m.col[1].to_3d().normalized()
            def palm():
                self.upd(); return (self.pb['wrist.' + s].matrix.col[0].to_3d() * SX[s]).normalized()
            def toward(b, ref, frac):
                """Turns a finger's first bone about the palm's normal, part of the way towards ref's direction."""
                if not frac: return
                N = palm(); v = axes(b); m = axes(ref)
                v = (v - N * v.dot(N)).normalized(); m = (m - N * m.dot(N)).normalized()
                ang = math.degrees(math.atan2(N.dot(v.cross(m)), v.dot(m)))
                self.rot(b, N, ang * frac)
            for f in (2, 4, 5):
                toward('finger%d-1.%s' % (f, s), 'finger3-1.' + s, sh['spread'])
            toward('finger1-1.' + s, 'finger2-1.' + s, sh['tspread'])
            for f in (1, 2, 3, 4, 5):
                curl = sh['thumb'] if f == 1 else (sh.get('index', sh['curl']) if f == 2 else sh['curl'])
                for j in (1, 2, 3):
                    b = 'finger%d-%d.%s' % (f, j, s)
                    if b not in self.pb or not curl[j - 1]:
                        continue
                    Y = axes(b); A = Y.cross(palm())
                    if A.length > 1e-6:
                        self.rot(b, A.normalized(), curl[j - 1])

    def finish(self):
        """Run once a pose is set. The fingers take their shape; then each arm's solved pose is kept as plain joint turns
        (IK and the wrist's aim off), so a loop swings the arm joint by joint, in arcs, instead of sliding the hand along a
        straight line. info keeps where each hand is and whether the wrist was aimed, for resolve()."""
        self.hands(); self.upd()
        self.info = {s: {'hand': self.at('wrist.' + s).copy(), 'aim': self.pb['wrist.' + s].constraints['aim'].influence} for s in LR}
        self.bake()

    def bake(self, sides=LR):
        """Keeps these arms' solved pose as joint turns, with IK and the aim off. The forearm takes most of the wrist's twist,
        as a real forearm turns the palm."""
        self.upd()
        for s in sides:
            names = [b + '.' + s for b in ARM]
            M = {n: self.pb[n].matrix.copy() for n in names}
            self.pb['lowerarm02.' + s].constraints['ik'].influence = 0.0
            self.pb['wrist.' + s].constraints['aim'].influence = 0.0
            for n in names:
                self.pb[n].matrix = M[n]; self.upd()
            q = self.pb['wrist.' + s].rotation_quaternion
            tw = (2 * math.atan2(q.y, q.w) + math.pi) % (2 * math.pi) - math.pi     # the wrist's turn about the forearm
            fa = self.pb['lowerarm02.' + s]
            fa.rotation_quaternion = fa.rotation_quaternion @ Quaternion((0, 1, 0), 0.8 * tw); self.upd()
            self.pb['wrist.' + s].matrix = M['wrist.' + s]; self.upd()

    def resolve(self, sides, aim):
        """Solves these arms again from her rest pose to the targets as they are now, as a pose does, and bakes them: a loop
        uses it frame by frame where a hand stays put while her body moves. (IK started from another pose finds another
        elbow, so it never runs on the baked pose.)"""
        for s in sides:
            for b in ARM:
                p = self.pb[b + '.' + s]; p.rotation_quaternion = (1, 0, 0, 0); p.location = (0, 0, 0)
            self.pb['lowerarm02.' + s].constraints['ik'].influence = 1.0
            self.pb['wrist.' + s].constraints['aim'].influence = aim[s]
        self.bake(sides)

    def eyes_closed(self, v=1.0):
        for k in ('!ex-eyeBlinkLeft', '!ex-eyeBlinkRight'):
            if k in self.keys:
                self.keys[k].value = v

    # ---------- the floor ----------
    def lowest(self, with_hair=False):
        dg = bpy.context.evaluated_depsgraph_get(); z = 1e9
        for o in self.meshes:
            if not with_hair and any(w in o.name for w in ('hair', 'bun', 'braid', 'ponytail')):
                continue
            e = o.evaluated_get(dg); m = e.to_mesh(); mw = e.matrix_world
            z = min(z, min((mw @ v.co).z for v in m.vertices)); e.to_mesh_clear()
        return z

    def shift(self, d):
        d = V(d)
        self.rig.matrix_world = Matrix.Translation(d) @ self.rig.matrix_world
        for e in self.T.values():
            e.location += d
        self.upd()

    def turn(self, axis, deg, about):
        """Turns her whole pose (her body and every target) rigidly about a point: a gentle roll on her back, say."""
        R = Matrix.Rotation(D(deg), 4, V(axis)); p = V(about); M = Matrix.Translation(p) @ R @ Matrix.Translation(-p)
        self.rig.matrix_world = M @ self.rig.matrix_world
        q = R.to_quaternion()
        for e in self.T.values():
            e.location = M @ e.location; e.rotation_quaternion = q @ e.rotation_quaternion
        self.upd()

    def ground(self, floor=0.0):
        self.upd(); self.shift((0, 0, floor - self.lowest()))

    def bbox(self, extra=()):
        dg = bpy.context.evaluated_depsgraph_get(); lo = V((1e9,) * 3); hi = V((-1e9,) * 3)
        for o in list(self.meshes) + list(extra):
            e = o.evaluated_get(dg); m = e.to_mesh(); mw = e.matrix_world
            for v in m.vertices:
                w = mw @ v.co
                lo = V((min(lo.x, w.x), min(lo.y, w.y), min(lo.z, w.z))); hi = V((max(hi.x, w.x), max(hi.y, w.y), max(hi.z, w.z)))
            e.to_mesh_clear()
        return lo, hi

    # ---------- keys ----------
    def key(self, f):
        self.rig.keyframe_insert('location', frame=f); self.rig.keyframe_insert('rotation_quaternion', frame=f)
        for e in self.T.values():
            e.keyframe_insert('location', frame=f); e.keyframe_insert('rotation_quaternion', frame=f)
        for p in self.pb:
            p.keyframe_insert('rotation_quaternion', frame=f); p.keyframe_insert('location', frame=f)
            for c in p.constraints:
                c.keyframe_insert('influence', frame=f)
        for k in ('!ex-eyeBlinkLeft', '!ex-eyeBlinkRight'):
            if k in self.keys:
                self.keys[k].keyframe_insert('value', frame=f)
