const Test = require('../models/Test');
const TestSubmission = require('../models/TestSubmission');
const User = require('../models/User');
const Internship = require('../models/Internship');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (line[i] === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += line[i];
    }
  }
  result.push(current.trim());
  return result;
};

const parseCSV = (csvText) => {
  const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (values[i] || '').replace(/^"|"$/g, '').trim(); });
    return obj;
  });
};

const autoGrade = (test, submittedAnswers) => {
  let score = 0;
  const gradedAnswers = submittedAnswers.map(ans => {
    const question = test.questions.id(ans.questionId);
    if (!question) return { ...ans, isCorrect: null, pointsAwarded: 0 };

    if (question.type === 'mcq') {
      const correct = (ans.answer || '').toUpperCase() === (question.correctAnswer || '').toUpperCase();
      const pts = correct ? (question.points || 0) : 0;
      score += pts;
      return { ...ans, isCorrect: correct, pointsAwarded: pts };
    }
    // short_answer: pending manual review
    return { ...ans, isCorrect: null, pointsAwarded: 0 };
  });
  return { gradedAnswers, score };
};

// ─── Controllers ──────────────────────────────────────────────────────────────

// GET /api/tests
const getTests = async (req, res, next) => {
  try {
    const { status, internshipId, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (req.user.role === 'student') {
      filter.status = 'active';
      filter.$or = [
        { assignedTo: req.user._id },
        { assignedTo: { $size: 0 } },
      ];
    } else if (req.user.role === 'mentor') {
      filter.createdBy = req.user._id;
      if (status) filter.status = status;
    } else {
      // admin sees all
      if (status) filter.status = status;
    }

    if (internshipId) filter.internship = internshipId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [tests, total] = await Promise.all([
      Test.find(filter)
        .populate('createdBy', 'name')
        .populate('internship', 'title')
        .select('-questions.correctAnswer') // hide answers from list view
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Test.countDocuments(filter),
    ]);

    // For students: attach their submission status
    let testsWithStatus = tests;
    if (req.user.role === 'student') {
      const submissions = await TestSubmission.find({
        student: req.user._id,
        test: { $in: tests.map(t => t._id) },
      }).select('test status score percentage submittedAt');

      const subMap = {};
      submissions.forEach(s => { subMap[s.test.toString()] = s; });

      testsWithStatus = tests.map(t => ({
        ...t.toJSON(),
        mySubmission: subMap[t._id.toString()] || null,
      }));
    }

    res.json({ tests: testsWithStatus, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

// GET /api/tests/:id — Full test detail
const getTestById = async (req, res, next) => {
  try {
    const isStudentView = req.user.role === 'student';
    const query = Test.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('internship', 'title');

    const test = await query;
    if (!test) return res.status(404).json({ message: 'Test not found' });

    let testData = test.toJSON();

    // Students: hide correct answers, check access
    if (isStudentView) {
      if (test.status !== 'active') {
        return res.status(403).json({ message: 'This test is not currently active' });
      }
      // Remove correct answers
      testData.questions = testData.questions.map(q => {
        const { correctAnswer, ...rest } = q;
        return rest;
      });
    }

    // Attach student's own submission
    if (isStudentView) {
      const sub = await TestSubmission.findOne({
        test: req.params.id,
        student: req.user._id,
      });
      testData.mySubmission = sub || null;
    }

    res.json({ test: testData });
  } catch (error) {
    next(error);
  }
};

// POST /api/tests — Create test
const createTest = async (req, res, next) => {
  try {
    const { title, description, instructions, duration, questions = [], internshipId,
      assignedTo, status, startDate, dueDate, allowedAttempts, showResultsToStudent, passingScore } = req.body;

    const test = await Test.create({
      title, description, instructions, duration,
      questions: questions.map((q, i) => ({ ...q, order: i })),
      createdBy: req.user._id,
      internship: internshipId || null,
      assignedTo: assignedTo || [],
      status: status || 'draft',
      startDate: startDate || null,
      dueDate: dueDate || null,
      allowedAttempts: allowedAttempts || 1,
      showResultsToStudent: showResultsToStudent !== false,
      passingScore: passingScore || 0,
    });

    const populated = await test.populate('createdBy', 'name');
    res.status(201).json({ test: populated, message: 'Test created successfully' });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tests/:id
const updateTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    if (req.user.role === 'mentor' && test.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this test' });
    }

    const allowed = ['title', 'description', 'instructions', 'duration', 'questions',
      'internship', 'assignedTo', 'status', 'startDate', 'dueDate',
      'allowedAttempts', 'showResultsToStudent', 'passingScore'];

    allowed.forEach(key => {
      if (req.body[key] !== undefined) {
        if (key === 'questions') {
          test.questions = req.body.questions.map((q, i) => ({ ...q, order: i }));
        } else {
          test[key] = req.body[key];
        }
      }
    });

    await test.save();
    const populated = await test.populate('createdBy', 'name');
    res.json({ test: populated, message: 'Test updated' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tests/:id
const deleteTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    if (req.user.role === 'mentor' && test.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this test' });
    }

    await Promise.all([
      Test.findByIdAndDelete(req.params.id),
      TestSubmission.deleteMany({ test: req.params.id }),
    ]);

    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// POST /api/tests/:id/start — Student starts a test
const startTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    if (test.status !== 'active') return res.status(400).json({ message: 'Test is not active' });

    // Check due date
    if (test.dueDate && new Date() > new Date(test.dueDate)) {
      return res.status(400).json({ message: 'The submission deadline for this test has passed' });
    }

    const existing = await TestSubmission.findOne({ test: req.params.id, student: req.user._id });
    if (existing) {
      if (existing.status === 'submitted' || existing.status === 'reviewed') {
        return res.status(400).json({ message: 'You have already submitted this test' });
      }
      if (existing.status === 'in_progress') {
        // Return existing in-progress submission
        const fullTest = await Test.findById(req.params.id);
        const testData = fullTest.toJSON();
        testData.questions = testData.questions.map(q => {
          const { correctAnswer, ...rest } = q;
          return rest;
        });
        return res.json({ test: testData, submission: existing, message: 'Resuming test' });
      }
    }

    const submission = await TestSubmission.create({
      test: req.params.id,
      student: req.user._id,
      status: 'in_progress',
      startedAt: new Date(),
      totalPoints: test.totalPoints,
    });

    // Return test without correct answers
    const testData = test.toJSON();
    testData.questions = testData.questions.map(q => {
      const { correctAnswer, ...rest } = q;
      return rest;
    });

    res.status(201).json({ test: testData, submission, message: 'Test started' });
  } catch (error) {
    next(error);
  }
};

// POST /api/tests/:id/submit — Student submits answers
const submitTest = async (req, res, next) => {
  try {
    const { answers = [], timeTakenSeconds, autoSubmitted = false } = req.body;

    const [test, submission] = await Promise.all([
      Test.findById(req.params.id),
      TestSubmission.findOne({ test: req.params.id, student: req.user._id }),
    ]);

    if (!test) return res.status(404).json({ message: 'Test not found' });
    if (!submission) return res.status(400).json({ message: 'Test not started. Start the test first.' });
    if (submission.status === 'submitted' || submission.status === 'reviewed') {
      return res.status(400).json({ message: 'Test already submitted' });
    }

    // Validate time limit (allow 30s buffer)
    const startedAt = new Date(submission.startedAt).getTime();
    const maxAllowedMs = (test.duration * 60 + 30) * 1000;
    const elapsed = Date.now() - startedAt;
    if (elapsed > maxAllowedMs) {
      // Mark as auto-submitted but still process
    }

    // Grade the submission
    const { gradedAnswers, score } = autoGrade(test, answers);
    const percentage = test.totalPoints > 0 ? Math.round((score / test.totalPoints) * 100) : 0;
    const passed = percentage >= (test.passingScore || 0);

    // Check if there are short_answer questions (pending manual review)
    const hasPendingReview = test.questions.some(q => q.type === 'short_answer');
    const finalStatus = hasPendingReview ? 'submitted' : 'reviewed';

    submission.answers = gradedAnswers;
    submission.score = score;
    submission.totalPoints = test.totalPoints;
    submission.percentage = percentage;
    submission.status = hasPendingReview ? 'submitted' : 'reviewed';
    submission.submittedAt = new Date();
    submission.timeTakenSeconds = timeTakenSeconds || 0;
    submission.autoSubmitted = autoSubmitted;
    submission.passed = hasPendingReview ? null : passed;

    await submission.save();

    res.json({
      submission,
      message: hasPendingReview
        ? 'Test submitted! Short answer questions are pending mentor review.'
        : `Test submitted! You scored ${score}/${test.totalPoints} (${percentage}%)`,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tests/:id/results — Mentor/Admin: all submissions
const getTestResults = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    if (req.user.role === 'mentor' && test.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const submissions = await TestSubmission.find({ test: req.params.id })
      .populate('student', 'name email')
      .populate('reviewedBy', 'name')
      .sort({ submittedAt: -1 });

    // Find who hasn't submitted
    let allStudents = [];
    if (test.assignedTo && test.assignedTo.length > 0) {
      allStudents = await User.find({ _id: { $in: test.assignedTo }, role: 'student' }).select('name email');
    } else {
      // All active students
      const filter = { role: 'student', isActive: true };
      if (req.user.role === 'mentor') filter.mentor = req.user._id;
      allStudents = await User.find(filter).select('name email');
    }

    const submittedStudentIds = new Set(submissions.map(s => s.student._id.toString()));
    const notSubmitted = allStudents.filter(s => !submittedStudentIds.has(s._id.toString()));

    res.json({
      test,
      submissions,
      notSubmitted,
      stats: {
        total: allStudents.length,
        submitted: submissions.length,
        notSubmitted: notSubmitted.length,
        avgScore: submissions.length > 0
          ? Math.round(submissions.reduce((a, s) => a + s.percentage, 0) / submissions.length)
          : 0,
        passed: submissions.filter(s => s.passed === true).length,
        failed: submissions.filter(s => s.passed === false).length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tests/:id/my-result — Student: own result
const getMyResult = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    if (!test.showResultsToStudent) {
      return res.status(403).json({ message: 'Results are not available for students on this test' });
    }

    const submission = await TestSubmission.findOne({
      test: req.params.id,
      student: req.user._id,
    }).populate('reviewedBy', 'name');

    if (!submission) return res.status(404).json({ message: 'No submission found' });

    // Attach question details to answers (with correct answers now visible)
    const answersWithDetails = submission.answers.map(ans => {
      const question = test.questions.id(ans.questionId);
      return {
        ...ans.toJSON(),
        questionText: question?.questionText,
        questionType: question?.type,
        options: question?.options,
        correctAnswer: question?.correctAnswer, // reveal after submission
        points: question?.points,
      };
    });

    res.json({
      test: { title: test.title, totalPoints: test.totalPoints, passingScore: test.passingScore },
      submission: { ...submission.toJSON(), answers: answersWithDetails },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tests/:id/review-submission/:submissionId — Mentor reviews short answers
const reviewSubmission = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    if (req.user.role === 'mentor' && test.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const submission = await TestSubmission.findById(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const { answers, reviewNotes } = req.body;

    // Update short_answer points
    let totalScore = 0;
    submission.answers = submission.answers.map(ans => {
      const reviewed = answers?.find(a => a.questionId === ans.questionId.toString());
      if (reviewed && ans.isCorrect === null) {
        ans.pointsAwarded = Math.max(0, reviewed.pointsAwarded || 0);
        ans.mentorNote = reviewed.mentorNote || '';
        ans.isCorrect = reviewed.pointsAwarded > 0;
      }
      totalScore += ans.pointsAwarded || 0;
      return ans;
    });

    submission.score = totalScore;
    submission.percentage = test.totalPoints > 0 ? Math.round((totalScore / test.totalPoints) * 100) : 0;
    submission.passed = submission.percentage >= (test.passingScore || 0);
    submission.status = 'reviewed';
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();
    if (reviewNotes) submission.reviewNotes = reviewNotes;

    await submission.save();

    const populated = await submission.populate('student', 'name email');
    res.json({ submission: populated, message: 'Submission reviewed successfully' });
  } catch (error) {
    next(error);
  }
};

// GET /api/tests/template/csv — Download CSV question template
const downloadTemplate = async (req, res, next) => {
  try {
    const csvHeader = 'Question,Type,Option A,Option B,Option C,Option D,Correct Answer (A/B/C/D),Points\n';
    const csvRows = [
      '"What is the capital of France?",mcq,"Paris","London","Berlin","Rome",A,2',
      '"Explain the concept of Object-Oriented Programming in your own words.",short_answer,,,,,,5',
      '"Which of the following is NOT a JavaScript data type?",mcq,"String","Boolean","Integer","Number",C,1',
      '"Describe the steps to deploy a Node.js application.",short_answer,,,,,,10',
    ].join('\n');

    const csvContent = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=test_questions_template.csv');
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

// POST /api/tests/:id/import-questions — Import questions from CSV
const importQuestions = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please upload a CSV file' });

    const csvText = req.file.buffer.toString('utf-8');
    const rows = parseCSV(csvText);

    if (rows.length === 0) return res.status(400).json({ message: 'CSV file is empty or invalid' });

    const questions = [];
    const errors = [];

    rows.forEach((row, i) => {
      const lineNum = i + 2;
      const questionText = row['Question'] || row['question'] || '';
      const type = (row['Type'] || row['type'] || 'mcq').toLowerCase().replace(' ', '_');
      const points = parseFloat(row['Points'] || row['points'] || 1) || 1;

      if (!questionText) { errors.push(`Row ${lineNum}: Question text is required`); return; }
      if (!['mcq', 'short_answer'].includes(type)) { errors.push(`Row ${lineNum}: Type must be 'mcq' or 'short_answer'`); return; }

      const q = { questionText, type, points, order: questions.length };

      if (type === 'mcq') {
        const optA = row['Option A'] || row['option a'] || '';
        const optB = row['Option B'] || row['option b'] || '';
        const correctAnswer = (row['Correct Answer (A/B/C/D)'] || row['Correct Answer'] || row['correct answer'] || '').toUpperCase();

        if (!optA || !optB) { errors.push(`Row ${lineNum}: MCQ requires at least Option A and B`); return; }
        if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) { errors.push(`Row ${lineNum}: Correct Answer must be A, B, C, or D`); return; }

        q.options = {
          A: optA,
          B: optB,
          C: row['Option C'] || row['option c'] || '',
          D: row['Option D'] || row['option d'] || '',
        };
        q.correctAnswer = correctAnswer;
      }

      questions.push(q);
    });

    if (questions.length === 0) {
      return res.status(400).json({ message: 'No valid questions found', errors });
    }

    res.json({ questions, errors, message: `Parsed ${questions.length} question(s) from CSV` });
  } catch (error) {
    next(error);
  }
};

// GET /api/tests/stats — for AI insights
const getTestStats = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'mentor') filter.createdBy = req.user._id;

    const tests = await Test.find(filter).select('title status totalPoints createdAt');
    const allSubmissions = await TestSubmission.find({
      test: { $in: tests.map(t => t._id) },
    }).populate('student', 'name email').populate('test', 'title');

    res.json({ tests, submissions: allSubmissions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};