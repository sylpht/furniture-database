import json
import os

def load_existing():
    with open('existing_names_v3.txt', 'r', encoding='utf-8') as f:
        return set(line.strip().lower() for line in f if line.strip())

def parse_md_table(file_path, city_default, region_default, type_default):
    new_entries = []
    if not os.path.exists(file_path):
        print(f"File {file_path} not found")
        return []
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        for line in lines:
            if '|' in line and not line.startswith('| :---') and 'Название' not in line:
                parts = [p.strip() for p in line.split('|') if p.strip()]
                if len(parts) >= 3:
                    name = parts[0]
                    phone_or_site = parts[1]
                    city_or_addr = parts[2]
                    spec = parts[3] if len(parts) > 3 else "Мебель"
                    
                    # Heuristic to distinguish phone/site/city
                    phone = phone_or_site if any(c.isdigit() for c in phone_or_site) and '+' in phone_or_site else ""
                    site = phone_or_site if '.' in phone_or_site and not phone else ""
                    
                    entry = {
                        "Название": name,
                        "Город": city_default if city_default else city_or_addr,
                        "Регион": region_default,
                        "Адрес": city_or_addr if city_default else "",
                        "Телефон": phone,
                        "WhatsApp": "",
                        "Telegram": "",
                        "Email": "",
                        "Сайт": f"https://{site}" if site and not site.startswith('http') else site if site.startswith('http') else "",
                        "Соцсети": "",
                        "Специализация": spec,
                        "Краткое описание": f"{type_default}: {spec}",
                        "Сегмент": "Дизайнерская" if "дизайн" in spec.lower() or "премиум" in spec.lower() else "Масс-маркет",
                        "Потенциал сотрудничества": "ВЫСОКИЙ (новый уникальный контакт)",
                        "Первый шаг контакта": "Звонок с предложением сотрудничества",
                        "Источник": "Поиск 2026 (Поволжье/Юг)",
                        "Тип": type_default
                    }
                    new_entries.append(entry)
    return new_entries

existing = load_existing()
all_new = []

# Kazan
all_new.extend(parse_md_table('/home/ubuntu/kazan_furniture.md', 'Казань', 'Татарстан', 'Мебельная компания'))
# Krasnodar
all_new.extend(parse_md_table('/home/ubuntu/krasnodar_design.md', 'Краснодар', 'Краснодарский край', 'Дизайн-студия'))
# Samara/Rostov/HoReCa
all_new.extend(parse_md_table('/home/ubuntu/samara_rostov_furniture.md', None, 'Поволжье/Юг/РФ', 'Мебель/Дизайн/HoReCa'))

unique_new = []
seen_names = set()

for entry in all_new:
    name_lower = entry['Название'].lower()
    if name_lower not in existing and name_lower not in seen_names:
        unique_new.append(entry)
        seen_names.add(name_lower)

print(f"Found {len(unique_new)} unique new companies.")

with open('unique_new_v3.json', 'w', encoding='utf-8') as f:
    json.dump(unique_new, f, ensure_ascii=False, indent=2)
