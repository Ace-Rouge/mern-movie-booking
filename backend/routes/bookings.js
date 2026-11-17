const express = require('express');
const Booking = require('../models/Booking');
 const auth = require('../middleware/auth'); // Import your JWT auth middleware
 const SeatLock = require('../models/SeatLock');
// const auth = require('./auth');

const router = express.Router();

// POST /api/bookings - Create a new booking (Protected by auth middleware)
router.post('/', auth, async (req, res) => {
  try {
    const { movieId, showtime, seats, totalPrice } = req.body;

    // Securely grab the user ID from the decoded JWT token (req.user)
    const userId = req.user.id || req.user._id;

    const newBooking = new Booking({
      user: userId,
      movie: movieId,
      showtime,
      seats,
      totalPrice
    });

    await newBooking.save();
    res.status(201).json({ message: 'Booking successful!', booking: newBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process booking' });
  }
});


// GET /api/bookings/movie/:movieId - Fetch booked seats for a specific showtime
router.get('/movie/:movieId', async (req, res) => {
  try {
    const { time } = req.query; // Grab the showtime from the request
    
    // Find bookings that match both the movie AND the exact time
    const query = { movie: req.params.movieId };
    if (time) query.showtime = time;

    const bookings = await Booking.find(query);
    
    // Flatten all the booked seats into a single array
    const bookedSeats = bookings.flatMap(booking => booking.seats);
    res.status(200).json(bookedSeats);
  } catch (error) {
    console.error("Error fetching booked seats:", error);
    res.status(500).json({ error: 'Failed to fetch booked seats' });
  }
});
// GET /api/bookings/my-tickets - Fetch tickets for the logged-in user
router.get('/my-tickets', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    // .populate('movie') tells MongoDB to fetch the actual movie details, not just the ID!
    const myBookings = await Booking.find({ user: userId }).populate('movie').sort({ bookingDate: -1 });
    
    res.status(200).json(myBookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});


// DELETE /api/bookings/:id - Cancel a booking and free up the seats
router.delete('/:id', auth, async (req, res) => {
  try {
    const bookingId = req.params.id;
    // Verify the logged-in user actually owns the ticket they are trying to delete
    const userId = req.user.id || req.user._id;

    const deletedBooking = await Booking.findOneAndDelete({ _id: bookingId, user: userId });
    
    if (!deletedBooking) {
      return res.status(404).json({ error: 'Ticket not found or unauthorized' });
    }

    res.status(200).json({ message: 'Ticket cancelled successfully. Seats have been released.' });
  } catch (error) {
    console.error("Cancel Ticket Error:", error);
    res.status(500).json({ error: 'Failed to cancel ticket' });
  }
});



// POST /api/bookings/lock - Temporarily lock a seat
router.post('/lock', auth, async (req, res) => {
  try {
    const { movieId, showtime, seatId } = req.body;
    const userId = req.user.id || req.user._id;

    // Check if the seat is already permanently booked
    const isBooked = await Booking.findOne({ movie: movieId, showtime, seats: seatId });
    if (isBooked) return res.status(400).json({ error: 'Seat is already booked.' });

    // Check if someone else already locked it
    const isLocked = await SeatLock.findOne({ movieId, showtime, seatId });
    if (isLocked && isLocked.user.toString() !== userId.toString()) {
      return res.status(400).json({ error: 'Seat is currently locked by another user.' });
    }

    // Create the 5-minute lock
    const newLock = new SeatLock({ seatId, movieId, showtime, user: userId });
    await newLock.save();

    res.status(200).json({ message: 'Seat locked successfully.' });
  } catch (error) {
    console.error("Lock Error:", error);
    res.status(500).json({ error: 'Failed to lock seat' });
  }
});

// DELETE /api/bookings/lock - Unlock a seat if the user deselects it
router.delete('/lock', auth, async (req, res) => {
  try {
    const { movieId, showtime, seatId } = req.body;
    const userId = req.user.id || req.user._id;

    // Only allow the user who locked it to unlock it
    await SeatLock.findOneAndDelete({ movieId, showtime, seatId, user: userId });
    
    res.status(200).json({ message: 'Seat unlocked.' });
  } catch (error) {
    console.error("Unlock Error:", error);
    res.status(500).json({ error: 'Failed to unlock seat' });
  }
});

module.exports = router;