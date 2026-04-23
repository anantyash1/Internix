const Notice = require('../models/Notice');

// GET /api/notices — Get active notices for the current user
const getNotices = async (req, res, next) => {
  try {
    const now = new Date();
    const filter = {
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    };

    // Role filtering
    if (req.user.role !== 'admin') {
      filter.$and = [
        {
          $or: [
            { targetRoles: 'all' },
            { targetRoles: req.user.role },
          ],
        },
      ];
    }

    const notices = await Notice.find(filter)
      .populate('createdBy', 'name role')
      .populate('targetInternship', 'title')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(20);

    // Add read status for each notice
    const noticesWithRead = notices.map(n => ({
      ...n.toJSON(),
      isRead: n.readBy.some(r => r.user.toString() === req.user._id.toString()),
    }));

    res.json({ notices: noticesWithRead });
  } catch (error) {
    next(error);
  }
};

// POST /api/notices — Admin creates a notice
const createNotice = async (req, res, next) => {
  try {
    const { title, content, priority, type, targetRoles, targetInternship, isPinned, expiresAt } = req.body;

    const notice = await Notice.create({
      title,
      content,
      priority: priority || 'medium',
      type: type || 'general',
      targetRoles: targetRoles || ['all'],
      targetInternship: targetInternship || null,
      isPinned: isPinned || false,
      expiresAt: expiresAt || null,
      createdBy: req.user._id,
    });

    const populated = await notice.populate('createdBy', 'name role');
    res.status(201).json({ notice: populated, message: 'Notice published!' });
  } catch (error) {
    next(error);
  }
};

// PUT /api/notices/:id — Admin updates notice
const updateNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    }).populate('createdBy', 'name role');

    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.json({ notice });
  } catch (error) {
    next(error);
  }
};

// PUT /api/notices/:id/read — Mark notice as read
const markAsRead = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });

    const alreadyRead = notice.readBy.some(r => r.user.toString() === req.user._id.toString());
    if (!alreadyRead) {
      notice.readBy.push({ user: req.user._id });
      await notice.save();
    }

    res.json({ message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/notices/:id — Admin deletes notice
const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notice deleted' });
  } catch (error) {
    next(error);
  }
};

// GET /api/notices/all — Admin sees all notices
const getAllNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find()
      .populate('createdBy', 'name role')
      .populate('targetInternship', 'title')
      .sort({ isPinned: -1, createdAt: -1 });
    res.json({ notices });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotices, createNotice, updateNotice, markAsRead, deleteNotice, getAllNotices };