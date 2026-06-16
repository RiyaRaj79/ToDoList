import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, Settings, Maximize2, Minimize2, Coffee, Brain, Zap, Timer } from 'lucide-react';
import { usePomodoroStore, useAuthStore } from '../store';
import { formatTime } from '../utils/helpers';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const MODE_CONFIG = {
  work: { label: 'Focus Time', color: '#6366f1', bg: 'rgba(99,102,241,0.15)', icon: Brain },
  'short-break': { label: 'Short Break', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: Coffee },
  'long-break': { label: 'Long Break', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', icon: Coffee },
};

export default function Focus() {
  const {
    mode, timeLeft, isRunning, session, totalSessions, settings,
    setMode, setTimeLeft, setRunning, tick, completeSession, updateSettings, reset,
  } = usePomodoroStore();
  const { user } = useAuthStore();
  const [fullscreen, setFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState(settings);
  const [sessionLog, setSessionLog] = useState([]);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const cfg = MODE_CONFIG[mode];
  const totalSeconds = mode === 'work' ? settings.work * 60 : mode === 'short-break' ? settings.shortBreak * 60 : settings.longBreak * 60;
  const progress = 1 - timeLeft / totalSeconds;
  const circumference = 2 * Math.PI * 140;

  const handleComplete = useCallback(async () => {
    setRunning(false);
    clearInterval(intervalRef.current);

    if (mode === 'work') {
      toast.success(`🎉 Focus session complete! +${settings.work * 2} XP`, { duration: 4000 });
      setSessionLog((prev) => [...prev, { mode, duration: settings.work, time: new Date(), label: 'Focus' }]);
      try { await authAPI.logFocusSession(settings.work); } catch {}
    } else {
      toast.success('Break time over! Ready to focus? 💪');
      setSessionLog((prev) => [...prev, { mode, duration: settings.shortBreak, time: new Date(), label: 'Break' }]);
    }

    // Play notification sound
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA...');
      audio.play();
    } catch {}

    // Browser notification
    if (Notification.permission === 'granted') {
      new Notification(mode === 'work' ? '🎉 Focus session complete!' : '☕ Break time over!', {
        body: mode === 'work' ? 'Take a well-deserved break.' : 'Time to get back to work!',
        icon: '/favicon.svg',
      });
    }

    completeSession();
  }, [mode, settings, completeSession]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const current = usePomodoroStore.getState().timeLeft;
        if (current <= 1) {
          handleComplete();
        } else {
          tick();
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, handleComplete]);

  const handleStartPause = () => {
    if (!isRunning) {
      // Request notification permission
      if (Notification.permission === 'default') Notification.requestPermission();
    }
    setRunning(!isRunning);
  };

  const handleReset = () => { reset(); setRunning(false); };

  const handleSkip = () => {
    clearInterval(intervalRef.current);
    completeSession();
  };

  const saveSettings = () => {
    updateSettings(settingsForm);
    reset();
    setShowSettings(false);
    toast.success('Timer settings saved!');
  };

  const container = fullscreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center focus-overlay'
    : 'p-4 md:p-6 max-w-2xl mx-auto flex flex-col items-center';

  return (
    <div className={container}>
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-white">Focus Mode</h2>
          <p className="text-sm text-slate-400">Session {session + 1} · {totalSessions} total completed</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSettings(!showSettings)} className="btn-ghost p-2">
            <Settings className="w-5 h-5" />
          </button>
          <button onClick={() => setFullscreen(!fullscreen)} className="btn-ghost p-2">
            {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2 mb-10">
        {Object.entries(MODE_CONFIG).map(([key, m]) => (
          <button
            key={key}
            onClick={() => { setMode(key); setRunning(false); }}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all border"
            style={{
              background: mode === key ? m.bg : 'rgba(255,255,255,0.04)',
              color: mode === key ? m.color : '#64748b',
              borderColor: mode === key ? `${m.color}30` : 'rgba(255,255,255,0.08)',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Circular Timer */}
      <div className="relative mb-10">
        <motion.div
          animate={{ scale: isRunning ? [1, 1.01, 1] : 1 }}
          transition={{ repeat: isRunning ? Infinity : 0, duration: 2, ease: 'easeInOut' }}
        >
          <svg width="320" height="320" viewBox="0 0 320 320">
            {/* Outer glow ring */}
            <circle cx="160" cy="160" r="148" fill="none" stroke={`${cfg.color}08`} strokeWidth="24" />
            {/* Background ring */}
            <circle cx="160" cy="160" r="140" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
            {/* Progress ring */}
            <motion.circle
              cx="160" cy="160" r="140"
              fill="none"
              stroke={cfg.color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="pomodoro-ring"
              style={{ filter: `drop-shadow(0 0 12px ${cfg.color}60)` }}
              transition={{ duration: 0.5, ease: 'linear' }}
            />
            {/* Inner circle */}
            <circle cx="160" cy="160" r="120" fill={cfg.bg} />
          </svg>
        </motion.div>

        {/* Timer text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: cfg.color }}>{cfg.label}</div>
          <motion.div
            key={Math.floor(timeLeft / 60)}
            initial={{ scale: 1.05, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-mono text-7xl font-black text-white tracking-tight"
            style={{ textShadow: `0 0 40px ${cfg.color}40` }}
          >
            {formatTime(timeLeft)}
          </motion.div>
          <div className="text-sm text-slate-500 mt-2">
            {isRunning ? 'Stay focused...' : 'Press play to start'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-10">
        <button onClick={handleReset} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/10">
          <RotateCcw className="w-5 h-5" />
        </button>

        <motion.button
          onClick={handleStartPause}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-glow-lg transition-all"
          style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}aa)` }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isRunning ? 'pause' : 'play'}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        <button onClick={handleSkip} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/10">
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Session dots */}
      <div className="flex gap-2 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full transition-all"
            style={{ background: i < (session % 4) ? cfg.color : 'rgba(255,255,255,0.1)', boxShadow: i < (session % 4) ? `0 0 8px ${cfg.color}60` : 'none' }}
          />
        ))}
        <span className="text-xs text-slate-500 ml-2">then long break</span>
      </div>

      {/* Session history */}
      {sessionLog.length > 0 && (
        <div className="w-full glass-card p-4">
          <div className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-brand-400" /> Today's Sessions
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {sessionLog.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{s.label} · {s.duration} min</span>
                <span className="text-slate-600">{s.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={(e) => e.target === e.currentTarget && setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 w-full max-w-sm"
              style={{ background: 'rgba(15,23,42,0.98)' }}
            >
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Timer className="w-4 h-4 text-brand-400" />Timer Settings</h3>
              <div className="space-y-4">
                {[
                  { key: 'work', label: 'Focus Duration (min)', min: 5, max: 90 },
                  { key: 'shortBreak', label: 'Short Break (min)', min: 1, max: 30 },
                  { key: 'longBreak', label: 'Long Break (min)', min: 5, max: 60 },
                ].map(({ key, label, min, max }) => (
                  <div key={key}>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-xs text-slate-400 font-medium">{label}</label>
                      <span className="text-xs text-brand-400 font-bold">{settingsForm[key]} min</span>
                    </div>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      value={settingsForm[key]}
                      onChange={(e) => setSettingsForm({ ...settingsForm, [key]: Number(e.target.value) })}
                      className="w-full accent-brand-500"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowSettings(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={saveSettings} className="btn-primary flex-1">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
