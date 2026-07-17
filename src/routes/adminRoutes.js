const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, approvedAdmin } = require('../middlewares/authMiddleware');

// Protect all routes under this router
router.use(protect);
router.use(approvedAdmin);

// Admin user management routes
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/approve', adminController.approveUser);
router.patch('/users/:id/reject', adminController.rejectUser);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
