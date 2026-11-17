const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Loads the secrets from your .env file

// Initialize the Express application
const app = express();

// Middleware
app.use(cors()); // Allows your React frontend to talk to this backend without security blocks
app.use(express.json()); // Tells the server to understand JSON data sent from the frontend
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to the MongoDB database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Successfully connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Start listening for requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);

});
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const movieRoutes = require('./routes/movies');
app.use('/api/movies', movieRoutes);

const bookingRoutes = require('./routes/bookings');
app.use('/api/bookings', bookingRoutes);

const uploadRoutes = require('./routes/upload');
app.use('/api/upload', uploadRoutes);