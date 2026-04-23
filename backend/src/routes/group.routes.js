const express = require('express');
const router = express.Router();
const {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  addStudent,
  removeStudent,
  deleteGroup,
} = require('../controllers/group.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getGroups);
router.get('/:id', getGroupById);
router.post('/', authorize('admin', 'mentor'), createGroup);
router.put('/:id', authorize('admin', 'mentor'), updateGroup);
router.post('/:id/add-student', authorize('admin', 'mentor'), addStudent);
router.delete('/:id/remove-student/:studentId', authorize('admin', 'mentor'), removeStudent);
router.delete('/:id', authorize('admin', 'mentor'), deleteGroup);

module.exports = router;