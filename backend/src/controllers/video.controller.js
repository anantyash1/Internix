const Video = require('../models/Video');
const VideoProgress = require('../models/VideoProgress');
const Internship = require('../models/Internship');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'internix/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv'],
  },
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 200 * 1024 * 1024 },
});

function getYoutubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function toObjectIdStrings(values = []) {
  return values.map((value) => value.toString());
}

function sanitizeSeconds(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100) / 100;
}

function isVideoAssignedToStudent(video, studentId) {
  if (!video.assignedTo || video.assignedTo.length === 0) return true;
  return video.assignedTo.some((assignedId) => assignedId.toString() === studentId.toString());
}

async function ensureInternshipAccess(user, internshipId) {
  if (!internshipId) {
    return { error: 'Internship is required for every video' };
  }

  const internship = await Internship.findById(internshipId).select('_id title mentor');
  if (!internship) {
    return { error: 'Internship not found' };
  }

  if (user.role === 'mentor' && internship.mentor.toString() !== user._id.toString()) {
    return { error: 'You can manage videos only for your own internships', status: 403 };
  }

  return { internship };
}

async function getMentorInternshipIds(mentorId) {
  const internships = await Internship.find({ mentor: mentorId }).select('_id');
  return toObjectIdStrings(internships.map((internship) => internship._id));
}

async function getVideos(req, res, next) {
  try {
    const { internshipId, taskId } = req.query;
    const filter = {};

    if (taskId) filter.task = taskId;

    if (req.user.role === 'student') {
      if (!req.user.internship) {
        return res.json({ videos: [] });
      }

      filter.internship = req.user.internship;
      filter.$or = [
        { assignedTo: req.user._id },
        { assignedTo: { $size: 0 } },
      ];
    } else if (req.user.role === 'mentor') {
      const internshipIds = await getMentorInternshipIds(req.user._id);
      if (!internshipIds.length) {
        return res.json({ videos: [] });
      }

      if (internshipId) {
        if (!internshipIds.includes(internshipId)) {
          return res.status(403).json({ message: 'You can only view videos for your own internships' });
        }
        filter.internship = internshipId;
      } else {
        filter.internship = { $in: internshipIds };
      }
    } else if (internshipId) {
      filter.internship = internshipId;
    }

    const videos = await Video.find(filter)
      .populate('createdBy', 'name')
      .populate('internship', 'title')
      .sort({ order: 1, createdAt: -1 });

    let progressMap = {};
    if (req.user.role === 'student' && videos.length > 0) {
      const progresses = await VideoProgress.find({
        student: req.user._id,
        video: { $in: videos.map((video) => video._id) },
      });

      progresses.forEach((progress) => {
        progressMap[progress.video.toString()] = progress;
      });
    }

    const videosWithProgress = videos.map((video) => ({
      ...video.toJSON(),
      progress: progressMap[video._id.toString()] || null,
    }));

    res.json({ videos: videosWithProgress });
  } catch (error) {
    next(error);
  }
}

async function createVideoLink(req, res, next) {
  try {
    const { title, description, url, internshipId, taskId, assignedTo, duration, order } = req.body;
    const access = await ensureInternshipAccess(req.user, internshipId);

    if (access.error) {
      return res.status(access.status || 400).json({ message: access.error });
    }

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
      internship: access.internship._id,
      task: taskId || undefined,
      createdBy: req.user._id,
      assignedTo: Array.isArray(assignedTo) ? assignedTo : [],
      order: order || 0,
    });

    const populated = await video.populate([
      { path: 'createdBy', select: 'name' },
      { path: 'internship', select: 'title' },
    ]);

    res.status(201).json({ video: populated });
  } catch (error) {
    next(error);
  }
}

async function uploadVideoFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, internshipId, taskId, assignedTo, order } = req.body;
    const access = await ensureInternshipAccess(req.user, internshipId);

    if (access.error) {
      return res.status(access.status || 400).json({ message: access.error });
    }

    const video = await Video.create({
      title,
      description,
      type: 'upload',
      url: req.file.path,
      internship: access.internship._id,
      task: taskId || undefined,
      createdBy: req.user._id,
      assignedTo: assignedTo ? JSON.parse(assignedTo) : [],
      order: order || 0,
    });

    const populated = await video.populate([
      { path: 'createdBy', select: 'name' },
      { path: 'internship', select: 'title' },
    ]);

    res.status(201).json({ video: populated });
  } catch (error) {
    next(error);
  }
}

async function deleteVideo(req, res, next) {
  try {
    const video = await Video.findById(req.params.id).populate('internship', 'mentor');
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (
      req.user.role === 'mentor' &&
      (!video.internship || video.internship.mentor.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'You can only delete videos from your own internships' });
    }

    if (video.type === 'upload' && video.url) {
      const publicId = video.url.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(`internix/videos/${publicId}`, { resource_type: 'video' });
    }

    await Promise.all([
      Video.findByIdAndDelete(req.params.id),
      VideoProgress.deleteMany({ video: req.params.id }),
    ]);

    res.json({ message: 'Video deleted' });
  } catch (error) {
    next(error);
  }
}

async function syncVideoProgress(req, res, next) {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Allow mentors/admins to track progress for any video, students only for their assigned internship
    if (req.user.role === 'student') {
      if (!req.user.internship || video.internship?.toString() !== req.user.internship.toString()) {
        return res.status(403).json({ message: 'This video is not assigned to your internship' });
      }

      if (!isVideoAssignedToStudent(video, req.user._id)) {
        return res.status(403).json({ message: 'This video is not assigned to you' });
      }
    }

    const currentTime = sanitizeSeconds(req.body.currentTime);
    const durationSeconds = sanitizeSeconds(req.body.duration);
    const hasSkipped = Boolean(req.body.hasSkipped);
    const isEnded = Boolean(req.body.isEnded);
    const now = new Date();

    let progress = await VideoProgress.findOne({ student: req.user._id, video: video._id });
    if (!progress) {
      progress = new VideoProgress({ student: req.user._id, video: video._id });
    }

    const shouldResetAttempt =
      !progress.completed &&
      currentTime <= 2 &&
      (progress.lastPositionSeconds || 0) > 10;

    if (shouldResetAttempt) {
      progress.completed = false;
      progress.completedAt = undefined;
      progress.watchedSeconds = 0;
      progress.durationSeconds = durationSeconds;
      progress.lastPositionSeconds = 0;
      progress.maxPositionSeconds = 0;
      progress.lastPingAt = undefined;
      progress.skipped = false;
      progress.skipDetectedAt = undefined;
      progress.skipReason = '';
    }

    const previousPosition = progress.lastPositionSeconds || 0;
    const previousPingAt = progress.lastPingAt ? new Date(progress.lastPingAt) : null;

    let serverDetectedSkip = false;
    if (previousPingAt && currentTime > previousPosition) {
      const elapsedSeconds = Math.max((now.getTime() - previousPingAt.getTime()) / 1000, 0);
      const allowedAdvance = Math.max(elapsedSeconds * 2.25 + 3, 8);
      if (currentTime - previousPosition > allowedAdvance) {
        serverDetectedSkip = true;
      }
    }

    const skipped = progress.skipped || hasSkipped || serverDetectedSkip;
    const maxPositionSeconds = Math.max(progress.maxPositionSeconds || 0, currentTime);
    const effectiveDuration = Math.max(progress.durationSeconds || 0, durationSeconds);
    const completionThreshold =
      effectiveDuration > 0 ? Math.max(effectiveDuration * 0.92, effectiveDuration - 5) : 0;
    const reachedEnd = isEnded || (completionThreshold > 0 && maxPositionSeconds >= completionThreshold);

    progress.watchedSeconds = maxPositionSeconds;
    progress.durationSeconds = effectiveDuration;
    progress.lastPositionSeconds = currentTime;
    progress.maxPositionSeconds = maxPositionSeconds;
    progress.lastPingAt = now;
    progress.skipped = skipped;

    if (skipped && !progress.skipDetectedAt) {
      progress.skipDetectedAt = now;
      progress.skipReason = hasSkipped ? 'client_seek_detected' : 'server_jump_detected';
    }

    if (!skipped && reachedEnd) {
      progress.completed = true;
      progress.completedAt = progress.completedAt || now;
    } else if (!progress.completed) {
      progress.completed = false;
      progress.completedAt = undefined;
    }

    await progress.save();

    const message = progress.completed
      ? 'Video completed automatically'
      : progress.skipped
        ? 'Skipping detected. Restart the video and watch it fully to complete.'
        : 'Playback progress saved';

    res.json({ progress, message });
  } catch (error) {
    next(error);
  }
}

async function getStudentProgress(req, res, next) {
  try {
    const { studentId } = req.params;
    const student = await User.findById(studentId).select('role mentor');

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (req.user.role === 'mentor' && student.mentor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only view progress for your own students' });
    }

    const progresses = await VideoProgress.find({ student: studentId })
      .populate('video', 'title type thumbnailUrl internship');

    res.json({ progresses });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getVideos,
  createVideoLink,
  uploadVideoFile,
  uploadVideo,
  deleteVideo,
  syncVideoProgress,
  getStudentProgress,
};
