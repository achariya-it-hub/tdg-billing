import { useState, useEffect, useRef } from 'react'
import { UtensilsCrossed, Plus, Search, BookOpen, Package, Edit, Trash2, Check, X, ChevronRight, AlertTriangle, Calculator, ImagePlus, Download, FileSpreadsheet } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toaster'
import { useMenuStore } from '../stores/menuStore'

const sampleCategories = [
  { id: 'c1', name: 'Gyros', color: '#e63946', displayOrder: 1 },
  { id: 'c2', name: 'Burger', color: '#f59e0b', displayOrder: 2 },
  { id: 'c3', name: 'Salads', color: '#10b981', displayOrder: 3 },
  { id: 'c4', name: 'Sides', color: '#dc2626', displayOrder: 4 },
  { id: 'c5', name: 'TDG Crispy Chicken', color: '#fbbf24', displayOrder: 5 },
  { id: 'c6', name: 'Thick Shakes', color: '#8b5cf6', displayOrder: 6 },
  { id: 'c7', name: 'Softy', color: '#ec4899', displayOrder: 7 },
  { id: 'c8', name: 'Desserts', color: '#f472b6', displayOrder: 8 },
  { id: 'c9', name: 'Beverages', color: '#3b82f6', displayOrder: 9 }
]

const sampleMenuItems = [
  { id: 'm1', categoryId: 'c1', name: 'Non-Veg - Spicy Chicken Gyro (Regular)', price: 99, isAvailable: true },
  { id: 'm2', categoryId: 'c1', name: 'Non-Veg - Spicy Chicken Gyro (Large)', price: 249, isAvailable: true },
  { id: 'm3', categoryId: 'c1', name: 'Non-Veg - Cream Chicken Gyro (Regular)', price: 99, isAvailable: true },
  { id: 'm4', categoryId: 'c1', name: 'Non-Veg - Cream Chicken Gyro (Large)', price: 249, isAvailable: true },
  { id: 'm5', categoryId: 'c1', name: 'Non-Veg - BBQ Chicken Gyro (Regular)', price: 99, isAvailable: true },
  { id: 'm6', categoryId: 'c1', name: 'Non-Veg - BBQ Chicken Gyro (Large)', price: 249, isAvailable: true },
  { id: 'm7', categoryId: 'c1', name: 'Non-Veg - Pesto Chicken Gyro (Regular)', price: 99, isAvailable: true },
  { id: 'm8', categoryId: 'c1', name: 'Non-Veg - Pesto Chicken Gyro (Large)', price: 249, isAvailable: true },
  { id: 'm9', categoryId: 'c1', name: 'Veg - Spicy Paneer Gyro (Regular)', price: 99, isAvailable: true },
  { id: 'm10', categoryId: 'c1', name: 'Veg - Spicy Paneer Gyro (Large)', price: 249, isAvailable: true },
  { id: 'm11', categoryId: 'c1', name: 'Veg - Cream Paneer Gyro (Regular)', price: 99, isAvailable: true },
  { id: 'm12', categoryId: 'c1', name: 'Veg - Cream Paneer Gyro (Large)', price: 249, isAvailable: true },
  { id: 'm13', categoryId: 'c1', name: 'Veg - BBQ Paneer Gyro (Regular)', price: 99, isAvailable: true },
  { id: 'm14', categoryId: 'c1', name: 'Veg - BBQ Paneer Gyro (Large)', price: 249, isAvailable: true },
  { id: 'm15', categoryId: 'c1', name: 'Veg - Pesto Paneer Gyro (Regular)', price: 99, isAvailable: true },
  { id: 'm16', categoryId: 'c1', name: 'Veg - Pesto Paneer Gyro (Large)', price: 249, isAvailable: true },
  { id: 'm17', categoryId: 'c2', name: 'Non-Veg - Spicy Egg Burger', price: 79, isAvailable: true },
  { id: 'm18', categoryId: 'c2', name: 'Non-Veg - Crispy Chicken Burger', price: 99, isAvailable: true },
  { id: 'm19', categoryId: 'c2', name: 'Veg - Spicy Paneer Burger', price: 99, isAvailable: true },
  { id: 'm20', categoryId: 'c3', name: 'Non-Veg - Chicken Salad', price: 99, isAvailable: true },
  { id: 'm21', categoryId: 'c3', name: 'Veg - Paneer Salad', price: 99, isAvailable: true },
  { id: 'm22', categoryId: 'c4', name: 'Non-Veg - Loaded Chicken Fries', price: 199, isAvailable: true },
  { id: 'm23', categoryId: 'c4', name: 'Veg - Fries (Salted, Peri Peri Or Cajun)', price: 99, isAvailable: true },
  { id: 'm24', categoryId: 'c4', name: 'Veg - Loaded Paneer Fries', price: 199, isAvailable: true },
  { id: 'm25', categoryId: 'c4', name: 'Veg - 6 pcs Halloumi Strips', price: 149, isAvailable: true },
  { id: 'm26', categoryId: 'c5', name: 'Non-Veg - 1 Pc Crispy Chicken (1 Dip)', price: 70, isAvailable: true },
  { id: 'm27', categoryId: 'c5', name: 'Non-Veg - 2 Pc Crispy Chicken (1 Dip)', price: 140, isAvailable: true },
  { id: 'm28', categoryId: 'c5', name: 'Non-Veg - 4 Pc Crispy Chicken (2 Dip)', price: 280, isAvailable: true },
  { id: 'm29', categoryId: 'c5', name: 'Non-Veg - 8 Pc Crispy Chicken (4 Dip)', price: 560, isAvailable: true },
  { id: 'm30', categoryId: 'c5', name: 'Non-Veg - 12 Pc Crispy Chicken (6 Dip)', price: 840, isAvailable: true },
  { id: 'm31', categoryId: 'c5', name: 'Non-Veg - 3 Pc Crispy Wings (1 Dip)', price: 90, isAvailable: true },
  { id: 'm32', categoryId: 'c5', name: 'Non-Veg - 6 Pc Crispy Wings (2 Dip)', price: 180, isAvailable: true },
  { id: 'm33', categoryId: 'c5', name: 'Non-Veg - 9 Pc Crispy Wings (3 Dip)', price: 270, isAvailable: true },
  { id: 'm34', categoryId: 'c5', name: 'Non-Veg - 20 Pc Crispy Wings (6 Dip)', price: 600, isAvailable: true },
  { id: 'm35', categoryId: 'c5', name: 'Non-Veg - 60 Pc Crispy Wings (12 Dip)', price: 1500, isAvailable: true },
  { id: 'm36', categoryId: 'c5', name: 'Non-Veg - 3 Pc Crispy Strips (1 Dip)', price: 120, isAvailable: true },
  { id: 'm37', categoryId: 'c5', name: 'Non-Veg - 6 Pc Crispy Strips (2 Dip)', price: 240, isAvailable: true },
  { id: 'm38', categoryId: 'c5', name: 'Non-Veg - 9 Pc Crispy Strips (3 Dip)', price: 360, isAvailable: true },
  { id: 'm39', categoryId: 'c5', name: 'Non-Veg - 20 Pc Crispy Strips (6 Dip)', price: 800, isAvailable: true },
  { id: 'm40', categoryId: 'c5', name: 'Non-Veg - 60 Pc Crispy Strips (12 Dip)', price: 2400, isAvailable: true },
  { id: 'm41', categoryId: 'c6', name: 'Veg - Vanilla Shake (Regular)', price: 79, isAvailable: true },
  { id: 'm42', categoryId: 'c6', name: 'Veg - Vanilla Shake (Large)', price: 139, isAvailable: true },
  { id: 'm43', categoryId: 'c6', name: 'Veg - Strawberry Shake (Regular)', price: 79, isAvailable: true },
  { id: 'm44', categoryId: 'c6', name: 'Veg - Strawberry Shake (Large)', price: 139, isAvailable: true },
  { id: 'm45', categoryId: 'c6', name: 'Veg - Biscoff Shake (Regular)', price: 79, isAvailable: true },
  { id: 'm46', categoryId: 'c6', name: 'Veg - Biscoff Shake (Large)', price: 139, isAvailable: true },
  { id: 'm47', categoryId: 'c6', name: 'Veg - Oreo Shake (Regular)', price: 79, isAvailable: true },
  { id: 'm48', categoryId: 'c6', name: 'Veg - Oreo Shake (Large)', price: 139, isAvailable: true },
  { id: 'm49', categoryId: 'c6', name: 'Veg - Kunafa Pistachio Shake (Regular)', price: 79, isAvailable: true },
  { id: 'm50', categoryId: 'c6', name: 'Veg - Kunafa Pistachio Shake (Large)', price: 139, isAvailable: true },
  { id: 'm51', categoryId: 'c7', name: 'Veg - Vanilla Softy', price: 39, isAvailable: true },
  { id: 'm52', categoryId: 'c8', name: 'Veg - Chocolate Brownie', price: 99, isAvailable: true },
  { id: 'm53', categoryId: 'c8', name: 'Veg - Blondy Cake', price: 99, isAvailable: true },
  { id: 'm54', categoryId: 'c9', name: 'Veg - Sprite / Coca-Cola (Regular)', price: 59, isAvailable: true },
  { id: 'm55', categoryId: 'c9', name: 'Veg - Sprite / Coca-Cola (Large)', price: 99, isAvailable: true },
  { id: 'm56', categoryId: 'c9', name: 'Veg - Ice Tea (Peach / Lime) (Regular)', price: 59, isAvailable: true },
  { id: 'm57', categoryId: 'c9', name: 'Veg - Ice Tea (Peach / Lime) (Large)', price: 99, isAvailable: true },
  { id: 'm58', categoryId: 'c9', name: 'Veg - Hot Chocolate', price: 99, isAvailable: true },
  { id: 'm59', categoryId: 'c9', name: 'Veg - Signature Tea', price: 99, isAvailable: true }
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
    "id": "r_m1",
    "menuItemId": "m1",
    "menuItemName": "Non-Veg - Spicy Chicken Gyro (Regular)",
    "name": "Non-Veg - Spicy Chicken Gyro (Regular) Recipe",
    "description": "Standard recipe for Non-Veg - Spicy Chicken Gyro (Regular)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 63.6,
    "ingredients": [
      {
        "id": "ri_m1_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Maida",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.89
      },
      {
        "id": "ri_m1_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Yeast",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.89
      },
      {
        "id": "ri_m1_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Sugar",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.89
      },
      {
        "id": "ri_m1_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Iceberg",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.89
      },
      {
        "id": "ri_m1_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Veggies",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.89
      },
      {
        "id": "ri_m1_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Olives",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.89
      },
      {
        "id": "ri_m1_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Jalapenos",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.89
      },
      {
        "id": "ri_m1_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Spicy Chicken",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.89
      },
      {
        "id": "ri_m1_9",
        "inventoryItemId": "i_gen_9",
        "inventoryName": "Hummus",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.89
      },
      {
        "id": "ri_m1_10",
        "inventoryItemId": "i_gen_10",
        "inventoryName": "Peri Peri",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.89
      },
      {
        "id": "ri_m1_11",
        "inventoryItemId": "i_gen_11",
        "inventoryName": "Honey Mustard",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.89
      },
      {
        "id": "ri_m1_12",
        "inventoryItemId": "i_gen_12",
        "inventoryName": "Packaging",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.89
      },
      {
        "id": "ri_m1_13",
        "inventoryItemId": "i_gen_13",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.89
      }
    ]
  },
  {
    "id": "r_m2",
    "menuItemId": "m2",
    "menuItemName": "Non-Veg - Spicy Chicken Gyro (Large)",
    "name": "Non-Veg - Spicy Chicken Gyro (Large) Recipe",
    "description": "Standard recipe for Non-Veg - Spicy Chicken Gyro (Large)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 95.8,
    "ingredients": [
      {
        "id": "ri_m2_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Maida",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.37
      },
      {
        "id": "ri_m2_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Yeast",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.37
      },
      {
        "id": "ri_m2_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Sugar",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.37
      },
      {
        "id": "ri_m2_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Iceberg",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.37
      },
      {
        "id": "ri_m2_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Veggies",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.37
      },
      {
        "id": "ri_m2_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Olives",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.37
      },
      {
        "id": "ri_m2_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Jalapenos",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.37
      },
      {
        "id": "ri_m2_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Spicy Chicken",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.37
      },
      {
        "id": "ri_m2_9",
        "inventoryItemId": "i_gen_9",
        "inventoryName": "Hummus",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.37
      },
      {
        "id": "ri_m2_10",
        "inventoryItemId": "i_gen_10",
        "inventoryName": "Peri Peri",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.37
      },
      {
        "id": "ri_m2_11",
        "inventoryItemId": "i_gen_11",
        "inventoryName": "Honey Mustard",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.37
      },
      {
        "id": "ri_m2_12",
        "inventoryItemId": "i_gen_12",
        "inventoryName": "Packaging",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.37
      },
      {
        "id": "ri_m2_13",
        "inventoryItemId": "i_gen_13",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.37
      }
    ]
  },
  {
    "id": "r_m3",
    "menuItemId": "m3",
    "menuItemName": "Non-Veg - Cream Chicken Gyro (Regular)",
    "name": "Non-Veg - Cream Chicken Gyro (Regular) Recipe",
    "description": "Standard recipe for Non-Veg - Cream Chicken Gyro (Regular)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 62.21,
    "ingredients": [
      {
        "id": "ri_m3_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Maida",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.79
      },
      {
        "id": "ri_m3_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Yeast",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.79
      },
      {
        "id": "ri_m3_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Sugar",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.79
      },
      {
        "id": "ri_m3_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Iceberg",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.79
      },
      {
        "id": "ri_m3_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Veggies",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.79
      },
      {
        "id": "ri_m3_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Olives",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.79
      },
      {
        "id": "ri_m3_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Jalapenos",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.79
      },
      {
        "id": "ri_m3_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Cream Chicken",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.79
      },
      {
        "id": "ri_m3_9",
        "inventoryItemId": "i_gen_9",
        "inventoryName": "Hummus",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.79
      },
      {
        "id": "ri_m3_10",
        "inventoryItemId": "i_gen_10",
        "inventoryName": "Peri Peri",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.79
      },
      {
        "id": "ri_m3_11",
        "inventoryItemId": "i_gen_11",
        "inventoryName": "Honey Mustard",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.79
      },
      {
        "id": "ri_m3_12",
        "inventoryItemId": "i_gen_12",
        "inventoryName": "Packaging",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.79
      },
      {
        "id": "ri_m3_13",
        "inventoryItemId": "i_gen_13",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.79
      }
    ]
  },
  {
    "id": "r_m4",
    "menuItemId": "m4",
    "menuItemName": "Non-Veg - Cream Chicken Gyro (Large)",
    "name": "Non-Veg - Cream Chicken Gyro (Large) Recipe",
    "description": "Standard recipe for Non-Veg - Cream Chicken Gyro (Large)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 93.01,
    "ingredients": [
      {
        "id": "ri_m4_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Maida",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.15
      },
      {
        "id": "ri_m4_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Yeast",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.15
      },
      {
        "id": "ri_m4_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Sugar",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.15
      },
      {
        "id": "ri_m4_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Iceberg",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.15
      },
      {
        "id": "ri_m4_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Veggies",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.15
      },
      {
        "id": "ri_m4_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Olives",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.15
      },
      {
        "id": "ri_m4_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Jalapenos",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.15
      },
      {
        "id": "ri_m4_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Cream Chicken",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.15
      },
      {
        "id": "ri_m4_9",
        "inventoryItemId": "i_gen_9",
        "inventoryName": "Hummus",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.15
      },
      {
        "id": "ri_m4_10",
        "inventoryItemId": "i_gen_10",
        "inventoryName": "Peri Peri",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.15
      },
      {
        "id": "ri_m4_11",
        "inventoryItemId": "i_gen_11",
        "inventoryName": "Honey Mustard",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.15
      },
      {
        "id": "ri_m4_12",
        "inventoryItemId": "i_gen_12",
        "inventoryName": "Packaging",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.15
      },
      {
        "id": "ri_m4_13",
        "inventoryItemId": "i_gen_13",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.15
      }
    ]
  },
  {
    "id": "r_m5",
    "menuItemId": "m5",
    "menuItemName": "Non-Veg - BBQ Chicken Gyro (Regular)",
    "name": "Non-Veg - BBQ Chicken Gyro (Regular) Recipe",
    "description": "Standard recipe for Non-Veg - BBQ Chicken Gyro (Regular)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 62.95,
    "ingredients": [
      {
        "id": "ri_m5_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Maida",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.84
      },
      {
        "id": "ri_m5_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Yeast",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.84
      },
      {
        "id": "ri_m5_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Sugar",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.84
      },
      {
        "id": "ri_m5_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Iceberg",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.84
      },
      {
        "id": "ri_m5_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Veggies",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.84
      },
      {
        "id": "ri_m5_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Olives",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.84
      },
      {
        "id": "ri_m5_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Jalapenos",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.84
      },
      {
        "id": "ri_m5_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "BBQ Chicken",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.84
      },
      {
        "id": "ri_m5_9",
        "inventoryItemId": "i_gen_9",
        "inventoryName": "Hummus",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.84
      },
      {
        "id": "ri_m5_10",
        "inventoryItemId": "i_gen_10",
        "inventoryName": "Peri Peri",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.84
      },
      {
        "id": "ri_m5_11",
        "inventoryItemId": "i_gen_11",
        "inventoryName": "Honey Mustard",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.84
      },
      {
        "id": "ri_m5_12",
        "inventoryItemId": "i_gen_12",
        "inventoryName": "Packaging",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.84
      },
      {
        "id": "ri_m5_13",
        "inventoryItemId": "i_gen_13",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.84
      }
    ]
  },
  {
    "id": "r_m6",
    "menuItemId": "m6",
    "menuItemName": "Non-Veg - BBQ Chicken Gyro (Large)",
    "name": "Non-Veg - BBQ Chicken Gyro (Large) Recipe",
    "description": "Standard recipe for Non-Veg - BBQ Chicken Gyro (Large)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 92.65,
    "ingredients": [
      {
        "id": "ri_m6_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Maida",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.13
      },
      {
        "id": "ri_m6_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Yeast",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.13
      },
      {
        "id": "ri_m6_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Sugar",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.13
      },
      {
        "id": "ri_m6_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Iceberg",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.13
      },
      {
        "id": "ri_m6_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Veggies",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.13
      },
      {
        "id": "ri_m6_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Olives",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.13
      },
      {
        "id": "ri_m6_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Jalapenos",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.13
      },
      {
        "id": "ri_m6_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "BBQ Chicken",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.13
      },
      {
        "id": "ri_m6_9",
        "inventoryItemId": "i_gen_9",
        "inventoryName": "Hummus",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.13
      },
      {
        "id": "ri_m6_10",
        "inventoryItemId": "i_gen_10",
        "inventoryName": "Peri Peri",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.13
      },
      {
        "id": "ri_m6_11",
        "inventoryItemId": "i_gen_11",
        "inventoryName": "Honey Mustard",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.13
      },
      {
        "id": "ri_m6_12",
        "inventoryItemId": "i_gen_12",
        "inventoryName": "Packaging",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.13
      },
      {
        "id": "ri_m6_13",
        "inventoryItemId": "i_gen_13",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.13
      }
    ]
  },
  {
    "id": "r_m7",
    "menuItemId": "m7",
    "menuItemName": "Non-Veg - Pesto Chicken Gyro (Regular)",
    "name": "Non-Veg - Pesto Chicken Gyro (Regular) Recipe",
    "description": "Standard recipe for Non-Veg - Pesto Chicken Gyro (Regular)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 67.59,
    "ingredients": [
      {
        "id": "ri_m7_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Maida",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.2
      },
      {
        "id": "ri_m7_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Yeast",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.2
      },
      {
        "id": "ri_m7_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Sugar",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.2
      },
      {
        "id": "ri_m7_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Iceberg",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.2
      },
      {
        "id": "ri_m7_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Veggies",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.2
      },
      {
        "id": "ri_m7_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Olives",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.2
      },
      {
        "id": "ri_m7_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Jalapenos",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.2
      },
      {
        "id": "ri_m7_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Pesto Chicken",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.2
      },
      {
        "id": "ri_m7_9",
        "inventoryItemId": "i_gen_9",
        "inventoryName": "Hummus",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.2
      },
      {
        "id": "ri_m7_10",
        "inventoryItemId": "i_gen_10",
        "inventoryName": "Peri Peri",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.2
      },
      {
        "id": "ri_m7_11",
        "inventoryItemId": "i_gen_11",
        "inventoryName": "Honey Mustard",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.2
      },
      {
        "id": "ri_m7_12",
        "inventoryItemId": "i_gen_12",
        "inventoryName": "Packaging",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.2
      },
      {
        "id": "ri_m7_13",
        "inventoryItemId": "i_gen_13",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.2
      }
    ]
  },
  {
    "id": "r_m8",
    "menuItemId": "m8",
    "menuItemName": "Non-Veg - Pesto Chicken Gyro (Large)",
    "name": "Non-Veg - Pesto Chicken Gyro (Large) Recipe",
    "description": "Standard recipe for Non-Veg - Pesto Chicken Gyro (Large)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 103.79,
    "ingredients": [
      {
        "id": "ri_m8_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Maida",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.98
      },
      {
        "id": "ri_m8_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Yeast",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.98
      },
      {
        "id": "ri_m8_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Sugar",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.98
      },
      {
        "id": "ri_m8_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Iceberg",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.98
      },
      {
        "id": "ri_m8_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Veggies",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.98
      },
      {
        "id": "ri_m8_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Olives",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.98
      },
      {
        "id": "ri_m8_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Jalapenos",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.98
      },
      {
        "id": "ri_m8_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Pesto Chicken",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.98
      },
      {
        "id": "ri_m8_9",
        "inventoryItemId": "i_gen_9",
        "inventoryName": "Hummus",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.98
      },
      {
        "id": "ri_m8_10",
        "inventoryItemId": "i_gen_10",
        "inventoryName": "Peri Peri",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.98
      },
      {
        "id": "ri_m8_11",
        "inventoryItemId": "i_gen_11",
        "inventoryName": "Honey Mustard",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.98
      },
      {
        "id": "ri_m8_12",
        "inventoryItemId": "i_gen_12",
        "inventoryName": "Packaging",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.98
      },
      {
        "id": "ri_m8_13",
        "inventoryItemId": "i_gen_13",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.98
      }
    ]
  },
  {
    "id": "r_m9",
    "menuItemId": "m9",
    "menuItemName": "Veg - Spicy Paneer Gyro (Regular)",
    "name": "Veg - Spicy Paneer Gyro (Regular) Recipe",
    "description": "Standard recipe for Veg - Spicy Paneer Gyro (Regular)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 71.64,
    "ingredients": [
      {
        "id": "ri_m9_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Maida",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.51
      },
      {
        "id": "ri_m9_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Yeast",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.51
      },
      {
        "id": "ri_m9_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Sugar",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.51
      },
      {
        "id": "ri_m9_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Iceberg",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.51
      },
      {
        "id": "ri_m9_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Veggies",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.51
      },
      {
        "id": "ri_m9_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Olives",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.51
      },
      {
        "id": "ri_m9_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Jalapenos",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.51
      },
      {
        "id": "ri_m9_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Spicy Paneer",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.51
      },
      {
        "id": "ri_m9_9",
        "inventoryItemId": "i_gen_9",
        "inventoryName": "Hummus",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.51
      },
      {
        "id": "ri_m9_10",
        "inventoryItemId": "i_gen_10",
        "inventoryName": "Peri Peri",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.51
      },
      {
        "id": "ri_m9_11",
        "inventoryItemId": "i_gen_11",
        "inventoryName": "Honey Mustard",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.51
      },
      {
        "id": "ri_m9_12",
        "inventoryItemId": "i_gen_12",
        "inventoryName": "Packaging",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.51
      },
      {
        "id": "ri_m9_13",
        "inventoryItemId": "i_gen_13",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.51
      }
    ]
  },
  {
    "id": "r_m10",
    "menuItemId": "m10",
    "menuItemName": "Veg - Spicy Paneer Gyro (Large)",
    "name": "Veg - Spicy Paneer Gyro (Large) Recipe",
    "description": "Standard recipe for Veg - Spicy Paneer Gyro (Large)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 111.34,
    "ingredients": [
      {
        "id": "ri_m10_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Maida",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.56
      },
      {
        "id": "ri_m10_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Yeast",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.56
      },
      {
        "id": "ri_m10_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Sugar",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.56
      },
      {
        "id": "ri_m10_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Iceberg",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.56
      },
      {
        "id": "ri_m10_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Veggies",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.56
      },
      {
        "id": "ri_m10_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Olives",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.56
      },
      {
        "id": "ri_m10_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Jalapenos",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.56
      },
      {
        "id": "ri_m10_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Spicy Paneer",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.56
      },
      {
        "id": "ri_m10_9",
        "inventoryItemId": "i_gen_9",
        "inventoryName": "Hummus",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.56
      },
      {
        "id": "ri_m10_10",
        "inventoryItemId": "i_gen_10",
        "inventoryName": "Peri Peri",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.56
      },
      {
        "id": "ri_m10_11",
        "inventoryItemId": "i_gen_11",
        "inventoryName": "Honey Mustard",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.56
      },
      {
        "id": "ri_m10_12",
        "inventoryItemId": "i_gen_12",
        "inventoryName": "Packaging",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.56
      },
      {
        "id": "ri_m10_13",
        "inventoryItemId": "i_gen_13",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.56
      }
    ]
  },
  {
    "id": "r_m11",
    "menuItemId": "m11",
    "menuItemName": "Veg - Cream Paneer Gyro (Regular)",
    "name": "Veg - Cream Paneer Gyro (Regular) Recipe",
    "description": "Standard recipe for Veg - Cream Paneer Gyro (Regular)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 70.25,
    "ingredients": [
      {
        "id": "ri_m11_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Maida",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.4
      },
      {
        "id": "ri_m11_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Yeast",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.4
      },
      {
        "id": "ri_m11_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Sugar",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.4
      },
      {
        "id": "ri_m11_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Iceberg",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.4
      },
      {
        "id": "ri_m11_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Veggies",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.4
      },
      {
        "id": "ri_m11_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Olives",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.4
      },
      {
        "id": "ri_m11_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Jalapenos",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.4
      },
      {
        "id": "ri_m11_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Cream Paneer",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.4
      },
      {
        "id": "ri_m11_9",
        "inventoryItemId": "i_gen_9",
        "inventoryName": "Hummus",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.4
      },
      {
        "id": "ri_m11_10",
        "inventoryItemId": "i_gen_10",
        "inventoryName": "Peri Peri",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.4
      },
      {
        "id": "ri_m11_11",
        "inventoryItemId": "i_gen_11",
        "inventoryName": "Honey Mustard",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.4
      },
      {
        "id": "ri_m11_12",
        "inventoryItemId": "i_gen_12",
        "inventoryName": "Packaging",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.4
      },
      {
        "id": "ri_m11_13",
        "inventoryItemId": "i_gen_13",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.4
      }
    ]
  },
  {
    "id": "r_m12",
    "menuItemId": "m12",
    "menuItemName": "Veg - Cream Paneer Gyro (Large)",
    "name": "Veg - Cream Paneer Gyro (Large) Recipe",
    "description": "Standard recipe for Veg - Cream Paneer Gyro (Large)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 108.55,
    "ingredients": [
      {
        "id": "ri_m12_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Maida",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.35
      },
      {
        "id": "ri_m12_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Yeast",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.35
      },
      {
        "id": "ri_m12_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Sugar",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.35
      },
      {
        "id": "ri_m12_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Iceberg",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.35
      },
      {
        "id": "ri_m12_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Veggies",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.35
      },
      {
        "id": "ri_m12_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Olives",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.35
      },
      {
        "id": "ri_m12_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Jalapenos",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.35
      },
      {
        "id": "ri_m12_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Cream Paneer",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.35
      },
      {
        "id": "ri_m12_9",
        "inventoryItemId": "i_gen_9",
        "inventoryName": "Hummus",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.35
      },
      {
        "id": "ri_m12_10",
        "inventoryItemId": "i_gen_10",
        "inventoryName": "Peri Peri",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.35
      },
      {
        "id": "ri_m12_11",
        "inventoryItemId": "i_gen_11",
        "inventoryName": "Honey Mustard",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.35
      },
      {
        "id": "ri_m12_12",
        "inventoryItemId": "i_gen_12",
        "inventoryName": "Packaging",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.35
      },
      {
        "id": "ri_m12_13",
        "inventoryItemId": "i_gen_13",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.35
      }
    ]
  },
  {
    "id": "r_m13",
    "menuItemId": "m13",
    "menuItemName": "Veg - BBQ Paneer Gyro (Regular)",
    "name": "Veg - BBQ Paneer Gyro (Regular) Recipe",
    "description": "Standard recipe for Veg - BBQ Paneer Gyro (Regular)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 70.45,
    "ingredients": [
      {
        "id": "ri_m13_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Maida",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.42
      },
      {
        "id": "ri_m13_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Yeast",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.42
      },
      {
        "id": "ri_m13_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Sugar",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.42
      },
      {
        "id": "ri_m13_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Iceberg",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.42
      },
      {
        "id": "ri_m13_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Veggies",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.42
      },
      {
        "id": "ri_m13_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Olives",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.42
      },
      {
        "id": "ri_m13_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Jalapenos",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.42
      },
      {
        "id": "ri_m13_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "BBQ Paneer",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.42
      },
      {
        "id": "ri_m13_9",
        "inventoryItemId": "i_gen_9",
        "inventoryName": "Hummus",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.42
      },
      {
        "id": "ri_m13_10",
        "inventoryItemId": "i_gen_10",
        "inventoryName": "Peri Peri",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.42
      },
      {
        "id": "ri_m13_11",
        "inventoryItemId": "i_gen_11",
        "inventoryName": "Honey Mustard",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.42
      },
      {
        "id": "ri_m13_12",
        "inventoryItemId": "i_gen_12",
        "inventoryName": "Packaging",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.42
      },
      {
        "id": "ri_m13_13",
        "inventoryItemId": "i_gen_13",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.42
      }
    ]
  },
  {
    "id": "r_m14",
    "menuItemId": "m14",
    "menuItemName": "Veg - BBQ Paneer Gyro (Large)",
    "name": "Veg - BBQ Paneer Gyro (Large) Recipe",
    "description": "Standard recipe for Veg - BBQ Paneer Gyro (Large)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 107.65,
    "ingredients": [
      {
        "id": "ri_m14_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Maida",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.28
      },
      {
        "id": "ri_m14_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Yeast",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.28
      },
      {
        "id": "ri_m14_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Sugar",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.28
      },
      {
        "id": "ri_m14_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Iceberg",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.28
      },
      {
        "id": "ri_m14_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Veggies",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.28
      },
      {
        "id": "ri_m14_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Olives",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.28
      },
      {
        "id": "ri_m14_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Jalapenos",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.28
      },
      {
        "id": "ri_m14_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "BBQ Paneer",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.28
      },
      {
        "id": "ri_m14_9",
        "inventoryItemId": "i_gen_9",
        "inventoryName": "Hummus",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.28
      },
      {
        "id": "ri_m14_10",
        "inventoryItemId": "i_gen_10",
        "inventoryName": "Peri Peri",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.28
      },
      {
        "id": "ri_m14_11",
        "inventoryItemId": "i_gen_11",
        "inventoryName": "Honey Mustard",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.28
      },
      {
        "id": "ri_m14_12",
        "inventoryItemId": "i_gen_12",
        "inventoryName": "Packaging",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.28
      },
      {
        "id": "ri_m14_13",
        "inventoryItemId": "i_gen_13",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.28
      }
    ]
  },
  {
    "id": "r_m15",
    "menuItemId": "m15",
    "menuItemName": "Veg - Pesto Paneer Gyro (Regular)",
    "name": "Veg - Pesto Paneer Gyro (Regular) Recipe",
    "description": "Standard recipe for Veg - Pesto Paneer Gyro (Regular)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 75.63,
    "ingredients": [
      {
        "id": "ri_m15_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Maida",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.82
      },
      {
        "id": "ri_m15_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Yeast",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.82
      },
      {
        "id": "ri_m15_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Sugar",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.82
      },
      {
        "id": "ri_m15_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Iceberg",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.82
      },
      {
        "id": "ri_m15_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Veggies",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.82
      },
      {
        "id": "ri_m15_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Olives",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.82
      },
      {
        "id": "ri_m15_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Jalapenos",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.82
      },
      {
        "id": "ri_m15_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Pesto Paneer",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.82
      },
      {
        "id": "ri_m15_9",
        "inventoryItemId": "i_gen_9",
        "inventoryName": "Hummus",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.82
      },
      {
        "id": "ri_m15_10",
        "inventoryItemId": "i_gen_10",
        "inventoryName": "Peri Peri",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.82
      },
      {
        "id": "ri_m15_11",
        "inventoryItemId": "i_gen_11",
        "inventoryName": "Honey Mustard",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.82
      },
      {
        "id": "ri_m15_12",
        "inventoryItemId": "i_gen_12",
        "inventoryName": "Packaging",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.82
      },
      {
        "id": "ri_m15_13",
        "inventoryItemId": "i_gen_13",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.82
      }
    ]
  },
  {
    "id": "r_m16",
    "menuItemId": "m16",
    "menuItemName": "Veg - Pesto Paneer Gyro (Large)",
    "name": "Veg - Pesto Paneer Gyro (Large) Recipe",
    "description": "Standard recipe for Veg - Pesto Paneer Gyro (Large)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 119.33,
    "ingredients": [
      {
        "id": "ri_m16_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Maida",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.18
      },
      {
        "id": "ri_m16_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Yeast",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.18
      },
      {
        "id": "ri_m16_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Sugar",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.18
      },
      {
        "id": "ri_m16_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Iceberg",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.18
      },
      {
        "id": "ri_m16_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Veggies",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.18
      },
      {
        "id": "ri_m16_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Olives",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.18
      },
      {
        "id": "ri_m16_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Jalapenos",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.18
      },
      {
        "id": "ri_m16_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Pesto Paneer",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.18
      },
      {
        "id": "ri_m16_9",
        "inventoryItemId": "i_gen_9",
        "inventoryName": "Hummus",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.18
      },
      {
        "id": "ri_m16_10",
        "inventoryItemId": "i_gen_10",
        "inventoryName": "Peri Peri",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.18
      },
      {
        "id": "ri_m16_11",
        "inventoryItemId": "i_gen_11",
        "inventoryName": "Honey Mustard",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.18
      },
      {
        "id": "ri_m16_12",
        "inventoryItemId": "i_gen_12",
        "inventoryName": "Packaging",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.18
      },
      {
        "id": "ri_m16_13",
        "inventoryItemId": "i_gen_13",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.18
      }
    ]
  },
  {
    "id": "r_m17",
    "menuItemId": "m17",
    "menuItemName": "Non-Veg - Spicy Egg Burger",
    "name": "Non-Veg - Spicy Egg Burger Recipe",
    "description": "Standard recipe for Non-Veg - Spicy Egg Burger",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 57.03,
    "ingredients": [
      {
        "id": "ri_m17_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Burger Bun",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.15
      },
      {
        "id": "ri_m17_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Veggies",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.15
      },
      {
        "id": "ri_m17_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Patty x1",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.15
      },
      {
        "id": "ri_m17_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Cheese",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.15
      },
      {
        "id": "ri_m17_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Burger Sauce",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.15
      },
      {
        "id": "ri_m17_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Packaging",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.15
      },
      {
        "id": "ri_m17_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.15
      }
    ]
  },
  {
    "id": "r_m18",
    "menuItemId": "m18",
    "menuItemName": "Non-Veg - Crispy Chicken Burger",
    "name": "Non-Veg - Crispy Chicken Burger Recipe",
    "description": "Standard recipe for Non-Veg - Crispy Chicken Burger",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 77.43,
    "ingredients": [
      {
        "id": "ri_m18_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Burger Bun",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.06
      },
      {
        "id": "ri_m18_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Veggies",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.06
      },
      {
        "id": "ri_m18_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Patty x2",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.06
      },
      {
        "id": "ri_m18_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Cheese",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.06
      },
      {
        "id": "ri_m18_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Burger Sauce",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.06
      },
      {
        "id": "ri_m18_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Packaging",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.06
      },
      {
        "id": "ri_m18_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.06
      }
    ]
  },
  {
    "id": "r_m19",
    "menuItemId": "m19",
    "menuItemName": "Veg - Spicy Paneer Burger",
    "name": "Veg - Spicy Paneer Burger Recipe",
    "description": "Standard recipe for Veg - Spicy Paneer Burger",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 87.31,
    "ingredients": [
      {
        "id": "ri_m19_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Burger Bun",
        "quantity": 1,
        "unit": "unit",
        "cost": 12.47
      },
      {
        "id": "ri_m19_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Veggies",
        "quantity": 1,
        "unit": "unit",
        "cost": 12.47
      },
      {
        "id": "ri_m19_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Patty x1",
        "quantity": 1,
        "unit": "unit",
        "cost": 12.47
      },
      {
        "id": "ri_m19_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Cheese",
        "quantity": 1,
        "unit": "unit",
        "cost": 12.47
      },
      {
        "id": "ri_m19_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Burger Sauce",
        "quantity": 1,
        "unit": "unit",
        "cost": 12.47
      },
      {
        "id": "ri_m19_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Packaging",
        "quantity": 1,
        "unit": "unit",
        "cost": 12.47
      },
      {
        "id": "ri_m19_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 12.47
      }
    ]
  },
  {
    "id": "r_m20",
    "menuItemId": "m20",
    "menuItemName": "Non-Veg - Chicken Salad",
    "name": "Non-Veg - Chicken Salad Recipe",
    "description": "Standard recipe for Non-Veg - Chicken Salad",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 69.05,
    "ingredients": [
      {
        "id": "ri_m20_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Iceberg",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.75
      },
      {
        "id": "ri_m20_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Veggies",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.75
      },
      {
        "id": "ri_m20_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Olives",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.75
      },
      {
        "id": "ri_m20_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Chicken",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.75
      },
      {
        "id": "ri_m20_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Honey Mustard",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.75
      },
      {
        "id": "ri_m20_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Burger Sauce",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.75
      },
      {
        "id": "ri_m20_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Jalapenos",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.75
      },
      {
        "id": "ri_m20_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Dinning Tray",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.75
      },
      {
        "id": "ri_m20_9",
        "inventoryItemId": "i_gen_9",
        "inventoryName": "Wooden Spoon",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.75
      },
      {
        "id": "ri_m20_10",
        "inventoryItemId": "i_gen_10",
        "inventoryName": "Tissues",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.75
      },
      {
        "id": "ri_m20_11",
        "inventoryItemId": "i_gen_11",
        "inventoryName": "Bags",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.75
      },
      {
        "id": "ri_m20_12",
        "inventoryItemId": "i_gen_12",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.75
      }
    ]
  },
  {
    "id": "r_m21",
    "menuItemId": "m21",
    "menuItemName": "Veg - Paneer Salad",
    "name": "Veg - Paneer Salad Recipe",
    "description": "Standard recipe for Veg - Paneer Salad",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 76.18,
    "ingredients": [
      {
        "id": "ri_m21_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Iceberg",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.35
      },
      {
        "id": "ri_m21_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Veggies",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.35
      },
      {
        "id": "ri_m21_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Paneer",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.35
      },
      {
        "id": "ri_m21_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Olives",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.35
      },
      {
        "id": "ri_m21_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Honey Mustard",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.35
      },
      {
        "id": "ri_m21_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Burger Sauce",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.35
      },
      {
        "id": "ri_m21_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Jalapenos",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.35
      },
      {
        "id": "ri_m21_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Dinning Tray",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.35
      },
      {
        "id": "ri_m21_9",
        "inventoryItemId": "i_gen_9",
        "inventoryName": "Wooden Spoon",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.35
      },
      {
        "id": "ri_m21_10",
        "inventoryItemId": "i_gen_10",
        "inventoryName": "Tissues",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.35
      },
      {
        "id": "ri_m21_11",
        "inventoryItemId": "i_gen_11",
        "inventoryName": "Bags",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.35
      },
      {
        "id": "ri_m21_12",
        "inventoryItemId": "i_gen_12",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.35
      }
    ]
  },
  {
    "id": "r_m22",
    "menuItemId": "m22",
    "menuItemName": "Non-Veg - Loaded Chicken Fries",
    "name": "Non-Veg - Loaded Chicken Fries Recipe",
    "description": "Standard recipe for Non-Veg - Loaded Chicken Fries",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 98.5,
    "ingredients": [
      {
        "id": "ri_m22_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Potato",
        "quantity": 1,
        "unit": "unit",
        "cost": 14.07
      },
      {
        "id": "ri_m22_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Refined Oil",
        "quantity": 1,
        "unit": "unit",
        "cost": 14.07
      },
      {
        "id": "ri_m22_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Chicken Bits",
        "quantity": 1,
        "unit": "unit",
        "cost": 14.07
      },
      {
        "id": "ri_m22_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Cheese Sauce",
        "quantity": 1,
        "unit": "unit",
        "cost": 14.07
      },
      {
        "id": "ri_m22_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Tissues",
        "quantity": 1,
        "unit": "unit",
        "cost": 14.07
      },
      {
        "id": "ri_m22_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Bags",
        "quantity": 1,
        "unit": "unit",
        "cost": 14.07
      },
      {
        "id": "ri_m22_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 14.07
      }
    ]
  },
  {
    "id": "r_m23",
    "menuItemId": "m23",
    "menuItemName": "Veg - Fries (Salted, Peri Peri Or Cajun)",
    "name": "Veg - Fries (Salted, Peri Peri Or Cajun) Recipe",
    "description": "Standard recipe for Veg - Fries (Salted, Peri Peri Or Cajun)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 47.53,
    "ingredients": [
      {
        "id": "ri_m23_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Potato",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.94
      },
      {
        "id": "ri_m23_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Refined Oil",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.94
      },
      {
        "id": "ri_m23_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Peri Peri Masala",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.94
      },
      {
        "id": "ri_m23_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Cup",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.94
      },
      {
        "id": "ri_m23_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Paper Bags",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.94
      },
      {
        "id": "ri_m23_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Tissues",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.94
      },
      {
        "id": "ri_m23_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Bags",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.94
      },
      {
        "id": "ri_m23_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.94
      }
    ]
  },
  {
    "id": "r_m24",
    "menuItemId": "m24",
    "menuItemName": "Veg - Loaded Paneer Fries",
    "name": "Veg - Loaded Paneer Fries Recipe",
    "description": "Standard recipe for Veg - Loaded Paneer Fries",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 105.2,
    "ingredients": [
      {
        "id": "ri_m24_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Potato",
        "quantity": 1,
        "unit": "unit",
        "cost": 15.03
      },
      {
        "id": "ri_m24_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Refined Oil",
        "quantity": 1,
        "unit": "unit",
        "cost": 15.03
      },
      {
        "id": "ri_m24_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Paneer Bits",
        "quantity": 1,
        "unit": "unit",
        "cost": 15.03
      },
      {
        "id": "ri_m24_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Cheese Sauce",
        "quantity": 1,
        "unit": "unit",
        "cost": 15.03
      },
      {
        "id": "ri_m24_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Tissues",
        "quantity": 1,
        "unit": "unit",
        "cost": 15.03
      },
      {
        "id": "ri_m24_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Bags",
        "quantity": 1,
        "unit": "unit",
        "cost": 15.03
      },
      {
        "id": "ri_m24_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 15.03
      }
    ]
  },
  {
    "id": "r_m25",
    "menuItemId": "m25",
    "menuItemName": "Veg - 6 pcs Halloumi Strips",
    "name": "Veg - 6 pcs Halloumi Strips Recipe",
    "description": "Standard recipe for Veg - 6 pcs Halloumi Strips",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 78.9,
    "ingredients": [
      {
        "id": "ri_m25_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Halloumi Cheese x6",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.27
      },
      {
        "id": "ri_m25_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Breading Mixer",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.27
      },
      {
        "id": "ri_m25_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Refined Oil",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.27
      },
      {
        "id": "ri_m25_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Tray",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.27
      },
      {
        "id": "ri_m25_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Tissues",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.27
      },
      {
        "id": "ri_m25_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Bags",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.27
      },
      {
        "id": "ri_m25_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.27
      }
    ]
  },
  {
    "id": "r_m26",
    "menuItemId": "m26",
    "menuItemName": "Non-Veg - 1 Pc Crispy Chicken (1 Dip)",
    "name": "Non-Veg - 1 Pc Crispy Chicken (1 Dip) Recipe",
    "description": "Standard recipe for Non-Veg - 1 Pc Crispy Chicken (1 Dip)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 38.5,
    "ingredients": [
      {
        "id": "ri_m26_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Chicken Leg/Thigh x1",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.42
      },
      {
        "id": "ri_m26_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Breading Mixer",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.42
      },
      {
        "id": "ri_m26_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Refined Oil",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.42
      },
      {
        "id": "ri_m26_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Dip x1",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.42
      },
      {
        "id": "ri_m26_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Box",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.42
      },
      {
        "id": "ri_m26_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.42
      }
    ]
  },
  {
    "id": "r_m27",
    "menuItemId": "m27",
    "menuItemName": "Non-Veg - 2 Pc Crispy Chicken (1 Dip)",
    "name": "Non-Veg - 2 Pc Crispy Chicken (1 Dip) Recipe",
    "description": "Standard recipe for Non-Veg - 2 Pc Crispy Chicken (1 Dip)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 72.1,
    "ingredients": [
      {
        "id": "ri_m27_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Chicken Leg/Thigh x2",
        "quantity": 1,
        "unit": "unit",
        "cost": 12.02
      },
      {
        "id": "ri_m27_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Breading Mixer",
        "quantity": 1,
        "unit": "unit",
        "cost": 12.02
      },
      {
        "id": "ri_m27_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Refined Oil",
        "quantity": 1,
        "unit": "unit",
        "cost": 12.02
      },
      {
        "id": "ri_m27_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Dip x1",
        "quantity": 1,
        "unit": "unit",
        "cost": 12.02
      },
      {
        "id": "ri_m27_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Box",
        "quantity": 1,
        "unit": "unit",
        "cost": 12.02
      },
      {
        "id": "ri_m27_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 12.02
      }
    ]
  },
  {
    "id": "r_m28",
    "menuItemId": "m28",
    "menuItemName": "Non-Veg - 4 Pc Crispy Chicken (2 Dip)",
    "name": "Non-Veg - 4 Pc Crispy Chicken (2 Dip) Recipe",
    "description": "Standard recipe for Non-Veg - 4 Pc Crispy Chicken (2 Dip)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 138.5,
    "ingredients": [
      {
        "id": "ri_m28_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Chicken Leg/Thigh x4",
        "quantity": 1,
        "unit": "unit",
        "cost": 23.08
      },
      {
        "id": "ri_m28_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Breading Mixer",
        "quantity": 1,
        "unit": "unit",
        "cost": 23.08
      },
      {
        "id": "ri_m28_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Refined Oil",
        "quantity": 1,
        "unit": "unit",
        "cost": 23.08
      },
      {
        "id": "ri_m28_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Dip x2",
        "quantity": 1,
        "unit": "unit",
        "cost": 23.08
      },
      {
        "id": "ri_m28_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Box",
        "quantity": 1,
        "unit": "unit",
        "cost": 23.08
      },
      {
        "id": "ri_m28_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 23.08
      }
    ]
  },
  {
    "id": "r_m29",
    "menuItemId": "m29",
    "menuItemName": "Non-Veg - 8 Pc Crispy Chicken (4 Dip)",
    "name": "Non-Veg - 8 Pc Crispy Chicken (4 Dip) Recipe",
    "description": "Standard recipe for Non-Veg - 8 Pc Crispy Chicken (4 Dip)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 268.9,
    "ingredients": [
      {
        "id": "ri_m29_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Chicken Leg/Thigh x8",
        "quantity": 1,
        "unit": "unit",
        "cost": 44.82
      },
      {
        "id": "ri_m29_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Breading Mixer",
        "quantity": 1,
        "unit": "unit",
        "cost": 44.82
      },
      {
        "id": "ri_m29_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Refined Oil",
        "quantity": 1,
        "unit": "unit",
        "cost": 44.82
      },
      {
        "id": "ri_m29_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Dip x4",
        "quantity": 1,
        "unit": "unit",
        "cost": 44.82
      },
      {
        "id": "ri_m29_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Box",
        "quantity": 1,
        "unit": "unit",
        "cost": 44.82
      },
      {
        "id": "ri_m29_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 44.82
      }
    ]
  },
  {
    "id": "r_m30",
    "menuItemId": "m30",
    "menuItemName": "Non-Veg - 12 Pc Crispy Chicken (6 Dip)",
    "name": "Non-Veg - 12 Pc Crispy Chicken (6 Dip) Recipe",
    "description": "Standard recipe for Non-Veg - 12 Pc Crispy Chicken (6 Dip)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 395.2,
    "ingredients": [
      {
        "id": "ri_m30_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Chicken Leg/Thigh x12",
        "quantity": 1,
        "unit": "unit",
        "cost": 65.87
      },
      {
        "id": "ri_m30_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Breading Mixer",
        "quantity": 1,
        "unit": "unit",
        "cost": 65.87
      },
      {
        "id": "ri_m30_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Refined Oil",
        "quantity": 1,
        "unit": "unit",
        "cost": 65.87
      },
      {
        "id": "ri_m30_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Dip x6",
        "quantity": 1,
        "unit": "unit",
        "cost": 65.87
      },
      {
        "id": "ri_m30_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Box",
        "quantity": 1,
        "unit": "unit",
        "cost": 65.87
      },
      {
        "id": "ri_m30_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 65.87
      }
    ]
  },
  {
    "id": "r_m31",
    "menuItemId": "m31",
    "menuItemName": "Non-Veg - 3 Pc Crispy Wings (1 Dip)",
    "name": "Non-Veg - 3 Pc Crispy Wings (1 Dip) Recipe",
    "description": "Standard recipe for Non-Veg - 3 Pc Crispy Wings (1 Dip)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 54.71,
    "ingredients": [
      {
        "id": "ri_m31_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Chicken Wings x3",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.84
      },
      {
        "id": "ri_m31_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Fried Chicken Mixer",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.84
      },
      {
        "id": "ri_m31_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Extra Hot & Spicy",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.84
      },
      {
        "id": "ri_m31_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Refined Oil",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.84
      },
      {
        "id": "ri_m31_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Wings Box",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.84
      },
      {
        "id": "ri_m31_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Tissues",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.84
      },
      {
        "id": "ri_m31_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Bags",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.84
      },
      {
        "id": "ri_m31_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 6.84
      }
    ]
  },
  {
    "id": "r_m32",
    "menuItemId": "m32",
    "menuItemName": "Non-Veg - 6 Pc Crispy Wings (2 Dip)",
    "name": "Non-Veg - 6 Pc Crispy Wings (2 Dip) Recipe",
    "description": "Standard recipe for Non-Veg - 6 Pc Crispy Wings (2 Dip)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 73.61,
    "ingredients": [
      {
        "id": "ri_m32_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Chicken Wings x6",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.2
      },
      {
        "id": "ri_m32_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Fried Chicken Mixer",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.2
      },
      {
        "id": "ri_m32_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Extra Hot & Spicy",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.2
      },
      {
        "id": "ri_m32_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Refined Oil",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.2
      },
      {
        "id": "ri_m32_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Wings Box",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.2
      },
      {
        "id": "ri_m32_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Tissues",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.2
      },
      {
        "id": "ri_m32_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Bags",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.2
      },
      {
        "id": "ri_m32_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.2
      }
    ]
  },
  {
    "id": "r_m33",
    "menuItemId": "m33",
    "menuItemName": "Non-Veg - 9 Pc Crispy Wings (3 Dip)",
    "name": "Non-Veg - 9 Pc Crispy Wings (3 Dip) Recipe",
    "description": "Standard recipe for Non-Veg - 9 Pc Crispy Wings (3 Dip)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 92.51,
    "ingredients": [
      {
        "id": "ri_m33_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Chicken Wings x9",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.56
      },
      {
        "id": "ri_m33_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Fried Chicken Mixer",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.56
      },
      {
        "id": "ri_m33_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Extra Hot & Spicy",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.56
      },
      {
        "id": "ri_m33_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Refined Oil",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.56
      },
      {
        "id": "ri_m33_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Wings Box",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.56
      },
      {
        "id": "ri_m33_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Tissues",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.56
      },
      {
        "id": "ri_m33_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Bags",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.56
      },
      {
        "id": "ri_m33_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.56
      }
    ]
  },
  {
    "id": "r_m34",
    "menuItemId": "m34",
    "menuItemName": "Non-Veg - 20 Pc Crispy Wings (6 Dip)",
    "name": "Non-Veg - 20 Pc Crispy Wings (6 Dip) Recipe",
    "description": "Standard recipe for Non-Veg - 20 Pc Crispy Wings (6 Dip)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 186.55,
    "ingredients": [
      {
        "id": "ri_m34_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Chicken Wings x20",
        "quantity": 1,
        "unit": "unit",
        "cost": 23.32
      },
      {
        "id": "ri_m34_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Fried Chicken Mixer",
        "quantity": 1,
        "unit": "unit",
        "cost": 23.32
      },
      {
        "id": "ri_m34_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Extra Hot & Spicy",
        "quantity": 1,
        "unit": "unit",
        "cost": 23.32
      },
      {
        "id": "ri_m34_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Refined Oil",
        "quantity": 1,
        "unit": "unit",
        "cost": 23.32
      },
      {
        "id": "ri_m34_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Wings Box",
        "quantity": 1,
        "unit": "unit",
        "cost": 23.32
      },
      {
        "id": "ri_m34_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Tissues",
        "quantity": 1,
        "unit": "unit",
        "cost": 23.32
      },
      {
        "id": "ri_m34_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Bags",
        "quantity": 1,
        "unit": "unit",
        "cost": 23.32
      },
      {
        "id": "ri_m34_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 23.32
      }
    ]
  },
  {
    "id": "r_m35",
    "menuItemId": "m35",
    "menuItemName": "Non-Veg - 60 Pc Crispy Wings (12 Dip)",
    "name": "Non-Veg - 60 Pc Crispy Wings (12 Dip) Recipe",
    "description": "Standard recipe for Non-Veg - 60 Pc Crispy Wings (12 Dip)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 398.55,
    "ingredients": [
      {
        "id": "ri_m35_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Chicken Wings x60",
        "quantity": 1,
        "unit": "unit",
        "cost": 49.82
      },
      {
        "id": "ri_m35_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Fried Chicken Mixer",
        "quantity": 1,
        "unit": "unit",
        "cost": 49.82
      },
      {
        "id": "ri_m35_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Extra Hot & Spicy",
        "quantity": 1,
        "unit": "unit",
        "cost": 49.82
      },
      {
        "id": "ri_m35_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Refined Oil",
        "quantity": 1,
        "unit": "unit",
        "cost": 49.82
      },
      {
        "id": "ri_m35_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Wings Box",
        "quantity": 1,
        "unit": "unit",
        "cost": 49.82
      },
      {
        "id": "ri_m35_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Tissues",
        "quantity": 1,
        "unit": "unit",
        "cost": 49.82
      },
      {
        "id": "ri_m35_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Bags",
        "quantity": 1,
        "unit": "unit",
        "cost": 49.82
      },
      {
        "id": "ri_m35_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 49.82
      }
    ]
  },
  {
    "id": "r_m36",
    "menuItemId": "m36",
    "menuItemName": "Non-Veg - 3 Pc Crispy Strips (1 Dip)",
    "name": "Non-Veg - 3 Pc Crispy Strips (1 Dip) Recipe",
    "description": "Standard recipe for Non-Veg - 3 Pc Crispy Strips (1 Dip)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 61.96,
    "ingredients": [
      {
        "id": "ri_m36_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Chicken Strips x3",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.75
      },
      {
        "id": "ri_m36_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Fried Chicken Mixer",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.75
      },
      {
        "id": "ri_m36_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Extra Hot & Spicy",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.75
      },
      {
        "id": "ri_m36_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Refined Oil",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.75
      },
      {
        "id": "ri_m36_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Dinning Tray",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.75
      },
      {
        "id": "ri_m36_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Tissues",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.75
      },
      {
        "id": "ri_m36_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Bags",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.75
      },
      {
        "id": "ri_m36_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 7.75
      }
    ]
  },
  {
    "id": "r_m37",
    "menuItemId": "m37",
    "menuItemName": "Non-Veg - 6 Pc Crispy Strips (2 Dip)",
    "name": "Non-Veg - 6 Pc Crispy Strips (2 Dip) Recipe",
    "description": "Standard recipe for Non-Veg - 6 Pc Crispy Strips (2 Dip)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 90.46,
    "ingredients": [
      {
        "id": "ri_m37_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Chicken Strips x6",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.31
      },
      {
        "id": "ri_m37_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Fried Chicken Mixer",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.31
      },
      {
        "id": "ri_m37_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Extra Hot & Spicy",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.31
      },
      {
        "id": "ri_m37_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Refined Oil",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.31
      },
      {
        "id": "ri_m37_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Dinning Tray",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.31
      },
      {
        "id": "ri_m37_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Tissues",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.31
      },
      {
        "id": "ri_m37_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Bags",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.31
      },
      {
        "id": "ri_m37_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.31
      }
    ]
  },
  {
    "id": "r_m38",
    "menuItemId": "m38",
    "menuItemName": "Non-Veg - 9 Pc Crispy Strips (3 Dip)",
    "name": "Non-Veg - 9 Pc Crispy Strips (3 Dip) Recipe",
    "description": "Standard recipe for Non-Veg - 9 Pc Crispy Strips (3 Dip)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 119.86,
    "ingredients": [
      {
        "id": "ri_m38_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Chicken Strips x9",
        "quantity": 1,
        "unit": "unit",
        "cost": 14.98
      },
      {
        "id": "ri_m38_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Fried Chicken Mixer",
        "quantity": 1,
        "unit": "unit",
        "cost": 14.98
      },
      {
        "id": "ri_m38_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Extra Hot & Spicy",
        "quantity": 1,
        "unit": "unit",
        "cost": 14.98
      },
      {
        "id": "ri_m38_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Refined Oil",
        "quantity": 1,
        "unit": "unit",
        "cost": 14.98
      },
      {
        "id": "ri_m38_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Dinning Tray",
        "quantity": 1,
        "unit": "unit",
        "cost": 14.98
      },
      {
        "id": "ri_m38_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Tissues",
        "quantity": 1,
        "unit": "unit",
        "cost": 14.98
      },
      {
        "id": "ri_m38_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Bags",
        "quantity": 1,
        "unit": "unit",
        "cost": 14.98
      },
      {
        "id": "ri_m38_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 14.98
      }
    ]
  },
  {
    "id": "r_m39",
    "menuItemId": "m39",
    "menuItemName": "Non-Veg - 20 Pc Crispy Strips (6 Dip)",
    "name": "Non-Veg - 20 Pc Crispy Strips (6 Dip) Recipe",
    "description": "Standard recipe for Non-Veg - 20 Pc Crispy Strips (6 Dip)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 247.65,
    "ingredients": [
      {
        "id": "ri_m39_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Chicken Strips x20",
        "quantity": 1,
        "unit": "unit",
        "cost": 30.96
      },
      {
        "id": "ri_m39_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Fried Chicken Mixer",
        "quantity": 1,
        "unit": "unit",
        "cost": 30.96
      },
      {
        "id": "ri_m39_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Extra Hot & Spicy",
        "quantity": 1,
        "unit": "unit",
        "cost": 30.96
      },
      {
        "id": "ri_m39_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Refined Oil",
        "quantity": 1,
        "unit": "unit",
        "cost": 30.96
      },
      {
        "id": "ri_m39_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Dinning Tray",
        "quantity": 1,
        "unit": "unit",
        "cost": 30.96
      },
      {
        "id": "ri_m39_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Tissues",
        "quantity": 1,
        "unit": "unit",
        "cost": 30.96
      },
      {
        "id": "ri_m39_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Bags",
        "quantity": 1,
        "unit": "unit",
        "cost": 30.96
      },
      {
        "id": "ri_m39_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 30.96
      }
    ]
  },
  {
    "id": "r_m40",
    "menuItemId": "m40",
    "menuItemName": "Non-Veg - 60 Pc Crispy Strips (12 Dip)",
    "name": "Non-Veg - 60 Pc Crispy Strips (12 Dip) Recipe",
    "description": "Standard recipe for Non-Veg - 60 Pc Crispy Strips (12 Dip)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 703.9,
    "ingredients": [
      {
        "id": "ri_m40_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Chicken Strips x60",
        "quantity": 1,
        "unit": "unit",
        "cost": 87.99
      },
      {
        "id": "ri_m40_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Fried Chicken Mixer",
        "quantity": 1,
        "unit": "unit",
        "cost": 87.99
      },
      {
        "id": "ri_m40_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Extra Hot & Spicy",
        "quantity": 1,
        "unit": "unit",
        "cost": 87.99
      },
      {
        "id": "ri_m40_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Refined Oil",
        "quantity": 1,
        "unit": "unit",
        "cost": 87.99
      },
      {
        "id": "ri_m40_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Dinning Tray",
        "quantity": 1,
        "unit": "unit",
        "cost": 87.99
      },
      {
        "id": "ri_m40_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Tissues",
        "quantity": 1,
        "unit": "unit",
        "cost": 87.99
      },
      {
        "id": "ri_m40_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Bags",
        "quantity": 1,
        "unit": "unit",
        "cost": 87.99
      },
      {
        "id": "ri_m40_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 87.99
      }
    ]
  },
  {
    "id": "r_m41",
    "menuItemId": "m41",
    "menuItemName": "Veg - Vanilla Shake (Regular)",
    "name": "Veg - Vanilla Shake (Regular) Recipe",
    "description": "Standard recipe for Veg - Vanilla Shake (Regular)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 66.27,
    "ingredients": [
      {
        "id": "ri_m41_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Milk Base",
        "quantity": 1,
        "unit": "unit",
        "cost": 13.25
      },
      {
        "id": "ri_m41_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Vanilla Crush",
        "quantity": 1,
        "unit": "unit",
        "cost": 13.25
      },
      {
        "id": "ri_m41_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Beverages Cup 330ml with Lid",
        "quantity": 1,
        "unit": "unit",
        "cost": 13.25
      },
      {
        "id": "ri_m41_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Paper Straw",
        "quantity": 1,
        "unit": "unit",
        "cost": 13.25
      },
      {
        "id": "ri_m41_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 13.25
      }
    ]
  },
  {
    "id": "r_m42",
    "menuItemId": "m42",
    "menuItemName": "Veg - Vanilla Shake (Large)",
    "name": "Veg - Vanilla Shake (Large) Recipe",
    "description": "Standard recipe for Veg - Vanilla Shake (Large)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 125.95,
    "ingredients": [
      {
        "id": "ri_m42_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Milk Base",
        "quantity": 1,
        "unit": "unit",
        "cost": 25.19
      },
      {
        "id": "ri_m42_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Vanilla Crush",
        "quantity": 1,
        "unit": "unit",
        "cost": 25.19
      },
      {
        "id": "ri_m42_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Beverages Cup 650ml with Lid",
        "quantity": 1,
        "unit": "unit",
        "cost": 25.19
      },
      {
        "id": "ri_m42_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Paper Straw",
        "quantity": 1,
        "unit": "unit",
        "cost": 25.19
      },
      {
        "id": "ri_m42_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 25.19
      }
    ]
  },
  {
    "id": "r_m43",
    "menuItemId": "m43",
    "menuItemName": "Veg - Strawberry Shake (Regular)",
    "name": "Veg - Strawberry Shake (Regular) Recipe",
    "description": "Standard recipe for Veg - Strawberry Shake (Regular)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 93.27,
    "ingredients": [
      {
        "id": "ri_m43_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Milk Base",
        "quantity": 1,
        "unit": "unit",
        "cost": 18.65
      },
      {
        "id": "ri_m43_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Strawberry Crush",
        "quantity": 1,
        "unit": "unit",
        "cost": 18.65
      },
      {
        "id": "ri_m43_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Beverages Cup 330ml with Lid",
        "quantity": 1,
        "unit": "unit",
        "cost": 18.65
      },
      {
        "id": "ri_m43_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Paper Straw",
        "quantity": 1,
        "unit": "unit",
        "cost": 18.65
      },
      {
        "id": "ri_m43_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 18.65
      }
    ]
  },
  {
    "id": "r_m44",
    "menuItemId": "m44",
    "menuItemName": "Veg - Strawberry Shake (Large)",
    "name": "Veg - Strawberry Shake (Large) Recipe",
    "description": "Standard recipe for Veg - Strawberry Shake (Large)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 179.95,
    "ingredients": [
      {
        "id": "ri_m44_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Milk Base",
        "quantity": 1,
        "unit": "unit",
        "cost": 35.99
      },
      {
        "id": "ri_m44_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Strawberry Crush",
        "quantity": 1,
        "unit": "unit",
        "cost": 35.99
      },
      {
        "id": "ri_m44_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Beverages Cup 650ml with Lid",
        "quantity": 1,
        "unit": "unit",
        "cost": 35.99
      },
      {
        "id": "ri_m44_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Paper Straw",
        "quantity": 1,
        "unit": "unit",
        "cost": 35.99
      },
      {
        "id": "ri_m44_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 35.99
      }
    ]
  },
  {
    "id": "r_m45",
    "menuItemId": "m45",
    "menuItemName": "Veg - Biscoff Shake (Regular)",
    "name": "Veg - Biscoff Shake (Regular) Recipe",
    "description": "Standard recipe for Veg - Biscoff Shake (Regular)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 72.27,
    "ingredients": [
      {
        "id": "ri_m45_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Milk Base",
        "quantity": 1,
        "unit": "unit",
        "cost": 14.45
      },
      {
        "id": "ri_m45_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Biscoff Crush",
        "quantity": 1,
        "unit": "unit",
        "cost": 14.45
      },
      {
        "id": "ri_m45_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Beverages Cup 330ml with Lid",
        "quantity": 1,
        "unit": "unit",
        "cost": 14.45
      },
      {
        "id": "ri_m45_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Paper Straw",
        "quantity": 1,
        "unit": "unit",
        "cost": 14.45
      },
      {
        "id": "ri_m45_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 14.45
      }
    ]
  },
  {
    "id": "r_m46",
    "menuItemId": "m46",
    "menuItemName": "Veg - Biscoff Shake (Large)",
    "name": "Veg - Biscoff Shake (Large) Recipe",
    "description": "Standard recipe for Veg - Biscoff Shake (Large)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 137.95,
    "ingredients": [
      {
        "id": "ri_m46_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Milk Base",
        "quantity": 1,
        "unit": "unit",
        "cost": 27.59
      },
      {
        "id": "ri_m46_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Biscoff Crush",
        "quantity": 1,
        "unit": "unit",
        "cost": 27.59
      },
      {
        "id": "ri_m46_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Beverages Cup 650ml with Lid",
        "quantity": 1,
        "unit": "unit",
        "cost": 27.59
      },
      {
        "id": "ri_m46_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Paper Straw",
        "quantity": 1,
        "unit": "unit",
        "cost": 27.59
      },
      {
        "id": "ri_m46_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 27.59
      }
    ]
  },
  {
    "id": "r_m47",
    "menuItemId": "m47",
    "menuItemName": "Veg - Dark Chocolate Shake (Regular)",
    "name": "Veg - Dark Chocolate Shake (Regular) Recipe",
    "description": "Standard recipe for Veg - Dark Chocolate Shake (Regular)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 85.27,
    "ingredients": [
      {
        "id": "ri_m47_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Milk Base",
        "quantity": 1,
        "unit": "unit",
        "cost": 17.05
      },
      {
        "id": "ri_m47_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Caboury Hot Chocolate",
        "quantity": 1,
        "unit": "unit",
        "cost": 17.05
      },
      {
        "id": "ri_m47_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Beverages Cup 330ml with Lid",
        "quantity": 1,
        "unit": "unit",
        "cost": 17.05
      },
      {
        "id": "ri_m47_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Paper Straw",
        "quantity": 1,
        "unit": "unit",
        "cost": 17.05
      },
      {
        "id": "ri_m47_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 17.05
      }
    ]
  },
  {
    "id": "r_m48",
    "menuItemId": "m48",
    "menuItemName": "Veg - Dark Chocolate Shake (Large)",
    "name": "Veg - Dark Chocolate Shake (Large) Recipe",
    "description": "Standard recipe for Veg - Dark Chocolate Shake (Large)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 172.14,
    "ingredients": [
      {
        "id": "ri_m48_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Milk Base",
        "quantity": 1,
        "unit": "unit",
        "cost": 28.69
      },
      {
        "id": "ri_m48_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Caboury Hot Chocolate",
        "quantity": 1,
        "unit": "unit",
        "cost": 28.69
      },
      {
        "id": "ri_m48_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Beverages Cup 650ml with Lid",
        "quantity": 1,
        "unit": "unit",
        "cost": 28.69
      },
      {
        "id": "ri_m48_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Paper Straw",
        "quantity": 1,
        "unit": "unit",
        "cost": 28.69
      },
      {
        "id": "ri_m48_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Wastage",
        "quantity": 1,
        "unit": "unit",
        "cost": 28.69
      },
      {
        "id": "ri_m48_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 28.69
      }
    ]
  },
  {
    "id": "r_m49",
    "menuItemId": "m49",
    "menuItemName": "Veg - Kunafa Pistachio Shake (Regular)",
    "name": "Veg - Kunafa Pistachio Shake (Regular) Recipe",
    "description": "Standard recipe for Veg - Kunafa Pistachio Shake (Regular)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 96.27,
    "ingredients": [
      {
        "id": "ri_m49_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Milk Base",
        "quantity": 1,
        "unit": "unit",
        "cost": 19.25
      },
      {
        "id": "ri_m49_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Pistachio Crush",
        "quantity": 1,
        "unit": "unit",
        "cost": 19.25
      },
      {
        "id": "ri_m49_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Beverages Cup 330ml with Lid",
        "quantity": 1,
        "unit": "unit",
        "cost": 19.25
      },
      {
        "id": "ri_m49_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Paper Straw",
        "quantity": 1,
        "unit": "unit",
        "cost": 19.25
      },
      {
        "id": "ri_m49_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 19.25
      }
    ]
  },
  {
    "id": "r_m50",
    "menuItemId": "m50",
    "menuItemName": "Veg - Kunafa Pistachio Shake (Large)",
    "name": "Veg - Kunafa Pistachio Shake (Large) Recipe",
    "description": "Standard recipe for Veg - Kunafa Pistachio Shake (Large)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 195.24,
    "ingredients": [
      {
        "id": "ri_m50_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Milk Base",
        "quantity": 1,
        "unit": "unit",
        "cost": 32.54
      },
      {
        "id": "ri_m50_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Pistachio Crush",
        "quantity": 1,
        "unit": "unit",
        "cost": 32.54
      },
      {
        "id": "ri_m50_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Beverages Cup 650ml with Lid",
        "quantity": 1,
        "unit": "unit",
        "cost": 32.54
      },
      {
        "id": "ri_m50_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Paper Straw",
        "quantity": 1,
        "unit": "unit",
        "cost": 32.54
      },
      {
        "id": "ri_m50_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Wastage",
        "quantity": 1,
        "unit": "unit",
        "cost": 32.54
      },
      {
        "id": "ri_m50_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 32.54
      }
    ]
  },
  {
    "id": "r_m51",
    "menuItemId": "m51",
    "menuItemName": "Veg - Vanilla Softy",
    "name": "Veg - Vanilla Softy Recipe",
    "description": "Standard recipe for Veg - Vanilla Softy",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 15.8,
    "ingredients": [
      {
        "id": "ri_m51_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Softy Premix",
        "quantity": 1,
        "unit": "unit",
        "cost": 3.95
      },
      {
        "id": "ri_m51_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Milk",
        "quantity": 1,
        "unit": "unit",
        "cost": 3.95
      },
      {
        "id": "ri_m51_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Waffle Cone",
        "quantity": 1,
        "unit": "unit",
        "cost": 3.95
      },
      {
        "id": "ri_m51_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 3.95
      }
    ]
  },
  {
    "id": "r_m52",
    "menuItemId": "m52",
    "menuItemName": "Veg - Chocolate Brownie",
    "name": "Veg - Chocolate Brownie Recipe",
    "description": "Standard recipe for Veg - Chocolate Brownie",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 44.8,
    "ingredients": [
      {
        "id": "ri_m52_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Butter",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.48
      },
      {
        "id": "ri_m52_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Dark Compound",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.48
      },
      {
        "id": "ri_m52_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Egg",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.48
      },
      {
        "id": "ri_m52_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Vanilla",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.48
      },
      {
        "id": "ri_m52_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "White Sugar",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.48
      },
      {
        "id": "ri_m52_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Maida",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.48
      },
      {
        "id": "ri_m52_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Brown Sugar",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.48
      },
      {
        "id": "ri_m52_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Milk Compound",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.48
      },
      {
        "id": "ri_m52_9",
        "inventoryItemId": "i_gen_9",
        "inventoryName": "Packaging",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.48
      },
      {
        "id": "ri_m52_10",
        "inventoryItemId": "i_gen_10",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.48
      }
    ]
  },
  {
    "id": "r_m53",
    "menuItemId": "m53",
    "menuItemName": "Veg - Blondy Cake",
    "name": "Veg - Blondy Cake Recipe",
    "description": "Standard recipe for Veg - Blondy Cake",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 43.6,
    "ingredients": [
      {
        "id": "ri_m53_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Butter",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.45
      },
      {
        "id": "ri_m53_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "White Compound",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.45
      },
      {
        "id": "ri_m53_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Egg",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.45
      },
      {
        "id": "ri_m53_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Vanilla",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.45
      },
      {
        "id": "ri_m53_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "White Sugar",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.45
      },
      {
        "id": "ri_m53_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Maida",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.45
      },
      {
        "id": "ri_m53_7",
        "inventoryItemId": "i_gen_7",
        "inventoryName": "Packaging",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.45
      },
      {
        "id": "ri_m53_8",
        "inventoryItemId": "i_gen_8",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.45
      }
    ]
  },
  {
    "id": "r_m54",
    "menuItemId": "m54",
    "menuItemName": "Veg - Sprite / Coca-Cola (Regular)",
    "name": "Veg - Sprite / Coca-Cola (Regular) Recipe",
    "description": "Standard recipe for Veg - Sprite / Coca-Cola (Regular)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 33.15,
    "ingredients": [
      {
        "id": "ri_m54_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Cola/Sprite 330ml",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.52
      },
      {
        "id": "ri_m54_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Ice Cube",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.52
      },
      {
        "id": "ri_m54_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Lime/Peach",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.52
      },
      {
        "id": "ri_m54_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Cup with Lid",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.52
      },
      {
        "id": "ri_m54_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Straw",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.52
      },
      {
        "id": "ri_m54_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 5.52
      }
    ]
  },
  {
    "id": "r_m55",
    "menuItemId": "m55",
    "menuItemName": "Veg - Sprite / Coca-Cola (Large)",
    "name": "Veg - Sprite / Coca-Cola (Large) Recipe",
    "description": "Standard recipe for Veg - Sprite / Coca-Cola (Large)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 59.7,
    "ingredients": [
      {
        "id": "ri_m55_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Cola/Sprite 650ml",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.95
      },
      {
        "id": "ri_m55_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Ice Cube",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.95
      },
      {
        "id": "ri_m55_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Lime/Peach",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.95
      },
      {
        "id": "ri_m55_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Cup with Lid",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.95
      },
      {
        "id": "ri_m55_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Straw",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.95
      },
      {
        "id": "ri_m55_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 9.95
      }
    ]
  },
  {
    "id": "r_m56",
    "menuItemId": "m56",
    "menuItemName": "Veg - Ice Tea (Peach / Lime) (Regular)",
    "name": "Veg - Ice Tea (Peach / Lime) (Regular) Recipe",
    "description": "Standard recipe for Veg - Ice Tea (Peach / Lime) (Regular)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 28.5,
    "ingredients": [
      {
        "id": "ri_m56_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Ice Tea Premix",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.75
      },
      {
        "id": "ri_m56_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Water",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.75
      },
      {
        "id": "ri_m56_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Ice Cube",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.75
      },
      {
        "id": "ri_m56_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Cup with Lid",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.75
      },
      {
        "id": "ri_m56_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Straw",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.75
      },
      {
        "id": "ri_m56_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 4.75
      }
    ]
  },
  {
    "id": "r_m57",
    "menuItemId": "m57",
    "menuItemName": "Veg - Ice Tea (Peach / Lime) (Large)",
    "name": "Veg - Ice Tea (Peach / Lime) (Large) Recipe",
    "description": "Standard recipe for Veg - Ice Tea (Peach / Lime) (Large)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 48.2,
    "ingredients": [
      {
        "id": "ri_m57_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Ice Tea Premix",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.03
      },
      {
        "id": "ri_m57_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Water",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.03
      },
      {
        "id": "ri_m57_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Ice Cube",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.03
      },
      {
        "id": "ri_m57_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Cup with Lid",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.03
      },
      {
        "id": "ri_m57_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Straw",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.03
      },
      {
        "id": "ri_m57_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 8.03
      }
    ]
  },
  {
    "id": "r_m58",
    "menuItemId": "m58",
    "menuItemName": "Veg - Hot Chocolate",
    "name": "Veg - Hot Chocolate Recipe",
    "description": "Standard recipe for Veg - Hot Chocolate",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 59.29,
    "ingredients": [
      {
        "id": "ri_m58_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Milk",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.86
      },
      {
        "id": "ri_m58_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Caboury Hot Chocolate",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.86
      },
      {
        "id": "ri_m58_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Beverages Cup 330ml with Lid",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.86
      },
      {
        "id": "ri_m58_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Paper Straw",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.86
      },
      {
        "id": "ri_m58_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 11.86
      }
    ]
  },
  {
    "id": "r_m59",
    "menuItemId": "m59",
    "menuItemName": "Veg - Signature Tea",
    "name": "Veg - Signature Tea Recipe",
    "description": "Standard recipe for Veg - Signature Tea",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 18.5,
    "ingredients": [
      {
        "id": "ri_m59_1",
        "inventoryItemId": "i_gen_1",
        "inventoryName": "Tea Leaves",
        "quantity": 1,
        "unit": "unit",
        "cost": 3.08
      },
      {
        "id": "ri_m59_2",
        "inventoryItemId": "i_gen_2",
        "inventoryName": "Milk",
        "quantity": 1,
        "unit": "unit",
        "cost": 3.08
      },
      {
        "id": "ri_m59_3",
        "inventoryItemId": "i_gen_3",
        "inventoryName": "Cardamom",
        "quantity": 1,
        "unit": "unit",
        "cost": 3.08
      },
      {
        "id": "ri_m59_4",
        "inventoryItemId": "i_gen_4",
        "inventoryName": "Sugar",
        "quantity": 1,
        "unit": "unit",
        "cost": 3.08
      },
      {
        "id": "ri_m59_5",
        "inventoryItemId": "i_gen_5",
        "inventoryName": "Cup",
        "quantity": 1,
        "unit": "unit",
        "cost": 3.08
      },
      {
        "id": "ri_m59_6",
        "inventoryItemId": "i_gen_6",
        "inventoryName": "Labour",
        "quantity": 1,
        "unit": "unit",
        "cost": 3.08
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
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getRecipeForItem = (menuItemId) => {
    const item = menuItems.find(m => m.id === menuItemId)
    return recipes.find(r => r.menuItemId === menuItemId || (item && (r.menuItemName === item.name || r.name === `${item.name} Recipe` || r.name.startsWith(item.name))))
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
        setMenuItems(prev => prev.map(i => String(i.id) === String(created.id) ? { ...created, image: imagePreview ? `/uploads/menu/${created.id}.jpg` : null } : [...prev, created]))
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '16px' }}>
            {filteredMenuItems.map(item => {
              const category = categories.find(c => c.id === item.categoryId)
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
                          background: category?.color || '#6b7280',
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
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{category?.name}</span>
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
                    <Button variant="ghost" size="sm" onClick={() => openItemModal(item)}>
                      <Edit size={14} />
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
