import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Phone, Video, Send, Mic, Image as ImageIcon, Plus, Paperclip, Eye, Brain, Activity, Bot, Sparkles, Reply } from 'lucide-react';
import { playHaptic } from '../lib/haptics';
import CallScreen from './CallScreen';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

interface ChatScreenProps {
  user: any;
  onBack: () => void;
}

export default function ChatScreen({ user, onBack }: ChatScreenProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([
    { id: '1', text: 'Hey! Did you see the new update?', isUser: false, time: '10:00 AM', sentiment: 'neutral', userId: 'bot' }
  ]);
  const [activeCall, setActiveCall] = useState<'voice' | 'video' | null>(null);
  
  // New Matrix States
  const [retinaLocked, setRetinaLocked] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [bciActive, setBciActive] = useState(false);
  const [autoPilot, setAutoPilot] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial Retina Scan simulation
    setScanning(true);
    const timer = setTimeout(() => {
      setScanning(false);
      setRetinaLocked(false);
      playHaptic();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!auth.currentUser || !user.id) return;
    
    // Generate distinct conversation ID for the two users
    const conversationId = [auth.currentUser.uid, user.id].sort().join('_');
    
    // Listen to real-time messages
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          isUser: data.userId === auth.currentUser?.uid,
          time: data.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      });
      if (msgs.length > 0) {
        setMessages(msgs);
      }
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'messages');
    });
    
    return () => unsubscribe();
  }, [user.id]);

  const handleSend = async () => {
    if (!message.trim() || !auth.currentUser) return;
    playHaptic();
    const msgText = message;
    setMessage('');
    setReplyingTo(null);
    setBciActive(false);
    
    try {
      const conversationId = [auth.currentUser.uid, user.id].sort().join('_');
      await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        text: msgText,
        userId: auth.currentUser.uid,
        recipientId: user.id,
        createdAt: serverTimestamp(),
        sentiment: 'neutral',
        replyTo: replyingTo ? replyingTo.id : null
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'conversations');
    }
  };

  const simulateHapticFeedback = (sentiment: string) => {
    playHaptic();
    if (sentiment === 'excited') {
      setTimeout(playHaptic, 100);
      setTimeout(playHaptic, 200);
    }
  };

  const handleSwipeToReply = (msg: any) => {
    playHaptic();
    setReplyingTo(msg);
  };

  if (activeCall) {
    return <CallScreen type={activeCall} peer={user} onEnd={() => setActiveCall(null)} />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      className="absolute inset-0 z-50 bg-[#060608] flex flex-col overflow-hidden"
    >
      {/* Retina-Lock Ghost Mode Overlay */}
      <AnimatePresence>
        {retinaLocked && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center pointer-events-auto"
          >
             <motion.div 
               animate={{ scale: scanning ? [1, 1.1, 1] : 1, opacity: scanning ? [0.5, 1, 0.5] : 1 }}
               transition={{ duration: 1.5, repeat: Infinity }}
               className="relative"
             >
                <Eye className={`w-24 h-24 ${scanning ? 'text-cyan-400 drop-shadow-[0_0_30px_rgba(6,182,212,0.8)]' : 'text-slate-600'}`} />
                {scanning && (
                  <motion.div 
                    initial={{ top: 0 }} animate={{ top: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-0 w-full h-1 bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,1)]"
                  />
                )}
             </motion.div>
             <p className="text-cyan-400 font-mono text-xs uppercase tracking-widest mt-6">
               {scanning ? 'Verifying Retina Signature...' : 'Shadow Dimension Locked'}
             </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="pt-safe px-4 py-3 border-b border-white/5 flex items-center justify-between bg-charcoal/80 backdrop-blur-xl z-20 shadow-[0_0_30px_rgba(147,51,234,0.1)] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 shadow-[0_0_15px_rgba(6,182,212,1)]" />
        <div className="flex items-center gap-3">
          <button onClick={() => { playHaptic(); onBack(); }} className="text-white active:scale-95 border-[0.5px] border-white/10 p-1.5 rounded-full bg-white/5">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 relative">
            <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-charcoal rounded-full" />
            <div>
              <h3 className="text-white font-bold text-[15px]">{user.name}</h3>
              <p className="text-cyan-400 text-[10px] font-bold font-mono uppercase tracking-widest flex items-center gap-1.5">
                 {autoPilot ? (
                    <><span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse shadow-[0_0_8px_rgba(217,70,239,0.9)]" /> <span className="text-fuchsia-400">AI TWIN ACTIVE</span></>
                 ) : (
                    <><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex items-center justify-center relative"><span className="absolute w-full h-full bg-cyan-400 rounded-full animate-ping opacity-75"></span></span> NEURAL LINK ACTIVE</>
                 )}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* AI Twin Auto-Pilot Toggle */}
          <button 
            onClick={() => { playHaptic(); setAutoPilot(!autoPilot); }} 
            className={`active:scale-95 transition-all p-1.5 rounded-full ${autoPilot ? 'bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.8)]' : 'bg-white/5 text-slate-400 border-[0.5px] border-white/10'}`}
          >
            <Bot className="w-5 h-5" />
          </button>
          <button onClick={() => { playHaptic(); setActiveCall('voice'); }} className="text-slate-300 active:scale-95 hover:text-amethyst-300 border-[0.5px] border-white/10 p-1.5 rounded-full bg-white/5">
            <Phone className="w-5 h-5" />
          </button>
          <button onClick={() => { playHaptic(); setActiveCall('video'); }} className="text-slate-300 active:scale-95 hover:text-amethyst-300 border-[0.5px] border-white/10 p-1.5 rounded-full bg-white/5">
            <Video className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 bg-[#0a0a0a] relative pb-32">
        {/* Background neural web */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
        
        <div className="text-center text-[10px] text-cyan-500/50 font-mono font-bold my-4 tracking-widest uppercase relative z-10 flex items-center justify-center gap-2">
           <span className="w-[1px] h-3 bg-cyan-500/30" />
           SESSION MATRIX LOG
           <span className="w-[1px] h-3 bg-cyan-500/30" />
        </div>
        
        {messages.map((msg, i) => (
          <motion.div 
            key={`msg-${msg.id || i}`} 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            drag="x"
            dragConstraints={{ left: 0, right: msg.isUser ? 0 : 80 }}
            dragElastic={0.1}
            onDragEnd={(e, info) => {
               if (!msg.isUser && info.offset.x > 50) {
                 handleSwipeToReply(msg);
               }
            }}
            whileDrag={{ scale: 0.98 }}
            className={`flex flex-col max-w-[80%] relative z-10 cursor-pointer ${msg.isUser ? 'self-end items-end' : 'self-start items-start'} touch-pan-y`}
          >
            {msg.replyTo && (
               <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 ml-2 font-mono bg-white/5 px-2 py-1 rounded-md border-[0.5px] border-white/5">
                 <Reply className="w-3 h-3 text-fuchsia-400" />
                 <span>Replying to {msg.replyTo}</span>
               </div>
            )}
            <div 
               onClick={() => simulateHapticFeedback(msg.sentiment)}
               className={`px-4 py-3 rounded-2xl shadow-lg relative overflow-hidden backdrop-blur-md ${msg.isUser ? 'bg-gradient-to-tr from-amethyst-600/90 to-indigo-600/90 text-white rounded-br-sm border-[0.5px] border-amethyst-400/30' : 'bg-black/40 text-white rounded-bl-sm border-[0.5px] border-white/10 hover:border-fuchsia-500/30 transition-colors'}`}
            >
              {/* 4D Emotional Haptics Indicator (Visual element for sentiment) */}
              {msg.sentiment === 'excited' && (
                 <div className="absolute top-0 right-0 w-8 h-8 bg-pink-500/20 blur-xl rounded-full pointer-events-none" />
              )}
              <p className="text-[15px] leading-relaxed relative z-10 font-medium">{msg.text}</p>
            </div>
            <span className="text-[9px] text-slate-500 mt-1.5 font-mono flex items-center gap-1 opacity-60">
               {msg.time} {msg.isUser && <span className="text-amethyst-400 font-black">✓✓</span>}
            </span>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Glassmorphism Input Bar */}
      <div className="fixed bottom-0 left-0 w-full p-4 z-40 pointer-events-none">
        {replyingTo && (
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="w-full max-w-md mx-auto mb-2 bg-[#1e1e1e]/90 backdrop-blur-md border-[0.5px] border-white/10 p-3 rounded-2xl flex items-start justify-between pointer-events-auto shadow-2xl"
           >
              <div>
                 <span className="text-xs text-fuchsia-400 font-bold mb-1 flex items-center gap-1"><Reply className="w-3 h-3" /> Replying to...</span>
                 <p className="text-sm text-slate-300 line-clamp-1">{replyingTo.text}</p>
              </div>
              <button onClick={() => setReplyingTo(null)} className="p-1 text-slate-400 hover:text-white"><Plus className="w-4 h-4 rotate-45" /></button>
           </motion.div>
        )}
        
        <div className="w-full max-w-md mx-auto pointer-events-auto">
          {autoPilot ? (
             <div className="w-full py-4 bg-black/60 backdrop-blur-[25px] border-[0.5px] border-white/10 rounded-full flex flex-col items-center justify-center gap-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                <Bot className="w-6 h-6 text-fuchsia-400 animate-bounce shadow-[0_0_15px_rgba(217,70,239,0.5)] rounded-full" />
                <span className="text-[10px] font-mono text-fuchsia-300 font-bold uppercase tracking-widest leading-none">AI Twin Generating...</span>
             </div>
          ) : (
            <div className="w-full bg-black/60 backdrop-blur-[25px] border-[0.5px] border-white/10 rounded-[2rem] p-1.5 flex items-center gap-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all">
              <button 
                onClick={() => { playHaptic(); setBciActive(!bciActive); }}
                className={`p-2.5 rounded-full transition-all active:scale-95 flex-shrink-0 ${bciActive ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-transparent text-slate-400 hover:text-white'}`}
              >
                <Brain className="w-6 h-6" />
              </button>
              
              <div className="flex-1 flex items-center relative min-w-0">
                {bciActive ? (
                  <div className="flex-1 flex items-center gap-2 pl-2 overflow-hidden">
                     <Activity className="w-4 h-4 text-cyan-400 animate-pulse flex-shrink-0" />
                     <span className="text-[10px] font-mono text-cyan-300 font-bold opacity-80 uppercase tracking-widest truncate max-w-full">Neural Link Input...</span>
                  </div>
                ) : (
                  <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="w-full bg-transparent text-white placeholder:text-slate-400 focus:outline-none py-2 text-[15px] font-medium px-2 min-w-0"
                  />
                )}
              </div>
              
              {!message && !bciActive && (
                <button className="p-2 text-amethyst-400 active:scale-95 hover:bg-white/5 rounded-full transition-colors mr-1 flex-shrink-0">
                  <Sparkles className="w-5 h-5" />
                </button>
              )}
              
              {message.trim() || bciActive ? (
                <button onClick={handleSend} className="p-3 bg-gradient-to-tr from-amethyst-500 to-fuchsia-500 rounded-full text-white active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.5)] border-[0.5px] border-white/20 flex-shrink-0">
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              ) : (
                <button className="p-3 bg-white/5 border-[0.5px] border-white/10 rounded-full text-slate-300 active:scale-95 hover:bg-white/10 hover:text-white transition-colors flex-shrink-0">
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
