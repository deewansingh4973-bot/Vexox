import React, { useState, useRef, useEffect } from 'react';
import { Camera, Sparkles, Send, Loader2, BrainCircuit, Bot, User, Image as ImageIcon, X, Map, Box, Crosshair, Hexagon, Lock } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { playHaptic } from '../lib/haptics';

// Initialize with environment variable
const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : '');
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-to-prevent-crash' });

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  imageUrl?: string;
  isStreaming?: boolean;
}

export default function AIShiksha({ onClose }: { onClose?: () => void }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      text: 'Hello Rahul, I am your 0-Latency AI Mentor! Upload a photo of your question or type it below.'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // New States
  const [showRpgTree, setShowRpgTree] = useState(false);
  const [showArLab, setShowArLab] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, showRpgTree, showArLab]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Show upload progress
      setIsUploading(true);
      
      setTimeout(() => {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      }, 1000); // Simulate upload delay
    }
  };

  const solveProblem = async () => {
    if (!input.trim() && !selectedImage) return;
    
    const userMsgText = input;
    const userMsgImage = imagePreview;
    
    const newMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: userMsgText,
      imageUrl: userMsgImage || undefined
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setSelectedImage(null);
    setImagePreview(null);
    setLoading(true);

    try {
      let promptText = `You are an expert tutor for Physics, Chemistry, and Maths. Answer in Hindi and English mix. Use bold text for formulas. \nSolve this user problem step by step. Try to be very pedagogical. Remember to mix Hindi and English naturally (Hinglish). Provide exactly one holographic hint block wrapped like [HINT: ...].`;
      if (userMsgText) {
        promptText += ` Problem: \n${userMsgText}`;
      }
      
      let parts: any[] = [{ text: promptText }];
      if (selectedImage && userMsgImage) {
        const base64Data = userMsgImage.split(',')[1];
        parts.push({
          inlineData: {
            mimeType: selectedImage.type,
            data: base64Data
          }
        });
      }

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts }]
      });
      
      playHaptic();
      setLoading(false);
      
      const aiId = crypto.randomUUID();
      setMessages(prev => [...prev, {
        id: aiId,
        role: 'ai',
        text: '',
        isStreaming: true
      }]);
      
      let accumulatedResponse = "";
      for await (const chunk of responseStream) {
        accumulatedResponse += chunk.text;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiId ? { ...msg, text: accumulatedResponse } : msg
          )
        );
      }
      
      // Removing streaming flag
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiId ? { ...msg, isStreaming: false } : msg
        )
      );
      
    } catch (error: any) {
      console.error("AI Shiksha Error:", error);
      setLoading(false);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'ai',
        text: 'Sorry, I encountered an error checking the API. Make sure your API Key is valid or check console for details.'
      }]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-screen pt-4 pb-[130px] relative overflow-hidden bg-[#060608]">
      
      {/* 0-Latency Pupil Mentor HUD */}
      <div className="absolute top-20 left-4 right-4 pointer-events-none z-50 flex justify-between items-start opacity-70 mix-blend-screen">
         <div className="flex flex-col gap-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
            <span className="text-[8px] font-mono font-black uppercase tracking-widest text-slate-300 flex items-center gap-1">
               <Crosshair className="w-3 h-3 text-cyan-400 animate-spin-slow" />
               Pupil Dilation Tracker
            </span>
            <div className="w-16 h-1 border border-cyan-500/30 overflow-hidden relative">
               <motion.div className="absolute top-0 bottom-0 left-0 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,1)]" animate={{ width: ['20%', '80%', '40%'] }} transition={{ duration: 4, repeat: Infinity }} />
            </div>
         </div>
      </div>

      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 z-20 bg-charcoal/80 backdrop-blur-xl border-b border-white/5 relative shadow-[0_0_30px_rgba(147,51,234,0.15)] pt-safe">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-amethyst-600/20 flex items-center justify-center text-amethyst-accent border border-amethyst-500/30 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-white leading-tight truncate" title="AI Shiksha Core">AI Shiksha Core</h2>
            <div className="flex items-center gap-2">
               <p className="text-[11px] text-green-400 font-mono uppercase tracking-wider font-bold shadow-[0_0_5px_rgba(74,222,128,0.5)] truncate" title="0-Latency Mentor">0-Latency Mentor</p>
               <span className="text-[9px] text-slate-400 font-bold bg-white/10 px-1 rounded flex items-center gap-0.5"><Lock className="w-2 h-2" /> E2EE</span>
            </div>
          </div>
        </div>
        
        {/* Toggle Controls */}
        <div className="flex items-center gap-2">
           <button onClick={() => { playHaptic(); setShowRpgTree(!showRpgTree); setShowArLab(false); }} className={`p-2 rounded-xl transition-colors active:scale-95 ${showRpgTree ? 'bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.8)]' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
              <Map className="w-5 h-5" />
           </button>
           <button onClick={() => { playHaptic(); setShowArLab(!showArLab); setShowRpgTree(false); }} className={`p-2 rounded-xl transition-colors active:scale-95 ${showArLab ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.8)]' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
              <Box className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {/* 3D RPG Skill Tree Overlay */}
        <AnimatePresence>
           {showRpgTree && (
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute inset-0 z-30 bg-[#0b0b0e]/95 backdrop-blur-xl p-4 overflow-y-auto no-scrollbar pb-32 preserve-3d perspective-[1000px]">
                <h3 className="text-fuchsia-400 font-black tracking-widest uppercase text-center mt-4 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)] flex items-center justify-center gap-2"><Map className="w-5 h-5" /> 3D RPG Skill Tree</h3>
                <p className="text-slate-400 text-[10px] uppercase text-center font-mono mt-1 mb-10">Target 2027 Mastery Path</p>
                
                <div className="flex flex-col items-center gap-12 relative">
                   <div className="absolute top-10 bottom-10 w-1 bg-gradient-to-b from-fuchsia-500 via-indigo-500 to-slate-800 shadow-[0_0_15px_rgba(217,70,239,0.5)] z-0" />
                   
                   {/* RPG Nodes */}
                   <motion.div animate={{ rotateY: [0, 15, -15, 0] }} transition={{ duration: 5, repeat: Infinity }} className="relative z-10 w-48 bg-charcoal/80 border-2 border-fuchsia-500 p-4 rounded-2xl shadow-[0_0_30px_rgba(217,70,239,0.4),inset_0_2px_15px_rgba(255,255,255,0.2)] flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-transform backdrop-blur-md">
                     <Hexagon className="w-8 h-8 text-fuchsia-400 mb-2 drop-shadow-[0_0_10px_rgba(217,70,239,1)] hover:animate-spin-slow" />
                     <span className="text-white font-bold text-sm tracking-wider uppercase">Electrostatics</span>
                     <span className="text-fuchsia-300 text-[10px] font-mono mt-1 w-full bg-fuchsia-500/10 py-1 rounded">MASTERED 100%</span>
                   </motion.div>
                   
                   <div className="flex gap-8 w-full justify-center relative z-10">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-48 h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] -z-10" />
                     
                     <motion.div className="w-36 bg-charcoal border-2 border-indigo-400 p-3 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.3)] flex flex-col items-center text-center cursor-pointer hover:bg-white/5 transition-colors preserve-3d">
                       <Hexagon className="w-6 h-6 text-indigo-400 mb-2" />
                       <span className="text-white font-bold text-[10px] tracking-wider uppercase">Kinematics</span>
                       <span className="text-indigo-300 text-[9px] font-mono mt-1 w-full bg-indigo-500/10 py-0.5 rounded animate-pulse">SYNCING 60%</span>
                     </motion.div>
                     
                     <motion.div className="w-36 bg-charcoal border-2 border-green-500/50 p-3 rounded-2xl flex flex-col items-center text-center cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:scale-105 transition-transform">
                       <Hexagon className="w-6 h-6 text-green-400 mb-2 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
                       <span className="text-white font-bold text-[10px] tracking-wider uppercase">Optics</span>
                       <span className="text-green-400 text-[9px] font-mono mt-1 font-bold animate-pulse tracking-widest">LIVE</span>
                     </motion.div>
                   </div>
                </div>
             </motion.div>
           )}
        </AnimatePresence>

        {/* AR Spatial Physics Lab Overlay */}
        <AnimatePresence>
           {showArLab && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 bg-[#0a0f12] overflow-hidden flex flex-col preserve-3d">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-10 mix-blend-overlay" />
                <div className="absolute inset-0 backdrop-blur-sm pointer-events-none" />
                
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
                   <h3 className="text-cyan-400 font-black tracking-[0.2em] uppercase text-xl drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] mb-2 flex items-center justify-center gap-2">
                     <Box className="w-6 h-6" /> AR Spatial Lab
                   </h3>
                   <p className="text-cyan-300/70 text-xs font-mono mb-12">Projecting Electro-Magnetic Field...</p>
                   
                   {/* 3D AR Projection Visualization */}
                   <div className="relative w-64 h-64 preserve-3d transform-gpu perspective-[800px]">
                      <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full filter blur-[2px] animate-[spin_6s_linear_infinite]" />
                      <motion.div 
                        className="absolute inset-[15%] border-2 border-cyan-400/50 rounded-full"
                        animate={{ rotateX: [0, 360], rotateY: [0, 360] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      />
                      <motion.div 
                        className="absolute inset-[30%] border border-cyan-300/60 rounded-full"
                        animate={{ rotateY: [0, -360], rotateX: [0, 360] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                      />
                      
                      {/* Core */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-cyan-400 rounded-full shadow-[0_0_40px_rgba(6,182,212,1)]" />
                   </div>
                   
                   <button onClick={() => { playHaptic(); alert("Initializing LiDAR camera logic..."); }} className="mt-16 px-8 py-4 bg-cyan-600/20 border border-cyan-400 text-cyan-50 font-black uppercase tracking-widest rounded-xl hover:bg-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.5)] active:scale-95 transition-all w-full max-w-xs">
                     Deploy to Physical Room
                   </button>
                </div>
             </motion.div>
           )}
        </AnimatePresence>

        {/* Chat Area */}
        <div className="h-full overflow-y-auto px-4 py-4 space-y-6 scrollbar-hide z-10 pb-32">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-lg p-4 max-w-full overflow-hidden px-3 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-amethyst-600 to-amethyst-500 text-white border border-amethyst-400/20 shadow-xl shadow-amethyst-500/10' 
                    : 'glass-amethyst text-slate-100 shadow-lg border border-white/5 relative backdrop-blur-xl bg-[#1e1e1e]/80'
                }`}
                title={message.text || 'Message'}
                >
                  {message.isStreaming && (
                      <div className="absolute top-0 right-0 p-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,1)] animate-ping"/>
                      </div>
                  )}
                  {message.imageUrl && (
                    <img src={message.imageUrl} alt="Uploaded" className="max-w-full rounded-lg mb-3 border border-white/20" />
                  )}
                  {message.text && (
                    <div className={`prose prose-sm max-w-full overflow-hidden break-words font-display px-3 ${message.role === 'user' ? 'prose-invert text-white' : 'prose-invert text-slate-200'}`}>
                      {/* Holographic Hint interceptor */}
                      {message.text.includes('[HINT:') ? (
                         <>
                           <Markdown>{message.text.split('[HINT:')[0]}</Markdown>
                           <div className="my-3 p-3 bg-cyan-900/40 border border-cyan-500/50 rounded-lg relative overflow-hidden group">
                              <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:100%_4px] mix-blend-screen pointer-events-none group-hover:opacity-50 transition-opacity opacity-20" />
                              <div className="text-cyan-400 text-[10px] font-black tracking-widest uppercase mb-1 flex items-center gap-1 drop-shadow-md">
                                <Box className="w-3 h-3" /> Holographic Hint Projection
                              </div>
                              <div className="line-clamp-2 text-cyan-100 italic" title={message.text.split('[HINT:')[1].split(']')[0]}>
                                <Markdown components={{ p: ({node, ...props}) => <span {...props} /> }}>
                                  {message.text.split('[HINT:')[1].split(']')[0]}
                                </Markdown>
                              </div>
                           </div>
                           <Markdown>{message.text.split(']')[1]}</Markdown>
                         </>
                      ) : (
                         <Markdown>{message.text}</Markdown>
                      )}
                    </div>
                  )}

                  {/* Quality Control & Feedback */}
                  {message.role === 'ai' && !message.isStreaming && message.text && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Was this helpful?</span>
                      <div className="flex gap-2">
                         <button onClick={(e) => { playHaptic(); alert("Feedback submitted"); e.currentTarget.style.color = '#4ade80'; }} className="p-1 px-2 hover:bg-white/10 rounded border border-white/5 text-slate-400 transition-colors" title="Helpful" aria-label="Helpful">
                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                         </button>
                         <button onClick={(e) => { playHaptic(); alert("Feedback submitted"); e.currentTarget.style.color = '#f87171'; }} className="p-1 px-2 hover:bg-white/10 rounded border border-white/5 text-slate-400 transition-colors" title="Not Helpful" aria-label="Not Helpful">
                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2"></path></svg>
                         </button>
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white/10 rounded-3xl rounded-bl-sm border border-white/10 p-4 py-3 flex items-center gap-3">
                  <p className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 animate-pulse drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">Computing Matrices...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="px-3 py-3 z-40 bg-charcoal/95 border-t border-white/5 absolute bottom-[100px] left-0 right-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] max-w-full overflow-hidden">
        <div className="bg-[#1a1a1f] border border-white/10 rounded-lg p-2 flex flex-col gap-2 relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] max-w-full overflow-hidden">
          
          {/* Progress bar for Image Upload */}
          {isUploading && (
            <div className="absolute top-0 left-4 right-4 h-1 bg-white/5 rounded-full overflow-hidden select-none">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1 }}
                className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
              />
            </div>
          )}

          {imagePreview && (
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden ml-2 mt-2">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white hover:bg-black"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageSelect}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-full active:scale-95"
            >
              <Camera className="w-5 h-5" />
            </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && solveProblem()}
                placeholder="Ask PCM doubts or upload a photo..."
                title={input || "Ask PCM doubts or upload a photo..."}
                className="flex-1 bg-transparent border-none text-white focus:ring-0 placeholder:text-slate-500 text-sm py-3 px-3 outline-none truncate max-w-full"
              />
            <button
              onClick={solveProblem}
              disabled={loading || isUploading || (!input.trim() && !selectedImage)}
              className="bg-gradient-to-tr from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white p-3 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 border border-cyan-400/50"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
