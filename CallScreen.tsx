import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhoneOff, MicOff, Mic, Video, VideoOff, Camera, RefreshCw, AudioLines, Globe, User, Radio, Box } from 'lucide-react';
import { playHaptic } from '../lib/haptics';

interface CallScreenProps {
  type: 'voice' | 'video';
  peer: any;
  onEnd: () => void;
}

export default function CallScreen({ type, peer, onEnd }: CallScreenProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isHologram, setIsHologram] = useState(false);
  const [aiDubbingLanguage, setAiDubbingLanguage] = useState<'EN'|'HI'|'ES'|null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnecting(false);
      playHaptic();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      className={`absolute inset-0 z-[60] flex flex-col pt-10 preserve-3d overflow-hidden ${type === 'video' && !isVideoOff && !isConnecting ? 'bg-zinc-900' : 'bg-[#0a0a0c]'}`}
    >
      {/* Background Holographic Glow for Voice Call or AR Mode */}
      {(type === 'voice' || isVideoOff || isConnecting || isHologram) && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-amethyst-900/30 via-[#0a0a0c] to-black pointer-events-none" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3], rotateY: isHologram ? [0, 360] : 0 }} 
            transition={{ repeat: Infinity, duration: isHologram ? 10 : 2, ease: "linear" }}
            className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 ${isHologram ? 'bg-cyan-600/20 shadow-[0_0_100px_rgba(6,182,212,0.8)]' : 'bg-amethyst-600/30'} rounded-full blur-3xl pointer-events-none`} 
          />
        </>
      )}

      {/* Holographic 3D Projection Simulation */}
      {isHologram && !isConnecting && (
         <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none z-0">
             <motion.div 
               animate={{ rotateY: [0, 15, -15, 0] }}
               transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
               className="relative w-full max-w-sm aspect-[1/2] border border-cyan-500/30 rounded-full shadow-[inset_0_0_50px_rgba(6,182,212,0.5)] flex items-center justify-center overflow-hidden preserve-3d"
             >
                <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.2)_1px,transparent_1px)] bg-[size:100%_4px] mix-blend-screen opacity-50" />
                <img src={peer.image} alt={peer.name} className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-60 blur-[1px]" />
                <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-cyan-500/80 to-transparent mix-blend-screen" />
                <div className="absolute bottom-10 animate-pulse text-cyan-300 font-mono text-[10px] tracking-widest text-center w-full">LIDAR CALIBRATING...</div>
             </motion.div>
         </div>
      )}

      {/* Video Simulation */}
      {type === 'video' && !isVideoOff && !isConnecting && !isHologram && (
        <div className="absolute inset-0 z-0 bg-zinc-800 flex items-center justify-center">
            <video src="https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-a-video-call-with-her-laptop-34440-large.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-32 max-w-xs mx-auto text-center w-full bg-black/40 backdrop-blur px-4 py-2 rounded-xl text-white font-mono text-xs opacity-70">
              <AudioLines className="w-4 h-4 inline-block mr-2 animate-pulse text-green-400" />
              End-to-End Encrypted Link
            </div>
        </div>
      )}

      {/* Header Info */}
      <div className="pt-6 px-6 flex justify-between items-start relative z-10">
         <div className="flex bg-black/40 backdrop-blur-md rounded-xl p-2 border border-white/10 items-center justify-between w-full shadow-lg">
             <div className="flex items-center gap-3">
               {(type === 'voice' || isVideoOff || isConnecting || isHologram) ? (
                 <img src={peer.image} alt={peer.name} className="w-14 h-14 rounded-full object-cover border-2 border-amethyst-500 shadow-[0_0_20px_rgba(139,92,246,0.6)]" />
               ) : (
                 <div className="w-14 h-14 rounded-full bg-black border-2 border-green-500 flex items-center justify-center overflow-hidden relative">
                   <div className="absolute inset-0 bg-green-500/20 blur-md animate-pulse" />
                   <Video className="w-6 h-6 text-green-400 relative z-10" />
                 </div>
               )}
               <div className="flex flex-col">
                 <h2 className="text-xl font-black tracking-wider text-white drop-shadow-md uppercase">{peer.name}</h2>
                 <p className="text-amethyst-300 font-mono text-xs font-bold">{isConnecting ? 'Quantum Link Establishing...' : '01:24 : SECURE'}</p>
               </div>
             </div>
         </div>
      </div>
      
      {/* Target 2027 AR Auto-Translate HUD */}
      {!isConnecting && (
        <div className="absolute top-28 left-6 right-6 z-20 flex flex-col gap-2 pointer-events-auto">
           <button 
             onClick={() => { playHaptic(); setAiDubbingLanguage(aiDubbingLanguage === null ? 'EN' : aiDubbingLanguage === 'EN' ? 'HI' : aiDubbingLanguage === 'HI' ? 'ES' : null); }}
             className={`self-end px-3 py-1.5 rounded-lg border backdrop-blur-md text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${aiDubbingLanguage ? 'bg-fuchsia-600/30 border-fuchsia-400 text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.5)]' : 'bg-black/50 border-white/20 text-slate-400 hover:text-white'}`}
           >
             <Globe className="w-3.5 h-3.5" />
             AI Voice Clone: {aiDubbingLanguage ? `ON (${aiDubbingLanguage})` : 'OFF'}
           </button>
           
           <AnimatePresence>
             {aiDubbingLanguage && (
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="self-end bg-fuchsia-500/10 border border-fuchsia-500/30 rounded px-2 py-1 text-[9px] font-mono text-fuchsia-400 mt-1 flex items-center gap-1 shadow-md">
                 <Radio className="w-3 h-3 animate-pulse" /> Real-time Lip-Sync Active
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      )}

      <div className="flex-1" />

      {/* Advanced Controls */}
      <div className="pb-12 px-6 grid grid-cols-4 gap-4 items-center relative z-20 max-w-sm mx-auto w-full">
        {/* AR Projection Toggle */}
        <button 
          onClick={() => { playHaptic(); setIsHologram(!isHologram); }} 
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center backdrop-blur-xl transition-all ${isHologram ? 'bg-cyan-500 border border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.8)] text-white' : 'bg-charcoal/80 border border-white/10 text-slate-400'}`}
        >
           <Box className="w-5 h-5 mb-1" />
           <span className="text-[8px] font-black tracking-widest uppercase">3D AR</span>
        </button>

        <button 
          onClick={() => { playHaptic(); setIsVideoOff(!isVideoOff); }} 
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center backdrop-blur-xl transition-all ${isVideoOff ? 'bg-white text-black' : 'bg-charcoal/80 border border-white/10 text-white'}`}
        >
           {isVideoOff ? <VideoOff className="w-5 h-5 mb-1" /> : <Video className="w-5 h-5 mb-1" />}
           <span className="text-[8px] font-black tracking-widest uppercase">Video</span>
        </button>

        <button 
          onClick={() => { playHaptic(); setIsMuted(!isMuted); }} 
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center backdrop-blur-xl transition-all ${isMuted ? 'bg-white text-black' : 'bg-charcoal/80 border border-white/10 text-white'}`}
        >
           {isMuted ? <MicOff className="w-5 h-5 mb-1" /> : <Mic className="w-5 h-5 mb-1" />}
           <span className="text-[8px] font-black tracking-widest uppercase">Mute</span>
        </button>

        <button 
          onClick={() => { playHaptic(); onEnd(); }} 
          className="w-14 h-14 rounded-2xl bg-red-600 hover:bg-red-500 flex flex-col items-center justify-center text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-transform active:scale-95 border border-red-400/50"
        >
           <PhoneOff className="w-5 h-5 mb-1" />
           <span className="text-[8px] font-black tracking-widest uppercase">End</span>
        </button>
      </div>
    </motion.div>
  );
}
