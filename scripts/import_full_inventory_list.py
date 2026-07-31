import json
import os

inventory_updates = [
    # Beverages
    { "name": "Ginger Kombucha 350ml", "category": "Beverages", "unit": "pc", "costPerUnit": 70.80, "currentStock": 45 },
    { "name": "Hibiscus Kombucha 350ml", "category": "Beverages", "unit": "pc", "costPerUnit": 70.80, "currentStock": 35 },
    { "name": "Mint Kombucha 350ml", "category": "Beverages", "unit": "pc", "costPerUnit": 70.80, "currentStock": 40 },

    # Meats
    { "name": "Boneless Chicken", "category": "Meats", "unit": "kg", "costPerUnit": 236.41, "currentStock": 324.655 },

    # Packing Materials
    { "name": "Aluminium Roll", "category": "Packing Material", "unit": "kg", "costPerUnit": 472.89, "currentStock": 5.00 },
    { "name": "Beverages 350ml with Lid", "category": "Packing Material", "unit": "pc", "costPerUnit": 5.40, "currentStock": 29550 },
    { "name": "Beverages 500ml with Lid", "category": "Packing Material", "unit": "pc", "costPerUnit": 8.04, "currentStock": 8850 },
    { "name": "Burger Box", "category": "Packing Material", "unit": "pc", "costPerUnit": 5.47, "currentStock": 65 },
    { "name": "Butter Paper", "category": "Packing Material", "unit": "kg", "costPerUnit": 375.03, "currentStock": 85.00 },
    { "name": "Butter Sheet Roll", "category": "Packing Material", "unit": "roll", "costPerUnit": 246.62, "currentStock": 9.0 },
    { "name": "Carry Bag 13 X 16", "category": "Packing Material", "unit": "pack", "costPerUnit": 233.64, "currentStock": 1.0 },
    { "name": "Chicken Cover 2 Pcs", "category": "Packing Material", "unit": "pc", "costPerUnit": 1.84, "currentStock": 2000 },
    { "name": "Chicken Cover 4 Pcs", "category": "Packing Material", "unit": "pc", "costPerUnit": 3.12, "currentStock": 4700 },
    { "name": "Chicken Tub 4 Pcs", "category": "Packing Material", "unit": "pc", "costPerUnit": 8.31, "currentStock": 10120 },
    { "name": "Chicken Tub 8 Pcs", "category": "Packing Material", "unit": "pc", "costPerUnit": 10.55, "currentStock": 5920 },
    { "name": "Cling Wrap", "category": "Packing Material", "unit": "pc", "costPerUnit": 370.00, "currentStock": 1.0 },
    { "name": "Dining Sheet", "category": "Packing Material", "unit": "pc", "costPerUnit": 2.05, "currentStock": 170 },
    { "name": "Dinning Tray 250ml", "category": "Packing Material", "unit": "pc", "costPerUnit": 2.95, "currentStock": 8840 },
    { "name": "Dinning Tray 500ml", "category": "Packing Material", "unit": "pc", "costPerUnit": 4.24, "currentStock": 5200 },
    { "name": "Dip Small Bowl", "category": "Packing Material", "unit": "pc", "costPerUnit": 1.77, "currentStock": 850 },
    { "name": "Foam Large", "category": "Packing Material", "unit": "pc", "costPerUnit": 7.55, "currentStock": 6000 },
    { "name": "Garbage Cover Jumbo", "category": "Packing Material", "unit": "kg", "costPerUnit": 109.95, "currentStock": 20 },
    { "name": "Hand Nitrile Gloves", "category": "Packing Material", "unit": "pack", "costPerUnit": 454.00, "currentStock": 10 },
    { "name": "Hand Wash", "category": "Packing Material", "unit": "container", "costPerUnit": 56.25, "currentStock": 1.0 },
    { "name": "Juice Cup 250ml", "category": "Packing Material", "unit": "pc", "costPerUnit": 3.04, "currentStock": 126 },
    { "name": "Juice Paper Cup Roll", "category": "Packing Material", "unit": "roll", "costPerUnit": 17.59, "currentStock": 7.0 },
    { "name": "Mel Cup", "category": "Packing Material", "unit": "pack", "costPerUnit": 111.25, "currentStock": 1.0 },
    { "name": "Paper Bag - Large", "category": "Packing Material", "unit": "pc", "costPerUnit": 10.36, "currentStock": 2950 },
    { "name": "Paper Bag - Small", "category": "Packing Material", "unit": "pc", "costPerUnit": 7.04, "currentStock": 5940 },
    { "name": "Paper Plate", "category": "Packing Material", "unit": "pack", "costPerUnit": 78.08, "currentStock": 2.0 },
    { "name": "Paper Straw Pack", "category": "Packing Material", "unit": "pack", "costPerUnit": 8.00, "currentStock": 2.0 },
    { "name": "Paper Straw - GP", "category": "Packing Material", "unit": "pc", "costPerUnit": 0.70, "currentStock": 39500 },
    { "name": "PP Cover 10*14", "category": "Packing Material", "unit": "kg", "costPerUnit": 242.13, "currentStock": 3.0 },
    { "name": "PP Cover 6*10", "category": "Packing Material", "unit": "kg", "costPerUnit": 242.13, "currentStock": 1.0 },
    { "name": "Silver Plate 8", "category": "Packing Material", "unit": "pack", "costPerUnit": 47.60, "currentStock": 10 },
    { "name": "Softies Wave Cup", "category": "Packing Material", "unit": "pc", "costPerUnit": 2.53, "currentStock": 22400 },
    { "name": "Sugar Cone", "category": "Packing Material", "unit": "pc", "costPerUnit": 2.95, "currentStock": 1115 },
    { "name": "Tea Cup", "category": "Packing Material", "unit": "pack", "costPerUnit": 43.36, "currentStock": 4.0 },
    { "name": "Tissue Paper", "category": "Packing Material", "unit": "kg", "costPerUnit": 17.41, "currentStock": 51.0 },
    { "name": "Tub Lid 4 Pcs", "category": "Packing Material", "unit": "pc", "costPerUnit": 2.41, "currentStock": 5600 },
    { "name": "Tub Lid 8 Pcs", "category": "Packing Material", "unit": "pc", "costPerUnit": 3.35, "currentStock": 5400 },
    { "name": "Vanilla Softy Tube", "category": "Packing Material", "unit": "pc", "costPerUnit": 407.50, "currentStock": 4 },
    { "name": "White Tape 1 Inch", "category": "Packing Material", "unit": "kg", "costPerUnit": 17.41, "currentStock": 3.0 },
    { "name": "Wings 3 Pcs Cover", "category": "Packing Material", "unit": "pc", "costPerUnit": 6.01, "currentStock": 5640 },
    { "name": "Wings 6 Pcs Cover", "category": "Packing Material", "unit": "pc", "costPerUnit": 7.18, "currentStock": 5110 },
    { "name": "Wooden Fork", "category": "Packing Material", "unit": "pack", "costPerUnit": 91.25, "currentStock": 15 },
    { "name": "Wooden Spoon", "category": "Packing Material", "unit": "pack", "costPerUnit": 91.25, "currentStock": 20 },
    { "name": "Wooden Stirrer", "category": "Packing Material", "unit": "pack", "costPerUnit": 14.01, "currentStock": 1.0 },

    # Raw Materials
    { "name": "Aromatic Mix", "category": "Raw Material", "unit": "kg", "costPerUnit": 271.74, "currentStock": 5.0 },
    { "name": "ATTA", "category": "Raw Material", "unit": "kg", "costPerUnit": 59.45, "currentStock": 15.0 },
    { "name": "Beverage Seasoning Masala", "category": "Raw Material", "unit": "kg", "costPerUnit": 259.05, "currentStock": 25.0 },
    { "name": "Black Pepper", "category": "Raw Material", "unit": "kg", "costPerUnit": 108.91, "currentStock": 1.0 },
    { "name": "BBQ Seasoning", "category": "Raw Material", "unit": "kg", "costPerUnit": 144.00, "currentStock": 1.0 },
    { "name": "Black Olives", "category": "Raw Material", "unit": "pc", "costPerUnit": 564.00, "currentStock": 4 },
    { "name": "Bread Crumb", "category": "Raw Material", "unit": "kg", "costPerUnit": 248.50, "currentStock": 19.0 },
    { "name": "Bread Improver", "category": "Raw Material", "unit": "kg", "costPerUnit": 248.50, "currentStock": 4.0 },
    { "name": "Brown Sugar", "category": "Raw Material", "unit": "kg", "costPerUnit": 147.24, "currentStock": 2.5 },
    { "name": "Cajun Spice", "category": "Raw Material", "unit": "kg", "costPerUnit": 343.34, "currentStock": 2.5 },
    { "name": "Calcium Propionate", "category": "Raw Material", "unit": "kg", "costPerUnit": 272.50, "currentStock": 1.0 },
    { "name": "Cheese White", "category": "Raw Material", "unit": "kg", "costPerUnit": 547.00, "currentStock": 10.0 },
    { "name": "Cheese Jalapeno Seasoning", "category": "Raw Material", "unit": "pc", "costPerUnit": 1134.00, "currentStock": 2 },
    { "name": "Cheese Slice - Brite", "category": "Raw Material", "unit": "pc", "costPerUnit": 464.00, "currentStock": 1 },
    { "name": "Chicken Seasoning", "category": "Raw Material", "unit": "kg", "costPerUnit": 277.66, "currentStock": 7.5 },
    { "name": "Cinnamon", "category": "Raw Material", "unit": "kg", "costPerUnit": 126.00, "currentStock": 2.0 },
    { "name": "Del Monte Chilli Garlic", "category": "Raw Material", "unit": "kg", "costPerUnit": 476.64, "currentStock": 1.0 },
    { "name": "Del Monte Chilli Mayo", "category": "Raw Material", "unit": "kg", "costPerUnit": 441.01, "currentStock": 1.0 },
    { "name": "Del Monte Chilli White", "category": "Raw Material", "unit": "kg", "costPerUnit": 482.81, "currentStock": 5.0 },
    { "name": "Demerara Sugar", "category": "Raw Material", "unit": "kg", "costPerUnit": 158.04, "currentStock": 0.25 },
    { "name": "Denness Powder", "category": "Raw Material", "unit": "kg", "costPerUnit": 291.64, "currentStock": 9.0 },
    { "name": "Dark Compound", "category": "Raw Material", "unit": "kg", "costPerUnit": 598.00, "currentStock": 5.0 },
    { "name": "Dark Chocolate Sauce", "category": "Raw Material", "unit": "kg", "costPerUnit": 1040.00, "currentStock": 5.0 },
    { "name": "Dough Premix", "category": "Raw Material", "unit": "kg", "costPerUnit": 209.50, "currentStock": 5.0 },
    { "name": "Dry Yeast", "category": "Raw Material", "unit": "kg", "costPerUnit": 335.70, "currentStock": 1.5 },
    { "name": "Dulce De Leche Cream Spread", "category": "Raw Material", "unit": "kg", "costPerUnit": 1017.60, "currentStock": 5.0 },
    { "name": "FGG", "category": "Raw Material", "unit": "kg", "costPerUnit": 72.18, "currentStock": 7.0 },
    { "name": "Frozen Fried Onion", "category": "Raw Material", "unit": "kg", "costPerUnit": 117.14, "currentStock": 15.0 },
    { "name": "Frozen French Fry", "category": "Raw Material", "unit": "pc", "costPerUnit": 1260.00, "currentStock": 2 },
    { "name": "Frozen Strawberry", "category": "Raw Material", "unit": "kg", "costPerUnit": 437.50, "currentStock": 4.0 },
    { "name": "Garlic", "category": "Raw Material", "unit": "kg", "costPerUnit": 248.50, "currentStock": 0.5 },
    { "name": "Garlic Powder", "category": "Raw Material", "unit": "kg", "costPerUnit": 272.50, "currentStock": 1.0 },
    { "name": "Ghee", "category": "Raw Material", "unit": "kg", "costPerUnit": 375.00, "currentStock": 3.0 },
    { "name": "Green Peas", "category": "Raw Material", "unit": "kg", "costPerUnit": 249.00, "currentStock": 1.0 },
    { "name": "Habanero", "category": "Raw Material", "unit": "kg", "costPerUnit": 172.50, "currentStock": 0.4 },
    { "name": "Honey", "category": "Raw Material", "unit": "kg", "costPerUnit": 471.84, "currentStock": 5.0 },
    { "name": "Jalapeno", "category": "Raw Material", "unit": "kg", "costPerUnit": 118.00, "currentStock": 17.0 },
    { "name": "Kasturi Methi", "category": "Raw Material", "unit": "kg", "costPerUnit": 1058.50, "currentStock": 0.1 },
    { "name": "Kashmiri Chilly", "category": "Raw Material", "unit": "kg", "costPerUnit": 1298.50, "currentStock": 0.2 },
    { "name": "Kidney Beans", "category": "Raw Material", "unit": "kg", "costPerUnit": 199.00, "currentStock": 2.0 },
    { "name": "Kokum", "category": "Raw Material", "unit": "kg", "costPerUnit": 199.00, "currentStock": 1.0 },
    { "name": "Leza Flavour", "category": "Raw Material", "unit": "kg", "costPerUnit": 126.00, "currentStock": 1.0 },
    { "name": "Lotus Biscuit", "category": "Raw Material", "unit": "pc", "costPerUnit": 171.62, "currentStock": 0.5 },
    { "name": "Lotus Paste", "category": "Raw Material", "unit": "pc", "costPerUnit": 545.40, "currentStock": 8 },
    { "name": "Lotus Spread", "category": "Raw Material", "unit": "pc", "costPerUnit": 654.40, "currentStock": 1 },
    { "name": "Maida", "category": "Raw Material", "unit": "kg", "costPerUnit": 46.85, "currentStock": 134.0 },
    { "name": "Mayonnaise", "category": "Raw Material", "unit": "kg", "costPerUnit": 168.43, "currentStock": 33.0 },
    { "name": "Milk Maker", "category": "Raw Material", "unit": "kg", "costPerUnit": 125.40, "currentStock": 1.0 },
    { "name": "Milk", "category": "Raw Material", "unit": "L", "costPerUnit": 54.62, "currentStock": 42.0 },
    { "name": "Milk Powder", "category": "Raw Material", "unit": "kg", "costPerUnit": 140.40, "currentStock": 47.0 },
    { "name": "Mon Oregano", "category": "Raw Material", "unit": "kg", "costPerUnit": 249.20, "currentStock": 1.0 },
    { "name": "Mon Mayonnaise", "category": "Raw Material", "unit": "kg", "costPerUnit": 258.72, "currentStock": 1.0 },
    { "name": "Monn Strawberry Puree", "category": "Raw Material", "unit": "pc", "costPerUnit": 1334.87, "currentStock": 3 },
    { "name": "Monin White Chocolate", "category": "Raw Material", "unit": "kg", "costPerUnit": 415.20, "currentStock": 8.0 },
    { "name": "Mustard Oil", "category": "Raw Material", "unit": "L", "costPerUnit": 210.21, "currentStock": 1.0 },
    { "name": "Mustard Paste", "category": "Raw Material", "unit": "kg", "costPerUnit": 107.10, "currentStock": 3.0 },
    { "name": "Mustard Sauce", "category": "Raw Material", "unit": "pc", "costPerUnit": 158.76, "currentStock": 1 },
    { "name": "Muffins", "category": "Raw Material", "unit": "kg", "costPerUnit": 1058.00, "currentStock": 0.5 },
    { "name": "Olive Oil Extra Virgin", "category": "Raw Material", "unit": "L", "costPerUnit": 585.00, "currentStock": 7.0 },
    { "name": "Oregano Flakes", "category": "Raw Material", "unit": "kg", "costPerUnit": 105.84, "currentStock": 20.0 },
    { "name": "Oregano Sprinkler", "category": "Raw Material", "unit": "kg", "costPerUnit": 535.31, "currentStock": 3.0 },
    { "name": "Oreo Biscuits", "category": "Raw Material", "unit": "pc", "costPerUnit": 78.00, "currentStock": 1 },
    { "name": "Paprika Powder", "category": "Raw Material", "unit": "kg", "costPerUnit": 123.36, "currentStock": 31.0 },
    { "name": "Peri Peri Seasoning", "category": "Raw Material", "unit": "kg", "costPerUnit": 418.58, "currentStock": 15.0 },
    { "name": "Peri Peri Sauce", "category": "Raw Material", "unit": "kg", "costPerUnit": 349.44, "currentStock": 0.5 },
    { "name": "Red Chilli Powder", "category": "Raw Material", "unit": "kg", "costPerUnit": 329.65, "currentStock": 2.5 },
    { "name": "Red Chilli Sauce (Tilted)", "category": "Raw Material", "unit": "pc", "costPerUnit": 69.65, "currentStock": 1 },
    { "name": "Refined Oil", "category": "Raw Material", "unit": "kg", "costPerUnit": 193.85, "currentStock": 310.0 },
    { "name": "Refined Salt", "category": "Raw Material", "unit": "kg", "costPerUnit": 39.71, "currentStock": 7.0 },
    { "name": "Semiya", "category": "Raw Material", "unit": "kg", "costPerUnit": 199.10, "currentStock": 0.5 },
    { "name": "Sour Cream Cheese Marinade Masala", "category": "Raw Material", "unit": "kg", "costPerUnit": 304.50, "currentStock": 25.0 },
    { "name": "Sugar - White", "category": "Raw Material", "unit": "kg", "costPerUnit": 50.87, "currentStock": 40.0 },
    { "name": "Sweet Chili Sauce", "category": "Raw Material", "unit": "pc", "costPerUnit": 212.40, "currentStock": 1 },
    { "name": "Tabasco Sauce", "category": "Raw Material", "unit": "pc", "costPerUnit": 235.40, "currentStock": 1 },
    { "name": "Tahini Paste 600gms", "category": "Raw Material", "unit": "pc", "costPerUnit": 533.49, "currentStock": 7 },
    { "name": "Taste Powder", "category": "Raw Material", "unit": "kg", "costPerUnit": 196.00, "currentStock": 2.0 },
    { "name": "Tomato Ketchup", "category": "Raw Material", "unit": "pc", "costPerUnit": 178.20, "currentStock": 1 },
    { "name": "Tomato Paste", "category": "Raw Material", "unit": "kg", "costPerUnit": 71.50, "currentStock": 20.0 },
    { "name": "Tomato Sauce", "category": "Raw Material", "unit": "kg", "costPerUnit": 67.41, "currentStock": 15.0 },
    { "name": "Unsalted Butter", "category": "Raw Material", "unit": "kg", "costPerUnit": 699.91, "currentStock": 15.0 },
    { "name": "Veg Mayonnaise", "category": "Raw Material", "unit": "kg", "costPerUnit": 132.60, "currentStock": 2.0 },
    { "name": "Vinegar Premium", "category": "Raw Material", "unit": "pc", "costPerUnit": 814.01, "currentStock": 1 },
    { "name": "Volcanic Hot & Spicy Seasoning", "category": "Raw Material", "unit": "kg", "costPerUnit": 423.50, "currentStock": 3.0 },
    { "name": "White Choco", "category": "Raw Material", "unit": "kg", "costPerUnit": 106.32, "currentStock": 0.5 },
    { "name": "White Pepper", "category": "Raw Material", "unit": "kg", "costPerUnit": 1437.50, "currentStock": 0.2 },
    { "name": "White Vinegar", "category": "Raw Material", "unit": "L", "costPerUnit": 70.66, "currentStock": 11.25 },

    # Vegetables
    { "name": "Basil Leaves", "category": "Vegetables", "unit": "kg", "costPerUnit": 348.60, "currentStock": 1.25 },
    { "name": "Fresh Cucumber", "category": "Vegetables", "unit": "kg", "costPerUnit": 80.94, "currentStock": 15.0 },
    { "name": "Green Capsicum", "category": "Vegetables", "unit": "kg", "costPerUnit": 158.75, "currentStock": 5.0 },
    { "name": "Iceberg", "category": "Vegetables", "unit": "kg", "costPerUnit": 248.15, "currentStock": 6.0 },
    { "name": "Jam Tomato", "category": "Vegetables", "unit": "kg", "costPerUnit": 61.19, "currentStock": 12.0 },
    { "name": "Lettuce", "category": "Vegetables", "unit": "kg", "costPerUnit": 228.31, "currentStock": 14.248 },
    { "name": "Onion", "category": "Vegetables", "unit": "kg", "costPerUnit": 39.75, "currentStock": 6.0 },
    { "name": "Parsley", "category": "Vegetables", "unit": "kg", "costPerUnit": 59.60, "currentStock": 4.0 },
    { "name": "Red Cabbage", "category": "Vegetables", "unit": "kg", "costPerUnit": 89.60, "currentStock": 2.5 },
    { "name": "White Onion", "category": "Vegetables", "unit": "kg", "costPerUnit": 38.69, "currentStock": 0.96 }
]

def sanitize_id(name):
    clean = name.lower().replace(' ', '_').replace('-', '_').replace('*', '_').replace('/', '_')
    return 'inv_' + ''.join(c for c in clean if c.isalnum() or c == '_')

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
                existing_inv = data.get('inventory', [])
                # map by normalized name
                name_map = {item['name'].lower().strip(): item for item in existing_inv}
                
                updated_count = 0
                created_count = 0

                for item in inventory_updates:
                    norm_name = item['name'].lower().strip()
                    if norm_name in name_map:
                        # Update existing
                        target = name_map[norm_name]
                        target['costPerUnit'] = item['costPerUnit']
                        target['currentStock'] = item['currentStock']
                        target['category'] = item['category']
                        target['unit'] = item['unit']
                        updated_count += 1
                    else:
                        # Create new
                        new_item = {
                            "id": sanitize_id(item['name']),
                            "name": item['name'],
                            "category": item['category'],
                            "unit": item['unit'],
                            "costPerUnit": item['costPerUnit'],
                            "currentStock": item['currentStock'],
                            "minimumStock": max(1, int(item['currentStock'] * 0.1))
                        }
                        name_map[norm_name] = new_item
                        existing_inv.append(new_item)
                        created_count += 1

                data['inventory'] = list(name_map.values())

                with open(fpath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)
                print(f"Updated {fpath}: {updated_count} updated, {created_count} created. Total items: {len(data['inventory'])}")
        except Exception as e:
            print(f"Error updating {fpath}: {e}")
