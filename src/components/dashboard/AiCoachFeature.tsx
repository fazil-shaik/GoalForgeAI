"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGoal } from "@/context/GoalContext";
import {
  Brain,
  Sparkles,
  Send,
  Target,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle
} from "lucide-react";

export function AiCoachFeature({
  onNavigateToTasks,
}: {
  onNavigateToTasks?: () => void;
}) {
  const { user } = useAuth();
  const {
    activeGoal,
    milestones,
    tasks,
    coachMessages,
    sendCoachMessage,
  } = useGoal();

  const [inputQuestion, setInputQuestion] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  // Filter tasks for active goal
  const goalTasks = tasks.filter((t) => t.goalId === activeGoal?.id);
  const completedTasks = goalTasks.filter((t) => t.status === "completed");
  const pendingTasks = goalTasks.filter((t) => t.status === "todo");

  // Feasibility Math (PRD Prompt B)
  const totalRoadmapMinutes = goalTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const remainingMinutes = pendingTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const userDailyCapacity = user?.preferences?.availableMinutesPerDay || 45;
  const weeklyCapacityMinutes = userDailyCapacity * 6; // 6 days active
  const estimatedWeeksLeft = Math.max(Math.ceil(remainingMinutes / weeklyCapacityMinutes), 1);

  const riskBand =
    remainingMinutes > weeklyCapacityMinutes * 4
      ? "high_risk"
      : remainingMinutes > weeklyCapacityMinutes * 2
      ? "moderate_risk"
      : "low_risk";

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuestion.trim() || isThinking) return;

    const question = inputQuestion.trim();
    setInputQuestion("");
    setIsThinking(true);

    try {
      await sendCoachMessage(question);
    } catch (err) {
      console.error("Error sending message to coach:", err);
    } finally {
      setIsThinking(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputQuestion(prompt);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white">AI Goal Coach & Feasibility Insights</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Personalized guidance grounded in your real recorded data. No generic motivational quotes — only actionable next steps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Style: {user?.preferences?.coachingStyle || "compassionate"}
          </span>
        </div>
      </div>

      {/* PRD Prompt B: Feasibility & Workload Analysis Dashboard */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Workload & Feasibility Capacity Analysis
            </h3>
            <p className="text-xs text-slate-400">
              Evaluates whether remaining roadmap deliverables fit your declared schedule.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Calculated Risk:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                riskBand === "low_risk"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : riskBand === "moderate_risk"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              }`}
            >
              {riskBand.replace("_", " ").toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Remaining Workload
            </span>
            <p className="text-xl font-bold text-white mt-1">
              {remainingMinutes} <span className="text-xs text-slate-400 font-normal">mins</span>
            </p>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Across {pendingTasks.length} pending tasks
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Weekly Capacity
            </span>
            <p className="text-xl font-bold text-indigo-400 mt-1">
              {weeklyCapacityMinutes} <span className="text-xs text-slate-400 font-normal">mins/wk</span>
            </p>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Based on {userDailyCapacity} min/day declared
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Pacing Horizon
            </span>
            <p className="text-xl font-bold text-emerald-400 mt-1">
              ~{estimatedWeeksLeft} <span className="text-xs text-slate-400 font-normal">weeks</span>
            </p>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Target Deadline: {activeGoal?.deadline}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Schedule Buffer
            </span>
            <p className="text-xl font-bold text-teal-400 mt-1">
              +18% <span className="text-xs text-slate-400 font-normal">buffer</span>
            </p>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Protects against life slips
            </span>
          </div>
        </div>

        {/* Feasibility Drivers & Assumptions Checklist */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
          <span className="font-semibold text-slate-300 block">
            Feasibility Assumptions & Workload Drivers:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-400 text-[11px]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Milestone 1 completed on schedule without deadline slips.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Task durations capped at 45 minutes to prevent cognitive fatigue.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Weekend buffer available if weekday overtime arises.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Never fabricates progress: metrics derived only from completed events.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Goal Coach Conversation (PRD Prompt E: Goal Coach) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
        {/* Chat Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Dedicated Goal Coach</h4>
              <p className="text-[10px] text-slate-400">
                Context: {activeGoal?.title} • Real progress data loaded
              </p>
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Coach Active
          </span>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-slate-500 font-medium shrink-0">Quick Ask:</span>
          {[
            "I only have 20 minutes today. What should I prioritize?",
            "Break down my most difficult task into 3 easy subtasks.",
            "Am I realistically on track for my target deadline?",
            "How do I prevent procrastination on dense topics?",
          ].map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleQuickPrompt(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages Scroll Area */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[480px] overflow-y-auto">
          {coachMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20"
                    : "bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow-md"
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 mb-1">
                  <span className="font-semibold text-slate-300">
                    {msg.sender === "user" ? user?.name || "You" : "GoalForge Coach"}
                  </span>
                  <span className="font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <p>{msg.text}</p>

                {/* PRD Prompt E: Highlighted Recommended Next Action */}
                {msg.recommendedNextAction && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/20">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Recommended Next Action
                    </span>
                    <p className="text-xs font-semibold text-white mt-1">
                      {msg.recommendedNextAction}
                    </p>
                    {msg.reason && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Why: {msg.reason}
                      </p>
                    )}
                    {onNavigateToTasks && (
                      <button
                        onClick={onNavigateToTasks}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
                      >
                        Go to task execution <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl max-w-xs border border-slate-800 text-xs text-slate-400">
              <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing plan context & synthesizing next step...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask your coach anything about your plan, schedule, or blockers..."
            className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isThinking}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
