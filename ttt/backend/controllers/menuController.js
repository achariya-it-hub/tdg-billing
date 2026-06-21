const { readDb } = require('../db');

exports.getMenu = (req, res) => {
  try {
    const db = readDb();
    return res.status(200).json(db.menu);
  } catch (error) {
    console.error("Get Menu error:", error);
    return res.status(500).json({ message: 'Server error fetching menu' });
  }
};
