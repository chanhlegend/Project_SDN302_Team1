const express = require('express')
const router = express.Router();
const testController = require('../app/controllers/testController');

router.post('/addImage', testController.addImage)
router.post('/addImageToProduct', testController.addImageToProduct)
router.get('/productDetail', testController.productDetail)
router.post('/addEvaluate', testController.addEvaluate)
router.get('/productsByCategory/:categoryId', testController.productByCategory)
router.get('/menuAccount', testController.menuAccount)
router.get('/changePassword', testController.changePassword)
router.post('/changePassword', testController.postChangePassword)
router.get('/salesRegistation', testController.salesRegistation)
router.post('/salesRegistation', testController.postSalesRegistation)

module.exports = router;