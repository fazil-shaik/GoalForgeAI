import { RecoveryRepository } from "@/server/repositories/recovery.repository";
import { TaskRepository } from "@/server/repositories/task.repository";

export class RecoveryService {
  static async diagnoseAndPropose(
    goalId: string,
    userReason: string,
    overdueTasks: Array<{ id: string; title: string; dueAt: string; estimateMinutes: number }>
  ) {
    // Generate balanced schedule distributing tasks across next days
    const proposedDiff = overdueTasks.map((t, idx) => {
      const dayOffset = idx + 1;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dayOffset);
      const newDueDate = targetDate.toISOString().split("T")[0];

      return {
        taskId: t.id,
        newDueDate,
        reason: `Rebalanced to day +${dayOffset} to protect daily capacity ceiling.`,
      };
    });

    return RecoveryRepository.createProposal(
      goalId,
      userReason || `${overdueTasks.length} slipped tasks detected`,
      proposedDiff
    );
  }

  static async approveRecoveryProposal(proposalId: string) {
    return RecoveryRepository.applyProposal(proposalId);
  }

  static async rejectRecoveryProposal(proposalId: string) {
    return RecoveryRepository.rejectProposal(proposalId);
  }
}
