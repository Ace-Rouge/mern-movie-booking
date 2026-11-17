import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  
  // Check if a login token exists in browser memory
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin'); // Clear admin status on logout
    navigate('/login');};

  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center shadow-lg">
      <div className="text-2xl font-bold text-red-500">
        <Link to="/">🎬 MovieTicket</Link>
      </div>
      <div className="space-x-6 font-semibold flex items-center">
        <Link to="/" className="hover:text-red-400 transition-colors">Home</Link>
        
        {/* ONLY render this link if the user is an admin */}
        {isAdmin && (
          <Link to="/admin" className="hover:text-[#ff7a00] transition-colors uppercase tracking-widest text-xs font-bold">Admin</Link>
        )}
        
        {/* Conditionally show My Tickets & Logout if logged in */}
        {token ? (
          <>
            <Link to="/my-tickets" className="hover:text-[#ff7a00] transition-colors uppercase tracking-widest text-xs font-bold">My Tickets</Link>
            <button 
              onClick={handleLogout}
              className="bg-transparent border border-[#ff3366] text-[#ff3366] px-4 py-2 rounded hover:bg-[#ff3366] hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-red-400 transition-colors">Login</Link>
            <Link to="/register" className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition-colors">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}