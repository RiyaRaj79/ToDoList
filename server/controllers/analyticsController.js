const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get dashboard analytics
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Today boundaries
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);

    // Week boundaries (last 7 days)
    const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - 6); weekStart.setHours(0, 0, 0, 0);

    // Month boundaries (last 30 days)
    const monthStart = new Date(now); monthStart.setDate(monthStart.getDate() - 29); monthStart.setHours(0, 0, 0, 0);

    const [
      allTasks,
      completedToday,
      createdToday,
      overdueTasks,
      user,
    ] = await Promise.all([
      Task.find({ userId }),
      Task.countDocuments({ userId, completed: true, completedAt: { $gte: todayStart, $lte: todayEnd } }),
      Task.countDocuments({ userId, createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Task.countDocuments({ userId, completed: false, dueDate: { $lt: now } }),
      User.findById(userId),
    ]);

    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Priority breakdown
    const priorityBreakdown = { critical: 0, high: 0, medium: 0, low: 0 };
    allTasks.forEach((t) => { if (!t.completed) priorityBreakdown[t.priority] = (priorityBreakdown[t.priority] || 0) + 1; });

    // Category breakdown
    const categoryMap = {};
    allTasks.forEach((t) => {
      const cat = t.category || 'General';
      if (!categoryMap[cat]) categoryMap[cat] = { total: 0, completed: 0 };
      categoryMap[cat].total++;
      if (t.completed) categoryMap[cat].completed++;
    });
    const categoryBreakdown = Object.entries(categoryMap).map(([name, data]) => ({
      name, ...data, rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    }));

    // Daily completion trend (last 7 days)
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day); dayEnd.setHours(23, 59, 59, 999);

      const [completed, created] = await Promise.all([
        Task.countDocuments({ userId, completed: true, completedAt: { $gte: day, $lte: dayEnd } }),
        Task.countDocuments({ userId, createdAt: { $gte: day, $lte: dayEnd } }),
      ]);

      dailyTrend.push({
        date: day.toISOString().split('T')[0],
        day: day.toLocaleDateString('en-US', { weekday: 'short' }),
        completed,
        created,
      });
    }

    // Kanban breakdown
    const kanbanBreakdown = { todo: 0, inprogress: 0, review: 0, done: 0 };
    allTasks.forEach((t) => { kanbanBreakdown[t.kanbanColumn] = (kanbanBreakdown[t.kanbanColumn] || 0) + 1; });

    // Productivity score (0-100)
    const productivityScore = calculateProductivityScore({
      completionRate,
      streak: user.streak,
      completedToday,
      overdueTasks,
      pomodoroSessions: user.pomodoroSessions,
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalTasks,
          completedTasks,
          pendingTasks,
          completedToday,
          createdToday,
          overdueTasks,
          completionRate,
        },
        user: {
          streak: user.streak,
          longestStreak: user.longestStreak,
          xp: user.xp,
          level: user.level,
          levelTitle: user.levelTitle,
          xpProgress: user.xpProgress,
          xpToNextLevel: user.xpToNextLevel,
          weeklyXP: user.weeklyXP,
          totalFocusTime: user.totalFocusTime,
          pomodoroSessions: user.pomodoroSessions,
          achievements: user.achievements,
        },
        productivityScore,
        priorityBreakdown,
        categoryBreakdown,
        kanbanBreakdown,
        dailyTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

const calculateProductivityScore = ({ completionRate, streak, completedToday, overdueTasks, pomodoroSessions }) => {
  let score = 0;
  score += Math.min(completionRate * 0.4, 40); // Max 40 from completion rate
  score += Math.min(streak * 2, 20); // Max 20 from streak
  score += Math.min(completedToday * 3, 20); // Max 20 from today's completions
  score -= Math.min(overdueTasks * 3, 15); // Max -15 from overdue
  score += Math.min(pomodoroSessions * 2, 15); // Max 15 from focus
  return Math.max(0, Math.min(100, Math.round(score)));
};

// @desc    Get productivity score
// @route   GET /api/analytics/productivity-score
// @access  Private
const getProductivityScore = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);

    const [completedToday, overdueTasks, allTasks, user] = await Promise.all([
      Task.countDocuments({ userId, completed: true, completedAt: { $gte: todayStart, $lte: todayEnd } }),
      Task.countDocuments({ userId, completed: false, dueDate: { $lt: now } }),
      Task.find({ userId }),
      User.findById(userId),
    ]);

    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const score = calculateProductivityScore({
      completionRate, streak: user.streak, completedToday, overdueTasks,
      pomodoroSessions: user.pomodoroSessions,
    });

    res.json({ success: true, data: { score, streak: user.streak, completedToday, overdueTasks } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get streak info
// @route   GET /api/analytics/streaks
// @access  Private
const getStreaks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: {
        streak: user.streak,
        longestStreak: user.longestStreak,
        lastActivityDate: user.lastActivityDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics, getProductivityScore, getStreaks };
