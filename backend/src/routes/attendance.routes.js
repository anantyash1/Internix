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

// Optional photo upload middleware wrapper
const optionalPhotoUpload = (req, res, next) => {
  uploadAttendancePhoto.single('photo')(req, res, (err) => {
    // Ignore multer errors for optional field - just continue
    if (err && err.message && err.message.includes('Only image files')) {
      return res.status(400).json({ message: err.message });
    }
    // Ignore "LIMIT_FILE_SIZE" and other non-critical errors
    if (err && err.code !== 'LIMIT_FILE_SIZE') {
      console.warn('Photo upload warning:', err.message);
    }
    next();
  });
};

router.use(protect);

// Student routes
router.get('/', getAttendance);
router.get('/today-schedule', getTodaySchedule);

// Check-in / check-out with optional photo upload
router.post(
  '/',
  authorize('student'),
  optionalPhotoUpload,
  markAttendance
);

// Mentor/Admin routes
router.post('/mark', authorize('mentor', 'admin'), markAttendanceByMentor);
router.put('/:id/verify-photo', authorize('mentor', 'admin'), verifyAttendancePhoto);

module.exports = router;