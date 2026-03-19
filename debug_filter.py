import json
import os

def load_existing():
    with open('existing_names.txt', 'r', encoding='utf-8') as f:
        return set(line.strip().lower() for line in f if line.strip())

existing = load_existing()
print(f"Existing count: {len(existing)}")

def check_file(file_path):
    if not os.path.exists(file_path):
        print(f"File {file_path} not found")
        return
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        print(f"File {file_path} has {len(lines)} lines")
        for line in lines:
            if '|' in line and not line.startswith('| :---') and 'Название' not in line:
                parts = [p.strip() for p in line.split('|') if p.strip()]
                if len(parts) >= 1:
                    name = parts[0]
                    if name.lower() in existing:
                        print(f"Duplicate found: {name}")
                    else:
                        print(f"New candidate: {name}")

check_file('ekb_design_studios.md')
check_file('novosib_furniture.md')
