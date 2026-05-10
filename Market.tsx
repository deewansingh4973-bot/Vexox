import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Loader2, ShoppingBag, Plus, Wallet, Send } from 'lucide-react';
import { playHaptic } from '../lib/haptics';

interface MarketItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  sellerId: string;
}

const FALLBACK_MARKET_ITEMS: MarketItem[] = [
  {
    id: "m1",
    name: "Vexox Pro Badge",
    price: 500,
    imageUrl: "https://images.unsplash.com/photo-1614729939124-032f0b5610ce?auto=format&fit=crop&q=80&w=400",
    description: "Exclusive creator badge",
    sellerId: "admin"
  },
  {
    id: "m2",
    name: "Special AI Tokens",
    price: 150,
    imageUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=400",
    description: "Boost your AI Shiksha queries",
    sellerId: "admin"
  },
  {
    id: "m3",
    name: "12th PCM Study Notes",
    price: 300,
    imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=400",
    description: "Topper handwritten notes",
    sellerId: "admin"
  },
  {
    id: "m4",
    name: "Nebula Dark Theme",
    price: 250,
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400",
    description: "Exclusive premium theme",
    sellerId: "admin"
  }
];

export default function Market() {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(2050);

  useEffect(() => {
    const q = query(
      collection(db, 'marketItems'),
      where('createdAt', '>', new Date('2020-01-01T00:00:00Z')),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MarketItem[];
      setItems(itemsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'marketItems');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const displayedItems = items.length > 0 ? items : FALLBACK_MARKET_ITEMS;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-center h-screen pt-20">
        <Loader2 className="w-8 h-8 text-amethyst-500 animate-spin" />
      </div>
    );
  }

  const handleBuy = (price: number, name: string) => {
    playHaptic();
    if (walletBalance >= price) {
      if (window.confirm(`Purchase ${name} for ${price} VC?`)) {
        setWalletBalance(prev => prev - price);
        alert('Purchase successful! Item added to your Vault.');
      }
    } else {
      alert("Insufficient V-Coins! Participate more to earn VC.");
    }
  };

  const handleTransfer = () => {
    playHaptic();
    const friendId = prompt("Enter friend's Vexox username to transfer V-Coins:");
    if (friendId) {
       const amount = parseInt(prompt("Enter amount:") || "0");
       if (amount > 0 && amount <= walletBalance) {
         setWalletBalance(prev => prev - amount);
         alert(`Sent ${amount} V-Coins to ${friendId}!`);
       } else {
         alert('Invalid amount or insufficient balance.');
       }
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-32 pt-6">
      {/* Wallet Card */}
      <div className="glass bg-gradient-to-br from-amethyst-900/50 to-bg-amethyst-800/30 rounded-3xl p-6 mb-8 border border-white/10 shadow-[0_4px_30px_rgba(139,92,246,0.3)]">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="w-6 h-6 text-amethyst-400" />
          <h3 className="text-white font-medium text-sm">Your Wallet</h3>
        </div>
        <div className="flex items-end justify-between mt-4">
          <div>
            <span className="text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-amethyst-300 to-white">
              {walletBalance.toLocaleString()}
            </span>
            <span className="text-amethyst-400 font-bold ml-2 text-sm uppercase tracking-widest">VC</span>
          </div>
          <button onClick={handleTransfer} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-colors text-sm font-semibold backdrop-blur-md border border-white/10 active:scale-95">
            <Send className="w-4 h-4" /> Transfer
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amethyst-accent" />
            Vexox Marketplace
          </h2>
          <p className="text-slate-400 text-sm mt-1">Trade items in the Vexox galaxy.</p>
        </div>
        <button onClick={() => playHaptic()} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-2xl transition-colors backdrop-blur-md border border-white/10 active:scale-95">
          <Plus className="w-5 h-5 text-amethyst-300" />
        </button>
      </div>

      {displayedItems.length === 0 ? (
         <div className="glass-amethyst rounded-[2rem] p-12 text-center border-dashed border-2 border-amethyst-500/30">
           <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto mb-4" />
           <h3 className="text-lg font-bold text-white mb-2">Market is empty</h3>
           <p className="text-slate-400 text-sm">Be the first to list an item in the galaxy.</p>
         </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {displayedItems.map((item, i) => (
            <div key={`market-${item.id || i}`} className="glass rounded-[1.5rem] overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              <div className="aspect-square bg-amethyst-900/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 animate-pulse" /> {/* Shimmer */}
                {item.imageUrl && (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-full h-full object-cover relative z-10 opacity-0 transition-opacity duration-300"
                    onLoad={(e) => e.currentTarget.classList.remove('opacity-0')}
                  />
                )}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg z-20 border border-white/10">
                  <span className="text-amethyst-300 font-bold text-xs">V-Coin</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold truncate text-sm">{item.name}</h3>
                <p className="text-amethyst-accent font-display font-semibold mt-1 text-sm flex items-center gap-1">
                  <span>{item.price}</span>
                  <span className="text-[10px] text-slate-400 font-sans uppercase tracking-wider">VC</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{item.description}</p>
                <button 
                  onClick={() => handleBuy(item.price, item.name)}
                  className="w-full mt-3 bg-amethyst-600/20 hover:bg-amethyst-600/40 text-amethyst-300 text-xs font-bold py-2 rounded-xl transition-colors border border-amethyst-500/30"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
