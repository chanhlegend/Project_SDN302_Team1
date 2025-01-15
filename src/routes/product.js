const express = require('express')
const router = express.Router();
const productController = require('../app/controllers/productController')

router.get('/listProduct', productController.listProduct)

module.exports = router;