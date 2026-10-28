"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Target,
  Sparkles,
  RotateCcw,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Brain,
  ShieldCheck,
  Zap,
  ChevronRight,
  Calendar,
  AlertTriangle,
  Flame,
  Award,
  Layers
} from "lucide-react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"roadmap" | "recovery" | "coach">("roadmap");
  const [completedDemoTask, setCompletedDemoTask] = useState<boolean>(false);
  const [recoveryTriggered, setRecoveryTriggered] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Target className="w-5 h-5 text-indigo-400 group-hover:text-emerald-400 transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                GoalForge <span className="text-emerald-400 font-extrabold">AI</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 -mt-1 font-semibold">
                Adaptive Execution
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#recovery" className="hover:text-white transition-colors flex items-center gap-1.5 text-indigo-300">
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              Goal Recovery
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How it Works
            </a>
            <a href="#demo" className="hover:text-white transition-colors">
              Interactive Demo
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth?mode=signup"
              className="inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white px-4 py-2 rounded-lg shadow-md shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30 hover:scale-[1.02]"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-900">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-sm shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Turn Ambitions Into Realistic Plans — Not Broken Streaks</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Turn Ambition Into{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Unstoppable Execution
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Most goal trackers fail the moment life gets unpredictable. GoalForge AI breaks natural-language ambitions into capacity-aware roadmaps — and{" "}
            <span className="text-emerald-400 font-medium">intelligently recovers your momentum</span> when life gets in the way.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth?mode=signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 text-white shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.02] transition-all"
            >
              Start Forging Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-base bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              Explore Interactive Demo
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero broken-streak guilt</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Capacity-aware daily planning</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Adaptive recovery mode</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Always user-approved changes</span>
            </div>
          </div>
        </div>

        {/* Interactive Hero Preview Component */}
        <div id="demo" className="max-w-5xl mx-auto px-4 mt-16">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Window header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs font-mono text-slate-400">GoalForge Dashboard Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                  Live Preview
                </span>
              </div>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("roadmap")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === "roadmap"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Active Goal Roadmap
                </button>
                <button
                  onClick={() => setActiveTab("recovery")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === "recovery"
                      ? "bg-amber-600/90 text-white shadow"
                      : "text-amber-400 hover:text-amber-300"
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Goal Recovery Mode
                </button>
                <button
                  onClick={() => setActiveTab("coach")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === "coach"
                      ? "bg-emerald-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Brain className="w-3.5 h-3.5" />
                  AI Coach Insights
                </button>
              </div>

              <div className="text-xs text-slate-400">
                Goal: <span className="text-slate-200 font-semibold">Launch SaaS MVP in 60 Days</span>
              </div>
            </div>

            {/* Tab 1: Roadmap View */}
            {activeTab === "roadmap" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400">Planned Velocity</span>
                    <p className="text-2xl font-bold text-white mt-1">45 min<span className="text-xs text-slate-400 font-normal">/day</span></p>
                    <span className="text-[11px] text-emerald-400 mt-1 inline-block">✓ Fits declared capacity</span>
                  </div>
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400">Milestones Completed</span>
                    <p className="text-2xl font-bold text-indigo-400 mt-1">2 <span className="text-slate-500 font-normal text-base">/ 5</span></p>
                    <span className="text-[11px] text-slate-400 mt-1 inline-block">40% overall roadmap</span>
                  </div>
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400">Feasibility Confidence</span>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">Moderate Risk</p>
                    <span className="text-[11px] text-slate-400 mt-1 inline-block">Safe schedule with 3-day buffer</span>
                  </div>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      Today&apos;s Focus Tasks
                    </h4>
                    <span className="text-xs text-slate-400">Total time: 45m</span>
                  </div>

                  <div className="space-y-2">
                    <div
                      onClick={() => setCompletedDemoTask(!completedDemoTask)}
                      className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                        completedDemoTask
                          ? "bg-emerald-950/30 border-emerald-500/40 text-slate-300"
                          : "bg-slate-900 border-slate-800 hover:border-indigo-500/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                            completedDemoTask
                              ? "bg-emerald-500 border-emerald-500 text-slate-950"
                              : "border-slate-600 hover:border-indigo-400"
                          }`}
                        >
                          {completedDemoTask && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${completedDemoTask ? "line-through text-slate-500" : "text-slate-200"}`}>
                            Design core database schema for user goals & tasks
                          </p>
                          <span className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <Clock className="w-3 h-3" /> 30 min • High Priority • Milestone 3
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono px-2 py-1 bg-slate-800 rounded text-slate-300">
                        {completedDemoTask ? "Completed!" : "Click to Complete"}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-800 bg-slate-900 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-md border border-slate-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-200">
                            Draft landing page value proposition and feature matrix
                          </p>
                          <span className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <Clock className="w-3 h-3" /> 15 min • Normal Priority
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">Scheduled for today</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Recovery Mode View */}
            {activeTab === "recovery" && (
              <div className="bg-slate-950/70 p-5 rounded-xl border border-amber-500/30 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Adaptive Goal Recovery Engine</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Did you miss 2 days due to unexpected overtime or sickness? Instead of giving up or staring at red streaks, GoalForge AI assesses the slip and reorganizes future tasks.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-amber-950/20 rounded-lg border border-amber-500/20 text-xs text-amber-200 flex items-center justify-between">
                  <span>Detected obstacle: <strong>2 overdue tasks (60 mins backlog)</strong></span>
                  <button
                    onClick={() => setRecoveryTriggered(!recoveryTriggered)}
                    className="px-3 py-1.5 rounded-md bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors"
                  >
                    {recoveryTriggered ? "Reset Demo" : "Generate Recovery Plan"}
                  </button>
                </div>

                {recoveryTriggered && (
                  <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-700 animate-fadeIn space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                        Proposed AI Recovery Adjustment
                      </span>
                      <span className="text-xs text-slate-400">No deadline movement required</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      We split the 60 min backlog across tomorrow and Thursday, keeping your daily load capped at 45 min/day without burning out.
                    </p>
                    <div className="text-xs font-mono bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-300">
                      ✓ Rescheduled: Task #4 (30m) -&gt; Tomorrow 7:00 PM<br/>
                      ✓ Rescheduled: Task #5 (30m) -&gt; Thursday 7:00 PM<br/>
                      ✓ Preserved: All completed history and final deadline intact!
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: AI Coach View */}
            {activeTab === "coach" && (
              <div className="bg-slate-950/70 p-5 rounded-xl border border-emerald-500/30 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Dedicated Goal Coach</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Context-aware guidance anchored in your actual progress data. No generic quotes — only practical next steps.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 max-w-md ml-auto text-slate-200">
                    &quot;I only have 20 minutes today instead of 45. What should I prioritize?&quot;
                  </div>
                  <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg max-w-lg text-slate-200 space-y-1.5">
                    <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Coach Recommendation:
                    </p>
                    <p>
                      Focus exclusively on <strong>Task 3.1: Defining the database primary keys</strong> (estimated 15 min). Save the index definitions for tomorrow. This keeps momentum alive without sacrificing quality.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4 Core Features Section */}
      <section id="features" className="py-20 bg-slate-950 relative border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-2">
              Four Core Pillars
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              Built Specifically for Real-World Human Follow-Through
            </p>
            <p className="mt-4 text-slate-400 text-base">
              From natural language ambitions to daily action checklists and graceful recovery, every feature works in harmony.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. AI Goal & Roadmap Builder</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Describe your target in plain English. GoalForge generates measurable milestones, tasks, minute estimates, and dependencies, requiring your explicit approval before activation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. Daily Task & Execution Hub</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Clear daily focus queue matching your declared daily minutes. Mark tasks done with instant celebratory feedback, log actual minutes, skip, or reschedule with full progress tracking.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. Goal Recovery Engine</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Our core differentiator. When life gets in the way or tasks are overdue, diagnose the obstacle and generate a smaller, compassionate recovery plan with before-and-after diffs.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">4. AI Coach & Feasibility Insights</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Real-time workload vs weekly capacity analysis, risk band indicators, blocker breakdowns, and intelligent advice based only on your recorded progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Differentiator Deep Dive */}
      <section id="recovery" className="py-20 bg-slate-900/40 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-4">
                <RotateCcw className="w-3.5 h-3.5" />
                The Core Differentiator
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Why Traditional Goal Apps Fail — And How Goal Recovery Fixes It
              </h2>
              <p className="mt-4 text-slate-300 text-base leading-relaxed">
                Most productivity apps assume a robot is operating them. The moment you miss 2 days due to flu, family emergencies, or tight work deadlines, you get slammed with 15 overdue notifications and broken streaks.
              </p>
              <p className="mt-3 text-slate-400 text-base leading-relaxed">
                GoalForge AI treats recovery as a first-class feature. We diagnose what happened with compassion, ask one lightweight clarifying question, and recalculate an achievable 7-day ramp-up plan.
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span className="text-sm text-slate-200">
                    <strong>Zero shaming:</strong> No punitive streak mechanics or red alerts.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span className="text-sm text-slate-200">
                    <strong>Preserves completed history:</strong> Every past victory remains counted.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span className="text-sm text-slate-200">
                    <strong>User approval required:</strong> The AI never secretly touches your plan without your review.
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/auth?mode=signup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold transition-all shadow-lg shadow-amber-500/20"
                >
                  Experience Recovery Mode
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-4">
                Comparison: The Goal Slippage Moment
              </h4>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm mb-1">
                    <AlertTriangle className="w-4 h-4" /> Typical Goal Apps
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    &quot;Streak broken! You have 8 overdue tasks. Schedule collapsed. Start over from Day 1.&quot;
                  </p>
                  <span className="inline-block mt-2 text-[11px] text-rose-400/90 font-mono">
                    Outcome: 82% of users abandon the goal.
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-1">
                    <CheckCircle2 className="w-4 h-4" /> GoalForge AI
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    &quot;We noticed things were delayed this week. Life happens! Let&apos;s consolidate your next 3 days into achievable 25-minute sprints so you stay on track without burnout.&quot;
                  </p>
                  <span className="inline-block mt-2 text-[11px] text-emerald-400 font-mono">
                    Outcome: 89% recovery acceptance & continuity.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-950 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-2">
              Execution Architecture
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              How GoalForge AI Powers Your Success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 relative">
              <span className="text-4xl font-black text-slate-800 absolute top-4 right-4">01</span>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Define Your Ambition</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Tell GoalForge what you want to achieve, your target deadline, and how many minutes per day you actually have available.
              </p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 relative">
              <span className="text-4xl font-black text-slate-800 absolute top-4 right-4">02</span>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Approve Your Custom Roadmap</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Review the AI-generated milestones, edit tasks, adjust time allocations, and activate the versioned roadmap when you are 100% happy.
              </p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 relative">
              <span className="text-4xl font-black text-slate-800 absolute top-4 right-4">03</span>
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Execute & Adapt Seamlessly</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Check off daily tasks in minutes. If schedule conflicts arise, rely on automated Goal Recovery to keep your long-term outcome on target.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 bg-gradient-to-b from-slate-950 via-indigo-950/20 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Stop abandoning goals. Start forging results.
          </h2>
          <p className="mt-4 text-lg text-slate-300 max-w-xl mx-auto">
            Join users turning vague ambitions into realistic, daily actionable milestones today.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/auth?mode=signup"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 text-white shadow-xl shadow-indigo-600/30 hover:scale-[1.03] transition-all"
            >
              Get Started with GoalForge AI
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-slate-300">GoalForge AI</span>
            <span>— Adaptive Goal Execution Engine</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/auth" className="hover:text-slate-300 transition-colors">
              Sign In
            </Link>
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">
              Dashboard
            </Link>
            <span>&copy; 2026 GoalForge AI. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
