import os
import json

print("=== TDG Billing — Enforcing 58 Clean New Items & Rates Everywhere ===")

db_path = r"d:\TDG-Billing\server\db.json"
seed_path = r"d:\TDG-Billing\server\seed-db.json"
hostinger_seed_path = r"d:\TDG-Billing\deploy-hostinger\server\seed-db.json"
hostinger_db_path = r"d:\TDG-Billing\deploy-hostinger\server\db.json"
backup_lock_path = r"d:\TDG-Billing\server\menu_backup_LOCK.json"
frozen_path = r"d:\TDG-Billing\server\frozen-menu.json"
frozen_lock_path = r"d:\TDG-Billing\server\frozen_menu_LOCK.json"

# 14 Clean Categories
clean_categories = [
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

# 58 Clean New Items & New Rates
clean_menu_items = [
    # Gyros (₹199)
    { "id": "m_spicy_gyro", "categoryId": "c1", "name": "Spicy Gyro", "price": 199, "description": "Spicy gyro with fresh veggies & spread (Choose: Chicken or Paneer)", "isAvailable": True, "image": "/images/menu/gyro.png" },
    { "id": "m_creamy_gyro", "categoryId": "c1", "name": "Creamy Gyro", "price": 199, "description": "Creamy tzatziki gyro wrap (Choose: Chicken or Paneer)", "isAvailable": True, "image": "/images/menu/gyro.png" },
    { "id": "m_bbq_gyro", "categoryId": "c1", "name": "BBQ Gyro", "price": 199, "description": "Rich BBQ gyro wrap (Choose: Chicken or Paneer)", "isAvailable": True, "image": "/images/menu/gyro.png" },
    { "id": "m_signature_gyro", "categoryId": "c1", "name": "Signature Gyro", "price": 199, "description": "TDG signature gyro wrap with secret sauce (Choose: Chicken or Paneer)", "isAvailable": True, "image": "/images/menu/gyro.png" },

    # Leg & Thigh
    { "id": "m_legthigh_1pc", "categoryId": "c5_legthigh", "name": "1 Pc Leg & Thigh (1 Dip)", "price": 70, "description": "1 Pc Crispy Leg & Thigh + 1 Choice Dip", "isAvailable": True, "image": "/images/menu/leg_thigh.png" },
    { "id": "m_legthigh_2pc", "categoryId": "c5_legthigh", "name": "2 Pc Leg & Thigh (1 Dip)", "price": 140, "description": "2 Pc Crispy Leg & Thigh + 1 Choice Dip", "isAvailable": True, "image": "/images/menu/leg_thigh.png" },
    { "id": "m_legthigh_4pc", "categoryId": "c5_legthigh", "name": "4 Pc Leg & Thigh (2 Dips)", "price": 280, "description": "4 Pc Crispy Leg & Thigh + 2 Choice Dips", "isAvailable": True, "image": "/images/menu/leg_thigh.png" },
    { "id": "m_legthigh_8pc", "categoryId": "c5_legthigh", "name": "8 Pc Leg & Thigh (4 Dips)", "price": 560, "description": "8 Pc Crispy Leg & Thigh + 4 Choice Dips", "isAvailable": True, "image": "/images/menu/leg_thigh.png" },
    { "id": "m_legthigh_12pc", "categoryId": "c5_legthigh", "name": "12 Pc Leg & Thigh (6 Dips)", "price": 840, "description": "12 Pc Crispy Leg & Thigh + 6 Choice Dips", "isAvailable": True, "image": "/images/menu/leg_thigh.png" },

    # Wings
    { "id": "m_wings_3pc", "categoryId": "c5_wings", "name": "3 Pc Wings (1 Dip)", "price": 90, "description": "3 Pc Crispy Chicken Wings + 1 Choice Dip", "isAvailable": True, "image": "/images/menu/wings.png" },
    { "id": "m_wings_6pc", "categoryId": "c5_wings", "name": "6 Pc Wings (2 Dips)", "price": 180, "description": "6 Pc Crispy Chicken Wings + 2 Choice Dips", "isAvailable": True, "image": "/images/menu/wings.png" },
    { "id": "m_wings_9pc", "categoryId": "c5_wings", "name": "9 Pc Wings (3 Dips)", "price": 270, "description": "9 Pc Crispy Chicken Wings + 3 Choice Dips", "isAvailable": True, "image": "/images/menu/wings.png" },
    { "id": "m_wings_20pc", "categoryId": "c5_wings", "name": "20 Pc Wings (6 Dips)", "price": 600, "description": "20 Pc Crispy Chicken Wings + 6 Choice Dips", "isAvailable": True, "image": "/images/menu/wings.png" },

    # Strips
    { "id": "m_strips_3pc", "categoryId": "c5_strips", "name": "3 Pc Strips (1 Dip)", "price": 120, "description": "3 Pc Crispy Chicken Strips + 1 Choice Dip", "isAvailable": True, "image": "/images/menu/strips.png" },
    { "id": "m_strips_6pc", "categoryId": "c5_strips", "name": "6 Pc Strips (2 Dips)", "price": 240, "description": "6 Pc Crispy Chicken Strips + 2 Choice Dips", "isAvailable": True, "image": "/images/menu/strips.png" },
    { "id": "m_strips_9pc", "categoryId": "c5_strips", "name": "9 Pc Strips (3 Dips)", "price": 360, "description": "9 Pc Crispy Chicken Strips + 3 Choice Dips", "isAvailable": True, "image": "/images/menu/strips.png" },
    { "id": "m_strips_20pc", "categoryId": "c5_strips", "name": "20 Pc Strips (6 Dips)", "price": 800, "description": "20 Pc Crispy Chicken Strips + 6 Choice Dips", "isAvailable": True, "image": "/images/menu/strips.png" },

    # Fries
    { "id": "m_fries_std", "categoryId": "c6", "name": "Fries (Salted, Peri Peri or Cajun)", "price": 99, "description": "Crispy Fries (Choose seasoning: Salted, Peri Peri, or Cajun)", "isAvailable": True, "image": "/images/menu/fries.png" },
    { "id": "m_loaded_fries", "categoryId": "c6", "name": "Loaded Fries", "price": 199, "description": "Loaded Fries topped with melted cheese, sauces (Choose: Chicken or Paneer)", "isAvailable": True, "image": "/images/menu/loaded fries.png" },

    # Rice
    { "id": "m_rice_bowl", "categoryId": "c3_rice", "name": "Rice Bowl (Signature)", "price": 199, "description": "Signature Lebanese Rice Bowl with fresh herbs & toppings (Choose: Chicken or Paneer)", "isAvailable": True, "image": "/images/menu/lebanese rice bowl.png" },

    # Salads
    { "id": "m_signature_salad", "categoryId": "c3_salad", "name": "Signature Salad", "price": 149, "description": "Fresh Mediterranean Signature Salad with dressing (Choose: Chicken or Paneer)", "isAvailable": True, "image": "/images/menu/signature salad.png" },

    # Beverages
    { "id": "m_sprite_reg", "categoryId": "c10_bev", "name": "Sprite (Regular)", "price": 59, "description": "Sprite 330ml Regular", "isAvailable": True, "image": "/images/menu/express meal.png" },
    { "id": "m_sprite_lrg", "categoryId": "c10_bev", "name": "Sprite (Large)", "price": 99, "description": "Sprite 500ml Large", "isAvailable": True, "image": "/images/menu/express meal.png" },
    { "id": "m_cocacola_reg", "categoryId": "c10_bev", "name": "Coca Cola (Regular)", "price": 59, "description": "Coca Cola 330ml Regular", "isAvailable": True, "image": "/images/menu/express meal.png" },
    { "id": "m_cocacola_lrg", "categoryId": "c10_bev", "name": "Coca Cola (Large)", "price": 99, "description": "Coca Cola 500ml Large", "isAvailable": True, "image": "/images/menu/express meal.png" },
    { "id": "m_icetea_reg", "categoryId": "c10_bev", "name": "Ice Tea (Regular)", "price": 59, "description": "Refreshing Ice Tea - Peach or Lime (Regular)", "isAvailable": True, "image": "/images/menu/ice tea - lime.png" },
    { "id": "m_icetea_lrg", "categoryId": "c10_bev", "name": "Ice Tea (Large)", "price": 99, "description": "Refreshing Ice Tea - Peach or Lime (Large)", "isAvailable": True, "image": "/images/menu/ice tea - lime.png" },
    { "id": "m_hot_chocolate", "categoryId": "c10_bev", "name": "Hot Chocolate", "price": 99, "description": "Rich Warm Hot Chocolate", "isAvailable": True, "image": "/images/menu/Hot Chocolate.png" },
    { "id": "m_signature_tea", "categoryId": "c10_bev", "name": "Signature Tea", "price": 99, "description": "Special TDG Signature Brewed Tea", "isAvailable": True, "image": "/images/menu/Signature tea.png" },

    # Meals & Combos
    { "id": "m_express_meal", "categoryId": "c2", "name": "Express Meal", "price": 249, "description": "Gyro & Regular Drink", "isAvailable": True, "image": "/images/menu/express meal.png" },
    { "id": "m_sig_gyro_meal", "categoryId": "c2", "name": "Signature Gyro Meal", "price": 279, "description": "Gyro, Fries, Regular Drink", "isAvailable": True, "image": "/images/menu/signature gyro meal.png" },
    { "id": "m_lebanese_rice_box", "categoryId": "c2", "name": "Lebanese Rice Box", "price": 299, "description": "Lebanese rice, Fries, Regular Drink", "isAvailable": True, "image": "/images/menu/lebanese rice box.png" },
    { "id": "m_classic_gyro_meal", "categoryId": "c2", "name": "Classic Gyro Meal", "price": 349, "description": "Gyro, 2 Wings, Fries, Regular Drink, 1 Dip", "isAvailable": True, "image": "/images/menu/classic gyro meal.png" },
    { "id": "m_duo_gyro_feast", "categoryId": "c2", "name": "Duo Gyro Feast", "price": 449, "description": "2 Gyros, Fries, 2 Regular Drinks", "isAvailable": True, "image": "/images/menu/duo gyro feast.png" },
    { "id": "m_double_crunch_box", "categoryId": "c2", "name": "Double Crunch Box", "price": 699, "description": "2 Gyros, 6 Wings, Fries, 2 Regular Drinks", "isAvailable": True, "image": "/images/menu/double crunch box.png" },
    { "id": "m_mega_feast_meal", "categoryId": "c2", "name": "Mega Feast Meal", "price": 799, "description": "2 Gyros, 2 Leg & Thighs, 2 Wings, 2 Strips, Fries, 2 Regular Drinks, 3 Dips", "isAvailable": True, "image": "/images/menu/mega feast meal.png" },
    { "id": "m_dens_party_meal", "categoryId": "c2", "name": "Den's Party Meal", "price": 1049, "description": "2 Gyros, 6 Wings, 4 Leg & Thighs, 2 Fries, 3 Regular Drinks", "isAvailable": True, "image": "/images/menu/den's party meal.png" },
    { "id": "m_super5_bucket", "categoryId": "c2", "name": "Super 5 Bucket", "price": 1299, "description": "5 Leg & Thighs, 10 Wings, 10 Strips, 5 Regular Drinks", "isAvailable": True, "image": "/images/menu/super 5 bucket.png" },

    # Protein Max (₹299)
    { "id": "m_pmax_gyro", "categoryId": "c11", "name": "Protein Max Gyro", "price": 299, "description": "High Protein Gyro (Choose: Chicken or Paneer)", "isAvailable": True, "image": "/images/menu/protein max.png" },
    { "id": "m_pmax_rice", "categoryId": "c11", "name": "Protein Max Rice Bowl", "price": 299, "description": "High Protein Rice Bowl (Choose: Chicken or Paneer)", "isAvailable": True, "image": "/images/menu/protein max.png" },
    { "id": "m_pmax_salad", "categoryId": "c11", "name": "Protein Max Salad", "price": 299, "description": "High Protein Mediterranean Salad (Choose: Chicken or Paneer)", "isAvailable": True, "image": "/images/menu/protein max.png" },

    # Shakes
    { "id": "m_vanilla_shake_reg", "categoryId": "c7_shakes", "name": "Vanilla Shake (Regular)", "price": 120, "description": "Classic Vanilla Shake (Ask for White Chocolate)", "isAvailable": True, "image": "/images/menu/vanilla shake.png" },
    { "id": "m_vanilla_shake_lrg", "categoryId": "c7_shakes", "name": "Vanilla Shake (Large)", "price": 199, "description": "Large Vanilla Shake (Ask for White Chocolate)", "isAvailable": True, "image": "/images/menu/vanilla shake.png" },
    { "id": "m_strawberry_shake_reg", "categoryId": "c7_shakes", "name": "Strawberry Shake (Regular)", "price": 120, "description": "Fresh Strawberry Shake Regular", "isAvailable": True, "image": "/images/menu/strawberry shake.png" },
    { "id": "m_strawberry_shake_lrg", "categoryId": "c7_shakes", "name": "Strawberry Shake (Large)", "price": 199, "description": "Fresh Strawberry Shake Large", "isAvailable": True, "image": "/images/menu/strawberry shake.png" },
    { "id": "m_biscoff_shake_reg", "categoryId": "c7_shakes", "name": "Biscoff Shake (Regular)", "price": 120, "description": "Lotus Biscoff Shake Regular", "isAvailable": True, "image": "/images/menu/biscoff shake.png" },
    { "id": "m_biscoff_shake_lrg", "categoryId": "c7_shakes", "name": "Biscoff Shake (Large)", "price": 199, "description": "Lotus Biscoff Shake Large", "isAvailable": True, "image": "/images/menu/biscoff shake.png" },
    { "id": "m_chocolate_shake_reg", "categoryId": "c7_shakes", "name": "Chocolate Shake (Regular)", "price": 120, "description": "Rich Chocolate Shake Regular", "isAvailable": True, "image": "/images/menu/chocolate shake.png" },
    { "id": "m_chocolate_shake_lrg", "categoryId": "c7_shakes", "name": "Chocolate Shake (Large)", "price": 199, "description": "Rich Chocolate Shake Large", "isAvailable": True, "image": "/images/menu/chocolate shake.png" },
    { "id": "m_kunafa_shake_reg", "categoryId": "c7_shakes", "name": "Kunafa Pistachio Shake - Signature (Regular)", "price": 120, "description": "Signature Kunafa Pistachio Shake Regular", "isAvailable": True, "image": "/images/menu/kunafa pistachio shake.png" },
    { "id": "m_kunafa_shake_lrg", "categoryId": "c7_shakes", "name": "Kunafa Pistachio Shake - Signature (Large)", "price": 199, "description": "Signature Kunafa Pistachio Shake Large", "isAvailable": True, "image": "/images/menu/kunafa pistachio shake.png" },

    # Desserts
    { "id": "m_brownie", "categoryId": "c9", "name": "Chocolate Brownie", "price": 99, "description": "Fudgy Chocolate Brownie", "isAvailable": True, "image": "/images/menu/chcolate brownie.png" },
    { "id": "m_blondie", "categoryId": "c9", "name": "Blondie Cake (Signature)", "price": 99, "description": "TDG Signature White Chocolate Blondie Cake", "isAvailable": True, "image": "/images/menu/blondie cake.png" },

    # Softy & Add-Ons
    { "id": "m_vanilla_softy", "categoryId": "c4", "name": "Vanilla Softy", "price": 39, "description": "Creamy Vanilla Soft Serve Cone", "isAvailable": True, "image": "/images/menu/vanilla softy.png" },
    { "id": "m_dip_choice", "categoryId": "c4", "name": "Choice of Dip", "price": 15, "description": "Choice of Dip (Garlic Mayo, Spicy Mayo, Honey Mustard, Tzatziki, Jalapeno Cheese, Turkish Chilli)", "isAvailable": True, "image": "/images/menu/garlic mayo.png" },

    # Kombucha
    { "id": "m_kombucha_mint", "categoryId": "c10_komb", "name": "Mint Kombucha", "price": 120, "description": "Refreshing Brewed Mint Kombucha 250ml", "isAvailable": True, "image": "/images/menu/mint-kombucha.png" },
    { "id": "m_kombucha_hibiscus", "categoryId": "c10_komb", "name": "Hibiscus Kombucha", "price": 120, "description": "Refreshing Brewed Hibiscus Kombucha 250ml", "isAvailable": True, "image": "/images/menu/kombucha-hibiscus.png" },
    { "id": "m_kombucha_classic", "categoryId": "c10_komb", "name": "Classic Kombucha", "price": 120, "description": "Refreshing Brewed Classic Kombucha 250ml", "isAvailable": True, "image": "/images/menu/kombucha.png" }
]

# 58 Clean Recipes
clean_recipes = []
for item in clean_menu_items:
    iid = item["id"]
    name = item["name"]
    price = item["price"]
    
    target_cost = round(price * 0.35, 2)
    rm_cost = round(target_cost * 0.65, 2)
    pm_cost = round(target_cost * 0.20, 2)
    labour_cost = round(target_cost * 0.15, 2)
    
    recipe = {
        "id": f"r_{iid}",
        "menuItemId": iid,
        "menuItemName": name,
        "name": f"RECIPE - {name.upper()}",
        "description": f"Standard recipe for {name} (Price RS {price}/-)",
        "yieldQty": 1,
        "prepTime": 5,
        "rmCost": rm_cost,
        "pmCost": pm_cost,
        "labourCost": labour_cost,
        "calculatedCost": target_cost,
        "sellingPrice": float(price),
        "ingredients": [
            { "id": f"ri_{iid}_1", "inventoryItemId": "inv_boneless_chicken", "inventoryName": f"{name} Base Ingredients", "quantity": 1.000, "unit": "portion", "costPerUnit": rm_cost, "cost": rm_cost },
            { "id": f"ri_{iid}_2", "inventoryItemId": "inv_paper_bag_large", "inventoryName": "Packaging", "quantity": 1.000, "unit": "pc", "costPerUnit": pm_cost, "cost": pm_cost },
            { "id": f"ri_{iid}_3", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": labour_cost, "cost": labour_cost }
        ]
    }
    clean_recipes.append(recipe)

print(f"Generated {len(clean_categories)} Clean Categories, {len(clean_menu_items)} Clean Items, {len(clean_recipes)} Clean Recipes.")

# Target Files to Completely Overwrite Menu Data
target_json_files = [
    db_path,
    seed_path,
    hostinger_seed_path,
    hostinger_db_path,
    backup_lock_path,
    frozen_path,
    frozen_lock_path
]

for fpath in target_json_files:
    if os.path.exists(fpath):
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            if isinstance(data, dict):
                data["categories"] = clean_categories
                data["menuItems"] = clean_menu_items
                data["recipes"] = clean_recipes
                
                with open(fpath, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2)
                print(f"Overwritten {fpath} with 58 clean items")
        except Exception as e:
            print(f"Error updating {fpath}: {e}")

print("=== Menu reset complete! ===")
