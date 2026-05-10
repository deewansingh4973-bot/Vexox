import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronRight, ShieldCheck, Heart, X, BadgeCheck } from 'lucide-react';
import { playHaptic } from '../lib/haptics';

export default function AboutSection({ onBack }: { onBack: () => void }) {
  const [modalContent, setModalContent] = useState<{title: string, content: string} | null>(null);

  const openModal = (title: string, content: string) => {
    playHaptic();
    setModalContent({ title, content });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto px-4 pt-8 pb-[130px] min-h-screen bg-[#0a0a0a] selection:bg-amethyst-500/30 overflow-y-auto"
    >
      <div className="flex items-center gap-4 mb-8 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-xl py-4 z-20 -mx-4 px-4 border-b border-white/5">
        <button onClick={() => { playHaptic(); onBack(); }} className="p-2 bg-white/5 rounded-full border-[0.5px] border-white/10 text-white active:scale-95 transition-all shadow-md">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-white flex-1">About Vexox</h2>
      </div>

      {/* Logo Section */}
      <div className="flex flex-col items-center justify-center py-8 mb-8">
         <motion.div 
           animate={{ scale: [1, 1.05, 1], filter: ['drop-shadow(0 0 10px rgba(168,85,247,0.5))', 'drop-shadow(0 0 25px rgba(168,85,247,0.8))', 'drop-shadow(0 0 10px rgba(168,85,247,0.5))'] }}
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
           className="w-24 h-24 bg-gradient-to-tr from-amethyst-600 to-fuchsia-600 rounded-3xl flex items-center justify-center mb-6 border-[0.5px] border-white/20 relative"
         >
           <span className="text-5xl font-black text-white italic tracking-tighter">V</span>
           <div className="absolute inset-0 bg-white/10 rounded-3xl mix-blend-overlay"></div>
         </motion.div>
         <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Vexox</h1>
         <p className="text-amethyst-400 font-mono text-[10px] uppercase tracking-widest bg-amethyst-500/10 px-3 py-1.5 rounded-full border-[0.5px] border-amethyst-500/30">Version 1.0.0 (Production Build)</p>
      </div>

      {/* Content Section */}
      <div className="space-y-6">
         <div className="bg-[#1e1e1e]/60 backdrop-blur-[25px] border-[0.5px] border-white/10 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amethyst-500/10 blur-[40px] pointer-events-none rounded-full" />
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-amethyst-500 rounded-full"></span> Mission
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed px-2">Vexox is a next-generation social ecosystem built for high-fidelity digital expression and secure connectivity.</p>
         </div>

         <div className="bg-[#1e1e1e]/60 backdrop-blur-[25px] border-[0.5px] border-white/10 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-fuchsia-400" /> Technology Stack
            </h3>
            <div className="space-y-2 px-2 pb-1">
               {['Quantum-Safe Encryption', 'AI-Driven Security', 'Glassmorphism Architecture'].map(tech => (
                  <div key={tech} className="flex items-center gap-3">
                     <span className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full" />
                     <span className="text-slate-300 text-sm">{tech}</span>
                  </div>
               ))}
            </div>
         </div>

         <div className="bg-gradient-to-tr from-amethyst-900/40 to-[#1e1e1e]/80 backdrop-blur-[25px] border-[0.5px] border-amethyst-500/30 rounded-3xl p-6 shadow-[0_10px_40px_rgba(168,85,247,0.15)] text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-[0.05] mix-blend-overlay pointer-events-none" />
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Engineered By</p>
            <h3 className="text-xl font-black text-white flex items-center justify-center gap-1.5 drop-shadow-md tracking-tight">
              Rahul Kushwah <BadgeCheck className="w-5 h-5 text-amethyst-400" />
            </h3>
         </div>

         {/* Interactive Legal Links */}
         <div className="bg-[#1e1e1e]/60 backdrop-blur-[25px] border-[0.5px] border-white/10 rounded-3xl p-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            {[
              { label: 'Privacy Policy', content: 'Our Privacy Policy ensures your data remains fundamentally yours, secured by quantum-resistant architecture and strict zero-logging policies for your core interactions.' },
              { label: 'Terms of Service', content: 'By accessing Vexox, you agree to respect the secure matrix and maintain social fidelity. We maintain a zero-tolerance policy against toxic behavior and platform abuse.' },
              { label: 'Open Source Licenses', content: 'Vexox relies on incredible open-source tools. We thank the community of developers who make this high-performance architecture possible.' }
            ].map((item, idx) => (
              <button 
                key={item.label}
                onClick={() => openModal(item.label, item.content)}
                className={`w-full flex items-center justify-between px-4 py-4 text-slate-200 active:bg-white/5 transition-colors ${idx !== 0 && 'border-t border-white/5'}`}
              >
                <span className="text-sm font-medium">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            ))}
         </div>
      </div>

      <div className="mt-12 text-center flex flex-col items-center justify-center gap-2 opacity-50 pb-8">
         <span className="flex items-center gap-1.5 text-xs font-mono text-slate-400 tracking-wider">
           Proudly made in Bhind, India <Heart className="w-3 h-3 text-red-500 fill-red-500" />
         </span>
      </div>

      <AnimatePresence>
        {modalContent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setModalContent(null)}
          >
             <motion.div 
               initial={{ scale: 0.95, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.95, y: 20 }}
               onClick={e => e.stopPropagation()}
               className="w-full max-w-sm bg-[#1a1a1a] border-[0.5px] border-white/20 rounded-3xl overflow-hidden shadow-2xl relative"
             >
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                   <h3 className="font-bold text-white tracking-wide">{modalContent.title}</h3>
                   <button onClick={() => setModalContent(null)} className="p-1.5 bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors active:scale-95">
                     <X className="w-4 h-4" />
                   </button>
                </div>
                <div className="p-6">
                   <p className="text-slate-300 text-sm leading-relaxed">{modalContent.content}</p>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
