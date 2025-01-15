const express = require('express')
const router = express.Router();
const loginController = require('../app/controllers/loginController')

router.get('/', loginController.login)
router.post('/', loginController.postLogin)

module.exports = router;