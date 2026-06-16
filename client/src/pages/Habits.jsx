import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle, Circle, Flame, Trash2, Calendar, X } from 'lucide-react';
import { habitAPI } from '../services/api';
import { useHabitStore } from '../store';
import toast from 'react-hot-toast';

const ICONS = ['⚡', '🏃', '📚', '💧', '🧘', '🎯', '💪', '🥗', '😴', '🎨', '🎵', '🧹'];
const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#f97316', '#ef4444'];
const FREQUENCIES = ['daily', 'weekdays', 'weekends', 'weekly'];

function HabitCard({ habit, onComplete, onDelete }) {
  const doneToday = habit.entries?.some((e) => {
    const d = new Date(e.date);
    d.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime() && e.completed;
  });

  // Last 7 days heatmap
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);
    const done = habit.entries?.some((e) => {
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === day.getTime() && e.completed;
    });
    last7.push({ day: day.toLocaleDateString('en', { weekday: 'narrow' }), done });
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card p-4 hover:border-white/20 transition-all group"
      style={{ borderLeft: `3px solid ${habit.color}40` }}
    >
      <div className="flex items-start gap-3">
        {/* Icon & checkbox */}
        <button
          onClick={onComplete}
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all hover:scale-110 ${doneToday ? 'ring-2' : ''}`}
          style={{ background: doneToday ? `${habit.color}25` : 'rgba(255,255,255,0.05)', ringColor: habit.color }}
          disabled={doneToday}
          title={doneToday ? 'Completed today!' : 'Mark as done'}
        >
          {doneToday ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              ✅
            </motion.div>
          ) : (
            <span>{habit.icon}</span>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-white text-sm">{habit.name}</h4>
            <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-rose-400 text-slate-600 transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          {habit.description && <p className="text-xs text-slate-500 mt-0.5">{habit.description}</p>}

          {/* Streak + frequency */}
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs" style={{ color: habit.color }}>
              <Flame className="w-3 h-3" />
              {habit.streak} day streak
            </span>
            <span className="text-xs text-slate-600 capitalize">{habit.frequency}</span>
            <span className="text-xs text-slate-600">{habit.totalCompletions} total</span>
          </div>

          {/* 7-day heatmap */}
          <div className="flex gap-1 mt-3">
            {last7.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="w-5 h-5 rounded transition-all"
                  style={{ background: d.done ? habit.color : 'rgba(255,255,255,0.05)' }}
                />
                <span className="text-xs text-slate-600">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HabitForm({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', icon: '⚡', color: '#6366f1', frequency: 'daily' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Habit name required'); return; }
    setIsLoading(true);
    try {
      const res = await habitAPI.create(form);
      onCreated(res.data.data.habit);
      toast.success('Habit created! 🎯');
      onClose();
    } catch { toast.error('Failed to create habit'); }
    finally { setIsLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card p-6 w-full max-w-md"
        style={{ background: 'rgba(15,23,42,0.98)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-white">New Habit</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">Habit Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Morning Run" className="input" autoFocus />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">Description</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What does this habit mean to you?" className="input" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((icon) => (
                <button key={icon} type="button" onClick={() => setForm({ ...form, icon })}
                  className={`w-9 h-9 rounded-xl text-lg transition-all hover:scale-110 ${form.icon === icon ? 'bg-brand-500/20 ring-2 ring-brand-500' : 'bg-white/5'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-2">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                  className="w-7 h-7 rounded-full transition-all hover:scale-110"
                  style={{ background: c, outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: '2px' }} />
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">Frequency</label>
            <div className="flex gap-2 flex-wrap">
              {FREQUENCIES.map((f) => (
                <button key={f} type="button" onClick={() => setForm({ ...form, frequency: f })}
                  className={`px-3 py-1.5 rounded-xl text-xs capitalize border transition-all ${form.frequency === f ? 'bg-brand-500/20 text-brand-400 border-brand-500/30' : 'bg-white/5 text-slate-400 border-white/8'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Habit'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function Habits() {
  const { habits, setHabits, addHabit, updateHabit, removeHabit, isLoading, setLoading } = useHabitStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await habitAPI.getAll();
        setHabits(res.data.data.habits);
      } catch { console.error('Failed to load habits'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleComplete = async (habit) => {
    try {
      const res = await habitAPI.complete(habit._id);
      updateHabit(habit._id, res.data.data.habit);
      toast.success('Habit completed! +15 XP 🔥');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Already completed today');
    }
  };

  const handleDelete = async (habitId) => {
    try {
      await habitAPI.delete(habitId);
      removeHabit(habitId);
      toast.success('Habit removed');
    } catch { toast.error('Failed to delete'); }
  };

  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
  const doneToday = habits.filter((h) => h.entries?.some((e) => {
    const d = new Date(e.date); d.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  })).length;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Habit Tracker</h2>
          <p className="text-sm text-slate-400">{doneToday}/{habits.length} completed today</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Habit
        </button>
      </div>

      {/* Stats */}
      {habits.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Active Habits', value: habits.length, icon: '🎯' },
            { label: 'Done Today', value: doneToday, icon: '✅' },
            { label: 'Total Streaks', value: totalStreak, icon: '🔥' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="glass-card p-3 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-xl font-bold text-white">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Habit list */}
      <div className="space-y-3">
        <AnimatePresence>
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="glass-card p-4 h-24 shimmer" />
            ))
          ) : habits.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-slate-500">
              <span className="text-5xl mb-4">🌱</span>
              <p className="text-lg font-medium mb-1">No habits yet</p>
              <p className="text-sm mb-6">Start building positive habits today!</p>
              <button onClick={() => setShowForm(true)} className="btn-primary">
                <Plus className="w-4 h-4" /> Create First Habit
              </button>
            </motion.div>
          ) : (
            habits.map((habit) => (
              <HabitCard
                key={habit._id}
                habit={habit}
                onComplete={() => handleComplete(habit)}
                onDelete={() => handleDelete(habit._id)}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <HabitForm
            onClose={() => setShowForm(false)}
            onCreated={(habit) => { addHabit(habit); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
