# -*- coding: utf-8 -*-
"""Makes Sakhi's app icons from the logo (Mohit, 6 Nov 2026: "Use this icon for app"): icon-src/sakhi-logo.webp.

The launcher icon is the mark only (the flower, the cross and her face), without the word SAKHI under it: at 48 px the word
can't be read, and the phone already writes "Qura Sakhi" under the icon. It is an adaptive icon (Android 8+, so every phone
Sakhi runs on): a white background and the mark as the foreground, kept inside the 66 dp circle every launcher shows, so no
mask (circle, squircle, rounded square) cuts a petal. Also writes the plain icons for older launchers and icon-512.png, the
512 x 512 icon Google Play asks for (a full white square; Play rounds the corners itself).

Usage, from android/: python3 make-icons.py   (needs Pillow)
"""
import math
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'icon-src', 'sakhi-logo.webp')
RES = os.path.join(HERE, 'res')
DENSITIES = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
WHITE = (255, 255, 255)


def is_ink(p):
    return 255 - min(p[:3]) > 40


def the_mark():
    """The mark alone, on pure white, cropped square around its centre; and its radius (centre to the farthest ink)."""
    im = Image.open(SRC).convert('RGB')
    w, h = im.size
    px = im.load()
    # The word sits under the mark, after a band of empty rows: keep the first band of rows with ink.
    rows = [any(is_ink(px[x, y]) for x in range(0, w, 2)) for y in range(h)]
    top = rows.index(True)
    bottom = top
    while bottom + 1 < h and rows[bottom + 1]:
        bottom += 1
    cols = [any(is_ink(px[x, y]) for y in range(top, bottom + 1, 2)) for x in range(w)]
    left = cols.index(True)
    right = w - 1 - cols[::-1].index(True)
    cx, cy = (left + right) / 2, (top + bottom) / 2
    radius = max(math.hypot(x - cx, y - cy) for y in range(top, bottom + 1, 2) for x in range(left, right + 1, 2) if is_ink(px[x, y]))
    # The logo's background is nearly white (250, 253, 249): make it pure white so it meets the icon's white background.
    clean = im.copy()
    cp = clean.load()
    for y in range(h):
        for x in range(w):
            if min(cp[x, y]) > 244:
                cp[x, y] = WHITE
    half = int(math.ceil(radius)) + 4
    box = (int(cx) - half, int(cy) - half, int(cx) + half, int(cy) + half)
    square = Image.new('RGB', (2 * half, 2 * half), WHITE)
    square.paste(clean.crop((max(box[0], 0), max(box[1], 0), min(box[2], w), min(box[3], bottom + 1))),
                 (max(-box[0], 0), max(-box[1], 0)))
    return square, half


def on_white(mark, half, ink_r, size, radius_px):
    """The mark on a white square of `size` px, scaled so its farthest ink is `radius_px` from the centre."""
    side = round(2 * half * radius_px / ink_r)
    out = Image.new('RGB', (size, size), WHITE)
    out.paste(mark.resize((side, side), Image.LANCZOS), ((size - side) // 2, (size - side) // 2))
    return out


def main():
    mark, half = the_mark()
    # the mark's square is 2*half wide, with its farthest ink at about half - 4 from the centre
    ink_r = half - 4
    for name, d in DENSITIES.items():
        folder = os.path.join(RES, 'mipmap-' + name)
        os.makedirs(folder, exist_ok=True)
        # Adaptive foreground: 108 dp; the farthest ink at 33 dp from the centre (the safe circle every launcher keeps).
        on_white(mark, half, ink_r, round(108 * d), 33 * d).save(os.path.join(folder, 'ic_launcher_foreground.png'), optimize=True)
        # Plain icon for launchers that don't use the adaptive one: 48 dp, the farthest ink at 22 dp.
        on_white(mark, half, ink_r, round(48 * d), 22 * d).save(os.path.join(folder, 'ic_launcher.png'), optimize=True)
    anydpi = os.path.join(RES, 'mipmap-anydpi-v26')
    os.makedirs(anydpi, exist_ok=True)
    with open(os.path.join(anydpi, 'ic_launcher.xml'), 'w', encoding='utf-8') as f:
        f.write('<?xml version="1.0" encoding="utf-8"?>\n'
                '<!-- Made by make-icons.py from icon-src/sakhi-logo.webp: a white background and the mark. -->\n'
                '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
                '    <background android:drawable="@android:color/white" />\n'
                '    <foreground android:drawable="@mipmap/ic_launcher_foreground" />\n'
                '</adaptive-icon>\n')
    # Google Play's 512 x 512 icon: the farthest ink at 232 px from the centre, clear of Play's rounded corners.
    on_white(mark, half, ink_r, 512, 232).save(os.path.join(HERE, 'icon-512.png'), optimize=True)
    print('Icons written: res/mipmap-*/ic_launcher*.png, res/mipmap-anydpi-v26/ic_launcher.xml, icon-512.png')


if __name__ == '__main__':
    main()
