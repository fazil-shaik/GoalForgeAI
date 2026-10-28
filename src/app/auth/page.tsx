"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth, DEMO_PERSONAS } from "@/context/AuthContext";
import {
  Target,
  ArrowRight,
  Shield,
  Sparkles,
  Lock,
  Mail,
  User,
  Clock,
  HeartHandshake,
  CheckCircle2,
  Zap,
  ArrowLeft
} from "lucide-react";
import { CoachingStyle } from "@/types/auth";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";

  const { login, signup, loginAsDemo } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [availableMinutes, setAvailableMinutes] = useState<number>(45);
  const [coachingStyle, setCoachingStyle] = useState<CoachingStyle>("compassionate");
  const [category, setCategory] = useState("Software Engineering & Tech");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleDemoSelect = (key: "learner" | "professional" | "starter") => {
    loginAsDemo(key);
    router.push("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        if (!email) {
          setErrorMsg("Please enter your email");
          setIsSubmitting(false);
          return;
        }
        await login(email, password);
      } else {
        if (!name || !email) {
          setErrorMsg("Please provide your name and email");
          setIsSubmitting(false);
          return;
        }
        await signup(name, email, password, {
          availableMinutesPerDay: availableMinutes,
          coachingStyle,
          primaryCategory: category,
        });
      }
      router.push("/dashboard");
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[250px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Bar back link */}
      <div className="max-w-md w-full mx-auto mb-6 px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to GoalForge AI Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Target className="w-6 h-6 text-indigo-400 group-hover:text-emerald-400 transition-colors" />
            </div>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">
            GoalForge <span className="text-emerald-400">AI</span>
          </span>
        </Link>
        <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-200">
          {mode === "signin" ? "Sign in to your GoalForge workspace" : "Create your GoalForge profile"}
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Turn your goals into adaptive daily momentum without broken streaks.
        </p>
      </div>

      {/* Quick Demo Persona Quick-Logins */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-indigo-500/20 shadow-xl mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Instant 1-Click Persona Demos
            </span>
            <span className="text-[11px] text-slate-400">No password required</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handleDemoSelect("learner")}
              className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white group-hover:text-indigo-300">Alex Rivera</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">45m/d</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">The Overwhelmed Learner (AWS & AI Roadmap)</p>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSelect("professional")}
              className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500 hover:bg-slate-800/60 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white group-hover:text-emerald-300">Sarah Chen</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">30m/d</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">Busy Professional (Q4 Product Launch)</p>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSelect("starter")}
              className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500 hover:bg-slate-800/60 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white group-hover:text-amber-300">Marcus Vance</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">60m/d</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">Inconsistent Starter (Marathon & Habits)</p>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-800">
          {/* Tabs */}
          <div className="flex rounded-xl bg-slate-950 p-1 mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => { setMode("signin"); setErrorMsg(""); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === "signin"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setErrorMsg(""); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jordan Miller"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Signup Personalization preferences (P0 MVP Requirement F-01 & F-02) */}
            {mode === "signup" && (
              <div className="pt-2 border-t border-slate-800 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" /> Daily Available Minutes
                    </label>
                    <span className="text-xs font-bold text-indigo-400">{availableMinutes} min/day</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 30, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setAvailableMinutes(mins)}
                        className={`py-1.5 text-xs rounded-lg border font-medium transition-all ${
                          availableMinutes === mins
                            ? "bg-indigo-600/30 border-indigo-500 text-white"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" /> Preferred Coaching Style
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "compassionate", label: "Compassionate", sub: "Gentle recovery" },
                      { key: "direct", label: "Direct", sub: "Action-first" },
                      { key: "analytical", label: "Analytical", sub: "Metrics & risk" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setCoachingStyle(item.key as CoachingStyle)}
                        className={`p-2 text-left rounded-lg border transition-all ${
                          coachingStyle === item.key
                            ? "bg-emerald-950/30 border-emerald-500/50 text-white"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <p className="text-xs font-semibold">{item.label}</p>
                        <p className="text-[10px] text-slate-500">{item.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Loading...</span>
              ) : (
                <>
                  <span>{mode === "signin" ? "Sign In & Open Dashboard" : "Create Account & Start Planning"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              By proceeding, you agree to GoalForge AI&apos;s privacy-first design: your ambitions remain private and plans are never modified without approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">Loading GoalForge Auth...</div>}>
      <AuthContent />
    </Suspense>
  );
}
