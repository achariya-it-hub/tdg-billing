const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readDb, writeDb } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'tdg_secret_key_123';

exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const db = readDb();
    
    // Check if user already exists
    const userExists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = {
      id: 'u_' + Date.now(),
      name,
      email,
      phone,
      password: hashedPassword,
      rubyBalance: 2450, // Default starting rubies
      denLevel: 'Gold',  // Default level
      completedDens: 4,  // Default completed dens
      denProgress: 6,    // Default progress
      scratchCards: [
        { id: 's_' + Date.now() + '_1', title: 'Welcome Scratch Card', subtitle: 'Tap to scratch', amount: 100, claimed: false },
        { id: 's_' + Date.now() + '_2', title: 'New Member Gift', subtitle: 'Tap to scratch', amount: 200, claimed: false }
      ]
    };

    db.users.push(newUser);
    writeDb(db);

    // Generate JWT
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: 'Server error during signup' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const db = readDb();
    const cleanCredentials = email.trim().toLowerCase();
    const user = db.users.find(u => 
      u.email.toLowerCase() === cleanCredentials || 
      u.phone.replace(/[^0-9]/g, '') === cleanCredentials.replace(/[^0-9]/g, '')
    );
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

exports.getProfile = (req, res) => {
  try {
    const db = readDb();
    const user = db.users.find(u => u.id === req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Get Profile error:", error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const db = readDb();
    const userIndex = db.users.findIndex(u => u.id === req.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) db.users[userIndex].name = name;
    if (phone) db.users[userIndex].phone = phone;
    if (email) {
      // Check if email already taken by someone else
      const otherUser = db.users.find(u => u.id !== req.userId && u.email.toLowerCase() === email.toLowerCase());
      if (otherUser) {
        return res.status(400).json({ message: 'Email is already in use by another account' });
      }
      db.users[userIndex].email = email;
    }

    writeDb(db);

    const { password: _, ...userWithoutPassword } = db.users[userIndex];
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Update Profile error:", error);
    return res.status(500).json({ message: 'Server error' });
  }
};
