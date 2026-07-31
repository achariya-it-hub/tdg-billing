import json
import os

crispy_inventory = [
    { "id": "inv_fried_chicken_mix", "name": "Fried Chicken Mixed Breading", "category": "Raw Material", "unit": "kg", "costPerUnit": 39.25, "currentStock": 200, "minimumStock": 20 },
    { "id": "inv_extra_hot_spicy", "name": "Extra Hot and Spicy Marinade", "category": "Raw Material", "unit": "kg", "costPerUnit": 560.00, "currentStock": 50, "minimumStock": 5 },
    { "id": "inv_refined_oil", "name": "Refined Oil", "category": "Raw Material", "unit": "kg", "costPerUnit": 181.58, "currentStock": 100, "minimumStock": 10 },
    { "id": "inv_chicken_leg_thigh", "name": "Chicken Leg & Thigh Raw", "category": "Raw Material", "unit": "kg", "costPerUnit": 250.00, "currentStock": 100, "minimumStock": 10 },
    { "id": "inv_chicken_cover_1pc", "name": "Chicken Cover 1 Pc", "category": "Packing Material", "unit": "pc", "costPerUnit": 1.14, "currentStock": 1000, "minimumStock": 100 },
    { "id": "inv_chicken_tub_4pc", "name": "Chicken Tub 4 Pcs", "category": "Packing Material", "unit": "pc", "costPerUnit": 7.44, "currentStock": 500, "minimumStock": 50 },
    { "id": "inv_tub_lid_4pc", "name": "Tub Lid 4 Pcs", "category": "Packing Material", "unit": "pc", "costPerUnit": 4.64, "currentStock": 500, "minimumStock": 50 }
]

crispy_recipes = [
    {
        "id": "r_m11",
        "menuItemId": "m11",
        "menuItemName": "1 Pc Leg & Thigh (1 Dip)",
        "name": "CRISPY CHICKEN LEG 1 PC",
        "description": "Standard recipe for 1 Pc Crispy Chicken Leg & Thigh (Price ₹70/-)",
        "yieldQty": 1,
        "prepTime": 12,
        "rmCost": 30.20,
        "pmCost": 10.41,
        "labourCost": 3.20,
        "calculatedCost": 43.81,
        "sellingPrice": 70.00,
        "ingredients": [
            { "id": "ri_m11_1", "inventoryItemId": "inv_fried_chicken_mix", "inventoryName": "FRIED CHICKEN MIXED", "quantity": 0.040, "unit": "kg", "costPerUnit": 39.25, "cost": 1.57 },
            { "id": "ri_m11_2", "inventoryItemId": "inv_extra_hot_spicy", "inventoryName": "EXTRA HOT AND SPICY", "quantity": 0.004, "unit": "kg", "costPerUnit": 560.00, "cost": 2.24 },
            { "id": "ri_m11_3", "inventoryItemId": "inv_refined_oil", "inventoryName": "REFINED OIL", "quantity": 0.006, "unit": "kg", "costPerUnit": 181.58, "cost": 1.09 },
            { "id": "ri_m11_4", "inventoryItemId": "inv_chicken_leg_thigh", "inventoryName": "CHICKEN LEG / THIGH", "quantity": 0.100, "unit": "kg", "costPerUnit": 250.00, "cost": 25.00 },
            { "id": "ri_m11_5", "inventoryItemId": "inv_chicken_cover_1pc", "inventoryName": "CHICKEN COVER 1 PCS", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.14, "cost": 1.14 },
            { "id": "ri_m11_6", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
            { "id": "ri_m11_7", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take Away Bags", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
            { "id": "ri_m11_8", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.20, "cost": 3.20 }
        ]
    },
    {
        "id": "r_m12",
        "menuItemId": "m12",
        "menuItemName": "2 Pc Leg & Thigh (1 Dip)",
        "name": "CRISPY CHICKEN 2 PCS",
        "description": "Standard recipe for 2 Pc Crispy Chicken Leg & Thigh (Price ₹140/-)",
        "yieldQty": 1,
        "prepTime": 12,
        "rmCost": 60.40,
        "pmCost": 11.41,
        "labourCost": 3.20,
        "calculatedCost": 75.01,
        "sellingPrice": 140.00,
        "ingredients": [
            { "id": "ri_m12_1", "inventoryItemId": "inv_fried_chicken_mix", "inventoryName": "FRIED CHICKEN MIXED", "quantity": 0.080, "unit": "kg", "costPerUnit": 39.25, "cost": 3.14 },
            { "id": "ri_m12_2", "inventoryItemId": "inv_extra_hot_spicy", "inventoryName": "EXTRA HOT AND SPICY", "quantity": 0.008, "unit": "kg", "costPerUnit": 560.00, "cost": 4.48 },
            { "id": "ri_m12_3", "inventoryItemId": "inv_refined_oil", "inventoryName": "REFINED OIL", "quantity": 0.012, "unit": "kg", "costPerUnit": 181.58, "cost": 2.18 },
            { "id": "ri_m12_4", "inventoryItemId": "inv_chicken_leg_thigh", "inventoryName": "CHICKEN LEG / THIGH", "quantity": 0.200, "unit": "kg", "costPerUnit": 250.00, "cost": 50.00 },
            { "id": "ri_m12_5", "inventoryItemId": "inv_chicken_cover_1pc", "inventoryName": "CHICKEN COVER 2 PCS", "quantity": 2.000, "unit": "pc", "costPerUnit": 1.14, "cost": 2.28 },
            { "id": "ri_m12_6", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
            { "id": "ri_m12_7", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take Away Bags", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
            { "id": "ri_m12_8", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.20, "cost": 3.20 }
        ]
    },
    {
        "id": "r_m13",
        "menuItemId": "m13",
        "menuItemName": "4 Pc Leg & Thigh (2 Dips)",
        "name": "CRISPY CHICKEN 4 PCS",
        "description": "Standard recipe for 4 Pc Crispy Chicken Leg & Thigh (Price ₹280/-)",
        "yieldQty": 1,
        "prepTime": 15,
        "rmCost": 120.80,
        "pmCost": 19.27,
        "labourCost": 3.20,
        "calculatedCost": 143.27,
        "sellingPrice": 280.00,
        "ingredients": [
            { "id": "ri_m13_1", "inventoryItemId": "inv_fried_chicken_mix", "inventoryName": "FRIED CHICKEN MIXED", "quantity": 0.160, "unit": "kg", "costPerUnit": 39.25, "cost": 6.28 },
            { "id": "ri_m13_2", "inventoryItemId": "inv_extra_hot_spicy", "inventoryName": "EXTRA HOT AND SPICY", "quantity": 0.016, "unit": "kg", "costPerUnit": 560.00, "cost": 8.96 },
            { "id": "ri_m13_3", "inventoryItemId": "inv_refined_oil", "inventoryName": "REFINED OIL", "quantity": 0.024, "unit": "kg", "costPerUnit": 181.58, "cost": 4.36 },
            { "id": "ri_m13_4", "inventoryItemId": "inv_chicken_leg_thigh", "inventoryName": "CHICKEN LEG / THIGH", "quantity": 0.400, "unit": "kg", "costPerUnit": 250.00, "cost": 100.00 },
            { "id": "ri_m13_5", "inventoryItemId": "inv_chicken_tub_4pc", "inventoryName": "CHICKEN TUB 4 PCS", "quantity": 1.000, "unit": "pc", "costPerUnit": 7.44, "cost": 7.44 },
            { "id": "ri_m13_6", "inventoryItemId": "inv_tub_lid_4pc", "inventoryName": "TUB LID 4 PCS", "quantity": 1.000, "unit": "pc", "costPerUnit": 4.64, "cost": 4.64 },
            { "id": "ri_m13_7", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
            { "id": "ri_m13_8", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take Away Bags", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
            { "id": "ri_m13_9", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.20, "cost": 3.20 }
        ]
    },
    {
        "id": "r_m14",
        "menuItemId": "m14",
        "menuItemName": "8 Pc Leg & Thigh (4 Dips)",
        "name": "CRISPY CHICKEN 8 PCS",
        "description": "Standard recipe for 8 Pc Crispy Chicken Leg & Thigh (Price ₹560/-)",
        "yieldQty": 1,
        "prepTime": 18,
        "rmCost": 241.60,
        "pmCost": 32.65,
        "labourCost": 3.20,
        "calculatedCost": 277.45,
        "sellingPrice": 560.00,
        "ingredients": [
            { "id": "ri_m14_1", "inventoryItemId": "inv_fried_chicken_mix", "inventoryName": "FRIED CHICKEN MIXED", "quantity": 0.320, "unit": "kg", "costPerUnit": 39.25, "cost": 12.56 },
            { "id": "ri_m14_2", "inventoryItemId": "inv_extra_hot_spicy", "inventoryName": "EXTRA HOT AND SPICY", "quantity": 0.032, "unit": "kg", "costPerUnit": 560.00, "cost": 17.92 },
            { "id": "ri_m14_3", "inventoryItemId": "inv_refined_oil", "inventoryName": "REFINED OIL", "quantity": 0.048, "unit": "kg", "costPerUnit": 181.58, "cost": 8.72 },
            { "id": "ri_m14_4", "inventoryItemId": "inv_chicken_leg_thigh", "inventoryName": "CHICKEN LEG / THIGH", "quantity": 0.800, "unit": "kg", "costPerUnit": 250.00, "cost": 200.00 },
            { "id": "ri_m14_5", "inventoryItemId": "inv_chicken_tub_4pc", "inventoryName": "CHICKEN TUB 4 PCS", "quantity": 2.000, "unit": "pc", "costPerUnit": 7.44, "cost": 14.88 },
            { "id": "ri_m14_6", "inventoryItemId": "inv_tub_lid_4pc", "inventoryName": "TUB LID 4 PCS", "quantity": 2.000, "unit": "pc", "costPerUnit": 4.64, "cost": 9.28 },
            { "id": "ri_m14_7", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue paper", "quantity": 4.000, "unit": "pc", "costPerUnit": 0.27, "cost": 1.08 },
            { "id": "ri_m14_8", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take Away Bags", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
            { "id": "ri_m14_9", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.20, "cost": 3.20 }
        ]
    },
    {
        "id": "r_m15",
        "menuItemId": "m15",
        "menuItemName": "12 Pc Leg & Thigh (6 Dips)",
        "name": "CRISPY CHICKEN 12 PCS",
        "description": "Standard recipe for 12 Pc Crispy Chicken Leg & Thigh (Price ₹840/-)",
        "yieldQty": 1,
        "prepTime": 20,
        "rmCost": 362.40,
        "pmCost": 46.03,
        "labourCost": 3.20,
        "calculatedCost": 411.63,
        "sellingPrice": 840.00,
        "ingredients": [
            { "id": "ri_m15_1", "inventoryItemId": "inv_fried_chicken_mix", "inventoryName": "FRIED CHICKEN MIXED", "quantity": 0.480, "unit": "kg", "costPerUnit": 39.25, "cost": 18.84 },
            { "id": "ri_m15_2", "inventoryItemId": "inv_extra_hot_spicy", "inventoryName": "EXTRA HOT AND SPICY", "quantity": 0.048, "unit": "kg", "costPerUnit": 560.00, "cost": 26.88 },
            { "id": "ri_m15_3", "inventoryItemId": "inv_refined_oil", "inventoryName": "REFINED OIL", "quantity": 0.072, "unit": "kg", "costPerUnit": 181.58, "cost": 13.08 },
            { "id": "ri_m15_4", "inventoryItemId": "inv_chicken_leg_thigh", "inventoryName": "CHICKEN LEG / THIGH", "quantity": 1.200, "unit": "kg", "costPerUnit": 250.00, "cost": 300.00 },
            { "id": "ri_m15_5", "inventoryItemId": "inv_chicken_tub_4pc", "inventoryName": "CHICKEN TUB 4 PCS", "quantity": 3.000, "unit": "pc", "costPerUnit": 7.44, "cost": 22.32 },
            { "id": "ri_m15_6", "inventoryItemId": "inv_tub_lid_4pc", "inventoryName": "TUB LID 4 PCS", "quantity": 3.000, "unit": "pc", "costPerUnit": 4.64, "cost": 13.92 },
            { "id": "ri_m15_7", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue paper", "quantity": 6.000, "unit": "pc", "costPerUnit": 0.27, "cost": 1.62 },
            { "id": "ri_m15_8", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take Away Bags", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
            { "id": "ri_m15_9", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.20, "cost": 3.20 }
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
                for item in crispy_inventory:
                    inv_map[item['id']] = item
                data['inventory'] = list(inv_map.values())

                # Update recipes
                existing_recipes = data.get('recipes', [])
                recipe_map = {r.get('menuItemId', r.get('id')): r for r in existing_recipes}
                for r in crispy_recipes:
                    recipe_map[r['menuItemId']] = r
                data['recipes'] = list(recipe_map.values())

                with open(fpath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)
                print(f"Updated {fpath} successfully with Crispy Chicken recipes!")
        except Exception as e:
            print(f"Error updating {fpath}: {e}")
