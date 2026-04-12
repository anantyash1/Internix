const Attendance = require('../models/Attendance');

// GET /api/attendance
const getAttendance = async (req, res, next) => {
  try {
    const { studentId, startDate, endDate, page = 1, limit = 30 } = req.query;
    const filter = {};

    if (req.user.role === 'student') {
      filter.student = req.user._id;
    } else if (studentId) {
      filter.student = studentId;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [records, total] = await Promise.all([
      Attendance.find(filter)
        .populate('student', 'name email')
        .populate('markedBy', 'name')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ date: -1 }),
      Attendance.countDocuments(filter),
    ]);

    res.json({ records, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

// POST /api/attendance — Student marks their own attendance
const markAttendance = async (req, res, next) => {
  try {
    const { status, checkInTime, notes } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already marked today
    const existing = await Attendance.findOne({
      student: req.user._id,
      date: today,
    });

    if (existing) {
      // Update checkout time if already checked in
      if (checkInTime === undefined && req.body.checkOutTime) {
        existing.checkOutTime = req.body.checkOutTime;
        await existing.save();
        return res.json({ record: existing, message: 'Check-out recorded' });
      }
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }

    const record = await Attendance.create({
      student: req.user._id,
      date: today,
      status: status || 'present',
      checkInTime: checkInTime || new Date().toLocaleTimeString('en-US', { hour12: false }),
      markedBy: req.user._id,
      notes,
    });

    res.status(201).json({ record, message: 'Attendance marked successfully' });
  } catch (error) {
    next(error);
  }
};

// POST /api/attendance/mark — Mentor marks attendance for a student
const markAttendanceByMentor = async (req, res, next) => {
  try {
    const { studentId, date, status, notes } = req.body;

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      student: studentId,
      date: attendanceDate,
    });

    if (existing) {
      existing.status = status;
      existing.markedBy = req.user._id;
      if (notes) existing.notes = notes;
      await existing.save();
      return res.json({ record: existing, message: 'Attendance updated' });
    }

    const record = await Attendance.create({
      student: studentId,
      date: attendanceDate,
      status,
      markedBy: req.user._id,
      notes,
    });

    res.status(201).json({ record, message: 'Attendance recorded' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAttendance, markAttendance, markAttendanceByMentor };
