import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuthStore, useUIStore, useTaskStore } from '../../store';
import { taskAPI } from '../../services/api';
import { initSocket, subscribeToTaskEvents, disconnectSocket } from '../../services/socket';
import toast from 'react-hot-toast';

export default function AppLayout() {
  const { user, accessToken } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, theme } = useUIStore();
  const { setTasks, addTask, updateTask, removeTask, setCategories } = useTaskStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Fetch initial tasks (skip in demo mode)
  useEffect(() => {
    if (accessToken === 'demo-token') return; // demo mode — data already loaded
    const fetchTasks = async () => {
      try {
        const res = await taskAPI.getAll({ limit: 500 });
        setTasks(res.data.data.tasks);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      }
    };
    const fetchCategories = async () => {
      try {
        const res = await taskAPI.getCategories();
        setCategories(res.data.data.categories);
      } catch {}
    };
    fetchTasks();
    fetchCategories();
  }, []);

  // Socket.IO real-time (skip in demo mode)
  useEffect(() => {
    if (!accessToken || accessToken === 'demo-token') return;
    const socket = initSocket(accessToken);
    subscribeToTaskEvents({
      onCreated: (task) => { addTask(task); toast.success('New task added!', { icon: '📝' }); },
      onUpdated: (task) => updateTask(task._id, task),
      onDeleted: (id) => removeTask(id),
    });
    return () => disconnectSocket();
  }, [accessToken]);

  // Responsive
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apply theme class to html element
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'light') { html.classList.add('light'); html.classList.remove('dark'); }
    else { html.classList.add('dark'); html.classList.remove('light'); }
  }, [theme]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Sidebar */}
      <Sidebar isMobile={isMobile} />

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar isMobile={isMobile} />
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
