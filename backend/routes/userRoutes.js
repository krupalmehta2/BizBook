// routes/userRoutes.js
const express = require('express');
const router = express.Router();

// Controllers
const {
  registerUser,
  loginUser,
  getMe,
  createTableBooking,
  getMyBookings
} = require('../controllers/userController');

// Auth middleware
const verifyToken = require('../middleware/auth');

// ─── AUTH ROUTES ───────────────────────────────
router.post('/register', registerUser);
router.post('/login', loginUser);

// ─── USER PROFILE ─────────────────────────────
router.get('/me', verifyToken, getMe);

// ─── BOOKINGS ─────────────────────────────────
router.post('/book-table', verifyToken, createTableBooking);
router.get('/my-bookings', verifyToken, getMyBookings);

module.exports = router;
