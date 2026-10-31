"use client";

import React, { useState, useEffect } from "react";
import { useGoal } from "@/context/GoalContext";
import { useAuth } from "@/context/AuthContext";
import { LeaderboardUserEntry } from "@/types/goal";
import {
  Trophy,
  Flame,
  Award,
  Zap,
  Target,
  Shield,
  Crown,
  Medal,
  Mountain,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Users,
  Star,
  Check,
  Lock,
  Globe,
  Share2,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";

interface LeaderboardFeatureProps {
  onOpenProfile?: () => void;
  onOpenShare?: (mode?: "kickoff" | "streak" | "victory") => void;
}

export function LeaderboardFeature({
  onOpenProfile,
  onOpenShare,
}: LeaderboardFeatureProps = {}) {
  const { user } = useAuth();
  const {
    streak,
    medals,
    unlockedMedalsCount,
    hardGoalsCompletedCount,
    activeGoal,
    completeGoal,
    refreshStreak,
    refreshMedals,
    setUnlockedCelebrationModal,
  } = useGoal();

  const [activeTab, setActiveTab] = useState<"leaderboard" | "medals" | "streak">("leaderboard");
  const [sortBy, setSortBy] = useState<"goals" | "hard_goals" | "streak" | "medals">("goals");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUserEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [isCompletingGoal, setIsCompletingGoal] = useState(false);

  // Fetch live dynamic leaderboard from Neon DB
  const fetchLeaderboard = async (sort: string) => {
    try {
      setIsLoadingLeaderboard(true);
      const res = await fetch(`/api/leaderboard?sortBy=${sort}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboardData(data.leaderboard || []);
      }
    } catch {
      // safe fallback
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(sortBy);
  }, [sortBy]);

  // Streak details
  const currentStreak = streak?.currentStreak ?? 0;
  const longestStreak = streak?.longestStreak ?? 0;
  const isActiveToday = streak?.isActiveToday ?? false;
  const isStreakAtRisk = streak?.isStreakAtRisk ?? false;
  const activeDaysThisWeek = streak?.activeDaysThisWeek ?? [];

  // 7 days of the week labels
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const now = new Date();
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split("T")[0];
    const isToday = i === 6;
    const isCompleted = activeDaysThisWeek.includes(dStr);
    const dayLabel = daysOfWeek[(d.getDay() + 6) % 7];
    return { dateStr: dStr, dayLabel, isToday, isCompleted };
  });

  const handleCompleteActiveGoal = async () => {
    if (!activeGoal || activeGoal.status === "completed") return;
    setIsCompletingGoal(true);
    try {
      const res = await completeGoal(activeGoal.id);
      await fetchLeaderboard(sortBy);
      await refreshStreak();
      await refreshMedals();
    } catch {
      // safe fallback
    } finally {
      setIsCompletingGoal(false);
    }
  };

  // Medal Tier Style Config
  const getTierStyle = (tier: string) => {
    switch (tier) {
      case "platinum":
        return {
          badge: "bg-slate-200/20 text-slate-100 border-slate-300/40",
          glow: "shadow-[0_0_24px_rgba(226,232,240,0.35)]",
          border: "border-slate-300/50",
          iconColor: "text-slate-100",
          label: "PLATINUM",
        };
      case "diamond":
        return {
          badge: "bg-cyan-500/20 text-cyan-200 border-cyan-400/40",
          glow: "shadow-[0_0_24px_rgba(6,182,212,0.4)]",
          border: "border-cyan-400/50",
          iconColor: "text-cyan-300",
          label: "DIAMOND",
        };
      case "gold":
        return {
          badge: "bg-amber-500/20 text-amber-200 border-amber-400/40",
          glow: "shadow-[0_0_24px_rgba(245,158,11,0.4)]",
          border: "border-amber-400/50",
          iconColor: "text-amber-300",
          label: "GOLD",
        };
      case "silver":
        return {
          badge: "bg-slate-400/20 text-slate-300 border-slate-400/40",
          glow: "shadow-[0_0_20px_rgba(148,163,184,0.3)]",
          border: "border-slate-400/50",
          iconColor: "text-slate-300",
          label: "SILVER",
        };
      default:
        return {
          badge: "bg-orange-600/20 text-orange-200 border-orange-500/40",
          glow: "shadow-[0_0_20px_rgba(234,88,12,0.3)]",
          border: "border-orange-500/50",
          iconColor: "text-orange-300",
          label: "BRONZE",
        };
    }
  };

  const getMedalIcon = (iconType: string, className = "w-6 h-6") => {
    switch (iconType) {
      case "trophy":
        return <Trophy className={className} />;
      case "flame":
        return <Flame className={className} />;
      case "mountain":
        return <Mountain className={className} />;
      case "zap":
        return <Zap className={className} />;
      case "shield":
        return <Shield className={className} />;
      case "target":
        return <Target className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  // Top 3 Podium
  const top1 = leaderboardData[0] || null;
  const top2 = leaderboardData[1] || null;
  const top3 = leaderboardData[2] || null;

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Hero Arena Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-slate-950/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-wider uppercase">
              <Trophy className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              GoalForge Arena • Live Global Standings
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Championship & Medals
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Honor your discipline with daily execution streaks, claim prestigious liquid glass medals for conquering Hard Goals, and climb the global leaderboards.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Streak Stat */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-center backdrop-blur-md">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
                <Flame className="w-4 h-4 animate-bounce" />
                <span className="text-xs font-bold font-mono">Streak</span>
              </div>
              <p className="text-xl font-black text-white">{currentStreak} <span className="text-xs font-normal text-slate-400">days</span></p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Best: {longestStreak}d</p>
            </div>

            {/* Hard Goals Stat */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-center backdrop-blur-md">
              <div className="flex items-center justify-center gap-1.5 text-indigo-400 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-xs font-bold font-mono">Hard Goals</span>
              </div>
              <p className="text-xl font-black text-white">{hardGoalsCompletedCount}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Mastered</p>
            </div>

            {/* Medals Stat */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-center backdrop-blur-md">
              <div className="flex items-center justify-center gap-1.5 text-yellow-400 mb-1">
                <Medal className="w-4 h-4" />
                <span className="text-xs font-bold font-mono">Medals</span>
              </div>
              <p className="text-xl font-black text-white">{unlockedMedalsCount} <span className="text-xs font-normal text-slate-400">/ 6</span></p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Trophies</p>
            </div>

            {/* Active Rank */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-center backdrop-blur-md">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
                <Crown className="w-4 h-4" />
                <span className="text-xs font-bold font-mono">Rank</span>
              </div>
              <p className="text-xl font-black text-white">
                #{leaderboardData.find((x) => x.isCurrentUser)?.rank || 1}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Global standing</p>
            </div>
          </div>
        </div>

        {/* Feature Navigation Tabs inside Arena */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-white/10 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("leaderboard")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "leaderboard"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-white/5"
            }`}
          >
            <Crown className="w-4 h-4" />
            Global Goal Leaderboard
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("medals")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "medals"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-white/5"
            }`}
          >
            <Medal className="w-4 h-4" />
            Hard Goal Medals ({unlockedMedalsCount}/6)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("streak")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "streak"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-white/5"
            }`}
          >
            <Flame className="w-4 h-4" />
            Daily Streak & Velocity
          </button>

          {/* Action buttons: Share, Privacy & Goal Completion */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {onOpenShare && (
              <button
                type="button"
                onClick={() => onOpenShare(activeTab === "streak" ? "streak" : "kickoff")}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                title="Share your milestone, medals, or streak to X and LinkedIn"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Share on Socials</span>
              </button>
            )}

            {onOpenProfile && (
              <button
                type="button"
                onClick={onOpenProfile}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  user?.isPublic !== false
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                    : "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                }`}
                title="Click to toggle Public vs Private profile visibility on leaderboard"
              >
                {user?.isPublic !== false ? (
                  <>
                    <Globe className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Public Profile</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Private (Masked)</span>
                  </>
                )}
              </button>
            )}

            {/* Complete Goal Trigger Button */}
            {activeGoal && activeGoal.status !== "completed" && (
              <button
                type="button"
                disabled={isCompletingGoal}
                onClick={handleCompleteActiveGoal}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isCompletingGoal ? "Finalizing..." : "Complete Goal"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. TAB: GLOBAL GOAL LEADERBOARD */}
      {activeTab === "leaderboard" && (
        <div className="space-y-6">
          {/* Sorting / Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 font-mono">Rank By:</span>
              <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setSortBy("goals")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    sortBy === "goals"
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Most Goals Completed
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("hard_goals")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    sortBy === "hard_goals"
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Hard Goals
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("streak")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    sortBy === "streak"
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Streak Masters
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("medals")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    sortBy === "medals"
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Medals
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live DB Aggregation • {leaderboardData.length} Contenders
            </div>
          </div>

          {/* Podium for Top 3 */}
          {leaderboardData.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* #2 Silver Vice-Champion */}
              {top2 && (
                <div className="relative p-6 rounded-3xl bg-gradient-to-b from-slate-800/60 to-slate-900/80 border border-slate-400/40 backdrop-blur-xl flex flex-col items-center text-center shadow-xl order-2 md:order-1 mt-4">
                  <div className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-slate-300 text-slate-950 text-xs font-black font-mono shadow-md">
                    #2 SILVER LAUREL
                  </div>
                  <div className="my-2 border-2 border-slate-300 rounded-2xl shadow-lg p-0.5">
                    <UserAvatar
                      src={top2.image}
                      name={top2.name}
                      size="xl"
                      className="w-14 h-14 rounded-xl"
                    />
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{top2.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mb-3">{top2.category}</p>

                  <div className="grid grid-cols-3 gap-2 w-full pt-3 border-t border-white/10 text-center">
                    <div>
                      <p className="text-lg font-black text-slate-200">{top2.totalGoalsCompleted}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-mono">Goals</p>
                    </div>
                    <div>
                      <p className="text-lg font-black text-amber-400">{top2.hardGoalsCompleted}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-mono">Hard</p>
                    </div>
                    <div>
                      <p className="text-lg font-black text-yellow-300">{top2.medalsCount}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-mono">Medals</p>
                    </div>
                  </div>
                </div>
              )}

              {/* #1 Champion Gold Crown */}
              {top1 && (
                <div className="relative p-7 rounded-3xl bg-gradient-to-b from-amber-500/20 via-slate-900/90 to-slate-950/95 border-2 border-amber-400/60 backdrop-blur-xl flex flex-col items-center text-center shadow-[0_0_35px_rgba(245,158,11,0.3)] order-1 md:order-2 scale-105 z-10">
                  <div className="absolute -top-4 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-xs font-black font-mono shadow-lg flex items-center gap-1.5 animate-pulse">
                    <Crown className="w-3.5 h-3.5" />
                    #1 APEX CHAMPION
                  </div>
                  <div className="my-2 border-2 border-amber-400 rounded-2xl shadow-xl p-0.5">
                    <UserAvatar
                      src={top1.image}
                      name={top1.name}
                      size="xl"
                      className="w-16 h-16 rounded-xl"
                    />
                  </div>
                  <h3 className="text-lg font-black text-amber-200 mt-1">{top1.name}</h3>
                  <p className="text-xs text-amber-400/80 font-mono mb-3">{top1.category}</p>

                  <div className="grid grid-cols-3 gap-2 w-full pt-3 border-t border-amber-500/20 text-center">
                    <div>
                      <p className="text-xl font-black text-white">{top1.totalGoalsCompleted}</p>
                      <p className="text-[10px] text-amber-300 uppercase font-mono">Goals</p>
                    </div>
                    <div>
                      <p className="text-xl font-black text-amber-400">{top1.hardGoalsCompleted}</p>
                      <p className="text-[10px] text-amber-300 uppercase font-mono">Hard</p>
                    </div>
                    <div>
                      <p className="text-xl font-black text-yellow-300">{top1.medalsCount}</p>
                      <p className="text-[10px] text-amber-300 uppercase font-mono">Medals</p>
                    </div>
                  </div>
                </div>
              )}

              {/* #3 Bronze Medallion */}
              {top3 && (
                <div className="relative p-6 rounded-3xl bg-gradient-to-b from-slate-800/60 to-slate-900/80 border border-amber-700/40 backdrop-blur-xl flex flex-col items-center text-center shadow-xl order-3 md:order-3 mt-4">
                  <div className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-amber-700 text-amber-100 text-xs font-black font-mono shadow-md">
                    #3 BRONZE VANGUARD
                  </div>
                  <div className="my-2 border-2 border-amber-700 rounded-2xl shadow-lg p-0.5">
                    <UserAvatar
                      src={top3.image}
                      name={top3.name}
                      size="xl"
                      className="w-14 h-14 rounded-xl"
                    />
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{top3.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mb-3">{top3.category}</p>

                  <div className="grid grid-cols-3 gap-2 w-full pt-3 border-t border-white/10 text-center">
                    <div>
                      <p className="text-lg font-black text-slate-200">{top3.totalGoalsCompleted}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-mono">Goals</p>
                    </div>
                    <div>
                      <p className="text-lg font-black text-amber-500">{top3.hardGoalsCompleted}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-mono">Hard</p>
                    </div>
                    <div>
                      <p className="text-lg font-black text-yellow-400">{top3.medalsCount}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-mono">Medals</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Standings Table */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-950/60 text-xs font-mono uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4 text-center w-16">Rank</th>
                    <th className="py-3.5 px-4">Contender</th>
                    <th className="py-3.5 px-4 text-center">Goals Completed</th>
                    <th className="py-3.5 px-4 text-center">Hard Goals</th>
                    <th className="py-3.5 px-4 text-center">Daily Streak</th>
                    <th className="py-3.5 px-4 text-center">Medals</th>
                    <th className="py-3.5 px-4 text-right">Forge Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leaderboardData.map((entry) => {
                    const isUser = entry.isCurrentUser;
                    return (
                      <tr
                        key={entry.userId}
                        className={`transition-colors ${
                          isUser
                            ? "bg-emerald-500/10 border-l-4 border-l-emerald-500"
                            : "hover:bg-white/5"
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-4 px-4 text-center font-black">
                          {entry.rank === 1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-slate-950 text-xs font-mono font-black shadow-lg shadow-amber-400/40">
                              1
                            </span>
                          ) : entry.rank === 2 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-950 text-xs font-mono font-black">
                              2
                            </span>
                          ) : entry.rank === 3 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-amber-100 text-xs font-mono font-black">
                              3
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">#{entry.rank}</span>
                          )}
                        </td>

                        {/* Contender Name & Avatar */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              src={entry.image}
                              name={entry.name}
                              size="lg"
                            />
                            <div>
                              <p className="font-bold text-white flex items-center gap-2">
                                {entry.name}
                                {entry.isMasked && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                    <Lock className="w-2.5 h-2.5 text-amber-400" /> Masked
                                  </span>
                                )}
                                {isUser && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black font-mono">
                                    YOU {user?.isPublic === false ? "• PRIVATE" : ""}
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-slate-400 font-mono">
                                {entry.category}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Goals Completed */}
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                            {entry.totalGoalsCompleted}
                          </span>
                        </td>

                        {/* Hard Goals */}
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 font-mono font-bold text-xs">
                            <Target className="w-3 h-3 text-indigo-400" />
                            {entry.hardGoalsCompleted}
                          </span>
                        </td>

                        {/* Daily Streak */}
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-200">
                            <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                            {entry.currentStreak}d
                          </span>
                        </td>

                        {/* Medals */}
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-yellow-400">
                            <Medal className="w-3.5 h-3.5" />
                            {entry.medalsCount}
                          </span>
                        </td>

                        {/* Forge XP Score */}
                        <td className="py-4 px-4 text-right font-black font-mono text-emerald-400">
                          {entry.forgeScore.toLocaleString()} XP
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: HARD GOAL MEDALS (TROPHY ROOM) */}
      {activeTab === "medals" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Medal className="w-5 h-5 text-amber-400" />
                Hard Goal Trophies & Milestones
              </h3>
              <p className="text-xs text-slate-400">
                Exclusive achievements awarded when you conquer High-Risk goals, apex roadmaps, and slippage resurgences.
              </p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {unlockedMedalsCount} of {medals.length} Medals Unlocked
            </div>
          </div>

          {/* Medals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medals.map((medal) => {
              const tier = getTierStyle(medal.tier);
              const isUnlocked = medal.isUnlocked;

              return (
                <div
                  key={medal.key}
                  className={`relative p-6 rounded-3xl border transition-all duration-300 overflow-hidden ${
                    isUnlocked
                      ? `bg-slate-900/80 ${tier.border} ${tier.glow} backdrop-blur-xl hover:scale-[1.02]`
                      : "bg-slate-950/60 border-white/5 opacity-60 hover:opacity-80"
                  }`}
                >
                  {/* Specular sheen */}
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 via-transparent to-transparent" />

                  {/* Top Tier Badge & Lock Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono uppercase tracking-wider border ${tier.badge}`}
                    >
                      {tier.label} TIER
                    </span>
                    {isUnlocked ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold">
                        <Check className="w-3.5 h-3.5" />
                        UNLOCKED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                        <Lock className="w-3 h-3" />
                        LOCKED
                      </span>
                    )}
                  </div>

                  {/* Medal Icon & Title */}
                  <div className="flex items-start gap-4 mb-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                        isUnlocked
                          ? `${tier.border} bg-slate-800 ${tier.iconColor}`
                          : "border-white/10 bg-slate-900 text-slate-600"
                      }`}
                    >
                      {getMedalIcon(medal.iconType, "w-6 h-6")}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white leading-snug">
                        {medal.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {medal.description}
                      </p>
                    </div>
                  </div>

                  {/* Unlock timestamp or progress rule */}
                  <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    {isUnlocked ? (
                      <>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Mastered
                        </span>
                        <span>{new Date(medal.unlockedAt || Date.now()).toLocaleDateString()}</span>
                      </>
                    ) : (
                      <span className="text-slate-500">
                        {medal.category === "hard_goal"
                          ? "Complete any High-Risk Goal"
                          : medal.category === "recovery"
                          ? "Recover an overdue goal"
                          : medal.category === "streak"
                          ? "Maintain 7-Day execution streak"
                          : "Clear milestone roadmaps"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TAB: DAILY STREAK & VELOCITY */}
      {activeTab === "streak" && (
        <div className="space-y-6">
          {/* Main Streak Card */}
          <div className="relative p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-slate-900/80 to-slate-950/90 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold uppercase">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Active Momentum Counter
                </div>
                <h2 className="text-3xl font-black text-white flex items-center gap-2">
                  {currentStreak} Days Consecutive Execution
                </h2>
                <p className="text-sm text-slate-300">
                  {isActiveToday
                    ? "🔥 You've crushed a task today! Your streak is secured until tomorrow."
                    : isStreakAtRisk
                    ? "⚠️ Complete 1 focus task today before midnight to prevent your streak from resetting."
                    : "Complete any task today to ignite your streak loop."}
                </p>
              </div>

              {/* Flame Graphic */}
              <div className="flex items-center justify-center w-24 h-24 rounded-3xl bg-amber-500/10 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.3)] shrink-0">
                <Flame className="w-12 h-12 text-amber-400 animate-bounce" />
              </div>
            </div>

            {/* 7-Day Visual Calendar */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <h4 className="text-xs font-bold text-slate-400 uppercase font-mono mb-4">
                This Week's Velocity Checkpoints
              </h4>
              <div className="grid grid-cols-7 gap-2 sm:gap-3">
                {weekDays.map((day) => (
                  <div
                    key={day.dateStr}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      day.isCompleted
                        ? "bg-amber-500/20 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                        : day.isToday
                        ? "bg-slate-800/80 border-indigo-500/50 animate-pulse"
                        : "bg-slate-900/40 border-white/5 opacity-60"
                    }`}
                  >
                    <p className="text-[10px] font-mono text-slate-400 uppercase mb-1">
                      {day.dayLabel}
                    </p>
                    <div className="flex items-center justify-center my-1">
                      {day.isCompleted ? (
                        <Flame className="w-5 h-5 text-amber-400" />
                      ) : day.isToday ? (
                        <span className="w-3 h-3 rounded-full bg-indigo-400 animate-ping" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-700" />
                      )}
                    </div>
                    <p className="text-[10px] font-mono font-bold mt-1 text-slate-300">
                      {day.isToday ? "Today" : day.dateStr.slice(5)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gamification Guidance Note */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Behavioral Momentum Psychology
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              GoalForge implements consecutive habit loops based on Self-Determination Theory. Completing at least 1 prioritized task every 24 hours maintains neural momentum, preventing cognitive hesitation and significantly improving long-term goal completion probability.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
