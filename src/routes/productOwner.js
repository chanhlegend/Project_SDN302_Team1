const express = require('express');
const router = express.Router();
const productOwnerController = require('../app/controllers/productOwnerController');

router.get('/createProduct/:userid', productOwnerController.createProduct);

// Upload nhiều ảnh
router.post('/create/:userid', productOwnerController.create);


router.get('/product/:userid',productOwnerController.listProductOwner)
router.get('/edit/:userid/:productid', productOwnerController.editProduct) // Thêm :productid
router.put('/update/:productid', productOwnerController.update) // Thay /product/:productid thành /update/:productid
router.delete('/product/:userid/:productid', productOwnerController.delete);

module.exports = router;
