const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: Number, required: true }, // Duration in minutes
  posterUrl: { type: String, required: true },
  showtimes: { type: [String], default: [] },
  price: { type: Number, required: true, default: 15 }, // NEW: Base ticket price
  description: { type: String }
});

module.exports = mongoose.model('Movie', movieSchema);