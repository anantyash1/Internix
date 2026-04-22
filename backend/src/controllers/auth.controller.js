const User = require('../models/User');
const generateToken = require('../utils/generateToken');

function serializeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
    mentor: user.mentor || null,
    internship: user.internship || null,
    isActive: user.isActive,
  };
}

async function register(req, res, next) {
  try {
    const { name, email, password, role, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({ name, email, password, role, phone });
    const populatedUser = await User.findById(user._id)
      .populate('mentor', 'name email')
      .populate('internship', 'title');
    const token = generateToken(user._id);

    res.status(201).json({
      user: serializeUser(populatedUser),
      token,
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated' });
    }

    const populatedUser = await User.findById(user._id)
      .populate('mentor', 'name email')
      .populate('internship', 'title');
    const token = generateToken(user._id);

    res.json({
      user: serializeUser(populatedUser),
      token,
    });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user._id)
      .populate('mentor', 'name email')
      .populate('internship');
    res.json({ user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, getMe };
