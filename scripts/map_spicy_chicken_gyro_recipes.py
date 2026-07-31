import json
import os

gyro_inventory = [
    { "id": "inv_dry_yeast", "name": "Dry Yeast", "category": "Raw Material", "unit": "kg", "costPerUnit": 377.12, "currentStock": 20, "minimumStock": 2 },
    { "id": "inv_cp_powder", "name": "CP Powder", "category": "Raw Material", "unit": "kg", "costPerUnit": 256.37, "currentStock": 20, "minimumStock": 2 },
    { "id": "inv_iceberg", "name": "Iceberg Lettuce", "category": "Raw Material", "unit": "kg", "costPerUnit": 272.00, "currentStock": 30, "minimumStock": 3 },
    { "id": "inv_onion", "name": "Onion", "category": "Raw Material", "unit": "kg", "costPerUnit": 33.00, "currentStock": 100, "minimumStock": 10 },
    { "id": "inv_tomato", "name": "Tomato", "category": "Raw Material", "unit": "kg", "costPerUnit": 73.50, "currentStock": 100, "minimumStock": 10 },
    { "id": "inv_cucumber", "name": "Cucumber", "category": "Raw Material", "unit": "kg", "costPerUnit": 84.00, "currentStock": 50, "minimumStock": 5 },
    { "id": "inv_olives", "name": "Olives", "category": "Raw Material", "unit": "kg", "costPerUnit": 775.00, "currentStock": 20, "minimumStock": 2 },
    { "id": "inv_jalapeno", "name": "Jalapeno", "category": "Raw Material", "unit": "kg", "costPerUnit": 330.00, "currentStock": 20, "minimumStock": 2 },
    { "id": "inv_spicy_chicken", "name": "Spicy Chicken Cooked", "category": "Raw Material", "unit": "kg", "costPerUnit": 301.89, "currentStock": 100, "minimumStock": 10 },
    { "id": "inv_hummus", "name": "Hummus Dip", "category": "Raw Material", "unit": "kg", "costPerUnit": 28.96, "currentStock": 50, "minimumStock": 5 },
    { "id": "inv_peri_peri_sauce", "name": "Peri Peri Sauce", "category": "Raw Material", "unit": "kg", "costPerUnit": 352.27, "currentStock": 50, "minimumStock": 5 },
    { "id": "inv_honey_mustard", "name": "Honey Mustard", "category": "Raw Material", "unit": "kg", "costPerUnit": 43.65, "currentStock": 50, "minimumStock": 5 },
    { "id": "inv_dining_sheet", "name": "Dining Sheet Wrap", "category": "Packing Material", "unit": "pc", "costPerUnit": 1.55, "currentStock": 1000, "minimumStock": 100 },
    { "id": "inv_dinning_tray", "name": "Dinning Tray", "category": "Packing Material", "unit": "pc", "costPerUnit": 3.67, "currentStock": 1000, "minimumStock": 100 }
]

gyro_recipes = [
    {
        "id": "r_m1a",
        "menuItemId": "m1a",
        "menuItemName": "Spicy Gyro - Chicken (Mini)",
        "name": "SPICY CHICKEN GYROS - SMALL",
        "description": "Standard recipe for Spicy Gyro Chicken Mini (Price ₹99/-)",
        "yieldQty": 1,
        "prepTime": 8,
        "rmCost": 35.79,
        "pmCost": 11.81,
        "labourCost": 15.95,
        "calculatedCost": 63.55,
        "sellingPrice": 99.00,
        "ingredients": [
            { "id": "ri_m1a_1", "inventoryItemId": "inv_water", "inventoryName": "WATER", "quantity": 0.015, "unit": "kg", "costPerUnit": 20.00, "cost": 0.30 },
            { "id": "ri_m1a_2", "inventoryItemId": "inv_dry_yeast", "inventoryName": "DRY YEAST", "quantity": 0.010, "unit": "kg", "costPerUnit": 377.12, "cost": 3.77 },
            { "id": "ri_m1a_3", "inventoryItemId": "inv_white_sugar", "inventoryName": "SUGAR", "quantity": 0.050, "unit": "kg", "costPerUnit": 48.19, "cost": 2.41 },
            { "id": "ri_m1a_4", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.040, "unit": "kg", "costPerUnit": 44.77, "cost": 1.79 },
            { "id": "ri_m1a_5", "inventoryItemId": "inv_salt", "inventoryName": "SALT", "quantity": 0.060, "unit": "kg", "costPerUnit": 30.00, "cost": 1.80 },
            { "id": "ri_m1a_6", "inventoryItemId": "inv_cp_powder", "inventoryName": "CP POWDER", "quantity": 0.030, "unit": "kg", "costPerUnit": 256.37, "cost": 7.69 },
            { "id": "ri_m1a_7", "inventoryItemId": "inv_iceberg", "inventoryName": "ICEBERG", "quantity": 0.010, "unit": "kg", "costPerUnit": 272.00, "cost": 2.72 },
            { "id": "ri_m1a_8", "inventoryItemId": "inv_onion", "inventoryName": "ONION", "quantity": 0.010, "unit": "kg", "costPerUnit": 33.00, "cost": 0.33 },
            { "id": "ri_m1a_9", "inventoryItemId": "inv_tomato", "inventoryName": "TOMATO", "quantity": 0.010, "unit": "kg", "costPerUnit": 73.50, "cost": 0.74 },
            { "id": "ri_m1a_10", "inventoryItemId": "inv_cucumber", "inventoryName": "CUCUMBER", "quantity": 0.010, "unit": "kg", "costPerUnit": 84.00, "cost": 0.84 },
            { "id": "ri_m1a_11", "inventoryItemId": "inv_olives", "inventoryName": "OLIVES", "quantity": 0.010, "unit": "kg", "costPerUnit": 775.00, "cost": 7.75 },
            { "id": "ri_m1a_12", "inventoryItemId": "inv_jalapeno", "inventoryName": "JALAPENO", "quantity": 0.010, "unit": "kg", "costPerUnit": 330.00, "cost": 3.30 },
            { "id": "ri_m1a_13", "inventoryItemId": "inv_spicy_chicken", "inventoryName": "SPICY CHICKEN", "quantity": 0.050, "unit": "kg", "costPerUnit": 301.89, "cost": 15.09 },
            { "id": "ri_m1a_14", "inventoryItemId": "inv_hummus", "inventoryName": "HUMMUS", "quantity": 0.010, "unit": "kg", "costPerUnit": 28.96, "cost": 0.29 },
            { "id": "ri_m1a_15", "inventoryItemId": "inv_peri_peri_sauce", "inventoryName": "PERI PERI", "quantity": 0.010, "unit": "kg", "costPerUnit": 352.27, "cost": 3.52 },
            { "id": "ri_m1a_16", "inventoryItemId": "inv_honey_mustard", "inventoryName": "HONEY MUSTARD", "quantity": 0.010, "unit": "kg", "costPerUnit": 43.65, "cost": 0.44 },
            { "id": "ri_m1a_17", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue Paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
            { "id": "ri_m1a_18", "inventoryItemId": "inv_dining_sheet", "inventoryName": "Dining Sheet", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.55, "cost": 1.55 },
            { "id": "ri_m1a_19", "inventoryItemId": "inv_dinning_tray", "inventoryName": "Dinning Tray", "quantity": 1.000, "unit": "pc", "costPerUnit": 3.67, "cost": 3.67 },
            { "id": "ri_m1a_20", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take away Bag", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.05, "cost": 6.05 },
            { "id": "ri_m1a_21", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 15.95, "cost": 15.95 }
        ]
    },
    {
        "id": "r_m2a",
        "menuItemId": "m2a",
        "menuItemName": "Spicy Gyro - Chicken (Signature)",
        "name": "SPICY CHICKEN GYROS - LARGE",
        "description": "Standard recipe for Spicy Gyro Chicken Signature Large (Price ₹249/-)",
        "yieldQty": 1,
        "prepTime": 10,
        "rmCost": 67.68,
        "pmCost": 11.81,
        "labourCost": 15.95,
        "calculatedCost": 95.44,
        "sellingPrice": 249.00,
        "ingredients": [
            { "id": "ri_m2a_1", "inventoryItemId": "inv_water", "inventoryName": "WATER", "quantity": 0.015, "unit": "kg", "costPerUnit": 20.00, "cost": 0.30 },
            { "id": "ri_m2a_2", "inventoryItemId": "inv_dry_yeast", "inventoryName": "DRY YEAST", "quantity": 0.010, "unit": "kg", "costPerUnit": 377.12, "cost": 3.77 },
            { "id": "ri_m2a_3", "inventoryItemId": "inv_white_sugar", "inventoryName": "SUGAR", "quantity": 0.050, "unit": "kg", "costPerUnit": 48.19, "cost": 2.41 },
            { "id": "ri_m2a_4", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.080, "unit": "kg", "costPerUnit": 44.77, "cost": 3.58 },
            { "id": "ri_m2a_5", "inventoryItemId": "inv_salt", "inventoryName": "SALT", "quantity": 0.060, "unit": "kg", "costPerUnit": 30.00, "cost": 1.80 },
            { "id": "ri_m2a_6", "inventoryItemId": "inv_cp_powder", "inventoryName": "CP POWDER", "quantity": 0.030, "unit": "kg", "costPerUnit": 256.37, "cost": 7.69 },
            { "id": "ri_m2a_7", "inventoryItemId": "inv_iceberg", "inventoryName": "ICEBERG", "quantity": 0.010, "unit": "kg", "costPerUnit": 272.00, "cost": 2.72 },
            { "id": "ri_m2a_8", "inventoryItemId": "inv_onion", "inventoryName": "ONION", "quantity": 0.010, "unit": "kg", "costPerUnit": 33.00, "cost": 0.33 },
            { "id": "ri_m2a_9", "inventoryItemId": "inv_tomato", "inventoryName": "TOMATO", "quantity": 0.010, "unit": "kg", "costPerUnit": 73.50, "cost": 0.74 },
            { "id": "ri_m2a_10", "inventoryItemId": "inv_cucumber", "inventoryName": "CUCUMBER", "quantity": 0.010, "unit": "kg", "costPerUnit": 84.00, "cost": 0.84 },
            { "id": "ri_m2a_11", "inventoryItemId": "inv_olives", "inventoryName": "OLIVES", "quantity": 0.010, "unit": "kg", "costPerUnit": 775.00, "cost": 7.75 },
            { "id": "ri_m2a_12", "inventoryItemId": "inv_jalapeno", "inventoryName": "JALAPENO", "quantity": 0.010, "unit": "kg", "costPerUnit": 330.00, "cost": 3.30 },
            { "id": "ri_m2a_13", "inventoryItemId": "inv_spicy_chicken", "inventoryName": "SPICY CHICKEN", "quantity": 0.100, "unit": "kg", "costPerUnit": 301.89, "cost": 30.19 },
            { "id": "ri_m2a_14", "inventoryItemId": "inv_hummus", "inventoryName": "HUMMUS", "quantity": 0.010, "unit": "kg", "costPerUnit": 28.96, "cost": 0.29 },
            { "id": "ri_m2a_15", "inventoryItemId": "inv_peri_peri_sauce", "inventoryName": "PERI PERI", "quantity": 0.010, "unit": "kg", "costPerUnit": 352.27, "cost": 3.52 },
            { "id": "ri_m2a_16", "inventoryItemId": "inv_honey_mustard", "inventoryName": "HONEY MUSTARD", "quantity": 0.010, "unit": "kg", "costPerUnit": 43.65, "cost": 0.44 },
            { "id": "ri_m2a_17", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue Paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
            { "id": "ri_m2a_18", "inventoryItemId": "inv_dining_sheet", "inventoryName": "Dining Sheet", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.55, "cost": 1.55 },
            { "id": "ri_m2a_19", "inventoryItemId": "inv_dinning_tray", "inventoryName": "Dinning Tray", "quantity": 1.000, "unit": "pc", "costPerUnit": 3.67, "cost": 3.67 },
            { "id": "ri_m2a_20", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take away Bag", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.05, "cost": 6.05 },
            { "id": "ri_m2a_21", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 15.95, "cost": 15.95 }
        ]
    }
]

files_to_update = [
    'server/db.json',
    'server/seed-db.json',
    'server/menu_backup_LOCK.json',
    'server/sales_vault_LOCK.json'
]

for fpath in files_to_update:
    if os.path.exists(fpath):
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if isinstance(data, dict):
                # Update inventory
                existing_inv = data.get('inventory', [])
                inv_map = {item['id']: item for item in existing_inv}
                for item in gyro_inventory:
                    inv_map[item['id']] = item
                data['inventory'] = list(inv_map.values())

                # Update recipes
                existing_recipes = data.get('recipes', [])
                recipe_map = {r.get('menuItemId', r.get('id')): r for r in existing_recipes}
                for r in gyro_recipes:
                    recipe_map[r['menuItemId']] = r
                data['recipes'] = list(recipe_map.values())

                with open(fpath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)
                print(f"Updated {fpath} successfully with Spicy Chicken Gyro recipes!")
        except Exception as e:
            print(f"Error updating {fpath}: {e}")
