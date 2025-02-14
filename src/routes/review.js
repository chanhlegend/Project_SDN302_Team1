const express = require('express');
const router = express.Router();
const ReviewController = require('../app/controllers/reviewController');

router.post('/', ReviewController.reviewSeller);
router.get('/reviews/:sellerId', ReviewController.getSellerReviews);

module.exports = router;
