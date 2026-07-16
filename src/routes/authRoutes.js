const express = require('express'); // Wait! It is express!
const router = express.Router();
const { login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Bind paths
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
