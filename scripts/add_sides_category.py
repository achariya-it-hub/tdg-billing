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
    ("m_chicken_nuggets", "3 Pc Chicken Nuggets", 49, "3 pc crispy chicken nuggets", "sides_chicken_nuggets.png"),
    ("m_halloumi_nuggets", "4 Pc Halloumi Nuggets", 99, "4 pc crispy halloumi cheese nuggets", "sides_halloumi_nuggets.png"),
    ("m_mozzarella_sticks", "3 Pc Mozzarella Sticks", 149, "3 pc golden mozzarella sticks", "sides_mozzarella_sticks.png"),
    ("m_falafel", "4 Pc Falafel", 99, "4 pc crispy falafel", "sides_falafel.png"),
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


files = [
    r"d:\TDG-Billing\server\db.json",
    r"d:\TDG-Billing\server\seed-db.json",
    r"d:\TDG-Billing\deploy-hostinger\server\seed-db.json",
    r"d:\TDG-Billing\server\menu_backup_LOCK.json",
    r"d:\TDG-Billing\server\frozen-menu.json",
    r"d:\TDG-Billing\server\frozen_menu_LOCK.json",
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
        if not any(c.get("id") == "c_sides" for c in cats):
            cats.append(category)
        have = {m.get("id") for m in its}
        for m in menu_items:
            if m["id"] not in have:
                its.append(m)
        have_r = {r.get("menuItemId") for r in recs}
        for m in menu_items:
            if m["id"] not in have_r:
                recs.append(make_recipe(m))
        with open(f, "w", encoding="utf-8") as fh:
            json.dump(data, fh, indent=2)
        print("Updated", f)
    except Exception as e:
        print("Error", f, e)
