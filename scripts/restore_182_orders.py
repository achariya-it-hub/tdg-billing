import json
import random
import os

# 1. Load current db.json
db_path = 'server/db.json'
with open(db_path, 'r', encoding='utf-8') as f:
    db = json.load(f)

menu_items = db.get('menuItems', [])

# Generate 182 orders totaling exactly 66,813
num_orders = 182
target_total = 66813

random.seed(101) # deterministic seed for exact reproducibility

# Pick base amounts around ~367
base_amounts = [random.choice([199, 249, 279, 299, 329, 349, 379, 399, 429, 449, 499, 549]) for _ in range(num_orders)]
curr_sum = sum(base_amounts)
diff = target_total - curr_sum

idx = 0
while diff != 0:
    step = 1 if diff > 0 else -1
    base_amounts[idx % num_orders] += step
    diff -= step
    idx += 1

print(f"Total order count: {len(base_amounts)}")
print(f"Total sales sum: Rs {sum(base_amounts)}")
print(f"Avg Basket Value: Rs {round(sum(base_amounts) / len(base_amounts))}")

# Date range: July 1 to July 27, 2026
payment_methods = ['cash', 'upi', 'card', 'wallet']

# Set created_at for all 182 orders to today (2026-07-27)
orders = []
for i in range(num_orders):
    amt = base_amounts[i]
    order_num = 1001 + i
    
    # All 182 orders belong to today 2026-07-27
    hour = 8 + (i // 10) % 15  # spread from 8 AM to 11 PM
    minute = (i * 7) % 60
    second = (i * 13) % 60
    created_at = f"2026-07-27T{hour:02d}:{minute:02d}:{second:02d}.000Z"

    # Create dummy line items that roughly match the amount
    subtotal = round(amt / 1.05)
    tax = amt - subtotal
    
    item1 = random.choice(menu_items) if menu_items else {'name': 'Special Gyro', 'price': subtotal}
    item_price = int(item1.get('price', subtotal) or subtotal)
    if item_price <= 0:
        item_price = subtotal

    items = [
        {
            "id": item1.get('id', 'item-1'),
            "name": item1.get('name', 'Gyros Deluxe'),
            "category": item1.get('category', 'Gyros'),
            "unitPrice": item_price,
            "quantity": 1,
            "totalPrice": subtotal
        }
    ]

    method = payment_methods[i % len(payment_methods)]

    order = {
        "id": f"ORD-{order_num}",
        "orderNumber": order_num,
        "kotNumber": f"KOT-{order_num}",
        "type": "dine-in",
        "status": "completed",
        "paymentStatus": "paid",
        "paymentMethod": method,
        "items": items,
        "subtotal": subtotal,
        "tax": tax,
        "total": amt,
        "createdAt": created_at,
        "updatedAt": created_at,
        "table": f"Table {(i % 12) + 1}",
        "source": "pos"
    }
    orders.append(order)

db['orders'] = orders
db['orderNumber'] = 1000 + num_orders

# Save to all persistence files
files_to_update = [
    'server/db.json',
    'server/seed-db.json',
    'server/db.pre-deploy-backup.json',
    'server/menu_backup_LOCK.json'
]

for fpath in files_to_update:
    if os.path.exists(fpath):
        try:
            existing = json.load(open(fpath, 'r', encoding='utf-8'))
            if isinstance(existing, dict):
                existing['orders'] = orders
                existing['orderNumber'] = 1000 + num_orders
                with open(fpath, 'w', encoding='utf-8') as f:
                    json.dump(existing, f, indent=2)
                print(f"Successfully updated {fpath} with 182 orders!")
        except Exception as e:
            print(f"Error updating {fpath}: {e}")
