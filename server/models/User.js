const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const achievementSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  icon: String,
  unlockedAt: Date,
});

const settingsSchema = new mongoose.Schema({
  theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
  notifications: { type: Boolean, default: true },
  pomodoroWork: { type: Number, default: 25 },
  pomodoroBreak: { type: Number, default: 5 },
  dailySummaryTime: { type: String, default: '08:00' },
  weekStartDay: { type: String, enum: ['sunday', 'monday'], default: 'monday' },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    // Gamification
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivityDate: { type: Date },
    totalTasksCompleted: { type: Number, default: 0 },
    achievements: [achievementSchema],
    settings: { type: settingsSchema, default: () => ({}) },
    // Productivity stats
    weeklyXP: { type: Number, default: 0 },
    monthlyXP: { type: Number, default: 0 },
    focusTimeToday: { type: Number, default: 0 }, // minutes
    totalFocusTime: { type: Number, default: 0 }, // minutes
    pomodoroSessions: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for level title
userSchema.virtual('levelTitle').get(function () {
  const titles = [
    'Novice', 'Apprentice', 'Productive', 'Focused', 'Efficient',
    'Expert', 'Master', 'Grandmaster', 'Legend', 'Transcendent',
  ];
  return titles[Math.min(this.level - 1, titles.length - 1)];
});

// Virtual for XP needed for next level
userSchema.virtual('xpToNextLevel').get(function () {
  return this.level * 100;
});

// Virtual for XP progress in current level
userSchema.virtual('xpProgress').get(function () {
  const prevLevelXP = ((this.level - 1) * (this.level - 1) * 50);
  const nextLevelXP = (this.level * this.level * 50);
  const progress = ((this.xp - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;
  return Math.min(Math.max(progress, 0), 100);
});

// Pre-save: hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method: compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method: add XP and handle level ups
userSchema.methods.addXP = async function (amount) {
  this.xp += amount;
  this.weeklyXP += amount;
  this.monthlyXP += amount;

  // Level up check: level = floor(sqrt(xp/50)) + 1
  const newLevel = Math.floor(Math.sqrt(this.xp / 50)) + 1;
  const leveledUp = newLevel > this.level;
  this.level = newLevel;

  await this.save();
  return { leveledUp, newLevel, xpGained: amount };
};

// Method: update streak
userSchema.methods.updateStreak = async function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActivity = this.lastActivityDate ? new Date(this.lastActivityDate) : null;
  if (lastActivity) {
    lastActivity.setHours(0, 0, 0, 0);
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (!lastActivity) {
    this.streak = 1;
  } else if (lastActivity.getTime() === yesterday.getTime()) {
    this.streak += 1;
  } else if (lastActivity.getTime() === today.getTime()) {
    // Already updated today
    return this.streak;
  } else {
    this.streak = 1;
  }

  if (this.streak > this.longestStreak) {
    this.longestStreak = this.streak;
  }
  this.lastActivityDate = new Date();
  await this.save();
  return this.streak;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
