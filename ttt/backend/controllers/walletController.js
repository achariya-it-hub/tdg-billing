const { readDb, writeDb } = require('../db');

exports.getWallet = (req, res) => {
  try {
    const db = readDb();
    const user = db.users.find(u => u.id === req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const transactions = db.transactions.filter(t => t.userId === req.userId);
    // Sort transactions by date descending
    transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      rubyBalance: user.rubyBalance,
      scratchCards: user.scratchCards || [],
      transactions: transactions
    });
  } catch (error) {
    console.error("Get Wallet error:", error);
    return res.status(500).json({ message: 'Server error fetching wallet details' });
  }
};

exports.scratchCard = (req, res) => {
  try {
    const { cardId } = req.body;
    if (!cardId) {
      return res.status(400).json({ message: 'Card ID is required' });
    }

    const db = readDb();
    const userIndex = db.users.findIndex(u => u.id === req.userId);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = db.users[userIndex];
    const cardIndex = (user.scratchCards || []).findIndex(c => c.id === cardId);
    
    if (cardIndex === -1) {
      return res.status(404).json({ message: 'Scratch card not found' });
    }

    const card = user.scratchCards[cardIndex];
    if (card.claimed) {
      return res.status(400).json({ message: 'This card is already claimed' });
    }

    // Process claim
    card.claimed = true;
    card.subtitle = "Claimed";
    user.rubyBalance += card.amount;

    // Create credit transaction
    const newTransaction = {
      id: 't_' + Date.now(),
      userId: user.id,
      type: 'credit',
      amount: card.amount,
      description: `Scratch Card: ${card.title}`,
      createdAt: new Date().toISOString()
    };
    db.transactions.push(newTransaction);

    writeDb(db);

    const transactions = db.transactions.filter(t => t.userId === req.userId);
    transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      message: `Successfully scratched and claimed ${card.amount} Rubies!`,
      rubyBalance: user.rubyBalance,
      scratchCards: user.scratchCards,
      transactions: transactions
    });
  } catch (error) {
    console.error("Scratch Card error:", error);
    return res.status(500).json({ message: 'Server error claiming scratch card' });
  }
};

exports.addRubies = (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid rubies amount is required' });
    }

    const db = readDb();
    const userIndex = db.users.findIndex(u => u.id === req.userId);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = db.users[userIndex];
    user.rubyBalance += Number(amount);

    // Create credit transaction
    const newTransaction = {
      id: 't_' + Date.now(),
      userId: user.id,
      type: 'credit',
      amount: Number(amount),
      description: 'Purchased Rubies',
      createdAt: new Date().toISOString()
    };
    db.transactions.push(newTransaction);

    writeDb(db);

    const transactions = db.transactions.filter(t => t.userId === req.userId);
    transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      message: `Successfully added ${amount} Rubies to wallet!`,
      rubyBalance: user.rubyBalance,
      scratchCards: user.scratchCards || [],
      transactions: transactions
    });
  } catch (error) {
    console.error("Add Rubies error:", error);
    return res.status(500).json({ message: 'Server error adding rubies' });
  }
};
