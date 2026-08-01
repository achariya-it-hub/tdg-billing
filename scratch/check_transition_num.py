import json

with open("deploy-hostinger/server/seed-db.json", "r", encoding="utf-8") as f:
    data = json.load(f)

orders = data.get("orders", []) + data.get("ordersVault", [])

num_orders = []
for o in orders:
    oid = o.get("id") or o.get("orderNumber")
    if isinstance(oid, int):
        num_orders.append(o)

# Group by date
by_date = {}
for o in num_orders:
    d = o.get("date") or str(o.get("createdAt") or "")[:10]
    by_date.setdefault(d, []).append(o)

for d in sorted(by_date.keys()):
    d_orders = by_date[d]
    ids = sorted([o["id"] for o in d_orders if isinstance(o.get("id"), int)])
    if ids:
        print(f"Date: {d} | Count: {len(ids)} | Min ID: {ids[0]} | Max ID: {ids[-1]}")

j30_ids = sorted([o["id"] for o in by_date.get("2026-07-30", []) if isinstance(o.get("id"), int)])
j31_ids = sorted([o["id"] for o in by_date.get("2026-07-31", []) if isinstance(o.get("id"), int)])

print("\n--- Transition Check ---")
print(f"July 30 Integer IDs: Min {j30_ids[0] if j30_ids else None} | Max {j30_ids[-1] if j30_ids else None}")
print(f"July 31 Integer IDs: Min {j31_ids[0] if j31_ids else None} | Max {j31_ids[-1] if j31_ids else None}")

if j30_ids and j31_ids:
    diff = j31_ids[0] - j30_ids[-1]
    print(f"Difference between July 30 max ({j30_ids[-1]}) and July 31 min ({j31_ids[0]}): {diff}")
