import json
import os

beverage_inventory = [
    {
        "id": "inv_cola",
        "name": "COLA",
        "category": "Raw Material",
        "unit": "kg",
        "costPerUnit": 24.00,
        "currentStock": 500,
        "minimumStock": 50
    },
    {
        "id": "inv_sprite",
        "name": "SPRITE",
        "category": "Raw Material",
        "unit": "kg",
        "costPerUnit": 24.00,
        "currentStock": 500,
        "minimumStock": 50
    },
    {
        "id": "inv_ice_cube",
        "name": "ICE CUBE",
        "category": "Raw Material",
        "unit": "kg",
        "costPerUnit": 6.00,
        "currentStock": 200,
        "minimumStock": 20
    },
    {
        "id": "inv_bev_lid_330",
        "name": "BEVERAGES WITH LID 330ML",
        "category": "Packing Material",
        "unit": "pc",
        "costPerUnit": 5.49,
        "currentStock": 1000,
        "minimumStock": 100
    },
    {
        "id": "inv_bev_lid_650",
        "name": "BEVERAGES WITH LID 650ML",
        "category": "Packing Material",
        "unit": "pc",
        "costPerUnit": 6.85,
        "currentStock": 1000,
        "minimumStock": 100
    },
    {
        "id": "inv_straw",
        "name": "Straw",
        "category": "Packing Material",
        "unit": "pc",
        "costPerUnit": 0.93,
        "currentStock": 2000,
        "minimumStock": 200
    },
    {
        "id": "inv_labour",
        "name": "Labour Cost",
        "category": "Overhead",
        "unit": "unit",
        "costPerUnit": 3.20,
        "currentStock": 9999,
        "minimumStock": 0
    }
]

beverage_recipes = [
    {
        "id": "r_m53a",
        "menuItemId": "m53a",
        "menuItemName": "Coca-Cola (Regular)",
        "name": "COLA 330ML",
        "description": "Standard recipe for COLA 330ML (Price ₹59/-)",
        "yieldQty": 1,
        "prepTime": 2,
        "rmCost": 24.36,
        "pmCost": 6.42,
        "labourCost": 3.20,
        "calculatedCost": 33.98,
        "sellingPrice": 59.00,
        "ingredients": [
            {
                "id": "ri_m53a_1",
                "inventoryItemId": "inv_cola",
                "inventoryName": "COLA",
                "quantity": 1.000,
                "unit": "kg",
                "costPerUnit": 24.00,
                "cost": 24.00
            },
            {
                "id": "ri_m53a_2",
                "inventoryItemId": "inv_ice_cube",
                "inventoryName": "ICE CUBE",
                "quantity": 0.060,
                "unit": "kg",
                "costPerUnit": 6.00,
                "cost": 0.36
            },
            {
                "id": "ri_m53a_3",
                "inventoryItemId": "inv_bev_lid_330",
                "inventoryName": "BEVERAGES WITH LID 330ML",
                "quantity": 1.000,
                "unit": "pc",
                "costPerUnit": 5.49,
                "cost": 5.49
            },
            {
                "id": "ri_m53a_4",
                "inventoryItemId": "inv_straw",
                "inventoryName": "Straw",
                "quantity": 1.000,
                "unit": "pc",
                "costPerUnit": 0.93,
                "cost": 0.93
            },
            {
                "id": "ri_m53a_5",
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
        "id": "r_m54a",
        "menuItemId": "m54a",
        "menuItemName": "Sprite (Regular)",
        "name": "SPRITE 330ML",
        "description": "Standard recipe for SPRITE 330ML (Price ₹59/-)",
        "yieldQty": 1,
        "prepTime": 2,
        "rmCost": 24.36,
        "pmCost": 6.42,
        "labourCost": 3.20,
        "calculatedCost": 33.98,
        "sellingPrice": 59.00,
        "ingredients": [
            {
                "id": "ri_m54a_1",
                "inventoryItemId": "inv_sprite",
                "inventoryName": "SPRITE",
                "quantity": 1.000,
                "unit": "kg",
                "costPerUnit": 24.00,
                "cost": 24.00
            },
            {
                "id": "ri_m54a_2",
                "inventoryItemId": "inv_ice_cube",
                "inventoryName": "ICE CUBE",
                "quantity": 0.060,
                "unit": "kg",
                "costPerUnit": 6.00,
                "cost": 0.36
            },
            {
                "id": "ri_m54a_3",
                "inventoryItemId": "inv_bev_lid_330",
                "inventoryName": "BEVERAGES WITH LID 330ML",
                "quantity": 1.000,
                "unit": "pc",
                "costPerUnit": 5.49,
                "cost": 5.49
            },
            {
                "id": "ri_m54a_4",
                "inventoryItemId": "inv_straw",
                "inventoryName": "Straw",
                "quantity": 1.000,
                "unit": "pc",
                "costPerUnit": 0.93,
                "cost": 0.93
            },
            {
                "id": "ri_m54a_5",
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
        "id": "r_m53b",
        "menuItemId": "m53b",
        "menuItemName": "Coca-Cola (Large)",
        "name": "COLA 650ML",
        "description": "Standard recipe for COLA 650ML (Price ₹99/-)",
        "yieldQty": 1,
        "prepTime": 2,
        "rmCost": 48.72,
        "pmCost": 7.78,
        "labourCost": 3.20,
        "calculatedCost": 59.70,
        "sellingPrice": 99.00,
        "ingredients": [
            {
                "id": "ri_m53b_1",
                "inventoryItemId": "inv_cola",
                "inventoryName": "COLA",
                "quantity": 2.000,
                "unit": "kg",
                "costPerUnit": 24.00,
                "cost": 48.00
            },
            {
                "id": "ri_m53b_2",
                "inventoryItemId": "inv_ice_cube",
                "inventoryName": "ICE CUBE",
                "quantity": 0.120,
                "unit": "kg",
                "costPerUnit": 6.00,
                "cost": 0.72
            },
            {
                "id": "ri_m53b_3",
                "inventoryItemId": "inv_bev_lid_650",
                "inventoryName": "BEVERAGES WITH LID 650ML",
                "quantity": 1.000,
                "unit": "pc",
                "costPerUnit": 6.85,
                "cost": 6.85
            },
            {
                "id": "ri_m53b_4",
                "inventoryItemId": "inv_straw",
                "inventoryName": "Straw",
                "quantity": 1.000,
                "unit": "pc",
                "costPerUnit": 0.93,
                "cost": 0.93
            },
            {
                "id": "ri_m53b_5",
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
        "id": "r_m54b",
        "menuItemId": "m54b",
        "menuItemName": "Sprite (Large)",
        "name": "SPRITE 650ML",
        "description": "Standard recipe for SPRITE 650ML (Price ₹99/-)",
        "yieldQty": 1,
        "prepTime": 2,
        "rmCost": 48.72,
        "pmCost": 7.78,
        "labourCost": 3.20,
        "calculatedCost": 59.70,
        "sellingPrice": 99.00,
        "ingredients": [
            {
                "id": "ri_m54b_1",
                "inventoryItemId": "inv_sprite",
                "inventoryName": "SPRITE",
                "quantity": 2.000,
                "unit": "kg",
                "costPerUnit": 24.00,
                "cost": 48.00
            },
            {
                "id": "ri_m54b_2",
                "inventoryItemId": "inv_ice_cube",
                "inventoryName": "ICE CUBE",
                "quantity": 0.120,
                "unit": "kg",
                "costPerUnit": 6.00,
                "cost": 0.72
            },
            {
                "id": "ri_m54b_3",
                "inventoryItemId": "inv_bev_lid_650",
                "inventoryName": "BEVERAGES WITH LID 650ML",
                "quantity": 1.000,
                "unit": "pc",
                "costPerUnit": 6.85,
                "cost": 6.85
            },
            {
                "id": "ri_m54b_4",
                "inventoryItemId": "inv_straw",
                "inventoryName": "Straw",
                "quantity": 1.000,
                "unit": "pc",
                "costPerUnit": 0.93,
                "cost": 0.93
            },
            {
                "id": "ri_m54b_5",
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
                for item in beverage_inventory:
                    inv_map[item['id']] = item
                data['inventory'] = list(inv_map.values())

                # Update recipes
                existing_recipes = data.get('recipes', [])
                recipe_map = {r.get('menuItemId', r.get('id')): r for r in existing_recipes}
                for r in beverage_recipes:
                    recipe_map[r['menuItemId']] = r
                data['recipes'] = list(recipe_map.values())

                with open(fpath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)
                print(f"Updated {fpath} successfully with beverage recipes & inventory!")
        except Exception as e:
            print(f"Error updating {fpath}: {e}")
