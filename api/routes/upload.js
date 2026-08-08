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

// Safe MIME types and extensions whitelist
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'video/ogg'
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.webm', '.ogv'];

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
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanExt = ALLOWED_EXTENSIONS.includes(ext) ? ext : '.bin';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + cleanExt);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype) || !ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error('Invalid file type. Only JPG, PNG, WEBP, SVG, MP4, and WEBM files are allowed.'), false);
  }
  cb(null, true);
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // Max 50MB limit
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
