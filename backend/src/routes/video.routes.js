const express = require('express');
const router = express.Router();

const {
  getVideos,
  createVideoLink,
  uploadVideoFile,
  deleteVideo,
  markComplete,
  getStudentProgress,
} = require('../controllers/video.controller');

const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware'); // ✅ FIX

router.use(protect);

router.get('/', getVideos);
router.post('/link', authorize('mentor', 'admin'), createVideoLink);

// ✅ FIXED LINE
router.post(
  '/upload',
  authorize('mentor', 'admin'),
  upload.single('video'),   // ✅ correct middleware
  uploadVideoFile
);

router.delete('/:id', authorize('mentor', 'admin'), deleteVideo);
router.post('/:id/complete', authorize('student'), markComplete);
router.get('/progress/:studentId', authorize('mentor', 'admin'), getStudentProgress);

module.exports = router;