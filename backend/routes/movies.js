const express = require('express');
const Movie = require('../models/Movie'); // Import the movie blueprint

const router = express.Router();

// GET /api/movies - Fetches all movies from the database
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find(); // Retrieves all movies
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});
// GET /api/movies/:id - Fetches a single movie by its database ID
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

// POST /api/movies - Add a new movie to the database
// POST /api/movies - Add a new movie
router.post('/', async (req, res) => {
  try {
    const movieData = { ...req.body };

    // Force the showtimes field into a valid array if it was passed as a string
    if (movieData.showtimes && typeof movieData.showtimes === 'string') {
      movieData.showtimes = movieData.showtimes.split(',').map(t => t.trim()).filter(t => t);
    }

    const newMovie = new Movie(movieData);
    await newMovie.save();
    res.status(201).json(newMovie);
  } catch (error) {
    console.error("CREATE ERROR:", error.message);
    res.status(500).json({ error: 'Failed to add movie' });
  }
});

// PUT /api/movies/:id - Edit an existing movie
// PUT /api/movies/:id - Edit an existing movie
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData._id;

    // Force the showtimes field into a valid array if it was passed as a string
    if (updateData.showtimes && typeof updateData.showtimes === 'string') {
      updateData.showtimes = updateData.showtimes.split(',').map(t => t.trim()).filter(t => t);
    }

    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!updatedMovie) return res.status(404).json({ error: 'Movie not found' });
    res.status(200).json(updatedMovie);
  } catch (error) {
    console.error("EDIT ERROR:", error.message);
    res.status(500).json({ error: 'Failed to update movie' });
  }
});

// DELETE /api/movies/:id - Delete a movie
router.delete('/:id', async (req, res) => {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie) return res.status(404).json({ error: 'Movie not found' });
    res.status(200).json({ message: 'Movie successfully deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});
module.exports = router;