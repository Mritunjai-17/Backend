const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription-controller');
const { protect } = require('../middlewares/authMiddleware');

// Public route to subscribe
router.post('/', subscriptionController.create);

// Protected admin routes for CMS
router.get('/', protect, subscriptionController.getAll);
router.patch('/:id', protect, subscriptionController.update);
router.delete('/:id', protect, subscriptionController.deleteSubscription);

module.exports = router;
