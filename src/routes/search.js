const express = require('express');
const router = express.Router();
const searchController = require('../app/controllers/searchController');

router.get('/products', searchController.searchProductByName);

module.exports = router;
