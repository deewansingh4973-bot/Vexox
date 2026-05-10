import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, onSnapshot, getDoc, updateDoc, increment } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Edit2, BadgeCheck, LayoutGrid, PlaySquare, Lock, Bookmark, Settings, ArrowLeft, Share2, Grid3X3, Video, X, QrCode, Globe, Target, Shield, Briefcase, Zap, Boxes, Coins, MessageSquare, Mic, Disc, Compass, Upload, EyeOff, Bot, Database, ArrowRight, Book, Camera, Hexagon, Heart, MoreHorizontal, MessageCircle } from 'lucide-react';
import { playHaptic } from '../lib/haptics';
import EditProfile from './EditProfile';
import SettingsMenu from './SettingsMenu';
import OmniDashboard from './OmniDashboard';

interface ProfileViewProps {
  user: User;
}

  // Removed dummy highlight stories and post previews

export default function ProfileView({ user }: ProfileViewProps) {
  const [currentView, setCurrentView] = useState<'profile' | 'edit' | 'settings' | 'omni'>('profile');
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'mentions' | 'vault'>('posts');
  const [showStory, setShowStory] = useState(false);
  const [showPinLock, setShowPinLock] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [showAdvancedMenu, setShowAdvancedMenu] = useState(false);
  const [pinEntry, setPinEntry] = useState('');
  
  // New Engine States
  const [showLocationMesh, setShowLocationMesh] = useState(false);
  const [showMerchStore, setShowMerchStore] = useState(false);
  const [showSponsorship, setShowSponsorship] = useState(false);
  const [activePost, setActivePost] = useState<number | null>(null);
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);
  const [stealthActiveLevel, setStealthActiveLevel] = useState(0); 
  const [loadingData, setLoadingData] = useState(true);
  
  const [profileData, setProfileData] = useState<any>({
    bio: '',
    website: '',
    username: ''
  });
  const [posts, setPosts] = useState<any[]>([]);
  const [reels, setReels] = useState<any[]>([]);

  useEffect(() => {
    // Stealth Active Detection Engine
    let engagementScore = 0;
    const handleActivity = () => {
      engagementScore = Math.min(100, engagementScore + 5);
      setStealthActiveLevel(engagementScore);
    };
    
    window.addEventListener('pointerdown', handleActivity);
    window.addEventListener('scroll', handleActivity, { passive: true });
    
    const decayInterval = setInterval(() => {
      engagementScore = Math.max(0, engagementScore - 2);
      setStealthActiveLevel(engagementScore);
    }, 5000);
    
    return () => {
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      clearInterval(decayInterval);
    };
  }, []);

  useEffect(() => {
    let unsubs: any[] = [];
    setLoadingData(true);
    
    // Sync User Profile
    const unsubUser = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfileData(prev => ({ ...prev, ...docSnap.data() }));
      }
      setLoadingData(false);
    });
    unsubs.push(unsubUser);
    
    // Fetch User Posts
    import('firebase/firestore').then(({ query, collection, where, orderBy }) => {
      const q = query(
        collection(db, 'posts'),
        where('authorId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const unsubPosts = onSnapshot(q, (snapshot) => {
        setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      unsubs.push(unsubPosts);
    });

    return () => unsubs.forEach(fn => fn());
  }, [user]);

  const handleTabChange = (tab: 'posts' | 'reels' | 'mentions' | 'vault') => {
    playHaptic();
    if (tab === 'vault') {
      setShowPinLock(true);
      setPinEntry('');
    } else {
      setActiveTab(tab);
    }
  };

  const handlePinSubmit = async () => {
    playHaptic();
    try {
      // Fire mock rule check for encrypted private area
      const vaultRef = doc(db, 'users', user.uid, 'private', 'vault');
      const snap = await getDoc(vaultRef);
      // Since normal users won't have read access to this if it doesn't exist/rules deny
      setShowPinLock(false);
      setActiveTab('vault');
    } catch (err: any) {
      alert("Missing or insufficient permissions to access encrypted Vault.");
      setPinEntry('');
    }
  };

  const renderTabContent = () => {
    if (loadingData) {
      return (
         <div className="grid grid-cols-3 gap-[2px] mt-2 relative z-10 pointer-events-auto px-[2px]">
             {[1,2,3,4,5,6].map(i => (
               <div key={`profile-loading-${i}`} className="aspect-square bg-white/5 relative overflow-hidden">
                 <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            ))}
         </div>
      );
    }
    switch (activeTab) {
      case 'posts':
        return (
          <div className="grid grid-cols-3 gap-[2px] mt-2 relative z-10 pointer-events-auto px-[2px]">
            {posts.map((post, i) => (
              <motion.div 
                layoutId={`post-img-${i}`}
                key={`profile-post-${post.id || i}`} 
                className="aspect-square overflow-hidden group cursor-pointer relative bg-charcoal rounded-[4px] border border-white/5"
                onClick={() => { playHaptic(); setActivePost(i); }}
              >
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />
                {post.imageUrl && <img src={post.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 relative z-10" alt="Post" loading="lazy" />}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                  <Grid3X3 className="w-6 h-6 text-white" />
                </div>
              </motion.div>
            ))}
          </div>
        );
      case 'reels':
        return (
          <div className="grid grid-cols-3 gap-[2px] mt-2 relative z-10 pointer-events-auto px-[2px]">
            {reels.map((reel, i) => (
              <motion.div 
                layoutId={`reel-img-${i}`}
                key={`profile-reel-${reel.id || i}`} 
                className="aspect-[9/16] overflow-hidden group cursor-pointer relative bg-charcoal rounded-[4px] border border-white/5"
                onClick={() => { playHaptic(); setActiveReelIndex(i); }}
              >
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />
                {reel.videoUrl && <img src={reel.videoUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 relative z-10" alt="Reel" loading="lazy" />}
                <div className="absolute top-2 right-2 flex text-white drop-shadow-md z-20">
                   <PlaySquare className="w-4 h-4 fill-white" />
                   <span className="text-[10px] ml-1 font-bold">12K</span>
                </div>
              </motion.div>
            ))}
          </div>
        );
      case 'vault':
        return (
          <div className="mt-8 mb-12 flex flex-col items-center justify-center relative z-10 select-none px-4">
             {/* Quantum Legacy Drive */}
             <div className="w-full bg-dark-grey/60 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.3)] mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-bold text-white tracking-widest uppercase">Quantum Drive</span>
                  </div>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-bold">Encrypted</span>
                </div>
                
                <div className="flex items-end justify-between mb-2 mt-4">
                  <h3 className="text-3xl font-black text-white tracking-tight">4.2 TB</h3>
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">of ∞ Used</span>
                </div>
                
                <div className="w-full h-3 bg-charcoal rounded-full overflow-hidden flex gap-0.5 border border-white/10">
                  <div className="h-full bg-blue-500" style={{ width: '40%' }} />
                  <div className="h-full bg-amethyst-500" style={{ width: '15%' }} />
                  <div className="h-full bg-fuchsia-500" style={{ width: '5%' }} />
                </div>
                
                <div className="flex justify-between mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"/> Media</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amethyst-500"/> Scans</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-fuchsia-500"/> Notes</span>
                </div>
             </div>

             <Lock className="w-12 h-12 text-amethyst-500/50 mb-3" />
             <h3 className="text-white font-bold text-lg">Hidden Media Vault</h3>
             <p className="text-slate-400 text-sm mt-1 mb-6">These items are hidden from public view.</p>
             <div className="grid grid-cols-3 gap-2 w-full">
             </div>
          </div>
        );
      case 'mentions':
        return (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center mt-4">
             <div className="w-20 h-20 rounded-full bg-charcoal border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                <span className="text-4xl text-white/50 font-bold">@</span>
             </div>
             <h3 className="text-xl font-bold text-white mb-2">No Mentions Yet</h3>
             <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
               When people tag you in their posts or stories, they will appear here.
             </p>
          </div>
        );
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {currentView === 'edit' && (
          <EditProfile key="edit" user={user} onBack={() => { playHaptic(); setCurrentView('profile'); }} />
        )}
        {currentView === 'settings' && (
          <SettingsMenu key="settings" user={user} onBack={() => { playHaptic(); setCurrentView('profile'); }} />
        )}
        {currentView === 'omni' && (
          <OmniDashboard key="omni" onBack={() => { playHaptic(); setCurrentView('profile'); }} />
        )}
        {currentView === 'profile' && (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="min-h-screen bg-black pt-12 pb-32 select-none relative" 
        >
          {/* Subtle top gradient */}
          <div className="absolute top-0 left-0 right-0 h-64 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amethyst-900/60 via-black to-black opacity-80 pointer-events-none" />
          
          <div className="max-w-2xl mx-auto px-4 relative z-10">
            {/* Top Bar for Profile */}
            <div className="flex justify-between items-center mb-6 pt-4">
              <div className="flex items-center gap-2">
                 <Lock className="w-4 h-4 text-white" />
                 <h2 className="text-xl font-bold text-white tracking-tight">{(user.displayName || "rahul").toLowerCase()}</h2>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => { playHaptic(); setShowQrCode(true); }} 
                  className="p-2 hover:bg-amethyst-500/20 hover:text-amethyst-300 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] rounded-full transition-all text-white active:scale-95"
                >
                  <QrCode className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => { playHaptic(); setShowAdvancedMenu(true); }} 
                  className="p-2 hover:bg-amethyst-500/20 hover:text-amethyst-300 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] rounded-full transition-all text-white active:scale-95"
                >
                  <Settings className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Avatar & Stats - Left Aligned */}
            <div className="flex flex-col items-start mb-6 w-full relative">
              {loadingData && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-start pt-6 rounded-2xl">
                   <div className="w-full opacity-60">
                     <div className="w-24 h-24 rounded-full bg-white/10 mb-4 animate-pulse" />
                     <div className="w-40 h-6 bg-white/10 rounded mb-2 animate-pulse" />
                     <div className="w-24 h-4 bg-white/10 rounded mb-4 animate-pulse" />
                     <div className="w-full h-12 bg-white/10 rounded mb-6 animate-pulse" />
                     <div className="flex gap-8">
                       <div className="w-12 h-10 bg-white/10 rounded animate-pulse" />
                       <div className="w-12 h-10 bg-white/10 rounded animate-pulse" />
                       <div className="w-12 h-10 bg-white/10 rounded animate-pulse" />
                     </div>
                   </div>
                </div>
              )}
              {/* Profile Header: Avatar top-center */}
              <div className="flex justify-center w-full mb-6 relative">
                <motion.button 
                  onClick={() => { playHaptic(); setShowStory(true); }}
                  className="relative flex-shrink-0 w-28 h-28 rounded-full p-[3px] bg-gradient-to-tr from-amethyst-500 to-fuchsia-400 shadow-[0_0_30px_rgba(168,85,247,0.8)] active:scale-95 transition-transform"
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="w-full h-full bg-black rounded-full overflow-hidden border-[4px] border-black flex items-center justify-center">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || "Rahul Kushwah"}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-white uppercase">{user.displayName?.charAt(0) || "R"}</span>
                    )}
                  </div>
                </motion.button>
              </div>

              {/* Text Sequence - Strict Left-Alignment with Indicator */}
              <div className="relative mb-4 flex flex-col items-start text-left w-full pl-4 border-l-[3px] border-amethyst-500/80 shadow-[inset_1px_0_10px_rgba(168,85,247,0.1),-10px_0_20px_rgba(168,85,247,0.15)]">
                <h2 className="text-2xl font-black text-white flex items-center gap-1.5 drop-shadow-md tracking-tight">
                  {user.displayName || "Rahul Kushwah"}
                  <BadgeCheck className="w-6 h-6 text-amethyst-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]" />
                </h2>
                <div className="opacity-80 mt-0.5 mb-2">
                   <p className="text-amethyst-300 text-sm font-mono tracking-wider">@{profileData.username || user.displayName?.toLowerCase().replace(/\s/g,'_')}</p>
                </div>
                <p className="text-slate-100 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                   {profileData.bio || "Crafting the future."}
                </p>
                {profileData.website && (
                  <a href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`} target="_blank" rel="noreferrer" className="text-amethyst-400 font-semibold text-sm mt-3 flex items-center gap-1 active:opacity-70 transition-opacity">
                     🔗 {profileData.website.replace('https://', '')}
                  </a>
                )}
              </div>

              {/* Stats Row - Sequence Left-Aligned */}
              <div className="flex gap-8 justify-start w-full mb-6 mt-4 pl-4 border-l-[3px] border-transparent">
                <div className="flex flex-col items-start justify-center">
                  <span className="text-lg font-bold text-white">{profileData.followersCount || 0}</span>
                  <p className="text-[12px] text-slate-400 uppercase font-medium tracking-wide mt-0.5">Followers</p>
                </div>
                <div className="flex flex-col items-start justify-center">
                  <span className="text-lg font-bold text-white">{profileData.followingCount || 0}</span>
                  <p className="text-[12px] text-slate-400 uppercase font-medium tracking-wide mt-0.5">Following</p>
                </div>
                <div className="flex flex-col items-start justify-center">
                  <span className="text-lg font-bold text-white">{posts.length}</span>
                  <p className="text-[12px] text-slate-400 uppercase font-medium tracking-wide mt-0.5">Posts</p>
                </div>
              </div>
            </div>

            {/* Fully Active Button Logic */}
            <div className="flex gap-3 mb-8 w-full flex-wrap">
              <button 
                onClick={() => { playHaptic(); setCurrentView('edit'); }}
                className="flex-1 py-2.5 bg-white/10 backdrop-blur-[25px] border-[0.5px] border-white/20 shadow-[0_4px_15px_rgba(0,0,0,0.4)] rounded-full text-white font-bold text-sm tracking-wide transition-all active:scale-95 hover:bg-white/20"
              >
                Edit Profile
              </button>
              <button 
                onClick={() => { playHaptic(); alert('Sharing profile link...'); }}
                className="flex-[0.5] py-2.5 bg-white/10 backdrop-blur-[25px] border-[0.5px] border-white/20 shadow-[0_4px_15px_rgba(0,0,0,0.4)] rounded-full text-white font-bold text-sm tracking-wide transition-all active:scale-95 hover:bg-white/20 flex items-center justify-center"
              >
                Share
              </button>
            </div>

            {/* Highlights / Story Bar */}
            <div className="flex gap-4 overflow-x-auto mb-6 scrollbar-hide snap-x">
              <div className="flex flex-col items-center gap-1.5 snap-start min-w-[64px]">
                <div className="w-16 h-16 rounded-full border border-white/20 p-1 flex items-center justify-center">
                  <button
                    onClick={() => { playHaptic(); alert('Add new highlight coming soon!'); }} 
                    className="w-full h-full rounded-full border border-white/20 flex items-center justify-center bg-transparent active:scale-95 transition-transform"
                  >
                     <span className="text-2xl text-white font-light mt-[-2px]">+</span>
                  </button>
                </div>
                <span className="text-[11px] text-white">New</span>
              </div>
            </div>

            {/* Profile Tabs */}
            <div className="flex justify-around border-t border-white/10 relative z-10 w-full mb-2 pt-1 overflow-x-auto no-scrollbar">
              {['posts', 'reels', 'mentions', 'vault'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => handleTabChange(tab as any)} 
                  className={`flex-1 min-w-[64px] py-3 flex justify-center items-center relative transition-colors ${activeTab === tab ? 'text-amethyst-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {tab === 'posts' && <Grid3X3 className="w-5 h-5" />}
                  {tab === 'reels' && <PlaySquare className="w-5 h-5" />}
                  {tab === 'mentions' && <span className="font-bold text-lg leading-none">@</span>}
                  {tab === 'vault' && <Lock className="w-5 h-5" />}
                  
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="tab-indicator"
                      className="absolute top-0 w-1/2 h-[2px] bg-amethyst-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
            
            {/* Tab content wrapper w/o extra margins for grid */}
            <div className={activeTab === 'posts' || activeTab === 'reels' ? '-mx-4' : ''}>
              {renderTabContent()}
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Private Vault / Glass-Key Lock Overlay */}
      <AnimatePresence>
        {showAdvancedMenu && (
          <motion.div 
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[160] flex flex-col justify-end"
          >
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { playHaptic(); setShowAdvancedMenu(false); }} />
             
             <div className="relative bg-black/80 backdrop-blur-[40px] border-t-[0.5px] border-white/20 rounded-t-[32px] p-6 pb-[100px] shadow-[0_-10px_50px_rgba(0,0,0,0.5)] max-h-[85vh] overflow-y-auto no-scrollbar">
               <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6 sticky top-0" />
               <h2 className="text-xl font-bold text-white mb-6 tracking-wide">Advanced Features</h2>
               
               <div className="flex flex-col gap-4">
                 {/* Smart Location Mesh */}
                 <button onClick={() => { playHaptic(); setShowAdvancedMenu(false); setShowLocationMesh(true); }} className="w-full bg-charcoal/60 hover:bg-charcoal border-[0.5px] border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center relative">
                        <Globe className="w-6 h-6 text-emerald-400" />
                        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-white text-base font-bold tracking-tight">Smart Location Mesh</span>
                        <span className="text-emerald-400 text-xs font-medium mt-1 uppercase tracking-widest animate-[pulse_1s_infinite]">● Active Scanning</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/50" />
                 </button>

                 {/* Direct Merch Store */}
                 <button onClick={() => { playHaptic(); setShowAdvancedMenu(false); setShowMerchStore(true); }} className="w-full bg-charcoal/60 hover:bg-charcoal border-[0.5px] border-amethyst-500/30 rounded-2xl p-4 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-amethyst-500/20 border border-amethyst-500/50 flex items-center justify-center">
                        <Boxes className="w-6 h-6 text-amethyst-400" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-white text-base font-bold tracking-tight">Direct Merch Store</span>
                        <span className="text-slate-400 text-xs font-medium mt-1">Manage inventory & sales</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/50" />
                 </button>

                 {/* Sponsorship Hub */}
                 <button onClick={() => { playHaptic(); setShowAdvancedMenu(false); setShowSponsorship(true); }} className="w-full bg-charcoal/60 hover:bg-charcoal border-[0.5px] border-yellow-500/30 rounded-2xl p-4 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center">
                        <Target className="w-6 h-6 text-yellow-500" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-white text-base font-bold tracking-tight">Sponsorship Hub</span>
                        <span className="text-slate-400 text-xs font-medium mt-1">2 Pending Requests</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/50" />
                 </button>
                 
                 {/* Standard Settings */}
                 <button onClick={() => { playHaptic(); setShowAdvancedMenu(false); setCurrentView('settings'); }} className="w-full bg-charcoal/60 hover:bg-charcoal border-[0.5px] border-white/10 rounded-2xl p-4 flex items-center justify-between transition-colors mt-2">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <Settings className="w-6 h-6 text-white/80" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-white text-base font-bold tracking-tight">Account Settings</span>
                        <span className="text-slate-400 text-xs font-medium mt-1">Privacy, Security, About</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/50" />
                 </button>
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Private Vault / Glass-Key Lock Overlay */}
      <AnimatePresence>
        {showPinLock && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-[40px] flex items-center justify-center p-6 flex-col"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-fuchsia-900/10 to-amethyst-900/20" />
            
            <div className="relative z-10 flex flex-col items-center">
              <motion.div 
                 animate={{ rotateY: [0, 180, 360], scale: [1, 1.1, 1] }}
                 transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                 className="w-24 h-24 bg-white/5 border border-white/20 rounded-[32px] backdrop-blur-md shadow-[0_0_50px_rgba(139,92,246,0.3)] flex items-center justify-center mb-8 relative preserve-3d"
              >
                 <Lock className="w-10 h-10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                 <div className="absolute inset-0 border border-t-amethyst-400 border-b-transparent border-l-transparent border-r-transparent rounded-[32px] animate-spin-slow" />
              </motion.div>
              
              <h2 className="text-3xl font-display font-medium text-white mb-2 drop-shadow-lg">Encryption Key</h2>
              <p className="text-slate-300 font-mono text-xs uppercase tracking-widest mb-10 opacity-80">Enter Glass-Key To Decrypt</p>
              
              <div className="flex gap-4 mb-10 h-6">
                {[0,1,2,3].map(i => (
                  <motion.div 
                    key={`pin-dot-${i}`} 
                    animate={pinEntry.length > i ? { scale: [1, 1.5, 1], backgroundColor: '#a855f7' } : { scale: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    className={`w-3 h-3 rounded-full ${pinEntry.length > i ? 'shadow-[0_0_15px_rgba(168,85,247,0.8)]' : ''} transition-all`} 
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-x-8 gap-y-6 max-w-[300px] w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'Cancel', 0, 'X'].map((num, i) => (
                  <button 
                    key={`keypad-${i}`}
                    onClick={() => {
                      playHaptic();
                      if (num === 'Cancel') {
                        setShowPinLock(false);
                        setActiveTab('posts');
                        setPinEntry('');
                      } else if (num === 'X') {
                        setPinEntry(p => p.slice(0, -1));
                      } else {
                        if (pinEntry.length < 4) {
                          const newPin = pinEntry + num;
                          setPinEntry(newPin);
                          if (newPin.length === 4) {
                            setTimeout(() => {
                              if (newPin === '1234') {
                                playHaptic(); playHaptic(); // Success double buzz
                                setShowPinLock(false);
                                setActiveTab('vault');
                              } else {
                                alert('Invalid Glass-Key Signature');
                                setPinEntry('');
                              }
                            }, 400);
                          }
                        }
                      }
                    }}
                    className={`h-16 w-16 mx-auto rounded-full flex items-center justify-center text-3xl font-light active:bg-white/20 transition-all active:scale-90 ${typeof num === 'string' ? 'text-[13px] text-slate-300 uppercase tracking-widest font-bold font-mono shadow-none' : 'text-white bg-black/40 border border-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]'}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Immersive Detail View for Post Map */}
      <AnimatePresence>
        {activePost !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-3xl overflow-y-auto no-scrollbar"
          >
             <div className="sticky top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
               <button onClick={() => { playHaptic(); setActivePost(null); }} className="p-3 bg-white/10 rounded-full backdrop-blur-xl border border-white/20 shadow-lg active:scale-95 text-white">
                  <ArrowLeft className="w-6 h-6" />
               </button>
               <span className="text-white font-mono font-bold tracking-widest uppercase text-xs">Immersive View</span>
               <button className="p-3 bg-white/10 rounded-full backdrop-blur-xl border border-white/20 shadow-lg active:scale-95 text-white">
                  <Share2 className="w-5 h-5" />
               </button>
             </div>
             
             <motion.div layoutId={`post-img-${activePost}`} className="w-full relative min-h-[500px] mt-4 bg-charcoal">
               <div className="absolute inset-0 max-h-[70vh] bg-amethyst-900/20 blur-3xl pointer-events-none" />
               {posts[activePost]?.imageUrl && <img src={posts[activePost]?.imageUrl} className="w-full object-cover max-h-[70vh] shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative z-10" />}
             </motion.div>
             
             <div className="p-6 relative z-20 bg-black -mt-6 rounded-t-[32px] min-h-[50vh]">
               <div className="flex gap-4 items-center mb-6">
                 <div className="w-12 h-12 rounded-full border-2 border-amethyst-400 overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    <img src={user.photoURL || 'https://i.pravatar.cc/150'} className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <h3 className="text-white font-bold text-lg">{user.displayName || "User"}</h3>
                    <p className="text-slate-400 text-xs">Active now</p>
                 </div>
                 <div className="ml-auto flex gap-6 text-white bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                   <button className="flex items-center gap-2 font-bold"><Heart className="w-5 h-5 text-fuchsia-400" /> {posts[activePost]?.likesCount || 0}</button>
                   <button className="flex items-center gap-2 font-bold"><MessageCircle className="w-5 h-5 text-cyan-400" /> {posts[activePost]?.commentsCount || 0}</button>
                 </div>
               </div>
               
               <p className="text-white text-base leading-relaxed tracking-wide mb-8 font-serif">
                 {posts[activePost]?.content || "No caption provided."}
               </p>
               
               <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />
               
               <h4 className="text-white font-bold tracking-widest uppercase text-sm mb-4">Live Dialogue</h4>
               
               <div className="space-y-6 pb-20">
                 {/* Dummy Comments */}
                 <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex-shrink-0" />
                   <div>
                     <span className="text-white font-bold text-sm">@dr.quantum</span>
                     <p className="text-slate-300 text-sm mt-1">Stunning capture. Did you use the new AI rendering tool?</p>
                   </div>
                 </div>
                 <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/50 flex-shrink-0" />
                   <div>
                     <span className="text-white font-bold text-sm">@space_lover99</span>
                     <p className="text-slate-300 text-sm mt-1">This is literally what I dream about! Keep building.</p>
                   </div>
                 </div>
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Reel Player */}
      <AnimatePresence>
        {activeReelIndex !== null && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[150] bg-black overflow-hidden flex flex-col pointer-events-auto"
          >
             <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 pt-12 bg-gradient-to-b from-black/80 to-transparent">
               <button onClick={() => { playHaptic(); setActiveReelIndex(null); }} className="p-3 bg-black/40 rounded-full backdrop-blur-xl border border-white/20 shadow-lg active:scale-95 text-white">
                  <ArrowLeft className="w-6 h-6" />
               </button>
               <span className="text-white font-mono font-bold tracking-widest uppercase text-xs drop-shadow-md">Vexox Reels</span>
               <button className="p-3 bg-black/40 rounded-full backdrop-blur-xl border border-white/20 shadow-lg active:scale-95 text-white">
                  <Camera className="w-5 h-5" />
               </button>
             </div>
             
             {/* Simulated Reel Layout */}
             <div className="flex-1 relative bg-charcoal h-[100dvh]">
                <video 
                   src="https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" 
                   className="w-full h-full object-cover" 
                   autoPlay 
                   loop 
                   playsInline 
                   controls={false}
                   muted={false} /* Requested: playback with sound */
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 pointer-events-none" />
                
                {/* Overlay actions */}
                <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-20">
                   <button onClick={() => playHaptic()} className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                     <div className="p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 group-active:bg-fuchsia-500/30 group-active:border-fuchsia-400">
                        <Heart className="w-7 h-7 text-white group-active:text-fuchsia-400 group-active:fill-fuchsia-400" />
                     </div>
                     <span className="text-white text-xs font-bold drop-shadow-md">32.4K</span>
                   </button>
                   <button onClick={() => playHaptic()} className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                     <div className="p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                        <MessageCircle className="w-7 h-7 text-white" />
                     </div>
                     <span className="text-white text-xs font-bold drop-shadow-md">1,240</span>
                   </button>
                   <button onClick={() => playHaptic()} className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                     <div className="p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                        <Share2 className="w-7 h-7 text-white" />
                     </div>
                     <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
                   </button>
                   <button onClick={() => playHaptic()} className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                     <div className="p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                        <MoreHorizontal className="w-7 h-7 text-white" />
                     </div>
                   </button>
                </div>
                
                <div className="absolute left-4 bottom-20 z-20 pr-24">
                  <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                    {user.displayName || "Rahul Kushwah"}
                    <BadgeCheck className="w-4 h-4 text-amethyst-400" />
                  </h3>
                  <p className="text-white/90 text-sm drop-shadow-md line-clamp-2">Exploring futuristic interfaces and immersive 3D meshes. Everything changes when physics meets UI. 🚀💯</p>
                  <div className="flex items-center gap-2 mt-3 font-medium text-xs">
                     <span className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white">✨ Original Audio</span>
                  </div>
                </div>
                
                {/* Progress Bar bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
                   <motion.div 
                     className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                     initial={{ width: 0 }}
                     animate={{ width: "100%" }}
                     transition={{ duration: 15, ease: "linear", repeat: Infinity }}
                   />
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story View Animation Overlay */}
      <AnimatePresence>
        {showStory && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = offset.y;
              if (swipe > 100 || velocity.y > 500) {
                setShowStory(false); // Swipe down to exit
              } else if (swipe < -100 || velocity.y < -500) {
                // Swipe up to next (simulate for now by just restarting animation)
                playHaptic();
                setShowStory(false);
                setTimeout(() => setShowStory(true), 50);
              }
            }}
          >
             <div className="absolute inset-0 z-0">
               <img src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80" className="w-full h-full object-cover opacity-80 pointer-events-none" alt="Story" />
               <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />
            </div>
            
            {/* Story Header */}
            <div className="relative z-10 flex items-center justify-between p-4 pt-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-amethyst-400 overflow-hidden bg-amethyst-900 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-white font-bold">{user.displayName?.charAt(0) || "U"}</span>
                  )}
                </div>
                <span className="text-white font-semibold drop-shadow-md">{user.displayName || "Rahul"}</span>
                <span className="text-white/80 text-xs drop-shadow-md">Just now</span>
              </div>
              <button 
                onClick={() => { playHaptic(); setShowStory(false); }}
                className="p-2 bg-black/40 rounded-full text-white backdrop-blur-md active:scale-95 transition-transform"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Story Progress Bar Simulator */}
            <div className="absolute top-8 left-4 right-4 flex gap-1 z-10">
               <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                 <motion.div 
                   key={showStory ? "active" : "inactive"}
                   initial={{ width: 0 }} 
                   animate={{ width: "100%" }} 
                   transition={{ duration: 5, ease: "linear" }}
                   onAnimationComplete={() => setShowStory(false)}
                   className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                 />
               </div>
            </div>

            {/* Instruction Overlay */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-center z-10 pointer-events-none opacity-50">
              <span className="text-white text-xs font-medium px-4 py-2 bg-black/40 backdrop-blur-md rounded-full mt-auto">
                Swipe vertically to navigate
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Overlay */}
      <AnimatePresence>
        {showQrCode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 flex-col"
          >
            <div className="absolute top-12 right-6">
              <button onClick={() => { playHaptic(); setShowQrCode(false); }} className="p-2 bg-white/10 rounded-full text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="glass-amethyst p-8 rounded-[3rem] border border-amethyst-500/40 shadow-[0_0_50px_rgba(139,92,246,0.3)] flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amethyst-500 to-amethyst-accent rounded-full mb-6 border-[3px] border-amethyst-500 p-[2px] flex items-center justify-center text-3xl font-bold text-white shadow-[0_0_20px_rgba(139,92,246,0.6)]">
                 <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-amethyst-900 flex items-center justify-center">
                  {user.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : user.displayName?.charAt(0) || "U"}
                 </div>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide">{user.displayName || "Rahul"}</h2>
              <p className="text-amethyst-400 text-sm font-mono mt-1 mb-8">@{profileData.username}</p>
              
              <div className="bg-white p-4 rounded-3xl shadow-inner shadow-black/20">
                <QrCode className="w-48 h-48 text-black" />
              </div>
              
              <p className="text-slate-400 text-sm mt-8 text-center max-w-[200px]">Scan this code to follow me on Vexox!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Location Mesh Overlay */}
      <AnimatePresence>
        {showLocationMesh && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[160] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 flex-col"
          >
            <div className="absolute top-12 right-6">
              <button onClick={() => { playHaptic(); setShowLocationMesh(false); }} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="glass-amethyst p-8 rounded-[2.5rem] border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.3)] flex flex-col items-center max-w-sm w-full text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/10 blur-xl animate-[pulse_3s_infinite]" />
              <Globe className="w-20 h-20 text-emerald-400 mb-6 relative z-10" />
              <h2 className="text-2xl font-bold text-white tracking-wide relative z-10">Smart Location Mesh</h2>
              <p className="text-emerald-400 text-sm font-mono mt-1 mb-6 relative z-10">Active Scanning Mode</p>
              <div className="bg-charcoal/60 border border-emerald-500/30 p-4 rounded-2xl w-full relative z-10 text-left">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/80 text-sm font-bold tracking-widest uppercase">Coverage</span>
                  <span className="text-emerald-400 text-sm font-mono tracking-widest">94%</span>
                </div>
                <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[94%]" />
                </div>
              </div>
              <button onClick={() => setShowLocationMesh(false)} className="w-full py-4 mt-6 bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 transition-all text-emerald-400 font-bold rounded-2xl border border-emerald-500/50 relative z-10">
                Calibrate Mesh
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Merch Store Overlay */}
      <AnimatePresence>
        {showMerchStore && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[160] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 flex-col"
          >
            <div className="absolute top-12 right-6">
              <button onClick={() => { playHaptic(); setShowMerchStore(false); }} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="glass-amethyst p-8 rounded-[2.5rem] border border-amethyst-500/40 shadow-[0_0_50px_rgba(139,92,246,0.3)] flex flex-col items-center max-w-sm w-full text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-amethyst-500/10 blur-xl" />
              <Boxes className="w-20 h-20 text-amethyst-400 mb-6 relative z-10" />
              <h2 className="text-2xl font-bold text-white tracking-wide relative z-10">Direct Merch Store</h2>
              <p className="text-amethyst-400 text-sm font-mono mt-1 mb-6 relative z-10">Creator Commerce Hub</p>
              
              <div className="w-full space-y-3 relative z-10">
                <div className="bg-charcoal/60 border border-white/10 p-3 rounded-2xl flex items-center justify-between">
                  <span className="text-white text-sm font-bold">Total Sales</span>
                  <span className="text-emerald-400 text-sm font-mono tracking-widest">$1,240.50</span>
                </div>
                <div className="bg-charcoal/60 border border-white/10 p-3 rounded-2xl flex items-center justify-between">
                  <span className="text-white text-sm font-bold">Active Listings</span>
                  <span className="text-amethyst-400 text-sm font-mono drop-shadow-md">4 items</span>
                </div>
              </div>

              <button onClick={() => setShowMerchStore(false)} className="w-full py-4 mt-6 bg-amethyst-500 hover:bg-fuchsia-600 active:scale-95 transition-all text-white font-bold rounded-2xl shadow-lg relative z-10">
                Manage Inventory
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sponsorship Overlay */}
      <AnimatePresence>
        {showSponsorship && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[160] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 flex-col"
          >
            <div className="absolute top-12 right-6">
              <button onClick={() => { playHaptic(); setShowSponsorship(false); }} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="glass-amethyst p-8 rounded-[2.5rem] border border-yellow-500/40 shadow-[0_0_50px_rgba(234,179,8,0.3)] flex flex-col items-center max-w-sm w-full text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-yellow-500/10 blur-xl" />
              <Target className="w-20 h-20 text-yellow-500 mb-6 relative z-10" />
              <h2 className="text-2xl font-bold text-white tracking-wide relative z-10">Sponsorship Hub</h2>
              <p className="text-yellow-500 text-sm font-mono mt-1 mb-6 relative z-10">Secure Brand Deals</p>
              
              <div className="w-full space-y-3 relative z-10 text-left">
                <div className="bg-charcoal/60 border border-yellow-500/30 p-4 rounded-2xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-white text-sm font-bold">CyberGurus Ltd.</span>
                    <span className="bg-yellow-500/20 text-yellow-500 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border border-yellow-500/50">Details</span>
                  </div>
                  <p className="text-white/60 text-xs">Offering 2.5 Eth for dedicated reel and 3 story placements.</p>
                </div>
              </div>

              <button onClick={() => setShowSponsorship(false)} className="w-full py-4 mt-6 bg-yellow-500/20 hover:bg-yellow-500/30 active:scale-95 transition-all text-yellow-500 font-bold rounded-2xl border border-yellow-500/50 relative z-10">
                Review All Requests
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

