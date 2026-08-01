import json
from collections import defaultdict

with open("server/db.json", "r", encoding="utf-8") as f:
    data = json.load(f)

orders = data.get("orders", [])
latest_date = "2026-07-31"
today_orders = [o for o in orders if (o.get("createdAt") or o.get("date") or "").startswith(latest_date)]

hourly_map = defaultdict(lambda: {"count": 0, "total": 0})

for o in today_orders:
    created = o.get("createdAt") or o.get("date") or ""
    hour = 12
    if "T" in created:
        time_part = created.split("T")[1]
        hour = int(time_part.split(":")[0])
    elif " " in created:
        time_part = created.split(" ")[1]
        hour = int(time_part.split(":")[0])

    tot = float(o.get("total") or o.get("totalPrice") or 0)
    hourly_map[hour]["count"] += 1
    hourly_map[hour]["total"] += tot

grand_total = sum(h["total"] for h in hourly_map.values())
grand_bills = sum(h["count"] for h in hourly_map.values())

print("\n--- 1-HOUR HOURLY SALES BREAKDOWN ---")
print(f"Date: {latest_date}")
print(f"Total Bills: {grand_bills}, Total Revenue: RS {grand_total:,.2f}")

for h in sorted(hourly_map.keys()):
    st = hourly_map[h]
    avg = (st["total"] / st["count"]) if st["count"] > 0 else 0
    share = (st["total"] / grand_total * 100) if grand_total > 0 else 0
    h_str = f"{h:02d}:00 - {(h+1):02d}:00"
    if h == 12:
        label = "12:00 PM - 01:00 PM"
    elif h < 12:
        label = f"{h:02d}:00 AM - {(h+1):02d}:00 AM"
    elif h == 23:
        label = "11:00 PM - 11:59 PM"
    else:
        label = f"{(h-12):02d}:00 PM - {(h-11):02d}:00 PM"
    print(f"Hour {h:02d} ({label}): {st['count']} bills | RS {st['total']:,.2f} | Avg: RS {avg:.0f} | Share: {share:.1f}%")
