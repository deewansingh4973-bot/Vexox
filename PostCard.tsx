import React, { useState, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Bookmark,
  Sparkles,
  Brain,
  Code,
  X,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Post } from "./types";
import { playHaptic } from "./lib/haptics";
import CommentSheet from "./components/CommentSheet";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./lib/firebase";
import { GoogleGenAI } from "@google/genai";

const apiKey =
  (import.meta as any).env.VITE_GEMINI_API_KEY ||
  (typeof process !== "undefined" && process.env
    ? process.env.GEMINI_API_KEY
    : "");
const ai = new GoogleGenAI({ apiKey: apiKey || "dummy-key-to-prevent-crash" });

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAIExplanation, setShowAIExplanation] = useState(false);
  const [explanationText, setExplanationText] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);
  const lastTap = useRef(0);

  const semanticTags = [
    "Astrophysics",
    "Quantum Computing",
    "Thermodynamics",
    "Biophysics",
  ];
  const postTag =
    semanticTags[post.authorName.length % semanticTags.length] ||
    semanticTags[0];

  const fallbackImages = [
    "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800",
  ];
  const twentyImages = Array.from(
    { length: 20 },
    (_, i) => fallbackImages[i % fallbackImages.length],
  );

  const carouselImages = post.imageUrl
    ? [post.imageUrl, ...twentyImages.slice(1)]
    : twentyImages;

  const handleLikeToggle = async () => {
    playHaptic();
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);

    try {
      const postRef = doc(db, "posts", post.id);
      await updateDoc(postRef, {
        likesCount: increment(newIsLiked ? 1 : -1),
      });
    } catch (error) {
      setIsLiked(!newIsLiked); // Revert on failure
      handleFirestoreError(error, OperationType.UPDATE, "posts");
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      if (!isLiked) {
        handleLikeToggle();
      }
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 1000);
    } else {
      lastTap.current = now;
    }
  };

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipeThreshold = 50;
    if (offset.x < -swipeThreshold && currentIdx < carouselImages.length - 1) {
      playHaptic();
      setCurrentIdx(currentIdx + 1);
    } else if (offset.x > swipeThreshold && currentIdx > 0) {
      playHaptic();
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleExplain = async (e: React.MouseEvent) => {
    e.stopPropagation();
    playHaptic();
    setShowAIExplanation(true);

    if (explanationText || isExplaining || !post.content) {
      if (!post.content && !explanationText) {
        setExplanationText("This post has no text content to explain.");
      }
      return;
    }

    setIsExplaining(true);
    try {
      const promptText = `Explain this context or content in simple terms. Limit your response to 2 short sentences. \nContent: ${post.content}`;

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: promptText }] }],
      });

      let accumulatedResponse = "";
      for await (const chunk of responseStream) {
        accumulatedResponse += chunk.text;
        setExplanationText(accumulatedResponse);
      }
    } catch (error) {
      console.error("AI Explanation Error:", error);
      setExplanationText(
        "Failed to load explanation. Please check your API key or network connection.",
      );
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a0b2e]/10 backdrop-blur-xl rounded-[32px] shadow-[0_8px_40px_rgba(147,51,234,0.15)] border border-white/10 mb-8 pb-4 overflow-hidden relative"
    >
      {/* Semantic Concept Tag Overlay */}
      <div className="absolute top-5 left-5 z-20 pointer-events-none">
        <div className="px-3 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-1.5 shadow-lg">
          <Brain className="w-4 h-4 text-amethyst-400" />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">
            {postTag}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="px-5 py-4 pt-16 flex items-center justify-between">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-full bg-amethyst-800 border-[1.5px] border-amethyst-500 flex items-center justify-center text-white font-bold overflow-hidden">
            {post.authorPhoto ? (
              <img
                src={post.authorPhoto}
                alt={post.authorName}
                className="w-full h-full object-cover"
              />
            ) : (
              post.authorName.charAt(0)
            )}
          </div>
          <div className="leading-tight">
            <h3 className="text-sm font-bold text-white tracking-wide">
              {post.authorName}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              {typeof post.createdAt?.toDate === "function"
                ? post.createdAt
                    .toDate()
                    .toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                : "Just now"}
            </p>
          </div>
        </div>
        <button className="text-slate-400 p-2 hover:text-white transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content Area (Full Width Carousel) */}
      <div
        onClick={handleDoubleTap}
        className="relative w-full select-none overflow-hidden touch-pan-y px-3"
      >
        {carouselImages.length > 0 ? (
          <motion.div
            className="flex w-full"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            animate={{ x: `-${currentIdx * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {carouselImages.map((img, i) => (
              <div
                key={`carousel-image-${i}`}
                className="min-w-full relative flex items-center justify-center pr-1 h-[450px]"
              >
                {!imageLoaded && i === 0 && (
                  <div className="absolute inset-0 bg-white/5 animate-pulse min-h-[400px] rounded-[24px]">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>
                )}
                <img
                  src={img}
                  alt="Post content"
                  className={`w-full h-full object-cover rounded-[28px] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] transition-opacity duration-500 pointer-events-none ${imageLoaded || i > 0 ? "opacity-100" : "opacity-0"}`}
                  loading="lazy"
                  onLoad={() => i === 0 && setImageLoaded(true)}
                />
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="px-4 py-8 pointer-events-none">
            <p className="text-xl text-white font-medium text-center opacity-80">
              {post.content}
            </p>
          </div>
        )}

        {/* AI Auto-Solve Explain Overlay Icon */}
        <div className="absolute bottom-5 right-5 z-20 pointer-events-auto">
          <button
            onClick={handleExplain}
            className="px-3 py-2 bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center gap-2 shadow-[0_5px_20px_rgba(0,0,0,0.5)] hover:bg-black/80 transition-colors active:scale-95"
            title="AI Explain"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-widest">
              AI Explain
            </span>
          </button>
        </div>

        {/* Carousel Badges & Indicators */}
        {carouselImages.length > 1 && (
          <>
            <div className="absolute top-4 right-7 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white z-10 pointer-events-none">
              {currentIdx + 1}/{carouselImages.length}
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-[3px] z-10 pointer-events-none">
              {carouselImages.map((_, i) => (
                <div
                  key={`carousel-indicator-${i}`}
                  className={`h-[5px] rounded-full transition-all duration-300 ${i === currentIdx ? "bg-amethyst-400 w-3" : "bg-white/60 w-[5px]"}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Heart Animation Overlay */}
        <AnimatePresence>
          {showHeartAnim && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <Heart className="w-28 h-28 fill-white text-white drop-shadow-[0_0_40px_rgba(0,0,0,0.5)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Bar */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex gap-4 items-center">
          <button
            onClick={handleLikeToggle}
            className="text-slate-200 hover:text-red-500 transition-colors group active:scale-90"
          >
            <Heart
              className={`w-[26px] h-[26px] transition-colors ${isLiked ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>
          <button
            onClick={() => {
              playHaptic();
              setShowComments(true);
            }}
            className="text-slate-200 hover:text-amethyst-300 transition-colors active:scale-90"
          >
            <MessageCircle className="w-[26px] h-[26px]" />
          </button>
          <button
            onClick={() => {
              playHaptic();
              alert("Share menu opening...");
            }}
            className="text-slate-200 hover:text-blue-400 transition-colors active:scale-90"
          >
            <Share2 className="w-[26px] h-[26px]" />
          </button>
        </div>

        <div className="flex gap-4 items-center">
          <button
            onClick={() => {
              playHaptic();
              alert(`Tipped 10 V-Coins to ${post.authorName}!`);
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-amethyst-500/20 text-amethyst-300 rounded-full border border-amethyst-500/30 hover:bg-amethyst-500/40 transition-colors active:scale-95"
          >
            <span className="text-sm leading-none">💎</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Tip
            </span>
          </button>
          <button
            onClick={() => {
              playHaptic();
              setIsSaved(!isSaved);
            }}
            className="text-slate-200 hover:text-white transition-colors active:scale-90"
          >
            <Bookmark
              className={`w-[26px] h-[26px] ${isSaved ? "fill-white text-white" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Footer / Captions */}
      <div className="px-4 flex flex-col gap-1.5">
        <p className="text-[13px] font-bold text-white">
          {post.likesCount} likes
        </p>

        {post.content && (
          <p className="text-[13px] text-slate-100 font-sans leading-relaxed">
            <span className="font-bold text-white mr-2">{post.authorName}</span>
            {post.content}
          </p>
        )}

        <div className="flex items-center justify-between mt-1">
          <button
            onClick={() => {
              playHaptic();
              setShowComments(true);
            }}
            className="text-[13px] text-slate-400 font-medium text-left hover:text-slate-300 transition-colors"
          >
            View all {post.commentsCount} comments
          </button>
        </div>
      </div>

      <CommentSheet
        postId={post.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />

      {/* AI Auto-Solve Glassmorphism Bottom Sheet */}
      <AnimatePresence>
        {showAIExplanation && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAIExplanation(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/90 backdrop-blur-2xl border-t border-white/10 rounded-t-[32px] p-6 pb-safe z-50 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] max-h-[80vh] overflow-y-auto no-scrollbar"
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                    <Brain className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg font-display">
                      AI Auto-Solve
                    </h3>
                    <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase">
                      Analysis Complete
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIExplanation(false)}
                  className="p-2 bg-white/5 rounded-full hover:bg-white/10"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                {isExplaining ? (
                  <div className="flex items-center justify-center gap-3 p-6 bg-white/5 border border-white/10 rounded-2xl">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                    <span className="text-sm font-mono tracking-widest text-cyan-400 animate-pulse uppercase">
                      Analyzing Context...
                    </span>
                  </div>
                ) : (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-fuchsia-400" /> AI
                      Summary
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed font-sans">
                      {explanationText}
                    </p>
                  </div>
                )}
                <button
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("NAVIGATE", { detail: "shiksha" }),
                    )
                  }
                  className="w-full py-4 mt-2 bg-cyan-500/20 border border-cyan-500/50 rounded-2xl text-cyan-300 font-bold tracking-widest uppercase text-xs hover:bg-cyan-500/30 transition-colors"
                >
                  Ask Follow-up in Shiksha
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
