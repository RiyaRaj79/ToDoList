import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle2, Flame, Zap, Clock, Target, TrendingUp, Award, Calendar } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { analyticsAPI, aiAPI } from '../services/api';
import { useAuthStore, useAnalyticsStore, useUIStore } from '../store';
import { getLevelInfo, PRIORITY_CONFIG } from '../utils/helpers';
import MoodWidget from '../components/MoodWidget';
import QuickAddTask from '../components/tasks/QuickAddTask';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];

const StatCard = ({ icon: Icon, label, value, subtext, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="glass-card p-5 hover:scale-[1.02] transition-transform"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="p-2.5 rounded-xl" style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      {subtext && <span className="text-xs text-slate-500">{subtext}</span>}
    </div>
    <div className="text-2xl font-bold text-white mb-0.5">{value ?? '—'}</div>
    <div className="text-sm text-slate-400">{label}</div>
  </motion.div>
);

const StreakDisplay = ({ streak, longestStreak }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="glass-card p-5"
    style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(251,191,36,0.05))' }}
  >
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
          <span className="text-sm font-medium text-amber-400">Daily Streak</span>
        </div>
        <div className="text-4xl font-extrabold text-white">{streak}<span className="text-amber-400">🔥</span></div>
        <div className="text-sm text-slate-400 mt-1">Best: {longestStreak} days</div>
      </div>
      <div className="flex gap-1">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-8 rounded-sm transition-all"
            style={{ background: i < (streak % 7 || (streak > 0 ? 7 : 0)) ? '#f59e0b' : 'rgba(255,255,255,0.1)' }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

const XPCard = ({ user }) => {
  const info = getLevelInfo(user?.xp || 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="glass-card p-5"
      style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.06))' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-brand-400" />
          <span className="text-sm font-medium text-brand-400">Level {info.level} · {info.title}</span>
        </div>
        <span className="text-xs text-slate-500">{user?.xp || 0} XP</span>
      </div>
      <div className="xp-bar mb-2">
        <motion.div
          className="xp-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${info.progress}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
        />
      </div>
      <div className="text-xs text-slate-500">{info.xpToNext} XP to level {info.level + 1}</div>
    </motion.div>
  );
};

const ScoreGauge = ({ score }) => {
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e';
  const label = score >= 80 ? '🔥 Excellent' : score >= 60 ? '📈 Good' : score >= 40 ? '💡 Building' : '🌱 Getting Started';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-5 flex flex-col items-center justify-center text-center"
    >
      <div className="relative w-28 h-28 mb-3">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          <motion.circle
            cx="50" cy="50" r="42" fill="none"
            stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - score / 100) }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-white">{score}</span>
          <span className="text-xs text-slate-400">/100</span>
        </div>
      </div>
      <div className="text-sm font-semibold text-white">Productivity Score</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </motion.div>
  );
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const { analytics, setAnalytics, isLoading, setLoading } = useAnalyticsStore();
  const { setActiveModal } = useUIStore();
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    // Skip if analytics already loaded (e.g. demo mode)
    if (analytics) { setLoading(false); return; }
    const fetchData = async () => {
      setLoading(true);
      try {
        const [analyticsRes, quoteRes] = await Promise.all([
          analyticsAPI.getAll(),
          aiAPI.getQuote(),
        ]);
        setAnalytics(analyticsRes.data.data);
        setQuote(quoteRes.data.data.quote);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const d = analytics;
  const overview = d?.overview || {};
  const userStats = d?.user || {};
  const dailyTrend = d?.dailyTrend || [];
  const categoryBreakdown = d?.categoryBreakdown || [];
  const productivityScore = d?.productivityScore || 0;
  const priorityBreakdown = d?.priorityBreakdown || {};

  const pieData = categoryBreakdown.slice(0, 5).map((c, i) => ({
    name: c.name,
    value: c.total,
    color: COLORS[i % COLORS.length],
  }));

  const achievementsToShow = (userStats.achievements || []).slice(0, 6);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.08))', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'there'}! 👋
            </h2>
            {quote && (
              <p className="text-sm text-slate-400 mt-1 italic">
                "{quote.quote}" — {quote.author}
              </p>
            )}
          </div>
          <button
            onClick={() => setActiveModal('task-form')}
            className="btn-primary whitespace-nowrap"
          >
            + New Task
          </button>
        </div>
      </motion.div>

      {/* Quick Add Task */}
      <QuickAddTask />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle2} label="Completed Today" value={overview.completedToday ?? 0} color="#10b981" delay={0.05} />
        <StatCard icon={Calendar} label="Total Tasks" value={overview.totalTasks ?? 0} subtext={`${overview.completionRate ?? 0}% done`} color="#6366f1" delay={0.1} />
        <StatCard icon={Clock} label="Overdue" value={overview.overdueTasks ?? 0} color="#f43f5e" delay={0.15} />
        <StatCard icon={TrendingUp} label="Created Today" value={overview.createdToday ?? 0} color="#a855f7" delay={0.2} />
      </div>

      {/* Streak + XP + Score + Mood */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StreakDisplay streak={userStats.streak || user?.streak || 0} longestStreak={userStats.longestStreak || user?.longestStreak || 0} />
        <XPCard user={{ ...user, ...userStats }} />
        <ScoreGauge score={productivityScore} />
        <MoodWidget />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Completion trend */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              7-Day Completion Trend
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={dailyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', color: '#f1f5f9', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorCompleted)" name="Completed" dot={{ fill: '#6366f1', r: 3 }} />
              <Area type="monotone" dataKey="created" stroke="#a855f7" strokeWidth={2} fill="none" name="Created" strokeDasharray="4 2" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-400" />
            Categories
          </h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', color: '#f1f5f9', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.slice(0, 4).map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                      <span className="text-slate-400 truncate max-w-20">{item.name}</span>
                    </div>
                    <span className="text-slate-300 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-sm">
              <Target className="w-8 h-8 mb-2 opacity-30" />
              <span>No categories yet</span>
            </div>
          )}
        </div>
      </div>

      {/* Priority breakdown + Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Priority bar */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Priority Breakdown (Pending)</h3>
          <div className="space-y-3">
            {Object.entries(priorityBreakdown).map(([priority, count]) => {
              const cfg = PRIORITY_CONFIG[priority];
              const maxCount = Math.max(...Object.values(priorityBreakdown), 1);
              return (
                <div key={priority}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: cfg.color }} className="font-medium capitalize">{priority}</span>
                    <span className="text-slate-400">{count} tasks</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: cfg.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxCount) * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Achievements</h3>
            <span className="text-xs text-slate-500 ml-auto">{achievementsToShow.length} unlocked</span>
          </div>
          {achievementsToShow.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {achievementsToShow.map((a) => (
                <motion.div
                  key={a.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center"
                >
                  <span className="text-2xl">{a.icon}</span>
                  <span className="text-xs text-amber-400 font-medium leading-tight">{a.name}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-24 text-slate-500">
              <Award className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs">Complete tasks to unlock achievements!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
