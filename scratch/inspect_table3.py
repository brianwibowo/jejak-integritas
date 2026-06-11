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

print(f"Table 3 has {len(rows)} rows.")

def get_cell_text(cell):
    paragraphs = []
    for p in cell.findall('.//w:p', ns):
        text = "".join([t.text for t in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if t.text])
        paragraphs.append(text)
    return "\n".join(paragraphs).strip()

# Print first 5 rows to see headers and content layout
for r_idx in range(min(10, len(rows))):
    cells = rows[r_idx].findall('.//w:tc', ns)
    print(f"\nRow {r_idx+1}: {len(cells)} cells")
    for c_idx, cell in enumerate(cells):
        text = get_cell_text(cell)
        # print first 60 chars of each cell text
        preview = text.replace('\n', ' | ')[:100]
        print(f"  Cell {c_idx+1}: {preview}")
