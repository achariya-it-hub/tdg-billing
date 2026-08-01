import json

with open("server/db.json", "r", encoding="utf-8") as f:
    db = json.load(f)

orders = db.get("orders", [])

print("--- DAILY ORDER COUNTS IN DB.JSON ---")
by_date_all = {}
by_date_valid = {}

for o in orders:
    d = (o.get("createdAt") or o.get("date") or "")[:10]
    by_date_all[d] = by_date_all.get(d, 0) + 1
    if o.get("status") == "completed" or o.get("status") == "paid" or o.get("status") is None:
        by_date_valid[d] = by_date_valid.get(d, 0) + 1

for d in sorted(by_date_all.keys()):
    print(f"Date: {d} | All Orders: {by_date_all[d]} | Valid Orders: {by_date_valid.get(d, 0)}")

# Check if any date has 73 orders or if 73 appears anywhere in reports or db.json
print("\n--- SEARCHING FOR 73 IN DB.JSON ---")
matching_73_orders = [o for o in orders if o.get("orderNumber") == 73 or o.get("id") == "73" or o.get("id") == 73]
print(f"Orders with orderNumber/id 73: {len(matching_73_orders)}")
