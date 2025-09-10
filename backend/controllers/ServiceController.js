const Service = require('../models/Service');
const mongoose = require('mongoose');

exports.getServices = async (req, res) => {
  try {
    const { businessId } = req.query;
    const filter = {};

    if (businessId) {
      if (!mongoose.Types.ObjectId.isValid(businessId)) {
        return res.status(400).json({ message: 'Invalid businessId' });
      }
      filter.businessId = businessId;
    }

    const services = await Service.find(filter).populate('businessId', 'name type');
    res.json(services); // return array directly
  } catch (err) {
    console.error('❌ Error fetching services:', err.message);
    res.status(500).json({ message: 'Failed to fetch services' });
  }
};

exports.getServicesByBusinessId = async (req, res) => {
  try {
    const { businessId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ message: 'Invalid businessId' });
    }

    const services = await Service.find({ businessId }).populate('businessId', 'name type');
    res.json(services); // return array directly
  } catch (err) {
    console.error('❌ Error fetching services by param:', err.message);
    res.status(500).json({ message: 'Failed to fetch services by businessId' });
  }
};
