const WorkSchedule = require('../models/WorkSchedule');

// GET /api/workschedule — get active schedule (global or by internship)
const getWorkSchedule = async (req, res, next) => {
  try {
    const { internshipId } = req.query;

    let schedule = null;

    // Try internship-specific first
    if (internshipId) {
      schedule = await WorkSchedule.findOne({
        internship: internshipId,
        isActive: true,
      }).populate('createdBy', 'name');
    }

    // Fall back to global schedule
    if (!schedule) {
      schedule = await WorkSchedule.findOne({
        internship: null,
        isActive: true,
      }).populate('createdBy', 'name');
    }

    // Return default if none configured
    if (!schedule) {
      return res.json({
        schedule: {
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          startTime: '09:00',
          endTime: '18:00',
          graceMinutes: 15,
          requirePhoto: true,
          isActive: true,
          isDefault: true,
        },
      });
    }

    res.json({ schedule });
  } catch (error) {
    next(error);
  }
};

// GET /api/workschedule/all — list all schedules (admin only)
const getAllSchedules = async (req, res, next) => {
  try {
    const schedules = await WorkSchedule.find()
      .populate('createdBy', 'name')
      .populate('internship', 'title')
      .sort({ createdAt: -1 });
    res.json({ schedules });
  } catch (error) {
    next(error);
  }
};

// POST /api/workschedule — create or update schedule
const upsertWorkSchedule = async (req, res, next) => {
  try {
    const {
      name, workingDays, startTime, endTime, graceMinutes,
      requirePhoto, internshipId,
    } = req.body;

    // Deactivate existing schedule for same scope
    await WorkSchedule.updateMany(
      { internship: internshipId || null, isActive: true },
      { isActive: false }
    );

    const schedule = await WorkSchedule.create({
      name: name || 'Default Schedule',
      workingDays,
      startTime,
      endTime,
      graceMinutes: graceMinutes ?? 15,
      requirePhoto: requirePhoto !== false,
      internship: internshipId || null,
      createdBy: req.user._id,
      isActive: true,
    });

    const populated = await schedule.populate('createdBy', 'name');
    res.status(201).json({ schedule: populated, message: 'Work schedule saved' });
  } catch (error) {
    next(error);
  }
};

// PUT /api/workschedule/:id — update specific schedule
const updateWorkSchedule = async (req, res, next) => {
  try {
    const schedule = await WorkSchedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json({ schedule });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/workschedule/:id
const deleteWorkSchedule = async (req, res, next) => {
  try {
    const schedule = await WorkSchedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    await WorkSchedule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkSchedule,
  getAllSchedules,
  upsertWorkSchedule,
  updateWorkSchedule,
  deleteWorkSchedule,
};