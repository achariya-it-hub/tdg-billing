import json

with open("server/db.json", "r", encoding="utf-8") as f:
    db = json.load(f)

orders = db.get("orders", [])

def get_order_date(o):
    val = str(o.get("date") or o.get("createdAt") or o.get("paidAt") or "")
    if len(val) >= 10 and val[4] == "-" and val[7] == "-":
        return val[:10]
    return val

def is_valid_sales_order(o):
    st = str(o.get("status") or "").lower()
    pst = str(o.get("paymentStatus") or "").lower()
    if st in ["cancelled", "void", "refunded"]:
        return False
    if pst == "paid" or st in ["completed", "served", "delivered", "paid"] or o.get("paidAt"):
        return True
    return False

gst_orders_from_27th = [
    o for o in orders 
    if is_valid_sales_order(o) and get_order_date(o) >= "2026-07-27" and get_order_date(o) <= "2026-07-31"
]

total_sales = sum(o.get("total", 0) for o in gst_orders_from_27th)

print(f"GST Filing orders from July 27th: {len(gst_orders_from_27th)} bills")
print(f"GST Filing total sales: Rs. {total_sales}")
