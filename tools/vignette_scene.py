"""Bake a warm vignette into the few photos that are real scenes.

These could not be cut out (textured wall, cast shadow). Dimming their edges
and warming them makes them sit in the dark layout instead of glaring.
"""
import os
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAMES = ["c0_0.webp", "c0_8.webp", "c2_2.webp", "c4_1.webp", "c4_3.webp"]

for name in NAMES:
    p = os.path.join(ROOT, "assets", "img", "menu", name)
    im = Image.open(p).convert("RGB")
    w, h = im.size

    # radial dimming mask: 1.0 in the middle, .16 in the corners
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((-w * 0.32, -h * 0.34, w * 1.32, h * 1.34), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(min(w, h) * 0.10))
    dark = Image.new("RGB", (w, h), (7, 6, 5))
    im = Image.composite(im, dark, mask)

    # warm the highlights a touch
    warm = Image.new("RGB", (w, h), (201, 162, 39))
    im = Image.blend(im, Image.blend(im, warm, 0.14), 0.55)

    im.save(p, "WEBP", quality=86, method=6)
    print("vignetted", name)
