import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieDetail from './pages/MovieDetail';
import Booking from './pages/Booking';
import MyTickets from './pages/MyTickets';
import AdminDashboard from './pages/AdminDashboard';
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 font-sans">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
         <Route path="/book/:id" element={<Booking/>} />
          <Route path="/admin" element={<AdminDashboard />} />
        

          <Route path="/my-tickets" element={<MyTickets />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;