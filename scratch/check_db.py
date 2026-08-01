import os
import json

print("Checking all backup files for 2026-07-31 orders...")
backup_dir = "server/backups"
found_today = 0

for f in os.listdir(backup_dir):
    if f.endswith(".json"):
        filepath = os.path.join(backup_dir, f)
        try:
            with open(filepath, "r", encoding="utf-8") as file:
                data = json.load(file)
                orders = data.get("orders", [])
                orders_vault = data.get("ordersVault", [])
                for o in orders + orders_vault:
                    d_str = str(o.get("date") or o.get("createdAt") or o.get("paidAt") or "")
                    if "2026-07-31" in d_str:
                        found_today += 1
                        print(f"Found order in {f}: {o}")
        except Exception as e:
            pass

print(f"Total 2026-07-31 orders in backups: {found_today}")

# Let's also check all orders in db.json sorted by timestamp to find the latest order date
if os.path.exists("server/db.json"):
    with open("server/db.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    orders = data.get("orders", []) + data.get("ordersVault", [])
    # Sort orders by ID or createdAt
    def get_sort_key(o):
        return o.get("createdAt") or o.get("date") or ""
    orders.sort(key=get_sort_key)
    
    print("\nTop 10 absolute latest orders in db.json:")
    for o in orders[-10:]:
        print(f"ID: {o.get('id') or o.get('orderNumber')} | Date: {o.get('date')} | CreatedAt: {o.get('createdAt')} | Total: {o.get('total')}")
