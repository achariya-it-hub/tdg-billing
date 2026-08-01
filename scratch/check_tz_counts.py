import json

with open("server/db.json", "r", encoding="utf-8") as f:
    data = json.load(f)

orders = data.get("orders", [])

print(f"Total orders in db.json: {len(orders)}")

# Check date filtering in UTC vs IST (+5:30)
# ISO strings like "2026-07-31T18:30:00.000Z" in IST are 2026-08-01 00:00:00!
date_ist_map = {}
date_utc_map = {}

for o in orders:
    created = o.get("createdAt") or o.get("date") or ""
    if not created:
        continue
    
    # UTC date
    utc_date = created[:10]
    date_utc_map[utc_date] = date_utc_map.get(utc_date, 0) + 1

    # IST date (+5:30)
    try:
        if "T" in created:
            # e.g. 2026-07-31T18:30:00Z -> IST +5:30 is 2026-08-01 00:00:00
            parts = created.split("T")
            d_part = parts[0]
            t_part = parts[1].replace("Z", "")
            h, m, s = [float(x) for x in t_part.split(":")[:3]]
            
            # Simple IST shift (+5.5 hours)
            h_ist = int(h + 5.5)
            if h_ist >= 24:
                # next day
                import datetime
                dt = datetime.date.fromisoformat(d_part) + datetime.timedelta(days=1)
                ist_date = dt.isoformat()
            else:
                ist_date = d_part
        else:
            ist_date = created[:10]
    except Exception as e:
        ist_date = created[:10]

    date_ist_map[ist_date] = date_ist_map.get(ist_date, 0) + 1

print("\n--- UTC DATE COUNTS ---")
for d in sorted(date_utc_map.keys()):
    print(f"UTC {d}: {date_utc_map[d]} orders")

print("\n--- IST DATE COUNTS ---")
for d in sorted(date_ist_map.keys()):
    print(f"IST {d}: {date_ist_map[d]} orders")
