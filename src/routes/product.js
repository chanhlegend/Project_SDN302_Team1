const express = require('express')
const router = express.Router();
const { productController, sellerProductController } = require('../app/controllers/productController')

router.get('/listProduct', productController.listProduct)
router.get('/myStatics', sellerProductController.getMyProducts)
router.post('/createProduct', productController.createProduct) 

module.exports = router;