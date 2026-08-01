import json

with open("server/db.json", "r", encoding="utf-8") as f:
    db = json.load(f)

orders = db.get("orders", [])

print(f"Total orders in db.json: {len(orders)}")

cancelled_orders = []
for idx, o in enumerate(orders):
    st = str(o.get("status", "")).lower()
    if st == "cancelled" or st == "canceled" or st == "void" or o.get("isCancelled") or o.get("isVoid"):
        cancelled_orders.append((idx, o))

print(f"\nTotal Cancelled Orders Found in db.json: {len(cancelled_orders)}")

for idx, o in cancelled_orders:
    bill_no = o.get("orderNumber") or o.get("id") or f"Order #{idx}"
    created = o.get("createdAt") or o.get("date") or ""
    total = o.get("total") or o.get("totalPrice") or 0
    cust = o.get("customerName") or o.get("tableNumber") or "Walk-in"
    items = o.get("items", [])
    item_str = ", ".join([f"{i.get('menuItemName') or i.get('name')} x{i.get('quantity')}" for i in items]) if items else "No items"
    reason = o.get("cancelReason") or o.get("notes") or "Cancelled by POS/Customer"
    print(f"Bill #{bill_no} | Date/Time: {created} | Customer/Table: {cust} | Items: {item_str} | Value: RS {total} | Reason: {reason}")

# Also check date-wise cancelled orders
date_cancelled = {}
for idx, o in enumerate(orders):
    st = str(o.get("status", "")).lower()
    d = (o.get("createdAt") or o.get("date") or "")[:10]
    if st in ["cancelled", "canceled", "void"] or o.get("isCancelled"):
        date_cancelled[d] = date_cancelled.get(d, 0) + 1

print("\nDate-wise Cancelled Orders Count:", date_cancelled)
