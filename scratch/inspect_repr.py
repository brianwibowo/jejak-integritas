with open("/Users/mymac/Documents/Codes/jejak-integritas/scratch/extracted_text.txt", "r", encoding="utf-8") as f:
    for i in range(150):
        line = f.readline()
        if not line:
            break
        print(f"{i+1:3d}: {repr(line)}")
