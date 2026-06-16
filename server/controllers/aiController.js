const aiService = require('../services/aiService');
const Task = require('../models/Task');

// @desc    Chat with AI assistant
// @route   POST /api/ai/chat
// @access  Private
const chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    const tasks = await Task.find({ userId: req.user._id, completed: false }).limit(20);
    const response = aiService.generateChatResponse(message, { tasks, user: req.user });

    res.json({ success: true, data: { response } });
  } catch (error) { next(error); }
};

// @desc    Generate subtasks for a task
// @route   POST /api/ai/subtasks
// @access  Private
const generateSubtasks = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Task title required' });

    const subtasks = aiService.generateSubtasks(title, description);
    res.json({ success: true, data: { subtasks } });
  } catch (error) { next(error); }
};

// @desc    Suggest priority for a task
// @route   POST /api/ai/suggest-priority
// @access  Private
const suggestPriority = async (req, res, next) => {
  try {
    const { title, dueDate } = req.body;
    const priority = aiService.suggestPriority(title, dueDate);
    const reasons = {
      critical: 'This task has urgent keywords or is due very soon.',
      high: 'This task appears important or client-facing.',
      medium: 'This task has moderate urgency.',
      low: 'This task can be deferred without major impact.',
    };
    res.json({ success: true, data: { priority, reason: reasons[priority] } });
  } catch (error) { next(error); }
};

// @desc    Generate daily plan
// @route   GET /api/ai/daily-plan
// @access  Private
const getDailyPlan = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user._id, completed: false }).sort({ priority: 1 });
    const plan = aiService.generateDailyPlan(tasks);
    res.json({ success: true, data: plan });
  } catch (error) { next(error); }
};

// @desc    Get productivity insights
// @route   POST /api/ai/insights
// @access  Private
const getInsights = async (req, res, next) => {
  try {
    const { analytics } = req.body;
    const insights = aiService.generateProductivityReport(analytics);
    res.json({ success: true, data: { insights } });
  } catch (error) { next(error); }
};

// @desc    Get motivational quote
// @route   GET /api/ai/quote
// @access  Private
const getQuote = async (req, res, next) => {
  try {
    const quote = aiService.getMotivationalQuote();
    res.json({ success: true, data: { quote } });
  } catch (error) { next(error); }
};

// @desc    Get productivity tip
// @route   GET /api/ai/tip
// @access  Private
const getTip = async (req, res, next) => {
  try {
    const tip = aiService.getProductivityTip();
    res.json({ success: true, data: { tip } });
  } catch (error) { next(error); }
};

module.exports = { chat, generateSubtasks, suggestPriority, getDailyPlan, getInsights, getQuote, getTip };
