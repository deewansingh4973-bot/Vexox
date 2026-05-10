import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Wand2, RefreshCcw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playHaptic } from '../lib/haptics';
import { cn } from '../lib/utils';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export default function Explore() {
  const [queryText, setQueryText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeFeed, setActiveFeed] = useState("trending");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fallbackImages = [
    "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=600",
  ];

  useEffect(() => {
    fetchExplorePosts();
  }, []);

  const fetchExplorePosts = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'posts'), orderBy('likesCount', 'desc'), limit(30));
      const snapshot = await getDocs(q);
      const postsData = snapshot.docs
        .map(doc => doc.data())
        .filter(data => data.imageUrl)
        .map(data => data.imageUrl as string);

      if (postsData.length > 0) {
        // Pad with fallbacks if too few posts
        if (postsData.length < 9) {
          setImages([...postsData, ...fallbackImages.slice(0, 9 - postsData.length)]);
        } else {
          setImages(postsData);
        }
      } else {
        setImages(fallbackImages);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'posts');
      setImages(fallbackImages);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    if (!queryText.trim()) return;
    playHaptic();
    setIsGenerating(true);
    const search = queryText;
    setQueryText("");
    
    // Simulate AI liquid transition
    setTimeout(() => {
      setImages(prev => [...prev].sort(() => Math.random() - 0.5));
      setActiveFeed(search);
      setIsGenerating(false);
      playHaptic();
    }, 2000);
  };

  return (
    <div className="pb-24 pt-20 min-h-screen relative overflow-hidden bg-[#05020a]">
      {/* Liquid background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute w-[500px] h-[500px] bg-amethyst-600/30 rounded-full blur-[100px] -top-32 -left-32 animate-[spin_10s_linear_infinite]" />
        <div className="absolute w-[400px] h-[400px] bg-fuchsia-600/20 rounded-full blur-[80px] bottom-0 right-0 animate-[spin_15s_linear_infinite_reverse]" />
      </div>

      {/* Sticky AI Search Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 pt-safe bg-gradient-to-b from-[#05020a]/90 to-transparent backdrop-blur-[20px] pb-4">
        <div className="px-4 py-2 mt-2">
          <div className="relative flex items-center shadow-[0_10px_30px_rgba(147,51,234,0.15)] rounded-2xl group">
            <div className="absolute inset-0 bg-gradient-to-r from-amethyst-500 to-fuchsia-500 rounded-2xl blur-[2px] opacity-40 group-focus-within:opacity-70 transition-opacity" />
            <div className="relative w-full bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl flex items-center overflow-hidden">
              <Sparkles className="w-5 h-5 absolute left-4 text-amethyst-400 group-focus-within:text-fuchsia-300 transition-colors" />
              <input 
                type="text" 
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="Ask AI to generate your feed..." 
                className="w-full bg-transparent pl-12 pr-12 py-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-0 font-medium text-sm"
              />
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !queryText.trim()}
                className="absolute right-2 p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white active:scale-95 transition-all disabled:opacity-50 border border-white/5"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide pb-2 px-1">
            {['Trending', 'Cyberpunk', 'Minimalist', 'Space', 'Abstract'].map(tag => (
              <button
                key={tag}
                onClick={() => { setQueryText(tag); playHaptic(); }}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap backdrop-blur-md transition-all active:scale-95 border",
                  activeFeed === tag.toLowerCase() 
                    ? "bg-amethyst-500 text-white border-amethyst-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]" 
                    : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Explore Grid with Liquid Animation */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeFeed}
          initial={{ opacity: 0, filter: 'blur(20px)', scale: 0.95 }}
          animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
          exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-3 gap-[2px] pt-12 relative z-10"
        >
          {images.map((src, i) => {
            const patternIndex = i % 10;
            let styleClasses = "col-span-1 row-span-1 aspect-square";
            
            if (patternIndex === 2) {
               styleClasses = "col-span-2 row-span-2 col-start-2";
            } else if (patternIndex === 7) {
               styleClasses = "col-span-2 row-span-2 col-start-1";
            }

            return (
              <motion.div 
                key={`explore-image-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % 10) * 0.05 + 0.3 }}
                className={`relative group cursor-pointer overflow-hidden bg-black/40 backdrop-blur-sm border border-white/5 ${styleClasses}`}
                onClick={() => playHaptic()}
              >
                <img 
                  src={src} 
                  alt="AI Generated Feed" 
                  className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-amethyst-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-color" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="absolute top-2 right-2 text-white opacity-80 drop-shadow-lg scale-0 group-hover:scale-100 transition-transform duration-300">
                  <Sparkles className="w-4 h-4 text-fuchsia-300" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
