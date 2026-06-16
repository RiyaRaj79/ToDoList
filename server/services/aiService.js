/**
 * AI Service — Smart Mock AI (works without any API key)
 * Falls back to OpenAI if OPENAI_API_KEY is set and USE_MOCK_AI=false
 */

const PRODUCTIVITY_TIPS = [
  "Break your largest task into 5-minute chunks — momentum builds naturally.",
  "Use the 2-minute rule: if it takes less than 2 minutes, do it now.",
  "Schedule your hardest task for when your energy peaks (usually morning).",
  "Batch similar tasks together to reduce context-switching overhead.",
  "Time-block your calendar: treat tasks like meetings you can't cancel.",
  "Review your task list the night before to prime your subconscious.",
  "The Pomodoro Technique: 25 min focus + 5 min break = sustained output.",
  "Remove distractions first — productivity is about removing friction.",
  "Celebrate small wins — dopamine fuels continued productivity.",
  "Prioritize ruthlessly: 20% of tasks deliver 80% of value (Pareto Principle).",
];

const MOTIVATIONAL_QUOTES = [
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { quote: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { quote: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { quote: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { quote: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { quote: "Productivity is never an accident. It is always the result of commitment.", author: "Paul J. Meyer" },
  { quote: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { quote: "You are the master of your fate and the captain of your soul.", author: "William Henley" },
];

// Smart subtask generation based on task analysis
const generateSubtasks = (taskTitle, taskDescription = '') => {
  const title = taskTitle.toLowerCase();
  const desc = taskDescription.toLowerCase();
  const combined = `${title} ${desc}`;

  // Template patterns
  const patterns = [
    {
      keywords: ['website', 'web app', 'frontend', 'ui', 'interface', 'design'],
      subtasks: [
        'Define requirements and create wireframes',
        'Set up project structure and dependencies',
        'Build core layout and navigation',
        'Implement main feature components',
        'Add responsive styling and animations',
        'Test across devices and browsers',
        'Deploy and verify production build',
      ],
    },
    {
      keywords: ['report', 'document', 'write', 'essay', 'article', 'blog'],
      subtasks: [
        'Research and gather information',
        'Create an outline/structure',
        'Write first draft',
        'Review and revise content',
        'Proofread for grammar and style',
        'Format and finalize document',
        'Submit or publish',
      ],
    },
    {
      keywords: ['api', 'backend', 'server', 'database', 'endpoint'],
      subtasks: [
        'Define API schema and models',
        'Set up database and connections',
        'Implement core endpoints',
        'Add authentication and middleware',
        'Write tests for all endpoints',
        'Add error handling and validation',
        'Document the API',
      ],
    },
    {
      keywords: ['meeting', 'presentation', 'pitch', 'demo'],
      subtasks: [
        'Define meeting objectives and agenda',
        'Prepare materials and slides',
        'Rehearse talking points',
        'Send calendar invites and reminders',
        'Set up meeting environment/tools',
        'Conduct the meeting',
        'Follow up with action items',
      ],
    },
    {
      keywords: ['learn', 'study', 'course', 'tutorial', 'read'],
      subtasks: [
        'Define learning goals and timeline',
        'Gather resources and materials',
        'Complete first learning session (30 min)',
        'Take notes on key concepts',
        'Practice with exercises or projects',
        'Review and reinforce knowledge',
        'Apply learning to real project',
      ],
    },
    {
      keywords: ['project', 'build', 'create', 'develop', 'implement'],
      subtasks: [
        'Define project scope and goals',
        'Break down into smaller milestones',
        'Set up tools and environment',
        'Complete first working prototype',
        'Iterate and improve',
        'Test thoroughly',
        'Launch and gather feedback',
      ],
    },
  ];

  for (const pattern of patterns) {
    if (pattern.keywords.some((k) => combined.includes(k))) {
      return pattern.subtasks.map((title, i) => ({ title, completed: false }));
    }
  }

  // Generic fallback subtasks
  return [
    { title: `Research and plan: ${taskTitle}`, completed: false },
    { title: 'Gather required resources and tools', completed: false },
    { title: 'Complete the first phase', completed: false },
    { title: 'Review progress and adjust plan', completed: false },
    { title: 'Finalize and deliver', completed: false },
  ];
};

// Priority suggestion based on task analysis
const suggestPriority = (taskTitle, dueDate) => {
  const title = taskTitle.toLowerCase();
  const urgentKeywords = ['urgent', 'asap', 'immediately', 'critical', 'emergency', 'deadline'];
  const highKeywords = ['important', 'priority', 'meeting', 'client', 'presentation', 'report'];
  const lowKeywords = ['someday', 'maybe', 'nice to have', 'optional', 'eventually'];

  if (urgentKeywords.some((k) => title.includes(k))) return 'critical';
  if (highKeywords.some((k) => title.includes(k))) return 'high';
  if (lowKeywords.some((k) => title.includes(k))) return 'low';

  // Check due date urgency
  if (dueDate) {
    const daysUntilDue = (new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24);
    if (daysUntilDue <= 1) return 'critical';
    if (daysUntilDue <= 3) return 'high';
    if (daysUntilDue <= 7) return 'medium';
  }

  return 'medium';
};

// Generate a daily plan from tasks
const generateDailyPlan = (tasks) => {
  const pending = tasks.filter((t) => !t.completed).slice(0, 8);

  if (pending.length === 0) {
    return {
      message: "🎉 Amazing! You've completed all your tasks! Use this time to plan tomorrow or learn something new.",
      plan: [],
      tip: PRODUCTIVITY_TIPS[Math.floor(Math.random() * PRODUCTIVITY_TIPS.length)],
    };
  }

  // Sort: critical first, then high, then by due date
  const sorted = [...pending].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const diff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (diff !== 0) return diff;
    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
    return 0;
  });

  const timeSlots = ['09:00', '09:30', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
  const plan = sorted.slice(0, 6).map((task, i) => ({
    time: timeSlots[i] || `${9 + i}:00`,
    task: task.title,
    priority: task.priority,
    estimatedTime: task.estimatedTime || 30,
    id: task._id,
  }));

  return {
    message: `📋 Here's your optimized plan for today with ${pending.length} tasks. Start with your most critical items when your energy is highest!`,
    plan,
    tip: PRODUCTIVITY_TIPS[Math.floor(Math.random() * PRODUCTIVITY_TIPS.length)],
    focusSessions: Math.ceil(plan.reduce((sum, t) => sum + t.estimatedTime, 0) / 25),
  };
};

// Generate productivity insights
const generateProductivityReport = (analyticsData) => {
  const { overview, productivityScore, dailyTrend } = analyticsData;
  const insights = [];

  if (overview.overdueTasks > 0) {
    insights.push({
      type: 'warning',
      message: `⚠️ You have ${overview.overdueTasks} overdue task${overview.overdueTasks > 1 ? 's' : ''}. Consider rescheduling or breaking them into smaller steps.`,
    });
  }

  if (overview.completionRate >= 80) {
    insights.push({ type: 'success', message: `🏆 Excellent! Your ${overview.completionRate}% completion rate puts you in the top tier of productive users.` });
  } else if (overview.completionRate >= 50) {
    insights.push({ type: 'info', message: `📈 Good progress! Your ${overview.completionRate}% completion rate shows solid momentum. Aim for 80%!` });
  } else {
    insights.push({ type: 'tip', message: `💡 Your completion rate is ${overview.completionRate}%. Try breaking tasks into smaller, 15-minute chunks to build momentum.` });
  }

  if (productivityScore >= 80) {
    insights.push({ type: 'success', message: `⚡ Your productivity score of ${productivityScore}/100 is outstanding! You're in beast mode.` });
  }

  const trend = dailyTrend || [];
  const recentAvg = trend.length > 0 ? trend.slice(-3).reduce((s, d) => s + d.completed, 0) / 3 : 0;
  const prevAvg = trend.length >= 6 ? trend.slice(0, 3).reduce((s, d) => s + d.completed, 0) / 3 : recentAvg;

  if (recentAvg > prevAvg) {
    insights.push({ type: 'success', message: `📊 Your productivity is trending UP! You're completing ${Math.round((recentAvg - prevAvg) * 10) / 10} more tasks per day than last week.` });
  }

  insights.push({
    type: 'tip',
    message: PRODUCTIVITY_TIPS[Math.floor(Math.random() * PRODUCTIVITY_TIPS.length)],
  });

  return insights;
};

// Chat response generator
const generateChatResponse = (message, context = {}) => {
  const msg = message.toLowerCase();
  const { tasks = [], user = {} } = context;

  if (msg.includes('subtask') || msg.includes('break') || msg.includes('split')) {
    return {
      type: 'subtask',
      message: "I'll help you break that down! Share your task title and I'll generate smart subtasks for it. Use the task form and click 'Generate Subtasks' to see AI-powered breakdown.",
    };
  }

  if (msg.includes('priority') || msg.includes('prioritize') || msg.includes('important')) {
    const critical = tasks.filter((t) => t.priority === 'critical' && !t.completed);
    if (critical.length > 0) {
      return {
        type: 'priority',
        message: `🎯 You have ${critical.length} critical task${critical.length > 1 ? 's' : ''}. Start with: "${critical[0].title}". Tackling high-priority items first maximizes your impact.`,
      };
    }
    return {
      type: 'priority',
      message: "Great news — no critical tasks! Focus on your high-priority items next. Use the Priority filter to sort your task list by urgency.",
    };
  }

  if (msg.includes('plan') || msg.includes('today') || msg.includes('schedule')) {
    return {
      type: 'plan',
      message: "I'll generate an optimized daily plan! Click 'Generate Daily Plan' to see your tasks organized by priority and energy levels. I'll schedule your hardest work for peak hours.",
    };
  }

  if (msg.includes('streak') || msg.includes('motivation')) {
    const streak = user.streak || 0;
    if (streak >= 7) {
      return { type: 'motivation', message: `🔥 ${streak}-day streak! You're absolutely crushing it! Keep the momentum going — consistency is the key to mastery.` };
    }
    return {
      type: 'motivation',
      message: "Every expert was once a beginner. Your streak grows one day at a time. Complete a task today to keep building momentum! 💪",
    };
  }

  if (msg.includes('tip') || msg.includes('advice') || msg.includes('improve')) {
    const tip = PRODUCTIVITY_TIPS[Math.floor(Math.random() * PRODUCTIVITY_TIPS.length)];
    return { type: 'tip', message: `💡 Productivity tip: ${tip}` };
  }

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    const name = user.name || 'there';
    return {
      type: 'greeting',
      message: `Hey ${name}! 👋 I'm your AI productivity assistant. I can help you:\n• Break tasks into subtasks\n• Prioritize your work\n• Generate daily plans\n• Provide productivity tips\n• Analyze your progress\n\nWhat would you like to work on today?`,
    };
  }

  // Default response
  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  return {
    type: 'general',
    message: `I'm here to supercharge your productivity! 🚀\n\nAsk me to:\n• "Break down my task"\n• "What should I prioritize?"\n• "Make a daily plan"\n• "Give me a productivity tip"\n\n💬 "${quote.quote}" — ${quote.author}`,
  };
};

const getMotivationalQuote = () => {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
};

const getProductivityTip = () => {
  return PRODUCTIVITY_TIPS[Math.floor(Math.random() * PRODUCTIVITY_TIPS.length)];
};

module.exports = {
  generateSubtasks,
  suggestPriority,
  generateDailyPlan,
  generateProductivityReport,
  generateChatResponse,
  getMotivationalQuote,
  getProductivityTip,
};
