import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Movie() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all movies and find the one matching the current URL ID
    const fetchMovie = async () => {
      try {
        const response = await axios.get(
          "https://mern-movie-booking-delta.vercel.app/api/movies",
        );
        const foundMovie = response.data.find((m) => m._id === id);
        setMovie(foundMovie);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching movie data:", error);
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="text-white text-xl">Movie not found.</div>
      </div>
    );
  }
  // Ensure showtimes is an array before we try to map over it in the return block
  const validShowtimes = Array.isArray(movie.showtimes)
    ? movie.showtimes
    : typeof movie.showtimes === "string"
      ? movie.showtimes
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t)
      : [];

  return (
    <div className="min-h-screen bg-[#111827] pt-24 pb-20 flex justify-center text-white px-4">
      <div className="bg-[#1e293b] max-w-5xl w-full p-8 rounded-xl shadow-2xl flex flex-col md:flex-row gap-10">
        {/* Movie Poster */}
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full md:w-[350px] h-auto rounded-lg object-cover shadow-black/50 shadow-xl"
        />

        {/* Movie Details */}
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-5xl font-black mb-2">{movie.title}</h1>
          <p className="text-red-500 font-bold mb-8">
            {movie.duration} minutes
          </p>

          <p className="text-gray-300 text-lg mb-10 leading-relaxed">
            {movie.description}
          </p>

          <h2 className="text-2xl font-bold mb-4 border-b border-gray-600 pb-2">
            Select a Showtime
          </h2>

          {/* Dynamic Showtimes & Price */}
          <div className="flex flex-wrap gap-5 mt-6">
            {movie.showtimes &&
            (Array.isArray(movie.showtimes)
              ? movie.showtimes
              : movie.showtimes.split(",")
            ).length > 0 ? (
              (Array.isArray(movie.showtimes)
                ? movie.showtimes
                : movie.showtimes.split(",")
              ).map((time, index) => {
                const cleanTime = time.trim();
                if (!cleanTime) return null;
                return (
                  <button
                    key={index}
                    onClick={() =>
                      navigate(
                        `/book/${movie._id}?time=${encodeURIComponent(cleanTime)}`,
                      )
                    }
                    className="group relative bg-[#12121a] border border-white/10 hover:border-[#ff3366] rounded-xl px-6 py-4 flex items-center gap-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,51,102,0.3)]"
                  >
                    {/* Glowing Dot & Time */}
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-[#ff7a00] animate-pulse shadow-[0_0_10px_#ff7a00]"></div>
                      <span className="text-white font-black text-xl tracking-widest">
                        {cleanTime}
                      </span>
                    </div>

                    {/* Price Pill */}
                    <div className="bg-[#ff3366]/10 border border-[#ff3366]/30 text-[#ff3366] px-3 py-1 rounded text-sm font-bold tracking-widest">
                      ₹{movie.price || 0}
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-gray-400 italic tracking-widest text-sm">
                No showtimes available yet. Check back later.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
