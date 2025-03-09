const express = require('express');
const router = express.Router();
const chatController = require('../app/controllers/ChatController');

router.get('/', chatController.index);
router.get('/:conversationId', chatController.showChat);
router.get('/start/:sellerId', chatController.startChat);
module.exports = router;