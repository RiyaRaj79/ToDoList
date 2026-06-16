import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, CheckSquare, Kanban, Calendar, Timer, BarChart3,
  Target, Settings, Zap, ChevronLeft, ChevronRight, LogOut, X
} from 'lucide-react';
import { useAuthStore, useUIStore } from '../../store';
import { getInitials, getAvatarColor } from '../../utils/helpers';

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/kanban', icon: Kanban, label: 'Kanban' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/focus', icon: Timer, label: 'Focus Mode' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/habits', icon: Target, label: 'Habits' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isMobile }) {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const avatarColor = getAvatarColor(user?.name || '');
  const initials = getInitials(user?.name || '');
  const isVisible = isMobile ? sidebarOpen : true;
  const collapsed = !isMobile && sidebarCollapsed;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          key="sidebar"
          initial={isMobile ? { x: -280 } : false}
          animate={{ x: 0 }}
          exit={isMobile ? { x: -280 } : undefined}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className={`
            flex flex-col h-full border-r border-white/8 z-40 overflow-hidden flex-shrink-0
            ${isMobile ? 'fixed left-0 top-0 w-72' : collapsed ? 'w-16' : 'w-64'}
          `}
          style={{ background: 'rgba(15,23,42,0.98)', backdropFilter: 'blur(20px)' }}
        >
          {/* Header */}
          <div className={`flex items-center ${collapsed ? 'justify-center px-3' : 'justify-between px-5'} py-4 border-b border-white/8`}>
            {!collapsed && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white text-sm tracking-tight">TaskFlow</span>
                  <span className="text-brand-400 font-bold text-sm"> X</span>
                </div>
              </div>
            )}
            {collapsed && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow">
                <Zap className="w-4 h-4 text-white" />
              </div>
            )}
            {isMobile ? (
              <button onClick={() => setSidebarOpen(false)} className="btn-ghost p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setSidebarCollapsed(!collapsed)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className={`flex-1 overflow-y-auto py-4 ${collapsed ? 'px-2' : 'px-3'}`}>
            <div className="space-y-1">
              {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                    ${collapsed ? 'justify-center' : ''}
                    ${isActive
                      ? 'bg-brand-500/20 text-brand-400 border border-brand-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                  title={collapsed ? label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-brand-400' : ''}`} />
                      {!collapsed && <span>{label}</span>}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* User profile */}
          <div className={`border-t border-white/8 ${collapsed ? 'px-2 py-3' : 'px-3 py-4'}`}>
            {/* XP bar (only when not collapsed) */}
            {!collapsed && user && (
              <div className="mb-3 px-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-500">Level {user.level} · {user.levelTitle}</span>
                  <span className="text-xs text-brand-400">{user.xp} XP</span>
                </div>
                <div className="xp-bar">
                  <motion.div
                    className="xp-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${user.xpProgress || 0}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}

            <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                style={{ background: avatarColor }}
                title={user?.name}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-xl object-cover" />
                ) : initials}
              </div>

              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{user?.name}</div>
                    <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
