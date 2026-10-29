export type GoalStatus = "active" | "paused" | "completed" | "archived";

export interface Goal {
  id: string;
  title: string;
  outcome: string;
  category: string;
  baseline: string;
  targetMetric: string;
  targetValue: string;
  deadline: string;
  status: GoalStatus;
  feasibilityRisk: "low_risk" | "moderate_risk" | "high_risk";
  activePlanVersion: number;
  createdAt: string;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "in_progress" | "completed";
  completionCriteria: string[];
  order: number;
}

export type TaskPriority = "high" | "normal" | "low";
export type TaskStatus = "todo" | "in_progress" | "completed" | "skipped";

export interface Task {
  id: string;
  goalId: string;
  milestoneId: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  actualMinutes?: number;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  completionCriteria: string;
  notes?: string;
  dependsOnTaskId?: string;
  completedAt?: string;
}

export interface RecoveryProposal {
  id: string;
  goalId: string;
  triggerReason: string;
  recoverySummary: string;
  blockerHypotheses: Array<{ label: string; evidence: string }>;
  proposedChanges: Array<{
    taskId: string;
    taskTitle: string;
    action: "reschedule" | "split" | "deprioritize";
    previousDueDate: string;
    newDueDate: string;
    reason: string;
  }>;
  firstStep: string;
  tradeoffs: string[];
  status: "pending" | "accepted" | "dismissed";
  createdAt: string;
}

export interface CoachMessage {
  id: string;
  sender: "user" | "coach";
  text: string;
  recommendedNextAction?: string;
  reason?: string;
  suggestedFollowup?: string;
  timestamp: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  isActiveToday: boolean;
  isStreakAtRisk: boolean;
  activeDaysThisWeek: string[];
  totalTasksCompleted: number;
  lastActivityDate: string | null;
}

export interface MedalItem {
  key: string;
  title: string;
  description: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  iconType: string;
  category: "hard_goal" | "streak" | "recovery" | "milestone" | "milestone_count";
  isUnlocked: boolean;
  unlockedAt: string | null;
  goalId?: string | null;
  metadata?: any;
}

export interface LeaderboardUserEntry {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  category: string;
  totalGoalsCompleted: number;
  hardGoalsCompleted: number;
  currentStreak: number;
  medalsCount: number;
  recentMedals: Array<{
    key: string;
    title: string;
    tier: string;
  }>;
  forgeScore: number;
  isCurrentUser: boolean;
}
