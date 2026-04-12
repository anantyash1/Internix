const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, assignMentor, deleteUser } = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', authorize('admin', 'mentor'), getUsers);
router.post('/assign-mentor', authorize('admin'), assignMentor);
router.get('/:id', authorize('admin', 'mentor'), getUserById);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
