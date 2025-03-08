const express = require("express")
const CheckOutController = require('../app/controllers/CheckOutController');

const router = express.Router();

router.post ('/', CheckOutController.listCheckout);
module.exports = router;