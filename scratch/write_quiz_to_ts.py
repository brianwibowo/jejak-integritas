import json

json_path = "/Users/mymac/Documents/Codes/jejak-integritas/scratch/parsed_quiz.json"
ts_path = "/Users/mymac/Documents/Codes/jejak-integritas/frontend/app/game/gameData.ts"

with open(json_path, "r", encoding="utf-8") as f:
    questions = json.load(f)

# Read TS file up to the questions array
with open(ts_path, "r", encoding="utf-8") as f:
    ts_lines = f.readlines()

# Find the start line of export const questions
start_idx = -1
for idx, line in enumerate(ts_lines):
    if "export const questions: Question[] = [" in line:
        start_idx = idx
        break

if start_idx == -1:
    print("Could not find start of questions array in TS file!")
    exit(1)

# Keep the TS lines up to the start index
new_ts_lines = ts_lines[:start_idx + 1]

# Now generate the question blocks
indent = "  "
for q in questions:
    q_str = []
    q_str.append(f"{indent}{{\n")
    q_str.append(f"{indent}  id: {q['id']},\n")
    q_str.append(f"{indent}  theme: '{q['theme']}',\n")
    q_str.append(f"{indent}  boxType: '{q['boxType']}',\n")
    
    # Escape question prompt quotes
    prompt = q['question'].replace("'", "\\'")
    q_str.append(f"{indent}  question:\n{indent}    '{prompt}',\n")
    
    # Options
    opts_str = []
    for opt in q['options']:
        opt_escaped = opt.replace("'", "\\'")
        opts_str.append(f"'{opt_escaped}'")
    q_str.append(f"{indent}  options: [{', '.join(opts_str)}],\n")
    q_str.append(f"{indent}  answer: {q['answer']},\n")
    
    # Escape explanation quotes
    exp = q['explanation'].replace("'", "\\'")
    # Format explanation to preserve newlines nicely
    # docx cells have newlines, let's replace them with \n
    exp_formatted = exp.replace("\n", "\\n")
    q_str.append(f"{indent}  explanation:\n{indent}    '{exp_formatted}',\n")
    
    q_str.append(f"{indent}}},\n")
    new_ts_lines.append("".join(q_str))

new_ts_lines.append("];\n")

# Write back
with open(ts_path, "w", encoding="utf-8") as f:
    f.writelines(new_ts_lines)

print(f"Successfully wrote {len(questions)} questions into {ts_path}!")
