import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { moodAPI } from '../services/api';
import { useAuthStore } from '../store';
import { MOOD_CONFIG } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function MoodWidget() {
  const { accessToken } = useAuthStore();
  const [selected, setSelected] = useState(null);
  const [logged, setLogged] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const handleLog = async (moodVal) => {
    setSelected(moodVal);
    if (accessToken === 'demo-token') {
      setLogged(true);
      toast.success(`Mood logged: ${MOOD_CONFIG[moodVal].label} ${MOOD_CONFIG[moodVal].emoji} +5 XP`);
      return;
    }
    setIsLogging(true);
    try {
      await moodAPI.log({ mood: moodVal });
      setLogged(true);
      toast.success(`Mood logged: ${MOOD_CONFIG[moodVal].label} ${MOOD_CONFIG[moodVal].emoji} +5 XP`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log mood');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">How are you feeling?</h3>
        <span className="text-xs text-slate-500">+5 XP</span>
      </div>

      <AnimatePresence mode="wait">
        {logged ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-2"
          >
            <div className="text-3xl mb-1">{MOOD_CONFIG[selected]?.emoji}</div>
            <p className="text-sm text-slate-400">
              Feeling <span className="font-semibold" style={{ color: MOOD_CONFIG[selected]?.color }}>{MOOD_CONFIG[selected]?.label}</span>
            </p>
            <p className="text-xs text-slate-600 mt-0.5">Logged today ✓</p>
          </motion.div>
        ) : (
          <motion.div key="selector" className="flex gap-2 justify-between">
            {Object.entries(MOOD_CONFIG).map(([val, cfg]) => (
              <button
                key={val}
                onClick={() => handleLog(Number(val))}
                disabled={isLogging}
                className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl border-2 transition-all hover:scale-105 ${
                  selected === Number(val)
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'border-transparent bg-white/5 hover:border-white/20'
                }`}
                title={cfg.label}
              >
                <span className="text-xl">{cfg.emoji}</span>
                <span className="text-xs text-slate-500 hidden sm:block">{cfg.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
