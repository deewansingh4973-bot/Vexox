import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Edit3, Plus } from 'lucide-react';
import { playHaptic } from '../lib/haptics';
import ChatScreen from './ChatScreen';
import { collection, query, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface MessagesSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MessagesSheet({ isOpen, onClose }: MessagesSheetProps) {
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'));
        const snapshot = await getDocs(q);
        const fetchedUsers = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(u => u.id !== auth.currentUser?.uid)
          .map(user => ({
            id: user.id,
            name: (user as any).fullName || (user as any).username || 'User',
            lastMsg: 'Tap to chat with this user...',
            time: 'Now',
            unread: false,
            image: (user as any).profilePictureUrl || 'https://i.pravatar.cc/150'
          }));
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, [isOpen]);

  const notes = [
    { id: 'me', name: 'Leave a note', image: auth.currentUser?.photoURL || 'https://i.pravatar.cc/150?img=11', isUser: true },
    { id: 1, name: 'Astro', note: 'Busy coding...', image: 'https://i.pravatar.cc/150?img=12' },
    { id: 2, name: 'Nova', note: 'Vexox is live!', image: 'https://i.pravatar.cc/150?img=13' },
    { id: 3, name: 'Cosmo', note: 'Studying 📚', image: 'https://i.pravatar.cc/150?img=14' },
    { id: 4, name: 'Luna', note: 'Coffee needed ☕', image: 'https://i.pravatar.cc/150?img=15' },
  ];

  const threads = [
    { id: 1, name: 'Astro', lastMsg: 'Did you see the new update?', time: '1m', unread: true, image: 'https://i.pravatar.cc/150?img=12' },
    { id: 2, name: 'Nova', lastMsg: 'Nova: Lets meet at 5', time: '1h', unread: false, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=100&q=80' },
    { id: 3, name: 'Vexox Team', lastMsg: 'Welcome to the platform!', time: '1d', unread: false, image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=100&q=80' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-50 bg-black flex flex-col"
        >
          {activeChat ? (
            <ChatScreen user={activeChat} onBack={() => setActiveChat(null)} />
          ) : (
            <>
              {/* Header */}
              <div className="pt-safe px-4 py-4 border-b border-white/10 flex items-center justify-between bg-black/60 backdrop-blur-xl z-20">
                <div className="flex items-center gap-4">
                  <button onClick={() => { playHaptic(); onClose(); }} className="text-white active:scale-95">
                    <X className="w-6 h-6" />
                  </button>
                  <h2 className="text-xl font-bold text-white tracking-tight">Messages</h2>
                </div>
                <button className="text-white active:scale-95">
                  <Edit3 className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Search Bar */}
                <div className="px-4 py-3">
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 absolute left-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search" 
                      className="w-full bg-zinc-900 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:bg-zinc-800 transition-colors"
                    />
                  </div>
                </div>

                {/* Vexox Notes Row */}
                <div className="px-1 py-2">
                  <div className="flex gap-4 overflow-x-auto scrollbar-hide px-3 pb-4">
                    {notes.map((note) => (
                      <div key={note.id} className="flex flex-col items-center gap-2 relative min-w-[72px]">
                        {note.isUser ? (
                          <button className="relative w-16 h-16 active:scale-95 transition-transform" onClick={() => playHaptic()}>
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-zinc-800/80 backdrop-blur-md px-3 py-1.5 rounded-2xl w-max max-w-[100px] shadow-lg border border-white/10">
                              <p className="text-[10px] text-slate-300 whitespace-nowrap truncate">+</p>
                            </div>
                            <img src={note.image} alt="User" className="w-full h-full rounded-full object-cover" />
                            <div className="absolute bottom-0 right-0 w-5 h-5 bg-amethyst-500 rounded-full border-2 border-black flex items-center justify-center">
                              <Plus className="w-3 h-3 text-white" />
                            </div>
                          </button>
                        ) : (
                          <button className="relative w-16 h-16 active:scale-95 transition-transform group" onClick={() => playHaptic()}>
                            {note.note && (
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-800/80 backdrop-blur-md px-3 py-1.5 rounded-2xl w-max max-w-[100px] shadow-lg border border-white/10 group-hover:bg-zinc-700 transition-colors">
                                <p className="text-[11px] text-slate-200 truncate">{note.note}</p>
                              </div>
                            )}
                            <img src={note.image} alt={note.name} className="w-full h-full rounded-full object-cover" />
                          </button>
                        )}
                        <span className="text-[11px] text-slate-400">{note.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex flex-col">
                  <div className="px-4 py-2 flex items-center justify-between">
                    <h3 className="text-[13px] font-bold text-white">Messages</h3>
                    <span className="text-[13px] font-semibold text-amethyst-400">Requests</span>
                  </div>
                  
                  {users.map((thread, i) => (
                    <button 
                      key={`thread-${thread.id}-${i}`} 
                      onClick={() => { playHaptic(); setActiveChat(thread); }}
                      className="w-full flex items-center gap-4 px-4 py-3 hover:bg-zinc-900 transition-colors active:bg-zinc-800"
                    >
                      <img src={thread.image} alt={thread.name} className="w-14 h-14 rounded-full object-cover" />
                      <div className="flex-1 text-left">
                        <h4 className={`text-[15px] ${thread.unread ? 'font-bold text-white' : 'font-semibold text-slate-200'}`}>
                          {thread.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className={`text-[13px] truncate max-w-[200px] ${thread.unread ? 'font-semibold text-white' : 'text-slate-400'}`}>
                            {thread.lastMsg}
                          </p>
                          <span className="text-[13px] text-slate-500">· {thread.time}</span>
                        </div>
                      </div>
                      {thread.unread && (
                        <div className="w-2.5 h-2.5 bg-amethyst-500 rounded-full shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
