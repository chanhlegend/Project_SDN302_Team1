const express = require('express');
const router = express.Router();
const OrderTrackingController = require('../app/controllers/orderTrackingController');

router.get('/', OrderTrackingController.renderOrderTracking);

router.post('/list', OrderTrackingController.listOrder);

module.exports = router;
