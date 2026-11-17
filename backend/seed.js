const mongoose = require('mongoose');
const Movie = require('./models/Movie');
require('dotenv').config();

// Connect to the database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected for seeding...'))
  .catch(err => console.error(err));

const sampleMovies = [
  {
    title: "Inception",
    duration: 148,
    posterUrl: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology."
  },
  {
    title: "The Dark Knight",
    duration: 152,
    posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham."
  },
  {
    title: "Interstellar",
    duration: 169,
    posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
  }
];

const seedDB = async () => {
  // Clear any existing movies to prevent duplicates
  await Movie.deleteMany({});
  // Insert the new sample movies
  await Movie.insertMany(sampleMovies);
  console.log("✅ Database successfully seeded with movies!");
  mongoose.connection.close(); // Close the connection when done
};

seedDB();