import json
import os
import glob

print("=== CHECKING FOR MISSED BILLS BETWEEN 14:00 (2:00 PM) and 14:45 (2:45 PM) ON 2026-07-31 ===")

# 1. Check all JSON files in the entire project for any orders created on 2026-07-31
target_date = "2026-07-31"

all_orders_found = []

for root, dirs, files in os.walk("."):
    if ".git" in root or "node_modules" in root:
        continue
    for f in files:
        if f.endswith(".json") or f.endswith(".db"):
            fpath = os.path.join(root, f)
            try:
                if f.endswith(".json"):
                    with open(fpath, "r", encoding="utf-8", errors="ignore") as fp:
                        text = fp.read()
                        if target_date in text:
                            data = json.loads(text)
                            orders = []
                            if isinstance(data, dict):
                                orders.extend(data.get("orders", []))
                                orders.extend(data.get("ordersVault", []))
                            elif isinstance(data, list):
                                orders = data
                            
                            for o in orders:
                                if isinstance(o, dict):
                                    ca = str(o.get("createdAt") or o.get("paidAt") or o.get("date") or "")
                                    if target_date in ca:
                                        all_orders_found.append((fpath, o))
            except Exception as e:
                pass

print(f"Total order records matching date '{target_date}' across all files: {len(all_orders_found)}")

# Check timestamps of all orders on 2026-07-31
orders_by_id = {}
for fpath, o in all_orders_found:
    oid = o.get("id") or o.get("orderNumber")
    if oid:
        if oid not in orders_by_id:
            orders_by_id[oid] = (fpath, o)

sorted_ids = sorted(orders_by_id.keys())
print(f"Unique Order IDs found for {target_date}: {len(sorted_ids)}")
if sorted_ids:
    print(f"ID Range: Min {sorted_ids[0]} to Max {sorted_ids[-1]}")

# Check for gaps in order IDs
print("\n--- Sequence Gap Check ---")
gaps = []
for i in range(len(sorted_ids) - 1):
    curr = sorted_ids[i]
    nxt = sorted_ids[i+1]
    if isinstance(curr, int) and isinstance(nxt, int):
        if nxt - curr > 1:
            gaps.append((curr, nxt, nxt - curr - 1))

if gaps:
    print("Found gaps in order ID sequence:")
    for g in gaps:
        print(f"  Gap between Order #{g[0]} and Order #{g[1]} ({g[2]} missing order number(s))")
else:
    print("No gaps found in order ID sequence!")

# Check specifically for timestamps around 14:00 - 14:45
print("\n--- Timestamp Analysis around 14:00 - 14:45 (2:00 PM - 2:45 PM) ---")
afternoon_orders = []
for oid, (fpath, o) in orders_by_id.items():
    ca = str(o.get("createdAt") or o.get("paidAt") or "")
    if "T" in ca:
        time_str = ca.split("T")[1].split(".")[0]
        h = int(time_str.split(":")[0])
        m = int(time_str.split(":")[1])
        if 13 <= h <= 16:
            afternoon_orders.append((ca, oid, o, fpath))

afternoon_orders.sort(key=lambda x: x[0])
print(f"Orders between 1:00 PM and 4:00 PM on 2026-07-31: {len(afternoon_orders)}")
for ca, oid, o, fpath in afternoon_orders:
    print(f"  Time: {ca} | ID: {oid} | Total: Rs. {o.get('total')}")

# Also check earliest order of the day
print("\nEarliest 5 orders on 2026-07-31:")
all_today_sorted = sorted([(str(o.get("createdAt") or ""), oid, o) for oid, (fpath, o) in orders_by_id.items()])
for ca, oid, o in all_today_sorted[:5]:
    print(f"  Time: {ca} | ID: {oid} | Total: Rs. {o.get('total')}")
