import json

with open("server/db.json", "r", encoding="utf-8") as f:
    db = json.load(f)

orders = db.get("orders", [])

# Let's filter week/month orders
completed = []
pending = []

for o in orders:
    st = str(o.get("status") or "").lower()
    pst = str(o.get("paymentStatus") or "").lower()
    amt = o.get("total") or 0
    if st == "cancelled" or st == "void":
        continue
    if st in ["completed", "served", "delivered"] or pst == "paid" or o.get("paidAt"):
        completed.append(o)
    else:
        pending.append(o)

comp_tot = sum(o.get("total", 0) for o in completed)
pend_tot = sum(o.get("total", 0) for o in pending)

print(f"Completed orders: {len(completed)} | Sum = Rs. {comp_tot}")
print(f"Pending orders:   {len(pending)} | Sum = Rs. {pend_tot}")
print(f"Total Combined:   {len(completed) + len(pending)} | Sum = Rs. {comp_tot + pend_tot}")
