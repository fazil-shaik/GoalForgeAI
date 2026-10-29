"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import { useGoal } from "@/context/GoalContext";
import {
  Target,
  Sparkles,
  RotateCcw,
  Clock,
  CheckCircle2,
  Brain,
  Calendar,
  AlertTriangle,
  ChevronDown,
  LogOut,
  User,
  ShieldCheck,
  Plus,
  Flame,
  Trophy,
  Medal,
  ArrowRight,
  TrendingUp,
  Layers,
  RefreshCw,
  Compass,
  Sliders,
  Lock,
  Globe,
  Share2,
  BarChart3,
} from "lucide-react";

import { GoalBuilderFeature } from "@/components/dashboard/GoalBuilderFeature";
import { DailyTaskFeature } from "@/components/dashboard/DailyTaskFeature";
import { RecoveryModeFeature } from "@/components/dashboard/RecoveryModeFeature";
import { AiCoachFeature } from "@/components/dashboard/AiCoachFeature";
import { LeaderboardFeature } from "@/components/dashboard/LeaderboardFeature";
import { AnalyticsFeature } from "@/components/dashboard/AnalyticsFeature";
import { MedalCelebrationModal } from "@/components/dashboard/MedalCelebrationModal";
import { ProfileSettingsModal } from "@/components/dashboard/ProfileSettingsModal";
import { SocialShareModal } from "@/components/dashboard/SocialShareModal";
import {
  DailyTasksLogo,
  RoadmapBuilderLogo,
  RecoveryModeLogo,
  AiCoachLogo,
  LeaderboardLogo,
  AnalyticsStatsLogo,
} from "@/components/dashboard/NavLogos";

export type DashboardTab = "tasks" | "builder" | "recovery" | "coach" | "arena" | "analytics";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { user, isAuthenticated, logout } = useAuth();
  const {
    goals,
    activeGoals,
    completedGoals,
    activeGoal,
    milestones,
    tasks,
    recoveryProposal,
    streak,
    unlockedMedalsCount,
    isLoading: isGoalLoading,
    setActiveGoalId,
  } = useGoal();

  // Strict Google OAuth Guard: without session, strictly no access to dashboard
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.replace("/auth?callbackUrl=/dashboard");
    }
  }, [sessionStatus, router]);

  const [activeTab, setActiveTab] = useState<DashboardTab>("tasks");
  const [isGoalDropdownOpen, setIsGoalDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSocialShareOpen, setIsSocialShareOpen] = useState(false);
  const [socialShareMode, setSocialShareMode] = useState<"kickoff" | "streak" | "victory">("kickoff");
  const [profileDefaultTab, setProfileDefaultTab] = useState<"general" | "privacy" | "completed" | "coaching" | "social">("general");

  // If checking authentication
  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-400">Verifying Google OAuth Session...</p>
      </div>
    );
  }

  // Without verified session, deny access
  if (sessionStatus === "unauthenticated" || !session) {
    return null;
  }

  const currentUser = {
    name: user?.name || session?.user?.name || "GoalForge User",
    email: user?.email || session?.user?.email || "",
    image: user?.avatarUrl || session?.user?.image,
    bio: user?.bio || "",
    isPublic: user?.isPublic ?? true,
    preferences: user?.preferences || (session?.user as any)?.preferences || {
      availableMinutesPerDay: 45,
      coachingStyle: "compassionate",
    },
  };

  const handleSignOut = async () => {
    document.cookie = "goalforge_session=; path=/; max-age=0";
    logout();
    await signOut({ callbackUrl: "/auth" }).catch(() => {
      router.push("/auth");
    });
  };

  const todayDate = new Date().toISOString().split("T")[0];

  // Filter tasks for active goal dynamically
  const goalTasks = tasks.filter((t) => t.goalId === activeGoal?.id);
  const completedTasks = goalTasks.filter((t) => t.status === "completed");
  const overdueTasks = goalTasks.filter((t) => t.status === "todo" && t.dueDate < todayDate);
  const todayTasks = goalTasks.filter((t) => t.dueDate === todayDate && t.status === "todo");

  // Metrics calculation (PRD F-07 & F-09)
  const totalPlannedMinutesToday = todayTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const userDailyCapacity = currentUser.preferences.availableMinutesPerDay || 45;
  const capacityPercent = Math.min(Math.round((totalPlannedMinutesToday / userDailyCapacity) * 100), 100);
  const completionPercent = goalTasks.length > 0 ? Math.round((completedTasks.length / goalTasks.length) * 100) : 0;

  const hasPendingRecovery = overdueTasks.length > 0 || (recoveryProposal && recoveryProposal.status === "pending");

  const riskLabel =
    activeGoal?.feasibilityRisk === "low_risk"
      ? "Low Risk"
      : activeGoal?.feasibilityRisk === "high_risk"
        ? "High Risk"
        : "Moderate Risk";

  const riskColor =
    activeGoal?.feasibilityRisk === "low_risk"
      ? "text-emerald-300"
      : activeGoal?.feasibilityRisk === "high_risk"
        ? "text-rose-300"
        : "text-amber-300";

  const riskPingColor =
    activeGoal?.feasibilityRisk === "low_risk"
      ? "bg-emerald-400"
      : activeGoal?.feasibilityRisk === "high_risk"
        ? "bg-rose-500"
        : "bg-amber-400";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-md shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Target className="w-4 h-4 text-indigo-400 group-hover:text-emerald-400 transition-colors" />
                </div>
              </div>
              <span className="font-bold text-lg tracking-tight text-white hidden sm:inline">
                GoalForge <span className="text-emerald-400">AI</span>
              </span>
            </Link>

            {/* Goal Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsGoalDropdownOpen(!isGoalDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-xs font-medium text-slate-200 transition-colors max-w-[240px] truncate"
              >
                <Target className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{activeGoal?.title || (activeGoals.length === 0 && completedGoals.length > 0 ? "All Goals Conquered 🎉" : "Select Goal")}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {isGoalDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-fadeIn">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
                    <span>Active Goals ({activeGoals.length})</span>
                    {activeGoals.length > 0 && (
                      <span className="text-emerald-400 font-mono text-[9px] font-normal">In Progress</span>
                    )}
                  </div>

                  {activeGoals.length === 0 ? (
                    <div className="px-3 py-3 text-center space-y-1">
                      <p className="text-xs font-bold text-slate-200">No Active Goals</p>
                      <p className="text-[11px] text-slate-400">
                        {completedGoals.length > 0
                          ? "All goals completed & moved to profile!"
                          : "Start your journey by creating a goal below."}
                      </p>
                    </div>
                  ) : (
                    activeGoals.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => {
                          setActiveGoalId(g.id);
                          setIsGoalDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                          g.id === activeGoal?.id
                            ? "bg-indigo-600/20 text-indigo-300 font-semibold"
                            : "text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <span className="truncate">{g.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono ml-2 shrink-0">
                          {g.category.split(" ")[0]}
                        </span>
                      </button>
                    ))
                  )}

                  {/* Completed Goals link in dropdown */}
                  {completedGoals.length > 0 && (
                    <div className="border-t border-slate-800 mt-2 pt-1.5 px-2">
                      <button
                        onClick={() => {
                          setProfileDefaultTab("completed");
                          setIsProfileModalOpen(true);
                          setIsGoalDropdownOpen(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-amber-400 hover:bg-slate-800 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          View Conquered Goals
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                          {completedGoals.length}
                        </span>
                      </button>
                    </div>
                  )}

                  <div className="border-t border-slate-800 mt-1.5 pt-1 px-2">
                    <button
                      onClick={() => {
                        setActiveTab("builder");
                        setIsGoalDropdownOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create New Goal with AI
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Header Navigation & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Recovery Alert Banner */}
            {hasPendingRecovery && (
              <button
                onClick={() => setActiveTab("recovery")}
                className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all animate-pulse"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>{overdueTasks.length} Overdue • Goal Recovery Ready</span>
              </button>
            )}

            {/* Quick Analytics Graph Feature Button in Navbar */}
            <button
              type="button"
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer backdrop-blur-md ${
                activeTab === "analytics"
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.35)]"
                  : "bg-slate-900/80 border-white/10 text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
              title="User Stats & Analytics Graphs"
            >
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-mono font-bold hidden md:inline">Analytics</span>
            </button>

            {/* Daily Streak Counter Pill */}
            <button
              type="button"
              onClick={() => setActiveTab("arena")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer backdrop-blur-md ${
                streak?.isActiveToday
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:bg-amber-500/25"
                  : streak?.isStreakAtRisk
                  ? "bg-orange-500/20 border-orange-500/50 text-orange-300 animate-pulse hover:bg-orange-500/30"
                  : "bg-slate-800/80 border-white/10 text-slate-300 hover:bg-slate-800"
              }`}
              title="Daily Execution Streak • Click to open Championship Arena"
            >
              <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black font-mono">
                  {streak?.currentStreak || 0}
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  {streak?.currentStreak === 1 ? "day streak" : "days streak"}
                </span>
              </div>
              {streak?.isActiveToday && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>

            {/* Quick Share to Socials Button */}
            <button
              type="button"
              onClick={() => {
                setSocialShareMode(streak?.currentStreak ? "streak" : "kickoff");
                setIsSocialShareOpen(true);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold backdrop-blur-md transition-all shadow-sm cursor-pointer"
              title="Share Goal & Streak Progress on X and LinkedIn"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Share</span>
            </button>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs overflow-hidden">
                  {currentUser.image ? (
                    <img src={currentUser.image} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name?.slice(0, 2).toUpperCase() || "GF"
                  )}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-200">{currentUser.name}</span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    {currentUser.preferences.availableMinutesPerDay}m/d • {currentUser.preferences.coachingStyle}
                    {currentUser.isPublic ? (
                      <span className="text-emerald-400" title="Public Profile">●</span>
                    ) : (
                      <span className="text-amber-400" title="Private Profile">●</span>
                    )}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:inline" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/20">
                      <span>Coaching: {currentUser.preferences.coachingStyle}</span>
                      <span className="font-mono">{currentUser.preferences.availableMinutesPerDay}m/day</span>
                    </div>
                  </div>

                  {/* Profile & Privacy and Social Actions */}
                  <div className="px-2 py-1.5 border-b border-slate-800 space-y-0.5">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                        Edit Profile & Privacy
                      </span>
                      {currentUser.isPublic ? (
                        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                          <Globe className="w-2.5 h-2.5" /> Public
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Private
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setSocialShareMode("kickoff");
                        setIsSocialShareOpen(true);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                      Share on X & LinkedIn
                    </button>
                  </div>

                  <div className="px-4 py-2 text-[10px] text-slate-400 space-y-1">
                    <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Google OAuth Verified
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Synced and verified with your GoalForge account.
                    </p>
                  </div>

                  <div className="border-t border-slate-800 mt-2 pt-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Centered Liquid Glass Navigation Dock */}
        <div className="w-full border-t border-slate-900/80 bg-slate-950/40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center py-3">
            <nav
              role="tablist"
              aria-label="Dashboard Feature Navigation"
              className="liquid-glass-dock relative inline-flex items-center gap-2 sm:gap-4 p-2 rounded-3xl"
            >
              {/* 1. Daily Tasks & Execution Logo Tab */}
              <div className="relative group">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "tasks"}
                  aria-label="Daily Tasks and Execution Hub"
                  onClick={() => setActiveTab("tasks")}
                  className={`liquid-glass-item relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 p-1.5 rounded-2xl cursor-pointer transition-all duration-300 ${activeTab === "tasks" ? "liquid-glass-item-active-tasks scale-105 shadow-[0_0_20px_rgba(16,185,129,0.5)]" : ""
                    }`}
                >
                  <DailyTasksLogo className="w-full h-full" isActive={activeTab === "tasks"} />

                  {/* Dynamic Badge for today's tasks */}
                  {todayTasks.length > 0 && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black font-mono shadow-lg shadow-emerald-500/50 border-2 border-slate-950 animate-pulse z-20">
                      {todayTasks.length}
                    </span>
                  )}
                </button>

                {/* Micro-Tooltip with context */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 z-50 pointer-events-none opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/95 border border-white/10 shadow-2xl text-center whitespace-nowrap backdrop-blur-xl">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5 justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Daily Tasks & Execution
                    </p>
                    <p className="text-[10px] text-emerald-400/90 font-mono">
                      {todayTasks.length} focus items for today
                    </p>
                  </div>
                </div>

                {/* Active indicator dot beneath */}
                {activeTab === "tasks" && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-1 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                )}
              </div>

              {/* 2. AI Goal & Roadmap Builder Logo Tab */}
              <div className="relative group">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "builder"}
                  aria-label="AI Goal and Roadmap Builder"
                  onClick={() => setActiveTab("builder")}
                  className={`liquid-glass-item relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 p-1.5 rounded-2xl cursor-pointer transition-all duration-300 ${activeTab === "builder" ? "liquid-glass-item-active-builder scale-105 shadow-[0_0_20px_rgba(99,102,241,0.5)]" : ""
                    }`}
                >
                  <RoadmapBuilderLogo className="w-full h-full" isActive={activeTab === "builder"} />
                </button>

                {/* Micro-Tooltip with context */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 z-50 pointer-events-none opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/95 border border-white/10 shadow-2xl text-center whitespace-nowrap backdrop-blur-xl">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5 justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      AI Goal & Roadmap Builder
                    </p>
                    <p className="text-[10px] text-indigo-300/90 font-mono">
                      Milestone roadmap & AI path synthesizer
                    </p>
                  </div>
                </div>

                {/* Active indicator dot beneath */}
                {activeTab === "builder" && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-1 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400" />
                )}
              </div>

              {/* 3. Goal Recovery Mode Logo Tab */}
              <div className="relative group">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "recovery"}
                  aria-label="Goal Recovery Mode"
                  onClick={() => setActiveTab("recovery")}
                  className={`liquid-glass-item relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 p-1.5 rounded-2xl cursor-pointer transition-all duration-300 ${activeTab === "recovery" ? "liquid-glass-item-active-recovery scale-105 shadow-[0_0_20px_rgba(245,158,11,0.5)]" : ""
                    }`}
                >
                  <RecoveryModeLogo className="w-full h-full" isActive={activeTab === "recovery"} />

                  {/* Overdue Slippage Alert Badge */}
                  {overdueTasks.length > 0 && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black font-mono shadow-lg shadow-amber-500/50 border-2 border-slate-950 animate-bounce z-20">
                      {overdueTasks.length}
                    </span>
                  )}
                </button>

                {/* Micro-Tooltip with context */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 z-50 pointer-events-none opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/95 border border-white/10 shadow-2xl text-center whitespace-nowrap backdrop-blur-xl">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5 justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Goal Recovery Mode
                    </p>
                    <p className="text-[10px] text-amber-300/90 font-mono">
                      {overdueTasks.length > 0 ? `${overdueTasks.length} slipped • Gemini 7-day ramp` : "Adaptive recalibration & safety net"}
                    </p>
                  </div>
                </div>

                {/* Active indicator dot beneath */}
                {activeTab === "recovery" && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-1 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                )}
              </div>

              {/* 4. AI Coach & Feasibility Insights Logo Tab */}
              <div className="relative group">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "coach"}
                  aria-label="AI Coach and Feasibility Insights"
                  onClick={() => setActiveTab("coach")}
                  className={`liquid-glass-item relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 p-1.5 rounded-2xl cursor-pointer transition-all duration-300 ${activeTab === "coach" ? "liquid-glass-item-active-coach scale-105 shadow-[0_0_20px_rgba(20,184,166,0.5)]" : ""
                    }`}
                >
                  <AiCoachLogo className="w-full h-full" isActive={activeTab === "coach"} />
                </button>

                {/* Micro-Tooltip with context */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 z-50 pointer-events-none opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/95 border border-white/10 shadow-2xl text-center whitespace-nowrap backdrop-blur-xl">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5 justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      AI Coach & Feasibility Insights
                    </p>
                    <p className="text-[10px] text-teal-300/90 font-mono">
                      Neural cognitive guidance & strategic pacing
                    </p>
                  </div>
                </div>

                {/* Active indicator dot beneath */}
                {activeTab === "coach" && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-1 rounded-full bg-teal-400 shadow-sm shadow-teal-400" />
                )}
              </div>

              {/* 5. Arena: Leaderboard & Medals Logo Tab */}
              <div className="relative group">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "arena"}
                  aria-label="Leaderboard, Medals and Daily Streaks Arena"
                  onClick={() => setActiveTab("arena")}
                  className={`liquid-glass-item relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 p-1.5 rounded-2xl cursor-pointer transition-all duration-300 ${activeTab === "arena" ? "liquid-glass-item-active-arena scale-105 shadow-[0_0_20px_rgba(234,179,8,0.5)]" : ""
                    }`}
                >
                  <LeaderboardLogo className="w-full h-full" isActive={activeTab === "arena"} />

                  {/* Medal count badge */}
                  {unlockedMedalsCount > 0 && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black font-mono shadow-lg shadow-amber-400/50 border-2 border-slate-950 z-20">
                      {unlockedMedalsCount}
                    </span>
                  )}
                </button>

                {/* Micro-Tooltip with context */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 z-50 pointer-events-none opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/95 border border-white/10 shadow-2xl text-center whitespace-nowrap backdrop-blur-xl">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5 justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Leaderboard & Medals
                    </p>
                    <p className="text-[10px] text-amber-300/90 font-mono">
                      Daily streak, Hard Goal medals & global ranks
                    </p>
                  </div>
                </div>

                {/* Active indicator dot beneath */}
                {activeTab === "arena" && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-1 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                )}
              </div>

              {/* 6. User Stats, Analytics & Graphs Logo Tab */}
              <div className="relative group">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "analytics"}
                  aria-label="User Stats, Graphs and Velocity Analytics"
                  onClick={() => setActiveTab("analytics")}
                  className={`liquid-glass-item relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 p-1.5 rounded-2xl cursor-pointer transition-all duration-300 ${
                    activeTab === "analytics"
                      ? "liquid-glass-item-active-analytics scale-105 shadow-[0_0_20px_rgba(6,182,212,0.5)] border-cyan-400/80 bg-cyan-500/20"
                      : ""
                  }`}
                >
                  <AnalyticsStatsLogo className="w-full h-full" isActive={activeTab === "analytics"} />
                </button>

                {/* Micro-Tooltip with context */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 z-50 pointer-events-none opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/95 border border-white/10 shadow-2xl text-center whitespace-nowrap backdrop-blur-xl">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5 justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      User Stats & Graphs
                    </p>
                    <p className="text-[10px] text-cyan-300/90 font-mono">
                      Telemetry, pacing & velocity graphs
                    </p>
                  </div>
                </div>

                {/* Active indicator dot beneath */}
                {activeTab === "analytics" && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-1 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Goal Summary & Velocity Banner */}
        {activeGoal && (
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 mb-6 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {activeGoal.category}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Deadline: {activeGoal.deadline}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Plan v{activeGoal.activePlanVersion}.0 Approved
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white mt-1.5">
                  {activeGoal.title}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Target Outcome: <span className="text-slate-300">{activeGoal.outcome}</span>
                </p>
              </div>

              {/* Progress & Capacity Quick Gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 min-w-[120px]">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Today&apos;s Load</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-bold text-white">{totalPlannedMinutesToday}m</span>
                    <span className="text-[10px] text-slate-500">/ {userDailyCapacity}m</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${totalPlannedMinutesToday > userDailyCapacity ? "bg-rose-500" : "bg-emerald-400"
                        }`}
                      style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 min-w-[120px]">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Roadmap Done</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-bold text-indigo-400">{completionPercent}%</span>
                    <span className="text-[10px] text-slate-500">({completedTasks.length}/{goalTasks.length})</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 min-w-[120px] col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Feasibility</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-2 h-2 rounded-full ${riskPingColor} animate-ping`} />
                    <span className={`text-xs font-bold ${riskColor}`}>{riskLabel}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {activeGoal?.feasibilityRisk === "low_risk"
                      ? "Healthy pace"
                      : activeGoal?.feasibilityRisk === "high_risk"
                        ? "High pace risk"
                        : "Paced with buffers"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Celebratory Banner when All Active Goals Are Completed */}
        {!activeGoal && (
          <div className="bg-gradient-to-r from-indigo-950/50 via-slate-900 to-emerald-950/40 rounded-2xl border border-white/10 p-6 mb-6 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" /> All Active Goals Completed
              </span>
              <h2 className="text-xl font-bold text-white">
                {completedGoals.length > 0
                  ? `Outstanding Execution! You've conquered ${completedGoals.length} goals.`
                  : "Welcome to GoalForge AI! Ready to forge your first goal?"}
              </h2>
              <p className="text-xs text-slate-400">
                {completedGoals.length > 0
                  ? "Your completed goals are safely recorded in your profile. Forge a new ambitious target with AI roadmap decomposition."
                  : "Let Gemini AI synthesize a capacity-paced milestone roadmap for your ambitious goals."}
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              {completedGoals.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setProfileDefaultTab("completed");
                    setIsProfileModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trophy className="w-3.5 h-3.5" /> View Conquered Goals ({completedGoals.length})
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab("builder")}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 text-white font-bold text-xs hover:brightness-110 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Forge New Goal with AI
              </button>
            </div>
          </div>
        )}

        {/* Feature Tab Contents - Mounted based on activeTab */}
        <div id="feature-container" className="space-y-6">
          {/* Shell Placeholder / Feature Router */}
          {activeTab === "tasks" && (
            <DailyTaskFeature onNavigateToRecovery={() => setActiveTab("recovery")} />
          )}

          {activeTab === "builder" && (
            <GoalBuilderFeature onGoalActivated={() => setActiveTab("tasks")} />
          )}

          {activeTab === "recovery" && (
            <RecoveryModeFeature onReturnToTasks={() => setActiveTab("tasks")} />
          )}

          {activeTab === "coach" && (
            <AiCoachFeature onNavigateToTasks={() => setActiveTab("tasks")} />
          )}

          {activeTab === "arena" && (
            <LeaderboardFeature
              onOpenProfile={() => setIsProfileModalOpen(true)}
              onOpenShare={(mode = "streak") => {
                setSocialShareMode(mode);
                setIsSocialShareOpen(true);
              }}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsFeature
              onOpenShare={(mode = "streak") => {
                setSocialShareMode(mode);
                setIsSocialShareOpen(true);
              }}
              onNavigateToBuilder={() => setActiveTab("builder")}
            />
          )}
        </div>
      </main>

      {/* Global Medal Unlock Celebration Modal */}
      <MedalCelebrationModal
        onShare={() => {
          setSocialShareMode("victory");
          setIsSocialShareOpen(true);
        }}
      />

      {/* Profile & Privacy Settings Modal */}
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        defaultTab={profileDefaultTab}
        onOpenShare={() => {
          setIsProfileModalOpen(false);
          setSocialShareMode("victory");
          setIsSocialShareOpen(true);
        }}
      />

      {/* Social Media Sharing Modal */}
      <SocialShareModal
        isOpen={isSocialShareOpen}
        onClose={() => setIsSocialShareOpen(false)}
        defaultMode={socialShareMode}
      />
    </div>
  );
}
