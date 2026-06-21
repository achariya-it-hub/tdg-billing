const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

// Default initial data
const initialData = {
  users: [
    {
      id: "u1",
      name: "ROHIT",
      email: "rohit@example.com",
      phone: "+91 9876543210",
      password: "$2a$10$7Z8.y.7k7XwU2Z71Q2u6ZeG5W2rV/T7t1b/F1l6Z2H8j7K7V8e2bC", // Hashed "password123"
      rubyBalance: 2450,
      denLevel: "Gold",
      completedDens: 4,
      denProgress: 6, // 6/10 members
      scratchCards: [
        { id: "s1", title: "Weekend Special", subtitle: "Tap to scratch", amount: 150, claimed: false },
        { id: "s2", title: "Mega Reward", subtitle: "Tap to scratch", amount: 500, claimed: false },
        { id: "s3", title: "Daily Bonus", subtitle: "Claimed", amount: 50, claimed: true }
      ]
    }
  ],
  transactions: [
    { id: "t1", userId: "u1", type: "credit", amount: 150, description: "Referral Bonus", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: "t2", userId: "u1", type: "debit", amount: 199, description: "Order #10023 Payment", createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "t3", userId: "u1", type: "credit", amount: 500, description: "Den Reward", createdAt: new Date(Date.now() - 43200000).toISOString() }
  ],
  orders: [
    {
      id: "ORD10023",
      userId: "u1",
      items: [
        { name: "The Classic Gyro", price: 199, quantity: 1 }
      ],
      subtotal: 199,
      tax: 18,
      deliveryFee: 30,
      total: 247,
      status: "Delivered",
      paymentMethod: "Cash on Delivery",
      deliveryAddress: "123, Luxury Suites, Sector 5, HSR Layout, Bengaluru",
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  menu: {
    categories: ['Gyros', 'Fries', 'Combos', 'Drinks'],
    items: [
      // Gyros
      { id: "m1", category: "Gyros", name: "The Classic Gyro", desc: "Juicy grilled chicken, fresh veggies & our special sauce.", price: 199, tag: "Bestseller", image: "assets/images/gyro.png" },
      { id: "m2", category: "Gyros", name: "Spicy Chicken Gyro", desc: "Spicy chicken, jalapeños, lettuce & spicy sauce.", price: 219, tag: "Spicy", image: "assets/images/gyro.png" },
      { id: "m3", category: "Gyros", name: "BBQ Chicken Gyro", desc: "BBQ chicken, onions, cheese & BBQ sauce.", price: 219, tag: "", image: "assets/images/gyro.png" },
      { id: "m4", category: "Gyros", name: "Veggie Gyro", desc: "Falafel, hummus, veggies & tahini sauce.", price: 179, tag: "Healthy", image: "assets/images/gyro.png" },
      { id: "m5", category: "Gyros", name: "Lamb Gyro", desc: "Tender lamb, onions, lettuce & garlic sauce.", price: 249, tag: "Premium", image: "assets/images/gyro.png" },
      // Fries
      { id: "m6", category: "Fries", name: "Classic Fries", desc: "Crispy golden fries with seasoning.", price: 99, tag: "", image: "assets/images/fries.png" },
      { id: "m7", category: "Fries", name: "Loaded Fries", desc: "Fries topped with cheese, jalapeños & sauce.", price: 149, tag: "Spicy", image: "assets/images/fries.png" },
      { id: "m8", category: "Fries", name: "Masala Fries", desc: "Spiced fries with Indian masala blend.", price: 119, tag: "", image: "assets/images/fries.png" },
      // Combos
      { id: "m9", category: "Combos", name: "Gyro + Fries Combo", desc: "Any gyro + classic fries + drink.", price: 299, tag: "Value pack", image: "assets/images/gyro.png" },
      { id: "m10", category: "Combos", name: "Double Gyro Combo", desc: "Two gyros + fries.", price: 399, tag: "Feast", image: "assets/images/gyro.png" },
      // Drinks
      { id: "m11", category: "Drinks", name: "Coke Can", desc: "Chilled Coca-Cola 330ml.", price: 60, tag: "", image: "assets/images/drink.png" },
      { id: "m12", category: "Drinks", name: "Fresh Lime Soda", desc: "Sweet or salted fresh lime soda.", price: 69, tag: "Refreshing", image: "assets/images/drink.png" },
      { id: "m13", category: "Drinks", name: "Water Bottle", desc: "500ml mineral water.", price: 30, tag: "", image: "assets/images/drink.png" }
    ]
  },
  inventory: [
    { id: "i1", name: "Gyro Meat (kg)", stock: 25.5, unit: "kg", lowStockThreshold: 5.0 },
    { id: "i2", name: "Falafel Patty (pcs)", stock: 80, unit: "pcs", lowStockThreshold: 20 },
    { id: "i3", name: "Potatoes (kg)", stock: 45.0, unit: "kg", lowStockThreshold: 10.0 },
    { id: "i4", name: "Cheese Sauce (liters)", stock: 8.5, unit: "liters", lowStockThreshold: 2.0 },
    { id: "i5", name: "Gyro Bread (pcs)", stock: 120, unit: "pcs", lowStockThreshold: 30 },
    { id: "i6", name: "Coke Can (330ml)", stock: 48, unit: "pcs", lowStockThreshold: 12 },
    { id: "i7", name: "Water Bottle (500ml)", stock: 60, unit: "pcs", lowStockThreshold: 15 }
  ],
  purchases: [
    { id: "p1", supplier: "Fresh Farms Ltd", date: new Date(Date.now() - 86400000 * 3).toISOString(), items: [{ name: "Potatoes (kg)", quantity: 20, unit: "kg", price: 30 }], total: 600 },
    { id: "p2", supplier: "Global Foods", date: new Date(Date.now() - 86400000).toISOString(), items: [{ name: "Gyro Bread (pcs)", quantity: 100, unit: "pcs", price: 15 }, { name: "Coke Can (330ml)", quantity: 24, unit: "pcs", price: 35 }], total: 2340 }
  ]
};

function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      writeDb(initialData);
      return initialData;
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return initialData;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Error writing database:", error);
  }
}

module.exports = {
  readDb,
  writeDb
};
