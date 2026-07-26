const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @desc    Admin login
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const { email, password } = req.body;

    // Find admin with password field included
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return sendError(res, 401, 'Invalid email or password');
    }

    if (!admin.isActive) {
      return sendError(res, 401, 'Account has been deactivated. Contact support.');
    }

    // Verify password
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    const token = generateToken(admin._id);

    return sendSuccess(res, 200, 'Login successful', {
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in admin profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return sendError(res, 404, 'Admin not found');
    }

    return sendSuccess(res, 200, 'Profile retrieved successfully', { admin });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout (client-side token invalidation - stateless JWT)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    // JWT is stateless - client must discard the token
    // For server-side blacklisting, implement a token blacklist with Redis in future
    return sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { login, getProfile, logout };
