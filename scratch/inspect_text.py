with open("/Users/mymac/Documents/Codes/jejak-integritas/scratch/extracted_text.txt", "r", encoding="utf-8") as f:
    lines = [f.readline().strip() for _ in range(250)]

for i, line in enumerate(lines):
    if line:
        print(f"{i+1:3d}: {line}")
