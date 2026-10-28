"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Goal,
  Milestone,
  Task,
  RecoveryProposal,
  CoachMessage,
  TaskStatus,
} from "@/types/goal";
import {
  INITIAL_GOALS,
  INITIAL_MILESTONES,
  INITIAL_TASKS,
  INITIAL_RECOVERY_PROPOSAL,
} from "@/data/mockData";
import confetti from "canvas-confetti";

interface GoalContextType {
  goals: Goal[];
  activeGoal: Goal | null;
  milestones: Milestone[];
  tasks: Task[];
  recoveryProposal: RecoveryProposal | null;
  coachMessages: CoachMessage[];
  setActiveGoalId: (id: string) => void;
  // Feature 1: Goal Builder & Roadmap Approval
  createGoalWithRoadmap: (
    goal: Omit<Goal, "id" | "activePlanVersion" | "createdAt">,
    milestones: Array<Omit<Milestone, "id" | "goalId">>,
    tasks: Array<Omit<Task, "id" | "goalId">>
  ) => string;
  // Feature 2: Task Management & Daily Execution
  completeTask: (taskId: string, actualMinutes?: number) => void;
  skipTask: (taskId: string, reason?: string) => void;
  rescheduleTask: (taskId: string, newDate: string) => void;
  addTask: (task: Omit<Task, "id" | "goalId">) => void;
  deleteTask: (taskId: string) => void;
  // Feature 3: Recovery Mode
  generateRecoveryPlan: (userReason?: string) => void;
  acceptRecoveryProposal: () => void;
  dismissRecoveryProposal: () => void;
  // Feature 4: Coach & Feasibility
  sendCoachMessage: (text: string) => void;
  resetAllData: () => void;
}

const STORAGE_KEYS = {
  GOALS: "goalforge_goals",
  MILESTONES: "goalforge_milestones",
  TASKS: "goalforge_tasks",
  RECOVERY: "goalforge_recovery",
  COACH: "goalforge_coach",
  ACTIVE_ID: "goalforge_active_goal_id",
};

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export function GoalProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [activeGoalId, setActiveGoalIdState] = useState<string>(INITIAL_GOALS[0].id);
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [recoveryProposal, setRecoveryProposal] = useState<RecoveryProposal | null>(INITIAL_RECOVERY_PROPOSAL);
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>([
    {
      id: "coach_msg_welcome",
      sender: "coach",
      text: "Welcome back! You have 2 overdue tasks from earlier this week. I can help you prioritize today's work or activate Goal Recovery Mode so you don't burn out.",
      recommendedNextAction: "Review IAM Role Delegation lab or trigger 7-day Recovery Plan.",
      reason: "Prioritizing identity foundations prevents downstream confusion in multi-account governance.",
      timestamp: "2026-10-28T08:30:00Z",
    },
  ]);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
      const savedMilestones = localStorage.getItem(STORAGE_KEYS.MILESTONES);
      const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      const savedRecovery = localStorage.getItem(STORAGE_KEYS.RECOVERY);
      const savedCoach = localStorage.getItem(STORAGE_KEYS.COACH);
      const savedActiveId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);

      if (savedGoals) setGoals(JSON.parse(savedGoals));
      if (savedMilestones) setMilestones(JSON.parse(savedMilestones));
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedRecovery) setRecoveryProposal(JSON.parse(savedRecovery));
      if (savedCoach) setCoachMessages(JSON.parse(savedCoach));
      if (savedActiveId) setActiveGoalIdState(savedActiveId);
    } catch {
      // fallback to initial state
    }
  }, []);

  // Save changes to localStorage
  const persist = (
    newGoals: Goal[],
    newMilestones: Milestone[],
    newTasks: Task[],
    newRecovery: RecoveryProposal | null,
    newCoach: CoachMessage[],
    activeId?: string
  ) => {
    setGoals(newGoals);
    setMilestones(newMilestones);
    setTasks(newTasks);
    setRecoveryProposal(newRecovery);
    setCoachMessages(newCoach);
    if (activeId) setActiveGoalIdState(activeId);

    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(newGoals));
      localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(newMilestones));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));
      if (newRecovery) {
        localStorage.setItem(STORAGE_KEYS.RECOVERY, JSON.stringify(newRecovery));
      } else {
        localStorage.removeItem(STORAGE_KEYS.RECOVERY);
      }
      localStorage.setItem(STORAGE_KEYS.COACH, JSON.stringify(newCoach));
      if (activeId) localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, activeId);
    } catch {
      // storage quota or disabled
    }
  };

  const activeGoal = goals.find((g) => g.id === activeGoalId) || goals[0] || null;

  const setActiveGoalId = (id: string) => {
    setActiveGoalIdState(id);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, id);
    } catch {
      // Ignore storage errors
    }
  };

  // Feature 1: Create Goal & Roadmap
  const createGoalWithRoadmap = (
    goalData: Omit<Goal, "id" | "activePlanVersion" | "createdAt">,
    milestonesData: Array<Omit<Milestone, "id" | "goalId">>,
    tasksData: Array<Omit<Task, "id" | "goalId">>
  ) => {
    const goalId = "goal_" + Math.random().toString(36).substring(2, 9);
    const newGoal: Goal = {
      ...goalData,
      id: goalId,
      activePlanVersion: 1,
      createdAt: new Date().toISOString(),
    };

    // Map temporary milestone IDs to new persistent IDs
    const milestoneIdMap = new Map<string, string>();
    const newMilestones: Milestone[] = milestonesData.map((m, idx) => {
      const newMId = `ms_${goalId}_${idx + 1}`;
      milestoneIdMap.set(`m_${idx + 1}`, newMId);
      return {
        ...m,
        id: newMId,
        goalId,
      };
    });

    const newTasks: Task[] = tasksData.map((t, idx) => {
      const mappedMilestoneId =
        milestoneIdMap.get(t.milestoneId) ||
        newMilestones[0]?.id ||
        `ms_${goalId}_1`;
      return {
        ...t,
        id: `task_${goalId}_${idx + 1}`,
        goalId,
        milestoneId: mappedMilestoneId,
      };
    });

    const updatedGoals = [newGoal, ...goals];
    const updatedMilestones = [...milestones, ...newMilestones];
    const updatedTasks = [...tasks, ...newTasks];

    persist(updatedGoals, updatedMilestones, updatedTasks, recoveryProposal, coachMessages, goalId);

    // Trigger celebration
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // canvas-confetti safety
    }

    return goalId;
  };

  // Feature 2: Task Execution
  const completeTask = (taskId: string, actualMinutes?: number) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: "completed" as TaskStatus,
          actualMinutes: actualMinutes ?? t.estimatedMinutes,
          completedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    // Check if parent milestone completed
    const targetTask = tasks.find((t) => t.id === taskId);
    let updatedMilestones = milestones;
    if (targetTask) {
      const milestoneTasks = updated.filter((t) => t.milestoneId === targetTask.milestoneId);
      const allDone = milestoneTasks.length > 0 && milestoneTasks.every((t) => t.status === "completed" || t.status === "skipped");
      if (allDone) {
        updatedMilestones = milestones.map((m) =>
          m.id === targetTask.milestoneId ? { ...m, status: "completed" as const } : m
        );
      }
    }

    // Confetti celebration!
    try {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 },
      });
    } catch {
      // Ignore
    }

    persist(goals, updatedMilestones, updated, recoveryProposal, coachMessages);
  };

  const skipTask = (taskId: string, reason?: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status: "skipped" as TaskStatus,
            notes: reason ? `Skipped: ${reason}` : t.notes,
          }
        : t
    );
    persist(goals, milestones, updated, recoveryProposal, coachMessages);
  };

  const rescheduleTask = (taskId: string, newDate: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            dueDate: newDate,
            status: "todo" as TaskStatus,
          }
        : t
    );
    persist(goals, milestones, updated, recoveryProposal, coachMessages);
  };

  const addTask = (taskData: Omit<Task, "id" | "goalId">) => {
    if (!activeGoal) return;
    const newTask: Task = {
      ...taskData,
      id: "task_" + Math.random().toString(36).substring(2, 9),
      goalId: activeGoal.id,
    };
    persist(goals, milestones, [newTask, ...tasks], recoveryProposal, coachMessages);
  };

  const deleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    persist(goals, milestones, updated, recoveryProposal, coachMessages);
  };

  // Feature 3: Recovery Mode (The Differentiator)
  const generateRecoveryPlan = (userReason?: string) => {
    if (!activeGoal) return;
    const goalTasks = tasks.filter((t) => t.goalId === activeGoal.id);
    const overdue = goalTasks.filter((t) => t.status === "todo" && t.dueDate < "2026-10-28");

    const totalOverdueMinutes = overdue.reduce((sum, t) => sum + t.estimatedMinutes, 0);

    const proposed: RecoveryProposal = {
      id: "rec_" + Math.random().toString(36).substring(2, 9),
      goalId: activeGoal.id,
      triggerReason: userReason || `${overdue.length} overdue tasks (${totalOverdueMinutes} minutes backlog)`,
      recoverySummary: `We analyzed your schedule and current momentum. Rather than asking you to do an exhausting ${totalOverdueMinutes + 45} minutes in a single day, we staged your overdue work smoothly across the next 5 days, keeping your daily load within your 45-minute comfort zone.`,
      blockerHypotheses: [
        {
          label: "Context Switching or Time Squeeze",
          evidence: userReason ? `User reported: "${userReason}"` : "Missed consecutive mid-week scheduled blocks.",
        },
        {
          label: "Workload Density",
          evidence: `Accumulated ${totalOverdueMinutes} minutes of high-priority tasks in a 48-hour window.`,
        },
      ],
      proposedChanges: overdue.map((t, idx) => {
        // Distribute dates over next days (2026-10-28, 2026-10-29, 2026-10-30, etc.)
        const dayOffset = idx + 1;
        const newDate = `2026-10-${(27 + dayOffset).toString().padStart(2, "0")}`;
        return {
          taskId: t.id,
          taskTitle: t.title,
          action: "reschedule",
          previousDueDate: t.dueDate,
          newDueDate: newDate,
          reason: `Shifted to Day +${dayOffset} to protect daily 45-min capacity ceiling.`,
        };
      }),
      firstStep: overdue[0]
        ? `Start with 20 minutes on "${overdue[0].title}" — that alone restarts your momentum!`
        : "Complete today's primary 30-minute task without looking back.",
      tradeoffs: [
        "Slightly condenses the review buffer before the final milestone.",
        "Zero extension of your final target deadline.",
        "Guarantees you never have to work more than 45 minutes on any single evening.",
      ],
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    persist(goals, milestones, tasks, proposed, coachMessages);
  };

  const acceptRecoveryProposal = () => {
    if (!recoveryProposal) return;

    // Apply proposed reschedules transactionally
    const changeMap = new Map(recoveryProposal.proposedChanges.map((c) => [c.taskId, c.newDueDate]));
    const updatedTasks = tasks.map((t) => {
      if (changeMap.has(t.id)) {
        return {
          ...t,
          dueDate: changeMap.get(t.id)!,
          status: "todo" as TaskStatus,
          notes: (t.notes ? t.notes + " | " : "") + "Rescheduled via Recovery Mode",
        };
      }
      return t;
    });

    const acceptedProposal: RecoveryProposal = {
      ...recoveryProposal,
      status: "accepted",
    };

    // Coach announces success
    const newCoachMsg: CoachMessage = {
      id: "coach_" + Math.random().toString(36).substring(2, 9),
      sender: "coach",
      text: "🎉 Recovery Plan successfully applied! Your schedule is balanced again and the guilt is cleared. Let's tackle today's first bite-sized action.",
      recommendedNextAction: acceptedProposal.firstStep,
      reason: "Small manageable actions rebuild self-efficacy faster than catching up in bursts.",
      timestamp: new Date().toISOString(),
    };

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore
    }

    persist(goals, milestones, updatedTasks, acceptedProposal, [newCoachMsg, ...coachMessages]);
  };

  const dismissRecoveryProposal = () => {
    if (!recoveryProposal) return;
    const dismissed: RecoveryProposal = {
      ...recoveryProposal,
      status: "dismissed",
    };
    persist(goals, milestones, tasks, dismissed, coachMessages);
  };

  // Feature 4: Coach Chat
  const sendCoachMessage = (text: string) => {
    const userMsg: CoachMessage = {
      id: "usr_msg_" + Math.random().toString(36).substring(2, 9),
      sender: "user",
      text,
      timestamp: new Date().toISOString(),
    };

    // Generate intelligent contextual response
    const goalTasks = tasks.filter((t) => t.goalId === activeGoal?.id);
    const todayTasks = goalTasks.filter((t) => t.dueDate === "2026-10-28" && t.status === "todo");
    const overdueTasks = goalTasks.filter((t) => t.dueDate < "2026-10-28" && t.status === "todo");

    let coachReply = "";
    let nextAction = "";
    let reason = "";

    const lower = text.toLowerCase();
    if (lower.includes("time") || lower.includes("busy") || lower.includes("overwhelm")) {
      coachReply = `I understand completely. Life gets busy, and sticking to rigid plans is what leads to quitting. Since your time is tight today, let's prune non-essential items.`;
      nextAction = todayTasks[0] ? `Do only 15 minutes of: ${todayTasks[0].title}` : `Complete 1 quick 15-minute review drill.`;
      reason = "Micro-progress maintains neuro-pathway momentum without triggering burnout.";
    } else if (lower.includes("block") || lower.includes("stuck") || lower.includes("hard")) {
      coachReply = `When a task feels too intimidating, it almost always means the scope is too broad. Let's break it down into 3 ultra-clear subtasks of 10 minutes each.`;
      nextAction = "1) Outline key concepts on paper, 2) Skim the reference docs for 10 min, 3) Write 3 summary bullets.";
      reason = "Lowering the cognitive threshold makes starting friction virtually zero.";
    } else if (lower.includes("exam") || lower.includes("pass") || lower.includes("score")) {
      coachReply = `Your baseline is already strong, and you've completed Milestone 1 successfully. The key now is steady retention in IAM and VPC topologies rather than cramming.`;
      nextAction = "Take a 10-question quiz and review only the explanations for wrong answers.";
      reason = "Targeted review of error patterns yields 3x higher retention than passive reading.";
    } else {
      coachReply = `I've reviewed your current roadmap for "${activeGoal?.title}". You have ${todayTasks.length} task(s) on your radar for today and ${overdueTasks.length} pending from earlier. Remember: consistency beats intensity every time.`;
      nextAction = todayTasks[0]?.title || overdueTasks[0]?.title || "Review your weekly milestones";
      reason = "Focusing on today's single highest-priority task moves the needle fastest.";
    }

    const assistantMsg: CoachMessage = {
      id: "coach_msg_" + Math.random().toString(36).substring(2, 9),
      sender: "coach",
      text: coachReply,
      recommendedNextAction: nextAction,
      reason,
      timestamp: new Date().toISOString(),
    };

    persist(goals, milestones, tasks, recoveryProposal, [assistantMsg, userMsg, ...coachMessages]);
  };

  const resetAllData = () => {
    localStorage.clear();
    setGoals(INITIAL_GOALS);
    setMilestones(INITIAL_MILESTONES);
    setTasks(INITIAL_TASKS);
    setRecoveryProposal(INITIAL_RECOVERY_PROPOSAL);
    setActiveGoalIdState(INITIAL_GOALS[0].id);
    setCoachMessages([
      {
        id: "coach_msg_welcome",
        sender: "coach",
        text: "Data restored to baseline demo state.",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <GoalContext.Provider
      value={{
        goals,
        activeGoal,
        milestones,
        tasks,
        recoveryProposal,
        coachMessages,
        setActiveGoalId,
        createGoalWithRoadmap,
        completeTask,
        skipTask,
        rescheduleTask,
        addTask,
        deleteTask,
        generateRecoveryPlan,
        acceptRecoveryProposal,
        dismissRecoveryProposal,
        sendCoachMessage,
        resetAllData,
      }}
    >
      {children}
    </GoalContext.Provider>
  );
}

export function useGoal() {
  const context = useContext(GoalContext);
  if (!context) {
    throw new Error("useGoal must be used within a GoalProvider");
  }
  return context;
}
