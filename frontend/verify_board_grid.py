import os
from PIL import Image, ImageDraw

def main():
    img_path = '/Users/mymac/Documents/Codes/jejak-integritas/frontend/public/papan_ular_jejak_integritas.webp'
    if not os.path.exists(img_path):
        print(f"Error: {img_path} not found")
        return
        
    img = Image.open(img_path)
    W, H = img.size
    draw = ImageDraw.Draw(img)
    
    # We will define a list of 50 coordinates, one for each box, manually calibrated
    # Row Y centers:
    # Row 5 (bottom): 0.87
    # Row 4: 0.69
    # Row 3: 0.50
    # Row 2: 0.31
    # Row 1 (top): 0.12
    
    BOX_COORDINATES = [
        # === Row 5: boxes 1-10 (L to R) ===
        [0.090, 0.87],  # Box 1
        [0.190, 0.87],  # Box 2
        [0.290, 0.87],  # Box 3
        [0.390, 0.87],  # Box 4
        [0.490, 0.87],  # Box 5
        [0.580, 0.87],  # Box 6
        [0.670, 0.87],  # Box 7
        [0.760, 0.87],  # Box 8
        [0.850, 0.87],  # Box 9
        [0.940, 0.87],  # Box 10

        # === Row 4: boxes 11-20 (R to L) ===
        [0.940, 0.69],  # Box 11
        [0.850, 0.69],  # Box 12
        [0.760, 0.69],  # Box 13
        [0.670, 0.69],  # Box 14
        [0.580, 0.69],  # Box 15
        [0.490, 0.69],  # Box 16
        [0.390, 0.69],  # Box 17
        [0.290, 0.69],  # Box 18
        [0.190, 0.69],  # Box 19
        [0.090, 0.69],  # Box 20

        # === Row 3: boxes 21-30 (L to R) ===
        [0.075, 0.50],  # Box 21 - shifted left because this row's leftmost box is narrow
        [0.160, 0.50],  # Box 22 - shifted left
        [0.255, 0.50],  # Box 23 - Jujur illustration
        [0.360, 0.50],  # Box 24
        [0.465, 0.50],  # Box 25
        [0.565, 0.50],  # Box 26
        [0.665, 0.50],  # Box 27 - Bohong illustration
        [0.760, 0.50],  # Box 28
        [0.850, 0.50],  # Box 29
        [0.940, 0.50],  # Box 30

        # === Row 2: boxes 31-40 (R to L) ===
        [0.935, 0.31],  # Box 31 - Melaporkan pelanggaran
        [0.840, 0.31],  # Box 32
        [0.745, 0.31],  # Box 33 - Menolak suap
        [0.650, 0.31],  # Box 34
        [0.560, 0.31],  # Box 35
        [0.465, 0.31],  # Box 36
        [0.370, 0.31],  # Box 37 - Mencuri illustration
        [0.275, 0.31],  # Box 38
        [0.175, 0.31],  # Box 39
        [0.075, 0.31],  # Box 40 - shifted left

        # === Row 1: boxes 41-50 (L to R) ===
        [0.075, 0.12],  # Box 41 - shifted left
        [0.170, 0.12],  # Box 42 - Kerja bakti
        [0.275, 0.12],  # Box 43
        [0.375, 0.12],  # Box 44
        [0.470, 0.12],  # Box 45
        [0.570, 0.12],  # Box 46
        [0.665, 0.12],  # Box 47
        [0.760, 0.12],  # Box 48
        [0.850, 0.12],  # Box 49 - second to last, clearly separate from 50!
        [0.940, 0.12],  # Box 50 - Trophy / Finish!
    ]
    
    # Draw a marker for each box
    for pos in range(1, 51):
        cx, cy = BOX_COORDINATES[pos - 1]
        
        px = int(cx * W)
        py = int(cy * H)
        
        # Draw red dot for center
        draw.ellipse([px - 15, py - 15, px + 15, py + 15], fill='red', outline='black', width=3)
        # Write box number
        draw.text((px - 10, py - 25), str(pos), fill='white', stroke_fill='black', stroke_width=2)
        
    # Save the output to artifacts
    output_path = '/Users/mymac/.gemini/antigravity-ide/brain/7c61c46e-6a4a-4920-9cbc-e60912f271bd/grid_calibration_test.png'
    img.save(output_path)
    print(f"Calibration image saved to: {output_path}")

if __name__ == '__main__':
    main()
