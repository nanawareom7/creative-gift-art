const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { sendError } = require('../utils/apiResponse');

/**
 * Protect routes - verify JWT token
 */
const protect = async (req, res, next) => {
  let token;

  // Check Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Access denied. No token provided.');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch admin (exclude password)
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      return sendError(res, 401, 'Token invalid. Admin not found.');
    }

    if (!admin.isActive) {
      return sendError(res, 401, 'Account has been deactivated.');
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token expired. Please log in again.');
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Invalid token.');
    }
    return sendError(res, 401, 'Authentication failed.');
  }
};

/**
 * Restrict to specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return sendError(res, 403, 'You do not have permission to perform this action.');
    }
    next();
  };
};

module.exports = { protect, authorize };
