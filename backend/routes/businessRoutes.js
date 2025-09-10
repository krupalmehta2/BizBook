// routes/businessRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Business = require('../models/Business');

// ─────────────────────────────────────────────
// ✅ GET all businesses
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const businesses = await Business.find();
    res.json(businesses);
  } catch (err) {
    console.error('Error fetching businesses:', err.message);
    res.status(500).json({ message: 'Server error while fetching businesses' });
  }
});

// ─────────────────────────────────────────────
// ✅ GET one business by ID
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid business ID' });
    }

    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json(business);
  } catch (err) {
    console.error('Error fetching business:', err.message);
    res.status(500).json({ message: 'Server error while fetching business' });
  }
});

// ─────────────────────────────────────────────
// ✅ POST - Add new business
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const newBiz = await Business.create(req.body);
    res.status(201).json(newBiz);
  } catch (err) {
    console.error('Error creating business:', err.message);
    res.status(400).json({ message: 'Invalid business data' });
  }
});

// ─────────────────────────────────────────────
// ✅ PUT - Update a business
// ─────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid business ID' });
    }

    const updatedBiz = await Business.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedBiz) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json(updatedBiz);
  } catch (err) {
    console.error('Error updating business:', err.message);
    res.status(400).json({ message: 'Invalid update data' });
  }
});

// ─────────────────────────────────────────────
// ✅ DELETE - Remove a business
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid business ID' });
    }

    const deletedBiz = await Business.findByIdAndDelete(id);
    if (!deletedBiz) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json({ message: 'Business deleted successfully' });
  } catch (err) {
    console.error('Error deleting business:', err.message);
    res.status(500).json({ message: 'Server error while deleting business' });
  }
});

module.exports = router;
