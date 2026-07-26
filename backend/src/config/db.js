const mongoose = require('mongoose');

// ─── Connection state ────────────────────────────────────────────────────────
let isConnected = false;
let reconnectTimer = null;
const RECONNECT_DELAY_MS = 5000; // 5 seconds initial delay
const MAX_RECONNECT_DELAY_MS = 60000; // cap at 60 seconds

/**
 * Attempt to connect (or reconnect) to MongoDB with exponential back-off.
 * Never calls process.exit() — the server stays up and re-tries automatically.
 */
const connectDB = async (attempt = 1) => {
  if (isConnected) return;

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌  MONGO_URI is not defined in environment variables.');
    return;
  }

  try {
    await mongoose.connect(uri, {
      // Connection pool — handle concurrent requests gracefully
      maxPoolSize: 10,
      minPoolSize: 2,

      // Timeouts
      serverSelectionTimeoutMS: 10000,  // Wait up to 10s to find a server
      connectTimeoutMS: 15000,           // Wait up to 15s for initial TCP connection
      socketTimeoutMS: 45000,            // Close idle sockets after 45s

      // Heartbeat — detect drops quickly
      heartbeatFrequencyMS: 10000,       // Ping server every 10s

      // Retry
      retryWrites: true,
      retryReads: true,

      // Buffering — keep commands in memory while reconnecting
      bufferCommands: true,
    });

    isConnected = true;
    attempt = 1; // reset back-off counter on success
    console.log(`✅  MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    isConnected = false;
    const delay = Math.min(RECONNECT_DELAY_MS * attempt, MAX_RECONNECT_DELAY_MS);
    console.error(`❌  MongoDB connection failed (attempt ${attempt}): ${err.message}`);
    console.log(`🔄  Retrying in ${delay / 1000}s…`);

    // Clear any existing timer before scheduling a new one
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => connectDB(attempt + 1), delay);
  }
};

// ─── Mongoose connection event listeners ────────────────────────────────────
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('✅  MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error(`❌  MongoDB connection error: ${err.message}`);
  // Do NOT crash the server — Mongoose will attempt to reconnect automatically
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️   MongoDB disconnected. Waiting for automatic reconnect…');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('🔄  MongoDB reconnected successfully');
});

mongoose.connection.on('close', () => {
  isConnected = false;
  console.warn('⚠️   MongoDB connection closed');
});

// ─── Export helpers ──────────────────────────────────────────────────────────
/**
 * Returns the current MongoDB connection state as a string.
 * States: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
 */
const getDBState = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
};

module.exports = connectDB;
module.exports.getDBState = getDBState;
