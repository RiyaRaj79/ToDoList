import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============= AUTH STORE =============
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
      
      login: (userData, accessToken, refreshToken) =>
        set({
          user: userData,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),
      
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'taskflow-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ============= TASK STORE =============
export const useTaskStore = create(
  persist(
    (set, get) => ({
      tasks: [],
      categories: [],
      isLoading: false,
      error: null,
      filters: {
        search: '',
        priority: '',
        category: '',
        status: '',
        completed: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },

      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t._id === id || t.id === id ? { ...t, ...updates } : t)),
        })),
      removeTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t._id !== id && t.id !== id) })),
      setCategories: (categories) => set({ categories }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
      resetFilters: () =>
        set({ filters: { search: '', priority: '', category: '', status: '', completed: '', sortBy: 'createdAt', sortOrder: 'desc' } }),

      getFilteredTasks: () => {
        const { tasks, filters } = get();
        let filtered = [...tasks];
        
        if (filters.search) {
          const q = filters.search.toLowerCase();
          filtered = filtered.filter((t) =>
            t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
          );
        }
        if (filters.priority) filtered = filtered.filter((t) => t.priority === filters.priority);
        if (filters.category) filtered = filtered.filter((t) => t.category === filters.category);
        if (filters.status) filtered = filtered.filter((t) => t.status === filters.status);
        if (filters.completed !== '') {
          const comp = filters.completed === 'true';
          filtered = filtered.filter((t) => t.completed === comp);
        }
        
        filtered.sort((a, b) => {
          const order = filters.sortOrder === 'asc' ? 1 : -1;
          if (filters.sortBy === 'dueDate') {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return (new Date(a.dueDate) - new Date(b.dueDate)) * order;
          }
          if (filters.sortBy === 'priority') {
            const p = { critical: 0, high: 1, medium: 2, low: 3 };
            return (p[a.priority] - p[b.priority]) * order;
          }
          return (new Date(a.createdAt) - new Date(b.createdAt)) * order;
        });
        
        return filtered;
      },

      getTasksByKanban: () => {
        const { tasks } = get();
        return {
          todo: tasks.filter((t) => t.kanbanColumn === 'todo' || (!t.kanbanColumn && t.status === 'todo')),
          inprogress: tasks.filter((t) => t.kanbanColumn === 'inprogress' || t.status === 'inprogress'),
          review: tasks.filter((t) => t.kanbanColumn === 'review' || t.status === 'review'),
          done: tasks.filter((t) => t.kanbanColumn === 'done' || t.status === 'done'),
        };
      },
    }),
    {
      name: 'taskflow-tasks',
      partialize: (state) => ({ tasks: state.tasks, categories: state.categories }),
    }
  )
);

// ============= UI STORE =============
export const useUIStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarOpen: true,
      sidebarCollapsed: false,
      activeModal: null,
      editingTask: null,
      notifications: [],
      unreadCount: 0,
      focusModeActive: false,

      setTheme: (theme) => {
        set({ theme });
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        }
      },
      toggleTheme: () => {
        const current = useUIStore.getState().theme;
        useUIStore.getState().setTheme(current === 'dark' ? 'light' : 'dark');
      },
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setActiveModal: (modal) => set({ activeModal: modal }),
      setEditingTask: (task) => set({ editingTask: task, activeModal: task ? 'task-form' : null }),
      addNotification: (notif) =>
        set((state) => ({
          notifications: [{ ...notif, id: Date.now(), read: false }, ...state.notifications.slice(0, 49)],
          unreadCount: state.unreadCount + 1,
        })),
      markAllRead: () => set({ unreadCount: 0, notifications: [] }),
      setFocusMode: (active) => set({ focusModeActive: active }),
    }),
    {
      name: 'taskflow-ui',
      partialize: (state) => ({ theme: state.theme, sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
);

// ============= ANALYTICS STORE =============
export const useAnalyticsStore = create((set) => ({
  analytics: null,
  isLoading: false,
  lastFetched: null,
  
  setAnalytics: (analytics) => set({ analytics, lastFetched: Date.now() }),
  setLoading: (isLoading) => set({ isLoading }),
}));

// ============= HABIT STORE =============
export const useHabitStore = create((set) => ({
  habits: [],
  isLoading: false,
  
  setHabits: (habits) => set({ habits }),
  addHabit: (habit) => set((state) => ({ habits: [habit, ...state.habits] })),
  updateHabit: (id, updates) =>
    set((state) => ({ habits: state.habits.map((h) => (h._id === id ? { ...h, ...updates } : h)) })),
  removeHabit: (id) => set((state) => ({ habits: state.habits.filter((h) => h._id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
}));

// ============= POMODORO STORE =============
export const usePomodoroStore = create(
  persist(
    (set, get) => ({
      mode: 'work', // 'work' | 'short-break' | 'long-break'
      timeLeft: 25 * 60,
      isRunning: false,
      session: 0,
      totalSessions: 0,
      settings: { work: 25, shortBreak: 5, longBreak: 15 },
      
      setMode: (mode) => {
        const { settings } = get();
        const times = { work: settings.work * 60, 'short-break': settings.shortBreak * 60, 'long-break': settings.longBreak * 60 };
        set({ mode, timeLeft: times[mode], isRunning: false });
      },
      setTimeLeft: (timeLeft) => set({ timeLeft }),
      setRunning: (isRunning) => set({ isRunning }),
      tick: () => {
        const { timeLeft } = get();
        if (timeLeft > 0) set({ timeLeft: timeLeft - 1 });
      },
      completeSession: () => {
        const { session, totalSessions, settings } = get();
        const newSession = session + 1;
        const newTotal = totalSessions + 1;
        const isLongBreak = newSession % 4 === 0;
        set({
          session: newSession,
          totalSessions: newTotal,
          mode: isLongBreak ? 'long-break' : 'short-break',
          timeLeft: isLongBreak ? settings.longBreak * 60 : settings.shortBreak * 60,
          isRunning: false,
        });
      },
      updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      reset: () => {
        const { settings } = get();
        set({ timeLeft: settings.work * 60, isRunning: false, mode: 'work' });
      },
    }),
    { name: 'taskflow-pomodoro' }
  )
);
