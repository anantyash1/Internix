const User = require('../models/User');

// GET /api/users — Admin: get all users, Mentor: get assigned students
const getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Mentors can only see their assigned students
    if (req.user.role === 'mentor') {
      filter.mentor = req.user._id;
      filter.role = 'student';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('mentor', 'name email')
        .populate('internship', 'title')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('mentor', 'name email')
      .populate('internship');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id — Admin only
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, phone, isActive, mentor, internship } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;
    if (mentor !== undefined) user.mentor = mentor;
    if (internship !== undefined) user.internship = internship;

    await user.save();
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/assign-mentor — Admin only
const assignMentor = async (req, res, next) => {
  try {
    const { studentId, mentorId } = req.body;

    const [student, mentor] = await Promise.all([
      User.findById(studentId),
      User.findById(mentorId),
    ]);

    if (!student || student.role !== 'student') {
      return res.status(400).json({ message: 'Invalid student' });
    }
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(400).json({ message: 'Invalid mentor' });
    }

    student.mentor = mentorId;
    await student.save();

    res.json({ message: 'Mentor assigned successfully', student });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id — Admin only
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUserById, updateUser, assignMentor, deleteUser };
