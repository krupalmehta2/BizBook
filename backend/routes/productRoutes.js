const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');

// Create product/service
router.post('/', productController.createProduct);

// Get products by query ?businessId=xxx&type=product/service
router.get('/', productController.getProducts);

// Get products by param /api/products/:businessId
router.get('/:businessId', productController.getProductsByBusinessId);

module.exports = router;
