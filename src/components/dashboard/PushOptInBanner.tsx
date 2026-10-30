"use client";

import React, { useState, useEffect } from "react";
import { BellRing, CheckCircle2, X, Sparkles } from "lucide-react";
import { PushManagerHelper } from "@/lib/pushManager";

interface PushOptInBannerProps {
  onEnabled?: () => void;
}

export function PushOptInBanner({ onEnabled }: PushOptInBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if browser supports push
    if (!PushManagerHelper.isSupported()) return;

    // Check if user already dismissed banner this session
    const isDismissed = sessionStorage.getItem("gf_push_optin_dismissed");
    if (isDismissed) return;

    // Only display if permission is not yet decided ('default')
    const permission = PushManagerHelper.getPermission();
    if (permission === "default") {
      // Check if user already has an active subscription in storage
      PushManagerHelper.getExistingSubscription().then((sub) => {
        if (!sub) {
          setIsVisible(true);
        }
      });
    }
  }, []);

  const handleEnable = async () => {
    setIsSubscribing(true);
    try {
      const res = await PushManagerHelper.subscribe();
      if (res.success) {
        setSuccessMessage("Automated daily notifications activated! 🎯");
        if (onEnabled) onEnabled();
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      } else {
        // If dismissed or blocked, hide banner
        setIsVisible(false);
        sessionStorage.setItem("gf_push_optin_dismissed", "true");
      }
    } catch {
      setIsVisible(false);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("gf_push_optin_dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-slate-900 border border-amber-500/30 p-4 mb-6 shadow-xl backdrop-blur-md animate-fadeIn transition-all">
      {/* Glow highlight */}
      <span className="pointer-events-none absolute -top-12 -left-12 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0">
            {successMessage ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
            ) : (
              <BellRing className="w-5 h-5 animate-pulse" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              {successMessage ? (
                <span className="text-emerald-300">{successMessage}</span>
              ) : (
                <>
                  Never Miss a Daily Task
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Sparkles className="w-2.5 h-2.5" /> 1-Click Setup
                  </span>
                </>
              )}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              {successMessage
                ? "You will receive morning briefings at 9:00 AM and streak defense alerts."
                : "Get morning task briefings and evening streak defense alerts delivered straight to your browser."}
            </p>
          </div>
        </div>

        {!successMessage && (
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              title="Remind me later"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={isSubscribing}
              onClick={handleEnable}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubscribing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <BellRing className="w-3.5 h-3.5" /> Enable Notifications
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
