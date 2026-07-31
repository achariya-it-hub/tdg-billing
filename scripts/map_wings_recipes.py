import json
import os

wings_inventory = [
    { "id": "inv_chicken_wings", "name": "Chicken Wings Raw", "category": "Raw Material", "unit": "kg", "costPerUnit": 185.71, "currentStock": 100, "minimumStock": 10 },
    { "id": "inv_wings_box_6pc", "name": "Wings Box 6 Pcs", "category": "Packing Material", "unit": "pc", "costPerUnit": 6.11, "currentStock": 1000, "minimumStock": 100 }
]

wings_recipes = [
    {
        "id": "r_m16",
        "menuItemId": "m16",
        "menuItemName": "3 Pc Wings (1 Dip)",
        "name": "CRISPY WINGS 3 PCS",
        "description": "Standard recipe for 3 Pc Crispy Chicken Wings (Price ₹90/-)",
        "yieldQty": 1,
        "prepTime": 10,
        "rmCost": 30.90,
        "pmCost": 13.30,
        "labourCost": 3.20,
        "calculatedCost": 47.40,
        "sellingPrice": 90.00,
        "ingredients": [
            { "id": "ri_m16_1", "inventoryItemId": "inv_fried_chicken_mix", "inventoryName": "FRIED CHICKEN MIXED", "quantity": 0.036, "unit": "kg", "costPerUnit": 39.25, "cost": 1.41 },
            { "id": "ri_m16_2", "inventoryItemId": "inv_extra_hot_spicy", "inventoryName": "EXTRA HOT AND SPICY", "quantity": 0.012, "unit": "kg", "costPerUnit": 560.00, "cost": 6.72 },
            { "id": "ri_m16_3", "inventoryItemId": "inv_refined_oil", "inventoryName": "REFINED OIL", "quantity": 0.018, "unit": "kg", "costPerUnit": 181.58, "cost": 3.27 },
            { "id": "ri_m16_4", "inventoryItemId": "inv_chicken_wings", "inventoryName": "CHICKEN WINGS", "quantity": 0.105, "unit": "kg", "costPerUnit": 185.71, "cost": 19.50 },
            { "id": "ri_m16_5", "inventoryItemId": "inv_wings_box_6pc", "inventoryName": "WINGS BOX 6 PCS", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.11, "cost": 6.11 },
            { "id": "ri_m16_6", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
            { "id": "ri_m16_7", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take Away Bags", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
            { "id": "ri_m16_8", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.20, "cost": 3.20 }
        ]
    },
    {
        "id": "r_m17",
        "menuItemId": "m17",
        "menuItemName": "6 Pc Wings (2 Dips)",
        "name": "CRISPY WINGS 6 PCS",
        "description": "Standard recipe for 6 Pc Crispy Chicken Wings (Price ₹180/-)",
        "yieldQty": 1,
        "prepTime": 10,
        "rmCost": 61.80,
        "pmCost": 13.30,
        "labourCost": 3.20,
        "calculatedCost": 78.30,
        "sellingPrice": 180.00,
        "ingredients": [
            { "id": "ri_m17_1", "inventoryItemId": "inv_fried_chicken_mix", "inventoryName": "FRIED CHICKEN MIXED", "quantity": 0.072, "unit": "kg", "costPerUnit": 39.25, "cost": 2.83 },
            { "id": "ri_m17_2", "inventoryItemId": "inv_extra_hot_spicy", "inventoryName": "EXTRA HOT AND SPICY", "quantity": 0.024, "unit": "kg", "costPerUnit": 560.00, "cost": 13.44 },
            { "id": "ri_m17_3", "inventoryItemId": "inv_refined_oil", "inventoryName": "REFINED OIL", "quantity": 0.036, "unit": "kg", "costPerUnit": 181.58, "cost": 6.54 },
            { "id": "ri_m17_4", "inventoryItemId": "inv_chicken_wings", "inventoryName": "CHICKEN WINGS", "quantity": 0.210, "unit": "kg", "costPerUnit": 185.71, "cost": 39.00 },
            { "id": "ri_m17_5", "inventoryItemId": "inv_wings_box_6pc", "inventoryName": "WINGS BOX 6 PCS", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.11, "cost": 6.11 },
            { "id": "ri_m17_6", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
            { "id": "ri_m17_7", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take Away Bags", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
            { "id": "ri_m17_8", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.20, "cost": 3.20 }
        ]
    },
    {
        "id": "r_m18",
        "menuItemId": "m18",
        "menuItemName": "9 Pc Wings (3 Dips)",
        "name": "CRISPY WINGS 9 PCS",
        "description": "Standard recipe for 9 Pc Crispy Chicken Wings (Price ₹270/-)",
        "yieldQty": 1,
        "prepTime": 12,
        "rmCost": 92.70,
        "pmCost": 19.68,
        "labourCost": 3.20,
        "calculatedCost": 115.58,
        "sellingPrice": 270.00,
        "ingredients": [
            { "id": "ri_m18_1", "inventoryItemId": "inv_fried_chicken_mix", "inventoryName": "FRIED CHICKEN MIXED", "quantity": 0.108, "unit": "kg", "costPerUnit": 39.25, "cost": 4.24 },
            { "id": "ri_m18_2", "inventoryItemId": "inv_extra_hot_spicy", "inventoryName": "EXTRA HOT AND SPICY", "quantity": 0.036, "unit": "kg", "costPerUnit": 560.00, "cost": 20.16 },
            { "id": "ri_m18_3", "inventoryItemId": "inv_refined_oil", "inventoryName": "REFINED OIL", "quantity": 0.054, "unit": "kg", "costPerUnit": 181.58, "cost": 9.81 },
            { "id": "ri_m18_4", "inventoryItemId": "inv_chicken_wings", "inventoryName": "CHICKEN WINGS", "quantity": 0.315, "unit": "kg", "costPerUnit": 185.71, "cost": 58.50 },
            { "id": "ri_m18_5", "inventoryItemId": "inv_wings_box_6pc", "inventoryName": "WINGS BOX 6 PCS", "quantity": 2.000, "unit": "pc", "costPerUnit": 6.11, "cost": 12.22 },
            { "id": "ri_m18_6", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue paper", "quantity": 3.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.81 },
            { "id": "ri_m18_7", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take Away Bags", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
            { "id": "ri_m18_8", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.20, "cost": 3.20 }
        ]
    },
    {
        "id": "r_m19",
        "menuItemId": "m19",
        "menuItemName": "20 Pc Wings (6 Dips)",
        "name": "CRISPY WINGS 20 PCS",
        "description": "Standard recipe for 20 Pc Crispy Chicken Wings (Price ₹600/-)",
        "yieldQty": 1,
        "prepTime": 15,
        "rmCost": 206.00,
        "pmCost": 38.82,
        "labourCost": 6.40,
        "calculatedCost": 251.22,
        "sellingPrice": 600.00,
        "ingredients": [
            { "id": "ri_m19_1", "inventoryItemId": "inv_fried_chicken_mix", "inventoryName": "FRIED CHICKEN MIXED", "quantity": 0.240, "unit": "kg", "costPerUnit": 39.25, "cost": 9.42 },
            { "id": "ri_m19_2", "inventoryItemId": "inv_extra_hot_spicy", "inventoryName": "EXTRA HOT AND SPICY", "quantity": 0.080, "unit": "kg", "costPerUnit": 560.00, "cost": 44.80 },
            { "id": "ri_m19_3", "inventoryItemId": "inv_refined_oil", "inventoryName": "REFINED OIL", "quantity": 0.120, "unit": "kg", "costPerUnit": 181.58, "cost": 21.79 },
            { "id": "ri_m19_4", "inventoryItemId": "inv_chicken_wings", "inventoryName": "CHICKEN WINGS", "quantity": 0.700, "unit": "kg", "costPerUnit": 185.71, "cost": 130.00 },
            { "id": "ri_m19_5", "inventoryItemId": "inv_wings_box_6pc", "inventoryName": "WINGS BOX 6 PCS", "quantity": 4.000, "unit": "pc", "costPerUnit": 6.11, "cost": 24.44 },
            { "id": "ri_m19_6", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue paper", "quantity": 4.000, "unit": "pc", "costPerUnit": 0.27, "cost": 1.08 },
            { "id": "ri_m19_7", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take Away Bags", "quantity": 2.000, "unit": "pc", "costPerUnit": 6.65, "cost": 13.30 },
            { "id": "ri_m19_8", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 2.000, "unit": "unit", "costPerUnit": 3.20, "cost": 6.40 }
        ]
    },
    {
        "id": "r_m20",
        "menuItemId": "m20",
        "menuItemName": "60 Pc Wings (12 Dips)",
        "name": "CRISPY WINGS 60 PCS",
        "description": "Standard recipe for 60 Pc Crispy Chicken Wings (Price ₹1500/-)",
        "yieldQty": 1,
        "prepTime": 25,
        "rmCost": 515.00,
        "pmCost": 77.64,
        "labourCost": 16.00,
        "calculatedCost": 608.64,
        "sellingPrice": 1500.00,
        "ingredients": [
            { "id": "ri_m20_1", "inventoryItemId": "inv_fried_chicken_mix", "inventoryName": "FRIED CHICKEN MIXED", "quantity": 0.600, "unit": "kg", "costPerUnit": 39.25, "cost": 23.55 },
            { "id": "ri_m20_2", "inventoryItemId": "inv_extra_hot_spicy", "inventoryName": "EXTRA HOT AND SPICY", "quantity": 0.200, "unit": "kg", "costPerUnit": 560.00, "cost": 112.00 },
            { "id": "ri_m20_3", "inventoryItemId": "inv_refined_oil", "inventoryName": "REFINED OIL", "quantity": 0.300, "unit": "kg", "costPerUnit": 181.58, "cost": 54.47 },
            { "id": "ri_m20_4", "inventoryItemId": "inv_chicken_wings", "inventoryName": "CHICKEN WINGS", "quantity": 1.750, "unit": "kg", "costPerUnit": 185.71, "cost": 325.00 },
            { "id": "ri_m20_5", "inventoryItemId": "inv_wings_box_6pc", "inventoryName": "WINGS BOX 6 PCS", "quantity": 9.000, "unit": "pc", "costPerUnit": 6.11, "cost": 54.99 },
            { "id": "ri_m20_6", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue paper", "quantity": 10.000, "unit": "pc", "costPerUnit": 0.27, "cost": 2.70 },
            { "id": "ri_m20_7", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take Away Bags", "quantity": 3.000, "unit": "pc", "costPerUnit": 6.65, "cost": 19.95 },
            { "id": "ri_m20_8", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 5.000, "unit": "unit", "costPerUnit": 3.20, "cost": 16.00 }
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
                for item in wings_inventory:
                    inv_map[item['id']] = item
                data['inventory'] = list(inv_map.values())

                # Update recipes
                existing_recipes = data.get('recipes', [])
                recipe_map = {r.get('menuItemId', r.get('id')): r for r in existing_recipes}
                for r in wings_recipes:
                    recipe_map[r['menuItemId']] = r
                data['recipes'] = list(recipe_map.values())

                with open(fpath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)
                print(f"Updated {fpath} successfully with Crispy Wings recipes!")
        except Exception as e:
            print(f"Error updating {fpath}: {e}")
