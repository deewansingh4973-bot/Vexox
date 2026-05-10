import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Heart, MoreHorizontal, AtSign, Smile } from 'lucide-react';
import { playHaptic } from '../lib/haptics';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

interface CommentSheetProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentSheet({ postId, isOpen, onClose }: CommentSheetProps) {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !postId) return;

    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(fetched);
    });

    return () => unsubscribe();
  }, [isOpen, postId]);

  const handleSend = async () => {
    if (!commentText.trim() || !auth.currentUser) return;
    playHaptic();
    setLoading(true);
    
    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        text: commentText,
        userId: auth.currentUser.uid,
        user: auth.currentUser.displayName || 'User',
        avatar: auth.currentUser.photoURL || 'https://i.pravatar.cc/150?img=11',
        createdAt: serverTimestamp(),
        likes: 0
      });

      // Update post commentsCount
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        commentsCount: increment(1)
      });

      setCommentText('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `posts/${postId}/comments`);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeComment = async (commentId: string, currentLikes: number) => {
    playHaptic();
    try {
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      await updateDoc(commentRef, {
        likes: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}/comments/${commentId}`);
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
            onClick={() => { playHaptic(); onClose(); }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[101] max-w-2xl mx-auto h-[80vh] flex flex-col pointer-events-auto"
          >
            <div className="bg-black/90 backdrop-blur-[20px] border-t border-amethyst-500/30 rounded-t-[2.5rem] flex-1 flex flex-col shadow-[0_-20px_50px_rgba(139,92,246,0.15)] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5 relative bg-gradient-to-b from-white/5 to-transparent">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full" />
                <h3 className="text-white font-display font-bold text-lg mt-2">Comments <span className="text-amethyst-400 font-normal">{comments.length}</span></h3>
                <button onClick={() => { playHaptic(); onClose(); }} className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-full mt-2">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-hide bg-black/40">
                 {comments.length === 0 ? (
                    <div className="flex justify-center py-6 text-slate-500 text-sm">No comments yet. Be the first!</div>
                 ) : comments.map((comment, i) => (
                   <div key={`comment-${comment.id || i}`} className="flex gap-3">
                     <img src={comment.avatar || 'https://i.pravatar.cc/150'} alt={comment.user} className="w-9 h-9 rounded-full border border-white/10" />
                     <div className="flex-1">
                       <div className="flex items-center gap-2 mb-1">
                         <span className="text-white text-sm font-bold">{comment.user}</span>
                       </div>
                       <p className="text-slate-300 text-sm leading-relaxed">{comment.text}</p>
                       <div className="flex items-center gap-4 mt-2">
                         <button className="text-slate-500 text-xs font-semibold hover:text-white transition-colors">Reply</button>
                         <button className="text-slate-500 font-bold tracking-widest hover:text-white transition-colors">...</button>
                       </div>
                     </div>
                     <div className="flex flex-col items-center gap-1 mt-2">
                       <button onClick={() => handleLikeComment(comment.id, comment.likes || 0)} className="text-slate-500 hover:text-red-400 transition-colors active:scale-95">
                         <Heart className="w-4 h-4" />
                       </button>
                       <span className="text-slate-500 text-[10px] font-medium">{comment.likes || 0}</span>
                     </div>
                   </div>
                 ))}
                 
                 <div className="flex justify-center py-6">
                    <span className="px-4 py-2 bg-white/5 rounded-full text-slate-500 text-xs">End of comments</span>
                 </div>
              </div>

              {/* Comment Input */}
              <div className="p-4 border-t border-white/10 bg-black/60 backdrop-blur-md pb-8">
                 <div className="relative flex items-center">
                   <div className="absolute pl-4 flex gap-2">
                      <button className="text-amethyst-300/60 hover:text-amethyst-300 transition-colors">
                        <Smile className="w-5 h-5" />
                      </button>
                      <button className="text-amethyst-300/60 hover:text-amethyst-300 transition-colors">
                        <AtSign className="w-5 h-5" />
                      </button>
                   </div>
                   <input 
                     type="text" 
                     value={commentText}
                     onChange={(e) => setCommentText(e.target.value)}
                     placeholder="Add a comment... (Support for Emoji & @)"
                     onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                     className="w-full bg-white/5 border border-white/10 rounded-full pl-20 pr-12 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amethyst-500 transition-colors shadow-inner"
                   />
                   <button 
                     onClick={handleSend}
                     disabled={!commentText.trim() || loading}
                     className="absolute right-2 p-2 bg-amethyst-600 rounded-full text-white hover:bg-amethyst-500 transition-colors disabled:opacity-50 disabled:bg-slate-700"
                   >
                     <Send className="w-4 h-4" />
                   </button>
                 </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
