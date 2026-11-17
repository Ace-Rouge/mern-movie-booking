const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Imports your User blueprint

const router = express.Router();

// 1. SIGNUP ROUTE
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    // Scramble the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});
// 2. LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if the typed password matches the scrambled database password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate a single secure digital ID card (token) with BOTH user ID and Admin status
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    // Send one clean response back to React
    res.status(200).json({ 
      token, 
      isAdmin: user.isAdmin,
      message: "Logged in successfully",
      user: { id: user._id, name: user.name, role: user.role }
    });

  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});
module.exports = router;