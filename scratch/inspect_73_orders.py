import json

with open("server/db.json", "r", encoding="utf-8") as f:
    data = json.load(f)

orders = data.get("orders", [])

jul31_all = []
for idx, o in enumerate(orders):
    created = o.get("createdAt") or o.get("date") or ""
    if created.startswith("2026-07-31"):
        jul31_all.append((idx, o))

print(f"Total raw orders matching 2026-07-31: {len(jul31_all)}")

status_counts = {}
hour_counts = {}

for idx, o in jul31_all:
    st = o.get("status", "unknown")
    status_counts[st] = status_counts.get(st, 0) + 1
    
    created = o.get("createdAt") or o.get("date") or ""
    if "T" in created:
        time_part = created.split("T")[1]
        hour = int(time_part.split(":")[0])
    elif " " in created:
        time_part = created.split(" ")[1]
        hour = int(time_part.split(":")[0])
    else:
        hour = -1

    hour_counts[hour] = hour_counts.get(hour, 0) + 1
    if hour < 9 or hour > 23 or st != "completed":
        print(f"Order #{o.get('id') or o.get('orderNumber')}: status={st}, time={created}, total={o.get('total')}")

print("\nStatus breakdown:", status_counts)
print("\nHour breakdown:", sorted(hour_counts.items()))
