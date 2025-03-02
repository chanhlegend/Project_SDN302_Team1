const express = require('express')
const router = express.Router();
const userController = require('../app/controllers/userController');
const UserProfileController = require('../app/controllers/UserProfileController');
const updateUserProfileController = require('../app/controllers/updateUserProfileController');

router.get('/:id', UserProfileController.getUserProfile);
router.get('/customers', userController.getCustomers);
router.put('/customers/ban/:id', userController.banCustomer);
router.put('/customers/unban/:id', userController.unbanCustomer);
router.post('/update-profile/:id',updateUserProfileController.updateUserProfile)
router.get('/view/:id' , UserProfileController.viewUserProfile)
router.get('/account/menu', userController.menuAccount);
router.get('/account/changePassword', userController.changePassword);
router.post('/account/changePassword', userController.postChangePassword);


module.exports = router;