const express = require('express');
const router = express.Router();
const v1ApiRoutes = require('./v1');
const contactController = require('../controllers/contact-controller');
const { validateContactInput } = require('../middlewares/validationMiddleware');
const { contactRateLimiter } = require('../middlewares/rateLimiter');
const { authenticate } = require('../middlewares/authMiddleware');

router.use('/v1', v1ApiRoutes);

// Contact route (endpoint: /api/contact)
router.post('/contact', contactRateLimiter, validateContactInput, contactController.create);

// Admin contact dashboard routes
router.get('/contact', authenticate, contactController.getAll);
router.patch('/contact/:id', authenticate, contactController.update);
router.delete('/contact/:id', authenticate, contactController.deleteContact);

module.exports = router;
