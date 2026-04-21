const express = require('express');
const router = express.Router();
const {
  getWorkSchedule,
  getAllSchedules,
  upsertWorkSchedule,
  updateWorkSchedule,
  deleteWorkSchedule,
} = require('../controllers/workschedule.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getWorkSchedule);
router.get('/all', authorize('admin', 'mentor'), getAllSchedules);
router.post('/', authorize('admin'), upsertWorkSchedule);
router.put('/:id', authorize('admin'), updateWorkSchedule);
router.delete('/:id', authorize('admin'), deleteWorkSchedule);

module.exports = router;