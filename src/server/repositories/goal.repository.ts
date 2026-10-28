import { getDb } from "@/db";
import { goals, milestones, tasks, planVersions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export class GoalRepository {
  static async listByUserId(userId: string) {
    const db = getDb();
    if (!db) return [];
    return db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.createdAt));
  }

  static async getById(goalId: string) {
    const db = getDb();
    if (!db) return null;
    const res = await db.select().from(goals).where(eq(goals.id, goalId)).limit(1);
    return res[0] || null;
  }

  static async createWithPlan(
    goalData: typeof goals.$inferInsert,
    milestonesData: Array<Omit<typeof milestones.$inferInsert, "goalId">>,
    tasksData: Array<Omit<typeof tasks.$inferInsert, "goalId" | "milestoneId"> & { milestoneId?: string }>
  ) {
    const db = getDb();
    if (!db) throw new Error("Database not connected");

    // Create goal
    const createdGoals = await db.insert(goals).values(goalData).returning();
    const createdGoal = createdGoals[0];

    // Create initial plan version v1
    const createdVersions = await db
      .insert(planVersions)
      .values({
        goalId: createdGoal.id,
        versionNumber: 1,
        status: "approved",
        summary: `Initial Plan v1 for ${createdGoal.title}`,
        createdBy: "user",
      })
      .returning();
    const planVersion = createdVersions[0];

    // Insert milestones
    const createdMilestones = await Promise.all(
      milestonesData.map((m, idx) =>
        db
          .insert(milestones)
          .values({
            ...m,
            goalId: createdGoal.id,
            planVersionId: planVersion.id,
            order: idx + 1,
          })
          .returning()
          .then((res) => res[0])
      )
    );

    // Map milestone tasks
    const createdTasks = await Promise.all(
      tasksData.map((t, idx) => {
        const targetMilestone = createdMilestones[0];
        return db
          .insert(tasks)
          .values({
            ...t,
            goalId: createdGoal.id,
            milestoneId: targetMilestone?.id || createdMilestones[0].id,
            planVersionId: planVersion.id,
          })
          .returning()
          .then((res) => res[0]);
      })
    );

    return {
      goal: createdGoal,
      planVersion,
      milestones: createdMilestones,
      tasks: createdTasks,
    };
  }

  static async updateStatus(goalId: string, status: "active" | "paused" | "completed" | "archived") {
    const db = getDb();
    if (!db) return null;
    const res = await db
      .update(goals)
      .set({ status, updatedAt: new Date() })
      .where(eq(goals.id, goalId))
      .returning();
    return res[0] || null;
  }
}
