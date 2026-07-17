const express = require('express');
const router = express.Router();
const v1ApiRoutes = require('./v1');
const contactController = require('../controllers/contact-controller');
const { validateContactInput } = require('../middlewares/validationMiddleware');
const { contactRateLimiter } = require('../middlewares/rateLimiter');

router.use('/v1', v1ApiRoutes);

// Contact route (endpoint: /api/contact)
router.post('/contact', contactRateLimiter, validateContactInput, contactController.create);

module.exports = router;
