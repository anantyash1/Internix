const User = require('../models/User');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const Report = require('../models/Report');
const Internship = require('../models/Internship');
const Certificate = require('../models/Certificate');

// GET /api/dashboard — Role-aware dashboard data
const getDashboard = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return getAdminDashboard(req, res);
    } else if (req.user.role === 'mentor') {
      return getMentorDashboard(req, res);
    } else {
      return getStudentDashboard(req, res);
    }
  } catch (error) {
    next(error);
  }
};

async function getAdminDashboard(req, res) {
  const [
    totalStudents,
    totalMentors,
    totalInternships,
    totalTasks,
    totalReports,
    totalCertificates,
    tasksByStatus,
    recentUsers,
    attendanceStats,
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'mentor' }),
    Internship.countDocuments(),
    Task.countDocuments(),
    Report.countDocuments(),
    Certificate.countDocuments(),
    Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
    Attendance.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  res.json({
    stats: {
      totalStudents,
      totalMentors,
      totalInternships,
      totalTasks,
      totalReports,
      totalCertificates,
    },
    tasksByStatus: tasksByStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    attendanceStats: attendanceStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    recentUsers,
  });
}

async function getMentorDashboard(req, res) {
  const mentorId = req.user._id;

  const [
    myStudents,
    totalTasks,
    tasksByStatus,
    pendingReports,
    recentTasks,
  ] = await Promise.all([
    User.countDocuments({ mentor: mentorId, role: 'student' }),
    Task.countDocuments({ assignedBy: mentorId }),
    Task.aggregate([
      { $match: { assignedBy: mentorId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Report.countDocuments({ status: 'submitted' }),
    Task.find({ assignedBy: mentorId })
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  res.json({
    stats: { myStudents, totalTasks, pendingReports },
    tasksByStatus: tasksByStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    recentTasks,
  });
}

async function getStudentDashboard(req, res) {
  const studentId = req.user._id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalTasks,
    completedTasks,
    tasksByStatus,
    totalReports,
    approvedReports,
    todayAttendance,
    totalAttendance,
    certificates,
  ] = await Promise.all([
    Task.countDocuments({ assignedTo: studentId }),
    Task.countDocuments({ assignedTo: studentId, status: 'completed' }),
    Task.aggregate([
      { $match: { assignedTo: studentId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Report.countDocuments({ student: studentId }),
    Report.countDocuments({ student: studentId, status: 'approved' }),
    Attendance.findOne({ student: studentId, date: today }),
    Attendance.countDocuments({ student: studentId, status: 'present' }),
    Certificate.find({ student: studentId })
      .populate('internship', 'title')
      .sort({ createdAt: -1 }),
  ]);

  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  res.json({
    stats: {
      totalTasks,
      completedTasks,
      taskCompletionRate,
      totalReports,
      approvedReports,
      totalAttendanceDays: totalAttendance,
    },
    tasksByStatus: tasksByStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    todayAttendance: todayAttendance ? todayAttendance.status : null,
    certificates,
  });
}

module.exports = { getDashboard };
