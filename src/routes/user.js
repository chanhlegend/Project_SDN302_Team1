const express = require('express')
const router = express.Router();
const userController = require('../app/controllers/userController')

router.get('/addUser', userController.addUser)

module.exports = router;