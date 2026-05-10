import React, { useState, useEffect } from 'react';
import { User, updateEmail, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, User as UserIcon, Lock, Shield,
  EyeOff, Coins, ChevronRight, LogOut,
  QrCode, BadgeCheck, Languages, Fingerprint, Key,
  Siren, CameraOff, BrainCircuit, GraduationCap, Unlock,
  Palette, SlidersHorizontal, Settings2, ShieldQuestion,
  Download, Clock, Users, Database, RefreshCw, Smartphone,
  Cpu, Network, Ghost, Activity, MessageCircle, Satellite,
  ShieldAlert, HardDrive, Volume2
} from 'lucide-react';
import { playHaptic } from '../lib/haptics';
import AboutSection from './AboutSection';

interface SettingsMenuProps {
  user: User;
  onBack: () => void;
}

export default function SettingsMenu({ user, onBack }: SettingsMenuProps) {
  // State for all dynamic settings
  const [prefs, setPrefs] = useState({
    // Account
    language: 'English',
    twoFactor: false,
    
    // Vault & Security
    biometrics: true,
    duressPin: false,
    keystrokeDynamics: true,
    antiScreenshot: true,
    steganography: false,

    // AI Shiksha
    target2027: true,
    studyToUnlock: false,
    microTestScroll: true,
    aiPersona: 'Mentor',

    // Display & UI
    theme: 'Dark-Amethyst',
    glassIntensity: 50,
    ultraHD: false,
    appIcon: 'Default',

    // Privacy
    ghostMode: false,
    activeStatus: true,
    offlineMesh: false,
    screenTime: true,

    // Deep-Tech: Ultra Vault
    quantumEncryption: false,
    blockchainSync: false,
    onDeviceAI: true,
    stealthMode: false,
    
    // Deep-Tech: Neural & Experimental
    bciSync: false,
    aiMoodAnalyzer: true,
    aiConflictResolver: false,
    aiAutoReply: false,

    // Deep-Tech: Global Safety
    satelliteSos: false,
    selfHealingUi: true,
    
    // Sensory
    uiSounds: 'Cyber'
  });

  const [activePage, setActivePage] = useState<string | null>(null);

  const updatePref = (key: keyof typeof prefs, value: any) => {
    playHaptic();
    setPrefs(p => ({ ...p, [key]: value }));
  };

  const handleAction = async (action: string) => {
    playHaptic();
    if (action === 'Hardware-Level Kill Switch') {
      const confirmed = window.confirm("🚨 WARNING: This will obliterate all local traces of Vexox. Proceed?");
      if(confirmed) alert("Initiating protocol. Terminating...");
    } else if (action === 'Clear Cache / Shadow Archive') {
      if(window.confirm("Purge Shadow Archive? This cannot be undone.")) {
         alert("Archive purged successfully. 0B used.");
      }
    } else {
      setActivePage(action);
    }
  };

  const handleSignOut = () => {
    playHaptic();
    if(window.confirm("Are you sure you want to sign out from Vexox?")) {
      auth.signOut();
    }
  };

  const Toggle = ({ active, onChange }: { active: boolean, onChange: () => void }) => (
    <button 
      onClick={() => { playHaptic(); onChange(); }}
      className={`relative w-12 h-6 rounded-full transition-colors flex items-center px-1 ${active ? 'bg-amethyst-500 shadow-[0_0_12px_rgba(147,51,234,0.6)]' : 'bg-white/10'}`}
    >
      <motion.div 
        animate={{ x: active ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </button>
  );

  const categories = [
    {
      title: "Account & Identity",
      icon: <UserIcon className="w-5 h-5 text-blue-400" />,
      items: [
        { label: "High-Def Profile Editor", type: "link" },
        { label: "Vexox ID & QR Code", icon: <QrCode className="w-4 h-4" />, type: "link" },
        { label: "Verification Badge Request", icon: <BadgeCheck className="w-4 h-4" />, type: "link" },
        { label: "App Language", type: "select", options: ['English', 'Hindi'], stateKey: 'language' as const },
        { label: "Two-Factor Authentication (2FA)", icon: <Key className="w-4 h-4" />, type: "toggle", stateKey: 'twoFactor' as const },
      ]
    },
    {
      title: "Vexox Vault & Ultra-High Security",
      icon: <Shield className="w-5 h-5 text-green-400" />,
      items: [
        { label: "Biometrics (Face/Fingerprint)", icon: <Fingerprint className="w-4 h-4" />, type: "toggle", stateKey: 'biometrics' as const },
        { label: "Duress PIN (Fake Vault)", type: "toggle", stateKey: 'duressPin' as const },
        { label: "Keystroke Dynamics", type: "toggle", stateKey: 'keystrokeDynamics' as const },
        { label: "Hardware-Level Kill Switch", icon: <Siren className="w-4 h-4 text-red-500" />, type: "button", color: "text-red-500" },
        { label: "Anti-Screenshot Shield", icon: <CameraOff className="w-4 h-4" />, type: "toggle", stateKey: 'antiScreenshot' as const },
        { label: "Invisible Steganography", type: "toggle", stateKey: 'steganography' as const },
      ]
    },
    {
      title: "AI Shiksha & PCM Target 2027",
      icon: <BrainCircuit className="w-5 h-5 text-amethyst-400" />,
      items: [
        { label: "Target 2027 Mode", type: "toggle", stateKey: 'target2027' as const },
        { label: "Study-to-Unlock Mode", icon: <Lock className="w-4 h-4" />, type: "toggle", stateKey: 'studyToUnlock' as const },
        { label: "Micro-Test Scroll", type: "toggle", stateKey: 'microTestScroll' as const },
        { label: "Guardian Bridge (Passkey)", type: "link" },
        { label: "AI Persona Selector", type: "select", options: ['Mentor', 'Friend', 'Strict'], stateKey: 'aiPersona' as const },
      ]
    },
    {
      title: "Display, Media & UI",
      icon: <Palette className="w-5 h-5 text-pink-400" />,
      items: [
        { label: "Theme Engine", type: "select", options: ['Dark-Amethyst', 'OLED Black'], stateKey: 'theme' as const },
        { label: "Glassmorphism Intensity", icon: <SlidersHorizontal className="w-4 h-4" />, type: "slider", stateKey: 'glassIntensity' as const },
        { label: "16K Ultra-HD Rendering", type: "toggle", stateKey: 'ultraHD' as const },
        { label: "Custom App Icon", icon: <Settings2 className="w-4 h-4" />, type: "link" },
        { label: "Download Manager", icon: <Download className="w-4 h-4" />, type: "link" },
      ]
    },
    {
      title: "Privacy, Network & Wellbeing",
      icon: <EyeOff className="w-5 h-5 text-slate-400" />,
      items: [
        { label: "Ghost Mode", type: "toggle", stateKey: 'ghostMode' as const },
        { label: "Active Status", type: "toggle", stateKey: 'activeStatus' as const },
        { label: "Offline Mesh Sharing", type: "toggle", stateKey: 'offlineMesh' as const },
        { label: "Screen Time & Break Alerts", icon: <Clock className="w-4 h-4" />, type: "toggle", stateKey: 'screenTime' as const },
        { label: "Blocked & Muted Accounts", icon: <Users className="w-4 h-4" />, type: "link" },
      ]
    },
    {
      title: "App Economy & System",
      icon: <Database className="w-5 h-5 text-yellow-400" />,
      items: [
        { label: "Vexox Coins & Rewards", icon: <Coins className="w-4 h-4" />, type: "link" },
        { label: "Clear Cache / Shadow Archive", type: "button", color: "text-orange-400" },
        { label: "Check for Updates", icon: <RefreshCw className="w-4 h-4" />, type: "link" },
        { label: "Log Out of All Devices", icon: <Smartphone className="w-4 h-4" />, type: "button", color: "text-red-400" },
      ]
    },
    {
      title: "Ultra-Vault & Military Security",
      icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
      items: [
        { label: "Quantum-Resistant Encryption", type: "toggle", stateKey: 'quantumEncryption' as const },
        { label: "Blockchain Vault Sync", icon: <Network className="w-4 h-4" />, type: "toggle", stateKey: 'blockchainSync' as const },
        { label: "On-Device AI Privacy (0% Cloud)", icon: <Cpu className="w-4 h-4" />, type: "toggle", stateKey: 'onDeviceAI' as const },
        { label: "Stealth & Camouflage Mode", icon: <Ghost className="w-4 h-4" />, type: "toggle", stateKey: 'stealthMode' as const },
        { label: "Secret Entry Logic", type: "link" },
      ]
    },
    {
      title: "Neural & Experimental Interface",
      icon: <BrainCircuit className="w-5 h-5 text-pink-500" />,
      items: [
        { label: "Brain-Computer Interface (BCI) Sync", icon: <Activity className="w-4 h-4" />, type: "toggle", stateKey: 'bciSync' as const },
        { label: "AI Mood & Behavior Analyzer", type: "toggle", stateKey: 'aiMoodAnalyzer' as const },
        { label: "AI Conflict Resolver", icon: <MessageCircle className="w-4 h-4" />, type: "toggle", stateKey: 'aiConflictResolver' as const },
        { label: "AI Auto-Reply Matrix", type: "toggle", stateKey: 'aiAutoReply' as const },
      ]
    },
    {
      title: "Global Safety & Legacy",
      icon: <Satellite className="w-5 h-5 text-blue-400" />,
      items: [
        { label: "Zero-Signal Satellite SOS", icon: <Satellite className="w-4 h-4" />, type: "toggle", stateKey: 'satelliteSos' as const },
        { label: "Digital Heritage & Legacy Manager", type: "link" },
        { label: "Self-Healing UI Engine", type: "toggle", stateKey: 'selfHealingUi' as const },
      ]
    },
    {
      title: "System, Storage & Sensory",
      icon: <HardDrive className="w-5 h-5 text-emerald-400" />,
      items: [
        { label: "Custom Sound Effects Engine", icon: <Volume2 className="w-4 h-4" />, type: "select", options: ['Click', 'Pop', 'Magic', 'Cyber'], stateKey: 'uiSounds' as const },
        { label: "Vexox Cloud Storage Dashboard", icon: <Database className="w-4 h-4" />, type: "button", color: "text-emerald-400" },
      ]
    },
    {
      title: "About",
      icon: <div className="w-5 h-5 flex items-center justify-center bg-amethyst-500/20 rounded-full border border-amethyst-500/50"><span className="text-amethyst-400 font-black italic text-xs">V</span></div>,
      items: [
        { label: "About Vexox", icon: <BadgeCheck className="w-4 h-4" />, type: "button", color: "text-amethyst-400" },
      ]
    }
  ];

  if (activePage) {
    if (activePage === 'About Vexox') {
      return <AboutSection onBack={() => setActivePage(null)} />
    }
    
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="max-w-2xl mx-auto px-4 pt-8 pb-[130px] min-h-screen bg-charcoal font-sans"
      >
        <div className="flex items-center gap-4 mb-8 sticky top-0 bg-charcoal/80 backdrop-blur-xl py-4 z-20 -mx-4 px-4 border-b border-white/5">
          <button onClick={() => { playHaptic(); setActivePage(null); }} className="p-2 bg-dark-grey rounded-full border border-white/10 text-white active:scale-95 transition-all shadow-md">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-white flex-1">{activePage}</h2>
        </div>

        {activePage === 'High-Def Profile Editor' && (
          <div className="bg-dark-grey/80 backdrop-blur-xl rounded-[24px] p-6 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-amethyst-300 text-xs font-bold uppercase tracking-wider">Display Name</label>
              <input defaultValue={user.displayName || ''} className="bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amethyst-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-amethyst-300 text-xs font-bold uppercase tracking-wider">Username</label>
              <input defaultValue="@" className="bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amethyst-500 transition-colors font-mono" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-amethyst-300 text-xs font-bold uppercase tracking-wider">High-Def Bio</label>
              <textarea rows={3} className="bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amethyst-500 transition-colors resize-none" defaultValue="Building the future." />
            </div>
            <button onClick={() => { playHaptic(); alert('Profile Saved!')}} className="w-full bg-amethyst-600 hover:bg-amethyst-500 text-white font-bold py-3.5 rounded-xl mt-4 active:scale-95 transition-all shadow-[0_4px_15px_rgba(147,51,234,0.4)]">
              Save Changes
            </button>
          </div>
        )}

        {activePage === 'Secret Entry Logic' && (
          <div className="bg-dark-grey/80 backdrop-blur-xl rounded-[24px] p-6 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/50">
              <Key className="w-8 h-8 text-red-500" />
            </div>
             <h3 className="text-xl font-bold text-white mb-2">Calculator Camouflage PIN</h3>
             <p className="text-slate-400 text-sm mb-6">Enter this PIN in the fake Calculator app to access Vexox.</p>
             <div className="flex justify-center gap-3 mb-8">
                {[1,2,3,4].map(i => <div key={`decoy-pin-field-${i}`} className="w-14 h-16 bg-charcoal border border-white/10 shadow-inner rounded-xl flex items-center justify-center text-3xl font-bold text-white">4</div>)}
             </div>
             <div className="grid grid-cols-3 gap-4 max-w-[240px] mx-auto mb-8">
                {[1,2,3,4,5,6,7,8,9,'C',0,'<'].map(num => (
                   <button key={`decoy-keypad-${num}`} onClick={playHaptic} className="h-14 bg-white/5 rounded-full border border-white/5 text-white font-bold hover:bg-white/10 active:scale-95 transition-all text-xl">{num}</button>
                ))}
             </div>
             <button onClick={() => { playHaptic(); alert('Decoy PIN Set!')}} className="w-full bg-amethyst-600 hover:bg-amethyst-500 text-white font-bold py-3.5 rounded-xl active:scale-95 transition-all shadow-[0_4px_15px_rgba(147,51,234,0.4)]">Enable Decoy PIN</button>
          </div>
        )}

        {activePage === 'Digital Heritage & Legacy Manager' && (
          <div className="bg-dark-grey/80 backdrop-blur-xl rounded-[24px] p-6 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] space-y-4">
             <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 border border-blue-500/50">
               <Users className="w-8 h-8 text-blue-400" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Assign Trusted Successor</h3>
             <p className="text-slate-400 text-sm mb-6">Specify an emergency contact to inherit your Vault keys.</p>
             
             <div className="flex flex-col gap-2">
               <label className="text-blue-300 text-xs font-bold uppercase tracking-wider">Successor Vexox ID</label>
               <input placeholder="@username" className="bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono" />
             </div>
             <div className="flex flex-col gap-2">
               <label className="text-blue-300 text-xs font-bold uppercase tracking-wider">Release Condition</label>
               <div className="relative">
                 <select className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none font-bold">
                   <option>Inactivity &gt; 30 Days</option>
                   <option>Inactivity &gt; 90 Days</option>
                   <option>Immediate Manual Approval</option>
                 </select>
                 <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none rotate-90" />
               </div>
             </div>
             <button onClick={() => { playHaptic(); alert('Legacy Set!')}} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl mt-4 active:scale-95 transition-all shadow-[0_4px_15px_rgba(37,99,235,0.4)]">Confirm Legacy Assignment</button>
          </div>
        )}

        {activePage === 'Vexox Cloud Storage Dashboard' && (
          <div className="bg-dark-grey/80 backdrop-blur-xl rounded-[24px] p-6 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
             <div className="flex items-end justify-between mb-2">
               <h3 className="text-4xl font-black text-white tracking-tight">4.2 TB</h3>
               <span className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">of 10 TB used</span>
             </div>
             <div className="w-full h-4 bg-charcoal rounded-full overflow-hidden flex gap-0.5 border border-white/10 mb-8 mt-4">
               <div className="h-full bg-amethyst-500" style={{ width: '30%' }} />
               <div className="h-full bg-pink-500" style={{ width: '10%' }} />
               <div className="h-full bg-blue-500" style={{ width: '2%' }} />
             </div>
             
             <div className="space-y-4 bg-charcoal/50 p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full bg-amethyst-500 shadow-[0_0_10px_rgba(147,51,234,0.8)]" />
                     <span className="text-slate-200 font-medium">16K Media Cache</span>
                   </div>
                   <span className="font-bold text-white font-mono">3.0 TB</span>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
                     <span className="text-slate-200 font-medium">3D LiDAR Scans</span>
                   </div>
                   <span className="font-bold text-white font-mono">1.0 TB</span>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                     <span className="text-slate-200 font-medium">PCM Target Notes</span>
                   </div>
                   <span className="font-bold text-white font-mono">0.2 TB</span>
                </div>
             </div>
             <button onClick={() => { playHaptic(); alert('Upgrade to 50TB Quantum Drive?'); }} className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 border border-white/10 rounded-xl mt-6 active:scale-95 transition-all">
               Upgrade Storage
             </button>
          </div>
        )}

        {activePage === 'Vexox Coins & Rewards' && (
          <div className="bg-gradient-to-br from-yellow-900/40 to-dark-grey rounded-[24px] p-8 border border-yellow-500/20 shadow-[0_8px_30px_rgba(234,179,8,0.15)] text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay" />
             <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 border-[4px] border-black/40 shadow-[0_0_30px_rgba(234,179,8,0.4)] relative z-10">
               <Coins className="w-12 h-12 text-black/80" />
             </div>
             <h3 className="text-5xl font-black text-white mb-2 tracking-tighter relative z-10">2,450</h3>
             <p className="text-yellow-400 font-bold uppercase tracking-widest text-xs mb-8 relative z-10">Vexox Coins Balance</p>
             
             <div className="grid grid-cols-2 gap-4 relative z-10">
               <button onClick={playHaptic} className="bg-yellow-500 text-black font-extrabold py-3.5 rounded-xl active:scale-95 transition-all shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                 Redeem Cash
               </button>
               <button onClick={playHaptic} className="bg-black/40 backdrop-blur-md text-white font-bold py-3.5 rounded-xl active:scale-95 transition-all hover:bg-white/10 border border-white/10">
                 Earn More
               </button>
             </div>
          </div>
        )}

        {!['High-Def Profile Editor', 'Secret Entry Logic', 'Digital Heritage & Legacy Manager', 'Vexox Cloud Storage Dashboard', 'Vexox Coins & Rewards'].includes(activePage) && (
          <div className="bg-dark-grey/80 backdrop-blur-xl rounded-[24px] p-8 flex flex-col items-center justify-center text-center min-h-[40vh] border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
             <div className="w-20 h-20 bg-emerald-900/50 rounded-full flex items-center justify-center mb-6 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
               <Settings2 className="w-10 h-10 text-emerald-400" />
             </div>
             <h3 className="text-2xl font-bold text-white mb-2">{activePage}</h3>
             <p className="text-slate-400 mb-8 max-w-sm">
               Developer dashboard fully exposed. Hardware integration parameters visible.
             </p>
             
             <div className="w-full space-y-3 bg-charcoal/50 p-4 rounded-xl border border-white/5 mb-8">
               <div className="flex items-center justify-between">
                 <span className="text-slate-300 font-mono text-sm">Telemetry</span>
                 <span className="text-emerald-400 font-mono text-sm font-bold">ACTIVE</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-slate-300 font-mono text-sm">Hardware Link</span>
                 <span className="text-yellow-400 font-mono text-sm font-bold animate-pulse">SYNCING</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-slate-300 font-mono text-sm">Encryption Core</span>
                 <span className="text-emerald-400 font-mono text-sm font-bold">LOCKED</span>
               </div>
             </div>

             <button onClick={() => { playHaptic(); setActivePage(null); }} className="bg-white/10 hover:bg-white/20 text-white font-bold border border-white/10 px-8 py-3.5 rounded-2xl active:scale-95 transition-all">
               Return to Global Settings
             </button>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto px-4 pt-8 pb-[130px] min-h-screen bg-charcoal selection:bg-amethyst-500/30"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 sticky top-0 bg-charcoal/90 backdrop-blur-xl py-4 z-20 -mx-4 px-4 border-b border-white/5">
        <button onClick={onBack} className="p-2 bg-dark-grey rounded-full border border-white/10 text-white active:scale-95 transition-all shadow-md">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Settings</h2>
          <p className="text-amethyst-400 text-xs font-medium uppercase tracking-widest mt-0.5">Ultra-Secure Architecture</p>
        </div>
      </div>

      <div className="space-y-6">
        {categories.map((cat, idx) => (
          <div key={`settings-category-${cat.title}`} className="bg-dark-grey/60 backdrop-blur-xl rounded-[24px] border border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.3)] overflow-hidden">
             
             {/* Category Header */}
             <div className="px-5 py-4 pb-2 flex items-center gap-3">
               <div className="p-1.5 bg-black/40 rounded-lg shadow-inner">
                 {cat.icon}
               </div>
               <h3 className="text-sm font-bold text-white uppercase tracking-wider">{cat.title}</h3>
             </div>
             
             {/* Category Items */}
             <div className="flex flex-col pb-2">
               {cat.items.map((item, i) => (
                 <div key={`settings-item-${item.label}`} className="flex flex-col">
                   {/* Depending on type, render different right-side controls */}
                   {item.type === 'link' || item.type === 'button' ? (
                     <button 
                       onClick={() => handleAction(item.label)} 
                       className="flex justify-between items-center px-5 py-[14px] hover:bg-white/5 transition-colors active:scale-98"
                     >
                       <div className="flex items-center gap-3">
                         {item.icon && <span className={`${item.color ? item.color : 'text-slate-400'}`}>{item.icon}</span>}
                         <span className={`text-[15px] font-medium ${item.color ? item.color : 'text-slate-100'}`}>{item.label}</span>
                       </div>
                       {item.type === 'link' && <ChevronRight className="w-5 h-5 text-slate-500" />}
                     </button>
                   ) : item.type === 'toggle' ? (
                     <div className="flex justify-between items-center px-5 py-[14px]">
                       <div className="flex items-center gap-3">
                         {item.icon && <span className="text-slate-400">{item.icon}</span>}
                         <span className="text-[15px] font-medium text-slate-100">{item.label}</span>
                       </div>
                       <Toggle 
                         active={prefs[item.stateKey! as keyof typeof prefs] as boolean} 
                         onChange={() => updatePref(item.stateKey! as keyof typeof prefs, !prefs[item.stateKey! as keyof typeof prefs])} 
                       />
                     </div>
                   ) : item.type === 'select' ? (
                      <div className="flex justify-between items-center px-5 py-[14px]">
                       <div className="flex items-center gap-3">
                         <span className="text-[15px] font-medium text-slate-100">{item.label}</span>
                       </div>
                       <div className="flex bg-black/40 rounded-xl p-1 border border-white/5 shadow-inner">
                         {item.options?.map((opt) => {
                           const isActive = prefs[item.stateKey! as keyof typeof prefs] === opt;
                           return (
                             <button 
                               key={`settings-opt-${item.label}-${opt}`}
                               onClick={() => updatePref(item.stateKey! as keyof typeof prefs, opt)}
                               className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${isActive ? 'bg-amethyst-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                             >
                               {opt}
                             </button>
                           );
                         })}
                       </div>
                     </div>
                   ) : item.type === 'slider' ? (
                     <div className="flex flex-col px-5 py-[14px] gap-3">
                       <div className="flex justify-between items-center">
                         <div className="flex items-center gap-3">
                           {item.icon && <span className="text-slate-400">{item.icon}</span>}
                           <span className="text-[15px] font-medium text-slate-100">{item.label}</span>
                         </div>
                         <span className="text-amethyst-400 text-xs font-bold bg-amethyst-500/10 px-2 py-0.5 rounded-md">
                           {prefs[item.stateKey! as keyof typeof prefs]}%
                         </span>
                       </div>
                       <input 
                         type="range" 
                         min="0" 
                         max="100" 
                         value={prefs[item.stateKey! as keyof typeof prefs] as number}
                         onChange={(e) => updatePref(item.stateKey! as keyof typeof prefs, parseInt(e.target.value))}
                         className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-amethyst-500"
                       />
                     </div>
                   ) : null}
                 </div>
               ))}
             </div>
          </div>
        ))}

        {/* Global Logout */}
        <div className="bg-dark-grey/60 backdrop-blur-xl rounded-[24px] border border-red-500/20 shadow-[0_8px_30px_rgba(0,0,0,0.3)] mt-8 overflow-hidden group">
           <button 
             onClick={handleSignOut}
             className="w-full flex items-center justify-between px-5 py-[18px] hover:bg-red-500/10 transition-colors active:bg-red-500/20"
           >
             <div className="flex items-center gap-3 text-red-500">
               <LogOut className="w-6 h-6" />
               <span className="text-[16px] font-bold">Sign Out from Vexox</span>
             </div>
             <ChevronRight className="w-5 h-5 text-red-500/50 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
        
      </div>
    </motion.div>
  );
}
