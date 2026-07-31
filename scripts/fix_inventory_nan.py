import json
import os

files_to_update = [
    'server/db.json',
    'server/seed-db.json',
    'server/menu_backup_LOCK.json',
    'server/sales_vault_LOCK.json',
    'deploy-hostinger/server/db.json',
    'deploy-hostinger/server/seed-db.json'
]

default_prices = {
    '1': 180.00,
    '2': 8.00,
    '3': 45.00
}

for fpath in files_to_update:
    if os.path.exists(fpath):
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if isinstance(data, dict):
                existing_inv = data.get('inventory', [])
                cleaned_inv = []
                for item in existing_inv:
                    # Filter out old dummy items without proper fields or fill defaults
                    if item.get('id') in ['1', '2', '3'] and 'costPerUnit' not in item:
                        item['costPerUnit'] = default_prices.get(item['id'], 50.00)
                        item['currentStock'] = float(item.get('currentStock', 50))
                        item['minimumStock'] = float(item.get('minimumStock', 10))
                        item['unit'] = item.get('unit', 'kg')
                        item['category'] = item.get('category', 'Raw Material')
                    
                    # Ensure numeric costPerUnit and currentStock
                    item['costPerUnit'] = float(item.get('costPerUnit', 0) or 0)
                    item['currentStock'] = float(item.get('currentStock', 0) or 0)
                    item['minimumStock'] = float(item.get('minimumStock', 0) or 0)
                    cleaned_inv.append(item)
                
                data['inventory'] = cleaned_inv
                with open(fpath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)
                print(f"Fixed {fpath} inventory numeric values!")
        except Exception as e:
            print(f"Error updating {fpath}: {e}")
