import zipfile
import xml.etree.ElementTree as ET
import json
import re

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
theme_keys = {
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

col_types = ['biru', 'merah', 'kuning', 'hijau', 'ungu']

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

parsed_questions = []
global_id = 1

def clean_option(opt):
    # Remove A. B. C. D. prefixes
    opt = opt.strip()
    opt = re.sub(r'^[A-D]\.\s*', '', opt, flags=re.IGNORECASE)
    # Remove leading/trailing bullet points or dashes
    opt = re.sub(r'^[-•*]\s*', '', opt)
    return opt.strip()

def parse_question_cell(text, theme, col_idx):
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if not lines:
        return None
        
    # Check if we have combined options in any line
    processed_lines = []
    for line in lines:
        # Check if line contains a pattern like "Option CD. Option D"
        # Match e.g. "Mengabaikan masalahD. Mengikuti keputusan mayoritas"
        match = re.match(r'(.*?)\s*([A-D]\.\s+)(.*)', line, re.IGNORECASE)
        if match:
            processed_lines.append(match.group(1).strip())
            processed_lines.append((match.group(2) + match.group(3)).strip())
        else:
            processed_lines.append(line)
            
    lines = processed_lines
    
    if len(lines) < 6:
        print(f"Error parsing Q at {theme} Col {col_idx}: only {len(lines)} lines left.")
        return None
        
    indicator = lines[0].strip('()')
    
    # Last line should be answer
    ans_line = lines[-1]
    match = re.search(r'Jawaban:\s*([A-D])', ans_line, re.IGNORECASE)
    if not match:
        # Check if the last line doesn't have the label, but just "C" or similar
        # Or look for any A-D in the last line
        match = re.search(r'([A-D])', ans_line, re.IGNORECASE)
        
    if not match:
        print(f"Error finding answer in '{ans_line}' at {theme} Col {col_idx}")
        ans_idx = 0
    else:
        ans_idx = ord(match.group(1).upper()) - ord('A')
        
    # The 4 lines before the last line are the options
    options = [
        clean_option(lines[-5]),
        clean_option(lines[-4]),
        clean_option(lines[-3]),
        clean_option(lines[-2])
    ]
    
    # Everything in between is the question prompt
    prompt = " ".join(lines[1:-5]).strip()
    
    return {
        "indicator": indicator,
        "question": prompt,
        "options": options,
        "answer": ans_idx
    }

for theme, r in matched_rows:
    theme_key = theme_keys[theme]
    
    # Block 1: Questions 1-5 (Row r), Explanations 1-5 (Row r+2)
    row_q15 = rows[r]
    row_e15 = rows[r+2]
    cells_q15 = row_q15.findall('.//w:tc', ns)
    cells_e15 = row_e15.findall('.//w:tc', ns)
    
    for col_idx in range(1, 6):
        box_type = col_types[col_idx - 1]
        
        q_data = parse_question_cell(get_cell_text(cells_q15[col_idx]), theme, col_idx)
        e_text = get_cell_text(cells_e15[col_idx])
        
        if q_data:
            parsed_questions.append({
                "id": global_id,
                "theme": theme_key,
                "boxType": box_type,
                "question": q_data["question"],
                "options": q_data["options"],
                "answer": q_data["answer"],
                "explanation": e_text
            })
            global_id += 1
            
    # Block 2: Questions 6-10 (Row r+3), Explanations 6-10 (Row r+5)
    row_q610 = rows[r+3]
    row_e610 = rows[r+5]
    cells_q610 = row_q610.findall('.//w:tc', ns)
    cells_e610 = row_e610.findall('.//w:tc', ns)
    
    for col_idx in range(1, 6):
        box_type = col_types[col_idx - 1]
        
        q_data = parse_question_cell(get_cell_text(cells_q610[col_idx]), theme, col_idx + 5)
        e_text = get_cell_text(cells_e610[col_idx])
        
        if q_data:
            parsed_questions.append({
                "id": global_id,
                "theme": theme_key,
                "boxType": box_type,
                "question": q_data["question"],
                "options": q_data["options"],
                "answer": q_data["answer"],
                "explanation": e_text
            })
            global_id += 1

print(f"Total parsed questions: {len(parsed_questions)}")
with open("/Users/mymac/Documents/Codes/jejak-integritas/scratch/parsed_quiz.json", "w", encoding="utf-8") as out:
    json.dump(parsed_questions, out, indent=2)
print("Saved to parsed_quiz.json")
