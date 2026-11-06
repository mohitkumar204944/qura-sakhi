# Copies the rendered moves into the app: python3 install.py <final dir> <web dir> [<pregnancy final dir>:<prefix> ...]
#   fig/v/<loop>.webm   each loop (moves.LOOPS) and each flow of the sun salutation (sun-01 .. sun-11); sun-00 her first position
#                       breathing (Version 39.69), and <pose>-in, coming into a held pose before its loop (Version 39.69)
#   fig/s/<pose>.webp   a still of every position (the app's 43 drawings and moves.EXTRA), and sun-00 .. sun-11, each sun
#                       salutation position framed as its flow is
#   fig/v/sunh-<pose>   each sun salutation position breathing after its flow (Version 39.69.2)
#   fig/t/<name>.webp   the lists' small moving pictures (thumbs.py, Version 39.69.2)
#   fig/fig.js          what is there, for the player (window.SAKHI_FIG)
# Pregnancy yoga's bodies (render-preg.sh, Version 39.54) come after, each with its prefix: <work>/preg/final-b0: (her usual
# figure's new positions), <work>/preg/final-b2:b2- and <work>/preg/final-b3:b3- (the middle and last three months).
# Run render-all.sh (or render.py) and encode.py first.
import glob, json, os, shutil, sys
from PIL import Image
sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import thumbs

FINAL, WEB = sys.argv[1], sys.argv[2]
EXTRA = [a.rsplit(':', 1) for a in sys.argv[3:]]
# moves.SUN, as the render names it (sun_cobra is the cobra on the sun salutation's planted hands)
SUN = ['prays', 'reach', 'fwdbend', 'lunge', 'plank', 'ashtanga', 'sun_cobra', 'downdog', 'lunge2', 'fwdbend', 'reach', 'prays']
OUT = os.path.join(WEB, 'fig')
shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(os.path.join(OUT, 's')); os.makedirs(os.path.join(OUT, 'v'))


def still(src, dst):
    Image.open(src).convert('RGB').save(dst, quality=82, method=6)


loops = []
for p in sorted(glob.glob(os.path.join(FINAL, 'video', '*.webm'))):
    name = os.path.basename(p)[:-5]
    shutil.copy(p, os.path.join(OUT, 'v', name + '.webm'))
    if not name.startswith('sun-'):
        loops.append(name)
stills = []
for p in sorted(glob.glob(os.path.join(FINAL, 'stills', '*.png'))):
    name = os.path.basename(p)[:-4]; still(p, os.path.join(OUT, 's', name + '.webp')); stills.append(name)
for i, pose in enumerate(SUN):
    still(os.path.join(FINAL, 'sun', 'sun-%s.png' % pose), os.path.join(OUT, 's', 'sun-%02d.webp' % i))
for d, pre in EXTRA:
    for p in sorted(glob.glob(os.path.join(d, 'video', '*.webm'))):
        name = pre + os.path.basename(p)[:-5]; shutil.copy(p, os.path.join(OUT, 'v', name + '.webm')); loops.append(name)
    for p in sorted(glob.glob(os.path.join(d, 'stills', '*.png'))):
        name = pre + os.path.basename(p)[:-4]; still(p, os.path.join(OUT, 's', name + '.webp')); stills.append(name)
loops.sort(); stills.sort()
sun = len([p for p in glob.glob(os.path.join(OUT, 'v', 'sun-*.webm')) if not p.endswith('sun-00.webm')])
man = {'v': 1, 'loops': loops, 'stills': stills, 'sun': sun}
if os.path.exists(os.path.join(OUT, 'v', 'sun-00.webm')):
    man['sun0'] = 1   # Version 39.69: the sun salutation's first position, breathing
with open(os.path.join(OUT, 'fig.js'), 'w') as f:
    f.write('/* The 3D figure\'s moves (Version 39.39), made by web/tools/fig3d/install.py from its renders: do not edit by hand.\n'
            '   loops: fig/v/<name>.webm, one per moving drawing; stills: fig/s/<pose>.webp; sun: fig/v/sun-01..NN.webm, the sun\n'
            '   salutation\'s flows, with fig/s/sun-00..NN.webp its positions; b2- and b3-: pregnancy yoga on her with a bump, the\n'
            '   middle and the last three months (Version 39.54); <pose>-in: coming into a held pose, played once before its loop; sun0:\n'
            '   fig/v/sun-00.webm, her first position breathing (Version 39.69); sunh-<pose>: a sun salutation position breathing after\n'
            '   its flow; thumbs: fig/t/<name>.webp, the lists\' small moving pictures (Version 39.69.2). */\n')
    f.write('window.SAKHI_FIG = ' + json.dumps(man) + ';\n')
with open(os.path.join(OUT, 'CREDITS.md'), 'w') as f:
    f.write('# The 3D figure\n\n'
            'Qura\'s own renders, made with Blender (GPL) and MPFB from MakeHuman\'s CC0 asset packs (makehuman_system_assets,\n'
            'hair01, shirts01, pants01, poses02 and faceunits01). CC0 needs no credit line. How they are made: web/tools/fig3d/README.md.\n')
thumbs.run(WEB)   # Version 39.69.2: the lists' moving pictures, from the clips just copied; it adds them to fig.js
total = sum(os.path.getsize(p) for p in glob.glob(os.path.join(OUT, '*', '*')))
print('loops', len(loops), 'stills', len(stills), 'sun', sun, 'MB %.2f' % (total / 1048576))
