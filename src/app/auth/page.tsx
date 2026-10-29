"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import {
  Target,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  Lock
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
  const rawCallbackUrl = searchParams.get("callbackUrl");
  const callbackUrl =
    rawCallbackUrl && !rawCallbackUrl.includes("/auth")
      ? rawCallbackUrl
      : "/dashboard";

  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const authError = searchParams.get("error");

  React.useEffect(() => {
    if (authError) {
      if (authError === "OAuthSignin") {
        setErrorMsg("Google OAuth configuration error. Please verify Google Cloud Console configuration and network connectivity.");
      } else if (authError === "OAuthCallback") {
        setErrorMsg("Google redirect mismatch. Please ensure 'http://localhost:3000/api/auth/callback/google' is added under Authorized redirect URIs in Google Cloud Console.");
      } else if (authError === "AccessDenied") {
        setErrorMsg("Access denied by user during Google consent.");
      } else {
        setErrorMsg(`Authentication error (${authError}). Please try again.`);
      }
    }
  }, [authError]);

  // If already authenticated via real Google session, redirect to dashboard
  React.useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.replace(callbackUrl);
    }
  }, [status, session, callbackUrl, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      await signIn("google", {
        callbackUrl,
      });
    } catch {
      setErrorMsg("Failed to initialize Google OAuth. Please check your network connection.");
      setIsLoading(false);
    }
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
          Back to GoalForge AI
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-xl shadow-indigo-500/30">
            <div className="w-full h-full bg-[#070a12] rounded-[14px] flex items-center justify-center">
              <Target className="w-6 h-6 text-indigo-400 group-hover:text-emerald-400 transition-colors" />
            </div>
          </div>
        </Link>
        <h2 className="mt-4 text-2xl font-black tracking-tight text-white">
          Sign In to GoalForge AI
        </h2>
        <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
          Authenticate with your Google account to access your adaptive goal roadmap and execution dashboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card py-9 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white/10 backdrop-blur-xl space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Pure Google OAuth Button */}
          <div className="space-y-4">
            <button
              type="button"
              disabled={isLoading || status === "loading"}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-4 px-5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl transition-all hover:scale-[1.02] disabled:opacity-50 group cursor-pointer"
            >
              {isLoading || status === "loading" ? (
                <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              <span>
                {isLoading || status === "loading"
                  ? "Redirecting to Google..."
                  : "Continue with Google"}
              </span>
              <ArrowRight className="w-4 h-4 ml-auto text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Single-Click Verified OAuth 2.0</span>
              </div>
              <p className="text-slate-500 text-[10px] leading-relaxed">
                Your profile, email, and preferences are securely encrypted and saved with your verified account.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-center text-[10px] text-slate-500 space-y-1">
            <p>Protected by Google OAuth & Secure Session Authentication.</p>
            <p>Without authentication, access to the dashboard is strictly forbidden.</p>
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
          Loading GoalForge Authentication...
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
