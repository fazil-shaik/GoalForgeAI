import { getDb } from "@/db";
import { tasks, taskEvents } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export class TaskRepository {
  static async listByGoalId(goalId: string) {
    const db = getDb();
    if (!db) return [];
    return db.select().from(tasks).where(eq(tasks.goalId, goalId)).orderBy(tasks.dueAt);
  }

  static async getTodayTasks(goalId: string, todayDate: string) {
    const db = getDb();
    if (!db) return [];
    return db
      .select()
      .from(tasks)
      .where(and(eq(tasks.goalId, goalId), eq(tasks.dueAt, todayDate)));
  }

  static async completeTask(taskId: string, userId: string, actualMinutes?: number) {
    const db = getDb();
    if (!db) return null;

    const res = await db
      .update(tasks)
      .set({
        status: "completed",
        actualMinutes: actualMinutes ?? sql`${tasks.estimateMinutes}`,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    const updatedTask = res[0] || null;

    if (updatedTask) {
      // Append audit event (PRD F-08 / taskEvents)
      await db.insert(taskEvents).values({
        taskId,
        userId,
        eventType: "completed",
        metadataJson: { actualMinutes },
      });
    }

    return updatedTask;
  }

  static async rescheduleTask(taskId: string, userId: string, newDueDate: string) {
    const db = getDb();
    if (!db) return null;

    const res = await db
      .update(tasks)
      .set({
        dueAt: newDueDate,
        status: "todo",
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    const updatedTask = res[0] || null;

    if (updatedTask) {
      await db.insert(taskEvents).values({
        taskId,
        userId,
        eventType: "rescheduled",
        metadataJson: { newDueDate },
      });
    }

    return updatedTask;
  }

  static async skipTask(taskId: string, userId: string, reason?: string) {
    const db = getDb();
    if (!db) return null;

    const res = await db
      .update(tasks)
      .set({
        status: "skipped",
        notes: reason ? `Skipped: ${reason}` : undefined,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    const updatedTask = res[0] || null;

    if (updatedTask) {
      await db.insert(taskEvents).values({
        taskId,
        userId,
        eventType: "skipped",
        metadataJson: { reason },
      });
    }

    return updatedTask;
  }

  static async createTask(taskData: typeof tasks.$inferInsert) {
    const db = getDb();
    if (!db) return null;
    const res = await db.insert(tasks).values(taskData).returning();
    return res[0] || null;
  }
}
