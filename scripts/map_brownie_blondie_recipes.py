import json
import os

dessert_inventory = [
    { "id": "inv_butter", "name": "Butter", "category": "Raw Material", "unit": "kg", "costPerUnit": 754.29, "currentStock": 50, "minimumStock": 5 },
    { "id": "inv_dark_compound", "name": "Dark Compound", "category": "Raw Material", "unit": "kg", "costPerUnit": 391.82, "currentStock": 50, "minimumStock": 5 },
    { "id": "inv_egg", "name": "Egg", "category": "Raw Material", "unit": "pc", "costPerUnit": 6.30, "currentStock": 500, "minimumStock": 50 },
    { "id": "inv_vanilla_essence", "name": "Vanilla Essence", "category": "Raw Material", "unit": "kg", "costPerUnit": 484.75, "currentStock": 20, "minimumStock": 2 },
    { "id": "inv_white_sugar", "name": "White Sugar", "category": "Raw Material", "unit": "kg", "costPerUnit": 48.19, "currentStock": 100, "minimumStock": 10 },
    { "id": "inv_maida", "name": "Maida", "category": "Raw Material", "unit": "kg", "costPerUnit": 44.77, "currentStock": 100, "minimumStock": 10 },
    { "id": "inv_brown_sugar", "name": "Brown Sugar", "category": "Raw Material", "unit": "kg", "costPerUnit": 230.00, "currentStock": 50, "minimumStock": 5 },
    { "id": "inv_milk_compound", "name": "Milk Compound", "category": "Raw Material", "unit": "kg", "costPerUnit": 328.00, "currentStock": 50, "minimumStock": 5 },
    { "id": "inv_white_compound", "name": "White Compound", "category": "Raw Material", "unit": "kg", "costPerUnit": 391.82, "currentStock": 50, "minimumStock": 5 },
    { "id": "inv_dinning_tray_250ml", "name": "Dinning Tray 250ml", "category": "Packing Material", "unit": "pc", "costPerUnit": 2.92, "currentStock": 1000, "minimumStock": 100 },
    { "id": "inv_wooden_spoon", "name": "Wooden Spoon", "category": "Packing Material", "unit": "pc", "costPerUnit": 1.68, "currentStock": 1000, "minimumStock": 100 },
    { "id": "inv_tissue_paper", "name": "Tissue Paper", "category": "Packing Material", "unit": "pc", "costPerUnit": 0.27, "currentStock": 5000, "minimumStock": 500 },
    { "id": "inv_takeaway_bags", "name": "Take Away Bags", "category": "Packing Material", "unit": "pc", "costPerUnit": 6.65, "currentStock": 1000, "minimumStock": 100 }
]

dessert_recipes = [
    {
        "id": "r_m60",
        "menuItemId": "m60",
        "menuItemName": "Chocolate Brownie",
        "name": "CHOCOLATE BROWNIE",
        "description": "Standard recipe for Chocolate Brownie (Price ₹99/-)",
        "yieldQty": 1,
        "prepTime": 5,
        "rmCost": 29.82,
        "pmCost": 11.78,
        "labourCost": 3.20,
        "calculatedCost": 44.80,
        "sellingPrice": 99.00,
        "ingredients": [
            { "id": "ri_m60_1", "inventoryItemId": "inv_butter", "inventoryName": "BUTTER", "quantity": 0.017, "unit": "kg", "costPerUnit": 754.29, "cost": 12.57 },
            { "id": "ri_m60_2", "inventoryItemId": "inv_dark_compound", "inventoryName": "DARK COMPOUND", "quantity": 0.025, "unit": "kg", "costPerUnit": 391.82, "cost": 9.80 },
            { "id": "ri_m60_3", "inventoryItemId": "inv_egg", "inventoryName": "EGG", "quantity": 0.333, "unit": "pc", "costPerUnit": 6.30, "cost": 2.10 },
            { "id": "ri_m60_4", "inventoryItemId": "inv_vanilla_essence", "inventoryName": "VANNILA ESSENCE", "quantity": 0.001, "unit": "kg", "costPerUnit": 484.75, "cost": 0.24 },
            { "id": "ri_m60_5", "inventoryItemId": "inv_white_sugar", "inventoryName": "WHITE SUGAR", "quantity": 0.017, "unit": "kg", "costPerUnit": 48.19, "cost": 0.80 },
            { "id": "ri_m60_6", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.017, "unit": "kg", "costPerUnit": 44.77, "cost": 0.75 },
            { "id": "ri_m60_7", "inventoryItemId": "inv_brown_sugar", "inventoryName": "BROWN SUGAR", "quantity": 0.008, "unit": "kg", "costPerUnit": 230.00, "cost": 1.92 },
            { "id": "ri_m60_8", "inventoryItemId": "inv_milk_compound", "inventoryName": "MILK COMPOUND", "quantity": 0.005, "unit": "kg", "costPerUnit": 328.00, "cost": 1.64 },
            { "id": "ri_m60_9", "inventoryItemId": "inv_dinning_tray_250ml", "inventoryName": "DINNING TRAY 250ML", "quantity": 1.000, "unit": "pc", "costPerUnit": 2.92, "cost": 2.92 },
            { "id": "ri_m60_10", "inventoryItemId": "inv_wooden_spoon", "inventoryName": "Wooden Spoon", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.68, "cost": 1.68 },
            { "id": "ri_m60_11", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
            { "id": "ri_m60_12", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take Away Bags", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
            { "id": "ri_m60_13", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.20, "cost": 3.20 }
        ]
    },
    {
        "id": "r_m61",
        "menuItemId": "m61",
        "menuItemName": "Blondie Cake",
        "name": "BLONDIE CAKE",
        "description": "Standard recipe for Blondie Cake (Price ₹99/-)",
        "yieldQty": 1,
        "prepTime": 5,
        "rmCost": 28.62,
        "pmCost": 11.78,
        "labourCost": 3.20,
        "calculatedCost": 43.60,
        "sellingPrice": 99.00,
        "ingredients": [
            { "id": "ri_m61_1", "inventoryItemId": "inv_butter", "inventoryName": "BUTTER", "quantity": 0.017, "unit": "kg", "costPerUnit": 754.29, "cost": 12.57 },
            { "id": "ri_m61_2", "inventoryItemId": "inv_white_compound", "inventoryName": "WHITE COMPOUND", "quantity": 0.030, "unit": "kg", "costPerUnit": 391.82, "cost": 11.75 },
            { "id": "ri_m61_3", "inventoryItemId": "inv_egg", "inventoryName": "EGG", "quantity": 0.333, "unit": "pc", "costPerUnit": 6.30, "cost": 2.10 },
            { "id": "ri_m61_4", "inventoryItemId": "inv_vanilla_essence", "inventoryName": "VANNILA ESSENCE", "quantity": 0.001, "unit": "kg", "costPerUnit": 484.75, "cost": 0.24 },
            { "id": "ri_m61_5", "inventoryItemId": "inv_white_sugar", "inventoryName": "WHITE SUGAR", "quantity": 0.025, "unit": "kg", "costPerUnit": 48.19, "cost": 1.20 },
            { "id": "ri_m61_6", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.017, "unit": "kg", "costPerUnit": 44.77, "cost": 0.75 },
            { "id": "ri_m61_7", "inventoryItemId": "inv_dinning_tray_250ml", "inventoryName": "DINNING TRAY 250ML", "quantity": 1.000, "unit": "pc", "costPerUnit": 2.92, "cost": 2.92 },
            { "id": "ri_m61_8", "inventoryItemId": "inv_wooden_spoon", "inventoryName": "Wooden Spoon", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.68, "cost": 1.68 },
            { "id": "ri_m61_9", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
            { "id": "ri_m61_10", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take Away Bags", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
            { "id": "ri_m61_11", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.20, "cost": 3.20 }
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
                for item in dessert_inventory:
                    inv_map[item['id']] = item
                data['inventory'] = list(inv_map.values())

                # Update recipes
                existing_recipes = data.get('recipes', [])
                recipe_map = {r.get('menuItemId', r.get('id')): r for r in existing_recipes}
                for r in dessert_recipes:
                    recipe_map[r['menuItemId']] = r
                data['recipes'] = list(recipe_map.values())

                with open(fpath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)
                print(f"Updated {fpath} successfully with Brownie & Blondie recipes!")
        except Exception as e:
            print(f"Error updating {fpath}: {e}")
