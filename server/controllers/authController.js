const User = require('../models/User');
const { generateTokens } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Welcome XP
    await user.addXP(50);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to TaskFlow X 🚀',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          xp: user.xp,
          level: user.level,
          levelTitle: user.levelTitle,
          streak: user.streak,
          settings: user.settings,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google Sign-In. Please log in with Google.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Update streak
    await user.updateStreak();

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}! 👋`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          xp: user.xp,
          level: user.level,
          levelTitle: user.levelTitle,
          xpProgress: user.xpProgress,
          xpToNextLevel: user.xpToNextLevel,
          streak: user.streak,
          longestStreak: user.longestStreak,
          totalTasksCompleted: user.totalTasksCompleted,
          achievements: user.achievements,
          settings: user.settings,
          pomodoroSessions: user.pomodoroSessions,
          totalFocusTime: user.totalFocusTime,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const { accessToken, refreshToken: newRefresh } = generateTokens(user._id);
    res.json({ success: true, data: { accessToken, refreshToken: newRefresh } });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          xp: user.xp,
          level: user.level,
          levelTitle: user.levelTitle,
          xpProgress: user.xpProgress,
          xpToNextLevel: user.xpToNextLevel,
          streak: user.streak,
          longestStreak: user.longestStreak,
          totalTasksCompleted: user.totalTasksCompleted,
          achievements: user.achievements,
          settings: user.settings,
          pomodoroSessions: user.pomodoroSessions,
          totalFocusTime: user.totalFocusTime,
          weeklyXP: user.weeklyXP,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile / settings
// @route   PUT /api/auth/me
// @access  Private
const updateMe = async (req, res, next) => {
  try {
    const { name, avatar, settings } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (avatar) updates.avatar = avatar;
    if (settings) updates.settings = { ...req.user.settings.toObject(), ...settings };

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Profile updated',
      data: { user: { id: user._id, name: user.name, avatar: user.avatar, settings: user.settings } },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth callback (handled by passport, JWT issued here)
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
    }

    await user.updateStreak();
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Redirect to frontend with tokens
    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?token=${accessToken}&refresh=${refreshToken}`
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Update focus session stats
// @route   POST /api/auth/focus-session
// @access  Private
const logFocusSession = async (req, res, next) => {
  try {
    const { duration } = req.body; // in minutes
    const user = await User.findById(req.user._id);
    user.focusTimeToday += duration;
    user.totalFocusTime += duration;
    user.pomodoroSessions += 1;
    await user.addXP(duration * 2); // 2 XP per focus minute
    res.json({ success: true, message: 'Focus session logged', data: { xpGained: duration * 2 } });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refreshToken, getMe, updateMe, googleCallback, logFocusSession };
