import os
import json

print("=== CHECKING ALL BACKUPS FOR 66 ORDERS ON 2026-07-31 ===")

backup_files = [
    "server/backups/db-2026-07-31T09-29-19-355Z.json",
    "server/backups/db-shield-2026-07-31T09-29-19-318Z.json",
    "server/daily-backups/daily-2026-07-30.json",
    "server/db.pre-deploy-backup.json"
]

for bf in backup_files:
    if os.path.exists(bf):
        try:
            with open(bf, "r", encoding="utf-8", errors="ignore") as fp:
                data = json.load(fp)
                orders = []
                if isinstance(data, dict):
                    orders.extend(data.get("orders", []))
                    orders.extend(data.get("ordersVault", []))
                elif isinstance(data, list):
                    orders = data
                
                july31 = [o for o in orders if isinstance(o, dict) and "2026-07-31" in str(o.get("createdAt") or o.get("date") or "")]
                print(f"File {bf}: total July 31 orders = {len(july31)}")
                if july31:
                    sum_tot = sum(o.get("total", 0) for o in july31)
                    print(f"  Total revenue: Rs. {sum_tot}")
                    print(f"  First order time: {july31[0].get('createdAt') or july31[0].get('date')}")
                    print(f"  Last order time:  {july31[-1].get('createdAt') or july31[-1].get('date')}")
                    # Print all IDs
                    print(f"  Order IDs: {[o.get('id') or o.get('orderNumber') for o in july31]}")
        except Exception as e:
            print(f"Error reading {bf}: {e}")
