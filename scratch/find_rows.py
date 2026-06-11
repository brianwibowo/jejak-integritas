from PIL import Image

img_path = "/Users/mymac/Documents/Codes/jejak-integritas/frontend/public/game_board_utama.png"
img = Image.open(img_path)
width, height = img.size

# Scan vertically at x = 400 (which is in the middle of column 2/3) to find the rows.
# There are 5 rows.
print("Vertical scan of the board at x = 400:")
for y in range(0, height, 10):
    r, g, b = img.getpixel((400, y))[:3]
    # Output values to see where color changes are or where border lines are
    print(f"y={y:4d} ({y/height*100:5.2f}%): RGB=({r:3d},{g:3d},{b:3d})")
