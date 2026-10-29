"use client";

import React, { useEffect } from "react";
import { useGoal } from "@/context/GoalContext";
import confetti from "canvas-confetti";
import {
  Trophy,
  Flame,
  Medal,
  Mountain,
  Zap,
  Shield,
  Target,
  Award,
  Sparkles,
  X,
  ArrowRight,
  Share2,
} from "lucide-react";

interface MedalCelebrationModalProps {
  onShare?: () => void;
}

export function MedalCelebrationModal({ onShare }: MedalCelebrationModalProps) {
  const { unlockedCelebrationModal, setUnlockedCelebrationModal } = useGoal();

  useEffect(() => {
    if (unlockedCelebrationModal) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch {
        // safe
      }
    }
  }, [unlockedCelebrationModal]);

  if (!unlockedCelebrationModal) return null;

  const medal = unlockedCelebrationModal;

  const getTierColors = (tier: string) => {
    switch (tier) {
      case "platinum":
        return {
          border: "border-slate-300",
          glow: "shadow-[0_0_40px_rgba(226,232,240,0.6)]",
          badge: "bg-slate-200 text-slate-950",
          label: "PLATINUM CONQUEST",
        };
      case "diamond":
        return {
          border: "border-cyan-400",
          glow: "shadow-[0_0_40px_rgba(6,182,212,0.6)]",
          badge: "bg-cyan-400 text-slate-950",
          label: "DIAMOND MASTER",
        };
      case "gold":
        return {
          border: "border-amber-400",
          glow: "shadow-[0_0_40px_rgba(245,158,11,0.6)]",
          badge: "bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950",
          label: "GOLDEN TROPHY",
        };
      case "silver":
        return {
          border: "border-slate-400",
          glow: "shadow-[0_0_30px_rgba(148,163,184,0.5)]",
          badge: "bg-slate-300 text-slate-950",
          label: "SILVER LAUREL",
        };
      default:
        return {
          border: "border-orange-500",
          glow: "shadow-[0_0_30px_rgba(234,88,12,0.5)]",
          badge: "bg-orange-500 text-slate-950",
          label: "BRONZE VANGUARD",
        };
    }
  };

  const colors = getTierColors(medal.tier);

  const getIcon = (type: string) => {
    switch (type) {
      case "trophy":
        return <Trophy className="w-12 h-12 text-amber-300 animate-pulse" />;
      case "flame":
        return <Flame className="w-12 h-12 text-amber-400 animate-bounce" />;
      case "mountain":
        return <Mountain className="w-12 h-12 text-indigo-300" />;
      case "zap":
        return <Zap className="w-12 h-12 text-cyan-300" />;
      case "shield":
        return <Shield className="w-12 h-12 text-slate-200" />;
      case "target":
        return <Target className="w-12 h-12 text-orange-400" />;
      default:
        return <Award className="w-12 h-12 text-yellow-300" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-md p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 ${colors.border} ${colors.glow} text-center backdrop-blur-2xl shadow-2xl overflow-hidden`}
      >
        {/* Specular sheen */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 via-transparent to-transparent" />

        {/* Close Button */}
        <button
          type="button"
          onClick={() => setUnlockedCelebrationModal(null)}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tier Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black font-mono tracking-wider uppercase mb-4 shadow-lg ${colors.badge}">
          <Sparkles className="w-3.5 h-3.5" />
          {colors.label} UNLOCKED
        </div>

        {/* 3D Liquid Glass Emblem Container */}
        <div className="flex items-center justify-center my-4">
          <div
            className={`w-28 h-28 rounded-3xl flex items-center justify-center bg-gradient-to-b from-white/10 to-transparent border ${colors.border} shadow-2xl relative`}
          >
            <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 via-transparent to-transparent rounded-t-3xl" />
            {getIcon(medal.iconType)}
          </div>
        </div>

        {/* Medal Title & Description */}
        <h2 className="text-2xl font-black text-white tracking-tight">
          {medal.title}
        </h2>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          {medal.description}
        </p>

        {/* XP Bonus */}
        <div className="mt-5 py-2.5 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono font-bold text-amber-400 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          +500 Forge XP • Inscribed in Neon DB Trophy Room
        </div>

        {/* Action Buttons: Share & Claim */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          {onShare && (
            <button
              type="button"
              onClick={() => {
                setUnlockedCelebrationModal(null);
                onShare();
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              Share on X & LinkedIn
            </button>
          )}

          <button
            type="button"
            onClick={() => setUnlockedCelebrationModal(null)}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs hover:brightness-110 shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Equip Medal
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
