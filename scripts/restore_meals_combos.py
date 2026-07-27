import os
import json
import shutil

db_files = [
    r"d:\TDG-Billing\server\db.json",
    r"d:\TDG-Billing\server\seed-db.json",
    r"d:\TDG-Billing\deploy-hostinger\server\seed-db.json",
    r"d:\TDG-Billing\server\menu_backup_LOCK.json"
]

for db_path in db_files:
    if os.path.exists(db_path):
        with open(db_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        cats = data.get("categories", [])
        for cat in cats:
            if cat.get("id") == "c2":
                cat["name"] = "Meals & Combos"
                print(f"Renamed category c2 -> Meals & Combos in {db_path}")

        with open(db_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

print("Done restoring Meals & Combos category!")
