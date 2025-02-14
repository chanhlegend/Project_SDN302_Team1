const express = require('express');
const FollowController = require('../app/controllers/followController');

const router = express.Router();

router.post('/', FollowController.followUser);
router.post('/unfollower', FollowController.unfollowUser);
router.get('/following/:userId', FollowController.getFollowing);
router.get('/followers/:userId', FollowController.getFollowers);

module.exports = router;
