import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Sparkles, Camera, Video, LayoutGrid, Radio,
  Wand2, Eye, Cpu, Layers, Mic, Scan, ArrowRight,
  MonitorPlay, Fingerprint, PenTool, Focus, BrainCircuit,
  BookOpen, Headphones, User, Tag, Globe, Box, Volume2, Smile, Vibrate, BookTemplate, Loader2
} from 'lucide-react';
import { playHaptic } from '../lib/haptics';
import { cn } from '../lib/utils';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, storage, auth, handleFirestoreError, OperationType } from '../lib/firebase';

interface VexoxCameraProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'Post' | 'Reel' | 'Study' | 'Story' | 'Live';

export default function VexoxCamera({ isOpen, onClose }: VexoxCameraProps) {
  const [mode, setMode] = useState<Mode>('Reel');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeToggles, setActiveToggles] = useState<Record<string, boolean>>({
    upscaling: true,
    eyeContact: true,
    timeBender: true,
    magicEraser: false,
    spatialAudio: true,
    lidarScan: false,
    tiltPhoto: false,
    collabCanvas: false,
    secretVault: false,
    aiActing: false,
    multiView: false,
    
    // AI & Education (Target 2027)
    arSmartLens: true,
    airWriting: false,
    binauralAudio: false,
    digitalTwin: false,
    semanticTagging: true,

    // Advanced Live & Broadcast
    multicastPro: false,
    depthProjection: false,
    lipSyncFixer: true,
    arWhiteboard: false,
    liveSentiment: true,
    hapticRecording: false,
  });

  const modes: Mode[] = ['Post', 'Reel', 'Study', 'Story', 'Live'];

  const toggleFeature = (key: string) => {
    playHaptic();
    setActiveToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getToolsForMode = () => {
    switch (mode) {
      case 'Study':
        return [
          { key: 'arSmartLens', label: 'AR Smart-Lens', icon: <BookOpen className="w-5 h-5" /> },
          { key: 'airWriting', label: 'Neon Canvas', icon: <PenTool className="w-5 h-5" /> },
          { key: 'binauralAudio', label: 'Binaural Audio', icon: <Headphones className="w-5 h-5" /> },
          { key: 'digitalTwin', label: 'Digital Twin', icon: <User className="w-5 h-5" /> },
          { key: 'semanticTagging', label: 'Concept Tags', icon: <Tag className="w-5 h-5" /> },
        ];
      case 'Reel':
        return [
          { key: 'timeBender', label: 'Time-Bender', icon: <Focus className="w-5 h-5" /> },
          { key: 'magicEraser', label: 'Magic Eraser', icon: <Wand2 className="w-5 h-5" /> },
          { key: 'spatialAudio', label: '8D Audio', icon: <Volume2 className="w-5 h-5" /> },
        ];
      case 'Post':
        return [
          { key: 'lidarScan', label: '3D LiDAR', icon: <Scan className="w-5 h-5" /> },
          { key: 'tiltPhoto', label: 'Tilt Photos', icon: <Layers className="w-5 h-5" /> },
        ];
      case 'Story':
        return [
          { key: 'collabCanvas', label: 'Collab Canvas', icon: <PenTool className="w-5 h-5" /> },
          { key: 'secretVault', label: 'Secret Vault', icon: <Fingerprint className="w-5 h-5" /> },
        ];
      case 'Live':
        return [
          { key: 'multicastPro', label: 'Multicast', icon: <Globe className="w-5 h-5" /> },
          { key: 'depthProjection', label: '3D Depth', icon: <Box className="w-5 h-5" /> },
          { key: 'lipSyncFixer', label: 'Lip-Sync Fix', icon: <Mic className="w-5 h-5" /> },
          { key: 'arWhiteboard', label: 'Collab Board', icon: <BookTemplate className="w-5 h-5" /> },
          { key: 'liveSentiment', label: 'Mood Analyzer', icon: <Smile className="w-5 h-5" /> },
          { key: 'hapticRecording', label: 'Haptic Rec', icon: <Vibrate className="w-5 h-5" /> },
        ];
      default:
        return [];
    }
  };

  const commonTools = [
    { key: 'eyeContact', label: 'Eye-Contact Fix', icon: <Eye className="w-5 h-5" /> },
    { key: 'aiActing', label: 'AI Coach', icon: <Cpu className="w-5 h-5" /> },
    { key: 'multiView', label: 'Multi-View', icon: <MonitorPlay className="w-5 h-5" /> },
  ];

  const handleCapture = () => {
    playHaptic();
    if (mode === 'Live') {
      alert("Live streaming capabilities opening soon!");
      return;
    }
    if (fileInputRef.current) {
      if (mode === 'Reel') {
        fileInputRef.current.accept = 'video/*';
      } else {
        fileInputRef.current.accept = 'image/*,video/*';
      }
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processUpload(file);
    }
  };

  const processUpload = async (file: File) => {
    if (!auth.currentUser) {
      alert("Must be logged in to upload");
      return;
    }
    
    setIsUploading(true);
    setProgress(0);
    
    try {
      const isVideo = file.type.startsWith('video');
      const folder = mode === 'Reel' || isVideo ? 'reels' : mode === 'Story' ? 'stories' : 'posts';
      const storageRef = ref(storage, `${folder}/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed', 
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        },
        (error) => {
           console.error("Upload error", error);
           setIsUploading(false);
           alert("Failed to upload.");
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          
          if (mode === 'Reel') {
             await addDoc(collection(db, 'reels'), {
               userId: auth.currentUser!.uid,
               username: auth.currentUser!.displayName || 'User',
               avatar: auth.currentUser!.photoURL || 'https://i.pravatar.cc/150?img=11',
               videoUrl: downloadUrl,
               likes: 0,
               comments: 0,
               shares: 0,
               createdAt: serverTimestamp()
             });
          } else if (mode === 'Story') {
             await addDoc(collection(db, 'stories'), {
               userId: auth.currentUser!.uid,
               name: auth.currentUser!.displayName || 'User',
               image: auth.currentUser!.photoURL || 'https://i.pravatar.cc/150?img=11',
               bg: downloadUrl,
               createdAt: serverTimestamp(),
               isUser: true
             });
          } else {
             await addDoc(collection(db, 'posts'), {
               authorId: auth.currentUser!.uid,
               authorName: auth.currentUser!.displayName || 'User',
               authorPhoto: auth.currentUser!.photoURL || null,
               imageUrl: downloadUrl,
               likesCount: 0,
               commentsCount: 0,
               createdAt: serverTimestamp(),
               content: 'Captured via Vexox'
             });
          }
          
          playHaptic();
          setIsUploading(false);
          onClose();
        }
      );
    } catch (error) {
       handleFirestoreError(error, OperationType.CREATE, mode === 'Reel' ? 'reels' : mode === 'Story' ? 'stories' : 'posts');
       setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)', filter: 'blur(20px)', opacity: 0 }}
          animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', filter: 'blur(0px)', opacity: 1 }}
          exit={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)', filter: 'blur(20px)', opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="fixed inset-0 z-[200] bg-black overflow-hidden flex flex-col font-sans pb-[130px]"
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          
          {isUploading && (
            <div className="absolute inset-0 z-[300] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                 <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-0 rounded-full border-b-2 border-l-2 border-amethyst-400" />
                 <Sparkles className="w-8 h-8 text-amethyst-300 animate-pulse" />
              </div>
              <h3 className="text-white font-display font-bold text-xl mb-2">Processing {mode}...</h3>
              <p className="text-amethyst-300 text-xs tracking-wider mb-6">16K QUALITY / 60FPS ENGINE</p>
              
              <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-amethyst-600 to-amethyst-300"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-slate-400 text-sm mt-3">{Math.round(progress)}% completed</span>
            </div>
          )}

          {/* Top Bar - Ultra Minimal */}
          <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-6 pt-14 pb-4">
            <button 
              onClick={() => { playHaptic(); onClose(); }}
              className="w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-[20px] rounded-full text-white active:scale-95 transition-all border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <button
               onClick={() => toggleFeature('upscaling')}
               className={cn(
                 "px-4 py-2 rounded-full border font-bold tracking-widest text-[9px] backdrop-blur-[20px] flex items-center gap-2 transition-all uppercase", 
                 activeToggles.upscaling 
                   ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/50 shadow-[0_0_20px_rgba(217,70,239,0.3)]' 
                   : 'bg-black/40 text-white/50 border-white/10'
               )}
            >
              <Camera className="w-3 h-3" />
              16K PRO {activeToggles.upscaling ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Viewfinder Area (Edge-to-Edge) */}
          <div className="flex-1 relative w-full h-full overflow-hidden bg-zinc-900">
            <img src="https://images.unsplash.com/photo-1616091093714-c64882e9ab55?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Camera Viewfinder" />
            
            {/* Soft dark vignette */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
            
            {/* Viewfinder Overlays */}
            
            {/* Center Focus Reticle */}
            <motion.div 
               animate={activeToggles.eyeContact ? {
                 scale: [1, 1.02, 1],
                 opacity: [0.3, 0.6, 0.3],
               } : {}}
               transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 pointer-events-none opacity-40 mix-blend-screen"
            >
               <div className="absolute top-0 left-0 w-8 h-8 border-t-[1px] border-l-[1px] border-white/50" />
               <div className="absolute top-0 right-0 w-8 h-8 border-t-[1px] border-r-[1px] border-white/50" />
               <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[1px] border-l-[1px] border-white/50" />
               <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[1px] border-r-[1px] border-white/50" />
            </motion.div>

            {/* AI HUD Indicators */}
            <AnimatePresence>
              {activeToggles.eyeContact && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute top-32 left-1/2 -translate-x-1/2"
                >
                  <div className="px-3 py-1 bg-black/40 border border-fuchsia-500/30 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(217,70,239,0.2)]">
                    <Sparkles className="w-3 h-3 text-fuchsia-400 mr-2 animate-pulse" />
                    <span className="text-fuchsia-300 text-[8px] font-bold tracking-[0.2em] uppercase">AI Focus Active</span>
                  </div>
                </motion.div>
              )}

              {activeToggles.timeBender && mode === 'Reel' && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="absolute top-1/2 left-4 -translate-y-1/2"
                >
                  <div className="flex flex-col items-center gap-1 opacity-60">
                    <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-cyan-400 to-transparent" />
                    <span className="text-cyan-400 font-mono text-[9px] -rotate-90 origin-center tracking-widest whitespace-nowrap mb-6 mt-6">CHRONOS SYNC</span>
                    <div className="w-[1px] h-12 bg-gradient-to-t from-transparent via-cyan-400 to-transparent" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tools Panel - Ultra Sleek */}
          <div className="absolute bottom-[200px] left-0 right-0 px-4">
             <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x">
               {[{ key: 'auto', label: 'Auto', icon: <Wand2 className="w-4 h-4" /> }, ...getToolsForMode(), ...commonTools].map((tool, i) => {
                  const isAuto = tool.key === 'auto';
                  const isActive = isAuto ? Object.values(activeToggles).every(v => v === false) : activeToggles[tool.key as keyof typeof activeToggles];
                  
                  return (
                    <button
                      key={tool.key}
                      onClick={() => !isAuto && toggleFeature(tool.key)}
                      className={cn(
                        "snap-start flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-[20px] transition-all active:scale-95 whitespace-nowrap border",
                        isActive 
                          ? 'bg-black/60 border-fuchsia-500/50 text-white shadow-[0_0_20px_rgba(217,70,239,0.2)]' 
                          : 'bg-black/40 border-white/10 text-white/50 hover:bg-black/60 hover:text-white'
                      )}
                    >
                      <div className={cn("transition-colors", isActive ? "text-fuchsia-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]" : "text-white/50")}>
                        {tool.icon}
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold tracking-wider uppercase transition-colors"
                      )}>
                        {tool.label}
                      </span>
                    </button>
                 );
               })}
             </div>
          </div>

          {/* Mode Selector & Capture - Modernized */}
          <div className="absolute bottom-0 left-0 right-0 h-[180px] flex flex-col items-center justify-end pb-12 z-30 pointer-events-none">
            
            {/* Text Mode Ring */}
            <div className="relative w-full h-12 flex justify-center items-center overflow-hidden mb-6 pointer-events-auto filter mask-image-[linear-gradient(to_right,transparent,black_30%,black_70%,transparent)]" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 30%, black 70%, transparent)' }}>
               <div className="flex items-center justify-center transition-transform duration-500 ease-out z-10 w-full relative h-full">
                 {modes.map((m, i) => {
                   const isActive = mode === m;
                   const activeIndex = modes.indexOf(mode);
                   const distance = i - activeIndex;
                   
                   const xOffset = distance * 70;
                   const scale = isActive ? 1 : 0.8;
                   const opacity = isActive ? 1 : 0.3;
                   
                   return (
                     <motion.button
                       key={m}
                       onClick={() => { playHaptic(); setMode(m); }}
                       animate={{ 
                         x: xOffset,
                         scale: scale,
                         opacity: opacity,
                         color: isActive ? '#ffffff' : '#ffffff'
                       }}
                       transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                       className="absolute uppercase font-bold tracking-[0.15em] text-[11px]"
                       style={{ zIndex: isActive ? 50 : 10 }}
                     >
                       <span className={isActive ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : ''}>{m}</span>
                     </motion.button>
                   );
                 })}
               </div>
            </div>

            {/* Modern Capture Button */}
            <button 
              onClick={handleCapture}
              className="relative w-24 h-24 rounded-full flex items-center justify-center p-1 active:scale-90 transition-transform group pointer-events-auto"
            >
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border-[3px] border-white/80 group-hover:border-white transition-colors" />
              
              {/* Inner Button Space */}
              <div className="w-[82px] h-[82px] bg-white rounded-full group-hover:scale-95 transition-transform flex items-center justify-center overflow-hidden">
                 {mode === 'Live' ? <div className="w-10 h-10 bg-red-500 rounded-sm animate-pulse" /> : null}
                 {mode === 'Reel' || mode === 'Story' ? <div className="w-8 h-8 rounded-full border-4 border-red-500" /> : null}
              </div>
            </button>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}