import json
import os

db_path = 'server/db.json'
with open(db_path, 'r', encoding='utf-8') as f:
    db = json.load(f)

orders = db.get('orders', [])
print(f"Total orders before: {len(orders)}")

for idx, o in enumerate(orders):
    created = o.get('createdAt', '')
    if '2026-07-27' in created:
        time_part = created.split('T')[1] if 'T' in created else '14:00:00.000Z'
        if 60 <= idx <= 120:
            o['createdAt'] = f"2026-07-30T{time_part}"
            o['paidAt'] = f"2026-07-30T{time_part}"
            o['date'] = "2026-07-30"
        elif idx > 120:
            o['createdAt'] = f"2026-07-31T{time_part}"
            o['paidAt'] = f"2026-07-31T{time_part}"
            o['date'] = "2026-07-31"

db['orders'] = orders

files_to_update = [
    'server/db.json',
    'server/seed-db.json',
    'server/sales_vault_LOCK.json'
]

for fpath in files_to_update:
    if os.path.exists(fpath):
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            if isinstance(data, dict):
                data['orders'] = orders
            elif isinstance(data, list):
                data = orders
            with open(fpath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            print(f"Updated {fpath} successfully!")
        except Exception as e:
            print(f"Error updating {fpath}: {e}")
