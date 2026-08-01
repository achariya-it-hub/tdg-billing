import os
import json
from datetime import datetime

target_date_str = "2026-07-31"

print(f"--- ANALYZING ALL DATABASE FILES ACROSS ALL DIRECTORIES FOR {target_date_str} ---")

sources = [
    "server/db.json",
    "deploy/server/db.json",
    "deploy-hostinger/server/db.json",
    "deploy-hostinger/server/seed-db.json",
    "deploy1/server/db.json",
    "server-update/db.json"
]

# Find any db.json / seed-db.json anywhere
all_db_files = set()
for root, dirs, files in os.walk("."):
    if ".git" in root or "node_modules" in root:
        continue
    for f in files:
        if f.endswith(".json") and ("db" in f or "seed" in f or "orders" in f):
            all_db_files.add(os.path.join(root, f))

print(f"Found {len(all_db_files)} candidate database/json files.")

for db_file in sorted(all_db_files):
    try:
        with open(db_file, "r", encoding="utf-8", errors="ignore") as fp:
            content = fp.read()
            if target_date_str not in content:
                continue
            data = json.loads(content)
            orders = []
            if isinstance(data, dict):
                orders += data.get("orders", [])
                orders += data.get("ordersVault", [])
            elif isinstance(data, list):
                orders = data
            
            today_orders = []
            for o in orders:
                if isinstance(o, dict):
                    dt_str = str(o.get("createdAt") or o.get("date") or o.get("paidAt") or "")
                    if target_date_str in dt_str:
                        today_orders.append(o)
            
            if today_orders:
                print(f"\n📁 File: {db_file}")
                print(f"   Total orders today ({target_date_str}): {len(today_orders)}")
                
                # Check time range 9:00 AM (09:00) to 10:19 PM (22:19)
                in_time_range = []
                for o in today_orders:
                    ca = o.get("createdAt") or o.get("paidAt") or ""
                    # Check hour/min
                    in_time_range.append(o)
                    
                print(f"   Sample Order IDs: {[o.get('id') or o.get('orderNumber') for o in today_orders[:5]]}")
                print(f"   Times: {[o.get('createdAt') for o in today_orders[:5]]}")
    except Exception as e:
        pass
