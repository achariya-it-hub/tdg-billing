import os
import json

target_date_str = "2026-07-31"

for root, dirs, files in os.walk("."):
    if ".git" in root or "node_modules" in root:
        continue
    for f in files:
        if f.endswith(".json"):
            filepath = os.path.join(root, f)
            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as fp:
                    text = fp.read()
                    if target_date_str in text:
                        data = json.loads(text)
                        orders = []
                        if isinstance(data, dict):
                            orders.extend(data.get("orders", []))
                            orders.extend(data.get("ordersVault", []))
                        elif isinstance(data, list):
                            orders = data
                        
                        today_orders = [
                            o for o in orders 
                            if isinstance(o, dict) and target_date_str in str(o.get("createdAt") or o.get("date") or "")
                        ]
                        
                        print(f"File: {filepath} | Matches today: {len(today_orders)}")
                        if today_orders:
                            first = today_orders[0]
                            last = today_orders[-1]
                            print(f"  First order time: {first.get('createdAt') or first.get('date')}")
                            print(f"  Last order time:  {last.get('createdAt') or last.get('date')}")
            except Exception as e:
                pass
