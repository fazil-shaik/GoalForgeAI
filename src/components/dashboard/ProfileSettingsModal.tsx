"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGoal } from "@/context/GoalContext";
import { CoachingStyle } from "@/types/auth";
import { PushManagerHelper, PushPermissionStatus } from "@/lib/pushManager";
import {
  X,
  User,
  Shield,
  ShieldCheck,
  Lock,
  Globe,
  Clock,
  Sparkles,
  Share2,
  Check,
  AlertCircle,
  Brain,
  Zap,
  Heart,
  Flame,
  Save,
  CheckCircle2,
  Trophy,
  Target,
  ExternalLink,
  Bell,
  BellRing,
  BellOff,
  Send,
} from "lucide-react";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShare?: (mode?: "kickoff" | "streak" | "victory") => void;
  defaultTab?: "general" | "privacy" | "completed" | "coaching" | "social" | "notifications";
}

const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

const FOCUS_CATEGORIES = [
  "Software Engineering & Cloud",
  "Machine Learning & AI",
  "Productivity & Habits",
  "Startup & Entrepreneurship",
  "Fitness & Physical Health",
  "Academic & Deep Research",
  "Career & Executive Leadership",
];

export function ProfileSettingsModal({
  isOpen,
  onClose,
  onOpenShare,
  defaultTab = "general",
}: ProfileSettingsModalProps) {
  const { user, updateProfile } = useAuth();
  const { completedGoals, hardGoalsCompletedCount, unlockedMedalsCount } = useGoal();

  const [activeTab, setActiveTab] = useState<
    "general" | "privacy" | "completed" | "coaching" | "social" | "notifications"
  >(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, isOpen]);

  // Form State
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [timezone, setTimezone] = useState("UTC");
  const [dailyMinutes, setDailyMinutes] = useState(45);
  const [coachingStyle, setCoachingStyle] = useState<CoachingStyle>("compassionate");
  const [primaryCategory, setPrimaryCategory] = useState("Software Engineering & Cloud");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Push Notification State
  const [pushEnabled, setPushEnabled] = useState(false);
  const [dailyBriefingTime, setDailyBriefingTime] = useState("09:00");
  const [dailyBriefingEnabled, setDailyBriefingEnabled] = useState(true);
  const [streakRemindersEnabled, setStreakRemindersEnabled] = useState(true);
  const [pushPermission, setPushPermission] = useState<PushPermissionStatus>("default");
  const [isSubscribingPush, setIsSubscribingPush] = useState(false);
  const [isSendingTestPush, setIsSendingTestPush] = useState(false);
  const [testPushFeedback, setTestPushFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state with current user profile
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || (user.preferences as any)?.bio || "");
      setAvatarUrl(user.avatarUrl || "");
      setIsPublic(user.isPublic ?? (user.preferences as any)?.isPublic ?? true);
      setTimezone(user.preferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
      setDailyMinutes(user.preferences?.availableMinutesPerDay || 45);
      setCoachingStyle(user.preferences?.coachingStyle || "compassionate");
      setPrimaryCategory(user.preferences?.primaryCategory || "Software Engineering & Cloud");
      setTwitterHandle((user.preferences as any)?.twitterHandle || "");
      setLinkedinUrl((user.preferences as any)?.linkedinUrl || "");

      const prefs = user.preferences as any;
      setPushEnabled(Boolean(prefs?.pushNotificationsEnabled));
      setDailyBriefingTime(prefs?.dailyBriefingTime || "09:00");
      setDailyBriefingEnabled(prefs?.dailyBriefingEnabled !== false);
      setStreakRemindersEnabled(prefs?.streakRemindersEnabled !== false);
    }

    if (typeof window !== "undefined") {
      setPushPermission(PushManagerHelper.getPermission());
      PushManagerHelper.getExistingSubscription().then((sub) => {
        if (sub) {
          setPushEnabled(true);
        }
      });
    }
  }, [user, isOpen]);

  const handleTogglePush = async () => {
    setIsSubscribingPush(true);
    setTestPushFeedback(null);
    try {
      if (!pushEnabled) {
        const res = await PushManagerHelper.subscribe();
        if (res.success) {
          setPushEnabled(true);
          setPushPermission("granted");
          setTestPushFeedback({
            success: true,
            message: "Push notifications successfully enabled on this browser!",
          });
        } else {
          setPushPermission(PushManagerHelper.getPermission());
          setTestPushFeedback({
            success: false,
            message: res.message || "Could not enable push notifications.",
          });
        }
      } else {
        const res = await PushManagerHelper.unsubscribe();
        if (res.success) {
          setPushEnabled(false);
          setTestPushFeedback({
            success: true,
            message: "Push notifications disabled on this device.",
          });
        }
      }
    } finally {
      setIsSubscribingPush(false);
    }
  };

  const handleSendTestPush = async () => {
    setIsSendingTestPush(true);
    setTestPushFeedback(null);
    try {
      const res = await PushManagerHelper.sendTestPush();
      setTestPushFeedback(res);
    } catch {
      setTestPushFeedback({
        success: false,
        message: "Failed to communicate with notification service.",
      });
    } finally {
      setIsSendingTestPush(false);
    }
  };

  if (!isOpen) return null;

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const success = await updateProfile({
        name: name.trim() || user?.name || "GoalForge Explorer",
        bio: bio.trim(),
        image: avatarUrl.trim() || undefined,
        isPublic: isPublic,
        timezone: timezone,
        preferences: {
          timezone: timezone,
          availableMinutesPerDay: Number(dailyMinutes),
          coachingStyle: coachingStyle,
          primaryCategory: primaryCategory,
          isPublic: isPublic,
          bio: bio.trim(),
          twitterHandle: twitterHandle.trim().replace(/^@/, ""),
          linkedinUrl: linkedinUrl.trim(),
          pushNotificationsEnabled: pushEnabled,
          dailyBriefingTime: dailyBriefingTime,
          dailyBriefingEnabled: dailyBriefingEnabled,
          streakRemindersEnabled: streakRemindersEnabled,
        },
      });

      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMessage("Failed to save changes. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900/95 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden text-slate-100">
        {/* Specular sheen */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between px-6 py-5 border-b border-white/10 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Profile & Privacy Settings
                {isPublic ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <Globe className="w-3 h-3" /> Public
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <Lock className="w-3 h-3" /> Private
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Manage your identity, leaderboard visibility, and execution pacing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 pt-3 border-b border-white/10 gap-2 overflow-x-auto bg-slate-900/50">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${activeTab === "general"
              ? "border-indigo-400 text-indigo-300 bg-indigo-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
          >
            <User className="w-3.5 h-3.5" /> General
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("privacy")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${activeTab === "privacy"
              ? "border-emerald-400 text-emerald-300 bg-emerald-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
          >
            <Shield className="w-3.5 h-3.5" /> Privacy & Leaderboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("completed")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${activeTab === "completed"
              ? "border-amber-400 text-amber-300 bg-amber-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Completed Goals ({completedGoals.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("coaching")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${activeTab === "coaching"
              ? "border-amber-400 text-amber-300 bg-amber-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
          >
            <Brain className="w-3.5 h-3.5" /> Capacity & AI Coach
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("social")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${activeTab === "social"
              ? "border-cyan-400 text-cyan-300 bg-cyan-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
          >
            <Share2 className="w-3.5 h-3.5" /> Social & Handles
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("notifications")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${activeTab === "notifications"
              ? "border-amber-400 text-amber-300 bg-amber-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
          >
            <Bell className="w-3.5 h-3.5" /> Notifications
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {/* TAB 1: GENERAL */}
          {activeTab === "general" && (
            <div className="space-y-4">
              {/* Quick Achievements Snapshot */}
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-950/60 border border-white/5">
                <button
                  type="button"
                  onClick={() => setActiveTab("completed")}
                  className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-center transition-colors cursor-pointer border border-white/5"
                  title="Click to view all completed goals"
                >
                  <p className="text-lg font-black text-amber-300 font-mono">{completedGoals.length}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Conquered Goals</p>
                </button>
                <div className="p-2 rounded-xl bg-slate-900/60 text-center border border-white/5">
                  <p className="text-lg font-black text-indigo-300 font-mono">{hardGoalsCompletedCount}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Hard Goals</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/60 text-center border border-white/5">
                  <p className="text-lg font-black text-yellow-300 font-mono">{unlockedMedalsCount}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Medals Earned</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400 placeholder:text-slate-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Bio / Headline
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short headline about your goals, role, or focus areas (e.g. 'Full-Stack Developer building AI products & grinding 100 days of code')"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400 placeholder:text-slate-600 transition-colors resize-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Shown on your public profile and on the Leaderboard when public.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Avatar Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400 placeholder:text-slate-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400"
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Used for daily streak calculations and schedule notifications.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY & LEADERBOARD */}
          {activeTab === "privacy" && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isPublic
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                    >
                      {isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {isPublic ? "Public Profile & Leaderboard" : "Private (Masked Identity)"}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {isPublic
                          ? "Your real name, avatar, and achievements are visible to other achievers."
                          : "You still compete on the leaderboard, but appear as 'Anonymous Achiever'."}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setIsPublic(!isPublic)}
                    className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors cursor-pointer border ${isPublic
                      ? "bg-emerald-600/80 border-emerald-500 justify-end"
                      : "bg-slate-800 border-slate-700 justify-start"
                      }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${isPublic ? "translate-x-0" : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>
              </div>

              {/* Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div
                  onClick={() => setIsPublic(true)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${isPublic
                    ? "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                    : "bg-slate-950/40 border-white/5 hover:border-white/15 opacity-60"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Globe className="w-4 h-4" /> Public Mode
                    </span>
                    {isPublic && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-semibold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Real display name on leaderboard
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Profile avatar and bio visible
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Shareable milestone achievements
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Social handles linked
                    </li>
                  </ul>
                </div>

                <div
                  onClick={() => setIsPublic(false)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${!isPublic
                    ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                    : "bg-slate-950/40 border-white/5 hover:border-white/15 opacity-60"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Lock className="w-4 h-4" /> Private Mode
                    </span>
                    {!isPublic && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono font-semibold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400" /> Displayed as "Anonymous Achiever"
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400" /> Avatar and bio masked on leaderboard
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400" /> Medals & streak rank preserved
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400" /> Complete privacy from search & public
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB: COMPLETED GOALS (HALL OF FAME) */}
          {activeTab === "completed" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900/80 to-slate-950 border border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      Conquered Goals & Hall of Fame
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {completedGoals.length} Conquered
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Completed milestones permanently enshrined on your profile.
                    </p>
                  </div>
                </div>

                {completedGoals.length > 0 && onOpenShare && (
                  <button
                    type="button"
                    onClick={() => onOpenShare("victory")}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40 transition-all cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share Hall of Fame
                  </button>
                )}
              </div>

              {completedGoals.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-950/40 border border-white/5 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 mx-auto flex items-center justify-center">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">No Completed Goals Yet</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      Once you finish your roadmap tasks and mark an active goal as completed, it will be retired from your active rotation and showcased here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {completedGoals.map((cg) => {
                    const isHard = cg.feasibilityRisk === "high_risk";
                    return (
                      <div
                        key={cg.id}
                        className={`p-4 rounded-2xl border transition-all ${isHard
                          ? "bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-slate-950 border-amber-500/30 shadow-lg shadow-amber-500/5"
                          : "bg-slate-950/60 border-white/10 hover:border-white/20"
                          }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" /> CONQUERED
                              </span>
                              {isHard && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                                  <Trophy className="w-3 h-3 text-amber-400" /> TITAN HARD GOAL
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-slate-500">
                                {cg.category}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-white pt-1">
                              {cg.title}
                            </h4>

                            <p className="text-xs text-slate-300 line-clamp-2">
                              {cg.outcome}
                            </p>
                          </div>

                          {onOpenShare && (
                            <button
                              type="button"
                              onClick={() => onOpenShare("victory")}
                              className="shrink-0 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                              title="Share this victory on X and LinkedIn"
                            >
                              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                            </button>
                          )}
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span>Target Date: {cg.deadline}</span>
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Enshrined in Profile
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CAPACITY & AI COACH */}
          {activeTab === "coaching" && (
            <div className="space-y-5">
              {/* Daily Focus Minutes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Daily Execution Capacity
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[30, 45, 60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDailyMinutes(mins)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border ${dailyMinutes === mins
                        ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30"
                        : "bg-slate-950/60 border-white/10 text-slate-400 hover:text-white hover:bg-slate-800"
                        }`}
                    >
                      {mins}m/day
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">
                  AI roadmap synthesizers pace your daily task suggestions according to this capacity.
                </p>
              </div>

              {/* Coaching Style */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  AI Coaching Style
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: "compassionate",
                      title: "Compassionate",
                      desc: "Gentle encouragement, adaptive pacing, low guilt for missed days.",
                      icon: <Heart className="w-4 h-4 text-pink-400" />,
                    },
                    {
                      id: "direct",
                      title: "Direct & Firm",
                      desc: "Clear accountability, uncompromising honesty, focused on results.",
                      icon: <Flame className="w-4 h-4 text-amber-400" />,
                    },
                    {
                      id: "analytical",
                      title: "Analytical",
                      desc: "Metric-driven, workload optimization, high efficiency breakdown.",
                      icon: <Zap className="w-4 h-4 text-cyan-400" />,
                    },
                  ].map((style) => (
                    <div
                      key={style.id}
                      onClick={() => setCoachingStyle(style.id as CoachingStyle)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${coachingStyle === style.id
                        ? "bg-indigo-600/20 border-indigo-400/80 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                        : "bg-slate-950/50 border-white/5 hover:border-white/15 opacity-70"
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {style.icon}
                        <h5 className="text-xs font-bold text-white">{style.title}</h5>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug">{style.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Primary Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Primary Domain / Focus
                </label>
                <select
                  value={primaryCategory}
                  onChange={(e) => setPrimaryCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400"
                >
                  {FOCUS_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* TAB 4: SOCIAL & HANDLES */}
          {activeTab === "social" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 fill-current text-cyan-400" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  X (formerly Twitter) Handle
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-mono">
                    @
                  </span>
                  <input
                    type="text"
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                    placeholder="username"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 placeholder:text-slate-600 transition-colors"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Tag yourself automatically in one-click milestone shares.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 fill-current text-[#0077b5]" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400 placeholder:text-slate-600 transition-colors"
                />
              </div>

              {/* Quick Launch Share Modal */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/50 to-slate-900 border border-indigo-500/20 flex items-center justify-between mt-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                    Share Milestone Progress
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Draft dynamic updates on X & LinkedIn for your active goal and streak.
                  </p>
                </div>
                {onOpenShare && (
                  <button
                    type="button"
                    onClick={() => onOpenShare("kickoff")}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    Open Share <Share2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DAILY PUSH NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-5">
              {/* Device Permission Banner if Denied */}
              {pushPermission === "denied" && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-amber-200">Push Notifications are Blocked</p>
                    <p className="text-slate-300">
                      Your browser has blocked notification permissions for GoalForge. To enable daily task briefings, please click the site settings icon in your browser address bar and allow Notifications.
                    </p>
                  </div>
                </div>
              )}

              {/* Master Device Toggle Card */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                        pushEnabled
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-slate-800 text-slate-400 border border-white/10"
                      }`}
                    >
                      {pushEnabled ? <BellRing className="w-5 h-5 animate-pulse" /> : <BellOff className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        Web Push Notifications
                        {pushEnabled && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Receive instant briefings and streak updates right on your screen.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isSubscribingPush}
                    onClick={handleTogglePush}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      pushEnabled
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                        : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
                    }`}
                  >
                    {isSubscribingPush ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : pushEnabled ? (
                      "Turn Off"
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5" /> Enable on this Device
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Preferences & Schedule Settings */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Notification Schedule & Preferences
                </h4>

                {/* Morning Task Briefing Toggle */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-white flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Daily Morning Briefing
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Receive an overview of all tasks scheduled for the day, prioritized by urgency.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={dailyBriefingEnabled}
                    onChange={(e) => setDailyBriefingEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-white/20 mt-1 cursor-pointer"
                  />
                </div>

                {/* Briefing Time Picker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-white/5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Delivery Time
                    </label>
                    <select
                      value={dailyBriefingTime}
                      disabled={!dailyBriefingEnabled}
                      onChange={(e) => setDailyBriefingTime(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 disabled:opacity-50"
                    >
                      <option value="06:00">06:00 AM (Early Riser)</option>
                      <option value="07:00">07:00 AM</option>
                      <option value="08:00">08:00 AM</option>
                      <option value="09:00">09:00 AM (Standard)</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM (Midday)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Target Timezone
                    </label>
                    <div className="w-full px-3.5 py-2 rounded-xl bg-slate-900/60 border border-white/5 text-slate-300 text-xs font-mono">
                      {timezone}
                    </div>
                  </div>
                </div>

                {/* Streak Defense Evening Alert */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-white flex items-center gap-2">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      Evening Streak Guard
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Alert you around 8:00 PM if actionable tasks are incomplete, protecting your daily streak.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={streakRemindersEnabled}
                    onChange={(e) => setStreakRemindersEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-500 focus:ring-orange-400 bg-slate-900 border-white/20 mt-1 cursor-pointer"
                  />
                </div>
              </div>

              {/* Test Notification Action */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 to-slate-900 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    Verify Push Delivery
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Dispatch an instant test notification to check browser and system sound/display permissions.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isSendingTestPush || !pushEnabled}
                  onClick={handleSendTestPush}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-600/20 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {isSendingTestPush ? (
                    <>
                      <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" /> Send Test Push
                    </>
                  )}
                </button>
              </div>

              {/* Test Push Result Alert */}
              {testPushFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                    testPushFeedback.success
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                  }`}
                >
                  {testPushFeedback.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{testPushFeedback.message}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-slate-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 text-white font-bold text-xs hover:brightness-110 shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving changes...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
