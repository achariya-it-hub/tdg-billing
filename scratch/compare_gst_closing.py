import json

with open("server/db.json", "r", encoding="utf-8") as f:
    db = json.load(f)

orders = db.get("orders", [])

period = "2026-07"

# Old GST Filing logic
old_gst_orders = [o for o in orders if str(o.get("createdAt") or "").startswith(period) and o.get("status") in ["completed", "served", "delivered"]]
old_sales = sum(o.get("total", 0) for o in old_gst_orders)

# Daily Closing / Standardized logic
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

std_orders = [o for o in orders if get_order_date(o).startswith(period) and is_valid_sales_order(o)]
std_sales = sum(o.get("total", 0) for o in std_orders)

print(f"Period: {period}")
print(f"OLD GST Filing Logic:   Invoices = {len(old_gst_orders)} | Total Sales = Rs. {old_sales}")
print(f"NEW Synchronized Logic: Invoices = {len(std_orders)} | Total Sales = Rs. {std_sales}")
