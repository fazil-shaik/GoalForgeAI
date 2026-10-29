"use client";

import React, { useState } from "react";
import { useGoal } from "@/context/GoalContext";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart3,
  TrendingUp,
  Target,
  Flame,
  Trophy,
  Medal,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap,
  Shield,
  Layers,
  ArrowUpRight,
  Share2,
  PieChart,
  Activity,
  Award,
} from "lucide-react";

interface AnalyticsFeatureProps {
  onOpenShare?: (mode?: "kickoff" | "streak" | "victory") => void;
  onNavigateToBuilder?: () => void;
}

export function AnalyticsFeature({
  onOpenShare,
  onNavigateToBuilder,
}: AnalyticsFeatureProps) {
  const { user } = useAuth();
  const {
    goals,
    activeGoals,
    completedGoals,
    tasks,
    milestones,
    streak,
    medals,
    unlockedMedalsCount,
    hardGoalsCompletedCount,
  } = useGoal();

  const [timeRange, setTimeRange] = useState<"7d" | "14d" | "all">("7d");

  // Basic KPI computations
  const totalGoals = goals.length;
  const totalCompletedGoals = completedGoals.length;
  const totalActiveGoals = activeGoals.length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const totalMinutesSpent = completedTasks.reduce(
    (sum, t) => sum + (t.actualMinutes || t.estimatedMinutes || 30),
    0
  );
  const dailyCapacity = user?.preferences?.availableMinutesPerDay || 45;

  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;

  // Forge XP Score
  const forgeScore =
    totalCompletedGoals * 300 +
    hardGoalsCompletedCount * 500 +
    unlockedMedalsCount * 150 +
    currentStreak * 40;

  // 7-day and 14-day execution day aggregation
  const daysCount = timeRange === "14d" ? 14 : 7;
  const now = new Date();
  const daysData = Array.from({ length: daysCount }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (daysCount - 1 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });

    // Filter tasks completed on this date
    const tasksOnDay = completedTasks.filter((t) => {
      if (t.completedAt) {
        return t.completedAt.startsWith(dateStr);
      }
      return t.dueDate === dateStr;
    });

    const minutesOnDay = tasksOnDay.reduce(
      (sum, t) => sum + (t.actualMinutes || t.estimatedMinutes || 30),
      0
    );

    return {
      dateStr,
      dayLabel: timeRange === "14d" ? `${d.getDate()}` : dayLabel,
      fullLabel: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: tasksOnDay.length,
      minutes: minutesOnDay,
      isToday: i === daysCount - 1,
    };
  });

  const maxDailyTasks = Math.max(...daysData.map((d) => d.count), 4);
  const maxDailyMinutes = Math.max(...daysData.map((d) => d.minutes), dailyCapacity * 1.5, 60);

  // Feasibility Breakdown (Hard Goals vs Moderate vs Low)
  const hardGoalsTotal = goals.filter((g) => g.feasibilityRisk === "high_risk").length;
  const moderateGoalsTotal = goals.filter((g) => g.feasibilityRisk === "moderate_risk").length;
  const lowGoalsTotal = goals.filter((g) => g.feasibilityRisk === "low_risk").length;

  // Category Distribution
  const categoryMap: { [cat: string]: number } = {};
  goals.forEach((g) => {
    const cat = g.category.split(" ")[0] || "General";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const categoryList = Object.entries(categoryMap);

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 via-slate-900/80 to-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Telemetry & Velocity Analytics
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              User Stats & Execution Graphs
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Real-time execution telemetry: velocity tracking, focus pacing, hard goal conquests, and habit sustainability.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Time Range Filter */}
            <div className="inline-flex rounded-xl bg-slate-900/90 border border-white/10 p-1">
              {(["7d", "14d"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    timeRange === r
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {r === "7d" ? "7 Days" : "14 Days"}
                </button>
              ))}
            </div>

            {onOpenShare && (
              <button
                type="button"
                onClick={() => onOpenShare(currentStreak ? "streak" : "kickoff")}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" /> Share Report
              </button>
            )}
          </div>
        </div>

        {/* 2. Top KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mt-6 pt-6 border-t border-white/10">
          {/* KPI 1: Goals Conquered */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-amber-400 mb-1">
              <span className="text-xs font-bold font-mono">Conquered Goals</span>
              <Trophy className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-white">{totalCompletedGoals}</p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {hardGoalsCompletedCount} Hard • {totalActiveGoals} Active
            </p>
          </div>

          {/* KPI 2: Execution Rate */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-emerald-400 mb-1">
              <span className="text-xs font-bold font-mono">Execution Rate</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-white">{completionRate}%</p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {completedTasks.length} / {totalTasks} tasks done
            </p>
          </div>

          {/* KPI 3: Focus Minutes Invested */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-indigo-400 mb-1">
              <span className="text-xs font-bold font-mono">Focus Invested</span>
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-white">{totalMinutesSpent} <span className="text-xs font-normal text-slate-400">mins</span></p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {(totalMinutesSpent / 60).toFixed(1)} hours logged
            </p>
          </div>

          {/* KPI 4: Daily Streak */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-amber-400 mb-1">
              <span className="text-xs font-bold font-mono">Execution Streak</span>
              <Flame className="w-4 h-4 animate-bounce" />
            </div>
            <p className="text-2xl font-black text-white">{currentStreak} <span className="text-xs font-normal text-slate-400">days</span></p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Best record: {longestStreak} days
            </p>
          </div>

          {/* KPI 5: Forge XP Score */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-cyan-400 mb-1">
              <span className="text-xs font-bold font-mono">Forge Score</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-cyan-300">{forgeScore} <span className="text-xs font-normal text-slate-400">XP</span></p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {unlockedMedalsCount} medals claimed
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRAPH 1: Execution Velocity Curve & Daily Tasks */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Daily Task Velocity Trend
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Tasks completed per day over the selected window
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
              {completedTasks.length} Completed
            </span>
          </div>

          {/* Responsive SVG Bar & Sparkline Histogram */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="h-44 w-full flex items-end justify-between gap-2 px-2">
              {daysData.map((day, idx) => {
                const heightPercent = maxDailyTasks > 0 ? Math.max((day.count / maxDailyTasks) * 100, 6) : 6;
                return (
                  <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Hover Tooltip */}
                    <div className="pointer-events-none absolute -top-12 px-2 py-1 rounded-md bg-slate-800 text-[10px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-20 border border-white/10">
                      {day.fullLabel}: {day.count} tasks ({day.minutes}m)
                    </div>

                    {/* Bar */}
                    <div className="w-full flex items-end justify-center h-36">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 relative overflow-hidden ${
                          day.count > 0
                            ? day.isToday
                              ? "bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                              : "bg-gradient-to-t from-indigo-600/80 to-cyan-500/90 group-hover:brightness-125"
                            : "bg-slate-800/40"
                        }`}
                      >
                        <span className="absolute inset-x-0 top-0 h-1/2 bg-white/20" />
                      </div>
                    </div>

                    {/* Day Label */}
                    <span
                      className={`text-[10px] font-mono ${
                        day.isToday ? "text-cyan-400 font-bold" : "text-slate-400"
                      }`}
                    >
                      {day.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-cyan-400" /> Today's Execution
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-indigo-600" /> Historical Sprints
            </span>
            <span className="text-slate-500">Max: {maxDailyTasks} tasks/day</span>
          </div>
        </div>

        {/* GRAPH 2: Daily Focus Minutes vs Paced Capacity */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Focus Pacing vs Daily Capacity
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Target Capacity: {dailyCapacity} mins/day
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              {dailyCapacity}m Target
            </span>
          </div>

          {/* Capacity Pacing Histogram */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="h-44 w-full flex items-end justify-between gap-2 px-2 relative">
              {/* Target Capacity Line */}
              <div
                style={{
                  bottom: `${Math.min((dailyCapacity / maxDailyMinutes) * 100, 90)}%`,
                }}
                className="absolute inset-x-2 border-b border-dashed border-emerald-400/50 pointer-events-none z-10 flex items-center justify-end"
              >
                <span className="text-[9px] font-mono text-emerald-400 bg-slate-900/90 px-1 rounded -mb-2">
                  Target: {dailyCapacity}m
                </span>
              </div>

              {daysData.map((day) => {
                const heightPercent = maxDailyMinutes > 0 ? Math.max((day.minutes / maxDailyMinutes) * 100, 6) : 6;
                const isOptimal = day.minutes >= dailyCapacity;
                return (
                  <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip */}
                    <div className="pointer-events-none absolute -top-12 px-2 py-1 rounded-md bg-slate-800 text-[10px] font-mono text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-20 border border-white/10">
                      {day.fullLabel}: {day.minutes} mins {isOptimal ? "⚡ (Met Target)" : ""}
                    </div>

                    {/* Bar */}
                    <div className="w-full flex items-end justify-center h-36">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 relative overflow-hidden ${
                          day.minutes > 0
                            ? isOptimal
                              ? "bg-gradient-to-t from-emerald-600 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                              : "bg-gradient-to-t from-amber-600/80 to-amber-400/90"
                            : "bg-slate-800/40"
                        }`}
                      >
                        <span className="absolute inset-x-0 top-0 h-1/2 bg-white/20" />
                      </div>
                    </div>

                    {/* Day Label */}
                    <span
                      className={`text-[10px] font-mono ${
                        day.isToday ? "text-emerald-400 font-bold" : "text-slate-400"
                      }`}
                    >
                      {day.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-400" /> Target Met (≥{dailyCapacity}m)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" /> Partial Sprint
            </span>
            <span className="text-slate-500">Peak: {maxDailyMinutes}m</span>
          </div>
        </div>
      </div>

      {/* 4. Secondary Distributions: Feasibility Risk & Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Distribution Card */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              Goal Feasibility Breakdown
            </h3>
            <span className="text-xs font-mono text-slate-400">{totalGoals} Goals</span>
          </div>

          <div className="space-y-3 pt-2">
            {/* High Risk (Titan Hard Goals) */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-amber-300 flex items-center gap-1.5 font-bold">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" /> Titan Hard Goals (High Risk)
                </span>
                <span className="text-slate-300 font-bold">{hardGoalsTotal}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${totalGoals > 0 ? (hardGoalsTotal / totalGoals) * 100 : 0}%` }}
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                />
              </div>
            </div>

            {/* Moderate Risk */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-indigo-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" /> Moderate Risk Goals
                </span>
                <span className="text-slate-300 font-bold">{moderateGoalsTotal}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${totalGoals > 0 ? (moderateGoalsTotal / totalGoals) * 100 : 0}%` }}
                  className="h-full bg-indigo-500 rounded-full"
                />
              </div>
            </div>

            {/* Low Risk */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-emerald-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" /> Low Risk Habitual Goals
                </span>
                <span className="text-slate-300 font-bold">{lowGoalsTotal}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${totalGoals > 0 ? (lowGoalsTotal / totalGoals) * 100 : 0}%` }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-300 flex items-center gap-2">
            <Trophy className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{hardGoalsCompletedCount} Hard Goals conquered into the Trophy Room!</span>
          </div>
        </div>

        {/* Category Domain Distribution */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Category Portfolio Matrix
            </h3>
            <span className="text-xs font-mono text-slate-400">{categoryList.length} Domains</span>
          </div>

          <div className="space-y-2.5 pt-2">
            {categoryList.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-4 text-center">No categories recorded.</p>
            ) : (
              categoryList.map(([cat, count]) => {
                const percent = Math.round((count / totalGoals) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300">{cat}</span>
                      <span className="text-cyan-400 font-bold">{count} ({percent}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <p className="text-[11px] text-slate-500 font-mono pt-1">
            Synthesized dynamically by Gemini AI roadmap decomposition.
          </p>
        </div>

        {/* Trophy & Medals Rarity Card */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400" />
              Medals Rarity Vault
            </h3>
            <span className="text-xs font-mono text-yellow-400 font-bold">
              {unlockedMedalsCount} / 6 Unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {[
              { tier: "Platinum", count: medals.filter((m) => m.tier === "platinum" && m.isUnlocked).length, color: "text-slate-200 border-slate-400/30 bg-slate-800/40" },
              { tier: "Diamond", count: medals.filter((m) => m.tier === "diamond" && m.isUnlocked).length, color: "text-cyan-300 border-cyan-400/30 bg-cyan-950/30" },
              { tier: "Gold", count: medals.filter((m) => m.tier === "gold" && m.isUnlocked).length, color: "text-amber-300 border-amber-400/30 bg-amber-950/30" },
              { tier: "Silver", count: medals.filter((m) => m.tier === "silver" && m.isUnlocked).length, color: "text-slate-300 border-slate-500/30 bg-slate-900/40" },
            ].map((t) => (
              <div key={t.tier} className={`p-3 rounded-2xl border text-center ${t.color}`}>
                <p className="text-lg font-black font-mono">{t.count}</p>
                <p className="text-[10px] font-mono uppercase tracking-wider">{t.tier}</p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-mono text-indigo-300 flex items-center justify-between">
            <span>Hall of Fame Badges:</span>
            <span className="font-bold text-white">{unlockedMedalsCount} Active</span>
          </div>
        </div>
      </div>

      {/* 5. Hall of Conquered Goals & History */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Conquered Goals & Completed Summits
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Retired from active execution rotation and preserved in your personal achievement vault
            </p>
          </div>

          {onNavigateToBuilder && (
            <button
              type="button"
              onClick={onNavigateToBuilder}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Target className="w-3.5 h-3.5" /> Create New Goal
            </button>
          )}
        </div>

        {completedGoals.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950/40 border border-white/5 text-center space-y-2">
            <p className="text-sm font-bold text-slate-300">No Goals Conquered Yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              As soon as you conquer all milestone tasks and complete an active goal, it will automatically retire here so your active roadmap stays focused.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
            {completedGoals.map((g) => (
              <div
                key={g.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> CONQUERED
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {g.category.split(" ")[0]}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white pt-1">{g.title}</h4>
                  <p className="text-xs text-slate-300 line-clamp-2">{g.outcome}</p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Target: {g.deadline}</span>
                  {onOpenShare && (
                    <button
                      type="button"
                      onClick={() => onOpenShare("victory")}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <Share2 className="w-3 h-3" /> Share
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
