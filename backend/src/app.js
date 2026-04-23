// // require('dotenv').config();
// // const express = require('express');
// // const cors = require('cors');
// // const morgan = require('morgan');

// // const authRoutes = require('./routes/auth.routes');
// // const userRoutes = require('./routes/user.routes');
// // const taskRoutes = require('./routes/task.routes');
// // const attendanceRoutes = require('./routes/attendance.routes');
// // const reportRoutes = require('./routes/report.routes');
// // const certificateRoutes = require('./routes/certificate.routes');
// // const dashboardRoutes = require('./routes/dashboard.routes');
// // const internshipRoutes = require('./routes/internship.routes');
// // const { errorHandler, notFound } = require('./middleware/error.middleware');
// // // Add these two requires at the top with other routes
// // const videoRoutes = require('./routes/video.routes');
// // const aiRoutes = require('./routes/ai.routes');

// // const app = express();

// // // Middleware
// // app.use(cors({
// //   origin: process.env.CLIENT_URL || 'http://localhost:5173',
// //   credentials: true,
// // }));
// // app.use(express.json({ limit: '10mb' }));
// // app.use(express.urlencoded({ extended: true }));
// // if (process.env.NODE_ENV !== 'production') {
// //   app.use(morgan('dev'));
// // }

// // // Health check
// // app.get('/api/health', (req, res) => {
// //   res.json({ status: 'ok', timestamp: new Date().toISOString() });
// // });
// // console.log("aiRoutes:", typeof aiRoutes);
// // // Routes

// // // Add in the routes section (after existing routes)

// // app.use('/api/auth', authRoutes);
// // app.use('/api/users', userRoutes);
// // app.use('/api/tasks', taskRoutes);
// // app.use('/api/attendance', attendanceRoutes);
// // app.use('/api/reports', reportRoutes);
// // app.use('/api/certificates', certificateRoutes);
// // app.use('/api/dashboard', dashboardRoutes);
// // app.use('/api/internships', internshipRoutes);
// // app.use('/api/videos', videoRoutes);
// // app.use('/api/ai', aiRoutes);

// // // Error handling
// // app.use(notFound);
// // app.use(errorHandler);

// // module.exports = app;



// // require('dotenv').config();
// // const express = require('express');
// // const cors = require('cors');
// // const morgan = require('morgan');

// // const authRoutes = require('./routes/auth.routes');
// // const userRoutes = require('./routes/user.routes');
// // const taskRoutes = require('./routes/task.routes');
// // const attendanceRoutes = require('./routes/attendance.routes');
// // const reportRoutes = require('./routes/report.routes');
// // const certificateRoutes = require('./routes/certificate.routes');
// // const dashboardRoutes = require('./routes/dashboard.routes');
// // const internshipRoutes = require('./routes/internship.routes');
// // const videoRoutes = require('./routes/video.routes');
// // const aiRoutes = require('./routes/ai.routes');
// // const workScheduleRoutes = require('./routes/workschedule.routes');
// // const onboardingRoutes   = require('./routes/onboarding.routes');
// // const { errorHandler, notFound } = require('./middleware/error.middleware');

// // const app = express();

// // // Middleware
// // app.use(cors({
// //   origin: process.env.CLIENT_URL || 'http://localhost:5173',
// //   credentials: true,
// // }));
// // app.use(express.json({ limit: '10mb' }));
// // app.use(express.urlencoded({ extended: true }));
// // if (process.env.NODE_ENV !== 'production') {
// //   app.use(morgan('dev'));
// // }

// // // Health check
// // app.get('/api/health', (req, res) => {
// //   res.json({ status: 'ok', timestamp: new Date().toISOString() });
// // });

// // // Routes
// // app.use('/api/auth', authRoutes);
// // app.use('/api/users', userRoutes);
// // app.use('/api/tasks', taskRoutes);
// // app.use('/api/attendance', attendanceRoutes);
// // app.use('/api/reports', reportRoutes);
// // app.use('/api/certificates', certificateRoutes);
// // app.use('/api/dashboard', dashboardRoutes);
// // app.use('/api/internships', internshipRoutes);
// // app.use('/api/videos', videoRoutes);
// // app.use('/api/ai', aiRoutes);
// // app.use('/api/workschedule', workScheduleRoutes);
// // app.use('/api/onboarding',  onboardingRoutes);

// // // Error handling
// // app.use(notFound);
// // app.use(errorHandler);

// // module.exports = app;



// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const morgan = require('morgan');

// const authRoutes = require('./routes/auth.routes');
// const userRoutes = require('./routes/user.routes');
// const taskRoutes = require('./routes/task.routes');
// const attendanceRoutes = require('./routes/attendance.routes');
// const reportRoutes = require('./routes/report.routes');
// const certificateRoutes = require('./routes/certificate.routes');
// const dashboardRoutes = require('./routes/dashboard.routes');
// const internshipRoutes = require('./routes/internship.routes');
// const videoRoutes = require('./routes/video.routes');
// const aiRoutes = require('./routes/ai.routes');
// const workScheduleRoutes = require('./routes/Workschedule');
// const onboardingRoutes   = require('./routes/onboarding');
// const { errorHandler, notFound } = require('./middleware/error.middleware');

// const app = express();

// // Middleware
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:5173',
//   credentials: true,
// }));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));
// if (process.env.NODE_ENV !== 'production') {
//   app.use(morgan('dev'));
// }

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'ok', timestamp: new Date().toISOString() });
// });

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/tasks', taskRoutes);
// app.use('/api/attendance', attendanceRoutes);
// app.use('/api/reports', reportRoutes);
// app.use('/api/certificates', certificateRoutes);
// app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/internships', internshipRoutes);
// app.use('/api/videos', videoRoutes);
// app.use('/api/ai', aiRoutes);
// app.use('/api/workschedule', workScheduleRoutes);
// app.use('/api/onboarding',  onboardingRoutes);

// // Error handling
// app.use(notFound);
// app.use(errorHandler);

// module.exports = app;





// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const morgan = require('morgan');

// const authRoutes = require('./routes/auth.routes');
// const userRoutes = require('./routes/user.routes');
// const taskRoutes = require('./routes/task.routes');
// const attendanceRoutes = require('./routes/attendance.routes');
// const reportRoutes = require('./routes/report.routes');
// const certificateRoutes = require('./routes/certificate.routes');
// const dashboardRoutes = require('./routes/dashboard.routes');
// const internshipRoutes = require('./routes/internship.routes');
// const videoRoutes = require('./routes/video.routes');
// const aiRoutes = require('./routes/ai.routes');
// const workScheduleRoutes = require('./routes/Workschedule');
// const onboardingRoutes   = require('./routes/onboarding');
// const testRoutes         = require('./routes/test.routes');
// const { errorHandler, notFound } = require('./middleware/error.middleware');

// const app = express();

// // Middleware
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:5173',
//   credentials: true,
// }));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));
// if (process.env.NODE_ENV !== 'production') {
//   app.use(morgan('dev'));
// }

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'ok', timestamp: new Date().toISOString() });
// });

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/tasks', taskRoutes);
// app.use('/api/attendance', attendanceRoutes);
// app.use('/api/reports', reportRoutes);
// app.use('/api/certificates', certificateRoutes);
// app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/internships', internshipRoutes);
// app.use('/api/videos', videoRoutes);
// app.use('/api/ai', aiRoutes);
// app.use('/api/workschedule', workScheduleRoutes);
// app.use('/api/onboarding',  onboardingRoutes);
// app.use('/api/tests',       testRoutes);

// // Error handling
// app.use(notFound);
// app.use(errorHandler);

// module.exports = app;





require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const taskRoutes = require('./routes/task.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const reportRoutes = require('./routes/report.routes');
const certificateRoutes = require('./routes/certificate.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const internshipRoutes = require('./routes/internship.routes');
const videoRoutes = require('./routes/video.routes');
const aiRoutes = require('./routes/ai.routes');
const workScheduleRoutes = require('./routes/Workschedule');
const onboardingRoutes   = require('./routes/onboarding');
const testRoutes         = require('./routes/test.routes');
const groupRoutes        = require('./routes/group.routes');
const noticeRoutes       = require('./routes/notice.routes');
const { errorHandler, notFound } = require('./middleware/error.middleware');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/workschedule', workScheduleRoutes);
app.use('/api/onboarding',  onboardingRoutes);
app.use('/api/tests',       testRoutes);
app.use('/api/groups',      groupRoutes);
app.use('/api/notices',     noticeRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;