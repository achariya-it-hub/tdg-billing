import os
import json
import re

print("=== TDG Billing — Updating Menu.jsx sample arrays ===")

menu_jsx_path = r"d:\TDG-Billing\src\pages\Menu.jsx"
db_path = r"d:\TDG-Billing\server\db.json"

with open(db_path, "r", encoding="utf-8") as f:
    db = json.load(f)

categories = db["categories"]
menu_items = db["menuItems"]
recipes = db["recipes"]

cat_js = "const sampleCategories = " + json.dumps(categories, indent=2)
items_js = "const sampleMenuItems = " + json.dumps(menu_items, indent=2)
recipes_js = "const sampleRecipes = " + json.dumps(recipes, indent=2)

with open(menu_jsx_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace sampleCategories block
content = re.sub(r'const sampleCategories = \[\s*[\s\S]*?\n\]', lambda m: cat_js, content)

# Replace sampleMenuItems block
content = re.sub(r'const sampleMenuItems = \[\s*[\s\S]*?\n\]', lambda m: items_js, content)

# Replace sampleRecipes block
content = re.sub(r'const sampleRecipes = \[\s*[\s\S]*?\n\]', lambda m: recipes_js, content)

with open(menu_jsx_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated Menu.jsx sample arrays successfully!")
