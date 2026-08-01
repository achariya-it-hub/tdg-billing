import json
from collections import defaultdict
from datetime import datetime

with open("server/db.json", "r", encoding="utf-8") as f:
    data = json.load(f)

orders = data.get("orders", [])

dates = set()
for o in orders:
    created = o.get("createdAt") or o.get("date") or ""
    if created:
        dates.add(created[:10])

print("Available order dates:", sorted(list(dates)))

latest_date = "2026-07-31" # latest sales day in store
today_orders = [o for o in orders if (o.get("createdAt") or o.get("date") or "").startswith(latest_date)]

print(f"Total orders for {latest_date}: {len(today_orders)}")

slot_3h = defaultdict(lambda: {"count": 0, "total": 0})

slots = [
    ("09:00 AM - 12:00 PM", 9, 12),
    ("12:00 PM - 03:00 PM", 12, 15),
    ("03:00 PM - 06:00 PM", 15, 18),
    ("06:00 PM - 09:00 PM", 18, 21),
    ("09:00 PM - 11:59 PM", 21, 24),
]

for o in today_orders:
    created = o.get("createdAt") or o.get("date") or ""
    # parse time from ISO string or standard string
    hour = 12
    if "T" in created:
        time_part = created.split("T")[1]
        hour = int(time_part.split(":")[0])
    elif " " in created:
        time_part = created.split(" ")[1]
        hour = int(time_part.split(":")[0])

    tot = float(o.get("total") or o.get("totalPrice") or 0)

    matched_slot = False
    for slot_name, start_h, end_h in slots:
        if start_h <= hour < end_h:
            slot_3h[slot_name]["count"] += 1
            slot_3h[slot_name]["total"] += tot
            matched_slot = True
            break
    if not matched_slot:
        slot_3h["09:00 AM - 12:00 PM"]["count"] += 1
        slot_3h["09:00 AM - 12:00 PM"]["total"] += tot

grand_total = sum(s["total"] for s in slot_3h.values())
grand_bills = sum(s["count"] for s in slot_3h.values())

print("\n--- 3-HOUR SLOT BREAKDOWN ---")
print(f"Date: {latest_date}")
print(f"Total Bills: {grand_bills}, Total Revenue: RS {grand_total:,.2f}")
print(f"Average Bill Value: RS {grand_total/grand_bills:.0f}")

for slot_name, start_h, end_h in slots:
    st = slot_3h[slot_name]
    avg = (st["total"] / st["count"]) if st["count"] > 0 else 0
    share = (st["total"] / grand_total * 100) if grand_total > 0 else 0
    print(f"{slot_name}: {st['count']} bills | RS {st['total']:,.2f} | Avg: RS {avg:.0f} | Share: {share:.1f}%")
