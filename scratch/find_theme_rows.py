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

for r_idx, row in enumerate(rows):
    cells = row.findall('.//w:tc', ns)
    if not cells:
        continue
    c1_text = get_cell_text(cells[0])
    # Check if any theme name is in c1_text
    matched_theme = None
    for theme in themes:
        # Check if theme name is at the start of a line in c1_text
        lines = [line.strip() for line in c1_text.split('\n') if line.strip()]
        if lines and lines[0] == theme:
            matched_theme = theme
            break
    if matched_theme:
        print(f"Row {r_idx+1:3d} matches theme '{matched_theme}'. Cell 1 text:\n{c1_text}\n" + "-"*40)
