"use client";

import React, { useState } from "react";
import {
  Target,
  Sparkles,
  RotateCcw,
  Clock,
  CheckCircle2,
  Brain,
  Calendar,
  AlertTriangle,
  Play,
  Check,
  ChevronRight,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Flame,
  Award
} from "lucide-react";
import confetti from "canvas-confetti";

export function InteractiveProductShowcase() {
  const [activeStage, setActiveStage] = useState<1 | 2 | 3 | 4>(1);
  const [task1Done, setTask1Done] = useState(false);
  const [task2Done, setTask2Done] = useState(false);
  const [recoveryApplied, setRecoveryApplied] = useState(false);
  const [selectedCoachPrompt, setSelectedCoachPrompt] = useState<string>(
    "I only have 20 minutes today. What should I prioritize?"
  );

  const handleTaskCheck = (taskNum: 1 | 2) => {
    if (taskNum === 1) {
      const next = !task1Done;
      setTask1Done(next);
      if (next) triggerConfetti();
    } else {
      const next = !task2Done;
      setTask2Done(next);
      if (next) triggerConfetti();
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 55,
        origin: { y: 0.65 },
      });
    } catch {
      // safe fallback
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl glass-card border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Top Interactive Stage Navigation Bar */}
      <div className="border-b border-white/10 bg-slate-950/60 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-xs font-mono text-slate-400 hidden sm:inline">
              GoalForge AI Interactive Product Tour
            </span>
          </div>

          <div className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Live Interactive Simulator
          </div>
        </div>

        {/* 4 Stage Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => setActiveStage(1)}
            className={`p-2.5 rounded-xl text-left transition-all flex items-center gap-2.5 ${
              activeStage === 1
                ? "bg-indigo-600/30 border border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                : "bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${activeStage === 1 ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"}`}>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold truncate">1. AI Goal Builder</p>
              <p className="text-[10px] text-slate-400 truncate">Synthesize roadmap</p>
            </div>
          </button>

          <button
            onClick={() => setActiveStage(2)}
            className={`p-2.5 rounded-xl text-left transition-all flex items-center gap-2.5 ${
              activeStage === 2
                ? "bg-emerald-600/30 border border-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                : "bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${activeStage === 2 ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold truncate">2. Daily Execution</p>
              <p className="text-[10px] text-slate-400 truncate">45m focus sprints</p>
            </div>
          </button>

          <button
            onClick={() => setActiveStage(3)}
            className={`p-2.5 rounded-xl text-left transition-all flex items-center gap-2.5 ${
              activeStage === 3
                ? "bg-amber-600/30 border border-amber-500 text-white shadow-lg shadow-amber-600/20"
                : "bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${activeStage === 3 ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold truncate">3. Goal Recovery</p>
              <p className="text-[10px] text-amber-400 truncate font-semibold">Core Differentiator</p>
            </div>
          </button>

          <button
            onClick={() => setActiveStage(4)}
            className={`p-2.5 rounded-xl text-left transition-all flex items-center gap-2.5 ${
              activeStage === 4
                ? "bg-teal-600/30 border border-teal-500 text-white shadow-lg shadow-teal-600/20"
                : "bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${activeStage === 4 ? "bg-teal-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
              <Brain className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold truncate">4. AI Goal Coach</p>
              <p className="text-[10px] text-slate-400 truncate">Actionable unblocking</p>
            </div>
          </button>
        </div>
      </div>

      {/* Stage Content Displays */}
      <div className="p-4 sm:p-8 min-h-[360px] flex flex-col justify-center bg-slate-950/40">
        {/* STAGE 1: AI GOAL BUILDER */}
        {activeStage === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-bold">
                  Step 01 • From Ambition to Blueprint
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  Natural Language In, Time-Aware Roadmap Out
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 self-start sm:self-auto">
                Declared: 45 min/day
              </span>
            </div>

            {/* Prompt Simulation */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-indigo-500/30 text-xs space-y-1.5 shadow-inner">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">User Natural Ambition:</span>
              <p className="text-sm font-medium text-slate-100 flex items-center gap-2">
                &quot;I want to pass the AWS Solutions Architect certification in 6 weeks without burning out.&quot;
              </p>
            </div>

            {/* AI Synthesized Milestones */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">Milestone 1</span>
                  <span className="text-[10px] text-slate-400">Due Nov 10</span>
                </div>
                <p className="text-xs font-bold text-white">VPC & Resilient Networking</p>
                <p className="text-[11px] text-slate-400">Transit gateways, private hosted zones & security groups.</p>
                <span className="text-[10px] text-emerald-400 block pt-1 font-mono">✓ Feasibility: Safe</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-indigo-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-indigo-400 font-bold">Milestone 2</span>
                  <span className="text-[10px] text-slate-400">Due Nov 24</span>
                </div>
                <p className="text-xs font-bold text-white">IAM & Multi-Account Governance</p>
                <p className="text-[11px] text-slate-400">Organizations, SCP guardrails & cross-account roles.</p>
                <span className="text-[10px] text-indigo-400 block pt-1 font-mono">45m daily chunks</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 font-bold">Milestone 3</span>
                  <span className="text-[10px] text-slate-400">Due Dec 05</span>
                </div>
                <p className="text-xs font-bold text-white">Timed Full-Length Exam Drills</p>
                <p className="text-[11px] text-slate-400">3 complete 75-question simulation exams with error logs.</p>
                <span className="text-[10px] text-teal-400 block pt-1 font-mono">+18% safety buffer</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-300">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Guaranteed: No plan is activated until you explicitly review and approve.
              </span>
              <button
                onClick={() => setActiveStage(2)}
                className="font-bold text-emerald-400 hover:text-white flex items-center gap-1"
              >
                Next: Daily Execution <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: DAILY TASK EXECUTION */}
        {activeStage === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-bold">
                  Step 02 • Friction-Free Daily Momentum
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  Today&apos;s High-Impact Action Items
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Today: {(task1Done ? 0 : 30) + (task2Done ? 0 : 15)}m remaining of 45m cap</span>
              </div>
            </div>

            {/* Interactive Tasks */}
            <div className="space-y-3">
              <div
                onClick={() => handleTaskCheck(1)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  task1Done
                    ? "bg-emerald-950/30 border-emerald-500/50 text-slate-300"
                    : "bg-slate-900/90 border-slate-800 hover:border-indigo-500/50"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                      task1Done
                        ? "bg-emerald-500 border-emerald-500 text-slate-950 font-bold"
                        : "border-slate-600 hover:border-emerald-400"
                    }`}
                  >
                    {task1Done && <Check className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${task1Done ? "line-through text-slate-500" : "text-white"}`}>
                      Deploy Transit Gateway multi-VPC routing lab
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      30 min • High Priority • Done condition: Ping across 3 private subnets
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300">
                  {task1Done ? "Done! 🎉" : "Click to Complete"}
                </span>
              </div>

              <div
                onClick={() => handleTaskCheck(2)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  task2Done
                    ? "bg-emerald-950/30 border-emerald-500/50 text-slate-300"
                    : "bg-slate-900/90 border-slate-800 hover:border-indigo-500/50"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                      task2Done
                        ? "bg-emerald-500 border-emerald-500 text-slate-950 font-bold"
                        : "border-slate-600 hover:border-emerald-400"
                    }`}
                  >
                    {task2Done && <Check className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${task2Done ? "line-through text-slate-500" : "text-white"}`}>
                      Review Route 53 Split-Horizon DNS Resolver rules
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      15 min • Normal Priority • Done condition: 5 summary bullets written
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300">
                  {task2Done ? "Done! 🎉" : "Click to Complete"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Try clicking the checkboxes above to experience instant celebration feedback!</span>
              <button
                onClick={() => setActiveStage(3)}
                className="font-bold text-amber-400 hover:text-white flex items-center gap-1"
              >
                Next: What if you miss a day? <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: GOAL RECOVERY MODE (THE CORE DIFFERENTIATOR) */}
        {activeStage === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-bold">
                  Step 03 • The Signature Differentiator
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  Goal Recovery Mode: When Life Happens
                </h3>
              </div>
              <button
                onClick={() => setRecoveryApplied(!recoveryApplied)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors self-start sm:self-auto"
              >
                {recoveryApplied ? "Reset Demo" : "Simulate Recovery Plan"}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Detected: 2 Overdue Tasks (60 min backlog due to unexpected work overtime)
              </div>
              <p className="text-slate-300 text-xs">
                Other trackers would break your streak, show red alarms, and make you feel guilty.
                GoalForge AI calmly redistributes the work over the next 4 days so daily effort never exceeds 45 minutes.
              </p>
            </div>

            {recoveryApplied ? (
              <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Adaptive Recovery Diff (Proposed)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Exam deadline unchanged (Dec 05)</span>
                </div>
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-300">
                    <span>Task 1 (IAM Lab): Due Oct 26</span>
                    <span className="text-emerald-400">→ Shifted to Tomorrow 7:00 PM (30m)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-300">
                    <span>Task 2 (SCP Rules): Due Oct 27</span>
                    <span className="text-emerald-400">→ Shifted to Friday 7:00 PM (30m)</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  ✓ All past completed work preserved • Zero broken streak shaming • Schedule is balanced again.
                </p>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <p className="text-sm font-semibold text-slate-200">
                  Click &quot;Simulate Recovery Plan&quot; above to see how GoalForge automatically rebalances your schedule.
                </p>
                <p className="text-xs text-slate-400">
                  Zero guilt. Instant peace of mind.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setActiveStage(4)}
                className="font-bold text-teal-400 hover:text-white flex items-center gap-1 text-xs"
              >
                Next: AI Goal Coach <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 4: AI GOAL COACH */}
        {activeStage === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <span className="text-[11px] font-mono text-teal-400 uppercase tracking-wider font-bold">
                Step 04 • Actionable Guidance
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                AI Coach Grounded Only In Your Real Progress
              </h3>
            </div>

            {/* Quick Prompt Selector */}
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                "I only have 20 minutes today. What should I prioritize?",
                "Break down IAM delegation into easy subtasks.",
                "Am I on track for my target exam date?",
              ].map((p, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedCoachPrompt(p)}
                  className={`px-3 py-1.5 rounded-xl border transition-all ${
                    selectedCoachPrompt === p
                      ? "bg-teal-500/20 border-teal-500 text-teal-300 font-semibold"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Coach Output */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="space-y-2 text-xs leading-relaxed">
                  <p className="font-semibold text-white">Coach Analysis:</p>
                  <p className="text-slate-300">
                    &quot;Your available time today is limited. Rather than trying to tackle the entire 45-minute lab and feeling rushed, do only **Subtask 1: Write the ABAC Policy JSON document** (15 minutes). This keeps momentum without cognitive fatigue.&quot;
                  </p>
                  <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
                    <span className="font-bold block">Recommended Next Action:</span>
                    <span>15-min ABAC Policy draft. Done criteria: 1 JSON file saved.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
