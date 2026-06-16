const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema(
  {
    mood: {
      type: Number,
      required: [true, 'Mood value is required'],
      min: [1, 'Mood must be between 1 and 5'],
      max: [5, 'Mood must be between 1 and 5'],
    },
    label: {
      type: String,
      enum: ['terrible', 'bad', 'okay', 'good', 'excellent'],
      default: 'okay',
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note too long'],
      default: '',
    },
    factors: [{ type: String }], // e.g., 'work', 'sleep', 'exercise'
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

moodEntrySchema.index({ userId: 1, date: -1 });

// Auto-set label based on mood value
moodEntrySchema.pre('save', function (next) {
  const labels = ['terrible', 'bad', 'okay', 'good', 'excellent'];
  this.label = labels[this.mood - 1];
  next();
});

const MoodEntry = mongoose.model('MoodEntry', moodEntrySchema);
module.exports = MoodEntry;
