const express = require('express')
const router = express.Router();
const loginController = require('../app/controllers/loginController')

router.get('/', loginController.login)
router.post('/', loginController.postLogin)
router.get('/forgotPassword', loginController.forgotPassword)
router.post('/forgotPassword', loginController.postForgotPassword)
router.post('/submitOTP', loginController.submitOTP)
router.post('/resetPassword', loginController.resetPassword)
router.get('/banned', loginController.bannedUser)

module.exports = router;