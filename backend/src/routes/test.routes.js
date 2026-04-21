const express = require('express');
const multer = require('multer');
const router = express.Router();

const {
  getTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
  startTest,
  submitTest,
  getTestResults,
  getMyResult,
  reviewSubmission,
  downloadTemplate,
  importQuestions,
  getTestStats,
} = require('../controllers/test.controller');

const { protect, authorize } = require('../middleware/auth.middleware');

// In-memory storage for CSV files (no disk write needed)
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
});

// ── Template (public - no auth required) ────────────────────────────────────
router.get('/template/csv', downloadTemplate);

router.use(protect);

// ── Stats (AI insights) ─────────────────────────────────────────────────────
router.get('/stats', authorize('mentor', 'admin'), getTestStats);

// ── CRUD ────────────────────────────────────────────────────────────────────
router.get('/', getTests);
router.post('/', authorize('mentor', 'admin'), createTest);
router.get('/:id', getTestById);
router.put('/:id', authorize('mentor', 'admin'), updateTest);
router.delete('/:id', authorize('mentor', 'admin'), deleteTest);

// ── Question import ──────────────────────────────────────────────────────────
router.post(
  '/:id/import-questions',
  authorize('mentor', 'admin'),
  csvUpload.single('file'),
  importQuestions
);

// ── Student actions ──────────────────────────────────────────────────────────
router.post('/:id/start', authorize('student'), startTest);
router.post('/:id/submit', authorize('student'), submitTest);
router.get('/:id/my-result', authorize('student'), getMyResult);

// ── Mentor/Admin results ─────────────────────────────────────────────────────
router.get('/:id/results', authorize('mentor', 'admin'), getTestResults);
router.put(
  '/:id/review-submission/:submissionId',
  authorize('mentor', 'admin'),
  reviewSubmission
);

module.exports = router;