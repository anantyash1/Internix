const express = require('express');

const {
  getUsers,
  getUserById,
  updateUser,
  assignMentor,
  resetStudentPassword,
  deleteUser,
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin', 'mentor'), getUsers);
router.post('/assign-mentor', authorize('admin'), assignMentor);
router.put('/:id/reset-password', authorize('admin'), resetStudentPassword);
router.get('/:id', authorize('admin', 'mentor'), getUserById);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
