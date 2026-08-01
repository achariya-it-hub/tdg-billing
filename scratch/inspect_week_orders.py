import json

with open("server/db.json", "r", encoding="utf-8") as f:
    db = json.load(f)

orders = db.get("orders", [])

def get_date(o):
    d = str(o.get("date") or o.get("createdAt") or o.get("paidAt") or "")
    return d[:10]

week_orders = [o for o in orders if "2026-07-27" <= get_date(o) <= "2026-08-02"]

completed_week = []
pending_week = []

for o in week_orders:
    st = str(o.get("status") or "").lower()
    pst = str(o.get("paymentStatus") or "").lower()
    if st in ["cancelled", "void"]:
        continue
    if st in ["completed", "served", "delivered"] or pst == "paid" or o.get("paidAt"):
        completed_week.append(o)
    else:
        pending_week.append(o)

comp_sum = sum(o.get("total", 0) for o in completed_week)
pend_sum = sum(o.get("total", 0) for o in pending_week)

print(f"Week orders total count: {len(week_orders)}")
print(f"Completed week count: {len(completed_week)} | Sum = Rs. {comp_sum}")
print(f"Pending week count:   {len(pending_week)} | Sum = Rs. {pend_sum}")
print(f"Total Sales (Completed + Pending): Rs. {comp_sum + pend_sum}")
