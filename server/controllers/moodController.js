const MoodEntry = require('../models/MoodEntry');
const User = require('../models/User');

// @desc    Get mood entries
// @route   GET /api/mood
// @access  Private
const getMoodEntries = async (req, res, next) => {
  try {
    const { limit = 30 } = req.query;
    const entries = await MoodEntry.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(parseInt(limit));
    res.json({ success: true, data: { entries } });
  } catch (error) { next(error); }
};

// @desc    Log mood entry
// @route   POST /api/mood
// @access  Private
const logMood = async (req, res, next) => {
  try {
    const { mood, note, factors, date } = req.body;
    if (!mood || mood < 1 || mood > 5) {
      return res.status(400).json({ success: false, message: 'Mood must be between 1 and 5' });
    }

    // Check if already logged today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await MoodEntry.findOne({
      userId: req.user._id,
      date: { $gte: today, $lt: tomorrow },
    });

    let entry;
    if (existing) {
      existing.mood = mood;
      existing.note = note || '';
      existing.factors = factors || [];
      await existing.save();
      entry = existing;
    } else {
      entry = await MoodEntry.create({
        mood, note, factors, date: date || new Date(), userId: req.user._id,
      });
      // Award XP for mood logging
      const user = await User.findById(req.user._id);
      await user.addXP(5);
    }

    res.status(201).json({ success: true, message: 'Mood logged! +5 XP', data: { entry } });
  } catch (error) { next(error); }
};

// @desc    Get mood trend data
// @route   GET /api/mood/trend
// @access  Private
const getMoodTrend = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

    const entries = await MoodEntry.find({
      userId: req.user._id,
      date: { $gte: thirtyDaysAgo },
    }).sort({ date: 1 });

    const avgMood = entries.length > 0
      ? Math.round((entries.reduce((s, e) => s + e.mood, 0) / entries.length) * 10) / 10
      : 0;

    res.json({ success: true, data: { entries, avgMood, count: entries.length } });
  } catch (error) { next(error); }
};

module.exports = { getMoodEntries, logMood, getMoodTrend };
