from PIL import Image

img_path = "/Users/mymac/Documents/Codes/jejak-integritas/frontend/public/game_board_utama.png"
img = Image.open(img_path)
width, height = img.size

# Let's find the exact chalkboard area on the right.
# Chalkboard has green pixels. Let's scan horizontally at y = 540 (middle) from x = 1200 to 1920.
# We look for where the green chalkboard begins. The chalkboard color is approximately (30-50, 45-70, 35-60).
print("Horizontal Scan at y = 540:")
for x in range(1200, 1920, 10):
    r, g, b = img.getpixel((x, 540))[:3]
    # Check if it looks like the chalkboard color
    is_chalkboard = (30 <= r <= 60) and (45 <= g <= 80) and (35 <= b <= 65)
    print(f"x={x} ({x/width*100:.2f}%): RGB=({r},{g},{b}) {'[CHALKBOARD]' if is_chalkboard else ''}")

# Let's scan vertically at x = 1600 (well within the chalkboard area) to find its top and bottom boundaries.
print("\nVertical Scan at x = 1600:")
for y in range(0, 1080, 10):
    r, g, b = img.getpixel((1600, y))[:3]
    is_chalkboard = (30 <= r <= 60) and (45 <= g <= 80) and (35 <= b <= 65)
    print(f"y={y} ({y/height*100:.2f}%): RGB=({r},{g},{b}) {'[CHALKBOARD]' if is_chalkboard else ''}")
