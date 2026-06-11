with open("/Users/mymac/Documents/Codes/jejak-integritas/scratch/extracted_text.txt", "r", encoding="utf-8") as f:
    lines = [line.strip() for line in f]

# Let's inspect the Jujur theme (from line 93 to line 342)
# Print lines that have content
for idx in range(92, 342):
    if lines[idx]:
        print(f"{idx+1:3d}: {lines[idx]}")
