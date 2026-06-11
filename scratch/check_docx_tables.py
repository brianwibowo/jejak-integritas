import zipfile
import xml.etree.ElementTree as ET

docx_path = "/Users/mymac/Documents/Codes/jejak-integritas/scratch/Pembahasan - Konsep Media Jejak Integritas.docx"

with zipfile.ZipFile(docx_path) as docx:
    xml_content = docx.read('word/document.xml')
    root = ET.fromstring(xml_content)

# Namespace map
ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

# Let's count tables, rows, cells
tables = root.findall('.//w:tbl', ns)
print(f"Total tables found: {len(tables)}")

for idx, table in enumerate(tables):
    rows = table.findall('.//w:tr', ns)
    print(f"Table {idx+1}: {len(rows)} rows")
    # let's inspect the first row's cells
    if rows:
        cells = rows[0].findall('.//w:tc', ns)
        print(f"  First row has {len(cells)} cells")
        # print text of first cell in first row
        tc_texts = []
        for p in cells[0].findall('.//w:p', ns):
            p_text = "".join([t.text for t in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if t.text])
            if p_text:
                tc_texts.append(p_text)
        print(f"  First cell text (first 3 lines): {tc_texts[:3]}")
