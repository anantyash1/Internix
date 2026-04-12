const Report = require('../models/Report');
const { cloudinary } = require('../config/cloudinary');

// GET /api/reports
const getReports = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (req.user.role === 'student') {
      filter.student = req.user._id;
    }

    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('student', 'name email')
        .populate('reviewedBy', 'name')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Report.countDocuments(filter),
    ]);

    res.json({ reports, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

// POST /api/reports — Student uploads a report
const uploadReport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { title, description, internship } = req.body;
    const fileType = req.file.mimetype.includes('pdf') ? 'pdf' : 'image';

    const report = await Report.create({
      title,
      description,
      student: req.user._id,
      internship,
      fileUrl: req.file.path,
      filePublicId: req.file.filename,
      fileType,
    });

    const populated = await report.populate('student', 'name email');
    res.status(201).json({ report: populated, message: 'Report uploaded successfully' });
  } catch (error) {
    next(error);
  }
};

// PUT /api/reports/:id/review — Mentor reviews a report
const reviewReport = async (req, res, next) => {
  try {
    const { status, feedback } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status;
    report.feedback = feedback;
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    await report.save();

    const populated = await report.populate([
      { path: 'student', select: 'name email' },
      { path: 'reviewedBy', select: 'name' },
    ]);

    res.json({ report: populated, message: 'Report reviewed successfully' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/reports/:id
const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Delete from Cloudinary
    if (report.filePublicId) {
      await cloudinary.uploader.destroy(report.filePublicId);
    }

    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getReports, uploadReport, reviewReport, deleteReport };
