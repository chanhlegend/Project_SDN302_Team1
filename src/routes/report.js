const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const ReportController = require('../app/controllers/reportController');

router.post('/', upload.single('evidence'), ReportController.reportSeller);
router.get('/getAll', ReportController.getReports);
router.put('/status/:reportId', ReportController.updateReportStatus);

module.exports = router;
