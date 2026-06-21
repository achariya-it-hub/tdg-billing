const { readDb, writeDb } = require('../db');

exports.getCustomers = (req, res) => {
  try {
    const db = readDb();
    // Map users to customer profiles (without sensitive info like passwords)
    const customers = db.users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      rubyBalance: u.rubyBalance || 0,
      denLevel: u.denLevel || "Bronze",
      completedDens: u.completedDens || 0,
      denProgress: u.denProgress || 0,
      scratchCards: u.scratchCards || []
    }));

    res.status(200).json(customers);
  } catch (error) {
    console.error("Get customers error:", error);
    res.status(500).json({ message: "Server error fetching customers" });
  }
};

exports.updateCustomerRubies = (req, res) => {
  try {
    const { id } = req.params;
    const { rubies, type, description } = req.body; // type: credit/debit, description: message

    if (rubies === undefined || !type) {
      return res.status(400).json({ message: "Rubies amount and transaction type are required." });
    }

    const db = readDb();
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const user = db.users[userIndex];
    const amount = Number(rubies);
    
    if (type === 'debit' && user.rubyBalance < amount) {
      return res.status(400).json({ message: "Insufficient ruby balance" });
    }

    if (type === 'credit') {
      user.rubyBalance = (user.rubyBalance || 0) + amount;
    } else {
      user.rubyBalance = (user.rubyBalance || 0) - amount;
    }

    // Determine loyalty tier based on rubies (simple business logic matching the mobile app)
    if (user.rubyBalance >= 2000) {
      user.denLevel = "Gold";
    } else if (user.rubyBalance >= 800) {
      user.denLevel = "Silver";
    } else {
      user.denLevel = "Bronze";
    }

    // Add transaction history
    const transactionId = 't_' + Date.now();
    const newTransaction = {
      id: transactionId,
      userId: user.id,
      type,
      amount,
      description: description || "Admin Adjustment",
      createdAt: new Date().toISOString()
    };
    db.transactions.push(newTransaction);

    writeDb(db);

    res.status(200).json({
      message: "Customer rubies updated successfully!",
      user: {
        id: user.id,
        name: user.name,
        rubyBalance: user.rubyBalance,
        denLevel: user.denLevel
      }
    });
  } catch (error) {
    console.error("Update rubies error:", error);
    res.status(500).json({ message: "Server error updating rubies" });
  }
};

exports.awardScratchCard = (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount } = req.body;

    if (!title || amount === undefined) {
      return res.status(400).json({ message: "Scratch card title and amount are required." });
    }

    const db = readDb();
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const user = db.users[userIndex];
    if (!user.scratchCards) {
      user.scratchCards = [];
    }

    const cardId = 's_' + Date.now() + '_' + Math.floor(Math.random() * 100);
    const newCard = {
      id: cardId,
      title,
      subtitle: "Tap to scratch",
      amount: Number(amount),
      claimed: false
    };

    user.scratchCards.push(newCard);
    writeDb(db);

    res.status(201).json({ message: "Scratch card awarded successfully!", card: newCard });
  } catch (error) {
    console.error("Award scratch card error:", error);
    res.status(500).json({ message: "Server error awarding scratch card" });
  }
};
