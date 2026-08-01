import os
import json

print("=== CHECKING ALL BACKUPS FOR 1183 or KOT-100 ===")

for root, dirs, files in os.walk("."):
    if ".git" in root or "node_modules" in root:
        continue
    for f in files:
        if f.endswith(".json"):
            fpath = os.path.join(root, f)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as fp:
                    data = json.load(fp)
                    orders = []
                    if isinstance(data, dict):
                        orders.extend(data.get("orders", []))
                        orders.extend(data.get("ordersVault", []))
                    elif isinstance(data, list):
                        orders = data
                    
                    for o in orders:
                        if isinstance(o, dict):
                            onum = str(o.get("orderNumber") or o.get("id") or "")
                            kot = str(o.get("kotNumber") or o.get("kot") or "")
                            if onum == "1183" or "1183" in onum or kot == "KOT-100" or kot == "100":
                                print(f"FOUND IN {fpath}: {o}")
            except Exception as e:
                pass
