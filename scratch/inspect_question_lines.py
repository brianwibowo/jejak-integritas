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

row = rows[3] # Row 4
cells = row.findall('.//w:tc', ns)
for c_idx in range(1, 6):
    text = get_cell_text(cells[c_idx])
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    print(f"\nCell {c_idx+1} has {len(lines)} lines:")
    for l_idx, line in enumerate(lines):
        print(f"  {l_idx}: {repr(line)}")
