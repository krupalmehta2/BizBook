const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const bookingController = require('../controllers/bookingController');

// User routes
router.post('/', verifyToken, bookingController.createBooking);
router.get('/me', verifyToken, bookingController.getUserBookings);
router.patch('/:id/cancel', verifyToken, bookingController.cancelUserBooking); // Add this line

// Admin routes
router.get('/', adminAuth, bookingController.getAllBookings);
router.post('/admin/bookings/:id/status', adminAuth, bookingController.updateStatusAdmin);
router.patch('/:id/status', adminAuth, bookingController.updateStatusAPI);

module.exports = router;