import os
import json
import shutil
import glob

ART = r"C:\Users\asus\.gemini\antigravity-ide\brain\79e4339c-b63a-4820-87cd-94482e0219da"
IMG_DIR = r"d:\TDG-Billing\public\images\menu"

# Copy generated images into the menu images folder
images = {
    "chicken_nuggets": "sides_chicken_nuggets.png",
    "halloumi_nuggets": "sides_halloumi_nuggets.png",
    "mozzarella_sticks": "sides_mozzarella_sticks.png",
    "falafel": "sides_falafel.png",
}
for key, dest in images.items():
    matches = glob.glob(os.path.join(ART, f"{key}_*.png"))
    if matches:
        from PIL import Image
        im = Image.open(matches[0]).convert("RGB")
        im.thumbnail((600, 600))
        out = os.path.join(IMG_DIR, dest)
        im.quantize(colors=256).save(out, optimize=True)
        print("Copied", dest, os.path.getsize(out) // 1024, "KB")

category = {"id": "c_sides", "name": "Sides", "icon": "🍢", "color": "#f59e0b"}

items = [
    ("m_chicken_nuggets", "Chicken Nuggets", 49, "Crispy chicken nuggets", "sides_chicken_nuggets.png"),
    ("m_halloumi_nuggets", "Halloumi Nuggets", 99, "Crispy halloumi cheese nuggets", "sides_halloumi_nuggets.png"),
    ("m_mozzarella_sticks", "Mozarella Sticks", 149, "Golden mozzarella sticks", "sides_mozzarella_sticks.png"),
    ("m_falafel", "Falafel", 99, "Crispy falafel", "sides_falafel.png"),
    ("m_chicken_nuggets_99", "@99 Chicken Nuggets", 99, "Special @99 crispy chicken nuggets portion", "sides_chicken_nuggets.png"),
]
menu_items = [
    {"id": i, "categoryId": "c_sides", "name": n, "price": p, "description": d,
     "isAvailable": True, "image": f"/images/menu/{img}"}
    for i, n, p, d, img in items
]


def make_recipe(item):
    price = item["price"]
    target = round(price * 0.35, 2)
    rm = round(target * 0.65, 2)
    pm = round(target * 0.20, 2)
    lab = round(target * 0.15, 2)
    iid = item["id"]
    return {
        "id": f"r_{iid}", "menuItemId": iid, "menuItemName": item["name"],
        "name": f"RECIPE - {item['name'].upper()}",
        "description": f"Standard recipe for {item['name']} (Price ₹{price}/-)",
        "yieldQty": 1, "prepTime": 5, "rmCost": rm, "pmCost": pm, "labourCost": lab,
        "calculatedCost": target, "sellingPrice": float(price),
        "ingredients": [
            {"id": f"ri_{iid}_1", "inventoryItemId": "inv_boneless_chicken", "inventoryName": f"{item['name']} Ingredients", "quantity": 1.0, "unit": "portion", "costPerUnit": rm, "cost": rm},
            {"id": f"ri_{iid}_2", "inventoryItemId": "inv_paper_bag_large", "inventoryName": "Packaging", "quantity": 1.0, "unit": "pc", "costPerUnit": pm, "cost": pm},
            {"id": f"ri_{iid}_3", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.0, "unit": "unit", "costPerUnit": lab, "cost": lab},
        ],
    }


from datetime import datetime, timezone, timedelta
ist = timezone(timedelta(hours=5, minutes=30))
now_iso = datetime.now(timezone.utc).isoformat()
now_ist = datetime.now(ist).strftime("%d/%m/%Y, %I:%M:%S %p")

files = [
    r"d:\TDG-Billing\server\db.json",
    r"d:\TDG-Billing\server\seed-db.json",
    r"d:\TDG-Billing\deploy-hostinger\server\seed-db.json",
    r"d:\TDG-Billing\server\menu_backup_LOCK.json",
    r"d:\TDG-Billing\server\frozen-menu.json",
    r"d:\TDG-Billing\server\frozen_menu_LOCK.json",
    r"d:\TDG-Billing\server\menu_vault.json",
    r"d:\TDG-Billing\server\master_double_backup_LOCK.json",
]

for f in files:
    if not os.path.exists(f):
        continue
    try:
        with open(f, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        if not isinstance(data, dict):
            continue
        cats = data.setdefault("categories", [])
        its = data.setdefault("menuItems", [])
        recs = data.setdefault("recipes", [])
        
        # Ensure category
        existing_cat = next((c for c in cats if c.get("id") == "c_sides"), None)
        if not existing_cat:
            cats.append(category)
        else:
            existing_cat.update(category)
            
        # Update or append menu items
        for m in menu_items:
            existing_item = next((it for it in its if it.get("id") == m["id"]), None)
            if existing_item:
                existing_item.update(m)
            else:
                its.append(m)
                
        # Update or append recipes
        for m in menu_items:
            rec = make_recipe(m)
            existing_rec = next((r for r in recs if r.get("menuItemId") == m["id"]), None)
            if existing_rec:
                existing_rec.update(rec)
            else:
                recs.append(rec)
                
        # Freeze metadata
        data["isFrozen"] = True
        data["frozenAt"] = now_iso
        data["frozenAtIST"] = now_ist
        data["updatedAt"] = now_iso
        
        # If master backup, update _meta
        if "_meta" in data and isinstance(data["_meta"], dict):
            counts = data["_meta"].setdefault("counts", {})
            counts["menuItems"] = len(its)
            counts["categories"] = len(cats)
            counts["recipes"] = len(recs)
            data["_meta"]["savedAt"] = now_iso
            data["_meta"]["savedAtIST"] = now_ist
            
        # If menu_vault, update count fields
        if "menuItemsCount" in data:
            data["menuItemsCount"] = len(its)
        if "categoriesCount" in data:
            data["categoriesCount"] = len(cats)

        with open(f, "w", encoding="utf-8") as fh:
            json.dump(data, fh, indent=2)
        print("Updated & Frozen", f, f"({len(its)} items, {len(cats)} categories, {len(recs)} recipes)")
    except Exception as e:
        print("Error", f, e)
