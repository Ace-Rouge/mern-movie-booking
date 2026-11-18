import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function Booking() {
  const params = useParams();
  const movieId = params.movieId || params.id;

  const [searchParams] = useSearchParams();
  const showtime = searchParams.get("time");

  const navigate = useNavigate();

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [movie, setMovie] = useState(null);

  // NEW: Timer State
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const seatResponse = await axios.get(
          `https://mern-movie-booking-omega.vercel.app//api/bookings/movie/${movieId}?time=${encodeURIComponent(showtime)}`,
        );
        setBookedSeats(seatResponse.data);

        const movieResponse = await axios.get(
          `https://mern-movie-booking-omega.vercel.app//api/movies/${movieId}`,
        );
        setMovie(movieResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (movieId && showtime) {
      fetchData();
    }
  }, [movieId, showtime]);

  // NEW: Countdown Timer Logic
  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      alert("Session expired. Your seats have been released.");
      setSelectedSeats([]);
      setTimerActive(false);
      setTimeLeft(300);
      // In a production app, you'd also send a batch DELETE request here
      // to unlock them immediately, but MongoDB TTL will handle it automatically.
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  // Helper to format seconds into M:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const rows = ["A", "B", "C", "D"];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8];

  // UPGRADED: handleSeatClick now talks to the backend to lock/unlock
  const handleSeatClick = async (seatId) => {
    if (bookedSeats.includes(seatId)) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to select seats.");
      navigate("/login");
      return;
    }

    try {
      if (selectedSeats.includes(seatId)) {
        // Unlock the seat
        await axios.delete(
          "https://mern-movie-booking-omega.vercel.app//api/bookings/lock",
          {
            headers: { Authorization: `Bearer ${token}` },
            data: { movieId, showtime, seatId }, // Axios DELETE requires body in 'data'
          },
        );

        const newSelection = selectedSeats.filter((seat) => seat !== seatId);
        setSelectedSeats(newSelection);

        // Stop timer if cart is empty
        if (newSelection.length === 0) {
          setTimerActive(false);
          setTimeLeft(300);
        }
      } else {
        // Lock the seat
        await axios.post(
          "https://mern-movie-booking-omega.vercel.app//api/bookings/lock",
          { movieId, showtime, seatId },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setSelectedSeats([...selectedSeats, seatId]);

        // Start timer on first selection
        if (!timerActive) {
          setTimerActive(true);
        }
      }
    } catch (error) {
      alert(error.response?.data?.error || "Failed to reserve seat.");
    }
  };

  const handleCheckout = async () => {
    if (selectedSeats.length === 0)
      return alert("Please select at least one seat.");

    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const bookingData = {
        movieId: movieId,
        showtime: showtime,
        seats: selectedSeats,
        totalPrice: selectedSeats.length * (movie?.price || 0),
      };

      await axios.post(
        "https://mern-movie-booking-omega.vercel.app//api/bookings",
        bookingData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert(`Success! You booked ${selectedSeats.join(", ")}`);
      navigate("/my-tickets");
    } catch (error) {
      console.error("Booking failed:", error);
      alert(error.response?.data?.error || "Failed to process booking.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 mt-10 bg-gray-800 rounded-lg shadow-lg text-white">
      <div className="flex justify-between items-center mb-8 border-b border-gray-600 pb-4">
        <h1 className="text-4xl font-bold">Select Your Seats</h1>

        {/* NEW: Live Countdown Display */}
        {timerActive && (
          <div className="bg-red-600/20 border border-red-500 text-red-400 px-4 py-2 rounded font-mono text-xl font-bold">
            Time Left: {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* The Cinematic Seat Grid & Screen (Combined) */}
      <div className="bg-[#12121a]/80 backdrop-blur-xl p-10 rounded-3xl border border-white/10 max-w-4xl mx-auto w-full flex flex-col gap-4 items-center shadow-2xl mb-10">
        {/* The Premium Screen Graphic (Moved INSIDE the grid box) */}
        <div className="w-full max-w-2xl mb-12 flex flex-col items-center">
          <div className="w-[80%] h-4 border-t-4 border-[#ff7a00] rounded-t-[50%] opacity-50 shadow-[0_-10px_30px_rgba(255,122,0,0.3)]"></div>
          <p className="text-[10px] text-slate-500 tracking-[0.4em] uppercase mt-4">
            Screen
          </p>
        </div>

        {/* The Seats */}
        <div className="flex flex-col items-center gap-4">
          {rows.map((row) => (
            <div key={row} className="flex gap-4">
              {cols.map((col) => {
                const seatId = `${row}${col}`;
                const isBooked = bookedSeats.includes(seatId);
                const isSelected = selectedSeats.includes(seatId);

                let seatClass =
                  "bg-[#1a1a26] text-slate-400 border border-white/10 hover:border-[#ff3366]/50 hover:text-white cursor-pointer hover:-translate-y-1";
                if (isBooked) {
                  seatClass =
                    "bg-[#0a0a0f] text-slate-700 border border-white/5 cursor-not-allowed opacity-40";
                } else if (isSelected) {
                  seatClass =
                    "bg-[#ff3366] text-white shadow-[0_0_20px_rgba(255,51,102,0.6)] border border-[#ff3366] scale-110";
                }

                return (
                  <button
                    key={seatId}
                    disabled={isBooked}
                    onClick={() => handleSeatClick(seatId)}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-t-xl rounded-b-md flex items-center justify-center text-xs font-black transition-all duration-300 ${seatClass}`}
                  >
                    {seatId}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 p-6 rounded-lg flex justify-between items-center">
        <div>
          <p className="text-gray-400">
            Selected Seats:{" "}
            <span className="text-white font-bold">
              {selectedSeats.join(", ") || "None"}
            </span>
          </p>
          <p className="text-2xl font-bold text-green-400 mt-2">
            Total: ₹{selectedSeats.length * (movie?.price || 0)}
          </p>
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
