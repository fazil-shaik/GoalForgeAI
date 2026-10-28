"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  ArrowRight,
  TrendingUp,
  Layers,
  RefreshCw,
  Compass,
  Sliders
} from "lucide-react";

import { GoalBuilderFeature } from "@/components/dashboard/GoalBuilderFeature";
import { DailyTaskFeature } from "@/components/dashboard/DailyTaskFeature";
import { RecoveryModeFeature } from "@/components/dashboard/RecoveryModeFeature";
import { AiCoachFeature } from "@/components/dashboard/AiCoachFeature";

export type DashboardTab = "tasks" | "builder" | "recovery" | "coach";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, loginAsDemo } = useAuth();
  const {
    goals,
    activeGoal,
    milestones,
    tasks,
    recoveryProposal,
    setActiveGoalId,
  } = useGoal();

  const [activeTab, setActiveTab] = useState<DashboardTab>("tasks");
  const [isGoalDropdownOpen, setIsGoalDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Filter tasks for active goal
  const goalTasks = tasks.filter((t) => t.goalId === activeGoal?.id);
  const completedTasks = goalTasks.filter((t) => t.status === "completed");
  const overdueTasks = goalTasks.filter((t) => t.status === "todo" && t.dueDate < "2026-10-28");
  const todayTasks = goalTasks.filter((t) => t.dueDate === "2026-10-28" && t.status === "todo");

  // Metrics calculation (PRD F-07 & F-09)
  const totalPlannedMinutesToday = todayTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const userDailyCapacity = user?.preferences?.availableMinutesPerDay || 45;
  const capacityPercent = Math.min(Math.round((totalPlannedMinutesToday / userDailyCapacity) * 100), 100);
  const completionPercent = goalTasks.length > 0 ? Math.round((completedTasks.length / goalTasks.length) * 100) : 0;

  const hasPendingRecovery = overdueTasks.length > 0 || (recoveryProposal && recoveryProposal.status === "pending");

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
                <span className="truncate">{activeGoal?.title || "Select Goal"}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {isGoalDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-fadeIn">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Your Active Goals
                  </div>
                  {goals.map((g) => (
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
                  ))}
                  <div className="border-t border-slate-800 mt-2 pt-1 px-2">
                    <button
                      onClick={() => {
                        setActiveTab("builder");
                        setIsGoalDropdownOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-slate-800 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create New Goal with AI
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Header Navigation & User Profile */}
          <div className="flex items-center gap-3">
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

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs">
                  {user?.name?.slice(0, 2).toUpperCase() || "GF"}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-200">{user?.name || "Guest"}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {user?.preferences?.availableMinutesPerDay || 45}m/d • {user?.preferences?.coachingStyle || "compassionate"}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:inline" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    <div className="mt-1.5 flex items-center gap-2 text-[10px] text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/20">
                      <span>Coaching: {user?.preferences?.coachingStyle}</span>
                    </div>
                  </div>

                  <div className="px-3 py-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Switch Persona Demo
                  </div>
                  <button
                    onClick={() => { loginAsDemo("learner"); setIsUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    Alex Rivera (Overwhelmed Learner)
                  </button>
                  <button
                    onClick={() => { loginAsDemo("professional"); setIsUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    Sarah Chen (Busy Professional)
                  </button>
                  <button
                    onClick={() => { loginAsDemo("starter"); setIsUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    Marcus Vance (Inconsistent Starter)
                  </button>

                  <div className="border-t border-slate-800 mt-2 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        router.push("/auth");
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4 Feature Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900">
          <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === "tasks"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              1. Daily Tasks & Execution
              {todayTasks.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px] font-mono text-emerald-300">
                  {todayTasks.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("builder")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === "builder"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              2. AI Goal & Roadmap Builder
            </button>

            <button
              onClick={() => setActiveTab("recovery")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === "recovery"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : overdueTasks.length > 0
                  ? "text-amber-400 bg-amber-950/20 border border-amber-500/30 hover:bg-amber-950/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              3. Goal Recovery Mode
              {overdueTasks.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                  {overdueTasks.length} slip
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("coach")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === "coach"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Brain className="w-4 h-4 text-teal-400" />
              4. AI Coach & Feasibility Insights
            </button>
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
                      className={`h-full rounded-full transition-all ${
                        totalPlannedMinutesToday > userDailyCapacity ? "bg-rose-500" : "bg-emerald-400"
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
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-xs font-bold text-amber-300">Moderate Risk</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">45m buffer included</span>
                </div>
              </div>
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
        </div>
      </main>
    </div>
  );
}
