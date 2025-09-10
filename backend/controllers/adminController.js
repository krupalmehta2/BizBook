const Admin = require('../models/Admin');
const User = require('../models/User');
const Business = require('../models/Business');
const Product = require('../models/Product');
const Booking = require('../models/Booking');
const bcrypt = require('bcryptjs');

// ------------------- LOGIN PAGE -------------------
exports.getLogin = (req, res) => res.render('admin/login', { error: null });

// ------------------- LOGIN -------------------
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    let valid = false;
    if (admin) {
      if (admin.password && admin.password.startsWith('$2')) {
        valid = await bcrypt.compare(password, admin.password);
      } else {
        valid = admin.password === password;
      }
    }

    if (!admin || !valid) {
      return res.render('admin/login', { error: 'Invalid credentials' });
    }

    req.session.adminId = admin._id;
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).send('Server Error');
  }
};

// ------------------- LOGOUT -------------------
exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
};

// ------------------- DASHBOARD -------------------
exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBusinesses = await Business.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalTableBookings = await Booking.countDocuments({ type: 'table' });

    res.render('admin/dashboard', {
      totalUsers,
      totalBusinesses,
      totalProducts,
      totalBookings,
      totalTableBookings
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).send('Server Error');
  }
};

// ------------------- ALL BOOKINGS -------------------
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('businessId', 'name')
      .populate('userId', 'name email');
    res.render('admin/bookings', { bookings });
  } catch (err) {
    console.error('Get bookings error:', err);
    res.status(500).send('Server Error');
  }
};

// ------------------- ONLY TABLE BOOKINGS -------------------
exports.getTableBookings = async (req, res) => {
  try {
    const tableBookings = await Booking.find({ type: 'table' })
      .populate('businessId', 'name')
      .populate('userId', 'name email');
    res.render('admin/bookings', { bookings: tableBookings });
  } catch (err) {
    console.error('Get table bookings error:', err);
    res.status(500).send('Server Error');
  }
};

// ------------------- NEW TABLE BOOKING FORM -------------------
exports.getNewTableBooking = async (req, res) => {
  try {
    const businesses = await Business.find({ type: 'table' });
    const users = await User.find();
    res.render('admin/table-booking-form', { businesses, users, error: null });
  } catch (err) {
    console.error('Get table booking form error:', err);
    res.status(500).send('Server Error');
  }
};

// ------------------- CREATE NEW TABLE BOOKING -------------------
exports.postNewTableBooking = async (req, res) => {
  try {
    const { businessId, userId, bookingDate, bookingTime, tableCount, guests, note, status } = req.body;

    if (!businessId || !userId || !bookingDate || !bookingTime || !tableCount) {
      const businesses = await Business.find({ type: 'table' });
      const users = await User.find();
      return res.render('admin/table-booking-form', {
        businesses,
        users,
        error: 'Business, user, table count, date and time are required.'
      });
    }

    await Booking.create({
      businessId,
      userId,
      bookingDate: new Date(bookingDate),
      bookingTime,
      tableCount: parseInt(tableCount, 10),
      guests: guests ? parseInt(guests, 10) : undefined,
      note: note || '',
      type: 'table',
      status: status ? status.toLowerCase() : 'pending'
    });

    res.redirect('/admin/bookings/tables');
  } catch (err) {
    console.error('Post new table booking error:', err);
    res.status(500).send('Server Error');
  }
};

// ------------------- DELETE BOOKING -------------------
exports.deleteBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.redirect('/admin/bookings');
  } catch (err) {
    console.error('Delete booking error:', err);
    res.status(500).send('Server Error');
  }
};

// ------------------- UPDATE BOOKING STATUS -------------------
exports.updateBookingStatus = async (req, res) => {
  try {
    const status = (req.body.status || '').toLowerCase();
    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).send('Invalid status');
    }
    await Booking.findByIdAndUpdate(req.params.id, { status });
    res.redirect('/admin/bookings');
  } catch (err) {
    console.error('Update booking status error:', err);
    res.status(500).send('Server Error');
  }
};
