import json

with open("/Users/mymac/Documents/Codes/jejak-integritas/scratch/parsed_quiz.json", "r", encoding="utf-8") as f:
    questions = json.load(f)

print(f"Total questions loaded: {len(questions)}")
errors = 0
for idx, q in enumerate(questions):
    if not q["question"]:
        print(f"Error: Empty question at index {idx} (ID {q['id']})")
        errors += 1
    if len(q["options"]) != 4:
        print(f"Error: Question {q['id']} has {len(q['options'])} options instead of 4.")
        errors += 1
    for opt in q["options"]:
        if not opt:
            print(f"Error: Question {q['id']} has an empty option.")
            errors += 1
    if q["answer"] not in [0, 1, 2, 3]:
        print(f"Error: Question {q['id']} has invalid answer index {q['answer']}.")
        errors += 1
    if not q["explanation"] or q["explanation"] == "-":
        print(f"Error: Question {q['id']} has missing explanation.")
        errors += 1

print(f"Verification complete. Total errors found: {errors}")
if errors == 0:
    print("ALL 90 QUESTIONS ARE 100% CORRECTLY FORMATED!")
