with open("/Users/mymac/Documents/Codes/jejak-integritas/scratch/extracted_text.txt", "r", encoding="utf-8") as f:
    lines = [line.strip() for line in f]

# Let's find sections or headings like "Jujur", "Disiplin", "Tanggung jawab", "Pembahasan"
for i, line in enumerate(lines):
    if not line:
        continue
    # If the line looks like a header or is uppercase
    if line in ["Jujur", "Disiplin", "Tanggung Jawab", "Kerja Keras", "Sederhana", "Mandiri", "Adil", "Berani", "Peduli"]:
        print(f"Header: {line} at line {i+1}")
    elif "Pembahasan" in line or "SOAL" in line.upper() or "KOTAK" in line.upper():
        print(f"Line {i+1:4d}: {line}")
