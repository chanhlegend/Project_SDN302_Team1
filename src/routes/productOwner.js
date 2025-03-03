const express = require('express');
const router = express.Router();
const productOwnerController = require('../app/controllers/productOwnerController');

router.get('/createProduct/:userid', productOwnerController.createProduct);

// Upload nhiều ảnh
router.post('/create/:userid', productOwnerController.create);


router.get('/product/:userid',productOwnerController.listProductowner)
router.get('/edit/:userid',productOwnerController.editProduct)
router.put('/product/:productid',productOwnerController.update)
router.delete('/product/:userid',productOwnerController.delete)

module.exports = router;
