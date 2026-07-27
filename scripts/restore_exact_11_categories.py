import os
import json

target_categories = [
    { "id": "c10", "name": "Beverages & Kombucha", "icon": "🍹", "color": "#0284c7" },
    { "id": "c9", "name": "Desserts", "icon": "🍰", "color": "#ec4899" },
    { "id": "c4", "name": "Dips & Add-Ons", "icon": "🥣", "color": "#e63946" },
    { "id": "c6", "name": "Fries", "icon": "🍟", "color": "#f59e0b" },
    { "id": "c1", "name": "Gyros", "icon": "🥙", "color": "#d97706" },
    { "id": "c2", "name": "Meals & Combos", "icon": "🍱", "color": "#8b5cf6" },
    { "id": "c11", "name": "Protein Max", "icon": "💪", "color": "#10b981" },
    { "id": "c3", "name": "Rice & Salads", "icon": "🥗", "color": "#059669" },
    { "id": "c7", "name": "Shakes & Softy", "icon": "🥤", "color": "#db2777" },
    { "id": "c5_strips", "name": "Strips", "icon": "🍗", "color": "#ca8a04" },
    { "id": "c5_wings", "name": "Wings", "icon": "🍗", "color": "#b45309" }
]

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

        data["categories"] = target_categories

        items = data.get("menuItems", [])
        for item in items:
            iid = str(item.get("id", ""))
            # Map Strips vs Wings
            if iid in ["m21", "m22", "m23", "m24", "m25"]:
                item["categoryId"] = "c5_strips"
            elif iid in ["m11", "m12", "m13", "m14", "m15", "m16", "m17", "m18", "m19", "m20"]:
                item["categoryId"] = "c5_wings"
            elif iid == "m52": # Vanilla Softy -> Shakes & Softy
                item["categoryId"] = "c7"

        with open(db_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"Updated {db_path} with 11 exact categories!")

print("Successfully restored exact 11 category structure!")
