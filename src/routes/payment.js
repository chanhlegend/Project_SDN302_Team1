const paymentController = require ('../app/controllers/paymentController');
const express = require('express');

const router = express.Router();

router.post('/', paymentController.payment);


module.exports = router;