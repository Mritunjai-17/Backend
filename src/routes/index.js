const express = require('express');
const router = express.Router();
const v1ApiRoutes = require('./v1');
const adminRoutes = require('./adminRoutes');
const portfolioRoutes = require('./portfolioRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');
const authController = require('../controllers/authController');
const uploadController = require('../controllers/upload-controller');
const { validateRegisterInput } = require('../middlewares/validationMiddleware');
const { protect, approvedAdmin } = require('../middlewares/authMiddleware');

router.use('/v1', v1ApiRoutes);
router.use('/admin', adminRoutes);
router.use('/portfolio', portfolioRoutes);

// Combined Subscription & Contact Routes (/api/subscribe and /api/contact)
router.use('/', subscriptionRoutes);

// Upload portfolio image (endpoint: /api/upload/portfolio-image)
router.post('/upload/portfolio-image', protect, approvedAdmin, uploadController.uploadPortfolio.single('image'), uploadController.uploadPortfolioImage);

// Register route (endpoint: /api/auth/register)
router.post('/auth/register', validateRegisterInput, authController.register);

module.exports = router;

