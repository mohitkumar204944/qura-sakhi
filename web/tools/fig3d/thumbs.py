# The small moving pictures for the lists (Version 39.69.2; Mohit, 6 Nov: "Yes, all of them", after "are there anymore still
# pictures"): python3 thumbs.py <web dir> makes fig/t/<name>.webp from the app's own clips in fig/v and lists them in fig/fig.js
# (thumbs). install.py runs it too. Each is an animated WebP, so a page of moves shows every one moving without a video player each:
#   <move>     its loop;
#   <pose>     a held pose: coming in (<pose>-in), a moment of its hold, then back out, so it loops without a jump;
#   sun-00     the sun salutation's first position, breathing;
#   sun-01..11 each flow, a moment of the position's hold (sunh-<pose>) and back, for the sun salutation's list;
#   sun        the whole salutation, each flow and a moment of its hold, for its card on Moves and calm.
# Stills stay for "reduce motion" and for a picture that can't load.
import glob, json, os, shutil, subprocess, sys, tempfile
from PIL import Image

SIZE = (216, 180)   # twice the rest screen's card (108 px wide); the lists show them smaller
MOVE_FPS, BREATH_FPS = 12, 8   # a slow breath (a clip of 6 seconds or more) changes little from frame to frame
# the sun salutation's positions by the app's names (mods/plan.js SUN; sun_cobra is its cobra)
SUN = ['prays', 'reach', 'fwdbend', 'lunge', 'plank', 'ashtanga', 'cobra', 'downdog', 'lunge2', 'fwdbend', 'reach', 'prays']


def length(clip):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', clip], capture_output=True, text=True, check=True)
    return float(out.stdout.strip())


def frames(clip, fps):
    """The clip's frames at fps, at SIZE."""
    d = tempfile.mkdtemp()
    try:
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', clip, '-vf', 'fps=%g,scale=%d:%d:flags=lanczos' % (fps, SIZE[0], SIZE[1]),
                        os.path.join(d, 'f%04d.png')], check=True)
        return [Image.open(p).convert('RGB') for p in sorted(glob.glob(os.path.join(d, 'f*.png')))]
    finally:
        shutil.rmtree(d)


def save(parts, out):
    """parts: (frames, ms each). One looping WebP."""
    ims, ms = [], []
    for fr, d in parts:
        ims += fr; ms += [d] * len(fr)
    ims[0].save(out, save_all=True, append_images=ims[1:], duration=ms, loop=0, quality=62, method=6)


def there_and_back(v, into, hold, hold_s=1.2):
    """Into a position (a clip played once), a moment of its hold, and back out the way she came."""
    a = frames(os.path.join(v, into + '.webm'), MOVE_FPS)
    h = frames(os.path.join(v, hold + '.webm'), BREATH_FPS)[:max(1, round(hold_s * BREATH_FPS))] if hold else []
    return [(a, round(1000 / MOVE_FPS)), (h, round(1000 / BREATH_FPS)), (a[::-1][1:], round(1000 / MOVE_FPS)), ([a[0]], 300)]


def run(web):
    """A picture is made again only when a clip it comes from is newer (FIG_THUMBS_ALL=1 makes them all); pictures of clips that
    have gone are removed."""
    fig = os.path.join(web, 'fig'); v = os.path.join(fig, 'v'); t = os.path.join(fig, 't')
    os.makedirs(t, exist_ok=True)
    js = os.path.join(fig, 'fig.js'); txt = open(js).read()
    man = json.loads(txt[txt.index('{'):txt.rindex('}') + 1]); loops = set(man['loops'])
    made = []
    clip = lambda n: os.path.join(v, n + '.webm')

    def make(n, srcs, parts):
        out = os.path.join(t, n + '.webp'); made.append(n)
        if not os.environ.get('FIG_THUMBS_ALL') and os.path.exists(out) and all(os.path.getmtime(out) >= os.path.getmtime(x) for x in srcs):
            return
        save(parts(), out); print('thumb', n, flush=True)
    for n in sorted(loops):
        if n.endswith('-in') or n.startswith('sunh-'):
            continue
        if n + '-in' in loops:
            make(n, [clip(n + '-in'), clip(n)], lambda n=n: there_and_back(v, n + '-in', n))
        else:
            fps = BREATH_FPS if length(clip(n)) >= 6 else MOVE_FPS
            make(n, [clip(n)], lambda n=n, fps=fps: [(frames(clip(n), fps), round(1000 / fps))])
    if man.get('sun'):
        if os.path.exists(clip('sun-00')):
            make('sun-00', [clip('sun-00')], lambda: [(frames(clip('sun-00'), BREATH_FPS), round(1000 / BREATH_FPS))])
        allsrc = []
        for i in range(1, man['sun'] + 1):
            hold = 'sunh-' + SUN[i]; hold = hold if hold in loops else ''
            srcs = [clip('sun-%02d' % i)] + ([clip(hold)] if hold else []); allsrc += srcs
            make('sun-%02d' % i, srcs, lambda i=i, hold=hold: there_and_back(v, 'sun-%02d' % i, hold))

        def whole():
            out = []
            for i in range(1, man['sun'] + 1):
                hold = 'sunh-' + SUN[i]; hold = hold if hold in loops else ''
                parts = there_and_back(v, 'sun-%02d' % i, hold)
                out += parts[:2] if hold else parts[:1] + [([parts[0][0][-1]], 500)]
            return out
        make('sun', allsrc, whole)
    for p in glob.glob(os.path.join(t, '*.webp')):
        if os.path.basename(p)[:-5] not in made:
            os.remove(p)
    man['thumbs'] = sorted(made)
    head = txt[:txt.index('window.SAKHI_FIG')]
    if 'thumbs:' not in head:
        head = head.replace(' */\n', ' sunh-<pose>: a sun salutation position breathing after\n   its flow; thumbs: fig/t/<name>.webp, the lists\' small moving pictures (Version 39.69.2). */\n', 1)
    open(js, 'w').write(head + 'window.SAKHI_FIG = ' + json.dumps(man) + ';\n')
    total = sum(os.path.getsize(p) for p in glob.glob(os.path.join(t, '*.webp')))
    print('thumbs', len(made), 'MB %.2f' % (total / 1048576))


if __name__ == '__main__':
    run(sys.argv[1])
