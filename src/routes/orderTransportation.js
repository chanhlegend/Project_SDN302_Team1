const express = require('express');
const router = express.Router();
const orderController = require('../app/controllers/orderTransportationController');

router.get('/orders', orderController.getOrderList);
router.post('/order/:id/status', orderController.updateOrderStatus);

module.exports = router;