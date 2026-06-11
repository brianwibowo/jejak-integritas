from PIL import Image

img_path = "/Users/mymac/Documents/Codes/jejak-integritas/frontend/public/game_board_utama.png"
img = Image.open(img_path)
width, height = img.size

# Let's find vertical lines of the grid on the board.
# The grid lines are typically dark lines (low intensity) or a distinct color.
# We can scan horizontally along y = 540 and output a detailed profile.
# Let's save a profile of lightness or color components from x=0 to 1400.
import numpy as np

# Convert image to grayscale or look at color variations.
gray_img = img.convert('L')
line_profile = [gray_img.getpixel((x, 540)) for x in range(width)]

# Print values every 5 pixels from x=50 to x=1350 to help find the cell boundaries or centers.
print("Lightness profile of the board area horizontally (x=50 to 1350):")
# Let's print out coordinates where the lightness drops significantly (grid lines are usually darker)
# or just print a grid of values.
# Actually, let's find the centers of the colored boxes by analyzing the colors.
# There are 10 columns, so 10 boxes.
# Let's print the RGB colors at y=540 from x=50 to 1350 at steps of 10 pixels.
for x in range(50, 1350, 15):
    r, g, b = img.getpixel((x, 540))[:3]
    print(f"x={x:4d} ({x/width*100:5.2f}%): RGB=({r:3d},{g:3d},{b:3d})")
