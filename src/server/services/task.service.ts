import { TaskRepository } from "@/server/repositories/task.repository";

export class TaskService {
  static async getTasksForGoal(goalId: string) {
    return TaskRepository.listByGoalId(goalId);
  }

  static async getTodayTasks(goalId: string, todayDate: string) {
    return TaskRepository.getTodayTasks(goalId, todayDate);
  }

  static async completeTask(taskId: string, userId: string, actualMinutes?: number) {
    return TaskRepository.completeTask(taskId, userId, actualMinutes);
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
    completionCriteria?: string
  ) {
    return TaskRepository.createTask({
      goalId,
      milestoneId,
      title,
      estimateMinutes,
      dueAt,
      priority,
      status: "todo",
      completionCriteria,
    });
  }
}
