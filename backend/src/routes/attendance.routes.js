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
    if (err) {
      console.error('Photo upload error:', err.message);
      // Return clear error message for invalid file types
      if (err.message && err.message.includes('Only image')) {
        return res.status(400).json({ 
          message: err.message,
          hint: 'Please upload a JPEG, PNG, or WebP image file'
        });
      }
      // Allow check-in without photo even if upload fails for non-type reasons
      if (err.code === 'LIMIT_FILE_SIZE') {
        console.warn('Photo file too large, allowing check-in without photo');
      }
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