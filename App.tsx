import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "./lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { TabType } from "./types";
import Login from "./components/Login";
import TopBar from "./components/TopBar";
import BottomNav from "./components/BottomNav";
import Feed from "./components/Feed";
import AIShiksha from "./components/AIShiksha";
import Reels from "./components/Reels";
import Explore from "./components/Explore";
import ProfileView from "./components/ProfileView";
import Market from "./components/Market";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { Loader2, Shield, BatteryMedium, BatteryLow, RefreshCcw } from "lucide-react";
import { playHaptic } from "./lib/haptics";
import VexoxCamera from "./components/VexoxCamera";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType | "market">("home");
  const [tabKey, setTabKey] = useState(Date.now());
  const [showSplash, setShowSplash] = useState(true);
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const [showShiksha, setShowShiksha] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [lowPowerMode, setLowPowerMode] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const touchStartRef = React.useRef<{x: number, y: number} | null>(null);

  // Stealth Active Detection Engine
  useEffect(() => {
    if (!user) return;
    
    let engagementScore = 0;
    
    // Throttle the firebase update
    let lastUpdate = Date.now();
    
    const handleActivity = () => {
      engagementScore = Math.min(100, engagementScore + 5);
      
      const now = Date.now();
      if (engagementScore > 50 && now - lastUpdate > 10000) { // Sync every 10s if high engagement
         lastUpdate = now;
         updateDoc(doc(db, 'users', user.uid), {
            stealthEngagementLevel: engagementScore,
            lastActive: new Date()
         }).catch(() => {});
      }
    };
    
    window.addEventListener('pointerdown', handleActivity);
    window.addEventListener('scroll', handleActivity, { passive: true });
    
    const decayInterval = setInterval(() => {
      engagementScore = Math.max(0, engagementScore - 2);
    }, 5000);
    
    return () => {
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      clearInterval(decayInterval);
    };
  }, [user]);

  useEffect(() => {
    // Battery Monitor Simulator
    const checkBattery = async () => {
      if ('getBattery' in navigator) {
        const nav: any = navigator;
        const battery = await nav.getBattery();
        if (battery.level <= 0.2 && !battery.charging) {
          setLowPowerMode(true);
        }
        battery.addEventListener('levelchange', () => {
          setLowPowerMode(battery.level <= 0.2 && !battery.charging);
        });
      }
    };
    checkBattery();
    
    // Offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check Privacy Consent
    if (localStorage.getItem('vexox_privacy_accepted') === 'true') {
      setPrivacyAccepted(true);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      setShowShiksha(false);
      setActiveTab(customEvent.detail);
      setTabKey(Date.now());
      setShowUploadSheet(false);
    };
    const handleOpenUpload = () => setShowUploadSheet(true);

    window.addEventListener('NAVIGATE', handleNavigate);
    window.addEventListener('OPEN_UPLOAD_SHEET', handleOpenUpload);
    return () => {
      window.removeEventListener('NAVIGATE', handleNavigate);
      window.removeEventListener('OPEN_UPLOAD_SHEET', handleOpenUpload);
    };
  }, []);

  if (showSplash) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-amethyst-900/20 to-black pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10 text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amethyst-600 to-amethyst-400 rounded-3xl flex items-center justify-center text-white text-5xl font-black shadow-[0_0_80px_rgba(139,92,246,0.5)] border border-white/10">
            V
          </div>
          <p className="text-white/50 text-xs font-mono uppercase tracking-widest">Global • Official English</p>
        </motion.div>
      </div>
    );
  }

  if (appError) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
         <p className="text-red-400 font-mono mb-4">{appError}</p>
         <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-full text-white font-bold hover:bg-white/20 transition-colors">
            <RefreshCcw className="w-5 h-5" /> Retry Connection
         </button>
      </div>
    );
  }

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        {/* Shimmer Placeholder instead of generic loader */}
        <div className="w-24 h-24 rounded-3xl bg-white/5 overflow-hidden relative">
           <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black">
        {/* Force english Language Policy App-wide */}
        <div lang="en">
          <Login onSuccess={() => {}} />
        </div>
      </div>
    );
  }

  if (!privacyAccepted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
         <div className="absolute inset-0 bg-amethyst-900/10 backdrop-blur-3xl" />
         <motion.div 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           className="relative z-10 w-full max-w-sm bg-charcoal/80 border border-white/10 rounded-[32px] p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col items-center text-center gap-6"
         >
            <div className="w-16 h-16 rounded-full bg-amethyst-500/20 flex items-center justify-center border border-amethyst-500/30">
               <Shield className="w-8 h-8 text-amethyst-400" />
            </div>
            <div>
               <h2 className="text-2xl font-display font-bold text-white mb-2">Privacy Guard Active</h2>
               <p className="text-sm text-slate-400 leading-relaxed font-sans">
                 Vexox uses localized AI, Eye-Tracking, and Haptics for ultra-premium experiences. Data never leaves your device without explicit consent.
               </p>
            </div>
            <button 
              onClick={() => {
                localStorage.setItem('vexox_privacy_accepted', 'true');
                setPrivacyAccepted(true);
                playHaptic();
              }} 
              className="w-full py-4 mt-2 bg-gradient-to-r from-amethyst-600 to-indigo-600 rounded-2xl text-white font-bold text-[15px] shadow-[0_4px_20px_rgba(139,92,246,0.4)] active:scale-95 transition-transform"
            >
              Accept & Enter
            </button>
         </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Feed />;
      case "reels":
        return <Reels />;
      case "shiksha":
        return <AIShiksha onClose={() => window.dispatchEvent(new CustomEvent('NAVIGATE', { detail: 'home' }))} />;
      case "search":
        return <Explore />;
      case "profile":
        return <ProfileView user={user} />;
      case "market":
        return <Market />;
      default:
        return <Feed />;
    }
  };

  const PRIMARY_TABS = ["home", "search", "reels", "profile"];
  const SWIPE_ORDER: (TabType | "market")[] = ["home", "search", "reels", "profile"];
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchStartRef.current.x - touchEndX;
    const diffY = touchStartRef.current.y - touchEndY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 60) {
      if (diffX > 0) {
        if (activeTab === 'home') {
          window.dispatchEvent(new CustomEvent('OPEN_UPLOAD_SHEET'));
        } else {
          const currentIndex = SWIPE_ORDER.indexOf(activeTab);
          if (currentIndex !== -1 && currentIndex < SWIPE_ORDER.length - 1) {
            window.dispatchEvent(new CustomEvent('NAVIGATE', { detail: SWIPE_ORDER[currentIndex + 1] }));
          }
        }
      } 
      else {
        const currentIndex = SWIPE_ORDER.indexOf(activeTab);
        if (currentIndex !== -1 && currentIndex > 0) {
          window.dispatchEvent(new CustomEvent('NAVIGATE', { detail: SWIPE_ORDER[currentIndex - 1] }));
        }
      }
    }
  };

  return (
    <MotionConfig reducedMotion={lowPowerMode ? "always" : "user"}>
      <div lang="en" className="min-h-screen bg-black selection:bg-amethyst-500/30 font-sans" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        
        {/* Battery Info Overlay */}
        {lowPowerMode && (
           <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[60] pointer-events-none flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-md rounded-full text-yellow-500/80">
              <BatteryLow className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Low Power Mode</span>
           </div>
        )}

        {/* Offline Overlay */}
        {isOffline && (
           <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] pointer-events-none flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-full text-red-500/80">
              <span className="text-[10px] font-bold uppercase tracking-widest">Offline Mode</span>
           </div>
        )}

        {activeTab !== "reels" && activeTab !== "shiksha" && activeTab !== "search" && (
          <TopBar />
        )}

        <main className="relative z-10 min-h-screen">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`tab-${activeTab}-${tabKey}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", bounce: 0, duration: lowPowerMode ? 0.1 : 0.4 }}
              className="w-full h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        <AnimatePresence>
          {PRIMARY_TABS.includes(activeTab) && (
            <motion.div 
              initial={{ y: '100%', opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: "spring", bounce: 0.2, duration: lowPowerMode ? 0.2 : 0.5 }}
              className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
            >
              <BottomNav activeTab={activeTab as TabType} />
            </motion.div>
          )}
        </AnimatePresence>

        <VexoxCamera isOpen={showUploadSheet} onClose={() => setShowUploadSheet(false)} />

        {/* Removed AIShiksha Modal */}
      </div>
    </MotionConfig>
  );
}
