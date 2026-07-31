import json
import os

strips_inventory = [
    { "id": "inv_chicken_strips", "name": "Chicken Strips Boneless Raw", "category": "Raw Material", "unit": "kg", "costPerUnit": 350.00, "currentStock": 100, "minimumStock": 10 }
]

strips_recipes = [
    {
        "id": "r_m21",
        "menuItemId": "m21",
        "menuItemName": "3 Pc Strips (1 Dip)",
        "name": "CRISPY STRIPS 3 PCS",
        "description": "Standard recipe for 3 Pc Crispy Chicken Strips (Price ₹120/-)",
        "yieldQty": 1,
        "prepTime": 10,
        "rmCost": 42.90,
        "pmCost": 10.11,
        "labourCost": 3.20,
        "calculatedCost": 56.21,
        "sellingPrice": 120.00,
        "ingredients": [
            { "id": "ri_m21_1", "inventoryItemId": "inv_fried_chicken_mix", "inventoryName": "FRIED CHICKEN MIXED", "quantity": 0.036, "unit": "kg", "costPerUnit": 39.25, "cost": 1.41 },
            { "id": "ri_m21_2", "inventoryItemId": "inv_extra_hot_spicy", "inventoryName": "EXTRA HOT AND SPICY", "quantity": 0.012, "unit": "kg", "costPerUnit": 560.00, "cost": 6.72 },
            { "id": "ri_m21_3", "inventoryItemId": "inv_refined_oil", "inventoryName": "REFINED OIL", "quantity": 0.018, "unit": "kg", "costPerUnit": 181.58, "cost": 3.27 },
            { "id": "ri_m21_4", "inventoryItemId": "inv_chicken_strips", "inventoryName": "CHICKEN STRIPS", "quantity": 0.090, "unit": "kg", "costPerUnit": 350.00, "cost": 31.50 },
            { "id": "ri_m21_5", "inventoryItemId": "inv_dinning_tray_250ml", "inventoryName": "DINNING TRAY 250ML", "quantity": 1.000, "unit": "pc", "costPerUnit": 2.92, "cost": 2.92 },
            { "id": "ri_m21_6", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
            { "id": "ri_m21_7", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take Away Bags", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
            { "id": "ri_m21_8", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.20, "cost": 3.20 }
        ]
    },
    {
        "id": "r_m22",
        "menuItemId": "m22",
        "menuItemName": "6 Pc Strips (2 Dips)",
        "name": "CRISPY STRIPS 6 PCS",
        "description": "Standard recipe for 6 Pc Crispy Chicken Strips (Price ₹240/-)",
        "yieldQty": 1,
        "prepTime": 10,
        "rmCost": 85.80,
        "pmCost": 10.11,
        "labourCost": 3.20,
        "calculatedCost": 99.11,
        "sellingPrice": 240.00,
        "ingredients": [
            { "id": "ri_m22_1", "inventoryItemId": "inv_fried_chicken_mix", "inventoryName": "FRIED CHICKEN MIXED", "quantity": 0.072, "unit": "kg", "costPerUnit": 39.25, "cost": 2.83 },
            { "id": "ri_m22_2", "inventoryItemId": "inv_extra_hot_spicy", "inventoryName": "EXTRA HOT AND SPICY", "quantity": 0.024, "unit": "kg", "costPerUnit": 560.00, "cost": 13.44 },
            { "id": "ri_m22_3", "inventoryItemId": "inv_refined_oil", "inventoryName": "REFINED OIL", "quantity": 0.036, "unit": "kg", "costPerUnit": 181.58, "cost": 6.54 },
            { "id": "ri_m22_4", "inventoryItemId": "inv_chicken_strips", "inventoryName": "CHICKEN STRIPS", "quantity": 0.180, "unit": "kg", "costPerUnit": 350.00, "cost": 63.00 },
            { "id": "ri_m22_5", "inventoryItemId": "inv_dinning_tray_250ml", "inventoryName": "DINNING TRAY 250ML", "quantity": 1.000, "unit": "pc", "costPerUnit": 2.92, "cost": 2.92 },
            { "id": "ri_m22_6", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
            { "id": "ri_m22_7", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take Away Bags", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
            { "id": "ri_m22_8", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.20, "cost": 3.20 }
        ]
    },
    {
        "id": "r_m23",
        "menuItemId": "m23",
        "menuItemName": "9 Pc Strips (3 Dips)",
        "name": "CRISPY STRIPS 9 PCS",
        "description": "Standard recipe for 9 Pc Crispy Chicken Strips (Price ₹360/-)",
        "yieldQty": 1,
        "prepTime": 12,
        "rmCost": 128.70,
        "pmCost": 13.30,
        "labourCost": 3.20,
        "calculatedCost": 145.20,
        "sellingPrice": 360.00,
        "ingredients": [
            { "id": "ri_m23_1", "inventoryItemId": "inv_fried_chicken_mix", "inventoryName": "FRIED CHICKEN MIXED", "quantity": 0.108, "unit": "kg", "costPerUnit": 39.25, "cost": 4.24 },
            { "id": "ri_m23_2", "inventoryItemId": "inv_extra_hot_spicy", "inventoryName": "EXTRA HOT AND SPICY", "quantity": 0.036, "unit": "kg", "costPerUnit": 560.00, "cost": 20.16 },
            { "id": "ri_m23_3", "inventoryItemId": "inv_refined_oil", "inventoryName": "REFINED OIL", "quantity": 0.054, "unit": "kg", "costPerUnit": 181.58, "cost": 9.81 },
            { "id": "ri_m23_4", "inventoryItemId": "inv_chicken_strips", "inventoryName": "CHICKEN STRIPS", "quantity": 0.270, "unit": "kg", "costPerUnit": 350.00, "cost": 94.50 },
            { "id": "ri_m23_5", "inventoryItemId": "inv_dinning_tray_250ml", "inventoryName": "DINNING TRAY 250ML", "quantity": 2.000, "unit": "pc", "costPerUnit": 2.92, "cost": 5.84 },
            { "id": "ri_m23_6", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue paper", "quantity": 3.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.81 },
            { "id": "ri_m23_7", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take Away Bags", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
            { "id": "ri_m23_8", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.20, "cost": 3.20 }
        ]
    },
    {
        "id": "r_m24",
        "menuItemId": "m24",
        "menuItemName": "20 Pc Strips (6 Dips)",
        "name": "CRISPY STRIPS 20 PCS",
        "description": "Standard recipe for 20 Pc Crispy Chicken Strips (Price ₹800/-)",
        "yieldQty": 1,
        "prepTime": 15,
        "rmCost": 286.00,
        "pmCost": 23.14,
        "labourCost": 6.40,
        "calculatedCost": 315.54,
        "sellingPrice": 800.00,
        "ingredients": [
            { "id": "ri_m24_1", "inventoryItemId": "inv_fried_chicken_mix", "inventoryName": "FRIED CHICKEN MIXED", "quantity": 0.240, "unit": "kg", "costPerUnit": 39.25, "cost": 9.42 },
            { "id": "ri_m24_2", "inventoryItemId": "inv_extra_hot_spicy", "inventoryName": "EXTRA HOT AND SPICY", "quantity": 0.080, "unit": "kg", "costPerUnit": 560.00, "cost": 44.80 },
            { "id": "ri_m24_3", "inventoryItemId": "inv_refined_oil", "inventoryName": "REFINED OIL", "quantity": 0.120, "unit": "kg", "costPerUnit": 181.58, "cost": 21.79 },
            { "id": "ri_m24_4", "inventoryItemId": "inv_chicken_strips", "inventoryName": "CHICKEN STRIPS", "quantity": 0.600, "unit": "kg", "costPerUnit": 350.00, "cost": 210.00 },
            { "id": "ri_m24_5", "inventoryItemId": "inv_dinning_tray_250ml", "inventoryName": "DINNING TRAY 250ML", "quantity": 3.000, "unit": "pc", "costPerUnit": 2.92, "cost": 8.76 },
            { "id": "ri_m24_6", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue paper", "quantity": 4.000, "unit": "pc", "costPerUnit": 0.27, "cost": 1.08 },
            { "id": "ri_m24_7", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take Away Bags", "quantity": 2.000, "unit": "pc", "costPerUnit": 6.65, "cost": 13.30 },
            { "id": "ri_m24_8", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 2.000, "unit": "unit", "costPerUnit": 3.20, "cost": 6.40 }
        ]
    },
    {
        "id": "r_m25",
        "menuItemId": "m25",
        "menuItemName": "60 Pc Strips (12 Dips)",
        "name": "CRISPY STRIPS 60 PCS",
        "description": "Standard recipe for 60 Pc Crispy Chicken Strips (Price ₹2400/-)",
        "yieldQty": 1,
        "prepTime": 25,
        "rmCost": 858.00,
        "pmCost": 40.17,
        "labourCost": 16.00,
        "calculatedCost": 914.17,
        "sellingPrice": 2400.00,
        "ingredients": [
            { "id": "ri_m25_1", "inventoryItemId": "inv_fried_chicken_mix", "inventoryName": "FRIED CHICKEN MIXED", "quantity": 0.720, "unit": "kg", "costPerUnit": 39.25, "cost": 28.26 },
            { "id": "ri_m25_2", "inventoryItemId": "inv_extra_hot_spicy", "inventoryName": "EXTRA HOT AND SPICY", "quantity": 0.240, "unit": "kg", "costPerUnit": 560.00, "cost": 134.40 },
            { "id": "ri_m25_3", "inventoryItemId": "inv_refined_oil", "inventoryName": "REFINED OIL", "quantity": 0.360, "unit": "kg", "costPerUnit": 181.58, "cost": 65.37 },
            { "id": "ri_m25_4", "inventoryItemId": "inv_chicken_strips", "inventoryName": "CHICKEN STRIPS", "quantity": 1.800, "unit": "kg", "costPerUnit": 350.00, "cost": 630.00 },
            { "id": "ri_m25_5", "inventoryItemId": "inv_dinning_tray_250ml", "inventoryName": "DINNING TRAY 250ML", "quantity": 6.000, "unit": "pc", "costPerUnit": 2.92, "cost": 17.52 },
            { "id": "ri_m25_6", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue paper", "quantity": 10.000, "unit": "pc", "costPerUnit": 0.27, "cost": 2.70 },
            { "id": "ri_m25_7", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take Away Bags", "quantity": 3.000, "unit": "pc", "costPerUnit": 6.65, "cost": 19.95 },
            { "id": "ri_m25_8", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 5.000, "unit": "unit", "costPerUnit": 3.20, "cost": 16.00 }
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
                for item in strips_inventory:
                    inv_map[item['id']] = item
                data['inventory'] = list(inv_map.values())

                # Update recipes
                existing_recipes = data.get('recipes', [])
                recipe_map = {r.get('menuItemId', r.get('id')): r for r in existing_recipes}
                for r in strips_recipes:
                    recipe_map[r['menuItemId']] = r
                data['recipes'] = list(recipe_map.values())

                with open(fpath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)
                print(f"Updated {fpath} successfully with Crispy Strips recipes!")
        except Exception as e:
            print(f"Error updating {fpath}: {e}")
