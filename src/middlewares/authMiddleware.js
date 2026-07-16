const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Protect routes - Verifies JWT from cookie, handles DB and Offline validations
 */
exports.protect = async (req, res, next) => {
  let token;

  // Retrieve token from request cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route. Session missing.'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

    const isDBConnected = mongoose.connection.readyState === 1;

    if (isDBConnected) {
      // 1. Database verification
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User account not found.'
        });
      }

      req.user = user;
    } else {
      // 2. Offline verification fallback
      const adminEmail = (process.env.ADMIN_EMAIL || 'admin@midis.in').toLowerCase().trim();
      
      if (decoded.email.toLowerCase().trim() !== adminEmail) {
        return res.status(401).json({
          success: false,
          error: 'Invalid session credentials (Offline Mode)'
        });
      }

      req.user = {
        id: 'offline-admin',
        name: 'Midis Admin (Offline)',
        email: adminEmail,
        role: 'admin'
      };
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Session expired or token invalid.'
    });
  }
};
