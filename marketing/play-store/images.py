# -*- coding: utf-8 -*-
"""Image steps for make-play-graphics.mjs (needs Pillow).

  python3 images.py mark <out.png>        the logo's mark (the flower, the cross and her face, without the word), on a transparent
                                          background, from android/icon-src/sakhi-logo.webp (the same crop as make-icons.py)
  python3 images.py finish <file.png>...  each image as a 24-bit PNG with no alpha channel (Google Play refuses alpha), and its size
"""
import importlib.util
import os
import sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ICONS = os.path.join(HERE, '..', '..', 'android', 'make-icons.py')


def load_icons():
    spec = importlib.util.spec_from_file_location('make_icons', ICONS)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def mark(out):
    square, half = load_icons().the_mark()
    im = square.convert('RGBA')
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, _ = px[x, y]
            # white is transparent; a pale edge keeps its colour with part of its opacity (un-mixed from the white it sat on)
            a = min(255, (255 - min(r, g, b)) * 5)
            if a <= 0:
                px[x, y] = (255, 255, 255, 0)
                continue
            f = a / 255.0
            un = lambda c: max(0, min(255, round((c - 255 * (1 - f)) / f)))
            px[x, y] = (un(r), un(g), un(b), a)
    im.save(out)
    print('mark', out, im.size)


def finish(files):
    for f in files:
        im = Image.open(f)
        if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
            bg = Image.new('RGB', im.size, (255, 255, 255))
            bg.paste(im.convert('RGBA'), mask=im.convert('RGBA').split()[3])
            im = bg
        else:
            im = im.convert('RGB')
        im.save(f, optimize=True)
        print('finished', os.path.basename(f), im.size, im.mode, os.path.getsize(f) // 1024, 'KB')


if __name__ == '__main__':
    if sys.argv[1] == 'mark':
        mark(sys.argv[2])
    elif sys.argv[1] == 'finish':
        finish(sys.argv[2:])
