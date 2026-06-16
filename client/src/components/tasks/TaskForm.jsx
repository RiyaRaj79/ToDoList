import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Plus, Trash2, Flag, Tag, Calendar, Clock, Repeat, Palette } from 'lucide-react';
import { taskAPI, aiAPI } from '../../services/api';
import { useTaskStore } from '../../store';
import { PRIORITY_CONFIG } from '../../utils/helpers';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#f97316', '#ef4444'];
const CATEGORIES = ['Work', 'Personal', 'Health', 'Learning', 'Finance', 'Family', 'Creative', 'General'];

export default function TaskForm({ task, onClose }) {
  const { addTask, updateTask } = useTaskStore();
  const isEditing = !!task?._id;

  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    category: task?.category || 'General',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    color: task?.color || '#6366f1',
    tags: task?.tags?.join(', ') || '',
    estimatedTime: task?.estimatedTime || '',
    status: task?.status || 'todo',
    kanbanColumn: task?.kanbanColumn || 'todo',
    recurring: task?.recurring || { enabled: false, frequency: 'daily' },
    subtasks: task?.subtasks || [],
    notes: task?.notes || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [suggestedPriority, setSuggestedPriority] = useState(null);
  const [tab, setTab] = useState('basic'); // 'basic' | 'advanced' | 'subtasks'

  // AI priority suggestion on title change
  useEffect(() => {
    if (!form.title || form.title.length < 4) return;
    const timer = setTimeout(async () => {
      try {
        const res = await aiAPI.suggestPriority(form.title, form.dueDate || null);
        setSuggestedPriority(res.data.data);
      } catch {}
    }, 800);
    return () => clearTimeout(timer);
  }, [form.title, form.dueDate]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleGenerateSubtasks = async () => {
    if (!form.title) { toast.error('Enter a task title first'); return; }
    setIsGeneratingSubtasks(true);
    try {
      const res = await aiAPI.generateSubtasks(form.title, form.description);
      const subtasks = res.data.data.subtasks;
      setForm((prev) => ({ ...prev, subtasks }));
      toast.success(`Generated ${subtasks.length} subtasks! ✨`);
    } catch { toast.error('Failed to generate subtasks'); }
    finally { setIsGeneratingSubtasks(false); }
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setForm((prev) => ({ ...prev, subtasks: [...prev.subtasks, { title: newSubtask.trim(), completed: false }] }));
    setNewSubtask('');
  };

  const removeSubtask = (i) => setForm((prev) => ({ ...prev, subtasks: prev.subtasks.filter((_, idx) => idx !== i) }));
  const toggleSubtask = (i) => setForm((prev) => ({
    ...prev,
    subtasks: prev.subtasks.map((s, idx) => idx === i ? { ...s, completed: !s.completed } : s),
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Task title is required'); return; }
    setIsLoading(true);

    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      dueDate: form.dueDate || undefined,
      estimatedTime: form.estimatedTime ? Number(form.estimatedTime) : 0,
    };

    try {
      if (isEditing) {
        const res = await taskAPI.update(task._id, payload);
        updateTask(task._id, res.data.data.task);
        toast.success('Task updated! ✅');
      } else {
        const res = await taskAPI.create(payload);
        addTask(res.data.data.task);
        toast.success('Task created! 📝');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto glass-card"
        style={{ background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <div>
            <h3 className="font-bold text-white">{isEditing ? 'Edit Task' : 'New Task'}</h3>
            <p className="text-xs text-slate-500 mt-0.5">AI-powered task creation</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/8">
          {['basic', 'subtasks', 'advanced'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-medium capitalize transition-all ${tab === t ? 'text-brand-400 border-b-2 border-brand-500' : 'text-slate-500 hover:text-white'}`}>
              {t === 'subtasks' ? `Subtasks (${form.subtasks.length})` : t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {tab === 'basic' && (
            <>
              {/* Title */}
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1.5">Task Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="What needs to be done?"
                  className="input"
                  autoFocus
                />
                {/* AI priority suggestion */}
                {suggestedPriority && suggestedPriority.priority !== form.priority && (
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-amber-400">
                    <Sparkles className="w-3 h-3" />
                    AI suggests: <strong>{suggestedPriority.priority}</strong> priority —{' '}
                    <button type="button" onClick={() => handleChange('priority', suggestedPriority.priority)} className="underline">apply</button>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Add details, context, or notes..."
                  rows={3}
                  className="input resize-none"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1.5"><Flag className="w-3 h-3 inline mr-1" />Priority</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                    <button key={key} type="button" onClick={() => handleChange('priority', key)}
                      className="py-2 px-3 rounded-xl text-xs font-medium border transition-all"
                      style={{
                        background: form.priority === key ? cfg.bg : 'rgba(255,255,255,0.04)',
                        color: form.priority === key ? cfg.color : '#64748b',
                        borderColor: form.priority === key ? cfg.border : 'rgba(255,255,255,0.08)',
                      }}>
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category + Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1.5"><Tag className="w-3 h-3 inline mr-1" />Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="input text-sm"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1.5"><Calendar className="w-3 h-3 inline mr-1" />Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    className="input text-sm"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1.5"><Palette className="w-3 h-3 inline mr-1" />Color</label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => handleChange('color', c)}
                      className="w-7 h-7 rounded-full transition-all hover:scale-110"
                      style={{ background: c, outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: '2px' }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'subtasks' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Subtasks</span>
                <button type="button" onClick={handleGenerateSubtasks} disabled={isGeneratingSubtasks}
                  className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors">
                  {isGeneratingSubtasks ? (
                    <div className="w-3 h-3 border border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
                  ) : <Sparkles className="w-3.5 h-3.5" />}
                  AI Generate
                </button>
              </div>

              {/* Add subtask */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                  placeholder="Add a subtask..."
                  className="input flex-1 text-sm"
                />
                <button type="button" onClick={addSubtask} className="btn-primary btn-sm">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Subtask list */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {form.subtasks.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/8">
                    <button type="button" onClick={() => toggleSubtask(i)} className="flex-shrink-0">
                      {s.completed
                        ? <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center"><span className="text-white text-xs">✓</span></div>
                        : <div className="w-4 h-4 rounded-full border-2 border-slate-500" />
                      }
                    </button>
                    <span className={`flex-1 text-sm ${s.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>{s.title}</span>
                    <button type="button" onClick={() => removeSubtask(i)} className="text-slate-600 hover:text-rose-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {form.subtasks.length === 0 && (
                  <p className="text-center text-sm text-slate-600 py-6">
                    No subtasks yet. Add one or use AI Generate!
                  </p>
                )}
              </div>
            </div>
          )}

          {tab === 'advanced' && (
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => handleChange('status', e.target.value)} className="input text-sm">
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              {/* Estimated time */}
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1.5"><Clock className="w-3 h-3 inline mr-1" />Estimated Time (minutes)</label>
                <input type="number" value={form.estimatedTime} onChange={(e) => handleChange('estimatedTime', e.target.value)}
                  placeholder="e.g. 30" className="input" min="0" max="480" />
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1.5">Tags (comma separated)</label>
                <input type="text" value={form.tags} onChange={(e) => handleChange('tags', e.target.value)}
                  placeholder="design, urgent, client" className="input" />
              </div>

              {/* Recurring */}
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-2"><Repeat className="w-3 h-3 inline mr-1" />Recurring Task</label>
                <div className="flex items-center gap-3 mb-2">
                  <button type="button"
                    onClick={() => handleChange('recurring', { ...form.recurring, enabled: !form.recurring.enabled })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form.recurring.enabled ? 'bg-brand-500' : 'bg-white/10'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.recurring.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                  <span className="text-sm text-slate-400">{form.recurring.enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                {form.recurring.enabled && (
                  <select
                    value={form.recurring.frequency}
                    onChange={(e) => handleChange('recurring', { ...form.recurring, frequency: e.target.value })}
                    className="input text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="weekends">Weekends</option>
                  </select>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Extra notes..." rows={3} className="input resize-none" />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2 border-t border-white/8">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (isEditing ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
