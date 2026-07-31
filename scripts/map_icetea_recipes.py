import json
import os

icetea_inventory = [
    {
        "id": "inv_lime",
        "name": "Lime Premix/Flavor",
        "category": "Raw Material",
        "unit": "kg",
        "costPerUnit": 550.00,
        "currentStock": 100,
        "minimumStock": 10
    },
    {
        "id": "inv_peach",
        "name": "Peach Premix/Flavor",
        "category": "Raw Material",
        "unit": "kg",
        "costPerUnit": 550.00,
        "currentStock": 100,
        "minimumStock": 10
    },
    {
        "id": "inv_paper_straw",
        "name": "Paper Straw",
        "category": "Packing Material",
        "unit": "pc",
        "costPerUnit": 1.10,
        "currentStock": 2000,
        "minimumStock": 200
    },
    {
        "id": "inv_bev_lid_650_icetea",
        "name": "Beverages with LID 650ml (Ice Tea)",
        "category": "Packing Material",
        "unit": "pc",
        "costPerUnit": 8.09,
        "currentStock": 1000,
        "minimumStock": 100
    }
]

icetea_recipes = [
    {
        "id": "r_m56a",
        "menuItemId": "m56a",
        "menuItemName": "Lime Ice Tea (Regular)",
        "name": "Lime 330ml",
        "description": "Standard recipe for Lime Ice Tea 330ml (Price ₹59/-)",
        "yieldQty": 1,
        "prepTime": 2,
        "rmCost": 17.40,
        "pmCost": 6.59,
        "labourCost": 3.20,
        "calculatedCost": 27.19,
        "sellingPrice": 59.00,
        "ingredients": [
            {
                "id": "ri_m56a_1",
                "inventoryItemId": "inv_lime",
                "inventoryName": "Lime",
                "quantity": 0.030,
                "unit": "kg",
                "costPerUnit": 550.00,
                "cost": 16.50
            },
            {
                "id": "ri_m56a_2",
                "inventoryItemId": "inv_ice_cube",
                "inventoryName": "ICE CUBE",
                "quantity": 0.150,
                "unit": "kg",
                "costPerUnit": 6.00,
                "cost": 0.90
            },
            {
                "id": "ri_m56a_3",
                "inventoryItemId": "inv_bev_lid_330",
                "inventoryName": "Beverages with LID 330ml",
                "quantity": 1.000,
                "unit": "pc",
                "costPerUnit": 5.49,
                "cost": 5.49
            },
            {
                "id": "ri_m56a_4",
                "inventoryItemId": "inv_paper_straw",
                "inventoryName": "Paper Straw",
                "quantity": 1.000,
                "unit": "pc",
                "costPerUnit": 1.10,
                "cost": 1.10
            },
            {
                "id": "ri_m56a_5",
                "inventoryItemId": "inv_labour",
                "inventoryName": "Labour Cost",
                "quantity": 1.000,
                "unit": "unit",
                "costPerUnit": 3.20,
                "cost": 3.20
            }
        ]
    },
    {
        "id": "r_m55a",
        "menuItemId": "m55a",
        "menuItemName": "Peach Ice Tea (Regular)",
        "name": "Peach 330ml",
        "description": "Standard recipe for Peach Ice Tea 330ml (Price ₹59/-)",
        "yieldQty": 1,
        "prepTime": 2,
        "rmCost": 17.40,
        "pmCost": 6.59,
        "labourCost": 3.20,
        "calculatedCost": 27.19,
        "sellingPrice": 59.00,
        "ingredients": [
            {
                "id": "ri_m55a_1",
                "inventoryItemId": "inv_peach",
                "inventoryName": "Peach",
                "quantity": 0.030,
                "unit": "kg",
                "costPerUnit": 550.00,
                "cost": 16.50
            },
            {
                "id": "ri_m55a_2",
                "inventoryItemId": "inv_ice_cube",
                "inventoryName": "ICE CUBE",
                "quantity": 0.150,
                "unit": "kg",
                "costPerUnit": 6.00,
                "cost": 0.90
            },
            {
                "id": "ri_m55a_3",
                "inventoryItemId": "inv_bev_lid_330",
                "inventoryName": "Beverages with LID 330ml",
                "quantity": 1.000,
                "unit": "pc",
                "costPerUnit": 5.49,
                "cost": 5.49
            },
            {
                "id": "ri_m55a_4",
                "inventoryItemId": "inv_paper_straw",
                "inventoryName": "Paper Straw",
                "quantity": 1.000,
                "unit": "pc",
                "costPerUnit": 1.10,
                "cost": 1.10
            },
            {
                "id": "ri_m55a_5",
                "inventoryItemId": "inv_labour",
                "inventoryName": "Labour Cost",
                "quantity": 1.000,
                "unit": "unit",
                "costPerUnit": 3.20,
                "cost": 3.20
            }
        ]
    },
    {
        "id": "r_m56b",
        "menuItemId": "m56b",
        "menuItemName": "Lime Ice Tea (Large)",
        "name": "Lime 650ml",
        "description": "Standard recipe for Lime Ice Tea 650ml (Price ₹99/-)",
        "yieldQty": 1,
        "prepTime": 2,
        "rmCost": 34.80,
        "pmCost": 9.19,
        "labourCost": 3.20,
        "calculatedCost": 47.19,
        "sellingPrice": 99.00,
        "ingredients": [
            {
                "id": "ri_m56b_1",
                "inventoryItemId": "inv_lime",
                "inventoryName": "LIME",
                "quantity": 0.060,
                "unit": "kg",
                "costPerUnit": 550.00,
                "cost": 33.00
            },
            {
                "id": "ri_m56b_2",
                "inventoryItemId": "inv_ice_cube",
                "inventoryName": "ICE CUBE",
                "quantity": 0.300,
                "unit": "kg",
                "costPerUnit": 6.00,
                "cost": 1.80
            },
            {
                "id": "ri_m56b_3",
                "inventoryItemId": "inv_bev_lid_650_icetea",
                "inventoryName": "Beverages with LID 650ml",
                "quantity": 1.000,
                "unit": "pc",
                "costPerUnit": 8.09,
                "cost": 8.09
            },
            {
                "id": "ri_m56b_4",
                "inventoryItemId": "inv_paper_straw",
                "inventoryName": "Straw",
                "quantity": 1.000,
                "unit": "pc",
                "costPerUnit": 1.10,
                "cost": 1.10
            },
            {
                "id": "ri_m56b_5",
                "inventoryItemId": "inv_labour",
                "inventoryName": "Labour Cost",
                "quantity": 1.000,
                "unit": "unit",
                "costPerUnit": 3.20,
                "cost": 3.20
            }
        ]
    },
    {
        "id": "r_m55b",
        "menuItemId": "m55b",
        "menuItemName": "Peach Ice Tea (Large)",
        "name": "Peach 650ml",
        "description": "Standard recipe for Peach Ice Tea 650ml (Price ₹99/-)",
        "yieldQty": 1,
        "prepTime": 2,
        "rmCost": 34.80,
        "pmCost": 9.19,
        "labourCost": 3.20,
        "calculatedCost": 47.19,
        "sellingPrice": 99.00,
        "ingredients": [
            {
                "id": "ri_m55b_1",
                "inventoryItemId": "inv_peach",
                "inventoryName": "PEACH",
                "quantity": 0.060,
                "unit": "kg",
                "costPerUnit": 550.00,
                "cost": 33.00
            },
            {
                "id": "ri_m55b_2",
                "inventoryItemId": "inv_ice_cube",
                "inventoryName": "ICE CUBE",
                "quantity": 0.300,
                "unit": "kg",
                "costPerUnit": 6.00,
                "cost": 1.80
            },
            {
                "id": "ri_m55b_3",
                "inventoryItemId": "inv_bev_lid_650_icetea",
                "inventoryName": "Beverages with LID 650ml",
                "quantity": 1.000,
                "unit": "pc",
                "costPerUnit": 8.09,
                "cost": 8.09
            },
            {
                "id": "ri_m55b_4",
                "inventoryItemId": "inv_paper_straw",
                "inventoryName": "Straw",
                "quantity": 1.000,
                "unit": "pc",
                "costPerUnit": 1.10,
                "cost": 1.10
            },
            {
                "id": "ri_m55b_5",
                "inventoryItemId": "inv_labour",
                "inventoryName": "Labour Cost",
                "quantity": 1.000,
                "unit": "unit",
                "costPerUnit": 3.20,
                "cost": 3.20
            }
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
                for item in icetea_inventory:
                    inv_map[item['id']] = item
                data['inventory'] = list(inv_map.values())

                # Update recipes
                existing_recipes = data.get('recipes', [])
                recipe_map = {r.get('menuItemId', r.get('id')): r for r in existing_recipes}
                for r in icetea_recipes:
                    recipe_map[r['menuItemId']] = r
                data['recipes'] = list(recipe_map.values())

                with open(fpath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)
                print(f"Updated {fpath} successfully with Ice Tea recipes & inventory!")
        except Exception as e:
            print(f"Error updating {fpath}: {e}")
