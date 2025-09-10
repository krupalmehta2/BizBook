const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  createBooking,
  getAllBookings,
  getUserBookings
} = require('../controllers/tableBookingController');

// Routes
router.post('/', verifyToken, createBooking);
router.get('/', verifyToken, getAllBookings);
router.get('/me', verifyToken, getUserBookings);

module.exports = router;
