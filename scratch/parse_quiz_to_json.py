import re
import json

themes = ["Jujur", "Disiplin", "Tanggung Jawab", "Kerja Keras", "Sederhana", "Mandiri", "Adil", "Berani", "Peduli"]
theme_map = {
    "Jujur": "jujur",
    "Disiplin": "disiplin",
    "Tanggung Jawab": "tanggung_jawab",
    "Kerja Keras": "kerja_keras",
    "Sederhana": "sederhana",
    "Mandiri": "mandiri",
    "Adil": "adil",
    "Berani": "berani",
    "Peduli": "peduli"
}

with open("/Users/mymac/Documents/Codes/jejak-integritas/scratch/extracted_text.txt", "r", encoding="utf-8") as f:
    raw_lines = [line.strip() for line in f]

# Let's clean up empty lines but preserve sections
# We'll split the document by themes.
# A theme boundary is a line matching a theme name, followed by "Indikator:" on the next line or soon after.
sections = []
current_section = None

i = 0
while i < len(raw_lines):
    line = raw_lines[i]
    if line in themes and i + 1 < len(raw_lines) and raw_lines[i+1] == "Indikator:":
        if current_section:
            sections.append(current_section)
        current_section = {
            "name": line,
            "lines": []
        }
        i += 2
        continue
    if current_section:
        current_section["lines"].append(line)
    i += 1
if current_section:
    sections.append(current_section)

print(f"Split into {len(sections)} sections.")
for sec in sections:
    print(f"- Section {sec['name']}: {len(sec['lines'])} lines")

# Now let's parse each section.
# In a section:
# We look for questions. A question block starts with a line matching `^\([^)]+\)$` (e.g. `(Berkata benar)`).
# The lines following it are:
# - Question text
# - Option 1
# - Option 2
# - Option 3
# - Option 4
# - Answer line (starts with or contains ✅ Jawaban)
# After we find all questions in the section, we parse the explanations.
# The explanations follow `Pembahasan Soal X` headers.
# Let's write a robust parser for this.
