const { readDb, writeDb } = require('../db');

exports.getPurchases = (req, res) => {
  try {
    const db = readDb();
    res.status(200).json(db.purchases || []);
  } catch (error) {
    console.error("Get purchases error:", error);
    res.status(500).json({ message: "Server error fetching purchases" });
  }
};

exports.createPurchase = (req, res) => {
  try {
    const { supplier, items, total } = req.body;
    if (!supplier || !items || !items.length || total === undefined) {
      return res.status(400).json({ message: "Purchase data is incomplete." });
    }

    const db = readDb();
    
    // Create new purchase record
    const purchaseId = 'p_' + Date.now();
    const newPurchase = {
      id: purchaseId,
      supplier,
      date: new Date().toISOString(),
      items,
      total: Number(total)
    };

    // Increment inventory items based on purchased items
    items.forEach(purchasedItem => {
      // Find item in inventory
      // We can match by name (case-insensitive or containing substring)
      const invIndex = db.inventory.findIndex(inv => 
        inv.name.toLowerCase().includes(purchasedItem.name.toLowerCase()) ||
        purchasedItem.name.toLowerCase().includes(inv.name.toLowerCase())
      );

      if (invIndex !== -1) {
        db.inventory[invIndex].stock = Number(db.inventory[invIndex].stock) + Number(purchasedItem.quantity);
      } else {
        // If not found, we can optionally add it to inventory
        const newInvId = 'i_' + Date.now() + Math.random().toString(36).substr(2, 5);
        db.inventory.push({
          id: newInvId,
          name: purchasedItem.name,
          stock: Number(purchasedItem.quantity),
          unit: purchasedItem.unit || "pcs",
          lowStockThreshold: 10
        });
      }
    });

    db.purchases.push(newPurchase);
    writeDb(db);

    res.status(201).json({ message: "Purchase logged and inventory updated!", purchase: newPurchase, inventory: db.inventory });
  } catch (error) {
    console.error("Create purchase error:", error);
    res.status(500).json({ message: "Server error recording purchase" });
  }
};
