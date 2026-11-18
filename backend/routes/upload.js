const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // Built-in Node module to handle file systems
const router = express.Router();

// Automatically create the 'uploads' folder in the backend directory if it does not exist
const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const imageUrl = `https://mern-movie-booking-8vbig2i4x-ace-05af.vercel.app/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});

module.exports = router;
