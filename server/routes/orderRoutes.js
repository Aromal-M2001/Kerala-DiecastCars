const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController'); // Ensure the correct path

// Get all orders
router.get('/', orderController.getOrders);

// Submit a new order
router.post('/submit', orderController.submitOrder);

router.put("/update", orderController.updateOrder);

module.exports = router;