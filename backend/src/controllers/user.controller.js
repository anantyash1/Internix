const User = require('../models/User');

async function getUsers(req, res, next) {
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

    if (req.user.role === 'mentor') {
      filter.mentor = req.user._id;
      filter.role = 'student';
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('mentor', 'name email')
        .populate('internship', 'title')
        .skip(skip)
        .limit(parseInt(limit, 10))
        .sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
    });
  } catch (error) {
    next(error);
  }
}

async function getUserById(req, res, next) {
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
}

async function updateUser(req, res, next) {
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
}

async function assignMentor(req, res, next) {
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
}

async function resetStudentPassword(req, res, next) {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'student') {
      return res.status(400).json({ message: 'Only student passwords can be reset here' });
    }

    user.password = newPassword.trim();
    await user.save();

    res.json({ message: 'Student password updated successfully' });
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
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
}

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  assignMentor,
  resetStudentPassword,
  deleteUser,
};
