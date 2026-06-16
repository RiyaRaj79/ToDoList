/**
 * Demo data seeder — populates MongoDB with sample data for testing
 * Run with: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Task = require('./models/Task');
const Habit = require('./models/Habit');
const MoodEntry = require('./models/MoodEntry');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflowx';

async function seed() {
  console.log('🌱 TaskFlow X — Database Seeder\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Task.deleteMany({}),
      Habit.deleteMany({}),
      MoodEntry.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create demo user
    const hashedPassword = await bcrypt.hash('demo1234', 12);
    const user = await User.create({
      name: 'Alex Johnson',
      email: 'demo@taskflowx.com',
      password: hashedPassword,
      xp: 2450,
      level: 7,
      streak: 12,
      longestStreak: 21,
      totalTasksCompleted: 87,
      achievements: [
        { id: 'first_task', name: 'First Step', icon: '🎯', unlockedAt: new Date() },
        { id: 'tasks_10', name: 'Getting Started', icon: '🚀', unlockedAt: new Date() },
        { id: 'tasks_50', name: 'Task Master', icon: '⚡', unlockedAt: new Date() },
        { id: 'week_warrior', name: 'Week Warrior', icon: '🔥', unlockedAt: new Date() },
        { id: 'rising_star', name: 'Rising Star', icon: '⭐', unlockedAt: new Date() },
      ],
      lastActive: new Date(),
    });
    console.log(`👤 Created user: ${user.email}`);

    // Create sample tasks
    const now = Date.now();
    const tasks = await Task.create([
      {
        userId: user._id,
        title: 'Design new product landing page',
        description: 'Create a stunning, conversion-optimized landing page for the Q3 product launch.',
        priority: 'critical',
        category: 'Work',
        status: 'inprogress',
        kanbanColumn: 'inprogress',
        dueDate: new Date(now + 2 * 86400000),
        color: '#6366f1',
        tags: ['design', 'launch', 'q3'],
        estimatedTime: 180,
        subtasks: [
          { title: 'Research competitor pages', completed: true },
          { title: 'Create wireframes', completed: true },
          { title: 'Design hero section', completed: false },
          { title: 'Mobile responsive layout', completed: false },
        ],
      },
      {
        userId: user._id,
        title: 'Write Q3 performance review',
        description: 'Compile metrics, achievements and goals for the quarterly review meeting.',
        priority: 'high',
        category: 'Work',
        status: 'todo',
        kanbanColumn: 'todo',
        dueDate: new Date(now + 5 * 86400000),
        color: '#f97316',
        tags: ['review', 'metrics'],
        estimatedTime: 90,
      },
      {
        userId: user._id,
        title: 'Run 5km — Morning run',
        description: 'Maintain daily exercise habit. Run the park trail route.',
        priority: 'medium',
        category: 'Health',
        status: 'todo',
        kanbanColumn: 'todo',
        dueDate: new Date(),
        color: '#10b981',
        tags: ['fitness', 'health'],
        estimatedTime: 40,
      },
      {
        userId: user._id,
        title: 'Read "Atomic Habits" — chapter 7-9',
        description: 'Continue the book reading habit. Take notes on key insights.',
        priority: 'low',
        category: 'Learning',
        status: 'todo',
        kanbanColumn: 'todo',
        dueDate: new Date(now + 7 * 86400000),
        color: '#a855f7',
        tags: ['reading', 'self-improvement'],
        estimatedTime: 45,
      },
      {
        userId: user._id,
        title: 'Fix login page bug on Safari',
        description: 'Users on Safari 17 report the login form submission is broken.',
        priority: 'critical',
        category: 'Work',
        status: 'review',
        kanbanColumn: 'review',
        dueDate: new Date(now + 1 * 86400000),
        color: '#f43f5e',
        tags: ['bug', 'frontend', 'safari'],
        estimatedTime: 60,
        subtasks: [
          { title: 'Reproduce the bug', completed: true },
          { title: 'Identify root cause', completed: true },
          { title: 'Apply fix and test', completed: true },
          { title: 'Code review', completed: false },
        ],
      },
      {
        userId: user._id,
        title: 'Update project documentation',
        description: 'Update README and API docs with the latest changes from v2.1.',
        priority: 'medium',
        category: 'Work',
        status: 'done',
        kanbanColumn: 'done',
        completed: true,
        completedAt: new Date(),
        dueDate: new Date(now - 1 * 86400000),
        color: '#06b6d4',
        tags: ['docs'],
        estimatedTime: 30,
      },
      {
        userId: user._id,
        title: 'Plan team offsite agenda',
        description: 'Coordinate with all team leads and create a full schedule for the offsite.',
        priority: 'high',
        category: 'Work',
        status: 'todo',
        kanbanColumn: 'todo',
        dueDate: new Date(now + 10 * 86400000),
        color: '#f59e0b',
        tags: ['team', 'planning'],
        estimatedTime: 120,
      },
      {
        userId: user._id,
        title: 'Weekly grocery shopping',
        description: 'Buy ingredients for meal prep next week.',
        priority: 'medium',
        category: 'Personal',
        status: 'todo',
        kanbanColumn: 'todo',
        dueDate: new Date(now + 3 * 86400000),
        color: '#10b981',
        tags: ['errands', 'personal'],
        estimatedTime: 45,
      },
    ]);
    console.log(`📝 Created ${tasks.length} tasks`);

    // Create habits
    const habits = await Habit.create([
      {
        userId: user._id,
        name: 'Morning Run',
        description: '5km every morning before work',
        icon: '🏃',
        color: '#10b981',
        frequency: 'daily',
        streak: 12,
        longestStreak: 21,
        totalCompletions: 34,
        entries: Array.from({ length: 14 }, (_, i) => ({
          date: new Date(now - i * 86400000),
          completed: i < 12,
          note: i === 0 ? 'New personal best!' : '',
        })),
      },
      {
        userId: user._id,
        name: 'Read for 30min',
        description: 'Daily reading for personal growth',
        icon: '📚',
        color: '#6366f1',
        frequency: 'daily',
        streak: 7,
        longestStreak: 14,
        totalCompletions: 21,
        entries: Array.from({ length: 14 }, (_, i) => ({
          date: new Date(now - i * 86400000),
          completed: i < 7,
        })),
      },
      {
        userId: user._id,
        name: 'Drink 2L Water',
        description: 'Stay hydrated throughout the day',
        icon: '💧',
        color: '#06b6d4',
        frequency: 'daily',
        streak: 3,
        longestStreak: 10,
        totalCompletions: 18,
        entries: Array.from({ length: 14 }, (_, i) => ({
          date: new Date(now - i * 86400000),
          completed: i < 3,
        })),
      },
      {
        userId: user._id,
        name: 'Meditation',
        description: '10 minutes of mindfulness every evening',
        icon: '🧘',
        color: '#a855f7',
        frequency: 'daily',
        streak: 5,
        longestStreak: 8,
        totalCompletions: 15,
        entries: Array.from({ length: 14 }, (_, i) => ({
          date: new Date(now - i * 86400000),
          completed: i < 5,
        })),
      },
    ]);
    console.log(`🔥 Created ${habits.length} habits`);

    // Create mood entries (last 10 days)
    const moods = await MoodEntry.create(
      Array.from({ length: 10 }, (_, i) => ({
        userId: user._id,
        mood: Math.floor(Math.random() * 3) + 3, // 3-5
        date: new Date(now - i * 86400000),
        note: i === 0 ? 'Great progress on the design project today!' : '',
        factors: i % 2 === 0 ? ['work', 'exercise'] : ['sleep'],
      }))
    );
    console.log(`😊 Created ${moods.length} mood entries`);

    console.log('\n🎉 Seeding complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Demo Account Credentials:');
    console.log('  Email:    demo@taskflowx.com');
    console.log('  Password: demo1234');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
