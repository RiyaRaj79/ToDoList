const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  completedAt: Date,
});

const recurringSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'weekdays', 'weekends', 'custom'],
    default: 'daily',
  },
  interval: { type: Number, default: 1 }, // Every N days/weeks/months
  daysOfWeek: [{ type: Number, min: 0, max: 6 }], // 0=Sun, 6=Sat
  endDate: Date,
});

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium',
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
      maxlength: [50, 'Category name too long'],
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    tags: [{ type: String, trim: true }],
    dueDate: {
      type: Date,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['todo', 'inprogress', 'review', 'done'],
      default: 'todo',
    },
    kanbanColumn: {
      type: String,
      enum: ['todo', 'inprogress', 'review', 'done'],
      default: 'todo',
    },
    order: {
      type: Number,
      default: 0,
    },
    subtasks: [subtaskSchema],
    recurring: { type: recurringSchema, default: () => ({}) },
    estimatedTime: { type: Number, default: 0 }, // minutes
    actualTime: { type: Number, default: 0 }, // minutes
    notes: { type: String, default: '' },
    attachments: [{ name: String, url: String, type: String }],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
taskSchema.index({ userId: 1, completed: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, kanbanColumn: 1 });
taskSchema.index({ userId: 1, category: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

// Virtual: is overdue
taskSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate || this.completed) return false;
  return new Date() > new Date(this.dueDate);
});

// Virtual: subtask progress
taskSchema.virtual('subtaskProgress').get(function () {
  if (!this.subtasks || this.subtasks.length === 0) return null;
  const done = this.subtasks.filter((s) => s.completed).length;
  return { done, total: this.subtasks.length, percent: Math.round((done / this.subtasks.length) * 100) };
});

// Pre-save: sync status and completed fields
taskSchema.pre('save', function (next) {
  if (this.isModified('completed')) {
    if (this.completed) {
      this.completedAt = this.completedAt || new Date();
      if (this.status !== 'done') this.status = 'done';
      if (this.kanbanColumn !== 'done') this.kanbanColumn = 'done';
    } else {
      this.completedAt = undefined;
      if (this.status === 'done') this.status = 'todo';
      if (this.kanbanColumn === 'done') this.kanbanColumn = 'todo';
    }
  }
  if (this.isModified('status')) {
    if (this.status === 'done' && !this.completed) {
      this.completed = true;
      this.completedAt = new Date();
    }
    this.kanbanColumn = this.status;
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
