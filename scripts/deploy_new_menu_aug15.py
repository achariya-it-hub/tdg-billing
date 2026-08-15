import os
import json
import shutil

print("=== TDG Billing — New Menu Deployment & Backup (Aug 15) ===")

db_path = r"d:\TDG-Billing\server\db.json"
seed_path = r"d:\TDG-Billing\server\seed-db.json"
hostinger_seed_path = r"d:\TDG-Billing\deploy-hostinger\server\seed-db.json"
backup_lock_path = r"d:\TDG-Billing\server\menu_backup_LOCK.json"
backup_history_path = r"d:\TDG-Billing\server\backups\menu_backup_FULL_AUG15.json"

# Step 1: Backup existing menu data
if os.path.exists(db_path):
    with open(db_path, "r", encoding="utf-8") as f:
        existing_db = json.load(f)
    
    os.makedirs(os.path.dirname(backup_history_path), exist_ok=True)
    backup_data = {
        "categories": existing_db.get("categories", []),
        "menuItems": existing_db.get("menuItems", []),
        "recipes": existing_db.get("recipes", []),
        "timestamp": "2026-08-15T08:35:00.000Z"
    }
    with open(backup_history_path, "w", encoding="utf-8") as f:
        json.dump(backup_data, f, indent=2)
    print(f"Backup created: {backup_history_path} ({len(existing_db.get('menuItems', []))} items backed up)")

# Step 2: Define New Categories (14 Categories)
new_categories = [
    { "id": "c1", "name": "Gyros", "icon": "🥙", "color": "#d97706" },
    { "id": "c5_legthigh", "name": "Leg & Thigh", "icon": "🍗", "color": "#ea580c" },
    { "id": "c5_wings", "name": "Wings", "icon": "🍗", "color": "#b45309" },
    { "id": "c5_strips", "name": "Strips", "icon": "🍗", "color": "#ca8a04" },
    { "id": "c6", "name": "Fries", "icon": "🍟", "color": "#f59e0b" },
    { "id": "c10_bev", "name": "Beverages", "icon": "🥤", "color": "#0284c7" },
    { "id": "c3_rice", "name": "Rice", "icon": "🍚", "color": "#059669" },
    { "id": "c3_salad", "name": "Salads", "icon": "🥗", "color": "#10b981" },
    { "id": "c2", "name": "Meals & Combos", "icon": "🍱", "color": "#8b5cf6" },
    { "id": "c11", "name": "Protein Max", "icon": "💪", "color": "#10b981" },
    { "id": "c7_shakes", "name": "Shakes", "icon": "🥤", "color": "#db2777" },
    { "id": "c9", "name": "Desserts", "icon": "🍰", "color": "#ec4899" },
    { "id": "c4", "name": "Softy & Add-Ons", "icon": "🍦", "color": "#e63946" },
    { "id": "c10_komb", "name": "Kombucha", "icon": "🍹", "color": "#0284c7" }
]

# Step 3: Define New Menu Items (58 Items)
new_menu_items = [
    # Gyros
    { "id": "m_spicy_gyro", "categoryId": "c1", "name": "Spicy Gyro", "price": 199, "description": "Spicy gyro with fresh veggies & spread (Choose: Chicken or Paneer)", "isAvailable": True, "image": "/uploads/menu/m1.jpg" },
    { "id": "m_creamy_gyro", "categoryId": "c1", "name": "Creamy Gyro", "price": 199, "description": "Creamy tzatziki gyro wrap (Choose: Chicken or Paneer)", "isAvailable": True, "image": "/uploads/menu/m1.jpg" },
    { "id": "m_bbq_gyro", "categoryId": "c1", "name": "BBQ Gyro", "price": 199, "description": "Rich BBQ gyro wrap (Choose: Chicken or Paneer)", "isAvailable": True, "image": "/uploads/menu/m1.jpg" },
    { "id": "m_signature_gyro", "categoryId": "c1", "name": "Signature Gyro", "price": 199, "description": "TDG signature gyro wrap with secret sauce (Choose: Chicken or Paneer)", "isAvailable": True, "image": "/uploads/menu/m1.jpg" },

    # Leg & Thigh
    { "id": "m_legthigh_1pc", "categoryId": "c5_legthigh", "name": "1 Pc Leg & Thigh (1 Dip)", "price": 70, "description": "1 Pc Crispy Leg & Thigh + 1 Choice Dip", "isAvailable": True, "image": "/uploads/menu/m2.jpg" },
    { "id": "m_legthigh_2pc", "categoryId": "c5_legthigh", "name": "2 Pc Leg & Thigh (1 Dip)", "price": 140, "description": "2 Pc Crispy Leg & Thigh + 1 Choice Dip", "isAvailable": True, "image": "/uploads/menu/m2.jpg" },
    { "id": "m_legthigh_4pc", "categoryId": "c5_legthigh", "name": "4 Pc Leg & Thigh (2 Dips)", "price": 280, "description": "4 Pc Crispy Leg & Thigh + 2 Choice Dips", "isAvailable": True, "image": "/uploads/menu/m2.jpg" },
    { "id": "m_legthigh_8pc", "categoryId": "c5_legthigh", "name": "8 Pc Leg & Thigh (4 Dips)", "price": 560, "description": "8 Pc Crispy Leg & Thigh + 4 Choice Dips", "isAvailable": True, "image": "/uploads/menu/m2.jpg" },
    { "id": "m_legthigh_12pc", "categoryId": "c5_legthigh", "name": "12 Pc Leg & Thigh (6 Dips)", "price": 840, "description": "12 Pc Crispy Leg & Thigh + 6 Choice Dips", "isAvailable": True, "image": "/uploads/menu/m2.jpg" },

    # Wings
    { "id": "m_wings_3pc", "categoryId": "c5_wings", "name": "3 Pc Wings (1 Dip)", "price": 90, "description": "3 Pc Crispy Chicken Wings + 1 Choice Dip", "isAvailable": True, "image": "/uploads/menu/m2.jpg" },
    { "id": "m_wings_6pc", "categoryId": "c5_wings", "name": "6 Pc Wings (2 Dips)", "price": 180, "description": "6 Pc Crispy Chicken Wings + 2 Choice Dips", "isAvailable": True, "image": "/uploads/menu/m2.jpg" },
    { "id": "m_wings_9pc", "categoryId": "c5_wings", "name": "9 Pc Wings (3 Dips)", "price": 270, "description": "9 Pc Crispy Chicken Wings + 3 Choice Dips", "isAvailable": True, "image": "/uploads/menu/m2.jpg" },
    { "id": "m_wings_20pc", "categoryId": "c5_wings", "name": "20 Pc Wings (6 Dips)", "price": 600, "description": "20 Pc Crispy Chicken Wings + 6 Choice Dips", "isAvailable": True, "image": "/uploads/menu/m2.jpg" },

    # Strips
    { "id": "m_strips_3pc", "categoryId": "c5_strips", "name": "3 Pc Strips (1 Dip)", "price": 120, "description": "3 Pc Crispy Chicken Strips + 1 Choice Dip", "isAvailable": True, "image": "/uploads/menu/m2.jpg" },
    { "id": "m_strips_6pc", "categoryId": "c5_strips", "name": "6 Pc Strips (2 Dips)", "price": 240, "description": "6 Pc Crispy Chicken Strips + 2 Choice Dips", "isAvailable": True, "image": "/uploads/menu/m2.jpg" },
    { "id": "m_strips_9pc", "categoryId": "c5_strips", "name": "9 Pc Strips (3 Dips)", "price": 360, "description": "9 Pc Crispy Chicken Strips + 3 Choice Dips", "isAvailable": True, "image": "/uploads/menu/m2.jpg" },
    { "id": "m_strips_20pc", "categoryId": "c5_strips", "name": "20 Pc Strips (6 Dips)", "price": 800, "description": "20 Pc Crispy Chicken Strips + 6 Choice Dips", "isAvailable": True, "image": "/uploads/menu/m2.jpg" },

    # Fries
    { "id": "m_fries_std", "categoryId": "c6", "name": "Fries (Salted, Peri Peri or Cajun)", "price": 99, "description": "Crispy Fries (Choose seasoning: Salted, Peri Peri, or Cajun)", "isAvailable": True, "image": "/uploads/menu/m2.jpg" },
    { "id": "m_loaded_fries", "categoryId": "c6", "name": "Loaded Fries", "price": 199, "description": "Loaded Fries topped with melted cheese, sauces (Choose: Chicken or Paneer)", "isAvailable": True, "image": "/uploads/menu/m2.jpg" },

    # Rice
    { "id": "m_rice_bowl", "categoryId": "c3_rice", "name": "Rice Bowl (Signature)", "price": 199, "description": "Signature Lebanese Rice Bowl with fresh herbs & toppings (Choose: Chicken or Paneer)", "isAvailable": True, "image": "/uploads/menu/m1.jpg" },

    # Salads
    { "id": "m_signature_salad", "categoryId": "c3_salad", "name": "Signature Salad", "price": 149, "description": "Fresh Mediterranean Signature Salad with dressing (Choose: Chicken or Paneer)", "isAvailable": True, "image": "/uploads/menu/m1.jpg" },

    # Beverages
    { "id": "m_sprite_reg", "categoryId": "c10_bev", "name": "Sprite (Regular)", "price": 59, "description": "Sprite 330ml Regular", "isAvailable": True, "image": "/uploads/menu/m3.jpg" },
    { "id": "m_sprite_lrg", "categoryId": "c10_bev", "name": "Sprite (Large)", "price": 99, "description": "Sprite 500ml Large", "isAvailable": True, "image": "/uploads/menu/m3.jpg" },
    { "id": "m_cocacola_reg", "categoryId": "c10_bev", "name": "Coca Cola (Regular)", "price": 59, "description": "Coca Cola 330ml Regular", "isAvailable": True, "image": "/uploads/menu/m3.jpg" },
    { "id": "m_cocacola_lrg", "categoryId": "c10_bev", "name": "Coca Cola (Large)", "price": 99, "description": "Coca Cola 500ml Large", "isAvailable": True, "image": "/uploads/menu/m3.jpg" },
    { "id": "m_icetea_reg", "categoryId": "c10_bev", "name": "Ice Tea (Regular)", "price": 59, "description": "Refreshing Ice Tea - Peach or Lime (Regular)", "isAvailable": True, "image": "/uploads/menu/m3.jpg" },
    { "id": "m_icetea_lrg", "categoryId": "c10_bev", "name": "Ice Tea (Large)", "price": 99, "description": "Refreshing Ice Tea - Peach or Lime (Large)", "isAvailable": True, "image": "/uploads/menu/m3.jpg" },
    { "id": "m_hot_chocolate", "categoryId": "c10_bev", "name": "Hot Chocolate", "price": 99, "description": "Rich Warm Hot Chocolate", "isAvailable": True, "image": "/uploads/menu/m3.jpg" },
    { "id": "m_signature_tea", "categoryId": "c10_bev", "name": "Signature Tea", "price": 99, "description": "Special TDG Signature Brewed Tea", "isAvailable": True, "image": "/uploads/menu/m3.jpg" },

    # Meals & Combos
    { "id": "m_express_meal", "categoryId": "c2", "name": "Express Meal", "price": 249, "description": "Gyro & Regular Drink", "isAvailable": True, "image": "/uploads/menu/m1.jpg" },
    { "id": "m_sig_gyro_meal", "categoryId": "c2", "name": "Signature Gyro Meal", "price": 279, "description": "Gyro, Fries, Regular Drink", "isAvailable": True, "image": "/uploads/menu/m1.jpg" },
    { "id": "m_lebanese_rice_box", "categoryId": "c2", "name": "Lebanese Rice Box", "price": 299, "description": "Lebanese rice, Fries, Regular Drink", "isAvailable": True, "image": "/uploads/menu/m1.jpg" },
    { "id": "m_classic_gyro_meal", "categoryId": "c2", "name": "Classic Gyro Meal", "price": 349, "description": "Gyro, 2 Wings, Fries, Regular Drink, 1 Dip", "isAvailable": True, "image": "/uploads/menu/m1.jpg" },
    { "id": "m_duo_gyro_feast", "categoryId": "c2", "name": "Duo Gyro Feast", "price": 449, "description": "2 Gyros, Fries, 2 Regular Drinks", "isAvailable": True, "image": "/uploads/menu/m1.jpg" },
    { "id": "m_double_crunch_box", "categoryId": "c2", "name": "Double Crunch Box", "price": 699, "description": "2 Gyros, 6 Wings, Fries, 2 Regular Drinks", "isAvailable": True, "image": "/uploads/menu/m2.jpg" },
    { "id": "m_mega_feast_meal", "categoryId": "c2", "name": "Mega Feast Meal", "price": 799, "description": "2 Gyros, 2 Leg & Thighs, 2 Wings, 2 Strips, Fries, 2 Regular Drinks, 3 Dips", "isAvailable": True, "image": "/uploads/menu/m2.jpg" },
    { "id": "m_dens_party_meal", "categoryId": "c2", "name": "Den's Party Meal", "price": 1049, "description": "2 Gyros, 6 Wings, 4 Leg & Thighs, 2 Fries, 3 Regular Drinks", "isAvailable": True, "image": "/uploads/menu/m2.jpg" },
    { "id": "m_super5_bucket", "categoryId": "c2", "name": "Super 5 Bucket", "price": 1299, "description": "5 Leg & Thighs, 10 Wings, 10 Strips, 5 Regular Drinks", "isAvailable": True, "image": "/uploads/menu/m2.jpg" },

    # Protein Max
    { "id": "m_pmax_gyro", "categoryId": "c11", "name": "Protein Max Gyro", "price": 299, "description": "High Protein Gyro (Choose: Chicken or Paneer)", "isAvailable": True, "image": "/uploads/menu/m1.jpg" },
    { "id": "m_pmax_rice", "categoryId": "c11", "name": "Protein Max Rice Bowl", "price": 299, "description": "High Protein Rice Bowl (Choose: Chicken or Paneer)", "isAvailable": True, "image": "/uploads/menu/m1.jpg" },
    { "id": "m_pmax_salad", "categoryId": "c11", "name": "Protein Max Salad", "price": 299, "description": "High Protein Mediterranean Salad (Choose: Chicken or Paneer)", "isAvailable": True, "image": "/uploads/menu/m1.jpg" },

    # Shakes
    { "id": "m_vanilla_shake_reg", "categoryId": "c7_shakes", "name": "Vanilla Shake (Regular)", "price": 120, "description": "Classic Vanilla Shake (Ask for White Chocolate)", "isAvailable": True, "image": "/uploads/menu/m3.jpg" },
    { "id": "m_vanilla_shake_lrg", "categoryId": "c7_shakes", "name": "Vanilla Shake (Large)", "price": 199, "description": "Large Vanilla Shake (Ask for White Chocolate)", "isAvailable": True, "image": "/uploads/menu/m3.jpg" },
    { "id": "m_strawberry_shake_reg", "categoryId": "c7_shakes", "name": "Strawberry Shake (Regular)", "price": 120, "description": "Fresh Strawberry Shake Regular", "isAvailable": True, "image": "/uploads/menu/m3.jpg" },
    { "id": "m_strawberry_shake_lrg", "categoryId": "c7_shakes", "name": "Strawberry Shake (Large)", "price": 199, "description": "Fresh Strawberry Shake Large", "isAvailable": True, "image": "/uploads/menu/m3.jpg" },
    { "id": "m_biscoff_shake_reg", "categoryId": "c7_shakes", "name": "Biscoff Shake (Regular)", "price": 120, "description": "Lotus Biscoff Shake Regular", "isAvailable": True, "image": "/uploads/menu/m3.jpg" },
    { "id": "m_biscoff_shake_lrg", "categoryId": "c7_shakes", "name": "Biscoff Shake (Large)", "price": 199, "description": "Lotus Biscoff Shake Large", "isAvailable": True, "image": "/uploads/menu/m3.jpg" },
    { "id": "m_chocolate_shake_reg", "categoryId": "c7_shakes", "name": "Chocolate Shake (Regular)", "price": 120, "description": "Rich Chocolate Shake Regular", "isAvailable": True, "image": "/uploads/menu/m3.jpg" },
    { "id": "m_chocolate_shake_lrg", "categoryId": "c7_shakes", "name": "Chocolate Shake (Large)", "price": 199, "description": "Rich Chocolate Shake Large", "isAvailable": True, "image": "/uploads/menu/m3.jpg" },
    { "id": "m_kunafa_shake_reg", "categoryId": "c7_shakes", "name": "Kunafa Pistachio Shake - Signature (Regular)", "price": 120, "description": "Signature Kunafa Pistachio Shake Regular", "isAvailable": True, "image": "/uploads/menu/m3.jpg" },
    { "id": "m_kunafa_shake_lrg", "categoryId": "c7_shakes", "name": "Kunafa Pistachio Shake - Signature (Large)", "price": 199, "description": "Signature Kunafa Pistachio Shake Large", "isAvailable": True, "image": "/uploads/menu/m3.jpg" },

    # Desserts
    { "id": "m_brownie", "categoryId": "c9", "name": "Chocolate Brownie", "price": 99, "description": "Fudgy Chocolate Brownie", "isAvailable": True, "image": "/uploads/menu/m3.jpg" },
    { "id": "m_blondie", "categoryId": "c9", "name": "Blondie Cake (Signature)", "price": 99, "description": "TDG Signature White Chocolate Blondie Cake", "isAvailable": True, "image": "/uploads/menu/m3.jpg" },

    # Softy & Add-Ons
    { "id": "m_vanilla_softy", "categoryId": "c4", "name": "Vanilla Softy", "price": 39, "description": "Creamy Vanilla Soft Serve Cone", "isAvailable": True, "image": "/uploads/menu/m3.jpg" },
    { "id": "m_dip_choice", "categoryId": "c4", "name": "Choice of Dip", "price": 15, "description": "Choice of Dip (Garlic Mayo, Spicy Mayo, Honey Mustard, Tzatziki, Jalapeno Cheese, Turkish Chilli)", "isAvailable": True, "image": "/uploads/menu/m2.jpg" },

    # Kombucha
    { "id": "m_kombucha_mint", "categoryId": "c10_komb", "name": "Mint Kombucha", "price": 120, "description": "Refreshing Brewed Mint Kombucha 250ml", "isAvailable": True, "image": "/uploads/menu/m3.jpg" },
    { "id": "m_kombucha_hibiscus", "categoryId": "c10_komb", "name": "Hibiscus Kombucha", "price": 120, "description": "Refreshing Brewed Hibiscus Kombucha 250ml", "isAvailable": True, "image": "/uploads/menu/m3.jpg" },
    { "id": "m_kombucha_classic", "categoryId": "c10_komb", "name": "Classic Kombucha", "price": 120, "description": "Refreshing Brewed Classic Kombucha 250ml", "isAvailable": True, "image": "/uploads/menu/m3.jpg" }
]

# Step 4: Generate Recipe Objects for all 58 Menu Items
new_recipes = []
for item in new_menu_items:
    iid = item["id"]
    name = item["name"]
    price = item["price"]
    
    target_cost = round(price * 0.35, 2)
    rm_cost = round(target_cost * 0.65, 2)
    pm_cost = round(target_cost * 0.20, 2)
    labour_cost = round(target_cost * 0.15, 2)
    
    if "dip" in name.lower():
        pm_cost = 1.77
        rm_cost = round(price * 0.30 - pm_cost - 1.0, 2)
        labour_cost = 1.00
        target_cost = round(rm_cost + pm_cost + labour_cost, 2)
        ingredients = [
            { "id": f"ri_{iid}_1", "inventoryItemId": "inv_mayonnaise", "inventoryName": "Base Sauce / Mayo", "quantity": 0.030, "unit": "kg", "costPerUnit": 168.43, "cost": rm_cost },
            { "id": f"ri_{iid}_2", "inventoryItemId": "inv_dip_small_bowl", "inventoryName": "Dip Small Bowl", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.77, "cost": 1.77 },
            { "id": f"ri_{iid}_3", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 1.00, "cost": 1.00 }
        ]
    elif "gyro" in name.lower():
        ingredients = [
            { "id": f"ri_{iid}_1", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA (Pita)", "quantity": 0.060, "unit": "kg", "costPerUnit": 44.77, "cost": 2.68 },
            { "id": f"ri_{iid}_2", "inventoryItemId": "inv_spicy_chicken", "inventoryName": "Chicken / Paneer Portion", "quantity": 0.080, "unit": "kg", "costPerUnit": 350.00, "cost": 28.00 },
            { "id": f"ri_{iid}_3", "inventoryItemId": "inv_iceberg", "inventoryName": "ICEBERG & Veggies", "quantity": 0.040, "unit": "kg", "costPerUnit": 248.15, "cost": 9.93 },
            { "id": f"ri_{iid}_4", "inventoryItemId": "inv_dinning_tray", "inventoryName": "Dinning Tray & Packaging", "quantity": 1.000, "unit": "pc", "costPerUnit": 12.41, "cost": 12.41 },
            { "id": f"ri_{iid}_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 10.00, "cost": 10.00 }
        ]
        rm_cost = 40.61
        pm_cost = 12.41
        labour_cost = 10.00
        target_cost = 63.02
    else:
        ingredients = [
            { "id": f"ri_{iid}_1", "inventoryItemId": "inv_boneless_chicken", "inventoryName": f"{name} Ingredients", "quantity": 1.000, "unit": "portion", "costPerUnit": rm_cost, "cost": rm_cost },
            { "id": f"ri_{iid}_2", "inventoryItemId": "inv_paper_bag_large", "inventoryName": "Packaging", "quantity": 1.000, "unit": "pc", "costPerUnit": pm_cost, "cost": pm_cost },
            { "id": f"ri_{iid}_3", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": labour_cost, "cost": labour_cost }
        ]

    recipe = {
        "id": f"r_{iid}",
        "menuItemId": iid,
        "menuItemName": name,
        "name": f"RECIPE - {name.upper()}",
        "description": f"Standard recipe for {name} (Price ₹{price}/-)",
        "yieldQty": 1,
        "prepTime": 5,
        "rmCost": rm_cost,
        "pmCost": pm_cost,
        "labourCost": labour_cost,
        "calculatedCost": target_cost,
        "sellingPrice": float(price),
        "ingredients": ingredients
    }
    new_recipes.append(recipe)

print(f"Created {len(new_categories)} Categories, {len(new_menu_items)} Menu Items, {len(new_recipes)} Recipes.")

# Step 5: Update all data stores & seeds
files_to_update = [
    db_path,
    seed_path,
    hostinger_seed_path,
    backup_lock_path,
    r"d:\TDG-Billing\server\frozen-menu.json",
    r"d:\TDG-Billing\server\frozen_menu_LOCK.json"
]

for fpath in files_to_update:
    if os.path.exists(fpath):
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            if isinstance(data, dict):
                data["categories"] = new_categories
                data["menuItems"] = new_menu_items
                data["recipes"] = new_recipes
                
                with open(fpath, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2)
                print(f"Updated {fpath}")
        except Exception as e:
            print(f"Error updating {fpath}: {e}")

print("=== Menu update completed successfully! ===")
