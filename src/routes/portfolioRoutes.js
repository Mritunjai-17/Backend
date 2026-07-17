const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { protect, approvedAdmin } = require('../middlewares/authMiddleware');

// Public route to fetch current portfolio
router.get('/', portfolioController.getPortfolio);

// Protected route to update the portfolio image link
router.put('/image', protect, approvedAdmin, portfolioController.updatePortfolioImage);

// Protected route to delete the portfolio image (reverts to default)
router.delete('/image', protect, approvedAdmin, portfolioController.deletePortfolioImage);

module.exports = router;
