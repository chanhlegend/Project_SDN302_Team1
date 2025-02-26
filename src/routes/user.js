const express = require('express')
const router = express.Router();
const userController = require('../app/controllers/userController')

router.get('/addUser', userController.addUser)
router.get('/customers', userController.getCustomers);
router.put('/customers/ban/:id', userController.banCustomer);
router.put('/customers/unban/:id', userController.unbanCustomer);

module.exports = router;