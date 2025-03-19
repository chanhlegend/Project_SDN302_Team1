const express = require('express');
const router = express.Router();
const vnpayController = require('../app/controllers/paymentController');


router.get('/vnpay_return', vnpayController.vnpayReturn);

module.exports = router;