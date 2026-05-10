import React from 'react';
import { Home, Search, Plus, Play, User } from 'lucide-react';
import { playHaptic } from '../lib/haptics';
import { TabType } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface BottomNavProps {
  activeTab: TabType;
}

export default function BottomNav({ activeTab }: BottomNavProps) {
  const tabs = [
    { id: 'home' as TabType, icon: Home, label: 'Home' },
    { id: 'search' as TabType, icon: Search, label: 'Search' },
  ];

  const rightTabs = [
    { id: 'reels' as TabType, icon: Play, label: 'Reels' },
    { id: 'profile' as TabType, icon: User, label: 'Profile' },
  ];

  const handleNavigate = (id: TabType) => {
    playHaptic();
    window.dispatchEvent(new CustomEvent('NAVIGATE', { detail: id }));
  };

  const handleOpenCreationHub = () => {
    playHaptic();
    window.dispatchEvent(new CustomEvent('OPEN_UPLOAD_SHEET'));
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 pointer-events-none flex justify-center items-end px-2 sm:px-4 pb-2 pt-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[340px] bg-black/40 backdrop-blur-[25px] border border-white/10 p-2 flex items-center justify-between pointer-events-auto rounded-[2rem] shadow-[0_10px_40px_rgba(139,92,246,0.15)] relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-amethyst-900/10 to-transparent pointer-events-none" />
        
        {/* Left Tabs */}
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleNavigate(tab.id)}
              className="flex-1 flex flex-col justify-center items-center py-2 relative group transition-transform duration-200 active:scale-95"
            >
              {isActive && (
                <motion.div layoutId="nav-indicator" className="absolute inset-x-2 inset-y-1 bg-white/10 rounded-[1.5rem] border border-white/5" />
              )}
              <tab.icon 
                className={cn(
                  "w-6 h-6 transition-all duration-200 relative z-10",
                  isActive 
                    ? "text-white stroke-[2.5] scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" 
                    : "text-white/50 group-hover:text-white/80 stroke-[1.5]"
                )} 
              />
            </button>
          );
        })}

        {/* Center Create Button */}
        <button
          onClick={handleOpenCreationHub}
          className="flex-shrink-0 w-14 h-14 bg-gradient-to-tr from-fuchsia-600 to-amethyst-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.5)] border-2 border-black active:scale-90 transition-transform relative z-10 mx-1"
        >
          <Plus className="w-8 h-8 text-white stroke-[2.5]" />
        </button>

        {/* Right Tabs */}
        {rightTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleNavigate(tab.id)}
              className="flex-1 flex flex-col justify-center items-center py-2 relative group transition-transform duration-200 active:scale-95"
            >
              {isActive && (
                <motion.div layoutId="nav-indicator" className="absolute inset-x-2 inset-y-1 bg-white/10 rounded-[1.5rem] border border-white/5" />
              )}
              <tab.icon 
                className={cn(
                  "w-6 h-6 transition-all duration-200 relative z-10",
                  isActive 
                    ? "text-white stroke-[2.5] scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" 
                    : "text-white/50 group-hover:text-white/80 stroke-[1.5]"
                )} 
              />
            </button>
          );
        })}
      </motion.div>
    </nav>
  );
}
