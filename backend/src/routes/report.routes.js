const express = require('express');
const router = express.Router();
const { getReports, uploadReport, reviewReport, deleteReport } = require('../controllers/report.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadReport: upload } = require('../config/cloudinary');

router.use(protect);

router.get('/', getReports);
router.post('/', authorize('student'), upload.single('file'), uploadReport);
router.put('/:id/review', authorize('mentor', 'admin'), reviewReport);
router.delete('/:id', authorize('student', 'admin'), deleteReport);

module.exports = router;
