const express = require('express')
const router = express.Router();
const testController = require('../app/controllers/testController');

router.post('/addImage', testController.addImage)
router.post('/addImageToProduct', testController.addImageToProduct)
router.get('/productDetail', testController.productDetail)
router.post('/addEvaluate', testController.addEvaluate)

module.exports = router;