import zipfile
import xml.etree.ElementTree as ET
import os

docx_path = "/Users/mymac/Documents/Codes/jejak-integritas/scratch/Pembahasan - Konsep Media Jejak Integritas.docx"
if not os.path.exists(docx_path):
    print("File not found at path:", docx_path)
    exit(1)

# Extract paragraphs from docx XML
def get_docx_paragraphs(path):
    namespaces = {
        'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
    }
    paragraphs = []
    with zipfile.ZipFile(path) as docx:
        xml_content = docx.read('word/document.xml')
        root = ET.fromstring(xml_content)
        for paragraph in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
            texts = []
            for run in paragraph.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r'):
                for text_elem in run.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
                    texts.append(text_elem.text)
            text = "".join(texts)
            paragraphs.append(text)
    return paragraphs

try:
    paragraphs = get_docx_paragraphs(docx_path)
    print(f"Extracted {len(paragraphs)} paragraphs.")
    
    # Save to a text file for inspection and parsing
    out_txt_path = "/Users/mymac/Documents/Codes/jejak-integritas/scratch/extracted_text.txt"
    with open(out_txt_path, "w", encoding="utf-8") as f:
        for p in paragraphs:
            f.write(p + "\n")
    print("Saved to", out_txt_path)
except Exception as e:
    print("Error:", e)
