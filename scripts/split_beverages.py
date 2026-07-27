import os
import json
from PIL import Image

desktop_dir = r"C:\Users\asus\Desktop\Ten Image"
target_dir = r"d:\TDG-Billing\public\images\menu"
ttt_target_dir = r"d:\TDG-Billing\ttt\assets\images\menu"

bev_images = {
    "mint-kombucha.png": "mint-kombucha.png",
    "kombucha-hibiscus.png": "kombucha-hibiscus.png",
    "ginger - kombucha.png": "ginger - kombucha.png",
    "butterfly pea - kombucha.png": "butterfly pea - kombucha.png",
    "ice tea - lime.png": "ice tea - lime.png"
}

for src_name, target_name in bev_images.items():
    src_path = os.path.join(desktop_dir, src_name)
    if os.path.exists(src_path):
        img = Image.open(src_path)
        img = img.convert("RGBA")
        img.thumbnail((600, 600), Image.Resampling.LANCZOS)
        
        dest_path = os.path.join(target_dir, target_name)
        img.save(dest_path, "PNG", optimize=True)
        print(f"Copied & optimized {src_name} -> {dest_path}")

        ttt_dest_path = os.path.join(ttt_target_dir, target_name)
        img.save(ttt_dest_path, "PNG", optimize=True)

# Split items list to replace the old combined items
split_beverage_items = [
    { "id": "m53a", "categoryId": "c10", "name": "Coca-Cola (Regular)", "price": 59, "description": "Chilled 330ml Coca-Cola soda", "isAvailable": True, "image": "/images/menu/logo.png" },
    { "id": "m53b", "categoryId": "c10", "name": "Coca-Cola (Large)", "price": 99, "description": "Large chilled Coca-Cola soda", "isAvailable": True, "image": "/images/menu/logo.png" },
    { "id": "m54a", "categoryId": "c10", "name": "Sprite (Regular)", "price": 59, "description": "Chilled 330ml Sprite soda", "isAvailable": True, "image": "/images/menu/logo.png" },
    { "id": "m54b", "categoryId": "c10", "name": "Sprite (Large)", "price": 99, "description": "Large chilled Sprite soda", "isAvailable": True, "image": "/images/menu/logo.png" },
    { "id": "m55a", "categoryId": "c10", "name": "Peach Ice Tea (Regular)", "price": 59, "description": "Refreshing peach iced tea", "isAvailable": True, "image": "/images/menu/logo.png" },
    { "id": "m55b", "categoryId": "c10", "name": "Peach Ice Tea (Large)", "price": 99, "description": "Large refreshing peach iced tea", "isAvailable": True, "image": "/images/menu/logo.png" },
    { "id": "m56a", "categoryId": "c10", "name": "Lime Ice Tea (Regular)", "price": 59, "description": "Refreshing lime iced tea", "isAvailable": True, "image": "/images/menu/ice tea - lime.png" },
    { "id": "m56b", "categoryId": "c10", "name": "Lime Ice Tea (Large)", "price": 99, "description": "Large refreshing lime iced tea", "isAvailable": True, "image": "/images/menu/ice tea - lime.png" },
    { "id": "m59a", "categoryId": "c10", "name": "Mint Kombucha", "price": 120, "description": "Organic sparkling mint probiotic Kombucha drink", "isAvailable": True, "image": "/images/menu/mint-kombucha.png" },
    { "id": "m59b", "categoryId": "c10", "name": "Hibiscus Kombucha", "price": 120, "description": "Organic sparkling hibiscus probiotic Kombucha drink", "isAvailable": True, "image": "/images/menu/kombucha-hibiscus.png" },
    { "id": "m59c", "categoryId": "c10", "name": "Ginger Kombucha", "price": 120, "description": "Organic sparkling ginger probiotic Kombucha drink", "isAvailable": True, "image": "/images/menu/ginger - kombucha.png" },
    { "id": "m59d", "categoryId": "c10", "name": "Butterfly Pea Kombucha", "price": 120, "description": "Organic sparkling butterfly pea probiotic Kombucha drink", "isAvailable": True, "image": "/images/menu/butterfly pea - kombucha.png" }
]

db_files = [
    r"d:\TDG-Billing\server\db.json",
    r"d:\TDG-Billing\server\seed-db.json",
]

ids_to_remove = ["m53", "m54", "m55", "m56", "m59"]
names_to_remove = [
    "Sprite / Coca-Cola (Regular)",
    "Sprite / Coca-Cola (Large)",
    "Ice Tea (Peach or Lime - Regular)",
    "Ice Tea (Peach or Lime - Large)",
    "Kombucha (Mint / Hibiscus / Ginger / Butterfly Pea)"
]

for db_path in db_files:
    if os.path.exists(db_path):
        with open(db_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        items = data.get("menuItems", [])
        # Filter out combined items
        filtered_items = [i for i in items if i.get("id") not in ids_to_remove and i.get("name") not in names_to_remove]
        
        # Insert split beverage items before hot chocolate (id m57) or append
        insert_idx = len(filtered_items)
        for idx, itm in enumerate(filtered_items):
            if itm.get("id") == "m57":
                insert_idx = idx
                break
        
        for b_item in split_beverage_items:
            filtered_items.insert(insert_idx, b_item)
            insert_idx += 1

        data["menuItems"] = filtered_items
        
        with open(db_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"Updated menuItems in {db_path}")

print("Done splitting beverage items!")
