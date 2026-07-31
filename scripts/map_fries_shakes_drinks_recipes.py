import json
import os

new_inventory = [
    { "id": "inv_potato", "name": "Potato Raw / Frozen Fries", "category": "Raw Material", "unit": "kg", "costPerUnit": 50.00, "currentStock": 200, "minimumStock": 20 },
    { "id": "inv_cajun_masala", "name": "Cajun / Kaju Masala", "category": "Raw Material", "unit": "kg", "costPerUnit": 600.00, "currentStock": 10, "minimumStock": 1 },
    { "id": "inv_fries_cup", "name": "Fries Cup 250ml", "category": "Packing Material", "unit": "pc", "costPerUnit": 6.55, "currentStock": 1000, "minimumStock": 100 },
    { "id": "inv_paper_bag", "name": "Paper Bag", "category": "Packing Material", "unit": "pc", "costPerUnit": 6.45, "currentStock": 1000, "minimumStock": 100 },
    { "id": "inv_vanilla_crush", "name": "Vanilla Crush / Premix", "category": "Raw Material", "unit": "kg", "costPerUnit": 270.00, "currentStock": 20, "minimumStock": 2 },
    { "id": "inv_strawberry_crush", "name": "Strawberry Crush", "category": "Raw Material", "unit": "kg", "costPerUnit": 280.00, "currentStock": 20, "minimumStock": 2 },
    { "id": "inv_biscoff_spread", "name": "Biscoff Spread", "category": "Raw Material", "unit": "kg", "costPerUnit": 750.00, "currentStock": 20, "minimumStock": 2 },
    { "id": "inv_chocolate_sauce", "name": "Dark Chocolate Sauce", "category": "Raw Material", "unit": "kg", "costPerUnit": 320.00, "currentStock": 20, "minimumStock": 2 },
    { "id": "inv_kunafa_pistachio", "name": "Kunafa Pistachio Paste", "category": "Raw Material", "unit": "kg", "costPerUnit": 950.00, "currentStock": 10, "minimumStock": 1 },
    { "id": "inv_pet_glass_350", "name": "PET Glass 350ml", "category": "Packing Material", "unit": "pc", "costPerUnit": 5.00, "currentStock": 1000, "minimumStock": 100 },
    { "id": "inv_pet_glass_500", "name": "PET Glass 500ml", "category": "Packing Material", "unit": "pc", "costPerUnit": 6.50, "currentStock": 1000, "minimumStock": 100 },
    { "id": "inv_paper_straw", "name": "Paper Straw", "category": "Packing Material", "unit": "pc", "costPerUnit": 0.70, "currentStock": 1000, "minimumStock": 100 },
    { "id": "inv_hot_choco_powder", "name": "Hot Chocolate Powder", "category": "Raw Material", "unit": "kg", "costPerUnit": 450.00, "currentStock": 20, "minimumStock": 2 },
    { "id": "inv_paper_cup_250", "name": "Paper Cup 250ml", "category": "Packing Material", "unit": "pc", "costPerUnit": 3.50, "currentStock": 1000, "minimumStock": 100 },
    { "id": "inv_softy_mix", "name": "Softy Liquid Mix", "category": "Raw Material", "unit": "L", "costPerUnit": 65.00, "currentStock": 50, "minimumStock": 5 },
    { "id": "inv_waffle_cone", "name": "Waffle Cone", "category": "Packing Material", "unit": "pc", "costPerUnit": 3.50, "currentStock": 500, "minimumStock": 50 },
    { "id": "inv_kombucha_base", "name": "Kombucha Fermented Base", "category": "Raw Material", "unit": "L", "costPerUnit": 120.00, "currentStock": 50, "minimumStock": 5 }
]

new_recipes = [
    # Salted Fries
    {
        "id": "r_m26a",
        "menuItemId": "m26a",
        "menuItemName": "Salted Fries",
        "name": "FRENCH FRIES",
        "description": "Standard recipe for Salted French Fries (Price ₹99/-)",
        "yieldQty": 1,
        "prepTime": 5,
        "rmCost": 15.37,
        "pmCost": 20.46,
        "labourCost": 7.42,
        "calculatedCost": 43.26,
        "sellingPrice": 99.00,
        "ingredients": [
            { "id": "ri_m26a_1", "inventoryItemId": "inv_potato", "inventoryName": "POTATO", "quantity": 0.250, "unit": "kg", "costPerUnit": 50.00, "cost": 12.50 },
            { "id": "ri_m26a_2", "inventoryItemId": "inv_refined_oil", "inventoryName": "REFINED OIL", "quantity": 0.015, "unit": "kg", "costPerUnit": 181.58, "cost": 2.72 },
            { "id": "ri_m26a_3", "inventoryItemId": "inv_salt", "inventoryName": "SALT", "quantity": 0.005, "unit": "kg", "costPerUnit": 30.00, "cost": 0.15 },
            { "id": "ri_m26a_4", "inventoryItemId": "inv_fries_cup", "inventoryName": "Fries Cup", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.82, "cost": 6.82 },
            { "id": "ri_m26a_5", "inventoryItemId": "inv_paper_bag", "inventoryName": "Paper Bags", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.45, "cost": 6.45 },
            { "id": "ri_m26a_6", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
            { "id": "ri_m26a_7", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take Away Bags", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
            { "id": "ri_m26a_8", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 7.42, "cost": 7.42 }
        ]
    },
    # Peri Peri Fries
    {
        "id": "r_m26b",
        "menuItemId": "m26b",
        "menuItemName": "Peri Peri Fries",
        "name": "PERI PERI FRIES",
        "description": "Standard recipe for Peri Peri Fries (Price ₹99/-)",
        "yieldQty": 1,
        "prepTime": 5,
        "rmCost": 19.92,
        "pmCost": 20.19,
        "labourCost": 7.42,
        "calculatedCost": 47.53,
        "sellingPrice": 99.00,
        "ingredients": [
            { "id": "ri_m26b_1", "inventoryItemId": "inv_potato", "inventoryName": "POTATO", "quantity": 0.250, "unit": "kg", "costPerUnit": 50.00, "cost": 12.50 },
            { "id": "ri_m26b_2", "inventoryItemId": "inv_refined_oil", "inventoryName": "REFINED OIL", "quantity": 0.015, "unit": "kg", "costPerUnit": 181.58, "cost": 2.72 },
            { "id": "ri_m26b_3", "inventoryItemId": "inv_peri_peri_sauce", "inventoryName": "PERI PERI MASALA", "quantity": 0.008, "unit": "kg", "costPerUnit": 586.70, "cost": 4.69 },
            { "id": "ri_m26b_4", "inventoryItemId": "inv_fries_cup", "inventoryName": "250ml Cup", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.55, "cost": 6.55 },
            { "id": "ri_m26b_5", "inventoryItemId": "inv_paper_bag", "inventoryName": "Paper Bags", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.45, "cost": 6.45 },
            { "id": "ri_m26b_6", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
            { "id": "ri_m26b_7", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take Away Bags", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
            { "id": "ri_m26b_8", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 7.42, "cost": 7.42 }
        ]
    },
    # Cajun Fries
    {
        "id": "r_m26c",
        "menuItemId": "m26c",
        "menuItemName": "Cajun Fries",
        "name": "KAJU FRIES",
        "description": "Standard recipe for Cajun Fries (Price ₹99/-)",
        "yieldQty": 1,
        "prepTime": 5,
        "rmCost": 20.02,
        "pmCost": 20.19,
        "labourCost": 7.42,
        "calculatedCost": 47.64,
        "sellingPrice": 99.00,
        "ingredients": [
            { "id": "ri_m26c_1", "inventoryItemId": "inv_potato", "inventoryName": "POTATO", "quantity": 0.250, "unit": "kg", "costPerUnit": 50.00, "cost": 12.50 },
            { "id": "ri_m26c_2", "inventoryItemId": "inv_refined_oil", "inventoryName": "REFINED OIL", "quantity": 0.015, "unit": "kg", "costPerUnit": 181.58, "cost": 2.72 },
            { "id": "ri_m26c_3", "inventoryItemId": "inv_cajun_masala", "inventoryName": "KAJU MASALA", "quantity": 0.008, "unit": "kg", "costPerUnit": 600.00, "cost": 4.80 },
            { "id": "ri_m26c_4", "inventoryItemId": "inv_fries_cup", "inventoryName": "250ml Cup", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.55, "cost": 6.55 },
            { "id": "ri_m26c_5", "inventoryItemId": "inv_paper_bag", "inventoryName": "Paper Bags", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.45, "cost": 6.45 },
            { "id": "ri_m26c_6", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
            { "id": "ri_m26c_7", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take Away Bags", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
            { "id": "ri_m26c_8", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 7.42, "cost": 7.42 }
        ]
    },

    # Vanilla Shake (Regular)
    {
        "id": "r_m42",
        "menuItemId": "m42",
        "menuItemName": "Vanilla Shake (Regular)",
        "name": "VANILLA SHAKE REGULAR",
        "description": "Standard recipe for Vanilla Shake Regular (Price ₹120/-)",
        "yieldQty": 1,
        "prepTime": 5,
        "rmCost": 24.50,
        "pmCost": 5.70,
        "labourCost": 11.87,
        "calculatedCost": 42.07,
        "sellingPrice": 120.00,
        "ingredients": [
            { "id": "ri_m42_1", "inventoryItemId": "inv_fresh_milk", "inventoryName": "Milk Base", "quantity": 0.250, "unit": "L", "costPerUnit": 65.60, "cost": 16.40 },
            { "id": "ri_m42_2", "inventoryItemId": "inv_vanilla_crush", "inventoryName": "Vanilla Crush", "quantity": 0.030, "unit": "kg", "costPerUnit": 270.00, "cost": 8.10 },
            { "id": "ri_m42_3", "inventoryItemId": "inv_pet_glass_350", "inventoryName": "PET Glass 350ml", "quantity": 1.000, "unit": "pc", "costPerUnit": 5.00, "cost": 5.00 },
            { "id": "ri_m42_4", "inventoryItemId": "inv_paper_straw", "inventoryName": "Paper Straw", "quantity": 1.000, "unit": "pc", "costPerUnit": 0.70, "cost": 0.70 },
            { "id": "ri_m42_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 11.87, "cost": 11.87 }
        ]
    },
    # Vanilla Shake (Large)
    {
        "id": "r_m43",
        "menuItemId": "m43",
        "menuItemName": "Vanilla Shake (Large)",
        "name": "VANILLA SHAKE LARGE",
        "description": "Standard recipe for Vanilla Shake Large (Price ₹199/-)",
        "yieldQty": 1,
        "prepTime": 5,
        "rmCost": 39.74,
        "pmCost": 7.20,
        "labourCost": 11.87,
        "calculatedCost": 58.81,
        "sellingPrice": 199.00,
        "ingredients": [
            { "id": "ri_m43_1", "inventoryItemId": "inv_fresh_milk", "inventoryName": "Milk Base", "quantity": 0.400, "unit": "L", "costPerUnit": 65.60, "cost": 26.24 },
            { "id": "ri_m43_2", "inventoryItemId": "inv_vanilla_crush", "inventoryName": "Vanilla Crush", "quantity": 0.050, "unit": "kg", "costPerUnit": 270.00, "cost": 13.50 },
            { "id": "ri_m43_3", "inventoryItemId": "inv_pet_glass_500", "inventoryName": "PET Glass 500ml", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.50, "cost": 6.50 },
            { "id": "ri_m43_4", "inventoryItemId": "inv_paper_straw", "inventoryName": "Paper Straw", "quantity": 1.000, "unit": "pc", "costPerUnit": 0.70, "cost": 0.70 },
            { "id": "ri_m43_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 11.87, "cost": 11.87 }
        ]
    },
    # Strawberry Shake (Regular)
    {
        "id": "r_m44",
        "menuItemId": "m44",
        "menuItemName": "Strawberry Shake (Regular)",
        "name": "STRAWBERRY SHAKE REGULAR",
        "description": "Standard recipe for Strawberry Shake Regular (Price ₹120/-)",
        "yieldQty": 1,
        "prepTime": 5,
        "rmCost": 24.80,
        "pmCost": 5.70,
        "labourCost": 11.87,
        "calculatedCost": 42.37,
        "sellingPrice": 120.00,
        "ingredients": [
            { "id": "ri_m44_1", "inventoryItemId": "inv_fresh_milk", "inventoryName": "Milk Base", "quantity": 0.250, "unit": "L", "costPerUnit": 65.60, "cost": 16.40 },
            { "id": "ri_m44_2", "inventoryItemId": "inv_strawberry_crush", "inventoryName": "Strawberry Crush", "quantity": 0.030, "unit": "kg", "costPerUnit": 280.00, "cost": 8.40 },
            { "id": "ri_m44_3", "inventoryItemId": "inv_pet_glass_350", "inventoryName": "PET Glass 350ml", "quantity": 1.000, "unit": "pc", "costPerUnit": 5.00, "cost": 5.00 },
            { "id": "ri_m44_4", "inventoryItemId": "inv_paper_straw", "inventoryName": "Paper Straw", "quantity": 1.000, "unit": "pc", "costPerUnit": 0.70, "cost": 0.70 },
            { "id": "ri_m44_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 11.87, "cost": 11.87 }
        ]
    },
    # Strawberry Shake (Large)
    {
        "id": "r_m45",
        "menuItemId": "m45",
        "menuItemName": "Strawberry Shake (Large)",
        "name": "STRAWBERRY SHAKE LARGE",
        "description": "Standard recipe for Strawberry Shake Large (Price ₹199/-)",
        "yieldQty": 1,
        "prepTime": 5,
        "rmCost": 40.24,
        "pmCost": 7.20,
        "labourCost": 11.87,
        "calculatedCost": 59.31,
        "sellingPrice": 199.00,
        "ingredients": [
            { "id": "ri_m45_1", "inventoryItemId": "inv_fresh_milk", "inventoryName": "Milk Base", "quantity": 0.400, "unit": "L", "costPerUnit": 65.60, "cost": 26.24 },
            { "id": "ri_m45_2", "inventoryItemId": "inv_strawberry_crush", "inventoryName": "Strawberry Crush", "quantity": 0.050, "unit": "kg", "costPerUnit": 280.00, "cost": 14.00 },
            { "id": "ri_m45_3", "inventoryItemId": "inv_pet_glass_500", "inventoryName": "PET Glass 500ml", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.50, "cost": 6.50 },
            { "id": "ri_m45_4", "inventoryItemId": "inv_paper_straw", "inventoryName": "Paper Straw", "quantity": 1.000, "unit": "pc", "costPerUnit": 0.70, "cost": 0.70 },
            { "id": "ri_m45_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 11.87, "cost": 11.87 }
        ]
    },
    # Biscoff Shake (Regular)
    {
        "id": "r_m46",
        "menuItemId": "m46",
        "menuItemName": "Biscoff Shake (Regular)",
        "name": "BISCOFF SHAKE REGULAR",
        "description": "Standard recipe for Biscoff Shake Regular (Price ₹120/-)",
        "yieldQty": 1,
        "prepTime": 5,
        "rmCost": 38.90,
        "pmCost": 5.70,
        "labourCost": 11.87,
        "calculatedCost": 56.47,
        "sellingPrice": 120.00,
        "ingredients": [
            { "id": "ri_m46_1", "inventoryItemId": "inv_fresh_milk", "inventoryName": "Milk Base", "quantity": 0.250, "unit": "L", "costPerUnit": 65.60, "cost": 16.40 },
            { "id": "ri_m46_2", "inventoryItemId": "inv_biscoff_spread", "inventoryName": "Biscoff Spread", "quantity": 0.030, "unit": "kg", "costPerUnit": 750.00, "cost": 22.50 },
            { "id": "ri_m46_3", "inventoryItemId": "inv_pet_glass_350", "inventoryName": "PET Glass 350ml", "quantity": 1.000, "unit": "pc", "costPerUnit": 5.00, "cost": 5.00 },
            { "id": "ri_m46_4", "inventoryItemId": "inv_paper_straw", "inventoryName": "Paper Straw", "quantity": 1.000, "unit": "pc", "costPerUnit": 0.70, "cost": 0.70 },
            { "id": "ri_m46_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 11.87, "cost": 11.87 }
        ]
    },
    # Biscoff Shake (Large)
    {
        "id": "r_m47",
        "menuItemId": "m47",
        "menuItemName": "Biscoff Shake (Large)",
        "name": "BISCOFF SHAKE LARGE",
        "description": "Standard recipe for Biscoff Shake Large (Price ₹199/-)",
        "yieldQty": 1,
        "prepTime": 5,
        "rmCost": 63.74,
        "pmCost": 7.20,
        "labourCost": 11.87,
        "calculatedCost": 82.81,
        "sellingPrice": 199.00,
        "ingredients": [
            { "id": "ri_m47_1", "inventoryItemId": "inv_fresh_milk", "inventoryName": "Milk Base", "quantity": 0.400, "unit": "L", "costPerUnit": 65.60, "cost": 26.24 },
            { "id": "ri_m47_2", "inventoryItemId": "inv_biscoff_spread", "inventoryName": "Biscoff Spread", "quantity": 0.050, "unit": "kg", "costPerUnit": 750.00, "cost": 37.50 },
            { "id": "ri_m47_3", "inventoryItemId": "inv_pet_glass_500", "inventoryName": "PET Glass 500ml", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.50, "cost": 6.50 },
            { "id": "ri_m47_4", "inventoryItemId": "inv_paper_straw", "inventoryName": "Paper Straw", "quantity": 1.000, "unit": "pc", "costPerUnit": 0.70, "cost": 0.70 },
            { "id": "ri_m47_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 11.87, "cost": 11.87 }
        ]
    },
    # Chocolate Shake (Regular)
    {
        "id": "r_m48",
        "menuItemId": "m48",
        "menuItemName": "Chocolate Shake (Regular)",
        "name": "CHOCOLATE SHAKE REGULAR",
        "description": "Standard recipe for Chocolate Shake Regular (Price ₹120/-)",
        "yieldQty": 1,
        "prepTime": 5,
        "rmCost": 26.00,
        "pmCost": 5.70,
        "labourCost": 11.87,
        "calculatedCost": 43.57,
        "sellingPrice": 120.00,
        "ingredients": [
            { "id": "ri_m48_1", "inventoryItemId": "inv_fresh_milk", "inventoryName": "Milk Base", "quantity": 0.250, "unit": "L", "costPerUnit": 65.60, "cost": 16.40 },
            { "id": "ri_m48_2", "inventoryItemId": "inv_chocolate_sauce", "inventoryName": "Dark Chocolate Sauce", "quantity": 0.030, "unit": "kg", "costPerUnit": 320.00, "cost": 9.60 },
            { "id": "ri_m48_3", "inventoryItemId": "inv_pet_glass_350", "inventoryName": "PET Glass 350ml", "quantity": 1.000, "unit": "pc", "costPerUnit": 5.00, "cost": 5.00 },
            { "id": "ri_m48_4", "inventoryItemId": "inv_paper_straw", "inventoryName": "Paper Straw", "quantity": 1.000, "unit": "pc", "costPerUnit": 0.70, "cost": 0.70 },
            { "id": "ri_m48_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 11.87, "cost": 11.87 }
        ]
    },
    # Chocolate Shake (Large)
    {
        "id": "r_m49",
        "menuItemId": "m49",
        "menuItemName": "Chocolate Shake (Large)",
        "name": "CHOCOLATE SHAKE LARGE",
        "description": "Standard recipe for Chocolate Shake Large (Price ₹199/-)",
        "yieldQty": 1,
        "prepTime": 5,
        "rmCost": 42.24,
        "pmCost": 7.20,
        "labourCost": 11.87,
        "calculatedCost": 61.31,
        "sellingPrice": 199.00,
        "ingredients": [
            { "id": "ri_m49_1", "inventoryItemId": "inv_fresh_milk", "inventoryName": "Milk Base", "quantity": 0.400, "unit": "L", "costPerUnit": 65.60, "cost": 26.24 },
            { "id": "ri_m49_2", "inventoryItemId": "inv_chocolate_sauce", "inventoryName": "Dark Chocolate Sauce", "quantity": 0.050, "unit": "kg", "costPerUnit": 320.00, "cost": 16.00 },
            { "id": "ri_m49_3", "inventoryItemId": "inv_pet_glass_500", "inventoryName": "PET Glass 500ml", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.50, "cost": 6.50 },
            { "id": "ri_m49_4", "inventoryItemId": "inv_paper_straw", "inventoryName": "Paper Straw", "quantity": 1.000, "unit": "pc", "costPerUnit": 0.70, "cost": 0.70 },
            { "id": "ri_m49_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 11.87, "cost": 11.87 }
        ]
    },
    # Kunafa Pistachio Shake (Regular)
    {
        "id": "r_m50",
        "menuItemId": "m50",
        "menuItemName": "Kunafa Pistachio Shake (Regular)",
        "name": "KUNAFA PISTACHIO SHAKE REGULAR",
        "description": "Standard recipe for Kunafa Pistachio Shake Regular (Price ₹120/-)",
        "yieldQty": 1,
        "prepTime": 5,
        "rmCost": 44.90,
        "pmCost": 5.70,
        "labourCost": 11.87,
        "calculatedCost": 62.47,
        "sellingPrice": 120.00,
        "ingredients": [
            { "id": "ri_m50_1", "inventoryItemId": "inv_fresh_milk", "inventoryName": "Milk Base", "quantity": 0.250, "unit": "L", "costPerUnit": 65.60, "cost": 16.40 },
            { "id": "ri_m50_2", "inventoryItemId": "inv_kunafa_pistachio", "inventoryName": "Kunafa Pistachio Paste", "quantity": 0.030, "unit": "kg", "costPerUnit": 950.00, "cost": 28.50 },
            { "id": "ri_m50_3", "inventoryItemId": "inv_pet_glass_350", "inventoryName": "PET Glass 350ml", "quantity": 1.000, "unit": "pc", "costPerUnit": 5.00, "cost": 5.00 },
            { "id": "ri_m50_4", "inventoryItemId": "inv_paper_straw", "inventoryName": "Paper Straw", "quantity": 1.000, "unit": "pc", "costPerUnit": 0.70, "cost": 0.70 },
            { "id": "ri_m50_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 11.87, "cost": 11.87 }
        ]
    },
    # Kunafa Pistachio Shake (Large)
    {
        "id": "r_m51",
        "menuItemId": "m51",
        "menuItemName": "Kunafa Pistachio Shake (Large)",
        "name": "KUNAFA PISTACHIO SHAKE LARGE",
        "description": "Standard recipe for Kunafa Pistachio Shake Large (Price ₹199/-)",
        "yieldQty": 1,
        "prepTime": 5,
        "rmCost": 73.74,
        "pmCost": 7.20,
        "labourCost": 11.87,
        "calculatedCost": 92.81,
        "sellingPrice": 199.00,
        "ingredients": [
            { "id": "ri_m51_1", "inventoryItemId": "inv_fresh_milk", "inventoryName": "Milk Base", "quantity": 0.400, "unit": "L", "costPerUnit": 65.60, "cost": 26.24 },
            { "id": "ri_m51_2", "inventoryItemId": "inv_kunafa_pistachio", "inventoryName": "Kunafa Pistachio Paste", "quantity": 0.050, "unit": "kg", "costPerUnit": 950.00, "cost": 47.50 },
            { "id": "ri_m51_3", "inventoryItemId": "inv_pet_glass_500", "inventoryName": "PET Glass 500ml", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.50, "cost": 6.50 },
            { "id": "ri_m51_4", "inventoryItemId": "inv_paper_straw", "inventoryName": "Paper Straw", "quantity": 1.000, "unit": "pc", "costPerUnit": 0.70, "cost": 0.70 },
            { "id": "ri_m51_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 11.87, "cost": 11.87 }
        ]
    },
    # Vanilla Softy
    {
        "id": "r_m52",
        "menuItemId": "m52",
        "menuItemName": "Vanilla Softy",
        "name": "VANILLA SOFTY",
        "description": "Standard recipe for Vanilla Softy Cone (Price ₹39/-)",
        "yieldQty": 1,
        "prepTime": 2,
        "rmCost": 6.50,
        "pmCost": 3.77,
        "labourCost": 3.50,
        "calculatedCost": 13.77,
        "sellingPrice": 39.00,
        "ingredients": [
            { "id": "ri_m52_1", "inventoryItemId": "inv_softy_mix", "inventoryName": "Softy Liquid Mix", "quantity": 0.100, "unit": "L", "costPerUnit": 65.00, "cost": 6.50 },
            { "id": "ri_m52_2", "inventoryItemId": "inv_waffle_cone", "inventoryName": "Waffle Cone", "quantity": 1.000, "unit": "pc", "costPerUnit": 3.50, "cost": 3.50 },
            { "id": "ri_m52_3", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue Paper", "quantity": 1.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.27 },
            { "id": "ri_m52_4", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.50, "cost": 3.50 }
        ]
    },
    # Hot Chocolate
    {
        "id": "r_m57",
        "menuItemId": "m57",
        "menuItemName": "Hot Chocolate",
        "name": "HOT CHOCOLATE",
        "description": "Standard recipe for Hot Chocolate (Price ₹99/-)",
        "yieldQty": 1,
        "prepTime": 5,
        "rmCost": 21.97,
        "pmCost": 4.04,
        "labourCost": 7.42,
        "calculatedCost": 33.43,
        "sellingPrice": 99.00,
        "ingredients": [
            { "id": "ri_m57_1", "inventoryItemId": "inv_fresh_milk", "inventoryName": "Fresh Milk", "quantity": 0.200, "unit": "L", "costPerUnit": 53.60, "cost": 10.72 },
            { "id": "ri_m57_2", "inventoryItemId": "inv_hot_choco_powder", "inventoryName": "Hot Chocolate Powder", "quantity": 0.025, "unit": "kg", "costPerUnit": 450.00, "cost": 11.25 },
            { "id": "ri_m57_3", "inventoryItemId": "inv_paper_cup_250", "inventoryName": "Paper Cup 250ml", "quantity": 1.000, "unit": "pc", "costPerUnit": 3.50, "cost": 3.50 },
            { "id": "ri_m57_4", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue Paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
            { "id": "ri_m57_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 7.42, "cost": 7.42 }
        ]
    },
    # Signature Tea
    {
        "id": "r_m58",
        "menuItemId": "m58",
        "menuItemName": "Signature Tea",
        "name": "SIGNATURE TEA",
        "description": "Standard recipe for Signature Tea (Price ₹99/-)",
        "yieldQty": 1,
        "prepTime": 5,
        "rmCost": 15.00,
        "pmCost": 4.04,
        "labourCost": 5.96,
        "calculatedCost": 25.00,
        "sellingPrice": 99.00,
        "ingredients": [
            { "id": "ri_m58_1", "inventoryItemId": "inv_fresh_milk", "inventoryName": "Fresh Milk", "quantity": 0.150, "unit": "L", "costPerUnit": 53.60, "cost": 8.04 },
            { "id": "ri_m58_2", "inventoryItemId": "inv_black_tea", "inventoryName": "Tea Powder / Spices", "quantity": 0.010, "unit": "kg", "costPerUnit": 696.00, "cost": 6.96 },
            { "id": "ri_m58_3", "inventoryItemId": "inv_paper_cup_250", "inventoryName": "Paper Cup 250ml", "quantity": 1.000, "unit": "pc", "costPerUnit": 3.50, "cost": 3.50 },
            { "id": "ri_m58_4", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue Paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
            { "id": "ri_m58_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 5.96, "cost": 5.96 }
        ]
    },

    # Kombuchas
    {
        "id": "r_m59a",
        "menuItemId": "m59a",
        "menuItemName": "Mint Kombucha",
        "name": "MINT KOMBUCHA",
        "description": "Standard recipe for Mint Kombucha (Price ₹114.29/-)",
        "yieldQty": 1,
        "prepTime": 3,
        "rmCost": 32.50,
        "pmCost": 7.50,
        "labourCost": 5.00,
        "calculatedCost": 45.00,
        "sellingPrice": 114.29,
        "ingredients": [
            { "id": "ri_m59a_1", "inventoryItemId": "inv_kombucha_base", "inventoryName": "Kombucha Fermented Base", "quantity": 0.250, "unit": "L", "costPerUnit": 120.00, "cost": 30.00 },
            { "id": "ri_m59a_2", "inventoryItemId": "inv_water", "inventoryName": "Mint Extract", "quantity": 0.020, "unit": "kg", "costPerUnit": 125.00, "cost": 2.50 },
            { "id": "ri_m59a_3", "inventoryItemId": "inv_pet_glass_350", "inventoryName": "Glass / Cup Packaging", "quantity": 1.000, "unit": "pc", "costPerUnit": 7.50, "cost": 7.50 },
            { "id": "ri_m59a_4", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 5.00, "cost": 5.00 }
        ]
    },
    {
        "id": "r_m59b",
        "menuItemId": "m59b",
        "menuItemName": "Hibiscus Kombucha",
        "name": "HIBISCUS KOMBUCHA",
        "description": "Standard recipe for Hibiscus Kombucha (Price ₹114.29/-)",
        "yieldQty": 1,
        "prepTime": 3,
        "rmCost": 32.50,
        "pmCost": 7.50,
        "labourCost": 5.00,
        "calculatedCost": 45.00,
        "sellingPrice": 114.29,
        "ingredients": [
            { "id": "ri_m59b_1", "inventoryItemId": "inv_kombucha_base", "inventoryName": "Kombucha Fermented Base", "quantity": 0.250, "unit": "L", "costPerUnit": 120.00, "cost": 30.00 },
            { "id": "ri_m59b_2", "inventoryItemId": "inv_water", "inventoryName": "Hibiscus Extract", "quantity": 0.020, "unit": "kg", "costPerUnit": 125.00, "cost": 2.50 },
            { "id": "ri_m59b_3", "inventoryItemId": "inv_pet_glass_350", "inventoryName": "Glass / Cup Packaging", "quantity": 1.000, "unit": "pc", "costPerUnit": 7.50, "cost": 7.50 },
            { "id": "ri_m59b_4", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 5.00, "cost": 5.00 }
        ]
    },
    {
        "id": "r_m59c",
        "menuItemId": "m59c",
        "menuItemName": "Ginger Kombucha",
        "name": "GINGER KOMBUCHA",
        "description": "Standard recipe for Ginger Kombucha (Price ₹114.29/-)",
        "yieldQty": 1,
        "prepTime": 3,
        "rmCost": 32.50,
        "pmCost": 7.50,
        "labourCost": 5.00,
        "calculatedCost": 45.00,
        "sellingPrice": 114.29,
        "ingredients": [
            { "id": "ri_m59c_1", "inventoryItemId": "inv_kombucha_base", "inventoryName": "Kombucha Fermented Base", "quantity": 0.250, "unit": "L", "costPerUnit": 120.00, "cost": 30.00 },
            { "id": "ri_m59c_2", "inventoryItemId": "inv_water", "inventoryName": "Ginger Extract", "quantity": 0.020, "unit": "kg", "costPerUnit": 125.00, "cost": 2.50 },
            { "id": "ri_m59c_3", "inventoryItemId": "inv_pet_glass_350", "inventoryName": "Glass / Cup Packaging", "quantity": 1.000, "unit": "pc", "costPerUnit": 7.50, "cost": 7.50 },
            { "id": "ri_m59c_4", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 5.00, "cost": 5.00 }
        ]
    },
    {
        "id": "r_m59d",
        "menuItemId": "m59d",
        "menuItemName": "Butterfly Pea Kombucha",
        "name": "BUTTERFLY PEA KOMBUCHA",
        "description": "Standard recipe for Butterfly Pea Kombucha (Price ₹114.29/-)",
        "yieldQty": 1,
        "prepTime": 3,
        "rmCost": 32.50,
        "pmCost": 7.50,
        "labourCost": 5.00,
        "calculatedCost": 45.00,
        "sellingPrice": 114.29,
        "ingredients": [
            { "id": "ri_m59d_1", "inventoryItemId": "inv_kombucha_base", "inventoryName": "Kombucha Fermented Base", "quantity": 0.250, "unit": "L", "costPerUnit": 120.00, "cost": 30.00 },
            { "id": "ri_m59d_2", "inventoryItemId": "inv_water", "inventoryName": "Butterfly Pea Flower Extract", "quantity": 0.020, "unit": "kg", "costPerUnit": 125.00, "cost": 2.50 },
            { "id": "ri_m59d_3", "inventoryItemId": "inv_pet_glass_350", "inventoryName": "Glass / Cup Packaging", "quantity": 1.000, "unit": "pc", "costPerUnit": 7.50, "cost": 7.50 },
            { "id": "ri_m59d_4", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 5.00, "cost": 5.00 }
        ]
    }
]

files_to_update = [
    'server/db.json',
    'server/seed-db.json',
    'server/menu_backup_LOCK.json',
    'server/sales_vault_LOCK.json',
    'deploy-hostinger/server/db.json',
    'deploy-hostinger/server/seed-db.json'
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
                for item in new_inventory:
                    inv_map[item['id']] = item
                data['inventory'] = list(inv_map.values())

                # Update recipes
                existing_recipes = data.get('recipes', [])
                recipe_map = {r.get('menuItemId', r.get('id')): r for r in existing_recipes}
                for r in new_recipes:
                    recipe_map[r['menuItemId']] = r
                data['recipes'] = list(recipe_map.values())

                with open(fpath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)
                print(f"Updated {fpath} successfully with Fries, Shakes & Drinks recipes!")
        except Exception as e:
            print(f"Error updating {fpath}: {e}")
