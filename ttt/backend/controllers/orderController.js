const { readDb, writeDb } = require('../db');

exports.createOrder = (req, res) => {
  try {
    const { items, subtotal, tax, deliveryFee, total, paymentMethod, deliveryAddress } = req.body;

    if (!items || !items.length || subtotal === undefined || total === undefined || !paymentMethod || !deliveryAddress) {
      return res.status(400).json({ message: 'Order data is incomplete or invalid.' });
    }

    const db = readDb();
    const userIndex = db.users.findIndex(u => u.id === req.userId);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = db.users[userIndex];

    // If paying with Rubies, check balance and deduct
    if (paymentMethod === 'Rubies Wallet') {
      if (user.rubyBalance < total) {
        return res.status(400).json({ message: 'Insufficient Rubies in wallet.' });
      }
      
      // Deduct balance
      user.rubyBalance -= total;
      
      // Create wallet transaction
      const newTransaction = {
        id: 't_' + Date.now(),
        userId: user.id,
        type: 'debit',
        amount: total,
        description: `Order Payment`,
        createdAt: new Date().toISOString()
      };
      db.transactions.push(newTransaction);
    }

    // Generate Order ID (e.g. ORD10024)
    const nextOrderNum = 10000 + db.orders.length + 1;
    const orderId = `ORD${nextOrderNum}`;

    const newOrder = {
      id: orderId,
      userId: user.id,
      items,
      subtotal,
      tax,
      deliveryFee,
      total,
      status: 'Placed', // Initial state
      paymentMethod,
      deliveryAddress,
      createdAt: new Date().toISOString()
    };

    db.orders.push(newOrder);
    writeDb(db);

    return res.status(201).json({
      message: 'Order placed successfully!',
      order: newOrder,
      rubyBalance: user.rubyBalance
    });
  } catch (error) {
    console.error("Create Order error:", error);
    return res.status(500).json({ message: 'Server error placing order' });
  }
};

exports.getOrders = (req, res) => {
  try {
    const db = readDb();
    const userOrders = db.orders.filter(o => o.userId === req.userId);
    
    // Sort orders by date descending
    userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json(userOrders);
  } catch (error) {
    console.error("Get Orders error:", error);
    return res.status(500).json({ message: 'Server error fetching orders' });
  }
};

exports.getAllOrders = (req, res) => {
  try {
    const db = readDb();
    const allOrders = [...db.orders];
    allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.status(200).json(allOrders);
  } catch (error) {
    console.error("Get All Orders error:", error);
    return res.status(500).json({ message: 'Server error fetching all orders' });
  }
};

exports.updateOrderStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const db = readDb();
    const orderIndex = db.orders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ message: 'Order not found' });
    }

    db.orders[orderIndex].status = status;
    writeDb(db);

    return res.status(200).json({ message: 'Order status updated successfully!', order: db.orders[orderIndex] });
  } catch (error) {
    console.error("Update Order Status error:", error);
    return res.status(500).json({ message: 'Server error updating order status' });
  }
};

exports.createAdminOrder = (req, res) => {
  try {
    const { userId, items, subtotal, tax, deliveryFee, total, paymentMethod, deliveryAddress, orderType, tableNumber } = req.body;

    if (!items || !items.length || subtotal === undefined || total === undefined || !paymentMethod) {
      return res.status(400).json({ message: 'Order data is incomplete or invalid.' });
    }

    const db = readDb();
    let user = null;

    if (userId && userId !== 'walkin') {
      const userIndex = db.users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        user = db.users[userIndex];
      }
    }

    // Handle Ruby payment or Ruby accumulation
    if (user) {
      if (paymentMethod === 'Rubies Wallet') {
        if (user.rubyBalance < total) {
          return res.status(400).json({ message: 'Insufficient Rubies in customer wallet.' });
        }
        user.rubyBalance -= total;
        
        // Add transaction
        db.transactions.push({
          id: 't_' + Date.now(),
          userId: user.id,
          type: 'debit',
          amount: total,
          description: `Order ${paymentMethod} Payment`,
          createdAt: new Date().toISOString()
        });
      } else {
        // Accumulate Rubies (10% of order total)
        const earnedRubies = Math.round(total * 0.1);
        if (earnedRubies > 0) {
          user.rubyBalance = (user.rubyBalance || 0) + earnedRubies;
          
          db.transactions.push({
            id: 't_' + Date.now(),
            userId: user.id,
            type: 'credit',
            amount: earnedRubies,
            description: `Earned from Order`,
            createdAt: new Date().toISOString()
          });
        }
      }

      // Update level
      if (user.rubyBalance >= 2000) user.denLevel = "Gold";
      else if (user.rubyBalance >= 800) user.denLevel = "Silver";
      else user.denLevel = "Bronze";
    }

    // Generate Order ID
    const nextOrderNum = 10000 + db.orders.length + 1;
    const orderId = `ORD${nextOrderNum}`;

    const newOrder = {
      id: orderId,
      userId: user ? user.id : 'walkin',
      customerName: user ? user.name : 'Walk-in Customer',
      customerPhone: user ? user.phone : '',
      items,
      subtotal,
      tax,
      deliveryFee: deliveryFee || 0,
      total,
      status: 'Placed',
      paymentMethod,
      deliveryAddress: deliveryAddress || '',
      orderType: orderType || 'Dine-in',
      tableNumber: tableNumber || '',
      createdAt: new Date().toISOString()
    };

    db.orders.push(newOrder);
    writeDb(db);

    return res.status(201).json({
      message: 'Order created successfully!',
      order: newOrder,
      rubyBalance: user ? user.rubyBalance : null
    });
  } catch (error) {
    console.error("Create Admin Order error:", error);
    return res.status(500).json({ message: 'Server error creating order' });
  }
};
