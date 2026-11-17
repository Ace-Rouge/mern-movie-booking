const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  movieId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Movie', // Links this showtime directly to the Movie model
    required: true 
  },
  startTime: { type: String, required: true }, // e.g., "14:00 (2:00 PM)"
  price: { type: Number, required: true },
  bookedSeats: { type: [String], default: [] } // Array of seat IDs that are sold
});

module.exports = mongoose.model('Showtime', showtimeSchema);