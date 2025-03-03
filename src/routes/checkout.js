const express = require("express")
const CheckOutController = require('../app/controllers/CheckOutController');

const router = express.Router();

router.post ('/', CheckOutController.checkout);
module.exports = router;