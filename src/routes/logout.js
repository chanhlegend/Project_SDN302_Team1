const express = require('express')
const router = express.Router();
const logoutController = require('../app/controllers/logoutController')

router.get('/', logoutController.logout)


module.exports = router;