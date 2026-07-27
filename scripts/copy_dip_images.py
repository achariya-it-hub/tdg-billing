import os
import json
from PIL import Image

desktop_dir = r"C:\Users\asus\Desktop\Ten Image"
target_dir = r"d:\TDG-Billing\public\images\menu"
ttt_target_dir = r"d:\TDG-Billing\ttt\assets\images\menu"

os.makedirs(target_dir, exist_ok=True)
os.makedirs(ttt_target_dir, exist_ok=True)

dip_mapping = {
    "turkish chilli.png": "turkish chilli.png",
    "ja;apeno cheese.png": "jalapeno cheese.png",
    "garlic mayo.png": "garlic mayo.png",
    "spicy mayo.png": "spicy mayo.png",
    "peri peri.png": "peri peri.png",
    "honey mustard.png": "honey mustard.png"
}

for src_name, target_name in dip_mapping.items():
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

db_files = [
    r"d:\TDG-Billing\server\db.json",
    r"d:\TDG-Billing\server\seed-db.json",
]

dip_img_map = {
    "Turkish Chilli Dip": "/images/menu/turkish chilli.png",
    "Jalapeno Cheese Dip": "/images/menu/jalapeno cheese.png",
    "Garlic Mayo Dip": "/images/menu/garlic mayo.png",
    "Spicy Mayo Dip": "/images/menu/spicy mayo.png",
    "Peri Peri Dip": "/images/menu/peri peri.png",
    "Honey Mustard Dip": "/images/menu/honey mustard.png"
}

for db_path in db_files:
    if os.path.exists(db_path):
        with open(db_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        items = data.get("menuItems", [])
        for item in items:
            name = item.get("name", "")
            if name in dip_img_map:
                item["image"] = dip_img_map[name]
                print(f"Updated {name} -> {dip_img_map[name]} in {db_path}")
        
        with open(db_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

print("Done processing dip images!")
