import json

with open("server/db.json", "r", encoding="utf-8") as f:
    db = json.load(f)

orders = db.get("orders", []) + db.get("ordersVault", [])

def parse_date(o):
    return str(o.get("createdAt") or o.get("date") or "")

orders.sort(key=parse_date, reverse=True)

print("Top 5 most recent orders in database:")
for o in orders[:5]:
    print(f"- Order ID: {o.get('id')} | Number: {o.get('orderNumber')} | KOT: {o.get('kotNumber')} | Date: {o.get('date')} | CreatedAt: {o.get('createdAt')} | Total: Rs.{o.get('total')} | Status: {o.get('status')}")
