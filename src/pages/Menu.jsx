import { useState, useEffect, useRef } from 'react'
import { UtensilsCrossed, Plus, Search, BookOpen, Package, Edit, Copy, Trash2, Check, X, ChevronRight, AlertTriangle, Calculator, ImagePlus, Download, FileSpreadsheet } from 'lucide-react'
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
    "name": "Signature Salad (Chicken) Recipe",
    "description": "Master Recipe sheet for Non-Veg - Signature Chicken Salad (RM: ₹47.67, PM: ₹11.79, Labour: ₹9.60, Total: ₹69.05)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 69.05,
    "rmCost": 47.67,
    "pmCost": 11.79,
    "labourCost": 9.60,
    "ingredients": [
      {
        "id": "ri_m20_1",
        "inventoryItemId": "i_iceberg",
        "inventoryName": "Iceberg Lettuce",
        "quantity": 0.040,
        "unit": "kg",
        "pricePerKg": 273.0,
        "cost": 10.92
      },
      {
        "id": "ri_m20_2",
        "inventoryItemId": "i_onion",
        "inventoryName": "Onion",
        "quantity": 0.015,
        "unit": "kg",
        "pricePerKg": 33.0,
        "cost": 0.50
      },
      {
        "id": "ri_m20_3",
        "inventoryItemId": "i_tomato",
        "inventoryName": "Tomato",
        "quantity": 0.020,
        "unit": "kg",
        "pricePerKg": 73.5,
        "cost": 1.47
      },
      {
        "id": "ri_m20_4",
        "inventoryItemId": "i_cucumber",
        "inventoryName": "Cucumber",
        "quantity": 0.025,
        "unit": "kg",
        "pricePerKg": 84.0,
        "cost": 2.10
      },
      {
        "id": "ri_m20_5",
        "inventoryItemId": "i_capsicum",
        "inventoryName": "Green Capsicum",
        "quantity": 0.015,
        "unit": "kg",
        "pricePerKg": 99.8,
        "cost": 1.50
      },
      {
        "id": "ri_m20_6",
        "inventoryItemId": "i_olives",
        "inventoryName": "Olives",
        "quantity": 0.005,
        "unit": "kg",
        "pricePerKg": 775.0,
        "cost": 3.88
      },
      {
        "id": "ri_m20_7",
        "inventoryItemId": "i_chicken",
        "inventoryName": "Chicken",
        "quantity": 0.065,
        "unit": "kg",
        "pricePerKg": 250.0,
        "cost": 16.25
      },
      {
        "id": "ri_m20_8",
        "inventoryItemId": "i_honeymustard",
        "inventoryName": "Honey Mustard Sauce",
        "quantity": 0.020,
        "unit": "kg",
        "pricePerKg": 43.7,
        "cost": 0.87
      },
      {
        "id": "ri_m20_9",
        "inventoryItemId": "i_burgersauce",
        "inventoryName": "Burger Sauce",
        "quantity": 0.020,
        "unit": "kg",
        "pricePerKg": 426.8,
        "cost": 8.54
      },
      {
        "id": "ri_m20_10",
        "inventoryItemId": "i_jalapeno",
        "inventoryName": "Jalapeño",
        "quantity": 0.005,
        "unit": "kg",
        "pricePerKg": 330.0,
        "cost": 1.65
      },
      {
        "id": "ri_m20_11",
        "inventoryItemId": "i_pm_dinningtray",
        "inventoryName": "Dinning Tray 250ml",
        "quantity": 1,
        "unit": "pcs",
        "unitPrice": 2.92,
        "cost": 2.92
      },
      {
        "id": "ri_m20_12",
        "inventoryItemId": "i_pm_woodenspoon",
        "inventoryName": "Wooden Spoon",
        "quantity": 1,
        "unit": "pcs",
        "unitPrice": 1.68,
        "cost": 1.68
      },
      {
        "id": "ri_m20_13",
        "inventoryItemId": "i_pm_tissue",
        "inventoryName": "Tissue Paper",
        "quantity": 2,
        "unit": "pcs",
        "unitPrice": 0.27,
        "cost": 0.54
      },
      {
        "id": "ri_m20_14",
        "inventoryItemId": "i_pm_takeawaybag",
        "inventoryName": "Take Away Bags",
        "quantity": 1,
        "unit": "pcs",
        "unitPrice": 6.65,
        "cost": 6.65
      },
      {
        "id": "ri_m20_15",
        "inventoryItemId": "i_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1,
        "unit": "job",
        "unitPrice": 9.60,
        "cost": 9.60
      }
    ]
  },
  {
    "id": "r_m21",
    "menuItemId": "m21",
    "menuItemName": "Veg - Paneer Salad",
    "name": "Signature Salad (Paneer) Recipe",
    "description": "Master Recipe sheet for Veg - Signature Paneer Salad (RM: ₹54.79, PM: ₹11.79, Labour: ₹9.60, Total: ₹76.18)",
    "yieldQty": 1,
    "prepTime": 10,
    "calculatedCost": 76.18,
    "rmCost": 54.79,
    "pmCost": 11.79,
    "labourCost": 9.60,
    "ingredients": [
      {
        "id": "ri_m21_1",
        "inventoryItemId": "i_iceberg",
        "inventoryName": "Iceberg Lettuce",
        "quantity": 0.040,
        "unit": "kg",
        "pricePerKg": 273.0,
        "cost": 10.92
      },
      {
        "id": "ri_m21_2",
        "inventoryItemId": "i_onion",
        "inventoryName": "Onion",
        "quantity": 0.015,
        "unit": "kg",
        "pricePerKg": 33.0,
        "cost": 0.50
      },
      {
        "id": "ri_m21_3",
        "inventoryItemId": "i_tomato",
        "inventoryName": "Tomato",
        "quantity": 0.020,
        "unit": "kg",
        "pricePerKg": 73.5,
        "cost": 1.47
      },
      {
        "id": "ri_m21_4",
        "inventoryItemId": "i_cucumber",
        "inventoryName": "Cucumber",
        "quantity": 0.025,
        "unit": "kg",
        "pricePerKg": 84.0,
        "cost": 2.10
      },
      {
        "id": "ri_m21_5",
        "inventoryItemId": "i_capsicum",
        "inventoryName": "Green Capsicum",
        "quantity": 0.015,
        "unit": "kg",
        "pricePerKg": 99.8,
        "cost": 1.50
      },
      {
        "id": "ri_m21_6",
        "inventoryItemId": "i_paneer",
        "inventoryName": "Paneer",
        "quantity": 0.065,
        "unit": "kg",
        "pricePerKg": 400.0,
        "cost": 26.00
      },
      {
        "id": "ri_m21_7",
        "inventoryItemId": "i_olives",
        "inventoryName": "Olives",
        "quantity": 0.005,
        "unit": "kg",
        "pricePerKg": 250.0,
        "cost": 1.25
      },
      {
        "id": "ri_m21_8",
        "inventoryItemId": "i_honeymustard",
        "inventoryName": "Honey Mustard Sauce",
        "quantity": 0.020,
        "unit": "kg",
        "pricePerKg": 43.7,
        "cost": 0.87
      },
      {
        "id": "ri_m21_9",
        "inventoryItemId": "i_burgersauce",
        "inventoryName": "Burger Sauce",
        "quantity": 0.020,
        "unit": "kg",
        "pricePerKg": 426.8,
        "cost": 8.54
      },
      {
        "id": "ri_m21_10",
        "inventoryItemId": "i_jalapeno",
        "inventoryName": "Jalapeño",
        "quantity": 0.005,
        "unit": "kg",
        "pricePerKg": 330.0,
        "cost": 1.65
      },
      {
        "id": "ri_m21_11",
        "inventoryItemId": "i_pm_dinningtray",
        "inventoryName": "Dinning Tray 250ml",
        "quantity": 1,
        "unit": "pcs",
        "unitPrice": 2.92,
        "cost": 2.92
      },
      {
        "id": "ri_m21_12",
        "inventoryItemId": "i_pm_woodenspoon",
        "inventoryName": "Wooden Spoon",
        "quantity": 1,
        "unit": "pcs",
        "unitPrice": 1.68,
        "cost": 1.68
      },
      {
        "id": "ri_m21_13",
        "inventoryItemId": "i_pm_tissue",
        "inventoryName": "Tissue Paper",
        "quantity": 2,
        "unit": "pcs",
        "unitPrice": 0.27,
        "cost": 0.54
      },
      {
        "id": "ri_m21_14",
        "inventoryItemId": "i_pm_takeawaybag",
        "inventoryName": "Take Away Bags",
        "quantity": 1,
        "unit": "pcs",
        "unitPrice": 6.65,
        "cost": 6.65
      },
      {
        "id": "ri_m21_15",
        "inventoryItemId": "i_labour",
        "inventoryName": "Labour Cost",
        "quantity": 1,
        "unit": "job",
        "unitPrice": 9.60,
        "cost": 9.60
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
      { "id": "ri_m53a_1", "inventoryItemId": "inv_cola", "inventoryName": "COLA", "quantity": 1.000, "unit": "kg", "costPerUnit": 24.00, "cost": 24.00 },
      { "id": "ri_m53a_2", "inventoryItemId": "inv_ice_cube", "inventoryName": "ICE CUBE", "quantity": 0.060, "unit": "kg", "costPerUnit": 6.00, "cost": 0.36 },
      { "id": "ri_m53a_3", "inventoryItemId": "inv_bev_lid_330", "inventoryName": "BEVERAGES WITH LID 330ML", "quantity": 1.000, "unit": "pc", "costPerUnit": 5.49, "cost": 5.49 },
      { "id": "ri_m53a_4", "inventoryItemId": "inv_straw", "inventoryName": "Straw", "quantity": 1.000, "unit": "pc", "costPerUnit": 0.93, "cost": 0.93 },
      { "id": "ri_m53a_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.20, "cost": 3.20 }
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
      { "id": "ri_m54a_1", "inventoryItemId": "inv_sprite", "inventoryName": "SPRITE", "quantity": 1.000, "unit": "kg", "costPerUnit": 24.00, "cost": 24.00 },
      { "id": "ri_m54a_2", "inventoryItemId": "inv_ice_cube", "inventoryName": "ICE CUBE", "quantity": 0.060, "unit": "kg", "costPerUnit": 6.00, "cost": 0.36 },
      { "id": "ri_m54a_3", "inventoryItemId": "inv_bev_lid_330", "inventoryName": "BEVERAGES WITH LID 330ML", "quantity": 1.000, "unit": "pc", "costPerUnit": 5.49, "cost": 5.49 },
      { "id": "ri_m54a_4", "inventoryItemId": "inv_straw", "inventoryName": "Straw", "quantity": 1.000, "unit": "pc", "costPerUnit": 0.93, "cost": 0.93 },
      { "id": "ri_m54a_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.20, "cost": 3.20 }
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
      { "id": "ri_m53b_1", "inventoryItemId": "inv_cola", "inventoryName": "COLA", "quantity": 2.000, "unit": "kg", "costPerUnit": 24.00, "cost": 48.00 },
      { "id": "ri_m53b_2", "inventoryItemId": "inv_ice_cube", "inventoryName": "ICE CUBE", "quantity": 0.120, "unit": "kg", "costPerUnit": 6.00, "cost": 0.72 },
      { "id": "ri_m53b_3", "inventoryItemId": "inv_bev_lid_650", "inventoryName": "BEVERAGES WITH LID 650ML", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.85, "cost": 6.85 },
      { "id": "ri_m53b_4", "inventoryItemId": "inv_straw", "inventoryName": "Straw", "quantity": 1.000, "unit": "pc", "costPerUnit": 0.93, "cost": 0.93 },
      { "id": "ri_m53b_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.20, "cost": 3.20 }
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
      { "id": "ri_m54b_1", "inventoryItemId": "inv_sprite", "inventoryName": "SPRITE", "quantity": 2.000, "unit": "kg", "costPerUnit": 24.00, "cost": 48.00 },
      { "id": "ri_m54b_2", "inventoryItemId": "inv_ice_cube", "inventoryName": "ICE CUBE", "quantity": 0.120, "unit": "kg", "costPerUnit": 6.00, "cost": 0.72 },
      { "id": "ri_m54b_3", "inventoryItemId": "inv_bev_lid_650", "inventoryName": "BEVERAGES WITH LID 650ML", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.85, "cost": 6.85 },
      { "id": "ri_m54b_4", "inventoryItemId": "inv_straw", "inventoryName": "Straw", "quantity": 1.000, "unit": "pc", "costPerUnit": 0.93, "cost": 0.93 },
      { "id": "ri_m54b_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.20, "cost": 3.20 }
    ]
  },
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
      { "id": "ri_m56a_1", "inventoryItemId": "inv_lime", "inventoryName": "Lime", "quantity": 0.030, "unit": "kg", "costPerUnit": 550.00, "cost": 16.50 },
      { "id": "ri_m56a_2", "inventoryItemId": "inv_ice_cube", "inventoryName": "ICE CUBE", "quantity": 0.150, "unit": "kg", "costPerUnit": 6.00, "cost": 0.90 },
      { "id": "ri_m56a_3", "inventoryItemId": "inv_bev_lid_330", "inventoryName": "Beverages with LID 330ml", "quantity": 1.000, "unit": "pc", "costPerUnit": 5.49, "cost": 5.49 },
      { "id": "ri_m56a_4", "inventoryItemId": "inv_paper_straw", "inventoryName": "Paper Straw", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.10, "cost": 1.10 },
      { "id": "ri_m56a_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.20, "cost": 3.20 }
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
      { "id": "ri_m55a_1", "inventoryItemId": "inv_peach", "inventoryName": "Peach", "quantity": 0.030, "unit": "kg", "costPerUnit": 550.00, "cost": 16.50 },
      { "id": "ri_m55a_2", "inventoryItemId": "inv_ice_cube", "inventoryName": "ICE CUBE", "quantity": 0.150, "unit": "kg", "costPerUnit": 6.00, "cost": 0.90 },
      { "id": "ri_m55a_3", "inventoryItemId": "inv_bev_lid_330", "inventoryName": "Beverages with LID 330ml", "quantity": 1.000, "unit": "pc", "costPerUnit": 5.49, "cost": 5.49 },
      { "id": "ri_m55a_4", "inventoryItemId": "inv_paper_straw", "inventoryName": "Paper Straw", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.10, "cost": 1.10 },
      { "id": "ri_m55a_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.20, "cost": 3.20 }
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
      { "id": "ri_m56b_1", "inventoryItemId": "inv_lime", "inventoryName": "LIME", "quantity": 0.060, "unit": "kg", "costPerUnit": 550.00, "cost": 33.00 },
      { "id": "ri_m56b_2", "inventoryItemId": "inv_ice_cube", "inventoryName": "ICE CUBE", "quantity": 0.300, "unit": "kg", "costPerUnit": 6.00, "cost": 1.80 },
      { "id": "ri_m56b_3", "inventoryItemId": "inv_bev_lid_650_icetea", "inventoryName": "Beverages with LID 650ml", "quantity": 1.000, "unit": "pc", "costPerUnit": 8.09, "cost": 8.09 },
      { "id": "ri_m56b_4", "inventoryItemId": "inv_paper_straw", "inventoryName": "Straw", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.10, "cost": 1.10 },
      { "id": "ri_m56b_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.20, "cost": 3.20 }
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
      { "id": "ri_m55b_1", "inventoryItemId": "inv_peach", "inventoryName": "PEACH", "quantity": 0.060, "unit": "kg", "costPerUnit": 550.00, "cost": 33.00 },
      { "id": "ri_m55b_2", "inventoryItemId": "inv_ice_cube", "inventoryName": "ICE CUBE", "quantity": 0.300, "unit": "kg", "costPerUnit": 6.00, "cost": 1.80 },
      { "id": "ri_m55b_3", "inventoryItemId": "inv_bev_lid_650_icetea", "inventoryName": "Beverages with LID 650ml", "quantity": 1.000, "unit": "pc", "costPerUnit": 8.09, "cost": 8.09 },
      { "id": "ri_m55b_4", "inventoryItemId": "inv_paper_straw", "inventoryName": "Straw", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.10, "cost": 1.10 },
      { "id": "ri_m55b_5", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.20, "cost": 3.20 }
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
  },
  {
    "id": "r_m60",
    "menuItemId": "m60",
    "menuItemName": "Chocolate Brownie",
    "name": "CHOCOLATE BROWNIE",
    "description": "Standard recipe for Chocolate Brownie (Price ₹99/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 29.82,
    "pmCost": 11.78,
    "labourCost": 3.20,
    "calculatedCost": 44.80,
    "sellingPrice": 99.00,
    "ingredients": [
      { "id": "ri_m60_1", "inventoryItemId": "inv_butter", "inventoryName": "BUTTER", "quantity": 0.017, "unit": "kg", "costPerUnit": 754.29, "cost": 12.57 },
      { "id": "ri_m60_2", "inventoryItemId": "inv_dark_compound", "inventoryName": "DARK COMPOUND", "quantity": 0.025, "unit": "kg", "costPerUnit": 391.82, "cost": 9.80 },
      { "id": "ri_m60_3", "inventoryItemId": "inv_egg", "inventoryName": "EGG", "quantity": 0.333, "unit": "pc", "costPerUnit": 6.30, "cost": 2.10 },
      { "id": "ri_m60_4", "inventoryItemId": "inv_vanilla_essence", "inventoryName": "VANNILA ESSENCE", "quantity": 0.001, "unit": "kg", "costPerUnit": 484.75, "cost": 0.24 },
      { "id": "ri_m60_5", "inventoryItemId": "inv_white_sugar", "inventoryName": "WHITE SUGAR", "quantity": 0.017, "unit": "kg", "costPerUnit": 48.19, "cost": 0.80 },
      { "id": "ri_m60_6", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.017, "unit": "kg", "costPerUnit": 44.77, "cost": 0.75 },
      { "id": "ri_m60_7", "inventoryItemId": "inv_brown_sugar", "inventoryName": "BROWN SUGAR", "quantity": 0.008, "unit": "kg", "costPerUnit": 230.00, "cost": 1.92 },
      { "id": "ri_m60_8", "inventoryItemId": "inv_milk_compound", "inventoryName": "MILK COMPOUND", "quantity": 0.005, "unit": "kg", "costPerUnit": 328.00, "cost": 1.64 },
      { "id": "ri_m60_9", "inventoryItemId": "inv_dinning_tray_250ml", "inventoryName": "DINNING TRAY 250ML", "quantity": 1.000, "unit": "pc", "costPerUnit": 2.92, "cost": 2.92 },
      { "id": "ri_m60_10", "inventoryItemId": "inv_wooden_spoon", "inventoryName": "Wooden Spoon", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.68, "cost": 1.68 },
      { "id": "ri_m60_11", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
      { "id": "ri_m60_12", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take Away Bags", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
      { "id": "ri_m60_13", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.20, "cost": 3.20 }
    ]
  },
  {
    "id": "r_m61",
    "menuItemId": "m61",
    "menuItemName": "Blondie Cake",
    "name": "BLONDIE CAKE",
    "description": "Standard recipe for Blondie Cake (Price ₹99/-)",
    "yieldQty": 1,
    "prepTime": 5,
    "rmCost": 28.62,
    "pmCost": 11.78,
    "labourCost": 3.20,
    "calculatedCost": 43.60,
    "sellingPrice": 99.00,
    "ingredients": [
      { "id": "ri_m61_1", "inventoryItemId": "inv_butter", "inventoryName": "BUTTER", "quantity": 0.017, "unit": "kg", "costPerUnit": 754.29, "cost": 12.57 },
      { "id": "ri_m61_2", "inventoryItemId": "inv_white_compound", "inventoryName": "WHITE COMPOUND", "quantity": 0.030, "unit": "kg", "costPerUnit": 391.82, "cost": 11.75 },
      { "id": "ri_m61_3", "inventoryItemId": "inv_egg", "inventoryName": "EGG", "quantity": 0.333, "unit": "pc", "costPerUnit": 6.30, "cost": 2.10 },
      { "id": "ri_m61_4", "inventoryItemId": "inv_vanilla_essence", "inventoryName": "VANNILA ESSENCE", "quantity": 0.001, "unit": "kg", "costPerUnit": 484.75, "cost": 0.24 },
      { "id": "ri_m61_5", "inventoryItemId": "inv_white_sugar", "inventoryName": "WHITE SUGAR", "quantity": 0.025, "unit": "kg", "costPerUnit": 48.19, "cost": 1.20 },
      { "id": "ri_m61_6", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.017, "unit": "kg", "costPerUnit": 44.77, "cost": 0.75 },
      { "id": "ri_m61_7", "inventoryItemId": "inv_dinning_tray_250ml", "inventoryName": "DINNING TRAY 250ML", "quantity": 1.000, "unit": "pc", "costPerUnit": 2.92, "cost": 2.92 },
      { "id": "ri_m61_8", "inventoryItemId": "inv_wooden_spoon", "inventoryName": "Wooden Spoon", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.68, "cost": 1.68 },
      { "id": "ri_m61_9", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
      { "id": "ri_m61_10", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take Away Bags", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
      { "id": "ri_m61_11", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 3.20, "cost": 3.20 }
    ]
  },
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
  },
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
  },
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
  },
  {
    "id": "r_m1a",
    "menuItemId": "m1a",
    "menuItemName": "Spicy Gyro - Chicken (Mini)",
    "name": "SPICY CHICKEN GYROS - SMALL",
    "description": "Standard recipe for Spicy Gyro Chicken Mini (Price ₹99/-)",
    "yieldQty": 1,
    "prepTime": 8,
    "rmCost": 35.79,
    "pmCost": 11.81,
    "labourCost": 15.95,
    "calculatedCost": 63.55,
    "sellingPrice": 99.00,
    "ingredients": [
      { "id": "ri_m1a_1", "inventoryItemId": "inv_water", "inventoryName": "WATER", "quantity": 0.015, "unit": "kg", "costPerUnit": 20.00, "cost": 0.30 },
      { "id": "ri_m1a_2", "inventoryItemId": "inv_dry_yeast", "inventoryName": "DRY YEAST", "quantity": 0.010, "unit": "kg", "costPerUnit": 377.12, "cost": 3.77 },
      { "id": "ri_m1a_3", "inventoryItemId": "inv_white_sugar", "inventoryName": "SUGAR", "quantity": 0.050, "unit": "kg", "costPerUnit": 48.19, "cost": 2.41 },
      { "id": "ri_m1a_4", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.040, "unit": "kg", "costPerUnit": 44.77, "cost": 1.79 },
      { "id": "ri_m1a_5", "inventoryItemId": "inv_salt", "inventoryName": "SALT", "quantity": 0.060, "unit": "kg", "costPerUnit": 30.00, "cost": 1.80 },
      { "id": "ri_m1a_6", "inventoryItemId": "inv_cp_powder", "inventoryName": "CP POWDER", "quantity": 0.030, "unit": "kg", "costPerUnit": 256.37, "cost": 7.69 },
      { "id": "ri_m1a_7", "inventoryItemId": "inv_iceberg", "inventoryName": "ICEBERG", "quantity": 0.010, "unit": "kg", "costPerUnit": 272.00, "cost": 2.72 },
      { "id": "ri_m1a_8", "inventoryItemId": "inv_onion", "inventoryName": "ONION", "quantity": 0.010, "unit": "kg", "costPerUnit": 33.00, "cost": 0.33 },
      { "id": "ri_m1a_9", "inventoryItemId": "inv_tomato", "inventoryName": "TOMATO", "quantity": 0.010, "unit": "kg", "costPerUnit": 73.50, "cost": 0.74 },
      { "id": "ri_m1a_10", "inventoryItemId": "inv_cucumber", "inventoryName": "CUCUMBER", "quantity": 0.010, "unit": "kg", "costPerUnit": 84.00, "cost": 0.84 },
      { "id": "ri_m1a_11", "inventoryItemId": "inv_olives", "inventoryName": "OLIVES", "quantity": 0.010, "unit": "kg", "costPerUnit": 775.00, "cost": 7.75 },
      { "id": "ri_m1a_12", "inventoryItemId": "inv_jalapeno", "inventoryName": "JALAPENO", "quantity": 0.010, "unit": "kg", "costPerUnit": 330.00, "cost": 3.30 },
      { "id": "ri_m1a_13", "inventoryItemId": "inv_spicy_chicken", "inventoryName": "SPICY CHICKEN", "quantity": 0.050, "unit": "kg", "costPerUnit": 301.89, "cost": 15.09 },
      { "id": "ri_m1a_14", "inventoryItemId": "inv_hummus", "inventoryName": "HUMMUS", "quantity": 0.010, "unit": "kg", "costPerUnit": 28.96, "cost": 0.29 },
      { "id": "ri_m1a_15", "inventoryItemId": "inv_peri_peri_sauce", "inventoryName": "PERI PERI", "quantity": 0.010, "unit": "kg", "costPerUnit": 352.27, "cost": 3.52 },
      { "id": "ri_m1a_16", "inventoryItemId": "inv_honey_mustard", "inventoryName": "HONEY MUSTARD", "quantity": 0.010, "unit": "kg", "costPerUnit": 43.65, "cost": 0.44 },
      { "id": "ri_m1a_17", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue Paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
      { "id": "ri_m1a_18", "inventoryItemId": "inv_dining_sheet", "inventoryName": "Dining Sheet", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.55, "cost": 1.55 },
      { "id": "ri_m1a_19", "inventoryItemId": "inv_dinning_tray", "inventoryName": "Dinning Tray", "quantity": 1.000, "unit": "pc", "costPerUnit": 3.67, "cost": 3.67 },
      { "id": "ri_m1a_20", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take away Bag", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.05, "cost": 6.05 },
      { "id": "ri_m1a_21", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 15.95, "cost": 15.95 }
    ]
  },
  {
    "id": "r_m2a",
    "menuItemId": "m2a",
    "menuItemName": "Spicy Gyro - Chicken (Signature)",
    "name": "SPICY CHICKEN GYROS - LARGE",
    "description": "Standard recipe for Spicy Gyro Chicken Signature Large (Price ₹249/-)",
    "yieldQty": 1,
    "prepTime": 10,
    "rmCost": 67.68,
    "pmCost": 11.81,
    "labourCost": 15.95,
    "calculatedCost": 95.44,
    "sellingPrice": 249.00,
    "ingredients": [
      { "id": "ri_m2a_1", "inventoryItemId": "inv_water", "inventoryName": "WATER", "quantity": 0.015, "unit": "kg", "costPerUnit": 20.00, "cost": 0.30 },
      { "id": "ri_m2a_2", "inventoryItemId": "inv_dry_yeast", "inventoryName": "DRY YEAST", "quantity": 0.010, "unit": "kg", "costPerUnit": 377.12, "cost": 3.77 },
      { "id": "ri_m2a_3", "inventoryItemId": "inv_white_sugar", "inventoryName": "SUGAR", "quantity": 0.050, "unit": "kg", "costPerUnit": 48.19, "cost": 2.41 },
      { "id": "ri_m2a_4", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.080, "unit": "kg", "costPerUnit": 44.77, "cost": 3.58 },
      { "id": "ri_m2a_5", "inventoryItemId": "inv_salt", "inventoryName": "SALT", "quantity": 0.060, "unit": "kg", "costPerUnit": 30.00, "cost": 1.80 },
      { "id": "ri_m2a_6", "inventoryItemId": "inv_cp_powder", "inventoryName": "CP POWDER", "quantity": 0.030, "unit": "kg", "costPerUnit": 256.37, "cost": 7.69 },
      { "id": "ri_m2a_7", "inventoryItemId": "inv_iceberg", "inventoryName": "ICEBERG", "quantity": 0.010, "unit": "kg", "costPerUnit": 272.00, "cost": 2.72 },
      { "id": "ri_m2a_8", "inventoryItemId": "inv_onion", "inventoryName": "ONION", "quantity": 0.010, "unit": "kg", "costPerUnit": 33.00, "cost": 0.33 },
      { "id": "ri_m2a_9", "inventoryItemId": "inv_tomato", "inventoryName": "TOMATO", "quantity": 0.010, "unit": "kg", "costPerUnit": 73.50, "cost": 0.74 },
      { "id": "ri_m2a_10", "inventoryItemId": "inv_cucumber", "inventoryName": "CUCUMBER", "quantity": 0.010, "unit": "kg", "costPerUnit": 84.00, "cost": 0.84 },
      { "id": "ri_m2a_11", "inventoryItemId": "inv_olives", "inventoryName": "OLIVES", "quantity": 0.010, "unit": "kg", "costPerUnit": 775.00, "cost": 7.75 },
      { "id": "ri_m2a_12", "inventoryItemId": "inv_jalapeno", "inventoryName": "JALAPENO", "quantity": 0.010, "unit": "kg", "costPerUnit": 330.00, "cost": 3.30 },
      { "id": "ri_m2a_13", "inventoryItemId": "inv_spicy_chicken", "inventoryName": "SPICY CHICKEN", "quantity": 0.100, "unit": "kg", "costPerUnit": 301.89, "cost": 30.19 },
      { "id": "ri_m2a_14", "inventoryItemId": "inv_hummus", "inventoryName": "HUMMUS", "quantity": 0.010, "unit": "kg", "costPerUnit": 28.96, "cost": 0.29 },
      { "id": "ri_m2a_15", "inventoryItemId": "inv_peri_peri_sauce", "inventoryName": "PERI PERI", "quantity": 0.010, "unit": "kg", "costPerUnit": 352.27, "cost": 3.52 },
      { "id": "ri_m2a_16", "inventoryItemId": "inv_honey_mustard", "inventoryName": "HONEY MUSTARD", "quantity": 0.010, "unit": "kg", "costPerUnit": 43.65, "cost": 0.44 },
      { "id": "ri_m2a_17", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue Paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
      { "id": "ri_m2a_18", "inventoryItemId": "inv_dining_sheet", "inventoryName": "Dining Sheet", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.55, "cost": 1.55 },
      { "id": "ri_m2a_19", "inventoryItemId": "inv_dinning_tray", "inventoryName": "Dinning Tray", "quantity": 1.000, "unit": "pc", "costPerUnit": 3.67, "cost": 3.67 },
      { "id": "ri_m2a_20", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take away Bag", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.05, "cost": 6.05 },
      { "id": "ri_m2a_21", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 15.95, "cost": 15.95 }
    ]
  },
  {
    "id": "r_m3a",
    "menuItemId": "m3a",
    "menuItemName": "Creamy Gyro - Chicken (Mini)",
    "name": "CREAM CHICKEN - SMALL",
    "description": "Standard recipe for Creamy Gyro Chicken Mini (Price ₹99/-)",
    "yieldQty": 1,
    "prepTime": 8,
    "rmCost": 34.39,
    "pmCost": 11.87,
    "labourCost": 15.95,
    "calculatedCost": 62.21,
    "sellingPrice": 99.00,
    "ingredients": [
      { "id": "ri_m3a_1", "inventoryItemId": "inv_water", "inventoryName": "WATER", "quantity": 0.015, "unit": "kg", "costPerUnit": 20.00, "cost": 0.30 },
      { "id": "ri_m3a_2", "inventoryItemId": "inv_dry_yeast", "inventoryName": "DRY YEAST", "quantity": 0.006, "unit": "kg", "costPerUnit": 377.12, "cost": 2.07 },
      { "id": "ri_m3a_3", "inventoryItemId": "inv_white_sugar", "inventoryName": "SUGAR", "quantity": 0.050, "unit": "kg", "costPerUnit": 48.19, "cost": 2.41 },
      { "id": "ri_m3a_4", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.040, "unit": "kg", "costPerUnit": 44.77, "cost": 1.79 },
      { "id": "ri_m3a_5", "inventoryItemId": "inv_salt", "inventoryName": "SALT", "quantity": 0.060, "unit": "kg", "costPerUnit": 30.00, "cost": 1.80 },
      { "id": "ri_m3a_6", "inventoryItemId": "inv_cp_powder", "inventoryName": "CP POWDER", "quantity": 0.030, "unit": "kg", "costPerUnit": 256.37, "cost": 7.69 },
      { "id": "ri_m3a_7", "inventoryItemId": "inv_iceberg", "inventoryName": "ICEBERG", "quantity": 0.010, "unit": "kg", "costPerUnit": 273.00, "cost": 2.73 },
      { "id": "ri_m3a_8", "inventoryItemId": "inv_onion", "inventoryName": "ONION", "quantity": 0.010, "unit": "kg", "costPerUnit": 33.00, "cost": 0.33 },
      { "id": "ri_m3a_9", "inventoryItemId": "inv_tomato", "inventoryName": "TOMATO", "quantity": 0.010, "unit": "kg", "costPerUnit": 73.50, "cost": 0.74 },
      { "id": "ri_m3a_10", "inventoryItemId": "inv_cucumber", "inventoryName": "CUCUMBER", "quantity": 0.010, "unit": "kg", "costPerUnit": 84.00, "cost": 0.84 },
      { "id": "ri_m3a_11", "inventoryItemId": "inv_olives", "inventoryName": "OLIVES", "quantity": 0.010, "unit": "kg", "costPerUnit": 775.00, "cost": 7.75 },
      { "id": "ri_m3a_12", "inventoryItemId": "inv_jalapeno", "inventoryName": "JELAPENO", "quantity": 0.010, "unit": "kg", "costPerUnit": 330.00, "cost": 3.30 },
      { "id": "ri_m3a_13", "inventoryItemId": "inv_cream_chicken", "inventoryName": "CREAM CHICKEN", "quantity": 0.050, "unit": "kg", "costPerUnit": 274.00, "cost": 13.70 },
      { "id": "ri_m3a_14", "inventoryItemId": "inv_hummus", "inventoryName": "HUMMUS", "quantity": 0.010, "unit": "kg", "costPerUnit": 28.96, "cost": 0.29 },
      { "id": "ri_m3a_15", "inventoryItemId": "inv_peri_peri_sauce", "inventoryName": "PERI PERI", "quantity": 0.010, "unit": "kg", "costPerUnit": 352.27, "cost": 3.52 },
      { "id": "ri_m3a_16", "inventoryItemId": "inv_honey_mustard", "inventoryName": "HONEY MUSTARD", "quantity": 0.010, "unit": "kg", "costPerUnit": 43.65, "cost": 0.44 },
      { "id": "ri_m3a_17", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue Paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
      { "id": "ri_m3a_18", "inventoryItemId": "inv_dining_sheet", "inventoryName": "Dinning Sheet", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.55, "cost": 1.55 },
      { "id": "ri_m3a_19", "inventoryItemId": "inv_dinning_tray", "inventoryName": "Dinning Tray", "quantity": 1.000, "unit": "pc", "costPerUnit": 3.67, "cost": 3.67 },
      { "id": "ri_m3a_20", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take away Bag", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
      { "id": "ri_m3a_21", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 15.95, "cost": 15.95 }
    ]
  },
  {
    "id": "r_m4a",
    "menuItemId": "m4a",
    "menuItemName": "Creamy Gyro - Chicken (Signature)",
    "name": "CREAM CHICKEN - LARGE",
    "description": "Standard recipe for Creamy Gyro Chicken Signature Large (Price ₹249/-)",
    "yieldQty": 1,
    "prepTime": 10,
    "rmCost": 65.19,
    "pmCost": 11.87,
    "labourCost": 15.95,
    "calculatedCost": 93.01,
    "sellingPrice": 249.00,
    "ingredients": [
      { "id": "ri_m4a_1", "inventoryItemId": "inv_water", "inventoryName": "WATER", "quantity": 0.015, "unit": "kg", "costPerUnit": 20.00, "cost": 0.30 },
      { "id": "ri_m4a_2", "inventoryItemId": "inv_dry_yeast", "inventoryName": "DRY YEAST", "quantity": 0.006, "unit": "kg", "costPerUnit": 377.12, "cost": 2.07 },
      { "id": "ri_m4a_3", "inventoryItemId": "inv_white_sugar", "inventoryName": "SUGAR", "quantity": 0.050, "unit": "kg", "costPerUnit": 48.19, "cost": 2.41 },
      { "id": "ri_m4a_4", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.080, "unit": "kg", "costPerUnit": 44.77, "cost": 3.58 },
      { "id": "ri_m4a_5", "inventoryItemId": "inv_salt", "inventoryName": "SALT", "quantity": 0.060, "unit": "kg", "costPerUnit": 30.00, "cost": 1.80 },
      { "id": "ri_m4a_6", "inventoryItemId": "inv_cp_powder", "inventoryName": "CP POWDER", "quantity": 0.030, "unit": "kg", "costPerUnit": 256.37, "cost": 7.69 },
      { "id": "ri_m4a_7", "inventoryItemId": "inv_iceberg", "inventoryName": "ICEBERG", "quantity": 0.010, "unit": "kg", "costPerUnit": 273.00, "cost": 2.73 },
      { "id": "ri_m4a_8", "inventoryItemId": "inv_onion", "inventoryName": "ONION", "quantity": 0.010, "unit": "kg", "costPerUnit": 33.00, "cost": 0.33 },
      { "id": "ri_m4a_9", "inventoryItemId": "inv_tomato", "inventoryName": "TOMATO", "quantity": 0.010, "unit": "kg", "costPerUnit": 73.50, "cost": 0.74 },
      { "id": "ri_m4a_10", "inventoryItemId": "inv_cucumber", "inventoryName": "CUCUMBER", "quantity": 0.010, "unit": "kg", "costPerUnit": 84.00, "cost": 0.84 },
      { "id": "ri_m4a_11", "inventoryItemId": "inv_olives", "inventoryName": "OLIVES", "quantity": 0.010, "unit": "kg", "costPerUnit": 775.00, "cost": 7.75 },
      { "id": "ri_m4a_12", "inventoryItemId": "inv_jalapeno", "inventoryName": "JELAPENO", "quantity": 0.010, "unit": "kg", "costPerUnit": 330.00, "cost": 3.30 },
      { "id": "ri_m4a_13", "inventoryItemId": "inv_cream_chicken", "inventoryName": "CREAM CHICKEN", "quantity": 0.100, "unit": "kg", "costPerUnit": 274.00, "cost": 27.40 },
      { "id": "ri_m4a_14", "inventoryItemId": "inv_hummus", "inventoryName": "HUMMUS", "quantity": 0.010, "unit": "kg", "costPerUnit": 28.96, "cost": 0.29 },
      { "id": "ri_m4a_15", "inventoryItemId": "inv_peri_peri_sauce", "inventoryName": "PERI PERI", "quantity": 0.010, "unit": "kg", "costPerUnit": 352.27, "cost": 3.52 },
      { "id": "ri_m4a_16", "inventoryItemId": "inv_honey_mustard", "inventoryName": "HONEY MUSTARD", "quantity": 0.010, "unit": "kg", "costPerUnit": 43.65, "cost": 0.44 },
      { "id": "ri_m4a_17", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue Paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
      { "id": "ri_m4a_18", "inventoryItemId": "inv_dining_sheet", "inventoryName": "Dinning Sheet", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.55, "cost": 1.55 },
      { "id": "ri_m4a_19", "inventoryItemId": "inv_dinning_tray", "inventoryName": "Dinning Tray", "quantity": 1.000, "unit": "pc", "costPerUnit": 3.67, "cost": 3.67 },
      { "id": "ri_m4a_20", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take away Bag", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
      { "id": "ri_m4a_21", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 15.95, "cost": 15.95 }
    ]
  },
  {
    "id": "r_m11a",
    "menuItemId": "m11a",
    "menuItemName": "Pesto Gyro - Chicken (Mini)",
    "name": "PESTO CHICKEN GYROS - SMALL",
    "description": "Standard recipe for Pesto Gyro Chicken Mini (Price ₹99/-)",
    "yieldQty": 1,
    "prepTime": 8,
    "rmCost": 39.77,
    "pmCost": 11.87,
    "labourCost": 15.95,
    "calculatedCost": 67.59,
    "sellingPrice": 99.00,
    "ingredients": [
      { "id": "ri_m11a_1", "inventoryItemId": "inv_water", "inventoryName": "WATER", "quantity": 0.008, "unit": "kg", "costPerUnit": 20.00, "cost": 0.15 },
      { "id": "ri_m11a_2", "inventoryItemId": "inv_dry_yeast", "inventoryName": "DRY YEAST", "quantity": 0.003, "unit": "kg", "costPerUnit": 377.12, "cost": 1.04 },
      { "id": "ri_m11a_3", "inventoryItemId": "inv_white_sugar", "inventoryName": "SUGAR", "quantity": 0.030, "unit": "kg", "costPerUnit": 48.19, "cost": 1.20 },
      { "id": "ri_m11a_4", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.080, "unit": "kg", "costPerUnit": 44.77, "cost": 3.58 },
      { "id": "ri_m11a_5", "inventoryItemId": "inv_salt", "inventoryName": "SALT", "quantity": 0.030, "unit": "kg", "costPerUnit": 30.00, "cost": 0.90 },
      { "id": "ri_m11a_6", "inventoryItemId": "inv_cp_powder", "inventoryName": "CP POWDER", "quantity": 0.020, "unit": "kg", "costPerUnit": 256.37, "cost": 3.85 },
      { "id": "ri_m11a_7", "inventoryItemId": "inv_iceberg", "inventoryName": "ICEBERG", "quantity": 0.010, "unit": "kg", "costPerUnit": 273.00, "cost": 1.37 },
      { "id": "ri_m11a_8", "inventoryItemId": "inv_onion", "inventoryName": "ONION", "quantity": 0.010, "unit": "kg", "costPerUnit": 33.00, "cost": 0.17 },
      { "id": "ri_m11a_9", "inventoryItemId": "inv_tomato", "inventoryName": "TOMATO", "quantity": 0.010, "unit": "kg", "costPerUnit": 73.50, "cost": 0.37 },
      { "id": "ri_m11a_10", "inventoryItemId": "inv_cucumber", "inventoryName": "CUCUMBER", "quantity": 0.010, "unit": "kg", "costPerUnit": 84.00, "cost": 0.42 },
      { "id": "ri_m11a_11", "inventoryItemId": "inv_olives", "inventoryName": "OLIVES", "quantity": 0.010, "unit": "kg", "costPerUnit": 775.00, "cost": 3.88 },
      { "id": "ri_m11a_12", "inventoryItemId": "inv_jalapeno", "inventoryName": "JELAPENO", "quantity": 0.010, "unit": "kg", "costPerUnit": 330.00, "cost": 1.65 },
      { "id": "ri_m11a_13", "inventoryItemId": "inv_pesto_chicken", "inventoryName": "PESTO CHICKEN", "quantity": 0.050, "unit": "kg", "costPerUnit": 381.75, "cost": 19.09 },
      { "id": "ri_m11a_14", "inventoryItemId": "inv_hummus", "inventoryName": "HUMMUS", "quantity": 0.005, "unit": "kg", "costPerUnit": 28.96, "cost": 0.14 },
      { "id": "ri_m11a_15", "inventoryItemId": "inv_peri_peri_sauce", "inventoryName": "PERI PERI", "quantity": 0.005, "unit": "kg", "costPerUnit": 352.27, "cost": 1.76 },
      { "id": "ri_m11a_16", "inventoryItemId": "inv_honey_mustard", "inventoryName": "HONEY MUSTARD", "quantity": 0.005, "unit": "kg", "costPerUnit": 43.65, "cost": 0.22 },
      { "id": "ri_m11a_17", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue Paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
      { "id": "ri_m11a_18", "inventoryItemId": "inv_dining_sheet", "inventoryName": "Dinning Sheet", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.55, "cost": 1.55 },
      { "id": "ri_m11a_19", "inventoryItemId": "inv_dinning_tray", "inventoryName": "Dinning Tray", "quantity": 1.000, "unit": "pc", "costPerUnit": 3.67, "cost": 3.67 },
      { "id": "ri_m11a_20", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take away Bag", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
      { "id": "ri_m11a_21", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 15.95, "cost": 15.95 }
    ]
  },
  {
    "id": "r_m12a",
    "menuItemId": "m12a",
    "menuItemName": "Pesto Gyro - Chicken (Signature)",
    "name": "PESTO CHICKEN GYROS - LARGE",
    "description": "Standard recipe for Pesto Gyro Chicken Signature Large (Price ₹249/-)",
    "yieldQty": 1,
    "prepTime": 10,
    "rmCost": 75.97,
    "pmCost": 11.87,
    "labourCost": 15.95,
    "calculatedCost": 103.79,
    "sellingPrice": 249.00,
    "ingredients": [
      { "id": "ri_m12a_1", "inventoryItemId": "inv_water", "inventoryName": "WATER", "quantity": 0.015, "unit": "kg", "costPerUnit": 20.00, "cost": 0.30 },
      { "id": "ri_m12a_2", "inventoryItemId": "inv_dry_yeast", "inventoryName": "DRY YEAST", "quantity": 0.006, "unit": "kg", "costPerUnit": 377.12, "cost": 2.07 },
      { "id": "ri_m12a_3", "inventoryItemId": "inv_white_sugar", "inventoryName": "SUGAR", "quantity": 0.050, "unit": "kg", "costPerUnit": 48.19, "cost": 2.41 },
      { "id": "ri_m12a_4", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.080, "unit": "kg", "costPerUnit": 44.77, "cost": 3.58 },
      { "id": "ri_m12a_5", "inventoryItemId": "inv_salt", "inventoryName": "SALT", "quantity": 0.060, "unit": "kg", "costPerUnit": 30.00, "cost": 1.80 },
      { "id": "ri_m12a_6", "inventoryItemId": "inv_cp_powder", "inventoryName": "CP POWDER", "quantity": 0.030, "unit": "kg", "costPerUnit": 256.37, "cost": 7.69 },
      { "id": "ri_m12a_7", "inventoryItemId": "inv_iceberg", "inventoryName": "ICEBERG", "quantity": 0.010, "unit": "kg", "costPerUnit": 273.00, "cost": 2.73 },
      { "id": "ri_m12a_8", "inventoryItemId": "inv_onion", "inventoryName": "ONION", "quantity": 0.010, "unit": "kg", "costPerUnit": 33.00, "cost": 0.33 },
      { "id": "ri_m12a_9", "inventoryItemId": "inv_tomato", "inventoryName": "TOMATO", "quantity": 0.010, "unit": "kg", "costPerUnit": 73.50, "cost": 0.74 },
      { "id": "ri_m12a_10", "inventoryItemId": "inv_cucumber", "inventoryName": "CUCUMBER", "quantity": 0.010, "unit": "kg", "costPerUnit": 84.00, "cost": 0.84 },
      { "id": "ri_m12a_11", "inventoryItemId": "inv_olives", "inventoryName": "OLIVES", "quantity": 0.010, "unit": "kg", "costPerUnit": 775.00, "cost": 7.75 },
      { "id": "ri_m12a_12", "inventoryItemId": "inv_jalapeno", "inventoryName": "JELAPENO", "quantity": 0.010, "unit": "kg", "costPerUnit": 330.00, "cost": 3.30 },
      { "id": "ri_m12a_13", "inventoryItemId": "inv_pesto_chicken", "inventoryName": "PESTO CHICKEN", "quantity": 0.100, "unit": "kg", "costPerUnit": 381.75, "cost": 38.18 },
      { "id": "ri_m12a_14", "inventoryItemId": "inv_hummus", "inventoryName": "HUMMUS", "quantity": 0.010, "unit": "kg", "costPerUnit": 28.96, "cost": 0.29 },
      { "id": "ri_m12a_15", "inventoryItemId": "inv_peri_peri_sauce", "inventoryName": "PERI PERI", "quantity": 0.010, "unit": "kg", "costPerUnit": 352.27, "cost": 3.52 },
      { "id": "ri_m12a_16", "inventoryItemId": "inv_honey_mustard", "inventoryName": "HONEY MUSTARD", "quantity": 0.010, "unit": "kg", "costPerUnit": 43.65, "cost": 0.44 },
      { "id": "ri_m12a_17", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue Paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
      { "id": "ri_m12a_18", "inventoryItemId": "inv_dining_sheet", "inventoryName": "Dinning Sheet", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.55, "cost": 1.55 },
      { "id": "ri_m12a_19", "inventoryItemId": "inv_dinning_tray", "inventoryName": "Dinning Tray", "quantity": 1.000, "unit": "pc", "costPerUnit": 3.67, "cost": 3.67 },
      { "id": "ri_m12a_20", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take away Bag", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
      { "id": "ri_m12a_21", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 15.95, "cost": 15.95 }
    ]
  },
  {
    "id": "r_m1b",
    "menuItemId": "m1b",
    "menuItemName": "Spicy Gyro - Paneer (Mini)",
    "name": "SPICY PANNER GYROS - SMALL",
    "description": "Standard recipe for Spicy Gyro Paneer Mini (Price ₹99/-)",
    "yieldQty": 1,
    "prepTime": 8,
    "rmCost": 43.28,
    "pmCost": 12.41,
    "labourCost": 15.95,
    "calculatedCost": 71.64,
    "sellingPrice": 99.00,
    "ingredients": [
      { "id": "ri_m1b_1", "inventoryItemId": "inv_water", "inventoryName": "WATER", "quantity": 0.015, "unit": "kg", "costPerUnit": 20.00, "cost": 0.30 },
      { "id": "ri_m1b_2", "inventoryItemId": "inv_dry_yeast", "inventoryName": "DRY YEAST", "quantity": 0.006, "unit": "kg", "costPerUnit": 377.12, "cost": 2.07 },
      { "id": "ri_m1b_3", "inventoryItemId": "inv_white_sugar", "inventoryName": "SUGAR", "quantity": 0.050, "unit": "kg", "costPerUnit": 48.19, "cost": 2.41 },
      { "id": "ri_m1b_4", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.040, "unit": "kg", "costPerUnit": 44.77, "cost": 1.79 },
      { "id": "ri_m1b_5", "inventoryItemId": "inv_salt", "inventoryName": "SALT", "quantity": 0.060, "unit": "kg", "costPerUnit": 30.00, "cost": 1.80 },
      { "id": "ri_m1b_6", "inventoryItemId": "inv_cp_powder", "inventoryName": "CP POWDER", "quantity": 0.030, "unit": "kg", "costPerUnit": 256.37, "cost": 7.69 },
      { "id": "ri_m1b_7", "inventoryItemId": "inv_iceberg", "inventoryName": "ICEBERG", "quantity": 0.010, "unit": "kg", "costPerUnit": 273.00, "cost": 2.73 },
      { "id": "ri_m1b_8", "inventoryItemId": "inv_onion", "inventoryName": "ONION", "quantity": 0.010, "unit": "kg", "costPerUnit": 33.00, "cost": 0.33 },
      { "id": "ri_m1b_9", "inventoryItemId": "inv_tomato", "inventoryName": "TOMATO", "quantity": 0.010, "unit": "kg", "costPerUnit": 73.50, "cost": 0.74 },
      { "id": "ri_m1b_10", "inventoryItemId": "inv_cucumber", "inventoryName": "CUCUMBER", "quantity": 0.010, "unit": "kg", "costPerUnit": 84.00, "cost": 0.84 },
      { "id": "ri_m1b_11", "inventoryItemId": "inv_olives", "inventoryName": "OLIVES", "quantity": 0.010, "unit": "kg", "costPerUnit": 775.00, "cost": 7.75 },
      { "id": "ri_m1b_12", "inventoryItemId": "inv_jalapeno", "inventoryName": "JELAPENO", "quantity": 0.010, "unit": "kg", "costPerUnit": 330.00, "cost": 3.30 },
      { "id": "ri_m1b_13", "inventoryItemId": "inv_spicy_paneer", "inventoryName": "SPICY PANNER", "quantity": 0.050, "unit": "kg", "costPerUnit": 451.89, "cost": 22.60 },
      { "id": "ri_m1b_14", "inventoryItemId": "inv_hummus", "inventoryName": "HUMMUS", "quantity": 0.010, "unit": "kg", "costPerUnit": 28.96, "cost": 0.29 },
      { "id": "ri_m1b_15", "inventoryItemId": "inv_peri_peri_sauce", "inventoryName": "PERI PERI", "quantity": 0.010, "unit": "kg", "costPerUnit": 352.27, "cost": 3.52 },
      { "id": "ri_m1b_16", "inventoryItemId": "inv_honey_mustard", "inventoryName": "HONEY MUSTARD", "quantity": 0.010, "unit": "kg", "costPerUnit": 43.65, "cost": 0.44 },
      { "id": "ri_m1b_17", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue Paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
      { "id": "ri_m1b_18", "inventoryItemId": "inv_dining_sheet", "inventoryName": "Dinning Sheet", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.55, "cost": 1.55 },
      { "id": "ri_m1b_19", "inventoryItemId": "inv_dinning_tray", "inventoryName": "Dinning Tray", "quantity": 1.000, "unit": "pc", "costPerUnit": 3.67, "cost": 3.67 },
      { "id": "ri_m1b_20", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take away Bag", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
      { "id": "ri_m1b_21", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 15.95, "cost": 15.95 }
    ]
  },
  {
    "id": "r_m2b",
    "menuItemId": "m2b",
    "menuItemName": "Spicy Gyro - Paneer (Signature)",
    "name": "SPICY PANNER GYROS - LARGE",
    "description": "Standard recipe for Spicy Gyro Paneer Signature Large (Price ₹249/-)",
    "yieldQty": 1,
    "prepTime": 10,
    "rmCost": 82.98,
    "pmCost": 12.41,
    "labourCost": 15.95,
    "calculatedCost": 111.34,
    "sellingPrice": 249.00,
    "ingredients": [
      { "id": "ri_m2b_1", "inventoryItemId": "inv_water", "inventoryName": "WATER", "quantity": 0.015, "unit": "kg", "costPerUnit": 20.00, "cost": 0.30 },
      { "id": "ri_m2b_2", "inventoryItemId": "inv_dry_yeast", "inventoryName": "DRY YEAST", "quantity": 0.006, "unit": "kg", "costPerUnit": 377.12, "cost": 2.07 },
      { "id": "ri_m2b_3", "inventoryItemId": "inv_white_sugar", "inventoryName": "SUGAR", "quantity": 0.050, "unit": "kg", "costPerUnit": 48.19, "cost": 2.41 },
      { "id": "ri_m2b_4", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.080, "unit": "kg", "costPerUnit": 44.77, "cost": 3.58 },
      { "id": "ri_m2b_5", "inventoryItemId": "inv_salt", "inventoryName": "SALT", "quantity": 0.060, "unit": "kg", "costPerUnit": 30.00, "cost": 1.80 },
      { "id": "ri_m2b_6", "inventoryItemId": "inv_cp_powder", "inventoryName": "CP POWDER", "quantity": 0.030, "unit": "kg", "costPerUnit": 256.37, "cost": 7.69 },
      { "id": "ri_m2b_7", "inventoryItemId": "inv_iceberg", "inventoryName": "ICEBERG", "quantity": 0.010, "unit": "kg", "costPerUnit": 273.00, "cost": 2.73 },
      { "id": "ri_m2b_8", "inventoryItemId": "inv_onion", "inventoryName": "ONION", "quantity": 0.010, "unit": "kg", "costPerUnit": 33.00, "cost": 0.33 },
      { "id": "ri_m2b_9", "inventoryItemId": "inv_tomato", "inventoryName": "TOMATO", "quantity": 0.010, "unit": "kg", "costPerUnit": 73.50, "cost": 0.74 },
      { "id": "ri_m2b_10", "inventoryItemId": "inv_cucumber", "inventoryName": "CUCUMBER", "quantity": 0.010, "unit": "kg", "costPerUnit": 84.00, "cost": 0.84 },
      { "id": "ri_m2b_11", "inventoryItemId": "inv_olives", "inventoryName": "OLIVES", "quantity": 0.010, "unit": "kg", "costPerUnit": 775.00, "cost": 7.75 },
      { "id": "ri_m2b_12", "inventoryItemId": "inv_jalapeno", "inventoryName": "JELAPENO", "quantity": 0.010, "unit": "kg", "costPerUnit": 330.00, "cost": 3.30 },
      { "id": "ri_m2b_13", "inventoryItemId": "inv_spicy_paneer", "inventoryName": "SPICY PANNER", "quantity": 0.100, "unit": "kg", "costPerUnit": 451.89, "cost": 45.19 },
      { "id": "ri_m2b_14", "inventoryItemId": "inv_hummus", "inventoryName": "HUMMUS", "quantity": 0.010, "unit": "kg", "costPerUnit": 28.96, "cost": 0.29 },
      { "id": "ri_m2b_15", "inventoryItemId": "inv_peri_peri_sauce", "inventoryName": "PERI PERI", "quantity": 0.010, "unit": "kg", "costPerUnit": 352.27, "cost": 3.52 },
      { "id": "ri_m2b_16", "inventoryItemId": "inv_honey_mustard", "inventoryName": "HONEY MUSTARD", "quantity": 0.010, "unit": "kg", "costPerUnit": 43.65, "cost": 0.44 },
      { "id": "ri_m2b_17", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue Paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
      { "id": "ri_m2b_18", "inventoryItemId": "inv_dining_sheet", "inventoryName": "Dinning Sheet", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.55, "cost": 1.55 },
      { "id": "ri_m2b_19", "inventoryItemId": "inv_dinning_tray", "inventoryName": "Dinning Tray", "quantity": 1.000, "unit": "pc", "costPerUnit": 3.67, "cost": 3.67 },
      { "id": "ri_m2b_20", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take away Bag", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
      { "id": "ri_m2b_21", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 15.95, "cost": 15.95 }
    ]
  },
  {
    "id": "r_m3b",
    "menuItemId": "m3b",
    "menuItemName": "Creamy Gyro - Paneer (Mini)",
    "name": "CREAM PANEER GYROS - SMALL",
    "description": "Standard recipe for Creamy Gyro Paneer Mini (Price ₹99/-)",
    "yieldQty": 1,
    "prepTime": 8,
    "rmCost": 41.89,
    "pmCost": 12.41,
    "labourCost": 15.95,
    "calculatedCost": 70.25,
    "sellingPrice": 99.00,
    "ingredients": [
      { "id": "ri_m3b_1", "inventoryItemId": "inv_water", "inventoryName": "WATER", "quantity": 0.015, "unit": "kg", "costPerUnit": 20.00, "cost": 0.30 },
      { "id": "ri_m3b_2", "inventoryItemId": "inv_dry_yeast", "inventoryName": "DRY YEAST", "quantity": 0.006, "unit": "kg", "costPerUnit": 377.12, "cost": 2.07 },
      { "id": "ri_m3b_3", "inventoryItemId": "inv_white_sugar", "inventoryName": "SUGAR", "quantity": 0.050, "unit": "kg", "costPerUnit": 48.19, "cost": 2.41 },
      { "id": "ri_m3b_4", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.040, "unit": "kg", "costPerUnit": 44.77, "cost": 1.79 },
      { "id": "ri_m3b_5", "inventoryItemId": "inv_salt", "inventoryName": "SALT", "quantity": 0.060, "unit": "kg", "costPerUnit": 30.00, "cost": 1.80 },
      { "id": "ri_m3b_6", "inventoryItemId": "inv_cp_powder", "inventoryName": "CP POWDER", "quantity": 0.030, "unit": "kg", "costPerUnit": 256.37, "cost": 7.69 },
      { "id": "ri_m3b_7", "inventoryItemId": "inv_iceberg", "inventoryName": "ICEBERG", "quantity": 0.010, "unit": "kg", "costPerUnit": 273.00, "cost": 2.73 },
      { "id": "ri_m3b_8", "inventoryItemId": "inv_onion", "inventoryName": "ONION", "quantity": 0.010, "unit": "kg", "costPerUnit": 33.00, "cost": 0.33 },
      { "id": "ri_m3b_9", "inventoryItemId": "inv_tomato", "inventoryName": "TOMATO", "quantity": 0.010, "unit": "kg", "costPerUnit": 73.50, "cost": 0.74 },
      { "id": "ri_m3b_10", "inventoryItemId": "inv_cucumber", "inventoryName": "CUCUMBER", "quantity": 0.010, "unit": "kg", "costPerUnit": 84.00, "cost": 0.84 },
      { "id": "ri_m3b_11", "inventoryItemId": "inv_olives", "inventoryName": "OLIVES", "quantity": 0.010, "unit": "kg", "costPerUnit": 775.00, "cost": 7.75 },
      { "id": "ri_m3b_12", "inventoryItemId": "inv_jalapeno", "inventoryName": "JELAPENO", "quantity": 0.010, "unit": "kg", "costPerUnit": 330.00, "cost": 3.30 },
      { "id": "ri_m3b_13", "inventoryItemId": "inv_cream_paneer", "inventoryName": "CREAM PANNER", "quantity": 0.050, "unit": "kg", "costPerUnit": 424.00, "cost": 21.20 },
      { "id": "ri_m3b_14", "inventoryItemId": "inv_hummus", "inventoryName": "HUMMUS", "quantity": 0.010, "unit": "kg", "costPerUnit": 28.96, "cost": 0.29 },
      { "id": "ri_m3b_15", "inventoryItemId": "inv_peri_peri_sauce", "inventoryName": "PERI PERI", "quantity": 0.010, "unit": "kg", "costPerUnit": 352.27, "cost": 3.52 },
      { "id": "ri_m3b_16", "inventoryItemId": "inv_honey_mustard", "inventoryName": "HONEY MUSTARD", "quantity": 0.010, "unit": "kg", "costPerUnit": 43.65, "cost": 0.44 },
      { "id": "ri_m3b_17", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue Paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
      { "id": "ri_m3b_18", "inventoryItemId": "inv_dining_sheet", "inventoryName": "Dinning Sheet", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.55, "cost": 1.55 },
      { "id": "ri_m3b_19", "inventoryItemId": "inv_dinning_tray", "inventoryName": "Dinning Tray", "quantity": 1.000, "unit": "pc", "costPerUnit": 3.67, "cost": 3.67 },
      { "id": "ri_m3b_20", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take away Bag", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
      { "id": "ri_m3b_21", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 15.95, "cost": 15.95 }
    ]
  },
  {
    "id": "r_m4b",
    "menuItemId": "m4b",
    "menuItemName": "Creamy Gyro - Paneer (Signature)",
    "name": "CREAM PANEER GYROS - LARGE",
    "description": "Standard recipe for Creamy Gyro Paneer Signature Large (Price ₹249/-)",
    "yieldQty": 1,
    "prepTime": 10,
    "rmCost": 80.19,
    "pmCost": 12.41,
    "labourCost": 15.95,
    "calculatedCost": 108.55,
    "sellingPrice": 249.00,
    "ingredients": [
      { "id": "ri_m4b_1", "inventoryItemId": "inv_water", "inventoryName": "WATER", "quantity": 0.015, "unit": "kg", "costPerUnit": 20.00, "cost": 0.30 },
      { "id": "ri_m4b_2", "inventoryItemId": "inv_dry_yeast", "inventoryName": "DRY YEAST", "quantity": 0.006, "unit": "kg", "costPerUnit": 377.12, "cost": 2.07 },
      { "id": "ri_m4b_3", "inventoryItemId": "inv_white_sugar", "inventoryName": "SUGAR", "quantity": 0.050, "unit": "kg", "costPerUnit": 48.19, "cost": 2.41 },
      { "id": "ri_m4b_4", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.080, "unit": "kg", "costPerUnit": 44.77, "cost": 3.58 },
      { "id": "ri_m4b_5", "inventoryItemId": "inv_salt", "inventoryName": "SALT", "quantity": 0.060, "unit": "kg", "costPerUnit": 30.00, "cost": 1.80 },
      { "id": "ri_m4b_6", "inventoryItemId": "inv_cp_powder", "inventoryName": "CP POWDER", "quantity": 0.030, "unit": "kg", "costPerUnit": 256.37, "cost": 7.69 },
      { "id": "ri_m4b_7", "inventoryItemId": "inv_iceberg", "inventoryName": "ICEBERG", "quantity": 0.010, "unit": "kg", "costPerUnit": 273.00, "cost": 2.73 },
      { "id": "ri_m4b_8", "inventoryItemId": "inv_onion", "inventoryName": "ONION", "quantity": 0.010, "unit": "kg", "costPerUnit": 33.00, "cost": 0.33 },
      { "id": "ri_m4b_9", "inventoryItemId": "inv_tomato", "inventoryName": "TOMATO", "quantity": 0.010, "unit": "kg", "costPerUnit": 73.50, "cost": 0.74 },
      { "id": "ri_m4b_10", "inventoryItemId": "inv_cucumber", "inventoryName": "CUCUMBER", "quantity": 0.010, "unit": "kg", "costPerUnit": 84.00, "cost": 0.84 },
      { "id": "ri_m4b_11", "inventoryItemId": "inv_olives", "inventoryName": "OLIVES", "quantity": 0.010, "unit": "kg", "costPerUnit": 775.00, "cost": 7.75 },
      { "id": "ri_m4b_12", "inventoryItemId": "inv_jalapeno", "inventoryName": "JELAPENO", "quantity": 0.010, "unit": "kg", "costPerUnit": 330.00, "cost": 3.30 },
      { "id": "ri_m4b_13", "inventoryItemId": "inv_cream_paneer", "inventoryName": "CREAM PANNER", "quantity": 0.100, "unit": "kg", "costPerUnit": 424.00, "cost": 42.40 },
      { "id": "ri_m4b_14", "inventoryItemId": "inv_hummus", "inventoryName": "HUMMUS", "quantity": 0.010, "unit": "kg", "costPerUnit": 28.96, "cost": 0.29 },
      { "id": "ri_m4b_15", "inventoryItemId": "inv_peri_peri_sauce", "inventoryName": "PERI PERI", "quantity": 0.010, "unit": "kg", "costPerUnit": 352.27, "cost": 3.52 },
      { "id": "ri_m4b_16", "inventoryItemId": "inv_honey_mustard", "inventoryName": "HONEY MUSTARD", "quantity": 0.010, "unit": "kg", "costPerUnit": 43.65, "cost": 0.44 },
      { "id": "ri_m4b_17", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue Paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
      { "id": "ri_m4b_18", "inventoryItemId": "inv_dining_sheet", "inventoryName": "Dinning Sheet", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.55, "cost": 1.55 },
      { "id": "ri_m4b_19", "inventoryItemId": "inv_dinning_tray", "inventoryName": "Dinning Tray", "quantity": 1.000, "unit": "pc", "costPerUnit": 3.67, "cost": 3.67 },
      { "id": "ri_m4b_20", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take away Bag", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
      { "id": "ri_m4b_21", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 15.95, "cost": 15.95 }
    ]
  },
  {
    "id": "r_m5b",
    "menuItemId": "m5b",
    "menuItemName": "BBQ Gyro - Paneer (Mini)",
    "name": "BARBEQUE PANNER GYROS - SMALL",
    "description": "Standard recipe for BBQ Gyro Paneer Mini (Price ₹99/-)",
    "yieldQty": 1,
    "prepTime": 8,
    "rmCost": 41.71,
    "pmCost": 12.41,
    "labourCost": 15.95,
    "calculatedCost": 70.07,
    "sellingPrice": 99.00,
    "ingredients": [
      { "id": "ri_m5b_1", "inventoryItemId": "inv_water", "inventoryName": "WATER", "quantity": 0.015, "unit": "kg", "costPerUnit": 20.00, "cost": 0.30 },
      { "id": "ri_m5b_2", "inventoryItemId": "inv_dry_yeast", "inventoryName": "DRY YEAST", "quantity": 0.006, "unit": "kg", "costPerUnit": 377.12, "cost": 2.07 },
      { "id": "ri_m5b_3", "inventoryItemId": "inv_white_sugar", "inventoryName": "SUGAR", "quantity": 0.050, "unit": "kg", "costPerUnit": 48.19, "cost": 2.41 },
      { "id": "ri_m5b_4", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.040, "unit": "kg", "costPerUnit": 44.77, "cost": 1.79 },
      { "id": "ri_m5b_5", "inventoryItemId": "inv_salt", "inventoryName": "SALT", "quantity": 0.060, "unit": "kg", "costPerUnit": 30.00, "cost": 1.80 },
      { "id": "ri_m5b_6", "inventoryItemId": "inv_cp_powder", "inventoryName": "CP POWDER", "quantity": 0.030, "unit": "kg", "costPerUnit": 256.37, "cost": 7.69 },
      { "id": "ri_m5b_7", "inventoryItemId": "inv_iceberg", "inventoryName": "ICEBERG", "quantity": 0.010, "unit": "kg", "costPerUnit": 273.00, "cost": 2.73 },
      { "id": "ri_m5b_8", "inventoryItemId": "inv_onion", "inventoryName": "ONION", "quantity": 0.010, "unit": "kg", "costPerUnit": 33.00, "cost": 0.33 },
      { "id": "ri_m5b_9", "inventoryItemId": "inv_tomato", "inventoryName": "TOMATO", "quantity": 0.010, "unit": "kg", "costPerUnit": 73.50, "cost": 0.74 },
      { "id": "ri_m5b_10", "inventoryItemId": "inv_cucumber", "inventoryName": "CUCUMBER", "quantity": 0.010, "unit": "kg", "costPerUnit": 84.00, "cost": 0.84 },
      { "id": "ri_m5b_11", "inventoryItemId": "inv_olives", "inventoryName": "OLIVES", "quantity": 0.010, "unit": "kg", "costPerUnit": 775.00, "cost": 7.75 },
      { "id": "ri_m5b_12", "inventoryItemId": "inv_jalapeno", "inventoryName": "JELAPENO", "quantity": 0.010, "unit": "kg", "costPerUnit": 330.00, "cost": 3.30 },
      { "id": "ri_m5b_13", "inventoryItemId": "inv_bbq_paneer", "inventoryName": "BBQ PANNER", "quantity": 0.050, "unit": "kg", "costPerUnit": 420.40, "cost": 21.02 },
      { "id": "ri_m5b_14", "inventoryItemId": "inv_hummus", "inventoryName": "HUMMUS", "quantity": 0.010, "unit": "kg", "costPerUnit": 28.96, "cost": 0.29 },
      { "id": "ri_m5b_15", "inventoryItemId": "inv_peri_peri_sauce", "inventoryName": "PERI PERI", "quantity": 0.010, "unit": "kg", "costPerUnit": 352.27, "cost": 3.52 },
      { "id": "ri_m5b_16", "inventoryItemId": "inv_honey_mustard", "inventoryName": "HONEY MUSTARD", "quantity": 0.010, "unit": "kg", "costPerUnit": 43.65, "cost": 0.44 },
      { "id": "ri_m5b_17", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue Paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
      { "id": "ri_m5b_18", "inventoryItemId": "inv_dining_sheet", "inventoryName": "Dinning Sheet", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.55, "cost": 1.55 },
      { "id": "ri_m5b_19", "inventoryItemId": "inv_dinning_tray", "inventoryName": "Dinning Tray", "quantity": 1.000, "unit": "pc", "costPerUnit": 3.67, "cost": 3.67 },
      { "id": "ri_m5b_20", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take away Bag", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
      { "id": "ri_m5b_21", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 15.95, "cost": 15.95 }
    ]
  },
  {
    "id": "r_m6b",
    "menuItemId": "m6b",
    "menuItemName": "BBQ Gyro - Paneer (Signature)",
    "name": "BARBEQUE PANNER GYROS - LARGE",
    "description": "Standard recipe for BBQ Gyro Paneer Signature Large (Price ₹249/-)",
    "yieldQty": 1,
    "prepTime": 10,
    "rmCost": 79.83,
    "pmCost": 12.41,
    "labourCost": 15.95,
    "calculatedCost": 108.19,
    "sellingPrice": 249.00,
    "ingredients": [
      { "id": "ri_m6b_1", "inventoryItemId": "inv_water", "inventoryName": "WATER", "quantity": 0.015, "unit": "kg", "costPerUnit": 20.00, "cost": 0.30 },
      { "id": "ri_m6b_2", "inventoryItemId": "inv_dry_yeast", "inventoryName": "DRY YEAST", "quantity": 0.006, "unit": "kg", "costPerUnit": 377.12, "cost": 2.07 },
      { "id": "ri_m6b_3", "inventoryItemId": "inv_white_sugar", "inventoryName": "SUGAR", "quantity": 0.050, "unit": "kg", "costPerUnit": 48.19, "cost": 2.41 },
      { "id": "ri_m6b_4", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.080, "unit": "kg", "costPerUnit": 44.77, "cost": 3.58 },
      { "id": "ri_m6b_5", "inventoryItemId": "inv_salt", "inventoryName": "SALT", "quantity": 0.060, "unit": "kg", "costPerUnit": 30.00, "cost": 1.80 },
      { "id": "ri_m6b_6", "inventoryItemId": "inv_cp_powder", "inventoryName": "CP POWDER", "quantity": 0.030, "unit": "kg", "costPerUnit": 256.37, "cost": 7.69 },
      { "id": "ri_m6b_7", "inventoryItemId": "inv_iceberg", "inventoryName": "ICEBERG", "quantity": 0.010, "unit": "kg", "costPerUnit": 273.00, "cost": 2.73 },
      { "id": "ri_m6b_8", "inventoryItemId": "inv_onion", "inventoryName": "ONION", "quantity": 0.010, "unit": "kg", "costPerUnit": 33.00, "cost": 0.33 },
      { "id": "ri_m6b_9", "inventoryItemId": "inv_tomato", "inventoryName": "TOMATO", "quantity": 0.010, "unit": "kg", "costPerUnit": 73.50, "cost": 0.74 },
      { "id": "ri_m6b_10", "inventoryItemId": "inv_cucumber", "inventoryName": "CUCUMBER", "quantity": 0.010, "unit": "kg", "costPerUnit": 84.00, "cost": 0.84 },
      { "id": "ri_m6b_11", "inventoryItemId": "inv_olives", "inventoryName": "OLIVES", "quantity": 0.010, "unit": "kg", "costPerUnit": 775.00, "cost": 7.75 },
      { "id": "ri_m6b_12", "inventoryItemId": "inv_jalapeno", "inventoryName": "JELAPENO", "quantity": 0.010, "unit": "kg", "costPerUnit": 330.00, "cost": 3.30 },
      { "id": "ri_m6b_13", "inventoryItemId": "inv_bbq_paneer", "inventoryName": "BBQ PANNER", "quantity": 0.100, "unit": "kg", "costPerUnit": 420.40, "cost": 42.04 },
      { "id": "ri_m6b_14", "inventoryItemId": "inv_hummus", "inventoryName": "HUMMUS", "quantity": 0.010, "unit": "kg", "costPerUnit": 28.96, "cost": 0.29 },
      { "id": "ri_m6b_15", "inventoryItemId": "inv_peri_peri_sauce", "inventoryName": "PERI PERI", "quantity": 0.010, "unit": "kg", "costPerUnit": 352.27, "cost": 3.52 },
      { "id": "ri_m6b_16", "inventoryItemId": "inv_honey_mustard", "inventoryName": "HONEY MUSTARD", "quantity": 0.010, "unit": "kg", "costPerUnit": 43.65, "cost": 0.44 },
      { "id": "ri_m6b_17", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue Paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
      { "id": "ri_m6b_18", "inventoryItemId": "inv_dining_sheet", "inventoryName": "Dinning Sheet", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.55, "cost": 1.55 },
      { "id": "ri_m6b_19", "inventoryItemId": "inv_dinning_tray", "inventoryName": "Dinning Tray", "quantity": 1.000, "unit": "pc", "costPerUnit": 3.67, "cost": 3.67 },
      { "id": "ri_m6b_20", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take away Bag", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
      { "id": "ri_m6b_21", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 15.95, "cost": 15.95 }
    ]
  },
  {
    "id": "r_m11b",
    "menuItemId": "m11b",
    "menuItemName": "Pesto Gyro - Paneer (Mini)",
    "name": "PESTO PANNER GYROS - SMALL",
    "description": "Standard recipe for Pesto Gyro Paneer Mini (Price ₹99/-)",
    "yieldQty": 1,
    "prepTime": 8,
    "rmCost": 47.27,
    "pmCost": 12.41,
    "labourCost": 15.95,
    "calculatedCost": 75.63,
    "sellingPrice": 99.00,
    "ingredients": [
      { "id": "ri_m11b_1", "inventoryItemId": "inv_water", "inventoryName": "WATER", "quantity": 0.015, "unit": "kg", "costPerUnit": 20.00, "cost": 0.30 },
      { "id": "ri_m11b_2", "inventoryItemId": "inv_dry_yeast", "inventoryName": "DRY YEAST", "quantity": 0.006, "unit": "kg", "costPerUnit": 377.12, "cost": 2.07 },
      { "id": "ri_m11b_3", "inventoryItemId": "inv_white_sugar", "inventoryName": "SUGAR", "quantity": 0.050, "unit": "kg", "costPerUnit": 48.19, "cost": 2.41 },
      { "id": "ri_m11b_4", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.040, "unit": "kg", "costPerUnit": 44.77, "cost": 1.79 },
      { "id": "ri_m11b_5", "inventoryItemId": "inv_salt", "inventoryName": "SALT", "quantity": 0.060, "unit": "kg", "costPerUnit": 30.00, "cost": 1.80 },
      { "id": "ri_m11b_6", "inventoryItemId": "inv_cp_powder", "inventoryName": "CP POWDER", "quantity": 0.030, "unit": "kg", "costPerUnit": 256.37, "cost": 7.69 },
      { "id": "ri_m11b_7", "inventoryItemId": "inv_iceberg", "inventoryName": "ICEBERG", "quantity": 0.010, "unit": "kg", "costPerUnit": 273.00, "cost": 2.73 },
      { "id": "ri_m11b_8", "inventoryItemId": "inv_onion", "inventoryName": "ONION", "quantity": 0.010, "unit": "kg", "costPerUnit": 33.00, "cost": 0.33 },
      { "id": "ri_m11b_9", "inventoryItemId": "inv_tomato", "inventoryName": "TOMATO", "quantity": 0.010, "unit": "kg", "costPerUnit": 73.50, "cost": 0.74 },
      { "id": "ri_m11b_10", "inventoryItemId": "inv_cucumber", "inventoryName": "CUCUMBER", "quantity": 0.010, "unit": "kg", "costPerUnit": 84.00, "cost": 0.84 },
      { "id": "ri_m11b_11", "inventoryItemId": "inv_olives", "inventoryName": "OLIVES", "quantity": 0.010, "unit": "kg", "costPerUnit": 775.00, "cost": 7.75 },
      { "id": "ri_m11b_12", "inventoryItemId": "inv_jalapeno", "inventoryName": "JELAPENO", "quantity": 0.010, "unit": "kg", "costPerUnit": 330.00, "cost": 3.30 },
      { "id": "ri_m11b_13", "inventoryItemId": "inv_pesto_paneer", "inventoryName": "PESTO PANNER", "quantity": 0.050, "unit": "kg", "costPerUnit": 531.75, "cost": 26.59 },
      { "id": "ri_m11b_14", "inventoryItemId": "inv_hummus", "inventoryName": "HUMMUS", "quantity": 0.010, "unit": "kg", "costPerUnit": 28.96, "cost": 0.29 },
      { "id": "ri_m11b_15", "inventoryItemId": "inv_peri_peri_sauce", "inventoryName": "PERI PERI", "quantity": 0.010, "unit": "kg", "costPerUnit": 352.27, "cost": 3.52 },
      { "id": "ri_m11b_16", "inventoryItemId": "inv_honey_mustard", "inventoryName": "HONEY MUSTARD", "quantity": 0.010, "unit": "kg", "costPerUnit": 43.65, "cost": 0.44 },
      { "id": "ri_m11b_17", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue Paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
      { "id": "ri_m11b_18", "inventoryItemId": "inv_dining_sheet", "inventoryName": "Dinning Sheet", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.55, "cost": 1.55 },
      { "id": "ri_m11b_19", "inventoryItemId": "inv_dinning_tray", "inventoryName": "Dinning Tray", "quantity": 1.000, "unit": "pc", "costPerUnit": 3.67, "cost": 3.67 },
      { "id": "ri_m11b_20", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take away Bag", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
      { "id": "ri_m11b_21", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 15.95, "cost": 15.95 }
    ]
  },
  {
    "id": "r_m12b",
    "menuItemId": "m12b",
    "menuItemName": "Pesto Gyro - Paneer (Signature)",
    "name": "PESTO PANNER GYROS - LARGE",
    "description": "Standard recipe for Pesto Gyro Paneer Signature Large (Price ₹249/-)",
    "yieldQty": 1,
    "prepTime": 10,
    "rmCost": 90.97,
    "pmCost": 12.41,
    "labourCost": 15.95,
    "calculatedCost": 119.33,
    "sellingPrice": 249.00,
    "ingredients": [
      { "id": "ri_m12b_1", "inventoryItemId": "inv_water", "inventoryName": "WATER", "quantity": 0.015, "unit": "kg", "costPerUnit": 20.00, "cost": 0.30 },
      { "id": "ri_m12b_2", "inventoryItemId": "inv_dry_yeast", "inventoryName": "DRY YEAST", "quantity": 0.006, "unit": "kg", "costPerUnit": 377.12, "cost": 2.07 },
      { "id": "ri_m12b_3", "inventoryItemId": "inv_white_sugar", "inventoryName": "SUGAR", "quantity": 0.050, "unit": "kg", "costPerUnit": 48.19, "cost": 2.41 },
      { "id": "ri_m12b_4", "inventoryItemId": "inv_maida", "inventoryName": "MAIDA", "quantity": 0.080, "unit": "kg", "costPerUnit": 44.77, "cost": 3.58 },
      { "id": "ri_m12b_5", "inventoryItemId": "inv_salt", "inventoryName": "SALT", "quantity": 0.060, "unit": "kg", "costPerUnit": 30.00, "cost": 1.80 },
      { "id": "ri_m12b_6", "inventoryItemId": "inv_cp_powder", "inventoryName": "CP POWDER", "quantity": 0.030, "unit": "kg", "costPerUnit": 256.37, "cost": 7.69 },
      { "id": "ri_m12b_7", "inventoryItemId": "inv_iceberg", "inventoryName": "ICEBERG", "quantity": 0.010, "unit": "kg", "costPerUnit": 273.00, "cost": 2.73 },
      { "id": "ri_m12b_8", "inventoryItemId": "inv_onion", "inventoryName": "ONION", "quantity": 0.010, "unit": "kg", "costPerUnit": 33.00, "cost": 0.33 },
      { "id": "ri_m12b_9", "inventoryItemId": "inv_tomato", "inventoryName": "TOMATO", "quantity": 0.010, "unit": "kg", "costPerUnit": 73.50, "cost": 0.74 },
      { "id": "ri_m12b_10", "inventoryItemId": "inv_cucumber", "inventoryName": "CUCUMBER", "quantity": 0.010, "unit": "kg", "costPerUnit": 84.00, "cost": 0.84 },
      { "id": "ri_m12b_11", "inventoryItemId": "inv_olives", "inventoryName": "OLIVES", "quantity": 0.010, "unit": "kg", "costPerUnit": 775.00, "cost": 7.75 },
      { "id": "ri_m12b_12", "inventoryItemId": "inv_jalapeno", "inventoryName": "JELAPENO", "quantity": 0.010, "unit": "kg", "costPerUnit": 330.00, "cost": 3.30 },
      { "id": "ri_m12b_13", "inventoryItemId": "inv_pesto_paneer", "inventoryName": "PESTO PANNER", "quantity": 0.100, "unit": "kg", "costPerUnit": 531.75, "cost": 53.18 },
      { "id": "ri_m12b_14", "inventoryItemId": "inv_hummus", "inventoryName": "HUMMUS", "quantity": 0.010, "unit": "kg", "costPerUnit": 28.96, "cost": 0.29 },
      { "id": "ri_m12b_15", "inventoryItemId": "inv_peri_peri_sauce", "inventoryName": "PERI PERI", "quantity": 0.010, "unit": "kg", "costPerUnit": 352.27, "cost": 3.52 },
      { "id": "ri_m12b_16", "inventoryItemId": "inv_honey_mustard", "inventoryName": "HONEY MUSTARD", "quantity": 0.010, "unit": "kg", "costPerUnit": 43.65, "cost": 0.44 },
      { "id": "ri_m12b_17", "inventoryItemId": "inv_tissue_paper", "inventoryName": "Tissue Paper", "quantity": 2.000, "unit": "pc", "costPerUnit": 0.27, "cost": 0.54 },
      { "id": "ri_m12b_18", "inventoryItemId": "inv_dining_sheet", "inventoryName": "Dinning Sheet", "quantity": 1.000, "unit": "pc", "costPerUnit": 1.55, "cost": 1.55 },
      { "id": "ri_m12b_19", "inventoryItemId": "inv_dinning_tray", "inventoryName": "Dinning Tray", "quantity": 1.000, "unit": "pc", "costPerUnit": 3.67, "cost": 3.67 },
      { "id": "ri_m12b_20", "inventoryItemId": "inv_takeaway_bags", "inventoryName": "Take away Bag", "quantity": 1.000, "unit": "pc", "costPerUnit": 6.65, "cost": 6.65 },
      { "id": "ri_m12b_21", "inventoryItemId": "inv_labour", "inventoryName": "Labour Cost", "quantity": 1.000, "unit": "unit", "costPerUnit": 15.95, "cost": 15.95 }
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
