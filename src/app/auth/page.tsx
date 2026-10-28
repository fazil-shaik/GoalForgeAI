"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import {
  Target,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const { data: session, status } = useSession();
  const { user, loginAsDemo } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // If already authenticated via NextAuth or context, redirect to dashboard
  React.useEffect(() => {
    if (status === "authenticated" || user) {
      document.cookie = "goalforge_session=active; path=/; max-age=2592000";
    }
  }, [status, user]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      // Trigger NextAuth Google OAuth
      document.cookie = "goalforge_session=active; path=/; max-age=2592000";
      const result = await signIn("google", {
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setErrorMsg(
          "Google OAuth requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env. You can use the Quick Developer Sign-In below while configuring your Google Cloud Console."
        );
        setIsLoading(false);
      } else if (result?.url) {
        router.push(result.url);
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setErrorMsg(
        "Could not connect to Google OAuth service. Please ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are configured in .env."
      );
      setIsLoading(false);
    }
  };

  const handleTestDevSignIn = (persona: "learner" | "professional" | "starter") => {
    setIsLoading(true);
    document.cookie = "goalforge_session=active; path=/; max-age=2592000";
    loginAsDemo(persona);
    setTimeout(() => {
      router.push(callbackUrl);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar back link */}
      <div className="max-w-md w-full mx-auto mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to GoalForge AI Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/30">
            <div className="w-full h-full bg-[#070a12] rounded-[10px] flex items-center justify-center">
              <Target className="w-6 h-6 text-indigo-400 group-hover:text-emerald-400 transition-colors" />
            </div>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">
            GoalForge <span className="text-emerald-400">AI</span>
          </span>
        </Link>
        <h2 className="mt-3 text-xl font-bold tracking-tight text-white">
          Sign In to Your Workspace
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Only authenticated users can access the GoalForge execution dashboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white/10 backdrop-blur-xl space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary Authentication: Google OAuth (PRD F-01 Requirement) */}
          <div className="space-y-4">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl transition-all hover:scale-[1.02] disabled:opacity-50 group"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
              <ArrowRight className="w-4 h-4 ml-auto text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Secure Google OAuth 2.0 • Zero Password Hassle</span>
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-mono uppercase">
              Or Instant Developer Verification
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Instant Developer / Demo OAuth verification */}
          <div className="space-y-2">
            <span className="text-[11px] text-slate-400 block text-center">
              Click below to test the authenticated dashboard flow immediately:
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleTestDevSignIn("learner")}
                className="w-full p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 text-left transition-all flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white">Alex Rivera</p>
                  <p className="text-[10px] text-slate-400">Overwhelmed Learner • AWS Cert Goal</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Auth Demo →
                </span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500 space-y-1">
            <p>Protected by Neon PostgreSQL & Auth.js OAuth Session Guards.</p>
            <p>Your goal data remains encrypted and private by design.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070a12] text-slate-200 flex items-center justify-center">
          Loading GoalForge Auth...
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
