import { create } from 'zustand'

const sampleCategories = [
  {
    "id": "c1",
    "name": "Gyros",
    "icon": "🥙",
    "color": "#d97706"
  },
  {
    "id": "c5_legthigh",
    "name": "Leg & Thigh",
    "icon": "🍗",
    "color": "#ea580c"
  },
  {
    "id": "c5_wings",
    "name": "Wings",
    "icon": "🍗",
    "color": "#b45309"
  },
  {
    "id": "c5_strips",
    "name": "Strips",
    "icon": "🍗",
    "color": "#ca8a04"
  },
  {
    "id": "c6",
    "name": "Fries",
    "icon": "🍟",
    "color": "#f59e0b"
  },
  {
    "id": "c10_bev",
    "name": "Beverages",
    "icon": "🥤",
    "color": "#0284c7"
  },
  {
    "id": "c3_rice_salad",
    "name": "Rice & Salads",
    "icon": "🍚🥗",
    "color": "#059669"
  },
  {
    "id": "c2",
    "name": "Meals & Combos",
    "icon": "🍱",
    "color": "#8b5cf6"
  },
  {
    "id": "c11",
    "name": "Protein Max",
    "icon": "💪",
    "color": "#10b981"
  },
  {
    "id": "c7_shakes",
    "name": "Shakes",
    "icon": "🥤",
    "color": "#db2777"
  },
  {
    "id": "c9",
    "name": "Desserts",
    "icon": "🍰",
    "color": "#ec4899"
  },
  {
    "id": "c4",
    "name": "Softy & Add-Ons",
    "icon": "🍦",
    "color": "#e63946"
  },
  {
    "id": "c_new_combo",
    "name": "New Combo",
    "icon": "📦",
    "color": "#e63946"
  },
  {
    "id": "c10_komb",
    "name": "Kombucha",
    "icon": "🍹",
    "color": "#0284c7"
  },
  {
    "id": "cat_1793693056697",
    "name": "Sides",
    "icon": "🍟",
    "color": "#f59e0b"
  },
  {
    "id": "c_breakfast",
    "name": "Breakfast",
    "icon": "🍳",
    "color": "#f59e0b"
  },
  {
    "id": "c_royale",
    "name": "Royale",
    "icon": "👑",
    "color": "#e11d48"
  }
]

const sampleMenuItems = [
  {
    "id": "m_spicy_gyro",
    "categoryId": "c1",
    "name": "Spicy Gyro",
    "price": 199,
    "description": "Spicy gyro wrap (Choose: Chicken or Paneer)",
    "isAvailable": true,
    "image": "/images/menu/gyro.png"
  },
  {
    "id": "m_creamy_gyro",
    "categoryId": "c1",
    "name": "Creamy Gyro",
    "price": 199,
    "description": "Creamy tzatziki gyro wrap (Choose: Chicken or Paneer)",
    "isAvailable": true,
    "image": "/images/menu/gyro.png"
  },
  {
    "id": "m_bbq_gyro",
    "categoryId": "c1",
    "name": "BBQ Gyro",
    "price": 199,
    "description": "Rich BBQ gyro wrap (Choose: Chicken or Paneer)",
    "isAvailable": true,
    "image": "/images/menu/gyro.png"
  },
  {
    "id": "m_signature_gyro",
    "categoryId": "c1",
    "name": "Signature Gyro",
    "price": 199,
    "description": "TDG signature gyro wrap with secret sauce (Choose: Chicken or Paneer)",
    "isAvailable": true,
    "image": "/images/menu/gyro.png"
  },
  {
    "id": "m_greek_gyro",
    "categoryId": "c1",
    "name": "Greek Gyro",
    "price": 299,
    "description": "Authentic large Greek gyro loaded with juicy meat or paneer, tzatziki & fresh toppings (Choose: Chicken or Paneer)",
    "isAvailable": true,
    "image": "/images/drive/circular_gyro_duo.png"
  },
  {
    "id": "m_gyro_italiano",
    "categoryId": "c1",
    "name": "Gyro Italiano",
    "price": 299,
    "description": "Italian fusion gyro with rich herbs, roasted peppers, melted cheese & sauces (Choose: Chicken or Paneer)",
    "isAvailable": true,
    "image": "/images/drive/gyro_baked_chicken.png"
  },
  {
    "id": "m_nuggets_gyro",
    "categoryId": "c1",
    "name": "Chicken Nuggets Gyro",
    "price": 79,
    "description": "Crispy golden chicken nuggets nestled in a fresh gyro pocket with signature spread & veggies",
    "isAvailable": true,
    "image": "/images/drive/gyro_fried_paneer.png"
  },
  {
    "id": "m_falafel_gyro",
    "categoryId": "c1",
    "name": "Falafel Gyro",
    "price": 69,
    "description": "Golden spiced Mediterranean falafel in a fresh warm gyro pocket with creamy spread & fresh greens",
    "isAvailable": true,
    "image": "/images/drive/gyro_baked_chicken.png"
  },
  {
    "id": "m_legthigh_1pc",
    "categoryId": "c5_legthigh",
    "name": "1 Pc Leg & Thigh (1 Dip)",
    "price": 70,
    "description": "1 Pc Crispy Leg & Thigh + 1 Choice Dip",
    "isAvailable": true,
    "image": "/images/menu/leg_thigh.png"
  },
  {
    "id": "m_legthigh_2pc",
    "categoryId": "c5_legthigh",
    "name": "2 Pc Leg & Thigh (1 Dip)",
    "price": 140,
    "description": "2 Pc Crispy Leg & Thigh + 1 Choice Dip",
    "isAvailable": true,
    "image": "/images/menu/leg_thigh.png"
  },
  {
    "id": "m_legthigh_4pc",
    "categoryId": "c5_legthigh",
    "name": "4 Pc Leg & Thigh (2 Dips)",
    "price": 280,
    "description": "4 Pc Crispy Leg & Thigh + 2 Choice Dips",
    "isAvailable": true,
    "image": "/images/menu/leg_thigh.png"
  },
  {
    "id": "m_legthigh_8pc",
    "categoryId": "c5_legthigh",
    "name": "8 Pc Leg & Thigh (4 Dips)",
    "price": 560,
    "description": "8 Pc Crispy Leg & Thigh + 4 Choice Dips",
    "isAvailable": true,
    "image": "/images/menu/leg_thigh.png"
  },
  {
    "id": "m_legthigh_12pc",
    "categoryId": "c5_legthigh",
    "name": "12 Pc Leg & Thigh (6 Dips)",
    "price": 840,
    "description": "12 Pc Crispy Leg & Thigh + 6 Choice Dips",
    "isAvailable": true,
    "image": "/images/menu/leg_thigh.png"
  },
  {
    "id": "m_wings_3pc",
    "categoryId": "c5_wings",
    "name": "3 Pc Wings (1 Dip)",
    "price": 90,
    "description": "3 Pc Crispy Chicken Wings + 1 Choice Dip",
    "isAvailable": true,
    "image": "/images/menu/wings.png"
  },
  {
    "id": "m_wings_6pc",
    "categoryId": "c5_wings",
    "name": "6 Pc Wings (2 Dips)",
    "price": 180,
    "description": "6 Pc Crispy Chicken Wings + 2 Choice Dips",
    "isAvailable": true,
    "image": "/images/menu/wings.png"
  },
  {
    "id": "m_wings_9pc",
    "categoryId": "c5_wings",
    "name": "9 Pc Wings (3 Dips)",
    "price": 270,
    "description": "9 Pc Crispy Chicken Wings + 3 Choice Dips",
    "isAvailable": true,
    "image": "/images/menu/wings.png"
  },
  {
    "id": "m_wings_20pc",
    "categoryId": "c5_wings",
    "name": "20 Pc Wings (6 Dips)",
    "price": 600,
    "description": "20 Pc Crispy Chicken Wings + 6 Choice Dips",
    "isAvailable": true,
    "image": "/images/menu/wings.png"
  },
  {
    "id": "m_strips_3pc",
    "categoryId": "c5_strips",
    "name": "3 Pc Strips (1 Dip)",
    "price": 120,
    "description": "3 Pc Crispy Chicken Strips + 1 Choice Dip",
    "isAvailable": true,
    "image": "/images/menu/strips.png"
  },
  {
    "id": "m_strips_6pc",
    "categoryId": "c5_strips",
    "name": "6 Pc Strips (2 Dips)",
    "price": 240,
    "description": "6 Pc Crispy Chicken Strips + 2 Choice Dips",
    "isAvailable": true,
    "image": "/images/menu/strips.png"
  },
  {
    "id": "m_strips_9pc",
    "categoryId": "c5_strips",
    "name": "9 Pc Strips (3 Dips)",
    "price": 360,
    "description": "9 Pc Crispy Chicken Strips + 3 Choice Dips",
    "isAvailable": true,
    "image": "/images/menu/strips.png"
  },
  {
    "id": "m_strips_20pc",
    "categoryId": "c5_strips",
    "name": "20 Pc Strips (6 Dips)",
    "price": 800,
    "description": "20 Pc Crispy Chicken Strips + 6 Choice Dips",
    "isAvailable": true,
    "image": "/images/menu/strips.png"
  },
  {
    "id": "m_fries_std",
    "categoryId": "c6",
    "name": "Fries",
    "price": 99,
    "description": "Crispy golden French fries (Choose seasoning: Salted, Peri Peri, or Cajun)",
    "isAvailable": true,
    "image": "/images/menu/fries.png"
  },
  {
    "id": "m_loaded_fries",
    "categoryId": "c6",
    "name": "Loaded Fries",
    "price": 199,
    "description": "Loaded Fries topped with melted cheese & sauces (Choose protein: Chicken or Paneer)",
    "isAvailable": true,
    "image": "/images/menu/loaded fries.png"
  },
  {
    "id": "m_sprite_reg",
    "categoryId": "c10_bev",
    "name": "Sprite (Regular)",
    "price": 49,
    "description": "Sprite 330ml Regular",
    "isAvailable": true,
    "image": "/images/menu/express meal.png"
  },
  {
    "id": "m_sprite_lrg",
    "categoryId": "c10_bev",
    "name": "Sprite (Large)",
    "price": 99,
    "description": "Sprite 500ml Large",
    "isAvailable": true,
    "image": "/images/menu/express meal.png"
  },
  {
    "id": "m_cocacola_reg",
    "categoryId": "c10_bev",
    "name": "Coca Cola (Regular)",
    "price": 49,
    "description": "Coca Cola 330ml Regular",
    "isAvailable": true,
    "image": "/images/menu/express meal.png"
  },
  {
    "id": "m_cocacola_lrg",
    "categoryId": "c10_bev",
    "name": "Coca Cola (Large)",
    "price": 99,
    "description": "Coca Cola 500ml Large",
    "isAvailable": true,
    "image": "/images/menu/express meal.png"
  },
  {
    "id": "m_icetea_reg",
    "categoryId": "c10_bev",
    "name": "Ice Tea (Regular)",
    "price": 59,
    "description": "Refreshing Ice Tea - Peach or Lime (Regular)",
    "isAvailable": true,
    "image": "/images/menu/ice tea - lime.png"
  },
  {
    "id": "m_icetea_lrg",
    "categoryId": "c10_bev",
    "name": "Ice Tea (Large)",
    "price": 99,
    "description": "Refreshing Ice Tea - Peach or Lime (Large)",
    "isAvailable": true,
    "image": "/images/menu/ice tea - lime.png"
  },
  {
    "id": "m_hot_chocolate",
    "categoryId": "c10_bev",
    "name": "Hot Chocolate",
    "price": 99,
    "description": "Rich Warm Hot Chocolate",
    "isAvailable": true,
    "image": "/images/menu/Hot Chocolate.png"
  },
  {
    "id": "m_signature_tea",
    "categoryId": "c10_bev",
    "name": "Signature Tea",
    "price": 99,
    "description": "Special TDG Signature Brewed Tea",
    "isAvailable": true,
    "image": "/images/menu/Signature tea.png"
  },
  {
    "id": "m_rice_bowl",
    "categoryId": "c3_rice_salad",
    "name": "Signature Rice",
    "price": 199,
    "description": "Signature Lebanese Rice Bowl with fresh herbs & toppings (Choose: Chicken or Paneer)",
    "isAvailable": true,
    "image": "/images/menu/lebanese rice bowl.png"
  },
  {
    "id": "m_signature_salad",
    "categoryId": "c3_rice_salad",
    "name": "Signature Salad",
    "price": 149,
    "description": "Fresh Mediterranean Signature Salad with dressing (Choose: Chicken or Paneer)",
    "isAvailable": true,
    "image": "/images/menu/signature salad.png"
  },
  {
    "id": "m_express_meal",
    "categoryId": "c2",
    "name": "Express Meal",
    "price": 249,
    "description": "Gyro & Regular Drink",
    "isAvailable": true,
    "image": "/images/menu/express meal.png"
  },
  {
    "id": "m_sig_gyro_meal",
    "categoryId": "c2",
    "name": "Signature Gyro Meal",
    "price": 279,
    "description": "Gyro, Fries, Regular Drink",
    "isAvailable": true,
    "image": "/images/menu/signature gyro meal.png"
  },
  {
    "id": "m_lebanese_rice_box",
    "categoryId": "c2",
    "name": "Lebanese Rice Box",
    "price": 299,
    "description": "Lebanese rice, Fries, Regular Drink",
    "isAvailable": true,
    "image": "/images/menu/lebanese rice box.png"
  },
  {
    "id": "m_classic_gyro_meal",
    "categoryId": "c2",
    "name": "Classic Gyro Meal",
    "price": 349,
    "description": "Gyro, 2 Wings, Fries, Regular Drink, 1 Dip",
    "isAvailable": true,
    "image": "/images/menu/classic gyro meal.png"
  },
  {
    "id": "m_duo_gyro_feast",
    "categoryId": "c2",
    "name": "Duo Gyro Feast",
    "price": 449,
    "description": "2 Gyros, Fries, 2 Regular Drinks",
    "isAvailable": true,
    "image": "/images/menu/duo gyro feast.png"
  },
  {
    "id": "m_double_crunch_box",
    "categoryId": "c2",
    "name": "Double Crunch Box",
    "price": 699,
    "description": "2 Gyros, 6 Wings, Fries, 2 Regular Drinks",
    "isAvailable": true,
    "image": "/images/menu/double crunch box.png"
  },
  {
    "id": "m_mega_feast_meal",
    "categoryId": "c2",
    "name": "Mega Feast Meal",
    "price": 799,
    "description": "2 Gyros, 2 Leg & Thighs, 2 Wings, 2 Strips, Fries, 2 Regular Drinks, 3 Dips",
    "isAvailable": true,
    "image": "/images/menu/mega feast meal.png"
  },
  {
    "id": "m_dens_party_meal",
    "categoryId": "c2",
    "name": "Den's Party Meal",
    "price": 1049,
    "description": "2 Gyros, 6 Wings, 4 Leg & Thighs, 2 Fries, 3 Regular Drinks",
    "isAvailable": true,
    "image": "/images/menu/den's party meal.png"
  },
  {
    "id": "m_super5_bucket",
    "categoryId": "c2",
    "name": "Super 5 Bucket",
    "price": 1299,
    "description": "5 Leg & Thighs, 10 Wings, 10 Strips, 5 Regular Drinks",
    "isAvailable": true,
    "image": "/images/menu/super 5 bucket.png"
  },
  {
    "id": "m_wednesday_combo_1",
    "categoryId": "c2",
    "name": "Wednesday Combo - 1",
    "price": 279,
    "description": "1 Leg and Thigh, 2 Wings, 2 Strips",
    "isAvailable": true,
    "image": "/images/menu/wednesday_combo.png"
  },
  {
    "id": "m_wednesday_combo_2",
    "categoryId": "c2",
    "name": "Wednesday Combo - 2",
    "price": 379,
    "description": "1 Gyro, 2 Leg and Thigh, 2 Wings, 2 Strips",
    "isAvailable": true,
    "image": "/images/menu/wednesday_combo.png"
  },
  {
    "id": "m_pmax_gyro",
    "categoryId": "c11",
    "name": "Protein Max Gyro",
    "price": 299,
    "description": "High Protein Gyro (Choose: Chicken or Paneer)",
    "isAvailable": true,
    "image": "/images/menu/protein max.png"
  },
  {
    "id": "m_pmax_rice",
    "categoryId": "c11",
    "name": "Protein Max Rice Bowl",
    "price": 299,
    "description": "High Protein Rice Bowl (Choose: Chicken or Paneer)",
    "isAvailable": true,
    "image": "/images/menu/protein max.png"
  },
  {
    "id": "m_pmax_salad",
    "categoryId": "c11",
    "name": "Protein Max Salad",
    "price": 299,
    "description": "High Protein Mediterranean Salad (Choose: Chicken or Paneer)",
    "isAvailable": true,
    "image": "/images/menu/protein max.png"
  },
  {
    "id": "m_vanilla_shake_reg",
    "categoryId": "c7_shakes",
    "name": "Vanilla Shake (Regular)",
    "price": 120,
    "description": "Classic Vanilla Shake (Ask for White Chocolate)",
    "isAvailable": true,
    "image": "/images/menu/vanilla shake.png"
  },
  {
    "id": "m_vanilla_shake_lrg",
    "categoryId": "c7_shakes",
    "name": "Vanilla Shake (Large)",
    "price": 199,
    "description": "Large Vanilla Shake (Ask for White Chocolate)",
    "isAvailable": true,
    "image": "/images/menu/vanilla shake.png"
  },
  {
    "id": "m_strawberry_shake_reg",
    "categoryId": "c7_shakes",
    "name": "Strawberry Shake (Regular)",
    "price": 120,
    "description": "Fresh Strawberry Shake Regular",
    "isAvailable": true,
    "image": "/images/menu/strawberry shake.png"
  },
  {
    "id": "m_strawberry_shake_lrg",
    "categoryId": "c7_shakes",
    "name": "Strawberry Shake (Large)",
    "price": 199,
    "description": "Fresh Strawberry Shake Large",
    "isAvailable": true,
    "image": "/images/menu/strawberry shake.png"
  },
  {
    "id": "m_biscoff_shake_reg",
    "categoryId": "c7_shakes",
    "name": "Biscoff Shake (Regular)",
    "price": 120,
    "description": "Lotus Biscoff Shake Regular",
    "isAvailable": true,
    "image": "/images/menu/biscoff shake.png"
  },
  {
    "id": "m_biscoff_shake_lrg",
    "categoryId": "c7_shakes",
    "name": "Biscoff Shake (Large)",
    "price": 199,
    "description": "Lotus Biscoff Shake Large",
    "isAvailable": true,
    "image": "/images/menu/biscoff shake.png"
  },
  {
    "id": "m_chocolate_shake_reg",
    "categoryId": "c7_shakes",
    "name": "Chocolate Shake (Regular)",
    "price": 120,
    "description": "Rich Chocolate Shake Regular",
    "isAvailable": true,
    "image": "/images/menu/chocolate shake.png"
  },
  {
    "id": "m_chocolate_shake_lrg",
    "categoryId": "c7_shakes",
    "name": "Chocolate Shake (Large)",
    "price": 199,
    "description": "Rich Chocolate Shake Large",
    "isAvailable": true,
    "image": "/images/menu/chocolate shake.png"
  },
  {
    "id": "m_kunafa_shake_reg",
    "categoryId": "c7_shakes",
    "name": "Kunafa Pistachio Shake - Signature (Regular)",
    "price": 120,
    "description": "Signature Kunafa Pistachio Shake Regular",
    "isAvailable": true,
    "image": "/images/menu/kunafa pistachio shake.png"
  },
  {
    "id": "m_kunafa_shake_lrg",
    "categoryId": "c7_shakes",
    "name": "Kunafa Pistachio Shake - Signature (Large)",
    "price": 199,
    "description": "Signature Kunafa Pistachio Shake Large",
    "isAvailable": true,
    "image": "/images/menu/kunafa pistachio shake.png"
  },
  {
    "id": "m_brownie",
    "categoryId": "c9",
    "name": "Chocolate Brownie",
    "price": 99,
    "description": "Fudgy Chocolate Brownie",
    "isAvailable": true,
    "image": "/images/menu/chcolate brownie.png"
  },
  {
    "id": "m_blondie",
    "categoryId": "c9",
    "name": "Blondie Cake (Signature)",
    "price": 99,
    "description": "TDG Signature White Chocolate Blondie Cake",
    "isAvailable": true,
    "image": "/images/menu/blondie cake.png"
  },
  {
    "id": "m_vanilla_softy",
    "categoryId": "c4",
    "name": "Vanilla Softy",
    "price": 37.15,
    "description": "Creamy Vanilla Soft Serve Cone",
    "isAvailable": true,
    "image": "/images/menu/vanilla softy.png"
  },
  {
    "id": "m_dip_choice",
    "categoryId": "c4",
    "name": "Choice of Dip",
    "price": 14.30,
    "description": "Choice of Dip (Garlic Mayo, Spicy Mayo, Honey Mustard, Tzatziki, Jalapeno Cheese, Turkish Chilli)",
    "isAvailable": true,
    "image": "/images/menu/garlic mayo.png"
  },
  {
    "id": "m_kombucha_mint",
    "categoryId": "c10_komb",
    "name": "Mint Kombucha",
    "price": 114,
    "description": "Mint Kombucha 250ml",
    "isAvailable": true,
    "image": "/images/menu/mint-kombucha.png"
  },
  {
    "id": "m_kombucha_hibiscus",
    "categoryId": "c10_komb",
    "name": "Hibiscus Kombucha",
    "price": 114,
    "description": "Hibiscus Kombucha 250ml",
    "isAvailable": true,
    "image": "/images/menu/kombucha-hibiscus.png"
  },
  {
    "id": "m_kombucha_classic",
    "categoryId": "c10_komb",
    "name": "Classic Kombucha",
    "price": 114,
    "description": "Classic Kombucha 250ml",
    "isAvailable": true,
    "image": "/images/menu/kombucha.png"
  },
  {
    "id": "m_sides_nuggets_3pc",
    "categoryId": "cat_1793693056697",
    "name": "3 Pc Chicken Nuggets",
    "price": 49,
    "description": "3 pieces of golden crispy tender chicken nuggets",
    "isAvailable": true,
    "image": "/images/menu/sides_chicken_nuggets.png"
  },
  {
    "id": "m_sides_falafel_4pc",
    "categoryId": "cat_1793693056697",
    "name": "4 Pc Falafel",
    "price": 99,
    "description": "4 pieces of freshly fried herb-infused authentic Mediterranean falafel",
    "isAvailable": true,
    "image": "/images/menu/sides_falafel.png"
  },
  {
    "id": "m_breakfast_gyro",
    "categoryId": "c_breakfast",
    "name": "Breakfast Gyro",
    "price": 149,
    "description": "Fresh morning pita pocket with scrambled eggs, melted cheese & breakfast seasonings",
    "isAvailable": true,
    "image": "/images/drive/Baked.png"
  },
  {
    "id": "m_breakfast_royale",
    "categoryId": "c_breakfast",
    "name": "Breakfast Royale",
    "price": 149,
    "description": "Deluxe morning breakfast bowl with eggs, sautéed greens, roasted tomatoes & warm pita",
    "isAvailable": true,
    "image": "/images/drive/Rice Bowl.png"
  },
  {
    "id": "m_cheese_omelette",
    "categoryId": "c_breakfast",
    "name": "Cheese Omelette",
    "price": 149,
    "description": "Fluffy 3-egg French omelette folded with rich molten cheddar & Mediterranean herbs",
    "isAvailable": true,
    "image": "/images/drive/Cheese-01.jpg"
  },
  {
    "id": "m_vegan_gyro",
    "categoryId": "c_breakfast",
    "name": "Vegan Gyro",
    "price": 149,
    "description": "100% plant-based breakfast gyro with grilled mushrooms, spinach, roasted peppers & vegan garlic spread",
    "isAvailable": true,
    "image": "/images/drive/Baked.png"
  },
  {
    "id": "m_royale_vegan_salad",
    "categoryId": "c_royale",
    "name": "Vegan Salad",
    "price": 249,
    "description": "Mediterranean crisp greens, roasted chickpeas, olives, cherry tomatoes & extra virgin olive oil vinaigrette",
    "isAvailable": true,
    "image": "/images/drive/Signature Salad.png"
  },
  {
    "id": "m_royale_grilled_fish",
    "categoryId": "c_royale",
    "name": "Grilled Fish",
    "price": 249,
    "description": "Fresh fish fillet seared on the grill with garlic lemon butter glaze and Greek herbs",
    "isAvailable": true,
    "image": "/images/drive/gyro_baked_chicken.png"
  },
  {
    "id": "m_royale_grilled_halloumi",
    "categoryId": "c_royale",
    "name": "Grilled Halloumi",
    "price": 249,
    "description": "Golden seared Cypriot halloumi cheese drizzled with wild honey, za'atar and olive oil",
    "isAvailable": true,
    "image": "/images/drive/gyro_fried_paneer.png"
  },
  {
    "id": "m_royale_grilled_chicken",
    "categoryId": "c_royale",
    "name": "Grilled Chicken",
    "price": 249,
    "description": "Juicy flame-grilled chicken breast glazed with herb lemon marinade and served with grilled veggies",
    "isAvailable": true,
    "image": "/images/drive/gyro_baked_chicken.png"
  }
]

export const useMenuStore = create((set, get) => ({
  categories: sampleCategories,
  menuItems: sampleMenuItems,
  loading: false,

  fetchCategories: async () => {
    try {
      const apiUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : window.location.origin

      const res = await fetch(`${apiUrl}/api/admin/menu/categories`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const serverCatIds = new Set(data.map(c => String(c.id)))
          const serverCatNames = new Set(data.map(c => String(c.name).toLowerCase().trim()))
          const missingCats = sampleCategories.filter(c => !serverCatIds.has(String(c.id)) && !serverCatNames.has(String(c.name).toLowerCase().trim()))
          set({ categories: [...data.filter(c => !c.isDeleted), ...missingCats] })
          return
        }
      }
    } catch (e) {
      console.log('Using local categories fallback')
    }
    set({ categories: sampleCategories })
  },

  fetchMenuItems: async (categoryId) => {
    set({ loading: true })
    try {
      const apiUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : window.location.origin

      const url = categoryId ? `${apiUrl}/api/admin/menu/items?categoryId=${categoryId}` : `${apiUrl}/api/admin/menu/items`
      const res = await fetch(url)
      if (res.ok) {
        const rawData = await res.json()
        const data = Array.isArray(rawData) ? rawData : (rawData.items || rawData.menuItems || [])
        if (Array.isArray(data) && data.length > 0) {
          const serverIds = new Set(data.map(i => String(i.id)))
          const serverNames = new Set(data.map(i => String(i.name).toLowerCase().trim()))
          const missingItems = sampleMenuItems.filter(i => !serverIds.has(String(i.id)) && !serverNames.has(String(i.name).toLowerCase().trim()))
          const allItems = missingItems.length > 0 ? [...data.filter(i => !i.isDeleted), ...missingItems] : data.filter(i => !i.isDeleted)
          const resultItems = categoryId ? allItems.filter(i => i.categoryId === categoryId) : allItems
          set({ menuItems: resultItems, loading: false })
          return
        }
      }
    } catch (e) {
      console.log('Using local menu items fallback')
    }
    if (categoryId) {
      set({ menuItems: sampleMenuItems.filter(i => i.categoryId === categoryId), loading: false })
    } else {
      set({ menuItems: sampleMenuItems, loading: false })
    }
  },

  toggleAvailability: async (itemId, isAvailable) => {
    set(state => ({
      menuItems: state.menuItems.map(item =>
        item.id === itemId ? { ...item, isAvailable } : item
      )
    }))
  }
}))
