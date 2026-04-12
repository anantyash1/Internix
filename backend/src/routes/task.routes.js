const express = require('express');
const router = express.Router();
const { getTasks, getTaskById, createTask, updateTask, deleteTask } = require('../controllers/task.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createTaskSchema, updateTaskSchema } = require('../validators/task.validator');

router.use(protect);

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', authorize('mentor', 'admin'), validate(createTaskSchema), createTask);
router.put('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', authorize('mentor', 'admin'), deleteTask);

module.exports = router;
