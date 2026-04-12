const express = require('express');
const router = express.Router();
const { getAttendance, markAttendance, markAttendanceByMentor } = require('../controllers/attendance.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getAttendance);
router.post('/', authorize('student'), markAttendance);
router.post('/mark', authorize('mentor', 'admin'), markAttendanceByMentor);

module.exports = router;
