import { TaskRepository } from "@/server/repositories/task.repository";
import { StreakRepository } from "@/server/repositories/streak.repository";
import { MedalRepository } from "@/server/repositories/medal.repository";

export class TaskService {
  static async getTasksForGoal(goalId: string) {
    return TaskRepository.listByGoalId(goalId);
  }

  static async getTodayTasks(goalId: string, todayDate: string) {
    return TaskRepository.getTodayTasks(goalId, todayDate);
  }

  static async completeTask(taskId: string, userId: string, actualMinutes?: number) {
    const updatedTask = await TaskRepository.completeTask(taskId, userId, actualMinutes);
    if (!updatedTask) return null;

    // Dynamically update user streak in Neon DB
    const streak = await StreakRepository.getStreakForUser(userId);

    // Check streak / task milestone medals
    const newlyUnlockedMedals: any[] = [];
    if (streak.currentStreak >= 7) {
      const ironMedal = await MedalRepository.awardMedal(userId, {
        key: "iron_streak",
        title: "Iron Discipline Medal",
        description: "Maintained an unbroken 7-day daily execution streak without skipping focus sprints.",
        tier: "diamond",
        iconType: "zap",
      });
      if (ironMedal) newlyUnlockedMedals.push(ironMedal);
    }

    if (streak.totalTasksCompleted >= 10) {
      const centurionMedal = await MedalRepository.awardMedal(userId, {
        key: "centurion",
        title: "Centurion Finisher",
        description: "Crushed 10+ actionable daily execution tasks across active roadmaps.",
        tier: "silver",
        iconType: "shield",
      });
      if (centurionMedal) newlyUnlockedMedals.push(centurionMedal);
    }

    return { task: updatedTask, streak, newlyUnlockedMedals };
  }

  static async rescheduleTask(taskId: string, userId: string, newDueDate: string) {
    return TaskRepository.rescheduleTask(taskId, userId, newDueDate);
  }

  static async skipTask(taskId: string, userId: string, reason?: string) {
    return TaskRepository.skipTask(taskId, userId, reason);
  }

  static async createTask(
    goalId: string,
    milestoneId: string,
    title: string,
    estimateMinutes: number,
    dueAt: string,
    priority: "high" | "normal" | "low",
    completionCriteria?: string,
    description?: string
  ) {
    return TaskRepository.createTask({
      goalId,
      milestoneId,
      title,
      description: description || "Added directly from execution hub",
      estimateMinutes,
      dueAt,
      priority,
      status: "todo",
      completionCriteria,
    });
  }

  static async deleteTask(taskId: string) {
    return TaskRepository.deleteTask(taskId);
  }
}
