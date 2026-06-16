import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Bot, User, Calendar, Lightbulb, ListTodo, Brain, RefreshCw } from 'lucide-react';
import { aiAPI } from '../services/api';
import { useTaskStore, useAuthStore, useAnalyticsStore } from '../store';
import toast from 'react-hot-toast';

const QUICK_PROMPTS = [
  { icon: ListTodo, label: 'Prioritize my tasks', msg: 'What should I prioritize today?' },
  { icon: Calendar, label: 'Daily plan', msg: 'Create a daily plan for me' },
  { icon: Lightbulb, label: 'Productivity tip', msg: 'Give me a productivity tip' },
  { icon: Brain, label: 'Break down a task', msg: 'Help me break down a large task into subtasks' },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1, role: 'ai', type: 'greeting',
      text: "👋 Hi! I'm your AI productivity assistant. I can help you prioritize tasks, break them into subtasks, generate daily plans, and give you productivity tips. What would you like to work on?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyPlan, setDailyPlan] = useState(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'plan' | 'insights'
  const [insights, setInsights] = useState([]);
  const messagesEndRef = useRef(null);
  const { tasks } = useTaskStore();
  const { user } = useAuthStore();
  const { analytics } = useAnalyticsStore();

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', text: msg };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await aiAPI.chat(msg);
      const { response } = res.data.data;
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'ai', type: response.type, text: response.message }]);
    } catch {
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'ai', type: 'error', text: 'Sorry, I had trouble responding. Please try again!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDailyPlan = async () => {
    setIsLoadingPlan(true);
    try {
      const res = await aiAPI.getDailyPlan();
      setDailyPlan(res.data.data);
      setActiveTab('plan');
    } catch { toast.error('Failed to generate plan'); }
    finally { setIsLoadingPlan(false); }
  };

  const loadInsights = async () => {
    if (!analytics) { toast('Fetch analytics first from Dashboard', { icon: '📊' }); return; }
    try {
      const res = await aiAPI.getInsights(analytics);
      setInsights(res.data.data.insights);
      setActiveTab('insights');
    } catch { toast.error('Failed to load insights'); }
  };

  const insightColors = { success: '#10b981', warning: '#f59e0b', tip: '#6366f1', info: '#06b6d4', error: '#f43f5e' };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">AI Assistant</h2>
          <p className="text-sm text-slate-400">Powered by smart productivity intelligence</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={loadDailyPlan} disabled={isLoadingPlan} className="btn-secondary btn-sm">
            {isLoadingPlan ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <Calendar className="w-4 h-4" />}
            Plan
          </button>
          <button onClick={loadInsights} className="btn-secondary btn-sm">
            <Sparkles className="w-4 h-4" /> Insights
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 glass-card p-1">
        {['chat', 'plan', 'insights'].map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg capitalize transition-all ${activeTab === t ? 'bg-brand-500/20 text-brand-400' : 'text-slate-500 hover:text-white'}`}>
            {t === 'chat' ? '💬 Chat' : t === 'plan' ? '📋 Daily Plan' : '💡 Insights'}
          </button>
        ))}
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Quick prompts */}
          <div className="flex gap-2 flex-wrap mb-4">
            {QUICK_PROMPTS.map(({ icon: Icon, label, msg }) => (
              <button key={label} onClick={() => sendMessage(msg)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8 text-xs text-slate-400 hover:text-white hover:border-brand-500/30 hover:bg-brand-500/5 transition-all">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={`ai-message ${msg.role === 'ai' ? 'ai' : 'user'} max-w-xs md:max-w-sm`}>
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-center">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="ai-message ai flex items-center gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder="Ask anything about your productivity..."
              className="input flex-1"
              disabled={isLoading}
            />
            <button onClick={() => sendMessage()} disabled={isLoading || !input.trim()} className="btn-primary px-4">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Daily Plan Tab */}
      {activeTab === 'plan' && (
        <div className="flex-1 overflow-y-auto">
          {dailyPlan ? (
            <div className="space-y-4">
              <div className="glass-card p-4" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <p className="text-sm text-slate-300 leading-relaxed">{dailyPlan.message}</p>
                {dailyPlan.tip && <p className="text-xs text-slate-500 mt-2 italic">💡 {dailyPlan.tip}</p>}
              </div>
              <div className="space-y-2">
                {dailyPlan.plan?.map((item, i) => {
                  const cfg = { critical: '#f43f5e', high: '#f97316', medium: '#f59e0b', low: '#10b981' };
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="glass-card p-3 flex items-center gap-3"
                    >
                      <div className="text-center w-14 flex-shrink-0">
                        <div className="text-xs font-bold text-brand-400">{item.time}</div>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{item.task}</p>
                        <p className="text-xs text-slate-500">{item.estimatedTime} min</p>
                      </div>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg[item.priority] || '#6366f1' }} />
                    </motion.div>
                  );
                })}
              </div>
              <button onClick={loadDailyPlan} className="btn-secondary w-full">
                <RefreshCw className="w-4 h-4" /> Regenerate Plan
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <Calendar className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm">Click "Plan" to generate your AI daily schedule</p>
            </div>
          )}
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="flex-1 overflow-y-auto space-y-3">
          {insights.length > 0 ? (
            insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-4"
                style={{ borderLeft: `3px solid ${insightColors[insight.type] || '#6366f1'}` }}
              >
                <p className="text-sm text-slate-300 leading-relaxed">{insight.message}</p>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <Sparkles className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm">Click "Insights" to get AI productivity analysis</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
