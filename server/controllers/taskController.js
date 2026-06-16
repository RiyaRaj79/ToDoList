const Task = require('../models/Task');
const User = require('../models/User');

const XP_FOR_TASK = {
  critical: 50,
  high: 30,
  medium: 20,
  low: 10,
};

const ACHIEVEMENTS = {
  FIRST_TASK: { id: 'first_task', name: 'First Step', description: 'Completed your first task!', icon: '🎯' },
  TEN_TASKS: { id: 'ten_tasks', name: 'Getting Started', description: 'Completed 10 tasks!', icon: '🚀' },
  FIFTY_TASKS: { id: 'fifty_tasks', name: 'Task Master', description: 'Completed 50 tasks!', icon: '⚡' },
  HUNDRED_TASKS: { id: 'hundred_tasks', name: 'Legend', description: 'Completed 100 tasks!', icon: '🏆' },
  STREAK_7: { id: 'streak_7', name: 'Week Warrior', description: '7-day streak!', icon: '🔥' },
  STREAK_30: { id: 'streak_30', name: 'Month Master', description: '30-day streak!', icon: '💎' },
  LEVEL_5: { id: 'level_5', name: 'Rising Star', description: 'Reached level 5!', icon: '⭐' },
  LEVEL_10: { id: 'level_10', name: 'Expert', description: 'Reached level 10!', icon: '🎖️' },
};

const checkAndGrantAchievements = async (user) => {
  const newAchievements = [];
  const existingIds = user.achievements.map((a) => a.id);

  const checks = [
    { condition: user.totalTasksCompleted >= 1, achievement: ACHIEVEMENTS.FIRST_TASK },
    { condition: user.totalTasksCompleted >= 10, achievement: ACHIEVEMENTS.TEN_TASKS },
    { condition: user.totalTasksCompleted >= 50, achievement: ACHIEVEMENTS.FIFTY_TASKS },
    { condition: user.totalTasksCompleted >= 100, achievement: ACHIEVEMENTS.HUNDRED_TASKS },
    { condition: user.streak >= 7, achievement: ACHIEVEMENTS.STREAK_7 },
    { condition: user.streak >= 30, achievement: ACHIEVEMENTS.STREAK_30 },
    { condition: user.level >= 5, achievement: ACHIEVEMENTS.LEVEL_5 },
    { condition: user.level >= 10, achievement: ACHIEVEMENTS.LEVEL_10 },
  ];

  for (const { condition, achievement } of checks) {
    if (condition && !existingIds.includes(achievement.id)) {
      user.achievements.push({ ...achievement, unlockedAt: new Date() });
      newAchievements.push(achievement);
    }
  }

  if (newAchievements.length > 0) {
    await user.save();
  }

  return newAchievements;
};

// @desc    Get all tasks for current user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 100, completed, priority, category, status,
      search, sortBy = 'createdAt', sortOrder = 'desc', kanbanColumn, dueFrom, dueTo,
    } = req.query;

    const query = { userId: req.user._id };

    if (completed !== undefined) query.completed = completed === 'true';
    if (priority) query.priority = priority;
    if (category) query.category = { $regex: new RegExp(category, 'i') };
    if (status) query.status = status;
    if (kanbanColumn) query.kanbanColumn = kanbanColumn;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (dueFrom || dueTo) {
      query.dueDate = {};
      if (dueFrom) query.dueDate.$gte = new Date(dueFrom);
      if (dueTo) query.dueDate.$lte = new Date(dueTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [tasks, total] = await Promise.all([
      Task.find(query).sort(sortObj).skip(skip).limit(parseInt(limit)),
      Task.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: { task } });
  } catch (error) {
    next(error);
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const taskData = { ...req.body, userId: req.user._id };

    // Get max order value for new task
    const lastTask = await Task.findOne({ userId: req.user._id }).sort({ order: -1 });
    taskData.order = lastTask ? lastTask.order + 1 : 0;

    const task = await Task.create(taskData);

    // Notify via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user._id}`).emit('task:created', task);
    }

    res.status(201).json({
      success: true,
      message: 'Task created! 📝',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const io = req.app.get('io');
    if (io) io.to(`user:${req.user._id}`).emit('task:updated', task);

    res.json({ success: true, message: 'Task updated', data: { task } });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const io = req.app.get('io');
    if (io) io.to(`user:${req.user._id}`).emit('task:deleted', req.params.id);

    res.json({ success: true, message: 'Task deleted', data: { id: req.params.id } });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle task completion
// @route   PATCH /api/tasks/:id/complete
// @access  Private
const toggleComplete = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.completed = !task.completed;
    await task.save();

    let xpGained = 0;
    let newAchievements = [];
    let leveledUp = false;

    if (task.completed) {
      const user = await User.findById(req.user._id);
      user.totalTasksCompleted += 1;
      await user.updateStreak();
      const xpResult = await user.addXP(XP_FOR_TASK[task.priority] || 20);
      xpGained = xpResult.xpGained;
      leveledUp = xpResult.leveledUp;
      newAchievements = await checkAndGrantAchievements(user);
    }

    const io = req.app.get('io');
    if (io) io.to(`user:${req.user._id}`).emit('task:updated', task);

    res.json({
      success: true,
      message: task.completed ? `Task completed! +${xpGained} XP 🎉` : 'Task marked incomplete',
      data: { task, xpGained, leveledUp, newAchievements },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder tasks (drag and drop)
// @route   PATCH /api/tasks/reorder
// @access  Private
const reorderTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body; // Array of { id, order, kanbanColumn? }
    const bulkOps = tasks.map(({ id, order, kanbanColumn, status }) => ({
      updateOne: {
        filter: { _id: id, userId: req.user._id },
        update: { order, ...(kanbanColumn && { kanbanColumn }), ...(status && { status }) },
      },
    }));
    await Task.bulkWrite(bulkOps);

    const io = req.app.get('io');
    if (io) io.to(`user:${req.user._id}`).emit('tasks:reordered', tasks);

    res.json({ success: true, message: 'Tasks reordered' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categories for user
// @route   GET /api/tasks/categories
// @access  Private
const getCategories = async (req, res, next) => {
  try {
    const categories = await Task.distinct('category', { userId: req.user._id });
    res.json({ success: true, data: { categories } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, toggleComplete, reorderTasks, getCategories };
