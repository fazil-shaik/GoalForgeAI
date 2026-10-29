import { getDb } from "@/db";
import { coachMessages } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";

export class CoachRepository {
  static async listByGoalId(goalId: string, limit = 50) {
    const db = getDb();
    if (!db) return [];
    return db
      .select()
      .from(coachMessages)
      .where(eq(coachMessages.goalId, goalId))
      .orderBy(asc(coachMessages.timestamp))
      .limit(limit);
  }

  static async listByUserId(userId: string, limit = 50) {
    const db = getDb();
    if (!db) return [];
    return db
      .select()
      .from(coachMessages)
      .where(eq(coachMessages.userId, userId))
      .orderBy(asc(coachMessages.timestamp))
      .limit(limit);
  }

  static async addMessage(params: {
    userId: string;
    goalId?: string;
    sender: "user" | "coach";
    text: string;
    recommendedNextAction?: string;
    reason?: string;
  }) {
    const db = getDb();
    if (!db) return null;

    const res = await db
      .insert(coachMessages)
      .values({
        userId: params.userId,
        goalId: params.goalId,
        sender: params.sender,
        text: params.text,
        recommendedNextAction: params.recommendedNextAction,
        reason: params.reason,
      })
      .returning();

    return res[0] || null;
  }
}
