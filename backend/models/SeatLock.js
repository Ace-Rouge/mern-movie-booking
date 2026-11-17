const mongoose = require('mongoose');

const seatLockSchema = new mongoose.Schema({
  seatId: { type: String, required: true },
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  showtime: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // MongoDB will automatically delete this document 300 seconds (5 minutes) after it is created
  createdAt: { type: Date, default: Date.now, expires: 200 } 
});

module.exports = mongoose.model('SeatLock', seatLockSchema);