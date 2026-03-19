import json
import os

def load_existing():
    with open('existing_names.txt', 'r', encoding='utf-8') as f:
        return set(line.strip().lower() for line in f if line.strip())

def parse_md_table(file_path, city_default, region_default, type_default):
    new_entries = []
    if not os.path.exists(file_path):
        return []
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        for line in lines:
            if '|' in line and not line.startswith('| :---') and 'Название' not in line:
                parts = [p.strip() for p in line.split('|') if p.strip()]
                if len(parts) >= 3:
                    name = parts[0]
                    phone = parts[1] if ':' not in parts[1] else "" # Simple check for phone vs site
                    site_or_addr = parts[2]
                    spec = parts[3] if len(parts) > 3 else "Мебель"
                    
                    entry = {
                        "Название": name,
                        "Город": city_default if city_default else parts[1] if city_default is None else city_default,
                        "Регион": region_default,
                        "Адрес": site_or_addr if '.' not in site_or_addr else "",
                        "Телефон": phone if any(c.isdigit() for c in phone) else "",
                        "WhatsApp": "",
                        "Telegram": "",
                        "Email": "",
                        "Сайт": f"https://{site_or_addr}" if '.' in site_or_addr and not site_or_addr.startswith('http') else site_or_addr if site_or_addr.startswith('http') else "",
                        "Соцсети": "",
                        "Специализация": spec,
                        "Краткое описание": f"{type_default}: {spec}",
                        "Сегмент": "Дизайнерская" if "дизайн" in spec.lower() else "Масс-маркет",
                        "Потенциал сотрудничества": "ВЫСОКИЙ (новый уникальный контакт)",
                        "Первый шаг контакта": "Звонок с предложением сотрудничества",
                        "Источник": "Поиск 2026",
                        "Тип": type_default
                    }
                    new_entries.append(entry)
    return new_entries

existing = load_existing()
all_new = []

# Ekb Design
all_new.extend(parse_md_table('ekb_design_studios.md', 'Екатеринбург', 'Свердловская область', 'Дизайн-студия / Архбюро'))
# Novosib Furniture
all_new.extend(parse_md_table('novosib_furniture.md', 'Новосибирск', 'Новосибирская область', 'Мебельная компания'))

unique_new = []
seen_names = set()

for entry in all_new:
    name_lower = entry['Название'].lower()
    if name_lower not in existing and name_lower not in seen_names:
        unique_new.append(entry)
        seen_names.add(name_lower)

print(f"Found {len(unique_new)} unique new companies.")

with open('unique_new.json', 'w', encoding='utf-8') as f:
    json.dump(unique_new, f, ensure_ascii=False, indent=2)
