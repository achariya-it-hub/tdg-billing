import json
import os

# Load exact orders for 27.07.2026 from menu_backup_LOCK.json
backup_path = 'server/menu_backup_LOCK.json'
with open(backup_path, 'r', encoding='utf-8') as f:
    backup_data = json.load(f)

backup_orders = backup_data.get('orders', [])
orders_27 = [o for o in backup_orders if '2026-07-27' in str(o.get('createdAt') or o.get('date') or '')]

print(f"Loaded {len(orders_27)} exact orders for 2026-07-27 totaling Rs.{sum(o.get('total', 0) for o in orders_27):,.2f}")

# Target DB files
target_files = [
    'server/db.json',
    'server/seed-db.json',
    'server/sales_vault_LOCK.json',
    'deploy-hostinger/server/db.json',
    'deploy-hostinger/server/seed-db.json'
]

for tpath in target_files:
    if os.path.exists(tpath):
        with open(tpath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        current_orders = data.get('orders', [])
        # Keep non-27th orders from current_orders
        non_27_orders = [o for o in current_orders if '2026-07-27' not in str(o.get('createdAt') or o.get('date') or '')]
        
        # Combine non-27 orders with exact 182 orders from 27th
        final_orders = orders_27 + non_27_orders
        data['orders'] = final_orders
        
        with open(tpath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f"Updated {tpath}: 27th July = {len(orders_27)} orders (Rs.{sum(o.get('total', 0) for o in orders_27):,.2f}), Total orders = {len(final_orders)}")
