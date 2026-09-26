const fs = require('fs');
const path = require('path');

const SERVER_DIR = path.join(__dirname, 'server');
const DB_PATH = path.join(SERVER_DIR, 'db.json');
const VAULT_PATH = path.join(SERVER_DIR, 'sales_vault_LOCK.json');
const SEED_PATH = path.join(SERVER_DIR, 'seed-db.json');
const MASTER_BACKUP_PATH = path.join(SERVER_DIR, 'master_double_backup_LOCK.json');

const targetBills = [
  {
    id: "ORD-20260925-100919",
    orderNumber: 100919,
    kotNumber: 919,
    type: "dine-in",
    source: "pos",
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "upi",
    subtotal: 366,
    rawSubtotal: 366,
    discount: 0,
    tax: 0,
    cgst: 0,
    sgst: 0,
    total: 366,
    customerName: "Walk-in Guest",
    tableNumber: "T1",
    createdAt: "2026-09-25T13:57:00.000+05:30",
    paidAt: "2026-09-25T13:57:00.000+05:30",
    updatedAt: "2026-09-25T13:57:00.000+05:30",
    date: "2026-09-25",
    isCancelled: false,
    isVoid: false,
    cancellationReason: null,
    cancelledBy: null,
    items: [
      {
        id: "item-100919-1",
        menuItemId: "m_classic_gyro_meal",
        menuItemName: "Classic Gyro Meal",
        quantity: 1,
        unitPrice: 366,
        totalPrice: 366,
        status: "completed"
      }
    ]
  },
  {
    id: "ORD-20260925-100917",
    orderNumber: 100917,
    kotNumber: 917,
    type: "dine-in",
    source: "pos",
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "upi",
    subtotal: 618,
    rawSubtotal: 618,
    discount: 0,
    tax: 0,
    cgst: 0,
    sgst: 0,
    total: 618,
    customerName: "Walk-in Guest",
    tableNumber: "T2",
    createdAt: "2026-09-25T12:57:00.000+05:30",
    paidAt: "2026-09-25T12:57:00.000+05:30",
    updatedAt: "2026-09-25T12:57:00.000+05:30",
    date: "2026-09-25",
    isCancelled: false,
    isVoid: false,
    cancellationReason: null,
    cancelledBy: null,
    items: [
      {
        id: "item-100917-1",
        menuItemId: "m_wings_9pc",
        menuItemName: "9 Pc Wings (3 Dips)",
        quantity: 1,
        unitPrice: 270,
        totalPrice: 270,
        status: "completed"
      },
      {
        id: "item-100917-2",
        menuItemId: "m_loaded_fries",
        menuItemName: "Loaded Fries (Chicken)",
        quantity: 1,
        unitPrice: 199,
        totalPrice: 199,
        status: "completed"
      },
      {
        id: "item-100917-3",
        menuItemId: "m_biscoff_shake_reg",
        menuItemName: "Biscoff Shake (Regular)",
        quantity: 1,
        unitPrice: 149,
        totalPrice: 149,
        status: "completed"
      }
    ]
  },
  {
    id: "ORD-20260925-100916",
    orderNumber: 100916,
    kotNumber: 916,
    type: "delivery",
    source: "pos",
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "upi",
    subtotal: 418,
    rawSubtotal: 418,
    discount: 0,
    tax: 0,
    cgst: 0,
    sgst: 0,
    total: 418,
    customerName: "Walk-in Guest",
    tableNumber: "Delivery",
    createdAt: "2026-09-25T12:22:00.000+05:30",
    paidAt: "2026-09-25T12:22:00.000+05:30",
    updatedAt: "2026-09-25T12:22:00.000+05:30",
    date: "2026-09-25",
    isCancelled: false,
    isVoid: false,
    cancellationReason: null,
    cancelledBy: null,
    items: [
      {
        id: "item-100916-1",
        menuItemId: "m_loaded_fries",
        menuItemName: "Loaded Fries (Chicken)",
        quantity: 1,
        unitPrice: 199,
        totalPrice: 199,
        status: "completed"
      },
      {
        id: "item-100916-2",
        menuItemId: "m_spicy_gyro",
        menuItemName: "Spicy Gyro",
        quantity: 1,
        unitPrice: 219,
        totalPrice: 219,
        status: "completed"
      }
    ]
  }
];

function upsertOrdersInFile(filePath, isVault = false) {
  if (!fs.existsSync(filePath)) {
    console.log('File does not exist:', filePath);
    return;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8').trim();
    if (!raw) return;
    const data = JSON.parse(raw);
    let ordersList = Array.isArray(data) ? data : (data.orders || []);

    for (const target of targetBills) {
      const idx = ordersList.findIndex(o => 
        o.orderNumber === target.orderNumber || 
        o.id === target.id ||
        String(o.orderNumber) === String(target.orderNumber)
      );
      if (idx >= 0) {
        ordersList[idx] = { ...ordersList[idx], ...target };
        console.log(`Updated order #${target.orderNumber} in ${path.basename(filePath)}`);
      } else {
        ordersList.push(target);
        console.log(`Inserted order #${target.orderNumber} into ${path.basename(filePath)}`);
      }
    }

    let toSave;
    if (Array.isArray(data)) {
      toSave = ordersList;
    } else {
      toSave = { ...data, orders: ordersList, count: ordersList.length };
    }

    fs.writeFileSync(filePath, JSON.stringify(toSave, null, 2));
    console.log(`Successfully saved ${path.basename(filePath)}`);
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
  }
}

console.log('=== Restoring Cancelled Bills for Yesterday (2026-09-25) ===');
upsertOrdersInFile(DB_PATH);
upsertOrdersInFile(VAULT_PATH, true);
upsertOrdersInFile(SEED_PATH);
upsertOrdersInFile(MASTER_BACKUP_PATH);

console.log('\nRestoration complete!');
