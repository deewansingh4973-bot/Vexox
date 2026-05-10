import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { Post } from '../types';
import PostCard from '../PostCard';
import UploadSheet from './UploadSheet';
import { Image as ImageIcon, Send, Loader2, X, Heart, MessageSquare, Users, Bot, Plus, Sparkles, Brain, Eye, Activity, Box, Globe, Coins, TrendingUp, Wand2, Zap, Radio, Hexagon } from 'lucide-react';

import { playHaptic } from '../lib/haptics';
import { AnimatePresence, motion } from 'motion/react';

export default function Feed() {
  const [feedType, setFeedType] = useState<'Vibe' | 'Brain'>('Vibe');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [personalizing, setPersonalizing] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [activeStory, setActiveStory] = useState<any | null>(null);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const [showStoryPopup, setShowStoryPopup] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'stories'), 
      where('createdAt', '>', new Date('2020-01-01T00:00:00Z')),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const storiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStories(storiesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'stories');
    });

    return () => unsubscribe();
  }, []);
  const [activeChat, setActiveChat] = useState<'dm' | 'group' | 'ai' | null>(null);
  const [activeToss, setActiveToss] = useState<number | null>(null);
  const [eyeTrackActive, setEyeTrackActive] = useState(true);
  const [alphaSyncActive, setAlphaSyncActive] = useState(true);
  const [arModeActive, setArModeActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'), 
      where('createdAt', '>', new Date('2020-01-01T00:00:00Z')),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'posts');
    });

    return () => unsubscribe();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newPost.trim() && !selectedImage) || !auth.currentUser) return;

    setIsSubmitting(true);
    try {
      let imageUrl = null;
      if (selectedImage) {
        const storageRef = ref(storage, `posts/${auth.currentUser.uid}/${Date.now()}_${selectedImage.name}`);
        const uploadResult = await uploadBytes(storageRef, selectedImage);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      await addDoc(collection(db, 'posts'), {
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || 'Vexox User',
        authorPhoto: auth.currentUser.photoURL || null,
        content: newPost,
        ...(imageUrl && { imageUrl }),
        likesCount: 0,
        commentsCount: 0,
        createdAt: serverTimestamp(),
      });
      setNewPost('');
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'posts');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerCoinToss = (index: number) => {
    setActiveToss(index);
    setTimeout(() => setActiveToss(null), 1000);
  };

  const handleFeedToggle = (type: 'Vibe' | 'Brain') => {
    if (type === feedType) return;
    playHaptic();
    setFeedType(type);
    
    // Simulate AI Personalization Shimmer
    if (type === 'Brain') {
      setPersonalizing(true);
      setTimeout(() => {
        setPersonalizing(false);
      }, 1500);
    }
  };

  return (
    <div className="mx-auto px-0 md:px-4 pb-[130px] font-sans bg-[#0a0a0a]/90 backdrop-blur-xl min-h-screen relative overflow-hidden">
      
      {/* Global BCI HUD (Minimalist Mode) */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between p-4 px-6 mt-16 font-mono pointer-events-none">
         <div className="flex flex-col gap-2 drop-shadow-md pointer-events-auto">
            <button 
              onClick={() => { playHaptic(); alert('Eye-tracking backend simulated active'); }}
              className="p-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/40 transition-colors shadow-lg"
              title="Eye-track Active"
            >
              <Eye className="w-4 h-4 text-fuchsia-400" />
            </button>
         </div>
         {feedType === 'Brain' && (
           <div className="flex flex-col items-end gap-1 pointer-events-auto">
             <button 
               onClick={() => { playHaptic(); alert('Alpha-Wave Sync backend simulated active'); }}
               className="p-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/40 transition-colors shadow-lg flex items-center justify-center relative"
               title="Alpha-Wave Sync (10.5 Hz)"
             >
               <Activity className="w-4 h-4 text-yellow-400" />
               <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" />
             </button>
           </div>
         )}
      </div>

      {/* Generative AI Feed Override */}
      <div className="fixed bottom-[140px] right-4 z-40">
        <button onClick={() => { playHaptic(); alert("Initializing AI 16K Reel Generation..."); }} className="bg-gradient-to-tr from-fuchsia-600 to-indigo-600 p-4 rounded-full shadow-[0_0_30px_rgba(217,70,239,0.8)] border border-white/20 text-white font-bold flex items-center justify-center group active:scale-95 transition-transform overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />
          <Wand2 className="w-7 h-7 group-hover:rotate-12 transition-transform relative z-10" />
        </button>
      </div>
      
      <div className="max-w-xl mx-auto pt-4 relative z-10">
      {/* Liquid Amethyst Dimension Switch */}
      <div className="flex justify-center mb-6 mt-4 relative z-20">
        <div className="bg-black/40 backdrop-blur-3xl p-1.5 rounded-full border border-white/10 flex shadow-2xl relative overflow-hidden">
          <motion.div 
            className="absolute top-1.5 bottom-1.5 w-[140px] bg-gradient-to-r from-amethyst-600 to-fuchsia-600 rounded-full shadow-[0_0_20px_rgba(217,70,239,0.6)] mix-blend-screen"
            animate={{ left: feedType === 'Vibe' ? '6px' : 'calc(100% - 146px)' }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
          <button 
            onClick={() => handleFeedToggle('Vibe')}
            className={`relative w-[140px] py-3 text-sm font-black tracking-widest uppercase rounded-full transition-colors z-10 flex items-center justify-center gap-2 ${feedType === 'Vibe' ? 'text-white' : 'text-slate-500 hover:text-white'}`}
          >
            Vibe Feed
          </button>
          <button 
            onClick={() => handleFeedToggle('Brain')}
            className={`relative w-[140px] py-3 text-sm font-black tracking-widest uppercase rounded-full transition-colors z-10 flex items-center justify-center gap-2 ${feedType === 'Brain' ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]' : 'text-slate-500 hover:text-white'}`}
          >
            Brain Feed <Sparkles className={`w-4 h-4 ${feedType === 'Brain' ? 'text-yellow-300' : 'text-yellow-500/50'}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {feedType === 'Brain' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-2 mb-6"
          >
            <div className="flex justify-between items-center px-1">
               <h3 className="text-white font-bold text-sm">Semantic Concept Tags</h3>
               <span className="text-amethyst-400 text-xs font-bold uppercase tracking-widest">AI Auto-Detect</span>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {['Quantum Mechanics', 'Organic Chem', 'Calculus', 'Thermodynamics', 'Vectors'].map((tag, i) => (
                 <div key={`semantic-tag-${i}`} className="px-3 py-1.5 bg-[#1E1E1E]/80 backdrop-blur-md rounded-lg border border-amethyst-500/30 flex items-center gap-1 whitespace-nowrap shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-amethyst-400 animate-pulse" />
                    <span className="text-slate-200 text-xs font-semibold">{tag}</span>
                 </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeStory && (
          <motion.div 
            key="story-viewer"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col justify-between"
          >
            {/* Background Image Wrapper for Tap Navigation */}
            <div 
              className="absolute inset-0 z-0 select-none cursor-pointer"
              onClick={(e) => {
                const x = e.clientX;
                const width = window.innerWidth;
                const currentIndex = stories.findIndex(s => s.id === activeStory.id);
                if (x < width * 0.3) {
                   // Previous
                   if (currentIndex > 0) setActiveStory(stories[currentIndex - 1]);
                } else {
                   // Next
                   if (currentIndex < stories.length - 1) setActiveStory(stories[currentIndex + 1]);
                   else setActiveStory(null);
                }
              }}
            >
               <img key={`story-img-${activeStory.id}`} src={activeStory.bg || activeStory.image} className="w-full h-full object-cover" alt="" />
               <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />
            </div>
            
            {/* Story Header & Progress */}
            <div className="relative z-10 w-full pt-12 px-4 shadow-sm pointer-events-none">
              {/* Progress Bars */}
              <div className="flex gap-1 mb-4 h-1">
                 {stories.map((story, idx) => {
                    const currentIndex = stories.findIndex(s => s.id === activeStory.id);
                    let barStatus = "bg-white/30";
                    if (idx < currentIndex) barStatus = "bg-white"; // completed
                    
                    return (
                      <div key={`progress-wrap-${story.id}`} className={`flex-1 rounded-full overflow-hidden ${barStatus}`}>
                         {idx === currentIndex && (
                            <motion.div 
                              key={`progress-fill-${activeStory.id}`}
                              initial={{ width: 0 }} 
                              animate={{ width: "100%" }} 
                              transition={{ duration: 5, ease: "linear" }}
                              onAnimationComplete={() => {
                                 const cIndex = stories.findIndex(s => s.id === activeStory.id);
                                 if (cIndex < stories.length - 1) setActiveStory(stories[cIndex + 1]);
                                 else setActiveStory(null);
                              }}
                              className="h-full bg-white origin-left" 
                            />
                         )}
                         {idx < currentIndex && <div className="h-full w-full bg-white" />}
                      </div>
                    );
                 })}
              </div>

              {/* Header Profile */}
              <div className="flex items-center gap-4 pointer-events-auto">
                <button 
                  onClick={() => { playHaptic(); setActiveStory(null); }}
                  className="p-2 bg-black/40 rounded-full text-white backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors"
                >
                  <X className="w-6 h-6 drop-shadow-lg" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-amethyst-400 overflow-hidden bg-amethyst-900 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    <img key={`avatar-${activeStory.id}`} src={activeStory.image} alt={activeStory.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold drop-shadow-md">{activeStory.name}</span>
                    <span className="text-white/80 text-xs font-medium drop-shadow-md">2h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Story Footer / Interactions */}
            <div className="relative z-10 w-full p-4 mb-safe flex gap-4 items-center mt-auto pointer-events-auto">
               <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center px-5 py-3.5 shadow-lg focus-within:bg-white/20 focus-within:border-amethyst-400/50 transition-all">
                  <input 
                    id="story-reply"
                    type="text" 
                    placeholder={`Reply to ${activeStory.name}...`}
                    className="flex-1 bg-transparent text-[15px] text-white placeholder:text-white/70 outline-none w-full"
                    onKeyDown={(e) => {
                       if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          e.currentTarget.value = '';
                          playHaptic();
                          setShowStoryPopup(true);
                          setTimeout(() => setShowStoryPopup(false), 2500);
                       }
                    }}
                  />
               </div>
               
               {/* Neon Heart pop animation done via className append */}
               <button 
                 onClick={(e) => { 
                    playHaptic(); 
                    const btn = e.currentTarget;
                    btn.classList.add('animate-heart-pop');
                    setTimeout(() => btn.classList.remove('animate-heart-pop'), 600); 
                 }} 
                 className="p-2 text-white transition-colors group relative outline-none"
               >
                 <Heart className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] group-hover:text-fuchsia-400 group-hover:drop-shadow-[0_0_15px_rgba(217,70,239,0.9)] transition-all ease-out" />
                 <style>{`
                   @keyframes heartPop {
                     0% { transform: scale(1); }
                     40% { transform: scale(1.5) rotate(-15deg); color: #e879f9; filter: drop-shadow(0 0 25px #e879f9); }
                     80% { transform: scale(0.9) rotate(5deg); color: #d946ef; filter: drop-shadow(0 0 15px #d946ef); }
                     100% { transform: scale(1); color: #d946ef; filter: drop-shadow(0 0 10px #d946ef); }
                   }
                   .animate-heart-pop {
                     animation: heartPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                   }
                 `}</style>
               </button>
               
               <button 
                  onClick={() => { 
                    const input = document.getElementById('story-reply') as HTMLInputElement;
                    if (input && input.value.trim()) {
                       input.value = '';
                       playHaptic();
                       setShowStoryPopup(true);
                       setTimeout(() => setShowStoryPopup(false), 2500);
                    }
                  }} 
                  className="p-2 text-white transition-opacity hover:opacity-70 outline-none"
               >
                 <Send className="w-7 h-7 drop-shadow-md" />
               </button>
            </div>

            {/* Message Sent Popup */}
            <AnimatePresence>
               {showStoryPopup && (
                 <motion.div
                   initial={{ opacity: 0, y: 20, scale: 0.9 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: 20, scale: 0.9 }}
                   className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-charcoal/90 backdrop-blur-md border border-amethyst-500/30 text-white px-6 py-3 rounded-full shadow-[0_10px_30px_rgba(147,51,234,0.3)] flex items-center gap-3 z-50 pointer-events-none"
                 >
                   <Sparkles className="w-5 h-5 text-fuchsia-400" />
                   <span className="font-bold tracking-wide">Message Sent</span>
                 </motion.div>
               )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Bar */}
      <div className="flex gap-4 overflow-x-auto mt-4 mb-6 pb-2 scrollbar-hide snap-x px-4">
        {/* Your Story Button */}
        <button 
          onClick={() => { playHaptic(); window.dispatchEvent(new CustomEvent('OPEN_UPLOAD_SHEET')); }}
          className="flex flex-col items-center gap-1.5 snap-start min-w-[72px] group"
        >
          <div className="w-[72px] h-[72px] rounded-full p-[2px] bg-white/10 group-active:scale-95 transition-transform border border-white/20 relative">
            <div className="w-full h-full rounded-full border-[3px] border-black overflow-hidden bg-charcoal flex items-center justify-center">
               <img src="https://i.pravatar.cc/150?img=11" alt="Your Story" className="w-full h-full object-cover opacity-60" />
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-amethyst-500 rounded-full border-2 border-black flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.8)]">
              <Plus className="w-4 h-4 text-white stroke-[3]" />
            </div>
          </div>
          <span className="text-[11px] text-white/80 font-medium truncate w-full text-center tracking-wide">Your Story</span>
        </button>

        {stories.map((story, idx) => (
          <button 
            key={`story-${story.id || idx}`} 
            onClick={() => { playHaptic(); setActiveStory(story); }}
            className="flex flex-col items-center gap-1.5 snap-start min-w-[72px] group"
          >
            <div className={`w-[72px] h-[72px] rounded-full p-[2px] ${story.isUser ? 'bg-slate-700' : 'bg-amethyst-500 shadow-[0_0_20px_rgba(168,85,247,0.8)] group-active:scale-95 transition-transform border border-amethyst-400'}`}>
              <div className="w-full h-full rounded-full border-[3px] border-black overflow-hidden bg-amethyst-900">
                <img src={story.image} alt={story.name} className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="text-[11px] text-white/80 font-medium truncate w-full text-center tracking-wide">{story.name}</span>
          </button>
        ))}
      </div>

      {/* Posts Feed with Z-Axis Holographic Scroll effect */}
      {loading || personalizing ? (
        <div className="flex flex-col gap-8 py-10 px-4">
          {[1, 2].map((i) => (
            <div key={`loading-post-${i}`} className="bg-white/5 border border-white/10 rounded-[32px] p-5 h-[400px] relative overflow-hidden">
               <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
               <div className="flex gap-4 items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-white/10" />
                  <div className="space-y-3">
                     <div className="w-40 h-4 bg-white/10 rounded-full" />
                     <div className="w-24 h-3 bg-white/10 rounded-full" />
                  </div>
               </div>
               <div className="w-full h-64 bg-white/5 rounded-[24px]" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-white/5 rounded-3xl border border-white/5 mx-2">
          <p>No posts in your nebula yet.</p>
        </div>
      ) : (
        <div className="space-y-24 perspective-[2000px] preserve-3d">
          {posts.map((post, i) => (
            <motion.div 
              key={`feed-post-${post.id || i}`}
              initial={{ opacity: 0, rotateX: 20, z: -500, y: 100 }}
              whileInView={{ opacity: 1, rotateX: 0, z: 0, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="preserve-3d relative"
            >
              {/* Post Wrapper with 16K Engine UI */}
              <div className="relative">
                <PostCard post={post} />
                
                {/* AR Mode Toggle */}
                <div className="absolute top-4 left-4 z-20 pointer-events-auto">
                   <button
                     onClick={() => { playHaptic(); setArModeActive(!arModeActive); }}
                     className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center shadow-lg hover:bg-black/60 transition-colors relative"
                     title="AR Auto-Solve"
                   >
                     <Brain className={`w-4 h-4 ${arModeActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                     {arModeActive && <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />}
                   </button>
                </div>

                {/* Real-Time AI Dubbing Dropdown Simulation */}
                <div className="absolute top-4 right-4 z-20 pointer-events-auto">
                   <button onClick={playHaptic} className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center shadow-lg hover:bg-black/60 transition-colors text-white" title="Translate (EN » JP)">
                     <Globe className="w-4 h-4" />
                   </button>
                </div>

                {/* Web3 Fractional Share & 3D Coin Tipping Overlay */}
                <div className="absolute -right-4 bottom-[20%] flex flex-col gap-3 z-30 pointer-events-auto">
                   <button onClick={() => { playHaptic(); triggerCoinToss(i); }} className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.6)] border border-yellow-200/50 hover:scale-110 active:scale-95 transition-all outline-none">
                     <Coins className="w-6 h-6 text-black" />
                   </button>
                   <button onClick={playHaptic} className="w-12 h-12 bg-charcoal/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.6)] border border-green-500/30 hover:scale-110 active:scale-95 transition-all group outline-none">
                     <TrendingUp className="w-6 h-6 text-green-400 group-hover:text-green-300" />
                   </button>
                </div>
                
                {/* Tossing Coin Animations */}
                <AnimatePresence>
                   {activeToss === i && (
                     <motion.div 
                       initial={{ opacity: 1, scale: 0.5, y: 0, rotateX: 0, rotateY: 0 }}
                       animate={{ opacity: 0, scale: 2, y: -300, rotateX: 720, rotateY: 360 }}
                       exit={{ opacity: 0 }}
                       transition={{ duration: 1, ease: "easeOut" }}
                       className="absolute right-0 bottom-1/4 pointer-events-none z-50 flex items-center justify-center transform-gpu"
                     >
                       <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full border-4 border-yellow-200 shadow-[0_0_30px_rgba(234,179,8,1)] flex items-center justify-center font-serif text-black">
                          <span className="font-black text-2xl drop-shadow-md pb-1">V</span>
                       </div>
                     </motion.div>
                   )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      </div>
    </div>
  );
}
