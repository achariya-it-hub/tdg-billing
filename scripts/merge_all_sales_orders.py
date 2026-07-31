import json
import os
import glob

order_map = {}

# File search list
search_files = [
    'server/db.json',
    'server/seed-db.json',
    'server/menu_backup_LOCK.json',
    'server/sales_vault_LOCK.json',
    'deploy-hostinger/server/db.json',
    'deploy-hostinger/server/seed-db.json'
]

# Add all JSON files in server/backups and server/daily-backups
search_files.extend(glob.glob('server/backups/*.json'))
search_files.extend(glob.glob('server/daily-backups/*.json'))

total_scanned = 0

for fpath in search_files:
    if os.path.exists(fpath):
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                if not content:
                    continue
                data = json.loads(content)
                ords = []
                if isinstance(data, dict):
                    ords = data.get('orders', [])
                elif isinstance(data, list):
                    ords = data
                
                for o in ords:
                    if isinstance(o, dict):
                        key = str(o.get('id') or o.get('orderNumber') or o.get('createdAt'))
                        if key and key not in order_map:
                            order_map[key] = o
                            total_scanned += 1
        except Exception as e:
            print(f"Error reading {fpath}: {e}")

all_orders = list(order_map.values())
print(f"Merged total unique orders: {len(all_orders)}")

# Group orders by date YYYY-MM-DD
by_date = {}
for o in all_orders:
    date_val = str(o.get('createdAt') or o.get('date') or o.get('paidAt') or '')[:10]
    if date_val:
        by_date[date_val] = by_date.get(date_val, 0) + (float(o.get('total', 0) or 0))

print("\nDate wise Sales Breakdown:")
for d in sorted(by_date.keys()):
    print(f"  {d}: {by_date[d]:,.2f}")

# Write merged orders to db.json, sales_vault_LOCK.json, seed-db.json, deploy-hostinger
targets = [
    'server/db.json',
    'server/seed-db.json',
    'server/sales_vault_LOCK.json',
    'deploy-hostinger/server/db.json',
    'deploy-hostinger/server/seed-db.json'
]

for tpath in targets:
    if os.path.exists(tpath):
        try:
            with open(tpath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            if isinstance(data, dict):
                data['orders'] = all_orders
                with open(tpath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)
                print(f"Successfully synced {len(all_orders)} orders into {tpath}")
        except Exception as e:
            print(f"Error updating {tpath}: {e}")
