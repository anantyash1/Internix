const Internship = require('../models/Internship');
const User = require('../models/User');

// Helper function to calculate internship status based on dates
const calculateStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'active';
  return 'completed';
};

// GET /api/internships
const getInternships = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (req.user.role === 'mentor') {
      filter.mentor = req.user._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const internships = await Internship.find(filter)
      .populate('mentor', 'name email')
      .populate('students', 'name email')
      .sort({ createdAt: -1 });

    // Calculate status for each internship based on current date
    const internshipsWithCalculatedStatus = internships.map(i => ({
      ...i.toObject(),
      status: calculateStatus(i.startDate, i.endDate),
    }));

    // Filter by status if provided
    let filtered = internshipsWithCalculatedStatus;
    if (status) {
      filtered = internshipsWithCalculatedStatus.filter(i => i.status === status);
    }

    // Apply pagination
    const paginatedInternships = filtered.slice(skip, skip + parseInt(limit));
    const total = filtered.length;

    res.json({ 
      internships: paginatedInternships, 
      total, 
      page: parseInt(page), 
      pages: Math.ceil(total / parseInt(limit)) 
    });
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

    // Calculate status based on dates
    const calculatedStatus = calculateStatus(startDate, endDate);

    const internship = await Internship.create({
      title,
      description,
      department,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      mentor,
      maxStudents,
      status: calculatedStatus,
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
    let updateData = { ...req.body };
    
    // If dates are being updated, recalculate status
    if (req.body.startDate || req.body.endDate) {
      const internship = await Internship.findById(req.params.id);
      const startDate = req.body.startDate ? new Date(req.body.startDate) : internship.startDate;
      const endDate = req.body.endDate ? new Date(req.body.endDate) : internship.endDate;
      updateData.status = calculateStatus(startDate, endDate);
    }

    const internship = await Internship.findByIdAndUpdate(req.params.id, updateData, {
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
