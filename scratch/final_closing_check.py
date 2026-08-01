import json

with open("server/db.json", "r", encoding="utf-8") as f:
    db = json.load(f)

orders = [o for o in db.get("orders", []) if "2026-07-31" in str(o.get("date") or o.get("createdAt") or "")]

total_sales = sum(o.get("total", 0) for o in orders)
total_subtotal = sum(o.get("subtotal", 0) for o in orders)
total_tax = sum(o.get("tax", 0) for o in orders)

upi_orders = [o for o in orders if o.get("paymentMethod") == "upi"]
cash_orders = [o for o in orders if o.get("paymentMethod") == "cash"]

dinein_orders = [o for o in orders if o.get("type") == "dine-in"]
takeaway_orders = [o for o in orders if o.get("type") == "takeaway"]

print(f"Total Invoices: {len(orders)}")
print(f"Total Gross Sales: Rs. {total_sales}")
print(f"Subtotal: Rs. {total_subtotal}")
print(f"Tax (GST): Rs. {total_tax}")
print(f"Avg Basket Value: Rs. {round(total_sales / len(orders)) if orders else 0}")
print(f"UPI Sales: Rs. {sum(o.get('total', 0) for o in upi_orders)} ({len(upi_orders)} bills)")
print(f"Cash Sales: Rs. {sum(o.get('total', 0) for o in cash_orders)} ({len(cash_orders)} bills)")
print(f"Dine-in Sales: Rs. {sum(o.get('total', 0) for o in dinein_orders)} ({len(dinein_orders)} bills)")
print(f"Takeaway Sales: Rs. {sum(o.get('total', 0) for o in takeaway_orders)} ({len(takeaway_orders)} bills)")
