const Habit = require('../models/Habit');
const User = require('../models/User');

// @desc    Get all habits
// @route   GET /api/habits
// @access  Private
const getHabits = async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, active: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: { habits } });
  } catch (error) { next(error); }
};

// @desc    Create habit
// @route   POST /api/habits
// @access  Private
const createHabit = async (req, res, next) => {
  try {
    const habit = await Habit.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, message: 'Habit created!', data: { habit } });
  } catch (error) { next(error); }
};

// @desc    Update habit
// @route   PUT /api/habits/:id
// @access  Private
const updateHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
    res.json({ success: true, data: { habit } });
  } catch (error) { next(error); }
};

// @desc    Delete habit
// @route   DELETE /api/habits/:id
// @access  Private
const deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { active: false },
      { new: true }
    );
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
    res.json({ success: true, message: 'Habit removed' });
  } catch (error) { next(error); }
};

// @desc    Log habit completion for today
// @route   POST /api/habits/:id/complete
// @access  Private
const completeHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const alreadyDone = habit.entries.some((e) => {
      const d = new Date(e.date); d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    if (alreadyDone) {
      return res.status(400).json({ success: false, message: 'Already completed today' });
    }

    habit.entries.push({ date: today, completed: true, note: req.body.note || '' });
    habit.totalCompletions += 1;

    // Calculate streak
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const doneYesterday = habit.entries.some((e) => {
      const d = new Date(e.date); d.setHours(0, 0, 0, 0);
      return d.getTime() === yesterday.getTime();
    });
    habit.streak = doneYesterday ? habit.streak + 1 : 1;
    if (habit.streak > habit.longestStreak) habit.longestStreak = habit.streak;

    await habit.save();

    // Award XP
    const user = await User.findById(req.user._id);
    await user.addXP(15);

    res.json({ success: true, message: '🔥 Habit completed! +15 XP', data: { habit } });
  } catch (error) { next(error); }
};

module.exports = { getHabits, createHabit, updateHabit, deleteHabit, completeHabit };
