const express = require('express');
const router = express.Router();
const { registerOwner, loginOwner } = require('../controllers/ownerController');
const ownerAuth = require('../middleware/ownerAuth');

const Business = require('../models/Business');
const Product = require('../models/Product');

// Auth
router.post('/register', registerOwner);
router.post('/login', loginOwner);

// Get owner profile
router.get('/me', ownerAuth, (req, res) => {
  res.json({ owner: req.owner });
});

// CRUD for Businesses by owner
router.get('/businesses', ownerAuth, async (req, res) => {
  const businesses = await Business.find({ ownerId: req.owner._id });
  res.json(businesses);
});

router.post('/businesses', ownerAuth, async (req, res) => {
  const business = await Business.create({ ...req.body, ownerId: req.owner._id });
  res.status(201).json(business);
});

router.delete('/businesses/:id', ownerAuth, async (req, res) => {
  const biz = await Business.findOneAndDelete({ _id: req.params.id, ownerId: req.owner._id });
  if (!biz) return res.status(404).json({ message: 'Business not found or unauthorized' });
  res.json({ message: 'Deleted' });
});

// CRUD for Products by owner
router.get('/products', ownerAuth, async (req, res) => {
  const businesses = await Business.find({ ownerId: req.owner._id });
  const businessIds = businesses.map(b => b._id);
  const products = await Product.find({ businessId: { $in: businessIds } });
  res.json(products);
});

router.post('/products', ownerAuth, async (req, res) => {
  const { businessId, name, description, price } = req.body;

  const business = await Business.findOne({ _id: businessId, ownerId: req.owner._id });
  if (!business) return res.status(403).json({ message: 'Unauthorized business' });

  const product = await Product.create({ businessId, name, description, price });
  res.status(201).json(product);
});

router.delete('/products/:id', ownerAuth, async (req, res) => {
  const product = await Product.findById(req.params.id).populate('businessId');
  if (!product || product.businessId.ownerId.toString() !== req.owner._id.toString()) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  await product.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = router;
