import { useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { AnimatePresence, motion } from 'framer-motion';
import { useTaskStore, useUIStore } from '../store';
import { PRIORITY_CONFIG } from '../utils/helpers';
import TaskForm from '../components/tasks/TaskForm';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { 'en-US': enUS },
});

export default function CalendarPage() {
  const { tasks } = useTaskStore();
  const { editingTask, setEditingTask, activeModal, setActiveModal } = useUIStore();
  const [selectedTask, setSelectedTask] = useState(null);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState('month');

  // Convert tasks to calendar events
  const events = tasks
    .filter((t) => t.dueDate)
    .map((task) => {
      const cfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
      return {
        id: task._id,
        title: task.title,
        start: new Date(task.dueDate),
        end: new Date(task.dueDate),
        resource: task,
        allDay: true,
        style: { backgroundColor: task.completed ? '#10b981' : cfg.color },
      };
    });

  const eventStyleGetter = (event) => {
    const task = event.resource;
    const cfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
    return {
      style: {
        backgroundColor: task.completed ? 'rgba(16,185,129,0.7)' : `${cfg.color}cc`,
        border: 'none',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '11px',
        padding: '2px 6px',
        textDecoration: task.completed ? 'line-through' : 'none',
        opacity: task.completed ? 0.7 : 1,
      },
    };
  };

  const handleSelectEvent = (event) => setSelectedTask(event.resource);
  const handleSelectSlot = ({ start }) => {
    const dateStr = start.toISOString().split('T')[0];
    setEditingTask({ dueDate: dateStr });
  };

  return (
    <div className="p-4 md:p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white">Calendar</h2>
          <p className="text-sm text-slate-400">Click a date to add a task, click an event to view it</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-rose-500" /> Critical</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-500" /> High</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-500" /> Medium</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Done</div>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 min-h-0">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          date={date}
          onNavigate={setDate}
          view={view}
          onView={setView}
          eventPropGetter={eventStyleGetter}
          style={{ height: '100%' }}
          popup
        />
      </div>

      {/* Task detail popup */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={(e) => e.target === e.currentTarget && setSelectedTask(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-5 max-w-sm w-full"
              style={{ background: 'rgba(15,23,42,0.98)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-white">{selectedTask.title}</h3>
                <button onClick={() => setSelectedTask(null)} className="text-slate-500 hover:text-white">✕</button>
              </div>
              {selectedTask.description && <p className="text-sm text-slate-400 mb-3">{selectedTask.description}</p>}
              <div className="flex flex-wrap gap-2 text-xs">
                {selectedTask.priority && (
                  <span className="badge" style={{ background: PRIORITY_CONFIG[selectedTask.priority]?.bg, color: PRIORITY_CONFIG[selectedTask.priority]?.color }}>
                    {PRIORITY_CONFIG[selectedTask.priority]?.label}
                  </span>
                )}
                {selectedTask.category && <span className="badge bg-white/5 text-slate-400">{selectedTask.category}</span>}
                <span className={`badge ${selectedTask.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {selectedTask.completed ? '✓ Done' : '○ Pending'}
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => { setEditingTask(selectedTask); setSelectedTask(null); }} className="btn-secondary flex-1 btn-sm">Edit</button>
                <button onClick={() => setSelectedTask(null)} className="btn-ghost flex-1 btn-sm">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Form */}
      <AnimatePresence>
        {(activeModal === 'task-form' || editingTask !== undefined) && (
          <TaskForm task={editingTask} onClose={() => { setActiveModal(null); setEditingTask(undefined); }} />
        )}
      </AnimatePresence>
    </div>
  );
}
