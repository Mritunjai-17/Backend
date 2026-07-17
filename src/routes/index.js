const express = require('express');
const router = express.Router();
const v1ApiRoutes = require('./v1');
const adminRoutes = require('./adminRoutes');
const portfolioRoutes = require('./portfolioRoutes');
const authController = require('../controllers/authController');
const contactController = require('../controllers/contact-controller');
const uploadController = require('../controllers/upload-controller');
const { validateContactInput, validateRegisterInput } = require('../middlewares/validationMiddleware');
const { contactRateLimiter } = require('../middlewares/rateLimiter');
const { protect, approvedAdmin } = require('../middlewares/authMiddleware');

router.use('/v1', v1ApiRoutes);
router.use('/admin', adminRoutes);
router.use('/portfolio', portfolioRoutes);

// Upload portfolio image (endpoint: /api/upload/portfolio-image)
router.post('/upload/portfolio-image', protect, approvedAdmin, uploadController.uploadPortfolio.single('image'), uploadController.uploadPortfolioImage);

// Register route (endpoint: /api/auth/register)
router.post('/auth/register', validateRegisterInput, authController.register);

// Contact route (endpoint: /api/contact)
router.post('/contact', contactRateLimiter, validateContactInput, contactController.create);

// Admin contact dashboard routes
router.get('/contact', protect, contactController.getAll);
router.patch('/contact/:id', protect, contactController.update);
router.delete('/contact/:id', protect, contactController.deleteContact);

module.exports = router;
