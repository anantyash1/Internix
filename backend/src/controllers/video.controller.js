const Video = require('../models/Video');
const VideoProgress = require('../models/VideoProgress');
const { cloudinary } = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary storage for video uploads
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'internix/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv'],
  },
});
const uploadVideo = multer({ storage: videoStorage, limits: { fileSize: 200 * 1024 * 1024 } });

// Extract YouTube embed ID from URL
function getYoutubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

// GET /api/videos
const getVideos = async (req, res, next) => {
  try {
    const { internshipId, taskId } = req.query;
    const filter = {};
    if (internshipId) filter.internship = internshipId;
    if (taskId) filter.task = taskId;

    // Students only see videos assigned to them
    if (req.user.role === 'student') {
      filter.$or = [
        { assignedTo: req.user._id },
        { assignedTo: { $size: 0 } }, // assigned to all (empty array = all)
      ];
    } else if (req.user.role === 'mentor') {
      filter.createdBy = req.user._id;
    }

    const videos = await Video.find(filter)
      .populate('createdBy', 'name')
      .populate('internship', 'title')
      .sort({ order: 1, createdAt: -1 });

    // Attach progress for students
    let progressMap = {};
    if (req.user.role === 'student') {
      const progresses = await VideoProgress.find({
        student: req.user._id,
        video: { $in: videos.map((v) => v._id) },
      });
      progresses.forEach((p) => {
        progressMap[p.video.toString()] = p;
      });
    }

    const videosWithProgress = videos.map((v) => ({
      ...v.toJSON(),
      progress: progressMap[v._id.toString()] || null,
    }));

    res.json({ videos: videosWithProgress });
  } catch (error) {
    next(error);
  }
};

// POST /api/videos — Mentor creates a video (YouTube link)
const createVideoLink = async (req, res, next) => {
  try {
    const { title, description, url, internshipId, taskId, assignedTo, duration, order } = req.body;

    const youtubeId = getYoutubeId(url);
    if (!youtubeId) {
      return res.status(400).json({ message: 'Invalid YouTube URL' });
    }

    const video = await Video.create({
      title,
      description,
      type: 'youtube',
      url: `https://www.youtube.com/embed/${youtubeId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
      duration,
      internship: internshipId || undefined,
      task: taskId || undefined,
      createdBy: req.user._id,
      assignedTo: assignedTo || [],
      order: order || 0,
    });

    const populated = await video.populate('createdBy', 'name');
    res.status(201).json({ video: populated });
  } catch (error) {
    next(error);
  }
};

// POST /api/videos/upload — Mentor uploads a video file
const uploadVideoFile = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { title, description, internshipId, taskId, assignedTo, order } = req.body;

    const video = await Video.create({
      title,
      description,
      type: 'upload',
      url: req.file.path,
      internship: internshipId || undefined,
      task: taskId || undefined,
      createdBy: req.user._id,
      assignedTo: assignedTo ? JSON.parse(assignedTo) : [],
      order: order || 0,
    });

    const populated = await video.populate('createdBy', 'name');
    res.status(201).json({ video: populated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/videos/:id
const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    if (video.type === 'upload' && video.url) {
      const publicId = video.url.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(`internix/videos/${publicId}`, { resource_type: 'video' });
    }

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: 'Video deleted' });
  } catch (error) {
    next(error);
  }
};

// POST /api/videos/:id/complete — Student marks video as completed
const markComplete = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const progress = await VideoProgress.findOneAndUpdate(
      { student: req.user._id, video: req.params.id },
      { completed: true, completedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ progress, message: 'Marked as completed' });
  } catch (error) {
    next(error);
  }
};

// GET /api/videos/progress/:studentId — Mentor views student progress
const getStudentProgress = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const progresses = await VideoProgress.find({ student: studentId })
      .populate('video', 'title type thumbnailUrl');
    res.json({ progresses });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVideos, createVideoLink, uploadVideoFile, uploadVideo,
  deleteVideo, markComplete, getStudentProgress,
};