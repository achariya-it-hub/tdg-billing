const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { readDb, writeDb } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'tdg_secret_key_123';

// In-memory stores for OTP codes
const otpStore = {}; // phone -> { otp, expires }
const emailOtpStore = {}; // email -> { otp, expires }



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

exports.forgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    const db = readDb();
    const user = db.users.find(u => u.phone.replace(/[^0-9]/g, '') === cleanPhone);
    if (!user) {
      return res.status(400).json({ message: 'User not found with this phone number' });
    }

    // Generate a random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Store in-memory with a 5 minute expiry
    otpStore[cleanPhone] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    };

    console.log(`\n[OTP DEBUG] Forgot Password OTP for ${phone} (${cleanPhone}) is: ${otp}\n`);

    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: 'Server error during forgot password' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { phone, email, otp, newPassword } = req.body;
    if ((!phone && !email) || !otp || !newPassword) {
      return res.status(400).json({ message: 'Identifier (phone or email), OTP, and new password are required' });
    }

    const db = readDb();
    let userIndex = -1;
    let cleanPhone = '';
    let cleanEmail = '';

    if (email) {
      cleanEmail = email.trim().toLowerCase();
      userIndex = db.users.findIndex(u => u.email.toLowerCase() === cleanEmail);
    } else if (phone) {
      cleanPhone = phone.replace(/[^0-9]/g, '');
      userIndex = db.users.findIndex(u => u.phone.replace(/[^0-9]/g, '') === cleanPhone);
    }

    if (userIndex === -1) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Verify OTP
    if (email) {
      const stored = emailOtpStore[cleanEmail];
      if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
    } else if (phone) {
      // Verify OTP (allow 'firebase' bypass if validated on the client)
      if (otp !== 'firebase') {
        const stored = otpStore[cleanPhone];
        if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
          return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
      }
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Save password
    db.users[userIndex].password = hashedPassword;
    writeDb(db);

    // Clean up OTP store
    if (email) {
      delete emailOtpStore[cleanEmail];
    } else if (phone) {
      delete otpStore[cleanPhone];
    }

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: 'Server error during password reset' });
  }
};

exports.forgotPasswordEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = readDb();
    const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return res.status(400).json({ message: 'User not found with this email address' });
    }

    // Generate a random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Store in-memory with a 5 minute expiry
    emailOtpStore[cleanEmail] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    };

    console.log(`\n[EMAIL OTP DEBUG] Forgot Password OTP for ${email} is: ${otp}\n`);

    // Setup nodemailer transport using environment variables if configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
          port: parseInt(process.env.EMAIL_PORT || '465'),
          secure: process.env.EMAIL_SECURE !== 'false',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        const mailOptions = {
          from: `"Ten Dens Gyros" <${process.env.EMAIL_USER}>`,
          to: cleanEmail,
          subject: 'TDG Forgot Password OTP',
          text: `Your password reset OTP is ${otp}. It is valid for 5 minutes.`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2>TDG Password Reset</h2>
              <p>You requested a password reset. Use the following 4-digit OTP code to reset your password:</p>
              <h1 style="color: #FFC107; font-size: 32px; letter-spacing: 2px;">${otp}</h1>
              <p>This code is valid for 5 minutes. If you did not request this, please ignore this email.</p>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`[SMTP] Sent OTP successfully to ${cleanEmail}`);
      } catch (smtpError) {
        console.error("Nodemailer SMTP error:", smtpError);
        // Do not crash, let development continue with console fallback
      }
    } else {
      console.log(`[SMTP] Skipping live email sending. Set EMAIL_USER and EMAIL_PASS environment variables to enable.`);
    }

    return res.status(200).json({ message: 'OTP sent to your email successfully' });
  } catch (error) {
    console.error("Forgot password email error:", error);
    return res.status(500).json({ message: 'Server error during email forgot password' });
  }
};


