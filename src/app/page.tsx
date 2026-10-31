"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import {
  Target,
  Sparkles,
  RotateCcw,
  Clock,
  CheckCircle2,
  Brain,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Flame,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
  HeartHandshake,
  Menu,
  X,
} from "lucide-react";
import { AmbientBackground } from "@/components/landing/AmbientBackground";
import { InteractiveProductShowcase } from "@/components/landing/InteractiveProductShowcase";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoggedIn = status === "authenticated" || isAuthenticated || Boolean((session as any)?.user);

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-x-hidden w-full max-w-full">
      {/* Dynamic Animated Ambient Background */}
      <AmbientBackground />

      {/* Atmospheric Glow Blurs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-120px] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-120px] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Floating Glassmorphic Top Navbar */}
      <header className="sticky top-2 sm:top-3 z-50 max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 w-full">
        <div className="glass-card rounded-2xl px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between shadow-2xl border border-white/10 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full bg-[#070a12] rounded-[6px] sm:rounded-[10px] flex items-center justify-center">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 group-hover:text-emerald-400 transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent whitespace-nowrap">
                GoalForge <span className="text-emerald-400 font-black">AI</span>
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-widest text-slate-400 -mt-1 font-mono font-semibold whitespace-nowrap">
                Adaptive Goal Platform
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#demo" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Interactive Tour
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Core Pillars
            </a>
            <a href="#recovery" className="hover:text-amber-400 transition-colors flex items-center gap-1 text-amber-300">
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Goal Recovery Mode
            </a>
            <a href="#comparison" className="hover:text-white transition-colors">
              Why Trackers Fail
            </a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden md:inline-flex text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-slate-800/60 transition-colors whitespace-nowrap"
                >
                  {session?.user?.name?.split(" ")[0] || user?.name?.split(" ")[0] || "Dashboard"}
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 hover:scale-[1.03] transition-all whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Open Dashboard</span>
                  <span className="inline sm:hidden">Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="text-xs font-semibold text-slate-300 hover:text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl hover:bg-slate-800/60 transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth?mode=signup"
                  className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-bold bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 hover:scale-[1.03] transition-all whitespace-nowrap shrink-0"
                >
                  <span className="hidden sm:inline">Start Forging Free</span>
                  <span className="inline sm:hidden">Start Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}

            {/* Mobile / Tablet Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 p-4 rounded-2xl glass-card border border-white/10 shadow-2xl backdrop-blur-2xl animate-fadeIn space-y-3">
            <nav className="flex flex-col gap-2 text-xs font-semibold text-slate-300">
              <a
                href="#demo"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-white/5 flex items-center gap-2 hover:text-white transition-colors"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" /> Interactive Product Tour
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-white/5 flex items-center gap-2 hover:text-white transition-colors"
              >
                <Target className="w-4 h-4 text-emerald-400" /> Core Execution Pillars
              </a>
              <a
                href="#recovery"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-white/5 flex items-center gap-2 text-amber-300 hover:text-amber-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" /> Goal Recovery Mode
              </a>
              <a
                href="#comparison"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-white/5 flex items-center gap-2 hover:text-white transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-teal-400" /> Why Rigid Trackers Fail
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-16 pb-12 sm:pb-20 overflow-hidden z-10">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 text-center space-y-5 sm:space-y-6">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/40 text-indigo-300 text-[11px] sm:text-xs font-semibold backdrop-blur-md shadow-lg shadow-indigo-500/10 max-w-full">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
            <span className="truncate">Turn Ambitions Into Realistic Plans — Not Broken Streaks</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.12] sm:leading-[1.08] max-w-4xl mx-auto">
            Achieve Your Biggest Goals{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent block sm:inline mt-1 sm:mt-0">
              Without Burnout or Guilt.
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto px-2">
            Most goal trackers fail the moment life gets unpredictable. GoalForge AI breaks your ambitions into capacity-aware daily milestones and{" "}
            <span className="text-emerald-400 font-semibold">recovers your momentum</span> when life gets in the way.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto px-2 sm:px-0 pt-2">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 text-slate-950 shadow-xl shadow-emerald-500/30 hover:scale-[1.03] transition-all"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/auth?mode=signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 text-white shadow-xl shadow-indigo-600/30 hover:scale-[1.03] transition-all"
              >
                <span>Start Forging Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <a
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all hover:border-indigo-500/50"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Try Interactive Tour</span>
            </a>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-4 sm:pt-6 max-w-3xl mx-auto px-1 sm:px-0">
            <div className="glass-card p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/5 text-center">
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">0%</span>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">Broken Streak Guilt</p>
            </div>
            <div className="glass-card p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/5 text-center">
              <span className="text-xl sm:text-2xl font-black text-indigo-400 font-mono">45m</span>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">Daily Workload Cap</p>
            </div>
            <div className="glass-card p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/5 text-center">
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">89%</span>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">Recovery Retention</p>
            </div>
            <div className="glass-card p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/5 text-center">
              <span className="text-xl sm:text-2xl font-black text-teal-400 font-mono">100%</span>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">User-Approved Plans</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Product Tour */}
      <section id="demo" className="py-12 sm:py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Interactive Walkthrough
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-2 tracking-tight">
              See How GoalForge AI Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Test drive the 4 core steps: Goal Builder, Daily Execution, Goal Recovery, and the AI Coach.
            </p>
          </div>

          <InteractiveProductShowcase />
        </div>
      </section>

      {/* Four Core Execution Pillars (Bento Grid) */}
      <section id="features" className="py-20 relative border-t border-slate-900 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Engineered For Follow-Through
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-3 tracking-tight">
              Built to Help You Actually Finish
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Every feature solves a specific failure point where users normally abandon goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="glass-card glass-card-hover p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">1. AI Goal & Roadmap Builder</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Type what you want to achieve in plain English. GoalForge decomposes your ambition into ordered milestones, time estimates, and dependencies.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-white/5 text-[11px] text-indigo-300 font-mono">
                ✓ Requires explicit user approval
              </div>
            </div>

            {/* Feature 2 */}
            <div className="glass-card glass-card-hover p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">2. Daily Execution Hub</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Clear daily focus queue strictly matching your declared time budget. Check off tasks, track actual minutes, and launch focus sprint timers.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-white/5 text-[11px] text-emerald-300 font-mono">
                ✓ 45 min/day workload ceiling
              </div>
            </div>

            {/* Feature 3: Core Differentiator */}
            <div id="recovery" className="glass-card glass-card-hover p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between group border-amber-500/30 neon-border-amber">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                    Signature Differentiator
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">3. Goal Recovery Mode</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When life happens and tasks slip, GoalForge diagnoses the blocker and creates a gentle 7-day recovery ramp. No broken streaks. No guilt.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-white/5 text-[11px] text-amber-300 font-mono">
                ✓ Preserves all past history
              </div>
            </div>

            {/* Feature 4 */}
            <div className="glass-card glass-card-hover p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">4. AI Coach & Feasibility</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time workload vs weekly capacity analysis, risk band indicators, blocker breakdowns, and actionable next-step coaching.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-white/5 text-[11px] text-teal-300 font-mono">
                ✓ Grounded in real data only
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Slippage Moment: Why Traditional Trackers Fail */}
      <section id="comparison" className="py-20 bg-slate-950/60 border-t border-slate-900 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Why Traditional Goal Apps Fail
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              The difference between quitting after 2 weeks and successfully finishing your goal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional Trackers */}
            <div className="p-6 sm:p-8 rounded-3xl bg-rose-950/15 border border-rose-500/30 space-y-4">
              <div className="flex items-center gap-2.5 text-rose-400 font-bold text-base">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>Traditional Rigid Goal Trackers</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                They assume you are a robot with unlimited energy. When overtime, sickness, or family events happen, the app penalizes you.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span> Red alerts and &quot;Streak Broken!&quot; shaming create defeatism.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span> Missed tasks pile up into an impossible 120-minute backlog.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span> No way to recover without starting over from scratch.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span> <strong>82% of users abandon the goal within 21 days.</strong>
                </li>
              </ul>
            </div>

            {/* GoalForge AI */}
            <div className="p-6 sm:p-8 rounded-3xl bg-emerald-950/20 border border-emerald-500/40 space-y-4 neon-border-emerald">
              <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>GoalForge AI Adaptive Engine</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                We treat life interruptions as normal data inputs. We diagnose the obstacle with compassion and recalculate a manageable restart.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-200 pt-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> Zero guilt: gentle 7-day ramp redistributes work across days.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> Protects your daily 45m cap so you never burn out in one evening.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> All past achievements and completed milestones stay intact.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> <strong>89% of users recover momentum and complete their goal.</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works (3 Steps) */}
      <section className="py-20 border-t border-slate-900 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Simple Execution Loop
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 tracking-tight">
              Three Steps to Goal Completion
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-3xl border border-white/5 relative">
              <span className="text-4xl font-black text-slate-800 absolute top-5 right-5 font-mono">01</span>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">Define Your Ambition</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tell GoalForge what you want to achieve, your deadline, and your daily available minutes.
              </p>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-white/5 relative">
              <span className="text-4xl font-black text-slate-800 absolute top-5 right-5 font-mono">02</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">Approve Your Custom Roadmap</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review the AI-generated milestones, edit tasks, check capacity buffers, and activate your plan.
              </p>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-white/5 relative">
              <span className="text-4xl font-black text-slate-800 absolute top-5 right-5 font-mono">03</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">Execute & Adapt Gracefully</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Check off daily tasks in 45-minute sprints. If life slips, trigger Goal Recovery to stay on track.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cinematic Final CTA */}
      <section className="py-24 relative overflow-hidden text-center z-10">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 p-0.5 mx-auto shadow-2xl shadow-indigo-500/40">
            <div className="w-full h-full bg-[#070a12] rounded-[14px] flex items-center justify-center">
              <Target className="w-7 h-7 text-emerald-400 animate-pulse" />
            </div>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Stop Abandoning Goals. Start Forging Results.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-normal">
            Join users turning vague ambitions into realistic, daily actionable milestones without broken-streak anxiety.
          </p>

          <div className="pt-2">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 text-slate-950 shadow-2xl shadow-emerald-500/40 hover:scale-[1.04] transition-all"
              >
                Go to Your Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/auth?mode=signup"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 text-white shadow-2xl shadow-indigo-600/40 hover:scale-[1.04] transition-all"
              >
                Start Forging Free Today
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#070a12] py-10 text-xs text-slate-500 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <Target className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="font-bold text-slate-300">GoalForge AI</span>
            <span className="hidden xs:inline text-slate-500">•</span>
            <span className="text-slate-400">Adaptive Goal Achievement Platform</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
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
