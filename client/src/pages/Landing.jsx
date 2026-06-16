import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, CheckCircle, BarChart3, Timer, Target, Kanban, ArrowRight, Star, Shield, Sparkles } from 'lucide-react';

const features = [
  { icon: CheckCircle, title: 'Smart Task Management', desc: 'AI-powered task breakdown, priority suggestions, and smart scheduling.', color: '#6366f1' },
  { icon: BarChart3, title: 'Productivity Analytics', desc: 'Beautiful dashboards with streaks, XP, completion trends, and insights.', color: '#a855f7' },
  { icon: Timer, title: 'Pomodoro Focus Mode', desc: 'Deep work sessions with distraction-free full-screen mode and session stats.', color: '#06b6d4' },
  { icon: Kanban, title: 'Kanban Board', desc: 'Drag-and-drop task management across To Do, In Progress, Review, and Done.', color: '#10b981' },
  { icon: Target, title: 'Habit Tracking', desc: 'Build lasting habits with streaks, heatmaps, and motivating rewards.', color: '#f59e0b' },
  { icon: Sparkles, title: 'AI Assistant', desc: 'Your personal productivity coach — plans, tips, and daily AI-generated insights.', color: '#ec4899' },
];

const stats = [
  { value: '50K+', label: 'Tasks Completed' },
  { value: '10K+', label: 'Active Users' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '4.9★', label: 'App Rating' },
];

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 border-b border-white/5" style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-lg">TaskFlow<span className="text-brand-400"> X</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Sign In</Link>
          <Link to="/register" className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-all shadow-glow">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Productivity Platform
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Work smarter,<br />
            <span className="gradient-text">achieve more.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            TaskFlow X combines AI-powered task management, gamification, habit tracking, 
            and deep focus tools into one stunning productivity platform.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-purple-600 text-white font-semibold text-lg shadow-glow-lg hover:shadow-glow-lg transition-all hover:scale-105"
            >
              Start for free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all"
            >
              Sign In
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-500" /> No credit card</span>
            <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400" /> Free forever plan</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-brand-400" /> Setup in 30 seconds</span>
          </div>
        </motion.div>

        {/* App preview card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <div className="glass-card p-6 shadow-2xl" style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(99,102,241,0.2)' }}>
            {/* Mock UI preview */}
            <div className="flex gap-4 text-left">
              <div className="w-48 flex-shrink-0 space-y-1">
                {['Dashboard', 'Tasks', 'Kanban', 'Analytics', 'Focus Mode'].map((item, i) => (
                  <div key={item} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${i === 1 ? 'bg-brand-500/20 text-brand-400' : 'text-slate-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-brand-400' : 'bg-slate-600'}`} />
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {[{ label: 'Tasks Today', val: '8', color: '#6366f1' }, { label: 'Streak', val: '12🔥', color: '#f59e0b' }, { label: 'XP', val: '2,450', color: '#10b981' }].map((s) => (
                    <div key={s.label} className="p-3 rounded-xl bg-white/5 border border-white/8">
                      <div className="text-xl font-bold" style={{ color: s.color }}>{s.val}</div>
                      <div className="text-xs text-slate-500">{s.label}</div>
                    </div>
                  ))}
                </div>
                {['🔴 Launch new feature — Critical', '🟠 Write project report — High', '🟡 Team standup prep — Medium'].map((task) => (
                  <div key={task} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8">
                    <div className="w-4 h-4 rounded-full border-2 border-brand-500/50 flex-shrink-0" />
                    <span className="text-xs text-slate-300">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-white/5" style={{ background: 'rgba(99,102,241,0.05)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-extrabold gradient-text mb-1">{value}</div>
              <div className="text-slate-400 text-sm">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Everything you need to<br /><span className="gradient-text">dominate your day</span></h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Packed with premium features that make productivity addictive, not exhausting.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="glass-card p-6 hover:scale-[1.02] transition-transform cursor-default"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass-card p-12"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1))', border: '1px solid rgba(99,102,241,0.25)' }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to level up?</h2>
          <p className="text-slate-400 mb-8 text-lg">Join thousands of professionals who've transformed their productivity with TaskFlow X.</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-purple-600 text-white font-bold text-lg shadow-glow-lg hover:scale-105 transition-all"
          >
            Get started — it's free <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-white/5 text-slate-600 text-sm">
        <p>© 2024 TaskFlow X. Built with ❤️ for maximum productivity.</p>
      </footer>
    </div>
  );
}
