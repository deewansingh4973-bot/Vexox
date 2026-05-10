import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Music,
  Loader2,
  Volume2,
  VolumeX,
  Sparkles
} from "lucide-react";
import { cn } from "../lib/utils";
import { collection, query, orderBy, onSnapshot, where, doc, updateDoc, increment } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { playHaptic } from '../lib/haptics';

interface Reel {
  id: string;
  videoUrl: string;
  author: string;
  description: string;
  likes: number;
  comments: number;
}

interface Reaction {
  id: number;
  x: number;
  y: number;
}

const FALLBACK_REELS: Reel[] = [
  {
    id: "f1",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    author: "vexox_creator",
    description: "Nebula wonders ✨ #space #vexox",
    likes: 12400,
    comments: 428,
  },
  {
    id: "f2",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    author: "astro_boy",
    description: "Escape the matrix 🌌",
    likes: 8900,
    comments: 210,
  },
  {
    id: "f3",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    author: "cosmic_girl",
    description: "Joyride through reality 🚀",
    likes: 45100,
    comments: 1200,
  },
];

const AURAS = [
  "from-fuchsia-900/40 via-amethyst-900/20",
  "from-emerald-900/40 via-teal-900/20",
  "from-rose-900/40 via-orange-900/20",
  "from-blue-900/40 via-indigo-900/20",
  "from-yellow-900/40 via-red-900/20",
];

export default function Reels() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'reels'), 
      where('createdAt', '>', new Date('2020-01-01T00:00:00Z')),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reelsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reel[];
      setReels(reelsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reels');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const scrollPosition = e.currentTarget.scrollTop;
    const itemHeight = container.clientHeight;

    const newIndex = Math.round(scrollPosition / itemHeight);
    const displayedReels = reels.length > 0 ? reels : FALLBACK_REELS;
    if (
      newIndex !== currentIndex &&
      newIndex >= 0 &&
      newIndex < displayedReels.length
    ) {
      setCurrentIndex(newIndex);
      playHaptic();
    }
  };

  if (loading) {
     return (
      <div className="fixed inset-0 bg-charcoal z-30 overflow-hidden flex items-center justify-center">
         <Loader2 className="w-8 h-8 text-amethyst-500 animate-spin" />
      </div>
    );
  }

  const displayedReels = reels.length > 0 ? reels : FALLBACK_REELS;

  return (
    <div className="fixed inset-0 bg-black z-0 overflow-hidden">
      {/* Top Floating Header with Adaptive Glassmorphism */}
      <div className="absolute top-0 left-0 right-0 z-50 pt-safe px-4 py-4 flex items-center justify-between pointer-events-none bg-gradient-to-b from-amethyst-900/60 to-transparent backdrop-blur-[2px] pb-6 mix-blend-plus-lighter">
        <h1 className="text-2xl font-display font-bold text-white tracking-tight drop-shadow-md">Vexox</h1>
        <div className="flex items-center gap-4 text-white font-semibold text-lg drop-shadow-md pointer-events-auto">
          <button className="opacity-70 hover:opacity-100 transition-opacity">Following</button>
          <div className="w-1 h-1 bg-white rounded-full opacity-50" />
          <button className="opacity-100">For You</button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
      >
        {displayedReels.map((reel, index) => (
          <ReelItem
            key={`reel-${reel.id || index}`}
            reel={reel}
            index={index}
            isActive={index === currentIndex}
          />
        ))}
      </div>
    </div>
  );
}

function ReelItem({ reel, isActive, index }: { reel: Reel; isActive: boolean; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [hapticSyncActive, setHapticSyncActive] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && isPlaying && hapticSyncActive) {
      interval = setInterval(() => {
        playHaptic();
      }, 600);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPlaying, hapticSyncActive]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Add holographic reaction
    const newReaction = { id: Date.now() + Math.random(), x: e.clientX, y: e.clientY };
    setReactions(prev => [...prev, newReaction]);
    playHaptic();
    
    // Auto-remove reaction after animation
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 1500);

    // Toggle play state on simple tap (debounced naturally by pointerdown vs click if needed, but we just tie it to reaction)
    if (!isPlaying) {
       videoRef.current?.play().catch(() => setIsPlaying(false));
       setIsPlaying(true);
    }
  };

  const handleLike = async () => {
    playHaptic();
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);

    try {
      const reelRef = doc(db, 'reels', reel.id);
      await updateDoc(reelRef, {
        likes: increment(newIsLiked ? 1 : -1)
      });
    } catch (error) {
      setIsLiked(!newIsLiked);
      // handle error gracefully
    }
  };

  const handleShare = () => {
    playHaptic();
    alert('Sharing reel... You earned 0.1 V-Coin!');
  };

  const auraClass = AURAS[index % AURAS.length];

  return (
    <div className="h-full w-full snap-start relative bg-black flex items-center justify-center overflow-hidden">
      {/* Adaptive Background Aura */}
      <div className={cn("absolute inset-0 bg-gradient-to-tr to-transparent mix-blend-color z-0 pointer-events-none animate-pulse duration-[5000ms] transition-colors", auraClass)} />
      
      <video
        ref={videoRef}
        src={reel.videoUrl}
        className="w-full h-full object-cover relative z-10"
        loop
        playsInline
        preload="auto"
        muted={isMuted}
        crossOrigin="anonymous"
        onPointerDown={handlePointerDown}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Holographic Reactions Overlay */}
      <AnimatePresence>
        {reactions.map((reaction, i) => (
          <motion.div
            key={`reaction-${reaction.id}-${i}`}
            initial={{ scale: 0, opacity: 1, y: 0, rotate: -20 }}
            animate={{ scale: [0, 1.5, 1], opacity: [1, 1, 0], y: -100, rotate: 20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ left: reaction.x - 40, top: reaction.y - 40 }}
            className="absolute z-40 pointer-events-none drop-shadow-[0_0_20px_rgba(217,70,239,0.8)] mix-blend-screen"
          >
            <div className="relative">
              <Sparkles className="w-20 h-20 text-fuchsia-300 absolute -inset-2 animate-pulse" strokeWidth={1} />
              <Heart className="w-16 h-16 fill-fuchsia-500 text-amethyst-300 backdrop-blur-sm bg-white/10 rounded-full p-2 border border-fuchsia-400/50" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Play/Pause Indicator Overlay */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          >
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
              <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[12px] border-l-white border-b-8 border-b-transparent ml-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); playHaptic(); }}
        className="absolute top-24 right-4 z-20 p-2 bg-black/40 rounded-full backdrop-blur-xl border border-white/10"
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
      </button>

      {/* Right Actions Bar - Ultra Modern Glassmorphism */}
      <div className="absolute right-4 bottom-[120px] flex flex-col items-center gap-6 z-30">
        
        {/* Haptic Sync Icon */}
        <button
          onClick={(e) => { e.stopPropagation(); setHapticSyncActive(!hapticSyncActive); playHaptic(); }}
          className="flex flex-col items-center gap-1.5 group mb-2"
        >
          <div className={cn(
            "p-3 rounded-full backdrop-blur-[20px] transition-all border",
            hapticSyncActive 
              ? "bg-fuchsia-500/30 border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.5)]" 
              : "bg-[#1a0b2e]/40 border-white/10 group-active:scale-95"
          )}>
            <Sparkles className={cn(
              "w-6 h-6",
              hapticSyncActive ? "text-fuchsia-300 animate-pulse drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]" : "text-white"
            )} />
          </div>
          <span className={cn(
             "text-[9px] font-bold shadow-sm uppercase tracking-widest",
             hapticSyncActive ? "text-fuchsia-300" : "text-white/80"
          )}>Sync</span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); handleLike(); }}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="p-3 bg-[#1a0b2e]/40 rounded-full backdrop-blur-[20px] group-active:scale-90 transition-all border border-white/10">
            <Heart
              className={cn(
                "w-7 h-7 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]",
                isLiked ? "fill-fuchsia-500 text-fuchsia-500" : "text-white",
              )}
            />
          </div>
          <span className="text-white font-display text-[12px] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {reel.likes}
          </span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="p-3 bg-[#1a0b2e]/40 rounded-full backdrop-blur-[20px] group-active:scale-90 transition-all border border-white/10">
            <MessageCircle className="w-7 h-7 text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
          </div>
          <span className="text-white font-display text-[12px] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {reel.comments}
          </span>
        </button>

        <button onClick={handleShare} className="flex flex-col items-center gap-1 group">
          <div className="p-3 bg-[#1a0b2e]/40 rounded-full backdrop-blur-[20px] group-active:scale-90 transition-all border border-white/10">
            <Share2 className="w-7 h-7 text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
          </div>
          <span className="text-white font-display text-[12px] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Share
          </span>
        </button>

        <button className="p-2 bg-[#1a0b2e]/40 rounded-full backdrop-blur-[20px] active:scale-90 transition-all mt-2 border border-white/10">
          <MoreVertical className="w-5 h-5 text-white" />
        </button>

        <div className="w-12 h-12 rounded-full border-2 border-white/80 overflow-hidden mt-4 animate-[spin_6s_linear_infinite] flex items-center justify-center relative shadow-[0_0_20px_rgba(255,255,255,0.3)]">
          <div className="absolute inset-0 bg-gradient-to-r from-amethyst-500 to-fuchsia-500 opacity-50 mix-blend-overlay" />
          <div className="w-3 h-3 bg-white rounded-full absolute z-10 shadow-[0_0_10px_rgba(0,0,0,0.8)]" />
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=100"
            alt="Audio Album"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Bottom Info - Glassmorphism */}
      <div className="absolute bottom-20 left-4 right-20 z-20 bg-gradient-to-t from-[#120b1e]/80 to-transparent p-4 rounded-3xl backdrop-blur-sm border border-white/5">
        <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-3 drop-shadow-lg">
          @{reel.author}
          <button className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] uppercase font-bold backdrop-blur-md active:bg-white/20 transition-colors">
            Follow
          </button>
        </h3>
        <p className="text-white/90 text-sm font-medium mb-4 drop-shadow-md leading-relaxed">
          {reel.description}
        </p>
        <div className="flex items-center gap-2 text-white bg-white/10 w-max px-4 py-2 rounded-2xl backdrop-blur-[20px] text-xs font-semibold border border-white/10 shadow-lg">
          <Music className="w-4 h-4 text-amethyst-300" />
          <span className="marquee drop-shadow-sm">Original Audio - Vexox Creator</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-16 left-0 right-0 h-1 bg-white/10 z-30">
         <motion.div 
           className="h-full bg-gradient-to-r from-amethyst-400 to-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.8)]"
           style={{ width: `${progress}%` }}
         />
      </div>
    </div>
  );
}
