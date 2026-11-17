const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  showtime: { type: String, required: true }, // e.g., "14:00"
  seats: [{ type: String, required: true }],  // e.g., ["A1", "A2"]
  totalPrice: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);