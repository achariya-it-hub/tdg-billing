import json

with open("deploy-hostinger/server/seed-db.json", "r", encoding="utf-8") as f:
    data = json.load(f)

orders = data.get("orders", []) + data.get("ordersVault", [])

# Group orders by date
by_date = {}
for o in orders:
    d = o.get("date") or str(o.get("createdAt") or "")[:10]
    if d not in by_date:
        by_date[d] = []
    by_date[d].append(o)

print("Order ID range per date:")
for d in sorted(by_date.keys()):
    date_orders = by_date[d]
    ids = [o.get("id") or o.get("orderNumber") for o in date_orders if (o.get("id") or o.get("orderNumber")) is not None]
    if ids:
        print(f"Date: {d} | Count: {len(ids)} | Min ID: {min(ids)} | Max ID: {max(ids)}")

# Check transition between 2026-07-30 and 2026-07-31
july_30 = by_date.get("2026-07-30", [])
july_31 = by_date.get("2026-07-31", [])

j30_ids = sorted([o.get("id") for o in july_30 if o.get("id") is not None])
j31_ids = sorted([o.get("id") for o in july_31 if o.get("id") is not None])

print("\n--- Transition Check ---")
print(f"July 30 Max ID: {j30_ids[-1] if j30_ids else 'None'}")
print(f"July 31 Min ID: {j31_ids[0] if j31_ids else 'None'}")
if j30_ids and j31_ids:
    diff = j31_ids[0] - j30_ids[-1]
    print(f"Difference between July 30 last ID ({j30_ids[-1]}) and July 31 first ID ({j31_ids[0]}): {diff}")
    if diff == 1:
        print("PERFECT CONTINUITY! No order numbers missing between July 30 and July 31.")
    else:
        print(f"GAP OF {diff - 1} ORDER NUMBERS BETWEEN JULY 30 AND JULY 31!")
