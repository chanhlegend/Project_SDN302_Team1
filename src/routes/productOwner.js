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
module.exports = router;
