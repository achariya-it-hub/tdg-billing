import { useState, useEffect, useRef } from 'react'
import { UtensilsCrossed, Plus, Search, BookOpen, Package, Edit, Copy, Trash2, Check, X, ChevronRight, AlertTriangle, Calculator, ImagePlus, Download, FileSpreadsheet } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toaster'
import { useMenuStore } from '../stores/menuStore'

const sampleCategories = [
  {
    "id": "c1",
    "name": "Gyros",
    "icon": "\ud83e\udd59",
    "color": "#d97706"
  },
  {
    "id": "c5_legthigh",
    "name": "Leg & Thigh",
    "icon": "\ud83c\udf57",
    "color": "#ea580c"
  },
  {
    "id": "c5_wings",
    "name": "Wings",
    "icon": "\ud83c\udf57",
    "color": "#b45309"
  },
  {
    "id": "c5_strips",
    "name": "Strips",
    "icon": "\ud83c\udf57",
    "color": "#ca8a04"
  },
  {
    "id": "c6",
    "name": "Fries",
    "icon": "\ud83c\udf5f",
    "color": "#f59e0b"
  },
  {
    "id": "c10_bev",
    "name": "Beverages",
    "icon": "\ud83e\udd64",
    "color": "#0284c7"
  },
  {
    "id": "c3_rice",
    "name": "Rice",
    "icon": "\ud83c\udf5a",
    "color": "#059669"
  },
  {
    "id": "c3_salad",
    "name": "Salads",
    "icon": "\ud83e\udd57",
    "color": "#10b981"
  },
  {
    "id": "c2",
    "name": "Meals & Combos",
    "icon": "\ud83c\udf71",
    "color": "#8b5cf6"
  },
  {
    "id": "c11",
    "name": "Protein Max",
    "icon": "\ud83d\udcaa",
    "color": "#10b981"
  },
  {
    "id": "c7_shakes",
    "name": "Shakes",
    "icon": "\ud83e\udd64",
    "color": "#db2777"
  },
  {
    "id": "c9",
    "name": "Desserts",
    "icon": "\ud83c\udf70",
    "color": "#ec4899"
  },
  {
    "id": "c4",
    "name": "Softy & Add-Ons",
    "icon": "\ud83c\udf66",
    "color": "#e63946"
  },
  {
    "id": "c10_komb",
    "name": "Kombucha",
    "icon": "\ud83c\udf79",
    "color": "#0284c7"
  }
]

const sampleMenuItems = [
  {
    "id": "m_spicy_gyro",
    "categoryId": "c1",
    "name": "Spicy Gyro",
    "price": 199,
    "description": "Spicy gyro with fresh veggies & spread (Choose: Chicken or Paneer)",
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
    "name": "Fries (Salted, Peri Peri or Cajun)",
    "price": 99,
    "description": "Crispy Fries (Choose seasoning: Salted, Peri Peri, or Cajun)",
    "isAvailable": true,
    "image": "/images/menu/fries.png"
  },
  {
    "id": "m_loaded_fries",
    "categoryId": "c6",
    "name": "Loaded Fries",
    "price": 199,
    "description": "Loaded Fries topped with melted cheese, sauces (Choose: Chicken or Paneer)",
    "isAvailable": true,
    "image": "/images/menu/loaded fries.png"
  },
  {
    "id": "m_rice_bowl",
    "categoryId": "c3_rice",
    "name": "Rice Bowl (Signature)",
    "price": 199,
    "description": "Signature Lebanese Rice Bowl with fresh herbs & toppings (Choose: Chicken or Paneer)",
    "isAvailable": true,
    "image": "/images/menu/lebanese rice bowl.png"
  },
  {
    "id": "m_signature_salad",
    "categoryId": "c3_salad",
    "name": "Signature Salad",
    "price": 149,
    "description": "Fresh Mediterranean Signature Salad with dressing (Choose: Chicken or Paneer)",
    "isAvailable": true,
    "image": "/images/menu/signature salad.png"
  },
  {
    "id": "m_sprite_reg",
    "categoryId": "c10_bev",
    "name": "Sprite (Regular)",
    "price": 59,
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
    "price": 59,
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
    "price": 39,
    "description": "Creamy Vanilla Soft Serve Cone",
    "isAvailable": true,
    "image": "/images/menu/vanilla softy.png"
  },
  {
    "id": "m_dip_choice",
    "categoryId": "c4",
    "name": "Choice of Dip",
    "price": 15,
    "description": "Choice of Dip (Garlic Mayo, Spicy Mayo, Honey Mustard, Tzatziki, Jalapeno Cheese, Turkish Chilli)",
    "isAvailable": true,
    "image": "/images/menu/garlic mayo.png"
  },
  {
    "id": "m_kombucha_mint",
    "categoryId": "c10_komb",
    "name": "Mint Kombucha",
    "price": 120,
    "description": "Refreshing Brewed Mint Kombucha 250ml",
    "isAvailable": true,
    "image": "/images/menu/mint-kombucha.png"
  },
  {
    "id": "m_kombucha_hibiscus",
    "categoryId": "c10_komb",
    "name": "Hibiscus Kombucha",
    "price": 120,
    "description": "Refreshing Brewed Hibiscus Kombucha 250ml",
    "isAvailable": true,
    "image": "/images/menu/kombucha-hibiscus.png"
  },
  {
    "id": "m_kombucha_classic",
    "categoryId": "c10_komb",
    "name": "Classic Kombucha",
    "price": 120,
    "description": "Refreshing Brewed Classic Kombucha 250ml",
    "isAvailable": true,
    "image": "/images/menu/kombucha.png"
  }
]

const sampleInventory = [
 { id: 'i1', name: 'Chicken Breast', unit: 'kg', currentStock: 50, costPerUnit: 180 },
 { id: 'i2', name: 'Burger Buns', unit: 'pcs', currentStock: 200, costPerUnit: 8 },
 { id: 'i3', name: 'Lettuce', unit: 'kg', currentStock: 10, costPerUnit: 120 },
 { id: 'i4', name: 'Tomato Slices', unit: 'kg', currentStock: 8, costPerUnit: 80 },
 { id: 'i5', name: 'Cheese Slices', unit: 'pcs', currentStock: 100, costPerUnit: 15 },
 { id: 'i6', name: 'Chicken Wings', unit: 'kg', currentStock: 25, costPerUnit: 200 },
 { id: 'i7', name: 'Fries (Frozen)', unit: 'kg', currentStock: 30, costPerUnit: 45 },
 { id: 'i8', name: 'Cooking Oil', unit: 'liters', currentStock: 40, costPerUnit: 120 },
 { id: 'i9', name: 'Pepsi Syrup', unit: 'liters', currentStock: 5, costPerUnit: 350 },
 { id: 'i10', name: 'Tea Leaves', unit: 'kg', currentStock: 3, costPerUnit: 500 },
 { id: 'i11', name: 'Milk', unit: 'liters', currentStock: 10, costPerUnit: 60 },
 { id: 'i12', name: 'Packaging Boxes', unit: 'pcs', currentStock: 200, costPerUnit: 5 },
]

const sampleRecipes = [
  {
    "id": "r_m_spicy_gyro",
    "menuItemId": "m_spicy_gyro",
    "menuItemName": "Spicy Gyro",
    "name": "RECIPE - SPICY GYRO",
    "description": "Standard recipe for Spicy Gyro (Price RS 199/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 45.27,
    "pmCost": 13.93,
    "labourCost": 10.45,
    "calculatedCost": 69.65,
    "sellingPrice": 199.0,
    "ingredients": [
      {
        "id": "ri_m_spicy_gyro_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Spicy Gyro Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 45.27,
        "cost": 45.27
      },
      {
        "id": "ri_m_spicy_gyro_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 13.93,
        "cost": 13.93
      },
      {
        "id": "ri_m_spicy_gyro_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 10.45,
        "cost": 10.45
      }
    ]
  },
  {
    "id": "r_m_creamy_gyro",
    "menuItemId": "m_creamy_gyro",
    "menuItemName": "Creamy Gyro",
    "name": "RECIPE - CREAMY GYRO",
    "description": "Standard recipe for Creamy Gyro (Price RS 199/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 45.27,
    "pmCost": 13.93,
    "labourCost": 10.45,
    "calculatedCost": 69.65,
    "sellingPrice": 199.0,
    "ingredients": [
      {
        "id": "ri_m_creamy_gyro_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Creamy Gyro Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 45.27,
        "cost": 45.27
      },
      {
        "id": "ri_m_creamy_gyro_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 13.93,
        "cost": 13.93
      },
      {
        "id": "ri_m_creamy_gyro_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 10.45,
        "cost": 10.45
      }
    ]
  },
  {
    "id": "r_m_bbq_gyro",
    "menuItemId": "m_bbq_gyro",
    "menuItemName": "BBQ Gyro",
    "name": "RECIPE - BBQ GYRO",
    "description": "Standard recipe for BBQ Gyro (Price RS 199/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 45.27,
    "pmCost": 13.93,
    "labourCost": 10.45,
    "calculatedCost": 69.65,
    "sellingPrice": 199.0,
    "ingredients": [
      {
        "id": "ri_m_bbq_gyro_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "BBQ Gyro Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 45.27,
        "cost": 45.27
      },
      {
        "id": "ri_m_bbq_gyro_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 13.93,
        "cost": 13.93
      },
      {
        "id": "ri_m_bbq_gyro_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 10.45,
        "cost": 10.45
      }
    ]
  },
  {
    "id": "r_m_signature_gyro",
    "menuItemId": "m_signature_gyro",
    "menuItemName": "Signature Gyro",
    "name": "RECIPE - SIGNATURE GYRO",
    "description": "Standard recipe for Signature Gyro (Price RS 199/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 45.27,
    "pmCost": 13.93,
    "labourCost": 10.45,
    "calculatedCost": 69.65,
    "sellingPrice": 199.0,
    "ingredients": [
      {
        "id": "ri_m_signature_gyro_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Signature Gyro Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 45.27,
        "cost": 45.27
      },
      {
        "id": "ri_m_signature_gyro_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 13.93,
        "cost": 13.93
      },
      {
        "id": "ri_m_signature_gyro_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 10.45,
        "cost": 10.45
      }
    ]
  },
  {
    "id": "r_m_legthigh_1pc",
    "menuItemId": "m_legthigh_1pc",
    "menuItemName": "1 Pc Leg & Thigh (1 Dip)",
    "name": "RECIPE - 1 PC LEG & THIGH (1 DIP)",
    "description": "Standard recipe for 1 Pc Leg & Thigh (1 Dip) (Price RS 70/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 15.93,
    "pmCost": 4.9,
    "labourCost": 3.67,
    "calculatedCost": 24.5,
    "sellingPrice": 70.0,
    "ingredients": [
      {
        "id": "ri_m_legthigh_1pc_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "1 Pc Leg & Thigh (1 Dip) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 15.93,
        "cost": 15.93
      },
      {
        "id": "ri_m_legthigh_1pc_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 4.9,
        "cost": 4.9
      },
      {
        "id": "ri_m_legthigh_1pc_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 3.67,
        "cost": 3.67
      }
    ]
  },
  {
    "id": "r_m_legthigh_2pc",
    "menuItemId": "m_legthigh_2pc",
    "menuItemName": "2 Pc Leg & Thigh (1 Dip)",
    "name": "RECIPE - 2 PC LEG & THIGH (1 DIP)",
    "description": "Standard recipe for 2 Pc Leg & Thigh (1 Dip) (Price RS 140/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 31.85,
    "pmCost": 9.8,
    "labourCost": 7.35,
    "calculatedCost": 49.0,
    "sellingPrice": 140.0,
    "ingredients": [
      {
        "id": "ri_m_legthigh_2pc_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "2 Pc Leg & Thigh (1 Dip) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 31.85,
        "cost": 31.85
      },
      {
        "id": "ri_m_legthigh_2pc_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 9.8,
        "cost": 9.8
      },
      {
        "id": "ri_m_legthigh_2pc_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 7.35,
        "cost": 7.35
      }
    ]
  },
  {
    "id": "r_m_legthigh_4pc",
    "menuItemId": "m_legthigh_4pc",
    "menuItemName": "4 Pc Leg & Thigh (2 Dips)",
    "name": "RECIPE - 4 PC LEG & THIGH (2 DIPS)",
    "description": "Standard recipe for 4 Pc Leg & Thigh (2 Dips) (Price RS 280/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 63.7,
    "pmCost": 19.6,
    "labourCost": 14.7,
    "calculatedCost": 98.0,
    "sellingPrice": 280.0,
    "ingredients": [
      {
        "id": "ri_m_legthigh_4pc_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "4 Pc Leg & Thigh (2 Dips) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 63.7,
        "cost": 63.7
      },
      {
        "id": "ri_m_legthigh_4pc_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 19.6,
        "cost": 19.6
      },
      {
        "id": "ri_m_legthigh_4pc_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 14.7,
        "cost": 14.7
      }
    ]
  },
  {
    "id": "r_m_legthigh_8pc",
    "menuItemId": "m_legthigh_8pc",
    "menuItemName": "8 Pc Leg & Thigh (4 Dips)",
    "name": "RECIPE - 8 PC LEG & THIGH (4 DIPS)",
    "description": "Standard recipe for 8 Pc Leg & Thigh (4 Dips) (Price RS 560/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 127.4,
    "pmCost": 39.2,
    "labourCost": 29.4,
    "calculatedCost": 196.0,
    "sellingPrice": 560.0,
    "ingredients": [
      {
        "id": "ri_m_legthigh_8pc_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "8 Pc Leg & Thigh (4 Dips) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 127.4,
        "cost": 127.4
      },
      {
        "id": "ri_m_legthigh_8pc_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 39.2,
        "cost": 39.2
      },
      {
        "id": "ri_m_legthigh_8pc_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 29.4,
        "cost": 29.4
      }
    ]
  },
  {
    "id": "r_m_legthigh_12pc",
    "menuItemId": "m_legthigh_12pc",
    "menuItemName": "12 Pc Leg & Thigh (6 Dips)",
    "name": "RECIPE - 12 PC LEG & THIGH (6 DIPS)",
    "description": "Standard recipe for 12 Pc Leg & Thigh (6 Dips) (Price RS 840/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 191.1,
    "pmCost": 58.8,
    "labourCost": 44.1,
    "calculatedCost": 294.0,
    "sellingPrice": 840.0,
    "ingredients": [
      {
        "id": "ri_m_legthigh_12pc_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "12 Pc Leg & Thigh (6 Dips) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 191.1,
        "cost": 191.1
      },
      {
        "id": "ri_m_legthigh_12pc_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 58.8,
        "cost": 58.8
      },
      {
        "id": "ri_m_legthigh_12pc_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 44.1,
        "cost": 44.1
      }
    ]
  },
  {
    "id": "r_m_wings_3pc",
    "menuItemId": "m_wings_3pc",
    "menuItemName": "3 Pc Wings (1 Dip)",
    "name": "RECIPE - 3 PC WINGS (1 DIP)",
    "description": "Standard recipe for 3 Pc Wings (1 Dip) (Price RS 90/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 20.48,
    "pmCost": 6.3,
    "labourCost": 4.72,
    "calculatedCost": 31.5,
    "sellingPrice": 90.0,
    "ingredients": [
      {
        "id": "ri_m_wings_3pc_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "3 Pc Wings (1 Dip) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 20.48,
        "cost": 20.48
      },
      {
        "id": "ri_m_wings_3pc_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 6.3,
        "cost": 6.3
      },
      {
        "id": "ri_m_wings_3pc_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 4.72,
        "cost": 4.72
      }
    ]
  },
  {
    "id": "r_m_wings_6pc",
    "menuItemId": "m_wings_6pc",
    "menuItemName": "6 Pc Wings (2 Dips)",
    "name": "RECIPE - 6 PC WINGS (2 DIPS)",
    "description": "Standard recipe for 6 Pc Wings (2 Dips) (Price RS 180/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 40.95,
    "pmCost": 12.6,
    "labourCost": 9.45,
    "calculatedCost": 63.0,
    "sellingPrice": 180.0,
    "ingredients": [
      {
        "id": "ri_m_wings_6pc_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "6 Pc Wings (2 Dips) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 40.95,
        "cost": 40.95
      },
      {
        "id": "ri_m_wings_6pc_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 12.6,
        "cost": 12.6
      },
      {
        "id": "ri_m_wings_6pc_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 9.45,
        "cost": 9.45
      }
    ]
  },
  {
    "id": "r_m_wings_9pc",
    "menuItemId": "m_wings_9pc",
    "menuItemName": "9 Pc Wings (3 Dips)",
    "name": "RECIPE - 9 PC WINGS (3 DIPS)",
    "description": "Standard recipe for 9 Pc Wings (3 Dips) (Price RS 270/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 61.43,
    "pmCost": 18.9,
    "labourCost": 14.17,
    "calculatedCost": 94.5,
    "sellingPrice": 270.0,
    "ingredients": [
      {
        "id": "ri_m_wings_9pc_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "9 Pc Wings (3 Dips) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 61.43,
        "cost": 61.43
      },
      {
        "id": "ri_m_wings_9pc_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 18.9,
        "cost": 18.9
      },
      {
        "id": "ri_m_wings_9pc_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 14.17,
        "cost": 14.17
      }
    ]
  },
  {
    "id": "r_m_wings_20pc",
    "menuItemId": "m_wings_20pc",
    "menuItemName": "20 Pc Wings (6 Dips)",
    "name": "RECIPE - 20 PC WINGS (6 DIPS)",
    "description": "Standard recipe for 20 Pc Wings (6 Dips) (Price RS 600/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 136.5,
    "pmCost": 42.0,
    "labourCost": 31.5,
    "calculatedCost": 210.0,
    "sellingPrice": 600.0,
    "ingredients": [
      {
        "id": "ri_m_wings_20pc_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "20 Pc Wings (6 Dips) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 136.5,
        "cost": 136.5
      },
      {
        "id": "ri_m_wings_20pc_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 42.0,
        "cost": 42.0
      },
      {
        "id": "ri_m_wings_20pc_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 31.5,
        "cost": 31.5
      }
    ]
  },
  {
    "id": "r_m_strips_3pc",
    "menuItemId": "m_strips_3pc",
    "menuItemName": "3 Pc Strips (1 Dip)",
    "name": "RECIPE - 3 PC STRIPS (1 DIP)",
    "description": "Standard recipe for 3 Pc Strips (1 Dip) (Price RS 120/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 27.3,
    "pmCost": 8.4,
    "labourCost": 6.3,
    "calculatedCost": 42.0,
    "sellingPrice": 120.0,
    "ingredients": [
      {
        "id": "ri_m_strips_3pc_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "3 Pc Strips (1 Dip) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 27.3,
        "cost": 27.3
      },
      {
        "id": "ri_m_strips_3pc_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 8.4,
        "cost": 8.4
      },
      {
        "id": "ri_m_strips_3pc_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 6.3,
        "cost": 6.3
      }
    ]
  },
  {
    "id": "r_m_strips_6pc",
    "menuItemId": "m_strips_6pc",
    "menuItemName": "6 Pc Strips (2 Dips)",
    "name": "RECIPE - 6 PC STRIPS (2 DIPS)",
    "description": "Standard recipe for 6 Pc Strips (2 Dips) (Price RS 240/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 54.6,
    "pmCost": 16.8,
    "labourCost": 12.6,
    "calculatedCost": 84.0,
    "sellingPrice": 240.0,
    "ingredients": [
      {
        "id": "ri_m_strips_6pc_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "6 Pc Strips (2 Dips) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 54.6,
        "cost": 54.6
      },
      {
        "id": "ri_m_strips_6pc_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 16.8,
        "cost": 16.8
      },
      {
        "id": "ri_m_strips_6pc_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 12.6,
        "cost": 12.6
      }
    ]
  },
  {
    "id": "r_m_strips_9pc",
    "menuItemId": "m_strips_9pc",
    "menuItemName": "9 Pc Strips (3 Dips)",
    "name": "RECIPE - 9 PC STRIPS (3 DIPS)",
    "description": "Standard recipe for 9 Pc Strips (3 Dips) (Price RS 360/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 81.9,
    "pmCost": 25.2,
    "labourCost": 18.9,
    "calculatedCost": 126.0,
    "sellingPrice": 360.0,
    "ingredients": [
      {
        "id": "ri_m_strips_9pc_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "9 Pc Strips (3 Dips) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 81.9,
        "cost": 81.9
      },
      {
        "id": "ri_m_strips_9pc_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 25.2,
        "cost": 25.2
      },
      {
        "id": "ri_m_strips_9pc_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 18.9,
        "cost": 18.9
      }
    ]
  },
  {
    "id": "r_m_strips_20pc",
    "menuItemId": "m_strips_20pc",
    "menuItemName": "20 Pc Strips (6 Dips)",
    "name": "RECIPE - 20 PC STRIPS (6 DIPS)",
    "description": "Standard recipe for 20 Pc Strips (6 Dips) (Price RS 800/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 182.0,
    "pmCost": 56.0,
    "labourCost": 42.0,
    "calculatedCost": 280.0,
    "sellingPrice": 800.0,
    "ingredients": [
      {
        "id": "ri_m_strips_20pc_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "20 Pc Strips (6 Dips) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 182.0,
        "cost": 182.0
      },
      {
        "id": "ri_m_strips_20pc_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 56.0,
        "cost": 56.0
      },
      {
        "id": "ri_m_strips_20pc_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 42.0,
        "cost": 42.0
      }
    ]
  },
  {
    "id": "r_m_fries_std",
    "menuItemId": "m_fries_std",
    "menuItemName": "Fries (Salted, Peri Peri or Cajun)",
    "name": "RECIPE - FRIES (SALTED, PERI PERI OR CAJUN)",
    "description": "Standard recipe for Fries (Salted, Peri Peri or Cajun) (Price RS 99/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 22.52,
    "pmCost": 6.93,
    "labourCost": 5.2,
    "calculatedCost": 34.65,
    "sellingPrice": 99.0,
    "ingredients": [
      {
        "id": "ri_m_fries_std_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Fries (Salted, Peri Peri or Cajun) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 22.52,
        "cost": 22.52
      },
      {
        "id": "ri_m_fries_std_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 6.93,
        "cost": 6.93
      },
      {
        "id": "ri_m_fries_std_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 5.2,
        "cost": 5.2
      }
    ]
  },
  {
    "id": "r_m_loaded_fries",
    "menuItemId": "m_loaded_fries",
    "menuItemName": "Loaded Fries",
    "name": "RECIPE - LOADED FRIES",
    "description": "Standard recipe for Loaded Fries (Price RS 199/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 45.27,
    "pmCost": 13.93,
    "labourCost": 10.45,
    "calculatedCost": 69.65,
    "sellingPrice": 199.0,
    "ingredients": [
      {
        "id": "ri_m_loaded_fries_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Loaded Fries Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 45.27,
        "cost": 45.27
      },
      {
        "id": "ri_m_loaded_fries_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 13.93,
        "cost": 13.93
      },
      {
        "id": "ri_m_loaded_fries_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 10.45,
        "cost": 10.45
      }
    ]
  },
  {
    "id": "r_m_rice_bowl",
    "menuItemId": "m_rice_bowl",
    "menuItemName": "Rice Bowl (Signature)",
    "name": "RECIPE - RICE BOWL (SIGNATURE)",
    "description": "Standard recipe for Rice Bowl (Signature) (Price RS 199/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 45.27,
    "pmCost": 13.93,
    "labourCost": 10.45,
    "calculatedCost": 69.65,
    "sellingPrice": 199.0,
    "ingredients": [
      {
        "id": "ri_m_rice_bowl_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Rice Bowl (Signature) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 45.27,
        "cost": 45.27
      },
      {
        "id": "ri_m_rice_bowl_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 13.93,
        "cost": 13.93
      },
      {
        "id": "ri_m_rice_bowl_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 10.45,
        "cost": 10.45
      }
    ]
  },
  {
    "id": "r_m_signature_salad",
    "menuItemId": "m_signature_salad",
    "menuItemName": "Signature Salad",
    "name": "RECIPE - SIGNATURE SALAD",
    "description": "Standard recipe for Signature Salad (Price RS 149/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 33.9,
    "pmCost": 10.43,
    "labourCost": 7.82,
    "calculatedCost": 52.15,
    "sellingPrice": 149.0,
    "ingredients": [
      {
        "id": "ri_m_signature_salad_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Signature Salad Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 33.9,
        "cost": 33.9
      },
      {
        "id": "ri_m_signature_salad_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 10.43,
        "cost": 10.43
      },
      {
        "id": "ri_m_signature_salad_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 7.82,
        "cost": 7.82
      }
    ]
  },
  {
    "id": "r_m_sprite_reg",
    "menuItemId": "m_sprite_reg",
    "menuItemName": "Sprite (Regular)",
    "name": "RECIPE - SPRITE (REGULAR)",
    "description": "Standard recipe for Sprite (Regular) (Price RS 59/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 13.42,
    "pmCost": 4.13,
    "labourCost": 3.1,
    "calculatedCost": 20.65,
    "sellingPrice": 59.0,
    "ingredients": [
      {
        "id": "ri_m_sprite_reg_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Sprite (Regular) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 13.42,
        "cost": 13.42
      },
      {
        "id": "ri_m_sprite_reg_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 4.13,
        "cost": 4.13
      },
      {
        "id": "ri_m_sprite_reg_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 3.1,
        "cost": 3.1
      }
    ]
  },
  {
    "id": "r_m_sprite_lrg",
    "menuItemId": "m_sprite_lrg",
    "menuItemName": "Sprite (Large)",
    "name": "RECIPE - SPRITE (LARGE)",
    "description": "Standard recipe for Sprite (Large) (Price RS 99/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 22.52,
    "pmCost": 6.93,
    "labourCost": 5.2,
    "calculatedCost": 34.65,
    "sellingPrice": 99.0,
    "ingredients": [
      {
        "id": "ri_m_sprite_lrg_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Sprite (Large) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 22.52,
        "cost": 22.52
      },
      {
        "id": "ri_m_sprite_lrg_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 6.93,
        "cost": 6.93
      },
      {
        "id": "ri_m_sprite_lrg_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 5.2,
        "cost": 5.2
      }
    ]
  },
  {
    "id": "r_m_cocacola_reg",
    "menuItemId": "m_cocacola_reg",
    "menuItemName": "Coca Cola (Regular)",
    "name": "RECIPE - COCA COLA (REGULAR)",
    "description": "Standard recipe for Coca Cola (Regular) (Price RS 59/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 13.42,
    "pmCost": 4.13,
    "labourCost": 3.1,
    "calculatedCost": 20.65,
    "sellingPrice": 59.0,
    "ingredients": [
      {
        "id": "ri_m_cocacola_reg_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Coca Cola (Regular) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 13.42,
        "cost": 13.42
      },
      {
        "id": "ri_m_cocacola_reg_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 4.13,
        "cost": 4.13
      },
      {
        "id": "ri_m_cocacola_reg_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 3.1,
        "cost": 3.1
      }
    ]
  },
  {
    "id": "r_m_cocacola_lrg",
    "menuItemId": "m_cocacola_lrg",
    "menuItemName": "Coca Cola (Large)",
    "name": "RECIPE - COCA COLA (LARGE)",
    "description": "Standard recipe for Coca Cola (Large) (Price RS 99/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 22.52,
    "pmCost": 6.93,
    "labourCost": 5.2,
    "calculatedCost": 34.65,
    "sellingPrice": 99.0,
    "ingredients": [
      {
        "id": "ri_m_cocacola_lrg_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Coca Cola (Large) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 22.52,
        "cost": 22.52
      },
      {
        "id": "ri_m_cocacola_lrg_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 6.93,
        "cost": 6.93
      },
      {
        "id": "ri_m_cocacola_lrg_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 5.2,
        "cost": 5.2
      }
    ]
  },
  {
    "id": "r_m_icetea_reg",
    "menuItemId": "m_icetea_reg",
    "menuItemName": "Ice Tea (Regular)",
    "name": "RECIPE - ICE TEA (REGULAR)",
    "description": "Standard recipe for Ice Tea (Regular) (Price RS 59/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 13.42,
    "pmCost": 4.13,
    "labourCost": 3.1,
    "calculatedCost": 20.65,
    "sellingPrice": 59.0,
    "ingredients": [
      {
        "id": "ri_m_icetea_reg_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Ice Tea (Regular) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 13.42,
        "cost": 13.42
      },
      {
        "id": "ri_m_icetea_reg_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 4.13,
        "cost": 4.13
      },
      {
        "id": "ri_m_icetea_reg_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 3.1,
        "cost": 3.1
      }
    ]
  },
  {
    "id": "r_m_icetea_lrg",
    "menuItemId": "m_icetea_lrg",
    "menuItemName": "Ice Tea (Large)",
    "name": "RECIPE - ICE TEA (LARGE)",
    "description": "Standard recipe for Ice Tea (Large) (Price RS 99/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 22.52,
    "pmCost": 6.93,
    "labourCost": 5.2,
    "calculatedCost": 34.65,
    "sellingPrice": 99.0,
    "ingredients": [
      {
        "id": "ri_m_icetea_lrg_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Ice Tea (Large) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 22.52,
        "cost": 22.52
      },
      {
        "id": "ri_m_icetea_lrg_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 6.93,
        "cost": 6.93
      },
      {
        "id": "ri_m_icetea_lrg_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 5.2,
        "cost": 5.2
      }
    ]
  },
  {
    "id": "r_m_hot_chocolate",
    "menuItemId": "m_hot_chocolate",
    "menuItemName": "Hot Chocolate",
    "name": "RECIPE - HOT CHOCOLATE",
    "description": "Standard recipe for Hot Chocolate (Price RS 99/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 22.52,
    "pmCost": 6.93,
    "labourCost": 5.2,
    "calculatedCost": 34.65,
    "sellingPrice": 99.0,
    "ingredients": [
      {
        "id": "ri_m_hot_chocolate_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Hot Chocolate Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 22.52,
        "cost": 22.52
      },
      {
        "id": "ri_m_hot_chocolate_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 6.93,
        "cost": 6.93
      },
      {
        "id": "ri_m_hot_chocolate_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 5.2,
        "cost": 5.2
      }
    ]
  },
  {
    "id": "r_m_signature_tea",
    "menuItemId": "m_signature_tea",
    "menuItemName": "Signature Tea",
    "name": "RECIPE - SIGNATURE TEA",
    "description": "Standard recipe for Signature Tea (Price RS 99/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 22.52,
    "pmCost": 6.93,
    "labourCost": 5.2,
    "calculatedCost": 34.65,
    "sellingPrice": 99.0,
    "ingredients": [
      {
        "id": "ri_m_signature_tea_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Signature Tea Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 22.52,
        "cost": 22.52
      },
      {
        "id": "ri_m_signature_tea_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 6.93,
        "cost": 6.93
      },
      {
        "id": "ri_m_signature_tea_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 5.2,
        "cost": 5.2
      }
    ]
  },
  {
    "id": "r_m_express_meal",
    "menuItemId": "m_express_meal",
    "menuItemName": "Express Meal",
    "name": "RECIPE - EXPRESS MEAL",
    "description": "Standard recipe for Express Meal (Price RS 249/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 56.65,
    "pmCost": 17.43,
    "labourCost": 13.07,
    "calculatedCost": 87.15,
    "sellingPrice": 249.0,
    "ingredients": [
      {
        "id": "ri_m_express_meal_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Express Meal Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 56.65,
        "cost": 56.65
      },
      {
        "id": "ri_m_express_meal_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 17.43,
        "cost": 17.43
      },
      {
        "id": "ri_m_express_meal_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 13.07,
        "cost": 13.07
      }
    ]
  },
  {
    "id": "r_m_sig_gyro_meal",
    "menuItemId": "m_sig_gyro_meal",
    "menuItemName": "Signature Gyro Meal",
    "name": "RECIPE - SIGNATURE GYRO MEAL",
    "description": "Standard recipe for Signature Gyro Meal (Price RS 279/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 63.47,
    "pmCost": 19.53,
    "labourCost": 14.65,
    "calculatedCost": 97.65,
    "sellingPrice": 279.0,
    "ingredients": [
      {
        "id": "ri_m_sig_gyro_meal_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Signature Gyro Meal Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 63.47,
        "cost": 63.47
      },
      {
        "id": "ri_m_sig_gyro_meal_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 19.53,
        "cost": 19.53
      },
      {
        "id": "ri_m_sig_gyro_meal_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 14.65,
        "cost": 14.65
      }
    ]
  },
  {
    "id": "r_m_lebanese_rice_box",
    "menuItemId": "m_lebanese_rice_box",
    "menuItemName": "Lebanese Rice Box",
    "name": "RECIPE - LEBANESE RICE BOX",
    "description": "Standard recipe for Lebanese Rice Box (Price RS 299/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 68.02,
    "pmCost": 20.93,
    "labourCost": 15.7,
    "calculatedCost": 104.65,
    "sellingPrice": 299.0,
    "ingredients": [
      {
        "id": "ri_m_lebanese_rice_box_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Lebanese Rice Box Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 68.02,
        "cost": 68.02
      },
      {
        "id": "ri_m_lebanese_rice_box_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 20.93,
        "cost": 20.93
      },
      {
        "id": "ri_m_lebanese_rice_box_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 15.7,
        "cost": 15.7
      }
    ]
  },
  {
    "id": "r_m_classic_gyro_meal",
    "menuItemId": "m_classic_gyro_meal",
    "menuItemName": "Classic Gyro Meal",
    "name": "RECIPE - CLASSIC GYRO MEAL",
    "description": "Standard recipe for Classic Gyro Meal (Price RS 349/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 79.4,
    "pmCost": 24.43,
    "labourCost": 18.32,
    "calculatedCost": 122.15,
    "sellingPrice": 349.0,
    "ingredients": [
      {
        "id": "ri_m_classic_gyro_meal_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Classic Gyro Meal Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 79.4,
        "cost": 79.4
      },
      {
        "id": "ri_m_classic_gyro_meal_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 24.43,
        "cost": 24.43
      },
      {
        "id": "ri_m_classic_gyro_meal_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 18.32,
        "cost": 18.32
      }
    ]
  },
  {
    "id": "r_m_duo_gyro_feast",
    "menuItemId": "m_duo_gyro_feast",
    "menuItemName": "Duo Gyro Feast",
    "name": "RECIPE - DUO GYRO FEAST",
    "description": "Standard recipe for Duo Gyro Feast (Price RS 449/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 102.15,
    "pmCost": 31.43,
    "labourCost": 23.57,
    "calculatedCost": 157.15,
    "sellingPrice": 449.0,
    "ingredients": [
      {
        "id": "ri_m_duo_gyro_feast_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Duo Gyro Feast Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 102.15,
        "cost": 102.15
      },
      {
        "id": "ri_m_duo_gyro_feast_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 31.43,
        "cost": 31.43
      },
      {
        "id": "ri_m_duo_gyro_feast_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 23.57,
        "cost": 23.57
      }
    ]
  },
  {
    "id": "r_m_double_crunch_box",
    "menuItemId": "m_double_crunch_box",
    "menuItemName": "Double Crunch Box",
    "name": "RECIPE - DOUBLE CRUNCH BOX",
    "description": "Standard recipe for Double Crunch Box (Price RS 699/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 159.02,
    "pmCost": 48.93,
    "labourCost": 36.7,
    "calculatedCost": 244.65,
    "sellingPrice": 699.0,
    "ingredients": [
      {
        "id": "ri_m_double_crunch_box_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Double Crunch Box Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 159.02,
        "cost": 159.02
      },
      {
        "id": "ri_m_double_crunch_box_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 48.93,
        "cost": 48.93
      },
      {
        "id": "ri_m_double_crunch_box_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 36.7,
        "cost": 36.7
      }
    ]
  },
  {
    "id": "r_m_mega_feast_meal",
    "menuItemId": "m_mega_feast_meal",
    "menuItemName": "Mega Feast Meal",
    "name": "RECIPE - MEGA FEAST MEAL",
    "description": "Standard recipe for Mega Feast Meal (Price RS 799/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 181.77,
    "pmCost": 55.93,
    "labourCost": 41.95,
    "calculatedCost": 279.65,
    "sellingPrice": 799.0,
    "ingredients": [
      {
        "id": "ri_m_mega_feast_meal_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Mega Feast Meal Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 181.77,
        "cost": 181.77
      },
      {
        "id": "ri_m_mega_feast_meal_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 55.93,
        "cost": 55.93
      },
      {
        "id": "ri_m_mega_feast_meal_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 41.95,
        "cost": 41.95
      }
    ]
  },
  {
    "id": "r_m_dens_party_meal",
    "menuItemId": "m_dens_party_meal",
    "menuItemName": "Den's Party Meal",
    "name": "RECIPE - DEN'S PARTY MEAL",
    "description": "Standard recipe for Den's Party Meal (Price RS 1049/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 238.65,
    "pmCost": 73.43,
    "labourCost": 55.07,
    "calculatedCost": 367.15,
    "sellingPrice": 1049.0,
    "ingredients": [
      {
        "id": "ri_m_dens_party_meal_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Den's Party Meal Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 238.65,
        "cost": 238.65
      },
      {
        "id": "ri_m_dens_party_meal_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 73.43,
        "cost": 73.43
      },
      {
        "id": "ri_m_dens_party_meal_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 55.07,
        "cost": 55.07
      }
    ]
  },
  {
    "id": "r_m_super5_bucket",
    "menuItemId": "m_super5_bucket",
    "menuItemName": "Super 5 Bucket",
    "name": "RECIPE - SUPER 5 BUCKET",
    "description": "Standard recipe for Super 5 Bucket (Price RS 1299/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 295.52,
    "pmCost": 90.93,
    "labourCost": 68.2,
    "calculatedCost": 454.65,
    "sellingPrice": 1299.0,
    "ingredients": [
      {
        "id": "ri_m_super5_bucket_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Super 5 Bucket Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 295.52,
        "cost": 295.52
      },
      {
        "id": "ri_m_super5_bucket_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 90.93,
        "cost": 90.93
      },
      {
        "id": "ri_m_super5_bucket_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 68.2,
        "cost": 68.2
      }
    ]
  },
  {
    "id": "r_m_pmax_gyro",
    "menuItemId": "m_pmax_gyro",
    "menuItemName": "Protein Max Gyro",
    "name": "RECIPE - PROTEIN MAX GYRO",
    "description": "Standard recipe for Protein Max Gyro (Price RS 299/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 68.02,
    "pmCost": 20.93,
    "labourCost": 15.7,
    "calculatedCost": 104.65,
    "sellingPrice": 299.0,
    "ingredients": [
      {
        "id": "ri_m_pmax_gyro_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Protein Max Gyro Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 68.02,
        "cost": 68.02
      },
      {
        "id": "ri_m_pmax_gyro_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 20.93,
        "cost": 20.93
      },
      {
        "id": "ri_m_pmax_gyro_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 15.7,
        "cost": 15.7
      }
    ]
  },
  {
    "id": "r_m_pmax_rice",
    "menuItemId": "m_pmax_rice",
    "menuItemName": "Protein Max Rice Bowl",
    "name": "RECIPE - PROTEIN MAX RICE BOWL",
    "description": "Standard recipe for Protein Max Rice Bowl (Price RS 299/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 68.02,
    "pmCost": 20.93,
    "labourCost": 15.7,
    "calculatedCost": 104.65,
    "sellingPrice": 299.0,
    "ingredients": [
      {
        "id": "ri_m_pmax_rice_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Protein Max Rice Bowl Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 68.02,
        "cost": 68.02
      },
      {
        "id": "ri_m_pmax_rice_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 20.93,
        "cost": 20.93
      },
      {
        "id": "ri_m_pmax_rice_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 15.7,
        "cost": 15.7
      }
    ]
  },
  {
    "id": "r_m_pmax_salad",
    "menuItemId": "m_pmax_salad",
    "menuItemName": "Protein Max Salad",
    "name": "RECIPE - PROTEIN MAX SALAD",
    "description": "Standard recipe for Protein Max Salad (Price RS 299/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 68.02,
    "pmCost": 20.93,
    "labourCost": 15.7,
    "calculatedCost": 104.65,
    "sellingPrice": 299.0,
    "ingredients": [
      {
        "id": "ri_m_pmax_salad_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Protein Max Salad Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 68.02,
        "cost": 68.02
      },
      {
        "id": "ri_m_pmax_salad_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 20.93,
        "cost": 20.93
      },
      {
        "id": "ri_m_pmax_salad_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 15.7,
        "cost": 15.7
      }
    ]
  },
  {
    "id": "r_m_vanilla_shake_reg",
    "menuItemId": "m_vanilla_shake_reg",
    "menuItemName": "Vanilla Shake (Regular)",
    "name": "RECIPE - VANILLA SHAKE (REGULAR)",
    "description": "Standard recipe for Vanilla Shake (Regular) (Price RS 120/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 27.3,
    "pmCost": 8.4,
    "labourCost": 6.3,
    "calculatedCost": 42.0,
    "sellingPrice": 120.0,
    "ingredients": [
      {
        "id": "ri_m_vanilla_shake_reg_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Vanilla Shake (Regular) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 27.3,
        "cost": 27.3
      },
      {
        "id": "ri_m_vanilla_shake_reg_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 8.4,
        "cost": 8.4
      },
      {
        "id": "ri_m_vanilla_shake_reg_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 6.3,
        "cost": 6.3
      }
    ]
  },
  {
    "id": "r_m_vanilla_shake_lrg",
    "menuItemId": "m_vanilla_shake_lrg",
    "menuItemName": "Vanilla Shake (Large)",
    "name": "RECIPE - VANILLA SHAKE (LARGE)",
    "description": "Standard recipe for Vanilla Shake (Large) (Price RS 199/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 45.27,
    "pmCost": 13.93,
    "labourCost": 10.45,
    "calculatedCost": 69.65,
    "sellingPrice": 199.0,
    "ingredients": [
      {
        "id": "ri_m_vanilla_shake_lrg_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Vanilla Shake (Large) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 45.27,
        "cost": 45.27
      },
      {
        "id": "ri_m_vanilla_shake_lrg_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 13.93,
        "cost": 13.93
      },
      {
        "id": "ri_m_vanilla_shake_lrg_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 10.45,
        "cost": 10.45
      }
    ]
  },
  {
    "id": "r_m_strawberry_shake_reg",
    "menuItemId": "m_strawberry_shake_reg",
    "menuItemName": "Strawberry Shake (Regular)",
    "name": "RECIPE - STRAWBERRY SHAKE (REGULAR)",
    "description": "Standard recipe for Strawberry Shake (Regular) (Price RS 120/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 27.3,
    "pmCost": 8.4,
    "labourCost": 6.3,
    "calculatedCost": 42.0,
    "sellingPrice": 120.0,
    "ingredients": [
      {
        "id": "ri_m_strawberry_shake_reg_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Strawberry Shake (Regular) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 27.3,
        "cost": 27.3
      },
      {
        "id": "ri_m_strawberry_shake_reg_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 8.4,
        "cost": 8.4
      },
      {
        "id": "ri_m_strawberry_shake_reg_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 6.3,
        "cost": 6.3
      }
    ]
  },
  {
    "id": "r_m_strawberry_shake_lrg",
    "menuItemId": "m_strawberry_shake_lrg",
    "menuItemName": "Strawberry Shake (Large)",
    "name": "RECIPE - STRAWBERRY SHAKE (LARGE)",
    "description": "Standard recipe for Strawberry Shake (Large) (Price RS 199/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 45.27,
    "pmCost": 13.93,
    "labourCost": 10.45,
    "calculatedCost": 69.65,
    "sellingPrice": 199.0,
    "ingredients": [
      {
        "id": "ri_m_strawberry_shake_lrg_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Strawberry Shake (Large) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 45.27,
        "cost": 45.27
      },
      {
        "id": "ri_m_strawberry_shake_lrg_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 13.93,
        "cost": 13.93
      },
      {
        "id": "ri_m_strawberry_shake_lrg_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 10.45,
        "cost": 10.45
      }
    ]
  },
  {
    "id": "r_m_biscoff_shake_reg",
    "menuItemId": "m_biscoff_shake_reg",
    "menuItemName": "Biscoff Shake (Regular)",
    "name": "RECIPE - BISCOFF SHAKE (REGULAR)",
    "description": "Standard recipe for Biscoff Shake (Regular) (Price RS 120/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 27.3,
    "pmCost": 8.4,
    "labourCost": 6.3,
    "calculatedCost": 42.0,
    "sellingPrice": 120.0,
    "ingredients": [
      {
        "id": "ri_m_biscoff_shake_reg_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Biscoff Shake (Regular) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 27.3,
        "cost": 27.3
      },
      {
        "id": "ri_m_biscoff_shake_reg_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 8.4,
        "cost": 8.4
      },
      {
        "id": "ri_m_biscoff_shake_reg_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 6.3,
        "cost": 6.3
      }
    ]
  },
  {
    "id": "r_m_biscoff_shake_lrg",
    "menuItemId": "m_biscoff_shake_lrg",
    "menuItemName": "Biscoff Shake (Large)",
    "name": "RECIPE - BISCOFF SHAKE (LARGE)",
    "description": "Standard recipe for Biscoff Shake (Large) (Price RS 199/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 45.27,
    "pmCost": 13.93,
    "labourCost": 10.45,
    "calculatedCost": 69.65,
    "sellingPrice": 199.0,
    "ingredients": [
      {
        "id": "ri_m_biscoff_shake_lrg_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Biscoff Shake (Large) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 45.27,
        "cost": 45.27
      },
      {
        "id": "ri_m_biscoff_shake_lrg_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 13.93,
        "cost": 13.93
      },
      {
        "id": "ri_m_biscoff_shake_lrg_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 10.45,
        "cost": 10.45
      }
    ]
  },
  {
    "id": "r_m_chocolate_shake_reg",
    "menuItemId": "m_chocolate_shake_reg",
    "menuItemName": "Chocolate Shake (Regular)",
    "name": "RECIPE - CHOCOLATE SHAKE (REGULAR)",
    "description": "Standard recipe for Chocolate Shake (Regular) (Price RS 120/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 27.3,
    "pmCost": 8.4,
    "labourCost": 6.3,
    "calculatedCost": 42.0,
    "sellingPrice": 120.0,
    "ingredients": [
      {
        "id": "ri_m_chocolate_shake_reg_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Chocolate Shake (Regular) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 27.3,
        "cost": 27.3
      },
      {
        "id": "ri_m_chocolate_shake_reg_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 8.4,
        "cost": 8.4
      },
      {
        "id": "ri_m_chocolate_shake_reg_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 6.3,
        "cost": 6.3
      }
    ]
  },
  {
    "id": "r_m_chocolate_shake_lrg",
    "menuItemId": "m_chocolate_shake_lrg",
    "menuItemName": "Chocolate Shake (Large)",
    "name": "RECIPE - CHOCOLATE SHAKE (LARGE)",
    "description": "Standard recipe for Chocolate Shake (Large) (Price RS 199/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 45.27,
    "pmCost": 13.93,
    "labourCost": 10.45,
    "calculatedCost": 69.65,
    "sellingPrice": 199.0,
    "ingredients": [
      {
        "id": "ri_m_chocolate_shake_lrg_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Chocolate Shake (Large) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 45.27,
        "cost": 45.27
      },
      {
        "id": "ri_m_chocolate_shake_lrg_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 13.93,
        "cost": 13.93
      },
      {
        "id": "ri_m_chocolate_shake_lrg_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 10.45,
        "cost": 10.45
      }
    ]
  },
  {
    "id": "r_m_kunafa_shake_reg",
    "menuItemId": "m_kunafa_shake_reg",
    "menuItemName": "Kunafa Pistachio Shake - Signature (Regular)",
    "name": "RECIPE - KUNAFA PISTACHIO SHAKE - SIGNATURE (REGULAR)",
    "description": "Standard recipe for Kunafa Pistachio Shake - Signature (Regular) (Price RS 120/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 27.3,
    "pmCost": 8.4,
    "labourCost": 6.3,
    "calculatedCost": 42.0,
    "sellingPrice": 120.0,
    "ingredients": [
      {
        "id": "ri_m_kunafa_shake_reg_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Kunafa Pistachio Shake - Signature (Regular) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 27.3,
        "cost": 27.3
      },
      {
        "id": "ri_m_kunafa_shake_reg_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 8.4,
        "cost": 8.4
      },
      {
        "id": "ri_m_kunafa_shake_reg_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 6.3,
        "cost": 6.3
      }
    ]
  },
  {
    "id": "r_m_kunafa_shake_lrg",
    "menuItemId": "m_kunafa_shake_lrg",
    "menuItemName": "Kunafa Pistachio Shake - Signature (Large)",
    "name": "RECIPE - KUNAFA PISTACHIO SHAKE - SIGNATURE (LARGE)",
    "description": "Standard recipe for Kunafa Pistachio Shake - Signature (Large) (Price RS 199/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 45.27,
    "pmCost": 13.93,
    "labourCost": 10.45,
    "calculatedCost": 69.65,
    "sellingPrice": 199.0,
    "ingredients": [
      {
        "id": "ri_m_kunafa_shake_lrg_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Kunafa Pistachio Shake - Signature (Large) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 45.27,
        "cost": 45.27
      },
      {
        "id": "ri_m_kunafa_shake_lrg_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 13.93,
        "cost": 13.93
      },
      {
        "id": "ri_m_kunafa_shake_lrg_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 10.45,
        "cost": 10.45
      }
    ]
  },
  {
    "id": "r_m_brownie",
    "menuItemId": "m_brownie",
    "menuItemName": "Chocolate Brownie",
    "name": "RECIPE - CHOCOLATE BROWNIE",
    "description": "Standard recipe for Chocolate Brownie (Price RS 99/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 22.52,
    "pmCost": 6.93,
    "labourCost": 5.2,
    "calculatedCost": 34.65,
    "sellingPrice": 99.0,
    "ingredients": [
      {
        "id": "ri_m_brownie_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Chocolate Brownie Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 22.52,
        "cost": 22.52
      },
      {
        "id": "ri_m_brownie_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 6.93,
        "cost": 6.93
      },
      {
        "id": "ri_m_brownie_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 5.2,
        "cost": 5.2
      }
    ]
  },
  {
    "id": "r_m_blondie",
    "menuItemId": "m_blondie",
    "menuItemName": "Blondie Cake (Signature)",
    "name": "RECIPE - BLONDIE CAKE (SIGNATURE)",
    "description": "Standard recipe for Blondie Cake (Signature) (Price RS 99/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 22.52,
    "pmCost": 6.93,
    "labourCost": 5.2,
    "calculatedCost": 34.65,
    "sellingPrice": 99.0,
    "ingredients": [
      {
        "id": "ri_m_blondie_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Blondie Cake (Signature) Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 22.52,
        "cost": 22.52
      },
      {
        "id": "ri_m_blondie_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 6.93,
        "cost": 6.93
      },
      {
        "id": "ri_m_blondie_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 5.2,
        "cost": 5.2
      }
    ]
  },
  {
    "id": "r_m_vanilla_softy",
    "menuItemId": "m_vanilla_softy",
    "menuItemName": "Vanilla Softy",
    "name": "RECIPE - VANILLA SOFTY",
    "description": "Standard recipe for Vanilla Softy (Price RS 39/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 8.87,
    "pmCost": 2.73,
    "labourCost": 2.05,
    "calculatedCost": 13.65,
    "sellingPrice": 39.0,
    "ingredients": [
      {
        "id": "ri_m_vanilla_softy_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Vanilla Softy Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 8.87,
        "cost": 8.87
      },
      {
        "id": "ri_m_vanilla_softy_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 2.73,
        "cost": 2.73
      },
      {
        "id": "ri_m_vanilla_softy_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 2.05,
        "cost": 2.05
      }
    ]
  },
  {
    "id": "r_m_dip_choice",
    "menuItemId": "m_dip_choice",
    "menuItemName": "Choice of Dip",
    "name": "RECIPE - CHOICE OF DIP",
    "description": "Standard recipe for Choice of Dip (Price RS 15/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 3.41,
    "pmCost": 1.05,
    "labourCost": 0.79,
    "calculatedCost": 5.25,
    "sellingPrice": 15.0,
    "ingredients": [
      {
        "id": "ri_m_dip_choice_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Choice of Dip Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 3.41,
        "cost": 3.41
      },
      {
        "id": "ri_m_dip_choice_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 1.05,
        "cost": 1.05
      },
      {
        "id": "ri_m_dip_choice_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 0.79,
        "cost": 0.79
      }
    ]
  },
  {
    "id": "r_m_kombucha_mint",
    "menuItemId": "m_kombucha_mint",
    "menuItemName": "Mint Kombucha",
    "name": "RECIPE - MINT KOMBUCHA",
    "description": "Standard recipe for Mint Kombucha (Price RS 120/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 27.3,
    "pmCost": 8.4,
    "labourCost": 6.3,
    "calculatedCost": 42.0,
    "sellingPrice": 120.0,
    "ingredients": [
      {
        "id": "ri_m_kombucha_mint_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Mint Kombucha Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 27.3,
        "cost": 27.3
      },
      {
        "id": "ri_m_kombucha_mint_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 8.4,
        "cost": 8.4
      },
      {
        "id": "ri_m_kombucha_mint_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 6.3,
        "cost": 6.3
      }
    ]
  },
  {
    "id": "r_m_kombucha_hibiscus",
    "menuItemId": "m_kombucha_hibiscus",
    "menuItemName": "Hibiscus Kombucha",
    "name": "RECIPE - HIBISCUS KOMBUCHA",
    "description": "Standard recipe for Hibiscus Kombucha (Price RS 120/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 27.3,
    "pmCost": 8.4,
    "labourCost": 6.3,
    "calculatedCost": 42.0,
    "sellingPrice": 120.0,
    "ingredients": [
      {
        "id": "ri_m_kombucha_hibiscus_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Hibiscus Kombucha Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 27.3,
        "cost": 27.3
      },
      {
        "id": "ri_m_kombucha_hibiscus_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 8.4,
        "cost": 8.4
      },
      {
        "id": "ri_m_kombucha_hibiscus_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 6.3,
        "cost": 6.3
      }
    ]
  },
  {
    "id": "r_m_kombucha_classic",
    "menuItemId": "m_kombucha_classic",
    "menuItemName": "Classic Kombucha",
    "name": "RECIPE - CLASSIC KOMBUCHA",
    "description": "Standard recipe for Classic Kombucha (Price RS 120/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 27.3,
    "pmCost": 8.4,
    "labourCost": 6.3,
    "calculatedCost": 42.0,
    "sellingPrice": 120.0,
    "ingredients": [
      {
        "id": "ri_m_kombucha_classic_1",
        "inventoryItemId": "inv_boneless_chicken",
        "inventoryName": "Classic Kombucha Base Ingredients",
        "quantity": 1.0,
        "unit": "portion",
        "costPerUnit": 27.3,
        "cost": 27.3
      },
      {
        "id": "ri_m_kombucha_classic_2",
        "inventoryItemId": "inv_paper_bag_large",
        "inventoryName": "Packaging",
        "quantity": 1.0,
        "unit": "pc",
        "costPerUnit": 8.4,
        "cost": 8.4
      },
      {
        "id": "ri_m_kombucha_classic_3",
        "inventoryItemId": "inv_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1.0,
        "unit": "unit",
        "costPerUnit": 6.3,
        "cost": 6.3
      }
    ]
  }
]

const API = () => window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin

export default function MenuManagement() {
 const toast = useToast()
 const [categories, setCategories] = useState([])
 const [menuItems, setMenuItems] = useState([])
 const [inventory, setInventory] = useState(sampleInventory)
 const [recipes, setRecipes] = useState(sampleRecipes)
 const [activeTab, setActiveTab] = useState('menu')
 const [showRecipeModal, setShowRecipeModal] = useState(false)
 const [showIngredientModal, setShowIngredientModal] = useState(false)
 const [selectedItem, setSelectedItem] = useState(null)
 const [selectedMenuItem, setSelectedMenuItem] = useState(null)
 const [recipeIngredients, setRecipeIngredients] = useState([])
 const [searchTerm, setSearchTerm] = useState('')
 const [selectedCategory, setSelectedCategory] = useState('all')
 const [showItemModal, setShowItemModal] = useState(false)
 const [showCategoryModal, setShowCategoryModal] = useState(false)
 const [editItemId, setEditItemId] = useState(null)
 const [editCategoryId, setEditCategoryId] = useState(null)
 const [itemForm, setItemForm] = useState({ name: '', price: '', categoryId: '', description: '', isAvailable: true })
 const [catForm, setCatForm] = useState({ name: '', color: '#6b7280' })
 const [imagePreview, setImagePreview] = useState(null)
 const [imageFile, setImageFile] = useState(null)
 const fileInputRef = useRef(null)
 const excelInputRef = useRef(null)

 const handleExcelUpload = async (e) => {
 const file = e.target.files?.[0]
 if (!file) return
 try {
 const XLSX = await import('xlsx')
 const buffer = await file.arrayBuffer()
 const wb = XLSX.read(buffer, { type: 'array' })

 let rawItems = []
 let rawCats = []

 // Try reading 'Menu Items' sheet or first sheet
 const itemsSheetName = wb.SheetNames.find(s => s.toLowerCase().includes('item') || s.toLowerCase().includes('menu')) || wb.SheetNames[0]
 if (itemsSheetName && wb.Sheets[itemsSheetName]) {
 rawItems = XLSX.utils.sheet_to_json(wb.Sheets[itemsSheetName])
 }

 // Try reading 'Categories' sheet
 const catsSheetName = wb.SheetNames.find(s => s.toLowerCase().includes('cat'))
 if (catsSheetName && wb.Sheets[catsSheetName]) {
 rawCats = XLSX.utils.sheet_to_json(wb.Sheets[catsSheetName])
 }

 if (rawItems.length === 0) {
 toast.error('No menu items found in Excel file')
 return
 }

 const body = { items: rawItems, categories: rawCats }
 const res = await fetch(`${API()}/api/admin/menu/import-excel`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(body)
 })

 if (!res.ok) {
 const err = await res.json()
 throw new Error(err.error || 'Import failed')
 }

 const result = await res.json()
 toast.success(`Import successful! (${result.created} created, ${result.updated} updated)`)

 // Refresh state
 const [catRes, itemRes] = await Promise.all([
 fetch(`${API()}/api/admin/menu/categories`).then(r => r.json()),
 fetch(`${API()}/api/admin/menu/items`).then(r => r.json())
 ])
 if (catRes?.length) setCategories(catRes)
 if (itemRes?.length) setMenuItems(itemRes)
 useMenuStore.getState().fetchMenuItems()
 } catch (err) {
 console.error('Excel import error:', err)
 toast.error('Failed to import Excel: ' + (err.message || 'Invalid format'))
 } finally {
 if (e.target) e.target.value = ''
 }
 }

 const handleImageSelect = (e) => {
 const file = e.target.files?.[0]
 if (!file) return
 if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
 setImageFile(file)
 setImagePreview(URL.createObjectURL(file))
 }

 const uploadItemImage = async (itemId) => {
 if (!imageFile) return
 try {
 const r = await fetch(`${API()}/api/admin/menu/items/${itemId}/image`, {
 method: 'POST',
 headers: { 'Content-Type': imageFile.type },
 body: imageFile
 })
 if (!r.ok) throw Error()
 const { image } = await r.json()
 setMenuItems(prev => prev.map(i => i.id === itemId ? { ...i, image } : i))
 setImageFile(null)
 setImagePreview(null)
 } catch { toast.error('Image upload failed') }
 }

 const removeItemImage = async (itemId) => {
 try {
 const r = await fetch(`${API()}/api/admin/menu/items/${itemId}/image`, { method: 'DELETE' })
 if (!r.ok) throw Error()
 setMenuItems(prev => prev.map(i => i.id === itemId ? { ...i, image: null } : i))
 setImageFile(null)
 setImagePreview(null)
 } catch { toast.error('Failed to remove image') }
 }

 const filteredMenuItems = menuItems.filter(item => {
 if (!item) return false
 const nameStr = (item.name || '').toLowerCase()
 const searchStr = (searchTerm || '').toLowerCase()
 const matchesSearch = nameStr.includes(searchStr)
 const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory
 return matchesSearch && matchesCategory
 })

 const getRecipeForItem = (menuItemId) => {
 const item = menuItems.find(m => m.id === menuItemId)
 const itemName = item?.name || ''
 return recipes.find(r => r && (
 r.menuItemId === menuItemId || 
 (itemName && (r.menuItemName === itemName || r.name === `${itemName} Recipe` || (r.name && r.name.startsWith(itemName))))
 ))
 }

 const getItemCost = (menuItemId) => {
 const recipe = getRecipeForItem(menuItemId)
 if (!recipe) return null
 if (recipe.calculatedCost) return recipe.calculatedCost
 return recipe.ingredients.reduce((sum, ing) => {
 if (ing.cost) return sum + ing.cost
 return sum + (ing.quantity * (inventory.find(i => i.id === ing.inventoryItemId)?.costPerUnit || 0))
 }, 0)
 }

 const getItemProfit = (menuItemId) => {
 const item = menuItems.find(m => m.id === menuItemId)
 const cost = getItemCost(menuItemId)
 if (!item || cost === null) return null
 return item.price - cost
 }

 const getItemMargin = (menuItemId) => {
 const item = menuItems.find(m => m.id === menuItemId)
 const profit = getItemProfit(menuItemId)
 if (!item || profit === null) return null
 return ((profit / item.price) * 100).toFixed(1)
 }

 const canMakeItem = (menuItemId) => {
 const recipe = getRecipeForItem(menuItemId)
 if (!recipe) return { canMake: null, reasons: [] }
 
 const reasons = []
 let canMake = true
 
 for (let ing of recipe.ingredients) {
 const invItem = inventory.find(i => i.id === ing.inventoryItemId)
 if (invItem) {
 const needed = ing.quantity
 const available = invItem.currentStock
 if (available < needed) {
 canMake = false
 reasons.push(`Short of ${invItem.name} by ${(needed - available).toFixed(2)} ${ing.unit}`)
 }
 }
 }
 
 return { canMake, reasons }
 }

 useEffect(() => {
 fetch(`${API()}/api/admin/menu/categories`)
 .then(r => r.json())
 .then(d => { if (Array.isArray(d)) setCategories(d) })
 .catch(() => setCategories(sampleCategories))
 fetch(`${API()}/api/admin/menu/items`)
 .then(r => r.json())
 .then(d => { if (Array.isArray(d)) setMenuItems(d) })
 .catch(() => setMenuItems(sampleMenuItems))
 fetch(`${API()}/api/inventory`)
 .then(r => r.json())
 .then(d => { if (Array.isArray(d)) setInventory(d) })
 .catch(() => setInventory(sampleInventory))
 fetch(`${API()}/api/recipes`).then(r => r.json()).then(d => {
 if (Array.isArray(d) && d.length > 0) {
 setRecipes(d)
 try { localStorage.setItem('tdg_recipes', JSON.stringify(d)) } catch (e) {}
 } else {
 const saved = localStorage.getItem('tdg_recipes')
 if (saved) { try { setRecipes(JSON.parse(saved)) } catch (e) {} }
 }
 }).catch(() => {
 const saved = localStorage.getItem('tdg_recipes')
 if (saved) { try { setRecipes(JSON.parse(saved)) } catch (e) {} }
 })
 }, [])

 const exportMenuToExcel = async () => {
 try {
 const XLSX = await import('xlsx')
 const menuRows = menuItems.map(item => {
 const cat = categories.find(c => c.id === item.categoryId)
 const recipe = getRecipeForItem(item.id)
 const cost = getItemCost(item.id)
 const profit = getItemProfit(item.id)
 const margin = getItemMargin(item.id)
 return {
 'Item ID': item.id,
 'Item Name': item.name,
 'Category': cat ? cat.name : 'Uncategorized',
 'Price (₹)': item.price,
 'Cost (₹)': cost !== null ? Number(cost.toFixed(2)) : 'N/A',
 'Profit (₹)': profit !== null ? Number(profit.toFixed(2)) : 'N/A',
 'Margin (%)': margin !== null ? `${margin}%` : 'N/A',
 'Available': item.isAvailable !== false ? 'Yes' : 'No',
 'Recipe Mapped': recipe ? 'Yes' : 'No',
 'Description': item.description || ''
 }
 })

 const catRows = categories.map(cat => {
 const count = menuItems.filter(i => i.categoryId === cat.id).length
 return {
 'Category ID': cat.id,
 'Category Name': cat.name,
 'Color': cat.color || '',
 'Item Count': count
 }
 })

 const recipeRows = []
 recipes.forEach(r => {
 const mItem = menuItems.find(m => m.id === r.menuItemId)
 r.ingredients.forEach(ing => {
 const invItem = inventory.find(i => i.id === ing.inventoryItemId)
 const costPerUnit = ing.costPerUnit || (invItem ? invItem.costPerUnit : 0)
 const totalCost = ing.cost || (ing.quantity * costPerUnit)
 recipeRows.push({
 'Recipe ID': r.id,
 'Menu Item Name': mItem ? mItem.name : r.menuItemName || r.name,
 'Ingredient Name': ing.inventoryName || (invItem ? invItem.name : 'Unknown'),
 'Quantity': ing.quantity,
 'Unit': ing.unit || '',
 'Cost Per Unit (₹)': costPerUnit,
 'Ingredient Cost (₹)': Number(totalCost.toFixed(2))
 })
 })
 })

 const wb = XLSX.utils.book_new()
 const wsItems = XLSX.utils.json_to_sheet(menuRows)
 const wsCats = XLSX.utils.json_to_sheet(catRows)
 const wsRecipes = XLSX.utils.json_to_sheet(recipeRows)

 XLSX.utils.book_append_sheet(wb, wsItems, 'Menu Items')
 XLSX.utils.book_append_sheet(wb, wsCats, 'Categories')
 XLSX.utils.book_append_sheet(wb, wsRecipes, 'Recipes & Costing')

 const dateStr = new Date().toISOString().slice(0, 10)
 XLSX.writeFile(wb, `TDG_Menu_Export_${dateStr}.xlsx`)
 toast.success('Menu exported to Excel successfully!')
 } catch (e) {
 console.error('Excel export error:', e)
 toast.error('Failed to export Excel')
 }
 }

 const saveItem = async () => {
 if (!itemForm.name || itemForm.price === '' || itemForm.price === null || itemForm.price === undefined) {
 toast.error('Name and price required')
 return
 }
 const targetCategoryId = itemForm.categoryId || (categories[0]?.id || 'c1')
 const body = { ...itemForm, price: Number(itemForm.price), categoryId: targetCategoryId }
 try {
 if (editItemId) {
 const r = await fetch(`${API()}/api/admin/menu/items/${editItemId}`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(body)
 })
 if (!r.ok) {
 const errData = await r.json().catch(() => ({}))
 throw new Error(errData.error || `HTTP error ${r.status}`)
 }
 const updated = await r.json()
 setMenuItems(prev => prev.map(i => String(i.id) === String(editItemId) ? updated : i))
 setRecipes(prev => prev.map(r => String(r.menuItemId) === String(editItemId) ? { ...r, menuItemName: updated.name, name: `${updated.name} Recipe` } : r))
 if (imageFile) await uploadItemImage(editItemId)
 try { useMenuStore.getState().fetchMenuItems() } catch (e) {}
 toast.success('Item updated')
 } else {
 const r = await fetch(`${API()}/api/admin/menu/items`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(body)
 })
 if (!r.ok) {
 const errData = await r.json().catch(() => ({}))
 throw new Error(errData.error || `HTTP error ${r.status}`)
 }
 const created = await r.json()
 if (imageFile) await uploadItemImage(created.id)
 setMenuItems(prev => {
 if (prev.some(i => String(i.id) === String(created.id))) {
 return prev.map(i => String(i.id) === String(created.id) ? { ...created, image: imagePreview ? `/uploads/menu/${created.id}.jpg` : null } : i)
 }
 return [...prev, { ...created, image: imagePreview ? `/uploads/menu/${created.id}.jpg` : null }]
 })
 try { useMenuStore.getState().fetchMenuItems() } catch (e) {}
 toast.success('Item added')
 }
 setShowItemModal(false)
 setEditItemId(null)
 setItemForm({ name: '', price: '', categoryId: '', description: '', isAvailable: true })
 setImageFile(null)
 setImagePreview(null)
 } catch (e) {
 console.error('saveItem error:', e)
 toast.error(`Failed to save item: ${e.message || 'Error'}`)
 }
 }

 const deleteItem = async (id) => {
 if (!window.confirm('Delete this menu item?')) return
 try {
 const r = await fetch(`${API()}/api/admin/menu/items/${id}`, { method: 'DELETE' })
 if (!r.ok) throw Error()
 setMenuItems(prev => prev.filter(i => i.id !== id))
 toast.success('Item deleted')
 } catch { toast.error('Failed to delete item') }
 }

 const toggleAvailable = async (id) => {
 try {
 const r = await fetch(`${API()}/api/admin/menu/items/${id}/toggle`, { method: 'PUT' })
 if (!r.ok) throw Error()
 const updated = await r.json()
 setMenuItems(prev => prev.map(i => i.id === id ? updated : i))
 } catch { toast.error('Failed to toggle') }
 }

 const saveCategory = async () => {
 if (!catForm.name) { toast.error('Category name required'); return }
 try {
 if (editCategoryId) {
 const r = await fetch(`${API()}/api/admin/menu/categories/${editCategoryId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(catForm) })
 if (!r.ok) throw Error()
 const updated = await r.json()
 setCategories(prev => prev.map(c => c.id === editCategoryId ? updated : c))
 toast.success('Category updated')
 } else {
 const r = await fetch(`${API()}/api/admin/menu/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(catForm) })
 if (!r.ok) throw Error()
 const created = await r.json()
 setCategories(prev => [...prev, created])
 toast.success('Category added')
 }
 setShowCategoryModal(false)
 setEditCategoryId(null)
 setCatForm({ name: '', color: '#6b7280' })
 } catch { toast.error('Failed to save category') }
 }

 const deleteCategory = async (id) => {
 if (!window.confirm('Delete this category? Items in it will become uncategorized.')) return
 try {
 const r = await fetch(`${API()}/api/admin/menu/categories/${id}`, { method: 'DELETE' })
 if (!r.ok) throw Error()
 setCategories(prev => prev.filter(c => c.id !== id))
 setMenuItems(prev => prev.map(i => i.categoryId === id ? { ...i, categoryId: null } : i))
 toast.success('Category deleted')
 } catch { toast.error('Failed to delete category') }
 }

 const openItemModal = (item) => {
 if (item) {
 setEditItemId(item.id)
 setItemForm({
 name: item.name || '',
 price: item.price !== undefined && item.price !== null ? String(item.price) : '',
 categoryId: item.categoryId || (categories[0]?.id || ''),
 description: item.description || '',
 isAvailable: item.isAvailable !== false
 })
 setImagePreview(item.image ? (item.image.startsWith('http') ? item.image : `${API()}${item.image}`) : null)
 setImageFile(null)
 } else {
 setEditItemId(null)
 setItemForm({ name: '', price: '', categoryId: categories[0]?.id || '', description: '', isAvailable: true })
 setImagePreview(null)
 setImageFile(null)
 }
 setShowItemModal(true)
 }

 const cloneItem = (item) => {
 setEditItemId(null)
 setItemForm({
 name: `${item.name} (Copy)`,
 price: item.price !== undefined && item.price !== null ? String(item.price) : '',
 categoryId: item.categoryId || (categories[0]?.id || ''),
 description: item.description || '',
 isAvailable: item.isAvailable !== false
 })
 setImagePreview(item.image ? (item.image.startsWith('http') ? item.image : `${API()}${item.image}`) : null)
 setImageFile(null)
 setShowItemModal(true)
 toast.info(`Cloning "${item.name}". Modify the name and click Add Item to save.`)
 }

 const openCategoryModal = (cat) => {
 if (cat) {
 setEditCategoryId(cat.id)
 setCatForm({ name: cat.name, color: cat.color || '#6b7280' })
 } else {
 setEditCategoryId(null)
 setCatForm({ name: '', color: '#6b7280' })
 }
 setShowCategoryModal(true)
 }

 const openRecipeModal = (menuItem) => {
 setSelectedMenuItem(menuItem)
 const existingRecipe = getRecipeForItem(menuItem.id)
 if (existingRecipe) {
 setRecipeIngredients([...existingRecipe.ingredients])
 } else {
 setRecipeIngredients([])
 }
 setShowRecipeModal(true)
 }

 const addIngredient = (invItem) => {
 if (recipeIngredients.find(i => i.inventoryItemId === invItem.id)) {
 toast.warning('Ingredient already added')
 return
 }
 setRecipeIngredients([...recipeIngredients, {
 id: 'temp_' + Date.now(),
 inventoryItemId: invItem.id,
 inventoryName: invItem.name,
 quantity: 1,
 unit: invItem.unit,
 currentStock: invItem.currentStock,
 costPerUnit: invItem.costPerUnit
 }])
 }

 const updateIngredientQty = (id, quantity) => {
 setRecipeIngredients(recipeIngredients.map(i => 
 i.id === id ? { ...i, quantity: parseFloat(quantity) || 0 } : i
 ))
 }

 const removeIngredient = (id) => {
 setRecipeIngredients(recipeIngredients.filter(i => i.id !== id))
 }

 const saveRecipe = async () => {
 if (recipeIngredients.length === 0) {
 toast.error('Add at least one ingredient')
 return
 }
 
 const existingIndex = recipes.findIndex(r => r.menuItemId === selectedMenuItem.id || r.menuItemName === selectedMenuItem.name)
 const newRecipe = {
 id: existingIndex >= 0 ? recipes[existingIndex].id : 'r_' + Date.now(),
 menuItemId: selectedMenuItem.id,
 menuItemName: selectedMenuItem.name,
 name: `${selectedMenuItem.name} Recipe`,
 description: `Standard recipe for ${selectedMenuItem.name}`,
 yieldQty: 1,
 prepTime: selectedMenuItem.prepTime || 10,
 ingredients: recipeIngredients.map(i => ({
 inventoryItemId: i.inventoryItemId,
 inventoryName: i.inventoryName || i.name,
 quantity: i.quantity,
 unit: i.unit,
 cost: i.cost || i.costPerUnit || 0
 }))
 }

 let updated = [...recipes]
 if (existingIndex >= 0) {
 updated[existingIndex] = newRecipe
 } else {
 updated.push(newRecipe)
 }
 setRecipes(updated)
 try { localStorage.setItem('tdg_recipes', JSON.stringify(updated)) } catch (e) {}

 try {
 await fetch(`${API()}/api/recipes`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(newRecipe)
 })
 } catch (e) { /* silent fallback */ }

 toast.success('Recipe saved successfully')
 setShowRecipeModal(false)
 }

 const deleteRecipe = async (menuItemId) => {
 const updated = recipes.filter(r => r.menuItemId !== menuItemId && r.id !== menuItemId)
 setRecipes(updated)
 try { localStorage.setItem('tdg_recipes', JSON.stringify(updated)) } catch (e) {}

 try {
 await fetch(`${API()}/api/recipes/${menuItemId}`, { method: 'DELETE' })
 } catch (e) { /* silent fallback */ }

 toast.success('Recipe deleted')
 }

 const totalRecipeCost = recipeIngredients.reduce((sum, ing) => {
 const invItem = inventory.find(i => i.id === ing.inventoryItemId)
 return sum + (ing.quantity * (invItem?.costPerUnit || 0))
 }, 0)

 const glassCard = {
 background: 'rgba(255,255,255,0.75)',
 backdropFilter: 'blur(20px)',
 WebkitBackdropFilter: 'blur(20px)',
 borderRadius: '16px',
 border: '1px solid rgba(255,255,255,0.3)',
 boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)'
 }

 return (
 <div>
 <div style={{ marginBottom: '24px' }}>
 <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>
 Menu & Recipe Management
 </h2>
 <p style={{ color: '#6b7280' }}>Manage menu items and map recipes to ingredients</p>
 </div>

 {/* Stats */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
 {[
 { icon: <UtensilsCrossed size={24} color="#e63946" />, value: menuItems.length, label: 'Menu Items', iconBg: 'rgba(230,57,70,0.08)' },
 { icon: <BookOpen size={24} color="#f59e0b" />, value: recipes.length, label: 'Recipes Mapped', iconBg: 'rgba(245,158,11,0.08)' },
 { icon: <Calculator size={24} color="#3b82f6" />, value: menuItems.length - recipes.length, label: 'Unmapped Items', iconBg: 'rgba(59,130,246,0.08)' },
 { icon: <Package size={24} color="#10b981" />, value: inventory.length, label: 'Inventory Items', iconBg: 'rgba(16,185,129,0.08)' }
 ].map((stat, i) => (
 <div key={i} style={{ ...glassCard, padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
 <div style={{ width: '48px', height: '48px', background: stat.iconBg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
 {stat.icon}
 </div>
 <div>
 <div style={{ fontSize: '24px', fontWeight: 700 }}>{stat.value}</div>
 <div style={{ fontSize: '13px', color: '#6b7280' }}>{stat.label}</div>
 </div>
 </div>
 ))}
 </div>

 {/* Tabs */}
 <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
 {[
 { id: 'menu', label: 'Menu Items', icon: UtensilsCrossed },
 { id: 'recipes', label: 'All Recipes', icon: BookOpen },
 { id: 'inventory', label: 'Inventory', icon: Package },
 ].map(tab => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 style={{
 padding: '12px 24px',
 borderRadius: '12px',
 background: activeTab === tab.id ? 'linear-gradient(135deg, #e63946, #c1121f)' : 'rgba(255,255,255,0.75)',
 backdropFilter: activeTab === tab.id ? 'none' : 'blur(20px)',
 WebkitBackdropFilter: activeTab === tab.id ? 'none' : 'blur(20px)',
 color: activeTab === tab.id ? 'white' : '#6b7280',
 fontWeight: 600,
 border: activeTab === tab.id ? 'none' : '1px solid rgba(255,255,255,0.3)',
 cursor: 'pointer',
 display: 'flex',
 alignItems: 'center',
 gap: '8px',
 boxShadow: activeTab === tab.id ? '0 2px 8px rgba(230,57,70,0.3)' : '0 1px 3px rgba(0,0,0,0.04)'
 }}
 >
 <tab.icon size={18} />
 {tab.label}
 </button>
 ))}
 </div>

 {/* Menu Items Tab */}
 {activeTab === 'menu' && (
 <>
 <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
 <div style={{ flex: 1, position: 'relative' }}>
 <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
 <input
 type="text"
 placeholder="Search menu items..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 style={{
 width: '100%',
 padding: '14px 16px 14px 48px',
 borderRadius: '12px',
 border: '1px solid var(--border)',
 background: 'white',
 fontSize: '14px'
 }}
 />
 </div>
 <select
 value={selectedCategory}
 onChange={(e) => setSelectedCategory(e.target.value)}
 style={{
 padding: '14px 16px',
 borderRadius: '12px',
 border: '1px solid var(--border)',
 background: 'white',
 fontSize: '14px',
 fontWeight: 600
 }}
 >
 <option value="all">All Categories</option>
 {categories.map(cat => (
 <option key={cat.id} value={cat.id}>{cat.name}</option>
 ))}
 </select>
 <Button variant="secondary" onClick={() => openItemModal(null)}>
 <Plus size={18} />
 Add Item
 </Button>
 <Button variant="ghost" onClick={() => openCategoryModal(null)}>
 <Plus size={18} />
 Add Category
 </Button>
 <input
 type="file"
 ref={excelInputRef}
 accept=".xlsx, .xls, .csv"
 style={{ display: 'none' }}
 onChange={handleExcelUpload}
 />
 <Button variant="outline" onClick={() => excelInputRef.current?.click()} style={{ borderColor: '#3b82f6', color: '#1d4ed8', background: '#eff6ff' }}>
 <Download size={18} color="#3b82f6" style={{ transform: 'rotate(180deg)' }} />
 Upload Excel
 </Button>
 <Button variant="outline" onClick={exportMenuToExcel} style={{ borderColor: '#10b981', color: '#047857', background: '#ecfdf5' }}>
 <FileSpreadsheet size={18} color="#10b981" />
 Export Excel
 </Button>
 </div>

 {/* Category Filter Pills */}
 <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
 <button
 onClick={() => setSelectedCategory('all')}
 style={{
 padding: '10px 18px',
 borderRadius: '12px',
 background: selectedCategory === 'all' ? 'linear-gradient(135deg, #e63946, #c1121f)' : 'white',
 color: selectedCategory === 'all' ? 'white' : '#4b5563',
 fontWeight: 700,
 fontSize: '13px',
 border: selectedCategory === 'all' ? 'none' : '1px solid #e5e7eb',
 cursor: 'pointer',
 whiteSpace: 'nowrap',
 boxShadow: selectedCategory === 'all' ? '0 3px 10px rgba(230,57,70,0.3)' : '0 1px 2px rgba(0,0,0,0.04)',
 transition: 'all 0.15s'
 }}
 >
 🍽️ All ({filteredMenuItems.length})
 </button>
 {categories.map(cat => {
 const count = menuItems.filter(i => i.categoryId === cat.id).length
 const isSel = selectedCategory === cat.id
 return (
 <button
 key={cat.id}
 onClick={() => setSelectedCategory(cat.id)}
 style={{
 padding: '10px 18px',
 borderRadius: '12px',
 background: isSel ? (cat.color || '#e63946') : 'white',
 color: isSel ? 'white' : '#1a1a2e',
 fontWeight: 700,
 fontSize: '13px',
 border: isSel ? 'none' : '1px solid #e5e7eb',
 cursor: 'pointer',
 whiteSpace: 'nowrap',
 display: 'flex',
 alignItems: 'center',
 gap: '6px',
 boxShadow: isSel ? `0 3px 10px ${cat.color || '#e63946'}40` : '0 1px 2px rgba(0,0,0,0.04)',
 transition: 'all 0.15s'
 }}
 >
 <span>{cat.icon || '📌'}</span>
 <span>{cat.name} ({count})</span>
 </button>
 )
 })}
 </div>

 {/* Category Grouped Cards Grid */}
 <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
 {categories
 .filter(cat => selectedCategory === 'all' || cat.id === selectedCategory)
 .map(cat => {
 const catItems = filteredMenuItems.filter(i => i.categoryId === cat.id)
 if (catItems.length === 0) return null

 return (
 <div key={cat.id}>
 {/* Category Header Banner */}
 <div style={{
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'space-between',
 padding: '14px 20px',
 background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
 borderRadius: '16px',
 borderLeft: `6px solid ${cat.color || '#e63946'}`,
 border: '1px solid rgba(0,0,0,0.07)',
 marginBottom: '16px',
 boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
 <span style={{ fontSize: '22px' }}>{cat.icon || '🍽️'}</span>
 <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1a1a2e', margin: 0 }}>
 {cat.name}
 </h3>
 <span style={{
 fontSize: '12px',
 fontWeight: 700,
 background: '#f1f5f9',
 color: '#475569',
 padding: '4px 12px',
 borderRadius: '20px'
 }}>
 {catItems.length} items
 </span>
 </div>
 <Button variant="ghost" size="sm" onClick={() => openCategoryModal(cat)}>
 <Edit size={14} /> Edit Category
 </Button>
 </div>

 {/* Cards Grid */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
 {catItems.map(item => {
 const recipe = getRecipeForItem(item.id)
 const cost = getItemCost(item.id)
 const profit = getItemProfit(item.id)
 const margin = getItemMargin(item.id)
 const { canMake, reasons } = canMakeItem(item.id)

 return (
 <Card key={item.id} hover>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
 {item.image ? (
 <img
 src={item.image.startsWith('http') ? item.image : `${API()}${item.image}`}
 alt={item.name}
 style={{
 width: '48px',
 height: '48px',
 borderRadius: '12px',
 objectFit: 'cover',
 opacity: item.isAvailable === false ? 0.4 : 1
 }}
 />
 ) : (
 <div style={{
 width: '48px',
 height: '48px',
 borderRadius: '12px',
 background: cat?.color || '#6b7280',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 opacity: item.isAvailable === false ? 0.4 : 1
 }}>
 <UtensilsCrossed size={24} color="white" />
 </div>
 )}
 <div>
 <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', textDecoration: item.isAvailable === false ? 'line-through' : 'none', opacity: item.isAvailable === false ? 0.5 : 1 }}>{item.name}</h3>
 <span style={{ fontSize: '12px', color: '#6b7280' }}>{cat?.name}</span>
 </div>
 </div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 <span style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>₹{item.price}</span>
 </div>
 </div>

 <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>{item.description}</p>

 {recipe ? (
 <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 <Check size={16} color="#10b981" />
 <span style={{ fontWeight: 600, color: '#166534' }}>Recipe Mapped</span>
 </div>
 <span style={{ fontSize: '12px', color: '#6b7280' }}>{recipe.ingredients.length} ingredients</span>
 </div>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
 <div style={{ textAlign: 'center' }}>
 <div style={{ fontSize: '11px', color: '#6b7280' }}>Cost</div>
 <div style={{ fontSize: '14px', fontWeight: 600 }}>₹{cost?.toFixed(0)}</div>
 </div>
 <div style={{ textAlign: 'center' }}>
 <div style={{ fontSize: '11px', color: '#6b7280' }}>Profit</div>
 <div style={{ fontSize: '14px', fontWeight: 600, color: '#10b981' }}>₹{profit?.toFixed(0)}</div>
 </div>
 <div style={{ textAlign: 'center' }}>
 <div style={{ fontSize: '11px', color: '#6b7280' }}>Margin</div>
 <div style={{ fontSize: '14px', fontWeight: 600 }}>{margin}%</div>
 </div>
 </div>
 </div>
 ) : (
 <div style={{ background: '#fef3c7', borderRadius: '12px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
 <AlertTriangle size={16} color="#ca8a04" />
 <span style={{ fontSize: '13px', color: '#92400e' }}>No recipe mapped - inventory won't auto-deduct</span>
 </div>
 )}

 {canMake === false && (
 <div style={{ background: '#fef2f2', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
 <X size={14} color="#dc2626" />
 <span style={{ fontSize: '12px', fontWeight: 600, color: '#991b1b' }}>Cannot make item</span>
 </div>
 {reasons.map((r, i) => (
 <div key={i} style={{ fontSize: '11px', color: '#dc2626', marginLeft: '22px' }}>{r}</div>
 ))}
 </div>
 )}

 {canMake === true && recipe && (
 <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '8px 12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
 <Check size={14} color="#10b981" />
 <span style={{ fontSize: '12px', color: '#166534' }}>All ingredients in stock</span>
 </div>
 )}

 <div style={{ display: 'flex', gap: '8px' }}>
 <Button variant={recipe ? 'secondary' : 'primary'} size="sm" style={{ flex: 1 }} onClick={() => openRecipeModal(item)}>
 <BookOpen size={14} />
 {recipe ? 'Edit Recipe' : 'Map Recipe'}
 </Button>
 <Button variant="ghost" size="sm" title="Edit Item" onClick={() => openItemModal(item)}>
 <Edit size={14} />
 </Button>
 <Button variant="ghost" size="sm" title="Clone / Duplicate Item" onClick={() => cloneItem(item)} style={{ background: '#f0f9ff', color: '#0284c7' }}>
 <Copy size={14} />
 <span style={{ fontSize: '11px', fontWeight: 600, marginLeft: '2px' }}>Clone</span>
 </Button>
 <Button variant="ghost" size="sm" onClick={() => toggleAvailable(item.id)}>
 {item.isAvailable === false ? <Check size={14} color="#10b981" /> : <X size={14} color="#ef4444" />}
 </Button>
 <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)}>
 <Trash2 size={14} color="#ef4444" />
 </Button>
 {recipe && (
 <Button variant="ghost" size="sm" onClick={() => deleteRecipe(item.id)}>
 <Trash2 size={14} color="#ef4444" />
 </Button>
 )}
 </div>
 </Card>
 )
 })}
 </div>
 </div>
 )
 })}
 </div>
 </>
 )}

 {/* All Recipes Tab */}
 {activeTab === 'recipes' && (
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
 {recipes.map(recipe => {
 const menuItem = menuItems.find(m => m.id === recipe.menuItemId)
 const totalCost = recipe.ingredients.reduce((sum, ing) => {
 const invItem = inventory.find(i => i.id === ing.inventoryItemId)
 return sum + (ing.quantity * (invItem?.costPerUnit || 0))
 }, 0)
 const profit = menuItem ? menuItem.price - totalCost : 0
 const margin = menuItem ? ((profit / menuItem.price) * 100).toFixed(1) : 0

 return (
 <Card key={recipe.id}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
 <div>
 <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e' }}>{recipe.name}</h3>
 <span style={{ fontSize: '13px', color: '#6b7280' }}>{menuItem?.name}</span>
 </div>
 <Button variant="ghost" size="sm" onClick={() => {
 setSelectedMenuItem(menuItem)
 setRecipeIngredients([...recipe.ingredients.map(i => ({
 ...i,
 inventoryName: inventory.find(inv => inv.id === i.inventoryItemId)?.name || 'Unknown',
 currentStock: inventory.find(inv => inv.id === i.inventoryItemId)?.currentStock || 0,
 costPerUnit: inventory.find(inv => inv.id === i.inventoryItemId)?.costPerUnit || 0
 }))])
 setShowRecipeModal(true)
 }}>
 <Edit size={14} />
 </Button>
 </div>

 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
 <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
 <div style={{ fontSize: '18px', fontWeight: 700, color: '#dc2626' }}>₹{totalCost.toFixed(0)}</div>
 <div style={{ fontSize: '10px', color: '#991b1b' }}>COST</div>
 </div>
 <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
 <div style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>₹{profit.toFixed(0)}</div>
 <div style={{ fontSize: '10px', color: '#166534' }}>PROFIT</div>
 </div>
 <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
 <div style={{ fontSize: '18px', fontWeight: 700, color: '#2563eb' }}>{margin}%</div>
 <div style={{ fontSize: '10px', color: '#1e40af' }}>MARGIN</div>
 </div>
 </div>

 <div style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>Ingredients:</div>
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
 {recipe.ingredients.map((ing, i) => {
 const invItem = inventory.find(i => i.id === ing.inventoryItemId)
 const isLow = invItem && invItem.currentStock < ing.quantity
 return (
 <span key={i} style={{
 padding: '4px 10px',
 borderRadius: '6px',
 fontSize: '12px',
 fontWeight: 500,
 background: isLow ? '#fef2f2' : '#f3f4f6',
 color: isLow ? '#dc2626' : '#4b5563'
 }}>
 {invItem?.name || 'Unknown'}: {ing.quantity} {ing.unit}
 </span>
 )
 })}
 </div>
 </Card>
 )
 })}
 {recipes.length === 0 && (
 <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px' }}>
 <BookOpen size={48} color="#9ca3af" style={{ marginBottom: '16px' }} />
 <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No Recipes Yet</h3>
 <p style={{ color: '#6b7280' }}>Map recipes to menu items to track ingredient costs</p>
 </div>
 )}
 </div>
 )}

 {/* Inventory Tab */}
 {activeTab === 'inventory' && (
 <div style={{ ...glassCard, overflow: 'hidden' }}>
 <div style={{ overflowX: 'auto' }}>
 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
 <thead>
 <tr style={{ borderBottom: '1px solid var(--border)' }}>
 <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Item</th>
 <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Unit</th>
 <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Stock</th>
 <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Cost/Unit</th>
 <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Value</th>
 </tr>
 </thead>
 <tbody>
 {inventory.map(item => (
 <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
 <td style={{ padding: '16px', fontWeight: 600 }}>{item.name}</td>
 <td style={{ padding: '16px', color: '#6b7280' }}>{item.unit}</td>
 <td style={{ padding: '16px' }}>
 <span style={{
 color: item.currentStock < 10 ? '#dc2626' : '#10b981',
 fontWeight: 600
 }}>
 {item.currentStock}
 </span>
 </td>
 <td style={{ padding: '16px' }}>₹{item.costPerUnit}</td>
 <td style={{ padding: '16px', fontWeight: 600 }}>₹{(item.currentStock * item.costPerUnit).toLocaleString()}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* Recipe Modal */}
 <Modal
 isOpen={showRecipeModal}
 onClose={() => setShowRecipeModal(false)}
 title={`Recipe: ${selectedMenuItem?.name || ''}`}
 size="xl"
 >
 <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
 {/* Cost Summary */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
 <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
 <div style={{ fontSize: '11px', color: '#991b1b', marginBottom: '4px' }}>RECIPE COST</div>
 <div style={{ fontSize: '20px', fontWeight: 700, color: '#dc2626' }}>₹{totalRecipeCost.toFixed(0)}</div>
 </div>
 <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
 <div style={{ fontSize: '11px', color: '#166534', marginBottom: '4px' }}>SELLING PRICE</div>
 <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>₹{selectedMenuItem?.price || 0}</div>
 </div>
 <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
 <div style={{ fontSize: '11px', color: '#1e40af', marginBottom: '4px' }}>PROFIT</div>
 <div style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb' }}>₹{((selectedMenuItem?.price || 0) - totalRecipeCost).toFixed(0)}</div>
 </div>
 <div style={{ background: '#f5f3ff', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
 <div style={{ fontSize: '11px', color: '#6b21a8', marginBottom: '4px' }}>MARGIN</div>
 <div style={{ fontSize: '20px', fontWeight: 700, color: '#8b5cf6' }}>
 {selectedMenuItem?.price ? (((selectedMenuItem.price - totalRecipeCost) / selectedMenuItem.price) * 100).toFixed(1) : 0}%
 </div>
 </div>
 </div>

 {/* Current Ingredients */}
 <div>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
 <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Ingredients</h4>
 <Button size="sm" variant="secondary" onClick={() => setShowIngredientModal(true)}>
 <Plus size={14} />
 Add Ingredient
 </Button>
 </div>

 {recipeIngredients.length === 0 ? (
 <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
 <Package size={32} color="#9ca3af" style={{ marginBottom: '8px' }} />
 <p style={{ color: '#6b7280' }}>No ingredients added yet</p>
 </div>
 ) : (
 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 {recipeIngredients.map(ing => (
 <div key={ing.id} style={{
 display: 'flex',
 alignItems: 'center',
 gap: '12px',
 padding: '12px',
 background: '#f9fafb',
 borderRadius: '10px'
 }}>
 <div style={{ flex: 1 }}>
 <div style={{ fontWeight: 600, fontSize: '14px' }}>{ing.inventoryName}</div>
 <div style={{ fontSize: '12px', color: '#6b7280' }}>
 Stock: {ing.currentStock} {ing.unit} | Cost: ₹{(ing.quantity * ing.costPerUnit).toFixed(2)}
 </div>
 </div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 <input
 type="number"
 value={ing.quantity}
 onChange={(e) => updateIngredientQty(ing.id, e.target.value)}
 style={{
 width: '80px',
 padding: '8px 12px',
 borderRadius: '8px',
 border: '1px solid var(--border)',
 textAlign: 'center',
 fontWeight: 600
 }}
 />
 <span style={{ fontSize: '13px', color: '#6b7280', width: '50px' }}>{ing.unit}</span>
 <Button variant="ghost" size="sm" onClick={() => removeIngredient(ing.id)}>
 <X size={14} color="#ef4444" />
 </Button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 <Button fullWidth onClick={saveRecipe}>
 <Check size={18} />
 Save Recipe
 </Button>
 </div>
 </Modal>

 {/* Add Ingredient Modal */}
 <Modal isOpen={showIngredientModal} onClose={() => setShowIngredientModal(false)} title="Add Ingredient" size="lg">
 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflow: 'auto' }}>
 {inventory.map(item => {
 const isAdded = recipeIngredients.some(i => i.inventoryItemId === item.id)
 return (
 <div
 key={item.id}
 style={{
 display: 'flex',
 justifyContent: 'space-between',
 alignItems: 'center',
 padding: '12px',
 background: isAdded ? '#f0fdf4' : '#f9fafb',
 borderRadius: '10px',
 cursor: isAdded ? 'default' : 'pointer',
 transition: 'all 0.2s'
 }}
 onClick={() => !isAdded && addIngredient(item)}
 >
 <div>
 <div style={{ fontWeight: 600 }}>{item.name}</div>
 <div style={{ fontSize: '12px', color: '#6b7280' }}>
 {item.currentStock} {item.unit} available | ₹{item.costPerUnit}/{item.unit}
 </div>
 </div>
 {isAdded ? (
 <Check size={20} color="#10b981" />
 ) : (
 <ChevronRight size={20} color="#9ca3af" />
 )}
 </div>
 )
 })}
 </div>
 </Modal>

 {/* Add/Edit Item Modal */}
 <Modal isOpen={showItemModal} onClose={() => { setShowItemModal(false); setEditItemId(null); setImagePreview(null); setImageFile(null) }} title={editItemId ? 'Edit Item' : 'Add Menu Item'} size="md">
 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
 <div>
 <label style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '6px' }}>Name</label>
 <input value={itemForm.name} onChange={e => setItemForm(p => ({ ...p, name: e.target.value }))} placeholder="Item name" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', boxSizing: 'border-box' }} />
 </div>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
 <div>
 <label style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '6px' }}>Price (₹)</label>
 <input type="number" value={itemForm.price} onChange={e => setItemForm(p => ({ ...p, price: e.target.value }))} placeholder="0" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', boxSizing: 'border-box' }} />
 </div>
 <div>
 <label style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '6px' }}>Category</label>
 <select value={itemForm.categoryId} onChange={e => setItemForm(p => ({ ...p, categoryId: e.target.value }))} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', background: 'white', boxSizing: 'border-box' }}>
 {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
 </select>
 </div>
 </div>
 <div>
 <label style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '6px' }}>Description</label>
 <textarea value={itemForm.description} onChange={e => setItemForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional description" rows={3} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />
 </div>
 <div>
 <label style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '6px' }}>Item Image</label>
 <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
 {imagePreview ? (
 <div style={{ position: 'relative', display: 'inline-block' }}>
 <img src={imagePreview} alt="Preview" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #e5e7eb' }} />
 <button
 onClick={() => { setImagePreview(null); setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
 style={{ position: 'absolute', top: '-6px', right: '-6px', width: '24px', height: '24px', borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', lineHeight: 1 }}
 >
 <X size={14} />
 </button>
 </div>
 ) : (
 <button
 type="button"
 onClick={() => fileInputRef.current?.click()}
 style={{
 width: '120px',
 height: '120px',
 borderRadius: '12px',
 border: '2px dashed #d1d5db',
 background: '#f9fafb',
 cursor: 'pointer',
 display: 'flex',
 flexDirection: 'column',
 alignItems: 'center',
 justifyContent: 'center',
 gap: '8px',
 color: '#9ca3af',
 transition: 'all 0.2s'
 }}
 onMouseEnter={e => { e.currentTarget.style.borderColor = '#e63946'; e.currentTarget.style.color = '#e63946' }}
 onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#9ca3af' }}
 >
 <ImagePlus size={24} />
 <span style={{ fontSize: '11px', fontWeight: 500 }}>Upload Image</span>
 </button>
 )}
 <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>JPG, PNG or WebP. Max 5MB.</div>
 </div>
 <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
 <input type="checkbox" checked={itemForm.isAvailable} onChange={e => setItemForm(p => ({ ...p, isAvailable: e.target.checked }))} />
 <span style={{ fontSize: '14px' }}>Available for ordering</span>
 </label>
 <Button fullWidth onClick={saveItem}>
 <Check size={18} />
 {editItemId ? 'Update Item' : 'Add Item'}
 </Button>
 </div>
 </Modal>

 {/* Add/Edit Category Modal */}
 <Modal isOpen={showCategoryModal} onClose={() => { setShowCategoryModal(false); setEditCategoryId(null) }} title={editCategoryId ? 'Edit Category' : 'Add Category'} size="sm">
 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
 <div>
 <label style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '6px' }}>Category Name</label>
 <input value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Burgers" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', boxSizing: 'border-box' }} />
 </div>
 <div>
 <label style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '6px' }}>Color</label>
 <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
 <input type="color" value={catForm.color} onChange={e => setCatForm(p => ({ ...p, color: e.target.value }))} style={{ width: '48px', height: '48px', borderRadius: '10px', border: 'none', cursor: 'pointer', padding: 0 }} />
 <span style={{ fontSize: '13px', color: '#6b7280' }}>{catForm.color}</span>
 </div>
 </div>
 <div style={{ display: 'flex', gap: '8px' }}>
 {categories.length > 0 && editCategoryId && (
 <Button variant="danger" style={{ flex: 1 }} onClick={() => { deleteCategory(editCategoryId); setShowCategoryModal(false) }}>
 <Trash2 size={16} />
 Delete
 </Button>
 )}
 <Button fullWidth onClick={saveCategory}>
 <Check size={18} />
 {editCategoryId ? 'Update Category' : 'Add Category'}
 </Button>
 </div>
 </div>
 </Modal>
 </div>
 )
}
