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
  Layers,
  Flame,
  Calendar,
  AlertTriangle,
  Play,
  Check,
  ChevronRight,
  Compass,
  Sliders
} from "lucide-react";
import { GoalForgeScene } from "@/components/3d/GoalForgeScene";
import confetti from "canvas-confetti";

export default function LandingPage() {
  const [demoStep, setDemoStep] = useState<number>(1);
  const [recoveryActive, setRecoveryActive] = useState<boolean>(false);
  const [completedDemoTask, setCompletedDemoTask] = useState<boolean>(false);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // safe fallback
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Ambient Aurora Glow Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-indigo-600/15 via-teal-500/10 to-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-100px] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-100px] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Floating Glassmorphic Top Navbar */}
      <header className="sticky top-3 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="glass-card rounded-2xl px-4 sm:px-6 h-16 flex items-center justify-between shadow-2xl border border-white/10 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#070a12] rounded-[10px] flex items-center justify-center">
                <Target className="w-5 h-5 text-indigo-400 group-hover:text-emerald-400 transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                GoalForge <span className="text-emerald-400 font-black">AI</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 -mt-1 font-mono font-semibold">
                3D Adaptive Engine
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#3d-core" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> 3D Core
            </a>
            <a href="#bento-features" className="hover:text-white transition-colors">
              Pillars
            </a>
            <a href="#recovery" className="hover:text-amber-400 transition-colors flex items-center gap-1 text-amber-300">
              <RotateCcw className="w-3 h-3 text-amber-400" /> Recovery Mode
            </a>
            <a href="#matrix" className="hover:text-white transition-colors">
              Comparison
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/auth"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800/60 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth?mode=signup"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:scale-[1.03] transition-all"
            >
              Start Forging
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Interactive 3D Canvas */}
      <section id="3d-core" className="relative pt-8 sm:pt-14 pb-16 sm:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Hero Content: High-Impact, Visual, Minimal Text */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Next-Gen 3D Adaptive Execution Platform</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
                Turn Ambition Into{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  Unstoppable 3D Momentum
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
                Traditional trackers break when life gets busy. GoalForge AI turns big ambitions into daily capacity-aware roadmaps — and{" "}
                <span className="text-emerald-400 font-semibold">reorganizes smoothly</span> when plans slip.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/auth?mode=signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 text-white shadow-xl shadow-indigo-600/30 hover:scale-[1.03] transition-all"
                >
                  <span>Launch GoalForge Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all hover:border-indigo-500/50"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  <span>Explore Live Dashboard</span>
                </Link>
              </div>

              {/* Floating Metric Badges */}
              <div className="grid grid-cols-3 gap-2.5 pt-4 max-w-lg mx-auto lg:mx-0">
                <div className="glass-card p-3 rounded-xl border border-white/5 text-center">
                  <span className="text-base sm:text-xl font-extrabold text-emerald-400 font-mono">0%</span>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Broken Streak Guilt</p>
                </div>
                <div className="glass-card p-3 rounded-xl border border-white/5 text-center">
                  <span className="text-base sm:text-xl font-extrabold text-indigo-400 font-mono">45m</span>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Daily Workload Cap</p>
                </div>
                <div className="glass-card p-3 rounded-xl border border-white/5 text-center">
                  <span className="text-base sm:text-xl font-extrabold text-amber-400 font-mono">89%</span>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Recovery Retention</p>
                </div>
              </div>
            </div>

            {/* Right Hero: The Interactive 3D WebGL Canvas Scene */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="w-full relative rounded-3xl overflow-hidden glass-card border border-indigo-500/30 shadow-2xl bg-gradient-to-b from-indigo-950/20 via-slate-950/60 to-slate-950/80">
                {/* 3D Scene */}
                <GoalForgeScene />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Interactive Bento Grid: 4 Core Features */}
      <section id="bento-features" className="py-20 relative border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Visual Architecture
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-3 tracking-tight">
              Four Adaptive Execution Pillars
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Engineered for continuous momentum and real-world human schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Bento Card 1: AI Goal & Roadmap Builder (Span 7) */}
            <div className="md:col-span-7 glass-card glass-card-hover p-6 sm:p-7 rounded-3xl relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/20">
                  Pillar 01 • Builder
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white">AI Goal & Roadmap Generator</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  Convert natural ambitions into milestone sequences with minute estimates and verified user approval before activation.
                </p>
              </div>

              {/* Interactive Roadmap Mini-Widget */}
              <div className="mt-5 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Active Blueprint: AWS Solutions Architect</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Plan v1.0 Approved</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">1. VPC Hub-and-Spoke Architecture</span>
                    <span className="text-emerald-400 font-mono">✓ Done</span>
                  </div>
                  <div className="p-2 rounded-lg bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between text-indigo-300 font-semibold">
                    <span>2. IAM Attribute-Based Role Delegation</span>
                    <span className="font-mono">Today (30m)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Daily Execution Hub (Span 5) */}
            <div className="md:col-span-5 glass-card glass-card-hover p-6 sm:p-7 rounded-3xl relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Pillar 02 • Daily Focus
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white">Daily Execution & Focus Sprints</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Bite-sized daily checklists capped to your declared time budget with built-in focus timers.
                </p>
              </div>

              {/* Interactive Click-to-Complete Demo */}
              <div
                onClick={() => {
                  setCompletedDemoTask(!completedDemoTask);
                  if (!completedDemoTask) triggerConfetti();
                }}
                className={`mt-5 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  completedDemoTask
                    ? "bg-emerald-950/40 border-emerald-500/60"
                    : "bg-slate-950/80 border-slate-800 hover:border-indigo-500/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        completedDemoTask
                          ? "bg-emerald-500 border-emerald-500 text-slate-950"
                          : "border-slate-600"
                      }`}
                    >
                      {completedDemoTask && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-xs font-semibold ${completedDemoTask ? "line-through text-slate-400" : "text-white"}`}>
                      Complete 25m Deep Work Sprint
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">
                    {completedDemoTask ? "Celebrated! 🎉" : "Click to Try"}
                  </span>
                </div>
              </div>
            </div>

            {/* Bento Card 3: Goal Recovery Mode (Span 6) - Core Differentiator */}
            <div id="recovery" className="md:col-span-6 glass-card glass-card-hover p-6 sm:p-7 rounded-3xl relative overflow-hidden flex flex-col justify-between border-amber-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/20 font-bold">
                  Signature Differentiator
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white">Adaptive Goal Recovery Engine</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Did you miss 2 days due to unexpected emergencies? Rebalance future work across a 7-day ramp without red streaks or shame.
                </p>
              </div>

              {/* Interactive Recovery Simulator */}
              <div className="mt-5 p-3.5 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-300 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> 2 Overdue Tasks Detected (60m)
                  </span>
                  <button
                    type="button"
                    onClick={() => setRecoveryActive(!recoveryActive)}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
                  >
                    {recoveryActive ? "Reset" : "Preview Recovery"}
                  </button>
                </div>

                {recoveryActive && (
                  <div className="text-[11px] font-mono bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-slate-300 space-y-1 animate-fadeIn">
                    <p className="text-emerald-400 font-semibold">✓ Rescheduled: Task #1 -&gt; Tomorrow (30m)</p>
                    <p className="text-emerald-400 font-semibold">✓ Rescheduled: Task #2 -&gt; Friday (30m)</p>
                    <p className="text-slate-400">✓ Deadline protected • Daily load stays capped at 45m</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bento Card 4: AI Coach & Feasibility Insights (Span 6) */}
            <div className="md:col-span-6 glass-card glass-card-hover p-6 sm:p-7 rounded-3xl relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center">
                  <Brain className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono uppercase bg-teal-500/10 text-teal-300 px-2.5 py-1 rounded-full border border-teal-500/20">
                  Pillar 04 • Intelligence
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white">AI Coach & Feasibility Analytics</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Real-time workload vs weekly capacity verification, risk bands, and actionable next steps anchored in your recorded progress.
                </p>
              </div>

              {/* Coach Insight Preview */}
              <div className="mt-5 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs">
                  AI
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-white">Coach Recommendation:</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    &quot;Only have 20 minutes today? Complete subtask 2.1 to preserve momentum. Save the 45m architecture lab for Saturday.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Contrast Matrix: Why Traditional Trackers Fail */}
      <section id="matrix" className="py-20 bg-slate-950/60 border-t border-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              The Slippage Moment
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              How GoalForge AI handles the exact moment when life gets unpredictable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional Trackers */}
            <div className="p-6 rounded-3xl bg-rose-950/10 border border-rose-500/30 space-y-4">
              <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Traditional Habit & Goal Trackers</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-rose-400">✕</span> Streak broken notification creates psychological guilt.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400">✕</span> Rigid calendars collapse when overtime or illness hits.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400">✕</span> Overdue tasks stack into an overwhelming mountain.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400">✕</span> 82% of users quit within 3 weeks of starting.
                </li>
              </ul>
            </div>

            {/* GoalForge AI */}
            <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-500/40 space-y-4 neon-border-emerald">
              <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>GoalForge AI Adaptive Engine</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Zero guilt: slip is treated as an input to adapt.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> 7-day recovery ramp redistributes work safely.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Capped daily workload protects against burnout.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> 89% of users resume and hit their milestone.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Cinematic Bottom Call-to-Action */}
      <section className="py-24 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-[#070a12] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 p-0.5 mx-auto shadow-2xl shadow-indigo-500/40">
            <div className="w-full h-full bg-[#070a12] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-emerald-400 animate-pulse" />
            </div>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Ready to Forge Your Goal in 3D?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-normal">
            Turn your ambition into an interactive roadmap, check off daily focus tasks, and recover gracefully whenever life happens.
          </p>

          <div className="pt-2">
            <Link
              href="/auth?mode=signup"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 text-white shadow-2xl shadow-indigo-600/40 hover:scale-[1.04] transition-all"
            >
              Start Forging Free Today
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#070a12] py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-slate-300">GoalForge AI</span>
            <span>— 3D Adaptive Goal Engine</span>
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
