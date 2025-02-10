const express = require ('express');
const router = express.Router();
const productController = require('../app/controllers/productController');

router.post('/oder/:userId/:productId', productController.createOrder);

module.exports = router;