const express = require('express')
const router = express.Router();
const userController = require('../app/controllers/userController');
const UserProfileController = require('../app/controllers/UserProfileController');
const updateUserProfileController = require('../app/controllers/updateUserProfileController');

router.get('/addUser', userController.addUser)
router.get('/:id', UserProfileController.getUserProfile);
router.post('/update-profile/:id',updateUserProfileController.updateUserProfile)
router.get('/view/:id' , UserProfileController.viewUserProfile)

module.exports = router;