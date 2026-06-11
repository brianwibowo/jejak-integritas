import zipfile
import xml.etree.ElementTree as ET

docx_path = "/Users/mymac/Documents/Codes/jejak-integritas/scratch/Pembahasan - Konsep Media Jejak Integritas.docx"
ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

with zipfile.ZipFile(docx_path) as docx:
    xml_content = docx.read('word/document.xml')
    root = ET.fromstring(xml_content)

tables = root.findall('.//w:tbl', ns)
t3 = tables[2]
rows = t3.findall('.//w:tr', ns)

def get_cell_text(cell):
    paragraphs = []
    for p in cell.findall('.//w:p', ns):
        text = "".join([t.text for t in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if t.text])
        paragraphs.append(text)
    return "\n".join(paragraphs).strip()

themes = ["Jujur", "Disiplin", "Tanggung Jawab", "Kerja Keras", "Sederhana", "Mandiri", "Adil", "Berani", "Peduli"]

errors = []
questions_list = []

for t_idx, theme in enumerate(themes):
    base_row = 3 + t_idx * 8
    # Questions 1-5 (row base_row)
    row_q15 = rows[base_row]
    cells_q15 = row_q15.findall('.//w:tc', ns)
    
    # Check theme name in Cell 1
    theme_in_cell = get_cell_text(cells_q15[0]).split('\n')[0].strip()
    if theme not in theme_in_cell:
        errors.append(f"Theme mismatch at row {base_row+1}: expected '{theme}', got '{theme_in_cell}'")
        
    for c_idx in range(1, 6):
        text = get_cell_text(cells_q15[c_idx])
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        if len(lines) != 7:
            errors.append(f"Theme '{theme}' Q{c_idx} (Row {base_row+1}, Cell {c_idx+1}) has {len(lines)} lines instead of 7. Text: {repr(text)}")
        else:
            questions_list.append((theme, c_idx, lines))
            
    # Questions 6-10 (row base_row + 3)
    row_q610 = rows[base_row + 3]
    cells_q610 = row_q610.findall('.//w:tc', ns)
    for c_idx in range(1, 6):
        text = get_cell_text(cells_q610[c_idx])
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        if len(lines) != 7:
            errors.append(f"Theme '{theme}' Q{c_idx+5} (Row {base_row+4}, Cell {c_idx+1}) has {len(lines)} lines instead of 7. Text: {repr(text)}")
        else:
            questions_list.append((theme, c_idx+5, lines))

print(f"Parsed {len(questions_list)} questions successfully.")
print(f"Found {len(errors)} errors/anomalies.")
if errors:
    print("Errors:")
    for err in errors[:10]:
        print("  -", err)
