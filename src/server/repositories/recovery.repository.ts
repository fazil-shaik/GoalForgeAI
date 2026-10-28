import { getDb } from "@/db";
import { planProposals, tasks, planVersions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export class RecoveryRepository {
  static async createProposal(
    goalId: string,
    reason: string,
    proposedDiff: Array<{ taskId: string; newDueDate: string; reason: string }>
  ) {
    const db = getDb();
    if (!db) return null;

    const res = await db
      .insert(planProposals)
      .values({
        goalId,
        reason,
        proposedDiffJson: proposedDiff,
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

  static async applyProposal(proposalId: string) {
    const db = getDb();
    if (!db) return null;

    const proposal = await this.getProposal(proposalId);
    if (!proposal || proposal.status !== "pending") {
      throw new Error("Proposal not found or already processed");
    }

    const diff = proposal.proposedDiffJson as Array<{ taskId: string; newDueDate: string }>;

    // Transactionally update rescheduled tasks
    await Promise.all(
      diff.map((item) =>
        db
          .update(tasks)
          .set({ dueAt: item.newDueDate, status: "todo", updatedAt: new Date() })
          .where(eq(tasks.id, item.taskId))
      )
    );

    // Mark proposal accepted
    const updated = await db
      .update(planProposals)
      .set({ status: "accepted" })
      .where(eq(planProposals.id, proposalId))
      .returning();

    return updated[0];
  }

  static async rejectProposal(proposalId: string) {
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
