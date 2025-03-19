const express = require('express');
const evaluateController = require("../app/controllers/evaluateController")
const router = express.Router();

router.post('/', evaluateController.addEvaluate)
router.get('/:evaluatedId', evaluateController.getEvaluatesByEvaluatedId)
router.post('/check-evaluated' , evaluateController.checkIfEvaluated)

module.exports = router;