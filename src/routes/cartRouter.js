const express = require('express');
const router = express.Router();
const cartController = require('../app/controllers/cartController');

router.post('/addToCart', cartController.addToCart); 
router.get('', cartController.listCartByUser);
router.post('/remove', cartController.removeFromCart);
module.exports = router;