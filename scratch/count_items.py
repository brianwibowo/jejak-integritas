import re

with open("/Users/mymac/Documents/Codes/jejak-integritas/scratch/extracted_text.txt", "r", encoding="utf-8") as f:
    lines = [line.strip() for line in f]

# Let's count how many questions (containing "✅ Jawaban") we have per theme
themes = ["Jujur", "Disiplin", "Tanggung Jawab", "Kerja Keras", "Sederhana", "Mandiri", "Adil", "Berani", "Peduli"]
current_theme = None
theme_counts = {t: 0 for t in themes}
theme_pembahasan = {t: 0 for t in themes}

for line in lines:
    if line in themes:
        current_theme = line
    if current_theme:
        if "✅ Jawaban" in line:
            theme_counts[current_theme] += 1
        elif "Pembahasan Soal" in line:
            theme_pembahasan[current_theme] += 1

print("Questions per theme:")
for t, count in theme_counts.items():
    print(f"- {t}: {count} questions, {theme_pembahasan[t]} pembahasan headers")
