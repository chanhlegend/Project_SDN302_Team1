const express = require ('express');
const router = express.Router();
const orderController = require('../app/controllers/orderController')

router.post('/createOrder', orderController.createOrder);
router.get('/detailOrder', orderController.detailOrder,);
router.post('/cancelOrder', orderController.cancelOrder);
module.exports = router;