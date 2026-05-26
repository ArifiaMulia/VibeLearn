const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '..', 'uploads');
const videoDir = path.join(uploadDir, 'videos');
const imageDir = path.join(uploadDir, 'images');

[uploadDir, videoDir, imageDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith('video/')) {
      cb(null, videoDir);
    } else if (file.mimetype.startsWith('image/')) {
      cb(null, imageDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// POST /api/upload
router.post('/', auth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Construct public URL path based on destination
  let publicPath = `/uploads/${req.file.filename}`;
  if (req.file.mimetype.startsWith('video/')) {
    publicPath = `/uploads/videos/${req.file.filename}`;
  } else if (req.file.mimetype.startsWith('image/')) {
    publicPath = `/uploads/images/${req.file.filename}`;
  }

  res.json({ 
    message: 'File uploaded successfully',
    url: publicPath,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

module.exports = router;
