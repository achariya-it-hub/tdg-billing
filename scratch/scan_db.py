import json

with open("server/db.json", "r", encoding="utf-8") as f:
    db = json.load(f)

today = "2026-07-31"

print(f"--- Checking all keys in db.json for records matching '{today}' ---")

for key, val in db.items():
    if isinstance(val, list):
        matches = []
        for item in val:
            item_str = json.dumps(item)
            if today in item_str:
                matches.append(item)
        print(f"Collection '{key}': total items = {len(val)}, items matching '{today}' = {len(matches)}")
        if matches:
            print(f"  Sample match in '{key}':", matches[0])
    elif isinstance(val, dict):
        val_str = json.dumps(val)
        if today in val_str:
            print(f"Key '{key}' (dict) contains '{today}'")

print("\n--- Summary of Orders & Bills ---")
orders = db.get("orders", [])
orders_vault = db.get("ordersVault", [])
all_orders = orders + orders_vault

print(f"Total Active Orders: {len(orders)}")
print(f"Total Vault Orders: {len(orders_vault)}")
print(f"Total Combined Orders: {len(all_orders)}")

# Check dates of orders
today_orders = [o for o in all_orders if today in str(o.get("date") or o.get("createdAt") or o.get("paidAt") or "")]
print(f"Orders created today ({today}): {len(today_orders)}")

# Latest order details
if all_orders:
    # Sort by ID
    all_orders_sorted = sorted(all_orders, key=lambda x: x.get("id") or 0)
    latest_order = all_orders_sorted[-1]
    print(f"Most Recent Order in System: ID {latest_order.get('id')} | KOT {latest_order.get('kotNumber')} | Date {latest_order.get('date')} | CreatedAt {latest_order.get('createdAt')}")
