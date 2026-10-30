import { GoalRepository } from "@/server/repositories/goal.repository";

export class GoalService {
  static async getUserGoals(userId: string) {
    return GoalRepository.listByUserId(userId);
  }

  static async getGoalDetails(goalId: string) {
    return GoalRepository.getFullGoalGraph(goalId);
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
      tempId?: string;
      title: string;
      description?: string;
      dueDate: string;
      completionCriteriaJson?: string[];
      order: number;
    }>,
    tasksInput: Array<{
      milestoneTempId?: string;
      milestoneIndex?: number;
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
      milestonesInput,
      tasksInput
    );
  }

  static async pauseGoal(goalId: string) {
    return GoalRepository.updateStatus(goalId, "paused");
  }

  static async resumeGoal(goalId: string) {
    return GoalRepository.updateStatus(goalId, "active");
  }

  static async deleteGoal(goalId: string) {
    return GoalRepository.deleteGoal(goalId);
  }
}
