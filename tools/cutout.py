"""Cut the studio-white background out of the menu photos.

The menu photos come from a delivery catalogue: most are isolated product
shots on white or light grey. On a dark page those read as glowing white
holes, so we flood-fill the background from the corners and keep the item
on transparency. Photos that are real scenes (textured wall, table, shadow)
are left untouched.
"""
import glob
import os
import sys
from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "img", "menu")
OUT = os.path.join(ROOT, "assets", "img", "cut")
SENT = (255, 0, 255)


def corner_uniformity(rgb):
    w, h = rgb.size
    px = rgb.load()
    pts = [(2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3)]
    cols = [px[x, y] for x, y in pts]
    worst = 0
    for i in range(len(cols)):
        for j in range(i + 1, len(cols)):
            d = max(abs(a - b) for a, b in zip(cols[i], cols[j]))
            worst = max(worst, d)
    return worst, cols


def cut(path):
    im = Image.open(path).convert("RGBA")
    rgb = im.convert("RGB")
    w, h = im.size

    spread, _ = corner_uniformity(rgb)
    if spread > 34:
        return None, "scene"

    work = rgb.copy()
    points = [(2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3),
              (w // 2, 2), (w // 2, h - 3), (2, h // 2), (w - 3, h // 2)]
    for xy in points:
        try:
            ImageDraw.floodfill(work, xy, SENT, thresh=44)
        except Exception:
            pass

    diff = ImageChops.difference(work, Image.new("RGB", (w, h), SENT)).convert("L")
    mask = diff.point(lambda v: 255 if v < 8 else 0)
    covered = mask.histogram()[255] / float(w * h)
    if covered < 0.22 or covered > 0.93:
        return None, "covered=%.2f" % covered

    # erode a hair so white fringes don't survive, then feather
    mask = mask.filter(ImageFilter.MinFilter(3))
    mask = mask.filter(ImageFilter.GaussianBlur(1.1))
    alpha = ImageChops.invert(mask)
    out = im.copy()
    out.putalpha(alpha)

    box = alpha.point(lambda v: 255 if v > 12 else 0).getbbox()
    if box:
        pad = 6
        box = (max(0, box[0] - pad), max(0, box[1] - pad),
               min(w, box[2] + pad), min(h, box[3] + pad))
        out = out.crop(box)
    return out, "covered=%.2f" % covered


def main():
    os.makedirs(OUT, exist_ok=True)
    keep_original = []
    made = 0
    for f in sorted(glob.glob(os.path.join(SRC, "*.webp"))):
        name = os.path.basename(f)
        try:
            img, note = cut(f)
        except Exception as e:  # never break the build over one photo
            print("ERR", name, e)
            keep_original.append(name)
            continue
        if img is None:
            print("keep", name, note)
            keep_original.append(name)
            continue
        img.save(os.path.join(OUT, name), "WEBP", quality=86, method=6)
        made += 1
        print("cut ", name, note, img.size)

    print("\ncut %d, kept %d" % (made, len(keep_original)))
    with open(os.path.join(OUT, "_kept.txt"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(keep_original))


if __name__ == "__main__":
    sys.exit(main())
