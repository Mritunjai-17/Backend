const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { protect, approvedAdmin } = require('../middlewares/authMiddleware');
const uploadPortfolioMiddleware = require('../middlewares/portfolioUpload');

// Helper to handle single file upload field 'image' or 'file'
const handleUpload = (req, res, next) => {
  uploadPortfolioMiddleware.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File size too large. Maximum size allowed is 10MB.'
        });
      }
      return res.status(400).json({
        success: false,
        error: err.message || 'Error uploading file.'
      });
    }
    next();
  });
};

// Public route to fetch current portfolio
router.get('/', portfolioController.getPortfolio);

// Protected routes to update or upload portfolio file (image or PDF)
router.put('/image', protect, approvedAdmin, handleUpload, portfolioController.updatePortfolioImage);
router.post('/upload', protect, approvedAdmin, handleUpload, portfolioController.updatePortfolioImage);
router.put('/', protect, approvedAdmin, handleUpload, portfolioController.updatePortfolioImage);

// Protected route to delete portfolio item
router.delete('/image', protect, approvedAdmin, portfolioController.deletePortfolioImage);
router.delete('/', protect, approvedAdmin, portfolioController.deletePortfolioImage);

module.exports = router;
