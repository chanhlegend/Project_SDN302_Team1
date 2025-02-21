const express = require('express')
const router = express.Router();
const { userController, userProfileController , updateUserProfileController } = require('../app/controllers/userController')

router.get('/addUser', userController.addUser)
router.get('/:id', userProfileController.getUserProfile);
router.post('/update-profile/:id',updateUserProfileController.updateUserProfile)
router.get('/view/:id' , userProfileController.viewUserProfile)

module.exports = router;