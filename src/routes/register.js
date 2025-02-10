const express = require('express')
const router = express.Router();
const registerController = require('../app/controllers/registerController')

router.get('/', registerController.register) // Render register page
router.post('/', registerController.postRegister) // Handle register form
router.post('/verify', registerController.verifyOTP) // Verify OTP

module.exports = router;