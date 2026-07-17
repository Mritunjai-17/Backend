const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AuthService = require('../services/auth-service');

const authService = new AuthService();

/**
 * Seed default admin if user collection is empty
 */
const seedAdminUser = async () => {
  try {
    // Only seed if database is connected
    if (mongoose.connection.readyState !== 1) return;

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@midis.in';
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('User collection is empty. Seeding default administrator...');
      await User.create({
        name: 'Midis Admin',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        isActive: true,
        isApproved: true,
        status: 'Approved'
      });
      console.log('Administrator account seeded successfully in MongoDB Atlas.');
    } else {
      // Ensure the default admin is always approved
      await User.updateOne(
        { email: adminEmail },
        { $set: { isApproved: true, status: 'Approved' } }
      );
      console.log('Database user accounts present. Skipping seeding. Default admin approval state verified.');
    }
  } catch (err) {
    console.error('Error seeding admin account:', err.message);
  }
};

// Seed automatically when mongoose connection opens
mongoose.connection.once('open', seedAdminUser);

/**
 * @desc    Login Admin, Set HTTP-only Cookie
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide both email and password'
    });
  }

  const reqEmail = email.toLowerCase().trim();
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@midis.in').toLowerCase().trim();
  const isDBConnected = mongoose.connection.readyState === 1;

  try {
    let userDetails = null;

    if (isDBConnected) {
      // 1. Database Login Flow
      const user = await User.findOne({ email: reqEmail });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      if (user.isActive === false) {
        return res.status(401).json({
          success: false,
          error: 'Account is deactivated'
        });
      }

      // Check if user is approved
      if (user.isApproved === false) {
        return res.status(403).json({
          success: false,
          error: 'Your administrator account is awaiting approval.'
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      userDetails = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        status: user.status
      };
    } else {
      // 2. Offline Fallback Login Flow (Uses secure bcrypt hashing)
      if (reqEmail !== adminEmail) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials (Offline Mode)'
        });
      }

      const seedPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const hashedSeed = await bcrypt.hash(seedPassword, 10);
      const isMatch = await bcrypt.compare(password, hashedSeed);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials (Offline Mode)'
        });
      }

      userDetails = {
        id: 'offline-admin',
        name: 'Midis Admin (Offline)',
        email: adminEmail,
        role: 'admin'
      };
      
      console.log('Admin authenticated successfully via Standalone In-Memory fallback.');
    }

    // Sign Token
    const token = jwt.sign(
      { id: userDetails.id, email: userDetails.email },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' }
    );

    // Set cookie configuration options
    const cookieOptions = {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 Hours
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    };

    res.cookie('token', token, cookieOptions);

    res.status(200).json({
      success: true,
      user: userDetails
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      error: 'Server authentication error'
    });
  }
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const isDBConnected = mongoose.connection.readyState === 1;
    if (!isDBConnected) {
      return res.status(500).json({
        success: false,
        error: 'Database connection offline. Cannot register.'
      });
    }

    const existingUser = await authService.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Account already exists.'
      });
    }

    const newUser = await authService.registerUser({
      name,
      email,
      password,
      role: 'admin',
      isActive: true,
      isApproved: false,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please login.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isApproved: newUser.isApproved,
        status: newUser.status
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      error: 'Server registration error'
    });
  }
};

/**
 * @desc    Logout Admin, Clear Cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * @desc    Get Current Logged-In User Profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
};
