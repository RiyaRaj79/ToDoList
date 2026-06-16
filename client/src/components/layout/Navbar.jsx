import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, Plus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useUIStore, useTaskStore } from '../../store';
import NotificationCenter from './NotificationCenter';
import toast from 'react-hot-toast';

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', emoji: '🏠' },
  '/tasks': { title: 'Tasks', emoji: '✅' },
  '/kanban': { title: 'Kanban Board', emoji: '🗂️' },
  '/calendar': { title: 'Calendar', emoji: '📅' },
  '/focus': { title: 'Focus Mode', emoji: '🎯' },
  '/analytics': { title: 'Analytics', emoji: '📊' },
  '/habits': { title: 'Habit Tracker', emoji: '🔥' },
  '/settings': { title: 'Settings', emoji: '⚙️' },
};

export default function Navbar({ isMobile }) {
  const location = useLocation();
  const { user } = useAuthStore();
  const { theme, toggleTheme, setSidebarOpen, setActiveModal, setFilters } = useUIStore();
  const { filters } = useTaskStore();
  const page = PAGE_TITLES[location.pathname] || { title: 'TaskFlow X', emoji: '⚡' };
  const [searching, setSearching] = useState(false);

  const handleSearch = (e) => {
    useTaskStore.getState().setFilters({ search: e.target.value });
  };

  return (
    <header
      className="flex items-center justify-between px-4 md:px-6 h-16 border-b border-white/8 flex-shrink-0 z-20"
      style={{ background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(20px)' }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-base font-semibold text-white">
            {page.emoji} {page.title}
          </h1>
          <p className="text-xs text-slate-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Center — Search (desktop) */}
      <div className="hidden md:flex flex-1 max-w-sm mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search || ''}
            onChange={handleSearch}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 placeholder-slate-600 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.5, rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.div>
          </AnimatePresence>
        </button>

        {/* Notifications */}
        <NotificationCenter />

        {/* Add task button */}
        <button
          onClick={() => setActiveModal('task-form')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-all shadow-glow hover:shadow-glow-lg"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Task</span>
        </button>
      </div>
    </header>
  );
}
