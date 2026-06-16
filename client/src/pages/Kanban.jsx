import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Flag, Clock, CheckCircle2 } from 'lucide-react';
import { useTaskStore, useUIStore } from '../store';
import { taskAPI } from '../services/api';
import { PRIORITY_CONFIG, STATUS_CONFIG, dueDateLabel } from '../utils/helpers';
import TaskForm from '../components/tasks/TaskForm';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
  { id: 'inprogress', title: 'In Progress', color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
  { id: 'review', title: 'Review', color: '#a855f7', bg: 'rgba(168,85,247,0.08)' },
  { id: 'done', title: 'Done', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
];

function KanbanTaskCard({ task, isDragging }) {
  const cfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const dueInfo = dueDateLabel(task.dueDate);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="glass-card p-3 cursor-grab active:cursor-grabbing select-none hover:border-white/20 transition-all"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-3.5 h-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-tight ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="badge text-xs" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
              <Flag className="w-2.5 h-2.5" />{cfg.label}
            </span>
            {dueInfo && <span className={`text-xs ${dueInfo.color}`}>{dueInfo.label}</span>}
          </div>
          {task.subtasks?.length > 0 && (
            <div className="mt-2">
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full"
                  style={{ width: `${(task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 mt-0.5 block">
                {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ column, tasks, onAddTask }) {
  return (
    <div className="flex flex-col min-w-72 max-w-72 flex-shrink-0">
      {/* Column header */}
      <div
        className="flex items-center justify-between p-3 rounded-t-2xl border-b"
        style={{ background: column.bg, borderColor: `${column.color}20` }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: column.color }} />
          <span className="font-semibold text-sm text-white">{column.title}</span>
          <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{tasks.length}</span>
        </div>
        <button onClick={onAddTask} className="p-1 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tasks */}
      <div
        className="flex-1 p-3 space-y-2 min-h-64 rounded-b-2xl"
        style={{ background: `${column.bg}`, border: `1px solid ${column.color}10`, borderTop: 'none' }}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanTaskCard key={task._id} task={task} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-600 text-xs">
            <CheckCircle2 className="w-8 h-8 mb-2 opacity-20" />
            <span>Drop tasks here</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Kanban() {
  const { tasks, getTasksByKanban, updateTask } = useTaskStore();
  const { editingTask, setEditingTask, activeModal, setActiveModal } = useUIStore();
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [newTaskColumn, setNewTaskColumn] = useState(null);

  const kanbanTasks = getTasksByKanban();
  const allTasks = [...tasks];
  const activeTask = activeTaskId ? allTasks.find((t) => t._id === activeTaskId) : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const findColumn = (taskId) => {
    for (const col of COLUMNS) {
      if (kanbanTasks[col.id]?.some((t) => t._id === taskId)) return col.id;
    }
    return null;
  };

  const handleDragStart = ({ active }) => setActiveTaskId(active.id);

  const handleDragOver = ({ active, over }) => {
    if (!over) return;
    const activeCol = findColumn(active.id);
    const overCol = COLUMNS.find((c) => c.id === over.id)?.id || findColumn(over.id);
    if (!activeCol || !overCol || activeCol === overCol) return;
    updateTask(active.id, { kanbanColumn: overCol, status: overCol });
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTaskId(null);
    if (!over) return;
    const overCol = COLUMNS.find((c) => c.id === over.id)?.id || findColumn(over.id);
    if (!overCol) return;

    const task = allTasks.find((t) => t._id === active.id);
    if (!task || task.kanbanColumn === overCol) return;

    updateTask(active.id, { kanbanColumn: overCol, status: overCol });
    try {
      await taskAPI.update(active.id, { kanbanColumn: overCol, status: overCol });
    } catch { toast.error('Failed to move task'); }
  };

  const handleAddInColumn = (columnId) => {
    setNewTaskColumn(columnId);
    setEditingTask({ kanbanColumn: columnId, status: columnId });
  };

  return (
    <div className="p-4 md:p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white">Kanban Board</h2>
          <p className="text-sm text-slate-400">Drag tasks between columns to update status</p>
        </div>
        <button onClick={() => setEditingTask(null)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Kanban board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={kanbanTasks[col.id] || []}
              onAddTask={() => handleAddInColumn(col.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="glass-card p-3 shadow-2xl rotate-2 opacity-90 max-w-72">
              <p className="text-sm font-medium text-white">{activeTask.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Task Form */}
      <AnimatePresence>
        {(activeModal === 'task-form' || editingTask !== undefined) && (
          <TaskForm
            task={editingTask}
            onClose={() => { setActiveModal(null); setEditingTask(undefined); setNewTaskColumn(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
