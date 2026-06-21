const { readDb, writeDb } = require('../db');

exports.getInventory = (req, res) => {
  try {
    const db = readDb();
    res.status(200).json(db.inventory || []);
  } catch (error) {
    console.error("Get inventory error:", error);
    res.status(500).json({ message: "Server error fetching inventory" });
  }
};

exports.updateStock = (req, res) => {
  try {
    const { id, stock } = req.body;
    if (id === undefined || stock === undefined) {
      return res.status(400).json({ message: "Item ID and stock level are required." });
    }

    const db = readDb();
    const itemIndex = db.inventory.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Inventory item not found." });
    }

    db.inventory[itemIndex].stock = Number(stock);
    writeDb(db);

    res.status(200).json({ message: "Stock updated successfully!", item: db.inventory[itemIndex] });
  } catch (error) {
    console.error("Update stock error:", error);
    res.status(500).json({ message: "Server error updating stock" });
  }
};
