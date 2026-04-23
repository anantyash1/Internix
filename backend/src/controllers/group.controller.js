const Group = require('../models/Group');
const User = require('../models/User');
const Internship = require('../models/Internship');

// GET /api/groups
const getGroups = async (req, res, next) => {
  try {
    const { internshipId } = req.query;
    const filter = {};

    if (req.user.role === 'mentor') {
      filter.mentor = req.user._id;
    } else if (req.user.role === 'student') {
      filter.students = req.user._id;
    }

    if (internshipId) filter.internship = internshipId;

    const groups = await Group.find(filter)
      .populate('internship', 'title department')
      .populate('mentor', 'name email')
      .populate('students', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ groups });
  } catch (error) {
    next(error);
  }
};

// GET /api/groups/:id
const getGroupById = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('internship', 'title department')
      .populate('mentor', 'name email')
      .populate('students', 'name email avatar phone');

    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json({ group });
  } catch (error) {
    next(error);
  }
};

// POST /api/groups — Mentor or Admin creates group
const createGroup = async (req, res, next) => {
  try {
    const { name, description, domain, internshipId, studentIds, color } = req.body;

    const internship = await Internship.findById(internshipId);
    if (!internship) return res.status(400).json({ message: 'Invalid internship' });

    if (req.user.role === 'mentor' && internship.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only create groups for your own internships' });
    }

    const mentorId = req.user.role === 'admin'
      ? (req.body.mentorId || internship.mentor)
      : req.user._id;

    const group = await Group.create({
      name,
      description: description || '',
      domain: domain || '',
      internship: internshipId,
      mentor: mentorId,
      students: studentIds || [],
      color: color || '#2563eb',
    });

    const populated = await group.populate([
      { path: 'internship', select: 'title department' },
      { path: 'mentor', select: 'name email' },
      { path: 'students', select: 'name email' },
    ]);

    res.status(201).json({ group: populated, message: 'Group created successfully' });
  } catch (error) {
    next(error);
  }
};

// PUT /api/groups/:id
const updateGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (req.user.role === 'mentor' && group.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this group' });
    }

    const allowed = ['name', 'description', 'domain', 'color', 'isActive'];
    allowed.forEach(key => {
      if (req.body[key] !== undefined) group[key] = req.body[key];
    });

    await group.save();
    const populated = await group.populate([
      { path: 'internship', select: 'title department' },
      { path: 'mentor', select: 'name email' },
      { path: 'students', select: 'name email' },
    ]);
    res.json({ group: populated });
  } catch (error) {
    next(error);
  }
};

// POST /api/groups/:id/add-student
const addStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (req.user.role === 'mentor' && group.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (group.students.some(s => s.toString() === studentId)) {
      return res.status(400).json({ message: 'Student already in this group' });
    }

    group.students.push(studentId);
    await group.save();

    const populated = await group.populate([
      { path: 'internship', select: 'title department' },
      { path: 'mentor', select: 'name email' },
      { path: 'students', select: 'name email' },
    ]);

    res.json({ group: populated, message: 'Student added to group' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/groups/:id/remove-student/:studentId
const removeStudent = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (req.user.role === 'mentor' && group.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    group.students = group.students.filter(s => s.toString() !== req.params.studentId);
    await group.save();

    res.json({ message: 'Student removed from group' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/groups/:id
const deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (req.user.role === 'mentor' && group.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getGroups, getGroupById, createGroup, updateGroup, addStudent, removeStudent, deleteGroup };