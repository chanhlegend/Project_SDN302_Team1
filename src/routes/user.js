const express = require('express')
const router = express.Router();
const userController = require('../app/controllers/userController');
const UserProfileController = require('../app/controllers/UserProfileController');
const updateUserProfileController = require('../app/controllers/updateUserProfileController');

router.get('/customers', userController.getCustomers);
router.get('/reports/:sellerId', userController.getUserReports);
router.put('/customers/ban/:id', userController.banCustomer);
router.put('/customers/unban/:id', userController.unbanCustomer);
router.get('/account/menu', userController.menuAccount);
router.get('/account/menuSeller', userController.menuSeller);
router.get('/account/changePassword', userController.changePassword);
router.post('/account/changePassword', userController.postChangePassword);
router.get('/account/salesRegistration', userController.salesRegistation);
router.post('/account/salesRegistration', userController.postSalesRegistation);


router.get('/:id', UserProfileController.getUserProfile);
router.post('/update-profile/:id', updateUserProfileController.updateUserProfile);
router.get('/view/:id', UserProfileController.viewUserProfile);

router.get('/users/userProfile', UserProfileController.getUserInfo);
router.get('/profile/editprofile', UserProfileController.editUserProfile);
router.post('/profile/updateprofile', UserProfileController.updateUserProfile);
module.exports = router;