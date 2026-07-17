const express = require('express');
const router = express.Router();
const v1ApiRoutes = require('./v1');
const contactController = require('../controllers/contact-controller');
const { validateContactInput } = require('../middlewares/validationMiddleware');
const { contactRateLimiter } = require('../middlewares/rateLimiter');
const { protect } = require('../middlewares/authMiddleware');

router.use('/v1', v1ApiRoutes);

// Contact route (endpoint: /api/contact)
router.post('/contact', contactRateLimiter, validateContactInput, contactController.create);

// Admin contact dashboard routes
router.get('/contact', protect, contactController.getAll);
router.patch('/contact/:id', protect, contactController.update);
router.delete('/contact/:id', protect, contactController.deleteContact);

module.exports = router;
