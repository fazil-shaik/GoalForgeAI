"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGoal } from "@/context/GoalContext";
import {
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  HeartHandshake,
  Check,
  X,
  Layers,
  ArrowDownRight,
  TrendingUp,
  Compass
} from "lucide-react";

export function RecoveryModeFeature({
  onReturnToTasks,
}: {
  onReturnToTasks?: () => void;
}) {
  const { user } = useAuth();
  const {
    activeGoal,
    tasks,
    recoveryProposal,
    generateRecoveryPlan,
    acceptRecoveryProposal,
    dismissRecoveryProposal,
  } = useGoal();

  const [selectedReason, setSelectedReason] = useState<string>("Work emergency / overtime crunch");
  const [customReason, setCustomReason] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const todayDate = new Date().toISOString().split("T")[0];

  // Compute overdue tasks for active goal dynamically
  const goalTasks = tasks.filter((t) => t.goalId === activeGoal?.id);
  const overdueTasks = goalTasks.filter((t) => t.status === "todo" && t.dueDate < todayDate);
  const overdueMinutes = overdueTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const reason = customReason.trim() || selectedReason;
    try {
      await generateRecoveryPlan(reason);
    } catch {
      // safe fallback
    } finally {
      setIsGenerating(false);
    }
  };

  const isAccepted = recoveryProposal?.status === "accepted";

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white">Goal Recovery Mode</h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Core Differentiator
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            When plans slip, generic trackers shame you with broken streaks. GoalForge AI diagnoses the obstacle and redistributes work gracefully.
          </p>
        </div>

        {onReturnToTasks && (
          <button
            onClick={onReturnToTasks}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 self-start sm:self-auto"
          >
            ← Return to Daily Tasks
          </button>
        )}
      </div>

      {/* Slippage Diagnosis Panel (PRD F-13: Identify likely cause & ask lightweight clarifying question) */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              {overdueTasks.length}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Detected Schedule Slippage</h3>
              <p className="text-xs text-slate-400">
                {overdueTasks.length > 0
                  ? `${overdueTasks.length} task(s) currently past due (${overdueMinutes} minutes backlog)`
                  : "No overdue tasks currently, but you can plan ahead if you anticipate an obstacle."}
              </p>
            </div>
          </div>

          <div className="text-xs font-mono px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 text-slate-300">
            Current Goal: <span className="text-white font-semibold">{activeGoal?.title}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            What was the primary obstacle? (Zero judgment — helps AI optimize your recovery)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {[
              "Work emergency / overtime crunch",
              "Physical fatigue or feeling unwell",
              "Task was too large or intimidating",
              "Family or unexpected travel commitments",
              "Lost focus / low motivation",
              "Competing high-priority deadlines",
            ].map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => {
                  setSelectedReason(reason);
                  setCustomReason("");
                }}
                className={`p-2.5 text-left rounded-xl border text-xs transition-all ${
                  selectedReason === reason && !customReason
                    ? "bg-amber-500/20 border-amber-500 text-amber-200 font-semibold shadow-sm"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                {reason}
              </button>
            ))}
          </div>

          <div className="mt-3">
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Or write in your own obstacle or context..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                <span>Diagnosing Workload & Generating 7-Day Ramp...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Generate Adaptive Recovery Proposal</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Active Proposal View (PRD Prompt F: Recovery Mode Proposal & User Approval) */}
      {recoveryProposal && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-700 p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs uppercase font-bold font-mono px-2.5 py-0.5 rounded-full ${
                    isAccepted
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {isAccepted ? "✓ Proposal Accepted & Applied" : "Pending User Approval"}
                </span>
                <span className="text-xs text-slate-400">
                  Trigger: {recoveryProposal.triggerReason}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1.5">
                Adaptive 7-Day Recovery Ramp
              </h3>
            </div>

            {!isAccepted && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={dismissRecoveryProposal}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Dismiss Proposal
                </button>
              </div>
            )}
          </div>

          {/* Compassionate Recovery Summary */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> AI Diagnosis & Rationale
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {recoveryProposal.recoverySummary}
            </p>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              {recoveryProposal.blockerHypotheses.map((h, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="font-semibold text-slate-200">{h.label}</p>
                  <p className="text-slate-400 mt-0.5">{h.evidence}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Immediate Restart Step */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Immediate Restart Action (Friction-Free)
              </span>
              <p className="text-sm font-semibold text-white mt-0.5">
                {recoveryProposal.firstStep}
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Completing this single small action today resets your internal resistance and builds momentum without overwhelming you.
              </p>
            </div>
          </div>

          {/* Proposed Changes Diff Table (PRD Acceptance Criteria: Show before/after preview, affected tasks, and trade-offs) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Proposed Schedule Adjustments (Diff)
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                {recoveryProposal.proposedChanges.length} tasks modified
              </span>
            </div>

            <div className="space-y-2">
              {recoveryProposal.proposedChanges.map((change, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-white">{change.taskTitle}</p>
                    <p className="text-[11px] text-slate-400">{change.reason}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 line-through">
                      {change.previousDueDate}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className="px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 font-bold border border-emerald-500/30">
                      {change.newDueDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trade-offs & Protection Checklist */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-300 block mb-2">
              Trade-offs & Schedule Guarantees:
            </span>
            <div className="space-y-1.5 text-xs text-slate-400">
              {recoveryProposal.tradeoffs.map((t, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Approval Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-800">
            <p className="text-xs text-slate-400">
              PRD Policy: Plans are strictly modified only after your confirmation.
            </p>

            {!isAccepted ? (
              <button
                type="button"
                onClick={acceptRecoveryProposal}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
              >
                <Check className="w-4 h-4" />
                Accept Recovery Plan & Balance Schedule
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Active Plan Successfully Realigned!
                </span>
                {onReturnToTasks && (
                  <button
                    onClick={onReturnToTasks}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                  >
                    Go Execute First Restart Step →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
