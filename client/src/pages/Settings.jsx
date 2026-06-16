import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Bell, User, Palette, Shield, Download, Trash2, LogOut } from 'lucide-react';
import { useAuthStore, useUIStore, useTaskStore } from '../store';
import { authAPI } from '../services/api';
import { exportTasksToPDF } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUser, logout } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const { tasks } = useTaskStore();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState(user?.settings?.notifications ?? true);
  const [pomodoroWork, setPomodoroWork] = useState(user?.settings?.pomodoroWork || 25);
  const [pomodoroBreak, setPomodoroBreak] = useState(user?.settings?.pomodoroBreak || 5);

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await authAPI.updateMe({ name: profileForm.name });
      updateUser({ name: res.data.data.user.name });
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setIsSaving(false); }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await authAPI.updateMe({ settings: { notifications, pomodoroWork, pomodoroBreak } });
      updateUser({ settings: { notifications, pomodoroWork, pomodoroBreak } });
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save settings'); }
    finally { setIsSaving(false); }
  };

  const handleExport = async () => {
    try { await exportTasksToPDF(tasks, user?.name); toast.success('Exported to PDF! 📄'); }
    catch { toast.error('Export failed'); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const Section = ({ title, icon: Icon, children }) => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
      <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-brand-400" />
        {title}
      </h3>
      {children}
    </motion.div>
  );

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <p className="text-sm text-slate-400">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Section title="Profile" icon={User}>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">Display Name</label>
            <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="input" placeholder="Your name" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">Email</label>
            <input type="email" value={profileForm.email} disabled className="input opacity-50 cursor-not-allowed" />
          </div>
          <button onClick={saveProfile} disabled={isSaving} className="btn-primary btn-sm">
            {isSaving ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Profile'}
          </button>
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Appearance" icon={Palette}>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-2">Theme</label>
            <div className="flex gap-2">
              {[{ val: 'dark', icon: Moon, label: 'Dark' }, { val: 'light', icon: Sun, label: 'Light' }].map(({ val, icon: Icon, label }) => (
                <button key={val} onClick={() => setTheme(val)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-all ${theme === val ? 'bg-brand-500/20 text-brand-400 border-brand-500/30' : 'bg-white/5 text-slate-400 border-white/8'}`}>
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white">Browser Notifications</div>
              <div className="text-xs text-slate-500">Get notified about due dates and reminders</div>
            </div>
            <button
              onClick={() => { setNotifications(!notifications); }}
              className={`relative w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-brand-500' : 'bg-white/10'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <button onClick={saveSettings} disabled={isSaving} className="btn-primary btn-sm">Save Preferences</button>
        </div>
      </Section>

      {/* Pomodoro */}
      <Section title="Focus Timer" icon={Shield}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">Work Duration (min)</label>
            <input type="number" value={pomodoroWork} onChange={(e) => setPomodoroWork(Number(e.target.value))}
              min="5" max="90" className="input" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">Break Duration (min)</label>
            <input type="number" value={pomodoroBreak} onChange={(e) => setPomodoroBreak(Number(e.target.value))}
              min="1" max="30" className="input" />
          </div>
        </div>
        <button onClick={saveSettings} disabled={isSaving} className="btn-primary btn-sm mt-3">Save Timer Settings</button>
      </Section>

      {/* Data */}
      <Section title="Your Data" icon={Download}>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/8">
            <div>
              <div className="text-sm text-white">Export Tasks</div>
              <div className="text-xs text-slate-500">Download all your tasks as PDF</div>
            </div>
            <button onClick={handleExport} className="btn-secondary btn-sm">
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/8">
            <div>
              <div className="text-sm text-white">{tasks.length} Tasks Total</div>
              <div className="text-xs text-slate-500">{tasks.filter((t) => t.completed).length} completed · {tasks.filter((t) => !t.completed).length} pending</div>
            </div>
          </div>
        </div>
      </Section>

      {/* Account actions */}
      <div className="flex gap-3">
        <button onClick={handleLogout} className="btn-secondary flex-1 flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}
