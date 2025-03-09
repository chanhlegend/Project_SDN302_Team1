const express = require('express');
const router = express.Router();
const passport = require('../config/passport/passport-config');
const authController = require('../app/controllers/authController');

router.get('/',passport.authenticate('google', { scope: ['profile', 'email'] }) ,authController.login); 
router.get('/callback',passport.authenticate('google', { failureRedirect: '/login' }),authController.callback);

module.exports = router;