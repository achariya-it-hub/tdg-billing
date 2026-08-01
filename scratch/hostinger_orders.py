import json
from datetime import datetime

with open("deploy-hostinger/server/seed-db.json", "r", encoding="utf-8") as f:
    data = json.load(f)

orders = data.get("orders", []) + data.get("ordersVault", [])

today_orders = []
for o in orders:
    ca = str(o.get("createdAt") or o.get("paidAt") or o.get("date") or "")
    if "2026-07-31" in ca:
        today_orders.append(o)

print(f"Total orders in deploy-hostinger/server/seed-db.json for 2026-07-31: {len(today_orders)}")

# Filter between 09:00:00 and 22:19:00 IST
filtered_orders = []
for o in today_orders:
    ca = o.get("createdAt") or o.get("paidAt") or ""
    # Extract time component if present
    # e.g., '2026-07-31T18:14:26.000+05:30'
    if "T" in ca:
        time_part = ca.split("T")[1].split(".")[0] # e.g. '18:14:26'
        h, m, s = map(int, time_part.split(":"))
        # 9:00 AM = 09:00:00, 22:19 PM = 22:19:00
        if (h > 9 or (h == 9 and m >= 0)) and (h < 22 or (h == 22 and m <= 19)):
            filtered_orders.append((ca, o))
    else:
        filtered_orders.append((ca, o))

print(f"Orders between 09:00 AM and 22:19 PM (22:19:28): {len(filtered_orders)}")

filtered_orders.sort(key=lambda x: x[0])

print("\nDetail of matching orders:")
for dt, o in filtered_orders:
    print(f"- ID: {o.get('id') or o.get('orderNumber')} | Time: {dt} | Total: Rs.{o.get('total')} | Type: {o.get('type')} | Payment: {o.get('paymentMethod')}")
