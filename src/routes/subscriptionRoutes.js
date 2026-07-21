const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription-controller');
const contactController = require('../controllers/contact-controller');
const { protect } = require('../middlewares/authMiddleware');
const { validateContactInput } = require('../middlewares/validationMiddleware');
const { contactRateLimiter } = require('../middlewares/rateLimiter');

// ================================
// Subscription Routes (/api/subscribe)
// ================================
// Public route to subscribe
router.post('/subscribe', subscriptionController.create);

// Protected admin routes for subscription management
router.get('/subscribe', protect, subscriptionController.getAll);
router.patch('/subscribe/:id', protect, subscriptionController.update);
router.delete('/subscribe/:id', protect, subscriptionController.deleteSubscription);

// ================================
// Contact Routes (/api/contact)
// ================================
// Public route to submit contact form
router.post('/contact', contactRateLimiter, validateContactInput, contactController.create);

// Protected admin routes for contact management
router.get('/contact', protect, contactController.getAll);
router.patch('/contact/:id', protect, contactController.update);
router.delete('/contact/:id', protect, contactController.deleteContact);

module.exports = router;

