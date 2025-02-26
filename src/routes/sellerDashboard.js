const express = require('express');
const router = express.Router();
const sellerDashboardController = require('../app/controllers/sellerDashboardController');

router.get('/myStatics', sellerDashboardController.getMyProducts);

module.exports = router;
