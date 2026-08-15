import os
import json

print("=== TDG Billing — Purging all rogue items (including 'new') everywhere ===")

db_path = r"d:\TDG-Billing\server\db.json"

with open(db_path, "r", encoding="utf-8") as f:
    db = json.load(f)

items = db.get("menuItems", [])
categories = db.get("categories", [])
recipes = db.get("recipes", [])

print(f"Current menuItems count before purge: {len(items)}")

# Filter out any rogue item (e.g. name is 'new', price <= 1, or name not in clean list)
clean_items = []
purged_names = []

for item in items:
    name = (item.get("name") or "").strip()
    price = float(item.get("price") or 0)
    if name.lower() == "new" or name.lower() == "test" or price <= 1 or name == "":
        purged_names.append(f"{name} (₹{price})")
    else:
        clean_items.append(item)

print(f"Purged {len(purged_names)} rogue items: {purged_names}")
print(f"Clean items count remaining: {len(clean_items)}")

# Overwrite in db structure
db["menuItems"] = clean_items

# List of files to update
target_files = [
    r"d:\TDG-Billing\server\db.json",
    r"d:\TDG-Billing\server\seed-db.json",
    r"d:\TDG-Billing\server\menu_backup_LOCK.json",
    r"d:\TDG-Billing\server\frozen-menu.json",
    r"d:\TDG-Billing\server\frozen_menu_LOCK.json",
    r"d:\TDG-Billing\deploy-hostinger\server\seed-db.json",
    r"d:\TDG-Billing\deploy-hostinger\server\db.json",
]

for p in target_files:
    if os.path.exists(p):
        with open(p, "w", encoding="utf-8") as f:
            json.dump(db, f, indent=2)
        print(f"Overwritten {p} with {len(clean_items)} clean items")

print("=== Rogue items purge complete! ===")
