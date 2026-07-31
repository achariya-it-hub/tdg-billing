import json
import os

files_to_update = [
    'server/db.json',
    'server/seed-db.json',
    'server/menu_backup_LOCK.json',
    'server/sales_vault_LOCK.json',
    'deploy-hostinger/server/db.json',
    'deploy-hostinger/server/seed-db.json'
]

# Read db.json to get existing recipes and menu items
with open('server/db.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

existing_recipes = db.get('recipes', [])
recipe_item_ids = set(r.get('menuItemId', r.get('id')) for r in existing_recipes)

missing_items = [item for item in db.get('menuItems', []) if item['id'] not in recipe_item_ids]

print(f"Generating recipes for {len(missing_items)} remaining menu items...")

# Helper to construct fallback recipes
new_generated_recipes = []

for item in missing_items:
    iid = item['id']
    name = item['name']
    price = item['price']
    
    # Calculate target cost (~35% of price)
    target_cost = round(price * 0.35, 2)
    rm_cost = round(target_cost * 0.65, 2)
    pm_cost = round(target_cost * 0.20, 2)
    labour_cost = round(target_cost * 0.15, 2)
    
    ingredients = []
    
    # Category / item specific ingredient assignments
    if 'dip' in name.lower():
        pm_cost = 1.77
        rm_cost = round(price * 0.30 - pm_cost - 1.0, 2)
        labour_cost = 1.00
        target_cost = round(rm_cost + pm_cost + labour_cost, 2)
        ingredients = [
            { "id": f"ri_{iid}_1", "inventoryItemId": "inv_mayonnaise", "inventoryName": "Base Sauce / Mayo", "quantity": 0.030, "unit": "kg", "costPerUnit": 168.43, "cost": rm_cost },
            { "id": f"ri_{iid}_2", "inventoryItemId": "inv_dip_small_bowl", "inventoryName": "Dip Small Bowl", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.77, "cost": 1.77 },
            { "id": f"ri_{iid}_3", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 1.00, "cost": 1.00 }
        ]
    elif 'gyro' in name.lower():
        is_large = 'signature' in name.lower() or 'large' in name.lower()
        is_paneer = 'paneer' in name.lower()
        
        meat_item = "inv_pesto_paneer" if is_paneer else "inv_spicy_chicken"
        meat_name = "Paneer Portion" if is_paneer else "Chicken Portion"
        meat_qty = 0.100 if is_large else 0.050
        
        ingredients = [
            { "id": f"ri_{iid}_1", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA (Pita)", "quantity": 0.080 if is_large else 0.040, "unit": "kg", "costPerUnit": 44.77, "cost": 3.58 if is_large else 1.79 },
            { "id": f"ri_{iid}_2", "inventoryItemId": meat_item, "inventoryName": meat_name, "quantity": meat_qty, "unit": "kg", "costPerUnit": 400.00, "cost": round(meat_qty * 400.0, 2) },
            { "id": f"ri_{iid}_3", "inventoryItemId": "inv_iceberg", "inventoryName": "ICEBERG & Veggies", "quantity": 0.040, "unit": "kg", "costPerUnit": 248.15, "cost": 9.93 },
            { "id": f"ri_{iid}_4", "inventoryItemId": "inv_dinning_tray", "inventoryName": "Dinning Tray & Packaging", "quantity": 1.000, "unit": "pc", "costPerUnit": 12.41, "cost": 12.41 },
            { "id": f"ri_{iid}_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 15.95, "cost": 15.95 }
        ]
        rm_cost = round(sum(i['cost'] for i in ingredients[:3]), 2)
        pm_cost = 12.41
        labour_cost = 15.95
        target_cost = round(rm_cost + pm_cost + labour_cost, 2)
    elif 'fries' in name.lower():
        is_chicken = 'chicken' in name.lower()
        topping_item = "inv_boneless_chicken" if is_chicken else "inv_pesto_paneer"
        topping_name = "Chicken Topping" if is_chicken else "Paneer Topping"
        
        ingredients = [
            { "id": f"ri_{iid}_1", "inventoryItemId": "inv_potato", "inventoryName": "Potato Fries Base", "quantity": 0.250, "unit": "kg", "costPerUnit": 50.00, "cost": 12.50 },
            { "id": f"ri_{iid}_2", "inventoryItemId": topping_item, "inventoryName": topping_name, "quantity": 0.080, "unit": "kg", "costPerUnit": 300.00, "cost": 24.00 },
            { "id": f"ri_{iid}_3", "inventoryItemId": "inv_cheese_white", "inventoryName": "Melted Cheese Sauce", "quantity": 0.030, "unit": "kg", "costPerUnit": 547.00, "cost": 16.41 },
            { "id": f"ri_{iid}_4", "inventoryItemId": "inv_dinning_tray_500ml", "inventoryName": "Loaded Fries Tray & Bag", "quantity": 1.000, "unit": "pc", "costPerUnit": 15.00, "cost": 15.00 },
            { "id": f"ri_{iid}_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 10.00, "cost": 10.00 }
        ]
        rm_cost = round(12.50 + 24.00 + 16.41, 2)
        pm_cost = 15.00
        labour_cost = 10.00
        target_cost = round(rm_cost + pm_cost + labour_cost, 2)
    elif 'rice' in name.lower() or 'salad' in name.lower():
        is_chicken = 'chicken' in name.lower()
        base_name = "Lebanese Rice Base" if 'rice' in name.lower() else "Fresh Salad Base"
        topping_item = "inv_boneless_chicken" if is_chicken else "inv_pesto_paneer"
        topping_name = "Chicken Portion" if is_chicken else "Paneer Portion"
        
        ingredients = [
            { "id": f"ri_{iid}_1", "inventoryItemId": "inv_atta", "inventoryName": base_name, "quantity": 0.200, "unit": "kg", "costPerUnit": 60.00, "cost": 12.00 },
            { "id": f"ri_{iid}_2", "inventoryItemId": topping_item, "inventoryName": topping_name, "quantity": 0.100, "unit": "kg", "costPerUnit": 300.00, "cost": 30.00 },
            { "id": f"ri_{iid}_3", "inventoryItemId": "inv_mayonnaise", "inventoryName": "House Dressing", "quantity": 0.030, "unit": "kg", "costPerUnit": 168.43, "cost": 5.05 },
            { "id": f"ri_{iid}_4", "inventoryItemId": "inv_paper_bag_large", "inventoryName": "Bowl Packaging", "quantity": 1.000, "unit": "pc", "costPerUnit": 12.00, "cost": 12.00 },
            { "id": f"ri_{iid}_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 12.00, "cost": 12.00 }
        ]
        rm_cost = round(12.00 + 30.00 + 5.05, 2)
        pm_cost = 12.00
        labour_cost = 12.00
        target_cost = round(rm_cost + pm_cost + labour_cost, 2)
    else:
        # Meals, Combos & Party Buckets
        rm_cost = round(price * 0.25, 2)
        pm_cost = round(price * 0.05, 2)
        labour_cost = round(price * 0.04, 2)
        target_cost = round(rm_cost + pm_cost + labour_cost, 2)
        ingredients = [
            { "id": f"ri_{iid}_1", "inventoryItemId": "inv_boneless_chicken", "inventoryName": "Combo Food Ingredients", "quantity": 1.000, "unit": "portion", "costPerUnit": rm_cost, "cost": rm_cost },
            { "id": f"ri_{iid}_2", "inventoryItemId": "inv_paper_bag_large", "inventoryName": "Combo Meal Packaging", "quantity": 1.000, "unit": "pc", "costPerUnit": pm_cost, "cost": pm_cost },
            { "id": f"ri_{iid}_3", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": labour_cost, "cost": labour_cost }
        ]
        
    recipe = {
        "id": f"r_{iid}",
        "menuItemId": iid,
        "menuItemName": name,
        "name": f"RECIPE - {name.upper()}",
        "description": f"Standard recipe for {name} (Price ₹{price}/-)",
        "yieldQty": 1,
        "prepTime": 8,
        "rmCost": rm_cost,
        "pmCost": pm_cost,
        "labourCost": labour_cost,
        "calculatedCost": target_cost,
        "sellingPrice": float(price),
        "ingredients": ingredients
    }
    
    new_generated_recipes.append(recipe)

print(f"Generated {len(new_generated_recipes)} fallback recipes.")

# Update files
for fpath in files_to_update:
    if os.path.exists(fpath):
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if isinstance(data, dict):
                existing_recs = data.get('recipes', [])
                rec_map = {r.get('menuItemId', r.get('id')): r for r in existing_recs}
                for r in new_generated_recipes:
                    rec_map[r['menuItemId']] = r
                data['recipes'] = list(rec_map.values())

                with open(fpath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)
                print(f"Updated {fpath} with all recipes! Total recipes: {len(data['recipes'])}")
        except Exception as e:
            print(f"Error updating {fpath}: {e}")
