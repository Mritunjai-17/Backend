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

// Public route to fetch all portfolio gallery items
router.get('/', portfolioController.getPortfolio);

// Protected routes to add a new portfolio image entry
router.post('/upload', protect, approvedAdmin, handleUpload, portfolioController.createPortfolioImage);
router.post('/image', protect, approvedAdmin, handleUpload, portfolioController.createPortfolioImage);
router.put('/image', protect, approvedAdmin, handleUpload, portfolioController.createPortfolioImage);
router.post('/', protect, approvedAdmin, handleUpload, portfolioController.createPortfolioImage);

// Protected routes to delete a specific portfolio image item by ID
router.delete('/image/:id', protect, approvedAdmin, portfolioController.deletePortfolioImage);
router.delete('/:id', protect, approvedAdmin, portfolioController.deletePortfolioImage);
router.delete('/', protect, approvedAdmin, portfolioController.deletePortfolioImage);

module.exports = router;
