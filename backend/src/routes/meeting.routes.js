const express = require('express');
const router = express.Router();
const {
  getMeetings, getAllMeetings, createMeeting,
  updateMeeting, deleteMeeting, getUpcoming,
} = require('../controllers/meeting.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getMeetings);
router.get('/upcoming', getUpcoming);
router.get('/all', authorize('admin'), getAllMeetings);
router.post('/', authorize('admin'), createMeeting);
router.put('/:id', authorize('admin'), updateMeeting);
router.delete('/:id', authorize('admin'), deleteMeeting);

module.exports = router;