"""Convert the MM Brews logo JPG to a transparent PNG.

Flood-fills the outer white background only, so the white "BREWS" text
trapped inside the black box stays opaque. Trims the resulting transparent
margin and writes the result as public/logo.png.
"""
from collections import deque
from pathlib import Path
from PIL import Image

SRC = Path(r"C:/Users/alaja/Downloads/photo_2026-05-16_23-15-53.jpg")
DST = Path(r"C:/Users/alaja/Desktop/New folder/MMCafe/public/logo.png")

# JPEG compression smears whites, so we use a generous "near-white" threshold.
WHITE = 235

img = Image.open(SRC).convert("RGBA")
w, h = img.size
px = img.load()

def whitish(p):
    return p[0] >= WHITE and p[1] >= WHITE and p[2] >= WHITE

visited = [[False] * h for _ in range(w)]
queue = deque()

# Seed from every edge pixel that is near-white.
for x in range(w):
    for y in (0, h - 1):
        if whitish(px[x, y]):
            queue.append((x, y))
            visited[x][y] = True
for y in range(h):
    for x in (0, w - 1):
        if whitish(px[x, y]):
            queue.append((x, y))
            visited[x][y] = True

# 4-connected flood fill. Anything we touch becomes fully transparent.
while queue:
    x, y = queue.popleft()
    px[x, y] = (255, 255, 255, 0)
    for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny] and whitish(px[nx, ny]):
            visited[nx][ny] = True
            queue.append((nx, ny))

# Trim transparent margins.
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)

# Add a small padding so the logo doesn't sit flush against its container.
pad = max(img.size) // 40
canvas = Image.new("RGBA", (img.size[0] + pad * 2, img.size[1] + pad * 2), (0, 0, 0, 0))
canvas.paste(img, (pad, pad), img)

DST.parent.mkdir(parents=True, exist_ok=True)
canvas.save(DST, "PNG", optimize=True)
print(f"Wrote {DST} — {canvas.size[0]}x{canvas.size[1]}")
