const Attendance = require('../models/Attendance');
const WorkSchedule = require('../models/WorkSchedule');
const { cloudinary } = require('../config/cloudinary');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDayName = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const currentTimeString = () => {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
};

const getActiveSchedule = async (studentId) => {
  // Try to find schedule linked to student's internship
  const User = require('../models/User');
  const student = await User.findById(studentId).select('internship');
  let schedule = null;

  if (student?.internship) {
    schedule = await WorkSchedule.findOne({
      internship: student.internship,
      isActive: true,
    });
  }

  if (!schedule) {
    schedule = await WorkSchedule.findOne({ internship: null, isActive: true });
  }

  // Return defaults if no schedule configured
  if (!schedule) {
    return {
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '18:00',
      graceMinutes: 15,
      requirePhoto: true,
    };
  }

  return schedule;
};

// ─── Controllers ──────────────────────────────────────────────────────────────

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
        .populate('photoVerifiedBy', 'name')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ date: -1 }),
      Attendance.countDocuments(filter),
    ]);

    res.json({
      records,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/attendance — Student check-in (with optional photo)
const markAttendance = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existing = await Attendance.findOne({
      student: req.user._id,
      date: today,
    });

    // Get the active work schedule
    const schedule = await getActiveSchedule(req.user._id);

    const todayName = getDayName(new Date());
    const isWorkingDay = schedule.workingDays.includes(todayName);

    if (!isWorkingDay) {
      return res.status(400).json({
        message: `Today (${todayName}) is not a working day. Working days: ${schedule.workingDays.join(', ')}`,
      });
    }

    // Check-in photo handling
    let checkInPhotoUrl = null;
    let checkInPhotoPublicId = null;

    if (req.file) {
      try {
        checkInPhotoUrl = req.file.path;
        checkInPhotoPublicId = req.file.filename;
      } catch (err) {
        console.error('File upload error:', err);
      }
    }

    if (schedule.requirePhoto && !checkInPhotoUrl && !existing) {
      return res.status(400).json({
        message: 'A selfie photo is required for check-in. Please capture your photo.',
      });
    }

    // ── Handle check-out ─────────────────────────────────────────────────────
    if (existing) {
      // Check-out flow
      if (existing.checkOutTime) {
        return res.status(400).json({ message: 'You have already checked out today.' });
      }

      let checkOutPhotoUrl = existing.checkOutPhoto;
      let checkOutPhotoPublicId = existing.checkOutPhotoPublicId;

      if (req.file) {
        try {
          checkOutPhotoUrl = req.file.path;
          checkOutPhotoPublicId = req.file.filename;
        } catch (err) {
          console.error('File upload error:', err);
        }
      }

      if (schedule.requirePhoto && !checkOutPhotoUrl) {
        return res.status(400).json({
          message: 'A selfie photo is required for check-out.',
        });
      }

      existing.checkOutTime = currentTimeString();
      existing.checkOutPhoto = checkOutPhotoUrl;
      existing.checkOutPhotoPublicId = checkOutPhotoPublicId;
      if (notes) existing.notes = notes;
      await existing.save();

      return res.json({ record: existing, message: 'Check-out recorded successfully' });
    }

    // ── Handle check-in ──────────────────────────────────────────────────────
    const currentMinutes = timeToMinutes(currentTimeString());
    const scheduleStartMinutes = timeToMinutes(schedule.startTime);
    const graceEnd = scheduleStartMinutes + (schedule.graceMinutes || 15);

    let attendanceStatus = status || 'present';

    // Auto-determine late status
    if (!status) {
      if (currentMinutes > graceEnd) {
        attendanceStatus = 'late';
      } else {
        attendanceStatus = 'present';
      }
    }

    const record = await Attendance.create({
      student: req.user._id,
      date: today,
      status: attendanceStatus,
      checkInTime: currentTimeString(),
      checkInPhoto: checkInPhotoUrl,
      checkInPhotoPublicId,
      markedBy: req.user._id,
      scheduledStartTime: schedule.startTime,
      scheduledEndTime: schedule.endTime,
      notes,
    });

    const populated = await record.populate('student', 'name email');
    res.status(201).json({
      record: populated,
      message: attendanceStatus === 'late'
        ? `Checked in (late - schedule started at ${schedule.startTime})`
        : 'Checked in successfully',
      isLate: attendanceStatus === 'late',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/attendance/mark — Mentor/Admin manual entry
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
      existing.isManualOverride = true;
      if (notes) existing.notes = notes;
      await existing.save();
      return res.json({ record: existing, message: 'Attendance updated' });
    }

    const record = await Attendance.create({
      student: studentId,
      date: attendanceDate,
      status,
      markedBy: req.user._id,
      isManualOverride: true,
      notes,
    });

    res.status(201).json({ record, message: 'Attendance recorded' });
  } catch (error) {
    next(error);
  }
};

// PUT /api/attendance/:id/verify-photo — Mentor verifies student photo
const verifyAttendancePhoto = async (req, res, next) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    record.isPhotoVerified = true;
    record.photoVerifiedBy = req.user._id;
    await record.save();

    res.json({ record, message: 'Photo verified' });
  } catch (error) {
    next(error);
  }
};

// GET /api/attendance/schedule — Get today's schedule info for student
const getTodaySchedule = async (req, res, next) => {
  try {
    const schedule = await getActiveSchedule(req.user._id);
    const todayName = getDayName(new Date());
    const isWorkingDay = schedule.workingDays.includes(todayName);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRecord = await Attendance.findOne({
      student: req.user._id,
      date: today,
    });

    res.json({
      schedule,
      todayName,
      isWorkingDay,
      todayRecord: todayRecord || null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendance,
  markAttendance,
  markAttendanceByMentor,
  verifyAttendancePhoto,
  getTodaySchedule,
};