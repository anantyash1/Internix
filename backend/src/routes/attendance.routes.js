// const express = require('express');
// const router = express.Router();
// const { getAttendance, markAttendance, markAttendanceByMentor } = require('../controllers/attendance.controller');
// const { protect, authorize } = require('../middleware/auth.middleware');

// router.use(protect);

// router.get('/', getAttendance);
// router.post('/', authorize('student'), markAttendance);
// router.post('/mark', authorize('mentor', 'admin'), markAttendanceByMentor);

// module.exports = router;



const express = require('express');
const router = express.Router();
const {
  getAttendance,
  markAttendance,
  markAttendanceByMentor,
  verifyAttendancePhoto,
  getTodaySchedule,
} = require('../controllers/attendance.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadAttendancePhoto } = require('../config/cloudinary');

router.use(protect);

// Student routes
router.get('/', getAttendance);
router.get('/today-schedule', getTodaySchedule);

// Check-in / check-out with optional photo upload
router.post(
  '/',
  authorize('student'),
  uploadAttendancePhoto.single('photo'),
  markAttendance
);

// Mentor/Admin routes
router.post('/mark', authorize('mentor', 'admin'), markAttendanceByMentor);
router.put('/:id/verify-photo', authorize('mentor', 'admin'), verifyAttendancePhoto);

module.exports = router;