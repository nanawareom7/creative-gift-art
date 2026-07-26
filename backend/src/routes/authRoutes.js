const express = require('express');
const router = express.Router();
const { login, getProfile, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { loginValidator } = require('../validators/authValidator');

// POST /api/auth/login
router.post('/login', loginValidator, login);

// GET /api/auth/profile  (protected)
router.get('/profile', protect, getProfile);

// POST /api/auth/logout  (protected)
router.post('/logout', protect, logout);

module.exports = router;
