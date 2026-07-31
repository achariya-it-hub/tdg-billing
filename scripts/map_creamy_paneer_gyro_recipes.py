import json
import os

creamy_paneer_inventory = [
    { "id": "inv_cream_paneer", "name": "Cream Paneer Cooked", "category": "Raw Material", "unit": "kg", "costPerUnit": 424.00, "currentStock": 100, "minimumStock": 10 }
]

creamy_paneer_recipes = [
    {
        "id": "r_m3b",
        "menuItemId": "m3b",
        "menuItemName": "Creamy Gyro - Paneer (Mini)",
        "name": "CREAM PANEER GYROS - SMALL",
        "description": "Standard recipe for Creamy Gyro Paneer Mini (Price ₹99/-)",
        "yieldQty": 1,
        "prepTime": 8,
        "rmCost": 41.89,
        "pmCost": 12.41,
        "labourCost": 15.95,
        "calculatedCost": 70.25,
        "sellingPrice": 99.00,
        "ingredients": [
            { "id": "ri_m3b_1", "inventoryItemId": "inv_water", "inventoryName": "WATER", "quantity": 0.015, "unit": "kg", "costPerUnit": 20.00, "cost": 0.30 },
            { "id": "ri_m3b_2", "inventoryItemId": "inv_dry_yeast", "inventoryName": "DRY YEAST", "quantity": 0.006, "unit": "kg", "costPerUnit": 377.12, "cost": 2.07 },
            { "id": "ri_m3b_3", "inventoryItemId": "inv_white_sugar", "inventoryName": "SUGAR", "quantity": 0.050, "unit": "kg", "costPerUnit": 48.19, "cost": 2.41 },
            { "id": "ri_m3b_4", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.040, "unit": "kg", "costPerUnit": 44.77, "cost": 1.79 },
            { "id": "ri_m3b_5", "inventoryItemId": "inv_salt", "inventoryName": "SALT", "quantity": 0.060, "unit": "kg", "costPerUnit": 30.00, "cost": 1.80 },
            { "id": "ri_m3b_6", "inventoryItemId": "inv_cp_powder", "inventoryName": "CP POWDER", "quantity": 0.030, "unit": "kg", "costPerUnit": 256.37, "cost": 7.69 },
            { "id": "ri_m3b_7", "inventoryItemId": "inv_iceberg", "inventoryName": "ICEBERG", "quantity": 0.010, "unit": "kg", "costPerUnit": 273.00, "cost": 2.73 },
            { "id": "ri_m3b_8", "inventoryItemId": "inv_onion", "inventoryName": "ONION", "quantity": 0.010, "unit": "kg", "costPerUnit": 33.00, "cost": 0.33 },
            { "id": "ri_m3b_9", "inventoryItemId": "inv_tomato", "inventoryName": "TOMATO", "quantity": 0.010, "unit": "kg", "costPerUnit": 73.50, "cost": 0.74 },
            { "id": "ri_m3b_10", "inventoryItemId": "inv_cucumber", "inventoryName": "CUCUMBER", "quantity": 0.010, "unit": "kg", "costPerUnit": 84.00, "cost": 0.84 },
            { "id": "ri_m3b_11", "inventoryItemId": "inv_olives", "inventoryName": "OLIVES", "quantity": 0.010, "unit": "kg", "costPerUnit": 775.00, "cost": 7.75 },
            { "id": "ri_m3b_12", "inventoryItemId": "inv_jalapeno", "inventoryName": "JELAPENO", "quantity": 0.010, "unit": "kg", "costPerUnit": 330.00, "cost": 3.30 },
            { "id": "ri_m3b_13", "inventoryItemId": "inv_cream_paneer", "inventoryName": "CREAM PANNER", "quantity": 0.050, "unit": "kg", "costPerUnit": 424.00, "cost": 21.20 },
            { "id": "ri_m3b_14", "inventoryItemId": "inv_hummus", "inventoryName": "HUMMUS", "quantity": 0.010, "unit": "kg", "costPerUnit": 28.96, "cost": 0.29 },
            { "id": "ri_m3b_15", "inventoryItemId": "inv_peri_peri_sauce", "inventoryName": "PERI PERI", "quantity": 0.010, "unit": "kg", "costPerUnit": 352.27, "cost": 3.52 },
            { "id": "ri_m3b_16", "inventoryItemId": "inv_honey_mustard", "inventoryName": "HONEY MUSTARD", "quantity": 0.010, "unit": "kg", "costPerUnit": 43.65, "cost": 0.44 },
            { "id": "ri_m3b_17", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue Paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
            { "id": "ri_m3b_18", "inventoryItemId": "inv_dining_sheet", "inventoryName": "Dinning Sheet", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.55, "cost": 1.55 },
            { "id": "ri_m3b_19", "inventoryItemId": "inv_dinning_tray", "inventoryName": "Dinning Tray", "quantity": 1.000, "unit": "pc", "costPerUnit": 3.67, "cost": 3.67 },
            { "id": "ri_m3b_20", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take away Bag", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
            { "id": "ri_m3b_21", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 15.95, "cost": 15.95 }
        ]
    },
    {
        "id": "r_m4b",
        "menuItemId": "m4b",
        "menuItemName": "Creamy Gyro - Paneer (Signature)",
        "name": "CREAM PANEER GYROS - LARGE",
        "description": "Standard recipe for Creamy Gyro Paneer Signature Large (Price ₹249/-)",
        "yieldQty": 1,
        "prepTime": 10,
        "rmCost": 80.19,
        "pmCost": 12.41,
        "labourCost": 15.95,
        "calculatedCost": 108.55,
        "sellingPrice": 249.00,
        "ingredients": [
            { "id": "ri_m4b_1", "inventoryItemId": "inv_water", "inventoryName": "WATER", "quantity": 0.015, "unit": "kg", "costPerUnit": 20.00, "cost": 0.30 },
            { "id": "ri_m4b_2", "inventoryItemId": "inv_dry_yeast", "inventoryName": "DRY YEAST", "quantity": 0.006, "unit": "kg", "costPerUnit": 377.12, "cost": 2.07 },
            { "id": "ri_m4b_3", "inventoryItemId": "inv_white_sugar", "inventoryName": "SUGAR", "quantity": 0.050, "unit": "kg", "costPerUnit": 48.19, "cost": 2.41 },
            { "id": "ri_m4b_4", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.080, "unit": "kg", "costPerUnit": 44.77, "cost": 3.58 },
            { "id": "ri_m4b_5", "inventoryItemId": "inv_salt", "inventoryName": "SALT", "quantity": 0.060, "unit": "kg", "costPerUnit": 30.00, "cost": 1.80 },
            { "id": "ri_m4b_6", "inventoryItemId": "inv_cp_powder", "inventoryName": "CP POWDER", "quantity": 0.030, "unit": "kg", "costPerUnit": 256.37, "cost": 7.69 },
            { "id": "ri_m4b_7", "inventoryItemId": "inv_iceberg", "inventoryName": "ICEBERG", "quantity": 0.010, "unit": "kg", "costPerUnit": 273.00, "cost": 2.73 },
            { "id": "ri_m4b_8", "inventoryItemId": "inv_onion", "inventoryName": "ONION", "quantity": 0.010, "unit": "kg", "costPerUnit": 33.00, "cost": 0.33 },
            { "id": "ri_m4b_9", "inventoryItemId": "inv_tomato", "inventoryName": "TOMATO", "quantity": 0.010, "unit": "kg", "costPerUnit": 73.50, "cost": 0.74 },
            { "id": "ri_m4b_10", "inventoryItemId": "inv_cucumber", "inventoryName": "CUCUMBER", "quantity": 0.010, "unit": "kg", "costPerUnit": 84.00, "cost": 0.84 },
            { "id": "ri_m4b_11", "inventoryItemId": "inv_olives", "inventoryName": "OLIVES", "quantity": 0.010, "unit": "kg", "costPerUnit": 775.00, "cost": 7.75 },
            { "id": "ri_m4b_12", "inventoryItemId": "inv_jalapeno", "inventoryName": "JELAPENO", "quantity": 0.010, "unit": "kg", "costPerUnit": 330.00, "cost": 3.30 },
            { "id": "ri_m4b_13", "inventoryItemId": "inv_cream_paneer", "inventoryName": "CREAM PANNER", "quantity": 0.100, "unit": "kg", "costPerUnit": 424.00, "cost": 42.40 },
            { "id": "ri_m4b_14", "inventoryItemId": "inv_hummus", "inventoryName": "HUMMUS", "quantity": 0.010, "unit": "kg", "costPerUnit": 28.96, "cost": 0.29 },
            { "id": "ri_m4b_15", "inventoryItemId": "inv_peri_peri_sauce", "inventoryName": "PERI PERI", "quantity": 0.010, "unit": "kg", "costPerUnit": 352.27, "cost": 3.52 },
            { "id": "ri_m4b_16", "inventoryItemId": "inv_honey_mustard", "inventoryName": "HONEY MUSTARD", "quantity": 0.010, "unit": "kg", "costPerUnit": 43.65, "cost": 0.44 },
            { "id": "ri_m4b_17", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue Paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
            { "id": "ri_m4b_18", "inventoryItemId": "inv_dining_sheet", "inventoryName": "Dinning Sheet", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.55, "cost": 1.55 },
            { "id": "ri_m4b_19", "inventoryItemId": "inv_dinning_tray", "inventoryName": "Dinning Tray", "quantity": 1.000, "unit": "pc", "costPerUnit": 3.67, "cost": 3.67 },
            { "id": "ri_m4b_20", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take away Bag", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
            { "id": "ri_m4b_21", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 15.95, "cost": 15.95 }
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
                for item in creamy_paneer_inventory:
                    inv_map[item['id']] = item
                data['inventory'] = list(inv_map.values())

                # Update recipes
                existing_recipes = data.get('recipes', [])
                recipe_map = {r.get('menuItemId', r.get('id')): r for r in existing_recipes}
                for r in creamy_paneer_recipes:
                    recipe_map[r['menuItemId']] = r
                data['recipes'] = list(recipe_map.values())

                with open(fpath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)
                print(f"Updated {fpath} successfully with Creamy Paneer Gyro recipes!")
        except Exception as e:
            print(f"Error updating {fpath}: {e}")
