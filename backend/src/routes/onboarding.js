const express = require('express');
const router = express.Router();
const {
  onboardStudent,
  getMentors,
  getInternshipsForOnboarding,
} = require('../controllers/onboarding.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.use(authorize('admin', 'mentor'));

router.get('/mentors', getMentors);
router.get('/internships', getInternshipsForOnboarding);
router.post('/student', onboardStudent);

module.exports = router;