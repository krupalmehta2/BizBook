const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const adminAuth = require('../middleware/adminAuth');
const {
  getLogin,
  postLogin,
  logout,
  getDashboard,
  getBookings,
  getTableBookings,
  postNewTableBooking,
  getNewTableBooking,
  updateBookingStatus
} = require('../controllers/adminController');

const User = require('../models/User');
const Business = require('../models/Business');
const Product = require('../models/Product');
const Booking = require('../models/Booking');


// ─── AUTH ───────────────────────────────────────
router.get('/login', getLogin);
router.post('/login', postLogin);
router.get('/logout', logout);


// ─── DASHBOARD ──────────────────────────────────
router.get('/dashboard', adminAuth, getDashboard);


// ─── USERS ──────────────────────────────────────
router.get('/users', adminAuth, async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.render('admin/users', { users });
});

router.post('/users/:id/delete', adminAuth, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/admin/users');
});


// ─── BUSINESSES ─────────────────────────────────
router.get('/businesses', adminAuth, async (req, res) => {
  const businesses = await Business.find().sort({ createdAt: -1 });
  res.render('admin/businesses', { businesses });
});

router.get('/businesses/new', adminAuth, (req, res) => {
  res.render('admin/business-form', { error: null, old: {} });
});

router.post('/businesses', adminAuth, async (req, res) => {
  const {
    name, description, category, address, city, state, zipCode,
    contact, email, website, openingHours, logoUrl, type,
    'socialLinks[facebook]': facebook,
    'socialLinks[instagram]': instagram,
    'socialLinks[twitter]': twitter,
    'socialLinks[linkedin]': linkedin
  } = req.body;

  try {
    await Business.create({
      name, description, category, address, city, state, zipCode,
      contact, email, website, openingHours, logoUrl, type,
      socialLinks: { facebook, instagram, twitter, linkedin }
    });
    res.redirect('/admin/businesses');
  } catch (err) {
    console.error('❌ Business add error:', err.message);
    res.render('admin/business-form', { error: 'Failed to add business', old: req.body });
  }
});

router.get('/businesses/:id/edit', adminAuth, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.redirect('/admin/businesses');

    res.render('admin/business-form', { error: null, old: business });
  } catch (err) {
    console.error('❌ Business fetch error:', err.message);
    res.redirect('/admin/businesses');
  }
});

router.post('/businesses/:id', adminAuth, async (req, res) => {
  const {
    name, description, category, address, city, state, zipCode,
    contact, email, website, openingHours, logoUrl, type,
    'socialLinks[facebook]': facebook,
    'socialLinks[instagram]': instagram,
    'socialLinks[twitter]': twitter,
    'socialLinks[linkedin]': linkedin
  } = req.body;

  try {
    await Business.findByIdAndUpdate(req.params.id, {
      name, description, category, address, city, state, zipCode,
      contact, email, website, openingHours, logoUrl, type,
      socialLinks: { facebook, instagram, twitter, linkedin }
    });
    res.redirect('/admin/businesses');
  } catch (err) {
    console.error('❌ Business update error:', err.message);
    res.render('admin/business-form', { error: 'Failed to update business', old: req.body });
  }
});

router.post('/businesses/:id/delete', adminAuth, async (req, res) => {
  await Business.findByIdAndDelete(req.params.id);
  res.redirect('/admin/businesses');
});


// ─── PRODUCTS ───────────────────────────────────
router.get('/products', adminAuth, async (req, res) => {
  const products = await Product.find().populate('businessId');
  res.render('admin/products', { products });
});

router.get('/products/new', adminAuth, async (req, res) => {
  const businesses = await Business.find();
  res.render('admin/product-form', { businesses, error: null, old: {} });
});

router.post('/products', adminAuth, async (req, res) => {
  const { name, description, price, businessId, type } = req.body;
  const businesses = await Business.find();

  if (!name || !price || !businessId || !type) {
    return res.render('admin/product-form', { businesses, error: 'All fields are required.', old: req.body });
  }

  if (!mongoose.Types.ObjectId.isValid(businessId)) {
    return res.render('admin/product-form', { businesses, error: 'Invalid business selected.', old: req.body });
  }

  try {
    const business = await Business.findById(businessId);
    if (!business) {
      return res.render('admin/product-form', { businesses, error: 'Business not found.', old: req.body });
    }

    await Product.create({ name, description, price, type, businessId });
    res.redirect('/admin/products');
  } catch (err) {
    console.error('❌ Product add error:', err.message);
    res.render('admin/product-form', { businesses, error: 'Failed to add product.', old: req.body });
  }
});

router.get('/products/:id/edit', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('businessId');
    const businesses = await Business.find();
    if (!product) return res.redirect('/admin/products');

    res.render('admin/product-form', { businesses, error: null, old: product });
  } catch (err) {
    console.error('❌ Product fetch error:', err.message);
    res.redirect('/admin/products');
  }
});

router.post('/products/:id', adminAuth, async (req, res) => {
  const { name, description, price, businessId, type } = req.body;
  try {
    await Product.findByIdAndUpdate(req.params.id, { name, description, price, type, businessId });
    res.redirect('/admin/products');
  } catch (err) {
    console.error('❌ Product update error:', err.message);
    const businesses = await Business.find();
    res.render('admin/product-form', { businesses, error: 'Failed to update product.', old: req.body });
  }
});

router.post('/products/:id/delete', adminAuth, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.redirect('/admin/products');
});


// ─── BOOKINGS ───────────────────────────────────
router.get('/bookings', adminAuth, async (req, res) => {
  const bookings = await Booking.find()
    .populate('userId')
    .populate('businessId')
    .populate('productId')
    .sort({ bookingDate: -1 });
  res.render('admin/bookings', { bookings });
});

router.get('/bookings/tables', adminAuth, getTableBookings);
router.get('/bookings/tables/add', adminAuth, getNewTableBooking);

router.post('/bookings/tables/add', adminAuth, async (req, res) => {
  req.body.status = 'Pending';
  if (req.body.tableNumber && !req.body.tableCount) req.body.tableCount = req.body.tableNumber;
  return postNewTableBooking(req, res);
});

router.post('/bookings/:id/delete', adminAuth, async (req, res) => {
  await Booking.findByIdAndDelete(req.params.id);
  res.redirect('/admin/bookings');
});

router.post('/bookings/:id/status', adminAuth, async (req, res) => {
  const { status } = req.body;
  if (!['Pending', 'Done', 'Cancelled'].includes(status)) return res.redirect('/admin/bookings');

  await Booking.findByIdAndUpdate(req.params.id, { status });
  res.redirect('/admin/bookings');
});


module.exports = router;
