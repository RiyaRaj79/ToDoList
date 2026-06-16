import { format, formatDistanceToNow, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

// Format date for display
export const formatDate = (date, fmt = 'MMM d, yyyy') => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, fmt);
  } catch { return ''; }
};

// Relative date (e.g., "3 days ago")
export const relativeDate = (date) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch { return ''; }
};

// Smart due date label
export const dueDateLabel = (date) => {
  if (!date) return null;
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (isToday(d)) return { label: 'Today', color: 'text-amber-400' };
    if (isTomorrow(d)) return { label: 'Tomorrow', color: 'text-blue-400' };
    if (isPast(d)) return { label: `Overdue · ${formatDate(d, 'MMM d')}`, color: 'text-rose-400' };
    return { label: formatDate(d, 'MMM d'), color: 'text-slate-400' };
  } catch { return null; }
};

// Priority config
export const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: '#f43f5e', bg: 'rgba(244,63,94,0.15)', border: 'rgba(244,63,94,0.3)', dot: '🔴', order: 0 },
  high: { label: 'High', color: '#f97316', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.3)', dot: '🟠', order: 1 },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', dot: '🟡', order: 2 },
  low: { label: 'Low', color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', dot: '🟢', order: 3 },
};

// Status config  
export const STATUS_CONFIG = {
  todo: { label: 'To Do', color: '#94a3b8', icon: '⭕' },
  inprogress: { label: 'In Progress', color: '#6366f1', icon: '🔄' },
  review: { label: 'Review', color: '#a855f7', icon: '👁️' },
  done: { label: 'Done', color: '#10b981', icon: '✅' },
};

// Generate avatar initials
export const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

// Generate avatar color from name
export const getAvatarColor = (name) => {
  const colors = [
    '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
    '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
  ];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Format time (seconds → MM:SS)
export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// XP level info
export const getLevelInfo = (xp) => {
  const level = Math.floor(Math.sqrt(xp / 50)) + 1;
  const prevXP = (level - 1) * (level - 1) * 50;
  const nextXP = level * level * 50;
  const progress = ((xp - prevXP) / (nextXP - prevXP)) * 100;
  const titles = ['Novice', 'Apprentice', 'Productive', 'Focused', 'Efficient', 'Expert', 'Master', 'Grandmaster', 'Legend', 'Transcendent'];
  return { level, title: titles[Math.min(level - 1, titles.length - 1)], progress: Math.min(Math.max(progress, 0), 100), nextXP, xpToNext: nextXP - xp };
};

// Category colors (auto-generated)
const CATEGORY_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#f97316', '#ef4444'];
const categoryColorMap = {};
export const getCategoryColor = (category) => {
  if (!categoryColorMap[category]) {
    const idx = Object.keys(categoryColorMap).length % CATEGORY_COLORS.length;
    categoryColorMap[category] = CATEGORY_COLORS[idx];
  }
  return categoryColorMap[category];
};

// Clamp number
export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// Truncate text
export const truncate = (str, len = 100) => str?.length > len ? `${str.slice(0, len)}...` : str;

// Debounce
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
};

// Request browser notification permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
};

// Send browser notification
export const sendBrowserNotification = (title, options = {}) => {
  if (Notification.permission !== 'granted') return;
  new Notification(title, {
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    ...options,
  });
};

// Mood config
export const MOOD_CONFIG = {
  1: { label: 'Terrible', emoji: '😫', color: '#ef4444' },
  2: { label: 'Bad', emoji: '😞', color: '#f97316' },
  3: { label: 'Okay', emoji: '😐', color: '#f59e0b' },
  4: { label: 'Good', emoji: '😊', color: '#10b981' },
  5: { label: 'Excellent', emoji: '🤩', color: '#6366f1' },
};

// Export tasks to PDF
export const exportTasksToPDF = async (tasks, userName) => {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, 220, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TaskFlow X — Task Export', 14, 20);
  
  // Meta
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated for: ${userName} | ${format(new Date(), 'PPP')}`, 14, 38);
  doc.text(`Total tasks: ${tasks.length} | Completed: ${tasks.filter(t => t.completed).length}`, 14, 44);

  const tableData = tasks.map((t) => [
    t.title?.slice(0, 50) || '',
    t.priority?.toUpperCase() || 'MEDIUM',
    t.category || 'General',
    t.dueDate ? formatDate(t.dueDate, 'MMM d, yyyy') : '—',
    t.completed ? '✓ Done' : '○ Pending',
  ]);

  autoTable(doc, {
    startY: 52,
    head: [['Task', 'Priority', 'Category', 'Due Date', 'Status']],
    body: tableData,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    columnStyles: { 0: { cellWidth: 80 } },
  });

  doc.save(`taskflow-tasks-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
