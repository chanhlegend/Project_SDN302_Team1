const express = require('express');
const router = express.Router();
const sellerProductController = require('../app/controllers/sellerProductController');

router.get('/myStatics', sellerProductController.getMyProducts);

module.exports = router;
