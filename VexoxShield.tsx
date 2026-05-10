import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Fingerprint, Lock, Unlock, X } from 'lucide-react';

interface VexoxShieldProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VexoxShield({ isOpen, onClose }: VexoxShieldProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsUnlocked(true);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-amethyst-900/40 backdrop-blur-2xl"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-sm glass-amethyst rounded-[2.5rem] p-8 text-center relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 rounded-3xl bg-amethyst-500/20 flex items-center justify-center text-amethyst-accent border border-amethyst-500/30">
                {isUnlocked ? <Unlock className="w-10 h-10" /> : <Shield className="w-10 h-10" />}
              </div>
            </div>

            <h2 className="text-2xl font-display font-bold text-white mb-2">Vexox Shield</h2>
            <p className="text-slate-400 text-sm mb-12">
              {isUnlocked 
                ? 'Your private data is secured and accessible.' 
                : 'Biometric verification required to access your vault.'}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8 text-left">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Encrypted</span>
                <span className="text-xl font-display font-bold text-white">256-bit</span>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Status</span>
                <span className="text-xl font-display font-bold text-amethyst-accent">Active</span>
              </div>
            </div>

            {!isUnlocked ? (
              <button
                onClick={simulateScan}
                disabled={isScanning}
                className="w-full py-4 bg-amethyst-600 hover:bg-amethyst-500 disabled:bg-amethyst-800 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 relative overflow-hidden group shadow-[0_0_20px_rgba(147,51,234,0.3)]"
              >
                {isScanning && (
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="absolute inset-0 bg-white/20 skew-x-12"
                  />
                )}
                {isScanning ? (
                  <>
                    <Fingerprint className="w-6 h-6 animate-pulse" />
                    <span>Scanning...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span>Touch ID to Unlock</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setIsUnlocked(false)}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl font-bold transition-all border border-white/10"
              >
                Lock Vault
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
