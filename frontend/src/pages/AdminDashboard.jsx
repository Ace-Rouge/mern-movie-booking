import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const token = localStorage.getItem('token');
  const [movies, setMovies] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    description: '',
    showtimes: '',
    price: '', // New state for price
  });

  // Fetch movies for the list
  const fetchMovies = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/movies');
      setMovies(response.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Convert comma-separated string to an array of showtimes before sending
  const prepareShowtimes = (timeString) => {
    if (!timeString) return [];
    return timeString.split(',').map(time => time.trim()).filter(time => time);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalPosterUrl = formData.posterUrl; // Use existing URL by default

      // Only upload a new image if one was actually selected
      if (imageFile) {
        const imageForm = new FormData();
        imageForm.append('image', imageFile);
        const uploadResponse = await axios.post('http://localhost:5000/api/upload', imageForm, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        finalPosterUrl = uploadResponse.data.imageUrl;
      }

      // If creating a new movie (not editing), an image is mandatory
      if (!isEditing && !finalPosterUrl) {
         return alert("Please select a movie poster image!");
      }

      // Package the data
      const movieData = { 
        ...formData, 
        posterUrl: finalPosterUrl,
        showtimes: prepareShowtimes(formData.showtimes) 
      };

      // Send the correct API request based on Edit vs Create
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/movies/${currentId}`, movieData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Movie updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/movies', movieData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Movie added successfully!');
      }
      
      // Reset form and refresh list
      setFormData({ title: '', duration: '', description: '', showtimes: '' });
      setImageFile(null);
      setIsEditing(false);
      setCurrentId(null);
      
      // Clear the file input visually
      document.querySelector('input[type="file"]').value = ''; 
      
      fetchMovies();

    } catch (error) {
      console.error('Error saving movie:', error);
      alert('Failed to save movie. Check console for details.');
    }
  };
  const handleEdit = (movie) => {
    setIsEditing(true);
    setCurrentId(movie._id);
    setFormData({
      title: movie.title,
      duration: movie.duration,
      description: movie.description,
      showtimes: Array.isArray(movie.showtimes) ? movie.showtimes.join(', ') : (movie.showtimes || ''),
      posterUrl: movie.posterUrl,
      price: movie.price || '' // Populate the price for editing
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/movies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Movie deleted.');
      fetchMovies();
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Failed to delete movie.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-20 px-4 md:px-16 text-white flex flex-col items-center">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-black tracking-widest uppercase mb-2 border-l-4 border-[#ff3366] pl-4">Command Center</h1>
        <p className="text-slate-400 tracking-widest text-sm mb-10 uppercase pl-5">
          {isEditing ? 'Edit Cinema Entry' : 'Upload New Cinema'}
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="glass-panel p-8 md:p-12 rounded-xl shadow-2xl flex flex-col gap-6 border-t-4 border-t-[#ff7a00] mb-16">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-2">Movie Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required
                className="w-full bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff3366] transition-colors" />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-2">Duration (Minutes)</label>
              <input type="number" name="duration" value={formData.duration} onChange={handleChange} required
                className="w-full bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff3366] transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-2">Ticket Price ($)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required
                className="w-full bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff3366] transition-colors" />
            </div>
          </div>

          <div>
             <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-2">Showtimes (Comma Separated)</label>
             <input type="text" name="showtimes" value={formData.showtimes} onChange={handleChange} placeholder="e.g. 10:00 AM, 1:30 PM, 6:00 PM"
                className="w-full bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff3366] transition-colors" />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-2">
              {isEditing ? 'Update Poster Image (Optional)' : 'Upload Poster Image'}
            </label>
            <input type="file" accept="image/*" onChange={handleFileChange} 
              className="w-full bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff3366] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#ff3366] file:text-white" />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-2">Synopsis</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows="3"
              className="w-full bg-[#12121a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff3366] resize-none"></textarea>
          </div>

          <div className="flex gap-4">
            <button type="submit" className="btn-cinepulse flex-1 py-4 uppercase tracking-widest font-bold text-sm">
              {isEditing ? 'Update Movie' : 'Publish to Catalog'}
            </button>
            {isEditing && (
              <button type="button" onClick={() => { setIsEditing(false); setCurrentId(null); setFormData({ title: '', duration: '', description: '', showtimes: '' }); setImageFile(null); }} className="bg-gray-700 hover:bg-gray-600 transition-colors px-6 rounded-lg uppercase tracking-widest font-bold text-sm">
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Existing Catalog List */}
        <h2 className="text-2xl font-bold tracking-widest uppercase mb-6 border-l-4 border-[#6366f1] pl-4">Active Catalog</h2>
        <div className="flex flex-col gap-4">
          {movies.map(movie => (
            <div key={movie._id} className="glass-panel p-4 rounded-lg flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <img src={movie.posterUrl} alt={movie.title} className="w-12 h-16 object-cover rounded" />
                 <div>
                   <h3 className="font-bold uppercase tracking-wide">{movie.title}</h3>
                   <p className="text-xs text-slate-400">Duration: {movie.duration} min | Showtimes: {movie.showtimes?.length || 0}</p>
                 </div>
               </div>
               <div className="flex gap-3">
                 <button onClick={() => handleEdit(movie)} className="text-sm font-bold text-[#ff7a00] hover:text-white uppercase tracking-widest">Edit</button>
                 <button onClick={() => handleDelete(movie._id)} className="text-sm font-bold text-[#ff3366] hover:text-white uppercase tracking-widest">Delete</button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}