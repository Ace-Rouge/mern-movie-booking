import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/movies');
        setMovies(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Automatically cycle through the first 3 movies every 5 seconds
  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % Math.min(movies.length, 3));
    }, 5000);
    return () => clearInterval(interval);
  }, [movies]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500 border-solid"></div>
      </div>
    );
  }

  // Grab the currently active movie from the top 3
  const featuredMovie = movies.length > 0 ? movies[currentIndex] : null;

  return (
    <div className="bg-gray-900 min-h-screen text-white pb-16">
      
      {/* Dynamic Hero Carousel Section */}
      {featuredMovie && (
        <div className="relative h-[70vh] w-full flex items-center justify-center transition-all duration-700 ease-in-out">
          {/* Background Image with Gradient Fade */}
          <div 
            key={featuredMovie._id}
            className="absolute inset-0 bg-cover bg-top animate-fade-in"
            style={{ backgroundImage: `url(${featuredMovie.posterUrl})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Hero Text Content */}
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
            <span className="bg-red-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block shadow">
              Featured Premiere
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-xl">{featuredMovie.title}</h1>
            <p className="text-lg md:text-2xl text-gray-200 mb-8 drop-shadow-md line-clamp-2">{featuredMovie.description}</p>
            <Link to={`/movie/${featuredMovie._id}`} className="bg-red-600 text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-red-700 transition shadow-red-500/50 shadow-lg transform hover:scale-105 inline-block">
              Book Tickets Now
            </Link>
          </div>

          {/* Carousel Navigation Dots */}
          <div className="absolute bottom-10 flex space-x-3 z-20">
            {movies.slice(0, 3).map((_, index) => (
              <button 
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-red-500 w-8' : 'bg-gray-400 hover:bg-gray-200'}`}
              ></button>
            ))}
          </div>
        </div>
      )}

      {/* Movie Catalog Grid */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold border-l-4 border-red-500 pl-4">Now Showing</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {movies.map((movie) => (
            <div key={movie._id} className="group bg-gray-800 rounded-xl overflow-hidden shadow-xl relative transition-all duration-300 hover:-translate-y-2 hover:shadow-red-500/20 cursor-pointer">
              
              <div className="relative h-96 overflow-hidden">
                <img 
                  src={movie.posterUrl} 
                  alt={movie.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <p className="text-sm text-gray-300 mb-4 line-clamp-4">{movie.description}</p>
                  <Link to={`/movie/${movie._id}`} className="bg-red-600 w-full text-center py-3 rounded font-bold hover:bg-red-500 transition shadow">
                    Get Tickets
                  </Link>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-xl font-bold mb-1 truncate">{movie.title}</h3>
                <div className="flex justify-between items-center text-sm text-gray-400 mt-2">
                  <span className="flex items-center font-medium">
                    ⏱ {movie.duration} min
                  </span>
                  <span className="text-red-400 font-medium tracking-wide border border-red-400/30 px-2 py-1 rounded bg-red-400/10">
                    2D / IMAX
                  </span>
                </div>
              </div>
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}