"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGoal } from "@/context/GoalContext";
import {
  X,
  Share2,
  Flame,
  Trophy,
  Target,
  Sparkles,
  Check,
  Copy,
  ExternalLink,
  MessageSquare,
  Lock,
  Globe,
} from "lucide-react";

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "kickoff" | "streak" | "victory";
}

export function SocialShareModal({
  isOpen,
  onClose,
  defaultMode = "kickoff",
}: SocialShareModalProps) {
  const { user } = useAuth();
  const { activeGoal, streak, unlockedMedalsCount, hardGoalsCompletedCount } = useGoal();

  const [shareMode, setShareMode] = useState<"kickoff" | "streak" | "victory">(defaultMode);
  const [customText, setCustomText] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setShareMode(defaultMode);
  }, [defaultMode]);

  const goalTitle = activeGoal?.title || "Mastering Complex Skills";
  const goalOutcome = activeGoal?.outcome || "Reaching milestone targets with AI roadmap synthesis";
  const goalDeadline = activeGoal?.deadline || "2026-12-31";
  const streakDays = streak?.currentStreak || 0;
  const capacityMinutes = user?.preferences?.availableMinutesPerDay || 45;
  const isPublic = user?.isPublic ?? true;

  // Generate dynamic share templates
  const templates = {
    kickoff: {
      tag: "Goal Kickoff",
      x: `🎯 Starting a new milestone on @GoalForgeAI: "${goalTitle}"!\n\nTargeting: ${goalOutcome} by ${goalDeadline} with capacity-paced daily sprints (${capacityMinutes}m/day). ⚡\n\n#GoalForge #BuildInPublic #Goals2026`,
      linkedin: `🎯 Excited to publicly commit to a new milestone on GoalForge AI: ${goalTitle}.\n\n• Target Outcome: ${goalOutcome}\n• Target Deadline: ${goalDeadline}\n• Strategy: Dynamic AI roadmap decomposition & capacity-paced daily execution (${capacityMinutes} mins/day).\n\nFollowing an adaptive execution plan to ensure consistency with zero burnout. Looking forward to sharing updates as milestones are cleared! 🚀\n\n#GoalForge #ProfessionalDevelopment #GrowthMindset #Milestones #BuildInPublic`,
    },
    streak: {
      tag: "Streak Momentum",
      x: `🔥 ${streakDays} days unbroken daily execution streak on @GoalForgeAI working towards "${goalTitle}"!\n\nZero broken-streak anxiety thanks to adaptive recovery mode. Consistency compounds. 💪\n\n#DailyHabits #Consistency #GoalForge #Momentum`,
      linkedin: `🔥 Milestone Update: Just hit a ${streakDays}-day consecutive execution streak on GoalForge AI while working towards "${goalTitle}".\n\nConsistency beats intensity when tackling ambitious engineering and professional milestones. Adaptive capacity planning has made all the difference in keeping momentum alive without burning out.\n\nWhat daily practices are keeping you in momentum this week? 👇\n\n#ContinuousImprovement #Execution #GoalForge #Leadership #Productivity`,
    },
    victory: {
      tag: "Goal Conquered",
      x: `🏆 GOAL CONQUERED! Just completed "${goalTitle}" on @GoalForgeAI and unlocked the Titan Goal Conqueror Platinum Medal! 💎\n\nRoadmap 100% resolved. Time for the next summit. 🏔️\n\n#Achievement #GoalForge #HardGoalConquered`,
      linkedin: `🏆 Milestone Achieved: I'm thrilled to announce the successful completion of "${goalTitle}" on GoalForge AI!\n\n• Key Outcome: ${goalOutcome}\n• Status: 100% roadmap completed, unlocking the Titan Goal Conqueror Platinum Medal.\n\nBig thanks to adaptive AI planning and daily execution. Onward to the next mountain! 🏔️✨\n\n#Achievement #Milestone #GoalForge #ProfessionalGrowth #HardGoal`,
    },
  };

  // Sync template text when shareMode changes
  useEffect(() => {
    setCustomText(templates[shareMode].x);
  }, [shareMode, activeGoal, streak]);

  if (!isOpen) return null;

  const currentTemplate = templates[shareMode];
  const shareUrl = "https://goalforge.ai";

  const handleShareX = () => {
    const tweetText = customText.trim() || currentTemplate.x;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareLinkedIn = () => {
    // Copy the rich LinkedIn template to clipboard first for seamless pasting
    const linkedinContent = currentTemplate.linkedin;
    navigator.clipboard.writeText(linkedinContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);

    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      shareUrl
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopyClipboard = () => {
    const textToCopy = customText.trim() || currentTemplate.x;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Share2 className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Broadcast Progress
              </h3>
              <p className="text-xs text-slate-400">
                Share your goal launch, daily execution streak, or hard goal conquest
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Context Mode Selector */}
        <div className="mt-5 space-y-4 relative z-10">
          <div>
            <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Select Announcement Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setShareMode("kickoff")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  shareMode === "kickoff"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/50"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-white/5"
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                Goal Kickoff
              </button>

              <button
                type="button"
                onClick={() => setShareMode("streak")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  shareMode === "streak"
                    ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 border border-amber-300/50"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-white/5"
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                Streak ({streakDays}d)
              </button>

              <button
                type="button"
                onClick={() => setShareMode("victory")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  shareMode === "victory"
                    ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 border border-emerald-300/50"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-white/5"
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                Goal Conquered
              </button>
            </div>
          </div>

          {/* Liquid Glass Social Card Preview */}
          <div className="relative p-4 rounded-2xl bg-gradient-to-br from-slate-800/80 via-slate-900/90 to-slate-950 border border-white/10 backdrop-blur-xl shadow-xl overflow-hidden">
            <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 via-transparent to-transparent" />

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-indigo-900/60 border border-indigo-500/40 flex items-center justify-center font-bold text-xs text-indigo-300">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.[0] || "G"
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    {user?.name || "GoalForge Challenger"}
                    {isPublic ? (
                      <span title="Public Profile">
                        <Globe className="w-3 h-3 text-emerald-400" />
                      </span>
                    ) : (
                      <span title="Private Profile">
                        <Lock className="w-3 h-3 text-amber-400" />
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {user?.preferences?.primaryCategory || "Software & Cloud"}
                  </p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                GoalForge Verified
              </span>
            </div>

            <div className="py-2">
              <p className="text-sm font-bold text-white leading-snug">{goalTitle}</p>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">{goalOutcome}</p>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-white/5 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Flame className="w-3.5 h-3.5" />
                {streakDays} Days Streak
              </span>
              <span className="flex items-center gap-1 text-yellow-300 font-bold">
                <Trophy className="w-3.5 h-3.5" />
                {unlockedMedalsCount} Medals
              </span>
              <span className="text-slate-400 ml-auto">goalforge.ai</span>
            </div>
          </div>

          {/* Editable Post Draft Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Post Text
              </label>
              <span
                className={`text-[11px] font-mono ${
                  customText.length > 280 ? "text-rose-400 font-bold" : "text-slate-400"
                }`}
              >
                {customText.length}/280 chars
              </span>
            </div>
            <textarea
              rows={4}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-700/80 p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed resize-none"
              placeholder="Craft your social message..."
            />
          </div>

          {/* Action Share Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            {/* Share to X */}
            <button
              type="button"
              onClick={handleShareX}
              className="py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-700 hover:border-slate-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>

            {/* Share to LinkedIn */}
            <button
              type="button"
              onClick={handleShareLinkedIn}
              className="py-2.5 px-4 rounded-xl bg-[#0077b5] hover:bg-[#006097] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-[#0077b5]/20"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              Share on LinkedIn
              <ExternalLink className="w-3 h-3 text-white/70" />
            </button>

            {/* Copy Post */}
            <button
              type="button"
              onClick={handleCopyClipboard}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Post
                </>
              )}
            </button>
          </div>

          {isCopied && (
            <p className="text-[11px] text-emerald-400 text-center font-mono mt-2 animate-fadeIn">
              ✅ Formatted post & hashtags copied to your clipboard!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
