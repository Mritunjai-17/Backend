const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Ensure uploads/portfolio directory exists
const portfolioUploadDir = path.join(__dirname, '../../uploads/portfolio');
if (!fs.existsSync(portfolioUploadDir)) {
  fs.mkdirSync(portfolioUploadDir, { recursive: true });
}

const portfolioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, portfolioUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const portfolioFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf'
  ];
  
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

  if (allowedMimeTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, WEBP images, and PDF documents are allowed.'), false);
  }
};

const uploadPortfolioMiddleware = multer({
  storage: portfolioStorage,
  fileFilter: portfolioFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

module.exports = uploadPortfolioMiddleware;
