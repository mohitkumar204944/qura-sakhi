# Copies the rendered moves into the app: python3 install.py <final dir> <web dir>
#   fig/v/<loop>.webm   each loop (moves.LOOPS) and each flow of the sun salutation (sun-01 .. sun-11)
#   fig/s/<pose>.webp   a still of every position (the app's 43 drawings and moves.EXTRA), and sun-00 .. sun-11, each sun
#                       salutation position framed as its flow is
#   fig/fig.js          what is there, for the player (window.SAKHI_FIG)
# Run render-all.sh (or render.py) and encode.py first.
import glob, json, os, shutil, sys
from PIL import Image

FINAL, WEB = sys.argv[1], sys.argv[2]
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
sun = len(glob.glob(os.path.join(OUT, 'v', 'sun-*.webm')))
man = {'v': 1, 'loops': loops, 'stills': stills, 'sun': sun}
with open(os.path.join(OUT, 'fig.js'), 'w') as f:
    f.write('/* The 3D figure\'s moves (Version 39.39), made by web/tools/fig3d/install.py from its renders: do not edit by hand.\n'
            '   loops: fig/v/<name>.webm, one per moving drawing; stills: fig/s/<pose>.webp; sun: fig/v/sun-01..NN.webm, the sun\n'
            '   salutation\'s flows, with fig/s/sun-00..NN.webp its positions. */\n')
    f.write('window.SAKHI_FIG = ' + json.dumps(man) + ';\n')
with open(os.path.join(OUT, 'CREDITS.md'), 'w') as f:
    f.write('# The 3D figure\n\n'
            'Qura\'s own renders, made with Blender (GPL) and MPFB from MakeHuman\'s CC0 asset packs (makehuman_system_assets,\n'
            'hair01, shirts01, pants01, poses02 and faceunits01). CC0 needs no credit line. How they are made: web/tools/fig3d/README.md.\n')
total = sum(os.path.getsize(p) for p in glob.glob(os.path.join(OUT, '*', '*')))
print('loops', len(loops), 'stills', len(stills), 'sun', sun, 'MB %.2f' % (total / 1048576))
