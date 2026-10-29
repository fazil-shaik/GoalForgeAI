import { getDb } from "@/db";
import { planProposals, tasks, taskEvents } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export class RecoveryRepository {
  static async createProposal(
    goalId: string,
    reason: string,
    fullProposal: {
      triggerReason: string;
      recoverySummary: string;
      blockerHypotheses: Array<{ label: string; evidence: string }>;
      firstStep: string;
      proposedChanges: Array<{
        taskId: string;
        taskTitle: string;
        action: "reschedule" | "split" | "deprioritize";
        previousDueDate: string;
        newDueDate: string;
        reason: string;
      }>;
      tradeoffs: string[];
    }
  ) {
    const db = getDb();
    if (!db) return null;

    const res = await db
      .insert(planProposals)
      .values({
        goalId,
        reason,
        proposedDiffJson: fullProposal,
        status: "pending",
      })
      .returning();

    return res[0] || null;
  }

  static async getProposal(proposalId: string) {
    const db = getDb();
    if (!db) return null;
    const res = await db
      .select()
      .from(planProposals)
      .where(eq(planProposals.id, proposalId))
      .limit(1);
    return res[0] || null;
  }

  static async getLatestByGoalId(goalId: string) {
    const db = getDb();
    if (!db) return null;
    const res = await db
      .select()
      .from(planProposals)
      .where(eq(planProposals.goalId, goalId))
      .orderBy(desc(planProposals.createdAt))
      .limit(1);
    return res[0] || null;
  }

  static async applyProposal(proposalId: string, userId?: string) {
    const db = getDb();
    if (!db) return null;

    const proposal = await this.getProposal(proposalId);
    if (!proposal || proposal.status !== "pending") {
      throw new Error("Proposal not found or already processed");
    }

    const payload = proposal.proposedDiffJson as any;
    const proposedChanges = Array.isArray(payload?.proposedChanges)
      ? payload.proposedChanges
      : Array.isArray(payload)
      ? payload
      : [];

    // Transactionally update rescheduled tasks
    for (const change of proposedChanges) {
      if (change.taskId && change.newDueDate) {
        await db
          .update(tasks)
          .set({
            dueAt: change.newDueDate,
            status: "todo",
            updatedAt: new Date(),
          })
          .where(eq(tasks.id, change.taskId));

        if (userId) {
          await db.insert(taskEvents).values({
            taskId: change.taskId,
            userId,
            eventType: "rescheduled",
            metadataJson: {
              newDueDate: change.newDueDate,
              reason: "Applied via Goal Recovery Mode",
            },
          });
        }
      }
    }

    // Mark proposal accepted
    const updated = await db
      .update(planProposals)
      .set({ status: "accepted" })
      .where(eq(planProposals.id, proposalId))
      .returning();

    return updated[0];
  }

  static async dismissProposal(proposalId: string) {
    const db = getDb();
    if (!db) return null;
    const res = await db
      .update(planProposals)
      .set({ status: "rejected" })
      .where(eq(planProposals.id, proposalId))
      .returning();
    return res[0] || null;
  }
}
