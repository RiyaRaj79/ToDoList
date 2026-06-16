import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, Search, SortAsc, Download, Mic, MicOff, Sparkles, CheckCheck } from 'lucide-react';
import { taskAPI, aiAPI } from '../services/api';
import { useTaskStore, useUIStore, useAuthStore } from '../store';
import { PRIORITY_CONFIG, dueDateLabel, exportTasksToPDF, relativeDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';

const PRIORITIES = ['critical', 'high', 'medium', 'low'];
const STATUSES = ['todo', 'inprogress', 'review', 'done'];

export default function Tasks() {
  const { tasks, getFilteredTasks, filters, setFilters, setTasks, updateTask, removeTask } = useTaskStore();
  const { activeModal, setActiveModal, editingTask, setEditingTask } = useUIStore();
  const { user } = useAuthStore();
  const [showFilters, setShowFilters] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const recognitionRef = useRef(null);

  const filteredTasks = getFilteredTasks();
  const completedCount = filteredTasks.filter((t) => t.completed).length;
  const pendingCount = filteredTasks.filter((t) => !t.completed).length;

  // Voice to task
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice recognition not supported in this browser');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setVoiceText(text);
      setIsListening(false);
      // Open form with pre-filled title
      setEditingTask({ title: text });
      toast.success(`Voice captured: "${text}"`);
    };
    recognition.onerror = () => { setIsListening(false); toast.error('Voice recognition failed'); };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleToggleComplete = async (taskId) => {
    try {
      const res = await taskAPI.toggleComplete(taskId);
      const { task, xpGained, leveledUp, newAchievements } = res.data.data;
      updateTask(taskId, task);
      if (task.completed) {
        toast.success(`+${xpGained} XP earned! 🎉`);
        if (leveledUp) setTimeout(() => toast.success(`🎊 Level Up! You're now Level ${task.level}!`, { duration: 5000 }), 500);
        if (newAchievements?.length > 0) {
          newAchievements.forEach((a) => setTimeout(() => toast.success(`🏆 Achievement: ${a.name}!`, { duration: 5000 }), 1000));
        }
      }
    } catch (err) { toast.error('Failed to update task'); }
  };

  const handleDelete = async (taskId) => {
    try {
      await taskAPI.delete(taskId);
      removeTask(taskId);
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete task'); }
  };

  const handleEdit = (task) => setEditingTask(task);

  const handleExportPDF = async () => {
    try {
      await exportTasksToPDF(filteredTasks, user?.name || 'User');
      toast.success('Tasks exported to PDF! 📄');
    } catch { toast.error('Export failed'); }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">My Tasks</h2>
          <p className="text-sm text-slate-400">
            {pendingCount} pending · {completedCount} completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportPDF} className="btn-secondary btn-sm" title="Export to PDF">
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={isListening ? stopVoice : startVoiceRecognition}
            className={`btn-sm ${isListening ? 'btn-danger animate-pulse' : 'btn-secondary'}`}
            title="Voice to task"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button onClick={() => setShowFilters(!showFilters)} className={`btn-sm ${showFilters ? 'btn-primary' : 'btn-secondary'}`}>
            <Filter className="w-4 h-4" /> Filters
          </button>
          <button onClick={() => setEditingTask(null)} className="btn-primary btn-sm">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search tasks, descriptions, tags..."
          value={filters.search || ''}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="input pl-10"
        />
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="glass-card p-4">
              <div className="flex flex-wrap gap-3">
                {/* Priority filter */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-slate-500 font-medium">Priority</span>
                  <div className="flex gap-1.5">
                    <button onClick={() => setFilters({ priority: '' })} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${!filters.priority ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-white/5 text-slate-400 border border-white/10'}`}>All</button>
                    {PRIORITIES.map((p) => {
                      const cfg = PRIORITY_CONFIG[p];
                      return (
                        <button key={p} onClick={() => setFilters({ priority: filters.priority === p ? '' : p })}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all border"
                          style={{ background: filters.priority === p ? `${cfg.color}20` : 'rgba(255,255,255,0.05)', color: filters.priority === p ? cfg.color : '#64748b', borderColor: filters.priority === p ? `${cfg.color}40` : 'rgba(255,255,255,0.08)' }}>
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status filter */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-slate-500 font-medium">Status</span>
                  <div className="flex gap-1.5">
                    <button onClick={() => setFilters({ completed: '' })} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${filters.completed === '' ? 'bg-brand-500/20 text-brand-400 border-brand-500/30' : 'bg-white/5 text-slate-400 border-white/10'}`}>All</button>
                    <button onClick={() => setFilters({ completed: 'false' })} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${filters.completed === 'false' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-white/5 text-slate-400 border-white/10'}`}>Pending</button>
                    <button onClick={() => setFilters({ completed: 'true' })} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${filters.completed === 'true' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-slate-400 border-white/10'}`}>Done</button>
                  </div>
                </div>

                {/* Sort */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-slate-500 font-medium">Sort By</span>
                  <div className="flex gap-1.5">
                    {[{ val: 'createdAt', label: 'Created' }, { val: 'dueDate', label: 'Due Date' }, { val: 'priority', label: 'Priority' }].map(({ val, label }) => (
                      <button key={val} onClick={() => setFilters({ sortBy: val, sortOrder: filters.sortBy === val && filters.sortOrder === 'desc' ? 'asc' : 'desc' })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border flex items-center gap-1 ${filters.sortBy === val ? 'bg-brand-500/20 text-brand-400 border-brand-500/30' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                        {label}
                        {filters.sortBy === val && <SortAsc className={`w-3 h-3 transition-transform ${filters.sortOrder === 'asc' ? 'rotate-180' : ''}`} />}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={() => useTaskStore.getState().resetFilters()} className="btn-ghost btn-sm self-end text-slate-500">Reset</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task list */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {filteredTasks.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-slate-500">
              <CheckCheck className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium mb-1">No tasks found</p>
              <p className="text-sm">Add a new task or adjust your filters</p>
              <button onClick={() => setEditingTask(null)} className="btn-primary mt-6">
                <Plus className="w-4 h-4" /> Create First Task
              </button>
            </motion.div>
          ) : (
            filteredTasks.map((task, i) => (
              <TaskCard
                key={task._id}
                task={task}
                index={i}
                onToggle={() => handleToggleComplete(task._id)}
                onEdit={() => handleEdit(task)}
                onDelete={() => handleDelete(task._id)}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Task Form Modal */}
      <AnimatePresence>
        {(activeModal === 'task-form' || editingTask !== undefined) && (
          <TaskForm
            task={editingTask}
            onClose={() => { setActiveModal(null); setEditingTask(undefined); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
