const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // We will encrypt this later
  isAdmin: { type: Boolean, default: false } // Automatically makes new users standard users
});
  
//   role: { type: String, default: 'customer', enum: ['customer', 'admin'] } 
// }, { timestamps: true }); // Automatically adds createdAt and updatedAt dates


module.exports = mongoose.model('User', userSchema);