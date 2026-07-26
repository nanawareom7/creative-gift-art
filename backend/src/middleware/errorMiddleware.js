/**
 * Centralized Error Handling Middleware
 */

// Handle 404 - Not Found
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // ─── Mongoose: CastError (invalid ObjectId) ───────────────────────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // ─── Mongoose: Duplicate key error ────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue?.[field] || '';
    statusCode = 409;
    message = `A record with ${field} '${value}' already exists.`;
  }

  // ─── Mongoose: Validation error ───────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // ─── JWT errors ───────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
  }

  // ─── Multer errors ────────────────────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size too large. Maximum allowed size is 5MB.';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected field in file upload.';
  }

  // ─── MongoDB / Network errors → 503 Service Unavailable ──────────────────
  // These happen when Atlas is temporarily unavailable. Return 503 instead of
  // crashing so the frontend can display a friendly retry message.
  const mongoNetworkErrors = [
    'MongoNetworkError',
    'MongoNetworkTimeoutError',
    'MongoServerSelectionError',
    'MongooseServerSelectionError',
    'MongoTimeoutError',
  ];

  if (mongoNetworkErrors.includes(err.name) || err.name?.includes('Mongo')) {
    statusCode = 503;
    message = 'Database temporarily unavailable. Please try again in a moment.';
    // Log the real error server-side (not exposed to client)
    console.error(`[DB Error] ${err.name}: ${err.message}`);
  }

  // ─── CORS errors ─────────────────────────────────────────────────────────
  if (message.includes('CORS policy')) {
    statusCode = 403;
    message = 'Request blocked by CORS policy.';
  }

  // ─── Log server errors (5xx) in production ────────────────────────────────
  if (statusCode >= 500 && process.env.NODE_ENV === 'production') {
    console.error(`[${new Date().toISOString()}] ${statusCode} ${req.method} ${req.originalUrl}`);
    console.error(`  Error: ${err.name || 'Error'} - ${err.message}`);
  }

  const response = {
    success: false,
    message,
  };

  // Include stack trace only in development (never in production)
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.errorName = err.name;
  }

  res.status(statusCode).json(response);
};

module.exports = { notFound, errorHandler };
