const express = require('express');
const router = express.Router();
const ReportController = require('../app/controllers/reportController');

router.post('/', ReportController.reportSeller);
router.get('/getAll', ReportController.getReports);
router.put('/status/:reportId', ReportController.updateReportStatus);

module.exports = router;
