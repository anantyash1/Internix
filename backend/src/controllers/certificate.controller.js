const Certificate = require('../models/Certificate');
const User = require('../models/User');
const Internship = require('../models/Internship');
const generateCertificatePDF = require('../utils/generateCertificate');
const crypto = require('crypto');

// POST /api/certificates — Admin generates a certificate
const generateCertificate = async (req, res, next) => {
  try {
    const { studentId, internshipId, grade } = req.body;

    const [student, internship] = await Promise.all([
      User.findById(studentId),
      Internship.findById(internshipId),
    ]);

    if (!student || student.role !== 'student') {
      return res.status(400).json({ message: 'Invalid student' });
    }
    if (!internship) {
      return res.status(400).json({ message: 'Invalid internship' });
    }

    // Check if certificate already exists
    const existing = await Certificate.findOne({ student: studentId, internship: internshipId });
    if (existing) {
      return res.status(400).json({ message: 'Certificate already issued for this student and internship' });
    }

    const certificateNumber = `INTX-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const certificate = await Certificate.create({
      student: studentId,
      internship: internshipId,
      certificateNumber,
      issuedBy: req.user._id,
      grade,
      completionStatus: 'completed',
    });

    const populated = await certificate.populate([
      { path: 'student', select: 'name email' },
      { path: 'internship', select: 'title startDate endDate' },
      { path: 'issuedBy', select: 'name' },
    ]);

    res.status(201).json({ certificate: populated, message: 'Certificate generated successfully' });
  } catch (error) {
    next(error);
  }
};

// GET /api/certificates — Get certificates
const getCertificates = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'student') {
      filter.student = req.user._id;
    }

    const certificates = await Certificate.find(filter)
      .populate('student', 'name email')
      .populate('internship', 'title startDate endDate')
      .populate('issuedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ certificates });
  } catch (error) {
    next(error);
  }
};

// GET /api/certificates/:id/download — Download certificate PDF
const downloadCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('student', 'name')
      .populate('internship', 'title startDate endDate');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Access control: only the student or admin can download
    if (
      req.user.role === 'student' &&
      certificate.student._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to download this certificate' });
    }

    const pdfBuffer = await generateCertificatePDF({
      studentName: certificate.student.name,
      internshipTitle: certificate.internship.title,
      startDate: certificate.internship.startDate,
      endDate: certificate.internship.endDate,
      certificateNumber: certificate.certificateNumber,
      grade: certificate.grade,
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=certificate-${certificate.certificateNumber}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

module.exports = { generateCertificate, getCertificates, downloadCertificate };
