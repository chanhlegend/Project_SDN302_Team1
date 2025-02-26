const express = require('express');
const FollowController = require('../app/controllers/followController');

const router = express.Router();

router.post('/', FollowController.followUser);
router.post('/unfollower', FollowController.unfollowUser);
router.get('/following', FollowController.getFollowing);
router.get('/followers', FollowController.getFollowers);
router.get("/check-follow/:followingId", FollowController.checkFollowStatus);

module.exports = router;
