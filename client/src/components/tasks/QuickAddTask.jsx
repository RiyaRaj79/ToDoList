import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, Flag, Calendar } from 'lucide-react';
import { taskAPI, aiAPI } from '../../services/api';
import { useTaskStore, useAuthStore } from '../../store';
import { PRIORITY_CONFIG } from '../../utils/helpers';
import toast from 'react-hot-toast';

const DEMO_RESPONSES = [
  { priority: 'high', subtasks: [{ title: 'Plan outline', completed: false }, { title: 'Draft content', completed: false }, { title: 'Review and edit', completed: false }] },
  { priority: 'medium', subtasks: [{ title: 'Research topic', completed: false }, { title: 'Execute task', completed: false }, { title: 'Verify results', completed: false }] },
];

export default function QuickAddTask() {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const inputRef = useRef(null);
  const { addTask } = useTaskStore();
  const { accessToken } = useAuthStore();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === 'Escape') {
      setTitle('');
      setShowOptions(false);
      setSuggestion(null);
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setSuggestion(null);
    // Show options if text is substantial
    if (e.target.value.length > 3) setShowOptions(true);
  };

  const handleAISuggest = async () => {
    if (!title.trim() || isSuggesting) return;
    setIsSuggesting(true);
    try {
      if (accessToken === 'demo-token') {
        // Demo mode
        await new Promise(r => setTimeout(r, 600));
        const demo = DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)];
        setSuggestion(demo);
        setPriority(demo.priority);
        toast.success('AI suggestion ready! ✨');
      } else {
        const res = await aiAPI.suggestPriority(title, dueDate || null);
        const { priority: sugP } = res.data.data;
        setSuggestion({ priority: sugP });
        setPriority(sugP);
        toast.success(`AI suggests: ${sugP} priority ✨`);
      }
    } catch {
      toast.error('AI suggestion failed');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAdd = async () => {
    if (!title.trim() || isAdding) return;
    setIsAdding(true);
    try {
      const payload = {
        title: title.trim(),
        priority,
        dueDate: dueDate || undefined,
        status: 'todo',
        kanbanColumn: 'todo',
        category: 'General',
      };

      if (accessToken === 'demo-token') {
        // Demo mode — add locally
        const fakeTask = {
          _id: `demo-${Date.now()}`,
          ...payload,
          completed: false,
          createdAt: new Date().toISOString(),
        };
        addTask(fakeTask);
        toast.success('Task added! 📝');
      } else {
        const res = await taskAPI.create(payload);
        addTask(res.data.data.task);
        toast.success('Task added! +10 XP 📝');
      }

      setTitle('');
      setDueDate('');
      setPriority('medium');
      setShowOptions(false);
      setSuggestion(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add task');
    } finally {
      setIsAdding(false);
    }
  };

  const cfg = PRIORITY_CONFIG[priority];

  return (
    <div className="glass-card p-4" style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)' }}>
      {/* Main input row */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleAdd}
          disabled={!title.trim() || isAdding}
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-600 hover:border-brand-500 transition-all disabled:opacity-40"
        >
          <Plus className="w-4 h-4 text-slate-500 hover:text-brand-400" />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={handleTitleChange}
          onKeyDown={handleKeyDown}
          placeholder="Quick add task... (press Enter)"
          className="flex-1 bg-transparent text-white placeholder-slate-600 text-sm outline-none"
        />
        {title.length > 3 && (
          <button
            onClick={handleAISuggest}
            disabled={isSuggesting}
            className="flex-shrink-0 flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
            title="AI suggestions"
          >
            {isSuggesting ? (
              <div className="w-3 h-3 border border-brand-400/40 border-t-brand-400 rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">AI</span>
          </button>
        )}
      </div>

      {/* Expandable options */}
      <AnimatePresence>
        {showOptions && title.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/5">
              {/* Priority pills */}
              <div className="flex gap-1">
                {Object.entries(PRIORITY_CONFIG).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => setPriority(key)}
                    className="px-2 py-0.5 rounded-full text-xs font-medium border transition-all"
                    style={{
                      background: priority === key ? p.bg : 'transparent',
                      color: priority === key ? p.color : '#475569',
                      borderColor: priority === key ? p.border : 'transparent',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Due date */}
              <div className="flex items-center gap-1 ml-auto">
                <Calendar className="w-3 h-3 text-slate-500" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="text-xs bg-transparent text-slate-400 outline-none cursor-pointer"
                />
              </div>

              {/* Add button */}
              <button
                onClick={handleAdd}
                disabled={isAdding}
                className="ml-2 px-3 py-1 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium transition-all flex items-center gap-1"
              >
                {isAdding ? (
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-3 h-3" /> Add
                  </>
                )}
              </button>
            </div>

            {/* AI suggestion banner */}
            {suggestion && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-brand-500/8 border border-brand-500/15"
              >
                <Sparkles className="w-3 h-3 text-brand-400 flex-shrink-0" />
                <span className="text-xs text-slate-400">
                  AI suggests <span className="font-semibold" style={{ color: PRIORITY_CONFIG[suggestion.priority]?.color }}>{suggestion.priority}</span> priority
                </span>
                <button
                  onClick={() => setPriority(suggestion.priority)}
                  className="text-xs text-brand-400 ml-auto hover:underline"
                >
                  Apply
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
