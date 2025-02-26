const express = require('express')
const router = express.Router();
const productController = require('../app/controllers/productController');

router.get('/products', productController.listProduct);
router.post('/products', productController.createProduct);
router.post('/products/:productId/approve', productController.approveProduct);
router.post('/products/:productId/reject', productController.rejectProduct);
router.post('/products/updateStatus', productController.updateMultipleProducts);
router.get('/products/:productId', productController.getProductDetail);
router.get('/listProduct', productController.listProduct)
router.post('/createProduct', productController.createProduct) 
router.get('/:id', productController.getProduct)

module.exports = router;