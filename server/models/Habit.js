const mongoose = require('mongoose');

const habitEntrySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  completed: { type: Boolean, default: true },
  note: { type: String, default: '' },
});

const habitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true,
      maxlength: [100, 'Habit name too long'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description too long'],
      default: '',
    },
    icon: { type: String, default: '⚡' },
    color: { type: String, default: '#6366f1' },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'weekdays', 'weekends', 'custom'],
      default: 'daily',
    },
    targetDaysPerWeek: { type: Number, min: 1, max: 7, default: 7 },
    entries: [habitEntrySchema],
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    totalCompletions: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

habitSchema.index({ userId: 1, active: 1 });

// Method: check if completed today
habitSchema.methods.isCompletedToday = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return this.entries.some((entry) => {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate.getTime() === today.getTime() && entry.completed;
  });
};

const Habit = mongoose.model('Habit', habitSchema);
module.exports = Habit;
