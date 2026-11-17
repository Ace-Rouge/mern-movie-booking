import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Inside your handleSubmit try block:
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('isAdmin', response.data.isAdmin); // Save admin status
      navigate('/');

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };
  

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Welcome Back</h2>
        
        {/* Displays the error message from the backend if login fails */}
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input 
            type="email" name="email" placeholder="Email Address" 
            onChange={handleChange} required
            className="p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <input 
            type="password" name="password" placeholder="Password" 
            onChange={handleChange} required
            className="p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button type="submit" className="bg-red-600 text-white p-3 rounded font-bold hover:bg-red-700 transition">
            Log In
          </button>
        </form>

        <p className="text-gray-400 mt-4 text-center">
          New here? <Link to="/register" className="text-red-500 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}