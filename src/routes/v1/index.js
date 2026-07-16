const express = require('express');
const router = express.Router();
const blogController = require('../../controllers/blog-controller');
const authController = require('../../controllers/authController');
const { protect } = require('../../middlewares/authMiddleware');

// Auth Endpoints
router.post('/auth/login', authController.login);
router.post('/auth/logout', protect, authController.logout);
router.get('/auth/me', protect, authController.getMe);

// Blog Endpoints
router.get('/blogs', blogController.getAll);
router.get('/blogs/:id', blogController.get);
router.post('/blogs', protect, blogController.create);
router.put('/blogs/:id', protect, blogController.update);
router.delete('/blogs/:id', protect, blogController.destroy);

module.exports = router;
