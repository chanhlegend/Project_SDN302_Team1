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

router.get('/:id', UserProfileController.getUserProfile);
router.post('/update-profile/:id', updateUserProfileController.updateUserProfile);
router.get('/view/:id', UserProfileController.viewUserProfile);

module.exports = router;