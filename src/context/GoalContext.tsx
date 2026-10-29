"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  Goal,
  Milestone,
  Task,
  RecoveryProposal,
  CoachMessage,
  TaskStatus,
  StreakData,
  MedalItem,
} from "@/types/goal";
import confetti from "canvas-confetti";

interface GoalContextType {
  goals: Goal[];
  activeGoals: Goal[];
  completedGoals: Goal[];
  activeGoal: Goal | null;
  milestones: Milestone[];
  tasks: Task[];
  recoveryProposal: RecoveryProposal | null;
  coachMessages: CoachMessage[];
  isLoading: boolean;
  // Streak & Medals Engine
  streak: StreakData | null;
  medals: MedalItem[];
  unlockedMedalsCount: number;
  hardGoalsCompletedCount: number;
  unlockedCelebrationModal: MedalItem | null;
  setUnlockedCelebrationModal: (m: MedalItem | null) => void;
  completeGoal: (goalId: string) => Promise<{ success: boolean; isHardGoal: boolean; newlyUnlockedMedals: any[] }>;
  refreshStreak: () => Promise<void>;
  refreshMedals: () => Promise<void>;
  setActiveGoalId: (id: string) => void;
  refreshData: () => Promise<void>;
  // Feature 1: Goal Builder & Roadmap Approval
  createGoalWithRoadmap: (
    goal: Omit<Goal, "id" | "activePlanVersion" | "createdAt">,
    milestones: Array<Omit<Milestone, "id" | "goalId">>,
    tasks: Array<Omit<Task, "id" | "goalId">>
  ) => Promise<string | null>;
  // Feature 2: Task Management & Daily Execution
  completeTask: (taskId: string, actualMinutes?: number) => Promise<void>;
  skipTask: (taskId: string, reason?: string) => Promise<void>;
  rescheduleTask: (taskId: string, newDate: string) => Promise<void>;
  addTask: (task: Omit<Task, "id" | "goalId">) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  // Feature 3: Recovery Mode (The Differentiator)
  generateRecoveryPlan: (userReason?: string) => Promise<void>;
  acceptRecoveryProposal: () => Promise<void>;
  dismissRecoveryProposal: () => Promise<void>;
  // Feature 4: Coach & Feasibility
  sendCoachMessage: (text: string) => Promise<void>;
  resetAllData: () => Promise<void>;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export function GoalProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeGoalId, setActiveGoalIdState] = useState<string>("");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recoveryProposal, setRecoveryProposal] = useState<RecoveryProposal | null>(null);
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Gamification: Streak & Medals State
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [medals, setMedals] = useState<MedalItem[]>([]);
  const [unlockedMedalsCount, setUnlockedMedalsCount] = useState<number>(0);
  const [hardGoalsCompletedCount, setHardGoalsCompletedCount] = useState<number>(0);
  const [unlockedCelebrationModal, setUnlockedCelebrationModal] = useState<MedalItem | null>(null);

  const refreshStreak = useCallback(async () => {
    try {
      const res = await fetch("/api/user/streak");
      if (res.ok) {
        const data = await res.json();
        if (data.streak) setStreak(data.streak);
      }
    } catch {
      // safe fallback
    }
  }, []);

  const refreshMedals = useCallback(async () => {
    try {
      const res = await fetch("/api/user/medals");
      if (res.ok) {
        const data = await res.json();
        if (data.medals) {
          setMedals(data.medals);
          setUnlockedMedalsCount(data.unlockedCount || 0);
          setHardGoalsCompletedCount(data.hardGoalsCount || 0);
        }
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Helper to fetch full graph for a goal
  const fetchGoalDetails = useCallback(async (goalId: string) => {
    try {
      const res = await fetch(`/api/goals/${goalId}`);
      if (!res.ok) return;
      const data = await res.json();

      if (data.goal) {
        setMilestones(data.milestones || []);
        setTasks(data.tasks || []);
        setRecoveryProposal(data.activeProposal || null);
        if (data.coachMessages && data.coachMessages.length > 0) {
          setCoachMessages(data.coachMessages);
        } else {
          // Default initial coach greeting if DB is empty
          setCoachMessages([
            {
              id: "welcome_coach",
              sender: "coach",
              text: `Welcome to your roadmap for "${data.goal.title}". I'm your dedicated AI coach. Focus on today's single priority, and let me know if you need tasks broken down or schedule adjustments.`,
              recommendedNextAction: "Review today's planned focus sprint.",
              reason: "Starting with a single small win establishes neuro-pathway momentum.",
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Fetch all goals on initial mount
  const loadGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/goals");
      if (!res.ok) {
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      const userGoals: Goal[] = data.goals || [];
      setGoals(userGoals);

      const userActiveGoals = userGoals.filter((g) => g.status === "active");
      if (userActiveGoals.length > 0) {
        const initialGoalId =
          activeGoalId && userActiveGoals.some((g) => g.id === activeGoalId)
            ? activeGoalId
            : userActiveGoals[0].id;

        setActiveGoalIdState(initialGoalId);
        await fetchGoalDetails(initialGoalId);
      } else {
        // No active goals (all goals are completed or no goals yet)
        setActiveGoalIdState("");
        setMilestones([]);
        setTasks([]);
        setRecoveryProposal(null);
      }
    } catch {
      // safe fallback
    } finally {
      setIsLoading(false);
    }
  }, [activeGoalId, fetchGoalDetails]);

  useEffect(() => {
    loadGoals();
    refreshStreak();
    refreshMedals();
  }, [loadGoals, refreshStreak, refreshMedals]);

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");
  const activeGoal = activeGoals.find((g) => g.id === activeGoalId) || activeGoals[0] || null;

  const setActiveGoalId = (id: string) => {
    setActiveGoalIdState(id);
    fetchGoalDetails(id);
  };

  const refreshData = async () => {
    if (activeGoalId) {
      await fetchGoalDetails(activeGoalId);
    } else {
      await loadGoals();
    }
    await refreshStreak();
    await refreshMedals();
  };

  // Feature 1: Create Goal with Roadmap in Neon DB
  const createGoalWithRoadmap = async (
    goalData: Omit<Goal, "id" | "activePlanVersion" | "createdAt">,
    milestonesData: Array<Omit<Milestone, "id" | "goalId">>,
    tasksData: Array<Omit<Task, "id" | "goalId">>
  ): Promise<string | null> => {
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: goalData,
          milestones: milestonesData,
          tasks: tasksData,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save goal");
      }

      const result = await res.json();
      const newGoalId = result.goal?.id;

      // Celebrate roadmap activation!
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe canvas-confetti
      }

      // Reload goals and switch to the newly created goal
      const goalsRes = await fetch("/api/goals");
      if (goalsRes.ok) {
        const gData = await goalsRes.json();
        setGoals(gData.goals || []);
      }

      if (newGoalId) {
        setActiveGoalIdState(newGoalId);
        await fetchGoalDetails(newGoalId);
      }

      return newGoalId;
    } catch {
      return null;
    }
  };

  // Feature 2: Task Execution
  const completeTask = async (taskId: string, actualMinutes?: number) => {
    // 1. Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "completed" as TaskStatus,
              actualMinutes: actualMinutes ?? t.estimatedMinutes,
              completedAt: new Date().toISOString(),
            }
          : t
      )
    );

    try {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 },
      });
    } catch {
      // safe
    }

    // 2. Persist to Neon DB
    try {
      const res = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actualMinutes }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.streak) setStreak(data.streak);
        if (data.newlyUnlockedMedals && data.newlyUnlockedMedals.length > 0) {
          const firstNew = data.newlyUnlockedMedals[0];
          setUnlockedCelebrationModal({
            key: firstNew.medalKey,
            title: firstNew.title,
            description: firstNew.description,
            tier: firstNew.tier,
            iconType: firstNew.iconType || "trophy",
            category: "streak",
            isUnlocked: true,
            unlockedAt: firstNew.unlockedAt || new Date().toISOString(),
          });
          refreshMedals();
        }
      }
    } catch {
      // safe fallback
    }
  };

  // Complete Goal & Evaluate Hard Goal Medals
  const completeGoal = async (goalId: string) => {
    try {
      const res = await fetch(`/api/goals/${goalId}/complete`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to complete goal");
      const data = await res.json();

      // Confetti celebration
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // safe
      }

      // Optimistically update goals so the completed goal is marked completed
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, status: "completed" } : g))
      );

      // Find next remaining active goal
      const remainingActive = goals.filter((g) => g.id !== goalId && g.status === "active");
      const nextActiveId = remainingActive.length > 0 ? remainingActive[0].id : "";
      setActiveGoalIdState(nextActiveId);
      if (nextActiveId) {
        await fetchGoalDetails(nextActiveId);
      } else {
        setMilestones([]);
        setTasks([]);
        setRecoveryProposal(null);
      }

      await loadGoals();
      await refreshMedals();
      await refreshStreak();

      const medalToShow =
        data.newlyUnlockedMedals && data.newlyUnlockedMedals.length > 0
          ? data.newlyUnlockedMedals[0]
          : {
              medalKey: "titan_conqueror",
              title: "Titan Goal Conqueror",
              description: "Hard Goal Successfully Mastered! Inscribed in the GoalForge Hall of Champions.",
              tier: "platinum",
              iconType: "trophy",
              metadataJson: {},
            };

      setUnlockedCelebrationModal({
        key: medalToShow.medalKey,
        title: medalToShow.title,
        description: medalToShow.description,
        tier: medalToShow.tier,
        iconType: medalToShow.iconType || "trophy",
        category: "hard_goal",
        isUnlocked: true,
        unlockedAt: medalToShow.unlockedAt || new Date().toISOString(),
        metadata: medalToShow.metadataJson,
      });

      return {
        success: true,
        isHardGoal: data.isHardGoal || false,
        newlyUnlockedMedals: data.newlyUnlockedMedals || [],
      };
    } catch {
      return { success: false, isHardGoal: false, newlyUnlockedMedals: [] };
    }
  };

  const skipTask = async (taskId: string, reason?: string) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "skipped" as TaskStatus,
              notes: reason ? `Skipped: ${reason}` : t.notes,
            }
          : t
      )
    );

    // Persist to Neon DB
    try {
      await fetch(`/api/tasks/${taskId}/skip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
    } catch {
      // safe fallback
    }
  };

  const rescheduleTask = async (taskId: string, newDate: string) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              dueDate: newDate,
              status: "todo" as TaskStatus,
            }
          : t
      )
    );

    // Persist to database
    try {
      await fetch(`/api/tasks/${taskId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueDate: newDate }),
      });
    } catch {
      // safe fallback
    }
  };

  const addTask = async (taskData: Omit<Task, "id" | "goalId">) => {
    if (!activeGoal) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...taskData,
          goalId: activeGoal.id,
          milestoneId: taskData.milestoneId || milestones[0]?.id,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.task) {
          setTasks((prev) => [result.task, ...prev]);
        }
      }
    } catch {
      // safe fallback
    }
  };

  const deleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
    } catch {
      // safe fallback
    }
  };

  // Feature 3: Recovery Mode (The Differentiator - Powered by Gemini AI)
  const generateRecoveryPlan = async (userReason?: string) => {
    if (!activeGoal) return;

    try {
      const todayDate = new Date().toISOString().split("T")[0];
      const res = await fetch("/api/ai/recovery-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId: activeGoal.id,
          userReason: userReason || "Schedule crunch & unexpected friction",
          todayDate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.proposal) {
          setRecoveryProposal(data.proposal);
        }
      }
    } catch {
      // safe fallback
    }
  };

  const acceptRecoveryProposal = async () => {
    if (!recoveryProposal) return;

    // 1. Optimistic UI update: apply new dates to tasks
    const changeMap = new Map(
      recoveryProposal.proposedChanges.map((c) => [c.taskId, c.newDueDate])
    );

    setTasks((prev) =>
      prev.map((t) => {
        if (changeMap.has(t.id)) {
          return {
            ...t,
            dueDate: changeMap.get(t.id)!,
            status: "todo" as TaskStatus,
            notes: (t.notes ? t.notes + " | " : "") + "Rescheduled via Recovery Mode",
          };
        }
        return t;
      })
    );

    setRecoveryProposal({
      ...recoveryProposal,
      status: "accepted",
    });

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // safe
    }

    // 2. Persist to database
    try {
      await fetch(`/api/proposals/${recoveryProposal.id}/approve`, {
        method: "POST",
      });

      // Refresh coach messages to show celebration message
      if (activeGoal) {
        await fetchGoalDetails(activeGoal.id);
      }
    } catch {
      // safe fallback
    }
  };

  const dismissRecoveryProposal = async () => {
    if (!recoveryProposal) return;

    const proposalId = recoveryProposal.id;
    setRecoveryProposal(null);

    try {
      await fetch(`/api/proposals/${proposalId}/dismiss`, {
        method: "POST",
      });
    } catch {
      // safe fallback
    }
  };

  // Feature 4: Coach Chat (Powered by Gemini AI)
  const sendCoachMessage = async (text: string) => {
    if (!text.trim()) return;

    // Optimistically add user message
    const tempUserMsg: CoachMessage = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setCoachMessages((prev) => [tempUserMsg, ...prev]);

    try {
      const todayDate = new Date().toISOString().split("T")[0];
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId: activeGoal?.id,
          message: text.trim(),
          todayDate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.coachMessage) {
          setCoachMessages((prev) => [data.coachMessage, ...prev]);
        }
      }
    } catch {
      // safe fallback
    }
  };

  const resetAllData = async () => {
    if (activeGoal) {
      await fetchGoalDetails(activeGoal.id);
    }
  };

  return (
    <GoalContext.Provider
      value={{
        goals,
        activeGoals,
        completedGoals,
        activeGoal,
        milestones,
        tasks,
        recoveryProposal,
        coachMessages,
        isLoading,
        streak,
        medals,
        unlockedMedalsCount,
        hardGoalsCompletedCount,
        unlockedCelebrationModal,
        setUnlockedCelebrationModal,
        completeGoal,
        refreshStreak,
        refreshMedals,
        setActiveGoalId,
        refreshData,
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
