import { GoalRepository } from "@/server/repositories/goal.repository";
import { goals, milestones, tasks } from "@/db/schema";

export class GoalService {
  static async getUserGoals(userId: string) {
    return GoalRepository.listByUserId(userId);
  }

  static async getGoalDetails(goalId: string) {
    return GoalRepository.getById(goalId);
  }

  static async createGoalWithRoadmap(
    userId: string,
    goalInput: {
      title: string;
      outcome: string;
      category: string;
      baseline?: string;
      targetMetric?: string;
      targetValue?: string;
      targetDate: string;
      feasibilityRisk: "low_risk" | "moderate_risk" | "high_risk";
    },
    milestonesInput: Array<{
      title: string;
      description?: string;
      dueDate: string;
      completionCriteriaJson?: string[];
      order: number;
    }>,
    tasksInput: Array<{
      title: string;
      description?: string;
      estimateMinutes: number;
      dueAt: string;
      priority: "high" | "normal" | "low";
      completionCriteria?: string;
    }>
  ) {
    return GoalRepository.createWithPlan(
      {
        ...goalInput,
        userId,
      },
      milestonesInput.map((m) => ({ ...m, status: "pending" as const })),
      tasksInput.map((t) => ({ ...t, status: "todo" as const }))
    );
  }

  static async pauseGoal(goalId: string) {
    return GoalRepository.updateStatus(goalId, "paused");
  }

  static async resumeGoal(goalId: string) {
    return GoalRepository.updateStatus(goalId, "active");
  }
}
