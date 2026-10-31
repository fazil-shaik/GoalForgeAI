import { RecoveryRepository } from "@/server/repositories/recovery.repository";
import { GoalRepository } from "@/server/repositories/goal.repository";
import { TaskRepository } from "@/server/repositories/task.repository";
import { CoachRepository } from "@/server/repositories/coach.repository";
import { GeminiService } from "./gemini.service";

export class RecoveryService {
  static async diagnoseAndPropose(
    goalId: string,
    userId: string,
    userReason: string,
    todayDate: string
  ) {
    const goal = await GoalRepository.getById(goalId);
    if (!goal) throw new Error("Goal not found");

    const allTasks = await TaskRepository.listByGoalId(goalId);
    const overdueTasks = allTasks.filter(
      (t) => t.status === "todo" && t.dueAt < todayDate
    );

    const upcomingTasks = allTasks.filter(
      (t) => t.status === "todo" && t.dueAt >= todayDate
    );

    // If no strictly overdue tasks exist, use upcoming tasks or first tasks to demonstrate proactive recovery
    const tasksToRebalance =
      overdueTasks.length > 0 ? overdueTasks : upcomingTasks.slice(0, 3);

    // Call real Gemini AI model to diagnose obstacle & generate structured recovery plan
    const geminiProposal = await GeminiService.generateRecoveryPlan({
      goalTitle: goal.title,
      userReason: userReason || "Workload crunch and unexpected scheduling constraints",
      dailyCapacity: 45,
      todayDate,
      overdueTasks: tasksToRebalance.map((t) => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueAt,
        estimatedMinutes: t.estimateMinutes,
        priority: t.priority,
      })),
      upcomingTasks: upcomingTasks.map((t) => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueAt,
        estimatedMinutes: t.estimateMinutes,
      })),
    });

    // Save proposal to Neon DB
    const savedProposal = await RecoveryRepository.createProposal(
      goalId,
      geminiProposal.triggerReason || userReason,
      geminiProposal
    );

    return savedProposal;
  }

  static async approveRecoveryProposal(proposalId: string, userId?: string) {
    const proposal = await RecoveryRepository.getProposal(proposalId);
    if (!proposal) throw new Error("Proposal not found");

    const updated = await RecoveryRepository.applyProposal(proposalId, userId);

    // Add celebration coach message to DB
    if (userId) {
      await CoachRepository.addMessage({
        userId,
        goalId: proposal.goalId,
        sender: "coach",
        text: "🎉 Recovery Plan successfully applied to your schedule! Your backlog has been re-staged smoothly so you don't burn out. Take a deep breath you're completely back on track.",
        recommendedNextAction:
          (proposal.proposedDiffJson as any)?.firstStep ||
          "Complete today's primary bite-sized focus block.",
        reason: "Small consistent actions rebuild self-efficacy faster than catching up in bursts.",
      });
    }

    return updated;
  }

  static async dismissRecoveryProposal(proposalId: string) {
    return RecoveryRepository.dismissProposal(proposalId);
  }
}
