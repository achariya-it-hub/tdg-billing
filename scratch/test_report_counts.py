import json
from collections import defaultdict

with open("server/db.json", "r", encoding="utf-8") as f:
    db = json.load(f)

orders = db.get("orders", [])

# Let's test all report endpoints logic from server/index.js
# 1. Daily Closing
# 2. Payment Report
# 3. KOT Report / Bill Report
# 4. GST Summary

print("Total orders count in db.json:", len(orders))

jul31_orders = [o for o in orders if (o.get("createdAt") or o.get("date") or "").startswith("2026-07-31")]
print("July 31 orders count:", len(jul31_orders))

aug01_orders = [o for o in orders if (o.get("createdAt") or o.get("date") or "").startswith("2026-08-01")]
print("Aug 01 orders count:", len(aug01_orders))

# Check if there are 73 orders on any date or combination
jul30_orders = [o for o in orders if (o.get("createdAt") or o.get("date") or "").startswith("2026-07-30")]
print("July 30 orders count:", len(jul30_orders))

jul29_orders = [o for o in orders if (o.get("createdAt") or o.get("date") or "").startswith("2026-07-29")]
print("July 29 orders count:", len(jul29_orders))
