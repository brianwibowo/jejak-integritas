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

matched_rows = []
for r_idx, row in enumerate(rows):
    cells = row.findall('.//w:tc', ns)
    if not cells:
        continue
    c1_text = get_cell_text(cells[0])
    for theme in themes:
        lines = [line.strip() for line in c1_text.split('\n') if line.strip()]
        if lines and lines[0] == theme:
            matched_rows.append((theme, r_idx))
            break

for theme, r in matched_rows:
    print(f"\nChecking theme '{theme}' starting at Row {r+1}:")
    
    # Q1-Q5 is Row r
    # Headers for Q1-Q5 is Row r+1
    # Exps for Q1-Q5 is Row r+2
    # Q6-Q10 is Row r+3
    # Headers for Q6-Q10 is Row r+4
    # Exps for Q6-Q10 is Row r+5
    
    h15 = get_cell_text(rows[r+1].findall('.//w:tc', ns)[1])
    e15 = get_cell_text(rows[r+2].findall('.//w:tc', ns)[1])
    q610 = get_cell_text(rows[r+3].findall('.//w:tc', ns)[1])
    h610 = get_cell_text(rows[r+4].findall('.//w:tc', ns)[1])
    e610 = get_cell_text(rows[r+5].findall('.//w:tc', ns)[1])
    
    print(f"  Row {r+2} (H1-5): {h15[:50]}")
    print(f"  Row {r+3} (E1-5): {e15[:50]}")
    print(f"  Row {r+4} (Q6-10): {q610[:50]}")
    print(f"  Row {r+5} (H6-10): {h610[:50]}")
    print(f"  Row {r+6} (E6-10): {e610[:50]}")
