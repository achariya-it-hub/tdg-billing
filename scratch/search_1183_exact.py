import os
import json
import sqlite3

print("=== SEARCHING FOR ORDER NUMBER 1183 OR KOT 100 ACROSS ALL DATABASES ===")

found = []

for root, dirs, files in os.walk("."):
    if ".git" in root or "node_modules" in root:
        continue
    for f in files:
        fpath = os.path.join(root, f)
        
        if f.endswith(".json"):
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
                            if "1183" in onum or "100" in kot or "1183" in str(o):
                                found.append((fpath, o))
            except Exception as e:
                pass
                
        elif f.endswith((".db", ".sqlite")):
            try:
                conn = sqlite3.connect(fpath)
                c = conn.cursor()
                c.execute("SELECT name FROM sqlite_master WHERE type='table';")
                tables = c.fetchall()
                for t in tables:
                    tname = t[0]
                    c.execute(f"SELECT * FROM \"{tname}\"")
                    for row in c.fetchall():
                        r_str = str(row)
                        if "1183" in r_str or "100" in r_str:
                            found.append((fpath, f"Table {tname}: {row}"))
            except Exception as e:
                pass

print(f"Total matches found: {len(found)}")
for fpath, item in found:
    print(f"File: {fpath} -> {item}")
