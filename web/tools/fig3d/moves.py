# Every position the app's drawings use (mods/plan.js: P, ANIM and the sun salutation), posed on the 3D figure in real
# proportions. A position is a function of the kit; a loop repeats the drawing's timing (ANIM: seconds, and whether it
# holds the second position for 40% of the loop). Side views show her right side, facing right as the drawings do;
# front views face the camera. Props: chair, wall and step, and a yoga mat for the yoga and floor positions.
import math
from mathutils import Vector
from kit import V, LR, SX, UP, FWD, D, unit

FLOOR_W = 0.035   # a wrist resting on the floor (palm flat)


def stand(k, feet=0.10, pelvis=None, rot=(0, 0, 0), knees=True):
    k.body(pelvis, rot)
    for s in LR:
        k.leg(s, (SX[s] * feet, -0.03, 0.066), knee=(SX[s] * feet, -0.7, 0.45) if knees else None)


def arms_side(k, palm=-UP, lift=0.0):
    """Arms long and level out to her sides."""
    for s in LR:
        k.point(s, (SX[s], 0, lift), palm=palm)
    k.shape('LR', 'flat')


def namaste(k, z=1.1):
    for s in LR:
        k.arm(s, (SX[s] * 0.02, -0.2, z), elbow=(SX[s] * 0.6, -0.05, 0.92), palm=(-SX[s], 0, 0), fingers=(0, -0.15, 1))
    k.shape('LR', 'flat')


def overhead(k, gap=0.02, fwd=0.05):
    """Arms straight up beside her head, palms together, her shoulders lifting with them."""
    for s in LR:
        k.shrug(s, 15)
    mid = (k.sh('L') + k.sh('R')) / 2; L = k.bent(5)
    for s in LR:
        sh = k.sh(s); x = mid.x + SX[s] * gap; y = sh.y - fwd
        z = sh.z + math.sqrt(max(0.0, L * L - (sh.x - x) ** 2 - (sh.y - y) ** 2))
        k.arm(s, (x, y, z), elbow=sh + V((SX[s] * 0.5, 0.25, 0.3)), palm=(-SX[s], 0, 0), fingers=UP)
    k.shape('LR', 'flat')


def floor_arm(k, s, d, palm=-UP, h=FLOOR_W, bend=6.0):
    """A long arm lying on the floor towards d (level, the world's): the wrist at h, as far out as the arm reaches."""
    sh = k.sh(s); L = k.bent(bend); r = math.sqrt(max(0.0, L * L - max(0.0, sh.z - h) ** 2)); d = unit((d[0], d[1], 0))
    k.arm(s, (sh.x + d.x * r, sh.y + d.y * r, h), elbow=sh + d * 0.22 + V((SX[s] * 0.5, 0, 0)), palm=palm, fingers=d)


def thigh_hand(k, s, bend=10.0):
    """Her hand resting on top of her thigh, palm down, as far down it as her arm reaches with the elbow soft."""
    sh = k.sh(s); hp = k.hip(s); kn = k.at('lowerleg01.' + s); L = k.bent(bend)
    on = [hp + (kn - hp) * (0.1 + 0.8 * i / 40) + V((0, 0, 0.085)) for i in range(41)]
    p = min(on, key=lambda q: abs((q - sh).length - L))
    k.arm(s, p, elbow=sh + V((SX[s] * 0.4, 0.2, -0.1)), palm=-UP, fingers=unit(kn - hp))


# ---------- standing ----------
def pray(k):
    stand(k); namaste(k)


def armsup(k):
    stand(k); overhead(k)


def opens(k):
    """Palm tree on the way up and down: arms wide at shoulder height, palms turned up so they can go on overhead."""
    stand(k); arms_side(k, palm=UP, lift=0.08)


def tiptoe(k):
    """Palm tree at its fullest: up on her toes, arms stretched up ("Rise on your toes if you can")."""
    stand(k, pelvis=(0, -0.05, 0.875))
    for s in LR:
        k.leg(s, (SX[s] * 0.10, -0.012, 0.15), knee=(SX[s] * 0.10, -0.7, 0.5))
        k.flat(s, pitch=36); k.toes(s, 55)
    k.ground(); overhead(k)


def tree(k):
    k.body((-0.035, -0.022, 0.791))
    k.leg('R', (-0.075, -0.03, 0.066), knee=(-0.08, -0.7, 0.45))
    # her left foot on the inside of her right calf, never on the knee; the left knee opens out to her left
    k.leg('L', (-0.035, -0.0, 0.34), knee=(0.75, -0.2, 0.55), toes=(-0.1, -0.15, -1), sole=(-1, 0, 0))
    overhead(k)


def wide(k):
    stand(k, feet=0.47, pelvis=(0, -0.022, 0.70))
    k.flat('R', yaw=-90); k.flat('L', yaw=12)
    arms_side(k)


def triangle(k):
    stand(k, feet=0.47, pelvis=(0.1, -0.022, 0.70), rot=(0, -48, 0))
    k.flat('R', yaw=-90); k.flat('L', yaw=12)
    k.spine(side=-12)
    # her arms make one upright line: the upper arm straight up, the lower hand resting on the front of her right shin
    k.point('L', UP, bend=4, palm=(0, -1, 0))
    sh = k.sh('R'); kn = k.at('lowerleg01.R'); an = k.at('lowerleg02.R', 'tail')
    t = max(0.15, min(0.85, (kn.z - (sh.z - k.bent(8))) / (kn.z - an.z)))
    k.arm('R', kn + (an - kn) * t + V((0, -0.055, 0)), elbow=sh + V((-0.3, 0.3, -0.1)), palm=(0, 1, 0), fingers=(0, 0, -1))
    k.shape('LR', 'flat')
    k.neck(twist=60)   # "look up if your neck is comfortable": her face turns up to her raised hand


def _circle(k, a):
    """Loosen up's big arm circles: both arms long, forward and up past her ears, then out behind her and down (a, degrees
    round the circle: 0 hanging, 90 forward, 180 up, 270 out behind; the arm stays a little out from her side)."""
    stand(k)
    sn, cs = math.sin(D(a)), math.cos(D(a))
    for s in LR:
        k.point(s, (SX[s] * (0.35 - 0.25 * sn), -sn * (1.0 if sn > 0 else 0.6), -cs), bend=6, palm=(-SX[s], 0, 0))
    k.shape('LR', 'relaxed')


for _a in range(0, 360, 45):
    globals()['circle%d' % _a] = (lambda a: lambda k: _circle(k, a))(_a)


def warmup(k):
    _circle(k, 180)   # the top of the circle, both arms up


def warmup2(k):
    _circle(k, 225)


# Loosen up's other two parts, "turn your head slowly side to side, roll your shoulders": standing loose, arms hanging
def loose(k):
    stand(k)
    for s in LR:
        swing(k, s, 3, 12)


def lookl(k):
    loose(k); k.neck(twist=45)


def lookr(k):
    loose(k); k.neck(twist=-45)


def shoulderup(k):
    loose(k)
    for s in LR:
        k.shrug(s, 14)


def shoulderback(k):
    loose(k)
    for s in LR:
        k.rot('clavicle.' + s, (0, 0, 1), SX[s] * 12); k.shrug(s, 5)


def swing(k, s, deg=0.0, bend=12.0):
    """A relaxed arm from the shoulder: the wrist swung forward (+) or back (-) by deg from hanging straight down, the elbow
    bent by bend and pointing back, the palm towards her side, as an arm swings when she walks or marches."""
    sh = k.sh(s); a = D(deg); d = unit((SX[s] * 0.12, -math.sin(a), -math.cos(a)))
    k.point(s, d, bend=bend, elbow=sh + d * 0.22 + V((SX[s] * 0.1, 0.5, 0)))
    k.relax(s, (-SX[s], 0.3, 0)); k.shape(s, 'relaxed')


def _march(k, up, fwd_arm):
    """up: the leg whose knee lifts; fwd_arm: the arm that swings forward (the other side), elbows bent as she marches."""
    k.body()
    st = 'L' if up == 'R' else 'R'
    k.leg(st, (SX[st] * 0.09, -0.03, 0.066), knee=(SX[st] * 0.09, -0.7, 0.45))
    k.leg(up, (SX[up] * 0.09, -0.29, 0.34), knee=(SX[up] * 0.09, -1.0, 0.8), toes=(0, -0.45, -0.89), sole=(0, 0.89, -0.45))
    # as the app's drawing swings them: the forward arm bent, its hand up at her chest; the back arm almost straight, swung
    # back past her hip
    bk = 'L' if fwd_arm == 'R' else 'R'
    swing(k, fwd_arm, 57, 100); swing(k, bk, -22, 12)


def marchmid(k):
    """Between two lifts: both feet down, arms passing her sides."""
    stand(k, feet=0.09)
    for s in LR:
        swing(k, s, 17, 45)


def march(k):
    _march(k, 'R', 'L')


def march2(k):
    _march(k, 'L', 'R')


def _walk(k, front):
    back = 'L' if front == 'R' else 'R'
    k.body((0, -0.02, 0.765))
    k.leg(front, (SX[front] * 0.09, -0.3, 0.07), knee=(SX[front] * 0.09, -1.0, 0.5))
    k.flat(front, pitch=-8)
    k.leg(back, (SX[back] * 0.09, 0.27, 0.13), knee=(SX[back] * 0.09, -0.8, 0.45))
    k.flat(back, pitch=38); k.toes(back, 35)
    swing(k, back, 32, 22); swing(k, front, -24, 10)   # the arm opposite the front leg swings forward


def _pass(k, stance):
    """Mid-step: her weight over the stance foot, the other foot swinging past it just off the floor, arms by her sides."""
    sw = 'L' if stance == 'R' else 'R'
    k.body((0, -0.02, 0.79))
    k.leg(stance, (SX[stance] * 0.09, -0.02, 0.066), knee=(SX[stance] * 0.09, -0.8, 0.45))
    k.leg(sw, (SX[sw] * 0.09, 0.02, 0.15), knee=(SX[sw] * 0.09, -0.9, 0.5)); k.flat(sw, pitch=18)
    for s in LR:
        swing(k, s, 6, 18)


def walkpass(k):
    _pass(k, 'R')


def walkpass2(k):
    _pass(k, 'L')


def walk(k):
    _walk(k, 'R')


def walk2(k):
    _walk(k, 'L')


# ---------- the sun salutation (side) ----------
SUN_HANDS_Y = -0.55   # where both palms stay planted, from the lunge to the other lunge
SUN_FEET_Y = -0.54    # where she stands, so her hands come down beside her feet and the front foot of each lunge stays put


def _sun_spot(k):
    """Moves a standing position of the sun salutation onto the spot where she stands."""
    k.shift((0, SUN_FEET_Y - (k.T['footL'].location.y + k.T['footR'].location.y) / 2, 0))


def prays(k):
    stand(k, feet=0.06); namaste(k); _sun_spot(k)


def reach(k):
    """Hasta uttanasana, "arms up, lean back a little": her hips a little forward, her upper back arching and her arms
    reaching up and back past her head."""
    stand(k, feet=0.06, pelvis=k.P0 + V((0, -0.04, -0.004)))
    k.spine(bend=-26, weights=[0.5, 0.7, 1, 1.3, 1.4]); k.neck(bend=-12)
    for s in LR:
        k.point(s, k.axis((-SX[s] * 0.18, 0.32, 1)), palm=(-SX[s], 0, 0))
    k.shape('LR', 'flat')
    _sun_spot(k)


def dive(k):
    """Between her raised arms and the forward bend, both ways: folding from her hips with her back long and her arms
    reaching forward in line with it, so her arms sweep down in front of her (the flow's middle, not a position)."""
    k.body((0, 0.06, 0.77), rot=(55, 0, 0))
    for s in LR:
        k.leg(s, (SX[s] * 0.06, -0.03, 0.066), knee=(SX[s] * 0.06, -0.9, 0.5))
    k.spine(bend=6); k.neck(bend=-8)
    for s in LR:
        k.point(s, k.axis((-SX[s] * 0.12, -0.15, 1)), palm=(-SX[s], 0, 0))
    k.shape('LR', 'flat')
    _sun_spot(k)


def fwdbend(k):
    """Hasta padasana as Sakhi words it, "hands to your shins or feet": a rounded fold with soft knees and her hands on
    her shins (a deeper hip fold strains the figure's hips)."""
    k.body((0, 0.08, 0.75), rot=(104, 0, 0))
    for s in LR:
        k.leg(s, (SX[s] * 0.08, -0.03, 0.066), knee=(SX[s] * 0.08, -0.9, 0.5))
    k.spine(bend=40); k.neck(bend=14)
    for s in LR:
        k.arm(s, (SX[s] * 0.11, -0.13, 0.27), elbow=(SX[s] * 0.35, 0.1, 0.5), palm=(0, 1, 0), fingers=(0, 0, -1))
    k.shape('LR', 'hold')
    k.ground(); _sun_spot(k)


def _plant_hands(k, y=SUN_HANDS_Y):
    """Moves the whole pose so her hands are on the sun salutation's spot."""
    mid = (k.T['handL'].location + k.T['handR'].location) / 2
    k.shift((0, y - mid.y, 0))


def _lunge(k, front):
    """Ashwa sanchalanasana, "one leg back, knee down": the back shin along the mat with the knee resting on it, her hips
    low where that thigh puts them, her chest lifted about 40 degrees with an arched back, looking ahead, and her arms long
    with the fingertips on the mat either side of the front foot (palms flat, her arms would hold her chest down)."""
    back = 'L' if front == 'R' else 'R'
    knee_y, hz = 0.62 - 0.399, 0.28                     # the back knee 40 cm ahead of its ankle; her hips 28 cm up
    hip = V((0, knee_y - math.sqrt(0.34 ** 2 - (hz - 0.05) ** 2), hz))
    k.body((0, 0, 0.4), rot=(56, 0, 0)); k.body(V((0, 0, 0.4)) + hip - (k.hip('L') + k.hip('R')) / 2, rot=(56, 0, 0))
    k.spine(bend=-14); k.neck(bend=-26)
    k.leg(front, (SX[front] * 0.09, -0.37, 0.066), knee=(SX[front] * 0.09, -1.0, 0.6))
    k.leg(back, (SX[back] * 0.09, 0.62, 0.075), knee=(SX[back] * 0.09, knee_y, -0.6), toes=(0, 0.97, -0.25), sole=(0, 0.25, 0.97))
    k.ground()   # before her hands come down: her fingers take their shape only after the pose
    for s in LR:
        sh = k.sh(s)
        k.arm(s, (SX[s] * 0.21, sh.y - 0.03, 0.12), elbow=(SX[s] * 0.4, sh.y + 0.3, 0.6), palm=(0, 0.94, -0.35), fingers=(0, -0.35, -0.94))
    k.shape('LR', 'tips')
    _plant_hands(k)


def lunge(k):
    _lunge(k, 'R')


def lunge2(k):
    _lunge(k, 'L')


def plank(k):
    k.body((0, 0, 0.335), rot=(74, 0, 0))
    for s in LR:
        ank = k.rig.matrix_world @ k.rig.data.bones['lowerleg02.' + s].tail_local
        k.leg(s, ank + V((0, 0, 0.0)), knee=ank + V((0, -0.3, -0.6)), toes=(0, 0.25, -1), sole=(0, 1, 0.1))
        k.toes(s, 70)
        sh = k.sh(s); k.arm(s, (sh.x * 1.05, sh.y, FLOOR_W), elbow=(SX[s] * 0.35, sh.y + 0.4, 0.3), palm=-UP, fingers=FWD)
    k.shape('LR', 'floor')
    _plant_hands(k); k.ground()


def ashtanga(k):
    k.body((0, 0, 0.36), rot=(114, 0, 0))
    k.spine(bend=-12); k.neck(bend=-28)
    for s in LR:
        hp = k.hip(s)
        k.leg(s, (SX[s] * 0.09, hp.y + 0.52, 0.11), knee=(SX[s] * 0.09, hp.y + 0.3, -0.6), toes=(0, 0.2, -1), sole=(0, 1, 0.1))
        k.toes(s, 70)
        sh = k.sh(s); k.arm(s, (SX[s] * 0.24, sh.y + 0.02, FLOOR_W), elbow=(SX[s] * 0.3, sh.y + 0.3, 0.7), palm=-UP, fingers=FWD)
    k.shape('LR', 'floor')
    _plant_hands(k); k.ground()


def prone(k, arms='chest'):
    k.body((0, 0, 0.12), rot=(90, 0, 0))
    for s in LR:
        ank = k.rig.matrix_world @ k.rig.data.bones['lowerleg02.' + s].tail_local
        k.leg(s, (SX[s] * 0.08, ank.y, 0.07), knee=(SX[s] * 0.08, ank.y - 0.4, -0.6), toes=(0, 0.97, -0.24), sole=(0, 0.24, 0.97))
    if arms == 'chest':
        # hands flat beside her chest, elbows bent close to the body: when her chest lifts in the cobra, her shoulders come back
        # over her hands and her elbows stay bent, as the drawing has them
        for s in LR:
            sh = k.sh(s); k.arm(s, (SX[s] * 0.24, sh.y + 0.05, FLOOR_W), elbow=(SX[s] * 0.3, sh.y + 0.4, 0.5), palm=-UP, fingers=FWD)
    else:
        # arms long along her sides, palms down beside her thighs
        for s in LR:
            floor_arm(k, s, (SX[s] * 0.1, 1))
    k.shape('LR', 'floor')
    k.ground()


def cobra(k):
    """Bhujangasana, "lift your head and chest gently, elbows bent, hips down": her hands stay where they were, her head
    lifts with her chest and she looks ahead."""
    prone(k)
    k.spine(bend=-32, weights=[1.2, 1.2, 1, 0.9, 0.8]); k.neck(bend=-30)
    k.ground()


def sun_cobra(k):
    cobra(k); _plant_hands(k); k.ground()


def downdog(k):
    a = 50   # her back and arms make one line, 50 degrees below level
    k.body((0, 0, 0.04 + 0.817 * math.sin(D(a))), rot=(90 + a, 0, 0))
    k.neck(bend=14)
    for s in LR:
        k.shrug(s, 10)
        sh = k.sh(s); line = k.axis((0, 0, 1))
        k.arm(s, sh + line * 0.43, elbow=sh + V((SX[s] * 0.3, -0.2, 0.3)), palm=-UP, fingers=FWD)
        hp = k.hip(s)
        k.leg(s, (SX[s] * 0.1, hp.y + 0.44, 0.066), knee=(SX[s] * 0.1, hp.y - 0.6, 0.5))
    k.shape('LR', 'floor')
    _plant_hands(k); k.ground()


# ---------- kneeling ----------
def child(k):
    """Sitting back on her heels (her hips just above them, as far as her knees fold), her back rounding down over her
    thighs so her forehead rests on the mat, arms long in front. The turn and the rounding are the pair that puts her
    forehead on the mat with her hips there."""
    hip, rot = V((0, 0.29, 0.21)), 72
    k.body((0, 0.2, 0.3), rot=(rot, 0, 0)); k.body(V((0, 0.2, 0.3)) + hip - (k.hip('L') + k.hip('R')) / 2, rot=(rot, 0, 0))
    k.spine(bend=34); k.neck(bend=6)
    for s in LR:
        k.leg(s, (SX[s] * 0.08, 0.35, 0.065), knee=(SX[s] * 0.1, -0.8, -0.4), toes=(0, 0.97, -0.24), sole=(0, 0.24, 0.97))
        k.shrug(s, 8)
        floor_arm(k, s, (SX[s] * 0.12, -1), bend=8)
    k.shape('LR', 'floor')
    k.ground()


def kneel(k):
    k.body((0, -0.02, 0.43))
    for s in LR:
        k.leg(s, (SX[s] * 0.09, 0.35, 0.065), knee=(SX[s] * 0.09, -0.7, -0.1), toes=(0, 0.97, -0.24), sole=(0, 0.24, 0.97))
        k.point(s, (SX[s] * 0.15, 0.02, -1), bend=10); k.relax(s, (-SX[s], 0.2, 0))
    k.ground()


def camel(k):
    kneel(k)
    pz = (k.rig.matrix_world @ k.P0).z
    # "push your hips forward and lean back a little": her hips go forward of her knees, her upper back opens and her head
    # follows it, not dropping back
    k.body((0, -0.12, pz - 0.012))
    k.spine(bend=-24, weights=[0.8, 1, 1.1, 1.2, 1.2]); k.neck(bend=-4)
    for s in LR:
        hp = k.hip(s)
        k.arm(s, hp + V((SX[s] * 0.07, 0.13, 0.1)), elbow=(SX[s] * 0.3, 0.75, 0.7), palm=FWD, fingers=(0, 0.1, -1))
    k.shape('LR', 'flat')
    k.ground()


def locust0(k):
    prone(k, arms='sides')


def locust(k):
    prone(k, arms='sides')
    f = k.T['footR'].location
    k.leg('R', (f.x, f.y, 0.3), knee=(f.x, f.y - 0.4, -0.8))
    k.ground()


# ---------- lying on her back (side) ----------
def supine(k, pelvis_z=0.11):
    k.body((0, 0, pelvis_z), rot=(-90, 0, 0))


def bridgedown(k):
    supine(k)
    for s in LR:
        k.leg(s, (SX[s] * 0.1, -0.42, 0.066), knee=(SX[s] * 0.1, -0.3, 1.0))
        floor_arm(k, s, (SX[s] * 0.15, -1), bend=30)   # arms beside her, palms down; soft elbows, so they never lock as her hips lift
    k.shape('LR', 'floor')
    k.ground()


def bridge(k):
    bridgedown(k)
    k.body((0, -0.02, 0.36), rot=(-122, 0, 0)); k.neck(bend=30)
    k.ground()


def _knees(k, roll=0.0):
    """Knees drawn in over her chest, shins level, hands holding just below the knees; roll rocks her gently to a side."""
    supine(k)
    for s in LR:
        k.leg(s, (SX[s] * 0.1, -0.1, 0.33), knee=(SX[s] * 0.1, 0.25, 1.6))
    for s in LR:
        kn = k.at('lowerleg01.' + s)
        k.arm(s, kn + V((SX[s] * 0.06, -0.07, 0.02)), elbow=(SX[s] * 0.6, 0.45, 0.25))
        k.relax(s, (-SX[s] * 0.3, 0, -1))         # palms over her shins
    k.shape('LR', 'hold')
    k.neck(bend=12)
    if roll:
        k.turn((0, 1, 0), roll, k.rig.matrix_world @ k.P0)
    k.ground()


def knees(k):
    _knees(k)


def knees2(k):
    _knees(k, 14)


def knees3(k):
    _knees(k, -14)


def rest(k, breath=0.0):
    supine(k)
    if breath:
        _inhale(k, breath, lying=True)
    for s in LR:
        ank = k.rig.matrix_world @ k.rig.data.bones['lowerleg02.' + s].tail_local
        k.leg(s, (SX[s] * 0.19, ank.y, 0.08), knee=(SX[s] * 0.3, ank.y + 0.3, 1.0), toes=(SX[s] * 0.55, -0.7, 0.45), sole=(SX[s] * 0.3, -0.6, -0.75))
        floor_arm(k, s, (SX[s] * 0.5, -0.87), palm=UP, h=0.025)   # arms a little out from her sides, palms up
    k.eyes_closed()
    k.ground()


# ---------- sitting ----------
def seated(k, lean=0.0):
    k.body((0, 0, 0.125), rot=(lean, 0, 0))


def sitlong(k):
    seated(k)
    for s in LR:
        k.leg(s, (SX[s] * 0.1, -0.74, 0.075), knee=(SX[s] * 0.1, -0.4, 1.0), toes=(0, -0.35, 0.94), sole=(0, -0.94, -0.35))
    for s in LR:
        thigh_hand(k, s)
    k.shape('LR', 'floor')
    k.ground()


def twist(k):
    seated(k)
    k.leg('L', (0.1, -0.74, 0.075), knee=(0.1, -0.4, 1.0), toes=(0, -0.35, 0.94), sole=(0, -0.94, -0.35))
    k.leg('R', (-0.1, -0.33, 0.066), knee=(-0.12, -0.3, 1.0))
    k.spine(twist=-34); k.neck(twist=-24)
    # her left arm hugs the bent right knee; her right fingertips rest on the floor behind her
    k.arm('L', (-0.19, -0.24, 0.36), elbow=(0.2, -0.6, 0.4)); k.relax('L', (1, 0, 0))
    sh = k.sh('R'); L = k.bent(8); back = 0.17
    k.arm('R', (sh.x - 0.03, sh.y + back, sh.z - math.sqrt(max(0.0, L * L - back * back - 0.03 ** 2))),
          elbow=sh + V((-0.4, 0.3, 0)), palm=(0, 1, 0), fingers=(0, 0.25, -1))
    k.shape('L', 'hold'); k.shape('R', 'floor')
    k.ground()


def _butterfly(k, up):
    """Bhadrasana: the soles pressed together on their outer edges, heels drawn in, knees dropping out to her sides. She sits
    tall, hinged a little forward from her hips, and her hands rest over her feet with her fingers round her toes. up lifts
    her knees (0 to 1); her seat, feet and hands stay where they are, so only her knees move."""
    seated(k, lean=12)
    k.spine(bend=-8); k.neck(bend=-4)
    for s in LR:
        k.rot('clavicle.' + s, (0, 0, 1), -SX[s] * 14); k.shrug(s, -6)   # her shoulders reach forward and down to her feet
        # the sole faces her other foot and the foot points ahead (the foot bone runs 24 degrees from the sole, as in Kit.flat)
        n = V((-SX[s], 0, 0))
        k.leg(s, (SX[s] * 0.068, -0.22, 0.085), knee=(SX[s] * 0.9, -0.15, 0.05), toes=0.91 * FWD + 0.41 * n, sole=-0.41 * FWD + 0.91 * n)
    for s in LR:
        # her wrist above her instep, behind the big toe's base, as near as her arm reaches with the elbow soft; her hand
        # slopes down over the ball of her foot
        sh = k.sh(s); d = k.at('toe1-1.' + s) + V((0, 0.09, 0.04)) - sh
        k.arm(s, sh + d.normalized() * min(d.length, k.bent(14)), elbow=(SX[s] * 0.6, -0.1, 0.3), palm=-UP,
              fingers=(-SX[s] * 0.15, -0.85, -0.5))
    k.shape('LR', 'cup')
    k.ground()
    for s in LR:
        k.T['knee' + s].location.z += 0.4 * up


def butterfly(k):
    _butterfly(k, 0)


def butterfly2(k):
    _butterfly(k, 1)


def sit(k, breath=0.0):
    seated(k)
    if breath:
        _inhale(k, breath)
    k.leg('L', (-0.13, -0.25, 0.07), knee=(0.9, -0.3, 0.15), toes=(-0.9, -0.2, -0.3), sole=(0, 0.55, 0.85))
    k.leg('R', (0.13, -0.18, 0.07), knee=(-0.9, -0.3, 0.15), toes=(0.9, -0.2, -0.3), sole=(0, 0.55, 0.85))
    for s in LR:
        kn = k.at('lowerleg01.' + s)     # the backs of her hands rest on her knees
        k.arm(s, kn + V((-SX[s] * 0.02, 0.0, 0.075)), elbow=(SX[s] * 0.6, 0.15, 0.6), palm=UP, fingers=(SX[s] * 0.3, -1, 0))
    k.shape('LR', 'mudra')
    k.eyes_closed()
    k.ground()


NOSE = V((0, -0.107, 0.004))   # her nose tip, from her head bone's base (measured on her face)


def nostril(k, breath=0.0, left=False):
    """Anulom vilom ("close your right nostril with your thumb"): sitting as she does to breathe, her right hand at her nose
    in Nasika mudra, the thumb at her right nostril and the ring finger at her left, the first two fingers folded; her left
    hand stays on her knee, her eyes closed. left (Version 39.69): the hand rolls a little to her left, so the ring finger
    closes her left nostril and the thumb comes off the right."""
    sit(k, breath)
    off, fg = (V((0.016, 0.0, 0.003)), (-0.05, 0.25, 1)) if left else (V((0, 0, 0)), (0.25, 0.25, 1))
    k.arm('R', k.at('head') + NOSE + V((-0.025, -0.065, -0.10)) + off, elbow=k.sh('R') + V((-0.09, -0.2, -0.12)), palm=(0, 1, 0),
          fingers=fg)
    k.shape('R', 'nasikaL' if left else 'nasika')


# ---------- strength (side, with props) ----------
def chairup(k):
    stand(k)
    for s in LR:
        k.point(s, (0, -1, -0.03), bend=4, palm=-UP)   # arms long and level in front of her
    k.shape('LR', 'flat')


def chair(k):
    stand(k, pelvis=(0, 0.27, 0.56), rot=(28, 0, 0))
    for s in LR:
        k.point(s, (0, -1, 0), bend=4, palm=-UP)
    k.shape('LR', 'flat')


def chairsit(k, breath=0.0):
    """Sitting tall on the chair, feet apart, hands on her thighs (the seated forward bend's start)."""
    k.body((0, 0.25, 0.555))
    if breath:
        _inhale(k, breath)
    for s in LR:
        k.leg(s, (SX[s] * 0.13, -0.08, 0.066), knee=(SX[s] * 0.15, -0.9, 0.5))
    for s in LR:
        thigh_hand(k, s)
    k.shape('LR', 'floor')


def chairfwd(k):
    """The knee-pain swap for child pose: "bend forward slowly with your arms hanging down"."""
    k.body((0, 0.25, 0.555), rot=(38, 0, 0))
    for s in LR:
        k.leg(s, (SX[s] * 0.13, -0.08, 0.066), knee=(SX[s] * 0.15, -0.9, 0.5))
    k.spine(bend=34); k.neck(bend=12)
    for s in LR:
        k.point(s, (SX[s] * 0.08, -0.1, -1), bend=10); k.relax(s, (-SX[s], 0.3, 0))   # arms hanging loose


WALL_Y = -0.80   # an arm's length and more from her feet, so the push-up leans and bends as its drawing does
WALL_HAND = WALL_Y + 0.055, 1.15   # her wrists: palms flat on the wall's face, a little below her shoulders


def _lean(k, deg):
    """Her body straight from heels to head, leaning forward about the ankles."""
    import mathutils
    ank = V((0, -0.03, 0.066)); R = mathutils.Matrix.Rotation(D(deg), 3, 'X')
    stand(k, pelvis=ank + R @ (k.P0 - ank), rot=(deg, 0, 0))


def wallout(k):
    """Wall push-ups, arms long: her body straight from her heels, leaning 16 degrees to her hands on the wall."""
    _lean(k, 16)
    for s in LR:
        sh = k.sh(s); k.arm(s, (SX[s] * 0.24, *WALL_HAND), elbow=(SX[s] * 0.5, sh.y, 0.9), palm=FWD, fingers=(SX[s] * 0.2, 0, 1))
    k.shape('LR', 'floor')


def wall(k):
    """In: her elbows bend out and down and her chest comes close to the wall, her body still straight (26 degrees)."""
    _lean(k, 26)
    for s in LR:
        sh = k.sh(s); k.arm(s, (SX[s] * 0.24, *WALL_HAND), elbow=(SX[s] * 0.6, sh.y + 0.05, 0.8), palm=FWD, fingers=(SX[s] * 0.2, 0, 1))
    k.shape('LR', 'floor')


STEP_FRONT, STEP_H = -0.26, 0.18


# "Hold the railing": a handrail sloping up beside the step on her left (from A behind her to B beyond the step)
RAIL_A, RAIL_B = (0.40, 0.25, 0.80), (0.40, -0.75, 1.23)


def _rail(k, y):
    """Her left hand on the railing where it passes y, gripping it from above."""
    a, b = V(RAIL_A), V(RAIL_B); p = a.lerp(b, (a.y - y) / (a.y - b.y))
    sh = k.sh('L')
    k.arm('L', p + V((-0.03, 0, 0.045)), elbow=sh + V((0.35, 0.3, -0.25)), palm=(0, 0, -1), fingers=(0.5, -0.85, 0))
    k.shape('L', 'hold')


def stepfloor(k):
    stand(k, feet=0.09)
    swing(k, 'R', 6, 18); _rail(k, -0.10)


def step(k):
    stand(k, feet=0.09, pelvis=(0, -0.09, 0.775))   # low enough that her back knee stays soft, her foot on the floor
    k.leg('R', (-0.09, STEP_FRONT - 0.14, STEP_H + 0.066), knee=(-0.09, -1.0, 0.7))
    swing(k, 'R', -12, 10); _rail(k, -0.16)


# step-ups, "step up onto a stair with one foot, then the other, and step down": where an ankle stands on the floor, on the
# step, and lifted clear of the step's edge on the way up or down
FLOOR_FOOT, STEP_FOOT, OVER = (-0.03, 0.066), (STEP_FRONT - 0.14, STEP_H + 0.066), (-0.20, 0.36)
STEPPING = ['steplift', 'stepon', 'stepup', 'stepoff', 'stepdown', 'stepoff2']


def _stepping(k, pelvis, R, L, rail, lead=None):
    """Her pelvis (from where it is when she stands), each ankle (depth, height) and where her left hand holds the railing;
    her right arm swings a little forward as her left leg moves, and back as her right leg does."""
    k.body(k.P0 + V(pelvis))
    for s, (y, z) in (('R', R), ('L', L)):
        k.leg(s, (SX[s] * 0.09, y, z), knee=(SX[s] * 0.09, y - 0.65, z + 0.42))
    swing(k, 'R', *((6, 18) if not lead else (16, 24) if lead == 'L' else (-10, 10)))
    _rail(k, rail)


def steplift(k):
    _stepping(k, (0, -0.03, -0.02), OVER, FLOOR_FOOT, -0.12, 'R')


def stepon(k):
    _stepping(k, (0, -0.30, 0.10), STEP_FOOT, OVER, -0.36, 'L')


def stepup(k):
    _stepping(k, (0, -0.37, STEP_H), STEP_FOOT, STEP_FOOT, -0.44)


def stepoff(k):
    _stepping(k, (0, -0.35, 0.12), OVER, STEP_FOOT, -0.40, 'R')


def stepdown(k):
    _stepping(k, (0, -0.22, -0.06), FLOOR_FOOT, STEP_FOOT, -0.18, 'R')


def stepoff2(k):
    _stepping(k, (0, -0.05, -0.02), FLOOR_FOOT, OVER, -0.12, 'L')


CALF_WALL_Y = -0.43


def _calfarms(k):
    for s in LR:
        k.arm(s, (SX[s] * 0.22, CALF_WALL_Y + 0.055, 1.12), elbow=(SX[s] * 0.5, 0.1, 0.8), palm=FWD, fingers=(0, 0, 1))   # palms on the wall's face
    k.shape('LR', 'floor')


def calfdown(k):
    stand(k, feet=0.09); k.ground(); _calfarms(k)


def calf(k):
    """Up on her toes: the heels lift, the balls of her feet and her toes stay on the floor, her hands stay on the wall."""
    stand(k, feet=0.09, pelvis=(0, -0.05, 0.875))
    for s in LR:
        k.leg(s, (SX[s] * 0.09, -0.012, 0.15), knee=(SX[s] * 0.09, -0.7, 0.5))
        k.flat(s, pitch=36); k.toes(s, 55)   # the toes bend flat on the floor
    k.ground(); _calfarms(k)


# ---------- pregnancy yoga (Version 39.54; Mohit, 2 Nov: "pregnancy yoga doesnt have 3d model") ----------
# mods/plan.js R.preg1 to R.preg3, posed on her usual figure for the first three months and on her with a bump (char.py's
# FIG_BUMP) for the middle and last three: nothing on her back after 13 weeks and nothing on her tummy, no twist, no rising on
# the toes, balance at a wall. The drawings' new positions are P's seat, seatmarch, allfours, rockback, cat, cow, sidelie,
# sidedown, sideleg and leanfwd.
def palm(k):
    """Tadasana in pregnancy: "Feet a little apart and flat on the floor. Raise your arms, stretch up": never on her toes."""
    armsup(k)


SIDE_WALL_X = -0.60   # a wall at her right side, for the tree at a wall


def treewall(k):
    """Vrikshasana at a wall, "One hand on a wall. Rest one foot on your other ankle or calf, never on the knee": her right
    hand flat on the wall at her side, a little below her shoulder; her left foot on the inside of her right calf; her left
    hand on her hip."""
    k.body((-0.035, -0.022, 0.791))
    k.leg('R', (-0.075, -0.03, 0.066), knee=(-0.08, -0.7, 0.45))
    k.leg('L', (-0.035, -0.0, 0.30), knee=(0.75, -0.2, 0.55), toes=(-0.1, -0.15, -1), sole=(-1, 0, 0))
    sh = k.sh('R')
    k.arm('R', (SIDE_WALL_X + 0.035, sh.y - 0.02, sh.z - 0.06), elbow=sh + V((-0.2, 0.35, -0.35)), palm=(-1, 0, 0), fingers=(0, -0.15, 1))
    k.shape('R', 'flat')
    hp = k.hip('L')
    k.arm('L', hp + V((0.075, -0.01, 0.13)), elbow=k.sh('L') + V((0.45, 0.25, -0.2)), palm=(-1, 0.1, 0), fingers=(0, -0.45, -0.89))
    k.shape('L', 'flat')


# on her hands and knees: her knees on the mat under her hips (TABLE_KNEE, their joints), her shins and the tops of her feet
# along the mat behind them, her hands flat under her shoulders
TABLE_KNEE = (0.08, 0.075)


def _legs(k):
    """Her thighs and shins: (thigh, shin) from her hip joint to her knee, and her knee to her ankle."""
    t = (k.rest('lowerleg01.L') - k.rest('upperleg01.L')).length; sh = (k.rest('lowerleg02.L', 'tail') - k.rest('lowerleg01.L')).length
    return t, sh


def _place_hips(k, hip, rot):
    """Turns her body by rot (degrees about X) and moves it so the point between her hip joints is at hip."""
    k.body(V((0, 0, 0.5)), rot=(rot, 0, 0)); k.body(V((0, 0, 0.5)) + V(hip) - (k.hip('L') + k.hip('R')) / 2, rot=(rot, 0, 0))


def _table(k, rot=76.0, rock=0.0, bend=0.0, neck=-8.0, weights=None):
    """rock: how far her thighs lean back from straight down (degrees), her knees staying on the mat, so her hips go back
    towards her heels; rot: her body's pitch (90 level); bend: her back rounding up (+) or dipping (-); neck: her head lifting
    (-) or dropping (+). Her hands stay where they were with her thighs straight down and her back level, under her
    shoulders."""
    t, shin = _legs(k); ky, kz = TABLE_KNEE
    _place_hips(k, (0, ky, kz + t), 76.0)
    hands = {s: V((SX[s] * 0.19, k.sh(s).y - 0.02, FLOOR_W)) for s in LR}
    _place_hips(k, (0, ky + t * math.sin(D(rock)), kz + t * math.cos(D(rock))), rot)
    if bend:
        k.spine(bend=bend, weights=weights or [0.7, 1, 1.25, 1.25, 1])
    k.neck(bend=neck)
    for s in LR:
        k.leg(s, (SX[s] * 0.09, ky + shin, 0.065), knee=(SX[s] * 0.1, ky - 0.6, -0.4), toes=(0, 0.97, -0.24), sole=(0, 0.24, 0.97))
        sh = k.sh(s)
        k.arm(s, hands[s], elbow=sh + V((SX[s] * 0.35, 0.45, 0.1)), palm=-UP, fingers=FWD)
    k.shape('LR', 'floor')


def allfours(k):
    """"On hands and knees with your back flat": her thighs straight down, her back level, looking at the mat a little ahead."""
    _table(k)


def rockback(k):
    """Rocking back: her hips go back towards her heels, her hands and knees staying where they are."""
    _table(k, rot=66, rock=18, neck=-4)


def cat(k):
    """Marjariasana, "breathe out, round your back": her tailbone tucks, her back rounds up and her head drops between her
    arms, her hands and knees staying where they are."""
    _table(k, rot=62, bend=42, neck=18, weights=[0.5, 1, 1.4, 1.3, 1])


def cow(k):
    """"Breathe in, lift your head": her back lengthens and dips only a little ("don't let your back sag"), her head lifts."""
    _table(k, rot=84, bend=-10, neck=-26)


def rockfwd(k):
    """Rocking forward: her hips and shoulders go a little forward of her hands, her hands and knees staying where they are."""
    _table(k, rot=80, rock=-10, neck=-10)


def catsmall(k):
    """The first three months' cat, "Keep it small": the same breath, a gentler rounding."""
    _table(k, rot=68, bend=24, neck=12, weights=[0.5, 1, 1.4, 1.3, 1])


def cowsmall(k):
    _table(k, rot=80, bend=-5, neck=-16)


def childwide(k):
    """Shashankasana in pregnancy, "Knees wide apart, big toes together. Sit back towards your heels and stretch your arms
    forward": her knees open wide so her tummy has room between her thighs."""
    hip, rot = V((0, 0.30, 0.20)), 70
    _place_hips(k, hip, rot)
    k.spine(bend=30); k.neck(bend=8)
    for s in LR:
        k.leg(s, (SX[s] * 0.05, 0.38, 0.065), knee=(SX[s] * 1.0, -0.35, 0.06), toes=(-SX[s] * 0.25, 0.94, -0.24), sole=(-SX[s] * 0.1, 0.24, 0.97))
        k.shrug(s, 8)
        floor_arm(k, s, (SX[s] * 0.14, -1), bend=8)
    k.shape('LR', 'floor')
    k.ground()


# lying on her right side along the mat, facing you, her head to your left (as the drawings lie her)
def _sidebody(k, curl=6.0):
    k.body((0, 0, 0.2), rot=(0, -90, 0))
    k.spine(bend=curl); k.neck(side=-10, bend=6)   # her head rests down onto her arm


def _sideleg(k, s, hip, knee, out=0.0):
    """One leg, lying on her side, in her body's own frame: the hip bent forward by hip degrees, the knee by knee, and the
    whole leg lifted out to her side by out (up, for her top leg)."""
    t, shin = _legs(k); dn, fw, lf = k.axis((0, 0, -1)), k.axis((0, -1, 0)), k.axis((SX[s], 0, 0))
    def d(a):
        return (dn * math.cos(D(a)) + fw * math.sin(D(a))) * math.cos(D(out)) + lf * math.sin(D(out))
    kn = k.hip(s) + d(hip) * t; u = d(hip - knee)
    f = (fw - u * fw.dot(u)).normalized()
    k.leg(s, kn + u * shin, knee=kn + fw * 0.6, toes=0.91 * f + 0.41 * u, sole=-0.41 * f + 0.91 * u)


def _sidearms(k):
    """Her right arm along the mat past her head, her head resting on it; her left hand on the mat in front of her chest."""
    sh = k.sh('R')
    k.arm('R', (sh.x - 0.44, sh.y - 0.10, FLOOR_W + 0.01), elbow=sh + V((-0.2, 0.3, 0.3)), palm=-UP, fingers=(-1, -0.25, 0))
    sh = k.sh('L')
    k.arm('L', (sh.x + 0.04, sh.y - 0.34, FLOOR_W), elbow=sh + V((0.0, -0.1, 0.6)), palm=-UP, fingers=(-0.35, -1, 0))
    k.shape('LR', 'floor')


def sidelie(k, breath=0.0):
    """"Lie on your side, left or right, a pillow between your knees. Let your body go loose": her knees bent and stacked, the
    pillow between them (stage.PILLOW, placed from her knees), her eyes closed."""
    _sidebody(k, curl=12)
    if breath:
        _inhale(k, breath)
    _sideleg(k, 'R', 42, 78); _sideleg(k, 'L', 46, 82, out=-7)
    _sidearms(k); k.eyes_closed()
    k.ground()


def sidedown(k):
    """The side-lying leg lift, down: her underneath knee bent for balance, her top leg long, resting."""
    _sidebody(k)
    _sideleg(k, 'R', 28, 52); _sideleg(k, 'L', 6, 3, out=-11)
    _sidearms(k)
    k.ground()


def sideleg(k):
    """"Lift your top leg a little, keeping it straight": up about a quarter of the way, her foot relaxed."""
    _sidebody(k)
    _sideleg(k, 'R', 28, 52); _sideleg(k, 'L', 6, 3, out=17)
    _sidearms(k)
    k.ground()


def _seat(k):
    """Sitting tall on the chair, feet apart and flat, as chairsit."""
    k.body((0, 0.25, 0.555))
    for s in LR:
        k.leg(s, (SX[s] * 0.13, -0.08, 0.066), knee=(SX[s] * 0.15, -0.9, 0.5))


def _seatarms(k):
    """Marching while she sits: her elbows bent at her sides, her forearms forward and a little up, hands loose."""
    for s in LR:
        sh = k.sh(s)
        k.arm(s, sh + V((SX[s] * 0.03, -0.24, -0.17)), elbow=sh + V((SX[s] * 0.25, 0.45, -0.45)), palm=(-SX[s], 0, 0), fingers=(0, -1, 0.35))
    k.shape('LR', 'relaxed')


def _seatlift(k, s):
    """One knee up, its foot a hand's width off the floor."""
    k.leg(s, (SX[s] * 0.13, -0.17, 0.22), knee=(SX[s] * 0.15, -0.9, 0.95))


def seatmid(k):
    _seat(k); _seatarms(k)


def seatmarch(k):
    """"Sit tall on a chair ... then march, lifting your knees one by one": her right knee up."""
    _seat(k); _seatlift(k, 'R'); _seatarms(k)


def seatmarch2(k):
    _seat(k); _seatlift(k, 'L'); _seatarms(k)


def _leanwall(k, back=0.0, down=0.0, rot=34.0):
    """"Hands on a wall ..., lean forward a little and sway your hips": her hands flat on the wall at chest height, her arms
    long, her back long and leaning forward from her hips, her knees soft; back and down move her hips."""
    k.body(V((0, -0.02 + back, 0.86 - down)), rot=(rot, 0, 0))
    for s in LR:
        k.leg(s, (SX[s] * 0.13, 0.05, 0.066), knee=(SX[s] * 0.14, -0.7, 0.45))
    for s in LR:
        sh = k.sh(s)
        k.arm(s, (SX[s] * 0.21, WALL_Y + 0.055, 1.02), elbow=sh + V((SX[s] * 0.45, 0.1, -0.35)), palm=FWD, fingers=(SX[s] * 0.15, 0, 1))
    k.neck(bend=-6)
    k.shape('LR', 'floor')


def leanfwd(k):
    _leanwall(k)


def leanfwd2(k):
    """Her hips swaying back and a little down, her hands staying on the wall."""
    _leanwall(k, back=0.07, down=0.035, rot=40)


# lean and sway at a table (its words: "Hands on a wall or a table"), so the camera can stand in front of her and her hips'
# sway from side to side shows: the table's near edge is TABLE_NEAR in front of her, its top TABLE_TOP high
TABLE_NEAR, TABLE_TOP = -0.54, 0.84   # a kitchen counter's height, so she leans only a little


def _leantable(k, side=0.0, back=0.0, down=0.0, rot=44.0, roll=0.0):
    """"Hands on ... a table, lean forward a little and sway your hips slowly, side to side or in circles": her hands flat on
    the table, her arms long, her back long and leaning forward from her hips, her knees soft; side moves her hips to her left
    (-, her right), back moves them back, and roll lets her body follow them a little."""
    k.body(V((side, 0.10 + back, 0.86 - down)), rot=(rot, roll, 0))
    for s in LR:
        k.leg(s, (SX[s] * 0.15, 0.14, 0.066), knee=(SX[s] * 0.16, -0.7, 0.45))
        k.flat(s, yaw=SX[s] * 8)
    for s in LR:
        sh = k.sh(s)
        k.arm(s, (SX[s] * 0.22, TABLE_NEAR - 0.10, TABLE_TOP + FLOOR_W), elbow=sh + V((SX[s] * 0.45, 0.2, 0.1)), palm=-UP, fingers=(SX[s] * 0.1, -1, 0))
    k.neck(bend=-4)
    k.shape('LR', 'floor')


def leantable(k):
    _leantable(k)


def leanleft(k):
    _leantable(k, side=0.07, back=0.02, roll=-3)


def leanback(k):
    _leantable(k, back=0.06, down=0.03, rot=48)


def leanright(k):
    _leantable(k, side=-0.07, back=0.02, roll=3)


def leanfore(k):
    _leantable(k, back=-0.03, rot=41)


def seatshrug(k):
    """"Roll your shoulders": sitting tall, hands on her thighs, her shoulders lift towards her ears ..."""
    chairsit(k)
    for s in LR:
        k.shrug(s, 14)


def seatroll(k):
    """... then roll back and down."""
    chairsit(k)
    for s in LR:
        k.rot('clavicle.' + s, (0, 0, 1), SX[s] * 12); k.shrug(s, 5)


def chairupw(k):
    """Slow sit-to-stand in the last three months, "Feet wide apart": standing in front of the chair, toes turned out a little,
    arms long in front."""
    stand(k, feet=0.2)
    for s in LR:
        k.flat(s, yaw=SX[s] * 14)
        k.point(s, (0, -1, -0.03), bend=4, palm=-UP)
    k.shape('LR', 'flat')


def chairwide(k):
    """... sitting down slowly onto the chair, her knees over her wide feet."""
    stand(k, feet=0.2, pelvis=(0, 0.27, 0.56), rot=(28, 0, 0))
    for s in LR:
        k.flat(s, yaw=SX[s] * 14)
        k.point(s, (0, -1, 0), bend=4, palm=-UP)
    k.shape('LR', 'flat')


SHEET_H = 0.035   # a folded sheet under her seat


def _butterflytall(k, up):
    """Bhadrasana in pregnancy, "Sit tall on a folded sheet, the soles of your feet together and your knees out. Breathe
    slowly": her back upright on the sheet (stage 'sheet'), her hands resting on her knees and moving with them as they lift
    and drop a little."""
    k.body((0, 0.02, 0.125 + SHEET_H))
    for s in LR:
        n = V((-SX[s], 0, 0))
        k.leg(s, (SX[s] * 0.068, -0.22, 0.085), knee=(SX[s] * 0.9, -0.15, 0.05 + 0.3 * up), toes=0.91 * FWD + 0.41 * n, sole=-0.41 * FWD + 0.91 * n)
    k.upd()
    for s in LR:
        kn = k.at('lowerleg01.' + s); sh = k.sh(s)
        k.arm(s, kn + V((-SX[s] * 0.03, -0.01, 0.075)), elbow=sh + V((SX[s] * 0.45, 0.2, -0.15)), palm=-UP, fingers=unit((SX[s] * 0.5, -1, 0)))
    k.shape('LR', 'flat')


def butterflytall(k):
    _butterflytall(k, 0)


def butterflytall2(k):
    _butterflytall(k, 1)


def _butterflywall(k, up):
    """Bhadrasana with her back against a wall (stage.BACKWALL, placed behind her): sitting tall, soles together, knees out,
    her hands resting on her knees and moving with them."""
    seated(k, lean=-2)
    for s in LR:
        n = V((-SX[s], 0, 0))
        k.leg(s, (SX[s] * 0.068, -0.24, 0.085), knee=(SX[s] * 0.9, -0.15, 0.05 + 0.3 * up), toes=0.91 * FWD + 0.41 * n, sole=-0.41 * FWD + 0.91 * n)
    k.ground()
    for s in LR:
        kn = k.at('lowerleg01.' + s); sh = k.sh(s)
        k.arm(s, kn + V((-SX[s] * 0.03, -0.01, 0.075)), elbow=sh + V((SX[s] * 0.45, 0.2, -0.15)), palm=-UP, fingers=unit((SX[s] * 0.5, -1, 0)))
    k.shape('LR', 'flat')


def butterflywall(k):
    _butterflywall(k, 0)


def butterflywall2(k):
    _butterflywall(k, 1)


# ---------- Version 39.69: the moves that held still (Mohit, 5 Nov: "every exercise this 3d model should show how to move body
# part by actually showing hows its working"). Her breath in and out for the breathing and resting steps; coming into the held
# poses (a clip that plays once and holds, ONCE in mods/plan.js); Steady on your feet's two balance moves at a wall; the belly gap
# check after a birth; standing with her back near a wall for the pelvic floor trainer. ----------
def _inhale(k, a=1.0, lying=False):
    """A breath in, set before her arms so her hands stay where they rest: sitting or on her side, her chest lifts and opens and
    her shoulders rise a little; lying on her back, her chest rises from the mat while her head stays down."""
    if lying:
        k.spine(bend=2.4 * a, weights=[0, 0, 0.3, 1, 1]); k.neck(bend=-2.4 * a)
    else:
        k.spine(bend=-3.2 * a, weights=[0, 0, 0.4, 1, 1]); k.neck(bend=2.2 * a)
    for s in LR:
        k.shrug(s, 4.0 * a)


def sitin(k):
    sit(k, 1.0)


def restin(k):
    rest(k, 1.0)


def chairsitin(k):
    chairsit(k, 1.0)


def sideliein(k):
    sidelie(k, 1.0)


def nostrilin(k):
    nostril(k, 1.0)


def nostrilL(k):
    nostril(k, 0.0, True)


def nostrilLin(k):
    nostril(k, 1.0, True)


# coming into tree: her weight onto her right foot, her left foot up her leg to her calf, then her arms up
def treemid(k):
    k.body((-0.03, -0.022, 0.80))
    k.leg('R', (-0.075, -0.03, 0.066), knee=(-0.08, -0.7, 0.45))
    k.leg('L', (0.0, -0.025, 0.18), knee=(0.8, -0.35, 0.5), toes=(-0.05, -0.55, -0.83), sole=(-0.55, 0, -0.83))
    namaste(k)


def treefoot(k):
    k.body((-0.035, -0.022, 0.791))
    k.leg('R', (-0.075, -0.03, 0.066), knee=(-0.08, -0.7, 0.45))
    k.leg('L', (-0.035, -0.0, 0.34), knee=(0.75, -0.2, 0.55), toes=(-0.1, -0.15, -1), sole=(-1, 0, 0))
    namaste(k)


def _treewallarms(k):
    sh = k.sh('R')
    k.arm('R', (SIDE_WALL_X + 0.035, sh.y - 0.02, sh.z - 0.06), elbow=sh + V((-0.2, 0.35, -0.35)), palm=(-1, 0, 0), fingers=(0, -0.15, 1))
    k.shape('R', 'flat')
    hp = k.hip('L')
    k.arm('L', hp + V((0.075, -0.01, 0.13)), elbow=k.sh('L') + V((0.45, 0.25, -0.2)), palm=(-1, 0.1, 0), fingers=(0, -0.45, -0.89))
    k.shape('L', 'flat')


def treewall0(k):
    """Standing at the wall before the tree: her right hand on the wall, her left on her hip, both feet down."""
    k.body((-0.03, -0.022, 0.80))
    k.leg('R', (-0.075, -0.03, 0.066), knee=(-0.08, -0.7, 0.45)); k.leg('L', (0.045, -0.03, 0.066), knee=(0.05, -0.7, 0.45))
    _treewallarms(k)


def treewallmid(k):
    k.body((-0.033, -0.022, 0.795))
    k.leg('R', (-0.075, -0.03, 0.066), knee=(-0.08, -0.7, 0.45))
    k.leg('L', (0.0, -0.025, 0.16), knee=(0.6, -0.45, 0.5), toes=(-0.05, -0.55, -0.83), sole=(-0.55, 0, -0.83))
    _treewallarms(k)


# coming into child pose: kneeling up, sitting back on her heels, then folding forward with her arms long on the mat
def _heelslegs(k, wide=False):
    for s in LR:
        if wide:
            k.leg(s, (SX[s] * 0.05, 0.38, 0.065), knee=(SX[s] * 1.0, -0.35, 0.06), toes=(-SX[s] * 0.25, 0.94, -0.24), sole=(-SX[s] * 0.1, 0.24, 0.97))
        else:
            k.leg(s, (SX[s] * 0.08, 0.35, 0.065), knee=(SX[s] * 0.1, -0.8, -0.4), toes=(0, 0.97, -0.24), sole=(0, 0.24, 0.97))


def _heelsit(k, wide):
    _place_hips(k, (0, 0.31, 0.24), 0)
    _heelslegs(k, wide)
    for s in LR:
        thigh_hand(k, s, bend=14)
    k.shape('LR', 'floor')
    k.ground()


def heelsit(k):
    _heelsit(k, False)


def heelsitwide(k):
    _heelsit(k, True)


def _childmid(k, wide):
    _place_hips(k, (0, 0.30, 0.22), 38)
    k.spine(bend=16); k.neck(bend=4)
    _heelslegs(k, wide)
    for s in LR:
        floor_arm(k, s, (SX[s] * 0.12, -1), bend=22)
    k.shape('LR', 'floor')
    k.ground()


def childmid(k):
    _childmid(k, False)


def childwidemid(k):
    _childmid(k, True)


# Steady on your feet: "Stand side-on to a wall with one hand on it. Lift one foot a little off the floor and hold"
def _wallside(k, lift):
    stand(k, feet=0.09); k.shift((-0.05, 0, 0))
    if lift:
        k.body(k.P0 + V((-0.085, 0, -0.004)))
        k.leg('L', (0.035, -0.11, 0.235), knee=(0.05, -0.8, 0.75))   # her left foot a hand's width off the floor, its knee forward
    sh = k.sh('R')
    k.arm('R', (SIDE_WALL_X + 0.035, sh.y - 0.02, sh.z - 0.06), elbow=sh + V((-0.2, 0.35, -0.35)), palm=(-1, 0, 0), fingers=(0, -0.15, 1))
    k.shape('R', 'flat')
    k.point('L', (0.12, 0.02, -1), bend=8); k.relax('L', (-1, 0.2, 0))
    k.ground()


def wallside(k):
    _wallside(k, False)


def legwall(k):
    _wallside(k, True)


# "Walk slowly along a wall with one hand on it, one foot right in front of the other, heel to toe": on the spot, as the walk is
# filmed, each foot coming through to land just in front of the other's toes, her left hand on the wall at her left
LEFT_WALL_X = 0.42


def _tandem(k, front, mid):
    stand(k, feet=0.0)
    back = 'L' if front == 'R' else 'R'
    if mid:   # the back foot comes through, lifted a little and just outside the standing one
        k.body(k.P0 + V((0.012 * SX[front], 0, 0.004)))
        k.leg(front, (0.0, 0.0, 0.066), knee=(SX[front] * 0.05, -0.7, 0.45))
        k.leg(back, (SX[back] * 0.045, -0.005, 0.115), knee=(SX[back] * 0.05, -0.8, 0.55))
    else:
        k.leg(front, (0.0, -0.125, 0.066), knee=(SX[front] * 0.05, -0.7, 0.45))
        k.leg(back, (0.0, 0.125, 0.066), knee=(SX[back] * 0.05, -0.7, 0.45))
    sh = k.sh('L')
    k.arm('L', (LEFT_WALL_X - 0.035, sh.y - 0.27, sh.z - 0.1), elbow=sh + V((0.3, 0.15, -0.4)), palm=(1, 0, 0), fingers=(0, -0.35, 1))   # on the wall a little ahead of her
    k.shape('L', 'flat')
    k.point('R', (-0.1, 0.03, -1), bend=10); k.relax('R', (1, 0.2, 0))
    k.ground()


def tandem(k):     # left foot in front: the step's still
    _tandem(k, 'L', False)


def tandemmid(k):  # her right foot coming through
    _tandem(k, 'L', True)


def tandem2(k):    # right foot in front
    _tandem(k, 'R', False)


def tandemmid2(k):  # her left foot coming through
    _tandem(k, 'R', True)


# the belly gap check after a birth: on her back, knees bent; her right hand's fingertips at her belly button; then her head and
# shoulders lift a little and she looks down at her tummy
def _gap(k, up):
    supine(k)
    for s in LR:
        k.leg(s, (SX[s] * 0.1, -0.42, 0.066), knee=(SX[s] * 0.1, -0.3, 1.0))
    if up:
        k.spine(bend=12, weights=[0, 0, 0.2, 1, 1]); k.neck(bend=24)
    nav = (k.at('spine04') + k.at('spine03')) / 2
    k.arm('R', V((-0.075, nav.y + 0.02, nav.z + 0.12)), elbow=k.sh('R') + V((-0.3, -0.1, 0.25)), palm=-UP, fingers=(0.85, 0.0, -0.5))
    k.shape('R', 'tips')
    floor_arm(k, 'L', (0.15, -1), bend=30); k.shape('L', 'floor')
    k.ground()


def gapdown(k):
    _gap(k, False)


def gapup(k):
    _gap(k, True)


def pfstand(k):
    """The pelvic floor trainer's standing level, "standing, your back near a wall": tall, her arms by her sides, the wall a hand's
    width behind her (placed from her pose, after_props)."""
    stand(k, feet=0.09)
    for s in LR:
        k.point(s, (SX[s] * 0.12, 0.03, -1), bend=8); k.relax(s, (-SX[s], 0.2, 0))
    k.ground()



POSES = {n: f for n, f in globals().items() if callable(f) and not n.startswith('_') and n not in (
    'stand', 'arms_side', 'namaste', 'overhead', 'supine', 'seated', 'unit', 'D', 'V', 'Vector', 'sun_cobra', 'swing', 'floor_arm',
    'thigh_hand')}
POSES['sun_cobra'] = sun_cobra


def _breathed(base, lying):
    def f(k):
        base(k); _inhale(k, 1.0, lying)
    return f


# Version 39.69: her breath in on a held pose (her hands and feet stay where the pose put them); folded over in child pose her back
# rises as she breathes in, as it does lying on her back
for _n, _lying in (('tree', False), ('treewall', False), ('child', True), ('childwide', True), ('legwall', False), ('bridgedown', True),
                   ('pfstand', False), ('prays', False)):
    POSES[_n + 'in'] = _breathed(POSES[_n], _lying)

# Loosen up is filmed from her side, where its arm circle reads as forward, up, back and down, and its shoulder roll shows
FRONT = {'pray', 'opens', 'armsup', 'tiptoe', 'tree', 'triangle', 'wide', 'butterfly', 'butterfly2', 'sit', 'nostril',
         'palm', 'treewall', 'butterflytall', 'butterflytall2'}
FRONT |= {'treemid', 'treefoot', 'treein', 'treewall0', 'treewallmid', 'treewallin', 'sitin', 'nostrilin', 'nostrilL', 'nostrilLin', 'praysin'}   # Version 39.69
# Steady's one-leg stand from her left and a little in front (stage.VIEWS 'front3ql'): the wall at her right side shows behind her,
# and so does her lifted foot
FRONT3QL = {'wallside', 'legwall', 'legwallin'}
# Anulom vilom close up, from her head to her chest (CLOSE: the frame's half width and height, metres), so her hand shows
CLOSE = {n: (0.27, 0.44) for n in ('nostril', 'nostrilin', 'nostrilL', 'nostrilLin')}
# against a wall she is seen a little from her right, so the wall at her back shows (stage.VIEWS 'front3q')
FRONT3Q = {'butterflywall', 'butterflywall2'}
# the wide sit-to-stand too, so her wide feet show
FRONT3Q |= {'chairupw', 'chairwide'}
# Version 39.69: heel to toe along a wall at her left, from her right and in front, so her hand on the wall and the wall itself show
FRONT3Q |= {'tandem', 'tandemmid', 'tandem2', 'tandemmid2'}
# lean and sway at a table from her right side and a little behind (stage.VIEWS 'sideback'): her profile and bump show, and her
# hips' circle reads as one, where straight from the side only its forward and back would show (and from in front the table
# and her own body hide her hips)
LEANV = {'leantable', 'leanleft', 'leanback', 'leanright', 'leanfore'}
# child pose with her knees wide, from behind her and to one side (stage.VIEWS 'backq'): her wide knees and her hips back towards
# her heels show
BACKQ = {'childwide', 'heelsitwide', 'childwidemid', 'childwidein'}
# lying on her side she faces you, along the mat, seen from a little above (stage.VIEWS 'lie')
LIE = {'sidelie', 'sidedown', 'sideleg', 'sideliein'}
# knees to chest rocks from side to side, across her body, so it is filmed three-quarters from her feet (stage.VIEWS)
QUARTER = {'knees', 'knees2', 'knees3'}
PROPS = {'chair': 'chair', 'chairup': 'chair', 'chairsit': 'chair', 'chairfwd': 'chair', 'wall': 'wall', 'wallout': 'wall', 'stepfloor': 'step', 'step': 'step',
         'calfdown': 'calfwall', 'calf': 'calfwall', **{n: 'step' for n in STEPPING},
         'treewall': 'sidewall', 'leanfwd': 'wall', 'leanfwd2': 'wall', 'seatmid': 'chair', 'seatmarch': 'chair', 'seatmarch2': 'chair',
         'butterflywall': 'backwall', 'butterflywall2': 'backwall', 'sidelie': 'pillow', 'butterflytall': 'sheet', 'butterflytall2': 'sheet',
         **{n: 'table' for n in ('leantable', 'leanleft', 'leanback', 'leanright', 'leanfore')},
         **{n: 'chair' for n in ('chairupw', 'chairwide', 'seatshrug', 'seatroll')},
         # Version 39.69
         'treewall0': 'sidewall', 'treewallmid': 'sidewall', 'treewallin': 'sidewall', 'wallside': 'sidewall', 'legwall': 'sidewall', 'legwallin': 'sidewall',
         'chairsitin': 'chair', 'sideliein': 'pillow', 'pfstandin': 'nearwall',
         **{n: 'leftwall' for n in ('tandem', 'tandemmid', 'tandem2', 'tandemmid2')}, 'pfstand': 'nearwall'}
NO_MAT = {'chair', 'chairup', 'chairsit', 'chairfwd', 'wall', 'wallout', 'stepfloor', 'step', 'calfdown', 'calf', 'walk', 'walk2',
          'leanfwd', 'leanfwd2', 'seatmid', 'seatmarch', 'seatmarch2', 'leantable', 'leanleft', 'leanback', 'leanright', 'leanfore',
          'chairupw', 'chairwide', 'seatshrug', 'seatroll'} | set(STEPPING)
NO_MAT |= {'chairsitin', 'wallside', 'legwall', 'legwallin', 'tandem', 'tandemmid', 'tandem2', 'tandemmid2', 'pfstand', 'pfstandin'}   # Version 39.69

# the app's loops: [from, to, seconds, hold]; locust starts from its own prone position (arms by her sides)
LOOPS = {
    # chair squats: "sit down slowly", a moment on the chair, then up without her hands
    'chair': {'dur': 4, 'seq': [(0, 'chairup'), (0.1, 'chairup'), (0.55, 'chair'), (0.7, 'chair'), (1.0, 'chairup')]},
    'wall': ('wallout', 'wall', 3, False),
    # bridge lifts: "lift your hips and lower them slowly"
    'bridge': {'dur': 5, 'seq': [(0, 'bridgedown'), (0.25, 'bridge'), (0.5, 'bridge'), (0.95, 'bridgedown'), (1.0, 'bridgedown')]}, 'cobra': ('prone', 'cobra', 5, True), 'locust': ('locust0', 'locust', 4, True),
    'camel': ('kneel', 'camel', 6, True),
    # heel raises: up, a moment on her toes, and "come down slowly"
    'calf': {'dur': 3, 'seq': [(0, 'calfdown'), (0.3, 'calf'), (0.45, 'calf'), (0.95, 'calfdown'), (1.0, 'calfdown')]},
    # step-ups: up with the right foot, then the left, down with the right, then the left; each foot lifts clear of the edge
    'step': {'dur': 4.8, 'seq': [(i / 8, n) for i, n in enumerate(['stepfloor', 'steplift', 'step'] + STEPPING[1:] + ['stepfloor'])]},
    # marching and walking put each foot down before the other lifts, so the loop never hops or glides
    'march': {'dur': 1.4, 'seq': [(0, 'march'), (0.25, 'marchmid'), (0.5, 'march2'), (0.75, 'marchmid'), (1.0, 'march')]},
    'walk': {'dur': 1.1, 'seq': [(0, 'walk'), (0.25, 'walkpass'), (0.5, 'walk2'), (0.75, 'walkpass2'), (1.0, 'walk')]},
    # palm tree: the arms open wide and go up the sides to meet overhead, she rises on her toes and holds, then comes down
    'armsup': {'dur': 8, 'seq': [(0, 'pray'), (0.12, 'opens'), (0.25, 'armsup'), (0.34, 'tiptoe'), (0.62, 'tiptoe'), (0.72, 'armsup'),
                                 (0.86, 'opens'), (1.0, 'pray')]},
    'triangle': ('wide', 'triangle', 6, True),
    # butterfly: "move your knees gently up and down", one slow flap in 2 seconds
    'butterfly': ('butterfly', 'butterfly2', 2, False), 'twist': ('sitlong', 'twist', 6, True), 'knees': {'dur': 4, 'seq': [(0, 'knees'), (0.25, 'knees2'), (0.5, 'knees'), (0.75, 'knees3'), (1.0, 'knees')]},
    # Loosen up, as its words go: "turn your head slowly side to side, roll your shoulders and swing your arms in big
    # circles": her head to the left and the right, one shoulder roll, then one slow arm circle
    'warmup': {'dur': 8, 'seq': [(0, 'loose'), (0.07, 'lookl'), (0.17, 'lookl'), (0.3, 'lookr'), (0.4, 'lookr'), (0.47, 'loose'),
                                 (0.52, 'shoulderup'), (0.57, 'shoulderback'), (0.62, 'loose')] +
                                [(0.66 + 0.34 * i / 8, 'circle%d' % (45 * i)) for i in range(8)] + [(1.0, 'loose')]},
    'chairfwd': ('chairsit', 'chairfwd', 6, True),   # the app's "Seated forward bend" (child pose with knee pain)
    # pregnancy yoga (ANIM's timing): palm tree with her feet flat, arms up the sides to meet overhead, a breath there and down
    'palm': {'dur': 6, 'seq': [(0, 'pray'), (0.15, 'opens'), (0.3, 'armsup'), (0.7, 'armsup'), (0.85, 'opens'), (1.0, 'pray')]},
    'cat': {'dur': 6, 'seq': [(0, 'cat'), (0.1, 'cat'), (0.5, 'cow'), (0.6, 'cow'), (1.0, 'cat')]},   # round out, lift in, slowly
    # the first three months' cat, "Keep it small"
    'catsmall': {'dur': 6, 'seq': [(0, 'catsmall'), (0.1, 'catsmall'), (0.5, 'cowsmall'), (0.6, 'cowsmall'), (1.0, 'catsmall')]},
    # "rock slowly forward and back": back towards her heels, through the middle, and a little forward of her hands
    'allfours': {'dur': 6, 'seq': [(0, 'allfours'), (0.25, 'rockback'), (0.5, 'allfours'), (0.75, 'rockfwd'), (1.0, 'allfours')]},
    'sideleg': ('sidedown', 'sideleg', 3, True),
    # "Roll your shoulders, then march, lifting your knees one by one": a shoulder roll with her hands on her thighs, then two
    # rounds of marching (each foot down before the other lifts, the march's 1.6 seconds a round), and her hands back down
    'seatmarch': {'dur': 6.4, 'seq': [(0, 'chairsit'), (0.08, 'seatshrug'), (0.16, 'seatroll'), (0.24, 'chairsit'), (0.3, 'seatmid')] +
                  [(0.3 + 0.0625 * i, n) for i, n in enumerate(['seatmid', 'seatmarch', 'seatmid', 'seatmarch2'] * 2 + ['seatmid'])][1:] +
                  [(0.9, 'chairsit'), (1.0, 'chairsit')]},
    # "sway your hips slowly, side to side or in circles": one slow circle, her hands on the table
    'leantable': {'dur': 5, 'seq': [(0, 'leanleft'), (0.25, 'leanback'), (0.5, 'leanright'), (0.75, 'leanfore'), (1.0, 'leanleft')]},
    # "Feet wide apart. Stand up from a chair slowly, then sit down slowly"
    'chairwide': {'dur': 4, 'seq': [(0, 'chairupw'), (0.1, 'chairupw'), (0.55, 'chairwide'), (0.7, 'chairwide'), (1.0, 'chairupw')]},
    'butterflywall': ('butterflywall', 'butterflywall2', 2, False),
    'butterflytall': ('butterflytall', 'butterflytall2', 2, False),
    # Version 39.69 (Mohit, 5 Nov: "i dont want any still picture all exercises model should be doing right moves"). A held pose is
    # two clips: coming into it (<name>-in, played once; once: True ends the clip on the pose) and then holding it, breathing (<name>,
    # looping), so the player never shows a still
    'tree-in': {'dur': 3.5, 'once': True, 'seq': [(0, 'pray'), (0.3, 'treemid'), (0.6, 'treefoot'), (1.0, 'tree')]},
    'tree': {'dur': 10, 'seq': [(0, 'tree'), (0.4, 'treein'), (1.0, 'tree')]},
    'treewall-in': {'dur': 3, 'once': True, 'seq': [(0, 'treewall0'), (0.4, 'treewallmid'), (1.0, 'treewall')]},
    'treewall': {'dur': 10, 'seq': [(0, 'treewall'), (0.4, 'treewallin'), (1.0, 'treewall')]},
    'child-in': {'dur': 4.5, 'once': True, 'seq': [(0, 'kneel'), (0.35, 'heelsit'), (0.7, 'childmid'), (1.0, 'child')]},
    'child': {'dur': 10, 'seq': [(0, 'child'), (0.4, 'childin'), (1.0, 'child')]},
    'childwide-in': {'dur': 4, 'once': True, 'seq': [(0, 'heelsitwide'), (0.15, 'heelsitwide'), (0.6, 'childwidemid'), (1.0, 'childwide')]},
    'childwide': {'dur': 10, 'seq': [(0, 'childwide'), (0.4, 'childwidein'), (1.0, 'childwide')]},
    'legwall-in': {'dur': 2.5, 'once': True, 'seq': [(0, 'wallside'), (0.25, 'wallside'), (1.0, 'legwall')]},
    'legwall': {'dur': 10, 'seq': [(0, 'legwall'), (0.4, 'legwallin'), (1.0, 'legwall')]},
    # the pelvic floor trainer's positions (mods/post.js PF_POSE): a squeeze can't be seen from outside, so she lies, sits or stands
    # still and breathes (her tummy, bottom and thighs don't move); walking is the walk
    'bridgedown': {'dur': 10, 'seq': [(0, 'bridgedown'), (0.4, 'bridgedownin'), (1.0, 'bridgedown')]},
    'pfstand': {'dur': 10, 'seq': [(0, 'pfstand'), (0.4, 'pfstandin'), (1.0, 'pfstand')]},
    # her breath, as the breathing steps count it: in for 4 seconds, out for 6
    'sit': {'dur': 10, 'seq': [(0, 'sit'), (0.4, 'sitin'), (1.0, 'sit')]},
    'rest': {'dur': 10, 'seq': [(0, 'rest'), (0.4, 'restin'), (1.0, 'rest')]},
    'sidelie': {'dur': 10, 'seq': [(0, 'sidelie'), (0.4, 'sideliein'), (1.0, 'sidelie')]},
    'chairsit': {'dur': 10, 'seq': [(0, 'chairsit'), (0.4, 'chairsitin'), (1.0, 'chairsit')]},
    # Anulom vilom, one round in 20 seconds: in through the left (her thumb on the right), the hand rolls to close the left, out
    # through the right; in through the right, the hand rolls back, out through the left
    'nostril': {'dur': 20, 'seq': [(0, 'nostril'), (0.2, 'nostrilin'), (0.23, 'nostrilLin'), (0.5, 'nostrilL'), (0.7, 'nostrilLin'), (0.73, 'nostrilin'),
                                   (1.0, 'nostril')]},
    # heel to toe along the wall, two steps
    'tandem': {'dur': 4, 'seq': [(0, 'tandem'), (0.25, 'tandemmid'), (0.5, 'tandem2'), (0.75, 'tandemmid2'), (1.0, 'tandem')]},
    # the belly gap check: her head and shoulders up, a moment to feel, and down
    'gapcheck': {'dur': 6, 'seq': [(0, 'gapdown'), (0.3, 'gapup'), (0.75, 'gapup'), (1.0, 'gapdown')]},
}
# Version 39.69: the regular set's new loops (render-all.sh renders them with the rest)
NEW_LOOPS = ['tree-in', 'tree', 'child-in', 'child', 'legwall-in', 'legwall', 'sit', 'rest', 'chairsit', 'nostril', 'tandem', 'gapcheck', 'bridgedown', 'pfstand']
# the sun salutation flows from each position to the next (1.2 seconds). Her standing positions share one camera and her
# positions on the mat another, so she fills the frame in both; the flows down to the mat and back up carry the camera across.
SUN = ['prays', 'reach', 'fwdbend', 'lunge', 'plank', 'ashtanga', 'sun_cobra', 'downdog', 'lunge2', 'fwdbend', 'reach', 'prays']
SUN_VIEWS = [['prays', 'reach', 'fwdbend'], ['lunge', 'plank', 'ashtanga', 'sun_cobra', 'downdog', 'lunge2']]
# a flow's middle, where it is a position of its own
SUN_MID = {('reach', 'fwdbend'): 'dive', ('fwdbend', 'reach'): 'dive',
           ('sun_cobra', 'downdog'): 'plank'}   # her hips rise through a plank line before her head drops between her arms
# a looser frame where the camera would otherwise crop her
FRAME_MARGIN = {'fwdbend': 1.4}
# the drawing names, so every one of the app's 43 positions has its own still
DRAWINGS = ['pray', 'armsup', 'tree', 'triangle', 'wide', 'warmup', 'warmup2', 'march', 'march2', 'walk', 'walk2', 'prays', 'reach',
            'fwdbend', 'lunge', 'lunge2', 'plank', 'ashtanga', 'prone', 'cobra', 'downdog', 'child', 'kneel', 'camel', 'locust',
            'bridgedown', 'bridge', 'knees', 'knees2', 'rest', 'sitlong', 'twist', 'butterfly', 'butterfly2', 'sit', 'chairup', 'chair',
            'wallout', 'wall', 'stepfloor', 'step', 'calfdown', 'calf']
# positions the app has no drawing for, used by its steps all the same
EXTRA = ['chairsit', 'chairfwd', 'nostril', 'pfstand', 'legwall', 'tandem', 'gapup']   # Version 39.69: the last four
# pregnancy yoga, each body's stills and loops (render-preg.sh): her usual figure (b0) only for what the regular set lacks;
# the middle three months (b2) and the last three (b3) for every step of R.preg2 and R.preg3
PREG = {
    'b0': {'stills': ['palm', 'treewall', 'catsmall', 'childwide', 'butterflytall'], 'loops': ['palm', 'catsmall', 'butterflytall', 'treewall-in', 'treewall', 'childwide-in', 'childwide']},
    'b2': {'stills': ['warmup', 'palm', 'treewall', 'wall', 'chair', 'cat', 'butterflytall', 'sit', 'sideleg', 'sidelie'],
           'loops': ['warmup', 'palm', 'wall', 'chair', 'cat', 'butterflytall', 'sideleg', 'treewall-in', 'treewall', 'sit', 'sidelie']},
    'b3': {'stills': ['seatmarch', 'chairwide', 'chairsit', 'wall', 'leantable', 'allfours', 'butterflywall', 'sideleg', 'sidelie'],
           'loops': ['seatmarch', 'chairwide', 'wall', 'leantable', 'allfours', 'butterflywall', 'sideleg', 'chairsit', 'sidelie']},
}
