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

# Adil starts at Row 57 (index 56)
# Block 2 row is rows[59] (index 59)
# Q9 is cell index 4
row_q = rows[59]
cells = row_q.findall('.//w:tc', ns)
text = get_cell_text(cells[4])
print("Adil Q9 raw lines:")
for idx, line in enumerate(text.split('\n')):
    print(f"  {idx}: {repr(line)}")
