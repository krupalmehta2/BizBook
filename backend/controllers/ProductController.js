const Product = require('../models/Product');
const Business = require('../models/Business');
const mongoose = require('mongoose');

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, businessId, type } = req.body;

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ message: 'Invalid business ID' });
    }

    if (!['product', 'service'].includes(type)) {
      return res.status(400).json({ message: 'Type must be "product" or "service"' });
    }

    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const product = await Product.create({ name, description, price, businessId, type });
    res.status(201).json(product);
  } catch (err) {
    console.error('❌ Product create error:', err.message);
    res.status(500).json({ message: 'Failed to create product/service' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { businessId, type } = req.query;

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ message: 'Valid businessId required' });
    }

    const filter = { businessId };
    if (type && ['product', 'service'].includes(type)) filter.type = type;

    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    console.error('❌ Fetch error:', err.message);
    res.status(500).json({ message: 'Failed to fetch products/services' });
  }
};

exports.getProductsByBusinessId = async (req, res) => {
  try {
    const { businessId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ message: 'Invalid businessId' });
    }

    const products = await Product.find({ businessId });
    res.json(products);
  } catch (err) {
    console.error('❌ Param fetch error:', err.message);
    res.status(500).json({ message: 'Failed to fetch by businessId' });
  }
};
