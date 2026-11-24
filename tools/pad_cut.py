"""Place every cut-out back on its original square canvas.

`cutout.py` crops each item to its content box. Menu frames crop with
object-fit: cover, so we shrink the item to ~86% and re-centre it inside a
transparent canvas of the original size — the item then always fits the
frame, whatever its proportions, and the dark card shows through.
"""
import glob
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "img", "menu")
CUT = os.path.join(ROOT, "assets", "img", "cut")
OUT = os.path.join(ROOT, "assets", "img", "menu")
FILL = 0.86


def main():
    n = 0
    for f in sorted(glob.glob(os.path.join(CUT, "*.webp"))):
        name = os.path.basename(f)
        src = os.path.join(SRC, name)
        if not os.path.exists(src):
            print("no original for", name)
            continue
        W, H = Image.open(src).size
        item = Image.open(f).convert("RGBA")
        target = (int(W * FILL), int(H * FILL))
        item.thumbnail(target, Image.LANCZOS)
        canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        canvas.paste(item, ((W - item.width) // 2, (H - item.height) // 2), item)
        canvas.save(src, "WEBP", quality=86, method=6)
        n += 1
    print("padded", n)


if __name__ == "__main__":
    main()
