const express = require('express');
const router = express.Router();
const {
  getNotices,
  createNotice,
  updateNotice,
  markAsRead,
  deleteNotice,
  getAllNotices,
} = require('../controllers/notice.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getNotices);
router.get('/all', authorize('admin'), getAllNotices);
router.post('/', authorize('admin'), createNotice);
router.put('/:id', authorize('admin'), updateNotice);
router.put('/:id/read', markAsRead);
router.delete('/:id', authorize('admin'), deleteNotice);

module.exports = router;