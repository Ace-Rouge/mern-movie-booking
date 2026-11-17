import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/bookings/my-tickets', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTickets(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setLoading(false);
      }
    };
    fetchTickets();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-[#ff3366] tracking-[0.3em] text-sm uppercase font-bold animate-pulse">Loading Wallet...</div>
      </div>
    );
  }

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this ticket? The seats will be released immediately.")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Ticket cancelled successfully.");
      // Remove the deleted ticket from the screen without needing to refresh the page
      setTickets(tickets.filter(ticket => ticket._id !== bookingId));
    } catch (error) {
      console.error("Failed to cancel ticket:", error);
      alert("Failed to cancel ticket. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-20 px-4 md:px-16 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black tracking-widest uppercase mb-2 border-l-4 border-[#ff3366] pl-4">My Tickets</h1>
        <p className="text-slate-400 tracking-widest text-sm mb-12 uppercase pl-5">Your cinematic journey</p>

        {tickets.length === 0 ? (
          <div className="text-center glass-panel p-16 rounded-xl">
            <p className="text-2xl font-bold tracking-widest mb-6">No tickets found</p>
            <Link to="/" className="btn-cinepulse px-8 py-3 uppercase tracking-widest text-sm">Browse Movies</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="glass-panel flex flex-col md:flex-row rounded-xl overflow-hidden shadow-2xl border-l-4 border-l-[#ff7a00]">
                {/* Movie Poster Thumbnail */}
                <div className="w-full md:w-1/3 h-48 md:h-auto">
                  <img 
                    src={ticket.movie?.posterUrl} 
                    alt={ticket.movie?.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Ticket Details */}
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-widest text-[#ff3366] mb-1">
                      {ticket.movie?.title}
                    </h2>
                    <p className="text-xs text-slate-400 tracking-[0.2em] uppercase mb-6">Standard 2D</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Showtime</p>
                        <p className="font-bold text-lg">{ticket.showtime}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Seats</p>
                        <p className="font-bold text-[#ff7a00] text-lg">{ticket.seats.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto border-t border-dashed border-white/20 pt-4 flex justify-between items-end">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-widest">Total Paid</p>
                      <p className="text-xl font-bold text-green-400">₹{ticket.totalPrice}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-[10px] text-slate-500 tracking-wider font-mono">ID: {ticket._id.slice(-8).toUpperCase()}</p>
                      <button 
                        onClick={() => handleCancel(ticket._id)}
                        className="text-[10px] bg-transparent border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-colors px-3 py-1 rounded tracking-widest uppercase font-bold"
                      >
                        Cancel Ticket
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                      Purchased: {new Date(ticket.bookingDate).toLocaleDateString()}
                    </p>
                    <p className="font-black text-xl">₹{ticket.totalPrice}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}