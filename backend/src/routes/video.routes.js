const express = require('express');

const {
  getVideos,
  createVideoLink,
  uploadVideoFile,
  deleteVideo,
  syncVideoProgress,
  getStudentProgress,
} = require('../controllers/video.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.use(protect);

router.get('/', getVideos);
router.post('/link', authorize('mentor', 'admin'), createVideoLink);
router.post('/upload', authorize('mentor', 'admin'), upload.single('video'), uploadVideoFile);
router.delete('/:id', authorize('mentor', 'admin'), deleteVideo);
router.post('/:id/progress', syncVideoProgress);
router.get('/progress/:studentId', authorize('mentor', 'admin'), getStudentProgress);

module.exports = router;
