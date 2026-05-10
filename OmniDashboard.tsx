import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, Network, Glasses, ShieldAlert, Code2, Play, 
  Activity, ArrowLeft, Hexagon, Fingerprint, Eye, Zap,
  Globe, Coins, Lock, Cpu, Radar, Radio, Shield, Crosshair, Map, Triangle
} from 'lucide-react';
import { playHaptic } from '../lib/haptics';

export default function OmniDashboard({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'neural' | 'mesh' | 'spatial' | 'sentinel' | 'studio'>('sentinel');
  const [lethalResponse, setLethalResponse] = useState(false);
  const [offlineMesh, setOfflineMesh] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] bg-charcoal text-white overflow-y-auto no-scrollbar pb-[130px] font-sans">
      
      {/* Omni-HUD Header */}
      <div className="sticky top-0 z-50 bg-charcoal/80 backdrop-blur-3xl border-b border-fuchsia-500/20 px-4 py-3 flex items-center justify-between shadow-[0_0_50px_rgba(217,70,239,0.15)]">
         <button onClick={() => { playHaptic(); onBack(); }} className="p-2 rounded-full bg-white/5 active:scale-95 transition-transform">
           <ArrowLeft className="w-6 h-6 text-fuchsia-400" />
         </button>
         <div className="flex flex-col items-center">
            <h1 className="text-sm font-black tracking-[0.2em] bg-gradient-to-r from-fuchsia-400 via-amethyst-300 to-indigo-400 bg-clip-text text-transparent uppercase">
              Omni-Ecosystem
            </h1>
            <span className="text-[9px] font-mono text-fuchsia-500 tracking-widest animate-pulse">SUPER ADMIN OVR-RIDE</span>
         </div>
         <div className="p-2">
           <Hexagon className="w-6 h-6 text-fuchsia-400 animate-[spin_4s_linear_infinite]" />
         </div>
      </div>

      {/* Grid Tabs */}
      <div className="flex overflow-x-auto no-scrollbar px-4 py-4 gap-2 border-b border-white/5">
         {[
           { id: 'neural', icon: <Database className="w-4 h-4" />, label: "Firebase Matrix" },
           { id: 'mesh', icon: <Network className="w-4 h-4" />, label: "Vex-Mesh" },
           { id: 'spatial', icon: <Glasses className="w-4 h-4" />, label: "Spatial OS" },
           { id: 'sentinel', icon: <ShieldAlert className="w-4 h-4" />, label: "The Sentinel" },
           { id: 'studio', icon: <Code2 className="w-4 h-4" />, label: "App Studio" },
         ].map((tab) => (
           <button
             key={tab.id}
             onClick={() => { playHaptic(); setActiveTab(tab.id as any); }}
             className={`flex flex-col items-center gap-1 min-w-[90px] py-3 rounded-2xl border transition-all ${activeTab === tab.id ? 'bg-fuchsia-500/20 border-fuchsia-500' : 'bg-white/5 border-white/10 opacity-60'}`}
           >
             <div className={`${activeTab === tab.id ? 'text-fuchsia-400 drop-shadow-[0_0_5px_rgba(217,70,239,0.8)]' : 'text-slate-400'}`}>
               {tab.icon}
             </div>
             <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}`}>
               {tab.label}
             </span>
           </button>
         ))}
      </div>

      <div className="p-4 relative">
        <AnimatePresence mode="wait">
          {/* 1. NEURAL BACKEND & FIREBASE MATRIX */}
          {activeTab === 'neural' && (
            <motion.div key="neural" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
               
               <div className="bg-[#0b0c10] border border-cyan-500/30 rounded-2xl p-5 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                    <Database className="w-24 h-24 text-cyan-500" />
                  </div>
                  <h3 className="text-cyan-400 text-xs font-black tracking-widest uppercase mb-4 flex items-center gap-2"><Cpu className="w-4 h-4" /> Multiverse Database Schema</h3>
                  
                  <div className="bg-charcoal border border-white/10 rounded-xl p-3 font-mono text-[10px] overflow-x-auto">
                    <pre className="text-emerald-400">
{`interface UserMatrix {
  id: string_UUIDv4;
  target2027_stats: {
    pcm_completion_pct: number;
    rpg_skill_nodes: Array<NodeHash>;
    quantum_streak: boolean;
  };
  web3_ledger: {
    vexox_coins: number;
    fractional_stakes: Array<C_Address>;
    nfc_pubkey: string_Ed25519;
  };
}`}
                    </pre>
                  </div>
               </div>

               <div className="bg-[#1f1e24] border border-blue-500/30 rounded-2xl p-5 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                  <h3 className="text-blue-400 text-xs font-black tracking-widest uppercase mb-4 flex items-center gap-2"><Zap className="w-4 h-4" /> 16K Media Processing Queue</h3>
                  <div className="space-y-4">
                     <div className="w-full flex items-center gap-3">
                       <span className="text-white font-mono text-xs w-24 truncate">quantum_lecture.raw</span>
                       <div className="flex-1 h-1.5 bg-black rounded-full overflow-hidden">
                          <motion.div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]" animate={{ width: ['0%', '100%'] }} transition={{ duration: 3, repeat: Infinity }} />
                       </div>
                       <span className="text-blue-400 font-mono text-[10px]">P-Node A7</span>
                     </div>
                     <div className="w-full flex items-center gap-3">
                       <span className="text-white font-mono text-xs w-24 truncate">AR_Lab_Asset.vroid</span>
                       <div className="flex-1 h-1.5 bg-black rounded-full overflow-hidden">
                          <motion.div className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,1)]" animate={{ width: ['0%', '76%'] }} transition={{ duration: 4, repeat: Infinity }} />
                       </div>
                       <span className="text-purple-400 font-mono text-[10px]">AI Auto-Tagging</span>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {/* 2. VEX-MESH DECENTRALIZED NETWORK */}
          {activeTab === 'mesh' && (
            <motion.div key="mesh" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
               
               <div className="bg-[#1a1c23] border border-emerald-500/30 rounded-2xl p-5 shadow-[0_0_40px_rgba(16,185,129,0.15)] flex flex-col items-center overflow-hidden preserve-3d">
                  <h3 className="text-emerald-400 text-xs font-black tracking-widest uppercase mb-6 self-start flex items-center gap-2"><Radar className="w-4 h-4" /> Mesh Topology Radar</h3>
                  
                  <div className="relative w-64 h-64 border border-emerald-500/20 rounded-full flex items-center justify-center transform perspective-1000 rotate-x-12">
                     <div className="absolute inset-4 border border-emerald-500/40 rounded-full animate-[ping_3s_linear_infinite]" />
                     <div className="absolute inset-12 border border-emerald-500/60 rounded-full" />
                     
                     <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,1)] z-10" />
                     
                     <motion.div className="absolute bg-emerald-500 rounded-full w-2 h-2 shadow-[0_0_10px_rgba(52,211,153,1)]" animate={{ top: ['10%', '30%'], left: ['20%', '80%'] }} transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }} />
                     <motion.div className="absolute bg-emerald-500 rounded-full w-2 h-2 shadow-[0_0_10px_rgba(52,211,153,1)]" animate={{ top: ['80%', '60%'], left: ['70%', '10%'] }} transition={{ duration: 7, repeat: Infinity, repeatType: "reverse" }} />
                     
                     {/* Radar Sweep */}
                     <div className="absolute inset-0 rounded-full border-r-2 border-emerald-400 animate-[spin_2s_linear_infinite] opacity-50 bg-gradient-to-r from-transparent to-emerald-500/10" />
                  </div>
                  
                  <div className="flex gap-4 mt-6">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-emerald-400 text-[10px] font-mono">PEERS: 14,204</div>
                    <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-emerald-400 text-[10px] font-mono">LATENCY: 0.4ms</div>
                  </div>
               </div>

               <div className="bg-charcoal/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                 <div className="flex flex-col gap-1 w-2/3">
                    <span className="text-white font-bold tracking-wide uppercase text-sm">Zero-Internet Protocol</span>
                    <span className="text-slate-400 text-[10px] uppercase">Bypass ISP Via P2P Ble/Wi-Fi</span>
                 </div>
                 <button onClick={() => { playHaptic(); setOfflineMesh(!offlineMesh); }} className={`w-14 h-8 rounded-full p-1 transition-colors ${offlineMesh ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]' : 'bg-white/10'}`}>
                    <motion.div className="w-6 h-6 bg-white rounded-full" animate={{ x: offlineMesh ? 24 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} />
                 </button>
               </div>
            </motion.div>
          )}

          {/* 3. SPATIAL OS & HYPER-PHYSICAL ECONOMY */}
          {activeTab === 'spatial' && (
            <motion.div key="spatial" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
               
               <div className="bg-gradient-to-br from-[#1a1224] to-[#0f0a14] border border-amethyst-500/40 rounded-2xl p-5 shadow-[0_0_30px_rgba(147,51,234,0.2)]">
                  <h3 className="text-amethyst-400 text-xs font-black tracking-widest uppercase mb-4 flex items-center gap-2"><Glasses className="w-4 h-4" /> Smart Glass Sync</h3>
                  <button onClick={playHaptic} className="w-full bg-amethyst-600 hover:bg-amethyst-500 transition-colors py-4 rounded-xl flex flex-col items-center justify-center gap-2 border border-amethyst-400/50 shadow-[0_0_20px_rgba(147,51,234,0.4)]">
                     <Radio className="w-6 h-6 text-white animate-pulse" />
                     <span className="text-white font-bold uppercase tracking-widest text-xs">Pair Vision Pro / Meta Quest</span>
                  </button>
               </div>

               <div className="relative preserve-3d w-full h-[220px] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(234,179,8,0.2)] flex items-center justify-center pt-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/40 to-charcoal" />
                  
                  <motion.div 
                    className="relative w-64 h-40 bg-gradient-to-tr from-yellow-400 via-yellow-200 to-yellow-600 rounded-xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.8)] border-2 border-white/20 flex flex-col justify-between preserve-3d"
                    animate={{ rotateY: [0, 15, -15, 0], rotateX: [10, 20, 10] }}
                    transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
                  >
                     <div className="flex justify-between items-start translate-z-12">
                        <Triangle className="w-8 h-8 text-black/80 fill-black/80" />
                        <Radio className="w-6 h-6 text-black/50" />
                     </div>
                     <div className="translate-z-20">
                       <span className="text-black/80 font-mono text-xl tracking-[0.2em] font-black drop-shadow-sm">4910 82★★ ****</span>
                     </div>
                     <div className="flex justify-between items-end translate-z-12">
                       <div className="flex flex-col">
                         <span className="text-[8px] text-black/60 font-bold uppercase">Cardholder</span>
                         <span className="text-black font-black uppercase tracking-wider text-xs">Omni Admin</span>
                       </div>
                       <span className="text-black font-black text-xs font-mono">1 ∇X = ₹ 8,421</span>
                     </div>
                  </motion.div>
                  
                  <div className="absolute top-2 left-3 flex items-center gap-2">
                     <Coins className="w-4 h-4 text-yellow-400" />
                     <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">3D NFC Card</span>
                  </div>
               </div>

               <div className="bg-[#1e1e1e] border border-slate-700 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Map className="w-8 h-8 text-slate-300" />
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-sm">Geo-Spatial Holo Drops</span>
                      <span className="text-slate-500 text-[10px] uppercase">Encrypted AR Anchors at GPS</span>
                    </div>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.6)] px-4 py-2 rounded-lg text-white font-bold text-xs uppercase tracking-wider">Map</button>
               </div>
            </motion.div>
          )}

          {/* 4. THE SENTINEL AI */}
          {activeTab === 'sentinel' && (
            <motion.div key="sentinel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
               
               <div className="bg-[#1a0f12] border border-red-500/40 rounded-2xl p-5 shadow-[0_0_50px_rgba(239,68,68,0.15)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-20 mix-blend-overlay" />
                  
                  <div className="flex justify-between items-center mb-6 relative z-10">
                     <h3 className="text-red-500 text-xs font-black tracking-widest uppercase flex items-center gap-2"><Shield className="w-4 h-4" /> Security Threat Matrix</h3>
                     <span className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/50 rounded text-[9px] font-mono animate-pulse">DEFCON 2</span>
                  </div>

                  <div className="w-full aspect-[2/1] border border-red-500/30 rounded-xl relative flex items-center justify-center bg-black overflow-hidden group">
                     {/* Grid */}
                     <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.2)_1px,transparent_1px)] bg-[size:10%_20%]" />
                     
                     <motion.div className="w-full flex items-center relative z-10 px-4">
                        <div className="w-12 h-12 rounded bg-charcoal border-2 border-slate-600 flex items-center justify-center"><Globe className="w-6 h-6 text-slate-400" /></div>
                        <div className="flex-1 h-0.5 bg-red-500/50 relative">
                           <motion.div className="absolute top-0 right-0 h-full w-10 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]" animate={{ x: ['-200%', '0%'] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                           <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-[8px] font-mono text-red-500 uppercase bg-black px-1 border border-red-500">ATTACK VECTOR [DDOS]</div>
                        </div>
                        <div className="w-12 h-12 rounded bg-charcoal border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center"><Lock className="w-6 h-6 text-emerald-400" /></div>
                     </motion.div>
                  </div>
               </div>

               <div className="bg-red-950/40 border-2 border-red-500/50 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden shadow-[inset_0_0_50px_rgba(239,68,68,0.2)]">
                  <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent" />
                  
                  <div className="relative z-10 flex flex-col items-center text-center gap-4">
                     <Crosshair className="w-12 h-12 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                     <div>
                       <h4 className="text-white font-black tracking-[0.2em] uppercase text-lg">Counter-Strike Protocol</h4>
                       <p className="text-red-400 text-[10px] font-mono mt-1">Lethal Defense Mode: Freezes Attacker Systems</p>
                     </div>
                     <button onClick={() => { playHaptic(); setLethalResponse(!lethalResponse); }} className={`w-full py-4 rounded-xl border-2 uppercase font-black tracking-widest transition-all mt-2 ${lethalResponse ? 'bg-red-600 text-white border-red-400 shadow-[0_0_40px_rgba(239,68,68,0.6)]' : 'bg-transparent text-red-500 border-red-500/50 hover:bg-red-500/10'}`}>
                        {lethalResponse ? 'Lethal Force Engaged' : 'Engage Protocol'}
                     </button>
                  </div>
               </div>
               
            </motion.div>
          )}

          {/* 5. VEXOX APP STUDIO */}
          {activeTab === 'studio' && (
            <motion.div key="studio" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
               
               <div className="bg-[#1e1e1e] border-l-4 border-fuchsia-500 rounded-lg shadow-2xl overflow-hidden relative group">
                  <div className="bg-black/80 px-4 py-2 border-b border-white/10 flex items-center justify-between">
                     <span className="text-[10px] font-mono text-fuchsia-400">Mobile IDE Matrix</span>
                     <div className="flex gap-1.5">
                       <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                       <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                       <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                     </div>
                  </div>
                  <div className="p-4 bg-[#1e1e1e] font-mono text-[10px] leading-relaxed overflow-x-auto text-slate-300">
<pre>
<span className="text-fuchsia-400">import</span> {'{'} 
  VexoxApp, 
  BlockchainLedger 
{'}'} <span className="text-fuchsia-400">from</span> <span className="text-green-400">'@vexox/core'</span>;

<span className="text-fuchsia-400">export default class</span> <span className="text-yellow-300">MiniApp</span> <span className="text-fuchsia-400">extends</span> <span className="text-yellow-300">VexoxApp</span> {'{'}
  <span className="text-blue-400">onDeploy</span>() {'{'}
    BlockchainLedger.validate();
    <span className="text-cyan-400">this</span>.broadcastToMesh();
  {'}'}
{'}'}
</pre>
                  </div>
               </div>

               <button className="w-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white py-5 rounded-2xl font-black tracking-[0.2em] uppercase text-sm border border-fuchsia-400/50 shadow-[0_0_30px_rgba(217,70,239,0.5)] flex items-center justify-center gap-3 active:scale-95 transition-all">
                  <Play className="w-5 h-5 fill-white" />
                  One-Click Deployment
               </button>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
