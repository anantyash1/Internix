const Internship = require('../models/Internship');
const User = require('../models/User');

// GET /api/internships
const getInternships = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    if (req.user.role === 'mentor') {
      filter.mentor = req.user._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [internships, total] = await Promise.all([
      Internship.find(filter)
        .populate('mentor', 'name email')
        .populate('students', 'name email')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Internship.countDocuments(filter),
    ]);

    res.json({ internships, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

// POST /api/internships — Admin creates internship
const createInternship = async (req, res, next) => {
  try {
    const { title, description, department, startDate, endDate, mentor, maxStudents } = req.body;

    const mentorUser = await User.findById(mentor);
    if (!mentorUser || mentorUser.role !== 'mentor') {
      return res.status(400).json({ message: 'Invalid mentor' });
    }

    const internship = await Internship.create({
      title,
      description,
      department,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      mentor,
      maxStudents,
    });

    const populated = await internship.populate('mentor', 'name email');
    res.status(201).json({ internship: populated });
  } catch (error) {
    next(error);
  }
};

// PUT /api/internships/:id
const updateInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('mentor', 'name email')
      .populate('students', 'name email');

    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    res.json({ internship });
  } catch (error) {
    next(error);
  }
};

// POST /api/internships/:id/enroll — Add student to internship
const enrollStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    if (internship.students.length >= internship.maxStudents) {
      return res.status(400).json({ message: 'Internship is full' });
    }

    if (internship.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student already enrolled' });
    }

    internship.students.push(studentId);
    await internship.save();

    // Update student record
    await User.findByIdAndUpdate(studentId, {
      internship: internship._id,
      mentor: internship.mentor,
    });

    const populated = await internship.populate([
      { path: 'mentor', select: 'name email' },
      { path: 'students', select: 'name email' },
    ]);

    res.json({ internship: populated, message: 'Student enrolled successfully' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/internships/:id
const deleteInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    await Internship.findByIdAndDelete(req.params.id);
    res.json({ message: 'Internship deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getInternships, createInternship, updateInternship, enrollStudent, deleteInternship };
