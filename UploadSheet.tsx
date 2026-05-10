import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, LayoutGrid, PlaySquare, Video, X, Music, Image as ImageIcon, Send, Sparkles } from 'lucide-react';
import { playHaptic } from '../lib/haptics';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, storage, auth, handleFirestoreError, OperationType } from '../lib/firebase';

interface UploadSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadSheet({ isOpen, onClose }: UploadSheetProps) {
  const [step, setStep] = useState<'menu' | 'select' | 'uploading'>('menu');
  const [uploadType, setUploadType] = useState<'Post' | 'Story' | 'Reel' | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showMusicSearch, setShowMusicSearch] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);

  const MOCK_TRACKS = [
    { id: 1, title: 'Amethyst Dreams', artist: 'Vexox Official', duration: '2:14', trending: true },
    { id: 2, title: 'Lo-Fi Chill Study', artist: 'Focus Beats', duration: '3:45', trending: true },
    { id: 3, title: 'Night Ride', artist: 'Synthwave', duration: '4:20', trending: false },
    { id: 4, title: 'Bass Drops', artist: 'DJ Nitro', duration: '1:50', trending: false },
  ];

  const handleSelectType = (type: 'Post' | 'Story' | 'Reel') => {
    playHaptic();
    setUploadType(type);
    setStep('select');
  };

  const handleFileClick = () => {
    playHaptic();
    if(fileInputRef.current) {
        // Set accept type based on what they're trying to upload
        if (uploadType === 'Reel') {
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
      await handleRealUpload(file);
    }
  };

  const handleRealUpload = async (file: File) => {
    if (!auth.currentUser) {
      alert("Must be logged in to upload");
      return;
    }
    
    playHaptic();
    setStep('uploading');
    setProgress(0);
    
    try {
      const isVideo = file.type.startsWith('video');
      const folder = uploadType === 'Reel' || isVideo ? 'reels' : 'posts';
      const storageRef = ref(storage, `${folder}/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed', 
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        },
        (error) => {
           console.error("Upload error", error);
           setStep('menu');
           alert("Failed to upload.");
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          
          if (uploadType === 'Reel') {
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
          } else {
             await addDoc(collection(db, 'posts'), {
               authorId: auth.currentUser!.uid,
               authorName: auth.currentUser!.displayName || 'User',
               authorPhoto: auth.currentUser!.photoURL || null,
               imageUrl: downloadUrl,
               likesCount: 0,
               commentsCount: 0,
               createdAt: serverTimestamp(),
               content: ''
             });
          }
          
          playHaptic();
          alert(`${uploadType} uploaded successfully with 16k Processing!`);
          onClose();
          setStep('menu');
        }
      );
    } catch (error) {
       handleFirestoreError(error, OperationType.CREATE, uploadType === 'Reel' ? 'reels' : 'posts');
       setStep('menu');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { playHaptic(); onClose(); setStep('menu'); }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[101] max-w-md mx-auto"
          >
            <div className="bg-black/90 backdrop-blur-[15px] border-t border-amethyst-500/20 rounded-t-[2.5rem] p-6 pb-12 shadow-[0_-20px_40px_rgba(139,92,246,0.2)]">
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8" />
              
              {step === 'menu' && (
                <div className="space-y-4">
                  <h3 className="text-white font-display font-bold text-xl mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-amethyst-300 to-white">Create New</h3>
                  
                  <button onClick={() => handleSelectType('Post')} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-95 group">
                    <div className="p-3 bg-amethyst-500/20 rounded-xl group-hover:bg-amethyst-500/40 transition-colors">
                      <LayoutGrid className="w-6 h-6 text-amethyst-300" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-white font-medium">Create Post</h4>
                      <p className="text-slate-400 text-xs">Share multiple high-quality photos</p>
                    </div>
                  </button>

                  <button onClick={() => handleSelectType('Story')} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-95 group">
                    <div className="p-3 bg-orange-500/20 rounded-xl group-hover:bg-orange-500/40 transition-colors">
                      <ImageIcon className="w-6 h-6 text-orange-300" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-white font-medium">Add Story</h4>
                      <p className="text-slate-400 text-xs">Share moments (Disappears in 24h)</p>
                    </div>
                  </button>

                  <button onClick={() => handleSelectType('Reel')} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-95 group">
                    <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/40 transition-colors">
                      <Video className="w-6 h-6 text-blue-300" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-white font-medium">Post Reel</h4>
                      <p className="text-slate-400 text-xs">Upload 60FPS vertical videos</p>
                    </div>
                  </button>

                  <button onClick={() => { playHaptic(); alert('Live streaming capabilities opening soon!'); }} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-95 group">
                    <div className="p-3 bg-red-500/20 rounded-xl group-hover:bg-red-500/40 transition-colors">
                      <Sparkles className="w-6 h-6 text-red-300" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-white font-medium">Go Live</h4>
                      <p className="text-slate-400 text-xs">Start a real-time broadcast</p>
                    </div>
                  </button>
                </div>
              )}

              {step === 'select' && (
                <div className="flex flex-col items-center py-6">
                  <h3 className="text-white font-display font-bold text-xl mb-2">Upload {uploadType}</h3>
                  <p className="text-slate-400 text-sm mb-8 text-center">Select media from your gallery to proceed.</p>
                  
                  <input type="file" className="hidden" accept="image/*,video/*" multiple ref={fileInputRef} onChange={handleFileChange} />
                  
                  <div className="flex gap-4 w-full">
                      <button onClick={handleFileClick} className="flex-1 flex flex-col items-center justify-center gap-2 p-6 rounded-3xl bg-amethyst-900/50 border-2 border-dashed border-amethyst-500/40 hover:bg-amethyst-900/80 transition-colors active:scale-95 text-center">
                        <ImageIcon className="w-8 h-8 text-amethyst-300 mx-auto" />
                        <span className="text-white font-medium text-sm">Gallery</span>
                        <span className="text-[10px] text-slate-500 text-center mx-auto block w-full">Select from device</span>
                      </button>
                      
                      {uploadType !== 'Post' && (
                        <button onClick={() => { playHaptic(); setShowMusicSearch(true); }} className={`flex-1 flex flex-col items-center justify-center gap-2 p-6 rounded-3xl border-2 hover:bg-white/10 transition-colors active:scale-95 overflow-hidden relative text-center mx-auto ${selectedMusic ? 'bg-amethyst-600/30 border-amethyst-500/50' : 'bg-white/5 border-dashed border-white/10'}`}>
                          {selectedMusic ? (
                             <div className="absolute inset-0 flex items-center justify-center z-0 opacity-20 pointer-events-none">
                                {[1,2,3,4,5,6,7,-8,-9,-10].map((i, idx) => (
                                   <motion.div key={`audio-wave-${idx}-${i}`} animate={{ height: [15, 40, 15] }} transition={{ repeat: Infinity, duration: 0.8, delay: idx * 0.1 }} className="w-1.5 bg-amethyst-300 rounded-full mx-0.5" />
                                ))}
                             </div>
                          ) : (
                            <Music className="w-8 h-8 text-purple-300 relative z-10 mx-auto" />
                          )}
                          <span className="text-white font-medium text-sm relative z-10 w-full truncate px-2">{selectedMusic || 'Add Music'}</span>
                          <span className="text-[10px] text-amethyst-400 font-medium relative z-10">{selectedMusic ? 'Selected' : 'Trending Hits'}</span>
                        </button>
                      )}
                  </div>
                  
                  <button onClick={() => setStep('menu')} className="mt-8 text-slate-400 text-sm hover:text-white transition-colors">Back</button>
                </div>
              )}

              {step === 'uploading' && (
                <div className="flex flex-col items-center py-8">
                  <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                     <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-0 rounded-full border-b-2 border-l-2 border-amethyst-400" />
                     <Sparkles className="w-8 h-8 text-amethyst-300 animate-pulse" />
                  </div>
                  <h3 className="text-white font-display font-bold text-xl mb-2">Processing {uploadType}...</h3>
                  <p className="text-amethyst-300 text-xs tracking-wider mb-6">16K QUALITY / 60FPS ENGINE</p>
                  
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-amethyst-600 to-amethyst-300"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-slate-400 text-sm mt-3">{progress}% completed</span>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}

      {/* Music Search Overlay */}
      {showMusicSearch && (
         <motion.div 
           initial={{ opacity: 0, y: '100%' }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: '100%' }}
           transition={{ type: 'spring', damping: 25, stiffness: 300 }}
           className="fixed inset-0 z-[105] bg-black/90 backdrop-blur-2xl flex flex-col"
         >
           <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10">
              <h3 className="text-white font-display font-bold text-xl">Music Library</h3>
              <button onClick={() => { playHaptic(); setShowMusicSearch(false); }} className="p-2 text-slate-400 bg-white/5 rounded-full hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
           </div>
           
           <div className="p-4 flex-1 overflow-y-auto">
             <input 
                type="text" 
                placeholder="Search trending songs..." 
                className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 mb-6 focus:outline-none focus:border-amethyst-500"
             />
             
             <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 px-2">Trending Tracks</h4>
             <div className="space-y-2">
                {MOCK_TRACKS.map(track => (
                   <button 
                     key={track.id}
                     onClick={() => { playHaptic(); setSelectedMusic(track.title); setShowMusicSearch(false); }}
                     className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-colors group"
                   >
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amethyst-900/50 rounded-xl flex items-center justify-center text-amethyst-300">
                          <Music className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                           <h5 className="text-white font-bold">{track.title}</h5>
                           <p className="text-slate-400 text-xs font-medium">{track.artist}</p>
                        </div>
                     </div>
                     <span className="text-slate-500 text-xs group-hover:text-white transition-colors">{track.duration}</span>
                   </button>
                ))}
             </div>
           </div>
         </motion.div>
      )}
    </AnimatePresence>
  );
}
