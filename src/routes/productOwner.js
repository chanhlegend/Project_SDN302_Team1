const express = require('express');
const router = express.Router();
const productOwnerController = require('../app/controllers/productOwnerController');

router.get('/createProduct', productOwnerController.createProduct);
router.post('/create', productOwnerController.create);
router.get('/product',productOwnerController.listProductOwner)
router.get('/productSold', productOwnerController.listsoldProducts)
router.get('/productNonActive', productOwnerController.listNonActiveProducts)
router.get('/edit/:productid', productOwnerController.editProduct) // Thêm :productid
router.put('/update/:productid', productOwnerController.update) // Thay /product/:productid thành /update/:productid
router.delete('/product/:productid', productOwnerController.delete);
////

router.get('/:userid' , productOwnerController.listProduct)
router.get('/:userid/status', productOwnerController.listProductByStatus)
module.exports = router;
