import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function Booking() {
  const params = useParams(); 
  const movieId = params.movieId || params.id; 
  
  const [searchParams] = useSearchParams();
  const showtime = searchParams.get('time'); 
  
  const navigate = useNavigate();
  
  // State to track which seats the user clicked
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  
  const ticketPrice = 150; 

  // ==========================================
  // NEW: Fetch already booked seats from MongoDB 
  // ==========================================
  useEffect(() => {
    const fetchBookedSeats = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/bookings/movie/${movieId}?time=${encodeURIComponent(showtime)}`);
        // Update our state with the taken seats (turns them red!)
        setBookedSeats(response.data);
      } catch (error) {
        console.error("Error fetching booked seats:", error);
      }
    };

    if (movieId && showtime) {
      fetchBookedSeats();
    }
  }, [movieId, showtime]);
  // ==========================================

  // Generate a grid of seats (Rows A-D, Seats 1-8)
  const rows = ['A', 'B', 'C', 'D'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8];

  const handleSeatClick = (seatId) => {
    if (bookedSeats.includes(seatId)) return; // Prevent clicking already booked seats

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleCheckout = async () => {
    if (selectedSeats.length === 0) return alert("Please select at least one seat.");
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert("You must be logged in to book seats!");
      navigate('/login');
      return;
    }

    try {
      const bookingData = {
        movieId: movieId,
        showtime: showtime, 
        seats: selectedSeats,
        totalPrice: selectedSeats.length * ticketPrice
      };

      const response = await axios.post('http://localhost:5000/api/bookings', bookingData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      alert(`Success! You booked ${selectedSeats.join(', ')}`);
      navigate('/my-tickets');
      
    } catch (error) {
      console.error("Booking failed:", error);
      alert(error.response?.data?.error || "Failed to process booking. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 mt-10 bg-gray-800 rounded-lg shadow-lg text-white">
      <h1 className="text-4xl font-bold mb-8 text-center border-b border-gray-600 pb-4">Select Your Seats</h1>
      
      {/* The Screen Graphic */}
      <div className="w-3/4 h-12 bg-gray-300 mx-auto mb-10 rounded-t-3xl flex items-center justify-center text-gray-800 font-bold tracking-widest shadow-white drop-shadow-lg">
        SCREEN
      </div>

      {/* The Seat Grid */}
      <div className="flex flex-col items-center gap-4 mb-10">
        {rows.map(row => (
          <div key={row} className="flex gap-4">
            {cols.map(col => {
              const seatId = `${row}${col}`;
              const isBooked = bookedSeats.includes(seatId);
              const isSelected = selectedSeats.includes(seatId);

              // Determine seat color dynamically
              let seatClass = "bg-gray-600 hover:bg-gray-500 cursor-pointer";
              if (isBooked) seatClass = "bg-red-600 cursor-not-allowed opacity-50";
              if (isSelected) seatClass = "bg-green-500 shadow-lg shadow-green-500/50";

              return (
                <div 
                  key={seatId} 
                  onClick={() => handleSeatClick(seatId)}
                  className={`w-10 h-10 rounded-t-lg flex items-center justify-center text-sm font-bold transition-all ${seatClass}`}
                >
                  {seatId}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Checkout Section */}
      <div className="bg-gray-900 p-6 rounded-lg flex justify-between items-center">
        <div>
          <p className="text-gray-400">Selected Seats: <span className="text-white font-bold">{selectedSeats.join(', ') || 'None'}</span></p>
          <p className="text-2xl font-bold text-green-400 mt-2">Total:  ₹{selectedSeats.length * ticketPrice}</p>
        </div>
        <button 
          onClick={handleCheckout}
          className="bg-red-600 px-8 py-3 rounded text-lg font-bold hover:bg-red-700 transition"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}