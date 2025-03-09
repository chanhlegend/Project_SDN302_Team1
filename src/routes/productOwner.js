const express = require('express');
const router = express.Router();
const productOwnerController = require('../app/controllers/productOwnerController');

router.post('/createProduct/:userid',productOwnerController.createProduct)
router.post('/create/:userid',productOwnerController.create)
router.get('/product/:userid',productOwnerController.listProductowner)
router.get('/:userid/edit',productOwnerController.editProduct)
router.put('/product/:productid',productOwnerController.update)
router.delete('/product/:userid',productOwnerController.delete)
router.get('/:userid' , productOwnerController.listProduct)
router.get('/:userid/status', productOwnerController.listProductByStatus)
router.get('/createProduct', productOwnerController.createProduct);
router.post('/create', productOwnerController.create);
router.get('/product',productOwnerController.listProductOwner)
router.get('/productSelled', productOwnerController.listSelledProducts)
router.get('/edit/:productid', productOwnerController.editProduct) // Thêm :productid
router.put('/update/:productid', productOwnerController.update) // Thay /product/:productid thành /update/:productid
router.delete('/product/:productid', productOwnerController.delete);

module.exports = router;
