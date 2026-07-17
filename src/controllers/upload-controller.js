const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads/blog');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename preserving extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WEBP, and SVG images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

/**
 * Handle blog image upload
 * @route POST /api/v1/upload
 */
const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
      error: 'File is required'
    });
  }

  // Generate relative URL path for the frontend
  const imageUrl = `/uploads/blog/${req.file.filename}`;

  return res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    url: imageUrl
  });
};

module.exports = {
  upload,
  uploadImage
};
