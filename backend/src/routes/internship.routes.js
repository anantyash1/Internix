const express = require('express');
const router = express.Router();
const { getInternships, createInternship, updateInternship, enrollStudent, deleteInternship } = require('../controllers/internship.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getInternships);
router.post('/', authorize('admin'), createInternship);
router.put('/:id', authorize('admin'), updateInternship);
router.post('/:id/enroll', authorize('admin'), enrollStudent);
router.delete('/:id', authorize('admin'), deleteInternship);

module.exports = router;
