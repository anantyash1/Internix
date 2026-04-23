const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Report storage ───────────────────────────────────────────────────────────
const reportStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'internix/reports',
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
    resource_type: 'auto',
  },
});

const uploadReport = multer({
  storage: reportStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ─── Attendance photo storage ─────────────────────────────────────────────────
const attendancePhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'internix/attendance',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    resource_type: 'image',
    transformation: [
      { width: 640, height: 640, crop: 'limit', quality: 'auto:good' },
    ],
  },
});

const uploadAttendancePhoto = multer({
  storage: attendancePhotoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    // Allow if no file (optional upload)
    if (!file) {
      cb(null, true);
      return;
    }
    // Validate file type if present
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for attendance photos'), false);
    }
  },
});

module.exports = { cloudinary, uploadReport, uploadAttendancePhoto };
