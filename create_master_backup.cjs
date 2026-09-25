const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execSync } = require('child_process');

async function runCompleteBackup() {
  console.log('====================================================');
  console.log('  TDG POS BILLING - MASTER COMPLETE BACKUP ENGINE  ');
  console.log('====================================================');

  // 1. Fetch live cloud data
  console.log('[1/6] Fetching live web/cloud dataset from https://pos.tendengyros.com/api/sync/pull ...');
  let cloudDb = {};
  try {
    const cloudRes = await fetch('https://pos.tendengyros.com/api/sync/pull');
    if (cloudRes.ok) {
      cloudDb = await cloudRes.json();
      console.log(`  ✓ Cloud pull successful: ${cloudDb.orders?.length || 0} orders, ${cloudDb.menuItems?.length || 0} menu items.`);
    } else {
      console.warn(`  ⚠️ Cloud pull responded with status: ${cloudRes.status}`);
    }
  } catch (e) {
    console.warn(`  ⚠️ Cloud pull failed: ${e.message}. Proceeding with local dataset.`);
  }

  // 2. Read local db.json
  console.log('[2/6] Reading local server/db.json dataset ...');
  const dbPath = path.join(__dirname, 'server', 'db.json');
  let localDb = {};
  if (fs.existsSync(dbPath)) {
    try {
      localDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      console.log(`  ✓ Local db.json loaded: ${localDb.orders?.length || 0} orders, ${localDb.menuItems?.length || 0} menu items.`);
    } catch (e) {
      console.error(`  ❌ Failed to parse local db.json: ${e.message}`);
    }
  }

  // 3. Perform deep deduplication and merging
  console.log('[3/6] Merging and deduplicating local & cloud datasets ...');
  
  // Base structure from local + cloud
  const masterDb = {
    ...cloudDb,
    ...localDb
  };

  // Orders map deduplication
  const orderMap = new Map();
  const addOrder = (o) => {
    if (!o) return;
    const key = o.id || (o.orderNumber ? `num_${o.orderNumber}_${o.createdAt || o.date}` : null);
    if (key) {
      const existing = orderMap.get(key);
      if (!existing || new Date(o.createdAt || o.date || 0) >= new Date(existing.createdAt || existing.date || 0)) {
        orderMap.set(key, o);
      }
    }
  };
  (cloudDb.orders || []).forEach(addOrder);
  (localDb.orders || []).forEach(addOrder);
  
  masterDb.orders = Array.from(orderMap.values());
  masterDb.orders.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));

  // Preserve official 60 menu items and 13 categories from local database
  masterDb.menuItems = Array.isArray(localDb.menuItems) && localDb.menuItems.length > 0 ? localDb.menuItems : (cloudDb.menuItems || []);
  masterDb.categories = Array.isArray(localDb.categories) && localDb.categories.length > 0 ? localDb.categories : (cloudDb.categories || []);
  masterDb.recipes = Array.isArray(localDb.recipes) && localDb.recipes.length > 0 ? localDb.recipes : (cloudDb.recipes || []);

  // Loyalty Users / Customers map
  const custMap = new Map();
  const addCustomer = (c) => {
    if (!c) return;
    const key = c.id || (c.phone ? `phone_${c.phone}` : c.name);
    if (key) custMap.set(key, c);
  };
  (cloudDb.loyaltyUsers || []).forEach(addCustomer);
  (localDb.loyaltyUsers || []).forEach(addCustomer);
  masterDb.loyaltyUsers = Array.from(custMap.values());

  // Inventory map
  const invMap = new Map();
  (cloudDb.inventory || []).forEach(i => i && invMap.set(i.id || i.name, i));
  (localDb.inventory || []).forEach(i => i && invMap.set(i.id || i.name, i));
  masterDb.inventory = Array.from(invMap.values());

  // Employees / Staff map
  const empMap = new Map();
  (cloudDb.employees || []).forEach(e => e && empMap.set(e.id || e.name, e));
  (localDb.employees || []).forEach(e => e && empMap.set(e.id || e.name, e));
  masterDb.employees = Array.from(empMap.values());

  // Billing Users map
  const userMap = new Map();
  (cloudDb.billingUsers || []).forEach(u => u && userMap.set(u.id || u.username || u.name, u));
  (localDb.billingUsers || []).forEach(u => u && userMap.set(u.id || u.username || u.name, u));
  masterDb.billingUsers = Array.from(userMap.values());

  // Metadata
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timestampStr = now.toISOString().replace(/[:.]/g, '-');

  masterDb._backupMeta = {
    backupName: 'TDG_POS_MASTER_COMPLETE_BACKUP',
    exportedAtISO: now.toISOString(),
    exportedAtIST: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    counts: {
      orders: masterDb.orders.length,
      menuItems: masterDb.menuItems.length,
      categories: masterDb.categories.length,
      recipes: masterDb.recipes.length,
      inventory: masterDb.inventory.length,
      loyaltyUsers: masterDb.loyaltyUsers.length,
      employees: masterDb.employees.length,
      billingUsers: masterDb.billingUsers.length
    },
    totalRevenueInINR: masterDb.orders.reduce((sum, o) => sum + (Number(o.total || o.grandTotal || 0)), 0)
  };

  console.log(`  ✓ Combined Data Summary:`);
  console.log(`    - Orders: ${masterDb.orders.length}`);
  console.log(`    - Menu Items: ${masterDb.menuItems.length}`);
  console.log(`    - Categories: ${masterDb.categories.length}`);
  console.log(`    - Recipes: ${masterDb.recipes.length}`);
  console.log(`    - Inventory Items: ${masterDb.inventory.length}`);
  console.log(`    - Customers: ${masterDb.loyaltyUsers.length}`);
  console.log(`    - Staff / Employees: ${masterDb.employees.length}`);
  console.log(`    - Total Sales Revenue: ₹${masterDb._backupMeta.totalRevenueInINR.toLocaleString('en-IN')}`);

  // 4. Update Local Database & Vault Lock Files
  console.log('[4/6] Updating local db.json and server vaults with master dataset ...');
  fs.writeFileSync(dbPath, JSON.stringify(masterDb, null, 2));

  const serverDir = path.join(__dirname, 'server');
  fs.writeFileSync(path.join(serverDir, 'sales_vault_LOCK.json'), JSON.stringify({ orders: masterDb.orders, count: masterDb.orders.length }, null, 2));
  fs.writeFileSync(path.join(serverDir, 'menu_backup_LOCK.json'), JSON.stringify({ categories: masterDb.categories, menuItems: masterDb.menuItems, recipes: masterDb.recipes, updatedAt: now.toISOString() }, null, 2));
  fs.writeFileSync(path.join(serverDir, 'inventory_vault_LOCK.json'), JSON.stringify({ inventory: masterDb.inventory, count: masterDb.inventory.length }, null, 2));
  fs.writeFileSync(path.join(serverDir, 'customer_vault_LOCK.json'), JSON.stringify({ loyaltyUsers: masterDb.loyaltyUsers, users: masterDb.billingUsers, employees: masterDb.employees, updatedAt: now.toISOString() }, null, 2));
  fs.writeFileSync(path.join(serverDir, 'master_double_backup_LOCK.json'), JSON.stringify(masterDb, null, 2));
  
  const backupsDir = path.join(serverDir, 'backups');
  if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });
  fs.writeFileSync(path.join(backupsDir, 'master-double-backup-latest.json'), JSON.stringify(masterDb, null, 2));
  fs.writeFileSync(path.join(backupsDir, `db-shield-${timestampStr}.json`), JSON.stringify(masterDb, null, 2));

  // 5. Generate Export Files (JSON & CSVs)
  console.log('[5/6] Exporting structured JSON & CSV spreadsheet files ...');
  
  // A. Master JSON Backup
  const masterJsonPath = path.join(__dirname, `MASTER_BACKUP_TDG_BILLING_${dateStr}.json`);
  fs.writeFileSync(masterJsonPath, JSON.stringify(masterDb, null, 2));

  // Helper for CSV escaping
  const csvSafe = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // B. Sales CSV
  let salesCsv = 'Order ID,Bill Number,Date Time,Type,Customer Name,Customer Phone,Table,Payment Method,Subtotal,Tax,Discount,Total Amount,Status,Items Summary\n';
  for (const o of masterDb.orders) {
    const itemsSummary = (o.items || []).map(i => `${i.name || i.title || 'Item'} (${i.quantity || i.qty || 1})`).join(' | ');
    salesCsv += [
      csvSafe(o.id || ''),
      csvSafe(o.orderNumber || ''),
      csvSafe(o.createdAt || o.date || ''),
      csvSafe(o.type || 'dine-in'),
      csvSafe(o.customerName || 'Walk-in Guest'),
      csvSafe(o.customerPhone || ''),
      csvSafe(o.tableNumber || o.table || ''),
      csvSafe(o.paymentMethod || 'cash'),
      csvSafe(o.subtotal || 0),
      csvSafe(o.tax || 0),
      csvSafe(o.discount || 0),
      csvSafe(o.total || o.grandTotal || 0),
      csvSafe(o.status || 'completed'),
      csvSafe(itemsSummary)
    ].join(',') + '\n';
  }
  const salesCsvPath = path.join(__dirname, 'sales_data_complete.csv');
  fs.writeFileSync(salesCsvPath, salesCsv);

  // C. Menu Items CSV
  let menuCsv = 'Item ID,SKU Code,Item Name,Category,Base Price,Selling Price,Tax Rate %,Food Type,Status,Description\n';
  for (const m of masterDb.menuItems) {
    menuCsv += [
      csvSafe(m.id || ''),
      csvSafe(m.code || m.sku || ''),
      csvSafe(m.name || ''),
      csvSafe(m.category || m.categoryName || ''),
      csvSafe(m.basePrice || m.price || 0),
      csvSafe(m.price || 0),
      csvSafe(m.taxRate || m.tax || 0),
      csvSafe(m.isVeg ? 'Veg' : 'Non-Veg'),
      csvSafe(m.status || (m.available !== false ? 'Active' : 'Inactive')),
      csvSafe(m.description || '')
    ].join(',') + '\n';
  }
  const menuCsvPath = path.join(__dirname, 'menu_items_complete.csv');
  fs.writeFileSync(menuCsvPath, menuCsv);

  // D. Recipes CSV
  let recipeCsv = 'Recipe ID,Menu Item ID/Name,Ingredient Name,Quantity,Unit,Unit Cost,Estimated Cost\n';
  for (const r of masterDb.recipes) {
    const itemRef = r.itemName || r.itemId || r.name || 'Recipe Item';
    if (Array.isArray(r.ingredients)) {
      for (const ing of r.ingredients) {
        recipeCsv += [
          csvSafe(r.id || ''),
          csvSafe(itemRef),
          csvSafe(ing.name || ing.ingredientName || ''),
          csvSafe(ing.quantity || ing.qty || 0),
          csvSafe(ing.unit || ''),
          csvSafe(ing.costPerUnit || ing.cost || 0),
          csvSafe(ing.totalCost || 0)
        ].join(',') + '\n';
      }
    } else {
      recipeCsv += [
        csvSafe(r.id || ''),
        csvSafe(itemRef),
        csvSafe(r.ingredientName || ''),
        csvSafe(r.quantity || 0),
        csvSafe(r.unit || ''),
        csvSafe(r.cost || 0),
        csvSafe(r.totalCost || 0)
      ].join(',') + '\n';
    }
  }
  const recipeCsvPath = path.join(__dirname, 'recipes_breakdown_complete.csv');
  fs.writeFileSync(recipeCsvPath, recipeCsv);

  // E. Inventory Stock CSV
  let invCsv = 'Inventory ID,Item Name,Category,Quantity,Unit,Reorder Level,Unit Cost,Total Value\n';
  for (const i of masterDb.inventory) {
    const qty = Number(i.quantity || i.qty || i.stock || 0);
    const unitCost = Number(i.unitCost || i.cost || 0);
    const totalVal = qty * unitCost;
    invCsv += [
      csvSafe(i.id || ''),
      csvSafe(i.name || ''),
      csvSafe(i.category || ''),
      csvSafe(qty),
      csvSafe(i.unit || 'pcs'),
      csvSafe(i.minStock || i.reorderLevel || 0),
      csvSafe(unitCost),
      csvSafe(totalVal)
    ].join(',') + '\n';
  }
  const invCsvPath = path.join(__dirname, 'inventory_stock_complete.csv');
  fs.writeFileSync(invCsvPath, invCsv);

  // F. Customers CSV
  let custCsv = 'Customer ID,Name,Phone,Email,Ruby Points,Wallet Balance,Discount Tier,Created Date\n';
  for (const c of masterDb.loyaltyUsers) {
    custCsv += [
      csvSafe(c.id || ''),
      csvSafe(c.name || ''),
      csvSafe(c.phone || ''),
      csvSafe(c.email || ''),
      csvSafe(c.rubyPoints || c.points || 0),
      csvSafe(c.walletBalance || 0),
      csvSafe(c.tier || `${c.discountPct || 0}% OFF`),
      csvSafe(c.createdAt || '')
    ].join(',') + '\n';
  }
  const custCsvPath = path.join(__dirname, 'customers_loyalty_complete.csv');
  fs.writeFileSync(custCsvPath, custCsv);

  // 6. Push updated master back to Cloud to guarantee 100% sync
  console.log('[6/6] Syncing master dataset back to cloud website endpoint ...');
  try {
    const pushRes = await fetch('https://pos.tendengyros.com/api/sync/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sync-token': 'TDG_POS_SYNC_2026_SECRET'
      },
      body: JSON.stringify(masterDb)
    });
    if (pushRes.ok) {
      const pushData = await pushRes.json();
      console.log(`  ✓ Cloud push confirmed! Total orders in cloud: ${pushData.ordersCount}`);
    } else {
      console.warn(`  ⚠️ Cloud push status: ${pushRes.status}`);
    }
  } catch (e) {
    console.warn(`  ⚠️ Cloud push warning: ${e.message}`);
  }

  console.log('\n====================================================');
  console.log('  ✅ BACKUP COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
  console.log(`📁 Master JSON File: ${masterJsonPath}`);
  console.log(`📊 Sales CSV File:   ${salesCsvPath}`);
  console.log(`🍔 Menu CSV File:    ${menuCsvPath}`);
  console.log(`📖 Recipe CSV File:  ${recipeCsvPath}`);
  console.log(`📦 Inventory CSV:    ${invCsvPath}`);
  console.log(`👥 Customer CSV:     ${custCsvPath}`);
  console.log('====================================================\n');
}

runCompleteBackup();
