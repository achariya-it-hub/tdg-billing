import json

with open("server/db.json", "r", encoding="utf-8") as f:
    data = json.load(f)

orders = data.get("orders", [])

july31 = [o for o in orders if "2026-07-31" in str(o.get("date") or o.get("createdAt") or "")]

print(f"Total orders for 2026-07-31 in server/db.json: {len(july31)}")

total_sales = sum(o.get("total", 0) for o in july31)
print(f"Total sales sum: Rs. {total_sales}")

print("\nListing all orders for 2026-07-31:")
for i, o in enumerate(july31):
    print(f"{i+1}. ID: {o.get('id')} | Number: {o.get('orderNumber')} | KOT: {o.get('kotNumber')} | Time: {o.get('createdAt')} | Total: Rs.{o.get('total')} | Type: {o.get('type')}")
