"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGoal } from "@/context/GoalContext";
import { CoachingStyle } from "@/types/auth";
import { GoalForgeArrowLoader } from "@/components/ui/GoalForgeArrowLoader";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Target,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Calendar,
  Brain,
  ShieldCheck,
  Zap,
  Flame,
  X,
  Code2,
  Rocket,
  HeartPulse,
  Cpu,
  TrendingUp,
  Sliders,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const DOMAIN_OPTIONS = [
  {
    id: "Software Engineering & Cloud",
    title: "Software & Cloud",
    description: "AWS/CKA certs, high-scale architectures, and developer mastery",
    icon: Code2,
    gradient: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400",
    starters: [
      {
        title: "Pass AWS Solutions Architect Professional in 6 Weeks",
        ambition: "Master AWS advanced networking, multi-account governance, and hybrid migrations to score >= 800.",
        baseline: "Hold AWS Cloud Practitioner and 2 years general backend experience.",
        weeks: 6,
      },
      {
        title: "Pass CKA (Certified Kubernetes Administrator)",
        ambition: "Master Kubernetes administration, pod networking, ingress, and cluster troubleshooting.",
        baseline: "Proficient with Docker containers and Linux commands; basic Kubernetes pod knowledge.",
        weeks: 6,
      },
      {
        title: "Build and Ship a High-Scale Distributed Backend in Go",
        ambition: "Architect a resilient microservice with Redis caching, Kafka events, and 99.99% uptime tests.",
        baseline: "Basic Go syntax and SQL database query knowledge.",
        weeks: 5,
      },
    ],
  },
  {
    id: "Startup & Entrepreneurship",
    title: "Startup & SaaS",
    description: "Launch MVPs, acquire early beta users, and validate ideas",
    icon: Rocket,
    gradient: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
    starters: [
      {
        title: "Ship Next.js Micro-SaaS to 50 Beta Users",
        ambition: "Build MVP with authentication, Stripe subscriptions, and acquire 50 active beta testers.",
        baseline: "Validated problem statement with 10 prospective customers; basic React experience.",
        weeks: 6,
      },
      {
        title: "Validate B2B SaaS Idea with 20 Customer Discovery Calls",
        ambition: "Conduct 20 structured Mom Test interviews and secure 5 letters of intent for a new product.",
        baseline: "Have a list of 60 prospective LinkedIn contacts in target industry.",
        weeks: 4,
      },
      {
        title: "Launch Public Product Hunt & X Marketing Growth Funnel",
        ambition: "Prepare complete launch kit, teaser demos, and reach Top 5 Product of the Day.",
        baseline: "Working product build ready for public beta testing.",
        weeks: 3,
      },
    ],
  },
  {
    id: "Health, Habits & Fitness",
    title: "Health & Vitality",
    description: "Endurance running, progressive strength, and daily habit stacking",
    icon: HeartPulse,
    gradient: "from-rose-500/20 to-orange-500/20 border-rose-500/30 text-rose-400",
    starters: [
      {
        title: "Train for a 10k Run in 8 Weeks",
        ambition: "Build cardiovascular endurance safely with progressive interval runs and recovery routines.",
        baseline: "Can jog 2.5km without stopping; no current injuries.",
        weeks: 8,
      },
      {
        title: "30-Day Morning Habit Stacking & Zone 2 Protocol",
        ambition: "Execute daily 30-min morning routine: 20-min mobility/Zone 2 cardio, cold shower, and hydration.",
        baseline: "Inconsistent morning schedule, wake up feeling fatigued.",
        weeks: 4,
      },
      {
        title: "Master Upper/Lower Bodyweight Strength Progression",
        ambition: "Achieve 15 clean dead-hang pull-ups, 30 push-ups, and a 60-second L-sit hold.",
        baseline: "Can perform 5 pull-ups and 15 regular push-ups.",
        weeks: 8,
      },
    ],
  },
  {
    id: "Machine Learning & AI",
    title: "AI & Machine Learning",
    description: "Large language models, autonomous agents, and PyTorch mastery",
    icon: Cpu,
    gradient: "from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-400",
    starters: [
      {
        title: "Fine-Tune Open-Source LLM on Domain Dataset",
        ambition: "Collect high-quality training pairs, use LoRA/QLoRA on Llama 3, and benchmark evaluation metrics.",
        baseline: "Proficient in Python; basic understanding of transformer architecture.",
        weeks: 5,
      },
      {
        title: "Architect Autonomous Multi-Agent AI Workflow",
        ambition: "Build production-grade LangGraph agent network with tool-calling and self-correction loops.",
        baseline: "Familiar with Gemini and OpenAI APIs, built basic prompt chains.",
        weeks: 4,
      },
    ],
  },
  {
    id: "Productivity & Career Mastery",
    title: "Career & Leadership",
    description: "Executive communication, high-leverage skills, and promotions",
    icon: TrendingUp,
    gradient: "from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400",
    starters: [
      {
        title: "Prepare for Staff+ Principal Engineer Interview Loop",
        ambition: "Master 12 distributed system design scenarios, leadership stories, and architectural trade-offs.",
        baseline: "Senior Engineer with 5+ years building production systems.",
        weeks: 6,
      },
      {
        title: "Read & Implement Insights from 6 Foundational Books",
        ambition: "Deep-read 6 high-leverage strategy and psychology books with actionable executive summaries.",
        baseline: "Read 15 minutes occasionally, struggle to retain key concepts.",
        weeks: 6,
      },
    ],
  },
];

const COACHING_STYLES: Array<{
  id: CoachingStyle;
  title: string;
  tagline: string;
  description: string;
  icon: any;
  color: string;
}> = [
  {
    id: "compassionate",
    title: "Compassionate Mentor",
    tagline: "Empathetic, encouraging, guilt-free recovery",
    description: "Focuses on steady momentum. When life happens or you fall behind, gently adjusts buffers without shame.",
    icon: Zap,
    color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  },
  {
    id: "direct",
    title: "Direct Operator",
    tagline: "Laser-focused, no fluff, high accountability",
    description: "Delivers crisp, actionable directives. Keeps daily sprints tight and calls out blockers immediately.",
    icon: Target,
    color: "text-amber-400 border-amber-500/40 bg-amber-500/10",
  },
  {
    id: "analytical",
    title: "Analytical Strategist",
    tagline: "Data-driven, probabilistic, capacity-checked",
    description: "Optimizes workload based on telemetry, calculated velocity, and objective feasibility scores.",
    icon: Brain,
    color: "text-indigo-400 border-indigo-500/40 bg-indigo-500/10",
  },
];

const DAILY_BUDGET_PRESETS = [
  { minutes: 20, label: "20 min", tier: "Light Sprint", desc: "Low friction, streak protector" },
  { minutes: 30, label: "30 min", tier: "Steady", desc: "Balanced daily consistency" },
  { minutes: 45, label: "45 min", tier: "Optimal", desc: "Recommended sweet spot" },
  { minutes: 60, label: "60 min", tier: "Deep Work", desc: "High-velocity momentum" },
  { minutes: 90, label: "90 min", tier: "Hardcore", desc: "Intensive transformation" },
];

const ALL_DAYS = [
  { name: "Mon", full: "Monday" },
  { name: "Tue", full: "Tuesday" },
  { name: "Wed", full: "Wednesday" },
  { name: "Thu", full: "Thursday" },
  { name: "Fri", full: "Friday" },
  { name: "Sat", full: "Saturday" },
  { name: "Sun", full: "Sunday" },
];

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const { user, updateProfile } = useAuth();
  const { createGoalWithRoadmap } = useGoal();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Persona & Domain
  const [selectedDomain, setSelectedDomain] = useState<string>("Software Engineering & Cloud");

  // Step 2: Capacity & Coaching
  const [dailyMinutes, setDailyMinutes] = useState<number>(user?.preferences?.availableMinutesPerDay || 45);
  const [availableDays, setAvailableDays] = useState<string[]>(
    user?.preferences?.availableDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  );
  const [coachingStyle, setCoachingStyle] = useState<CoachingStyle>(
    user?.preferences?.coachingStyle || "compassionate"
  );

  // Step 3: First Goal & AI Synthesis
  const [ambition, setAmbition] = useState<string>("");
  const [baseline, setBaseline] = useState<string>("");
  const [targetWeeks, setTargetWeeks] = useState<number>(6);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesisStage, setSynthesisStage] = useState<string>("");
  const [generatedDraft, setGeneratedDraft] = useState<any | null>(null);
  const [isSavingGoal, setIsSavingGoal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  if (!isOpen) return null;

  const currentDomainData = DOMAIN_OPTIONS.find((d) => d.id === selectedDomain) || DOMAIN_OPTIONS[0];

  const handleSelectStarter = (starter: { title: string; ambition: string; baseline: string; weeks: number }) => {
    setAmbition(starter.ambition);
    setBaseline(starter.baseline);
    setTargetWeeks(starter.weeks);
    setGeneratedDraft(null);
  };

  const toggleDay = (dayFull: string) => {
    setAvailableDays((prev) =>
      prev.includes(dayFull) ? prev.filter((d) => d !== dayFull) : [...prev, dayFull]
    );
  };

  // Trigger Gemini AI Roadmap Synthesis
  const handleSynthesizeRoadmap = async () => {
    if (!ambition.trim()) return;

    setIsSynthesizing(true);
    setErrorMessage("");
    setSynthesisStage("Analyzing ambition & cognitive capacity...");

    const targetDateObj = new Date(Date.now() + targetWeeks * 7 * 24 * 60 * 60 * 1000);
    const targetDateStr = targetDateObj.toISOString().split("T")[0];

    try {
      setTimeout(() => {
        setSynthesisStage("Synthesizing sequential milestone criteria...");
      }, 700);
      setTimeout(() => {
        setSynthesisStage("Calibrating daily sprints with 15% recovery buffer...");
      }, 1500);

      const res = await fetch("/api/ai/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ambition: ambition.trim(),
          category: selectedDomain,
          baseline: baseline.trim() || "Starting from scratch",
          targetDate: targetDateStr,
          dailyMinutes,
          coachingStyle,
          constraints: `Keep sessions under ${dailyMinutes}m on active days: ${availableDays.join(", ")}`,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to synthesize roadmap with AI");
      }

      const data = await res.json();
      if (data.draft) {
        setGeneratedDraft(data.draft);
      } else {
        throw new Error("AI returned empty draft");
      }
    } catch (err: any) {
      console.error("[Onboarding] Synthesis error:", err);
      // Graceful fallback draft if offline
      setGeneratedDraft({
        title: ambition.length > 50 ? `${ambition.slice(0, 47)}...` : ambition,
        outcome: ambition,
        targetMetric: "Target completion score",
        targetValue: "100% verified criteria met",
        feasibilityRisk: "low_risk",
        feasibilitySummary: `Tailored for ${dailyMinutes}m/day pace across ${targetWeeks} weeks with balanced milestones.`,
        assumptions: ["Consistent daily execution", "Weekly review & reflection"],
        milestones: [
          {
            title: "Phase 1: Foundations & Architecture",
            description: "Core setup, initial spikes, and baseline verification",
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            completionCriteria: ["Complete initial environment setup", "Validate proof-of-concept milestone"],
            tasks: [
              {
                title: "Setup foundation environment & verify toolchains",
                description: "Establish working development and learning framework.",
                estimatedMinutes: Math.min(dailyMinutes, 45),
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                priority: "high",
                completionCriteria: "Verified working local lab setup",
              },
              {
                title: "Complete foundational deep-dive sprint",
                description: "Cover introductory core concepts and document key architecture.",
                estimatedMinutes: Math.min(dailyMinutes, 40),
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                priority: "normal",
                completionCriteria: "Summary notes documented with 5 key principles",
              },
            ],
          },
          {
            title: "Phase 2: Core Implementation & Depth",
            description: "Deep practice, scenario execution, and real-world trials",
            dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            completionCriteria: ["Complete core feature set or practice modules", "Score >= 80% on progress checks"],
            tasks: [
              {
                title: "Build comprehensive implementation lab",
                description: "Put theoretical knowledge into actual hands-on test scenarios.",
                estimatedMinutes: dailyMinutes,
                dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                priority: "high",
                completionCriteria: "Functional end-to-end flow verified",
              },
            ],
          },
          {
            title: "Phase 3: Final Mastery & Target Victory",
            description: "Timed simulations, deployment, and final outcome validation",
            dueDate: targetDateStr,
            completionCriteria: ["Achieve targeted primary metric", "Review journey & lock in streaks"],
            tasks: [
              {
                title: "Execute final benchmark simulation & launch",
                description: "Final timed trial or public rollout.",
                estimatedMinutes: dailyMinutes,
                dueDate: targetDateStr,
                priority: "high",
                completionCriteria: "Target outcome attained and documented",
              },
            ],
          },
        ],
      });
    } finally {
      setIsSynthesizing(false);
      setSynthesisStage("");
    }
  };

  // Approve & activate the generated roadmap
  const handleApproveAndFinish = async () => {
    if (!generatedDraft) return;

    setIsSavingGoal(true);
    setErrorMessage("");

    try {
      const targetDateObj = new Date(Date.now() + targetWeeks * 7 * 24 * 60 * 60 * 1000);
      const targetDateStr = targetDateObj.toISOString().split("T")[0];

      // Flatten tasks from generated milestones
      const milestonesToSave = generatedDraft.milestones.map((m: any, idx: number) => ({
        tempId: `ms_onboard_${idx + 1}`,
        title: m.title,
        description: m.description,
        dueDate: m.dueDate,
        completionCriteria: m.completionCriteria || [],
        order: idx + 1,
      }));

      const tasksToSave: any[] = [];
      generatedDraft.milestones.forEach((m: any, mIdx: number) => {
        const msId = `ms_onboard_${mIdx + 1}`;
        (m.tasks || []).forEach((t: any) => {
          tasksToSave.push({
            milestoneId: msId,
            title: t.title,
            description: t.description,
            estimatedMinutes: t.estimatedMinutes || dailyMinutes,
            dueDate: t.dueDate || m.dueDate,
            priority: t.priority || "normal",
            completionCriteria: t.completionCriteria || "Completed action verification",
          });
        });
      });

      // 1. Create goal in database
      const goalId = await createGoalWithRoadmap(
        {
          title: generatedDraft.title,
          outcome: generatedDraft.outcome || ambition,
          category: selectedDomain,
          baseline: baseline || "Starting from scratch",
          targetMetric: generatedDraft.targetMetric || "Target score",
          targetValue: generatedDraft.targetValue || "100% verified",
          deadline: targetDateStr,
          status: "active",
          feasibilityRisk: generatedDraft.feasibilityRisk || "low_risk",
        },
        milestonesToSave,
        tasksToSave
      );

      // 2. Persist user preferences & mark onboarding completed
      await updateProfile({
        preferences: {
          availableMinutesPerDay: dailyMinutes,
          availableDays,
          coachingStyle,
          primaryCategory: selectedDomain,
          onboardingCompleted: true,
        },
      });

      if (typeof window !== "undefined") {
        try {
          if (user?.id) localStorage.setItem(`goalforge_onboarded_${user.id}`, "true");
          localStorage.setItem("goalforge_onboarded_global", "true");
        } catch {
          // localStorage safe fallback
        }
      }

      // 3. Fireworks celebration!
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.55 },
          colors: ["#6366f1", "#10b981", "#38bdf8", "#f59e0b", "#ec4899"],
        });
      } catch {
        // safe confetti
      }

      onComplete?.();
      onClose();
    } catch (err: any) {
      console.error("[Onboarding] Error approving goal:", err);
      setErrorMessage(err?.message || "Failed to launch goal. Please try again.");
    } finally {
      setIsSavingGoal(false);
    }
  };

  // Skip goal creation and complete onboarding with clean slate
  const handleSkipGoalCreation = async () => {
    try {
      await updateProfile({
        preferences: {
          availableMinutesPerDay: dailyMinutes,
          availableDays,
          coachingStyle,
          primaryCategory: selectedDomain,
          onboardingCompleted: true,
        },
      });

      if (typeof window !== "undefined") {
        try {
          if (user?.id) localStorage.setItem(`goalforge_onboarded_${user.id}`, "true");
          localStorage.setItem("goalforge_onboarded_global", "true");
        } catch {
          // safe
        }
      }
    } catch {
      // safe fallback
    }

    onComplete?.();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-white/10 shadow-[0_0_60px_rgba(99,102,241,0.25)] flex flex-col max-h-[92vh] overflow-hidden animate-scaleUp">
        {/* Animated Arrow-to-Target Loader while Synthesizing or Saving */}
        {isSynthesizing && (
          <GoalForgeArrowLoader
            message="Synthesizing Your Goal Roadmap..."
            subMessage="Gemini AI is analyzing domain feasibility, milestones, and daily pacing..."
          />
        )}
        {isSavingGoal && (
          <GoalForgeArrowLoader
            message="Forging & Initializing Goal..."
            subMessage="Locking in your active roadmap and generating daily execution sprints..."
          />
        )}

        {/* Glow ambient background effects */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Header with Stepper Progress */}
        <div className="relative border-b border-slate-800/80 px-6 pt-6 pb-4 bg-slate-950/40">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-md shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold block">
                  GoalForge AI Onboarding
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {step === 1 && "Step 1: Choose Your Focus Arena"}
                  {step === 2 && "Step 2: Calibrate Execution & Pacing"}
                  {step === 3 && "Step 3: Synthesize Your First Goal"}
                </h2>
              </div>
            </div>

            <button
              onClick={handleSkipGoalCreation}
              title="Skip setup"
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">
                Progress: <strong className="text-indigo-300 font-semibold">{step} of 3</strong>
              </span>
              <span className="text-emerald-400">
                {step === 1 && "Identity & Arena"}
                {step === 2 && "Pacing & Coaching"}
                {step === 3 && "Roadmap Activation"}
              </span>
            </div>
            <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="relative overflow-y-auto px-6 py-6 space-y-6 flex-1 min-h-0">
          {/* ================= STEP 1: DOMAIN & PERSONA ================= */}
          {step === 1 && (
            <div className="space-y-5 animate-slideInRight">
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Welcome aboard{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! What are you building towards?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select your primary domain so GoalForge AI can customize milestone templates, daily sprint durations, and behavioral coaching algorithms.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {DOMAIN_OPTIONS.map((domain) => {
                  const Icon = domain.icon;
                  const isSelected = selectedDomain === domain.id;
                  return (
                    <button
                      key={domain.id}
                      type="button"
                      onClick={() => setSelectedDomain(domain.id)}
                      className={`text-left p-4 rounded-2xl border transition-all duration-200 relative group cursor-pointer ${
                        isSelected
                          ? "bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${domain.gradient}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-indigo-500 text-slate-950 flex items-center justify-center shrink-0 animate-scaleUp">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white mt-3">{domain.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {domain.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-xs text-slate-300">
                  You can change your domain or track multiple goals across different categories anytime in your dashboard.
                </p>
              </div>
            </div>
          )}

          {/* ================= STEP 2: CAPACITY & COACHING ================= */}
          {step === 2 && (
            <div className="space-y-6 animate-slideInRight">
              {/* Daily Focus Budget */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" /> Daily Execution Capacity
                    </label>
                    <p className="text-xs text-slate-400 mt-0.5">
                      How much focused time can you sustainably dedicate each day without burnout?
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono text-xs font-bold shrink-0">
                    {dailyMinutes} min / day
                  </span>
                </div>

                {/* Preset Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {DAILY_BUDGET_PRESETS.map((preset) => (
                    <button
                      key={preset.minutes}
                      type="button"
                      onClick={() => setDailyMinutes(preset.minutes)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        dailyMinutes === preset.minutes
                          ? "bg-indigo-600/20 border-indigo-400 text-white shadow-sm shadow-indigo-500/20"
                          : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold">{preset.label}</div>
                      <div className="text-[10px] text-indigo-300 font-medium">{preset.tier}</div>
                      <div className="text-[9px] text-slate-400 truncate mt-0.5">{preset.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Range Slider for custom values */}
                <input
                  type="range"
                  min={15}
                  max={120}
                  step={5}
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>15 min (Micro)</span>
                  <span className="text-indigo-400 font-bold">
                    ≈ {((dailyMinutes * availableDays.length) / 60).toFixed(1)} hours of deep work per week
                  </span>
                  <span>120 min (Intensive)</span>
                </div>
              </div>

              {/* Active Execution Days */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" /> Active Sprint Days
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        setAvailableDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"])
                      }
                      className="text-indigo-400 hover:text-indigo-300 underline font-mono cursor-pointer"
                    >
                      Mon-Fri
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() => setAvailableDays(ALL_DAYS.map((d) => d.full))}
                      className="text-emerald-400 hover:text-emerald-300 underline font-mono cursor-pointer"
                    >
                      Every Day
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {ALL_DAYS.map((d) => {
                    const isSelected = availableDays.includes(d.full);
                    return (
                      <button
                        key={d.full}
                        type="button"
                        onClick={() => toggleDay(d.full)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-500/20 border border-emerald-400 text-emerald-300 shadow-sm shadow-emerald-500/20"
                            : "bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {d.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Coaching Personality */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" /> AI Coach Persona
                </label>
                <p className="text-xs text-slate-400">
                  How would you prefer GoalForge AI to interact with you during daily check-ins and recovery recalibration?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {COACHING_STYLES.map((c) => {
                    const Icon = c.icon;
                    const isSelected = coachingStyle === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCoachingStyle(c.id)}
                        className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? `${c.color} ring-2 ring-indigo-500/30`
                            : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon className="w-4 h-4" />
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <h4 className="text-xs font-bold text-white">{c.title}</h4>
                        <p className="text-[10px] text-slate-300 font-medium mt-0.5">{c.tagline}</p>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                          {c.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: FIRST GOAL & AI SYNTHESIS ================= */}
          {step === 3 && (
            <div className="space-y-5 animate-slideInRight">
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" /> Forge Your First Goal with AI
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter an ambitious target, or select a high-yield starter archetype. Gemini AI will break it down into realistic milestones and daily focus sprints.
                </p>
              </div>

              {/* Starter Chips for Chosen Arena */}
              {currentDomainData.starters && currentDomainData.starters.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold block">
                    Curated starters for {currentDomainData.title}:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {currentDomainData.starters.map((starter, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => handleSelectStarter(starter)}
                        className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                          ambition === starter.ambition
                            ? "bg-indigo-600/20 border-indigo-400 text-white shadow-sm"
                            : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        <span className="font-bold block truncate text-slate-100">{starter.title}</span>
                        <span className="text-[10px] text-indigo-400 font-mono mt-1 block">
                          ⏱ {starter.weeks} weeks • {dailyMinutes}m/d
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ambition text input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Your Ambition / Target Outcome</span>
                  <span className="text-[10px] text-slate-500 font-normal">Be bold & specific</span>
                </label>
                <textarea
                  rows={2}
                  value={ambition}
                  onChange={(e) => {
                    setAmbition(e.target.value);
                    setGeneratedDraft(null);
                  }}
                  placeholder="e.g. Master AWS SAP-C02 certification, or Ship Next.js MVP to 50 active beta testers"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-slate-500 outline-none transition-colors resize-none"
                />
              </div>

              {/* Baseline & Target Weeks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white">Starting Baseline (Optional)</label>
                  <input
                    type="text"
                    value={baseline}
                    onChange={(e) => setBaseline(e.target.value)}
                    placeholder="e.g. Total beginner, or 1 yr basic experience"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 text-xs text-white placeholder-slate-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white">Target Timeline</label>
                  <div className="flex items-center gap-1.5">
                    {[4, 6, 8, 12].map((wks) => (
                      <button
                        key={wks}
                        type="button"
                        onClick={() => {
                          setTargetWeeks(wks);
                          setGeneratedDraft(null);
                        }}
                        className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer ${
                          targetWeeks === wks
                            ? "bg-indigo-600/30 border-indigo-400 text-indigo-300"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {wks}w
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Synthesize Button or Loading State */}
              {!generatedDraft && (
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={!ambition.trim() || isSynthesizing}
                    onClick={handleSynthesizeRoadmap}
                    className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
                      !ambition.trim() || isSynthesizing
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 text-white hover:brightness-110 shadow-indigo-500/25 active:scale-[0.99]"
                    }`}
                  >
                    {isSynthesizing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{synthesisStage || "Synthesizing AI Roadmap..."}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
                        <span>Synthesize AI Roadmap with Gemini</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Generated Roadmap Preview Card */}
              {generatedDraft && (
                <div className="space-y-4 p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/30 shadow-xl shadow-indigo-500/10 animate-fadeIn">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        AI Feasibility Checked • {generatedDraft.feasibilityRisk?.replace("_", " ")}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1.5">{generatedDraft.title}</h4>
                      <p className="text-xs text-slate-300 mt-0.5">{generatedDraft.outcome}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setGeneratedDraft(null)}
                      className="text-[11px] text-slate-400 hover:text-white underline font-mono shrink-0"
                    >
                      Regenerate
                    </button>
                  </div>

                  {/* Feasibility Summary */}
                  {generatedDraft.feasibilitySummary && (
                    <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                      💡 {generatedDraft.feasibilitySummary}
                    </p>
                  )}

                  {/* Milestones list preview */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Synthesized Milestones ({generatedDraft.milestones?.length || 0}):
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {generatedDraft.milestones?.map((m: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-mono flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-semibold text-white truncate max-w-[280px] sm:max-w-md">
                                {m.title}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {m.tasks?.length || 0} bite-sized sprints • Due {m.dueDate}
                              </p>
                            </div>
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Primary Call to Action Button */}
                  <button
                    type="button"
                    disabled={isSavingGoal}
                    onClick={handleApproveAndFinish}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-white hover:brightness-110 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                  >
                    {isSavingGoal ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Activating Your Roadmap...</span>
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4 text-emerald-200" />
                        <span>Approve & Launch My Goal Roadmap</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Navigation Controls */}
        <div className="border-t border-slate-800/80 px-6 py-4 bg-slate-950/60 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSkipGoalCreation}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Skip setup (Explore dashboard)
            </button>
          )}

          <div className="flex items-center gap-2.5">
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev + 1) as any)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSkipGoalCreation}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                I&apos;ll create a goal later
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
