const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/ServiceController');

// Get services by query ?businessId=xxx
router.get('/', serviceController.getServices);

// Get services by param /api/services/:businessId
router.get('/:businessId', serviceController.getServicesByBusinessId);

module.exports = router;
