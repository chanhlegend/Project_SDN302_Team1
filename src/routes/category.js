const express = require('express');
const router = express.Router();
const categoryController = require('../app/controllers/categoryController');


router.post('/createCategory', categoryController.postCategory);
router.post('/createCategories', categoryController.postCategories);
module.exports = router;