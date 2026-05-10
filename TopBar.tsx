import React, { useState } from 'react';
import { Heart, MessageCircle, Search, ShieldCheck, X, TrendingUp, BookOpen, Users, ShoppingBag, Plus, Bell, Brain, GraduationCap } from 'lucide-react';
import { playHaptic } from '../lib/haptics';
import { motion, AnimatePresence } from 'motion/react';
import MessagesSheet from './MessagesSheet';

export default function TopBar() {
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  React.useEffect(() => {
    const handleNav = () => {
      setShowSearch(false);
      setShowNotifications(false);
      setShowMessages(false);
    };
    window.addEventListener('NAVIGATE', handleNav);
    return () => window.removeEventListener('NAVIGATE', handleNav);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">Vexox</h1>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => { playHaptic(); setShowNotifications(true); }}
            className="text-slate-400 hover:text-white transition-colors relative active:scale-95"
          >
            <Bell className="w-6 h-6" strokeWidth={1.5} />
            <span className="absolute top-0 right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-black" />
          </button>
          <button 
            onClick={() => { playHaptic(); setShowMessages(true); }}
            className="text-slate-400 hover:text-white transition-colors active:scale-95"
          >
            <MessageCircle className="w-6 h-6" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => { playHaptic(); window.dispatchEvent(new CustomEvent('NAVIGATE', { detail: 'shiksha' })); }}
            className="px-3 py-1.5 bg-white rounded-full text-black hover:bg-slate-200 active:scale-95 transition-all ml-1 flex items-center gap-1.5"
          >
            <Brain className="w-4 h-4 text-black" strokeWidth={2} />
            <span className="text-xs font-bold uppercase tracking-widest text-black">AI Core</span>
          </button>
        </div>
      </header>

      {/* Global Search Overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex flex-col p-4 pt-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 bg-white/10 rounded-2xl flex items-center px-4 py-3 border border-white/10">
                <Search className="w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Search users, trending, or study notes..."
                  className="bg-transparent border-none outline-none text-white ml-3 flex-1 text-sm placeholder:text-slate-500"
                />
              </div>
              <button onClick={() => { playHaptic(); setShowSearch(false); }} className="p-3 text-white bg-white/5 rounded-2xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4">
              {['All', 'Users', 'Trending', 'Physics', '12th'].map(filter => (
                <button key={filter} className="px-4 py-1.5 bg-amethyst-500/20 text-amethyst-300 text-xs font-bold uppercase rounded-full border border-amethyst-500/30 whitespace-nowrap">
                  {filter}
                </button>
              ))}
            </div>

            <div className="space-y-4">
               <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Discovery</h3>
               {[
                 { icon: TrendingUp, text: 'JEE Advanced Strategy', color: 'text-orange-400' },
                 { icon: BookOpen, text: 'Quantum Mechanics Notes', color: 'text-blue-400' },
                 { icon: Users, text: 'Topper_Rahul101', color: 'text-purple-400' },
               ].map((item, i) => (
                 <div key={`discovery-${i}`} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="p-2 bg-black/30 rounded-xl"><item.icon className={`w-5 h-5 ${item.color}`} /></div>
                    <span className="text-sm font-medium text-slate-200">{item.text}</span>
                 </div>
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Overlay */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            {/* Header */}
            <div className="pt-safe px-4 py-4 border-b border-white/10 flex items-center gap-4 bg-black/60 backdrop-blur-xl z-20">
              <button onClick={() => { playHaptic(); setShowNotifications(false); }} className="text-white active:scale-95">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold text-white tracking-tight">Notifications</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
               {[
                 { title: 'Vexox Reward', desc: 'You earned 50 V-Coins for logging in today!', time: '1m ago', icon: '💎' },
                 { title: 'System', desc: 'Your profile Verified Badge is now active.', time: '2h ago', icon: '✅' },
                 { title: 'Astro liked your post', desc: '"Nebula wonders ✨"', time: '5h ago', icon: '❤️' },
               ].map((notif, i) => (
                 <div key={`notification-${i}`} className="flex gap-4 p-4 bg-zinc-900 rounded-[1.5rem] border border-white/5 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amethyst-500" />
                    <span className="text-2xl">{notif.icon}</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white mb-0.5">{notif.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{notif.desc}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">{notif.time}</span>
                 </div>
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MessagesSheet isOpen={showMessages} onClose={() => setShowMessages(false)} />
    </>
  );
}
