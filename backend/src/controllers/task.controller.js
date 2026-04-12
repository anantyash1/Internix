const Task = require('../models/Task');

// GET /api/tasks
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (req.user.role === 'student') {
      filter.assignedTo = req.user._id;
    } else if (req.user.role === 'mentor') {
      filter.assignedBy = req.user._id;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('assignedTo', 'name email')
        .populate('assignedBy', 'name email')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Task.countDocuments(filter),
    ]);

    res.json({ tasks, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/:id
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ task });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks — Mentor creates task
const createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, priority, dueDate, internship } = req.body;

    const task = await Task.create({
      title,
      description,
      assignedTo,
      assignedBy: req.user._id,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      internship,
    });

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'assignedBy', select: 'name email' },
    ]);

    res.status(201).json({ task: populated });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Students can only update status to in_progress or completed
    if (req.user.role === 'student') {
      if (req.body.status) {
        task.status = req.body.status;
        if (req.body.status === 'completed') {
          task.completedAt = new Date();
        }
      }
    } else {
      // Mentor/Admin can update anything
      Object.assign(task, req.body);
      if (req.body.dueDate) task.dueDate = new Date(req.body.dueDate);
    }

    await task.save();
    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'assignedBy', select: 'name email' },
    ]);

    res.json({ task: populated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id — Mentor/Admin only
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
