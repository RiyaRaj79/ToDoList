import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCircle, AlertCircle, Zap, Flame, Trophy } from 'lucide-react';
import { useTaskStore, useAuthStore } from '../../store';
import { formatDistanceToNow, parseISO } from 'date-fns';

function buildNotifications(tasks, user) {
  const notifs = [];

  // Overdue tasks
  const overdue = tasks.filter(
    (t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
  );
  overdue.slice(0, 2).forEach((t) => {
    notifs.push({
      id: `overdue-${t._id}`,
      type: 'warning',
      icon: AlertCircle,
      color: '#f43f5e',
      title: 'Task overdue',
      message: t.title,
      time: t.dueDate,
    });
  });

  // Tasks due today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueToday = tasks.filter((t) => {
    if (!t.dueDate || t.completed) return false;
    const d = new Date(t.dueDate);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
  dueToday.slice(0, 2).forEach((t) => {
    notifs.push({
      id: `today-${t._id}`,
      type: 'info',
      icon: Bell,
      color: '#f59e0b',
      title: 'Due today',
      message: t.title,
      time: new Date().toISOString(),
    });
  });

  // Recently completed
  const recentlyDone = tasks
    .filter((t) => t.completed && t.completedAt)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 2);
  recentlyDone.forEach((t) => {
    notifs.push({
      id: `done-${t._id}`,
      type: 'success',
      icon: CheckCircle,
      color: '#10b981',
      title: 'Task completed!',
      message: t.title,
      time: t.completedAt,
    });
  });

  // Streak notification
  if ((user?.streak || 0) >= 3) {
    notifs.push({
      id: 'streak',
      type: 'achievement',
      icon: Flame,
      color: '#f59e0b',
      title: `${user.streak}-day streak! 🔥`,
      message: 'Keep the momentum going!',
      time: new Date().toISOString(),
    });
  }

  // Level notification
  if ((user?.level || 0) >= 5) {
    notifs.push({
      id: 'level',
      type: 'achievement',
      icon: Zap,
      color: '#6366f1',
      title: `Level ${user.level} — ${user.levelTitle || 'Expert'}`,
      message: "You're making amazing progress!",
      time: new Date().toISOString(),
    });
  }

  return notifs.slice(0, 6);
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(new Set());
  const panelRef = useRef(null);
  const { tasks } = useTaskStore();
  const { user } = useAuthStore();

  const notifs = buildNotifications(tasks, user);
  const unreadCount = notifs.filter((n) => !read.has(n.id)).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const markAllRead = () => setRead(new Set(notifs.map((n) => n.id)));

  const typeStyles = {
    warning: 'bg-rose-500/10 border-rose-500/20',
    info: 'bg-amber-500/10 border-amber-500/20',
    success: 'bg-emerald-500/10 border-emerald-500/20',
    achievement: 'bg-brand-500/10 border-brand-500/20',
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        id="notification-bell"
        onClick={() => { setOpen(!open); if (!open) markAllRead(); }}
        className="relative p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 glass-card overflow-hidden z-50"
            style={{ background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              {notifs.length > 0 && (
                <button onClick={markAllRead} className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1">
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-slate-500">
                  <Trophy className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                notifs.map((n) => {
                  const Icon = n.icon;
                  const isRead = read.has(n.id);
                  return (
                    <div
                      key={n.id}
                      className={`flex gap-3 p-3 mx-2 my-1 rounded-xl border transition-all ${typeStyles[n.type]} ${isRead ? 'opacity-50' : ''}`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" style={{ color: n.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white">{n.title}</p>
                        <p className="text-xs text-slate-400 truncate">{n.message}</p>
                        {n.time && (
                          <p className="text-xs text-slate-600 mt-0.5">
                            {formatDistanceToNow(typeof n.time === 'string' ? parseISO(n.time) : n.time, { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifs.length > 0 && (
              <div className="p-2 border-t border-white/5 text-center">
                <p className="text-xs text-slate-600">{notifs.length} notification{notifs.length !== 1 ? 's' : ''}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
