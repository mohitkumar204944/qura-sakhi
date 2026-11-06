# Turns render-all.sh's frames into videos and previews: python3 encode.py <final dir>
#   video/<loop>.webm  one seamless loop per move (VP9: plays in Android's WebView and in the tests' Chromium; about a third
#                      the size of the .mp4)
#   video/<loop>.mp4   the same as H.264, for sharing
#   video/sun-NN.mp4   each sun salutation flow; video/sun.mp4 all of them with a short hold on each position
#   video/sunh-<pose>  each sun salutation position breathing after its flow (Version 39.69.2)
# FIG_ONLY=a,b encodes only the loops and holds named (sunh-reach, say), and no flows
#   webp/*.webp        the same as small looping WebPs, for previews
#   stills-sheet.png   all 43 positions on one page
import glob, os, subprocess, sys
from PIL import Image, ImageDraw

D = sys.argv[1]; FPS = 24; PREVIEW = (400, 333)
ONLY = [n for n in os.environ.get('FIG_ONLY', '').split(',') if n]
os.makedirs(os.path.join(D, 'video'), exist_ok=True); os.makedirs(os.path.join(D, 'webp'), exist_ok=True)


def step_of(frames):
    """Version 39.69: a loop rendered every nth frame (FIG_STEP, for a slow breath) shows each frame for n frames' time, so it keeps
    its length; the step is read from the frames' numbers."""
    import re
    n = [int(re.search(r'-(\d+)\.png$', p).group(1)) for p in frames[:2]] if len(frames) > 1 else [1, 2]
    return max(1, n[1] - n[0])


def mp4(frames, out):
    lst = out + '.txt'; st = step_of(frames)
    with open(lst, 'w') as f:
        for p in frames:
            f.write("file '%s'\nduration %.6f\n" % (p, st / FPS))
        f.write("file '%s'\n" % frames[-1])
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-r', str(FPS), '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', out], check=True)
    os.remove(lst)


def webm(frames, out):
    lst = out + '.txt'; st = step_of(frames)
    with open(lst, 'w') as f:
        for p in frames:
            f.write("file '%s'\nduration %.6f\n" % (p, st / FPS))
        f.write("file '%s'\n" % frames[-1])
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-r', str(FPS), '-c:v', 'libvpx-vp9',
                    '-b:v', '0', '-crf', '28', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p', '-an', out], check=True)
    os.remove(lst)


def webp(frames, out):
    ims = [Image.open(p).convert('RGB').resize(PREVIEW, Image.LANCZOS) for p in frames]
    ims[0].save(out, save_all=True, append_images=ims[1:], duration=round(1000 * step_of(frames) / FPS), loop=0, quality=74, method=4)


for d in sorted(glob.glob(os.path.join(D, 'loops', '*'))):
    m = os.path.basename(d); fr = sorted(glob.glob(os.path.join(d, m + '-*.png')))
    if fr and (not ONLY or m in ONLY):
        mp4(fr, os.path.join(D, 'video', m + '.mp4')); webm(fr, os.path.join(D, 'video', m + '.webm'))
        webp(fr, os.path.join(D, 'webp', m + '.webp')); print('loop', m, len(fr))

for p in sorted(glob.glob(os.path.join(D, 'sun', 'sunh-*-0001.png'))):   # Version 39.69.2: each position breathing after its flow
    m = os.path.basename(p)[:-len('-0001.png')]; fr = sorted(glob.glob(os.path.join(D, 'sun', m + '-*.png')))
    if not ONLY or m in ONLY:
        mp4(fr, os.path.join(D, 'video', m + '.mp4')); webm(fr, os.path.join(D, 'video', m + '.webm')); print('hold', m, len(fr))

allsun = []
for i in range(0, 12 if not ONLY else 0):   # 0: her first position breathing (Version 39.69), a loop before the flows
    fr = sorted(glob.glob(os.path.join(D, 'sun', 'sun%02d-*.png' % i)))
    if fr:
        mp4(fr, os.path.join(D, 'video', 'sun-%02d.mp4' % i)); webm(fr, os.path.join(D, 'video', 'sun-%02d.webm' % i))
        if i:
            allsun += fr + [fr[-1]] * 18
if allsun:
    mp4(allsun, os.path.join(D, 'video', 'sun.mp4')); webp(allsun, os.path.join(D, 'webp', 'sun.webp')); print('sun', len(allsun))

st = sorted(glob.glob(os.path.join(D, 'stills', '*.png')))
if st and not ONLY:
    cols, tw, th = 6, 240, 200; rows = (len(st) + cols - 1) // cols
    sh = Image.new('RGB', (cols * tw, rows * (th + 16)), 'white'); dr = ImageDraw.Draw(sh)
    for i, p in enumerate(st):
        x, y = (i % cols) * tw, (i // cols) * (th + 16)
        sh.paste(Image.open(p).convert('RGB').resize((tw, th), Image.LANCZOS), (x, y)); dr.text((x + 4, y + th + 2), os.path.basename(p)[:-4], fill='black')
    sh.save(os.path.join(D, 'stills-sheet.png')); print('stills', len(st))
