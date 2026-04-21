const User = require('../models/User');
const Internship = require('../models/Internship');
const generateToken = require('../utils/generateToken');

/**
 * POST /api/onboarding/student
 * Admin or Mentor creates a new student account and optionally assigns:
 *  - mentor
 *  - internship
 */
const onboardStudent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      mentorId,
      internshipId,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Validate mentor if provided
    let assignedMentorId = null;
    if (mentorId) {
      const mentor = await User.findById(mentorId);
      if (!mentor || mentor.role !== 'mentor') {
        return res.status(400).json({ message: 'Invalid mentor ID' });
      }
      assignedMentorId = mentorId;
    }

    // If the requesting user is a mentor, auto-assign themselves
    if (req.user.role === 'mentor' && !assignedMentorId) {
      assignedMentorId = req.user._id;
    }

    // Validate internship if provided
    let assignedInternshipId = null;
    if (internshipId) {
      const internship = await Internship.findById(internshipId);
      if (!internship) {
        return res.status(400).json({ message: 'Invalid internship ID' });
      }
      assignedInternshipId = internshipId;
    }

    // Create student account
    const student = await User.create({
      name,
      email,
      password,
      role: 'student',
      phone: phone || '',
      mentor: assignedMentorId,
      internship: assignedInternshipId,
    });

    // Enroll in internship if provided
    if (assignedInternshipId) {
      await Internship.findByIdAndUpdate(assignedInternshipId, {
        $addToSet: { students: student._id },
      });
    }

    const populated = await User.findById(student._id)
      .populate('mentor', 'name email')
      .populate('internship', 'title');

    res.status(201).json({
      student: populated,
      message: `Student "${name}" onboarded successfully`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/onboarding/mentors — list mentors for dropdown
 */
const getMentors = async (req, res, next) => {
  try {
    const mentors = await User.find({ role: 'mentor', isActive: true })
      .select('name email')
      .sort({ name: 1 });
    res.json({ mentors });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/onboarding/internships — list internships for dropdown
 */
const getInternshipsForOnboarding = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'mentor') {
      filter.mentor = req.user._id;
    }
    const internships = await Internship.find(filter)
      .select('title status maxStudents students')
      .sort({ createdAt: -1 });
    res.json({ internships });
  } catch (error) {
    next(error);
  }
};

module.exports = { onboardStudent, getMentors, getInternshipsForOnboarding };