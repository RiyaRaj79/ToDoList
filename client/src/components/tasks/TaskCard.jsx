import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Pencil, Trash2, ChevronDown, ChevronUp, Flag, Tag, Clock } from 'lucide-react';
import { useState } from 'react';
import { PRIORITY_CONFIG, dueDateLabel, relativeDate, truncate } from '../../utils/helpers';

export default function TaskCard({ task, index, onToggle, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const dueInfo = dueDateLabel(task.dueDate);
  const subtasksDone = task.subtasks?.filter((s) => s.completed).length || 0;
  const subtasksTotal = task.subtasks?.length || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className={`group glass-card p-4 hover:translate-y-[-1px] transition-all duration-200 ${task.completed ? 'opacity-60' : ''}`}
      style={{ borderLeft: `3px solid ${cfg.color}40` }}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={task.completed ? 'done' : 'pending'}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {task.completed
                ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                : <Circle className="w-5 h-5 text-slate-500 hover:text-brand-400" />
              }
            </motion.div>
          </AnimatePresence>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <span className={`text-sm font-medium flex-1 min-w-0 ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
              {task.title}
            </span>
            {/* Priority badge */}
            <span
              className="badge text-xs flex-shrink-0"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
            >
              <Flag className="w-2.5 h-2.5" />
              {cfg.label}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {expanded ? task.description : truncate(task.description, 120)}
              {task.description.length > 120 && (
                <button onClick={() => setExpanded(!expanded)} className="text-brand-400 ml-1 hover:underline">
                  {expanded ? 'less' : 'more'}
                </button>
              )}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {dueInfo && (
              <span className={`text-xs flex items-center gap-1 ${dueInfo.color}`}>
                <Clock className="w-3 h-3" />
                {dueInfo.label}
              </span>
            )}
            {task.category && task.category !== 'General' && (
              <span className="text-xs flex items-center gap-1 text-slate-500">
                <Tag className="w-3 h-3" />
                {task.category}
              </span>
            )}
            {subtasksTotal > 0 && (
              <span className="text-xs text-slate-500">
                {subtasksDone}/{subtasksTotal} subtasks
              </span>
            )}
            {task.tags?.length > 0 && (
              <div className="flex gap-1">
                {task.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-slate-500 border border-white/5">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Subtask progress */}
          {subtasksTotal > 0 && (
            <div className="mt-2">
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{ width: `${(subtasksDone / subtasksTotal) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Color indicator */}
      {task.color && task.color !== '#6366f1' && (
        <div className="absolute right-3 top-3 w-2 h-2 rounded-full" style={{ background: task.color }} />
      )}
    </motion.div>
  );
}
