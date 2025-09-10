const TableBooking = require('../models/TableBooking');

// CREATE TABLE BOOKING
exports.createBooking = async (req, res) => {
  try {
    const { businessId, tableCount, bookingTime, bookingDate, note } = req.body;

    if (!businessId || !tableCount || !bookingTime || !bookingDate) {
      return res.status(400).json({
        message: 'Business ID, table count, booking time, and booking date are required'
      });
    }

    const booking = await TableBooking.create({
      userId: req.user._id,
      businessId,
      tableCount,
      bookingTime,
      bookingDate,
      note
    });

    res.status(201).json({ message: 'Table booked successfully ✅', booking });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ message: 'Server error while creating booking' });
  }
};

// GET ALL BOOKINGS
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await TableBooking.find()
      .populate('userId', 'name email')
      .populate('businessId', 'name');
    res.status(200).json(bookings);
  } catch (err) {
    console.error('Get all bookings error:', err);
    res.status(500).json({ message: 'Server error while fetching bookings' });
  }
};

// GET CURRENT USER BOOKINGS
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await TableBooking.find({ userId: req.user._id })
      .populate('businessId', 'name');
    res.status(200).json(bookings);
  } catch (err) {
    console.error('Get user bookings error:', err);
    res.status(500).json({ message: 'Server error while fetching your bookings' });
  }
};
