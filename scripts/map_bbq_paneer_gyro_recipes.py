import json
import os

bbq_paneer_inventory = [
    { "id": "inv_bbq_paneer", "name": "BBQ Paneer Cooked", "category": "Raw Material", "unit": "kg", "costPerUnit": 420.40, "currentStock": 100, "minimumStock": 10 }
]

bbq_paneer_recipes = [
    {
        "id": "r_m5b",
        "menuItemId": "m5b",
        "menuItemName": "BBQ Gyro - Paneer (Mini)",
        "name": "BARBEQUE PANNER GYROS - SMALL",
        "description": "Standard recipe for BBQ Gyro Paneer Mini (Price ₹99/-)",
        "yieldQty": 1,
        "prepTime": 8,
        "rmCost": 41.71,
        "pmCost": 12.41,
        "labourCost": 15.95,
        "calculatedCost": 70.07,
        "sellingPrice": 99.00,
        "ingredients": [
            { "id": "ri_m5b_1", "inventoryItemId": "inv_water", "inventoryName": "WATER", "quantity": 0.015, "unit": "kg", "costPerUnit": 20.00, "cost": 0.30 },
            { "id": "ri_m5b_2", "inventoryItemId": "inv_dry_yeast", "inventoryName": "DRY YEAST", "quantity": 0.006, "unit": "kg", "costPerUnit": 377.12, "cost": 2.07 },
            { "id": "ri_m5b_3", "inventoryItemId": "inv_white_sugar", "inventoryName": "SUGAR", "quantity": 0.050, "unit": "kg", "costPerUnit": 48.19, "cost": 2.41 },
            { "id": "ri_m5b_4", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.040, "unit": "kg", "costPerUnit": 44.77, "cost": 1.79 },
            { "id": "ri_m5b_5", "inventoryItemId": "inv_salt", "inventoryName": "SALT", "quantity": 0.060, "unit": "kg", "costPerUnit": 30.00, "cost": 1.80 },
            { "id": "ri_m5b_6", "inventoryItemId": "inv_cp_powder", "inventoryName": "CP POWDER", "quantity": 0.030, "unit": "kg", "costPerUnit": 256.37, "cost": 7.69 },
            { "id": "ri_m5b_7", "inventoryItemId": "inv_iceberg", "inventoryName": "ICEBERG", "quantity": 0.010, "unit": "kg", "costPerUnit": 273.00, "cost": 2.73 },
            { "id": "ri_m5b_8", "inventoryItemId": "inv_onion", "inventoryName": "ONION", "quantity": 0.010, "unit": "kg", "costPerUnit": 33.00, "cost": 0.33 },
            { "id": "ri_m5b_9", "inventoryItemId": "inv_tomato", "inventoryName": "TOMATO", "quantity": 0.010, "unit": "kg", "costPerUnit": 73.50, "cost": 0.74 },
            { "id": "ri_m5b_10", "inventoryItemId": "inv_cucumber", "inventoryName": "CUCUMBER", "quantity": 0.010, "unit": "kg", "costPerUnit": 84.00, "cost": 0.84 },
            { "id": "ri_m5b_11", "inventoryItemId": "inv_olives", "inventoryName": "OLIVES", "quantity": 0.010, "unit": "kg", "costPerUnit": 775.00, "cost": 7.75 },
            { "id": "ri_m5b_12", "inventoryItemId": "inv_jalapeno", "inventoryName": "JELAPENO", "quantity": 0.010, "unit": "kg", "costPerUnit": 330.00, "cost": 3.30 },
            { "id": "ri_m5b_13", "inventoryItemId": "inv_bbq_paneer", "inventoryName": "BBQ PANNER", "quantity": 0.050, "unit": "kg", "costPerUnit": 420.40, "cost": 21.02 },
            { "id": "ri_m5b_14", "inventoryItemId": "inv_hummus", "inventoryName": "HUMMUS", "quantity": 0.010, "unit": "kg", "costPerUnit": 28.96, "cost": 0.29 },
            { "id": "ri_m5b_15", "inventoryItemId": "inv_peri_peri_sauce", "inventoryName": "PERI PERI", "quantity": 0.010, "unit": "kg", "costPerUnit": 352.27, "cost": 3.52 },
            { "id": "ri_m5b_16", "inventoryItemId": "inv_honey_mustard", "inventoryName": "HONEY MUSTARD", "quantity": 0.010, "unit": "kg", "costPerUnit": 43.65, "cost": 0.44 },
            { "id": "ri_m5b_17", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue Paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
            { "id": "ri_m5b_18", "inventoryItemId": "inv_dining_sheet", "inventoryName": "Dinning Sheet", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.55, "cost": 1.55 },
            { "id": "ri_m5b_19", "inventoryItemId": "inv_dinning_tray", "inventoryName": "Dinning Tray", "quantity": 1.000, "unit": "pc", "costPerUnit": 3.67, "cost": 3.67 },
            { "id": "ri_m5b_20", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take away Bag", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
            { "id": "ri_m5b_21", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 15.95, "cost": 15.95 }
        ]
    },
    {
        "id": "r_m6b",
        "menuItemId": "m6b",
        "menuItemName": "BBQ Gyro - Paneer (Signature)",
        "name": "BARBEQUE PANNER GYROS - LARGE",
        "description": "Standard recipe for BBQ Gyro Paneer Signature Large (Price ₹249/-)",
        "yieldQty": 1,
        "prepTime": 10,
        "rmCost": 79.83,
        "pmCost": 12.41,
        "labourCost": 15.95,
        "calculatedCost": 108.19,
        "sellingPrice": 249.00,
        "ingredients": [
            { "id": "ri_m6b_1", "inventoryItemId": "inv_water", "inventoryName": "WATER", "quantity": 0.015, "unit": "kg", "costPerUnit": 20.00, "cost": 0.30 },
            { "id": "ri_m6b_2", "inventoryItemId": "inv_dry_yeast", "inventoryName": "DRY YEAST", "quantity": 0.006, "unit": "kg", "costPerUnit": 377.12, "cost": 2.07 },
            { "id": "ri_m6b_3", "inventoryItemId": "inv_white_sugar", "inventoryName": "SUGAR", "quantity": 0.050, "unit": "kg", "costPerUnit": 48.19, "cost": 2.41 },
            { "id": "ri_m6b_4", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.080, "unit": "kg", "costPerUnit": 44.77, "cost": 3.58 },
            { "id": "ri_m6b_5", "inventoryItemId": "inv_salt", "inventoryName": "SALT", "quantity": 0.060, "unit": "kg", "costPerUnit": 30.00, "cost": 1.80 },
            { "id": "ri_m6b_6", "inventoryItemId": "inv_cp_powder", "inventoryName": "CP POWDER", "quantity": 0.030, "unit": "kg", "costPerUnit": 256.37, "cost": 7.69 },
            { "id": "ri_m6b_7", "inventoryItemId": "inv_iceberg", "inventoryName": "ICEBERG", "quantity": 0.010, "unit": "kg", "costPerUnit": 273.00, "cost": 2.73 },
            { "id": "ri_m6b_8", "inventoryItemId": "inv_onion", "inventoryName": "ONION", "quantity": 0.010, "unit": "kg", "costPerUnit": 33.00, "cost": 0.33 },
            { "id": "ri_m6b_9", "inventoryItemId": "inv_tomato", "inventoryName": "TOMATO", "quantity": 0.010, "unit": "kg", "costPerUnit": 73.50, "cost": 0.74 },
            { "id": "ri_m6b_10", "inventoryItemId": "inv_cucumber", "inventoryName": "CUCUMBER", "quantity": 0.010, "unit": "kg", "costPerUnit": 84.00, "cost": 0.84 },
            { "id": "ri_m6b_11", "inventoryItemId": "inv_olives", "inventoryName": "OLIVES", "quantity": 0.010, "unit": "kg", "costPerUnit": 775.00, "cost": 7.75 },
            { "id": "ri_m6b_12", "inventoryItemId": "inv_jalapeno", "inventoryName": "JELAPENO", "quantity": 0.010, "unit": "kg", "costPerUnit": 330.00, "cost": 3.30 },
            { "id": "ri_m6b_13", "inventoryItemId": "inv_bbq_paneer", "inventoryName": "BBQ PANNER", "quantity": 0.100, "unit": "kg", "costPerUnit": 420.40, "cost": 42.04 },
            { "id": "ri_m6b_14", "inventoryItemId": "inv_hummus", "inventoryName": "HUMMUS", "quantity": 0.010, "unit": "kg", "costPerUnit": 28.96, "cost": 0.29 },
            { "id": "ri_m6b_15", "inventoryItemId": "inv_peri_peri_sauce", "inventoryName": "PERI PERI", "quantity": 0.010, "unit": "kg", "costPerUnit": 352.27, "cost": 3.52 },
            { "id": "ri_m6b_16", "inventoryItemId": "inv_honey_mustard", "inventoryName": "HONEY MUSTARD", "quantity": 0.010, "unit": "kg", "costPerUnit": 43.65, "cost": 0.44 },
            { "id": "ri_m6b_17", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue Paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
            { "id": "ri_m6b_18", "inventoryItemId": "inv_dining_sheet", "inventoryName": "Dinning Sheet", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.55, "cost": 1.55 },
            { "id": "ri_m6b_19", "inventoryItemId": "inv_dinning_tray", "inventoryName": "Dinning Tray", "quantity": 1.000, "unit": "pc", "costPerUnit": 3.67, "cost": 3.67 },
            { "id": "ri_m6b_20", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take away Bag", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
            { "id": "ri_m6b_21", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 15.95, "cost": 15.95 }
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
                for item in bbq_paneer_inventory:
                    inv_map[item['id']] = item
                data['inventory'] = list(inv_map.values())

                # Update recipes
                existing_recipes = data.get('recipes', [])
                recipe_map = {r.get('menuItemId', r.get('id')): r for r in existing_recipes}
                for r in bbq_paneer_recipes:
                    recipe_map[r['menuItemId']] = r
                data['recipes'] = list(recipe_map.values())

                with open(fpath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)
                print(f"Updated {fpath} successfully with BBQ Paneer Gyro recipes!")
        except Exception as e:
            print(f"Error updating {fpath}: {e}")
