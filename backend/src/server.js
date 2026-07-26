require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const { getDBState } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const templateRoutes = require('./routes/templateRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// ─── Connect to MongoDB (non-blocking — server stays up even if DB is slow) ──
connectDB();

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow image serving
  })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl, same-origin)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // In development, be permissive; in production, enforce
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      callback(new Error(`CORS policy: origin '${origin}' not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 300, // Increased: was 100
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for admin dashboard & internal health pings
  skip: (req) => req.path === '/health',
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 20, // Increased: was 10
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
});

app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
// Increased from 10kb → 50kb to handle templates with many image URLs
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// ─── Request Timeout (30 seconds) ────────────────────────────────────────────
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    if (!res.headersSent) {
      res.status(408).json({
        success: false,
        message: 'Request timed out. Please try again.',
      });
    }
  });
  next();
});

// ─── Logger ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─── Static Files (uploaded images) ──────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Health Check (enhanced — includes DB state) ─────────────────────────────
app.get('/health', (req, res) => {
  const dbState = getDBState();
  const isHealthy = dbState === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    message: isHealthy
      ? 'Creative Gift Art API is running'
      : 'API running but database is not connected',
    environment: process.env.NODE_ENV || 'development',
    database: dbState,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + 's',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── Root Route ───────────────────────────────────────────────────────────────
// ===============================
// Serve React Frontend
// ===============================

app.use(express.static(path.join(__dirname, '../public')));

app.get('*', (req, res) => {
  // Allow API routes to continue using Express routers
  if (req.path.startsWith('/api') || req.path === '/health') {
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found',
    });
  }

  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(
    `🚀  Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully…`);
  server.close(() => {
    console.log('✅  HTTP server closed.');
    process.exit(0);
  });

  // Force close after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error('❌  Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ─── Unhandled Promise Rejections ────────────────────────────────────────────
// CRITICAL FIX: DO NOT crash the server on transient DB errors.
// Log the error and continue — Mongoose will reconnect automatically.
process.on('unhandledRejection', (reason, promise) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  console.error(`⚠️   Unhandled Rejection at: ${promise}\n    Reason: ${message}`);
  // Do NOT call server.close() or process.exit() here.
  // Crashing the server on every transient MongoDB error is the root cause
  // of the random frontend-backend disconnection issue.
});

// ─── Uncaught Exceptions ─────────────────────────────────────────────────────
// These ARE fatal — log and exit so the process manager (Render) can restart
process.on('uncaughtException', (err) => {
  console.error(`❌  Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  // Give server a moment to log before exiting
  server.close(() => process.exit(1));
  setTimeout(() => process.exit(1), 5000);
});

module.exports = app;
