import SQL from './db.js';
import { v4 as uuid } from 'uuid';

async function seed() {
  console.log('Seeding database...');
  await SQL.init();

  const categories = [
    { id: uuid(), name: 'Burgers', displayOrder: 1, color: '#e63946', icon: 'sandwich' },
    { id: uuid(), name: 'Chicken', displayOrder: 2, color: '#f4a261', icon: 'drumstick' },
    { id: uuid(), name: 'Sides', displayOrder: 3, color: '#e9c46a', icon: 'fries' },
    { id: uuid(), name: 'Beverages', displayOrder: 4, color: '#4895ef', icon: 'cup' },
    { id: uuid(), name: 'Desserts', displayOrder: 5, color: '#2a9d8f', icon: 'cake' },
    { id: uuid(), name: 'Combos', displayOrder: 6, color: '#9b5de5', icon: 'package' }
  ];

  categories.forEach(c => {
    SQL.run(
      'INSERT OR REPLACE INTO categories (id, name, displayOrder, color, icon, isActive) VALUES (?, ?, ?, ?, ?, 1)',
      [c.id, c.name, c.displayOrder, c.color, c.icon]
    );
  });

  const menuItems = [
    { name: 'Zinger Burger', category: 'Burgers', price: 299, prepTime: 12, description: 'Crispy fried chicken fillet with spicy sauce' },
    { name: 'Classic Burger', category: 'Burgers', price: 199, prepTime: 10, description: 'Juicy beef patty with fresh vegetables' },
    { name: 'Double Decker', category: 'Burgers', price: 399, prepTime: 15, description: 'Two patties, double the taste' },
    { name: 'Veggie Burger', category: 'Burgers', price: 179, prepTime: 10, description: 'Crispy veggie patty with special sauce' },
    
    { name: 'Hot Wings (6pc)', category: 'Chicken', price: 249, prepTime: 15, description: 'Crispy wings with choice of sauce' },
    { name: 'Hot Wings (12pc)', category: 'Chicken', price: 449, prepTime: 18, description: 'Party size crispy wings' },
    { name: 'Famous Bowl', category: 'Chicken', price: 349, prepTime: 12, description: 'Mashed potatoes, corn, nuggets & gravy' },
    { name: 'Crispy Strips (3pc)', category: 'Chicken', price: 229, prepTime: 12, description: 'Tender chicken strips with dipping sauce' },
    { name: 'Crispy Strips (5pc)', category: 'Chicken', price: 349, prepTime: 15, description: 'More strips, more crunch' },
    
    { name: 'Fries (Regular)', category: 'Sides', price: 99, prepTime: 5, description: 'Golden crispy fries' },
    { name: 'Fries (Large)', category: 'Sides', price: 149, prepTime: 5, description: 'Large portion of crispy fries' },
    { name: 'Coleslaw', category: 'Sides', price: 79, prepTime: 2, description: 'Creamy cabbage slaw' },
    { name: 'Corn on the Cob', category: 'Sides', price: 89, prepTime: 5, description: 'Grilled corn with butter' },
    { name: 'Onion Rings', category: 'Sides', price: 129, prepTime: 6, description: 'Crispy battered onion rings' },
    
    { name: 'Pepsi (500ml)', category: 'Beverages', price: 79, prepTime: 1, description: 'Ice cold Pepsi' },
    { name: 'Mountain Dew (500ml)', category: 'Beverages', price: 79, prepTime: 1, description: 'Refreshing Mountain Dew' },
    { name: '7UP (500ml)', category: 'Beverages', price: 79, prepTime: 1, description: ' кристально чистый 7UP' },
    { name: 'Masala Chai', category: 'Beverages', price: 49, prepTime: 3, description: 'Traditional Indian spiced tea' },
    { name: 'Coffee', category: 'Beverages', price: 99, prepTime: 3, description: 'Hot brewed coffee' },
    { name: 'Mineral Water', category: 'Beverages', price: 29, prepTime: 1, description: 'Safe drinking water' },
    
    { name: 'Choco Lava Cake', category: 'Desserts', price: 149, prepTime: 8, description: 'Warm cake with molten chocolate center' },
    { name: 'Brownie', category: 'Desserts', price: 99, prepTime: 3, description: 'Rich chocolate brownie' },
    { name: 'Ice Cream Sundae', category: 'Desserts', price: 129, prepTime: 4, description: 'Vanilla ice cream with toppings' },
    
    { name: 'Zinger Meal', category: 'Combos', price: 449, prepTime: 15, description: 'Zinger Burger + Fries + Drink' },
    { name: 'Wings Meal', category: 'Combos', price: 399, prepTime: 18, description: '6pc Wings + Fries + Drink' },
    { name: 'Family Bucket', category: 'Combos', price: 999, prepTime: 20, description: '12pc Chicken + 4 Fries + 4 Drinks' },
    { name: 'Kids Meal', category: 'Combos', price: 249, prepTime: 12, description: 'Crispy Strips + Fries + Juice + Toy' }
  ];

  menuItems.forEach(item => {
    const category = categories.find(c => c.name === item.category);
    if (category) {
      SQL.run(
        'INSERT INTO menu_items (id, categoryId, name, description, price, prepTime, isAvailable) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [uuid(), category.id, item.name, item.description, item.price, item.prepTime]
      );
    }
  });

  const users = [
    { id: uuid(), name: 'Admin', role: 'admin', pin: '1234' },
    { id: uuid(), name: 'Manager', role: 'manager', pin: '5678' },
    { id: uuid(), name: 'Cashier 1', role: 'cashier', pin: '0000' },
    { id: uuid(), name: 'Kitchen Head', role: 'kitchen', pin: '9999' },
    { id: uuid(), name: 'Kitchen Staff', role: 'kitchen', pin: '8888' }
  ];

  users.forEach(u => {
    SQL.run(
      'INSERT OR REPLACE INTO users (id, name, role, pin, isActive) VALUES (?, ?, ?, ?, 1)',
      [u.id, u.name, u.role, u.pin]
    );
  });

  const inventoryItems = [
    { name: 'Chicken Breast', category: 'Proteins', unit: 'kg', currentStock: 50, minimumStock: 20, costPerUnit: 180, supplier: 'Fresh Poultry Co.' },
    { name: 'Burger Buns', category: 'Bakery', unit: 'pcs', currentStock: 200, minimumStock: 50, costPerUnit: 8, supplier: 'City Bakery' },
    { name: 'Fries (Frozen)', category: 'Sides', unit: 'kg', currentStock: 30, minimumStock: 10, costPerUnit: 45, supplier: 'Food Supplies Inc.' },
    { name: 'Cooking Oil', category: 'Supplies', unit: 'liters', currentStock: 40, minimumStock: 15, costPerUnit: 120, supplier: 'Oil Mart' },
    { name: 'Pepsi Syrup', category: 'Beverages', unit: 'liters', currentStock: 20, minimumStock: 5, costPerUnit: 350, supplier: 'BevCo' },
    { name: 'Packaging Boxes', category: 'Supplies', unit: 'pcs', currentStock: 500, minimumStock: 100, costPerUnit: 5, supplier: 'PackPro' },
    { name: 'Napkins', category: 'Supplies', unit: 'pcs', currentStock: 1000, minimumStock: 200, costPerUnit: 0.5, supplier: 'CleanSupply' },
    { name: 'Tomato Ketchup', category: 'Sauces', unit: 'kg', currentStock: 15, minimumStock: 5, costPerUnit: 80, supplier: 'Food Supplies Inc.' }
  ];

  inventoryItems.forEach(item => {
    SQL.run(
      `INSERT OR REPLACE INTO inventory_items (id, name, category, unit, currentStock, minimumStock, reorderLevel, costPerUnit, supplier, lastRestocked)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuid(), item.name, item.category, item.unit, item.currentStock, item.minimumStock, item.minimumStock * 2, item.costPerUnit, item.supplier, new Date().toISOString()]
    );
  });

  const aggregators = [
    { id: uuid(), name: 'swiggy', displayName: 'Swiggy', isActive: 0, defaultPrepTime: 30 },
    { id: uuid(), name: 'zomato', displayName: 'Zomato', isActive: 0, defaultPrepTime: 35 },
    { id: uuid(), name: 'zepto', displayName: 'Zepto', isActive: 0, defaultPrepTime: 25 }
  ];

  const now = new Date().toISOString();
  aggregators.forEach(a => {
    SQL.run(
      `INSERT OR REPLACE INTO aggregators (id, name, displayName, isActive, defaultPrepTime, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [a.id, a.name, a.displayName, a.isActive, a.defaultPrepTime, now, now]
    );
  });

  const menuData = SQL.all('SELECT id, name FROM menu_items');
  const invData = SQL.all('SELECT id, name FROM inventory_items');

  const getMenuId = (name) => menuData.find(m => m.name.toLowerCase().includes(name.toLowerCase()))?.id;
  const getInvId = (name) => invData.find(i => i.name.toLowerCase().includes(name.toLowerCase()))?.id;

  const recipes = [
    {
      menuName: 'Zinger Burger',
      ingredients: [
        { name: 'Chicken Breast', qty: 0.15, unit: 'kg' },
        { name: 'Burger Buns', qty: 1, unit: 'pcs' },
        { name: 'Cooking Oil', qty: 0.05, unit: 'liters' },
        { name: 'Packaging Boxes', qty: 1, unit: 'pcs' },
        { name: 'Tomato Ketchup', qty: 0.02, unit: 'kg' }
      ]
    },
    {
      menuName: 'Hot Wings (6pc)',
      ingredients: [
        { name: 'Chicken Breast', qty: 0.4, unit: 'kg' },
        { name: 'Cooking Oil', qty: 0.3, unit: 'liters' },
        { name: 'Packaging Boxes', qty: 1, unit: 'pcs' }
      ]
    },
    {
      menuName: 'Pepsi (500ml)',
      ingredients: [
        { name: 'Pepsi Syrup', qty: 0.02, unit: 'liters' },
        { name: 'Packaging Boxes', qty: 1, unit: 'pcs' }
      ]
    }
  ];

  recipes.forEach(recipe => {
    const menuItemId = getMenuId(recipe.menuName);
    if (menuItemId) {
      const recipeId = uuid();
      SQL.run(
        `INSERT OR REPLACE INTO recipes (id, menuItemId, name, description, yieldQty, prepTime, isActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, 1, 15, 1, ?, ?)`,
        [recipeId, menuItemId, `${recipe.menuName} Recipe`, '', now, now]
      );
      
      recipe.ingredients.forEach(ing => {
        const invId = getInvId(ing.name);
        if (invId) {
          SQL.run(
            `INSERT OR REPLACE INTO recipe_ingredients (id, recipeId, inventoryItemId, quantity, unit, isOptional)
             VALUES (?, ?, ?, ?, ?, 0)`,
            [uuid(), recipeId, invId, ing.qty, ing.unit]
          );
        }
      });
    }
  });

  console.log('Database seeded successfully!');
  console.log(`- ${categories.length} categories`);
  console.log(`- ${menuItems.length} menu items`);
  console.log(`- ${users.length} users`);
  console.log(`- ${inventoryItems.length} inventory items`);
  console.log(`- ${aggregators.length} aggregators`);
  console.log(`- ${recipes.length} recipes`);
  process.exit(0);
}

seed().catch(console.error);
