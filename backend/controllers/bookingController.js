// controllers/bookingController.js
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Business = require('../models/Business');
const Product = require('../models/Product');
const Service = require('../models/Service');

/**
 * ─── CREATE BOOKING ───────────────────────────────
 */
exports.createBooking = async (req, res) => {
  try {
    const {
      businessId,
      type,
      note,
      productId,
      serviceId,
      tableCount,
      bookingDate,
      bookingTime,
      deliveryAddress,
      deliveryContact,
    } = req.body;

    // Check logged-in user
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized: user not found.' });
    }

    const bookingType = type?.toLowerCase();
    if (!bookingType) {
      return res.status(400).json({ message: 'Booking type is required.' });
    }

    // Fetch business
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    if (business.type.toLowerCase() !== bookingType) {
      return res.status(400).json({
        message: `This business only supports '${business.type}' bookings.`,
      });
    }

    // Parse booking date
    let parsedDate = bookingDate ? new Date(bookingDate) : null;
    if (bookingDate && isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid booking date format.' });
    }

    const bookingData = {
      userId: req.user._id,
      businessId,
      type: bookingType,
      note: note || '',
      bookingDate: parsedDate,
      bookingTime: bookingTime || '',
      status: 'pending',
    };

    /**
     * ─── ORDER ─────────────────────────────
     */
    if (bookingType === 'order') {
      if (!productId) {
        return res.status(400).json({ message: 'Product ID is required.' });
      }

      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      if (product.type !== 'product') {
        return res.status(400).json({ message: 'Selected item is not a product' });
      }

      if (!deliveryAddress || !deliveryContact) {
        return res.status(400).json({
          message: 'Delivery address and contact are required for orders.',
        });
      }

      bookingData.productId = productId;
      bookingData.deliveryAddress = deliveryAddress;
      bookingData.deliveryContact = deliveryContact;
    }

    /**
     * ─── TABLE ─────────────────────────────
     */
    else if (bookingType === 'table') {
      const count = Number(tableCount);
      if (!count || isNaN(count) || !parsedDate || !bookingTime) {
        return res.status(400).json({
          message: 'Table count, booking date, and booking time are required.',
        });
      }

      // Normalize day
      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingBookings = await Booking.find({
        businessId: new mongoose.Types.ObjectId(businessId),
        type: 'table',
        bookingDate: { $gte: startOfDay, $lte: endOfDay },
        bookingTime,
        status: { $ne: 'cancelled' },
      });

      const alreadyBooked = existingBookings.reduce(
        (sum, b) => sum + (b.tableCount || 0),
        0
      );

      if (alreadyBooked + count > (business.totalTables || 0)) {
        return res.status(400).json({ message: 'Not enough tables available.' });
      }

      bookingData.tableCount = count;
    }

    /**
     * ─── APPOINTMENT ─────────────────────────────
     */
    else if (bookingType === 'appointment') {
      if (!parsedDate || !bookingTime) {
        return res.status(400).json({
          message: 'Booking date and time are required for appointments.',
        });
      }

      if (!serviceId) {
        return res.status(400).json({ message: 'Service ID is required.' });
      }

      // Find service
      let service = await Service.findById(serviceId);
      if (!service) {
        // fallback in Product collection if type='service'
        service = await Product.findOne({ _id: serviceId, type: 'service' });
        if (!service) {
          return res.status(404).json({ message: 'Service not found.' });
        }
      }

      if (service.businessId.toString() !== businessId.toString()) {
        return res.status(400).json({
          message: 'This service does not belong to the selected business.',
        });
      }

      // Check appointment clash
      const conflict = await Booking.findOne({
        businessId,
        type: 'appointment',
        serviceId,
        bookingDate: parsedDate,
        bookingTime,
        status: { $ne: 'cancelled' },
      });

      if (conflict) {
        return res.status(400).json({
          message: 'This appointment slot is already booked. Please choose another time.',
        });
      }

      bookingData.serviceId = serviceId;
    } else {
      return res.status(400).json({ message: 'Invalid booking type.' });
    }

    // Save booking
    const booking = await Booking.create(bookingData);

    const populated = await Booking.findById(booking._id)
      .populate('userId', 'name email')
      .populate('businessId', 'name address contact totalTables type')
      .populate('productId', 'name price')
      .populate('serviceId', 'name price duration');

    res.status(201).json({ message: 'Booking successful', booking: populated });
  } catch (err) {
    console.error('❌ Booking error:', err);
    res.status(500).json({ message: 'Booking failed: ' + err.message });
  }
};

/**
 * ─── GET USER BOOKINGS ─────────────────────────────
 */
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('userId', 'name email')
      .populate('businessId', 'name address contact totalTables type')
      .populate('productId', 'name price')
      .populate('serviceId', 'name price')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (err) {
    console.error('❌ User bookings error:', err);
    res.status(500).json({ message: 'Could not fetch bookings.' });
  }
};

/**
 * ─── GET ALL BOOKINGS ─────────────────────────────
 */
exports.getAllBookings = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type.toLowerCase();

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email')
      .populate('businessId', 'name address contact totalTables type')
      .populate('productId', 'name price')
      .populate('serviceId', 'name price')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (err) {
    console.error('❌ All bookings error:', err);
    res.status(500).json({ message: 'Failed to fetch bookings.' });
  }
};

/**
 * ─── ADMIN: STATUS UPDATE (EJS form) ───────────────
 */
exports.updateStatusAdmin = async (req, res) => {
  try {
    const status = (req.body.status || '').toLowerCase();
    const valid = ['pending', 'done', 'cancelled'];
    if (!valid.includes(status)) return res.status(400).send('Invalid status');

    await Booking.findByIdAndUpdate(req.params.id, { status });
    res.redirect('/admin/bookings');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating status');
  }
};

/**
 * ─── ADMIN/API: STATUS UPDATE (JSON) ───────────────
 */
exports.updateStatusAPI = async (req, res) => {
  try {
    const status = (req.body.status || '').toLowerCase();
    const valid = ['pending', 'done', 'cancelled'];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('userId', 'name email')
      .populate('businessId', 'name address contact totalTables type')
      .populate('productId', 'name price')
      .populate('serviceId', 'name price');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    res.json({ message: 'Status updated', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add this new method to handle user cancellations
exports.cancelUserBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find the booking and verify ownership
    const booking = await Booking.findOneAndUpdate(
      { 
        _id: id,
        userId,
        status: 'pending' // Only allow cancelling pending bookings
      },
      { status: 'cancelled' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found, already cancelled, or not authorized' 
      });
    }

    const populated = await Booking.findById(booking._id)
      .populate('userId', 'name email')
      .populate('businessId', 'name address contact totalTables type')
      .populate('productId', 'name price')
      .populate('serviceId', 'name price duration');

    res.json({ 
      success: true,
      message: 'Booking cancelled successfully',
      booking: populated 
    });

  } catch (err) {
    console.error('Cancellation error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error cancelling booking' 
    });
  }
};