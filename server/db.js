import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, 'billing.db');

let db = null;

function save() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(DB_PATH, buffer);
  }
}

const SQL = {
  init: async () => {
    const SQL = await initSqlJs();
    
    if (existsSync(DB_PATH)) {
      try {
        const buffer = readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
      } catch (e) {
        db = new SQL.Database();
      }
    } else {
      db = new SQL.Database();
    }
    
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        displayOrder INTEGER DEFAULT 0,
        color TEXT DEFAULT '#ffffff',
        icon TEXT DEFAULT 'utensils',
        isActive INTEGER DEFAULT 1
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id TEXT PRIMARY KEY,
        categoryId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        price REAL NOT NULL,
        image TEXT,
        isAvailable INTEGER DEFAULT 1,
        prepTime INTEGER DEFAULT 15,
        FOREIGN KEY (categoryId) REFERENCES categories(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS variants (
        id TEXT PRIMARY KEY,
        menuItemId TEXT NOT NULL,
        name TEXT NOT NULL,
        priceModifier REAL DEFAULT 0,
        FOREIGN KEY (menuItemId) REFERENCES menu_items(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS add_ons (
        id TEXT PRIMARY KEY,
        menuItemId TEXT NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (menuItemId) REFERENCES menu_items(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        pin TEXT NOT NULL,
        isActive INTEGER DEFAULT 1
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        orderNumber INTEGER NOT NULL,
        type TEXT DEFAULT 'dine-in',
        status TEXT DEFAULT 'pending',
        source TEXT DEFAULT 'pos',
        subtotal REAL NOT NULL,
        tax REAL NOT NULL,
        discount REAL DEFAULT 0,
        total REAL NOT NULL,
        paymentMethod TEXT,
        paymentStatus TEXT DEFAULT 'pending',
        tableNumber TEXT,
        customerName TEXT,
        notes TEXT DEFAULT '',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        completedAt TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        orderId TEXT NOT NULL,
        menuItemId TEXT NOT NULL,
        menuItemName TEXT NOT NULL,
        variantId TEXT,
        variantName TEXT,
        quantity INTEGER NOT NULL,
        unitPrice REAL NOT NULL,
        totalPrice REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        notes TEXT DEFAULT '',
        FOREIGN KEY (orderId) REFERENCES orders(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS kot (
        id TEXT PRIMARY KEY,
        orderId TEXT NOT NULL,
        orderNumber TEXT NOT NULL,
        priority TEXT DEFAULT 'normal',
        status TEXT DEFAULT 'new',
        createdAt TEXT NOT NULL,
        acknowledgedAt TEXT,
        completedAt TEXT,
        FOREIGN KEY (orderId) REFERENCES orders(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS kot_items (
        id TEXT PRIMARY KEY,
        kotId TEXT NOT NULL,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        notes TEXT DEFAULT '',
        isCompleted INTEGER DEFAULT 0,
        FOREIGN KEY (kotId) REFERENCES kot(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS inventory_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT DEFAULT 'General',
        unit TEXT DEFAULT 'pcs',
        currentStock REAL DEFAULT 0,
        minimumStock REAL DEFAULT 10,
        reorderLevel REAL DEFAULT 20,
        costPerUnit REAL DEFAULT 0,
        supplier TEXT DEFAULT '',
        lastRestocked TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS inventory_transactions (
        id TEXT PRIMARY KEY,
        inventoryItemId TEXT NOT NULL,
        type TEXT NOT NULL,
        quantity REAL NOT NULL,
        reason TEXT DEFAULT '',
        createdAt TEXT NOT NULL,
        createdBy TEXT,
        FOREIGN KEY (inventoryItemId) REFERENCES inventory_items(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS aggregators (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        displayName TEXT NOT NULL,
        isActive INTEGER DEFAULT 0,
        apiKey TEXT,
        apiSecret TEXT,
        storeId TEXT,
        webhookSecret TEXT,
        autoAcceptOrders INTEGER DEFAULT 0,
        defaultPrepTime INTEGER DEFAULT 30,
        lastSyncAt TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS menu_mappings (
        id TEXT PRIMARY KEY,
        aggregatorId TEXT NOT NULL,
        internalItemId TEXT NOT NULL,
        externalItemId TEXT NOT NULL,
        externalItemName TEXT NOT NULL,
        priceOverride REAL,
        isAvailable INTEGER DEFAULT 1,
        FOREIGN KEY (aggregatorId) REFERENCES aggregators(id),
        FOREIGN KEY (internalItemId) REFERENCES menu_items(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS online_orders (
        id TEXT PRIMARY KEY,
        externalOrderId TEXT NOT NULL,
        aggregator TEXT NOT NULL,
        orderId TEXT NOT NULL,
        platformStatus TEXT DEFAULT 'received',
        estimatedTime INTEGER DEFAULT 30,
        actualDeliveryTime INTEGER,
        customerName TEXT,
        customerPhone TEXT,
        customerAddress TEXT,
        aggregatorCommission REAL DEFAULT 0,
        deliveryFee REAL DEFAULT 0,
        packagingFee REAL DEFAULT 0,
        rawPayload TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (orderId) REFERENCES orders(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS direct_orders (
        id TEXT PRIMARY KEY,
        orderNumber TEXT NOT NULL UNIQUE,
        customerName TEXT,
        customerPhone TEXT NOT NULL,
        customerEmail TEXT,
        address TEXT,
        items TEXT NOT NULL,
        subtotal REAL NOT NULL,
        tax REAL NOT NULL,
        total REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        paymentStatus TEXT DEFAULT 'pending',
        paymentMethod TEXT,
        paymentId TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS recipes (
        id TEXT PRIMARY KEY,
        menuItemId TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        yieldQty INTEGER DEFAULT 1,
        prepTime INTEGER DEFAULT 15,
        instructions TEXT DEFAULT '',
        isActive INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (menuItemId) REFERENCES menu_items(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id TEXT PRIMARY KEY,
        recipeId TEXT NOT NULL,
        inventoryItemId TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT DEFAULT 'pcs',
        isOptional INTEGER DEFAULT 0,
        FOREIGN KEY (recipeId) REFERENCES recipes(id),
        FOREIGN KEY (inventoryItemId) REFERENCES inventory_items(id)
      )
    `);
    
    save();
    return db;
  },
  
  save,
  
  run: (sql, params = []) => {
    db.run(sql, params);
    save();
  },
  
  get: (sql, params = []) => {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    if (stmt.step()) {
      const result = stmt.getAsObject();
      stmt.free();
      return result;
    }
    stmt.free();
    return null;
  },
  
  all: (sql, params = []) => {
    const results = [];
    const stmt = db.prepare(sql);
    stmt.bind(params);
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }
};

export default SQL;
