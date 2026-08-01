import json

with open("deploy-hostinger/server/seed-db.json", "r", encoding="utf-8") as f:
    data = json.load(f)

orders = data.get("orders", []) + data.get("ordersVault", [])

today_orders = []
for o in orders:
    ca = str(o.get("createdAt") or o.get("paidAt") or o.get("date") or "")
    if "2026-07-31" in ca:
        today_orders.append(o)

total_revenue = sum(o.get("total", 0) for o in today_orders)
subtotal_revenue = sum(o.get("subtotal", 0) for o in today_orders)
tax_total = sum(o.get("tax", 0) for o in today_orders)

types = {}
payments = {}

for o in today_orders:
    t = o.get("type", "unknown")
    p = o.get("paymentMethod", "unknown")
    types[t] = types.get(t, 0) + 1
    payments[p] = payments.get(p, 0) + 1

print(f"Total Bills Today (2026-07-31): {len(today_orders)}")
print(f"Total Revenue: Rs. {total_revenue}")
print(f"Subtotal: Rs. {subtotal_revenue}")
print(f"Tax: Rs. {tax_total}")
print(f"Order Types: {types}")
print(f"Payment Methods: {payments}")
print(f"Time Range: {today_orders[0].get('createdAt')} to {today_orders[-1].get('createdAt')}")
