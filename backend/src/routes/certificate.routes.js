const express = require('express');
const router = express.Router();
const { generateCertificate, getCertificates, downloadCertificate } = require('../controllers/certificate.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getCertificates);
router.post('/', authorize('admin'), generateCertificate);
router.get('/:id/download', downloadCertificate);

module.exports = router;
