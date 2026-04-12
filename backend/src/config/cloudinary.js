const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

module.exports = { cloudinary, uploadReport };
