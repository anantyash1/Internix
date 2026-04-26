const Meeting = require('../models/Meeting');

// GET /api/meetings
const getMeetings = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.user.role !== 'admin') {
      filter.$or = [{ targetRoles: 'all' }, { targetRoles: req.user.role }];
    }
    const meetings = await Meeting.find(filter)
      .populate('createdBy', 'name role')
      .populate('internship', 'title')
      .sort({ createdAt: -1 });
    res.json({ meetings });
  } catch (error) { next(error); }
};

// GET /api/meetings/all (admin)
const getAllMeetings = async (req, res, next) => {
  try {
    const meetings = await Meeting.find()
      .populate('createdBy', 'name role')
      .populate('internship', 'title')
      .sort({ createdAt: -1 });
    res.json({ meetings });
  } catch (error) { next(error); }
};

// POST /api/meetings
const createMeeting = async (req, res, next) => {
  try {
    const {
      title, description, meetingLink, frequency, meetingTime,
      dayOfWeek, dayOfMonth, specificDate, targetRoles,
      internship, notifyMinutesBefore,
    } = req.body;
    const meeting = await Meeting.create({
      title, description, meetingLink, frequency, meetingTime,
      dayOfWeek, dayOfMonth,
      specificDate: specificDate || null,
      targetRoles: targetRoles || ['all'],
      internship: internship || null,
      notifyMinutesBefore: notifyMinutesBefore ?? 5,
      createdBy: req.user._id,
    });
    const populated = await meeting.populate('createdBy', 'name role');
    res.status(201).json({ meeting: populated, message: 'Meeting scheduled!' });
  } catch (error) { next(error); }
};

// PUT /api/meetings/:id
const updateMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    }).populate('createdBy', 'name role');
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    res.json({ meeting });
  } catch (error) { next(error); }
};

// DELETE /api/meetings/:id
const deleteMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    await Meeting.findByIdAndDelete(req.params.id);
    res.json({ message: 'Meeting deleted' });
  } catch (error) { next(error); }
};

// GET /api/meetings/upcoming — next occurrence within 60 minutes
const getUpcoming = async (req, res, next) => {
  try {
    const now = new Date();
    const filter = { isActive: true };
    if (req.user.role !== 'admin') {
      filter.$or = [{ targetRoles: 'all' }, { targetRoles: req.user.role }];
    }
    const meetings = await Meeting.find(filter).populate('createdBy', 'name');
    const upcoming = [];

    for (const m of meetings) {
      const next = getNextOccurrence(m, now);
      if (!next) continue;
      const diffMs = next - now;
      const diffMin = diffMs / 60000;
      if (diffMin >= 0 && diffMin <= (m.notifyMinutesBefore + 1)) {
        upcoming.push({ ...m.toJSON(), nextOccurrence: next, minutesLeft: Math.round(diffMin) });
      }
    }
    res.json({ upcoming });
  } catch (error) { next(error); }
};

function getNextOccurrence(meeting, now) {
  const [hours, minutes] = meeting.meetingTime.split(':').map(Number);

  if (meeting.frequency === 'once') {
    if (!meeting.specificDate) return null;
    const d = new Date(meeting.specificDate);
    d.setHours(hours, minutes, 0, 0);
    return d > now ? d : null;
  }

  if (meeting.frequency === 'daily') {
    const candidate = new Date(now);
    candidate.setHours(hours, minutes, 0, 0);
    if (candidate <= now) candidate.setDate(candidate.getDate() + 1);
    return candidate;
  }

  if (meeting.frequency === 'weekly') {
    const target = meeting.dayOfWeek ?? 1;
    const candidate = new Date(now);
    candidate.setHours(hours, minutes, 0, 0);
    let diff = target - candidate.getDay();
    if (diff < 0 || (diff === 0 && candidate <= now)) diff += 7;
    candidate.setDate(candidate.getDate() + diff);
    return candidate;
  }

  if (meeting.frequency === 'monthly') {
    const target = meeting.dayOfMonth ?? 1;
    const candidate = new Date(now.getFullYear(), now.getMonth(), target, hours, minutes, 0, 0);
    if (candidate <= now) {
      candidate.setMonth(candidate.getMonth() + 1);
    }
    return candidate;
  }

  return null;
}

module.exports = { getMeetings, getAllMeetings, createMeeting, updateMeeting, deleteMeeting, getUpcoming };