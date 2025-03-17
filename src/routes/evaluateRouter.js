const express = require('express');
const evaluateController = require("../app/controllers/evaluateController")
const router = express.Router();

router.post('/', evaluateController.addEvaluate)
router.get('/:evaluatedId', evaluateController.getEvaluatesByEvaluatedId)

module.exports = router;