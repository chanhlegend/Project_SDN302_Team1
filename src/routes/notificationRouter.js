const express = require('express');
const router = express.Router();
const notificationController = require('../app/controllers/notificationController'); // Import controller

// Định nghĩa route để lấy thông báo
router.get('/notifications', notificationController.getNotifications);

module.exports = router;