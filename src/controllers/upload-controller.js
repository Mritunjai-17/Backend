const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Ensure uploads directories exist
const uploadDir = path.join(__dirname, '../../uploads/blog');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const portfolioUploadDir = path.join(__dirname, '../../uploads/portfolio');
if (!fs.existsSync(portfolioUploadDir)) {
  fs.mkdirSync(portfolioUploadDir, { recursive: true });
}

// Multer storage configurations
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const portfolioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, portfolioUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// File filter to allow only images (JPG, PNG, WEBP, GIF, SVG)
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

const portfolioFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP images, and PDF documents are allowed.'), false);
  }
};

const uploadPortfolio = multer({
  storage: portfolioStorage,
  fileFilter: portfolioFileFilter,
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

  const imageUrl = `/uploads/blog/${req.file.filename}`;

  return res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    url: imageUrl
  });
};

/**
 * Handle portfolio image upload & replace old file
 * @route POST /api/upload/portfolio-image
 */
const Portfolio = require('../models/Portfolio');

const uploadPortfolioImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
      error: 'File is required'
    });
  }

  const imageUrl = `/uploads/portfolio/${req.file.filename}`;

  try {
    // Find existing portfolio entry to delete the old image file if possible
    const existing = await Portfolio.findOne();
    if (existing && existing.imageUrl) {
      if (existing.imageUrl.startsWith('/uploads/portfolio/')) {
        const oldFilePath = path.join(__dirname, '../..', existing.imageUrl);
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
            console.log(`Deleted old portfolio image file: ${oldFilePath}`);
          } catch (err) {
            console.error(`Error deleting old file: ${err.message}`);
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Portfolio image uploaded successfully',
      url: imageUrl
    });
  } catch (err) {
    console.error('Error in uploadPortfolioImage:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error handling file upload.'
    });
  }
};

module.exports = {
  upload,
  uploadImage,
  uploadPortfolio,
  uploadPortfolioImage
};
